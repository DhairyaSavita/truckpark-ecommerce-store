import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logisticsChatAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  TruckIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  ShieldExclamationIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  LockClosedIcon,
  PlusIcon,
  XMarkIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const diffMins = Math.floor((Date.now() - d) / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};
const formatMsgTime = (ts) =>
  ts ? new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

const getAccessLevel = (user) => {
  if (!user) return 'blocked';
  if (user.role === 'admin') return 'admin';
  if (user.is_logistics) return 'logistics';
  if (user.is_driver) return 'driver';
  if (user.role === 'seller') return 'seller';
  return 'blocked';
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 36 }) => {
  const initials = (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = (name?.charCodeAt(0) || 65) * 5 % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue}, 55%, 40%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif", fontSize: size * 0.38, fontWeight: 700,
      color: 'white', userSelect: 'none',
    }}>
      {initials}
    </div>
  );
};

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ isLogistics, role }) => {
  if (isLogistics) return <span className="badge badge-blue" style={{ fontSize: '0.6rem' }}>Logistics</span>;
  if (role === 'seller') return <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>Vendor</span>;
  if (role === 'admin') return <span className="badge badge-violet" style={{ fontSize: '0.6rem' }}>Admin</span>;
  if (role === 'driver') return <span className="badge badge-orange" style={{ fontSize: '0.6rem' }}>Driver</span>;
  return null;
};

// ─── Access Denied Screen ────────────────────────────────────────────────────
const AccessDenied = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-page)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)', padding: '48px 40px', maxWidth: 440,
        width: '100%', textAlign: 'center', animation: 'fadeSlideUp 0.4s ease-out both',
        boxShadow: 'var(--shadow-card)',
      }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto 24px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem',
        }}>
          <ArrowLeftIcon style={{ width: 14, height: 14 }} /> Go back
        </button>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: 'rgba(244,63,94,0.1)',
          border: '1px solid rgba(244,63,94,0.25)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <LockClosedIcon style={{ width: 36, height: 36, color: 'var(--rose)' }} />
        </div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
          Access Restricted
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
          This portal is for logistics partners, vendors, and administrators only. Regular customers do not have access.
        </p>
        <Link to="/" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12, display: 'flex' }}>
          ← Back to Home
        </Link>
        <Link to="/products" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
          Browse Products
        </Link>
      </div>
    </div>
  );
};

// ─── New Chat Modal ────────────────────────────────────────────────────────────
const NewChatModal = ({ contacts, onClose, onStart }) => {
  const [search, setSearch] = useState('');
  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.logistics_company_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.store_name || '').toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-card)', animation: 'fadeSlideUp 0.3s ease-out both',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)',
        }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            New Conversation
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>
        {/* Search */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-input)', border: '1px solid var(--border-medium)',
            borderRadius: 10, padding: '10px 14px',
          }}>
            <MagnifyingGlassIcon style={{ width: 16, height: 16, color: 'var(--text-muted)', flexShrink: 0 }} />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'var(--text-primary)', flex: 1 }}
            />
          </div>
        </div>
        {/* Contact list */}
        <div style={{ maxHeight: 300, overflowY: 'auto', padding: '0 8px 12px' }} className="scrollbar-hide">
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', padding: '32px 0' }}>
              No contacts found
            </p>
          ) : filtered.map(c => (
            <button key={c.id} onClick={() => onStart(c)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent',
              cursor: 'pointer', textAlign: 'left', transition: 'background var(--transition)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar name={c.name} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                  {c.name}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.logistics_company_name || c.store_name || c.email}
                </p>
              </div>
              <RoleBadge isLogistics={c.is_logistics} role={c.role} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const Bubble = ({ msg, isMine, peerName }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-end', gap: 8,
    flexDirection: isMine ? 'row-reverse' : 'row',
    animation: 'fadeSlideUp 0.25s ease-out both',
  }}>
    {!isMine && <Avatar name={peerName} size={28} />}
    <div style={{ maxWidth: '74%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', gap: 4 }}>
      {msg.subject && msg.subject !== 'Transport Coordination' && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: 'var(--text-muted)', paddingLeft: 4 }}>
          Re: {msg.subject}
        </p>
      )}
      <div style={{
        padding: '10px 14px',
        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', lineHeight: 1.55,
        background: isMine ? 'linear-gradient(135deg, #F97316, #EA580C)' : 'var(--bg-elevated)',
        color: isMine ? 'white' : 'var(--text-primary)',
        border: isMine ? 'none' : '1px solid var(--border-subtle)',
        boxShadow: isMine ? '0 4px 12px rgba(249,115,22,0.25)' : 'none',
      }}>
        {msg.message}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 4 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          {formatMsgTime(msg.created_at)}
        </span>
        {isMine && (msg.is_read
          ? <CheckCircleSolid style={{ width: 12, height: 12, color: 'var(--orange)' }} />
          : <ClockIcon style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
        )}
      </div>
    </div>
  </div>
);

// ─── Conversation List Item ───────────────────────────────────────────────────
const ConvItem = ({ conv, isActive, onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', padding: '12px 14px', textAlign: 'left',
    background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
    border: isActive ? '1px solid rgba(249,115,22,0.2)' : '1px solid transparent',
    borderRadius: 10, cursor: 'pointer',
    transition: 'all var(--transition)',
    margin: '1px 0',
  }}
    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-glass)'; }}
    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
  >
    <div style={{ position: 'relative' }}>
      <Avatar name={conv.peer_name} size={40} />
      {conv.unread_count > 0 && (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          width: 16, height: 16, borderRadius: '50%',
          background: 'var(--orange)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Outfit', sans-serif", fontSize: '0.65rem', fontWeight: 700,
        }}>
          {conv.unread_count}
        </span>
      )}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 600,
            color: isActive ? 'var(--orange)' : 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {conv.peer_name}
          </p>
          <RoleBadge isLogistics={conv.is_logistics} role={conv.peer_role} />
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
          {formatTime(conv.last_at)}
        </span>
      </div>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: '0.78rem',
        color: conv.unread_count > 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
        fontWeight: conv.unread_count > 0 ? 500 : 400,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {conv.last_message}
      </p>
    </div>
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const LogisticsCommunication = () => {
  const { user } = useAuth();
  const accessLevel = getAccessLevel(user);
  const canInitiate = ['logistics', 'admin', 'driver'].includes(accessLevel);

  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts]           = useState([]);
  const [activeConv, setActiveConv]       = useState(null);
  const [thread, setThread]               = useState([]);
  const [message, setMessage]             = useState('');
  const [subject, setSubject]             = useState('Transport Coordination');
  const [sending, setSending]             = useState(false);
  const [loading, setLoading]             = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [showNewChat, setShowNewChat]     = useState(false);
  const [convSearch, setConvSearch]       = useState('');
  const bottomRef = useRef();
  const inputRef  = useRef();

  const loadData = useCallback(async () => {
    if (accessLevel === 'blocked') return;
    try {
      const [convRes, contactRes] = await Promise.all([
        logisticsChatAPI.getConversations(),
        logisticsChatAPI.getVendors(),
      ]);
      setConversations(convRes.data);
      setContacts(contactRes.data);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [accessLevel]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!activeConv || accessLevel === 'blocked') return;
    setThreadLoading(true);
    logisticsChatAPI.getThread(activeConv.peer_id)
      .then(r => { setThread(r.data); loadData(); })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setThreadLoading(false));
    inputRef.current?.focus();
  }, [activeConv, loadData, accessLevel]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread]);

  useEffect(() => {
    if (accessLevel === 'blocked') return;
    const t = setInterval(() => {
      if (activeConv) logisticsChatAPI.getThread(activeConv.peer_id).then(r => setThread(r.data)).catch(() => {});
      loadData();
    }, 15000);
    return () => clearInterval(t);
  }, [activeConv, loadData, accessLevel]);

  if (accessLevel === 'blocked') return <AccessDenied />;

  const sendMessage = async () => {
    if (!message.trim() || !activeConv) return;
    setSending(true);
    try {
      await logisticsChatAPI.sendMessage({ receiver_id: activeConv.peer_id, message: message.trim(), subject });
      setMessage('');
      const res = await logisticsChatAPI.getThread(activeConv.peer_id);
      setThread(res.data);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const openContact = (contact) => {
    setActiveConv({ peer_id: contact.id, peer_name: contact.name, peer_role: contact.role, is_logistics: contact.is_logistics });
    setShowNewChat(false);
  };

  const filteredConvs = conversations.filter(c =>
    c.peer_name.toLowerCase().includes(convSearch.toLowerCase())
  );
  const canSendInThread = canInitiate || (accessLevel === 'seller' && thread.some(m => m.sender_id !== user.id));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Seller notice */}
      {accessLevel === 'seller' && (
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          borderBottom: '1px solid rgba(245,158,11,0.2)',
          padding: '10px 20px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <InformationCircleIcon style={{ width: 16, height: 16, color: 'var(--amber)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--amber)' }}>Vendor view — </strong>
            You can read and reply to messages from logistics partners, but cannot start new conversations. To request transport, use your{' '}
            <Link to="/seller/orders" style={{ color: 'var(--amber)', textDecoration: 'underline' }}>Order management page</Link>.
          </p>
        </div>
      )}

      <div style={{
        flex: 1, display: 'flex', overflow: 'hidden',
        height: accessLevel === 'seller' ? 'calc(100vh - 40px)' : '100vh',
      }}>
        {/* ══ LEFT SIDEBAR ════════════════════════════════════════════ */}
        <div style={{
          width: 300, flexShrink: 0,
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Sidebar header */}
          <div style={{ padding: '18px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #F97316, #EA580C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
                }}>
                  <TruckIcon style={{ width: 18, height: 18, color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                    Logistics Chat
                  </h2>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'var(--orange)', fontWeight: 500 }}>
                    {accessLevel === 'seller' ? 'Vendor Portal' : 'Transport Coordination'}
                  </p>
                </div>
              </div>
              {canInitiate && (
                <button onClick={() => setShowNewChat(true)} style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: 'var(--orange-dim)', border: '1px solid var(--border-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--orange)', transition: 'all var(--transition)',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--orange-dim)'}
                  title="New conversation"
                >
                  <PlusIcon style={{ width: 16, height: 16 }} />
                </button>
              )}
            </div>
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-input)', border: '1px solid var(--border-medium)',
              borderRadius: 8, padding: '8px 12px',
            }}>
              <MagnifyingGlassIcon style={{ width: 14, height: 14, color: 'var(--text-muted)', flexShrink: 0 }} />
              <input value={convSearch} onChange={e => setConvSearch(e.target.value)}
                placeholder="Search conversations…"
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-primary)',
                  flex: 1,
                }}
              />
            </div>
          </div>

          {/* Access level indicator */}
          <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: accessLevel === 'logistics' ? 'var(--emerald)' : accessLevel === 'seller' ? 'var(--amber)' : 'var(--blue)',
              boxShadow: `0 0 6px ${accessLevel === 'seller' ? 'rgba(245,158,11,0.5)' : 'rgba(16,185,129,0.5)'}`,
              animation: 'blink 2s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {accessLevel === 'logistics'
                ? (user?.logistics_verified ? 'Verified Logistics Partner' : 'Pending Verification')
                : accessLevel === 'seller' ? 'Vendor — Reply Only'
                : accessLevel === 'admin' ? 'Admin — Full Access'
                : 'Driver'}
            </span>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }} className="scrollbar-hide">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px' }}>
                  <div className="skeleton-dark" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-dark" style={{ height: 12, width: '70%', borderRadius: 4, marginBottom: 6 }} />
                    <div className="skeleton-dark" style={{ height: 10, width: '50%', borderRadius: 4 }} />
                  </div>
                </div>
              ))
            ) : filteredConvs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <ChatBubbleLeftRightIcon style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {canInitiate ? 'No conversations yet.' : 'No messages yet.'}
                </p>
                {canInitiate && (
                  <button onClick={() => setShowNewChat(true)} style={{
                    marginTop: 10, background: 'transparent', border: 'none', cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--orange)', fontWeight: 600,
                  }}>
                    + Start one
                  </button>
                )}
              </div>
            ) : filteredConvs.map(conv => (
              <ConvItem key={conv.peer_id} conv={conv}
                isActive={activeConv?.peer_id === conv.peer_id}
                onClick={() => setActiveConv({ peer_id: conv.peer_id, peer_name: conv.peer_name, peer_role: conv.peer_role, is_logistics: conv.is_logistics })}
              />
            ))}
          </div>
        </div>

        {/* ══ RIGHT: Thread Panel ═══════════════════════════════════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!activeConv ? (
            /* Empty state */
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
              <div style={{ textAlign: 'center', maxWidth: 380 }}>
                <div style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                  animation: 'float 3s ease-in-out infinite',
                }}>
                  <TruckIcon style={{ width: 46, height: 46, color: 'rgba(249,115,22,0.4)' }} />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {canInitiate ? 'Select or Start a Conversation' : 'Select a Conversation'}
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                  {accessLevel === 'seller'
                    ? 'Select a conversation from logistics partners on the left to view and reply.'
                    : 'Contact vendors and drivers to coordinate transport logistics.'}
                </p>
                {canInitiate && (
                  <button onClick={() => setShowNewChat(true)} className="btn-primary" style={{ margin: '0 auto' }}>
                    <PlusIcon style={{ width: 16, height: 16 }} /> New Conversation
                  </button>
                )}
                {/* Access info */}
                <div style={{
                  marginTop: 28, textAlign: 'left', padding: '16px 18px',
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)',
                }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldExclamationIcon style={{ width: 14, height: 14 }} /> Channel Access Levels
                  </p>
                  {[
                    { text: 'Logistics Partners — Initiate + Reply', color: 'var(--emerald)', icon: CheckCircleIcon },
                    { text: 'Admins — Full Access', color: 'var(--emerald)', icon: CheckCircleIcon },
                    { text: 'Vendors / Sellers — Reply Only', color: 'var(--amber)', icon: CheckCircleIcon },
                    { text: 'Customers — No Access', color: 'var(--rose)', icon: XCircleIcon },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <a.icon style={{ width: 13, height: 13, color: a.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: a.color }}>{a.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={activeConv.peer_name} size={40} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {activeConv.peer_name}
                      </p>
                      <RoleBadge isLogistics={activeConv.is_logistics} role={activeConv.peer_role} />
                    </div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Transport Coordination Channel
                    </p>
                  </div>
                </div>
                <button onClick={loadData} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 8, borderRadius: 8, transition: 'color var(--transition)',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  title="Refresh"
                >
                  <ArrowPathIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '24px 20px',
                display: 'flex', flexDirection: 'column', gap: 16,
              }} className="scrollbar-hide">
                {threadLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                    <svg style={{ width: 24, height: 24, animation: 'spin 0.8s linear infinite', color: 'var(--orange)' }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                    </svg>
                  </div>
                ) : thread.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <ChatBubbleLeftRightIcon style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px', opacity: 0.3 }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      No messages yet.{canInitiate ? ' Send a message to get started!' : ' Waiting for logistics partner to initiate.'}
                    </p>
                  </div>
                ) : thread.map(msg => (
                  <Bubble key={msg.id} msg={msg} isMine={msg.sender_id === user?.id} peerName={activeConv.peer_name} />
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Compose */}
              {canSendInThread ? (
                <div style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card)', padding: '0 16px 16px' }}>
                  {/* Subject line */}
                  <input value={subject} onChange={e => setSubject(e.target.value)}
                    style={{
                      width: '100%', background: 'transparent', border: 'none',
                      borderBottom: '1px solid var(--border-subtle)', padding: '8px 4px',
                      fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)',
                      outline: 'none', transition: 'border-color var(--transition)',
                    }}
                    onFocus={e => e.target.style.borderBottomColor = 'var(--orange)'}
                    onBlur={e => e.target.style.borderBottomColor = 'var(--border-subtle)'}
                    placeholder="Subject (optional)"
                  />
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 12 }}>
                    <div style={{
                      flex: 1,
                      background: 'var(--bg-input)', border: '1px solid var(--border-medium)',
                      borderRadius: 14, padding: '10px 14px',
                      transition: 'border-color var(--transition)',
                    }}
                      onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--orange)'}
                      onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-medium)'}
                    >
                      <textarea ref={inputRef} value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={handleKey} rows={1}
                        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                        style={{
                          width: '100%', background: 'transparent', border: 'none', outline: 'none',
                          resize: 'none', maxHeight: 120,
                          fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'var(--text-primary)',
                          lineHeight: 1.5,
                        }}
                        onInput={e => {
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                      />
                    </div>
                    <button onClick={sendMessage} disabled={!message.trim() || sending}
                      style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0, border: 'none',
                        background: message.trim() && !sending ? 'linear-gradient(135deg, #F97316, #EA580C)' : 'var(--bg-elevated)',
                        color: message.trim() && !sending ? 'white' : 'var(--text-muted)',
                        cursor: message.trim() && !sending ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: message.trim() && !sending ? '0 4px 12px rgba(249,115,22,0.3)' : 'none',
                        transition: 'all var(--transition)',
                      }}
                    >
                      {sending
                        ? <svg style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                          </svg>
                        : <PaperAirplaneIcon style={{ width: 18, height: 18 }} />
                      }
                    </button>
                  </div>
                  {accessLevel === 'seller' && (
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: 'var(--amber)', marginTop: 6, textAlign: 'center' }}>
                      Replying as vendor — logistics partner will be notified
                    </p>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '16px 20px', borderTop: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)', textAlign: 'center',
                }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <LockClosedIcon style={{ width: 14, height: 14 }} />
                    You can reply once a logistics partner sends the first message.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && canInitiate && (
        <NewChatModal contacts={contacts} onClose={() => setShowNewChat(false)} onStart={openContact} />
      )}
    </div>
  );
};

export default LogisticsCommunication;
