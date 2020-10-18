const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server,{origins: '*:*'});
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
var db = require("./models");
var jwt = require("jsonwebtoken");
const cors =require("cors");
const auth = require("./middlewares/auth");
app.use(express.static("public"));
app.use(fileUpload());
io.on("connection",socket=>{
    console.log("User is connected to server");
});
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/",(req,res)=>{
    res.send("This is server");
});
const login = (req,res) =>{
    db.User.findOne({username: req.body.username}).then(function(user){
        user.comparePassword(req.body.password,function(err,isMatch){
            if(isMatch){
                jwt.sign({userId:user.id,username:user.username},"thisissecret",function(err,token){
                res.cookie("token",token,{httpOnly:true});
                // io.emit("user-connected",user.username);
                res.status(200).json("msg:Success");
                });
            }
            else {
                res.status(400).json({message:"invalid problem"})
            }
        })
    }).catch(function(err){
        res.status(400).json({message:err});
    })
}
const signUp = (req,res)=>{
    db.User.create(req.body).then(function(user){
        jwt.sign({userId:user.id,username:user.username},"thisissecret",function(err,token){
            res.cookie("token",token,{httpOnly:true});
            // io.emit("user-connected",user.username);
            res.status(200).json({msg:"Success"})
        });
    }).catch(function(err){
        console.log(err);
        res.status(400).json({msg:"err"});
    });
}   
app.post("/api/signup",signUp);
app.post("/api/login",login);
app.post("/api/upload",function(req, res){
    var userId;
    if(!req.files){
        res.status(500).send({msg:"file not found"});
    }
    else {
        const myFile = req.files.file;
        myFile.mv(`${__dirname}/public/img/${myFile.name}`,function(err){
            if (err) {
                console.log(err)
                return res.status(500).send({ msg: "Error occured" });
            }
            var token = req.cookies.token;
            jwt.verify(token,"thisissecret",function(err,decoded){
                if(decoded){
                    userId=decoded.userId;
                }else{
                    res.json("error");
                }
            });
           db.User.findByIdAndUpdate(userId,{imageUrl:`/img/${myFile.name}`},{new:true}).then(function(user){
                res.json({imageUrl:user.imageUrl});
           }).catch(function(err){
               res.json({err});
           });
        });
    }  
})
app.get("/api",auth.loginRequired,(req,res)=>{
    var username;
    var friends=[];
    var friendRequest=[];
    var userId;
    var token = req.cookies.token;
            jwt.verify(token,"thisissecret",function(err,decoded){
                if(decoded){
                    username=decoded.username;
                    userId=decoded.userId;
                }else{
                    username="";
                }
            });
    db.User.findById(userId).populate("friends").populate("friendRequest").then(function(user){
        friends=user.friends;
        friendRequest=user.friendRequest;
        db.User.find().then(function(users){
            res.status(200).json({allUsers:users,user:{username,userId},friends,friendRequest});
        }).catch(function(err){
            res.json({allUsers:[{}],user:{username:"",userId:""},friends:"",friendRequest:""});
        });
    }).catch(function(err){
        res.json({err});
    });
});
app.get("/api/logout",function(req, res){
    res.clearCookie("token");
    res.json({msg:"Success"});
});
app.get("/api/delete/:id",function(req, res){
    res.clearCookie("token");
    db.User.findByIdAndRemove(req.params.id).then(function(user){
        db.Chat.deleteMany({$or:[{from:req.params.id},{to:req.params.id}]}).then(function(message){
          res.json({msg:"Success"});
        }).catch(function(err){
            res.json({message:err,error:"Cant delete all the messages"})
        })
    }).catch(function(err){
        res.json({message:err,error:"Can't delete the account"});
    });
})
app.get("/api/accept/:from/:to",function(req, res){
    db.User.findById(req.params.from).then(function(user){
        var friends = user.friends;
        friends.push(req.params.to);
        var friendRequest = user.friendRequest.filter(id=>id!=req.params.to);
        db.User.findByIdAndUpdate(req.params.from,{friends,friendRequest},{new:true}).populate("friends").then(function(first){
            db.User.findById(req.params.to).then(function(user){
                var friends = user.friends;
                friends.push(req.params.from);
                db.User.findByIdAndUpdate(req.params.to,{friends},{new:true}).populate("friends").then(function(second){
                    io.emit("acceptRequest",{firstUser:req.params.from,firstFriends:first.friends,secondUser:req.params.to,secondFriends:second.friends});
                    res.json({firstFriends:first.friends,secondFriends:second.friends});
                }).catch(function(err){
                    res.json({err});
                    console.log(err);
                });
            }).catch(function(err){
                res.json({err});
                console.log(err);
            });
        }).catch(function(err){
            res.json({err});
            console.log(err);
        });
    }).catch(function(err){
        res.json({err});
        console.log(err);
    });
})
app.get("/api/request/:from/:to",function(req, res){
    db.User.findById(req.params.to).then(function(user){
        var friendRequest =user.friendRequest;
        friendRequest.push(req.params.from);
        console.log(friendRequest);
        db.User.findByIdAndUpdate(req.params.to,{friendRequest},{new:true}).populate("friendRequest").then(function(user){
            io.emit("friendRequest",{to:req.params.to,friendRequest:user.friendRequest});
            res.json({friendRequest:user.friendRequest});
        }).catch(function(err){
            console.log(err);
            res.json({err});
        });
    }).catch(function(err){
        res.json({err});
    });
});
app.get("/api/:from/:to",function(req,res){
    db.Chat.find({$or:[{from:req.params.from,to:req.params.to},{from:req.params.to,to:req.params.from}]}).sort({createdAt:"asc"}).then(function(messages){
        res.json({messages});
    }).catch(function(err){
        res.json({messages:[]});
    });
});
app.post("/api/:from/:to",function(req, res){
    db.Chat.create(req.body).then(function(message){
        io.emit("message",message);
        res.json({message});
    }).catch(function(err){
        res.json({message:{}});
    });
});
app.delete("/api/:id/:from/:to",auth.imposter,function(req, res){
    db.Chat.findByIdAndRemove(req.params.id).then(function(message){
        db.Chat.find({$or:[{from:req.params.from,to:req.params.to},{from:req.params.to,to:req.params.from}]}).sort({createdAt:"asc"}).then(function(messages){
            io.emit("delete-message",messages);
            res.json({messages});
        }).catch(function(err){
            res.json({messages:[]});
        })
    }).catch(function(err){
        res.json({messages:{}});
    });
});
server.listen(3001,function(err){
    console.log("Connected to 3001");
});





