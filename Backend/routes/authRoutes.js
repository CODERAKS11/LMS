const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Use User schema
const router = express.Router();

const secretKey = process.env.JWT_SECRET;

// ✅ Combined login route for both user and admin
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      secretKey, 
      { expiresIn: "1h" }
    );
    console.log("JWT_SECRET used for token generation:", secretKey);  // Log the secret key used
    console.log("Token generated:", token);  // Log the generated token
    res.json({
      token,
      role: user.role,   // Send the role in the response
      message: "Login successful!"
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
