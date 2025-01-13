export interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: Date;
  edited?: boolean;
  readBy?: string[];
  type?: 'system';
}

export interface TypingUser {
  username: string;
  isTyping: boolean;
}