import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_URL = `${BASE_URL}/api/chat`;
const SUGGESTIONS_URL = `${BASE_URL}/api/suggestions`;
const STREAM_TICK_MS = 15;

export default function AIStudyBot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [mode, setMode] = useState('scholar');
  const [level, setLevel] = useState('intermediate');
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [serverConvId, setServerConvId] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [clickedSuggestionIds, setClickedSuggestionIds] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamRef = useRef(null);

  // Load conversation list on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup stream interval on unmount
  useEffect(() => {
    return () => { if (streamRef.current) clearInterval(streamRef.current); };
  }, []);

  // Fetch suggestions when subject changes
  useEffect(() => {
    if (!currentSubject || currentSubject === 'Other') return;
    const params = new URLSearchParams({ subject: currentSubject });
    if (clickedSuggestionIds.length) params.set('exclude', clickedSuggestionIds.join(','));
    fetch(`${SUGGESTIONS_URL}?${params}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.suggestions) setSuggestions(data.suggestions); })
      .catch(() => {});
  }, [currentSubject, clickedSuggestionIds]);

  // Focus input on load and conversation switch
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConversationId]);

  const loadConversations = () => {
    const stored = JSON.parse(localStorage.getItem('aiChatHistory') || '[]');
    setConversations(stored.sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const saveConversation = (msgs, convId = null) => {
    const stored = JSON.parse(localStorage.getItem('aiChatHistory') || '[]');
    const id = convId || activeConversationId || Date.now().toString();
    const firstUserMsg = msgs.find((m) => m.role === 'user');
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '')
      : 'New Conversation';

    const existing = stored.findIndex((c) => c.id === id);
    const conv = { id, title, messages: msgs, updatedAt: Date.now() };

    if (existing >= 0) {
      stored[existing] = conv;
    } else {
      stored.unshift(conv);
    }

    localStorage.setItem('aiChatHistory', JSON.stringify(stored));
    setActiveConversationId(id);
    setConversations(stored.sort((a, b) => b.updatedAt - a.updatedAt));
    return id;
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || streaming) return;

    const userMsg = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('scholarsOrbitToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: trimmed, mode, level, conversationId: serverConvId }),
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      if (data.conversationId) setServerConvId(data.conversationId);
      if (data.subject) setCurrentSubject(data.subject);

      const fullReply = data.reply;

      // Switch from "thinking" to "streaming" phase
      setLoading(false);
      setStreaming(true);

      // Add empty assistant bubble and stream into it
      setMessages([...updated, { role: 'assistant', content: '' }]);

      const charsPerTick = Math.max(8, Math.ceil(fullReply.length / 200));
      let charIndex = 0;

      streamRef.current = setInterval(() => {
        charIndex = Math.min(charIndex + charsPerTick, fullReply.length);
        const partial = fullReply.slice(0, charIndex);

        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: partial };
          return copy;
        });

        if (charIndex >= fullReply.length) {
          clearInterval(streamRef.current);
          streamRef.current = null;
          setStreaming(false);
          const finalMessages = [...updated, { role: 'assistant', content: fullReply }];
          setMessages(finalMessages);
          saveConversation(finalMessages);
        }
      }, STREAM_TICK_MS);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = { role: 'assistant', content: `Sorry, something went wrong: ${err.message}. Please check the browser console and ensure the backend server is running on port 5001.` };
      setMessages([...updated, errorMsg]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadConversation = (conv) => {
    setMessages(conv.messages);
    setActiveConversationId(conv.id);
    setSidebarOpen(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    setServerConvId(null);
    setCurrentSubject(null);
    setSuggestions([]);
    setClickedSuggestionIds([]);
    setSidebarOpen(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.text);
    setClickedSuggestionIds((prev) => [...prev, suggestion._id]);
    // Fire-and-forget click count
    fetch(`${SUGGESTIONS_URL}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: suggestion._id }),
    }).catch(() => {});
    inputRef.current?.focus();
  };

  const deleteConversation = (id, e) => {
    e.stopPropagation();
    const stored = JSON.parse(localStorage.getItem('aiChatHistory') || '[]');
    const filtered = stored.filter((c) => c.id !== id);
    localStorage.setItem('aiChatHistory', JSON.stringify(filtered));
    setConversations(filtered);
    if (activeConversationId === id) {
      setMessages([]);
      setActiveConversationId(null);
    }
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Nav — fixed height */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-display font-bold text-gray-800">
              Study<span className="text-purple-600">Bot</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
          {user && (
            <Link
              to="/dashboard"
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* 3-column flex layout — fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar — Chat History */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-[280px] shrink-0
            bg-gray-50 border-r border-gray-200
            transform transition-transform duration-300 lg:transform-none
            flex flex-col
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-4 border-b border-gray-200 shrink-0">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Chat History</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8 px-4">
                No conversations yet. Start chatting to see your history here.
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv)}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                    ${activeConversationId === conv.id
                      ? 'bg-purple-50 text-purple-700'
                      : 'hover:bg-white text-gray-700'}
                  `}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTime(conv.updatedAt)}</p>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all shrink-0 ml-2"
                    aria-label="Delete conversation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex flex-col flex-1 min-w-0">
          {/* Messages — only this div scrolls */}
          <div className="flex-1 overflow-y-auto bg-white px-4 py-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-3xl">🤖</span>
                </div>
                <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
                  AI Study Assistant
                </h2>
                <p className="text-gray-500 max-w-md mb-8">
                  Ask me anything about Physics, Chemistry, Maths, or Biology. I'm here to help with JEE & NEET preparation.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    'Explain Newton\'s laws of motion',
                    'What is the difference between mitosis and meiosis?',
                    'Solve: ∫ x² dx from 0 to 1',
                    'Explain chemical bonding types',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="text-left px-4 py-3 rounded-lg border border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 transition-all text-sm text-gray-700"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((msg, i) => {
                  const isStreamingMsg = streaming && msg.role === 'assistant' && i === messages.length - 1;
                  return (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                          ${msg.role === 'user'
                            ? 'bg-purple-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-700 rounded-bl-md'}
                        `}
                      >
                        {msg.content}
                        {isStreamingMsg && (
                          <span className="inline-block w-0.5 h-4 bg-purple-500 ml-0.5 align-middle animate-pulse" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area — fixed bottom */}
          <div className="border-t border-gray-200 bg-white px-4 py-4 shrink-0">
            {/* Mode & Level Selector */}
            <div className="max-w-3xl mx-auto mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Mode:</span>
              {[
                { value: 'scholar', label: 'Scholar' },
                { value: 'mentor', label: 'Mentor' },
                { value: 'revision', label: 'Revision' },
                { value: 'practice', label: 'Practice' },
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    mode === m.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}

              <span className="mx-1 text-gray-300">|</span>
              <span className="text-xs font-medium text-gray-500">Level:</span>
              {[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ].map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    level === l.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="max-w-3xl mx-auto flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a study question..."
                rows={1}
                className="flex-1 resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || streaming}
                className="shrink-0 w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors disabled:opacity-40"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              Powered by Google Gemini. Responses may not always be accurate.
            </p>
          </div>
        </main>

        {/* Right Sidebar — Related Questions (always rendered, stable width) */}
        <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-gray-50 border-l border-gray-200">
          <div className="p-4 border-b border-gray-200 shrink-0">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Related Questions</h2>
            {currentSubject && (
              <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-600 rounded-full">
                {currentSubject}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {suggestions.length > 0 ? (
              suggestions.map((s) => (
                <button
                  key={s._id}
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-white transition-colors group"
                >
                  <p className="line-clamp-2 leading-snug">{s.text}</p>
                  <p className="text-xs text-gray-400 mt-1 group-hover:text-purple-500">
                    {s.globalCount} student{s.globalCount !== 1 ? 's' : ''} asked
                  </p>
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-400 text-center py-8 px-4">
                No related questions yet. Start chatting to see suggestions here.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
