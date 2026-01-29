import React from "react";

const Home = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="home-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
          --primary: #2563eb;
          --primary-dark: #1d4ed8;
          --primary-light: #dbeafe;
          --secondary: #475569;
          --accent: #f59e0b;
          --bg: #f8fafc;
          --card: #ffffff;
          --text: #1e293b;
          --text-light: #64748b;
          --border: #e2e8f0;
          --shadow: 0 1px 3px rgba(0,0,0,0.1);
          --shadow-lg: 0 10px 25px -5px rgba(0,0,0,0.1);
          --radius: 12px;
          --radius-sm: 8px;
          --header-height: 64px;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .home-root {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: var(--text);
          line-height: 1.5;
        }

        /* Header */
        .header {
          background: var(--card);
          border-bottom: 1px solid var(--border);
          height: var(--header-height);
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .company-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .company-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 20px;
        }

        .company-name {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .user-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logout-btn {
          padding: 8px 16px;
          background: var(--primary-light);
          color: var(--primary);
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: var(--primary);
          color: white;
        }

        /* Main Content */
        .main-content {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Welcome Section */
        .welcome-section {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: var(--radius);
          padding: 32px;
          color: white;
          margin-bottom: 32px;
          box-shadow: var(--shadow-lg);
        }

        .welcome-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .welcome-subtitle {
          font-size: 16px;
          opacity: 0.9;
          margin-bottom: 24px;
          max-width: 600px;
        }

        .date-display {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.15);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: var(--card);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          color: var(--primary);
          font-size: 24px;
        }

        .stat-title {
          font-size: 14px;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }

        .stat-trend {
          font-size: 14px;
          color: #10b981;
          font-weight: 500;
        }

        .stat-trend.negative {
          color: #ef4444;
        }

        /* Quick Actions */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .action-card {
          background: var(--card);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--primary);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .action-card:hover::before {
          opacity: 1;
        }

        .action-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-sm);
          background: linear-gradient(135deg, var(--primary-light), #dbeafe);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          color: var(--primary);
          font-size: 24px;
        }

        .action-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }

        .action-desc {
          font-size: 14px;
          color: var(--text-light);
          line-height: 1.6;
        }

        /* Master Operations */
        .master-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .master-item {
          background: var(--card);
          border-radius: var(--radius-sm);
          padding: 16px;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          font-weight: 500;
          color: var(--text);
        }

        .master-item:hover {
          background: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        /* Footer */
        .footer {
          background: var(--card);
          border-top: 1px solid var(--border);
          padding: 24px;
          text-align: center;
          color: var(--text-light);
          font-size: 14px;
          margin-top: 40px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .main-content {
            padding: 16px;
          }

          .welcome-section {
            padding: 24px;
          }

          .welcome-title {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .master-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .header {
            padding: 0 16px;
          }

          .company-name {
            font-size: 18px;
          }

          .welcome-title {
            font-size: 20px;
          }

          .master-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>


      {/* Main Content */}
      <main className="main-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to Sankarapandian Store</h1>
          
          <div className="date-display">
            📅 {currentDate}
          </div>
        </div>

    
        {/* Quick Actions */}
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        
        <div className="quick-actions-grid">
          <div className="action-card">
            <div className="action-icon">🧾</div>
            <h3 className="action-title">Sales Invoice</h3>
            <p className="action-desc">Create new sales invoices and manage existing ones</p>
          </div>

          <div className="action-card">
            <div className="action-icon">🛒</div>
            <h3 className="action-title">Purchase Entry</h3>
            <p className="action-desc">Record and manage purchase transactions</p>
          </div>

          <div className="action-card">
            <div className="action-icon">📊</div>
            <h3 className="action-title">Reports</h3>
            <p className="action-desc">Generate sales, stock, and financial reports</p>
          </div>

          <div className="action-card">
            <div className="action-icon">👥</div>
            <h3 className="action-title">Customer Management</h3>
            <p className="action-desc">Manage customer information and transaction history</p>
          </div>

          <div className="action-card">
            <div className="action-icon">📦</div>
            <h3 className="action-title">Inventory</h3>
            <p className="action-desc">View and manage stock levels and items</p>
          </div>

          <div className="action-card">
            <div className="action-icon">💰</div>
            <h3 className="action-title">Payments</h3>
            <p className="action-desc">Process payments and view payment history</p>
          </div>
        </div>

        {/* Master Operations */}
        <div className="section-header">
          <h2 className="section-title">Master Operations</h2>
        </div>
        
        <div className="master-grid">
          <div className="master-item">Transactions</div>
          <div className="master-item">Tagging</div>
          <div className="master-item">Achari</div>
          <div className="master-item">Repair Slip</div>
          <div className="master-item">Labour</div>
          <div className="master-item">Approval</div>
          <div className="master-item">Conversion</div>
          <div className="master-item">Estimate</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Sankarapandian Store. All rights reserved.</p>
        <p style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
          Business Management System v2.1
        </p>
      </footer>
    </div>
  );
};

export default Home;