import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { API_ENDPOINTS } from '../../../api/endpoints';
import axiosInstance from '../../../api/axiosInstance';
import { useAuth } from '../../../context/AuthContext';
import { PrintButton, ExportButton } from '../../../components/Buttons/ActionButtons';
import ConfirmationPopup from '../../../components/ConfirmationPopup/ConfirmationPopup';
import { usePrintPermission } from '../../../hooks/usePrintPermission';
// Helper functions (keep these outside the component)
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  return null;
};

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateForAPI = (dateStr) => {
  // Convert from YYYY-MM-DD to DD/MM/YYYY for API
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatNumber = (num) => {
  if (typeof num === 'string') {
    const cleaned = num.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? '0.00' : parsed.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const parseNumber = (str) => {
  if (!str) return 0;
  const cleaned = str.toString().replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const PurchaseReturnRegister = () => {
  // --- PERMISSIONS ---
const { hasPrintPermission, checkPrintPermission } =
  usePrintPermission('PURCHASE_RETURN_REGISTER');


  const { userData } = useAuth() || {};
  // State for data
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalRecords: 0,
    totals: { amount: 0 }
  });
  
  // UI state
  const [focusedField, setFocusedField] = useState('fromDate');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Confirmation popup states
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  // Screen size state
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  // Refs
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const searchButtonRef = useRef(null);
  const clearButtonRef = useRef(null);
  const tableContainerRef = useRef(null);
  const observerRef = useRef(null);

  // Event handlers
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  // API call function
  const fetchData = useCallback(async (page = 1, isLoadMore = false) => {
    if (!fromDate || !toDate) return;
    
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      // Format dates for API (DD/MM/YYYY format)
      const formattedFromDate = formatDateForAPI(fromDate);
      const formattedToDate = formatDateForAPI(toDate);
      
      // Get the endpoint URL using the API_ENDPOINTS constant
      const endpoint = API_ENDPOINTS.PURCHASE_RETURN_REGISTER.GET_LIST(
        formattedFromDate, 
        formattedToDate, 
        userData.companyCode, // compCode - adjust if needed
        page,     // current page
        20     // pageSize
      );
      
      // console.log('Fetching from endpoint:', endpoint);
      
      // Make API call using axiosInstance
      const response = await axiosInstance.get(endpoint);
      // console.log('API Response:', response.data);
      
      // Handle API response
      if (response.data) {
        const apiData = response.data.data || [];
        const totalRecords = response.data.totalRecords || 0;
        const pageSize = 20;
        const totalPages = Math.ceil(totalRecords / pageSize);
        
        // Calculate total amount for all loaded data
        let totalAmount = 0;
        
        if (isLoadMore) {
          // For load more, append to existing data
          const newData = [...data, ...apiData];
          setData(newData);
          totalAmount = newData.reduce((sum, item) => {
            return sum + (parseFloat(item.amount) || 0);
          }, 0);
        } else {
          // For initial load, replace data
          setData(apiData);
          totalAmount = apiData.reduce((sum, item) => {
            return sum + (parseFloat(item.amount) || 0);
          }, 0);
          setCurrentPage(1);
        }
        
        setSummary({
          totalRecords: totalRecords,
          totals: { amount: totalAmount }
        });
        
        setTotalPages(totalPages);
        setHasMore(page < totalPages);
        
        return apiData;
      } else {
        if (!isLoadMore) {
          toast.error('No data received from API');
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching purchase return data:', error);
      
      // Handle specific error cases
      if (error.response) {
        // Server responded with error status
        toast.error(`Error ${error.response.status}: ${error.response.data?.message || 'Server error'}`);
      } else if (error.request) {
        // Request made but no response
        toast.error('Network error. Please check your connection.');
      } else {
        // Other errors
        toast.error(error.message || 'Failed to fetch data. Please try again.');
      }
      
      return [];
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [fromDate, toDate, data]);

  // Load more data function
  const loadMoreData = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchData(nextPage, true);
  }, [currentPage, hasMore, isLoadingMore, fetchData]);

  // Intersection Observer for infinite scroll
  const lastRowRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMoreData();
          }
        },
        {
          root: tableContainerRef.current,
          rootMargin: '100px',
          threshold: 0.1,
        }
      );
      
      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, hasMore, loadMoreData]
  );

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      toast.warning('Please select both From Date and To Date');
      return;
    }
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (from > to) {
      toast.error('From Date cannot be after To Date');
      return;
    }
    
    // Reset scroll state
    setCurrentPage(1);
    setHasMore(true);
    
    const result = await fetchData(1, false);
    
    if (result.length === 0) {
      toast.info('No records found for the selected date range');
    }
  };

  const handleRefresh = async () => {
    setFromDate('');
    const today = new Date();
    const currentDate = formatDateForInput(today);
    setFromDate(currentDate);
    setToDate(currentDate);
    setData([]);
    setSummary({
      totalRecords: 0,
      totals: { amount: 0 },
    });
    setCurrentPage(1);
    setHasMore(true);
    setFocusedField('fromDate');
    toast.info('Filters cleared! Select dates and click Search to view data');
  };

  const handlePrintClick = () => {
    // ✅ Check print permission first
    if (!checkPrintPermission()) {
      return;
    }
    if (data.length === 0) {
      toast.warning('No data available to print');
      return;
    }
    setShowPrintConfirm(true);
  };

const handleExportClick = () => {
  if (!hasPrintPermission) {
    toast.error('You do not have permission to export this report', {
      autoClose: 3000,
    });
    return;
  }

  if (data.length === 0) {
    toast.warning('No data available to export');
    return;
  }

  setShowExportConfirm(true);
};


 const handlePrintConfirm = () => {
  if (!hasPrintPermission) {
    setShowPrintConfirm(false);
    return;
  }

  setShowPrintConfirm(false);
  generatePDF();
};


 const handleExportConfirm = () => {
  if (!hasPrintPermission) {
    setShowExportConfirm(false);
    return;
  }

  setShowExportConfirm(false);
  exportToExcel();
};


  const generatePDF = () => {
    try {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Purchase Return Register</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #1B91DA; }
            .info { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #1B91DA; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin-top: 20px; font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <h1>Purchase Return Register</h1>
          <div class="info">
            <p>Period: ${fromDate} to ${toDate}</p>
            <p>Total Records: ${summary.totalRecords}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>Invoice</th>
                <th>Voucher Date</th>
                <th>Bill</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((row, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${row.name || ''}</td>
                  <td>${row.invoice || ''}</td>
                  <td>${row.voucherDate || ''}</td>
                  <td>${row.bill || ''}</td>
                  <td>₹${formatNumber(row.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="summary">
            <p>Net Total: ₹${formatNumber(summary.totals.amount)}</p>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      toast.success('Print dialog opened');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const exportToExcel = () => {
    try {
      let csvContent = 'Purchase Return Register\n';
      csvContent += `Period: ${fromDate} to ${toDate}\n`;
      csvContent += `Total Records: ${summary.totalRecords}\n\n`;
      
      csvContent += 'No,Name,Invoice,Voucher Date,Bill,Amount\n';
      
      data.forEach((row, index) => {
        const amount = parseNumber(row.amount);
        csvContent += `${index + 1},"${row.name || ''}",${row.invoice || ''},${row.voucherDate || ''},${row.bill || ''},${amount}\n`;
      });
      
      csvContent += `\nNet Total:,,,,,${parseNumber(summary.totals.amount)}\n`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Purchase_Return_Register_${fromDate}_to_${toDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  // Keyboard navigation
  const focusableElements = [
    { ref: fromDateRef, name: 'fromDate', type: 'input' },
    { ref: toDateRef, name: 'toDate', type: 'input' },
    { ref: searchButtonRef, name: 'search', type: 'button' },
    { ref: clearButtonRef, name: 'clear', type: 'button' }
  ];

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

  // Handle manual scroll detection (fallback)
  const handleScroll = useCallback(() => {
    if (!tableContainerRef.current || isLoadingMore || !hasMore) return;
    
    const container = tableContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Load more when user is within 200px of the bottom
    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadMoreData();
    }
  }, [isLoadingMore, hasMore, loadMoreData]);

  // Effects
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

  useEffect(() => {
    // Initialize dates
    setFromDate('');
    const today = new Date();
    const currentDate = formatDateForInput(today);
    setFromDate(currentDate); 
    setToDate(currentDate);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Add scroll listener to table container
  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Typography and styles
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
      display: 'flex',
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
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      marginLeft: screenSize.isMobile ? '0' : 'auto',
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
    loadMoreRow: {
      backgroundColor: '#f8f9fa',
      textAlign: 'center',
      padding: '16px',
      borderBottom: '1px solid #e0e0e0',
    },
    loadMoreSpinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '2px solid #f3f3f3',
      borderTop: '2px solid #1B91DA',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '8px',
    },
    loadMoreText: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      color: '#666',
      fontSize: '14px',
      fontWeight: '500',
    },
    noMoreData: {
      textAlign: 'center',
      padding: '16px',
      color: '#666',
      fontStyle: 'italic',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e0e0e0',
    },
    loadingPulse: {
      animation: 'pulse 1.5s ease-in-out infinite',
    },
  };

  return (
    <div style={styles.container}>
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div style={styles.loadingSpinner}></div>
            <div>Loading Purchase Return Register...</div>
          </div>
        </div>
      )}

      <div style={styles.headerSection}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '12px' : '16px',
          flexWrap: screenSize.isMobile ? 'wrap' : 'nowrap',
          width: '100%',
        }}>
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

      <div style={styles.tableSection}>
        <div style={styles.tableContainer} ref={tableContainerRef}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, minWidth: '40px'}}>No</th>
                <th style={{...styles.th, minWidth: '120px'}}>Party Name</th>
                <th style={styles.th}>Invoice</th>
                <th style={styles.th}>Voucher Date</th>
                <th style={styles.th}>Bill</th>
                <th style={styles.th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* {data.length > 0 ? ( */}
                <>
                  {data.map((row, index) => (
                    <tr 
                      key={`${row.invoice || ''}_${index}`}
                      ref={index === data.length - 1 ? lastRowRef : null}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff'}
                    >
                      <td style={{...styles.td, minWidth: '40px'}}>{index + 1}</td>
                      <td style={styles.td}>{row.name || ''}</td>
                      <td style={styles.td}>{row.invoice || ''}</td>
                      <td style={styles.td}>{row.voucherDate || ''}</td>
                      <td style={styles.td}>{row.bill || ''}</td>
                      <td style={styles.td}>{row.amount ? formatNumber(row.amount) : '0.00'}</td>
                    </tr>
                  ))}
                  
                </>

            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.footerSection}>
        <div style={styles.balanceContainer}>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Net Total</span>
            <span style={styles.balanceValue}>
              ₹{formatNumber(summary.totals.amount)}
            </span>
          </div>
        </div>
        <div style={styles.buttonGroup}>
         <PrintButton 
  onClick={handlePrintClick}
  isActive={hasPrintPermission}
  disabled={!hasPrintPermission || data.length === 0}
/>

<ExportButton 
  onClick={handleExportClick}
  isActive={hasPrintPermission}
  disabled={!hasPrintPermission || data.length === 0}
/>

        </div>
      </div>

      {/* Print Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showPrintConfirm}
        onClose={() => setShowPrintConfirm(false)}
        onConfirm={handlePrintConfirm}
        title="Print Confirmation"
        message="Do you want to print the Purchase Return Register report?"
        confirmText="Print"
        cancelText="Cancel"
        type="info"
      />

      {/* Export Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        onConfirm={handleExportConfirm}
        title="Export Confirmation"
        message="Do you want to export the Purchase Return Register report to Excel?"
        confirmText="Export"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
};

export default PurchaseReturnRegister;