import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { get } from '../../../api/apiService';
import { API_ENDPOINTS } from '../../../api/endpoints';

const GroupwiseStock = () => {
  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const companyRef = useRef(null);
  const searchTextRef = useRef(null);
  const searchButtonRef = useRef(null);
  const companySearchInputRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [company, setCompany] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [companyDisplay, setCompanyDisplay] = useState('Select Company');
  const [hasSearched, setHasSearched] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  
  // Drill-down states
  const [viewLevel, setViewLevel] = useState('groups'); // 'groups' | 'items' | 'bills'
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [selectedItemName, setSelectedItemName] = useState('');
  
  // Company popup states
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [tempSelectedCompany, setTempSelectedCompany] = useState([]);
  const [tempSelectedCompanyCode, setTempSelectedCompanyCode] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [companySearchText, setCompanySearchText] = useState('');
  
  // API data states
  const [stockData, setStockData] = useState([]);
  const [totalData, setTotalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Second screen (group details) states
  const [groupDetailsData, setGroupDetailsData] = useState([]);
  const [groupDetailsTotal, setGroupDetailsTotal] = useState(null);
  
  // Third screen (item details) states
  const [itemDetailsData, setItemDetailsData] = useState([]);
  const [itemTotalInQty, setItemTotalInQty] = useState(0);
  const [itemTotalOutQty, setItemTotalOutQty] = useState(0);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await get(API_ENDPOINTS.LEDGER.COMPANIES);
        if (response.status === 'success' && response.data) {
          setAllCompanies(response.data);
        }
      } catch (error) {
        toast.error('Failed to load companies');
        console.error('Error fetching companies:', error);
      }
    };
    fetchCompanies();
  }, []);

  // Auto-focus on fromDate when component mounts
  useEffect(() => {
    if (fromDateRef.current) {
      setTimeout(() => {
        fromDateRef.current.focus();
      }, 100);
    }
  }, []);

  // Focus on company search input when popup opens
  useEffect(() => {
    if (showCompanyPopup && companySearchInputRef.current) {
      setTimeout(() => {
        companySearchInputRef.current?.focus();
      }, 100);
    }
  }, [showCompanyPopup]);

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
    selectGroupBtnFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      background: '#fff',
      color: '#333',
      border: '2px solid #1B91DA',
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
    if (!company) {
      toast.warning('Please select a Company');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await get(
        API_ENDPOINTS.GROUP_WISE_STOCK.BRANCH_WISE_STOCK(
          fromDate,
          toDate,
          companyCode,
          searchText,
          1,
          100
        )
      );
      
      if (response.success && response.details) {
        setStockData(response.details);
        setTotalData(response.total);
        setHasSearched(true);
        setViewLevel('groups');
        toast.success(response.message || 'Data loaded successfully');
      } else {
        toast.error('No data found');
        setStockData([]);
        setTotalData(null);
      }
    } catch (error) {
      toast.error('Failed to load stock data');
      console.error('Error fetching stock data:', error);
      setStockData([]);
      setTotalData(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setCompany([]);
    setCompanyCode([]);
    setCompanyDisplay('Select Company');
    setSearchText('');
    setHasSearched(false);
    setStockData([]);
    setTotalData(null);
    setGroupDetailsData([]);
    setGroupDetailsTotal(null);
    setItemDetailsData([]);
    setItemTotalInQty(0);
    setItemTotalOutQty(0);
    setViewLevel('groups');
    setSelectedGroupName('');
    setSelectedItemName('');
  };
  
  const handleGroupRowClick = async (groupName) => {
    setSelectedGroupName(groupName);
    setIsLoading(true);
    try {
      const response = await get(
        API_ENDPOINTS.GROUP_WISE_STOCK.GROUP_DETAIL(
          groupName,
          fromDate,
          toDate,
          companyCode
        )
      );
      
      if (response.success && response.details) {
        setGroupDetailsData(response.details);
        setGroupDetailsTotal(response.total);
        setViewLevel('items');
      } else {
        toast.error('No data found for this group');
        setGroupDetailsData([]);
        setGroupDetailsTotal(null);
      }
    } catch (error) {
      toast.error('Failed to load group details');
      console.error('Error fetching group details:', error);
      setGroupDetailsData([]);
      setGroupDetailsTotal(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleItemRowClick = async (itemName) => {
    setSelectedItemName(itemName);
    setIsLoading(true);
    try {
      const response = await get(
        API_ENDPOINTS.GROUP_WISE_STOCK.ITEM_DETAIL(
          itemName,
          fromDate,
          toDate,
          companyCode
        )
      );
      
      if (response.success && response.details) {
        setItemDetailsData(response.details);
        setItemTotalInQty(response.totalInQty || 0);
        setItemTotalOutQty(response.totalOutQty || 0);
        setViewLevel('bills');
      } else {
        toast.error('No data found for this item');
        setItemDetailsData([]);
        setItemTotalInQty(0);
        setItemTotalOutQty(0);
      }
    } catch (error) {
      toast.error('Failed to load item details');
      console.error('Error fetching item details:', error);
      setItemDetailsData([]);
      setItemTotalInQty(0);
      setItemTotalOutQty(0);
    } finally {
      setIsLoading(false);
    }
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
  
  const handleCompanyClick = () => {
    setTempSelectedCompany(Array.isArray(company) ? company : (company ? [company] : []));
    setTempSelectedCompanyCode(Array.isArray(companyCode) ? companyCode : (companyCode ? [companyCode] : []));
    setCompanySearchText('');
    setShowCompanyPopup(true);
  };

  const handleCompanySelect = (selectedCompany) => {
    if (selectedCompany === 'ALL') {
      // Toggle ALL selection
      if (tempSelectedCompanyCode.length === allCompanies.length) {
        // Deselect all
        setTempSelectedCompany([]);
        setTempSelectedCompanyCode([]);
      } else {
        // Select all
        setTempSelectedCompany(allCompanies.map(c => c.compName));
        setTempSelectedCompanyCode(allCompanies.map(c => c.compCode));
      }
    } else {
      // Toggle individual company selection
      const isSelected = tempSelectedCompanyCode.includes(selectedCompany.compCode);
      if (isSelected) {
        setTempSelectedCompany(tempSelectedCompany.filter(name => name !== selectedCompany.compName));
        setTempSelectedCompanyCode(tempSelectedCompanyCode.filter(code => code !== selectedCompany.compCode));
      } else {
        setTempSelectedCompany([...tempSelectedCompany, selectedCompany.compName]);
        setTempSelectedCompanyCode([...tempSelectedCompanyCode, selectedCompany.compCode]);
      }
    }
  };

  const handleCompanyPopupOk = () => {
    setCompany(tempSelectedCompany);
    setCompanyCode(tempSelectedCompanyCode);
    if (tempSelectedCompany.length === 0) {
      setCompanyDisplay('Select Company');
    } else if (tempSelectedCompany.length === allCompanies.length) {
      setCompanyDisplay('ALL');
    } else if (tempSelectedCompany.length === 1) {
      setCompanyDisplay(tempSelectedCompany[0]);
    } else {
      setCompanyDisplay(`${tempSelectedCompany.length} Companies Selected`);
    }
    setShowCompanyPopup(false);
    setTimeout(() => {
      searchTextRef.current?.focus();
    }, 100);
  };

  const handleCompanyPopupClose = () => {
    setShowCompanyPopup(false);
  };

  const handleCompanyClearSelection = () => {
    setTempSelectedCompany([]);
    setTempSelectedCompanyCode([]);
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
      companyRef.current?.focus();
    }
  };

  const handleCompanyKeyDown = (e) => {
    // Check if it's a printable character (letter, number, space, etc.)
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      setTempSelectedCompany(company);
      setTempSelectedCompanyCode(companyCode);
      setCompanySearchText(e.key);
      setShowCompanyPopup(true);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!showCompanyPopup) {
        searchTextRef.current?.focus();
      }
    }
  };

  const handleSearchTextKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchButtonRef.current?.focus();
    }
  };

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

              {/* Company */}
              <div style={{...styles.formField, flex: 1, minWidth: '200px'}}>
                <label style={styles.label}>Company:</label>
                <button 
                  ref={companyRef}
                  type="button" 
                  style={focusedField === 'company' ? styles.selectGroupBtnFocused : styles.selectGroupBtn}
                  onClick={() => {
                    handleCompanyClick();
                    setFocusedField('company');
                  }}
                  onKeyDown={handleCompanyKeyDown}
                  onFocus={() => setFocusedField('company')}
                  onBlur={() => setFocusedField('')}
                  tabIndex={0}
                >
                  <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    flex: 1,
                    color: company ? '#333' : '#999'
                  }}>
                    {companyDisplay}
                  </span>
                  <span style={{ color: '#1B91DA', fontSize: '10px', marginLeft: '8px' }}>▼</span>
                </button>
              </div>

              {/* Search */}
              <div style={styles.formField}>
                <label style={styles.label}>Search:</label>
                <input
                  ref={searchTextRef}
                  type="text"
                  style={focusedField === 'search' ? styles.inputFocused : styles.input}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onKeyDown={handleSearchTextKeyDown}
                  onFocus={() => setFocusedField('search')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Search items..."
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
        {/* Back Button and Title */}
        {viewLevel !== 'groups' && (
          <div style={{ padding: '10px 20px 0px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                  <th style={styles.th}>Item Name</th>
                  <th style={styles.th}>Opening Qty</th>
                  <th style={styles.th}>Purchase Qty</th>
                  <th style={styles.th}>Sale Qty</th>
                  <th style={styles.th}>Balance Qty</th>
                  <th style={styles.th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {!hasSearched ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyMsg}>
                      Enter search criteria and click "Search" to view group wise stock
                    </td>
                  </tr>
                ) : isLoading ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyMsg}>
                      Loading...
                    </td>
                  </tr>
                ) : stockData.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyMsg}>
                      No data found
                    </td>
                  </tr>
                ) : (
                  <>
                    {stockData.map((item, idx) => (
                      <tr 
                        key={idx} 
                        style={styles.clickableRow}
                        onClick={() => handleGroupRowClick(item.itemName)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cce7ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#f9f9f9' : '#ffffff'}
                      >
                        <td style={styles.td}>{item.slNo}</td>
                        <td style={{...styles.td, textAlign: 'left', paddingLeft: '15px'}}>{item.itemName}</td>
                        <td style={styles.td}>{item.openingQty || ''}</td>
                        <td style={styles.td}>{item.purchaseQty || ''}</td>
                        <td style={styles.td}>{item.saleQty || ''}</td>
                        <td style={styles.td}>{item.balanceQty || ''}</td>
                        <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>
                          {item.amount ? item.amount.toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    ))}
                    {totalData && (
                      <tr style={styles.totalRow}>
                        <td colSpan="2" style={styles.td}>Total</td>
                        <td style={styles.td}>{totalData.openingQty || ''}</td>
                        <td style={styles.td}>{totalData.purchaseQty || ''}</td>
                        <td style={styles.td}>{totalData.saleQty || ''}</td>
                        <td style={styles.td}>{totalData.balanceQty || ''}</td>
                        <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>
                          {totalData.amount ? totalData.amount.toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    )}
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
                    <th style={styles.th}>Opening Qty</th>
                    <th style={styles.th}>Purchase Qty</th>
                    <th style={styles.th}>Sale Qty</th>
                    <th style={styles.th}>Balance Qty</th>
                    <th style={styles.th}>Sale Amount</th>
                    <th style={styles.th}>Cost Amount</th>
                    <th style={styles.th}>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="9" style={styles.emptyMsg}>Loading...</td>
                    </tr>
                  ) : groupDetailsData.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={styles.emptyMsg}>No data found</td>
                    </tr>
                  ) : (
                    <>
                      {groupDetailsData.map((item, idx) => (
                        <tr 
                          key={idx}
                          style={styles.clickableRow}
                          onClick={() => handleItemRowClick(item.itemName)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cce7ff'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                          <td style={styles.td}>{item.slNo}</td>
                          <td style={{...styles.td, textAlign: 'left', paddingLeft: '15px'}}>{item.itemName}</td>
                          <td style={styles.td}>{item.openingQty || ''}</td>
                          <td style={styles.td}>{item.purchaseQty || ''}</td>
                          <td style={styles.td}>{item.saleQty || ''}</td>
                          <td style={styles.td}>{item.balanceQty || ''}</td>
                          <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>
                            {item.saleAmount ? item.saleAmount.toFixed(2) : '0.00'}
                          </td>
                          <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>
                            {item.costAmount ? item.costAmount.toFixed(2) : '0.00'}
                          </td>
                          <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>
                            {item.profit ? item.profit.toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      ))}
                      {groupDetailsTotal && (
                        <tr style={styles.totalRow}>
                          <td colSpan="2" style={styles.td}>Total</td>
                          <td style={styles.td}>{groupDetailsTotal.openingQty || ''}</td>
                          <td style={styles.td}>{groupDetailsTotal.purchaseQty || ''}</td>
                          <td style={styles.td}>{groupDetailsTotal.saleQty || ''}</td>
                          <td style={styles.td}>{groupDetailsTotal.balanceQty || ''}</td>
                          <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>
                            {groupDetailsTotal.saleAmount ? groupDetailsTotal.saleAmount.toFixed(2) : '0.00'}
                          </td>
                          <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>
                            {groupDetailsTotal.costAmount ? groupDetailsTotal.costAmount.toFixed(2) : '0.00'}
                          </td>
                          <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>
                            {groupDetailsTotal.profit ? groupDetailsTotal.profit.toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
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
                    <th style={styles.th}>Voucher</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>In Qty</th>
                    <th style={styles.th}>In Rate</th>
                    <th style={styles.th}>Out Qty</th>
                    <th style={styles.th}>Out Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyMsg}>Loading...</td>
                    </tr>
                  ) : itemDetailsData.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.emptyMsg}>No data found</td>
                    </tr>
                  ) : (
                    <>
                      {itemDetailsData.map((bill, idx) => (
                        <tr key={idx}>
                          <td style={styles.td}>{bill.slNo}</td>
                          <td style={styles.td}>{bill.voucher}</td>
                          <td style={styles.td}>{new Date(bill.date).toLocaleDateString('en-GB')}</td>
                          <td style={styles.td}>{bill.inQty || ''}</td>
                          <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>
                            {bill.inRate ? bill.inRate.toFixed(2) : ''}
                          </td>
                          <td style={styles.td}>{bill.outQty || ''}</td>
                          <td style={{...styles.td, textAlign: 'right', paddingRight: '15px'}}>
                            {bill.outRate ? bill.outRate.toFixed(2) : ''}
                          </td>
                        </tr>
                      ))}
                      <tr style={styles.totalRow}>
                        <td colSpan="3" style={styles.td}>Total</td>
                        <td style={styles.td}>{itemTotalInQty || ''}</td>
                        <td style={styles.td}></td>
                        <td style={styles.td}>{itemTotalOutQty || ''}</td>
                        <td style={styles.td}></td>
                      </tr>
                    </>
                  )}
              </tbody>
            </table>
            </>
          )}
        </div>
      </div>
        
      {/* Company Selection Popup */}
      {showCompanyPopup && (
        <div style={styles.modalOverlay} onClick={handleCompanyPopupClose}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>Select Companies</div>
            <div style={styles.modalBody}>
              {/* Search Input */}
              <div style={{ marginBottom: '15px' }}>
                <input
                  ref={companySearchInputRef}
                  type="text"
                  placeholder="Search companies..."
                  value={companySearchText}
                  onChange={(e) => setCompanySearchText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              {/* ALL Option */}
              {!companySearchText && (
                <div 
                  style={styles.modalCheckboxRow}
                  onClick={() => handleCompanySelect('ALL')}
                >
                  <input
                    type="checkbox"
                    style={styles.modalCheckbox}
                    checked={tempSelectedCompanyCode.length === allCompanies.length && allCompanies.length > 0}
                    onChange={() => handleCompanySelect('ALL')}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span>ALL</span>
                  </div>
                </div>
              )}
              
              {allCompanies.filter(comp => 
                comp.compName.toLowerCase().includes(companySearchText.toLowerCase()) ||
                comp.compCode.toLowerCase().includes(companySearchText.toLowerCase())
              ).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No companies found</div>
              ) : (
                allCompanies
                  .filter(comp => 
                    comp.compName.toLowerCase().includes(companySearchText.toLowerCase()) ||
                    comp.compCode.toLowerCase().includes(companySearchText.toLowerCase())
                  )
                  .map((companyItem) => {
                    const isSelected = tempSelectedCompanyCode.includes(companyItem.compCode);
                    return (
                      <div 
                        key={companyItem.compCode} 
                        style={styles.modalCheckboxRow}
                        onClick={() => handleCompanySelect(companyItem)}
                      >
                        <input
                          type="checkbox"
                          style={styles.modalCheckbox}
                          checked={isSelected}
                          onChange={() => handleCompanySelect(companyItem)}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <span>{companyItem.compName}</span>
                          <span style={{ fontSize: '12px', color: '#666' }}>Code: {companyItem.compCode}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
            <div style={styles.modalFooter}>
              <button type="button" style={styles.modalBtnClear} onClick={handleCompanyClearSelection}>Clear</button>
              <button type="button" style={styles.modalBtn} onClick={handleCompanyPopupOk}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupwiseStock;
