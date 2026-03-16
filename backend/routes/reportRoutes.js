const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const authMiddleware = require("../middleware/authMiddleware");
router.get("/daily", authMiddleware, async (req,res)=>{

const today = new Date();
today.setHours(0,0,0,0);

const invoices = await Invoice.aggregate([
{
$match:{
owner:new mongoose.Types.ObjectId(req.user.id),
createdAt:{ $gte: today }
}
},
{
$group:{
_id:null,
totalSales:{ $sum:"$total" },
count:{ $sum:1 }
}
}
]);

res.json(invoices[0] || {totalSales:0,count:0});

});
router.get("/monthly", authMiddleware, async (req,res)=>{

const result = await Invoice.aggregate([
  {
    $match:{ owner:new mongoose.Types.ObjectId(req.user.id) }
  },
  {
    $group:{
      _id:{
        year:{ $year:"$createdAt"},
        month:{ $month:"$createdAt"}
      },
      totalSales:{ $sum:"$total" },
      orderCount:{ $sum: 1 }
    }
  },
  { $sort:{ "_id.year":1, "_id.month":1 } }
]);

res.json(result);

});
router.get("/top-products", authMiddleware, async (req,res)=>{

const result = await Invoice.aggregate([
  {
    $match:{ owner:new mongoose.Types.ObjectId(req.user.id) }
  },
  {
    $group:{
      _id:"$product",
      totalSold:{ $sum:"$quantity" },
      totalRevenue:{ $sum:"$total" }
    }
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    $unwind: {
      path: "$product",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $project: {
      productId: "$_id",
      productName: "$product.name",
      totalSold: 1,
      totalRevenue: 1
    }
  },
  {
    $sort:{ totalSold:-1 }
  },
  {
    $limit:5
  }

]);

res.json(result);

});
router.get("/sales-comparison", authMiddleware, async (req,res)=>{

const data = await Invoice.aggregate([
  {
    $match:{ owner:new mongoose.Types.ObjectId(req.user.id) }
  },
  {
    $group:{
      _id:"$product",
      totalSales:{ $sum:"$total" }
    }
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    $unwind: {
      path: "$product",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $project: {
      productId: "$_id",
      productName: "$product.name",
      totalSales: 1
    }
  },
  {
    $sort:{ totalSales:-1 }
  }

]);

res.json(data);

});
module.exports = router;
/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Business reports
 */

/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Sales report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales report generated
 */