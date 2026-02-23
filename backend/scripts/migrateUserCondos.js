const mongoose = require('mongoose');
const User = require('../models/User');
const Condominium = require('../models/Condominium');
require('dotenv').config();

const migrateUserCondos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected:', process.env.MONGO_URI);

        const users = await User.find();
        const condos = await Condominium.find();

        for (const user of users) {
            await User.findByIdAndUpdate(user._id, { condominiums: [condos[0], condos[1], condos[2]] });
        }

        console.log('User condos migrated successfully');
    } catch (error) {
        console.error('Error migrating user condos:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB Disconnected');
    }
};

migrateUserCondos();