import express from "express";
import taskRoute from "./routes/tasksRouters.js";
import authRoute from "./routes/authRouters.js";
import ChatRouter from "./routes/ChatRouters.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

const envFile =
  process.env.NODE_ENV === "production" ? ".env" : ".env.development";
dotenv.config({ path: path.resolve(envFile) });

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();

// middlewares
app.use(express.json());

app.use(
  cors({
    origin:
      process.env.NODE_ENV !== "production" ? "http://localhost:5173" : "*",
  })
);

app.use("/api/auth", authRoute);
app.use("/api/tasks", taskRoute);
app.use("/api/chat", ChatRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Kết nối MongoDB
connectDB()
  .then(connectRedis)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server chạy trên cổng ${PORT} | ENV=${process.env.NODE_ENV}`
      );
    });
  })
  .catch((err) => {
    console.error("Khởi động server thất bại:", err.message);
    process.exit(1);
  });
