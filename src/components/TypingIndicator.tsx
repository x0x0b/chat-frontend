import React from 'react';
import type { TypingUser } from '../types';

interface Props {
  typingUsers: TypingUser[];
  currentUsername: string;
}

export function TypingIndicator({ typingUsers, currentUsername }: Props) {
  const typing = typingUsers.filter(user => user.isTyping && user.username !== currentUsername);
  
  if (typing.length === 0) return null;

  return (
    <div className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400">
      {typing.length === 1 ? (
        <p>{typing[0].username}が入力中...</p>
      ) : (
        <p>{typing.map(u => u.username).join('、')}が入力中...</p>
      )}
    </div>
  );
}