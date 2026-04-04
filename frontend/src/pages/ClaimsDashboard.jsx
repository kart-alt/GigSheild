import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ─── Status Badge Component ──────────────────────────────────────
function StatusBadge({ status }) {
  const isApproved = status === 'approved';
  return (
    <span style={{
      padding: '4px 10px', borderRadius: '20px', fontSize: '10px',
      fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase',
      background: isApproved ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
      color: isApproved ? '#4ade80' : 'rgba(255,255,255,0.3)',
      border: '1px solid ' + (isApproved ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'),
    }}>
      {status}
    </span>
  );
}

// ─── Feed Card Component ──────────────────────────────────────────
function FeedCard({ claim }) {
  const time = new Date(claim.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const name = claim.worker?.name || 'Worker# ' + (claim.workerId || 'anon').slice(0,4);
  const location = claim.worker?.zone || 'India';
  const platform = claim.worker?.platform || 'Delivery';

  return (
    <div style={{
      padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)', marginBottom: '12px',
      display: 'flex', gap: '12px', alignItems: 'flex-start',
      animation: 'fadeInUp 0.4s ease-out',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: 'rgba(232,83,60,0.15)', border: '1px solid rgba(232,83,60,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
      }}>
        {claim.policyType?.includes('Rain') || claim.policyType?.includes('Monsoon') ? '🌧️' : 
         claim.policyType?.includes('Air') || claim.policyType?.includes('AQI') ? '💨' : 
         claim.policyType?.includes('Technical') || claim.policyType?.includes('Outage') ? '⚡' : '🛡️'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{name}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{time}</div>
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '4px' }}>
          {location} · {platform} policy claim
        </div>
        <div style={{ fontSize: '14px', fontWeight: '800', color: '#e8533c' }}>
          ₹{claim.payoutAmount} <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: '400' }}>Sent Instantly</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function ClaimsDashboard() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [myClaims, setMyClaims] = useState([]);
  const [liveClaims, setLiveClaims] = useState([]);
  const [myPolicies, setMyPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('gigshield_worker');
    if (!stored) {
      navigate('/register');
      return;
    }
    const w = JSON.parse(stored);
    setWorker(w);
    initData(w.id);
    
    // Polling live claims feed
    const interval = setInterval(() => fetchLiveClaims(), 10000);
    return () => clearInterval(interval);
  }, []);

  const initData = async (workerId) => {
    setLoading(true);
    await Promise.all([
      fetchMyClaims(workerId),
      fetchLiveClaims(),
      fetchMyPolicies(workerId),
    ]);
    setLoading(false);
  };

  const fetchMyClaims = async (workerId) => {
    try {
      const res = await fetch(API + '/api/claims/worker/' + workerId);
      const data = await res.json();
      if (data.success) setMyClaims(data.claims);
    } catch (err) { console.warn('Worker claims fetch failed:', err); }
  };

  const fetchLiveClaims = async () => {
    try {
      const res = await fetch(API + '/api/claims/live');
      const data = await res.json();
      if (data.success) setLiveClaims(data.claims);
    } catch (err) { console.warn('Live feed fetch failed:', err); }
  };

  const fetchMyPolicies = async (workerId) => {
    try {
      const res = await fetch(API + '/api/policy/worker/' + workerId);
      const data = await res.json();
      if (data.success) {
        setMyPolicies(data.policies.filter(p => p.status === 'active'));
      }
    } catch (err) { console.warn('Policy fetch failed:', err); }
  };

  const triggerSimulation = async (policy) => {
    setSimulating(policy.type);
    try {
      const res = await fetch(API + '/api/claims/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker.id,
          policyType: policy.policyType,
          triggerReason: 'Simulated Disruption (Demo Trigger)',
          triggerValue: 'Sensor 88.4',
          payoutAmount: 350,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('⚡ ZERO-TOUCH PAYOUT! ₹' + data.claim.payoutAmount + ' sent to UPI.', 'success');
        fetchMyClaims(worker.id);
        fetchLiveClaims();
      } else {
        showToast('⚠️ ' + data.error, 'error');
      }
    } catch (err) {
      showToast('❌ Simulation failed.', 'error');
    } finally {
      setSimulating(null);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      background: 'linear-gradient(160deg, #0d0d1a 0%, #111827 60%, #0a0f1a 100%)',
      padding: '48px 40px', fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* ── Confetti/Toast Simulation ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '88px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, padding: '16px 24px', borderRadius: '16px', fontWeight: '800',
          background: toast.type === 'success' ? '#e8533c' : 'rgba(239,68,68,0.95)',
          color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(232,83,60,0.3)',
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          <span>{toast.type === 'success' ? '🎊' : '⚠️'}</span>
          {toast.message}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '28px' }}>📋</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
            Claims Dashboard
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: 0 }}>
          Parametric oracles monitor conditions 24/7. No paperwork, just instant payouts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '40px' }}>
        
        {/* ── LEFT COLUMN: MY CLAIMS + TRIGGER ── */}
        <div>
          {/* Simulation Trigger Card */}
          <div style={{
            padding: '24px', borderRadius: '20px', marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(232,83,60,0.1), rgba(255,255,255,0.03))',
            border: '1px solid rgba(232,83,60,0.3)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#e8533c' }}>⚡</span> Test Zero-Touch Payout
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.6', marginBottom: '20px' }}>
              For hackathon demo: Pick one of your active policies to simulate a parametric event (e.g. heavy rain) and trigger an instant payout.
            </p>
            
            {myPolicies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '12px' }}>No active policies found.</p>
                <button onClick={() => navigate('/policies')} style={{
                  padding: '8px 16px', borderRadius: '8px', background: '#e8533c', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer',
                }}>Go to Policies</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {myPolicies.map(p => (
                  <button
                    key={p.id}
                    disabled={simulating === p.policyType}
                    onClick={() => triggerSimulation(p)}
                    style={{
                      padding: '12px 20px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {simulating === p.policyType ? 'Trigerring…' : 'Trigger ' + p.policyType}
                  </button>
                ))}
              </div>
            )}
          </div>

          <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
            My Automated Payouts
          </h3>

          {loading ? (
             <div style={{ color: 'rgba(255,255,255,0.2)', padding: '40px 0' }}>Loading your claim history…</div>
          ) : myClaims.length === 0 ? (
            <div style={{
              padding: '60px 40px', borderRadius: '20px', textAlign: 'center',
              border: '1px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛡️</div>
              <div style={{ color: '#fff', fontWeight: '800', fontSize: '16px', marginBottom: '8px' }}>No Claims Yet</div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', lineHeight: '1.6' }}>
                Your income is protected. Payouts will appear here automatically <br />
                when oracles detect a disruption in {worker?.zone || 'your zone'}.
              </p>
            </div>
          ) : (
            <div style={{
              borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Trigger Reason</th>
                    <th style={{ textAlign: 'right', padding: '16px 20px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Payout</th>
                    <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myClaims.map(claim => (
                    <tr key={claim.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#fff', fontWeight: '700' }}>
                        {claim.policyType}
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: '400', marginTop: '4px' }}>
                          {new Date(claim.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                        {claim.triggerReason}
                        {claim.triggerValue && <span style={{ color: 'rgba(232,83,60,0.6)' }}> ({claim.triggerValue})</span>}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '15px', fontWeight: '800', color: '#e8533c' }}>
                        ₹{claim.payoutAmount}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <StatusBadge status={claim.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: LIVE FEED ── */}
        <div>
          <h3 style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Live Claims Feed <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff4b2b', boxShadow: '0 0 10px #ff4b2b', animation: 'pulse 2s infinite' }} />
          </h3>
          
          <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: '4px' }}>
            {liveClaims.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', padding: '20px', textAlign: 'center' }}>
                Waiting for oracle detections…
              </div>
            ) : (
              liveClaims.map(c => <FeedCard key={c.id} claim={c} />)
            )}
          </div>

          <div style={{
            marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.6',
          }}>
            💡 Zero-Touch means <strong>GigShield</strong> is monitoring the APIs for you. When criteria is met, funds move from our liquidity pool straight to your wallet.
          </div>
        </div>
      </div>
    </div>
  );
}
