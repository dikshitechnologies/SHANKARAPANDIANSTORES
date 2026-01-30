import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { EditButton, DeleteButton, SaveButton, ClearButton, AddButton, ActionButtons, ActionButtons1, PrintButton } from '../../components/Buttons/ActionButtons';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import SaveConfirmationModal from '../../components/SaveConfirmationModal/SaveConfirmationModal';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import apiService from '../../api/apiService';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
import {PopupScreenModal} from '../../components/PopupScreens';

const SearchIcon = ({ size = 16, color = "#1B91DA" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block" }}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PaymentVoucher = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.PAYMENT_VOUCHER),
    edit: hasModifyPermission(PERMISSION_CODES.PAYMENT_VOUCHER),
    delete: hasDeletePermission(PERMISSION_CODES.PAYMENT_VOUCHER)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // --- STATE MANAGEMENT ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Save confirmation popup
  const [saveConfirmationOpen, setSaveConfirmationOpen] = useState(false);
  const [saveConfirmationData, setSaveConfirmationData] = useState(null);
  const [saveConfirmation, setSaveConfirmation] = useState(false);

  // Validation confirmation popup
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'OK',
    cancelText: null,
    action: null,
    isLoading: false
  });

  // Track if we're editing an existing voucher
  const [isEditing, setIsEditing] = useState(false);
  const [originalVoucherNo, setOriginalVoucherNo] = useState('');

  // 1. Header Details State
  const [voucherDetails, setVoucherDetails] = useState({
    voucherNo: '',
    gstType: 'CGST/SGST',
    date: new Date().toISOString().substring(0, 10),
    costCenter: '',
    accountName: '',
    accountCode: '',
    balance: '',
    crDr: ''
  });

  // 2. Table Items State (Payment Details)
  const [paymentItems, setPaymentItems] = useState([
    {
      id: 1,
      sNo: 1,
      cashBank: '',
      crDr: 'CR',
      type: 'CASH',
      chqNo: '',
      chqDt: new Date().toISOString().substring(0, 10),
      narration: '',
      amount: ''
    }
  ]);

  // 3. Reference Bill Details State
  const [billDetails, setBillDetails] = useState([
    {
      id: 1,
      sNo: 1,
      refNo: '',
      billNo: '',
      date: '',
      billAmount: '',
      paidAmount: '',
      balanceAmount: '',
      amount: ''
    }
  ]);

  // 4. Totals State
  const [totalAmount, setTotalAmount] = useState(0);
  const [billTotalAmount, setBillTotalAmount] = useState(0);

  // 4.5. Particulars State
  const [particulars, setParticulars] = useState({
    '500': { available: 0, collect: 0, issue: 0 },
    '200': { available: 0, collect: 0, issue: 0 },
    '100': { available: 0, collect: 0, issue: 0 },
    '50': { available: 0, collect: 0, issue: 0 },
    '20': { available: 0, collect: 0, issue: 0 },
    '10': { available: 0, collect: 0, issue: 0 },
    '5': { available: 0, collect: 0, issue: 0 },
    '2': { available: 0, collect: 0, issue: 0 },
    '1': { available: 0, collect: 0, issue: 0 }
  });

  // 5. Popup States
  const [editVoucherPopupOpen, setEditVoucherPopupOpen] = useState(false);
  const [deleteVoucherPopupOpen, setDeleteVoucherPopupOpen] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);

  // 5.5 Cash/Bank Popup State
  const [showCashBankPopup, setShowCashBankPopup] = useState(false);
  const [cashBankPopupContext, setCashBankPopupContext] = useState(null); // { paymentItemId, index }

  // Party popup search state
  const [partySearchTerm, setPartySearchTerm] = useState('');

  // CashBank popup search state
  const [cashBankSearchTerm, setCashBankSearchTerm] = useState('');

  // Voucher popup search state
  const [voucherSearchTerm, setVoucherSearchTerm] = useState('');

  // 6. Data state
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [allParties, setAllParties] = useState([]);
  const [showPartyPopup, setShowPartyPopup] = useState(false);
  
  // Pagination state for parties
  const [partyCurrentPage, setPartyCurrentPage] = useState(1);
  const [partyTotalPages, setPartyTotalPages] = useState(0);
  const [isLoadingMoreParties, setIsLoadingMoreParties] = useState(false);
  const [hasReachedEndOfParties, setHasReachedEndOfParties] = useState(false);

  // Auth context for company code
  const { userData } = useAuth() || {};

  // --- ENTER KEY NAVIGATION STATES ---
  const [navigationStep, setNavigationStep] = useState('voucherNo');
  const [currentPaymentRowIndex, setCurrentPaymentRowIndex] = useState(0);
  const [currentPaymentFieldIndex, setCurrentPaymentFieldIndex] = useState(0);
  const [currentBillRowIndex, setCurrentBillRowIndex] = useState(0);

  // --- REFS FOR ARROW KEY NAVIGATION ---
  const voucherNoRef = useRef(null);
  const dateRef = useRef(null);
  const accountNameRef = useRef(null);
  const gstTypeRef = useRef(null);
  const balanceRef = useRef(null);
  
  // Payment table refs
  const paymentCashBankRefs = useRef([]);
  const paymentCrDrRefs = useRef([]);
  const paymentTypeRefs = useRef([]);
  const paymentChqNoRefs = useRef([]);
  const paymentChqDtRefs = useRef([]);
  const paymentNarrationRefs = useRef([]);
  const paymentAmountRefs = useRef([]);
  
  // Bill table refs
  const billAmountRefs = useRef([]);
  const saveButtonRef = useRef(null);

  // Track which field is focused to style active input
  const [focusedField, setFocusedField] = useState('');

  // Footer action active state
  const [activeFooterAction, setActiveFooterAction] = useState('Null');

  // Top action active state
  const [activeTopAction, setActiveTopAction] = useState('add');

  // Screen size state
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  // Mobile view state
  const [isMobileView, setIsMobileView] = useState(false);

  // Initialize refs arrays
  useEffect(() => {
    paymentCashBankRefs.current = paymentCashBankRefs.current.slice(0, paymentItems.length);
    paymentCrDrRefs.current = paymentCrDrRefs.current.slice(0, paymentItems.length);
    paymentTypeRefs.current = paymentTypeRefs.current.slice(0, paymentItems.length);
    paymentChqNoRefs.current = paymentChqNoRefs.current.slice(0, paymentItems.length);
    paymentChqDtRefs.current = paymentChqDtRefs.current.slice(0, paymentItems.length);
    paymentNarrationRefs.current = paymentNarrationRefs.current.slice(0, paymentItems.length);
    paymentAmountRefs.current = paymentAmountRefs.current.slice(0, paymentItems.length);
    billAmountRefs.current = billAmountRefs.current.slice(0, billDetails.length);
  }, [paymentItems.length, billDetails.length]);

  // DEBUG: Log paymentItems array whenever it changes
  useEffect(() => {
    console.log(`🔴 DEBUG - PaymentItems State Changed (Length: ${paymentItems.length}):`, paymentItems);
  }, [paymentItems]);

  // Focus on Date field when component mounts
  useEffect(() => {
    if (dateRef.current) {
      setTimeout(() => {
        dateRef.current.focus();
        setNavigationStep('date');
      }, 100);
    }
  }, []);

  // Update screen size on resize and check for mobile
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      
      setScreenSize({
        width,
        height,
        isMobile: mobile,
        isTablet: tablet,
        isDesktop: width >= 1024
      });
      
      setIsMobileView(mobile);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ========== ARROW KEY NAVIGATION FUNCTIONS ==========

  // Define field order for navigation
  const headerFields = ['voucherNo', 'date', 'accountName', 'balance', 'gstType'];
  const paymentFields = ['cashBank', 'crDr', 'type', 'chqNo', 'chqDt', 'narration', 'amount'];
  const billFields = ['refNo', 'billNo', 'date', 'billAmount', 'paidAmount', 'balanceAmount', 'amount'];

  // Get current field index based on field type
  const getCurrentFieldIndex = (fieldType) => {
    if (headerFields.includes(fieldType)) {
      return headerFields.indexOf(fieldType);
    }
    if (paymentFields.includes(fieldType)) {
      return paymentFields.indexOf(fieldType);
    }
    if (billFields.includes(fieldType)) {
      return billFields.indexOf(fieldType);
    }
    return 0;
  };

  // Navigate to next field with arrow keys
  const navigateWithArrow = (direction, currentField, currentRow = 0, currentFieldType = '') => {
    // Skip arrow navigation on mobile for better UX
    if (isMobileView) return;
    
    console.log(`⬅️➡️ Navigating ${direction} from ${currentField}, row ${currentRow}, fieldType ${currentFieldType}`);
    console.log(`📊 Current paymentItems.length: ${paymentItems.length}`, paymentItems.map(item => ({ id: item.id, type: item.type, cashBank: item.cashBank })));

    // Handle navigation from header fields
    if (headerFields.includes(currentField)) {
      const currentIndex = headerFields.indexOf(currentField);
      
      if (direction === 'right') {
        if (currentIndex < headerFields.length - 1) {
          const nextField = headerFields[currentIndex + 1];
          focusOnHeaderField(nextField);
        } else {
          // Move to first payment row
          focusOnPaymentField(0, 0);
        }
      } else if (direction === 'left') {
        if (currentIndex > 0) {
          const prevField = headerFields[currentIndex - 1];
          focusOnHeaderField(prevField);
        }
      } else if (direction === 'down') {
        // Move to payment table (same column concept)
        if (currentField === 'accountName' || currentField === 'balance') {
          focusOnPaymentField(0, 0); // First row, first field
        }
      }
    }
    
    // Handle navigation from payment table
    else if (paymentFields.includes(currentFieldType)) {
      const fieldIndex = getCurrentFieldIndex(currentFieldType);
      
      if (direction === 'right') {
        if (fieldIndex < paymentFields.length - 1) {
          // Special handling for skipping CHQ fields when type is not CHQ
          if (currentFieldType === 'type' && paymentItems[currentRow].type !== 'CHQ') {
            // Skip chqNo and chqDt, go to narration
            focusOnPaymentField(currentRow, paymentFields.indexOf('narration'));
          } else if (currentFieldType === 'chqNo' && paymentItems[currentRow].type !== 'CHQ') {
            // Skip chqDt, go to narration
            focusOnPaymentField(currentRow, paymentFields.indexOf('narration'));
          } else if (currentFieldType === 'chqDt' && paymentItems[currentRow].type !== 'CHQ') {
            // Go to narration
            focusOnPaymentField(currentRow, paymentFields.indexOf('narration'));
          } else {
            focusOnPaymentField(currentRow, fieldIndex + 1);
          }
        } else {
          // Last field in row, move to next row if exists
          if (currentRow < paymentItems.length - 1) {
            focusOnPaymentField(currentRow + 1, 0);
          } else {
            // Move to bill table
            focusOnBillField(0, billFields.indexOf('amount'));
          }
        }
      } else if (direction === 'left') {
        if (fieldIndex > 0) {
          // Special handling for skipping CHQ fields
          if (currentFieldType === 'narration' && paymentItems[currentRow].type !== 'CHQ') {
            // Skip back over chqDt and chqNo if type is not CHQ
            focusOnPaymentField(currentRow, paymentFields.indexOf('type'));
          } else {
            focusOnPaymentField(currentRow, fieldIndex - 1);
          }
        } else {
          // First field in row, move to previous row or header
          if (currentRow > 0) {
            focusOnPaymentField(currentRow - 1, paymentFields.length - 1);
          } else {
            // Move to last header field
            focusOnHeaderField(headerFields[headerFields.length - 1]);
          }
        }
      } else if (direction === 'down') {
        if (currentRow < paymentItems.length - 1) {
          focusOnPaymentField(currentRow + 1, fieldIndex);
        } else {
          // Move to bill table (same column concept)
          focusOnBillField(0, Math.min(fieldIndex, billFields.length - 1));
        }
      } else if (direction === 'up') {
        if (currentRow > 0) {
          focusOnPaymentField(currentRow - 1, fieldIndex);
        } else {
          // Move to header (accountName or balance based on column)
          if (fieldIndex <= 1) { // cashBank or crDr
            focusOnHeaderField('accountName');
          } else {
            focusOnHeaderField('gstType');
          }
        }
      }
    }
    
    // Handle navigation from bill table
    else if (billFields.includes(currentFieldType)) {
      const fieldIndex = getCurrentFieldIndex(currentFieldType);
      
      if (direction === 'right') {
        // Only amount field is editable in bill table
        if (fieldIndex < billFields.length - 1) {
          focusOnBillField(currentRow, fieldIndex + 1);
        } else {
          // Last field, move to next row
          if (currentRow < billDetails.length - 1) {
            focusOnBillField(currentRow + 1, billFields.indexOf('amount'));
          } else {
            // Move to save button
            saveButtonRef.current?.focus();
          }
        }
      } else if (direction === 'left') {
        if (fieldIndex > 0) {
          focusOnBillField(currentRow, fieldIndex - 1);
        } else {
          // First field, move to previous row or payment table
          if (currentRow > 0) {
            focusOnBillField(currentRow - 1, billFields.length - 1);
          } else {
            // Move to last payment row
            const lastPaymentRow = paymentItems.length - 1;
            focusOnPaymentField(lastPaymentRow, paymentFields.length - 1);
          }
        }
      } else if (direction === 'down') {
        if (currentRow < billDetails.length - 1) {
          focusOnBillField(currentRow + 1, fieldIndex);
        } else {
          // Move to save button
          saveButtonRef.current?.focus();
        }
      } else if (direction === 'up') {
        if (currentRow > 0) {
          focusOnBillField(currentRow - 1, fieldIndex);
        } else {
          // Move to payment table (last row)
          const lastPaymentRow = paymentItems.length - 1;
          focusOnPaymentField(lastPaymentRow, Math.min(fieldIndex, paymentFields.length - 1));
        }
      }
    }
  };

  // Focus on header field
  const focusOnHeaderField = (fieldName) => {
    setNavigationStep(fieldName);
    setFocusedField(fieldName);
    
    setTimeout(() => {
      switch (fieldName) {
        case 'voucherNo':
          voucherNoRef.current?.focus();
          break;
        case 'date':
          dateRef.current?.focus();
          break;
        case 'accountName':
          accountNameRef.current?.focus();
          break;
        case 'balance':
          balanceRef.current?.focus();
          break;
        case 'gstType':
          gstTypeRef.current?.focus();
          break;
      }
    }, 10);
  };

  // Focus on payment field
  const focusOnPaymentField = (rowIndex, fieldIndex) => {
    const fieldName = paymentFields[fieldIndex];
    setCurrentPaymentRowIndex(rowIndex);
    setCurrentPaymentFieldIndex(fieldIndex);
    setNavigationStep('payment' + fieldName);
    
    setTimeout(() => {
      const fieldId = `payment_${paymentItems[rowIndex].id}_${fieldName}`;
      const element = document.getElementById(fieldId);
      if (element) {
        element.focus();
        element.select?.();
      }
    }, 10);
  };

  // Focus on bill field
  const focusOnBillField = (rowIndex, fieldIndex) => {
    const fieldName = billFields[fieldIndex];
    setCurrentBillRowIndex(rowIndex);
    setNavigationStep('bill' + fieldName);
    
    setTimeout(() => {
      const fieldId = `bill_${billDetails[rowIndex].id}_${fieldName}`;
      const element = document.getElementById(fieldId);
      if (element) {
        element.focus();
        element.select?.();
      }
    }, 10);
  };

  // ========== ENHANCED KEYDOWN HANDLERS WITH ARROW SUPPORT ==========

  // Handle keydown in header fields with arrow support
  const handleHeaderFieldKeyDown = (e, currentField) => {
    // Arrow key navigation
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      const direction = e.key.replace('Arrow', '').toLowerCase();
      navigateWithArrow(direction, currentField);
      return;
    }
    
    // Enter key navigation (existing functionality)
    if (e.key === 'Enter') {
      e.preventDefault();
      
      switch (currentField) {
        case 'voucherNo':
          dateRef.current?.focus();
          setNavigationStep('date');
          break;
          
        case 'date':
          accountNameRef.current?.focus();
          setNavigationStep('accountName');
          break;
          
        case 'accountName':
          gstTypeRef.current?.focus();
          setNavigationStep('gstType');
          break;
          
        case 'gstType':
          if (paymentCashBankRefs.current[0]) {
            paymentCashBankRefs.current[0].focus();
            setNavigationStep('paymentCashBank');
            setCurrentPaymentRowIndex(0);
          }
          break;
      }
    }
    
    // Open popup on typing in account name
    if (currentField === 'accountName' && e.key !== 'Enter' && e.key !== 'Tab' && e.key !== 'Shift') {
      if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        setTimeout(() => {
          openAccountPopup();
        }, 100);
      }
    }
  };

  // Handle keydown in payment fields with arrow support
  const handlePaymentFieldKeyDown = (e, rowIndex, fieldType) => {
    // Arrow key navigation
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      navigateWithArrow(e.key.replace('Arrow', '').toLowerCase(), '', rowIndex, fieldType);
      return;
    }
    
    // Existing Enter key navigation
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentItem = paymentItems[rowIndex];

      // Check if Chq No and Chq Dt are mandatory when type is CHQ
      if (currentItem.type === 'CHQ') {
        if (fieldType === 'chqNo' && !currentItem.chqNo?.trim()) {
          setConfirmationPopup({
            isOpen: true,
            title: 'Validation Error',
            message: 'Chq No is mandatory',
            type: 'warning',
            confirmText: 'OK',
            cancelText: null,
            action: null,
            isLoading: false
          });
          return;
        }
        if (fieldType === 'chqDt' && !currentItem.chqDt) {
          setConfirmationPopup({
            isOpen: true,
            title: 'Validation Error',
            message: 'Chq Dt is mandatory',
            type: 'warning',
            confirmText: 'OK',
            cancelText: null,
            action: null,
            isLoading: false
          });
          return;
        }
      }

      // Check if Cash/Bank is empty
      const isCashBankEmpty = !currentItem.cashBank.trim();

      // Special case: If at cashBank field and it's empty, skip to reference bill amount field
      if (fieldType === 'cashBank' && isCashBankEmpty) {
        if (billDetails.length > 0) {
          setCurrentBillRowIndex(0);
          setTimeout(() => document.getElementById(`bill_${billDetails[0].id}_amount`)?.focus(), 0);
        } else {
          setTimeout(() => saveButtonRef.current?.focus(), 0);
        }
        return;
      }

      // Special case: If at amount field and amount is not entered, don't move to next row
      if (fieldType === 'amount' && (!currentItem.amount || parseFloat(currentItem.amount) <= 0)) {
        return;
      }

      // Move to next field in same row
      const currentFieldIndex = paymentFields.indexOf(fieldType);
      if (currentFieldIndex < paymentFields.length - 1) {
        // Special case for skipping CHQ fields
        if (fieldType === 'type' && currentItem.type !== 'CHQ') {
          const narrationFieldId = `payment_${currentItem.id}_narration`;
          setTimeout(() => document.getElementById(narrationFieldId)?.focus(), 0);
        } 
        else if (fieldType === 'chqNo' && currentItem.type !== 'CHQ') {
          const narrationFieldId = `payment_${currentItem.id}_narration`;
          setTimeout(() => document.getElementById(narrationFieldId)?.focus(), 0);
        }
        else if (fieldType === 'chqDt' && currentItem.type !== 'CHQ') {
          const narrationFieldId = `payment_${currentItem.id}_narration`;
          setTimeout(() => document.getElementById(narrationFieldId)?.focus(), 0);
        }
        else {
          const nextFieldId = `payment_${currentItem.id}_${paymentFields[currentFieldIndex + 1]}`;
          setTimeout(() => document.getElementById(nextFieldId)?.focus(), 0);
        }
      } else {
        // Last field in current row
        if (rowIndex < paymentItems.length - 1) {
          const nextItem = paymentItems[rowIndex + 1];
          
          if (!nextItem.cashBank.trim()) {
            if (billDetails.length > 0) {
              setCurrentBillRowIndex(0);
              setTimeout(() => document.getElementById(`bill_${billDetails[0].id}_amount`)?.focus(), 0);
            } else {
              setTimeout(() => saveButtonRef.current?.focus(), 0);
            }
          } else {
            const nextFieldId = `payment_${nextItem.id}_${paymentFields[0]}`;
            setTimeout(() => document.getElementById(nextFieldId)?.focus(), 0);
          }
        } else {
          if (currentItem.cashBank.trim() && currentItem.amount && parseFloat(currentItem.amount) > 0) {
            const newId = Math.max(...paymentItems.map(item => item.id), 0) + 1;
            setPaymentItems(prev => [
              ...prev,
              {
                id: newId,
                sNo: prev.length + 1,
                cashBank: '',
                cashBankCode: '',
                crDr: 'CR',
                type: 'CASH',
                chqNo: '',
                chqDt: '',
                narration: '',
                amount: '0.00'
              }
            ]);
            setTimeout(() => {
              document.getElementById(`payment_${newId}_cashBank`)?.focus();
            }, 0);
          } else {
            if (billDetails.length > 0) {
              setCurrentBillRowIndex(0);
              setTimeout(() => document.getElementById(`bill_${billDetails[0].id}_amount`)?.focus(), 0);
            } else {
              setTimeout(() => saveButtonRef.current?.focus(), 0);
            }
          }
        }
      }
    }
    
    // Open Cash/Bank popup on typing
    if (fieldType === 'cashBank' && e.key !== 'Enter' && e.key !== 'Tab' && e.key !== 'Shift') {
      if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        setTimeout(() => {
          openCashBankPopup(paymentItems[rowIndex].id, rowIndex);
        }, 100);
      }
    }
  };

  // Handle bill amount keydown with arrow support
  const handleBillAmountKeyDown = (e, rowIndex) => {
    // Arrow key navigation
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      navigateWithArrow(e.key.replace('Arrow', '').toLowerCase(), '', rowIndex, 'amount');
      return;
    }
    
    // Existing Enter key navigation
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Check if there's a next row
      if (rowIndex < billDetails.length - 1) {
        const nextBillId = billDetails[rowIndex + 1].id;
        setTimeout(() => {
          const nextInput = document.getElementById(`bill_${nextBillId}_amount`);
          nextInput?.focus();
          setCurrentBillRowIndex(rowIndex + 1);
        }, 0);
      } else {
        setTimeout(() => saveButtonRef.current?.focus(), 0);
      }
    }
  };

  // Handle Save button keydown with arrow support
  const handleSaveButtonKeyDown = (e) => {
    // Arrow key navigation from save button
    if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      if (billDetails.length > 0) {
        focusOnBillField(billDetails.length - 1, billFields.indexOf('amount'));
      } else if (paymentItems.length > 0) {
        focusOnPaymentField(paymentItems.length - 1, paymentFields.length - 1);
      }
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
     
      handleSave();
    }
  };

  // ========== REST OF THE CODE REMAINS THE SAME ==========
  // (All the existing API functions, handlers, and state management code remains unchanged)

  // ---------- API FUNCTIONS ----------
  const fetchNextVoucherNo = useCallback(async () => {
    try {
      if (!userData?.companyCode) {
        console.warn('userData not available yet');
        return;
      }
      setIsLoading(true);
      const url = API_ENDPOINTS.PAYMENTVOUCHER.GETNEXTVNUMBER(userData.companyCode);
      const response = await apiService.get(url);
      console.log('Payment Voucher response:', response);
      if (response.voucherNo) {
        setVoucherDetails(prev => ({
          ...prev,
          voucherNo: response.voucherNo
        }));
      }
    } catch (err) {
      console.error('Error fetching voucher number:', err);
      setError('Failed to fetch voucher number');
    } finally {
      setIsLoading(false);
    }
  }, [userData?.companyCode]);

  const fetchPendingBills = useCallback(async (partyCode) => {
    try {
      if (!partyCode || !userData?.companyCode) return;
      
      setIsLoading(true);
      const url = API_ENDPOINTS.PAYMENTVOUCHER.GETPENDINGBILLS(partyCode, userData.companyCode);
      const response = await apiService.get(url);
      
      const bills = Array.isArray(response) ? response : (response?.data || []);
      
      if (Array.isArray(bills) && bills.length > 0) {
        const mappedBills = bills.map((bill, idx) => ({
          id: idx + 1,
          sNo: idx + 1,
          refNo: bill.invoiceNo || '',
          billNo: bill.vrNo || '',
          date: bill.invoiceDate ? bill.invoiceDate.substring(0, 10) : '',
          billAmount: (bill.netAmount || 0).toString(),
          paidAmount: (bill.paidAmount || 0).toString(),
          balanceAmount: (bill.balanceAmount || 0).toString(),
          amount: ''
        }));
        setBillDetails(mappedBills);
      } else {
        setBillDetails([
          {
            id: 1,
            sNo: 1,
            refNo: '',
            billNo: '',
            date: '',
            billAmount: '',
            paidAmount: '',
            balanceAmount: '',
            amount: ''
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching pending bills:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userData?.companyCode]);

  const fetchSavedVouchers = useCallback(async (page = 1, search = '') => {
    try {
      if (!userData?.companyCode) return;
      setLoadingVouchers(true);
      const url = API_ENDPOINTS.PAYMENTVOUCHER.GETBILLNUMLIST(userData.companyCode);
      const response = await apiService.get(url);
      
      let voucherList = [];
      if (Array.isArray(response)) {
        voucherList = response;
      } else if (Array.isArray(response?.data)) {
        voucherList = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        voucherList = response.data.data;
      }
      
      if (Array.isArray(voucherList) && voucherList.length > 0) {
        const mappedVouchers = voucherList.map(v => ({
          ...v,
          invoiceNo: v.invoiceNo || v.voucherNo || v.billNo || ''
        }));
        
        const filtered = search 
          ? mappedVouchers.filter(v => 
              (v.invoiceNo || '').toLowerCase().includes(search.toLowerCase())
            )
          : mappedVouchers;
        setSavedVouchers(filtered);
      } else {
        setSavedVouchers([]);
      }
    } catch (err) {
      console.error('Error fetching saved vouchers:', err);
      setError('Failed to load vouchers');
      setSavedVouchers([]);
    } finally {
      setLoadingVouchers(false);
    }
  }, [userData?.companyCode]);

 const fetchVoucherDetails = async (voucherNo) => {
  try {
    setIsLoading(true);
    const url = API_ENDPOINTS.PAYMENTVOUCHER.GET_PAYMENT_VOUCHER_DETAILS(voucherNo);
    const response = await apiService.get(url);
    
    if (response?.bledger) {
      const ledger = response.bledger;
      
      const safeFormatDate = (dateValue) => {
        if (!dateValue) return new Date().toISOString().substring(0, 10);
        try {
          if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
          }
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) {
            return new Date().toISOString().substring(0, 10);
          }
          return date.toISOString().substring(0, 10);
        } catch (e) {
          console.warn('Date parsing error:', e);
          return new Date().toISOString().substring(0, 10);
        }
      };
      
      setVoucherDetails({
        voucherNo: ledger.fVouchno || '',
        gstType: ledger.fGSTTYPE || 'CGST/SGST',
        date: safeFormatDate(ledger.fVouchdt),
        costCenter: '',
        accountName: ledger.fRefName || ledger.customerName || '',
        accountCode: ledger.fCucode || '',
        balance: (ledger.fBillAmt || 0).toString()
      });
      
      if (response?.ledgers && Array.isArray(response.ledgers)) {
        const items = response.ledgers.map((item, idx) => ({
          id: idx + 1,
          sNo: idx + 1,
          cashBank: item.accountName || '',
          cashBankCode: item.faccode || '',
          accountCode: item.faccode || '',
          accountName: item.accountName || '',
          crDr: item.fCrDb || 'CR',
          type: item.type || 'CASH',
          chqNo: item.fchqno || '',
          chqDt: safeFormatDate(item.fchqdt),
          narration: item.narration || '',
          amount: (item.fvrAmount || item.fvrAmount || 0).toString()
        }));
        setPaymentItems(items);
        
        // Calculate total amount from ledgers
        const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        setTotalAmount(total);
      }

      // Handle reference bills if present
      if (response?.referenceBills && Array.isArray(response.referenceBills)) {
        const bills = response.referenceBills.map((bill, idx) => ({
          id: idx + 1,
          sNo: idx + 1,
          refNo: '',
          billNo: bill.billNo || '',
          date: safeFormatDate(bill.date),
          billAmount: (bill.billAmount || 0).toString(),
          paidAmount: (bill.paidAmount || 0).toString(),
          balanceAmount: (bill.balanceAmount || 0).toString(),
          amount: (bill.amount || 0).toString()
        }));
        setBillDetails(bills);
        
        // Calculate total bill amount
        const billTotal = bills.reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);
        setBillTotalAmount(billTotal);
      }
      
      // === NEW CODE: Handle collect and issue particulars ===
      if (response?.collect && response?.issue) {
        const updatedParticulars = {
          '500': { 
            available: 0, 
            collect: response.collect.r500 || 0, 
            issue: response.issue.r500 || 0 
          },
          '200': { 
            available: 0, 
            collect: response.collect.r200 || 0, 
            issue: response.issue.r200 || 0 
          },
          '100': { 
            available: 0, 
            collect: response.collect.r100 || 0, 
            issue: response.issue.r100 || 0 
          },
          '50': { 
            available: 0, 
            collect: response.collect.r50 || 0, 
            issue: response.issue.r50 || 0 
          },
          '20': { 
            available: 0, 
            collect: response.collect.r20 || 0, 
            issue: response.issue.r20 || 0 
          },
          '10': { 
            available: 0, 
            collect: response.collect.r10 || 0, 
            issue: response.issue.r10 || 0 
          },
          '5': { 
            available: 0, 
            collect: response.collect.r5 || 0, 
            issue: response.issue.r5 || 0 
          },
          '2': { 
            available: 0, 
            collect: response.collect.r2 || 0, 
            issue: response.issue.r2 || 0 
          },
          '1': { 
            available: 0, 
            collect: response.collect.r1 || 0, 
            issue: response.issue.r1 || 0 
          }
        };
        setParticulars(updatedParticulars);
      }
    }
  } catch (err) {
    console.error('Error fetching voucher details:', err);
    setError('Failed to load voucher details');
    toast.error('Failed to load voucher details: ' + err.message, { autoClose: 3000 });
  } finally {
    setIsLoading(false);
  }
};

  const deleteVoucher = async (voucherNo) => {
    try {
      setIsLoading(true);
      const url = API_ENDPOINTS.PAYMENTVOUCHER.DELETE_PAYMENT_VOUCHER(voucherNo);
      await apiService.del(url);
      setError(null);
      resetForm();
      await fetchNextVoucherNo();
      await fetchSavedVouchers();
    } catch (err) {
      console.error('Error deleting voucher:', err);
      const errorMsg = err.response?.data?.message || 'Failed to delete voucher';
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPartiesWithPagination = useCallback(async (page = 1) => {
    if (page === 1) {
      setIsLoading(true);
      setHasReachedEndOfParties(false);
    } else {
      setIsLoadingMoreParties(true);
    }
    try {
      const url = API_ENDPOINTS.PAYMENTVOUCHER.GETPARTYLIST(
        encodeURIComponent(''),
        page,
        20
      );
      const response = await apiService.get(url);
      const data = response?.data?.data || response?.data || [];
      
      if (Array.isArray(data) && data.length > 0) {
        const formattedData = data.map((party, index) => ({
          id: party.code || `party-${page}-${index}`,
          code: party.code || '',
          name: party.name || '',
          accountName: party.name || '',
          phone: party.phone || '',
        }));
        
        if (page === 1) {
          setAllParties(formattedData);
          setPartyCurrentPage(1);
        } else {
          setAllParties(prev => [...prev, ...formattedData]);
          setPartyCurrentPage(page);
        }
        
        if (data.length < 20) {
          setHasReachedEndOfParties(true);
        }
      } else if (page > 1) {
        setHasReachedEndOfParties(true);
      }
    } catch (err) {
      console.error(`Error loading party list for page ${page}:`, err);
    } finally {
      if (page === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMoreParties(false);
      }
    }
  }, [userData?.companyCode]);

  useEffect(() => {
    if (userData?.companyCode) {
      fetchNextVoucherNo();
      fetchPartiesWithPagination(1);     
    }
  }, [userData?.companyCode, fetchNextVoucherNo, fetchPartiesWithPagination]);

  useEffect(() => {
    const hasCashPayments = paymentItems.some(item => item.type === 'CASH');
    
    if (hasCashPayments) {
      let crTotal = 0;
      let drTotal = 0;
      
      paymentItems.forEach(item => {
        if (item.type === 'CASH' && item.amount) {
          const amount = parseFloat(item.amount) || 0;
          if (item.crDr === 'CR') {
            crTotal += amount;
          } else if (item.crDr === 'DR') {
            drTotal += amount;
          }
        }
      });
      
      const netAmount = Math.abs(crTotal - drTotal);
      setTotalAmount(netAmount);
    } else {
      const total = paymentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      setTotalAmount(total);
    }
  }, [paymentItems]);

  useEffect(() => {
    const total = billDetails.reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);
    setBillTotalAmount(total);
  }, [billDetails]);

  const resetForm = () => {
    setVoucherDetails({
      voucherNo: '',
      gstType: 'CGST/SGST',
      date: new Date().toISOString().substring(0, 10),
      costCenter: '',
      accountName: '',
      accountCode: '',
      balance: '',
      crDr: 'CR'
    });
    setPaymentItems([
      {
        id: 1,
        sNo: 1,
        cashBank: '',
        crDr: 'CR',
        type: 'CASH',
        chqNo: '',
        chqDt: '',
        narration: '',
        amount: ''
      }
    ]);
    setBillDetails([
      {
        id: 1,
        sNo: 1,
        refNo: '',
        billNo: '',
        date: '',
        billAmount: '',
        paidAmount: '',
        balanceAmount: '',
        amount: ''
      }
    ]);
    setError(null);
    setIsEditing(false);
    setOriginalVoucherNo('');
    setFocusedField('');
    setNavigationStep('voucherNo');
    setCurrentPaymentRowIndex(0);
    setCurrentBillRowIndex(0);
    setActiveTopAction('add')
    
    setTimeout(() => {
      if (dateRef.current) {
        dateRef.current.focus();
      }
    }, 100);
    
    fetchNextVoucherNo();
  };

  // --- POPUP HANDLERS ---
  const openEditVoucherPopup = async () => {
    // === PERMISSION CHECK ===
    if (!formPermissions.edit) {
      toast.error('You do not have permission to edit payment vouchers.', { autoClose: 3000 });
      return;
    }
    // === END PERMISSION CHECK ===
    
    try {
      setLoadingVouchers(true);
      await fetchSavedVouchers(1, '');
      setEditVoucherPopupOpen(true);
    } catch (err) {
      console.error('Error opening edit popup:', err);
      setError('Failed to load vouchers');
    } finally {
      setLoadingVouchers(false);
    }
  };

  const openDeleteVoucherPopup = async () => {
    // === PERMISSION CHECK ===
    if (!formPermissions.delete) {
      toast.error('You do not have permission to delete payment vouchers.', { autoClose: 3000 });
      return;
    }
    // === END PERMISSION CHECK ===
    
    try {
      setLoadingVouchers(true);
      await fetchSavedVouchers(1, '');
      setDeleteVoucherPopupOpen(true);
    } catch (err) {
      console.error('Error opening delete popup:', err);
      setError('Failed to load vouchers');
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleVoucherSelect = async (selectedVoucher) => {
    try {
      setIsEditing(true);
      const voucherNo = selectedVoucher.invoiceNo || selectedVoucher.voucherNo;
      setOriginalVoucherNo(voucherNo);
      await fetchVoucherDetails(voucherNo);
      setEditVoucherPopupOpen(false);
    } catch (err) {
      console.error('Error selecting voucher:', err);
      setError('Failed to load voucher');
    }
  };

  const handleVoucherDelete = async (selectedVoucher) => {
    try {
      const voucherNo = selectedVoucher.invoiceNo || selectedVoucher.voucherNo;
      setDeleteVoucherPopupOpen(false);
      setConfirmationPopup({
        isOpen: true,
        title: 'Delete Voucher',
        message: 'Do you want to delete?',
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        action: 'confirmDelete',
        isLoading: false,
        voucherNo: voucherNo
      });
    } catch (err) {
      console.error('Error deleting voucher:', err);
      setError('Failed to delete voucher');
    }
  };
  
  // Handle confirmation popup actions (delete, etc.)
  const handleConfirmationAction = async () => {
    if (confirmationPopup.action === 'confirmDelete') {
      setConfirmationPopup(prev => ({ ...prev, isLoading: true }));
      try {
        await deleteVoucher(confirmationPopup.voucherNo);
      } catch (err) {
        setError('Failed to delete voucher');
      } finally {
        setConfirmationPopup(prev => ({ ...prev, isOpen: false, isLoading: false }));
      }
    } else {
      setConfirmationPopup(prev => ({ ...prev, isOpen: false }));
    }
  };

  const openAccountPopup = async () => {
    try {
      if (allParties.length === 0) {
        setIsLoading(true);
        const url = API_ENDPOINTS.PAYMENTVOUCHER.GETPARTYLIST(
          encodeURIComponent(''),
          1,
          20
        );
        const response = await apiService.get(url);
        const data = response?.data?.data || response?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const formattedData = data.map((party, index) => ({
            id: party.code || `party-${index}`,
            code: party.code || '',
            name: party.name || '',
            accountName: party.name || '',
            phone: party.phone || '',
          }));
          setAllParties(formattedData);
        }
        setIsLoading(false);
      }
      setShowPartyPopup(true);
    } catch (err) {
      console.error('Error opening party popup:', err);
      setError('Failed to load parties');
      setIsLoading(false);
    }
  };

  const handleAccountSelect = async (account) => {
    try {
      setVoucherDetails(prev => ({
        ...prev,
        accountName: account.name || account.accountName || '',
        accountCode: account.code || account.accountCode || ''
      }));
      
      const partyCode = account.code || account.accountCode;
      
      if (partyCode) {
        await fetchPendingBills(partyCode);
        
        try {
          const balanceUrl = API_ENDPOINTS.RECEIPTVOUCHER.GET_PARTY_BALANCE(partyCode);
          const balanceResponse = await apiService.getSilent(balanceUrl);
          console.log('Party Balance Response:', balanceResponse);
          
          if (balanceResponse) {
            const balance = balanceResponse.balanceAmount || 0;
            const balanceType = balanceResponse.balanceType || 'CR';
            setVoucherDetails(prev => ({
              ...prev,
              balance: balance.toString(),
              crDr: balanceType
            }));
          }
        } catch (err) {
          console.error('Error fetching party balance:', err);
        }
      }
      
      setShowPartyPopup(false);
      setPartySearchTerm('');
      setTimeout(() => {
        gstTypeRef.current?.focus();
        setNavigationStep('gstType');
      }, 100);
    } catch (err) {
      console.error('Error selecting party:', err);
    }
  };

  const handleCashBankSelect = (party) => {
    if (cashBankPopupContext) {
      const { paymentItemId, index } = cashBankPopupContext;
      handlePaymentItemChange(paymentItemId, 'cashBank', party.name || party.accountName || '');
      handlePaymentItemChange(paymentItemId, 'cashBankCode', party.code || party.accountCode || '');
      
      setTimeout(() => {
        if (paymentCrDrRefs.current[index]) {
          paymentCrDrRefs.current[index].focus();
          setNavigationStep('paymentCrDr');
        }
      }, 100);
    }
    setShowCashBankPopup(false);
    setCashBankPopupContext(null);
  };

  const openCashBankPopup = (paymentItemId, index) => {
    setCashBankPopupContext({ paymentItemId, index });
    setShowCashBankPopup(true);
  };

  const getPopupConfig = (type) => {
    const configs = {
      account: {
        title: 'Select Party/Account',
        displayFieldKeys: [ 'name'],
        searchFields: ['name',],
        headerNames: ['Name'],
        columnWidths: {  name: '300px' },
        data: allParties.length > 0 ? allParties : [],
        fetchItems: async () => {
          if (!hasReachedEndOfParties && !isLoadingMoreParties) {
            await fetchPartiesWithPagination(partyCurrentPage + 1);
          }
          return allParties;
        },
        loading: isLoading || isLoadingMoreParties,
        hasMoreData: !hasReachedEndOfParties,
        onLoadMore: () => {
          if (!hasReachedEndOfParties && !isLoadingMoreParties) {
            fetchPartiesWithPagination(partyCurrentPage + 1);
          }
        }
      },
      cashBank: {
        title: 'Select Cash/Bank Account',
        displayFieldKeys: [ 'name'],
        searchFields: ['name'],
        headerNames: [ 'Name'],
        columnWidths: {  name: '300px' },
        data: allParties.length > 0 ? allParties : [],
        fetchItems: async () => {
          if (!hasReachedEndOfParties && !isLoadingMoreParties) {
            await fetchPartiesWithPagination(partyCurrentPage + 1);
          }
          return allParties;
        },
        loading: isLoading || isLoadingMoreParties,
        hasMoreData: !hasReachedEndOfParties,
        onLoadMore: () => {
          if (!hasReachedEndOfParties && !isLoadingMoreParties) {
            fetchPartiesWithPagination(partyCurrentPage + 1);
          }
        }
      },
      editVoucher: {
        title: 'Edit Payment Voucher',
        displayFieldKeys: ['invoiceNo'],
        searchFields: ['invoiceNo'],
        headerNames: ['Voucher No'],
        columnWidths: { invoiceNo: '200px' },
        data: savedVouchers,
        fetchItems: async () => savedVouchers,
        loading: loadingVouchers
      },
      deleteVoucher: {
        title: 'Delete Payment Voucher',
        displayFieldKeys: ['invoiceNo'],
        searchFields: ['invoiceNo'],
        headerNames: ['Voucher No'],
        columnWidths: { invoiceNo: '200px' },
        data: savedVouchers,
        fetchItems: async () => savedVouchers,
        loading: loadingVouchers
      }
    };
    return configs[type];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVoucherDetails(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'accountName') {
      setPartySearchTerm(value);
    }
  };

  const handleBackspace = (e, fieldName) => {
    if (e.key === 'Backspace') {
      if (fieldName === 'accountName') {
        setVoucherDetails(prev => ({
          ...prev,
          accountName: '',
          accountCode: ''
        }));
      }
    }
  };

  const handlePaymentItemChange = (id, field, value) => {
    console.log(`🔵 DEBUG - handlePaymentItemChange: id=${id}, field="${field}", value="${value}"`);
    setPaymentItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Automatically set current date when type changes to CHQ
          if (field === 'type' && value === 'CHQ' && !item.chqDt) {
            updatedItem.chqDt = new Date().toISOString().substring(0, 10);
          }
          console.log(`🟢 DEBUG - Item ${id} updated:`, updatedItem);
          return updatedItem;
        }
        return item;
      });
      console.log(`🟡 DEBUG - FULL Payment Items Array (Length: ${updated.length}):`, updated);
      return updated;
    });
    if (field === 'cashBank') {
      setCashBankSearchTerm(value);
    }
  };

  const handleBillItemChange = (id, field, value) => {
    setBillDetails(prev =>
      prev.map(bill =>
        bill.id === id ? { ...bill, [field]: value } : bill
      )
    );
  };

  const handleDeletePaymentRow = (id) => {
    if (paymentItems.length === 1) {
      setError('At least one payment item is required');
      return;
    }
    setPaymentItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      return filtered.map((item, idx) => ({
        ...item,
        sNo: idx + 1
      }));
    });
  };

  const handleDeleteBillRow = (id) => {
    setBillDetails(prev => {
      const filtered = prev.filter(bill => bill.id !== id);
      return filtered.map((bill, idx) => ({
        ...bill,
        sNo: idx + 1
      }));
    });
  };

  const handleAddPaymentRow = () => {
    const newId = Math.max(...paymentItems.map(item => item.id), 0) + 1;
    const newSNo = paymentItems.length + 1;
    console.log(`🔴 DEBUG - Adding new payment row: newId=${newId}, newSNo=${newSNo}`);
    setPaymentItems(prev => {
      const updated = [
        ...prev,
        {
          id: newId,
          sNo: newSNo,
          cashBank: '',
          cashBankCode: '',
          crDr: 'CR',
          type: 'CASH',
          chqNo: '',
          chqDt: '',
          narration: '',
          amount: '0.00'
        }
      ];
      console.log(`🟡 DEBUG - FULL Payment Items Array after ADD (Length: ${updated.length}):`, updated);
      return updated;
    });
  };

  const handleAddBillRow = () => {
    const newId = Math.max(...billDetails.map(bill => bill.id), 0) + 1;
    const newSNo = billDetails.length + 1;
    setBillDetails(prev => [
      ...prev,
      {
        id: newId,
        sNo: newSNo,
        refNo: '',
        billNo: '',
        date: '',
        billAmount: '0.00',
        paidAmount: '0.00',
        balanceAmount: '0.00',
        amount: '0.00'
      }
    ]);
  };

  const handleEditClick = () => {
    openEditVoucherPopup();
  };

  const handleDeleteClick = () => {
    openDeleteVoucherPopup();
  };

  const handleClear = () => {
    resetForm();
  };

  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().substring(0, 10);
  };

  const savePaymentVoucher = async (updatedParticulars = null) => {
    try {
      if (!voucherDetails.voucherNo) {
        setError('Voucher number is required');
        toast.error('Voucher number is required', { autoClose: 3000 });
        return;
      }
      if (!voucherDetails.accountName) {
        setError('Account is required');
        toast.error('Account is required', { autoClose: 3000 });
        return;
      }
      if (paymentItems.length === 0) {
        setError('At least one payment item is required');
        toast.error('At least one payment item is required', { autoClose: 3000 });
        return;
      }

      const validPaymentItems = paymentItems.filter(item => item.cashBank && parseFloat(item.amount) > 0);
      
      if (validPaymentItems.length === 0) {
        setError('At least one payment item with Cash/Bank account and amount is required');
        toast.error('At least one payment item with Cash/Bank account and amount is required', { autoClose: 3000 });
        return;
      }

      setIsSaving(true);

      const particularsToUse = updatedParticulars || particulars;

      // Check if there are CASH type payments
      const hasCashPayments = paymentItems.some(item => {
        const typeValue = (item.type || '').toString().trim().toUpperCase();
        const hasAmount = item.amount && parseFloat(item.amount) > 0;
        return typeValue === 'CASH' && hasAmount;
      });

      let givenTotal = 0;
      let issuedTotal = 0;
      const denominations = [500, 200, 100, 50, 20, 10, 5, 2, 1];
      
      denominations.forEach(denom => {
        const denomKey = denom.toString();
        const collectValue = particularsToUse[denomKey]?.collect;
        const collectCount = parseInt(collectValue) || 0;
        givenTotal += collectCount * denom;
        
        const issueValue = particularsToUse[denomKey]?.issue;
        const issueCount = parseInt(issueValue) || 0;
        issuedTotal += issueCount * denom;
      });

      // **VALIDATION: Net Amount = Collected Amount - Issued Amount (ONLY FOR CASH PAYMENTS)**
      if (hasCashPayments) {
        const netAmount = givenTotal - issuedTotal;
        if (Math.abs(netAmount) !== Math.abs(totalAmount)) {
          const errorMessage = `Net amount not tallying`;
          setError(errorMessage);
          setConfirmationPopup({
            isOpen: true,
            title: 'Validation Error',
            message: errorMessage,
            type: 'warning',
            confirmText: 'OK',
            cancelText: null,
            action: null,
            isLoading: false
          });
          setIsSaving(false);
          return;
        }
      }
      
      const balanceGiven = givenTotal - totalAmount;

      const payload = {
        voucherNo: voucherDetails.voucherNo,
        voucherDate: formatDateToYYYYMMDD(voucherDetails.date),
        customerCode: voucherDetails.accountCode,
        customerName: voucherDetails.accountName,
        gstType: voucherDetails.gstType,
        partyBalance: parseFloat(voucherDetails.balance) || 0,
        totalAmt: totalAmount,
        compcode: userData?.companyCode || '',
        usercode: userData?.username || '',
        givenTotal: givenTotal,
        balanceGiven: balanceGiven,
        itemDetailsList1: validPaymentItems.map(item => ({
          accountCode: item.cashBankCode || '',
          accountName: item.cashBank || '',
          crdr: item.crDr || 'CR',
          type: item.type || '',
          amount: parseFloat(item.amount) || 0,
          chequeNo: item.chqNo || '',
          chequeDate: item.chqDt ? formatDateToYYYYMMDD(item.chqDt) : '',
          narration: item.narration || ''
        })),
        referenceBills1: billDetails.filter(bill => bill.amount && bill.amount !== '0.00').map(bill => ({
          refNo: bill.refNo || '',
          date: bill.date ? formatDateToYYYYMMDD(bill.date) : '',
          amount: (parseFloat(bill.amount) || 0).toString()
        })),
        collect: {
          r500: parseInt(particularsToUse['500']?.collect) || 0,
          r200: parseInt(particularsToUse['200']?.collect) || 0,
          r100: parseInt(particularsToUse['100']?.collect) || 0,
          r50: parseInt(particularsToUse['50']?.collect) || 0,
          r20: parseInt(particularsToUse['20']?.collect) || 0,
          r10: parseInt(particularsToUse['10']?.collect) || 0,
          r5: parseInt(particularsToUse['5']?.collect) || 0,
          r2: parseInt(particularsToUse['2']?.collect) || 0,
          r1: parseInt(particularsToUse['1']?.collect) || 0
        },
        issue: {
          r500: parseInt(particularsToUse['500']?.issue) || 0,
          r200: parseInt(particularsToUse['200']?.issue) || 0,
          r100: parseInt(particularsToUse['100']?.issue) || 0,
          r50: parseInt(particularsToUse['50']?.issue) || 0,
          r20: parseInt(particularsToUse['20']?.issue) || 0,
          r10: parseInt(particularsToUse['10']?.issue) || 0,
          r5: parseInt(particularsToUse['5']?.issue) || 0,
          r2: parseInt(particularsToUse['2']?.issue) || 0,
          r1: parseInt(particularsToUse['1']?.issue) || 0
        }
      };

      console.log('Saving Payment Voucher with payload:', JSON.stringify(payload, null, 2));

      const url = API_ENDPOINTS.PAYMENTVOUCHER.POST_PAYMENT_VOUCHER(!isEditing);
      const response = await apiService.post(url, payload);

      if (response) {
        setError(null);
        resetForm();
        await fetchNextVoucherNo();
        await fetchSavedVouchers();
      }
    } catch (err) {
      console.error('Error saving voucher:', err);
      
      if (err.response?.status === 409) {
        const errorMsg = 'Payment Voucher already exists';
        setError(errorMsg);
        toast.error(errorMsg, { autoClose: 3000 });
        setIsSaving(false);
        return;
      }
      
      const errorMsg = err.response?.data?.message || 'Failed to save voucher';
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`, { autoClose: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const calculateCashTotals = () => {
    let crTotal = 0;
    let drTotal = 0;

    console.log('🔍 DEBUG - Payment Items Array Length:', paymentItems.length);
    paymentItems.forEach((item, idx) => {
      console.log(`  Item ${idx}:`, {
        id: item.id,
        type: item.type,
        typeLength: item.type?.length,
        typeEmpty: item.type === '',
        typeIsCASH: item.type === 'CASH',
        crDr: item.crDr,
        amount: item.amount
      });
    });

    paymentItems.forEach(item => {
      if (item.type === 'CASH' && item.amount) {
        const amount = parseFloat(item.amount) || 0;
        if (item.crDr === 'CR') {
          crTotal += amount;
        } else if (item.crDr === 'DR') {
          drTotal += amount;
        }
      }
    });

    const netAmount = Math.abs(crTotal - drTotal);

    const result = {
      crTotal: crTotal.toFixed(2),
      drTotal: drTotal.toFixed(2),
      netAmount: netAmount.toFixed(2),
      hasOnlyCash: paymentItems.every(item => item.type === 'CASH' || !item.type)
    };

    console.log('📊 calculateCashTotals Result:', result);
    return result;
  };

  const handleSave = async () => {
    // Validate all CHQ rows before saving
    const missingChq = paymentItems.find(item => (item.type || '').toString().trim().toUpperCase() === 'CHQ' && (!item.chqNo?.trim() || !item.chqDt));
    if (missingChq) {
      setConfirmationPopup({
        isOpen: true,
        title: 'Validation Error',
        message: 'Chq No and Chq Dt are mandatory for cheque entries. Please fill them before saving.',
        type: 'warning',
        confirmText: 'OK',
        cancelText: null,
        action: null,
        isLoading: false
      });
      return;
    }
    
    // === PERMISSION CHECK ===
    const action = isEditing ? 'edit' : 'add';
    const hasPermission = action === 'add' ? formPermissions.add : formPermissions.edit;
    if (!hasPermission) {
      const actionText = action === 'add' ? 'create' : 'modify';
      toast.error(`You do not have permission to ${actionText} payment vouchers.`, { autoClose: 3000 });
      return;
    }
    // === END PERMISSION CHECK ===

    const cashTotals = calculateCashTotals();

    // Check for any CASH payment with amount > 0
    const hasCashPayments = paymentItems.some(item => {
      const typeValue = (item.type || '').toString().trim().toUpperCase();
      const hasAmount = item.amount && parseFloat(item.amount) > 0;
      return typeValue === 'CASH' && hasAmount;
    });

    if (hasCashPayments) {
      const confirmationData = {
        cashTotals: cashTotals,
        hasCashPayments: hasCashPayments
      };
      setSaveConfirmationData(confirmationData);
      showSaveConfirmation();
    } else {
      setSaveConfirmation(true);
    }
  };

  const showSaveConfirmation = () => {
    setSaveConfirmationOpen(true);
  };

  const handleConfirmedSave = async (updatedParticulars) => {
    setSaveConfirmationOpen(false);
    await savePaymentVoucher(updatedParticulars);
  };

  const handleCancelSave = () => {
    setSaveConfirmationOpen(false);
    setSaveConfirmationData(null);
  };

  // --- RESPONSIVE STYLES ---
  const TYPOGRAPHY = {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: isMobileView ? '10px' : screenSize.isTablet ? '11px' : '12px',
      sm: isMobileView ? '11px' : screenSize.isTablet ? '12px' : '13px',
      base: isMobileView ? '12px' : screenSize.isTablet ? '13px' : '14px',
      lg: isMobileView ? '13px' : screenSize.isTablet ? '14px' : '16px',
      xl: isMobileView ? '14px' : screenSize.isTablet ? '16px' : '18px'
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
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      paddingBottom: isMobileView ? '140px' : screenSize.isTablet ? '100px' : '90px',
      overflowX: 'hidden',
      overflowY: 'auto',
      position: 'relative',
    },
    headerSection: {
      flex: '0 0 auto',
      backgroundColor: 'white',
      borderRadius: 0,
      padding: isMobileView ? '8px' : screenSize.isTablet ? '12px' : '10px',
      margin: 0,
      marginBottom: 0,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    tableSection: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden',
      WebkitOverflowScrolling: 'touch',
    },
    formRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobileView ? '8px' : '12px',
    },
    formField: {
      display: 'grid',
      gridTemplateColumns: isMobileView ? '1fr' : screenSize.isTablet ? '1fr 1fr' : 'repeat(5, 1fr)',
      gap: isMobileView ? '8px' : screenSize.isTablet ? '10px' : '12px',
      alignItems: 'end',
      width: '100%',
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: isMobileView ? 'column' : 'row',
      justifyContent: 'center',
      alignItems: isMobileView ? 'flex-start' : 'center',
      gap: isMobileView ? '4px' : '8px',
      width: '100%',
    },
    inlineLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#333',
      minWidth: isMobileView ? 'auto' : '85px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      paddingTop: '2px',
      width: isMobileView ? '100%' : 'auto',
    },
    inlineInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: isMobileView ? '6px 8px' : '8px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
      width: '100%',
      height: isMobileView ? '36px' : '32px',
      flex: 1,
      minWidth: '0',
    },
    inlineInputFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: isMobileView ? '6px 8px' : '8px 10px',
      border: '2px solid #1B91DA',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
      width: '100%',
      height: isMobileView ? '36px' : '32px',
      flex: 1,
      minWidth: '0',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
    },
    inlineInputClickable: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: isMobileView ? '6px 8px' : '8px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
      width: '100%',
      height: isMobileView ? '36px' : '32px',
      flex: 1,
      minWidth: '0',
      cursor: 'pointer',
      backgroundColor: 'white',
    },
    inlineInputClickableFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: isMobileView ? '6px 8px' : '8px 10px',
      border: '2px solid #1B91DA',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
      width: '100%',
      height: isMobileView ? '36px' : '32px',
      flex: 1,
      minWidth: '0',
      cursor: 'pointer',
      backgroundColor: 'white',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: 8,
      overflowX: 'auto',
      overflowY: 'auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      margin: isMobileView ? '4px' : '8px',
      marginTop: isMobileView ? '4px' : '8px',
      marginBottom: isMobileView ? '4px' : '8px',
      WebkitOverflowScrolling: 'touch',
      width: isMobileView ? 'calc(100% - 8px)' : 'calc(100% - 16px)',
      boxSizing: 'border-box',
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      minHeight: isMobileView ? '200px' : screenSize.isTablet ? '280px' : '360px',
    },
    table: {
      width: screenSize.isMobile ? '100%' : screenSize.isTablet ? '100%' : 'max-content',
      minWidth: '100%',
      borderCollapse: 'collapse',
      tableLayout: screenSize.isMobile ? 'auto' : screenSize.isTablet ? 'auto' : 'fixed',
    },
    th: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      backgroundColor: '#1B91DA',
      color: 'white',
      padding: isMobileView ? '4px 2px' : screenSize.isTablet ? '6px 4px' : '8px 6px',
      textAlign: 'center',
      letterSpacing: '0.5px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      border: '1px solid white',
      borderBottom: '2px solid white',
      whiteSpace: 'nowrap',
      minWidth: isMobileView ? '40px' : screenSize.isTablet ? '50px' : '60px',
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
      minWidth: isMobileView ? '40px' : screenSize.isTablet ? '50px' : '60px',
    },
    editableInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      display: 'block',
      width: '100%',
      height: '100%',
      minHeight: isMobileView ? '28px' : '32px',
      padding: isMobileView ? '2px 3px' : screenSize.isTablet ? '3px 5px' : '4px 6px',
      boxSizing: 'border-box',
      border: 'none',
      borderRadius: '4px',
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
      minHeight: isMobileView ? '28px' : '32px',
      padding: isMobileView ? '2px 3px' : screenSize.isTablet ? '3px 5px' : '4px 6px',
      boxSizing: 'border-box',
      border: '2px solid #1B91DA',
      borderRadius: '4px',
      textAlign: 'center',
      backgroundColor: 'transparent',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
    },
    footerSection: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: isMobileView ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobileView ? '6px 4px' : '8px 10px',
      backgroundColor: 'white',
      borderTop: '2px solid #e0e0e0',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
      gap: isMobileView ? '6px' : '10px',
      flexWrap: 'wrap',
      flexShrink: 0,
      minHeight: isMobileView ? 'auto' : '60px',
      width: '100%',
      boxSizing: 'border-box',
      zIndex: 100,
    },
    totalsContainer: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: isMobileView ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#1B91DA',
      padding: isMobileView ? '4px 6px' : '6px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: isMobileView ? '10px' : '20px',
      minWidth: 'max-content',
      justifyContent: 'center',
      flex: 1,
      order: isMobileView ? 2 : 0,
      borderRadius: '4px',
      backgroundColor: '#f0f8ff',
      width: isMobileView ? '100%' : 'auto',
      boxSizing: 'border-box',
    },
    totalItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
    },
    totalLabel: {
      fontSize: isMobileView ? '9px' : '11px',
      color: '#555',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    totalValue: {
      fontSize: isMobileView ? '12px' : '14px',
      color: '#1976d2',
      fontWeight: 'bold',
    },
    leftColumn: {
      display: 'flex',
      gap: isMobileView ? '6px' : '10px',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: 'auto',
      flex: '0 0 auto',
      order: 0,
      width: isMobileView ? '100%' : 'auto',
      justifyContent: isMobileView ? 'center' : 'flex-start',
    },
    rightColumn: {
      display: 'flex',
      gap: isMobileView ? '6px' : '10px',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: 'auto',
      flex: '0 0 auto',
      order: 0,
      width: isMobileView ? '100%' : 'auto',
      justifyContent: isMobileView ? 'center' : 'flex-end',
    },
    footerButtons: {
      display: 'flex',
      gap: isMobileView ? '4px' : '8px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      width: isMobileView ? '100%' : 'auto',
      order: isMobileView ? 3 : 0,
    },
    errorContainer: {
      background: '#fff1f2',
      color: '#9f1239',
      padding: '10px',
      borderRadius: '6px',
      marginBottom: '10px',
      textAlign: 'center',
      borderLeft: '4px solid #ef4444',
      fontSize: '13px',
      fontFamily: TYPOGRAPHY.fontFamily,
      margin: '0 10px',
      marginTop: '10px',
    },
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: TYPOGRAPHY.fontFamily,
    },
    loadingBox: {
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center',
    },
    mobileTableHeader: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#1B91DA',
      padding: isMobileView ? '8px 12px 0 12px' : '12px 16px 0 16px',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        /* Hide number spinners in amount fields */
        input[type="number"] {
          -webkit-appearance: none;
          -moz-appearance: textfield;
        }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        /* Better mobile scrolling */
        @media (max-width: 768px) {
          table {
            font-size: 11px;
          }
          input, select {
            font-size: 14px !important;
            padding: 8px !important;
          }
        }
        
        /* Prevent text zoom on mobile */
        @media (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
      
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <p>Loading...</p>
          </div>
        </div>
      )}
  
      {/* HEADER SECTION */}
      <div style={styles.headerSection}>
        <div style={styles.formRow}>
          <div style={styles.formField}>
            {/* Voucher No */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>Voucher No</label>
              <input
                ref={voucherNoRef}
                type="text"
                name="voucherNo"
                value={voucherDetails.voucherNo || ''}
                onChange={handleInputChange}
                onFocus={() => {
                  setFocusedField('voucherNo');
                  setNavigationStep('voucherNo');
                }}
                onBlur={() => setFocusedField('')}
                style={focusedField === 'voucherNo' ? styles.inlineInputFocused : styles.inlineInput}
                onKeyDown={(e) => handleHeaderFieldKeyDown(e, 'voucherNo')}
                readOnly
              />
            </div>

            {/* Date */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>Date</label>
              <input
                ref={dateRef}
                type="date"
                name="date"
                value={voucherDetails.date || ''}
                onChange={handleInputChange}
                onFocus={() => {
                  setFocusedField('date');
                  setNavigationStep('date');
                }}
                onBlur={() => setFocusedField('')}
                style={focusedField === 'date' ? styles.inlineInputFocused : styles.inlineInput}
                onKeyDown={(e) => handleHeaderFieldKeyDown(e, 'date')}
              />
            </div>

            {/* A/C Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>A/C Name</label>
              <div style={{ position: 'relative', width: '100%', flex: 1 }}>
                <input
                  ref={accountNameRef}
                  type="text"
                  name="accountName"
                  value={voucherDetails.accountName || ''}
                  onChange={handleInputChange}
                  onFocus={() => {
                    setFocusedField('accountName');
                    setNavigationStep('accountName');
                  }}
                  onBlur={() => setFocusedField('')}
                  onClick={openAccountPopup}
                  onKeyDown={(e) => handleHeaderFieldKeyDown(e, 'accountName')}
                  onKeyUp={(e) => handleBackspace(e, 'accountName')}
                  style={{
                    ...(focusedField === 'accountName'
                      ? styles.inlineInputClickableFocused
                      : styles.inlineInputClickable),
                    width: '100%',
                    paddingRight: isMobileView ? '30px' : '34px'
                  }}
                />
                {/* 🔍 Search Icon */}
                <div
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    opacity: 0.65,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <SearchIcon size={isMobileView ? 14 : 16} />
                </div>
              </div>
              <div> <PopupScreenModal screenIndex={6} /> </div>
            </div>

            {/* Balance */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>Balance</label>
              <input
                ref={balanceRef}
                name="balance"
                value={voucherDetails.balance + ' ' + (voucherDetails.crDr || '')}
                onChange={handleInputChange}
                onFocus={() => {
                  setFocusedField('balance');
                  setNavigationStep('balance');
                }}
                onBlur={() => setFocusedField('')}
                onKeyDown={(e) => handleHeaderFieldKeyDown(e, 'balance')}
                style={focusedField === 'balance' ? styles.inlineInputFocused : styles.inlineInput}
                readOnly
              />
            </div>

            {/* GST Type */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>GST Type</label>
              <select
                ref={gstTypeRef}
                name="gstType"
                value={voucherDetails.gstType || 'CGST/SGST'}
                onChange={handleInputChange}
                onFocus={() => {
                  setFocusedField('gstType');
                  setNavigationStep('gstType');
                }}
                onBlur={() => setFocusedField('')}
                style={focusedField === 'gstType' ? styles.inlineInputFocused : styles.inlineInput}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    return;
                  }
                  handleHeaderFieldKeyDown(e, 'gstType');
                }}
              >
                <option>CGST/SGST</option>
                <option>IGST</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
   <div style={styles.tableSection}>
  {/* PAYMENT DETAILS TABLE */}
  <div style={{...styles.tableContainer, marginBottom: isMobileView ? '4px' : '10px', marginTop: isMobileView ? '4px' : '10px'}}>
    <h2 style={styles.mobileTableHeader}></h2>
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={{...styles.th, minWidth: isMobileView ? '40px' : '60px'}}>No</th>
          <th style={{...styles.th, minWidth: isMobileView ? '150px' : '200px'}}>Cash/Bank</th>
          <th style={{...styles.th, minWidth: isMobileView ? '60px' : '80px'}}>Cr/Dr</th>
          <th style={{...styles.th, minWidth: isMobileView ? '60px' : '80px'}}>Type</th>
          <th style={{...styles.th, minWidth: isMobileView ? '70px' : '90px'}}>Chq No</th>
          <th style={{...styles.th, minWidth: isMobileView ? '80px' : '90px'}}>Chq Dt</th>
          <th style={{...styles.th, minWidth: isMobileView ? '120px' : '150px'}}>Narration</th>
          <th style={{...styles.th, minWidth: isMobileView ? '80px' : '100px'}}>Amount</th>
          <th style={{...styles.th, minWidth: isMobileView ? '50px' : '60px'}}>Remove</th>
        </tr>
      </thead>
      <tbody>
        {console.log(`🔵 DEBUG - Rendering ${paymentItems.length} payment items:`, paymentItems)}
        {paymentItems.map((item, index) => {
          console.log(`🟢 DEBUG - Rendering row ${index}: id=${item.id}, type="${item.type}", cashBank="${item.cashBank}"`);
          return (
          <tr key={item.id}>
            <td style={styles.td}>{item.sNo}</td>
            {/* Cash/Bank - Left Aligned */}
            <td style={styles.td}>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={el => paymentCashBankRefs.current[index] = el}
                  id={`payment_${item.id}_cashBank`}
                  type="text"
                  value={item.cashBank}
                  onChange={(e) => handlePaymentItemChange(item.id, 'cashBank', e.target.value)}
                  onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'cashBank')}
                  onClick={() => openCashBankPopup(item.id, index)}
                  onFocus={(e) => {
                    e.target.style.border = '2px solid #1B91DA';
                    setNavigationStep('paymentCashBank');
                    setCurrentPaymentRowIndex(index);
                  }}
                  onBlur={(e) => (e.target.style.border = 'none')}
                  style={{
                    ...(navigationStep === 'paymentCashBank' && currentPaymentRowIndex === index ? styles.editableInputFocused : styles.editableInput),
                    textAlign: 'left', // Left aligned for Cash/Bank
                    paddingRight: isMobileView ? '24px' : '28px',
                    width: '100%'
                  }}
                  title="Click to select or type to search"
                />
                {/* 🔍 Search Icon */}
                <div
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    opacity: 0.65,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <SearchIcon size={isMobileView ? 12 : 14} />
                </div>
              </div>
            </td>
            
            {/* Cr/Dr - No change (select dropdown) */}
            <td style={styles.td}>
              <select
                ref={el => paymentCrDrRefs.current[index] = el}
                id={`payment_${item.id}_crDr`}
                value={item.crDr}
                onChange={(e) => handlePaymentItemChange(item.id, 'crDr', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    return;
                  }
                  handlePaymentFieldKeyDown(e, index, 'crDr');
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #1B91DA';
                  setNavigationStep('paymentCrDr');
                  setCurrentPaymentRowIndex(index);
                }}
                onBlur={(e) => (e.target.style.border = 'none')}
                style={navigationStep === 'paymentCrDr' && currentPaymentRowIndex === index ? styles.editableInputFocused : styles.editableInput}
              >
                <option>CR</option>
                <option>DR</option>
              </select>
            </td>
            
            {/* Type - No change (select dropdown) */}
            <td style={styles.td}>
              <select
                ref={el => paymentTypeRefs.current[index] = el}
                id={`payment_${item.id}_type`}
                value={item.type || 'CASH'}
                onChange={(e) => {
                  console.log(`🟠 SELECT onChange fired: item.id=${item.id}, e.target.value="${e.target.value}"`);
                  handlePaymentItemChange(item.id, 'type', e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    return;
                  }
                  handlePaymentFieldKeyDown(e, index, 'type');
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #1B91DA';
                  setNavigationStep('paymentType');
                  setCurrentPaymentRowIndex(index);
                }}
                onBlur={(e) => (e.target.style.border = 'none')}
                style={navigationStep === 'paymentType' && currentPaymentRowIndex === index ? styles.editableInputFocused : styles.editableInput}
              >
                <option value="CASH">CASH</option>
                <option value="CHQ">CHQ</option>
                <option value="RTGS">RTGS</option>
                <option value="NEFT">NEFT</option>
                <option value="UPI">UPI</option>
              </select>
            </td>
            
            {/* Chq No - Left Aligned */}
            <td style={styles.td}>
              <input
                ref={el => paymentChqNoRefs.current[index] = el}
                id={`payment_${item.id}_chqNo`}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                type="text"
                value={item.chqNo}
                onChange={(e) => handlePaymentItemChange(item.id, 'chqNo', e.target.value)}
                onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'chqNo')}
                disabled={item.type !== 'CHQ'}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #1B91DA';
                  setNavigationStep('paymentChqNo');
                  setCurrentPaymentRowIndex(index);
                }}
                onBlur={(e) => (e.target.style.border = 'none')}
                style={{
                  ...(navigationStep === 'paymentChqNo' && currentPaymentRowIndex === index ? styles.editableInputFocused : styles.editableInput),
                  textAlign: 'right', // Left aligned for Chq No
                  ...(item.type !== 'CHQ' && { opacity: 0.5, cursor: 'not-allowed' })
                }}
              />
            </td>
            
            {/* Chq Dt - No textAlign change for date input */}
            <td style={styles.td}>
              <input
                ref={el => paymentChqDtRefs.current[index] = el}
                id={`payment_${item.id}_chqDt`}
                type="date"
                placeholder=""
                value={item.chqDt}
                onChange={(e) => handlePaymentItemChange(item.id, 'chqDt', e.target.value)}
                onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'chqDt')}
                disabled={item.type !== 'CHQ'}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #1B91DA';
                  setNavigationStep('paymentChqDt');
                  setCurrentPaymentRowIndex(index);
                }}
                onBlur={(e) => (e.target.style.border = 'none')}
                style={{
                  ...(navigationStep === 'paymentChqDt' && currentPaymentRowIndex === index ? styles.editableInputFocused : styles.editableInput),
                  ...(item.type !== 'CHQ' && { opacity: 0.5, cursor: 'not-allowed' })
                }}
              />
            </td>
            
            {/* Narration - Right Aligned */}
            <td style={{...styles.td, minWidth: isMobileView ? '120px' : '150px'}}>
              <input
                ref={el => paymentNarrationRefs.current[index] = el}
                id={`payment_${item.id}_narration`}
                type="text"
                value={item.narration}
                onChange={(e) => handlePaymentItemChange(item.id, 'narration', e.target.value)}
                onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'narration')}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #1B91DA';
                  setNavigationStep('paymentNarration');
                  setCurrentPaymentRowIndex(index);
                }}
                onBlur={(e) => (e.target.style.border = 'none')}
                style={{
                  ...(navigationStep === 'paymentNarration' && currentPaymentRowIndex === index ? styles.editableInputFocused : styles.editableInput),
                  textAlign: 'left' // Right aligned for Narration
                }}
              />
            </td>
            
            {/* Amount - Left Aligned */}
            <td style={{...styles.td, minWidth: isMobileView ? '80px' : '100px'}}>
              <input
                ref={el => paymentAmountRefs.current[index] = el}
                id={`payment_${item.id}_amount`}
                value={item.amount === '' || item.amount === '0.00' || parseFloat(item.amount) === 0 ? '' : item.amount}
                onChange={(e) => handlePaymentItemChange(item.id, 'amount', e.target.value)}
                onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'amount')}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #1B91DA';
                  setNavigationStep('paymentAmount');
                  setCurrentPaymentRowIndex(index);
                }}
                onBlur={(e) => e.target.style.border = 'none'}
                style={{
                  ...(navigationStep === 'paymentAmount' && currentPaymentRowIndex === index ? styles.editableInputFocused : styles.editableInput),
                  textAlign: 'right' // Left aligned for Amount
                }}
              />
            </td>
            
            <td style={styles.td}>
              <button
                onClick={() => handleDeletePaymentRow(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#e53935',
                  marginLeft: isMobileView ? '10px' : '30px'
                }}
                title="Delete row"
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <svg width={isMobileView ? "16" : "20"} height={isMobileView ? "16" : "20"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </td>
          </tr>
        );
        })}
        {/* Spacing Row - Responsive height */}
        <tr style={{ height: isMobileView ? '10vh' : '20vh', backgroundColor: 'transparent' }}>
          <td colSpan="9" style={{ backgroundColor: 'transparent', border: 'none' }}></td>
        </tr>
        {/* Total Row for Payment Details */}
        <tr style={{ backgroundColor: '#f0f8ff', fontWeight: 'bold', position: 'sticky', bottom: 0, zIndex: 9 }}>
          <td style={{...styles.td, backgroundColor: '#f0f8ff'}} colSpan={isMobileView ? 6 : 6}></td>
          <td style={{...styles.td, backgroundColor: '#f0f8ff', textAlign: 'right', paddingRight: '10px', color: '#1B91DA', fontWeight: 'bold'}}>TOTAL:</td>
          <td style={{...styles.td, backgroundColor: '#f0f8ff', color: '#1B91DA', fontWeight: 'bold', minWidth: isMobileView ? '80px' : '100px', textAlign: 'left'}}>
            {paymentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}
          </td>
          <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
        </tr>
      </tbody>
    </table>
  </div>

  {/* REFERENCE BILL DETAILS TABLE */}
  <div style={{...styles.tableContainer, marginTop: '0', marginBottom: '0'}}>
  <h2 style={styles.mobileTableHeader}></h2>
  <table style={styles.table}>
    <thead>
      <tr>
        <th style={{...styles.th, minWidth: isMobileView ? '40px' : '60px'}}>No</th>
        <th style={{...styles.th, minWidth: isMobileView ? '80px' : '100px'}}>Ref No</th>
        <th style={{...styles.th, minWidth: isMobileView ? '80px' : '100px'}}>Bill No</th>
        <th style={{...styles.th, minWidth: isMobileView ? '80px' : '100px'}}>Date</th>
        <th style={{...styles.th, minWidth: isMobileView ? '90px' : '100px', textAlign: 'right'}}>Bill Amount</th>
        <th style={{...styles.th, minWidth: isMobileView ? '90px' : '100px', textAlign: 'right'}}>Paid Amount</th>
        <th style={{...styles.th, minWidth: isMobileView ? '100px' : '120px', textAlign: 'right'}}>Balance Amount</th>
        <th style={{...styles.th, minWidth: isMobileView ? '80px' : '100px', textAlign: 'right'}}>Amount</th>
      </tr>
    </thead>
    <tbody>
      {billDetails.map((bill, index) => (
        <tr key={bill.id}>
          <td style={styles.td}>{bill.sNo}</td>
          <td style={styles.td}>
            <input
              id={`bill_${bill.id}_refNo`}
              type="text"
              value={bill.refNo || ''}
              readOnly
              style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed', textAlign: 'left'}}
            />
          </td>
          <td style={styles.td}>
            <input
              id={`bill_${bill.id}_billNo`}
              type="text"
              value={bill.billNo || ''}
              readOnly
              style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed', textAlign: 'left'}}
            />
          </td>
          <td style={styles.td}>
            <input
              id={`bill_${bill.id}_date`}
              type="date"
              placeholder=""
              value={bill.date || ''}
              readOnly
              style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed'}}
            />
          </td>
          <td style={{...styles.td, minWidth: isMobileView ? '90px' : '100px'}}>
            <input
              id={`bill_${bill.id}_billAmount`}
              value={bill.billAmount || ''}
              readOnly
              style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed', textAlign: 'right'}}
            />
          </td>
          <td style={{...styles.td, minWidth: isMobileView ? '90px' : '100px'}}>
            <input
              id={`bill_${bill.id}_paidAmount`}
              value={bill.paidAmount || ''}
              readOnly
              style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed', textAlign: 'right'}}
            />
          </td>
          <td style={{...styles.td, minWidth: isMobileView ? '100px' : '120px'}}>
            <input
              id={`bill_${bill.id}_balanceAmount`}
              value={bill.balanceAmount || ''}
              readOnly
              style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed', textAlign: 'right'}}
            />
          </td>
          <td style={{...styles.td, minWidth: isMobileView ? '80px' : '100px'}}>
            <input
              ref={el => billAmountRefs.current[index] = el}
              id={`bill_${bill.id}_amount`}
              value={bill.amount || ''}
              onChange={(e) => handleBillItemChange(bill.id, 'amount', e.target.value)}
              onKeyDown={(e) => handleBillAmountKeyDown(e, index)}
              onFocus={(e) => {
                e.target.style.border = '2px solid #1B91DA';
                setNavigationStep('billAmount');
                setCurrentBillRowIndex(index);
              }}
              onBlur={(e) => (e.target.style.border = 'none')}
              style={{
                ...(navigationStep === 'billAmount' && currentBillRowIndex === index ? styles.editableInputFocused : styles.editableInput),
                textAlign: 'right' // Right aligned for Amount
              }}
            />
          </td>
        </tr>
      ))}
      {/* Spacing Row - Responsive height */}
      <tr style={{ height: isMobileView ? '5vh' : '10vh', backgroundColor: 'transparent' }}>
        <td colSpan="8" style={{ backgroundColor: 'transparent', border: 'none' }}></td>
      </tr>
      {/* Total Row for Bill Details */}
      <tr style={{ backgroundColor: '#f0f8ff', fontWeight: 'bold', position: 'sticky', bottom: 0, zIndex: 9 }}>
        <td style={{...styles.td, backgroundColor: '#fff'}} colSpan={isMobileView ? 6 : 6}></td>
        <td style={{...styles.td, backgroundColor: '#fff', textAlign: 'right', paddingRight: '10px', color: '#1B91DA', fontWeight: 'bold'}}>TOTAL:</td>
        <td style={{...styles.td, backgroundColor: '#fff', color: '#1B91DA', fontWeight: 'bold', minWidth: isMobileView ? '80px' : '100px', textAlign: 'right'}}>
          {billDetails.reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0).toFixed(2)}
        </td>
      </tr>
    </tbody>
  </table>
</div>
</div>

      {/* FOOTER SECTION */}
      <div style={styles.footerSection}>
        <div style={styles.leftColumn}>
          <ActionButtons
            activeButton={activeTopAction}
            onButtonClick={(type) => {
              setActiveTopAction(type);
              if (type === 'add') {
                handleClear();
              } else if (type === 'edit') {
                handleEditClick();
              } else if (type === 'delete') {
                handleDeleteClick();
              }
            }}
          >
            <AddButton buttonType="add" disabled={!formPermissions.add} />
            <EditButton buttonType="edit" disabled={!formPermissions.edit} />
            <DeleteButton buttonType="delete" disabled={!formPermissions.delete} />
          </ActionButtons>
        </div>

        <div style={styles.totalsContainer}>
          <div style={styles.totalItem}>
            <div style={styles.totalLabel}>Total Amount</div>
            <div style={styles.totalValue}>{paymentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}</div>
          </div>
          <div style={styles.totalItem}>
            <div style={styles.totalLabel}>Bill Total</div>
            <div style={styles.totalValue}>{billTotalAmount.toFixed(2)}</div>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.footerButtons}>
            <ClearButton 
              onClick={() => {
                setActiveFooterAction('clear');
                handleClear();
              }} 
              disabled={isSaving}
              isActive={activeFooterAction === 'all' || activeFooterAction === 'clear'}
              buttonType="clear"
            />
            <SaveButton 
              ref={saveButtonRef}
              onClick={() => {
                setActiveFooterAction('save');
                handleSave();
              }} 
              onKeyDown={handleSaveButtonKeyDown}
              disabled={isSaving}
              isActive={activeFooterAction === 'all' || activeFooterAction === 'save'}
              buttonType="save"
            />
            <PrintButton 
              onClick={() => {
                setActiveFooterAction('print');
                console.log('Print clicked');
              }} 
              disabled={false}
              isActive={activeFooterAction === 'all' || activeFooterAction === 'print'}
              buttonType="print"
            />
          </div>
        </div>
      </div>

      {/* POPUPS */}
      {showPartyPopup && (
        <PopupListSelector
          {...getPopupConfig('account')}
          open={showPartyPopup}
          onClose={() => {
            setShowPartyPopup(false);
            setPartySearchTerm('');
          }}
          onSelect={handleAccountSelect}
          initialSearch={partySearchTerm}
        />
      )}

      {showCashBankPopup && (
        <PopupListSelector
          {...getPopupConfig('cashBank')}
          open={showCashBankPopup}
          onClose={() => {
            setShowCashBankPopup(false);
            setCashBankPopupContext(null);
            setCashBankSearchTerm('');
          }}
          onSelect={handleCashBankSelect}
          initialSearch={cashBankSearchTerm}
        />
      )}

      {editVoucherPopupOpen && (
        <PopupListSelector
          {...getPopupConfig('editVoucher')}
          open={editVoucherPopupOpen}
          onClose={() => {
            setEditVoucherPopupOpen(false);
            setVoucherSearchTerm('');
          }}
          onSelect={handleVoucherSelect}
          initialSearch={voucherSearchTerm}
        />
      )}

      {deleteVoucherPopupOpen && (
        <PopupListSelector
          {...getPopupConfig('deleteVoucher')}
          open={deleteVoucherPopupOpen}
          onClose={() => {
            setDeleteVoucherPopupOpen(false);
            setVoucherSearchTerm('');
          }}
          onSelect={handleVoucherDelete}
          initialSearch={voucherSearchTerm}
        />
      )}

      {saveConfirmationOpen && (
        <SaveConfirmationModal
          isOpen={saveConfirmationOpen}
          onClose={handleCancelSave}
          onConfirm={handleConfirmedSave}
          title={`${isEditing ? 'Update' : 'Create'} Payment Voucher`}
          particulars={particulars}
          loading={isSaving}
          voucherNo={voucherDetails.voucherNo}
          voucherDate={voucherDetails.date}
          totalAmount={totalAmount}
          cashTotals={saveConfirmationData?.cashTotals}
          hasCashPayments={saveConfirmationData?.hasCashPayments || false}
          Type="PY"
        />
      )}

      {confirmationPopup.isOpen && (
        <ConfirmationPopup
          isOpen={confirmationPopup.isOpen}
          title={confirmationPopup.title}
          message={confirmationPopup.message}
          type={confirmationPopup.type}
          confirmText={confirmationPopup.confirmText}
          cancelText={confirmationPopup.cancelText}
          onConfirm={handleConfirmationAction}
          onClose={() => setConfirmationPopup(prev => ({ ...prev, isOpen: false }))}
        />
      )}

      <ConfirmationPopup
        isOpen={saveConfirmation}
        onClose={() => setSaveConfirmation(false)}
        onConfirm={()=>{savePaymentVoucher(); setSaveConfirmation(false);}}
        title={"Save Payment Voucher"}
        message={"Do you want to save ?"}
        type={"success"}
      />
    </div>
  );
};

export default PaymentVoucher;