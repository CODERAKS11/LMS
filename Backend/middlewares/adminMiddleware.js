const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const adminMiddleware = async (req, res, next) => {
    try {
        // Ensure Authorization header is present
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        // Extract and verify token
        const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Check if user exists and is an admin
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token", error });
    }
};

module.exports = adminMiddleware;
