
import React, { useState, useEffect, useRef } from 'react';
import { 
  Type, 
  Highlighter, 
  MessageSquare, 
  Download, 
  Sparkles,
  Languages
} from 'lucide-react';
import { 
  HANDWRITTEN_FONTS, 
  loadHandwrittenFonts, 
  getSelectionPosition, 
  PDFAnnotation 
} from '../utils/pdfUtils'; // Corrected import path

// --- PROPS INTERFACE ---
interface InteractivePDFViewerProps {
  pdfUrl: string;
  initialAnnotations?: PDFAnnotation[];
  onSaveNote: (note: any) => void;
  onAskAI: (text: string) => void;
}

const InteractivePDFViewer: React.FC<InteractivePDFViewerProps> = ({ 
  pdfUrl, 
  initialAnnotations = [], 
  onSaveNote,
  onAskAI 
}) => {
  // --- STATE ---
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>(initialAnnotations);
  const [selectionMenu, setSelectionMenu] = useState<{ x: number, y: number, text: string } | null>(null);
  const [activeTool, setActiveTool] = useState<'cursor' | 'highlight' | 'text'>('cursor');
  const [activeFont, setActiveFont] = useState(HANDWRITTEN_FONTS[0].value);
  const [activeColor, setActiveColor] = useState('#ffff00'); // Default highlight yellow
  const containerRef = useRef<HTMLDivElement>(null);

  // Load fonts on mount
  useEffect(() => {
    loadHandwrittenFonts();
  }, []);

  // Handle Text Selection (The Magic Menu Trigger)
  const handleMouseUp = () => {
    // Small delay to let browser handle selection
    setTimeout(() => {
      const pos = getSelectionPosition();
      if (pos) {
        setSelectionMenu(pos);
      } else {
        setSelectionMenu(null);
      }
    }, 100);
  };

  // --- UI COMPONENTS ---

  // 1. The Glassmorphism Toolbar
  const Toolbar = () => (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-white/20 rounded-full shadow-lg transition-all hover:scale-105">
      {/* Tool: Highlight */}
      <button 
        onClick={() => setActiveTool('highlight')}
        className={`p-2 rounded-full transition-colors ${activeTool === 'highlight' ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100'}`}
        title="Highlight Mode"
      >
        <Highlighter size={20} />
      </button>

      {/* Tool: Add Text (Handwritten) */}
      <div className="relative group">
        <button 
          onClick={() => setActiveTool('text')}
          className={`p-2 rounded-full transition-colors ${activeTool === 'text' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="Add Handwritten Note"
        >
          <Type size={20} />
        </button>
        
        {/* Font Selector Dropdown (Hover to show) */}
        <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-lg shadow-xl p-2 hidden group-hover:block border border-gray-100">
          <p className="text-xs text-gray-400 mb-2 px-2 uppercase font-bold">Choose Handwritting</p>
          {HANDWRITTEN_FONTS.map((font) => (
            <button
              key={font.name}
              onClick={() => setActiveFont(font.value)}
              className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded text-lg"
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </button>
          ))}
        </div>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Action: Ask AI (General) */}
      <button onClick={() => onAskAI("Summarize this page")} className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-sm font-medium hover:opacity-90">
        <Sparkles size={16} />
        <span>Ask AI</span>
      </button>

      {/* Action: Download Notes */}
      <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
        <Download size={20} />
      </button>
    </div>
  );

  // 2. The Magic Context Menu (Appears on Selection)
  const MagicMenu = () => {
    if (!selectionMenu) return null;

    return (
      <div 
        className="absolute z-50 flex flex-col gap-1 bg-gray-900 text-white p-1 rounded-xl shadow-2xl animate-fade-in-up"
        style={{ 
          left: selectionMenu.x, 
          top: selectionMenu.y - 60, // Show above selection
          transform: 'translateX(-50%)' 
        }}
      >
        <div className="flex items-center gap-1">
          <button 
            onClick={() => { /* Logic to highlight selected text */ setSelectionMenu(null); }}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors tooltip"
            title="Highlight"
          >
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
          </button>
          
          <button 
            onClick={() => onAskAI(`Explain this: "${selectionMenu.text}"`)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium text-purple-300"
          >
            <Sparkles size={16} />
            Explain
          </button>

          <button 
            onClick={() => onSaveNote({ text: selectionMenu.text })}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Save to Notes"
          >
            <MessageSquare size={18} />
          </button>

          <button 
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Translate"
          >
            <Languages size={18} />
          </button>
        </div>
        
        {/* Little arrow pointing down */}
        <div className="w-3 h-3 bg-gray-900 transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
      </div>
    );
  };

  // --- RENDER ---
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-gray-100 overflow-hidden flex flex-col"
      onMouseUp={handleMouseUp}
    >
      {/* 1. Top Bar */}
      <Toolbar />

      {/* 2. Magic Menu (Conditional) */}
      <MagicMenu />

      {/* 3. Main PDF Area (Mockup for now, replaced by actual PDF engine in next step) */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div 
          className="bg-white shadow-2xl w-full max-w-4xl min-h-[150vh] p-12 relative"
          style={{ fontFamily: "'Inter', sans-serif" }} // Standard reading font
        >
          {/* This represents the PDF Layer */}
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Chapter 1: The Basics of Marketing</h1>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            Marketing is the activity, set of institutions, and processes for creating, communicating, delivering, and exchanging offerings that have value for customers, clients, partners, and society at large.
          </p>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            (Select any text here to see the Magic Menu in action. Or click the "T" tool in the toolbar to pretend to type notes.)
          </p>

          {/* 4. Annotations Layer (Overlaid on top) */}
          {annotations.map(anno => (
            <div
              key={anno.id}
              className="absolute pointer-events-none"
              style={{
                left: `${anno.x}%`,
                top: `${anno.y}%`,
                fontFamily: anno.fontFamily || 'inherit',
                fontSize: anno.fontSize || 16,
                color: anno.color || 'black'
              }}
            >
              {anno.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractivePDFViewer;
