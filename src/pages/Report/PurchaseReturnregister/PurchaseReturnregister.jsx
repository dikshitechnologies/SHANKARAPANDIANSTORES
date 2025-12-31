import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const PurchaseReturnRegister = () => {
  // --- STATE MANAGEMENT ---
  const [fromDate, setFromDate] = useState('2024-06-14');
  const [toDate, setToDate] = useState('2025-11-26');
  const [purchaseParty, setPurchaseParty] = useState('ALL');
  const [company, setCompany] = useState('Select Company');
  const [tableLoaded, setTableLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [purchaseReturnData, setPurchaseReturnData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });

  // Popup states for Purchase Party
  const [showPurchasePartyPopup, setShowPurchasePartyPopup] = useState(false);
  const [tempSelectedPurchaseParties, setTempSelectedPurchaseParties] = useState(['ALL']);
  const [purchasePartyDisplay, setPurchasePartyDisplay] = useState('ALL');
  const [purchasePartySelectAll, setPurchasePartySelectAll] = useState(true);

  // Popup states for Company
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [tempSelectedCompanies, setTempSelectedCompanies] = useState(['Select Company']);
  const [companyDisplay, setCompanyDisplay] = useState('Select Company');

  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const purchasePartyRef = useRef(null);
  const companyRef = useRef(null);
  const searchButtonRef = useRef(null);

  // Sample purchase return register data
  const samplePurchaseReturnData = [
    {
      id: 1,
      no: 1,
      partyName: 'JOHN TRADERS',
      returnNo: 'PR0001',
      returnDate: '27-09-2025',
      returnAmount: '15,450.00',
      qty: '25.50',
      time: '01-01-1900 10:30:15',
      reason: 'Damaged Goods'
    },
    {
      id: 2,
      no: 2,
      partyName: 'SMITH ENTERPRISES',
      returnNo: 'PR0002',
      returnDate: '10-12-2025',
      returnAmount: '8,750.00',
      qty: '12.75',
      time: '01-01-1900 14:45:30',
      reason: 'Wrong Size'
    },
    {
      id: 3,
      no: 3,
      partyName: 'GLOBAL SUPPLIERS',
      returnNo: 'PR0003',
      returnDate: '15-12-2025',
      returnAmount: '22,300.00',
      qty: '35.00',
      time: '01-01-1900 11:20:45',
      reason: 'Quality Issue'
    }
  ];

  // Sample data for popups
  const allPurchaseParties = [
    'ALL',
    'JOHN TRADERS',
    'SMITH ENTERPRISES',
    'GLOBAL SUPPLIERS',
    'PREMIUM TEXTILES',
    'QUALITY FABRICS',
    'MEGA SUPPLIERS'
  ];

  const allCompanies = [
    'Select Company',
    'DIKSHI DEMO',
    'DIKSHI TECH',
    'DIKSHIWEBSITE',
    'SAKTHI',
    'JUST AK THINGS',
    'PRIVANKA'
  ];

  // --- HANDLERS ---
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  // Purchase Party Popup Handlers
  const handlePurchasePartyClick = () => {
    setTempSelectedPurchaseParties(purchasePartyDisplay === 'ALL' ? ['ALL'] : [purchasePartyDisplay]);
    setShowPurchasePartyPopup(true);
  };

  const handlePurchasePartySelect = (party) => {
    if (party === 'ALL') {
      if (tempSelectedPurchaseParties.includes('ALL')) {
        setTempSelectedPurchaseParties([]);
        setPurchasePartySelectAll(false);
      } else {
        setTempSelectedPurchaseParties(allPurchaseParties);
        setPurchasePartySelectAll(true);
      }
    } else {
      let updatedParties;
      if (tempSelectedPurchaseParties.includes(party)) {
        updatedParties = tempSelectedPurchaseParties.filter(p => p !== party);
        if (updatedParties.includes('ALL')) {
          updatedParties = updatedParties.filter(p => p !== 'ALL');
        }
      } else {
        updatedParties = [...tempSelectedPurchaseParties, party];
        const otherParties = allPurchaseParties.filter(p => p !== 'ALL');
        if (otherParties.every(p => updatedParties.includes(p))) {
          updatedParties = allPurchaseParties;
        }
      }
      setTempSelectedPurchaseParties(updatedParties);
      setPurchasePartySelectAll(updatedParties.length === allPurchaseParties.length);
    }
  };

  const handlePurchasePartyPopupOk = () => {
    if (tempSelectedPurchaseParties.length === 0) {
      toast.warning('Please select at least one purchase party', { autoClose: 2000 });
      return;
    }
    
    const displayText = tempSelectedPurchaseParties.length === allPurchaseParties.length || tempSelectedPurchaseParties.includes('ALL') 
      ? 'ALL' 
      : tempSelectedPurchaseParties.join(', ');
    setPurchaseParty(displayText === 'ALL' ? 'ALL' : tempSelectedPurchaseParties[0]);
    setPurchasePartyDisplay(displayText);
    setShowPurchasePartyPopup(false);
  };

  const handlePurchasePartyClearSelection = () => {
    setTempSelectedPurchaseParties([]);
    setPurchasePartySelectAll(false);
  };

  const handlePurchasePartyPopupClose = () => {
    setShowPurchasePartyPopup(false);
  };

  // Company Popup Handlers
  const handleCompanyClick = () => {
    setTempSelectedCompanies(company === 'Select Company' ? ['Select Company'] : [company]);
    setShowCompanyPopup(true);
  };

  const handleCompanySelect = (companyItem) => {
    setTempSelectedCompanies([companyItem]);
  };

  const handleCompanyPopupOk = () => {
    if (tempSelectedCompanies.length === 0) {
      toast.warning('Please select a company', { autoClose: 2000 });
      return;
    }
    
    const selectedCompany = tempSelectedCompanies[0];
    setCompany(selectedCompany);
    setCompanyDisplay(selectedCompany);
    setShowCompanyPopup(false);
  };

  const handleCompanyClearSelection = () => {
    setTempSelectedCompanies([]);
  };

  const handleCompanyPopupClose = () => {
    setShowCompanyPopup(false);
  };

  const handleSearch = () => {
    if (!fromDate || !toDate || purchasePartyDisplay === 'ALL' || companyDisplay === 'Select Company') {
      toast.warning('Please fill all fields: From Date, To Date, Purchase Party, and Company', {
        autoClose: 2000,
      });
      return;
    }
    
    console.log('Searching Purchase Return Register with:', {
      fromDate,
      toDate,
      purchaseParty: purchasePartyDisplay,
      company: companyDisplay
    });
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPurchaseReturnData(samplePurchaseReturnData);
      setTableLoaded(true);
      setIsLoading(false);
    }, 500);
  };

  const handleRefresh = () => {
    setTableLoaded(false);
    setFromDate('2024-06-14');
    setToDate('2025-11-26');
    setPurchaseParty('ALL');
    setPurchasePartyDisplay('ALL');
    setCompany('Select Company');
    setCompanyDisplay('Select Company');
    setTempSelectedPurchaseParties(['ALL']);
    setTempSelectedCompanies(['Select Company']);
    setPurchasePartySelectAll(true);
    setPurchaseReturnData([]);
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
          purchasePartyRef.current?.focus();
          break;
        case 'purchaseParty':
          companyRef.current?.focus();
          break;
        case 'company':
          searchButtonRef.current?.focus();
          break;
        default:
          break;
      }
    }
  };

  // Start editing a cell
  const startEditing = (rowIndex, colName, value) => {
    setEditingCell({ row: rowIndex, col: colName });
    setEditValue(value);
  };

  // Save the edited value
  const saveEdit = () => {
    if (editingCell) {
      const { row, col } = editingCell;
      const newData = [...purchaseReturnData];
      newData[row] = {
        ...newData[row],
        [col]: editValue
      };
      setPurchaseReturnData(newData);
      setEditingCell(null);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCell(null);
  };

  // Handle keyboard navigation in table
  useEffect(() => {
    const handleTableKeyDown = (e) => {
      const { row, col } = selectedCell;
      const colNames = ['no', 'partyName', 'returnNo', 'returnDate', 'returnAmount', 'qty', 'time', 'reason'];
      
      if (editingCell) {
        if (e.key === 'Enter') {
          saveEdit();
          e.preventDefault();
        } else if (e.key === 'Escape') {
          cancelEdit();
          e.preventDefault();
        }
        return;
      }

      if (purchaseReturnData.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (row < purchaseReturnData.length - 1) {
            setSelectedCell({ row: row + 1, col });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (row > 0) {
            setSelectedCell({ row: row - 1, col });
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (col > 0) {
            setSelectedCell({ row, col: col - 1 });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (col < colNames.length - 1) {
            setSelectedCell({ row, col: col + 1 });
          }
          break;
        case 'Enter':
        case 'F2':
          e.preventDefault();
          startEditing(row, colNames[col], purchaseReturnData[row][colNames[col]]);
          break;
        case 'Delete':
          e.preventDefault();
          if (window.confirm('Clear this cell?')) {
            const newData = [...purchaseReturnData];
            newData[row] = {
              ...newData[row],
              [colNames[col]]: ''
            };
            setPurchaseReturnData(newData);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleTableKeyDown);
    return () => window.removeEventListener('keydown', handleTableKeyDown);
  }, [selectedCell, editingCell, purchaseReturnData]);

  // Add new row
  const addNewRow = () => {
    if (!tableLoaded) return;
    
    const newRow = {
      id: purchaseReturnData.length + 1,
      no: purchaseReturnData.length + 1,
      partyName: '',
      returnNo: `PR${String(purchaseReturnData.length + 1).padStart(4, '0')}`,
      returnDate: new Date().toLocaleDateString('en-GB').split('/').join('-'),
      returnAmount: '0.00',
      qty: '0.00',
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      reason: ''
    };
    setPurchaseReturnData([...purchaseReturnData, newRow]);
    setSelectedCell({ row: purchaseReturnData.length, col: 0 });
  };

  // Delete selected row
  const deleteSelectedRow = () => {
    if (!tableLoaded || purchaseReturnData.length === 0) return;
    
    if (selectedCell.row >= 0 && selectedCell.row < purchaseReturnData.length) {
      const newData = purchaseReturnData.filter((_, index) => index !== selectedCell.row);
      // Update row numbers
      const updatedData = newData.map((row, index) => ({
        ...row,
        no: index + 1
      }));
      setPurchaseReturnData(updatedData);
      setSelectedCell({ row: Math.min(selectedCell.row, updatedData.length - 1), col: selectedCell.col });
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

  // Calculate totals
  const totals = {
    returnAmount: purchaseReturnData.reduce((sum, row) => {
      const amount = parseFloat(row.returnAmount?.replace(/,/g, '')) || 0;
      return sum + amount;
    }, 0),
    qty: purchaseReturnData.reduce((sum, row) => {
      const qty = parseFloat(row.qty) || 0;
      return sum + qty;
    }, 0)
  };

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
    formField: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '2px' : screenSize.isTablet ? '8px' : '10px',
    },
    inlineLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#333',
      minWidth: screenSize.isMobile ? '70px' : screenSize.isTablet ? '80px' : '85px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
    inlineInput: {
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
    inlineInputFocused: {
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
      padding: '8px 6px',
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
    searchButton: {
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
      position: 'relative',
      overflow: 'hidden',
      minWidth: screenSize.isMobile ? '80px' : '100px',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
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
      position: 'relative',
      overflow: 'hidden',
      minWidth: screenSize.isMobile ? '80px' : '100px',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
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
    addButton: {
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
      position: 'relative',
      overflow: 'hidden',
      minWidth: screenSize.isMobile ? '80px' : '100px',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        borderColor: '#28a745',
        boxShadow: '0 4px 10px rgba(40, 167, 69, 0.2)',
        transform: 'translateY(-1px)',
      },
      ':active': {
        transform: 'translateY(-1px)',
      }
    },
    deleteButton: {
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
      position: 'relative',
      overflow: 'hidden',
      minWidth: screenSize.isMobile ? '80px' : '100px',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        borderColor: '#dc3545',
        boxShadow: '0 4px 10px rgba(220, 53, 69, 0.2)',
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
    purchasePartyInput: {
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
      backgroundColor: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    purchasePartyInputFocused: {
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
      backgroundColor: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
    },
    companyInput: {
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
      backgroundColor: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    companyInputFocused: {
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
      backgroundColor: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
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
      position: 'relative',
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
      ':hover': {
        background: 'rgba(255,255,255,0.3)',
      }
    },
    listContainer: {
      padding: '20px',
      maxHeight: '300px',
      overflowY: 'auto',
    },
    listItem: {
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
    selectedListItem: {
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
    listCheckbox: {
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
    selectedListCheckbox: {
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
    listText: {
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

  // Get cell style based on state
  const getCellStyle = (rowIndex, colName) => {
    const colNames = ['no', 'partyName', 'returnNo', 'returnDate', 'returnAmount', 'qty', 'time', 'reason'];
    const isSelected = selectedCell.row === rowIndex && colNames.indexOf(colName) === selectedCell.col;
    const isEditing = editingCell && editingCell.row === rowIndex && editingCell.col === colName;

    const baseStyle = {
      ...styles.td,
      textAlign: ['returnAmount', 'qty', 'no'].includes(colName) ? 'right' : 'left',
      minWidth: colName === 'partyName' ? '150px' : 
               colName === 'reason' ? '180px' :
               colName === 'returnNo' ? '100px' :
               colName === 'returnDate' ? '100px' :
               colName === 'returnAmount' ? '120px' :
               colName === 'time' ? '140px' : '80px',
      width: colName === 'partyName' ? '150px' : 
             colName === 'reason' ? '180px' :
             colName === 'returnNo' ? '100px' :
             colName === 'returnDate' ? '100px' :
             colName === 'returnAmount' ? '120px' :
             colName === 'time' ? '140px' : '80px',
      maxWidth: colName === 'partyName' ? '150px' : 
                colName === 'reason' ? '180px' :
                colName === 'returnNo' ? '100px' :
                colName === 'returnDate' ? '100px' :
                colName === 'returnAmount' ? '120px' :
                colName === 'time' ? '140px' : '80px',
      fontFamily: ['returnAmount', 'qty'].includes(colName) ? '"Courier New", monospace' : 'inherit',
      fontWeight: ['returnAmount', 'qty'].includes(colName) ? '600' : '400',
      cursor: 'cell'
    };

    if (isSelected && !isEditing) {
      return { 
        ...baseStyle, 
        outline: '2px solid #1B91DA',
        outlineOffset: '-1px',
        boxShadow: '0 0 0 1px rgba(27, 145, 218, 0.3)'
      };
    }

    if (isEditing) {
      return { 
        ...baseStyle, 
        outline: '2px solid #1B91DA',
        outlineOffset: '-1px',
        boxShadow: '0 0 0 1px rgba(27, 145, 218, 0.3)',
        padding: '0'
      };
    }

    return baseStyle;
  };

  // Render cell content
  const renderCell = (rowIndex, colName, value) => {
    if (editingCell && editingCell.row === rowIndex && editingCell.col === colName) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          autoFocus
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            padding: '8px 6px',
            boxSizing: 'border-box',
            fontFamily: ['returnAmount', 'qty'].includes(colName) ? '"Courier New", monospace' : 'inherit',
            fontSize: TYPOGRAPHY.fontSize.sm,
            backgroundColor: '#fff',
            outline: 'none'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveEdit();
            } else if (e.key === 'Escape') {
              cancelEdit();
            }
          }}
        />
      );
    }

    return value;
  };

  return (
    <div style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div>Loading Purchase Return Register Report...</div>
          </div>
        </div>
      )}

      {/* Header Section - ALL ON ONE LINE */}
      <div style={styles.headerSection}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '12px' : '16px',
          flexWrap: screenSize.isMobile ? 'wrap' : 'nowrap',
          width: '100%',
        }}>
          {/* From Date */}
          <div style={{
            ...styles.formField,
            flex: screenSize.isMobile ? '1 0 100%' : '1',
            minWidth: screenSize.isMobile ? '100%' : '120px',
          }}>
            <label style={styles.inlineLabel}>From Date:</label>
            <input
              type="date"
              data-header="fromDate"
              style={
                focusedField === 'fromDate'
                  ? { ...styles.inlineInputFocused, padding: screenSize.isMobile ? '6px 8px' : '8px 10px' }
                  : { ...styles.inlineInput, padding: screenSize.isMobile ? '6px 8px' : '8px 10px' }
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
            flex: screenSize.isMobile ? '1 0 100%' : '1',
            minWidth: screenSize.isMobile ? '100%' : '120px',
          }}>
            <label style={styles.inlineLabel}>To Date:</label>
            <input
              type="date"
              data-header="toDate"
              style={
                focusedField === 'toDate'
                  ? { ...styles.inlineInputFocused, padding: screenSize.isMobile ? '6px 8px' : '8px 10px' }
                  : { ...styles.inlineInput, padding: screenSize.isMobile ? '6px 8px' : '8px 10px' }
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

          {/* Purchase Party with Popup */}
          <div style={{
            ...styles.formField,
            flex: screenSize.isMobile ? '1 0 100%' : '1',
            minWidth: screenSize.isMobile ? '100%' : '120px',
          }}>
            <label style={styles.inlineLabel}>Purchase Party:</label>
            <div
              style={
                focusedField === 'purchaseParty'
                  ? styles.purchasePartyInputFocused
                  : styles.purchasePartyInput
              }
              onClick={() => {
                handlePurchasePartyClick();
                setFocusedField('purchaseParty');
              }}
              ref={purchasePartyRef}
              onKeyDown={(e) => {
                handleKeyDown(e, 'purchaseParty');
                if (e.key === 'Enter') {
                  handlePurchasePartyClick();
                }
              }}
              onFocus={() => setFocusedField('purchaseParty')}
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
                {purchasePartyDisplay}
              </span>
              <span style={{ color: '#1B91DA', fontSize: '10px', marginLeft: '8px' }}>▼</span>
            </div>
          </div>

          {/* Company with Popup */}
          <div style={{
            ...styles.formField,
            flex: screenSize.isMobile ? '1 0 100%' : '1',
            minWidth: screenSize.isMobile ? '100%' : '120px',
          }}>
            <label style={styles.inlineLabel}>Company:</label>
            <div
              style={
                focusedField === 'company'
                  ? styles.companyInputFocused
                  : styles.companyInput
              }
              onClick={() => {
                handleCompanyClick();
                setFocusedField('company');
              }}
              ref={companyRef}
              onKeyDown={(e) => {
                handleKeyDown(e, 'company');
                if (e.key === 'Enter') {
                  handleCompanyClick();
                }
              }}
              onFocus={() => setFocusedField('company')}
              onBlur={() => setFocusedField('')}
              tabIndex={0}
            >
              <span style={{
                fontSize: TYPOGRAPHY.fontSize.sm,
                color: company === 'Select Company' ? '#999' : '#333',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }}>
                {companyDisplay}
              </span>
              <span style={{ color: '#1B91DA', fontSize: '10px', marginLeft: '8px' }}>▼</span>
            </div>
          </div>

          {/* Search Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <button
              style={{
                ...styles.searchButton,
                width: screenSize.isMobile ? '100%' : 'auto',
                marginBottom: screenSize.isMobile ? '8px' : '0',
              }}
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
          </div>

          {/* Refresh Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <button
              style={{
                ...styles.refreshButton,
                width: screenSize.isMobile ? '100%' : 'auto',
              }}
              onClick={handleRefresh}
            >
              Refresh
            </button>
          </div>

          {/* Add Row Button (only when table is loaded) */}
          {tableLoaded && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <button
                style={{
                  ...styles.addButton,
                  width: screenSize.isMobile ? '100%' : 'auto',
                }}
                onClick={addNewRow}
                title="Add New Return (Ctrl+N)"
              >
                Add Return
              </button>
            </div>
          )}

          {/* Delete Row Button (only when table is loaded) */}
          {tableLoaded && purchaseReturnData.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <button
                style={{
                  ...styles.deleteButton,
                  width: screenSize.isMobile ? '100%' : 'auto',
                }}
                onClick={deleteSelectedRow}
                title="Delete Selected Return (Ctrl+D)"
              >
                Delete Return
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div style={styles.tableSection}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, minWidth: '80px', width: '80px', maxWidth: '80px', textAlign: 'right' }}>No</th>
                <th style={{ ...styles.th, minWidth: '150px', width: '150px', maxWidth: '150px', textAlign: 'left' }}>Party Name</th>
                <th style={{ ...styles.th, minWidth: '100px', width: '100px', maxWidth: '100px', textAlign: 'left' }}>Return No</th>
                <th style={{ ...styles.th, minWidth: '100px', width: '100px', maxWidth: '100px', textAlign: 'left' }}>Return Date</th>
                <th style={{ ...styles.th, minWidth: '120px', width: '120px', maxWidth: '120px', textAlign: 'right' }}>Return Amount</th>
                <th style={{ ...styles.th, minWidth: '80px', width: '80px', maxWidth: '80px', textAlign: 'right' }}>Qty</th>
                <th style={{ ...styles.th, minWidth: '140px', width: '140px', maxWidth: '140px', textAlign: 'left' }}>Time</th>
                <th style={{ ...styles.th, minWidth: '180px', width: '180px', maxWidth: '180px', textAlign: 'left' }}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {tableLoaded ? (
                purchaseReturnData.length > 0 ? (
                  purchaseReturnData.map((row, rowIndex) => (
                    <tr 
                      key={row.id} 
                      style={{ 
                        backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const colNames = ['no', 'partyName', 'returnNo', 'returnDate', 'returnAmount', 'qty', 'time', 'reason'];
                        const colIndex = colNames.indexOf('no');
                        setSelectedCell({ row: rowIndex, col: colIndex });
                      }}
                    >
                      <td style={getCellStyle(rowIndex, 'no')} onDoubleClick={() => startEditing(rowIndex, 'no', row.no)}>
                        {renderCell(rowIndex, 'no', row.no)}
                      </td>
                      <td style={getCellStyle(rowIndex, 'partyName')} onDoubleClick={() => startEditing(rowIndex, 'partyName', row.partyName)}>
                        {renderCell(rowIndex, 'partyName', row.partyName)}
                      </td>
                      <td style={getCellStyle(rowIndex, 'returnNo')} onDoubleClick={() => startEditing(rowIndex, 'returnNo', row.returnNo)}>
                        {renderCell(rowIndex, 'returnNo', row.returnNo)}
                      </td>
                      <td style={getCellStyle(rowIndex, 'returnDate')} onDoubleClick={() => startEditing(rowIndex, 'returnDate', row.returnDate)}>
                        {renderCell(rowIndex, 'returnDate', row.returnDate)}
                      </td>
                      <td style={getCellStyle(rowIndex, 'returnAmount')} onDoubleClick={() => startEditing(rowIndex, 'returnAmount', row.returnAmount)}>
                        {renderCell(rowIndex, 'returnAmount', row.returnAmount)}
                      </td>
                      <td style={getCellStyle(rowIndex, 'qty')} onDoubleClick={() => startEditing(rowIndex, 'qty', row.qty)}>
                        {renderCell(rowIndex, 'qty', row.qty)}
                      </td>
                      <td style={getCellStyle(rowIndex, 'time')} onDoubleClick={() => startEditing(rowIndex, 'time', row.time)}>
                        {renderCell(rowIndex, 'time', row.time)}
                      </td>
                      <td style={getCellStyle(rowIndex, 'reason')} onDoubleClick={() => startEditing(rowIndex, 'reason', row.reason)}>
                        {renderCell(rowIndex, 'reason', row.reason)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No purchase return records found
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Enter search criteria and click "Search" to view purchase return register entries
                  </td>
                </tr>
              )}
            </tbody>
            {tableLoaded && purchaseReturnData.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#f0f8ff', borderTop: '2px solid #1B91DA' }}>
                  <td colSpan="4" style={{ ...styles.td, textAlign: 'left', fontWeight: 'bold' }}>
                    Total Purchase Returns
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontFamily: '"Courier New", monospace', fontWeight: 'bold', color: '#1565c0' }}>
                    ₹{formatNumber(totals.returnAmount)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontFamily: '"Courier New", monospace', fontWeight: 'bold', color: '#1565c0' }}>
                    {totals.qty.toFixed(2)}
                  </td>
                  <td colSpan="2" style={{ ...styles.td, textAlign: 'center', fontStyle: 'italic' }}>
                    -
                  </td>
                </tr>
              </tfoot>
            )}
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
            <span style={styles.balanceLabel}>Total Return Amount</span>
            <span style={styles.balanceValue}>
              ₹{formatNumber(totals.returnAmount)}
            </span>
          </div>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Total Quantity</span>
            <span style={styles.balanceValue}>
              {totals.qty.toFixed(2)}
            </span>
          </div>
          {tableLoaded && purchaseReturnData.length > 0 && (
            <>
              <div style={styles.balanceItem}>
                <span style={styles.balanceLabel}>Total Returns</span>
                <span style={styles.balanceValue}>
                  {purchaseReturnData.length}
                </span>
              </div>
              <div style={styles.balanceItem}>
                <span style={styles.balanceLabel}>Average Return</span>
                <span style={styles.balanceValue}>
                  ₹{formatNumber(totals.returnAmount / purchaseReturnData.length)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Purchase Party Selection Popup */}
      {showPurchasePartyPopup && (
        <div style={styles.popupOverlay} onClick={handlePurchasePartyPopupClose}>
          <div 
            style={styles.popupContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.popupHeader}>
              Select Purchase Party
              <button 
                style={styles.closeButton}
                onClick={handlePurchasePartyPopupClose}
              >
                ×
              </button>
            </div>
            
            <div style={styles.listContainer}>
              {allPurchaseParties.map((party) => {
                const isSelected = tempSelectedPurchaseParties.includes(party);
                return (
                  <div 
                    key={party} 
                    style={isSelected ? styles.selectedListItem : styles.listItem}
                    onClick={() => handlePurchasePartySelect(party)}
                  >
                    <div style={isSelected ? styles.selectedListCheckbox : styles.listCheckbox}>
                      {isSelected && <div style={styles.checkmark}>✓</div>}
                    </div>
                    <span style={styles.listText}>{party}</span>
                  </div>
                );
              })}
            </div>
            
            <div style={styles.popupActions}>
              <div style={styles.popupButtons}>
                <button 
                  style={{...styles.popupButton, ...styles.clearButton}}
                  onClick={handlePurchasePartyClearSelection}
                >
                  Clear
                </button>
                <button 
                  style={{...styles.popupButton, ...styles.okButton}}
                  onClick={handlePurchasePartyPopupOk}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Selection Popup */}
      {showCompanyPopup && (
        <div style={styles.popupOverlay} onClick={handleCompanyPopupClose}>
          <div 
            style={styles.popupContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.popupHeader}>
              Select Company
              <button 
                style={styles.closeButton}
                onClick={handleCompanyPopupClose}
              >
                ×
              </button>
            </div>
            
            <div style={styles.listContainer}>
              {allCompanies.map((companyItem) => {
                const isSelected = tempSelectedCompanies.includes(companyItem);
                return (
                  <div 
                    key={companyItem} 
                    style={isSelected ? styles.selectedListItem : styles.listItem}
                    onClick={() => handleCompanySelect(companyItem)}
                  >
                    <div style={isSelected ? styles.selectedListCheckbox : styles.listCheckbox}>
                      {isSelected && <div style={styles.checkmark}>✓</div>}
                    </div>
                    <span style={styles.listText}>{companyItem}</span>
                  </div>
                );
              })}
            </div>
            
            <div style={styles.popupActions}>
              <div style={styles.popupButtons}>
                <button 
                  style={{...styles.popupButton, ...styles.clearButton}}
                  onClick={handleCompanyClearSelection}
                >
                  Clear
                </button>
                <button 
                  style={{...styles.popupButton, ...styles.okButton}}
                  onClick={handleCompanyPopupOk}
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

export default PurchaseReturnRegister;