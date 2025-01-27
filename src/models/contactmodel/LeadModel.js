// models/Lead.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['NEW', 'IN_PROGRESS', 'CONVERTED', 'LOST'],
        default: 'NEW'
    },
    source: {
        type: String,
        enum: ['WEBSITE', 'PHONE', 'REFERRAL', 'SOCIAL_MEDIA', 'OTHER'],
        required: true
    },
    interests: {
        propertyType: {
            type: String,
            enum: ['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL', 'RURAL']
        },
        budget: {
            min: Number,
            max: Number
        },
        preferredLocations: [String]
    },
    consultant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency'
    },
    notes: [{ 
        text: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastContact: Date,
    nextContactDate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);