const {mongoose} = require("../db/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

var UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        minlength: 5
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    tokens:[{
        access:{
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'username']);
  };

UserSchema.statics.findByCredentials = function(username, password){
    var User = this;
     return User.findOne({username}).then((user) => {
        if(!user){
            Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(res){
                    resolve(user)
                }else{
                    reject();
                }
            })
        })
    })
}

UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;
    try{
        decoded = jwt.verify(token, "abc123");
    }catch(e){

    }
    return User.findOne({
        '_id':decoded._id,
        'tokens.access':'auth',
        'tokens.token':token
    })
}  

UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = "auth";
    var token = jwt.sign({
        _id: user._id,
        access: access
    }, "abc123").toString();
    user.tokens.push({access,token});
    return user.save().then(() => {
        return token;
    })
}

UserSchema.pre("save", function(next){
    var user = this;
    if(user.isModified("password")){
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                if(!err){
                    user.password = hash;
                    next();
                }
            })
        })
    }else{
        next();
    }
})
module.exports = mongoose.model("User", UserSchema);
