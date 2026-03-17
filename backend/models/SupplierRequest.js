const mongoose = require("mongoose");

const supplierRequestSchema = new mongoose.Schema({

supplier:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

retailer:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

status:{
type:String,
default:"pending"
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("SupplierRequest",supplierRequestSchema);