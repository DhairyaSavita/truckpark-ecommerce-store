import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { communityAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const ROLE_BADGE_STYLES = {
  driver:      { bg: 'rgba(249,115,22,0.12)', color: '#F97316', label: '🚛 Driver' },
  technician:  { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: '🔧 Technician' },
  refurbisher: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: '♻️ Refurbisher' },
  logistics:   { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6', label: '📦 Logistics' },
  seller:      { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: '🏪 Seller' },
  admin:       { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', label: '⚡ Admin' },
};

const THREAD_TYPE_MAP = {
  technical_enquiry:  { label: 'Technical Enquiry', color: '#3B82F6' },
  operational_insight:{ label: 'Operational Insight', color: '#10B981' },
  peer_support:       { label: 'Peer Support', color: '#F59E0B' },
  announcement:       { label: 'Announcement', color: '#EF4444' },
  general:            { label: 'General', color: '#94A3B8' },
};

const CHANNELS = [
  { key: 'all',         label: 'All Topics',            icon: '📋', gradient: 'from-slate' },
  { key: 'drivers',     label: 'Drivers Hub',           icon: '🚛', color: '#F97316' },
  { key: 'technicians', label: 'Technicians Lounge',    icon: '🔧', color: '#3B82F6' },
  { key: 'refurbishers',label: 'Refurbishers Workshop', icon: '♻️', color: '#10B981' },
  { key: 'logistics',   label: 'Logistics Operations',  icon: '📦', color: '#8B5CF6' },
  { key: 'trade',       label: 'Open Trade',            icon: '🤝', color: '#F59E0B' },
  { key: 'general',     label: 'General Discussion',    icon: '💬', color: '#94A3B8' },
  { key: 'technical',   label: 'Technical Help',        icon: '⚙️', color: '#60A5FA' },
];

function CreatePostModal({ onClose, onSuccess, defaultChannel }) {
  const [form, setForm] = useState({ title: '', content: '', channel: defaultChannel || 'general', thread_type: 'general' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return toast.error('Title and content required');
    setSubmitting(true);
    try {
      await communityAPI.createPost(form);
      toast.success('✅ Post published!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    } finally { setSubmitting(false); }
  };

  const inp = { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 20, padding: 32, maxWidth: 560, width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Start a Discussion</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Channel</label>
              <select style={inp} value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
                {CHANNELS.filter(c => c.key !== 'all').map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Thread Type</label>
              <select style={inp} value={form.thread_type} onChange={e => setForm(f => ({ ...f, thread_type: e.target.value }))}>
                {Object.entries(THREAD_TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Title *</label>
            <input style={inp} placeholder="What's your question or topic?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Content *</label>
            <textarea rows={5} style={{ ...inp, resize: 'vertical' }} placeholder="Share your knowledge, ask your question, or describe the issue…" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: 10, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ flex: 2, padding: 11, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Publishing…' : '🚀 Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ProviderCommunity = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState('all');
  const [threadType, setThreadType] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeChannel !== 'all') params.channel = activeChannel;
      if (threadType) params.thread_type = threadType;
      if (search.trim()) params.search = search;
      const [postsRes, statsRes] = await Promise.all([
        communityAPI.getPosts(params),
        communityAPI.getStats(),
      ]);
      setPosts(postsRes.data || []);
      setStats(statsRes.data || {});
    } catch { toast.error('Failed to load community posts'); }
    finally { setLoading(false); }
  }, [activeChannel, threadType, search]);

  useEffect(() => { load(); }, [load]);

  const handleUpvote = async (id) => {
    if (!user) return toast.error('Login to upvote');
    try {
      const res = await communityAPI.upvotePost(id);
      setPosts(p => p.map(post => post.id === id ? { ...post, upvotes: res.data.upvotes } : post));
    } catch {}
  };

  const formatTime = (d) => {
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(d).toLocaleDateString();
  };

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 16, padding: 20 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 80 }}>
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(249,115,22,0.06) 100%)', borderBottom: '1px solid var(--border-subtle)', padding: '48px 32px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 8 }}>
                🏘️ Provider Community
              </h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: 480 }}>
                Where Drivers, Technicians, Refurbishers, and Logistics Partners connect — share knowledge, resolve technical queries, and support each other.
              </p>
            </div>
            {user && (
              <button onClick={() => setShowCreate(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 8px 32px rgba(59,130,246,0.3)', whiteSpace: 'nowrap' }}>
                <PlusIcon style={{ width: 18, height: 18 }} /> New Discussion
              </button>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Discussions', value: stats.total_posts || 0, color: '#3B82F6', icon: '💬' },
              { label: 'Replies', value: stats.total_comments || 0, color: '#8B5CF6', icon: '🗨️' },
              { label: 'Resolved', value: stats.resolved || 0, color: '#10B981', icon: '✅' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '10px 16px' }}>
                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                <div>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: s.color }}>{s.value.toLocaleString()}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Sidebar Channels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Channels</p>
          {CHANNELS.map(ch => (
            <button key={ch.key} onClick={() => setActiveChannel(ch.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: activeChannel === ch.key ? `rgba(${ch.color ? ch.color.replace('#','').match(/.{2}/g).map(h => parseInt(h,16)).join(',') : '255,255,255'},0.15)` : 'transparent', color: activeChannel === ch.key ? (ch.color || 'var(--text-primary)') : 'var(--text-secondary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: activeChannel === ch.key ? 700 : 500, textAlign: 'left', transition: 'all 0.15s' }}>
              <span style={{ fontSize: '1rem' }}>{ch.icon}</span>
              <span>{ch.label}</span>
            </button>
          ))}

          {/* Thread type filter */}
          <div style={{ marginTop: 20 }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Thread Type</p>
            {[{ key: '', label: 'All' }, ...Object.entries(THREAD_TYPE_MAP).map(([k, v]) => ({ key: k, label: v.label }))].map(t => (
              <button key={t.key} onClick={() => setThreadType(t.key)}
                style={{ display: 'block', width: '100%', padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: threadType === t.key ? 'rgba(255,255,255,0.06)' : 'transparent', color: threadType === t.key ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', textAlign: 'left', fontWeight: threadType === t.key ? 700 : 400 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        <div>
          {/* Search */}
          <input
            placeholder="Search discussions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 12, padding: '12px 16px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: 16 }}
          />

          {!user && (
            <div style={{ ...card, marginBottom: 16, borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#F59E0B' }}>
                🔒 <strong>Login</strong> to post, upvote, and join discussions. All providers can participate in the community.
              </p>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(4)].map((_, i) => <div key={i} style={{ ...card, height: 100, animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : posts.length === 0 ? (
            <div style={{ ...card, padding: 48, textAlign: 'center' }}>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No posts yet in this channel</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>Be the first to start a discussion!</p>
              {user && <button onClick={() => setShowCreate(true)} style={{ marginTop: 16, padding: '9px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, cursor: 'pointer' }}>Start Discussion</button>}
            </div>
          ) : posts.map(post => {
            const badge = ROLE_BADGE_STYLES[post.author_role_badge] || ROLE_BADGE_STYLES.seller;
            const type  = THREAD_TYPE_MAP[post.thread_type] || THREAD_TYPE_MAP.general;
            const ch    = CHANNELS.find(c => c.key === post.channel);
            return (
              <Link key={post.id} to={`/forum/post/${post.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ ...card, marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                        {post.is_pinned && <span style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '1px 8px', fontSize: '0.68rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>📌 Pinned</span>}
                        {post.is_resolved && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '1px 8px', fontSize: '0.68rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>✅ Resolved</span>}
                        <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: '1px 8px', fontSize: '0.68rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{badge.label}</span>
                        <span style={{ background: 'rgba(255,255,255,0.04)', color: type.color, borderRadius: 20, padding: '1px 8px', fontSize: '0.68rem', fontFamily: "'Inter', sans-serif" }}>{type.label}</span>
                        {ch && ch.key !== 'all' && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: ch.color || 'var(--text-muted)' }}>{ch.icon} {ch.label}</span>}
                      </div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.97rem', color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>{post.title}</h3>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {post.content.length > 140 ? post.content.slice(0, 140) + '…' : post.content}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>By {post.User?.name || 'Unknown'}</span>
                        <span>· {formatTime(post.created_at)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button onClick={e => { e.preventDefault(); e.stopPropagation(); handleUpvote(post.id); }}
                        style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <span style={{ fontSize: '1rem' }}>⬆</span>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 800, color: '#3B82F6' }}>{post.upvotes || 0}</span>
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <ChatBubbleLeftIcon style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(post.comments || []).length}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '0.7rem' }}>👁</span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'var(--text-muted)' }}>{post.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} onSuccess={load} defaultChannel={activeChannel === 'all' ? 'general' : activeChannel} />}
    </div>
  );
};

export default ProviderCommunity;
