import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

interface ChatContextType {
  socket: Socket | null;
  unreadCount: number;
  clearUnread: () => void;
}

const ChatContext = createContext<ChatContextType>({
  socket: null,
  unreadCount: 0,
  clearUnread: () => {},
});

export const useChat = () => useContext(ChatContext);

// Initialize socket outside component to prevent multiple connections
const socket = io('http://localhost:5000', { autoConnect: false });

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { mongoUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation(); 
  // 1. Connect Socket when user logs in
  useEffect(() => {
    if (mongoUser?.teamId) {
      socket.connect();
      socket.emit('join_team', mongoUser.teamId);
    }

    return () => {
      socket.disconnect();
    };
  }, [mongoUser]);

  // 2. Listen for messages globally
  useEffect(() => {
    const handleMessage = (data: any) => {
      // Only increment if we are NOT on the chat page
      if (location.pathname !== '/chat') {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('receive_message', handleMessage);
    };
  }, [location.pathname]);

  const clearUnread = () => {
    setUnreadCount(0);
  };

  return (
    <ChatContext.Provider value={{ socket, unreadCount, clearUnread }}>
      {children}
    </ChatContext.Provider>
  );
};