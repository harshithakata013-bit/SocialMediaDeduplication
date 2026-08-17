import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';

export default function Navbar({ sidebarCollapsed, mobileOpen, onMobileToggle }) {
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/customers?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header className={`navbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile menu button */}
      <button
        className="navbar-icon-btn"
        onClick={onMobileToggle}
        style={{ display: 'none' }}
        id="mobile-menu-btn"
      >
        {mobileOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* Mobile hamburger visible via CSS */}
      <button
        className="navbar-icon-btn mobile-only"
        onClick={onMobileToggle}
        style={{ marginRight: 4 }}
      >
        {mobileOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      <div className="navbar-title-group">
        <span className="navbar-title">Social Media Profile Deduplication</span>
        <span className="navbar-subtitle">Profile matching, duplicate detection & data standardization</span>
      </div>

      <div className="navbar-spacer" />

      {/* Global Search */}
      <div className="navbar-search">
        <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search customer ID..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <span className="navbar-badge">IBM Q2D</span>

      <button className="navbar-icon-btn" title="Notifications">
        <Bell size={15} />
      </button>
    </header>
  );
}
