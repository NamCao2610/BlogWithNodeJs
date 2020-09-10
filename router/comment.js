const express = require('express');

const router = new express.Router();
const Comment = require('../models/comment');
const auth = require('../middleware/auth');
const Post = require('../models/post');

//Them comment
router.post('/comments', auth, async (req, res) => {
    const comment = new Comment({
        ...req.body,
        ownUser: req.user._id,
    })
    try {
        await comment.save();
        res.status(201).send(comment);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Hien comment tu posts
router.get('/postComment/:id', async (req, res) => {
    const match = {};
    const sort = {};
    if (req.query.comment) {
        match.comment = req.query.comment
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? 1 : -1;
    }
    try {
        const post = await Post.findOne({ _id: req.params.id });
        if (!post) {
            throw new Error('Khong tim thay id ');
        }
        await post.populate({
            path: 'comments',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(post.comments);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

//Update comments
router.patch('/comments/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdates = ["comment"];
    const isAllowUpdates = updates.every(update => allowUpdates.includes(update));
    if (!isAllowUpdates) {
        return res.status(400).send({ error: 'Vui long nhap dung key' });
    }
    try {
        const comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) {
            throw new Error('Khong tim thay id')
        }
        updates.forEach(update => comment[update] = req.body[update]);
        await comment.save();
        res.send({ success: 'Update thanh cong', comment });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Delete comment
router.delete('/comments/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) {
            throw new Error('Khong tim thay id');
        }
        await comment.remove();
        res.send({ success: 'Xoa thanh cong' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

module.exports = router;