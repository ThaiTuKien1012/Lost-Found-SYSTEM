/**
 * Main Layout Component
 * Layout for authenticated pages with Sidebar
 */

import React from 'react';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <main className="app-main" style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;

