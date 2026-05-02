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
  const [adminStatus, setAdminStatus] = useState<string>('Support Team');
  const { user } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) return;
    api.get('/chat/room').then(r => { setRoom(r.data.data); loadMessages(r.data.data.id); });
    
    // Ping to update lastSeenAt
    api.post('/users/ping').catch(() => {});
    pingIntervalRef.current = setInterval(() => api.post('/users/ping').catch(() => {}), 10000);

    return () => { 
      if (intervalRef.current) clearInterval(intervalRef.current); 
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [open]);

  const loadMessages = (roomId: string) => {
    const fetchMsgs = () => {
      api.get(`/chat/room/${roomId}/messages?page=0&size=50`).then(r => {
        setMessages((r.data.data?.content || []).reverse());
      });
      api.get('/users/admin/status').then(r => {
        if (!r.data.data) {
          setAdminStatus('Offline');
          return;
        }
        const lastSeenLocal = new Date(r.data.data + 'Z');
        const now = new Date();
        if ((now.getTime() - lastSeenLocal.getTime()) < 30000) {
          setAdminStatus('Online');
        } else {
          setAdminStatus('Offline');
        }
      }).catch(() => setAdminStatus('Offline'));
    };

    fetchMsgs();
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchMsgs, 3000);
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
          <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>💬 Support Chat</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: adminStatus === 'Online' ? '#86efac' : 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                {adminStatus === 'Online' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac', display: 'inline-block' }} />}
                {adminStatus === 'Online' ? 'Active now' : 'Typically replies in a few minutes'}
              </span>
            </div>
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
