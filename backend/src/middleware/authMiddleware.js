import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const protect = async (req, res, next) => {
  let token;

  // Kiểm tra nếu Authorization header tồn tại và bắt đầu bằng 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Lấy token từ header (Bearer <token>)
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token (Verify token)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm người dùng theo ID trong token và gán vào req.user (Trừ trường password)
      req.user = await User.findById(decoded.id).select("-password");

      // Nếu không tìm thấy user, lỗi sẽ được bắt ở khối catch
      if (!req.user) {
        throw new Error("Người dùng không tồn tại");
      }

      next(); // Chuyển sang middleware/controller tiếp theo
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
