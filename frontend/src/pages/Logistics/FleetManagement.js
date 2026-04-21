import React, { useState, useEffect, useCallback } from 'react';
import { useAuth as _useAuth } from '../../context/AuthContext';
import { fleetAPI } from '../../services/api';
import { schedulerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  TruckIcon, UserGroupIcon, BoltIcon,
  CheckCircleIcon, ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const STATUS_STYLES = {
  assigned:   { bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6',  label: 'Assigned' },
  en_route:   { bg: 'rgba(249,115,22,0.12)',  color: '#F97316',  label: 'En Route' },
  completed:  { bg: 'rgba(16,185,129,0.12)',  color: '#10B981',  label: 'Completed' },
  cancelled:  { bg: 'rgba(239,68,68,0.1)',    color: '#EF4444',  label: 'Cancelled' },
  reassigned: { bg: 'rgba(139,92,246,0.1)',   color: '#8B5CF6',  label: 'Reassigned' },
};

const PRIORITY_BADGE = {
  low:       { color: '#94A3B8', label: 'Low' },
  normal:    { color: '#3B82F6', label: 'Normal' },
  high:      { color: '#F97316', label: 'High' },
  emergency: { color: '#EF4444', label: 'Emergency 🚨' },
};

// ─── Assign Modal ─────────────────────────────────────────────────────────────
function AssignModal({ driver, onClose, onSuccess }) {
  const [form, setForm] = useState({
    route_details: { pickup: '', dropoff: '', cargo_type: '', distance_km: '' },
    eta: '',
    notes: '',
    priority: 'normal',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.route_details.pickup.trim() || !form.route_details.dropoff.trim())
      return toast.error('Pickup and dropoff are required');
    setSubmitting(true);
    try {
      await fleetAPI.assignDriver({ driver_id: driver.user_id, ...form });
      toast.success(`🚛 ${driver.User?.name} assigned successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Assignment failed');
    } finally { setSubmitting(false); }
  };

  const inp = { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 20, padding: 32, maxWidth: 520, width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Assign Route</h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>Driver: {driver.User?.name} · {driver.vehicle_type}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Pickup Location *</label>
              <input style={inp} placeholder="e.g. Mumbai Dock 4" value={form.route_details.pickup}
                onChange={e => setForm(f => ({ ...f, route_details: { ...f.route_details, pickup: e.target.value } }))} />
            </div>
            <div>
              <label style={lbl}>Drop-off Location *</label>
              <input style={inp} placeholder="e.g. Pune Warehouse" value={form.route_details.dropoff}
                onChange={e => setForm(f => ({ ...f, route_details: { ...f.route_details, dropoff: e.target.value } }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Cargo Type</label>
              <input style={inp} placeholder="e.g. Auto Parts, Steel" value={form.route_details.cargo_type}
                onChange={e => setForm(f => ({ ...f, route_details: { ...f.route_details, cargo_type: e.target.value } }))} />
            </div>
            <div>
              <label style={lbl}>Distance (km)</label>
              <input type="number" style={inp} placeholder="e.g. 180" value={form.route_details.distance_km}
                onChange={e => setForm(f => ({ ...f, route_details: { ...f.route_details, distance_km: e.target.value } }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>ETA</label>
              <input type="datetime-local" style={inp} value={form.eta} onChange={e => setForm(f => ({ ...f, eta: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Priority</label>
              <select style={inp} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="emergency">Emergency 🚨</option>
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Internal Notes</label>
            <textarea rows={2} style={{ ...inp, resize: 'vertical' }} placeholder="Any special instructions..." value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 9, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ flex: 2, padding: 10, borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #F97316, #EF4444)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Assigning…' : '🚛 Assign Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const FleetManagement = () => {
  const [tab, setTab] = useState('drivers');
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, aRes, qRes] = await Promise.all([
        fleetAPI.getDrivers(),
        fleetAPI.getAssignments(filterStatus ? { status: filterStatus } : {}),
        schedulerAPI.getQueue(),
      ]);
      setDrivers(dRes.data.data || []);
      setAssignments(aRes.data.data || []);
      setQueue(qRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load fleet data');
    } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await fleetAPI.updateAssignment(id, { status });
      toast.success(`Assignment status → ${status}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const runAutoScheduler = async () => {
    setRunning(true);
    try {
      const res = await schedulerAPI.runScheduler();
      toast.success(`🤖 Auto-scheduled ${res.data.matched} shipment${res.data.matched !== 1 ? 's' : ''}!`);
      load();
    } catch { toast.error('Scheduler failed'); }
    finally { setRunning(false); }
  };

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 16, padding: 20, transition: 'box-shadow 0.2s' };
  const tabs = ['drivers', 'assignments', 'queue'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 80 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(239,68,68,0.06), transparent)', borderBottom: '1px solid var(--border-subtle)', padding: '40px 32px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #F97316, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}>
                <TruckIcon style={{ width: 30, height: 30, color: '#fff' }} />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--text-primary)' }}>Fleet Management</h1>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: 'var(--text-muted)' }}>Assign, track, and manage your driver fleet in real-time</p>
              </div>
            </div>
            <button onClick={runAutoScheduler} disabled={running || queue.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: 'none', background: queue.length > 0 ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)' : 'rgba(255,255,255,0.06)', color: queue.length > 0 ? '#fff' : 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', cursor: queue.length > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
              <BoltIcon style={{ width: 17, height: 17 }} />
              {running ? 'Running…' : `Auto-Schedule (${queue.length} pending)`}
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginTop: 24 }}>
            {[
              { label: 'Total Drivers', value: drivers.length, color: '#F97316', icon: UserGroupIcon },
              { label: 'Available', value: drivers.filter(d => d.fleet_status === 'available').length, color: '#10B981', icon: CheckCircleIcon },
              { label: 'On Assignment', value: drivers.filter(d => d.fleet_status === 'on_assignment').length, color: '#3B82F6', icon: TruckIcon },
              { label: 'Pending Queue', value: queue.length, color: '#F59E0B', icon: ClockIcon },
            ].map(s => (
              <div key={s.label} style={{ ...card, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</p>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.6rem', fontWeight: 900, color: s.color }}>{s.value}</p>
                  </div>
                  <s.icon style={{ width: 28, height: 28, color: s.color, opacity: 0.4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '10px 20px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? '#F97316' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid #F97316' : '2px solid transparent', transition: 'all 0.2s' }}>
              {t === 'drivers' ? `🚛 Drivers (${drivers.length})` : t === 'assignments' ? `📋 Assignments (${assignments.length})` : `⏳ Queue (${queue.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ ...card, height: 160, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : tab === 'drivers' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {drivers.length === 0 ? (
              <div style={{ ...card, padding: 40, textAlign: 'center', gridColumn: '1 / -1' }}>
                <TruckIcon style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}>No verified drivers found. Hire drivers first via the Driver Marketplace.</p>
              </div>
            ) : drivers.map((d) => {
              const st = d.fleet_status;
              const stColor = st === 'available' ? '#10B981' : st === 'on_assignment' ? '#F97316' : '#94A3B8';
              return (
                <div key={d.id} style={{ ...card }}>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #F97316, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>
                      {d.User?.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{d.User?.name}</h3>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.vehicle_type} · {d.experience_years}y exp</p>
                    </div>
                    <span style={{ background: `${stColor}20`, color: stColor, border: `1px solid ${stColor}40`, borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700, whiteSpace: 'nowrap', height: 'fit-content' }}>
                      {st === 'available' ? '● Available' : st === 'on_assignment' ? '🚛 Assigned' : '● Unavailable'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#F97316' }}>₹{d.daily_rate}/day</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>⭐ {d.rating ? parseFloat(d.rating).toFixed(1) : '--'}</span>
                    {d.home_city && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {d.home_city}</span>}
                  </div>
                  <button
                    onClick={() => setSelectedDriver(d)}
                    disabled={st !== 'available'}
                    style={{ width: '100%', padding: 10, borderRadius: 10, border: 'none', background: st === 'available' ? 'linear-gradient(135deg, #F97316, #EF4444)' : 'rgba(255,255,255,0.05)', color: st === 'available' ? '#fff' : 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontWeight: 700, cursor: st === 'available' ? 'pointer' : 'not-allowed', fontSize: '0.85rem' }}>
                    {st === 'available' ? 'Assign Route' : 'Already Assigned'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : tab === 'assignments' ? (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              {['', 'assigned', 'en_route', 'completed', 'cancelled'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  style={{ padding: '7px 16px', borderRadius: 20, border: `1px solid ${filterStatus === s ? '#F97316' : 'var(--border-medium)'}`, background: filterStatus === s ? 'rgba(249,115,22,0.15)' : 'transparent', color: filterStatus === s ? '#F97316' : 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', cursor: 'pointer' }}>
                  {s || 'All'} {s && `(${assignments.filter(a => a.status === s).length})`}
                </button>
              ))}
            </div>
            {assignments.length === 0 ? (
              <div style={{ ...card, padding: 40, textAlign: 'center' }}>
                <p style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}>No assignments yet. Assign drivers from the Drivers tab.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {assignments.map(a => {
                  const st = STATUS_STYLES[a.status] || STATUS_STYLES.assigned;
                  const pr = PRIORITY_BADGE[a.priority] || PRIORITY_BADGE.normal;
                  return (
                    <div key={a.id} style={{ ...card, display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}40`, borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{st.label}</span>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: pr.color, fontWeight: 700 }}>⬆ {pr.label}</span>
                          {a.is_auto_assigned && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: '#8B5CF6', background: 'rgba(139,92,246,0.1)', borderRadius: 20, padding: '1px 8px' }}>🤖 Auto</span>}
                        </div>
                        <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                          Driver: {a.Driver?.name || '–'}
                        </p>
                        {a.route_details && (
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <span>📍 {a.route_details.pickup}</span>
                            <span style={{ margin: '0 6px' }}>→</span>
                            <span>🏁 {a.route_details.dropoff}</span>
                          </div>
                        )}
                        {a.eta && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>ETA: {new Date(a.eta).toLocaleString()}</p>}
                      </div>
                      {['assigned', 'en_route'].includes(a.status) && (
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          {a.status === 'assigned' && (
                            <button onClick={() => handleStatusUpdate(a.id, 'en_route')}
                              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'rgba(249,115,22,0.15)', color: '#F97316', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                              Start Route
                            </button>
                          )}
                          <button onClick={() => handleStatusUpdate(a.id, 'completed')}
                            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'rgba(16,185,129,0.12)', color: '#10B981', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                            Complete
                          </button>
                          <button onClick={() => handleStatusUpdate(a.id, 'cancelled')}
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
        ) : (
          /* Queue Tab */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <ExclamationTriangleIcon style={{ width: 20, height: 20, color: '#F59E0B' }} />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {queue.length} confirmed shipment{queue.length !== 1 ? 's' : ''} awaiting driver assignment.
              </p>
            </div>
            {queue.length === 0 ? (
              <div style={{ ...card, padding: 40, textAlign: 'center' }}>
                <CheckCircleIcon style={{ width: 40, height: 40, color: '#10B981', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}>All shipments are assigned! Queue is empty.</p>
              </div>
            ) : queue.map(s => (
              <div key={s.id} style={{ ...card, marginBottom: 12 }}>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>Shipment #{s.id}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      📍 {s.pickup_address} → 🏁 {s.delivery_address}
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Customer: {s.Customer?.name} · Weight: {s.weight_kg}kg · {s.shipment_type}
                    </p>
                  </div>
                  <button onClick={() => setTab('drivers')} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'rgba(249,115,22,0.15)', color: '#F97316', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Assign Driver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDriver && (
        <AssignModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} onSuccess={load} />
      )}
    </div>
  );
};

export default FleetManagement;
