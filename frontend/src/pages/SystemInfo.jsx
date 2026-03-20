import React, { useState } from 'react';
import { Layers, Cpu, Lightbulb, ChevronRight } from 'lucide-react';

const SystemInfo = () => {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div style={{ padding: '40px', width: '100%', maxWidth: '1200px', margin: '0 auto', animation: 'slideIn 0.3s ease-out' }}>
      <h1 style={{ marginBottom: '8px', color: 'var(--primary-dark)' }}>System Internal Architecture</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Technical breakdown of GigShield verification flows, machine learning models, and parametric innovations.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <TabButton active={activeTab === 1} onClick={() => setActiveTab(1)} icon={<Layers size={18}/>} label="1. Verification Flow" />
        <TabButton active={activeTab === 2} onClick={() => setActiveTab(2)} icon={<Cpu size={18}/>} label="2. ML Models" />
        <TabButton active={activeTab === 3} onClick={() => setActiveTab(3)} icon={<Lightbulb size={18}/>} label="3. Innovation Summary" />
      </div>

      {/* Tab Content */}
      <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px', minHeight: '500px' }}>
        {activeTab === 1 && <TabVerificationFlow />}
        {activeTab === 2 && <TabMLModels />}
        {activeTab === 3 && <TabInnovations />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
    backgroundColor: active ? 'var(--primary-dark)' : 'transparent',
    color: active ? 'white' : 'var(--text-secondary)',
    border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '15px'
  }}>
    {icon} {label}
  </button>
);

const TabVerificationFlow = () => {
  const steps = [
    { num: 1, name: 'Phone OTP', act: 'Enters number, OTP verified via SMS', proof: 'Telecom KYC confirmed, Active SIM status', pts: 15, tot: 15 },
    { num: 2, name: 'Name & UPI', act: 'Enters Bank details', proof: 'Bank account name matches declared name via Penny Drop API', pts: 20, tot: 35 },
    { num: 3, name: 'Aadhaar XML', act: 'Uploads official XML zip', proof: 'UIDAI RSA-2048 Digital Signature verified. Retrieves Age, PIN Code (Anti-spoofing).', pts: 35, tot: 70 },
    { num: 4, name: 'Platform Proof', act: 'Forwards earnings SMS & shows app screen to camera', proof: 'Active partner status confirmed. OCR extracts partner ID directly from live device screen.', pts: 35, tot: 105 },
    { num: 5, name: 'Face Liveness / Match', act: 'Blinks for liveness, takes selfie', proof: 'Selfie is cross-matched against BOTH the Aadhaar photo and Platform profile photo.', pts: 30, tot: 135 }
  ];

  return (
    <div className="animate-slide">
      <h3 style={{ marginBottom: '24px', color: '#1a1a2e' }}>5-Step Verification Funnel</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '24px', background: '#f8f7f4', padding: '24px', borderRadius: '12px', borderLeft: '4px solid var(--accent-red)' }}>
            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-red)', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{s.num}</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '16px', color: '#1a1a2e', marginBottom: '8px' }}>{s.name}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <div><strong>User Action:</strong> {s.act}</div>
                <div><strong>System Proves:</strong> {s.proof}</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', background: 'white', padding: '12px', borderRadius: '8px', minWidth: '100px' }}>
              <div style={{ color: 'var(--success-green)', fontWeight: 'bold', fontSize: '18px' }}>+{s.pts}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Total: {s.tot}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabMLModels = () => {
  const models = [
    { name: 'Dynamic Premium Pricing', algo: 'Random Forest Regressor', in: 'City risk, Delivery segment, Zone history', out: 'Weekly premium Rs.19 to Rs.79', use: 'Policy Creation' },
    { name: 'Fraud Detection', algo: 'Isolation Forest', in: 'GPS, Peer consensus, Claim freq, Earnings deviation', out: 'Fraud score 0 to 100', use: 'Claim Processing' },
    { name: 'Disruption Prediction', algo: 'XGBoost Classifier', in: 'Weather forecast, Historical patterns, News sentiment', out: 'Disruption probability next 24hr', use: 'Pre-event Alerts' },
    { name: 'Worker Risk Profiling', algo: 'Logistic Regression', in: 'City tier, Delivery segment, Platform tenure', out: 'Initial risk score', use: 'Onboarding' },
    { name: 'Face Verification', algo: 'DeepFace Facenet CNN', in: 'Live selfie, Aadhaar photo, Platform photo', out: 'Similarity score per pair', use: 'Identity Setup' },
    { name: 'GPS Pattern Classification', algo: 'K-Nearest Neighbours', in: 'Trip distance, Stop frequency, Restaurant proximity', out: 'Delivery worker confidence score', use: 'Background Auth' },
    { name: 'Churn Prediction', algo: 'Gradient Boosting', in: 'Payment gaps, Claim count, Login frequency', out: 'Churn probability', use: 'Retention' }
  ];

  return (
    <div className="animate-slide">
      <h3 style={{ marginBottom: '24px', color: '#1a1a2e' }}>7 Core Machine Learning Models</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {models.map((m, i) => (
          <div key={i} style={{ border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', background: '#f8f7f4' }}>
            <h4 style={{ color: 'var(--primary-dark)', marginBottom: '4px' }}>{m.name}</h4>
            <div style={{ display: 'inline-block', background: 'var(--info-blue)', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', marginBottom: '16px' }}>{m.algo}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}><strong>Input:</strong> {m.in}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}><strong>Output:</strong> {m.out}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><strong>Usage:</strong> {m.use}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabInnovations = () => {
  const innovations = [
    { title: 'Proactive Insurance', desc: 'Warns workers before disruption via news API scanning 24 hours in advance.' },
    { title: 'Post-disruption Payout', desc: 'Pays only after disruption ends + GPS stationary confirmed + 45 min minimum met.' },
    { title: 'Double Face Match', desc: 'Live selfie matched against Aadhaar photo AND platform photo simultaneously.' },
    { title: 'Personal Earnings Fingerprint', desc: 'Payout = actual hours lost × personal hourly rate × 0.7 — not a flat amount.' },
    { title: 'Peer Consensus Fraud Detection', desc: '60% of zone workers stopping simultaneously confirms disruption is real.' },
    { title: 'Live Screen OCR', desc: 'Partner ID must appear across 3 frames proving it is not a fake screenshot.' },
    { title: 'Aadhaar Pincode Tiering', desc: 'Government-signed pincode used for tier assignment — cannot be GPS-spoofed.' },
    { title: 'Pause and Resume', desc: 'Only insurance in India workers can pause for a week and resume next week.' }
  ];

  return (
    <div className="animate-slide">
      <h3 style={{ marginBottom: '24px', color: '#1a1a2e' }}>8 Platform Innovations</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {innovations.map((inv, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--accent-yellow)', flexShrink: 0 }}><ChevronRight size={24}/></div>
            <div>
              <h4 style={{ color: '#1a1a2e', fontSize: '15px', marginBottom: '6px' }}>{inv.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.5' }}>{inv.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemInfo;
