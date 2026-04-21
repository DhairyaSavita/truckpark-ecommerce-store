import React, { useState, useEffect, useCallback } from 'react';
import { admin as adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  TruckIcon, MagnifyingGlassIcon, CheckCircleIcon,
  XCircleIcon, ClockIcon, ChartBarIcon,
  CurrencyRupeeIcon, FunnelIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';

const NAV_ITEMS = [
  { divider: 'Admin Panel' },
  { label: 'Dashboard', to: '/admin', icon: ChartBarIcon },
  { divider: 'Drivers' },
  { label: 'All Drivers', to: '/admin/drivers', icon: TruckIcon },
];

const STATUS_CFG = {
  pending:   { label: 'Pending',   bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  approved:  { label: 'Approved',  bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'rgba(16,185,129,0.25)' },
  rejected:  { label: 'Rejected',  bg: 'rgba(244,63,94,0.08)', color: '#F43F5E', border: 'rgba(244,63,94,0.2)' },
  suspended: { label: 'Suspended', bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: 'rgba(139,92,246,0.25)' },
};

const HIRE_STATUS = {
  pending:         { label: 'Pending',         color: '#F59E0B' },
  driver_accepted: { label: 'Driver Accepted',  color: '#3B82F6' },
  driver_rejected: { label: 'Driver Rejected',  color: '#F43F5E' },
  admin_approved:  { label: 'Admin Approved',   color: '#10B981' },
  admin_rejected:  { label: 'Admin Rejected',   color: '#EF4444' },
  in_progress:     { label: 'In Progress',      color: '#8B5CF6' },
  completed:       { label: 'Completed',        color: '#10B981' },
  cancelled:       { label: 'Cancelled',        color: '#6B7280' },
};

// ─── Reason Modal ────────────────────────────────────────────────────────────
const ReasonModal = ({ title, onConfirm, onClose, placeholder = 'Enter reason…' }) => {
  const [reason, setReason] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 18, padding: 28, maxWidth: 440, width: '92%' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>{title}</h3>
        <textarea rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 10, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { onConfirm(reason); onClose(); }} style={{ flex: 2, padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #F43F5E, #DC2626)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

// ─── Driver Table Row ─────────────────────────────────────────────────────────
const DriverRow = ({ profile, onApprove, onReject, onSuspend, delay = 0 }) => {
  const u = profile.User;
  const sc = STATUS_CFG[profile.approval_status] || STATUS_CFG.pending;
  const rating = parseFloat(profile.rating || 0);

  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)', animation: `fadeSlideUp 0.3s ease-out ${delay}ms both` }}>
      <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #F97316, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.85rem', color: '#fff', flexShrink: 0 }}>
            {u?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', margin: 0 }}>{u?.name}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.73rem', color: 'var(--text-muted)', margin: 0 }}>{u?.email}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
        {profile.vehicle_type && (
          <span style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 20, padding: '2px 8px', fontSize: '0.69rem', fontFamily: "'Inter', sans-serif", fontWeight: 600, display: 'inline-block', marginBottom: 3 }}>
            🚛 {profile.vehicle_type}
          </span>
        )}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.73rem', color: 'var(--text-muted)', margin: 0 }}>
          {(profile.license_classes || []).slice(0, 2).join(' · ') || '—'}
        </p>
      </td>
      <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: i < Math.round(rating) ? '#F59E0B' : 'var(--border-medium)', display: 'inline-block' }} />
          ))}
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.73rem', color: 'var(--text-muted)', marginLeft: 5 }}>{rating.toFixed(1)}</span>
        </div>
      </td>
      <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.86rem', color: '#F97316' }}>₹{profile.daily_rate || '—'}/day</span>
      </td>
      <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
        <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 20, padding: '3px 10px', fontSize: '0.71rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{sc.label}</span>
      </td>
      <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {profile.approval_status !== 'approved' && (
            <button onClick={() => onApprove(profile.user_id)}
              style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10B981', fontFamily: "'Outfit', sans-serif", fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
          )}
          {profile.approval_status !== 'rejected' && (
            <button onClick={() => onReject(profile.user_id)}
              style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.06)', color: '#F43F5E', fontFamily: "'Outfit', sans-serif", fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
          )}
          {profile.approval_status !== 'suspended' && (
            <button onClick={() => onSuspend(profile.user_id)}
              style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)', color: '#8B5CF6', fontFamily: "'Outfit', sans-serif", fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer' }}>Suspend</button>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Hire Request Row ─────────────────────────────────────────────────────────
const HireRequestRow = ({ hire, onApprove, onReject }) => {
  const hs = HIRE_STATUS[hire.status] || { label: hire.status, color: 'var(--text-muted)' };
  const canApprove = hire.status === 'driver_accepted';
  const canReject  = ['pending', 'driver_accepted'].includes(hire.status);

  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <td style={{ padding: '12px 16px', fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)', maxWidth: 180 }}>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hire.title}</div>
        {hire.trip_type && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{hire.trip_type.replace('_', ' ')}</div>}
      </td>
      <td style={{ padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        {hire.Requester?.name || <span style={{ color: 'var(--text-muted)' }}>—</span>}
        {hire.Requester?.store_name && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{hire.Requester.store_name}</span>}
      </td>
      <td style={{ padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        {hire.Driver?.name || <span style={{ color: 'var(--text-muted)' }}>—</span>}
        {hire.Driver?.driver_vehicle_type && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{hire.Driver.driver_vehicle_type}</span>}
      </td>
      <td style={{ padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 150 }}>
        {hire.pickup_location ? hire.pickup_location.split(',')[0] : '—'}
        {hire.dropoff_location && <span style={{ display: 'block' }}>→ {hire.dropoff_location.split(',')[0]}</span>}
      </td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{ background: `${hs.color}1a`, color: hs.color, border: `1px solid ${hs.color}35`, borderRadius: 20, padding: '3px 10px', fontSize: '0.71rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700, whiteSpace: 'nowrap' }}>{hs.label}</span>
      </td>
      <td style={{ padding: '12px 16px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#F97316', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
        ₹{Number(hire.estimated_cost || 0).toLocaleString('en-IN')}
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {canApprove && (
            <button onClick={() => onApprove(hire.id)}
              style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10B981', fontFamily: "'Outfit', sans-serif", fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>✓ Approve</button>
          )}
          {canReject && (
            <button onClick={() => onReject(hire.id)}
              style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.06)', color: '#F43F5E', fontFamily: "'Outfit', sans-serif", fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>✕ Reject</button>
          )}
          {!canApprove && !canReject && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDrivers = () => {
  const [tab, setTab] = useState('hires');
  const [drivers, setDrivers] = useState([]);
  const [hires, setHires] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingHires, setLoadingHires] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [hireFilter, setHireFilter] = useState('');
  const [modal, setModal] = useState(null);

  // Fetch hire requests + stats (always independent)
  const fetchHiresAndStats = useCallback(async () => {
    setLoadingHires(true);
    try {
      const params = {};
      if (hireFilter) params.status = hireFilter;
      const [hRes, sRes] = await Promise.all([
        adminAPI.getAllDriverHireRequests(params),
        adminAPI.getDriverStats()
      ]);
      setHires(hRes.data?.data || []);
      setStats(sRes.data || null);
    } catch (err) {
      console.error('Driver hires/stats error:', err.response?.data || err.message);
      toast.error(`Failed to load hire requests: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoadingHires(false);
    }
  }, [hireFilter]);

  // Fetch drivers (filterable)
  const fetchDrivers = useCallback(async () => {
    setLoadingDrivers(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const dRes = await adminAPI.getDrivers(params);
      setDrivers(dRes.data?.data || []);
    } catch (err) {
      console.error('Admin drivers error:', err.response?.data || err.message);
      toast.error(`Failed to load drivers: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoadingDrivers(false);
    }
  }, [search, filterStatus]);

  useEffect(() => { fetchHiresAndStats(); }, [hireFilter]);
  useEffect(() => { fetchDrivers(); }, []);

  const handleApprove = async (id) => {
    try { await adminAPI.approveDriver(id); toast.success('Driver approved!'); fetchDrivers(); fetchHiresAndStats(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };
  const handleConfirmReject = async (id, reason) => {
    try { await adminAPI.rejectDriver(id, reason); toast.success('Driver rejected'); fetchDrivers(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };
  const handleConfirmSuspend = async (id, reason) => {
    try { await adminAPI.suspendDriver(id, reason); toast.success('Driver suspended'); fetchDrivers(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };
  const handleApproveHire = async (id) => {
    try { await adminAPI.approveDriverHireRequest(id); toast.success('Hire request approved!'); fetchHiresAndStats(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };
  const handleRejectHire = async (id, reason) => {
    try { await adminAPI.rejectDriverHireRequest(id, reason); toast.success('Hire request rejected'); fetchHiresAndStats(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const needsActionCount = hires.filter(h => ['pending', 'driver_accepted'].includes(h.status)).length;

  const HIRE_FILTERS = [
    ['', 'All'],
    ['pending', 'Pending'],
    ['driver_accepted', 'Driver Accepted'],
    ['admin_approved', 'Admin Approved'],
    ['in_progress', 'In Progress'],
    ['completed', 'Completed'],
    ['cancelled', 'Cancelled'],
  ];

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Admin Panel" accentColor="var(--orange)" accentColorDim="rgba(249,115,22,0.12)" accentColorRing="rgba(249,115,22,0.2)">
      <PageHeader title="Driver Management" subtitle="Review hire requests, approve drivers, and monitor transport activity platform-wide." icon={TruckIcon} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard title="Total Drivers" value={stats?.drivers?.total ?? '—'} icon={TruckIcon} variant="amber" loading={loadingHires} />
        <StatCard title="Verified" value={stats?.drivers?.verified ?? '—'} icon={CheckCircleIcon} variant="emerald" loading={loadingHires} />
        <StatCard title="Pending" value={stats?.drivers?.pending ?? '—'} icon={ClockIcon} variant="amber" loading={loadingHires} />
        <StatCard title="Total Hires" value={stats?.hires?.total ?? '—'} icon={ChartBarIcon} variant="blue" loading={loadingHires} />
        <StatCard title="Active" value={stats?.hires?.active ?? '—'} icon={TruckIcon} variant="violet" loading={loadingHires} />
        <StatCard title="Completed" value={stats?.hires?.completed ?? '—'} icon={CheckCircleIcon} variant="emerald" loading={loadingHires} />
      </div>

      {/* Tabs */}
      <div className="tab-group" style={{ display: 'inline-flex', marginBottom: 24 }}>
        <button className={`tab-btn${tab === 'hires' ? ' active' : ''}`} onClick={() => setTab('hires')}>
          Hire Requests ({hires.length})
          {needsActionCount > 0 && (
            <span style={{ marginLeft: 6, background: '#F59E0B', color: '#000', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>{needsActionCount}</span>
          )}
        </button>
        <button className={`tab-btn${tab === 'drivers' ? ' active' : ''}`} onClick={() => setTab('drivers')}>
          All Drivers ({drivers.length})
        </button>
      </div>

      {/* ── HIRE REQUESTS TAB ── */}
      {tab === 'hires' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <FunnelIcon style={{ width: 16, height: 16, color: 'var(--text-muted)', flexShrink: 0 }} />
            {HIRE_FILTERS.map(([val, label]) => (
              <button key={val} onClick={() => setHireFilter(val)}
                style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${hireFilter === val ? 'rgba(249,115,22,0.5)' : 'var(--border-medium)'}`, background: hireFilter === val ? 'rgba(249,115,22,0.12)' : 'transparent', color: hireFilter === val ? '#F97316' : 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                {label}
              </button>
            ))}
            <button onClick={fetchHiresAndStats}
              style={{ marginLeft: 'auto', padding: '5px 14px', borderRadius: 20, border: 'none', background: 'linear-gradient(135deg, #F97316, #EF4444)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}>↻ Refresh</button>
          </div>

          {loadingHires ? (
            <div className="card-dark" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(249,115,22,0.3)', borderTopColor: '#F97316', borderRadius: '50%', margin: '0 auto 12px' }} />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.86rem', color: 'var(--text-muted)' }}>Loading hire requests…</p>
            </div>
          ) : hires.length === 0 ? (
            <div className="card-dark" style={{ padding: '52px 24px', textAlign: 'center' }}>
              <ClockIcon style={{ width: 44, height: 44, color: 'var(--text-muted)', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Hire Requests</h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                {hireFilter ? `No requests with status "${HIRE_STATUS[hireFilter]?.label || hireFilter}"` : 'No driver hire requests submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="card-dark" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'rgba(255,255,255,0.02)' }}>
                      {['Trip Title', 'Requester', 'Driver', 'Route', 'Status', 'Cost', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Outfit', sans-serif", fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hires.map(h => (
                      <HireRequestRow key={h.id} hire={h}
                        onApprove={handleApproveHire}
                        onReject={(id) => setModal({ type: 'reject-hire', id })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {hires.length} request{hires.length !== 1 ? 's' : ''} · {needsActionCount} need{needsActionCount === 1 ? 's' : ''} action
              </div>
            </div>
          )}
        </>
      )}

      {/* ── DRIVERS TAB ── */}
      {tab === 'drivers' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input placeholder="Search by name or email…" value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchDrivers()}
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 10, padding: '9px 12px 9px 36px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', boxSizing: 'border-box' }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 10, color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
            <button onClick={fetchDrivers}
              style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #F97316, #EF4444)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>Search</button>
          </div>

          {loadingDrivers ? (
            <div className="card-dark" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(249,115,22,0.3)', borderTopColor: '#F97316', borderRadius: '50%', margin: '0 auto 12px' }} />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.86rem', color: 'var(--text-muted)' }}>Loading drivers…</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="card-dark" style={{ padding: '52px 24px', textAlign: 'center' }}>
              <TruckIcon style={{ width: 44, height: 44, color: 'var(--text-muted)', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Drivers Found</h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.84rem', color: 'var(--text-muted)' }}>No registered drivers match your criteria.</p>
            </div>
          ) : (
            <div className="card-dark" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'rgba(255,255,255,0.02)' }}>
                      {['Driver', 'Vehicle / Licenses', 'Rating', 'Daily Rate', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Outfit', sans-serif", fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((p, i) => (
                      <DriverRow key={p.id} profile={p} delay={i * 35}
                        onApprove={handleApprove}
                        onReject={(id) => setModal({ type: 'reject-driver', id })}
                        onSuspend={(id) => setModal({ type: 'suspend-driver', id })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {drivers.length} driver{drivers.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {modal?.type === 'reject-driver' && (
        <ReasonModal title="Reject Driver" placeholder="Reason for rejection…"
          onConfirm={(reason) => handleConfirmReject(modal.id, reason)} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'suspend-driver' && (
        <ReasonModal title="Suspend Driver" placeholder="Reason for suspension…"
          onConfirm={(reason) => handleConfirmSuspend(modal.id, reason)} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'reject-hire' && (
        <ReasonModal title="Reject Hire Request" placeholder="Reason for rejection…"
          onConfirm={(reason) => handleRejectHire(modal.id, reason)} onClose={() => setModal(null)} />
      )}
    </DashboardLayout>
  );
};

export default AdminDrivers;
