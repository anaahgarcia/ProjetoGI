const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: ['BUYER', 'SELLER', 'TENANT', 'OWNER'],
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'IN_NEGOTIATION', 'CLOSED'],
        default: 'ACTIVE'
    },
    documents: {
        cpf: String,
        rg: String,
        proofOfIncome: String,
        proofOfResidence: String
    },
    address: {
        street: String,
        number: String,
        complement: String,
        neighborhood: String,
        city: String,
        state: String,
        zipCode: String
    },
    preferences: {
        propertyTypes: [String],
        priceRange: {
            min: Number,
            max: Number
        },
        preferredLocations: [String],
        features: [String]
    },
    financialInfo: {
        income: Number,
        preApproved: Boolean,
        bank: String,
        approvedAmount: Number
    },
    consultant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true
    },
    properties: [{
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property'
        },
        status: {
            type: String,
            enum: ['INTERESTED', 'VISITED', 'NEGOTIATING', 'REJECTED']
        },
        date: Date
    }],
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
    convertedFromLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);