const sgMail = require('@sendgrid/mail');

const sendGridApiKey = process.env.SEND_GRID_API_KEY;

sgMail.setApiKey(sendGridApiKey);

const verifiedUser = (email, name, link) => {
    sgMail.send({
        to: email,
        from: 'namdepzai2610@gmail.com',
        subject: `${name}, Vui long xac nhan tai khoan cua ban`,
        html: `<p>Chao ban ${name}, ban hay truy cap link sau de xac nhan tai khoan <a>${link}</a></p>`
    })
}

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'namdepzai2610@gmail.com',
        subject: `Chao ban de voi app cua minh`,
        text: `Chao mung ban ${name} den voi app cua minh hi vong ban se co nhung giay phut trai nghiem hay nhat`
    })
}

const sendByeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'namdepzai2610@gmail.com',
        subject: `Tam biet ${name} . Hen gap lai ban`,
        text: `Tam biet ${name} Hi vong lan sau se gap lai ban nhe`
    })
}

const sendCodeResetPassword = (email, name, code) => {
    sgMail.send({
        to: email,
        from: 'namdepzai2610@gmail.com',
        subject: `Chao ${name} Vui long nhap code nay de lay lai mat khau`,
        text: `Day la code cua ban ${code} . Vui long nhap code nay de lay lai mat khau cua ban`
    })
}

module.exports = {
    verifiedUser,
    sendWelcomeMail,
    sendByeMail,
    sendCodeResetPassword
}