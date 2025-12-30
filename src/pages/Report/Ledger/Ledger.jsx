import React, { useState, useEffect } from 'react';

const Ledger = () => {
  // State management
  const [fromDate, setFromDate] = useState('2024-06-14');
  const [toDate, setToDate] = useState('2025-11-26');
  const [selectedParties, setSelectedParties] = useState(['ANBU 123']);
  const [selectedCompanies, setSelectedCompanies] = useState(['Select Company']);
  const [showPartyPopup, setShowPartyPopup] = useState(false);
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [tempSelectedParties, setTempSelectedParties] = useState([]);
  const [tempSelectedCompanies, setTempSelectedCompanies] = useState([]);
  const [selectAllParties, setSelectAllParties] = useState(false);
  const [selectAllCompanies, setSelectAllCompanies] = useState(false);
  const [tableLoaded, setTableLoaded] = useState(false);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);

  // Sample data
  const allParties = [
    'ANBU 123',
    'John Doe',
    'Jane Smith',
    'ABC Corporation',
    'XYZ Enterprises',
    'Global Traders',
    'Tech Solutions Inc.',
    'Retail Masters',
    'Manufacturing Hub'
  ];

  const allCompanies = [
    'Select Company',
    'DIKSHI DEMO',
    'DIKSHI TECH',
    'DIKSHIWEBSITE',
    'SAKTHI',
    'JUST AK THINGS',
    'PRIVANKA',
    'CORPORATE SOLUTIONS',
    'BUSINESS PARTNERS'
  ];

  // Sample ledger data
  const ledgerData = [
    {
      date: '14/06/2024',
      name: 'ANBU 123',
      voucherNo: 'VCH001',
      type: 'Sales',
      crDr: 'Cr',
      billNo: 'BL001',
      billet: 'BT001',
      amount: '5000.00'
    },
    {
      date: '15/06/2024',
      name: 'ANBU 123',
      voucherNo: 'VCH002',
      type: 'Purchase',
      crDr: 'Dr',
      billNo: 'BL002',
      billet: 'BT002',
      amount: '2500.00'
    },
    {
      date: '20/06/2024',
      name: 'ANBU 123',
      voucherNo: 'VCH003',
      type: 'Receipt',
      crDr: 'Cr',
      billNo: 'BL003',
      billet: 'BT003',
      amount: '3000.00'
    },
    {
      date: '25/06/2024',
      name: 'ANBU 123',
      voucherNo: 'VCH004',
      type: 'Payment',
      crDr: 'Dr',
      billNo: 'BL004',
      billet: 'BT004',
      amount: '1500.00'
    },
    {
      date: '30/06/2024',
      name: 'ANBU 123',
      voucherNo: 'VCH005',
      type: 'Sales',
      crDr: 'Cr',
      billNo: 'BL005',
      billet: 'BT005',
      amount: '4500.00'
    }
  ];

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Initialize temp selections
  useEffect(() => {
    setTempSelectedParties([...selectedParties]);
  }, [selectedParties]);

  useEffect(() => {
    setTempSelectedCompanies([...selectedCompanies]);
  }, [selectedCompanies]);

  // Party popup handlers
  const handlePartyClick = () => {
    setTempSelectedParties([...selectedParties]);
    setShowPartyPopup(true);
  };

  const handlePartySelect = (party) => {
    if (party === 'ANBU 123') {
      if (tempSelectedParties.includes('ANBU 123')) {
        setTempSelectedParties([]);
        setSelectAllParties(false);
      } else {
        setTempSelectedParties(allParties);
        setSelectAllParties(true);
      }
    } else {
      let updatedParties;
      if (tempSelectedParties.includes(party)) {
        updatedParties = tempSelectedParties.filter(p => p !== party);
        if (updatedParties.includes('ANBU 123')) {
          updatedParties = updatedParties.filter(p => p !== 'ANBU 123');
        }
      } else {
        updatedParties = [...tempSelectedParties, party];
        const otherParties = allParties.filter(p => p !== 'ANBU 123');
        if (otherParties.every(p => updatedParties.includes(p))) {
          updatedParties = allParties;
        }
      }
      setTempSelectedParties(updatedParties);
      setSelectAllParties(updatedParties.length === allParties.length);
    }
  };

  const handlePartyPopupOk = () => {
    setSelectedParties([...tempSelectedParties]);
    setShowPartyPopup(false);
  };

  const handlePartyClearSelection = () => {
    setTempSelectedParties([]);
    setSelectAllParties(false);
  };

  const handlePartyPopupClose = () => {
    setShowPartyPopup(false);
  };

  // Company popup handlers
  const handleCompanyClick = () => {
    setTempSelectedCompanies([...selectedCompanies]);
    setShowCompanyPopup(true);
  };

  const handleCompanySelect = (company) => {
    if (company === 'Select Company') {
      if (tempSelectedCompanies.includes('Select Company')) {
        setTempSelectedCompanies([]);
        setSelectAllCompanies(false);
      } else {
        setTempSelectedCompanies(allCompanies);
        setSelectAllCompanies(true);
      }
    } else {
      let updatedCompanies;
      if (tempSelectedCompanies.includes(company)) {
        updatedCompanies = tempSelectedCompanies.filter(c => c !== company);
        if (updatedCompanies.includes('Select Company')) {
          updatedCompanies = updatedCompanies.filter(c => c !== 'Select Company');
        }
      } else {
        updatedCompanies = [...tempSelectedCompanies, company];
        const otherCompanies = allCompanies.filter(c => c !== 'Select Company');
        if (otherCompanies.every(c => updatedCompanies.includes(c))) {
          updatedCompanies = allCompanies;
        }
      }
      setTempSelectedCompanies(updatedCompanies);
      setSelectAllCompanies(updatedCompanies.length === allCompanies.length);
    }
  };

  const handleCompanyPopupOk = () => {
    setSelectedCompanies([...tempSelectedCompanies]);
    setShowCompanyPopup(false);
  };

  const handleCompanyClearSelection = () => {
    setTempSelectedCompanies([]);
    setSelectAllCompanies(false);
  };

  const handleCompanyPopupClose = () => {
    setShowCompanyPopup(false);
  };

  // Search functionality
  const handleSearch = () => {
    if (!fromDate || !toDate || selectedParties.length === 0 || selectedCompanies.length === 0) {
      alert('Please fill all fields: From Date, To Date, Party, and Company');
      return;
    }
    
    console.log('Searching Ledger with:', {
      fromDate,
      toDate,
      selectedParties,
      selectedCompanies
    });
    
    setTableLoaded(true);
  };

  // Date handlers
  const handleDateChange = (type, value) => {
    if (type === 'from') {
      setFromDate(value);
      setShowFromCalendar(false);
    } else {
      setToDate(value);
      setShowToCalendar(false);
    }
  };

  // Refresh functionality
  const handleRefresh = () => {
    setTableLoaded(false);
    setSelectedParties(['ANBU 123']);
    setSelectedCompanies(['Select Company']);
    setFromDate('2024-06-14');
    setToDate('2025-11-26');
  };

  // Calendar generation
  const generateCalendar = (currentDate, type) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} style={styles.calendarEmptyDay}></div>);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const isSelected = (type === 'from' && fromDate === dateStr) || (type === 'to' && toDate === dateStr);
      const isToday = today.toISOString().split('T')[0] === dateStr;
      
      days.push(
        <div 
          key={day}
          style={{
            ...styles.calendarDay,
            ...(isSelected ? styles.calendarSelectedDay : {}),
            ...(isToday ? styles.calendarToday : {}),
            ':hover': {
              backgroundColor: !isSelected ? accentColors.light : accentColors.primary,
              transform: 'translateY(-1px)'
            }
          }}
          onClick={() => handleDateChange(type, dateStr)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  // Styles
  const accentColors = {
    primary: '#4A90E2',
    secondary: '#64B5F6',
    tertiary: '#81D4FA',
    light: '#F0F8FF',
    dark: '#1976D2',
    text: '#2C3E50',
    textLight: '#7F8C8D',
    border: '#E1E8ED',
    background: '#F8FAFD'
  };

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '30px auto',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 60px)', // Full screen height minus margin
      maxHeight: '900px', // Prevent it from getting too tall
      overflow: 'hidden' // Prevent scrolling
    },
    
    // UPDATED: Compact header with everything in one line
    header: {
      background: 'linear-gradient(135deg, #f8fafd 0%, white 100%)',
      color: accentColors.text,
      padding: '25px 40px 25px 40px',
      borderBottom: `1px solid ${accentColors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    },
    
    headerTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: accentColors.primary,
      letterSpacing: '-0.5px',
      marginRight: '40px',
      minWidth: '150px'
    },
    
    // UPDATED: All controls in one row
    controlsRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flex: 1
    },
    
    controlGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minWidth: '150px'
    },
    
    controlLabel: {
      fontSize: '13px',
      color: accentColors.text,
      fontWeight: '600',
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    },
    
    dateInputWrapper: {
      position: 'relative',
      width: '100%'
    },
    
    dateDisplay: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 15px',
      paddingRight: '40px',
      border: `1.5px solid ${accentColors.border}`,
      borderRadius: '8px',
      backgroundColor: 'white',
      fontSize: '14px',
      color: accentColors.text,
      minHeight: '42px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      ':hover': {
        borderColor: accentColors.secondary,
        boxShadow: `0 4px 10px ${accentColors.secondary}20`,
        transform: 'translateY(-1px)'
      }
    },
    
    calendarIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: accentColors.secondary,
      cursor: 'pointer',
      fontSize: '18px',
      transition: 'transform 0.3s ease',
      ':hover': {
        transform: 'translateY(-50%) scale(1.1)'
      }
    },
    
    inputField: {
      width: '100%',
      padding: '12px 15px',
      border: `1.5px solid ${accentColors.border}`,
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      color: accentColors.text,
      minHeight: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      ':hover': {
        borderColor: accentColors.secondary,
        boxShadow: `0 4px 10px ${accentColors.secondary}20`,
        transform: 'translateY(-1px)'
      }
    },
    
    // UPDATED: Button styling for compact header
    searchButton: {
      padding: '12px 24px',
      background: `linear-gradient(135deg, ${accentColors.primary} 0%, ${accentColors.secondary} 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: `0 4px 12px ${accentColors.secondary}40`,
      letterSpacing: '0.5px',
      position: 'relative',
      overflow: 'hidden',
      minWidth: '100px',
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 6px 20px ${accentColors.secondary}60`,
        letterSpacing: '0.8px'
      },
      ':active': {
        transform: 'translateY(-1px)'
      }
    },
    
    searchButtonGlow: {
      position: 'absolute',
      top: '0',
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      transition: 'left 0.7s ease'
    },
    
    refreshButton: {
      padding: '12px 24px',
      background: 'white',
      color: accentColors.text,
      border: `1.5px solid ${accentColors.border}`,
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      letterSpacing: '0.5px',
      position: 'relative',
      overflow: 'hidden',
      minWidth: '100px',
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        borderColor: accentColors.secondary,
        boxShadow: `0 4px 10px ${accentColors.secondary}20`,
        transform: 'translateY(-1px)'
      },
      ':active': {
        transform: 'translateY(-1px)'
      }
    },
    
    // UPDATED: Main content area - fixed height, no scroll
    content: {
      padding: '25px',
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    
    tableContainer: {
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      border: `1px solid ${accentColors.border}`,
      background: 'white',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '400px'
    },
    
    tableWrapper: {
      flex: 1,
      overflow: 'auto'
    },
    
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      minWidth: '1200px'
    },
    
    tableHeader: {
      background: `linear-gradient(135deg, ${accentColors.primary} 0%, ${accentColors.dark} 100%)`,
      color: 'white',
      padding: '16px 18px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '13px',
      border: 'none',
      position: 'relative',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      ':first-child': {
        borderTopLeftRadius: '12px'
      },
      ':last-child': {
        borderTopRightRadius: '12px'
      }
    },
    
    tableHeaderGlow: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      height: '2px',
      background: `linear-gradient(90deg, transparent, ${accentColors.tertiary}, transparent)`
    },
    
    tableCell: {
      padding: '14px 18px',
      borderBottom: `1px solid ${accentColors.border}`,
      fontSize: '13px',
      color: accentColors.text,
      transition: 'all 0.2s ease',
      fontWeight: '500',
      whiteSpace: 'nowrap'
    },
    
    tableRow: {
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: `${accentColors.light}80`,
        transform: 'translateX(2px)'
      }
    },
    
    emptyState: {
      textAlign: 'center',
      padding: '40px 30px',
      color: accentColors.textLight,
      fontSize: '15px',
      background: accentColors.background,
      borderRadius: '12px',
      margin: '20px',
      border: `2px dashed ${accentColors.border}`,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
    
    emptyStateIcon: {
      fontSize: '40px',
      marginBottom: '15px',
      color: accentColors.secondary,
      opacity: 0.5
    },
    
    // UPDATED: Footer with balances
    footer: {
      padding: '20px 25px',
      backgroundColor: accentColors.background,
      borderTop: `1px solid ${accentColors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0
    },
    
    balanceBox: {
      background: 'white',
      padding: '20px 30px',
      borderRadius: '10px',
      border: `1px solid ${accentColors.border}`,
      minWidth: '200px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    
    balanceLabel: {
      fontSize: '14px',
      color: accentColors.textLight,
      marginBottom: '8px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    balanceValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: accentColors.primary
    },
    
    // Calendar popup styles (same as before)
    calendarPopup: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: '0',
      zIndex: 1001,
      backgroundColor: 'white',
      border: `1px solid ${accentColors.border}`,
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      width: '300px',
      overflow: 'hidden',
      animation: 'slideDown 0.3s ease'
    },
    
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '18px',
      background: `linear-gradient(135deg, ${accentColors.primary} 0%, ${accentColors.secondary} 100%)`,
      color: 'white',
      position: 'relative'
    },
    
    calendarNavButton: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '6px 10px',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      ':hover': {
        background: 'rgba(255,255,255,0.3)',
        transform: 'scale(1.05)'
      }
    },
    
    calendarMonthYear: {
      fontSize: '15px',
      fontWeight: '600',
      letterSpacing: '0.5px'
    },
    
    calendarWeekDays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      padding: '12px',
      backgroundColor: accentColors.background,
      borderBottom: `1px solid ${accentColors.border}`
    },
    
    calendarWeekDay: {
      textAlign: 'center',
      fontSize: '11px',
      fontWeight: '700',
      color: accentColors.textLight,
      padding: '6px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    
    calendarDays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      padding: '12px',
      gap: '4px'
    },
    
    calendarDay: {
      textAlign: 'center',
      padding: '10px 6px',
      cursor: 'pointer',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: accentColors.text
    },
    
    calendarSelectedDay: {
      background: `linear-gradient(135deg, ${accentColors.primary} 0%, ${accentColors.secondary} 100%)`,
      color: 'white',
      boxShadow: `0 4px 12px ${accentColors.secondary}40`,
      transform: 'scale(1.05)'
    },
    
    calendarToday: {
      border: `2px solid ${accentColors.secondary}`,
      backgroundColor: accentColors.light,
      fontWeight: '700'
    },
    
    calendarEmptyDay: {
      padding: '10px 6px'
    },
    
    // Popup styles (same as before)
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
      animation: 'fadeIn 0.3s ease'
    },
    
    popupContent: {
      backgroundColor: 'white',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'hidden',
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.2)',
      border: `1px solid ${accentColors.secondary}`,
      animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    popupHeader: {
      background: `linear-gradient(135deg, ${accentColors.primary} 0%, ${accentColors.secondary} 100%)`,
      color: 'white',
      padding: '22px 28px 22px 28px',
      margin: 0,
      fontSize: '20px',
      fontWeight: '700',
      borderBottom: `1px solid ${accentColors.dark}`,
      position: 'relative',
      letterSpacing: '0.5px'
    },
    
    closeButton: {
      position: 'absolute',
      right: '18px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      fontSize: '22px',
      cursor: 'pointer',
      width: '34px',
      height: '34px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      ':hover': {
        background: 'rgba(255,255,255,0.3)',
        transform: 'translateY(-50%) rotate(90deg)'
      }
    },
    
    popupList: {
      padding: '22px',
      maxHeight: '300px',
      overflowY: 'auto'
    },
    
    popupItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 14px',
      margin: '6px 0',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: `1px solid transparent`,
      ':hover': {
        backgroundColor: `${accentColors.light}80`,
        transform: 'translateX(4px)',
        borderColor: accentColors.secondary
      }
    },
    
    selectedPopupItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 14px',
      margin: '6px 0',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: `${accentColors.light}`,
      borderLeft: `4px solid ${accentColors.secondary}`,
      border: `1px solid ${accentColors.secondary}40`,
      boxShadow: `0 4px 12px ${accentColors.secondary}20`,
      transform: 'translateX(4px)'
    },
    
    popupCheckbox: {
      width: '20px',
      height: '20px',
      border: `2px solid ${accentColors.secondary}`,
      borderRadius: '5px',
      marginRight: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backgroundColor: 'white',
      transition: 'all 0.3s ease'
    },
    
    selectedPopupCheckbox: {
      width: '20px',
      height: '20px',
      border: `2px solid ${accentColors.secondary}`,
      borderRadius: '5px',
      marginRight: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backgroundColor: accentColors.secondary,
      boxShadow: `0 4px 12px ${accentColors.secondary}40`
    },
    
    checkmark: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '13px'
    },
    
    popupText: {
      color: accentColors.text,
      fontSize: '14px',
      fontWeight: '500'
    },
    
    popupActions: {
      borderTop: `1px solid ${accentColors.border}`,
      padding: '22px',
      backgroundColor: accentColors.background
    },
    
    popupButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    },
    
    popupButton: {
      padding: '10px 24px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      minWidth: '90px',
      letterSpacing: '0.5px',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
      }
    },
    
    okButton: {
      background: `linear-gradient(135deg, ${accentColors.primary} 0%, ${accentColors.secondary} 100%)`,
      color: 'white'
    },
    
    clearButton: {
      background: 'white',
      color: '#d32f2f',
      border: `2px solid #ffcdd2`,
      ':hover': {
        background: '#ffebee',
        boxShadow: '0 6px 20px rgba(211, 47, 47, 0.1)'
      }
    }
  };

  // Calendar data
  const fromCalendarDate = new Date(fromDate);
  const toCalendarDate = new Date(toDate);
  
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div style={styles.container}>
      {/* UPDATED: Compact header with everything in one line */}
      <div style={styles.header}>
        {/* Title on the left */}
        <div style={styles.headerTitle}>Ledger Report</div>
        
        {/* All controls in one row */}
        <div style={styles.controlsRow}>
          {/* From Date */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>From Date</div>
            <div style={styles.dateInputWrapper}>
              <div 
                style={styles.dateDisplay}
                onClick={() => {
                  setShowFromCalendar(!showFromCalendar);
                  setShowToCalendar(false);
                }}
              >
                {formatDateForDisplay(fromDate)}
                <span style={styles.calendarIcon}>📅</span>
              </div>
              
              {showFromCalendar && (
                <div style={styles.calendarPopup}>
                  <div style={styles.calendarHeader}>
                    <button 
                      style={styles.calendarNavButton}
                      onClick={() => {
                        const newDate = new Date(fromCalendarDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        handleDateChange('from', newDate.toISOString().split('T')[0]);
                      }}
                    >
                      ‹
                    </button>
                    <div style={styles.calendarMonthYear}>
                      {months[fromCalendarDate.getMonth()]} {fromCalendarDate.getFullYear()}
                    </div>
                    <button 
                      style={styles.calendarNavButton}
                      onClick={() => {
                        const newDate = new Date(fromCalendarDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        handleDateChange('from', newDate.toISOString().split('T')[0]);
                      }}
                    >
                      ›
                    </button>
                  </div>
                  
                  <div style={styles.calendarWeekDays}>
                    {weekDays.map(day => (
                      <div key={day} style={styles.calendarWeekDay}>{day}</div>
                    ))}
                  </div>
                  
                  <div style={styles.calendarDays}>
                    {generateCalendar(fromCalendarDate, 'from')}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* To Date */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>To Date</div>
            <div style={styles.dateInputWrapper}>
              <div 
                style={styles.dateDisplay}
                onClick={() => {
                  setShowToCalendar(!showToCalendar);
                  setShowFromCalendar(false);
                }}
              >
                {formatDateForDisplay(toDate)}
                <span style={styles.calendarIcon}>📅</span>
              </div>
              
              {showToCalendar && (
                <div style={styles.calendarPopup}>
                  <div style={styles.calendarHeader}>
                    <button 
                      style={styles.calendarNavButton}
                      onClick={() => {
                        const newDate = new Date(toCalendarDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        handleDateChange('to', newDate.toISOString().split('T')[0]);
                      }}
                    >
                      ‹
                    </button>
                    <div style={styles.calendarMonthYear}>
                      {months[toCalendarDate.getMonth()]} {toCalendarDate.getFullYear()}
                    </div>
                    <button 
                      style={styles.calendarNavButton}
                      onClick={() => {
                        const newDate = new Date(toCalendarDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        handleDateChange('to', newDate.toISOString().split('T')[0]);
                      }}
                    >
                      ›
                    </button>
                  </div>
                  
                  <div style={styles.calendarWeekDays}>
                    {weekDays.map(day => (
                      <div key={day} style={styles.calendarWeekDay}>{day}</div>
                    ))}
                  </div>
                  
                  <div style={styles.calendarDays}>
                    {generateCalendar(toCalendarDate, 'to')}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Party */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>Party</div>
            <div 
              style={styles.inputField}
              onClick={handlePartyClick}
            >
              {selectedParties.length > 0 
                ? selectedParties.join(', ') 
                : 'Select Party'}
              <span style={{color: accentColors.secondary, fontSize: '10px', transition: 'transform 0.3s ease'}}>▼</span>
            </div>
          </div>
          
          {/* Company */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>Company</div>
            <div 
              style={styles.inputField}
              onClick={handleCompanyClick}
            >
              {selectedCompanies.length > 0 
                ? selectedCompanies.join(', ') 
                : 'Select Company'}
              <span style={{color: accentColors.secondary, fontSize: '10px', transition: 'transform 0.3s ease'}}>▼</span>
            </div>
          </div>
          
          {/* Search Button */}
          <button 
            style={styles.searchButton}
            onClick={handleSearch}
            onMouseEnter={() => setHoveredButton(true)}
            onMouseLeave={() => setHoveredButton(false)}
          >
            Search
            {hoveredButton && <div style={styles.searchButtonGlow}></div>}
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

      {/* TABLE CONTENT - Fixed height, no scroll */}
      <div style={styles.content}>
        <div style={styles.tableContainer}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>
                    Date
                    <div style={styles.tableHeaderGlow}></div>
                  </th>
                  <th style={styles.tableHeader}>
                    Name
                    <div style={styles.tableHeaderGlow}></div>
                  </th>
                  <th style={styles.tableHeader}>
                    Voucher No
                    <div style={styles.tableHeaderGlow}></div>
                  </th>
                  <th style={styles.tableHeader}>
                    Type
                    <div style={styles.tableHeaderGlow}></div>
                  </th>
                  <th style={styles.tableHeader}>
                    Cr/Dr
                    <div style={styles.tableHeaderGlow}></div>
                  </th>
                  <th style={styles.tableHeader}>
                    Bill No
                    <div style={styles.tableHeaderGlow}></div>
                  </th>
                  <th style={styles.tableHeader}>
                    Billet
                    <div style={styles.tableHeaderGlow}></div>
                  </th>
                  <th style={styles.tableHeader}>
                    Amount
                    <div style={styles.tableHeaderGlow}></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(tableLoaded ? ledgerData : []).map((row, index) => (
                  <tr key={index} style={styles.tableRow}>
                    <td style={styles.tableCell}>{row.date}</td>
                    <td style={styles.tableCell}>{row.name}</td>
                    <td style={styles.tableCell}>{row.voucherNo}</td>
                    <td style={styles.tableCell}>{row.type}</td>
                    <td style={styles.tableCell}>{row.crDr}</td>
                    <td style={styles.tableCell}>{row.billNo}</td>
                    <td style={styles.tableCell}>{row.billet}</td>
                    <td style={styles.tableCell}>{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {tableLoaded && ledgerData.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📊</div>
                No records found
              </div>
            )}
            
            {!tableLoaded && (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>🔍</div>
                Enter search criteria and click "Search" to view ledger entries
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UPDATED: Footer with balances */}
      <div style={styles.footer}>
        <div style={styles.balanceBox}>
          <div style={styles.balanceLabel}>Opening Balance</div>
          <div style={styles.balanceValue}>0.00</div>
        </div>
        <div style={styles.balanceBox}>
          <div style={styles.balanceLabel}>Closing Balance</div>
          <div style={styles.balanceValue}>0.00</div>
        </div>
      </div>

      {/* PARTY POPUP */}
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
            
            <div style={styles.popupList}>
              {allParties.map((party) => {
                const isSelected = tempSelectedParties.includes(party);
                return (
                  <div 
                    key={party} 
                    style={isSelected ? styles.selectedPopupItem : styles.popupItem}
                    onClick={() => handlePartySelect(party)}
                  >
                    <div style={isSelected ? styles.selectedPopupCheckbox : styles.popupCheckbox}>
                      {isSelected && <div style={styles.checkmark}>✓</div>}
                    </div>
                    <span style={styles.popupText}>{party}</span>
                  </div>
                );
              })}
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

      {/* COMPANY POPUP */}
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
            
            <div style={styles.popupList}>
              {allCompanies.map((company) => {
                const isSelected = tempSelectedCompanies.includes(company);
                return (
                  <div 
                    key={company} 
                    style={isSelected ? styles.selectedPopupItem : styles.popupItem}
                    onClick={() => handleCompanySelect(company)}
                  >
                    <div style={isSelected ? styles.selectedPopupCheckbox : styles.popupCheckbox}>
                      {isSelected && <div style={styles.checkmark}>✓</div>}
                    </div>
                    <span style={styles.popupText}>{company}</span>
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

export default Ledger;