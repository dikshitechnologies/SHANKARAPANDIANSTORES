import React, { useState } from 'react';

const GroupwiseStock = () => {
  // --- STATE MANAGEMENT ---
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [searchedGroup, setSearchedGroup] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Drill-down states
  const [viewLevel, setViewLevel] = useState('groups'); // 'groups' | 'items' | 'bills'
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [selectedItemName, setSelectedItemName] = useState('');

  // Dummy groups data
  const groups = [
    'ALL',
    'ASSORTED GOLD',
    'ASSORTED SILVER',
    'GOLD',
    'GOLD BARCODE',
    'GOLD MANAUAL',
    'GOLD PCS',
    'METAL',
    'OLD GOLD.',
    'OLD SILVER.',
    'SILVER',
    'SILVER BARCODE',
    'SILVER MANAUAL',
    'SILVER PCS'
  ];

  // Dummy stock data for different groups
  const stockData = {
    'GOLD': [
      { id: 1, itemName: 'BANGEL', opgPcs: 4, opgGms: -939.000, purPcs: 62, purGms: 5511.000, salPcs: 58, salGms: 6450.000, balPcs: 4, balGms: -939.000 },
      { id: 2, itemName: 'BRACELETS', opgPcs: 7, opgGms: 143.000, purPcs: 7, purGms: 143.000, salPcs: '', salGms: '', balPcs: 7, balGms: 143.000 },
      { id: 3, itemName: 'CHAIN', opgPcs: 4, opgGms: 2333.000, purPcs: 6, purGms: 3133.000, salPcs: 2, salGms: 800.000, balPcs: 4, balGms: 2333.000 },
      { id: 4, itemName: 'CHAINGOLD', opgPcs: 78, opgGms: 1038.000, purPcs: 82, purGms: 1081.000, salPcs: 4, salGms: 43.000, balPcs: 78, balGms: 1038.000 },
      { id: 5, itemName: 'EARRINGS', opgPcs: -3, opgGms: -324.000, purPcs: '', purGms: '', salPcs: 3, salGms: 324.000, balPcs: -3, balGms: -324.000 },
      { id: 6, itemName: 'GOLD RING', opgPcs: 38, opgGms: 1872.000, purPcs: 67, purGms: 1945.000, salPcs: 29, salGms: 73.000, balPcs: 38, balGms: 1872.000 },
      { id: 7, itemName: 'HARAM', opgPcs: 2, opgGms: 200.000, purPcs: 3, purGms: 300.000, salPcs: 1, salGms: 100.000, balPcs: 2, balGms: 200.000 },
      { id: 8, itemName: 'NECKLACE', opgPcs: -1, opgGms: -18.000, purPcs: '', purGms: '', salPcs: 1, salGms: 18.000, balPcs: -1, balGms: -18.000 },
      { id: 9, itemName: 'NOSE RING', opgPcs: -1, opgGms: -8.000, purPcs: '', purGms: '', salPcs: 1, salGms: 8.000, balPcs: -1, balGms: -8.000 },
      { id: 10, itemName: 'PENDANTS', opgPcs: -5, opgGms: -700.000, purPcs: '', purGms: '', salPcs: 5, salGms: 700.000, balPcs: -5, balGms: -700.000 },
      { id: 11, itemName: 'RING(GOLD)', opgPcs: -48, opgGms: -420.000, purPcs: 3, purGms: 210.000, salPcs: 51, salGms: 630.000, balPcs: -48, balGms: -420.000 },
      { id: 12, itemName: 'RINGS', opgPcs: 10, opgGms: 100.000, purPcs: 10, purGms: 100.000, salPcs: '', salGms: '', balPcs: 10, balGms: 100.000 },
      { id: 13, itemName: 'THALI', opgPcs: -5, opgGms: -2.000, purPcs: 3, purGms: 220.000, salPcs: 8, salGms: 222.000, balPcs: -5, balGms: -2.000 }
    ],
    'SILVER': [
      { id: 1, itemName: 'SILVER BANGEL', opgPcs: 5, opgGms: 400.000, purPcs: 45, purGms: 3200.000, salPcs: 40, salGms: 2800.000, balPcs: 5, balGms: 400.000 },
      { id: 2, itemName: 'SILVER CHAIN', opgPcs: 5, opgGms: 300.000, purPcs: 30, purGms: 1500.000, salPcs: 25, salGms: 1200.000, balPcs: 5, balGms: 300.000 },
      { id: 3, itemName: 'SILVER RING', opgPcs: 15, opgGms: 75.000, purPcs: 100, purGms: 500.000, salPcs: 85, salGms: 425.000, balPcs: 15, balGms: 75.000 }
    ],
    'ASSORTED GOLD': [
      { id: 1, itemName: 'ASSORTED BANGEL', opgPcs: 5, opgGms: 400.000, purPcs: 25, purGms: 2200.000, salPcs: 20, salGms: 1800.000, balPcs: 5, balGms: 400.000 },
      { id: 2, itemName: 'ASSORTED RING', opgPcs: 3, opgGms: 150.000, purPcs: 15, purGms: 750.000, salPcs: 12, salGms: 600.000, balPcs: 3, balGms: 150.000 }
    ],
    'ASSORTED SILVER': [
      { id: 1, itemName: 'ASSORTED SILVER BANGEL', opgPcs: 5, opgGms: 400.000, purPcs: 35, purGms: 2500.000, salPcs: 30, salGms: 2100.000, balPcs: 5, balGms: 400.000 }
    ],
    'GOLD BARCODE': [
      { id: 1, itemName: 'BC BANGEL', opgPcs: 5, opgGms: 500.000, purPcs: 50, purGms: 4500.000, salPcs: 45, salGms: 4000.000, balPcs: 5, balGms: 500.000 }
    ],
    'SILVER BARCODE': [
      { id: 1, itemName: 'BC SILVER CHAIN', opgPcs: 5, opgGms: 250.000, purPcs: 40, purGms: 2000.000, salPcs: 35, salGms: 1750.000, balPcs: 5, balGms: 250.000 }
    ]
  };

  const cashSalesPayments = {
    'GOLD': { cashSales: 32429496.00, payments: 11417342.67, closingCash: 1012153.33 },
    'SILVER': { cashSales: 5500000.00, payments: 4800000.00, closingCash: 250000.00 },
    'ASSORTED GOLD': { cashSales: 8900000.00, payments: 7500000.00, closingCash: 450000.00 },
    'ASSORTED SILVER': { cashSales: 4500000.00, payments: 3800000.00, closingCash: 350000.00 },
    'GOLD BARCODE': { cashSales: 15000000.00, payments: 13000000.00, closingCash: 800000.00 },
    'SILVER BARCODE': { cashSales: 7500000.00, payments: 6500000.00, closingCash: 400000.00 }
  };

  // Dummy bill data for items
  const billData = {
    'BANGEL': [
      { id: 1, billNo: 'PO0006AA', date: '05/01/2026', inQty: 1000.000, inRate: 150.00, outQty: '', outRate: '' },
      { id: 2, billNo: 'SI0015BB', date: '05/01/2026', inQty: '', inRate: '', outQty: 500.000, outRate: 180.00 }
    ],
    'CHILDRENS CHURIDAR': [
      { id: 1, billNo: 'PO0006AA', date: '05/01/2026', inQty: 1000.000, inRate: 150.00, outQty: '', outRate: '' },
      { id: 2, billNo: 'PO0007BB', date: '04/01/2026', inQty: 500.000, inRate: 145.00, outQty: '', outRate: '' }
    ],
    'TEST NEW': [
      { id: 1, billNo: 'PO0006AA', date: '05/01/2026', inQty: 1000.000, inRate: 150.00, outQty: '', outRate: '' }
    ]
  };

  // Group summary data
  const groupSummaryData = [
    { groupName: 'CAPRI', opgQty: '', inQty: '', outQty: '', balQty: '', stockValue: 0.00 },
    { groupName: 'BOYS WEAR', opgQty: '', inQty: '', outQty: '', balQty: '', stockValue: 0.00 },
    { groupName: 'CHILDRENS CHURIDAR', opgQty: '', inQty: 1000.000, outQty: '', balQty: 1000.000, stockValue: 150000.00 },
    { groupName: 'GIRLS WEAR', opgQty: '', inQty: '', outQty: '', balQty: '', stockValue: 0.00 },
    { groupName: 'COTTON FROCK', opgQty: '', inQty: '', outQty: '', balQty: '', stockValue: 0.00 },
    { groupName: 'GOLD', opgQty: 50, inQty: 200, outQty: 150, balQty: 100, stockValue: 5000000.00 }
  ];

  // Item details for a specific group
  const itemDetailsData = {
    'CHILDRENS CHURIDAR': [
      { id: 1, itemName: 'TEST NEW', opgQty: 0.000, inQty: 1000.000, outQty: 0.000, balQty: 1000.000, salAmt: 0.00, cost: 0.00, profit: 0.00 }
    ],
    'GOLD': [
      { id: 1, itemName: 'BANGEL', opgQty: 4.000, inQty: 62.000, outQty: 58.000, balQty: 4.000, salAmt: 450000.00, cost: 400000.00, profit: 50000.00 },
      { id: 2, itemName: 'RING', opgQty: 10.000, inQty: 50.000, outQty: 45.000, balQty: 15.000, salAmt: 350000.00, cost: 320000.00, profit: 30000.00 }
    ]
  };


  // Calculate totals
  const calculateTotals = (data) => {
    if (!data || data.length === 0) return { opgPcs: 0, opgGms: 0, purPcs: 0, purGms: 0, salPcs: 0, salGms: 0, balPcs: 0, balGms: 0 };
    return data.reduce((acc, item) => ({
      opgPcs: acc.opgPcs + (parseFloat(item.opgPcs) || 0),
      opgGms: acc.opgGms + (parseFloat(item.opgGms) || 0),
      purPcs: acc.purPcs + (parseFloat(item.purPcs) || 0),
      purGms: acc.purGms + (parseFloat(item.purGms) || 0),
      salPcs: acc.salPcs + (parseFloat(item.salPcs) || 0),
      salGms: acc.salGms + (parseFloat(item.salGms) || 0),
      balPcs: acc.balPcs + (parseFloat(item.balPcs) || 0),
      balGms: acc.balGms + (parseFloat(item.balGms) || 0)
    }), { opgPcs: 0, opgGms: 0, purPcs: 0, purGms: 0, salPcs: 0, salGms: 0, balPcs: 0, balGms: 0 });
  };

  const currentData = hasSearched && Array.isArray(searchedGroup)
    ? (searchedGroup.includes('ALL')
        ? Object.values(stockData).flat()
        : searchedGroup.flatMap(g => stockData[g] || []))
    : [];
  const totals = calculateTotals(currentData);
  const financialData = hasSearched && searchedGroup && cashSalesPayments[searchedGroup] ? cashSalesPayments[searchedGroup] : null;

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
      alignItems: 'center',
      gap: '12px',
      marginBottom: '18px',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
    },
    formField: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '2px' : screenSize.isTablet ? '8px' : '10px',
    },
    label: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#333',
      minWidth: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
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
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '80px' : '100px',
    },
    selectGroupBtn: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '8px 10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
      minWidth: '200px',
      outline: 'none',
    },
    leftSide: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: 1,
      flexWrap: 'nowrap',
    },
    rightSide: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0,
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.18)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modal: {
      background: '#fff',
      borderRadius: '10px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
      minWidth: '550px',
      maxWidth: '95vw',
      maxHeight: '80vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    modalHeader: {
      background: '#1B91DA',
      color: '#fff',
      fontWeight: 600,
      fontSize: '18px',
      padding: '16px 20px',
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
    },
    modalBody: {
      padding: '18px 20px',
      overflowY: 'auto',
      flex: 1,
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      padding: '16px 20px',
      borderTop: '1px solid #f0f0f0',
      background: '#fafcff',
    },
    modalCheckboxRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '12px',
      fontSize: '16px',
      fontWeight: 500,
      color: '#222',
    },
    modalCheckbox: {
      width: '18px',
      height: '18px',
      accentColor: '#1B91DA',
    },
    modalBtn: {
      background: '#1B91DA',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 28px',
      fontWeight: 600,
      fontSize: '15px',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    modalBtnClear: {
      background: '#fff',
      color: '#ff4d4f',
      border: '1.5px solid #ff4d4f',
      borderRadius: '6px',
      padding: '8px 22px',
      fontWeight: 600,
      fontSize: '15px',
      cursor: 'pointer',
      transition: 'background 0.2s',
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
      minWidth: screenSize.isMobile ? '80px' : '100px',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
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
      minWidth: screenSize.isMobile ? '80px' : '100px',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
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
    clickableRow: {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    backButton: {
      backgroundColor: '#f0f0f0',
      border: '1px solid #1B91DA',
      color: '#1B91DA',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      transition: 'all 0.3s ease',
      marginBottom: '10px',
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#1B91DA',
      marginBottom: '5px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
  };

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchedGroup([...selectedGroup]);
    setHasSearched(true);
    setViewLevel('groups');
  };
  
  const handleGroupRowClick = (groupName) => {
    setSelectedGroupName(groupName);
    setViewLevel('items');
  };
  
  const handleItemRowClick = (itemName) => {
    setSelectedItemName(itemName);
    setViewLevel('bills');
  };
  
  const handleBackToGroups = () => {
    setViewLevel('groups');
    setSelectedGroupName('');
    setSelectedItemName('');
  };
  
  const handleBackToItems = () => {
    setViewLevel('items');
    setSelectedItemName('');
  };
  
  const [showGroupModal, setShowGroupModal] = useState(false);
  const handleRefresh = () => {
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setSelectedGroup([]);
    setSearchedGroup([]);
    setHasSearched(false);
    setViewLevel('groups');
    setSelectedGroupName('');
    setSelectedItemName('');
  };
  const handleGroupModalOpen = () => setShowGroupModal(true);
  const handleGroupModalClose = () => setShowGroupModal(false);
  const handleGroupCheck = (group) => {
    if (group === 'ALL') {
      // When ALL is checked, select all groups
      if (selectedGroup.includes('ALL')) {
        // If ALL is already selected, deselect all
        setSelectedGroup([]);
      } else {
        // Select all groups including ALL
        setSelectedGroup([...groups]);
      }
    } else {
      let updated = [...selectedGroup];
      if (updated.includes(group)) {
        // Deselect the group
        updated = updated.filter(g => g !== group);
        // Also remove ALL if it was selected
        updated = updated.filter(g => g !== 'ALL');
      } else {
        // Add the group (but remove ALL first if it was selected)
        updated = updated.filter(g => g !== 'ALL');
        updated.push(group);
      }
      setSelectedGroup(updated);
    }
  };
  const handleGroupClear = () => setSelectedGroup([]);
  const handleGroupOk = () => setShowGroupModal(false);

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <form onSubmit={handleSearch}>
          <div style={styles.filterRow}>
            {/* LEFT SIDE: Date fields and Select Group */}
            <div style={styles.leftSide}>
              {/* From Date */}
              <div style={styles.formField}>
                <label style={styles.label}>From Date:</label>
                <input
                  type="date"
                  style={styles.input}
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </div>

              {/* To Date */}
              <div style={styles.formField}>
                <label style={styles.label}>To Date:</label>
                <input
                  type="date"
                  style={styles.input}
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </div>

              {/* Select Group */}
              <div style={{...styles.formField, flex: 1, minWidth: '200px'}}>
                <label style={styles.label}>Select Group:</label>
                <button type="button" style={styles.selectGroupBtn} onClick={handleGroupModalOpen}>
                  <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    flex: 1 
                  }}>
                    {selectedGroup.includes('ALL')
                      ? 'ALL'
                      : selectedGroup.filter(g => g).join(', ') || 'Select...'}
                  </span>
                  <span style={{ color: '#1B91DA', fontSize: '10px', marginLeft: '8px' }}>▼</span>
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: Buttons */}
            <div style={styles.rightSide}>
              <button type="submit" style={styles.button}>Search</button>
              <button type="button" style={styles.buttonSecondary} onClick={handleRefresh}>Refresh</button>
            </div>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div style={styles.tableSection}>
        {/* Back Button and Title */}
        {viewLevel !== 'groups' && (
          <div style={{ padding: '10px 20px 0px 20px' }}>
            <button 
              style={styles.backButton} 
              onClick={viewLevel === 'items' ? handleBackToGroups : handleBackToItems}
            >
              ← Back
            </button>
            <div style={styles.headerTitle}>
              {viewLevel === 'items' && `Branch Wise Stock for DIKSHI DEMO(${fromDate} - ${toDate})`}
              {viewLevel === 'bills' && `Branch Wise Stock for DIKSHI DEMO(${fromDate} - ${toDate})`}
            </div>
          </div>
        )}
        
        <div style={styles.tableContainer}>
          {/* GROUP SUMMARY VIEW */}
          {viewLevel === 'groups' && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>No.</th>
                  <th style={styles.th}>Group Name</th>
                  <th style={styles.th}>Opg Qty</th>
                  <th style={styles.th}>In Qty</th>
                  <th style={styles.th}>Out Qty</th>
                  <th style={styles.th}>Bal Qty</th>
                  <th style={styles.th}>Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {!hasSearched ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyMsg}>
                      Enter search criteria and click "Search" to view group wise stock
                    </td>
                  </tr>
                ) : (
                  <>
                    {groupSummaryData.map((item, idx) => (
                      <tr 
                        key={idx} 
                        style={styles.clickableRow}
                        onClick={() => handleGroupRowClick(item.groupName)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#f9f9f9' : '#ffffff'}
                      >
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={{...styles.td, textAlign: 'left', paddingLeft: '15px'}}>{item.groupName}</td>
                        <td style={styles.td}>{item.opgQty}</td>
                        <td style={styles.td}>{item.inQty}</td>
                        <td style={styles.td}>{item.outQty}</td>
                        <td style={styles.td}>{item.balQty}</td>
                        <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>
                          {item.stockValue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr style={styles.totalRow}>
                      <td colSpan="2" style={styles.td}>Total</td>
                      <td style={styles.td}>-15.00</td>
                      <td style={styles.td}>1000.00</td>
                      <td style={styles.td}>37.00</td>
                      <td style={styles.td}>948.00</td>
                      <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>121500.00</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          )}

          {/* ITEM DETAILS VIEW */}
          {viewLevel === 'items' && (
            <>
              {/* Group Name Header - Outside table */}
              <div style={{
                fontSize: TYPOGRAPHY.fontSize.lg,
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                color: '#333',
                padding: '15px 20px',
                backgroundColor: 'white',
                borderBottom: '2px solid #e0e0e0'
              }}>
                {selectedGroupName}
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>No.</th>
                    <th style={styles.th}>Item Name</th>
                    <th style={styles.th}>Opg Qty</th>
                    <th style={styles.th}>In Qty</th>
                    <th style={styles.th}>Out Qty</th>
                    <th style={styles.th}>Bal Qty</th>
                    <th style={styles.th}>Sal Amt</th>
                    <th style={styles.th}>Cost</th>
                    <th style={styles.th}>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {(itemDetailsData[selectedGroupName] || []).map((item, idx) => (
                  <tr 
                    key={item.id}
                    style={styles.clickableRow}
                    onClick={() => handleItemRowClick(item.itemName)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cce7ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={{...styles.td, textAlign: 'left', paddingLeft: '15px'}}>{item.itemName}</td>
                    <td style={styles.td}>{item.opgQty.toFixed(3)}</td>
                    <td style={styles.td}>{item.inQty.toFixed(3)}</td>
                    <td style={styles.td}>{item.outQty.toFixed(3)}</td>
                    <td style={styles.td}>{item.balQty.toFixed(3)}</td>
                    <td style={styles.td}>{item.salAmt.toFixed(2)}</td>
                    <td style={styles.td}>{item.cost.toFixed(2)}</td>
                    <td style={styles.td}>{item.profit.toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={styles.totalRow}>
                  <td colSpan="2" style={styles.td}>Total</td>
                  <td style={styles.td}>0.000</td>
                  <td style={styles.td}>1000.000</td>
                  <td style={styles.td}>0.000</td>
                  <td style={styles.td}>1000.000</td>
                  <td style={styles.td}>0.00</td>
                  <td style={styles.td}>0.00</td>
                  <td style={styles.td}>0.00</td>
                </tr>
              </tbody>
            </table>
            </>
          )}

          {/* BILL DETAILS VIEW */}
          {viewLevel === 'bills' && (
            <>
              {/* Item Name Header - Outside table */}
              <div style={{
                fontSize: TYPOGRAPHY.fontSize.lg,
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                color: '#333',
                padding: '15px 20px',
                backgroundColor: 'white',
                borderBottom: '2px solid #e0e0e0'
              }}>
                {selectedItemName}
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>No.</th>
                    <th style={styles.th}>Bill No</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>In Qty</th>
                    <th style={styles.th}>In Rate</th>
                    <th style={styles.th}>Out Qty</th>
                    <th style={styles.th}>Out Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(billData[selectedItemName] || []).map((bill, idx) => (
                  <tr key={bill.id}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>{bill.billNo}</td>
                    <td style={styles.td}>{bill.date}</td>
                    <td style={styles.td}>{bill.inQty}</td>
                    <td style={styles.td}>{bill.inRate}</td>
                    <td style={styles.td}>{bill.outQty}</td>
                    <td style={styles.td}>{bill.outRate}</td>
                  </tr>
                ))}
                <tr style={styles.totalRow}>
                  <td colSpan="3" style={styles.td}>Total</td>
                  <td style={styles.td}>1000.000</td>
                  <td style={styles.td}></td>
                  <td style={styles.td}>0.000</td>
                  <td style={styles.td}></td>
                </tr>
              </tbody>
            </table>
            </>
          )}
        </div>
      </div>
        
      {/* Select Group Modal */}
      {showGroupModal && (
        <div style={styles.modalOverlay} onClick={handleGroupModalClose}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>Select Groups</div>
            <div style={styles.modalBody}>
              {groups.map((group, idx) => (
                <div key={group} style={styles.modalCheckboxRow}>
                  <input
                    type="checkbox"
                    style={styles.modalCheckbox}
                    checked={selectedGroup.includes(group) || (group !== 'ALL' && selectedGroup.includes('ALL'))}
                    onChange={() => handleGroupCheck(group)}
                  />
                  <span>{group}</span>
                </div>
              ))}
            </div>
            <div style={styles.modalFooter}>
              <button type="button" style={styles.modalBtnClear} onClick={handleGroupClear}>Clear</button>
              <button type="button" style={styles.modalBtn} onClick={handleGroupOk}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupwiseStock;
