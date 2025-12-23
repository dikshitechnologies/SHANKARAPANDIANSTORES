import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { EditButton, DeleteButton, SaveButton, ClearButton, AddButton, ActionButtons, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import SaveConfirmationModal from '../../components/SaveConfirmationModal/SaveConfirmationModal';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import apiService from '../../api/apiService';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';

const ReceiptVoucher = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.RECEIPT_VOUCHER),
    edit: hasModifyPermission(PERMISSION_CODES.RECEIPT_VOUCHER),
    delete: hasDeletePermission(PERMISSION_CODES.RECEIPT_VOUCHER)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // --- STATE MANAGEMENT ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Save confirmation popup
  const [saveConfirmationOpen, setSaveConfirmationOpen] = useState(false);
  const [saveConfirmationData, setSaveConfirmationData] = useState(null);

  // Common confirmation popup
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'default',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    action: null,
    isLoading: false
  });

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

  // 6. Data state
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // 7. Account popup state
  const [accountPopupOpen, setAccountPopupOpen] = useState(false);
  const [partyList, setPartyList] = useState([]);
  const [loadingParties, setLoadingParties] = useState(false);
  const [accountPopupContext, setAccountPopupContext] = useState(null); // 'header' or { itemId, field }
  const [allParties, setAllParties] = useState([]);
  const [partyCurrentPage, setPartyCurrentPage] = useState(1);
  const [hasReachedEndOfParties, setHasReachedEndOfParties] = useState(false);
  const [isLoadingMoreParties, setIsLoadingMoreParties] = useState(false);

  // Track typing for auto-popup
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [lastTypedValue, setLastTypedValue] = useState('');

  // Track current bill row for navigation
  const [currentBillRowIndex, setCurrentBillRowIndex] = useState(0);

  // Auth context for company code
  const { userData } = useAuth() || {};

  // --- REFS FOR ENTER KEY NAVIGATION ---
  const voucherNoRef = useRef(null);
  const dateRef = useRef(null);
  const accountNameRef = useRef(null);
  const gstTypeRef = useRef(null);
  const cashBankRef = useRef(null);
  const saveButtonRef = useRef(null);

  // Track which top-section field is focused to style active input
  const [focusedField, setFocusedField] = useState('');

  // Footer action active state
  const [activeFooterAction, setActiveFooterAction] = useState('add');

  // Screen size state
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  // Focus on date field on component mount
  useEffect(() => {
    if (dateRef.current) {
      setTimeout(() => {
        dateRef.current?.focus();
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
      const url = API_ENDPOINTS.RECEIPTVOUCHER.GETNEXTVNUMBER(userData.companyCode);
      const response = await apiService.get(url);
      console.log('Receipt Voucher response:', response);
      if (response.nextVoucher) {
        setVoucherDetails(prev => ({
          ...prev,
          voucherNo: response.nextVoucher
        }));
      }
    } catch (err) {
      console.error('Error fetching voucher number:', err);
      setError('Failed to fetch voucher number');
    } finally {
      setIsLoading(false);
    }
  }, [userData?.companyCode]);

  // Fetch accounts from backend API
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Add accounts endpoint to endpoints.js
      // const response = await apiService.get('Accounts/GetAccounts');
      // if (response.data?.accounts) {
      //   setAccountList(response.data.accounts);
      // }
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
      if (!userData?.companyCode) return;
      setLoadingVouchers(true);
      const url = API_ENDPOINTS.RECEIPTVOUCHER.GETBILLNUMLIST(userData.companyCode, page, 100);
      const response = await apiService.get(url);
      
      // API returns data in the .data property
      const voucherList = response?.data || [];
      
      if (Array.isArray(voucherList) && voucherList.length > 0) {
        const filtered = search 
          ? voucherList.filter(v => 
              (v.voucherNo || '').toLowerCase().includes(search.toLowerCase())
            )
          : voucherList;
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

  // Fetch pending bills for selected party
  const fetchPendingBills = useCallback(async (partyCode) => {
    try {
      if (!partyCode || !userData?.companyCode) return;
      
      setIsLoading(true);
      const url = API_ENDPOINTS.RECEIPTVOUCHER.GETPENDINGBILLS(partyCode, userData.companyCode);
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

  // Function to fetch parties with pagination
  const fetchPartiesWithPagination = useCallback(async (page = 1) => {
    if (page === 1) {
      setIsLoading(true);
      setHasReachedEndOfParties(false);
    } else {
      setIsLoadingMoreParties(true);
    }
    try {
      const url = API_ENDPOINTS.RECEIPTVOUCHER.GETPARTYLIST(
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
  }, [userData?.companyCode, userData?.username]);
  
  const fetchVoucherDetails = async (voucherNo) => {
    try {
      setIsLoading(true);
      const response = await apiService.get(API_ENDPOINTS.RECEIPTVOUCHER.GET_VOUCHER_DETAILS(voucherNo));
      console.log('Fetched Voucher Details Response:', response);
      
      if (response?.bledger) {
        const ledger = response.bledger;
        
        // Helper function to safely format date
        const safeFormatDate = (dateValue) => {
          if (!dateValue) return new Date().toISOString().substring(0, 10);
          try {
            // If already in YYYY-MM-DD format, return as is
            if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
              return dateValue;
            }
            // Otherwise parse and format
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
        
        // Map ledger details to receipt items
        if (response?.ledgers && Array.isArray(response.ledgers) && response.ledgers.length > 0) {
          console.log('Receipt Items from API:', response.ledgers);
          const items = response.ledgers.map((item, idx) => ({
            id: idx + 1,
            sNo: idx + 1,
            cashBank: item.accountName || '',
            accountCode: item.faccode || '',
            accountName: item.accountName || '',
            crDr: item.fCrDb || 'CR',
            type: item.type || '',
            chqNo: item.fchqno || '',
            chqDt: safeFormatDate(item.fchqdt),
            narration: '',
            amount: (item.fvrAmount || 0).toString()
          }));
          console.log('Mapped Receipt Items:', items);
          setReceiptItems(items);
        } else {
          console.log('No ledgers found in response, keeping current receipt items or setting empty');
          // Don't clear - keep the items if they exist
        }

        // Load particulars from salesTransaction if available
        if (response?.salesTransaction) {
          const sales = response.salesTransaction;
          setParticulars({
            '500': { available: 0, collect: parseInt(sales.given500) || 0, issue: 0 },
            '200': { available: 0, collect: parseInt(sales.given200) || 0, issue: 0 },
            '100': { available: 0, collect: parseInt(sales.given100) || 0, issue: 0 },
            '50': { available: 0, collect: parseInt(sales.given50) || 0, issue: 0 },
            '20': { available: 0, collect: parseInt(sales.given20) || 0, issue: 0 },
            '10': { available: 0, collect: parseInt(sales.given10) || 0, issue: 0 },
            '5': { available: 0, collect: parseInt(sales.given5) || 0, issue: 0 },
            '2': { available: 0, collect: parseInt(sales.given2) || 0, issue: 0 },
            '1': { available: 0, collect: parseInt(sales.given1) || 0, issue: 0 }
          });
        }
      }
    } catch (err) {
      console.error('Error fetching voucher details:', err);
      setError('Failed to load voucher details');
      alert('Failed to load voucher details: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete voucher from database
  const deleteVoucher = async (voucherNo) => {
    try {
      if (!userData?.companyCode) {
        setError('Company code not available');
        alert('Company code not available');
        return;
      }
      setIsLoading(true);
      const url = API_ENDPOINTS.RECEIPTVOUCHER.DELETE(voucherNo, userData.companyCode);
      try {
        await apiService.del(url);
        setError(null);
        toast.success(`Voucher ${voucherNo} deleted successfully`, { autoClose: 3000 });
        resetForm();
        await fetchNextVoucherNo();
        await fetchSavedVouchers();
      } catch (apiErr) {
        console.error('Delete API error:', apiErr);
        const errorMsg = apiErr.response?.data?.message || 'Failed to delete voucher';
        setError(errorMsg);
        alert(`Error: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error deleting voucher:', err);
      setError('Failed to delete voucher');
      alert('Failed to delete voucher');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch on component mount and when userData changes
  useEffect(() => {
    if (userData?.companyCode) {
      fetchNextVoucherNo();
    }
  }, [userData?.companyCode, fetchNextVoucherNo]);

  // Calculate Totals whenever items change
  useEffect(() => {
    const hasCashPayments = receiptItems.some(item => item.type === 'CASH');
    
    if (hasCashPayments) {
      const cashTotals = calculateCashTotals();
      setTotalAmount(parseFloat(cashTotals.netAmount));
    } else {
      const total = receiptItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      setTotalAmount(total);
    }
  }, [receiptItems])

  // Calculate Bill Totals
  useEffect(() => {
    const total = billDetails.reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);
    setBillTotalAmount(total);
  }, [billDetails]);

  // Reset form to empty state
  const resetForm = () => {
    console.log('Resetting form...');
    setVoucherDetails({
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
    setParticulars({
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
    setError(null);
    setIsEditing(false);
    setOriginalVoucherNo('');
    setFocusedField('');
    setCurrentBillRowIndex(0);
    
    // Focus on date field after reset
    setTimeout(() => {
      dateRef.current?.focus();
    }, 100);
  };

  // --- POPUP HANDLERS ---

  // Open edit voucher popup
  const openEditVoucherPopup = async () => {
    try {
      setLoadingVouchers(true);
      await fetchSavedVouchers(1, '');
      setEditVoucherPopupOpen(true);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError('Failed to load vouchers');
      toast.error('Failed to load vouchers', { autoClose: 3000 });
    } finally {
      setLoadingVouchers(false);
    }
  };

  // Open delete voucher popup
  const openDeleteVoucherPopup = async () => {
    setLoadingVouchers(true);
    try {
      await fetchSavedVouchers(1, '');
      setDeleteVoucherPopupOpen(true);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError('Failed to load vouchers');
    } finally {
      setLoadingVouchers(false);
    }
  };

  // Handle voucher selection for editing
  const handleVoucherSelect = async (selectedVoucher) => {
    try {
      setIsEditing(true);
      // Use voucherNo if available
      const voucherNo = selectedVoucher.voucherNo;
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
      // Use voucherNo if available
      const voucherNo = selectedVoucher.voucherNo;
      // Close the list popup first
      setDeleteVoucherPopupOpen(false);
      // Show confirmation popup
      setConfirmationPopup({
        isOpen: true,
        title: 'Delete Voucher',
        message: `Are you sure you want to delete voucher ${voucherNo}? This action cannot be undone.`,
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        action: 'confirmDelete',
        isLoading: false,
        voucherNo: voucherNo
      });
    } catch (err) {
      console.error('Error in delete voucher selection:', err);
      setError('Failed to process delete request');
    }
  };

  // Open account popup with search
  const openAccountPopup = async (context = 'header', searchTerm = '') => {
    try {
      setLoadingParties(true);
      let searchUrl = '';
      
      if (context === 'header') {
        searchUrl = API_ENDPOINTS.RECEIPTVOUCHER.PARTY_LIST(1, 100, searchTerm);
      } else {
        // For cash/bank search
        searchUrl = API_ENDPOINTS.RECEIPTVOUCHER.GETPARTYLIST(
          encodeURIComponent(searchTerm || ''),
          1,
          100
        );
      }
      
      const response = await apiService.getSilent(searchUrl);
      if (response?.data) {
        setPartyList(response.data);
        setAccountPopupContext(context);
        setAccountPopupOpen(true);
      }
    } catch (err) {
      console.error('Error fetching party list:', err);
      setError('Failed to load account list');
    } finally {
      setLoadingParties(false);
    }
  };

  // Handle account selection
  const handleAccountSelect = async (account) => {
    if (accountPopupContext === 'header') {
      // Header section account selection
      setVoucherDetails(prev => ({
        ...prev,
        accountName: account.name || '',
        accountCode: account.code || ''
      }));
      
      // Fetch party balance for the selected account
      try {
        const partyCode = account.code || '';
        if (partyCode) {
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
        }
      } catch (err) {
        console.error('Error fetching party balance:', err);
      }
      
      // After selecting account, move to GST Type
      setTimeout(() => {
        gstTypeRef.current?.focus();
      }, 100);
      
    } else if (accountPopupContext?.itemId) {
      // Receipt item row selection
      const { itemId } = accountPopupContext;
      setReceiptItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, cashBank: account.name, accountName: account.name, accountCode: account.code }
            : item
        )
      );
      
      // After selecting cash/bank, move to next field
      setTimeout(() => {
        document.getElementById(`receipt_${itemId}_crDr`)?.focus();
      }, 100);
    }
    setAccountPopupOpen(false);
    setAccountPopupContext(null);
  };

  // Get popup configuration
  const getPopupConfig = (type) => {
    const configs = {
      editVoucher: {
        title: 'Edit Receipt Voucher',
        displayFieldKeys: ['voucherNo'],
        searchFields: ['voucherNo'],
        headerNames: ['Voucher No'],
        columnWidths: { voucherNo: '200px' },
        data: savedVouchers,
        fetchItems: async () => savedVouchers,
        loading: loadingVouchers
      },
      deleteVoucher: {
        title: 'Delete Receipt Voucher',
        displayFieldKeys: ['voucherNo'],
        searchFields: ['voucherNo'],
        headerNames: ['Voucher No'],
        columnWidths: { voucherNo: '200px' },
        data: savedVouchers,
        fetchItems: async () => savedVouchers,
        loading: loadingVouchers
      },
      selectAccount: {
        title: 'Select Account',
        displayFieldKeys: [ 'name'],
        searchFields: ['name'],
        headerNames: [ 'Account Name'],
        columnWidths: {  name: 'auto' },
        data: partyList,
        fetchItems: async () => partyList,
        loading: loadingParties
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

  // Handle account name typing for auto-popup
  const handleAccountNameChange = (e) => {
    const value = e.target.value;
    handleInputChange(e);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to open popup after typing stops
    if (value.length > 0) {
      const timeout = setTimeout(() => {
        openAccountPopup('header', value);
      }, 500);
      setTypingTimeout(timeout);
    }
  };

  // Handle cash/bank typing for auto-popup
  const handleCashBankChange = (itemId, value) => {
    setReceiptItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, cashBank: value } : item
      )
    );
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to open popup after typing stops
    if (value.length > 0) {
      const timeout = setTimeout(() => {
        openAccountPopup({ itemId }, value);
      }, 500);
      setTypingTimeout(timeout);
    }
  };

  // Handle keydown with Enter key navigation
  const handleKeyDown = (e, nextRef, fieldName = '') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (fieldName === 'voucherNo') {
        dateRef.current?.focus();
      } else if (fieldName === 'date') {
        accountNameRef.current?.focus();
      } else if (fieldName === 'accountName') {
        gstTypeRef.current?.focus();
      } else if (fieldName === 'gstType') {
        // Move to first cash/bank field in first row
        if (receiptItems.length > 0) {
          setTimeout(() => document.getElementById(`receipt_${receiptItems[0].id}_cashBank`)?.focus(), 0);
        }
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
    setConfirmationPopup({
      isOpen: true,
      title: 'Add Receipt Row',
      message: 'Are you sure you want to add a new receipt row?',
      type: 'info',
      confirmText: 'Add',
      cancelText: 'Cancel',
      action: 'add',
      isLoading: false
    });
  };

  // Execute add receipt row
  const executeAddReceiptRow = () => {
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

  // Handle receipt table keydown with Enter key navigation
  const handleReceiptTableKeyDown = (e, currentRowIndex, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const receiptFields = ['cashBank', 'crDr', 'type', 'chqNo', 'chqDt', 'narration', 'amount'];
      const currentItem = receiptItems[currentRowIndex];

      // Get current field index
      const currentFieldIndex = receiptFields.indexOf(currentField);

      // Check if Cash/Bank is empty
      const isCashBankEmpty = !currentItem.cashBank.trim();

      // Special case: If at cashBank field and it's empty, skip to reference bill amount field
      if (currentField === 'cashBank' && isCashBankEmpty) {
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
      if (currentField === 'amount' && (!currentItem.amount || parseFloat(currentItem.amount) <= 0)) {
        // Don't move to next row - stay in same field
        return;
      }

      // Move to next field in same row
      if (currentFieldIndex < receiptFields.length - 1) {
        // Special case for receipt table: if Type is not CHQ, skip Chq No and Chq Dt
        if (currentField === 'type' && currentItem.type !== 'CHQ') {
          // Skip to narration
          const narrationFieldId = `receipt_${currentItem.id}_narration`;
          setTimeout(() => document.getElementById(narrationFieldId)?.focus(), 0);
        } 
        // Special case: when moving from chqNo to chqDt and type is not CHQ, skip to narration
        else if (currentField === 'chqNo' && currentItem.type !== 'CHQ') {
          const narrationFieldId = `receipt_${currentItem.id}_narration`;
          setTimeout(() => document.getElementById(narrationFieldId)?.focus(), 0);
        }
        // Special case: when moving from chqDt and type is not CHQ, skip to narration
        else if (currentField === 'chqDt' && currentItem.type !== 'CHQ') {
          const narrationFieldId = `receipt_${currentItem.id}_narration`;
          setTimeout(() => document.getElementById(narrationFieldId)?.focus(), 0);
        }
        else {
          // Normal navigation to next field
          const nextFieldId = `receipt_${currentItem.id}_${receiptFields[currentFieldIndex + 1]}`;
          setTimeout(() => document.getElementById(nextFieldId)?.focus(), 0);
        }
      } else {
        // Last field in current row (Amount field)
        // Check if next row exists and has cash/bank
        if (currentRowIndex < receiptItems.length - 1) {
          const nextItem = receiptItems[currentRowIndex + 1];
          
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
            const nextFieldId = `receipt_${nextItem.id}_${receiptFields[0]}`;
            setTimeout(() => document.getElementById(nextFieldId)?.focus(), 0);
          }
        } else {
          // Last row, check if we should add new row or go to bill details
          // Only add new row if current row has cash/bank and amount
          if (currentItem.cashBank.trim() && currentItem.amount && parseFloat(currentItem.amount) > 0) {
            // Add new row and focus on its cash/bank
            const newId = Math.max(...receiptItems.map(item => item.id), 0) + 1;
            setReceiptItems(prev => [
              ...prev,
              {
                id: newId,
                sNo: prev.length + 1,
                cashBank: '',
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
              document.getElementById(`receipt_${newId}_cashBank`)?.focus();
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
  };

  // Handle bill table keydown with Enter key navigation
  const handleBillTableKeyDown = (e, currentRowIndex, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const billFields = ['refNo', 'billNo', 'date', 'billAmount', 'paidAmount', 'balanceAmount', 'amount'];
      const currentBill = billDetails[currentRowIndex];

      // Get current field index
      const currentFieldIndex = billFields.indexOf(currentField);

      // If at amount field, move directly to save button
      if (currentField === 'amount') {
        setTimeout(() => saveButtonRef.current?.focus(), 0);
        return;
      }

      // Move to next field in same row
      if (currentFieldIndex < billFields.length - 1) {
        const nextFieldId = `bill_${currentBill.id}_${billFields[currentFieldIndex + 1]}`;
        setTimeout(() => document.getElementById(nextFieldId)?.focus(), 0);
      } else {
        // Last field in current row (shouldn't reach here as amount moves to save button)
        if (currentRowIndex < billDetails.length - 1) {
          const nextBill = billDetails[currentRowIndex + 1];
          const nextFieldId = `bill_${nextBill.id}_${billFields[0]}`;
          setTimeout(() => document.getElementById(nextFieldId)?.focus(), 0);
          setCurrentBillRowIndex(currentRowIndex + 1);
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
      // setAmountPopupOpen(true); // REMOVED - Popup disabled
    }
  };

  // Handle clear - clears current form
  const handleClear = () => {
    setConfirmationPopup({
      isOpen: true,
      title: 'Clear All Data',
      message: 'Are you sure you want to clear all data? This action cannot be undone.',
      type: 'warning',
      confirmText: 'Clear',
      cancelText: 'Cancel',
      action: 'clear',
      isLoading: false
    });
    resetForm();

  };

  // Handle print
  const handlePrint = () => {
    setConfirmationPopup({
      isOpen: true,
      title: 'Print Voucher',
      message: 'Are you sure you want to print this voucher?',
      type: 'info',
      confirmText: 'Print',
      cancelText: 'Cancel',
      action: 'print',
      isLoading: false
    });
  };

  // Format date to yyyy-MM-dd
  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return '';
    try {
      // If already in YYYY-MM-DD format, return as is
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // Otherwise parse and format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return '';
      }
      return date.toISOString().substring(0, 10);
    } catch (e) {
      console.warn('Date formatting error:', e);
      return '';
    }
  };

  // ========== SAVE FUNCTION ==========
  const savePaymentVoucher = async (updatedParticulars = null) => {
    if (isSaving) {
      return;
    }

    try {
      console.log('Save button clicked');
      
      if (!voucherDetails.voucherNo) {
        setError('Voucher number is required');
        alert('Voucher number is required');
        return;
      }
      if (!voucherDetails.accountName) {
        setError('Account is required');
        alert('Please select an account');
        return;
      }
      if (receiptItems.length === 0) {
        setError('At least one receipt item is required');
        alert('Please add at least one receipt item');
        return;
      }

      setIsSaving(true);
      setIsLoading(true);
      setError(null);

      // Prepare item details list
      const itemDetailsList = receiptItems
        .filter(item => item.cashBank && parseFloat(item.amount) > 0)
        .map(item => ({
          accountCode: item.accountCode || '',
          accountName: item.accountName || item.cashBank || '',
          crdr: item.crDr,
          type: item.type,
          amount: parseFloat(item.amount) || 0,
          chequeNo: item.chqNo || '',
          chequeDate: item.chqDt ? formatDateToYYYYMMDD(item.chqDt) : '',
          narration: item.narration
        }));

      // Prepare reference bills
      const referenceBills = billDetails
        .filter(bill => bill.refNo && parseFloat(bill.amount) > 0)
        .map(bill => ({
          refNo: bill.refNo,
          date: bill.date ? formatDateToYYYYMMDD(bill.date) : '',
          amount: (parseFloat(bill.amount) || 0).toString()
        }));

      // Use updatedParticulars if provided (from modal), otherwise use state particulars
      const particularsToUse = updatedParticulars || particulars;
      
      // Calculate givenTotal from COLLECT values (amount collected)
      let givenTotal = 0;
      const denominations = [500, 200, 100, 50, 20, 10, 5, 2, 1];
      
      denominations.forEach(denom => {
        // Get the COLLECT value for this denomination (string key)
        const denomKey = denom.toString();
        const collectValue = particularsToUse[denomKey]?.collect;
        const collectCount = parseInt(collectValue) || 0;
        givenTotal += collectCount * denom;
      });
      
      // Calculate balanceGiven (change given back)
      // Formula: totalAmt = givenTotal - balanceGiven
      // So: balanceGiven = givenTotal - totalAmt
      const balanceGiven = givenTotal - totalAmount;
      
      // Also update state if we received updatedParticulars
      if (updatedParticulars) {
        setParticulars(updatedParticulars);
      }

      const payload = {
        voucherNo: voucherDetails.voucherNo,
        voucherDate: formatDateToYYYYMMDD(voucherDetails.date),
        customerCode: voucherDetails.accountCode,
        customerName: voucherDetails.accountName,
        gstType: voucherDetails.gstType,
        partyBalance: parseFloat(voucherDetails.balance) || 0,
        totalAmt: totalAmount,
        givenTotal: givenTotal,
        balanceGiven: balanceGiven,
        compcode: userData?.companyCode || '001',
        usercode: userData?.userCode || '001',
        itemDetailsList: itemDetailsList,
        referenceBills: referenceBills,
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

      console.log('Payload:', payload);
      console.log('Is Editing:', isEditing);

      const endpoint = isEditing 
        ? API_ENDPOINTS.RECEIPTVOUCHER.PUT_RECEIPT_VOUCHER(false)
        : API_ENDPOINTS.RECEIPTVOUCHER.POST_RECEIPT_VOUCHER(true);

      console.log('Using endpoint:', endpoint);

      const response = await axiosInstance.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('API Response:', response);

      if (response?.data) {
        const message = response.data.message || `Voucher ${isEditing ? 'updated' : 'saved'} successfully`;
        const savedVoucherNo = response.data.voucherNo || voucherDetails.voucherNo;
        
        toast.success(
          `Voucher ${isEditing ? "updated" : "saved"} successfully\nVoucher No: ${savedVoucherNo}`,
          { autoClose: 3000 }
        );

        setError(null);
        
        // Refresh saved vouchers list
        await fetchSavedVouchers(1, '');
        
        // Reset form completely after save
        resetForm();
        await fetchNextVoucherNo();
        
        return response.data;
      }
    } catch (err) {
      let errorMsg = `Failed to ${isEditing ? 'update' : 'save'} receipt voucher`;
      
      if (err.response) {
        console.error("Server error response:", err.response);
        if (err.response.data) {
          if (err.response.data.message) {
            errorMsg = err.response.data.message;
          } else if (err.response.data.error) {
            errorMsg = err.response.data.error;
          } else if (typeof err.response.data === 'string') {
            errorMsg = err.response.data;
          } else if (err.response.data.errors) {
            const errors = Object.values(err.response.data.errors).flat();
            errorMsg = errors.join(', ');
          }
        }
        errorMsg = `${errorMsg} (Status: ${err.response.status})`;
      } else if (err.request) {
        errorMsg = 'No response from server. Please check your connection.';
      } else {
        errorMsg = err.message || errorMsg;
      }
      
      if (errorMsg.toLowerCase().includes('duplicate') || errorMsg.toLowerCase().includes('already exists')) {
        errorMsg = `Voucher number ${voucherDetails.voucherNo} already exists. Please use a different number or edit the existing voucher.`;
      }
      
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
      console.error('Error saving voucher:', err);
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  // Calculate cash totals separated by CR and DR
  const calculateCashTotals = () => {
    let crTotal = 0;
    let drTotal = 0;

    receiptItems.forEach(item => {
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
      hasOnlyCash: receiptItems.every(item => item.type === 'CASH' || !item.type)
    };

    return result;
  };

  // Handle save with confirmation
  const handleSave = async () => {
    const cashTotals = calculateCashTotals();
    
    // Check if there are CASH type payments
    const hasCashPayments = receiptItems.some(item => item.type === 'CASH');
    
    if (hasCashPayments) {
      // Show confirmation modal only for CASH payments
      const confirmationData = {
        cashTotals: cashTotals,
        hasCashPayments: hasCashPayments
      };
      setSaveConfirmationData(confirmationData);
      showSaveConfirmation();
    } else {
      // No CASH payments, proceed directly to save
      await savePaymentVoucher();
    }
  };

  // Function to show save confirmation popup
  const showSaveConfirmation = () => {
    setSaveConfirmationOpen(true);
  };

  // Function to handle confirmed save
  const handleConfirmedSave = async (updatedParticulars) => {
    setSaveConfirmationOpen(false);
    // Pass updatedParticulars directly to savePaymentVoucher
    await savePaymentVoucher(updatedParticulars);
  };

  // Function to cancel save
  const handleCancelSave = () => {
    setSaveConfirmationOpen(false);
  };

  // Generic confirmation handler for all actions
  const handleConfirmationAction = async () => {
    setConfirmationPopup(prev => ({ ...prev, isLoading: true }));
    
    try {
      switch (confirmationPopup.action) {
        case 'clear':
          resetForm();
          break;
        case 'add':
          executeAddReceiptRow();
          break;
        case 'edit':
          setLoadingVouchers(true);
          await fetchSavedVouchers(1, '');
          setEditVoucherPopupOpen(true);
          setLoadingVouchers(false);
          break;
        case 'confirmDelete':
          await deleteVoucher(confirmationPopup.voucherNo);
          break;
        case 'print':
          console.log('Print functionality');
          break;
        default:
          break;
      }
      
      setConfirmationPopup(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error('Error in confirmation action:', err);
      setError('Failed to perform action');
    } finally {
      setConfirmationPopup(prev => ({ ...prev, isLoading: false }));
    }
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
                onKeyDown={(e) => handleKeyDown(e, dateRef, 'voucherNo')}
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
                onChange={handleAccountNameChange}
                onFocus={() => setFocusedField('accountName')}
                onBlur={() => setFocusedField('')}
                onClick={() => openAccountPopup('header', voucherDetails.accountName)}
                onKeyDown={(e) => handleKeyDown(e, gstTypeRef, 'accountName')}
                style={focusedField === 'accountName' ? styles.inlineInputClickableFocused : styles.inlineInputClickable}
                placeholder="Select Account"
              />
            </div>

            

            {/* Balance */}
            <div style={styles.fieldGroup}>
              <label style={styles.inlineLabel}>Balance</label>
              <input
                type="text"
                name="balance"
                value={voucherDetails.balance + ' '+ voucherDetails.crDr}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('balance')}
                onBlur={() => setFocusedField('')}
                style={focusedField === 'balance' ? styles.inlineInputFocused : styles.inlineInput}
                readonly
              />
            </div>

            {/* CR/DR - No Label */}
            {/* <div style={styles.fieldGroup}>
              <input
                name="crDr"
                value={voucherDetails.crDr}
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
                value={voucherDetails.gstType}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('gstType')}
                onBlur={() => setFocusedField('')}
                style={focusedField === 'gstType' ? styles.inlineInputFocused : styles.inlineInput}
                onKeyDown={(e) => handleKeyDown(e, null, 'gstType')}
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
                      onChange={(e) => handleCashBankChange(item.id, e.target.value)}
                      onKeyDown={(e) => handleReceiptTableKeyDown(e, index, 'cashBank')}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                      placeholder="Type to search"
                    />
                  </td>
                  <td style={styles.td}>
                    <select
                      id={`receipt_${item.id}_crDr`}
                      value={item.crDr}
                      onChange={(e) => handleReceiptItemChange(item.id, 'crDr', e.target.value)}
                      onKeyDown={(e) => handleReceiptTableKeyDown(e, index, 'crDr')}
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
                      onKeyDown={(e) => handleReceiptTableKeyDown(e, index, 'type')}
                      style={styles.editableInput}
                      onFocus={(e) => (e.target.style.border = '2px solid #1B91DA')}
                      onBlur={(e) => (e.target.style.border = 'none')}
                    >
                      <option value="">Select</option>
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
                      onKeyDown={(e) => handleReceiptTableKeyDown(e, index, 'chqNo')}
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
                      onKeyDown={(e) => handleReceiptTableKeyDown(e, index, 'chqDt')}
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
                      onKeyDown={(e) => handleReceiptTableKeyDown(e, index, 'narration')}
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
                      onKeyDown={(e) => handleReceiptTableKeyDown(e, index, 'amount')}
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
                      onKeyDown={(e) => handleBillTableKeyDown(e, index, 'refNo')}
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
                      onKeyDown={(e) => handleBillTableKeyDown(e, index, 'billNo')}
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
                      onKeyDown={(e) => handleBillTableKeyDown(e, index, 'date')}
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
                      onKeyDown={(e) => handleBillTableKeyDown(e, index, 'billAmount')}
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
                      onKeyDown={(e) => handleBillTableKeyDown(e, index, 'paidAmount')}
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
                      onKeyDown={(e) => handleBillTableKeyDown(e, index, 'balanceAmount')}
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
                      onKeyDown={(e) => handleBillTableKeyDown(e, index, 'amount')}
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

      {/* --- FOOTER SECTION --- */}
      <div style={styles.footerSection}>
        <div style={styles.rightColumn}>
          <ActionButtons
            activeButton={activeFooterAction}
            onButtonClick={(type) => {
              setActiveFooterAction(type);
              if (type === 'add') handleAddReceiptRow();
              else if (type === 'edit') openEditVoucherPopup();
              else if (type === 'delete') openDeleteVoucherPopup();
            }}
          >
            <AddButton buttonType="add" disabled={!formPermissions.add} />
            <EditButton buttonType="edit" disabled={!formPermissions.edit} />
            <DeleteButton buttonType="delete" disabled={!formPermissions.delete} />
          </ActionButtons>
        </div>
        <div style={styles.totalsContainer}>
          <div style={styles.totalItem}>
            <span style={styles.totalLabel}>Total Amount</span>
            <span style={styles.totalValue}>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style={styles.totalItem}>
            <span style={styles.totalLabel}>Bill Total</span>
            <span style={styles.totalValue}>₹{billTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div style={styles.footerButtons}>
          <ActionButtons1
            ref={saveButtonRef}
            onClear={handleClear}
            onSave={handleSave}
            onPrint={handlePrint}
            activeButton={activeFooterAction}
            onButtonClick={(type) => setActiveFooterAction(type)}
          />
        </div>
      </div>
      {/* POPUPS */}
      {editVoucherPopupOpen && (
        <PopupListSelector
          open={editVoucherPopupOpen}
          onClose={() => setEditVoucherPopupOpen(false)}
          onSelect={handleVoucherSelect}
          fetchItems={getPopupConfig('editVoucher').fetchItems}
          title={getPopupConfig('editVoucher').title}
          displayFieldKeys={getPopupConfig('editVoucher').displayFieldKeys}
          searchFields={getPopupConfig('editVoucher').searchFields}
          headerNames={getPopupConfig('editVoucher').headerNames}
          columnWidths={getPopupConfig('editVoucher').columnWidths}
          tableStyles={{
            headerBackground: 'linear-gradient(135deg, #307AC8 0%, #06A7EA 100%)',
            itemHoverBackground: 'rgba(48, 122, 200, 0.1)',
            itemSelectedBackground: 'rgba(48, 122, 200, 0.2)',
          }}
          maxHeight="60vh"
          searchPlaceholder="Search receipt vouchers..."
          responsiveBreakpoint={768}
        />
      )}

      {deleteVoucherPopupOpen && (
        <PopupListSelector
          open={deleteVoucherPopupOpen}
          onClose={() => setDeleteVoucherPopupOpen(false)}
          onSelect={handleVoucherDelete}
          fetchItems={getPopupConfig('deleteVoucher').fetchItems}
          title={getPopupConfig('deleteVoucher').title}
          displayFieldKeys={getPopupConfig('deleteVoucher').displayFieldKeys}
          searchFields={getPopupConfig('deleteVoucher').searchFields}
          headerNames={getPopupConfig('deleteVoucher').headerNames}
          columnWidths={getPopupConfig('deleteVoucher').columnWidths}
          tableStyles={{
            headerBackground: 'linear-gradient(135deg, #307AC8 0%, #06A7EA 100%)',
            itemHoverBackground: 'rgba(48, 122, 200, 0.1)',
            itemSelectedBackground: 'rgba(48, 122, 200, 0.2)',
          }}
          maxHeight="60vh"
          searchPlaceholder="Search receipt vouchers..."
          responsiveBreakpoint={768}
        />
      )}

      {accountPopupOpen && (
        <PopupListSelector
          open={accountPopupOpen}
          onClose={() => setAccountPopupOpen(false)}
          onSelect={handleAccountSelect}
          fetchItems={getPopupConfig('selectAccount').fetchItems}
          title={getPopupConfig('selectAccount').title}
          displayFieldKeys={getPopupConfig('selectAccount').displayFieldKeys}
          searchFields={getPopupConfig('selectAccount').searchFields}
          headerNames={getPopupConfig('selectAccount').headerNames}
          columnWidths={getPopupConfig('selectAccount').columnWidths}
          tableStyles={{
            headerBackground: 'linear-gradient(135deg, #307AC8 0%, #06A7EA 100%)',
            itemHoverBackground: 'rgba(48, 122, 200, 0.1)',
            itemSelectedBackground: 'rgba(48, 122, 200, 0.2)',
          }}
          maxHeight="60vh"
          searchPlaceholder="Search accounts..."
          responsiveBreakpoint={768}
        />
      )}

      {saveConfirmationOpen && (
        <SaveConfirmationModal
          isOpen={saveConfirmationOpen}
          onClose={handleCancelSave}
          onConfirm={handleConfirmedSave}
          title={`${isEditing ? 'Update' : 'Create'} Receipt Voucher`}
          particulars={particulars}
          loading={isSaving}
          voucherNo={voucherDetails.voucherNo}
          voucherDate={voucherDetails.date}
          totalAmount={totalAmount}
          cashTotals={saveConfirmationData?.cashTotals}
          hasCashPayments={saveConfirmationData?.hasCashPayments || false}
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

      {/* Generic Confirmation Popup */}
      <ConfirmationPopup
        isOpen={confirmationPopup.isOpen}
        onClose={() => setConfirmationPopup(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmationAction}
        title={confirmationPopup.title}
        message={confirmationPopup.message}
        type={confirmationPopup.type}
        confirmText={confirmationPopup.isLoading ? 'Processing...' : confirmationPopup.confirmText}
        showLoading={confirmationPopup.isLoading}
        disableBackdropClose={confirmationPopup.isLoading}
      />
    </div>
  );
};

export default ReceiptVoucher;