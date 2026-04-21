import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const STATUS_STYLES = {
  available:   { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: '● Available' },
  booked:      { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: '📅 Booked' },
  completed:   { bg: 'rgba(139,92,246,0.1)',  color: '#8B5CF6', label: '✅ Completed' },
  cancelled:   { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', label: '❌ Cancelled' },
  rescheduled: { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', label: '🔄 Rescheduled' },
};

const MyAppointments = () => {
  const { user } = useAuth();
  const [tab, setTab]               = useState('booker');
  const [providerSlots, setProvider]= useState([]);
  const [bookerSlots, setBooker]    = useState([]);
  const [loading, setLoading]       = useState(true);
  const [addMode, setAddMode]       = useState(false);
  const [newSlots, setNewSlots]     = useState([{ slot_date: '', slot_time: '09:00', duration_mins: 60, service_type: '', location: '', booking_type: 'onsite', estimated_cost: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getMyAppointments();
      setProvider(res.data.data?.as_provider || []);
      setBooker(res.data.data?.as_booker || []);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id, action, reason = '') => {
    try {
      await appointmentAPI.updateBooking(id, { action, cancel_reason: reason });
      toast.success(`Appointment ${action === 'cancel' ? 'cancelled' : 'completed'}`);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Action failed'); }
  };

  const handleAddSlots = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const filtered = newSlots.filter(s => s.slot_date && s.slot_time);
      if (!filtered.length) return toast.error('Please fill at least one slot');
      await appointmentAPI.createSlots(filtered.map(s => ({ ...s, estimated_cost: s.estimated_cost ? parseFloat(s.estimated_cost) : undefined })));
      toast.success(`✅ ${filtered.length} slot${filtered.length > 1 ? 's' : ''} created!`);
      setAddMode(false);
      setNewSlots([{ slot_date: '', slot_time: '09:00', duration_mins: 60, service_type: '', location: '', booking_type: 'onsite', estimated_cost: '' }]);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create slots'); }
    finally { setSubmitting(false); }
  };

  const card  = { background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 16, padding: 20 };
  const inp   = { background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem' };
  const slots = tab === 'provider' ? providerSlots : bookerSlots;

  const providerEligible = user && (user.role === 'admin' || user.role === 'seller' ||
    ['driver','technician','refurbisher','logistics'].some(r => user[`is_${r}`] || user[`${r}_verified`] || user[`is_${r}_verified`]));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 80 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.06), transparent)', borderBottom: '1px solid var(--border-subtle)', padding: '40px 32px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDaysIcon style={{ width: 28, height: 28, color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.3rem,3vw,1.8rem)', color: 'var(--text-primary)' }}>My Appointments</h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage your bookings and availability slots</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/appointments" style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-secondary)', fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
              📅 Browse Calendar
            </Link>
            {providerEligible && (
              <button onClick={() => setAddMode(v => !v)}
                style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                {addMode ? '✕ Close' : '+ Add Slots'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 32px' }}>
        {/* Add Slots Form */}
        {addMode && providerEligible && (
          <div style={{ ...card, marginBottom: 24, borderColor: 'rgba(59,130,246,0.3)' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 16 }}>Create Availability Slots</h3>
            <form onSubmit={handleAddSlots}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {newSlots.map((slot, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                    <input type="date" style={inp} value={slot.slot_date} onChange={e => setNewSlots(s => s.map((sl,i) => i === idx ? {...sl, slot_date: e.target.value} : sl))} required />
                    <input type="time" style={inp} value={slot.slot_time} onChange={e => setNewSlots(s => s.map((sl,i) => i === idx ? {...sl, slot_time: e.target.value} : sl))} />
                    <input type="number" style={inp} placeholder="Duration (min)" value={slot.duration_mins} onChange={e => setNewSlots(s => s.map((sl,i) => i === idx ? {...sl, duration_mins: parseInt(e.target.value)} : sl))} />
                    <input style={inp} placeholder="Service type" value={slot.service_type} onChange={e => setNewSlots(s => s.map((sl,i) => i === idx ? {...sl, service_type: e.target.value} : sl))} />
                    <input style={inp} placeholder="Location" value={slot.location} onChange={e => setNewSlots(s => s.map((sl,i) => i === idx ? {...sl, location: e.target.value} : sl))} />
                    <input type="number" style={inp} placeholder="Price (₹)" value={slot.estimated_cost} onChange={e => setNewSlots(s => s.map((sl,i) => i === idx ? {...sl, estimated_cost: e.target.value} : sl))} />
                    {newSlots.length > 1 && <button type="button" onClick={() => setNewSlots(s => s.filter((_,i) => i !== idx))} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, color: '#EF4444', cursor: 'pointer', fontSize: '0.8rem' }}>✕ Remove</button>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button type="button" onClick={() => setNewSlots(s => [...s, { slot_date: '', slot_time: '09:00', duration_mins: 60, service_type: '', location: '', booking_type: 'onsite', estimated_cost: '' }])}
                  style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', cursor: 'pointer' }}>+ Add Row</button>
                <button type="submit" disabled={submitting}
                  style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving…' : 'Save Slots'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Booked by Me', value: bookerSlots.filter(s => s.status === 'booked').length, color: '#3B82F6' },
            { label: 'Upcoming', value: bookerSlots.filter(s => s.status === 'booked' && new Date(s.slot_date) >= new Date()).length, color: '#10B981' },
            { label: 'My Slots', value: providerSlots.length, color: '#F97316' },
            { label: 'Completed', value: [...bookerSlots, ...providerSlots].filter(s => s.status === 'completed').length, color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding: '14px 16px' }}>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '1.5rem', color: s.color }}>{s.value}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
          {[
            { key: 'booker', label: `📅 My Bookings (${bookerSlots.length})` },
            { key: 'provider', label: `🗓 My Slots (${providerSlots.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '10px 18px', border: 'none', background: 'transparent', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', color: tab === t.key ? '#3B82F6' : 'var(--text-muted)', borderBottom: `2px solid ${tab === t.key ? '#3B82F6' : 'transparent'}`, transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ ...card, height: 90, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : slots.length === 0 ? (
          <div style={{ ...card, padding: 48, textAlign: 'center' }}>
            <CalendarDaysIcon style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              {tab === 'booker' ? 'No bookings yet' : 'No slots created yet'}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {tab === 'booker' ? <><Link to="/appointments" style={{ color: '#3B82F6' }}>Browse the calendar</Link> to book your first appointment.</> : 'Click "+ Add Slots" above to create your availability.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {slots.map(s => {
              const st = STATUS_STYLES[s.status] || STATUS_STYLES.available;
              const other = tab === 'booker' ? s.Provider : s.Booker;
              return (
                <div key={s.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 16px', minWidth: 70, border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(s.slot_date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{new Date(s.slot_date + 'T00:00:00').getDate()}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.slot_time?.slice(0,5)}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ background: st.bg, color: st.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{st.label}</span>
                    </div>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 2 }}>{s.service_type || 'General Service'} · {s.duration_mins}min</p>
                    {other && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tab === 'booker' ? 'Provider' : 'Client'}: {other.name} {other.phone ? `· ${other.phone}` : ''}</p>}
                    {s.location && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>📍 {s.location}</p>}
                    {s.booking_notes && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>📝 {s.booking_notes}</p>}
                  </div>
                  {s.estimated_cost && <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.9rem', color: '#F97316' }}>₹{s.estimated_cost}</span>}
                  {['booked'].includes(s.status) && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {tab === 'provider' && (
                        <button onClick={() => handleAction(s.id, 'complete')}
                          style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'rgba(16,185,129,0.12)', color: '#10B981', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                          ✅ Done
                        </button>
                      )}
                      <button onClick={() => { if (window.confirm('Cancel this appointment?')) handleAction(s.id, 'cancel', 'User cancelled'); }}
                        style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
