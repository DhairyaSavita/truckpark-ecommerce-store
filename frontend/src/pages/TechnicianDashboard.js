import React, { useState, useEffect } from 'react';
import { technicianAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  WrenchScrewdriverIcon, CurrencyRupeeIcon, ClockIcon,
  MapPinIcon, CheckCircleIcon, ChartBarIcon,
  SignalIcon, SignalSlashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';

const NAV_ITEMS = [
  { divider: 'Technician Hub' },
  { label: 'Dashboard',     to: '/technician/dashboard', icon: ChartBarIcon },
  { divider: 'Service Requests' },
  { label: 'Nearby Requests', to: '/technician/dashboard', icon: WrenchScrewdriverIcon },
  { label: 'My Requests',     to: '/technician/dashboard', icon: CheckCircleIcon },
];

const STATUS_CFG = {
  pending:     { label: 'Pending',     cls: 'badge-amber' },
  accepted:    { label: 'Accepted',    cls: 'badge-blue' },
  in_progress: { label: 'In Progress', cls: 'badge-violet' },
  completed:   { label: 'Completed',   cls: 'badge-green' },
  cancelled:   { label: 'Cancelled',   cls: 'badge-rose' },
};

const RequestCard = ({ request, onAccept, onUpdateStatus, delay = 0 }) => {
  const sc = STATUS_CFG[request.status] || STATUS_CFG.pending;
  return (
    <div className="card-dark" style={{ padding: 20, animation: `fadeSlideUp 0.4s ease-out ${delay}ms both` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {request.title}
            </h3>
            {request.status && <span className={`badge ${sc.cls}`}>{sc.label}</span>}
          </div>
          {request.description && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
              {request.description}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
            {request.service_address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPinIcon style={{ width: 12, height: 12, color: 'var(--blue)' }} />
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {request.service_address}
                </span>
              </div>
            )}
            {request.estimated_cost && (
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: 'var(--emerald)' }}>
                ₹{request.estimated_cost}
              </span>
            )}
            {request.Customer?.name && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                👤 {request.Customer.name}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          {onAccept && (
            <button className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={() => onAccept(request.id)}>
              Accept
            </button>
          )}
          {request.status === 'accepted' && onUpdateStatus && (
            <button className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem', background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' }} onClick={() => onUpdateStatus(request.id, 'in_progress')}>
              Start Service
            </button>
          )}
          {request.status === 'in_progress' && onUpdateStatus && (
            <button className="btn-success" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={() => onUpdateStatus(request.id, 'completed')}>
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [earnings, setEarnings] = useState({ total_earnings: 0, pending_earnings: 0, completed_jobs: 0 });
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('nearby');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [nbRes, myRes, earnRes] = await Promise.all([
        technicianAPI.getNearbyRequests(), technicianAPI.getMyRequests(), technicianAPI.getEarnings(),
      ]);
      setNearbyRequests(nbRes.data);
      setMyRequests(myRes.data);
      setEarnings(earnRes.data);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const acceptRequest = async (id) => {
    try { await technicianAPI.acceptRequest(id); toast.success('Service request accepted!'); fetchData(); }
    catch { toast.error('Failed to accept request'); }
  };

  const updateRequestStatus = async (id, status) => {
    try { await technicianAPI.updateRequestStatus(id, status); toast.success(`Request ${status}`); fetchData(); }
    catch { toast.error('Failed to update status'); }
  };

  const toggleAvailability = async () => {
    try {
      await technicianAPI.updateAvailability(!isAvailable);
      setIsAvailable(!isAvailable);
      toast.success(isAvailable ? 'You are now offline' : 'You are now online');
    } catch { toast.error('Failed to update availability'); }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Technician Hub" accentColor="var(--blue)" accentColorDim="rgba(59,130,246,0.12)" accentColorRing="rgba(59,130,246,0.2)">
      <PageHeader
        title="Technician Dashboard"
        subtitle="Manage service requests, track your jobs, and monitor your earnings."
        icon={WrenchScrewdriverIcon}
        actions={
          <button
            onClick={toggleAvailability}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
              borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 600,
              background: isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
              color: isAvailable ? 'var(--emerald)' : 'var(--text-muted)',
              border: `1px solid ${isAvailable ? 'rgba(16,185,129,0.3)' : 'var(--border-medium)'}`,
              transition: 'all var(--transition)',
            }}
          >
            {isAvailable ? <SignalIcon style={{ width: 16, height: 16 }} /> : <SignalSlashIcon style={{ width: 16, height: 16 }} />}
            {isAvailable ? 'Online' : 'Offline'}
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard title="Total Earnings" value={earnings.total_earnings} prefix="₹" icon={CurrencyRupeeIcon} variant="emerald" loading={loading} delay={0} />
        <StatCard title="Completed Jobs" value={earnings.completed_jobs} icon={CheckCircleIcon} variant="blue" loading={loading} delay={80} />
        <StatCard title="Pending Earnings" value={earnings.pending_earnings} prefix="₹" icon={ClockIcon} variant="amber" loading={loading} delay={160} />
      </div>

      {/* Availability bar */}
      <div style={{
        marginBottom: 24, padding: '14px 20px',
        background: isAvailable ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isAvailable ? 'rgba(16,185,129,0.2)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: isAvailable ? 'var(--emerald)' : 'var(--text-muted)',
          boxShadow: isAvailable ? '0 0 8px rgba(16,185,129,0.6)' : 'none',
          animation: isAvailable ? 'blink 2s ease-in-out infinite' : 'none',
        }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.86rem', color: isAvailable ? 'var(--emerald)' : 'var(--text-muted)', fontWeight: 600 }}>
          {isAvailable ? 'You\'re online — Customers can see and book your services' : 'You\'re offline — Toggle to accept new service requests'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <div className="tab-group" style={{ display: 'inline-flex' }}>
          <button className={`tab-btn${activeTab === 'nearby' ? ' active' : ''}`} onClick={() => setActiveTab('nearby')}>
            Nearby Requests ({nearbyRequests.length})
          </button>
          <button className={`tab-btn${activeTab === 'my' ? ' active' : ''}`} onClick={() => setActiveTab('my')}>
            My Requests ({myRequests.length})
          </button>
        </div>
      </div>

      {activeTab === 'nearby' && (
        nearbyRequests.length === 0 ? (
          <div className="card-dark" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'float 3s ease-in-out infinite' }}>
              <WrenchScrewdriverIcon style={{ width: 34, height: 34, color: 'var(--blue)' }} />
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Nearby Requests</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>No pending service requests in your area right now.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 16 }}>
            {nearbyRequests.map((r, i) => <RequestCard key={r.id} request={r} onAccept={acceptRequest} delay={i * 60} />)}
          </div>
        )
      )}

      {activeTab === 'my' && (
        myRequests.length === 0 ? (
          <div className="card-dark" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'float 3s ease-in-out infinite' }}>
              <CheckCircleIcon style={{ width: 34, height: 34, color: 'var(--emerald)' }} />
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Requests Yet</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>Accept service requests to see them here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myRequests.map((r, i) => <RequestCard key={r.id} request={r} onUpdateStatus={updateRequestStatus} delay={i * 60} />)}
          </div>
        )
      )}
    </DashboardLayout>
  );
};

export default TechnicianDashboard;
