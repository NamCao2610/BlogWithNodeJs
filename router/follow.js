const express = require('express');

const router = new express.Router();
const Follow = require('../models/follow');
const User = require('../models/user');
const auth = require('../middleware/auth');

//Them nguoi theo doi
router.post('/follows', auth, async (req, res) => {
    const user = req.body.follow_id;
    if (user == req.user._id) {
        return res.status(500).send({ error: 'Khong the tu theo doi ban than' });
    }
    const follow = new Follow({
        follow_id: user,
        ownUser: req.user._id
    })
    try {
        await follow.save();
        const usersFollowed = await User.findOne({ _id: user });
        usersFollowed.usersFollow.push({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email
        })
        await usersFollowed.save();
        res.status(201).send(follow);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Xem thong tin nguoi theo doi cua user dang nhap
router.get('/follows', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.follow_id) {
        match.follow = req.query.follow_id
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'follows',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.follows);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

//Xoa follow
router.delete('/follows/:id', auth, async (req, res) => {
    try {
        const follow = await Follow.findOne({ _id: req.params.id, ownUser: req.user._id });
        if (!follow) {
            return res.status(404).send('Not found id!');
        }
        await follow.remove();
        const user = follow.follow_id;
        const usersFollowed = await User.findOne({ _id: user });
        usersFollowed.usersFollow = usersFollowed.usersFollow.filter(followed => followed._id !== req.user._id);
        await usersFollowed.save();
        res.send({ sucess: 'Xoa follow thanh cong' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

module.exports = router;