import React, { useState, useEffect, useCallback } from 'react';
import { appointmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  CalendarDaysIcon, ClockIcon,
  CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';

const ROLE_COLORS = {
  technician:  { main: '#3B82F6', dim: 'rgba(59,130,246,0.12)' },
  driver:      { main: '#F97316', dim: 'rgba(249,115,22,0.12)' },
  refurbisher: { main: '#10B981', dim: 'rgba(16,185,129,0.12)' },
  logistics:   { main: '#8B5CF6', dim: 'rgba(139,92,246,0.12)' },
};

const STATUS_STYLES = {
  available:   { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: 'Available' },
  booked:      { bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6', label: 'Booked' },
  cancelled:   { bg: 'rgba(239,68,68,0.1)',    color: '#EF4444', label: 'Cancelled' },
  completed:   { bg: 'rgba(139,92,246,0.1)',   color: '#8B5CF6', label: 'Completed' },
  rescheduled: { bg: 'rgba(245,158,11,0.1)',   color: '#F59E0B', label: 'Rescheduled' },
};

// ─── Days in month helper ─────────────────────────────────────────────────────
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const AppointmentCalendar = () => {
  const { user } = useAuth();
  const today    = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots,    setSlots]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookNotes, setBookNotes] = useState('');
  const [slotsMap, setSlotsMap]   = useState({}); // date → count

  // Load all available slots for the current month (to show indicators)
  const loadMonthSlots = useCallback(async () => {
    try {
      const params = { provider_role: roleFilter || undefined };
      const res = await appointmentAPI.getSlots(params);
      const map = {};
      (res.data.data || []).forEach(s => {
        map[s.slot_date] = (map[s.slot_date] || 0) + 1;
      });
      setSlotsMap(map);
    } catch {}
  }, [roleFilter]);

  useEffect(() => { loadMonthSlots(); }, [loadMonthSlots]);

  // Load slots for selected date
  const loadDaySlots = useCallback(async (date) => {
    if (!date) return;
    setLoading(true);
    try {
      const params = { date, ...(roleFilter && { provider_role: roleFilter }) };
      const res = await appointmentAPI.getSlots(params);
      setSlots(res.data.data || []);
    } catch { toast.error('Failed to load slots'); }
    finally { setLoading(false); }
  }, [roleFilter]);

  useEffect(() => { if (selectedDate) loadDaySlots(selectedDate); }, [selectedDate, loadDaySlots]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const handleBook = async () => {
    if (!user) return toast.error('Please login to book');
    if (!bookingSlot) return;
    try {
      await appointmentAPI.bookSlot({ slot_id: bookingSlot.id, booking_notes: bookNotes });
      toast.success('✅ Appointment booked successfully!');
      setBookingSlot(null);
      setBookNotes('');
      loadDaySlots(selectedDate);
      loadMonthSlots();
    } catch (err) { toast.error(err.response?.data?.error || 'Booking failed'); }
  };

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 16, padding: 20 };
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 80 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.06), transparent)', borderBottom: '1px solid var(--border-subtle)', padding: '40px 32px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(59,130,246,0.35)' }}>
              <CalendarDaysIcon style={{ width: 30, height: 30, color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--text-primary)' }}>Appointment Calendar</h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: 'var(--text-muted)' }}>Book service appointments with verified providers</p>
            </div>
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 10, padding: '10px 16px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', cursor: 'pointer' }}>
            <option value="">All Providers</option>
            <option value="technician">🔧 Technicians</option>
            <option value="driver">🚛 Drivers</option>
            <option value="refurbisher">♻️ Refurbishers</option>
            <option value="logistics">📦 Logistics</option>
          </select>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Calendar */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}>
              <ChevronLeftIcon style={{ width: 20, height: 20 }} />
            </button>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}>
              <ChevronRightIcon style={{ width: 20, height: 20 }} />
            </button>
          </div>

          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Date cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(year, month, day);
              const isToday = dateStr === formatDate(today.getFullYear(), today.getMonth(), today.getDate());
              const isSelected = dateStr === selectedDate;
              const hasSlotsCount = slotsMap[dateStr] || 0;
              const isPast = new Date(dateStr) < new Date(today.toDateString());

              return (
                <button key={day} onClick={() => !isPast && setSelectedDate(dateStr)}
                  disabled={isPast}
                  style={{
                    aspectRatio: '1', borderRadius: 10, border: isSelected ? '2px solid #3B82F6' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(59,130,246,0.2)' : isToday ? 'rgba(249,115,22,0.1)' : 'transparent',
                    color: isPast ? 'var(--border-medium)' : isSelected ? '#3B82F6' : 'var(--text-primary)',
                    fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', fontWeight: isSelected || isToday ? 800 : 500,
                    cursor: isPast ? 'not-allowed' : 'pointer',
                    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                  }}>
                  {day}
                  {hasSlotsCount > 0 && !isPast && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)' }}>Slots available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)' }}>Today</span>
            </div>
          </div>
        </div>

        {/* Slot List */}
        <div>
          {!selectedDate ? (
            <div style={{ ...card, padding: 40, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDaysIcon style={{ width: 40, height: 40, color: 'var(--text-muted)', marginBottom: 12 }} />
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Select a Date</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click any date on the calendar to see available appointment slots.</p>
            </div>
          ) : loading ? (
            <div style={{ ...card }}>
              {[...Array(4)].map((_, i) => <div key={i} style={{ height: 80, background: 'var(--bg-input)', borderRadius: 10, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : (
            <div style={card}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 16 }}>
                Slots for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              {slots.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center' }}>
                  <ClockIcon style={{ width: 32, height: 32, color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>No available slots on this date.</p>
                </div>
              ) : slots.map(slot => {
                const rc = ROLE_COLORS[slot.provider_role] || ROLE_COLORS.technician;
                const st = STATUS_STYLES[slot.status] || STATUS_STYLES.available;
                return (
                  <div key={slot.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '14px 16px', marginBottom: 10, transition: 'border-color 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {slot.slot_time?.slice(0, 5)} · {slot.duration_mins}min
                          </span>
                          <span style={{ background: rc.dim, color: rc.main, borderRadius: 20, padding: '1px 8px', fontSize: '0.68rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700, textTransform: 'capitalize' }}>{slot.provider_role}</span>
                          <span style={{ background: st.bg, color: st.color, borderRadius: 20, padding: '1px 8px', fontSize: '0.68rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{st.label}</span>
                        </div>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 2 }}>
                          {slot.Provider?.name || 'Provider'} · {slot.service_type || 'General Service'}
                        </p>
                        {slot.location && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)' }}>📍 {slot.location}</p>}
                        {slot.estimated_cost && <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: rc.main, marginTop: 4 }}>₹{slot.estimated_cost}</p>}
                      </div>
                      {slot.status === 'available' && user && slot.provider_id !== user.id && (
                        <button onClick={() => setBookingSlot(slot)}
                          style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${rc.main}, ${rc.main}cc)`, color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Book
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {bookingSlot && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setBookingSlot(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 20, padding: 32, maxWidth: 440, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 6 }}>Confirm Booking</h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              {bookingSlot.slot_date} at {bookingSlot.slot_time?.slice(0,5)} · {bookingSlot.Provider?.name} · {bookingSlot.service_type}
            </p>
            <textarea rows={3} value={bookNotes} onChange={e => setBookNotes(e.target.value)} placeholder="Any special notes for the provider (optional)…"
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', boxSizing: 'border-box', resize: 'vertical', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setBookingSlot(null)} style={{ flex: 1, padding: 11, borderRadius: 10, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleBook} style={{ flex: 2, padding: 11, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, cursor: 'pointer' }}>✅ Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
