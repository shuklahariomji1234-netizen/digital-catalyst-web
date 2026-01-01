
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 🔐 Razorpay Credentials (LIVE MODE)
// WARNING: Keep these secure. Do not expose the Secret Key in frontend code.
const razorpay = new Razorpay({
    key_id: 'rzp_live_RgNg9mdaDq8JtI',
    key_secret: 'wY0p5pukfkJXeUc4X9Bhriex'
});

// --- 1. CREATE ORDER API ---
app.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;

        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }

        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: currency,
            payment_capture: 1 // Auto-capture payment
        };

        const order = await razorpay.orders.create(options);
        
        // Return Order ID to frontend
        res.json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            key_id: 'rzp_live_RgNg9mdaDq8JtI' // Send public key to frontend
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- 2. VERIFY PAYMENT API ---
app.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // 1. Validate Signature (HMAC SHA256)
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        
        const expectedSignature = crypto
            .createHmac('sha256', 'wY0p5pukfkJXeUc4X9Bhriex') // YOUR SECRET KEY
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.log("Signature Mismatch!");
            return res.status(400).json({ success: false, status: 'failed', message: "Invalid Signature" });
        }

        // 2. Double Check Payment Status with Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (payment.status === 'captured' || payment.status === 'authorized') {
            console.log("Payment Success: ", payment.status);
            
            // TODO: Update your database here (mark order as paid)
            
            return res.json({ success: true, status: 'success' });
        } else {
            console.log("Payment Status Issue: ", payment.status);
            return res.json({ success: false, status: payment.status, message: "Payment not captured" });
        }

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Secure Payment Server running on http://localhost:${PORT}`);
});
