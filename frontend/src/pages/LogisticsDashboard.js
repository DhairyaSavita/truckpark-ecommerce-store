import React, { useState, useEffect } from 'react';
import { logisticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TruckIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';

const NAV_ITEMS = [
  { divider: 'Logistics' },
  { label: 'Dashboard',      to: '/logistics/dashboard', icon: ChartBarIcon },
  { label: 'Vendor Chat',    to: '/logistics/messages',  icon: ChatBubbleLeftRightIcon, badge: 'Live' },
  { divider: 'Shipments' },
  { label: 'Available',      to: '/logistics/dashboard', icon: TruckIcon },
  { label: 'My Shipments',   to: '/logistics/dashboard', icon: ShoppingBagIcon },
];

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    badgeClass: 'badge-amber' },
  accepted:   { label: 'Accepted',   badgeClass: 'badge-blue' },
  in_transit: { label: 'In Transit', badgeClass: 'badge-violet' },
  delivered:  { label: 'Delivered',  badgeClass: 'badge-green' },
  cancelled:  { label: 'Cancelled',  badgeClass: 'badge-rose' },
};

const ShipmentCard = ({ shipment, actions, delay = 0 }) => {
  const sc = STATUS_CONFIG[shipment.status] || STATUS_CONFIG.pending;
  return (
    <div className="card-dark" style={{
      padding: 20,
      animation: `fadeSlideUp 0.4s ease-out ${delay}ms both`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.82rem', fontWeight: 700,
              color: 'var(--text-muted)',
            }}>
              #{shipment.id}
            </span>
            <span className={`badge ${sc.badgeClass}`}>{sc.label}</span>
            {shipment.Customer?.name && (
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem', color: 'var(--text-muted)',
              }}>
                · {shipment.Customer.name}
              </span>
            )}
          </div>

          {/* Route visual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MapPinIcon style={{ width: 12, height: 12, color: 'var(--emerald)' }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                  Pickup
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {shipment.pickup_address}
                </p>
              </div>
            </div>

            {/* Route line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12 }}>
              <div style={{ width: 1, height: 16, background: 'var(--border-medium)', marginLeft: 5 }} />
              <ArrowRightIcon style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MapPinIcon style={{ width: 12, height: 12, color: 'var(--rose)' }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                  Delivery
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {shipment.delivery_address}
                </p>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}>
              ⚖️ {shipment.weight_kg} kg
            </span>
            <span style={{
              fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700,
              color: 'var(--emerald)',
            }}>
              ₹{shipment.final_cost || shipment.estimated_cost}
            </span>
            {shipment.tracking_number && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--blue)' }}>
                🔍 {shipment.tracking_number}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '60px 24px', textAlign: 'center',
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: 20,
      background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      animation: 'float 3s ease-in-out infinite',
    }}>
      <Icon style={{ width: 38, height: 38, color: 'var(--orange)' }} />
    </div>
    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
      {title}
    </h3>
    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.6 }}>
      {subtitle}
    </p>
  </div>
);

const LogisticsDashboard = () => {
  const { user } = useAuth();
  const [availableShipments, setAvailableShipments] = useState([]);
  const [myShipments, setMyShipments]   = useState([]);
  const [earnings, setEarnings] = useState({ total_earnings: 0, pending_earnings: 0, completed_shipments: 0 });
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [availRes, myRes, earnRes] = await Promise.all([
        logisticsAPI.getAvailableShipments(),
        logisticsAPI.getMyShipments(),
        logisticsAPI.getEarnings(),
      ]);
      setAvailableShipments(availRes.data);
      setMyShipments(myRes.data);
      setEarnings(earnRes.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const acceptShipment = async (id) => {
    try {
      await logisticsAPI.acceptShipment(id);
      toast.success('Shipment accepted!');
      fetchData();
    } catch { toast.error('Failed to accept shipment'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await logisticsAPI.updateShipmentStatus(id, status);
      toast.success(`Shipment marked as ${status}`);
      fetchData();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Logistics Hub">
      {/* Header */}
      <PageHeader
        title="Logistics Dashboard"
        subtitle="Manage your shipments, track earnings, and coordinate with vendors."
        icon={TruckIcon}
        badge={{
          label: user?.logistics_verified ? 'Verified Partner' : 'Pending Verification',
          variant: user?.logistics_verified ? 'green' : 'amber',
        }}
        actions={
          <Link to="/logistics/messages" className="btn-primary" style={{ gap: 8 }}>
            <ChatBubbleLeftRightIcon style={{ width: 18, height: 18 }} />
            Vendor Chat
          </Link>
        }
      />

      {/* Vendor Communication CTA Banner */}
      <Link to="/logistics/messages" style={{ textDecoration: 'none', marginBottom: 24, display: 'block' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 'var(--radius)',
          padding: '16px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          transition: 'all var(--transition)',
          cursor: 'pointer',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.1))'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChatBubbleLeftRightIcon style={{ width: 20, height: 20, color: 'var(--blue)' }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                Vendor Communication Portal
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Coordinate transport with vendors — restricted to logistics & admin roles only
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span className="badge badge-blue">Logistics Only</span>
            <ArrowRightIcon style={{ width: 16, height: 16, color: 'var(--blue)' }} />
          </div>
        </div>
      </Link>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard title="Total Earnings" value={earnings.total_earnings} prefix="₹" icon={CurrencyRupeeIcon} variant="emerald" loading={loading} delay={0} />
        <StatCard title="Completed Shipments" value={earnings.completed_shipments} icon={CheckCircleIcon} variant="blue" loading={loading} delay={80} />
        <StatCard title="Pending Earnings" value={earnings.pending_earnings} prefix="₹" icon={ClockIcon} variant="amber" loading={loading} delay={160} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div className="tab-group">
          <button
            className={`tab-btn${activeTab === 'available' ? ' active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available ({availableShipments.length})
          </button>
          <button
            className={`tab-btn${activeTab === 'my-shipments' ? ' active' : ''}`}
            onClick={() => setActiveTab('my-shipments')}
          >
            My Shipments ({myShipments.length})
          </button>
        </div>
      </div>

      {/* Available Shipments */}
      {activeTab === 'available' && (
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 16 }}>
              {[1,2,3,4].map(i => (
                <div key={i} className="card-dark" style={{ padding: 20, height: 180 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="skeleton-dark" style={{ height: 13, width: 80, borderRadius: 4 }} />
                    <div className="skeleton-dark" style={{ height: 40, width: '100%', borderRadius: 4 }} />
                    <div className="skeleton-dark" style={{ height: 40, width: '100%', borderRadius: 4 }} />
                    <div className="skeleton-dark" style={{ height: 13, width: 120, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : availableShipments.length === 0 ? (
            <div className="card-dark">
              <EmptyState icon={TruckIcon} title="No Available Shipments" subtitle="Check back later — new shipment requests from buyers will appear here." />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 16 }}>
              {availableShipments.map((s, i) => (
                <ShipmentCard key={s.id} shipment={s} delay={i * 60}
                  actions={
                    <button
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      onClick={() => acceptShipment(s.id)}
                    >
                      Accept
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Shipments */}
      {activeTab === 'my-shipments' && (
        <div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1,2,3].map(i => (
                <div key={i} className="card-dark" style={{ padding: 20, height: 180 }}>
                  <div className="skeleton-dark" style={{ height: '100%', borderRadius: 8 }} />
                </div>
              ))}
            </div>
          ) : myShipments.length === 0 ? (
            <div className="card-dark">
              <EmptyState icon={ShoppingBagIcon} title="No Shipments Yet" subtitle="Accept available shipments to start managing deliveries and earning." />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {myShipments.map((s, i) => (
                <ShipmentCard key={s.id} shipment={s} delay={i * 60}
                  actions={
                    <>
                      {s.status === 'accepted' && (
                        <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                          onClick={() => updateStatus(s.id, 'in_transit')}>
                          Start Transit
                        </button>
                      )}
                      {s.status === 'in_transit' && (
                        <button className="btn-success" style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                          onClick={() => updateStatus(s.id, 'delivered')}>
                          Mark Delivered
                        </button>
                      )}
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LogisticsDashboard;
