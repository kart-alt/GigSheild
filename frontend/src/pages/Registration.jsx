import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Config ───────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ZONES = ['Chennai', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad'];
const PLATFORMS = ['Swiggy', 'Zomato', 'Blinkit', 'Amazon Flex'];

// ─── Styles (inline so no external CSS dependency) ────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '48px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    background: 'linear-gradient(135deg, #e8533c, #f5a623)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  logoSub: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '2px',
  },
  stepBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
  },
  stepDot: (active, done) => ({
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    background: done ? '#e8533c' : active ? 'rgba(232,83,60,0.6)' : 'rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
  }),
  heading: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
  },
  subheading: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '28px',
    lineHeight: '1.5',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
    marginBottom: '20px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '14px 16px',
    background: '#1a1a3e',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    marginBottom: '20px',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  phoneRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  phonePrefix: {
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '16px',
    whiteSpace: 'nowrap',
  },
  btn: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #e8533c, #d44328)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '0.3px',
    fontFamily: "'DM Sans', sans-serif",
  },
  btnDisabled: {
    width: '100%',
    padding: '15px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'not-allowed',
    fontFamily: "'DM Sans', sans-serif",
  },
  otpRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
    justifyContent: 'center',
  },
  otpBox: (focused) => ({
    width: '52px',
    height: '60px',
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '700',
    background: 'rgba(255,255,255,0.07)',
    border: focused ? '2px solid #e8533c' : '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    fontFamily: "'DM Mono', monospace",
    transition: 'border-color 0.2s',
  }),
  mockHint: {
    textAlign: 'center',
    fontSize: '12px',
    color: 'rgba(232,83,60,0.8)',
    marginBottom: '20px',
    padding: '8px 16px',
    background: 'rgba(232,83,60,0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(232,83,60,0.2)',
  },
  error: {
    color: '#ff6b6b',
    fontSize: '13px',
    marginBottom: '16px',
    padding: '10px 14px',
    background: 'rgba(255,107,107,0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(255,107,107,0.2)',
  },
  success: {
    color: '#51cf66',
    fontSize: '13px',
    marginBottom: '16px',
    padding: '10px 14px',
    background: 'rgba(81,207,102,0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(81,207,102,0.2)',
    textAlign: 'center',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '24px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: "'DM Sans', sans-serif",
  },
  loginLink: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '20px',
  },
  loginLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#e8533c',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    fontWeight: '600',
    padding: '0 4px',
  },
};

// ─── OTP Input Component ───────────────────────────────────────────
function OTPInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = char;
    onChange(next.join(''));
    if (char && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div style={S.otpRow}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          style={S.otpBox(document.activeElement === inputs.current[i])}
          value={d}
          maxLength={1}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          id={'otp-digit-' + i}
        />
      ))}
    </div>
  );
}

// ─── Main Registration Page ────────────────────────────────────────
export default function Registration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=profile
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [profile, setProfile] = useState({ name: '', zone: '', platform: '', weeklyEarningEstimate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // ── Step 1: Send OTP
  const sendOtp = async () => {
    setError(''); setMsg('');
    if (!/^\d{10}$/.test(phone)) return setError('Enter a valid 10-digit phone number');
    setLoading(true);
    try {
      const res = await fetch(API + '/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('OTP sent successfully!');
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch {
      // Network error – still advance (demo mode)
      setMsg('Demo mode: use OTP 123456');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP
  const verifyOtp = async () => {
    setError(''); setMsg('');
    if (otp.length !== 6) return setError('Enter the 6-digit OTP');
    setLoading(true);
    try {
      const res = await fetch(API + '/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (data.success) {
        // Check if worker already registered
        const meRes = await fetch(API + '/api/auth/me/' + phone);
        const meData = await meRes.json();
        if (meData.exists && meData.worker?.name) {
          localStorage.setItem('gigshield_worker', JSON.stringify(meData.worker));
          navigate('/policies');
          return;
        }
        setStep(3);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch {
      setStep(3); // Demo fallback
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Register Profile
  const register = async () => {
    setError(''); setMsg('');
    if (!profile.name.trim()) return setError('Please enter your full name');
    if (!profile.zone) return setError('Please select your zone/city');
    if (!profile.platform) return setError('Please select your delivery platform');
    setLoading(true);
    try {
      const res = await fetch(API + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, ...profile }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('gigshield_worker', JSON.stringify(data.worker));
        setMsg('Registration successful! Redirecting...');
        setTimeout(() => navigate('/policies'), 1200);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      // Demo fallback
      const mock = { id: 'demo-' + Date.now(), phone, ...profile };
      localStorage.setItem('gigshield_worker', JSON.stringify(mock));
      navigate('/policies');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Phone', 'Verify', 'Profile'];

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>🛡️</div>
          <div>
            <div style={S.logoText}>GigShield</div>
            <div style={S.logoSub}>Income Protection for Gig Workers</div>
          </div>
        </div>

        {/* Step progress bar */}
        <div style={S.stepBar}>
          {[1, 2, 3].map(n => (
            <div key={n} style={S.stepDot(step === n, step > n)} title={stepLabels[n - 1]} />
          ))}
        </div>

        {/* Back button */}
        {step > 1 && (
          <button style={S.backBtn} onClick={() => { setStep(s => s - 1); setError(''); setMsg(''); }}>
            ← Back
          </button>
        )}

        {/* Error / Success banners */}
        {error && <div style={S.error}>⚠️ {error}</div>}
        {msg && <div style={S.success}>✓ {msg}</div>}

        {/* ── STEP 1: Phone Number ── */}
        {step === 1 && (
          <>
            <div style={S.heading}>Welcome, Delivery Hero 👋</div>
            <div style={S.subheading}>Enter your mobile number to get started with GigShield insurance coverage.</div>

            <label style={S.label}>Mobile Number</label>
            <div style={S.phoneRow}>
              <span style={S.phonePrefix}>🇮🇳 +91</span>
              <input
                id="reg-phone"
                style={{ ...S.input, marginBottom: 0, flex: 1 }}
                type="tel"
                placeholder="98765 43210"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '20px' }} />
            <button
              id="btn-send-otp"
              style={loading ? S.btnDisabled : S.btn}
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send OTP →'}
            </button>

            <div style={S.loginLink}>
              Already have an account?{' '}
              <button style={S.loginLinkBtn} onClick={() => navigate('/policies')}>
                Go to Dashboard
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: OTP Verification ── */}
        {step === 2 && (
          <>
            <div style={S.heading}>Enter OTP 🔐</div>
            <div style={S.subheading}>We sent a 6-digit code to <strong style={{ color: '#fff' }}>+91 {phone}</strong></div>

            <div style={S.mockHint}>
              🔧 Demo Mode — use OTP: <strong>123456</strong>
            </div>

            <OTPInput value={otp} onChange={setOtp} />

            <button
              id="btn-verify-otp"
              style={loading || otp.length < 6 ? S.btnDisabled : S.btn}
              onClick={verifyOtp}
              disabled={loading || otp.length < 6}
            >
              {loading ? 'Verifying…' : 'Verify OTP →'}
            </button>

            <div style={S.loginLink}>
              Wrong number?{' '}
              <button style={S.loginLinkBtn} onClick={() => setStep(1)}>
                Change number
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: Profile Form ── */}
        {step === 3 && (
          <>
            <div style={S.heading}>Build Your Profile 📋</div>
            <div style={S.subheading}>Tell us about yourself so we can personalize your coverage.</div>

            <label style={S.label}>Full Name</label>
            <input
              id="reg-name"
              style={S.input}
              type="text"
              placeholder="e.g. Ravi Kumar"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            />

            <label style={S.label}>Your Zone / City</label>
            <select
              id="reg-zone"
              style={S.select}
              value={profile.zone}
              onChange={e => setProfile(p => ({ ...p, zone: e.target.value }))}
            >
              <option value="">— Select City —</option>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>

            <label style={S.label}>Delivery Platform</label>
            <select
              id="reg-platform"
              style={S.select}
              value={profile.platform}
              onChange={e => setProfile(p => ({ ...p, platform: e.target.value }))}
            >
              <option value="">— Select Platform —</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <label style={S.label}>Estimated Weekly Earnings (₹)</label>
            <input
              id="reg-earnings"
              style={S.input}
              type="number"
              placeholder="e.g. 4500"
              value={profile.weeklyEarningEstimate}
              onChange={e => setProfile(p => ({ ...p, weeklyEarningEstimate: e.target.value }))}
            />

            <button
              id="btn-register"
              style={loading ? S.btnDisabled : S.btn}
              onClick={register}
              disabled={loading}
            >
              {loading ? 'Registering…' : '🛡️ Activate GigShield'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
