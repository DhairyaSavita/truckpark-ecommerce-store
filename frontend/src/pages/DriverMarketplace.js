import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  TruckIcon, MagnifyingGlassIcon, StarIcon,
  MapPinIcon, CurrencyRupeeIcon, ClockIcon, FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const VEHICLE_TYPES = ['Mini Truck', 'Light Truck', 'Medium Truck', 'Heavy Truck', 'Tanker', 'Flatbed', 'Refrigerated', 'Container', 'Tipper'];
const TRIP_TYPES = ['one_way', 'round_trip', 'multi_stop', 'dedicated', 'daily'];

// ─── Hire Modal ─────────────────────────────────────────────────────────────
const HireModal = ({ driver, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    trip_type: 'one_way',
    title: '',
    description: '',
    pickup_location: '',
    dropoff_location: '',
    trip_date: '',
    trip_time: '',
    estimated_days: 1,
    estimated_distance_km: '',
    cargo_type: '',
    cargo_weight_tons: '',
    vehicle_type_required: driver?.vehicle_type || '',
    priority: 'normal',
    requester_notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const p = driver;
  const u = driver?.User;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.pickup_location.trim()) {
      toast.error('Please fill all required fields'); return;
    }
    setSubmitting(true);
    try {
      await driverAPI.sendHireRequest(u.id, form);
      toast.success('Hire request sent! Driver will respond shortly.');
      onSuccess?.(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send hire request');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 20, padding: 32, maxWidth: 580, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #F97316, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {u?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Hire {u?.name}</h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{p?.daily_rate}/day · {p?.vehicle_type}</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
            <XMarkIcon style={{ width: 22, height: 22, color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Trip Type *</label>
              <select value={form.trip_type} onChange={e => setForm(f => ({ ...f, trip_type: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                {TRIP_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Trip Title *</label>
            <input required placeholder="e.g. Goods Transport Mumbai → Pune" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Description *</label>
            <textarea required rows={2} placeholder="Describe the nature of goods, special instructions…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Pickup Location *</label>
              <input required placeholder="Full pickup address" value={form.pickup_location} onChange={e => setForm(f => ({ ...f, pickup_location: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Drop-off Location</label>
              <input placeholder="Full drop-off address" value={form.dropoff_location} onChange={e => setForm(f => ({ ...f, dropoff_location: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Date</label>
              <input type="date" value={form.trip_date} onChange={e => setForm(f => ({ ...f, trip_date: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Time</label>
              <input type="time" value={form.trip_time} onChange={e => setForm(f => ({ ...f, trip_time: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Est. Days</label>
              <input type="number" min={0.5} step={0.5} value={form.estimated_days} onChange={e => setForm(f => ({ ...f, estimated_days: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Cargo Type</label>
              <input placeholder="e.g. Auto Parts, Machinery" value={form.cargo_type} onChange={e => setForm(f => ({ ...f, cargo_type: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Cargo Weight (tons)</label>
              <input type="number" min={0} step={0.1} placeholder="e.g. 5.5" value={form.cargo_weight_tons} onChange={e => setForm(f => ({ ...f, cargo_weight_tons: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
          </div>
          {form.estimated_days && p?.daily_rate && (
            <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Estimated Cost</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 800, color: '#F97316' }}>
                ₹{(parseFloat(form.estimated_days) * parseFloat(p.daily_rate)).toLocaleString('en-IN')}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting}
              style={{ flex: 2, padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #F97316, #EF4444)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Sending…' : 'Send Hire Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Driver Card ─────────────────────────────────────────────────────────────
const DriverCard = ({ profile, onHire, delay = 0 }) => {
  const u = profile.User;
  const initials = u?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const rating = parseFloat(profile.rating || 0);

  return (
    <div className="card-dark" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, animation: `fadeSlideUp 0.4s ease-out ${delay}ms both` }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #F97316, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 4px 18px rgba(249,115,22,0.3)' }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.97rem', color: 'var(--text-primary)', marginBottom: 2 }}>{u?.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {Array.from({ length: 5 }, (_, i) => i < Math.round(rating)
              ? <StarSolid key={i} style={{ width: 12, height: 12, color: '#F59E0B' }} />
              : <StarIcon key={i} style={{ width: 12, height: 12, color: 'var(--border-medium)' }} />)}
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.76rem', color: 'var(--text-muted)' }}>{rating.toFixed(1)} · {profile.completed_trips || 0} trips</span>
          </div>
        </div>
        {profile.is_available
          ? <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '2px 9px', fontSize: '0.7rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700, whiteSpace: 'nowrap' }}>Available</span>
          : <span style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '2px 9px', fontSize: '0.7rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700, whiteSpace: 'nowrap' }}>Busy</span>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {profile.vehicle_type && (
          <span style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
            🚛 {profile.vehicle_type}
          </span>
        )}
        {(profile.license_classes || []).slice(0, 3).map(lc => (
          <span key={lc} style={{ background: 'rgba(59,130,246,0.08)', color: 'var(--blue)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '3px 8px', fontSize: '0.7rem', fontFamily: "'Inter', sans-serif" }}>{lc}</span>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <CurrencyRupeeIcon style={{ width: 14, height: 14, color: '#F97316' }} />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#F97316' }}>₹{profile.daily_rate}/day</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <ClockIcon style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.79rem', color: 'var(--text-muted)' }}>{profile.experience_years}y exp</span>
        </div>
        {(profile.home_city || u?.driver_home_city) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <MapPinIcon style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.79rem', color: 'var(--text-muted)' }}>
              {profile.home_city || u?.driver_home_city}
            </span>
          </div>
        )}
      </div>

      {profile.bio && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55, borderTop: '1px solid var(--border-subtle)', paddingTop: 12, marginBottom: 0 }}>
          {profile.bio.length > 110 ? profile.bio.slice(0, 110) + '…' : profile.bio}
        </p>
      )}

      <button onClick={() => onHire(profile)} disabled={!profile.is_available}
        style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: profile.is_available ? 'linear-gradient(135deg, #F97316, #EF4444)' : 'rgba(255,255,255,0.05)', color: profile.is_available ? '#fff' : 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 700, cursor: profile.is_available ? 'pointer' : 'not-allowed', transition: 'all 0.2s', marginTop: 4 }}>
        {profile.is_available ? 'Hire This Driver' : 'Not Available'}
      </button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DriverMarketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ vehicle_type: '', min_rating: '', max_daily_rate: '', is_available: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (search) params.search = search;
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await driverAPI.browseDrivers(params);
      setDrivers(res.data.data || []);
    } catch { toast.error('Failed to load drivers'); }
    finally { setLoading(false); }
  }, [filters, search]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const handleHire = (profile) => {
    if (!user) { toast.error('Please login to hire a driver'); navigate('/login'); return; }
    setSelectedDriver(profile);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 80 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(239,68,68,0.06) 50%, transparent 100%)', borderBottom: '1px solid var(--border-subtle)', padding: '48px 32px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #F97316, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}>
              <TruckIcon style={{ width: 30, height: 30, color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>Driver Marketplace</h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>Find & hire verified truck drivers for transport and delivery services</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input placeholder="Search by name or city…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchDrivers()}
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 12, padding: '12px 16px 12px 42px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <button onClick={() => setShowFilters(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, border: '1px solid var(--border-medium)', background: showFilters ? 'rgba(249,115,22,0.15)' : 'var(--bg-card)', color: showFilters ? '#F97316' : 'var(--text-secondary)', fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              <FunnelIcon style={{ width: 17, height: 17 }} />Filters
            </button>
            <button onClick={fetchDrivers}
              style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #F97316, #EF4444)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>Search</button>
          </div>

          {showFilters && (
            <div style={{ marginTop: 16, padding: 20, background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, animation: 'fadeSlideUp 0.25s ease-out' }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Vehicle Type</label>
                <select value={filters.vehicle_type} onChange={e => setFilters(f => ({ ...f, vehicle_type: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                  <option value="">All</option>
                  {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
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
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Max Daily Rate (₹)</label>
                <input type="number" placeholder="e.g. 5000" value={filters.max_daily_rate} onChange={e => setFilters(f => ({ ...f, max_daily_rate: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Availability</label>
                <select value={filters.is_available} onChange={e => setFilters(f => ({ ...f, is_available: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                  <option value="">All</option><option value="true">Available Now</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={() => { setFilters({ vehicle_type: '', min_rating: '', max_daily_rate: '', is_available: '' }); setSearch(''); }}
                  style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer' }}>Reset</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          {loading ? 'Loading…' : `${drivers.length} driver${drivers.length !== 1 ? 's' : ''} found`}
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="card-dark" style={{ padding: 22, height: 220, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : drivers.length === 0 ? (
          <div className="card-dark" style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 70, height: 70, borderRadius: 22, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'float 3s ease-in-out infinite' }}>
              <TruckIcon style={{ width: 36, height: 36, color: '#F97316' }} />
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Drivers Found</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.86rem', color: 'var(--text-muted)' }}>Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {drivers.map((d, i) => <DriverCard key={d.id} profile={d} onHire={handleHire} delay={i * 50} />)}
          </div>
        )}
      </div>

      {selectedDriver && <HireModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} onSuccess={fetchDrivers} />}
    </div>
  );
};

export default DriverMarketplace;
