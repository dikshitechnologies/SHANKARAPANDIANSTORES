import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_ENDPOINTS } from '../../api/endpoints';
import { API_BASE } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';
import { PrintButton, ExportButton } from '../../components/Buttons/ActionButtons';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import { usePrintPermission } from '../../hooks/usePrintPermission';

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

const SalesRegister = () => {

const { hasPrintPermission, checkPrintPermission } =
  usePrintPermission('SALES_REGISTER');



  
    const { userData } = useAuth() || {};
  // --- STATE MANAGEMENT ---
  const currentDate = formatDate(new Date());
  const [fromDate, setFromDate] = useState(currentDate);
  const [toDate, setToDate] = useState(currentDate);
  const [tableLoaded, setTableLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [salesData, setSalesData] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });

  // Confirmation popup states
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const searchButtonRef = useRef(null);

  // Mock sales register data (matching your image)
  const mockSalesData = [
    {
      id: 1,
      no: 1,
      salesParty: 'AMT FASHION',
      billNo: 'COX01AA',
      billDate: '27-09-2025',
      billAmount: '29,400.00',
      qty: '15.00',
      time: '095212 AM'
    },
    {
      id: 2,
      no: 2,
      salesParty: 'CASH A/C',
      billNo: 'COX02AA',
      billDate: '10-12-2025',
      billAmount: '380.00',
      qty: '10.00',
      time: '124920 PM'
    },
    {
      id: 3,
      no: 3,
      salesParty: 'JOHN TRADERS',
      billNo: 'COX03AA',
      billDate: '15-01-2025',
      billAmount: '12,460.00',
      qty: '25.50',
      time: '021545 PM'
    },
    {
      id: 4,
      no: 4,
      salesParty: 'SMITH ENTERPRISES',
      billNo: 'COX04AA',
      billDate: '22-03-2025',
      billAmount: '8,760.00',
      qty: '18.75',
      time: '103010 AM'
    },
    {
      id: 5,
      no: 5,
      salesParty: 'GLOBAL FASHION',
      billNo: 'COX05AA',
      billDate: '05-05-2025',
      billAmount: '45,200.00',
      qty: '32.00',
      time: '044530 PM'
    },
    {
      id: 6,
      no: 6,
      salesParty: 'PREMIUM TEXTILES',
      billNo: 'COX06AA',
      billDate: '18-07-2025',
      billAmount: '23,120.00',
      qty: '28.50',
      time: '112015 AM'
    },
    {
      id: 7,
      no: 7,
      salesParty: 'AMT FASHION',
      billNo: 'COX07AA',
      billDate: '30-08-2025',
      billAmount: '17,650.00',
      qty: '22.25',
      time: '081040 PM'
    },
    {
      id: 8,
      no: 8,
      salesParty: 'CASH A/C',
      billNo: 'COX08AA',
      billDate: '12-10-2025',
      billAmount: '8,630.00',
      qty: '12.50',
      time: '014555 PM'
    },
    {
      id: 9,
      no: 9,
      salesParty: 'JOHN TRADERS',
      billNo: 'COX09AA',
      billDate: '25-11-2025',
      billAmount: '31,750.00',
      qty: '35.00',
      time: '081525 AM'
    },
    {
      id: 10,
      no: 10,
      salesParty: 'SMITH ENTERPRISES',
      billNo: 'COX10AA',
      billDate: '08-12-2025',
      billAmount: '14,400.00',
      qty: '13.50',
      time: '053020 PM'
    }
  ];

  // --- HANDLERS ---
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      toast.warning('Please select From Date and To Date', {
        autoClose: 2000,
      });
      return;
    }
    
    console.log('Searching Sales Register with:', {
      fromDate,
      toDate
    });
    
    setIsLoading(true);
    
    try {
      // Format dates as DD/MM/YYYY for API
      const formatDateForAPI = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      
      const formattedFromDate = formatDateForAPI(fromDate);
      const formattedToDate = formatDateForAPI(toDate);
      const compCode = userData.companyCode; // Default company code
      
      // Build the API URL
      const apiUrl = `${API_BASE}${API_ENDPOINTS.SALES_REGISTER.SALES_REPORT(
        formattedFromDate, 
        formattedToDate, 
        compCode, 
        1, 
        20
      )}`;
      console.log('API URL:', apiUrl);
      
      // Fetch data from API
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Map the API data to match your table structure
      const mappedData = data.data.map((item, index) => ({
        no: index + 1,
        salesParty: item.refName || item.name || 'N/A',
        billNo: item.voucherNo || item.no || 'N/A',
        billDate: item.voucherDate || 'N/A',
        qty: item.qty?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
        salesReturn: item.salesAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
        freightCharge: item.freightAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
        serviceCharge: item.serviceChargeAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
        cash: item.cash?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
        upiAmount: item.upi?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
        cardAmount: item.card?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
        billAmount: (typeof item.billAmount === 'number' ? item.billAmount : 0)?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
        // time: item.time ? new Date(item.time).toLocaleTimeString('en-IN', { 
        //   hour: '2-digit', 
        //   minute: '2-digit', 
        //   second: '2-digit',
        //   hour12: true 
        // }) : 'N/A'
      }));
      
      setSalesData(mappedData);
      setTableLoaded(true);
      // toast.success(`Loaded ${data.data.length} records`);
      
    } catch (error) {
      console.error('Error fetching sales register:', error);
      toast.error('Failed to load sales register data. Please try again.');
      setSalesData([]);
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
    setSalesData([]);
  };

const handlePrintClick = () => {
  if (!checkPrintPermission()) return;

  if (salesData.length === 0) {
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

  if (salesData.length === 0) {
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
      // Create a printable HTML content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sales Register</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #1B91DA; }
            .info { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #1B91DA; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin-top: 20px; font-weight: bold; }
            .summary-item { display: inline-block; margin-right: 30px; }
          </style>
        </head>
        <body>
          <h1>Sales Register Report</h1>
          <div class="info">
            <p>Period: ${fromDate} to ${toDate}</p>
            <p>Total Records: ${salesData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Sales Party</th>
                <th>Bill No</th>
                <th>Bill Date</th>
                <th>Bill Amount</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              ${salesData.map((row) => `
                <tr>
                  <td>${row.no}</td>
                  <td>${row.salesParty}</td>
                  <td>${row.billNo}</td>
                  <td>${row.billDate}</td>
                  <td>₹${row.billAmount}</td>
                  <td>${row.qty}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="summary">
            <div class="summary-item">Total Bill Amount: ₹${formatNumber(totals.billAmount)}</div>
            <div class="summary-item">Total Quantity: ${totals.qty.toFixed(2)}</div>
          </div>
        </body>
        </html>
      `;

      // Open print window
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
      // Create CSV content
      let csvContent = 'Sales Register Report\n';
      csvContent += `Period: ${fromDate} to ${toDate}\n`;
      csvContent += `Total Records: ${salesData.length}\n\n`;
      
      // Headers
      csvContent += 'No,Sales Party,Bill No,Bill Date,Bill Amount,Qty\n';
      
      // Data rows
      salesData.forEach((row) => {
        const billAmount = parseFloat(row.billAmount?.replace(/,/g, '')) || 0;
        const qty = parseFloat(row.qty) || 0;
        csvContent += `${row.no},"${row.salesParty}",${row.billNo},${row.billDate},${billAmount},${qty}\n`;
      });
      
      // Summary
      csvContent += `\n\n`;
      csvContent += `Summary\n`;
      csvContent += `Total Bill Amount,${totals.billAmount}\n`;
      csvContent += `Total Quantity,${totals.qty}\n`;
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Sales_Register_${fromDate}_to_${toDate}.csv`);
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

  // Handle key navigation
  const handleKeyDown = (e, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      switch(currentField) {
        case 'fromDate':
          toDateRef.current?.focus();
          break;
        case 'toDate':
          searchButtonRef.current?.focus();
          break;
        default:
          break;
      }
    }
  };

  // Focus on fromDate field when component mounts
  useEffect(() => {
    if (fromDateRef.current) {
      fromDateRef.current.focus();
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
    billAmount: salesData.reduce((sum, row) => {
      const amount = parseFloat(row.billAmount?.replace(/,/g, '')) || 0;
      return sum + amount;
    }, 0),
    qty: salesData.reduce((sum, row) => {
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
    // fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px', // Keep same height
      flex: 1,
      minWidth: screenSize.isMobile ? '80px' : '90px', // SMALLER WIDTH
      backgroundColor: 'white',
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
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px', // Keep same height
      flex: 1,
      minWidth: screenSize.isMobile ? '80px' : '90px', // SMALLER WIDTH
      backgroundColor: 'white',
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
  fontWeight: TYPOGRAPHY.fontWeight.bold, // Match th bold (700) - already bold
  lineHeight: TYPOGRAPHY.lineHeight.tight, // Match th line height (1.2)
  padding: screenSize.isMobile ? '5px 3px' : screenSize.isTablet ? '7px 5px' : '10px 6px', // Match th padding
  textAlign: 'center',
  border: '1px solid #ccc',
  color: '#333',
  minWidth: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
  width: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
  maxWidth: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '80px',
  cursor: 'default',
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
  };

  // Get cell style based on state
 const getCellStyle = (rowIndex, colName) => {
  const colNames = ['no', 'salesParty', 'billNo', 'billDate', 'billAmount', 'qty', 'time'];
  const isSelected = selectedCell.row === rowIndex && colNames.indexOf(colName) === selectedCell.col;

  const baseStyle = {
    ...styles.td,
    textAlign: 'center',
    minWidth: colName === 'salesParty' ? '120px' : 
             colName === 'billNo' ? '100px' :
             colName === 'billDate' ? '100px' :
             colName === 'billAmount' ? '100px' :
             colName === 'time' ? '100px' : '80px',
    width: colName === 'salesParty' ? '120px' : 
           colName === 'billNo' ? '100px' :
           colName === 'billDate' ? '100px' :
           colName === 'billAmount' ? '100px' :
           colName === 'time' ? '100px' : '80px',
    maxWidth: colName === 'salesParty' ? '120px' : 
              colName === 'billNo' ? '100px' :
              colName === 'billDate' ? '100px' :
              colName === 'billAmount' ? '100px' :
              colName === 'time' ? '100px' : '80px',
    cursor: 'default',
  };

  if (isSelected) {
    return { 
      ...baseStyle, 
      backgroundColor: '#f0f8ff',
      outline: '1px solid #1B91DA',
      outlineOffset: '-1px',
    };
  }

  return baseStyle;
};
  return (
    <div style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div>Loading Sales Register Report...</div>
          </div>
        </div>
      )}

      {/* Header Section - Left side: Dates, Right side: Buttons */}
      <div style={styles.headerSection}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: screenSize.isMobile ? '12px' : screenSize.isTablet ? '16px' : '20px',
          flexWrap: screenSize.isMobile ? 'wrap' : 'nowrap',
          width: '100%',
        }}>
          {/* LEFT SIDE: Dates */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
            flexWrap: 'wrap',
          }}>
            {/* From Date - Smaller width only */}
            <div style={{
              ...styles.formField,
              flex: screenSize.isMobile ? '1 0 100%' : '0 1 auto', // Changed to auto for smaller width
              minWidth: screenSize.isMobile ? '100%' : '120px', // Smaller width
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

            {/* To Date - Smaller width only */}
            <div style={{
              ...styles.formField,
              flex: screenSize.isMobile ? '1 0 100%' : '0 1 auto', // Changed to auto for smaller width
              minWidth: screenSize.isMobile ? '100%' : '120px', // Smaller width
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
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div style={styles.tableSection}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, minWidth: '60px', width: '60px', maxWidth: '60px' }}>No</th>
                <th style={{ ...styles.th, minWidth: '120px', width: '120px', maxWidth: '120px' }}>Sales Party</th>
                <th style={{ ...styles.th, minWidth: '100px', width: '100px', maxWidth: '100px' }}>Bill No</th>
                <th style={{ ...styles.th, minWidth: '100px', width: '100px', maxWidth: '100px' }}>Bill Date</th>
                <th style={{ ...styles.th, minWidth: '80px', width: '80px', maxWidth: '80px' }}>Qty</th>
                <th style={{ ...styles.th }}>Sales Return</th>
                <th style={{ ...styles.th }}>Freight Charge</th>
                <th style={{ ...styles.th }}>Service Charge</th>
                <th style={{ ...styles.th }}>Cash</th>
                <th style={{ ...styles.th }}>UPI Amount</th>
                <th style={{ ...styles.th }}>Card Amount</th>
                <th style={{ ...styles.th, minWidth: '100px', width: '100px', maxWidth: '100px' }}>Bill Amount</th>
                {/* <th style={{ ...styles.th, minWidth: '100px', width: '100px', maxWidth: '100px' }}>Time</th> */}
              </tr>
            </thead>
            <tbody>
              {tableLoaded ? (
                salesData.length > 0 ? (
                  salesData.map((row, rowIndex) => (
                    <tr 
                      key={row.id} 
                      style={{ 
                        backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff',
                      }}
                      onClick={() => {
                        const colNames = ['no', 'salesParty', 'billNo', 'billDate', 'billAmount', 'qty', 'time'];
                        const colIndex = colNames.indexOf('no');
                        setSelectedCell({ row: rowIndex, col: colIndex });
                      }}
                    >
                      <td style={getCellStyle(rowIndex, 'no')}>
                        {row.no}
                      </td>
                      <td style={getCellStyle(rowIndex, 'salesParty')}>
                        {row.salesParty}
                      </td>
                      <td style={getCellStyle(rowIndex, 'billNo')}>
                        {row.billNo}
                      </td>
                      <td style={getCellStyle(rowIndex, 'billDate')}>
                        {row.billDate}
                      </td>
                      <td style={getCellStyle(rowIndex, 'qty')}>
                        {row.qty}
                      </td>
                      <td style={getCellStyle(rowIndex, 'salesReturn')}>
                        {row.salesReturn}
                      </td>
                      <td style={getCellStyle(rowIndex, 'freightCharge')}>
                        {row.freightCharge}
                      </td>
                      <td style={getCellStyle(rowIndex, 'serviceCharge')}>
                        {row.serviceCharge}
                      </td>
                      <td style={getCellStyle(rowIndex, 'cash')}>
                        {row.cash}
                      </td>
                      <td style={getCellStyle(rowIndex, 'upiAmount')}>
                        {row.upiAmount}
                      </td>
                      <td style={getCellStyle(rowIndex, 'cardAmount')}>
                        {row.cardAmount}
                      </td>
                      <td style={getCellStyle(rowIndex, 'billAmount')}>
                        {row.billAmount}
                      </td>
                      {/* <td style={getCellStyle(rowIndex, 'time')}>
                        {row.time}
                      </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No records found
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                    {/* <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      Enter search criteria and click "Search" to view sales register entries
                    </td> */}
                  </tr>
              )}
            </tbody>
            {tableLoaded && salesData.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#f0f8ff', borderTop: '2px solid #1B91DA' }}>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    {/* Empty for No column */}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    {/* Empty for Sales Party column */}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#1565c0' }}>
                    Total
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    {/* Empty for Bill Date column */}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#1565c0' }}>
                    ₹{formatNumber(totals.billAmount)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#1565c0' }}>
                    {totals.qty.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Footer Section with Totals - CENTERED - Only Total Bill Amount and Total Quantity */}
      <div style={styles.footerSection}>
        <div style={{
          ...styles.balanceContainer,
          justifyContent: 'center',
          width: '100%',
        }}>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Total Bill Amount</span>
            <span style={styles.balanceValue}>
              ₹{formatNumber(totals.billAmount)}
            </span>
          </div>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Total Quantity</span>
            <span style={styles.balanceValue}>
              {totals.qty.toFixed(2)}
            </span>
          </div>
          {/* Removed: Total Bales */}
          {/* Removed: Total Records */}
        </div>
        <div style={styles.buttonGroup}>
         <PrintButton 
  onClick={handlePrintClick}
  isActive={hasPrintPermission}
  disabled={!hasPrintPermission || salesData.length === 0}
/>

<ExportButton 
  onClick={handleExportClick}
  isActive={hasPrintPermission}
  disabled={!hasPrintPermission || salesData.length === 0}
/>

        </div>
      </div>

      {/* Print Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showPrintConfirm}
        onClose={() => setShowPrintConfirm(false)}
        onConfirm={handlePrintConfirm}
        title="Print Confirmation"
        message="Do you want to print the Sales Register report?"
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
        message="Do you want to export the Sales Register report to Excel?"
        confirmText="Export"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
};

export default SalesRegister;