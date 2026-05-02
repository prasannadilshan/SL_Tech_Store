import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiShoppingBag, FiUsers, FiMessageSquare, FiTrendingUp, FiCheckCircle, FiSend } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import type { ChatRoom, ChatMessage } from '../../types';
import './Admin.css';

export default function AdminChat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selected, setSelected] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [onlineStatus, setOnlineStatus] = useState<string>('');
  const { user } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.get('/chat/rooms').then(r => setRooms(r.data.data || [])).catch(() => {});
    
    // Ping to update lastSeenAt
    api.post('/users/ping').catch(() => {});
    pingIntervalRef.current = setInterval(() => api.post('/users/ping').catch(() => {}), 10000);

    return () => { 
      if (intervalRef.current) clearInterval(intervalRef.current); 
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, []);

  const selectRoom = (room: ChatRoom) => {
    setSelected(room);
    setOnlineStatus('Loading...');
    loadMessages(room);
    api.post(`/chat/room/${room.id}/read`).catch(() => {});
  };

  const loadMessages = (room: ChatRoom) => {
    const fetchMsgs = () => {
      api.get(`/chat/room/${room.id}/messages?page=0&size=50`).then(r => {
        setMessages((r.data.data?.content || []).reverse());
      });
      api.get(`/users/${room.userId}/status`).then(r => {
        if (!r.data.data) {
          setOnlineStatus('Offline');
          return;
        }
        new Date(r.data.data + 'Z'); // Add Z to fix UTC parsing
        const now = new Date();
        // Since the server time is local, wait, LocalDateTime is tricky.
        // Assuming server and client are in the same zone or using relative time
        // Just compare with server time if possible, or just parse directly
        const lastSeenLocal = new Date(r.data.data);
        if ((now.getTime() - lastSeenLocal.getTime()) < 30000) {
          setOnlineStatus('Online');
        } else {
          setOnlineStatus('Last seen: ' + lastSeenLocal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }).catch(() => setOnlineStatus('Offline'));
    };

    fetchMsgs();
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchMsgs, 3000);
  };

  const send = async () => {
    if (!input.trim() || !selected) return;
    const msg: any = { roomId: selected.id, content: input, type: 'TEXT' };
    
    // Optimistic UI update
    const localMsg: ChatMessage = { id: Date.now().toString(), roomId: selected.id, senderId: user?.id || '', senderName: user?.name || 'Admin', senderRole: 'ADMIN', content: input, type: 'TEXT', read: false, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, localMsg]);
    setInput('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    // Send via REST
    await api.post('/chat/room/' + selected.id + '/send', msg).catch(() => null);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header"><span className="logo-icon">💻</span><h3>Admin Panel</h3></div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-link"><FiTrendingUp /> Dashboard</Link>
          <Link to="/admin/products" className="sidebar-link"><FiBox /> Products</Link>
          <Link to="/admin/orders" className="sidebar-link"><FiShoppingBag /> Orders</Link>
          <Link to="/admin/users" className="sidebar-link"><FiUsers /> Users</Link>
          <Link to="/admin/chat" className="sidebar-link active"><FiMessageSquare /> Chat</Link>
          <Link to="/" className="sidebar-link" style={{ marginTop: 'auto' }}><FiCheckCircle /> Back to Store</Link>
        </nav>
      </aside>
      <main className="admin-main" style={{ padding: 0 }}>
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
          {/* Room List */}
          <div style={{ width: 320, borderRight: '1px solid var(--gray-200)', overflowY: 'auto', background: 'white' }}>
            <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--gray-100)', fontWeight: 800, fontSize: 18 }}>💬 Chat Inbox</div>
            {rooms.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>No conversations yet</div>}
            {rooms.map(room => (
              <div key={room.id} onClick={() => selectRoom(room)}
                style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-50)', cursor: 'pointer', background: selected?.id === room.id ? 'var(--primary-50)' : 'transparent', transition: 'background 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary-700)' }}>
                    {room.userName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{room.userName}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{room.lastMessage || 'No messages'}</div>
                  </div>
                  {room.unreadCount > 0 && <span style={{ background: 'var(--danger)', color: 'white', fontSize: 11, fontWeight: 700, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{room.unreadCount}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--gray-50)' }}>
            {!selected ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', fontSize: 16 }}>
                <div style={{ textAlign: 'center' }}><FiMessageSquare size={48} style={{ marginBottom: 12 }} /><p>Select a conversation</p></div>
              </div>
            ) : (
              <>
                <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid var(--gray-100)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                  {selected.userName}
                  <span style={{ fontSize: 12, fontWeight: 500, color: onlineStatus === 'Online' ? 'var(--success)' : 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {onlineStatus === 'Online' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />}
                    {onlineStatus}
                  </span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {messages.map(m => (
                    <div key={m.id} style={{ alignSelf: m.senderRole === 'ADMIN' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                      <div style={{ padding: '10px 14px', borderRadius: 16, fontSize: 14, background: m.senderRole === 'ADMIN' ? 'var(--primary-600)' : 'white', color: m.senderRole === 'ADMIN' ? 'white' : 'var(--gray-800)', boxShadow: 'var(--shadow-sm)' }}>
                        {m.content}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2, textAlign: m.senderRole === 'ADMIN' ? 'right' : 'left' }}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <div style={{ display: 'flex', gap: 8, padding: '12px 20px', background: 'white', borderTop: '1px solid var(--gray-100)' }}>
                  <input className="input" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a reply..." onKeyDown={e => e.key === 'Enter' && send()} style={{ borderRadius: 'var(--radius-full)' }} />
                  <button className="btn btn-primary" onClick={send} style={{ borderRadius: 'var(--radius-full)', width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiSend /></button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
