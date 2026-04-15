import React, { useState, useEffect } from 'react';
import { driverAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TruckIcon, CurrencyRupeeIcon, ClockIcon,
  MapPinIcon, CheckCircleIcon, ChartBarIcon,
  SignalIcon, SignalSlashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';

const NAV_ITEMS = [
  { divider: 'Driver Hub' },
  { label: 'Dashboard',     to: '/driver/dashboard', icon: ChartBarIcon },
  { divider: 'Trips' },
  { label: 'Available Trips', to: '/driver/dashboard', icon: TruckIcon },
  { label: 'My Trips',       to: '/driver/dashboard', icon: CheckCircleIcon },
];

const STATUS_CFG = {
  pending:     { label: 'Pending',     cls: 'badge-amber' },
  accepted:    { label: 'Accepted',    cls: 'badge-blue' },
  in_progress: { label: 'In Progress', cls: 'badge-violet' },
  completed:   { label: 'Completed',   cls: 'badge-green' },
  cancelled:   { label: 'Cancelled',   cls: 'badge-rose' },
};

const TripCard = ({ trip, onAccept, onUpdateStatus, delay = 0 }) => {
  const sc = STATUS_CFG[trip.status] || STATUS_CFG.pending;
  return (
    <div className="card-dark" style={{ padding: 20, animation: `fadeSlideUp 0.4s ease-out ${delay}ms both` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {trip.title}
            </h3>
            {trip.status && <span className={`badge ${sc.cls}`}>{sc.label}</span>}
          </div>
          {trip.description && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
              {trip.description}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            {trip.pickup_location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPinIcon style={{ width: 11, height: 11, color: 'var(--emerald)' }} />
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {trip.pickup_location}
                </span>
              </div>
            )}
            {trip.dropoff_location && (
              <>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>→</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPinIcon style={{ width: 11, height: 11, color: 'var(--rose)' }} />
                  </div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {trip.dropoff_location}
                  </span>
                </div>
              </>
            )}
            {trip.estimated_cost && (
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: 'var(--emerald)' }}>
                ₹{trip.estimated_cost}
              </span>
            )}
            {trip.Customer?.name && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                👤 {trip.Customer.name}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          {onAccept && (
            <button className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={() => onAccept(trip.id)}>
              Accept
            </button>
          )}
          {trip.status === 'accepted' && onUpdateStatus && (
            <button className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem', background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' }} onClick={() => onUpdateStatus(trip.id, 'in_progress')}>
              Start Trip
            </button>
          )}
          {trip.status === 'in_progress' && onUpdateStatus && (
            <button className="btn-success" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={() => onUpdateStatus(trip.id, 'completed')}>
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const DriverDashboard = () => {
  const { user } = useAuth();
  const [availableTrips, setAvailableTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [earnings, setEarnings] = useState({ total_earnings: 0, pending_earnings: 0, completed_trips: 0 });
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [avRes, myRes, earnRes] = await Promise.all([
        driverAPI.getAvailableTrips(), driverAPI.getMyTrips(), driverAPI.getEarnings(),
      ]);
      setAvailableTrips(avRes.data);
      setMyTrips(myRes.data);
      setEarnings(earnRes.data);
    } catch { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  const acceptTrip = async (id) => {
    try { await driverAPI.acceptTrip(id); toast.success('Trip accepted!'); fetchData(); }
    catch { toast.error('Failed to accept trip'); }
  };

  const updateTripStatus = async (id, status) => {
    try { await driverAPI.updateTripStatus(id, status); toast.success(`Trip ${status}`); fetchData(); }
    catch { toast.error('Failed to update status'); }
  };

  const toggleAvailability = async () => {
    try {
      await driverAPI.updateAvailability(!isAvailable);
      setIsAvailable(!isAvailable);
      toast.success(isAvailable ? 'You are now offline' : 'You are now online');
    } catch { toast.error('Failed to update availability'); }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Driver Hub" accentColor="var(--orange)" accentColorDim="rgba(249,115,22,0.12)" accentColorRing="rgba(249,115,22,0.2)">
      <PageHeader
        title="Driver Dashboard"
        subtitle="Manage your trips, availability, and track your earnings."
        icon={TruckIcon}
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
            {isAvailable
              ? <SignalIcon style={{ width: 16, height: 16 }} />
              : <SignalSlashIcon style={{ width: 16, height: 16 }} />
            }
            {isAvailable ? 'Online' : 'Offline'}
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard title="Total Earnings" value={earnings.total_earnings} prefix="₹" icon={CurrencyRupeeIcon} variant="emerald" loading={loading} delay={0} />
        <StatCard title="Completed Trips" value={earnings.completed_trips} icon={CheckCircleIcon} variant="blue" loading={loading} delay={80} />
        <StatCard title="Pending Earnings" value={earnings.pending_earnings} prefix="₹" icon={ClockIcon} variant="amber" loading={loading} delay={160} />
      </div>

      {/* Availability Status Bar */}
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
          animation: isAvailable ? 'pulseGlow 2s ease-in-out infinite' : 'none',
          boxShadow: isAvailable ? '0 0 8px rgba(16,185,129,0.6)' : 'none',
        }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.86rem', color: isAvailable ? 'var(--emerald)' : 'var(--text-muted)', fontWeight: 600 }}>
          {isAvailable ? 'You\'re online — Available for new trips in your area' : 'You\'re offline — Toggle to start receiving trip requests'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <div className="tab-group" style={{ display: 'inline-flex' }}>
          <button className={`tab-btn${activeTab === 'available' ? ' active' : ''}`} onClick={() => setActiveTab('available')}>
            Available ({availableTrips.length})
          </button>
          <button className={`tab-btn${activeTab === 'my' ? ' active' : ''}`} onClick={() => setActiveTab('my')}>
            My Trips ({myTrips.length})
          </button>
        </div>
      </div>

      {/* Available Trips */}
      {activeTab === 'available' && (
        availableTrips.length === 0 ? (
          <div className="card-dark" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'float 3s ease-in-out infinite' }}>
              <TruckIcon style={{ width: 34, height: 34, color: 'var(--orange)' }} />
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Trips Available</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>Check back soon for new trip requests in your area.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 16 }}>
            {availableTrips.map((t, i) => <TripCard key={t.id} trip={t} onAccept={acceptTrip} delay={i * 60} />)}
          </div>
        )
      )}

      {/* My Trips */}
      {activeTab === 'my' && (
        myTrips.length === 0 ? (
          <div className="card-dark" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'float 3s ease-in-out infinite' }}>
              <CheckCircleIcon style={{ width: 34, height: 34, color: 'var(--blue)' }} />
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Trips Yet</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>Accept available trips to see them here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myTrips.map((t, i) => <TripCard key={t.id} trip={t} onUpdateStatus={updateTripStatus} delay={i * 60} />)}
          </div>
        )
      )}
    </DashboardLayout>
  );
};

export default DriverDashboard;
