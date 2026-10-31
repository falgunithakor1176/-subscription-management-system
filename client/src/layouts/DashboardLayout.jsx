/**
 * DashboardLayout.jsx
 * Unified Enterprise SaaS Shell inspired by Stripe Dashboard & Linear.
 * Uses shared Sidebar and AppHeader components with mobile responsive drawer.
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import AppHeader from '../components/common/AppHeader.jsx';

const DashboardLayout = () => {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  return (
    <div className="shared-app-layout">
      {/* 240px White Left Navigation Sidebar */}
      <Sidebar
        isOpen={isSidebarMobileOpen}
        onClose={() => setIsSidebarMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="shared-app-main">
        {/* Sticky 60px App Header */}
        <AppHeader
          onToggleSidebar={() => setIsSidebarMobileOpen((prev) => !prev)}
        />

        {/* Dynamic Page Content with consistent max-width and padding */}
        <main className="shared-app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
