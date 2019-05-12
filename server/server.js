var bodyParser=require('body-parser');
var {mongoose}=require('../db/mongoose');
var {User}=require('../models/user');
var {FOroom}=require('../models/foroom');
var {BOroom}=require('../models/boroom');
var {ObjectID} = require("mongodb");
const path = require('path');
const publicpath = path.join(__dirname , '../public/')
const provincepath = path.join(__dirname , '../../')
const _ = require('lodash');
var express = require('express');
var expressStatic = require('express-static');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var {authenticate} = require('./../midelwares/authenticate');

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

app.post("/user/admin",(req,res)=>{
    var body = _.pick(req.body,["email","pass"]);
    var newuser = new User(req.body);
    newuser.save().then(()=> {
        // return newuser.generateAuthToken();
        return Promise.resolve();
    }).then((token)=>{
        res.header('x-auth',token).send(newuser);
     }).catch((err)=>{
        res.status(400).send(err);
    });
});

app.post("/user/login", (req, res) => {
    var body = _.pick(req.body, ['email', 'pass']);
    User.findByCredentials(body.email, body.pass).then((user) => {
        user.removeToken('auth').then(() => {
            User.findByCredentials(body.email, body.pass).then((user) => {
                return user.generateAuthToken().then((token) => {
                    user.temptoken = token;
                    res.header('x-auth', token).send(user);
                });
            }).catch((err) => {
                res.status(401).send(err);
            });
        });
    }).catch((err) => {
        res.status(401).send(err);
    });
});

app.delete("/user/logout" , authenticate , (req , res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send(req.user);
    }).catch((err)=>{
        res.status(400).send("Can not logout");
    })

});

app.post("/user/me", authenticate , (req, res) => {
    var user = req.user;
    var body = req.body;
    console.log(body[0].Province);
    console.log(body[0].FileName);
    // res.send(user);

    var provincepathfile = provincepath + body[0].Province +"/";
    console.log(provincepathfile);
    res.sendFile(provincepathfile + body[0].FileName);

});

app.get("/mmmci/sitephoto/:siteCode/:photoCat/:photoIndex", authenticate , (req, res) => {
    var siteCode = req.params.siteCode;
    var photoCat = req.params.photoCat;
    var photoIndex = req.params.photoIndex;
    var photoCatUrl = photoCat.replace("-","/");
    // var photoCat = req.photoCat;
    if (photoIndex === "null") {
        console.log(siteCode);
        const cranePhotoPath = path.join(__dirname, `../../sitephoto/${siteCode}/Crane Access/`);
        console.log(cranePhotoPath);
        res.sendFile(cranePhotoPath + '1.JPG');
    }else{
        console.log(photoCat);
        console.log(photoCatUrl);
        const cranePhotoPath = path.join(__dirname, `../../sitephoto/${siteCode}/${photoCatUrl}/`);
        console.log(cranePhotoPath);
        res.sendFile(cranePhotoPath + photoIndex);
    }
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

