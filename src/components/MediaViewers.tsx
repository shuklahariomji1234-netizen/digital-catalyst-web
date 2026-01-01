import React, { useState, useEffect } from 'react';
import { ProductFile } from '../App';

// --- HELPER: Extract YouTube ID ---
export const extractYouTubeID = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// --- HELPER: Base64 to Blob ---
export const dataURLtoBlob = (dataurl: string) => {
    try {
        if (!dataurl.startsWith('data:')) return null;
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], { type: mime });
    } catch(e) {
        console.error("Blob conversion failed", e);
        return null;
    }
};

// --- COMPONENT: Video Player ---
export const VideoPlayer: React.FC<{ file: ProductFile }> = ({ file }) => {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-8 text-center">
                <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-lg font-medium">Video Unavailable</p>
                <p className="text-sm">The source video could not be loaded.</p>
            </div>
        );
    }

    if (file.type === 'youtube') {
        const videoId = extractYouTubeID(file.url);
        if (!videoId) return <div className="text-white p-10">Invalid YouTube URL</div>;
        
        return (
            <div className="w-full h-full bg-black">
                <iframe 
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title={file.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    return (
        <video 
            key={file.id} // Key ensures player resets on file change
            src={file.url} 
            controls 
            autoPlay={false}
            className="w-full h-full bg-black object-contain"
            onError={() => setError(true)}
        />
    );
};

// --- COMPONENT: PDF Viewer ---
export const PdfViewer: React.FC<{ file: ProductFile }> = ({ file }) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        if (file.url.startsWith('data:')) {
            const blob = dataURLtoBlob(file.url);
            if (blob) {
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        } else {
            setPdfUrl(file.url);
        }
    }, [file]);

    if (!pdfUrl) return <div className="p-10 text-center">Loading PDF...</div>;

    return (
        <div className="w-full h-full bg-gray-100 flex flex-col">
            <object
                data={pdfUrl}
                type="application/pdf"
                className="w-full h-full"
            >
                {/* Fallback for browsers that block embedded PDFs */}
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
                    <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to display PDF directly</h3>
                    <p className="text-gray-600 mb-6">Your browser settings may be blocking the embed, or the file type is not supported for inline viewing.</p>
                    <a 
                        href={pdfUrl} 
                        download={file.name}
                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        Download PDF Instead
                    </a>
                </div>
            </object>
        </div>
    );
};