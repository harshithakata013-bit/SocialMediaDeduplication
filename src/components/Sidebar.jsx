import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, SearchX, Users, Sliders, BarChart3,
  ShieldCheck, Info, ChevronLeft, ChevronRight, Network
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/duplicates', label: 'Duplicate Detection', icon: SearchX },
  { to: '/customers', label: 'Customer Profiles', icon: Users },
  { to: '/standardization', label: 'Standardization', icon: Sliders },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/data-quality', label: 'Data Quality', icon: ShieldCheck },
  { to: '/about', label: 'About Project', icon: Info },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={onMobileClose}
      />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Network size={18} color="white" />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">DedupeIQ</span>
              <span className="sidebar-logo-sub">IBM Q2D Project</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {!collapsed && (
            <div className="sidebar-section-label">Navigation</div>
          )}
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onMobileClose}
              title={collapsed ? label : undefined}
            >
              <div className="sidebar-nav-icon">
                <Icon size={16} />
              </div>
              {!collapsed && (
                <span className="sidebar-nav-label">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer toggle */}
        <div className="sidebar-footer">
          <button className="sidebar-toggle-btn" onClick={onToggle}>
            {collapsed ? <ChevronRight size={14} /> : (
              <>
                <ChevronLeft size={14} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
