require("dotenv").config();
console.log("THIS IS MY ACTIVE SERVER FILE");

// ✅ Ultimate Fix for strict network proxies / Antivirus / IPv6 issues with Google API
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const passport = require("passport");
const session = require("express-session");

require("./config/passport");

const app = express();

// ✅ Connect DB
connectDB();

// ✅ Middlewares FIRST
app.use(cors());
app.use(express.json());

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
console.log("Loading auth routes...");
// ✅ Routes AFTER passport
/*app.use("/auth", require("./routes/authRoutes"));
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);*/
const path = require("path");
const authRoutes = require(path.join(__dirname, "routes", "authRoutes"));

app.use("/auth", authRoutes);
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/supplier-request", require("./routes/supplierRequestRoutes"));

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});
app.get("/check", (req, res) => {
  res.send("CHECK WORKING ✅");
});
// ✅ Start server LAST
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
