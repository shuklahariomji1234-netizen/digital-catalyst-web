
import React, { useState } from 'react';
import { ProductWithRating, CourseModule, ProductFile, WebsiteSettings } from '../App';

const FileIcon: React.FC<{ type: string }> = ({ type }) => {
    // Returns an SVG icon based on file type
    const commonClasses = "w-16 h-16 mb-4 text-gray-600";
    
    switch (type) {
        case 'pdf':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        case 'video':
        case 'youtube':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'audio':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-purple-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
                </svg>
            );
        default: // Generic doc or link
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-gray-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            );
    }
};

const DownloadCard: React.FC<{ file: ProductFile, onRead: (file: ProductFile) => void }> = ({ file, onRead }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border p-8 flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300 w-full max-w-sm mx-auto">
            <FileIcon type={file.type} />
            <h3 className="text-lg font-bold text-gray-800 mb-2 break-words w-full">{file.name}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">{file.type.toUpperCase()}</p>
            
            <div className="flex flex-col gap-3 w-full">
                {file.type === 'pdf' && (
                    <button 
                        onClick={() => onRead(file)}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Read Now
                    </button>
                )}
                <a 
                    href={file.url} 
                    download={file.name}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {file.type === 'youtube' || file.type === 'link' ? 'Open Link' : 'Download'}
                </a>
            </div>
        </div>
    );
};

// Recursively flatten all files from modules
const getAllFiles = (modules: CourseModule[]): ProductFile[] => {
    let files: ProductFile[] = [];
    if (!modules) return files;
    
    modules.forEach(module => {
        if (module.files) files = [...files, ...module.files];
        if (module.modules) files = [...files, ...getAllFiles(module.modules)];
    });
    return files;
};

// Helper to safely handle Base64 PDFs
const dataURLtoBlob = (dataurl: string) => {
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

const PdfReaderModal: React.FC<{ file: ProductFile | null; onClose: () => void }> = ({ file, onClose }) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (file) {
            setError(null);
            if (file.url.startsWith('data:')) {
                const blob = dataURLtoBlob(file.url);
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                    return () => URL.revokeObjectURL(url);
                } else {
                    setError("Failed to process PDF file data.");
                }
            } else {
                setPdfUrl(file.url);
            }
        }
    }, [file]);

    if (!file) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex flex-col animate-fade-in">
            <div className="bg-gray-900 px-4 py-3 flex justify-between items-center text-white shadow-lg border-b border-gray-800">
                <div className="flex items-center overflow-hidden mr-4">
                    <div className="bg-red-600 p-1.5 rounded mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="font-bold truncate text-sm sm:text-base">{file.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                    {pdfUrl && (
                        <a 
                            href={pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            download={file.name}
                            className="hidden sm:flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-xs font-semibold transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download
                        </a>
                    )}
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors">
                        Close
                    </button>
                </div>
            </div>
            
            <div className="flex-1 w-full h-full bg-gray-800 relative flex flex-col items-center justify-center p-0 sm:p-4">
                {error ? (
                    <div className="text-red-400 bg-gray-900 p-6 rounded-lg text-center max-w-md">
                        <p className="font-bold text-lg mb-2">Error Loading PDF</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                ) : pdfUrl ? (
                    <>
                        {/* Fallback Background Message */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                            <div className="text-center text-gray-500 p-6">
                                <p className="mb-4 font-medium">Preview not loading?</p>
                                <a 
                                    href={pdfUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="pointer-events-auto inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-500 transition-colors"
                                >
                                    Open PDF in New Tab
                                </a>
                            </div>
                        </div>
                        
                        {/* Iframe Viewer */}
                        <iframe 
                            src={pdfUrl} 
                            className="w-full h-full relative z-10 bg-white rounded-none sm:rounded-lg shadow-2xl" 
                            title={file.name} 
                        />
                    </>
                ) : (
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                )}
            </div>
        </div>
    );
}

const EbookReader: React.FC<{
    settings: WebsiteSettings;
    product: ProductWithRating;
    onBack: () => void;
}> = ({ settings, product, onBack }) => {
    const [readingFile, setReadingFile] = useState<ProductFile | null>(null);
    const files = getAllFiles(product.courseContent || []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-10 border-b">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack}
                            className="text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                            &larr; Back
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 border-l pl-4 border-gray-300">{product.title}</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-extrabold text-primary">Your Downloads</h2>
                    <p className="mt-2 text-gray-600">Access the files included with your purchase below.</p>
                </div>

                {files.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {files.map((file) => (
                            <DownloadCard key={file.id} file={file} onRead={setReadingFile} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-inner border">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No downloadable files found for this product.</p>
                    </div>
                )}
            </main>
            
            {readingFile && <PdfReaderModal file={readingFile} onClose={() => setReadingFile(null)} />}
        </div>
    );
};

export default EbookReader;
