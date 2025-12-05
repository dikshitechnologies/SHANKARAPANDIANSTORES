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
        flexDirection: 'column',
        '@media (max-width: 768px)': {
          padding: '8px 4px',
          borderRadius: '4px'
        }
      }}>
        {/* Main Content - Scrollable */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          paddingBottom: '16px',
          '@media (max-width: 768px)': {
            paddingBottom: '80px'
          }
        }}>
          
          <hr style={{ 
            margin: '12px 0', 
            border: 'none', 
            borderTop: '1px solid #ddd',
            '@media (max-width: 768px)': {
              margin: '8px 0'
            }
          }} />

          {/* Form Section - RESPONSIVE */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px 24px',
            marginBottom: '16px',
            padding: '8px',
            '@media (max-width: 1200px)': {
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px 16px'
            },
            '@media (max-width: 992px)': {
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            },
            '@media (max-width: 768px)': {
              gridTemplateColumns: '1fr',
              gap: '12px',
              marginBottom: '12px',
              padding: '4px'
            }
          }}>
            
            {/* Salesman Field */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              minWidth: '200px',
              '@media (max-width: 768px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                minWidth: 'auto',
                width: '100%'
              }
            }}>
              <label style={{ 
                fontWeight: '500', 
                minWidth: '80px', 
                fontSize: '14px',
                '@media (max-width: 768px)': {
                  fontSize: '13px',
                  width: '100%'
                }
              }}>
                Salesman:
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
                  outline: 'none',
                  '@media (max-width: 768px)': {
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    minWidth: 'auto'
                  }
                }}
                value={formData.salesman}
                onChange={handleFormChange('salesman')}
                placeholder="Enter Salesman"
              />
            </div>

            {/* Bill No Field */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              minWidth: '150px',
              '@media (max-width: 768px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                minWidth: 'auto',
                width: '100%'
              }
            }}>
              <label style={{ 
                fontWeight: '500', 
                minWidth: '80px', 
                fontSize: '14px',
                '@media (max-width: 768px)': {
                  fontSize: '13px',
                  width: '100%'
                }
              }}>
                BIINo:
              </label>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#f5f5f5',
                  outline: 'none',
                  '@media (max-width: 768px)': {
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    minWidth: 'auto'
                  }
                }}
                value={formData.billNo}
                readOnly
              />
            </div>

            {/* Mobile No Field */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              minWidth: '180px',
              '@media (max-width: 768px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                minWidth: 'auto',
                width: '100%'
              }
            }}>
              <label style={{ 
                fontWeight: '500', 
                minWidth: '80px', 
                fontSize: '14px',
                '@media (max-width: 768px)': {
                  fontSize: '13px',
                  width: '100%'
                }
              }}>
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
                  outline: 'none',
                  '@media (max-width: 768px)': {
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    minWidth: 'auto'
                  }
                }}
                value={formData.mobileNo}
                onChange={handleFormChange('mobileNo')}
                placeholder="Mobile No"
              />
            </div>

            {/* EMP Name Field */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              minWidth: '200px',
              '@media (max-width: 768px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                minWidth: 'auto',
                width: '100%'
              }
            }}>
              <label style={{ 
                fontWeight: '500', 
                minWidth: '80px', 
                fontSize: '14px',
                '@media (max-width: 768px)': {
                  fontSize: '13px',
                  width: '100%'
                }
              }}>
                EMP Name:
              </label>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                  '@media (max-width: 768px)': {
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    minWidth: 'auto'
                  }
                }}
                value={formData.empName}
                onChange={handleFormChange('empName')}
                placeholder="EMP Name"
              />
            </div>

            {/* Bill Date Field */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              minWidth: '180px',
              '@media (max-width: 768px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                minWidth: 'auto',
                width: '100%'
              }
            }}>
              <label style={{ 
                fontWeight: '500', 
                minWidth: '80px', 
                fontSize: '14px',
                '@media (max-width: 768px)': {
                  fontSize: '13px',
                  width: '100%'
                }
              }}>
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
                  outline: 'none',
                  '@media (max-width: 768px)': {
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    minWidth: 'auto'
                  }
                }}
                value={formData.billDate}
                onChange={handleFormChange('billDate')}
              />
            </div>

            {/* Customer Name Field */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              minWidth: '220px',
              '@media (max-width: 768px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                minWidth: 'auto',
                width: '100%'
              }
            }}>
              <label style={{ 
                fontWeight: '500', 
                minWidth: '100px', 
                fontSize: '14px',
                '@media (max-width: 768px)': {
                  fontSize: '13px',
                  width: '100%',
                  minWidth: 'auto'
                }
              }}>
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
                  outline: 'none',
                  '@media (max-width: 768px)': {
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    minWidth: 'auto'
                  }
                }}
                value={formData.custName}
                onChange={handleFormChange('custName')}
                placeholder="Customer Name"
              />
            </div>

            {/* BARCODE INPUT Field */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              minWidth: '280px',
              '@media (max-width: 768px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                minWidth: 'auto',
                width: '100%'
              }
            }}>
              <label style={{ 
                fontWeight: '500', 
                minWidth: '100px', 
                fontSize: '14px',
                '@media (max-width: 768px)': {
                  fontSize: '13px',
                  width: '100%',
                  minWidth: 'auto'
                }
              }}>
                BARCODE:
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                flex: 1,
                width: '100%'
              }}>
                <input
                  type="text"
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minWidth: '0',
                    outline: 'none',
                    '@media (max-width: 768px)': {
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px'
                    }
                  }}
                  value={formData.barcodeInput}
                  onChange={handleFormChange('barcodeInput')}
                  placeholder="Scan or Enter Barcode"
                />
              </div>
            </div>
          </div>

          <hr style={{ 
            margin: '12px 0', 
            border: 'none', 
            borderTop: '1px solid #ddd',
            '@media (max-width: 768px)': {
              margin: '8px 0'
            }
          }} />

          {/* Items Table - RESPONSIVE */}
          <div style={{ 
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #ddd',
            marginBottom: '16px',
            overflow: 'hidden',
            position: 'relative',
            '@media (max-width: 768px)': {
              borderRadius: '4px',
              marginBottom: '12px'
            }
          }}>
            {/* Top Scrollbar Container - Hidden on Mobile */}
            <div style={{ 
              position: 'sticky',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #ddd',
              height: '10px',
              '@media (max-width: 768px)': {
                display: 'none'
              }
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
              position: 'relative',
              '@media (max-width: 768px)': {
                maxHeight: '300px',
                overflowX: 'auto',
                overflowY: 'auto'
              }
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '14px', 
                minWidth: '1200px',
                '@media (max-width: 768px)': {
                  minWidth: '1000px',
                  fontSize: '12px'
                },
                '@media (max-width: 480px)': {
                  minWidth: '900px',
                  fontSize: '11px'
                }
              }}>
                <thead style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  backgroundColor: '#1976d2',
                  '@media (max-width: 768px)': {
                    position: 'relative'
                  }
                }}>
                  <tr style={{ backgroundColor: '#1976d2' }}>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '50px' }}>SNo</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'left', whiteSpace: 'nowrap', width: '140px' }}>Barcode</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'left', whiteSpace: 'nowrap', width: '200px' }}>Item Name</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>Stock</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>MRP</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>UOM</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>HSN</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>TAX</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>SRATE</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>RATE</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>QTY</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap', width: '100px' }}>AMOUNT</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      {/* SNo */}
                      <td style={{ padding: '8px', whiteSpace: 'nowrap', textAlign: 'center' }}>{item.sNo}</td>
                      
                      {/* Barcode */}
                      <td style={{ padding: '12px 8px' }}>
                        <input
                          type="text"
                          style={{ 
                            ...tableInputStyle, 
                            fontWeight: '500', 
                            textAlign: 'left',
                            padding: '8px 4px',
                            width: 'calc(100% - 8px)',
                            '@media (max-width: 768px)': {
                              padding: '6px 4px',
                              fontSize: '13px'
                            }
                          }}
                          value={item.barcode}
                          onChange={handleItemChange(item.id, 'barcode')}
                          placeholder="Barcode"
                        />
                      </td>
                      
                      {/* Item Name */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={{ 
                            ...tableInputStyle, 
                            textAlign: 'left',
                            '@media (max-width: 768px)': {
                              padding: '6px 4px',
                              fontSize: '13px'
                            }
                          }}
                          value={item.itemName}
                          onChange={handleItemChange(item.id, 'itemName')}
                          placeholder="Item Name"
                        />
                      </td>
                      
                      {/* Stock */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={{
                            ...tableInputStyle,
                            '@media (max-width: 768px)': {
                              padding: '6px 4px',
                              fontSize: '13px'
                            }
                          }}
                          value={item.stock || ''}
                          onChange={handleItemChange(item.id, 'stock')}
                          placeholder="Stock"
                        />
                      </td>
                      
                      {/* MRP */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={{
                            ...tableInputStyle,
                            '@media (max-width: 768px)': {
                              padding: '6px 4px',
                              fontSize: '13px'
                            }
                          }}
                          value={item.mrp || ''}
                          onChange={handleItemChange(item.id, 'mrp')}
                          placeholder="MRP"
                        />
                      </td>
                      
                      {/* UOM */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={{
                            ...tableInputStyle,
                            '@media (max-width: 768px)': {
                              padding: '6px 4px',
                              fontSize: '13px'
                            }
                          }}
                          value={item.uom}
                          onChange={handleItemChange(item.id, 'uom')}
                          placeholder="UOM"
                        />
                      </td>
                      
                      {/* HSN */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={{
                            ...tableInputStyle,
                            '@media (max-width: 768px)': {
                              padding: '6px 4px',
                              fontSize: '13px'
                            }
                          }}
                          value={item.hsn || ''}
                          onChange={handleItemChange(item.id, 'hsn')}
                          placeholder="HSN"
                        />
                      </td>
                      
                      {/* TAX */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          style={{
                            ...tableInputStyle,
                            '@media (max-width: 768px)': {
                              padding: '6px 4px',
                              fontSize: '13px'
                            }
                          }}
                          value={item.tax}
                          onChange={handleItemChange(item.id, 'tax')}
                          placeholder="Tax"
                        />
                      </td>
                      
                      {/* SRATE */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          style={{
                            ...tableInputStyle,
                            '@media (max-width: 768px)': {
                              padding: '6px 4px',
                              fontSize: '13px'
                            }
                          }}
                          value={item.sRate}
                          onChange={handleItemChange(item.id, 'sRate')}
                          placeholder="S Rate"
                        />
                      </td>
                      
                      {/* RATE */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={{
                            ...tableInputStyle,
                            '@media (max-width: 768px)': {
                              padding: '6px 4px',
                              fontSize: '13px'
                            }
                          }}
                          value={item.rate || ''}
                          onChange={handleItemChange(item.id, 'rate')}
                          placeholder="Rate"
                        />
                      </td>
                      
                      {/* QTY */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          style={{ 
                            ...tableInputStyle, 
                            fontWeight: 'bold',
                            '@media (max-width: 768px)': {
                              padding: '6px 4px',
                              fontSize: '13px'
                            }
                          }}
                          value={item.qty}
                          onChange={handleItemChange(item.id, 'qty')}
                          placeholder="Qty"
                        />
                      </td>
                      
                      {/* AMOUNT */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          style={{ 
                            ...tableInputStyle, 
                            textAlign: 'right', 
                            fontWeight: 'bold', 
                            color: '#1565c0',
                            '@media (max-width: 768px)': {
                              padding: '6px 4px',
                              fontSize: '13px'
                            }
                          }}
                          value={parseFloat(item.amount || 0).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                          placeholder="Amount"
                          readOnly
                        />
                      </td>
                      
                      {/* ACTION */}
                      <td style={{ 
                        padding: '8px', 
                        textAlign: 'center', 
                        whiteSpace: 'nowrap',
                        '@media (max-width: 768px)': {
                          padding: '6px'
                        }
                      }}>
                        <button
                          onClick={() => deleteItemRow(item.id)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#d32f2f', 
                            cursor: 'pointer', 
                            padding: '4px',
                            '@media (max-width: 768px)': {
                              padding: '6px'
                            }
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

            {/* Bottom Scrollbar Container - Hidden on Mobile */}
            <div style={{ 
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              backgroundColor: '#f5f5f5',
              borderTop: '1px solid #ddd',
              height: '10px',
              '@media (max-width: 768px)': {
                display: 'none'
              }
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
            
            {/* Add Item Button */}
            <div style={{ 
              padding: '12px', 
              textAlign: 'left',
              '@media (max-width: 768px)': {
                padding: '8px',
                textAlign: 'center'
              }
            }}>
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
                  fontSize: '14px',
                  '@media (max-width: 768px)': {
                    padding: '12px 20px',
                    fontSize: '15px',
                    width: '100%',
                    justifyContent: 'center'
                  }
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                <AddIcon fontSize="small" /> Add Item
              </button>
            </div>
          </div>

          {/* Totals Section - RESPONSIVE */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            paddingRight: '8px',
            '@media (max-width: 992px)': {
              justifyContent: 'center'
            },
            '@media (max-width: 768px)': {
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              padding: '0 4px'
            }
          }}>
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '4px',
              minWidth: '200px',
              textAlign: 'right',
              '@media (max-width: 768px)': {
                minWidth: 'auto',
                width: '100%',
                textAlign: 'center',
                padding: '10px 12px'
              }
            }}>
              <h3 style={{ 
                fontWeight: 'bold', 
                fontSize: '16px', 
                margin: 0, 
                color: '#1976d2',
                '@media (max-width: 768px)': {
                  fontSize: '15px'
                }
              }}>
                Total Qty: <span style={{ color: '#0d47a1' }}>{totalQty}</span>
              </h3>
            </div>
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '4px',
              minWidth: '200px',
              textAlign: 'right',
              '@media (max-width: 768px)': {
                minWidth: 'auto',
                width: '100%',
                textAlign: 'center',
                padding: '10px 12px'
              }
            }}>
              <h3 style={{ 
                fontWeight: 'bold', 
                fontSize: '16px', 
                margin: 0, 
                color: '#1976d2',
                '@media (max-width: 768px)': {
                  fontSize: '15px'
                }
              }}>
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

        {/* Fixed Action Bar - RESPONSIVE */}
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
          marginTop: 'auto',
          '@media (max-width: 768px)': {
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '10px',
            borderRadius: '0',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.15)'
          }
        }}>
          <div style={{ 
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            '@media (max-width: 992px)': {
              flexDirection: 'column',
              gap: '8px'
            },
            '@media (max-width: 768px)': {
              flexDirection: 'row',
              justifyContent: 'space-around'
            },
            '@media (max-width: 480px)': {
              flexDirection: 'column',
              gap: '6px'
            }
          }}>
            {/* Left side buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              flexWrap: 'wrap',
              '@media (max-width: 992px)': {
                order: 2,
                width: '100%',
                justifyContent: 'center'
              },
              '@media (max-width: 768px)': {
                order: 1,
                width: 'auto',
                justifyContent: 'flex-start'
              },
              '@media (max-width: 480px)': {
                width: '100%',
                justifyContent: 'space-between'
              }
            }}>
              <button 
                onClick={addItemRow}
                style={{ 
                  ...baseButtonStyle, 
                  backgroundColor: '#1976d2', 
                  color: 'white', 
                  minWidth: '90px',
                  '@media (max-width: 768px)': {
                    minWidth: '70px',
                    padding: '8px 12px',
                    fontSize: '12px'
                  },
                  '@media (max-width: 480px)': {
                    minWidth: '30%',
                    padding: '10px 8px'
                  }
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                <AddIcon fontSize="small" /> ADD
              </button>
              <button 
                style={{ 
                  ...baseButtonStyle, 
                  backgroundColor: 'transparent', 
                  color: '#1976d2', 
                  border: '1px solid #1976d2', 
                  minWidth: '90px',
                  '@media (max-width: 768px)': {
                    minWidth: '70px',
                    padding: '8px 12px',
                    fontSize: '12px'
                  },
                  '@media (max-width: 480px)': {
                    minWidth: '30%',
                    padding: '10px 8px'
                  }
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <EditIcon fontSize="small" /> EDIT
              </button>
              <button 
                style={{ 
                  ...baseButtonStyle, 
                  backgroundColor: 'transparent', 
                  color: '#d32f2f', 
                  border: '1px solid #d32f2f', 
                  minWidth: '90px',
                  '@media (max-width: 768px)': {
                    minWidth: '70px',
                    padding: '8px 12px',
                    fontSize: '12px'
                  },
                  '@media (max-width: 480px)': {
                    minWidth: '30%',
                    padding: '10px 8px'
                  }
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffebee'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <DeleteIcon fontSize="small" /> DELETE
              </button>
            </div>

            {/* Right side buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              flexWrap: 'wrap',
              '@media (max-width: 992px)': {
                order: 1,
                width: '100%',
                justifyContent: 'center',
                marginBottom: '8px'
              },
              '@media (max-width: 768px)': {
                order: 2,
                width: 'auto',
                marginBottom: '0'
              },
              '@media (max-width: 480px)': {
                width: '100%',
                justifyContent: 'space-between',
                gap: '8px'
              }
            }}>
              <button
                onClick={handleClear}
                style={{ 
                  ...baseButtonStyle, 
                  backgroundColor: 'transparent', 
                  color: '#666', 
                  border: '1px solid #666', 
                  minWidth: '100px',
                  '@media (max-width: 768px)': {
                    minWidth: '80px',
                    padding: '8px 12px',
                    fontSize: '12px'
                  },
                  '@media (max-width: 480px)': {
                    minWidth: '48%',
                    padding: '10px 8px'
                  }
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; e.currentTarget.style.borderColor = '#333'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#666'; }}
              >
                <ClearIcon fontSize="small" /> Clear
              </button>
              <button
                onClick={handleSave}
                style={{ 
                  ...baseButtonStyle, 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  minWidth: '120px',
                  '@media (max-width: 768px)': {
                    minWidth: '100px',
                    padding: '8px 12px',
                    fontSize: '12px'
                  },
                  '@media (max-width: 480px)': {
                    minWidth: '48%',
                    padding: '10px 8px'
                  }
                }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#388e3c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
              >
                <SaveIcon fontSize="small" /> Save Return
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style jsx="true">{`
        /* Responsive breakpoints */
        /* Large devices (laptops/desktops, 1200px and up) */
        @media (min-width: 1200px) {
          .container {
            max-width: 1140px;
          }
        }
        
        /* Medium devices (tablets, 992px to 1199px) */
        @media (min-width: 992px) and (max-width: 1199px) {
          .container {
            max-width: 960px;
          }
        }
        
        /* Small devices (landscape tablets, 768px to 991px) */
        @media (min-width: 768px) and (max-width: 991px) {
          .container {
            max-width: 720px;
          }
          
          /* Adjust table font size for tablets */
          table {
            font-size: 13px !important;
          }
          
          /* Adjust form inputs for tablets */
          input, select {
            padding: 10px !important;
            font-size: 14px !important;
          }
        }
        
        /* Extra small devices (phones, 600px to 767px) */
        @media (min-width: 600px) and (max-width: 767px) {
          .container {
            max-width: 540px;
          }
          
          /* Adjust table for mobile landscape */
          table {
            min-width: 1100px !important;
          }
          
          /* Make buttons easier to tap */
          button {
            min-height: 44px;
            padding: 12px 16px !important;
          }
        }
        
        /* Mobile devices (phones, less than 600px) */
        @media (max-width: 599px) {
          /* Prevent zoom on input focus for mobile */
          input, select, textarea {
            font-size: 16px !important;
          }
          
          /* Adjust table for mobile portrait */
          table {
            min-width: 900px !important;
          }
          
          /* Improve touch targets */
          button {
            min-height: 44px;
            min-width: 44px;
            padding: 12px !important;
          }
          
          /* Adjust spacing for mobile */
          .mobile-spacing {
            margin: 4px 0 !important;
            padding: 4px !important;
          }
        }
        
        /* Very small devices (phones, less than 400px) */
        @media (max-width: 399px) {
          /* Further adjustments for very small screens */
          table {
            min-width: 800px !important;
            font-size: 10px !important;
          }
          
          /* Stack buttons vertically */
          .button-group {
            flex-direction: column !important;
            width: 100% !important;
          }
          
          button {
            width: 100% !important;
            margin: 4px 0 !important;
          }
        }
        
        /* Smooth scrollbar styling */
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
        
        /* Mobile optimization for iOS */
        @supports (-webkit-touch-callout: none) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
        
        /* Prevent text size adjustment on orientation change */
        html {
          -webkit-text-size-adjust: 100%;
        }
      `}</style>
    </div>
  );
};

export default Salesreturn;