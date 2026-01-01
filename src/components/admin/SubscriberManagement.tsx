
import React, { useState, useEffect } from 'react';
import { Subscriber, EmailLog } from '../../App';

interface SubscriberManagementProps {
    subscribers: Subscriber[];
    emailLogs: EmailLog[];
    onUpdate: (updatedSubscribers: Subscriber[]) => void;
    onLogsUpdate: (logs: EmailLog[]) => void;
    onDeleteSubscriber: (id: number) => void;
    onSendEmail: (log: EmailLog) => void;
}

const DAILY_LIMIT = 500;

// --- Log Details Modal ---
const LogDetailsModal: React.FC<{ log: EmailLog; subscribers: Subscriber[]; onClose: () => void }> = ({ log, subscribers, onClose }) => {
    // Safely handle potential undefined recipientIds
    const safeRecipientIds = log.recipientIds || [];
    const recipients = subscribers.filter(s => safeRecipientIds.includes(s.id));

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Batch Details</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="mb-4 flex justify-between text-sm text-slate-500 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span>Sent: {new Date(log.date).toLocaleDateString()} at {log.time}</span>
                        <span>Count: {log.count}</span>
                    </div>
                    
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recipients List</h4>
                    
                    {recipients.length > 0 ? (
                        <ul className="divide-y divide-slate-100 border rounded-lg bg-white">
                            {recipients.map(sub => (
                                <li key={sub.id} className="py-3 px-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                    <span className="text-slate-700 font-medium">{sub.email}</span>
                                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">ID: {sub.id}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-500 font-medium">No matching recipients found.</p>
                            <p className="text-xs text-slate-400 mt-1">Users may have been deleted after this log was created.</p>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
                    <button onClick={onClose} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 font-bold transition-colors shadow-sm">Close</button>
                </div>
            </div>
        </div>
    );
};

const SubscriberManagement: React.FC<SubscriberManagementProps> = ({ subscribers, emailLogs, onUpdate, onLogsUpdate, onDeleteSubscriber, onSendEmail }) => {
    const [today, setToday] = useState(new Date().toISOString().split('T')[0]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<'list' | 'history'>('list');
    const [viewLog, setViewLog] = useState<EmailLog | null>(null);

    // Automatically refresh date
    useEffect(() => {
        const timer = setInterval(() => {
            setToday(new Date().toISOString().split('T')[0]);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Calculate batches
    const getBatches = () => {
        const pending = subscribers.filter(sub => !sub.lastEmailedDate || sub.lastEmailedDate !== today);
        const sent = subscribers.filter(sub => sub.lastEmailedDate === today);
        return { pending, sent };
    };

    const { pending } = getBatches();

    // Calculate Today's Sent Count from Logs for accuracy
    const sentTodayCount = emailLogs
        .filter(log => log.date === today)
        .reduce((acc, log) => acc + (log.count || 0), 0);

    const handleSendBatch = (batchSubscribers: Subscriber[]) => {
        if (batchSubscribers.length === 0) {
            alert("No subscribers selected.");
            return;
        }

        if (sentTodayCount + batchSubscribers.length > DAILY_LIMIT) {
            alert(`⚠️ DAILY LIMIT REACHED\n\nYou have already sent ${sentTodayCount} emails today.\nSending this batch would exceed the limit of ${DAILY_LIMIT}.\n\nPlease try selecting fewer people or wait until tomorrow.`);
            return;
        }

        const emails = batchSubscribers.map(s => s.email).join(',');
        
        // Mark as sent internally
        const updatedSubscribers = subscribers.map(sub => {
            if (batchSubscribers.find(b => b.id === sub.id)) {
                return { ...sub, lastEmailedDate: today };
            }
            return sub;
        });

        // Add Log
        const newLog: EmailLog = {
            id: Date.now(),
            date: today,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            count: batchSubscribers.length,
            recipientIds: batchSubscribers.map(s => s.id)
        };

        // Trigger Email Client
        const adminEmail = "developerdigitalcatalyst@gmail.com";
        const mailtoLink = `mailto:${adminEmail}?bcc=${emails}&subject=News from Digital Catalyst`;
        
        // Execute actions
        window.open(mailtoLink, '_blank');
        onUpdate(updatedSubscribers);
        
        // Call the parent's onSendEmail to handle logging (e.g. saving to DB)
        onSendEmail(newLog);
        
        // Optimistically update local logs for immediate feedback
        onLogsUpdate([newLog, ...emailLogs]);
        
        setSelectedIds([]); // Clear selection
    };

    const handleSendNextBatch = () => {
        const batchSize = 50;
        if (pending.length === 0) {
            alert("No pending subscribers for today.");
            return;
        }
        const batch = pending.slice(0, batchSize);
        handleSendBatch(batch);
    };

    const handleSendSelected = () => {
        const selectedSubs = subscribers.filter(s => selectedIds.includes(s.id));
        const validToSend = selectedSubs.filter(s => s.lastEmailedDate !== today);
        
        if (validToSend.length === 0) {
            alert("All selected users have already received an email today.");
            return;
        }
        
        if (validToSend.length < selectedSubs.length) {
            if (!window.confirm(`${selectedSubs.length - validToSend.length} users were skipped because they were already emailed today. Continue sending to the remaining ${validToSend.length}?`)) {
                return;
            }
        }

        handleSendBatch(validToSend);
    };

    const handleResetDailyStatus = () => {
        if (window.confirm("FULL RESET: This will reset 'Sent' status for all users AND clear today's history logs so you can send again.\n\nProceed?")) {
            // 1. Reset Subscribers
            const resetSubs = subscribers.map(sub => ({ ...sub, lastEmailedDate: undefined }));
            onUpdate(resetSubs);

            // 2. Clear Today's Logs to reset counter (Filters out logs that match today's date)
            const cleanLogs = emailLogs.filter(log => log.date !== today);
            onLogsUpdate(cleanLogs);
        }
    };

    const handleDeleteLog = (e: React.MouseEvent, logId: number) => {
        e.stopPropagation(); // Prevent bubbling
        if (window.confirm("Delete this history log?")) {
            const updatedLogs = emailLogs.filter(l => l.id !== logId);
            onLogsUpdate(updatedLogs);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === subscribers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(subscribers.map(s => s.id));
        }
    };

    const toggleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <div className="animate-fade-in-up space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Newsletter Manager</h1>
                    <p className="text-slate-500 mt-1">Send updates, track history, and manage daily limits.</p>
                </div>
                
                {/* Daily Limit Progress */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto min-w-[250px]">
                    <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                        <span>Daily Limit</span>
                        <span className={sentTodayCount >= DAILY_LIMIT ? "text-red-500" : "text-blue-600"}>
                            {sentTodayCount} / {DAILY_LIMIT}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${sentTodayCount >= DAILY_LIMIT ? "bg-red-500" : "bg-blue-600"}`} 
                            style={{ width: `${Math.min(100, (sentTodayCount / DAILY_LIMIT) * 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button 
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Subscriber List
                </button>
                <button 
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Sent History
                </button>
            </div>

            {activeTab === 'list' && (
                <>
                    {/* Actions Toolbar */}
                    <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <button 
                            type="button"
                            onClick={handleSendSelected}
                            disabled={selectedIds.length === 0}
                            className="bg-purple-600 text-white font-bold px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Send to Selected ({selectedIds.length})
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                        <button 
                            type="button"
                            onClick={handleSendNextBatch}
                            disabled={pending.length === 0}
                            className="bg-indigo-600 text-white font-bold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Auto-Send Next 50
                        </button>
                        <button 
                            type="button"
                            onClick={handleResetDailyStatus}
                            className="ml-auto text-slate-500 hover:text-red-600 text-sm font-semibold hover:underline px-3 py-2 rounded hover:bg-slate-50 transition-colors"
                        >
                            Reset Daily Status
                        </button>
                    </div>

                    {/* Main Table */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 w-10 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.length === subscribers.length && subscribers.length > 0} 
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                            />
                                        </th>
                                        <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Subscriber</th>
                                        <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Message</th>
                                        <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Joined</th>
                                        <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {subscribers.length > 0 ? (
                                        subscribers.map(sub => {
                                            const isSentToday = sub.lastEmailedDate === today;
                                            return (
                                                <tr key={sub.id} className={`hover:bg-slate-50/80 transition-all duration-200 ${isSentToday ? 'bg-green-50/30' : ''} ${selectedIds.includes(sub.id) ? 'bg-blue-50/50' : ''}`}>
                                                    <td className="p-4 text-center">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedIds.includes(sub.id)} 
                                                            onChange={() => toggleSelectOne(sub.id)}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        {isSentToday ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                                Sent Today
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-300">
                                                                {sub.email.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-semibold text-slate-700">{sub.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-sm text-slate-600 italic max-w-xs truncate" title={sub.message}>"{sub.message}"</p>
                                                    </td>
                                                    <td className="p-4 text-right text-sm text-slate-500 font-medium">
                                                        {new Date(sub.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button 
                                                            onClick={() => onDeleteSubscriber(sub.id)} 
                                                            className="text-red-500 hover:text-red-700 font-semibold text-xs hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center p-12 text-slate-400">
                                                No subscribers yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Time</th>
                                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Recipients</th>
                                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {emailLogs.length > 0 ? (
                                    emailLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-medium text-slate-800">{new Date(log.date).toLocaleDateString()}</td>
                                            <td className="p-4 text-slate-600">{log.time}</td>
                                            <td className="p-4">
                                                <button 
                                                    type="button"
                                                    onClick={() => setViewLog(log)}
                                                    className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors hover:shadow-sm border border-blue-200 active:scale-95"
                                                    title="Click to view recipient list"
                                                >
                                                    {log.count} Sent (View List)
                                                </button>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    type="button"
                                                    onClick={(e) => handleDeleteLog(e, log.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-semibold hover:underline px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                                >
                                                    Delete Log
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center p-12 text-slate-400">
                                            No history available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {viewLog && (
                <LogDetailsModal 
                    log={viewLog} 
                    subscribers={subscribers} 
                    onClose={() => setViewLog(null)} 
                />
            )}
        </div>
    );
};

export default SubscriberManagement;
