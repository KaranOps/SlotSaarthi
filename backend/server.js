import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import { doctorRoutes, slotRoutes, tokenRoutes, queueRoutes } from './src/routes/index.js';
import errorHandler from './src/utils/errorHandler.js';
import { PORT, MONGODB_URI } from './config/settings.js';
import connectDB from './src/utils/connectdb.js';

// Load environment variables
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/queue', queueRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'OPD Token Allocation Engine is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Start server
const port = process.env.PORT || PORT;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
});

export default app;
