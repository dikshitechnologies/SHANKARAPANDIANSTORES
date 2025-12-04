import React, { useState, useEffect, useRef } from 'react';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

/**
 * Sales Return Form Component with Responsive Table
 */
const Salesreturn = () => {
  // Initial state for form fields
  const [formData, setFormData] = useState({
    salesman: '',
    empName: '',
    billNo: 'SE00001AA',
    billDate: new Date().toISOString().substring(0, 10),
    mobileNo: '',
    custName: '',
    returnReason: '',
    barcodeInput: '', 
    qty: '',
    items: ''
  });

  // State for items table - Start with 1 empty row
  const [items, setItems] = useState([{
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
    rate: '',
    qty: '',
    amount: '0.00'
  }]);

  // State for visible rows
  const [visibleRows, setVisibleRows] = useState(6);

  // Refs for input fields and table container
  const inputRefs = useRef({});
  const tableContainerRef = useRef(null);

  // Calculate amount
  const calculateAmount = (qty, sRate) => {
    const qtyNum = parseFloat(qty || 0);
    const sRateNum = parseFloat(sRate || 0);
    return (qtyNum * sRateNum).toFixed(2);
  };

  // Calculate totals
  const totalQty = items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  // Calculate visible rows based on window height
  const calculateVisibleRows = () => {
    const windowWidth = window.innerWidth;
    
    // Based on window dimensions, set different visible rows
    if (windowWidth >= 1920) {
      setVisibleRows(13);
    } else if (windowWidth >= 1600) {
      setVisibleRows(11);
    } else if (windowWidth >= 1366) {
      setVisibleRows(9);
    } else if (windowWidth >= 1024) {
      setVisibleRows(7);
    } else if (windowWidth >= 768) {
      setVisibleRows(6);
    } else if (windowWidth >= 480) {
      setVisibleRows(4);
    } else {
      setVisibleRows(3);
    }
  };

  // Handle window resize
  useEffect(() => {
    calculateVisibleRows();
    
    const handleResize = () => {
      calculateVisibleRows();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Focus on first barcode input on initial load
  useEffect(() => {
    if (inputRefs.current['barcode-1']) {
      setTimeout(() => inputRefs.current['barcode-1'].focus(), 100);
    }
  }, []);

  // Handle form field changes
  const handleFormChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  // Handle item field changes
  const handleItemChange = (id, field) => (event) => {
    const value = event.target.value;
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'qty' || field === 'sRate' || field === 'rate') {
          const qty = field === 'qty' ? value : updatedItem.qty;
          const rate = field === 'rate' ? value : (field === 'sRate' ? value : updatedItem.sRate);
          updatedItem.amount = calculateAmount(qty, rate);
          
          if (field === 'rate') {
            updatedItem.sRate = value;
          }
        }
        
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  // Add new empty item row
  const addItemRow = () => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    const newSNo = items.length + 1;
    
    const newItem = {
      id: newId,
      sNo: newSNo,
      barcode: '',
      itemName: '',
      stock: '',
      mrp: '',
      uom: '',
      hsn: '',
      tax: '',
      sRate: '',
      rate: '',
      qty: '',
      amount: '0.00'
    };
    
    setItems([...items, newItem]);
    
    // Focus on the new row's barcode input
    setTimeout(() => {
      if (inputRefs.current[`barcode-${newId}`]) {
        inputRefs.current[`barcode-${newId}`].focus();
      }
    }, 50);
  };

  // Delete item row
  const deleteItemRow = (id) => {
    if (items.length <= 1) {
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
        rate: '',
        qty: '',
        amount: '0.00'
      };
      setItems([clearedItem]);
      
      setTimeout(() => {
        if (inputRefs.current['barcode-1']) {
          inputRefs.current['barcode-1'].focus();
        }
      }, 50);
    } else {
      const filteredItems = items.filter(item => item.id !== id);
      const updatedItems = filteredItems.map((item, index) => ({
        ...item,
        sNo: index + 1
      }));
      setItems(updatedItems);
    }
  };

  // Handle Save action
  const handleSave = () => {
    alert(`Sales Return data saved successfully!\n\nTotal Quantity: ${totalQty}\nTotal Amount: ₹${totalAmount.toFixed(2)}`);
  };

  // Handle Clear action
  const handleClear = () => {
    setFormData({
      salesman: '',
      empName: '',
      billNo: 'SE00001AA',
      billDate: new Date().toISOString().substring(0, 10),
      mobileNo: '',
      custName: '',
      returnReason: '',
      barcodeInput: '',
      qty: '',
      items: ''
    });
    
    // Reset to 1 empty row
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
      rate: '',
      qty: '',
      amount: '0.00'
    };
    
    setItems([clearedItem]);
    
    setTimeout(() => {
      if (inputRefs.current['barcode-1']) {
        inputRefs.current['barcode-1'].focus();
      }
    }, 100);
  };

  // Handle Enter key navigation
  const handleKeyDown = (id, field, event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      const fields = ['barcode', 'itemName', 'stock', 'mrp', 'uom', 'hsn', 'tax', 'sRate', 'rate', 'qty'];
      const currentIndex = fields.indexOf(field);
      
      if (currentIndex < fields.length - 1) {
        const nextField = fields[currentIndex + 1];
        const nextRef = inputRefs.current[`${nextField}-${id}`];
        if (nextRef) {
          nextRef.focus();
          nextRef.select();
        }
      } else {
        const currentRowIndex = items.findIndex(item => item.id === id);
        if (currentRowIndex < items.length - 1) {
          const nextRowId = items[currentRowIndex + 1].id;
          const nextRef = inputRefs.current[`barcode-${nextRowId}`];
          if (nextRef) {
            nextRef.focus();
            nextRef.select();
          }
        } else {
          addItemRow();
        }
      }
    }
  };

  // Style objects
  const baseButtonStyle = {
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease'
  };

  const tableInputStyle = {
    width: '100%', 
    padding: '8px 4px', 
    border: 'none',
    fontSize: '14px', 
    background: 'transparent',
    textAlign: 'center',
    outline: 'none'
  };

  const brightTotalStyle = {
    fontWeight: 'bold',
    fontSize: '22px',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
    letterSpacing: '0.5px'
  };

  // Styles for responsive design
  const styles = {
    container: {
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '0',
      display: 'flex',
      flexDirection: 'column'
    },
    mainContent: {
      marginTop: '60px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1
    },
    formHeader: {
      position: 'fixed',
      top: '0',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      zIndex: 900,
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      padding: '15px 25px',
      borderBottom: '3px solid #ddd',
    },
    formGrid: {
      display: 'grid',
      marginTop: '70px',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px 35px',
      '@media (max-width: 1200px)': {
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px 12px'
      },
      '@media (max-width: 992px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px'
      },
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: '6px'
      }
    },
    tableWrapper: {
      backgroundColor: '#ffffff',
      position: 'fixed',
      top: '110px',
      left: 0,
      right: 0,
      bottom: '70px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      margin: '10px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    tableContainer: {
      flex: 1,
      marginTop: '70px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    tableHeader: {
      position: 'sticky',
      zIndex: 30,
      backgroundColor: '#1976d2'
    },
    tableBody: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'auto'
    },
    actionBar: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      padding: '12px 20px',
      borderTop: '2px solid #dee2e6',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      height: '70px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Fixed Form Header */}
        <div style={styles.formHeader}>
          <div style={styles.formGrid}>
            {/* Bill No Field */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '500', fontSize: '18px', whiteSpace: 'nowrap', minWidth: '55px', color: '#333' }}>Bill No:</span>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  border: "1px solid #ddd",
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: '#f8f9fa',
                  outline: 'none',
                  color: '#666'
                }}
                value={formData.billNo}
                readOnly
              />
            </div>

            {/* Bill Date Field */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '500', fontSize: '18px', whiteSpace: 'nowrap', minWidth: '65px', color: '#333' }}>Bill Date:</span>
              <input
                type="date"
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  border: "1px solid #ddd",
                  borderRadius: '4px',
                  fontSize: '13px',
                  outline: 'none'
                }}
                value={formData.billDate}
                onChange={handleFormChange('billDate')}
              />
            </div>

            {/* Mobile No Field */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '500', fontSize: '18px', whiteSpace: 'nowrap', minWidth: '75px', color: '#333' }}>Mobile No:</span>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  border: "1px solid #ddd",
                  borderRadius: '4px',
                  fontSize: '13px',
                  outline: 'none'
                }}
                value={formData.mobileNo}
                onChange={handleFormChange('mobileNo')}
                placeholder="Mobile No"
              />
            </div>

            {/* EMP Name Field */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '500', fontSize: '18px', whiteSpace: 'nowrap', minWidth: '75px', color: '#333' }}>EMP Name:</span>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  border: "1px solid #ddd",
                  borderRadius: '4px',
                  fontSize: '13px',
                  outline: 'none'
                }}
                value={formData.empName}
                onChange={handleFormChange('empName')}
                placeholder="EMP Name"
              />
            </div>

            {/* Salesman Field */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '500', fontSize: '18px', whiteSpace: 'nowrap', minWidth: '75px', color: '#333' }}>Salesman:</span>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  border: "1px solid #ddd",
                  borderRadius: '4px',
                  fontSize: '13px',
                  outline: 'none'
                }}
                value={formData.salesman}
                onChange={handleFormChange('salesman')}
                placeholder="Salesman"
              />
            </div>

            {/* Customer Name Field */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '500', fontSize: '18px', whiteSpace: 'nowrap', minWidth: '100px', color: '#333' }}>Customer Name:</span>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  border: "1px solid #ddd",
                  borderRadius: '4px',
                  fontSize: '13px',
                  outline: 'none'
                }}
                value={formData.custName}
                onChange={handleFormChange('custName')}
                placeholder="Customer Name"
              />
            </div>

            {/* Barcode Field */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: 'span 2' }}>
              <span style={{ fontWeight: '500', fontSize: '18px', whiteSpace: 'nowrap', minWidth: '65px', color: '#333' }}>Barcode:</span>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  border: "1px solid #ddd",
                  borderRadius: '4px',
                  fontSize: '13px',
                  outline: 'none'
                }}
                value={formData.barcodeInput}
                onChange={handleFormChange('barcodeInput')}
                placeholder="Enter Barcode"
              />
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div ref={tableContainerRef} style={styles.tableWrapper}>
          <div style={styles.tableContainer}>
            {/* Table Header */}
            <div style={styles.tableHeader}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '50px' }}>SNo</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'left', whiteSpace: 'nowrap', width: '140px' }}>Barcode</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'left', whiteSpace: 'nowrap', width: '200px' }}>Item Name</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>Stock</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>MRP</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>UOM</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>HSN</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>TAX</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>SRATE</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>RATE</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>QTY</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'right', whiteSpace: 'nowrap', width: '100px' }}>AMOUNT</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>ACTION</th>
                  </tr>
                </thead>
              </table>
            </div>
            
            {/* Table Body - Responsive height */}
            <div style={{ ...styles.tableBody, height: `${visibleRows * 50}px` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', tableLayout: 'fixed' }}>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff', borderBottom: '1px solid #eee' }}>
                      {/* SNo */}
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap', textAlign: 'center', width: '50px' }}>{item.sNo}</td>
                      
                      {/* Barcode */}
                      <td style={{ padding: '12px 8px', width: '140px' }}>
                        <input
                          ref={el => inputRefs.current[`barcode-${item.id}`] = el}
                          type="text"
                          style={{ ...tableInputStyle, fontWeight: '500', textAlign: 'left' }}
                          value={item.barcode}
                          onChange={handleItemChange(item.id, 'barcode')}
                          onKeyDown={(e) => handleKeyDown(item.id, 'barcode', e)}
                          placeholder="Barcode"
                        />
                      </td>
                      
                      {/* Item Name */}
                      <td style={{ padding: '12px 8px', width: '200px' }}>
                        <input
                          ref={el => inputRefs.current[`itemName-${item.id}`] = el}
                          type="text"
                          style={{ ...tableInputStyle, textAlign: 'left' }}
                          value={item.itemName}
                          onChange={handleItemChange(item.id, 'itemName')}
                          onKeyDown={(e) => handleKeyDown(item.id, 'itemName', e)}
                          placeholder="Item Name"
                        />
                      </td>
                      
                      {/* Stock */}
                      <td style={{ padding: '12px 8px', width: '80px' }}>
                        <input
                          ref={el => inputRefs.current[`stock-${item.id}`] = el}
                          type="text"
                          style={tableInputStyle}
                          value={item.stock || ''}
                          onChange={handleItemChange(item.id, 'stock')}
                          onKeyDown={(e) => handleKeyDown(item.id, 'stock', e)}
                          placeholder="Stock"
                        />
                      </td>
                      
                      {/* MRP */}
                      <td style={{ padding: '12px 8px', width: '80px' }}>
                        <input
                          ref={el => inputRefs.current[`mrp-${item.id}`] = el}
                          type="text"
                          style={tableInputStyle}
                          value={item.mrp || ''}
                          onChange={handleItemChange(item.id, 'mrp')}
                          onKeyDown={(e) => handleKeyDown(item.id, 'mrp', e)}
                          placeholder="MRP"
                        />
                      </td>
                      
                      {/* UOM */}
                      <td style={{ padding: '12px 8px', width: '60px' }}>
                        <input
                          ref={el => inputRefs.current[`uom-${item.id}`] = el}
                          type="text"
                          style={tableInputStyle}
                          value={item.uom}
                          onChange={handleItemChange(item.id, 'uom')}
                          onKeyDown={(e) => handleKeyDown(item.id, 'uom', e)}
                          placeholder="UOM"
                        />
                      </td>
                      
                      {/* HSN */}
                      <td style={{ padding: '12px 8px', width: '80px' }}>
                        <input
                          ref={el => inputRefs.current[`hsn-${item.id}`] = el}
                          type="text"
                          style={tableInputStyle}
                          value={item.hsn || ''}
                          onChange={handleItemChange(item.id, 'hsn')}
                          onKeyDown={(e) => handleKeyDown(item.id, 'hsn', e)}
                          placeholder="HSN"
                        />
                      </td>
                      
                      {/* TAX */}
                      <td style={{ padding: '12px 8px', width: '60px' }}>
                        <input
                          ref={el => inputRefs.current[`tax-${item.id}`] = el}
                          type="number"
                          style={tableInputStyle}
                          value={item.tax}
                          onChange={handleItemChange(item.id, 'tax')}
                          onKeyDown={(e) => handleKeyDown(item.id, 'tax', e)}
                          placeholder="Tax"
                          step="0.01"
                        />
                      </td>
                      
                      {/* SRATE */}
                      <td style={{ padding: '12px 8px', width: '80px' }}>
                        <input
                          ref={el => inputRefs.current[`sRate-${item.id}`] = el}
                          type="number"
                          style={tableInputStyle}
                          value={item.sRate}
                          onChange={handleItemChange(item.id, 'sRate')}
                          onKeyDown={(e) => handleKeyDown(item.id, 'sRate', e)}
                          placeholder="S Rate"
                          step="0.01"
                        />
                      </td>
                      
                      {/* RATE */}
                      <td style={{ padding: '12px 8px', width: '80px' }}>
                        <input
                          ref={el => inputRefs.current[`rate-${item.id}`] = el}
                          type="number"
                          style={tableInputStyle}
                          value={item.rate || ''}
                          onChange={handleItemChange(item.id, 'rate')}
                          onKeyDown={(e) => handleKeyDown(item.id, 'rate', e)}
                          placeholder="Rate"
                          step="0.01"
                        />
                      </td>
                      
                      {/* QTY */}
                      <td style={{ padding: '12px 8px', width: '60px' }}>
                        <input
                          ref={el => inputRefs.current[`qty-${item.id}`] = el}
                          type="number"
                          style={{ ...tableInputStyle, fontWeight: 'bold' }}
                          value={item.qty}
                          onChange={handleItemChange(item.id, 'qty')}
                          onKeyDown={(e) => handleKeyDown(item.id, 'qty', e)}
                          placeholder="Qty"
                          step="0.01"
                        />
                      </td>
                      
                      {/* AMOUNT */}
                      <td style={{ padding: '12px 8px', width: '100px' }}>
                        <input
                          type="text"
                          style={{ ...tableInputStyle, textAlign: 'right', fontWeight: 'bold', color: '#1565c0', backgroundColor: '#f0f7ff' }}
                          value={parseFloat(item.amount || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                          placeholder="Amount"
                          readOnly
                        />
                      </td>
                      
                      {/* ACTION */}
                      <td style={{ padding: '12px 8px', textAlign: 'center', width: '60px' }}>
                        <button
                          onClick={() => deleteItemRow(item.id)}
                          style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', padding: '4px' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#b71c1c'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#d32f2f'}
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Add Item Button */}
            <div style={{ padding: '15px', textAlign: 'left', borderTop: '1px solid #eee' }}>
              <button
                onClick={addItemRow}
                style={{ 
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                <AddIcon fontSize="small" /> Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Fixed Action Bar at Bottom */}
        <div style={styles.actionBar}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            {/* Left side buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={addItemRow}
                style={{ ...baseButtonStyle, backgroundColor: '#1976d2', color: 'white', minWidth: '100px' }}
              >
                <AddIcon fontSize="small" /> ADD
              </button>
              <button style={{ ...baseButtonStyle, backgroundColor: 'white', color: '#1976d2', border: '1px solid #1976d2', minWidth: '100px' }}>
                <EditIcon fontSize="small" /> EDIT
              </button>
              <button style={{ ...baseButtonStyle, backgroundColor: 'white', color: '#d32f2f', border: '1px solid #d32f2f', minWidth: '100px' }}>
                <DeleteIcon fontSize="small" /> DELETE
              </button>
            </div>

            {/* Center - Totals */}
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f0f7ff', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#1976d2', marginBottom: '2px', fontWeight: '600' }}>Total Quantity</div>
                <div style={{ ...brightTotalStyle, color: '#1976d2' }}>{totalQty.toFixed(2)}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f0fff4', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#28a745', marginBottom: '2px', fontWeight: '600' }}>Total Amount</div>
                <div style={{ ...brightTotalStyle, color: '#28a745' }}>
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Right side buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleClear} style={{ ...baseButtonStyle, backgroundColor: '#f8f9fa', color: '#6c757d', border: '1px solid #6c757d', minWidth: '100px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', marginRight: '5px', fontSize: '18px', fontWeight: 'bold' }}>×</span>
                Clear
              </button>
              <button onClick={handleSave} style={{ ...baseButtonStyle, backgroundColor: '#28a745', color: 'white', minWidth: '120px', fontWeight: 'bold' }}>
                <SaveIcon fontSize="small" /> Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salesreturn;