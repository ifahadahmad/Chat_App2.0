var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

var UserSchema = new mongoose.Schema({
    username: {
        type:String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    imageUrl:{
        type: String,
        default:"/img/user.png"
    },
    friendRequest: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    friends: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
})
UserSchema.pre("save",function(next){
    var user = this;
    if(!user.isModified("password")) return next();
    bcrypt.hash(user.password,10).then(function(hashesPassword){
        user.password = hashesPassword;
        next();
    },function(err){
        next(err);
    });
});
UserSchema.methods.comparePassword = function(candidatePassword,next){
    bcrypt.compare(candidatePassword,this.password,function(err,isMatch){
        if(err) return next(err);
        next(null,isMatch);
    });
};
var User = mongoose.model("User",UserSchema);
module.exports= User;