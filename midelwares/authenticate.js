const {User} = require('./../models/user');

var authenticate = (req ,res ,next)=>{
    var token = req.header('x-auth');
    // var photoCat = req.header('photoCat');
    User.findByToken(token).then((user)=>{
        if(!user){
            return Promise.reject();
        }else {
            req.user = user;
            req.token = token;
            // req.photoCat = photoCat;
            next();
        };
    }).catch((err)=>{
        res.status(401).send('User is not valid');
    });
};

module.exports = {authenticate};