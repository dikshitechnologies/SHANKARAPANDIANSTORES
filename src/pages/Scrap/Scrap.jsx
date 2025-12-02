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
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {/* Salesman */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Salesman
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              value={formData.salesman}
              onChange={handleFormChange('salesman')}
              placeholder="Salesman"
            />
          </div>
          
          {/* Bill No */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Bill No
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              value={formData.billNo}
              onChange={handleFormChange('billNo')}
              placeholder="Bill No"
            />
          </div>
          
          {/* Mobile No */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Mobile No
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              value={formData.mobileNo}
              onChange={handleFormChange('mobileNo')}
              placeholder="Mobile No"
            />
          </div>
          
          {/* Scrap Product Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Scrap Product Name
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              value={formData.scrapProductName}
              onChange={handleFormChange('scrapProductName')}
              placeholder="Scrap Product Name"
            />
          </div>
        </div>

        {/* Form Section - Bottom Row */}
{/* Form Section - Bottom Row */}
<div style={{ 
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '12px',
  marginBottom: '20px'
}}>
  {/* EMP Name */}
  <div>
    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
      EMP Name
    </label>
    <input
      type="text"
      style={{
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
      }}
      value={formData.empName}
      onChange={handleFormChange('empName')}
      placeholder="EMP Name"
    />
  </div>
  
  {/* Bill Date */}
  <div>
    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
      Bill Date
    </label>
    <input
      type="date"
      style={{
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
      }}
      value={formData.billDate}
      onChange={handleFormChange('billDate')}
    />
  </div>
  
  {/* Customer Name */}
  <div>
    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
      Customer Name
    </label>
    <input
      type="text"
      style={{
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
      }}
      value={formData.custName}
      onChange={handleFormChange('custName')}
      placeholder="Customer Name"
    />
  </div>
  
  {/* QTY and Items - Combined in one grid cell */}
  <div style={{ 
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  }}>
    {/* QTY - Reduced size to half */}
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
        QTY
      </label>
      <input
        type="number"
        style={{
          width: '100%',
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px'
        }}
        value={formData.qty}
        onChange={handleFormChange('qty')}
        placeholder="QTY"
      />
    </div>
    
    {/* Items - New field */}
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
        Items
      </label>
      <input
        type="text"
        style={{
          width: '100%',
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px'
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
        {/* <h3 style={{ marginBottom: '12px', color: '#1976d2', fontWeight: 'bold', fontSize: '16px' }}>
          Items List
        </h3> */}
        
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
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>UOM</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>Tax (%)</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>S Rate</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>Qty</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'left' }}>Amount</th>
                  <th style={{ color: 'white', fontWeight: 'bold', padding: '8px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{item.sNo}</td>
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
                    <td style={{ padding: '8px', textAlign: 'center' }}>
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
          <div style={{ padding: '12px', textAlign: 'center' }}>
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

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginBottom: '20px'
        }}>
          <button
            onClick={handleClear}
            style={{
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #666',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              minWidth: '120px',
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
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              minWidth: '120px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
          >
            <SaveIcon fontSize="small" /> Save Bill
          </button>
        </div>

        {/* Barcode Actions Section */}
        <div style={{ 
          marginTop: '24px', 
          padding: '12px', 
          border: '1px solid #ddd', 
          borderRadius: '4px' 
        }}>
          {/* <h3 style={{ marginBottom: '12px', color: '#1976d2', fontSize: '16px', margin: 0 }}>
            Barcode Actions
          </h3> */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* <div>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                placeholder="Scan Barcode"
              />
            </div> */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scrap;