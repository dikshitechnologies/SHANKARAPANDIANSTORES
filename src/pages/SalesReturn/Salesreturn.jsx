import React, { useState, useEffect, useRef } from 'react';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import PopupListSelector from '../../components/Listpopup/PopupListSelector'; // Import your popup component

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

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // State for popup
  const [showPopup, setShowPopup] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);

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

  // Open popup for item selection
  const openItemPopup = (id) => {
    setCurrentItemId(id);
    setShowPopup(true);
  };

  // Handle item selection from popup
  const handleItemSelect = (selectedItem) => {
    if (currentItemId) {
      const updatedItems = items.map(item => {
        if (item.id === currentItemId) {
          return {
            ...item,
            barcode: selectedItem.barcode || '',
            itemName: selectedItem.name || selectedItem.itemName || '',
            mrp: selectedItem.mrp || '',
            uom: selectedItem.uom || '',
            hsn: selectedItem.hsn || '',
            sRate: selectedItem.rate || selectedItem.sRate || '',
            rate: selectedItem.rate || '',
            stock: selectedItem.stock || ''
          };
        }
        return item;
      });
      setItems(updatedItems);
    }
  };

  // Handle delete confirmation
  const confirmDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  // Handle actual delete after confirmation
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteItemRow(itemToDelete);
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Handle cancel delete
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
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

  // Handle Save All action
  const handleSaveAll = () => {
    // Here you would typically save all items to backend
    const itemsToSave = items.filter(item => item.barcode || item.itemName);
    alert(`Saving ${itemsToSave.length} items...\n\nTotal Quantity: ${totalQty}\nTotal Amount: ₹${totalAmount.toFixed(2)}`);
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

  // Handle Enter key navigation for form fields
  const handleFormKeyDown = (field, event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      const formFields = ['billNo', 'billDate', 'mobileNo', 'empName', 'salesman', 'custName', 'barcodeInput'];
      const currentIndex = formFields.indexOf(field);
      
      if (currentIndex < formFields.length - 1) {
        // Focus on next form field
        const nextField = formFields[currentIndex + 1];
        const nextInput = document.querySelector(`input[name="${nextField}"]`);
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      } else {
        // Move to table's first input (barcode)
        if (inputRefs.current['barcode-1']) {
          inputRefs.current['barcode-1'].focus();
          inputRefs.current['barcode-1'].select();
        }
      }
    }
  };

  // Handle Enter key navigation for table items
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

  // Mock function to fetch items for popup
  const fetchItemsForPopup = async (page, search) => {
    // This is a mock function - replace with your actual API call
    const mockItems = [
      { id: 1, barcode: '123456', name: 'Product A', mrp: 100, uom: 'PCS', hsn: '1234', rate: 85, stock: 50 },
      { id: 2, barcode: '234567', name: 'Product B', mrp: 200, uom: 'PCS', hsn: '5678', rate: 170, stock: 30 },
      { id: 3, barcode: '345678', name: 'Product C', mrp: 150, uom: 'PCS', hsn: '9012', rate: 125, stock: 20 },
      { id: 4, barcode: '456789', name: 'Product D', mrp: 300, uom: 'PCS', hsn: '3456', rate: 250, stock: 15 },
      { id: 5, barcode: '567890', name: 'Product E', mrp: 250, uom: 'PCS', hsn: '7890', rate: 200, stock: 40 },
    ];
    
    // Filter by search text if provided
    if (search) {
      return mockItems.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.barcode.includes(search)
      );
    }
    
    return mockItems;
  };

  // Style objects
  const baseButtonStyle = {
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: '500',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transform: 'translateY(0)',
    position: 'relative',
    overflow: 'hidden'
  };

  // Updated tableInputStyle to prevent shaking on hover
  const tableInputStyle = {
    width: '100%', 
    padding: '8px 4px', 
    border: '1px solid transparent',
    fontSize: '14px', 
    background: 'transparent',
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box'
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
      marginTop: '70px',
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
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '15px 20px',
      alignItems: 'center',
      '@media (max-width: 1200px)': {
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px 15px'
      },
      '@media (max-width: 992px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px'
      },
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: '8px'
      }
    },
    formField: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    formLabel: {
      fontWeight: '500',
      fontSize: '16px',
      whiteSpace: 'nowrap',
      minWidth: '85px',
      color: '#333',
      textAlign: 'right'
    },
    formInput: {
      flex: 1,
      padding: '8px 10px',
      border: "1px solid #ddd",
      borderRadius: '4px',
      fontSize: '14px',
      outline: 'none',
      minHeight: '40px',
      boxSizing: 'border-box'
    },
     formbutton: {
     padding: '8px 10px',
      border: "1px solid #ddd",
      borderRadius: '4px',
      fontSize: '14px',
      outline: 'none',
      minHeight: '40px',
      boxSizing: 'border-box',
      width:'305px'
    },
    formInputReadOnly: {
      flex: 1,
      padding: '8px 10px',
      border: "1px solid #ddd",
      borderRadius: '4px',
      fontSize: '14px',
      outline: 'none',
      minHeight: '36px',
      boxSizing: 'border-box',
      backgroundColor: '#f8f9fa',
      color: '#666'
    },
    tableWrapper: {
      backgroundColor: '#ffffff',
     marginTop: '22px',
      position: 'fixed',
      top: '110px',
      left: 0,
      right: 0,
      bottom: '70px',
      borderRadius: '12px 12px 0 0', // Rounded top corners only
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      borderTop: '1px solid #1976d2',
      borderLeft: '1px solid #ddd',
      borderRight: '1px solid #ddd'
    },
    tableContainer: {
      flex: 1,
      marginTop: '70px',
      marginLeft: '11px',
      marginRight: '11px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    tableHeader: {
      position: 'sticky',
      zIndex: 30,
      backgroundColor: '#1976d2',
      borderRadius: '12px 12px 0 0' // Rounded top for table header
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
    },
    // Delete confirmation modal styles
    deleteModalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    },
    deleteModal: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      minWidth: '350px',
      textAlign: 'center'
    },
    deleteModalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#d32f2f'
    },
    deleteModalMessage: {
      fontSize: '16px',
      marginBottom: '25px',
      color: '#555'
    },
    deleteModalButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px'
    },
    deleteModalButton: {
      padding: '10px 25px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      minWidth: '80px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transform: 'translateY(0)'
    },
    cancelButton: {
      backgroundColor: '#f5f5f5',
      color: '#333',
      border: '1px solid #ddd'
    },
    confirmButton: {
      backgroundColor: '#d32f2f',
      color: 'white'
    }
  };

  return (
    <div style={styles.container}>
      {/* Popup List Selector */}
      <PopupListSelector
        open={showPopup}
        onClose={() => setShowPopup(false)}
        onSelect={handleItemSelect}
        fetchItems={fetchItemsForPopup}
        title="Select Item"
        displayFieldKeys={['barcode', 'name', 'mrp', 'uom', 'hsn', 'rate', 'stock']}
        searchFields={['name', 'barcode']}
        headerNames={['Barcode', 'Item Name', 'MRP', 'UOM', 'HSN', 'Rate', 'Stock']}
        searchPlaceholder="Search by item name or barcode..."
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.deleteModalOverlay}>
          <div style={styles.deleteModal}>
            <div style={styles.deleteModalTitle}>Confirm Delete</div>
            <div style={styles.deleteModalMessage}>
              Are you sure you want to delete this item?
            </div>
            <div style={styles.deleteModalButtons}>
              <button 
                onClick={handleDeleteCancel}
                style={{ ...styles.deleteModalButton, ...styles.cancelButton }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8e8e8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                style={{ ...styles.deleteModalButton, ...styles.confirmButton }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b71c1c';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(183, 28, 28, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#d32f2f';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Fixed Form Header */}
        <div style={styles.formHeader}>
          <div style={styles.formGrid}>
            {/* Bill No Field */}
            
            <div style={styles.formField}>
              <label style={styles.formLabel}>Bill No :</label>
              <input
                name="billNo"
                type="text"
                style={
                  styles.formInput
                  
                }
                value={formData.billNo}
                onChange={handleFormChange('billNo')}
                onKeyDown={(e) => handleFormKeyDown('billNo', e)}
                placeholder="Bill No"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              />
            </div>

             {/* Salesman Field */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>Salesman:</label>
              <input
                name="salesman"
                type="text"
                style={styles.formInput}
                value={formData.salesman}
                onChange={handleFormChange('salesman')}
                onKeyDown={(e) => handleFormKeyDown('salesman', e)}
                placeholder="Salesman"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              />
            </div>

            {/* Mobile No Field */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>Mobile No:</label>
              <input
                name="mobileNo"
                type="text"
                style={styles.formInput}
                value={formData.mobileNo}
                onChange={handleFormChange('mobileNo')}
                onKeyDown={(e) => handleFormKeyDown('mobileNo', e)}
                placeholder="Mobile No"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              />
            </div>

            {/* Customer Name Field */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>Customer Name:</label>
              <input
                name="custName"
                type="text"
                style={styles.formInput}
                value={formData.custName}
                onChange={handleFormChange('custName')}
                onKeyDown={(e) => handleFormKeyDown('custName', e)}
                placeholder="Customer Name"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              />
            </div>

        

             {/* Bill Date Field */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>Bill Date:</label>
              <input
                name="billDate"
                type="date"
                style={styles.formInput}
                value={formData.billDate}
                onChange={handleFormChange('billDate')}
                onKeyDown={(e) => handleFormKeyDown('billDate', e)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              />
            </div>
            
            


               {/* EMP Name Field */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>EMP Name:</label>
              <input
                name="empName"
                type="text"
                style={styles.formInput}
                value={formData.empName}
                onChange={handleFormChange('empName')}
                onKeyDown={(e) => handleFormKeyDown('empName', e)}
                placeholder="EMP Name"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              />
            </div>
            

            
            {/* Barcode Field */}
            <div style={{ ...styles.formField, gridColumn: 'span 2' }}>
              <label style={styles.formLabel}>Barcode:</label>
              <input
                name="barcodeInput"
                type="text"
                style={styles.formbutton}
                value={formData.barcodeInput}
                onChange={handleFormChange('barcodeInput')}
                onKeyDown={(e) => handleFormKeyDown('barcodeInput', e)}
                placeholder="Enter Barcode"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
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
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '50px', borderTopLeftRadius: '12px' }}>SNo</th>
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '100px' }}>Barcode</th>
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
                    <th style={{ color: 'white', fontWeight: 'bold', padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '100px', borderTopRightRadius: '12px' }}>ACTION</th>
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
                      <td style={{ padding: '12px 8px', width: '100px' }}>
                        <input
                          ref={el => inputRefs.current[`barcode-${item.id}`] = el}
                          type="text"
                          style={{ ...tableInputStyle, fontWeight: '500', textAlign: 'center', cursor: 'pointer' }}
                          value={item.barcode}
                          onChange={handleItemChange(item.id, 'barcode')}
                          onKeyDown={(e) => handleKeyDown(item.id, 'barcode', e)}
                          onClick={() => openItemPopup(item.id)}
                          placeholder="Click to select"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#1976d2';
                            e.currentTarget.style.backgroundColor = '#f0f7ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
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
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
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
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
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
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
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
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
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
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
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
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
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
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
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
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
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
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
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
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        />
                      </td>
                      
                      {/* ACTION - Updated with better styling */}
                      <td style={{ padding: '12px 8px', textAlign: 'center', width: '100px' }}>
                        <button
                          onClick={() => confirmDelete(item.id)}
                          style={{ 
                            background: '#ffebee', 
                            border: '1px solid #ffcdd2', 
                            color: '#d32f2f', 
                            cursor: 'pointer', 
                            padding: '6px 12px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffcdd2';
                            e.currentTarget.style.borderColor = '#d32f2f';
                            e.currentTarget.style.color = '#b71c1c';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffebee';
                            e.currentTarget.style.borderColor = '#ffcdd2';
                            e.currentTarget.style.color = '#d32f2f';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                          Trash
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Add Item Button with Updated Hover Color */}
            <div style={{ padding: '15px', textAlign: 'left', borderTop: '1px solid #eee' }}>
              <button
                onClick={addItemRow}
                style={{ 
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0d47a1'; // Updated to darker blue
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(13, 71, 161, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1976d2';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
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
                style={{ 
                  ...baseButtonStyle, 
                  backgroundColor: '#1976d2', 
                  color: 'white', 
                  minWidth: '100px',
                  ':after': {
                    content: '""',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0))',
                    borderRadius: '6px'
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0d47a1'; // Updated to darker blue
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(13, 71, 161, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1976d2';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(13, 71, 161, 0.3)';
                }}
              >
                <AddIcon fontSize="small" /> ADD
              </button>
              <button 
                style={{ 
                  ...baseButtonStyle, 
                  backgroundColor: 'white', 
                  color: '#1976d2', 
                  border: '2px solid #1976d2', 
                  minWidth: '100px' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1976d2';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(25, 118, 210, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#1976d2';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(25, 118, 210, 0.2)';
                }}
              >
                <EditIcon fontSize="small" /> EDIT
              </button>
              <button 
                style={{ 
                  ...baseButtonStyle, 
                  backgroundColor: 'white', 
                  color: '#d32f2f', 
                  border: '2px solid #d32f2f', 
                  minWidth: '100px' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d32f2f';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(211, 47, 47, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#d32f2f';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(211, 47, 47, 0.2)';
                }}
              >
                <DeleteIcon fontSize="small" /> DELETE
              </button>
            </div>

            {/* Center - Totals WITHOUT HOVER EFFECTS */}
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  padding: '12px 24px', 
                  backgroundColor: '#f0f7ff', 
                  borderRadius: '8px',
                  border: '2px solid #e3f2fd',
                  minWidth: '140px'
                }}
              >
                <div style={{ 
                  fontSize: '13px', 
                  color: '#1976d2', 
                  marginBottom: '4px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Total Quantity
                </div>
                <div style={{ 
                  ...brightTotalStyle, 
                  color: '#1976d2'
                }}>
                  {totalQty.toFixed(2)}
                </div>
              </div>
              
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  padding: '12px 24px', 
                  backgroundColor: '#f0fff4', 
                  borderRadius: '8px',
                  border: '2px solid #e8f5e9',
                  minWidth: '140px'
                }}
              >
                <div style={{ 
                  fontSize: '13px', 
                  color: '#28a745', 
                  marginBottom: '4px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Total Amount
                </div>
                <div style={{ 
                  ...brightTotalStyle, 
                  color: '#28a745'
                }}>
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Right side buttons - Added Save All button */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleClear}
                style={{ 
                  ...baseButtonStyle, 
                  backgroundColor: '#f8f9fa', 
                  color: '#6c757d', 
                  border: '2px solid #6c757d', 
                  minWidth: '100px' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(108, 117, 125, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.color = '#6c757d';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(108, 117, 125, 0.2)';
                }}
              >
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '20px', 
                  height: '20px', 
                  marginRight: '5px', 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}>×</span>
                Clear
              </button>
              
              {/* Save All Button */}
              <button 
                onClick={handleSaveAll}
                style={{ 
                  ...baseButtonStyle, 
                  backgroundColor: '#ff9800', 
                  color: 'white', 
                  minWidth: '120px', 
                  fontWeight: 'bold',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f57c00';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 152, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff9800';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 152, 0, 0.3)';
                }}
              >
                <SaveIcon fontSize="small" /> Save All
              </button>
              
              <button 
                onClick={handleSave}
                style={{ 
                  ...baseButtonStyle, 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  minWidth: '120px', 
                  fontWeight: 'bold',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e7e34';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(40, 167, 69, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28a745';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(40, 167, 69, 0.3)';
                }}
              >
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