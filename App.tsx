import React, { useState, useEffect, useRef } from 'react';
import ThreeBackground from './components/ThreeBackground';
import SnowOverlay from './components/SnowOverlay';
import { Mic, Settings, X, ChevronLeft, ChevronRight, Download, Volume2, VolumeX, Snowflake, Gift, Sparkles } from 'lucide-react';
import { enhancePrompt, generateImageURL } from './services/api';
import clsx from 'clsx';

// Styles data
const STYLES = [
    { name: 'Cinematic', id: 'cinema', suffix: ', cinematic shot, imax, christmas atmosphere, magical lighting, highly detailed' },
    { name: 'Realistic', id: 'realistic', suffix: ', hyperrealistic, 8k, winter photography, sharp focus' },
    { name: 'Photography', id: 'photography', suffix: ', hyperrealistic professional ultra intricately detailed photography' },
    { name: 'Fantasy', id: 'fantasy', suffix: ', epic fantasy, vibrant colors, surreal composition, masterpiece' },
    { name: 'Anime', id: 'anime', suffix: ', anime art style, cel shading, vibrant colors, detailed character design, beautiful anime scenery' },
    { name: 'Artistic', id: 'artistic', suffix: ', digital art, concept art, artistic illustration, creative composition' },
    { name: 'Portrait', id: 'portrait', suffix: ', professional portrait photography, studio lighting, shallow depth of field' },
    { name: 'Landscape', id: 'landscape', suffix: ', landscape photography, golden hour lighting, dramatic sky, natural beauty' },
];

function App() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<any[]>([]);
    
    // UI State
    const [showStyles, setShowStyles] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAgeGate, setShowAgeGate] = useState(false);
    const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [loadingText, setLoadingText] = useState('Summoning Magic...');

    // Config State
    const [settings, setSettings] = useState({
        model: 'gemini-flash', // Default set to SH🎄N™ Santa
        width: 1024,
        height: 1024,
        enhance: true,
        seed: 42,
        randomSeed: true,
        soundEnabled: true,
        snowEnabled: true
    });
    
    const [activeStyle, setActiveStyle] = useState<any>(null);
    const recognitionRef = useRef<any>(null);

    // Audio Logic
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'fa-IR'; // Matching source
            
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setPrompt(prev => prev + ' ' + transcript);
                setIsListening(false);
            };
            
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    // Rotating Loading Text
    useEffect(() => {
        if (!isGenerating) return;
        const messages = [
          "Summoning Magic...",
          "Mixing Holiday Colors...",
          "Wrapping Pixels...",
          "Checking Naughty List...",
          "Adding Sparkles...",
          "Asking Reindeers..."
        ];
        let i = 0;
        const interval = setInterval(() => {
          i = (i + 1) % messages.length;
          setLoadingText(messages[i]);
        }, 2000);
        return () => clearInterval(interval);
    }, [isGenerating]);

    const toggleMic = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const playSuccessSound = () => {
        if (settings.soundEnabled) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
            audio.volume = 0.4;
            audio.play().catch(() => {});
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        if (settings.soundEnabled) {
             // Subtle start sound
             const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); // Magic swoosh
             audio.volume = 0.2;
             audio.play().catch(() => {});
        }

        try {
            const currentSeed = settings.randomSeed ? Math.floor(Math.random() * 1000000) : settings.seed;
            let finalPrompt = prompt + (activeStyle ? activeStyle.suffix : '');
            
            // Logic Check: Do NOT enhance if model is Gemini (it's smart enough) or if enhance is disabled
            const shouldEnhance = settings.enhance && settings.model !== 'gemini-flash';

            if (shouldEnhance) {
                finalPrompt = await enhancePrompt(finalPrompt);
            }

            const url = await generateImageURL(finalPrompt, { ...settings, seed: currentSeed });
            
            setGeneratedImages(prev => [{
                url, prompt: finalPrompt, timestamp: Date.now()
            }, ...prev]);

            playSuccessSound();

        } catch (error) {
            console.error(error);
            alert("Connection error. The elves are fixing the cables!");
        } finally {
            setIsGenerating(false);
        }
    };

    const setAspectRatio = (ratio: string) => {
        switch(ratio) {
            case '1:1': setSettings({...settings, width: 1024, height: 1024}); break;
            case '16:9': setSettings({...settings, width: 1280, height: 720}); break;
            case '9:16': setSettings({...settings, width: 720, height: 1280}); break;
        }
    };

    return (
        <div className="relative min-h-screen font-body text-gray-300">
            <SnowOverlay enabled={settings.snowEnabled} />
            <ThreeBackground />
            <div className="vertical-line"></div>

            {/* HEADER CONTAINER */}
            <div className="fixed top-0 left-0 right-0 z-20 flex flex-col items-center pt-4 header-container">
                <header className="arched-header glass glass-border border-t border-x relative header-glow">
                    <div className="font-brand text-xl sm:text-2xl font-bold tracking-wider">
                        <span className="animated-text">🎄 SHICOPIC 🎄</span>
                    </div>
                </header>

                <div className="flex w-[95%] max-w-[400px] relative">
                    <button 
                        onClick={() => setShowStyles(true)}
                        className="w-1/2 h-10 text-sm font-medium text-yellow-400 hover:text-red-400 glass glass-border transition-colors relative flex items-center justify-center" 
                        style={{borderBottomLeftRadius: '50% 20px'}}
                    >
                        <span className="font-sans font-semibold tracking-wide">✨ Style</span>
                    </button>
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="w-1/2 h-10 text-sm font-medium text-yellow-400 hover:text-red-400 glass glass-border transition-colors relative flex items-center justify-center" 
                        style={{borderBottomRightRadius: '50% 20px'}}
                    >
                        <span className="font-sans font-semibold tracking-wide">⚙️ Setup</span>
                    </button>
                    <div className="divider-glow absolute bottom-0 left-0 right-0 h-[2px]"></div>
                </div>

                {/* Spinning Logo - Moved UP to top-[50px] */}
                <div className="absolute top-[50px] left-1/2 -translate-x-1/2" style={{perspective: '1000px', zIndex: 21}}>
                    <div className="rounded-full p-0.5">
                        <img 
                            src="https://raw.githubusercontent.com/Shervinuri/Shervinuri.github.io/refs/heads/main/1712259501956.png" 
                            alt="Logo" 
                            className="w-12 h-12 rounded-full logo-spin" 
                        />
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT - Reduced top padding to 125px for better visibility */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 pb-[200px] pt-[125px] relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Loading State */}
                    {isGenerating && (
                        <div className="image-card relative glass glass-border rounded-lg aspect-square flex flex-col items-center justify-center p-8 text-center transition-all">
                             <div className="relative mb-6">
                                <Gift size={56} className="text-red-500 animate-christmas-shake drop-shadow-[0_0_15px_rgba(220,20,60,0.6)]" />
                                <Sparkles size={24} className="text-yellow-400 absolute -top-4 -right-4 animate-pulse drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
                                <Snowflake size={20} className="text-white absolute -bottom-2 -left-4 animate-bounce delay-100" />
                            </div>
                            <div className="font-brand text-yellow-400 text-sm animate-pulse tracking-widest">
                                {loadingText}
                            </div>
                        </div>
                    )}

                    {/* Images */}
                    {generatedImages.map((img, idx) => (
                        <div key={img.timestamp} className="image-card relative glass glass-border rounded-lg overflow-hidden cursor-pointer group" onClick={() => setSlideshowIndex(idx)}>
                            <img src={img.url} alt="Generated" className="w-full h-full object-cover" />
                            {/* Watermark Strip */}
                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <span className="text-[#FFD700] font-brand text-xs">✨ Exclusive ☬SHΞN™ Made ✨</span>
                            </div>
                             <button 
                                onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = img.url; a.download = 'shen_gen.png'; a.click(); }}
                                className="absolute top-2 right-2 bg-yellow-500/50 text-white p-2 rounded-full hover:bg-yellow-500 transition-colors backdrop-blur-sm border border-yellow-400/50"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {/* FIXED FOOTER */}
            <div className="fixed-footer">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5">
                    <div className="flex flex-col sm:flex-row gap-3 relative">
                        <div className="prompt-box-container">
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                                className="w-full glass glass-border prompt-box rounded-xl p-4 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none text-white" 
                                placeholder="✨ Write or Say your vision...!" 
                            />
                            <div 
                                onClick={toggleMic}
                                className={clsx("mic-btn", isListening && "recording")}
                            >
                                <Mic size={14} className={isListening ? "stroke-[#DC143C]" : "stroke-[#FFD700]"} />
                            </div>
                        </div>
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex items-center justify-center gap-2 h-auto sm:h-full px-6 py-3 font-semibold text-white generate-btn transition-all shadow-lg disabled:opacity-50 relative min-w-[140px]" 
                            style={{borderBottomLeftRadius: '60% 40px', borderBottomRightRadius: '60% 40px'}}
                        >
                            <span>🎄</span>
                            <span>GΞИΞRATΞ</span>
                        </button>
                    </div>
                    
                    <div className="text-center py-4 mt-4 border-t border-yellow-600/30">
                        <a href="https://t.me/shervini" target="_blank" rel="noopener noreferrer" className="footer-gradient font-semibold text-sm">
                            Exclusive SHΞN™ made
                        </a>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            
            {/* Style Modal */}
            {showStyles && (
                <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4 modal-fade-in" onClick={(e) => e.target === e.currentTarget && setShowStyles(false)}>
                    <div className="glass glass-border rounded-xl w-full max-w-xs p-6">
                        <h3 className="text-xl font-semibold mb-4 text-center text-yellow-400">✨ Choose a Style</h3>
                        <div className="h-56 overflow-y-auto custom-scrollbar space-y-2">
                            {STYLES.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => { setActiveStyle(style); setShowStyles(false); }}
                                    className={clsx(
                                        "w-full p-3 text-center rounded-lg transition-all",
                                        activeStyle?.id === style.id ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50" : "text-gray-400 hover:bg-white/5"
                                    )}
                                >
                                    {style.name}
                                </button>
                            ))}
                        </div>
                        <div className="text-center mt-6 flex gap-3">
                             <button onClick={() => {setActiveStyle(null); setShowStyles(false)}} className="flex-1 px-4 py-2 bg-white/10 text-gray-300 rounded-lg">None</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4 modal-fade-in" onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}>
                    <div className="glass glass-border rounded-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-semibold mb-6 text-yellow-400">⚙️ API Settings</h3>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <label className="text-yellow-400">Model</label>
                                <select 
                                    value={settings.model}
                                    onChange={(e) => {
                                        if(e.target.value === 'turbo') setShowAgeGate(true);
                                        setSettings({...settings, model: e.target.value});
                                    }}
                                    className="w-48 glass glass-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-yellow-400 bg-transparent font-sans"
                                >
                                    <option value="gemini-flash" className="bg-black text-green-400 font-bold tracking-wide">SH🎄N™ Santa (NEW ✨)</option>
                                    <option value="flux" className="bg-black">SH🎄N™ PRO</option>
                                    <option value="turbo" className="bg-black">SH🎄N™ +18</option>
                                    <option value="dall-e-3" className="bg-black">SH🎄N™ Alpha</option>
                                    <option value="midjourney" className="bg-black">SH🎄N™ Julietta</option>
                                </select>
                            </div>

                            {/* Aspect Ratio Buttons */}
                             <div className="flex gap-2 justify-end">
                                <button onClick={() => setAspectRatio('1:1')} className="px-3 py-1 text-xs border border-yellow-500/30 rounded text-yellow-500 hover:bg-yellow-500/20">1:1</button>
                                <button onClick={() => setAspectRatio('16:9')} className="px-3 py-1 text-xs border border-yellow-500/30 rounded text-yellow-500 hover:bg-yellow-500/20">16:9</button>
                                <button onClick={() => setAspectRatio('9:16')} className="px-3 py-1 text-xs border border-yellow-500/30 rounded text-yellow-500 hover:bg-yellow-500/20">9:16</button>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-yellow-400">Width</label>
                                <input type="number" value={settings.width} onChange={e => setSettings({...settings, width: Number(e.target.value)})} className="w-24 glass glass-border rounded-md px-3 py-2 text-sm text-yellow-400 bg-transparent" />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-yellow-400">Height</label>
                                <input type="number" value={settings.height} onChange={e => setSettings({...settings, height: Number(e.target.value)})} className="w-24 glass glass-border rounded-md px-3 py-2 text-sm text-yellow-400 bg-transparent" />
                            </div>
                            
                            <div className="h-[1px] bg-yellow-500/20 my-2"></div>

                            <div className="flex items-center justify-between">
                                <label className="text-yellow-400 flex items-center gap-2"><Settings size={14}/> Enhance Prompt</label>
                                <input type="checkbox" checked={settings.enhance} onChange={e => setSettings({...settings, enhance: e.target.checked})} className="accent-yellow-500 w-5 h-5" />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-yellow-400 flex items-center gap-2">🎲 Random Seed</label>
                                <input type="checkbox" checked={settings.randomSeed} onChange={e => setSettings({...settings, randomSeed: e.target.checked})} className="accent-yellow-500 w-5 h-5" />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-yellow-400 flex items-center gap-2">{settings.soundEnabled ? <Volume2 size={14}/> : <VolumeX size={14}/>} Sound FX</label>
                                <input type="checkbox" checked={settings.soundEnabled} onChange={e => setSettings({...settings, soundEnabled: e.target.checked})} className="accent-yellow-500 w-5 h-5" />
                            </div>
                             <div className="flex items-center justify-between">
                                <label className="text-yellow-400 flex items-center gap-2"><Snowflake size={14}/> Snow Effect</label>
                                <input type="checkbox" checked={settings.snowEnabled} onChange={e => setSettings({...settings, snowEnabled: e.target.checked})} className="accent-yellow-500 w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-right mt-8">
                            <button onClick={() => setShowSettings(false)} className="px-5 py-2 text-sm font-medium text-black bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg">Save & Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slideshow */}
            {slideshowIndex !== null && generatedImages[slideshowIndex] && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                    <button onClick={() => setSlideshowIndex(null)} className="absolute top-6 right-6 text-yellow-500"><X size={32}/></button>
                    <div className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center">
                        <button onClick={() => setSlideshowIndex(prev => prev! > 0 ? prev! - 1 : generatedImages.length - 1)} className="absolute left-0 p-2 text-yellow-500"><ChevronLeft size={48}/></button>
                        <img src={generatedImages[slideshowIndex].url} className="max-h-full max-w-full object-contain rounded-lg shadow-[0_0_50px_rgba(255,215,0,0.2)]" />
                        <button onClick={() => setSlideshowIndex(prev => prev! < generatedImages.length - 1 ? prev! + 1 : 0)} className="absolute right-0 p-2 text-yellow-500"><ChevronRight size={48}/></button>
                    </div>
                    {/* Slideshow Download */}
                    <button 
                         onClick={() => { const a = document.createElement('a'); a.href = generatedImages[slideshowIndex].url; a.download = 'shen_gen.png'; a.click(); }}
                         className="absolute top-6 right-20 bg-yellow-500/20 text-yellow-400 p-2 rounded-full hover:bg-yellow-500 hover:text-black transition-all border border-yellow-500/50"
                    >
                        <Download size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;