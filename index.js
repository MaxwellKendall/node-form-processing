const path = require('path');
const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const bodyParser = require('body-parser');
var serverless = require('serverless-http');
const fs = require('fs');

const app = express();
const port = 3000;

const s3Url = 'https://ckendallart.s3.amazonaws.com';

// allowing CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

AWS.config.update({ region: 'us-east-1' });
AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: 'serverless' })

// create SES emailer
const emailClient = new AWS.SES({ apiVersion: '2010-12-01' });

// create S3 client
const s3Client = new AWS.S3({ apiVersion: '2006-03-01', region: 'us-east-1' });
;

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, "./index.html"));
});

app.post('/send-email', (req, res) => {
    const {
        name,
        preferredContact,
        phone,
        email,
        canvas,
        details,
        attachment
    } = req.body;

    let html = `<h1>${name}'s Request for a Commission:</h1>
        <h2>Preferred Contact: ${preferredContact}</h2>
        <h2>Phone: ${phone}</h2>
        <h2>Email: ${email}</h2>
        <h2>Canvas Size: ${canvas}</h2>
        <p>Additional Details: ${details}</p>
    `;

    if (attachment) {
        fs.writeFileSync(`/tmp/${attachment.name}`, attachment.content.split('base64,')[1], { encoding: 'base64' });
        
        const file = fs.readFileSync(`/tmp/${attachment.name}`);
        const parsedFileName = attachment.name
            .split('')
            .filter((char) => char !== ' ')
            .join('');

        s3Client.putObject({
            Body: file,
            Bucket: 'ckendallart',
            Key: parsedFileName,
            // ServerSideEncryption: "AES256", 
            StorageClass: "STANDARD"
        }, (err, data) => {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                // successful response
                console.log('success', data);
            }
        });

        html = `${html}<a href=${s3Url}/${parsedFileName}>Link to Picture</a>`;
    }

    // send some mail
    emailClient.sendEmail(
        {
            Destination: {
                CcAddresses: [
                    "maxwell.n.kendall@gmail.com"
                ],
                ToAddresses: [
                    "info@ckendallart.com"
                ]
               }, 
               Message: {
                Body: {
                 Html: {
                  Charset: "UTF-8", 
                  Data: html
                 }, 
                 Text: {
                  Charset: "UTF-8", 
                  Data: `Commission request from ${name}, preferred contact is ${preferredContact}, email: ${email}, phone: ${phone}, details: ${details}, canvas size: ${canvas}`
                 }
                }, 
                Subject: {
                 Charset: "UTF-8", 
                 Data: `Commission Request from ${name}`
                }
               }, 
               ReplyToAddresses: [
                   `${email}`
               ], 
               Source: "info@ckendallart.com"
        },
        (err, data) => {
            console.log("WUT IS HAPPENING v2");
            if(err) console.log("error", err);
            else console.log("data", data);
            res.send("success");
        });
})

// app.listen(port, () => console.log(`Example app listening on port ${port}!`))
module.exports.handler = serverless(app);
