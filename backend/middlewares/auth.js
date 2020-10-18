const jwt = require("jsonwebtoken");

exports.loginRequired= function(req, res, next){
    try {
        const token = req.cookies.token;
        
        jwt.verify(token,"thisissecret",function(err,decoded){
            if(decoded){
                next();
            }
            else {
                res.json({msg:"signfirst"});
            }
        })
    }
    catch(e){
        res.json({msg:"signfirst"})
    }
}
// exports.checkUser = function(req, res, next){
//     try {
//         const token = req.cookies.token;
//         jwt.verify(token,"thisissecret",function(err,decoded){
//             if(decoded.userId===req.params.userId){
//                 next();
//             }
//             else {
//                 res.status(401).json({message:"unauthorized"});
//             }
//         })
//     }
//     catch(e){
//         res.status(401).json({message:"unauthorized"});
//     }
// }
exports.imposter = function(req, res, next){
    try {
        const token = req.cookies.token;
        jwt.verify(token,"thisissecret",function(err,decoded){
            if(decoded.userId===req.params.from){
                next();
            }
            else {
                res.status(401).json({message:"unauthorized"});
            }
        })
    }
    catch(e){
        res.status(401).json({message:"unauthorized"});
    }
}