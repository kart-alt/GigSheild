import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ─── Policy definitions (mirrors backend catalog) ─────────────────
const POLICIES = [
  {
    type: 'Monsoon Shield',
    icon: '🌧️',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #1a2744 100%)',
    border: 'rgba(59,130,246,0.35)',
    glow: 'rgba(59,130,246,0.15)',
    covers: 'Heavy rainfall & waterlogging that makes deliveries impossible or dangerous.',
    trigger: 'Rainfall > 15mm/hr via OpenWeatherMap',
    basePremium: 49,
    maxPayout: 400,
    riskLabel: 'MONSOON RISK',
  },
  {
    type: 'Clean Air Guard',
    icon: '💨',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #1a3a2a 0%, #152e20 100%)',
    border: 'rgba(34,197,94,0.35)',
    glow: 'rgba(34,197,94,0.15)',
    covers: 'Hazardous air pollution (AQI > 300) that puts your health at risk outdoors.',
    trigger: 'AQI > 300 via WAQI / OpenAQ',
    basePremium: 45,
    maxPayout: 300,
    riskLabel: 'AQI RISK',
  },
  {
    type: 'Technical Shock',
    icon: '⚡',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #3a2a0a 0%, #2e2008 100%)',
    border: 'rgba(245,158,11,0.35)',
    glow: 'rgba(245,158,11,0.15)',
    covers: 'Platform server outages (Swiggy/Zomato/Blinkit) lasting more than 30 minutes.',
    trigger: 'HTTP 500 errors for > 30 mins via synthetic pings',
    basePremium: 43,
    maxPayout: 350,
    riskLabel: 'OUTAGE RISK',
  },
  {
    type: 'Zone Closure',
    icon: '🚧',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #3a1a1a 0%, #2e1414 100%)',
    border: 'rgba(239,68,68,0.35)',
    glow: 'rgba(239,68,68,0.15)',
    covers: 'Bandhs, strikes, curfews, or road blocks preventing you from working your zone.',
    trigger: 'NewsAPI NLP + traffic anomaly detection',
    basePremium: 52,
    maxPayout: 400,
    riskLabel: 'ZONE RISK',
  },
];

const EXCLUSIONS = [
  'War or armed conflict',
  'Pandemic or epidemic',
  'Terrorism or civil unrest',
  'Nuclear events',
  'Government-declared national emergency',
];

// ─── Coverage window helper ────────────────────────────────────────
function getCoverageLabel() {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} 12:00 AM — ${fmt(sunday)} 11:59 PM`;
}

// ─── Inline styles ────────────────────────────────────────────────
const pageStyle = {
  minHeight: 'calc(100vh - 72px)',
  background: 'linear-gradient(160deg, #0d0d1a 0%, #111827 60%, #0a0f1a 100%)',
  padding: '48px 40px',
  fontFamily: "'DM Sans', sans-serif",
};

const headerStyle = {
  marginBottom: '40px',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: '24px',
  maxWidth: '1200px',
};

const tagStyle = (color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '1px',
  color,
  background: color + '22',
  border: '1px solid ' + color + '44',
  marginBottom: '16px',
});

export default function PolicySelection() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [activePolicies, setActivePolicies] = useState({}); // { policyType: policyRecord }
  const [loadingType, setLoadingType] = useState(null);
  const [expandedExclusions, setExpandedExclusions] = useState({});
  const [toast, setToast] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const coverageLabel = getCoverageLabel();

  // Load worker from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('gigshield_worker');
    if (!stored) { navigate('/register'); return; }
    const w = JSON.parse(stored);
    setWorker(w);
    fetchPolicies(w.id);
  }, []);

  // Fetch active policies from backend
  const fetchPolicies = async (workerId) => {
    try {
      const res = await fetch(API + '/api/policy/worker/' + workerId);
      const data = await res.json();
      if (data.success) {
        const map = {};
        data.policies.forEach((p) => {
          if (p.status === 'active') map[p.policyType] = p;
        });
        setActivePolicies(map);
      }
    } catch (err) {
      console.warn('Could not fetch policies (backend may be offline):', err.message);
    }
  };

  // Activate a policy
  const activatePolicy = async (policy) => {
    if (!worker) return;
    setLoadingType(policy.type);
    try {
      const res = await fetch(API + '/api/policy/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker.id,
          policyType: policy.type,
          premiumPaid: policy.basePremium,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActivePolicies((prev) => ({ ...prev, [policy.type]: data.policy }));
        showToast('✅ ' + policy.type + ' activated! Coverage starts immediately.', 'success');
      } else if (res.status === 409) {
        showToast('ℹ️ ' + policy.type + ' is already active this week.', 'info');
        fetchPolicies(worker.id);
      } else {
        showToast('⚠️ ' + (data.error || 'Failed to activate'), 'error');
      }
    } catch {
      // Demo fallback — simulate activation
      const mockPolicy = { id: 'mock-' + Date.now(), policyType: policy.type, status: 'active', premiumPaid: policy.basePremium };
      setActivePolicies((prev) => ({ ...prev, [policy.type]: mockPolicy }));
      showToast('✅ ' + policy.type + ' activated! (demo mode)', 'success');
    } finally {
      setLoadingType(null);
    }
  };

  // Cancel a policy
  const cancelPolicy = async (policy) => {
    const record = activePolicies[policy.type];
    if (!record) return;
    setLoadingType(policy.type);
    try {
      const res = await fetch(API + '/api/policy/' + record.id, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActivePolicies((prev) => { const n = { ...prev }; delete n[policy.type]; return n; });
        showToast('🗑️ ' + policy.type + ' cancelled.', 'info');
      } else {
        showToast('⚠️ ' + (data.error || 'Failed to cancel'), 'error');
      }
    } catch {
      setActivePolicies((prev) => { const n = { ...prev }; delete n[policy.type]; return n; });
      showToast('🗑️ ' + policy.type + ' cancelled. (demo mode)', 'info');
    } finally {
      setLoadingType(null);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleExclusions = (type) => {
    setExpandedExclusions((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const activeCount = Object.keys(activePolicies).length;

  return (
    <div style={pageStyle}>
      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '88px', right: '24px', zIndex: 1000,
          padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
          background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
          border: '1px solid ' + (toast.type === 'success' ? 'rgba(34,197,94,0.4)' : toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)'),
          color: toast.type === 'success' ? '#4ade80' : toast.type === 'error' ? '#f87171' : '#60a5fa',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.3s ease-out',
          maxWidth: '360px',
        }}>
          {toast.message}
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px' }}>🛡️</span>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
                Choose Your Coverage
              </h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', margin: 0 }}>
              Parametric insurance — no claim forms, automatic payouts within minutes.
            </p>
          </div>

          {/* Summary pill */}
          <div style={{
            padding: '12px 20px', borderRadius: '12px',
            background: activeCount > 0 ? 'rgba(232,83,60,0.12)' : 'rgba(255,255,255,0.05)',
            border: '1px solid ' + (activeCount > 0 ? 'rgba(232,83,60,0.3)' : 'rgba(255,255,255,0.1)'),
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: activeCount > 0 ? '#e8533c' : 'rgba(255,255,255,0.3)' }}>
              {activeCount} / 4
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Policies Active
            </div>
            {activeCount > 0 && (
              <div style={{ fontSize: '12px', color: '#e8533c', marginTop: '4px' }}>
                ₹{POLICIES.filter(p => activePolicies[p.type]).reduce((s, p) => s + p.basePremium, 0)}/week
              </div>
            )}
          </div>
        </div>

        {/* Coverage window banner */}
        <div style={{
          marginTop: '20px', padding: '10px 16px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.5)',
        }}>
          <span>📅</span>
          <span>Current coverage window: <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{coverageLabel}</strong></span>
        </div>

        {/* Worker greeting */}
        {worker && (
          <div style={{
            marginTop: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.35)',
          }}>
            Logged in as <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{worker.name || worker.phone}</strong>
            {worker.zone && <span> · {worker.zone}</span>}
            {worker.platform && <span> · {worker.platform}</span>}
          </div>
        )}
      </div>

      {/* ── Policy Cards Grid ── */}
      <div style={gridStyle}>
        {POLICIES.map((policy) => {
          const isActive = !!activePolicies[policy.type];
          const isLoading = loadingType === policy.type;
          const isHovered = hoveredCard === policy.type;
          const exclusionsOpen = expandedExclusions[policy.type];

          return (
            <div
              key={policy.type}
              onMouseEnter={() => setHoveredCard(policy.type)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: isActive ? policy.gradient : 'rgba(255,255,255,0.03)',
                border: '1px solid ' + (isActive ? policy.border : isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'),
                borderRadius: '20px',
                padding: '28px',
                transition: 'all 0.25s ease',
                transform: isHovered ? 'translateY(-4px)' : 'none',
                boxShadow: isActive
                  ? '0 0 0 1px ' + policy.border + ', 0 20px 40px ' + policy.glow
                  : isHovered ? '0 12px 40px rgba(0,0,0,0.3)' : 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Active shimmer overlay */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: 'linear-gradient(90deg, transparent, ' + policy.color + ', transparent)',
                }} />
              )}

              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px', fontSize: '22px',
                    background: policy.color + '22', border: '1px solid ' + policy.color + '44',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {policy.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px' }}>
                      {policy.type}
                    </div>
                    <div style={tagStyle(policy.color)}>
                      ⬤ {policy.riskLabel}
                    </div>
                  </div>
                </div>

                {/* Active badge */}
                {isActive && (
                  <div style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                    color: policy.color, background: policy.color + '22', border: '1px solid ' + policy.color + '44',
                    whiteSpace: 'nowrap',
                  }}>
                    ✓ ACTIVE
                  </div>
                )}
              </div>

              {/* Coverage description */}
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.6', marginBottom: '20px' }}>
                {policy.covers}
              </p>

              {/* Trigger oracle */}
              <div style={{
                padding: '10px 14px', borderRadius: '10px', marginBottom: '20px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                fontSize: '12px', color: 'rgba(255,255,255,0.4)',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: '6px' }}>ORACLE TRIGGER:</span>
                <span style={{ color: policy.color + 'cc' }}>{policy.trigger}</span>
              </div>

              {/* Premium / Payout row */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  flex: 1, padding: '12px', borderRadius: '10px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: policy.color }}>
                    ₹{policy.basePremium}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>
                    Weekly Premium
                  </div>
                </div>
                <div style={{
                  flex: 1, padding: '12px', borderRadius: '10px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>
                    ₹{policy.maxPayout}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>
                    Max Payout
                  </div>
                </div>
                <div style={{
                  flex: 1, padding: '12px', borderRadius: '10px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                    Mon–Sun
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>
                    Coverage
                  </div>
                </div>
              </div>

              {/* Exclusions accordion */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={() => toggleExclusions(policy.type)}
                  style={{
                    background: 'none', border: 'none', padding: '0', cursor: 'pointer',
                    fontSize: '12px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '6px',
                    fontFamily: "'DM Sans', sans-serif", fontWeight: '600', letterSpacing: '0.3px',
                  }}
                >
                  <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: exclusionsOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
                  EXCLUSIONS ({EXCLUSIONS.length})
                </button>

                {exclusionsOpen && (
                  <div style={{ marginTop: '10px', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {EXCLUSIONS.map((ex, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: i < EXCLUSIONS.length - 1 ? '6px' : '0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        <span style={{ color: 'rgba(239,68,68,0.6)', flexShrink: 0 }}>✕</span>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                id={'btn-policy-' + policy.type.replace(/\s+/g, '-').toLowerCase()}
                onClick={() => isActive ? cancelPolicy(policy) : activatePolicy(policy)}
                disabled={isLoading}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', fontWeight: '700', fontSize: '14px',
                  border: isActive ? '1px solid ' + policy.border : 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  background: isLoading ? 'rgba(255,255,255,0.08)' : isActive ? 'transparent' : 'linear-gradient(135deg, ' + policy.color + ', ' + policy.color + 'cc)',
                  color: isLoading ? 'rgba(255,255,255,0.3)' : isActive ? policy.color : '#fff',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.3px',
                }}
              >
                {isLoading
                  ? (isActive ? 'Cancelling…' : 'Activating…')
                  : isActive
                    ? '✓ Active — Click to Cancel'
                    : 'Activate for ₹' + policy.basePremium + '/week'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Footer note ── */}
      <div style={{
        marginTop: '40px', padding: '16px 20px', borderRadius: '12px', maxWidth: '1200px',
        background: 'rgba(232,83,60,0.06)', border: '1px solid rgba(232,83,60,0.15)',
        fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6',
      }}>
        💡 <strong style={{ color: 'rgba(232,83,60,0.8)' }}>How it works:</strong> Premiums shown are base rates.
        Your actual premium is dynamically calculated using live weather, AQI, and zone risk data —
        see the <button onClick={() => navigate('/premium')} style={{ background: 'none', border: 'none', color: '#e8533c', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: '700', padding: '0' }}>Premium Calculator</button> for the full breakdown.
        Payouts are automatic — no claim forms ever needed.
      </div>
    </div>
  );
}
