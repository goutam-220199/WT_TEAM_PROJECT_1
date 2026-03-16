const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const SupplierRequest = require("../models/SupplierRequest");
const authMiddleware = require("../middleware/authMiddleware");

// Create order (retailer -> supplier)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { supplierId, items } = req.body;

    if (!supplierId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Supplier and items are required" });
    }

    // Ensure supplier is approved for this retailer
    const approvedRequest = await SupplierRequest.findOne({
      retailer: req.user.id,
      supplier: supplierId,
      status: "approved"
    });

    if (!approvedRequest) {
      return res.status(400).json({ message: "Supplier is not approved. Request supplier first." });
    }

    const order = new Order({
      retailer: req.user.id,
      supplier: supplierId,
      items,
      status: "pending"
    });

    await order.save();

    res.json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to place order" });
  }
});

// Get orders created by current retailer
router.get("/my-orders", authMiddleware, async (req, res) => {
  const orders = await Order.find({ retailer: req.user.id })
    .populate("supplier")
    .sort({ createdAt: -1 });

  res.json(orders);
});

// Get orders for supplier to manage
router.get("/supplier", authMiddleware, async (req, res) => {
  const orders = await Order.find({ supplier: req.user.id })
    .populate("retailer")
    .sort({ createdAt: -1 });

  res.json(orders);
});

// Approve order (supplier)
router.put("/approve/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.supplier.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = "approved";
    await order.save();

    // Create invoice records for each item
    await Promise.all(order.items.map(async item => {
      const product = await Product.findById(item.product);
      if (!product) return;

      // Reduce stock if available
      if (product.stock >= item.quantity) {
        product.stock -= item.quantity;
        await product.save();
      }

      const invoice = new Invoice({
        product: item.product,
        supplier: product ? product.name : "",
        quantity: item.quantity,
        price: item.price,
        gst: item.gst,
        gstAmount: (item.price * item.gst / 100) * item.quantity,
        total: item.total,
        owner: order.retailer
      });

      await invoice.save();
    }));

    res.json({ message: "Order approved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve order" });
  }
});

// Reject order (supplier)
router.put("/reject/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.supplier.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = "rejected";
    await order.save();

    res.json({ message: "Order rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reject order" });
  }
});

module.exports = router;
