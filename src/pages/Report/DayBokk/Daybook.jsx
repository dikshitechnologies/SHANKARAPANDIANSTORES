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

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format date as DD/MM/YYYY for API
const formatDateForAPI = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const DayBook = () => {
  // --- STATE MANAGEMENT ---
  const currentDate = formatDate(new Date());
  const [fromDate, setFromDate] = useState(currentDate);
  const [toDate, setToDate] = useState(currentDate);
  const [selectedBranches, setSelectedBranches] = useState(['ALL']); // Initial value is ALL
  const [showBranchPopup, setShowBranchPopup] = useState(false);
  const [tempSelectedBranches, setTempSelectedBranches] = useState([]); // Initially empty
  const [selectAll, setSelectAll] = useState(false); // Initially false
  const [tableLoaded, setTableLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [branchDisplay, setBranchDisplay] = useState('ALL');

  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const branchRef = useRef(null);
  const searchButtonRef = useRef(null);

  // --- DATA ---
  const [dayBookData, setDayBookData] = useState([]);
  const [apiTotals, setApiTotals] = useState({
    totalDebit: 0,
    totalCredit: 0,
    openingDebit: 0,
    openingCredit: 0,
    closingDebit: 0,
    closingCredit: 0
  });

  const [allBranches, setAllBranches] = useState([]);
  const [defaultCompCode, setDefaultCompCode] = useState('001');

  // Fetch branches (companies) on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${API_BASE}${API_ENDPOINTS.LEDGER.COMPANIES}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'success') {
          setAllBranches([{compCode: 'ALL', compName: 'ALL'}, ...data.data.map(c => ({compCode: c.compCode, compName: c.compName}))]);
          setDefaultCompCode(data.data[0]?.compCode || '001');
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        // Fallback to sample data if API fails
        setAllBranches([
          {compCode: 'ALL', compName: 'ALL'},
          {compCode: '001', compName: 'DIKSHI DEMO'},
          {compCode: '002', compName: 'DIKSH'},
          {compCode: '003', compName: 'DIKSHI TECH'},
          {compCode: '004', compName: 'DIKSHIWEBSITE'},
          {compCode: '005', compName: 'DIKSHIWBCOMDOT'},
          {compCode: '006', compName: 'SAKTHI'},
          {compCode: '007', compName: 'JUST AK THINGS'},
          {compCode: '008', compName: 'PRIVANKA'}
        ]);
        setDefaultCompCode('001');
      }
    };
    fetchBranches();
  }, []);

  // Update tempSelectedBranches when popup opens based on current selection
  useEffect(() => {
    if (showBranchPopup) {
      if (selectedBranches.includes('ALL')) {
        // If ALL is selected in main state, show empty selection in popup
        setTempSelectedBranches([]);
        setSelectAll(false);
      } else {
        // If specific branches are selected, show them in popup
        setTempSelectedBranches([...selectedBranches]);
        setSelectAll(false);
      }
    }
  }, [showBranchPopup, selectedBranches]);

  // Focus on fromDate field when component mounts
  useEffect(() => {
    if (fromDateRef.current) {
      fromDateRef.current.focus();
    }
  }, []);

  // --- HANDLERS ---
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handleBranchClick = () => {
    // The useEffect above will handle setting tempSelectedBranches
    setShowBranchPopup(true);
  };

  const handleBranchSelect = (compCode) => {
    if (compCode === 'ALL') {
      // If ALL is being toggled
      if (tempSelectedBranches.includes('ALL')) {
        // Untick ALL - remove ALL and all branches
        const allOtherCodes = allBranches.filter(b => b.compCode !== 'ALL').map(b => b.compCode);
        const updated = tempSelectedBranches.filter(
          b => b !== 'ALL' && !allOtherCodes.includes(b)
        );
        setTempSelectedBranches(updated);
        setSelectAll(false);
      } else {
        // Tick ALL - add ALL and all compCodes
        setTempSelectedBranches(allBranches.map(b => b.compCode));
        setSelectAll(true);
        
      }
    } else {
      // Handling individual branch selection
      let updatedBranches;
      
      if (tempSelectedBranches.includes(compCode)) {
        // Remove branch from selection
        updatedBranches = tempSelectedBranches.filter(b => b !== compCode);
        
        // Also remove ALL if it was selected
        if (updatedBranches.includes('ALL')) {
          updatedBranches = updatedBranches.filter(b => b !== 'ALL');
        }
      } else {
        // Add branch to selection
        updatedBranches = [...tempSelectedBranches, compCode];
        
        // Check if all branches are now selected
        const allOtherCodes = allBranches.filter(b => b.compCode !== 'ALL').map(b => b.compCode);
        const allSelected = allOtherCodes.every(c => updatedBranches.includes(c));
        
        if (allSelected) {
          // If all branches are selected, add ALL as well
          updatedBranches = allBranches.map(b => b.compCode);
          setSelectAll(true);
        } else {
          setSelectAll(false);
        }
      }
      
      setTempSelectedBranches(updatedBranches);
    }
  };

  const handlePopupOk = () => {
    // Extract just the compCodes (excluding ALL for the actual selection)
    const branchList = tempSelectedBranches.filter(code => code !== 'ALL');
    
    // If ALL was selected in temp state, store just ['ALL'] in main state
    if (tempSelectedBranches.includes('ALL')) {
      setSelectedBranches(['ALL']);
      setBranchDisplay('ALL');
    } else if (branchList.length > 0) {
      // If specific branches are selected
      setSelectedBranches(branchList);
      // Update display text
      const displayText = branchList.map(code => allBranches.find(b => b.compCode === code)?.compName).join(', ');
      setBranchDisplay(displayText);
    } else {
      // If nothing is selected, default to ALL
      setSelectedBranches(['ALL']);
      setBranchDisplay('ALL');
    }
    
    setShowBranchPopup(false);
  };

  const handleClearSelection = () => {
    setTempSelectedBranches([]);
    setSelectAll(false);
  };

  const handlePopupClose = () => {
    setShowBranchPopup(false);
  };

  const handleSearch = async () => {
    if (!fromDate || !toDate || selectedBranches.length === 0) {
      toast.warning('Please fill all fields: From Date, To Date, and select at least one branch', {
        autoClose: 2000,
      });
      return;
    }
    
    console.log('Searching DayBook with:', {
      fromDate,
      toDate,
      selectedBranches
    });
    
    setIsLoading(true);
    
    try {
      // Use compCode from selected branches or default to defaultCompCode
      const compCode = selectedBranches.includes('ALL') ? defaultCompCode : selectedBranches[0];
      
      const apiFromDate = formatDateForAPI(fromDate);
      const apiToDate = formatDateForAPI(toDate);
      
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.DAYBOOK.GET_DAY_BOOK(compCode, apiFromDate, apiToDate)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to match component's expected format
      const transformedData = [];
      
      // Add opening balance if exists
      if (data.openingDebit > 0 || data.openingCredit > 0) {
        transformedData.push({
          accName: "Opening Balance",
          receipts: data.openingDebit > 0 ? data.openingDebit.toFixed(2) : "",
          payments: data.openingCredit > 0 ? data.openingCredit.toFixed(2) : "",
        });
      }
      
      // Add entries
      if (data.entries && data.entries.length > 0) {
        data.entries.forEach(entry => {
          transformedData.push({
            accName: entry.accName || entry.description || "",
            receipts: entry.debit > 0 ? entry.debit.toFixed(2) : "",
            payments: entry.credit > 0 ? entry.credit.toFixed(2) : "",
          });
        });
      }
      
      // Add total row
      transformedData.push({
        accName: "Total",
        receipts: data.totalDebit.toFixed(2),
        payments: data.totalCredit.toFixed(2),
        isTotal: true
      });
      
      // Add closing balance if exists and not selecting ALL
      if (!selectedBranches.includes('ALL') && (data.closingDebit > 0 || data.closingCredit > 0)) {
        transformedData.push({
          accName: "Closing Balance",
          receipts: data.closingDebit > 0 ? data.closingDebit.toFixed(2) : "",
          payments: data.closingCredit > 0 ? data.closingCredit.toFixed(2) : "",
        });
      }
      
      // Check if no records found
      const hasOpeningBalance = data.openingDebit > 0 || data.openingCredit > 0;
      const hasEntries = data.entries && data.entries.length > 0;
      const hasClosingBalance = !selectedBranches.includes('ALL') && (data.closingDebit > 0 || data.closingCredit > 0);
      
      if (!hasOpeningBalance && !hasEntries && !hasClosingBalance) {
        toast.info('No records found for the selected date range');
      }
      
      setDayBookData(transformedData);
      setApiTotals({
        totalDebit: data.totalDebit || 0,
        totalCredit: data.totalCredit || 0,
        openingDebit: data.openingDebit || 0,
        openingCredit: data.openingCredit || 0,
        closingDebit: data.closingDebit || 0,
        closingCredit: data.closingCredit || 0
      });
      setTableLoaded(true);
      
    } catch (error) {
      console.error('Error fetching daybook data:', error);
      toast.error('Failed to load daybook data. Please try again.');
      setDayBookData([]);
      setTableLoaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setTableLoaded(false);
    // Reset to current date on refresh
    const today = formatDate(new Date());
    setFromDate(today);
    setToDate(today);
    setSelectedBranches(['ALL']);
    setBranchDisplay('ALL');
    setTempSelectedBranches([]);
    setSelectAll(false);
    setDayBookData([]);
    setApiTotals({
      totalDebit: 0,
      totalCredit: 0,
      openingDebit: 0,
      openingCredit: 0,
      closingDebit: 0,
      closingCredit: 0
    });
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
          branchRef.current?.focus();
          break;
        case 'branch':
          searchButtonRef.current?.focus();
          break;
        default:
          break;
      }
    }
  };

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
    // NARROW DATE INPUT STYLES - ONLY WIDTH REDUCED
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
      // ONLY WIDTH REDUCED - KEEP SAME HEIGHT
      minWidth: screenSize.isMobile ? '90px' : screenSize.isTablet ? '100px' : '110px', // Reduced from 120px
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
      // ONLY WIDTH REDUCED - KEEP SAME HEIGHT
      minWidth: screenSize.isMobile ? '90px' : screenSize.isTablet ? '100px' : '110px', // Reduced from 120px
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
  fontSize: TYPOGRAPHY.fontSize.xs, // Match th font size (xs = 11-13px)
  fontWeight: TYPOGRAPHY.fontWeight.bold, // Match th bold (700)
  lineHeight: TYPOGRAPHY.lineHeight.tight, // Match th line height (1.2)
  padding: screenSize.isMobile ? '5px 3px' : screenSize.isTablet ? '7px 5px' : '10px 6px', // Match th padding
  textAlign: 'center',
  border: '1px solid #ccc',
  color: '#333',
  minWidth: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
  width: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
  maxWidth: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
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
    // REGULAR BRANCH INPUT - MEDIUM/LARGE WIDTH
    branchInput: {
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
      // MEDIUM/LARGE WIDTH FOR BRANCH
      minWidth: screenSize.isMobile ? '140px' : screenSize.isTablet ? '160px' : '180px', // Wider than date inputs
      backgroundColor: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    branchInputFocused: {
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
      // MEDIUM/LARGE WIDTH FOR BRANCH
      minWidth: screenSize.isMobile ? '140px' : screenSize.isTablet ? '160px' : '180px', // Wider than date inputs
      backgroundColor: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
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
    popupOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    },
    popupContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      border: '1px solid #ddd',
    },
   popupHeader: {
  background: '#1B91DA',
  color: 'white',
  padding: '16px 20px',
  margin: 0,
  fontSize: TYPOGRAPHY.fontSize.base,
  fontWeight: TYPOGRAPHY.fontWeight.bold,
  borderBottom: '1px solid #1479c0',
  position: 'relative', // ✅ REQUIRED
},

    closeButton: {
  position: 'absolute',
  right: '15px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(255,255,255,0.2)',
  border: 'none',
  color: 'white',
  fontSize: '20px',
  cursor: 'pointer',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'all 0.3s ease',
},

    branchList: {
      padding: '20px',
      maxHeight: '300px',
      overflowY: 'auto',
    },
    branchItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 12px',
      margin: '6px 0',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '1px solid transparent',
      ':hover': {
        backgroundColor: '#f0f8ff',
        borderColor: '#1B91DA',
      }
    },
    selectedBranchItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 12px',
      margin: '6px 0',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: '#f0f8ff',
      border: '1px solid #1B91DA',
    },
    branchCheckbox: {
      width: '18px',
      height: '18px',
      border: '2px solid #ddd',
      borderRadius: '4px',
      marginRight: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backgroundColor: 'white',
      transition: 'all 0.3s ease'
    },
    selectedBranchCheckbox: {
      width: '18px',
      height: '18px',
      border: '2px solid #1B91DA',
      borderRadius: '4px',
      marginRight: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backgroundColor: '#1B91DA',
    },
    checkmark: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '12px'
    },
    branchText: {
      color: '#333',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium
    },
    popupActions: {
      borderTop: '1px solid #ddd',
      padding: '15px 20px',
      backgroundColor: '#f5f7fa',
    },
    popupButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px'
    },
    popupButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '80px',
    },
    okButton: {
      background: '#1B91DA',
      color: 'white',
      ':hover': {
        background: '#1479c0',
      }
    },
    clearButton: {
      background: 'white',
      color: '#d32f2f',
      border: '1px solid #ffcdd2',
      ':hover': {
        background: '#ffebee',
      }
    },
  };

  // Calculate totals from API response
  const totalReceipts = apiTotals.totalDebit;
  const totalPayments = apiTotals.totalCredit;

  return (
    <div style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div>Loading Day Book Report...</div>
          </div>
        </div>
      )}

      {/* Header Section - Left side: Dates + Branch, Right side: Buttons */}
      <div style={styles.headerSection}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: screenSize.isMobile ? '12px' : screenSize.isTablet ? '16px' : '20px',
          flexWrap: screenSize.isMobile ? 'wrap' : 'nowrap',
          width: '100%',
        }}>
          {/* LEFT SIDE: Dates and Branch */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
            flexWrap: 'wrap',
          }}>
            {/* From Date - NARROW WIDTH */}
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

            {/* To Date - NARROW WIDTH */}
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

            {/* Branch - WIDER WIDTH */}
            <div style={{
              ...styles.formField,
              flex: 1,
              minWidth: screenSize.isMobile ? '100%' : '200px',
            }}>
              <label style={styles.inlineLabel}>Branch:</label>
              <div
                style={
                  focusedField === 'branch'
                    ? styles.branchInputFocused
                    : styles.branchInput
                }
                onClick={() => {
                  handleBranchClick();
                  setFocusedField('branch');
                }}
                ref={branchRef}
                onKeyDown={(e) => {
                  handleKeyDown(e, 'branch');
                  if (e.key === 'Enter') {
                    handleBranchClick();
                  }
                }}
                onFocus={() => setFocusedField('branch')}
                onBlur={() => setFocusedField('')}
                tabIndex={0}
              >
                <span style={{
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  color: '#333',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>
                  {branchDisplay}
                </span>
                <span style={{ 
                  color: '#1B91DA', 
                  fontSize: '10px', 
                  marginLeft: '8px' 
                }}>▼</span>
              </div>
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
                <th style={{ ...styles.th, minWidth: '200px', width: '200px', maxWidth: '200px' }}>Acc Name</th>
                <th style={{ ...styles.th, minWidth: '150px', width: '150px', maxWidth: '150px' }}>Receipts</th>
                <th style={{ ...styles.th, minWidth: '150px', width: '150px', maxWidth: '150px' }}>Payments</th>
              </tr>
            </thead>
          <tbody>
  {tableLoaded ? (
    dayBookData.length > 0 ? (
      dayBookData.map((row, index) => (
        <tr key={index} style={{ 
          backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
          ...(row.isTotal ? { backgroundColor: '#f0f8ff' } : {}) // fontWeight removed
        }}>
          <td style={{ 
            ...styles.td, 
            minWidth: '200px', 
            width: '200px', 
            maxWidth: '200px',
            textAlign: 'left',
            // fontWeight: row.isTotal ? 'bold' : 'normal', // REMOVED
            color: row.isTotal ? '#1565c0' : '#333'
          }}>
            {row.accName}
          </td>
          <td style={{ 
            ...styles.td, 
            minWidth: '150px', 
            width: '150px', 
            maxWidth: '150px',
            textAlign: 'right',
            // fontWeight: row.isTotal ? 'bold' : 'normal', // REMOVED
            color: row.isTotal ? '#1565c0' : '#333'
          }}>
            {row.receipts ? `₹${parseFloat(row.receipts || 0).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}` : ''}
          </td>
          <td style={{ 
            ...styles.td, 
            minWidth: '150px', 
            width: '150px', 
            maxWidth: '150px',
            textAlign: 'right',
            // fontWeight: row.isTotal ? 'bold' : 'normal', // REMOVED
            color: row.isTotal ? '#1565c0' : '#333'
          }}>
            {row.payments ? `₹${parseFloat(row.payments || 0).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}` : ''}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No records found
        </td>
      </tr>
    )
  ) : (
    <tr>
      <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
        {/* Enter search criteria and click "Search" to view day book entries */}
      </td>
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
            <span style={styles.balanceLabel}>Total Receipts</span>
            <span style={styles.balanceValue}>
              ₹{totalReceipts.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Total Payments</span>
            <span style={styles.balanceValue}>
              ₹{totalPayments.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Branch Selection Popup */}
      {showBranchPopup && (
        <div style={styles.popupOverlay} onClick={handlePopupClose}>
          <div 
            style={styles.popupContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.popupHeader}>
              Select Branch
              <button 
                style={styles.closeButton}
                onClick={handlePopupClose}
              >
                ×
              </button>
            </div>
            
            <div style={styles.branchList}>
              {/* ALL option - Initially UNCHECKED */}
              <div 
                style={tempSelectedBranches.includes('ALL') ? styles.selectedBranchItem : styles.branchItem}
                onClick={() => handleBranchSelect('ALL')}
              >
                <div style={tempSelectedBranches.includes('ALL') ? styles.selectedBranchCheckbox : styles.branchCheckbox}>
                  {tempSelectedBranches.includes('ALL') && <div style={styles.checkmark}>✓</div>}
                </div>
                <span style={styles.branchText}>ALL</span>
              </div>
              {/* Individual branches - Initially UNCHECKED */}
              {allBranches.filter(b => b.compCode !== 'ALL').map((branch) => {
                const isSelected = tempSelectedBranches.includes(branch.compCode);
                return (
                  <div 
                    key={branch.compCode} 
                    style={isSelected ? styles.selectedBranchItem : styles.branchItem}
                    onClick={() => handleBranchSelect(branch.compCode)}
                  >
                    <div style={isSelected ? styles.selectedBranchCheckbox : styles.branchCheckbox}>
                      {isSelected && <div style={styles.checkmark}>✓</div>}
                    </div>
                    <span style={styles.branchText}>{branch.compName}</span>
                  </div>
                );
              })}
            </div>
            
            <div style={styles.popupActions}>
              <div style={styles.popupButtons}>
                <button 
                  style={{...styles.popupButton, ...styles.clearButton}}
                  onClick={handleClearSelection}
                >
                  Clear
                </button>
                <button 
                  style={{...styles.popupButton, ...styles.okButton}}
                  onClick={handlePopupOk}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayBook;
      





