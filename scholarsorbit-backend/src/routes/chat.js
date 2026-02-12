import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: '👋 Hi! I\'m your JEE/NEET study assistant. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('scholarsorbit_token');
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/message`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: data.reply 
      }]);

    } catch (error) {
      const errMsg = error.response?.status === 429
        ? '⏳ AI is busy. Please wait a moment!'
        : '❌ Something went wrong. Try again.';

      setMessages(prev => [...prev, { role: 'bot', text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-dark-800 rounded-xl border border-dark-700">
      
      {/* Header */}
      <div className="p-4 border-b border-dark-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm">
          🤖
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">AI Study Assistant</h3>
          <p className="text-xs text-green-400">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
              msg.role === 'user'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-700 text-gray-200'
            }`}>
              {msg.role === 'bot' ? (
                // ✅ ReactMarkdown renders bold, line breaks properly
                <ReactMarkdown
                  className="prose prose-invert prose-sm max-w-none
                             prose-p:my-1 prose-p:leading-relaxed
                             prose-strong:text-blue-300
                             prose-ul:my-1 prose-li:my-0"
                >
                  {msg.text}
                </ReactMarkdown>
              ) : (
                // User messages - plain text
                <span>{msg.text}</span>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-dark-700 px-4 py-2 rounded-xl text-gray-400 text-sm">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dark-700 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask a JEE/NEET question..."
          className="flex-1 bg-dark-700 text-white rounded-lg px-4 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm 
                     hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </div>

    </div>
  );
};

export default AIChat;