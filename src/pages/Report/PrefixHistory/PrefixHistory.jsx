import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { get } from '../../../api/apiService';
import { API_ENDPOINTS } from '../../../api/endpoints';

const PrefixHistory = () => {
  // --- REFS ---
  const prefixRef = useRef(null);
  const supplierRef = useRef(null);
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const searchButtonRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [prefix, setPrefix] = useState('');
  const [supplier, setSupplier] = useState('');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasSearched, setHasSearched] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // API data states
  const [prefixData, setPrefixData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);

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
      maxHeight: screenSize.isMobile ? '300px' : screenSize.isTablet ? '350px' : '400px',
      minHeight: screenSize.isMobile ? '200px' : screenSize.isTablet ? '250px' : '300px',
    },
    summaryTableContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      overflowX: 'auto',
      overflowY: 'auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      margin: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginTop: 0,
      marginBottom: screenSize.isMobile ? '70px' : screenSize.isTablet ? '80px' : '90px',
      WebkitOverflowScrolling: 'touch',
      width: screenSize.isMobile ? 'calc(100% - 12px)' : screenSize.isTablet ? 'calc(100% - 20px)' : 'calc(100% - 32px)',
      boxSizing: 'border-box',
      flex: 'none',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: screenSize.isMobile ? '200px' : screenSize.isTablet ? '250px' : '300px',
      minHeight: screenSize.isMobile ? '150px' : screenSize.isTablet ? '180px' : '200px',
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
    infoBox: {
      backgroundColor: '#e8f4fd',
      border: '1px solid #1B91DA',
      borderRadius: '6px',
      padding: screenSize.isMobile ? '10px' : screenSize.isTablet ? '12px' : '16px',
      marginBottom: screenSize.isMobile ? '12px' : screenSize.isTablet ? '16px' : '20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '12px' : '16px',
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column',
      flex: screenSize.isMobile ? '1 0 100%' : '0 0 auto',
      minWidth: screenSize.isMobile ? '100%' : screenSize.isTablet ? '45%' : '30%',
    },
    infoLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#666',
      marginBottom: '2px',
    },
    infoValue: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#1B91DA',
    },
  };

  // Helper function to convert YYYY-MM-DD to DD/MM/YYYY for API
  const formatDateForAPI = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Auto-focus on prefix when component mounts
  useEffect(() => {
    if (prefixRef.current) {
      setTimeout(() => {
        prefixRef.current.focus();
      }, 100);
    }
  }, []);

  // Handlers
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!prefix.trim()) {
      toast.warning('Please enter a Prefix');
      return;
    }
    
    setIsLoading(true);
    try {
      // Convert dates to DD/MM/YYYY format
      const apiFromDate = formatDateForAPI(fromDate);
      const apiToDate = formatDateForAPI(toDate);
      
      // TODO: Replace with your actual API endpoint
      const response = await get(
        API_ENDPOINTS.PREFIX_HISTORY.SEARCH(
          prefix,
          supplier,
          apiFromDate,
          apiToDate
        )
      );
      
      if (response.success && response.data) {
        setPrefixData(response.data.details || []);
        setSummaryData(response.data.summary || null);
        setHasSearched(true);
        toast.success(response.message || 'Data loaded successfully');
      } else {
        toast.error('No data found');
        setPrefixData([]);
        setSummaryData(null);
      }
    } catch (error) {
      toast.error('Failed to load prefix history');
      console.error('Error fetching prefix history:', error);
      setPrefixData([]);
      setSummaryData(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    setPrefix('');
    setSupplier('');
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setHasSearched(false);
    setPrefixData([]);
    setSummaryData(null);
  };

  // Keyboard navigation handlers
  const handlePrefixKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      supplierRef.current?.focus();
    }
  };

  const handleSupplierKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fromDateRef.current?.focus();
    }
  };

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

  // Mock data for demonstration
  const mockPrefixData = [
    { 
      billNo: 'DC00028AA', 
      pcs: '0.00', 
      gross: '22.000', 
      counter: '1', 
      design: '', 
      section: '', 
      size: '', 
      div: '' 
    }
  ];

  const mockSummaryData = {
    purchase: '22.000',
    salesReturn: '',
    closingStock: '22.000'
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <form onSubmit={handleSearch}>
          <div style={styles.filterRow}>
            {/* LEFT SIDE: Search fields */}
            <div style={styles.leftSide}>
              {/* Prefix */}
              <div style={styles.formField}>
                <label style={styles.label}>Prefix:</label>
                <input
                  ref={prefixRef}
                  type="text"
                  style={focusedField === 'prefix' ? styles.inputFocused : styles.input}
                  value={prefix}
                  onChange={e => setPrefix(e.target.value)}
                  onKeyDown={handlePrefixKeyDown}
                  onFocus={() => setFocusedField('prefix')}
                  onBlur={() => setFocusedField('')}
                  // placeholder="Enter prefix"
                />
              </div>

              {/* Supplier */}
              <div style={styles.formField}>
                <label style={styles.label}>Supplier:</label>
                <input
                  ref={supplierRef}
                  type="text"
                  style={focusedField === 'supplier' ? styles.inputFocused : styles.input}
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  onKeyDown={handleSupplierKeyDown}
                  onFocus={() => setFocusedField('supplier')}
                  onBlur={() => setFocusedField('')}
                  // placeholder="Enter supplier"
                />
              </div>

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
        {/* Info Box (Prefix Details) */}
        {hasSearched && (
          <div style={styles.infoBox}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Prefix</span>
              <span style={styles.infoValue}>AADDLI</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Supplier</span>
              <span style={styles.infoValue}>ABC SUPPLIER</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Gross</span>
              <span style={styles.infoValue}>22.000</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Item Name</span>
              <span style={styles.infoValue}>GOLD RING</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Ref No</span>
              <span style={styles.infoValue}>DC00028AA</span>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div style={styles.mainTableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Bill No.</th>
                <th style={styles.th}>Pcs</th>
                <th style={styles.th}>Gross</th>
                <th style={styles.th}>Counter</th>
                <th style={styles.th}>Design</th>
                <th style={styles.th}>Section</th>
                <th style={styles.th}>Size</th>
                <th style={styles.th}>Div</th>
              </tr>
            </thead>
            <tbody>
              {!hasSearched ? (
                <tr>
                  <td colSpan="8" style={styles.emptyMsg}>
                    {/* Enter prefix and click "Search" to view prefix history */}
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan="8" style={styles.emptyMsg}>
                    Loading...
                  </td>
                </tr>
              ) : mockPrefixData.length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.emptyMsg}>
                    No data found
                  </td>
                </tr>
              ) : (
                <>
                  {mockPrefixData.map((item, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{item.billNo}</td>
                      <td style={styles.td}>{item.pcs}</td>
                      <td style={styles.td}>{item.gross}</td>
                      <td style={styles.td}>{item.counter}</td>
                      <td style={styles.td}>{item.design}</td>
                      <td style={styles.td}>{item.section}</td>
                      <td style={styles.td}>{item.size}</td>
                      <td style={styles.td}>{item.div}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Table */}
        {hasSearched && !isLoading && mockPrefixData.length > 0 && (
          <div style={styles.summaryTableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Summary</th>
                  <th style={styles.th}>Purchase</th>
                  <th style={styles.th}>Sales & P.Return</th>
                  <th style={styles.th}>Closing Stock</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{...styles.td, fontWeight: TYPOGRAPHY.fontWeight.bold}}>Total</td>
                  <td style={styles.td}>{mockSummaryData.purchase}</td>
                  <td style={styles.td}>{mockSummaryData.salesReturn || ''}</td>
                  <td style={styles.td}>{mockSummaryData.closingStock}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrefixHistory;