import express from "express";
import { chatWithBot } from "../controllers/ChatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, chatWithBot);

export default router;