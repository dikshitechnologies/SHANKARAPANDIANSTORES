import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_ENDPOINTS } from '../../../api/endpoints';
import { API_BASE } from '../../../api/apiService';

const SearchIcon = ({ size = 16, color = " #1B91DA" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block" }}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const SalesReturnRegister = () => {
  // --- STATE MANAGEMENT ---
  const [fromDate, setFromDate] = useState('2026-01-05');
  const [toDate, setToDate] = useState('2026-01-05');
  const [tableLoaded, setTableLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [salesReturnData, setSalesReturnData] = useState([]);

  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const searchButtonRef = useRef(null);

  // Sample sales return register data
  const sampleSalesReturnData = [
    {
      id: 1,
      no: 1,
      salesParty: 'AMIT FASHION',
      billNo: 'SR0001',
      billDate: '27-09-2025',
      billAmount: '8,450.00'
    },
    {
      id: 2,
      no: 2,
      salesParty: 'CASH A/C',
      billNo: 'SR0002',
      billDate: '10-12-2025',
      billAmount: '2,250.00'
    },
    {
      id: 3,
      no: 3,
      salesParty: 'JOHN TRADERS',
      billNo: 'SR0003',
      billDate: '15-12-2025',
      billAmount: '15,800.00'
    },
    {
      id: 4,
      no: 4,
      salesParty: 'GLOBAL FASHION',
      billNo: 'SR0004',
      billDate: '18-12-2025',
      billAmount: '6,500.00'
    },
    {
      id: 5,
      no: 5,
      salesParty: 'PREMIUM TEXTILES',
      billNo: 'SR0005',
      billDate: '20-12-2025',
      billAmount: '12,750.00'
    },
    {
      isTotal: true,
      salesParty: 'Total',
      billAmount: '45,750.00'
    }
  ];

  // --- HANDLERS ---
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      toast.warning('Please fill all fields: From Date and To Date', {
        autoClose: 2000,
      });
      return;
    }

    console.log('Searching Sales Return Register with:', {
      fromDate,
      toDate
    });

    setIsLoading(true);

    try {
      // Convert dates to DD/MM/YYYY format as expected by API
      const formatDateForAPI = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const apiFromDate = formatDateForAPI(fromDate);
      const apiToDate = formatDateForAPI(toDate);

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.SALES_RETURN_REGISTER.GET_SALES_RETURN_REGISTER(apiFromDate, apiToDate, '001', 1, 200)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to match component's expected format
      const transformedData = [];

      if (data.data && data.data.length > 0) {
        data.data.forEach((item, index) => {
          transformedData.push({
            id: index + 1,
            no: index + 1,
            salesParty: item.name || '',
            billNo: item.invoice || '',
            billDate: item.voucherDate || '',
            billAmount: item.amount ? item.amount.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) : '0.00'
          });
        });

        // Add total row
        const totalAmount = data.data.reduce((sum, item) => sum + (item.amount || 0), 0);
        transformedData.push({
          isTotal: true,
          salesParty: 'Total',
          billAmount: totalAmount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        });
      }

      setSalesReturnData(transformedData);
      setTableLoaded(true);

    } catch (error) {
      console.error('Error fetching sales return register data:', error);
      toast.error('Failed to load sales return register data. Please try again.');
      setSalesReturnData([]);
      setTableLoaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setTableLoaded(false);
    setFromDate('2026-01-05');
    setToDate('2026-01-05');
    setSalesReturnData([]);
  };

  // Handle key navigation
  const handleKeyDown = (e, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      switch(currentField) {
        case 'fromDate':
          toDateRef.current?.focus();
          break;
        case 'toDate':
          searchButtonRef.current?.focus();
          break;
        default:
          break;
      }
    }
  };

  // Focus on fromDate field when component mounts
  useEffect(() => {
    if (fromDateRef.current) {
      fromDateRef.current.focus();
    }
  }, []);

  // --- SCREEN SIZE DETECTION ---
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      const isDesktop = width >= 1024;
      
      setScreenSize({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate total bill amount
  const totalBillAmount = salesReturnData
    .filter(row => !row.isTotal && row.billAmount)
    .reduce((sum, row) => sum + parseFloat(row.billAmount?.replace(/,/g, '') || 0), 0);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // --- STYLES ---
  const TYPOGRAPHY = {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: screenSize.isMobile ? '11px' : screenSize.isTablet ? '12px' : '13px',
      sm: screenSize.isMobile ? '12px' : screenSize.isTablet ? '13px' : '14px',
      base: screenSize.isMobile ? '13px' : screenSize.isTablet ? '14px' : '16px',
      lg: screenSize.isMobile ? '14px' : screenSize.isTablet ? '16px' : '18px',
      xl: screenSize.isMobile ? '16px' : screenSize.isTablet ? '18px' : '20px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6
    }
  };

  const styles = {
    container: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#f5f7fa',
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflowX: 'hidden',
      overflowY: 'hidden',
      position: 'fixed',
    },
    headerSection: {
      flex: '0 0 auto',
      backgroundColor: 'white',
      borderRadius: 0,
      padding: screenSize.isMobile ? '8px 10px' : screenSize.isTablet ? '10px 12px' : '12px 16px',
      margin: 0,
      marginBottom: 0,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflowY: 'visible',
      maxHeight: 'none',
    },
    tableSection: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
    },
    formField: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '4px' : screenSize.isTablet ? '6px' : '8px',
    },
    inlineLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#333',
      minWidth: screenSize.isMobile ? '70px' : screenSize.isTablet ? '75px' : '80px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
    inlineInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      paddingTop: screenSize.isMobile ? '6px' : screenSize.isTablet ? '7px' : '8px',
      paddingBottom: screenSize.isMobile ? '6px' : screenSize.isTablet ? '7px' : '8px',
      paddingLeft: screenSize.isMobile ? '8px' : screenSize.isTablet ? '9px' : '10px',
      paddingRight: screenSize.isMobile ? '8px' : screenSize.isTablet ? '9px' : '10px',
      border: '1px solid #ddd',
      borderRadius: screenSize.isMobile ? '4px' : '5px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
      width: '100%',
      height: screenSize.isMobile ? '36px' : screenSize.isTablet ? '38px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '90px' : screenSize.isTablet ? '100px' : '110px',
    },
    inlineInputFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      paddingTop: screenSize.isMobile ? '6px' : screenSize.isTablet ? '7px' : '8px',
      paddingBottom: screenSize.isMobile ? '6px' : screenSize.isTablet ? '7px' : '8px',
      paddingLeft: screenSize.isMobile ? '8px' : screenSize.isTablet ? '9px' : '10px',
      paddingRight: screenSize.isMobile ? '8px' : screenSize.isTablet ? '9px' : '10px',
      border: '2px solid #1B91DA',
      borderRadius: screenSize.isMobile ? '4px' : '5px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
      width: '100%',
      height: screenSize.isMobile ? '36px' : screenSize.isTablet ? '38px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '90px' : screenSize.isTablet ? '100px' : '110px',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      overflowX: 'auto',
      overflowY: 'auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      margin: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginTop: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginBottom: screenSize.isMobile ? '70px' : screenSize.isTablet ? '80px' : '90px',
      WebkitOverflowScrolling: 'touch',
      width: screenSize.isMobile ? 'calc(100% - 12px)' : screenSize.isTablet ? 'calc(100% - 20px)' : 'calc(100% - 32px)',
      boxSizing: 'border-box',
      flex: 'none',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: screenSize.isMobile ? '300px' : screenSize.isTablet ? '350px' : '400px',
      minHeight: screenSize.isMobile ? '200px' : screenSize.isTablet ? '250px' : '70%',
    },
    table: {
      width: 'max-content',
      minWidth: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
    },
    th: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      backgroundColor: '#1B91DA',
      color: 'white',
      padding: screenSize.isMobile ? '5px 3px' : screenSize.isTablet ? '7px 5px' : '10px 6px',
      textAlign: 'center',
      letterSpacing: '0.5px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      border: '1px solid white',
      borderBottom: '2px solid white',
      minWidth: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
      whiteSpace: 'nowrap',
      width: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
      maxWidth: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
    },
  td: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '8px 4px' : screenSize.isTablet ? '10px 6px' : '12px 8px',
      textAlign: 'center',
      border: '1px solid #e0e0e0',
      color: '#333',
      minWidth: '80px',
    },

    footerSection: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: screenSize.isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: screenSize.isMobile ? '6px 4px' : screenSize.isTablet ? '8px 6px' : '8px 10px',
      backgroundColor: 'white',
      borderTop: '2px solid #e0e0e0',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '10px',
      flexWrap: 'wrap',
      flexShrink: 0,
      minHeight: screenSize.isMobile ? 'auto' : screenSize.isTablet ? '48px' : '55px',
      width: '100%',
      boxSizing: 'border-box',
      zIndex: 100,
    },
    balanceContainer: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: screenSize.isMobile ? TYPOGRAPHY.fontSize.sm : screenSize.isTablet ? TYPOGRAPHY.fontSize.base : TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#1B91DA',
      padding: screenSize.isMobile ? '6px 8px' : screenSize.isTablet ? '8px 12px' : '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '15px' : screenSize.isTablet ? '25px' : '35px',
      minWidth: 'max-content',
      justifyContent: 'center',
      width: screenSize.isMobile ? '100%' : 'auto',
      order: screenSize.isMobile ? 1 : 0,
      borderRadius: screenSize.isMobile ? '4px' : '6px',
      backgroundColor: '#f0f8ff',
    },
    balanceItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
    },
    balanceLabel: {
      fontSize: screenSize.isMobile ? '10px' : screenSize.isTablet ? '11px' : '12px',
      color: '#555',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    balanceValue: {
      fontSize: screenSize.isMobile ? '14px' : screenSize.isTablet ? '16px' : '18px',
      color: '#1976d2',
      fontWeight: 'bold',
    },
    searchButton: {
      padding: screenSize.isMobile ? '8px 16px' : screenSize.isTablet ? '9px 18px' : '10px 20px',
      background: `linear-gradient(135deg, #1B91DA 0%, #1479c0 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: screenSize.isMobile ? '4px' : '5px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 8px rgba(27, 145, 218, 0.3)',
      letterSpacing: '0.3px',
      position: 'relative',
      overflow: 'hidden',
      minWidth: screenSize.isMobile ? '80px' : screenSize.isTablet ? '90px' : '100px',
      height: screenSize.isMobile ? '36px' : screenSize.isTablet ? '38px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(27, 145, 218, 0.4)',
      },
      ':active': {
        transform: 'translateY(-1px)',
      }
    },
    refreshButton: {
      padding: screenSize.isMobile ? '8px 16px' : screenSize.isTablet ? '9px 18px' : '10px 20px',
      background: 'white',
      color: '#333',
      border: '1.5px solid #ddd',
      borderRadius: screenSize.isMobile ? '4px' : '5px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      letterSpacing: '0.3px',
      position: 'relative',
      overflow: 'hidden',
      minWidth: screenSize.isMobile ? '80px' : screenSize.isTablet ? '90px' : '100px',
      height: screenSize.isMobile ? '36px' : screenSize.isTablet ? '38px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        borderColor: '#1B91DA',
        boxShadow: '0 4px 10px rgba(27, 145, 218, 0.2)',
        transform: 'translateY(-1px)',
      },
      ':active': {
        transform: 'translateY(-1px)',
      }
    },
    buttonGlow: {
      position: 'absolute',
      top: '0',
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      transition: 'left 0.7s ease'
    },
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: TYPOGRAPHY.fontFamily,
    },
    loadingBox: {
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div>Loading Sales Return Register Report...</div>
          </div>
        </div>
      )}

      {/* Header Section - Same as DayBook */}
      <div style={styles.headerSection}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: screenSize.isMobile ? '12px' : screenSize.isTablet ? '16px' : '20px',
          flexWrap: screenSize.isMobile ? 'wrap' : 'nowrap',
          width: '100%',
        }}>
          {/* LEFT SIDE: Dates Only */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
            flexWrap: 'wrap',
          }}>
            {/* From Date */}
            <div style={{
              ...styles.formField,
              minWidth: screenSize.isMobile ? 'calc(50% - 6px)' : 'auto',
            }}>
              <label style={styles.inlineLabel}>From Date:</label>
              <input
                type="date"
                data-header="fromDate"
                style={
                  focusedField === 'fromDate'
                    ? styles.inlineInputFocused
                    : styles.inlineInput
                }
                value={fromDate}
                onChange={handleFromDateChange}
                ref={fromDateRef}
                onKeyDown={(e) => {
                  handleKeyDown(e, 'fromDate');
                }}
                onFocus={() => setFocusedField('fromDate')}
                onBlur={() => setFocusedField('')}
              />
            </div>

            {/* To Date */}
            <div style={{
              ...styles.formField,
              minWidth: screenSize.isMobile ? 'calc(50% - 6px)' : 'auto',
            }}>
              <label style={styles.inlineLabel}>To Date:</label>
              <input
                type="date"
                data-header="toDate"
                style={
                  focusedField === 'toDate'
                    ? styles.inlineInputFocused
                    : styles.inlineInput
                }
                value={toDate}
                onChange={handleToDateChange}
                ref={toDateRef}
                onKeyDown={(e) => {
                  handleKeyDown(e, 'toDate');
                }}
                onFocus={() => setFocusedField('toDate')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          {/* SPACER BETWEEN LEFT AND RIGHT SIDES - LARGE GAP */}
          <div style={{
            width: screenSize.isMobile ? '0' : screenSize.isTablet ? '40px' : '60px',
            flexShrink: 0,
          }} />

          {/* RIGHT SIDE: Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
            flexShrink: 0,
          }}>
            {/* Search Button */}
            <button
              style={styles.searchButton}
              onClick={handleSearch}
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
              ref={searchButtonRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            >
              Search
              {hoveredButton && <div style={styles.buttonGlow}></div>}
            </button>

            {/* Refresh Button */}
            <button
              style={styles.refreshButton}
              onClick={handleRefresh}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div style={styles.tableSection}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, minWidth: '70px', width: '70px', maxWidth: '70px' }}>No.</th>
                <th style={{ ...styles.th, minWidth: '200px', width: '200px', maxWidth: '200px' }}>Sales Party</th>
                <th style={{ ...styles.th, minWidth: '120px', width: '120px', maxWidth: '120px' }}>Bill No.</th>
                <th style={{ ...styles.th, minWidth: '120px', width: '120px', maxWidth: '120px' }}>Bill Date</th>
                <th style={{ ...styles.th, minWidth: '140px', width: '140px', maxWidth: '140px' }}>Bill Amount</th>
              </tr>
            </thead>
            <tbody>
              {tableLoaded ? (
                salesReturnData.length > 0 ? (
                  salesReturnData.map((row, index) => (
                    <tr key={index} style={{ 
                      backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                      ...(row.isTotal ? { 
                        backgroundColor: '#f0f8ff', 
                        fontWeight: 'bold',
                        borderTop: '2px solid #1B91DA'
                      } : {})
                    }}>
                      <td style={{ 
                        ...styles.td, 
                        minWidth: '70px', 
                        width: '70px', 
                        maxWidth: '70px',
                        textAlign: 'center',
                        fontWeight: row.isTotal ? 'bold' : 'normal',
                        color: row.isTotal ? '#1565c0' : '#333'
                      }}>
                        {row.no || ''}
                      </td>
                      <td style={{ 
                        ...styles.td, 
                        minWidth: '200px', 
                        width: '200px', 
                        maxWidth: '200px',
                        textAlign: 'left',
                        fontWeight: row.isTotal ? 'bold' : 'normal',
                        color: row.isTotal ? '#1565c0' : '#333'
                      }}>
                        {row.salesParty}
                      </td>
                      <td style={{ 
                        ...styles.td, 
                        minWidth: '120px', 
                        width: '120px', 
                        maxWidth: '120px',
                        textAlign: 'center',
                        fontWeight: row.isTotal ? 'bold' : 'normal',
                        color: row.isTotal ? '#1565c0' : '#333'
                      }}>
                        {row.billNo || ''}
                      </td>
                      <td style={{ 
                        ...styles.td, 
                        minWidth: '120px', 
                        width: '120px', 
                        maxWidth: '120px',
                        textAlign: 'center',
                        fontWeight: row.isTotal ? 'bold' : 'normal',
                        color: row.isTotal ? '#1565c0' : '#333'
                      }}>
                        {row.billDate || ''}
                      </td>
                      <td style={{ 
                        ...styles.td, 
                        minWidth: '140px', 
                        width: '140px', 
                        maxWidth: '140px',
                        textAlign: 'right',
                        fontWeight: row.isTotal ? 'bold' : 'normal',
                        color: row.isTotal ? '#1565c0' : '#333'
                      }}>
                        {row.billAmount ? `₹${row.billAmount}` : ''}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No sales return records found
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  {/* <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Enter search criteria and click "Search" to view sales return register
                  </td> */}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Section with Totals - CENTERED */}
      <div style={styles.footerSection}>
        <div style={{
          ...styles.balanceContainer,
          justifyContent: 'center',
          width: '100%',
        }}>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Total Bill Amount</span>
            <span style={styles.balanceValue}>
              ₹{formatNumber(totalBillAmount)}
            </span>
          </div>
          {tableLoaded && salesReturnData.length > 0 && (
            <>
              {/* <div style={styles.balanceItem}>
                <span style={styles.balanceLabel}>Total Returns</span>
                <span style={styles.balanceValue}>
                  {salesReturnData.filter(row => !row.isTotal).length}
                </span>
              </div> */}
              {/* <div style={styles.balanceItem}>
                <span style={styles.balanceLabel}>Average Return</span>
                <span style={styles.balanceValue}>
                  ₹{formatNumber(totalBillAmount / Math.max(1, salesReturnData.filter(row => !row.isTotal).length))}
                </span>
              </div> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReturnRegister;