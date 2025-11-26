// ... (imports giữ nguyên)
import Task from "../models/Task.js";
import redisClient from "../config/redis.js";

const CACHE_TTL = 60;

// Hàm xóa cache (đã cập nhật để nhận userId)
const invalidateTasksCache = async (userId) => {
  try {
    // Chỉ xóa các khóa cache của người dùng này
    const keys = await redisClient.keys(`tasks:${userId}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Đã xóa ${keys.length} khóa cache tasks cho User ${userId}.`);
    }
  } catch (error) {
    console.error("Lỗi khi xóa cache Redis:", error);
  }
};

export const getAllTasks = async (req, res) => {
  const { filter = "today" } = req.query;
  const userId = req.user._id; // Lấy User ID từ middleware
  const cacheKey = `tasks:${userId}:${filter}`; // Khóa cache phải bao gồm User ID

  try {
    // 1. Kiểm tra cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit:", cacheKey);
      return res.status(200).json(JSON.parse(cachedData));
    }

    // ... (logic tính toán startDate giữ nguyên)
    const now = new Date();
    let startDate;

    switch (filter) {
      // ... (logic switch case giữ nguyên)
      case "today": {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      }
      case "week": {
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
        const mondayDate = now.getDate() - dayOfWeek + 1;
        startDate = new Date(now.getFullYear(), now.getMonth(), mondayDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case "month": {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      }
      case "all":
      default: {
        startDate = null;
      }
    }

    // THÊM userId VÀO TRUY VẤN
    const query = {
      userId, // Chỉ lấy Task của người dùng này
      ...(startDate && { createdAt: { $gte: startDate } }),
    };

    // 2. Truy vấn Database nếu Cache Miss
    const result = await Task.aggregate([
      { $match: query },
      {
        $facet: {
          tasks: [{ $sort: { createdAt: -1 } }],
          // TẤT CẢ FACET PHẢI CHỨA userId TRONG MỆNH ĐỀ $match GỐC (query)
          activeCount: [
            { $match: { status: "active", ...query } },
            { $count: "count" },
          ],
          completeCount: [
            { $match: { status: "complete", ...query } },
            { $count: "count" },
          ],
        },
      },
    ]);

    // ... (logic responseData và Cache set giữ nguyên)
    const tasks = result[0].tasks;
    const activeCount = result[0].activeCount[0]?.count || 0;
    const completeCount = result[0].completeCount[0]?.count || 0;

    const responseData = { tasks, activeCount, completeCount };

    // 3. Ghi kết quả vào Cache với TTL
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(responseData));
    console.log("Cache set:", cacheKey);

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Lỗi khi gọi getAllTasks", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user._id; // Lấy User ID từ req.user

    const task = new Task({
      title,
      userId, // Gán Task cho User
    });

    const newTask = await task.save();

    await invalidateTasksCache(userId); // Truyền userId vào hàm xóa cache

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Lỗi khi gọi createTask", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// CÁC HÀM UPDATE VÀ DELETE CŨNG CẦN KIỂM TRA userId ĐỂ CHỈ CHO PHÉP CHỈNH SỬA TASK CỦA MÌNH
export const updateTask = async (req, res) => {
  try {
    const { title, status, completedAt } = req.body;
    const userId = req.user._id;

    // Kiểm tra task theo ID VÀ userId
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId }, // Thêm userId vào điều kiện tìm kiếm
      {
        title,
        status,
        completedAt,
      },
      { new: true }
    );

    if (!updatedTask) {
      // Có thể là 404 hoặc 403 (Forbidden) nếu task thuộc về người khác
      return res
        .status(404)
        .json({ message: "Nhiệm vụ không tồn tại hoặc bạn không có quyền." });
    }

    await invalidateTasksCache(userId);

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Lỗi khi gọi updateTask", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const userId = req.user._id;

    // Kiểm tra task theo ID VÀ userId
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      userId, // Thêm userId vào điều kiện tìm kiếm
    });

    if (!deletedTask) {
      return res
        .status(404)
        .json({ message: "Nhiệm vụ không tồn tại hoặc bạn không có quyền." });
    }

    await invalidateTasksCache(userId);

    res.status(200).json(deletedTask);
  } catch (error) {
    console.error("Lỗi khi gọi deleteTask", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
