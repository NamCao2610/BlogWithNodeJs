const express = require('express');
const sharp = require('sharp');
const router = new express.Router();
const User = require('../models/user');
const { verifiedUser, sendWelcomeMail, sendByeMail, sendCodeResetPassword } = require('../emails/account');
const upload = require('../upload/image');
const auth = require('../middleware/auth');
const randomString = require('random-string');

//Dang ki tai khoan moi
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const link = 'localhost:3000/users/verified';
        verifiedUser(user.email, user.name, link);
        const token = await user.createToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Dang nhap tai khoan
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.LoginUser(req.body.email, req.body.password);
        const token = await user.createToken();
        res.status(200).send({ user, token });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Verified user
router.get('/users/verified', auth, async (req, res) => {

    try {

        if (req.user.isVerified) {
            throw new Error('Ban da xac thuc tai khoan nay roi');
        }

        req.user.isVerified = true;
        await req.user.save();
        sendWelcomeMail(req.user.email, req.user.name);
        res.send({ success: 'Ban da xac thuc tai khoan thaanh cong' });

    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

//Get User dang nhap
router.get('/users/me', auth, async (req, res) => {
    try {
        res.send(req.user);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

//Get all user
router.get('/users', async (req, res) => {
    try {
        const user = await User.find({});
        res.send(user);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

//Logout User
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(user => {
            user.token !== req.token
        })
        await req.user.save();
        res.send({ success: 'Ban da dang xuat tai khoan thanh cong' });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//LogoutAll User
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = undefined;
        await req.user.save();
        res.send({ success: 'LogoutAll thanh cong' });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Update user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdate = ["name", "email", "password", "age"];
    const isMatch = updates.every(update => allowUpdate.includes(update));
    if (!isMatch) {
        return res.status(400).send('Vui long nhap key phu hop');
    }
    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send({ success: 'Update thanh cong', user: req.user });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Delete User
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendByeMail(req.user.email, req.user.name);
        res.send({ success: 'Xoa user thanh cong' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

//Forgot Password
router.post('/users/forgotPassword', async (req, res) => {
    const keys = Object.keys(req.body);
    const allowKeys = ["email"];
    const isAllow = keys.every(key => allowKeys.includes(key));
    if (!isAllow) {
        return res.status(400).send({ error: 'Key khong phu hop' });
    }
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            throw new Error('Khong phai email');
        }
        user.restorePasswordCode = randomString();
        await user.save();
        sendCodeResetPassword(user.email, user.name, user.restorePasswordCode);
        res.send({ success: 'Da gui code reset' });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Change Password
router.post('/users/changePassword', async (req, res) => {
    const keys = Object.keys(req.body);
    const allowKeys = ["email", "password", "code"];
    const isAllow = keys.every(key => allowKeys.includes(key));
    if (!isAllow) {
        return res.status(400).send({ error: 'Key khong phu hop' });
    }
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            throw new Error('Khong phai user');
        }
        if (req.body.code !== user.restorePasswordCode) {
            throw new Error('Code khong phu hop');
        }
        user.password = req.body.password
        user.restorePasswordCode = undefined;
        await user.save();
        const token = await user.createToken();
        res.send({ success: 'Thay doi mat khau thanh cong', user: user, token: token });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
})

//Upload avatar

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 200, height: 200 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({ success: 'Upload thanh cong' });
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})

//Delete Avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send({ success: 'Xoa thanh cong' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

//Get Avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user || !user.avatar) {
            throw new Error('Khong ton tai user hoac user ko co avatar');
        }

        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

module.exports = router;