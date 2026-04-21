import React, { useState, useEffect, useCallback } from 'react';
import { admin as adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  WrenchScrewdriverIcon, MagnifyingGlassIcon, CheckCircleIcon,
  XCircleIcon, ShieldExclamationIcon, ChartBarIcon,
  UserCircleIcon, ClockIcon, CurrencyRupeeIcon,
  FunnelIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';

const NAV_ITEMS = [
  { divider: 'Admin Panel' },
  { label: 'Dashboard', to: '/admin', icon: ChartBarIcon },
  { divider: 'Technicians' },
  { label: 'All Technicians', to: '/admin/technicians', icon: WrenchScrewdriverIcon },
  { label: 'Hire Requests', to: '/admin/technicians', icon: ClockIcon },
];

const STATUS_CFG = {
  pending:   { label: 'Pending',   bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  approved:  { label: 'Approved',  bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'rgba(16,185,129,0.25)' },
  rejected:  { label: 'Rejected',  bg: 'rgba(244,63,94,0.08)', color: '#F43F5E', border: 'rgba(244,63,94,0.2)' },
  suspended: { label: 'Suspended', bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: 'rgba(139,92,246,0.25)' },
};

const HIRE_STATUS = {
  pending:             { label: 'Pending',         color: '#F59E0B' },
  technician_accepted: { label: 'Tech Accepted',   color: '#3B82F6' },
  technician_rejected: { label: 'Tech Rejected',   color: '#F43F5E' },
  admin_approved:      { label: 'Admin Approved',  color: '#10B981' },
  admin_rejected:      { label: 'Admin Rejected',  color: '#F43F5E' },
  in_progress:         { label: 'In Progress',     color: '#8B5CF6' },
  completed:           { label: 'Completed',       color: '#10B981' },
  cancelled:           { label: 'Cancelled',       color: '#6B7280' },
};

// ─── Reason Modal ──────────────────────────────────────────────────────────────
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

// ─── Technician Table Row ──────────────────────────────────────────────────────
const TechRow = ({ profile, onApprove, onReject, onSuspend, onDetail, delay = 0 }) => {
  const u = profile.User;
  const sc = STATUS_CFG[profile.approval_status] || STATUS_CFG.pending;
  const rating = parseFloat(profile.rating || 0);

  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)', animation: `fadeSlideUp 0.3s ease-out ${delay}ms both`, cursor: 'pointer' }} onClick={() => onDetail(profile)}>
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.88rem', color: '#fff', flexShrink: 0 }}>
            {u?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{u?.name}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u?.email}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {(profile.specialization || []).slice(0, 2).map(s => (
            <span key={s} style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--blue)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '2px 8px', fontSize: '0.7rem', fontFamily: "'Inter', sans-serif" }}>{s}</span>
          ))}
          {(profile.specialization?.length || 0) > 2 && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>+{profile.specialization.length - 2}</span>}
        </div>
      </td>
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: 5 }, (_, i) => i < Math.round(rating)
            ? <StarSolid key={i} style={{ width: 12, height: 12, color: '#F59E0B' }} />
            : <span key={i} style={{ width: 12, height: 12, display: 'inline-block', background: 'var(--border-medium)', borderRadius: 2 }} />)}
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>{rating.toFixed(1)}</span>
        </div>
      </td>
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: 'var(--emerald)' }}>₹{profile.hourly_rate || '—'}/hr</span>
      </td>
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 20, padding: '3px 10px', fontSize: '0.73rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
          {sc.label}
        </span>
      </td>
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
          {profile.approval_status !== 'approved' && (
            <button onClick={() => onApprove(profile.user_id)}
              style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10B981', fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
              Approve
            </button>
          )}
          {profile.approval_status !== 'rejected' && (
            <button onClick={() => onReject(profile.user_id)}
              style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.06)', color: '#F43F5E', fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
              Reject
            </button>
          )}
          {profile.approval_status !== 'suspended' && (
            <button onClick={() => onSuspend(profile.user_id)}
              style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)', color: '#8B5CF6', fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
              Suspend
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Hire Request Row ──────────────────────────────────────────────────────────
const HireRequestRow = ({ hire, onApprove, onReject }) => {
  const hs = HIRE_STATUS[hire.status] || { label: hire.status, color: 'var(--text-muted)' };
  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <td style={{ padding: '13px 16px', fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>{hire.title}</td>
      <td style={{ padding: '13px 16px', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{hire.Requester?.name}<br/><span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{hire.Requester?.store_name}</span></td>
      <td style={{ padding: '13px 16px', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{hire.Technician?.name}</td>
      <td style={{ padding: '13px 16px' }}>
        <span style={{ background: `${hs.color}18`, color: hs.color, border: `1px solid ${hs.color}30`, borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{hs.label}</span>
      </td>
      <td style={{ padding: '13px 16px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: 'var(--emerald)', fontSize: '0.88rem' }}>
        ₹{Number(hire.estimated_cost || 0).toLocaleString('en-IN')}
      </td>
      <td style={{ padding: '13px 16px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {hire.status === 'technician_accepted' && (
            <>
              <button onClick={() => onApprove(hire.id)}
                style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10B981', fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
              <button onClick={() => onReject(hire.id)}
                style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.06)', color: '#F43F5E', fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminTechnicians = () => {
  const [tab, setTab] = useState('technicians');
  const [technicians, setTechnicians] = useState([]);
  const [hires, setHires] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null); // {type, id}

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;

      const [techRes, hiresRes, statsRes] = await Promise.all([
        adminAPI.getTechnicians(params),
        adminAPI.getAllHireRequests(),
        adminAPI.getTechnicianStats()
      ]);
      setTechnicians(techRes.data.data || []);
      setHires(hiresRes.data.data || []);
      setStats(statsRes.data);
    } catch (err) { toast.error('Failed to load technician data'); }
    finally { setLoading(false); }
  }, [search, filterStatus]);

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    try { await adminAPI.approveTechnician(id); toast.success('Technician approved!'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleConfirmReject = async (id, reason) => {
    try { await adminAPI.rejectTechnician(id, reason); toast.success('Technician rejected'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleConfirmSuspend = async (id, reason) => {
    try { await adminAPI.suspendTechnician(id, reason); toast.success('Technician suspended'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleApproveHire = async (id) => {
    try { await adminAPI.approveHireRequest(id); toast.success('Hire request approved!'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleRejectHireConfirm = async (id, reason) => {
    try { await adminAPI.rejectHireRequest(id, reason); toast.success('Hire request rejected'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const pendingHires = hires.filter(h => h.status === 'technician_accepted').length;

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Admin Panel" accentColor="var(--blue)" accentColorDim="rgba(59,130,246,0.12)" accentColorRing="rgba(59,130,246,0.2)">
      <PageHeader title="Technician Management" subtitle="Approve, reject, and monitor all technicians and hire requests platform-wide." icon={WrenchScrewdriverIcon} />

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatCard title="Total" value={stats.technicians?.total || 0} icon={WrenchScrewdriverIcon} variant="blue" loading={loading} />
          <StatCard title="Verified" value={stats.technicians?.verified || 0} icon={CheckCircleIcon} variant="emerald" loading={loading} />
          <StatCard title="Pending" value={stats.technicians?.pending || 0} icon={ClockIcon} variant="amber" loading={loading} />
          <StatCard title="Hire Requests" value={stats.hires?.total || 0} icon={ChartBarIcon} variant="violet" loading={loading} />
          <StatCard title="Active Hires" value={stats.hires?.active || 0} icon={UserCircleIcon} variant="blue" loading={loading} />
          <StatCard title="Completed" value={stats.hires?.completed || 0} icon={CheckCircleIcon} variant="emerald" loading={loading} />
        </div>
      )}

      {/* Tabs */}
      <div className="tab-group" style={{ display: 'inline-flex', marginBottom: 24 }}>
        <button className={`tab-btn${tab === 'technicians' ? ' active' : ''}`} onClick={() => setTab('technicians')}>
          All Technicians ({technicians.length})
        </button>
        <button className={`tab-btn${tab === 'hires' ? ' active' : ''}`} onClick={() => setTab('hires')}>
          Hire Requests ({hires.length})
          {pendingHires > 0 && <span style={{ marginLeft: 6, background: '#F59E0B', color: '#000', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>{pendingHires}</span>}
        </button>
      </div>

      {/* Technicians Tab */}
      {tab === 'technicians' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input id="tech-search" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()}
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 10, padding: '9px 12px 9px 36px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', boxSizing: 'border-box' }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 10, color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option><option value="approved">Approved</option>
              <option value="rejected">Rejected</option><option value="suspended">Suspended</option>
            </select>
            <button onClick={fetchData}
              style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>Search</button>
          </div>

          {loading ? (
            <div className="card-dark" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Loading technicians…</div>
          ) : technicians.length === 0 ? (
            <div className="card-dark" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <WrenchScrewdriverIcon style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'var(--text-secondary)' }}>No technicians found</p>
            </div>
          ) : (
            <div className="card-dark" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-medium)' }}>
                      {['Technician', 'Specializations', 'Rating', 'Rate', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {technicians.map((p, i) => (
                      <TechRow key={p.id} profile={p} delay={i * 40}
                        onApprove={(id) => handleApprove(id)}
                        onReject={(id) => setModal({ type: 'reject-tech', id })}
                        onSuspend={(id) => setModal({ type: 'suspend-tech', id })}
                        onDetail={(p) => { /* could open detail modal */ }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Hires Tab */}
      {tab === 'hires' && (
        <>
          {loading ? (
            <div className="card-dark" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Loading hire requests…</div>
          ) : hires.length === 0 ? (
            <div className="card-dark" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <ClockIcon style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'var(--text-secondary)' }}>No hire requests platform-wide</p>
            </div>
          ) : (
            <div className="card-dark" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-medium)' }}>
                      {['Job Title', 'Requester', 'Technician', 'Status', 'Cost', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
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
            </div>
          )}
        </>
      )}

      {/* Reason Modals */}
      {modal?.type === 'reject-tech' && (
        <ReasonModal title="Reject Technician" placeholder="Reason for rejection…"
          onConfirm={(reason) => handleConfirmReject(modal.id, reason)}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === 'suspend-tech' && (
        <ReasonModal title="Suspend Technician" placeholder="Reason for suspension…"
          onConfirm={(reason) => handleConfirmSuspend(modal.id, reason)}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === 'reject-hire' && (
        <ReasonModal title="Reject Hire Request" placeholder="Reason for rejection…"
          onConfirm={(reason) => handleRejectHireConfirm(modal.id, reason)}
          onClose={() => setModal(null)} />
      )}
    </DashboardLayout>
  );
};

export default AdminTechnicians;
