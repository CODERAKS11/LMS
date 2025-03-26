const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied, no token provided" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), "secretKey");
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};
