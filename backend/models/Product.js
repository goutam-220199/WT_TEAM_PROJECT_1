
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

price:{
type:Number,
required:true
},

gst:{
type:Number,
required:true
},

stock:{
type:Number,
required:true
},

description:String,

owner:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},
createdAt: {
    type: Date,
    default: Date.now
}

});

module.exports = mongoose.model("Product", productSchema);