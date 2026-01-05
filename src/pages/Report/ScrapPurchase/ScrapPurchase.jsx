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

const ScrapPurchase = () => {
  // --- STATE MANAGEMENT ---
  const [originalData, setOriginalData] = useState([
    {
      id: 1,
      no: 1,
      salesParty: 'AMIT FASHION',
      billNo: 'P00001AA',
      billDate: '27-09-2025',
      billAmount: '29,303.00',
      qty: '15.00',
      time: '01-01-1900 09:52:12',
      noOfBale: '0',
      transport: ''
    },
    {
      id: 2,
      no: 2,
      salesParty: 'CASH A/C',
      billNo: 'P00002AA',
      billDate: '10-12-2025',
      billAmount: '380.00',
      qty: '10.00',
      time: '01-01-1900 12:49:20',
      noOfBale: '0',
      transport: ''
    },
    {
      id: 3,
      no: 3,
      salesParty: 'TEXTILE MART',
      billNo: 'P00003AA',
      billDate: '15-01-2025',
      billAmount: '15,500.00',
      qty: '25.00',
      time: '01-01-1900 14:30:00',
      noOfBale: '2',
      transport: 'TRUCK-101'
    },
    {
      id: 4,
      no: 4,
      salesParty: 'FABRIC WORLD',
      billNo: 'P00004AA',
      billDate: '20-03-2025',
      billAmount: '42,800.00',
      qty: '35.00',
      time: '01-01-1900 11:15:45',
      noOfBale: '3',
      transport: 'TRUCK-202'
    },
    {
      id: 5,
      no: 5,
      salesParty: 'STYLE CORNER',
      billNo: 'P00005AA',
      billDate: '05-06-2025',
      billAmount: '8,900.00',
      qty: '12.00',
      time: '01-01-1900 16:20:30',
      noOfBale: '1',
      transport: 'VAN-303'
    },
    {
      id: 6,
      no: 6,
      salesParty: 'CLASSIC TEXTILES',
      billNo: 'P00006AA',
      billDate: '18-07-2025',
      billAmount: '22,150.00',
      qty: '18.00',
      time: '01-01-1900 10:45:00',
      noOfBale: '2',
      transport: 'TRUCK-404'
    },
    {
      id: 7,
      no: 7,
      salesParty: 'MODERN FABRICS',
      billNo: 'P00007AA',
      billDate: '30-11-2025',
      billAmount: '33,750.00',
      qty: '28.00',
      time: '01-01-1900 15:10:20',
      noOfBale: '3',
      transport: 'TRUCK-505'
    },
    {
      id: 8,
      no: 8,
      salesParty: 'TRENDY WEARS',
      billNo: 'P00008AA',
      billDate: '12-02-2025',
      billAmount: '5,600.00',
      qty: '8.00',
      time: '01-01-1900 13:25:45',
      noOfBale: '1',
      transport: 'VAN-606'
    },
    {
      id: 9,
      no: 9,
      salesParty: 'CURRENT DAY SALE',
      billNo: 'P00009AA',
      billDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      billAmount: '12,450.00',
      qty: '20.00',
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      noOfBale: '2',
      transport: 'TRUCK-707'
    }
  ]);

  // State for displayed data (filtered)
  const [data, setData] = useState([]);

  // State for editing
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [focusedField, setFocusedField] = useState('');
  const [tableLoaded, setTableLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // --- SCREEN SIZE DETECTION ---
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  // Refs for keyboard navigation
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const searchButtonRef = useRef(null);
  const clearButtonRef = useRef(null);

  // Function to parse DD-MM-YYYY date string to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    // Handle both DD-MM-YYYY and YYYY-MM-DD formats
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD format
        return new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        // DD-MM-YYYY format
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
    return null;
  };

  // Format date as YYYY-MM-DD for input
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Handle date change
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  // Function to filter data by date range
  const filterDataByDateRange = (from, to) => {
    if (!from || !to) {
      toast.warning('Please select both From Date and To Date');
      return;
    }

    const fromDateObj = new Date(from);
    const toDateObj = new Date(to);
    
    // Set to end of day for toDate
    toDateObj.setHours(23, 59, 59, 999);
    
    // Validate date range
    if (fromDateObj > toDateObj) {
      toast.error('From Date cannot be after To Date');
      return;
    }

    const filteredData = originalData.filter(item => {
      const itemDate = parseDate(item.billDate);
      if (!itemDate) return false;
      
      return itemDate >= fromDateObj && itemDate <= toDateObj;
    });

    // Sort filtered data by date
    const sortedData = filteredData.sort((a, b) => {
      const dateA = parseDate(a.billDate);
      const dateB = parseDate(b.billDate);
      return dateA - dateB;
    });

    // Update row numbers
    const updatedData = sortedData.map((item, index) => ({
      ...item,
      no: index + 1
    }));

    setData(updatedData);
    setTableLoaded(true);
    
    if (updatedData.length === 0) {
      // toast.info('No records found for the selected date range');
    } else {
      toast.success(`Found ${updatedData.length} record(s) for the selected date range`);
    }
    
    return updatedData;
  };

  // Filter data by date range
  const handleSearch = () => {
    if (!fromDate || !toDate) {
      toast.warning('Please select both From Date and To Date');
      return;
    }
    
    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (from > to) {
      toast.error('From Date cannot be after To Date');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      filterDataByDateRange(fromDate, toDate);
      setIsLoading(false);
    }, 500);
  };

  // Clear date filters
  const handleRefresh = () => {
    // Reset From Date to empty
    setFromDate('');
    
    // Reset To Date to current date
    const today = new Date();
    const currentDate = formatDateForInput(today);
    setToDate(currentDate);
    
    // Clear table data
    setData([]);
    setTableLoaded(false);
    
    // toast.info('Filters cleared! Select dates and click Search to view data');
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
      const newData = [...data];
      newData[row] = {
        ...newData[row],
        [col]: editValue
      };
      setData(newData);
      setEditingCell(null);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCell(null);
  };

  // Focusable elements in order
  const focusableElements = [
    { ref: fromDateRef, name: 'fromDate', type: 'input' },
    { ref: toDateRef, name: 'toDate', type: 'input' },
    { ref: searchButtonRef, name: 'search', type: 'button' },
    { ref: clearButtonRef, name: 'clear', type: 'button' }
  ];

  // Handle keyboard navigation for main controls
  const handleKeyDown = (e, fieldName) => {
    const currentIndex = focusableElements.findIndex(el => el.name === fieldName);
    
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (fieldName === 'search') {
          handleSearch();
        } else if (fieldName === 'clear') {
          handleRefresh();
        } else {
          // Move to next element
          const nextIndex = (currentIndex + 1) % focusableElements.length;
          focusableElements[nextIndex].ref.current.focus();
        }
        break;
        
      case 'ArrowRight':
      case 'Tab':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex].ref.current.focus();
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
        focusableElements[prevIndex].ref.current.focus();
        break;
        
      case 'Escape':
        e.currentTarget.blur();
        break;
        
      case ' ':
        if (fieldName === 'search') {
          e.preventDefault();
          handleSearch();
        } else if (fieldName === 'clear') {
          e.preventDefault();
          handleRefresh();
        }
        break;
    }
  };

  // Handle keyboard navigation in table
  useEffect(() => {
    const handleTableKeyDown = (e) => {
      const { row, col } = selectedCell;
      const colNames = ['no', 'salesParty', 'billNo', 'billDate', 'billAmount', 'qty', 'time', 'noOfBale', 'transport'];
      
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

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (row < data.length - 1) {
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
          startEditing(row, colNames[col], data[row][colNames[col]]);
          break;
        case 'Delete':
          e.preventDefault();
          if (window.confirm('Clear this cell?')) {
            const newData = [...data];
            newData[row] = {
              ...newData[row],
              [colNames[col]]: ''
            };
            setData(newData);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleTableKeyDown);
    return () => window.removeEventListener('keydown', handleTableKeyDown);
  }, [selectedCell, editingCell, data]);

  // Add new row
  const addNewRow = () => {
    const newRow = {
      id: originalData.length + 1,
      no: data.length + 1,
      salesParty: '',
      billNo: '',
      billDate: '',
      billAmount: '0.00',
      qty: '0.00',
      time: '',
      noOfBale: '0',
      transport: ''
    };
    const updatedData = [...data, newRow];
    setData(updatedData);
    setSelectedCell({ row: data.length, col: 0 });
  };

  // Delete selected row
  const deleteSelectedRow = () => {
    if (selectedCell.row >= 0 && selectedCell.row < data.length) {
      const newData = data.filter((_, index) => index !== selectedCell.row);
      // Update row numbers
      const updatedData = newData.map((row, index) => ({
        ...row,
        no: index + 1
      }));
      setData(updatedData);
      setSelectedCell({ row: Math.min(selectedCell.row, updatedData.length - 1), col: selectedCell.col });
    }
  };

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width,
        height: window.innerHeight,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    // Set From Date to empty initially
    setFromDate('');
    
    // Set To Date to current date
    const today = new Date();
    const currentDate = formatDateForInput(today);
    setToDate(currentDate);
    
    // Initially show empty table with message
    setTableLoaded(false);
    setData([]);
    
    // Show instruction message
    // toast.info('Please select From Date and click Search to view data');
  }, []);

  // Calculate totals
  const totals = {
    billAmount: data.reduce((sum, row) => {
      const amount = parseFloat(row.billAmount.replace(/,/g, '')) || 0;
      return sum + amount;
    }, 0),
    qty: data.reduce((sum, row) => {
      const qty = parseFloat(row.qty) || 0;
      return sum + qty;
    }, 0)
  };

  // Calculate opening and closing balances
  const openingBalance = 0.00;
  const closingBalance = totals.billAmount;

  // Add CSS animation for spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
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
    formRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
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
      minWidth: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '75px',
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
    gridRow: {
      display: 'grid',
      gap: '8px',
      marginBottom: 10,
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
      width: '100%',
      minWidth: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'auto',
    },
    th: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      backgroundColor: '#1B91DA',
      color: 'white',
      padding: screenSize.isMobile ? '8px 4px' : screenSize.isTablet ? '10px 6px' : '12px 8px',
      textAlign: 'center',
      letterSpacing: '0.5px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      border: '1px solid white',
      borderBottom: '2px solid white',
      minWidth: '80px',
      whiteSpace: 'nowrap',
    },
    td: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '8px 4px' : screenSize.isTablet ? '10px 6px' : '12px 8px',
      textAlign: 'center',
      border: '1px solid #e0e0e0',
      color: '#333',
      minWidth: '80px',
    },
    footerSection: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      flex: '0 0 auto',
      flexDirection: screenSize.isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
      backgroundColor: 'white',
      borderTop: '2px solid #e0e0e0',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
      flexWrap: 'wrap',
      flexShrink: 0,
      minHeight: screenSize.isMobile ? 'auto' : screenSize.isTablet ? '48px' : '60px',
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
      background: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      fontFamily: TYPOGRAPHY.fontFamily,
    },
    loadingBox: {
      background: 'white',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    },
    loadingSpinner: {
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #1B91DA',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div style={styles.loadingSpinner}></div>
            <div>Loading Purchase Register Report...</div>
          </div>
        </div>
      )}

      {/* Header Section */}
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
              onKeyDown={(e) => handleKeyDown(e, 'fromDate')}
              onFocus={() => setFocusedField('fromDate')}
              onBlur={() => setFocusedField('')}
              required
            />
          </div>

          {/* To Date */}
          <div style={{
            ...styles.formField,
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
              onKeyDown={(e) => handleKeyDown(e, 'toDate')}
              onFocus={() => setFocusedField('toDate')}
              onBlur={() => setFocusedField('')}
              required
            />
          </div>
          

          {/* Search Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            marginLeft: screenSize.isMobile ? '0' : 'auto',
          }}>
            <button
              style={{
                ...styles.searchButton,
                width: screenSize.isMobile ? '100%' : 'auto',
                marginBottom: screenSize.isMobile ? '8px' : '0',
                opacity: (!fromDate || !toDate) ? 0.6 : 1,
                cursor: (!fromDate || !toDate) ? 'not-allowed' : 'pointer',
              }}
              onClick={handleSearch}
              onMouseEnter={() => setHoveredButton(fromDate && toDate)}
              onMouseLeave={() => setHoveredButton(false)}
              ref={searchButtonRef}
              onKeyDown={(e) => handleKeyDown(e, 'search')}
              onFocus={() => setFocusedField('search')}
              onBlur={() => setFocusedField('')}
              disabled={!fromDate || !toDate}
            >
              Search
              {hoveredButton && fromDate && toDate && <div style={styles.buttonGlow}></div>}
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
              ref={clearButtonRef}
              onKeyDown={(e) => handleKeyDown(e, 'clear')}
              onFocus={() => setFocusedField('clear')}
              onBlur={() => setFocusedField('')}
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
                <th style={styles.th}>No</th>
                <th style={styles.th}>Purchase Party</th>
                <th style={styles.th}>Bill No</th>
                <th style={styles.th}>Bill Date</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>No of Bale</th>
              </tr>
            </thead>
            <tbody>
              {tableLoaded ? (
                data.length > 0 ? (
                  data.map((row, index) => (
                    <tr 
                      key={row.id} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff'}
                    >
                      <td style={styles.td}>{row.no}</td>
                      <td style={styles.td}>{row.salesParty}</td>
                      <td style={styles.td}>{row.billNo}</td>
                      <td style={styles.td}>{row.billDate}</td>
                      <td style={{...styles.td, textAlign: 'right', fontWeight: 'bold', color: '#1565c0'}}>
                        ₹{row.billAmount}
                      </td>
                      <td style={styles.td}>{row.qty}</td>
                      <td style={styles.td}>{row.time}</td>
                      <td style={styles.td}>{row.noOfBale}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic' }}>
                      No purchase records found for the selected date range
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    Please select From Date and click "Search" to view purchase register entries
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Section with Balances */}
      <div style={styles.footerSection}>
        <div style={styles.balanceContainer}>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Opening Balance</span>
            <span style={styles.balanceValue}>
              ₹{openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Total Amount</span>
            <span style={styles.balanceValue}>
              ₹{totals.billAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Total Quantity</span>
            <span style={styles.balanceValue}>
              {totals.qty.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Closing Balance</span>
            <span style={styles.balanceValue}>
              ₹{closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapPurchase;