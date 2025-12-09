import React, { useState, useEffect, useRef } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import 'bootstrap/dist/css/bootstrap.min.css';

const SaleInvoice = () => {
  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('all');
  
  // 1. Header Details State
  const [billDetails, setBillDetails] = useState({
    billNo: 'SE00001AA',
    billDate: new Date().toISOString().substring(0, 10),
    mobileNo: '',
    type: 'Retail',
    salesman: '',
    custName: '',
    returnReason: '',
    barcodeInput: '',
    partyCode: '',
    gstno: '',
    city: '',
    transType: 'SALES INVOICE'
  });

  // 2. Table Items State
  const [items, setItems] = useState([
    { 
      id: 1, 
      sNo: 1,
      barcode: '', 
      itemName: '', 
      stock: '', 
      mrp: '', 
      uom: '', 
      hsn: '', 
      tax: '', 
      sRate: '', 
      qty: '',
      amount: '0.00'
    }
  ]);

  // 3. Totals State
  const [totalQty, setTotalQty] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // --- REFS FOR ENTER KEY NAVIGATION ---
  const billNoRef = useRef(null);
  const billDateRef = useRef(null);
  const mobileRef = useRef(null);
  const typeRef = useRef(null);
  const salesmanRef = useRef(null);
  const custNameRef = useRef(null);
  const returnReasonRef = useRef(null);
  const barcodeRef = useRef(null);

  // Track which top-section field is focused to style active input
  const [focusedField, setFocusedField] = useState('');

  // Footer action active state
  const [activeFooterAction, setActiveFooterAction] = useState('all');

  // Screen size state for responsive adjustments
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  // Update screen size on resize
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

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate Totals whenever items change
  useEffect(() => {
    const qtyTotal = items.reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
    const amountTotal = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
    
    setTotalQty(qtyTotal);
    setTotalAmount(amountTotal);
  }, [items]);

  // Calculate amount when qty or sRate changes
  const calculateAmount = (qty, sRate) => {
    const qtyNum = parseFloat(qty || 0);
    const sRateNum = parseFloat(sRate || 0);
    return (qtyNum * sRateNum).toFixed(2);
  };

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillDetails(prev => ({ ...prev, [name]: value }));
  };

  // Handle Enter Key Navigation for form fields
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
      sNo: items.length + 1,
      barcode: billDetails.barcodeInput,
      itemName: 'Sample Item', // Mock data
      stock: '100',
      mrp: '500',
      uom: 'PCS',
      hsn: '123456',
      tax: '18',
      sRate: '400',
      qty: '1',
      amount: '400.00'
    };
    
    setItems([...items, newItem]);
    setBillDetails(prev => ({ ...prev, barcodeInput: '' }));
    if (barcodeRef.current) barcodeRef.current.focus();
  };

  const handleAddRow = () => {
    const newRow = {
      id: items.length + 1,
      sNo: items.length + 1,
      barcode: '',
      itemName: '',
      stock: '',
      mrp: '',
      uom: '',
      hsn: '',
      tax: '',
      sRate: '',
      qty: '',
      amount: '0.00'
    };
    setItems([...items, newRow]);
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount if qty or sRate changes
        if (field === 'qty' || field === 'sRate') {
          const qty = field === 'qty' ? value : updatedItem.qty;
          const sRate = field === 'sRate' ? value : updatedItem.sRate;
          updatedItem.amount = calculateAmount(qty, sRate);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleTableKeyDown = (e, currentRowIndex, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Fields in the visual order (without WRate)
      const fields = [
        'barcode', 'itemName', 'stock', 'mrp', 'uom', 'hsn', 'tax', 'sRate', 'qty'
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
      const filteredItems = items.filter(item => item.id !== id);
      // Update serial numbers
      const updatedItems = filteredItems.map((item, index) => ({
        ...item,
        sNo: index + 1
      }));
      setItems(updatedItems);
    } else {
      // Don't delete the last row, just clear it
      const clearedItem = {
        id: 1,
        sNo: 1,
        barcode: '',
        itemName: '',
        stock: '',
        mrp: '',
        uom: '',
        hsn: '',
        tax: '',
        sRate: '',
        qty: '',
        amount: '0.00'
      };
      setItems([clearedItem]);
    }
  };

  const handleClear = () => {
    // Reset form
    setBillDetails({
      billNo: 'SE00001AA',
      billDate: new Date().toISOString().substring(0, 10),
      mobileNo: '',
      type: 'Retail',
      salesman: '',
      custName: '',
      returnReason: '',
      barcodeInput: '',
      partyCode: '',
      gstno: '',
      city: '',
      transType: 'SALES INVOICE'
    });
    
    // Keep a single empty row after clearing
    setItems([
      { 
        id: 1, 
        sNo: 1,
        barcode: '', 
        itemName: '', 
        stock: '', 
        mrp: '', 
        uom: '', 
        hsn: '', 
        tax: '', 
        sRate: '', 
        qty: '',
        amount: '0.00'
      }
    ]);
  };

  const handleSave = () => {
    // Save logic here
    alert(`Sale Invoice data saved successfully!\n\nTotal Quantity: ${totalQty.toFixed(2)}\nTotal Amount: ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  };

  const handlePrint = () => {
    // Print logic here
    alert('Print functionality to be implemented');
  };

  // --- RESPONSIVE STYLES ---
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
    formRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    formField: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      flexWrap: 'wrap',
    },
    inlineLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#333',
      minWidth: screenSize.isMobile ? '75px' : screenSize.isTablet ? '85px' : '95px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      paddingTop: '2px',
    },
    inlineInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '5px 6px' : screenSize.isTablet ? '6px 8px' : '8px 10px',
      border: '1px solid #ddd',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease',
      outline: 'none',
      width: '100%',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '80px' : '100px',
    },
    formSelect: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '5px 6px' : screenSize.isTablet ? '6px 8px' : '8px 10px',
      border: '1px solid #ddd',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease',
      outline: 'none',
      width: '100%',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '80px' : '100px',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    gridRow: {
      display: 'grid',
      gap: '8px',
      marginBottom: 10,
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
      minWidth: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
      whiteSpace: 'nowrap',
      width: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
      maxWidth: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
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
      minWidth: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
      width: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
      maxWidth: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
    },
    editableInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      display: 'block',
      width: '100%',
      height: '100%',
      minHeight: screenSize.isMobile ? '28px' : screenSize.isTablet ? '32px' : '35px',
      padding: screenSize.isMobile ? '2px 3px' : screenSize.isTablet ? '3px 5px' : '4px 6px',
      boxSizing: 'border-box',
      border: 'none',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
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
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '15px',
      minWidth: screenSize.isMobile ? '120px' : screenSize.isTablet ? '160px' : '200px',
      width: screenSize.isMobile ? '120px' : screenSize.isTablet ? '160px' : '200px',
      maxWidth: screenSize.isMobile ? '120px' : screenSize.isTablet ? '160px' : '200px',
    },
    amountContainer: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      textAlign: 'right',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '15px',
      minWidth: screenSize.isMobile ? '80px' : screenSize.isTablet ? '100px' : '120px',
      width: screenSize.isMobile ? '80px' : screenSize.isTablet ? '100px' : '120px',
      maxWidth: screenSize.isMobile ? '80px' : screenSize.isTablet ? '100px' : '120px',
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
    totalsContainer: {
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
    totalItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
    },
    totalLabel: {
      fontSize: screenSize.isMobile ? '10px' : screenSize.isTablet ? '11px' : '12px',
      color: '#555',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    totalValue: {
      fontSize: screenSize.isMobile ? '14px' : screenSize.isTablet ? '16px' : '18px',
      color: '#1976d2',
      fontWeight: 'bold',
    },
    rightColumn: {
      display: 'flex',
      gap: screenSize.isMobile ? '10px' : screenSize.isTablet ? '12px' : '12px',
      flexWrap: 'wrap',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-start',
      width: screenSize.isMobile ? '100%' : 'auto',
      order: screenSize.isMobile ? 2 : 0,
    },
    footerButtons: {
      display: 'flex',
      gap: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '12px',
      flexWrap: 'wrap',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-end',
      width: screenSize.isMobile ? '100%' : 'auto',
      order: screenSize.isMobile ? 3 : 0,
    },
    actionButtonsWrapper: {
      display: 'flex',
      gap: '8px',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-start',
      marginTop: screenSize.isMobile ? '12px' : '0',
    },
    totalsRow: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#e8f4fc',
      borderTop: '2px solid #1B91DA',
    },
  };

  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (screenSize.isMobile) {
      return 'repeat(2, 1fr)';
    } else if (screenSize.isTablet) {
      return 'repeat(3, 1fr)';
    } else {
      return 'repeat(4, 1fr)';
    }
  };

  // Helper function for form change handling
  const handleFormChange = (fieldName) => (e) => {
    const value = e.target.value;
    setBillDetails(prev => ({ ...prev, [fieldName]: value }));
  };

  // Helper function for form key down handling
  const handleFormKeyDown = (fieldName, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Define the navigation order
      const navigationOrder = ['billNo', 'billDate', 'mobileNo', 'type', 'salesman', 'custName', 'returnReason', 'barcodeInput'];
      const currentIndex = navigationOrder.indexOf(fieldName);
      
      if (currentIndex < navigationOrder.length - 1) {
        const nextField = navigationOrder[currentIndex + 1];
        const nextRef = {
          'billNo': billNoRef,
          'billDate': billDateRef,
          'mobileNo': mobileRef,
          'type': typeRef,
          'salesman': salesmanRef,
          'custName': custNameRef,
          'returnReason': returnReasonRef,
          'barcodeInput': barcodeRef
        }[nextField];
        
        if (nextRef && nextRef.current) {
          nextRef.current.focus();
        }
      } else if (fieldName === 'barcodeInput') {
        handleAddItem();
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* --- HEADER SECTION --- */}
      <div style={styles.headerSection}>
        {/* ROW 1 */}
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
        }}>
          {/* Bill No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill No:</label>
            <input 
              type="text"
              style={styles.inlineInput}
              value={billDetails.billNo}
              name="billNo"
              onChange={handleInputChange}
              ref={billNoRef}
              onKeyDown={(e) => handleKeyDown(e, billDateRef)}
              onFocus={() => setFocusedField('billNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Bill No"
            />
          </div>

          {/* Bill Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill Date:</label>
            <input
              type="date"
              style={{...styles.inlineInput, padding: screenSize.isMobile ? '6px 8px' : '8px 10px'}}
              value={billDetails.billDate}
              name="billDate"
              onChange={handleInputChange}
              ref={billDateRef}
              onKeyDown={(e) => handleKeyDown(e, mobileRef)}
              onFocus={() => setFocusedField('billDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Mobile No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Mobile No:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={billDetails.mobileNo}
              name="mobileNo"
              onChange={handleInputChange}
              ref={mobileRef}
              onKeyDown={(e) => handleKeyDown(e, typeRef)}
              onFocus={() => setFocusedField('mobileNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Mobile No"
            />
          </div>

          {/* Salesman */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Salesman:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={billDetails.salesman}
              name="salesman"
              onChange={handleInputChange}
              ref={salesmanRef}
              onKeyDown={(e) => handleKeyDown(e, custNameRef)}
              onFocus={() => setFocusedField('salesman')}
              onBlur={() => setFocusedField('')}
              placeholder="Salesman"
            />
          </div>

          
        </div>

        {/* ROW 2 */}
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
        }}>
          

          {/* Type Field (Replaces EMP Name) */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}> Type: </label>
            <select
              name="type"
              style={styles.formSelect}
              value={billDetails.type}
              onChange={handleFormChange('type')}
              ref={typeRef}
              onKeyDown={(e) => handleFormKeyDown('type', e)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1976d2';
                setFocusedField('type');
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                setFocusedField('');
              }}
            >
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
            </select>
          </div>

          {/* Customer Name */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Customer:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={billDetails.custName}
              name="custName"
              onChange={handleInputChange}
              ref={custNameRef}
              onKeyDown={(e) => handleKeyDown(e, returnReasonRef)}
              onFocus={() => setFocusedField('custName')}
              onBlur={() => setFocusedField('')}
              placeholder="Customer Name"
            />
          </div>

          
          {/* Barcode */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Barcode:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={billDetails.barcodeInput}
              name="barcodeInput"
              onChange={handleInputChange}
              ref={barcodeRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              onFocus={() => setFocusedField('barcodeInput')}
              onBlur={() => setFocusedField('')}
              placeholder="Barcode"
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
                <th style={styles.th}>S.No</th>
                <th style={styles.th}>Barcode</th>
                <th style={{ ...styles.th, ...styles.itemNameContainer, textAlign: 'left' }}>Item Name</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>MRP</th>
                <th style={styles.th}>UOM</th>
                <th style={styles.th}>HSN</th>
                <th style={styles.th}>TAX (%)</th>
                <th style={styles.th}>SRate</th>
                <th style={styles.th}>Qty</th>
                <th style={{ ...styles.th, ...styles.amountContainer, textAlign: 'right' }}>Amount</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                  <td style={styles.td}>{item.sNo}</td>
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
                      value={item.itemName}
                      placeholder="Item Name"
                      data-row={index}
                      data-field="itemName"
                      onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'itemName')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.stock}
                      data-row={index}
                      data-field="stock"
                      onChange={(e) => handleItemChange(item.id, 'stock', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'stock')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.mrp}
                      data-row={index}
                      data-field="mrp"
                      onChange={(e) => handleItemChange(item.id, 'mrp', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'mrp')}
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
                      value={item.tax}
                      data-row={index}
                      data-field="tax"
                      onChange={(e) => handleItemChange(item.id, 'tax', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'tax')}
                      step="0.01"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.sRate}
                      data-row={index}
                      data-field="sRate"
                      onChange={(e) => handleItemChange(item.id, 'sRate', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'sRate')}
                      step="0.01"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={{...styles.editableInput, fontWeight: 'bold'}}
                      value={item.qty}
                      data-row={index}
                      data-field="qty"
                      onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                      step="0.01"
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.amountContainer }}>
                    <input
                      style={{...styles.editableInput, textAlign: 'right', fontWeight: 'bold', color: '#1565c0', backgroundColor: '#f0f7ff'}}
                      value={parseFloat(item.amount || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                      readOnly
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
                        fontSize: screenSize.isMobile ? '12px' : '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.15s ease',
                        minHeight: screenSize.isMobile ? '28px' : '32px',
                      }}
                      onClick={() => handleDeleteRow(item.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={screenSize.isMobile ? "16" : "18"}
                        height={screenSize.isMobile ? "16" : "18"}
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
    <ActionButtons 
      activeButton={activeTopAction} 
      onButtonClick={(type) => {
        setActiveTopAction(type);
        if (type === 'add') handleAddRow();
        else if (type === 'edit') alert('Edit action: select a row to edit');
        else if (type === 'delete') handleDelete();
      }}
    >
      <AddButton />
      <EditButton />
      <DeleteButton />
    </ActionButtons>
  </div>

  {/* Add/Less Quantity Input Box */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: screenSize.isMobile ? '6px' : '8px',
    marginRight: screenSize.isMobile ? '0' : '15px',
    order: screenSize.isMobile ? 2 : 0,
    marginTop: screenSize.isMobile ? '5px' : '0',
    width: screenSize.isMobile ? '100%' : 'auto',
    justifyContent: screenSize.isMobile ? 'center' : 'flex-start'
  }}>
    <span style={{
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#333',
      whiteSpace: 'nowrap'
    }}>
      Add/Less:
    </span>
    <input
      type="number"
      style={{
        width: screenSize.isMobile ? '120px' : '150px',
        border: '1px solid #1B91DA',
        borderRadius: '4px',
        padding: screenSize.isMobile ? '6px 10px' : '8px 12px',
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontFamily: TYPOGRAPHY.fontFamily,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        outline: 'none',
        textAlign: 'center',
        backgroundColor: 'white',
        color: '#333',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      }}
      placeholder="Enter Qty"
      min="-999"
      max="999"
      step="1"
      defaultValue=""
      onFocus={(e) => {
        e.target.style.borderColor = '#1479c0';
        e.target.style.boxShadow = '0 0 0 2px rgba(27, 145, 218, 0.2)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#1B91DA';
        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const value = parseInt(e.target.value) || 0;
          
          if (value !== 0) {
            // Apply the value to all items (add if positive, subtract if negative)
            const updatedItems = items.map(item => {
              const currentQty = parseFloat(item.qty) || 0;
              const newQty = Math.max(0, currentQty + value); // Don't go below 0
              return {
                ...item,
                qty: newQty.toString(),
                amount: calculateAmount(newQty.toString(), item.sRate)
              };
            });
            setItems(updatedItems);
            
            // Show feedback
            const action = value > 0 ? 'added to' : 'subtracted from';
            console.log(`${Math.abs(value)} ${action} all quantities`);
          }
          
          // Clear the input after applying
          e.target.value = '';
        }
      }}
    />
  </div>
  
  <div style={styles.totalsContainer}>
    <div style={styles.totalItem}>
      <span style={styles.totalLabel}>Total Quantity</span>
      <span style={styles.totalValue}>{totalQty.toFixed(2)}</span>
    </div>
    <div style={styles.totalItem}>
      <span style={styles.totalLabel}>Total Amount</span>
      <span style={styles.totalValue}>
        ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
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

export default SaleInvoice;