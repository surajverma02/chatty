const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require("../lib/logger");

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Auth Middleware :: Protect Route: ", error.messmge);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { protectRoute };
