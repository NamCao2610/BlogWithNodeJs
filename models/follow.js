const mongoose = require('mongoose');

const followSchema = mongoose.Schema({
    follow_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    ownUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;