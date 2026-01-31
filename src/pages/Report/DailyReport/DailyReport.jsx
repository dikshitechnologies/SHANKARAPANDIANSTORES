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
  const searchButtonRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [showReport, setShowReport] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Report data states
  const [openingCash, setOpeningCash] = useState(19800912.33);

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
    },
    table: {
      width: '100%',
      minWidth: '100%',
      borderCollapse: 'collapse',
      fontSize: TYPOGRAPHY.fontSize.sm,
    },
    th: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      backgroundColor: '#1B91DA',
      color: 'white',
      padding: screenSize.isMobile ? '4px 2px' : screenSize.isTablet ? '6px 3px' : '8px 4px',
      textAlign: 'center',
      letterSpacing: '0.5px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      border: '1px solid #e0e0e0',
      borderBottom: '2px solid white',
      whiteSpace: 'nowrap',
      minWidth: '70px',
    },
    td: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '3px 2px' : screenSize.isTablet ? '4px 3px' : '6px 4px',
      textAlign: 'center',
      border: '1px solid #e0e0e0',
      color: '#333',
      backgroundColor: 'white',
    },
    sectionTd: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      padding: screenSize.isMobile ? '3px 2px' : screenSize.isTablet ? '4px 3px' : '6px 4px',
      textAlign: 'left',
      border: '1px solid #e0e0e0',
      backgroundColor: '#f8f9fa',
      color: '#333',
    },
    openingCashTd: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      padding: screenSize.isMobile ? '10px 6px' : screenSize.isTablet ? '12px 8px' : '14px 10px',
      textAlign: 'center',
      border: '1px solid #e0e0e0',
      backgroundColor: '#f0f8ff',
      color: '#1B91DA',
    },
    drLabelTd: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      padding: screenSize.isMobile ? '10px 6px' : screenSize.isTablet ? '12px 8px' : '14px 10px',
      textAlign: 'left',
      border: '1px solid #e0e0e0',
      backgroundColor: '#f0f8ff',
      color: '#333',
      width: '50px',
    },
    emptyMsg: {
      textAlign: 'center',
      color: '#888',
      fontSize: TYPOGRAPHY.fontSize.base,
      padding: '40px 0',
    },
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
      setOpeningCash(19800912.33);
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
    setShowReport(false);
  };

  const handleExport = () => {
    toast.success('Export functionality will be implemented');
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
      searchButtonRef.current?.focus();
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    return formatDateToDDMMYYYY(dateString);
  };

  return (
    <div style={styles.container}>
      {/* Header Section with Date Filters */}
      <div style={styles.headerSection}>
        <form onSubmit={handleSearch}>
          <div style={styles.filterRow}>
            {/* LEFT SIDE: Date fields */}
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
        {/* Show empty message only when report is not loaded */}
        {!showReport ? (
          <div style={styles.emptyMsg}>
            {/* Select date range and click "Search" to view daily report */}
          </div>
        ) : isLoading ? (
          <div style={styles.emptyMsg}>
            Loading...
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {/* Left side headers - 7 columns */}
                  <th style={styles.th}>Bill No</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Gross Wt</th>
                  <th style={styles.th}>Net Wt</th>
                  <th style={styles.th}>Pure</th>
                  <th style={styles.th}>Rate Cut</th>
                  <th style={styles.th}>Amount</th>
                  
                  {/* Right side headers - 6 columns */}
                  <th style={styles.th}>Bill No</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Gross Wt</th>
                  <th style={styles.th}>Net Wt</th>
                  <th style={styles.th}>Pure</th>
                  <th style={styles.th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening Cash Row */}
                <tr>
                  <td style={styles.openingCashTd} colSpan="7">
                    Opening Cash: {openingCash.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                  <td style={styles.drLabelTd} colSpan="6">DR</td>
                </tr>

                {/* Sales Row */}
                <tr>
                  <td style={styles.sectionTd} colSpan="7">Sales</td>
                  <td style={styles.sectionTd} colSpan="6">Mode of Payment</td>
                </tr>
                
                {/* Sample Sales Data Row */}
                <tr>
                  <td style={styles.td}>SL001</td>
                  <td style={styles.td}>Gold Ring</td>
                  <td style={styles.td}>5.000</td>
                  <td style={styles.td}>4.500</td>
                  <td style={styles.td}>4.140</td>
                  <td style={styles.td}>5500/-</td>
                  <td style={styles.td}>22,770.00</td>
                  
                  {/* Right side - Cash payment */}
                  <td style={styles.td}></td>
                  <td style={styles.td}>Cash</td>
                  <td style={styles.td}></td>
                  <td style={styles.td}></td>
                  <td style={styles.td}></td>
                  <td style={styles.td}>22,770.00</td>
                </tr>

                {/* Balance in Purchase Row */}
                <tr>
                  <td style={styles.sectionTd} colSpan="7">Balance in Purchase</td>
                  <td style={styles.sectionTd} colSpan="6">Purchase</td>
                </tr>
                
                {/* Sample Purchase Data Row */}
                <tr>
                  <td style={styles.td}>DC001</td>
                  <td style={styles.td}>Gold Bar</td>
                  <td style={styles.td}>20.000</td>
                  <td style={styles.td}>19.000</td>
                  <td style={styles.td}>17.480</td>
                  <td style={styles.td}>5800/-</td>
                  <td style={styles.td}>110,240.00</td>
                  
                  {/* Right side - Purchase data */}
                  <td style={styles.td}>DC001</td>
                  <td style={styles.td}>Gold Bar</td>
                  <td style={styles.td}>20.000</td>
                  <td style={styles.td}>19.000</td>
                  <td style={styles.td}>17.480</td>
                  <td style={styles.td}>110,240.00</td>
                </tr>

                {/* Old Purchase Row */}
                <tr>
                  <td style={styles.td} colSpan="7"></td>
                  <td style={styles.sectionTd} colSpan="6">Old Purchase</td>
                </tr>
                
                {/* Sample Old Purchase Data Row */}
                <tr>
                  <td style={styles.td} colSpan="7"></td>
                  <td style={styles.td}>OP001</td>
                  <td style={styles.td}>Old Gold</td>
                  <td style={styles.td}>15.000</td>
                  <td style={styles.td}>14.000</td>
                  <td style={styles.td}>12.880</td>
                  <td style={styles.td}>85,680.00</td>
                </tr>

                {/* Voucher Receipts Row */}
                <tr>
                  <td style={styles.td} colSpan="7"></td>
                  <td style={styles.sectionTd} colSpan="6">Voucher Receipts</td>
                </tr>
                
                {/* Sample Voucher Receipts Data Row */}
                <tr>
                  <td style={styles.td} colSpan="7"></td>
                  <td style={styles.td}>VR001</td>
                  <td style={styles.td}>Advance</td>
                  <td style={styles.td}></td>
                  <td style={styles.td}></td>
                  <td style={styles.td}></td>
                  <td style={styles.td}>50,000.00</td>
                </tr>

                {/* Voucher Payments Row */}
                <tr>
                  <td style={styles.td} colSpan="7"></td>
                  <td style={styles.sectionTd} colSpan="6">Voucher Payments</td>
                </tr>
                
                {/* Sample Voucher Payments Data Row */}
                <tr>
                  <td style={styles.td} colSpan="7"></td>
                  <td style={styles.td}>VP001</td>
                  <td style={styles.td}>Rent</td>
                  <td style={styles.td}></td>
                  <td style={styles.td}></td>
                  <td style={styles.td}></td>
                  <td style={styles.td}>25,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReport;