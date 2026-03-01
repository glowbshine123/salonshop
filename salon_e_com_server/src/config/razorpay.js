import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';

console.log('[razorpay-config] process.cwd():', process.cwd());
const result = dotenv.config();
console.log('[razorpay-config] dotenv result:', result);
console.log('[razorpay-config] RAZORPAY_KEY_ID from env:', process.env.RAZORPAY_KEY_ID ? 'found' : 'missing');

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
