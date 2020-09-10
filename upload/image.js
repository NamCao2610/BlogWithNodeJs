const multer = require('multer');
//Khai bao upload 
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg||jpeg||png)$/)) {
            cb(new Error('Ban phai chon file jpg jpeg png'));
        }

        cb(undefined, true)
    }
})

module.exports = upload;
