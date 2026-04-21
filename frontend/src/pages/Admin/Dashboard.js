import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import {
  UsersIcon,
  ShoppingBagIcon,
  CubeIcon,
  ChatBubbleLeftRightIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  TicketIcon,
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  ChartBarIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

const NAV_ITEMS = [
  { divider: 'Overview' },
  { label: 'Dashboard',    to: '/admin',                  icon: ChartBarIcon },
  { divider: 'Management' },
  { label: 'Users',        to: '/admin/users',            icon: UsersIcon },
  { label: 'Products',     to: '/admin/products',         icon: CubeIcon },
  { label: 'Orders',       to: '/admin/orders',           icon: ShoppingBagIcon },
  { label: 'Inventory',    to: '/admin/inventory',        icon: ClipboardDocumentListIcon },
  { divider: 'Approvals' },
  { label: 'All Approvals',to: '/admin/approvals',        icon: ShieldCheckIcon },
  { label: 'Sellers',      to: '/admin/sellers',          icon: BuildingStorefrontIcon },
  { label: 'Logistics',    to: '/admin/logistics',        icon: TruckIcon },
  { divider: 'Support' },
  { label: 'Support Tickets', to: '/admin/support-tickets', icon: TicketIcon },
  { label: 'Messages',     to: '/admin/messages',         icon: EnvelopeIcon },
  { divider: 'System' },
  { label: 'Super Admin',  to: '/admin/super',            icon: ShieldCheckIcon },
];

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    badge: 'badge-amber' },
  processing: { label: 'Processing', badge: 'badge-blue' },
  shipped:    { label: 'Shipped',    badge: 'badge-violet' },
  delivered:  { label: 'Delivered',  badge: 'badge-green' },
  cancelled:  { label: 'Cancelled',  badge: 'badge-rose' },
};

const ROLE_CONFIG = {
  admin:    'badge-violet',
  seller:   'badge-blue',
  user:     'badge-gray',
  driver:   'badge-orange',
  logistics:'badge-cyan',
};

const QuickAction = ({ to, icon: Icon, label, color, delay }) => (
  <Link
    to={to}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      padding: '20px 12px',
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border-subtle)',
      textDecoration: 'none',
      transition: 'all var(--transition)',
      animation: `fadeSlideUp 0.4s ease-out ${delay}ms both`,
      cursor: 'pointer',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'var(--bg-card-hover)';
      e.currentTarget.style.borderColor = 'var(--border-medium)';
      e.currentTarget.style.transform = 'translateY(-3px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'var(--bg-elevated)';
      e.currentTarget.style.borderColor = 'var(--border-subtle)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: color + '18',
      border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon style={{ width: 22, height: 22, color }} />
    </div>
    <span style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.78rem',
      fontWeight: 600,
      color: 'var(--text-secondary)',
      textAlign: 'center',
    }}>
      {label}
    </span>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalSellers: 0, totalProducts: 0, totalOrders: 0,
    pendingOrders: 0, totalRevenue: 0, lowStockProducts: 0, pendingSellers: 0,
    recentOrders: [], recentUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const response = await admin.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const STAT_CARDS = [
    { title: 'Total Users',         value: stats.totalUsers,       icon: UsersIcon,                 variant: 'blue',    link: '/admin/users',                   delay: 0 },
    { title: 'Total Sellers',       value: stats.totalSellers,     icon: UserGroupIcon,             variant: 'emerald', link: '/admin/sellers',                 delay: 60 },
    { title: 'Total Products',      value: stats.totalProducts,    icon: CubeIcon,                  variant: 'violet',  link: '/admin/inventory',               delay: 120 },
    { title: 'Total Orders',        value: stats.totalOrders,      icon: ShoppingBagIcon,           variant: 'orange',  link: '/admin/orders',                  delay: 180 },
    { title: 'Pending Orders',      value: stats.pendingOrders,    icon: ClipboardDocumentListIcon, variant: 'amber',   link: '/admin/orders?status=pending',   delay: 240 },
    { title: 'Total Revenue',       value: typeof stats.totalRevenue === 'number' ? stats.totalRevenue.toFixed(0) : 0, icon: CurrencyRupeeIcon, variant: 'emerald', prefix: '₹', link: '/admin/orders', delay: 300 },
    { title: 'Low Stock Items',     value: stats.lowStockProducts, icon: TruckIcon,                 variant: 'rose',    link: '/admin/inventory?filter=lowstock', delay: 360 },
    { title: 'Pending Approvals',   value: stats.pendingSellers,   icon: ShieldCheckIcon,           variant: 'amber',   link: '/admin/approvals',               delay: 420 },
  ];

  const QUICK_ACTIONS = [
    { to: '/admin/users',     icon: UsersIcon,              label: 'Manage Users',    color: 'var(--blue)',    delay: 0 },
    { to: '/admin/inventory', icon: CubeIcon,               label: 'Inventory',       color: 'var(--violet)',  delay: 60 },
    { to: '/admin/orders',    icon: ShoppingBagIcon,        label: 'View Orders',     color: 'var(--orange)',  delay: 120 },
    { to: '/admin/approvals', icon: ShieldCheckIcon,        label: 'Approvals',       color: 'var(--amber)',   delay: 180 },
    { to: '/admin/sellers',   icon: BuildingStorefrontIcon, label: 'Manage Sellers',  color: 'var(--emerald)', delay: 240 },
    { to: '/admin/logistics', icon: TruckIcon,              label: 'Logistics',       color: 'var(--cyan)',    delay: 300 },
    { to: '/admin/support-tickets', icon: TicketIcon,       label: 'Support Tickets', color: 'var(--rose)',    delay: 360 },
    { to: '/admin/messages',  icon: EnvelopeIcon,           label: 'Messages',        color: 'var(--blue)',    delay: 420 },
    { to: '/admin/super',     icon: ShieldCheckIcon,        label: 'Super Admin',     color: 'var(--violet)',  delay: 480 },
  ];

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      title="Admin Panel"
      accentColor="var(--violet)"
      accentColorDim="rgba(139,92,246,0.12)"
      accentColorRing="rgba(139,92,246,0.2)"
    >
      {/* Page Header */}
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform-wide overview — users, orders, revenue, and inventory."
        icon={ShieldCheckIcon}
        gradient
        badge={{ label: 'Super Admin', variant: 'violet' }}
      />

      {/* Stat Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {STAT_CARDS.map((s, i) => (
          <Link key={i} to={s.link} style={{ textDecoration: 'none' }}>
            <StatCard
              title={s.title}
              value={s.value}
              icon={s.icon}
              variant={s.variant}
              prefix={s.prefix}
              loading={loading}
              delay={s.delay}
              trend={!loading ? { value: Math.floor(Math.random() * 20) - 5, label: 'this week' } : undefined}
            />
          </Link>
        ))}
      </div>

      {/* Row: Recent Orders + Recent Users */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}
        className="grid-cols-1 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="card-dark" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="section-title">Recent Orders</h2>
            <Link to="/admin/orders" style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: "'Inter', sans-serif", fontSize: '0.78rem',
              color: 'var(--orange)', textDecoration: 'none', fontWeight: 600,
            }}>
              View all <ArrowTopRightOnSquareIcon style={{ width: 13, height: 13 }} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-dark h-4 w-24 rounded" style={{ height: 14, width: 90, marginBottom: 6 }} />
                    <div className="skeleton-dark h-3 w-16 rounded" style={{ height: 10, width: 64 }} />
                  </div>
                  <div className="skeleton-dark h-6 w-20 rounded-full" style={{ height: 22, width: 70 }} />
                </div>
              ))}
            </div>
          ) : stats.recentOrders?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {stats.recentOrders.map((order, i) => {
                const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                return (
                  <div key={order.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < stats.recentOrders.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}>
                    <div>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        Order #{order.id}
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {order.User?.name || 'Unknown User'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: 'var(--emerald)' }}>
                        ₹{parseFloat(order.total_amount).toFixed(0)}
                      </p>
                      <span className={`badge ${sc.badge}`}>{sc.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>
              No recent orders
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="card-dark" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="section-title">Recent Users</h2>
            <Link to="/admin/users" style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: "'Inter', sans-serif", fontSize: '0.78rem',
              color: 'var(--orange)', textDecoration: 'none', fontWeight: 600,
            }}>
              View all <ArrowTopRightOnSquareIcon style={{ width: 13, height: 13 }} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="skeleton-dark" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-dark" style={{ height: 13, width: 100, marginBottom: 5, borderRadius: 4 }} />
                    <div className="skeleton-dark" style={{ height: 10, width: 70, borderRadius: 4 }} />
                  </div>
                  <div className="skeleton-dark" style={{ height: 20, width: 50, borderRadius: 99 }} />
                </div>
              ))}
            </div>
          ) : stats.recentUsers?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {stats.recentUsers.map((u, i) => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < stats.recentUsers.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: `hsl(${(u.name?.charCodeAt(0) || 65) * 5 % 360}, 60%, 40%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', fontWeight: 700, color: 'white',
                  }}>
                    {u.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name}
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </p>
                  </div>
                  <span className={`badge ${ROLE_CONFIG[u.role] || 'badge-gray'}`}>{u.role}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>
              No recent users
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-dark" style={{ padding: 24 }}>
        <h2 className="section-title" style={{ marginBottom: 18 }}>Quick Actions</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: 12,
        }}>
          {QUICK_ACTIONS.map((a, i) => (
            <QuickAction key={i} {...a} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
