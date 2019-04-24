const path = require('path');
const publicpath = path.join(__dirname , '../public/')

var express = require('express');
var expressStatic = require('express-static');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;


// app.use('/', expressStatic(publicpath));
console.log(publicpath + "index.html");
app.get('/',function(req,res,next){

     res.sendFile(publicpath+"index.html");
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

