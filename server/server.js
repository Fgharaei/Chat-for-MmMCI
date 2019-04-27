var bodyParser=require('body-parser');
var {mongoose}=require('../db/mongoose');
var {User}=require('../models/user');
var {FOroom}=require('../models/foroom');
var {BOroom}=require('../models/boroom');

const path = require('path');
const publicpath = path.join(__dirname , '../public/')

var express = require('express');
var expressStatic = require('express-static');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;


// var newUser = new User({
//     name: "Mohsen Moadab",
//     personalid: "091113755851",
//
// });
// newUser.save().then((doc) => {
//     console.log(JSON.stringify(doc, undefined, 2));
// }, (err) => {
//     console.log('Unable to save user', err);
// });

app.use(bodyParser.json());
// app.use('/', expressStatic(publicpath));
// console.log(publicpath + "index.html");

app.get('/', function (req, res, next) {
    res.sendFile(publicpath + "index.html");
});

app.post("/chat", (req, res) => {
    console.log(req.body);
    var newuser = new User({
        name: req.body.name,
        personalid: req.body.personalid,
        chatroom: req.body.chatroom,
    });
    newuser.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    })

});

io.on('connection', function (socket) {
    console.log(`One user is connected with ID : ${socket.id}`)

    socket.on("join",function (item,callback) {
        console.log(`your name is ${item}`);
        io.emit('new message', item);
        // callback();
    });

    socket.on('disconnect',function () {
    console.log(`One user is connected`)
});

});



server.listen(port , ()=>{
    console.log(`Server is up on : ${port}`);
});

