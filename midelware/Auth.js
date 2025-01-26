const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { user_model } = require("../routes/auth-routes");

const authMiddleware = async (req, res, next) => {
  try {    
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Token not found!" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const foundUser = await user_model.findById(payload.id).select("-password");

    if (!foundUser) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = foundUser; // Attach the user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(error);
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Invalid token signature" });
    } else if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token expired" });
    } else {
      res.status(400).json({ message: "An error occurred" });
    }
  }
};

module.exports = authMiddleware;