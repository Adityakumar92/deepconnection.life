const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    serviceType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    programType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
