import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { get } from '../../../api/apiService';
import { API_ENDPOINTS } from '../../../api/endpoints';

// Helper function to convert YYYY-MM-DD to DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const DailyReport = () => {
  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const openingBalanceRef = useRef(null);
  const closingBalanceRef = useRef(null);
  const searchButtonRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [openingBalance, setOpeningBalance] = useState(0.00);
  const [closingBalance, setClosingBalance] = useState(17362349.75);
  const [showReport, setShowReport] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-focus on fromDate when component mounts
  useEffect(() => {
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

  // Sample data matching the image
  const sampleData = [
    // Sales data
    { billNo: 'B00001AA', name: 'TEST 1234', grossWt: '100.000', netWt: '100.000', pure: '92.000', rateCut: '100.000', amount: '30961.00', rightBillNo: 'B00001AA', rightName: 'Sales' },
    { billNo: 'B00005AA', name: 'TEST 1234', grossWt: '344.000', netWt: '234.000', pure: '53.820', rateCut: '324.000', amount: '1162433.00', rightBillNo: 'B00005AA', rightName: 'Sales' },
    { billNo: 'B00007AA', name: 'TEST 1234', grossWt: '234.000', netWt: '3.000', pure: '0.690', rateCut: '34.000', amount: '12283.00', rightBillNo: 'B00007AA', rightName: 'Sales' },
    { billNo: 'B00008AA', name: 'TEST 1234', grossWt: '345.000', netWt: '455.000', pure: '154.700', rateCut: '', amount: '5344156.00', rightBillNo: 'B00008AA', rightName: 'Sales' },
    { billNo: 'C00002AA', name: 'SHEETAL SOLLITAIRELL', grossWt: '5.000', netWt: '5.000', pure: '1.000', rateCut: '', amount: '17003.00', rightBillNo: 'C00002AA', rightName: 'Sales' },
    { billNo: 'C00002AA', name: 'ABI', grossWt: '100.000', netWt: '100.000', pure: '', rateCut: '', amount: '14788280.00', rightBillNo: 'C00002AA', rightName: 'Sales' },
    { billNo: 'C00004AA', name: 'TEST', grossWt: '100.000', netWt: '100.000', pure: '', rateCut: '', amount: '24788280.00', rightBillNo: 'C00004AA', rightName: 'Sales' },
    { billNo: 'C00006AA', name: 'AISHU', grossWt: '8.000', netWt: '8.000', pure: '', rateCut: '', amount: '37412.00', rightBillNo: 'C00006AA', rightName: 'Sales' },
    { billNo: 'C00007AA', name: 'AISHU', grossWt: '8.000', netWt: '8.000', pure: '', rateCut: '', amount: '13000.00', rightBillNo: 'C00007AA', rightName: 'Sales' },
    { billNo: 'C00008AA', name: 'AISHU', grossWt: '8.000', netWt: '8.000', pure: '', rateCut: '', amount: '129000.00', rightBillNo: 'C00008AA', rightName: 'Sales' },
    { billNo: 'C00009AA', name: 'AISHU', grossWt: '5.000', netWt: '5.000', pure: '', rateCut: '', amount: '66000.00', rightBillNo: 'C00009AA', rightName: 'Sales' },
    { billNo: 'C00101AA', name: 'AISHU', grossWt: '2.000', netWt: '2.000', pure: '', rateCut: '', amount: '32520.00', rightBillNo: 'C00101AA', rightName: 'Sales' },
    { billNo: 'C00102AA', name: 'YMCA PURASWAKKAM', grossWt: '15.000', netWt: '10.000', pure: '', rateCut: '', amount: '16549.00', rightBillNo: 'C00102AA', rightName: 'Sales' },
    { billNo: 'C00103AA', name: 'AISHU', grossWt: '10.000', netWt: '10.000', pure: '', rateCut: '', amount: '223101.00', rightBillNo: 'C00103AA', rightName: 'Sales' },
    { billNo: 'C00104AA', name: 'TEST 1234', grossWt: '15.000', netWt: '10.000', pure: '', rateCut: '', amount: '189000.00', rightBillNo: 'C00104AA', rightName: 'Sales' },
    { billNo: 'C00105AA', name: 'AISHU', grossWt: '9.254', netWt: '9.254', pure: '', rateCut: '', amount: '17500.00', rightBillNo: 'C00105AA', rightName: 'Sales' },
  ];

  // Totals
  const totals = {
    grossWt: '4773.254',
    netWt: '2082.254',
    pure: '301.360',
    amount: '22586590.00'
  };

  // Handlers
  const handleSearch = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, always show the report
      setShowReport(true);
    //   toast.success('Daily report loaded successfully');
      
    } catch (error) {
      toast.error('Failed to load daily report');
      console.error('Error fetching daily report:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setOpeningBalance(0.00);
    setClosingBalance(17362349.75);
    setShowReport(false);
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
                />
              </div>

              {/* Opening Balance */}
              <div style={styles.formField}>
                <label style={styles.label}>Opening Bal:</label>
                <div style={focusedField === 'openingBalance' ? styles.balanceInputContainerFocused : styles.balanceInputContainer}>
                  <input
                    ref={openingBalanceRef}
                    type="number"
                    step="0.01"
                    style={focusedField === 'openingBalance' ? styles.balanceInputFocused : styles.balanceInput}
                    value={openingBalance}
                    onChange={e => setOpeningBalance(parseFloat(e.target.value) || 0)}
                    onKeyDown={handleOpeningBalanceKeyDown}
                    onFocus={() => setFocusedField('openingBalance')}
                    onBlur={() => setFocusedField('')}
                    placeholder="0.00"
                  />
                  <div style={focusedField === 'openingBalance' ? styles.balanceDropdownFocused : styles.balanceDropdown}>
                    DR
                  </div>
                </div>
              </div>

              {/* Closing Balance */}
              <div style={styles.formField}>
                <label style={styles.label}>Closing Bal:</label>
                <div style={focusedField === 'closingBalance' ? styles.balanceInputContainerFocused : styles.balanceInputContainer}>
                  <input
                    ref={closingBalanceRef}
                    type="number"
                    step="0.01"
                    style={focusedField === 'closingBalance' ? styles.balanceInputFocused : styles.balanceInput}
                    value={closingBalance}
                    onChange={e => setClosingBalance(parseFloat(e.target.value) || 0)}
                    onKeyDown={handleClosingBalanceKeyDown}
                    onFocus={() => setFocusedField('closingBalance')}
                    onBlur={() => setFocusedField('')}
                    placeholder="0.00"
                  />
                  <div style={focusedField === 'closingBalance' ? styles.balanceDropdownFocused : styles.balanceDropdown}>
                    CR
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Buttons */}
            <div style={styles.rightSide}>
              <button ref={searchButtonRef} type="submit" style={styles.button}>Search</button>
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
                  <td colSpan="13" style={styles.emptyMsg}>
                    {/* Select date range and click "Search" to view daily report */}
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan="13" style={styles.emptyMsg}>
                    Loading...
                  </td>
                </tr>
              ) : (
                <>
                  {/* Sales Data Rows */}
                  {sampleData.map((item, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{item.billNo}</td>
                      <td style={{...styles.td, textAlign: 'left'}}>{item.name}</td>
                      <td style={styles.td}>{item.grossWt}</td>
                      <td style={styles.td}>{item.netWt}</td>
                      <td style={styles.td}>{item.pure}</td>
                      <td style={styles.td}>{item.rateCut}</td>
                      <td style={styles.td}>{item.amount}</td>
                      
                      <td style={styles.td}>{item.rightBillNo}</td>
                      <td style={{...styles.td, textAlign: 'left'}}>{item.rightName}</td>
                      <td style={styles.td}></td>
                      <td style={styles.td}></td>
                      <td style={styles.td}></td>
                      <td style={styles.td}></td>
                    </tr>
                  ))}

                  {/* Total Row */}
                  <tr style={styles.totalRow}>
                    <td style={styles.td}><strong>Total</strong></td>
                    <td style={styles.td}></td>
                    <td style={styles.td}><strong>{totals.grossWt}</strong></td>
                    <td style={styles.td}><strong>{totals.netWt}</strong></td>
                    <td style={styles.td}><strong>{totals.pure}</strong></td>
                    <td style={styles.td}></td>
                    <td style={styles.td}><strong>{totals.amount}</strong></td>
                    
                    <td style={styles.td}></td>
                    <td style={styles.td}></td>
                    <td style={styles.td}></td>
                    <td style={styles.td}></td>
                    <td style={styles.td}></td>
                    <td style={styles.td}></td>
                  </tr>

                  {/* Balance in Purchase Row */}
                  <tr style={styles.totalRow}>
                    <td style={{...styles.td, textAlign: 'left'}} colSpan="7">
                      Balance in Purchase
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      P00014AA
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      BANK(OCCC)
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      8.920
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      16825.00
                    </td>
                    <td style={{...styles.td, textAlign: 'left'}} colSpan="6">
                      P00014AA
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      BANK(OCCC)
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      122.000
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      122.000
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      104.920
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      96.000
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      16825.00
                    </td>
                  </tr>

                  {/* Purchase Row */}
                  <tr style={styles.totalRow}>
                    <td style={styles.td} colSpan="7"></td>
                    <td style={{...styles.td, textAlign: 'left'}} colSpan="6">
                      Purchase
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      P00014AA
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      BANK(OCCC)
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      122.000
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      122.000
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      104.920
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      96.000
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      16825.00
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;