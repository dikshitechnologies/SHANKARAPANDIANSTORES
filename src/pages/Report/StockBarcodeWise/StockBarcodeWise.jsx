import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_ENDPOINTS } from '../../../api/endpoints';
import { API_BASE } from '../../../api/apiService';
import { PrintButton, ExportButton } from '../../../components/Buttons/ActionButtons';
import ConfirmationPopup from '../../../components/ConfirmationPopup/ConfirmationPopup';

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

const StockBarcodeWise = () => {
  // --- STATE MANAGEMENT ---
  const currentDate = formatDate(new Date());
  const [fromDate, setFromDate] = useState(currentDate);
  const [toDate, setToDate] = useState(currentDate);
  const [selectedBranches, setSelectedBranches] = useState(['001']); // Default to branch 001
  const [showBranchPopup, setShowBranchPopup] = useState(false);
  const [tempSelectedBranches, setTempSelectedBranches] = useState(['001']);
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [tableLoaded, setTableLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [branchDisplay, setBranchDisplay] = useState('Branch 001');
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [searchItemNamePrefixNo, setSearchItemNamePrefixNo] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchButtonRef = useRef(null);

  // --- DATA ---
  const [stockBarcodeData, setStockBarcodeData] = useState([]);
  const [pageNo, setPageNo] = useState(1);

  // Confirmation popup states
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [pageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [apiTotals, setApiTotals] = useState({
    totalQty: 0,
    totalStockValue: 0,
    totalAStockValue: 0,
  });

  const [allBranches, setAllBranches] = useState([
    { code: '001', name: 'Branch 001' },
    { code: '002', name: 'Branch 002' },
  ]);

  // Focus on fromDate field when component mounts
  useEffect(() => {
    if (fromDateRef.current) {
      fromDateRef.current.focus();
    }
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchItemNamePrefixNo);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchItemNamePrefixNo]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (tableLoaded) {
      handleSearch(true);
    }
  }, [debouncedSearchTerm]);

  // --- HANDLERS ---
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handleSearchItemNamePrefixNoChange = (e) => {
    setSearchItemNamePrefixNo(e.target.value);
  };

  const handleBranchPopupOpen = () => {
    setTempSelectedBranches(selectedBranches);
    setShowBranchPopup(true);
  };

  const handleBranchPopupClose = () => {
    setShowBranchPopup(false);
  };

  const handleBranchSelect = (branchCode) => {
    setTempSelectedBranches(prev => {
      if (prev.includes(branchCode)) {
        return prev.filter(b => b !== branchCode);
      } else {
        return [...prev, branchCode];
      }
    });
  };

  const handleBranchSelectAll = () => {
    if (selectAll) {
      setTempSelectedBranches([]);
      setSelectAll(false);
    } else {
      const allBranchCodes = allBranches.map(b => b.code);
      setTempSelectedBranches(allBranchCodes);
      setSelectAll(true);
    }
  };

  const handleClearSelection = () => {
    setTempSelectedBranches([]);
    setSelectAll(false);
  };

  const handleBranchPopupOk = () => {
    if (tempSelectedBranches.length === 0) {
      toast.warning('Please select at least one branch', {
        autoClose: 2000,
      });
      return;
    }
    
    setSelectedBranches(tempSelectedBranches);
    
    // Update branch display text
    if (tempSelectedBranches.length === allBranches.length) {
      setBranchDisplay('All Branches');
    } else if (tempSelectedBranches.length === 1) {
      const selectedBranch = allBranches.find(b => b.code === tempSelectedBranches[0]);
      setBranchDisplay(selectedBranch ? selectedBranch.name : 'Branch');
    } else {
      setBranchDisplay(`${tempSelectedBranches.length} Branches Selected`);
    }
    
    setShowBranchPopup(false);
  };

  const handleSearch = async (isNewSearch = true) => {
    if (!fromDate || !toDate || selectedBranches.length === 0) {
      toast.warning('Please fill all fields: From Date, To Date, and select at least one branch', {
        autoClose: 2000,
      });
      return;
    }
    
    const currentPage = isNewSearch ? 1 : pageNo;
    
    if (isNewSearch) {
      setIsLoading(true);
      setPageNo(1);
      setStockBarcodeData([]);
      setHasMore(true);
    } else {
      setIsMoreLoading(true);
    }
    
    try {
      const compCode = selectedBranches[0]; // Take first selected branch
      const apiFromDate = formatDateForAPI(fromDate);
      const apiToDate = formatDateForAPI(toDate);
      const searchTerm = debouncedSearchTerm.trim();
      
      const response = await fetch(
        `${API_BASE}${API_ENDPOINTS.STOCK_BARCODE_WISE.GET_STOCK_BARCODE_WISE(
          apiFromDate,
          apiToDate,
          compCode, 
          searchTerm,
          currentPage, 
          pageSize
        )}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const records = data.data || [];
      
      // Calculate totals
      if (isNewSearch) {
        const totals = records.reduce((acc, record) => ({
          totalQty: acc.totalQty + (record.qty || 0),
          totalStockValue: acc.totalStockValue + (record.stockValue || 0),
          totalAStockValue: acc.totalAStockValue + (record.aStockValue || 0),
        }), { totalQty: 0, totalStockValue: 0, totalAStockValue: 0 });
        
        setApiTotals(totals);
      }
      
      if (isNewSearch) {
        setStockBarcodeData(records);
      } else {
        setStockBarcodeData(prev => [...prev, ...records]);
      }
      
      // Check if there are more records
      const totalRecords = data.pagination?.totalRecords || 0;
      const currentTotal = isNewSearch ? records.length : stockBarcodeData.length + records.length;
      
      if (currentTotal >= totalRecords || records.length < pageSize) {
        setHasMore(false);
      } else {
        if (!isNewSearch) {
          setPageNo(prev => prev + 1);
        }
      }
      
      setTableLoaded(true);
      
      if (isNewSearch && records.length === 0) {
        toast.info('No records found for the selected criteria');
      }
      
    } catch (error) {
      console.error('Error fetching stock barcode data:', error);
      toast.error('Failed to load report data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore && !isMoreLoading) {
      handleSearch(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoading) {
      loadMore();
    }
  };

  const handleRefresh = () => {
    setTableLoaded(false);
    const today = formatDate(new Date());
    setFromDate(today);
    setToDate(today);
    setSelectedBranches(['001']);
    setBranchDisplay('Branch 001');
    setTempSelectedBranches(['001']);
    setSelectAll(false);
    setStockBarcodeData([]);
    setSearchItemNamePrefixNo('');
    setDebouncedSearchTerm('');
    setPageNo(1);
    setHasMore(true);
    setApiTotals({
      totalQty: 0,
      totalStockValue: 0,
      totalAStockValue: 0,
    });
  };

  const handlePrintClick = () => {
    if (stockBarcodeData.length === 0) {
      toast.warning('No data available to print');
      return;
    }
    setShowPrintConfirm(true);
  };

  const handleExportClick = () => {
    if (stockBarcodeData.length === 0) {
      toast.warning('No data available to export');
      return;
    }
    setShowExportConfirm(true);
  };

  const handlePrintConfirm = async () => {
    setShowPrintConfirm(false);
    await generatePDF();
  };

  const handleExportConfirm = async () => {
    setShowExportConfirm(false);
    await exportToExcel();
  };

  const formatNumber = (num) => {
    return parseFloat(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const compCode = selectedBranches[0];
      const apiFromDate = formatDateForAPI(fromDate);
      const apiToDate = formatDateForAPI(toDate);
      const searchTerm = debouncedSearchTerm.trim();
      
      let allRecords = [];
      let currentPage = 1;
      let hasMoreData = true;
      const fetchPageSize = 100;
      
      while (hasMoreData) {
        const response = await fetch(
          `${API_BASE}${API_ENDPOINTS.STOCK_BARCODE_WISE.GET_STOCK_BARCODE_WISE(
            apiFromDate,
            apiToDate,
            compCode,
            searchTerm,
            currentPage,
            fetchPageSize
          )}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const records = data.data || [];
        
        allRecords = [...allRecords, ...records];
        
        if (records.length < fetchPageSize) {
          hasMoreData = false;
        } else {
          currentPage++;
        }
      }
      
      setIsLoading(false);
      return allRecords;
    } catch (error) {
      console.error('Error fetching all data:', error);
      setIsLoading(false);
      toast.error('Failed to fetch all data for export');
      return [];
    }
  };

  const generatePDF = async () => {
    try {
      const allData = await fetchAllData();
      
      if (allData.length === 0) {
        toast.warning('No data available to print');
        return;
      }

      const totals = allData.reduce((acc, record) => ({
        totalQty: acc.totalQty + (parseFloat(record.qty) || 0),
        totalStockValue: acc.totalStockValue + (parseFloat(record.stockValue) || 0),
        totalAStockValue: acc.totalAStockValue + (parseFloat(record.aStockValue) || 0),
      }), { totalQty: 0, totalStockValue: 0, totalAStockValue: 0 });

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Stock Barcode Wise Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #1B91DA; }
            .info { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 9px; }
            th { background-color: #1B91DA; color: white; padding: 8px; text-align: center; font-size: 9px; }
            td { padding: 6px; border: 1px solid #ddd; text-align: center; font-size: 9px; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total-row { background-color: #e3f2fd; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Stock Barcode Wise Report</h1>
          <div class="info">
            <p>Period: ${fromDate} to ${toDate}</p>
            <p>Branches: ${branchDisplay}</p>
            <p>Total Records: ${allData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Prefix</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>ACost</th>
                <th>SRate</th>
                <th>ASRate</th>
                <th>Stock Value</th>
                <th>AStock Value</th>
              </tr>
            </thead>
            <tbody>
              ${allData.map((row, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td class="text-left">${row.itemName || ''}</td>
                  <td>${row.prefix || ''}</td>
                  <td class="text-right">${(parseFloat(row.qty) || 0).toLocaleString()}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.rate) || 0)}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.aCost) || 0)}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.sRate) || 0)}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.asRate) || 0)}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.stockValue) || 0)}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.aStockValue) || 0)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                <td class="text-right"><strong>${totals.totalQty.toLocaleString()}</strong></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td class="text-right"><strong>₹${formatNumber(totals.totalStockValue)}</strong></td>
                <td class="text-right"><strong>₹${formatNumber(totals.totalAStockValue)}</strong></td>
              </tr>
            </tbody>
          </table>
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

  const exportToExcel = async () => {
    try {
      const allData = await fetchAllData();
      
      if (allData.length === 0) {
        toast.warning('No data available to export');
        return;
      }

      const totals = allData.reduce((acc, record) => ({
        totalQty: acc.totalQty + (parseFloat(record.qty) || 0),
        totalStockValue: acc.totalStockValue + (parseFloat(record.stockValue) || 0),
        totalAStockValue: acc.totalAStockValue + (parseFloat(record.aStockValue) || 0),
      }), { totalQty: 0, totalStockValue: 0, totalAStockValue: 0 });

      let csvContent = 'Stock Barcode Wise Report\n';
      csvContent += `Period: ${fromDate} to ${toDate}\n`;
      csvContent += `Branches: ${branchDisplay}\n`;
      csvContent += `Total Records: ${allData.length}\n\n`;
      
      csvContent += 'S.No,Item Name,Prefix,Qty,Rate,ACost,SRate,ASRate,Stock Value,AStock Value\n';
      
      allData.forEach((row, index) => {
        const qty = parseFloat(row.qty) || 0;
        const rate = parseFloat(row.rate) || 0;
        const aCost = parseFloat(row.aCost) || 0;
        const sRate = parseFloat(row.sRate) || 0;
        const asRate = parseFloat(row.asRate) || 0;
        const stockValue = parseFloat(row.stockValue) || 0;
        const aStockValue = parseFloat(row.aStockValue) || 0;
        
        csvContent += `${index + 1},"${row.itemName || ''}",${row.prefix || ''},${qty},${rate.toFixed(2)},${aCost.toFixed(2)},${sRate.toFixed(2)},${asRate.toFixed(2)},${stockValue.toFixed(2)},${aStockValue.toFixed(2)}\n`;
      });
      
      csvContent += `,,Total,${totals.totalQty.toLocaleString()},,,,,,${totals.totalStockValue.toFixed(2)},${totals.totalAStockValue.toFixed(2)}\n`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Stock_Barcode_Wise_${fromDate}_to_${toDate}.csv`);
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
          searchInputRef.current?.focus();
          break;
        case 'searchItemNamePrefixNo':
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
      height: '85vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
    //   overflowX: 'hidden',
    //   overflowY: 'hidden',
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
    //   overflow: 'auto',
    //   WebkitOverflowScrolling: 'touch',
    },
    formField: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '4px' : screenSize.isTablet ? '6px' : '8px',
    },
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
      minWidth: screenSize.isMobile ? '90px' : screenSize.isTablet ? '100px' : '110px',
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
      minWidth: screenSize.isMobile ? '90px' : screenSize.isTablet ? '100px' : '110px',
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
    //   WebkitOverflowScrolling: 'touch',
      width: screenSize.isMobile ? 'calc(100% - 12px)' : screenSize.isTablet ? 'calc(100% - 20px)' : 'calc(100% - 32px)',
      boxSizing: 'border-box',
      flex: 'none',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: screenSize.isMobile ? '300px' : screenSize.isTablet ? '350px' : '400px',
      minHeight: screenSize.isMobile ? '200px' : screenSize.isTablet ? '250px' : '90%',
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
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      padding: screenSize.isMobile ? '5px 3px' : screenSize.isTablet ? '7px 5px' : '10px 6px',
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
      minWidth: screenSize.isMobile ? '140px' : screenSize.isTablet ? '160px' : '180px',
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
      minWidth: screenSize.isMobile ? '140px' : screenSize.isTablet ? '160px' : '180px',
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
    },
    searchContainer: {
      padding: '15px 20px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#f8f9fa',
    },
    searchInput: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily,
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxSizing: 'border-box',
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
      borderRadius: '50%',
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
      borderRadius: '50%',
      marginRight: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backgroundColor: '#1B91DA',
    },
    checkmark: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: 'white',
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
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      marginLeft: 'auto',
      alignItems: 'center',
    },
  };

  return (
    <div style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div>Loading Stock Barcode Report...</div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: screenSize.isMobile ? '12px' : screenSize.isTablet ? '16px' : '20px',
          flexWrap: screenSize.isMobile ? 'wrap' : 'nowrap',
          width: '100%',
        }}>
          {/* LEFT SIDE: Dates and Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
            flexWrap: 'wrap',
          }}>
            {/* From Date */}
            <div style={{
              ...styles.formField,
              minWidth: screenSize.isMobile ? 'calc(50% - 6px)' : 'auto',
            }}>
              <label style={styles.inlineLabel}>From Date:</label>
              <input
                type="date"
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

            {/* To Date */}
            <div style={{
              ...styles.formField,
              minWidth: screenSize.isMobile ? 'calc(50% - 6px)' : 'auto',
            }}>
              <label style={styles.inlineLabel}>To Date:</label>
              <input
                type="date"
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

            {/* Search itemname/prefix */}
            <div style={{
              ...styles.formField,
              minWidth: screenSize.isMobile ? '100%' : '180px',
            }}>
              <label style={styles.inlineLabel}>Search:</label>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                //   placeholder="Item Name or Prefix"
                  style={{
                    ...(focusedField === 'searchItemNamePrefixNo' ? styles.inlineInputFocused : styles.inlineInput),
                    paddingRight: '35px'
                  }}
                  value={searchItemNamePrefixNo}
                  onChange={handleSearchItemNamePrefixNoChange}
                  onKeyDown={(e) => handleKeyDown(e, 'searchItemNamePrefixNo')}
                  onFocus={() => setFocusedField('searchItemNamePrefixNo')}
                  onBlur={() => setFocusedField('')}
                  ref={searchInputRef}
                />
                <div style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }}>
                  <SearchIcon size={16} color="#6b7280" />
                </div>
              </div>
            </div>
          </div>

          {/* Spacer */}
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
              onClick={() => handleSearch(true)}
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
              ref={searchButtonRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(true);
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
      <div style={styles.tableSection} >
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, minWidth: '60px' }}>S.No</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Item Name</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Prefix</th>
                <th style={{ ...styles.th, minWidth: '80px' }}>Qty</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Rate</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>ACost</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>SRate</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>ASRate</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Stock Value</th>
                <th style={{ ...styles.th, minWidth: '120px' }}>AStock Value</th>
              </tr>
            </thead>
            <tbody>
              {tableLoaded ? (
                stockBarcodeData.length > 0 ? (
                  stockBarcodeData.map((row, index) => (
                    <tr key={index} style={{ 
                      backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                    }}>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ ...styles.td, textAlign: 'left', minWidth: '150px' }}>{row.itemName}</td>
                      <td style={styles.td}>{row.prefix}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.qty?.toLocaleString()}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.rate?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.aCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.sRate?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.asRate?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold', color: '#1976d2' }}>
                        {row.stockValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold', color: '#2e7d32' }}>
                        {row.aStockValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No records found
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    {/* Click "Search" to view stock barcode records */}
                  </td>
                </tr>
              )}
              {isMoreLoading && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f0f8ff' }}>
                    Loading more...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Section with Totals */}
      {tableLoaded && stockBarcodeData.length > 0 && (
        <div style={styles.footerSection}>
          {/* <div style={styles.balanceContainer}>
            <div style={styles.balanceItem}>
              <div style={styles.balanceLabel}>Total Qty</div>
              <div style={styles.balanceValue}>{apiTotals.totalQty.toLocaleString()}</div>
            </div>
            <div style={styles.balanceItem}>
              <div style={styles.balanceLabel}>Stock Value</div>
              <div style={styles.balanceValue}>
                {apiTotals.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={styles.balanceItem}>
              <div style={styles.balanceLabel}>AStock Value</div>
              <div style={styles.balanceValue}>
                {apiTotals.totalAStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div> */}
          <div style={styles.buttonGroup}>
            <PrintButton 
              onClick={handlePrintClick}
              isActive={true}
              disabled={stockBarcodeData.length === 0}
            />
            <ExportButton 
              onClick={handleExportClick}
              isActive={true}
              disabled={stockBarcodeData.length === 0}
            />
          </div>
        </div>
      )}

      {/* Print Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showPrintConfirm}
        onClose={() => setShowPrintConfirm(false)}
        onConfirm={handlePrintConfirm}
        title="Print Confirmation"
        message="Do you want to print the Stock Barcode Wise report?"
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
        message="Do you want to export the Stock Barcode Wise report to Excel?"
        confirmText="Export"
        cancelText="Cancel"
        type="info"
      />

      {/* Branch Selection Popup */}
      {showBranchPopup && (
        <div style={styles.popupOverlay} onClick={handleBranchPopupClose}>
          <div style={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popupHeader}>
              Select Branches
              <button style={styles.closeButton} onClick={handleBranchPopupClose}>
                ×
              </button>
            </div>
            
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search branches..."
                style={styles.searchInput}
                value={branchSearchTerm}
                onChange={(e) => setBranchSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={styles.branchList}>
              <div 
                style={selectAll ? styles.selectedBranchItem : styles.branchItem}
                onClick={handleBranchSelectAll}
              >
                <div style={selectAll ? styles.selectedBranchCheckbox : styles.branchCheckbox}>
                  {selectAll && <div style={styles.checkmark}></div>}
                </div>
                <div style={styles.branchText}>All Branches</div>
              </div>
              
              {allBranches
                .filter(branch => 
                  branch.name.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
                  branch.code.includes(branchSearchTerm)
                )
                .map(branch => (
                  <div 
                    key={branch.code}
                    style={tempSelectedBranches.includes(branch.code) ? styles.selectedBranchItem : styles.branchItem}
                    onClick={() => handleBranchSelect(branch.code)}
                  >
                    <div style={tempSelectedBranches.includes(branch.code) ? styles.selectedBranchCheckbox : styles.branchCheckbox}>
                      {tempSelectedBranches.includes(branch.code) && <div style={styles.checkmark}></div>}
                    </div>
                    <div style={styles.branchText}>{branch.name}</div>
                  </div>
                ))}
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
                  onClick={handleBranchPopupOk}
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

export default StockBarcodeWise;