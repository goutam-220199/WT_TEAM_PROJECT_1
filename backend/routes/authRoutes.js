console.log("authRoutes file is loaded")
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const passport = require("passport");

const router = express.Router();

// test route
router.get("/", (req, res) => {
  res.send("Auth route working");
});

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role, productTypes } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists with this email" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role
  });

  if (role === 'retailer' || role === 'small-scale') {
    if (!productTypes) {
      return res.status(400).json({ message: "Product types are required for this role" });
    }
    user.productTypes = productTypes.split(',').map(t => t.trim());
  }

  await user.save();
  res.json({ message: "User registered successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({
    token,
    role: user.role,
    name: user.name
  });
});
// ✅ GOOGLE LOGIN
/*router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent"
  })
);*/
router.get("/google", (req, res, next) => {
  console.log("Google route hit ✅");
  next();
}, passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "consent"
}));

// ✅ GOOGLE CALLBACK
router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {

    console.log("🔥 GOOGLE CALLBACK HIT");

    const token = jwt.sign(
      { 
        id: req.user._id,
        role: req.user.role   
      },
      process.env.JWT_SECRET
    );
    
    // Direct Redirection Logic: exactly as requested.
    const baseUrl = "http://127.0.0.1:5500/WT_TEAM_PROJECT_1/frontend";

    if (!req.user.role) {
      // Unregistered user (no role): redirect directly to choose-role.html
      res.redirect(`${baseUrl}/choose-role.html?token=${token}`);
    } else if (req.user.role === "retailer" || req.user.role === "small-scale") {
      // Retailer: redirect directly to buyer pages
      res.redirect(`${baseUrl}/page2-dashboard.html?token=${token}&role=${req.user.role}`);
    } else {
      // Wholesaler/Manufacturer: redirect directly to seller pages
      res.redirect(`${baseUrl}/page1-dashboard.html?token=${token}&role=${req.user.role}`);
    }
  }
);
/*router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {

    const token = jwt.sign(
      { 
        id: req.user._id,
        role: req.user.role   
      },
      process.env.JWT_SECRET
    );
    res.redirect(`http://127.0.0.1:5500/frontend/index.html?token=${token}`);
    //res.redirect(`http://127.0.0.1:5500/index.html?token=${token}`);
    //res.redirect(`http://127.0.0.1:5500/?token=${token}`);
  }
);
*/

//to get user
//to get user (FIXED VERSION)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ check if token exists
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    res.json(user);

  } catch (err) {
    console.log("ME ERROR:", err); // 👈 helps debugging
    res.status(401).json({ message: "Unauthorized" });
  }
});
/*router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
});*/
//to set role
router.post("/set-role", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { role } = req.body;

    await User.findByIdAndUpdate(decoded.id, { role });

    res.json({ message: "Role updated" });
  } catch (err) {
    res.status(500).json({ message: "Error saving role" });
  }
});
router.get("/test", (req, res) => {
  res.send("AUTH TEST WORKING ✅");
});
module.exports = router;