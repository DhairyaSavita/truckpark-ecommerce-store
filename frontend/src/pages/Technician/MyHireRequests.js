import React, { useState, useEffect } from 'react';
import { technicianAPI } from '../../services/api';
import { useAuth as _useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  WrenchScrewdriverIcon, CheckCircleIcon, XCircleIcon,
  ClockIcon, CurrencyRupeeIcon, MapPinIcon, ChartBarIcon,
  PlayIcon, 
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';

const NAV_ITEMS = [
  { divider: 'Technician Hub' },
  { label: 'Dashboard', to: '/technician/dashboard', icon: ChartBarIcon },
  { label: 'Service Requests', to: '/technician/dashboard', icon: WrenchScrewdriverIcon },
  { divider: 'Hire Requests' },
  { label: 'My Hire Requests', to: '/technician/hire-requests', icon: CheckCircleIcon },
];

const STATUS_MAP = {
  pending:             { label: 'Pending',          cls: 'badge-amber',  color: '#F59E0B' },
  technician_accepted: { label: 'Accepted',          cls: 'badge-blue',   color: '#3B82F6' },
  technician_rejected: { label: 'Declined',          cls: 'badge-rose',   color: '#F43F5E' },
  admin_approved:      { label: 'Admin Approved',    cls: 'badge-green',  color: '#10B981' },
  admin_rejected:      { label: 'Admin Rejected',    cls: 'badge-rose',   color: '#F43F5E' },
  in_progress:         { label: 'In Progress',       cls: 'badge-violet', color: '#8B5CF6' },
  completed:           { label: 'Completed',         cls: 'badge-green',  color: '#10B981' },
  cancelled:           { label: 'Cancelled',         cls: 'badge-rose',   color: '#F43F5E' },
};

const PRIORITY_MAP = {
  low:       { label: 'Low',       color: 'var(--text-muted)' },
  normal:    { label: 'Normal',    color: 'var(--blue)' },
  high:      { label: 'High',      color: '#F59E0B' },
  emergency: { label: 'Emergency', color: '#F43F5E' },
};

// ─── Hire Request Card ─────────────────────────────────────────────────────────
const HireCard = ({ hire, onRespond, onStart, onComplete }) => {
  const st = STATUS_MAP[hire.status] || STATUS_MAP.pending;
  const pri = PRIORITY_MAP[hire.priority] || PRIORITY_MAP.normal;
  const requester = hire.Requester;

  return (
    <div className="card-dark" style={{ padding: 22, animation: 'fadeSlideUp 0.35s ease-out both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.97rem', color: 'var(--text-primary)' }}>
              {hire.title}
            </h3>
            <span className={`badge ${st.cls}`}>{st.label}</span>
            <span style={{ fontSize: '0.72rem', fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: pri.color, background: `${pri.color}18`, borderRadius: 20, padding: '2px 8px', border: `1px solid ${pri.color}30` }}>
              {pri.label} Priority
            </span>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 12 }}>
            {hire.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {requester && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.72rem', color: '#8B5CF6' }}>
                    {requester.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{requester.name}</p>
                  {requester.store_name && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.74rem', color: 'var(--text-muted)' }}>{requester.store_name}</p>}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPinIcon style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>{hire.service_location}</span>
            </div>
            {hire.agreed_hourly_rate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <CurrencyRupeeIcon style={{ width: 14, height: 14, color: 'var(--emerald)' }} />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'var(--emerald)' }}>
                  ₹{hire.estimated_cost ? Number(hire.estimated_cost).toLocaleString('en-IN') : `${hire.agreed_hourly_rate}/hr`}
                </span>
              </div>
            )}
            {hire.scheduled_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ClockIcon style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(hire.scheduled_date).toLocaleDateString('en-IN')} {hire.scheduled_time}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          {hire.status === 'pending' && (
            <>
              <button onClick={() => onRespond(hire.id, 'accept')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                <CheckCircleIcon style={{ width: 15, height: 15 }} /> Accept
              </button>
              <button onClick={() => onRespond(hire.id, 'reject')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.08)', color: '#F43F5E', fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                <XCircleIcon style={{ width: 15, height: 15 }} /> Decline
              </button>
            </>
          )}
          {['technician_accepted', 'admin_approved'].includes(hire.status) && (
            <button onClick={() => onStart(hire.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
              <PlayIcon style={{ width: 14, height: 14 }} /> Start Work
            </button>
          )}
          {hire.status === 'in_progress' && (
            <button onClick={() => onComplete(hire.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
              <CheckCircleIcon style={{ width: 14, height: 14 }} /> Complete
            </button>
          )}
          {hire.status === 'completed' && hire.payment_status === 'paid' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CurrencyRupeeIcon style={{ width: 14, height: 14, color: '#10B981' }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}>Paid</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const MyHireRequests = () => {
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const TABS = [
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'History' },
  ];

  const fetchHires = async () => {
    setLoading(true);
    try {
      const res = await technicianAPI.getMyHireRequests();
      setHires(res.data.data || []);
    } catch { toast.error('Failed to load hire requests'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchHires(); }, []);

  const handleRespond = async (id, action) => {
    try {
      await technicianAPI.respondToHire(id, action);
      toast.success(action === 'accept' ? 'Hire request accepted!' : 'Hire request declined');
      fetchHires();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to respond'); }
  };

  const handleStart = async (id) => {
    try { await technicianAPI.startHireWork(id); toast.success('Work started!'); fetchHires(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to start work'); }
  };

  const handleComplete = async (id) => {
    try { await technicianAPI.completeHireWork(id, {}); toast.success('Work marked as completed!'); fetchHires(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to complete'); }
  };

  const filtered = hires.filter(h => {
    if (activeTab === 'pending') return ['pending'].includes(h.status);
    if (activeTab === 'active') return ['technician_accepted', 'admin_approved', 'in_progress'].includes(h.status);
    if (activeTab === 'completed') return ['completed', 'cancelled', 'technician_rejected', 'admin_rejected'].includes(h.status);
    return true;
  });

  const pendingCount = hires.filter(h => h.status === 'pending').length;
  const activeCount = hires.filter(h => ['technician_accepted', 'admin_approved', 'in_progress'].includes(h.status)).length;
  const totalEarned = hires.filter(h => h.status === 'completed' && h.payment_status === 'paid').reduce((s, h) => s + parseFloat(h.final_cost || h.estimated_cost || 0), 0);

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Technician Hub" accentColor="var(--blue)" accentColorDim="rgba(59,130,246,0.12)" accentColorRing="rgba(59,130,246,0.2)">
      <PageHeader title="Hire Requests" subtitle="Manage incoming hire and appointment requests from vendors & customers." icon={WrenchScrewdriverIcon} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard title="Pending Requests" value={pendingCount} icon={ClockIcon} variant="amber" loading={loading} />
        <StatCard title="Active Jobs" value={activeCount} icon={PlayIcon} variant="violet" loading={loading} />
        <StatCard title="Total Earned" value={totalEarned} prefix="₹" icon={CurrencyRupeeIcon} variant="emerald" loading={loading} />
        <StatCard title="Total Requests" value={hires.length} icon={ChartBarIcon} variant="blue" loading={loading} />
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <div className="tab-group" style={{ display: 'inline-flex' }}>
          {TABS.map(t => (
            <button key={t.key} className={`tab-btn${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
              {t.key === 'pending' && pendingCount > 0 && (
                <span style={{ marginLeft: 6, background: '#F59E0B', color: '#000', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3].map(i => <div key={i} className="card-dark" style={{ padding: 22, height: 120, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-dark" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <WrenchScrewdriverIcon style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            No {TABS.find(t => t.key === activeTab)?.label} Requests
          </h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {activeTab === 'pending' ? 'No new hire requests yet. Stay online to receive them.' : 'Nothing here yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(hire => (
            <HireCard key={hire.id} hire={hire} onRespond={handleRespond} onStart={handleStart} onComplete={handleComplete} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyHireRequests;
