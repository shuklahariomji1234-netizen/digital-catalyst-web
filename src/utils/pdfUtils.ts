// --- 1. THE 10 BEST HANDWRITTEN STYLE FONTS (Google Fonts) ---
export const HANDWRITTEN_FONTS = [
  { name: 'Caveat', value: "'Caveat', cursive" }, // Casual & Friendly
  { name: 'Dancing Script', value: "'Dancing Script', cursive" }, // Elegant
  { name: 'Shadows Into Light', value: "'Shadows Into Light', cursive" }, // Neat Teacher Style
  { name: 'Indie Flower', value: "'Indie Flower', cursive" }, // Bohemic
  { name: 'Pacifico', value: "'Pacifico', cursive" }, // Bold & Fun
  { name: 'Patrick Hand', value: "'Patrick Hand', cursive" }, // Marker Style
  { name: 'Permanent Marker', value: "'Permanent Marker', cursive" }, // Thick Marker
  { name: 'Gloria Hallelujah', value: "'Gloria Hallelujah', cursive" }, // Playful
  { name: 'Sacramento', value: "'Sacramento', cursive" }, // Classy Cursive
  { name: 'Amatic SC', value: "'Amatic SC', cursive" }, // All Caps, Thin
];

// --- 2. DATA INTERFACES (For Firestore & Logic) ---

export type AnnotationType = 'highlight' | 'text' | 'sticky_note' | 'drawing';

// Structure for a single annotation (Highlight, Text, etc.)
export interface PDFAnnotation {
  id: string;
  type: AnnotationType;
  pageNumber: number; // Which page of the PDF
  
  // Positions are in % (0-100) relative to page size, so it works on mobile & desktop
  x: number; 
  y: number; 
  width?: number;
  height?: number;
  
  // Style Props
  color?: string; // Hex code (e.g., #FFFF00 for yellow highlight)
  content?: string; // The text user typed, or SVG path for drawings
  fontFamily?: string; // One of the 10 handwritten fonts
  fontSize?: number;
  
  // Ownership & Selling Logic
  authorId: string; // 'admin' or userId.
  isLocked?: boolean; // If TRUE, user cannot edit/delete (Used for "Sold Notes")
  isPublic?: boolean; // If TRUE, visible to others (if social features exist)
  
  createdAt: string;
}

// Structure for the "Advanced Note" (Pop-up Interface)
export interface SavedNote {
  id: string;
  userId: string;
  title: string;
  content: string; // Rich Text / HTML content
  linkedFileId: string; // Which PDF is this note related to?
  tags: string[]; // e.g., ["Important", "Exam", "Chapter 1"]
  aiSummary?: string; // If Gemini generated a summary
  createdAt: string;
  updatedAt: string;
}

// --- 3. UTILITY FUNCTIONS ---

// Function to dynamically load Google Fonts into the Head
// Call this inside useEffect when the PDF Viewer opens.
export const loadHandwrittenFonts = () => {
  const linkId = 'google-fonts-handwritten';
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.href = 'https://fonts.googleapis.com/css2?family=Amatic+SC&family=Caveat&family=Dancing+Script&family=Gloria+Hallelujah&family=Indie+Flower&family=Pacifico&family=Patrick+Hand&family=Permanent+Marker&family=Sacramento&family=Shadows+Into+Light&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
};

// Helper to get X,Y coordinates of selected text for the "Magic Menu"
export const getSelectionPosition = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  if (rect.width === 0) return null; // No text selected

  return {
    x: rect.left + window.scrollX + (rect.width / 2), // Center of selection
    y: rect.top + window.scrollY, // Top of selection
    text: selection.toString()
  };
};