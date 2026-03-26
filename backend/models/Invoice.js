const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({

product:{
type:mongoose.Schema.Types.ObjectId,
ref:"Product"
},

supplier:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
},

retailer:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
},

quantity:Number,

price:Number,

gst:Number,

gstAmount:Number,

total:Number,

owner:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Invoice",invoiceSchema);