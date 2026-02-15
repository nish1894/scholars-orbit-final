import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function getRoomId(a, b) {
  return [a, b].sort().join('_');
}

export default function DirectMessages() {
  const { user } = useAuth();

  // Socket ref
  const socketRef = useRef(null);

  // State
  const [users, setUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [activeChat, setActiveChat] = useState(null); // { _id, name, email }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentRoomRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Initialize socket
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('scholarsOrbitToken');
    if (!token) return;

    const socket = io(BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('online_users', (ids) => {
      setOnlineUserIds(new Set(ids));
    });

    socket.on('user_online', (id) => {
      setOnlineUserIds((prev) => new Set([...prev, id]));
    });

    socket.on('user_offline', (id) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('user_typing', ({ userId: typerId, typing }) => {
      setTypingUser(typing ? typerId : null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch user list
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('scholarsOrbitToken');
    fetch(`${BASE_URL}/api/dm/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.users) setUsers(data.users); })
      .catch(() => {});
  }, [user]);

  // Select a user to chat with
  const selectUser = useCallback(async (targetUser) => {
    if (!socketRef.current || !user) return;

    setActiveChat(targetUser);
    setMessages([]);
    setHasMore(true);
    setTypingUser(null);
    setSidebarOpen(false);

    const roomId = getRoomId(user.id, targetUser._id);
    currentRoomRef.current = roomId;

    // Join the room via socket
    socketRef.current.emit('join_private_room', { targetUserId: targetUser._id });

    // Fetch message history
    setLoadingMessages(true);
    const token = localStorage.getItem('scholarsOrbitToken');
    try {
      const res = await fetch(`${BASE_URL}/api/dm/messages/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setHasMore((data.messages || []).length >= 30);
      }
    } catch { /* ignore */ }
    setLoadingMessages(false);
  }, [user]);

  // Load older messages
  const loadMore = useCallback(async () => {
    if (!currentRoomRef.current || loadingMessages || !hasMore || messages.length === 0) return;

    const token = localStorage.getItem('scholarsOrbitToken');
    const oldest = messages[0]?.createdAt;
    if (!oldest) return;

    setLoadingMessages(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/dm/messages/${currentRoomRef.current}?before=${oldest}&limit=30`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const older = data.messages || [];
        setHasMore(older.length >= 30);
        setMessages((prev) => [...older, ...prev]);
      }
    } catch { /* ignore */ }
    setLoadingMessages(false);
  }, [loadingMessages, hasMore, messages]);

  // Send message
  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current || !currentRoomRef.current) return;

    socketRef.current.emit('send_message', {
      roomId: currentRoomRef.current,
      content: trimmed,
    });

    setInput('');
    // Stop typing indicator
    socketRef.current.emit('typing_stop', { roomId: currentRoomRef.current });
  }, [input]);

  // Typing indicator
  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    if (!socketRef.current || !currentRoomRef.current) return;

    socketRef.current.emit('typing_start', { roomId: currentRoomRef.current });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing_stop', { roomId: currentRoomRef.current });
    }, 1500);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Sort users: online first, then alphabetical
  const sortedUsers = [...users].sort((a, b) => {
    const aOnline = onlineUserIds.has(a._id) ? 0 : 1;
    const bOnline = onlineUserIds.has(b._id) ? 0 : 1;
    if (aOnline !== bOnline) return aOnline - bOnline;
    return a.name.localeCompare(b.name);
  });

  // Auth guard
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please log in to use direct messages.</p>
          <Link to="/login" className="text-purple-600 font-medium hover:underline">Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Nav */}
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
              Peer<span className="text-purple-600">Chat</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/ai-study-bot" className="px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium">
            AI Assistant
          </Link>
          <Link to="/dashboard" className="px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* DM Sidebar */}
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
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Direct Messages</h2>
            <p className="text-xs text-gray-400 mt-1">
              {onlineUserIds.size} online
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sortedUsers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8 px-4">
                No other users yet.
              </p>
            ) : (
              sortedUsers.map((u) => {
                const isOnline = onlineUserIds.has(u._id);
                const isActive = activeChat?._id === u._id;
                return (
                  <button
                    key={u._id}
                    onClick={() => selectUser(u)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                      ${isActive ? 'bg-purple-50 text-purple-700' : 'hover:bg-white text-gray-700'}
                    `}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        isActive ? 'bg-purple-600' : 'bg-gray-400'
                      }`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-50 rounded-full" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex flex-col flex-1 min-w-0">
          {activeChat ? (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0 flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {activeChat.name.charAt(0).toUpperCase()}
                  </div>
                  {onlineUserIds.has(activeChat._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{activeChat.name}</p>
                  <p className="text-xs text-gray-400">
                    {onlineUserIds.has(activeChat._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-white px-4 py-4">
                {/* Load more button */}
                {hasMore && messages.length > 0 && (
                  <div className="text-center mb-4">
                    <button
                      onClick={loadMore}
                      disabled={loadingMessages}
                      className="text-xs text-purple-600 hover:underline disabled:opacity-50"
                    >
                      {loadingMessages ? 'Loading...' : 'Load older messages'}
                    </button>
                  </div>
                )}

                {loadingMessages && messages.length === 0 && (
                  <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                    Loading messages...
                  </div>
                )}

                {!loadingMessages && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                    <p className="text-sm">No messages yet.</p>
                    <p className="text-xs mt-1">Say hi to {activeChat.name}!</p>
                  </div>
                )}

                <div className="max-w-3xl mx-auto space-y-3">
                  {messages.map((msg) => {
                    const isMine = msg.senderId === user.id;
                    return (
                      <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                          max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed
                          ${isMine
                            ? 'bg-purple-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'}
                        `}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-purple-200' : 'text-gray-400'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {typingUser && typingUser !== user.id && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
                <div className="max-w-3xl mx-auto flex items-end gap-3">
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${activeChat.name}...`}
                    rows={1}
                    className="flex-1 resize-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                    style={{ maxHeight: '100px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="shrink-0 w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors disabled:opacity-40"
                    aria-label="Send"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state — no chat selected */
            <div className="flex-1 flex flex-col items-center justify-center bg-white text-center px-4">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Peer Chat</h2>
              <p className="text-gray-500 text-sm max-w-sm">
                Select a user from the sidebar to start a conversation. Connect with fellow students to discuss problems and share knowledge.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
