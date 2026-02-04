import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { get } from '../../../api/apiService';
import { API_ENDPOINTS } from '../../../api/endpoints';

const PrefixHistory = () => {
  // --- REFS ---
  const prefixRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [prefix, setPrefix] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // API data states
  const [prefixData, setPrefixData] = useState({
    supplierName: '',
    salesManName: '',
    invoiceDate: '',
    invoiceNo: '',
    companyName: '',
    cp: '',
    sp: '',
    brand: '',
    category: '',
    product: '',
    model: '',
    size: '',
    unit: '',
    itemPurchases: [],
    itemTransactions: [],
    transactionTotal: 0,
    purchaseTotal: 0,
    balanceQty: 0
  });

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
      paddingBottom: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '16px',
      WebkitOverflowScrolling: 'touch',
    },
    footerSection: {
      backgroundColor: 'white',
      borderTop: '1px solid #e0e0e0',
      padding: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '16px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
    },
    filterRow: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
      marginBottom: screenSize.isMobile ? '12px' : screenSize.isTablet ? '14px' : '18px',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
    },
    formField: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      flexDirection: screenSize.isMobile ? 'column' : 'row',
      width: screenSize.isMobile ? '100%' : 'auto',
      flex: screenSize.isMobile ? '1 1 100%' : '0 0 auto',
      minWidth: screenSize.isMobile ? '100%' : 'auto',
    },
    label: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#333',
      minWidth: screenSize.isMobile ? 'auto' : '80px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      width: screenSize.isMobile ? '100%' : 'auto',
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
      minWidth: screenSize.isMobile ? '100%' : '150px',
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
      minWidth: screenSize.isMobile ? '100%' : '150px',
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
      flex: '0 0 auto',
      minWidth: '100px',
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
      flex: '0 0 auto',
      minWidth: '100px',
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
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: screenSize.isMobile ? '280px' : screenSize.isTablet ? '330px' : '380px',
      minHeight: screenSize.isMobile ? '200px' : screenSize.isTablet ? '250px' : '280px',
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
      marginBottom: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '20px',
      WebkitOverflowScrolling: 'touch',
      width: screenSize.isMobile ? 'calc(100% - 12px)' : screenSize.isTablet ? 'calc(100% - 20px)' : 'calc(100% - 32px)',
      boxSizing: 'border-box',
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: screenSize.isMobile ? '150px' : screenSize.isTablet ? '180px' : '200px',
      minHeight: screenSize.isMobile ? '100px' : screenSize.isTablet ? '120px' : '150px',
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
      minWidth: screenSize.isMobile ? '80px' : screenSize.isTablet ? '90px' : '100px',
      whiteSpace: 'nowrap',
      width: screenSize.isMobile ? '80px' : screenSize.isTablet ? '90px' : '100px',
      maxWidth: screenSize.isMobile ? '80px' : screenSize.isTablet ? '90px' : '100px',
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
      minWidth: screenSize.isMobile ? '80px' : screenSize.isTablet ? '90px' : '100px',
      width: screenSize.isMobile ? '80px' : screenSize.isTablet ? '90px' : '100px',
      maxWidth: screenSize.isMobile ? '80px' : screenSize.isTablet ? '90px' : '100px',
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
      margin: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '12px' : '16px',
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column',
      flex: screenSize.isMobile ? '1 0 100%' : '0 0 auto',
      minWidth: screenSize.isMobile ? '100%' : screenSize.isTablet ? '45%' : '22%',
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

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
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

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!prefix.trim()) {
      toast.warning('Please enter a Prefix');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await get(
        API_ENDPOINTS.PREFIX_HISTORY.GET_BY_PREFIX(prefix)
      );
      
      if (response && response.supplierName !== undefined) {
        setPrefixData(response);
        setHasSearched(true);
        toast.success('Prefix history loaded successfully');
      } else {
        toast.error('No data found for this prefix');
        setPrefixData({
          supplierName: '',
          salesManName: '',
          invoiceDate: '',
          invoiceNo: '',
          companyName: '',
          cp: '',
          sp: '',
          brand: '',
          category: '',
          product: '',
          model: '',
          size: '',
          unit: '',
          itemPurchases: [],
          itemTransactions: [],
          transactionTotal: 0,
          purchaseTotal: 0,
          balanceQty: 0
        });
      }
    } catch (error) {
      toast.error('Failed to load prefix history');
      console.error('Error fetching prefix history:', error);
      setPrefixData({
        supplierName: '',
        salesManName: '',
        invoiceDate: '',
        invoiceNo: '',
        companyName: '',
        cp: '',
        sp: '',
        brand: '',
        category: '',
        product: '',
        model: '',
        size: '',
        unit: '',
        itemPurchases: [],
        itemTransactions: [],
        transactionTotal: 0,
        purchaseTotal: 0,
        balanceQty: 0
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    setPrefix('');
    setHasSearched(false);
    setPrefixData({
      supplierName: '',
      salesManName: '',
      invoiceDate: '',
      invoiceNo: '',
      companyName: '',
      cp: '',
      sp: '',
      brand: '',
      category: '',
      product: '',
      model: '',
      size: '',
      unit: '',
      itemPurchases: [],
      itemTransactions: [],
      transactionTotal: 0,
      purchaseTotal: 0,
      balanceQty: 0
    });
    if (prefixRef.current) {
      prefixRef.current.focus();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Keyboard navigation
  const handlePrefixKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // Calculate summary values
  const getSummaryData = () => {
    // Combine purchases and transactions for summary
    const allTransactions = [
      ...prefixData.itemPurchases,
      ...prefixData.itemTransactions
    ];
    
    const purchaseQty = prefixData.purchaseTotal;
    const salesReturnQty = Math.abs(prefixData.transactionTotal);
    const closingStock = prefixData.balanceQty;
    
    return {
      purchase: purchaseQty,
      salesReturn: salesReturnQty > 0 ? salesReturnQty : '',
      closingStock: closingStock
    };
  };

  const summaryData = getSummaryData();

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <form onSubmit={handleSearch}>
          {/* First Row - 5 Fields: Prefix, Supplier, Salesman, Date, Ref No */}
          <div style={styles.filterRow}>
            {/* Prefix Input */}
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
                // placeholder="Enter prefix (e.g., 00006)"
              />
            </div>

            {/* Supplier Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>Supplier:</label>
              <input
                type="text"
                style={styles.input}
                value={prefixData.supplierName || ''}
                readOnly
                // placeholder=""
              />
            </div>

            {/* Salesman Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>Salesman:</label>
              <input
                type="text"
                style={styles.input}
                value={prefixData.salesManName || ''}
                readOnly
                // placeholder=""
              />
            </div>

            {/* Date Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>Date:</label>
              <input
                type="text"
                style={styles.input}
                value={formatDate(prefixData.invoiceDate)}
                readOnly
                // placeholder=""
              />
            </div>

            {/* Ref No Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>Ref No:</label>
              <input
                type="text"
                style={styles.input}
                value={prefixData.invoiceNo || ''}
                readOnly
                // placeholder=""
              />
            </div>
          </div>

          {/* Second Row - Floor, CP, SP, Brand */}
          <div style={styles.filterRow}>
            {/* Floor Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>Floor:</label>
              <input
                type="text"
                style={{...styles.input, width: '460px'}}
                value={prefixData.companyName || ''}
                readOnly
                // placeholder=""
              />
            </div>

            {/* CP Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>CP:</label>
              <input
                type="text"
                style={styles.input}
                value={prefixData.cp || ''}
                readOnly
              />
            </div>

            {/* SP Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>SP:</label>
              <input
                type="text"
                style={styles.input}
                value={prefixData.sp || ''}
                readOnly
              />
            </div>

            {/* Brand Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>Brand:</label>
              <input
                type="text"
                style={styles.input}
                value={prefixData.brand || ''}
                readOnly
              />
            </div>
          </div>

          {/* Third Row - 5 Fields: Category, Product, Model, Size, Unit */}
          <div style={styles.filterRow}>
            {/* Category Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>Category:</label>
              <input
                type="text"
                style={styles.input}
                value={prefixData.category || ''}
                readOnly
              />
            </div>

            {/* Product Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>Product:</label>
              <input
                type="text"
                style={styles.input}
                value={prefixData.product || ''}
                readOnly
              />
            </div>

            {/* Model Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>Model:</label>
              <input
                type="text"
                style={styles.input}
                value={prefixData.model || ''}
                readOnly
              />
            </div>

            {/* Size Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>Size:</label>
              <input
                type="text"
                style={styles.input}
                value={prefixData.size || ''}
                readOnly
              />
            </div>

            {/* Unit Input (Read-only) */}
            <div style={styles.formField}>
              <label style={styles.label}>Unit:</label>
              <input
                type="text"
                style={styles.input}
                value={prefixData.unit || ''}
                readOnly
              />
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
                <th style={styles.th}>Bill No.</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Rate</th>
                <th style={styles.th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {!hasSearched ? (
                <tr>
                  <td colSpan="6" style={styles.emptyMsg}>
                   
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan="6" style={styles.emptyMsg}>
                    Loading...
                  </td>
                </tr>
              ) : prefixData.itemPurchases.length === 0 && prefixData.itemTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.emptyMsg}>
                    No transaction data found
                  </td>
                </tr>
              ) : (
                <>
                  {/* Display Purchase Items */}
                  {prefixData.itemPurchases.map((item, idx) => (
                    <tr key={`purchase-${idx}`}>
                      <td style={styles.td}>{item.billno}</td>
                      <td style={styles.td}>{item.billType}</td>
                      <td style={styles.td}>{formatDate(item.date)}</td>
                      <td style={styles.td}>{item.qty}</td>
                      <td style={styles.td}>{item.rate}</td>
                      <td style={styles.td}>{item.amount}</td>
                    </tr>
                  ))}
                  
                  {/* Display Transaction Items */}
                  {prefixData.itemTransactions.map((item, idx) => (
                    <tr key={`transaction-${idx}`}>
                      <td style={styles.td}>{item.billno}</td>
                      <td style={styles.td}>{item.billType}</td>
                      <td style={styles.td}>{formatDate(item.date)}</td>
                      <td style={styles.td}>{item.qty}</td>
                      <td style={styles.td}>{item.rate}</td>
                      <td style={styles.td}>{item.amount}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Table */}
        {hasSearched && !isLoading && (prefixData.itemPurchases.length > 0 || prefixData.itemTransactions.length > 0) && (
          <div style={styles.summaryTableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Summary</th>
                  <th style={styles.th}>Purchase&DC</th>
                  <th style={styles.th}>Sales,DC, Purchase Return</th>
                  <th style={styles.th}>Closing Stock</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{...styles.td, fontWeight: TYPOGRAPHY.fontWeight.bold}}>Total</td>
                  <td style={styles.td}>{summaryData.purchase}</td>
                  <td style={styles.td}>{summaryData.salesReturn || '0'}</td>
                  <td style={styles.td}>{summaryData.closingStock}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Section - After Summary Table */}
        <div style={styles.footerSection}>
          <button type="button" style={styles.buttonSecondary} onClick={handleRefresh}>
            Refresh
          </button>
          <button type="button" style={styles.button} onClick={handlePrint}>
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrefixHistory;