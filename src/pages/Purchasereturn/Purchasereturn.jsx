import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from 'antd';
import { toast } from 'react-toastify';
import PopupListSelector from '../../components/Listpopup/PopupListSelector.jsx';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup.jsx';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';

const Icon = {
  Search: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  ),
}

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
  
  const total = subTotal;
  const net = amtTotal || subTotal;
  return { subTotal, total, net, amtTotal };
};

const PurchaseReturn = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.PURCHASE_RETURN),
    edit: hasModifyPermission(PERMISSION_CODES.PURCHASE_RETURN),
    delete: hasDeletePermission(PERMISSION_CODES.PURCHASE_RETURN)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('add');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBillNo, setEditingBillNo] = useState('');
  const [addLessAmount, setAddLessAmount] = useState('');
  
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
  
  const [showBillListPopup, setShowBillListPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('');
  
  // Invoice Number Popup State
  const [showInvoiceBillListPopup, setShowInvoiceBillListPopup] = useState(false);
  const [invoiceBillList, setInvoiceBillList] = useState([]);
  const [invoiceBillListLoading, setInvoiceBillListLoading] = useState(false);
  
  // Supplier Popup State
  const [showSupplierPopup, setShowSupplierPopup] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [billListSearchTerm, setBillListSearchTerm] = useState('');
  
  // Item Code Popup State (for selecting particulars/items)
  const [showItemCodePopup, setShowItemCodePopup] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  
  // Bill Details Popup State (for showing items from selected purchase invoice)
  const [billDetailsPopupOpen, setBillDetailsPopupOpen] = useState(false);
  const [selectedBillForDetails, setSelectedBillForDetails] = useState(null);
  const [billDetailsData, setBillDetailsData] = useState({});
  const [isLoadingDetails, setIsLoadingDetails] = useState({});
  const [checkedBills, setCheckedBills] = useState({});
  const [billDetailsSearchText, setBillDetailsSearchText] = useState('');

  // 1. Header Details State
  const [returnDetails, setReturnDetails] = useState({
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
    transType: 'RETURN',
    city: '',
    isLedger: false,
    originalInvoiceNo: '',
    originalInvoiceDate: '',
    originalInvoiceAmount: ''
  });

  // 2. Table Items State
  const [items, setItems] = useState([
    {
      id: 1,
      barcode: '',
      name: '',
      sub: '',
      stock: '0',
      mrp: '0',
      uom: '',
      hsn: '',
      tax: '',
      rate: 0,
      qty: '1',
      ovrwt: '',
      avgwt: '',
      prate: 0,
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
      max: '',
    }
  ]);

  // 3. Totals State
  const [netTotal, setNetTotal] = useState(0);

  // --- REFS FOR ENTER KEY NAVIGATION ---
  const returnNoRef = useRef(null);
  const dateRef = useRef(null);
  const amountRef = useRef(null);
  const invoiceNoRef = useRef(null);
  const invoiceDateRef = useRef(null);
  const invoiceAmountRef = useRef(null);
  const partyCodeRef = useRef(null);
  const customerNameRef = useRef(null);
  const cityRef = useRef(null);
  const transTypeRef = useRef(null);
  const mobileRef = useRef(null);
  const gstTypeRef = useRef(null);
  const gstNoRef = useRef(null);
  const firstRowBarcodeRef = useRef(null);
  const addLessRef = useRef(null);

  // Track which top-section field is focused to style active input
  const [focusedField, setFocusedField] = useState('');
  const [focusedUomField, setFocusedUomField] = useState(null);

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

  // COMPLETE NEW FORM FUNCTION
  const createNewForm = async () => {
    try {
      setIsLoading(true);
      
      // First, clear all states
      setIsEditMode(false);
      setEditingBillNo('');
      setActiveTopAction('add');
      setActiveFooterAction('null');
      setFocusedField('');
      setShowBillListPopup(false);
      setPopupMode('');
      setItemSearchTerm('');
      setShowSupplierPopup(false);
      setShowItemCodePopup(false);
      setSelectedRowId(null);
      setShowInvoiceBillListPopup(false);
      setBillDetailsPopupOpen(false);
      setSelectedBillForDetails(null);
      setCheckedBills({});
      setBillDetailsSearchText('');
      setAddLessAmount('');
      
      // Clear table items first
      setItems([{
        id: 1,
        barcode: '',
        name: '',
        sub: '',
        stock: '0',
        mrp: '0',
        uom: '',
        hsn: '',
        tax: '',
        rate: 0,
        qty: '1',
        ovrwt: '',
        avgwt: '',
        prate: 0,
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
        max: '',
      }]);
      
      // Clear header fields
      const currentDate = new Date().toISOString().substring(0, 10);
      setReturnDetails({
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
        transType: 'RETURN',
        city: '',
        isLedger: false,
        originalInvoiceNo: '',
        originalInvoiceDate: currentDate,
        originalInvoiceAmount: ''
      });
      
      // Then fetch next invoice number
      await fetchNextInvNo();
      
      // Force a state update
      setTimeout(() => {
        if (returnNoRef.current) {
          returnNoRef.current.focus();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error creating new form:', error);
      showAlertConfirmation('Error refreshing form. Please try again.', null, 'danger');
      toast.error('Error refreshing form');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch purchase return bill list for popup
  const fetchBillList = async (pageNum = 1, search = '') => {
    try {
      const compCode = userData?.companyCode || '001';
      const response = await axiosInstance.get(
        API_ENDPOINTS.PURCHASE_RETURN.GET_BILL_NUMBERS(compCode, pageNum, 20)
      );
      
      // Handle billNumbers array structure from API
      let billsData = [];
      
      if (response?.data?.billNumbers && Array.isArray(response.data.billNumbers)) {
        billsData = response.data.billNumbers;
      } else if (Array.isArray(response?.data)) {
        billsData = response.data;
      } else if (response?.billNumbers && Array.isArray(response.billNumbers)) {
        billsData = response.billNumbers;
      }
      
      // Map to expected format
      let mappedData = Array.isArray(billsData) ? billsData.map((bill, index) => ({
        id: bill.billno || `bill-${index}`,
        voucherNo: bill.billno || '',
        billno: bill.billno || '',
        displayName: bill.billno || `BILL-${index + 1}`
      })) : [];
      
      // Filter by search text if provided
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        mappedData = mappedData.filter(bill => 
          (bill.voucherNo && bill.voucherNo.toLowerCase().includes(searchLower)) ||
          (bill.billno && bill.billno.toLowerCase().includes(searchLower))
        );
      }
      
      return mappedData;
    } catch (err) {
      console.error('Error fetching bill list:', err);
      return [];
    }
  };

  // Fetch purchase bill list for invoice number popup
  const fetchInvoiceBillList = async () => {
    try {
      setInvoiceBillListLoading(true);
      const compCode = userData?.companyCode || '001';
      const response = await axiosInstance.get(
        API_ENDPOINTS.PURCHASE_RETURN.GET_PURCHASE_BILL_LIST(compCode, 1, 100)
      );
      
      const data = response?.data?.data || [];
      const billList = Array.isArray(data) ? data.map((bill, index) => ({
        id: bill.billno || `bill-${index}`,
        billno: bill.billno || '',
      })) : [];
      
      setInvoiceBillList(billList);
      setShowInvoiceBillListPopup(true);
    } catch (err) {
      console.error('Error fetching invoice bill list:', err);
      setInvoiceBillList([]);
      setShowInvoiceBillListPopup(true);
    } finally {
      setInvoiceBillListLoading(false);
    }
  };

  // Fetch item code list for particulars popup
  const fetchItemCodeList = async (search = '') => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PURCHASE_INVOICE.GET_ITEM_CODE_LIST);
      const data = response?.data || [];
      
      let items = Array.isArray(data) ? data.map((item, index) => ({
        barcode: item.itemCode || `item-${index}`,
        name: item.itemName || '',
      })) : [];
      
      // Filter by search term if provided
      if (search && search.trim().length > 0) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.barcode.toLowerCase().includes(searchLower) || 
          item.name.toLowerCase().includes(searchLower)
        );
      }
      
      return items;
    } catch (err) {
      console.error('Error fetching item code list:', err);
      return [];
    }
  };

  // Fetch item details by item code
  const fetchItemDetailsByCode = async (itemCode) => {
    try {
      // console.log('Fetching item details for code:', itemCode);
      
      const response = await axiosInstance.get(API_ENDPOINTS.PURCHASE_INVOICE.GET_ITEM_CODE_LIST);
      const allItems = response?.data || [];
      
      // console.log('All items from API:', allItems);
      
      if (!Array.isArray(allItems) || allItems.length === 0) {
        console.warn('No items returned from API');
        return [];
      }
      
      const matchedItem = allItems.find(item => 
        (item.itemCode || item.code) === itemCode
      );
      
      // console.log('Matched item:', matchedItem);
      
      if (!matchedItem) {
        console.warn(`Item ${itemCode} not found in response`);
        return [];
      }
      
      return [{
        barcode: matchedItem.itemCode || matchedItem.code || itemCode,
        name: matchedItem.itemName || matchedItem.name || '',
        stock: matchedItem.finalStock || matchedItem.stock || matchedItem.totalStock || '0',
        uom: matchedItem.units || matchedItem.uom || matchedItem.unit || 'PCS',
        hsn: matchedItem.hsn || matchedItem.hsnCode || '',
        preRT: matchedItem.preRate || '0',
        mrp: matchedItem.mrp || '0',
        brand: matchedItem.brand || '',
        category: matchedItem.category || '',
        model: matchedItem.model || '',
        size: matchedItem.size || '',
        max: matchedItem.maxQty || '',
        min: matchedItem.minQty || '',
        type: matchedItem.type || '',
      }];
      
    } catch (err) {
      console.error('Error fetching item details by code:', err);
      console.error('Error response:', err.response);
      return [];
    }
  };

  // Handle opening item code popup for a specific row
  const handleItemCodeSelect = (itemId, searchTerm = '') => {
    console.log('Opening item code popup for row:', itemId, 'with search:', searchTerm);
    setSelectedRowId(itemId);
    setItemSearchTerm(searchTerm);
    setShowItemCodePopup(true);
  };

  // Handle item code selection from popup
  const handleItemCodeSelection = async (selectedItem) => {
    if (!selectedItem || !selectedItem.barcode) return;
    
    setShowItemCodePopup(false);
    
    try {
      const [stockResponse, itemDetailsArray] = await Promise.all([
        axiosInstance.get(
          API_ENDPOINTS.PURCHASE_INVOICE.GET_ITEM_DETAILS_BY_CODE(selectedItem.barcode)
        ),
        fetchItemDetailsByCode(selectedItem.barcode)
      ]);
      
      const stockData = stockResponse?.data || {};
      const itemDetails = itemDetailsArray && itemDetailsArray.length > 0 ? itemDetailsArray[0] : {};
      
      // console.log('Stock API response:', stockData);
      // console.log('Item Details API response:', itemDetails);
      
      setItems(prevItems => {
        return prevItems.map(item => {
          if (item.id === selectedRowId) {
            return {
              ...item,
              barcode: stockData.itemCode || itemDetails.barcode || selectedItem.barcode || '',
              name: stockData.itemName || itemDetails.name || selectedItem.name || '',
              stock: stockData.finalStock !== undefined && stockData.finalStock !== null ? stockData.finalStock : itemDetails.stock || '0',
              uom: stockData.units || itemDetails.uom || 'PCS',
              hsn: stockData.hsn || itemDetails.hsn || '',
              prate: parseFloat(stockData.purchaseRate) || parseFloat(itemDetails.preRT) || 0,
              mrp: parseFloat(stockData.mrp) || parseFloat(itemDetails.mrp) || 0,
              preRT: parseFloat(stockData.purchaseRate) || parseFloat(itemDetails.preRT) || 0,
            };
          }
          return item;
        });
      });
      
    } catch (err) {
      console.error('Error selecting item code:', err);
      showAlertConfirmation(`Error loading item details: ${err.message}`, null, 'error');
      toast.error('Error loading item details');
    } finally {
      setSelectedRowId(null);
      setItemSearchTerm('');
    }
  };

  // Fetch supplier/party list
  const fetchSupplierItems = async (pageNum = 1, search = '') => {
    const url = API_ENDPOINTS.PURCHASE_RETURN.GET_PARTY_LIST(search || '', pageNum, 20);
    const res = await axiosInstance.get(url);
    const data = res?.data?.data || [];
    return Array.isArray(data) ? data.map((item) => ({
      code: item.fCode || '',
      name: item.fAcname || '',
      city: item.fCity || '',
      phone: item.fPhone || '',
      street: item.fStreet || '',
      area: item.fArea || '',
      pincode: item.fPincode || ''
    })) : [];
  };

  // Handle invoice bill selection from popup - opens bill details popup
  const handleInvoiceBillSelect = async (selectedBill) => {
    const billNo = selectedBill.billno || selectedBill.id || '';
    setSelectedBillForDetails(billNo);
    setShowInvoiceBillListPopup(false);
    
    // Fetch and open bill details popup
    await openBillDetailsPopup(billNo);
  };

  // Open Bill Details Popup - fetch items from selected purchase invoice
  const openBillDetailsPopup = async (billNo) => {
    try {
      setIsLoadingDetails(prev => ({ ...prev, [billNo]: true }));
      
      // Fetch purchase invoice items using the new endpoint
      const response = await axiosInstance.get(
        API_ENDPOINTS.PURCHASE_RETURN.GET_PURCHASE_ITEMS_BY_VOUCHER(billNo)
      );
      
      const billData = response?.data?.data || [];
      
      // Map the API response to our item format
      const mappedItems = Array.isArray(billData) ? billData.map(item => ({
        itemCode: item.itemCode || '',
        itemName: item.itemName || '',
        id: item.itemCode || '',
        barcode: item.itemCode || '',
        name: item.itemName || '',
        qty: item.qty || 0,
        rate: parseFloat(item.pRate) || 0,
        pRate: parseFloat(item.pRate) || 0,
        amount: item.amount || 0,
        wRate: item.wRate || 0,
        unit: item.unit || '',
        uom: item.unit || '',
        hsn: item.hsn || '',
        ovrWt: item.ovrWt || 0,
        avgWt: item.avgWt || 0,
        inTax: item.inTax || 0,
        outTax: item.outTax || 0,
        aCost: item.aCost || 0,
        acost: item.aCost || 0,
        sudo: item.sudo || '',
        profitPercent: item.profitPercent || 0,
        preRate: item.preRate || 0,
        sRate: item.sRate || 0,
        asRate: item.asRate || 0,
        mrp: item.mrp || 0,
        letProfPer: item.letProfPer || 0,
        ntCost: item.ntCost || 0,
        wsPer: item.wsPer || 0,
        wsPercent: item.wsPer || 0,
      })) : [];
      
      setBillDetailsData(prev => ({
        ...prev,
        [billNo]: mappedItems
      }));
      
      setCheckedBills({});
      setBillDetailsSearchText('');
      setBillDetailsPopupOpen(true);
    } catch (err) {
      console.error('Error fetching bill details:', err);
      setBillDetailsData(prev => ({ ...prev, [billNo]: [] }));
      setBillDetailsPopupOpen(true);
      toast.error('Error fetching bill details');
    } finally {
      setIsLoadingDetails(prev => ({ ...prev, [billNo]: false }));
    }
  };

  // Get filtered items for bill details popup
  const getFilteredBillItems = () => {
    const billData = billDetailsData[selectedBillForDetails] || [];
    
    if (!billDetailsSearchText) {
      return billData;
    }
    
    return billData.filter(item =>
      item.itemName?.toLowerCase().includes(billDetailsSearchText.toLowerCase()) ||
      item.itemCode?.toLowerCase().includes(billDetailsSearchText.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(billDetailsSearchText.toLowerCase())
    );
  };
const handleNumberInput = (e) => {
  const input = e.target.value;
  
  // Allow empty string
  if (input === '') {
    setAddLessAmount('');
    return;
  }
  
  // Allow negative numbers
  if (input === '-') {
    setAddLessAmount('-');
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
    setAddLessAmount(sanitizedValue);
  } else {
    // If invalid, revert to previous valid value
    // Or you could set to empty
    // setAddLessAmount('');
  }
};

// Format on blur
const handleBlur = () => {
  if (addLessAmount === '' || addLessAmount === '-') {
    setFocusedField('');
    return;
  }
  
  try {
    const num = parseFloat(addLessAmount);
    if (!isNaN(num)) {
      // Format to 2 decimal places if needed
      // But don't add .00 if it's a whole number
      if (num % 1 === 0) {
        setAddLessAmount(num.toString());
      } else {
        setAddLessAmount(num.toFixed(2));
      }
    }
  } catch (error) {
    // Invalid number, clear it
    setAddLessAmount('');
  }
  
  setFocusedField('');
};
  // Handle applying selected bill items to purchase return form
  const handleApplyBillNumber = async () => {
    try {
      const billData = billDetailsData[selectedBillForDetails] || [];
      const selectedItems = billData.filter(item => checkedBills[item.itemCode || item.id]);
      
      if (selectedItems.length === 0) {
        showAlertConfirmation('Please select at least one item', null, 'warning');
        toast.warning('Please select at least one item');
        return;
      }
      
      // Update return details with invoice info
      setReturnDetails(prev => ({
        ...prev,
        originalInvoiceNo: selectedBillForDetails,
        invoiceNo: selectedBillForDetails,
      }));
      
      // Get current max ID to avoid duplicates
      const maxId = items.length > 0 ? Math.max(...items.map(item => item.id)) : 0;
      
      // Create new items with unique IDs starting from maxId + 1
      const newItems = selectedItems.map((item, index) => ({
        id: maxId + index + 1,
        barcode: item.barcode || item.itemCode || '',
        name: item.itemName || item.name || '',
        sub: item.sub || '',
        stock: item.stock || '0',
        mrp: item.mrp || '0',
        uom: item.unit || item.uom || '',
        hsn: item.hsn || '',
        tax: item.inTax || '',
        rate: parseFloat(item.pRate) || parseFloat(item.rate) || 0,
        qty: item.qty || '1',
        ovrwt: item.ovrWt || '',
        avgwt: item.avgWt || '',
        prate: parseFloat(item.pRate) || 0,
        intax: item.inTax || '',
        outtax: item.outTax || '',
        acost: item.aCost || item.acost || '',
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
        min: item.min || '',
        max: item.max || '',
      }));
      
      // Filter out any items that already exist with the same barcode
      const existingBarcodes = items.map(item => item.barcode);
      const filteredNewItems = newItems.filter(item => 
        !existingBarcodes.includes(item.barcode) && item.barcode.trim() !== ''
      );
      
      if (filteredNewItems.length === 0) {
        showAlertConfirmation('All selected items already exist in the table', null, 'warning');
        toast.warning('All selected items already exist in the table');
        return;
      }
      
      // Add only new items
      setItems([...items, ...filteredNewItems]);
      setBillDetailsPopupOpen(false);
      setCheckedBills({});
      setBillDetailsSearchText('');
      
      showAlertConfirmation(`${filteredNewItems.length} item(s) added to return`, null, 'success');
      toast.success(`${filteredNewItems.length} item(s) added to return`);
    } catch (err) {
      console.error('Error applying bill items:', err);
      showAlertConfirmation('Error applying bill items', null, 'error');
      toast.error('Error applying bill items');
    }
  };

  // Clear selected bill number and details
  const handleClearBillNumber = () => {
    setSelectedBillForDetails(null);
    setBillDetailsData({});
    setCheckedBills({});
    setBillDetailsSearchText('');
    setBillDetailsPopupOpen(false);
  };

  // Fetch purchase return details for editing
  const fetchPurchaseReturnDetails = async (voucherNo) => {
    try {
      setIsLoading(true);
      
      // console.log('Fetching purchase return details for:', voucherNo);
      
      const response = await axiosInstance.get(
        API_ENDPOINTS.PURCHASE_RETURN.GET_PURCHASE_VOUCHER_DETAILS(voucherNo)
      );
      
      // console.log('Purchase return details response:', response.data);
      
      const data = response?.data;
      
      if (data && data.success) {
        const header = data.header || {};
        const itemsArray = data.items || [];
        const summary = data.summary || {};
        
        // Format the voucher date
        let formattedDate = new Date().toISOString().substring(0, 10);
        if (header.voucherDate) {
          const dateObj = new Date(header.voucherDate);
          formattedDate = dateObj.toISOString().substring(0, 10);
        }
        
        // Update header details
        const headerDetails = {
          invNo: voucherNo || '',
          billDate: formattedDate,
          partyCode: header.customerCode || '',
          customerName: header.refName || '',
          mobileNo: header.mobileNo || '',
          amount: header.billAmount?.toString() || '0',
          gstType: header.gstType || 'I',
          city: header.city || '',
          transType: 'RETURN',
          
        };
        
        // console.log('Setting header details:', headerDetails);
        setReturnDetails(prev => ({ ...prev, ...headerDetails }));
        if(summary.less !== undefined && summary.less !== null)
        {
        setAddLessAmount(summary.less ?.toString() || '');
        }

        // Process items
        if (itemsArray.length > 0) {
          const formattedItems = itemsArray.map((item, index) => ({
            id: index + 1,
            barcode: item.itemCode || item.fid || '',
            name: item.itemName || '',
            stock: '0',
            mrp: item.mrp?.toString() || '0',
            uom: item.unit || '',
            hsn: item.hsn || '',
            tax: item.fTax?.toString() || '0',
            prate: parseFloat(item.rate) || 0,
            qty: item.qty?.toString() || '0',
            ovrwt: item.ovrWt?.toString() || '',
            avgwt: item.avgWt?.toString() || '',
            intax: item.inTax?.toString() || '',
            outtax: item.outTax?.toString() || '',
            acost: item.acost?.toString() || '',
            sudo: item.sudo || '',
            profitPercent: item.profitPercent?.toString() || '',
            preRT: item.preRate?.toString() || '',
            sRate: item.sRate?.toString() || '',
            asRate: item.asRate?.toString() || '',
            letProfPer: item.letProfPer?.toString() || '',
            ntCost: item.ntCost?.toString() || '',
            wsPercent: item.wsPer?.toString() || '',
            wsRate: item.wRate?.toString() || '',
            amt: item.amount?.toString() || '',
            min: '',
            max: ''
          }));
          
          console.log('Formatted items:', formattedItems);
          setItems(formattedItems);
        } else {
          console.log('No items found');
          setItems([{
            id: 1,
            barcode: '',
            name: '',
            sub: '',
            stock: '0',
            mrp: '0',
            uom: '',
            hsn: '',
            tax: '',
            rate: 0,
            qty: '1',
            ovrwt: '',
            avgwt: '',
            prate: 0,
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
            max: '',
          }]);
        }

        setIsEditMode(true);
        setEditingBillNo(voucherNo);
        setActiveTopAction('edit');
        // console.log('Edit mode activated for voucher:', voucherNo);
        
        // toast.success('Purchase return loaded successfully');
        
      } else {
        console.warn('Invalid response structure');
        showAlertConfirmation('No purchase return data found', null, 'warning');
        toast.warning('No purchase return data found');
      }
    } catch (err) {
      console.error('Error fetching purchase return details:', err);
      console.error('Error response:', err.response);
      showAlertConfirmation(`Failed to load purchase return details: ${err.message}`, null, 'danger');
      toast.error('Failed to load purchase return details');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete purchase return bill
  const deletePurchaseReturnBill = async (voucherNo) => {
    try {
      setIsLoading(true);
      const compCode = userData?.companyCode || '001';
      const username = userData?.username || '';
      
      // console.log('Deleting purchase return bill:', voucherNo);
      
      await axiosInstance.delete(
        API_ENDPOINTS.PURCHASE_RETURN.DELETE_PURCHASE_RETURN(voucherNo, compCode)
      );
      
      // console.log('Purchase return bill deleted successfully');
      
      showAlertConfirmation('Purchase Return deleted successfully', () => {
        createNewForm();
      }, 'success');
      
      toast.error('Purchase Return deleted successfully');
      
    } catch (err) {
      console.error('Error deleting purchase return bill:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete purchase return';
      showAlertConfirmation(`Failed to delete purchase return: ${errorMessage}`, null, 'danger');
      toast.error('Failed to delete purchase return');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for duplicates before saving
  const checkForDuplicates = () => {
    const barcodeCount = {};
    const duplicates = [];
    
    items.forEach(item => {
      if (item.barcode && item.barcode.trim() !== '') {
        if (!barcodeCount[item.barcode]) {
          barcodeCount[item.barcode] = 1;
        } else {
          barcodeCount[item.barcode]++;
          if (!duplicates.includes(item.barcode)) {
            duplicates.push(item.barcode);
          }
        }
      }
    });
    
    return duplicates;
  };

  const fetchNextInvNo = async () => {
    try {
      setIsLoading(true);
      const compCode = (userData && userData.companyCode) ? userData.companyCode : '001';
      const endpoint = API_ENDPOINTS.PURCHASE_RETURN.GET_PURCHASE_RETURNS(compCode);
      const response = await axiosInstance.get(endpoint);
      const nextCode = response?.data?.voucherNo ?? response?.voucherNo;
      if (nextCode) {
        setReturnDetails(prev => ({ ...prev, invNo: nextCode }));
      } else {
        // If no next code, set a placeholder
        setReturnDetails(prev => ({ ...prev, invNo: '' }));
      }
    } catch (err) {
      console.warn('Failed to fetch next invoice number:', err);
      setReturnDetails(prev => ({ ...prev, invNo: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNextInvNo();
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

  // Calculate Totals whenever items change
  useEffect(() => {
    const { net } = calculateTotals(items);
    setNetTotal(net);
  }, [items]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReturnDetails(prev => ({ ...prev, [name]: value }));
  };

  // Handle Enter Key Navigation
  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleAddRow = () => {
    const maxId = items.length > 0 ? Math.max(...items.map(item => item.id)) : 0;
    const newRow = {
      id: maxId + 1,
      barcode: '',
      name: '',
      sub: '',
      stock: 0,
      mrp: 0,
      uom: '',
      hsn: '',
      tax: 0,
      rate: 0,
      qty: 1,
      ovrwt: '',
      avgwt: '',
      prate: 0,
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
      max: '',
    };
    setItems([...items, newRow]);
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id !== id) return item;
      
      const updatedItem = { ...item, [field]: value };
      
      // When barcode is changed, check for duplicates
      if (field === 'barcode' && value.trim() !== '') {
        const duplicateItems = items.filter(item => 
          item.barcode === value.trim() && item.id !== id
        );
        
        if (duplicateItems.length > 0) {
          showAlertConfirmation(
            `Item with barcode "${value}" already exists in the table. Please use a different barcode.`,
            null,
            'warning'
          );
          toast.warning('Duplicate barcode detected');
          return item; // Don't update if duplicate
        }
      }
      
      // Calculate avgwt when ovrwt or qty changes
      if (field === 'ovrwt' || field === 'qty') {
        const ovrwt = parseFloat(updatedItem.ovrwt) || 0;
        const qty = parseFloat(updatedItem.qty) || 1;
        
        if (qty > 0) {
          updatedItem.avgwt = (ovrwt / qty).toFixed(2);
        } else {
          updatedItem.avgwt = '';
        }
      }
      
      // Calculate acost based on uom, prate, qty, and avgwt
      if (field === 'uom' || field === 'prate' || field === 'qty' || field === 'avgwt') {
        const uom = updatedItem.uom?.toUpperCase() || '';
        const prate = parseFloat(updatedItem.prate) || 0;
        const qty = parseFloat(updatedItem.qty) || 0;
        const avgwt = parseFloat(updatedItem.avgwt) || 0;
        
        if (uom === 'PCS') {
          updatedItem.acost = (qty * prate).toFixed(2);
        } else if (uom === 'KG') {
          updatedItem.acost = (avgwt * prate).toFixed(2);
        } else {
          updatedItem.acost = updatedItem.acost || '';
        }
        
        const acost = parseFloat(updatedItem.acost) || 0;
        if (acost > 0) {
          updatedItem.ntCost = updatedItem.acost;
          updatedItem.profitPercent = (acost * 0.05).toFixed(2);
          updatedItem.asRate = (acost + parseFloat(updatedItem.profitPercent)).toFixed(2);
        } else {
          updatedItem.profitPercent = '';
          updatedItem.asRate = '';
          updatedItem.ntCost = '';
        }
      }
      
      if (field === 'acost') {
        const acost = parseFloat(value) || 0;
        if (acost > 0) {
          updatedItem.profitPercent = (acost * 0.05).toFixed(2);
          updatedItem.asRate = (acost + parseFloat(updatedItem.profitPercent)).toFixed(2);
          updatedItem.ntCost = acost.toFixed(2);
        } else {
          updatedItem.profitPercent = '';
          updatedItem.asRate = '';
          updatedItem.ntCost = '';
        }
      }
      
      if (field === 'profitPercent') {
        const acost = parseFloat(updatedItem.acost) || 0;
        const profitPercent = parseFloat(value) || 0;
        
        if (acost > 0) {
          updatedItem.asRate = (acost + profitPercent).toFixed(2);
        } else {
          updatedItem.asRate = '';
        }
      }
      
      if(field === 'acost'|| field === 'sRate') {
        const acost = parseFloat(updatedItem.acost) || 0;
        const sRate = parseFloat(updatedItem.sRate) || 0;
        if(acost > 0) {
          updatedItem.letProfPer = ((acost / sRate) * 100).toFixed(2);
        } else {
          updatedItem.letProfPer = '';
        }
      }
      
      if(field === 'wsPercent' || field === 'ntCost') {
        const wsPercent = parseFloat(updatedItem.wsPercent) || 0;
        const ntCost = parseFloat(updatedItem.ntCost) || 0;
        if(ntCost > 0) {
          updatedItem.wsRate = ((ntCost * wsPercent) / 100).toFixed(2);
        } else {
          updatedItem.wsRate = '';
        }
      }
      
      if(field === 'qty' || field === 'prate' || field === 'intax') {
        const qty = parseFloat(updatedItem.qty) || 0;
        const prate = parseFloat(updatedItem.prate) || 0;
        const intax = parseFloat(updatedItem.intax) || 0;
        if(qty > 0 && prate > 0) {
          updatedItem.amt = ((qty * prate) + intax).toFixed(2);
        } else {
          updatedItem.amt = '';
        }
      }
      
      return updatedItem;
    });
    
    setItems(updatedItems);
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

// Update the handleTableKeyDown function
const handleTableKeyDown = (e, currentRowIndex, currentField) => {
  // Handle / key for item code search popup
  if (e.key === '/') {
    e.preventDefault();
    handleItemCodeSelect(items[currentRowIndex].id, items[currentRowIndex].name);
    return;
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation(); // Prevent form submission or other Enter handlers

    // Fields in the visual order
    const fields = [
      'barcode', 'name', 'uom', 'stock', 'hsn', 'qty', 'ovrwt', 'avgwt',
      'prate', 'intax', 'outtax', 'acost', 'sudo', 'profitPercent', 'preRT', 
      'sRate', 'asRate', 'mrp', 'letProfPer', 'ntCost', 'wsPercent', 'wsRate', 'amt'
    ];

    const currentFieldIndex = fields.indexOf(currentField);

    // If Enter is pressed in the amt field (last field)
    if (currentField === 'amt') {
      // Check if particulars (name) field is empty
      const currentRow = items[currentRowIndex];
      const isParticularsEmpty = !currentRow.name || currentRow.name.trim() === '';

      if (isParticularsEmpty) {
        // Instead of showing confirmation, move focus to add/less field
        e.preventDefault();        
              
        // Move focus to add/less field
        setTimeout(() => {
          if (addLessRef.current) {
            addLessRef.current.focus();
            addLessRef.current.select(); // Optional: select text for easy editing
          }
        }, 50);
        return;
      }
      
      // If particulars is not empty, move to next row or add new row
      // Check if we're on the last row
      if (currentRowIndex < items.length - 1) {
        // Move to next row
        const nextRowInput = document.querySelector(
          `input[data-row="${currentRowIndex + 1}"][data-field="barcode"]`
        );
        if (nextRowInput) {
          nextRowInput.focus();
        }
        return;
      } else {
        // We're on the last row, add new row if particulars is filled
        if (currentRow.name && currentRow.name.trim() !== '') {
          handleAddRow();
          setTimeout(() => {
            const newRowInput = document.querySelector(
              `input[data-row="${items.length}"][data-field="barcode"]`
            );
            if (newRowInput) newRowInput.focus();
          }, 60);
        } else {
          // If last row and particulars empty, move to add/less field
          setTimeout(() => {
            if (addLessRef.current) {
              addLessRef.current.focus();
              addLessRef.current.select();
            }
          }, 50);
        }
        return;
      }
    }

    // Always move to next field if available (for non-amt fields)
    if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
      const nextField = fields[currentFieldIndex + 1];
      
      // Special handling for UOM field which is a div, not an input
      if (nextField === 'uom') {
        const nextInput = document.querySelector(
          `div[data-row="${currentRowIndex}"][data-field="uom"]`
        );
        if (nextInput) {
          nextInput.focus();
          return;
        }
      }
      
      const nextInput = document.querySelector(
        `input[data-row="${currentRowIndex}"][data-field="${nextField}"], 
         select[data-row="${currentRowIndex}"][data-field="${nextField}"]`
      );
      if (nextInput) {
        nextInput.focus();
        return;
      }
    }
  }
};

// Add key handler for add/less field
const handleAddLessKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    
    // Trigger save when Enter is pressed in add/less field
    handleSave();
  }
};

  const handleClear = () => {
    showConfirmation({
      title: 'Clear All',
      message: 'Are you sure you want to clear all fields and create a new purchase return?',
      onConfirm: () => {
        createNewForm();
      },
      type: 'warning',
      confirmText: 'Clear All',
      cancelText: 'Cancel'
    });
  };

  const handleSave = () => {
    try {
      // Check for duplicates
      const duplicates = checkForDuplicates();
      if (duplicates.length > 0) {
        showAlertConfirmation(
          `Duplicate barcodes found: ${duplicates.join(', ')}. Please remove duplicates before saving.`,
          null,
          'warning'
        );
        toast.warning('Duplicate items found. Please remove duplicates before saving.');
        return;
      }

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

      const voucherNo = returnDetails.invNo || '';
      if (!voucherNo) {
        showAlertConfirmation('Please enter an Invoice Number', null, 'warning');
        toast.warning('Please enter an Invoice Number');
        return;
      }

      // Validation: Check required fields
      if (!returnDetails.partyCode || returnDetails.partyCode.trim() === '') {
        showAlertConfirmation('Party Code is required', null, 'warning');
        toast.warning('Party Code is required');
        return;
      }

      if (!returnDetails.customerName || returnDetails.customerName.trim() === '') {
        showAlertConfirmation('Customer Name is required', null, 'warning');
        toast.warning('Customer Name is required');
        return;
      }

      if (!addLessAmount || addLessAmount.trim() === '') {
        showAlertConfirmation('Add/Less Amount is required', null, 'warning');
        toast.warning('Add/Less Amount is required');
        return;
      }

      // if (!returnDetails.mobileNo || returnDetails.mobileNo.trim() === '') {
      //   showAlertConfirmation('Mobile No is required', null, 'warning');
      //   toast.warning('Mobile No is required');
      //   return;
      // }

      // if (!returnDetails.gstno || returnDetails.gstno.trim() === '') {
      //   showAlertConfirmation('GST No is required', null, 'warning');
      //   toast.warning('GST No is required');
      //   return;
      // }

      // Validation: Check if at least one row has item data
      const hasValidItems = items.some(item => 
        item.barcode && item.barcode.trim() !== '' &&
        item.name && item.name.trim() !== ''
      );

      if (!hasValidItems) {
        showAlertConfirmation('Please add at least one item before saving', null, 'warning');
        toast.warning('Please add at least one item before saving');
        return;
      }

      // Filter out empty items
      const validItems = items.filter(item => 
        item.barcode && item.barcode.trim() !== '' &&
        item.name && item.name.trim() !== ''
      );

      if (validItems.length === 0) {
        showAlertConfirmation('No valid items to save', null, 'warning');
        toast.warning('No valid items to save');
        return;
      }

      const voucherDateISO = toISODate(returnDetails.billDate || returnDetails.purDate);

      const totals = calculateTotals(validItems);

      const payload = {
        bledger: {
          customerCode: returnDetails.partyCode || '',
          voucherNo: voucherNo,
          voucherDate: voucherDateISO,
          billAmount: totals.net,
          balanceAmount: totals.net,
          refName: returnDetails.customerName || '',
          compCode: compCode,
          user: username || '001',
          gstType: returnDetails.gstType || 'G',
          transType: returnDetails.transType || 'RETURN',
        },
        iledger: {
          vrNo: voucherNo,
          less: addLessAmount,
          subTotal: totals.subTotal,
          total: totals.total,
          net: totals.net,
          add1: '',
          add2: '',
          cstsNo: returnDetails.gstno || '',
          add3: returnDetails.city || '',
          add4: returnDetails.mobileNo || '',
        },
        items: validItems.map((it) => ({
          itemCode: it.barcode || '',
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
          asRate: toNumber(it.asRate),
          mrp: toNumber(it.mrp),
          letProfPer: toNumber(it.letProfPer),
          ntCost: toNumber(it.ntCost),
          wsPer: toNumber(it.wsPercent),
          amt: toNumber(it.amt),
        })),
      };
      
      const purchaseType = isEditMode ? 'false' : 'true';
      
      console.log(`Saving in ${isEditMode ? 'edit' : 'create'} mode`, JSON.stringify(payload));
      
      showConfirmation({
        title: isEditMode ? 'Update Purchase Return' : 'Create Purchase Return',
        message: `Are you sure you want to ${isEditMode ? 'update' : 'save'} this purchase return with ${validItems.length} item(s)?`,
        onConfirm: async () => {
          setIsLoading(true);
          try {
            const res = await axiosInstance.post(
              isEditMode 
                ? API_ENDPOINTS.PURCHASE_RETURN.UPDATE_PURCHASE_RETURN(purchaseType)
                : API_ENDPOINTS.PURCHASE_RETURN.CREATE_PURCHASE_RETURN(purchaseType), 
              payload
            );
            
            console.log('Save response:', res);
            
            // Close the confirmation popup first
            setShowConfirmPopup(false);
            
            // Show success message and reset form
            showAlertConfirmation(
              `Purchase return ${isEditMode ? 'updated' : 'saved'} successfully with ${validItems.length} item(s)`,
              () => {
                createNewForm();
              },
              'success'
            );
            createNewForm();
            toast.success(`Purchase return ${isEditMode ? 'updated' : 'saved'} successfully.`);
            
          } catch (err) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            const message = typeof data === 'string' ? data : data?.message || data?.error || err?.message;
            console.warn(`Create/Update Purchase Return failed:`, { status, data, err });
            
            showAlertConfirmation(
              `Failed to ${isEditMode ? 'update' : 'save'} purchase return${message ? `: ${message}` : ''}`,
              null,
              'danger'
            );
            toast.error(`Failed to ${isEditMode ? 'update' : 'save'} purchase return.`);
          } finally {
            setIsLoading(false);
          }
        },
        type: 'question',
        confirmText: isEditMode ? 'Update' : 'Save',
        cancelText: 'Cancel',
        showLoading: false
      });
      
    } catch (e) {
      console.warn('Save error:', e);
      showAlertConfirmation('Failed to save purchase return', null, 'danger');
      toast.error('Failed to save purchase return.');
    }
  };

  const handlePrint = () => {
    showAlertConfirmation('Print functionality to be implemented', null, 'info');
    toast.info('Print functionality to be implemented');
  };

  // Handle delete row
  const handleDeleteRow = (id) => {
    if (items.length <= 1) {
      showAlertConfirmation("Cannot delete the last row", null, 'warning');
      toast.warning("Cannot delete the last row");
      return;
    }
    
    showConfirmation({
      title: 'Delete Row',
      message: 'Are you sure you want to delete this row?',
      onConfirm: () => {
        setItems(items.filter(item => item.id !== id));        
        toast.success('Row deleted successfully');
      },
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
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
      fetchPurchaseReturnDetails(selectedBill.voucherNo);
    } else if (popupMode === 'delete') {
      showConfirmation({
        title: 'Delete Purchase Return',
        message: `Are you sure you want to delete Purchase Return ${selectedBill.voucherNo}? This action cannot be undone.`,
        onConfirm: () => {
          deletePurchaseReturnBill(selectedBill.voucherNo);
        },
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      });
    }
    
    setShowBillListPopup(false);
    setPopupMode('');
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
      // borderColor: '#1B91DA !important',
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
      gap: '5px',
      marginBottom: 5,
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
    // UOM specific styles (same as SalesInvoice)
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
    netBox: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: screenSize.isMobile ? TYPOGRAPHY.fontSize.base : screenSize.isTablet ? TYPOGRAPHY.fontSize.lg : TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.tight,
      color: '#1B91DA',
      padding: screenSize.isMobile ? '6px 12px' : screenSize.isTablet ? '10px 20px' : '12px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '12px' : screenSize.isTablet ? '20px' : '32px',
      minWidth: 'max-content',
      justifyContent: 'center',
      width: screenSize.isMobile ? '100%' : 'auto',
      order: screenSize.isMobile ? 1 : 0,
      borderRadius: screenSize.isMobile ? '4px' : '6px',
      backgroundColor: '#f0f8ff',
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
    totalsRow: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#FFE8E8',
      borderTop: '2px solid #1B91DA',
    },
    addLessContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '6px' : '8px',
      marginRight: screenSize.isMobile ? '0' : '15px',
      order: screenSize.isMobile ? 2 : 0,
      marginTop: screenSize.isMobile ? '5px' : '0',
      width: screenSize.isMobile ? '100%' : 'auto',
      justifyContent: screenSize.isMobile ? 'center' : 'flex-start'
    },
    addLessLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#333',
      whiteSpace: 'nowrap'
    },
    addLessInput: {
      width: screenSize.isMobile ? '120px' : '150px',
      border: '1px solid #1B91DA',
      borderRadius: '4px',
      padding: screenSize.isMobile ? '6px 10px' : '8px 12px',
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
      width: screenSize.isMobile ? '120px' : '150px',
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
  };

  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (screenSize.isMobile) {
      return 'repeat(2, 1fr)';
    } else if (screenSize.isTablet) {
      return 'repeat(4, 1fr)';
    } else {
      return 'repeat(6, 1fr)';
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
          {/* Return No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Inv No:</label>
            <input
              type="text"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'invNo' && styles.focusedInput)
              }}
              value={returnDetails.invNo}
              name="invNo"
              readOnly={isEditMode}
              ref={returnNoRef}
              onKeyDown={(e) => handleKeyDown(e, dateRef)}
              onFocus={() => setFocusedField('invNo')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Return Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill Date:</label>
            <input
              type="date"
              style={{
                ...styles.inlineInput,
                padding: screenSize.isMobile ? '6px 8px' : '8px 10px',
                ...(focusedField === 'billDate' && styles.focusedInput)
              }}
              value={returnDetails.billDate}
              name="billDate"
              onChange={handleInputChange}
              ref={dateRef}
              onKeyDown={(e) => handleKeyDown(e, amountRef)}
              onFocus={() => setFocusedField('billDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Amount */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Amount:</label>
            <input
              type="text"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'amount' && styles.focusedInput)
              }}
              value={returnDetails.amount}
              name="amount"
              onChange={handleInputChange}
              ref={amountRef}
              onKeyDown={(e) => handleKeyDown(e, invoiceNoRef)}
              onFocus={() => setFocusedField('amount')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Original Invoice No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Invoice No:</label>
            <div style={{ position: 'relative', display: 'flex', flex: 1 }}>            
              <input
                type="text"
                name="originalInvoiceNo"
                style={{
                  ...styles.inlineInput,
                  flex: 1,
                  paddingRight: '40px',
                  ...(focusedField === 'originalInvoiceNo' && styles.focusedInput)
                }}
                value={returnDetails.originalInvoiceNo}            
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange(e);
                  
                  if (value.length > 0) {
                    setItemSearchTerm(value);
                    fetchInvoiceBillList();
                  }
                }}
                ref={invoiceNoRef}
                onKeyDown={(e) => {
                  if (e.key === '/' || e.key === 'F2') {
                    e.preventDefault();
                    setItemSearchTerm(returnDetails.originalInvoiceNo);
                    fetchInvoiceBillList();
                  } else if (e.key === 'Enter') {
                    handleKeyDown(e, invoiceDateRef);
                  }
                }}
                onFocus={() => setFocusedField('originalInvoiceNo')}
                onBlur={() => setFocusedField('')}
              />
              
              <button
                type="button"
                aria-label="Search invoice"
                title="Search invoice"
                onClick={fetchInvoiceBillList}
                style={{
                  position: 'absolute',
                  right: '4px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: screenSize.isMobile ? '24px' : '28px',
                  width: screenSize.isMobile ? '24px' : '28px',
                  padding: 0,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: screenSize.isMobile ? '14px' : '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Search size={16} />
              </button>
            </div>
          </div>

          {/* Original Invoice Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Inv Date:</label>
            <input
              type="date"
              name="originalInvoiceDate"
              style={{
                ...styles.inlineInput,
                padding: screenSize.isMobile ? '6px 8px' : '8px 10px',
                ...(focusedField === 'originalInvoiceDate' && styles.focusedInput)
              }}
              value={returnDetails.originalInvoiceDate}
              onChange={handleInputChange}
              ref={invoiceDateRef}
              onKeyDown={(e) => handleKeyDown(e, invoiceAmountRef)}
              onFocus={() => setFocusedField('originalInvoiceDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Original Invoice Amount */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Original Amt:</label>
            <input
              type="text"
              name="originalInvoiceAmount"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'originalInvoiceAmount' && styles.focusedInput)
              }}
              value={returnDetails.originalInvoiceAmount}
              onChange={handleInputChange}
              ref={invoiceAmountRef}
              onKeyDown={(e) => handleKeyDown(e, partyCodeRef)}
              onFocus={() => setFocusedField('originalInvoiceAmount')}
              onBlur={() => setFocusedField('')}
            />
          </div>
        </div>

        {/* ROW 2 */}
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
        }}>
          {/* Party Code */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Party Code:</label>
            <input
              type="text"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'partyCode' && styles.focusedInput)
              }}
              value={returnDetails.partyCode}
              name="partyCode"
              onChange={handleInputChange}
              ref={partyCodeRef}
              onKeyDown={(e) => handleKeyDown(e, customerNameRef)}
              onFocus={() => setFocusedField('partyCode')}
              onBlur={() => setFocusedField('')}
              readOnly
            />
          </div>

          {/* Customer Name */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Name:</label>
            <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
              <input
                type="text"
                ref={customerNameRef}
                style={{
                  ...styles.inlineInput,
                  flex: 1,
                  paddingRight: '40px',
                  ...(focusedField === 'customerName' && styles.focusedInput)
                }}
                value={returnDetails.customerName}
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
                    setItemSearchTerm(returnDetails.customerName);
                    setShowSupplierPopup(true);
                  } else if (e.key === 'Enter') {
                    handleKeyDown(e, cityRef);
                  }
                }}
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
                  padding: 0,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: screenSize.isMobile ? '14px' : '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Search size={16} />
              </button>
            </div>
          </div>

          {/* City */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>City:</label>
            <input
              type="text"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'city' && styles.focusedInput)
              }}
              value={returnDetails.city}
              name="city"
              onChange={handleInputChange}
              ref={cityRef}
              onKeyDown={(e) => handleKeyDown(e, transTypeRef)}
              onFocus={() => setFocusedField('city')}
              onBlur={() => setFocusedField('')}
              readOnly
            />
          </div>

          {/* Trans Type */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Trans Type:</label>
            <select
              name="transType"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'transType' && styles.focusedInput)
              }}
              value={returnDetails.transType}
              onChange={handleInputChange}
              ref={transTypeRef}
              onKeyDown={(e) => handleKeyDown(e, mobileRef)}
              onFocus={() => setFocusedField('transType')}
              onBlur={() => setFocusedField('')}
            >
              <option value="RETURN">RETURN</option>
              <option value="REFUND">REFUND</option>
              <option value="CREDIT_NOTE">CREDIT NOTE</option>
            </select>
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
              value={returnDetails.mobileNo}
              name="mobileNo"
              onChange={handleInputChange}
              ref={mobileRef}
              onKeyDown={(e) => handleKeyDown(e, gstTypeRef)}
              onFocus={() => setFocusedField('mobileNo')}
              onBlur={() => setFocusedField('')}
            />
          </div>
        </div>

        {/* ROW 3 */}
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
          marginBottom: '0',
        }}>
          {/* GST Type */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>GST Type:</label>
            <select
              name="gstType"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'gstType' && styles.focusedInput)
              }}
              value={returnDetails.gstType || 'G'}
              onChange={handleInputChange}
              ref={gstTypeRef}
              onKeyDown={(e) => handleKeyDown(e, gstNoRef)}
              onFocus={() => setFocusedField('gstType')}
              onBlur={() => setFocusedField('')}
            >
              <option value="G">CGST/SGST</option>
              <option value="I">IGST</option>
            </select>
          </div>

          {/* GST No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>GST No:</label>
            <input
              type="text"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'gstno' && styles.focusedInput)
              }}
              value={returnDetails.gstno}
              name="gstno"
              onChange={handleInputChange}
              ref={gstNoRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Focus on the first row's barcode field
                  if (items.length > 0 && firstRowBarcodeRef.current) {
                    firstRowBarcodeRef.current.focus();
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

          {/* Is Ledger Checkbox */}
          <div style={{
            ...styles.formField,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '8px',
            height: '40px',
          }}>
            <label style={{ ...styles.inlineLabel, marginBottom: 0 }}>Is Ledger?</label>
            <input
              type="checkbox"
              checked={returnDetails.isLedger}
              onChange={(e) => setReturnDetails(prev => ({ ...prev, isLedger: e.target.checked }))}
              style={{ width: 18, height: 18 }}
              id="isLedger"
            />
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
                <th style={styles.th}>PCode</th>
                <th style={{ ...styles.th, ...styles.itemNameContainer, textAlign: 'left' }}>Particulars</th>
                <th style={styles.th}>UOM</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>HSN</th>
                <th style={styles.th}>RT Qty</th>
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
                <th style={styles.th}>Amt</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} style={{ backgroundColor: 'white' }}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    <input
                      ref={index === 0 ? firstRowBarcodeRef : null}
                      style={focusedField === `barcode-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.barcode}
                      data-row={index}
                      data-field="barcode"
                      onChange={(e) => handleItemChange(item.id, 'barcode', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'barcode')}
                      onFocus={() => setFocusedField(`barcode-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                      title="Click to select item from list"
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
                          if (e.key === '/') {
                            e.preventDefault();
                            handleItemCodeSelect(item.id, item.name);
                          } else if (e.key === 'Enter') {
                            handleTableKeyDown(e, index, 'name');
                          }
                        }}
                        onFocus={() => setFocusedField(`name-${item.id}`)}
                        onBlur={() => setFocusedField('')}
                        title="Click to select item from list"
                      />
                      <button
                        type="button"
                        aria-label="Search item details"
                        title="Click to select item from list"
                        onClick={() => {
                          handleItemCodeSelect(item.id, item.name);
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
                        onKeyDown={(e) => handleUomSpacebar(e, item.id, index)}
                        tabIndex={0}
                        onFocus={() => {
                          setFocusedField(`uom-${item.id}`);
                          setFocusedUomField(item.id);
                        }}
                        onBlur={() => {
                          setFocusedField('');
                          setFocusedUomField(null);
                        }}
                        title="Press Space or Click to toggle units, Enter to move to Stock"
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
                      style={focusedField === `stock-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.stock}
                      data-row={index}
                      data-field="stock"
                      onChange={(e) => handleItemChange(item.id, 'stock', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'stock')}
                      onFocus={() => setFocusedField(`stock-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `hsn-${item.id}` ? styles.editableInputFocused : styles.editableInput}
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
                      style={focusedField === `qty-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.qty}
                      data-row={index}
                      data-field="qty"
                      onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                      onFocus={() => setFocusedField(`qty-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `ovrwt-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.ovrwt || ''}
                      data-row={index}
                      data-field="ovrwt"
                      onChange={(e) => handleItemChange(item.id, 'ovrwt', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'ovrwt')}
                      onFocus={() => setFocusedField(`ovrwt-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `avgwt-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.avgwt || ''}
                      data-row={index}
                      data-field="avgwt"
                      onChange={(e) => handleItemChange(item.id, 'avgwt', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'avgwt')}
                      onFocus={() => setFocusedField(`avgwt-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `prate-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.prate || ''}
                      data-row={index}
                      data-field="prate"
                      onChange={(e) => handleItemChange(item.id, 'prate', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'prate')}
                      onFocus={() => setFocusedField(`prate-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `intax-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.intax || ''}
                      data-row={index}
                      data-field="intax"
                      onChange={(e) => {
                        const value = e.target.value;
                        const validTaxValues = ['3', '5', '12', '18', '40'];
                        if (value === '' || /^[0-9]*$/.test(value)) {
                          handleItemChange(item.id, 'intax', value);
                        }
                      }}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'intax')}
                      onFocus={() => setFocusedField(`intax-${item.id}`)}
                      onBlur={(e) => {
                        const value = e.target.value;
                        const validTaxValues = ['3', '5', '12', '18', '40'];
                        if (value !== '' && !validTaxValues.includes(value)) {
                          showAlertConfirmation(
                            'Invalid tax value. Please enter 3, 5, 12, 18, or 40',
                            () => {
                              handleItemChange(item.id, 'intax', '');
                            },
                            'warning'
                          );
                        }
                      }}
                      // onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `outtax-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.outtax || ''}
                      data-row={index}
                      data-field="outtax"
                      onChange={(e) => handleItemChange(item.id, 'outtax', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'outtax')}
                      onFocus={() => setFocusedField(`outtax-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `acost-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.acost || ''}
                      data-row={index}
                      data-field="acost"
                      onChange={(e) => handleItemChange(item.id, 'acost', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'acost')}
                      onFocus={() => setFocusedField(`acost-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `sudo-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.sudo || ''}
                      data-row={index}
                      data-field="sudo"
                      onChange={(e) => handleItemChange(item.id, 'sudo', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'sudo')}
                      onFocus={() => setFocusedField(`sudo-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `profitPercent-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.profitPercent || ''}
                      data-row={index}
                      data-field="profitPercent"
                      onChange={(e) => handleItemChange(item.id, 'profitPercent', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'profitPercent')}
                      onFocus={() => setFocusedField(`profitPercent-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `preRT-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.preRT || ''}
                      data-row={index}
                      data-field="preRT"
                      onChange={(e) => handleItemChange(item.id, 'preRT', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'preRT')}
                      onFocus={() => setFocusedField(`preRT-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `sRate-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.sRate || ''}
                      data-row={index}
                      data-field="sRate"
                      onChange={(e) => handleItemChange(item.id, 'sRate', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'sRate')}
                      onFocus={() => setFocusedField(`sRate-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `asRate-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.asRate || ''}
                      data-row={index}
                      data-field="asRate"
                      onChange={(e) => handleItemChange(item.id, 'asRate', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'asRate')}
                      onFocus={() => setFocusedField(`asRate-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `mrp-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.mrp}
                      data-row={index}
                      data-field="mrp"
                      onChange={(e) => handleItemChange(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'mrp')}
                      onFocus={() => setFocusedField(`mrp-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  
                  <td style={styles.td}>
                    <input
                      style={focusedField === `letProfPer-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.letProfPer || ''}
                      data-row={index}
                      data-field="letProfPer"
                      onChange={(e) => handleItemChange(item.id, 'letProfPer', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'letProfPer')}
                      onFocus={() => setFocusedField(`letProfPer-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `ntCost-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.ntCost || ''}
                      data-row={index}
                      data-field="ntCost"
                      onChange={(e) => handleItemChange(item.id, 'ntCost', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'ntCost')}
                      onFocus={() => setFocusedField(`ntCost-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `wsPercent-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.wsPercent || ''}
                      data-row={index}
                      data-field="wsPercent"
                      onChange={(e) => handleItemChange(item.id, 'wsPercent', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'wsPercent')}
                      onFocus={() => setFocusedField(`wsPercent-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `wsRate-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.wsRate || ''}
                      data-row={index}
                      data-field="wsRate"
                      onChange={(e) => handleItemChange(item.id, 'wsRate', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'wsRate')}
                      onFocus={() => setFocusedField(`wsRate-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `amt-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.amt || ''}
                      data-row={index}
                      data-field="amt"
                      onChange={(e) => handleItemChange(item.id, 'amt', e.target.value)}
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
        </div>
      </div>

      {/* --- FOOTER SECTION --- */}
      <div style={styles.footerSection}>
        <div style={styles.rightColumn}>
          <ActionButtons 
            activeButton={activeTopAction} 
            onButtonClick={(type) => {
              // console.log("Top action clicked:", type);
              setActiveTopAction(type);
              if (type === 'add') handleClear();
              else if (type === 'edit') handleEdit();
              else if (type === 'delete') handleDelete();
            }}         
          >
            <AddButton buttonType="add" disabled={!formPermissions.add}/>
            <EditButton buttonType="edit" disabled={!formPermissions.edit}/>
            <DeleteButton buttonType="delete" disabled={!formPermissions.delete} />
          </ActionButtons>
        </div>
        <div style={styles.addLessContainer}>
          <span style={styles.addLessLabel}>Add/Less:</span>
          <input
            type="text"
            style={focusedField === 'addLess' ? styles.addLessInputFocused : styles.addLessInput}
            value={addLessAmount}
            // onChange={handleNumberInput}
            onChange={(e) => handleNumberInput(e)}
            onKeyDown={handleAddLessKeyDown}
            ref={addLessRef}            
            onFocus={() => setFocusedField('addLess')}
            onBlur={handleBlur}
            inputMode="decimal"
          />
        </div>
        <div style={styles.netBox}>
          <span>Total Return Amount:</span>
          <span>₹ {netTotal.toFixed(2)}</span>
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

      {/* Purchase Return Bill List Popup for Edit/Delete */}
      <PopupListSelector
        open={showBillListPopup}
        onClose={() => {
          setShowBillListPopup(false);
          setPopupMode('');
          setBillListSearchTerm('');
        }}
        title={popupMode === 'edit' ? 'Select Purchase Return to Edit' : 'Select Purchase Return to Delete'}
        fetchItems={fetchBillList}
        displayFieldKeys={['voucherNo']}
        headerNames={['Bill No']}
        searchFields={['voucherNo']}
        columnWidths={{ voucherNo: '100%' }}
        searchPlaceholder="Search by bill no..."
        initialSearch={billListSearchTerm}
        onSelect={handleBillSelect}
      />

      {/* Invoice Bill List Popup */}
      <PopupListSelector
        open={showInvoiceBillListPopup}
        onClose={() => setShowInvoiceBillListPopup(false)}
        title="Select Purchase Invoice"
        fetchItems={async () => invoiceBillList}
        displayFieldKeys={['billno']}
        headerNames={['Invoice No']}
        searchFields={['billno']}
        columnWidths={{ billno: '100%' }}
        searchPlaceholder="Search invoice number..."
        onSelect={handleInvoiceBillSelect}
      />

      {/* Bill Details Popup with Item Checkboxes */}
      <Modal
        title={`Purchase Invoice Items - ${selectedBillForDetails}`}
        open={billDetailsPopupOpen}
        onCancel={handleClearBillNumber}
        width={800}
        footer={[
          <button
            key="cancel"
            onClick={handleClearBillNumber}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #d9d9d9',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>,
          <button
            key="apply"
            onClick={handleApplyBillNumber}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Apply Selected Items
          </button>,
        ]}
      >
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search items..."
            value={billDetailsSearchText}
            onChange={(e) => setBillDetailsSearchText(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        <div
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #d9d9d9' }}>
                <th style={{ padding: '8px', textAlign: 'center', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={
                      getFilteredBillItems().length > 0 &&
                      getFilteredBillItems().every(item => checkedBills[item.itemCode || item.id])
                    }
                    onChange={(e) => {
                      const newChecked = {};
                      getFilteredBillItems().forEach(item => {
                        newChecked[item.itemCode || item.id] = e.target.checked;
                      });
                      setCheckedBills(prev => ({ ...prev, ...newChecked }));
                    }}
                  />
                </th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Item Code</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Item Name</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredBillItems().map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={checkedBills[item.itemCode || item.id] || false}
                      onChange={(e) => {
                        setCheckedBills(prev => ({
                          ...prev,
                          [item.itemCode || item.id]: e.target.checked,
                        }));
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>{item.itemCode || ''}</td>
                  <td style={{ padding: '8px' }}>{item.itemName || item.name || ''}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{item.qty || 0}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹ {parseFloat(item.rate || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {getFilteredBillItems().length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
              No items found
            </div>
          )}
        </div>
      </Modal>

      {/* Item Code Popup for Particulars/Items */}
      <PopupListSelector
        open={showItemCodePopup}
        onClose={() => {
          setShowItemCodePopup(false);
          setItemSearchTerm('');
        }}
        title="Select Item Code (Particulars)"
        fetchItems={(pageNum = 1, search = '') => fetchItemCodeList(search || itemSearchTerm)}
        displayFieldKeys={['barcode','name']}
        headerNames={['Barcode','Name']}
        searchFields={['barcode','name']}
        columnWidths={{ barcode: '50%', name: '50%' }}
        searchPlaceholder="Search by barcode or name..."
        initialSearch={itemSearchTerm}
        onSelect={handleItemCodeSelection}
      />

      {/* Supplier Popup */}
      <PopupListSelector
        open={showSupplierPopup}
        onClose={() => { 
          setShowSupplierPopup(false); 
          setItemSearchTerm('');
          setSupplierSearchTerm('');
        }}
        title="Select Supplier"
        fetchItems={fetchSupplierItems}
        displayFieldKeys={['code','name','city','phone']}
        headerNames={['Code','Name','City','Phone']}
        searchFields={['code','name','city','phone']}
        columnWidths={{ code: '20%', name: '40%', city: '20%', phone: '20%' }}
        searchPlaceholder="Search supplier..."
        initialSearch={itemSearchTerm || supplierSearchTerm}
        onSelect={(s) => {
          setReturnDetails(prev => ({
            ...prev,
            partyCode: s.code || '',
            customerName: s.name || '',
            city: s.city || '',
            mobileNo: s.phone || ''
          }));
        }}
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
    </div>
  );
};

export default PurchaseReturn;