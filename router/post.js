const express = require('express');
const Post = require('../models/post');
const auth = require('../middleware/auth');
const upload = require('../upload/image');
const sharp = require('sharp');
const User = require('../models/user');
const router = new express.Router();

//Them post moi
router.post('/posts', auth, upload.single('image'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500 }).toBuffer();
        const post = new Post({
            ...req.body,
            ownUser: req.user._id,
            image: buffer
        })
        await post.save();
        res.send(post);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Doc tat ca cac post cua user
router.get('/posts', auth, async (req, res) => {
    const match = {};
    const sort = {};
    if (req.query.title) {
        match.title = req.query.title
    }
    if (req.query.published) {
        match.published = req.query.published === true
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'posts',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.posts);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

//Lay post theo id

router.get('/posts/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, ownUser: req.user._id });
        if (!post) {
            throw new Error('Khong dung id');
        }
        res.send(post)
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Update post by id
router.patch('/posts/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdates = ["title", "body", "image", "published"];
    const isAllowUpdate = updates.every(update => allowUpdates.includes(update));
    if (!isAllowUpdate) {
        return res.status(400).send({ error: 'Vui long nhap key phu hop' });
    }
    try {
        const post = await Post.findOne({ _id: req.params.id, ownUser: req.user._id });
        if (!post) {
            throw new Error('Id khong phu hop xem lai');
        }
        updates.forEach(update => post[update] = req.body[update]);
        await post.save();
        res.send({ success: 'Update thanh cong', post: post });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Delete post by id
router.delete('/posts/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, ownUser: req.user._id });
        if (!post) {
            throw new Error('Khong tim thay id');
        }
        await post.remove();
        res.send({ success: "Xoa thaanh cong" });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

//Lay tat ca post 
router.get('/allposts', async (req, res) => {
    try {
        const post = await Post.find({});
        res.send(post);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})


module.exports = router;