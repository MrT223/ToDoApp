import React, { useState, useEffect, useRef } from 'react';
import API from '@/lib/axios';

const CuteBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Konnichiwa Master! 📝 Hôm nay Master cần làm gì không? Miku check giúp cho nha! 🎵' }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setShowBubble(true);
        setTimeout(() => setShowBubble(false), 4000);
      }
    }, 15000);

    const timer = setTimeout(() => {
        if(!isOpen) setShowBubble(true);
    }, 2000);

    return () => {
        clearInterval(interval);
        clearTimeout(timer);
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue;
    
    const newMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setInputValue('');
    setIsThinking(true);

    try {
      const res = await API.post('/chat', {
        message: userMsg,
        history: newMessages.slice(-4).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }))
      });

      setMessages(prev => [...prev, { role: 'model', text: res.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Miku không kết nối được với Database rồi... 😿" }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  // --- HÀM XỬ LÝ HIỂN THỊ TEXT ---
  const renderMessageText = (text) => {
    if (!text) return null;
    
    // Regex tìm chuỗi nằm giữa ** và ** (nhóm capture)
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bỏ 2 ký tự đầu (**) và 2 ký tự cuối (**)
        const content = part.slice(2, -2);
        return <strong key={index} className="font-bold text-indigo-600">{content}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      
      {/* --- KHUNG CHAT --- */}
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-teal-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 mb-2">
          <div className="bg-gradient-to-r from-teal-400 to-cyan-500 p-3 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1 rounded-full">
                <img src="/img/miku.gif" onError={(e) => e.target.src='https://api.dicebear.com/9.x/fun-emoji/svg?seed=Miku'} alt="Miku" className="w-6 h-6 object-cover rounded-full" />
              </div>
              <span className="font-bold text-sm">Thư ký Miku 📝</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-teal-50/30 custom-scrollbar">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm rounded-xl shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-teal-500 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-teal-100 rounded-tl-none'
                }`}>
                  {/* GỌI HÀM RENDER ĐỂ HIỂN THỊ IN ĐẬM */}
                  {renderMessageText(msg.text)}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white text-teal-500 p-3 text-xs rounded-xl rounded-tl-none border border-teal-100 shadow-sm flex items-center gap-1">
                  <span>Miku đang check list...</span>
                  <span className="animate-bounce">📂</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-teal-100 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Việc hôm nay..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button onClick={handleSend} className="bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* --- NÚT MIKU + BONG BÓNG --- */}
      <div className="relative group">
        <div className={`
            absolute bottom-full right-0 mb-2 w-48 bg-white p-3 rounded-xl rounded-br-none shadow-lg border border-teal-200
            transform transition-all duration-300 origin-bottom-right z-40
            ${!isOpen && (showBubble) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
            ${!isOpen ? 'group-hover:scale-100 group-hover:opacity-100' : ''}
        `}>
          <p className="text-xs text-gray-600 font-medium">
            Check list công việc nào Master ơi! 📝🎵
          </p>
        </div>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-20 h-20 rounded-full bg-white border-4 border-teal-300 shadow-xl 
            flex items-center justify-center overflow-hidden transition-transform duration-300
            hover:scale-110 hover:rotate-3 active:scale-95 relative z-50
            ${isOpen ? 'ring-4 ring-teal-400' : ''}
          `}
        >
          <img 
            src="/img/miku.gif" 
            onError={(e) => e.target.src='https://api.dicebear.com/9.x/fun-emoji/svg?seed=Miku'} 
            alt="Miku Bot" 
            className="w-full h-full object-cover" 
          />
        </button>
        
        <span className="absolute top-1 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse z-50"></span>
      </div>
    </div>
  );
};

export default CuteBot;