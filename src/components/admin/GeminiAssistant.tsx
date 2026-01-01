
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const GeminiAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: "Hello! I'm your AI assistant, powered by Gemini. How can I help you improve the website today? For example, you could ask me to 'add a new section to the homepage' or 'change the color of the header'." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(false);

    useEffect(() => {
        const checkKey = async () => {
            let available = false;
            
            // 1. Check for AI Studio injected key (legacy/iframe)
            if (window.aistudio && window.aistudio.hasSelectedApiKey) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (hasKey) available = true;
            } 
            // 2. Check process.env
            if (process.env.API_KEY) {
                available = true;
            }
            // 3. Check Admin Settings (LocalStorage simulation)
            const storedSettings = localStorage.getItem('websiteSettings');
            if (storedSettings) {
                const settings = JSON.parse(storedSettings);
                if (settings.apiKeys?.google) {
                    available = true;
                }
            }

            setHasApiKey(available);
        };
        checkKey();
    }, []);

    const handleConnect = async () => {
        if (window.aistudio && window.aistudio.openSelectKey) {
            await window.aistudio.openSelectKey();
            // Optimistically assume success or re-check after a short delay
            setTimeout(async () => {
                if (window.aistudio?.hasSelectedApiKey) {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    setHasApiKey(hasKey);
                }
            }, 500);
        } else {
            // Redirect user to settings tab if no AI Studio
            alert("Please configure your API Key in the 'Store Config' -> 'API Keys' tab.");
        }
    };

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            // Determine the key to use
            let apiKey = process.env.API_KEY;
            
            if (!apiKey && window.aistudio?.hasSelectedApiKey) {
                 const hasKey = await window.aistudio.hasSelectedApiKey();
                 if (hasKey) apiKey = process.env.API_KEY || '';
            }

            if (!apiKey) {
                const storedSettings = localStorage.getItem('websiteSettings');
                if (storedSettings) {
                    const settings = JSON.parse(storedSettings);
                    apiKey = settings.apiKeys?.google;
                }
            }

            if (!apiKey) throw new Error("API Key not found. Please configure it in Store Config.");

            const ai = new GoogleGenAI({ apiKey: apiKey });

            const systemInstruction = "You are an expert senior frontend engineer assisting an admin with their React/TypeScript e-commerce site built with Tailwind CSS. Your goal is to provide helpful explanations and complete, ready-to-use code snippets to fulfill their requests for changes. Always format code blocks with markdown backticks (```tsx ... ```). Be concise and helpful.";

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${systemInstruction}\n\nUser: ${input}`,
            });

            const aiMessage: Message = { sender: 'ai', text: response.text || "I couldn't generate a response." };
            setMessages(prev => [...prev, aiMessage]);

        } catch (err: any) {
            const errorMessage = err.message || "Sorry, I encountered an error. Please check your API key configuration.";
            setError(errorMessage);
            setMessages(prev => [...prev, { sender: 'ai', text: errorMessage }]);
            console.error("Gemini API Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasApiKey) {
        return (
            <div className="flex flex-col h-full bg-white rounded-lg shadow-md items-center justify-center p-8 text-center">
                <div className="mb-6 bg-blue-50 p-4 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Gemini AI</h2>
                <p className="text-gray-600 mb-6 max-w-sm">To use the AI Assistant, you need to configure a Google Gemini API key.</p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button 
                        onClick={handleConnect}
                        className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2"
                    >
                        Configure Key (Popup)
                    </button>
                    <p className="text-sm text-gray-400">OR</p>
                    <p className="text-sm text-gray-600">Go to <span className="font-bold">Store Config &gt; API Keys</span> to set a permanent fallback key.</p>
                </div>
                <p className="mt-4 text-xs text-gray-400">
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-blue-600">
                        Get API Key
                    </a>
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-5rem)] bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold text-gray-800">AI Assistant</h1>
                 <div className="mt-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded-r-lg" role="alert">
                    <p className="font-semibold">Disclaimer</p>
                    <p className="text-sm">This assistant provides suggestions but does not automatically edit code.</p>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl lg:max-w-3xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-razorpay-light-blue text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-xl p-3 rounded-lg bg-gray-200 text-gray-800">
                           <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                           </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-gray-50">
                {error && (
                    <div className="mb-2 flex justify-center">
                         <button onClick={() => setHasApiKey(false)} className="text-sm text-red-500 hover:underline font-semibold">Connection Error - Check Configuration</button>
                    </div>
                )}
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for a change..."
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-razorpay-light-blue focus:border-transparent transition"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="bg-razorpay-light-blue text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Thinking...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeminiAssistant;
