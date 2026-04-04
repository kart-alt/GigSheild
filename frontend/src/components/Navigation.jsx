import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Info, Smartphone, UserPlus, ShieldCheck, Calculator, ClipboardList } from 'lucide-react';
const Navigation = () => {
  return (
    <nav style={{
      backgroundColor: 'var(--primary-dark)',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Shield size={28} color="var(--accent-red)" />
        <span style={{ 
          color: 'var(--surface-white)', 
          fontSize: '24px', 
          fontWeight: '700',
          letterSpacing: '-0.5px'
        }}>
          GigShield
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <NavItem to="/register" icon={<UserPlus size={18} />} label="Register" />
        <NavItem to="/policies" icon={<ShieldCheck size={18} />} label="My Policies" />
        <NavItem to="/premium" icon={<Calculator size={18} />} label="Premium" />
        <NavItem to="/claims" icon={<ClipboardList size={18} />} label="Claims" />
        <NavItem to="/worker" icon={<Smartphone size={18} />} label="Worker Demo" />
        <NavItem to="/admin" icon={<LayoutDashboard size={18} />} label="Admin Dashboard" />
        <NavItem to="/info" icon={<Info size={18} />} label="System Info" />
      </div>    </nav>
  );
};

// Internal Navigation Item Component
const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        textDecoration: 'none',
        color: isActive ? 'var(--surface-white)' : 'var(--text-secondary)',
        backgroundColor: isActive ? 'rgba(232, 83, 60, 0.1)' : 'transparent',
        borderBottom: isActive ? '2px solid var(--accent-red)' : '2px solid transparent',
        borderRadius: '6px 6px 0 0',
        fontWeight: '600',
        transition: 'all 0.2s ease',
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default Navigation;
