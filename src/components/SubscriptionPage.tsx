import React from 'react';
import { WebsiteSettings, SubscriptionTier } from '../App';

interface SubscriptionPageProps {
    settings: WebsiteSettings;
    onPurchase: (tier: SubscriptionTier) => void;
    onBack: () => void;
    purchasedIds: (number|string)[]; // New prop to check ownership
}

const SubscriptionCard: React.FC<{ tier: SubscriptionTier, onPurchase: () => void, index: number, isPurchased: boolean }> = ({ tier, onPurchase, index, isPurchased }) => {
    const isFeatured = tier.isRecommended;
    
    // Dynamic styles
    const headerColors: Record<string, string> = {
        blue: 'bg-blue-600',
        purple: 'bg-purple-600',
        gold: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        green: 'bg-green-600'
    };
    const headerClass = headerColors[tier.highlightColor || 'blue'] || headerColors.blue;

    const borderColors: Record<string, string> = {
        blue: 'border-blue-100',
        purple: 'border-purple-100',
        gold: 'border-yellow-200',
        green: 'border-green-100'
    };
    const borderClass = borderColors[tier.highlightColor || 'blue'] || borderColors.blue;

    return (
        <div 
            className={`
                relative flex flex-col min-w-[280px] sm:min-w-[320px] w-full bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl
                ${borderClass}
                ${isFeatured ? 'ring-4 ring-primary/20 scale-105 md:scale-110 z-10' : ''}
                snap-center
            `}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {isFeatured && !isPurchased && (
                <div className="absolute top-0 inset-x-0 bg-primary text-white text-xs font-bold uppercase tracking-widest py-1 text-center z-20">
                    Most Popular
                </div>
            )}
            
            {/* Header */}
            <div className={`${headerClass} p-6 text-white text-center ${isFeatured ? 'pt-8' : ''}`}>
                <h3 className="text-2xl font-bold">{tier.name}</h3>
                <p className="text-white/80 text-sm mt-1">{tier.description}</p>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold">₹{tier.price}</span>
                    <span className="text-sm opacity-80">/ one-time</span>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <ul className="space-y-4 flex-1">
                    {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                            <svg className={`w-5 h-5 flex-shrink-0 ${isFeatured ? 'text-primary' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>

                {/* LOGIC: Show "Active Plan" if purchased, else "Get Started" */}
                {isPurchased ? (
                    <button 
                        disabled
                        className="w-full mt-8 py-4 rounded-xl font-bold text-lg bg-green-100 text-green-700 border-2 border-green-200 cursor-default flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Active Plan
                    </button>
                ) : (
                    <button 
                        onClick={onPurchase}
                        className={`
                            w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-md
                            ${isFeatured 
                                ? 'bg-primary text-white hover:bg-opacity-90 hover:shadow-lg' 
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'}
                        `}
                    >
                        Get Started
                    </button>
                )}
            </div>
        </div>
    );
};

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ settings, onPurchase, onBack, purchasedIds }) => {
    const tiers = settings.content.subscriptionTiers || [];

    return (
        <div className="min-h-screen bg-slate-50 font-sans animate-fade-in">
            <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">Digital Catalyst</span>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">Plans</span>
                    </div>
                    <button onClick={onBack} className="text-gray-600 hover:text-primary font-semibold text-sm flex items-center gap-1 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Home
                    </button>
                </div>
            </header>

            <div className="py-12 sm:py-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4">Choose Your Learning Path</h2>
                        <p className="text-lg text-slate-600">Unlock premium content, exclusive resources, and expert support with our tailored plans.</p>
                    </div>

                    <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-6 pb-12 px-4 -mx-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 md:px-0 md:mx-0 md:items-center custom-scrollbar">
                        {tiers.map((tier, index) => (
                            <SubscriptionCard 
                                key={tier.id} 
                                tier={tier} 
                                onPurchase={() => onPurchase(tier)} 
                                index={index}
                                isPurchased={purchasedIds.includes(tier.id)}
                            />
                        ))}
                    </div>
                    
                    <div className="mt-12 text-center bg-white p-6 rounded-xl shadow-sm border max-w-2xl mx-auto">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Looking for just one chapter?</h3>
                        <p className="text-slate-600 text-sm">You can purchase individual course modules directly from the course player. Navigate to any product and click on a locked module.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;