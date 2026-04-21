import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { technicianAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  WrenchScrewdriverIcon, MagnifyingGlassIcon, StarIcon,
  MapPinIcon, CurrencyRupeeIcon, ClockIcon, FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

// ─── Hire Modal ────────────────────────────────────────────────────────────────
const HireModal = ({ technician, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    service_type: technician?.specialization?.[0] || '',
    title: '',
    description: '',
    service_location: '',
    scheduled_date: '',
    scheduled_time: '',
    estimated_hours: 1,
    priority: 'normal',
    requester_notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.service_location.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await technicianAPI.sendHireRequest(technician.User.id, form);
      toast.success('Hire request sent! Technician will respond shortly.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send hire request');
    } finally {
      setSubmitting(false);
    }
  };

  const p = technician;
  const u = technician?.User;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
        borderRadius: 20, padding: 32, maxWidth: 580, width: '100%', maxHeight: '90vh',
        overflowY: 'auto', boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#fff'
          }}>{u?.name?.[0]?.toUpperCase()}</div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Hire {u?.name}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              ₹{p?.hourly_rate}/hr · {p?.specialization?.join(', ')}
            </p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
            <XMarkIcon style={{ width: 22, height: 22, color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Service Type *</label>
              <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                {(p?.specialization || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                <option value="low">Low</option><option value="normal">Normal</option>
                <option value="high">High</option><option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Job Title *</label>
            <input placeholder="e.g. Engine Overhaul Service" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Job Description *</label>
            <textarea rows={3} placeholder="Describe what work is needed..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Service Location *</label>
            <input placeholder="Full address where service is needed" value={form.service_location} onChange={e => setForm(f => ({ ...f, service_location: e.target.value }))} required
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Date</label>
              <input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Time</label>
              <input type="time" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Est. Hours</label>
              <input type="number" min={0.5} step={0.5} value={form.estimated_hours} onChange={e => setForm(f => ({ ...f, estimated_hours: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
          </div>

          {/* Cost preview */}
          {form.estimated_hours && p?.hourly_rate && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estimated Cost</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald)' }}>
                ₹{(parseFloat(form.estimated_hours) * parseFloat(p.hourly_rate)).toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-secondary)', fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Sending…' : 'Send Hire Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Technician Card ───────────────────────────────────────────────────────────
const TechnicianCard = ({ profile, onHire, delay = 0 }) => {
  const u = profile.User;
  const initials = u?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const rating = parseFloat(profile.rating || 0);

  return (
    <div className="card-dark" style={{
      padding: 24, cursor: 'pointer', transition: 'all 0.25s',
      animation: `fadeSlideUp 0.4s ease-out ${delay}ms both`,
      display: 'flex', flexDirection: 'column', gap: 16
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#fff',
          boxShadow: '0 4px 20px rgba(59,130,246,0.3)'
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>
            {u?.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 5 }, (_, i) => (
                i < Math.round(rating)
                  ? <StarSolid key={i} style={{ width: 13, height: 13, color: '#F59E0B' }} />
                  : <StarIcon key={i} style={{ width: 13, height: 13, color: 'var(--border-medium)' }} />
              ))}
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {rating.toFixed(1)} · {profile.total_jobs || 0} jobs
            </span>
          </div>
        </div>
        {profile.is_available
          ? <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700, whiteSpace: 'nowrap' }}>Available</span>
          : <span style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700, whiteSpace: 'nowrap' }}>Busy</span>
        }
      </div>

      {/* Specializations */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(profile.specialization || []).slice(0, 4).map(s => (
          <span key={s} style={{
            background: 'rgba(59,130,246,0.1)', color: 'var(--blue)',
            border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20,
            padding: '3px 10px', fontSize: '0.73rem', fontFamily: "'Inter', sans-serif", fontWeight: 500
          }}>{s}</span>
        ))}
        {(profile.specialization || []).length > 4 && (
          <span style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', borderRadius: 20, padding: '3px 10px', fontSize: '0.73rem', fontFamily: "'Inter', sans-serif" }}>
            +{profile.specialization.length - 4} more
          </span>
        )}
      </div>

      {/* Info row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CurrencyRupeeIcon style={{ width: 15, height: 15, color: 'var(--emerald)' }} />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: 'var(--emerald)' }}>
            ₹{profile.hourly_rate}/hr
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ClockIcon style={{ width: 15, height: 15, color: 'var(--text-muted)' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {profile.experience_years}y exp
          </span>
        </div>
        {(profile.address || u?.technician_address) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPinIcon style={{ width: 15, height: 15, color: 'var(--text-muted)' }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {(profile.address || u?.technician_address)?.split(',')[0]}
            </span>
          </div>
        )}
      </div>

      {profile.bio && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, borderTop: '1px solid var(--border-subtle)', paddingTop: 12, marginBottom: 0 }}>
          {profile.bio.length > 120 ? profile.bio.slice(0, 120) + '…' : profile.bio}
        </p>
      )}

      <button
        onClick={() => onHire(profile)}
        disabled={!profile.is_available}
        style={{
          width: '100%', padding: '11px', borderRadius: 10, border: 'none',
          background: profile.is_available
            ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
            : 'rgba(255,255,255,0.05)',
          color: profile.is_available ? '#fff' : 'var(--text-muted)',
          fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', fontWeight: 700,
          cursor: profile.is_available ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          marginTop: 4
        }}>
        {profile.is_available ? 'Hire This Technician' : 'Not Available'}
      </button>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TechnicianMarketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ specialization: '', min_rating: '', max_rate: '', is_available: '' });
  const [showFilters, setShowFilters] = useState(false);

  const SPECS = ['Engine Repair', 'Transmission Service', 'Brake System', 'Electrical System', 'AC Service', 'Suspension', 'Tire Service', 'General Service', 'Emergency Repair'];

  const fetchTechnicians = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (search) params.search = search;
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await technicianAPI.browseTechnicians(params);
      setTechnicians(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load technicians');
    } finally { setLoading(false); }
  }, [filters, search]);

  useEffect(() => { fetchTechnicians(); }, [fetchTechnicians]);

  const handleHire = (profile) => {
    if (!user) { toast.error('Please login to hire a technician'); navigate('/login'); return; }
    setSelectedProfile(profile);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 80 }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 50%, transparent 100%)',
        borderBottom: '1px solid var(--border-subtle)', padding: '48px 32px 40px'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(59,130,246,0.35)' }}>
              <WrenchScrewdriverIcon style={{ width: 30, height: 30, color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Technician Marketplace
              </h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Find & hire verified truck service technicians near you
              </p>
            </div>
          </div>

          {/* Search + Filter Bar */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                id="technician-search"
                placeholder="Search by name or location…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchTechnicians()}
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 12, padding: '12px 16px 12px 42px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
            <button onClick={() => setShowFilters(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, border: '1px solid var(--border-medium)', background: showFilters ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)', color: showFilters ? 'var(--blue)' : 'var(--text-secondary)', fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              <FunnelIcon style={{ width: 17, height: 17 }} />Filters
            </button>
            <button onClick={fetchTechnicians}
              style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
              Search
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div style={{ marginTop: 16, padding: 20, background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, animation: 'fadeSlideUp 0.25s ease-out' }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Specialization</label>
                <select value={filters.specialization} onChange={e => setFilters(f => ({ ...f, specialization: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                  <option value="">All</option>
                  {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Min Rating</label>
                <select value={filters.min_rating} onChange={e => setFilters(f => ({ ...f, min_rating: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                  <option value="">Any</option><option value="3">3+</option><option value="4">4+</option><option value="4.5">4.5+</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Max Rate (₹/hr)</label>
                <input type="number" placeholder="e.g. 2000" value={filters.max_rate} onChange={e => setFilters(f => ({ ...f, max_rate: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Availability</label>
                <select value={filters.is_available} onChange={e => setFilters(f => ({ ...f, is_available: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                  <option value="">All</option><option value="true">Available Now</option><option value="false">Busy</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={() => { setFilters({ specialization: '', min_rating: '', max_rate: '', is_available: '' }); setSearch(''); }}
                  style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer' }}>
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${technicians.length} technician${technicians.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="card-dark" style={{ padding: 24, height: 240 }}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-input)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 16, background: 'var(--bg-input)', borderRadius: 6, marginBottom: 8, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ height: 12, background: 'var(--bg-input)', borderRadius: 6, width: '40%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : technicians.length === 0 ? (
          <div className="card-dark" style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'float 3s ease-in-out infinite' }}>
              <WrenchScrewdriverIcon style={{ width: 38, height: 38, color: 'var(--blue)' }} />
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Technicians Found</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.86rem', color: 'var(--text-muted)' }}>Try adjusting your search filters or check back later.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {technicians.map((p, i) => <TechnicianCard key={p.id} profile={p} onHire={handleHire} delay={i * 50} />)}
          </div>
        )}
      </div>

      {selectedProfile && (
        <HireModal
          technician={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onSuccess={fetchTechnicians}
        />
      )}
    </div>
  );
};

export default TechnicianMarketplace;
