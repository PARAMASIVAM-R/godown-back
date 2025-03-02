const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config");

const router = express.Router();

// ✅ Register Route
router.post("/register", async (req, res) => {
  console.log("Received Data:", req.body); // ✅ Log request body

  const { userType, id, name, district, extra, godownName, password } = req.body;

  try {
    const existingUser = await User.findOne({ id });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ userType, id, name, district, extra, godownName, password: hashedPassword });

    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await User.findOne({ id });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, userType: user.userType }, JWT_SECRET, { expiresIn: "1s" });

    res.json({ message: "Login successful", token, userType: user.userType });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Middleware to Check User Authorization
const authenticateUser = (requiredRole) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "Access denied. No token provided." });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (decoded.userType !== requiredRole) {
        return res.status(403).json({ message: "Access denied. Unauthorized user." });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

// ✅ Protected Routes Based on User Type
router.get("/admin-dashboard", authenticateUser("Admin"), (req, res) => {
  res.json({ message: "Welcome to Admin Dashboard" });
});

router.get("/godown-dashboard", authenticateUser("Godown Incharge"), (req, res) => {
  res.json({ message: "Welcome to Godown Dashboard" });
});

router.get("/pds-dashboard", authenticateUser("PDS Incharge"), (req, res) => {
  res.json({ message: "Welcome to PDS Dashboard" });
});

module.exports = router;
