import React, { useState, useEffect } from 'react';
import { WebsiteSettings, SubscriptionTier, Coupon, User } from '../App';

interface SubscriptionCheckoutPageProps {
    settings: WebsiteSettings;
    tier: SubscriptionTier;
    currentUser: User | null;
    coupons: Coupon[];
    onBack: () => void;
    onConfirmPayment: (appliedCouponCode: string | null, finalPrice: number) => void;
}

const SubscriptionCheckoutPage: React.FC<SubscriptionCheckoutPageProps> = ({ 
    settings, tier, currentUser, coupons, onBack, onConfirmPayment 
}) => {
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'processing' | 'verifying' | 'failed' | 'success'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    const basePrice = parseFloat(tier.price);
    const discount = appliedCoupon ? (appliedCoupon.type === 'fixed' ? Math.min(appliedCoupon.value, basePrice) : (basePrice * appliedCoupon.value) / 100) : 0;
    const finalPrice = basePrice - discount;

    const handleApplyCoupon = () => {
        const c = coupons.find(x => x.code.toUpperCase() === couponInput.toUpperCase());
        if (c && c.isActive) { setAppliedCoupon(c); setCouponError(null); } 
        else setCouponError('Invalid or inactive coupon.');
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        setStatus('processing');
        
        try {
            // ✨ NETLIFY FUNCTION CALL
            const response = await fetch('/.netlify/functions/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: finalPrice, currency: "INR" })
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            const options = {
                key: data.key_id,
                amount: data.amount,
                currency: "INR",
                name: "Digital Catalyst",
                description: `Subscription: ${tier.name}`,
                order_id: data.order_id,
                handler: async function (res: any) {
                    setStatus('verifying');
                    // ✨ NETLIFY FUNCTION CALL
                    const vRes = await fetch('/.netlify/functions/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: res.razorpay_order_id,
                            razorpay_payment_id: res.razorpay_payment_id,
                            razorpay_signature: res.razorpay_signature
                        })
                    });
                    const vData = await vRes.json();
                    if (vData.success) {
                        setStatus('success');
                        setTimeout(() => onConfirmPayment(appliedCoupon?.code || null, finalPrice), 1500);
                    } else {
                        throw new Error("Verification failed.");
                    }
                },
                prefill: { email: currentUser?.email || "user@example.com" },
                theme: { color: settings.theme.primaryColor },
                modal: { ondismiss: () => { if (status !== 'success') { setIsProcessing(false); setStatus('idle'); } } }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (r: any) => { setStatus('failed'); setErrorMessage(r.error.description); setIsProcessing(false); });
            rzp.open();

        } catch (err: any) {
            setStatus('failed');
            setErrorMessage("Connection failed.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-6">
            <button onClick={onBack} className="mb-4 text-gray-500 hover:text-black">← Cancel</button>
            <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Checkout: {tier.name}</h2>
                <div className="flex gap-2 mb-6">
                    <input className="border p-2 rounded w-full" placeholder="Promo Code" value={couponInput} onChange={e => setCouponInput(e.target.value)} />
                    <button onClick={handleApplyCoupon} className="bg-gray-800 text-white px-4 rounded">Apply</button>
                </div>
                {couponError && <p className="text-red-500 text-sm mb-4">{couponError}</p>}
                
                <div className="border-t pt-4 mb-6 space-y-2">
                    <div className="flex justify-between"><span>Subtotal</span><span>₹{basePrice}</span></div>
                    {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount}</span></div>}
                    <div className="flex justify-between font-bold text-xl mt-2"><span>Total</span><span>₹{finalPrice}</span></div>
                </div>

                {status === 'failed' && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-center">{errorMessage}</div>}
                {status === 'verifying' && <div className="bg-blue-50 text-blue-600 p-3 rounded mb-4 text-center">Verifying Payment...</div>}

                <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                    {isProcessing ? 'Processing...' : `Pay ₹${finalPrice}`}
                </button>
            </div>
        </div>
    );
};

export default SubscriptionCheckoutPage;