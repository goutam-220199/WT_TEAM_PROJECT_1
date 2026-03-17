const Supplier = require("../models/SupplierRequest.js");

/*
CREATE SUPPLIER
Example:
POST /api/suppliers
{
  "name": "ABC Traders",
  "email": "abc@gmail.com",
  "phone": "9876543210",
  "address": "Hyderabad"
}
*/
exports.createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    const savedSupplier = await supplier.save();

    res.status(201).json(savedSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
GET ALL SUPPLIERS
Example:
GET /api/suppliers
*/
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
GET SINGLE SUPPLIER
Example:
GET /api/suppliers/665aab1234
*/
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
UPDATE SUPPLIER
Example:
PUT /api/suppliers/665aab1234
*/
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
DELETE SUPPLIER
Example:
DELETE /api/suppliers/665aab1234
*/
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};