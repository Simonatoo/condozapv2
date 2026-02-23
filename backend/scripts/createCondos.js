const mongoose = require('mongoose');
const Condominium = require('../models/Condominium');
require('dotenv').config();

const createCondos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected:', process.env.MONGO_URI);

        const condos = [
            {
                name: 'MAPP Barra Funda Perdizes',
                address: 'Rua A',
                city: 'São Paulo',
                state: 'SP',
                zip: '01000-000',
                country: 'Brasil',
                phone: '11999999999',
                email: '',
                website: 'https://condominioa.com.br',
                logo: 'https://condominioa.com.br/logo.png',
                description: 'Condomínio A',
            },
            {
                name: 'MAPP Barra Funda Água Branca',
                address: 'Rua B',
                city: 'São Paulo',
                state: 'SP',
                zip: '01000-000',
                country: 'Brasil',
                phone: '11999999999',
                email: '',
                website: 'https://condominiob.com.br',
                logo: 'https://condominiob.com.br/logo.png',
                description: 'Condomínio B',
            },
        ];

        await Condominium.insertMany(condos);
        console.log('Condos created successfully');
    } catch (error) {
        console.error('Error creating condos:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB Disconnected');
    }
};

createCondos();