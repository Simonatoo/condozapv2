const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const connectDB = require('../config/db');
require('dotenv').config();

const migrateCategories = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/condozapv2';
        console.log('Using Mongo URI:', mongoUri.startsWith('mongodb+srv') ? 'Atlas Cluster' : mongoUri);

        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');

        const categories = [
            { name: 'Eletrodomésticos', slug: 'eletrodomesticos' },
            { name: 'Mobília', slug: 'mobilia' },
            { name: 'Eletrônicos', slug: 'eletronicos' },
            { name: 'Serviços', slug: 'servicos' },
            { name: 'Roupas e Acessórios', slug: 'roupas-e-acessorios' },
            { name: 'Outros', slug: 'outros' }
        ];

        console.log('--- Iniciando Migração de Categorias ---');

        // 1. Create Categories
        for (const cat of categories) {
            const exists = await Category.findOne({ slug: cat.slug });
            if (!exists) {
                await Category.create(cat);
                console.log(`Categoria criada: ${cat.name}`);
            } else {
                console.log(`Categoria já existe: ${cat.name}`);
            }
        }

        // 2. Get "Outros" category ID
        const outrosCategory = await Category.findOne({ slug: 'outros' });
        if (!outrosCategory) {
            throw new Error('Categoria "Outros" não encontrada!');
        }

        // 3. Update existing products
        const result = await Product.updateMany(
            { category: { $exists: false } }, // Find products without category
            { $set: { category: outrosCategory._id } }
        );

        console.log(`Produtos atualizados: ${result.modifiedCount}`);
        console.log('--- Migração Concluída com Sucesso ---');
        process.exit(0);
    } catch (error) {
        console.error('Erro na migração:', error);
        process.exit(1);

    }
};

migrateCategories();
