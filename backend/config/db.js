const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const isLocal = process.env.MONGO_URI.includes('localhost') || process.env.MONGO_URI.includes('127.0.0.1');
        console.log(`MongoDB Connected: ${isLocal ? 'Local (Docker)' : 'Remote (Atlas)'}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
