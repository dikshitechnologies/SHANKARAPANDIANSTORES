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

const SalesReturnRegister = () => {
  // --- STATE MANAGEMENT ---
  const [fromDate, setFromDate] = useState('2024-06-14');
  const [toDate, setToDate] = useState('2025-11-26');
  const [customer, setCustomer] = useState('ALL');
  const [company, setCompany] = useState('Select Company');
  const [tableLoaded, setTableLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [salesReturnData, setSalesReturnData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });

  // Popup states for Customer
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [tempSelectedCustomers, setTempSelectedCustomers] = useState(['ALL']);
  const [customerDisplay, setCustomerDisplay] = useState('ALL');
  const [customerSelectAll, setCustomerSelectAll] = useState(true);

  // Popup states for Company
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [tempSelectedCompanies, setTempSelectedCompanies] = useState(['Select Company']);
  const [companyDisplay, setCompanyDisplay] = useState('Select Company');

  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const customerRef = useRef(null);
  const companyRef = useRef(null);
  const searchButtonRef = useRef(null);

  // Sample sales return register data
  const sampleSalesReturnData = [
    {
      id: 1,
      no: 1,
      customerName: 'AMIT FASHION',
      returnNo: 'SR0001',
      returnDate: '27-09-2025',
      returnAmount: '8,450.00',
      qty: '12.50',
      time: '01-01-1900 11:15:30',
      reason: 'Size Issue',
      originalBillNo: 'C00001AA',
      originalBillDate: '25-09-2025'
    },
    {
      id: 2,
      no: 2,
      customerName: 'CASH A/C',
      returnNo: 'SR0002',
      returnDate: '10-12-2025',
      returnAmount: '2,250.00',
      qty: '5.75',
      time: '01-01-1900 15:30:45',
      reason: 'Color Mismatch',
      originalBillNo: 'C00002AA',
      originalBillDate: '08-12-2025'
    },
    {
      id: 3,
      no: 3,
      customerName: 'JOHN TRADERS',
      returnNo: 'SR0003',
      returnDate: '15-12-2025',
      returnAmount: '15,800.00',
      qty: '22.00',
      time: '01-01-1900 10:45:20',
      reason: 'Quality Issue',
      originalBillNo: 'C00003AA',
      originalBillDate: '12-12-2025'
    },
    {
      id: 4,
      no: 4,
      customerName: 'GLOBAL FASHION',
      returnNo: 'SR0004',
      returnDate: '18-12-2025',
      returnAmount: '6,500.00',
      qty: '8.25',
      time: '01-01-1900 14:20:10',
      reason: 'Damaged Goods',
      originalBillNo: 'C00004AA',
      originalBillDate: '16-12-2025'
    }
  ];

  // Sample data for popups
  const allCustomers = [
    'ALL',
    'AMIT FASHION',
    'CASH A/C',
    'JOHN TRADERS',
    'GLOBAL FASHION',
    'PREMIUM TEXTILES',
    'QUALITY FABRICS',
    'SMITH ENTERPRISES'
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

  // Customer Popup Handlers
  const handleCustomerClick = () => {
    setTempSelectedCustomers(customerDisplay === 'ALL' ? ['ALL'] : [customerDisplay]);
    setShowCustomerPopup(true);
  };

  const handleCustomerSelect = (customerItem) => {
    if (customerItem === 'ALL') {
      if (tempSelectedCustomers.includes('ALL')) {
        setTempSelectedCustomers([]);
        setCustomerSelectAll(false);
      } else {
        setTempSelectedCustomers(allCustomers);
        setCustomerSelectAll(true);
      }
    } else {
      let updatedCustomers;
      if (tempSelectedCustomers.includes(customerItem)) {
        updatedCustomers = tempSelectedCustomers.filter(c => c !== customerItem);
        if (updatedCustomers.includes('ALL')) {
          updatedCustomers = updatedCustomers.filter(c => c !== 'ALL');
        }
      } else {
        updatedCustomers = [...tempSelectedCustomers, customerItem];
        const otherCustomers = allCustomers.filter(c => c !== 'ALL');
        if (otherCustomers.every(c => updatedCustomers.includes(c))) {
          updatedCustomers = allCustomers;
        }
      }
      setTempSelectedCustomers(updatedCustomers);
      setCustomerSelectAll(updatedCustomers.length === allCustomers.length);
    }
  };

  const handleCustomerPopupOk = () => {
    if (tempSelectedCustomers.length === 0) {
      toast.warning('Please select at least one customer', { autoClose: 2000 });
      return;
    }
    
    const displayText = tempSelectedCustomers.length === allCustomers.length || tempSelectedCustomers.includes('ALL') 
      ? 'ALL' 
      : tempSelectedCustomers.join(', ');
    setCustomer(displayText === 'ALL' ? 'ALL' : tempSelectedCustomers[0]);
    setCustomerDisplay(displayText);
    setShowCustomerPopup(false);
  };

  const handleCustomerClearSelection = () => {
    setTempSelectedCustomers([]);
    setCustomerSelectAll(false);
  };

  const handleCustomerPopupClose = () => {
    setShowCustomerPopup(false);
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
    if (!fromDate || !toDate || customerDisplay === 'ALL' || companyDisplay === 'Select Company') {
      toast.warning('Please fill all fields: From Date, To Date, Customer, and Company', {
        autoClose: 2000,
      });
      return;
    }
    
    console.log('Searching Sales Return Register with:', {
      fromDate,
      toDate,
      customer: customerDisplay,
      company: companyDisplay
    });
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSalesReturnData(sampleSalesReturnData);
      setTableLoaded(true);
      setIsLoading(false);
    }, 500);
  };

  const handleRefresh = () => {
    setTableLoaded(false);
    setFromDate('2024-06-14');
    setToDate('2025-11-26');
    setCustomer('ALL');
    setCustomerDisplay('ALL');
    setCompany('Select Company');
    setCompanyDisplay('Select Company');
    setTempSelectedCustomers(['ALL']);
    setTempSelectedCompanies(['Select Company']);
    setCustomerSelectAll(true);
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
          customerRef.current?.focus();
          break;
        case 'customer':
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
      const newData = [...salesReturnData];
      newData[row] = {
        ...newData[row],
        [col]: editValue
      };
      setSalesReturnData(newData);
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
      const colNames = ['no', 'customerName', 'returnNo', 'returnDate', 'returnAmount', 'qty', 'time', 'reason', 'originalBillNo', 'originalBillDate'];
      
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

      if (salesReturnData.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (row < salesReturnData.length - 1) {
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
          startEditing(row, colNames[col], salesReturnData[row][colNames[col]]);
          break;
        case 'Delete':
          e.preventDefault();
          if (window.confirm('Clear this cell?')) {
            const newData = [...salesReturnData];
            newData[row] = {
              ...newData[row],
              [colNames[col]]: ''
            };
            setSalesReturnData(newData);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleTableKeyDown);
    return () => window.removeEventListener('keydown', handleTableKeyDown);
  }, [selectedCell, editingCell, salesReturnData]);

  // Add new row
  const addNewRow = () => {
    if (!tableLoaded) return;
    
    const newRow = {
      id: salesReturnData.length + 1,
      no: salesReturnData.length + 1,
      customerName: '',
      returnNo: `SR${String(salesReturnData.length + 1).padStart(4, '0')}`,
      returnDate: new Date().toLocaleDateString('en-GB').split('/').join('-'),
      returnAmount: '0.00',
      qty: '0.00',
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      reason: '',
      originalBillNo: '',
      originalBillDate: ''
    };
    setSalesReturnData([...salesReturnData, newRow]);
    setSelectedCell({ row: salesReturnData.length, col: 0 });
  };

  // Delete selected row
  const deleteSelectedRow = () => {
    if (!tableLoaded || salesReturnData.length === 0) return;
    
    if (selectedCell.row >= 0 && selectedCell.row < salesReturnData.length) {
      const newData = salesReturnData.filter((_, index) => index !== selectedCell.row);
      // Update row numbers
      const updatedData = newData.map((row, index) => ({
        ...row,
        no: index + 1
      }));
      setSalesReturnData(updatedData);
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
    returnAmount: salesReturnData.reduce((sum, row) => {
      const amount = parseFloat(row.returnAmount?.replace(/,/g, '')) || 0;
      return sum + amount;
    }, 0),
    qty: salesReturnData.reduce((sum, row) => {
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
    customerInput: {
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
    customerInputFocused: {
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
    const colNames = ['no', 'customerName', 'returnNo', 'returnDate', 'returnAmount', 'qty', 'time', 'reason', 'originalBillNo', 'originalBillDate'];
    const isSelected = selectedCell.row === rowIndex && colNames.indexOf(colName) === selectedCell.col;
    const isEditing = editingCell && editingCell.row === rowIndex && editingCell.col === colName;

    const baseStyle = {
      ...styles.td,
      textAlign: ['returnAmount', 'qty', 'no'].includes(colName) ? 'right' : 'left',
      minWidth: colName === 'customerName' ? '140px' : 
               colName === 'reason' ? '160px' :
               colName === 'returnNo' ? '100px' :
               colName === 'returnDate' ? '100px' :
               colName === 'returnAmount' ? '110px' :
               colName === 'time' ? '130px' :
               colName === 'originalBillNo' ? '100px' :
               colName === 'originalBillDate' ? '100px' : '70px',
      width: colName === 'customerName' ? '140px' : 
             colName === 'reason' ? '160px' :
             colName === 'returnNo' ? '100px' :
             colName === 'returnDate' ? '100px' :
             colName === 'returnAmount' ? '110px' :
             colName === 'time' ? '130px' :
             colName === 'originalBillNo' ? '100px' :
             colName === 'originalBillDate' ? '100px' : '70px',
      maxWidth: colName === 'customerName' ? '140px' : 
                colName === 'reason' ? '160px' :
                colName === 'returnNo' ? '100px' :
                colName === 'returnDate' ? '100px' :
                colName === 'returnAmount' ? '110px' :
                colName === 'time' ? '130px' :
                colName === 'originalBillNo' ? '100px' :
                colName === 'originalBillDate' ? '100px' : '70px',
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
            <div>Loading Sales Return Register Report...</div>
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

          {/* Customer with Popup */}
          <div style={{
            ...styles.formField,
            flex: screenSize.isMobile ? '1 0 100%' : '1',
            minWidth: screenSize.isMobile ? '100%' : '120px',
          }}>
            <label style={styles.inlineLabel}>Customer:</label>
            <div
              style={
                focusedField === 'customer'
                  ? styles.customerInputFocused
                  : styles.customerInput
              }
              onClick={() => {
                handleCustomerClick();
                setFocusedField('customer');
              }}
              ref={customerRef}
              onKeyDown={(e) => {
                handleKeyDown(e, 'customer');
                if (e.key === 'Enter') {
                  handleCustomerClick();
                }
              }}
              onFocus={() => setFocusedField('customer')}
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
                {customerDisplay}
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
                title="Add New Sales Return (Ctrl+N)"
              >
                Add Return
              </button>
            </div>
          )}

          {/* Delete Row Button (only when table is loaded) */}
          {tableLoaded && salesReturnData.length > 0 && (
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
                title="Delete Selected Sales Return (Ctrl+D)"
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
                <th style={{ ...styles.th, minWidth: '70px', width: '70px', maxWidth: '70px', textAlign: 'right' }}>No</th>
                <th style={{ ...styles.th, minWidth: '140px', width: '140px', maxWidth: '140px', textAlign: 'left' }}>Customer Name</th>
                <th style={{ ...styles.th, minWidth: '100px', width: '100px', maxWidth: '100px', textAlign: 'left' }}>Return No</th>
                <th style={{ ...styles.th, minWidth: '100px', width: '100px', maxWidth: '100px', textAlign: 'left' }}>Return Date</th>
                <th style={{ ...styles.th, minWidth: '110px', width: '110px', maxWidth: '110px', textAlign: 'right' }}>Return Amount</th>
                <th style={{ ...styles.th, minWidth: '70px', width: '70px', maxWidth: '70px', textAlign: 'right' }}>Qty</th>
                <th style={{ ...styles.th, minWidth: '130px', width: '130px', maxWidth: '130px', textAlign: 'left' }}>Time</th>
                <th style={{ ...styles.th, minWidth: '160px', width: '160px', maxWidth: '160px', textAlign: 'left' }}>Reason</th>
                <th style={{ ...styles.th, minWidth: '100px', width: '100px', maxWidth: '100px', textAlign: 'left' }}>Original Bill No</th>
                <th style={{ ...styles.th, minWidth: '100px', width: '100px', maxWidth: '100px', textAlign: 'left' }}>Original Bill Date</th>
              </tr>
            </thead>
            <tbody>
              {tableLoaded ? (
                salesReturnData.length > 0 ? (
                  salesReturnData.map((row, rowIndex) => (
                    <tr 
                      key={row.id} 
                      style={{ 
                        backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const colNames = ['no', 'customerName', 'returnNo', 'returnDate', 'returnAmount', 'qty', 'time', 'reason', 'originalBillNo', 'originalBillDate'];
                        const colIndex = colNames.indexOf('no');
                        setSelectedCell({ row: rowIndex, col: colIndex });
                      }}
                    >
                      <td style={getCellStyle(rowIndex, 'no')} onDoubleClick={() => startEditing(rowIndex, 'no', row.no)}>
                        {renderCell(rowIndex, 'no', row.no)}
                      </td>
                      <td style={getCellStyle(rowIndex, 'customerName')} onDoubleClick={() => startEditing(rowIndex, 'customerName', row.customerName)}>
                        {renderCell(rowIndex, 'customerName', row.customerName)}
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
                      <td style={getCellStyle(rowIndex, 'originalBillNo')} onDoubleClick={() => startEditing(rowIndex, 'originalBillNo', row.originalBillNo)}>
                        {renderCell(rowIndex, 'originalBillNo', row.originalBillNo)}
                      </td>
                      <td style={getCellStyle(rowIndex, 'originalBillDate')} onDoubleClick={() => startEditing(rowIndex, 'originalBillDate', row.originalBillDate)}>
                        {renderCell(rowIndex, 'originalBillDate', row.originalBillDate)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No sales return records found
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Enter search criteria and click "Search" to view sales return register entries
                  </td>
                </tr>
              )}
            </tbody>
            {tableLoaded && salesReturnData.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#f0f8ff', borderTop: '2px solid #1B91DA' }}>
                  <td colSpan="4" style={{ ...styles.td, textAlign: 'left', fontWeight: 'bold' }}>
                    Total Sales Returns
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontFamily: '"Courier New", monospace', fontWeight: 'bold', color: '#1565c0' }}>
                    ₹{formatNumber(totals.returnAmount)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontFamily: '"Courier New", monospace', fontWeight: 'bold', color: '#1565c0' }}>
                    {totals.qty.toFixed(2)}
                  </td>
                  <td colSpan="4" style={{ ...styles.td, textAlign: 'center', fontStyle: 'italic' }}>
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
          {tableLoaded && salesReturnData.length > 0 && (
            <>
              <div style={styles.balanceItem}>
                <span style={styles.balanceLabel}>Total Returns</span>
                <span style={styles.balanceValue}>
                  {salesReturnData.length}
                </span>
              </div>
              <div style={styles.balanceItem}>
                <span style={styles.balanceLabel}>Average Return</span>
                <span style={styles.balanceValue}>
                  ₹{formatNumber(totals.returnAmount / salesReturnData.length)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Customer Selection Popup */}
      {showCustomerPopup && (
        <div style={styles.popupOverlay} onClick={handleCustomerPopupClose}>
          <div 
            style={styles.popupContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.popupHeader}>
              Select Customer
              <button 
                style={styles.closeButton}
                onClick={handleCustomerPopupClose}
              >
                ×
              </button>
            </div>
            
            <div style={styles.listContainer}>
              {allCustomers.map((customerItem) => {
                const isSelected = tempSelectedCustomers.includes(customerItem);
                return (
                  <div 
                    key={customerItem} 
                    style={isSelected ? styles.selectedListItem : styles.listItem}
                    onClick={() => handleCustomerSelect(customerItem)}
                  >
                    <div style={isSelected ? styles.selectedListCheckbox : styles.listCheckbox}>
                      {isSelected && <div style={styles.checkmark}>✓</div>}
                    </div>
                    <span style={styles.listText}>{customerItem}</span>
                  </div>
                );
              })}
            </div>
            
            <div style={styles.popupActions}>
              <div style={styles.popupButtons}>
                <button 
                  style={{...styles.popupButton, ...styles.clearButton}}
                  onClick={handleCustomerClearSelection}
                >
                  Clear
                </button>
                <button 
                  style={{...styles.popupButton, ...styles.okButton}}
                  onClick={handleCustomerPopupOk}
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

export default SalesReturnRegister;