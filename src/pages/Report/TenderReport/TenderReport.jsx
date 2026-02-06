import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_ENDPOINTS } from '../../../api/endpoints';
import { API_BASE } from '../../../api/apiService';
import { PrintButton, ExportButton } from '../../../components/Buttons/ActionButtons';
import ConfirmationPopup from '../../../components/ConfirmationPopup/ConfirmationPopup';
import { usePrintPermission } from '../../../hooks/usePrintPermission';


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

const TenderReport = () => {

// --- PERMISSIONS ---
const { hasPrintPermission, checkPrintPermission } =
  usePrintPermission('BILL_COLLECTOR_REPORT');


  // --- STATE MANAGEMENT ---
  const currentDate = formatDate(new Date());
  const [fromDate, setFromDate] = useState(currentDate);
  const [toDate, setToDate] = useState(currentDate);
  const [selectedBranches, setSelectedBranches] = useState([]); // Initial value is ALL
  const [showBranchPopup, setShowBranchPopup] = useState(false);
  const [tempSelectedBranches, setTempSelectedBranches] = useState([]); // Initially empty
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false); // Initially false
  const [tableLoaded, setTableLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [branchDisplay, setBranchDisplay] = useState();
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const branchRef = useRef(null);
  const searchButtonRef = useRef(null);

  // --- DATA ---
  const [tenderData, setTenderData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(20);

  // Confirmation popup states
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [searchInvoiceNo, setSearchInvoiceNo] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [apiTotals, setApiTotals] = useState({
    totalGross: 0,
    totalBill: 0,
    totalNet: 0,
    totalCash: 0,
    totalCard: 0,
    totalUpi: 0,
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
    // Single selection logic: just set the selected code
    setTempSelectedBranches([compCode]);
  };

  const handlePopupOk = () => {
    if (tempSelectedBranches.length > 0) {
      const selectedCode = tempSelectedBranches[0];
      setSelectedBranches([selectedCode]);
      
      // Update display text
      const selectedBranch = allBranches.find(b => b.compCode === selectedCode);
      setBranchDisplay(selectedBranch ? selectedBranch.compName : 'ALL');
    } else {
      // If nothing is selected, default to ALL or keep previous
      // For single select, we might want to keep the previous selection if OK is clicked without any change
    }
    
    setShowBranchPopup(false);
  };

  const handleClearSelection = () => {
    setTempSelectedBranches([]);
    setSelectAll(false);
  };

  const handlePopupClose = () => {
    setShowBranchPopup(false);
    setBranchSearchTerm(''); // Clear search term when popup closes
  };

  const handleSearch = async (isNewSearch = true) => {
    // if (!fromDate || !toDate || selectedBranches.length === 0) {
    //   toast.warning('Please fill all fields: From Date, To Date, and select at least one branch', {
    //     autoClose: 2000,
    //   });
    //   return;
    // }
    
    const currentPage = isNewSearch ? 1 : pageNo;
    
    if (isNewSearch) {
      setIsLoading(true);
      setPageNo(1);
      setTenderData([]);
      setHasMore(true);
    } else {
      setIsMoreLoading(true);
    }
    
    try {
      const compCode = selectedBranches.includes('ALL') ? defaultCompCode : selectedBranches[0];
      const apiFromDate = formatDateForAPI(fromDate);
      const apiToDate = formatDateForAPI(toDate);
      
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.BILL_COLLECTOR_REPORT.GET_BILL_COLLECTOR_REPORT(apiFromDate, apiToDate, compCode, currentPage, pageSize, searchInvoiceNo)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const records = data.data || [];
      
      if (isNewSearch) {
        setTenderData(records);
      } else {
        setTenderData(prev => [...prev, ...records]);
      }
      
      if (records.length < pageSize) {
        setHasMore(false);
      } else {
        setPageNo(prev => prev + 1);
      }

      // Calculate totals from cumulative data
      const currentData = isNewSearch ? records : [...tenderData, ...records];
      const totals = currentData.reduce((acc, row) => ({
        totalGross: acc.totalGross + (row.grossAmt || 0),
        totalBill: acc.totalBill + (row.billAmt || 0),
        totalNet: acc.totalNet + (row.netAmt || 0),
        totalCash: acc.totalCash + (row.cashAmt || 0),
        totalCard: acc.totalCard + (row.cardAmt || 0),
        totalUpi: acc.totalUpi + (row.upiAmt || 0),
      }), {
        totalGross: 0,
        totalBill: 0,
        totalNet: 0,
        totalCash: 0,
        totalCard: 0,
        totalUpi: 0,
      });
      setApiTotals(totals);
      
      setTableLoaded(true);
      
      if (isNewSearch && records.length === 0) {
        toast.info('No records found for the selected criteria');
      }
      
    } catch (error) {
      console.error('Error fetching tender report data:', error);
      toast.error('Failed to load report data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
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
    // Reset to current date on refresh
    const today = formatDate(new Date());
    setFromDate(today);
    setToDate(today);
    setSelectedBranches();
    setBranchDisplay();
    setTempSelectedBranches([]);
    setSelectAll(false);
    setTenderData([]);
    setSearchInvoiceNo('');
    setPageNo(1);
    setHasMore(true);
    setApiTotals({
      totalGross: 0,
      totalBill: 0,
      totalNet: 0,
      totalCash: 0,
      totalCard: 0,
      totalUpi: 0,
    });
  };

 const handlePrintClick = () => {
  // 🔒 Permission check FIRST
  if (!checkPrintPermission()) {
    return;
  }

  if (tenderData.length === 0) {
    toast.warning('No data available to print');
    return;
  }

  setShowPrintConfirm(true);
};


  const handleExportClick = () => {
    if (tenderData.length === 0) {
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
  if (!hasPrintPermission) {
    setShowExportConfirm(false);
    return;
  }

  setShowExportConfirm(false);
  await exportToExcel();
};


  const formatNumber = (num) => {
    return parseFloat(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const compCode = selectedBranches.includes('ALL') ? defaultCompCode : selectedBranches[0];
      const apiFromDate = formatDateForAPI(fromDate);
      const apiToDate = formatDateForAPI(toDate);
      
      let allRecords = [];
      let currentPage = 1;
      let hasMoreData = true;
      const fetchPageSize = 100; // Fetch larger chunks
      
      while (hasMoreData) {
        const response = await fetch(`${API_BASE}${API_ENDPOINTS.BILL_COLLECTOR_REPORT.GET_BILL_COLLECTOR_REPORT(apiFromDate, apiToDate, compCode, currentPage, fetchPageSize, searchInvoiceNo)}`);
        
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

      // Calculate totals from all data
      const totals = allData.reduce((acc, row) => ({
        totalGross: acc.totalGross + (parseFloat(row.grossAmt) || 0),
        totalBill: acc.totalBill + (parseFloat(row.billAmt) || 0),
        totalNet: acc.totalNet + (parseFloat(row.netAmt) || 0),
        totalCash: acc.totalCash + (parseFloat(row.cashAmt) || 0),
        totalCard: acc.totalCard + (parseFloat(row.cardAmt) || 0),
        totalUpi: acc.totalUpi + (parseFloat(row.upiAmt) || 0),
      }), {
        totalGross: 0,
        totalBill: 0,
        totalNet: 0,
        totalCash: 0,
        totalCard: 0,
        totalUpi: 0,
      });

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tender Report</title>
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
          <h1>Tender Report</h1>
          <div class="info">
            <p>Period: ${fromDate} to ${toDate}</p>
            <p>Branches: ${branchDisplay || 'All'}</p>
            <p>Total Records: ${allData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Inv No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Gross</th>
                <th>Bill Amt</th>
                <th>Net Amt</th>
                <th>Dis %</th>
                <th>Dis Amt</th>
                <th>Scrap No</th>
                <th>Scrap Amt</th>
                <th>Return No</th>
                <th>Return Amt</th>
                <th>Cash</th>
                <th>Balance</th>
                <th>Card Name</th>
                <th>Card Amt</th>
                <th>UPI Name</th>
                <th>UPI Amt</th>
                <th>Srv Chg</th>
              </tr>
            </thead>
            <tbody>
              ${allData.map((row, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${row.invNo || ''}</td>
                  <td>${row.date ? row.date.replaceAll('-', '/') : ''}</td>
                  <td class="text-left">${row.customer || ''}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.grossAmt) || 0)}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.billAmt) || 0)}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.netAmt) || 0)}</td>
                  <td>${row.disPer || '0'}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.disAmt) || 0)}</td>
                  <td>${row.scrapNo || ''}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.scrapAmt) || 0)}</td>
                  <td>${row.salesReturnNo || ''}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.salesReturnAmt) || 0)}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.cashAmt) || 0)}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.balance) || 0)}</td>
                  <td>${row.cardName || ''}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.cardAmt) || 0)}</td>
                  <td>${row.upiName || ''}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.upiAmt) || 0)}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.serviceChargeAmt) || 0)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" style="text-align: right;"><strong>Total:</strong></td>
                <td class="text-right"><strong>₹${formatNumber(totals.totalGross)}</strong></td>
                <td class="text-right"><strong>₹${formatNumber(totals.totalBill)}</strong></td>
                <td class="text-right"><strong>₹${formatNumber(totals.totalNet)}</strong></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td class="text-right"><strong>₹${formatNumber(totals.totalCash)}</strong></td>
                <td></td>
                <td></td>
                <td class="text-right"><strong>₹${formatNumber(totals.totalCard)}</strong></td>
                <td></td>
                <td class="text-right"><strong>₹${formatNumber(totals.totalUpi)}</strong></td>
                <td></td>
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

      // Calculate totals from all data
      const totals = allData.reduce((acc, row) => ({
        totalGross: acc.totalGross + (parseFloat(row.grossAmt) || 0),
        totalBill: acc.totalBill + (parseFloat(row.billAmt) || 0),
        totalNet: acc.totalNet + (parseFloat(row.netAmt) || 0),
        totalCash: acc.totalCash + (parseFloat(row.cashAmt) || 0),
        totalCard: acc.totalCard + (parseFloat(row.cardAmt) || 0),
        totalUpi: acc.totalUpi + (parseFloat(row.upiAmt) || 0),
      }), {
        totalGross: 0,
        totalBill: 0,
        totalNet: 0,
        totalCash: 0,
        totalCard: 0,
        totalUpi: 0,
      });

      let csvContent = 'Tender Report\n';
      csvContent += `Period: ${fromDate} to ${toDate}\n`;
      csvContent += `Branches: ${branchDisplay || 'All'}\n`;
      csvContent += `Total Records: ${allData.length}\n\n`;
      
      csvContent += 'No,Inv No,Date,Customer,Gross,Bill Amt,Net Amt,Dis %,Dis Amt,Scrap No,Scrap Amt,Return No,Return Amt,Cash,Balance,Card Name,Card Amt,UPI Name,UPI Amt,Srv Chg\n';
      
      allData.forEach((row, index) => {
        const grossAmt = parseFloat(row.grossAmt) || 0;
        const billAmt = parseFloat(row.billAmt) || 0;
        const netAmt = parseFloat(row.netAmt) || 0;
        const disAmt = parseFloat(row.disAmt) || 0;
        const scrapAmt = parseFloat(row.scrapAmt) || 0;
        const salesReturnAmt = parseFloat(row.salesReturnAmt) || 0;
        const cashAmt = parseFloat(row.cashAmt) || 0;
        const balance = parseFloat(row.balance) || 0;
        const cardAmt = parseFloat(row.cardAmt) || 0;
        const upiAmt = parseFloat(row.upiAmt) || 0;
        const serviceChargeAmt = parseFloat(row.serviceChargeAmt) || 0;
        
        const date = row.date ? row.date.replaceAll('-', '/') : '';
        
        csvContent += `${index + 1},${row.invNo || ''},${date},"${row.customer || ''}",${grossAmt.toFixed(2)},${billAmt.toFixed(2)},${netAmt.toFixed(2)},${row.disPer || '0'},${disAmt.toFixed(2)},${row.scrapNo || ''},${scrapAmt.toFixed(2)},${row.salesReturnNo || ''},${salesReturnAmt.toFixed(2)},${cashAmt.toFixed(2)},${balance.toFixed(2)},${row.cardName || ''},${cardAmt.toFixed(2)},${row.upiName || ''},${upiAmt.toFixed(2)},${serviceChargeAmt.toFixed(2)}\n`;
      });
      
      csvContent += `,,,Total,${totals.totalGross.toFixed(2)},${totals.totalBill.toFixed(2)},${totals.totalNet.toFixed(2)},,,,,,,${totals.totalCash.toFixed(2)},,,,${totals.totalCard.toFixed(2)},,${totals.totalUpi.toFixed(2)},\n`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Tender_Report_${fromDate}_to_${toDate}.csv`);
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
          branchRef.current?.focus();
          break;
        case 'branch':
          // Move focus to search invoice or directly to search button
          document.querySelector('[data-header="searchInvoiceNo"]')?.focus();
          break;
        case 'searchInvoiceNo':
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
      borderRadius: '6px',
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
      backgroundColor: '#eaf6ff',
      border: '1.5px solid #1B91DA',
      color: '#1B91DA',
    },
    branchCheckbox: {
      width: '18px',
      height: '18px',
      border: '2px solid #1B91DA',
      borderRadius: '4px', // square
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
      borderRadius: '4px', // square
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
      fontSize: '12px',
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

  // Calculate totals from cumulative data
  const { totalGross, totalBill, totalNet, totalCash, totalCard, totalUpi } = apiTotals;

  return (
    <div style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div>Loading Tender Report...</div>
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
              minWidth: screenSize.isMobile ? '100%' : '180px',
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

            {/* Search Invoice No */}
            <div style={{
              ...styles.formField,
              minWidth: screenSize.isMobile ? '100%' : '180px',
            }}>
              <label style={styles.inlineLabel}>Search:</label>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"                
                  data-header="searchInvoiceNo"
                  style={{
                    ...(focusedField === 'searchInvoiceNo' ? styles.inlineInputFocused : styles.inlineInput),
                    paddingRight: '35px'
                  }}
                  value={searchInvoiceNo}
                  onChange={(e) => setSearchInvoiceNo(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'searchInvoiceNo')}
                  onFocus={() => setFocusedField('searchInvoiceNo')}
                  onBlur={() => setFocusedField('')}
                />
                <div style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }}>
                  <SearchIcon size={16} color="#6b7280" />
                </div>
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
      <div style={styles.tableSection} onScroll={handleScroll}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, minWidth: '100px' }}>Inv No</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Date</th>
                <th style={{ ...styles.th, minWidth: '150px' }}>Customer</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Gross</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Bill Amt</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Net Amt</th>
                <th style={{ ...styles.th, minWidth: '80px' }}>Dis %</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Dis Amt</th>
                <th style={{ ...styles.th, minWidth: '120px' }}>Scrap No</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Scrap Amt</th>
                <th style={{ ...styles.th, minWidth: '120px' }}>Return No</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Return Amt</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Cash</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Balance</th>
                <th style={{ ...styles.th, minWidth: '120px' }}>Card Name</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Card Amt</th>
                <th style={{ ...styles.th, minWidth: '120px' }}>UPI Name</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>UPI Amt</th>
                <th style={{ ...styles.th, minWidth: '100px' }}>Srv Chg</th>
              </tr>
            </thead>
            <tbody>
              {tableLoaded ? (
                tenderData.length > 0 ? (
                  tenderData.map((row, index) => (
                    <tr key={index} style={{ 
                      backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                    }}>
                      <td style={styles.td}>{row.invNo}</td>
                      <td style={styles.td}>{row.date?.replaceAll('-', '/')}</td>
                      <td style={{ ...styles.td, textAlign: 'left' }}>{row.customer}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.grossAmt?.toFixed(2)}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.billAmt?.toFixed(2)}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.netAmt?.toFixed(2)}</td>
                      <td style={styles.td}>{row.disPer}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.disAmt?.toFixed(2)}</td>
                      <td style={styles.td}>{row.scrapNo}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.scrapAmt?.toFixed(2)}</td>
                      <td style={styles.td}>{row.salesReturnNo}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.salesReturnAmt?.toFixed(2)}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.cashAmt?.toFixed(2)}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.balance?.toFixed(2)}</td>
                      <td style={styles.td}>{row.cardName}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.cardAmt?.toFixed(2)}</td>
                      <td style={styles.td}>{row.upiName}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.upiAmt?.toFixed(2)}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.serviceChargeAmt?.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="19" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No records found
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  {/* <td colSpan="19" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Click "Search" to view tender records
                  </td> */}
                </tr>
              )}
              {isMoreLoading && (
                <tr>
                  <td colSpan="19" style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f0f8ff' }}>
                    Loading more...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Section with Totals - CENTERED */}
      {tableLoaded && tenderData.length > 0 && (
        <div style={styles.footerSection}>
          <div style={{
            ...styles.balanceContainer,
            justifyContent: 'center',
            width: '100%',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={styles.balanceItem}>
              <span style={styles.balanceLabel}>Gross Amt</span>
              <span style={styles.balanceValue}>
                ₹{totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div style={styles.balanceItem}>
              <span style={styles.balanceLabel}>Bill Amt</span>
              <span style={styles.balanceValue}>
                ₹{totalBill.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div style={styles.balanceItem}>
              <span style={styles.balanceLabel}>Net Amt</span>
              <span style={styles.balanceValue}>
                ₹{totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div style={styles.balanceItem}>
              <span style={styles.balanceLabel}>Cash</span>
              <span style={styles.balanceValue}>
                ₹{totalCash.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div style={styles.balanceItem}>
              <span style={styles.balanceLabel}>Card</span>
              <span style={styles.balanceValue}>
                ₹{totalCard.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div style={styles.balanceItem}>
              <span style={styles.balanceLabel}>UPI</span>
              <span style={styles.balanceValue}>
                ₹{totalUpi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
               <div style={styles.buttonGroup}>
           <PrintButton 
  onClick={handlePrintClick}
  isActive={hasPrintPermission}
  disabled={!hasPrintPermission || tenderData.length === 0}
/>

<ExportButton 
  onClick={handleExportClick}
  isActive={hasPrintPermission}
  disabled={!hasPrintPermission || tenderData.length === 0}
/>

          </div>
          </div>
       
        </div>
      )}

      {/* Print Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showPrintConfirm}
        onClose={() => setShowPrintConfirm(false)}
        onConfirm={handlePrintConfirm}
        title="Print Confirmation"
        message="Do you want to print the Tender Report?"
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
        message="Do you want to export the Tender Report to Excel?"
        confirmText="Export"
        cancelText="Cancel"
        type="info"
      />

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
            
            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search branches..."
                value={branchSearchTerm}
                onChange={(e) => setBranchSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.branchList}>
              {/* ALL option - Initially UNCHECKED */}
             
              {/* Individual branches - Initially UNCHECKED */}
              {allBranches
                .filter(b => b.compCode !== 'ALL')
                .filter(branch => 
                  branch.compName.toLowerCase().includes(branchSearchTerm.toLowerCase())
                )
                .map((branch) => {
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

export default TenderReport;
      





