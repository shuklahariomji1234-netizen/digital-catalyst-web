import React, { useState, useEffect } from 'react';
import { WebsiteSettings, ProductWithRating, CartItem } from '../App';

interface PaymentModalProps {
  settings: WebsiteSettings;
  originalPrice: number;
  salePrice?: number | null;
  couponDiscount: number;
  finalPrice: number;
  onClose: () => void;
  onConfirm: () => void;
  productTitle?: string;
  cartItems?: ({ product: ProductWithRating } & CartItem)[];
  paymentLink?: string; 
  customApiKey?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
    settings, productTitle, originalPrice, salePrice, couponDiscount, finalPrice, onClose, onConfirm, cartItems, customApiKey
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'creating_order' | 'processing' | 'verifying' | 'failed' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setStatus('creating_order');
    setErrorMessage('');

    try {
        // 1. BACKEND CALL: Secure Order Creation
        // Yeh ab aapke Netlify Function ko call karega, na ki localhost ko
        const response = await fetch('/.netlify/functions/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: finalPrice, currency: "INR" })
        });
        const data = await response.json();

        if (!data.success) throw new Error(data.error || "Failed to create order ID");

        // 2. Open Razorpay with Real Order ID
        const options = {
            key: data.key_id, // Key from backend
            amount: data.amount,
            currency: "INR",
            name: "Digital Catalyst",
            description: productTitle || "Order Payment",
            order_id: data.order_id, // Secure Order ID
            
            // 3. Verify Payment on Backend
            handler: async function (response: any) {
                await verifyPayment(response);
            },
            prefill: {
                name: "Customer Name",
                email: "customer@example.com",
                contact: "9999999999"
            },
            theme: { color: settings.theme.primaryColor },
            modal: {
                ondismiss: function() {
                    if (status !== 'success' && status !== 'verifying') {
                        setIsProcessing(false);
                        setStatus('idle');
                    }
                }
            }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
            setStatus('failed');
            setErrorMessage(response.error.description || "Payment failed.");
            setIsProcessing(false);
        });
        rzp1.open();

    } catch (err: any) {
        console.error("Payment Error: ", err);
        setErrorMessage("Connection failed. Please try again.");
        setStatus('failed');
        setIsProcessing(false);
    }
  };

  const verifyPayment = async (paymentResponse: any) => {
      setStatus('verifying');
      try {
          // 4. VERIFY SIGNATURE: Backend check
          const res = await fetch('/.netlify/functions/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature
              })
          });
          const result = await res.json();
          if (result.success) {
              setStatus('success');
              // Success confirmed!
              setTimeout(() => onConfirm(), 1500);
          } else {
              throw new Error(result.message || "Verification failed");
          }
      } catch (err: any) {
          setStatus('failed');
          setErrorMessage("Verification failed. Please contact support.");
          setIsProcessing(false);
      }
  };

  const isCartMode = !!cartItems && cartItems.length > 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col animate-scale-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white" disabled={status === 'verifying' || status === 'success'}>✕</button>
            <div className="text-center">
                <h2 className="text-2xl font-bold">Secure Checkout</h2>
                <p className="text-gray-400 text-sm mt-1">
                    {isCartMode ? 'Complete your order' : `Purchasing: ${productTitle}`}
                </p>
            </div>
        </div>

        <div className="p-8 space-y-6">
            {/* Status Views */}
            {status === 'creating_order' && <div className="text-center py-8"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div><p className="font-bold text-blue-600">Initializing Secure Payment...</p></div>}
            {status === 'verifying' && <div className="text-center py-8"><div className="animate-spin w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-3"></div><p className="font-bold text-green-600">Verifying Transaction...</p></div>}
            {status === 'success' && <div className="text-center py-8"><div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">✓</div><p className="font-bold text-green-700">Payment Verified!</p></div>}
            
            {status === 'failed' && (
                <div className="text-center py-4 bg-red-50 rounded-lg border border-red-100">
                    <h3 className="text-xl font-bold text-red-600">Payment Failed</h3>
                    <p className="text-sm text-gray-600 mt-1 px-4">{errorMessage}</p>
                    <button onClick={() => setStatus('idle')} className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-colors">Try Again</button>
                </div>
            )}

            {/* Default View */}
            {status === 'idle' && (
                <>
                    <div className="flex justify-between items-center text-lg font-bold border-b pb-4">
                        <span>Total Payable</span>
                        <span className="text-2xl text-indigo-600">₹{finalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Secured by Razorpay (UPI, Cards, Netbanking)
                    </div>

                    <button onClick={handleInitiatePayment} disabled={isProcessing} className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                        {isProcessing ? 'Processing...' : `Pay ₹${finalPrice.toFixed(0)}`}
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;