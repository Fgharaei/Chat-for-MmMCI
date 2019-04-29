const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: "این ایمیل معتبر نیست."
        }
    },
    pass: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
    },
    tokens: [{
        access: {
            type: String,
            required: true

        },
        token: {
            type: String,
            equired: true
        }
    }],
});
UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;
    try {
        decoded = jwt.verify(token, 'abcd1234');
    } catch (err) {
       return Promise.reject();
    }
    ;
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });

};

UserSchema.methods.toJSON = function () {
  var user =this;
  var userObject = user.toObject();
  return _.pick(userObject, ['email']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(),access},'abcd1234').toString();
    user.tokens.push({access , token});
    return user.save().then(()=>{
        return token;
    });
};

UserSchema.pre('save', function (next) {
    var user = this;
    if(user.isModified('pass')){
        bcrypt.genSalt(12, (err,salt)=>{
           bcrypt.hash(user.pass , salt , (err , hash)=>{
              user.pass = hash;
              next();
           });
        });
    }else {
        next();
    }
    
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};
