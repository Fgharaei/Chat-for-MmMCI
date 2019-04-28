var bodyParser=require('body-parser');
var {mongoose}=require('../db/mongoose');
var {User}=require('../models/user');
var {FOroom}=require('../models/foroom');
var {BOroom}=require('../models/boroom');
var {ObjectID} = require("mongodb");
const path = require('path');
const publicpath = path.join(__dirname , '../public/')
const _ = require('lodash');
var express = require('express');
var expressStatic = require('express-static');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;


// var newFOroom = new FOroom({
//     name: "Mohsen Moadab",
//     personalid: "091113755851",
//
// });
// newFOroom.save().then((doc) => {
//     console.log(JSON.stringify(doc, undefined, 2));
// }, (err) => {
//     console.log('Unable to save foroom', err);
// });

app.use(bodyParser.json());
// app.use('/', expressStatic(publicpath));
// console.log(publicpath + "index.html");

app.get('/', function (req, res, next) {
    res.sendFile(publicpath + "index.html");
});

app.post("/user",(req,res)=>{
    var body = _.pick(req.body,["email","pass"]);
    var newuser = new User(body);

    newuser.save().then(()=> {
        return newuser.generateAuthToken();
    }).then((token)=>{
        res.header('x-auth',token).send(newuser);
     }).catch((err)=>{
        res.status(400).send(err);
    });
});
app.post("/chat", (req, res) => {
    console.log(req.body);
    var newforoom = new FOroom({
        name: req.body.name,
        personalid: req.body.personalid,
        chatroom: req.body.chatroom,
    });
    newforoom.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get("/chat",(req,res)=>{
    FOroom.find().then((doc)=>{
        res.send(doc);
    },(err)=>{
        res.status(400).send(err);
    });
});
app.get("/chat/:id", (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    };
    FOroom.findById(id).then((foroom) => {
        if (!foroom) {
            return res.status(404).send();
        };
        res.send(foroom);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.delete("/chat/:id", (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    };
    // FOroom.findByIdAndRemove(id).then((foroom) => {
    FOroom.findOneAndDelete({_id : new ObjectID(id)}).then((foroom) => {
    // FOroom.findOneAndDelete({name : "Armin Maaf"}).then((foroom) => {
        if (!foroom) {
            return res.status(404).send();
        };
        res.send(foroom);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.patch("/chat/:id", (req, res) => {
    var id = req.params.id;
    body = _.pick(req.body, ["name", "personalid", "chatroom", "ischanged"]);
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    ;
    if (_.isBoolean(body.ischanged) && body.ischanged) {
        body.changetime = new Date().getTime();
        FOroom.findByIdAndUpdate(id, {$set: body},{new: true}).then((foroom) => {
            res.send(foroom);
        }, (err) => {
            res.status(400).send(err);
        });
    } else {
        res.send("Please define 'ischanged' property");
    }
    ;
});


io.on('connection', function (socket) {
    console.log(`One foroom is connected with ID : ${socket.id}`)

    socket.on("join",function (item,callback) {
        console.log(`your name is ${item}`);
        io.emit('new message', item);
        // callback();
    });

    socket.on('disconnect',function () {
    console.log(`One foroom is connected`)
});

});



server.listen(port , ()=>{
    console.log(`Server is up on : ${port}`);
});

