const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }, (error, client) => {
    if (error) {
        return console.log('Ket noi that bai');
    }

    console.log('Ket noi thanh cong');
})