const path = require('path');
const express = require('express');
const memoryStorage = require('multer').memoryStorage();
const upload = require('multer')({ storage: memoryStorage });
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// allowing CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

AWS.config.update({ region: 'us-east-1' });

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
    SES: new AWS.SES({
        apiVersion: '2010-12-01'
    })
});

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, "./index.html"));
});

app.post('/send-email', upload.single('file'), (req, res) => {
    const {
        name,
        preferredContact,
        phone,
        email,
        canvas,
        details
    } = req.body;

    const attachment = req.file;
    // send some mail
    transporter.sendMail(
        {
            from: 'info@ckendallart.com',
            to: 'info@ckendallart.com',
            subject: `Commission Request from ${name}`,
            html: `
                <h1>${name}'s Request for a Commission:</h1>
                <h2>Preferred Contact: ${preferredContact}</h2>
                <h2>Phone: ${phone}</h2>
                <h2>Email: ${email}</h2>
                <h2>Canvas Size: ${canvas}</h2>
                <p>Additional Details: ${details}</p>
            `,
            attachments: [{
                filename: attachment.originalname,
                contentTransferEncoding: 'base64',
                content: attachment.buffer
            }]
        },
        (err, info) => {
            console.log("err", err, info);
            // console.log(info.envelope);
            // console.log(info.messageId);
        }
    );

    res.send('fun timez');
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

