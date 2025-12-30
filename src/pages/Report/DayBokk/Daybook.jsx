import React, { useState, useEffect, useRef } from 'react';

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
  const [focusedField, setFocusedField] = useState('');
  
  // Refs for all focusable elements
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const branchRef = useRef(null);
  const searchButtonRef = useRef(null);
  const refreshButtonRef = useRef(null);
  const branchItemsRef = useRef([]);
  
  // Store all focusable elements in order
  const focusableElements = [
    { ref: fromDateRef, name: 'fromDate', type: 'input' },
    { ref: toDateRef, name: 'toDate', type: 'input' },
    { ref: branchRef, name: 'branch', type: 'button' },
    { ref: searchButtonRef, name: 'search', type: 'button' },
    { ref: refreshButtonRef, name: 'refresh', type: 'button' }
  ];

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

  // Handle date input change
  const handleDateChange = (field, value) => {
    if (field === 'from') {
      setFromDate(value);
    } else {
      setToDate(value);
    }
  };

  // Handle keyboard navigation for main controls
  const handleKeyDown = (e, currentIndex, fieldName) => {
    const totalElements = focusableElements.length;
    
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (fieldName === 'search') {
          handleSearch();
        } else if (fieldName === 'refresh') {
          setTableLoaded(false);
        } else if (fieldName === 'branch') {
          handleBranchClick();
        } else {
          // Move to next element
          const nextIndex = (currentIndex + 1) % totalElements;
          focusableElements[nextIndex].ref.current.focus();
        }
        break;
        
      case 'Tab':
        // Allow default Tab behavior but prevent when in popup
        if (showBranchPopup) {
          e.preventDefault();
          // Handle tab in popup
          const popupFocusable = document.querySelectorAll(
            '.branch-item, .popup-button'
          );
          if (popupFocusable.length > 0) {
            const firstElement = popupFocusable[0];
            if (document.activeElement === popupFocusable[popupFocusable.length - 1] && !e.shiftKey) {
              // Cycle back to first element
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        if (showBranchPopup) {
          // Navigate within popup
          handlePopupArrowNavigation(e);
        } else {
          // Navigate to next field
          const nextIndex = (currentIndex + 1) % totalElements;
          focusableElements[nextIndex].ref.current.focus();
        }
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        if (showBranchPopup) {
          // Navigate within popup
          handlePopupArrowNavigation(e);
        } else {
          // Navigate to previous field
          const prevIndex = (currentIndex - 1 + totalElements) % totalElements;
          focusableElements[prevIndex].ref.current.focus();
        }
        break;
        
      case 'ArrowDown':
        if (fieldName === 'branch' && !showBranchPopup) {
          e.preventDefault();
          handleBranchClick();
        } else if (showBranchPopup) {
          e.preventDefault();
          handlePopupArrowNavigation(e);
        }
        break;
        
      case 'ArrowUp':
        if (showBranchPopup) {
          e.preventDefault();
          handlePopupArrowNavigation(e);
        }
        break;
        
      case 'Escape':
        if (showBranchPopup) {
          e.preventDefault();
          handlePopupClose();
        } else {
          e.currentTarget.blur();
        }
        break;
        
      case ' ':
        if (fieldName === 'branch') {
          e.preventDefault();
          handleBranchClick();
        } else if (fieldName === 'search') {
          e.preventDefault();
          handleSearch();
        } else if (fieldName === 'refresh') {
          e.preventDefault();
          setTableLoaded(false);
        }
        break;
    }
  };

  // Handle arrow navigation within branch popup
  const handlePopupArrowNavigation = (e) => {
    if (!showBranchPopup) return;
    
    const branchItems = document.querySelectorAll('.branch-item');
    if (branchItems.length === 0) return;
    
    const currentIndex = Array.from(branchItems).findIndex(
      item => item === document.activeElement
    );
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
        nextIndex = currentIndex < branchItems.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : branchItems.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowLeft':
        // Move to OK/Clear buttons from last branch item
        if (e.key === 'ArrowRight' && currentIndex === branchItems.length - 1) {
          const okButton = document.querySelector('.popup-button.ok');
          if (okButton) okButton.focus();
        } else if (e.key === 'ArrowLeft' && currentIndex === 0) {
          const clearButton = document.querySelector('.popup-button.clear');
          if (clearButton) clearButton.focus();
        }
        return;
    }
    
    if (nextIndex !== -1) {
      branchItems[nextIndex].focus();
    }
  };

  // Handle keyboard in popup buttons
  const handlePopupButtonKeyDown = (e, buttonType) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (buttonType === 'ok') {
          handlePopupOk();
        } else if (buttonType === 'clear') {
          handleClearSelection();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (buttonType === 'ok') {
          const clearButton = document.querySelector('.popup-button.clear');
          if (clearButton) clearButton.focus();
        } else {
          const lastBranchItem = document.querySelectorAll('.branch-item');
          if (lastBranchItem.length > 0) {
            lastBranchItem[lastBranchItem.length - 1].focus();
          }
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (buttonType === 'clear') {
          const okButton = document.querySelector('.popup-button.ok');
          if (okButton) okButton.focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        handlePopupClose();
        break;
    }
  };

  useEffect(() => {
    setTempSelectedBranches([...selectedBranches]);
  }, [selectedBranches]);

  // Focus management when popup opens/closes
  useEffect(() => {
    if (showBranchPopup) {
      // Focus first branch item when popup opens
      setTimeout(() => {
        const firstBranchItem = document.querySelector('.branch-item');
        if (firstBranchItem) firstBranchItem.focus();
      }, 100);
    }
  }, [showBranchPopup]);

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
    // Return focus to branch button
    setTimeout(() => branchRef.current?.focus(), 100);
  };

  const handleClearSelection = () => {
    setTempSelectedBranches([]);
    setSelectAll(false);
  };

  const handlePopupClose = () => {
    setShowBranchPopup(false);
    // Return focus to branch button
    setTimeout(() => branchRef.current?.focus(), 100);
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

  // Same styles object as before...
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
      gridTemplateColumns: '0.8fr 0.8fr 2fr 0.7fr 0.7fr',
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
    
    branchInput: {
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
      outline: 'none'
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
      minWidth: '800px'
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
    
    totalCell: {
      padding: '12px 15px',
      borderBottom: '1px solid #ddd',
      fontSize: '14px',
      fontWeight: '700',
      background: '#f8f9fa',
      borderTop: '2px solid #1B91DA',
      color: '#0c7bb8'
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
      border: '2px dashed #ddd'
    },
    
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
      outline: 'none'
    },
    
    branchList: {
      padding: '15px 20px',
      maxHeight: '350px',
      overflowY: 'auto'
    },
    
    branchItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 12px',
      margin: '4px 0',
      borderRadius: '3px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid transparent',
      outline: 'none'
    },
    
    selectedBranchItem: {
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
    
    branchCheckbox: {
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
    
    selectedBranchCheckbox: {
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
    
    branchText: {
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
      color: 'white'
    },
    
    clearButton: {
      background: 'white',
      color: '#666',
      border: '1px solid #ddd'
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
      outline: 'none'
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Day Book</h1>
        
        {/* FIRST ROW: From Date, To Date, Branch, Search Button, Refresh Button */}
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
          
          {/* Branch */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>Branch</div>
            <button
              ref={branchRef}
              style={{
                ...styles.branchInput,
                ...(focusedField === 'branch' && styles.focusedInput)
              }}
              onClick={handleBranchClick}
              onKeyDown={(e) => handleKeyDown(e, 2, 'branch')}
              onFocus={() => setFocusedField('branch')}
              onBlur={() => setFocusedField('')}
            >
              {selectedBranches.length > 0 
                ? selectedBranches.join(', ') 
                : 'Select Branch'}
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
              onKeyDown={(e) => handleKeyDown(e, 3, 'search')}
              onFocus={() => setFocusedField('search')}
              onBlur={() => setFocusedField('')}
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
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
              onClick={() => setTableLoaded(false)}
              onKeyDown={(e) => handleKeyDown(e, 4, 'refresh')}
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
                  <th style={styles.tableHeader}>Acc Name</th>
                  <th style={styles.tableHeader}>Receipts</th>
                  <th style={{...styles.tableHeader, borderRight: 'none'}}>Payments</th>
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
                    <td style={row.isTotal ? {...styles.totalCell, borderRight: 'none'} : {...styles.tableCell, borderRight: 'none'}}>
                      {row.payments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BRANCH POPUP */}
      {showBranchPopup && (
        <div style={styles.popupOverlay} onClick={handlePopupClose}>
          <div 
            style={styles.popupContent} 
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handlePopupClose();
            }}
          >
            <div style={styles.popupHeader}>
              Select Branch
              <button 
                style={styles.closeButton}
                onClick={handlePopupClose}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handlePopupClose();
                }}
              >
                ×
              </button>
            </div>
            
            <div style={styles.branchList}>
              {allBranches.map((branch, index) => {
                const isSelected = tempSelectedBranches.includes(branch);
                return (
                  <div 
                    key={branch}
                    className="branch-item"
                    tabIndex="0"
                    style={isSelected ? styles.selectedBranchItem : styles.branchItem}
                    onClick={() => handleBranchSelect(branch)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleBranchSelect(branch);
                      } else {
                        handlePopupArrowNavigation(e);
                      }
                    }}
                    ref={(el) => (branchItemsRef.current[index] = el)}
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
                  className="popup-button clear"
                  style={{...styles.popupButton, ...styles.clearButton}}
                  onClick={handleClearSelection}
                  onKeyDown={(e) => handlePopupButtonKeyDown(e, 'clear')}
                >
                  Clear
                </button>
                <button 
                  className="popup-button ok"
                  style={{...styles.popupButton, ...styles.okButton}}
                  onClick={handlePopupOk}
                  onKeyDown={(e) => handlePopupButtonKeyDown(e, 'ok')}
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