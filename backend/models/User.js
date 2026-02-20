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
    },
    points: {
        type: Number,
        default: 0
    },
    badges: {
        type: Array,
        default: ['']
    },
    checkedBadges: {
        type: Array,
        default: []
    },
    smsVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
