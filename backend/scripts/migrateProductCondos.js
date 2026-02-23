const mongoose = require('mongoose');
const Product = require('../models/Product');
const Condominium = require('../models/Condominium');
require('dotenv').config();

const migrateProductCondos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected:', process.env.MONGO_URI);

        const products = await Product.find();
        const condos = await Condominium.find();

        if (condos.length === 0) {
            console.log('No condominiums found in the database. Cannot migrate.');
            return;
        }

        console.log(`Found ${products.length} products to migrate.`);

        for (const product of products) {
            await Product.findByIdAndUpdate(product._id, { condominiums: [condos[0], condos[1]] });
        }

        console.log('Product condos migrated successfully');
    } catch (error) {
        console.error('Error migrating product condos:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB Disconnected');
    }
};

migrateProductCondos();
