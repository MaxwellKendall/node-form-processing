const nodemailer = require('nodemailer');
const path = require('path');
const express = require('express')
const app = express()
var cors = require('cors')
app.use(express.json()) // for parsing application/json
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const port = 3000

app.get('/', (req, res) => {
    // const {
    //     name,
    //     preferredContact,
    //     budget,
    //     size,
    //     desc
    // } = req.body;

    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));    
})

app.get('/test', cors(), (req, res) => {
    console.log("wut");
})

app.post('/send-email', cors(), (req, res) => {
    // const {
    //     name,
    //     email,
    //     details
    // } = req.body;

    console.log("HELLLOOOOO");

    res.send('fun timez');
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

