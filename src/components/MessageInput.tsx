import React, { useState, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import debounce from 'lodash.debounce';

interface Props {
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export function MessageInput({ onSendMessage, onTyping }: Props) {
  const [message, setMessage] = useState('');

  const debouncedTyping = useCallback(
    debounce((isTyping: boolean) => {
      onTyping(isTyping);
    }, 500),
    [onTyping]
  );

  useEffect(() => {
    if (message) {
      debouncedTyping(true);
    } else {
      debouncedTyping(false);
    }
    return () => {
      debouncedTyping.cancel();
    };
  }, [message, debouncedTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');
    debouncedTyping(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border-t dark:border-gray-700">
      <div className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 p-4 border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400 text-gray-900 dark:text-white"
        />
        <button
          type="submit"
          className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
