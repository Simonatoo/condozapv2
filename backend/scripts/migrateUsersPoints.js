const mongoose = require('mongoose')
const User = require('../models/User')
require('dotenv').config()

const migrateUsersPoints = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/condozapv2';
        console.log('Using Mongo URI:', mongoUri.startsWith('mongodb+srv') ? 'Atlas Cluster' : mongoUri);

        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');

        const users = await User.find()
        for (const user of users) {
            user.smsVerified = true;
            await user.save();
        }

        console.log('--- Migração Concluída com Sucesso ---');
        process.exit(0);
    } catch (error) {
        console.error('Erro na migração:', error);
        process.exit(1);
    }
}

migrateUsersPoints();