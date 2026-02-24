const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
require('dotenv').config();

const mockProducts = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/condozapv2';
        console.log('Using Mongo URI:', mongoUri.startsWith('mongodb+srv') ? 'Atlas Cluster' : mongoUri);

        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');

        const users = await User.find();
        if (users.length === 0) {
            console.log('Nenhum usuário encontrado para associar aos produtos.');
            process.exit(1);
        }

        const categories = await Category.find();
        if (categories.length === 0) {
            console.log('Nenhuma categoria encontrada para associar aos produtos.');
            process.exit(1);
        }

        const productNames = [
            'Bicicleta Ergométrica', 'Monitor 24 polegadas', 'Mesa de Escritório',
            'Cadeira Gamer', 'Sofá 3 lugares', 'Geladeira Brastemp', 'Microondas Eletrolux',
            'Cooktop 4 bocas', 'Armário de Cozinha', 'Cama Box Casal', 'Guarda-roupas 6 portas',
            'Televisão 50 polegadas', 'Playstation 5', 'Nintendo Switch', 'Xbox Series X',
            'Jogo de Panelas', 'Tapete Sala', 'Lustre Pendente', 'Ventilador de Teto',
            'Ar Condicionado 9000 Btus', 'Aspirador de Pó', 'Cafeteira Expresso', 'Liquidificador',
            'Máquina de Lavar 12kg', 'Secadora de Roupas', 'Purificador de Água',
            'Impressora Multifuncional', 'Mouse sem fio', 'Teclado Mecânico', 'Headset Bluetooth'
        ];

        const productDescriptions = [
            'Produto em ótimo estado, pouquíssimo uso.',
            'Estou vendendo porque comprei um modelo mais novo. Funciona perfeitamente.',
            'Seminovo, ainda na garantia. Acompanha todos os acessórios originais.',
            'Apresenta algumas marcas de uso, mas está 100% funcional. Retirada no local.',
            'Produto excelente, super recomendo. Motivo da venda: mudança.',
            'Nunca foi usado, ganhei de presente e já tinha outro igual.',
            'Único dono, muito bem cuidado. Pode testar na hora.',
            'Oportunidade única! Preço muito abaixo do mercado para vender rápido.',
            'Funciona bem, mas precisa de um pequeno reparo estético.',
            'Acompanha nota fiscal e caixa original.'
        ];

        const productImages = [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop'
        ];

        const TotalProductsToBeCreated = 50;

        console.log(`Criando ${TotalProductsToBeCreated} produtos fakes...`);

        let created = 0;
        for (let i = 0; i < TotalProductsToBeCreated; i++) {
            const randomName = productNames[Math.floor(Math.random() * productNames.length)];
            const randomDesc = productDescriptions[Math.floor(Math.random() * productDescriptions.length)];
            const randomPrice = Math.floor(Math.random() * (2500 - 50 + 1) + 50);
            const selectedUser = users[Math.floor(Math.random() * users.length)];
            const randomCategory = categories[Math.floor(Math.random() * categories.length)]._id;

            const numImages = Math.floor(Math.random() * 3) + 1; // 1 a 3 imagens
            const images = Array.from({ length: numImages }).map(() => productImages[Math.floor(Math.random() * productImages.length)]);

            const newProduct = new Product({
                name: `${randomName} ${i + 1}`,
                description: randomDesc,
                value: randomPrice,
                status: 'enabled',
                user_id: selectedUser._id,
                category: randomCategory,
                images: images,
                condominiums: selectedUser.condominiums
            });

            await newProduct.save();
            created++;
            if (created % 10 === 0) {
                console.log(`${created} produtos criados...`);
            }
        }

        console.log('--- Criação de Mock Concluída com Sucesso ---');
        process.exit(0);
    } catch (error) {
        console.error('Erro no script de mock:', error);
        process.exit(1);
    }
};

mockProducts();