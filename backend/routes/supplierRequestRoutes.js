const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const SupplierRequest = require("../models/SupplierRequest");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/", authMiddleware, async (req,res)=>{
  const { supplierId } = req.body;

  try {
    const request = new SupplierRequest({
      supplier: supplierId,
      retailer: req.user.id,
      status: "pending"
    });

    await request.save();

    console.log("[SupplierRequest] Created", request._id.toString(), "supplier", supplierId, "retailer", req.user.id);

    res.json({ message: "Request sent successfully", request });
  } catch (error) {
    console.error("[SupplierRequest] Error creating request", error);
    res.status(500).json({ message: "Failed to send request" });
  }
});
router.get("/approved", authMiddleware, async (req,res)=>{

const suppliers = await SupplierRequest
.find({
retailer:req.user.id,
status:"approved"
})
.populate("supplier");

res.json(suppliers);

});
router.get("/my-requests", authMiddleware, async (req,res)=>{
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const isRetailer = role === "retailer";
    const query = isRetailer
      ? { retailer: new mongoose.Types.ObjectId(userId) }
      : { supplier: new mongoose.Types.ObjectId(userId) };

    console.log("[SupplierRequest] my-requests called for", role, userId);

    const requests = await SupplierRequest
      .find(query)
      .populate(isRetailer ? "supplier" : "retailer");

    console.log(
      "[SupplierRequest] found",
      requests.length,
      "requests for",
      role,
      userId
    );

    res.json(requests);
  } catch (error) {
    console.error("[SupplierRequest] my-requests error", error);
    res.status(500).json({ message: "Failed to load requests" });
  }
});
router.put("/approve/:id", authMiddleware, async (req,res)=>{

const request = await SupplierRequest.findById(req.params.id);

request.status = "approved";

await request.save();

res.json({message:"Request approved"});

});
router.put("/reject/:id", authMiddleware, async (req,res)=>{

const request = await SupplierRequest.findById(req.params.id);

request.status = "rejected";

await request.save();

res.json({message:"Request rejected"});

});
router.delete("/remove/:supplierId", authMiddleware, async (req,res)=>{

try{

await SupplierRequest.findOneAndDelete({
supplier:req.params.supplierId,
retailer:req.user.id
});

res.json({message:"Supplier removed"});

}catch(err){

res.status(500).json({message:err.message});

}

});
module.exports = router;