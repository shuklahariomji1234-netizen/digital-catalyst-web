
import React, { useState } from 'react';
import { CourseModule, ProductFile } from '../App';

interface CourseSidebarProps {
    modules: CourseModule[];
    activeFile: ProductFile | null;
    onSelectFile: (file: ProductFile) => void;
    isOpen: boolean;
    onCloseMobile: () => void;
}

const FileItem: React.FC<{ file: ProductFile, isActive: boolean, onClick: () => void }> = ({ file, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full text-left p-3 text-sm flex items-center gap-3 transition-colors ${isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
    >
        <span className="text-lg">
            {file.type === 'video' || file.type === 'youtube' ? '🎥' : file.type === 'audio' ? '🎵' : file.type === 'pdf' ? '📄' : '🔗'}
        </span>
        <span className="truncate font-medium">{file.name}</span>
    </button>
);

const ModuleItem: React.FC<{ module: CourseModule, activeFile: ProductFile | null, onSelectFile: (file: ProductFile) => void, depth?: number }> = ({ module, activeFile, onSelectFile, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    // Check if module contains the active file to auto-expand (optional logic)
    // For now default open is fine.

    return (
        <div className="border-b border-gray-100 last:border-0">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                style={{ paddingLeft: `${depth * 1 + 1}rem` }}
            >
                <span className="font-bold text-gray-800 text-sm">{module.title}</span>
                <span className={`text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
            </button>
            
            {isExpanded && (
                <div className="bg-gray-50/50">
                    {module.files.map(file => (
                        <FileItem 
                            key={file.id} 
                            file={file} 
                            isActive={activeFile?.id === file.id} 
                            onClick={() => onSelectFile(file)}
                        />
                    ))}
                    {module.modules?.map(subMod => (
                        <ModuleItem 
                            key={subMod.id} 
                            module={subMod} 
                            activeFile={activeFile} 
                            onSelectFile={onSelectFile}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const CourseSidebar: React.FC<CourseSidebarProps> = ({ modules, activeFile, onSelectFile, isOpen, onCloseMobile }) => {
    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onCloseMobile}
            ></div>

            {/* Sidebar */}
            <aside className={`
                fixed md:absolute inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-700">Course Content</h2>
                    <button onClick={onCloseMobile} className="md:hidden text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {modules.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No content available.</div>
                    ) : (
                        modules.map(module => (
                            <ModuleItem 
                                key={module.id} 
                                module={module} 
                                activeFile={activeFile} 
                                onSelectFile={(file) => {
                                    onSelectFile(file);
                                    if (window.innerWidth < 768) onCloseMobile();
                                }} 
                            />
                        ))
                    )}
                </div>
            </aside>
        </>
    );
};

export default CourseSidebar;
