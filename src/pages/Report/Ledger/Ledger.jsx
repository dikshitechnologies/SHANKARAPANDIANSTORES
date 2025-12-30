import React, { useState, useEffect, useRef } from 'react';

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
  const [focusedField, setFocusedField] = useState('');
  
  // Refs for keyboard navigation
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const partyRef = useRef(null);
  const companyRef = useRef(null);
  const searchButtonRef = useRef(null);
  const refreshButtonRef = useRef(null);

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

  // Focusable elements in order
  const focusableElements = [
    { ref: fromDateRef, name: 'fromDate', type: 'input' },
    { ref: toDateRef, name: 'toDate', type: 'input' },
    { ref: partyRef, name: 'party', type: 'button' },
    { ref: companyRef, name: 'company', type: 'button' },
    { ref: searchButtonRef, name: 'search', type: 'button' },
    { ref: refreshButtonRef, name: 'refresh', type: 'button' }
  ];

  // Initialize temp selections
  useEffect(() => {
    setTempSelectedParties([...selectedParties]);
  }, [selectedParties]);

  useEffect(() => {
    setTempSelectedCompanies([...selectedCompanies]);
  }, [selectedCompanies]);

  // Keyboard navigation handler
  const handleKeyDown = (e, currentIndex, fieldName) => {
    const totalElements = focusableElements.length;
    
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (fieldName === 'search') {
          handleSearch();
        } else if (fieldName === 'refresh') {
          handleRefresh();
        } else if (fieldName === 'party') {
          handlePartyClick();
        } else if (fieldName === 'company') {
          handleCompanyClick();
        } else {
          // Move to next element
          const nextIndex = (currentIndex + 1) % totalElements;
          focusableElements[nextIndex].ref.current.focus();
        }
        break;
        
      case 'Tab':
        if (showPartyPopup || showCompanyPopup) {
          e.preventDefault();
        }
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % totalElements;
        focusableElements[nextIndex].ref.current.focus();
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + totalElements) % totalElements;
        focusableElements[prevIndex].ref.current.focus();
        break;
        
      case 'ArrowDown':
        if ((fieldName === 'party' && !showPartyPopup) || 
            (fieldName === 'company' && !showCompanyPopup)) {
          e.preventDefault();
          if (fieldName === 'party') handlePartyClick();
          if (fieldName === 'company') handleCompanyClick();
        }
        break;
        
      case 'Escape':
        if (showPartyPopup) {
          e.preventDefault();
          handlePartyPopupClose();
        } else if (showCompanyPopup) {
          e.preventDefault();
          handleCompanyPopupClose();
        } else {
          e.currentTarget.blur();
        }
        break;
        
      case ' ':
        if (fieldName === 'party') {
          e.preventDefault();
          handlePartyClick();
        } else if (fieldName === 'company') {
          e.preventDefault();
          handleCompanyClick();
        } else if (fieldName === 'search') {
          e.preventDefault();
          handleSearch();
        } else if (fieldName === 'refresh') {
          e.preventDefault();
          handleRefresh();
        }
        break;
    }
  };

  // Popup keyboard navigation
  const handlePopupKeyDown = (e, popupType) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (popupType === 'party') handlePartyPopupClose();
      if (popupType === 'company') handleCompanyPopupClose();
    }
  };

  // Popup button keyboard navigation
  const handlePopupButtonKeyDown = (e, buttonType, popupType) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (buttonType === 'ok') {
          if (popupType === 'party') handlePartyPopupOk();
          if (popupType === 'company') handleCompanyPopupOk();
        } else if (buttonType === 'clear') {
          if (popupType === 'party') handlePartyClearSelection();
          if (popupType === 'company') handleCompanyClearSelection();
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (popupType === 'party') handlePartyPopupClose();
        if (popupType === 'company') handleCompanyPopupClose();
        break;
    }
  };

  // Focus management for popups
  useEffect(() => {
    if (showPartyPopup || showCompanyPopup) {
      setTimeout(() => {
        const firstItem = document.querySelector('.popup-item');
        if (firstItem) firstItem.focus();
      }, 100);
    }
  }, [showPartyPopup, showCompanyPopup]);

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
    setTimeout(() => partyRef.current?.focus(), 100);
  };

  const handlePartyClearSelection = () => {
    setTempSelectedParties([]);
    setSelectAllParties(false);
  };

  const handlePartyPopupClose = () => {
    setShowPartyPopup(false);
    setTimeout(() => partyRef.current?.focus(), 100);
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
    setTimeout(() => companyRef.current?.focus(), 100);
  };

  const handleCompanyClearSelection = () => {
    setTempSelectedCompanies([]);
    setSelectAllCompanies(false);
  };

  const handleCompanyPopupClose = () => {
    setShowCompanyPopup(false);
    setTimeout(() => companyRef.current?.focus(), 100);
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

  // Refresh functionality
  const handleRefresh = () => {
    setTableLoaded(false);
    setSelectedParties(['ANBU 123']);
    setSelectedCompanies(['Select Company']);
    setFromDate('2024-06-14');
    setToDate('2025-11-26');
  };

  // Date change handler
  const handleDateChange = (field, value) => {
    if (field === 'from') {
      setFromDate(value);
    } else {
      setToDate(value);
    }
  };

  // Calculate totals for footer
  const calculateTotal = () => {
    if (!tableLoaded || ledgerData.length === 0) return '0.00';
    
    const total = ledgerData.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      return sum + amount;
    }, 0);
    
    return total.toFixed(2);
  };

  // Styles matching Day Book design
  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f5f5f5',
      fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
      overflow: 'auto'
    },
    
    header: {
      background: 'white',
      color: '#333',
      padding: '20px 30px',
      borderBottom: '1px solid #ddd',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    
    headerTitle: {
      fontSize: '28px',
      fontWeight: '600',
      marginBottom: '25px',
      color: '#1B91DA',
      textAlign: 'center'
    },
    
    firstRow: {
      display: 'grid',
      gridTemplateColumns: '0.8fr 0.8fr 2fr 2fr 0.7fr 0.7fr',
      gap: '15px',
      marginBottom: '20px',
      position: 'relative',
      alignItems: 'end'
    },
    
    controlGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    
    controlLabel: {
      fontSize: '14px',
      color: '#333',
      marginBottom: '0',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    dateInputWrapper: {
      position: 'relative',
      width: '100%'
    },
    
    inlineInput: {
      width: '100%',
      padding: '8px 10px',
      border: '1px solid #ddd',
      borderRadius: '3px',
      fontSize: '14px',
      backgroundColor: 'white',
      color: '#333',
      minHeight: '36px',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    
    focusedInput: {
      borderColor: '#1B91DA',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)'
    },
    
    partyInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '3px',
      fontSize: '14px',
      backgroundColor: 'white',
      color: '#333',
      minHeight: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      outline: 'none'
    },
    
    companyInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '3px',
      fontSize: '14px',
      backgroundColor: 'white',
      color: '#333',
      minHeight: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      outline: 'none'
    },
    
    searchButton: {
      padding: '8px 12px',
      background: '#1B91DA',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
      ':hover': {
        backgroundColor: '#0c7bb8'
      }
    },
    
    buttonContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      height: '100%'
    },
    
    content: {
      padding: '20px 30px',
      minHeight: 'calc(100vh - 180px)',
      boxSizing: 'border-box'
    },
    
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '4px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #ddd',
      height: 'calc(100vh - 250px)',
      display: 'flex',
      flexDirection: 'column'
    },
    
    tableWrapper: {
      flex: 1,
      overflow: 'auto'
    },
    
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1200px'
    },
    
    tableHeader: {
      backgroundColor: '#1B91DA',
      color: 'white',
      padding: '12px 15px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '14px',
      borderRight: '1px solid #0c7bb8',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    
    tableCell: {
      padding: '12px 15px',
      borderBottom: '1px solid #ddd',
      fontSize: '14px',
      color: '#333',
      fontWeight: '400'
    },
    
    tableRow: {
      ':hover': {
        backgroundColor: '#f8f9fa'
      }
    },
    
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#666',
      fontSize: '16px',
      background: '#f8f9fa',
      borderRadius: '4px',
      margin: '20px',
      border: '2px dashed #ddd',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
    
    emptyStateIcon: {
      fontSize: '40px',
      marginBottom: '15px',
      color: '#1B91DA',
      opacity: 0.5
    },
    
    // Footer with balances
    footer: {
      padding: '20px 30px',
      backgroundColor: 'white',
      borderTop: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      bottom: 0,
      zIndex: 90,
      boxShadow: '0 -2px 4px rgba(0,0,0,0.1)'
    },
    
    balanceBox: {
      background: '#f8f9fa',
      padding: '15px 25px',
      borderRadius: '3px',
      border: '1px solid #ddd',
      minWidth: '200px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    
    balanceLabel: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '5px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    balanceValue: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#1B91DA'
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
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    
    popupContent: {
      backgroundColor: 'white',
      borderRadius: '4px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      border: '1px solid #ddd'
    },
    
    popupHeader: {
      background: '#1B91DA',
      color: 'white',
      padding: '15px 20px',
      margin: 0,
      fontSize: '16px',
      fontWeight: '600',
      borderBottom: '1px solid #0c7bb8',
      position: 'relative'
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
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '3px',
      outline: 'none',
      ':hover': {
        background: 'rgba(255,255,255,0.3)'
      }
    },
    
    popupList: {
      padding: '15px 20px',
      maxHeight: '350px',
      overflowY: 'auto'
    },
    
    popupItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 12px',
      margin: '4px 0',
      borderRadius: '3px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid transparent',
      outline: 'none',
      ':hover': {
        backgroundColor: '#f8f9fa'
      }
    },
    
    selectedPopupItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 12px',
      margin: '4px 0',
      borderRadius: '3px',
      cursor: 'pointer',
      backgroundColor: '#e8f0fe',
      borderLeft: '3px solid #1B91DA',
      outline: 'none'
    },
    
    popupCheckbox: {
      width: '18px',
      height: '18px',
      border: '2px solid #ddd',
      borderRadius: '3px',
      marginRight: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backgroundColor: 'white'
    },
    
    selectedPopupCheckbox: {
      width: '18px',
      height: '18px',
      border: '2px solid #1B91DA',
      borderRadius: '3px',
      marginRight: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backgroundColor: '#1B91DA'
    },
    
    checkmark: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '12px'
    },
    
    popupText: {
      color: '#333',
      fontSize: '14px',
      fontWeight: '400'
    },
    
    popupActions: {
      borderTop: '1px solid #ddd',
      padding: '15px 20px',
      backgroundColor: '#f8f9fa'
    },
    
    popupButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px'
    },
    
    popupButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '3px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '80px',
      outline: 'none'
    },
    
    okButton: {
      background: '#1B91DA',
      color: 'white',
      ':hover': {
        backgroundColor: '#0c7bb8'
      }
    },
    
    clearButton: {
      background: 'white',
      color: '#666',
      border: '1px solid #ddd',
      ':hover': {
        backgroundColor: '#f8f9fa'
      }
    },

    refreshButton: {
      padding: '8px 12px',
      background: 'white',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: '3px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
      ':hover': {
        backgroundColor: '#f8f9fa',
        borderColor: '#1B91DA'
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Ledger Report</h1>
        
        {/* FIRST ROW: From Date, To Date, Party, Company, Search, Refresh */}
        <div style={styles.firstRow}>
          {/* From Date */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>From Date</div>
            <div style={styles.dateInputWrapper}>
              <input
                type="date"
                style={{
                  ...styles.inlineInput,
                  ...(focusedField === 'fromDate' && styles.focusedInput)
                }}
                ref={fromDateRef}
                value={fromDate}
                onChange={(e) => handleDateChange('from', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 0, 'fromDate')}
                onFocus={() => setFocusedField('fromDate')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>
          
          {/* To Date */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>To Date</div>
            <div style={styles.dateInputWrapper}>
              <input
                type="date"
                style={{
                  ...styles.inlineInput,
                  ...(focusedField === 'toDate' && styles.focusedInput)
                }}
                ref={toDateRef}
                value={toDate}
                onChange={(e) => handleDateChange('to', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 1, 'toDate')}
                onFocus={() => setFocusedField('toDate')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>
          
          {/* Party */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>Party</div>
            <button
              ref={partyRef}
              style={{
                ...styles.partyInput,
                ...(focusedField === 'party' && styles.focusedInput)
              }}
              onClick={handlePartyClick}
              onKeyDown={(e) => handleKeyDown(e, 2, 'party')}
              onFocus={() => setFocusedField('party')}
              onBlur={() => setFocusedField('')}
            >
              {selectedParties.length > 0 
                ? selectedParties.join(', ') 
                : 'Select Party'}
              <span style={{color: '#666', fontSize: '10px'}}>▼</span>
            </button>
          </div>
          
          {/* Company */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>Company</div>
            <button
              ref={companyRef}
              style={{
                ...styles.companyInput,
                ...(focusedField === 'company' && styles.focusedInput)
              }}
              onClick={handleCompanyClick}
              onKeyDown={(e) => handleKeyDown(e, 3, 'company')}
              onFocus={() => setFocusedField('company')}
              onBlur={() => setFocusedField('')}
            >
              {selectedCompanies.length > 0 
                ? selectedCompanies.join(', ') 
                : 'Select Company'}
              <span style={{color: '#666', fontSize: '10px'}}>▼</span>
            </button>
          </div>
          
          {/* Search Button */}
          <div style={styles.buttonContainer}>
            <button 
              ref={searchButtonRef}
              style={{
                ...styles.searchButton,
                ...(focusedField === 'search' && { outline: '2px solid #1B91DA', outlineOffset: '2px' })
              }}
              onClick={handleSearch}
              onKeyDown={(e) => handleKeyDown(e, 4, 'search')}
              onFocus={() => setFocusedField('search')}
              onBlur={() => setFocusedField('')}
            >
              Search
            </button>
          </div>

          {/* Refresh Button */}
          <div style={styles.buttonContainer}>
            <button 
              ref={refreshButtonRef}
              style={{
                ...styles.refreshButton,
                ...(focusedField === 'refresh' && { outline: '2px solid #1B91DA', outlineOffset: '2px' })
              }}
              onClick={handleRefresh}
              onKeyDown={(e) => handleKeyDown(e, 5, 'refresh')}
              onFocus={() => setFocusedField('refresh')}
              onBlur={() => setFocusedField('')}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* TABLE CONTENT */}
      <div style={styles.content}>
        <div style={styles.tableContainer}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Date</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Voucher No</th>
                  <th style={styles.tableHeader}>Type</th>
                  <th style={styles.tableHeader}>Cr/Dr</th>
                  <th style={styles.tableHeader}>Bill No</th>
                  <th style={styles.tableHeader}>Billet</th>
                  <th style={{...styles.tableHeader, borderRight: 'none'}}>Amount</th>
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
                    <td style={{...styles.tableCell, borderRight: 'none'}}>{row.amount}</td>
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
                {/* <div style={styles.emptyStateIcon}>🔍</div> */}
            
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER WITH BALANCES */}
      <div style={styles.footer}>
        <div style={styles.balanceBox}>
          <div style={styles.balanceLabel}>Opening Balance</div>
          <div style={styles.balanceValue}>0.00</div>
        </div>
        <div style={styles.balanceBox}>
          <div style={styles.balanceLabel}>Closing Balance</div>
          <div style={styles.balanceValue}>{calculateTotal()}</div>
        </div>
      </div>

      {/* PARTY POPUP */}
      {showPartyPopup && (
        <div style={styles.popupOverlay} onClick={handlePartyPopupClose}>
          <div 
            style={styles.popupContent} 
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => handlePopupKeyDown(e, 'party')}
          >
            <div style={styles.popupHeader}>
              Select Party
              <button 
                style={styles.closeButton}
                onClick={handlePartyPopupClose}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handlePartyPopupClose();
                }}
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
                    className="popup-item"
                    tabIndex="0"
                    style={isSelected ? styles.selectedPopupItem : styles.popupItem}
                    onClick={() => handlePartySelect(party)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePartySelect(party);
                      }
                    }}
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
                  className="popup-button clear"
                  style={{...styles.popupButton, ...styles.clearButton}}
                  onClick={handlePartyClearSelection}
                  onKeyDown={(e) => handlePopupButtonKeyDown(e, 'clear', 'party')}
                >
                  Clear
                </button>
                <button 
                  className="popup-button ok"
                  style={{...styles.popupButton, ...styles.okButton}}
                  onClick={handlePartyPopupOk}
                  onKeyDown={(e) => handlePopupButtonKeyDown(e, 'ok', 'party')}
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
            onKeyDown={(e) => handlePopupKeyDown(e, 'company')}
          >
            <div style={styles.popupHeader}>
              Select Company
              <button 
                style={styles.closeButton}
                onClick={handleCompanyPopupClose}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleCompanyPopupClose();
                }}
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
                    className="popup-item"
                    tabIndex="0"
                    style={isSelected ? styles.selectedPopupItem : styles.popupItem}
                    onClick={() => handleCompanySelect(company)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCompanySelect(company);
                      }
                    }}
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
                  className="popup-button clear"
                  style={{...styles.popupButton, ...styles.clearButton}}
                  onClick={handleCompanyClearSelection}
                  onKeyDown={(e) => handlePopupButtonKeyDown(e, 'clear', 'company')}
                >
                  Clear
                </button>
                <button 
                  className="popup-button ok"
                  style={{...styles.popupButton, ...styles.okButton}}
                  onClick={handleCompanyPopupOk}
                  onKeyDown={(e) => handlePopupButtonKeyDown(e, 'ok', 'company')}
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