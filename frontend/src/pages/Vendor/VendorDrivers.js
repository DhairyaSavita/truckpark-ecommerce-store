import React, { useState, useEffect, useCallback } from 'react';
import { vendorDriverAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  TruckIcon, MagnifyingGlassIcon, StarIcon,
  UserGroupIcon,
  CheckCircleIcon, XMarkIcon, BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';

const NAV_ITEMS = [
  { divider: 'Vendor Hub' },
  { label: 'Find Drivers', to: '/vendor/drivers', icon: TruckIcon },
  { label: 'My Hires', to: '/vendor/drivers', icon: BriefcaseIcon },
  { label: 'Appointed', to: '/vendor/drivers', icon: UserGroupIcon },
];

const STATUS_MAP = {
  pending:         { label: 'Pending',       cls: 'badge-amber' },
  driver_accepted: { label: 'Accepted',      cls: 'badge-blue' },
  driver_rejected: { label: 'Declined',      cls: 'badge-rose' },
  admin_approved:  { label: 'Admin OK',      cls: 'badge-green' },
  admin_rejected:  { label: 'Admin Rejected', cls: 'badge-rose' },
  in_progress:     { label: 'In Progress',   cls: 'badge-violet' },
  completed:       { label: 'Completed',     cls: 'badge-green' },
  cancelled:       { label: 'Cancelled',     cls: 'badge-rose' },
};

// ─── Hire Modal ─────────────────────────────────────────────────────────────
const HireModal = ({ profile, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    driver_id: profile?.User?.id,
    trip_type: 'one_way', title: '', description: '',
    pickup_location: '', dropoff_location: '',
    trip_date: '', trip_time: '', estimated_days: 1,
    cargo_type: '', cargo_weight_tons: '', priority: 'normal', requester_notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await vendorDriverAPI.hire(form);
      toast.success('Hire request sent to driver!');
      onSuccess?.(); onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const TRIP_TYPES = ['one_way', 'round_trip', 'multi_stop', 'dedicated', 'daily'];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 20, padding: 30, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            Hire — {profile?.User?.name}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <XMarkIcon style={{ width: 20, height: 20, color: 'var(--text-muted)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 4 }}>Trip Type</label>
              <select value={form.trip_type} onChange={e => setForm(f => ({ ...f, trip_type: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.84rem' }}>
                {TRIP_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 4 }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.84rem' }}>
                <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 4 }}>Trip Title *</label>
            <input required placeholder="e.g. Delhi → Jaipur Goods Transport" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.84rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 4 }}>Description *</label>
            <textarea required rows={2} placeholder="Describe the cargo/freight details" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.84rem', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 4 }}>Pickup *</label>
              <input required placeholder="Full pickup address" value={form.pickup_location} onChange={e => setForm(f => ({ ...f, pickup_location: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.84rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 4 }}>Drop-off</label>
              <input placeholder="Destination address" value={form.dropoff_location} onChange={e => setForm(f => ({ ...f, dropoff_location: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.84rem' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 4 }}>Date</label>
              <input type="date" value={form.trip_date} onChange={e => setForm(f => ({ ...f, trip_date: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.84rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 4 }}>Time</label>
              <input type="time" value={form.trip_time} onChange={e => setForm(f => ({ ...f, trip_time: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.84rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 4 }}>Days</label>
              <input type="number" min={0.5} step={0.5} value={form.estimated_days} onChange={e => setForm(f => ({ ...f, estimated_days: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.84rem' }} />
            </div>
          </div>
          {form.estimated_days && profile?.daily_rate && (
            <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '9px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Estimated Cost</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 800, color: '#F97316' }}>
                ₹{(parseFloat(form.estimated_days) * parseFloat(profile.daily_rate)).toLocaleString('en-IN')}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
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
const DriverCard = ({ profile, onHire, onAppoint, isAppointed }) => {
  const u = profile.User;
  const rating = parseFloat(profile.rating || 0);
  return (
    <div className="card-dark" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeSlideUp 0.35s both' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #F97316, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: '#fff', flexShrink: 0 }}>
          {u?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{u?.name}</h3>
            {isAppointed && <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '1px 7px', fontSize: '0.68rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Appointed</span>}
          </div>
          <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
            {Array.from({ length: 5 }, (_, i) => i < Math.round(rating)
              ? <StarSolid key={i} style={{ width: 11, height: 11, color: '#F59E0B' }} />
              : <StarIcon key={i} style={{ width: 11, height: 11, color: 'var(--border-medium)' }} />)}
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.71rem', color: 'var(--text-muted)', marginLeft: 3 }}>{rating.toFixed(1)} · {profile.completed_trips} trips</span>
          </div>
        </div>
      </div>
      {profile.vehicle_type && (
        <span style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 20, padding: '2px 10px', fontSize: '0.71rem', fontFamily: "'Inter', sans-serif", fontWeight: 600, display: 'inline-block', width: 'fit-content' }}>
          🚛 {profile.vehicle_type}
        </span>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#F97316' }}>₹{profile.daily_rate}/day</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          {profile.home_city || u?.driver_home_city}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onHire(profile)} disabled={!profile.is_available}
          style={{ flex: 2, padding: '8px', borderRadius: 8, border: 'none', background: profile.is_available ? 'linear-gradient(135deg, #F97316, #EF4444)' : 'var(--bg-input)', color: profile.is_available ? '#fff' : 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', fontWeight: 700, cursor: profile.is_available ? 'pointer' : 'not-allowed' }}>
          {profile.is_available ? 'Hire' : 'Busy'}
        </button>
        <button onClick={() => onAppoint(profile)}
          style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${isAppointed ? 'rgba(244,63,94,0.3)' : 'var(--border-medium)'}`, background: isAppointed ? 'rgba(244,63,94,0.06)' : 'transparent', color: isAppointed ? '#F43F5E' : 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
          {isAppointed ? 'Remove' : 'Appoint'}
        </button>
      </div>
    </div>
  );
};

// ─── Hire Row ─────────────────────────────────────────────────────────────────
const HireRow = ({ hire, onApprove, onCancel }) => {
  const st = STATUS_MAP[hire.status] || STATUS_MAP.pending;
  const driver = hire.Driver;
  return (
    <div className="card-dark" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{hire.title}</h4>
          <span className={`badge ${st.cls}`}>{st.label}</span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          {driver?.name} · ₹{Number(hire.estimated_cost || 0).toLocaleString('en-IN')} est.
          {hire.pickup_location && ` · ${hire.pickup_location.split(',')[0]}`}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {hire.status === 'completed' && !hire.requester_completion_approval && (
          <button onClick={() => onApprove(hire.id)}
            style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)', color: '#10B981', fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            Approve Trip
          </button>
        )}
        {['pending', 'driver_accepted'].includes(hire.status) && (
          <button onClick={() => onCancel(hire.id)}
            style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.06)', color: '#F43F5E', fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const VendorDrivers = () => {
  const [tab, setTab] = useState('browse');
  const [drivers, setDrivers] = useState([]);
  const [hires, setHires] = useState([]);
  const [appointed, setAppointed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hireModal, setHireModal] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, hRes, aRes] = await Promise.all([
        vendorDriverAPI.getAvailable({ search }),
        vendorDriverAPI.getMyHires(),
        vendorDriverAPI.getAppointed()
      ]);
      setDrivers(dRes.data.data || []);
      setHires(hRes.data.data || []);
      setAppointed(aRes.data.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [search]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAll(); }, []);

  const handleAppoint = async (profile) => {
    const isAppointed = appointed.some(a => a.user_id === profile.user_id);
    try {
      if (isAppointed) { await vendorDriverAPI.removeAppoint(profile.User.id); toast.success('Driver unappointed'); }
      else { await vendorDriverAPI.appoint(profile.User.id); toast.success('Driver appointed!'); }
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Action failed'); }
  };

  const handleApproveTrip = async (id) => {
    try { await vendorDriverAPI.approveCompletion(id); toast.success('Trip approved! Payment released.'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleCancelHire = async (id) => {
    try { await vendorDriverAPI.cancelHire(id, 'Cancelled by vendor'); toast.success('Hire cancelled'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const activeHires = hires.filter(h => ['pending', 'driver_accepted', 'admin_approved', 'in_progress'].includes(h.status)).length;
  const completedHires = hires.filter(h => h.status === 'completed').length;

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Vendor Hub" accentColor="var(--orange)" accentColorDim="rgba(249,115,22,0.12)" accentColorRing="rgba(249,115,22,0.2)">
      <PageHeader title="Driver Management" subtitle="Browse, hire, and manage drivers for your transport and delivery operations." icon={TruckIcon} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard title="Available" value={drivers.length} icon={TruckIcon} variant="amber" loading={loading} />
        <StatCard title="Appointed" value={appointed.length} icon={UserGroupIcon} variant="violet" loading={loading} />
        <StatCard title="Active Hires" value={activeHires} icon={BriefcaseIcon} variant="blue" loading={loading} />
        <StatCard title="Completed" value={completedHires} icon={CheckCircleIcon} variant="emerald" loading={loading} />
      </div>

      <div className="tab-group" style={{ display: 'inline-flex', marginBottom: 24 }}>
        {[['browse', 'Browse Drivers'], ['hires', `My Hires (${hires.length})`], ['appointed', `Appointed (${appointed.length})`]].map(([k, l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'browse' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input placeholder="Search drivers by name or city…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchAll()}
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 10, padding: '10px 12px 10px 36px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', boxSizing: 'border-box' }} />
            </div>
            <button onClick={fetchAll}
              style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #F97316, #EF4444)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>Search</button>
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Loading…</div>
            : drivers.length === 0
              ? <div className="card-dark" style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <TruckIcon style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'var(--text-secondary)' }}>No verified drivers found</p>
                </div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
                  {drivers.map(p => <DriverCard key={p.id} profile={p} onHire={setHireModal} isAppointed={appointed.some(a => a.user_id === p.user_id)} onAppoint={handleAppoint} />)}
                </div>}
        </>
      )}

      {tab === 'hires' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {hires.length === 0
            ? <div className="card-dark" style={{ padding: '40px 24px', textAlign: 'center' }}>
                <BriefcaseIcon style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'var(--text-secondary)' }}>No driver hires yet</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>Browse drivers and send a hire request to get started.</p>
              </div>
            : hires.map(h => <HireRow key={h.id} hire={h} onApprove={handleApproveTrip} onCancel={handleCancelHire} />)}
        </div>
      )}

      {tab === 'appointed' && (
        <div>
          {appointed.length === 0
            ? <div className="card-dark" style={{ padding: '40px 24px', textAlign: 'center' }}>
                <UserGroupIcon style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'var(--text-secondary)' }}>No appointed drivers yet</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>Appoint a driver from the Browse tab.</p>
              </div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
                {appointed.map(p => <DriverCard key={p.id} profile={p} onHire={setHireModal} isAppointed onAppoint={handleAppoint} />)}
              </div>}
        </div>
      )}

      {hireModal && <HireModal profile={hireModal} onClose={() => setHireModal(null)} onSuccess={fetchAll} />}
    </DashboardLayout>
  );
};

export default VendorDrivers;
