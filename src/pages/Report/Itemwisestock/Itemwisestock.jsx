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

const AccountPayables = () => {
  // --- STATE MANAGEMENT ---
  const currentDate = formatDate(new Date());
  const [fromDate, setFromDate] = useState(currentDate);
  const [toDate, setToDate] = useState(currentDate);
  const [selectedCompanies, setSelectedCompanies] = useState(['ALL']); // Initial value is ALL
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [tempSelectedCompanies, setTempSelectedCompanies] = useState([]); // Initially empty
  const [selectAll, setSelectAll] = useState(false); // Initially false
  const [tableLoaded, setTableLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [companyDisplay, setCompanyDisplay] = useState('ALL');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [itemsList, setItemsList] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showItemPopup, setShowItemPopup] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyNameSearchTerm, setCompanyNameSearchTerm] = useState('');
  const [companyList, setCompanyList] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [showCompanyNamePopup, setShowCompanyNamePopup] = useState(false);
  const [selectedCompanyNames, setSelectedCompanyNames] = useState([]);
  const [selectAllCompanies, setSelectAllCompanies] = useState(false);

  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const companyRef = useRef(null);
  const searchButtonRef = useRef(null);

  // --- DATA ---
  const [payablesData, setPayablesData] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Update tempSelectedCompanies when popup opens based on current selection
  useEffect(() => {
    if (showCompanyPopup) {
      if (selectedCompanies.includes('ALL')) {
        // If ALL is selected in main state, show empty selection in popup
        setTempSelectedCompanies([]);
        setSelectAll(false);
      } else {
        // If specific companies are selected, show them in popup
        setTempSelectedCompanies([...selectedCompanies]);
        setSelectAll(false);
      }
    }
  }, [showCompanyPopup, selectedCompanies]);

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

  const handleCompanyClick = () => {
    // The useEffect above will handle setting tempSelectedCompanies
    setShowCompanyPopup(true);
  };

  const handleItemNameClick = async () => {
    setShowItemPopup(true);
    setLoadingItems(true);
    setItemSearchTerm('');
    
    try {
      // Fetch items from API
      const apiUrl = `${API_BASE}${API_ENDPOINTS.ITEMWISE_STOCK.GET_ITEMS_LIST(1, 100)}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      setItemsList(responseData.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items. Please try again.');
      setItemsList([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleCompanyNameClick = async () => {
    setShowCompanyNamePopup(true);
    setLoadingCompanies(true);
    setCompanyNameSearchTerm('');
    setSelectedCompanyNames([]);
    setSelectAllCompanies(false);
    
    try {
      // Fetch companies from API
      const apiUrl = `${API_BASE}${API_ENDPOINTS.COMPANY_ENDPOINTS.GET_COMPANY_LIST}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      setCompanyList(responseData || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies. Please try again.');
      setCompanyList([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleCompanySelect = (company) => {
    if (company === 'ALL') {
      // If ALL is being toggled
      if (tempSelectedCompanies.includes('ALL')) {
        // Untick ALL - remove ALL and all companies
        const allCompanyCodes = companies.map(c => c.fCompcode);
        const updated = tempSelectedCompanies.filter(
          c => c !== 'ALL' && !allCompanyCodes.includes(c)
        );
        setTempSelectedCompanies(updated);
        setSelectAll(false);
      } else {
        // Tick ALL - add ALL and all company codes
        const allCompanyCodes = companies.map(c => c.fCompcode);
        setTempSelectedCompanies(['ALL', ...allCompanyCodes]);
        setSelectAll(true);
      }
    } else {
      // Handling individual company selection
      let updatedCompanies;
      
      if (tempSelectedCompanies.includes(company.fCompcode)) {
        // Remove company from selection
        updatedCompanies = tempSelectedCompanies.filter(c => c !== company.fCompcode);
        
        // Also remove ALL if it was selected
        if (updatedCompanies.includes('ALL')) {
          updatedCompanies = updatedCompanies.filter(c => c !== 'ALL');
        }
      } else {
        // Add company to selection
        updatedCompanies = [...tempSelectedCompanies, company.fCompcode];
        
        // Check if all companies are now selected
        const allCompanyCodes = companies.map(c => c.fCompcode);
        const allSelected = allCompanyCodes.every(code => updatedCompanies.includes(code));
        
        if (allSelected) {
          // If all companies are selected, add ALL as well
          updatedCompanies = ['ALL', ...allCompanyCodes];
          setSelectAll(true);
        } else {
          setSelectAll(false);
        }
      }
      
      setTempSelectedCompanies(updatedCompanies);
    }
  };

  const handlePopupOk = () => {
    // Extract just the company codes (excluding ALL for the actual selection)
    const companyCodes = tempSelectedCompanies.filter(code => code !== 'ALL');
    
    // If ALL was selected in temp state, store just ['ALL'] in main state
    if (tempSelectedCompanies.includes('ALL')) {
      setSelectedCompanies(['ALL']);
      setCompanyDisplay('ALL');
    } else if (companyCodes.length > 0) {
      // If specific companies are selected
      setSelectedCompanies(companyCodes);
      // Update display text
      const displayText = companyCodes.map(code => 
        companies.find(c => c.fCompcode === code)?.fCompName
      ).filter(Boolean).join(', ');
      setCompanyDisplay(displayText);
    } else {
      // If nothing is selected, default to ALL
      setSelectedCompanies(['ALL']);
      setCompanyDisplay('ALL');
    }
    
    setShowCompanyPopup(false);
  };

  const handleClearSelection = () => {
    setTempSelectedCompanies([]);
    setSelectAll(false);
  };

  const handlePopupClose = () => {
    setShowCompanyPopup(false);
    setCompanySearchTerm(''); // Clear search term when popup closes
  };

  const handleItemPopupClose = () => {
    setShowItemPopup(false);
    setItemSearchTerm('');
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setShowItemPopup(false);
    setItemSearchTerm('');
  };

  const handleCompanyNameSelect = (company) => {
    setCompanyName(company.fcompname || company.name || '');
    setShowCompanyNamePopup(false);
    setCompanyNameSearchTerm('');
  };

  const handleCompanyNameSelectMultiple = (company) => {
    if (selectedCompanyNames.includes(company.fcompcode)) {
      setSelectedCompanyNames(selectedCompanyNames.filter(code => code !== company.fcompcode));
      setSelectAllCompanies(false);
    } else {
      const updated = [...selectedCompanyNames, company.fcompcode];
      setSelectedCompanyNames(updated);
      
      // Check if all companies are selected
      if (updated.length === companyList.length) {
        setSelectAllCompanies(true);
      }
    }
  };

  const handleSelectAllCompanies = () => {
    if (selectAllCompanies) {
      setSelectedCompanyNames([]);
      setSelectAllCompanies(false);
    } else {
      setSelectedCompanyNames(companyList.map(c => c.fcompcode));
      setSelectAllCompanies(true);
    }
  };

  const handleCompanyNamePopupOk = () => {
    if (selectedCompanyNames.length > 0) {
      const selectedNames = companyList
        .filter(c => selectedCompanyNames.includes(c.fcompcode))
        .map(c => c.fcompname)
        .join(', ');
      setCompanyName(selectedNames);
    }
    setShowCompanyNamePopup(false);
    setCompanyNameSearchTerm('');
  };

  const handleCompanyNamePopupClose = () => {
    setShowCompanyNamePopup(false);
    setCompanyNameSearchTerm('');
  };

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      toast.warning('Please fill all fields: From Date and To Date', {
        autoClose: 2000,
      });
      return;
    }

    if (!selectedItem) {
      toast.warning('Please select an item', {
        autoClose: 2000,
      });
      return;
    }

    if (!selectedCompanyNames || selectedCompanyNames.length === 0) {
      toast.warning('Please select at least one company', {
        autoClose: 2000,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fetch data for each selected company and item
      const allResults = [];

      for (const compCode of selectedCompanyNames) {
        const apiUrl = `${API_BASE}${API_ENDPOINTS.ITEMWISE_STOCK.GET_ITEM_STOCK_BY_DATE(
          selectedItem.fItemcode,
          compCode,
          fromDate,
          toDate
        )}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        
        // Map API response fields to table fields
        if (Array.isArray(responseData)) {
          const mappedData = responseData.map((item, index) => ({
            no: index + 1,
            fItemName: item.itemName || '',
            date: item.fDate ? new Date(item.fDate).toISOString().substring(0, 10) : '',
            opgQty: item.opgqty || 0,
            purchaseQty: item.purchaseQty || 0,
            salesQty: item.salesQty || 0,
            balanceQty: item.balanceQty || 0,
          }));
          allResults.push(...mappedData);
        }
      }

      setPayablesData(allResults);
      setTableLoaded(true);

      if (allResults.length === 0) {
        toast.info('No records found for the selected criteria', {
          autoClose: 2000,
        });
      } else {
        toast.success(`Found ${allResults.length} records`, {
          autoClose: 2000,
        });
      }
      
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Failed to search. Please try again.');
      setPayablesData([]);
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
    setCompanyName('');
    setSelectedItem(null);
    setSelectedCompanies(['ALL']);
    setCompanyDisplay('ALL');
    setTempSelectedCompanies([]);
    setSelectAll(false);
    setPayablesData([]);
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
      borderRadius: screenSize.isMobile ? '4px' : screenSize.isTablet ? '5px' : '6px',
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
      borderRadius: screenSize.isMobile ? '4px' : screenSize.isTablet ? '5px' : '6px',
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
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
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
    companyInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      paddingTop: screenSize.isMobile ? '6px' : screenSize.isTablet ? '7px' : '8px',
      paddingBottom: screenSize.isMobile ? '6px' : screenSize.isTablet ? '7px' : '8px',
      paddingLeft: screenSize.isMobile ? '8px' : screenSize.isTablet ? '9px' : '10px',
      paddingRight: screenSize.isMobile ? '8px' : screenSize.isTablet ? '9px' : '10px',
      border: '1px solid #ddd',
      borderRadius: screenSize.isMobile ? '4px' : screenSize.isTablet ? '5px' : '6px',
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
    companyInputFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      paddingTop: screenSize.isMobile ? '6px' : screenSize.isTablet ? '7px' : '8px',
      paddingBottom: screenSize.isMobile ? '6px' : screenSize.isTablet ? '7px' : '8px',
      paddingLeft: screenSize.isMobile ? '8px' : screenSize.isTablet ? '9px' : '10px',
      paddingRight: screenSize.isMobile ? '8px' : screenSize.isTablet ? '9px' : '10px',
      border: '2px solid #1B91DA',
      borderRadius: screenSize.isMobile ? '4px' : screenSize.isTablet ? '5px' : '6px',
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
      borderRadius: screenSize.isMobile ? '4px' : screenSize.isTablet ? '5px' : '6px',
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
      borderRadius: screenSize.isMobile ? '4px' : screenSize.isTablet ? '5px' : '6px',
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

    companyList: {
      padding: '20px',
      maxHeight: '300px',
      overflowY: 'auto',
    },
    companyItem: {
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
    selectedCompanyItem: {
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
    companyCheckbox: {
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
    selectedCompanyCheckbox: {
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
    companyText: {
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

  // Calculate totals
  const totalDebit = payablesData
    .filter(row => !row.isTotal && row.debit)
    .reduce((sum, row) => sum + parseFloat(row.debit.replace(/,/g, '') || 0), 0);
  
  const totalCredit = payablesData
    .filter(row => !row.isTotal && row.credit)
    .reduce((sum, row) => sum + parseFloat(row.credit.replace(/,/g, '') || 0), 0);
  
  const totalBalance = payablesData
    .filter(row => !row.isTotal && row.balance)
    .reduce((sum, row) => sum + parseFloat(row.balance.replace(/,/g, '') || 0), 0);

  return (
    <div style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div>Loading Account Payables Report...</div>
          </div>
        </div>
      )}

      {/* Header Section - Left side: Dates + Company, Right side: Buttons */}
      <div style={styles.headerSection}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: screenSize.isMobile ? '12px' : screenSize.isTablet ? '16px' : '20px',
          flexWrap: screenSize.isMobile ? 'wrap' : 'nowrap',
          width: '100%',
        }}>
          {/* LEFT SIDE: Dates and Company */}
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

            {/* To Date */}
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

            {/* Company Name */}
            <div style={{
              ...styles.formField,
              minWidth: screenSize.isMobile ? '100%' : '200px',
              flex: 1,
            }}>
              <label style={styles.inlineLabel}>Company Name:</label>
              <div
                style={
                  focusedField === 'companyName'
                    ? styles.companyInputFocused
                    : styles.companyInput
                }
                onClick={() => {
                  handleCompanyNameClick();
                  setFocusedField('companyName');
                }}
                onKeyDown={(e) => {
                  handleKeyDown(e, 'companyName');
                  if (e.key === 'Enter') {
                    handleCompanyNameClick();
                  }
                }}
                onFocus={() => setFocusedField('companyName')}
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
                  {companyName ? companyName : 'Select Company'}
                </span>
                <span style={{ 
                  color: '#1B91DA', 
                  fontSize: '10px', 
                  marginLeft: '8px' 
                }}>▼</span>
              </div>
            </div>

            {/* Company */}
            <div style={{
              ...styles.formField,
              flex: 1,
              minWidth: screenSize.isMobile ? '100%' : '200px',
            }}>
              <label style={styles.inlineLabel}>Item Name:</label>
              <div
                style={
                  focusedField === 'itemName'
                    ? styles.companyInputFocused
                    : styles.companyInput
                }
                onClick={() => {
                  handleItemNameClick();
                  setFocusedField('itemName');
                }}
                ref={companyRef}
                onKeyDown={(e) => {
                  handleKeyDown(e, 'itemName');
                  if (e.key === 'Enter') {
                    handleItemNameClick();
                  }
                }}
                onFocus={() => setFocusedField('itemName')}
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
                  {selectedItem ? selectedItem.fItemName : 'Select Item'}
                </span>
                <span style={{ 
                  color: '#1B91DA', 
                  fontSize: '10px', 
                  marginLeft: '8px' 
                }}>▼</span>
              </div>
            </div>
          </div>

          {/* SPACER BETWEEN LEFT AND RIGHT SIDES */}
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
                <th style={{ ...styles.th }}>S.No</th>
                <th style={{ ...styles.th }}>Item Name</th>
                <th style={{ ...styles.th }}>Date</th>
                <th style={{ ...styles.th }}>Opg Qty</th>
                <th style={{ ...styles.th }}>Purchase Qty</th>
                <th style={{ ...styles.th }}>Sales Qty</th>
                <th style={{ ...styles.th }}>Balance Qty</th>
              </tr>
            </thead>
          <tbody>
  {tableLoaded ? (
    payablesData.length > 0 ? (
      payablesData.map((row, index) => (
        <tr key={index} style={{ 
          backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
          ...(row.isTotal ? { 
            backgroundColor: '#f0f8ff', 
            borderTop: '2px solid #1B91DA'
          } : {})
        }}>
          <td style={styles.td}>{index + 1}</td>
          <td style={styles.td}>{row.fItemName || ''}</td>
          <td style={styles.td}>{row.date || ''}</td>
          <td style={styles.td}>{row.opgQty || ''}</td>
          <td style={styles.td}>{row.purchaseQty || ''}</td>
          <td style={styles.td}>{row.salesQty || ''}</td>
          <td style={styles.td}>{row.balanceQty || ''}</td>
        </tr>
      ))
    ) : (
      <tr>
        
      </tr>
    )
  ) : (
    <tr>
      {/* <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
        Use the Search button to load data
      </td> */}
    </tr>
  )}
</tbody>
          </table>
        </div>
      </div>

      {/* Footer Section */}
      <div style={styles.footerSection}>
        <div style={{
          ...styles.balanceContainer,
          justifyContent: 'center',
          width: '100%',
        }}>
          <div style={styles.balanceItem}>
            <span style={styles.balanceLabel}>Total Items</span>
            <span style={styles.balanceValue}>
              {payablesData.length}
            </span>
          </div>
        </div>
      </div>

      {/* Company Selection Popup */}
      {showCompanyPopup && (
        <div style={styles.popupOverlay} onClick={handlePopupClose}>
          <div 
            style={styles.popupContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.popupHeader}>
              Select Companies
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
                placeholder="Search companies..."
                value={companySearchTerm}
                onChange={(e) => setCompanySearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.companyList}>
              {companies.length > 0 ? (
                <>
                  {/* ALL option - Initially UNCHECKED */}
                  <div 
                    style={tempSelectedCompanies.includes('ALL') ? styles.selectedCompanyItem : styles.companyItem}
                    onClick={() => handleCompanySelect('ALL')}
                  >
                    <div style={tempSelectedCompanies.includes('ALL') ? styles.selectedCompanyCheckbox : styles.companyCheckbox}>
                      {tempSelectedCompanies.includes('ALL') && <div style={styles.checkmark}>✓</div>}
                    </div>
                    <span style={styles.companyText}>ALL</span>
                  </div>
                  {/* Individual companies - Initially UNCHECKED */}
                  {companies
                    .filter(company => 
                      company.fCompName.toLowerCase().includes(companySearchTerm.toLowerCase())
                    )
                    .map((company) => {
                    const isSelected = tempSelectedCompanies.includes(company.fCompcode);
                    return (
                      <div 
                        key={company.fCompcode} 
                        style={isSelected ? styles.selectedCompanyItem : styles.companyItem}
                        onClick={() => handleCompanySelect(company)}
                      >
                        <div style={isSelected ? styles.selectedCompanyCheckbox : styles.companyCheckbox}>
                          {isSelected && <div style={styles.checkmark}>✓</div>}
                        </div>
                        <span style={styles.companyText}>{company.fCompName}</span>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Loading companies...
                </div>
              )}
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

      {/* Item Selection Popup */}
      {showItemPopup && (
        <div style={styles.popupOverlay} onClick={handleItemPopupClose}>
          <div 
            style={styles.popupContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.popupHeader}>
              Select Item
              <button 
                style={styles.closeButton}
                onClick={handleItemPopupClose}
              >
                ×
              </button>
            </div>
            
            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search items..."
                value={itemSearchTerm}
                onChange={(e) => setItemSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.companyList}>
              {loadingItems ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Loading items...
                </div>
              ) : itemsList.length > 0 ? (
                itemsList
                  .filter(item => 
                    item.fItemName.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
                    item.fItemcode.toLowerCase().includes(itemSearchTerm.toLowerCase())
                  )
                  .map((item) => {
                    const isSelected = selectedItem && selectedItem.fItemcode === item.fItemcode;
                    return (
                      <div 
                        key={item.fItemcode} 
                        style={isSelected ? styles.selectedCompanyItem : styles.companyItem}
                        onClick={() => handleItemSelect(item)}
                      >
                        <div style={isSelected ? styles.selectedCompanyCheckbox : styles.companyCheckbox}>
                          {isSelected && <div style={styles.checkmark}>✓</div>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={styles.companyText}>{item.fItemName}</span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No items found
                </div>
              )}
            </div>
            
            <div style={styles.popupActions}>
              <div style={styles.popupButtons}>
                <button 
                  style={{...styles.popupButton, ...styles.okButton}}
                  onClick={handleItemPopupClose}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Name Selection Popup */}
      {showCompanyNamePopup && (
        <div style={styles.popupOverlay} onClick={handleCompanyNamePopupClose}>
          <div 
            style={styles.popupContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.popupHeader}>
              Select Company
              <button 
                style={styles.closeButton}
                onClick={handleCompanyNamePopupClose}
              >
                ×
              </button>
            </div>
            
            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search companies..."
                value={companyNameSearchTerm}
                onChange={(e) => setCompanyNameSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.companyList}>
              {loadingCompanies ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Loading companies...
                </div>
              ) : companyList.length > 0 ? (
                <>
                  {/* All Checkbox */}
                  <div 
                    style={selectAllCompanies ? styles.selectedCompanyItem : styles.companyItem}
                    onClick={handleSelectAllCompanies}
                  >
                    <div style={selectAllCompanies ? styles.selectedCompanyCheckbox : styles.companyCheckbox}>
                      {selectAllCompanies && <div style={styles.checkmark}>✓</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{...styles.companyText, fontWeight: 'bold'}}>All Companies</span>
                    </div>
                  </div>
                  
                  {/* Individual Companies */}
                  {companyList
                    .filter(company => 
                      (company.fcompname || '').toLowerCase().includes(companyNameSearchTerm.toLowerCase()) ||
                      (company.fcompcode || '').toLowerCase().includes(companyNameSearchTerm.toLowerCase())
                    )
                    .map((company) => {
                      const isSelected = selectedCompanyNames.includes(company.fcompcode);
                      return (
                        <div 
                          key={company.fcompcode} 
                          style={isSelected ? styles.selectedCompanyItem : styles.companyItem}
                          onClick={() => handleCompanyNameSelectMultiple(company)}
                        >
                          <div style={isSelected ? styles.selectedCompanyCheckbox : styles.companyCheckbox}>
                            {isSelected && <div style={styles.checkmark}>✓</div>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={styles.companyText}>{company.fcompname}</span>
                          </div>
                        </div>
                      );
                    })
                  }
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No companies found
                </div>
              )}
            </div>
            
            <div style={styles.popupActions}>
              <div style={styles.popupButtons}>
                <button 
                  style={{...styles.popupButton, ...styles.okButton}}
                  onClick={handleCompanyNamePopupOk}
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

export default AccountPayables;
