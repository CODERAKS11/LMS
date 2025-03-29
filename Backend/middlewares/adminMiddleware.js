const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config();
const adminMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log("JWT_SECRET used for token verification:", process.env.JWT_SECRET);

            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: "User not found" });

            if (user.role !== "admin") {
                return res.status(403).json({ message: "Access denied. Admins only." });
            }

            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                console.log("JWT_SECRET used for token verification:", process.env.JWT_SECRET);
                return res.status(401).json({ message: "Token expired. Please re-login." });
            } else {
                console.log("JWT_SECRET used for token verification:", process.env.JWT_SECRET);
                return res.status(401).json({ message: "Invalid token signature", error });
            }
        }
    } catch (error) {
        console.error("Middleware Error:", error);
        
        res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports = adminMiddleware;
