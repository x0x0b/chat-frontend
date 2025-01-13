import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Users, Menu, X, Moon, Sun } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Message as MessageComponent } from './components/Message';
import { MessageInput } from './components/MessageInput';
import { TypingIndicator } from './components/TypingIndicator';
import type { Message, TypingUser } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isJoined) {
      socketRef.current = io('http://localhost:3000');

      socketRef.current.on('connect', () => {
        socketRef.current?.emit('join', username);
      });

      socketRef.current.on('message', (message: Message) => {
        setMessages(prev => [...prev, { ...message, timestamp: new Date(message.timestamp) }]);
      });

      socketRef.current.on('messageDeleted', (messageId: string) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      });

      socketRef.current.on('messageEdited', (data) => {
        setMessages(prev => prev.map(m => 
          m.id === data.id ? { ...m, text: data.text, edited: data.edited } : m
        ));
      });

      socketRef.current.on('userJoined', (data) => {
        setMessages(prev => [...prev, {
          id: nanoid(),
          text: data.message,
          username: 'System',
          timestamp: new Date(),
          type: 'system'
        }]);
      });

      socketRef.current.on('userLeft', (data) => {
        setMessages(prev => [...prev, {
          id: nanoid(),
          text: data.message,
          username: 'System',
          timestamp: new Date(),
          type: 'system'
        }]);
      });

      socketRef.current.on('userList', (userList: string[]) => {
        setUsers(userList);
      });

      socketRef.current.on('typing', (data: TypingUser) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.username !== data.username);
          return data.isTyping ? [...filtered, data] : filtered;
        });
      });

      socketRef.current.on('error', (message: string) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isJoined, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback((text: string) => {
    const messageData = {
      id: nanoid(),
      text,
      timestamp: new Date()
    };

    socketRef.current?.emit('message', messageData);
  }, []);

  const handleEditMessage = useCallback((id: string, text: string) => {
    socketRef.current?.emit('editMessage', { id, text });
  }, []);

  const handleDeleteMessage = useCallback((id: string) => {
    socketRef.current?.emit('deleteMessage', id);
  }, []);

  const handleTyping = useCallback((isTyping: boolean) => {
    socketRef.current?.emit('typing', isTyping);
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsJoined(true);
  };

  const UsersList = () => (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 dark:text-white">参加者一覧</h2>
        <button
          onClick={() => setIsDrawerOpen(false)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full lg:hidden transition-colors"
        >
          <X className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
      </div>
      <ul className="space-y-2">
        {users.map((user, index) => (
          <li
            key={index}
            className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user)}`}
                alt={`${user}のアバター`}
                className="w-10 h-10 rounded-full relative"
              />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{user}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  if (!isJoined) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:scale-[1.02] transition-all">
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              チャットに参加
            </h1>
            <form onSubmit={handleJoin} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ユーザー名を入力..."
                  className="w-full p-4 border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                参加する
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
      
      {/* モバイルドロワー */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden transition-opacity ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 p-6 transform transition-transform duration-300 ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <UsersList />
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-2xl h-screen flex flex-col transition-colors">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">チャットルーム</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">{users.length}人が参加中</span>
              <span className="sm:hidden">{users.length}</span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full lg:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* デスクトップサイドバー */}
          <div className="hidden lg:block w-80 border-r dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
            <UsersList />
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <MessageComponent
                  key={message.id}
                  message={message}
                  currentUsername={username}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <TypingIndicator
              typingUsers={typingUsers}
              currentUsername={username}
            />

            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
