import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        throw new Error("Người dùng không tồn tại");
      }

      next();
    } catch (error) {
      console.error("Xác thực thất bại:", error.message);
      res.status(401).json({
        message: "Không được ủy quyền, token thất bại hoặc không hợp lệ",
      });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Không được ủy quyền, không có token" });
  }
};

export { protect };
