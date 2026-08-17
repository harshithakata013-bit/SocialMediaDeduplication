import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DuplicateDetection from './pages/DuplicateDetection';
import CustomerProfiles from './pages/CustomerProfiles';
import Standardization from './pages/Standardization';
import Analytics from './pages/Analytics';
import DataQuality from './pages/DataQuality';
import About from './pages/About';

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(o => !o);
    } else {
      setSidebarCollapsed(c => !c);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileToggle={handleToggle}
      />
      <main
        className={`main-content ${sidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''}`}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/duplicates" element={<DuplicateDetection />} />
          <Route path="/customers" element={<CustomerProfiles />} />
          <Route path="/standardization" element={<Standardization />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/data-quality" element={<DataQuality />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
