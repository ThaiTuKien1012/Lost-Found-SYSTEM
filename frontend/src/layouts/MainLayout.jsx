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
      <main className="app-main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

