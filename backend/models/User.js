const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    telefone: {
        type: String,
        required: true
    },
    apartment: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['default', 'admin'],
        default: 'default'
    },
    photo: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
