import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { toast } from 'react-toastify';
import PopupListSelector from '../../components/Listpopup/PopupListSelector.jsx';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup.jsx';


const PurchaseReturn = () => {
  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('add');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBillNo, setEditingBillNo] = useState('');
  
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
  
  const [showBillListPopup, setShowBillListPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('');
  
  // Invoice Number Popup State
  const [showInvoiceBillListPopup, setShowInvoiceBillListPopup] = useState(false);
  const [invoiceBillList, setInvoiceBillList] = useState([]);
  const [invoiceBillListLoading, setInvoiceBillListLoading] = useState(false);
  
  // Supplier Popup State
  const [showSupplierPopup, setShowSupplierPopup] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  
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
    transType: 'PURCHASE',
    city: '',
    isLedger: false,
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
  const barcodeRef = useRef(null);
  const addBtnRef = useRef(null);

  // Track which top-section field is focused to style active input
  const [focusedField, setFocusedField] = useState('');

  // Footer action active state
  const [activeFooterAction, setActiveFooterAction] = useState('all');

  // Loading state for async operations
  const [isLoading, setIsLoading] = useState(false);

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
      setActiveFooterAction('all');
      setFocusedField('');
      setShowBillListPopup(false);
      setPopupMode('');
      
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
        transType: 'PURCHASE',
        city: '',
        isLedger: false,
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
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch purchase return bill list for popup
  // Fetch purchase return bill list for popup - Using BillNumbers endpoint
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
      console.log('Fetching item details for code:', itemCode);
      
      const response = await axiosInstance.get(API_ENDPOINTS.PURCHASE_INVOICE.GET_ITEM_CODE_LIST);
      const allItems = response?.data || [];
      
      console.log('All items from API:', allItems);
      
      if (!Array.isArray(allItems) || allItems.length === 0) {
        console.warn('No items returned from API');
        return [];
      }
      
      const matchedItem = allItems.find(item => 
        (item.itemCode || item.code) === itemCode
      );
      
      console.log('Matched item:', matchedItem);
      
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
      
      console.log('Stock API response:', stockData);
      console.log('Item Details API response:', itemDetails);
      
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

  // Handle applying selected bill items to purchase return form
  const handleApplyBillNumber = async () => {
    try {
      const billData = billDetailsData[selectedBillForDetails] || [];
      const selectedItems = billData.filter(item => checkedBills[item.itemCode || item.id]);
      
      if (selectedItems.length === 0) {
        showAlertConfirmation('Please select at least one item', null, 'warning');
        return;
      }
      
      // Update return details with invoice info
      setReturnDetails(prev => ({
        ...prev,
        originalInvoiceNo: selectedBillForDetails,
        invoiceNo: selectedBillForDetails,
      }));
      
      // Add selected items to the items table
      const newItems = selectedItems.map((item, index) => ({
        id: items.length + index + 1,
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
        min: item.min || '',
        max: item.max || '',
      }));
      
      setItems([...items, ...newItems]);
      setBillDetailsPopupOpen(false);
      setCheckedBills({});
      setBillDetailsSearchText('');
      
      showAlertConfirmation(`${newItems.length} item(s) added to return`, null, 'success');
    } catch (err) {
      console.error('Error applying bill items:', err);
      showAlertConfirmation('Error applying bill items', null, 'error');
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
      
      console.log('Fetching purchase return details for:', voucherNo);
      
      const response = await axiosInstance.get(
        API_ENDPOINTS.PURCHASE_RETURN.GET_PURCHASE_VOUCHER_DETAILS(voucherNo)
      );
      
      console.log('Purchase return details response:', response.data);
      
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
          transType: 'PURCHASE',
        };
        
        console.log('Setting header details:', headerDetails);
        setReturnDetails(prev => ({ ...prev, ...headerDetails }));

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
            min: '',
            max: '',
          }]);
        }

        setIsEditMode(true);
        setEditingBillNo(voucherNo);
        setActiveTopAction('edit');
        console.log('Edit mode activated for voucher:', voucherNo);
        
      } else {
        console.warn('Invalid response structure');
        showAlertConfirmation('No purchase return data found', null, 'warning');
      }
    } catch (err) {
      console.error('Error fetching purchase return details:', err);
      console.error('Error response:', err.response);
      showAlertConfirmation(`Failed to load purchase return details: ${err.message}`, null, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete purchase return bill
  const deletePurchaseReturnBill = async (voucherNo) => {
    try {
      setIsLoading(true);
      const compCode = userData?.companyCode || '001';
      
      console.log('Deleting purchase return bill:', voucherNo);
      
      await axiosInstance.delete(
        API_ENDPOINTS.PURCHASE_RETURN.DELETE_PURCHASE_RETURN(voucherNo, compCode)
      );
      
      console.log('Purchase return bill deleted successfully');
      showAlertConfirmation('Purchase Return deleted successfully', () => {
        createNewForm();
      }, 'success');
      
    } catch (err) {
      console.error('Error deleting purchase return bill:', err);
      showAlertConfirmation(`Failed to delete purchase return: ${err.message}`, null, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Edit button click
  const handleEdit = () => {
    setPopupMode('edit');
    setShowBillListPopup(true);
  };

  // Handle Delete button click
  const handleDeleteBill = () => {
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

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate Totals whenever items change
  useEffect(() => {
    const total = items.reduce((acc, item) => acc + (parseFloat(item.rate) || 0) * (parseFloat(item.qty) || 0), 0);
    setNetTotal(total);
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

  const handleAddItem = () => {
    if (!returnDetails.barcodeInput) return alert("Please enter barcode");

    const newItem = {
      id: items.length + 1,
      barcode: returnDetails.barcodeInput,
      name: 'Item Name', // Static data
      sub: 'Item Description',
      stock: 100,
      mrp: 500,
      uom: 'PCS',
      hsn: 'HSCODE',
      tax: 18,
      rate: 400,
      qty: 1,
    };

    setItems([...items, newItem]);
    setReturnDetails(prev => ({ ...prev, barcodeInput: '' }));
    if (barcodeRef.current) barcodeRef.current.focus();
  };

  const handleAddRow = () => {
    const newRow = {
      id: items.length + 1,
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
      min: '',
      max: '',
    };
    setItems([...items, newRow]);
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleTableKeyDown = (e, currentRowIndex, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Fields in the visual order
      const fields = [
        'barcode', 'name', 'uom', 'stock', 'hsn', 'qty', 'ovrwt', 'avgwt',
        'prate', 'intax', 'outtax', 'acost', 'sudo', 'profitPercent', 'preRT', 'sRate', 'asRate',
        'mrp', 'letProfPer', 'ntCost', 'wsPercent', 'wsRate', 'min', 'max'
      ];

      const currentFieldIndex = fields.indexOf(currentField);

      // Move to next field in current row
      if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        const nextInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="${nextField}"]`);
        if (nextInput) {
          nextInput.focus();
          return;
        }
      }

      // When on last field, check if item is selected before moving to next row
      if (currentField === 'max') {
        const currentItem = items[currentRowIndex];

        // 🚫 BLOCK if item name or barcode not selected
        if (!currentItem.barcode || !currentItem.name || currentItem.name.trim() === '') {
          toast.warning('Select item before moving to next row');
          return;
        }

        // Move to next row
        if (currentRowIndex < items.length - 1) {
          const nextInput = document.querySelector(
            `input[data-row="${currentRowIndex + 1}"][data-field="barcode"]`
          );
          if (nextInput) {
            nextInput.focus();
            return;
          }
        } else {
          // Only add new row if item is properly filled
          handleAddRow();
          setTimeout(() => {
            const newRowInput = document.querySelector(
              `input[data-row="${items.length}"][data-field="barcode"]`
            );
            if (newRowInput) newRowInput.focus();
          }, 80);
        }
      }
    }
  };

  const handleDeleteRowFromTable = () => {
    if (items.length > 0) {
      setItems(items.slice(0, -1));
    }
  };

  const handleDeleteRow = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      alert("Cannot delete the last row");
    }
  };

  const handleClear = () => {
    // Keep a single empty row after clearing
    setItems([
      {
        id: 1,
        barcode: '',
        name: '',
        sub: '',
        stock: 0,
        mrp: 0,
        uom: '',
        hsn: '',
        tax: 0,
        rate: 0,
        qty: 0,
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
        min: '',
        max: '',
      }
    ]);
    setReturnDetails({ ...returnDetails, barcodeInput: '' });
  };

  // Check if first row is empty and fetch bill if needed
  const checkAndFetchFirstRowBill = async () => {
    try {
      const firstItem = items[0];
      
      // Check if first row is empty (no barcode/name)
      if (!firstItem || (!firstItem.barcode && !firstItem.name)) {
        // First row is empty, try to fetch the purchase bill
        if (returnDetails.invoiceNo || returnDetails.purNo) {
          const billNo = returnDetails.invoiceNo || returnDetails.purNo;
          
          try {
            // Fetch purchase invoice items
            const response = await axiosInstance.get(
              API_ENDPOINTS.PURCHASE_RETURN.GET_PURCHASE_ITEMS_BY_VOUCHER(billNo)
            );
            
            const billData = response?.data?.data || [];
            
            if (billData && billData.length > 0) {
              // Use first item from the bill to populate the first row
              const firstBillItem = billData[0];
              
              const updatedFirstItem = {
                ...firstItem,
                barcode: firstBillItem.itemCode || '',
                name: firstBillItem.itemName || '',
                qty: firstBillItem.qty || 1,
                rate: parseFloat(firstBillItem.pRate) || 0,
                prate: parseFloat(firstBillItem.pRate) || 0,
                uom: firstBillItem.unit || '',
                hsn: firstBillItem.hsn || '',
                mrp: firstBillItem.mrp || 0,
                inTax: firstBillItem.inTax || 0,
                outTax: firstBillItem.outTax || 0,
                acost: firstBillItem.aCost || 0,
                ovrwt: firstBillItem.ovrWt || 0,
                avgwt: firstBillItem.avgWt || 0,
              };
              
              // Update items with the populated first row
              const updatedItems = [updatedFirstItem, ...items.slice(1)];
              setItems(updatedItems);
              
              return updatedItems;
            }
          } catch (err) {
            console.warn('Could not fetch purchase bill for first row:', err);
          }
        }
      }
      
      return items;
    } catch (err) {
      console.error('Error checking first row:', err);
      return items;
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Check if first row is empty and fetch bill if needed
      const finalItems = await checkAndFetchFirstRowBill();

      // Calculate totals
      const subTotal = finalItems.reduce((sum, item) => sum + ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)), 0);
      const total = subTotal;
      const balanceAmount = subTotal;

      // Prepare return data according to API schema
      const purchaseReturnPayload = {
        invNo: returnDetails.invNo || '',
        bledger: {
          customerCode: returnDetails.partyCode || '',
          voucherNo: returnDetails.purNo || '',
          voucherDate: returnDetails.purDate || new Date().toISOString(),
          billAmount: total,
          balanceAmount: balanceAmount,
          subTotal: subTotal,
          refName: returnDetails.customerName || '',
          compCode: userData?.companyCode || '',
          user: userData?.username || '',
          gstType: returnDetails.gstType || 'G'
        },
        iledger: {
          vrNo: returnDetails.invoiceNo || '',
          less: 0,
          subTotal: subTotal,
          total: total,
          net: total,
          add1: returnDetails.city || '',
          add2: '',
          cstsNo: returnDetails.gstno || '',
          add3: '',
          add4: ''
        },
        items: finalItems.map(item => ({
          itemCode: item.barcode || '',
          qty: parseFloat(item.qty) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0),
          fTax: parseFloat(item.tax) || 0,
          wRate: 0,
          fid: item.id?.toString() || '',
          fUnit: item.uom || '',
          fhsn: item.hsn || '',
          ovrWt: parseFloat(item.ovrwt) || 0,
          avgWt: parseFloat(item.avgwt) || 0,
          inTax: parseFloat(item.intax) || 0,
          outTax: parseFloat(item.outtax) || 0,
          acost: parseFloat(item.acost) || 0,
          sudo: item.sudo || '',
          profitPercent: parseFloat(item.profitPercent) || 0,
          preRate: parseFloat(item.preRT) || 0,
          sRate: parseFloat(item.sRate) || 0,
          asRate: parseFloat(item.asRate) || 0,
          mrp: parseFloat(item.mrp) || 0,
          letProfPer: parseFloat(item.letProfPer) || 0,
          ntCost: parseFloat(item.ntCost) || 0,
          wsPer: parseFloat(item.wsPercent) || 0
        }))
      };

      console.log('Purchase Return Payload:', purchaseReturnPayload);

      // Call API based on edit mode
      const endpoint = isEditMode 
        ? API_ENDPOINTS.PURCHASE_RETURN.UPDATE_PURCHASE_RETURN(false)
        : API_ENDPOINTS.PURCHASE_RETURN.CREATE_PURCHASE_RETURN(true);

      const response = await axiosInstance.post(endpoint, purchaseReturnPayload);

      if (response.status === 200 || response.status === 201) {
        showAlertConfirmation('Purchase Return saved successfully!', () => {
          createNewForm();
        });
      }

    } catch (error) {
      console.error('Error saving purchase return:', error);
      showAlertConfirmation(error.response?.data?.message || 'Failed to save purchase return', null, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    // Print logic here
    const printContent = `
      <html>
        <head>
          <title>Purchase Return - ${returnDetails.returnNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 20px; }
            .details table { width: 100%; border-collapse: collapse; }
            .details td { padding: 5px; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
            .footer { margin-top: 50px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Purchase Return</h2>
            <h3>Return No: ${returnDetails.returnNo}</h3>
          </div>
          <div class="details">
            <table>
              <tr><td><strong>Return Date:</strong></td><td>${returnDetails.returnDate}</td></tr>
              <tr><td><strong>Customer Name:</strong></td><td>${returnDetails.customerName}</td></tr>
              <tr><td><strong>Party Code:</strong></td><td>${returnDetails.partyCode}</td></tr>
              <tr><td><strong>Original Invoice No:</strong></td><td>${returnDetails.originalInvoiceNo}</td></tr>
            </table>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.barcode}</td>
                  <td>${item.name}</td>
                  <td>${item.qty} ${item.uom}</td>
                  <td>₹${parseFloat(item.rate).toFixed(2)}</td>
                  <td>₹${(parseFloat(item.qty) * parseFloat(item.rate)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <h3>Total Amount: ₹${netTotal.toFixed(2)}</h3>
          </div>
          <div class="footer">
            <p>Authorized Signature</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
    inlineInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      padding: screenSize.isMobile ? '5px 6px' : screenSize.isTablet ? '6px 8px' : '8px 10px',
      border: '1px solid #ddd',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease',
      outline: 'none',
      width: '100%',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '80px' : '100px',
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
      backgroundColor: '#1B91DA', // Changed to red for return
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
      color: '#FF6B6B', // Changed to red for return
      padding: screenSize.isMobile ? '6px 12px' : screenSize.isTablet ? '10px 20px' : '12px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: screenSize.isMobile ? '12px' : screenSize.isTablet ? '20px' : '32px',
      minWidth: 'max-content',
      justifyContent: 'center',
      width: screenSize.isMobile ? '100%' : 'auto',
      order: screenSize.isMobile ? 1 : 0,
      borderRadius: screenSize.isMobile ? '4px' : '6px',
      backgroundColor: '#FFF0F0', // Light red background
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
      backgroundColor: '#FFE8E8', // Light red background
      borderTop: '2px solid #FF6B6B', // Red border
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
              style={styles.inlineInput}
              value={returnDetails.invNo}
              name="invNo"
              readOnly={true}
              ref={returnNoRef}
              onKeyDown={(e) => handleKeyDown(e, dateRef)}
              onFocus={() => setFocusedField('returnNo')}
              onBlur={() => setFocusedField('')}
              // placeholder="Return No"
            />
          </div>

          {/* Return Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill Date:</label>
            <input
              type="date"
              style={{ ...styles.inlineInput, padding: screenSize.isMobile ? '6px 8px' : '8px 10px' }}
              value={returnDetails.returnDate}
              name="returnDate"
              onChange={handleInputChange}
              ref={dateRef}
              onKeyDown={(e) => handleKeyDown(e, amountRef)}
              onFocus={() => setFocusedField('returnDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Amount */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Amount:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={returnDetails.amount}
              name="amount"
              onChange={handleInputChange}
              ref={amountRef}
              onKeyDown={(e) => handleKeyDown(e, invoiceNoRef)}
              onFocus={() => setFocusedField('amount')}
              onBlur={() => setFocusedField('')}
              // placeholder="Amount"
            />
          </div>

          {/* Original Invoice No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}> Invoice No:</label>
            <input
              type="text"
              name="originalInvoiceNo"
              style={styles.inlineInput}
              value={returnDetails.originalInvoiceNo}
              onChange={handleInputChange}
              onClick={fetchInvoiceBillList}
              ref={invoiceNoRef}
              onKeyDown={(e) => handleKeyDown(e, invoiceDateRef)}
              onFocus={() => setFocusedField('originalInvoiceNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Click to select invoice"
            />
          </div>

          {/* Original Invoice Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}> Inv Date:</label>
            <input
              type="date"
              name="originalInvoiceDate"
              style={{ ...styles.inlineInput, padding: screenSize.isMobile ? '6px 8px' : '8px 10px' }}
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
              style={styles.inlineInput}
              value={returnDetails.originalInvoiceAmount}
              onChange={handleInputChange}
              ref={invoiceAmountRef}
              onKeyDown={(e) => handleKeyDown(e, partyCodeRef)}
              onFocus={() => setFocusedField('originalInvoiceAmount')}
              onBlur={() => setFocusedField('')}
              // placeholder="Original Amount"
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
              // placeholder="Party Code"
            />
          </div>

          {/* Customer Name */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}> Name:</label>
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
                // placeholder="Search Supplier"
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
                🔍
              </button>
            </div>
          </div>

          {/* City */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>City:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={returnDetails.city}
              name="city"
              onChange={handleInputChange}
              ref={cityRef}
              onKeyDown={(e) => handleKeyDown(e, transTypeRef)}
              onFocus={() => setFocusedField('city')}
              onBlur={() => setFocusedField('')}
              // placeholder="City"
            />
          </div>

          {/* Trans Type */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Trans Type:</label>
            <select
              name="transType"
              style={styles.inlineInput}
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
              style={styles.inlineInput}
              value={returnDetails.mobileNo}
              name="mobileNo"
              onChange={handleInputChange}
              ref={mobileRef}
              onKeyDown={(e) => handleKeyDown(e, gstTypeRef)}
              onFocus={() => setFocusedField('mobileNo')}
              onBlur={() => setFocusedField('')}
              // placeholder="Mobile No"
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
              style={styles.inlineInput}
              value={returnDetails.gstno}
              name="gstno"
              onChange={handleInputChange}
              ref={gstNoRef}
              onKeyDown={(e) => handleKeyDown(e, barcodeRef)}
              onFocus={() => setFocusedField('gstno')}
              onBlur={() => setFocusedField('')}
              // placeholder="GST No"
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
                <th style={styles.th}>Return Qty</th>
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
                <th style={styles.th}>WSate</th>
                {/* <th style={styles.th}>Min</th>
                <th style={styles.th}>Max</th> */}
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} style={{ backgroundColor: 'white' }}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.barcode}
                      data-row={index}
                      data-field="barcode"
                      onChange={(e) => handleItemChange(item.id, 'barcode', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'barcode')}
                      onClick={() => handleItemCodeSelect(item.id, item.barcode)}
                      ref={index === 0 ? barcodeRef : null}
                      title="Click to select item from list"
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.itemNameContainer }}>
                    <input
                      style={{ ...styles.editableInput, textAlign: 'left' }}
                      value={item.name}
                      // placeholder="Particulars"
                      data-row={index}
                      data-field="name"
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'name')}
                      onClick={() => handleItemCodeSelect(item.id, item.name)}
                      title="Click to select item from list"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.uom}
                      data-row={index}
                      data-field="uom"
                      onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'uom')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.stock}
                      data-row={index}
                      data-field="stock"
                      onChange={(e) => handleItemChange(item.id, 'stock', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'stock')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.hsn}
                      data-row={index}
                      data-field="hsn"
                      onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'hsn')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.qty}
                      data-row={index}
                      data-field="qty"
                      onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                    />
                  </td>
                
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.ovrwt || ''}
                      data-row={index}
                      data-field="ovrwt"
                      onChange={(e) => handleItemChange(item.id, 'ovrwt', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'ovrwt')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.avgwt || ''}
                      data-row={index}
                      data-field="avgwt"
                      onChange={(e) => handleItemChange(item.id, 'avgwt', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'avgwt')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.prate || ''}
                      data-row={index}
                      data-field="prate"
                      onChange={(e) => handleItemChange(item.id, 'prate', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'prate')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.intax || ''}
                      data-row={index}
                      data-field="intax"
                      onChange={(e) => handleItemChange(item.id, 'intax', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'intax')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.outtax || ''}
                      data-row={index}
                      data-field="outtax"
                      onChange={(e) => handleItemChange(item.id, 'outtax', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'outtax')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.acost || ''}
                      data-row={index}
                      data-field="acost"
                      onChange={(e) => handleItemChange(item.id, 'acost', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'acost')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.sudo || ''}
                      data-row={index}
                      data-field="sudo"
                      onChange={(e) => handleItemChange(item.id, 'sudo', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'sudo')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.profitPercent || ''}
                      data-row={index}
                      data-field="profitPercent"
                      onChange={(e) => handleItemChange(item.id, 'profitPercent', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'profitPercent')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.preRT || ''}
                      data-row={index}
                      data-field="preRT"
                      onChange={(e) => handleItemChange(item.id, 'preRT', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'preRT')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.sRate || ''}
                      data-row={index}
                      data-field="sRate"
                      onChange={(e) => handleItemChange(item.id, 'sRate', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'sRate')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.asRate || ''}
                      data-row={index}
                      data-field="asRate"
                      onChange={(e) => handleItemChange(item.id, 'asRate', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'asRate')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.mrp}
                      data-row={index}
                      data-field="mrp"
                      onChange={(e) => handleItemChange(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'mrp')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.letProfPer || ''}
                      data-row={index}
                      data-field="letProfPer"
                      onChange={(e) => handleItemChange(item.id, 'letProfPer', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'letProfPer')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.ntCost || ''}
                      data-row={index}
                      data-field="ntCost"
                      onChange={(e) => handleItemChange(item.id, 'ntCost', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'ntCost')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.wsPercent || ''}
                      data-row={index}
                      data-field="wsPercent"
                      onChange={(e) => handleItemChange(item.id, 'wsPercent', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'wsPercent')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.wsRate || ''}
                      data-row={index}
                      data-field="wsRate"
                      onChange={(e) => handleItemChange(item.id, 'wsRate', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'wsRate')}
                    />
                  </td>
                  {/* <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.min || ''}
                      data-row={index}
                      data-field="min"
                      onChange={(e) => handleItemChange(item.id, 'min', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'min')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.max || ''}
                      data-row={index}
                      data-field="max"
                      onChange={(e) => handleItemChange(item.id, 'max', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'max')}
                    />
                  </td> */}
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
              console.log("Top action clicked:", type);
              setActiveTopAction(type);
              if (type === 'add') createNewForm();
              else if (type === 'edit') handleEdit();
              else if (type === 'delete') handleDeleteBill();
            }}         
          >
            <AddButton buttonType="add"/>
            <EditButton buttonType="edit"/>
            <DeleteButton buttonType="delete" />
          </ActionButtons>
        </div>
        <div style={styles.netBox}>
          <span>Total Return Amount:</span>
          <span>₹ {netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
        }}
        title={popupMode === 'edit' ? 'Select Purchase Return to Edit' : 'Select Purchase Return to Delete'}
        fetchItems={fetchBillList}
        displayFieldKeys={['voucherNo']}
        headerNames={['Bill No']}
        searchFields={['voucherNo']}
        columnWidths={{ voucherNo: '100%' }}
        searchPlaceholder="Search by bill no..."
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
        initialSearchText={itemSearchTerm}
        onSelect={handleItemCodeSelection}
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
        displayFieldKeys={['code','name','city','phone']}
        headerNames={['Code','Name','City','Phone']}
        searchFields={['code','name','city','phone']}
        columnWidths={{ code: '20%', name: '40%', city: '20%', phone: '20%' }}
        searchPlaceholder="Search supplier..."
        initialSearchText={itemSearchTerm}
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