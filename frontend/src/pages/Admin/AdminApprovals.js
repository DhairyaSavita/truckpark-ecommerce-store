import React, { useState, useEffect, useCallback } from 'react';
import { admin } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  UsersIcon,
  EnvelopeOpenIcon,
} from '@heroicons/react/24/outline';

// ─── Nav Items (admin sidebar) ────────────────────────────────────────────────
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
  { label: 'Messages',     to: '/admin/messages',         icon: EnvelopeOpenIcon },
  { divider: 'System' },
  { label: 'Super Admin',  to: '/admin/super',            icon: ShieldCheckIcon },
];

// ─── Role type config — add new role types HERE to support future models ──────
const ROLE_TYPES = [
  {
    key: 'seller',
    label: 'Sellers',
    icon: BuildingStorefrontIcon,
    color: '#10B981',    // emerald
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    fetchFn: () => admin.getPendingSellers(),
    fields: [
      { key: 'store_name',        label: 'Store Name' },
      { key: 'store_description', label: 'Description' },
      { key: 'tax_id',            label: 'Tax ID / GST' },
      { key: 'bank_name',         label: 'Bank Name' },
    ],
    verifiedKey: 'is_approved',
  },
  {
    key: 'technician',
    label: 'Technicians',
    icon: WrenchScrewdriverIcon,
    color: '#8B5CF6',    // violet
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    fetchFn: () => admin.getPendingTechnicians(),
    fields: [
      { key: 'technician_specialization', label: 'Specialization', isArray: true },
      { key: 'technician_license_number',  label: 'License No.' },
      { key: 'technician_hourly_rate',     label: 'Hourly Rate (₹)' },
      { key: 'technician_service_radius',  label: 'Service Radius (km)' },
      { key: 'technician_experience',      label: 'Experience (yrs)' },
    ],
    verifiedKey: 'technician_verified',
  },
  {
    key: 'driver',
    label: 'Drivers',
    icon: TruckIcon,
    color: '#F97316',    // orange
    gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
    fetchFn: () => admin.getPendingDrivers(),
    fields: [
      { key: 'driver_license_number',   label: 'License No.' },
      { key: 'driver_vehicle_type',     label: 'Vehicle Type' },
      { key: 'driver_experience_years', label: 'Experience (yrs)' },
      { key: 'driver_home_city',        label: 'Home City' },
      { key: 'driver_hourly_rate',      label: 'Hourly Rate (₹)' },
      { key: 'driver_daily_rate',       label: 'Daily Rate (₹)' },
    ],
    verifiedKey: 'driver_verified',
  },
  {
    key: 'logistics',
    label: 'Logistics',
    icon: GlobeAltIcon,
    color: '#06B6D4',    // cyan
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    fetchFn: () => admin.getPendingLogistics(),
    fields: [
      { key: 'logistics_company_name',      label: 'Company' },
      { key: 'logistics_gst_number',        label: 'GST Number' },
      { key: 'logistics_vehicle_count',     label: 'Fleet Size' },
      { key: 'logistics_insurance_available', label: 'Insurance', isBool: true },
      { key: 'logistics_tracking_available',  label: 'Tracking', isBool: true },
    ],
    verifiedKey: 'logistics_verified',
  },
  {
    key: 'refurbisher',
    label: 'Refurbishers',
    icon: ArrowPathIcon,
    color: '#14B8A6',    // teal
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
    fetchFn: () => admin.getPendingRefurbishers(),
    fields: [
      { key: 'refurbisher_company_name',      label: 'Company' },
      { key: 'refurbisher_gst',               label: 'GST Number' },
      { key: 'refurbisher_license_number',    label: 'License No.' },
      { key: 'refurbisher_warehouse_address', label: 'Warehouse' },
    ],
    verifiedKey: 'refurbisher_verified',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';
const fmtVal = (v, isBool, isArray) => {
  if (isArray && Array.isArray(v)) return v.join(', ') || '—';
  if (isBool) return v ? '✅ Yes' : '❌ No';
  return v ?? '—';
};

// ─── Reject Modal ─────────────────────────────────────────────────────────────
const RejectModal = ({ user, roleType, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setSubmitting(true);
    await onConfirm(reason.trim());
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(6px)', padding: 16,
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
        borderRadius: 16, padding: 28, maxWidth: 480, width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Reject Application
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          You are rejecting <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>'s {roleType} application.
          Please provide a reason so they can improve their application.
        </p>

        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Missing valid license, incomplete information, etc."
          rows={4}
          style={{
            width: '100%', padding: '10px 14px',
            background: 'var(--bg-input)', border: '1px solid var(--border-medium)',
            borderRadius: 8, color: 'var(--text-primary)', fontFamily: "'Inter',sans-serif",
            fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border-medium)',
              background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
              fontFamily: "'Inter',sans-serif", fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
              color: 'white', cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter',sans-serif", fontSize: '0.875rem', fontWeight: 600,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Rejecting…' : 'Reject Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── User Detail Drawer ───────────────────────────────────────────────────────
const UserDrawer = ({ user, roleType, config, onApprove, onReject, onClose }) => {
  if (!user) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900, display: 'flex',
    }}>
      {/* Backdrop */}
      <div
        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div style={{
        width: 420, background: 'var(--bg-card)', borderLeft: '1px solid var(--border-medium)',
        height: '100%', overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 20,
        animation: 'slideInRight 0.3s ease-out both',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: config.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Outfit',sans-serif", fontSize: '1.2rem', fontWeight: 700, color: 'white',
            }}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {user.name}
              </h3>
              <span style={{
                display: 'inline-block', marginTop: 4, padding: '2px 10px',
                borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                background: config.color + '22', color: config.color,
              }}>
                {config.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Contact Info */}
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <EnvelopeIcon style={{ width: 16, height: 16, color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</span>
          </div>
          {user.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PhoneIcon style={{ width: 16, height: 16, color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.phone}</span>
            </div>
          )}
          {user.address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <MapPinIcon style={{ width: 16, height: 16, color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.address}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClockIcon style={{ width: 16, height: 16, color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Applied {fmtDate(user.created_at)}
            </span>
          </div>
        </div>

        {/* Role-specific fields */}
        <div>
          <h4 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Application Details
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {config.fields.map(field => (
              <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {field.label}
                </span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right', maxWidth: 220, wordBreak: 'break-word' }}>
                  {fmtVal(user[field.key], field.isBool, field.isArray)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => onReject(user)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: '1px solid rgba(244,63,94,0.3)',
              background: 'rgba(244,63,94,0.08)', color: '#F43F5E',
              cursor: 'pointer', fontFamily: "'Inter',sans-serif",
              fontSize: '0.88rem', fontWeight: 600, display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <XCircleIcon style={{ width: 16, height: 16 }} /> Reject
          </button>
          <button
            onClick={() => onApprove(user)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
              background: config.gradient, color: 'white',
              cursor: 'pointer', fontFamily: "'Inter',sans-serif",
              fontSize: '0.88rem', fontWeight: 600, display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: `0 4px 14px ${config.color}40`,
              transition: 'all 0.2s',
            }}
          >
            <CheckCircleIcon style={{ width: 16, height: 16 }} /> Approve
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── User Card ────────────────────────────────────────────────────────────────
const UserCard = ({ user, config, onApprove, onReject, onView }) => {
  const [approving, setApproving] = useState(false);

  const handleApprove = async (e) => {
    e.stopPropagation();
    setApproving(true);
    await onApprove(user);
    setApproving(false);
  };

  return (
    <div
      onClick={() => onView(user)}
      style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
        borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 14,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = `1px solid ${config.color}40`;
        e.currentTarget.style.boxShadow = `0 4px 20px ${config.color}18`;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = '1px solid var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: config.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Outfit',sans-serif", fontSize: '1rem', fontWeight: 700, color: 'white',
      }}>
        {user.name?.charAt(0).toUpperCase() || 'U'}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name}
        </p>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </p>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Applied {fmtDate(user.created_at)}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onReject(user)}
          title="Reject"
          style={{
            width: 34, height: 34, borderRadius: 8,
            border: '1px solid rgba(244,63,94,0.3)',
            background: 'rgba(244,63,94,0.08)', color: '#F43F5E',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <XCircleIcon style={{ width: 16, height: 16 }} />
        </button>
        <button
          onClick={handleApprove}
          disabled={approving}
          title="Approve"
          style={{
            width: 34, height: 34, borderRadius: 8, border: 'none',
            background: config.gradient, color: 'white',
            cursor: approving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: approving ? 0.6 : 1, transition: 'all 0.2s',
            boxShadow: `0 2px 8px ${config.color}40`,
          }}
        >
          <CheckCircleIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};

// ─── Tab Panel ────────────────────────────────────────────────────────────────
const TabPanel = ({ config, onApprove, onReject, onView, searchQuery }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await config.fetchFn();
      setUsers(res.data || []);
    } catch {
      toast.error(`Failed to load ${config.label}`);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => { load(); }, [load]);

  // Expose reload function via imperative handle pattern (simpler: just watch a reload signal)
  TabPanel._loaders = TabPanel._loaders || {};
  TabPanel._loaders[config.key] = load;

  const filtered = users.filter(u =>
    !searchQuery ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ background: 'var(--bg-elevated)', borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--border-subtle)', flexShrink: 0 }} className="skeleton-dark" />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: 120, borderRadius: 4, marginBottom: 8 }} className="skeleton-dark" />
            <div style={{ height: 11, width: 180, borderRadius: 4 }} className="skeleton-dark" />
          </div>
        </div>
      ))}
    </div>
  );

  if (filtered.length === 0) return (
    <div style={{
      textAlign: 'center', padding: '60px 24px',
      background: 'var(--bg-elevated)', borderRadius: 14,
      border: '1px dashed var(--border-medium)',
    }}>
      <CheckCircleIcon style={{ width: 48, height: 48, color: config.color, opacity: 0.4, margin: '0 auto 12px' }} />
      <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
        {searchQuery ? 'No results found' : 'All Clear!'}
      </p>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
        {searchQuery ? 'Try a different search term' : `No pending ${config.label.toLowerCase()} applications`}
      </p>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
      {filtered.map(u => (
        <UserCard
          key={u.id}
          user={u}
          config={config}
          onApprove={onApprove}
          onReject={onReject}
          onView={onView}
        />
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminApprovals = () => {
  const [activeTab, setActiveTab] = useState('seller');
  const [counts, setCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Load badge counts for all tabs
  const loadCounts = useCallback(async () => {
    const results = await Promise.allSettled(ROLE_TYPES.map(rt => rt.fetchFn()));
    const next = {};
    results.forEach((r, i) => {
      next[ROLE_TYPES[i].key] = r.status === 'fulfilled' ? (r.value.data?.length || 0) : 0;
    });
    setCounts(next);
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  const handleApprove = async (user) => {
    const type = activeTab;
    try {
      await admin.approveUser(type, user.id);
      toast.success(`${user.name} approved as ${type}!`, { icon: '✅' });
      // Reload the current tab
      if (TabPanel._loaders?.[type]) await TabPanel._loaders[type]();
      loadCounts();
      setSelectedUser(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleRejectOpen = (user) => {
    setSelectedUser(null); // close drawer first
    setRejectTarget(user);
  };

  const handleRejectConfirm = async (reason) => {
    const type = activeTab;
    try {
      await admin.rejectUser(type, rejectTarget.id, reason);
      toast.success(`${rejectTarget.name}'s application rejected`, { icon: '🚫' });
      if (TabPanel._loaders?.[type]) await TabPanel._loaders[type]();
      loadCounts();
      setRejectTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject');
    }
  };

  const activeConfig = ROLE_TYPES.find(rt => rt.key === activeTab);
  const totalPending = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      title="Admin Panel"
      accentColor="var(--violet)"
      accentColorDim="rgba(139,92,246,0.12)"
      accentColorRing="rgba(139,92,246,0.2)"
    >
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      <PageHeader
        title="Application Approvals"
        subtitle="Review and approve pending applications from all role types"
        icon={ShieldCheckIcon}
        gradient
        badge={{ label: totalPending > 0 ? `${totalPending} Pending` : 'All Clear', variant: totalPending > 0 ? 'amber' : 'emerald' }}
      />

      {/* Search bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)',
        borderRadius: 10, padding: '8px 14px', marginBottom: 20,
      }}>
        <MagnifyingGlassIcon style={{ width: 18, height: 18, color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name or email…"
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: "'Inter',sans-serif", fontSize: '0.875rem',
            color: 'var(--text-primary)', width: '100%',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
          >
            <XMarkIcon style={{ width: 15, height: 15 }} />
          </button>
        )}
      </div>

      {/* Tab strip */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20,
        overflowX: 'auto', paddingBottom: 4,
      }}>
        {ROLE_TYPES.map(rt => {
          const isActive = activeTab === rt.key;
          const count = counts[rt.key] || 0;
          return (
            <button
              key={rt.key}
              onClick={() => { setActiveTab(rt.key); setSearchQuery(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', borderRadius: 10, border: 'none',
                background: isActive ? rt.gradient : 'var(--bg-elevated)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: "'Inter',sans-serif",
                fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap',
                boxShadow: isActive ? `0 4px 16px ${rt.color}40` : 'none',
                transition: 'all 0.2s',
                border: isActive ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              <rt.icon style={{ width: 16, height: 16 }} />
              {rt.label}
              {count > 0 && (
                <span style={{
                  padding: '1px 7px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                  background: isActive ? 'rgba(255,255,255,0.25)' : rt.color + '22',
                  color: isActive ? 'white' : rt.color,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active tab info banner */}
      {counts[activeTab] > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          padding: '10px 14px', borderRadius: 10,
          background: activeConfig.color + '12', border: `1px solid ${activeConfig.color}30`,
        }}>
          <InformationCircleIcon style={{ width: 18, height: 18, color: activeConfig.color, flexShrink: 0 }} />
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            <strong style={{ color: activeConfig.color }}>{counts[activeTab]} pending</strong> {activeConfig.label.toLowerCase()} applications awaiting review.
            Click a card to see full details, or use the quick action buttons.
          </p>
        </div>
      )}

      {/* Tab content */}
      <TabPanel
        key={`${activeTab}-${reloadKey}`}
        config={activeConfig}
        onApprove={handleApprove}
        onReject={handleRejectOpen}
        onView={setSelectedUser}
        searchQuery={searchQuery}
      />

      {/* Detail Drawer */}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
          roleType={activeConfig.label.slice(0,-1)} // remove trailing 's'
          config={activeConfig}
          onApprove={handleApprove}
          onReject={handleRejectOpen}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          user={rejectTarget}
          roleType={activeConfig.label}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminApprovals;
