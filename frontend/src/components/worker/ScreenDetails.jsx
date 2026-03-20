import React from 'react';

const ScreenDetails = ({ currentStep }) => {
  const details = {
    1: { title: "Worker Onboarding", desc: "GigShield is designed strictly for active gig workers. The onboarding flow requires 5 distinct proofs of identity, location, and platform activity.", checks: ["None yet"] },
    2: { title: "Device Permissions", desc: "Before KYC begins, the app strictly requires explicit user permission for Location (GPS anti-spoofing) and Camera (Face Liveness).", checks: ["Location Services", "Camera Hardware"] },
    3: { title: "Step 1: Telecom Verification", desc: "We match the input phone number against specific Telecom KYC databases to ensure the SIM is registered to a real Indian citizen, not a virtual number.", checks: ["Twilio SMS OTP", "Telecom Circle mapping"] },
    4: { title: "Step 2: Bank/UPI Verification", desc: "We use Penny Drop verification (or UPI VPA Check) to ensure the name on the bank account matches the worker's declared name.", checks: ["UPI ID validation", "Bank Name Match"] },
    5: { title: "Step 3: State KYC (Aadhaar)", desc: "Instead of risky OTP flows, we use Offline Aadhaar XML. This relies on UIDAI's RSA-2048 digital signature. It provides age, matched name, and Pin Code.", checks: ["Signature Auth", "Pincode -> GPS Anti-spoofing"] },
    6: { title: "Step 4: Platform Proof", desc: "We verify recent earnings via WhatsApp bot reading Bank SMS or via Live Screen Recording OCR tracking the active partner app screen.", checks: ["OCR Extraction", "Video Liveness"] },
    7: { title: "Step 5: Double Face Match", desc: "Liveness detection (Blink) prevents photos of photos. We then match the live selfie against BOTH the Aadhaar XML photo and the Platform App screen photo.", checks: ["DeepFace CNN", "Liveness Active"] },
    8: { title: "Policy Selection", desc: "Gig workers dynamically choose their own policy coverage limits. The pricing logic enforces max limits based on their Platform Earnings score to prevent over-insurance fraud.", checks: ["Risk-based limits", "Dynamic Pricing"] },
    9: { title: "Policy Underwritten", desc: "The parametric policy is issued automatically via API. Pricing is dynamically set based on City, Profile, and Platform parameters.", checks: ["Dynamic Pricing Engine: Random Forest"] },
    10: { title: "Worker Dashboard (Active)", desc: "The worker sees real-time coverage updates. If Open-Meteo detects extreme weather in their zone, a push notification triggers the payout flow automatically.", checks: [] }
  };

  const current = details[currentStep] || details[1];

  return (
    <div style={{ animation: 'slideIn 0.3s ease' }}>
      <h2 style={{ color: 'var(--primary-dark)', marginBottom: '16px' }}>{current.title}</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: '1.6', marginBottom: '32px' }}>
        {current.desc}
      </p>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h4 style={{ marginBottom: '16px', color: 'var(--primary-dark)' }}>Verified Under the Hood:</h4>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {current.checks.map((check, i) => (
            <li key={i} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '12px',
              color: 'var(--text-primary)',
              fontWeight: 500
            }}>
              <span style={{ 
                background: 'rgba(39, 174, 96, 0.1)', 
                color: 'var(--success-green)',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
              {check}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ScreenDetails;
