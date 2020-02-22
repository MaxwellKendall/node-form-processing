const nodemailer = require('nodemailer');
const express = require('express');
const multer = require('multer')();

const app = express();

// using cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const port = 3000

app.post('/send-email', multer.single('file'), (req, res) => {
    const {
        name,
        preferredContact,
        phone,
        email,
        canvas,
        details
    } = req.body;

    console.log("HELLLOOOOO", req.body, req.file);

    res.send('fun timez');
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

