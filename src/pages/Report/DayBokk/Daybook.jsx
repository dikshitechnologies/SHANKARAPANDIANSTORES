import React, { useState, useEffect } from 'react';

const DayBook = () => {
  const [fromDate, setFromDate] = useState('2025-12-29');
  const [toDate, setToDate] = useState('2025-12-30');
  const [selectedBranches, setSelectedBranches] = useState(['ALL']);
  const [showBranchPopup, setShowBranchPopup] = useState(false);
  const [tempSelectedBranches, setTempSelectedBranches] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [tableLoaded, setTableLoaded] = useState(false);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);

  const allBranches = [
    'ALL',
    'DIKSHI DEMO',
    'DIKSH',
    'DIKSHI TECH',
    'DIKSHIWEBSITE',
    'DIKSHIWBCOMDOT',
    'SAKTHI',
    'JUST AK THINGS',
    'PRIVANKA'
  ];

  const dayBookData = [
    {
      accName: "OPG ON :29-02-12",
      receipts: "0.00",
      payments: ""
    },
    {
      accName: "Total",
      receipts: "0.00",
      payments: "0.00",
      isTotal: true
    },
    {
      accName: "Clg ON :29-02-12",
      receipts: "0.00",
      payments: ""
    },
    {
      accName: "OPG ON :01-03-12",
      receipts: "0.00",
      payments: ""
    },
    {
      accName: "Total",
      receipts: "0.00",
      payments: "0.00",
      isTotal: true
    },
    {
      accName: "Clg ON :01-03-12",
      receipts: "0.00",
      payments: ""
    },
    {
      accName: "OPG ON :02-03-12",
      receipts: "0.00",
      payments: ""
    },
    {
      accName: "Total",
      receipts: "0.00",
      payments: "0.00",
      isTotal: true
    },
    {
      accName: "Clg ON :02-03-12",
      receipts: "0.00",
      payments: ""
    }
  ];

  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  useEffect(() => {
    setTempSelectedBranches([...selectedBranches]);
  }, [selectedBranches]);

  const handleBranchClick = () => {
    setTempSelectedBranches([...selectedBranches]);
    setShowBranchPopup(true);
  };

  const handleBranchSelect = (branch) => {
    if (branch === 'ALL') {
      if (tempSelectedBranches.includes('ALL')) {
        setTempSelectedBranches([]);
        setSelectAll(false);
      } else {
        setTempSelectedBranches(allBranches);
        setSelectAll(true);
      }
    } else {
      let updatedBranches;
      if (tempSelectedBranches.includes(branch)) {
        updatedBranches = tempSelectedBranches.filter(b => b !== branch);
        if (updatedBranches.includes('ALL')) {
          updatedBranches = updatedBranches.filter(b => b !== 'ALL');
        }
      } else {
        updatedBranches = [...tempSelectedBranches, branch];
        const otherBranches = allBranches.filter(b => b !== 'ALL');
        if (otherBranches.every(b => updatedBranches.includes(b))) {
          updatedBranches = allBranches;
        }
      }
      setTempSelectedBranches(updatedBranches);
      setSelectAll(updatedBranches.length === allBranches.length);
    }
  };

  const handlePopupOk = () => {
    setSelectedBranches([...tempSelectedBranches]);
    setShowBranchPopup(false);
  };

  const handleClearSelection = () => {
    setTempSelectedBranches([]);
    setSelectAll(false);
  };

  const handlePopupClose = () => {
    setShowBranchPopup(false);
  };

  const handleSearch = () => {
    if (!fromDate || !toDate || selectedBranches.length === 0) {
      alert('Please fill all fields: From Date, To Date, and select at least one branch');
      return;
    }
    
    console.log('Searching with:', {
      fromDate,
      toDate,
      selectedBranches
    });
    
    setTableLoaded(true);
  };

  const handleDateChange = (type, value) => {
    if (type === 'from') {
      setFromDate(value);
      setShowFromCalendar(false);
    } else {
      setToDate(value);
      setShowToCalendar(false);
    }
  };

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
      transition: 'all 0.3s ease'
    },
    
    header: {
      background: 'linear-gradient(135deg, white 0%, #f8fafd 100%)',
      color: accentColors.text,
      padding: '35px 40px',
      borderBottom: `1px solid ${accentColors.border}`,
      position: 'relative'
    },
    
    headerDecoration: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '200px',
      height: '200px',
      background: `radial-gradient(circle, ${accentColors.light} 0%, transparent 70%)`,
      opacity: 0.5
    },
    
    headerTitle: {
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '35px',
      color: accentColors.primary,
      textAlign: 'center',
      letterSpacing: '-0.5px',
      position: 'relative',
      paddingBottom: '15px'
    },
    
    headerTitleUnderline: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80px',
      height: '4px',
      background: `linear-gradient(90deg, ${accentColors.primary}, ${accentColors.secondary})`,
      borderRadius: '2px'
    },
    
    // UPDATED: Better grid proportions with even spacing
    firstRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1.5fr 0.8fr 0.8fr', // More balanced columns
      gap: '25px', // Increased gap for better spacing
      marginBottom: '35px',
      position: 'relative',
      alignItems: 'center' // Align items vertically
    },
    
    controlGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px' // Added gap between label and input
    },
    
    controlLabel: {
      fontSize: '15px',
      color: 'black',
      marginBottom: '0', // Removed bottom margin since we use gap
      fontWeight: '600',
      letterSpacing: '0.5px',
      textTransform: 'uppercase'
    },
    
    dateInputWrapper: {
      position: 'relative',
      width: '100%'
    },
    
    dateDisplay: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px',
      paddingRight: '45px',
      border: `1.5px solid ${accentColors.border}`,
      borderRadius: '10px',
      backgroundColor: 'white',
      fontSize: '15px',
      color: accentColors.text,
      minHeight: '48px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      ':hover': {
        borderColor: accentColors.secondary,
        boxShadow: `0 4px 12px ${accentColors.secondary}20`,
        transform: 'translateY(-1px)'
      }
    },
    
    calendarIcon: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: accentColors.secondary,
      cursor: 'pointer',
      fontSize: '20px',
      transition: 'transform 0.3s ease',
      ':hover': {
        transform: 'translateY(-50%) scale(1.1)'
      }
    },
    
    branchInput: {
      width: '100%',
      padding: '14px 18px',
      border: `1.5px solid ${accentColors.border}`,
      borderRadius: '10px',
      fontSize: '15px',
      backgroundColor: 'white',
      color: accentColors.text,
      minHeight: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      ':hover': {
        borderColor: accentColors.secondary,
        boxShadow: `0 4px 12px ${accentColors.secondary}20`,
        transform: 'translateY(-1px)'
      }
    },
    
    calendarPopup: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: '0',
      zIndex: 1001,
      backgroundColor: 'white',
      border: `1px solid ${accentColors.border}`,
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      width: '320px',
      overflow: 'hidden',
      animation: 'slideDown 0.3s ease'
    },
    
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      background: `linear-gradient(135deg, ${accentColors.primary} 0%, ${accentColors.secondary} 100%)`,
      color: 'white',
      position: 'relative'
    },
    
    calendarNavButton: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      ':hover': {
        background: 'rgba(255,255,255,0.3)',
        transform: 'scale(1.05)'
      }
    },
    
    calendarMonthYear: {
      fontSize: '16px',
      fontWeight: '600',
      letterSpacing: '0.5px'
    },
    
    calendarWeekDays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      padding: '15px',
      backgroundColor: accentColors.background,
      borderBottom: `1px solid ${accentColors.border}`
    },
    
    calendarWeekDay: {
      textAlign: 'center',
      fontSize: '12px',
      fontWeight: '700',
      color: accentColors.textLight,
      padding: '8px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    
    calendarDays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      padding: '15px',
      gap: '6px'
    },
    
    calendarDay: {
      textAlign: 'center',
      padding: '12px 8px',
      cursor: 'pointer',
      borderRadius: '8px',
      fontSize: '14px',
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
      padding: '12px 8px'
    },
    
    // UPDATED: More compact button styling
    searchButton: {
      padding: '16px 24px',
      background: `linear-gradient(135deg, ${accentColors.primary} 0%, ${accentColors.secondary} 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: `0 4px 16px ${accentColors.secondary}40`,
      letterSpacing: '0.5px',
      position: 'relative',
      overflow: 'hidden',
      width: '100%', // Make button take full width of its cell
      height: '48px', // Match input height
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px ${accentColors.secondary}60`,
        letterSpacing: '1px'
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
    
    // UPDATED: Button container for proper alignment
    buttonContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      height: '100%'
    },
    
    content: {
      padding: '30px'
    },
    
    tableContainer: {
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      border: `1px solid ${accentColors.border}`,
      background: 'white'
    },
    
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      marginTop: '0'
    },
    
    tableHeader: {
      background: `linear-gradient(135deg, ${accentColors.primary} 0%, ${accentColors.dark} 100%)`,
      color: 'white',
      padding: '18px 20px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '14px',
      border: 'none',
      position: 'relative',
      overflow: 'hidden',
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
      padding: '16px 20px',
      borderBottom: `1px solid ${accentColors.border}`,
      fontSize: '14px',
      color: accentColors.text,
      transition: 'all 0.2s ease',
      fontWeight: '500'
    },
    
    totalCell: {
      padding: '18px 20px',
      borderBottom: `1px solid ${accentColors.border}`,
      fontSize: '15px',
      fontWeight: '700',
      background: accentColors.light,
      borderTop: `2px solid ${accentColors.secondary}`,
      color: accentColors.dark
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
      padding: '60px 30px',
      color: accentColors.textLight,
      fontSize: '16px',
      background: accentColors.background,
      borderRadius: '12px',
      margin: '20px',
      border: `2px dashed ${accentColors.border}`,
      transition: 'all 0.3s ease'
    },
    
    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '20px',
      color: accentColors.secondary,
      opacity: 0.5
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
      animation: 'fadeIn 0.3s ease'
    },
    
    popupContent: {
      backgroundColor: 'white',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '520px',
      maxHeight: '80vh',
      overflow: 'hidden',
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.2)',
      border: `1px solid ${accentColors.secondary}`,
      animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    popupHeader: {
      background: `linear-gradient(135deg, ${accentColors.primary} 0%, ${accentColors.secondary} 100%)`,
      color: 'white',
      padding: '24px 30px 24px 30px',
      margin: 0,
      fontSize: '22px',
      fontWeight: '700',
      borderBottom: `1px solid ${accentColors.dark}`,
      position: 'relative',
      letterSpacing: '0.5px'
    },
    
    closeButton: {
      position: 'absolute',
      right: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '10px',
      transition: 'all 0.3s ease',
      ':hover': {
        background: 'rgba(255,255,255,0.3)',
        transform: 'translateY(-50%) rotate(90deg)'
      }
    },
    
    branchList: {
      padding: '25px',
      maxHeight: '350px',
      overflowY: 'auto'
    },
    
    branchItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      margin: '8px 0',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: `1px solid transparent`,
      ':hover': {
        backgroundColor: `${accentColors.light}80`,
        transform: 'translateX(4px)',
        borderColor: accentColors.secondary
      }
    },
    
    selectedBranchItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      margin: '8px 0',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: `${accentColors.light}`,
      borderLeft: `4px solid ${accentColors.secondary}`,
      border: `1px solid ${accentColors.secondary}40`,
      boxShadow: `0 4px 12px ${accentColors.secondary}20`,
      transform: 'translateX(4px)'
    },
    
    branchCheckbox: {
      width: '22px',
      height: '22px',
      border: `2px solid ${accentColors.secondary}`,
      borderRadius: '6px',
      marginRight: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backgroundColor: 'white',
      transition: 'all 0.3s ease'
    },
    
    selectedBranchCheckbox: {
      width: '22px',
      height: '22px',
      border: `2px solid ${accentColors.secondary}`,
      borderRadius: '6px',
      marginRight: '15px',
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
      fontSize: '14px'
    },
    
    branchText: {
      color: accentColors.text,
      fontSize: '15px',
      fontWeight: '500'
    },
    
    popupActions: {
      borderTop: `1px solid ${accentColors.border}`,
      padding: '25px',
      backgroundColor: accentColors.background
    },
    
    popupButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px'
    },
    
    popupButton: {
      padding: '12px 28px',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      minWidth: '100px',
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
    },

    footer: {
      padding: '20px',
      backgroundColor: accentColors.background,
      borderTop: `1px solid ${accentColors.border}`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },

    // UPDATED: Refresh button styling to match search button
    refreshButton: {
      padding: '16px 24px',
      background: 'white',
      color: accentColors.text,
      border: `1.5px solid ${accentColors.border}`,
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      letterSpacing: '0.5px',
      position: 'relative',
      overflow: 'hidden',
      width: '100%', // Make button take full width of its cell
      height: '48px', // Match input height
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        borderColor: accentColors.secondary,
        boxShadow: `0 4px 12px ${accentColors.secondary}20`,
        transform: 'translateY(-1px)'
      },
      ':active': {
        transform: 'translateY(-1px)'
      }
    }
  };

  const fromCalendarDate = new Date(fromDate);
  const toCalendarDate = new Date(toDate);
  
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerDecoration}></div>
        <h1 style={styles.headerTitle}>
          Day Book
          <div style={styles.headerTitleUnderline}></div>
        </h1>
        
        {/* FIRST ROW: From Date, To Date, Branch, Search Button */}
        <div style={styles.firstRow}>
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
          
          {/* Branch */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>Branch</div>
            <div 
              style={styles.branchInput}
              onClick={handleBranchClick}
            >
              {selectedBranches.length > 0 
                ? selectedBranches.join(', ') 
                : 'Select Branch'}
              <span style={{color: accentColors.secondary, fontSize: '12px', transition: 'transform 0.3s ease'}}>▼</span>
            </div>
          </div>
          
          {/* Search Button */}
          <div style={styles.buttonContainer}>
            <button 
              style={styles.searchButton}
              onClick={handleSearch}
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
            >
              Search
              {hoveredButton && <div style={styles.searchButtonGlow}></div>}
            </button>
          </div>

          {/* Refresh Button */}
          <div style={styles.buttonContainer}>
            <button 
              style={styles.refreshButton}
              onClick={() => setTableLoaded(false)}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* TABLE CONTENT */}
      <div style={styles.content}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>
                  Acc Name
                  <div style={styles.tableHeaderGlow}></div>
                </th>
                <th style={styles.tableHeader}>
                  Receipts
                  <div style={styles.tableHeaderGlow}></div>
                </th>
                <th style={styles.tableHeader}>
                  Payments
                  <div style={styles.tableHeaderGlow}></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {(tableLoaded ? dayBookData : []).map((row, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={row.isTotal ? styles.totalCell : styles.tableCell}>
                    {row.accName}
                  </td>
                  <td style={row.isTotal ? styles.totalCell : styles.tableCell}>
                    {row.receipts}
                  </td>
                  <td style={row.isTotal ? styles.totalCell : styles.tableCell}>
                    {row.payments}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BRANCH POPUP */}
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
            
            <div style={styles.branchList}>
              {allBranches.map((branch) => {
                const isSelected = tempSelectedBranches.includes(branch);
                return (
                  <div 
                    key={branch} 
                    style={isSelected ? styles.selectedBranchItem : styles.branchItem}
                    onClick={() => handleBranchSelect(branch)}
                  >
                    <div style={isSelected ? styles.selectedBranchCheckbox : styles.branchCheckbox}>
                      {isSelected && <div style={styles.checkmark}>✓</div>}
                    </div>
                    <span style={styles.branchText}>{branch}</span>
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

export default DayBook;