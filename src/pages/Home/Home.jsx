import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
const Home = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  // Parse date from DD-MM-YYYY HH:MM:SS format
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    
    // Extract date part (DD-MM-YYYY) from "04-02-2026 00:00:00"
    const datePart = dateString.split(' ')[0];
    const [day, month, year] = datePart.split('-');
    
    // Create date object (month is 0-indexed in JavaScript)
    return new Date(year, month - 1, day);
  };
  
  const currentDate = parseDate(userData.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });



  const quickActions = [
    {
      title: "Sales Invoice",
      // description: "Create new sales invoices and manage existing records.",
      path: "/sales-invoice",
      color: "from-blue-500 to-cyan-500",
      icon: "📋",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Purchase Invoice",
      // description: "Record purchases and track supplier transactions.",
      path: "/transactions/purchase-invoice",
      color: "from-emerald-500 to-teal-500",
      icon: "📦",
      image: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Sales Return",
      // description: "Update scrap rates and view historical pricing.",
      path: "/transactions/sales-return",
      color: "from-amber-500 to-orange-500",
      icon: "⚖️",
      image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Bill Collector",
      // description: "Manage bill collection and customer payment tracking.",
      path: "/transactions/bill-collector",
      color: "from-violet-500 to-purple-500",
      icon: "💰",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ];

  const stats = [
    { label: "Today's Sales", value: "₹42,580", change: "+12.5%" },
    { label: "Pending Invoices", value: "18", change: "-3" },
    { label: "Active Suppliers", value: "24", change: "+2" },
    { label: "Inventory Items", value: "156", change: "Updated" }
  ];

  return (
    <div className="home-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .home-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          color: #111827;
          overflow-x: hidden;
        }

        /* Glass Morphism Effect */
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
        }

        /* Floating Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .floating {
          animation: float 6s ease-in-out infinite;
        }

        /* Gradient Text */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Pulse Animation */
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.2); }
          50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.4); }
        }

        .pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        /* Main Content */
        .main-content {
          max-width: 1440px;
          margin: 0 auto;
          padding: 32px;
        }

        /* Header Section */
        .header-section {
          margin-bottom: 48px;
          position: relative;
        }

        .welcome-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -0.025em;
          line-height: 1.1;
        }

        .store-name {
          background: linear-gradient(135deg, #06A7EA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
        }

        .subtitle {
          font-size: 1.25rem;
          color: #6b7280;
          font-weight: 400;
          margin-bottom: 24px;
          max-width: 600px;
        }

        /* Date Display */
        .date-display {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #06A7EA );
          color: white;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 500;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .stat-card {
          padding: 28px;
          border-radius: 20px;
          background: white;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(229, 231, 235, 0.5);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border-color: rgba(102, 126, 234, 0.2);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 12px 0;
          background: linear-gradient(135deg, #111827 0%, #4b5563 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-change {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: #dcfce7;
          color: #166534;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Quick Actions */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.025em;
        }

        .view-all {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-weight: 500;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-all:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 32px;
          margin-bottom: 64px;
        }

        .action-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(229, 231, 235, 0.5);
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .action-card:hover::before {
          opacity: 1;
        }

        .action-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.12);
          border-color: rgba(102, 126, 234, 0.3);
        }

        .action-image {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .action-image::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(to top, rgba(255,255,255,1), transparent);
        }

        .action-icon {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          background: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }

        .action-body {
          padding: 32px;
          position: relative;
        }

        .action-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: -0.025em;
        }

        .action-desc {
          font-size: 1rem;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .action-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #06A7EA );
          color: white;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }

        .action-cta:hover {
          transform: translateX(8px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
        }

        .header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}


       

        .floating-1 {
          top: -100px;
          right: -100px;
          animation-delay: 0s;
        }

        .floating-2 {
          bottom: -100px;
          left: -100px;
          animation-delay: 2s;
        }

        /* Footer */
        .footer {
          margin-top: 96px;
          padding: 48px 32px;
          text-align: center;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .footer-content {
          max-width: 1440px;
          margin: 0 auto;
        }

        .footer-text {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 16px;
        }


        @media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-display {
    margin-top: 12px;
  }
}

        /* Responsive */
        @media (max-width: 1024px) {
          .main-content {
            padding: 24px;
          }
          
          .welcome-title {
            font-size: 2.5rem;
          }
          
          .quick-actions-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .welcome-title {
            font-size: 2rem;
          }
          
          .section-title {
            font-size: 1.5rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .action-card:hover {
            transform: translateY(-8px);
          }
          
          .floating-element {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 16px;
          }
          
          .welcome-title {
            font-size: 1.75rem;
          }
          
          .date-display {
            font-size: 0.875rem;
            padding: 10px 20px;
          }
          
          .action-body {
            padding: 24px;
          }
        }
      `}</style>

      <motion.div 
        className="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Floating Background Elements */}
        <div className="floating-element floating floating-1" />
        <div className="floating-element floating floating-2" />

        {/* Header Section */}
   <div className="header-section">
  <div className="header-top">
    <motion.h1 
      className="welcome-title"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      Welcome to <span className="store-name">R Sankarapandian Stores</span>
    </motion.h1>

    <motion.div 
      className="date-display"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      📅 {currentDate}
    </motion.div>
  </div>

  <motion.p 
    className="subtitle"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.2 }}
  >
    Professional Inventory & Billing Management System
  </motion.p>
</div>


  

        {/* Quick Actions Section */}
        <div className="section-header">
          <motion.h2 
            className="section-title"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Quick Actions
          </motion.h2>
          
          
        </div>

        {/* Quick Actions Grid */}
        <motion.div 
          className="quick-actions-grid"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              className="action-card glass-effect"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
              onClick={() => navigate(action.path)}
            >
              <div 
                className="action-image"
                style={{ backgroundImage: `url(${action.image})` }}
              >
                <div className="action-icon">{action.icon}</div>
              </div>
              
              <div className="action-body">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-desc">{action.description}</p>
                <motion.button 
                  className="action-cta"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                  <span>→</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

    
      </motion.div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">
            © {new Date().getFullYear()} Sankarapandian Store. All rights reserved.
          </p>
          <p className="footer-text">
            Professional Inventory Management System | Version 2.1
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;