import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

razorpayInstance.isEnabled = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

// Extend SDK to support payouts syntax for RazorpayX
razorpayInstance.payouts = {
  create: async (options) => {
    try {
      // Use the standard SDK's resource method if available, or fetch directly
      const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');

      const response = await fetch('https://api.razorpay.com/v1/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(options)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw { statusCode: response.status, error: responseData };
      }

      return responseData;
    } catch (error) {
      console.error('[razorpay] Payout API Error:', JSON.stringify(error, null, 2));
      throw error;
    }
  }
};

export default razorpayInstance;
