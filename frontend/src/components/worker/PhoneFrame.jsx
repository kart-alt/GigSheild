import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, Loader2, Camera, UploadCloud, FileText, Check, Award, AlertCircle, MapPin, BadgeIndianRupee } from 'lucide-react';

const PhoneFrame = ({ currentStep, onNext }) => {
  return (
    <div style={{
      width: '320px', height: '620px', backgroundColor: '#0a0a14',
      borderRadius: '40px', border: '8px solid #2a2a4a',
      boxShadow: '0 24px 48px rgba(0,0,0,0.5)', position: 'relative',
      overflow: 'hidden', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{
        height: '24px', width: '120px', backgroundColor: '#2a2a4a',
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', zIndex: 50
      }} />

      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {currentStep === 1 && <Screen1 onNext={() => onNext(2)} />}
        {currentStep === 2 && <ScreenPermissions onNext={() => onNext(3)} />}
        {currentStep === 3 && <Screen2 onNext={() => onNext(4)} />}
        {currentStep === 4 && <Screen3 onNext={() => onNext(5)} />}
        {currentStep === 5 && <Screen4 onNext={() => onNext(6)} />}
        {currentStep === 6 && <Screen5 onNext={() => onNext(7)} />}
        {currentStep === 7 && <Screen6 onNext={() => onNext(8)} />}
        {currentStep === 8 && <ScreenPolicy onNext={() => onNext(9)} />}
        {currentStep === 9 && <Screen7 onNext={() => onNext(10)} />}
        {currentStep === 10 && <Screen8 />}
      </div>
    </div>
  );
};

// -- Reusable Components --
const Header = ({ step, title }) => (
  <div style={{ marginBottom: '24px' }}>
    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Step {step} of 5</p>
    <h3 style={{color: 'var(--primary-dark)'}}>{title}</h3>
  </div>
);

// -- SCREEN 1 --
const Screen1 = ({ onNext }) => (
  <div className="animate-slide" style={{ padding: '40px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundImage: 'var(--bg-dark-gradient)' }}>
    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
      <ShieldCheck size={64} color="var(--accent-red)" style={{ margin: '0 auto 16px' }} />
      <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '8px' }}>GigShield</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Income Protection for Delivery Partners</p>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '40px' }}>
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '20px', color: 'white', fontSize: '12px' }}>Rs. 49/week</div>
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '20px', color: 'white', fontSize: '12px' }}>2 min setup</div>
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '20px', color: 'white', fontSize: '12px' }}>Rs. 1200 max payout</div>
    </div>
    <button className="btn-primary" onClick={onNext} style={{ width: '100%', padding: '16px', marginBottom: '16px' }}>I am a delivery partner</button>
  </div>
);

// -- SCREEN 2 (Permissions) --
const ScreenPermissions = ({ onNext }) => {
  const [granted, setGranted] = useState(false);
  const handleGrant = () => {
    setGranted(true);
    setTimeout(onNext, 1200);
  };
  return (
    <div className="animate-slide" style={{ padding: '40px 24px', height: '100%', backgroundColor: 'white' }}>
      <Header step="1" title="App Permissions" />
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        GigShield needs the following permissions to verify your identity and detect disruptions.
      </p>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ background: '#f8f7f4', padding: '12px', borderRadius: '50%' }}>
          <MapPin size={24} color="var(--primary-dark)" />
        </div>
        <div>
          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary-dark)' }}>Location Services</strong>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Required to verify you are in the affected zone</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'center' }}>
        <div style={{ background: '#f8f7f4', padding: '12px', borderRadius: '50%' }}>
          <Camera size={24} color="var(--primary-dark)" />
        </div>
        <div>
          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary-dark)' }}>Camera Access</strong>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Required for Face Liveness matching</span>
        </div>
      </div>

      {!granted ? (
        <button className="btn-primary" style={{ width: '100%' }} onClick={handleGrant}>Allow Permissions</button>
      ) : (
        <div className="animate-pulse" style={{ background: '#e8f5e9', color: '#2e7d32', padding: '16px', borderRadius: '8px', fontSize: '14px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <CheckCircle size={20} /> Permissions Granted
        </div>
      )}
    </div>
  );
};

// -- SCREEN 3 (OTP) --
const Screen2 = ({ onNext }) => {
  const [step, setStep] = useState(0);
  useEffect(() => { if (step === 1) setTimeout(() => setStep(2), 1500); }, [step]);
  return (
    <div className="animate-slide" style={{ padding: '40px 24px', height: '100%', backgroundColor: 'white' }}>
      <Header step="2" title="Verify your Number" />
      {step === 0 && (
        <>
          <input type="text" defaultValue="9876543210" readOnly style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '18px', marginBottom: '24px' }} />
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => setStep(1)}>Send OTP</button>
        </>
      )}
      {step >= 1 && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {['4','8','2','9','1','0'].map((n, i) => <input key={i} type="text" value={step === 2 ? n : ''} readOnly style={{ width: '36px', height: '48px', textAlign: 'center', fontSize: '20px', borderRadius: '8px', border: '1px solid #ccc' }} />)}
          </div>
          {step === 1 && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><Loader2 className="animate-spin" size={16} /> Reading OTP...</div>}
        </>
      )}
      {step === 2 && (
        <div className="animate-slide">
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <CheckCircle size={16} /> Number verified — Telecom KYC
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={onNext}>Continue</button>
        </div>
      )}
    </div>
  );
};

// -- SCREEN 3 --
const Screen3 = ({ onNext }) => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const handleContinue = () => { setLoading(true); setTimeout(() => { setLoading(false); setVerified(true); }, 2000); };
  return (
    <div className="animate-slide" style={{ padding: '40px 24px', height: '100%', backgroundColor: 'white' }}>
      <Header step="3" title="Bank & Name" />
      <div style={{ marginBottom: '16px' }}><label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Full Name</label><input type="text" defaultValue="Rajesh Kumar" readOnly style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e8e4de', fontSize: '16px', background: '#f8f7f4' }} /></div>
      <div style={{ marginBottom: '24px' }}><label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>UPI ID</label><input type="text" defaultValue="rajesh@okaxis" readOnly style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e8e4de', fontSize: '16px', background: '#f8f7f4' }} /></div>
      {!verified && !loading && <button className="btn-primary" style={{ width: '100%' }} onClick={handleContinue}>Verify UPI</button>}
      {loading && <button className="btn-primary" style={{ width: '100%', opacity: 0.7 }} disabled><Loader2 className="animate-spin" size={16} style={{display:'inline', marginRight:'8px'}}/> Verify UPI</button>}
      {verified && (
        <div className="animate-slide">
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '8px', marginBottom: '24px' }}><CheckCircle size={16} /> Bank verified — Rajesh Kumar confirmed by HDFC</div>
          <div style={{ textAlign: 'center', color: 'var(--info-blue)', fontWeight: 'bold', marginBottom: '24px' }}>+20 points</div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={onNext}>Continue</button>
        </div>
      )}
    </div>
  );
};

// -- SCREEN 4 --
const Screen4 = ({ onNext }) => {
  const [uploaded, setUploaded] = useState(false), [verifying, setVerifying] = useState(false), [verified, setVerified] = useState(false);
  const handleUpload = () => { setUploaded(true); setVerifying(true); setTimeout(() => { setVerifying(false); setVerified(true); }, 2000); };
  return (
    <div className="animate-slide" style={{ padding: '40px 24px', height: '100%', backgroundColor: 'white' }}>
      <Header step="4" title="Aadhaar XML" />
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Download your Aadhaar from UIDAI and upload here.</p>
      {!uploaded && (
        <div onClick={handleUpload} style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', marginBottom: '24px' }}>
          <UploadCloud size={32} color="var(--primary-dark)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>Tap to upload</p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>aadhaar_offline.xml</p>
        </div>
      )}
      {verifying && (
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <Loader2 className="animate-spin" size={32} color="var(--info-blue)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Verifying RSA-2048 digital signature...</p>
        </div>
      )}
      {verified && (
        <div className="animate-slide" style={{ marginBottom: '24px' }}>
          <div style={{ background: '#f8f7f4', padding: '16px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.8', color: '#1a1a2e' }}>
            <div><strong>Name:</strong> Rajesh Kumar <span style={{color:'green', marginLeft:'4px'}}>✓</span></div>
            <div><strong>DOB:</strong> 15-06-1994 (Age 31)</div>
            <div><strong>City:</strong> Chennai (Tier 3)</div>
            <div><strong>Sign:</strong> Valid Crypto Sig</div>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--info-blue)', fontWeight: 'bold', margin: '16px 0' }}>+35 points</div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={onNext}>Continue</button>
        </div>
      )}
    </div>
  );
};

// -- SCREEN 5 --
const Screen5 = ({ onNext }) => {
  const [phase, setPhase] = useState(0); // 0=start, 1=whatsapp, 2=camera
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    if (phase === 2 && countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    if (countdown === 0 && phase === 2) setPhase(3);
  }, [phase, countdown]);

  return (
    <div className="animate-slide" style={{ padding: '40px 24px', height: '100%', backgroundColor: 'white' }}>
      <Header step="5" title="Platform Proof" />
      
      {phase === 0 && (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Part A: Forward latest Zomato earnings SMS to WhatsApp</p>
          <button className="btn-primary" style={{ width: '100%', background: '#25D366', marginBottom: '24px' }} onClick={() => setPhase(1)}>Open WhatsApp Bot</button>
        </div>
      )}

      {phase >= 1 && (
        <div className="animate-slide" style={{ background: '#e8f5e9', padding: '12px', borderRadius: '8px', fontSize: '12px', marginBottom: '24px', borderLeft: '4px solid #2e7d32' }}>
          <strong style={{color:'#1a1a2e'}}>Active Zomato partner confirmed</strong><br/>
          <span style={{color:'#6b6b7b'}}>Rs. 4,850 weekly earnings recorded</span>
        </div>
      )}

      {phase === 1 && (
        <div className="animate-slide">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Part B: Open Zomato App and display "My Performance" to the camera.</p>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => setPhase(2)}>Start Screen Record</button>
        </div>
      )}

      {phase === 2 && (
        <div className="animate-slide" style={{ background: '#000', height: '240px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div className="animate-pulse" style={{ width: '12px', height: '12px', background: 'red', borderRadius: '50%', position: 'absolute', top: '16px', right: '16px' }}></div>
          <span style={{ color: 'white', fontSize: '48px', fontWeight: 'bold' }}>00:0{countdown}</span>
        </div>
      )}

      {phase === 3 && (
        <div className="animate-slide">
          <div style={{ background: '#f8f7f4', padding: '16px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.8', color: '#1a1a2e', marginBottom: '16px' }}>
            <div><strong>OCR Result:</strong> PASSED</div>
            <div><strong>Partner ID:</strong> ZOM987654</div>
            <div><strong>Name on screen:</strong> Rajesh Kumar</div>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--info-blue)', fontWeight: 'bold', marginBottom: '16px' }}>+35 points</div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={onNext}>Continue</button>
        </div>
      )}
    </div>
  );
};

// -- SCREEN 6 --
const Screen6 = ({ onNext }) => {
  const [blinked, setBlinked] = useState(false);
  const [aadhaarP, setAadhaarP] = useState(0);
  const [platformP, setPlatformP] = useState(0);

  useEffect(() => {
    setTimeout(() => setBlinked(true), 2500);
  }, []);

  useEffect(() => {
    if (blinked) {
      let a = 0, p = 0;
      const t = setInterval(() => {
        if (a < 91) a += Math.floor(Math.random() * 5);
        if (p < 87) p += Math.floor(Math.random() * 5);
        if (a > 91) a = 91;
        if (p > 87) p = 87;
        setAadhaarP(a); setPlatformP(p);
        if (a === 91 && p === 87) clearInterval(t);
      }, 50);
    }
  }, [blinked]);

  return (
    <div className="animate-slide" style={{ padding: '40px 24px', height: '100%', backgroundColor: 'white' }}>
      <Header step="6" title="Face Liveness" />
      
      <div style={{ position: 'relative', width: '100%', height: '200px', background: '#e8e4de', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', border: '2px solid var(--accent-red)' }}>
         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '140px', height: '180px', border: blinked ? '2px solid #27ae60' : '2px dashed gray', borderRadius: '50%', transition: 'all 0.3s' }}></div>
         {!blinked && <div style={{ position: 'absolute', bottom: '16px', left: '0', width: '100%', textAlign: 'center', color: '#1a1a2e', fontWeight: 'bold', fontSize: '14px' }}>Please blink once</div>}
         {blinked && <div style={{ position: 'absolute', bottom: '16px', left: '0', width: '100%', textAlign: 'center', color: '#27ae60', fontWeight: 'bold', fontSize: '14px', background: 'rgba(255,255,255,0.8)' }}>Liveness Confirmed</div>}
      </div>

      {blinked && (
        <div className="animate-slide" style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#1a1a2e' }}>
              <span>Aadhaar XML Match</span><span>{aadhaarP}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#f8f7f4', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${aadhaarP}%`, height: '100%', background: 'var(--success-green)' }}></div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#1a1a2e' }}>
              <span>Platform App Match</span><span>{platformP}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#f8f7f4', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${platformP}%`, height: '100%', background: 'var(--info-blue)' }}></div>
            </div>
          </div>
        </div>
      )}

      {aadhaarP === 91 && (
        <div className="animate-slide">
          <div style={{ textAlign: 'center', color: 'var(--info-blue)', fontWeight: 'bold', marginBottom: '16px' }}>+30 points</div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={onNext}>Finish Setup</button>
        </div>
      )}
    </div>
  );
};

// -- SCREEN POLICY (New Step 8) --
const ScreenPolicy = ({ onNext }) => {
  const [selected, setSelected] = useState(null);
  const handleSelect = (tier) => {
    setSelected(tier);
    setTimeout(onNext, 800);
  };
  return (
    <div className="animate-slide" style={{ padding: '40px 24px', height: '100%', backgroundColor: '#f8f7f4' }}>
      <Header step="7" title="Select Policy Tier" />
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Based on your verified profile, pick your coverage level.
      </p>

      <div onClick={() => handleSelect('basic')} style={{ background: 'white', border: selected === 'basic' ? '2px solid var(--accent-red)' : '2px solid transparent', padding: '16px', borderRadius: '12px', marginBottom: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <strong style={{ color: 'var(--primary-dark)', fontSize: '16px' }}>Basic</strong>
          <span style={{ background: '#f0f0f5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Rs. 29/wk</span>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Max Payout: Rs. 600 / week</p>
      </div>

      <div onClick={() => handleSelect('standard')} style={{ background: 'white', border: selected === 'standard' ? '2px solid var(--accent-red)' : '2px solid transparent', padding: '16px', borderRadius: '12px', marginBottom: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-10px', right: '16px', background: 'var(--accent-red)', color: 'white', fontSize: '10px', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>RECOMMENDED</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <strong style={{ color: 'var(--primary-dark)', fontSize: '16px' }}>Standard</strong>
          <span style={{ background: '#f0f0f5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Rs. 49/wk</span>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Max Payout: Rs. 1,200 / week</p>
      </div>

      <div onClick={() => handleSelect('premium')} style={{ background: 'white', border: selected === 'premium' ? '2px solid var(--accent-red)' : '2px solid transparent', padding: '16px', borderRadius: '12px', marginBottom: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <strong style={{ color: 'var(--primary-dark)', fontSize: '16px' }}>Premium</strong>
          <span style={{ background: '#f0f0f5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Rs. 99/wk</span>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Max Payout: Rs. 2,500 / week</p>
      </div>
    </div>
  );
};

// -- SCREEN 9 --
const Screen7 = ({ onNext }) => (
  <div className="animate-slide" style={{ padding: '40px 24px', height: '100%', backgroundColor: 'var(--primary-dark)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <div className="animate-pulse" style={{ width: '80px', height: '80px', background: 'rgba(39, 174, 96, 0.2)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle size={48} color="var(--success-green)" />
      </div>
      <h2 style={{ color: 'white', marginBottom: '8px' }}>Policy Activated!</h2>
      <p style={{ color: 'var(--success-green)', fontWeight: 'bold' }}>Score: 135/140 - AUTO APPROVED</p>
    </div>

    <div style={{ background: 'var(--bg-dark-gradient)', border: '1px solid #2a2a4a', padding: '20px', borderRadius: '16px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'white', fontSize: '14px' }}><span>Name</span><strong>Rajesh Kumar</strong></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'white', fontSize: '14px' }}><span>Base Rate</span><strong>Rs. 49 / wk</strong></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'white', fontSize: '14px' }}><span>Coverage</span><strong style={{textAlign: 'right'}}>Rain, Heat, AQI</strong></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: '14px' }}><span>AutoPay</span><strong style={{color:'var(--accent-yellow)'}}>rajesh@okaxis</strong></div>
    </div>
    
    <button className="btn-primary" style={{ width: '100%' }} onClick={onNext}>Go to Dashboard</button>
  </div>
);

// -- SCREEN 8 --
const Screen8 = () => (
  <div className="animate-slide" style={{ height: '100%', backgroundColor: '#f8f7f4', display: 'flex', flexDirection: 'column' }}>
    <div style={{ background: 'var(--primary-dark)', padding: '40px 24px 24px', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Hi, Rajesh</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(39,174,96,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: 'var(--success-green)' }}>
          <div style={{width:'8px',height:'8px',background:'var(--success-green)',borderRadius:'50%'}}></div> Active
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Chennai • Zone Adyar</p>
    </div>

    <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
      {/* Alert Card */}
      <div style={{ background: '#fff3e0', borderLeft: '4px solid var(--accent-yellow)', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <AlertCircle color="var(--accent-yellow)" size={20} style={{flexShrink: 0}} />
        <p style={{ margin: 0, fontSize: '13px', color: '#b97700' }}>Rain forecast tomorrow in Adyar. Your coverage is active.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Earnings Protected</p>
          <strong style={{ fontSize: '18px', color: 'var(--primary-dark)' }}>Rs. 2,450</strong>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Claims Paid</p>
          <strong style={{ fontSize: '18px', color: 'var(--primary-dark)' }}>3</strong>
        </div>
      </div>

      <h4 style={{ color: 'var(--primary-dark)', marginBottom: '16px', fontSize: '14px' }}>Recent Claims</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { type: 'Heavy Rain', date: '14 Mar', amount: 61 },
          { type: 'Bandh', date: '8 Mar', amount: 122 },
          { type: 'High AQI', date: '1 Mar', amount: 43 }
        ].map((c, i) => (
          <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-dark)', marginBottom: '4px' }}>{c.type}</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.date}</span>
            </div>
            <strong style={{ color: 'var(--success-green)' }}>+ Rs. {c.amount}</strong>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PhoneFrame;
