const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();  // Load .env variables

module.exports = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied, no token provided" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);  // Use .env secret ✅
        console.log("JWT_SECRET used for token generation:", process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};
