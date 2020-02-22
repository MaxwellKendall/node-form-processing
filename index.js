const path = require('path');
const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer')();

const app = express();
const port = 3000;

AWS.config.update({ region: 'us-east-1'});

// using cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, "./index.html"));
});

app.post('/send-email', multer.single('file'), (req, res) => {
    const {
        name,
        preferredContact,
        phone,
        email,
        canvas,
        details
    } = req.body;

    // Create sendEmail params 
    const params = {
        Destination: { /* required */
            ToAddresses: ['info@ckendallart.com']
        },
        Message: { /* required */
            Body: { /* required */
                Text: {
                    Charset: "UTF-8",
                    Data: details
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: `Commission Request from ${name}`
            }
        },
        Source: 'info@ckendallart.com', /* required */
        ReplyToAddresses: [
            email
        /* more items */
        ],
    };
  
    // Create the promise and SES service object
    new AWS.SES({apiVersion: '2010-12-01'})
        .sendEmail(params)
        .promise()
            .then((data) => {
                console.log(data.MessageId);
                res.send('fun timez');
            })
            .catch((err) => {
                console.error(err, err.stack);
                res.send('error');
            });
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

