import { getNextNode, getNextGeminiKey } from './keyVault';
import { GoogleGenAI } from "@google/genai";

// System Prompt for Enhancement
const ENHANCER_SYSTEM_PROMPT = `You are the SHΞN™ Santa Edition AI. Convert user prompts into highly detailed, Christmas-themed (if applicable), photorealistic prompts for Flux/Stable Diffusion. If the input is not English, translate it. Output ONLY the prompt.`;

interface GenerationSettings {
    model: string;
    width: number;
    height: number;
    seed: number;
    enhance: boolean;
}

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
    try {
        const response = await fetch('https://text.pollinations.ai/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai',
                messages: [
                    { role: 'system', content: ENHANCER_SYSTEM_PROMPT },
                    { role: 'user', content: `Enhance: "${originalPrompt}"` }
                ]
            })
        });
        
        if (!response.ok) throw new Error("Enhancement failed");
        
        const text = await response.text(); 
        try {
            const json = JSON.parse(text);
            return json.choices?.[0]?.message?.content || text;
        } catch {
            return text;
        }

    } catch (e) {
        console.warn("SHΞN™ Enhancer Warning: Fallback to raw prompt.", e);
        return originalPrompt;
    }
};

const generateWithGemini = async (prompt: string, settings: GenerationSettings): Promise<string> => {
    const maxRetries = 3;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            // Get a fresh key from the vault for each attempt
            const apiKey = getNextGeminiKey();
            const ai = new GoogleGenAI({ apiKey: apiKey });
            
            // Map aspect ratio roughly to Gemini's expected formats or allow default (1:1)
            let aspectRatio = "1:1";
            if (settings.width > settings.height) aspectRatio = "16:9";
            else if (settings.height > settings.width) aspectRatio = "9:16";

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { text: prompt }
                    ]
                },
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio,
                    }
                }
            });

            // Extract image from response
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64EncodeString = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        
                        // Convert base64 to Blob URL
                        const byteCharacters = atob(base64EncodeString);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let j = 0; j < byteCharacters.length; j++) {
                            byteNumbers[j] = byteCharacters.charCodeAt(j);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: mimeType });
                        return URL.createObjectURL(blob);
                    }
                }
            }
            throw new Error("No image data found in Gemini response");

        } catch (error) {
            console.warn(`Gemini Attempt ${i + 1} failed. Rotating Key...`, error);
            lastError = error;
            await new Promise(r => setTimeout(r, 500));
        }
    }
    throw lastError || new Error("All SHΞN™ Gemini Keys failed.");
};

export const generateImageURL = async (prompt: string, settings: GenerationSettings): Promise<string> => {
    
    // Logic Branch: If model is 'gemini-flash', try Google SDK first
    if (settings.model === 'gemini-flash') {
        try {
            return await generateWithGemini(prompt, settings);
        } catch (geminiError) {
            console.warn("SHΞN™ EMERGENCY PROTOCOL: Gemini failed. Fallback to SHΞN™ PRO (Flux).", geminiError);
            settings = { ...settings, model: 'flux' };
        }
    }

    // Default Logic: Pollinations Proxy (Flux, etc.)
    const maxRetries = 3;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const baseUrl = getNextNode(); // Rotates proxy node on each attempt
            
            const safePrompt = encodeURIComponent(prompt);
            const model = encodeURIComponent(settings.model);
            
            // Construct URL with anti-caching params
            const url = `${baseUrl}/prompt/${safePrompt}?model=${model}&width=${settings.width}&height=${settings.height}&seed=${settings.seed}&nologo=true&safe=false`;
            
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Node Error: ${res.status}`);
            
            const blob = await res.blob();
            return URL.createObjectURL(blob); 
            
        } catch (error) {
            console.warn(`Proxy Attempt ${i + 1} failed. Rotating proxy...`);
            lastError = error;
            await new Promise(r => setTimeout(r, 500));
        }
    }
    
    throw lastError || new Error("All SHΞN™ Proxies failed.");
};