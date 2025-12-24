import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import PopupListSelector from '../../components/Listpopup/PopupListSelector.jsx';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_ENDPOINTS } from '../../api/endpoints';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSION_CODES } from "../../constants/permissions";

const Icon = {
  Search: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  ),
}

const Scrapprocurement = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.SCRAP_PROCUREMENT),
    edit: hasModifyPermission(PERMISSION_CODES.SCRAP_PROCUREMENT),
    delete: hasDeletePermission(PERMISSION_CODES.SCRAP_PROCUREMENT)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('add');
  const [pageSize, setPageSize] = useState(20);
  const fCompCode = "001";

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
  const ignoreNextEnterRef = useRef(false);
  const [focusedUomField, setFocusedUomField] = useState(null); 

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

  // NEW STATES FOR VOUCHER POPUPS
  const [showVoucherListPopup, setShowVoucherListPopup] = useState(false);
  const [voucherSearchTerm, setVoucherSearchTerm] = useState('');
  const [popupMode, setPopupMode] = useState('');
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [companyQuery, setCompanyQuery] = useState("");

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

  // Track current focus for arrow navigation
  const [currentFocus, setCurrentFocus] = useState({
    section: 'header',
    rowIndex: 0,
    fieldIndex: 0
  });

  // Define header fields in order (for arrow navigation)
  const headerFields = useMemo(() => [
    { name: 'billNo', ref: billNoRef, label: 'Bill No' },
    { name: 'billDate', ref: billDateRef, label: 'Bill Date' },
    { name: 'custName', ref: custNameRef, label: 'Customer' },
    { name: 'mobileNo', ref: mobileRef, label: 'Mobile No' },
    { name: 'salesman', ref: salesmanRef, label: 'Salesman' },
  ], []);

  // Define table fields in order (for arrow navigation)
  const tableFields = useMemo(() => ['scrapProductName', 'itemName', 'uom', 'tax', 'sRate', 'qty'], []);

  // Fetch next bill number
  const fetchNextBillNo = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.Scrap_Procurement.GET_VOUCHER_NO);
      
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
    fetchVoucherList();
  }, [userData]);

  useEffect(() => {
    if (billDateRef.current && activeTopAction !== "delete") {
      billDateRef.current.focus();
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
        const url = API_ENDPOINTS.SCRAPCREATION.GET_SCRAP_ITEMS;
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

  // Global arrow key navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Only handle arrow keys when no popup is open
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const isPopupOpen = showSalesmanPopup || showCustomerPopup || showScrapPopup || 
                           showItemPopup || showVoucherListPopup || showConfirmPopup;
        
        if (!isPopupOpen) {
          const activeElement = document.activeElement;
          const isInput = activeElement.tagName === 'INPUT' || 
                         activeElement.tagName === 'TEXTAREA' || 
                         activeElement.tagName === 'SELECT' ||
                         activeElement.contentEditable === 'true';
          
          // If no input is focused, focus on first field
          if (!isInput && activeElement.tagName !== 'DIV') {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
              e.preventDefault();
              const firstField = headerFields[0];
              if (firstField.ref && firstField.ref.current) {
                firstField.ref.current.focus();
                setFocusedField(firstField.name);
                setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 0 });
              }
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [showSalesmanPopup, showCustomerPopup, showScrapPopup, showItemPopup, showVoucherListPopup, showConfirmPopup]);

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

  const onCompanyChange = (e) => {
    const v = e.target.value || "";
    // update local form value
    setItems(s => ({ ...s, itemName: v }));
    // set query used by the popup
    setCompanyQuery(v);
    // open selector so user sees filtered results while typing
    setShowItemPopup(true);
  };

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

  // Arrow key navigation handlers
  const handleHeaderArrowNavigation = (e, currentFieldName) => {
    const currentIndex = headerFields.findIndex(field => field.name === currentFieldName);
    
    if (currentIndex === -1) return;

    switch (e.key) {
      case 'ArrowRight':
        // Move to next header field
        if (currentIndex < headerFields.length - 1) {
          const nextField = headerFields[currentIndex + 1];
          if (nextField.ref && nextField.ref.current) {
            nextField.ref.current.focus();
            setFocusedField(nextField.name);
            setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: currentIndex + 1 });
          }
        } else {
          // Move to first table row, first field
          const firstTableInput = document.querySelector('input[data-row="0"][data-field="scrapProductName"]');
          if (firstTableInput) {
            firstTableInput.focus();
            setCurrentFocus({ section: 'table', rowIndex: 0, fieldIndex: 0 });
          }
        }
        break;
      
      case 'ArrowLeft':
        // Move to previous header field
        if (currentIndex > 0) {
          const prevField = headerFields[currentIndex - 1];
          if (prevField.ref && prevField.ref.current) {
            prevField.ref.current.focus();
            setFocusedField(prevField.name);
            setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: currentIndex - 1 });
          }
        }
        break;
      
      case 'ArrowDown':
        // Move to same field in first table row
        const tableFieldIndex = Math.min(currentIndex, tableFields.length - 1);
        const tableInput = document.querySelector(`input[data-row="0"][data-field="${tableFields[tableFieldIndex]}"]`);
        if (tableInput) {
          tableInput.focus();
          setCurrentFocus({ section: 'table', rowIndex: 0, fieldIndex: tableFieldIndex });
        }
        break;
      
      case 'ArrowUp':
        // Already at top, do nothing
        break;
      
      default:
        break;
    }
  };

  const handleTableArrowNavigation = (e, currentRowIndex, currentFieldName) => {
    const currentFieldIndex = tableFields.indexOf(currentFieldName);
    if (currentFieldIndex === -1) return;

    switch (e.key) {
      case 'ArrowRight':
        // Move to next field in same row
        if (currentFieldIndex < tableFields.length - 1) {
          const nextField = tableFields[currentFieldIndex + 1];
          let nextInput;
          
          if (nextField === 'uom') {
            // UOM field is a div, not an input
            nextInput = document.querySelector(`div[data-row="${currentRowIndex}"][data-field="uom"]`);
          } else {
            nextInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="${nextField}"]`);
          }
          
          if (nextInput) {
            nextInput.focus();
            setCurrentFocus({ 
              section: 'table', 
              rowIndex: currentRowIndex, 
              fieldIndex: currentFieldIndex + 1 
            });
          }
        }else if (currentRowIndex < items.length - 1) {
          // Move to next row, first field
          const nextRowIndex = currentRowIndex + 1;
          const firstField = tableFields[0];
          let nextRowInput;
          
          if (firstField === 'uom') {
            nextRowInput = document.querySelector(`div[data-row="${nextRowIndex}"][data-field="uom"]`);
          } else {
            nextRowInput = document.querySelector(`input[data-row="${nextRowIndex}"][data-field="${firstField}"]`);
          }
          
          if (nextRowInput) {
            nextRowInput.focus();
            setCurrentFocus({ 
              section: 'table', 
              rowIndex: nextRowIndex, 
              fieldIndex: 0 
            });
          }
        }
        break;
      
      case 'ArrowLeft':
        // Move to previous field in same row
        if (currentFieldIndex > 0) {
          const prevField = tableFields[currentFieldIndex - 1];
          let prevInput;
          
          if (prevField === 'uom') {
            prevInput = document.querySelector(`div[data-row="${currentRowIndex}"][data-field="uom"]`);
          } else {
            prevInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="${prevField}"]`);
          }
          
          if (prevInput) {
            prevInput.focus();
            setCurrentFocus({ 
              section: 'table', 
              rowIndex: currentRowIndex, 
              fieldIndex: currentFieldIndex - 1 
            });
          }
        } else if (currentRowIndex > 0) {
          // Move to last field in previous row
          const prevRowIndex = currentRowIndex - 1;
          const lastField = tableFields[tableFields.length - 1];
          let prevRowInput;
          
          if (lastField === 'uom') {
            prevRowInput = document.querySelector(`div[data-row="${prevRowIndex}"][data-field="uom"]`);
          } else {
            prevRowInput = document.querySelector(`input[data-row="${prevRowIndex}"][data-field="${lastField}"]`);
          }
          
          if (prevRowInput) {
            prevRowInput.focus();
            setCurrentFocus({ 
              section: 'table', 
              rowIndex: prevRowIndex, 
              fieldIndex: tableFields.length - 1 
            });
          }
        } else {
          // Move to last header field
          const lastHeaderField = headerFields[headerFields.length - 1];
          if (lastHeaderField.ref && lastHeaderField.ref.current) {
            lastHeaderField.ref.current.focus();
            setFocusedField(lastHeaderField.name);
            setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: headerFields.length - 1 });
          }
        }
        break;
      
      case 'ArrowDown':
        // Move to same field in next row
        if (currentRowIndex < items.length - 1) {
          const nextRowIndex = currentRowIndex + 1;
          let nextRowInput;
          
          if (currentFieldName === 'uom') {
            nextRowInput = document.querySelector(`div[data-row="${nextRowIndex}"][data-field="uom"]`);
          } else {
            nextRowInput = document.querySelector(`input[data-row="${nextRowIndex}"][data-field="${currentFieldName}"]`);
          }
          
          if (nextRowInput) {
            nextRowInput.focus();
            setCurrentFocus({ 
              section: 'table', 
              rowIndex: nextRowIndex, 
              fieldIndex: currentFieldIndex 
            });
          }
        }
        break;
      
      case 'ArrowUp':
        // Move to same field in previous row
        if (currentRowIndex > 0) {
          const prevRowIndex = currentRowIndex - 1;
          let prevRowInput;
          
          if (currentFieldName === 'uom') {
            prevRowInput = document.querySelector(`div[data-row="${prevRowIndex}"][data-field="uom"]`);
          } else {
            prevRowInput = document.querySelector(`input[data-row="${prevRowIndex}"][data-field="${currentFieldName}"]`);
          }
          
          if (prevRowInput) {
            prevRowInput.focus();
            setCurrentFocus({ 
              section: 'table', 
              rowIndex: prevRowIndex, 
              fieldIndex: currentFieldIndex 
            });
          }
        } else {
          // Move to corresponding header field
          const headerFieldIndex = Math.min(currentFieldIndex, headerFields.length - 1);
          const headerField = headerFields[headerFieldIndex];
          if (headerField.ref && headerField.ref.current) {
            headerField.ref.current.focus();
            setFocusedField(headerField.name);
            setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: headerFieldIndex });
          }
        }
        break;
      
      default:
        break;
    }
  };

  // NEW: Fetch voucher list for popup
  const fetchVoucherList = async (pageNum = 1, search = '') => {
    try {
      setIsLoadingVouchers(true);
      const searchTerm = search || voucherSearchTerm || '';
      
      const url = API_ENDPOINTS.Scrap_Procurement.GET_BILL_LIST(fCompCode, pageNum, pageSize);
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
        
        // Block Enter key after edit load
        ignoreNextEnterRef.current = true;
        
        // Focus on Bill Date field after a short delay
        setTimeout(() => {
          if (billDateRef.current) {
            billDateRef.current.focus();
            setFocusedField('billDate');
            setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 1 });
          }
          // Reset the ignore flag after focus
          setTimeout(() => {
            ignoreNextEnterRef.current = false;
          }, 200);
        }, 300);
        
      } else {
        showConfirmation({
          title: 'Not Found',
          message: `No voucher data found`,
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
        message: `Failed to load voucher`,
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
      message: `Do you want to delete?`,
      type: 'danger',
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: async () => {
        try {
          const response = await axiosInstance.delete(
            API_ENDPOINTS.Scrap_Procurement.DELETE_SCRAP_PROCUREMENT(voucherNo)
          );
          
          if (response.status === 200 || response.status === 201) {
            // Reset the ignore flag after delete
            ignoreNextEnterRef.current = false;
            
            showConfirmation({
              title: 'Success',
              message: `Deleted successfully.`,
              type: 'success',
              confirmText: 'OK',              
              showIcon: true,
              onConfirm: () => {
                setShowConfirmPopup(false);
                handleClear();
              }
            });
            // toast.error(`Voucher ${voucherNo} deleted successfully.`);
            clearFormData();
          } else {
            showConfirmation({
              title: 'Error',
              message: 'Failed to delete voucher. Please try again.',
              type: 'danger',
              confirmText: 'OK',
              showIcon: true,
              onConfirm: () => setShowConfirmPopup(false)
            });
            // toast.error('Failed to delete voucher. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting voucher:', error);
          showConfirmation({
            title: 'Error',
            message: `Failed to delete `,
            type: 'danger',
            confirmText: 'OK',
            showIcon: true,
            onConfirm: () => setShowConfirmPopup(false)
          });
          // toast.error(`Failed to delete voucher: ${error.response?.data?.message || error.message}`);
        }
      }
    });
  };

  // NEW: Handle Edit button click
  const handleEditClick = () => {
    setPopupMode('edit');
    setVoucherSearchTerm('');
    setShowVoucherListPopup(true);
    ignoreNextEnterRef.current = false;
  };

  // NEW: Handle Delete button click
  const handleDeleteClick = () => {
    setPopupMode('delete');
    setVoucherSearchTerm('');
    setShowVoucherListPopup(true);
    ignoreNextEnterRef.current = false;
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
          uom: item.units || 'KG',
          brand: item.brand || '',
          category: item.category || '',
          model: item.model || '',
          size: item.size || '',
          hsn: item.hsn || '',
          preRate: item.preRate || '0',
          type: item.type || '',
        }));
      }
      
      const url = API_ENDPOINTS.Scrap_Procurement.GET_ITEM_LIST;
      const response = await axiosInstance.get(url);
      let data = response?.data?.data || response?.data || [];
      
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
      let data = response?.data?.data || response?.data || [];
      
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
          phonenumber: customer.phonenumber || '',
        }));
      }
      
      const url = API_ENDPOINTS.Scrap_Procurement.GET_CUSTOMER_LIST(pageNum, pageSize);
      const response = await axiosInstance.get(url);
      const data = response?.data?.data || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data.map((customer, index) => ({
        id: customer.id || customer.code || `customer-${index}`,
        code: customer.code || '',
        name: customer.name || '',
        custName: customer.name || '',
        phonenumber: customer.phonenumber || '',
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
      let data = response?.data?.data || response?.data || [];
      
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

  // Handle UOM spacebar cycling
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
      const taxInput = document.querySelector(`input[data-row="${index}"][data-field="tax"]`);
      if (taxInput) {
        taxInput.focus();
        const rowIndex = items.findIndex(i => i.id === id);
        setCurrentFocus({ section: 'table', rowIndex, fieldIndex: tableFields.indexOf('tax') });
        return;
      }
    }
  };

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillDetails(prev => ({ ...prev, [name]: value }));
  };

  // Handle Enter and Arrow Key Navigation for form fields
  const handleKeyDown = (e, nextRef, fieldName = '') => {
    // Check if we should ignore Enter key (e.g., after edit load)
    if (ignoreNextEnterRef.current && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Handle arrow keys for header navigation
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleHeaderArrowNavigation(e, fieldName);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
        const nextIndex = headerFields.findIndex(f => f.name === fieldName) + 1;
        if (nextIndex < headerFields.length) {
          setFocusedField(headerFields[nextIndex].name);
          setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: nextIndex });
        }
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
        itemName: '',
        itemCode: '',
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
    if (scrapProductRef.current) {
      scrapProductRef.current.focus();
      setFocusedField('scrapProductInput');
      setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 5 });
    }
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

    // If user is typing in itemName field, open popup and set search term
    if (field === 'itemName' && value.length > 0) {
      const currentRowIndex = items.findIndex(item => item.id === id);
      if (currentRowIndex !== -1) {
        setSelectedRowForItem(currentRowIndex);
        setItemSearchTerm(value);
        setClosedItemByUser(false);
        setTimeout(() => setShowItemPopup(true), 100);
      }
    }
  };

  const handleTableKeyDown = (e, currentRowIndex, currentField) => {
    // Check if we should ignore Enter key
    if (ignoreNextEnterRef.current && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Handle / key for item search popup
    if (currentField === 'itemName' && e.key === '/') {
      e.preventDefault();
      setSelectedRowForItem(currentRowIndex);
      setItemSearchTerm('');
      setClosedItemByUser(false);
      setShowItemPopup(true);
      return;
    }

    // Handle arrow keys for table navigation
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleTableArrowNavigation(e, currentRowIndex, currentField);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      // Fields in the visual order
      const fields = [
        'scrapProductName', 'itemName', 'uom', 'tax', 'sRate', 'qty'
      ];

      const currentFieldIndex = fields.indexOf(currentField);

      // Check if itemName is empty in the current row
      const currentRow = items[currentRowIndex];
      const isItemNameEmpty = !currentRow.itemName || currentRow.itemName.trim() === '';

      // If Enter is pressed in the qty field
      if (currentField === 'itemName') {
        // Check if itemName is empty in the current row
        if (isItemNameEmpty) {
          handleSave();
          // Do NOT clearFormData() here! Only clear after successful save or explicit confirmation.
          return;
        }
      }

      // Always move to next field if available
      if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        let nextInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="${nextField}"], select[data-row="${currentRowIndex}"][data-field="${nextField}"]`);
        
        // For UOM field (which is a div), use special selector
        if (!nextInput && nextField === 'uom') {
          nextInput = document.querySelector(`div[data-row="${currentRowIndex}"][data-field="uom"]`);
        }
        
        if (nextInput) {
          nextInput.focus();
          const nextFieldIndex = tableFields.indexOf(nextField);
          setCurrentFocus({ section: 'table', rowIndex: currentRowIndex, fieldIndex: nextFieldIndex });
          return;
        }
      }

      // If Enter is pressed in the qty field and itemName is not empty
        if (currentField === 'qty' && !isItemNameEmpty) {
          // If there is a next row, move to its first field
          if (currentRowIndex < items.length - 1) {
            const nextRowInput = document.querySelector(`input[data-row="${currentRowIndex + 1}"][data-field="scrapProductName"]`);
            if (nextRowInput) {
              nextRowInput.focus();
              setCurrentFocus({ section: 'table', rowIndex: currentRowIndex + 1, fieldIndex: 0 });
              return;
            }
          }
          // Otherwise, add a new row
          handleAddRow();
          setTimeout(() => {
            const newRowInput = document.querySelector(`input[data-row="${items.length}"][data-field="scrapProductName"]`);
            if (newRowInput) {
              newRowInput.focus();
              setCurrentFocus({ section: 'table', rowIndex: items.length, fieldIndex: 0 });
            }
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
        message: 'Do you want to clear',
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
      message: `Are you sure you want to delete?`,
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
    ignoreNextEnterRef.current = false;
    
    fetchNextBillNo().then(() => {
      setBillDetails(prev => ({
        billNo: prev.billNo,
        billDate: new Date().toISOString().substring(0, 10),
        mobileNo: '',
        empName: '',
        salesman: '',
        salesmanCode: '', 
        custName: '',
        custCode: '', 
        scrapProductInput: '',
        scrapCode: '',
      }));
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
    
    setActiveTopAction('add');
    setIsEditMode(false);
    setOriginalBillDetails(null);
    setOriginalItems(null);
    // setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 0 });
    setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 1 });
  };

  const handleClear = () => {
    ignoreNextEnterRef.current = false;
    
    if (isEditMode) {
      showConfirmation({
        title: 'Clear Data',
        message: 'Are you sure you want to clear all data?',
        type: 'warning',
        confirmText: 'Yes',
        cancelText: 'No',
        onConfirm: () => {
          revertToOriginalData();
          setShowConfirmPopup(false);
          clearFormData();
        },
        onCancel: () => {
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
      
      const firstScrapItem = items.find(item => item.scrapProductName && item.scrapProductName.trim() !== '');
      
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
      console.log('Saving Scrap Procurement with payload:', payload);

      const response = await axiosInstance.post(
        API_ENDPOINTS.Scrap_Procurement.SAVE_SCRAP_PROCUREMENT(isCreate),
        payload
      );
      clearFormData(); // Clear form data only after successful save
      if (response.status === 200 || response.status === 201) {
        const mode = isCreate ? 'created' : 'updated';
        
        ignoreNextEnterRef.current = false;
        
        showConfirmation({
          title: 'Success',
          message: `Scrap Procurement data ${mode} successfully!`,
          type: 'success',
          confirmText: 'OK',
          showIcon: true,
          onConfirm: () => {
            setShowConfirmPopup(false);
            setOriginalBillDetails(null);
            setOriginalItems(null);
            clearFormData(); // Clear ONLY on successful save
            setIsEditMode(false);
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
        message: `Error saving data`,
        type: 'danger',
        confirmText: 'OK',
        showIcon: true,
        onConfirm: () => setShowConfirmPopup(false)
      });
    }
  };

  const handleSave = async () => {
    try {
      if (ignoreNextEnterRef.current) {
        return;
      }
      
      // Check required fields
      if (!billDetails.salesman || !billDetails.custName) {
        showConfirmation({
          title: 'Missing Information',
          message: 'Please fill in required fields: Salesman and Customer',
          type: 'warning',
          confirmText: 'OK',
          showIcon: true,
          onConfirm: () => setShowConfirmPopup(false)
        });
        return; // Just return, don't clear anything
      }
      
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
        return; // Just return, don't clear anything
      }

      // Validate amount and qty only for rows with itemName filled
      const invalidRows = items.filter(item => {
        if (!item.itemName || item.itemName.trim() === '') return false;
        return !item.amount || item.amount.trim() === '' || !item.qty || item.qty.trim() === '';
      });
      if (invalidRows.length > 0) {
        showConfirmation({
          title: 'Missing Information',
          message: 'Please fill in required fields: amount and quantity for all items with item name selected',
          type: 'warning',
          confirmText: 'OK',
          showIcon: true,
          onConfirm: () => setShowConfirmPopup(false)
        });
        return; // Just return, don't clear anything
      }
      
      // All validations passed, now show save confirmation
      showConfirmation({
        title: 'Save Confirmation',
        message: `Do you want to ${isEditMode ? 'modify' : 'save'}?`,
        type: isEditMode ? 'info' : 'success',
        confirmText: 'Yes',
        cancelText: 'No',
        onConfirm: async () => {
          await performSave();
          setShowConfirmPopup(false);
        },
        onCancel: () => {
          if (isEditMode) {
            showConfirmation({
              title: 'Discard Changes',
              message: 'Do you want to discard the changes?',
              type: 'warning',
              confirmText: 'Discard',
              onConfirm: () => {
                revertToOriginalData();
                setShowConfirmPopup(false);
              },
              onCancel: () => {
                setShowConfirmPopup(false);
              }
            });
          } else {
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
      minWidth: screenSize.isMobile ? '75px' : screenSize.isTablet ? '40px' : '75px',
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
    uomHint: {
      position: 'absolute',
      top: '-25px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#1B91DA',
      color: 'white',
      padding: '3px 8px',
      borderRadius: '3px',
      fontSize: '10px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      zIndex: 100,
      pointerEvents: 'none',
      opacity: 0,
      transition: 'opacity 0.2s ease',
    },
    uomHintVisible: {
      position: 'absolute',
      top: '-25px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#1B91DA',
      color: 'white',
      padding: '3px 8px',
      borderRadius: '3px',
      fontSize: '10px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      zIndex: 100,
      pointerEvents: 'none',
      opacity: 1,
      transition: 'opacity 0.2s ease',
    },
  };

  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (screenSize.isMobile) {
      return 'repeat(2, 1fr)';
    } else if (screenSize.isTablet) {
      return 'repeat(3, 1fr)';
    } else {
      return 'repeat(5, 1fr)';
    }
  };

  return (
    <div
      style={styles.container}
      onKeyDown={(e) => {
        // Block Enter that comes from popup selection
        if (ignoreNextEnterRef.current && e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Block Enter everywhere else when in edit mode
        if (
          e.key === 'Enter' &&
          !showSalesmanPopup &&
          !showCustomerPopup &&
          !showScrapPopup &&
          !showItemPopup &&
          !showVoucherListPopup &&
          !showConfirmPopup
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
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
              onKeyDown={(e) => handleKeyDown(e, billDateRef, 'billNo')}
              onFocus={() => {
                setFocusedField('billNo');
                setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 0 });
              }}
              onBlur={() => setFocusedField('')}
              readOnly={true}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setFocusedField('custName'); // Clear current focus
                  custNameRef.current?.focus(); // Move focus to customer
                  setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 2 });
                } else {
                  handleKeyDown(e, custNameRef, 'billDate');
                }
              }}
              onFocus={() => {
                setFocusedField('billDate');
                setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 1 });
              }}
              onBlur={() => {
                // Only clear if not moving to another field
                if (focusedField === 'billDate') {
                  setFocusedField('');
                }
              }}
            />
          </div>

          {/* Customer Name */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Customer:</label>
            <div style={{ position: 'relative', flex: 1.4 }}>
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
                    e.preventDefault();
                    setFocusedField('mobileNo');
                    mobileRef.current.focus();
                    setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 2 });
                  } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    handleHeaderArrowNavigation(e, 'custName');
                  }

                }}
                onFocus={() => {
                  setFocusedField('custName');
                  setActiveSearchField('customer');
                  setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 2 });
                  
                  if (billDetails.custName.length > 0 && !showCustomerPopup && !closedByUser) {
                    setCustomerSearchTerm(billDetails.custName);
                    setShowSalesmanPopup(false);
                    setShowScrapPopup(false);
                    setTimeout(() => setShowCustomerPopup(true), 100);
                  }
                }}
                 onBlur={() => {
        // Only clear if not moving to another field
        if (focusedField === 'custName') {
          setFocusedField('');
        }
      }}
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
              onKeyDown={(e) => handleKeyDown(e, salesmanRef, 'mobileNo')}
              onFocus={() => {
                setFocusedField('mobileNo');
                setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 3 });
              }}
              onBlur={() => setFocusedField('')}
              readOnly={true}
            />
          </div>

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
                    e.preventDefault();
                    // Move focus to the first field in the table
                    const firstTableInput = document.querySelector('input[data-row="0"][data-field="scrapProductName"]');
                    if (firstTableInput) {
                      firstTableInput.focus();
                      setCurrentFocus({ section: 'table', rowIndex: 0, fieldIndex: 0 });
                    }
                  } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    handleHeaderArrowNavigation(e, 'salesman');
                  }
                }}
                onFocus={() => {
                  setFocusedField('salesman');
                  setActiveSearchField('salesman');
                  setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 4 });
                  
                  if (billDetails.salesman.length > 0 && !showSalesmanPopup && !closedByUser) {
                    setSalesmanSearchTerm(billDetails.salesman);
                    setShowCustomerPopup(false);
                    setShowScrapPopup(false);
                    setTimeout(() => setShowSalesmanPopup(true), 100);
                  }
                }}
                onBlur={() => setFocusedField('')}
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
                      style={focusedField === `scrapProductName-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.scrapProductName}
                      data-row={index}
                      data-field="scrapProductName"
                      // onChange={(e) => handleItemChange(item.id, 'scrapProductName', e.target.value)}
                      // onChange={onCompanyChange}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'scrapProductName')}
                      onFocus={() => {
                        setFocusedField(`scrapProductName-${item.id}`);
                        setCurrentFocus({ section: 'table', rowIndex: index, fieldIndex: 0 });
                      }}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.itemNameContainer }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      style={{ 
                        ...(focusedField === `itemName-${item.id}` ? styles.editableInputClickableFocused : styles.editableInputClickable),
                        textAlign: 'left',
                        paddingRight: '32px',
                      }}
                      value={item.itemName}
                      data-row={index}
                      data-field="itemName"
                      onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'itemName')}
                      onFocus={() => {
                        setFocusedField(`itemName-${item.id}`);
                        setCurrentFocus({ section: 'table', rowIndex: index, fieldIndex: 1 });
                      }}
                      onBlur={() => setFocusedField('')}
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
                    <div style={styles.uomContainer}>
                      <div 
                        style={focusedUomField === item.id || focusedField === `uom-${item.id}` ? styles.uomDisplayActive : styles.uomDisplay}
                        onClick={() => {
                          const uomValues = ['pcs', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'mm'];
                          const currentUom = item.uom || '';
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
                          
                          setItems(items.map(i => {
                            if (i.id === item.id) {
                              return {
                                ...i,
                                uom: nextUom
                              };
                            }
                            return i;
                          }));
                          
                          setFocusedUomField(item.id);
                          setTimeout(() => {
                            setFocusedUomField(null);
                          }, 300);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === ' ') {
                            handleUomSpacebar(e, item.id, index);
                          } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            handleTableArrowNavigation(e, index, 'uom');
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            const taxInput = document.querySelector(`input[data-row="${index}"][data-field="tax"]`);
                            if (taxInput) {
                              taxInput.focus();
                              setCurrentFocus({ section: 'table', rowIndex: index, fieldIndex: 3 });
                            }
                          }
                        }}
                        tabIndex={0}
                        onFocus={() => {
                          setFocusedField(`uom-${item.id}`);
                          setFocusedUomField(item.id);
                          setCurrentFocus({ section: 'table', rowIndex: index, fieldIndex: 2 });
                        }}
                        onBlur={() => {
                          setFocusedField('');
                          setFocusedUomField(null);
                        }}
                        title="Press Space or Click to toggle units, Enter to move to TAX"
                        data-row={index}
                        data-field="uom"
                      >
                        {item.uom || ''}
                      </div>
                      <div style={focusedUomField === item.id || focusedField === `uom-${item.id}` ? styles.uomHintVisible : styles.uomHint}>
                        Press Space or Click to toggle
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `tax-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.tax}
                      data-row={index}
                      data-field="tax"
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers and empty input
                        if (value === '' || /^[0-9]*$/.test(value)) {
                          // Validate as user types
                          if (value.length <= 2) { // Tax values are max 2 digits
                            handleItemChange(item.id, 'tax', value);                            
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        handleTableKeyDown(e, index, 'tax');
                        
                        // Clear on Escape key
                        if (e.key === 'Escape') {
                          handleItemChange(item.id, 'tax', '');
                        }
                      }}
                      onFocus={() => {
                        setFocusedField(`tax-${item.id}`);
                        setCurrentFocus({ section: 'table', rowIndex: index, fieldIndex: 3 });
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        const validTaxValues = ['3', '5', '12', '18', '40'];
                        
                        // Validate on blur
                        if (value !== '' && !validTaxValues.includes(value)) {
                          showConfirmation({
                            title: 'Invalid Tax Rate',
                            message: 'Not a valid tax rate. Please use one of: 3%, 5%, 12%, 18%, or 40%',
                            type: 'info',
                            confirmText: 'OK',
                            cancelText: '',
                            showCancelButton: false,
                            onConfirm: () => {
                              setShowConfirmPopup(false);
                              setCurrentFocus({ section: 'table', rowIndex: index, fieldIndex: 3 });
                              setTimeout(() => {
                                const taxInput = document.querySelector(`input[data-row="${index}"][data-field="tax"]`);
                                if (taxInput) taxInput.focus();
                              }, 100);
                            }
                          });
                        }                        
                        setFocusedField('');
                      }}
                      // placeholder="3, 5, 12, 18, 40"
                      maxLength="2"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `sRate-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.sRate}
                      data-row={index}
                      data-field="sRate"
                      // onChange={(e) => handleItemChange(item.id, 'sRate', e.target.value)}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers and empty input
                        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value))  {
                          // Validate as user types
                          handleItemChange(item.id, 'sRate', value);
                        }
                      }}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'sRate')}
                      onFocus={() => {
                        setFocusedField(`sRate-${item.id}`);
                        setCurrentFocus({ section: 'table', rowIndex: index, fieldIndex: 4 });
                      }}
                      onBlur={() => setFocusedField('')}
                      step="0.01"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `qty-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.qty}
                      data-row={index}
                      data-field="qty"
                      // onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers and empty input
                        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                          // Validate as user types
                          handleItemChange(item.id, 'qty', value);
                        }
                      }}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                      onFocus={() => {
                        setFocusedField(`qty-${item.id}`);
                        setCurrentFocus({ section: 'table', rowIndex: index, fieldIndex: 5 });
                      }}
                      onBlur={() => setFocusedField('')}
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
        initialSearch={salesmanSearchTerm}
        onSearchChange={(searchValue) => {
          setSalesmanSearchTerm(searchValue);
          setBillDetails(prev => ({
            ...prev,
            salesman: searchValue
          }));
        }}
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
          
          // if (custNameRef.current) {
          //   custNameRef.current.focus();
          //   setFocusedField('custName');
          //   setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 4 });
          // }
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
        initialSearch={customerSearchTerm}
        onSearchChange={(searchValue) => {
          setCustomerSearchTerm(searchValue);
          setBillDetails(prev => ({
            ...prev,
            custName: searchValue
          }));
        }}
        onSelect={(selectedCustomer) => {
          setBillDetails(prev => ({
            ...prev,
            custName: selectedCustomer.name || '',
            custCode: selectedCustomer.code || '',
            mobileNo: selectedCustomer.phonenumber || '',
          }));
          setShowCustomerPopup(false);
          setClosedByUser(false);
          setCustomerSearchTerm('');
          setActiveSearchField(null);
          
          if (scrapProductRef.current) {
            scrapProductRef.current.focus();
            setFocusedField('scrapProductInput');
            setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 5 });
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
        initialSearch={scrapSearchTerm}
        onSearchChange={(searchValue) => {
          setScrapSearchTerm(searchValue);
          setBillDetails(prev => ({
            ...prev,
            scrapProductInput: searchValue
          }));
        }}
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
              setFocusedField('scrapProductInput');
              setCurrentFocus({ section: 'header', rowIndex: 0, fieldIndex: 5 });
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
        clearSearch={() => setCompanyQuery("")}
        title="Select Item"
        fetchItems={fetchItemList}
        displayFieldKeys={['itemName']}
        headerNames={['Item Name']}
        searchFields={['itemName']}
        columnWidths={['100%']}
        searchPlaceholder="Search item by name..."
        initialSearch={itemSearchTerm}
        onSearchChange={(searchValue) => {
          setItemSearchTerm(searchValue);
          // if (selectedRowForItem !== null && items[selectedRowForItem]) {
          //   const updatedItems = [...items];
          //   updatedItems[selectedRowForItem] = {
          //     ...updatedItems[selectedRowForItem],
          //     itemName: searchValue
          //   };
          //   setItems(updatedItems);
          // }
        }}
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
              setCurrentFocus({ section: 'table', rowIndex: selectedRowForItem, fieldIndex: 1 });
            }
          }, 100);
        }}
      />

      {/* Voucher List Popup for Edit/Delete */}
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
            <AddButton buttonType="add" disabled={!formPermissions.add} />
            <EditButton buttonType="edit" disabled={!formPermissions.edit} />
            <DeleteButton buttonType="delete" disabled={!formPermissions.delete} />
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