const mongoose = require('mongoose');
const User = require('../models/user');

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

//Truoc khi xoa se xoa danh sach nguoi nhan theo doi


const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;