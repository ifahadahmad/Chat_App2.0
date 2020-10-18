var mongoose = require("mongoose");
const { model } = require("./user");
mongoose.set("debug", true);
mongoose.Promise= global.Promise;
mongoose.connect("mongodb://localhost:27017/new_data7",{useNewUrlParser: true});
module.exports.User = require("./user");
module.exports.Chat = require("./chat");
module.exports.Message = require("./message");
module.exports.Group= require("./group");