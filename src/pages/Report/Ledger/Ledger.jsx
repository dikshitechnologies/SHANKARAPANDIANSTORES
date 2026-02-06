import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { get } from '../../../api/apiService';
import { API_ENDPOINTS } from '../../../api/endpoints';
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

const Ledger = () => {
  // --- PERMISSIONS ---
const { hasPrintPermission, checkPrintPermission } =
  usePrintPermission('LEDGER');


  // --- STATE MANAGEMENT ---
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [party, setParty] = useState('');
  const [partyCode, setPartyCode] = useState('');
  const [company, setCompany] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [tableLoaded, setTableLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState({ debit: 0, credit: 0 });
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });
  
  // Confirmation popup states
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  
  // Popup states for Party
  const [showPartyPopup, setShowPartyPopup] = useState(false);
  const [tempSelectedParty, setTempSelectedParty] = useState('');
  const [tempSelectedPartyCode, setTempSelectedPartyCode] = useState('');
  const [partyDisplay, setPartyDisplay] = useState('Select Party');
  const [partySearchText, setPartySearchText] = useState('');
  const [partyPage, setPartyPage] = useState(1);
  const [partyPageSize] = useState(100);
  const [hasMoreParties, setHasMoreParties] = useState(true);
  const partyListRef = useRef(null);
  
  // Popup states for Company
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [tempSelectedCompany, setTempSelectedCompany] = useState([]);
  const [tempSelectedCompanyCode, setTempSelectedCompanyCode] = useState([]);
  const [companyDisplay, setCompanyDisplay] = useState('Select Company');

  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const partyRef = useRef(null);
  const companyRef = useRef(null);
  const searchButtonRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const partySearchInputRef = useRef(null);

  // --- DATA ---
  const [ledgerData, setLedgerData] = useState([]);
  const [allParties, setAllParties] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);

  // Set current date on initial load
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${year}-${month}-${day}`;
    
    setFromDate(formattedToday);
    setToDate(formattedToday);
  }, []);

  // Set initial focus on fromDate
  useEffect(() => {
    if (fromDateRef.current) {
      fromDateRef.current.focus();
    }
  }, []);

  // Focus on party search input when popup opens
  useEffect(() => {
    if (showPartyPopup && partySearchInputRef.current) {
      setTimeout(() => {
        partySearchInputRef.current?.focus();
      }, 100);
    }
  }, [showPartyPopup]);

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

  // Fetch parties when popup opens or search changes (with debounce for search)
  useEffect(() => {
    if (showPartyPopup) {
      // Clear existing timeout
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      
      // If search text is being typed, debounce it
      if (partySearchText) {
        searchDebounceRef.current = setTimeout(() => {
          fetchParties(true);
        }, 300); // 300ms debounce
      } else {
        // No search text, fetch immediately
        fetchParties(true);
      }
    }
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [showPartyPopup, partySearchText]);

  const fetchParties = async (resetData = false) => {
    try {
      setIsLoading(true);
      const currentPage = resetData ? 1 : partyPage;
      const response = await get(API_ENDPOINTS.LEDGER.PARTY_LIST(currentPage, partyPageSize, partySearchText));
      if (response.status === 'success' && response.data) {
        if (resetData) {
          setAllParties(response.data);
          setPartyPage(1);
        } else {
          setAllParties(prev => [...prev, ...response.data]);
        }
        if (response.pagination) {
          setHasMoreParties(currentPage < response.pagination.totalPages);
        } else {
          setHasMoreParties(false);
        }
      }
    } catch (error) {
      toast.error('Failed to load parties');
      console.error('Error fetching parties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handlePartyClick = () => {
    setTempSelectedParty(party);
    setTempSelectedPartyCode(partyCode);
    setPartySearchText('');
    setPartyPage(1);
    setShowPartyPopup(true);
  };

  const handlePartyKeyDown = (e) => {
    // Check if it's a printable character (letter, number, space, etc.)
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      setTempSelectedParty(party);
      setTempSelectedPartyCode(partyCode);
      setPartySearchText(e.key);
      setPartyPage(1);
      setShowPartyPopup(true);
    } else if (e.key === 'Enter') {
      handleKeyDown(e, 'party');
      if (!showPartyPopup) {
        handlePartyClick();
      }
    }
  };

  const handleCompanyClick = () => {
    setTempSelectedCompany(Array.isArray(company) ? company : (company ? [company] : []));
    setTempSelectedCompanyCode(Array.isArray(companyCode) ? companyCode : (companyCode ? [companyCode] : []));
    setShowCompanyPopup(true);
  };

  const handleCompanyKeyDown = (e) => {
    // Check if it's a printable character (letter, number, space, etc.)
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      setTempSelectedCompany(company);
      setTempSelectedCompanyCode(companyCode);
      setShowCompanyPopup(true);
    } else if (e.key === 'Enter') {
      handleKeyDown(e, 'company');
      if (!showCompanyPopup) {
        handleCompanyClick();
      }
    }
  };

  const handlePartySelect = (selectedParty) => {
    setTempSelectedParty(selectedParty.fAcname);
    setTempSelectedPartyCode(selectedParty.fCode);
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

  const handlePartyPopupOk = () => {
    setParty(tempSelectedParty);
    setPartyCode(tempSelectedPartyCode);
    setPartyDisplay(tempSelectedParty || 'Select Party');
    setShowPartyPopup(false);
    // Move focus to company field after selecting party
    setTimeout(() => {
      companyRef.current?.focus();
    }, 100);
  };

  const handleCompanyPopupOk = () => {
    setCompany(tempSelectedCompany);
    setCompanyCode(tempSelectedCompanyCode);
    if (tempSelectedCompany.length === 0) {
      setCompanyDisplay('Select Company');
    } else if (tempSelectedCompany.length === allCompanies.length) {
      setCompanyDisplay('ALL');
    } else {
      setCompanyDisplay(tempSelectedCompany.join(', '));
    }
    setShowCompanyPopup(false);
    // Move focus to search button after selecting company
    setTimeout(() => {
      searchButtonRef.current?.focus();
    }, 100);
  };

  const handlePartyPopupClose = () => {
    setShowPartyPopup(false);
  };

  const handleCompanyPopupClose = () => {
    setShowCompanyPopup(false);
  };

  const handlePartyClearSelection = () => {
    setTempSelectedParty('');
    setTempSelectedPartyCode('');
  };

  const handleCompanyClearSelection = () => {
    setTempSelectedCompany([]);
    setTempSelectedCompanyCode([]);
  };

  const handlePartySearch = (e) => {
    setPartySearchText(e.target.value);
    setPartyPage(1);
  };

  const handlePartyScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
    if (bottom && !isLoading && hasMoreParties) {
      setPartyPage(prev => {
        const nextPage = prev + 1;
        fetchParties(false);
        return nextPage;
      });
    }
  };

  const handleSearch = async () => {
    if (!party || !company) {
      toast.warning('Please select both Party and Company', {
        autoClose: 2000,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Convert companyCode array to string (take first company if multiple selected)
      const compCodeParam = Array.isArray(companyCode) 
        ? (companyCode.length > 0 ? companyCode[0] : '') 
        : companyCode;
      
      const response = await get(API_ENDPOINTS.LEDGER.GET_LEDGER(
        partyCode,
        compCodeParam,
        fromDate,
        toDate
      ));
      
      if (response.status === 'success') {
        // Map API response to ledger data
        const mappedData = response.transactions.map((txn) => ({
          date: txn.date,
          name: txn.party,
          voucherNo: txn.vrNo,
          type: txn.type,
          crDr: txn.debit > 0 ? 'Dr' : txn.credit > 0 ? 'Cr' : '-',
          billNo: txn.billNo,
          billet: txn.billDate,
          amount: txn.debit > 0 ? txn.debit : txn.credit
        }));
        
        setLedgerData(mappedData);
        setOpeningBalance(response.openingBalance || 0);
        setClosingBalance(response.closingBalance || { debit: 0, credit: 0 });
        setTotals(response.totals || { debit: 0, credit: 0 });
        setTableLoaded(true);
        toast.success('Ledger data loaded successfully');
      } else {
        toast.error('Failed to load ledger data');
        setLedgerData([]);
      }
    } catch (error) {
      toast.error('Error loading ledger data');
      console.error('Error fetching ledger:', error);
      setLedgerData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${year}-${month}-${day}`;
    
    setTableLoaded(false);
    setFromDate(formattedToday);
    setToDate(formattedToday);
    setParty('');
    setPartyCode('');
    setPartyDisplay('Select Party');
    setCompany([]);
    setCompanyCode([]);
    setCompanyDisplay('Select Company');
    setLedgerData([]);
    setOpeningBalance(0);
    setClosingBalance({ debit: 0, credit: 0 });
    setTotals({ debit: 0, credit: 0 });
  };

  const handlePrintClick = () => {
    // ✅ Check print permission first
    if (!checkPrintPermission()) {
      return;
    }
    if (ledgerData.length === 0) {
      toast.warning('No data available to print');
      return;
    }
    setShowPrintConfirm(true);
  };

const handleExportClick = () => {
  // 🔒 SAME RULE AS PRINT
  if (!hasPrintPermission) {
    toast.error('You do not have permission to export this report', {
      autoClose: 3000,
    });
    return;
  }

  if (ledgerData.length === 0) {
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


  const formatNumber = (num) => {
    return parseFloat(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const generatePDF = () => {
    try {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ledger Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #1B91DA; }
            .info { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #1B91DA; color: white; padding: 8px; text-align: center; font-size: 10px; }
            td { padding: 6px; border: 1px solid #ddd; text-align: center; font-size: 10px; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin-top: 20px; font-weight: bold; text-align: center; }
            .summary-item { display: inline-block; margin: 0 30px; }
          </style>
        </head>
        <body>
          <h1>Ledger Report</h1>
          <div class="info">
            <p>Period: ${fromDate} to ${toDate}</p>
            <p>Party: ${partyDisplay}</p>
            <p>Company: ${companyDisplay}</p>
            <p>Total Records: ${ledgerData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Name</th>
                <th>Voucher No</th>
                <th>Type</th>
                <th>Cr/Dr</th>
                <th>Bill No</th>
                <th>Bill Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${ledgerData.map((row, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${row.date || ''}</td>
                  <td class="text-left">${row.name || ''}</td>
                  <td>${row.voucherNo || ''}</td>
                  <td>${row.type || ''}</td>
                  <td>${row.crDr || ''}</td>
                  <td>${row.billNo || ''}</td>
                  <td>${row.billet || ''}</td>
                  <td class="text-right">₹${formatNumber(parseFloat(row.amount) || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="summary">
            <div class="summary-item">Opening Balance: ₹${formatNumber(openingBalance)}</div>
            <div class="summary-item">Total Debit: ₹${formatNumber(totals.debit || 0)}</div>
            <div class="summary-item">Total Credit: ₹${formatNumber(totals.credit || 0)}</div>
            <div class="summary-item">Closing Balance: ₹${formatNumber((closingBalance.credit || 0) - (closingBalance.debit || 0))}</div>
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
      let csvContent = 'Ledger Report\n';
      csvContent += `Period: ${fromDate} to ${toDate}\n`;
      csvContent += `Party: ${partyDisplay}\n`;
      csvContent += `Company: ${companyDisplay}\n`;
      csvContent += `Total Records: ${ledgerData.length}\n\n`;
      
      csvContent += 'S.No,Date,Name,Voucher No,Type,Cr/Dr,Bill No,Bill Date,Amount\n';
      
      ledgerData.forEach((row, index) => {
        const amount = parseFloat(row.amount) || 0;
        csvContent += `${index + 1},${row.date || ''},"${row.name || ''}",${row.voucherNo || ''},${row.type || ''},${row.crDr || ''},${row.billNo || ''},${row.billet || ''},${amount.toFixed(2)}\n`;
      });
      
      csvContent += `\n\n`;
      csvContent += `Summary\n`;
      csvContent += `Opening Balance,${openingBalance.toFixed(2)}\n`;
      csvContent += `Total Debit,${(totals.debit || 0).toFixed(2)}\n`;
      csvContent += `Total Credit,${(totals.credit || 0).toFixed(2)}\n`;
      csvContent += `Closing Balance,${((closingBalance.credit || 0) - (closingBalance.debit || 0)).toFixed(2)}\n`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Ledger_${partyDisplay}_${fromDate}_to_${toDate}.csv`);
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
          partyRef.current?.focus();
          break;
        case 'party':
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
    partyInput: {
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
    partyInputFocused: {
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
    listTextContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      flex: 1
    },
    listText: {
      color: '#333',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium
    },
    listSubtext: {
      color: '#666',
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal
    },
    searchInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      outline: 'none',
      transition: 'border-color 0.2s',
      ':focus': {
        borderColor: '#1B91DA'
      }
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 15px',
      borderTop: '1px solid #e0e0e0',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#fafafa'
    },
    paginationButton: {
      padding: '6px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      background: 'white',
      color: '#333',
      fontSize: TYPOGRAPHY.fontSize.sm,
      cursor: 'pointer',
      transition: 'all 0.2s',
      ':hover': {
        background: '#f0f0f0',
        borderColor: '#1B91DA'
      },
      ':disabled': {
        cursor: 'not-allowed'
      }
    },
    paginationText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: '#666'
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

  return (
    <div style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div>Loading Ledger Report...</div>
          </div>
        </div>
      )}

      {/* Header Section - Responsive Layout */}
      <div style={styles.headerSection}>
        {/* Row 1: Date Fields */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '12px' : '16px',
          marginBottom: screenSize.isMobile ? '10px' : screenSize.isTablet ? '12px' : '0',
          width: '100%',
          flexWrap: screenSize.isMobile ? 'wrap' : screenSize.isTablet ? 'wrap' : 'nowrap',
        }}>
          {/* From Date */}
          <div style={{
            ...styles.formField,
            flex: screenSize.isMobile ? '1 1 100%' : screenSize.isTablet ? '1 1 calc(50% - 6px)' : '0 1 auto',
            minWidth: screenSize.isMobile ? '100%' : screenSize.isTablet ? 'calc(50% - 6px)' : 'auto',
            maxWidth: screenSize.isTablet && !screenSize.isDesktop ? 'calc(50% - 6px)' : 'none',
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
            flex: screenSize.isMobile ? '1 1 100%' : screenSize.isTablet ? '1 1 calc(50% - 6px)' : '0 1 auto',
            minWidth: screenSize.isMobile ? '100%' : screenSize.isTablet ? 'calc(50% - 6px)' : 'auto',
            maxWidth: screenSize.isTablet && !screenSize.isDesktop ? 'calc(50% - 6px)' : 'none',
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

          {/* Party with Popup - Desktop Only in Row 1 */}
          {screenSize.isDesktop && (
            <div style={{
              ...styles.formField,
              flex: '1 1 auto',
              minWidth: '250px',
            }}>
              <label style={styles.inlineLabel}>Party:</label>
              <div
                style={
                  focusedField === 'party'
                    ? styles.partyInputFocused
                    : styles.partyInput
                }
                onClick={() => {
                  handlePartyClick();
                  setFocusedField('party');
                }}
                ref={partyRef}
                onKeyDown={handlePartyKeyDown}
                onFocus={() => setFocusedField('party')}
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
                  {partyDisplay}
                </span>
                <span style={{ color: '#1B91DA', fontSize: '10px', marginLeft: '8px' }}>▼</span>
              </div>
            </div>
          )}

          {/* Company with Popup - Desktop Only in Row 1 */}
          {screenSize.isDesktop && (
            <div style={{
              ...styles.formField,
              flex: '1 1 auto',
              minWidth: '280px',
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
                onKeyDown={handleCompanyKeyDown}
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
          )}

          {/* Buttons - Desktop Only in Row 1 */}
          {screenSize.isDesktop && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
              marginLeft: 'auto',
            }}>
              <button
                style={styles.searchButton}
                onClick={handleSearch}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                ref={searchButtonRef}
              >
                Search
                {hoveredButton && <div style={styles.buttonGlow}></div>}
              </button>
              <button
                style={styles.refreshButton}
                onClick={handleRefresh}
              >
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* Row 2: Party, Company, and Buttons for Mobile and Tablet */}
        {!screenSize.isDesktop && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: screenSize.isMobile ? '8px' : '12px',
            width: '100%',
            flexWrap: 'wrap',
          }}>
            {/* Party with Popup */}
            <div style={{
              ...styles.formField,
              flex: screenSize.isMobile ? '1 1 100%' : '1 1 calc(50% - 6px)',
              minWidth: screenSize.isMobile ? '100%' : 'calc(50% - 6px)',
              maxWidth: screenSize.isTablet ? 'calc(50% - 6px)' : 'none',
            }}>
              <label style={styles.inlineLabel}>Party:</label>
              <div
                style={
                  focusedField === 'party'
                    ? styles.partyInputFocused
                    : styles.partyInput
                }
                onClick={() => {
                  handlePartyClick();
                  setFocusedField('party');
                }}
                ref={partyRef}
                onKeyDown={handlePartyKeyDown}
                onFocus={() => setFocusedField('party')}
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
                  {partyDisplay}
                </span>
                <span style={{ color: '#1B91DA', fontSize: '10px', marginLeft: '8px' }}>▼</span>
              </div>
            </div>

            {/* Company with Popup */}
            <div style={{
              ...styles.formField,
              flex: screenSize.isMobile ? '1 1 100%' : '1 1 calc(50% - 6px)',
              minWidth: screenSize.isMobile ? '100%' : 'calc(50% - 6px)',
              maxWidth: screenSize.isTablet ? 'calc(50% - 6px)' : 'none',
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
                onKeyDown={handleCompanyKeyDown}
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

            {/* Buttons for Mobile and Tablet */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              justifyContent: screenSize.isMobile ? 'stretch' : 'flex-end',
              marginTop: '4px',
            }}>
              <button
                style={{
                  ...styles.searchButton,
                  flex: screenSize.isMobile ? '1' : '0 0 auto',
                }}
                onClick={handleSearch}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                ref={searchButtonRef}
              >
                Search
                {hoveredButton && <div style={styles.buttonGlow}></div>}
              </button>
              <button
                style={{
                  ...styles.refreshButton,
                  flex: screenSize.isMobile ? '1' : '0 0 auto',
                }}
                onClick={handleRefresh}
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div style={styles.tableSection}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, minWidth: '50px', width: '50px', maxWidth: '50px' }}>S.No</th>
                <th style={styles.th}>Date</th>
                <th style={{ ...styles.th, minWidth: '120px', width: '120px', maxWidth: '120px' }}>Name</th>
                <th style={styles.th}>Voucher No</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Cr/Dr</th>
                <th style={styles.th}>Bill No</th>
                <th style={styles.th}>Bill Date</th>
                <th style={{ ...styles.th, minWidth: '100px', width: '100px', maxWidth: '100px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {tableLoaded ? (
                ledgerData.length > 0 ? (
                  ledgerData.map((row, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                      <td style={{ ...styles.td, minWidth: '50px', width: '50px', maxWidth: '50px' }}>{index + 1}</td>
                      <td style={styles.td}>{row.date}</td>
                      <td style={{ ...styles.td, minWidth: '120px', width: '120px', maxWidth: '120px' }}>{row.name}</td>
                      <td style={styles.td}>{row.voucherNo}</td>
                      <td style={styles.td}>{row.type}</td>
                      <td style={styles.td}>{row.crDr}</td>
                      <td style={styles.td}>{row.billNo}</td>
                      <td style={styles.td}>{row.billet}</td>
                      <td style={{ ...styles.td, minWidth: '100px', width: '100px', maxWidth: '100px', textAlign: 'right', fontWeight: 'bold', color: '#1565c0' }}>
                        ₹{parseFloat(row.amount || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No records found
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    {/* Enter search criteria and click "Search" to view ledger entries */}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Section with Balances - CENTERED */}
      <div style={styles.footerSection}>
        <div style={{
          ...styles.balanceContainer,
          justifyContent: 'center',
          width: '100%',
        }}>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Opening Balance</span>
            <span style={styles.balanceValue}>
              ₹{parseFloat(openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Closing Balance</span>
            <span style={styles.balanceValue}>
              ₹{parseFloat((closingBalance.credit || 0) - (closingBalance.debit || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div style={styles.buttonGroup}>
         <PrintButton 
  onClick={handlePrintClick}
  isActive={hasPrintPermission}
  disabled={!hasPrintPermission || ledgerData.length === 0}
/>

<ExportButton 
  onClick={handleExportClick}
  isActive={hasPrintPermission}
  disabled={!hasPrintPermission || ledgerData.length === 0}
/>

        </div>
      </div>

      {/* Print Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showPrintConfirm}
        onClose={() => setShowPrintConfirm(false)}
        onConfirm={handlePrintConfirm}
        title="Print Confirmation"
        message="Do you want to print the Ledger report?"
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
        message="Do you want to export the Ledger report to Excel?"
        confirmText="Export"
        cancelText="Cancel"
        type="info"
      />

      {/* Party Selection Popup */}
      {showPartyPopup && (
        <div style={styles.popupOverlay} onClick={handlePartyPopupClose}>
          <div 
            style={styles.popupContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.popupHeader}>
              Select Party
              <button 
                style={styles.closeButton}
                onClick={handlePartyPopupClose}
              >
                ×
              </button>
            </div>
            
            {/* Search Input */}
            <div style={{ padding: '10px 15px', borderBottom: '1px solid #e0e0e0' }}>
              <input
                type="text"
                placeholder="Search party..."
                value={partySearchText}
                onChange={handlePartySearch}
                style={styles.searchInput}
                ref={partySearchInputRef}
              />
            </div>
            
            <div 
              style={styles.listContainer}
              onScroll={handlePartyScroll}
              ref={partyListRef}
            >
              {isLoading && allParties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
              ) : allParties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No parties found</div>
              ) : (
                <>
                  {allParties.map((partyItem) => {
                    const isSelected = tempSelectedPartyCode === partyItem.fCode;
                    return (
                      <div 
                        key={partyItem.fCode} 
                        style={isSelected ? styles.selectedListItem : styles.listItem}
                        onClick={() => handlePartySelect(partyItem)}
                      >
                        <div style={isSelected ? styles.selectedListCheckbox : styles.listCheckbox}>
                          {isSelected && <div style={styles.checkmark}>✓</div>}
                        </div>
                       <div style={styles.listTextContainer}>
  <span style={styles.listText}>{partyItem.fAcname}</span>
</div>

                      </div>
                    );
                  })}
                  {isLoading && hasMoreParties && (
                    <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>Loading more...</div>
                  )}
                </>
              )}
            </div>
            
            <div style={styles.popupActions}>
              <div style={styles.popupButtons}>
                <button 
                  style={{...styles.popupButton, ...styles.clearButton}}
                  onClick={handlePartyClearSelection}
                >
                  Clear
                </button>
                <button 
                  style={{...styles.popupButton, ...styles.okButton}}
                  onClick={handlePartyPopupOk}
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
              Select Companies
              <button 
                style={styles.closeButton}
                onClick={handleCompanyPopupClose}
              >
                ×
              </button>
            </div>
            
            <div style={styles.listContainer}>
              {/* ALL Option */}
              <div 
                style={tempSelectedCompanyCode.length === allCompanies.length && allCompanies.length > 0 ? styles.selectedListItem : styles.listItem}
                onClick={() => handleCompanySelect('ALL')}
              >
                <div style={tempSelectedCompanyCode.length === allCompanies.length && allCompanies.length > 0 ? styles.selectedListCheckbox : styles.listCheckbox}>
                  {tempSelectedCompanyCode.length === allCompanies.length && allCompanies.length > 0 && <div style={styles.checkmark}>✓</div>}
                </div>
                <div style={styles.listTextContainer}>
                  <span style={styles.listText}>ALL</span>
                </div>
              </div>
              
              {allCompanies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No companies found</div>
              ) : (
                allCompanies.map((companyItem) => {
                  const isSelected = tempSelectedCompanyCode.includes(companyItem.compCode);
                  return (
                    <div 
                      key={companyItem.compCode} 
                      style={isSelected ? styles.selectedListItem : styles.listItem}
                      onClick={() => handleCompanySelect(companyItem)}
                    >
                      <div style={isSelected ? styles.selectedListCheckbox : styles.listCheckbox}>
                        {isSelected && <div style={styles.checkmark}>✓</div>}
                      </div>
                     <div style={styles.listTextContainer}>
  <span style={styles.listText}>{companyItem.compName}</span>
</div>

                    </div>
                  );
                })
              )}
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

export default Ledger;