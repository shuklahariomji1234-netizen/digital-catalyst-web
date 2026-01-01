
import React, { useEffect, useState } from "react";
import { WebsiteSettings, ProductWithRating, CourseModule, ProductFile } from './App';
import AiMentor from './AiMentor';
import CourseSidebar from './CoursesSidebar';
import { VideoPlayer, PdfViewer } from './MediaViewers';

declare global {
    interface Window {
        jspdf: any;
    }
}

interface Note {
    id: string;
    timestamp: number | null;
    text: string;
    createdAt: string;
}

interface CoursePlayerProps {
    settings: WebsiteSettings;
    product: ProductWithRating;
    onBack: () => void;
    purchasedIds: (number|string)[];
    onPurchaseModule: (moduleId: string, price: string, name: string) => void;
}

// --- TAB PANELS (Right Side) ---
const NotesPanel: React.FC<{ 
    notes: Note[]; 
    onAdd: () => void; 
    onDelete: (id: string) => void; 
    onUpdate: (id: string, txt: string) => void; 
    onSeek: (t: number) => void;
    canTimestamp: boolean;
}> = ({ notes, onAdd, onDelete, onUpdate, onSeek }) => (
    <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-700">My Notes</h3>
            <button onClick={onAdd} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium transition-colors">
                + New Note
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {notes.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">Capture your thoughts here.</p>}
            {notes.map(note => (
                <div key={note.id} className="group relative bg-yellow-50 p-3 rounded-lg border border-yellow-100 shadow-sm focus-within:ring-2 focus-within:ring-yellow-400 transition-all">
                    <div className="flex justify-between items-center mb-2">
                        {note.timestamp !== null ? (
                            <button onClick={() => onSeek(note.timestamp!)} className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {new Date(note.timestamp * 1000).toISOString().substr(11, 8)}
                            </button>
                        ) : <span className="text-xs text-gray-400">General Note</span>}
                        <button onClick={() => onDelete(note.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                    <textarea 
                        value={note.text} 
                        onChange={(e) => onUpdate(note.id, e.target.value)}
                        className="w-full bg-transparent text-sm text-gray-800 resize-none focus:outline-none placeholder-gray-400"
                        placeholder="Type note here..."
                        rows={3}
                    />
                </div>
            ))}
        </div>
    </div>
);

export function CoursePlayer({ settings, product, onBack, purchasedIds, onPurchaseModule }: CoursePlayerProps) {
    const [activeFile, setActiveFile] = useState<ProductFile | null>(null);
    const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
    const [activeTab, setActiveTab] = useState<'notes' | 'mentor' | null>(null); 
    const [isLocked, setIsLocked] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    
    const isVideo = activeFile?.type === 'video' || activeFile?.type === 'youtube';

    // --- EFFECT: Init first file ---
    useEffect(() => {
        const findFirst = (modules?: CourseModule[]): { file: ProductFile | null, module: CourseModule | null } => {
            if (!modules) return { file: null, module: null };
            for (const m of modules) {
                if (m.files.length) return { file: m.files[0], module: m };
                const found = findFirst(m.modules);
                if (found.file) return found;
            }
            return { file: null, module: null };
        };
        const { file, module } = findFirst(product.courseContent);
        if (!activeFile) { 
            setActiveFile(file);
            setActiveModule(module);
        }
    }, [product]);

    // --- EFFECT: Check Lock Status ---
    useEffect(() => {
        if (activeModule?.isLocked) {
            const isModulePurchased = purchasedIds.includes(activeModule.id);
            const tiers = settings.content.subscriptionTiers || [];
            const hasValidSubscription = tiers.some(tier => {
                if (!purchasedIds.includes(tier.id)) return false;
                if (tier.productAccess === 'all') return true;
                if (tier.productAccess === 'specific' && tier.accessProductIds?.includes(product.id)) return true;
                return false;
            });
            setIsLocked(!isModulePurchased && !hasValidSubscription);
        } else {
            setIsLocked(false);
        }
    }, [activeModule, purchasedIds, settings.content.subscriptionTiers, product.id]);

    // --- EFFECT: Load/Save Notes ---
    useEffect(() => {
        if (activeFile?.id) {
            const saved = localStorage.getItem(`notes-${activeFile.id}`);
            setNotes(saved ? JSON.parse(saved) : []);
        }
    }, [activeFile]);

    useEffect(() => {
        if (activeFile?.id) localStorage.setItem(`notes-${activeFile.id}`, JSON.stringify(notes));
    }, [notes, activeFile]);

    // --- HANDLERS ---
    const handleFileSelect = (file: ProductFile) => {
        const findModule = (modules: CourseModule[]): CourseModule | null => {
            for(const m of modules) {
                if(m.files.some(f => f.id === file.id)) return m;
                const sub = findModule(m.modules || []);
                if(sub) return sub;
            }
            return null;
        }
        const parent = findModule(product.courseContent || []);
        setActiveModule(parent);
        setActiveFile(file);
    };

    const handleAddNote = () => {
        let timestamp: number | null = null;
        const videoEl = document.querySelector('video'); 
        if (videoEl) timestamp = videoEl.currentTime;
        
        const newNote: Note = { 
            id: Date.now().toString(), 
            timestamp, 
            text: '', 
            createdAt: new Date().toISOString() 
        };
        setNotes([newNote, ...notes]);
        setActiveTab('notes'); 
    };

    const handleSeek = (time: number) => {
        const videoEl = document.querySelector('video');
        if (videoEl) { videoEl.currentTime = time; videoEl.play(); }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
            {/* --- HEADER --- */}
            <header className="flex-shrink-0 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-semibold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Exit
                    </button>
                    <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                    <h1 className="font-bold text-gray-800 text-lg truncate max-w-md">{product.title}</h1>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        title="Toggle Course Content"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <button 
                        onClick={() => setActiveTab(activeTab === 'notes' ? null : 'notes')}
                        className={`p-2 rounded-lg transition-colors ${activeTab === 'notes' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        title="My Notes"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button 
                        onClick={() => setActiveTab(activeTab === 'mentor' ? null : 'mentor')}
                        className={`p-2 rounded-lg transition-colors ${activeTab === 'mentor' ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        title="AI Mentor"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </button>
                </div>
            </header>

            {/* --- MAIN LAYOUT --- */}
            <div className="flex flex-1 overflow-hidden relative">
                
                {/* 1. LEFT SIDEBAR (Modules) */}
                <CourseSidebar 
                    modules={product.courseContent || []} 
                    activeFile={activeFile} 
                    onSelectFile={handleFileSelect} 
                    isOpen={isSidebarOpen}
                    onCloseMobile={() => setIsSidebarOpen(false)}
                />

                {/* 2. CENTER CONTENT (Video/PDF) */}
                <main className="flex-1 bg-black overflow-hidden relative flex flex-col items-center justify-center">
                    {isLocked ? (
                        <div className="text-center p-8 bg-gray-900 rounded-2xl border border-gray-700 max-w-md mx-4">
                            <div className="bg-orange-500/20 p-4 rounded-full inline-block mb-4">
                                <svg className="w-12 h-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Chapter Locked</h2>
                            <p className="text-gray-400 mb-6">This content requires additional access.</p>
                            <button 
                                onClick={() => activeModule && onPurchaseModule(activeModule.id, activeModule.individualPrice || '13', activeModule.title)}
                                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
                            >
                                Unlock for ₹{activeModule?.individualPrice || '13'}
                            </button>
                        </div>
                    ) : (
                        activeFile ? (
                            activeFile.type === 'pdf' ? <PdfViewer file={activeFile} /> : 
                            <VideoPlayer file={activeFile} />
                        ) : (
                            <div className="text-gray-500">Select a lesson to begin.</div>
                        )
                    )}
                </main>

                {/* 3. RIGHT PANEL (Notes/Mentor) */}
                {activeTab && (
                    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl absolute right-0 inset-y-0 z-40 md:relative">
                        <div className="flex-1 overflow-hidden">
                            {activeTab === 'notes' && (
                                <NotesPanel 
                                    notes={notes} 
                                    onAdd={handleAddNote} 
                                    onDelete={id => setNotes(n => n.filter(i => i.id !== id))} 
                                    onUpdate={(id, txt) => setNotes(n => n.map(i => i.id === id ? {...i, text:txt} : i))}
                                    onSeek={handleSeek}
                                    canTimestamp={isVideo}
                                />
                            )}
                            {activeTab === 'mentor' && (
                                <AiMentor 
                                    productTitle={product.title} 
                                    activeContentName={activeFile?.name || ''} 
                                    settings={settings} 
                                />
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}

export default CoursePlayer;
