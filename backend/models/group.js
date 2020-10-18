var mongoose = require("mongoose");
var User = require("./user");


var groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }]
},{
    timestamps: true
});
module.exports= mongoose.model("Group",groupSchema);