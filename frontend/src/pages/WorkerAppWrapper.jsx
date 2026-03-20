import React, { useState } from 'react';
import PhoneFrame from '../components/worker/PhoneFrame';
import ScreenDetails from '../components/worker/ScreenDetails';

const WorkerAppWrapper = () => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      height: 'calc(100vh - 72px)', /* minus nav */
      overflow: 'hidden'
    }}>
      
      {/* LEFT PANEL - PHONE FRAME */}
      <div style={{
        flex: '0 0 500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--primary-dark)',
        backgroundImage: 'var(--bg-dark-gradient)',
        padding: '40px',
        borderRight: '1px solid #2a2a4a'
      }}>
        <PhoneFrame currentStep={currentStep} onNext={(step) => setCurrentStep(step)} />
      </div>

      {/* RIGHT PANEL - SCREEN DETAILS */}
      <div style={{
        flex: 1,
        backgroundColor: 'var(--surface-gray)',
        overflowY: 'auto',
        padding: '48px'
      }}>
        <ScreenDetails currentStep={currentStep} />
      </div>
      
    </div>
  );
};

export default WorkerAppWrapper;
