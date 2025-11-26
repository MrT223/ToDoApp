import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Task from "../models/Task.js"; 

dotenv.config();

const getUserId = (req) => {
    return req.user ? req.user._id : "master_user_id"; 
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatWithBot = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = getUserId(req);

    if (!message) return res.status(400).json({ reply: "Hỏi gì đi Master ơi! 😿" });

    if (!userId) {
        return res.status(401).json({ reply: "Master ơi, Miku cần Master đăng nhập để xem danh sách công việc riêng tư nha! 🔒" });
    }
    
    // --- 1. XỬ LÝ LỊCH SỬ CHAT ---
    let cleanHistory = [];
    if (Array.isArray(history)) {
        cleanHistory = [...history];

        const lastMsg = cleanHistory[cleanHistory.length - 1];
        if (lastMsg && lastMsg.role === 'user' && lastMsg.parts[0].text === message) {
            cleanHistory.pop();
        }

        while (cleanHistory.length > 0 && cleanHistory[0].role === 'model') {
            cleanHistory.shift();
        }
    }

    // --- 2. TÌM KIẾM DỮ LIỆU DB ---
    let taskContext = "";
    const lowerMsg = message.toLowerCase();
    let query = {};
    
    if (lowerMsg.includes("chưa") || lowerMsg.includes("cần làm")) {
        query = { status: 'active' };
    } else if (lowerMsg.includes("xong") || lowerMsg.includes("hoàn thành")) {
        query = { status: 'complete' };
    } else {
        query = {}; 
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 }).limit(10);

    if (tasks.length > 0) {
        const taskListStr = tasks.map(t => 
            `- [${t.status === 'active' ? '⏳' : '✅'}] ${t.title}`
        ).join("\n");
        
        taskContext = `DỮ LIỆU CÔNG VIỆC HIỆN TẠI:\n${taskListStr}`;
    } else {
        taskContext = `DỮ LIỆU CÔNG VIỆC: (Danh sách trống hoặc không tìm thấy)`;
    }

    // --- 3. GỌI GEMINI ---
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-preview-09-2025",
        // (Cách mới để cài đặt tính cách Bot)
        systemInstruction: {
            role: "system",
            parts: [{ text: `
                Bạn là Hatsune Miku 🎵, thư ký ảo quản lý Todo App.
                Gọi người dùng là "Master". Dùng nhiều emoji 📝✅.
                
                NHIỆM VỤ:
                Trả lời dựa trên dữ liệu sau:
                ${taskContext}
                
                Nếu Master yêu cầu thêm/sửa/xóa, hãy nhắc họ tự làm trên giao diện.
            `}]
        }
    });

    const chat = model.startChat({
      history: cleanHistory, // Xóa lịch sử
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text();

    res.status(200).json({ reply });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ 
        reply: "Miku bị lỗi kết nối server rồi... 🎤😿", 
        error: error.message 
    });
  }
};