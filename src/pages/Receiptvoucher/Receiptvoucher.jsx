import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EditButton, DeleteButton, SaveButton, ClearButton, AddButton } from '../../components/Buttons/ActionButtons';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import apiService from '../../api/apiService';

const ReceiptVoucher = () => {
  // --- STATE MANAGEMENT ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Save confirmation popup
  const [saveConfirmationOpen, setSaveConfirmationOpen] = useState(false);
  const [saveConfirmationData, setSaveConfirmationData] = useState(null);

  // Amount entry popup
  const [amountPopupOpen, setAmountPopupOpen] = useState(false);
  const [amountPopupData, setAmountPopupData] = useState(null);

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
    balance: '0.00',
    crDr: 'CR'
  });

  // 2. Table Items State (Receipt Details)
  const [receiptItems, setReceiptItems] = useState([
    {
      id: 1,
      sNo: 1,
      cashBank: '',
      crDr: 'CR',
      type: '',
      chqNo: '',
      chqDt: '',
      narration: '',
      amount: '0.00'
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
      billAmount: '0.00',
      paidAmount: '0.00',
      balanceAmount: '0.00',
      amount: '0.00'
    }
  ]);

  // 4. Totals State
  const [totalAmount, setTotalAmount] = useState(0);
  const [billTotalAmount, setBillTotalAmount] = useState(0);

  // 5. Popup States
  const [accountPopupOpen, setAccountPopupOpen] = useState(false);
  const [editVoucherPopupOpen, setEditVoucherPopupOpen] = useState(false);
  const [deleteVoucherPopupOpen, setDeleteVoucherPopupOpen] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);

  // 6. Data state
  const [accountList, setAccountList] = useState([]);
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // --- REFS FOR ENTER KEY NAVIGATION ---
  const voucherNoRef = useRef(null);
  const gstTypeRef = useRef(null);
  const dateRef = useRef(null);
  const costCenterRef = useRef(null);
  const accountNameRef = useRef(null);

  // Track which top-section field is focused to style active input
  const [focusedField, setFocusedField] = useState('');

  // Footer action active state
  const [activeFooterAction, setActiveFooterAction] = useState('all');

  // Screen size state
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

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
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await apiService.get('/api/payment-voucher/next-voucher-no');
      if (response.data?.voucherNo) {
        setVoucherDetails(prev => ({
          ...prev,
          voucherNo: response.data.voucherNo
        }));
      }
    } catch (err) {
      console.error('Error fetching voucher number:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isEditing, voucherDetails.voucherNo]);

  // Fetch accounts from backend API
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/api/accounts');
      if (response.data?.accounts) {
        setAccountList(response.data.accounts);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch saved vouchers for Edit/Delete popups
  const fetchSavedVouchers = useCallback(async (page = 1, search = '') => {
    try {
      setLoadingVouchers(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const response = await apiService.get('/api/payment-vouchers', { params });
      if (response.data?.vouchers) {
        setSavedVouchers(response.data.vouchers);
      }
    } catch (err) {
      console.error('Error fetching saved vouchers:', err);
      setError('Failed to load vouchers');
    } finally {
      setLoadingVouchers(false);
    }
  }, []);

  // Fetch voucher details for editing
  const fetchVoucherDetails = async (voucherNo) => {
    try {
      setIsLoading(true);
      const response = await apiService.get(`/api/payment-vouchers/${voucherNo}`);
      if (response.data?.voucher) {
        const voucher = response.data.voucher;
        setVoucherDetails({
          voucherNo: voucher.voucherNo || '',
          gstType: voucher.gstType || 'CGST/SGST',
          date: voucher.date || new Date().toISOString().substring(0, 10),
          costCenter: voucher.costCenter || '',
          accountName: voucher.accountName || '',
          accountCode: voucher.accountCode || '',
          balance: voucher.balance || '0.00'
        });

        if (voucher.receiptItems) {
          setReceiptItems(voucher.receiptItems.map((item, idx) => ({
            id: idx + 1,
            sNo: idx + 1,
            cashBank: item.cashBank || '',
            crDr: item.crDr || 'CR',
            type: item.type || '',
            chqNo: item.chqNo || '',
            chqDt: item.chqDt || '',
            narration: item.narration || '',
            amount: item.amount || '0.00'
          })));
        }

        if (voucher.billDetails) {
          setBillDetails(voucher.billDetails.map((bill, idx) => ({
            id: idx + 1,
            sNo: idx + 1,
            refNo: bill.refNo || '',
            billNo: bill.billNo || '',
            date: bill.date || '',
            billAmount: bill.billAmount || '0.00',
            paidAmount: bill.paidAmount || '0.00',
            balanceAmount: bill.balanceAmount || '0.00',
            amount: bill.amount || '0.00'
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching voucher details:', err);
      setError('Failed to load voucher details');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete voucher from database
  const deleteVoucher = async (voucherNo) => {
    try {
      setIsLoading(true);
      await apiService.delete(`/api/payment-vouchers/${voucherNo}`);
      setError(null);
      resetForm();
      await fetchSavedVouchers();
    } catch (err) {
      console.error('Error deleting voucher:', err);
      setError('Failed to delete voucher');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
//   useEffect(() => {
//     fetchNextVoucherNo();
//     fetchAccounts();
//     fetchSavedVouchers();
//   }, [fetchNextVoucherNo, fetchAccounts, fetchSavedVouchers, isEditing, voucherDetails.voucherNo]);

//   // Calculate Totals whenever items change
//   useEffect(() => {
//     const total = paymentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
//     setTotalAmount(total);
//   }, [paymentItems]);

//   // Calculate Bill Totals
//   useEffect(() => {
//     const total = billDetails.reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);
//     setBillTotalAmount(total);
//   }, [billDetails]);

  // Reset form to empty state
  const resetForm = () => {
    setVoucherDetails({
      voucherNo: '',
      gstType: 'CGST/SGST',
      date: new Date().toISOString().substring(0, 10),
      costCenter: '',
      accountName: '',
      accountCode: '',
      balance: '0.00',
      crDr: 'CR'
    });
    setReceiptItems([
      {
        id: 1,
        sNo: 1,
        cashBank: '',
        crDr: 'CR',
        type: '',
        chqNo: '',
        chqDt: '',
        narration: '',
        amount: '0.00'
      }
    ]);
    setBillDetails([
      {
        id: 1,
        sNo: 1,
        refNo: '',
        billNo: '',
        date: '',
        billAmount: '0.00',
        paidAmount: '0.00',
        balanceAmount: '0.00',
        amount: '0.00'
      }
    ]);
    setError(null);
    setIsEditing(false);
    setOriginalVoucherNo('');
    setFocusedField('');
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
      setOriginalVoucherNo(selectedVoucher.voucherNo);
      await fetchVoucherDetails(selectedVoucher.voucherNo);
      setEditVoucherPopupOpen(false);
    } catch (err) {
      console.error('Error selecting voucher:', err);
      setError('Failed to load voucher');
    }
  };

  // Handle voucher deletion
  const handleVoucherDelete = async (selectedVoucher) => {
    try {
      await deleteVoucher(selectedVoucher.voucherNo);
      setDeleteVoucherPopupOpen(false);
    } catch (err) {
      console.error('Error deleting voucher:', err);
      setError('Failed to delete voucher');
    }
  };

  // Open account popup
  const openAccountPopup = () => {
    setAccountPopupOpen(true);
  };

  // Handle account selection
  const handleAccountSelect = (account) => {
    setVoucherDetails(prev => ({
      ...prev,
      accountName: account.accountName || '',
      accountCode: account.accountCode || ''
    }));
    setAccountPopupOpen(false);
  };

  // Get popup configuration
  const getPopupConfig = (type) => {
    const configs = {
      account: {
        title: 'Select Account',
        columns: ['accountCode', 'accountName'],
        searchField: 'accountName',
        data: accountList,
        loading: isLoading
      },
      editVoucher: {
        title: 'Edit Payment Voucher',
        columns: ['voucherNo', 'date', 'accountName'],
        searchField: 'voucherNo',
        data: savedVouchers,
        loading: loadingVouchers
      },
      deleteVoucher: {
        title: 'Delete Payment Voucher',
        columns: ['voucherNo', 'date', 'accountName'],
        searchField: 'voucherNo',
        data: savedVouchers,
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

  // Handle keydown with / key support for popup toggle
  const handleKeyDown = (e, nextRef, fieldName = '') => {
    if (e.key === 'Enter') {
      if (fieldName === 'accountName') {
        // From A/C Name, go to Receipt table's first field
        e.preventDefault();
        if (receiptItems.length > 0) {
          const firstReceiptId = receiptItems[0].id;
          setTimeout(() => document.getElementById(`receipt_${firstReceiptId}_cashBank`)?.focus(), 0);
        }
      } else if (nextRef) {
        nextRef.current?.focus();
      }
    } else if (e.key === '/' && (fieldName === 'accountName' || fieldName === 'costCenter')) {
      e.preventDefault();
      openAccountPopup();
    }
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

  // Handle receipt item change
  const handleReceiptItemChange = (id, field, value) => {
    setReceiptItems(prev =>
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

  // Handle delete receipt row
  const handleDeleteReceiptRow = (id) => {
    if (receiptItems.length === 1) {
      setError('At least one receipt item is required');
      return;
    }
    setReceiptItems(prev => {
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

  // Handle add receipt row
  const handleAddReceiptRow = () => {
    const newId = Math.max(...receiptItems.map(item => item.id), 0) + 1;
    const newSNo = receiptItems.length + 1;
    setReceiptItems(prev => [
      ...prev,
      {
        id: newId,
        sNo: newSNo,
        cashBank: '',
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

  // Handle table keydown with Enter key navigation
  const handleTableKeyDown = (e, currentRowIndex, currentField, isReceiptTable = true) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const fields = ['cashBank', 'crDr', 'type', 'chqNo', 'chqDt', 'narration', 'amount'];
      const currentFieldIndex = fields.indexOf(currentField);
      const items = isReceiptTable ? receiptItems : billDetails;

      // Special case: if cashBank field is empty, go directly to 2nd table Amount
      if (isReceiptTable && currentField === 'cashBank' && items[currentRowIndex].cashBank.trim() === '') {
        if (billDetails.length > 0) {
          setTimeout(() => document.getElementById(`bill_${billDetails[0].id}_amount`)?.focus(), 0);
        }
        return;
      }

      // Move to next field in same row
      if (currentFieldIndex < fields.length - 1) {
        // Special case: if Type is not CHQ, skip Chq No and Chq Dt and go to Narration
        if (currentField === 'type' && items[currentRowIndex].type !== 'CHQ') {
          const narrationFieldId = `${isReceiptTable ? 'receipt' : 'bill'}_${items[currentRowIndex].id}_narration`;
          setTimeout(() => document.getElementById(narrationFieldId)?.focus(), 0);
        } else {
          const nextFieldId = `${isReceiptTable ? 'receipt' : 'bill'}_${items[currentRowIndex].id}_${fields[currentFieldIndex + 1]}`;
          setTimeout(() => document.getElementById(nextFieldId)?.focus(), 0);
        }
      } else {
        // Move to next row, first field
        if (currentRowIndex < items.length - 1) {
          const nextFieldId = `${isReceiptTable ? 'receipt' : 'bill'}_${items[currentRowIndex + 1].id}_${fields[0]}`;
          setTimeout(() => document.getElementById(nextFieldId)?.focus(), 0);
        } else {
          // Add new row and focus first field
          if (isReceiptTable) {
            const newId = Math.max(...receiptItems.map(item => item.id), 0) + 1;
            handleAddReceiptRow();
            setTimeout(() => {
              document.getElementById(`receipt_${newId}_cashBank`)?.focus();
            }, 0);
          } else {
            const newId = Math.max(...billDetails.map(bill => bill.id), 0) + 1;
            handleAddBillRow();
            setTimeout(() => {
              document.getElementById(`bill_${newId}_refNo`)?.focus();
            }, 0);
          }
        }
      }
    }
  };

  // Handle amount blur in receipt table
  const handleAmountBlur = (itemId, amount, index) => {
    if (amount && amount !== '0.00') {
      const item = receiptItems.find(i => i.id === itemId);
      const bill = billDetails[index] || {};
      
      // Calculate GST amount
      const gstPercent = parseFloat(bill?.gstPercent || 0);
      const itemAmount = parseFloat(amount) || 0;
      const gstAmount = (itemAmount * gstPercent) / 100;
      const billTotal = itemAmount + gstAmount;
      
      setAmountPopupData({
        itemId: itemId,
        // Receipt Details
        cashBank: item?.cashBank || '',
        crDr: item?.crDr || 'CR',
        type: item?.type || '',
        chqNo: item?.chqNo || '',
        chqDt: item?.chqDt || '',
        narration: item?.narration || '',
        amount: parseFloat(amount).toFixed(2),
        // GST & Bill Details
        gstType: voucherDetails?.gstType || 'CGST/SGST',
        hsnSac: bill?.hsnSac || '',
        refBillNo: bill?.billNo || '',
        refBillDate: bill?.date || '',
        gstPercent: gstPercent,
        gstAmount: gstAmount.toFixed(2),
        billTotal: billTotal.toFixed(2)
      });
      setAmountPopupOpen(true);
    }
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
  const savePaymentVoucher = async () => {
    try {
      if (!voucherDetails.voucherNo) {
        setError('Voucher number is required');
        return;
      }
      if (!voucherDetails.accountName) {
        setError('Account is required');
        return;
      }
      if (receiptItems.length === 0) {
        setError('At least one receipt item is required');
        return;
      }

      setIsSaving(true);

      const payload = {
        voucherNo: voucherDetails.voucherNo,
        gstType: voucherDetails.gstType,
        date: formatDateToYYYYMMDD(voucherDetails.date),
        costCenter: voucherDetails.costCenter,
        accountName: voucherDetails.accountName,
        accountCode: voucherDetails.accountCode,
        balance: voucherDetails.balance,
        crDr: voucherDetails.crDr,
        receiptItems: receiptItems.map(item => ({
          cashBank: item.cashBank,
          crDr: item.crDr,
          type: item.type,
          chqNo: item.chqNo,
          chqDt: item.chqDt,
          narration: item.narration,
          amount: parseFloat(item.amount) || 0
        })),
        billDetails: billDetails.map(bill => ({
          refNo: bill.refNo,
          billNo: bill.billNo,
          date: formatDateToYYYYMMDD(bill.date),
          billAmount: parseFloat(bill.billAmount) || 0,
          paidAmount: parseFloat(bill.paidAmount) || 0,
          balanceAmount: parseFloat(bill.balanceAmount) || 0,
          amount: parseFloat(bill.amount) || 0
        }))
      };

      let response;
      if (isEditing) {
        response = await apiService.put(
          `/api/payment-vouchers/${originalVoucherNo}`,
          payload
        );
      } else {
        response = await apiService.post('/api/payment-vouchers', payload);
      }

      if (response.data?.voucherNo) {
        setError(null);
        resetForm();
        await fetchNextVoucherNo();
        await fetchSavedVouchers();
      }
    } catch (err) {
      console.error('Error saving voucher:', err);
      setError(err.response?.data?.message || 'Failed to save voucher');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save with confirmation
  const handleSave = async () => {
    showSaveConfirmation();
  };

  // Function to show save confirmation popup
  const showSaveConfirmation = () => {
    setSaveConfirmationData({
      title: `${isEditing ? 'Update' : 'Create'} Payment Voucher`,
      message: `Are you sure you want to ${isEditing ? 'update' : 'create'} this payment voucher?`,
      confirmText: 'Save',
      cancelText: 'Cancel'
    });
    setSaveConfirmationOpen(true);
  };

  // Function to handle confirmed save
  const handleConfirmedSave = async () => {
    setSaveConfirmationOpen(false);
    await savePaymentVoucher();
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
      marginBottom: '12px',
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
      flexDirection: 'column',
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
      marginBottom: screenSize.isMobile ? '250px' : screenSize.isTablet ? '120px' : '90px',
      WebkitOverflowScrolling: 'touch',
      width: screenSize.isMobile ? 'calc(100% - 12px)' : screenSize.isTablet ? 'calc(100% - 20px)' : 'calc(100% - 32px)',
      boxSizing: 'border-box',
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: screenSize.isMobile ? '250px' : screenSize.isTablet ? '300px' : '360px',
      minHeight: screenSize.isMobile ? '250px' : screenSize.isTablet ? '300px' : '360px',
      scrollbarWidth: 'thin',
      scrollbarColor: '#1B91DA #f0f0f0',
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
                value={voucherDetails.voucherNo}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('voucherNo')}
                onBlur={() => setFocusedField('')}
                style={focusedField === 'voucherNo' ? styles.inlineInputFocused : styles.inlineInput}
                onKeyDown={(e) => handleKeyDown(e, gstTypeRef, 'voucherNo')}
              />
            </div>

            {/* Date */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>Date</label>
              <input
                ref={dateRef}
                type="date"
                name="date"
                value={voucherDetails.date}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('date')}
                onBlur={() => setFocusedField('')}
                style={focusedField === 'date' ? styles.inlineInputFocused : styles.inlineInput}
                onKeyDown={(e) => handleKeyDown(e, accountNameRef, 'date')}
              />
            </div>

            {/* A/C Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>A/C Name</label>
              <input
                ref={accountNameRef}
                type="text"
                name="accountName"
                value={voucherDetails.accountName}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('accountName')}
                onBlur={() => setFocusedField('')}
                onClick={openAccountPopup}
                onKeyDown={(e) => handleKeyDown(e, null, 'accountName')}
                onKeyUp={(e) => handleBackspace(e, 'accountName')}
                style={focusedField === 'accountName' ? styles.inlineInputClickableFocused : styles.inlineInputClickable}
                placeholder="Click or press / to select"
              />
            </div>

            

            {/* Balance */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>Balance</label>
              <input
                type="text"
                name="balance"
                value={voucherDetails.balance}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('balance')}
                onBlur={() => setFocusedField('')}
                style={focusedField === 'balance' ? styles.inlineInputFocused : styles.inlineInput}
              />
            </div>

            {/* CR/DR - No Label */}
            <div style={styles.fieldGroup}>
              <input
                name="crDr"
                value={voucherDetails.crDr}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('crDr')}
                onBlur={() => setFocusedField('')}
                style={styles.inlineInput}
              />
            
              
            </div>


            {/* GST Type */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>GST Type</label>
              <select
                ref={gstTypeRef}
                name="gstType"
                value={voucherDetails.gstType}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('gstType')}
                onBlur={() => setFocusedField('')}
                style={focusedField === 'gstType' ? styles.inlineInputFocused : styles.inlineInput}
                onKeyDown={(e) => handleKeyDown(e, dateRef, 'gstType')}
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
        {/* RECEIPT DETAILS TABLE */}
        <div style={{...styles.tableContainer, marginBottom: 0, marginTop: 0, margin: 0, marginLeft: 0, marginRight: 0, width: '100%', maxHeight: screenSize.isMobile ? '375px' : screenSize.isTablet ? '450px' : '415px',minHeight: screenSize.isMobile ? '375px' : screenSize.isTablet ? '450px' : '415px'}}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, minWidth: '60px', width: '60px'}}>No</th>
                <th style={{...styles.th, minWidth: '300px', width: '300px'}}>Cash/Bank</th>
                <th style={{...styles.th, minWidth: '90px', width: '90px'}}>Cr/Dr</th>
                <th style={{...styles.th, minWidth: '90px', width: '90px'}}>Type</th>
                <th style={{...styles.th, minWidth: '90px', width: '90px'}}>Chq No</th>
                <th style={{...styles.th, minWidth: '60px', width: '60px'}}>Chq Dt</th>
                <th style={{...styles.th, minWidth: '200px', width: '200px'}}>Narration</th>
                <th style={{...styles.th, minWidth: '100px', width: '100px'}}>Amount</th>
                <th style={{...styles.th, minWidth: '60px', width: '60px'}}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {receiptItems.map((item, index) => (
                <tr key={item.id}>
                  <td style={styles.td}>{item.sNo}</td>
                  <td style={styles.td}>
                    <input
                      id={`receipt_${item.id}_cashBank`}
                      type="text"
                      value={item.cashBank}
                      onChange={(e) => handleReceiptItemChange(item.id, 'cashBank', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'cashBank', true)}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    />
                  </td>
                  <td style={styles.td}>
                    <select
                      id={`receipt_${item.id}_crDr`}
                      value={item.crDr}
                      onChange={(e) => handleReceiptItemChange(item.id, 'crDr', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'crDr', true)}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    >
                      <option>CR</option>
                      <option>DR</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <select
                      id={`receipt_${item.id}_type`}
                      value={item.type}
                      onChange={(e) => handleReceiptItemChange(item.id, 'type', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'type', true)}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
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
                      id={`receipt_${item.id}_chqNo`}
                      type="text"
                      value={item.chqNo}
                      onChange={(e) => handleReceiptItemChange(item.id, 'chqNo', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'chqNo', true)}
                      disabled={item.type !== 'CHQ'}
                      style={{
                        ...styles.editableInput,
                        ...(item.type !== 'CHQ' && { opacity: 0.5, cursor: 'not-allowed' })
                      }}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      id={`receipt_${item.id}_chqDt`}
                      type="date"
                      value={item.chqDt}
                      onChange={(e) => handleReceiptItemChange(item.id, 'chqDt', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'chqDt', true)}
                      disabled={item.type !== 'CHQ'}
                      style={{
                        ...styles.editableInput,
                        ...(item.type !== 'CHQ' && { opacity: 0.5, cursor: 'not-allowed' })
                      }}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    />
                  </td>
                  <td style={{...styles.td, minWidth: '200px', width: '200px'}}>
                    <input
                      id={`receipt_${item.id}_narration`}
                      type="text"
                      value={item.narration}
                      onChange={(e) => handleReceiptItemChange(item.id, 'narration', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'narration', true)}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    />
                  </td>
                  <td style={{...styles.td, minWidth: '100px', width: '100px'}}>
                    <input
                      id={`receipt_${item.id}_amount`}
                      
                      value={item.amount}
                      onChange={(e) => handleReceiptItemChange(item.id, 'amount', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'amount', true)}
                      onBlur={(e) => {
                        e.target.style.border = 'none';
                        handleAmountBlur(item.id, item.amount, index);
                      }}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                    />
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDeleteReceiptRow(item.id)}
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
              {/* Total Row for Receipt Details */}
              <tr style={{ backgroundColor: '#f0f8ff', fontWeight: 'bold', position: 'sticky', bottom: 0, zIndex: 9 }}>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff'}}></td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff', textAlign: 'right', paddingRight: '10px', color: '#1B91DA', fontWeight: 'bold'}}>TOTAL:</td>
                <td style={{...styles.td, backgroundColor: '#f0f8ff', color: '#1B91DA', fontWeight: 'bold', minWidth: '100px', width: '100px'}}>
                  {receiptItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}
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
                <th style={{...styles.th, minWidth: '100px', width: '100px'}}>No</th>
                <th style={{...styles.th, minWidth: '100px', width: '100px'}}>Ref No</th>
                <th style={{...styles.th, minWidth: '100px', width: '100px'}}>Bill No</th>
                <th style={{...styles.th, minWidth: '100px', width: '100px'}}>Date</th>
                <th style={{...styles.th, minWidth: '100px', width: '100px'}}>Bill Amount</th>
                <th style={{...styles.th, minWidth: '100px', width: '100px'}}>Paid Amount</th>
                <th style={{...styles.th, minWidth: '120px', width: '120px'}}>Balance Amount</th>
                <th style={{...styles.th, minWidth: '100px', width: '100px'}}>Amount</th>
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
                      value={bill.refNo}
                      onChange={(e) => handleBillItemChange(bill.id, 'refNo', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'refNo', false)}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      id={`bill_${bill.id}_billNo`}
                      type="text"
                      value={bill.billNo}
                      onChange={(e) => handleBillItemChange(bill.id, 'billNo', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'billNo', false)}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      id={`bill_${bill.id}_date`}
                      type="date"
                      value={bill.date}
                      onChange={(e) => handleBillItemChange(bill.id, 'date', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'date', false)}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    />
                  </td>
                  <td style={{...styles.td, minWidth: '100px', width: '100px'}}>
                    <input
                      id={`bill_${bill.id}_billAmount`}
                       
                      value={bill.billAmount}
                      onChange={(e) => handleBillItemChange(bill.id, 'billAmount', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'billAmount', false)}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    />
                  </td>
                  <td style={{...styles.td, minWidth: '100px', width: '100px'}}>
                    <input
                      id={`bill_${bill.id}_paidAmount`}
                      
                      value={bill.paidAmount}
                      onChange={(e) => handleBillItemChange(bill.id, 'paidAmount', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'paidAmount', false)}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    />
                  </td>
                  <td style={{...styles.td, minWidth: '120px', width: '120px'}}>
                    <input
                      id={`bill_${bill.id}_balanceAmount`}
                      
                      value={bill.balanceAmount}
                      onChange={(e) => handleBillItemChange(bill.id, 'balanceAmount', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'balanceAmount', false)}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    />
                  </td>
                  <td style={{...styles.td, minWidth: '100px', width: '100px'}}>
                    <input
                      id={`bill_${bill.id}_amount`}
                      
                      value={bill.amount}
                      onChange={(e) => handleBillItemChange(bill.id, 'amount', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'amount', false)}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
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
          <div style={styles.footerButtons}>
            <AddButton 
              onClick={handleClear}
              disabled={isSaving}
              activeButton={activeFooterAction}
            />
            <EditButton 
              onClick={openEditVoucherPopup}
              disabled={isSaving || loadingVouchers}
              activeButton={activeFooterAction}
            />
            <DeleteButton 
              onClick={openDeleteVoucherPopup}
              disabled={isSaving || loadingVouchers}
              activeButton={activeFooterAction}
            />
          
          </div>
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
              onClick={handleClear} 
              disabled={isSaving}
              activeButton={activeFooterAction}
            />
            <SaveButton 
              onClick={handleSave} 
              disabled={isSaving}
              activeButton={activeFooterAction}
            />
          </div>
        </div>
      </div>

      {/* POPUPS */}
      {accountPopupOpen && (
        <PopupListSelector
          {...getPopupConfig('account')}
          isOpen={accountPopupOpen}
          onClose={() => setAccountPopupOpen(false)}
          onSelect={handleAccountSelect}
        />
      )}

      {editVoucherPopupOpen && (
        <PopupListSelector
          {...getPopupConfig('editVoucher')}
          isOpen={editVoucherPopupOpen}
          onClose={() => setEditVoucherPopupOpen(false)}
          onSelect={handleVoucherSelect}
        />
      )}

      {deleteVoucherPopupOpen && (
        <PopupListSelector
          {...getPopupConfig('deleteVoucher')}
          isOpen={deleteVoucherPopupOpen}
          onClose={() => setDeleteVoucherPopupOpen(false)}
          onSelect={handleVoucherDelete}
        />
      )}

      {saveConfirmationOpen && (
        <ConfirmationPopup
          isOpen={saveConfirmationOpen}
          title={saveConfirmationData?.title}
          message={saveConfirmationData?.message}
          onConfirm={handleConfirmedSave}
          onCancel={handleCancelSave}
          confirmText={saveConfirmationData?.confirmText}
          cancelText={saveConfirmationData?.cancelText}
        />
      )}

      {amountPopupOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            width: screenSize.isMobile ? '90%' : screenSize.isTablet ? '70%' : '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: '#1B91DA',
              fontSize: screenSize.isMobile ? '18px' : '20px',
              fontWeight: 'bold'
            }}>GST & Bill Details</h2>

            {/* GST & Bill Section */}
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '16px',
              borderRadius: '6px',
              borderLeft: '4px solid #1B91DA'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                color: '#333',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>GST & Bill Details</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: screenSize.isMobile ? '1fr' : '1fr 1fr',
                gap: '12px'
              }}>
                {/* GST Type */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>GST Type</label>
                  <select
                    value={amountPopupData?.gstType || voucherDetails?.gstType || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box',
                      cursor: 'default',
                      appearance: 'none'
                    }}
                  >
                    <option value="">-- Select --</option>
                    <option value="CGST/SGST">CGST/SGST</option>
                    <option value="IGST">IGST</option>
                  </select>
                </div>

                {/* HSN/SAC */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>HSN/SAC</label>
                  <input
                    type="text"
                    value={amountPopupData?.hsnSac || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Ref Bill No */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Ref Bill No</label>
                  <input
                    type="text"
                    value={amountPopupData?.refBillNo || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Ref Bill Date */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Ref Bill Date</label>
                  <input
                    type="text"
                    value={amountPopupData?.refBillDate || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* GST % */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>GST %</label>
                  <input
                    type="text"
                    value={amountPopupData?.gstPercent || '0'}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* GST Amount */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>GST Amount</label>
                  <input
                    type="text"
                    value={`₹${amountPopupData?.gstAmount || '0.00'}`}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Bill Total */}
                <div style={{ gridColumn: screenSize.isMobile ? '1' : '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#1B91DA',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Bill Total</label>
                  <input
                    type="text"
                    value={`₹${amountPopupData?.billTotal || '0.00'}`}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #1B91DA',
                      borderRadius: '4px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      backgroundColor: '#f0f8ff',
                      color: '#1B91DA',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setAmountPopupOpen(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f5f5f5';
                  e.target.style.borderColor = '#1B91DA';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setAmountPopupOpen(false)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#1B91DA',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1576b9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1B91DA';
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptVoucher;
