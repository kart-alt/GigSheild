import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WorkerAppWrapper from './pages/WorkerAppWrapper';
import AdminDashboard from './pages/AdminDashboard';
import SystemInfo from './pages/SystemInfo';
import Navigation from './components/Navigation';

import './index.css';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--surface-gray)' }}>
        <Navigation />
        
        <main style={{ flex: 1, display: 'flex' }}>
          <Routes>
            <Route path="/worker" element={<WorkerAppWrapper />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/info" element={<SystemInfo />} />
            <Route path="/" element={<Navigate to="/worker" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
