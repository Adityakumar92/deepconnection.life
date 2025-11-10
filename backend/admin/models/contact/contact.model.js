const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    childIssue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChildIssue',
        required: true
    },
    message: {
        type: String,
    },
    website: {
        type: Number,
        default: 0,  // 0 - deepconnection, 1- kiddicove
        required: true
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Contact', contactSchema);