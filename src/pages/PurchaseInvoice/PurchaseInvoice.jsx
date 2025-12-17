import React, { useState, useEffect, useRef } from 'react';
import PopupListSelector from '../../components/Listpopup/PopupListSelector.jsx';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup.jsx';
import { hover } from 'framer-motion';

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
    const rate = parseFloat(it?.rate) || 0;
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

const PurchaseInvoice = () => {
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
  
  // Loading state for async operations
  const [isLoading, setIsLoading] = useState(false);
  
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
      amt: '',
      min: '',
      max: ''
    }
  ]);

  // 3. Totals State
  const [netTotal, setNetTotal] = useState(0);

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
  // Add this with your other refs
const firstRowNameRef = useRef(null);

  // Track which top-section field is focused to style active input
  const [focusedField, setFocusedField] = useState('');
  const [showSupplierPopup, setShowSupplierPopup] = useState(false);
  const [showBillListPopup, setShowBillListPopup] = useState(false);
  const [showItemCodePopup, setShowItemCodePopup] = useState(false);
  const [popupMode, setPopupMode] = useState(''); // 'edit' or 'delete'
  const [selectedRowId, setSelectedRowId] = useState(null); // Track which row is being edited
  const [itemSearchTerm, setItemSearchTerm] = useState(''); // Track search term for item popup
  
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

  // Helper: Fetch next invoice number
  const fetchNextInvNo = async () => {
    try {
      const compCode = (userData && userData.companyCode) ? userData.companyCode : '001';
      const endpoint = API_ENDPOINTS.PURCHASE_INVOICE.GET_PURCHASE_INVOICES(compCode);
      const response = await axiosInstance.get(endpoint);
      const nextCode = response?.data?.nextCode ?? response?.nextCode;
      if (nextCode) {
        setBillDetails((prev) => ({ ...prev, invNo: nextCode }));
      }
    } catch (err) {
      console.warn('Failed to fetch next invoice number:', err);
    }
  };

  // Fetch purchase bill list for popup
  const fetchBillList = async () => {
    try {
      const compCode = userData?.companyCode || '001';
      const response = await axiosInstance.get(
        API_ENDPOINTS.PURCHASE_INVOICE.GET_BILL_LIST(compCode)
      );
      
      const data = response?.data || [];
      
      return Array.isArray(data) ? data.map((bill, index) => ({
        id: bill.code || bill.voucherNo || `bill-${index}`,
        voucherNo: bill.code || bill.voucherNo || '',
        customerName: bill.customerName || bill.refName || '',
        date: bill.date || bill.voucherDate || ''
      })) : [];
    } catch (err) {
      console.error('Error fetching bill list:', err);
      return [];
    }
  };

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
        };
        
        console.log('Setting header details:', headerDetails);
        setBillDetails(headerDetails);

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
            barcode: item.itemCode || item.fid || '',
            name: item.itemname || item.fName || '',
            stock: item.stock || '0',
            mrp: item.mrp || '0',
            uom: item.fUnit || item.unit || '',
            hsn: item.fhsn || item.hsn || '',
            tax: item.fTax || item.tax || '',
            prate: item.rate || 0,
            qty: item.qty || '1',
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
          setItems([
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
              max: ''
            }
          ]);
        }

        setIsEditMode(true);
        setEditingBillNo(voucherNo);
        setActiveTopAction('edit');
        console.log('Edit mode activated for voucher:', voucherNo);
        
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
    console.log('Opening item code popup for row:', itemId, 'with search:', searchTerm);
    setSelectedRowId(itemId);
    setItemSearchTerm(searchTerm);
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
        message: `Are you sure you want to delete Purchase Invoice ${selectedBill.voucherNo}? This action cannot be undone.`,
        onConfirm: () => {
          deletePurchaseBill(selectedBill.voucherNo);
        },
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      });
    }
    
    setShowBillListPopup(false);
    setPopupMode('');
  };

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
              uom: itemDetails.uom || selectedItem.uom || item.uom || '',
              hsn: stockData.hsn || itemDetails.hsn || selectedItem.hsn || item.hsn || '',
              preRT: itemDetails.preRT || selectedItem.preRT || item.preRT || '0',
              prate: itemDetails.preRT || selectedItem.preRT || item.prate || '0',
              brand: stockData.brand || itemDetails.brand || '',
              category: stockData.category || itemDetails.category || '',
              model: stockData.model || itemDetails.model || '',
              size: stockData.size || itemDetails.size || '',
              max: stockData.max || itemDetails.max || '',
              min: stockData.min || itemDetails.min || '',
              type: stockData.type || itemDetails.type || '',
            };
          }
          return item;
        });
      });
    } catch (error) {
      console.error('Error in handleItemCodeSelection:', error);
      
      setItems(prevItems => {
        return prevItems.map(item => {
          if (item.id === selectedRowId) {
            return {
              ...item,
              barcode: selectedItem.barcode || '',
              name: selectedItem.name || '',
              uom: selectedItem.uom || item.uom || '',
              hsn: selectedItem.hsn || item.hsn || '',
              preRT: selectedItem.preRT || item.preRT || '0',
              prate: selectedItem.preRT || item.prate || '0',
            };
          }
          return item;
        });
      });
    } finally {
      setSelectedRowId(null);
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
            user: username
          }
        }
      );

      if (response.status === 200 || response.status === 204) {
        showAlertConfirmation(
          `Purchase invoice ${voucherNo} deleted successfully`,
          () => {
            resetForm();
            fetchNextInvNo();
          },
          'success'
        );
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

  // Fetch next invoice number on mount
  useEffect(() => {
    fetchNextInvNo();
  }, [userData]);

  useEffect(() => {
    const { net } = calculateTotals(items);
    setNetTotal(net);
  }, [items]);

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
    setBillDetails(prev => ({ ...prev, [name]: value }));
  };

  const fetchSupplierItems = async (pageNum = 1, search = '') => {
    const url = API_ENDPOINTS.PURCHASE_INVOICE.SUPPLIER_LIST(search || '', pageNum, 20);
    const res = await axiosInstance.get(url);
    const data = res?.data || [];
    return Array.isArray(data) ? data : [];
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
      amt: '',
      min: '',
      max: ''
    };
    setItems([...items, newRow]);
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id !== id) return item;
      
      const updatedItem = { ...item, [field]: value };
      
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

// Replace the existing handleTableKeyDown function with this updated version:
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

    // Fields in the visual order (adjust according to your table columns)
    const fields = [
      'barcode', 'name', 'uom', 'stock', 'hsn', 'qty', 'ovrwt', 'avgwt',
      'prate', 'intax', 'outtax', 'acost', 'sudo', 'profitPercent', 'preRT', 
      'sRate', 'asRate', 'mrp', 'letProfPer', 'ntCost', 'wsPercent', 'wsRate', 'amt'
    ];

    const currentFieldIndex = fields.indexOf(currentField);

    // Always move to next field if available
    if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
      const nextField = fields[currentFieldIndex + 1];
      const nextInput = document.querySelector(
        `input[data-row="${currentRowIndex}"][data-field="${nextField}"], 
         select[data-row="${currentRowIndex}"][data-field="${nextField}"]`
      );
      if (nextInput) {
        nextInput.focus();
        return;
      }
    }

    // If Enter is pressed in the amt field (last field)
    if (currentField === 'amt') {
      // Check if particulars (name) field is empty
      const currentRow = items[currentRowIndex];
      const isParticularsEmpty = !currentRow.name || currentRow.name.trim() === '';

      if (isParticularsEmpty) {
        // Show confirmation popup asking to save
        showConfirmation({
          title: 'Particulars Missing',
          message: 'Particulars cannot be empty. Would you like to save the purchase invoice anyway?\n\nNote: Items without particulars will not be saved.',
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
            // Focus back to name field so user can fix it
            setTimeout(() => {
              const nameInput = document.querySelector(
                `input[data-row="${currentRowIndex}"][data-field="name"]`
              );
              if (nameInput) {
                nameInput.focus();
              }
            }, 100);
          }
        });
        return; // Don't proceed further
      }
    }

    // If Enter is pressed in the amt field and particulars is not empty
    if (currentField === 'amt') {
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
        const currentRow = items[currentRowIndex];
        if (currentRow.name && currentRow.name.trim() !== '') {
          handleAddRow();
          setTimeout(() => {
            const newRowInput = document.querySelector(
              `input[data-row="${items.length}"][data-field="barcode"]`
            );
            if (newRowInput) newRowInput.focus();
          }, 60);
        }
      }
    }
  }
};

  const resetForm = () => {
    setIsEditMode(false);
    setEditingBillNo('');
    setBillDetails({
      invNo: '',
      billDate: '',
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
      purDate: '',
      invoiceAmount: '',
      transType: 'PURCHASE',
      city: '',
      isLedger: false,
    });
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
        amt: '',
        min: '',
        max: ''
      }
    ]);
    setActiveTopAction('create');
    setActiveFooterAction('all');
  };

  const handleClear = () => {
    showConfirmation({
      title: 'Clear Form',
      message: 'Are you sure you want to clear all items? This action cannot be undone.',
      onConfirm: () => {
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
            amt: '',
            min: '',
            max: ''
          }
        ]);
        setBillDetails({ ...billDetails, barcodeInput: '' });
      },
      type: 'warning',
      confirmText: 'Clear',
      cancelText: 'Cancel'
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

      const voucherDateISO = toISODate(billDetails.billDate || billDetails.purDate);

      const totals = calculateTotals(items);

      const payload = {
        bledger: {
          customerCode: billDetails.partyCode || '',
          voucherNo: voucherNo,
          voucherDate: voucherDateISO,
          billAmount: totals.net,
          balanceAmount: totals.net,
          refName: billDetails.customerName || '',
          compCode: compCode,
          user: username || '001',
          gstType: billDetails.gstType || 'G',
          transType: billDetails.transType || 'PURCHASE',
        },
        iledger: {
          vrNo: voucherNo,
          less: 0,
          subTotal: totals.subTotal,
          total: totals.total,
          net: totals.net,
          add1: '',
          add2: '',
          cstsNo: billDetails.gstno || '',
          add3: billDetails.city || '',
          add4: billDetails.mobileNo || '',
        },
        items: items.map((it) => ({
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
        title: isEditMode ? 'Update Purchase Invoice' : 'Create Purchase Invoice',
        message: `Are you sure you want to ${isEditMode ? 'update' : 'save'} this purchase invoice?`,
        onConfirm: async () => {
          setIsLoading(true);
          try {
            const res = await axiosInstance.post(
              API_ENDPOINTS.PURCHASE_INVOICE.CREATE_PURCHASE_INVOICE(purchaseType), 
              payload
            );
            
            showAlertConfirmation(
              `Purchase ${isEditMode ? 'updated' : 'saved'} successfully`,
              () => {
                resetForm();
                fetchNextInvNo();
                console.log('Save response:', res);
              },
              'success'
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
        type: 'question',
        confirmText: isEditMode ? 'Update' : 'Save',
        cancelText: 'Cancel',
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
      showAlertConfirmation("Cannot delete the last row", null, 'warning');
      return;
    }
    
    showConfirmation({
      title: 'Delete Row',
      message: 'Are you sure you want to delete this row?',
      onConfirm: () => {
        setItems(items.filter(item => item.id !== id));
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
      minWidth: screenSize.isMobile ? '65px' : screenSize.isTablet ? '75px' : '85px',
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
      backgroundColor: '#e8f4fc',
      borderTop: '2px solid #1B91DA',
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
          {/* Inv No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Inv No:</label>
            <input 
              type="text"
              // style={styles.inlineInput}
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'invNo' && styles.focusedInput)
              }}
              value={billDetails.invNo}
              name="invNo"
              onChange={handleInputChange}
              ref={billNoRef}
              onKeyDown={(e) => handleKeyDown(e, dateRef)}
              onFocus={() => setFocusedField('invNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Bill No"
              disabled={isEditMode}
            />
          </div>

          {/* Bill Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill Date:</label>
            <input
              type="date"
              // style={{...styles.inlineInput, padding: screenSize.isMobile ? '6px 8px' : '8px 10px'}}
              style={{
                ...styles.inlineInput,
                padding: screenSize.isMobile ? '6px 8px' : '8px 10px',
                ...(focusedField === 'billDate' && styles.focusedInput)
              }}
              value={billDetails.billDate}
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
              value={billDetails.amount}
              name="amount"
              onChange={handleInputChange}
              ref={amountRef}
              onKeyDown={(e) => handleKeyDown(e, purNoRef)}
              onFocus={() => setFocusedField('amount')}
              onBlur={() => setFocusedField('')}
              placeholder="Amount"
            />
          </div>

          {/* Pur No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Pur No:</label>
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
              onKeyDown={(e) => handleKeyDown(e, invoiceNoRef)}
              onFocus={() => setFocusedField('purNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Pur No"
            />
          </div>

          {/* Invoice No */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Invoice No:</label>
            <input
              type="text"
              name="invoiceNo"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'invoiceNo' && styles.focusedInput)
              }}
              value={billDetails.invoiceNo}
              onChange={handleInputChange}
              ref={invoiceNoRef}
              onKeyDown={(e) => handleKeyDown(e, purDateRef)}
              onFocus={() => setFocusedField('invoiceNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Invoice No"
            />
          </div>

          {/* Pur Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Pur Date:</label>
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
              onKeyDown={(e) => handleKeyDown(e, customerRef)}
              onFocus={() => setFocusedField('purDate')}
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
              value={billDetails.partyCode}
              name="partyCode"
              onChange={handleInputChange}
              ref={customerRef}
              onKeyDown={(e) => handleKeyDown(e, nameRef)}
              onFocus={() => setFocusedField('partyCode')}
              onBlur={() => setFocusedField('')}
              placeholder="Party Code"
            />
          </div>

          {/* Customer Name */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Name:</label>
            <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
              <input
                type="text"
                ref={nameRef}
                // style={{
                //   ...styles.inlineInput,
                //   flex: 1,
                //   paddingRight: screenSize.isMobile ? '46px' : '50px'
                // }}
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
                placeholder="Type name or press / to search"
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
              value={billDetails.city}
              name="city"
              onChange={handleInputChange}
              ref={cityRef}
              onKeyDown={(e) => handleKeyDown(e, gstTypeRef)}
              onFocus={() => setFocusedField('city')}
              onBlur={() => setFocusedField('')}
              placeholder="City"
            />
          </div>

          {/* GST Type */}
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
              onKeyDown={(e) => handleKeyDown(e, transtypeRef)}
              onFocus={() => setFocusedField('gstType')}
              onBlur={() => setFocusedField('')}
            >
              <option value="G">CGST/SGST</option>
              <option value="I">IGST</option>
            </select>
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
              value={billDetails.transType}
              onChange={handleInputChange}
              ref={transtypeRef}
              onKeyDown={(e) => handleKeyDown(e, invoiceAmountRef)}
              onFocus={() => setFocusedField('transType')}
              onBlur={() => setFocusedField('')}
            >
              <option value="PURCHASE">PURCHASE</option>
              <option value="SALE">SALE</option>
              <option value="Cash">Cash</option>
              <option value="Credit">Credit</option>
            </select>
          </div>

          {/* Invoice Amt */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Invoice Amt:</label>
            <input
              type="text"
              name="invoiceAmount"
              style={{
                ...styles.inlineInput,
                ...(focusedField === 'invoiceAmount' && styles.focusedInput)
              }}
              value={billDetails.invoiceAmount}
              onChange={handleInputChange}
              ref={invoiceAmountRef}
              onKeyDown={(e) => handleKeyDown(e, mobileRef)}
              onFocus={() => setFocusedField('invoiceAmount')}
              onBlur={() => setFocusedField('')}
              placeholder="Invoice Amount"
            />
          </div>
        </div>

        {/* ROW 3 */}
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
          marginBottom: '0',
        }}>
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
              onKeyDown={(e) => handleKeyDown(e, gstNoRef)}
              onFocus={() => setFocusedField('mobileNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Mobile No"
            />
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
              value={billDetails.gstno}
              name="gstno"
              onChange={handleInputChange}
              ref={gstNoRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
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
              placeholder="GST No"
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
                      style={styles.editableInput}
                      value={item.barcode}
                      data-row={index}
                      data-field="barcode"
                      onChange={(e) => handleItemChange(item.id, 'barcode', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'barcode')}
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
                     ref={index === 0 ? firstRowNameRef : null}
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
                      value={item.name}
                      placeholder="Press / to search items"
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
                    />
                    <button
                      type="button"
                      aria-label="Search item details"
                      title="Search item details"
                      onClick={() => {
                        handleItemCodeSelect(item.id, item.name);
                        // setScrapSearchTerm(billDetails.scrapProductInput);
                        // setActiveSearchField('scrap');
                        // setShowScrapPopup(true);
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
                      onChange={(e) => {
                        const value = e.target.value;
                        const validTaxValues = ['3', '5', '12', '18', '40'];
                        if (value === '' || /^[0-9]*$/.test(value)) {
                          handleItemChange(item.id, 'intax', value);
                        }
                      }}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'intax')}
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
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.amt || ''}
                      data-row={index}
                      data-field="amt"
                      onChange={(e) => handleItemChange(item.id, 'amt', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'amt')}
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
      
      {/* Purchase Bill List Popup for Edit/Delete */}
      <PopupListSelector
        open={showBillListPopup}
        onClose={() => {
          setShowBillListPopup(false);
          setPopupMode('');
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
        displayFieldKeys={['code','name','city','gstType']}
        headerNames={['Code','Name','City','GST Type']}
        searchFields={['code','name','city','gstType']}
        columnWidths={{ code: '20%', name: '40%', city: '20%', gstType: '20%' }}
        searchPlaceholder="Search supplier..."
        initialSearchText={itemSearchTerm}
        onSelect={(s) => {
          setBillDetails(prev => ({
            ...prev,
            partyCode: s.code || '',
            customerName: s.name || '',
            city: s.city || '',
            gstType: s.gstType || '',
            gstType: s.gstType || prev.gstType || 'CGST'
          }));
        }}
      />     
      
      {/* Item Code Selection Popup */}     
      <PopupListSelector
        open={showItemCodePopup}
        onClose={() => {
          setShowItemCodePopup(false);
          setItemSearchTerm('');
        }}
        title="Select Item Code"
        fetchItems={(pageNum = 1, search = '') => fetchItemCodeList(search || itemSearchTerm)}
        displayFieldKeys={['barcode','name']}
        headerNames={['Barcode','Name']}
        searchFields={['barcode','name']}
        columnWidths={{ barcode: '50%', name: '50%' }}
        searchPlaceholder="Search by barcode or name..."
        initialSearchText={itemSearchTerm}
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

      {/* --- FOOTER SECTION --- */}
      <div style={styles.footerSection}>
        <div style={styles.rightColumn}>
          <ActionButtons 
            activeButton={activeTopAction} 
            onButtonClick={(type) => {
              console.log("Top action clicked:", type);
              setActiveTopAction(type);
              if (type === 'add') handleClear();
              else if (type === 'edit') handleEdit();
              else if (type === 'delete') handleDelete();
            }}         
          >
            <AddButton buttonType="add"/>
            <EditButton buttonType="edit"/>
            <DeleteButton buttonType="delete" />
          </ActionButtons>
        </div>
        <div style={styles.netBox}>
          <span>Total Amount:</span>
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
    </div>
  );
};

export default PurchaseInvoice;