const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    consultantRequested: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    consultantResponsible: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['REQUESTED', 'SCHEDULED', 'EXECUTED', 'CANCELLED', 'RESCHEDULED'],
        default: 'REQUESTED'
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    executionDate: Date,
    duration: Number, // em minutos
    cancellationReason: String,
    visitNotes: {
        clientInterest: {
            type: String,
            enum: ['HIGH', 'MEDIUM', 'LOW', 'NONE']
        },
        clientFeedback: String,
        internalNotes: String
    },
    rescheduleHistory: [{
        oldDate: Date,
        newDate: Date,
        reason: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: {
            type: Date,
            default: Date.now
        }
    }],
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Visit', visitSchema);