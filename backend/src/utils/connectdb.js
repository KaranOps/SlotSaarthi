import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database Connected');
    } catch (err) {
        console.error('Failed to connect database:', err.message);
        process.exit(1);
    }
};

export default connectDB;