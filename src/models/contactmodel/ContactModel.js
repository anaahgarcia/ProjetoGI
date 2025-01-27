// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['LEAD', 'BUYER', 'SELLER', 'RENTER', 'OWNER'],
        default: 'LEAD'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'CONVERTED'],
        default: 'ACTIVE'
    },
    address: String,
    notes: String,
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency'
    },
    consultant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('Contact', contactSchema);