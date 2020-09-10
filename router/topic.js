const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../upload/image');
const sharp = require('sharp');
const Topic = require('../models/topic');
const router = new express.Router();

//Them topic
router.post('/topics', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.user.admin) {
            throw new Error('Ban khong co quyen admin');
        }
        if (!req.file.buffer) {
            throw new Error('Vui long chon anh cho tieu de')
        }
        const buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500 }).toBuffer();
        const topic = new Topic({
            ...req.body,
            image: buffer
        });
        await topic.save();
        res.status(201).send(topic);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Doc post cua topics
router.get('/postsTopic/:id', async (req, res) => {
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
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    try {
        const topic = await Topic.findOne({ _id: req.params.id });
        if (!topic) {
            throw new Error('Khong tim thay topic');
        }
        await topic.populate({
            path: 'posts',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(topic.posts);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

//Update Topic by admin
router.patch('/topics/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdates = ["name", "description", "image"];
    const isAllowUpdates = updates.every(update => allowUpdates.includes(update));
    if (!isAllowUpdates) {
        return res.status(400).send({ error: 'Vui long nhap key phu hop' });
    }
    try {
        if (!req.user.admin) {
            throw new Error('Ban khong phai la admin');
        }
        const topic = await Topic.findOne({ _id: req.params.id });
        if (!topic) {
            throw new Error('Khong tim thay id');
        }
        updates.forEach(update => topic[update] = req.body[update]);
        await topic.save();
        res.send({ success: 'Update thanh cong', topic: topic });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Delete Topic
router.delete('/topics/:id', auth, async (req, res) => {
    try {
        if (!req.user.admin) {
            throw new Error('Ban khong phai la admin');
        }
        const topic = await Topic.findOne({ _id: req.params.id });
        if (!topic) {
            throw new Error('Khong tim thay id');
        }
        await topic.remove();
        res.send({ success: 'Xoa thanh cong' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

//Get all Topic
router.get('/alltopic', async (req, res) => {
    try {
        const topic = await Topic.find({});
        res.send(topic);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

module.exports = router;