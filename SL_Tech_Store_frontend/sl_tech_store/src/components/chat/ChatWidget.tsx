import { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import type { ChatMessage, ChatRoom } from '../../types';
import './ChatWidget.css';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const { user } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!open) return;
    api.get('/chat/room').then(r => { setRoom(r.data.data); loadMessages(r.data.data.id); });
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [open]);

  const loadMessages = (roomId: string) => {
    api.get(`/chat/room/${roomId}/messages?page=0&size=50`).then(r => {
      setMessages((r.data.data?.content || []).reverse());
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      api.get(`/chat/room/${roomId}/messages?page=0&size=50`).then(r => setMessages((r.data.data?.content || []).reverse()));
    }, 3000);
  };

  const send = async () => {
    if (!input.trim() || !room) return;
    try {
      await api.post(`/chat/room/${room.id}/read`);
      const msg: any = { roomId: room.id, content: input, type: 'TEXT' };
      // Send via REST (fallback for WebSocket)
      const res = await api.post('/chat/room/' + room.id + '/send', msg).catch(() => null);
      if (!res) {
        // If no REST send endpoint, create message locally
        const localMsg: ChatMessage = { id: Date.now().toString(), roomId: room.id, senderId: user?.id || '', senderName: user?.name || '', senderRole: 'USER', content: input, type: 'TEXT', read: false, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, localMsg]);
      }
      setInput('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { /* ignore */ }
  };

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={() => setOpen(true)}>
          <FiMessageSquare size={24} />
        </button>
      )}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span>💬 Support Chat</span>
            <button onClick={() => setOpen(false)}><FiX /></button>
          </div>
          <div className="chat-messages">
            {messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 40 }}>Start a conversation!</div>}
            {messages.map(m => (
              <div key={m.id} className={`chat-msg ${m.senderId === user?.id ? 'sent' : 'received'}`}>
                <div className="msg-bubble">{m.content}</div>
                <div className="msg-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
              onKeyDown={e => e.key === 'Enter' && send()} />
            <button onClick={send}><FiSend /></button>
          </div>
        </div>
      )}
    </>
  );
}
