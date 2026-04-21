import React, { useState, useEffect, useCallback } from 'react';
import { fleetAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  TruckIcon, ArrowPathIcon, CheckCircleIcon, ClockIcon,
} from '@heroicons/react/24/outline';

const STATUS_STYLES = {
  assigned:  { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: '📋 Assigned', emoji: '📋' },
  en_route:  { bg: 'rgba(249,115,22,0.12)', color: '#F97316', label: '🚛 En Route', emoji: '🚛' },
  completed: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: '✅ Completed', emoji: '✅' },
  cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', label: '❌ Cancelled', emoji: '❌' },
};

const RouteMap = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fleetAPI.getMyAssignment();
      setAssignments(res.data.data || []);
    } catch {
      toast.error('Failed to load route assignments');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await fleetAPI.updateMyStatus(id, newStatus);
      toast.success(`Status updated: ${newStatus}`);
      load();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 18, padding: 24, transition: 'box-shadow 0.2s' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 80 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(239,68,68,0.06), transparent)', borderBottom: '1px solid var(--border-subtle)', padding: '40px 32px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #F97316, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}>
            <TruckIcon style={{ width: 30, height: 30, color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--text-primary)' }}>My Route Map</h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: 'var(--text-muted)' }}>Your current and recent fleet assignments</p>
          </div>
          <button onClick={load} style={{ marginLeft: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <ArrowPathIcon style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 32px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ ...card, height: 160, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : assignments.length === 0 ? (
          <div style={{ ...card, padding: 64, textAlign: 'center' }}>
            <TruckIcon style={{ width: 48, height: 48, color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 8 }}>No Active Assignments</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>You'll see your route details here once a logistics partner assigns you a delivery.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assignments.map(a => {
              const st = STATUS_STYLES[a.status] || STATUS_STYLES.assigned;
              const route = a.route_details || {};
              return (
                <div key={a.id} style={{ ...card }}>
                  {/* Status & Meta */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}40`, borderRadius: 20, padding: '3px 12px', fontSize: '0.75rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{st.label}</span>
                        {a.priority === 'emergency' && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', color: '#EF4444', fontWeight: 800 }}>🚨 EMERGENCY</span>}
                        {a.is_auto_assigned && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: '#8B5CF6', background: 'rgba(139,92,246,0.1)', borderRadius: 20, padding: '2px 8px' }}>🤖 Auto-assigned</span>}
                      </div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Assignment #{a.id} · {a.Logistics ? `From: ${a.Logistics.name}` : 'Logistics Partner'} · {a.Logistics?.phone && `📞 ${a.Logistics.phone}`}
                      </p>
                    </div>
                    {a.eta && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', borderRadius: 10, padding: '6px 12px', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <ClockIcon style={{ width: 14, height: 14, color: '#F59E0B' }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#F59E0B', fontWeight: 600 }}>ETA: {new Date(a.eta).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Route Visual */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 18px', border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>PICKUP</p>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>📍 {route.pickup || 'TBD'}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'var(--border-medium)' }}>
                      <div style={{ width: 40, height: 2, background: 'var(--border-medium)' }} />
                      {route.distance_km && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: 'var(--text-muted)' }}>{route.distance_km} km</span>}
                      <div style={{ width: 40, height: 2, background: 'var(--border-medium)' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>DROP-OFF</p>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>🏁 {route.dropoff || 'TBD'}</p>
                    </div>
                  </div>

                  {/* Cargo & Notes */}
                  {(route.cargo_type || a.notes) && (
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                      {route.cargo_type && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)' }}>📦 Cargo: {route.cargo_type}</p>}
                      {a.notes && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)' }}>📝 {a.notes}</p>}
                    </div>
                  )}

                  {/* Actions */}
                  {['assigned', 'en_route'].includes(a.status) && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {a.status === 'assigned' && (
                        <button onClick={() => updateStatus(a.id, 'en_route')} disabled={updating === a.id}
                          style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #F97316, #EF4444)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                          🚛 Start Journey
                        </button>
                      )}
                      {a.status === 'en_route' && (
                        <button onClick={() => updateStatus(a.id, 'completed')} disabled={updating === a.id}
                          style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                          ✅ Mark Delivered
                        </button>
                      )}
                    </div>
                  )}
                  {a.status === 'completed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
                      <CheckCircleIcon style={{ width: 18, height: 18, color: '#10B981' }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#10B981', fontWeight: 600 }}>Delivery completed{a.completed_at ? ` on ${new Date(a.completed_at).toLocaleDateString()}` : ''}.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteMap;
