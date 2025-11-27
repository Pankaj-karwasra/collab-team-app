import { useEffect, useState, useRef } from 'react';
import { messageApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext'; 
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Chat() {
  const { user, mongoUser } = useAuth();
  const { socket, clearUnread } = useChat(); 
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const teamId = mongoUser?.teamId;

  // 1. Clear notifications when entering the chat
  useEffect(() => {
    clearUnread();
    
    return () => clearUnread(); 
  }, []); 
  // 2. Handle Messages
  useEffect(() => {
    if (!teamId || !socket) return;

    // Fetch History
    messageApi.getAll(teamId)
      .then(res => setMessages(res.data))
      .catch(err => console.error("Chat Error:", err));

    // Listen for new messages
    const handleReceive = (data: any) => {
      setMessages((prev) => [...prev, data]);
      // Scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    socket.on('receive_message', handleReceive);

    return () => {
      socket.off('receive_message', handleReceive);
    };
  }, [teamId, socket]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !teamId || !socket) return;

    const msgData = { 
        content: input, 
        teamId, 
        senderId: { name: user?.displayName || 'Me' } 
    };
    
    try {
      // 1. Send to DB
      await messageApi.send({ content: input, teamId });
      
      
      setInput('');
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  if (!teamId) return <div className="p-8">Please join a team.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded shadow border">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.senderId?.name === user?.displayName ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-400">{msg.senderId?.name || 'User'}</span>
            <div className={`p-2 rounded-lg max-w-xs ${msg.senderId?.name === user?.displayName ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
        <Input value={input} onChange={(e: any) => setInput(e.target.value)} placeholder="Type a message..." />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}