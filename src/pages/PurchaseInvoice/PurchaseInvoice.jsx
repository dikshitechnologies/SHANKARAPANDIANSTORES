import React, { useState, useEffect, useRef, useMemo } from 'react';
import PopupListSelector from '../../components/Listpopup/PopupListSelector.jsx';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup.jsx';
import "react-toastify/dist/ReactToastify.css";
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
import { PopupScreenModal } from '../../components/PopupScreens.jsx';

const Icon = {
  Search: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  ),
  Truck: ({ size = 16, onClick, style, ...props }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      height={`${size}px`} 
      viewBox="0 -960 960 960" 
      width={`${size}px`} 
      fill="#1B91DA"
      onClick={onClick}
      style={{ cursor: 'pointer', ...style }}
      {...props}
    >
      <path d="M240-200q-50 0-85-35t-35-85H40v-360q0-33 23.5-56.5T120-760h560l240 240v200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H360q0 50-35 85t-85 35Zm360-360h160L640-680h-40v120Zm-240 0h160v-120H360v120Zm-240 0h160v-120H120v120Zm120 290q21 0 35.5-14.5T290-320q0-21-14.5-35.5T240-370q-21 0-35.5 14.5T190-320q0 21 14.5 35.5T240-270Zm480 0q21 0 35.5-14.5T770-320q0-21-14.5-35.5T720-370q-21 0-35.5 14.5T670-320q0 21 14.5 35.5T720-270ZM120-400h32q17-18 39-29t49-11q27 0 49 11t39 29h304q17-18 39-29t49-11q27 0 49 11t39 29h32v-80H120v80Zm720-80H120h720Z"/>
    </svg>
  ),
}
// Updated TransportPopup component
const TransportPopup = ({ isOpen, onClose, transportData, onTransportDataChange }) => {
  const [localData, setLocalData] = useState({
    transportName: transportData?.transportName || '', // New field for transport name
    lrNo: transportData?.lrNo || '',
    lrDate: transportData?.lrDate || new Date().toISOString().substring(0, 10),
    amount: transportData?.amount || '',
    gstPercent: transportData?.gstPercent || '',
    total: transportData?.total || ''
  });
  const [showTransPopup, setShowTransPopup] = useState(false);
  const [transportSearchTerm, setTransportSearchTerm] = useState('');

  useEffect(() => {
    setLocalData({
      transportName: transportData?.transportName || '',
      lrNo: transportData?.lrNo || '',
      lrDate: transportData?.lrDate || new Date().toISOString().substring(0, 10),
      amount: transportData?.amount || '',
      gstPercent: transportData?.gstPercent || '',
      total: transportData?.total || ''
    });
  }, [transportData]);

  // Calculate total whenever amount or GST percent changes
  useEffect(() => {
    const amountNum = parseFloat(localData.amount) || 0;
    const gstPercentNum = parseFloat(localData.gstPercent) || 0;
    const calculatedTotal = amountNum * (gstPercentNum / 100);
    setLocalData(prev => ({
      ...prev,
      total: calculatedTotal.toFixed(2)
    }));
  }, [localData.amount, localData.gstPercent]);

const fetchTransportList = async (search = '', pageNum = 1) => {
  try {
    // Call the function with parameters
    const endpoint = API_ENDPOINTS.PURCHASE_INVOICE.GET_TRANSPORT_LIST(pageNum, 20, search);
    console.log('Fetching transport from:', endpoint);
    
    const response = await axiosInstance.get(endpoint);
    const responseData = response?.data || {};
    const data = responseData.data || [];
    
    console.log('Fetched transport data:', data);
    
    let items = Array.isArray(data) ? data.map((transport, index) => ({
      id: transport.fCode || `transport-${index}`,
      code: transport.fCode || '',
      name: transport.fTransport || '',
      displayName: `${transport.fTransport}`
    })) : [];
    
    // Note: The API already filters by search, but we can do additional client-side filtering if needed
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      items = items.filter(item => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.displayName?.toLowerCase().includes(searchLower)
      );
    }
    
    return items;
  } catch (err) {
    console.error('Error fetching transport list:', err);
    return [];
  }
};

  // Handle transport selection from popup
  const handleTransportSelect = (selectedTransport) => {
    if (!selectedTransport) return;
    
    setLocalData(prev => ({
      ...prev,
      transportName: selectedTransport.name || '',
      transportCode: selectedTransport.code || ''
    }));
    
    setShowTransPopup(false);
    setTransportSearchTerm('');
    
    // Focus back to transport input after selection
    setTimeout(() => {
      const transportInput = document.querySelector('input[name="transportName"]');
      if (transportInput) {
        transportInput.focus();
        transportInput.select();
      }
    }, 100);
  };

  if (!isOpen) return null;

  const handleNumberInput = (value, field) => {
    // Allow empty string
    if (value === '') {
      setLocalData(prev => ({ ...prev, [field]: '' }));
      return '';
    }
    
    // Remove any non-numeric characters except decimal point
    const sanitizedValue = value
      .replace(/[^\d.]/g, '') // Remove non-numeric except .
      .replace(/(\..*)\./g, '$1'); // Allow only one decimal point
    
    // Allow any valid number format during typing
    const isValidNumber = /^\d*\.?\d*$/.test(sanitizedValue);
    
    if (isValidNumber) {
      setLocalData(prev => ({ ...prev, [field]: sanitizedValue }));
    }
    return sanitizedValue;
  };

  const handleBlur = (field) => {
    const value = localData[field];
    
    if (value === '' || value === '-') {
      return;
    }
    
    try {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        // Format to 2 decimal places if needed
        // But don't add .00 if it's a whole number
        if (num % 1 === 0) {
          setLocalData(prev => ({ ...prev, [field]: num.toString() }));
        } else {
          setLocalData(prev => ({ ...prev, [field]: num.toFixed(2) }));
        }
      }
    } catch (error) {
      // Invalid number, clear it
      setLocalData(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = () => {
    // Update all transport-related fields in the parent component
    onTransportDataChange(localData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px',
        }}>
          <h3 style={{
            margin: 0,
            color: '#1B91DA',
            fontSize: '18px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Icon.Truck size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Transport Details
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              padding: '5px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '15px',
        }}>
          {/* Transport Field with Search */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              width: '80px',
              minWidth: '80px',
              color: '#333',
            }}>
              Transport:
            </label>
            <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
              <input
                type="text"
                name="transportName"
                value={localData.transportName}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalData(prev => ({ 
                    ...prev, 
                    transportName: value
                  }));
                  
                  // Open popup when typing
                  if (value.length > 0) {
                    setTransportSearchTerm(value);
                    setTimeout(() => setShowTransPopup(true), 300);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '5px 12px',
                  border: '1px solid #1B91DA',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  paddingRight: '40px',
                }}
                // placeholder="Search transport..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === '/' || e.key === 'F2') {
                    e.preventDefault();
                    setTransportSearchTerm(localData.transportName || '');
                    setShowTransPopup(true);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const lrNoInput = document.querySelector('input[name="lrNo"]');
                    if (lrNoInput) lrNoInput.focus();
                  }
                }}
                onFocus={(e) => {
                  e.target.select();
                }}
                onBlur={() => {
                  setTimeout(() => {
                    if (!showTransPopup) {
                      setTransportSearchTerm('');
                    }
                  }, 200);
                }}
              />
              <button
                type="button"
                aria-label="Search transport"
                title="Search transport"
                onClick={() => {
                  setTransportSearchTerm(localData.transportName || '');
                  setShowTransPopup(true);
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: '#1B91DA',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  zIndex: 1,
                  border: 'none',
                  width: '24px',
                  height: '24px',
                }}
              >
                <Icon.Search size={16} />
              </button>
            </div>
          </div>

          {/* LR No */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              color: '#333',
              width: '80px',
              minWidth: '80px',
            }}>
              LR No:
            </label>
            <input
              type="text"
              name="lrNo"
              value={localData.lrNo}
              onChange={(e) => setLocalData(prev => ({ ...prev, lrNo: e.target.value }))}
              style={{
                width: '100%',
                padding: '5px 12px',
                border: '1px solid #1B91DA',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              // placeholder="Enter LR No"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const lrDateInput = document.querySelector('input[name="lrDate"]');
                  if (lrDateInput) lrDateInput.focus();
                }
              }}
            />
          </div>

          {/* LR Date */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              color: '#333',
              width: '80px',
              minWidth: '80px',
            }}>
              LR Date
            </label>
            <input
              type="date"
              name="lrDate"
              value={localData.lrDate}
              onChange={(e) => setLocalData(prev => ({ ...prev, lrDate: e.target.value }))}
              style={{
                width: '100%',
                padding: '5px 12px',
                border: '1px solid #1B91DA',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const amountInput = document.querySelector('input[name="amount"]');
                  if (amountInput) amountInput.focus();
                }
              }}
            />
          </div>

          {/* Amount */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              color: '#333',
              width: '80px',
              minWidth: '80px',
            }}>
              Amount
            </label>
            <input
              type="text"
              name="amount"
              value={localData.amount}
              onChange={(e) => {
                handleNumberInput(e.target.value, 'amount');
              }}
              onBlur={() => handleBlur('amount')}
              style={{
                width: '100%',
                padding: '5px 12px',
                border: '1px solid #1B91DA',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              // placeholder="0.00"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const gstPercentInput = document.querySelector('input[name="gstPercent"]');
                  if (gstPercentInput) gstPercentInput.focus();
                }
              }}
            />
          </div>

          {/* GST % */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              color: '#333',
              width: '80px',
              minWidth: '80px',
            }}>
              GST %
            </label>
            <input
              type="text"
              name="gstPercent"
              value={localData.gstPercent}
              onChange={(e) => {
                handleNumberInput(e.target.value, 'gstPercent');
              }}
              onBlur={() => handleBlur('gstPercent')}
              style={{
                width: '100%',
                padding: '5px 12px',
                border: '1px solid #1B91DA',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              // placeholder="0.00"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const totalInput = document.querySelector('input[name="total"]');
                  if (totalInput) totalInput.focus();
                }
              }}
            />
          </div>

          {/* Total */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              color: '#333',
              width: '80px',
              minWidth: '80px',
            }}>
              Total
            </label>
            <input
              type="text"
              name="total"
              value={localData.total}
              readOnly
              style={{
                width: '100%',
                padding: '5px 12px',
                border: '1px solid #1B91DA',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />            
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '25px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onClose();
              }
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              backgroundColor: '#1B91DA',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
      
      {/* Transport List Popup */}
      <PopupListSelector
        open={showTransPopup}
        onClose={() => {
          setShowTransPopup(false);
          setTransportSearchTerm('');
        }}
        title="Select Transport"
        fetchItems={() => fetchTransportList(transportSearchTerm)}
        displayFieldKeys={['displayName']}
        headerNames={['Transport']}
        searchFields={['name']}
        columnWidths={{ displayName: '100%' }}
        searchPlaceholder="Search by transport name or code..."
        initialSearch={transportSearchTerm}
        onSelect={handleTransportSelect}
      />
    </div>
  );
};
// Calculation helpers
const calculateTotals = (items = []) => {
  const subTotal = items.reduce((acc, it) => {
    const qty = parseFloat(it?.qty) || 0;
    const rate = parseFloat(it?.prate) || 0;
    return acc + qty * rate;
  }, 0);
  
  const amtTotal = items.reduce((acc, it) => {
    const amt = parseFloat(it?.amt) || 0;
    return acc + amt;
  }, 0);

  let gstTotals = 0;
  let hasIntax = false;
  let hasOuttax = false;
  
  // Check which tax field is being used
  items.forEach(item => {
    const intax = parseFloat(item?.intax) || 0;
    const outtax = parseFloat(item?.outtax) || 0;
    
    if (intax > 0) hasIntax = true;
    if (outtax > 0) hasOuttax = true;
  });
  
  if (hasIntax) {
    // Calculate GST amount from intax percentage
    gstTotals = items.reduce((acc, it) => {
      const qty = parseFloat(it?.qty) || 0;
      const rate = parseFloat(it?.prate) || 0;
      const intax = parseFloat(it?.intax) || 0;
      const itemSubtotal = qty * rate;
      const itemGst = itemSubtotal * (intax / 100);
      return acc + itemGst;
    }, 0);
  } else if (hasOuttax) {
    // Calculate GST amount from outtax percentage
    gstTotals = items.reduce((acc, it) => {
      const qty = parseFloat(it?.qty) || 0;
      const rate = parseFloat(it?.prate) || 0;
      const outtax = parseFloat(it?.outtax) || 0;
      const itemSubtotal = qty * rate;
      const itemGst = itemSubtotal * (outtax / 100);
      return acc + itemGst;
    }, 0);
  }

  const total = subTotal + gstTotals;  // Should include GST
  const net = amtTotal || total;
  return { subTotal, total, net, amtTotal, gstTotals };
};

const PurchaseInvoice = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.PURCHASE_INVOICE),
    edit: hasModifyPermission(PERMISSION_CODES.PURCHASE_INVOICE),
    delete: hasDeletePermission(PERMISSION_CODES.PURCHASE_INVOICE)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('add');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBillNo, setEditingBillNo] = useState('');
  const [allTax, setAllTax] = useState([]);
  
  // Confirmation popup states
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'default',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    showLoading: false
  });
  
  // Loading state for async operations
  const [isLoading, setIsLoading] = useState(false);
  
  // New states for freight and charges
  const [addLessAmount, setAddLessAmount] = useState('');
  const [freightAmount, setFreightAmount] = useState('');
  const [transportData, setTransportData] = useState({
    transportName: '',
    lrNo: '',
    lrDate: new Date().toISOString().substring(0, 10),
    amount: '',
    gstPercent: '',
    total: ''
  });
  const [chargesPercent, setChargesPercent] = useState('');
  const [chargesAmount, setChargesAmount] = useState('');
  
  // 1. Header Details State
  const [billDetails, setBillDetails] = useState({
    invNo: '',
    billDate: new Date().toISOString().substring(0, 10),
    mobileNo: '',
    customerName: '',
    type: 'Retail',
    barcodeInput: '',
    entryDate: '',
    amount: '',
    partyCode: '',
    gstno: '',
    gstType: 'G',
    purNo: '',
    invoiceNo: '',
    purDate: new Date().toISOString().substring(0, 10),
    invoiceAmount: '',
    transType: 'PURCHASE',
    city: '',
    groupName: '',
    isLedger: false,
  });

  // 2. Table Items State
  const [items, setItems] = useState([
    { 
      id: 1, 
      barcode: '', 
      name: '', 
      sub: '', 
      stock: '', 
      mrp: '', 
      uom: '', 
      hsn: '', 
      tax: '', 
      rate: '', 
      qty: '',
      ovrwt: '',
      avgwt: '',
      prate: '',
      intax: '',
      outtax: '',
      acost: '',
      sudo: '',
      profitPercent: '',
      preRT: '',
      sRate: '',
      asRate: '',
      letProfPer: '',
      ntCost: '',
      wsPercent: '',
      wsRate: '',
      amt: '',
      min: '',
      max: ''
    }
  ]);

  // 3. Totals State
  const [netTotal, setNetTotal] = useState(0);
  const [gstTotal, setGstTotal] = useState(0);
  // --- REFS FOR ENTER KEY NAVIGATION ---
  const billNoRef = useRef(null);
  const dateRef = useRef(null);
  const mobileRef = useRef(null);
  const customerRef = useRef(null);
  const barcodeRef = useRef(null);
  const addBtnRef = useRef(null);
  const amountRef = useRef(null);
  const purNoRef = useRef(null);
  const invoiceNoRef = useRef(null);
  const purDateRef = useRef(null);
  const nameRef = useRef(null);
  const cityRef = useRef(null);
  const gstTypeRef = useRef(null);
  const transtypeRef = useRef(null); 
  const invoiceAmountRef = useRef(null);
  const gstNoRef = useRef(null);
  const firstRowNameRef = useRef(null);
  const addLessRef = useRef(null);
  const transportRef = useRef(null);
  const freightRef = useRef(null);
  const chargesPercentRef = useRef(null);
  const chargesAmountRef = useRef(null);
  const groupNameRef = useRef(null);
  
  // Track if we should ignore Enter key (for edit invoice loading)
  const ignoreNextEnterRef = useRef(false);
  const [focusedUomField, setFocusedUomField] = useState(null); 

  // Track which top-section field is focused to style active input
  const [focusedField, setFocusedField] = useState('');
  const [showSupplierPopup, setShowSupplierPopup] = useState(false);
  // const [showTransPopup, setShowTransPopup] = useState(false);
  const [showGroupNamePopup, setShowGroupNamePopup] = useState(false);
  const [showBillListPopup, setShowBillListPopup] = useState(false);
  const [showItemCodePopup, setShowItemCodePopup] = useState(false);
  const [popupMode, setPopupMode] = useState(''); // 'edit' or 'delete'
  const [selectedRowId, setSelectedRowId] = useState(null); // Track which row is being edited
  const [itemSearchTerm, setItemSearchTerm] = useState(''); // Track search term for item popup
  const [showTransportPopup, setShowTransportPopup] = useState(false);
  // Footer action active state
  const [activeFooterAction, setActiveFooterAction] = useState('null');

  // Screen size state for responsive adjustments
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  // Auth context for company code
  const { userData } = useAuth() || {};
  // Also get fseudo from context in case userData.fseudo is missing
  const { fseudo } = useAuth() || {};

  // Helper function to calculate charges amount
  const calculateChargesAmount = (freight, percent) => {
    const freightNum = parseFloat(freight) || 0;
    const percentNum = parseFloat(percent) || 0;
    return (freightNum * percentNum / 100).toFixed(2);
  };

  // Handle number input for addLess, freight, and chargesPercent
  const handleNumberInput = (e, type = 'addLess') => {
    const input = e.target.value;
    
    // Allow empty string
    if (input === '') {
      if (type === 'addLess') setAddLessAmount('');
      else if (type === 'freight') setFreightAmount('');
      else if (type === 'chargesPercent') {
        setChargesPercent('');
        setChargesAmount('');
      }
      return;
    }
    
    // Allow negative numbers only for addLess
    if (input === '-') {
      if (type === 'addLess') setAddLessAmount('-');
      else if (type === 'freight') setFreightAmount('');
      else if (type === 'chargesPercent') setChargesPercent('');
      return;
    }
    
    // Remove any non-numeric characters except decimal point and minus sign at start
    const sanitizedValue = input
      .replace(/[^\d.-]/g, '') // Remove non-numeric except . and -
      .replace(/(?!^)-/g, '') // Remove minus signs that aren't at the start
      .replace(/(\..*)\./g, '$1'); // Allow only one decimal point
    
    // Allow any valid number format during typing
    const isValidNumber = /^-?\d*\.?\d*$/.test(sanitizedValue);
    
    if (isValidNumber) {
      if (type === 'addLess') {
        setAddLessAmount(sanitizedValue);
      } else if (type === 'freight') {
        setFreightAmount(sanitizedValue);
        // Calculate charges amount when freight changes
        const chargesAmt = calculateChargesAmount(sanitizedValue, chargesPercent);
        setChargesAmount(chargesAmt);
      } else if (type === 'chargesPercent') {
        setChargesPercent(sanitizedValue);
        // Calculate charges amount when charges percent changes
        const chargesAmt = calculateChargesAmount(freightAmount, sanitizedValue);
        setChargesAmount(chargesAmt);
      }
    }
  };

  // Format on blur
  const handleBlur = (type = 'addLess') => {
    let value, setter;
    
    if (type === 'addLess') {
      value = addLessAmount;
      setter = setAddLessAmount;
    } else if (type === 'freight') {
      value = freightAmount;
      setter = setFreightAmount;
    } else if (type === 'chargesPercent') {
      value = chargesPercent;
      setter = setChargesPercent;
    }
    
    if (value === '' || value === '-') {
      setFocusedField('');
      return;
    }
    
    try {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        // Format to 2 decimal places if needed
        // But don't add .00 if it's a whole number
        if (num % 1 === 0) {
          setter(num.toString());
        } else {
          setter(num.toFixed(2));
        }
        
        // Recalculate charges amount if freight or charges percent changed
        if (type === 'freight') {
          const chargesAmt = calculateChargesAmount(num.toString(), chargesPercent);
          setChargesAmount(chargesAmt);
        } else if (type === 'chargesPercent') {
          const chargesAmt = calculateChargesAmount(freightAmount, num.toString());
          setChargesAmount(chargesAmt);
        }
      }
    } catch (error) {
      // Invalid number, clear it
      setter('');
      if (type === 'freight' || type === 'chargesPercent') {
        setChargesAmount('');
      }
    }
    
    setFocusedField('');
  };

  // Helper function to show confirmation popup
  const showConfirmation = (config) => {
    setConfirmConfig({
      title: config.title || 'Confirm Action',
      message: config.message || 'Are you sure you want to proceed?',
      onConfirm: config.onConfirm || (() => {}),
      type: config.type || 'default',
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      showLoading: config.showLoading || false,
      hideCancelButton: config.hideCancelButton || false
    });
    setShowConfirmPopup(true);
  };

  // Helper function to show alert-like confirmation
  const showAlertConfirmation = (message, onConfirm = null, type = 'info') => {
    showConfirmation({
      title: 'Information',
      message: message,
      onConfirm: onConfirm || (() => setShowConfirmPopup(false)),
      type: type,
      confirmText: 'OK',
      hideCancelButton: true,
      showLoading: false
    });
  };

  // Helper: Numeric field validation (allows only numbers with optional decimal)
  const handleNumericInput = (value) => {
    // Allow empty string
    if (value === '') return '';
    
    // Allow only numbers and one decimal point
    const sanitized = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    
    // Validate it's a valid number format
    if (/^\d*\.?\d*$/.test(sanitized)) {
      return sanitized;
    }
    return '';
  };

  const validateCustomer = () => {
    if (!billDetails.customerName || billDetails.customerName.trim() === "") {
      // ⛔ Stop everything immediately
      setTimeout(() => {
        showAlertConfirmation("Please select Customer first", () => {
          setTimeout(() => {
            nameRef.current?.focus();
            nameRef.current?.select?.();
          }, 50);
        });
      }, 0);

      return false;
    }
    return true;
  };

  // Helper: Validate sudo letters against fseudoMap
  const validateSudoLetters = (sudoValue, rowIndex) => {
    if (!sudoValue || sudoValue.trim() === '') return true; // Empty is valid
    
    const fseudoMap = userData?.fseudo || fseudo || {};
    const validLetters = new Set(
      Object.values(fseudoMap)
        .filter(l => typeof l === 'string')
        .map(l => l.toUpperCase())
    );

    const sudoUpper = sudoValue.toUpperCase();
    const invalidLetters = [];

    for (const letter of sudoUpper) {
      if (!validLetters.has(letter)) {
        invalidLetters.push(letter);
      }
    }

    if (invalidLetters.length > 0) {
      const validLettersStr = Array.from(validLetters).sort().join('');
      showAlertConfirmation(
        `Invalid sudo letters: ${invalidLetters.join(', ')}. Valid letters are: ${validLettersStr}`,
        () => {
          setTimeout(() => {
            const sudoInput = document.querySelector(
              `input[data-row="${rowIndex}"][data-field="sudo"]`
            );
            if (sudoInput) {
              sudoInput.focus();
              sudoInput.select();
            }
          }, 100);
        },
        'warning'
      );
      return false;
    }
    return true;
  };

  // State to store auto-generated barcode
  const [autoBarcode, setAutoBarcode] = useState('');

  // Helper: Fetch auto-generated barcode
  const fetchAutoBarcode = async () => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.PURCHASE_INVOICE.AUTO_GENERATE_BARCODE
      );
      if (response?.data?.barcode) {
        setAutoBarcode(response.data.barcode);
        console.log('Fetched auto barcode:', response.data.barcode);
      }
    } catch (err) {
      console.warn('Failed to fetch auto barcode, using default:', err);
      setAutoBarcode('');
    }
  };

  // Helper: Fetch next invoice number
  const fetchNextInvNo = async () => {
    try {
      setIsLoading(true);
      const compCode = (userData && userData.companyCode) ? userData.companyCode : '001';
      const endpoint = API_ENDPOINTS.PURCHASE_INVOICE.GET_PURCHASE_INVOICES(compCode);
      const response = await axiosInstance.get(endpoint);
      const nextCode = response?.data?.nextCode ?? response?.nextCode;
      if (nextCode) {
        setBillDetails(prev => ({ ...prev, invNo: nextCode }));
      } else {
        // If no next code, set a placeholder
        setBillDetails(prev => ({ ...prev, invNo: '' }));
      }
    } catch (err) {
      console.warn('Failed to fetch next invoice number:', err);
      setBillDetails(prev => ({ ...prev, invNo: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  // COMPLETE NEW FORM FUNCTION
  const createNewForm = async () => {
    try {
      setIsLoading(true);
      
      // First, clear all states
      setIsEditMode(false);
      setEditingBillNo('');
      setActiveTopAction('add');
      setActiveFooterAction('null');
      setItemSearchTerm('');
      setFocusedField('');
      setShowSupplierPopup(false);
      setShowGroupNamePopup(false);
      setShowBillListPopup(false);
      setShowItemCodePopup(false);
      setPopupMode('');
      setSelectedRowId(null);
      setAddLessAmount('');
      setFreightAmount('');
      setChargesPercent('');
      setChargesAmount('');
      setTransportData({
        transportName: '',
        lrNo: '',
        lrDate: new Date().toISOString().substring(0, 10),
        amount: '',
        gstPercent: '',
        total: ''
      });
      fetchAutoBarcode();
      
      // Clear table items first
      setItems([{
        id: 1, 
        barcode: '', 
        name: '', 
        sub: '', 
        stock: '', 
        mrp: '', 
        uom: '', 
        hsn: '', 
        tax: '', 
        rate: '', 
        qty: '',
        ovrwt: '',
        avgwt: '',
        prate: '',
        intax: '',
        outtax: '',
        acost: '',
        sudo: '',
        profitPercent: '',
        preRT: '',
        sRate: '',
        asRate: '',
        letProfPer: '',
        ntCost: '',
        wsPercent: '',
        wsRate: '',
        amt: '',
        min: '',
        max: ''
      }]);
      
      // Clear header fields
      const currentDate = new Date().toISOString().substring(0, 10);
      setBillDetails({
        invNo: '',
        billDate: currentDate,
        mobileNo: '',
        customerName: '',
        type: 'Retail',
        barcodeInput: '',
        entryDate: '',
        amount: '',
        partyCode: '',
        gstno: '',
        gstType: 'G',
        purNo: '',
        invoiceNo: '',
        purDate: currentDate,
        invoiceAmount: '',
        transType: 'PURCHASE',
        city: '',
        groupName: '',
        isLedger: false,
      });
      
      // Reset ignore Enter flag
      ignoreNextEnterRef.current = false;
      
      // Then fetch next invoice number
      await fetchNextInvNo();
      
      // Force a state update
      setTimeout(() => {
        if (dateRef.current) {
          dateRef.current.focus();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error creating new form:', error);
      showAlertConfirmation('Error refreshing form. Please try again.', null, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = async () => {
    try {
      setIsLoading(true);
      
      // First, clear all states
      setIsEditMode(false);
      setEditingBillNo('');
      setActiveTopAction('add');
      setActiveFooterAction('null');
      setItemSearchTerm('');
      setFocusedField('');
      setShowSupplierPopup(false);
      setShowGroupNamePopup(false);
      setShowBillListPopup(false);
      setShowItemCodePopup(false);
      setPopupMode('');
      setSelectedRowId(null);
      setAddLessAmount('');
      setFreightAmount('');
      setChargesPercent('');
      setChargesAmount('');
      setTransportData({
        transportName: '',
        lrNo: '',
        lrDate: new Date().toISOString().substring(0, 10),
        amount: '',
        gstPercent: '',
        total: ''
      });
      fetchAutoBarcode();
      
      // Clear table items first
      setItems([{
        id: 1, 
        barcode: '', 
        name: '', 
        sub: '', 
        stock: '', 
        mrp: '', 
        uom: '', 
        hsn: '', 
        tax: '', 
        rate: '', 
        qty: '',
        ovrwt: '',
        avgwt: '',
        prate: '',
        intax: '',
        outtax: '',
        acost: '',
        sudo: '',
        profitPercent: '',
        preRT: '',
        sRate: '',
        asRate: '',
        letProfPer: '',
        ntCost: '',
        wsPercent: '',
        wsRate: '',
        amt: '',
        min: '',
        max: ''
      }]);
      
      // Clear header fields
      const currentDate = new Date().toISOString().substring(0, 10);
      setBillDetails({
        invNo: '',
        billDate: currentDate,
        mobileNo: '',
        customerName: '',
        type: 'Retail',
        barcodeInput: '',
        entryDate: '',
        amount: '',
        partyCode: '',
        gstno: '',
        gstType: 'G',
        purNo: '',
        invoiceNo: '',
        purDate: currentDate,
        invoiceAmount: '',
        transType: 'PURCHASE',
        city: '',
        groupName: '',
        isLedger: false,
      });
      
      // Reset ignore Enter flag
      ignoreNextEnterRef.current = false;
      
      // Then fetch next invoice number
      await fetchNextInvNo();
      
      // Force a state update
      setTimeout(() => {
        if (dateRef.current) {
          dateRef.current.focus();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error creating new form:', error);
      showAlertConfirmation('Error refreshing form. Please try again.', null, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch purchase bill list for popup
  const fetchBillList = async (pageNum = 1, search = '') => {
    // Only fetch data on first page - API returns all data at once (no server-side pagination)
    if (pageNum > 1) {
      return []; // Return empty array for subsequent pages to stop infinite scroll
    }
    
    try {
      const compCode = userData?.companyCode || '001';
      const response = await axiosInstance.get(
        API_ENDPOINTS.PURCHASE_INVOICE.GET_BILL_LIST(compCode)
      );
      
      const data = response?.data || [];
      
      let items = Array.isArray(data) ? data.map((bill, index) => ({
        id: bill.code || bill.voucherNo || `bill-${index}`,
        voucherNo: bill.code || bill.voucherNo || '',
        customerName: bill.customerName || bill.refName || '',
        date: bill.date || bill.voucherDate || ''
      })) : [];
      
      // Client-side search filtering if search term provided
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        items = items.filter(item => 
          item.voucherNo?.toLowerCase().includes(searchLower) ||
          item.customerName?.toLowerCase().includes(searchLower)
        );
      }
      
      return items;
    } catch (err) {
      console.error('Error fetching bill list:', err);
      return [];
    }
  };

  const fetchItemCodeList = async (search = '', page = 1, pageSize = 10) => {
    try {
      const params = {
        type: 'FG',
        page: page,
        pageSize: pageSize
      };
      
      if (search && search.trim().length > 0) {
        params.search = search;
      }
      
      const response = await axiosInstance.get(API_ENDPOINTS.PURCHASE_INVOICE.GET_ITEM_CODE_LIST, {
        params: params
      });
      
      const responseData = response?.data || {};
      const itemsData = responseData.data || [];
      
      let items = Array.isArray(itemsData) ? itemsData.map((item, index) => ({
        barcode: item.finalPrefix || '',
        itemcode: item.itemCode || '',
        name: item.itemName || '',
        stock: item.finalStock || '0',
        uom: item.units || '',
        hsn: item.hsn || '',
        preRT: item.preRate || '0',
        brand: item.brand || '',
        category: item.category || '',
        model: item.model || '',
        size: item.size || '',
        max: item.maxQty || '',
        min: item.minQty || '',
        type: item.type || '',
      })) : [];
      
      return items;
    } catch (err) {
      console.error('Error fetching item code list:', err);
      return [];
    }
  };

  // Fetch purchase details for editing
  const fetchPurchaseDetails = async (voucherNo) => {
    try {
      const compCode = userData?.companyCode || '001';
      
      console.log('Fetching purchase details for:', voucherNo, 'compCode:', compCode);
      
      const response = await axiosInstance.get(API_ENDPOINTS.PURCHASE_INVOICE.GET_PURCHASE_DETAILS, {
        params: {
          voucherNo: voucherNo,
          compCode: compCode
        }
      });
      
      console.log('Purchase details response:', response.data);
      
      const data = response.data;
      
      if (data) {
        const bledger = data.bledger || {};
        const iledger = data.iledger || [];
        const headerDetails = {
          invNo: bledger.voucherNo || '',
          billDate: bledger.voucherDate ? bledger.voucherDate.split('T')[0] : '',
          customerName: bledger.refName || '',
          amount: bledger.billAmount || '',
          partyCode: bledger.customerCode || '',
          gstno: iledger.cstsNo || '',
          city: iledger.add3 || '',
          mobileNo: iledger.add4 || '',
          transType: bledger.transType || 'PURCHASE',
          purNo: iledger.vrNo || '',
        };
        
        console.log('Setting header details:', headerDetails);
        setBillDetails(prev => ({ ...prev, ...headerDetails }));

        setAddLessAmount(iledger.less ?.toString() || '');
        setFreightAmount(iledger.fFreight ?.toString() || '');
        setChargesPercent(iledger.fExtPer ?.toString() || '');
        setChargesAmount(iledger.fExtAmt ?.toString() || '');

        // Set transport data from API
        if (iledger) {
          setTransportData({
            transportName: iledger.transportName || '',
            lrNo: iledger.fLrNo || '',
            lrDate: iledger.fLrDt ? (() => {
              // API format: 'dd-mm-yyyy HH:MM:SS' or 'dd-mm-yyyy'
              const dateTimeStr = iledger.fLrDt.split(' ')[0];
              const [dd, mm, yyyy] = dateTimeStr.split('-');
              if (dd && mm && yyyy) {
                // For input type="date", use yyyy-MM-dd
                const day = dd.padStart(2, '0');
                const month = mm.padStart(2, '0');
                return `${yyyy}-${month}-${day}`;
              }
              return '';
            })() : '',
            amount: iledger.fTrAmount || '',
            gstPercent: iledger.fTrTax || '',
            total: iledger.fTrTotal || ''
          });
        }

        let itemsData = [];
        
        if (data.items && Array.isArray(data.items)) {
          itemsData = data.items;
        } else if (data.iledger && Array.isArray(data.iledger)) {
          itemsData = data.iledger;
        }
        
        console.log('Items data found:', itemsData.length, 'items');
        
        if (itemsData.length > 0) {
          const formattedItems = itemsData.map((item, index) => ({
            id: index + 1,
            barcode: item.barcode || item.fid || '', 
            itemcode: item.itemCode || item.fItemCode || '',            
            name: item.itemname || item.fName || '',
            stock: item.stock || '',
            mrp: item.mrp || '',
            uom: item.fUnit || item.unit || '',
            hsn: item.fhsn || item.hsn || '',
            tax: item.fTax || item.tax || '',
            prate: item.rate || '',
            qty: item.qty || '',
            ovrwt: item.ovrWt || '',
            avgwt: item.avgWt || '',
            intax: item.inTax || '',
            outtax: item.outTax || '',
            acost: item.acost || '',
            sudo: item.sudo || '',
            profitPercent: item.profitPercent || '',
            preRT: item.preRate || '',
            sRate: item.sRate || '',
            asRate: item.asRate || '',
            letProfPer: item.letProfPer || '',
            ntCost: item.ntCost || '',
            wsPercent: item.wsPer || '',
            wsRate: item.wRate || '',
            amt: item.amount || '',
            min: '',
            max: ''
          }));
          
          console.log('Formatted items:', formattedItems);
          setItems(formattedItems);
        } else {
          console.log('No items found, resetting to default');
          setItems([{
            id: 1, 
            barcode: '', 
            name: '', 
            sub: '', 
            stock: '', 
            mrp: '', 
            uom: '', 
            hsn: '', 
            tax: '', 
            rate: '', 
            qty: '',
            ovrwt: '',
            avgwt: '',
            prate: '',
            intax: '',
            outtax: '',
            acost: '',
            sudo: '',
            profitPercent: '',
            preRT: '',
            sRate: '',
            asRate: '',
            letProfPer: '',
            ntCost: '',
            wsPercent: '',
            wsRate: '',
            amt: '',
            min: '',
            max: ''
          }]);
        }

        setIsEditMode(true);
        setEditingBillNo(voucherNo);
        setActiveTopAction('edit');
        console.log('Edit mode activated for voucher:', voucherNo);
        
        // 🔴 SET IGNORE ENTER FLAG
        ignoreNextEnterRef.current = true;
        
        // Add a new empty row for data entry
        const newRow = {
          id: (itemsData?.length || 0) + 2,
          barcode: '',
          name: '',
          sub: '',
          stock: '',
          mrp: '',
          uom: '',
          hsn: '',
          tax: '',
          rate: '',
          qty: '',
          ovrwt: '',
          avgwt: '',
          prate: '',
          intax: '',
          outtax: '',
          acost: '',
          sudo: '',
          profitPercent: '',
          preRT: '',
          sRate: '',
          asRate: '',
          letProfPer: '',
          ntCost: '',
          wsPercent: '',
          wsRate: '',
          amt: '',
          min: '',
          max: ''
        };
        
        // Add new row to items
        setItems(prevItems => [...prevItems, newRow]);
        
        // ✅ MOVE CURSOR TO NEW ROW'S NAME FIELD AFTER LOADING EDIT INVOICE
        setTimeout(() => {
          const newRowIndex = (itemsData?.length || 0);
          const nameInput = document.querySelector(
            `input[data-row="${newRowIndex}"][data-field="name"]`
          );
          if (nameInput) {
            nameInput.focus();
          }
          // Reset the flag after focus
          setTimeout(() => {
            ignoreNextEnterRef.current = false;
          }, 200);
        }, 300);
        
      } else {
        console.warn('No data received from API');
        showAlertConfirmation('No purchase data found', null, 'warning');
      }
    } catch (err) {
      console.error('Error fetching purchase details:', err);
      console.error('Error response:', err.response);
      showAlertConfirmation(`Failed to load purchase details: ${err.message}`, null, 'danger');
    }
  };

  const handleItemCodeSelect = (itemId, searchTerm = '') => {
    setSelectedRowId(itemId);
    setItemSearchTerm(searchTerm || '');
    setShowItemCodePopup(true);
  };

  // Handle Edit button click
  const handleEdit = () => {
    setPopupMode('edit');
    setShowBillListPopup(true);
  };

  // Handle Delete button click
  const handleDelete = () => {
    setPopupMode('delete');
    setShowBillListPopup(true);
  };

  // Handle bill selection from popup
  const handleBillSelect = (selectedBill) => {
    if (!selectedBill || !selectedBill.voucherNo) return;
    
    if (popupMode === 'edit') {
      fetchPurchaseDetails(selectedBill.voucherNo);
    } else if (popupMode === 'delete') {
      showConfirmation({
        title: 'Delete Purchase Invoice',
        message: `Do you want to delete ?`,
        onConfirm: () => {
          deletePurchaseBill(selectedBill.voucherNo);
        },
        type: 'danger',
        confirmText: 'Yes',
        cancelText: 'No'
      });
    }
    
    setShowBillListPopup(false);
    setPopupMode('');
  };

  const handleItemCodeSelection = async (selectedItem) => {
    if (!selectedItem || !selectedItem.itemcode) return;
    
    setShowItemCodePopup(false);
    
    try {
      // Fetch stock details from GET_ITEM_DETAILS_BY_CODE API using itemcode
      const stockResponse = await axiosInstance.get(
        API_ENDPOINTS.PURCHASE_INVOICE.GET_ITEM_DETAILS_BY_CODE(selectedItem.itemcode)
      );
      
      const stockData = stockResponse?.data || {};
      
      console.log('Stock API response:', stockData);
      
      setItems(prevItems => {
        return prevItems.map(item => {
          if (item.id === selectedRowId) {
            const updatedItem = {
              id: item.id, // Preserve ID
              barcode: selectedItem.barcode || '',
              itemcode: selectedItem.itemcode || '',
              name: stockData.itemName || selectedItem.name || '',
              stock: stockData.finalStock || '0',
              uom: selectedItem.uom || '',
              hsn: selectedItem.hsn || '',
              preRT: (selectedItem.preRT || '0').toString(),
              prate: (selectedItem.preRT || '0').toString(),
              brand: stockData.brand || '',
              category: stockData.category || '',
              model: stockData.model || '',
              size: stockData.size || '',
              max: stockData.max || '',
              min: stockData.min || '',
              type: stockData.type || '',
              // Reset all other fields to blank
              sub: '',
              mrp: '',
              tax: stockData.tax || '',
              rate: '',
              qty: '1', // Default to 1 for new selection
              ovrwt: '',
              avgwt: '',
              intax: stockData.tax || '',
              outtax: '',
              acost: '',
              sudo: '',
              profitPercent: '',
              sRate: '',
              asRate: '',
              letProfPer: '',
              ntCost: '',
              wsPercent: '',
              wsRate: '',
              amt: ''
            };
            return calculateItem(updatedItem);
          }
          return item;
        });
      });
    } catch (error) {
      console.error('Error in handleItemCodeSelection:', error);
      
      setItems(prevItems => {
        return prevItems.map(item => {
          if (item.id === selectedRowId) {
            const updatedItem = {
              id: item.id,
              barcode: selectedItem.barcode || '',
              itemcode: selectedItem.itemcode || '',
              name: selectedItem.name || '',
              uom: selectedItem.uom || '',
              hsn: selectedItem.hsn || '',
              preRT: (selectedItem.preRT || '0').toString(),
              prate: (selectedItem.preRT || '0').toString(),
              // Reset all other fields
              sub: '',
              stock: '0',
              mrp: '',
              tax: '',
              rate: '',
              qty: '1',
              ovrwt: '',
              avgwt: '',
              intax: '',
              outtax: '',
              acost: '',
              sudo: '',
              profitPercent: '',
              sRate: '',
              asRate: '',
              letProfPer: '',
              ntCost: '',
              wsPercent: '',
              wsRate: '',
              amt: '',
              min: '',
              max: ''
            };
            return calculateItem(updatedItem);
          }
          return item;
        });
      });
    } finally {
      setSelectedRowId(null);
      setItemSearchTerm('');
    }
  };

const handleGroupItemCodeSelection = async (selectedItem) => {
  if (!selectedItem) {
    console.log('No item selected');
    return;
  }
  
  setShowGroupNamePopup(false);
  
  try {
    const groupCode = selectedItem.fparent || '';
    
    console.log('Extracted group code:', groupCode);
    
    if (!groupCode) {
      showAlertConfirmation('No group code found in selected item', null, 'warning');
      return;
    }
    
    // Build the API URL
    const apiUrl = API_ENDPOINTS.PURCHASE_INVOICE.GET_GROUPITEMS_BY_GROUP(groupCode);
    
    // Fetch items for the selected group
    const response = await axiosInstance.get(apiUrl);
    const itemsArray = response?.data || [];
    
    if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
      showAlertConfirmation('No items found in this group', null, 'warning');
      return;
    }
    
    // Get current items and filter out COMPLETELY empty rows
    const currentItems = items.filter(item => {
      // Check if row has any meaningful data
      const hasData = 
        (item.name && item.name.trim() !== '') ||
        (item.itemcode && item.itemcode.trim() !== '') ||
        (item.barcode && item.barcode.trim() !== '') ||
        (parseFloat(item.qty) > 0) ||
        (parseFloat(item.prate) > 0);
      
      return hasData;
    });
    
    // If ALL rows are empty, we'll start fresh
    const isEmptyTable = currentItems.length === 0;
    
    // Find the highest ID
    const maxId = currentItems.length > 0 
      ? Math.max(...currentItems.map(item => item.id))
      : 0;
    
    // Format new items
    const formattedItems = itemsArray.map((item, index) => {
      const qty = 1; // Default quantity
      const prate = parseFloat(item.previousRate) || 0;
      
      return {
        id: maxId + index + 1,
        barcode: item.prefix || '',
        itemcode: item.itemCode || '',
        name: item.itemName || '',
        stock: item.stock || 0,
        intax: item.tax || '',
        uom: item.units || '',
        hsn: item.hsn || '',
        preRT: prate.toString(),
        prate: prate.toString(),
        // Add other fields with defaults
        sub: '',
        mrp: '',
        tax: '',
        rate: '',
        qty: qty.toString(),
        ovrwt: '',
        avgwt: '',
        outtax: '',
        acost: '',
        sudo: '',
        profitPercent: '',
        sRate: '',
        asRate: '',
        letProfPer: '',
        ntCost: '',
        wsPercent: '',
        wsRate: '',
        amt: '',
        min: '',
        max: ''
      };
    });
    
    // If table was empty, replace with new items
    // Otherwise, append to existing valid items
    const mergedItems = isEmptyTable 
      ? formattedItems 
      : [...currentItems, ...formattedItems];
    
    console.log('Table was empty:', isEmptyTable);
    console.log('Merged items count:', mergedItems.length);
    
    // Set the merged items
    setItems(mergedItems);
    
    // Update the group name in the header
    setBillDetails(prev => ({
      ...prev,
      groupName: selectedItem.fItemName || selectedItem.itemName || selectedItem.name || ''
    }));
    
    // Focus logic
    setTimeout(() => {
      if (isEmptyTable) {
        // Focus on first item if table was empty
        const nameInput = document.querySelector(
          `input[data-row="0"][data-field="name"]`
        );
        if (nameInput) nameInput.focus();
      } else {
        // Focus on first new item if appended
        const firstNewRowIndex = currentItems.length;
        const nameInput = document.querySelector(
          `input[data-row="${firstNewRowIndex}"][data-field="name"]`
        );
        if (nameInput) nameInput.focus();
      }
    }, 100);
    
  } catch (error) {
    console.error('Error fetching group items:', error);
    console.error('Error details:', error.response?.data);
    
    showAlertConfirmation(
      `Failed to load group items: ${error.message}`,
      null,
      'danger'
    );
  } finally {
    setItemSearchTerm('');
  }
};

  // Delete purchase bill
  const deletePurchaseBill = async (voucherNo) => {
    try {
      const compCode = userData?.companyCode || '001';
      const username = userData?.username || '';
      
      if (!voucherNo) {
        showAlertConfirmation('No purchase invoice selected for deletion', null, 'warning');
        return;
      }
      
      console.log('Deleting purchase invoice:', { voucherNo, compCode, username });
      
      setIsLoading(true);
      
      const response = await axiosInstance.delete(
        API_ENDPOINTS.PURCHASE_INVOICE.DELETE_PURCHASE_INVOICE,
        {
          params: {
            voucherNo: voucherNo,
            compCode: compCode,
            user: compCode
          }
        }
      );

      if (response.status === 200 || response.status === 204) {
        createNewForm();
      } else {
        throw new Error(`Delete failed with status: ${response.status}`);
      }
      
    } catch (err) {
      console.error('Delete error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to delete purchase invoice';
      
      showAlertConfirmation(`Delete failed: ${errorMessage}`, null, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset scroll position on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch next invoice number and auto barcode on mount
  useEffect(() => {
    fetchNextInvNo();
    fetchAutoBarcode();
  }, [userData]);

  useEffect(() => {
    if (dateRef.current && activeTopAction !== "delete") {
      dateRef.current.focus();
    }
  }, [activeTopAction]);

  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      const isDesktop = width >= 1024;
      
      setScreenSize({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate Totals whenever items, addLessAmount, or chargesAmount change
  useEffect(() => {
    const { net, gstTotals } = calculateTotals(items);
    const addLessValue = parseFloat(addLessAmount) || 0;
    const chargesAmt = parseFloat(chargesAmount) || 0;
    const finalTotal = net + addLessValue + chargesAmt;
    setNetTotal(finalTotal);
    setGstTotal(gstTotals);
  }, [items, addLessAmount, chargesAmount]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillDetails(prev => ({ ...prev, [name]: value }));
  };

  const fetchSupplierItems = async (pageNum = 1, search = '') => {
    const url = API_ENDPOINTS.PURCHASE_INVOICE.SUPPLIER_LIST(search || '', pageNum, 20);
    const res = await axiosInstance.get(url);
    const data = res?.data || [];
    return Array.isArray(data) ? data : [];
  };

const fetchGroupNameItems = async (pageNum = 1, search = '') => {
  try {
    const url = API_ENDPOINTS.PURCHASE_INVOICE.GET_GROUP_LIST(search || '', pageNum, 20);
    const res = await axiosInstance.get(url);
    const responseData = res?.data || {};
    
    const data = responseData.data || [];
    
    const mappedData = Array.isArray(data) ? data.map(item => ({
      id: item.fItemcode || item.id,
      fItemcode: item.fItemcode || '',
      fItemName: item.fItemName || item.name || '',
      fparent: item.fparent || ''
    })) : [];
    
    return mappedData;
  } catch (err) {
    return [];
  }
};

  // Handle Enter Key Navigation and Arrow Keys for Header Fields
  const handleKeyDown = (e, nextRef, fieldName = '') => {
    // If we're ignoring Enter (just loaded edit invoice), prevent default
    if (ignoreNextEnterRef.current && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();

      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
      return;
    }
    
    // Handle Right arrow - move to next field
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
      return;
    }
    
    // Handle Left arrow - move to previous field
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      // Get all header input refs in order
      const headerRefs = [
        { ref: billNoRef, name: 'invNo' },
        { ref: dateRef, name: 'billDate' },
        { ref: purNoRef, name: 'purNo' },
        { ref: invoiceNoRef, name: 'invoiceNo' },
        { ref: purDateRef, name: 'purDate' },
        { ref: nameRef, name: 'customerName' },
        { ref: cityRef, name: 'city' },
        { ref: mobileRef, name: 'mobileNo' },
        { ref: gstNoRef, name: 'gstno' },
        { ref: gstTypeRef, name: 'gstType' }
      ];
      
      // Find current field position
      const currentIndex = headerRefs.findIndex(h => h.name === fieldName);
      
      // Navigate to previous field
      if (currentIndex > 0) {
        const prevRef = headerRefs[currentIndex - 1].ref;
        if (prevRef && prevRef.current) {
          prevRef.current.focus();
        }
      }
      return;
    }
  };

  const handleAddItem = () => {
    if (!billDetails.barcodeInput) {
      showAlertConfirmation(
        "Please enter barcode",
        () => {
          if (barcodeRef.current) barcodeRef.current.focus();
        },
        'warning'
      );
      return;
    }
    
    const newItem = {
      id: items.length + 1,
      barcode: billDetails.barcodeInput,
      name: 'Fauget Cafe',
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
    if (barcodeRef.current) barcodeRef.current.focus();
  };

  const handleAddRow = (focusField = 'name') => {
    setItems(prevItems => {
       const lastRow = prevItems[prevItems.length - 1];

      // 🛑 Safety net
      if (!lastRow?.name || lastRow.name.trim() === '') {
        return prevItems;
      }
      const newRowIndex = prevItems.length;

      const newRow = {
        id: prevItems.length + 1,
        barcode: '',
        name: '',
        sub: '',
        stock: '',
        mrp: '',
        uom: '',
        hsn: '',
        tax: '',
        rate: '',
        qty: '',
        ovrwt: '',
        avgwt: '',
        prate: '',
        intax: '',
        outtax: '',
        acost: '',
        sudo: '',
        profitPercent: '',
        preRT: '',
        sRate: '',
        asRate: '',
        letProfPer: '',
        ntCost: '',
        wsPercent: '',
        wsRate: '',
        amt: '',
        min: '',
        max: ''
      };

      // 🔑 Focus AFTER state update
      setTimeout(() => {
        const input = document.querySelector(
          `input[data-row="${newRowIndex}"][data-field="${focusField}"]`
        );
        if (input) input.focus();
      }, 0);

      return [...prevItems, newRow];
    });
  };

  const calculateItem = (item) => {
    const qty       = Number(item.qty) || 0;
    const ovrwt     = Number(item.ovrwt) || 0;
    const prate     = Number(item.prate) || 0;
    const asRate    = Number(item.asRate) || 0;
    const intax     = Number(item.intax) || 0;
    const wsPercent = Number(item.wsPercent) || 0;
    
    console.log(chargesAmount)
    let acost = 0;  
    let ntCost = 0;
    let amt = 0;

    /* ---------- PROFIT % ---------- */
    const fseudoMap = userData?.fseudo || fseudo || {};
    const letterToNum = Object.values(fseudoMap).reduce((a, l, i) => {
      if (typeof l === "string") a[l.toLowerCase()] = i;
      return a;
    }, {});

    const profitPercent = item.sudo?.trim()
      ? Number(
          item.sudo
            .toLowerCase()
            .split("")
            .map(c => letterToNum[c] ?? "")
            .join("")
        ) || 0
      : Number(item.profitPercent) || 0;

    /* ---------- CORE ---------- */
    let avgwt = 0;

    if (ovrwt > 0) {
      avgwt = qty ? ovrwt / qty : 0;
      acost = (avgwt * prate)+Number(chargesAmount || 0);
      ntCost = acost;
      amt = ovrwt * prate;
    } else {
      // 🔑 PRate-only calculation
      acost = prate+Number(chargesAmount|| 0);
      ntCost = prate;
      amt = qty * prate;
    }

    // Tax
    amt = amt + (amt * intax) / 100;

    const sRate = acost + (acost * profitPercent) / 100;
    const letProfPer = acost ? ((asRate - acost) / acost) * 100 : 0;
    const wsRate = ntCost + (ntCost * wsPercent) / 100;

    return {
      ...item,
      avgwt: avgwt ? avgwt.toFixed(2) : "",
      acost: acost.toFixed(2),
      ntCost: ntCost.toFixed(2),
      sRate: sRate.toFixed(2),
      letProfPer: letProfPer.toFixed(2),
      wsRate: wsRate.toFixed(2),
      amt: amt.toFixed(2),
      profitPercent
    };
  };

  useEffect(() => {
    setItems(prevItems =>
      prevItems.map(item => calculateItem(item))
    );
  }, [chargesAmount]);
  const handleItemChange = (id, field, value) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          return calculateItem(updatedItem);
        }
        return item;
      })
    );
  };

  // Handle UOM spacebar cycling (same as SalesInvoice)
  const handleUomSpacebar = (e, id, index) => {
    if (e.key === ' ') {
      e.preventDefault();
      
      const uomValues = ['pcs', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'mm'];
      const currentItem = items.find(item => item.id === id);
      const currentUom = currentItem?.uom || '';
      let nextUom = 'pcs';
      
      if (currentUom && currentUom.trim() !== '') {
        const currentIndex = uomValues.indexOf(currentUom.toLowerCase());
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % uomValues.length;
          nextUom = uomValues[nextIndex];
        } else {
          nextUom = 'pcs';
        }
      } else {
        nextUom = 'pcs';
      }
      
      setItems(items.map(item => {
        if (item.id === id) {
          return {
            ...item,
            uom: nextUom
          };
        }
        return item;
      }));
      
      setFocusedUomField(id);
      setTimeout(() => {
        setFocusedUomField(null);
      }, 300);
      
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      const hsnInput = document.querySelector(`input[data-row="${index}"][data-field="hsn"]`);
      if (hsnInput) {
        hsnInput.focus();
        return;
      }
    }
  };

  const fetchTax = async () => {
    try {
      const url = API_ENDPOINTS.Scrap_Procurement.GET_TAX_LIST;
      const res = await axiosInstance.get(url);
      const data = res?.data?.data || [];
      const formatted = data
        .map(t => ({
          id: t.fcode,
          tax: Number(t.ftaxName),
          displayName: t.ftaxName
        }))
        .filter(t => !isNaN(t.tax));
      setAllTax(formatted);
    } catch (error) {
      console.error("Tax fetch failed:", error);
      setAllTax([]);
    }
  };

  useEffect(() => {
    fetchTax();
  }, []);

  // Update the handleTableKeyDown function
  const handleTableKeyDown = (e, currentRowIndex, currentField) => {
    // Handle / key for item code search popup
    if (e.key === '/') {
      e.preventDefault();
      handleItemCodeSelect(items[currentRowIndex].id, items[currentRowIndex].name);
      return;
    }

    // Fields in the visual order
    const fields = [
      'barcode', 'name', 'uom', 'stock', 'hsn', 'qty', 'ovrwt', 'avgwt',
      'prate', 'intax', 'outtax', 'acost', 'sudo', 'profitPercent', 'preRT', 
      'sRate', 'asRate', 'mrp', 'letProfPer', 'ntCost', 'wsPercent', 'wsRate', 'amt'
    ];

    const currentFieldIndex = fields.indexOf(currentField);

    // Handle Right arrow - move to next field in the same row
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        
        const nextInput = document.querySelector(
          `input[data-row="${currentRowIndex}"][data-field="${nextField}"], 
           select[data-row="${currentRowIndex}"][data-field="${nextField}"]`
        );
        if (nextInput) {
          nextInput.focus();
          if (nextInput.tagName === 'INPUT') {
            nextInput.select();
          }
        }
      }
      return;
    }

    // Handle Left arrow - move to previous field in the same row
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentFieldIndex > 0) {
        const prevField = fields[currentFieldIndex - 1];
        const prevInput = document.querySelector(
          `input[data-row="${currentRowIndex}"][data-field="${prevField}"], 
           select[data-row="${currentRowIndex}"][data-field="${prevField}"]`
        );
        if (prevInput) {
          prevInput.focus();
          if (prevInput.tagName === 'INPUT') {
            prevInput.select();
          }
        }
      }
      return;
    }

    // Handle Up arrow - move to the same field in the row above
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentRowIndex > 0) {
        const prevRowInput = document.querySelector(
          `input[data-row="${currentRowIndex - 1}"][data-field="${currentField}"], 
           select[data-row="${currentRowIndex - 1}"][data-field="${currentField}"]`
        );
        if (prevRowInput) {
          prevRowInput.focus();
          if (prevRowInput.tagName === 'INPUT') {
            prevRowInput.select();
          }
        }
      }
      return;
    }

    // Handle Down arrow - move to the same field in the row below
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentRowIndex < items.length - 1) {
        const nextRowInput = document.querySelector(
          `input[data-row="${currentRowIndex + 1}"][data-field="${currentField}"], 
           select[data-row="${currentRowIndex + 1}"][data-field="${currentField}"]`
        );
        if (nextRowInput) {
          nextRowInput.focus();
          if (nextRowInput.tagName === 'INPUT') {
            nextRowInput.select();
          }
        }
      }
      return;
    }

   if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();

    const isLastRow = currentRowIndex === items.length - 1;
    const isLastField = currentField === 'amt';

    // 👉 CASE 1: AMT + NOT last row → go to next row NAME
    if (isLastField && !isLastRow) {
      const nextRowName = document.querySelector(
        `input[data-row="${currentRowIndex + 1}"][data-field="name"]`
      );
      if (nextRowName) {
        nextRowName.focus();
        nextRowName.select();
      }
      return;
    }

    // 👉 CASE 2: LAST row + LAST field → add new row
    if (isLastField && isLastRow) {
      const currentRow = items[currentRowIndex];

      // 🚫 Block empty name
      if (!currentRow?.name || currentRow.name.trim() === '') {
        const nameInput = document.querySelector(
          `input[data-row="${currentRowIndex}"][data-field="name"]`
        );
        if (nameInput) {
          nameInput.focus();
          nameInput.select();
        }
        return;
      }

      handleAddRow('name');
      return;
    }

    // 👉 CASE 3: Normal fields → move RIGHT
    if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
      const nextField = fields[currentFieldIndex + 1];
      const nextInput = document.querySelector(
        `input[data-row="${currentRowIndex}"][data-field="${nextField}"],
         select[data-row="${currentRowIndex}"][data-field="${nextField}"]`
      );

      if (nextInput) {
        nextInput.focus();
        if (nextInput.tagName === 'INPUT') nextInput.select();
      }
    }
  }
  };

  const handleClear = () => {
    showConfirmation({
      title: 'Clear All',
      message: 'Do you want to clear ?',
      onConfirm: () => {
        createNewForm();
      },
      type: 'warning',
      confirmText: 'Yes',
      cancelText: 'No'
    });
  };

  const handleSave = () => {
    try {
      const compCode = (userData && userData.companyCode) ? userData.companyCode : '001';
      const username = (userData && userData.username) ? userData.username : '';

      const toNumber = (v) => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : 0;
      };

      const toISODate = (d) => {
        try {
          if (!d) return new Date().toISOString();
          const date = new Date(d);
          return date.toISOString();
        } catch {
          return new Date().toISOString();
        }
      };

      const voucherNo = billDetails.invNo || '';
      if (!voucherNo) {
        showAlertConfirmation('Please enter an Invoice Number', null, 'warning');
        return;
      }

      if (!billDetails.customerName || billDetails.customerName.trim() === '') {
        showAlertConfirmation('Customer Name is required', null, 'warning');
        return;
      }

      // Validation: Check if at least one row has item data
      const hasValidItems = items.some(item =>         
        item.name && item.name.trim() !== ''
      );

      if (!hasValidItems) {
        showAlertConfirmation('Please add at least one item before saving', null, 'warning');
        return;
      }

      // Validation: Ensure quantity is entered (>0) for any item with a name or itemcode
      const invalidQtyIndex = items.findIndex(it => {
        const hasItem = (it.itemcode && it.itemcode.toString().trim() !== '') || (it.name && it.name.toString().trim() !== '');
        const qtyNum = Number(it.qty);
        return hasItem && (!it.qty || Number.isNaN(qtyNum) || qtyNum <= 0);
      });

      if (invalidQtyIndex !== -1) {
        showAlertConfirmation('Please enter quantity for all items before saving', () => {
          // Focus the qty input for the first invalid row
          setTimeout(() => {
            const qtyInput = document.querySelector(`input[data-row="${invalidQtyIndex}"][data-field="qty"]`);
            if (qtyInput) {
              qtyInput.focus();
              qtyInput.select && qtyInput.select();
            }
          }, 100);
        }, 'warning');
        return;
      }

      const voucherDateISO = toISODate(billDetails.billDate || billDetails.purDate);
      const totals = calculateTotals(items);

      // Prepare barcode generator for empty barcodes: returns current then increments
      const createBarcodeGenerator = (start) => {
        const s = String(start || '');
        const m = s.match(/(\d+)$/);
        if (!m) {
          // No trailing number: use numeric counter starting at 1 with width 6
          let counter = 1;
          const width = 6;
          return () => String(counter++).padStart(width, '0');
        }
        const numStr = m[1];
        const prefix = s.slice(0, -numStr.length);
        let counter = parseInt(numStr, 10);
        const width = numStr.length;
        return () => {
          const current = prefix + String(counter).padStart(width, '0');
          counter += 1;
          return current;
        };
      };

      const nextBarcode = createBarcodeGenerator(autoBarcode);

      const payload = {
        bledger: {
          customerCode: billDetails.partyCode || '',
          voucherNo: voucherNo,
          voucherDate: voucherDateISO,
          billAmount: totals.net + (parseFloat(chargesAmount) || 0),
          balanceAmount: totals.net + (parseFloat(chargesAmount) || 0),
          subTotal: totals.subTotal,
          refName: billDetails.customerName || '',
          compCode: compCode,
          user: compCode,
          gstType: billDetails.gstType || 'G',
        },
        iledger: {
          vrNo: billDetails.purNo,
          less: parseFloat(addLessAmount) || 0,
          fFreight: (freightAmount ?? '0').toString(),
          fExtPer: (chargesPercent ?? '0').toString(),
          fExtAmt: (chargesAmount ?? '0').toString(),
          fTRans: (transportData.transportCode ?? '').toString(),
          fLrNo: transportData.lrNo || '',
          fLrDt: toISODate(transportData.lrDate),
          fTrAmount: (transportData.amount ?? '').toString(),
          fTrTax: (transportData.gstPercent ?? '').toString(),
          fTrTotal: (transportData.total ?? '').toString(),
          subTotal: totals.subTotal,
          total: totals.total,
          net: totals.net,
          add1: '',
          add2: '',
          cstsNo: billDetails.gstno || '',
          add3: billDetails.city || '',
          add4: billDetails.mobileNo || '',
        },
        items: items
          .filter((it) => it.itemcode && it.itemcode.trim() !== '')
          .map((it) => ({
            barcode: (it.barcode && String(it.barcode).trim()) ? it.barcode : nextBarcode(),
            itemCode: it.itemcode || '',
            qty: toNumber(it.qty),
            rate: toNumber(it.prate),
            amount: toNumber(it.amt),
            fTax: toNumber(it.tax),
            wRate: toNumber(it.wsRate),
            fid: String(it.id || ''),
            fUnit: it.uom || '',
            fhsn: it.hsn || '',
            ovrWt: toNumber(it.ovrwt),
            avgWt: toNumber(it.avgwt),
            inTax: toNumber(it.intax),
            outTax: toNumber(it.outtax),
            acost: toNumber(it.acost),
            sudo: it.sudo || '',
            profitPercent: toNumber(it.profitPercent),
            preRate: toNumber(it.preRT),
            sRate: toNumber(it.sRate),
            asRate: toNumber(it.asRate)|| toNumber(it.sRate),
            mrp: toNumber(it.mrp),
            letProfPer: toNumber(it.letProfPer),
            ntCost: toNumber(it.ntCost),
            wsPer: toNumber(it.wsPercent),
          })),
      };
      
      const purchaseType = isEditMode ? 'false' : 'true';
      
      console.log(`Saving in ${isEditMode ? 'edit' : 'create'} mode`, JSON.stringify(payload));
      
      showConfirmation({
        title: isEditMode ? 'Update Purchase Invoice' : 'Create Purchase Invoice',
        message: `Do you want to ${isEditMode ? 'modify' : 'save'} ?`,
        onConfirm: async () => {
          setIsLoading(true);
          try {
            const res = await axiosInstance.post(
              API_ENDPOINTS.PURCHASE_INVOICE.CREATE_PURCHASE_INVOICE(purchaseType), 
              payload
            );
            createNewForm();
            console.log('Save response:', res);
            
            // Close the confirmation popup first
            setShowConfirmPopup(false);
            
            // Show success message and reset form
            showAlertConfirmation(
              `Purchase ${isEditMode ? 'update' : 'save'} successfully`,
              'warning'
            );
            
          } catch (err) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            const message = typeof data === 'string' ? data : data?.message || data?.error || err?.message;
            console.warn(`Create/Update Purchase failed:`, { status, data, err });
            
            showAlertConfirmation(
              `Failed to ${isEditMode ? 'update' : 'save'} purchase${message ? `: ${message}` : ''}`,
              null,
              'danger'
            );
          } finally {
            setIsLoading(false);
          }
        },
        type: isEditMode ? 'warning' : 'success',
        confirmText: isEditMode ? 'Yes' : 'Yes',
        cancelText: 'No',
        showLoading: false
      });
      
    } catch (e) {
      console.warn('Save error:', e);
      showAlertConfirmation('Failed to save purchase', null, 'danger');
    }
  };

  const handlePrint = () => {
    showAlertConfirmation('Print functionality to be implemented', null, 'info');
  };

  // Handle delete row
  const handleDeleteRow = (id) => {
    if (items.length <= 1) {
      showConfirmation({
        title: 'Clear First Row',
        message: 'Do you want to clear?',
        onConfirm: () => {
          setItems([
            {
              id: 1, 
              barcode: '', 
              name: '', 
              sub: '', 
              stock: '', 
              mrp: '', 
              uom: '', 
              hsn: '', 
              tax: '', 
              rate: '', 
              qty: '',
              ovrwt: '',
              avgwt: '',
              prate: '',
              intax: '',
              outtax: '',
              acost: '',
              sudo: '',
              profitPercent: '',
              preRT: '',
              sRate: '',
              asRate: '',
              letProfPer: '',
              ntCost: '',
              wsPercent: '',
              wsRate: '',
              amt: '',
              min: '',
              max: ''
            }
          ]);
        },
        type: 'danger',
        confirmText: 'Yes',
        cancelText: 'No'
      });
      return;
    }
    
    // Find the index of the row being deleted
    const deleteIndex = items.findIndex(item => item.id === id);
    
    showConfirmation({
      title: 'Delete Row',
      message: 'Are you sure you want to delete this row?',
      onConfirm: () => {
        // Filter out the deleted row
        const newItems = items.filter(item => item.id !== id);
        
        // Reassign IDs sequentially starting from 1
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          id: index + 1
        }));
        
        // Update the items state
        setItems(updatedItems);
        
        // Focus logic based on which row was deleted
        setTimeout(() => {
          if (deleteIndex === 0) {
            // If first row was deleted, focus on new first row's name field
            const nameInput = document.querySelector(
              `input[data-row="0"][data-field="name"]`
            );
            if (nameInput) {
              nameInput.focus();
              nameInput.select();
            }
          } else if (deleteIndex === items.length - 1) {
            // If last row was deleted, focus on the new last row
            const newLastIndex = updatedItems.length - 1;
            const nameInput = document.querySelector(
              `input[data-row="${newLastIndex}"][data-field="name"]`
            );
            if (nameInput) {
              nameInput.focus();
              nameInput.select();
            }
          } else {
            // If a middle row was deleted, focus on the row at the same index
            const nameInput = document.querySelector(
              `input[data-row="${deleteIndex}"][data-field="name"]`
            );
            if (nameInput) {
              nameInput.focus();
              nameInput.select();
            }
          }
        }, 0);
      },
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  };

  // --- RESPONSIVE STYLES ---
  const TYPOGRAPHY = {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: screenSize.isMobile ? '11px' : screenSize.isTablet ? '12px' : '13px',
      sm: screenSize.isMobile ? '12px' : screenSize.isTablet ? '13px' : '14px',
      base: screenSize.isMobile ? '13px' : screenSize.isTablet ? '14px' : '16px',
      lg: screenSize.isMobile ? '14px' : screenSize.isTablet ? '16px' : '18px',
      xl: screenSize.isMobile ? '16px' : screenSize.isTablet ? '18px' : '20px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6
    }
  };

  const styles = {
    container: {
      fontFamily: TYPOGRAPHY.fontFamily,
      position: screenSize.isMobile ? "" : "fixed",
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#f5f7fa',
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflowX: 'hidden',
      overflowY: 'hidden',
    },
    headerSection: {
      flex: '0 0 auto',
      backgroundColor: 'white',
      borderRadius: 0,
      padding: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '16px',
      margin: 0,
      marginBottom: 0,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflowY: 'visible',
      maxHeight: 'none',
    },
    tableSection: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
    },
    formRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    formField: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '10px' : screenSize.isTablet ? '8px' : '10px',
      marginBottom: screenSize.isMobile ? '4px' : '0',
      flexWrap: 'wrap',
    },
    inlineLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#333',
      minWidth: screenSize.isMobile ? '70px' : screenSize.isTablet ? '75px' : '85px',
      width: screenSize.isMobile ? '70px' : screenSize.isTablet ? '75px' : '85px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      paddingTop: '2px',
    },
    focusedInput: {
      boxShadow: '0 0 0 1px #1B91DA',
    },
    
    inlineInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '5px 6px' : screenSize.isTablet ? '6px 8px' : '8px 10px',
      border: '1px solid #ddd',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
      width: '100%',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '80px' : '100px',
      ':hover': {
        borderColor: '#b3b3b3',
      },
    },
    
    gridRow: {
      display: screenSize.isMobile ? 'block' : 'grid',
      gap: '5px',
      marginBottom: 5,
      gridTemplateColumns: screenSize.isMobile
        ? '1fr'
        : screenSize.isTablet
        ? 'repeat(4, 1fr)'
        : 'repeat(6, 1fr)',
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      overflowX: 'auto',
      overflowY: 'auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      margin: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginTop: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginBottom: screenSize.isMobile ? '70px' : screenSize.isTablet ? '80px' : '90px',
      WebkitOverflowScrolling: 'touch',
      width: screenSize.isMobile ? 'calc(100% - 12px)' : screenSize.isTablet ? 'calc(100% - 20px)' : 'calc(100% - 32px)',
      boxSizing: 'border-box',
      flex: 'none',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: screenSize.isMobile ? '300px' : screenSize.isTablet ? '350px' : '400px',
      minHeight: screenSize.isMobile ? '200px' : screenSize.isTablet ? '250px' : '70%',
    },
    table: {
      width: 'max-content',
      minWidth: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
    },
    th: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      backgroundColor: '#1B91DA', 
      color: 'white',
      padding: screenSize.isMobile ? '5px 3px' : screenSize.isTablet ? '7px 5px' : '10px 6px',
      textAlign: 'center',
      letterSpacing: '0.5px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      border: '1px solid white',
      borderBottom: '2px solid white',
      minWidth: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
      whiteSpace: 'nowrap',
      width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
      maxWidth: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
    },
    td: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: 0,
      textAlign: 'center',
      border: '1px solid #ccc',
      color: '#333',
      minWidth: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
      width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
      maxWidth: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
    },
    editableInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      display: 'block',
      width: '100%',
      height: '100%',
      minHeight: screenSize.isMobile ? '26px' : screenSize.isTablet ? '30px' : '32px',
      padding: screenSize.isMobile ? '2px 3px' : screenSize.isTablet ? '3px 5px' : '4px 6px',
      boxSizing: 'border-box',
      border: 'none',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      textAlign: 'center',
      backgroundColor: 'transparent',
      outline: 'none',
      transition: 'border-color 0.2s ease',
    },
    editableInputFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      display: 'block',
      width: '100%',
      height: '100%',
      minHeight: screenSize.isMobile ? '26px' : screenSize.isTablet ? '30px' : '32px',
      padding: screenSize.isMobile ? '2px 3px' : screenSize.isTablet ? '3px 5px' : '4px 6px',
      boxSizing: 'border-box',
      border: '2px solid #1B91DA',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      textAlign: 'center',
      backgroundColor: 'white',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
    },
    
    editableInputClickable: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      display: 'block',
      width: '100%',
      height: '100%',
      minHeight: screenSize.isMobile ? '26px' : screenSize.isTablet ? '30px' : '32px',
      padding: screenSize.isMobile ? '2px 3px' : screenSize.isTablet ? '3px 5px' : '4px 6px',
      boxSizing: 'border-box',
      border: 'none',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      textAlign: 'center',
      backgroundColor: 'transparent',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      cursor: 'pointer',
    },
    
    editableInputClickableFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      display: 'block',
      width: '100%',
      height: '100%',
      minHeight: screenSize.isMobile ? '26px' : screenSize.isTablet ? '30px' : '32px',
      padding: screenSize.isMobile ? '2px 3px' : screenSize.isTablet ? '3px 5px' : '4px 6px',
      boxSizing: 'border-box',
      border: '2px solid #1B91DA',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      textAlign: 'center',
      backgroundColor: 'white',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      cursor: 'pointer',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
    },
    tableFooterContainer: {
    position: 'relative',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#e8f4fc',
    borderTop: '0px solid #1B91DA',
    zIndex: 50,
    marginTop: 'auto',
    width: '100%',
  },

  tableFooter: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#e8f4fc',
    tableLayout: 'fixed',
  },

  tableFooterCell: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    padding: screenSize.isMobile ? '8px 5px' : screenSize.isTablet ? '10px 8px' : '2px 10px',
    textAlign: 'center',
    border: '1px solid #ccc',
    backgroundColor: '#e8f4fc',
    color: '#333',
    minWidth: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
    width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
    maxWidth: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px',
    height: screenSize.isMobile ? '20px' : screenSize.isTablet ? '25px' : '20px',
    boxSizing: 'border-box',
  },

    itemNameContainer: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      textAlign: 'left',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '15px',
      minWidth: screenSize.isMobile ? '100px' : screenSize.isTablet ? '150px' : '200px',
      width: screenSize.isMobile ? '100px' : screenSize.isTablet ? '150px' : '200px',
      maxWidth: screenSize.isMobile ? '100px' : screenSize.isTablet ? '150px' : '200px',
    },
    footerSection: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: screenSize.isMobile ? 'row' : 'row',
      alignItems: 'center',
      padding: screenSize.isMobile ? '3px 4px' : screenSize.isTablet ? '8px 6px' : '8px 10px',
      backgroundColor: 'white',
      borderTop: '2px solid #e0e0e0',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
      gap: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '10px',
      flexWrap: screenSize.isDesktop ? 'nowrap' : 'wrap',
      flexShrink: 0,
      minHeight: screenSize.isMobile ? '40px' : screenSize.isTablet ? '48px' : '55px',
      width: '100%',
      boxSizing: 'border-box',
      zIndex: 100,
      justifyContent: 'space-between'
    },
    netBox: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: screenSize.isMobile ? TYPOGRAPHY.fontSize.base : screenSize.isTablet ? TYPOGRAPHY.fontSize.lg : TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#1B91DA',
      padding: screenSize.isMobile ? '3px 4px' : screenSize.isTablet ? '5px 5px' : '4px',
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '12px' : screenSize.isTablet ? '20px' : '8px',
      minWidth: '350px',
      flexShrink: 0,
      justifyContent: 'center',
      width: screenSize.isMobile ? 'auto' : 'auto',
      order: screenSize.isMobile ? 1 : 0,
      borderRadius: screenSize.isMobile ? '4px' : '6px',
      backgroundColor: '#f0f8ff',
      display: 'flex',
      gap: '10px',
      // flexDirection: 'column',
    },
    rightColumn: {
      display: 'flex',
      gap: screenSize.isMobile ? '10px' : screenSize.isTablet ? '12px' : '12px',
      flexWrap: 'wrap',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-start',
      width: screenSize.isMobile ? 'auto' : 'auto',
      order: screenSize.isMobile ? 2 : 0,minWidth: '200px',
      flexShrink: 0,
    },
    footerButtons: {
      display: 'flex',
      gap: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '12px',
      flexWrap: 'wrap',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-end',
      width: screenSize.isMobile ? 'auto' : 'auto',
      order: screenSize.isMobile ? 2 : 0,
      minWidth: '300px',
      flexShrink: 0,
    },
    actionButtonsWrapper: {
      display: 'flex',
      gap: '8px',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-start',
      marginTop: screenSize.isMobile ? '0' : '0',
    },
    totalsRow: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#e8f4fc',
      borderTop: '2px solid #1B91DA',
    },
    addLessSection: {
      display: 'flex',
      flexDirection: screenSize.isMobile ? 'row' : 'row',
      alignItems: 'center',
      gap: screenSize.isMobile ? '5px' : '12px',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-start',
      width: screenSize.isMobile ? 'auto' : 'auto',
      order: screenSize.isMobile ? 0 : 0,
      marginTop: screenSize.isMobile ? '0' : '0',
    },
    addLessContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '6px' : '8px',
      marginRight: screenSize.isMobile ? '0' : '15px',
      order: screenSize.isMobile ? 0 : 0,
      marginTop: screenSize.isMobile ? '0' : '0',
      width: screenSize.isMobile ? 'auto' : 'auto',
      justifyContent: screenSize.isMobile ? 'flex-start' : 'flex-start'
    },
    addLessLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#333',
      whiteSpace: 'nowrap',

    },
    addLessInput: {
      width: screenSize.isMobile ? '80px' : '100px',
      border: '1px solid #1B91DA',
      borderRadius: '4px',
      padding: screenSize.isMobile ? '3px 5px' : '8px 12px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      outline: 'none',
      textAlign: 'center',
      backgroundColor: 'white',
      color: '#333',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    addLessInputFocused: {
      width: screenSize.isMobile ? '120px' : '100px',
      border: '2px solid #1B91DA',
      borderRadius: '4px',
      padding: screenSize.isMobile ? '6px 10px' : '8px 12px',
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      outline: 'none',
      textAlign: 'center',
      backgroundColor: 'white',
      color: '#333',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    uomContainer: {
      position: 'relative',
      width: '100%',
      height: '100%',
    },
    uomDisplay: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#333',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minHeight: screenSize.isMobile ? '26px' : screenSize.isTablet ? '30px' : '32px',
    },
    uomDisplayActive: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#1B91DA',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      backgroundColor: '#e6f7ff',
      border: '2px solid #1B91DA',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      transition: 'all 0.2s ease',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
      minHeight: screenSize.isMobile ? '26px' : screenSize.isTablet ? '30px' : '32px',
    },
    // uomHint: {
    //   position: 'absolute',
    //   top: '-25px',
    //   left: '50%',
    //   transform: 'translateX(-50%)',
    //   backgroundColor: '#1B91DA',
    //   color: 'white',
    //   padding: '3px 8px',
    //   borderRadius: '3px',
    //   fontSize: '10px',
    //   fontWeight: 'bold',
    //   whiteSpace: 'nowrap',
    //   zIndex: 100,
    //   pointerEvents: 'none',
    //   opacity: 0,
    //   transition: 'opacity 0.2s ease',
    // },
    // uomHintVisible: {
    //   position: 'absolute',
    //   top: '-25px',
    //   left: '50%',
    //   transform: 'translateX(-50%)',
    //   backgroundColor: '#1B91DA',
    //   color: 'white',
    //   padding: '3px 8px',
    //   borderRadius: '3px',
    //   fontSize: '10px',
    //   fontWeight: 'bold',
    //   whiteSpace: 'nowrap',
    //   zIndex: 100,
    //   pointerEvents: 'none',
    //   opacity: 1,
    //   transition: 'opacity 0.2s ease',
    // },
    // chargesContainer: {
    //   display: 'flex',
    //   alignItems: 'center',
    //   gap: '5px',
    //   marginRight: '10px'
    // },
    chargesInput: {
      width: '70px',
      border: '1px solid #1B91DA',
      borderRadius: '4px',
      padding: '5px 8px',
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      outline: 'none',
      textAlign: 'center',
      backgroundColor: 'white',
      color: '#333'
    },
    chargesInputFocused: {
      width: '70px',
      border: '2px solid #1B91DA',
      borderRadius: '4px',
      padding: '5px 8px',
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      outline: 'none',
      textAlign: 'center',
      backgroundColor: 'white',
      color: '#333',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)'
    }
  };

  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (screenSize.isMobile) {
      return '';
    } else if (screenSize.isTablet) {
      return 'repeat(6, 1fr)';
    } else {
      return 'repeat(6, 1fr)';
      // return '2fr 1fr 1fr 2fr';
    }
  };

  return (
    <div style={styles.container}>
      {/* --- HEADER SECTION --- */}
      <div style={styles.headerSection}>
        {/* ROW 1 */}
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
        }}>
          {/* Inv No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Ref No:</label>
            <input 
              type="text"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'invNo' && styles.focusedInput)
              }}
              value={billDetails.invNo}
              name="invNo"
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, dateRef, 'invNo')}
              onFocus={() => setFocusedField('invNo')}
              onBlur={() => setFocusedField('')}
              disabled={isEditMode}
              readOnly
            />
          </div>

          {/* Bill Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Entry Date:</label>
            <input
              type="date"
              style={{
                ...styles.inlineInput,
                padding: screenSize.isMobile ? '6px 8px' : '8px 10px',
                ...(focusedField === 'billDate' && styles.focusedInput)
              }}
              ref={dateRef}
              value={billDetails.billDate}
              name="billDate"
              onChange={handleInputChange}              
              onKeyDown={(e) => handleKeyDown(e, purNoRef, 'billDate')}
              onFocus={() => setFocusedField('billDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Pur No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill No:</label>
            <input
              type="text"
              name="purNo"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'purNo' && styles.focusedInput)
              }}
              value={billDetails.purNo}
              onChange={handleInputChange}
              ref={purNoRef}
              onKeyDown={(e) => handleKeyDown(e, gstTypeRef, 'purNo')}
              onFocus={() => setFocusedField('purNo')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Pur Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill Date:</label>
            <input
              type="date"
              name="purDate"
              style={{
                ...styles.inlineInput,
                padding: screenSize.isMobile ? '6px 8px' : '8px 10px',
                ...(focusedField === 'purDate' && styles.focusedInput)
              }}
              value={billDetails.purDate}
              onChange={handleInputChange}
              ref={purDateRef}
              onKeyDown={(e) => handleKeyDown(e, nameRef, 'purDate')}
              onFocus={() => setFocusedField('purDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>

           <div style={styles.formField}>
            <label style={styles.inlineLabel}>GST Type:</label>
            <select
              name="gstType"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'gstType' && styles.focusedInput)
              }}
              value={billDetails.gstType}
              onChange={handleInputChange}
              ref={gstTypeRef}
              onKeyDown={(e) => handleKeyDown(e, nameRef, 'gstType')}
              onFocus={() => setFocusedField('gstType')}
              onBlur={() => setFocusedField('')}
            >
              <option value="G">CGST/SGST</option>
              <option value="I">IGST</option>
            </select>
          </div>
          
          {/* Charges Fields */}
          <div style={styles.formField}>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
              <label style={styles.inlineLabel}>Chrg:</label>
              <input
                type="text"
                style={{
                  ...styles.chargesInput,
                  ...(focusedField === 'chargesPercent' && styles.chargesInputFocused)
                }}
                value={chargesPercent}
                onChange={(e) => handleNumberInput(e, 'chargesPercent')}
                ref={chargesPercentRef}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (chargesAmountRef.current) {
                      chargesAmountRef.current.focus();
                    }
                  }
                }}
                onFocus={() => setFocusedField('chargesPercent')}
                onBlur={() => handleBlur('chargesPercent')}
                // placeholder="%"
              />
              %
              <input
                type="text"
                style={{
                  ...styles.chargesInput,
                  ...(focusedField === 'chargesAmount' && styles.chargesInputFocused)
                }}
                value={chargesAmount}
                onChange={(e) => setChargesAmount(e.target.value)}
                ref={chargesAmountRef}
                // readOnly
                onFocus={() => setFocusedField('chargesAmount')}
                onBlur={() => setFocusedField('')}
                // placeholder="Amt"
              />
            </div>
          </div>
          
        </div>

        {/* ROW 2 */}
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
        }}>
          {/* Customer Name */}
          <div style={{ ...styles.formField, gridColumn: 'span 2' }}>
            <label style={styles.inlineLabel}>Name:</label>
            <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
              <input
                type="text"
                ref={nameRef}
                style={{
                  ...styles.inlineInput,
                  flex: 1,
                  paddingRight: '40px',
                  ...(focusedField === 'customerName' && styles.focusedInput)
                }}
                value={billDetails.customerName}
                name="customerName"
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange(e);
                  
                  if (value.length > 0) {
                    setItemSearchTerm(value);
                    setTimeout(() => setShowSupplierPopup(true), 300);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '/' || e.key === 'F2') {
                    e.preventDefault();
                    setItemSearchTerm(billDetails.customerName);
                    setShowSupplierPopup(true);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!billDetails.customerName?.trim()) {
                      validateCustomer();
                    }
                    if(groupNameRef.current){
                      groupNameRef.current.focus();
                    } 
                  }  else if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  if (groupNameRef && groupNameRef.current) {
                    groupNameRef.current.focus();
                  }
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  if (gstTypeRef && gstTypeRef.current) {
                    gstTypeRef.current.focus();
                  }
              }}}
                onFocus={() => setFocusedField('customerName')}
                onBlur={() => {
                  setFocusedField('');                   
                  setTimeout(() => {
                    if (!showSupplierPopup) {
                      setItemSearchTerm('');
                    }
                  }, 200);
                }}
              />
              <button
                type="button"
                aria-label="Search supplier"
                title="Search supplier"
                onClick={() => setShowSupplierPopup(true)}
                style={{
                  position: 'absolute',
                  right: '4px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: screenSize.isMobile ? '24px' : '28px',
                  width: screenSize.isMobile ? '24px' : '28px',
                  border: 'none',
                  background: 'transparent',
                  color: '#1B91DA',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: screenSize.isMobile ? '14px' : '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  zIndex: 1,
                }}
              >
                <Icon.Search size={16} />
              </button>
            </div>
            <PopupScreenModal screenIndex={6} />
          </div>
          
          {/* Mobile No */}
          <div style={styles.formField}>
            <label style={{...styles.inlineLabel,marginLeft: '-3px'}}>Mobile No:</label>
            <input
              type="text"
              style={{
                ...styles.inlineInput, marginRight: '5px',
                ...(focusedField === 'mobileNo' && styles.focusedInput)
              }}
              value={billDetails.mobileNo}
              name="mobileNo"
              onChange={handleInputChange}
              ref={mobileRef}
              onKeyDown={(e) => handleKeyDown(e, gstNoRef, 'mobileNo')}
              onFocus={() => setFocusedField('mobileNo')}
              onBlur={() => setFocusedField('')}
            />
          </div>
          
          {/* GST No */}
          <div style={styles.formField}>
            <label style={{...styles.inlineLabel,marginLeft: '-5px'}}>GSTIN:</label>
            <input
              type="text"
              style={{
                ...styles.inlineInput, marginRight: '5px',
                ...(focusedField === 'gstno' && styles.focusedInput)
              }}
              value={billDetails.gstno}
              name="gstno"
              onChange={handleInputChange}
              ref={gstNoRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  
                  // Don't focus if we're ignoring Enter (just loaded edit)
                  if (ignoreNextEnterRef.current) {
                    return;
                  }
                  
                  // Focus on the first row's name field
                  if (items.length > 0 && firstRowNameRef.current) {
                    firstRowNameRef.current.focus();
                  } else {
                    // Fallback to the barcode field of first row
                    const firstRowBarcodeInput = document.querySelector(
                      'input[data-row="0"][data-field="barcode"]'
                    );
                    if (firstRowBarcodeInput) {
                      firstRowBarcodeInput.focus();
                    }
                  }
                }
              }}
              onFocus={() => setFocusedField('gstno')}
              onBlur={() => setFocusedField('')}
            />
          </div>
          
          {/* Group Name */}
          <div style={{ ...styles.formField, gridColumn: 'span 2' }}>
            <label style={{...styles.inlineLabel,marginLeft: '-5px'}}>Group Name:</label>
            <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
              <input
                type="text"
                ref={groupNameRef}
                style={{
                  ...styles.inlineInput,
                  flex: 1,
                  paddingRight: '40px',
                  ...(focusedField === 'groupName' && styles.focusedInput)
                }}
                value={billDetails.groupName}
                name="groupName"
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange(e);
                  
                  if (value.length > 0) {
                    setItemSearchTerm(value);
                    setTimeout(() => setShowGroupNamePopup(true), 300);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '/' || e.key === 'F2') {
                    e.preventDefault();
                    setItemSearchTerm(billDetails.groupName);
                    setShowGroupNamePopup(true);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    // Navigate to first row's name field in the table
                    const firstRowNameInput = document.querySelector(
                      `input[data-row="0"][data-field="name"]`
                    );
                    if (firstRowNameInput) {
                      firstRowNameInput.focus();
                    }
                  }
                }}
                onFocus={() => setFocusedField('groupName')}
                onBlur={() => {
                  setFocusedField('');
                  setTimeout(() => {
                    if (!showGroupNamePopup) {
                      setItemSearchTerm('');
                    }
                  }, 200);
                }}
              />
              <button
                type="button"
                aria-label="Search group name"
                title="Search group name"
                onClick={() => setShowGroupNamePopup(true)}
                style={{
                  position: 'absolute',
                  right: '4px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: screenSize.isMobile ? '24px' : '28px',
                  width: screenSize.isMobile ? '24px' : '28px',
                  border: 'none',
                  background: 'transparent',
                  color: '#1B91DA',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: screenSize.isMobile ? '14px' : '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  zIndex: 1,
                }}
              >
                <Icon.Search size={16} />
              </button>
            </div>
            <div><PopupScreenModal screenIndex={5} /></div>
          </div>

        </div>
      </div>

      {/* --- TABLE SECTION --- */}
     <div style={styles.tableSection}>
  <div style={styles.tableContainer}>
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>S.NO</th>
          <th style={styles.th}>Barcode</th>
          <th style={{ ...styles.th, ...styles.itemNameContainer, textAlign: 'left' }}>Particulars</th>
          <th style={styles.th}>UOM</th>
          <th style={styles.th}>Stock</th>
          <th style={styles.th}>HSN</th>
          <th style={styles.th}>Qty</th>
          <th style={styles.th}>OvrWt</th>
          <th style={styles.th}>AvgWt</th>
          <th style={styles.th}>PRate</th>
          <th style={styles.th}>InTax</th>
          <th style={styles.th}>OutTax</th>
          <th style={styles.th}>ACost</th>
          <th style={styles.th}>Sudo</th>
          <th style={styles.th}>Profit%</th>
          <th style={styles.th}>PreRT</th>
          <th style={styles.th}>SRate</th>
          <th style={styles.th}>ASRate</th>
          <th style={styles.th}>MRP</th>
          <th style={styles.th}>PPer</th>
          <th style={styles.th}>NTCost</th>
          <th style={styles.th}>WS%</th>
          <th style={styles.th}>WRate</th>
          <th style={{...styles.th, minWidth: screenSize.isMobile ? '100px' : '120px'}}>Total</th>
          <th style={styles.th}>Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
            <td style={styles.td}>{index + 1}</td>
            <td style={styles.td}>
              <input
                style={focusedField === `barcode-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                value={item.barcode}
                data-row={index}
                readOnly
                data-field="barcode"
                onChange={(e) => handleItemChange(item.id, 'barcode', e.target.value)}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'barcode')}
                onFocus={() => setFocusedField(`barcode-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={{ ...styles.td, ...styles.itemNameContainer }}>
              <div style={{ 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center',
                height: '100%',
                border: focusedField === `name-${item.id}` ? '2px solid #1B91DA' : 'none',
                backgroundColor: focusedField === `name-${item.id}` ? '#e6f7ff' : 'transparent',
                borderRadius: '4px',
                boxShadow: focusedField === `name-${item.id}` ? '0 0 0 2px rgba(27, 145, 218, 0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}>
                <input                      
                  style={{ 
                    ...styles.editableInput, 
                    textAlign: 'left',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    paddingLeft: '8px',
                    paddingRight: '32px',
                    width: '100%',
                    height: '100%',
                    boxShadow: 'none'
                  }}
                  value={item.name}
                  data-row={index}
                  data-field="name"
                  onChange={(e) => {
                    const value = e.target.value;
                    handleItemChange(item.id, 'name', value);
                    
                    if (value.length > 0) {
                      handleItemCodeSelect(item.id, value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      if (!item.name || item.name.trim() === '') {
                        if (addLessRef.current) {
                          addLessRef.current.focus();
                        }
                      } else {
                        const qtyInput = document.querySelector(
                          `input[data-row="${index}"][data-field="qty"]`
                        );
                        if (qtyInput) {
                          qtyInput.focus();
                        }
                      }
                      return;
                    }
                    
                    if (e.key === '/') {
                      e.preventDefault();
                      handleItemCodeSelect(item.id, item.name);
                    }
                  }}
                  onFocus={() => setFocusedField(`name-${item.id}`)}
                  onBlur={() => setFocusedField('')}
                  title="Click to select item from list"
                />
                <button
                  type="button"
                  tabIndex="-1"
                  aria-label="Search item details"
                  title="Click to select item from list"
                  onClick={() => {
                    handleItemCodeSelect(item.id, item.name);
                  }}
                  onFocus={(e) => {
                    const nameInput = document.querySelector(
                      `input[data-row="${index}"][data-field="name"]`
                    );
                    if (nameInput) {
                      e.preventDefault();
                      nameInput.focus();
                    }
                  }}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    color: '#1B91DA',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    zIndex: 1,
                    height: '24px',
                    width: '24px'
                  }}
                >
                  <Icon.Search size={18} />
                </button>
              </div>
            </td>
            
            <td style={styles.td}>
              <div style={styles.uomContainer}>
                <div 
                  style={focusedUomField === item.id || focusedField === `uom-${item.id}` ? styles.uomDisplayActive : styles.uomDisplay}
                  title="UOM is read-only"
                  data-row={index}
                  data-field="uom"
                >
                  {item.uom || ''}
                </div>
              </div>
            </td>
            
            {/* Numeric fields with right alignment */}
            <td style={styles.td}>
              <input
                style={focusedField === `stock-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.stock}
                data-row={index}
                data-field="stock"
                readOnly
                onChange={(e) => handleItemChange(item.id, 'stock', parseFloat(e.target.value) || 0)}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'stock')}
                onFocus={() => setFocusedField(`stock-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `hsn-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.hsn}
                data-row={index}
                data-field="hsn"
                onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'hsn')}
                onFocus={() => setFocusedField(`hsn-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `qty-${item.id}` ? 
                  { ...styles.editableInputFocused, fontWeight: 'bold', textAlign: 'right' } : 
                  { ...styles.editableInput, fontWeight: 'bold', textAlign: 'right' }}
                value={item.qty}
                data-row={index}
                data-field="qty"
                onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || '')}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                onFocus={() => setFocusedField(`qty-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `ovrwt-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.ovrwt || ''}
                data-row={index}
                data-field="ovrwt"
                onChange={(e) => handleItemChange(item.id, 'ovrwt', handleNumericInput(e.target.value))}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'ovrwt')}
                onFocus={() => setFocusedField(`ovrwt-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `avgwt-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.avgwt || ''}
                data-row={index}
                data-field="avgwt"                      
                readonly
                onKeyDown={(e) => handleTableKeyDown(e, index, 'avgwt')}
                onFocus={() => setFocusedField(`avgwt-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `prate-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.prate || ''}
                data-row={index}
                data-field="prate"
                onChange={(e) =>
                  handleItemChange(item.id, "prate", handleNumericInput(e.target.value))
                }
                onKeyDown={(e) => handleTableKeyDown(e, index, 'prate')}
                onFocus={() => setFocusedField(`prate-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `intax-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.intax || ''}
                data-row={index}
                data-field="intax"
                onChange={(e) => {
                  const value = e.target.value;
                  const validTaxValues = allTax.map(t => t.displayName);
                  if (value === '' || /^[0-9]*$/.test(value)) {
                    handleItemChange(item.id, 'intax', value);
                  }
                }}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'intax')}
                onBlur={(e) => {
                  const value = e.target.value;
                  const validTaxValues = allTax.map(t => t.displayName);
                  if (value !== '' && !validTaxValues.includes(value)) {
                    showAlertConfirmation(
                      'Invalid tax value. Please enter ' + validTaxValues.join(', '),
                      () => {
                        handleItemChange(item.id, 'intax', '');
                        setTimeout(() => {
                          const intaxInput = document.querySelector(
                            `input[data-row="${index}"][data-field="intax"]`
                          );
                          if (intaxInput) {
                            intaxInput.focus();
                          }
                        }, 100);
                      },
                      'warning'
                    );
                  }
                }}
                onFocus={() => setFocusedField(`intax-${item.id}`)}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `outtax-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.outtax || ''}
                data-row={index}
                data-field="outtax"
                onChange={(e) => {
                  const value = e.target.value;
                  const validTaxValues = allTax.map(t => t.displayName);
                  if (value === '' || /^[0-9]*$/.test(value)) {
                    handleItemChange(item.id, 'outtax', value);
                  }
                }}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'outtax')}
                onBlur={(e) => {
                  const value = e.target.value;
                  const validTaxValues = allTax.map(t => t.displayName);
                  if (value !== '' && !validTaxValues.includes(value)) {
                    showAlertConfirmation(
                      'Invalid tax value. Please enter ' + validTaxValues.join(', '),
                      () => {
                        handleItemChange(item.id, 'outtax', '');
                        setTimeout(() => {
                          const outtaxInput = document.querySelector(
                            `input[data-row="${index}"][data-field="outtax"]`
                          );
                          if (outtaxInput) {
                            outtaxInput.focus();
                          }
                        }, 100);
                      },
                      'warning'
                    );
                  }
                }}
                onFocus={() => setFocusedField(`outtax-${item.id}`)}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `acost-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.acost || ''}
                data-row={index}
                data-field="acost"
                onChange={(e) => handleItemChange(item.id, 'acost', handleNumericInput(e.target.value))}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'acost')}
                onFocus={() => setFocusedField(`acost-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `sudo-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'center' } : 
                  { ...styles.editableInput, textAlign: 'center' }}
                value={item.sudo || ''}
                data-row={index}
                data-field="sudo"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (/^[A-Z]*$/.test(value)) {
                    handleItemChange(item.id, 'sudo', value);
                  }
                }}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'sudo')}
                onBlur={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (value !== '') {
                    if (!validateSudoLetters(value, index)) {
                      handleItemChange(item.id, 'sudo', '');
                      handleItemChange(item.id, 'profitPercent', '');
                    }
                  }
                }}
                onFocus={() => setFocusedField(`sudo-${item.id}`)}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `profitPercent-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.profitPercent || ''}
                data-row={index}
                data-field="profitPercent"
                onChange={(e) => handleItemChange(item.id, 'profitPercent', e.target.value)}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'profitPercent')}
                onFocus={() => setFocusedField(`profitPercent-${item.id}`)}
                onBlur={() => setFocusedField('')}
                readOnly
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `preRT-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.preRT || ''}
                data-row={index}
                data-field="preRT"
                onChange={(e) => handleItemChange(item.id, 'preRT', handleNumericInput(e.target.value))}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'preRT')}
                onFocus={() => setFocusedField(`preRT-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `sRate-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.sRate || ''}
                data-row={index}
                data-field="sRate"
                onChange={(e) => handleItemChange(item.id, 'sRate', handleNumericInput(e.target.value))}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'sRate')}
                onFocus={() => setFocusedField(`sRate-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `asRate-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.asRate || ''}
                data-row={index}
                data-field="asRate"
                onChange={(e) => handleItemChange(item.id, 'asRate', handleNumericInput(e.target.value))}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'asRate')}
                onFocus={() => setFocusedField(`asRate-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `mrp-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.mrp}
                data-row={index}
                data-field="mrp"
                onChange={(e) => handleItemChange(item.id, 'mrp', parseFloat(e.target.value))}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'mrp')}
                onFocus={() => setFocusedField(`mrp-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `letProfPer-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.letProfPer || ''}
                data-row={index}
                data-field="letProfPer"
                onChange={(e) => handleItemChange(item.id, 'letProfPer', handleNumericInput(e.target.value))}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'letProfPer')}
                onFocus={() => setFocusedField(`letProfPer-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `ntCost-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.ntCost || ''}
                data-row={index}
                data-field="ntCost"
                onChange={(e) => handleItemChange(item.id, 'ntCost', handleNumericInput(e.target.value))}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'ntCost')}
                onFocus={() => setFocusedField(`ntCost-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `wsPercent-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.wsPercent || ''}
                data-row={index}
                data-field="wsPercent"
                onChange={(e) => handleItemChange(item.id, 'wsPercent', handleNumericInput(e.target.value))}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'wsPercent')}
                onFocus={() => setFocusedField(`wsPercent-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>                  
            
            <td style={styles.td}>
              <input
                style={focusedField === `wsRate-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.wsRate || ''}
                data-row={index}
                data-field="wsRate"
                onChange={(e) => handleItemChange(item.id, 'wsRate', handleNumericInput(e.target.value))}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'wsRate')}
                onFocus={() => setFocusedField(`wsRate-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            
            <td style={styles.td}>
              <input
                style={focusedField === `amt-${item.id}` ? 
                  { ...styles.editableInputFocused, textAlign: 'right' } : 
                  { ...styles.editableInput, textAlign: 'right' }}
                value={item.amt || ''}
                data-row={index}
                data-field="amt"
                readOnly
                onKeyDown={(e) => handleTableKeyDown(e, index, 'amt')}
                onFocus={() => setFocusedField(`amt-${item.id}`)}
                onBlur={() => setFocusedField('')}
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
                  fontSize: screenSize.isMobile ? '12px' : '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease',
                  minHeight: screenSize.isMobile ? '28px' : '32px',
                }}
                onClick={() => handleDeleteRow(item.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={screenSize.isMobile ? "16" : "18"}
                  height={screenSize.isMobile ? "16" : "18"}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc3545"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                  style={{ display: 'block', margin: 'auto' }}
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
      </tbody>
    </table>
    <div style={styles.tableFooterContainer}>
  <table style={styles.tableFooter}>
    <tbody>
      <tr style={styles.totalsRow}>
        {/* Match ALL columns exactly as in the table header */}
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, ...styles.itemNameContainer, textAlign: 'left', width: screenSize.isMobile ? '100px' : screenSize.isTablet ? '150px' : '200px' }}>
          <strong>Total:</strong>
        </td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '150px', textAlign: 'right' }}>
          <strong>{items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0).toFixed(2)}</strong>
        </td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px', textAlign: 'right' }}>
          <strong>{items.reduce((sum, item) => sum + (parseFloat(item.amt) || 0), 0).toFixed(2)}</strong>
        </td>
        <td style={{ ...styles.tableFooterCell, width: screenSize.isMobile ? '45px' : screenSize.isTablet ? '55px' : '60px' }}></td>
      </tr>
    </tbody>
  </table>
</div>
  </div>
     
</div>

      {/* Purchase Bill List Popup for Edit/Delete */}
      <PopupListSelector
        open={showBillListPopup}
        onClose={() => {
          setShowBillListPopup(false);
          setPopupMode('');
          setItemSearchTerm('');
        }}
        title={popupMode === 'edit' ? 'Select Purchase to Edit' : 'Select Purchase to Delete'}
        fetchItems={fetchBillList}
        displayFieldKeys={['voucherNo']}
        headerNames={['Bill No']}
        searchFields={['voucherNo']}
        columnWidths={{ voucherNo: '100%' }}
        searchPlaceholder="Search by bill no or customer..."
        onSelect={handleBillSelect}
      />
     
      {/* Supplier Popup */}
      <PopupListSelector
        open={showSupplierPopup}
        onClose={() => { 
          setShowSupplierPopup(false); 
          setItemSearchTerm('');
        }}
        title="Select Supplier"
        fetchItems={fetchSupplierItems}
        displayFieldKeys={['name','city','gstType']}
        headerNames={['Name','City','GST Type']}
        searchFields={['name','city','gstType']}
        columnWidths={{ name: '40%', city: '20%', gstType: '20%' }}
        searchPlaceholder="Search supplier..."
        initialSearch={itemSearchTerm}
        onSelect={(s) => {
          setBillDetails(prev => ({
            ...prev,
            partyCode: s.code || '',
            customerName: s.name || '',
            city: s.city || '',
            gstType: s.gstType || prev.gstType || 'CGST',
            mobileNo: s.phone || prev.mobileNo || '',
            gstno: s.gstNumber || prev.gstNumber || ''
          }));

          setShowSupplierPopup(false);
          setItemSearchTerm('');

          setTimeout(() => {
            if (nameRef.current) {
              nameRef.current.focus();
              nameRef.current.select();
            }
          }, 500);
        }}
      />     
      
     {/* Group Name Popup */}
<PopupListSelector
  open={showGroupNamePopup}
  onClose={() => { 
    setShowGroupNamePopup(false); 
    setItemSearchTerm('');
  }}
  title="Select Group Name"
  fetchItems={fetchGroupNameItems}
  displayFieldKeys={['fItemName']}
  headerNames={['Group Name']}
  searchFields={['fItemName']}
  columnWidths={{ fItemName: '100%' }}
  searchPlaceholder="Search group name..."
  initialSearch={itemSearchTerm}
  onSelect={(item) => {
    handleGroupItemCodeSelection(item);

    setTimeout(() => {
            if (groupNameRef.current) {
              groupNameRef.current.focus();
              groupNameRef.current.select();
            }
          }, 1000);
  }}
/>
      
      {/* Item Code Selection Popup */}     
      <PopupListSelector
        open={showItemCodePopup}
        onClose={() => {
          setShowItemCodePopup(false);
          setSelectedRowId(null);
        }}
        title="Select Item"
        fetchItems={(pageNum = 1, search = '') => fetchItemCodeList(search)}
        displayFieldKeys={['name','barcode']}
        headerNames={['Name','Barcode']}
        searchFields={['name',' barcode']}
        columnWidths={{ name: '50%',barcode : '50%' }}
        searchPlaceholder="Search by name or barcode..."
        initialSearch={itemSearchTerm}
        onSelect={handleItemCodeSelection}
      />

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        onConfirm={async () => {
          await confirmConfig.onConfirm();
          setShowConfirmPopup(false);
        }}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        hideCancelButton={confirmConfig.hideCancelButton}
        showLoading={confirmConfig.showLoading || isLoading}
        disableBackdropClose={isLoading}
      />

      {/* Transport Popup */}
      <TransportPopup
        isOpen={showTransportPopup}
        onClose={() => setShowTransportPopup(false)}
        transportData={transportData}
        onTransportDataChange={(data) => {
          setTransportData(data);
        }}
      />
      
      {/* --- FOOTER SECTION --- */}
      <div style={styles.footerSection}>
        <div style={styles.rightColumn}>
          <ActionButtons 
            activeButton={activeTopAction} 
            onButtonClick={(type) => {
              console.log("Top action clicked:", type);
              setActiveTopAction(type);
              if (type === 'add') clearForm();
              else if (type === 'edit') handleEdit();
              else if (type === 'delete') handleDelete();
            }}         
          >
            <AddButton buttonType="add" disabled={!formPermissions.add}/>
            <EditButton buttonType="edit" disabled={!formPermissions.edit}/>
            <DeleteButton buttonType="delete" disabled={!formPermissions.delete} />
          </ActionButtons>
        </div>
        <div style={styles.addLessSection}>
        <div style={styles.addLessContainer}>
          <span style={styles.addLessLabel}>Freight:</span>
          <input
            type="text"
            style={focusedField === 'freight' ? styles.addLessInputFocused : styles.addLessInput}
            value={freightAmount}
            onChange={(e) => handleNumberInput(e, 'freight')}
            ref={freightRef}
            onFocus={() => setFocusedField('freight')}
            onBlur={() => handleBlur('freight')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                if (addLessRef.current) {
                  addLessRef.current.focus();
                }
              }
            }}
            inputMode="decimal"
            // placeholder="0.00"
          />
        </div>
        <div style={styles.addLessContainer}>
          <span style={styles.addLessLabel}>Add/Less:</span>
          <input
            type="text"
            style={focusedField === 'addLess' ? styles.addLessInputFocused : styles.addLessInput}
            value={addLessAmount}
            onChange={(e) => handleNumberInput(e, 'addLess')}
            ref={addLessRef}
            onFocus={() => setFocusedField('addLess')}
            onBlur={() => handleBlur('addLess')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Enter pressed in Add/Less, calling handleSave');
                setTimeout(() => handleSave(), 100);
              }
            }}
            inputMode="decimal"
            // placeholder="0.00"
          />
        </div>
        
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  marginRight: '10px',
  flexShrink: 0
}}>
  <Icon.Truck 
    size={30}
    style={{ 
      cursor: 'pointer',
      transition: 'transform 0.2s',
      display: 'block'
    }}
    onClick={() => {
      console.log('Truck icon clicked');
      setShowTransportPopup(true);
    }}
    title="Click to edit transport details"
    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
  />
</div>
</div>
        <div style={styles.netBox}>
          <div>
          <span>Total Amt:</span>
          <span>₹ {netTotal.toFixed(2)}</span>
          </div>
          <div>
          <span>GST Amt:</span>
          <span>₹ {gstTotal.toFixed(2)}</span>
          </div>
        </div>
        <div style={styles.footerButtons}>
          <ActionButtons1
            onClear={handleClear}
            onSave={handleSave}
            onPrint={handlePrint}
            activeButton={activeFooterAction}
            onButtonClick={(type) => setActiveFooterAction(type)}
          />
        </div>
      </div>      
    </div>
  );
};

export default PurchaseInvoice;