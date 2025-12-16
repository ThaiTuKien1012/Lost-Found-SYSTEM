/**
 * Main Layout Component
 * Layout for authenticated pages with Sidebar
 */

import React from 'react';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';

const MainLayout = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#F5F5F5',
    }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: '280px',
        minHeight: '100vh',
      }}>
        <main style={{
          flex: 1,
          overflowY: 'auto',
          background: '#F5F5F5',
        }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;

