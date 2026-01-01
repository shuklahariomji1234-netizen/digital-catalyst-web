const Razorpay = require('razorpay');

exports.handler = async function (event, context) {
  // Sirf POST request allow karein
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    
    // 🔐 LIVE CREDENTIALS (Securely backend par rahenge)
    const razorpay = new Razorpay({
        key_id: 'rzp_live_RgNg9mdaDq8JtI',
        key_secret: 'wY0p5pukfkJXeUc4X9Bhriex'
    });

    const options = {
      amount: Math.round(data.amount * 100), // Amount paise mein
      currency: "INR",
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        order_id: order.id,
        amount: order.amount,
        key_id: 'rzp_live_RgNg9mdaDq8JtI'
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};