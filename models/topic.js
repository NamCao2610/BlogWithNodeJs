const mongoose = require('mongoose');
const Post = require('./post');

const topicSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: Buffer
    }
}, {
    timestamps: true
})

//An cac thong tin mat
topicSchema.methods.toJSON = function () {
    const topic = this;
    const topicObject = topic.toObject();

    delete topicObject.image

    return topicObject;
}

//Them thuoc tinh ao posts
topicSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'ownTopic'
})

//Xoa post sau khi xoa topic
topicSchema.pre('remove', async function (next) {
    const topic = this;

    await Post.deleteMany({ ownTopic: topic._id });

    next();
})

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;