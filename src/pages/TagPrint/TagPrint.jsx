import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import { API_ENDPOINTS } from '../../api/endpoints';
import apiService from '../../api/apiService';

const TagPrint = () => {
  // --- REFS ---
  const purchaseNoRef = useRef(null);
  const prefixRef = useRef(null);
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const searchButtonRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [purchaseNo, setPurchaseNo] = useState('');
  const [prefix, setPrefix] = useState('');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasSearched, setHasSearched] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Items data state
  const [items, setItems] = useState([]);
  const [printItems, setPrintItems] = useState([]);
  
  // Purchase number popup state
  const [showPurchasePopup, setShowPurchasePopup] = useState(false);
  
  // Print options
  const [noOfPrints, setNoOfPrints] = useState(1);
  const [selectAll, setSelectAll] = useState(false);

  // --- SCREEN SIZE DETECTION ---
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  React.useEffect(() => {
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

  // --- TYPOGRAPHY ---
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

  // --- STYLES ---
  const styles = {
    container: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#f5f7fa',
      height: '93vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflowX: 'hidden',
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
    //   overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: screenSize.isMobile ? '300px' : '250px',
    },
    filterRow: {
      display: 'flex',
      alignItems: screenSize.isMobile || screenSize.isTablet ? 'stretch' : 'center',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
      marginBottom: screenSize.isMobile ? '12px' : screenSize.isTablet ? '14px' : '18px',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      flexDirection: screenSize.isMobile || screenSize.isTablet ? 'column' : 'row',
    },
    formField: {
      display: 'flex',
      alignItems: screenSize.isMobile || screenSize.isTablet ? 'stretch' : 'center',
      gap: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      flexDirection: screenSize.isMobile || screenSize.isTablet ? 'column' : 'row',
      width: screenSize.isMobile || screenSize.isTablet ? '100%' : 'auto',
      flex: screenSize.isMobile || screenSize.isTablet ? '1 1 100%' : '0 1 auto',
    },
    label: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#333',
      minWidth: screenSize.isMobile || screenSize.isTablet ? 'auto' : '80px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      width: screenSize.isMobile || screenSize.isTablet ? '100%' : 'auto',
      textAlign: 'left',
    },
    input: {
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
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '100%' : '100px',
    },
    inputFocused: {
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
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '100%' : '100px',
    },
    smallInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      padding: '4px 6px',
      border: '1px solid #ddd',
      borderRadius: '3px',
      width: '60px',
      textAlign: 'center',
    },
    selectInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      padding: '4px 6px',
      border: '1px solid #ddd',
      borderRadius: '3px',
      backgroundColor: 'white',
      minWidth: '50px',
      textAlign: 'center',
    },
    leftSide: {
      display: 'flex',
      alignItems: screenSize.isMobile || screenSize.isTablet ? 'stretch' : 'center',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
      flex: screenSize.isMobile || screenSize.isTablet ? '1 1 100%' : 1,
      flexWrap: screenSize.isMobile || screenSize.isTablet ? 'wrap' : 'nowrap',
      flexDirection: screenSize.isMobile || screenSize.isTablet ? 'column' : 'row',
      width: screenSize.isMobile || screenSize.isTablet ? '100%' : 'auto',
    },
    rightSide: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '12px',
      flexShrink: 0,
      width: screenSize.isMobile || screenSize.isTablet ? '100%' : 'auto',
      flexDirection: screenSize.isMobile || screenSize.isTablet ? 'row' : 'row',
      justifyContent: screenSize.isMobile || screenSize.isTablet ? 'space-between' : 'flex-end',
    },
    button: {
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
      flex: screenSize.isMobile || screenSize.isTablet ? 1 : '0 0 auto',
      minWidth: screenSize.isMobile || screenSize.isTablet ? '0' : '100px',
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondary: {
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
      flex: screenSize.isMobile || screenSize.isTablet ? 1 : '0 0 auto',
      minWidth: screenSize.isMobile || screenSize.isTablet ? '0' : '100px',
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainTableContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      overflowX: 'auto',
      overflowY: 'auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      margin: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginTop: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginBottom: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '20px',
      WebkitOverflowScrolling: 'touch',
      width: screenSize.isMobile ? 'calc(100% - 12px)' : screenSize.isTablet ? 'calc(100% - 20px)' : 'calc(100% - 32px)',
      boxSizing: 'border-box',
      flex: 'none',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: screenSize.isMobile ? 'calc(100vh - 300px)' : screenSize.isTablet ? 'calc(100vh - 350px)' : 'calc(100vh - 400px)',
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
      whiteSpace: 'nowrap',
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
    },
    printCell: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      padding: '8px 6px',
      textAlign: 'center',
      border: '1px solid #ccc',
      color: '#333',
      cursor: 'pointer',
      backgroundColor: '#f5f5f5',
      transition: 'background-color 0.2s ease',
    },
    printCellYes: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      padding: '8px 6px',
      textAlign: 'center',
      border: '1px solid #ccc',
      color: '#333',
      backgroundColor: '#f5f5f5',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    printCellNo: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      padding: '8px 6px',
      textAlign: 'center',
      border: '1px solid #ccc',
      color: '#333',
      backgroundColor: '#f5f5f5',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    footer: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      padding: screenSize.isMobile ? '10px' : '16px',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '10px' : '20px',
      flexWrap: 'wrap',
      zIndex: 100,
      borderTop: '1px solid #e0e0e0',
    },
    footerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '8px' : '12px',
      flex: 1,
    },
    footerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '8px' : '12px',
    },
    checkbox: {
      width: '18px',
      height: '18px',
      marginRight: '8px',
      cursor: 'pointer',
    },
    emptyMsg: {
      textAlign: 'center',
      color: '#888',
      fontSize: '16px',
      padding: '32px 0',
    },
    // Popup styles
    popupOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    popupContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      width: screenSize.isMobile ? '90%' : screenSize.isTablet ? '70%' : '50%',
      maxWidth: '500px',
      maxHeight: '80vh',
    //   overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    popupHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      paddingBottom: '10px',
      borderBottom: '1px solid #e0e0e0',
    },
    popupTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#333',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#666',
      padding: '5px',
    },
    popupSearch: {
      marginBottom: '15px',
    },
    popupList: {
      flex: 1,
      overflowY: 'auto',
      maxHeight: '300px',
      border: '1px solid #ddd',
      borderRadius: '4px',
    },
    popupListItem: {
      padding: '10px 15px',
      borderBottom: '1px solid #eee',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    popupListItemHover: {
      backgroundColor: '#f0f8ff',
    },
    popupListItemSelected: {
      backgroundColor: '#e3f2fd',
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    popupFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '15px',
      paddingTop: '10px',
      borderTop: '1px solid #e0e0e0',
    },
    paginationContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '10px',
    },
    paginationButton: {
      padding: '5px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: '#f5f5f5',
      cursor: 'pointer',
      fontSize: TYPOGRAPHY.fontSize.sm,
    },
    paginationInfo: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: '#666',
    },
    previewSection: {
      backgroundColor: 'white',
      borderRadius: 10,
      overflowX: 'auto',
      overflowY: 'visible',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      margin: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginBottom: screenSize.isMobile ? '90px' : screenSize.isTablet ? '100px' : '110px',
      WebkitOverflowScrolling: 'touch',
      width: screenSize.isMobile ? 'calc(100% - 12px)' : screenSize.isTablet ? 'calc(100% - 20px)' : 'calc(100% - 32px)',
      boxSizing: 'border-box',
      flex: 'none',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'none',
    },
    previewTableWrapper: {
      maxHeight: screenSize.isMobile ? '200px' : screenSize.isTablet ? '240px' : '280px',
      overflowY: 'auto',
      overflowX: 'auto'
    },
    previewLabel: {
      padding: screenSize.isMobile ? '8px 12px' : '12px 16px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #e0e0e0',
      color: '#333',
    },
  };

  // Helper function to convert YYYY-MM-DD to DD/MM/YYYY for API
  const formatDateForAPI = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Fetch purchase numbers for popup
// const fetchPurchaseNumbersForPopup = async (page = 1, searchText = '') => {
//   try {
//     console.log('POPUP FETCH CALLED →', { page, searchText, fromDate, toDate });

//     const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//     const fcompcode = userInfo.fcompcode || '001';

//     if (!fromDate || !toDate) {
//       console.warn('Dates missing – API not called');
//       return { data: [], hasMore: false, page };
//     }

//     const formattedFromDate = formatDateForAPI(fromDate);
//     const formattedToDate = formatDateForAPI(toDate);

//     console.log('FORMATTED DATES →', { formattedFromDate, formattedToDate });

//     const endpoint = API_ENDPOINTS.TAG_PRINT.GET_TAG_PRINT_LIST({
//       fromDate: formattedFromDate,
//       toDate: formattedToDate,
//       search: typeof searchText === 'string' ? searchText : '',
//       fcompcode,
//       page,
//       pageSize: 10,
//     });

//     console.log('API ENDPOINT →', endpoint);

//     const response = await apiService.get(endpoint);

//     console.log('RESPONSE DATA →', response.data);

//     const apiData = response.data?.data || [];
//     const totalCount = response.data?.totalCount || 0;

//     const transformedData = apiData.map((item, index) => ({
//       id: (page - 1) * 10 + index + 1,
//       code: item.tagNO,
//     }));

//     console.log('TRANSFORMED DATA →', transformedData);

//     return {
//       data: transformedData,
//       hasMore: totalCount > page * 10,
//       page: response.data.page || page,
//     };
//   } catch (error) {
//     console.error('Error fetching purchase numbers:', error);
//     toast.error('Failed to load purchase numbers');
//     return { data: [], hasMore: false, page };
//   }
// };

const fetchPurchaseNumbersForPopup = async (page = 1, searchText = '') => {
  try {
    console.log('POPUP FETCH CALLED →', { page, searchText, fromDate, toDate });

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const fcompcode = userInfo.fcompcode || '001';

    if (!fromDate || !toDate) {
      console.warn('Dates missing – API not called');
      return [];
    }

    const formattedFromDate = formatDateForAPI(fromDate);
    const formattedToDate = formatDateForAPI(toDate);

    const pageSize = 20; // Batch size for dynamic fetching

    const endpoint = API_ENDPOINTS.TAG_PRINT.GET_TAG_PRINT_LIST({
      fromDate: formattedFromDate,
      toDate: formattedToDate,
      search: typeof searchText === 'string' ? searchText.trim() : '',
      fcompcode,
      page,
      pageSize,
    });

    console.log('API ENDPOINT →', endpoint);

    const response = await apiService.get(endpoint);

    console.log('RESPONSE DATA →', response.data);

    // Handle different API response formats
    const apiData = Array.isArray(response.data)
      ? response.data
      : (Array.isArray(response.data?.data) ? response.data.data : []);
    
    // Transform data for popup display
    const transformedData = apiData.map((item, index) => ({
      id: (page - 1) * pageSize + index + 1,
      tagNO: item.tagNO || item.code || '',
      ...item
    }));

    console.log('TRANSFORMED DATA →', transformedData, 'Length:', transformedData.length, 'Page:', page);

    // Return array directly for PopupListSelector
    return transformedData;
  } catch (error) {
    console.error('Error fetching purchase numbers:', error);
    toast.error('Failed to load purchase numbers');
    return [];
  }
};


// In your JSX component


  // Handle purchase number selection from popup
  const handlePurchaseNumberSelect = (selectedItem) => {
    setPurchaseNo(selectedItem.tagNO || '');
    setShowPurchasePopup(false);
  };

  // Auto-focus on purchaseNo when component mounts
  useEffect(() => {
    if (purchaseNoRef.current) {
      setTimeout(() => {
        purchaseNoRef.current.focus();
      }, 100);
    }
  }, []);

  // Fetch items for selected purchase number
  const fetchItemsByPurchaseNo = async (tagNo) => {
    try {
      setIsLoading(true);
      
      // Call API to get items
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const compCode = userInfo.fcompcode || '001';
      const endpoint = API_ENDPOINTS.TAG_PRINT.GET_TAG_PRINT_ITEMS({
        voucher: tagNo,
        compCode
      });
      console.log(endpoint);
      const response = await apiService.get(endpoint);
      
      console.log('Raw API Response:', response);
      console.log('Is response an array?', Array.isArray(response));
      console.log('response.data:', response.data);
      console.log('response type:', typeof response);
      
      // Transform API response to match table format
      let apiData = [];
      
      if (Array.isArray(response)) {
        // Response itself is an array
        apiData = response;
      } else if (Array.isArray(response.data)) {
        // Data is in response.data
        apiData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Nested in data.data property
        apiData = response.data.data;
      } else if (response && typeof response === 'object' && !Array.isArray(response)) {
        // Single object response
        apiData = [response];
      } else if (response.data && typeof response.data === 'object') {
        // Single object in data
        apiData = [response.data];
      }
      
      console.log('API Data to transform:', apiData);
      console.log('API Data length:', apiData.length);
      
      const transformedItems = apiData.map((item, index) => {
        const qty = parseFloat(item.qty) || 1;
        const asRate = parseFloat(item.asRate) || 0;
        const rs = parseFloat(item.rs) || 0;
        const avgWt = parseFloat(item.avgWt) || 0;
        const hsn = item.hsn || item.hsnCode || '';
        const itemName = item.itemName || item.name || item.item_name || 'N/A';
        const preRate = parseFloat(item.preRate) || 0;
        
        const transformedItem = {
          sNo: index + 1,
          barcode: item.tagNo || '',
          tagNo: item.tagNo || '',
          itemName: itemName,
          qty: qty,
          print: 'N',
          selected: false,
          unit: item.fUnit || '',
          hsn: hsn,
          mrp: asRate,
          preRate: preRate,
          inTax: 0,
          sRate: asRate,
          amount: rs,
          avgWt: avgWt,
          // Additional fields for printing
          brandName: item.brandName || '',
          modelName: item.modelName || '',
          sizeName: item.sizeName || '',
          supplierName: item.supplierName || '',
          sudo: item.sudo || '',
          rate: item.rate || 0
        };
        
        console.log('Transformed item:', transformedItem);
        return transformedItem;
      });
      
      console.log('All Transformed Items:', transformedItems);
      
      setItems(transformedItems);
      setPrintItems([]);
      setSelectAll(false);
      setHasSearched(true);
      
      toast.success(`Loaded ${transformedItems.length} items for ${tagNo}`);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load items: ' + (error.response?.data?.message || error.message));
      setItems([]);
      setPrintItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation handlers
  const handlePurchaseNoKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowPurchasePopup(true);
    }
  };

  const handlePrefixKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fromDateRef.current?.focus();
    }
  };

  const handleFromDateKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      toDateRef.current?.focus();
    }
  };

  const handleToDateKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchButtonRef.current?.focus();
    }
  };

  // Toggle print status on click or spacebar
  const togglePrintStatus = (index) => {
    const updatedItems = [...items];
    const currentPrint = updatedItems[index].print;
    updatedItems[index].print = currentPrint === 'Y' ? 'N' : 'Y';
    updatedItems[index].selected = updatedItems[index].print === 'Y';
    
    setItems(updatedItems);
    updatePrintItems(updatedItems);
  };

  // Handle spacebar on print cell
  const handlePrintCellKeyDown = (e, index) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      togglePrintStatus(index);
    }
  };

  // Handle qty change
  const handleQtyChange = (index, value) => {
    const updatedItems = [...items];
    const qty = parseFloat(value) || 0;
    updatedItems[index].qty = qty;
    updatedItems[index].amount = qty * (updatedItems[index].sRate || 0);
    setItems(updatedItems);
    updatePrintItems(updatedItems);
  };

  const handleQtyKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const updatedItems = [...items];
      const qty = parseFloat(e.target.value) || 0;
      updatedItems[index].qty = qty;
      updatedItems[index].amount = qty * (updatedItems[index].sRate || 0);
      setItems(updatedItems);
      updatePrintItems(updatedItems);
    }
  };

  // Update print items based on selections
  const updatePrintItems = (itemsList) => {
    const selectedItems = itemsList.filter(item => item.print === 'Y');
    setPrintItems(selectedItems);
  };

  // Handle select all checkbox
  const handleSelectAll = (checked) => {
    const updatedItems = items.map(item => ({
      ...item,
      print: checked ? 'Y' : 'N',
      selected: checked
    }));
    
    setItems(updatedItems);
    setSelectAll(checked);
    updatePrintItems(updatedItems);
  };

  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!purchaseNo.trim()) {
      toast.warning('Please enter a Purchase Number');
      return;
    }
    
    // Fetch items for the entered purchase number
    await fetchItemsByPurchaseNo(purchaseNo);
  };
  
  // Refresh handler
  const handleRefresh = () => {
    setPurchaseNo('');
    setPrefix('');
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setHasSearched(false);
    setItems([]);
    setPrintItems([]);
    setSelectAll(false);
    setNoOfPrints(1);
  };

  // Print handler
  const handlePrint = async () => {
    if (printItems.length === 0) {
      toast.warning('No items selected for printing');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // No backend connection - just generate local print
      toast.info('Generating print preview (Backend not connected)');
      
      // Generate print preview
      generatePrintContent({
        items: printItems,
        noOfPrints: noOfPrints,
        purchaseNo: purchaseNo,
        fromDate: fromDate,
        toDate: toDate,
        totalItems: printItems.length
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to print');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate print content - Generate SPSTOREPRN1.txt file
  const generatePrintContent = async(printData) => {
    try {

      console.log("generatePrintContent-------",{printData});
      // Build printer command content
      let content = '';
      
      // Header
      content += `<xpml><page quantity='0' pitch='40.0 mm'></xpml>SIZE 97.5 mm, 40 mm\n`;
      content += `GAP 3 mm, 0 mm\n`;
      content += `SPEED 3\n`;
      content += `DENSITY 14\n`;
      content += `SET RIBBON ON\n`;
      content += `DIRECTION 0,0\n`;
      content += `REFERENCE 0,0\n`;
      content += `OFFSET 0 mm\n`;
      content += `SET PEEL OFF\n`;
      content += `SET CUTTER OFF\n`;
      content += `<xpml></page></xpml><xpml><page quantity='1' pitch='40.0 mm'></xpml>SET TEAR ON\n`;
      content += `CLS\n`;
      content += `CODEPAGE 1252\n`;
      
      // Process each item individually
      const itemsToProcess = previewRows.length > 0 ? previewRows : printData.items;
      const numberOfPrints = printData.noOfPrints || 1;
      
      // Repeat the entire content generation noOfPrints times
      for (let printCopy = 0; printCopy < numberOfPrints; printCopy++) {
        for (let i = 0; i < itemsToProcess.length; i++) {
          const item = itemsToProcess[i];
          
          // Alternate between position 777 (right) and 377 (left) for each item
          const isRightPosition = i % 2 === 0;
          const xPos = isRightPosition ? 777 : 377;
          const qrPos = isRightPosition ? 522 : 122;
          const pricePos = isRightPosition ? 655 : 255;
          const ratePos = isRightPosition ? 628 : 228;
          
          const brand = item.brandName || '';
          const productName = item.itemName || '';
          const modelSize = `${item.modelName || ''}${item.modelName && item.sizeName ? ' ' : ''}${item.sizeName || ''}`.trim() || '';
          const qrCode = item.barcode || item.tagNo || '';
          const sudoCode = item.sudo || prefix || '';
          const supplyInfo = item.supplierName || `SUPPLY${new Date().toLocaleDateString('en-GB').replace(/\//g, '')}${purchaseNo}`;
          const serialNo = String(item.tagNo || item.barcode ).padStart(6, '0');
          const category = item.unit || '';
          const price = (item.mrp || item.preRate || 0).toFixed(2);
          const weight = (item.avgWt || 0).toFixed(3);
          const rate = (item.sRate || item.asRate || 0).toFixed(2);
          
         
          content += `TEXT ${xPos},260,"0",180,8,8,"${brand} ${productName}"\n`;
          content += `TEXT ${xPos},232,"0",180,8,8,"${modelSize}"\n`;
          content += `QRCODE ${qrPos},237,L,5,A,180,M2,S7,"${qrCode}"\n`;
          content += `TEXT ${xPos},199,"0",180,8,8,"${sudoCode}"\n`;
          content += `TEXT ${xPos},129,"0",180,8,8,"${supplyInfo}"\n`;
          content += `TEXT ${xPos},169,"0",180,12,12,"${serialNo}"\n`;
          content += `TEXT ${xPos},67,"0",180,8,8,"${category}"\n`;
          content += `TEXT ${pricePos},42,"0",180,14,14,"Rs.${price}/-"\n`;
          content += `TEXT ${xPos},97,"0",180,10,10,"Wt:${weight}"\n`;
          content += `TEXT ${ratePos},97,"0",180,10,10,"Rate :${rate}"\n`;
          content += `\n`;
          
          // Print after every 2 tags or at the end
          if (i % 2 === 1 || i === itemsToProcess.length - 1) {
            content += `PRINT 1,1\n\n`;
          }
        }
      }
      
      // Footer
      content += `<xpml></page></xpml><xpml><end/></xpml>\n`;
      
      // Create and download the file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SPSTOREPRN.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Print file generated: ${itemsToProcess.length} tags`);
      console.log('Generated print content:', content);
      
    } catch (error) {
      console.error('Error generating print file:', error);
      toast.error('Failed to generate print file');
    }
  };

  const buildPreviewRows = (list) => {
    return list.flatMap((item) => {
      const count = Math.max(0, Math.floor(Number(item.qty) || 0));
      if (count === 0) return [];
      return Array.from({ length: count }, (_, idx) => ({
        ...item,
        _previewIndex: idx + 1,
      }));
    });
  };

  // Calculate selected items based on print='Y'
  const selectedItems = items.filter((item) => item.print === 'Y');
  // Calculate preview rows based on current items with print='Y'
  const previewRows = buildPreviewRows(selectedItems);

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <form onSubmit={handleSearch}>
          <div style={styles.filterRow}>
            {/* LEFT SIDE: Search fields */}
            <div style={styles.leftSide}>
              {/* Purchase No - Popup */}
              {/* From Date */}
              <div style={styles.formField}>
                <label style={styles.label}>From Date:</label>
                <input
                  ref={fromDateRef}
                  type="date"
                  style={focusedField === 'fromDate' ? styles.inputFocused : styles.input}
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  onKeyDown={handleFromDateKeyDown}
                  onFocus={() => setFocusedField('fromDate')}
                  onBlur={() => setFocusedField('')}
                />
              </div>

              {/* To Date */}
              <div style={styles.formField}>
                <label style={styles.label}>To Date:</label>
                <input
                  ref={toDateRef}
                  type="date"
                  style={focusedField === 'toDate' ? styles.inputFocused : styles.input}
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  onKeyDown={handleToDateKeyDown}
                  onFocus={() => setFocusedField('toDate')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Purchase No:</label>
                <input
                  ref={purchaseNoRef}
                  type="text"
                  style={focusedField === 'purchaseNo' ? styles.inputFocused : styles.input}
                  value={purchaseNo}
                  readOnly
                  onClick={() => setShowPurchasePopup(true)}
                  onKeyDown={handlePurchaseNoKeyDown}
                  onFocus={() => setFocusedField('purchaseNo')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Click to select..."
                />
              </div>

              {/* Prefix No */}
              <div style={styles.formField}>
                <label style={styles.label}>Prefix No:</label>
                <input
                  ref={prefixRef}
                  type="text"
                  style={focusedField === 'prefix' ? styles.inputFocused : styles.input}
                  value={prefix}
                  onChange={e => setPrefix(e.target.value)}
                  onKeyDown={handlePrefixKeyDown}
                  onFocus={() => setFocusedField('prefix')}
                  onBlur={() => setFocusedField('')}
                />
              </div>

              
            </div>

            {/* RIGHT SIDE: Buttons */}
            <div style={styles.rightSide}>
              <button ref={searchButtonRef} type="submit" style={styles.button}>
                {isLoading ? 'Loading...' : 'Search'}
              </button>
              <button type="button" style={styles.buttonSecondary} onClick={handleRefresh}>
                Refresh
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div style={styles.tableSection}>
        {/* Main Table */}
        <div style={styles.mainTableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: '50px'}}>S.No</th>
                <th style={{...styles.th, width: '120px'}}>Barcode</th>
                <th style={{...styles.th, width: '150px'}}>Item Name</th>
                <th style={{...styles.th, width: '80px'}}>Qty</th>
                <th style={{...styles.th, width: '80px'}}>Print(Y/N)</th>
                <th style={{...styles.th, width: '80px'}}>Unit</th>
                <th style={{...styles.th, width: '80px'}}>avgWt</th>
                <th style={{...styles.th, width: '80px'}}>S.Rate</th>
                <th style={{...styles.th, width: '100px'}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="9" style={styles.emptyMsg}>
                    {hasSearched 
                      ? 'No items found. Select a purchase number to view items.' 
                      : ''}
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan="9" style={styles.emptyMsg}>
                    Loading items...
                  </td>
                </tr>
              ) : (
                <>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{item.sNo}</td>
                      <td style={styles.td}>{item.barcode}</td>
                      <td style={styles.td}>{item.itemName}</td>
                      <td style={styles.td}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={item.qty}
                          onChange={(e) => handleQtyChange(idx, e.target.value)}
                          onKeyDown={(e) => handleQtyKeyDown(e, idx)}
                          style={{
                            width: '100%',
                            border: 'none',
                            backgroundColor: 'transparent',
                            padding: '4px 2px',
                            fontSize: 'inherit',
                            fontFamily: 'inherit',
                            textAlign: 'center',
                            outline: 'none',
                            cursor: 'text'
                          }}
                        />
                      </td>
                      <td
                        tabIndex="0"
                        style={
                          item.print === 'Y' 
                            ? styles.printCellYes 
                            : styles.printCellNo
                        }
                        onClick={() => togglePrintStatus(idx)}
                        onKeyDown={(e) => handlePrintCellKeyDown(e, idx)}
                      >
                        {item.print}
                      </td>
                      <td style={styles.td}>{item.unit}</td>
                      <td style={styles.td}>{item.avgWt?.toFixed(3)}</td>
                      <td style={styles.td}>₹{item.sRate?.toFixed(2)}</td>
                      <td style={styles.td}>₹{item.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

        {/* Preview Section - Shows print items before actual footer */}
        <div style={styles.previewSection}>
          <div style={styles.previewLabel}>
            Print Preview - Items to Print
          </div>
          <div style={styles.previewTableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{...styles.th, width: '50px'}}>S.No</th>
                  <th style={{...styles.th, width: '120px'}}>Barcode</th>
                  <th style={{...styles.th, width: '150px'}}>Item Name</th>
                  <th style={{...styles.th, width: '80px'}}>Qty</th>
                  <th style={{...styles.th, width: '80px'}}>Print(Y/N)</th>
                  <th style={{...styles.th, width: '80px'}}>Unit</th>
                  <th style={{...styles.th, width: '80px'}}>avgWt</th>
                  <th style={{...styles.th, width: '80px'}}>S.Rate</th>
                  <th style={{...styles.th, width: '100px'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={styles.td}>&nbsp;</td>
                  </tr>
                ) : (
                  previewRows.map((item, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{idx + 1}</td>
                      <td style={styles.td}>{item.barcode || 'N/A'}</td>
                      <td style={styles.td}>{item.itemName || 'N/A'}</td>
                      <td style={styles.td}>1</td>
                      <td style={styles.td}>Y</td>
                      <td style={styles.td}>{item.unit || 'N/A'}</td>
                      <td style={styles.td}>{item.avgWt?.toFixed(3) || '0.000'}</td>
                      <td style={styles.td}>₹{item.sRate?.toFixed(2) || '0.00'}</td>
                      <td style={styles.td}>₹{item.sRate?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Footer Section */}
      <div style={styles.footer}>
        <div style={styles.footerLeft}>          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.medium }}>
              No of Prints:
            </span>
            <input
              type="number"
              style={styles.smallInput}
              value={noOfPrints}
              onChange={(e) => setNoOfPrints(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
          </div>
          <div style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: '#666' }}>
            Tags to print: {previewRows.length}
          </div>
        </div>
        
        <div style={styles.footerRight}>
          <button 
            type="button" 
            style={styles.buttonSecondary}
            onClick={handleRefresh}
          >
            Refresh
          </button>
          <button 
            type="button" 
            style={{
              ...styles.button,
              opacity: printItems.length === 0 ? 0.5 : 1,
              cursor: printItems.length === 0 ? 'not-allowed' : 'pointer'
            }}
            onClick={handlePrint}
            disabled={printItems.length === 0 || isLoading}
          >
            {isLoading ? 'Printing...' : `Print`}
          </button>
        </div>
      </div>

      {/* Purchase Number Popup */}
      {/* <PopupListSelector
        open={showPurchasePopup}
        onClose={() => setShowPurchasePopup(false)}
        onSelect={handlePurchaseNumberSelect}
        fetchItems={fetchPurchaseNumbersForPopup}
        title="Select Purchase Number"
        displayFieldKeys={['code', 'name']}
        searchFields={['code', 'name']}
        columnWidths={{ code: '150px', name: '300px' }}
      /> */}

<PopupListSelector
  open={showPurchasePopup}
  onClose={() => setShowPurchasePopup(false)}
  onSelect={handlePurchaseNumberSelect}
  fetchItems={fetchPurchaseNumbersForPopup}
  title="Select Purchase Number"
  displayFieldKeys={['tagNO']}
  searchFields={['tagNO']}
  columnWidths={{ tagNO: '300px' }} // 🔥 was `code`
/>

    </div>
  );
};

export default TagPrint;