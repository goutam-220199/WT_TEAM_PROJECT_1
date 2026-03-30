const express = require("express");
const router = express.Router();

const Invoice = require("../models/Invoice");
const Product = require("../models/Product");

const authMiddleware = require("../middleware/authMiddleware");
router.post("/create", authMiddleware, async (req,res)=>{

try{

const {productId,quantity} = req.body;

const product = await Product.findById(productId);

if(!product){
return res.status(404).json({message:"Product not found"});
}

if(product.stock < quantity){
return res.status(400).json({message:"Not enough stock"});
}

const gstAmount = (product.price * product.gst / 100) * quantity;

const total = (product.price * quantity) + gstAmount;

const invoice = new Invoice({

product:product._id,
supplier:product.name,
quantity,
price:product.price,
gst:product.gst,
gstAmount,
total,
owner:req.user.id

});

await invoice.save();

product.stock -= quantity;
await product.save();

res.json(invoice);

}catch(error){

res.status(500).json({message:"Invoice creation failed"});

}

});
router.get("/my-invoices", authMiddleware, async(req,res)=>{
  const role = req.user.role;
  let query = {};

  if (role === 'wholesaler' || role === 'manufacturer' || role === 'distributor') {
    query = { supplier: req.user.id };
  } else {
    // retailer or small-scale
    query = { retailer: req.user.id };
  }

  const invoices = await Invoice.find(query)
    .populate("product")
    .populate("supplier", "name")
    .populate("retailer", "name");

  res.json(invoices);

});
router.get("/stats", authMiddleware, async(req,res)=>{

const invoices = await Invoice.find({owner:req.user.id});

const totalSales = invoices.reduce((sum,i)=>sum+i.total,0);

const totalInvoices = invoices.length;

res.json({
totalSales,
totalInvoices
});

});
router.get("/:id", authMiddleware, async (req,res)=>{

const invoice = await Invoice.findById(req.params.id).populate("product");

res.json(invoice);

});
module.exports = router;
/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management
 */

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 */