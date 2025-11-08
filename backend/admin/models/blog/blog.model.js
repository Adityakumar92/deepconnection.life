const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    contentType: {
        type: String,
        required: true,
        enum: ['article', 'news', 'story', 'tutorial'],
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    publicationStatus: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    content: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true,
        trim: true
    },
    authorPosition: {
        type: String,
        required: true,
        trim: true
    },
    readTime: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: null
    },
    tags: {
        type: [String],
        default: []
    }
},{
    timestamps: true
}) 

module.exports = mongoose.model('Blog', blogSchema);