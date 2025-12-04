import React, { useState } from 'react';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Search as SearchIcon 
} from '@mui/icons-material';

/**
 * Sales Return Form Component
 */
const Salesreturn = () => {
  // Initial state for form fields - UPDATED: All fields blank except billNo and billDate
  const [formData, setFormData] = useState({
    salesman: '',
    empName: '',
    billNo: 'SE00001AA',
    billDate: new Date().toISOString().substring(0, 10),
    mobileNo: '',
    custName: '',
    returnReason: '',
    barcodeInput: '', 
    qty: '', // Changed from '0' to empty
    items: ''
  });

  // State for items table - UPDATED: Remove default values
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
      rate: '',
      qty: '',
      amount: ''
    },
    {
      id: 2,
      sNo: 2,
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
      amount: ''
    }
  ]);

  // Calculate totals
  const totalQty = items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  // Handle form field changes
  const handleFormChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  // Handle item field changes
  const handleItemChange = (id, field) => (event) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: event.target.value };
        
        // Recalculate amount if qty or sRate changes
        if (field === 'qty' || field === 'sRate') {
          const qty = parseFloat(updatedItem.qty || 0);
          const sRate = parseFloat(updatedItem.sRate || 0);
          updatedItem.amount = (qty * sRate).toFixed(2).toString(); // Format to 2 decimal places
        }
        
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  // Add new item row
  const addItemRow = () => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    const newSNo = items.length + 1;
    
    setItems([
      ...items,
      {
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
        amount: ''
      }
    ]);
  };

  // Delete item row
  const deleteItemRow = (id) => {
    const filteredItems = items.filter(item => item.id !== id);
    // Update serial numbers
    const updatedItems = filteredItems.map((item, index) => ({
      ...item,
      sNo: index + 1
    }));
    setItems(updatedItems);
  };

  // Handle Save action
  const handleSave = () => {
    console.log('Form Data:', formData);
    console.log('Items:', items);
    alert('Sales Return data saved successfully!');
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
    
    setItems([]); // Clear all items
    
    alert('Form cleared!');
  };

  // Base style object for cleaner code in the action buttons
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
    transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
  };

  /**
   * Helper component for uniform input fields with left-aligned labels (for the header)
   * The 'grid' container will handle the straight arrangement.
   */
  const FormInput = ({ label, field, type = "text", placeholder = "", minWidth = '120px', value, onChange, readOnly = false, isSelect = false, options = [] }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: minWidth, flex: '1 1 auto' }}>
      <label style={{ fontWeight: '500', fontSize: '14px', textAlign: 'left', color: '#333' }}>
        {label}
      </label>
      {isSelect ? (
        <select
          style={{
            padding: '8px',
            border: 'none', // UPDATED: Removed border
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: readOnly ? '#f0f0f0' : 'white',
            outline: 'none' // Remove outline on focus
          }}
          value={value}
          onChange={onChange(field)}
          readOnly={readOnly}
          disabled={readOnly}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          style={{
            padding: '8px',
            border: 'none', // UPDATED: Removed border
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: readOnly ? '#f0f0f0' : 'white',
            outline: 'none' // Remove outline on focus
          }}
          value={value}
          onChange={onChange(field)}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      )}
    </div>
  );

  // Common style for input fields within the table for brevity - UPDATED: Removed border
  const tableInputStyle = {
    width: '100%', 
    padding: '4px', 
    border: 'none', // UPDATED: Removed border
    fontSize: '14px', 
    background: 'transparent',
    textAlign: 'center',
    outline: 'none' // Remove outline on focus
  };

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '4px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '12px 8px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Main Content - Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>
          
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #ddd' }} />

          {/* Form Section - UPDATED: Borderless input fields */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px 24px',
            marginBottom: '16px',
            padding: '8px'
          }}>
            
            {/* Row 1 */}
            {/* Salesman: Input Box - UPDATED: Borderless */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
              <span style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>Salesman:</span>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: "1px solid #e0e0e0", // UPDATED: Removed border
                  borderRadius: '4px',
                  fontSize: '14px',
                  minWidth: '120px',
                  outline: 'none' // Remove outline on focus
                }}
                value={formData.salesman}
                onChange={handleFormChange('salesman')}
                placeholder="Enter Salesman"
              />
            </div>

            {/* IINo: Input Box - UPDATED: Borderless */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
              <span style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>BIINo:</span>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: "1px solid #e0e0e0", // UPDATED: Removed border
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#f0f0f0',
                  outline: 'none' // Remove outline on focus
                }}
                value={formData.billNo}
                readOnly
              />
            </div>

            {/* Mobile No: Input Box - UPDATED: Borderless */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
              <span style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>Mobile No:</span>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: "1px solid #e0e0e0", // UPDATED: Removed border
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none' // Remove outline on focus
                }}
                value={formData.mobileNo}
                onChange={handleFormChange('mobileNo')}
                placeholder="Mobile No"
              />
            </div>

            {/* Row 2 */}
            {/* EMP Name: Input Box - UPDATED: Borderless */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
              <span style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>EMP Name:</span>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: "1px solid #e0e0e0", // UPDATED: Removed border
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none' // Remove outline on focus
                }}
                value={formData.empName}
                onChange={handleFormChange('empName')}
                placeholder="EMP Name"
              />
            </div>

            {/* Bill Date: Input Box - UPDATED: Borderless */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
              <span style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>Bill Date:</span>
              <input
                type="date"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: "1px solid #e0e0e0", // UPDATED: Removed border
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none' // Remove outline on focus
                }}
                value={formData.billDate}
                onChange={handleFormChange('billDate')}
              />
            </div>

            {/* Customer Name: Input Box - UPDATED: Borderless */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
              <span style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>Customer Name:</span>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: "1px solid #e0e0e0", // UPDATED: Removed border
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none' // Remove outline on focus
                }}
                value={formData.custName}
                onChange={handleFormChange('custName')}
                placeholder="Customer Name"
              />
            </div>

            {/* BARCODE INPUT: Input Box - UPDATED: Borderless and removed space */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '280px' }}>
              <span style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap', minWidth: '100px' }}>BARCODE:</span>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <input
                  type="text"
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: "1px solid #e0e0e0", // UPDATED: Removed border
                    borderRadius: '4px',
                    fontSize: '14px',
                    minWidth: '0',
                    outline: 'none' // Remove outline on focus
                  }}
                  value={formData.barcodeInput}
                  onChange={handleFormChange('barcodeInput')}
                  placeholder="Scan or Enter Barcode"
                />
              </div>
            </div>
          </div>

          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #ddd' }} />

          {/* Items Table - UPDATED WITH BORDERLESS INPUTS */}
          <div style={{ 
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #ddd',
            marginBottom: '16px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Top Scrollbar Container */}
            <div style={{ 
              position: 'sticky',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #ddd',
              height: '10px'
            }}>
              <div style={{ 
                overflowX: 'auto',
                height: '100%',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                <div style={{ 
                  width: '1200px',
                  height: '100%'
                }}></div>
              </div>
            </div>

            {/* Main Table Container */}
            <div style={{ 
              overflowX: 'auto',
              maxHeight: '400px', // Fixed height for vertical scrolling
              position: 'relative'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '14px', 
                minWidth: '1200px'
              }}>
                <thead style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  backgroundColor: '#1976d2'
                }}>
                  <tr style={{ backgroundColor: '#1976d2' }}>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '50px' }}>SNo</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'left', whiteSpace: 'nowrap', width: '140px' }}>Barcode</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'left', whiteSpace: 'nowrap', width: '200px' }}>Item Name</th>
                    
                    {/* *** Column Order Matching Image Starts Here *** */}
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>Stock</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>MRP</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>UOM</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>HSN</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>TAX</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>SRATE</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>RATE</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>QTY</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap', width: '100px' }}>AMOUNT</th>
                    {/* *** Column Order Matching Image Ends Here *** */}

                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      {/* SNo */}
                      <td style={{ padding: '8px', whiteSpace: 'nowrap', textAlign: 'center' }}>{item.sNo}</td>
                      
                      {/* Barcode - UPDATED: Borderless */}
                      <td style={{ padding: '12px 8px' }}>
                        <input
                          type="text"
                          style={{ 
                            ...tableInputStyle, 
                            fontWeight: '500', 
                            textAlign: 'left',
                            padding: '8px 4px',
                            width: 'calc(100% - 8px)'
                          }}
                          value={item.barcode}
                          onChange={handleItemChange(item.id, 'barcode')}
                          placeholder="Barcode"
                        />
                      </td>
                      
                      {/* Item Name - UPDATED: Borderless */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={{ ...tableInputStyle, textAlign: 'left' }}
                          value={item.itemName}
                          onChange={handleItemChange(item.id, 'itemName')}
                          placeholder="Item Name"
                        />
                      </td>
                      
                      {/* Stock - UPDATED: Borderless */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={tableInputStyle}
                          value={item.stock || ''}
                          onChange={handleItemChange(item.id, 'stock')}
                          placeholder="Stock"
                        />
                      </td>
                      
                      {/* MRP - UPDATED: Borderless */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={tableInputStyle}
                          value={item.mrp || ''}
                          onChange={handleItemChange(item.id, 'mrp')}
                          placeholder="MRP"
                        />
                      </td>
                      
                      {/* UOM - UPDATED: Borderless */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={tableInputStyle}
                          value={item.uom}
                          onChange={handleItemChange(item.id, 'uom')}
                          placeholder="UOM"
                        />
                      </td>
                      
                      {/* HSN - UPDATED: Borderless */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={tableInputStyle}
                          value={item.hsn || ''}
                          onChange={handleItemChange(item.id, 'hsn')}
                          placeholder="HSN"
                        />
                      </td>
                      
                      {/* TAX - UPDATED: Borderless */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          style={tableInputStyle}
                          value={item.tax}
                          onChange={handleItemChange(item.id, 'tax')}
                          placeholder="Tax"
                        />
                      </td>
                      
                      {/* SRATE - UPDATED: Borderless */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          style={tableInputStyle}
                          value={item.sRate}
                          onChange={handleItemChange(item.id, 'sRate')}
                          placeholder="S Rate"
                        />
                      </td>
                      
                      {/* RATE - UPDATED: Borderless */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={tableInputStyle}
                          value={item.rate || ''}
                          onChange={handleItemChange(item.id, 'rate')}
                          placeholder="Rate"
                        />
                      </td>
                      
                      {/* QTY - UPDATED: Borderless */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          style={{ ...tableInputStyle, fontWeight: 'bold' }}
                          value={item.qty}
                          onChange={handleItemChange(item.id, 'qty')}
                          placeholder="Qty"
                        />
                      </td>
                      
                      {/* AMOUNT - UPDATED: Borderless */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={{ ...tableInputStyle, textAlign: 'right', fontWeight: 'bold', color: '#1565c0' }}
                          value={parseFloat(item.amount || 0).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                          placeholder="Amount"
                          readOnly
                        />
                      </td>
                      
                      {/* ACTION */}
                      <td style={{ padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
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

            {/* Bottom Scrollbar Container */}
            <div style={{ 
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              backgroundColor: '#f5f5f5',
              borderTop: '1px solid #ddd',
              height: '10px'
            }}>
              <div style={{ 
                overflowX: 'auto',
                height: '100%',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                <div style={{ 
                  width: '1200px',
                  height: '100%'
                }}></div>
              </div>
            </div>
            
            {/* Add Item Button (outside table structure) */}
            <div style={{ padding: '12px', textAlign: 'left' }}>
              <button
                onClick={addItemRow}
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
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                <AddIcon fontSize="small" /> Add Item
              </button>
            </div>
          </div>

          {/* Totals Section (Aligned Right) */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            paddingRight: '8px'
          }}>
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '4px',
              minWidth: '200px',
              textAlign: 'right'
            }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0, color: '#1976d2' }}>
                Total Qty: <span style={{ color: '#0d47a1' }}>{totalQty}</span>
              </h3>
            </div>
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '4px',
              minWidth: '200px',
              textAlign: 'right'
            }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0, color: '#1976d2' }}>
                Total Amount: ₹<span style={{ color: '#0d47a1' }}>
                  {totalAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </h3>
            </div>
          </div>
        </div>

        {/* Fixed Action Bar at bottom */}
        <div style={{ 
          position: 'sticky',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: 'white',
          padding: '12px',
          borderTop: '1px solid #ddd',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 100,
          marginTop: 'auto'
        }}>
          <div style={{ 
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Left side: ADD, EDIT, DELETE buttons - Kept for general Item management */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={addItemRow} // Map ADD button to addItemRow
                style={{ ...baseButtonStyle, backgroundColor: '#1976d2', color: 'white', minWidth: '90px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                <AddIcon fontSize="small" /> ADD
              </button>
              <button 
                // Placeholder for EDIT functionality
                style={{ ...baseButtonStyle, backgroundColor: 'transparent', color: '#1976d2', border: '1px solid #1976d2', minWidth: '90px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <EditIcon fontSize="small" /> EDIT
              </button>
              <button 
                // Placeholder for DELETE functionality (item-level delete is in the table)
                style={{ ...baseButtonStyle, backgroundColor: 'transparent', color: '#d32f2f', border: '1px solid #d32f2f', minWidth: '90px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffebee'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <DeleteIcon fontSize="small" /> DELETE
              </button>
            </div>

            {/* Right side: Clear and Save Bill buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleClear}
                style={{ ...baseButtonStyle, backgroundColor: 'transparent', color: '#666', border: '1px solid #666', minWidth: '100px' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; e.currentTarget.style.borderColor = '#333'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#666'; }}
              >
                <ClearIcon fontSize="small" /> Clear
              </button>
              <button
                onClick={handleSave}
                style={{ ...baseButtonStyle, backgroundColor: '#4caf50', color: 'white', minWidth: '120px' }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#388e3c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
              >
                <SaveIcon fontSize="small" /> Save Return
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for smooth scrollbars */}
      <style jsx="true">{`
        /* Smooth scrollbar styling for the entire application */
        * {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f5f5f5;
        }
        
        /* For Webkit browsers (Chrome, Safari, Edge) */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f5f5f5;
          border-radius: 4px;
          margin: 2px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
          transition: background 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* For Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f5f5f5;
        }
        
        /* Table specific scrollbar styling */
        .table-container::-webkit-scrollbar {
          height: 8px;
        }
        
        .table-container::-webkit-scrollbar-track {
          background: #f5f5f5;
          border-radius: 4px;
          margin: 2px;
        }
        
        .table-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
          transition: background 0.3s ease;
        }
        
        .table-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Hide scrollbar for top and bottom containers */
        .scroll-container-hidden::-webkit-scrollbar {
          display: none;
        }
        
        .scroll-container-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Smooth scrolling for the entire page */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};


export default Salesreturn;