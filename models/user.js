const mongoose = require('mongoose');
const validator = require('validator');
const randomString = require('random-string');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Post = require('./post');
const Follow = require('./follow');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Vui long nhap dung email');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },
    age: {
        type: String,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Tuoi phai lon hon 0');
            }
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: Buffer
    },
    usersFollow: [{
        _id: {
            type: String,
        },
        name: {
            type: String,
        },
        email: {
            type: String,
        }
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    restorePasswordCode: {
        type: String
    }
}, {
    timestamps: true
})

//Tao 1 property ao cua User noi voi Post
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'ownUser'
})

//Tao 1 property ao cua USer voi follow
userSchema.virtual('follows', {
    ref: 'Follow',
    localField: '_id',
    foreignField: 'ownUser'
})

//An cac thong tin mat
userSchema.methods.toJSON = function () {
    const user = this;

    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    delete userObject.restorePasswordCode

    return userObject;
}

//Tao method Tao token 
userSchema.methods.createToken = async function () {
    const user = this;

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET)

    user.tokens.push({ token: token });
    await user.save();
    return token;
}

//Ham dang nhap User
userSchema.statics.LoginUser = async (email, password) => {

    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
        throw new Error('Khong phai user');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Mat khau khong dung');
    }

    return user;
}

//Chuan bi save neu gap password se hash
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

//Chuan bi xoa user se xoa post
userSchema.pre('remove', async function (next) {
    const user = this;
    await Post.deleteMany({ ownUser: user._id });
    await Follow.deleteMany({ ownUser: user._id });
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;