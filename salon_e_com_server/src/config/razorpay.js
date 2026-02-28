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
      return await razorpayInstance.api.post({
        url: 'payouts',
        data: options
      });
    } catch (error) {
      console.error('[razorpay] Payout API Error:', JSON.stringify(error, null, 2));
      throw error;
    }
  }
};

export default razorpayInstance;
