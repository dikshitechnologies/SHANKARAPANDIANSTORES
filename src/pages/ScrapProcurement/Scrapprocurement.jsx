import React, { useState, useEffect, useRef } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import PopupListSelector from '../../components/Listpopup/PopupListSelector.jsx';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_ENDPOINTS } from '../../api/endpoints';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { hover } from 'framer-motion';

const Icon = {
  Search: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  ),
}

const Scrapprocurement = () => {
  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('add');

  // 1. Header Details State
  const [billDetails, setBillDetails] = useState({
    billNo: '',
    billDate: new Date().toISOString().substring(0, 10),
    mobileNo: '',
    empName: '',
    salesman: '',
    salesmanCode: '', 
    custName: '',
    custCode: '', 
    scrapProductInput: '',
    scrapCode: '',
  });

  // 2. Table Items State - Store both scrap and item info
  const [items, setItems] = useState([
    {
      id: 1,
      sNo: 1,
      scrapProductName: '', // This is for scrap (scrpName)
      scrapCode: '', // This is for scrap code (scrpCode)
      itemName: '', // This is itemName from item popup
      itemCode: '', // This is itemCode from item popup
      uom: '',
      tax: '',
      sRate: '',
      qty: '',
      amount: '0.00'
    }
  ]);

  // 3. Totals State
  const [totalQty, setTotalQty] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // --- REFS FOR ENTER KEY NAVIGATION ---
  const billNoRef = useRef(null);
  const billDateRef = useRef(null);
  const mobileRef = useRef(null);
  const empNameRef = useRef(null);
  const salesmanRef = useRef(null);
  const custNameRef = useRef(null);
  const scrapProductRef = useRef(null);

  // Track which top-section field is focused to style active input
  const [focusedField, setFocusedField] = useState('');
  const [showSalesmanPopup, setShowSalesmanPopup] = useState(false);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [showScrapPopup, setShowScrapPopup] = useState(false);
  const [showItemPopup, setShowItemPopup] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [allItems, setAllItems] = useState([]);
  const [selectedRowForItem, setSelectedRowForItem] = useState(null);
  const [closedItemByUser, setClosedItemByUser] = useState(false);
  
  // Separate search terms for each popup
  const [salesmanSearchTerm, setSalesmanSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [scrapSearchTerm, setScrapSearchTerm] = useState('');
  
  const [closedByUser, setClosedByUser] = useState(false);
  
  // Store all fetched data for filtering
  const [allSalesmen, setAllSalesmen] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [allScrapItems, setAllScrapItems] = useState([]);

  // Track which field is currently being searched
  const [activeSearchField, setActiveSearchField] = useState(null);

  // Footer action active state
  const [activeFooterAction, setActiveFooterAction] = useState('all');

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

  // NEW STATES FOR VOUCHER POPUPS
  const [showVoucherListPopup, setShowVoucherListPopup] = useState(false);
  const [voucherSearchTerm, setVoucherSearchTerm] = useState('');
  const [voucherList, setVoucherList] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [popupMode, setPopupMode] = useState(''); // 'edit' or 'delete'
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Track if in edit mode

  // Confirmation Popup States
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    showIcon: true,
    hideCancelButton: false
  });

  // States to track original data for cancellation
  const [originalBillDetails, setOriginalBillDetails] = useState(null);
  const [originalItems, setOriginalItems] = useState(null);

  // Fetch next bill number
  const fetchNextBillNo = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.Scrap_Procurement.GET_VOUCHER_NO);
      
      // Try to get voucherNo from response
      const voucherNo = response?.data?.voucherNo;
      
      if (voucherNo) {
        setBillDetails(prev => ({ 
          ...prev, 
          billNo: voucherNo 
        }));
      } 
    } catch (err) {
      console.error('Failed to fetch voucher number:', err);
      setBillDetails(prev => ({ 
        ...prev, 
        billNo: 'SC00001AA' 
      }));
    }
  };

  useEffect(() => {
    fetchNextBillNo();
  }, [userData]);

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

  // Calculate Totals whenever items change
  useEffect(() => {
    const qtyTotal = items.reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
    const amountTotal = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);

    setTotalQty(qtyTotal);
    setTotalAmount(amountTotal);
  }, [items]);

  // Fetch all items when component mounts
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const url = API_ENDPOINTS.Scrap_Procurement.GET_SALESiNVOICE_ITEMS;
        const res = await axiosInstance.get(url);
        const data = res?.data || [];
        setAllItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching items:', error);
        setAllItems([]);
      }
    };

    fetchAllItems();
  }, []);

  // Fetch all salesmen when component mounts
  useEffect(() => {
    const fetchAllSalesmen = async () => {
      try {
        const url = API_ENDPOINTS.SALESMAN_CREATION_ENDPOINTS.getSalesmen;
        const res = await axiosInstance.get(url);
        const data = res?.data || [];
        setAllSalesmen(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching salesmen:', error);
        setAllSalesmen([]);
      }
    };

    fetchAllSalesmen();
  }, []);

  // Fetch all customers when component mounts
  useEffect(() => {
    const fetchAllCustomer = async () => {
      try {
        const url = API_ENDPOINTS.sales_return.getCustomers;
        const res = await axiosInstance.get(url);
        const data = res?.data || [];
        setAllCustomers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setAllCustomers([]);
      }
    };

    fetchAllCustomer();
  }, []);

  // Fetch all scrap items when component mounts
  useEffect(() => {
    const fetchAllScrapItems = async () => {
      try {
        const url = API_ENDPOINTS.SCRAP_CREATION.GET_SCRAP_ITEMS;
        const res = await axiosInstance.get(url);
        const data = res?.data || [];
        setAllScrapItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching scrap items:', error);
        setAllScrapItems([]);
      }
    };

    fetchAllScrapItems();
  }, []);

  // Handle salesman popup auto-open
  useEffect(() => {
    if (billDetails.salesman.length > 0 && !showSalesmanPopup && !closedByUser && !isEditMode) {
      if (showCustomerPopup || showScrapPopup) return;
      
      setSalesmanSearchTerm(billDetails.salesman);
      setActiveSearchField('salesman');
      
      const timer = setTimeout(() => {
        setShowSalesmanPopup(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [billDetails.salesman, showSalesmanPopup, closedByUser, showCustomerPopup, showScrapPopup, isEditMode]);

  // Handle customer popup auto-open
  useEffect(() => {
    if (billDetails.custName.length > 0 && !showCustomerPopup && !closedByUser && !isEditMode) {
      if (showSalesmanPopup || showScrapPopup) return;
      
      setCustomerSearchTerm(billDetails.custName);
      setActiveSearchField('customer');
      
      const timer = setTimeout(() => {
        setShowCustomerPopup(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [billDetails.custName, showCustomerPopup, closedByUser, showSalesmanPopup, showScrapPopup, isEditMode]);

  // Handle scrap popup auto-open
  useEffect(() => {
    if (billDetails.scrapProductInput.length > 0 && !showScrapPopup && !closedByUser) {
      if (showSalesmanPopup || showCustomerPopup) return;
      
      setScrapSearchTerm(billDetails.scrapProductInput);
      setActiveSearchField('scrap');
      
      const timer = setTimeout(() => {
        setShowScrapPopup(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [billDetails.scrapProductInput, showScrapPopup, closedByUser, showSalesmanPopup, showCustomerPopup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setShowSalesmanPopup(false);
      setShowCustomerPopup(false);
      setShowScrapPopup(false);
      setShowItemPopup(false);
      setClosedByUser(false);
      setClosedItemByUser(false);
      setActiveSearchField(null);
      setSelectedRowForItem(null);
      setSalesmanSearchTerm('');
      setCustomerSearchTerm('');
      setScrapSearchTerm('');
      setItemSearchTerm('');
    };
  }, []);

  // Helper function to show confirmation popup
  const showConfirmation = (config) => {
    setConfirmConfig({
      ...confirmConfig,
      ...config,
      onCancel: config.onCancel || (() => setShowConfirmPopup(false))
    });
    setShowConfirmPopup(true);
  };

  // Function to revert to original data
  const revertToOriginalData = () => {
    if (originalBillDetails && originalItems) {
      setBillDetails({...originalBillDetails});
      setItems([...originalItems]);
      setOriginalBillDetails(null);
      setOriginalItems(null);
    }
    setIsEditMode(false);
  };

  // NEW: Fetch voucher list for popup
  const fetchVoucherList = async (pageNum = 1, search = '') => {
    try {
      setIsLoadingVouchers(true);
      const searchTerm = search || voucherSearchTerm || '';
      
      const url = API_ENDPOINTS.Scrap_Procurement.GET_BILL_LIST;
      const response = await axiosInstance.get(url);
      
      let dataArray = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        dataArray = response.data.data;
      } else if (Array.isArray(response?.data)) {
        dataArray = response.data;
      }
      
      if (!Array.isArray(dataArray)) {
        console.warn('Voucher data is not an array:', dataArray);
        return [];
      }
      
      let filteredData = dataArray;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = dataArray.filter(voucher => {
          const voucherNo = (voucher.voucher || voucher.voucherNo || '').toLowerCase();
          return voucherNo.includes(searchLower);
        });
      }
      
      const uniqueVouchers = new Map();
      
      filteredData.forEach((item, index) => {
        const voucherNo = item.voucher || item.voucherNo || '';
        if (voucherNo && !uniqueVouchers.has(voucherNo)) {
          uniqueVouchers.set(voucherNo, {
            id: item.id || voucherNo || `voucher-${index}`,
            voucherNo: voucherNo,
          });
        }
      });
      
      return Array.from(uniqueVouchers.values());
      
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      return [];
    } finally {
      setIsLoadingVouchers(false);
    }
  };

  // NEW: Function to load a voucher for editing
  const loadVoucherForEditing = async (voucherNo) => {
    try {
      const url = API_ENDPOINTS.Scrap_Procurement.GET_VOUCHER_BY_NO(voucherNo);
      const response = await axiosInstance.get(url);
      
      const voucherData = response?.data?.data || response?.data;
      
      if (voucherData) {
        const newBillDetails = {
          billNo: voucherData.voucherNo || '',
          billDate: voucherData.voucherDate || new Date().toISOString().substring(0, 10),
          mobileNo: voucherData.mobileNo || '',
          empName: voucherData.empName || '',
          salesman: voucherData.salesmanName || '',
          salesmanCode: voucherData.salesmancode || '', 
          custName: voucherData.customerName || '',
          custCode: voucherData.customercode || '', 
          scrapProductInput: voucherData.scrpName || '',
          scrapCode: voucherData.scrpCode || '',
        };

        let newItems = [];
        if (voucherData.items && Array.isArray(voucherData.items)) {
          newItems = voucherData.items.map((item, index) => ({
            id: index + 1,
            sNo: index + 1,
            scrapProductName: voucherData.scrpName || '',
            scrapCode: voucherData.scrpCode || '',
            itemName: item.itemName || '',
            itemCode: item.itemCode || '',
            uom: item.uom || 'KG',
            tax: item.tax?.toString() || '',
            sRate: item.rate?.toString() || '',
            qty: item.qty?.toString() || '',
            amount: item.amount?.toString() || '0.00'
          }));
        }

        // Store original data for cancellation
        setOriginalBillDetails({...newBillDetails});
        setOriginalItems([...newItems]);
        
        // Set edit mode first to prevent popups from showing
        setIsEditMode(true);
        
        // Set current data
        setBillDetails(newBillDetails);
        setItems(newItems);
        
        showConfirmation({
          title: 'Success',
          message: `Voucher ${voucherNo} loaded successfully for editing.`,
          type: 'success',
          confirmText: 'OK',
          showIcon: true,
          onConfirm: () => {
            setShowConfirmPopup(false);
          }
        });
      } else {
        showConfirmation({
          title: 'Not Found',
          message: `No voucher data found for ${voucherNo}`,
          type: 'warning',
          confirmText: 'OK',
          showIcon: true,
          onConfirm: () => setShowConfirmPopup(false)
        });
      }
    } catch (error) {
      console.error('Error loading voucher:', error);
      showConfirmation({
        title: 'Error',
        message: `Failed to load voucher: ${error.message}`,
        type: 'danger',
        confirmText: 'OK',
        showIcon: true,
        onConfirm: () => setShowConfirmPopup(false)
      });
    }
  };

  // NEW: Function to delete a voucher
  const deleteVoucher = async (voucherNo) => {
    showConfirmation({
      title: 'Delete Voucher',
      message: `Are you sure you want to delete voucher ${voucherNo}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const response = await axiosInstance.delete(
            API_ENDPOINTS.Scrap_Procurement.DELETE_SCRAP_PROCUREMENT(voucherNo)
          );
          
          if (response.status === 200 || response.status === 201) {
            showConfirmation({
              title: 'Success',
              message: `Voucher ${voucherNo} deleted successfully.`,
              type: 'success',
              confirmText: 'OK',
              showIcon: true,
              onConfirm: () => {
                setShowConfirmPopup(false);
                handleClear();
                fetchNextBillNo();
              }
            });
          } else {
            showConfirmation({
              title: 'Error',
              message: 'Failed to delete voucher. Please try again.',
              type: 'danger',
              confirmText: 'OK',
              showIcon: true,
              onConfirm: () => setShowConfirmPopup(false)
            });
          }
        } catch (error) {
          console.error('Error deleting voucher:', error);
          showConfirmation({
            title: 'Error',
            message: `Failed to delete voucher: ${error.response?.data?.message || error.message}`,
            type: 'danger',
            confirmText: 'OK',
            showIcon: true,
            onConfirm: () => setShowConfirmPopup(false)
          });
        }
      }
    });
  };

  // NEW: Handle Edit button click
  const handleEditClick = () => {
    setPopupMode('edit');
    setVoucherSearchTerm('');
    setShowVoucherListPopup(true);
  };

  // NEW: Handle Delete button click
  const handleDeleteClick = () => {
    setPopupMode('delete');
    setVoucherSearchTerm('');
    setShowVoucherListPopup(true);
  };

  // Fetch items list for popup
  const fetchItemList = async (pageNum = 1, search = '') => {
    try {
      const searchTerm = search || itemSearchTerm || '';
      
      if (allItems.length > 0) {
        const searchLower = searchTerm.toLowerCase();
        const filtered = allItems.filter(item => {
          const code = (item.itemCode || '').toLowerCase();
          const name = (item.itemName || '').toLowerCase();
          return code.includes(searchLower) || name.includes(searchLower);
        });
        
        return filtered.map((item, index) => ({
          id: item.itemCode || `item-${index}`,
          itemCode: item.itemCode || '',
          itemName: item.itemName || '',
          barcode: item.barcode || item.itemCode || '',
          uom: item.uom || 'KG',
          brand: item.brand || '',
          category: item.category || '',
          model: item.model || '',
          size: item.size || '',
          hsn: item.hsn || '',
          preRate: item.preRate || '0',
          type: item.type || '',
        }));
      }
      
      const url = API_ENDPOINTS.Scrap_Procurement.GET_ITEMS_BY_TYPE +
                (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '');
      const response = await axiosInstance.get(url);
      const data = response?.data || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data.map((item, index) => ({
        id: item.itemCode || `item-${index}`,
        itemCode: item.itemCode || '',
        itemName: item.itemName || '',
        barcode: item.barcode || item.itemCode || '',
        uom: item.uom || 'KG',
        brand: item.brand || '',
        category: item.category || '',
        model: item.model || '',
        size: item.size || '',
        hsn: item.hsn || '',
        preRate: item.preRate || '0',
        type: item.type || '',
      }));
      
    } catch (error) {
      console.error('Error fetching items:', error);
      return [];
    }
  };

  // Fetch salesmen list for popup
  const fetchSalesManList = async (pageNum = 1, search = '') => {
    try {
      const searchTerm = search || salesmanSearchTerm || '';
      
      if (allSalesmen.length > 0) {
        const searchLower = searchTerm.toLowerCase();
        const filtered = allSalesmen.filter(salesman => {
          const code = (salesman.code || salesman.fcode || salesman.salesmanCode || '').toLowerCase();
          const firstName = (salesman.fname || salesman.firstName || salesman.name || '').toLowerCase();
          const lastName = (salesman.lname || salesman.lastName || '').toLowerCase();
          const fullName = `${firstName} ${lastName}`.toLowerCase();
          
          return code.includes(searchLower) || 
                 firstName.includes(searchLower) ||
                 lastName.includes(searchLower) ||
                 fullName.includes(searchLower);
        });
        
        return filtered.map((salesman, index) => ({
          id: salesman.id || salesman.code || `salesman-${index}`,
          code: salesman.code || salesman.fcode || salesman.salesmanCode || '',
          fcode: salesman.fcode || salesman.code || '',
          fname: salesman.fname || salesman.firstName || salesman.name || '',
          lname: salesman.lname || salesman.lastName || '',
          fullName: `${salesman.fname || salesman.firstName || salesman.name || ''} ${salesman.lname || salesman.lastName || ''}`.trim(),
          mobile: salesman.mobile || salesman.phone || '',
          salesmanCode: salesman.code || salesman.fcode || salesman.salesmanCode || '',
        }));
      }
      
      const url = API_ENDPOINTS.SALESMAN_CREATION_ENDPOINTS.getSalesmen;
      const response = await axiosInstance.get(url);
      const data = response?.data || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      setAllSalesmen(data);
      
      let filteredData = data;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = data.filter(salesman => {
          const code = (salesman.code || salesman.fcode || salesman.salesmanCode || '').toLowerCase();
          const firstName = (salesman.fname || salesman.firstName || salesman.name || '').toLowerCase();
          const lastName = (salesman.lname || salesman.lastName || '').toLowerCase();
          const fullName = `${firstName} ${lastName}`.toLowerCase();
          
          return code.includes(searchLower) || 
                 firstName.includes(searchLower) ||
                 lastName.includes(searchLower) ||
                 fullName.includes(searchLower);
        });
      }
      
      return filteredData.map((salesman, index) => ({
        id: salesman.id || salesman.code || `salesman-${index}`,
        code: salesman.code || salesman.fcode || salesman.salesmanCode || '',
        fcode: salesman.fcode || salesman.code || '',
        fname: salesman.fname || salesman.firstName || salesman.name || '',
        lname: salesman.lname || salesman.lastName || '',
        fullName: `${salesman.fname || salesman.firstName || salesman.name || ''} ${salesman.lname || salesman.lastName || ''}`.trim(),
        mobile: salesman.mobile || salesman.phone || '',
      }));
      
    } catch (error) {
      console.error('Error fetching salesmen:', error);
      return [];
    }
  };

  // Fetch customer list for popup
  const fetchCustomerList = async (pageNum = 1, search = '') => {
    try {
      const searchTerm = search || customerSearchTerm || '';
      
      if (allCustomers.length > 0 && searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const filtered = allCustomers.filter(customer => {
          const code = (customer.code || '').toLowerCase();
          const name = (customer.name || '').toLowerCase();
          return code.includes(searchLower) || name.includes(searchLower);
        });
        
        return filtered.map((customer, index) => ({
          id: customer.id || customer.code || `customer-${index}`,
          code: customer.code || '',
          name: customer.name || '',
          custName: customer.name || '',
        }));
      }
      
      const url = API_ENDPOINTS.sales_return.getCustomers + 
                  (searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '');
      const response = await axiosInstance.get(url);
      const data = response?.data || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data.map((customer, index) => ({
        id: customer.id || customer.code || `customer-${index}`,
        code: customer.code || '',
        name: customer.name || '',
        custName: customer.name || '',
      }));
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  };

  // Fetch scrap items list for popup
  const fetchScrapItemList = async (pageNum = 1, search = '') => {
    try {
      const searchTerm = search || scrapSearchTerm || '';
      
      if (allScrapItems.length > 0 && searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const filtered = allScrapItems.filter(scrap => {
          const name = (scrap.scrapName || '').toLowerCase();
          const code = (scrap.scrapCode || '').toLowerCase();
          return name.includes(searchLower) || code.includes(searchLower);
        });
        
        return filtered.map((scrap, index) => ({
          id: scrap.scrapCode || `scrap-${index}`,
          scrapCode: scrap.scrapCode || '',
          scrapName: scrap.scrapName || '',
          scrapProductName: scrap.scrapName || '',
        }));
      }
      
      const url = API_ENDPOINTS.SCRAPCREATION.GET_SCRAP_ITEMS +
                (searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '');
      const response = await axiosInstance.get(url);
      const data = response?.data || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data.map((scrap, index) => ({
        id: scrap.scrapCode || `scrap-${index}`,
        scrapCode: scrap.scrapCode || '',
        scrapName: scrap.scrapName || '',
        scrapProductName: scrap.scrapName || '',
      }));
      
    } catch (error) {
      console.error('Error fetching scrap items:', error);
      return [];
    }
  };
  
  // Calculate amount when qty or sRate changes
  const calculateAmount = (qty, sRate) => {
    const qtyNum = parseFloat(qty || 0);
    const sRateNum = parseFloat(sRate || 0);
    return (qtyNum * sRateNum).toFixed(2);
  };

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillDetails(prev => ({ ...prev, [name]: value }));
  };

  // Handle Enter Key Navigation for form fields
  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleAddItem = () => {
    const scrapName = billDetails.scrapProductInput;
    
    if (!scrapName) {
      showConfirmation({
        title: 'Missing Scrap Product',
        message: 'Please enter scrap product name',
        type: 'warning',
        confirmText: 'OK',
        showIcon: true,
        onConfirm: () => setShowConfirmPopup(false)
      });
      return;
    }
    
    // Find the scrap item in allScrapItems
    const scrapItem = allScrapItems.find(item => 
      item.scrapName === scrapName || item.scrapProductName === scrapName
    );
    
    // Check if scrap product already exists in items
    const existingItemIndex = items.findIndex(item =>
      item.scrapProductName.toLowerCase() === scrapName.toLowerCase() && 
      item.scrapProductName !== ''
    );

    if (existingItemIndex !== -1) {
      // If scrap product exists, increase quantity by 1
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      const newQty = (parseFloat(existingItem.qty) || 0) + 1;
      const newAmount = calculateAmount(newQty, existingItem.sRate);

      updatedItems[existingItemIndex] = {
        ...existingItem,
        qty: newQty.toString(),
        amount: newAmount
      };

      setItems(updatedItems);
    } else {
      // Add new item with the scrap product
      const newItem = {
        id: items.length + 1,
        sNo: items.length + 1,
        scrapProductName: scrapName,
        scrapCode: scrapItem ? scrapItem.scrapCode : '',
        itemName: '', // Empty - user will select item from popup
        itemCode: '', // Empty - user will select item from popup
        uom: 'KG',
        tax: '5',
        sRate: '50',
        qty: '1',
        amount: '50.00'
      };

      setItems([...items, newItem]);
    }

    // Clear scrap product input and focus
    setBillDetails(prev => ({ ...prev, scrapProductInput: '' }));
    if (scrapProductRef.current) scrapProductRef.current.focus();
  };

  const handleAddRow = () => {
    const newRow = {
      id: items.length + 1,
      sNo: items.length + 1,
      scrapProductName: '',
      scrapCode: '',
      itemName: '',
      itemCode: '',
      uom: '',
      tax: '',
      sRate: '',
      qty: '',
      amount: '0.00'
    };
    setItems([...items, newRow]);
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Recalculate amount if qty or sRate changes
        if (field === 'qty' || field === 'sRate') {
          const qty = field === 'qty' ? value : updatedItem.qty;
          const sRate = field === 'sRate' ? value : updatedItem.sRate;
          updatedItem.amount = calculateAmount(qty, sRate);
        }

        return updatedItem;
      }
      return item;
    }));
  };

  const handleTableKeyDown = (e, currentRowIndex, currentField) => {
  // Handle / key for item search popup
  if (e.key === '/') {
    e.preventDefault();
    setSelectedRowForItem(currentRowIndex);
    setItemSearchTerm('');
    setClosedItemByUser(false);
    setShowItemPopup(true);
    return;
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation(); // Prevent form submission or other Enter handlers

    // Fields in the visual order
    const fields = [
      'scrapProductName', 'itemName', 'uom', 'tax', 'sRate', 'qty'
    ];

    const currentFieldIndex = fields.indexOf(currentField);

    // Check if itemName is empty in the current row
    const currentRow = items[currentRowIndex];
    const isItemNameEmpty = !currentRow.itemName || currentRow.itemName.trim() === '';

    // If Enter is pressed in the qty field
    if (currentField === 'qty') {
      // Check if itemName is empty in the current row
      if (isItemNameEmpty) {
        // Show confirmation popup asking to save
        showConfirmation({
          title: 'Item Name Missing',
          message: 'Item Name cannot be empty. Would you like to save the form anyway?\n\nNote: Items without Item Name will not be saved.',
          type: 'warning',
          confirmText: 'Save Anyway',
          cancelText: 'Cancel',
          onConfirm: () => {
            // User chose to save anyway
            setShowConfirmPopup(false);
            // Trigger the actual save function
            handleSave();
          },
          onCancel: () => {
            setShowConfirmPopup(false);
            // Focus back to itemName field so user can fix it
            setTimeout(() => {
              const itemNameInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="itemName"]`);
              if (itemNameInput) {
                itemNameInput.focus();
              }
            }, 100);
          }
        });
        return; // Don't proceed further
      }
    }

    // Always move to next field if available
    if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
      const nextField = fields[currentFieldIndex + 1];
      const nextInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="${nextField}"], select[data-row="${currentRowIndex}"][data-field="${nextField}"]`);
      if (nextInput) {
        nextInput.focus();
        return;
      }
    }

    // If Enter is pressed in the qty field and itemName is not empty
    if (currentField === 'qty' && !isItemNameEmpty) {
      // Only add new row if itemName is not empty
      handleAddRow();
      setTimeout(() => {
        const newRowInput = document.querySelector(`input[data-row="${items.length}"][data-field="scrapProductName"]`);
        if (newRowInput) newRowInput.focus();
      }, 60);
    }
    
    return;
  }
};

  const handleDeleteRow = (id) => {
  const itemToDelete = items.find(item => item.id === id);
  const itemName = itemToDelete?.scrapProductName || 'this scrap product';
  
  // Check if this is the first row (by sNo)
  const rowIndex = items.findIndex(item => item.id === id);
  const isFirstRow = rowIndex === 0;
  
  if (isFirstRow) {
    showConfirmation({
      title: 'Clear First Row',
      message: 'The first row cannot be deleted, but you can clear its contents. Would you like to clear this row instead?',
      type: 'info',
      confirmText: 'Clear',
      onConfirm: () => {
        // Clear the first row instead of deleting it
        const updatedItems = [...items];
        updatedItems[0] = {
          id: 1,
          sNo: 1,
          scrapProductName: '',
          scrapCode: '',
          itemName: '',
          itemCode: '',
          uom: '',
          tax: '',
          sRate: '',
          qty: '',
          amount: '0.00'
        };
        setItems(updatedItems);
        setShowConfirmPopup(false);
      },
      onCancel: () => {
        setShowConfirmPopup(false);
      }
    });
    return;
  }

  showConfirmation({
    title: 'Delete Item',
    message: `Are you sure you want to delete "${itemName}"?`,
    type: 'danger',
    confirmText: 'Delete',
    onConfirm: () => {
      if (items.length > 1) {
        const filteredItems = items.filter(item => item.id !== id);
        const updatedItems = filteredItems.map((item, index) => ({
          ...item,
          sNo: index + 1
        }));
        setItems(updatedItems);
      }
      setShowConfirmPopup(false);
    }
  });
};

  // Separate clear function for reuse
  const clearFormData = () => {
    setBillDetails({
      billNo: '',
      billDate: new Date().toISOString().substring(0, 10),
      mobileNo: '',
      empName: '',
      salesman: '',
      salesmanCode: '', 
      custName: '',
      custCode: '', 
      scrapProductInput: '',
      scrapCode: '',
    });

    setItems([
      {
        id: 1,
        sNo: 1,
        scrapProductName: '',
        scrapCode: '',
        itemName: '',
        itemCode: '',
        uom: '',
        tax: '',
        sRate: '',
        qty: '',
        amount: '0.00'
      }
    ]);
    
    fetchNextBillNo();
  };

  const handleClear = () => {
    if (isEditMode) {
      showConfirmation({
        title: 'Clear Data',
        message: 'Are you sure you want to clear all data? This will exit edit mode and discard changes.',
        type: 'warning',
        confirmText: 'Clear',
        onConfirm: () => {
          revertToOriginalData();
          setShowConfirmPopup(false);
          clearFormData();
        },
        onCancel: () => {
          // Stay in edit mode, keep changes
          setShowConfirmPopup(false);
        }
      });
    } else {
      clearFormData();
    }
  };

  // Separate save function for actual API call
  const performSave = async () => {
    try {
      const isCreate = !isEditMode;
      
      // Prepare items array for API
      const validItems = items.filter(item => 
        item.itemName && item.itemName.trim() !== '' && 
        item.itemCode && item.itemCode.trim() !== ''
      );
      
      const itemsForAPI = validItems.map(item => ({
        itemCode: item.itemCode || '',
        itemName: item.itemName || '',
        qty: parseFloat(item.qty) || 0,
        rate: parseFloat(item.sRate) || 0,
        tax: parseFloat(item.tax) || 0,
        amount: parseFloat(item.amount) || 0,
        uom: item.uom || 'KG',
        barcode: ''
      }));
      
      // Get scrap details
      const firstScrapItem = items.find(item => item.scrapProductName && item.scrapProductName.trim() !== '');
      
      // Prepare payload
      const payload = {
        compCode: userData?.companyCode || '001',
        usercode: userData?.userCode || '001',
        voucherNo: billDetails.billNo,
        voucherDate: billDetails.billDate,
        salesmanName: billDetails.salesman,
        salesmancode: billDetails.salesmanCode || '',
        customercode: billDetails.custCode || '',
        customerName: billDetails.custName,
        netAmount: totalAmount,
        scrpName: firstScrapItem?.scrapProductName || billDetails.scrapProductInput || '',
        scrpCode: firstScrapItem?.scrapCode || billDetails.scrapCode || '',
        empName: billDetails.empName,
        empCode: billDetails.empCode || '',
        mobileNo: billDetails.mobileNo,
        items: itemsForAPI
      };

      // Make API call
      const response = await axiosInstance.post(
        API_ENDPOINTS.Scrap_Procurement.SAVE_SCRAP_PROCUREMENT(isCreate),
        payload
      );

      if (response.status === 200 || response.status === 201) {
        const mode = isCreate ? 'created' : 'updated';
        showConfirmation({
          title: 'Success',
          message: `Scrap Procurement data ${mode} successfully!\n\nVoucher No: ${billDetails.billNo}\nTotal Quantity: ${totalQty.toFixed(2)}\nTotal Amount: ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          type: 'success',
          confirmText: 'OK',
          showIcon: true,
          onConfirm: () => {
            setShowConfirmPopup(false);
            // Clear original data after successful save
            setOriginalBillDetails(null);
            setOriginalItems(null);
            clearFormData();
            setIsEditMode(false);
            fetchNextBillNo();
          }
        });
      } else {
        showConfirmation({
          title: 'Error',
          message: 'Failed to save data. Please try again.',
          type: 'danger',
          confirmText: 'OK',
          showIcon: true,
          onConfirm: () => setShowConfirmPopup(false)
        });
      }
    } catch (error) {
      console.error('Error saving scrap procurement:', error);
      showConfirmation({
        title: 'Error',
        message: `Error saving data: ${error.response?.data?.message || error.message}`,
        type: 'danger',
        confirmText: 'OK',
        showIcon: true,
        onConfirm: () => setShowConfirmPopup(false)
      });
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!billDetails.salesman || !billDetails.custName) {
        showConfirmation({
          title: 'Missing Information',
          message: 'Please fill in required fields: Salesman and Customer',
          type: 'warning',
          confirmText: 'OK',
          showIcon: true,
          onConfirm: () => setShowConfirmPopup(false)
        });
        return;
      }
      
      // Check if we have items with item names
      const validItems = items.filter(item => 
        item.itemName && item.itemName.trim() !== '' && 
        item.itemCode && item.itemCode.trim() !== ''
      );
      
      if (validItems.length === 0) {
        showConfirmation({
          title: 'No Items',
          message: 'Please add at least one item with item name selected from the popup',
          type: 'warning',
          confirmText: 'OK',
          showIcon: true,
          onConfirm: () => setShowConfirmPopup(false)
        });
        return;
      }
      
      // Show save confirmation
      showConfirmation({
        title: 'Save Confirmation',
        message: `Are you sure you want to ${isEditMode ? 'update' : 'save'} this voucher?\n\nVoucher No: ${billDetails.billNo}\nTotal Quantity: ${totalQty.toFixed(2)}\nTotal Amount: ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        type: isEditMode ? 'info' : 'success',
        confirmText: isEditMode ? 'Update' : 'Save',
        onConfirm: async () => {
          await performSave();
          setShowConfirmPopup(false);
          // Refresh the page after a short delay
              setTimeout(() => {
                window.location.reload();
              }, 300);
            // },
            // showLoading: false
          // });
        },
        onCancel: () => {
          // If in edit mode and cancel is clicked, revert to original data
          if (isEditMode) {
            showConfirmation({
              title: 'Discard Changes',
              message: 'Are you sure you want to discard all changes and revert to original data?',
              type: 'warning',
              confirmText: 'Discard',
              onConfirm: () => {
                revertToOriginalData();
                setShowConfirmPopup(false);
              },
              onCancel: () => {
                // Keep editing, just close the popup
                setShowConfirmPopup(false);
              }
            });
          } else {
            // For new entries, just close the popup
            setShowConfirmPopup(false);
          }
        }
      });
    } catch (error) {
      console.error('Error in handleSave:', error);
    }
  };

  const handlePrint = () => {
    showConfirmation({
      title: 'Print Confirmation',
      message: 'Print functionality is not yet implemented. Would you like to continue?',
      type: 'info',
      confirmText: 'Continue',
      onConfirm: () => {
        setShowConfirmPopup(false);
        console.log('Print functionality to be implemented');
      }
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
      gap: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      flexWrap: 'wrap',
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
    focusedInput: {
    borderColor: '#1B91DA !important',
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
      display: 'grid',
      gap: '8px',
      marginBottom: 10,
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
      minWidth: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
      whiteSpace: 'nowrap',
      width: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
      maxWidth: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
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
      width: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
      maxWidth: screenSize.isMobile ? '50px' : screenSize.isTablet ? '60px' : '70px',
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
    scrapProductNameContainer: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      textAlign: 'left',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '15px',
      minWidth: screenSize.isMobile ? '150px' : screenSize.isTablet ? '180px' : '220px',
      width: screenSize.isMobile ? '150px' : screenSize.isTablet ? '180px' : '220px',
      maxWidth: screenSize.isMobile ? '150px' : screenSize.isTablet ? '180px' : '220px',
    },
    itemNameContainer: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      textAlign: 'left',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '15px',
      minWidth: screenSize.isMobile ? '120px' : screenSize.isTablet ? '160px' : '200px',
      width: screenSize.isMobile ? '120px' : screenSize.isTablet ? '160px' : '200px',
      maxWidth: screenSize.isMobile ? '120px' : screenSize.isTablet ? '160px' : '200px',
    },
    amountContainer: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      textAlign: 'right',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '15px',
      minWidth: screenSize.isMobile ? '80px' : screenSize.isTablet ? '100px' : '120px',
      width: screenSize.isMobile ? '80px' : screenSize.isTablet ? '100px' : '120px',
      maxWidth: screenSize.isMobile ? '80px' : screenSize.isTablet ? '100px' : '120px',
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
      flexWrap: 'wrap',
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
      width: screenSize.isMobile ? '100%' : 'auto',
      order: screenSize.isMobile ? 1 : 0,
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
    rightColumn: {
      display: 'flex',
      gap: screenSize.isMobile ? '10px' : screenSize.isTablet ? '12px' : '12px',
      flexWrap: 'wrap',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-start',
      width: screenSize.isMobile ? '100%' : 'auto',
      order: screenSize.isMobile ? 2 : 0,
    },
    footerButtons: {
      display: 'flex',
      gap: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '12px',
      flexWrap: 'wrap',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-end',
      width: screenSize.isMobile ? '100%' : 'auto',
      order: screenSize.isMobile ? 3 : 0,
    },
    actionButtonsWrapper: {
      display: 'flex',
      gap: '8px',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-start',
      marginTop: screenSize.isMobile ? '12px' : '0',
    },
  };

  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (screenSize.isMobile) {
      return 'repeat(2, 1fr)';
    } else if (screenSize.isTablet) {
      return 'repeat(3, 1fr)';
    } else {
      return 'repeat(4, 1fr)';
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
          {/* Bill No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill No:</label>
            <input
              type="text"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'billNo' && styles.focusedInput)
              }}
              value={billDetails.billNo}
              name="billNo"
              onChange={handleInputChange}
              ref={billNoRef}
              onKeyDown={(e) => handleKeyDown(e, billDateRef)}
              onFocus={() => setFocusedField('billNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Bill No"
            />
          </div>

          {/* Bill Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill Date:</label>
            <input
              type="date"
              style={{
                ...styles.inlineInput,
                padding: screenSize.isMobile ? '6px 8px' : '8px 10px',
                ...(focusedField === 'billDate' && styles.focusedInput)
              }}
              value={billDetails.billDate}
              name="billDate"
              onChange={handleInputChange}
              ref={billDateRef}
              onKeyDown={(e) => handleKeyDown(e, mobileRef)}
              onFocus={() => setFocusedField('billDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Mobile No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Mobile No:</label>
            <input
              type="text"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'mobileNo' && styles.focusedInput)
              }}
              value={billDetails.mobileNo}
              name="mobileNo"
              onChange={handleInputChange}
              ref={mobileRef}
              onKeyDown={(e) => handleKeyDown(e, empNameRef)}
              onFocus={() => setFocusedField('mobileNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Mobile No"
            />
          </div>

          {/* EMP Name */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>EMP Name:</label>
            <input
              type="text"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'empName' && styles.focusedInput)
              }}
              value={billDetails.empName}
              name="empName"
              onChange={handleInputChange}
              ref={empNameRef}
              onKeyDown={(e) => handleKeyDown(e, salesmanRef)}
              onFocus={() => setFocusedField('empName')}
              onBlur={() => setFocusedField('')}
              placeholder="EMP Name"
            />
          </div>
        </div>

        {/* ROW 2 */}
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
        }}>
          {/* Salesman */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Salesman:</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                style={{
                  ...styles.inlineInput,
                  flex: 1,
                  paddingRight: '40px',
                  ...(focusedField === 'salesman' && styles.focusedInput)
                }}
                value={billDetails.salesman}
                name="salesman"
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange(e);
                  setSalesmanSearchTerm(value);
                  
                  if (value.length > 0) {
                    setClosedByUser(false);
                    setActiveSearchField('salesman');
                    setShowCustomerPopup(false);
                    setShowScrapPopup(false);
                    setTimeout(() => setShowSalesmanPopup(true), 300);
                  }
                }}
                ref={salesmanRef}
                onKeyDown={(e) => {
                  if (e.key === '/' || e.key === 'F2') {
                    e.preventDefault();
                    setSalesmanSearchTerm(billDetails.salesman);
                    setShowSalesmanPopup(true);
                  } else if (e.key === 'Enter') {
                    handleKeyDown(e, custNameRef);
                  }
                }}
                onFocus={() => {
                  setFocusedField('salesman');
                  setActiveSearchField('salesman');
                  
                  if (billDetails.salesman.length > 0 && !showSalesmanPopup && !closedByUser) {
                    setSalesmanSearchTerm(billDetails.salesman);
                    setShowCustomerPopup(false);
                    setShowScrapPopup(false);
                    setTimeout(() => setShowSalesmanPopup(true), 100);
                  }
                }}
                onBlur={() => setFocusedField('')}
                placeholder="Type name or press / to search"
              />
              <button
                type="button"
                aria-label="Search salesman"
                title="Search salesman"
                onClick={() => {
                  setSalesmanSearchTerm(billDetails.salesman);
                  setActiveSearchField('salesman');
                  setShowSalesmanPopup(true);
                }}
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
          </div>

          {/* Customer Name */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Customer:</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                style={{
                  ...styles.inlineInput,
                  flex: 1,
                  paddingRight: '40px',
                  ...(focusedField === 'custName' && styles.focusedInput)
                }}
                value={billDetails.custName}
                name="custName"
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange(e);
                  setCustomerSearchTerm(value);
                  
                  if (value.length > 0) {
                    setClosedByUser(false);
                    setActiveSearchField('customer');
                    setShowSalesmanPopup(false);
                    setShowScrapPopup(false);
                    setTimeout(() => setShowCustomerPopup(true), 300);
                  }
                }}
                ref={custNameRef}
                onKeyDown={(e) => {
                  if (e.key === '/' || e.key === 'F2') {
                    e.preventDefault();
                    setCustomerSearchTerm(billDetails.custName);
                    setShowCustomerPopup(true);
                  } else if (e.key === 'Enter') {
                    handleKeyDown(e, scrapProductRef);
                  }
                }}
                onFocus={() => {
                  setFocusedField('custName');
                  setActiveSearchField('customer');
                  
                  if (billDetails.custName.length > 0 && !showCustomerPopup && !closedByUser) {
                    setCustomerSearchTerm(billDetails.custName);
                    setShowSalesmanPopup(false);
                    setShowScrapPopup(false);
                    setTimeout(() => setShowCustomerPopup(true), 100);
                  }
                }}
                onBlur={() => setFocusedField('')}
                placeholder="Type customer name or press / to search"
              />
              <button
                type="button"
                aria-label="Search customer"
                title="Search customer"
                onClick={() => {
                  setCustomerSearchTerm(billDetails.custName);
                  setActiveSearchField('customer');
                  setShowCustomerPopup(true);
                }}
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
          </div>

          {/* Scrap Product Input */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Scrap Product:</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                style={{
                  ...styles.inlineInput,
                  flex: 1,
                  ...(focusedField === 'scrapProductInput' && styles.focusedInput)
                }}
                value={billDetails.scrapProductInput}
                name="scrapProductInput"
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange(e);
                  setScrapSearchTerm(value);
                  
                  if (value.length > 0) {
                    setClosedByUser(false);
                    setActiveSearchField('scrap');
                    setShowSalesmanPopup(false);
                    setShowCustomerPopup(false);
                    setTimeout(() => setShowScrapPopup(true), 300);
                  }
                }}
                ref={scrapProductRef}
                onKeyDown={(e) => {
                  if (e.key === '/' || e.key === 'F2') {
                    e.preventDefault();
                    setScrapSearchTerm(billDetails.scrapProductInput);
                    setShowScrapPopup(true);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    // Move focus to the first barcode field in the table
                    const firstBarcodeInput = document.querySelector('input[data-row="0"][data-field="scrapProductName"]');
                    if (firstBarcodeInput) {
                      firstBarcodeInput.focus();
                    }
                  }
                }}
                onFocus={() => {
                  setFocusedField('scrapProductInput');
                  setActiveSearchField('scrap');
                  
                  if (billDetails.scrapProductInput.length > 0 && !showScrapPopup && !closedByUser) {
                    setScrapSearchTerm(billDetails.scrapProductInput);
                    setShowSalesmanPopup(false);
                    setShowCustomerPopup(false);
                    setTimeout(() => setShowScrapPopup(true), 100);
                  }
                }}
                onBlur={() => setFocusedField('')}
                placeholder="Type scrap product or press / to search"
              />
              <button
                type="button"
                aria-label="Search scrap product"
                title="Search scrap product"
                onClick={() => {
                  setScrapSearchTerm(billDetails.scrapProductInput);
                  setActiveSearchField('scrap');
                  setShowScrapPopup(true);
                }}
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
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div style={styles.tableSection}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>S.No</th>
                <th style={{ ...styles.th}}>Barcode</th>
                <th style={{ ...styles.th, ...styles.itemNameContainer, textAlign: 'left' }}>Item Name</th>
                <th style={styles.th}>UOM</th>
                <th style={styles.th}>TAX (%)</th>
                <th style={styles.th}>SRate</th>
                <th style={styles.th}>Qty</th>
                <th style={{ ...styles.th, ...styles.amountContainer, textAlign: 'right' }}>Amount</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                  <td style={styles.td}>{item.sNo}</td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.scrapProductName}
                      data-row={index}
                      data-field="scrapProductName"
                      onChange={(e) => handleItemChange(item.id, 'scrapProductName', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'scrapProductName')}
                      placeholder="Barcode"
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.itemNameContainer }}>
                  <div style={{ 
                    position: 'relative', 
                    display: 'flex', 
                    alignItems: 'center',
                    height: '100%'
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
                        height: '100%'
                      }}
                      value={item.itemName}
                      placeholder="Press / to search items"
                      data-row={index}
                      data-field="itemName"
                      onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'itemName')}
                    />
                    <button
                      type="button"
                      aria-label="Search item details"
                      title="Search item details"
                      onClick={() => {
                        setSelectedRowForItem(index);
                        setItemSearchTerm('');
                        setClosedItemByUser(false);
                        setShowItemPopup(true);
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
                    <input
                      style={styles.editableInput}
                      value={item.uom}
                      data-row={index}
                      data-field="uom"
                      onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'uom')}
                      placeholder="UOM"
                      readOnly
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.tax}
                      data-row={index}
                      data-field="tax"
                      onChange={(e) => handleItemChange(item.id, 'tax', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'tax')}
                      step="0.01"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.sRate}
                      data-row={index}
                      data-field="sRate"
                      onChange={(e) => handleItemChange(item.id, 'sRate', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'sRate')}
                      step="0.01"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={{ ...styles.editableInput, fontWeight: 'bold' }}
                      value={item.qty}
                      data-row={index}
                      data-field="qty"
                      onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                      step="0.01"
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.amountContainer }}>
                    <input
                      style={{ ...styles.editableInput, textAlign: 'right', fontWeight: 'bold', color: '#1565c0', backgroundColor: '#f0f7ff' }}
                      value={parseFloat(item.amount || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                      readOnly
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
        </div>
      </div>

      {/* Salesman Popup */}
      <PopupListSelector
        open={showSalesmanPopup}
        onClose={() => { 
          setShowSalesmanPopup(false);
          setClosedByUser(true);
          setSalesmanSearchTerm('');
          setActiveSearchField(null);
        }}
        title="Select Salesman"
        fetchItems={fetchSalesManList}
        displayFieldKeys={['code','fullName']}
        headerNames={['Code','Salesman Name']}
        searchFields={['code','fname']}
        columnWidths={['30%','70%']}
        searchPlaceholder="Search salesman by name..."
        initialSearchText={salesmanSearchTerm}
        onSelect={(selectedSalesman) => {
          const fullName = selectedSalesman.fullName || 
                          `${selectedSalesman.fname || ''} ${selectedSalesman.lname || ''}`.trim() ||
                          selectedSalesman.code || '';
          
          setBillDetails(prev => ({
            ...prev,
            salesman: fullName,
            salesmanCode: selectedSalesman.code || selectedSalesman.salesmanCode || '',
          }));
          setShowSalesmanPopup(false);
          setClosedByUser(false);
          setSalesmanSearchTerm('');
          setActiveSearchField(null);
          
          if (custNameRef.current) {
            custNameRef.current.focus();
          }
        }}
      />
      
      {/* Customer Popup */}
      <PopupListSelector
        open={showCustomerPopup}
        onClose={() => {
          setShowCustomerPopup(false);
          setClosedByUser(true);
          setCustomerSearchTerm('');
          setActiveSearchField(null);
        }}
        title="Select Customer"
        fetchItems={fetchCustomerList}
        displayFieldKeys={['code', 'name']}
        headerNames={['Code', 'Customer Name']}
        searchFields={['name', 'code']}
        columnWidths={['40%', '60%']}
        searchPlaceholder="Search customer by name or code..."
        initialSearchText={customerSearchTerm}
        onSelect={(selectedCustomer) => {
          setBillDetails(prev => ({
            ...prev,
            custName: selectedCustomer.name || '',
            custCode: selectedCustomer.code || '',
          }));
          setShowCustomerPopup(false);
          setClosedByUser(false);
          setCustomerSearchTerm('');
          setActiveSearchField(null);
          
          if (scrapProductRef.current) {
            scrapProductRef.current.focus();
          }
        }}
      />

      {/* Scrap Product Popup */}
      <PopupListSelector
        open={showScrapPopup}
        onClose={() => {
          setShowScrapPopup(false);
          setClosedByUser(true);
          setScrapSearchTerm('');
          setActiveSearchField(null);
        }}
        title="Select Scrap Product"
        fetchItems={fetchScrapItemList}
        displayFieldKeys={['scrapCode', 'scrapName']}
        headerNames={['Code', 'Scrap Name']}
        searchFields={['scrapName', 'scrapCode']}
        columnWidths={['30%', '70%']}
        searchPlaceholder="Search scrap by name or code..."
        initialSearchText={scrapSearchTerm}
        onSelect={(selectedScrap) => {
          const scrapName = selectedScrap.scrapName || selectedScrap.scrapProductName || '';
          
          setBillDetails(prev => ({
            ...prev,
            scrapProductInput: scrapName,
            scrapCode: selectedScrap.scrapCode || selectedScrap.code || '',
          }));
          setShowScrapPopup(false);
          setClosedByUser(false);
          setScrapSearchTerm('');
          setActiveSearchField(null);
          
          setTimeout(() => {
            if (scrapProductRef.current) {
              scrapProductRef.current.focus();
            }
          }, 100);
        }}
      />

      {/* Item Popup */}
      <PopupListSelector
        open={showItemPopup}
        onClose={() => {
          setShowItemPopup(false);
          setClosedItemByUser(true);
          setItemSearchTerm('');
          setSelectedRowForItem(null);
        }}
        title="Select Item"
        fetchItems={fetchItemList}
        displayFieldKeys={['itemCode', 'itemName', 'barcode', 'uom']}
        headerNames={['Item Code', 'Item Name', 'Barcode', 'UOM']}
        searchFields={['itemName', 'itemCode']}
        columnWidths={['25%', '35%', '25%', '15%']}
        searchPlaceholder="Search item by name or code..."
        initialSearchText={itemSearchTerm}
        onSelect={(selectedItem) => {
          if (selectedRowForItem !== null && items[selectedRowForItem]) {
            const updatedItems = [...items];
            const itemId = updatedItems[selectedRowForItem].id;
            
            const itemIndex = updatedItems.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
              updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                itemName: selectedItem.itemName || '',
                itemCode: selectedItem.itemCode || '',
                scrapProductName: selectedItem.barcode || '',
                uom: selectedItem.uom || 'KG',
              };
              
              setItems(updatedItems);
            }
          }
          
          setShowItemPopup(false);
          setClosedItemByUser(false);
          setItemSearchTerm('');
          setSelectedRowForItem(null);
          
          setTimeout(() => {
            const itemInput = document.querySelector(`input[data-row="${selectedRowForItem}"][data-field="itemName"]`);
            if (itemInput) {
              itemInput.focus();
            }
          }, 100);
        }}
      />

      {/* NEW: Voucher List Popup for Edit/Delete */}
      <PopupListSelector
        open={showVoucherListPopup}
        onClose={() => {
          setShowVoucherListPopup(false);
          setVoucherSearchTerm('');
          setPopupMode('');
        }}
        title={popupMode === 'edit' ? 'Select Voucher to Edit' : 'Select Voucher to Delete'}
        fetchItems={fetchVoucherList}
        displayFieldKeys={['voucherNo']}
        headerNames={['Voucher No']}
        searchFields={['voucherNo']}
        columnWidths={['100%']}
        searchPlaceholder="Search by voucher number..."
        initialSearchText={voucherSearchTerm}
        onSelect={(selectedVoucher) => {
          if (popupMode === 'edit') {
            loadVoucherForEditing(selectedVoucher.voucherNo);
          } else if (popupMode === 'delete') {
            deleteVoucher(selectedVoucher.voucherNo);
          }
          
          setShowVoucherListPopup(false);
          setVoucherSearchTerm('');
          setPopupMode('');
        }}
      />

      {/* --- FOOTER SECTION --- */}
      <div style={styles.footerSection}>
        <div style={styles.rightColumn}>
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
            <AddButton buttonType="add" />
            <EditButton buttonType="edit" />
            <DeleteButton buttonType="delete" />
          </ActionButtons>
        </div>
        <div style={styles.totalsContainer}>
          <div style={styles.totalItem}>
            <span style={styles.totalLabel}>Total Quantity</span>
            <span style={styles.totalValue}>{totalQty.toFixed(2)}</span>
          </div>
          <div style={styles.totalItem}>
            <span style={styles.totalLabel}>Total Amount</span>
            <span style={styles.totalValue}>
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
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

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        onConfirm={confirmConfig.onConfirm}
        onCancel={confirmConfig.onCancel}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        showIcon={confirmConfig.showIcon}
        hideCancelButton={confirmConfig.hideCancelButton}
      />
    </div>
  );
};

export default Scrapprocurement;