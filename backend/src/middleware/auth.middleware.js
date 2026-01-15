import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
export const protectRoute = async (req, res, next) => {
    try {
      // Check for token in cookies first, then in Authorization header
      let token = req.cookies.jwt;
      
      if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
      }
      
      if (!token) {
        return res.status(401).json({ message: "Unauthorized: No Token Provided" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
      }
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" }); // 404 if user doesn't exist
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("Error in middleware:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  