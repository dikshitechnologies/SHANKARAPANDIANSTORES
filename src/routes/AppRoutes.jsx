import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TestPage from '../pages/TestPage/TestPage';
import LedgerCreation from '../pages/Ledgercreation/Ledgercreation';
import ItemCreation from '../pages/ItemCreation/ItemCreation';
import LedgerGroupCreation from '../pages/Ledgergroupcreation/Ledgergroupcreation';
import ItemGroupCreation from '../pages/ItemGroupCreation/ItemGroupCreation';
import BillCollector from '../pages/billcollector/billcollectior';
import DesignCreation from '../pages/DesignCreation/DesignCreation';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/ledger-creation" element={<LedgerCreation />} />
        <Route path="/item-creation" element={<ItemCreation />} />
        <Route path="/ledger-group-creation" element={<LedgerGroupCreation />} />
        <Route path="/item-group-creation" element={<ItemGroupCreation />} />
        <Route path="/bill-collector" element={<BillCollector />} />
        <Route path="/design-creation" element={<DesignCreation />} />
        {/* Add more routes here */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/products" element={<Products />} /> */}
        {/* <Route path="/settings" element={<Settings />} /> */}

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

const NotFound = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">Go back to home</a>
  </div>
);

const HomePage = () => (
  <div style={{
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
  }}>
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '10px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
        Shankara Pandian Stores
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '40px', opacity: 0.9 }}>
        Modern Business Management System
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { path: '/test', label: '🧪 Test Page', color: '#FF6B6B' },
          { path: '/item-creation', label: '📦 Item Creation', color: '#4ECDC4' },
          { path: '/item-group-creation', label: '📂 Item Group', color: '#45B7D1' },
          { path: '/ledger-creation', label: '📊 Ledger Creation', color: '#FFA502' },
          { path: '/ledger-group-creation', label: '📇 Ledger Group', color: '#F7B731' },
          { path: '/bill-collector', label: '💳 Bill Collector', color: '#5F27CD' }
        ].map((item, idx) => (
          <a
            key={idx}
            href={item.path}
            style={{
              padding: '30px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              textDecoration: 'none',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = `linear-gradient(135deg, ${item.color}, rgba(255,255,255,0.2))`;
              e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(31, 38, 135, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)';
            }}
          >
            {item.label}
          </a>
        ))}
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '30px',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        marginTop: '40px'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '15px' }}>📋 Quick Guide</h2>
        <ul style={{ lineHeight: '2', fontSize: '16px', opacity: 0.95 }}>
          <li>✅ <strong>Item Creation:</strong> Add and manage inventory items</li>
          <li>✅ <strong>Item Group:</strong> Organize items into categories</li>
          <li>✅ <strong>Ledger Management:</strong> Track financial accounts</li>
          <li>✅ <strong>Bill Collector:</strong> Process payment collections</li>
          <li>✅ <strong>Test Page:</strong> Try out sample features</li>
        </ul>
      </div>
    </div>
  </div>
);

export default AppRoutes;
