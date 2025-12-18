import React, { useState, useEffect, useRef } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import 'bootstrap/dist/css/bootstrap.min.css';

const PurchaseReturn = () => {
  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('all');

  // 1. Header Details State
  const [returnDetails, setReturnDetails] = useState({
    returnNo: '',
    returnDate: '',
    mobileNo: '',
    customerName: '',
    type: 'Return',
    barcodeInput: '',
    entryDate: '',
    amount: '',
    partyCode: '',
    gstno: '',
    originalInvoiceNo: '',
    originalInvoiceDate: '',
    originalInvoiceAmount: '',
    transType: 'RETURN',
    city: '',
    reason: '',
    isLedger: false,
  });

  // 2. Table Items State
  const [items, setItems] = useState([
    {
      id: 1,
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
      asRate: '',
      letProfPer: '',
      ntCost: '',
      wsPercent: '',
      wsRate: '',
      min: '',
      max: '',
      returnReason: ''
    }
  ]);

  // 3. Totals State
  const [netTotal, setNetTotal] = useState(0);

  // --- REFS FOR ENTER KEY NAVIGATION ---
  const returnNoRef = useRef(null);
  const dateRef = useRef(null);
  const mobileRef = useRef(null);
  const customerRef = useRef(null);
  const barcodeRef = useRef(null);
  const addBtnRef = useRef(null);
  const amountRef = useRef(null);

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
    const total = items.reduce((acc, item) => acc + (parseFloat(item.rate) || 0) * (parseFloat(item.qty) || 0), 0);
    setNetTotal(total);
  }, [items]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReturnDetails(prev => ({ ...prev, [name]: value }));
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
    if (!returnDetails.barcodeInput) return alert("Please enter barcode");

    const newItem = {
      id: items.length + 1,
      barcode: returnDetails.barcodeInput,
      name: 'Item Name', // Static data
      sub: 'Item Description',
      stock: 100,
      mrp: 500,
      uom: 'PCS',
      hsn: 'HSCODE',
      tax: 18,
      rate: 400,
      qty: 1,
      returnReason: 'Damaged'
    };

    setItems([...items, newItem]);
    setReturnDetails(prev => ({ ...prev, barcodeInput: '' }));
    if (barcodeRef.current) barcodeRef.current.focus();
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
      asRate: '',
      letProfPer: '',
      ntCost: '',
      wsPercent: '',
      wsRate: '',
      min: '',
      max: '',
      returnReason: ''
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
        'barcode', 'name', 'uom', 'stock', 'hsn', 'qty', 'returnReason', 'ovrwt', 'avgwt',
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
    if (items.length > 0) {
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
        asRate: '',
        letProfPer: '',
        ntCost: '',
        wsPercent: '',
        wsRate: '',
        min: '',
        max: '',
        returnReason: ''
      }
    ]);
    setReturnDetails({ ...returnDetails, barcodeInput: '' });
  };

  const handleSave = () => {
    try {
      // Prepare return data
      const returnData = {
        returnNo: returnDetails.returnNo,
        returnDate: returnDetails.returnDate,
        customerName: returnDetails.customerName,
        partyCode: returnDetails.partyCode,
        originalInvoiceNo: returnDetails.originalInvoiceNo,
        originalInvoiceDate: returnDetails.originalInvoiceDate,
        totalAmount: netTotal,
        items: items.map(item => ({
          barcode: item.barcode,
          name: item.name,
          qty: parseFloat(item.qty) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0),
          returnReason: item.returnReason || '',
          uom: item.uom,
          hsn: item.hsn
        }))
      };

      console.log('Return Data:', returnData);
      alert('Purchase Return saved successfully!');

      // In a real application, you would send this data to your API
      // Example:
      // await axios.post('/api/purchase-returns', returnData);

    } catch (error) {
      console.error('Error saving purchase return:', error);
      alert('Failed to save purchase return');
    }
  };

  const handlePrint = () => {
    // Print logic here
    const printContent = `
      <html>
        <head>
          <title>Purchase Return - ${returnDetails.returnNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 20px; }
            .details table { width: 100%; border-collapse: collapse; }
            .details td { padding: 5px; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
            .footer { margin-top: 50px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Purchase Return</h2>
            <h3>Return No: ${returnDetails.returnNo}</h3>
          </div>
          <div class="details">
            <table>
              <tr><td><strong>Return Date:</strong></td><td>${returnDetails.returnDate}</td></tr>
              <tr><td><strong>Customer Name:</strong></td><td>${returnDetails.customerName}</td></tr>
              <tr><td><strong>Party Code:</strong></td><td>${returnDetails.partyCode}</td></tr>
              <tr><td><strong>Original Invoice No:</strong></td><td>${returnDetails.originalInvoiceNo}</td></tr>
            </table>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Return Reason</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.barcode}</td>
                  <td>${item.name}</td>
                  <td>${item.qty} ${item.uom}</td>
                  <td>₹${parseFloat(item.rate).toFixed(2)}</td>
                  <td>₹${(parseFloat(item.qty) * parseFloat(item.rate)).toFixed(2)}</td>
                  <td>${item.returnReason || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <h3>Total Amount: ₹${netTotal.toFixed(2)}</h3>
          </div>
          <div class="footer">
            <p>Authorized Signature</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
    gridRow: {
      display: 'grid',
      gap: '5px',
      marginBottom: 5,
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
      backgroundColor: '#1B91DA', // Changed to red for return
      color: 'white',
      padding: screenSize.isMobile ? '5px 3px' : screenSize.isTablet ? '7px 5px' : '10px 6px',
      textAlign: 'center',
      letterSpacing: '0.5px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      border: '1px solid white',
      borderBottom: '2px solid white',
      minWidth: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
      whiteSpace: 'nowrap',
      width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
      maxWidth: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
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
      minWidth: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
      width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
      maxWidth: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
    },
    editableInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      display: 'block',
      width: '100%',
      height: '100%',
      minHeight: screenSize.isMobile ? '26px' : screenSize.isTablet ? '30px' : '32px',
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
      minWidth: screenSize.isMobile ? '100px' : screenSize.isTablet ? '150px' : '200px',
      width: screenSize.isMobile ? '100px' : screenSize.isTablet ? '150px' : '200px',
      maxWidth: screenSize.isMobile ? '100px' : screenSize.isTablet ? '150px' : '200px',
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
    netBox: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: screenSize.isMobile ? TYPOGRAPHY.fontSize.base : screenSize.isTablet ? TYPOGRAPHY.fontSize.lg : TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#FF6B6B', // Changed to red for return
      padding: screenSize.isMobile ? '6px 12px' : screenSize.isTablet ? '10px 20px' : '12px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '12px' : screenSize.isTablet ? '20px' : '32px',
      minWidth: 'max-content',
      justifyContent: 'center',
      width: screenSize.isMobile ? '100%' : 'auto',
      order: screenSize.isMobile ? 1 : 0,
      borderRadius: screenSize.isMobile ? '4px' : '6px',
      backgroundColor: '#FFF0F0', // Light red background
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
      backgroundColor: '#FFE8E8', // Light red background
      borderTop: '2px solid #FF6B6B', // Red border
    },
  };

  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (screenSize.isMobile) {
      return 'repeat(2, 1fr)';
    } else if (screenSize.isTablet) {
      return 'repeat(4, 1fr)';
    } else {
      return 'repeat(6, 1fr)';
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
          {/* Return No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Inv No:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={returnDetails.returnNo}
              name="returnNo"
              onChange={handleInputChange}
              ref={returnNoRef}
              onKeyDown={(e) => handleKeyDown(e, dateRef)}
              onFocus={() => setFocusedField('returnNo')}
              onBlur={() => setFocusedField('')}
              // placeholder="Return No"
            />
          </div>

          {/* Return Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill Date:</label>
            <input
              type="date"
              style={{ ...styles.inlineInput, padding: screenSize.isMobile ? '6px 8px' : '8px 10px' }}
              value={returnDetails.returnDate}
              name="returnDate"
              onChange={handleInputChange}
              ref={dateRef}
              onKeyDown={(e) => handleKeyDown(e, amountRef)}
              onFocus={() => setFocusedField('returnDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Amount */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Amount:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={returnDetails.amount}
              name="amount"
              onChange={handleInputChange}
              ref={amountRef}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('amount')}
              onBlur={() => setFocusedField('')}
              // placeholder="Amount"
            />
          </div>

          {/* Original Invoice No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}> Invoice No:</label>
            <input
              type="text"
              name="originalInvoiceNo"
              style={styles.inlineInput}
              value={returnDetails.originalInvoiceNo}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('originalInvoiceNo')}
              onBlur={() => setFocusedField('')}
              // placeholder="Original Invoice No"
            />
          </div>

          {/* Original Invoice Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}> Inv Date:</label>
            <input
              type="date"
              name="originalInvoiceDate"
              style={{ ...styles.inlineInput, padding: screenSize.isMobile ? '6px 8px' : '8px 10px' }}
              value={returnDetails.originalInvoiceDate}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('originalInvoiceDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Original Invoice Amount */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Original Amt:</label>
            <input
              type="text"
              name="originalInvoiceAmount"
              style={styles.inlineInput}
              value={returnDetails.originalInvoiceAmount}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('originalInvoiceAmount')}
              onBlur={() => setFocusedField('')}
              // placeholder="Original Amount"
            />
          </div>
        </div>

        {/* ROW 2 */}
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
        }}>
          {/* Party Code */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Party Code:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={returnDetails.partyCode}
              name="partyCode"
              onChange={handleInputChange}
              ref={customerRef}
              onKeyDown={(e) => handleKeyDown(e, barcodeRef)}
              onFocus={() => setFocusedField('partyCode')}
              onBlur={() => setFocusedField('')}
              // placeholder="Party Code"
            />
          </div>

          {/* Customer Name */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}> Name:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={returnDetails.customerName}
              name="customerName"
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, barcodeRef)}
              onFocus={() => setFocusedField('customerName')}
              onBlur={() => setFocusedField('')}
              // placeholder="Customer Name"
            />
          </div>

          {/* City */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>City:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={returnDetails.city}
              name="city"
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('city')}
              onBlur={() => setFocusedField('')}
              // placeholder="City"
            />
          </div>

          {/* Trans Type */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Trans Type:</label>
            <select
              name="transType"
              style={styles.inlineInput}
              value={returnDetails.transType}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('transType')}
              onBlur={() => setFocusedField('')}
            >
              <option value="RETURN">RETURN</option>
              <option value="REFUND">REFUND</option>
              <option value="CREDIT_NOTE">CREDIT NOTE</option>
            </select>
          </div>

          {/* Return Reason */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Reason:</label>
            <select
              name="reason"
              style={styles.inlineInput}
              value={returnDetails.reason}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('reason')}
              onBlur={() => setFocusedField('')}
            >
              <option value="">Select Reason</option>
              <option value="DAMAGED">Damaged Goods</option>
              <option value="WRONG_ITEM">Wrong Item</option>
              <option value="EXPIRED">Expired</option>
              <option value="OVERSTOCK">Overstock</option>
              <option value="QUALITY">Quality Issue</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Mobile No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Mobile No:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={returnDetails.mobileNo}
              name="mobileNo"
              onChange={handleInputChange}
              ref={mobileRef}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('mobileNo')}
              onBlur={() => setFocusedField('')}
              // placeholder="Mobile No"
            />
          </div>
        </div>

        {/* ROW 3 */}
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
          marginBottom: '0',
        }}>
          {/* GST No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>GST No:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={returnDetails.gstno}
              name="gstno"
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('gstno')}
              onBlur={() => setFocusedField('')}
              // placeholder="GST No"
            />
          </div>

          {/* Is Ledger Checkbox */}
          <div style={{
            ...styles.formField,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '8px',
            height: '40px',
          }}>
            <label style={{ ...styles.inlineLabel, marginBottom: 0 }}>Is Ledger?</label>
            <input
              type="checkbox"
              checked={returnDetails.isLedger}
              onChange={(e) => setReturnDetails(prev => ({ ...prev, isLedger: e.target.checked }))}
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
                <th style={{ ...styles.th, ...styles.itemNameContainer, textAlign: 'left' }}>Particulars</th>
                <th style={styles.th}>UOM</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>HSN</th>
                <th style={styles.th}>Return Qty</th>
                <th style={styles.th}>Return Reason</th>
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
                <th style={styles.th}>PPer</th>
                <th style={styles.th}>NTCost</th>
                <th style={styles.th}>WS%</th>
                <th style={styles.th}>WSate</th>
                {/* <th style={styles.th}>Min</th>
                <th style={styles.th}>Max</th> */}
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
                      // placeholder="Particulars"
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
                    <select
                      style={styles.editableInput}
                      value={item.returnReason || ''}
                      data-row={index}
                      data-field="returnReason"
                      onChange={(e) => handleItemChange(item.id, 'returnReason', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'returnReason')}
                    >
                      <option value="">Select Reason</option>
                      <option value="DAMAGED">Damaged</option>
                      <option value="WRONG_ITEM">Wrong Item</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="QUALITY">Quality Issue</option>
                      <option value="OTHER">Other</option>
                    </select>
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
                  {/* <td style={styles.td}>
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
                  </td> */}
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
        <div style={styles.netBox}>
          <span>Total Return Amount:</span>
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

export default PurchaseReturn;