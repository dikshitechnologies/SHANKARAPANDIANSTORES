import React, { useState, useEffect, useRef } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton } from '../../components/Buttons/ActionButtons';

const PurchaseInvoice = () => {
  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('');
  
  // 1. Header Details State
  const [billDetails, setBillDetails] = useState({
    invNo: '',
    billDate: '',   
    mobileNo: '',
    customerName: '',
    type: 'Retail',
    barcodeInput: '',
    entryDate: '',
    amount:'',
    partyCode:'',
    gstno:'',
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
    { id: '', barcode: '', name: '', sub: '', stock: '', mrp: '', uom: '', hsn: '', tax: '', rate: 0, qty: '' }
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

  // Popup state for advanced item fields
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupIndex, setPopupIndex] = useState(null);
  const [popupData, setPopupData] = useState({
    rate: 0,
    intax: '',
    outtax: '',
    acost: '',
    sudo: '',
    profitPercent: '',
    preRT: '',
    sRate: '',
    asRate: ''
  });
  // --- EFFECTS ---

  // Calculate Totals whenever items change
  useEffect(() => {
    const total = items.reduce((acc, item) => acc + (item.rate * item.qty), 0);
    setNetTotal(total);
  }, [items]);

  // Purchase details modal state
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const openPurchaseModal = (e) => {
    if (e) e.stopPropagation();
    setPurchaseModalOpen(true);
  };
  const closePurchaseModal = () => setPurchaseModalOpen(false);

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

      // If Enter pressed on Qty open the popup for advanced fields
      if (currentField === 'qty') {
        openPopupForRow(currentRowIndex);
        return;
      }

      // Fields in the visual order (excluding removed advanced columns)
      const fields = [
        'barcode','name','uom','stock','hsn','qty','ovrwt','avgwt',
        'mrp','letProfPer','ntCost','wsPercent','wsRate','min','max'
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

  const openPopupForRow = (index) => {
    const it = items[index] || {};
    setPopupData({
      rate: it.rate || 0,
      intax: it.intax || it.tax || '',
      outtax: it.outtax || '',
      acost: it.acost || '',
      sudo: it.sudo || '',
      profitPercent: it.profitPercent || '',
      preRT: it.preRT || '',
      sRate: it.sRate || '',
      asRate: it.asRate || ''
    });
    setPopupIndex(index);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setPopupIndex(null);
  };

  const savePopup = () => {
    if (popupIndex == null) return closePopup();
    setItems(items.map((item, idx) => idx === popupIndex ? { ...item, ...popupData } : item));
    closePopup();
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
      { id: 1, barcode: '', name: '', sub: '', stock: 0, mrp: 0, uom: '', hsn: '', tax: 0, rate: 0, qty: 0 }
    ]);
    setBillDetails({ ...billDetails, barcodeInput: '' });
  };

  // helper to compute input style for top-section fields
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
  const styles = {
    container: {
      fontFamily: 'Inter, Arial, sans-serif',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    },
    topSection: {
      backgroundColor: 'white',
      padding: '16px 16px',
      color: 'white',
      display: 'flex',
      gap: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flexShrink: 0,
      border: 'none',
      borderRadius: '0',
      margin: '0'
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      flex: 1,
      minWidth: '200px'
    },
    row: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    half: {
      flex: 1,
      minWidth: '140px'
    },
    third: {
      flex: 1,
      minWidth: '110px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    floatingLabelWrapper: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    floatingLabel: {
      position: 'absolute',
      top: -6,
      left: 10,
      backgroundColor: 'white',
      color: '#666',
      padding: '0 8px',
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      borderRadius: 4,
      lineHeight: '16px',
      
    },
    label: {
      fontWeight: '600',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: 'white',
      opacity: 0.95,
    },
    input: {
      padding: '10px 8px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      outline: 'none',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      backgroundColor: 'white',
      transition: 'all 0.2s ease',
    },
    select: {
      padding: '10px 12px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      backgroundColor: 'white',
      fontWeight: '600',
      color: 'black',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },
    btnBlue: {
      backgroundColor: 'white',
      border: 'none',
      color: '#1B91DA',
      padding: '6px 10px',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontWeight: '600',
      fontSize: '13px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    },
    tableContainer: {
      flex: '1 1 auto',
      backgroundColor: 'white',
     
      borderRadius: '8px',
      overflow: 'auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      maxHeight: '760px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '900px',
    },
    th: {
      backgroundColor: '#1B91DA',
      color: 'white',
      padding: '10px 8px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      border: '1px solid white',
      borderBottom: '2px solid white',
      width: '80px'
    },
    td: {
      padding: 0,
      textAlign: 'center',
      fontSize: '15px',
      border: '1px solid #ccc',
      color: '#333',
      fontWeight: '500',
    },
    editableInput: {
      display: 'block',
      width: '100%',
      height: '100%',
      minHeight: '36px',
      padding: '6px 8px',
      boxSizing: 'border-box',
      border: 'none',
      borderRadius: '4px',
      fontSize: '13px',
      textAlign: 'center',
      backgroundColor: 'transparent',
      outline: 'none',
      transition: 'border-color 0.2s ease',
    },
    itemNameContainer: {
      textAlign: 'left',
      paddingLeft: '15px',
      fontWeight: '600'
    },
    subText: {
      fontSize: '12px',
      color: '#888',
      marginTop: '2px',
      fontWeight: '400'
    },
    footerSection: {
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
      backgroundColor: '#1B91DA',
      color: 'white',
      padding: '12px 32px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      fontSize: '22px',
      fontWeight: '700',
      boxShadow: '0 4px 12px rgba(27, 145, 218, 0.3)',
      minWidth: 'max-content'
    },
    footerButtons: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
    },
    btnClear: {
      backgroundColor: '#1B91DA',
      color: 'white',
      border: 'none',
      padding: '10px 24px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(27, 145, 218, 0.3)'
    },
    btnSave: {
      backgroundColor: '#1B91DA',
      color: 'white',
      border: 'none',
      padding: '10px 24px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(27, 145, 218, 0.3)'
    },
    totalsRow: {
      fontWeight: '700',
      backgroundColor: '#e8f4fc',
      borderTop: '2px solid #1B91DA',
    }
    ,
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
      minWidth: 56,
      fontSize: 12,
      fontWeight: 700,
      color: '#333'
    },
    popupInput: {
      width: '100%',
      boxSizing: 'border-box',
      padding: '6px 8px',
      borderRadius: 4,
      border: '1px solid #ccc',
      fontSize: 13  
    }
    ,
    purchaseButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 10px',
      minWidth: 120,
      background: '#19692e',
      color: 'white',
      border: 'none',
      borderRadius: 20,
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: '13px',
      fontFamily: 'Inter, Arial, sans-serif',
      boxShadow: '0 6px 18px rgba(25,105,46,0.18)'
    },
    purchaseModalOverlay: {
      position: 'absolute',
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
      
      {/* --- TOP INPUT SECTION --- */}
      <div style={styles.topSection}>
        <div style={styles.column}>
          <div style={styles.row}>
            <div style={styles.half}>
              <div style={styles.floatingLabelWrapper}>
                <span style={styles.floatingLabel}>Inv No</span>
                <input
                  style={topInputStyle('invNo')}
                  value={billDetails.invNo}
                  name="invNo"
                  onChange={handleInputChange}
                  ref={billNoRef}
                  onKeyDown={(e) => handleKeyDown(e, dateRef)}
                  onFocus={() => setFocusedField('invNo')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
            </div>

            <div style={styles.half}>
              <div style={styles.floatingLabelWrapper}>
                <span style={styles.floatingLabel}>Bill Date</span>
                <input
                  style={topInputStyle('billDate')}
                  value={billDetails.billDate}
                  name="billDate"
                  onChange={handleInputChange}
                  ref={dateRef}
                  onKeyDown={(e) => handleKeyDown(e, amountRef)}
                  onFocus={() => setFocusedField('billDate')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.half}>
              <div style={styles.floatingLabelWrapper}>
                <span style={styles.floatingLabel}>Amount</span>
                <input
                  style={topInputStyle('amount')}
                  value={billDetails.amount}
                  name="amount"
                  onChange={handleInputChange}
                  ref={amountRef}
                  onKeyDown={(e) => handleKeyDown(e, customerRef)}
                  onFocus={() => setFocusedField('amount')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
            </div>

            <div style={{...styles.half,marginLeft:8}}>
              <div style={styles.inputGroup}>
                <label style={styles.label}></label>
                <div>
                  <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
                    <input
                      type="checkbox"
                      checked={billDetails.isLedger}
                      onChange={(e) => setBillDetails(prev => ({...prev, isLedger: e.target.checked}))}
                      style={{width: 18, height: 18, transform: 'scale(1.4)', transformOrigin: 'center', margin: 0}}
                    />
                    <span style={{fontSize:15,color: '#666', fontWeight:600}}>Is Ledger?</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.column}>
          <div style={styles.row}>
            <div style={styles.half}>
              <div style={styles.floatingLabelWrapper}>
                <span style={styles.floatingLabel}>Party Code</span>
                <input
                  style={topInputStyle('partyCode')}
                  value={billDetails.partyCode}
                  name="partyCode"
                  onChange={handleInputChange}
                  ref={customerRef}
                  onKeyDown={(e) => handleKeyDown(e, barcodeRef)}
                  onFocus={() => setFocusedField('partyCode')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
            </div>

            <div style={styles.half}>
              <div style={styles.floatingLabelWrapper}>
                <span style={styles.floatingLabel}>Customer Name</span>
                <input
                  style={topInputStyle('customerName')}
                  value={billDetails.customerName}
                  name="customerName"
                  onChange={handleInputChange}
                  ref={null}
                  onKeyDown={(e) => handleKeyDown(e, barcodeRef)}
                  onFocus={() => setFocusedField('customerName')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
            </div>
         
            <div style={styles.half}>
              <div style={styles.floatingLabelWrapper}>
                <span style={styles.floatingLabel}>City</span>
                <input
                  style={topInputStyle('city')}
                  value={billDetails.city}
                  name="city"
                  onChange={handleInputChange}
                  ref={mobileRef}
                  onKeyDown={(e) => handleKeyDown(e, customerRef)}
                  onFocus={() => setFocusedField('city')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
            </div>

            <div style={{...styles.half, display: 'flex', gap: 8}}>
              <div style={{...styles.floatingLabelWrapper, flex: 1}}>
                <span style={styles.floatingLabel}>Mobile No</span>
                <input
                  style={topInputStyle('mobileNo')}
                  value={billDetails.mobileNo}
                  name="mobileNo"
                  onChange={handleInputChange}
                  ref={mobileRef}
                  onKeyDown={(e) => handleKeyDown(e, customerRef)}
                  onFocus={() => setFocusedField('mobileNo')}
                  onBlur={() => setFocusedField('')}
                />
              </div>

              <div style={{...styles.floatingLabelWrapper, flex: 1}}>
                <span style={styles.floatingLabel}>GST No</span>
                <input
                  style={topInputStyle('gstno')}
                  value={billDetails.gstno}
                  name="gstno"
                  onChange={handleInputChange}
                  ref={null}
                  onKeyDown={(e) => handleKeyDown(e, customerRef)}
                  onFocus={() => setFocusedField('gstno')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
            </div>
          </div>

          
        </div>

        <div style={styles.column}>
          <div style={styles.row}>
            <div style={styles.half}>
              <div style={styles.floatingLabelWrapper}>
                <button type="button" style={styles.purchaseButton} onClick={openPurchaseModal} aria-haspopup="dialog" aria-expanded={purchaseModalOpen}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:'white'}}>
                    <rect x="3" y="4" width="18" height="4" rx="1"></rect>
                    <rect x="3" y="10" width="18" height="4" rx="1"></rect>
                    <rect x="3" y="16" width="18" height="4" rx="1"></rect>
                  </svg>
                  <span>Purchase Details</span>
                </button>
              </div>
            </div>

            <div style={styles.half}>
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
          </div>
        </div>

      </div>

      {/* --- TABLE SECTION --- */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>S.NO</th>
              <th style={styles.th}>PCode</th>
                  <th style={{...styles.th, textAlign:'left', paddingLeft:'15px',width:'400px'}}>Particulars</th>
                  <th style={styles.th}>UOM</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>HSN</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>OvrWt</th>
                  <th style={styles.th}>AvgWt</th>
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
              <tr key={item.id} style={{backgroundColor: 'white'}}>
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
                <td style={{...styles.td, ...styles.itemNameContainer}}>
                  <input
                      style={{...styles.editableInput, textAlign: 'left'}}
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
                  <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <input
                      style={{...styles.editableInput, paddingRight: '28px'}}
                      value={item.qty}
                      data-row={index}
                      data-field="qty"
                      onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                    />
                    <button
                      onClick={() => openPopupForRow(index)}
                      title="Advanced"
                      aria-label="Open advanced fields"
                      style={{
                        position: 'absolute',
                        right: 6,
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: '#1B91DA'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B91DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.3-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 6.59 2.6l.06.06c.45.45 1.1.64 1.7.47.5-.14 1-.09 1.51 0H11a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c0 .6.33 1.15.86 1.42.6.27 1.25.08 1.7-.37l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.45.45-.64 1.1-.47 1.7.14.5.09 1 .00 1.51V11c.62.02 1.12.51 1.14 1.14.01.5.06 1.01 0 1.51-.17.6-.3 1.25.15 1.7z"></path>
                      </svg>
                    </button>
                  </div>
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
                {/* removed duplicated MRP..Max block to match table header columns */}
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
                      style={{display: 'block', margin: 'auto'}}
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
            
            {/* Totals Row */}
            
          </tbody>
        </table>
      </div>

      {/* --- FOOTER SECTION --- */}
      <div style={styles.footerSection}>
        <div style={styles.netBox}>
          <span>Total Amount:</span>
          <span>₹ {netTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>

        <div style={styles.footerButtons}>
          <button style={{...styles.btnClear}} onClick={handleClear}>
             <span>✕</span> Clear
          </button>
          <button style={{...styles.btnSave}} onClick={() => alert('Saved Successfully!')}>
             <span>💾</span> Save
          </button>
          <button style={{...styles.btnSave}} onClick={() => window.print()}>
             <span>🖨</span> Print
          </button>
        </div>
      </div>

      {/* Popup for advanced fields */}
      {popupVisible && (
        <div style={styles.popupOverlay} onClick={closePopup}>
          <div style={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closePopup}
              aria-label="Close"
              style={{position:'absolute', right:12, top:12, background:'transparent', border:'none', fontSize:18, cursor:'pointer'}}
            >
              ✕
            </button>
            <div style={{marginBottom:8}}>
              <strong>Advanced Item Fields</strong>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>PRate</div>
                <input style={styles.popupInput} value={popupData.rate} onChange={(e) => setPopupData({...popupData, rate: parseFloat(e.target.value) || 0})} />
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>InTax</div>
                <input style={styles.popupInput} value={popupData.intax} onChange={(e) => setPopupData({...popupData, intax: e.target.value})} />
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>OutTax</div>
                <input style={styles.popupInput} value={popupData.outtax} onChange={(e) => setPopupData({...popupData, outtax: e.target.value})} />
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>ACost</div>
                <input style={styles.popupInput} value={popupData.acost} onChange={(e) => setPopupData({...popupData, acost: e.target.value})} />
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>Sudo</div>
                <input style={styles.popupInput} value={popupData.sudo} onChange={(e) => setPopupData({...popupData, sudo: e.target.value})} />
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>Profit%</div>
                <input style={styles.popupInput} value={popupData.profitPercent} onChange={(e) => setPopupData({...popupData, profitPercent: e.target.value})} />
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>PreRT</div>
                <input style={styles.popupInput} value={popupData.preRT} onChange={(e) => setPopupData({...popupData, preRT: e.target.value})} />
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>SRate</div>
                <input style={styles.popupInput} value={popupData.sRate} onChange={(e) => setPopupData({...popupData, sRate: e.target.value})} />
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>ASRate</div>
                <input style={styles.popupInput} value={popupData.asRate} onChange={(e) => setPopupData({...popupData, asRate: e.target.value})} />
              </div>
            </div>

            <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:12}}>
              <button onClick={closePopup} style={{padding:'6px 12px', borderRadius:4, border:'1px solid #ccc', background:'white'}}>Cancel</button>
              <button onClick={savePopup} style={{padding:'6px 12px', borderRadius:4, border:'none', background:'#1B91DA', color:'white'}}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Details Modal */}
      {purchaseModalOpen && (
        <div style={styles.purchaseModalOverlay} onClick={closePurchaseModal}>
          <div style={styles.purchaseModalContent} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Purchase Details">
            <button onClick={closePurchaseModal} aria-label="Close" style={{position:'absolute', right:12, top:12, background:'transparent', border:'none', fontSize:18, cursor:'pointer'}}>✕</button>
            <div style={{marginBottom:8}}><strong>Purchase Details</strong></div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>Pur No</div>
                <input name="purNo" style={styles.popupInput} value={billDetails.purNo} onChange={handleInputChange} />
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>Purdate</div>
                <input name="purDate" style={styles.popupInput} value={billDetails.purDate} onChange={handleInputChange} />
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>Invoice No</div>
                <input name="invoiceNo" style={styles.popupInput} value={billDetails.invoiceNo} onChange={handleInputChange} />
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>Trans Type</div>
                <select name="transType" style={styles.popupInput} value={billDetails.transType} onChange={(e) => setBillDetails({...billDetails, transType: e.target.value})}>
                  <option>PURCHASE</option>
                  <option>SALES</option>
                </select>
              </div>

              <div style={styles.popupRow}>
                <div style={styles.popupLabel}>Invoice Amt</div>
                <input name="invoiceAmount" style={styles.popupInput} value={billDetails.invoiceAmount || billDetails.amount} onChange={handleInputChange} />
              </div>
            </div>

            <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:12}}>
              <button onClick={closePurchaseModal} style={{padding:'6px 12px', borderRadius:4, border:'1px solid #ccc', background:'white'}}>Cancel</button>
              <button onClick={closePurchaseModal} style={{padding:'6px 12px', borderRadius:4, border:'none', background:'#19692e', color:'white'}}>Apply</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PurchaseInvoice;