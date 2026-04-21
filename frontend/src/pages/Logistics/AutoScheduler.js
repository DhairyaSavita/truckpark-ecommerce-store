import React, { useState, useEffect, useCallback } from 'react';
import { schedulerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BoltIcon, ArrowPathIcon, Cog6ToothIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const VEHICLE_TYPES = ['Any', 'Light Truck', 'Heavy Truck', 'Flatbed', 'Refrigerated', 'Container', 'Tanker'];
const PRIORITIES    = ['low', 'normal', 'high', 'emergency'];

const AutoScheduler = () => {
  const [rules, setRules]     = useState([]);
  const [queue, setQueue]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [newRule, setNewRule] = useState({ vehicle_type: 'Any', min_rating: 3.5, priority: 'normal', max_distance_km: '', prefer_local: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, queueRes] = await Promise.all([schedulerAPI.getRules(), schedulerAPI.getQueue()]);
      setRules(rulesRes.data.data || []);
      setQueue(queueRes.data.data || []);
    } catch { toast.error('Failed to load scheduler data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveRule = async () => {
    try {
      const updated = [...rules, { ...newRule, id: Date.now() }];
      await schedulerAPI.saveRules(updated);
      setRules(updated);
      toast.success('✅ Auto-scheduling rule saved!');
    } catch { toast.error('Failed to save rule'); }
  };

  const handleRemoveRule = async (id) => {
    const updated = rules.filter(r => r.id !== id);
    await schedulerAPI.saveRules(updated);
    setRules(updated);
    toast.success('Rule removed');
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await schedulerAPI.runScheduler();
      setLastResult(res.data);
      toast.success(`🤖 Matched ${res.data.matched} shipment${res.data.matched !== 1 ? 's' : ''}`);
      load();
    } catch { toast.error('Scheduler run failed'); }
    finally { setRunning(false); }
  };

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 16, padding: 22 };
  const inp  = { background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 80 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.06), transparent)', borderBottom: '1px solid var(--border-subtle)', padding: '40px 32px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(139,92,246,0.35)' }}>
              <BoltIcon style={{ width: 30, height: 30, color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--text-primary)' }}>Auto-Scheduler</h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: 'var(--text-muted)' }}>Rule-based intelligent driver–shipment matching engine</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={load} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
              <ArrowPathIcon style={{ width: 16, height: 16 }} /> Refresh
            </button>
            <button onClick={handleRun} disabled={running || queue.length === 0}
              style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: queue.length > 0 ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)' : 'rgba(255,255,255,0.06)', color: queue.length > 0 ? '#fff' : 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', cursor: queue.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BoltIcon style={{ width: 17, height: 17 }} />
              {running ? 'Running…' : `Run Now (${queue.length} pending)`}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Rules Panel */}
        <div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14 }}>⚙️ Auto-Match Rules</h2>

          {/* Add rule form */}
          <div style={{ ...card, marginBottom: 16, borderColor: 'rgba(139,92,246,0.3)' }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 12 }}>New Rule</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>Vehicle Type</label>
                  <select style={inp} value={newRule.vehicle_type} onChange={e => setNewRule(r => ({ ...r, vehicle_type: e.target.value }))}>
                    {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>Priority</label>
                  <select style={inp} value={newRule.priority} onChange={e => setNewRule(r => ({ ...r, priority: e.target.value }))}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>Min. Driver Rating</label>
                  <input type="number" min="1" max="5" step="0.5" style={inp} value={newRule.min_rating} onChange={e => setNewRule(r => ({ ...r, min_rating: parseFloat(e.target.value) }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>Max Distance (km)</label>
                  <input type="number" style={inp} placeholder="No limit" value={newRule.max_distance_km} onChange={e => setNewRule(r => ({ ...r, max_distance_km: e.target.value }))} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={newRule.prefer_local} onChange={e => setNewRule(r => ({ ...r, prefer_local: e.target.checked }))} />
                Prefer local drivers (same city as pickup)
              </label>
              <button onClick={handleSaveRule}
                style={{ padding: '9px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                + Add Rule
              </button>
            </div>
          </div>

          {/* Saved rules */}
          {rules.length === 0 ? (
            <div style={{ ...card, padding: 32, textAlign: 'center' }}>
              <Cog6ToothIcon style={{ width: 32, height: 32, color: 'var(--text-muted)', margin: '0 auto 10px' }} />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>No rules yet. Add your first auto-match rule above.</p>
            </div>
          ) : rules.map((r, i) => (
            <div key={r.id || i} style={{ ...card, display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  {r.vehicle_type || 'Any Vehicle'} · Priority: {r.priority}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>⭐ Min rating: {r.min_rating}</span>
                  {r.max_distance_km && <span>📏 Max: {r.max_distance_km}km</span>}
                  {r.prefer_local && <span>📍 Local preferred</span>}
                </div>
              </div>
              <button onClick={() => handleRemoveRule(r.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, padding: '5px 12px', color: '#EF4444', cursor: 'pointer', fontSize: '0.78rem' }}>Remove</button>
            </div>
          ))}
        </div>

        {/* Queue & Result Panel */}
        <div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14 }}>⏳ Assignment Queue</h2>

          {lastResult && (
            <div style={{ ...card, marginBottom: 16, borderColor: lastResult.matched > 0 ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.3)', background: lastResult.matched > 0 ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircleIcon style={{ width: 20, height: 20, color: lastResult.matched > 0 ? '#10B981' : '#F59E0B' }} />
                <div>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Last Run Result</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)' }}>{lastResult.matched} shipment{lastResult.matched !== 1 ? 's' : ''} auto-assigned{lastResult.message ? ` · ${lastResult.message}` : ''}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} style={{ ...card, height: 80, animation: 'pulse 1.5s infinite', marginBottom: 10 }} />)
          ) : queue.length === 0 ? (
            <div style={{ ...card, padding: 40, textAlign: 'center' }}>
              <CheckCircleIcon style={{ width: 36, height: 36, color: '#10B981', margin: '0 auto 10px' }} />
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Queue is Clear!</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-muted)' }}>All confirmed shipments have been assigned to drivers.</p>
            </div>
          ) : queue.map(s => (
            <div key={s.id} style={{ ...card, marginBottom: 10 }}>
              <div style={{ display: 'flex', justify: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 4 }}>Shipment #{s.id}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'var(--text-secondary)' }}>📍 {s.pickup_address} → 🏁 {s.delivery_address}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Customer: {s.Customer?.name} · {s.weight_kg}kg · {s.shipment_type}</p>
                </div>
                <span style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700, whiteSpace: 'nowrap' }}>⏳ Unassigned</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoScheduler;
