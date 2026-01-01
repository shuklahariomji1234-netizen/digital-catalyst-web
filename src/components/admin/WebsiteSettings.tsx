
import React, { useState, useEffect } from 'react';
import { WebsiteSettings, HomepageSection, NewsArticle, Announcement, SubscriptionTier, Product, ThemePalette } from '../../App';
import { ServiceItem } from '../Services';
import { FaqItem } from '../Faq';
import { UpcomingFeatureItem } from '../UpcomingFeatures';

// Define theme presets locally
const themes: Record<string, { name: string; palette: ThemePalette }> = {
    default: {
        name: 'Default',
        palette: {
            primaryColor: '#02042b',
            accentColor: '#528ff0',
            backgroundColor: '#f9fafb',
            textColor: '#1f2937',
            textMutedColor: '#6b7280',
        },
    },
    midnight: {
        name: 'Midnight',
        palette: {
            primaryColor: '#38bdf8', // light-blue-400
            accentColor: '#6366f1', // indigo-500
            backgroundColor: '#0f172a', // slate-900
            textColor: '#e2e8f0', // slate-200
            textMutedColor: '#94a3b8', // slate-400
        },
    },
    sunset: {
        name: 'Sunset',
        palette: {
            primaryColor: '#f97316', // orange-600
            accentColor: '#f59e0b', // amber-500
            backgroundColor: '#fff7ed', // orange-50
            textColor: '#44403c', // stone-700
            textMutedColor: '#78716c', // stone-500
        },
    },
    forest: {
        name: 'Forest',
        palette: {
            primaryColor: '#16a34a', // green-600
            accentColor: '#22c55e', // green-500
            backgroundColor: '#f0fdf4', // green-50
            textColor: '#1e3a8a', // blue-900
            textMutedColor: '#4338ca', // indigo-700
        },
    },
    rose: {
        name: 'Rose',
        palette: {
            primaryColor: '#db2777', // pink-600
            accentColor: '#e11d48', // rose-600
            backgroundColor: '#fff1f2', // rose-50
            textColor: '#500724', // rose-950
            textMutedColor: '#831843', // pink-900
        },
    },
};

const sectionNames: Record<HomepageSection['id'], string> = {
    hero: 'Hero Section',
    purchased: 'My Purchases',
    topRated: 'Top Rated Products',
    allProducts: 'All Products Showcase',
    services: 'Services Section',
    about: 'About Us Section',
    trust: 'Trust Badges',
    faq: 'FAQ Section',
    upcoming: 'Upcoming Features',
    news: 'Latest News',
};

const TabButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`py-2 px-4 font-semibold text-sm rounded-lg transition-colors whitespace-nowrap ${
            isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
    >
        {label}
    </button>
);

const FormRow: React.FC<{ label: string, children: React.ReactNode, description?: string }> = ({ label, children, description }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start py-4 border-b">
        <div className="md:col-span-1">
            <label className="font-semibold text-gray-700">{label}</label>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="md:col-span-2">{children}</div>
    </div>
);

// ... (ServiceManagement, FaqManagement, UpcomingFeatureManagement, NewsArticleManagement, AnnouncementManagement - UNCHANGED) ...
// CRUD component for Services
const ServiceManagement: React.FC<{ services: ServiceItem[], onUpdate: (services: ServiceItem[]) => void }> = ({ services, onUpdate }) => {
    const [editing, setEditing] = useState<ServiceItem | null>(null);
    const handleSave = (service: ServiceItem) => {
        if (service.id) {
            onUpdate(services.map(s => s.id === service.id ? service : s));
        } else {
            onUpdate([...services, { ...service, id: Date.now() }]);
        }
        setEditing(null);
    };
    const handleDelete = (id: number) => onUpdate(services.filter(s => s.id !== id));
    
    return (
        <div>
            {editing && <ServiceFormModal service={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
            <button onClick={() => setEditing({ id: 0, title: '', description: '' })} className="mb-4 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">+ Add New Service</button>
            <div className="space-y-2">
                {services.map(service => (
                    <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                        <div>
                            <p className="font-bold">{service.title}</p>
                            <p className="text-sm text-gray-500">{service.description}</p>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => setEditing(service)} className="text-blue-600 font-semibold text-sm">Edit</button>
                            <button onClick={() => handleDelete(service.id)} className="text-red-600 font-semibold text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const ServiceFormModal: React.FC<{ service: ServiceItem, onSave: (s: ServiceItem) => void, onCancel: () => void }> = ({ service, onSave, onCancel }) => {
    const [form, setForm] = useState(service);
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="font-bold text-lg mb-4">{service.id ? 'Edit' : 'Add'} Service</h3>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="w-full p-2 border rounded mb-2" />
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full p-2 border rounded mb-4" rows={3}></textarea>
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={() => onSave(form)} className="bg-primary text-white px-4 py-2 rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
};

const FaqManagement: React.FC<{ faqs: FaqItem[], onUpdate: (faqs: FaqItem[]) => void }> = ({ faqs, onUpdate }) => {
    const [editing, setEditing] = useState<FaqItem | null>(null);
    const handleSave = (faq: FaqItem) => {
        if (faq.id) {
            onUpdate(faqs.map(f => f.id === faq.id ? faq : f));
        } else {
            onUpdate([...faqs, { ...faq, id: Date.now() }]);
        }
        setEditing(null);
    };
    const handleDelete = (id: number) => onUpdate(faqs.filter(f => f.id !== id));

    return (
        <div>
            {editing && <FaqFormModal faq={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
            <button onClick={() => setEditing({ id: 0, question: '', answer: '' })} className="mb-4 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">+ Add New FAQ</button>
            <div className="space-y-2">
                {faqs.map(faq => (
                    <div key={faq.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                            <p className="font-bold">{faq.question}</p>
                            <p className="text-sm text-gray-500 mt-1">{faq.answer}</p>
                        </div>
                        <div className="space-x-2 flex-shrink-0 ml-4">
                            <button onClick={() => setEditing(faq)} className="text-blue-600 font-semibold text-sm">Edit</button>
                            <button onClick={() => handleDelete(faq.id)} className="text-red-600 font-semibold text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const FaqFormModal: React.FC<{ faq: FaqItem, onSave: (f: FaqItem) => void, onCancel: () => void }> = ({ faq, onSave, onCancel }) => {
    const [form, setForm] = useState(faq);
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="font-bold text-lg mb-4">{faq.id ? 'Edit' : 'Add'} FAQ</h3>
                <input value={form.question} onChange={e => setForm({...form, question: e.target.value})} placeholder="Question" className="w-full p-2 border rounded mb-2" />
                <textarea value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} placeholder="Answer" className="w-full p-2 border rounded mb-4" rows={4}></textarea>
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={() => onSave(form)} className="bg-primary text-white px-4 py-2 rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
};

const UpcomingFeatureManagement: React.FC<{ features: UpcomingFeatureItem[], onUpdate: (features: UpcomingFeatureItem[]) => void }> = ({ features, onUpdate }) => {
    const [editing, setEditing] = useState<UpcomingFeatureItem | null>(null);
    const handleSave = (feature: UpcomingFeatureItem) => {
        if (feature.id) {
            onUpdate(features.map(f => f.id === feature.id ? feature : f));
        } else {
            onUpdate([...features, { ...feature, id: Date.now() }]);
        }
        setEditing(null);
    };
    const handleDelete = (id: number) => onUpdate(features.filter(f => f.id !== id));

    return (
        <div>
            {editing && <UpcomingFeatureFormModal feature={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
            <button onClick={() => setEditing({ id: 0, title: '', description: '', status: 'Coming Soon', icon: 'rocket' })} className="mb-4 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">+ Add New Feature</button>
            <div className="space-y-2">
                {features.map(feature => (
                    <div key={feature.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                            <p className="font-bold">{feature.title} <span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full ml-2">{feature.status}</span></p>
                            <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Icon: {feature.icon}</p>
                        </div>
                        <div className="space-x-2 flex-shrink-0 ml-4">
                            <button onClick={() => setEditing(feature)} className="text-blue-600 font-semibold text-sm">Edit</button>
                            <button onClick={() => handleDelete(feature.id)} className="text-red-600 font-semibold text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const UpcomingFeatureFormModal: React.FC<{ feature: UpcomingFeatureItem, onSave: (f: UpcomingFeatureItem) => void, onCancel: () => void }> = ({ feature, onSave, onCancel }) => {
    const [form, setForm] = useState(feature);
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="font-bold text-lg mb-4">{feature.id ? 'Edit' : 'Add'} Feature</h3>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="w-full p-2 border rounded mb-2" />
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full p-2 border rounded mb-2" rows={3}></textarea>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value as UpcomingFeatureItem['status']})} className="w-full p-2 border rounded mb-2">
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="In Development">In Development</option>
                    <option value="Beta">Beta</option>
                </select>
                 <input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="Icon name (e.g., rocket)" className="w-full p-2 border rounded mb-4" />
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={() => onSave(form)} className="bg-primary text-white px-4 py-2 rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
};

const NewsArticleManagement: React.FC<{ articles: NewsArticle[], onUpdate: (articles: NewsArticle[]) => void }> = ({ articles, onUpdate }) => {
    const [editing, setEditing] = useState<NewsArticle | null>(null);
    const handleSave = (article: NewsArticle) => {
        if (article.id) {
            onUpdate(articles.map(a => a.id === article.id ? article : a));
        } else {
            onUpdate([...articles, { ...article, id: Date.now() }]);
        }
        setEditing(null);
    };
    const handleDelete = (id: number) => onUpdate(articles.filter(a => a.id !== id));

    return (
        <div>
            {editing && <NewsArticleFormModal article={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
            <button onClick={() => setEditing({ id: 0, title: '', category: '', date: new Date().toISOString().split('T')[0], imageSeed: '', excerpt: '', content: '' })} className="mb-4 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">+ Add New Blog Post</button>
            <div className="space-y-2">
                {articles.map(article => (
                    <div key={article.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                            <p className="font-bold">{article.title} <span className="text-xs font-normal text-gray-500 ml-2">{new Date(article.date).toLocaleDateString()}</span></p>
                            <p className="text-sm text-gray-500 mt-1">{article.excerpt}</p>
                        </div>
                        <div className="space-x-2 flex-shrink-0 ml-4">
                            <button onClick={() => setEditing(article)} className="text-blue-600 font-semibold text-sm">Edit</button>
                            <button onClick={() => handleDelete(article.id)} className="text-red-600 font-semibold text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const NewsArticleFormModal: React.FC<{ article: NewsArticle, onSave: (a: NewsArticle) => void, onCancel: () => void }> = ({ article, onSave, onCancel }) => {
    const [form, setForm] = useState(article);
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 className="font-bold text-lg mb-4">{article.id ? 'Edit' : 'Add'} Blog Post</h3>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="w-full p-2 border rounded mb-2" />
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Category (e.g., SEO)" className="w-full p-2 border rounded" />
                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <input value={form.imageSeed} onChange={e => setForm({...form, imageSeed: e.target.value})} placeholder="Image Seed (for picsum.photos)" className="w-full p-2 border rounded mb-2" />
                <textarea value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} placeholder="Excerpt/Summary" className="w-full p-2 border rounded mb-2" rows={2}></textarea>
                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Full Content (Markdown supported)" className="w-full p-2 border rounded mb-4" rows={6}></textarea>
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={() => onSave(form)} className="bg-primary text-white px-4 py-2 rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
};

const AnnouncementManagement: React.FC<{ announcements: Announcement[], onUpdate: (announcements: Announcement[]) => void }> = ({ announcements, onUpdate }) => {
    const [editing, setEditing] = useState<Announcement | null>(null);
    const handleSave = (announcement: Announcement) => {
        if (announcement.id) {
            onUpdate(announcements.map(a => a.id === announcement.id ? announcement : a));
        } else {
            onUpdate([...announcements, { ...announcement, id: Date.now() }]);
        }
        setEditing(null);
    };
    const handleDelete = (id: number) => onUpdate(announcements.filter(a => a.id !== id));

    return (
        <div>
            {editing && <AnnouncementFormModal announcement={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
            <button onClick={() => setEditing({ id: 0, title: '', date: new Date().toISOString().split('T')[0], content: '' })} className="mb-4 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">+ Add New Announcement</button>
            <div className="space-y-2">
                {announcements.map(announcement => (
                    <div key={announcement.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                            <p className="font-bold">{announcement.title} <span className="text-xs font-normal text-gray-500 ml-2">{new Date(announcement.date).toLocaleDateString()}</span></p>
                            <p className="text-sm text-gray-500 mt-1">{announcement.content}</p>
                        </div>
                        <div className="space-x-2 flex-shrink-0 ml-4">
                            <button onClick={() => setEditing(announcement)} className="text-blue-600 font-semibold text-sm">Edit</button>
                            <button onClick={() => handleDelete(announcement.id)} className="text-red-600 font-semibold text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const AnnouncementFormModal: React.FC<{ announcement: Announcement, onSave: (a: Announcement) => void, onCancel: () => void }> = ({ announcement, onSave, onCancel }) => {
    const [form, setForm] = useState(announcement);
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="font-bold text-lg mb-4">{announcement.id ? 'Edit' : 'Add'} Announcement</h3>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="w-full p-2 border rounded mb-2" />
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full p-2 border rounded mb-2" />
                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Content" className="w-full p-2 border rounded mb-4" rows={5}></textarea>
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={() => onSave(form)} className="bg-primary text-white px-4 py-2 rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
};

// --- NEW: Subscription Management ---
const SubscriptionManagement: React.FC<{ tiers: SubscriptionTier[], products: Product[], onUpdate: (tiers: SubscriptionTier[]) => void }> = ({ tiers, products, onUpdate }) => {
    const [editing, setEditing] = useState<SubscriptionTier | null>(null);

    const handleSave = (tier: SubscriptionTier) => {
        if (tiers.find(t => t.id === tier.id)) {
            onUpdate(tiers.map(t => t.id === tier.id ? tier : t));
        } else {
            onUpdate([...tiers, tier]);
        }
        setEditing(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Delete this subscription tier?")) {
            onUpdate(tiers.filter(t => t.id !== id));
        }
    };

    return (
        <div>
            {editing && <SubscriptionFormModal tier={editing} products={products} onSave={handleSave} onCancel={() => setEditing(null)} />}
            <button 
                onClick={() => setEditing({ id: `tier-${Date.now()}`, name: '', price: '', description: '', features: [], paymentLink: '', productAccess: 'none', accessProductIds: [] })} 
                className="mb-6 bg-indigo-600 text-white font-semibold px-5 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
                + Create New Plan
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiers.map(tier => (
                    <div key={tier.id} className={`relative bg-white p-6 rounded-xl shadow-sm border-2 ${tier.isRecommended ? 'border-indigo-500' : 'border-slate-100'}`}>
                        {tier.isRecommended && <span className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">Recommended</span>}
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-slate-800">{tier.name}</h3>
                            <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{tier.price}</p>
                            <p className="text-sm text-slate-500 mt-2 h-10 overflow-hidden">{tier.description}</p>
                        </div>
                        <div className="mb-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded border ${tier.productAccess === 'all' ? 'bg-green-50 text-green-700 border-green-200' : tier.productAccess === 'specific' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                {tier.productAccess === 'all' ? 'Unlocks ALL Products' : tier.productAccess === 'specific' ? `Unlocks ${tier.accessProductIds?.length || 0} Products` : 'No Product Access'}
                            </span>
                        </div>
                        <ul className="space-y-2 mb-6">
                            {tier.features.slice(0, 3).map((feat, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                                    <span className="text-green-500">✓</span> {feat}
                                </li>
                            ))}
                            {tier.features.length > 3 && <li className="text-xs text-slate-400 italic">...and {tier.features.length - 3} more</li>}
                        </ul>
                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                            <button onClick={() => setEditing(tier)} className="text-blue-600 font-semibold text-sm hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                            <button onClick={() => handleDelete(tier.id)} className="text-red-600 font-semibold text-sm hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SubscriptionFormModal: React.FC<{ tier: SubscriptionTier, products: Product[], onSave: (t: SubscriptionTier) => void, onCancel: () => void }> = ({ tier, products, onSave, onCancel }) => {
    // FIX: Explicitly initialize accessProductIds as empty array if undefined to prevent controlled/uncontrolled input warnings and data loss
    const [form, setForm] = useState<SubscriptionTier>({
        ...tier,
        accessProductIds: tier.accessProductIds || []
    });
    const [featureInput, setFeatureInput] = useState('');

    const addFeature = () => {
        if (featureInput.trim()) {
            setForm(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        setForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
    };

    const toggleProductAccess = (productId: number) => {
        const currentIds = form.accessProductIds || [];
        if (currentIds.includes(productId)) {
            setForm(prev => ({ ...prev, accessProductIds: currentIds.filter(id => id !== productId) }));
        } else {
            setForm(prev => ({ ...prev, accessProductIds: [...currentIds, productId] }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in-up">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-xl text-slate-800">{tier.name ? 'Edit Plan' : 'New Plan'}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Plan Name</label>
                            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="e.g., Pro Plan" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Price (₹)</label>
                            <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="e.g., 299" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2 border rounded-lg" rows={2} placeholder="Short summary..." />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Payment Link</label>
                        <input value={form.paymentLink} onChange={e => setForm({...form, paymentLink: e.target.value})} className="w-full p-2 border rounded-lg font-mono text-sm" placeholder="Razorpay URL" />
                    </div>

                    {/* Advanced Product Access Control */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Product Access</label>
                        <div className="flex gap-4 mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="productAccess" 
                                    checked={form.productAccess === 'all'} 
                                    onChange={() => setForm({...form, productAccess: 'all'})}
                                    className="text-indigo-600"
                                />
                                <span className="text-sm">Unlock ALL Products</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="productAccess" 
                                    checked={form.productAccess === 'specific'} 
                                    onChange={() => setForm({...form, productAccess: 'specific'})}
                                    className="text-indigo-600"
                                />
                                <span className="text-sm">Unlock Specific Products</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="productAccess" 
                                    checked={form.productAccess === 'none'} 
                                    onChange={() => setForm({...form, productAccess: 'none'})}
                                    className="text-indigo-600"
                                />
                                <span className="text-sm">No Product Access</span>
                            </label>
                        </div>

                        {form.productAccess === 'specific' && (
                            <div className="max-h-40 overflow-y-auto border rounded bg-white p-2 space-y-1">
                                {products.map(p => (
                                    <label key={p.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={(form.accessProductIds || []).includes(p.id)} 
                                            onChange={() => toggleProductAccess(p.id)}
                                            className="rounded text-indigo-600"
                                        />
                                        <span className="text-sm truncate">{p.title}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Highlight Color</label>
                        <select value={form.highlightColor || 'blue'} onChange={e => setForm({...form, highlightColor: e.target.value})} className="w-full p-2 border rounded-lg">
                            <option value="blue">Blue</option>
                            <option value="purple">Purple</option>
                            <option value="green">Green</option>
                            <option value="gold">Gold</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={form.isRecommended} onChange={e => setForm({...form, isRecommended: e.target.checked})} className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-slate-700">Mark as Recommended</span>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Features List</label>
                        <div className="flex gap-2 mb-2">
                            <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} className="flex-1 p-2 border rounded-lg" placeholder="Add a feature..." onKeyDown={e => e.key === 'Enter' && addFeature()} />
                            <button onClick={addFeature} className="bg-slate-200 hover:bg-slate-300 px-4 rounded-lg font-bold text-slate-700">Add</button>
                        </div>
                        <ul className="space-y-1 max-h-32 overflow-y-auto bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {form.features.map((feat, i) => (
                                <li key={i} className="flex justify-between items-center bg-white p-2 rounded shadow-sm text-sm">
                                    <span>{feat}</span>
                                    <button onClick={() => removeFeature(i)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button onClick={onCancel} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-colors">Save Plan</button>
                </div>
            </div>
        </div>
    );
};


interface WebsiteSettingsProps {
    settings: WebsiteSettings;
    onSettingsChange: (settings: WebsiteSettings) => void;
    products?: Product[]; // Passed from AdminDashboard
}

const WebsiteSettingsComponent: React.FC<WebsiteSettingsProps> = ({ settings, onSettingsChange, products = [] }) => {
    const [activeTab, setActiveTab] = useState<'theme' | 'layout' | 'content' | 'blog' | 'announcements' | 'subscriptions' | 'services' | 'faq' | 'upcoming' | 'features' | 'animations' | 'validation' | 'apiKeys'>('theme');
    const [localSettings, setLocalSettings] = useState<WebsiteSettings>(settings);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSave = () => {
        onSettingsChange(localSettings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleThemeSelect = (themeName: string) => {
        const selectedPalette = themes[themeName]?.palette;
        if (selectedPalette) {
            setLocalSettings(prev => ({
                ...prev,
                theme: {
                    ...prev.theme,
                    activeTheme: themeName,
                    ...selectedPalette
                }
            }));
        }
    };

    const handleNestedChange = (area: keyof WebsiteSettings, field: string, value: any) => {
        setLocalSettings(prev => ({
            ...prev,
            [area]: {
                ...(prev[area] as any),
                [field]: value,
            }
        }));
    };
    
    const handleLayoutChange = (newLayout: HomepageSection[]) => {
        setLocalSettings(prev => ({ ...prev, layout: newLayout }));
    };
    
    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newLayout = [...localSettings.layout];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newLayout.length) return;
        [newLayout[index], newLayout[newIndex]] = [newLayout[newIndex], newLayout[index]];
        handleLayoutChange(newLayout);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'theme': return (
                <div>
                    <div className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800 mb-4">Theme Presets</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {Object.entries(themes).map(([key, theme]) => (
                                <button
                                    key={key}
                                    onClick={() => handleThemeSelect(key)}
                                    className={`relative p-4 rounded-xl border-2 transition-all ${
                                        localSettings.theme.activeTheme === key 
                                            ? 'border-indigo-500 ring-2 ring-indigo-200 bg-white shadow-md' 
                                            : 'border-transparent bg-white hover:bg-gray-50 hover:border-gray-200'
                                    }`}
                                >
                                    <div className="flex justify-center -space-x-2 mb-3">
                                        <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: theme.palette.primaryColor }}></div>
                                        <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: theme.palette.accentColor }}></div>
                                        <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: theme.palette.backgroundColor }}></div>
                                    </div>
                                    <span className="font-medium text-sm text-slate-700 block text-center">{theme.name}</span>
                                    {localSettings.theme.activeTheme === key && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Advanced Customization</h3>
                    <FormRow label="Primary Color" description="Main brand color for headers, buttons, and links.">
                        <input type="color" value={localSettings.theme.primaryColor} onChange={e => handleNestedChange('theme', 'primaryColor', e.target.value)} className="w-full h-10 p-1 border rounded-md" />
                    </FormRow>
                    <FormRow label="Accent Color" description="Used for highlights and secondary elements.">
                        <input type="color" value={localSettings.theme.accentColor} onChange={e => handleNestedChange('theme', 'accentColor', e.target.value)} className="w-full h-10 p-1 border rounded-md" />
                    </FormRow>
                    <FormRow label="Background Color" description="The main background color for most pages.">
                        <input type="color" value={localSettings.theme.backgroundColor} onChange={e => handleNestedChange('theme', 'backgroundColor', e.target.value)} className="w-full h-10 p-1 border rounded-md" />
                    </FormRow>
                    <FormRow label="Text Color" description="Main text color.">
                        <input type="color" value={localSettings.theme.textColor} onChange={e => handleNestedChange('theme', 'textColor', e.target.value)} className="w-full h-10 p-1 border rounded-md" />
                    </FormRow>
                    <FormRow label="Typography" description="Choose a font pairing for your site.">
                        <select value={localSettings.theme.fontPairing} onChange={e => handleNestedChange('theme', 'fontPairing', e.target.value)} className="w-full p-2 border rounded">
                            <option value="inter-lato">Inter & Lato</option>
                            <option value="roboto-merriweather">Roboto & Merriweather</option>
                            <option value="montserrat-oswald">Montserrat & Oswald</option>
                        </select>
                    </FormRow>
                     <FormRow label="Corner Radius" description="Controls the roundness of buttons and cards.">
                        <input type="range" min="0" max="2" step="0.1" value={parseFloat(localSettings.theme.cornerRadius)} onChange={e => handleNestedChange('theme', 'cornerRadius', `${e.target.value}rem`)} className="w-full" />
                    </FormRow>
                     <FormRow label="Shadow Intensity" description="Controls the depth of shadows on cards.">
                        <select value={localSettings.theme.shadowIntensity} onChange={e => handleNestedChange('theme', 'shadowIntensity', e.target.value)} className="w-full p-2 border rounded">
                            <option value="light">Light</option>
                            <option value="medium">Medium</option>
                            <option value="heavy">Heavy</option>
                        </select>
                    </FormRow>
                </div>
            );
            case 'layout': return (
                <div className="space-y-3">
                    {localSettings.layout.map((section, index) => (
                        <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-4"><div className="flex flex-col gap-1"><button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="disabled:opacity-20">▲</button><button onClick={() => moveSection(index, 'down')} disabled={index === localSettings.layout.length - 1} className="disabled:opacity-20">▼</button></div><div><p className="font-semibold text-gray-700">{sectionNames[section.id]}</p>{section.hasOwnProperty('title') && (<input type="text" value={section.title} onChange={e => handleLayoutChange(localSettings.layout.map(s => s.id === section.id ? { ...s, title: e.target.value } : s))} className="text-xs p-1 border rounded mt-1 w-full" placeholder="Section Title"/>)}</div></div>
                            <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={section.visible} onChange={e => handleLayoutChange(localSettings.layout.map(s => s.id === section.id ? { ...s, visible: e.target.checked } : s))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div></label>
                        </div>
                    ))}
                </div>
            );
             case 'content': return (
                <div>
                    {/* Hero Section Text */}
                    <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                        <h3 className="font-bold text-blue-800 mb-2">Hero Section Text</h3>
                        <FormRow label="Hero Title"><input type="text" value={localSettings.content.heroTitle} onChange={e => handleNestedChange('content', 'heroTitle', e.target.value)} className="w-full p-2 border rounded" /></FormRow>
                        <FormRow label="Hero Subtitle"><textarea value={localSettings.content.heroSubtitle} onChange={e => handleNestedChange('content', 'heroSubtitle', e.target.value)} className="w-full p-2 border rounded" rows={3}></textarea></FormRow>
                    </div>

                    {/* Hero Metrics Configuration */}
                    <div className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-200">
                        <h3 className="font-bold text-indigo-800 mb-2">Hero Floating Metrics</h3>
                        <p className="text-sm text-indigo-600 mb-4">Customize the floating cards seen on the hero image.</p>
                        
                        <FormRow label="Use Real Data" description="Automatically calculate Revenue and Users from site data.">
                            <input 
                                type="checkbox" 
                                checked={localSettings.content.heroMetrics?.enableRealData || false} 
                                onChange={e => {
                                    setLocalSettings(prev => ({
                                        ...prev,
                                        content: {
                                            ...prev.content,
                                            heroMetrics: { ...prev.content.heroMetrics, enableRealData: e.target.checked }
                                        }
                                    }));
                                }} 
                                className="w-5 h-5" 
                            />
                        </FormRow>

                        {!localSettings.content.heroMetrics?.enableRealData && (
                            <>
                                <FormRow label="Custom Revenue Text" description="e.g., +128% or $50k">
                                    <input 
                                        type="text" 
                                        value={localSettings.content.heroMetrics?.customRevenueChange || ""} 
                                        onChange={e => setLocalSettings(prev => ({...prev, content: {...prev.content, heroMetrics: {...prev.content.heroMetrics, customRevenueChange: e.target.value}}}))} 
                                        className="w-full p-2 border rounded" 
                                    />
                                </FormRow>
                                <FormRow label="Custom Active Users" description="e.g., 2.4k+">
                                    <input 
                                        type="text" 
                                        value={localSettings.content.heroMetrics?.customActiveUsers || ""} 
                                        onChange={e => setLocalSettings(prev => ({...prev, content: {...prev.content, heroMetrics: {...prev.content.heroMetrics, customActiveUsers: e.target.value}}}))} 
                                        className="w-full p-2 border rounded" 
                                    />
                                </FormRow>
                            </>
                        )}
                    </div>

                    {/* About Us Section */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-2">About Us Section</h3>
                        <FormRow label="About Us Title"><input type="text" value={localSettings.content.aboutUsTitle} onChange={e => handleNestedChange('content', 'aboutUsTitle', e.target.value)} className="w-full p-2 border rounded" /></FormRow>
                        <FormRow label="About Us Text"><textarea value={localSettings.content.aboutUsText} onChange={e => handleNestedChange('content', 'aboutUsText', e.target.value)} className="w-full p-2 border rounded" rows={4}></textarea></FormRow>
                        <FormRow label="About Us Image URL"><input type="text" value={localSettings.content.aboutUsImageUrl} onChange={e => handleNestedChange('content', 'aboutUsImageUrl', e.target.value)} className="w-full p-2 border rounded" /></FormRow>
                    </div>

                    {/* Footer & Social */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-2">Footer & Social</h3>
                        <FormRow label="Footer Text" description="Use {year} to automatically insert the current year."><input type="text" value={localSettings.content.footerText} onChange={e => handleNestedChange('content', 'footerText', e.target.value)} className="w-full p-2 border rounded" /></FormRow>
                        <FormRow label="Facebook URL"><input type="url" value={localSettings.content.socialLinks.facebook} onChange={e => handleNestedChange('content', 'socialLinks', {...localSettings.content.socialLinks, facebook: e.target.value})} className="w-full p-2 border rounded" /></FormRow>
                        <FormRow label="Twitter URL"><input type="url" value={localSettings.content.socialLinks.twitter} onChange={e => handleNestedChange('content', 'socialLinks', {...localSettings.content.socialLinks, twitter: e.target.value})} className="w-full p-2 border rounded" /></FormRow>
                        <FormRow label="Instagram URL"><input type="url" value={localSettings.content.socialLinks.instagram} onChange={e => handleNestedChange('content', 'socialLinks', {...localSettings.content.socialLinks, instagram: e.target.value})} className="w-full p-2 border rounded" /></FormRow>
                        <FormRow label="LinkedIn URL"><input type="url" value={localSettings.content.socialLinks.linkedin} onChange={e => handleNestedChange('content', 'socialLinks', {...localSettings.content.socialLinks, linkedin: e.target.value})} className="w-full p-2 border rounded" /></FormRow>
                    </div>
                </div>
            );
            case 'blog': return <NewsArticleManagement articles={localSettings.content.newsArticles} onUpdate={articles => handleNestedChange('content', 'newsArticles', articles)} />;
            case 'announcements': return <AnnouncementManagement announcements={localSettings.content.announcements} onUpdate={announcements => handleNestedChange('content', 'announcements', announcements)} />;
            case 'subscriptions': return <SubscriptionManagement tiers={localSettings.content.subscriptionTiers || []} products={products} onUpdate={tiers => handleNestedChange('content', 'subscriptionTiers', tiers)} />;
            case 'services': return <ServiceManagement services={localSettings.content.services} onUpdate={services => handleNestedChange('content', 'services', services)} />;
            case 'faq': return <FaqManagement faqs={localSettings.content.faqs} onUpdate={faqs => handleNestedChange('content', 'faqs', faqs)} />;
            case 'upcoming': return <UpcomingFeatureManagement features={localSettings.content.upcomingFeatures} onUpdate={features => handleNestedChange('content', 'upcomingFeatures', features)} />;
            case 'features': return (
                <div>
                    <FormRow label="Show Wishlist" description="Enable or disable the 'heart' icon and Wishlist page."><input type="checkbox" checked={localSettings.features.showFavourites} onChange={e => handleNestedChange('features', 'showFavourites', e.target.checked)} className="form-checkbox h-5 w-5" /></FormRow>
                    <FormRow label="Show Reviews" description="Enable or disable the entire customer review and rating system."><input type="checkbox" checked={localSettings.features.showReviews} onChange={e => handleNestedChange('features', 'showReviews', e.target.checked)} className="form-checkbox h-5 w-5" /></FormRow>
                    <FormRow label="Show Sale Badges" description="Show or hide the 'SALE' badge on product cards."><input type="checkbox" checked={localSettings.features.showSaleBadges} onChange={e => handleNestedChange('features', 'showSaleBadges', e.target.checked)} className="form-checkbox h-5 w-5" /></FormRow>
                </div>
            );
            case 'validation': return (
                <div>
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Product Data Validation</h3>
                    <FormRow label="Minimum Title Length" description="Ensure product titles have at least this many characters.">
                        <input 
                            type="number" 
                            min="1" 
                            max="100"
                            value={localSettings.validation?.productTitleMinLength || 3} 
                            onChange={e => handleNestedChange('validation', 'productTitleMinLength', parseInt(e.target.value))} 
                            className="w-full p-2 border rounded" 
                        />
                    </FormRow>
                </div>
            );
            case 'animations': return (
                <div>
                     <FormRow label="Enable Animations" description="Toggle all entrance animations across the site."><input type="checkbox" checked={localSettings.animations.enabled} onChange={e => handleNestedChange('animations', 'enabled', e.target.checked)} className="form-checkbox h-5 w-5" /></FormRow>
                </div>
            );
            case 'apiKeys': return (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">API Configuration</h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Configure default API keys for AI features (Mentor, Assistant, etc.).
                        These keys are used if the user does not provide their own.
                    </p>
                    
                    <FormRow label="Google Gemini API Key" description="Required for Gemini models.">
                        <input 
                            type="password" 
                            value={localSettings.apiKeys?.google || ''} 
                            onChange={e => handleNestedChange('apiKeys', 'google', e.target.value)} 
                            className="w-full p-2 border rounded font-mono text-sm"
                            placeholder="AIza..."
                        />
                    </FormRow>
                    <FormRow label="OpenAI API Key" description="Required for GPT models.">
                        <input 
                            type="password" 
                            value={localSettings.apiKeys?.openai || ''} 
                            onChange={e => handleNestedChange('apiKeys', 'openai', e.target.value)} 
                            className="w-full p-2 border rounded font-mono text-sm"
                            placeholder="sk-..."
                        />
                    </FormRow>
                    <FormRow label="Anthropic API Key" description="Required for Claude models.">
                        <input 
                            type="password" 
                            value={localSettings.apiKeys?.anthropic || ''} 
                            onChange={e => handleNestedChange('apiKeys', 'anthropic', e.target.value)} 
                            className="w-full p-2 border rounded font-mono text-sm"
                            placeholder="sk-ant-..."
                        />
                    </FormRow>
                    <FormRow label="DeepSeek API Key" description="Required for DeepSeek models.">
                        <input 
                            type="password" 
                            value={localSettings.apiKeys?.deepseek || ''} 
                            onChange={e => handleNestedChange('apiKeys', 'deepseek', e.target.value)} 
                            className="w-full p-2 border rounded font-mono text-sm"
                            placeholder="sk-..."
                        />
                    </FormRow>
                    <FormRow label="Grok (xAI) API Key" description="Required for Grok models.">
                        <input 
                            type="password" 
                            value={localSettings.apiKeys?.grok || ''} 
                            onChange={e => handleNestedChange('apiKeys', 'grok', e.target.value)} 
                            className="w-full p-2 border rounded font-mono text-sm"
                            placeholder="xai-..."
                        />
                    </FormRow>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Site Customizer</h1>
                    <p className="text-gray-500 mt-1">Changes are live in this panel. Click "Save" to apply them to the website.</p>
                </div>
                <button onClick={handleSave} className="mt-4 md:mt-0 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors relative">
                    Save Changes
                    {showSuccess && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full p-1 animate-pop-in">✔</span>}
                </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
                <TabButton label="Theme" isActive={activeTab === 'theme'} onClick={() => setActiveTab('theme')} />
                <TabButton label="Layout" isActive={activeTab === 'layout'} onClick={() => setActiveTab('layout')} />
                <TabButton label="Content" isActive={activeTab === 'content'} onClick={() => setActiveTab('content')} />
                <TabButton label="Blog" isActive={activeTab === 'blog'} onClick={() => setActiveTab('blog')} />
                <TabButton label="Announcements" isActive={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} />
                <TabButton label="Subscriptions" isActive={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')} />
                <TabButton label="Services" isActive={activeTab === 'services'} onClick={() => setActiveTab('services')} />
                <TabButton label="FAQ" isActive={activeTab === 'faq'} onClick={() => setActiveTab('faq')} />
                <TabButton label="Upcoming" isActive={activeTab === 'upcoming'} onClick={() => setActiveTab('upcoming')} />
                <TabButton label="Features" isActive={activeTab === 'features'} onClick={() => setActiveTab('features')} />
                <TabButton label="Validation" isActive={activeTab === 'validation'} onClick={() => setActiveTab('validation')} />
                <TabButton label="Animations" isActive={activeTab === 'animations'} onClick={() => setActiveTab('animations')} />
                <TabButton label="API Keys" isActive={activeTab === 'apiKeys'} onClick={() => setActiveTab('apiKeys')} />
            </div>

            <div className="mt-4">{renderContent()}</div>
        </div>
    );
};

export default WebsiteSettingsComponent;
