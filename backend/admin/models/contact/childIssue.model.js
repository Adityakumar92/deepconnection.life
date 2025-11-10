const mongoose = require('mongoose');

const childIssueSchema = new mongoose.Schema({
    issue: {
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

module.exports = mongoose.model('ChildIssue', childIssueSchema);