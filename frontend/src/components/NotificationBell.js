import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';

const ROLE_COLOR = { fleet: '#F97316', appointment: '#3B82F6', system: '#8B5CF6', order: '#10B981', default: '#94A3B8' };

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [open, setOpen]                   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return;
    const unsub = notificationService.subscribe(({ notifications: n, unread_count }) => {
      setNotifications(n || []);
      setUnread(unread_count || 0);
    });
    notificationService.start();
    return () => { unsub(); };
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const handleRead = async (n) => {
    await notificationService.markRead(n.id);
    setOpen(false);
  };

  const handleReadAll = async (e) => {
    e.stopPropagation();
    await notificationService.markAllRead();
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'relative', border: 'none', cursor: 'pointer',
          padding: 8, borderRadius: 10,
          background: open ? 'rgba(249,115,22,0.1)' : 'transparent',
          transition: 'background 0.2s',
        }}
        aria-label="Notifications"
      >
        <BellIcon style={{ width: 22, height: 22, color: 'var(--text-secondary)' }} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            background: '#EF4444', color: '#fff',
            fontSize: '0.6rem', fontWeight: 800,
            borderRadius: '50%', width: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif",
            animation: 'pulse 2s infinite',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 10px)',
          width: 340, maxHeight: 440, overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          zIndex: 1000,
          animation: 'fadeSlideUp 0.2s ease-out',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Notifications {unread > 0 && <span style={{ color: '#F97316' }}>({unread})</span>}
            </span>
            {unread > 0 && (
              <button onClick={handleReadAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#3B82F6', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckIcon style={{ width: 12, height: 12 }} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
              🔔 No notifications yet
            </div>
          ) : (
            notifications.slice(0, 15).map(n => (
              <div
                key={n.id}
                onClick={() => handleRead(n)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  background: n.is_read ? 'transparent' : 'rgba(59,130,246,0.05)',
                  transition: 'background 0.15s',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(59,130,246,0.05)'}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                  background: n.is_read ? 'var(--border-medium)' : (ROLE_COLOR[n.type] || ROLE_COLOR.default),
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 2 }}>{n.title}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatTime(n.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
