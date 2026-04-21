import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { CalendarDaysIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const STATUS_STYLES = {
  available:   { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: '● Available' },
  booked:      { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: '📅 Booked' },
  completed:   { bg: 'rgba(139,92,246,0.1)',  color: '#8B5CF6', label: '✅ Completed' },
  cancelled:   { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', label: '❌ Cancelled' },
};

const ServiceBookings = () => {
  const [tab, setTab]       = useState('booker');

  const [booker, setBooker] = useState([]);
  const [provider, setProvider] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getMyAppointments();
      setBooker(res.data.data?.as_booker || []);
      setProvider(res.data.data?.as_provider || []);
    } catch { toast.error('Failed to load service bookings'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id, action) => {
    try {
      await appointmentAPI.updateBooking(id, { action });
      toast.success(`Booking ${action === 'cancel' ? 'cancelled' : 'completed'}`);
      load();
    } catch { toast.error('Action failed'); }
  };

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 16, padding: 20 };
  const slots = tab === 'booker' ? booker : provider;

  // Group by service type for seller insight
  const serviceTypes = [...new Set(booker.map(s => s.service_type || 'General'))];
  const upcoming = booker.filter(s => s.status === 'booked' && new Date(s.slot_date) >= new Date()).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 80 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(239,68,68,0.06), transparent)', borderBottom: '1px solid var(--border-subtle)', padding: '40px 32px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justify: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #F97316, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDaysIcon style={{ width: 28, height: 28, color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.3rem,3vw,1.8rem)', color: 'var(--text-primary)' }}>Service Bookings</h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>All service appointments linked to your account</p>
            </div>
          </div>
          <button onClick={load} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <ArrowPathIcon style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Summary Stats */}
        <div style={{ maxWidth: 900, margin: '16px auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Booked', value: booker.length, color: '#3B82F6' },
            { label: 'Upcoming', value: upcoming, color: '#F97316' },
            { label: 'Completed', value: booker.filter(s => s.status === 'completed').length, color: '#10B981' },
            { label: 'Service Types', value: serviceTypes.length, color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding: '12px 15px' }}>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '1.5rem', color: s.color }}>{s.value}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 32px' }}>
        {/* Timeline: upcoming bookings */}
        {upcoming > 0 && (
          <div style={{ ...card, marginBottom: 24, borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.04)' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.9rem', color: '#F97316', marginBottom: 12 }}>📅 Upcoming Service Appointments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {booker.filter(s => s.status === 'booked' && new Date(s.slot_date) >= new Date()).sort((a, b) => new Date(a.slot_date) - new Date(b.slot_date)).slice(0, 5).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 40, textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{new Date(s.slot_date + 'T00:00:00').getDate()}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(s.slot_date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{s.service_type || 'General Service'}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.Provider?.name} · {s.slot_time?.slice(0, 5)}</p>
                  </div>
                  {s.estimated_cost && <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#F97316' }}>₹{s.estimated_cost}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
          {[
            { key: 'booker', label: `📅 Booked Services (${booker.length})` },
            { key: 'provider', label: `🗓 My Slots (${provider.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '10px 18px', border: 'none', background: 'transparent', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', color: tab === t.key ? '#F97316' : 'var(--text-muted)', borderBottom: `2px solid ${tab === t.key ? '#F97316' : 'transparent'}`, transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ ...card, height: 80, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : slots.length === 0 ? (
          <div style={{ ...card, padding: 48, textAlign: 'center' }}>
            <CalendarDaysIcon style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>No service bookings yet</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6 }}>Book technician, refurbisher or logistics appointments from the marketplace.</p>
          </div>
        ) : slots.map(s => {
          const st = STATUS_STYLES[s.status] || STATUS_STYLES.booked;
          const other = tab === 'booker' ? s.Provider : s.Booker;
          return (
            <div key={s.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(249,115,22,0.08)', borderRadius: 12, padding: '10px 14px', minWidth: 64, textAlign: 'center', border: '1px solid rgba(249,115,22,0.2)' }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 900, color: '#F97316', lineHeight: 1 }}>{new Date(s.slot_date + 'T00:00:00').getDate()}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(s.slot_date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</div>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ background: st.bg, color: st.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{st.label}</span>
                  {s.estimated_cost && <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.8rem', color: '#F97316' }}>₹{s.estimated_cost}</span>}
                </div>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{s.service_type || 'General Service'} · {s.slot_time?.slice(0,5)} · {s.duration_mins}min</p>
                {other && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tab === 'booker' ? 'Provider' : 'Client'}: {other.name} {other.phone && `· ${other.phone}`}</p>}
                {s.booking_notes && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>📝 {s.booking_notes}</p>}
              </div>
              {s.status === 'booked' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {tab === 'provider' && (
                    <button onClick={() => handleAction(s.id, 'complete')}
                      style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: 'rgba(16,185,129,0.12)', color: '#10B981', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                      ✅ Complete
                    </button>
                  )}
                  <button onClick={() => { if (window.confirm('Cancel this booking?')) handleAction(s.id, 'cancel'); }}
                    style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceBookings;
