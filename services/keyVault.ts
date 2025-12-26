/**
 * SHΞN™ PROTOCOL: VAULT SYSTEM
 * Stores hardcoded credentials for rotation.
 * 
 * SECURITY STATUS: AUTHORIZED BY LORD SHΞN™.
 * DIRECT INJECTION MODE ACTIVE.
 */

// OpenAI Keys for Text Enhancement (Round Robin)
export const OPENAI_KEYS = [
    "sk-proj-YOUR_HARDCODED_KEY_1_HERE_DONT_USE_ENV",
    "sk-proj-YOUR_HARDCODED_KEY_2_HERE_BACKUP",
    "sk-proj-YOUR_HARDCODED_KEY_3_HERE_EMERGENCY"
];

// SHΞN™ GEMINI VAULT
// Hardcoded keys for Google GenAI rotation
export const GEMINI_KEYS = [
    "AIzaSyB5lRVsfChLGX1rpyrXt9zSaQDYW8groFI",
    "AIzaSyB7d8V7SqzG_O7S6I_CIIULlJFRIUJX37E",
    "AIzaSyD9UGFxV5PjW0vrw6ya7qDojmRcWnlp-EY",
    "AIzaSyBlQhpK1WUNFsXMHzI7dsIloVSJeIyTTEI",
    "AIzaSyD9ubsXUnHT7ReRJ6GIzrWhFTA-lvPfa4g",
    "AIzaSyB3jnwrzVQq8FG8rFeSgZDpIolRCUtnh0s"
];

// Pollinations nodes
export const PROXY_NODES = [
    "https://image.pollinations.ai",
];

let keyIndex = 0;
let geminiKeyIndex = 0;
let nodeIndex = 0;

export const getNextKey = (): string => {
    const key = OPENAI_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % OPENAI_KEYS.length;
    return key;
};

export const getNextGeminiKey = (): string => {
    // Round-robin rotation for Gemini keys
    const key = GEMINI_KEYS[geminiKeyIndex];
    geminiKeyIndex = (geminiKeyIndex + 1) % GEMINI_KEYS.length;
    return key;
};

export const getNextNode = (): string => {
    const node = PROXY_NODES[nodeIndex];
    nodeIndex = (nodeIndex + 1) % PROXY_NODES.length;
    return node;
};