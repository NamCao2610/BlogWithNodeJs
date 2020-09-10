const mongoose = require('mongoose');
const Comment = require('./comment');
const Topic = require('./topic');

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: Buffer
    },
    published: {
        type: Boolean,
        default: false
    },
    ownUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ownTopic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    }
}, {
    timestamps: true
})

//Them property ao chua comment cau post
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'ownPost'
})

postSchema.methods.toJSON = function () {
    const post = this;

    const postObject = post.toObject();
    delete postObject.image

    return postObject;
}

//Truoc khi xoa post se xoa ca comment
postSchema.pre('remove', async function (next) {
    const post = this;
    await Comment.deleteMany({ ownPost: post._id });

    next();
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;