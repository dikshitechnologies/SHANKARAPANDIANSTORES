import React, { useState, useEffect, useRef } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';

const PurchaseInvoice = () => {
  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('all');
  
  // 1. Header Details State
  const [billDetails, setBillDetails] = useState({
    invNo: '',
    billDate: '',
    mobileNo: '',
    customerName: '',
    type: 'Retail',
    barcodeInput: '',
    entryDate: '',
    amount: '',
    partyCode: '',
    gstno: '',
    purNo: '',
    invoiceNo: '',
    purDate: '',
    invoiceAmount: '',
    transType: 'PURCHASE',
    city: '',
    isLedger: false,
  });

  // 2. Table Items State
  const [items, setItems] = useState([
    { 
      id: '', 
      barcode: '', 
      name: '', 
      sub: '', 
      stock: '0', 
      mrp: '0', 
      uom: '', 
      hsn: '', 
      tax: '', 
      rate: 0, 
      qty: '1',
      ovrwt: '',
      avgwt: '',
      prate: 0,
      intax: '',
      outtax: '',
      acost: '',
      sudo: '',
      profitPercent: '',
      preRT: '',
      sRate: '',
      asRate: ''
    }
  ]);

  // 3. Totals State
  const [netTotal, setNetTotal] = useState(0);

  // --- REFS FOR ENTER KEY NAVIGATION ---
  const billNoRef = useRef(null);
  const dateRef = useRef(null);
  const saleManRef = useRef(null);
  const mobileRef = useRef(null);
  const customerRef = useRef(null);
  const barcodeRef = useRef(null);
  const addBtnRef = useRef(null);
  const amountRef = useRef(null);

  // Track which top-section field is focused to style active input
  const [focusedField, setFocusedField] = useState('');

  // Footer action active state
  const [activeFooterAction, setActiveFooterAction] = useState('all');

  // --- EFFECTS ---

  // Calculate Totals whenever items change
  useEffect(() => {
    const total = items.reduce((acc, item) => acc + (item.rate * item.qty), 0);
    setNetTotal(total);
  }, [items]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillDetails(prev => ({ ...prev, [name]: value }));
  };

  // Handle Enter Key Navigation
  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleAddItem = () => {
    if (!billDetails.barcodeInput) return alert("Please enter barcode");
    
    const newItem = {
      id: items.length + 1,
      barcode: billDetails.barcodeInput,
      name: 'Fauget Cafe', // Mock data logic
      sub: 'Coffee Shop',
      stock: 500,
      mrp: 500,
      uom: 500,
      hsn: 'ASW090',
      tax: 21,
      rate: 2000000,
      qty: 1,
    };
    
    setItems([...items, newItem]);
    setBillDetails(prev => ({ ...prev, barcodeInput: '' }));
    barcodeRef.current.focus();
  };

  const handleAddRow = () => {
    const newRow = {
      id: items.length + 1,
      barcode: '',
      name: '',
      sub: '',
      stock: 0,
      mrp: 0,
      uom: '',
      hsn: '',
      tax: 0,
      rate: 0,
      qty: 1,
      ovrwt: '',
      avgwt: '',
      prate: 0,
      intax: '',
      outtax: '',
      acost: '',
      sudo: '',
      profitPercent: '',
      preRT: '',
      sRate: '',
      asRate: ''
    };
    setItems([...items, newRow]);
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleTableKeyDown = (e, currentRowIndex, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Fields in the visual order
      const fields = [
        'barcode', 'name', 'uom', 'stock', 'hsn', 'qty', 'ovrwt', 'avgwt',
        'prate', 'intax', 'outtax', 'acost', 'sudo', 'profitPercent', 'preRT', 'sRate', 'asRate',
        'mrp', 'letProfPer', 'ntCost', 'wsPercent', 'wsRate', 'min', 'max'
      ];

      const currentFieldIndex = fields.indexOf(currentField);

      if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        const nextInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="${nextField}"]`);
        if (nextInput) {
          nextInput.focus();
          return;
        }
      }

      if (currentRowIndex < items.length - 1) {
        const nextInput = document.querySelector(`input[data-row="${currentRowIndex + 1}"][data-field="barcode"]`);
        if (nextInput) {
          nextInput.focus();
          return;
        }
      }

      handleAddRow();
      setTimeout(() => {
        const newRowInput = document.querySelector(`input[data-row="${items.length}"][data-field="barcode"]`);
        if (newRowInput) newRowInput.focus();
      }, 60);
    }
  };

  const handleDelete = () => {
    // Removes the last item for demo purposes
    if(items.length > 0) {
      setItems(items.slice(0, -1));
    }
  };

  const handleDeleteRow = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      alert("Cannot delete the last row");
    }
  };

  const handleClear = () => {
    // Keep a single empty row after clearing
    setItems([
      { 
        id: 1, 
        barcode: '', 
        name: '', 
        sub: '', 
        stock: 0, 
        mrp: 0, 
        uom: '', 
        hsn: '', 
        tax: 0, 
        rate: 0, 
        qty: 0,
        ovrwt: '',
        avgwt: '',
        prate: 0,
        intax: '',
        outtax: '',
        acost: '',
        sudo: '',
        profitPercent: '',
        preRT: '',
        sRate: '',
        asRate: ''
      }
    ]);
    setBillDetails({ ...billDetails, barcodeInput: '' });
  };

  const handleSave = () => {
    // Save logic here
  };

  const handlePrint = () => {
    // Print logic here
  };

  // Helper to compute input style for top-section fields
  const topInputStyle = (name, override = {}) => ({
    ...styles.input,
    paddingTop: '12px',
    border: focusedField === name ? '1px solid #1B91DA' : styles.input.border,
    boxShadow: focusedField === name ? '0 0 0 4px rgba(27,145,218,0.06)' : 'none',
    ...override
  });

  const topSelectStyle = (name, override = {}) => ({
    ...styles.select,
    paddingTop: '12px',
    border: focusedField === name ? '1px solid #1B91DA' : '1px solid #ccc',
    boxShadow: focusedField === name ? '0 0 0 4px rgba(27,145,218,0.06)' : 'none',
    outline: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    ...override
  });

  // --- STYLES (Inline CSS) ---
  // Global Typography Constants
  const TYPOGRAPHY = {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '16px',
      sm: '17px',
      base: '18px',
      lg: '19px',
      xl: '22px'
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

  // Responsive Breakpoints
  const getResponsiveStyles = () => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    
    // Mobile: < 640px, Tablet: 640-1024px, Desktop: > 1024px
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const isDesktop = width >= 1024;
    
    return { isMobile, isTablet, isDesktop, width };
  };

  const responsive = getResponsiveStyles();

  const styles = {
    container: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#f5f7fa',
      height: 'calc(100vh - 60px)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'relative',
    },
    headerSection: {
      flex: '0 0 auto',
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: responsive.isMobile ? '12px' : '16px',
      margin: responsive.isMobile ? '8px' : '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflowY: 'auto',
      maxHeight: responsive.isMobile ? '45%' : responsive.isTablet ? '40%' : '35%',
    },
    tableSection: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden',
    },
    footerSection: {
      flex: '0 0 auto',
      position: 'static',
      bottom: 'auto',
      left: 'auto',
      width: 'auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 16px',
      backgroundColor: 'white',
      borderTop: '2px solid #e0e0e0',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
      gap: '12px',
      flexWrap: 'wrap',
      height: 'auto',
      minHeight: '60px',
    },
    formRow: {
      display: 'flex',
      // display: 'grid',
      //   gridTemplateColumns: '(5 fr 1fr)',
      //   gap: '12px',
      //   alignItems: 'flex-start'
    },
    formField: {
      // display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    inlineLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#333'
    },
    inlineInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: '8px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease',
      outline: 'none'
    },
    inlineDate: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: '8px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease',
      outline: 'none'
    },
    checkboxField: {
      // display: 'flex',
      alignItems: 'center',
      gap: '8px',
      whiteSpace: 'nowrap'
    },
    checkboxLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      color: '#666',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    },
    rightColumn: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
    },
    purchaseDetailsColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flex: '1 1 auto',
      minWidth: '350px',
      paddingLeft: '20px',
      borderLeft: '1px solid #ddd'
    },
    purchaseDetailsRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      alignItems: 'flex-start'
    },
    purchaseDetailField: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    purchaseDetailLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#333'
    },
    purchaseDetailInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: '8px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease',
      outline: 'none'
    },
    input: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: '10px 8px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      outline: 'none',
      color: '#333',
      backgroundColor: 'white',
      transition: 'all 0.2s ease',
    },
    select: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: '10px 12px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: 'white',
      color: 'black',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      overflowX: 'auto',
      overflowY: 'auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      margin: '16px 18px',
      WebkitOverflowScrolling: 'touch',
      width: 'calc(100% - 36px)',
      boxSizing: 'border-box',
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      backgroundColor: '#1B91DA', 
      color: 'white',
      padding: '10px 6px',
      textAlign: 'center',
      letterSpacing: '0.5px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      border: '1px solid white',
      borderBottom: '2px solid white',
      minWidth: '60px',
      whiteSpace: 'nowrap'
    },
    td: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: 0,
      textAlign: 'center',
      border: '1px solid #ccc',
      color: '#333',
      minWidth: '60px'
    },
    editableInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      display: 'block',
      width: '100%',
      height: '100%',
      minHeight: '32px',
      padding: '4px 6px',
      boxSizing: 'border-box',
      border: 'none',
      borderRadius: '4px',
      textAlign: 'center',
      backgroundColor: 'transparent',
      outline: 'none',
      transition: 'border-color 0.2s ease',
    },
    itemNameContainer: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      textAlign: 'left',
      paddingLeft: '15px'
    },
    subText: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      color: '#888',
      marginTop: '2px'
    },
    footerSection: {
      flex: '0 0 auto',
      position: 'static',
      bottom: 'auto',
      left: 'auto',
      width: 'auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 16px',
      backgroundColor: 'white',
      borderTop: '2px solid #e0e0e0',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
      gap: '12px',
      flexWrap: 'wrap',
      flexShrink: 0,
      minHeight: '60px'
    },
    netBox: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#1B91DA',
      padding: '12px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      minWidth: 'max-content'
    },
    footerButtons: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
    },
    btnClear: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#1B91DA',
      color: 'white',
      border: 'none',
      padding: '10px 24px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(27, 145, 218, 0.3)'
    },
    btnSave: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#1B91DA',
      color: 'white',
      border: 'none',
      padding: '10px 24px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(27, 145, 218, 0.3)'
    },
    totalsRow: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#e8f4fc',
      borderTop: '2px solid #1B91DA',
    },
    popupOverlay: {
      position: 'fixed',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    },
    popupContent: {
      position: 'relative',
      background: 'white',
      borderRadius: 8,
      padding: 16,
      width: 480,
      maxWidth: '95%',
      boxSizing: 'border-box',
      overflow: 'auto',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
    },
    popupRow: {
      display: 'flex',
      gap: 8,
      marginBottom: 8,
      alignItems: 'center'
    },
    popupLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      minWidth: 56,
      color: '#333'
    },
    popupInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      width: '100%',
      boxSizing: 'border-box',
      padding: '6px 8px',
      borderRadius: 4,
      border: '1px solid #ccc'
    },
    floatingLabelWrapper: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    purchaseButton: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 10px',
      width: 160,
      background: '#1B91DA',
      color: 'white',
      border: 'none',
      borderRadius: 20,
      cursor: 'pointer',
      boxShadow: '0 6px 18px rgba(25,105,46,0.18)',
      height: 38,
    },
    purchaseModalOverlay: {
      position: 'fixed',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    },
    purchaseModalContent: {
      width: 520,
      maxWidth: '95%',
      background: 'white',
      borderRadius: 8,
      padding: 16,
      boxSizing: 'border-box',
      boxShadow: '0 12px 40px rgba(0,0,0,0.25)'
    }
  };

  return (
    <div style={styles.container}>
      {/* --- HEADER SECTION --- */}
      <div style={styles.headerSection}>
        {/* ROW 1 */}
        <div style={{
          display: 'grid', 
          gridTemplateColumns: responsive.isMobile ? 'repeat(2, 1fr)' : responsive.isTablet ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', 
          gap: responsive.isMobile ? '12px' : '16px', 
          marginBottom: '16px'
        }}>
          {/* Inv No */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Inv No:</span>
            <input 
              type="text"
              style={{...styles.inlineInput, flex: 1}}
              value={billDetails.invNo}
              name="invNo"
              onChange={handleInputChange}
              ref={billNoRef}
              onKeyDown={(e) => handleKeyDown(e, dateRef)}
              onFocus={() => setFocusedField('invNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Bill No"
            />
          </div>

          {/* Bill Date */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Bill Date:</span>
            <input
              type="date"
              style={{...styles.inlineInput, flex: 1, padding: '8px 10px'}}
              value={billDetails.billDate}
              name="billDate"
              onChange={handleInputChange}
              ref={dateRef}
              onKeyDown={(e) => handleKeyDown(e, amountRef)}
              onFocus={() => setFocusedField('billDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Amount */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Amount:</span>
            <input
              type="text"
              style={{...styles.inlineInput, flex: 1}}
              value={billDetails.amount}
              name="amount"
              onChange={handleInputChange}
              ref={amountRef}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('amount')}
              onBlur={() => setFocusedField('')}
              placeholder="Amount"
            />
          </div>

          {/* Pur No */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Pur No:</span>
            <input
              type="text"
              name="purNo"
              style={{...styles.inlineInput, flex: 1}}
              value={billDetails.purNo}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('purNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Pur No"
            />
          </div>

            {/* Invoice No */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Invoice No:</span>
            <input
              type="text"
              name="invoiceNo"
              style={{...styles.inlineInput, flex: 1}}
              value={billDetails.invoiceNo}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('invoiceNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Invoice No"
            />
          </div>

          {/* Pur Date */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Pur Date:</span>
            <input
              type="date"
              name="purDate"
              style={{...styles.inlineInput, flex: 1, padding: '8px 10px'}}
              value={billDetails.purDate}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('purDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>


        </div>

        {/* ROW 2 */}
        <div style={{
          display: 'grid', 
          gridTemplateColumns: responsive.isMobile ? 'repeat(2, 1fr)' : responsive.isTablet ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', 
          gap: responsive.isMobile ? '12px' : '16px'
        }}>
          {/* Party Code */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Party Code:</span>
            <input
              type="text"
              style={{...styles.inlineInput, flex: 1}}
              value={billDetails.partyCode}
              name="partyCode"
              onChange={handleInputChange}
              ref={customerRef}
              onKeyDown={(e) => handleKeyDown(e, barcodeRef)}
              onFocus={() => setFocusedField('partyCode')}
              onBlur={() => setFocusedField('')}
              placeholder="Party Code"
            />
          </div>

          {/* Customer Name */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Customer:</span>
            <input
              type="text"
              style={{...styles.inlineInput, flex: 1}}
              value={billDetails.customerName}
              name="customerName"
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, barcodeRef)}
              onFocus={() => setFocusedField('customerName')}
              onBlur={() => setFocusedField('')}
              placeholder="Customer Name"
            />
          </div>

          {/* City */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>City:</span>
            <input
              type="text"
              style={{...styles.inlineInput, flex: 1}}
              value={billDetails.city}
              name="city"
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('city')}
              onBlur={() => setFocusedField('')}
              placeholder="City"
            />
          </div>

          {/* Trans Type */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Trans Type:</span>
            <select
              name="transType"
              style={{...styles.inlineInput, flex: 1}}
              value={billDetails.transType}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('transType')}
              onBlur={() => setFocusedField('')}
            >
              <option value="">Select</option>
              <option value="Cash">Cash</option>
              <option value="Credit">Credit</option>
            </select>
          </div>

          {/* Invoice Amt */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Invoice Amt:</span>
            <input
              type="text"
              name="invoiceAmount"
              style={{...styles.inlineInput, flex: 1}}
              value={billDetails.invoiceAmount}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('invoiceAmount')}
              onBlur={() => setFocusedField('')}
              placeholder="Invoice Amount"
            />
          </div>
          <div></div>
 <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Mobile No:</span>
            <input
              type="text"
              style={{...styles.inlineInput, flex: 1}}
              value={billDetails.mobileNo}
              name="mobileNo"
              onChange={handleInputChange}
              ref={mobileRef}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('mobileNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Mobile No"
            />
          </div>
          
                    {/* GST No */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>GST No:</span>
            <input
              type="text"
              style={{...styles.inlineInput, flex: 1}}
              value={billDetails.gstno}
              name="gstno"
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('gstno')}
              onBlur={() => setFocusedField('')}
              placeholder="GST No"
            />
          </div>

          {/* Is Ledger Checkbox */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{...styles.inlineLabel, whiteSpace: 'nowrap', minWidth: '80px'}}>Is Ledger?</span>
            <input
              type="checkbox"
              checked={billDetails.isLedger}
              onChange={(e) => setBillDetails(prev => ({ ...prev, isLedger: e.target.checked }))}
              style={{ width: 18, height: 18 }}
              id="isLedger"
            />
          </div>
         
        </div>




      </div>

      {/* --- TABLE SECTION --- */}
      <div style={styles.tableSection}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>S.NO</th>
              <th style={styles.th}>PCode</th>
              <th style={{ ...styles.th, textAlign: 'left', paddingLeft: '15px', width: '400px' }}>Particulars</th>
              <th style={styles.th}>UOM</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>HSN</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>OvrWt</th>
              <th style={styles.th}>AvgWt</th>
              <th style={styles.th}>PRate</th>
              <th style={styles.th}>InTax</th>
              <th style={styles.th}>OutTax</th>
              <th style={styles.th}>ACost</th>
              <th style={styles.th}>Sudo</th>
              <th style={styles.th}>Profit%</th>
              <th style={styles.th}>PreRT</th>
              <th style={styles.th}>SRate</th>
              <th style={styles.th}>ASRate</th>
              <th style={styles.th}>MRP</th>
              <th style={styles.th}>LetProfPer</th>
              <th style={styles.th}>NTCost</th>
              <th style={styles.th}>WS%</th>
              <th style={styles.th}>WSate</th>
              <th style={styles.th}>Min</th>
              <th style={styles.th}>Max</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} style={{ backgroundColor: 'white' }}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.barcode}
                    data-row={index}
                    data-field="barcode"
                    onChange={(e) => handleItemChange(item.id, 'barcode', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'barcode')}
                  />
                </td>
                <td style={{ ...styles.td, ...styles.itemNameContainer }}>
                  <input
                    style={{ ...styles.editableInput, textAlign: 'left' }}
                    value={item.name}
                    placeholder="Particulars"
                    data-row={index}
                    data-field="name"
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'name')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.uom}
                    data-row={index}
                    data-field="uom"
                    onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'uom')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.stock}
                    data-row={index}
                    data-field="stock"
                    onChange={(e) => handleItemChange(item.id, 'stock', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'stock')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.hsn}
                    data-row={index}
                    data-field="hsn"
                    onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'hsn')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.qty}
                    data-row={index}
                    data-field="qty"
                    onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.ovrwt || ''}
                    data-row={index}
                    data-field="ovrwt"
                    onChange={(e) => handleItemChange(item.id, 'ovrwt', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'ovrwt')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.avgwt || ''}
                    data-row={index}
                    data-field="avgwt"
                    onChange={(e) => handleItemChange(item.id, 'avgwt', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'avgwt')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.prate || ''}
                    data-row={index}
                    data-field="prate"
                    onChange={(e) => handleItemChange(item.id, 'prate', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'prate')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.intax || ''}
                    data-row={index}
                    data-field="intax"
                    onChange={(e) => handleItemChange(item.id, 'intax', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'intax')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.outtax || ''}
                    data-row={index}
                    data-field="outtax"
                    onChange={(e) => handleItemChange(item.id, 'outtax', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'outtax')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.acost || ''}
                    data-row={index}
                    data-field="acost"
                    onChange={(e) => handleItemChange(item.id, 'acost', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'acost')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.sudo || ''}
                    data-row={index}
                    data-field="sudo"
                    onChange={(e) => handleItemChange(item.id, 'sudo', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'sudo')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.profitPercent || ''}
                    data-row={index}
                    data-field="profitPercent"
                    onChange={(e) => handleItemChange(item.id, 'profitPercent', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'profitPercent')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.preRT || ''}
                    data-row={index}
                    data-field="preRT"
                    onChange={(e) => handleItemChange(item.id, 'preRT', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'preRT')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.sRate || ''}
                    data-row={index}
                    data-field="sRate"
                    onChange={(e) => handleItemChange(item.id, 'sRate', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'sRate')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.asRate || ''}
                    data-row={index}
                    data-field="asRate"
                    onChange={(e) => handleItemChange(item.id, 'asRate', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'asRate')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.mrp}
                    data-row={index}
                    data-field="mrp"
                    onChange={(e) => handleItemChange(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'mrp')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.letProfPer || ''}
                    data-row={index}
                    data-field="letProfPer"
                    onChange={(e) => handleItemChange(item.id, 'letProfPer', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'letProfPer')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.ntCost || ''}
                    data-row={index}
                    data-field="ntCost"
                    onChange={(e) => handleItemChange(item.id, 'ntCost', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'ntCost')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.wsPercent || ''}
                    data-row={index}
                    data-field="wsPercent"
                    onChange={(e) => handleItemChange(item.id, 'wsPercent', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'wsPercent')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.wsRate || ''}
                    data-row={index}
                    data-field="wsRate"
                    onChange={(e) => handleItemChange(item.id, 'wsRate', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'wsRate')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.min || ''}
                    data-row={index}
                    data-field="min"
                    onChange={(e) => handleItemChange(item.id, 'min', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'min')}
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.editableInput}
                    value={item.max || ''}
                    data-row={index}
                    data-field="max"
                    onChange={(e) => handleItemChange(item.id, 'max', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'max')}
                  />
                </td>
                <td style={styles.td}>
                  <button
                    aria-label="Delete row"
                    title="Delete row"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#dc3545',
                      border: 'none',
                      padding: 0,
                      borderRadius: '2px',
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.15s ease'
                    }}
                    onClick={() => handleDeleteRow(item.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#dc3545"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                      style={{ display: 'block', margin: 'auto' }}
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* --- FOOTER SECTION --- */}
      <div style={styles.footerSection}>
        <div style={styles.rightColumn}>
          <ActionButtons activeButton={activeTopAction} onButtonClick={(type) => {
            setActiveTopAction(type);
            if (type === 'add') handleAddRow();
            else if (type === 'edit') alert('Edit action: select a row to edit');
            else if (type === 'delete') handleDelete();
          }}>
            <AddButton />
            <EditButton />
            <DeleteButton />
          </ActionButtons>
        </div>
        <div style={styles.netBox}>
          
          <span>Total Amount:</span>
          <span>₹ {netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div style={styles.footerButtons}>
          <ActionButtons1
            onClear={handleClear}
            onSave={handleSave}
            onPrint={handlePrint}
            activeButton={activeFooterAction}
            onButtonClick={(type) => setActiveFooterAction(type)}
          />
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoice;