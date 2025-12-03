import React, { useState, useEffect, useRef } from 'react';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

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
    { id: 1, barcode: 'BAR001', name: 'Product 1', sub: '', stock: 0, mrp: 100, uom: 'KG', hsn: '', tax: 18, rate: 100, qty: 1 }
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
      name: 'Product Item',
      sub: '',
      stock: 0,
      mrp: 0,
      uom: 'KG',
      hsn: '',
      tax: 18,
      rate: 0,
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
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate amount if qty or rate changes
        if (field === 'qty' || field === 'rate') {
          const qty = parseFloat(updatedItem.qty || 0);
          const rate = parseFloat(updatedItem.rate || 0);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleDeleteRow = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleClear = () => {
    setItems([
      { id: 1, barcode: '', name: '', sub: '', stock: 0, mrp: 0, uom: '', hsn: '', tax: 0, rate: 0, qty: 1 }
    ]);
    setBillDetails({
      billNo: '',
      billDate: '',
      saleMan: '',
      mobileNo: '',
      customerName: '',
      type: 'Retail',
      barcodeInput: ''
    });
    alert('Form cleared!');
  };

  const handleSave = () => {
    console.log('Bill Details:', billDetails);
    console.log('Items:', items);
    alert('Sales invoice saved successfully!');
  };

  // Calculate totals
  const totalQty = items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.rate || 0) * parseFloat(item.qty || 0)), 0);

  // --- STYLES (Inline CSS) ---
  const styles = {};

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '4px',
    }}>
      <div style={{ 
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '12px 8px'
      }}>
        {/* Form Section - Top Row */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '16px',
          overflow: 'hidden'
        }}>
          {/* Bill No */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: '500', minWidth: '70px' }}>
              Bill No:
            </label>
            <input
              type="text"
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '0',
              }}
              value={billDetails.billNo}
              onChange={handleInputChange}
              name="billNo"
              ref={billNoRef}
              onKeyDown={(e) => handleKeyDown(e, dateRef)}
              placeholder="Bill No"
            />
          </div>
          
          {/* Bill Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: '500', minWidth: '80px' }}>
              Bill Date:
            </label>
            <input
              type="date"
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '0'
              }}
              value={billDetails.billDate}
              onChange={handleInputChange}
              name="billDate"
              ref={dateRef}
              onKeyDown={(e) => handleKeyDown(e, saleManRef)}
            />
          </div>
          
          {/* Mobile No */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: '500', minWidth: '85px' }}>
              Mobile No:
            </label>
            <input
              type="text"
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '0',
              }}
              value={billDetails.mobileNo}
              onChange={handleInputChange}
              name="mobileNo"
              ref={mobileRef}
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              placeholder="Mobile No"
            />
          </div>
          
          {/* Type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: '500', minWidth: '60px' }}>
              Type:
            </label>
            <select
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '0'
              }}
              value={billDetails.type}
              onChange={(e) => setBillDetails({...billDetails, type: e.target.value})}
            >
              <option>Retail</option>
              <option>Wholesale</option>
            </select>
          </div>
        </div>

        {/* Form Section - Bottom Row */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          {/* Sale Man */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: '500', minWidth: '85px' }}>
              Sale Man:
            </label>
            <input
              type="text"
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '0'
              }}
              value={billDetails.saleMan}
              onChange={handleInputChange}
              name="saleMan"
              ref={saleManRef}
              onKeyDown={(e) => handleKeyDown(e, mobileRef)}
              placeholder="Sale Man"
            />
          </div>
          
          {/* Customer Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: '500', minWidth: '115px' }}>
              Customer Name:
            </label>
            <input
              type="text"
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '0'
              }}
              value={billDetails.customerName}
              onChange={handleInputChange}
              name="customerName"
              ref={customerRef}
              onKeyDown={(e) => handleKeyDown(e, barcodeRef)}
              placeholder="Customer Name"
            />
          </div>

          {/* Barcode/SKU - Spans 2 columns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: 'span 2' }}>
            <label style={{ fontWeight: '500', minWidth: '80px' }}>
              Barcode:
            </label>
            <input
              type="text"
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '0'
              }}
              value={billDetails.barcodeInput}
              onChange={handleInputChange}
              name="barcodeInput"
              ref={barcodeRef}
              onKeyDown={(e) => {
                if(e.key === 'Enter') handleAddItem();
              }}
              placeholder="Enter Barcode"
            />
          </div>
        </div>

        <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #ddd' }} />

        {/* Items Table */}
        <div style={{ 
          backgroundColor: '#fff',
          borderRadius: '4px',
          border: '1px solid #ddd',
          marginBottom: '16px',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1976d2' }}>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>SNo</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>Barcode</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>Item Name</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>Stock</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>MRP</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>UOM</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>Tax (%)</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>S Rate</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>Qty</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>Amount</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{index + 1}</td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: 'none',
                          borderBottom: '1px solid #ddd',
                          fontSize: '14px',
                          background: 'transparent'
                        }}
                        value={item.barcode}
                        onChange={(e) => handleItemChange(item.id, 'barcode', e.target.value)}
                        placeholder="Barcode"
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: 'none',
                          borderBottom: '1px solid #ddd',
                          fontSize: '14px',
                          background: 'transparent'
                        }}
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        placeholder="Item Name"
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: 'none',
                          borderBottom: '1px solid #ddd',
                          fontSize: '14px',
                          background: 'transparent'
                        }}
                        value={item.stock}
                        onChange={(e) => handleItemChange(item.id, 'stock', e.target.value)}
                        placeholder="Stock"
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: 'none',
                          borderBottom: '1px solid #ddd',
                          fontSize: '14px',
                          background: 'transparent'
                        }}
                        value={item.mrp}
                        onChange={(e) => handleItemChange(item.id, 'mrp', e.target.value)}
                        placeholder="MRP"
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: 'none',
                          borderBottom: '1px solid #ddd',
                          fontSize: '14px',
                          background: 'transparent'
                        }}
                        value={item.uom}
                        onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)}
                        placeholder="UOM"
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: 'none',
                          borderBottom: '1px solid #ddd',
                          fontSize: '14px',
                          background: 'transparent'
                        }}
                        value={item.tax}
                        onChange={(e) => handleItemChange(item.id, 'tax', e.target.value)}
                        placeholder="Tax"
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: 'none',
                          borderBottom: '1px solid #ddd',
                          fontSize: '14px',
                          background: 'transparent'
                        }}
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                        placeholder="S Rate"
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: 'none',
                          borderBottom: '1px solid #ddd',
                          fontSize: '14px',
                          background: 'transparent'
                        }}
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                        placeholder="Qty"
                      />
                    </td>
                    <td style={{ padding: '8px', fontWeight: 'bold', color: '#1976d2' }}>
                      {(item.rate * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteRow(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d32f2f',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
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
          <div style={{ padding: '12px', textAlign: 'center' }}>
            <button
              onClick={handleAddRow}
              style={{ 
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                marginLeft: '-87%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
            >
              <AddIcon fontSize="small" /> Add Item
            </button>
          </div>
        </div>

        {/* Totals Section */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f0f0f0',
            borderRadius: '4px'
          }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>
              Total Qty: <span style={{ color: '#1976d2' }}>{totalQty.toLocaleString()}</span>
            </h3>
          </div>
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f0f0f0',
            borderRadius: '4px'
          }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>
              Total Amount: ₹<span style={{ color: '#1976d2' }}>
                {totalAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </h3>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div style={{ 
          marginTop: '12%', 
          padding: '12px', 
          border: '1px solid #ddd', 
          borderRadius: '4px' 
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Left side: ADD, EDIT, DELETE buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleAddItem}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  minWidth: '80px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                <AddIcon fontSize="small" /> ADD
              </button>
              <button 
                style={{
                  backgroundColor: 'transparent',
                  color: '#1976d2',
                  border: '1px solid #1976d2',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  minWidth: '80px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <EditIcon fontSize="small" /> EDIT
              </button>
              <button 
                style={{
                  backgroundColor: 'transparent',
                  color: '#d32f2f',
                  border: '1px solid #d32f2f',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  minWidth: '80px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffebee'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <DeleteIcon fontSize="small" /> DELETE
              </button>
            </div>

            {/* Right side: Clear and Save Bill buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleClear}
                style={{
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #666',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  minWidth: '80px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#666';
                }}
              >
                <ClearIcon fontSize="small" /> Clear
              </button>
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  minWidth: '80px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                <SaveIcon fontSize="small" /> Save Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesInvoices;