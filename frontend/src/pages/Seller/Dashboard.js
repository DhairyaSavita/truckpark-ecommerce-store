import React, { useState, useEffect } from 'react';
import { sellerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBagIcon, CurrencyDollarIcon, CubeIcon, ChartBarIcon,
  PlusIcon, StarIcon, ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';

const NAV_ITEMS = [
  { divider: 'Seller Hub' },
  { label: 'Dashboard',    to: '/seller',             icon: ChartBarIcon },
  { divider: 'Catalogue' },
  { label: 'My Products',  to: '/seller/products',    icon: CubeIcon },
  { label: 'Add Product',  to: '/seller/products/new', icon: PlusIcon },
  { divider: 'Business' },
  { label: 'My Orders',    to: '/seller/orders',      icon: ShoppingBagIcon },
  { label: 'Earnings',     to: '/seller/earnings',    icon: CurrencyDollarIcon },
];

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalEarnings: 0, pendingEarnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [products, orders, earnings] = await Promise.all([
        sellerAPI.getProducts(), sellerAPI.getOrders(), sellerAPI.getEarnings(),
      ]);
      setStats({
        totalProducts: products.data?.length || 0,
        totalOrders: orders.data?.length || 0,
        totalEarnings: earnings.data?.totalEarnings || 0,
        pendingEarnings: earnings.data?.pendingEarnings || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const storeRating = user?.store_rating || 0;

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Seller Hub" accentColor="var(--emerald)" accentColorDim="rgba(16,185,129,0.12)" accentColorRing="rgba(16,185,129,0.2)">
      <PageHeader
        title="Seller Dashboard"
        subtitle={`Welcome back, ${user?.store_name || user?.name || 'Seller'}!`}
        icon={ChartBarIcon}
        badge={{ label: user?.seller_verified ? 'Verified Seller' : 'Pending Review', variant: user?.seller_verified ? 'green' : 'amber' }}
        gradient
        actions={
          <Link to="/seller/products/new" className="btn-primary">
            <PlusIcon style={{ width: 16, height: 16 }} /> Add Product
          </Link>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        <Link to="/seller/products" style={{ textDecoration: 'none' }}>
          <StatCard title="Total Products" value={stats.totalProducts} icon={CubeIcon} variant="blue" loading={loading} delay={0} />
        </Link>
        <Link to="/seller/orders" style={{ textDecoration: 'none' }}>
          <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBagIcon} variant="orange" loading={loading} delay={80} />
        </Link>
        <Link to="/seller/earnings" style={{ textDecoration: 'none' }}>
          <StatCard title="Total Earnings" value={typeof stats.totalEarnings === 'number' ? stats.totalEarnings.toFixed(0) : 0} prefix="₹" icon={CurrencyDollarIcon} variant="emerald" loading={loading} delay={160} />
        </Link>
        <Link to="/seller/earnings" style={{ textDecoration: 'none' }}>
          <StatCard title="Pending Payout" value={typeof stats.pendingEarnings === 'number' ? stats.pendingEarnings.toFixed(0) : 0} prefix="₹" icon={ChartBarIcon} variant="amber" loading={loading} delay={240} />
        </Link>
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Quick Actions */}
        <div className="card-dark" style={{ padding: 24 }}>
          <h2 className="section-title" style={{ marginBottom: 18 }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { to: '/seller/products/new', label: 'Add New Product', variant: 'primary', icon: PlusIcon },
              { to: '/seller/products',    label: 'Manage Products',  variant: 'secondary', icon: CubeIcon },
              { to: '/seller/orders',      label: 'View Orders',      variant: 'secondary', icon: ShoppingBagIcon },
              { to: '/seller/earnings',    label: 'View Earnings',    variant: 'secondary', icon: CurrencyDollarIcon },
            ].map((a, i) => (
              <Link key={i} to={a.to}
                className={a.variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
                style={{ justifyContent: 'flex-start', gap: 10, textDecoration: 'none' }}
              >
                <a.icon style={{ width: 16, height: 16 }} />
                {a.label}
                {a.variant === 'primary' && <ArrowTopRightOnSquareIcon style={{ width: 13, height: 13, marginLeft: 'auto' }} />}
              </Link>
            ))}
          </div>
        </div>

        {/* Store Performance */}
        <div className="card-dark" style={{ padding: 24 }}>
          <h2 className="section-title" style={{ marginBottom: 20 }}>Store Performance</h2>

          {/* Store Rating */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Store Rating
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => (
                    <StarIcon key={i} style={{
                      width: 14, height: 14,
                      color: i <= storeRating ? 'var(--amber)' : 'var(--border-medium)',
                      fill: i <= storeRating ? 'var(--amber)' : 'none',
                    }} />
                  ))}
                </div>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {storeRating} / 5
                </span>
              </div>
            </div>
            <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: 'linear-gradient(90deg, var(--amber), #FCD34D)',
                width: `${(storeRating / 5) * 100}%`,
                transition: 'width 0.8s ease-out',
              }} />
            </div>
          </div>

          {/* Stats rows */}
          {[
            { label: 'Total Sales', value: `${user?.total_sales || 0} orders` },
            { label: 'Commission Rate', value: `${user?.commission_rate || 10}%` },
            { label: 'Store Status', value: user?.seller_verified ? 'Verified ✓' : 'Under Review' },
            { label: 'Store Name', value: user?.store_name || '—' },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {row.label}
              </span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerDashboard;
