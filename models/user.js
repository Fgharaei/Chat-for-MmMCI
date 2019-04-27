const mongoose = require('mongoose');

var User = mongoose.model('User',{
    name:{
        type: String,
        required: true,
        minlength: 1,
        trim: true,
    },
    personalid:{
        type: String,
        required: true,
        trim: true,
        minlength: 1,
    },
    chatroom:{
        type: String,
        default: null
    },
    ischanged:{
        type: Boolean,
        default: false
    },
    changetime:{
        type: String,
        default: null
    }
});

module.exports = {User};
