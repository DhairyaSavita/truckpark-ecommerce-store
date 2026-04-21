import React, { useState, useEffect, useCallback } from 'react';
import { vendorTechnicianAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  WrenchScrewdriverIcon, MagnifyingGlassIcon, StarIcon,
  UserGroupIcon,
  CheckCircleIcon, XMarkIcon, BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';

const NAV_ITEMS = [
  { divider: 'Vendor Hub' },
  { label: 'Find Technicians', to: '/vendor/technicians', icon: WrenchScrewdriverIcon },
  { label: 'My Hires', to: '/vendor/technicians', icon: BriefcaseIcon },
  { label: 'Appointed', to: '/vendor/technicians', icon: UserGroupIcon },
];

const STATUS_MAP = {
  pending:             { label: 'Pending',       cls: 'badge-amber' },
  technician_accepted: { label: 'Accepted',      cls: 'badge-blue' },
  technician_rejected: { label: 'Declined',      cls: 'badge-rose' },
  admin_approved:      { label: 'Admin OK',      cls: 'badge-green' },
  admin_rejected:      { label: 'Admin Rejected', cls: 'badge-rose' },
  in_progress:         { label: 'In Progress',   cls: 'badge-violet' },
  completed:           { label: 'Completed',     cls: 'badge-green' },
  cancelled:           { label: 'Cancelled',     cls: 'badge-rose' },
};

// ─── Hire Modal ────────────────────────────────────────────────────────────────
const HireModal = ({ profile, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    technician_id: profile?.User?.id,
    service_type: profile?.specialization?.[0] || '',
    title: '', description: '', service_location: '',
    scheduled_date: '', scheduled_time: '', estimated_hours: 1, priority: 'normal', requester_notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await vendorTechnicianAPI.hire(form);
      toast.success('Hire request sent to technician!');
      onSuccess?.(); onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to send hire request'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 20, padding: 32, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
            Hire — {profile?.User?.name}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <XMarkIcon style={{ width: 22, height: 22, color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 5 }}>Service Type *</label>
              <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                {(profile?.specialization || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 5 }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 5 }}>Job Title *</label>
            <input required placeholder="e.g. Engine Repair for Truck #KA21" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 5 }}>Description *</label>
            <textarea required rows={3} placeholder="Describe the work needed in detail" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 5 }}>Service Location *</label>
            <input required placeholder="Full service address" value={form.service_location} onChange={e => setForm(f => ({ ...f, service_location: e.target.value }))}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 5 }}>Date</label>
              <input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 5 }}>Time</label>
              <input type="time" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 5 }}>Hours</label>
              <input type="number" min={0.5} step={0.5} value={form.estimated_hours} onChange={e => setForm(f => ({ ...f, estimated_hours: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 10px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }} />
            </div>
          </div>
          {form.estimated_hours && profile?.hourly_rate && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Estimated Cost</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 800, color: 'var(--emerald)' }}>
                ₹{(parseFloat(form.estimated_hours) * parseFloat(profile.hourly_rate)).toLocaleString('en-IN')}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting}
              style={{ flex: 2, padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Sending…' : 'Send Hire Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Technician Card ───────────────────────────────────────────────────────────
const TechCard = ({ profile, onHire, onAppoint, isAppointed }) => {
  const u = profile.User;
  const rating = parseFloat(profile.rating || 0);
  return (
    <div className="card-dark" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeSlideUp 0.35s both' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#fff', flexShrink: 0 }}>
          {u?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{u?.name}</h3>
            {isAppointed && <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '2px 8px', fontSize: '0.7rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Appointed</span>}
          </div>
          <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
            {Array.from({ length: 5 }, (_, i) => i < Math.round(rating)
              ? <StarSolid key={i} style={{ width: 11, height: 11, color: '#F59E0B' }} />
              : <StarIcon key={i} style={{ width: 11, height: 11, color: 'var(--border-medium)' }} />)}
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 4 }}>{rating.toFixed(1)} · {profile.total_jobs} jobs</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {(profile.specialization || []).slice(0, 3).map(s => <span key={s} style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--blue)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '2px 8px', fontSize: '0.7rem', fontFamily: "'Inter', sans-serif" }}>{s}</span>)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'var(--emerald)' }}>₹{profile.hourly_rate}/hr</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>{profile.experience_years}y exp</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onHire(profile)} disabled={!profile.is_available}
          style={{ flex: 2, padding: '9px', borderRadius: 8, border: 'none', background: profile.is_available ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'var(--bg-input)', color: profile.is_available ? '#fff' : 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', fontWeight: 700, cursor: profile.is_available ? 'pointer' : 'not-allowed' }}>
          {profile.is_available ? 'Hire' : 'Busy'}
        </button>
        <button onClick={() => onAppoint(profile)}
          style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1px solid ${isAppointed ? 'rgba(244,63,94,0.3)' : 'var(--border-medium)'}`, background: isAppointed ? 'rgba(244,63,94,0.06)' : 'transparent', color: isAppointed ? '#F43F5E' : 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
          {isAppointed ? 'Unappoint' : 'Appoint'}
        </button>
      </div>
    </div>
  );
};

// ─── Hire Row ──────────────────────────────────────────────────────────────────
const HireRow = ({ hire, onApprove, onCancel }) => {
  const st = STATUS_MAP[hire.status] || STATUS_MAP.pending;
  const tech = hire.Technician;
  return (
    <div className="card-dark" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{hire.title}</h4>
          <span className={`badge ${st.cls}`}>{st.label}</span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {tech?.name} · ₹{Number(hire.estimated_cost || 0).toLocaleString('en-IN')} est. · {hire.service_type}
        </p>
      </div>
      {hire.status === 'completed' && !hire.requester_completion_approval && (
        <button onClick={() => onApprove(hire.id)}
          style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
          Approve Work
        </button>
      )}
      {['pending', 'technician_accepted'].includes(hire.status) && (
        <button onClick={() => onCancel(hire.id)}
          style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.06)', color: '#F43F5E', fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
          Cancel
        </button>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const VendorTechnicians = () => {
  const [tab, setTab] = useState('browse');
  const [technicians, setTechnicians] = useState([]);
  const [hires, setHires] = useState([]);
  const [appointed, setAppointed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hireModal, setHireModal] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [techRes, hiresRes, appointedRes] = await Promise.all([
        vendorTechnicianAPI.getAvailable({ search }),
        vendorTechnicianAPI.getMyHires(),
        vendorTechnicianAPI.getAppointed()
      ]);
      setTechnicians(techRes.data.data || []);
      setHires(hiresRes.data.data || []);
      setAppointed(appointedRes.data.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [search]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAll(); }, []);

  const handleAppoint = async (profile) => {
    const isAppointed = appointed.some(a => a.user_id === profile.user_id);
    try {
      if (isAppointed) {
        await vendorTechnicianAPI.removeAppoint(profile.User.id);
        toast.success('Technician unappointed');
      } else {
        await vendorTechnicianAPI.appoint(profile.User.id);
        toast.success('Technician appointed to your account!');
      }
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Action failed'); }
  };

  const handleApproveWork = async (id) => {
    try { await vendorTechnicianAPI.approveCompletion(id); toast.success('Work approved! Payment released.'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleCancelHire = async (id) => {
    try { await vendorTechnicianAPI.cancelHire(id, 'Cancelled by vendor'); toast.success('Hire cancelled'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to cancel'); }
  };

  const activeHires = hires.filter(h => ['pending', 'technician_accepted', 'admin_approved', 'in_progress'].includes(h.status)).length;
  const completedHires = hires.filter(h => h.status === 'completed').length;

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Vendor Hub" accentColor="var(--blue)" accentColorDim="rgba(59,130,246,0.12)" accentColorRing="rgba(59,130,246,0.2)">
      <PageHeader title="Technician Management" subtitle="Browse, hire, and manage technicians for your service operations." icon={WrenchScrewdriverIcon} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard title="Available" value={technicians.length} icon={WrenchScrewdriverIcon} variant="blue" loading={loading} />
        <StatCard title="Appointed" value={appointed.length} icon={UserGroupIcon} variant="violet" loading={loading} />
        <StatCard title="Active Hires" value={activeHires} icon={BriefcaseIcon} variant="amber" loading={loading} />
        <StatCard title="Completed" value={completedHires} icon={CheckCircleIcon} variant="emerald" loading={loading} />
      </div>

      {/* Tabs */}
      <div className="tab-group" style={{ display: 'inline-flex', marginBottom: 24 }}>
        {[['browse', 'Browse Technicians'], ['hires', `My Hires (${hires.length})`], ['appointed', `Appointed (${appointed.length})`]].map(([k, l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* Browse Tab */}
      {tab === 'browse' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input placeholder="Search technicians…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchAll()}
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 10, padding: '10px 12px 10px 36px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', boxSizing: 'border-box' }} />
            </div>
            <button onClick={fetchAll}
              style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>Search</button>
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Loading…</div>
            : technicians.length === 0 ? (
              <div className="card-dark" style={{ padding: '40px 24px', textAlign: 'center' }}>
                <WrenchScrewdriverIcon style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'var(--text-secondary)' }}>No verified technicians found</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {technicians.map(p => (
                  <TechCard key={p.id} profile={p} onHire={setHireModal} isAppointed={appointed.some(a => a.user_id === p.user_id)} onAppoint={handleAppoint} />
                ))}
              </div>
            )}
        </>
      )}

      {/* Hires Tab */}
      {tab === 'hires' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {hires.length === 0 ? (
            <div className="card-dark" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <BriefcaseIcon style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 10px' }} />
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'var(--text-secondary)' }}>No hire requests yet</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>Browse technicians and send a hire request to get started.</p>
            </div>
          ) : hires.map(h => <HireRow key={h.id} hire={h} onApprove={handleApproveWork} onCancel={handleCancelHire} />)}
        </div>
      )}

      {/* Appointed Tab */}
      {tab === 'appointed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {appointed.length === 0 ? (
            <div className="card-dark" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <UserGroupIcon style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 10px' }} />
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'var(--text-secondary)' }}>No appointed technicians</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>Appoint a technician from the Browse tab to add them here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {appointed.map(p => <TechCard key={p.id} profile={p} onHire={setHireModal} isAppointed onAppoint={handleAppoint} />)}
            </div>
          )}
        </div>
      )}

      {hireModal && <HireModal profile={hireModal} onClose={() => setHireModal(null)} onSuccess={fetchAll} />}
    </DashboardLayout>
  );
};

export default VendorTechnicians;
