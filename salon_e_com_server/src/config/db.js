import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) return;

    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/salon_e_com';

        await mongoose.connect(mongoUri, {
            dbName: "salon_e_com"
        });

        isConnected = true;
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
    }
};

export default connectDB;
