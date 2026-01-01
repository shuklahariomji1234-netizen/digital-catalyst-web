import React, { useState, useRef, useEffect } from 'react';
import { Product, ProductWithRating, ProductFile, CourseModule, ProductFileType, Coupon, User, WebsiteSettings } from '../../App';
import NewProductEmailPreviewModal from './NewProductEmailPreviewModal';
import { BookOpen, Link as LinkIcon } from 'lucide-react'; // Added Icons

// --- HELPERS FOR RECURSIVE UPDATES ---
const recursiveUpdateModule = (
    modules: CourseModule[], 
    targetId: string, 
    updateFn: (module: CourseModule) => CourseModule
): CourseModule[] => {
    return modules.map(module => {
        if (module.id === targetId) {
            return updateFn(module);
        }
        if (module.modules && module.modules.length > 0) {
            return { 
                ...module, 
                modules: recursiveUpdateModule(module.modules, targetId, updateFn) 
            };
        }
        return module;
    });
};

const recursiveAddSubModule = (
    modules: CourseModule[], 
    parentId: string | null, 
    newModule: CourseModule
): CourseModule[] => {
    if (parentId === null) return [...modules, newModule];
    return modules.map(module => {
        if (module.id === parentId) {
            const currentModules = Array.isArray(module.modules) ? module.modules : [];
            return { ...module, modules: [...currentModules, newModule] };
        }
        if (module.modules && module.modules.length > 0) {
            return { ...module, modules: recursiveAddSubModule(module.modules, parentId, newModule) };
        }
        return module;
    });
};

const recursiveDeleteModule = (
    modules: CourseModule[], 
    targetId: string
): CourseModule[] => {
    return modules.filter(m => m.id !== targetId).map(module => {
        if (module.modules && module.modules.length > 0) {
            return { ...module, modules: recursiveDeleteModule(module.modules, targetId) };
        }
        return module;
    });
};

const recursiveFileUpdate = (
    modules: CourseModule[], 
    moduleId: string, 
    updateCallback: (files: ProductFile[]) => ProductFile[]
): CourseModule[] => {
    if (!modules) return [];
    return modules.map(module => {
        if (module.id === moduleId) {
            const currentFiles = Array.isArray(module.files) ? module.files : [];
            return { ...module, files: updateCallback(currentFiles) };
        }
        if (module.modules && module.modules.length > 0) {
            return { ...module, modules: recursiveFileUpdate(module.modules, moduleId, updateCallback) };
        }
        return module;
    });
};

const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// --- ADD CONTENT MODAL COMPONENT ---
const AddContentModal: React.FC<{ 
    onSave: (file: Omit<ProductFile, 'id'>) => void; 
    onClose: () => void; 
    initialData?: ProductFile | null; 
}> = ({ onSave, onClose, initialData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadConfig, setUploadConfig] = useState<{type: ProductFileType, accept: string} | null>(null);
    const [view, setView] = useState<'selection' | 'form'>('selection');
    const [formState, setFormState] = useState<{type: ProductFileType, url: string, name: string} | null>(
        initialData 
            ? { type: initialData.type, url: initialData.url, name: initialData.name } 
            : null
    );
    const [isUploading, setIsUploading] = useState(false);
    const [fileSizeError, setFileSizeError] = useState<string | null>(null);

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileSizeError(null);
        if (e.target.files && e.target.files[0] && uploadConfig) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                setFileSizeError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max limit is 5MB.`);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setIsUploading(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setFormState({
                        name: file.name,
                        type: uploadConfig.type,
                        url: event.target.result as string
                    });
                    setView('form');
                    setIsUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
        setUploadConfig(null);
    };

    const triggerFileUpload = (type: ProductFileType, accept: string) => { 
        setFileSizeError(null);
        setUploadConfig({ type, accept }); 
        setTimeout(() => fileInputRef.current?.click(), 0);
    };

    const showLinkForm = (type: ProductFileType) => { 
        setFormState(prev => ({ type, url: '', name: prev?.name || (type === 'youtube' ? 'YouTube Video' : '') })); 
        setView('form'); 
    };

    const handleSaveClick = () => { 
        if (formState?.url && formState?.name) { 
            onSave({ name: formState.name, type: formState.type, url: formState.url }); 
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[120] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-pop-in">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
                 <h3 className="text-2xl font-bold text-center mb-6 text-slate-800">{initialData ? 'Edit Content' : 'Add Content'}</h3>
                 {fileSizeError && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{fileSizeError}</div>}
                 {isUploading ? (
                    <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p>Uploading...</p></div>
                 ) : view === 'selection' ? (
                    <div className="grid gap-3">
                        <button onClick={() => triggerFileUpload('pdf', '.pdf')} className="p-4 border rounded-xl hover:bg-blue-50 text-left flex gap-4 items-center font-semibold text-gray-700"><span className="text-2xl">📄</span> Upload PDF Document</button>
                        <button onClick={() => triggerFileUpload('video', 'video/*')} className="p-4 border rounded-xl hover:bg-blue-50 text-left flex gap-4 items-center font-semibold text-gray-700"><span className="text-2xl">🎥</span> Upload Video (MP4)</button>
                        <button onClick={() => showLinkForm('youtube')} className="p-4 border rounded-xl hover:bg-blue-50 text-left flex gap-4 items-center font-semibold text-gray-700"><span className="text-2xl">▶️</span> Add YouTube Link</button>
                        <button onClick={() => showLinkForm('link')} className="p-4 border rounded-xl hover:bg-blue-50 text-left flex gap-4 items-center font-semibold text-gray-700"><span className="text-2xl">🔗</span> External Link</button>
                    </div>
                 ) : (
                    <div className="space-y-5">
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Title / Name</label><input value={formState?.name || ''} onChange={e => setFormState(prev => prev ? {...prev, name: e.target.value} : null)} placeholder="Title / Name" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">URL or File Data</label><input value={formState?.url || ''} onChange={e => setFormState(prev => prev ? {...prev, url: e.target.value} : null)} placeholder="URL or File Status" disabled={formState?.url.startsWith('data:')} className="w-full p-3 border rounded-lg font-mono text-sm bg-gray-50" /></div>
                        <div className="flex gap-3 pt-4 border-t">
                            <button onClick={() => setView('selection')} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Back</button>
                            <button onClick={handleSaveClick} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">Save</button>
                        </div>
                    </div>
                 )}
                 <input type="file" ref={fileInputRef} className="hidden" accept={uploadConfig?.accept} onChange={handleFileSelected} />
            </div>
        </div>
    );
};

// --- RECURSIVE MODULE LIST COMPONENT ---
const RecursiveModuleList: React.FC<{
    modules: CourseModule[];
    onUpdate: (id: string, fields: Partial<CourseModule>) => void;
    onDelete: (id: string) => void;
    onAddSub: (parentId: string) => void;
    onAddContent: (moduleId: string) => void;
    onEditContent: (moduleId: string, file: ProductFile) => void;
    onDeleteFile: (moduleId: string, fileId: string) => void;
    onUploadFile: (moduleId: string, fileId: string) => void;
    level?: number;
}> = ({ modules, onUpdate, onDelete, onAddSub, onAddContent, onEditContent, onDeleteFile, onUploadFile, level = 0 }) => {
    return (
        <div className={`space-y-4 ${level > 0 ? 'ml-6 mt-4 border-l-2 border-gray-200 pl-4' : ''}`}>
            {modules.map((module) => (
                <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50 hover:shadow-md transition-all">
                    <div className="p-3 bg-gray-100 border-b flex justify-between items-center gap-2">
                        <div className="flex-1">
                            <input className="bg-transparent font-bold text-gray-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 px-2 py-1 rounded w-full border border-transparent hover:border-gray-300 transition-colors" value={module.title} onChange={(e) => onUpdate(module.id, { title: e.target.value })} placeholder="Module Title" />
                        </div>
                         <div className="flex items-center gap-1">
                            <button onClick={() => onAddSub(module.id)} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 mr-2">+ Sub</button>
                            <button onClick={() => onDelete(module.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                         </div>
                    </div>
                    <div className="px-3 py-2 bg-white border-b border-gray-100 flex flex-wrap gap-4 text-xs sm:text-sm items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={module.isLocked || false} onChange={e => onUpdate(module.id, { isLocked: e.target.checked })} className="rounded text-orange-500 focus:ring-orange-500" />
                            <span className="text-slate-600 font-medium">Lock Module</span>
                        </label>
                        {module.isLocked && (
                            <>
                                <input placeholder="Unlock Price (₹)" value={module.individualPrice || ''} onChange={e => onUpdate(module.id, { individualPrice: e.target.value })} className="border rounded px-2 py-1 w-24 bg-gray-50" />
                                <input placeholder="Razorpay Link (Optional)" value={module.paymentLink || ''} onChange={e => onUpdate(module.id, { paymentLink: e.target.value })} className="border rounded px-2 py-1 w-32 bg-gray-50 flex-1" />
                            </>
                        )}
                    </div>
                    <div className="p-3 space-y-2">
                        {module.files.map((file) => (
                            <div key={file.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white p-3 rounded border border-gray-100 shadow-sm group">
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <select value={file.type} onChange={(e) => onEditContent(module.id, { ...file, type: e.target.value as ProductFileType })} className="text-xs border rounded p-1.5 bg-gray-50 font-medium text-gray-600">
                                        <option value="video">Video</option><option value="youtube">YouTube</option><option value="pdf">PDF</option><option value="link">Link</option>
                                    </select>
                                    <input value={file.name} onChange={(e) => onEditContent(module.id, { ...file, name: e.target.value })} className="flex-1 text-sm border rounded p-1.5 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Lesson Name" />
                                </div>
                                <div className="flex gap-2 w-full">
                                    <div className="flex-1 relative">
                                        <input value={file.url} onChange={(e) => onEditContent(module.id, { ...file, url: e.target.value })} className="w-full text-xs border rounded p-1.5 font-mono text-gray-600 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" placeholder={file.type === 'youtube' ? "YouTube URL" : "File URL or Upload ->"} />
                                    </div>
                                    <button type="button" onClick={() => onUploadFile(module.id, file.id)} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-600 px-3 py-1 rounded cursor-pointer text-xs font-bold flex items-center transition-colors">Upload</button>
                                    <button onClick={() => onDeleteFile(module.id, file.id)} className="text-gray-300 hover:text-red-500 transition-colors px-1 font-bold text-lg">&times;</button>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => onAddContent(module.id)} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">+ Add Lesson</button>
                    </div>
                    <RecursiveModuleList modules={module.modules || []} onUpdate={onUpdate} onDelete={onDelete} onAddSub={onAddSub} onAddContent={onAddContent} onEditContent={onEditContent} onDeleteFile={onDeleteFile} onUploadFile={onUploadFile} level={level + 1} />
                </div>
            ))}
        </div>
    );
};

// --- MAIN PRODUCT MANAGEMENT COMPONENT ---
const ProductManagement: React.FC<{
    products: ProductWithRating[];
    users: User[];
    coupons: Coupon[];
    onAddProduct: (product: Omit<Product, 'id'>) => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (id: number) => void;
    settings: WebsiteSettings;
    onManageContent: (product: Product) => void; // <--- MERGED: NEW PROP
}> = ({ products, users, coupons, onAddProduct, onUpdateProduct, onDeleteProduct, settings, onManageContent }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'content' | 'payment'>('details');
    const [showEmailPreview, setShowEmailPreview] = useState<ProductWithRating | null>(null);
    const [contentModal, setContentModal] = useState<{ isOpen: boolean; moduleId: string | null; fileId: string | null; file: ProductFile | null }>({
        isOpen: false, moduleId: null, fileId: null, file: null
    });
    
    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        title: '', price: '', salePrice: '', category: 'Online Courses', description: '', longDescription: '', 
        features: [], images: [], inStock: true, isVisible: true, isFree: false, paymentLink: '', 
        courseContent: [], sku: '', department: 'Unisex', couponCode: '',
        fileUrl: '', // <--- MERGED: State for PDF URL
        paymentConfig: { enabled: true, customApiKey: '', successMessage: '' }
    });

    const [featureInput, setFeatureInput] = useState('');
    const [imageInput, setImageInput] = useState('');

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            title: '', price: '', salePrice: '', category: 'Online Courses', description: '', longDescription: '', 
            features: [], images: [], inStock: true, isVisible: true, isFree: false, paymentLink: '', 
            courseContent: [], sku: '', department: 'Unisex', couponCode: '',
            fileUrl: '', // Reset URL
            paymentConfig: { enabled: true, customApiKey: '', successMessage: '' }
        });
        setActiveTab('details');
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({ ...product, courseContent: product.courseContent || [], paymentConfig: product.paymentConfig || { enabled: true, customApiKey: '', successMessage: '' } });
        setActiveTab('details');
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.title || !formData.price) return alert("Title and Price are required");
        const productData = {
            ...formData,
            imageSeed: formData.imageSeed || `seed-${Date.now()}`,
            title: formData.title!,
            price: formData.price!,
            description: formData.description || '',
            longDescription: formData.longDescription || '',
            features: formData.features || [],
            images: formData.images || [],
            paymentLink: formData.paymentLink || '',
            courseContent: formData.courseContent || [],
            sku: formData.sku || '',
            department: formData.department || 'Unisex',
            fileUrl: formData.fileUrl || '', // <--- MERGED: Save PDF URL
            // Automatically mark as PDF format if category is E-books
            fileFormat: formData.category === 'E-books' ? 'pdf' : (formData.fileFormat || 'video'), 
            paymentConfig: formData.paymentConfig || { enabled: true }
        } as Product;

        if (editingProduct) {
            onUpdateProduct({ ...productData, id: editingProduct.id });
        } else {
            onAddProduct(productData);
            setTimeout(() => {
                const mockNewProduct = { ...productData, id: Date.now(), rating: 0, reviewCount: 0, calculatedRating: 0 } as ProductWithRating;
                setShowEmailPreview(mockNewProduct);
            }, 500);
        }
        setIsModalOpen(false);
    };

    // ... (All Helper functions like recursive updates remain same as original file) ...
    const handleModuleUpdate = (id: string, fields: Partial<CourseModule>) => {
        setFormData(prev => ({ ...prev, courseContent: recursiveUpdateModule(prev.courseContent || [], id, (module) => ({ ...module, ...fields })) }));
    };
    const handleModuleDelete = (id: string) => { setFormData(prev => ({ ...prev, courseContent: recursiveDeleteModule(prev.courseContent || [], id) })); };
    const handleAddModule = (parentId: string | null) => { const newModule = { id: `mod-${Date.now()}`, title: 'New Module', files: [], modules: [] }; setFormData(prev => ({ ...prev, courseContent: recursiveAddSubModule(prev.courseContent || [], parentId, newModule) })); };
    const handleAddFile = (moduleId: string) => { const newFile = { id: `file-${Date.now()}`, name: '', type: 'video' as ProductFileType, url: '' }; setFormData(prev => ({ ...prev, courseContent: recursiveFileUpdate(prev.courseContent || [], moduleId, (files) => [...files, newFile]) })); };
    const handleEditFile = (moduleId: string, file: ProductFile) => { setFormData(prev => ({ ...prev, courseContent: recursiveFileUpdate(prev.courseContent || [], moduleId, (files) => files.map(f => f.id === file.id ? file : f)) })); };
    const handleDeleteFile = (moduleId: string, fileId: string) => { setFormData(prev => ({ ...prev, courseContent: recursiveFileUpdate(prev.courseContent || [], moduleId, (files) => files.filter(f => f.id !== fileId)) })); };
    const handleOpenUploadModal = (moduleId: string, fileId: string) => {
        let foundFile: ProductFile | null = null;
        const findFile = (modules: CourseModule[]) => {
            for (const m of modules) {
                const f = m.files.find(f => f.id === fileId);
                if (f) { foundFile = f; return; }
                if (m.modules) findFile(m.modules);
            }
        };
        findFile(formData.courseContent || []);
        setContentModal({ isOpen: true, moduleId, fileId, file: foundFile });
    };
    const handleContentModalSave = (fileData: Omit<ProductFile, 'id'>) => {
        const { moduleId, fileId } = contentModal;
        if (moduleId && fileId) {
            setFormData(prev => ({ ...prev, courseContent: recursiveFileUpdate(prev.courseContent || [], moduleId, (files) => files.map(f => f.id === fileId ? { ...f, ...fileData } : f)) }));
        }
        setContentModal({ isOpen: false, moduleId: null, fileId: null, file: null });
    };
    const addFeature = () => { if (featureInput.trim()) { setFormData(prev => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] })); setFeatureInput(''); } };
    const removeFeature = (index: number) => setFormData(prev => ({ ...prev, features: prev.features?.filter((_, i) => i !== index) }));
    const addImageUrl = () => { if (imageInput.trim()) { setFormData(prev => ({ ...prev, images: [...(prev.images || []), imageInput.trim()] })); setImageInput(''); } };
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 500000) return alert("Image too large! Max 500KB.");
            const base64 = await convertFileToBase64(file);
            setFormData(prev => ({ ...prev, images: [...(prev.images || []), base64] }));
        }
    };
    const removeImage = (index: number) => setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Product Inventory</h2>
                <button onClick={openAddModal} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2"><span>+</span> Add Product</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group">
                        <div className="h-40 bg-gray-100 relative">
                            <img src={product.images[0] || `https://picsum.photos/seed/${product.imageSeed}/400/300`} className="w-full h-full object-cover" alt={product.title} />
                            
                            {/* --- MERGED: Top Action Buttons --- */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-90">
                                <button onClick={() => setShowEmailPreview(product)} className="p-2 bg-white rounded-full text-indigo-600 hover:text-indigo-800 shadow-sm" title="Preview Email">📧</button>
                                <button onClick={() => openEditModal(product)} className="p-2 bg-white rounded-full hover:text-blue-600 shadow-sm">✎</button>
                                <button onClick={() => onDeleteProduct(product.id)} className="p-2 bg-white rounded-full hover:text-red-600 shadow-sm">🗑</button>
                            </div>

                            {/* --- MERGED: "Write Notes" Button (Appears if PDF exists) --- */}
                            {product.fileUrl && (
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-max opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onManageContent(product)} 
                                        className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform"
                                    >
                                        <BookOpen size={14} className="text-yellow-400" /> Write Notes
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-800 line-clamp-1">{product.title}</h3>
                            <div className="flex justify-between items-center mt-2 text-sm">
                                <span className="text-gray-600 font-mono">{product.price}</span>
                                <div className="flex gap-2">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{product.category}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.inStock ? 'In Stock' : 'Out'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-start pt-10 px-4 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mb-10 relative animate-scale-in-up flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                                <div className="flex gap-4 mt-4">
                                    <button onClick={() => setActiveTab('details')} className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>Basic Details</button>
                                    <button onClick={() => setActiveTab('content')} className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'content' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>Course Curriculum</button>
                                    <button onClick={() => setActiveTab('payment')} className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'payment' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>Payment Settings</button>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl absolute top-4 right-4">&times;</button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            {activeTab === 'details' ? (
                                <>
                                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Title</label><input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="The Ultimate Marketing Guide" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Price (e.g., ₹499)</label><input className="w-full p-2 border rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="₹499" /></div>
                                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Sale Price</label><input className="w-full p-2 border rounded-lg" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} placeholder="₹299" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                            <select className="w-full p-2 border rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                                <option value="Online Courses">Online Courses</option><option value="E-books">E-books</option><option value="Services">Services</option><option value="Templates">Templates</option>
                                            </select>
                                        </div>
                                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Razorpay Link (Optional)</label><input className="w-full p-2 border rounded-lg font-mono text-sm" value={formData.paymentLink} onChange={e => setFormData({...formData, paymentLink: e.target.value})} placeholder="https://rzp.io/..." /></div>
                                    </div>

                                    {/* --- MERGED: PDF URL Input --- */}
                                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                        <label className="block text-sm font-bold text-indigo-900 mb-1 flex items-center gap-2">
                                            <LinkIcon size={16} /> PDF / E-book URL (Direct Link)
                                        </label>
                                        <input 
                                            type="url" 
                                            className="w-full p-2 border border-indigo-200 rounded-lg bg-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                            value={formData.fileUrl || ''} 
                                            onChange={e => setFormData({...formData, fileUrl: e.target.value})}
                                            placeholder="https://your-storage.com/file.pdf" 
                                        />
                                        <p className="text-xs text-indigo-500 mt-1">
                                            Paste a direct link to your PDF. This enables the "Smart Reader" & "Note Writing" features.
                                        </p>
                                    </div>
                                    {/* ----------------------------- */}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-bold text-gray-700 mb-1">SKU</label><input className="w-full p-2 border rounded-lg" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="E-001" /></div>
                                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Department</label><select className="w-full p-2 border rounded-lg" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value as any})}><option value="Unisex">Unisex</option><option value="Men">Men</option><option value="Women">Women</option></select></div>
                                    </div>
                                    <div className="flex gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" /><span className="text-sm font-medium">In Stock</span></label>
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.isVisible} onChange={e => setFormData({...formData, isVisible: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" /><span className="text-sm font-medium">Visible</span></label>
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.isFree} onChange={e => setFormData({...formData, isFree: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" /><span className="text-sm font-medium">Free</span></label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Images</label>
                                        <div className="flex gap-2 mb-2">
                                            <input className="flex-1 p-2 border rounded-lg text-sm" value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="Paste Image URL" />
                                            <label className="bg-gray-200 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 cursor-pointer text-sm flex items-center"><span>Upload</span><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></label>
                                            <button onClick={addImageUrl} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-200 text-sm">Add URL</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">{formData.images?.map((img, i) => (<div key={i} className="relative group w-16 h-16"><img src={img} className="w-full h-full object-cover rounded-md border" alt="" /><button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">&times;</button></div>))}</div>
                                    </div>
                                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Short Description</label><textarea className="w-full p-2 border rounded-lg h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Long Description</label><textarea className="w-full p-2 border rounded-lg h-32 font-mono text-sm" value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} /></div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Linked Coupon Code (Optional)</label>
                                        <select className="w-full p-2 border rounded-lg" value={formData.couponCode || ''} onChange={e => setFormData({...formData, couponCode: e.target.value})}><option value="">-- No Coupon --</option>{coupons.map(c => (<option key={c.id} value={c.code}>{c.code} ({c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`})</option>))}</select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Key Features</label>
                                        <div className="flex gap-2 mb-2"><input className="flex-1 p-2 border rounded-lg" value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="Add feature" onKeyDown={e => e.key === 'Enter' && addFeature()} /><button onClick={addFeature} className="bg-gray-200 px-4 py-2 rounded-lg font-bold hover:bg-gray-300">Add</button></div>
                                        <ul className="space-y-1">{formData.features?.map((feat, i) => (<li key={i} className="flex justify-between text-sm bg-gray-50 p-2 rounded"><span>{feat}</span><button onClick={() => removeFeature(i)} className="text-red-500 font-bold">&times;</button></li>))}</ul>
                                    </div>
                                </>
                            ) : activeTab === 'content' ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div><h3 className="font-bold text-gray-700">Course Curriculum</h3><p className="text-xs text-gray-500">Organize content into modules and lessons.</p></div>
                                        <button onClick={() => handleAddModule(null)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm">+ Add Module</button>
                                    </div>
                                    {(!formData.courseContent || formData.courseContent.length === 0) && <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"><p className="text-gray-400 font-medium">No content yet.</p></div>}
                                    <RecursiveModuleList modules={formData.courseContent || []} onUpdate={handleModuleUpdate} onDelete={handleModuleDelete} onAddSub={handleAddModule} onAddContent={handleAddFile} onEditContent={handleEditFile} onDeleteFile={handleDeleteFile} onUploadFile={handleOpenUploadModal} />
                                </div>
                            ) : (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-blue-800">Payment Configuration</h3>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={formData.paymentConfig?.enabled} onChange={e => setFormData(prev => ({ ...prev, paymentConfig: { ...prev.paymentConfig, enabled: e.target.checked } }))} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-700">Enable Purchases</span>
                                            </label>
                                        </div>
                                        <p className="text-sm text-blue-600 mb-4">Customize the payment experience specifically for this product.</p>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Custom Razorpay API Key (Optional)</label>
                                                <input 
                                                    className="w-full p-2 border rounded-lg font-mono text-sm" 
                                                    value={formData.paymentConfig?.customApiKey || ''} 
                                                    onChange={e => setFormData(prev => ({ ...prev, paymentConfig: { ...prev.paymentConfig, customApiKey: e.target.value } }))}
                                                    placeholder="rzp_test_..." 
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Leave blank to use the global store API key.</p>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Success Message</label>
                                                <textarea 
                                                    className="w-full p-2 border rounded-lg" 
                                                    value={formData.paymentConfig?.successMessage || ''} 
                                                    onChange={e => setFormData(prev => ({ ...prev, paymentConfig: { ...prev.paymentConfig, successMessage: e.target.value } }))}
                                                    placeholder="Thank you for your purchase!"
                                                    rows={2}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Redirect URL (Optional)</label>
                                                <input 
                                                    className="w-full p-2 border rounded-lg" 
                                                    value={formData.paymentConfig?.redirectUrl || ''} 
                                                    onChange={e => setFormData(prev => ({ ...prev, paymentConfig: { ...prev.paymentConfig, redirectUrl: e.target.value } }))}
                                                    placeholder="https://your-site.com/thank-you" 
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Redirect users to a custom page after successful payment.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all active:scale-95">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showEmailPreview && <NewProductEmailPreviewModal product={showEmailPreview} relatedProducts={products.slice(0, 3)} users={users} onClose={() => setShowEmailPreview(null)} />}
            
            {contentModal.isOpen && (
                <AddContentModal 
                    onSave={handleContentModalSave} 
                    onClose={() => setContentModal({ isOpen: false, moduleId: null, fileId: null, file: null })} 
                    initialData={contentModal.file}
                />
            )}
        </div>
    );
};

export default ProductManagement;