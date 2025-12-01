import React, { useState, useEffect, useRef } from 'react';

const SalesInvoices = () => {
  // --- STATE MANAGEMENT ---
  
  // 1. Header Details State
  const [billDetails, setBillDetails] = useState({
    billNo: '',
    billDate: '',
    saleMan: '',
    mobileNo: '',
    customerName: '',
    type: 'Retail',
    barcodeInput: ''
  });

  // 2. Table Items State
  const [items, setItems] = useState([
    { id: 1, barcode: '', name: '', sub: '', stock: 0, mrp: 0, uom: '', hsn: '', tax: 0, rate: 0, qty: 1 }
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
      
      const fields = ['barcode', 'name', 'stock', 'mrp', 'uom', 'hsn', 'tax', 'rate', 'qty'];
      const currentFieldIndex = fields.indexOf(currentField);
      
      // Move to next field in same row
      if (currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        const nextInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="${nextField}"]`);
        if (nextInput) nextInput.focus();
      } else {
        // Move to first field of next row, or add new row if last row
        if (currentRowIndex < items.length - 1) {
          const nextInput = document.querySelector(`input[data-row="${currentRowIndex + 1}"][data-field="barcode"]`);
          if (nextInput) nextInput.focus();
        } else {
          // Add new row and focus first field
          handleAddRow();
          setTimeout(() => {
            const newRowInput = document.querySelector(`input[data-row="${items.length}"][data-field="barcode"]`);
            if (newRowInput) newRowInput.focus();
          }, 50);
        }
      }
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
    setItems([]);
    setBillDetails({ ...billDetails, barcodeInput: '' });
  };

  // --- STYLES (Inline CSS) ---
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    },
    topSection: {
      backgroundColor: '#1B91DA',
      padding: '12px 16px',
      color: 'white',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flexShrink: 0,
      border: 'none',
      borderRadius: '0',
      margin: '0'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
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
      padding: '8px 10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      outline: 'none',
      fontSize: '15px',
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
      backgroundColor: '#1B91DA',
      fontWeight: '600',
      color: 'white',
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
      padding: '8px 14px',
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
      margin: '12px 16px',
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
      borderBottom: 'none',
      width: '80px'
    },
    td: {
      padding: '8px 6px',
      textAlign: 'center',
      fontSize: '15px',
      borderBottom: '1px solid #f0f0f0',
      color: '#333',
      fontWeight: '500',
    },
    editableInput: {
      width: '100%',
      padding: '6px 8px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      fontSize: '14px',
      textAlign: 'center',
      backgroundColor: 'white',
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
  };

  return (
    <div style={styles.container}>
      
      {/* --- TOP INPUT SECTION --- */}
      <div style={styles.topSection}>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Bill No</label>
          <input 
            style={styles.input} 
            value={billDetails.billNo} 
            name="billNo"
            onChange={handleInputChange}
            ref={billNoRef}
            onKeyDown={(e) => handleKeyDown(e, dateRef)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Bill Date</label>
          <input 
            style={styles.input} 
            value={billDetails.billDate} 
            name="billDate"
            onChange={handleInputChange}
            ref={dateRef}
            onKeyDown={(e) => handleKeyDown(e, saleManRef)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Sale Man</label>
          <input 
            style={styles.input} 
            value={billDetails.saleMan} 
            name="saleMan"
            onChange={handleInputChange}
            ref={saleManRef}
            onKeyDown={(e) => handleKeyDown(e, mobileRef)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Mobile No</label>
          <input 
            style={styles.input} 
            value={billDetails.mobileNo} 
            name="mobileNo"
            onChange={handleInputChange}
            ref={mobileRef}
            onKeyDown={(e) => handleKeyDown(e, customerRef)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Customer Name</label>
          <input 
            style={styles.input} 
            value={billDetails.customerName} 
            name="customerName"
            onChange={handleInputChange}
            ref={customerRef}
            onKeyDown={(e) => handleKeyDown(e, barcodeRef)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Type</label>
          <select style={styles.select} value={billDetails.type} onChange={(e) => setBillDetails({...billDetails, type: e.target.value})}>
            <option>Retail</option>
            <option>Wholesale</option>
          </select>
        </div>

        <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
          <label style={styles.label}>Barcode / SKU</label>
          <div style={styles.actionButtons}>
            <input 
              style={{...styles.input, flex: 1}} 
              placeholder="Scan or Enter Barcode"
              value={billDetails.barcodeInput}
              name="barcodeInput"
              onChange={handleInputChange}
              ref={barcodeRef}
              onKeyDown={(e) => {
                if(e.key === 'Enter') handleAddItem();
              }}
            />
            <button style={styles.btnBlue} onClick={handleAddItem} ref={addBtnRef}>
              <span>+</span> ADD
            </button>
            <button style={styles.btnBlue} onClick={handleAddRow}>
              <span>➕</span> ADD ROW
            </button>
            <button style={styles.btnBlue}>
              <span>✎</span> EDIT
            </button>
            <button style={styles.btnBlue} onClick={handleDelete}>
              <span>🗑</span> DELETE
            </button>
            <button style={styles.btnBlue}>
              <span>🖨</span> PRINT
            </button>
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>S.NO</th>
              <th style={styles.th}>Barcode</th>
              <th style={{...styles.th, textAlign:'left', paddingLeft:'15px',width:'400px'}}>Item Name</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>MRP</th>
              <th style={styles.th}>UOM</th>
              <th style={styles.th}>HSN</th>
              <th style={styles.th}>Tax %</th>
              <th style={styles.th}>S Rate</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>Amount</th>
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
                    placeholder="Item Name"
                    data-row={index}
                    data-field="name"
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'name')}
                  />
                </td>
                <td style={styles.td}>
                  <input 
                    style={styles.editableInput}
                    type="number"
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
                    type="number"
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
                    type="number"
                    value={item.tax}
                    data-row={index}
                    data-field="tax"
                    onChange={(e) => handleItemChange(item.id, 'tax', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'tax')}
                  />
                </td>
                <td style={styles.td}>
                  <input 
                    style={styles.editableInput}
                    type="number"
                    value={item.rate}
                    data-row={index}
                    data-field="rate"
                    onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'rate')}
                  />
                </td>
                <td style={styles.td}>
                  <input 
                    style={styles.editableInput}
                    type="number"
                    value={item.qty}
                    data-row={index}
                    data-field="qty"
                    onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 1)}
                    onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                  />
                </td>
                <td style={{...styles.td, fontWeight: '700', color: '#1B91DA', fontSize: '15px'}}>{(item.rate * item.qty).toLocaleString()}</td>
                <td style={styles.td}>
                  <button 
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleDeleteRow(item.id)}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Totals Row */}
            <tr style={{...styles.totalsRow}}>
              <td colSpan={3}></td>
              <td style={styles.td}>Total:</td>
              <td style={styles.td}>{items.reduce((sum, item) => sum + item.mrp, 0).toLocaleString()}</td>
              <td colSpan={3}></td>
              <td style={{...styles.td, color: '#1B91DA'}}> Amount:</td>
              <td style={{...styles.td, color: '#1B91DA', fontWeight: '700'}}>{items.reduce((sum, item) => sum + item.qty, 0)}</td>
              <td style={{...styles.td, color: '#1B91DA', fontWeight: '700', fontSize: '16px'}}>₹ {netTotal.toLocaleString()}</td>
              <td></td>
            </tr>
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

    </div>
  );
};

export default SalesInvoices;