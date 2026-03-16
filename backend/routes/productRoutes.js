const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/add", authMiddleware, async (req, res) => {
  // Only suppliers (wholesaler, distributor, manufacturer) can add products
  const allowedRoles = ['wholesaler', 'distributor', 'manufacturer'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Only wholesalers, distributors, and manufacturers can add products." });
  }

  const { name, price, gst, quantity, description } = req.body;

  const product = new Product({
    name,
    price,
    gst,
    stock: Number(quantity),
    description,
    owner: req.user.id
  });

  await product.save();

  res.json(product);
});
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /api/products/my-products:
 *   get:
 *     summary: Get products belonging to logged-in user
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/my-products", authMiddleware, async (req, res) => {

  const products = await Product.find({
    owner: req.user.id
  });

  res.json(products);

});

//update product
router.put("/:id", authMiddleware, async (req, res) => {

try {

const { name, price, gst, stock, description } = req.body;

const updatedProduct = await Product.findByIdAndUpdate(
req.params.id,
{
name,
price,
gst,
stock,
description
},
{ returnDocument: "after" });

res.json(updatedProduct);

} catch (error) {
res.status(500).json({ message: "Update failed" });
}

});
//delete product
router.delete("/:id", authMiddleware, async (req, res) => {

try {

await Product.findByIdAndDelete(req.params.id);

res.json({ message: "Product deleted" });

} catch (error) {

res.status(500).json({ message: "Delete failed" });

}

});
router.get("/by-supplier/:id", authMiddleware, async (req,res)=>{

const products = await Product.find({
owner:req.params.id
});

console.log("[Products] by-supplier", { supplierId: req.params.id, productsCount: products.length, userId: req.user.id });

res.json(products);

});
module.exports = router;
