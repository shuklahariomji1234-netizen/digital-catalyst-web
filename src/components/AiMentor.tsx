
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { WebsiteSettings } from '../App';

interface AiMentorProps {
    productTitle: string;
    activeContentName: string | null;
    settings?: WebsiteSettings;
}

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

type Provider = 'google' | 'openai' | 'anthropic' | 'deepseek' | 'grok';

interface ModelConfig {
    name: string;
    id: string;
    provider: Provider;
}

const MODELS: Record<string, ModelConfig> = {
    'gemini-2.5-flash': { name: 'Gemini 2.5 Flash', id: 'gemini-2.5-flash', provider: 'google' },
    'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', id: 'gemini-1.5-pro', provider: 'google' },
    'gpt-4o': { name: 'GPT-4o', id: 'gpt-4o', provider: 'openai' },
    'gpt-4o-mini': { name: 'GPT-4o Mini', id: 'gpt-4o-mini', provider: 'openai' },
    'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet', id: 'claude-3-5-sonnet-20240620', provider: 'anthropic' },
    'deepseek-chat': { name: 'DeepSeek Chat', id: 'deepseek-chat', provider: 'deepseek' },
    'grok-2': { name: 'Grok 2', id: 'grok-2', provider: 'grok' },
};

// Helper class to unify API calls
class UnifiedAIClient {
    private keys: Record<Provider, string | undefined>;

    constructor(userKeys: Record<Provider, string>, adminKeys?: WebsiteSettings['apiKeys']) {
        this.keys = {
            google: userKeys.google || adminKeys?.google || (process.env.API_KEY),
            openai: userKeys.openai || adminKeys?.openai,
            anthropic: userKeys.anthropic || adminKeys?.anthropic,
            deepseek: userKeys.deepseek || adminKeys?.deepseek,
            grok: userKeys.grok || adminKeys?.grok,
        };
    }

    hasKey(provider: Provider): boolean {
        // Check if we have a key string, or if it's Google and we have the window object
        return !!this.keys[provider] || (provider === 'google' && (!!window.aistudio?.hasSelectedApiKey || !!process.env.API_KEY));
    }

    async generateContent(modelId: string, provider: Provider, systemInstruction: string, userPrompt: string): Promise<string> {
        const apiKey = this.keys[provider];

        if (provider === 'google') {
            // Special handling for Gemini via SDK or Window object
            let activeKey = apiKey;
            if (!activeKey && window.aistudio && window.aistudio.hasSelectedApiKey) {
                 const hasKey = await window.aistudio.hasSelectedApiKey();
                 if (hasKey) {
                     activeKey = process.env.API_KEY || ''; 
                 }
            }
            
            if (!activeKey) throw new Error("Google API Key not found.");

            const ai = new GoogleGenAI({ apiKey: activeKey });
            const response = await ai.models.generateContent({
                model: modelId,
                contents: `${systemInstruction}\n\nUser: ${userPrompt}`,
            });
            return response.text || "No response generated.";
        } 
        
        // Generic OpenAI-compatible fetch handler (DeepSeek, Grok, OpenAI)
        if (['openai', 'deepseek', 'grok'].includes(provider)) {
            if (!apiKey) throw new Error(`${provider.toUpperCase()} API Key not found.`);
            
            let baseUrl = 'https://api.openai.com/v1/chat/completions';
            if (provider === 'deepseek') baseUrl = 'https://api.deepseek.com/chat/completions';
            if (provider === 'grok') baseUrl = 'https://api.x.ai/v1/chat/completions';

            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: [
                        { role: 'system', content: systemInstruction },
                        { role: 'user', content: userPrompt }
                    ],
                    stream: false
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || `API Error ${response.status}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "No response text.";
        }

        // Anthropic Handler
        if (provider === 'anthropic') {
            if (!apiKey) throw new Error("Anthropic API Key not found.");
            
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                    'dangerously-allow-browser': 'true' 
                },
                body: JSON.stringify({
                    model: modelId,
                    max_tokens: 1024,
                    system: systemInstruction,
                    messages: [{ role: 'user', content: userPrompt }]
                })
            });

             if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || `API Error ${response.status}`);
            }

            const data = await response.json();
            return data.content?.[0]?.text || "No response text.";
        }

        throw new Error(`Provider ${provider} not implemented.`);
    }
}


const ApiKeyModal: React.FC<{ 
    userKeys: Record<Provider, string>, 
    onSave: (keys: Record<Provider, string>) => void, 
    onClose: () => void 
}> = ({ userKeys, onSave, onClose }) => {
    const [keys, setKeys] = useState(userKeys);

    const handleChange = (provider: Provider, value: string) => {
        setKeys(prev => ({ ...prev, [provider]: value }));
    };

    const handleSave = () => {
        onSave(keys);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1e293b] text-white rounded-xl shadow-2xl w-full max-w-md border border-slate-700 p-6 animate-scale-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Configure API Keys</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    Enter your own API keys to unlock different AI models. Your keys are stored securely in your browser's local storage.
                </p>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {(['google', 'openai', 'anthropic', 'deepseek', 'grok'] as Provider[]).map(provider => (
                        <div key={provider}>
                            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">{provider}</label>
                            <input 
                                type="password" 
                                value={keys[provider] || ''} 
                                onChange={(e) => handleChange(provider, e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder={`Enter ${provider} API Key`}
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:bg-white/10 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">Save Keys</button>
                </div>
            </div>
        </div>
    );
};


const AiMentor: React.FC<AiMentorProps> = ({ productTitle, activeContentName, settings }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    // Settings State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedModelKey, setSelectedModelKey] = useState<string>('gemini-2.5-flash');
    const [userKeys, setUserKeys] = useState<Record<Provider, string>>({
        google: '', openai: '', anthropic: '', deepseek: '', grok: ''
    });

    // Load keys from local storage on mount
    useEffect(() => {
        const storedKeys = localStorage.getItem('user_ai_keys');
        if (storedKeys) {
            setUserKeys(JSON.parse(storedKeys));
        }
        
        setMessages([{ 
            sender: 'ai', 
            text: `Welcome! I'm your AI mentor. I can help you with "${productTitle}".` 
        }]);
    }, []); // Only run once

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSaveKeys = (newKeys: Record<Provider, string>) => {
        setUserKeys(newKeys);
        localStorage.setItem('user_ai_keys', JSON.stringify(newKeys));
    };

    const handleSendMessage = async () => {
        if (chatInput.trim() === '' || isChatLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: chatInput };
        setMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const modelConfig = MODELS[selectedModelKey];
            const client = new UnifiedAIClient(userKeys, settings?.apiKeys);

            if (!client.hasKey(modelConfig.provider)) {
                throw new Error(`Missing API Key for ${modelConfig.provider}. Click the settings (⚙️) icon to add it.`);
            }

            const systemInstruction = `You are a helpful AI Mentor for the product "${productTitle}". The user is currently viewing content titled "${activeContentName || 'the main product page'}". Your role is to answer questions about this topic, the product, and related subjects to help the user learn and succeed. Be encouraging and clear.`;
            
            const responseText = await client.generateContent(modelConfig.id, modelConfig.provider, systemInstruction, chatInput);

            setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
        } catch (err: any) {
            console.error("AI Error:", err);
            setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Error: ${err.message || "Could not connect."}` }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e293b] text-white overflow-hidden rounded-lg shadow-inner relative">
            {/* Header */}
            <div className="p-3 border-b border-gray-700 flex-shrink-0 flex justify-between items-center bg-slate-800/50">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        AI Mentor
                    </h3>
                </div>
                
                <div className="flex items-center gap-2">
                    <select 
                        value={selectedModelKey}
                        onChange={(e) => setSelectedModelKey(e.target.value)}
                        className="bg-slate-700 border border-slate-600 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500 max-w-[120px] sm:max-w-[150px] truncate"
                    >
                        {Object.entries(MODELS).map(([key, config]) => (
                            <option key={key} value={key}>{config.name}</option>
                        ))}
                    </select>
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors text-gray-300 hover:text-white border border-slate-600"
                        title="API Key Settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={chatContainerRef} className="flex-1 p-3 space-y-3 overflow-y-auto bg-[#0f172a]">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-2.5 px-3.5 rounded-2xl animate-fade-in text-sm shadow-md ${
                            msg.sender === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-sm' 
                                : 'bg-slate-700 text-slate-100 rounded-tl-sm'
                        }`}>
                            <pre className="whitespace-pre-wrap font-sans leading-relaxed">{msg.text}</pre>
                        </div>
                    </div>
                ))}
                {isChatLoading && (
                    <div className="flex justify-start">
                        <div className="p-2.5 rounded-2xl bg-slate-700 rounded-tl-sm">
                            <div className="flex items-center space-x-1.5">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-700 bg-slate-800 flex-shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={`Ask ${MODELS[selectedModelKey].name}...`}
                        className="w-full p-2.5 border border-slate-600 rounded-xl bg-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        disabled={isChatLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isChatLoading || !chatInput.trim()}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-sm flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <ApiKeyModal 
                    userKeys={userKeys} 
                    onSave={handleSaveKeys} 
                    onClose={() => setIsSettingsOpen(false)} 
                />
            )}
        </div>
    );
};

export default AiMentor;
