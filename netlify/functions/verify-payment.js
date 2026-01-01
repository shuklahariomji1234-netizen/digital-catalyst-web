const crypto = require('crypto');
const Razorpay = require('razorpay');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body);

    // 🔐 Secret Key se Signature Verify karo
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', 'wY0p5pukfkJXeUc4X9Bhriex')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Optional: Razorpay API se status double-check karo
        const razorpay = new Razorpay({
            key_id: 'rzp_live_RgNg9mdaDq8JtI',
            key_secret: 'wY0p5pukfkJXeUc4X9Bhriex'
        });
        
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        
        if(payment.status === 'captured' || payment.status === 'authorized'){
             return {
                statusCode: 200,
                body: JSON.stringify({ success: true, status: 'success' }),
            };
        }
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "Invalid Signature or Payment Failed" }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};