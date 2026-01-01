
import React, { useState } from 'react';
import { Coupon } from '../../App';

const CouponFormModal: React.FC<{ coupon?: Coupon | null; onSave: (c: any) => void; onClose: () => void }> = ({ coupon, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        code: coupon?.code || '', type: coupon?.type || 'percentage', value: coupon?.value || 0,
        expiryDate: coupon?.expiryDate || '', isActive: coupon?.isActive ?? true, usageLimit: coupon?.usageLimit || 100,
    });

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden relative">
                <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{coupon ? 'Edit' : 'New'} Coupon</h2>
                    <button onClick={onClose} className="text-gray-400 font-bold text-2xl">×</button>
                </div>
                <div className="overflow-y-auto p-6 space-y-4">
                    <input className="w-full p-3 border rounded font-bold uppercase" placeholder="Code (e.g. SAVE10)" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="p-3 border rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as 'percentage' | 'fixed'})}>
                            <option value="percentage">Percentage %</option><option value="fixed">Fixed ₹</option>
                        </select>
                        <input className="p-3 border rounded" type="number" placeholder="Value" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
                    </div>
                    <input className="w-full p-3 border rounded" type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                    <input className="w-full p-3 border rounded" type="number" placeholder="Usage Limit" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})} />
                    <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} /> Active</label>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded font-bold">Save</button>
                </div>
            </div>
        </div>
    );
};

const CouponManagement: React.FC<{ coupons: Coupon[]; onUpdate: (c: Coupon[]) => void; }> = ({ coupons, onUpdate }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editCoup, setEditCoup] = useState<Coupon | null>(null);

    const save = (data: any) => {
        if(editCoup) onUpdate(coupons.map(c => c.id === editCoup.id ? {...editCoup, ...data} : c));
        else onUpdate([{...data, id: Date.now(), timesUsed: 0}, ...coupons]);
        setModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Coupons</h1>
                <button onClick={() => { setEditCoup(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded">+ Create</button>
            </div>
            {/* Table Simplified */}
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b"><tr><th className="p-4">Code</th><th className="p-4">Discount</th><th className="p-4">Action</th></tr></thead>
                    <tbody>{coupons.map(c => <tr key={c.id} className="border-b"><td className="p-4 font-mono font-bold">{c.code}</td><td className="p-4">{c.value}{c.type === 'percentage' ? '%' : '₹'}</td><td className="p-4 text-blue-600 cursor-pointer" onClick={() => { setEditCoup(c); setModalOpen(true); }}>Edit</td></tr>)}</tbody>
                </table>
            </div>
            {modalOpen && <CouponFormModal coupon={editCoup} onSave={save} onClose={() => setModalOpen(false)} />}
        </div>
    );
};
export default CouponManagement;
