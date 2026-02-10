import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { get } from '../../../api/apiService';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../context/AuthContext';
import { usePrintPermission } from '../../../hooks/usePrintPermission';
import { PrintButton, ExportButton } from '../../../components/Buttons/ActionButtons';
import ConfirmationPopup from '../../../components/ConfirmationPopup/ConfirmationPopup';

// Helper function to convert YYYY-MM-DD to DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const DailyReport = () => {
  // --- AUTH & PERMISSIONS ---
  const { userData } = useAuth();
  const { hasPrintPermission, checkPrintPermission } = usePrintPermission('DAILY_REPORT');

  // --- REFS ---
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const searchButtonRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  // --- Company Name Popup State ---
  const [companyName, setCompanyName] = useState('');
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');

  // Fetch company list when popup opens
  useEffect(() => {
    if (showCompanyPopup) {
      setCompanyLoading(true);
      get('/CompanyCreation/GetCompanyList')
        .then(data => {
          setCompanyList(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          setCompanyList([]);
        })
        .finally(() => setCompanyLoading(false));
    }
  }, [showCompanyPopup]);

  // Set default dates when component mounts
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
    
    if (fromDateRef.current) {
      setTimeout(() => {
        fromDateRef.current.focus();
      }, 100);
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
    footerSection: {
      flex: '0 0 auto',
      backgroundColor: 'white',
      borderTop: '1px solid #e0e0e0',
      padding: screenSize.isMobile ? '10px' : screenSize.isTablet ? '12px' : '16px',
      boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minHeight: screenSize.isMobile ? '180px' : screenSize.isTablet ? '200px' : '170px',
      maxHeight: 'none',
      
    },
    footerButtonContainer: {
      display: 'flex',
      gap: '10px',
      backgroundColor: '#ffffff',
      padding: '0.4rem',
      borderRadius: '50px',
      border: '2px solid #1976d2',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
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
    balanceInputContainer: {
      display: 'flex',
      alignItems: 'stretch',
      width: '100%',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      overflow: 'hidden',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      transition: 'all 0.2s ease',
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
    },
    balanceInputContainerFocused: {
      display: 'flex',
      alignItems: 'stretch',
      width: '100%',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      overflow: 'hidden',
      border: '2px solid #1B91DA',
      backgroundColor: 'white',
      transition: 'all 0.2s ease',
      height: screenSize.isMobile ? '38px' : screenSize.isTablet ? '36px' : '40px',
    },
    balanceInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      border: 'none',
      borderRadius: '0',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      outline: 'none',
      width: '100%',
      flex: 1,
      backgroundColor: 'transparent',
    },
    balanceInputFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      border: 'none',
      borderRadius: '0',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      outline: 'none',
      width: '100%',
      flex: 1,
      backgroundColor: 'transparent',
    },
    balanceDropdown: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '0 8px' : screenSize.isTablet ? '0 10px' : '0 12px',
      border: 'none',
      borderLeft: '1px solid #ddd',
      borderRadius: '0',
      backgroundColor: '#f0f0f0',
      color: '#666',
      cursor: 'default',
      minWidth: '50px',
      textAlign: 'center',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    balanceDropdownFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '0 8px' : screenSize.isTablet ? '0 10px' : '0 12px',
      border: 'none',
      borderLeft: '1px solid #1B91DA',
      borderRadius: '0',
      backgroundColor: '#e8f4fd',
      color: '#1B91DA',
      cursor: 'default',
      minWidth: '50px',
      textAlign: 'center',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      height: screenSize.isMobile ? 'calc(100vh - 280px)' : screenSize.isTablet ? 'calc(100vh - 300px)' : 'calc(100vh - 320px)',
      maxHeight: screenSize.isMobile ? 'calc(100vh - 280px)' : screenSize.isTablet ? 'calc(100vh - 300px)' : 'calc(100vh - 320px)',
      minHeight: '200px',
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
    totalRow: {
      background: '#e6f7ff',
      fontWeight: 700,
      color: '#096dd9',
    },
    emptyMsg: {
      textAlign: 'center',
      color: '#888',
      fontSize: '16px',
      padding: '32px 0',
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#1B91DA',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    // Company Popup Styles
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
      zIndex: 9999,
      backdropFilter: 'blur(2px)',
    },
    popupContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: screenSize.isMobile ? '90%' : screenSize.isTablet ? '500px' : '550px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden',
    },
    popupHeader: {
      backgroundColor: '#1976d2',
      color: 'white',
      padding: screenSize.isMobile ? '16px' : '20px 24px',
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '28px',
      cursor: 'pointer',
      padding: '0',
      lineHeight: '1',
      transition: 'transform 0.2s ease',
    },
    searchContainer: {
      padding: screenSize.isMobile ? '12px' : '16px 24px',
      borderBottom: '1px solid #e0e0e0',
    },
    searchInput: {
      width: '100%',
      padding: screenSize.isMobile ? '8px 12px' : '10px 14px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      border: '1px solid #ddd',
      borderRadius: '6px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease',
    },
    companyList: {
      flex: 1,
      overflowY: 'auto',
      padding: screenSize.isMobile ? '12px' : '16px 24px',
      minHeight: '200px',
      maxHeight: '400px',
    },
    companyItem: {
      display: 'flex',
      alignItems: 'center',
      padding: screenSize.isMobile ? '10px 8px' : '12px 10px',
      cursor: 'pointer',
      borderRadius: '6px',
      marginBottom: '6px',
      transition: 'all 0.2s ease',
      backgroundColor: 'transparent',
    },
    selectedCompanyItem: {
      display: 'flex',
      alignItems: 'center',
      padding: screenSize.isMobile ? '10px 8px' : '12px 10px',
      cursor: 'pointer',
      borderRadius: '6px',
      marginBottom: '6px',
      transition: 'all 0.2s ease',
      backgroundColor: '#e3f2fd',
    },
    companyCheckbox: {
      width: '20px',
      height: '20px',
      border: '2px solid #bbb',
      borderRadius: '4px',
      marginRight: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.2s ease',
    },
    selectedCompanyCheckbox: {
      width: '20px',
      height: '20px',
      border: '2px solid #1976d2',
      borderRadius: '4px',
      marginRight: '12px',
      backgroundColor: '#1976d2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.2s ease',
    },
    checkmark: {
      color: 'white',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    companyText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: '#333',
      flex: 1,
    },
    popupActions: {
      borderTop: '1px solid #e0e0e0',
      padding: screenSize.isMobile ? '12px' : '16px 24px',
      backgroundColor: '#f9f9f9',
    },
    popupButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
    },
    popupButton: {
      padding: screenSize.isMobile ? '8px 20px' : '10px 28px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
    },
    clearButton: {
      backgroundColor: 'white',
      color: '#d32f2f',
      border: '2px solid #d32f2f',
    },
    okButton: {
      backgroundColor: '#1976d2',
      color: 'white',
      border: 'none',
    },
  };

  // --- API HANDLER ---
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!fromDate || !toDate) {
      toast.error('Please select both from and to dates');
      return;
    }
    
    setIsLoading(true);
    try {
      // Get company code from user data
      const compCode = userData?.companyCode || '001';
      
      // API call to fetch daily report data
      const endpoint = API_ENDPOINTS.DAILY_REPORT.GET_DAILY_REPORT_DETAILS(fromDate, toDate, compCode, 1, 20);
      console.log('Fetching from:', endpoint);
      
      const response = await get(endpoint);
      console.log('API Response:', response);
      
      if (response) {
        // The response might be the data directly or wrapped in a data property
        const data = response.data || response;
        
        if (data && Object.keys(data).length > 0) {
          // Transform the data to match your expected structure
          const transformedData = {
            salesEntryData: data.salesEntryData || [],
            paymentData: data.paymentData || [],
            receiptData: data.receiptData || [],
            purchaseData: data.purchaseData || [],
            purchaseReturnData: data.purchaseReturnData || [],
            salesReturnData: data.salesReturnData || [],
            scrapprocurement: data.scrapprocurement || [],
            tenderData: data.tenderData || [],
            
            // Additional data if needed for calculations
            salesEntrybalance: data.salesEntrybalance || [],
            salesReturnbalance: data.salesReturnbalance || [],
            purchasebalance: data.purchasebalance || [],
            purchaseReturnbalance: data.purchaseReturnbalance || [],
            scrapbalance: data.scrapbalance || [],
            receiptcredit: data.receiptcredit || [],
            paymnetcredit: data.paymnetcredit || [],
            
            // Balance data
            openingBalance: data.openingBalance || null,
            closingBalance: data.closingBalance || null
          };
          
          console.log('Transformed Data:', transformedData);
          
          setReportData(transformedData);
          setShowReport(true);
          toast.success(`Daily report loaded successfully with ${Object.keys(transformedData).filter(key => transformedData[key].length > 0).length} sections`);
        } else {
          setReportData(null);
          toast.warning('No data found for the selected date range');
        }
      } else {
        setReportData(null);
        toast.error('Empty response from server');
      }
      
    } catch (error) {
      console.error('Error fetching daily report:', error);
      toast.error(`Failed to load daily report: ${error.message}`);
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
    setShowReport(false);
    setReportData(null);
  };

  // Keyboard navigation handlers
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

  // Helper functions to calculate totals
  const calculateSectionTotal = (data, field) => {
    if (!data || !Array.isArray(data)) return '0.00';
    return data.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0).toFixed(2);
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(numAmount);
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    return formatDateToDDMMYYYY(dateString);
  };

  // --- PRINT & EXPORT HANDLERS ---
  const handlePrintClick = () => {
    if (!checkPrintPermission()) return;

    if (!reportData || !showReport) {
      toast.warning('Please search and load report data before printing');
      return;
    }

    setShowPrintConfirm(true);
  };

  const handlePrintConfirm = () => {
    setShowPrintConfirm(false);
    try {
      toast.success('Preparing report for printing...');
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Daily Report - ${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1B91DA; padding-bottom: 10px; }
            .print-title { color: #1B91DA; font-size: 24px; font-weight: bold; margin: 0; }
            .print-date { color: #666; margin: 5px 0; }
            .section-title { background: #f0f8ff; padding: 10px; font-weight: bold; margin: 20px 0 10px 0; border-left: 4px solid #1B91DA; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #1B91DA; color: white; }
            .total-row { background: #e6f7ff; font-weight: bold; }
            .amount { text-align: right; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1 class="print-title">Daily Report</h1>
            <p class="print-date">From: ${formatDisplayDate(fromDate)} | To: ${formatDisplayDate(toDate)}</p>
            <p class="print-date">Company: ${userData?.companyCode || '001'}</p>
          </div>
          ${generatePrintContent()}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to prepare report for printing');
    }
  };

  const generatePrintContent = () => {
    if (!reportData) return '';
    
    let content = '';
    
    // Opening Balance
    if (reportData.openingBalance) {
      content += `
        <div class="section-title" style="background-color: #e8f5e9; color: #2e7d32;">OPENING BALANCE</div>
        <table>
          <tbody>
            <tr>
              <td colspan="2" style="text-align: left;"><strong>Opening Balance</strong></td>
              <td colspan="2" class="amount" style="color: ${reportData.openingBalance.type === 'DR' ? '#d32f2f' : '#1976d2'};">
                <strong>${formatCurrency(reportData.openingBalance.amount || 0)} ${reportData.openingBalance.type || 'DR'}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Sales Entry Data
    if (reportData.salesEntryData && reportData.salesEntryData.length > 0) {
      content += `
        <div class="section-title">SALES ENTRY</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.salesEntryData.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.partyName || ''}</td>
                <td class="amount">${item.qty || 0}</td>
                <td class="amount">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.salesEntryData, 'qty')}</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.salesEntryData, 'amount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Payment Vouchers Data
    if (reportData.paymentData && reportData.paymentData.length > 0) {
      content += `
        <div class="section-title">PAYMENT VOUCHERS</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.paymentData.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.partyName || ''}</td>
                <td class="amount">-</td>
                <td class="amount">${formatCurrency(item.billAmount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>-</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.paymentData, 'billAmount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Receipt Vouchers Data
    if (reportData.receiptData && reportData.receiptData.length > 0) {
      content += `
        <div class="section-title">RECEIPT VOUCHERS</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.receiptData.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.partyName || ''}</td>
                <td class="amount">-</td>
                <td class="amount">${formatCurrency(item.billAmount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>-</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.receiptData, 'billAmount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Purchase Data
    if (reportData.purchaseData && reportData.purchaseData.length > 0) {
      content += `
        <div class="section-title">PURCHASE DATA</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.purchaseData.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.refName || ''}</td>
                <td class="amount">${item.qty || 0}</td>
                <td class="amount">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.purchaseData, 'qty')}</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.purchaseData, 'amount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Purchase Return Data
    if (reportData.purchaseReturnData && reportData.purchaseReturnData.length > 0) {
      content += `
        <div class="section-title">PURCHASE RETURNS</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.purchaseReturnData.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.refName || ''}</td>
                <td class="amount">${item.qty || 0}</td>
                <td class="amount">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.purchaseReturnData, 'qty')}</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.purchaseReturnData, 'amount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Sales Return Data
    if (reportData.salesReturnData && reportData.salesReturnData.length > 0) {
      content += `
        <div class="section-title">SALES RETURNS</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.salesReturnData.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.partyName || ''}</td>
                <td class="amount">${item.qty || 0}</td>
                <td class="amount">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.salesReturnData, 'qty')}</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.salesReturnData, 'amount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Scrap Procurement Data
    if (reportData.scrapprocurement && reportData.scrapprocurement.length > 0) {
      content += `
        <div class="section-title">SCRAP PROCUREMENT</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.scrapprocurement.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.partyName || ''}</td>
                <td class="amount">${item.qty || 0}</td>
                <td class="amount">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.scrapprocurement, 'qty')}</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.scrapprocurement, 'amount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Sales Entry Balance
    if (reportData.salesEntrybalance && reportData.salesEntrybalance.length > 0) {
      content += `
        <div class="section-title">SALES ENTRY BALANCE</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.salesEntrybalance.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.partyName || ''}</td>
                <td class="amount">-</td>
                <td class="amount">${formatCurrency(item.cashAmt || item.amount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>-</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.salesEntrybalance, 'cashAmt') || calculateSectionTotal(reportData.salesEntrybalance, 'amount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Sales Return Balance
    if (reportData.salesReturnbalance && reportData.salesReturnbalance.length > 0) {
      content += `
        <div class="section-title">SALES RETURN BALANCE</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.salesReturnbalance.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.partyName || ''}</td>
                <td class="amount">-</td>
                <td class="amount">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>-</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.salesReturnbalance, 'amount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Purchase Balance
    if (reportData.purchasebalance && reportData.purchasebalance.length > 0) {
      content += `
        <div class="section-title">PURCHASE BALANCE</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.purchasebalance.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.refName || ''}</td>
                <td class="amount">-</td>
                <td class="amount">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>-</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.purchasebalance, 'amount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Purchase Return Balance
    if (reportData.purchaseReturnbalance && reportData.purchaseReturnbalance.length > 0) {
      content += `
        <div class="section-title">PURCHASE RETURN BALANCE</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.purchaseReturnbalance.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.refName || ''}</td>
                <td class="amount">-</td>
                <td class="amount">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>-</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.purchaseReturnbalance, 'amount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Scrap Balance
    if (reportData.scrapbalance && reportData.scrapbalance.length > 0) {
      content += `
        <div class="section-title">SCRAP BALANCE</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.scrapbalance.map(item => `
              <tr>
                <td>${item.voucherNo || ''}</td>
                <td>${item.partyName || ''}</td>
                <td class="amount">${item.qty || '-'}</td>
                <td class="amount">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>-</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.scrapbalance, 'amount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Payment Credit
    if (reportData.paymnetcredit && reportData.paymnetcredit.length > 0) {
      content += `
        <div class="section-title">PAYMENT CREDIT</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.paymnetcredit.map(item => `
              <tr>
                <td>${item.vouchNo || ''}</td>
                <td>${item.partyName || ''}</td>
                <td class="amount">-</td>
                <td class="amount">${formatCurrency(item.debitAMt || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>-</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.paymnetcredit, 'debitAMt'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Receipt Credit
    if (reportData.receiptcredit && reportData.receiptcredit.length > 0) {
      content += `
        <div class="section-title">RECEIPT CREDIT</div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Party Name</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.receiptcredit.map(item => `
              <tr>
                <td>${item.vouchNo || ''}</td>
                <td>${item.partyName || ''}</td>
                <td class="amount">-</td>
                <td class="amount">${formatCurrency(item.creditAmount || 0)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total</strong></td>
              <td class="amount"><strong>-</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.receiptcredit, 'creditAmount'))}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Tender Data (Full Details with 15 columns)
    if (reportData.tenderData && reportData.tenderData.length > 0) {
      content += `
        <div class="section-title" style="background-color: #fff9c4;">TENDER DETAILS</div>
        <table style="font-size: 10px;">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Total Given</th>
              <th>UPI Amount</th>
              <th>UPI Party</th>
              <th>Card Amount</th>
              <th>Card Party</th>
              <th>₹500</th>
              <th>₹200</th>
              <th>₹100</th>
              <th>₹50</th>
              <th>₹20</th>
              <th>₹10</th>
              <th>₹5</th>
              <th>₹2</th>
              <th>₹1</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.tenderData.map(item => `
              <tr>
                <td>${item.invoiceNo || 'N/A'}</td>
                <td class="amount" style="font-weight: bold;">${formatCurrency(item.givenTotal || 0)}</td>
                <td class="amount">${formatCurrency(item.upiAmount || 0)}</td>
                <td>${item.upiPartyName || '-'}</td>
                <td class="amount">${formatCurrency(item.cardAmount || 0)}</td>
                <td>${item.cardPartyName || '-'}</td>
                <td class="amount">${item.r500 || 0}</td>
                <td class="amount">${item.r200 || 0}</td>
                <td class="amount">${item.r100 || 0}</td>
                <td class="amount">${item.r50 || 0}</td>
                <td class="amount">${item.r20 || 0}</td>
                <td class="amount">${item.r10 || 0}</td>
                <td class="amount">${item.r5 || 0}</td>
                <td class="amount">${item.r2 || 0}</td>
                <td class="amount">${item.r1 || 0}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td><strong>Total</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.tenderData, 'givenTotal'))}</strong></td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.tenderData, 'upiAmount'))}</strong></td>
              <td>-</td>
              <td class="amount"><strong>${formatCurrency(calculateSectionTotal(reportData.tenderData, 'cardAmount'))}</strong></td>
              <td>-</td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.tenderData, 'r500')}</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.tenderData, 'r200')}</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.tenderData, 'r100')}</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.tenderData, 'r50')}</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.tenderData, 'r20')}</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.tenderData, 'r10')}</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.tenderData, 'r5')}</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.tenderData, 'r2')}</strong></td>
              <td class="amount"><strong>${calculateSectionTotal(reportData.tenderData, 'r1')}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    // Closing Balance
    if (reportData.closingBalance) {
      content += `
        <div class="section-title" style="background-color: #fff3e0; color: #e65100;">CLOSING BALANCE</div>
        <table>
          <tbody>
            <tr>
              <td colspan="2" style="text-align: left;"><strong>Closing Balance</strong></td>
              <td colspan="2" class="amount" style="color: ${reportData.closingBalance.type === 'DR' ? '#d32f2f' : '#1976d2'};">
                <strong>${formatCurrency(reportData.closingBalance.amount || 0)} ${reportData.closingBalance.type || 'CR'}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    return content;
  };

  const handleExportClick = () => {
    if (!checkPrintPermission()) return;

    if (!reportData || !showReport) {
      toast.warning('Please search and load report data before exporting');
      return;
    }

    setShowExportConfirm(true);
  };

  const handleExportConfirm = () => {
    setShowExportConfirm(false);
    try {
      toast.success('Preparing Excel export...');
      
      // Create CSV content
      let csvContent = generateCSVContent();
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `DailyReport_${fromDate}_to_${toDate}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully!');
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const generateCSVContent = () => {
    if (!reportData) return '';
    
    let csvContent = '\uFEFF'; // BOM for UTF-8
    csvContent += `Daily Report - From: ${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)}\n`;
    csvContent += `Company: ${userData?.companyCode || '001'}\n\n`;
    
    // Opening Balance
    if (reportData.openingBalance) {
      csvContent += 'OPENING BALANCE\n';
      csvContent += `Opening Balance,${reportData.openingBalance.amount || 0},${reportData.openingBalance.type || 'DR'}\n\n`;
    }
    
    // Sales Entry Data
    if (reportData.salesEntryData && reportData.salesEntryData.length > 0) {
      csvContent += 'SALES ENTRY\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.salesEntryData.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.partyName || ''}","${item.qty || 0}","${item.amount || 0}"\n`;
      });
      
      csvContent += `Total,,${calculateSectionTotal(reportData.salesEntryData, 'qty')},${calculateSectionTotal(reportData.salesEntryData, 'amount')}\n\n`;
    }
    
    // Payment Vouchers Data
    if (reportData.paymentData && reportData.paymentData.length > 0) {
      csvContent += 'PAYMENT VOUCHERS\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.paymentData.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.partyName || ''}","-","${item.billAmount || 0}"\n`;
      });
      
      csvContent += `Total,,-,${calculateSectionTotal(reportData.paymentData, 'billAmount')}\n\n`;
    }
    
    // Receipt Vouchers Data
    if (reportData.receiptData && reportData.receiptData.length > 0) {
      csvContent += 'RECEIPT VOUCHERS\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.receiptData.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.partyName || ''}","-","${item.billAmount || 0}"\n`;
      });
      
      csvContent += `Total,,-,${calculateSectionTotal(reportData.receiptData, 'billAmount')}\n\n`;
    }
    
    // Purchase Data
    if (reportData.purchaseData && reportData.purchaseData.length > 0) {
      csvContent += 'PURCHASE DATA\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.purchaseData.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.refName || ''}","${item.qty || 0}","${item.amount || 0}"\n`;
      });
      
      csvContent += `Total,,${calculateSectionTotal(reportData.purchaseData, 'qty')},${calculateSectionTotal(reportData.purchaseData, 'amount')}\n\n`;
    }
    
    // Purchase Return Data
    if (reportData.purchaseReturnData && reportData.purchaseReturnData.length > 0) {
      csvContent += 'PURCHASE RETURNS\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.purchaseReturnData.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.refName || ''}","${item.qty || 0}","${item.amount || 0}"\n`;
      });
      
      csvContent += `Total,,${calculateSectionTotal(reportData.purchaseReturnData, 'qty')},${calculateSectionTotal(reportData.purchaseReturnData, 'amount')}\n\n`;
    }
    
    // Sales Return Data
    if (reportData.salesReturnData && reportData.salesReturnData.length > 0) {
      csvContent += 'SALES RETURNS\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.salesReturnData.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.partyName || ''}","${item.qty || 0}","${item.amount || 0}"\n`;
      });
      
      csvContent += `Total,,${calculateSectionTotal(reportData.salesReturnData, 'qty')},${calculateSectionTotal(reportData.salesReturnData, 'amount')}\n\n`;
    }
    
    // Scrap Procurement Data
    if (reportData.scrapprocurement && reportData.scrapprocurement.length > 0) {
      csvContent += 'SCRAP PROCUREMENT\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.scrapprocurement.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.partyName || ''}","${item.qty || 0}","${item.amount || 0}"\n`;
      });
      
      csvContent += `Total,,${calculateSectionTotal(reportData.scrapprocurement, 'qty')},${calculateSectionTotal(reportData.scrapprocurement, 'amount')}\n\n`;
    }
    
    // Sales Entry Balance
    if (reportData.salesEntrybalance && reportData.salesEntrybalance.length > 0) {
      csvContent += 'SALES ENTRY BALANCE\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.salesEntrybalance.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.partyName || ''}","-","${item.cashAmt || item.amount || 0}"\n`;
      });
      
      csvContent += `Total,,-,${calculateSectionTotal(reportData.salesEntrybalance, 'cashAmt') || calculateSectionTotal(reportData.salesEntrybalance, 'amount')}\n\n`;
    }
    
    // Sales Return Balance
    if (reportData.salesReturnbalance && reportData.salesReturnbalance.length > 0) {
      csvContent += 'SALES RETURN BALANCE\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.salesReturnbalance.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.partyName || ''}","-","${item.amount || 0}"\n`;
      });
      
      csvContent += `Total,,-,${calculateSectionTotal(reportData.salesReturnbalance, 'amount')}\n\n`;
    }
    
    // Purchase Balance
    if (reportData.purchasebalance && reportData.purchasebalance.length > 0) {
      csvContent += 'PURCHASE BALANCE\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.purchasebalance.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.refName || ''}","-","${item.amount || 0}"\n`;
      });
      
      csvContent += `Total,,-,${calculateSectionTotal(reportData.purchasebalance, 'amount')}\n\n`;
    }
    
    // Purchase Return Balance
    if (reportData.purchaseReturnbalance && reportData.purchaseReturnbalance.length > 0) {
      csvContent += 'PURCHASE RETURN BALANCE\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.purchaseReturnbalance.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.refName || ''}","-","${item.amount || 0}"\n`;
      });
      
      csvContent += `Total,,-,${calculateSectionTotal(reportData.purchaseReturnbalance, 'amount')}\n\n`;
    }
    
    // Scrap Balance
    if (reportData.scrapbalance && reportData.scrapbalance.length > 0) {
      csvContent += 'SCRAP BALANCE\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.scrapbalance.forEach(item => {
        csvContent += `"${item.voucherNo || ''}","${item.partyName || ''}","${item.qty || '-'}","${item.amount || 0}"\n`;
      });
      
      csvContent += `Total,,-,${calculateSectionTotal(reportData.scrapbalance, 'amount')}\n\n`;
    }
    
    // Payment Credit
    if (reportData.paymnetcredit && reportData.paymnetcredit.length > 0) {
      csvContent += 'PAYMENT CREDIT\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.paymnetcredit.forEach(item => {
        csvContent += `"${item.vouchNo || ''}","${item.partyName || ''}","-","${item.debitAMt || 0}"\n`;
      });
      
      csvContent += `Total,,-,${calculateSectionTotal(reportData.paymnetcredit, 'debitAMt')}\n\n`;
    }
    
    // Receipt Credit
    if (reportData.receiptcredit && reportData.receiptcredit.length > 0) {
      csvContent += 'RECEIPT CREDIT\n';
      csvContent += 'Voucher No,Party Name,Qty,Amount\n';
      
      reportData.receiptcredit.forEach(item => {
        csvContent += `"${item.vouchNo || ''}","${item.partyName || ''}","-","${item.creditAmount || 0}"\n`;
      });
      
      csvContent += `Total,,-,${calculateSectionTotal(reportData.receiptcredit, 'creditAmount')}\n\n`;
    }
    
    // Tender Data (Full Details with 15 columns)
    if (reportData.tenderData && reportData.tenderData.length > 0) {
      csvContent += 'TENDER DETAILS\n';
      csvContent += 'Invoice No,Total Given,UPI Amount,UPI Party,Card Amount,Card Party,₹500,₹200,₹100,₹50,₹20,₹10,₹5,₹2,₹1\n';
      
      reportData.tenderData.forEach(item => {
        csvContent += `"${item.invoiceNo || ''}","${item.givenTotal || 0}","${item.upiAmount || 0}","${item.upiPartyName || '-'}","${item.cardAmount || 0}","${item.cardPartyName || '-'}","${item.r500 || 0}","${item.r200 || 0}","${item.r100 || 0}","${item.r50 || 0}","${item.r20 || 0}","${item.r10 || 0}","${item.r5 || 0}","${item.r2 || 0}","${item.r1 || 0}"\n`;
      });
      
      csvContent += `Total,${calculateSectionTotal(reportData.tenderData, 'givenTotal')},${calculateSectionTotal(reportData.tenderData, 'upiAmount')},-,${calculateSectionTotal(reportData.tenderData, 'cardAmount')},-,${calculateSectionTotal(reportData.tenderData, 'r500')},${calculateSectionTotal(reportData.tenderData, 'r200')},${calculateSectionTotal(reportData.tenderData, 'r100')},${calculateSectionTotal(reportData.tenderData, 'r50')},${calculateSectionTotal(reportData.tenderData, 'r20')},${calculateSectionTotal(reportData.tenderData, 'r10')},${calculateSectionTotal(reportData.tenderData, 'r5')},${calculateSectionTotal(reportData.tenderData, 'r2')},${calculateSectionTotal(reportData.tenderData, 'r1')}\n\n`;
    }
    
    // Closing Balance
    if (reportData.closingBalance) {
      csvContent += 'CLOSING BALANCE\n';
      csvContent += `Closing Balance,${reportData.closingBalance.amount || 0},${reportData.closingBalance.type || 'CR'}\n\n`;
    }
    
    return csvContent;
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <form onSubmit={handleSearch}>
          <div style={styles.filterRow}>
            {/* LEFT SIDE: Search fields */}
            <div style={styles.leftSide}>
              {/* Company Name Input with Popup */}
              
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
                  required
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
                  required
                />
              </div>
              <div style={{...styles.formField, flex: screenSize.isMobile || screenSize.isTablet ? '1 1 100%' : '1 1 auto', minWidth: screenSize.isMobile || screenSize.isTablet ? '100%' : '250px'}}>
                <label style={styles.label}>Company Name:</label>
                <input
                  type="text"
                  style={focusedField === 'companyName' ? styles.inputFocused : styles.input}
                  value={companyName}
                  onClick={() => setShowCompanyPopup(true)}
                  onFocus={() => setFocusedField('companyName')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Select Company"
                  readOnly
                  required
                />
              </div>
            </div>
            {/* RIGHT SIDE: Buttons */}
            <div style={styles.rightSide}>
              <button ref={searchButtonRef} type="submit" style={styles.button} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Search'}
              </button>
              <button type="button" style={styles.buttonSecondary} onClick={handleRefresh}>Refresh</button>
            </div>

          
          </div>
          {showCompanyPopup && (
          <div style={styles.popupOverlay} onClick={() => setShowCompanyPopup(false)}>
            <div style={styles.popupContent} onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div style={styles.popupHeader}>
                Select Company
                <button 
                  style={styles.closeButton}
                  onClick={() => setShowCompanyPopup(false)}
                  onMouseEnter={(e) => e.target.style.transform = 'rotate(90deg)'}
                  onMouseLeave={(e) => e.target.style.transform = 'rotate(0deg)'}
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
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
              
              {/* Company List */}
              <div style={styles.companyList}>
                {companyLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading...</div>
                ) : (
                  <>
                    {/* ALL option */}
                    <div 
                      style={companyName === 'ALL' ? styles.selectedCompanyItem : styles.companyItem}
                      onClick={() => setCompanyName('ALL')}
                      onMouseEnter={(e) => {
                        if (companyName !== 'ALL') {
                          e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (companyName !== 'ALL') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={companyName === 'ALL' ? styles.selectedCompanyCheckbox : styles.companyCheckbox}>
                        {companyName === 'ALL' && <div style={styles.checkmark}>✓</div>}
                      </div>
                      <span style={styles.companyText}>ALL</span>
                    </div>
                    
                    {/* Individual companies */}
                    {companyList
                      .filter(company => 
                        company.fcompname.toLowerCase().includes(companySearchTerm.toLowerCase())
                      )
                      .map((company) => {
                      const isSelected = companyName === company.fcompname;
                      return (
                        <div 
                          key={company.fcompcode} 
                          style={isSelected ? styles.selectedCompanyItem : styles.companyItem}
                          onClick={() => setCompanyName(company.fcompname)}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#f5f5f5';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <div style={isSelected ? styles.selectedCompanyCheckbox : styles.companyCheckbox}>
                            {isSelected && <div style={styles.checkmark}>✓</div>}
                          </div>
                          <span style={styles.companyText}>{company.fcompname}</span>
                          <span style={{ color: '#888', fontSize: '13px', marginLeft: '8px' }}>Code: {company.fcompcode}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              
              {/* Footer Actions */}
              <div style={styles.popupActions}>
                <div style={styles.popupButtons}>
                  <button 
                    style={{...styles.popupButton, ...styles.clearButton}}
                    onClick={() => setCompanyName('')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    Clear
                  </button>
                  <button 
                    style={{...styles.popupButton, ...styles.okButton}}
                    onClick={() => setShowCompanyPopup(false)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        </form>
        {/* Company Popup */}


        
        {/* Opening Balance Section */}
        {showReport && reportData && reportData.openingBalance && (
          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '10px',
            borderRadius: '8px',
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',           
            maxWidth: '400px'
          }}>
            <span style={{
              fontSize: TYPOGRAPHY.fontSize.lg,
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              color: '#2e7d32',
              textAlign: 'left'
            }}>
              Opening Balance
            </span>
            <span style={{
              fontSize: TYPOGRAPHY.fontSize.xl,
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              color: reportData.openingBalance.type === 'DR' ? '#d32f2f' : '#1976d2'
            }}>
              {formatCurrency(reportData.openingBalance.amount || 0)} {reportData.openingBalance.type || 'DR'}
            </span>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div style={styles.tableSection}>
        {/* Main Table */}
        <div style={styles.mainTableContainer}>
          {!showReport ? (
            <div style={styles.emptyMsg}>
              <p>Select date range and click Search to view daily report</p>
            </div>
          ) : isLoading ? (
            <div style={styles.emptyMsg}>Loading report data...</div>
          ) : reportData ? (
            <div style={{ padding: '20px' }}>
              <h2 style={{ 
                textAlign: 'center', 
                marginBottom: '30px', 
                color: '#1B91DA',
                fontSize: TYPOGRAPHY.fontSize.xl,
                fontWeight: TYPOGRAPHY.fontWeight.bold
              }}>
             
              </h2>

              {/* Main Table with Left and Right Sections */}
              <div style={{
                display: 'flex',
                gap: '20px',
                flexDirection: screenSize.isMobile ? 'column' : 'row',
                maxHeight: 'calc(100vh - 450px)',
                minHeight: '400px'
              }}>
                
                {/* LEFT SIDE: Transaction Data */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <table style={{...styles.table, width: '100%'}}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Voucher No</th>
                        <th style={styles.th}>Party Name</th>
                        <th style={styles.th}>Qty</th>
                        <th style={styles.th}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      
                      {/* Sales Entry Section */}
                      {reportData.salesEntryData && reportData.salesEntryData.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#e3f2fd'}}>
                              SALES ENTRY
                            </td>
                          </tr>
                          {reportData.salesEntryData.map((item, index) => (
                            <tr key={`sales-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.partyName || '-'}</td>
                              <td style={styles.td}>{item.qty || 0}</td>
                              <td style={styles.td}>{formatCurrency(item.amount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Sales Entry Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.salesEntryData, 'amount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Sales Return Data Section */}
                      {reportData.salesReturnData && reportData.salesReturnData.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#fff3e0'}}>
                              SALES RETURNS
                            </td>
                          </tr>
                          {reportData.salesReturnData.map((item, index) => (
                            <tr key={`salesReturn-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.partyName || '-'}</td>
                              <td style={styles.td}>{item.qty || 0}</td>
                              <td style={styles.td}>{formatCurrency(item.amount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Sales Return Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.salesReturnData, 'amount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Purchase Data Section */}
                      {reportData.purchaseData && reportData.purchaseData.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#e8f5e9'}}>
                              PURCHASE DATA
                            </td>
                          </tr>
                          {reportData.purchaseData.map((item, index) => (
                            <tr key={`purchase-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.refName || '-'}</td>
                              <td style={styles.td}>{item.qty || 0}</td>
                              <td style={styles.td}>{formatCurrency(item.amount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Purchase Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.purchaseData, 'amount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Purchase Return Data Section */}
                      {reportData.purchaseReturnData && reportData.purchaseReturnData.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#fce4ec'}}>
                              PURCHASE RETURNS
                            </td>
                          </tr>
                          {reportData.purchaseReturnData.map((item, index) => (
                            <tr key={`purchaseReturn-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.refName || '-'}</td>
                              <td style={styles.td}>{item.qty || 0}</td>
                              <td style={styles.td}>{formatCurrency(item.amount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Purchase Return Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.purchaseReturnData, 'amount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Scrap Procurement Section */}
                      {reportData.scrapprocurement && reportData.scrapprocurement.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#f3e5f5'}}>
                              SCRAP PROCUREMENT
                            </td>
                          </tr>
                          {reportData.scrapprocurement.map((item, index) => (
                            <tr key={`scrap-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.partyName || '-'}</td>
                              <td style={styles.td}>{item.qty || 0}</td>
                              <td style={styles.td}>{formatCurrency(item.amount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Scrap Procurement Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.scrapprocurement, 'amount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Payment Vouchers Section */}
                      {reportData.paymentData && reportData.paymentData.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#ffebee'}}>
                              PAYMENT VOUCHERS
                            </td>
                          </tr>
                          {reportData.paymentData.map((item, index) => (
                            <tr key={`payment-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.partyName || '-'}</td>
                              <td style={styles.td}>-</td>
                              <td style={styles.td}>{formatCurrency(item.billAmount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Payment Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.paymentData, 'billAmount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Receipt Vouchers Section */}
                      {reportData.receiptData && reportData.receiptData.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#e0f2f1'}}>
                              RECEIPT VOUCHERS
                            </td>
                          </tr>
                          {reportData.receiptData.map((item, index) => (
                            <tr key={`receipt-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.partyName || '-'}</td>
                              <td style={styles.td}>-</td>
                              <td style={styles.td}>{formatCurrency(item.billAmount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Receipt Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.receiptData, 'billAmount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Show message if no left-side data */}
                      {(!reportData.salesEntryData || reportData.salesEntryData.length === 0) &&
                       (!reportData.paymentData || reportData.paymentData.length === 0) &&
                       (!reportData.receiptData || reportData.receiptData.length === 0) &&
                       (!reportData.purchaseData || reportData.purchaseData.length === 0) &&
                       (!reportData.purchaseReturnData || reportData.purchaseReturnData.length === 0) &&
                       (!reportData.salesReturnData || reportData.salesReturnData.length === 0) &&
                       (!reportData.scrapprocurement || reportData.scrapprocurement.length === 0) && (
                        <tr>
                          <td colSpan={4} style={styles.emptyMsg}>No transaction data found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* RIGHT SIDE: Balance & Credit Data */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <table style={{...styles.table, width: '100%'}}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Voucher No</th>
                        <th style={styles.th}>Party Name</th>
                        <th style={styles.th}>Qty</th>
                        <th style={styles.th}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      
                      {/* Sales Entry Balance Section */}
                      {reportData.salesEntrybalance && reportData.salesEntrybalance.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#e3f2fd'}}>
                              SALES ENTRY BALANCE
                            </td>
                          </tr>
                          {reportData.salesEntrybalance.map((item, index) => (
                            <tr key={`salesBalance-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.partyName || '-'}</td>
                              <td style={styles.td}>-</td>
                              <td style={styles.td}>{formatCurrency(item.cashAmt || item.amount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Sales Balance Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.salesEntrybalance, 'cashAmt') || calculateSectionTotal(reportData.salesEntrybalance, 'amount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Sales Return Balance Section */}
                      {reportData.salesReturnbalance && reportData.salesReturnbalance.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#fff3e0'}}>
                              SALES RETURN BALANCE
                            </td>
                          </tr>
                          {reportData.salesReturnbalance.map((item, index) => (
                            <tr key={`salesReturnBalance-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.partyName || '-'}</td>
                              <td style={styles.td}>-</td>
                              <td style={styles.td}>{formatCurrency(item.amount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Sales Return Balance Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.salesReturnbalance, 'amount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Purchase Balance Section */}
                      {reportData.purchasebalance && reportData.purchasebalance.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#e8f5e9'}}>
                              PURCHASE BALANCE
                            </td>
                          </tr>
                          {reportData.purchasebalance.map((item, index) => (
                            <tr key={`purchaseBalance-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.refName || '-'}</td>
                              <td style={styles.td}>-</td>
                              <td style={styles.td}>{formatCurrency(item.amount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Purchase Balance Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.purchasebalance, 'amount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Purchase Return Balance Section */}
                      {reportData.purchaseReturnbalance && reportData.purchaseReturnbalance.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#fce4ec'}}>
                              PURCHASE RETURN BALANCE
                            </td>
                          </tr>
                          {reportData.purchaseReturnbalance.map((item, index) => (
                            <tr key={`purchaseReturnBalance-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.refName || '-'}</td>
                              <td style={styles.td}>-</td>
                              <td style={styles.td}>{formatCurrency(item.amount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Purchase Return Balance Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.purchaseReturnbalance, 'amount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Scrap Balance Section */}
                      {reportData.scrapbalance && reportData.scrapbalance.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#f3e5f5'}}>
                              SCRAP BALANCE
                            </td>
                          </tr>
                          {reportData.scrapbalance.map((item, index) => (
                            <tr key={`scrapBalance-${index}`}>
                              <td style={styles.td}>{item.voucherNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.partyName || '-'}</td>
                              <td style={styles.td}>{item.qty || '-'}</td>
                              <td style={styles.td}>{formatCurrency(item.amount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Scrap Balance Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.scrapbalance, 'amount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Payment Credit Section */}
                      {reportData.paymnetcredit && reportData.paymnetcredit.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#ffebee'}}>
                              PAYMENT CREDIT
                            </td>
                          </tr>
                          {reportData.paymnetcredit.map((item, index) => (
                            <tr key={`paymentCredit-${index}`}>
                              <td style={styles.td}>{item.vouchNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.partyName || '-'}</td>
                              <td style={styles.td}>-</td>
                              <td style={styles.td}>{formatCurrency(item.debitAMt || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Payment Credit Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.paymnetcredit, 'debitAMt'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Receipt Credit Section */}
                      {reportData.receiptcredit && reportData.receiptcredit.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={4} style={{...styles.td, fontWeight: 'bold', textAlign: 'left', fontSize: TYPOGRAPHY.fontSize.lg, backgroundColor: '#e0f2f1'}}>
                              RECEIPT CREDIT
                            </td>
                          </tr>
                          {reportData.receiptcredit.map((item, index) => (
                            <tr key={`receiptCredit-${index}`}>
                              <td style={styles.td}>{item.vouchNo || 'N/A'}</td>
                              <td style={{...styles.td, textAlign: 'left'}}>{item.partyName || '-'}</td>
                              <td style={styles.td}>-</td>
                              <td style={styles.td}>{formatCurrency(item.creditAmount || 0)}</td>
                            </tr>
                          ))}
                          <tr style={styles.totalRow}>
                            <td style={styles.td} colSpan={3}><strong>Receipt Credit Total</strong></td>
                            <td style={styles.td}>
                              <strong>{formatCurrency(calculateSectionTotal(reportData.receiptcredit, 'creditAmount'))}</strong>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Show message if no right-side data */}
                      {(!reportData.salesEntrybalance || reportData.salesEntrybalance.length === 0) &&
                       (!reportData.salesReturnbalance || reportData.salesReturnbalance.length === 0) &&
                       (!reportData.purchasebalance || reportData.purchasebalance.length === 0) &&
                       (!reportData.purchaseReturnbalance || reportData.purchaseReturnbalance.length === 0) &&
                       (!reportData.scrapbalance || reportData.scrapbalance.length === 0) &&
                       (!reportData.paymnetcredit || reportData.paymnetcredit.length === 0) &&
                       (!reportData.receiptcredit || reportData.receiptcredit.length === 0) && (
                        <tr>
                          <td colSpan={4} style={styles.emptyMsg}>No balance/credit data found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TENDER DATA - Full Width Section */}
              {reportData.tenderData && reportData.tenderData.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{
                    backgroundColor: '#fff9c4',
                    padding: '12px',
                    fontWeight: 'bold',
                    fontSize: TYPOGRAPHY.fontSize.lg,
                    borderRadius: '8px 8px 0 0',
                    textAlign: 'center',
                    color: '#333'
                  }}>
                    TENDER DETAILS
                  </div>
                  <table style={{...styles.table, width: '100%'}}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Invoice No</th>
                        <th style={styles.th}>Total Given</th>
                        <th style={styles.th}>UPI Amount</th>
                        <th style={styles.th}>UPI Party</th>
                        <th style={styles.th}>Card Amount</th>
                        <th style={styles.th}>Card Party</th>
                        <th style={styles.th}>₹500</th>
                        <th style={styles.th}>₹200</th>
                        <th style={styles.th}>₹100</th>
                        <th style={styles.th}>₹50</th>
                        <th style={styles.th}>₹20</th>
                        <th style={styles.th}>₹10</th>
                        <th style={styles.th}>₹5</th>
                        <th style={styles.th}>₹2</th>
                        <th style={styles.th}>₹1</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.tenderData.map((item, index) => (
                        <tr key={`tender-${index}`}>
                          <td style={styles.td}>{item.invoiceNo || 'N/A'}</td>
                          <td style={{...styles.td, fontWeight: 'bold', color: '#1B91DA'}}>
                            {formatCurrency(item.givenTotal || 0)}
                          </td>
                          <td style={styles.td}>{formatCurrency(item.upiAmount || 0)}</td>
                          <td style={{...styles.td, textAlign: 'left'}}>
                            {item.upiPartyName || '-'}
                          </td>
                          <td style={styles.td}>{formatCurrency(item.cardAmount || 0)}</td>
                          <td style={{...styles.td, textAlign: 'left'}}>
                            {item.cardPartyName || '-'}
                          </td>
                          <td style={{...styles.td, backgroundColor: item.r500 !== 0 ? '#e8f5e9' : 'transparent'}}>
                            {item.r500 || 0}
                          </td>
                          <td style={{...styles.td, backgroundColor: item.r200 !== 0 ? '#e8f5e9' : 'transparent'}}>
                            {item.r200 || 0}
                          </td>
                          <td style={{...styles.td, backgroundColor: item.r100 !== 0 ? '#e8f5e9' : 'transparent'}}>
                            {item.r100 || 0}
                          </td>
                          <td style={{...styles.td, backgroundColor: item.r50 !== 0 ? '#e8f5e9' : 'transparent'}}>
                            {item.r50 || 0}
                          </td>
                          <td style={{...styles.td, backgroundColor: item.r20 !== 0 ? '#e8f5e9' : 'transparent'}}>
                            {item.r20 || 0}
                          </td>
                          <td style={{...styles.td, backgroundColor: item.r10 !== 0 ? '#e8f5e9' : 'transparent'}}>
                            {item.r10 || 0}
                          </td>
                          <td style={{...styles.td, backgroundColor: item.r5 !== 0 ? '#e8f5e9' : 'transparent'}}>
                            {item.r5 || 0}
                          </td>
                          <td style={{...styles.td, backgroundColor: item.r2 !== 0 ? '#e8f5e9' : 'transparent'}}>
                            {item.r2 || 0}
                          </td>
                          <td style={{...styles.td, backgroundColor: item.r1 !== 0 ? '#e8f5e9' : 'transparent'}}>
                            {item.r1 || 0}
                          </td>
                        </tr>
                      ))}
                      <tr style={styles.totalRow}>
                        <td style={styles.td}><strong>Total</strong></td>
                        <td style={styles.td}>
                          <strong>{formatCurrency(calculateSectionTotal(reportData.tenderData, 'givenTotal'))}</strong>
                        </td>
                        <td style={styles.td}>
                          <strong>{formatCurrency(calculateSectionTotal(reportData.tenderData, 'upiAmount'))}</strong>
                        </td>
                        <td style={styles.td}>-</td>
                        <td style={styles.td}>
                          <strong>{formatCurrency(calculateSectionTotal(reportData.tenderData, 'cardAmount'))}</strong>
                        </td>
                        <td style={styles.td}>-</td>
                        <td style={styles.td}>
                          <strong>{calculateSectionTotal(reportData.tenderData, 'r500')}</strong>
                        </td>
                        <td style={styles.td}>
                          <strong>{calculateSectionTotal(reportData.tenderData, 'r200')}</strong>
                        </td>
                        <td style={styles.td}>
                          <strong>{calculateSectionTotal(reportData.tenderData, 'r100')}</strong>
                        </td>
                        <td style={styles.td}>
                          <strong>{calculateSectionTotal(reportData.tenderData, 'r50')}</strong>
                        </td>
                        <td style={styles.td}>
                          <strong>{calculateSectionTotal(reportData.tenderData, 'r20')}</strong>
                        </td>
                        <td style={styles.td}>
                          <strong>{calculateSectionTotal(reportData.tenderData, 'r10')}</strong>
                        </td>
                        <td style={styles.td}>
                          <strong>{calculateSectionTotal(reportData.tenderData, 'r5')}</strong>
                        </td>
                        <td style={styles.td}>
                          <strong>{calculateSectionTotal(reportData.tenderData, 'r2')}</strong>
                        </td>
                        <td style={styles.td}>
                          <strong>{calculateSectionTotal(reportData.tenderData, 'r1')}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.emptyMsg}>No data available</div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div style={styles.footerSection}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: '20px'
        }}>
          {/* Left side - Closing Balance */}
          <div style={{ flex: '0 0 auto' }}>
            {showReport && reportData && reportData.closingBalance && (
              <div style={{
                backgroundColor: '#fff3e0',
                padding: '12px 10px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
               
                maxWidth: '400px',
                minWidth: '300px'
              }}>
                <span style={{
                  fontSize: TYPOGRAPHY.fontSize.base,
                  fontWeight: TYPOGRAPHY.fontWeight.bold,
                  color: '#e65100',
                  textAlign: 'left'
                }}>
                  Closing Balance
                </span>
                <span style={{
                  fontSize: TYPOGRAPHY.fontSize.lg,
                  fontWeight: TYPOGRAPHY.fontWeight.bold,
                  color: reportData.closingBalance.type === 'DR' ? '#d32f2f' : '#1976d2'
                }}>
                  {formatCurrency(reportData.closingBalance.amount || 0)} {reportData.closingBalance.type || 'CR'}
                </span>
              </div>
            )}
          </div>

          {/* Right side - Action buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flex: '0 0 auto'
          }}>
            <PrintButton
              onClick={handlePrintClick}
              disabled={!reportData || !showReport || !hasPrintPermission}
              isActive={hasPrintPermission}
              style={{
                minWidth: '100px',
                height: '40px',
                borderRadius: '8px',
                fontSize: TYPOGRAPHY.fontSize.sm,
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                opacity: (!reportData || !showReport || !hasPrintPermission) ? 0.5 : 1,
              }}
            />
            
            <ExportButton
              onClick={handleExportClick}
              disabled={!reportData || !showReport || !hasPrintPermission}
              isActive={hasPrintPermission}
              style={{
                minWidth: '100px',
                height: '40px',
                borderRadius: '8px',
                fontSize: TYPOGRAPHY.fontSize.sm,
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                opacity: (!reportData || !showReport || !hasPrintPermission) ? 0.5 : 1,
              }}
            />
          </div>
        </div>
      </div>

      {/* Print Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showPrintConfirm}
        onClose={() => setShowPrintConfirm(false)}
        onConfirm={handlePrintConfirm}
        title="Print Report"
        message="Do you want to print this daily report as PDF?"
        confirmText="Print"
        cancelText="Cancel"
        type="info"
      />

      {/* Export Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        onConfirm={handleExportConfirm}
        title="Export Report"
        message="Do you want to export this daily report to Excel?"
        confirmText="Export"
        cancelText="Cancel"
        type="success"
      />
    </div>
  );
};

export default DailyReport;