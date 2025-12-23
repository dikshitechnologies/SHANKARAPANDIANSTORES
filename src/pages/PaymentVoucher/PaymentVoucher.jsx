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
    crDr: 'CR'
  });

  // 2. Table Items State (Payment Details)
  const [paymentItems, setPaymentItems] = useState([
    {
      id: 1,
      sNo: 1,
      cashBank: '',
      crDr: 'CR',
      type: '',
      chqNo: '',
      chqDt: '',
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
  const [currentBillRowIndex, setCurrentBillRowIndex] = useState(0);

  // --- REFS FOR ENTER KEY NAVIGATION ---
  const voucherNoRef = useRef(null);
  const dateRef = useRef(null);
  const accountNameRef = useRef(null);
  const gstTypeRef = useRef(null);
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

  // Focus on Date field when component mounts
  useEffect(() => {
    if (dateRef.current) {
      setTimeout(() => {
        dateRef.current.focus();
        setNavigationStep('date');
      }, 100);
    }
  }, []);

  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------- API FUNCTIONS ----------

  // Fetch next voucher number from API
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

  // Fetch pending bills for selected party
  const fetchPendingBills = useCallback(async (partyCode) => {
    try {
      if (!partyCode || !userData?.companyCode) return;
      
      setIsLoading(true);
      const url = API_ENDPOINTS.PAYMENTVOUCHER.GETPENDINGBILLS(partyCode, userData.companyCode);
      const response = await apiService.get(url);
      
      // API returns array directly, not wrapped in .data
      const bills = Array.isArray(response) ? response : (response?.data || []);
      
      if (Array.isArray(bills) && bills.length > 0) {
        // Map pending bills to table 2 (Reference Bill Details)
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

  // Fetch saved vouchers for Edit/Delete popups
  const fetchSavedVouchers = useCallback(async (page = 1, search = '') => {
    try {
      if (!userData?.companyCode) return;
      setLoadingVouchers(true);
      const url = API_ENDPOINTS.PAYMENTVOUCHER.GETBILLNUMLIST(userData.companyCode);
      const response = await apiService.get(url);
      
      // Handle different response formats
      let voucherList = [];
      if (Array.isArray(response)) {
        // API returns array directly
        voucherList = response;
      } else if (Array.isArray(response?.data)) {
        // API returns data in .data property
        voucherList = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // API returns data in .data.data property
        voucherList = response.data.data;
      }
      
      if (Array.isArray(voucherList) && voucherList.length > 0) {
        // Map API response to expected format (ensure invoiceNo field exists)
        const mappedVouchers = voucherList.map(v => ({
          ...v,
          // Ensure invoiceNo exists for display
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

  // Fetch voucher details for editing
  const fetchVoucherDetails = async (voucherNo) => {
    try {
      setIsLoading(true);
      const url = API_ENDPOINTS.PAYMENTVOUCHER.GET_PAYMENT_VOUCHER_DETAILS(voucherNo);
      const response = await apiService.get(url);
      
      if (response?.bledger) {
        const ledger = response.bledger;
        
        // Helper function to safely format date
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
          accountName: ledger.customerName || '',
          accountCode: ledger.fCucode || '',
          balance: (ledger.fBillAmt || 0).toString()
        });
        
        // Map ledger details to payment items
        if (response?.ledgers && Array.isArray(response.ledgers)) {
          const items = response.ledgers.map((item, idx) => ({
            id: idx + 1,
            sNo: idx + 1,
            cashBank: item.accountName || '',
            cashBankCode: item.faccode || '',
            accountCode: item.faccode || '',
            accountName: item.accountName || '',
            crDr: item.fCrDb || 'CR',
            type: item.type || '',
            chqNo: item.fchqno || '',
            chqDt: safeFormatDate(item.fchqdt),
            narration: '',
            amount: (item.fvrAmount || 0).toString()
          }));
          setPaymentItems(items);
        }

        // Load particulars from salesTransaction if available
        if (response?.salesTransaction) {
          const sales = response.salesTransaction;
          setParticulars({
            '500': { available: 0, collect: parseInt(sales.returned500) || 0, issue: 0 },
            '200': { available: 0, collect: parseInt(sales.returned200) || 0, issue: 0 },
            '100': { available: 0, collect: parseInt(sales.returned100) || 0, issue: 0 },
            '50': { available: 0, collect: parseInt(sales.returned50) || 0, issue: 0 },
            '20': { available: 0, collect: parseInt(sales.returned20) || 0, issue: 0 },
            '10': { available: 0, collect: parseInt(sales.returned10) || 0, issue: 0 },
            '5': { available: 0, collect: parseInt(sales.returned5) || 0, issue: 0 },
            '2': { available: 0, collect: parseInt(sales.returned2) || 0, issue: 0 },
            '1': { available: 0, collect: parseInt(sales.returned1) || 0, issue: 0 }
          });
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

  // Delete voucher from database
  const deleteVoucher = async (voucherNo) => {
    try {
      setIsLoading(true);
      const url = API_ENDPOINTS.PAYMENTVOUCHER.DELETE_PAYMENT_VOUCHER(voucherNo);
      await apiService.del(url);
      setError(null);
      toast.success(`Voucher ${voucherNo} deleted successfully`, { autoClose: 3000 });
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

  // Function to fetch parties with pagination
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
        
        // Accumulate data - replace if page 1, append otherwise
        if (page === 1) {
          setAllParties(formattedData);
          setPartyCurrentPage(1);
        } else {
          setAllParties(prev => [...prev, ...formattedData]);
          setPartyCurrentPage(page);
        }
        
        // If we got less than 20 items, we've reached the end
        if (data.length < 20) {
          setHasReachedEndOfParties(true);
        }
      } else if (page > 1) {
        // No data returned, we've reached the end
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

  // Initial data fetch on component mount and when userData changes
  useEffect(() => {
    if (userData?.companyCode) {
      fetchNextVoucherNo();
      // Load first batch of parties (page 1)
      fetchPartiesWithPagination(1);     
    }
  }, [userData?.companyCode, fetchNextVoucherNo, fetchPartiesWithPagination]);

  // Calculate Payment Details Totals whenever items change
  useEffect(() => {
    const total = paymentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    setTotalAmount(total);
  }, [paymentItems]);

  // Calculate Bill Details Totals
  useEffect(() => {
    const total = billDetails.reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);
    setBillTotalAmount(total);
  }, [billDetails]);

  // Reset form to empty state
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
        type: '',
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
    
    // Focus on date field after reset
    setTimeout(() => {
      if (dateRef.current) {
        dateRef.current.focus();
      }
    }, 100);
    
    fetchNextVoucherNo();
  };

  // --- ENTER KEY NAVIGATION HANDLERS ---

  // Handle Enter in header fields
  const handleHeaderFieldKeyDown = (e, currentField, nextField) => {
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
          // Go to first payment row's Cash/Bank field
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

  // Handle Enter in payment table fields
  // Handle payment table keydown with Enter key navigation - Similar to Receipt Voucher
  const handlePaymentFieldKeyDown = (e, rowIndex, fieldType, value = '') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const paymentFields = ['cashBank', 'crDr', 'type', 'chqNo', 'chqDt', 'narration', 'amount'];
      const currentItem = paymentItems[rowIndex];

      // Get current field index
      const currentFieldIndex = paymentFields.indexOf(fieldType);

      // Check if Cash/Bank is empty
      const isCashBankEmpty = !currentItem.cashBank.trim();

      // Special case: If at cashBank field and it's empty, skip to reference bill amount field
      if (fieldType === 'cashBank' && isCashBankEmpty) {
        if (billDetails.length > 0) {
          setCurrentBillRowIndex(0);
          setTimeout(() => document.getElementById(`bill_${billDetails[0].id}_amount`)?.focus(), 0);
        } else {
          // If no bill rows, go to save button
          setTimeout(() => saveButtonRef.current?.focus(), 0);
        }
        return;
      }

      // Special case: If at amount field and amount is not entered (0 or empty), don't move to next row
      if (fieldType === 'amount' && (!currentItem.amount || parseFloat(currentItem.amount) <= 0)) {
        // Don't move to next row - stay in same field
        return;
      }

      // Move to next field in same row
      if (currentFieldIndex < paymentFields.length - 1) {
        // Special case for payment table: if Type is not CHQ, skip Chq No and Chq Dt
        if (fieldType === 'type' && currentItem.type !== 'CHQ') {
          // Skip to narration
          const narrationFieldId = `payment_${currentItem.id}_narration`;
          setTimeout(() => document.getElementById(narrationFieldId)?.focus(), 0);
        } 
        // Special case: when moving from chqNo to chqDt and type is not CHQ, skip to narration
        else if (fieldType === 'chqNo' && currentItem.type !== 'CHQ') {
          const narrationFieldId = `payment_${currentItem.id}_narration`;
          setTimeout(() => document.getElementById(narrationFieldId)?.focus(), 0);
        }
        // Special case: when moving from chqDt and type is not CHQ, skip to narration
        else if (fieldType === 'chqDt' && currentItem.type !== 'CHQ') {
          const narrationFieldId = `payment_${currentItem.id}_narration`;
          setTimeout(() => document.getElementById(narrationFieldId)?.focus(), 0);
        }
        else {
          // Normal navigation to next field
          const nextFieldId = `payment_${currentItem.id}_${paymentFields[currentFieldIndex + 1]}`;
          setTimeout(() => document.getElementById(nextFieldId)?.focus(), 0);
        }
      } else {
        // Last field in current row (Amount field)
        // Check if next row exists and has cash/bank
        if (rowIndex < paymentItems.length - 1) {
          const nextItem = paymentItems[rowIndex + 1];
          
          // Check if next row has cash/bank
          if (!nextItem.cashBank.trim()) {
            // Next row has empty cash/bank, skip to reference bill amount
            if (billDetails.length > 0) {
              setCurrentBillRowIndex(0);
              setTimeout(() => document.getElementById(`bill_${billDetails[0].id}_amount`)?.focus(), 0);
            } else {
              // If no bill rows, go to save button
              setTimeout(() => saveButtonRef.current?.focus(), 0);
            }
          } else {
            // Next row has cash/bank, go to it
            const nextFieldId = `payment_${nextItem.id}_${paymentFields[0]}`;
            setTimeout(() => document.getElementById(nextFieldId)?.focus(), 0);
          }
        } else {
          // Last row, check if we should add new row or go to bill details
          // Only add new row if current row has cash/bank and amount
          if (currentItem.cashBank.trim() && currentItem.amount && parseFloat(currentItem.amount) > 0) {
            // Add new row and focus on its cash/bank
            const newId = Math.max(...paymentItems.map(item => item.id), 0) + 1;
            setPaymentItems(prev => [
              ...prev,
              {
                id: newId,
                sNo: prev.length + 1,
                cashBank: '',
                cashBankCode: '',
                crDr: 'CR',
                type: '',
                chqNo: '',
                chqDt: '',
                narration: '',
                amount: '0.00'
              }
            ]);
            // Focus on cash/bank of new row
            setTimeout(() => {
              document.getElementById(`payment_${newId}_cashBank`)?.focus();
            }, 0);
          } else {
            // Don't add new row, go to bill details or save button
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

  // Handle bill table keydown with Enter key navigation
  const handleBillAmountKeyDown = (e, rowIndex, value = '') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const billFields = ['refNo', 'billNo', 'date', 'billAmount', 'paidAmount', 'balanceAmount', 'amount'];
      const currentBill = billDetails[rowIndex];

      // Get current field index
      const currentFieldIndex = billFields.indexOf('amount');

      // If at amount field, move directly to save button
      if (currentFieldIndex >= 0) {
        setTimeout(() => saveButtonRef.current?.focus(), 0);
        return;
      }
    }
  };

  // Handle Save button keydown
  const handleSaveButtonKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  // --- POPUP HANDLERS ---

  // Open edit voucher popup
  const openEditVoucherPopup = async () => {
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

  // Open delete voucher popup
  const openDeleteVoucherPopup = async () => {
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

  // Handle voucher selection for editing
  const handleVoucherSelect = async (selectedVoucher) => {
    try {
      setIsEditing(true);
      // Use invoiceNo if available, otherwise fall back to voucherNo
      const voucherNo = selectedVoucher.invoiceNo || selectedVoucher.voucherNo;
      setOriginalVoucherNo(voucherNo);
      await fetchVoucherDetails(voucherNo);
      setEditVoucherPopupOpen(false);
    } catch (err) {
      console.error('Error selecting voucher:', err);
      setError('Failed to load voucher');
    }
  };

  // Handle voucher deletion
  const handleVoucherDelete = async (selectedVoucher) => {
    try {
      // Use invoiceNo if available, otherwise fall back to voucherNo
      const voucherNo = selectedVoucher.invoiceNo || selectedVoucher.voucherNo;
      await deleteVoucher(voucherNo);
      setDeleteVoucherPopupOpen(false);
    } catch (err) {
      console.error('Error deleting voucher:', err);
      setError('Failed to delete voucher');
    }
  };

  // Open account/party popup
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
          // Format the data for popup display
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

  // Handle party/account selection
  const handleAccountSelect = async (account) => {
    try {
      setVoucherDetails(prev => ({
        ...prev,
        accountName: account.name || account.accountName || '',
        accountCode: account.code || account.accountCode || ''
      }));
      
      // Fetch pending bills for this party using the code field
      const partyCode = account.code || account.accountCode;
      
      if (partyCode) {
        await fetchPendingBills(partyCode);
        
        // Fetch party balance for the selected account
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
      // After selecting account, focus on GST Type
      setTimeout(() => {
        gstTypeRef.current?.focus();
        setNavigationStep('gstType');
      }, 100);
    } catch (err) {
      console.error('Error selecting party:', err);
    }
  };

  // Handle Cash/Bank selection from popup
  const handleCashBankSelect = (party) => {
    if (cashBankPopupContext) {
      const { paymentItemId, index } = cashBankPopupContext;
      handlePaymentItemChange(paymentItemId, 'cashBank', party.name || party.accountName || '');
      handlePaymentItemChange(paymentItemId, 'cashBankCode', party.code || party.accountCode || '');
      
      // After selecting Cash/Bank, focus on Cr/Dr field
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

  // Open Cash/Bank popup
  const openCashBankPopup = (paymentItemId, index) => {
    setCashBankPopupContext({ paymentItemId, index });
    setShowCashBankPopup(true);
  };

  // Get popup configuration
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
          // Check if we need to load more batches (only if we haven't reached the end)
          if (!hasReachedEndOfParties && !isLoadingMoreParties) {
            await fetchPartiesWithPagination(partyCurrentPage + 1);
          }
          return allParties;
        },
        loading: isLoading || isLoadingMoreParties,
        hasMoreData: !hasReachedEndOfParties,
        onLoadMore: () => {
          // Only load more if we haven't reached the end
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

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVoucherDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle backspace in account field
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

  // Handle payment item change
  const handlePaymentItemChange = (id, field, value) => {
    setPaymentItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Handle bill item change
  const handleBillItemChange = (id, field, value) => {
    setBillDetails(prev =>
      prev.map(bill =>
        bill.id === id ? { ...bill, [field]: value } : bill
      )
    );
  };

  // Handle delete payment row
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

  // Handle delete bill row
  const handleDeleteBillRow = (id) => {
    setBillDetails(prev => {
      const filtered = prev.filter(bill => bill.id !== id);
      return filtered.map((bill, idx) => ({
        ...bill,
        sNo: idx + 1
      }));
    });
  };

  // Handle add payment row
  const handleAddPaymentRow = () => {
    const newId = Math.max(...paymentItems.map(item => item.id), 0) + 1;
    const newSNo = paymentItems.length + 1;
    setPaymentItems(prev => [
      ...prev,
      {
        id: newId,
        sNo: newSNo,
        cashBank: '',
        cashBankCode: '',
        crDr: 'CR',
        type: '',
        chqNo: '',
        chqDt: '',
        narration: '',
        amount: '0.00'
      }
    ]);
  };

  // Handle add bill row
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

  // Handle edit click - opens edit voucher popup
  const handleEditClick = () => {
    openEditVoucherPopup();
  };

  // Handle delete click - opens delete voucher popup
  const handleDeleteClick = () => {
    openDeleteVoucherPopup();
  };

  // Handle clear - clears current form
  const handleClear = () => {
    resetForm();
  };

  // Format date to yyyy-MM-dd
  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().substring(0, 10);
  };

  // ========== SAVE FUNCTION ==========
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

      // Filter payment items - only include items with cashBank and amount > 0
      const validPaymentItems = paymentItems.filter(item => item.cashBank && parseFloat(item.amount) > 0);
      
      // Check if at least one valid payment item exists
      if (validPaymentItems.length === 0) {
        setError('At least one payment item with Cash/Bank account and amount is required');
        toast.error('At least one payment item with Cash/Bank account and amount is required', { autoClose: 3000 });
        return;
      }

      setIsSaving(true);

      // Use passed particulars or fall back to state
      const particularsToUse = updatedParticulars || particulars;

      // Calculate givenTotal from COLLECT values (amount given by customer)
      let givenTotal = 0;
      const denominations = [500, 200, 100, 50, 20, 10, 5, 2, 1];
      
      denominations.forEach(denom => {
        // Get the COLLECT value for this denomination (string key)
        const denomKey = denom.toString();
        const collectValue = particularsToUse[denomKey]?.collect;
        const collectCount = parseInt(collectValue) || 0;
        givenTotal += collectCount * denom;
      });
      
      // Calculate balanceGiven (change given to customer)
      // Formula: totalAmt = givenTotal - balanceGiven
      // So: balanceGiven = givenTotal - totalAmt
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
        toast.success(`Payment Voucher ${voucherDetails.voucherNo} saved successfully`, { autoClose: 3000 });
        resetForm();
        await fetchNextVoucherNo();
        await fetchSavedVouchers();
      }
    } catch (err) {
      console.error('Error saving voucher:', err);
      
      // Handle 409 Conflict (voucher already exists)
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

  // Handle save with confirmation
  const handleSave = async () => {
    showSaveConfirmation();
  };

  // Function to show save confirmation popup using SaveConfirmationModal
  const showSaveConfirmation = () => {
    setSaveConfirmationOpen(true);
  };

  // Function to handle confirmed save
  const handleConfirmedSave = async (updatedParticulars) => {
    setSaveConfirmationOpen(false);
    // Pass updatedParticulars directly to savePaymentVoucher to avoid async state update issues
    await savePaymentVoucher(updatedParticulars);
  };

  // Function to cancel save
  const handleCancelSave = () => {
    setSaveConfirmationOpen(false);
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
      position: 'fixed',
      scrollbarWidth: 'thin',
      scrollbarColor: '#1B91DA #f0f0f0',
    },
    headerSection: {
      flex: '0 0 auto',
      backgroundColor: 'white',
      borderRadius: 0,
      padding: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '10px',
      margin: 0,
      marginBottom: 0,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflowY: 'visible',
      maxHeight: 'none',
    },
    tableSection: {
      flex: '1 ',
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
      display: 'grid',
      gridTemplateColumns: screenSize.isMobile ? '1fr 1fr' : screenSize.isTablet ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr 1fr 1fr',
      gap: screenSize.isMobile ? '12px' : screenSize.isTablet ? '14px' : '16px',
      alignItems: 'end',
      width: '100%',
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '4px',
    },
    inlineLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#333',
      minWidth: screenSize.isMobile ? '75px' : screenSize.isTablet ? '85px' : '95px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      paddingTop: '2px',
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
    },
    inlineInputFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '5px 6px' : screenSize.isTablet ? '6px 8px' : '8px 10px',
      border: '2px solid #1B91DA',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
      width: '100%',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '80px' : '100px',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
    },
    inlineInputClickable: {
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
      cursor: 'pointer',
      backgroundColor: 'white',
    },
    inlineInputClickableFocused: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '5px 6px' : screenSize.isTablet ? '6px 8px' : '8px 10px',
      border: '2px solid #1B91DA',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
      width: '100%',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '80px' : '100px',
      cursor: 'pointer',
      backgroundColor: 'white',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
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
      marginBottom: screenSize.isMobile ? '250px' : screenSize.isTablet ? '150px' : '90px',
      WebkitOverflowScrolling: 'touch',
      width: screenSize.isMobile ? 'calc(100% - 12px)' : screenSize.isTablet ? 'calc(100% - 20px)' : 'calc(100% - 32px)',
      boxSizing: 'border-box',
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: screenSize.isMobile ? '200px' : screenSize.isTablet ? '280px' : '360px',
      minHeight: screenSize.isMobile ? '180px' : screenSize.isTablet ? '260px' : '360px',
      scrollbarWidth: 'thin',
      scrollbarColor: '#1B91DA #f0f0f0',
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
      padding: screenSize.isMobile ? '5px 3px' : screenSize.isTablet ? '7px 5px' : '10px 6px',
      textAlign: 'center',
      letterSpacing: '0.5px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      border: '1px solid white',
      borderBottom: '2px solid white',
      minWidth: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
      whiteSpace: 'nowrap',
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
      minWidth: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
    },
    editableInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      display: 'block',
      width: '100%',
      height: '100%',
      minHeight: screenSize.isMobile ? '28px' : screenSize.isTablet ? '32px' : '35px',
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
      minHeight: screenSize.isMobile ? '28px' : screenSize.isTablet ? '32px' : '35px',
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
    footerSection: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: screenSize.isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: screenSize.isMobile ? '6px 4px' : screenSize.isTablet ? '8px 6px' : '8px 10px',
      backgroundColor: 'white',
      borderTop: '2px solid #e0e0e0',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
      gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '10px' : '10px',
      flexWrap: screenSize.isMobile ? 'nowrap' : 'wrap',
      flexShrink: 0,
      minHeight: screenSize.isMobile ? 'auto' : screenSize.isTablet ? '48px' : '55px',
      width: '100%',
      boxSizing: 'border-box',
      zIndex: 100,
    },
    totalsContainer: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: screenSize.isMobile ? TYPOGRAPHY.fontSize.sm : screenSize.isTablet ? TYPOGRAPHY.fontSize.base : TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#1B91DA',
      padding: screenSize.isMobile ? '6px 8px' : screenSize.isTablet ? '8px 12px' : '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '15px' : screenSize.isTablet ? '25px' : '35px',
      minWidth: 'max-content',
      justifyContent: 'center',
      flex: 1,
      order: 0,
      borderRadius: screenSize.isMobile ? '4px' : '6px',
      backgroundColor: '#f0f8ff',
    },
    totalItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
    },
    totalLabel: {
      fontSize: screenSize.isMobile ? '10px' : screenSize.isTablet ? '11px' : '12px',
      color: '#555',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    totalValue: {
      fontSize: screenSize.isMobile ? '14px' : screenSize.isTablet ? '16px' : '18px',
      color: '#1976d2',
      fontWeight: 'bold',
    },
    leftColumn: {
      display: 'flex',
      gap: screenSize.isMobile ? '10px' : screenSize.isTablet ? '12px' : '12px',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: 'auto',
      flex: '0 0 auto',
      order: 0,
    },
    rightColumn: {
      display: 'flex',
      gap: screenSize.isMobile ? '10px' : screenSize.isTablet ? '12px' : '12px',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: 'auto',
      flex: '0 0 auto',
      order: 0,
    },
    footerButtons: {
      display: 'flex',
      gap: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '12px',
      flexWrap: 'wrap',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-end',
      width: screenSize.isMobile ? '100%' : 'auto',
      order: screenSize.isMobile ? 3 : 0,
    },
    errorContainer: {
      background: '#fff1f2',
      color: '#9f1239',
      padding: screenSize.isMobile ? '10px' : '12px',
      borderRadius: '6px',
      marginBottom: screenSize.isMobile ? '10px' : '12px',
      textAlign: 'center',
      borderLeft: '4px solid #ef4444',
      fontSize: screenSize.isMobile ? '13px' : '14px',
      fontFamily: TYPOGRAPHY.fontFamily,
      margin: screenSize.isMobile ? '0 10px' : '0 16px',
      marginTop: screenSize.isMobile ? '10px' : '12px',
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
  };

  return (
    <div style={styles.container}>
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
                onKeyDown={(e) => handleHeaderFieldKeyDown(e, 'voucherNo', 'date')}
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
                onKeyDown={(e) => handleHeaderFieldKeyDown(e, 'date', 'accountName')}
              />
            </div>

            {/* A/C Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>A/C Name</label>
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
                onKeyDown={(e) => handleHeaderFieldKeyDown(e, 'accountName', 'gstType')}
                onKeyUp={(e) => handleBackspace(e, 'accountName')}
                style={focusedField === 'accountName' ? styles.inlineInputClickableFocused : styles.inlineInputClickable}
                placeholder="Search A/C Name"
              />
            </div>

            {/* Balance */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>Balance</label>
              <input
                
                name="balance"
                value={voucherDetails.balance + ' ' + (voucherDetails.crDr || '')}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('balance')}
                onBlur={() => setFocusedField('')}
                style={focusedField === 'balance' ? styles.inlineInputFocused : styles.inlineInput}
                readOnly
              />
            </div>

            {/* CR/DR - No Label */}
            {/* <div style={styles.fieldGroup}>
              <input
                name="crDr"
                value={voucherDetails.crDr || 'CR'}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('crDr')}
                onBlur={() => setFocusedField('')}
                style={styles.inlineInput}
              />
            </div> */}

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
                onKeyDown={(e) => handleHeaderFieldKeyDown(e, 'gstType', 'paymentCashBank')}
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
        <div style={{...styles.tableContainer, marginBottom: 0, marginTop: 0, margin: 0, marginLeft: 0, marginRight: 0, width: '100%', maxHeight: screenSize.isMobile ? '180px' : screenSize.isTablet ? '260px' : '415px', minHeight: screenSize.isMobile ? '160px' : screenSize.isTablet ? '240px' : '415px'}}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '35px' : '60px', width: screenSize.isMobile ? '35px' : '60px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>No</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '120px' : '300px', width: screenSize.isMobile ? '120px' : '300px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Cash/Bank</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '50px' : '90px', width: screenSize.isMobile ? '50px' : '90px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Cr/Dr</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '50px' : '90px', width: screenSize.isMobile ? '50px' : '90px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Type</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '50px' : '90px', width: screenSize.isMobile ? '50px' : '90px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Chq No</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '50px' : '60px', width: screenSize.isMobile ? '50px' : '60px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Chq Dt</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '80px' : '200px', width: screenSize.isMobile ? '80px' : '200px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Narration</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '60px' : '100px', width: screenSize.isMobile ? '60px' : '100px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Amount</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '35px' : '60px', width: screenSize.isMobile ? '35px' : '60px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {paymentItems.map((item, index) => (
                <tr key={item.id}>
                  <td style={styles.td}>{item.sNo}</td>
                  <td style={styles.td}>
                    <input
                      ref={el => paymentCashBankRefs.current[index] = el}
                      id={`payment_${item.id}_cashBank`}
                      type="text"
                      value={item.cashBank}
                      onChange={(e) => handlePaymentItemChange(item.id, 'cashBank', e.target.value)}
                      onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'cashBank', item.cashBank)}
                      onClick={() => openCashBankPopup(item.id, index)}
                      onFocus={(e) => {
                        e.target.style.border = '2px solid #1B91DA';
                        setNavigationStep('paymentCashBank');
                        setCurrentPaymentRowIndex(index);
                      }}
                      onBlur={(e) => (e.target.style.border = 'none')}
                      style={navigationStep === 'paymentCashBank' && currentPaymentRowIndex === index ? styles.editableInputFocused : styles.editableInput}
                      placeholder="Search Cash/Bank"
                      title="Click to select or type to search"
                    />
                  </td>
                  <td style={styles.td}>
                    <select
                      ref={el => paymentCrDrRefs.current[index] = el}
                      id={`payment_${item.id}_crDr`}
                      value={item.crDr}
                      onChange={(e) => handlePaymentItemChange(item.id, 'crDr', e.target.value)}
                      onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'crDr', item.crDr)}
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
                  <td style={styles.td}>
                    <select
                      ref={el => paymentTypeRefs.current[index] = el}
                      id={`payment_${item.id}_type`}
                      value={item.type}
                      onChange={(e) => handlePaymentItemChange(item.id, 'type', e.target.value)}
                      onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'type', item.type)}
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
                  <td style={styles.td}>
                    <input
                      ref={el => paymentChqNoRefs.current[index] = el}
                      id={`payment_${item.id}_chqNo`}
                      type="text"
                      value={item.chqNo}
                      onChange={(e) => handlePaymentItemChange(item.id, 'chqNo', e.target.value)}
                      onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'chqNo', item.chqNo)}
                      disabled={item.type !== 'CHQ'}
                      onFocus={(e) => {
                        e.target.style.border = '2px solid #1B91DA';
                        setNavigationStep('paymentChqNo');
                        setCurrentPaymentRowIndex(index);
                      }}
                      onBlur={(e) => (e.target.style.border = 'none')}
                      style={{
                        ...(navigationStep === 'paymentChqNo' && currentPaymentRowIndex === index ? styles.editableInputFocused : styles.editableInput),
                        ...(item.type !== 'CHQ' && { opacity: 0.5, cursor: 'not-allowed' })
                      }}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      ref={el => paymentChqDtRefs.current[index] = el}
                      id={`payment_${item.id}_chqDt`}
                      type="date"
                      value={item.chqDt}
                      onChange={(e) => handlePaymentItemChange(item.id, 'chqDt', e.target.value)}
                      onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'chqDt', item.chqDt)}
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
                  <td style={{...styles.td, minWidth: '200px', width: '200px'}}>
                    <input
                      ref={el => paymentNarrationRefs.current[index] = el}
                      id={`payment_${item.id}_narration`}
                      type="text"
                      value={item.narration}
                      onChange={(e) => handlePaymentItemChange(item.id, 'narration', e.target.value)}
                      onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'narration', item.narration)}
                      onFocus={(e) => {
                        e.target.style.border = '2px solid #1B91DA';
                        setNavigationStep('paymentNarration');
                        setCurrentPaymentRowIndex(index);
                      }}
                      onBlur={(e) => (e.target.style.border = 'none')}
                      style={navigationStep === 'paymentNarration' && currentPaymentRowIndex === index ? styles.editableInputFocused : styles.editableInput}
                    />
                  </td>
                  <td style={{...styles.td, minWidth: '100px', width: '100px'}}>
                    <input
                      ref={el => paymentAmountRefs.current[index] = el}
                      id={`payment_${item.id}_amount`}
                      value={item.amount}
                      onChange={(e) => handlePaymentItemChange(item.id, 'amount', e.target.value)}
                      onKeyDown={(e) => handlePaymentFieldKeyDown(e, index, 'amount', item.amount)}
                      onFocus={(e) => {
                        e.target.style.border = '2px solid #1B91DA';
                        setNavigationStep('paymentAmount');
                        setCurrentPaymentRowIndex(index);
                      }}
                      onBlur={(e) => e.target.style.border = 'none'}
                      style={navigationStep === 'paymentAmount' && currentPaymentRowIndex === index ? styles.editableInputFocused : styles.editableInput}
                    />
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDeletePaymentRow(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#e53935',
                        marginLeft:'30px'
                      }}
                      title="Delete row"
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {/* Spacing Row */}
              <tr style={{ height: '316px', backgroundColor: 'transparent' }}>
                
              </tr>
              {/* Total Row for Payment Details */}
              <tr style={{ backgroundColor: '#f0f8ff', fontWeight: 'bold', position: 'sticky', bottom: 0, zIndex: 9 }}>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff', textAlign: 'right', paddingRight: '10px', color: '#1B91DA', fontWeight: 'bold'}}>TOTAL:</td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff', color: '#1B91DA', fontWeight: 'bold', minWidth: '100px', width: '100px'}}>
                  {paymentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}
                </td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* REFERENCE BILL DETAILS TABLE */}
        <div style={{...styles.tableContainer, marginTop: 0, marginBottom: 0, margin: 0, marginLeft: 0, marginRight: 0, width: '100%', flex: 1}}>
          <h2 style={{
            // margin: '0 0 12px 0',
            padding: '12px 16px 0 26px',
            color: '#1B91DA',
            fontSize: screenSize.isMobile ? '14px' : screenSize.isTablet ? '16px' : '18px',
            fontWeight: 'bold',
            fontFamily: TYPOGRAPHY.fontFamily
          }}>Reference Bill Details</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '35px' : '100px', width: screenSize.isMobile ? '35px' : '100px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>No</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '70px' : '100px', width: screenSize.isMobile ? '70px' : '100px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Ref No</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '70px' : '100px', width: screenSize.isMobile ? '70px' : '100px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Bill No</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '60px' : '100px', width: screenSize.isMobile ? '60px' : '100px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Date</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '70px' : '100px', width: screenSize.isMobile ? '70px' : '100px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Bill Amt</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '70px' : '100px', width: screenSize.isMobile ? '70px' : '100px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Paid Amt</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '80px' : '120px', width: screenSize.isMobile ? '80px' : '120px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Balance</th>
                <th style={{...styles.th, minWidth: screenSize.isMobile ? '60px' : '100px', width: screenSize.isMobile ? '60px' : '100px', padding: screenSize.isMobile ? '3px 2px' : '10px 6px'}}>Amount</th>
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
                      style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed'}}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      id={`bill_${bill.id}_billNo`}
                      type="text"
                      value={bill.billNo || ''}
                      readOnly
                      style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed'}}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      id={`bill_${bill.id}_date`}
                      type="date"
                      value={bill.date || ''}
                      readOnly
                      style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed'}}
                    />
                  </td>
                  <td style={{...styles.td, minWidth: '100px', width: '100px'}}>
                    <input
                      id={`bill_${bill.id}_billAmount`}
                      value={bill.billAmount || ''}
                      readOnly
                      style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed'}}
                    />
                  </td>
                  <td style={{...styles.td, minWidth: '100px', width: '100px'}}>
                    <input
                      id={`bill_${bill.id}_paidAmount`}
                      value={bill.paidAmount || ''}
                      readOnly
                      style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed'}}
                    />
                  </td>
                  <td style={{...styles.td, minWidth: '120px', width: '120px'}}>
                    <input
                      id={`bill_${bill.id}_balanceAmount`}
                      value={bill.balanceAmount || ''}
                      readOnly
                      style={{...styles.editableInput, backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed'}}
                    />
                  </td>
                  <td style={{...styles.td, minWidth: '100px', width: '100px'}}>
                    <input
                      ref={el => billAmountRefs.current[index] = el}
                      id={`bill_${bill.id}_amount`}
                      value={bill.amount || ''}
                      onChange={(e) => handleBillItemChange(bill.id, 'amount', e.target.value)}
                      onKeyDown={(e) => handleBillAmountKeyDown(e, index, bill.amount)}
                      onFocus={(e) => {
                        e.target.style.border = '2px solid #1B91DA';
                        setNavigationStep('billAmount');
                        setCurrentBillRowIndex(index);
                      }}
                      onBlur={(e) => (e.target.style.border = 'none')}
                      style={navigationStep === 'billAmount' && currentBillRowIndex === index ? styles.editableInputFocused : styles.editableInput}
                    />
                  </td>
                </tr>
              ))}
              {/* Spacing Row */}
              <tr style={{ height: '219px', backgroundColor: 'transparent' }}>
                <td colSpan="8" style={{ backgroundColor: 'transparent', border: 'none' }}></td>
              </tr>
              {/* Total Row for Bill Details */}
              <tr style={{ backgroundColor: '#f0f8ff', fontWeight: 'bold', position: 'sticky', bottom: 0, zIndex: 9 }}>
                <td style={{...styles.td, backgroundColor: '#fff'}}></td>
                <td style={{...styles.td, backgroundColor: '#fff'}}></td>
                <td style={{...styles.td, backgroundColor: '#fff'}}></td>
                <td style={{...styles.td, backgroundColor: '#fff'}}></td>
                <td style={{...styles.td, backgroundColor: '#fff'}}></td>
                <td style={{...styles.td, backgroundColor: '#fff'}}></td>
                <td style={{...styles.td, backgroundColor: '#fff', textAlign: 'right', paddingRight: '10px', color: '#1B91DA', fontWeight: 'bold'}}>TOTAL:</td>
                <td style={{...styles.td, backgroundColor: '#fff', color: '#1B91DA', fontWeight: 'bold', minWidth: '100px', width: '100px'}}>
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
            <div style={styles.totalValue}>{totalAmount.toFixed(2)}</div>
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
          onClose={() => setShowPartyPopup(false)}
          onSelect={handleAccountSelect}
        />
      )}

      {showCashBankPopup && (
        <PopupListSelector
          {...getPopupConfig('cashBank')}
          open={showCashBankPopup}
          onClose={() => {
            setShowCashBankPopup(false);
            setCashBankPopupContext(null);
          }}
          onSelect={handleCashBankSelect}
        />
      )}

      {editVoucherPopupOpen && (
        <PopupListSelector
          {...getPopupConfig('editVoucher')}
          open={editVoucherPopupOpen}
          onClose={() => setEditVoucherPopupOpen(false)}
          onSelect={handleVoucherSelect}
        />
      )}

      {deleteVoucherPopupOpen && (
        <PopupListSelector
          {...getPopupConfig('deleteVoucher')}
          open={deleteVoucherPopupOpen}
          onClose={() => setDeleteVoucherPopupOpen(false)}
          onSelect={handleVoucherDelete}
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
        />
      )}

      {/* End of JSX */}
    </div>
  );
};

export default PaymentVoucher;