import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

// Add this CSS for scrollbar styling at the top of your component file
// Or better, move this to a separate CSS file
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #1976d2;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #1565c0;
  }
`;

// Common Button Icons
const CreateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zM13.75 3.19l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995zm-2.487 1a.5.5 0 0 1 .528.47l.8 10a1 1 0 0 0 .997.93h6.23a1 1 0 0 0 .997-.93l.8-10a.5.5 0 0 1 .528-.47H3.513z"/>
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5"/>
  </svg>
);

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 0a2 2 0 0 0-2 2v2H2v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4L8 0zM7 2a1 1 0 0 1 1-1h4.5L14 4H8V2z"/>
    <path d="M5 8.5a.5.5 0 0 1 .5-.5H10a.5.5 0 0 1 0 1H5.5a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
    <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
  </svg>
);

// Common Button Components
const AddButton = ({ onClick, disabled, isActive, buttonType = 'add', style, onStateChange }) => (
  <button 
    style={{ 
      ...buttonStyles.btn, 
      ...(isActive ? buttonStyles.activeBtn : buttonStyles.inactiveBtn),
      ...(buttonType === 'add' && isActive ? buttonStyles.addBtn : {}),
      ...(buttonType === 'edit' && isActive ? buttonStyles.editBtn : {}),
      ...(buttonType === 'delete' && isActive ? buttonStyles.deleteBtn : {}),
      ...(disabled ? buttonStyles.disabled : {}),
      ...style 
    }} 
    onClick={(e) => {
      if (onStateChange) onStateChange(buttonType);
      if (onClick) onClick(e);
    }} 
    disabled={disabled}
  >
    <CreateIcon /> Add
  </button>
);

const EditButton = ({ onClick, disabled, isActive, buttonType = 'edit', style, onStateChange }) => (
  <button 
    style={{ 
      ...buttonStyles.btn, 
      ...(isActive ? buttonStyles.activeBtn : buttonStyles.inactiveBtn),
      ...(buttonType === 'add' && isActive ? buttonStyles.addBtn : {}),
      ...(buttonType === 'edit' && isActive ? buttonStyles.editBtn : {}),
      ...(buttonType === 'delete' && isActive ? buttonStyles.deleteBtn : {}),
      ...(disabled ? buttonStyles.disabled : {}),
      ...style
    }} 
    onClick={(e) => {
      if (onStateChange) onStateChange(buttonType);
      if (onClick) onClick(e);
    }}
    disabled={disabled}
  >
    <EditIcon /> Edit
  </button>
);

const DeleteButton = ({ onClick, disabled, isActive, buttonType = 'delete', style, onStateChange }) => (
  <button 
    style={{ 
      ...buttonStyles.btn, 
      ...(isActive ? buttonStyles.activeBtn : buttonStyles.inactiveBtn),
      ...(buttonType === 'add' && isActive ? buttonStyles.addBtn : {}),
      ...(buttonType === 'edit' && isActive ? buttonStyles.editBtn : {}),
      ...(buttonType === 'delete' && isActive ? buttonStyles.deleteBtn : {}),
      ...(disabled ? buttonStyles.disabled : {}),
      ...style
    }} 
    onClick={(e) => {
      if (onStateChange) onStateChange(buttonType);
      if (onClick) onClick(e);
    }}
    disabled={disabled}
  >
    <DeleteIcon /> Delete
  </button>
);

const ClearButton = ({ onClick, disabled, isActive, buttonType = 'clear', style, onStateChange }) => (
  <button 
    style={{ 
      ...buttonStyles.btn, 
      ...(isActive ? buttonStyles.activeBtn : buttonStyles.inactiveBtn),
      ...(buttonType === 'clear' && isActive ? buttonStyles.clearBtn : {}),
      ...(buttonType === 'save' && isActive ? buttonStyles.saveBtn : {}),
      ...(buttonType === 'print' && isActive ? buttonStyles.printBtn : {}),
      ...(disabled ? buttonStyles.disabled : {}),
      ...style
    }} 
    onClick={(e) => {
      if (onStateChange) onStateChange(buttonType);
      if (onClick) onClick(e);
    }}
    disabled={disabled}
  >
    <ClearIcon /> Clear
  </button>
);

const SaveButton = ({ onClick, disabled, isActive, buttonType = 'save', style, onStateChange }) => (
  <button 
    style={{ 
      ...buttonStyles.btn, 
      ...(isActive ? buttonStyles.activeBtn : buttonStyles.inactiveBtn),
      ...(buttonType === 'clear' && isActive ? buttonStyles.clearBtn : {}),
      ...(buttonType === 'save' && isActive ? buttonStyles.saveBtn : {}),
      ...(buttonType === 'print' && isActive ? buttonStyles.printBtn : {}),
      ...(disabled ? buttonStyles.disabled : {}),
      ...style
    }} 
    onClick={(e) => {
      if (onStateChange) onStateChange(buttonType);
      if (onClick) onClick(e);
    }}
    disabled={disabled}
  >
    <SaveIcon /> Save
  </button>
);

const PrintButton = ({ onClick, disabled, isActive, buttonType = 'print', style, onStateChange }) => (
  <button 
    style={{ 
      ...buttonStyles.btn, 
      ...(isActive ? buttonStyles.activeBtn : buttonStyles.inactiveBtn),
      ...(buttonType === 'clear' && isActive ? buttonStyles.clearBtn : {}),
      ...(buttonType === 'save' && isActive ? buttonStyles.saveBtn : {}),
      ...(buttonType === 'print' && isActive ? buttonStyles.printBtn : {}),
      ...(disabled ? buttonStyles.disabled : {}),
      ...style
    }} 
    onClick={(e) => {
      if (onStateChange) onStateChange(buttonType);
      if (onClick) onClick(e);
    }}
    disabled={disabled}
  >
    <PrintIcon /> Print
  </button>
);

const buttonStyles = {
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '0.6rem 1.2rem',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    margin: '2px'
  },
  inactiveBtn: {
    background: '#e9ecef',
    color: '#6c757d',
    border: '1px solid #dee2e6'
  },
  activeBtn: {
    color: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    transform: 'translateY(-2px)'
  },
  addBtn: {
    background: '#02a85a',
  },
  editBtn: {
    background: '#fbc02d',
  },
  deleteBtn: {
    background: '#e53935',
  },
  clearBtn: {
    background: '#e53935',
  },
  saveBtn: {
    background: '#1976d2',
  },
  printBtn: {
    background: '#6f42c1',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none'
  }
};

/**
 * Sales Return Form Component with Fixed Layout
 */
const Salesreturn = () => {
  // Add scrollbar styles to document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = scrollbarStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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

  // State for button groups
  const [topButtonActive, setTopButtonActive] = useState('add'); // 'add', 'edit', 'delete'
  const [bottomButtonActive, setBottomButtonActive] = useState('save'); // 'clear', 'save', 'print'

  // State for responsive design
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // State for heights (for dynamic calculations)
  const [formHeaderHeight, setFormHeaderHeight] = useState(0);
  const [tableHeaderHeight, setTableHeaderHeight] = useState(0);
  const [actionBarHeight, setActionBarHeight] = useState(0);
  const [addItemButtonHeight, setAddItemButtonHeight] = useState(0);

  // Refs for input fields and table container
  const inputRefs = useRef({});
  const formHeaderRef = useRef(null);
  const tableHeaderRef = useRef(null);
  const actionBarRef = useRef(null);
  const addItemButtonRef = useRef(null);
  const tableBodyRef = useRef(null);
  const tableHeaderInnerRef = useRef(null);

  // Calculate amount
  const calculateAmount = (qty, sRate) => {
    const qtyNum = parseFloat(qty || 0);
    const sRateNum = parseFloat(sRate || 0);
    return (qtyNum * sRateNum).toFixed(2);
  };

  // Calculate totals
  const totalQty = items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  // Handle top button state change
  const handleTopButtonStateChange = (buttonType) => {
    setTopButtonActive(buttonType);
  };

  // Handle bottom button state change
  const handleBottomButtonStateChange = (buttonType) => {
    setBottomButtonActive(buttonType);
  };

  // Handle responsive window resize
  const handleResize = () => {
    const width = window.innerWidth;
    setWindowWidth(width);
    setIsMobile(width < 768);
    setIsTablet(width >= 768 && width < 1024);
    
    // Calculate heights after resize
    calculateHeights();
  };

  // Calculate all heights
  const calculateHeights = () => {
    if (formHeaderRef.current) {
      setFormHeaderHeight(formHeaderRef.current.offsetHeight);
    }
    if (tableHeaderRef.current) {
      setTableHeaderHeight(tableHeaderRef.current.offsetHeight);
    }
    if (actionBarRef.current) {
      setActionBarHeight(actionBarRef.current.offsetHeight);
    }
    if (addItemButtonRef.current) {
      setAddItemButtonHeight(addItemButtonRef.current.offsetHeight);
    }
  };

  // Handle window resize and calculate heights
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Calculate initial heights
    setTimeout(() => {
      calculateHeights();
    }, 100);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update heights when mobile state changes
  useEffect(() => {
    setTimeout(() => {
      calculateHeights();
    }, 100);
  }, [isMobile, isTablet]);

  // Focus on first barcode input on initial load
  useEffect(() => {
    if (inputRefs.current['barcode-1']) {
      setTimeout(() => inputRefs.current['barcode-1'].focus(), 100);
    }
  }, []);

  // Handle horizontal scroll synchronization
  const handleTableBodyScroll = (e) => {
    if (tableHeaderInnerRef.current) {
      tableHeaderInnerRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

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

  // Handle Print action
  const handlePrint = () => {
    window.print();
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
      
      const formFields = ['billNo', 'billDate', 'mobileNo', 'empName', 'salesman', 'custName', 'barcode'];
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

  // Calculate table body height for scrolling
  const getTableBodyHeight = () => {
    const viewportHeight = window.innerHeight;
    const mainHeaderHeight = 60; // Fixed main header
    
    // Calculate available height for table body
    if (isMobile) {
      return `calc(${viewportHeight}px - ${mainHeaderHeight}px - ${formHeaderHeight}px - ${tableHeaderHeight}px - ${addItemButtonHeight}px - ${actionBarHeight}px - 30px)`;
    } else if (isTablet) {
      return `calc(${viewportHeight}px - ${mainHeaderHeight}px - ${formHeaderHeight}px - ${tableHeaderHeight}px - ${addItemButtonHeight}px - ${actionBarHeight}px - 25px)`;
    }
    return `calc(${viewportHeight}px - ${mainHeaderHeight}px - ${formHeaderHeight}px - ${tableHeaderHeight}px - ${addItemButtonHeight}px - ${actionBarHeight}px - 20px)`;
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

  // Updated tableInputStyle
  const tableInputStyle = {
    width: '100%', 
    padding: '8px 4px', 
    border: 'none',
    fontSize: '14px', 
    background: 'transparent',
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box'
  };

  // Table cell border style
  const tableCellBorderStyle = {
    border: '1px solid #e0e0e0'
  };

  const brightTotalStyle = {
    fontWeight: 'bold',
    fontSize: '22px',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
    letterSpacing: '0.5px',
    transition: 'all 0.3s ease'
  };

  // Popup styles (matching PopupListSelector)
  const popupStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '70vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid #f0f0f0'
    },
    headerTitle: {
      fontSize: '16px',
      fontWeight: 500
    },
    closeBtn: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    message: {
      fontSize: '14px',
      color: '#333',
      textAlign: 'center'
    },
    buttons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      marginTop: '8px'
    }
  };

  // Responsive styles - SINGLE SCROLL LAYOUT
  const styles = {
    container: {
      backgroundColor: '#f5f5f5',
      height: '100vh',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    },
    mainContent: {
      marginTop: '60px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    // Form Header - Fixed at top
    formHeader: {
      position: 'fixed',
      top: '60px',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      zIndex: 500,
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      padding: isMobile ? '10px 15px' : '15px 25px',
      borderBottom: '3px solid #ddd',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '8px' : isTablet ? '10px' : '15px 20px',
      alignItems: 'center'
    },
    formField: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '4px' : '8px'
    },
    formLabel: {
      fontWeight: '600',
      fontSize: isMobile ? '12px' : '17px',
      whiteSpace: 'nowrap',
      minWidth: isMobile ? 'auto' : '85px',
      color: '#333',
      textAlign: isMobile ? 'left' : 'right',
      width: isMobile ? '100%' : 'auto'
    },
    formInput: {
      flex: 1,
      padding: '8px 10px',
      border: "1px solid #ddd",
      borderRadius: '4px',
      fontSize: isMobile ? '12px' : '14px',
      outline: 'none',
      minHeight: '35px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%'
    },
    // Main table container - SINGLE SCROLL (Fixed Header, Scrollable Body)
    tableContainerWrapper: {
      position: "fixed",
      top: formHeaderHeight + 65,
      left: isMobile ? 10 : 20,
      right: isMobile ? 10 : 20,
      bottom: actionBarHeight + 10,
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      border: "1px solid #ddd",
      borderRadius: "10px 10px 0 0",
      overflow: "hidden",
    },
    // Table header - Fixed with synchronized horizontal scroll
    tableHeaderContainer: {
      backgroundColor: '#1976d2af',
      
      borderRadius: '12px 12px 0 0',
      width: '100%',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flexShrink: 0
    },
    tableHeaderInner: {
      width: '100%',
      overflowX: 'auto',
      
      overflowY: 'hidden',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    },
    tableHeaderTable: {
      
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: isMobile ? '11px' : '14px',
      tableLayout: 'fixed',
      minWidth: isMobile ? '1100px' : 'auto'
    },
    // Table body container - Scrollable (ONLY ROWS) with smooth scrolling
    tableBodyContainer: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'auto',
      height: getTableBodyHeight(),
      backgroundColor: '#ffffff',
      borderLeft: '1px solid #ddd',
      borderRight: '1px solid #ddd',
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      msOverflowStyle: '-ms-autohiding-scrollbar',
      scrollbarWidth: 'thin',
      scrollbarColor: '#1976d2 #f1f1f1',
    },
    tableBody: {
      minWidth: isMobile ? '1100px' : '100%',
      borderCollapse: 'collapse',
      fontSize: isMobile ? '11px' : '14px',
      tableLayout: 'fixed',
      width: '100%'
    },
    // Add Item Button Container (FIXED below table rows)
    addItemButtonContainer: {
      padding: isMobile ? '12px 20px' : '15px 25px',
      textAlign: 'left',
      backgroundColor: '#ffffff',
      borderLeft: '1px solid #ddd',
      borderRight: '1px solid #ddd',
      borderBottom: '1px solid #ddd',
      borderTop: '2px solid #f0f0f0',
      flexShrink: 0
    },
    // Action Bar - Fixed at bottom
    actionBar: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      padding: isMobile ? '8px 10px' : '12px 20px',
      borderTop: '2px solid #dee2e6',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      height: isMobile ? 'auto' : '70px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row'
    }
  };

  // Responsive column widths for table
  const getColumnWidth = (column) => {
    if (isMobile) {
      const mobileWidths = {
        sNo: '35px',
        barcode: '80px',
        itemName: '120px',
        stock: '60px',
        mrp: '60px',
        uom: '40px',
        hsn: '60px',
        tax: '40px',
        sRate: '60px',
        rate: '60px',
        qty: '40px',
        amount: '80px',
        action: '40px'
      };
      return mobileWidths[column] || 'auto';
    } else if (isTablet) {
      const tabletWidths = {
        sNo: '45px',
        barcode: '95px',
        itemName: '180px',
        stock: '75px',
        mrp: '75px',
        uom: '55px',
        hsn: '75px',
        tax: '55px',
        sRate: '75px',
        rate: '75px',
        qty: '55px',
        amount: '95px',
        action: '55px'
      };
      return tabletWidths[column] || 'auto';
    }
    // Desktop widths
    const desktopWidths = {
      sNo: '50px',
      barcode: '100px',
      itemName: '200px',
      stock: '80px',
      mrp: '80px',
      uom: '60px',
      hsn: '80px',
      tax: '60px',
      sRate: '80px',
      rate: '80px',
      qty: '60px',
      amount: '100px',
      action: '60px'
    };
    return desktopWidths[column] || 'auto';
  };

  // Button styles for mobile
  const getButtonStyle = () => ({
    minWidth: isMobile ? '70px' : '100px',
    padding: isMobile ? '6px 10px' : '8px 16px',
    fontSize: isMobile ? '12px' : '14px',
    borderRadius: '50px'
  });

  return (
    <div style={styles.container}>
      {/* Delete Confirmation Modal - Updated to match PopupListSelector style */}
      <Modal
        open={showDeleteConfirm}
        onCancel={handleDeleteCancel}
        footer={null}
        width="auto"
        style={{ maxWidth: '500px', top: '20%' }}
        closeIcon={null}
      >
        <div style={popupStyles.container}>
          {/* Header */}
          <div style={popupStyles.header}>
            <div style={popupStyles.headerTitle}>Confirm Delete</div>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={handleDeleteCancel} 
              style={popupStyles.closeBtn} 
            />
          </div>

          {/* Content */}
          <div style={popupStyles.content}>
            <div style={popupStyles.message}>
              Are you sure you want to delete this item?
            </div>
            
            <div style={popupStyles.buttons}>
              <Button 
                onClick={handleDeleteCancel}
                style={{ 
                  minWidth: '80px',
                  padding: '8px 16px'
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                danger
                onClick={handleDeleteConfirm}
                style={{ 
                  minWidth: '80px',
                  padding: '8px 16px'
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Fixed Form Header */}
        <div ref={formHeaderRef} style={styles.formHeader}>
          <div style={styles.formGrid}>
            {/* Bill No Field */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>Bill No :</label>
              <input
                name="billNo"
                type="text"
                style={styles.formInput}
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

           

            {/* Customer Name Field */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>Customer:</label>
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

            {/* Barcode Field - Now using the same formInput style with proper sizing */}
           <div style={styles.formField}>
              <label style={styles.formLabel}>Barcode:</label>
              <input
                name="barcode"
                type="text"
                style={styles.formInput}
                value={formData.barcode}
                onChange={handleFormChange('barcode')}
                onKeyDown={(e) => handleFormKeyDown('barcode', e)}
                placeholder="Barcode"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              />
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div style={styles.tableContainerWrapper}>
          {/* Fixed Table Header with synchronized horizontal scroll */}
          <div ref={tableHeaderRef} style={styles.tableHeaderContainer}>
            <div 
              ref={tableHeaderInnerRef} 
              style={styles.tableHeaderInner}
            >
              <table style={styles.tableHeaderTable}>
                <thead>
                  <tr>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: getColumnWidth('sNo'), borderTopLeftRadius: '12px' }}>SNo</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: getColumnWidth('barcode') }}>Barcode</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'left', whiteSpace: 'nowrap', width: getColumnWidth('itemName') }}>Item Name</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: getColumnWidth('stock') }}>Stock</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: getColumnWidth('mrp') }}>MIP</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: getColumnWidth('uom') }}>UOM</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: getColumnWidth('hsn') }}>HSN</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: getColumnWidth('tax') }}>TAX (%)</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: getColumnWidth('sRate') }}>State</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: getColumnWidth('rate') }}>Waste</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: getColumnWidth('qty') }}>Qty</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'right', whiteSpace: 'nowrap', width: getColumnWidth('amount') }}>Amount</th>
                    <th style={{ ...tableCellBorderStyle, color: 'white', fontWeight: 'bold', padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: getColumnWidth('action'), borderTopRightRadius: '12px' }}>ACTION</th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
          
          {/* Scrollable Table Body with Inputs (ONLY ROWS) */}
          <div 
            ref={tableBodyRef} 
            style={styles.tableBodyContainer}
            className="custom-scrollbar"
            onScroll={handleTableBodyScroll}
          >
            <table style={styles.tableBody}>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                    {/* SNo */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', whiteSpace: 'nowrap', textAlign: 'center', width: getColumnWidth('sNo') }}>{item.sNo}</td>
                    
                    {/* Barcode */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', width: getColumnWidth('barcode') }}>
                      <input
                        ref={el => inputRefs.current[`barcode-${item.id}`] = el}
                        type="text"
                        style={{ 
                          ...tableInputStyle, 
                          fontWeight: '500', 
                          textAlign: 'center',
                          backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff',
                          fontSize: isMobile ? '11px' : '14px'
                        }}
                        value={item.barcode}
                        onChange={handleItemChange(item.id, 'barcode')}
                        onKeyDown={(e) => handleKeyDown(item.id, 'barcode', e)}
                        placeholder="Barcode"
                      />
                    </td>
                    
                    {/* Item Name */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', width: getColumnWidth('itemName') }}>
                      <input
                        ref={el => inputRefs.current[`itemName-${item.id}`] = el}
                        type="text"
                        style={{ 
                          ...tableInputStyle, 
                          textAlign: 'left',
                          backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff',
                          fontSize: isMobile ? '11px' : '14px'
                        }}
                        value={item.itemName}
                        onChange={handleItemChange(item.id, 'itemName')}
                        onKeyDown={(e) => handleKeyDown(item.id, 'itemName', e)}
                        placeholder="Item Name"
                      />
                    </td>
                    
                    {/* Stock */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', width: getColumnWidth('stock') }}>
                      <input
                        ref={el => inputRefs.current[`stock-${item.id}`] = el}
                        type="text"
                        style={{ 
                          ...tableInputStyle,
                          backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff',
                          fontSize: isMobile ? '11px' : '14px'
                        }}
                        value={item.stock || ''}
                        onChange={handleItemChange(item.id, 'stock')}
                        onKeyDown={(e) => handleKeyDown(item.id, 'stock', e)}
                        placeholder="Stock"
                      />
                    </td>
                    
                    {/* MRP */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', width: getColumnWidth('mrp') }}>
                      <input
                        ref={el => inputRefs.current[`mrp-${item.id}`] = el}
                        type="text"
                        style={{ 
                          ...tableInputStyle,
                          backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff',
                          fontSize: isMobile ? '11px' : '14px'
                        }}
                        value={item.mrp || ''}
                        onChange={handleItemChange(item.id, 'mrp')}
                        onKeyDown={(e) => handleKeyDown(item.id, 'mrp', e)}
                        placeholder="MIP"
                      />
                    </td>
                    
                    {/* UOM */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', width: getColumnWidth('uom') }}>
                      <input
                        ref={el => inputRefs.current[`uom-${item.id}`] = el}
                        type="text"
                        style={{ 
                          ...tableInputStyle,
                          backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff',
                          fontSize: isMobile ? '11px' : '14px'
                        }}
                        value={item.uom}
                        onChange={handleItemChange(item.id, 'uom')}
                        onKeyDown={(e) => handleKeyDown(item.id, 'uom', e)}
                        placeholder="UOM"
                      />
                    </td>
                    
                    {/* HSN */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', width: getColumnWidth('hsn') }}>
                      <input
                        ref={el => inputRefs.current[`hsn-${item.id}`] = el}
                        type="text"
                        style={{ 
                          ...tableInputStyle,
                          backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff',
                          fontSize: isMobile ? '11px' : '14px'
                        }}
                        value={item.hsn || ''}
                        onChange={handleItemChange(item.id, 'hsn')}
                        onKeyDown={(e) => handleKeyDown(item.id, 'hsn', e)}
                        placeholder="HSN"
                      />
                    </td>
                    
                    {/* TAX */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', width: getColumnWidth('tax') }}>
                      <input
                        ref={el => inputRefs.current[`tax-${item.id}`] = el}
                        type="number"
                        style={{ 
                          ...tableInputStyle,
                          backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff',
                          fontSize: isMobile ? '11px' : '14px'
                        }}
                        value={item.tax}
                        onChange={handleItemChange(item.id, 'tax')}
                        onKeyDown={(e) => handleKeyDown(item.id, 'tax', e)}
                        placeholder="Tax"
                        step="0.01"
                      />
                    </td>
                    
                    {/* SRATE */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', width: getColumnWidth('sRate') }}>
                      <input
                        ref={el => inputRefs.current[`sRate-${item.id}`] = el}
                        type="number"
                        style={{ 
                          ...tableInputStyle,
                          backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff',
                          fontSize: isMobile ? '11px' : '14px'
                        }}
                        value={item.sRate}
                        onChange={handleItemChange(item.id, 'sRate')}
                        onKeyDown={(e) => handleKeyDown(item.id, 'sRate', e)}
                        placeholder="State"
                        step="0.01"
                      />
                    </td>
                    
                    {/* RATE */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', width: getColumnWidth('rate') }}>
                      <input
                        ref={el => inputRefs.current[`rate-${item.id}`] = el}
                        type="number"
                        style={{ 
                          ...tableInputStyle,
                          backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff',
                          fontSize: isMobile ? '11px' : '14px'
                        }}
                        value={item.rate || ''}
                        onChange={handleItemChange(item.id, 'rate')}
                        onKeyDown={(e) => handleKeyDown(item.id, 'rate', e)}
                        placeholder="Waste"
                        step="0.01"
                      />
                    </td>
                    
                    {/* QTY */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', width: getColumnWidth('qty') }}>
                      <input
                        ref={el => inputRefs.current[`qty-${item.id}`] = el}
                        type="number"
                        style={{ 
                          ...tableInputStyle, 
                          fontWeight: 'bold',
                          backgroundColor: item.id % 2 === 0 ? '#f9f9f9' : '#ffffff',
                          fontSize: isMobile ? '11px' : '14px'
                        }}
                        value={item.qty}
                        onChange={handleItemChange(item.id, 'qty')}
                        onKeyDown={(e) => handleKeyDown(item.id, 'qty', e)}
                        placeholder="Qty"
                        step="0.01"
                      />
                    </td>
                    
                    {/* AMOUNT */}
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', width: getColumnWidth('amount') }}>
                      <input
                        type="text"
                        style={{ 
                          ...tableInputStyle, 
                          textAlign: 'right', 
                          fontWeight: 'bold', 
                          color: '#1565c0', 
                          backgroundColor: '#f0f7ff',
                          fontSize: isMobile ? '11px' : '14px'
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
                    <td style={{ ...tableCellBorderStyle, padding: isMobile ? '6px 2px' : '12px 8px', textAlign: 'center', width: getColumnWidth('action') }}>
                      <button
                        onClick={() => confirmDelete(item.id)}
                        style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', padding: '2px' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#b71c1c'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#d32f2f'}
                      >
                        <DeleteIcon fontSize={isMobile ? "small" : "small"} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Add Item Button (FIXED below table rows) */}
          <div ref={addItemButtonRef} style={styles.addItemButtonContainer}>
            <button 
              onClick={addItemRow} 
              style={{
                ...buttonStyles.btn,
                ...buttonStyles.addBtn,
                padding: isMobile ? '8px 16px' : '10px 25px',
                fontSize: isMobile ? '13px' : '16px',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <CreateIcon /> Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Action Bar at Bottom */}
      <div ref={actionBarRef} style={styles.actionBar}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          height: '100%',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '10px' : '0',
          width: '100%'
        }}>
          {/* Left side buttons */}
          <div style={{ display: 'flex', gap: isMobile ? '5px' : '10px', justifyContent: isMobile ? 'center' : 'flex-start', width: isMobile ? '100%' : 'auto' }}>
            <AddButton 
              onClick={addItemRow}
              isActive={topButtonActive === 'add'}
              onStateChange={handleTopButtonStateChange}
              style={getButtonStyle()}
            />
            <EditButton 
              isActive={topButtonActive === 'edit'}
              onStateChange={handleTopButtonStateChange}
              style={getButtonStyle()}
            />
            <DeleteButton 
              isActive={topButtonActive === 'delete'}
              onStateChange={handleTopButtonStateChange}
              style={getButtonStyle()}
            />
          </div>

          {/* Center - Totals */}
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '10px' : '30px', 
            alignItems: 'center',
            justifyContent: isMobile ? 'center' : 'center',
            width: isMobile ? '100%' : 'auto'
          }}>
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: isMobile ? '8px' : '12px 11px', 
                
                
                
                
                minWidth: isMobile ? '120px' : '140px'
              }}
            >
              <div style={{ 
                fontSize: isMobile ? '11px' : '13px', 
                color: '#1976d2', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Total Quantity
              </div>
              <div style={{ 
                ...brightTotalStyle, 
                color: '#1976d2',
                fontSize: isMobile ? '18px' : '22px'
              }}>
                {totalQty.toFixed(2)}
              </div>
            </div>
            
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: isMobile ? '8px' : '12px 11px', 
                
               
                minWidth: isMobile ? '120px' : '140px'
              }}
            >
              <div style={{ 
                fontSize: isMobile ? '11px' : '13px', 
                color: '#28a745', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Total Amount
              </div>
              <div style={{ 
                ...brightTotalStyle, 
                color: '#28a745',
                fontSize: isMobile ? '18px' : '22px'
              }}>
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Right side buttons */}
          <div style={{ 
            display: 'flex', 
            
            gap: isMobile ? '5px' : '10px', 
            justifyContent: isMobile ? 'center' : 'flex-end',
            width: isMobile ? '100%' : 'auto'
          }}>
            <ClearButton 
              onClick={handleClear}
              isActive={bottomButtonActive === 'clear'}
              onStateChange={handleBottomButtonStateChange}
              style={getButtonStyle()}
            />
            <SaveButton 
              onClick={handleSave}
              isActive={bottomButtonActive === 'save'}
              onStateChange={handleBottomButtonStateChange}
              style={{
                ...getButtonStyle(),
                minWidth: isMobile ? '70px' : '120px'
              }}
            />
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salesreturn;