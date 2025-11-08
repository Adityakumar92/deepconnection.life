const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: 0
    },
},{
    timestamps: true
})

module.exports = mongoose.model('Service', serviceSchema);