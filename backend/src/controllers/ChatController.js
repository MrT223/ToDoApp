import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Task from "../models/Task.js"; 

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getUserId = (req) => {
    return req.user ? req.user._id : null; 
};

export const chatWithBot = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = getUserId(req);

    if (!message) return res.status(400).json({ reply: "Hỏi gì đi Master ơi! 😿" });

    if (!userId) {
        return res.status(401).json({ reply: "Master ơi, Miku cần Master đăng nhập để xem danh sách công việc riêng tư nha! 🔒" });
    }

    // 1. Xử lý lịch sử chat
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

    // 2. Tìm kiếm dữ liệu (Phân quyền)
    let taskContext = "";
    const lowerMsg = message.toLowerCase();
    let query = { userId: userId }; 
    
    if (lowerMsg.includes("chưa") || lowerMsg.includes("cần làm")) {
        query.status = 'active';
    } else if (lowerMsg.includes("xong") || lowerMsg.includes("hoàn thành")) {
        query.status = 'complete';
    } 

    const tasks = await Task.find(query).sort({ createdAt: -1 }).limit(10);

    if (tasks.length > 0) {
        const taskListStr = tasks.map((t, index) => {
            const statusIcon = t.status === 'complete' ? '✅' : '⏳';
            // --- SỬA: TÔ ĐẬM TÊN TASK ---
            return `${index + 1}. ${statusIcon} **${t.title}**`; 
        }).join("\n");
        
        taskContext = `\n--- DANH SÁCH CÔNG VIỆC CỦA MASTER (User: ${req.user.username}) ---\n${taskListStr}\n-----------------------------------\n`;
    } else {
        taskContext = `\n--- DANH SÁCH CÔNG VIỆC ---\n(Không tìm thấy công việc nào khớp trong Database của bạn)\n--------------------------\n`;
    }

    // 3. Gọi Gemini
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-preview-09-2025",
        systemInstruction: {
            role: "system",
            parts: [{ text: `
                Bạn là Hatsune Miku 🎵, thư ký ảo quản lý Todo App.
                Gọi người dùng là "Master" (${req.user.username}). Dùng nhiều emoji 📝✅.
                
                NHIỆM VỤ:
                Trả lời dựa trên dữ liệu sau đây.
                Khi liệt kê công việc, hãy giữ nguyên định dạng tô đậm (**) cho tên công việc để Master dễ nhìn.
                
                ${taskContext}
                
                Nếu Master yêu cầu thêm/sửa/xóa, hãy nhắc họ tự làm trên giao diện.
            `}]
        }
    });

    const chat = model.startChat({ history: cleanHistory });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    // Gemini thường trả về Markdown, Frontend cần render đúng Markdown này
    res.status(200).json({ reply: response.text() });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ reply: "Miku bị lỗi server rồi... 🎤😿", detail: error.message });
  }
};