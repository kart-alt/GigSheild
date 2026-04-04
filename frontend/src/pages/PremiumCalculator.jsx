import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const ZONES = ['Chennai', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad'];

// ─── AQI level label + color ──────────────────────────────────────
function aqiLevel(aqi) {
  if (aqi <= 50)  return { label: 'Good',                    color: '#22c55e' };
  if (aqi <= 100) return { label: 'Moderate',                color: '#84cc16' };
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)',   color: '#f59e0b' };
  if (aqi <= 200) return { label: 'Unhealthy',               color: '#f97316' };
  if (aqi <= 300) return { label: 'Very Unhealthy',          color: '#ef4444' };
  return             { label: 'Hazardous',                   color: '#9333ea' };
}

// ─── Animated number component ────────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [displayed, setDisplayed] = useState(value);
  useEffect(() => {
    let start = displayed;
    const end = value;
    if (start === end) return;
    const step = (end - start) / 20;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      start += step;
      if (frame >= 20) { setDisplayed(end); clearInterval(interval); }
      else setDisplayed(Math.round(start));
    }, 20);
    return () => clearInterval(interval);
  }, [value]);
  return <span>{prefix}{displayed}{suffix}</span>;
}

// ─── Loss ratio gauge ─────────────────────────────────────────────
function LossRatioGauge({ ratio }) {
  const clamped = Math.min(ratio, 120);
  const color = ratio < 60 ? '#22c55e' : ratio < 85 ? '#f59e0b' : '#ef4444';
  const label = ratio < 60 ? 'Profitable' : ratio < 85 ? 'Balanced' : 'Under Pressure';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Loss Ratio</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color }}>{label}</span>
      </div>
      <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '4px', width: clamped + '%',
          background: 'linear-gradient(90deg, #22c55e, ' + color + ')',
          transition: 'width 0.8s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>0%</span>
        <span style={{ fontSize: '18px', fontWeight: '800', color }}><AnimatedNumber value={ratio} suffix="%" /></span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>100%+</span>
      </div>
    </div>
  );
}

// ─── Formula row component ────────────────────────────────────────
function FormulaRow({ component, isLast }) {
  const isBase    = component.direction === 'base';
  const isUp      = component.direction === 'up';
  const isDown    = component.direction === 'down';
  const isNeutral = component.direction === 'neutral';

  const amtColor  = isBase ? '#fff' : isUp ? '#f87171' : isDown ? '#4ade80' : 'rgba(255,255,255,0.4)';
  const amtPrefix = isBase ? '' : isUp ? '+₹' : isDown ? '-₹' : '±₹';
  const amtValue  = isBase ? component.amount : Math.abs(component.amount);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '14px 16px',
      borderRadius: '12px', marginBottom: isLast ? '0' : '8px',
      background: isBase
        ? 'rgba(232,83,60,0.08)'
        : isUp ? 'rgba(248,113,113,0.06)'
        : isDown ? 'rgba(74,222,128,0.06)'
        : 'rgba(255,255,255,0.03)',
      border: '1px solid ' + (isBase
        ? 'rgba(232,83,60,0.2)'
        : isUp ? 'rgba(248,113,113,0.15)'
        : isDown ? 'rgba(74,222,128,0.15)'
        : 'rgba(255,255,255,0.06)'),
      transition: 'all 0.3s ease',
    }}>
      <span style={{ fontSize: '20px', marginRight: '12px', flexShrink: 0 }}>{component.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '3px' }}>
          {component.name}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.4' }}>
          {component.reason}
        </div>
        {component.dataPoint && (
          <div style={{
            marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
            background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
          }}>
            📡 {component.dataPoint}
          </div>
        )}
        {component.threshold && (
          <div style={{
            marginTop: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.25)',
          }}>
            Threshold: {component.threshold}
          </div>
        )}
      </div>
      <div style={{
        fontSize: '18px', fontWeight: '800', color: amtColor,
        marginLeft: '16px', flexShrink: 0, minWidth: '52px', textAlign: 'right',
      }}>
        {isNeutral && component.amount === 0 ? '—' : (amtPrefix + '₹' + amtValue)}
      </div>
    </div>
  );
}

// ─── Condition card ───────────────────────────────────────────────
function ConditionCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      flex: 1, padding: '16px', borderRadius: '14px', textAlign: 'center',
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: color || '#fff' }}>{value}</div>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function PremiumCalculator() {
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  // Pre-fill zone from logged-in worker
  useEffect(() => {
    const stored = localStorage.getItem('gigshield_worker');
    if (stored) {
      const w = JSON.parse(stored);
      if (w.zone && ZONES.includes(w.zone)) setSelectedZone(w.zone);
    }
    if (!selectedZone) setSelectedZone('Chennai');
  }, []);

  // Auto-calculate when zone is selected
  useEffect(() => {
    if (selectedZone) calculate(selectedZone);
  }, [selectedZone]);

  const calculate = useCallback(async (zone) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API + '/api/premium/calculate?zone=' + encodeURIComponent(zone));
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Calculation failed');
      }
    } catch (err) {
      setError('Backend offline — showing estimated premium.');
      // Graceful fallback
      setResult(buildFallback(zone));
    } finally {
      setLoading(false);
    }
  }, []);

  // Client-side fallback when backend offline
  const buildFallback = (zone) => {
    const mock = { Chennai: { temp: 38, rain: 0, aqi: 89 }, Mumbai: { temp: 35, rain: 2, aqi: 135 }, Delhi: { temp: 41, rain: 0, aqi: 245 }, Bengaluru: { temp: 29, rain: 0, aqi: 62 }, Hyderabad: { temp: 36, rain: 0, aqi: 110 } };
    const hist = { Chennai: 10, Mumbai: 10, Delhi: 10, Bengaluru: -5, Hyderabad: 0 };
    const m = mock[zone] || mock.Chennai;
    const components = [
      { name: 'Base Premium',    amount: 40, direction: 'base',    reason: 'Standard GigShield base rate', icon: '🛡️' },
      { name: 'Monsoon Risk',    amount: m.rain > 10 ? 10 : 0, direction: m.rain > 10 ? 'up' : 'neutral', reason: m.rain + 'mm/hr rainfall', dataPoint: m.rain + 'mm/hr', threshold: '> 10mm/hr → +₹10', icon: '🌧️' },
      { name: 'Heat Risk',       amount: m.temp > 40 ? 5 : 0,  direction: m.temp > 40 ? 'up' : 'neutral', reason: m.temp + '°C temperature', dataPoint: m.temp + '°C', threshold: '> 40°C → +₹5', icon: '🌡️' },
      { name: 'Air Quality',     amount: m.aqi > 200 ? 8 : 0,  direction: m.aqi > 200 ? 'up' : 'neutral', reason: 'AQI ' + m.aqi, dataPoint: 'AQI ' + m.aqi, threshold: '> 200 → +₹8', icon: '💨' },
      { name: 'Zone History',    amount: hist[zone] || 0, direction: (hist[zone] || 0) > 0 ? 'up' : (hist[zone] || 0) < 0 ? 'down' : 'neutral', reason: zone + ' historical adjustment', icon: '📊' },
    ];
    const total = components.reduce((s, c) => s + c.amount, 0);
    return {
      zone, total, components,
      weather: { temp: m.temp, rain: m.rain, source: 'estimated' },
      aqi: { aqi: m.aqi, source: 'estimated' },
      metrics: { workersInZone: 231, weeklyPremiumPool: total * 231, expectedPayoutLiability: 8000, lossRatio: Math.round(8000 / (total * 231) * 100), explanation: 'Base ₹40 · estimated for ' + zone },
    };
  };

  const aqi = result ? aqiLevel(result.aqi?.aqi || 0) : null;

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      background: 'linear-gradient(160deg, #0d0d1a 0%, #111827 60%, #0a0f1a 100%)',
      padding: '48px 40px', fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '28px' }}>🧮</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
            Dynamic Premium Calculator
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: 0 }}>
          Live weather, AQI, and zone risk combined into a transparent, fair premium.
        </p>
      </div>

      {/* ── Zone Selector ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '36px', flexWrap: 'wrap' }}>
        {ZONES.map(z => (
          <button
            key={z}
            id={'zone-btn-' + z.toLowerCase()}
            onClick={() => setSelectedZone(z)}
            style={{
              padding: '10px 20px', borderRadius: '24px', fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease',
              background: selectedZone === z ? 'linear-gradient(135deg, #e8533c, #d44328)' : 'rgba(255,255,255,0.05)',
              border: selectedZone === z ? 'none' : '1px solid rgba(255,255,255,0.1)',
              color: selectedZone === z ? '#fff' : 'rgba(255,255,255,0.5)',
              transform: selectedZone === z ? 'scale(1.04)' : 'scale(1)',
              boxShadow: selectedZone === z ? '0 4px 20px rgba(232,83,60,0.3)' : 'none',
            }}
          >
            {z}
          </button>
        ))}
        <button
          id="btn-refresh-premium"
          onClick={() => calculate(selectedZone)}
          style={{
            padding: '10px 20px', borderRadius: '24px', fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {loading ? '⟳ Refreshing…' : '⟳ Refresh Live Data'}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '24px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: 'rgba(251,191,36,0.8)', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      {loading && !result && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📡</div>
          Fetching live weather + AQI data for {selectedZone}…
        </div>
      )}

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', maxWidth: '1200px' }}>

          {/* ── LEFT: Formula Breakdown ── */}
          <div>
            {/* Total premium hero */}
            <div style={{
              padding: '28px 32px', borderRadius: '20px', marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(232,83,60,0.12), rgba(245,166,35,0.08))',
              border: '1px solid rgba(232,83,60,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
            }}>
              <div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                  YOUR WEEKLY PREMIUM — {result.zone}
                </div>
                <div style={{ fontSize: '52px', fontWeight: '900', color: '#e8533c', lineHeight: 1, letterSpacing: '-2px' }}>
                  ₹<AnimatedNumber value={result.total} />
                  <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', fontWeight: '400', letterSpacing: 0 }}>/week</span>
                </div>
                <div style={{ marginTop: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.5' }}>
                  💡 {result.metrics.explanation}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data freshness</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                  {result.weather?.source?.includes('live') ? '🟢 Live API' : '🟡 Estimated'}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>
                  {new Date(result.timestamp || Date.now()).toLocaleTimeString('en-IN')}
                </div>
              </div>
            </div>

            {/* Formula label */}
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Premium Formula Breakdown
              </div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Formula rows */}
            {result.components.map((comp, i) => (
              <FormulaRow key={comp.name} component={comp} isLast={i === result.components.length - 1} />
            ))}

            {/* Total line */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', marginTop: '12px', borderRadius: '12px',
              background: 'rgba(232,83,60,0.1)', border: '2px solid rgba(232,83,60,0.3)',
            }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>
                Total Weekly Premium
              </div>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#e8533c' }}>
                ₹<AnimatedNumber value={result.total} />
              </div>
            </div>

            {/* Data sources */}
            <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
              📡 Weather: {result.weather?.source || 'N/A'} &nbsp;·&nbsp; AQI: {result.aqi?.source || 'N/A'}
              {result.aqi?.station && <span> &nbsp;·&nbsp; Station: {result.aqi.station}</span>}
            </div>
          </div>

          {/* ── RIGHT: Conditions + Metrics ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Live conditions */}
            <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>
                Live Conditions — {result.zone}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <ConditionCard
                  icon="🌡️"
                  label="Temperature"
                  value={result.weather?.temp + '°C'}
                  sub={result.weather?.temp > 40 ? '⚠️ Extreme heat' : 'Within range'}
                  color={result.weather?.temp > 40 ? '#f97316' : '#fff'}
                />
                <ConditionCard
                  icon="🌧️"
                  label="Rainfall"
                  value={result.weather?.rain + 'mm'}
                  sub={result.weather?.rain > 10 ? '⚠️ Heavy rain' : 'Low rainfall'}
                  color={result.weather?.rain > 10 ? '#3b82f6' : '#fff'}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Air Quality Index</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: aqi?.color }}>{aqi?.label}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: aqi?.color }}>
                    <AnimatedNumber value={result.aqi?.aqi || 0} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ height: '100%', width: Math.min((result.aqi?.aqi || 0) / 3, 100) + '%', background: 'linear-gradient(90deg, #22c55e, #f59e0b, #ef4444, #9333ea)', transition: 'width 0.8s ease', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
                      <span>0</span><span>150</span><span>300+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance metrics */}
            <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '20px' }}>
                Actuarial Metrics
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Workers in Zone', value: result.metrics.workersInZone, suffix: '', icon: '👥' },
                  { label: 'Weekly Pool', value: result.metrics.weeklyPremiumPool, prefix: '₹', icon: '💰' },
                  { label: 'Payout Liability', value: result.metrics.expectedPayoutLiability, prefix: '₹', icon: '⚡' },
                ].map(m => (
                  <div key={m.label} style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>{m.icon}</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                      <AnimatedNumber value={m.value} prefix={m.prefix || ''} suffix={m.suffix || ''} />
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '4px' }}>{m.label}</div>
                  </div>
                ))}
                <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>📅</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>Mon–Sun</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '4px' }}>Coverage Window</div>
                </div>
              </div>

              <LossRatioGauge ratio={result.metrics.lossRatio} />
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                id="btn-goto-policies"
                onClick={() => navigate('/policies')}
                style={{
                  padding: '14px', borderRadius: '12px', border: '1px solid rgba(232,83,60,0.3)',
                  background: 'rgba(232,83,60,0.08)', color: '#e8533c', fontWeight: '700',
                  fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s ease',
                }}
              >
                🛡️ Activate Policies
              </button>
              <button
                id="btn-goto-claims"
                onClick={() => navigate('/claims')}
                style={{
                  padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontWeight: '700',
                  fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s ease',
                }}
              >
                📋 View Claims
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
