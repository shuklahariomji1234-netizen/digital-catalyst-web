
import React, { useState, useEffect } from 'react';
import InteractivePDFViewer from './InteractivePDFViewer'; // Import UI Component
import { db } from '../firebase'; // Adjust path based on your structure
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { PDFAnnotation } from '../utils/pdfUtils'; // Adjust path

// --- PROPS ---
interface SmartReaderProps {
  userId: string;
  fileUrl: string; // The PDF URL
  fileId: string;  // Unique ID for this PDF (e.g., 'chapter-1')
  apiKey: string;  // Gemini API Key (passed from App settings)
  onClose: () => void;
  isAdmin?: boolean; // Added prop for admin features
}

const SmartReader: React.FC<SmartReaderProps> = ({ userId, fileUrl, fileId, apiKey, onClose, isAdmin }) => {
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // 1. Fetch Saved Notes from Firebase (Live Sync)
  useEffect(() => {
    if (!userId || !fileId) return;

    // In a real app, you might query specific user annotations OR global ones if shared
    const q = query(
      collection(db, `annotations`), 
      where("fileId", "==", fileId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PDFAnnotation[];
      setAnnotations(loadedNotes);
    });

    return () => unsubscribe();
  }, [userId, fileId]);

  // 2. Handle "Ask AI" (Gemini Integration)
  const handleAskAI = async (selectedText: string) => {
    setAiLoading(true);
    setAiResponse(null); // Reset previous response

    try {
      // Direct fetch to Gemini API (using the key from settings)
      const prompt = `Context: The user is reading a document. 
      Selected Text: "${selectedText}"
      Task: Explain this concept simply and provide 2 key takeaways.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
      
      setAiResponse(answer); // Show this in a modal or sidebar
      alert(`🤖 Gemini Says:\n\n${answer}`); // Temporary Alert, we will make a nice UI for this later

    } catch (error) {
      console.error("AI Error:", error);
      alert("Failed to connect to Gemini.");
    } finally {
      setAiLoading(false);
    }
  };

  // 3. Handle Save Note to Firebase
  const handleSaveNote = async (noteData: any) => {
    try {
      await addDoc(collection(db, `annotations`), {
        fileId: fileId,
        userId: userId,
        type: 'text',
        content: noteData.text,
        createdAt: serverTimestamp(),
        // Default positions for now (center of screen)
        x: 50, 
        y: 50,
        pageNumber: 1
      });
      console.log("Note Saved!");
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header for the Reader */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-white shadow-sm z-50">
        <h2 className="font-semibold text-gray-700">Smart Reader Mode {isAdmin ? '(Admin)' : ''}</h2>
        <div className="flex gap-2">
            {aiLoading && <span className="text-sm text-purple-600 animate-pulse">✨ AI Thinking...</span>}
            <button onClick={onClose} className="p-2 hover:bg-red-50 text-red-500 rounded-full">
            Close
            </button>
        </div>
      </div>

      {/* The UI Component we built in Step 3 */}
      <div className="flex-1 relative">
        <InteractivePDFViewer 
          pdfUrl={fileUrl}
          initialAnnotations={annotations}
          onSaveNote={handleSaveNote}
          onAskAI={handleAskAI}
        />
      </div>
    </div>
  );
};

export default SmartReader;
