import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuOutlined,
  LogoutOutlined,
  CloseOutlined,
  HomeOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  UserOutlined,
  ShopOutlined,
  TeamOutlined,
  BuildOutlined,
  DatabaseOutlined,
  DollarOutlined,
  DownOutlined,
  UpOutlined, MoneyCollectOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Space, Modal } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import DropdownMenu from './DropdownMenu';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mobileMenuState, setMobileMenuState] = useState({
    masters: false,
    transactions: false
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { hasPermission } = usePermissions();

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      document.body.classList.remove('mobile-menu-open');
    };
  }, []);

  // Handle body scroll when mobile menu opens
  useEffect(() => {
    if (isMobile && isMenuOpen) {
      document.body.classList.add('mobile-menu-open');
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      document.body.classList.remove('mobile-menu-open');
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobile, isMenuOpen]);

  const masterItems = [
    // { name: 'Popup List Selector Example', path: '/popup-list-selector-example', icon: <AppstoreOutlined /> },
        { name: 'Item Creation', path: '/masters/ItemCreation', icon: <BuildOutlined />, permission: 'ITEM_CREATION' },
    { name: 'Company Creation', path: '/masters/company-creation', icon: <BuildOutlined />, permission: 'COMPANY_CREATION' },
    { name: 'Product Creation', path: '/masters/product-creation', icon: <BuildOutlined />, permission: 'PRODUCT_CREATION' },
    { name: 'Brand Creation', path: '/masters/brand-creation', icon: <BuildOutlined />, permission: 'BRAND_CREATION' },
    { name: 'Category Creation', path: '/masters/category-creation', icon: <BuildOutlined />, permission: 'CATEGORY_CREATION' },
    { name: 'Design Creation', path: '/design-creation', icon: <BuildOutlined />, permission: 'DESIGN_CREATION' },
    { name: 'Size Creation', path: '/masters/size-creation', icon: <TeamOutlined />, permission: 'SIZE_CREATION' },
    { name: 'Color Creation', path: '/masters/color-creation', icon: <TeamOutlined />, permission: 'COLOR_CREATION' },
    { name: 'State Creation', path: '/masters/Statecreation', icon: <BuildOutlined />, permission: 'STATE_CREATION' },

    { name: 'Unit Creation', path: '/masters/unit-creation', icon: <TeamOutlined />, permission: 'UNIT_CREATION' },
    { name: 'Model Creation', path: '/masters/model-creation', icon: <TeamOutlined />, permission: 'MODEL_CREATION' },
    { name: 'Salesman Creation', path: '/masters/SalesmanCreation', icon: <UserOutlined />, permission: 'SALESMAN_CREATION' },
    { name: 'Scrap Creation', path: '/masters/scrap-page', icon: <BuildOutlined />, permission: 'SCRAP_CREATION' },
        { name: 'User Creation', path: '/masters/User-creation', icon: <BuildOutlined />, permission: 'USER_CREATION' },
        { name: 'Administration', path: '/Administration', icon: <BuildOutlined /> },

  ];

  const transactionItems = [
        { name: 'Purchase Invoice', path: '/transactions/purchase-invoice', icon: <DollarOutlined />, permission: 'PURCHASE_INVOICE' },
       { name: 'Purchase Return', path: '/transactions/Purchasereturn', icon: <DollarOutlined />, permission: 'PURCHASE_RETURN' },
    { name: 'Receipt Voucher', path: '/transactions/receipt-voucher', icon: <MoneyCollectOutlined />, permission: 'RECEIPT_VOUCHER' },
    { name: 'Payment Voucher', path: '/payment-voucher', icon: <MoneyCollectOutlined />, permission: 'PAYMENT_VOUCHER' },

    { name: 'Sales Invoice', path: '/sales-invoice', icon: <FileTextOutlined />, permission: 'SALES_INVOICE' },
    { name: 'Sales Return', path: '/transactions/sales-return', icon: <FileTextOutlined />, permission: 'SALES_RETURN' },
    { name: 'ScrapRateFix', path: '/mastersScrapRateFix/', icon: <BuildOutlined />, permission: 'SCRAP_RATE_FIX' },
    { name: 'ScrapProcurement', path: '/ScrapProcurement', icon: <BuildOutlined />, permission: 'SCRAP_PROCUREMENT' },
    { name: 'Tender', path: '/Transaction/Tender', icon: <DollarOutlined />, permission: 'TENDER' },
    { name: 'Bill Collector', path: '/transactions/bill-collector', icon: <MoneyCollectOutlined />, permission: 'BILL_COLLECTOR' },
  ];

  // Filter items based on permissions
  const filteredMasterItems = useMemo(() => {
    return masterItems.filter(item => !item.permission || hasPermission(item.permission));
  }, [hasPermission]);

  const filteredTransactionItems = useMemo(() => {
    return transactionItems.filter(item => !item.permission || hasPermission(item.permission));
  }, [hasPermission]);

  // Desktop hover handlers
  const handleMouseEnter = (menu) => {
    if (!isMobile) {
      setActiveDropdown(menu);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setActiveDropdown(null);
    }
  };

  // Desktop click handler (for closing other dropdown when one opens)
  const handleDropdownClick = (menu) => {
    if (!isMobile) {
      if (activeDropdown === menu) {
        setActiveDropdown(null);
      } else {
        setActiveDropdown(menu);
      }
    }
  };

  // Mobile menu toggle handlers
  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setMobileMenuState({ masters: false, transactions: false });
  };

  const toggleMobileDropdown = (menu) => {
    setMobileMenuState(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleLogout = () => {
    // Clear authentication data
    logout();
    // Close modal and mobile menu
    setLogoutModalOpen(false);
    closeMobileMenu();
    // Navigate to login page
    navigate('/login');
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit?')) {
      window.close();
    }
  };

  const showLogoutConfirm = () => {
    setLogoutModalOpen(true);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles['nav-container']}>
          {/* Left: Logo */}
          <Link to="/" className={styles['nav-logo']} onClick={closeMobileMenu}>
            <span className={styles['logo-text']}>Sankarapandian</span>
            <span className={styles['logo-subtext']}>Store</span>
          </Link>
  {!isMobile && (
  <div className={styles['nav-screen-title']}>
    {(() => {
      const path = location.pathname || '/';

      // Simple mapping for common routes
      const map = {
        '/': 'Home',
        '/masters': 'Masters',
        '/transactions': 'Transactions',
        '/masters/ledger-creation': 'Ledger Creation',
        '/masters/unit-creation': 'Unit Creation',
        '/masters/color-creation': 'Color Creation',
        '/masters/size-creation': 'Size Creation',
        '/masters/model-creation': 'Model Creation',
        '/masters/user-creation': 'User Creation',
        '/administration': 'Administration',
      };

      // if path is predefined in map
      if (map[path]) return map[path];

      // derive a friendly title from last part of path
      const parts = path.split('/').filter(Boolean);
      if (parts.length === 0) return 'Home';

      const last = parts[parts.length - 1];
      return last
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    })()}
  </div>
)}

          {/* Center: Navigation Menu (Desktop) */}
          {!isMobile && (
            <div className={styles['nav-center-menu']}>
              <div className={styles['nav-menu']}>
                <Link
                  to="/"
                  className={`${styles['nav-link']} ${location.pathname === '/' ? styles.active : ''}`}
                >
                  <HomeOutlined /> Home
                </Link>

                {/* Masters Dropdown - Click to open/close */}
                <div
                  className={`${styles['nav-item']} ${styles.dropdown}`}
                  onMouseEnter={() => handleMouseEnter('masters')}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleDropdownClick('masters')}
                >
                  <button className={`${styles['nav-link']} ${styles['dropdown-toggle']} ${activeDropdown === 'masters' || location.pathname.includes('/masters') ? styles.active : ''}`}>
                    <AppstoreOutlined /> Masters
                    <span className={styles['arrow-icon']}>
                      {activeDropdown === 'masters' ? <UpOutlined /> : <DownOutlined />}
                    </span>
                  </button>
                  {activeDropdown === 'masters' && (
                    <div className={`${styles['dropdown-container']} ${styles.masters}`}>
                      <DropdownMenu
                        items={filteredMasterItems}
                        onItemClick={() => setActiveDropdown(null)}
                        position="center"
                      />
                    </div>
                  )}
                </div>

                {/* Transactions Dropdown - Click to open/close */}
                <div
                  className={`${styles['nav-item']} ${styles.dropdown}`}
                  onMouseEnter={() => handleMouseEnter('transactions')}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleDropdownClick('transactions')}
                >
                  <button className={`${styles['nav-link']} ${styles['dropdown-toggle']} ${activeDropdown === 'transactions' || location.pathname.includes('/transactions') ? styles.active : ''}`}>
                    <FileTextOutlined /> Transactions
                    <span className={styles['arrow-icon']}>
                      {activeDropdown === 'transactions' ? <UpOutlined /> : <DownOutlined />}
                    </span>
                  </button>
                  {activeDropdown === 'transactions' && (
                    <div className={styles['dropdown-container']}>
                      <DropdownMenu
                        items={filteredTransactionItems}
                        onItemClick={() => setActiveDropdown(null)}
                        position="center"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className={styles['nav-actions']}>
            {isMobile ? (
              <Button
                type="text"
                icon={isMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
                onClick={toggleMobileMenu}
                className={styles['menu-toggle']}
              />
            ) : (
              <Space className={styles['action-buttons']}>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'logout',
                        label: 'Logout',
                        icon: <LogoutOutlined />,
                        onClick: showLogoutConfirm,
                      },
                      {
                        key: 'exit',
                        label: 'Exit',
                        icon: <CloseOutlined />,
                        onClick: handleExit,
                      },
                    ],
                  }}
                  placement="bottomRight"
                >
                  <Button type="text" icon={<UserOutlined />} className={styles['user-menu']}   style={{ marginRight: '-120px' }}>
                    Admin
                  </Button>
                </Dropdown>
              </Space>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {/* Mobile Menu Overlay */}
        {isMobile && isMenuOpen && (
          <div
            className={styles['mobile-menu-overlay']}
            onClick={closeMobileMenu}
          >
            <div
              className={styles['mobile-menu']}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles['mobile-menu-header']}>
                <Link to="/" onClick={closeMobileMenu} className={styles['nav-logo']}>
                  <span className={styles['logo-text']}>Sankarapandian</span>
                  <span className={styles['logo-subtext']}>Stores</span>
                </Link>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={closeMobileMenu}
                  className={styles['close-menu-btn']}
                />
              </div>

              <div className={styles['mobile-menu-content']}>
                <div className={styles['mobile-menu-items']}>
                  <Link
                    to="/"
                    className={`${styles['mobile-link']} ${location.pathname === '/' ? styles.active : ''}`}
                    onClick={closeMobileMenu}
                  >
                    <HomeOutlined /> Home
                  </Link>

                  {/* Masters Accordion */}
                  <div className={styles['mobile-dropdown-accordion']}>
                    <div
                      className={`${styles['mobile-dropdown-header']} ${mobileMenuState.masters ? styles.active : ''}`}
                      onClick={() => toggleMobileDropdown('masters')}
                    >
                      <div className={styles['header-content']}>
                        <AppstoreOutlined /> Masters
                      </div>
                      <span className={styles['arrow-icon']}>
                        {mobileMenuState.masters ? <UpOutlined /> : <DownOutlined />}
                      </span>
                    </div>
                    <div className={`${styles['mobile-dropdown-items']} ${mobileMenuState.masters ? styles.open : ''}`}>
                      {filteredMasterItems.map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`${styles['mobile-dropdown-item']} ${location.pathname === item.path ? styles.active : ''}`}
                          onClick={closeMobileMenu}
                        >
                          {item.icon} {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Transactions Accordion */}
                  <div className={styles['mobile-dropdown-accordion']}>
                    <div
                      className={`${styles['mobile-dropdown-header']} ${mobileMenuState.transactions ? styles.active : ''}`}
                      onClick={() => toggleMobileDropdown('transactions')}
                    >
                      <div className={styles['header-content']}>
                        <FileTextOutlined /> Transactions
                      </div>
                      <span className={styles['arrow-icon']}>
                        {mobileMenuState.transactions ? <UpOutlined /> : <DownOutlined />}
                      </span>
                    </div>
                    <div className={`${styles['mobile-dropdown-items']} ${mobileMenuState.transactions ? styles.open : ''}`}>
                      {filteredTransactionItems.map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`${styles['mobile-dropdown-item']} ${location.pathname === item.path ? styles.active : ''}`}
                          onClick={closeMobileMenu}
                        >
                          {item.icon} {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer with side-by-side buttons */}
                <div className={styles['mobile-menu-footer']}>
                  <div className={styles['mobile-action-buttons']}>
                    <Button
                      icon={<LogoutOutlined />}
                      onClick={() => {
                        closeMobileMenu();
                        showLogoutConfirm();
                      }}
                      className={styles['mobile-logout-btn']}
                    >
                      Logout
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={() => {
                        closeMobileMenu();
                        handleExit();
                      }}
                      className={styles['mobile-exit-btn']}
                    >
                      Exit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal
        title="Confirm Logout"
        open={logoutModalOpen}
        onOk={handleLogout}
        onCancel={() => setLogoutModalOpen(false)}
        okText="Logout"
        cancelText="Cancel"
        okButtonProps={{ danger: true, icon: <LogoutOutlined /> }}
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </>
  );
};

export default Navbar;