const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
}) 

module.exports = mongoose.model('Suggestion', suggestionSchema);