const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    comment: {
        type: String,
        required: true,
        trim: true
    },
    ownPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    ownUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;