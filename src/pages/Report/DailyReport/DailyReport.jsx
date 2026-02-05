import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { get } from '../../../api/apiService';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { usePrintPermission } from '../../../hooks/usePrintPermission';

// Helper function to convert YYYY-MM-DD to DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const DailyReport = () => {
// --- PERMISSIONS ---
const { hasPrintPermission, checkPrintPermission } =
  usePrintPermission('DAILY_REPORT');


  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const openingBalanceRef = useRef(null);
  const closingBalanceRef = useRef(null);
  const searchButtonRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [openingBalanceType, setOpeningBalanceType] = useState('DR');
  const [closingBalanceType, setClosingBalanceType] = useState('CR');
  const [showReport, setShowReport] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  // Set default dates when component mounts
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
    
    if (fromDateRef.current) {
      setTimeout(() => {
        fromDateRef.current.focus();
      }, 100);
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

  React.useEffect(() => {
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

  // --- TYPOGRAPHY ---
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

  // --- STYLES ---
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
      padding: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '16px',
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
    filterRow: {
      display: 'flex',
      alignItems: screenSize.isMobile || screenSize.isTablet ? 'stretch' : 'center',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
      marginBottom: screenSize.isMobile ? '12px' : screenSize.isTablet ? '14px' : '18px',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      flexDirection: screenSize.isMobile || screenSize.isTablet ? 'column' : 'row',
    },
    formField: {
      display: 'flex',
      alignItems: screenSize.isMobile || screenSize.isTablet ? 'stretch' : 'center',
      gap: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      flexDirection: screenSize.isMobile || screenSize.isTablet ? 'column' : 'row',
      width: screenSize.isMobile || screenSize.isTablet ? '100%' : 'auto',
      flex: screenSize.isMobile || screenSize.isTablet ? '1 1 100%' : '0 1 auto',
    },
    label: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#333',
      minWidth: screenSize.isMobile || screenSize.isTablet ? 'auto' : '80px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      width: screenSize.isMobile || screenSize.isTablet ? '100%' : 'auto',
      textAlign: 'left',
    },
    input: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      border: '1px solid #ddd',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
      width: '100%',
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '100%' : '100px',
    },
    inputFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      border: '2px solid #1B91DA',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
      width: '100%',
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '100%' : '100px',
    },
    balanceInputContainer: {
      display: 'flex',
      alignItems: 'stretch',
      width: '100%',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      overflow: 'hidden',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      transition: 'all 0.2s ease',
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
    },
    balanceInputContainerFocused: {
      display: 'flex',
      alignItems: 'stretch',
      width: '100%',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      overflow: 'hidden',
      border: '2px solid #1B91DA',
      backgroundColor: 'white',
      transition: 'all 0.2s ease',
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
    },
    balanceInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      border: 'none',
      borderRadius: '0',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      outline: 'none',
      width: '100%',
      flex: 1,
      backgroundColor: 'transparent',
    },
    balanceInputFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      border: 'none',
      borderRadius: '0',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      outline: 'none',
      width: '100%',
      flex: 1,
      backgroundColor: 'transparent',
    },
    balanceDropdown: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '0 8px' : screenSize.isTablet ? '0 10px' : '0 12px',
      border: 'none',
      borderLeft: '1px solid #ddd',
      borderRadius: '0',
      backgroundColor: '#f0f0f0',
      color: '#666',
      cursor: 'default',
      minWidth: '50px',
      textAlign: 'center',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    balanceDropdownFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '0 8px' : screenSize.isTablet ? '0 10px' : '0 12px',
      border: 'none',
      borderLeft: '1px solid #1B91DA',
      borderRadius: '0',
      backgroundColor: '#e8f4fd',
      color: '#1B91DA',
      cursor: 'default',
      minWidth: '50px',
      textAlign: 'center',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    leftSide: {
      display: 'flex',
      alignItems: screenSize.isMobile || screenSize.isTablet ? 'stretch' : 'center',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
      flex: screenSize.isMobile || screenSize.isTablet ? '1 1 100%' : 1,
      flexWrap: screenSize.isMobile || screenSize.isTablet ? 'wrap' : 'nowrap',
      flexDirection: screenSize.isMobile || screenSize.isTablet ? 'column' : 'row',
      width: screenSize.isMobile || screenSize.isTablet ? '100%' : 'auto',
    },
    rightSide: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
      flexShrink: 0,
      width: screenSize.isMobile || screenSize.isTablet ? '100%' : 'auto',
      flexDirection: screenSize.isMobile || screenSize.isTablet ? 'row' : 'row',
      justifyContent: screenSize.isMobile || screenSize.isTablet ? 'space-between' : 'flex-end',
    },
    button: {
      padding: screenSize.isMobile ? '8px 16px' : screenSize.isTablet ? '10px 20px' : '12px 24px',
      background: `linear-gradient(135deg, #1B91DA 0%, #1479c0 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: screenSize.isMobile ? '4px' : '6px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 8px rgba(27, 145, 218, 0.3)',
      letterSpacing: '0.3px',
      flex: screenSize.isMobile || screenSize.isTablet ? 1 : '0 0 auto',
      minWidth: screenSize.isMobile || screenSize.isTablet ? '0' : '100px',
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondary: {
      padding: screenSize.isMobile ? '8px 16px' : screenSize.isTablet ? '10px 20px' : '12px 24px',
      background: 'white',
      color: '#333',
      border: '1.5px solid #ddd',
      borderRadius: screenSize.isMobile ? '4px' : '6px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      letterSpacing: '0.3px',
      flex: screenSize.isMobile || screenSize.isTablet ? 1 : '0 0 auto',
      minWidth: screenSize.isMobile || screenSize.isTablet ? '0' : '100px',
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainTableContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      overflowX: 'auto',
      overflowY: 'auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      margin: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginTop: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginBottom: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '20px',
      WebkitOverflowScrolling: 'touch',
      width: screenSize.isMobile ? 'calc(100% - 12px)' : screenSize.isTablet ? 'calc(100% - 20px)' : 'calc(100% - 32px)',
      boxSizing: 'border-box',
      flex: 'none',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: screenSize.isMobile ? 'calc(100vh - 250px)' : screenSize.isTablet ? 'calc(100vh - 280px)' : 'calc(100vh - 300px)',
      minHeight: '300px',
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
      padding: '8px 6px',
      textAlign: 'center',
      border: '1px solid #ccc',
      color: '#333',
      minWidth: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
      width: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
      maxWidth: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
    },
    totalRow: {
      background: '#e6f7ff',
      fontWeight: 700,
      color: '#096dd9',
    },
    emptyMsg: {
      textAlign: 'center',
      color: '#888',
      fontSize: '16px',
      padding: '32px 0',
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#1B91DA',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
  };

  // Handlers
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!fromDate || !toDate) {
      toast.error('Please select both from and to dates');
      return;
    }
    
    setIsLoading(true);
    try {
      // API call to fetch daily report data
      const response = await get(API_ENDPOINTS.dailyReport, {
        params: {
          fromDate,
          toDate,
          openingBalance: openingBalance || 0,
          closingBalance: closingBalance || 0
        }
      });
      
      if (response.data) {
        setReportData(response.data);
        // Set balance types from backend if available
        if (response.data.openingBalanceType) {
          setOpeningBalanceType(response.data.openingBalanceType);
        }
        if (response.data.closingBalanceType) {
          setClosingBalanceType(response.data.closingBalanceType);
        }
        setShowReport(true);
        toast.success('Daily report loaded successfully');
      } else {
        setReportData(null);
        toast.error('No data found for the selected date range');
      }
      
    } catch (error) {
      toast.error('Failed to load daily report');
      console.error('Error fetching daily report:', error);
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
    setOpeningBalance('');
    setClosingBalance('');
    setShowReport(false);
    setReportData(null);
  };

  // Keyboard navigation handlers
  const handleFromDateKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      toDateRef.current?.focus();
    }
  };

  const handleToDateKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      openingBalanceRef.current?.focus();
    }
  };

  const handleOpeningBalanceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      closingBalanceRef.current?.focus();
    }
  };

  const handleClosingBalanceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchButtonRef.current?.focus();
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    return formatDateToDDMMYYYY(dateString);
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <form onSubmit={handleSearch}>
          <div style={styles.filterRow}>
            {/* LEFT SIDE: Search fields */}
            <div style={styles.leftSide}>
              {/* From Date */}
              <div style={styles.formField}>
                <label style={styles.label}>From Date:</label>
                <input
                  ref={fromDateRef}
                  type="date"
                  style={focusedField === 'fromDate' ? styles.inputFocused : styles.input}
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  onKeyDown={handleFromDateKeyDown}
                  onFocus={() => setFocusedField('fromDate')}
                  onBlur={() => setFocusedField('')}
                  required
                />
              </div>

              {/* To Date */}
              <div style={styles.formField}>
                <label style={styles.label}>To Date:</label>
                <input
                  ref={toDateRef}
                  type="date"
                  style={focusedField === 'toDate' ? styles.inputFocused : styles.input}
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  onKeyDown={handleToDateKeyDown}
                  onFocus={() => setFocusedField('toDate')}
                  onBlur={() => setFocusedField('')}
                  required
                />
              </div>

              {/* Opening Balance */}
              <div style={styles.formField}>
                <label style={styles.label}>Opening Bal:</label>
                <div style={focusedField === 'openingBalance' ? styles.balanceInputContainerFocused : styles.balanceInputContainer}>
                  <input
                    ref={openingBalanceRef}
                    type="text"
                    style={focusedField === 'openingBalance' ? styles.balanceInputFocused : styles.balanceInput}
                    value={openingBalance}
                    onChange={e => setOpeningBalance(e.target.value)}
                    onKeyDown={handleOpeningBalanceKeyDown}
                    onFocus={() => setFocusedField('openingBalance')}
                    onBlur={() => setFocusedField('')}
                    placeholder="0.00"
                  />
                  <div style={focusedField === 'openingBalance' ? styles.balanceDropdownFocused : styles.balanceDropdown}>
                    {openingBalanceType}
                  </div>
                </div>
              </div>

              {/* Closing Balance */}
              <div style={styles.formField}>
                <label style={styles.label}>Closing Bal:</label>
                <div style={focusedField === 'closingBalance' ? styles.balanceInputContainerFocused : styles.balanceInputContainer}>
                  <input
                    ref={closingBalanceRef}
                    type="text"
                    style={focusedField === 'closingBalance' ? styles.balanceInputFocused : styles.balanceInput}
                    value={closingBalance}
                    onChange={e => setClosingBalance(e.target.value)}
                    onKeyDown={handleClosingBalanceKeyDown}
                    onFocus={() => setFocusedField('closingBalance')}
                    onBlur={() => setFocusedField('')}
                    placeholder="0.00"
                  />
                  <div style={focusedField === 'closingBalance' ? styles.balanceDropdownFocused : styles.balanceDropdown}>
                    {closingBalanceType}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Buttons */}
            <div style={styles.rightSide}>
              <button ref={searchButtonRef} type="submit" style={styles.button} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Search'}
              </button>
              <button type="button" style={styles.buttonSecondary} onClick={handleRefresh}>Refresh</button>
            </div>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div style={styles.tableSection}>
        {/* Main Table */}
        <div style={styles.mainTableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                {/* Left side headers - 7 columns */}
                <th style={styles.th}>BillNo</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Gross Wt</th>
                <th style={styles.th}>Net Wt</th>
                <th style={styles.th}>Pure</th>
                <th style={styles.th}>Rate Cut</th>
                <th style={styles.th}>Amount</th>
                
                {/* Right side headers - 6 columns */}
                <th style={styles.th}>BillNo</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Gross Wt</th>
                <th style={styles.th}>Net Wt</th>
                <th style={styles.th}>Pure</th>
                <th style={styles.th}>Rate Cut</th>
              </tr>
            </thead>
            <tbody>
              {!showReport ? (
                <tr>
                  {/* <td colSpan="13" style={styles.emptyMsg}>
                    Select date range and click "Search" to view daily report
                  </td> */}
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan="13" style={styles.emptyMsg}>
                    Loading...
                  </td>
                </tr>
              ) : reportData ? (
                <>
                  {/* Render actual data from API response */}
                  {reportData.transactions && reportData.transactions.length > 0 ? (
                    reportData.transactions.map((item, index) => (
                      <tr key={index}>
                        <td style={styles.td}>{item.billNo || ''}</td>
                        <td style={{...styles.td, textAlign: 'left'}}>{item.name || ''}</td>
                        <td style={styles.td}>{item.grossWt || ''}</td>
                        <td style={styles.td}>{item.netWt || ''}</td>
                        <td style={styles.td}>{item.pure || ''}</td>
                        <td style={styles.td}>{item.rateCut || ''}</td>
                        <td style={styles.td}>{item.amount || ''}</td>
                        
                        <td style={styles.td}>{item.rightBillNo || ''}</td>
                        <td style={{...styles.td, textAlign: 'left'}}>{item.rightName || ''}</td>
                        <td style={styles.td}>{item.rightGrossWt || ''}</td>
                        <td style={styles.td}>{item.rightNetWt || ''}</td>
                        <td style={styles.td}>{item.rightPure || ''}</td>
                        <td style={styles.td}>{item.rightRateCut || ''}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="13" style={styles.emptyMsg}>
                        No transactions found for the selected date range
                      </td>
                    </tr>
                  )}

                  {/* Render totals if available */}
                  {reportData.totals && (
                    <tr style={styles.totalRow}>
                      <td style={styles.td}><strong>Total</strong></td>
                      <td style={styles.td}></td>
                      <td style={styles.td}><strong>{reportData.totals.grossWt || ''}</strong></td>
                      <td style={styles.td}><strong>{reportData.totals.netWt || ''}</strong></td>
                      <td style={styles.td}><strong>{reportData.totals.pure || ''}</strong></td>
                      <td style={styles.td}></td>
                      <td style={styles.td}><strong>{reportData.totals.amount || ''}</strong></td>
                      
                      <td style={styles.td}></td>
                      <td style={styles.td}></td>
                      <td style={styles.td}><strong>{reportData.totals.rightGrossWt || ''}</strong></td>
                      <td style={styles.td}><strong>{reportData.totals.rightNetWt || ''}</strong></td>
                      <td style={styles.td}><strong>{reportData.totals.rightPure || ''}</strong></td>
                      <td style={styles.td}><strong>{reportData.totals.rightRateCut || ''}</strong></td>
                    </tr>
                  )}

                  {/* Render balance rows if available */}
                  {reportData.balanceRows && reportData.balanceRows.map((row, index) => (
                    <tr style={styles.totalRow} key={`balance-${index}`}>
                      <td style={{...styles.td, textAlign: 'left'}} colSpan="7">
                        {row.leftText || ''}
                      </td>
                      <td style={{...styles.td, textAlign: 'left'}} colSpan="6">
                        {row.rightText || ''}
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan="13" style={styles.emptyMsg}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;