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

    Username: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
    },
    Phone: {
        type: String,
        trim: true,
    },
    Date: {
        type: String,
        trim: true,
    },
    Fname: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
    },
    Lname: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
    },
    Province: {
        type: String,
        required: true,
        trim: true,
    },
    IDnumber: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
    },
    temptoken: {
        type: String,
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
  return _.pick(userObject, ['email', 'Username' ,'Fname' , 'Lname' , 'IDnumber' , 'temptoken']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = "auth";
     var token = jwt.sign({_id: user._id.toHexString(),access},'abcd1234', { expiresIn: 6 * 60 * 60 }).toString();
    user.tokens.push({access , token});
    return user.save().then(()=>{
        return token;
    });
 };

UserSchema.methods.removeToken = function (token) {
    var user = this;
    var dtoken = token.toString();
    console.log(dtoken);
    return user.update({
        $pull: {
            tokens: {dtoken}
        }
    });
};

UserSchema.statics.findByCredentials = function (email, pass) {
    var User = this;
    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject("User by this email has not been registered");
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(pass, user.pass, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject("Wrong password");
                }
                ;
            });
        });
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
