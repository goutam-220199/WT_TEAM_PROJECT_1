const express = require("express");
const router = express.Router();

const User = require("../models/User");
const SupplierRequest = require("../models/SupplierRequest");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
} = require("../controllers/supplierController");


/*
GET AVAILABLE SUPPLIERS
Returns suppliers that the current retailer has NOT already requested or approved.
*/
router.get("/all", authMiddleware, async (req, res) => {
  try {
    // Find requests where this retailer has already requested/approved the supplier
    const requests = await SupplierRequest.find({
      retailer: req.user.id,
      status: { $in: ["pending", "approved"] }
    });

    const excludedSupplierIds = requests.map(r => r.supplier.toString());

    const suppliers = await User.find({
      role: { $in: ["wholesaler", "manufacturer", "distributor"] }
    });

    const availableSuppliers = suppliers.filter(
      s => !excludedSupplierIds.includes(s._id.toString())
    );

    res.json(availableSuppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/* CRUD ROUTES */

router.post("/", createSupplier);

router.get("/", getSuppliers);

router.get("/:id", getSupplierById);

router.put("/:id", updateSupplier);

router.delete("/:id", deleteSupplier);


module.exports = router;