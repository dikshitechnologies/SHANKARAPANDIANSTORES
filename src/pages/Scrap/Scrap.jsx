import React, { useState } from 'react';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

const Scrap = () => {
  // Initial state for form fields
  const [formData, setFormData] = useState({
    salesman: '',
    empName: '',
    billNo: 'CA00001AA',
    billDate: '10/05/2025',
    mobileNo: '8754603732',
    custName: 'Priyanka',
    scrapProductName: '',
    qty: '0',
    items: ''
  });

  // State for items table
  const [items, setItems] = useState([
    {
      id: 1,
      sNo: 1,
      barcode: 'BAR001',
      itemName: 'Scrap Item 1',
      uom: 'KG',
      tax: '18',
      sRate: '100',
      qty: '10',
      amount: '1000'
    },
    {
      id: 2,
      sNo: 2,
      barcode: 'BAR002',
      itemName: 'Scrap Item 2',
      uom: 'KG',
      tax: '18',
      sRate: '150',
      qty: '5',
      amount: '750'
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
          updatedItem.amount = (qty * sRate).toString();
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
        uom: '',
        tax: '',
        sRate: '',
        qty: '',
        amount: ''
      }
    ]);
  };

  // Delete item row
  const deleteItemRow = (id) => {
    if (items.length > 1) {
      const filteredItems = items.filter(item => item.id !== id);
      // Update serial numbers
      const updatedItems = filteredItems.map((item, index) => ({
        ...item,
        sNo: index + 1
      }));
      setItems(updatedItems);
    }
  };

  // Handle Save action
  const handleSave = () => {
    console.log('Form Data:', formData);
    console.log('Items:', items);
    alert('Scrap data saved successfully!');
  };

  // Handle Clear action
  const handleClear = () => {
    setFormData({
      salesman: '',
      empName: '',
      billNo: 'CA00001AA',
      billDate: '10/05/2025',
      mobileNo: '8754603732',
      custName: 'Priyanka',
      scrapProductName: '',
      qty: '0',
      items: ''
    });
    
    setItems([
      {
        id: 1,
        sNo: 1,
        barcode: 'BAR001',
        itemName: 'Scrap Item 1',
        uom: 'KG',
        tax: '18',
        sRate: '100',
        qty: '10',
        amount: '1000'
      }
    ]);
    
    alert('Form cleared!');
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
        borderRadius: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '12px 8px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Main Content - Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
          {/* Form Section - Top Row */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
            overflow: 'hidden'
          }}>
            {/* Salesman */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '500', minWidth: '80px', fontSize: '14px' }}>
                Salesman :
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
                value={formData.salesman}
                onChange={handleFormChange('salesman')}
                placeholder="Enter Salesman"
              />
            </div>
            
            {/* Bill No */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '500', minWidth: '60px', fontSize: '14px' }}>
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
                  marginLeft: '14px'
                }}
                value={formData.billNo}
                onChange={handleFormChange('billNo')}
                placeholder="Bill No"
              />
            </div>
            
            {/* Mobile No */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '500', minWidth: '80px', fontSize: '14px' }}>
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
                  marginLeft: '29px'
                }}
                value={formData.mobileNo}
                onChange={handleFormChange('mobileNo')}
                placeholder="Mobile No"
              />
            </div>
            
            {/* Scrap Product Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '500', minWidth: '140px', fontSize: '14px' }}>
                Scrap Product Name:
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
                value={formData.scrapProductName}
                onChange={handleFormChange('scrapProductName')}
                placeholder="Scrap Product Name"
              />
            </div>
          </div>

          {/* Form Section - Bottom Row */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            {/* EMP Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '500', minWidth: '80px', fontSize: '14px' }}>
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
                  minWidth: '0'
                }}
                value={formData.empName}
                onChange={handleFormChange('empName')}
                placeholder="EMP Name"
              />
            </div>
            
            {/* Bill Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '500', minWidth: '75px', fontSize: '14px' }}>
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
                value={formData.billDate}
                onChange={handleFormChange('billDate')}
              />
            </div>
            
            {/* Customer Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '500', minWidth: '110px', fontSize: '14px' }}>
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
                value={formData.custName}
                onChange={handleFormChange('custName')}
                placeholder="Customer Name"
              />
            </div>
            
            {/* QTY and Items */}
            <div style={{ 
  display: 'flex',
  alignItems: 'center',
  gap: '55px',
  minWidth: '0'
}}>
  {/* QTY - Reduced size */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 30%' }}>
    <label style={{ fontWeight: '500', minWidth: '35px', fontSize: '14px' }}>
      QTY:
    </label>
    <input
      type="number"
      style={{
        flex: 1,
        padding: '6px 8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '13px',
        minWidth: '0',
        maxWidth: '120px',
        marginLeft: '5px'
      }}
      value={formData.qty}
      onChange={handleFormChange('qty')}
      placeholder="QTY"
    />
  </div>
  
  {/* Items - Reduced size */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 40%',marginLeft: '-29px' }}>
    <label style={{ fontWeight: '500', minWidth: '45px', fontSize: '14px' }}>
      Items:
    </label>
    <input
      type="text"
      style={{
        flex: 1,
        padding: '6px 8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '13px',
        minWidth: '0',
        maxWidth: '120px'
      }}
      value={formData.items || ''}
      onChange={handleFormChange('items')}
      placeholder="Items"
    />
  </div>
</div>
          </div>
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #ddd' }} />

          {/* Items Table */}
          <div style={{ 
            backgroundColor: '#fff',
            borderRadius: '10px',
            border: '1px solid #ddd',
            marginBottom: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '800px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1976d2' }}>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left', whiteSpace: 'nowrap' }}>SNo</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left', whiteSpace: 'nowrap' }}>Barcode</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left', whiteSpace: 'nowrap' }}>Item Name</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left', whiteSpace: 'nowrap' }}>UOM</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left', whiteSpace: 'nowrap' }}>Tax (%)</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left', whiteSpace: 'nowrap' }}>S Rate</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left', whiteSpace: 'nowrap' }}>Qty</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left', whiteSpace: 'nowrap' }}>Amount</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{item.sNo}</td>
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
                          onChange={handleItemChange(item.id, 'barcode')}
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
                          value={item.itemName}
                          onChange={handleItemChange(item.id, 'itemName')}
                          placeholder="Item Name"
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
                          onChange={handleItemChange(item.id, 'uom')}
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
                          onChange={handleItemChange(item.id, 'tax')}
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
                          value={item.sRate}
                          onChange={handleItemChange(item.id, 'sRate')}
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
                          onChange={handleItemChange(item.id, 'qty')}
                          placeholder="Qty"
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
                          value={item.amount}
                          onChange={handleItemChange(item.id, 'amount')}
                          placeholder="Amount"
                        />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => deleteItemRow(item.id)}
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
                Total Qty: <span style={{ color: '#1976d2' }}>{totalQty}</span>
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
        </div>

        {/* Fixed Barcode Actions Section - Now fixed at bottom */}
        <div style={{ 
          position: 'sticky',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: 'white',
          padding: '12px',
          borderTop: '1px solid #ddd',
          borderRadius: '0 0 20px 20px',
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
            {/* Left side: ADD, EDIT, DELETE buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
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
                  minWidth: '90px',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap'
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
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  minWidth: '90px',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap'
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
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  minWidth: '90px',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap'
                }}
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
                style={{
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #666',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  minWidth: '90px',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap'
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
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  minWidth: '90px',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap'
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

export default Scrap;