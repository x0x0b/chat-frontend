import React, { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { Message as MessageType } from '../types';

interface Props {
  message: MessageType;
  currentUsername: string;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function Message({ message, currentUsername, onEdit, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const isOwnMessage = message.username === currentUsername;

  const handleEdit = () => {
    if (editText.trim() !== message.text) {
      onEdit(message.id, editText);
    }
    setIsEditing(false);
  };

  React.useEffect(() => {}, [message.id, isOwnMessage, currentUsername]);

  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <div className="max-w-[85%] sm:max-w-[70%] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl p-4">
          <p className="text-center">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
      {!isOwnMessage && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          <img
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(message.username)}`}
            alt={`${message.username}のアバター`}
            className="w-10 h-10 rounded-full mr-3 relative"
          />
        </div>
      )}
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 transform transition-transform hover:scale-[1.02] ${
          isOwnMessage
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
        }`}
      >
        <div className="flex justify-between items-start gap-2">
          <p className="text-sm font-semibold mb-1 opacity-90">{message.username}</p>
          {isOwnMessage && !isEditing && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleEdit}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(message.text);
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="break-words leading-relaxed">{message.text}</p>
            <div className="flex justify-between items-center mt-2 text-xs opacity-70">
              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
              {message.edited && <span>(編集済み)</span>}
            </div>
          </>
        )}
      </div>
      {isOwnMessage && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          <img
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(message.username)}`}
            alt={`${message.username}のアバター`}
            className="w-10 h-10 rounded-full ml-3 relative"
          />
        </div>
      )}
    </div>
  );
}
