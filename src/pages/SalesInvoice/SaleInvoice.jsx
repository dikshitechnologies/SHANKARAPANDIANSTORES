import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import 'bootstrap/dist/css/bootstrap.min.css';

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_ENDPOINTS } from '../../api/endpoints';
import { axiosInstance } from '../../api/apiService';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
import { getCompCode, getUCode } from '../../utils/userUtils';
import { PopupScreenModal } from '../../components/PopupScreens.jsx';
import PrintReceipt from '../PrintReceipt/PrintReceipt';

const TABLE_FIELDS = [
  'barcode',
  'itemName',
  'stock',
  'mrp',
  'uom',
  'hsn',
  'tax',
  'sRate',
  'qty'
];



const SearchIcon = ({ size = 16, color = " #1B91DA" }) => (
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

const HistoryIcon = ({ size = 16, color = "#4d7cfe" }) => (
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
  >
    {/* Box */}
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />

    {/* Arrow */}
    <polyline points="12 8 12 12 15 14" />
  </svg>
);





const SaleInvoice = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.SALES_INVOICE),
    edit: hasModifyPermission(PERMISSION_CODES.SALES_INVOICE),
    delete: hasDeletePermission(PERMISSION_CODES.SALES_INVOICE)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  const compCode = getCompCode();
  const userCode = getUCode();

  // --- STATE MANAGEMENT ---

  const [gstMode, setGstMode] = useState("Inclusive");
  const [gstRate, setGstRate] = useState('18');  // ✅ ADD GST RATE STATE
  const [lastBillAmount, setLastBillAmount] = useState('0.00');



const [serialNoValue, setSerialNoValue] = useState('');
const [descHuidPopupOpen, setDescHuidPopupOpen] = useState(false);
const [descValue, setDescValue] = useState('');
const [huidValue, setHuidValue] = useState('');
const [descHuidRowIndex, setDescHuidRowIndex] = useState(null);

const descRef = useRef(null);
const serialRef = useRef(null);





  const [activeTopAction, setActiveTopAction] = useState('add');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const ignoreNextInputRef = useRef(false);
 const saveButtonRef = useRef(null);
 const blockTableEnterRef = useRef(false);
const barcodeInputRefs = useRef({});
const lastBarcodeRowRef = useRef(null);


  // Save confirmation popup
  const [saveConfirmationOpen, setSaveConfirmationOpen] = useState(false);
  const [saveConfirmationData, setSaveConfirmationData] = useState(null);
  // Clear confirmation popup
  const [clearConfirmationOpen, setClearConfirmationOpen] = useState(false);
  
  // Print confirmation popup
  const [printConfirmationOpen, setPrintConfirmationOpen] = useState(false);
  
  // Edit confirmation popup
  const [editConfirmationOpen, setEditConfirmationOpen] = useState(false);
  const [editConfirmationData, setEditConfirmationData] = useState(null);
  const [popupSearchText, setPopupSearchText] = useState('');
  const deleteInProgressRef = useRef(false);

  // Delete confirmation popup
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteConfirmationData, setDeleteConfirmationData] = useState(null);
  const [barcodeErrorOpen, setBarcodeErrorOpen] = useState(false);



// 🔹 TAX MASTER LIST
const [taxList, setTaxList] = useState([]);




  // State for tracking if customer selection message was shown
  const [customerMessageShown, setCustomerMessageShown] = useState(false);
  
  // Add/Less amount state
  const [addLessAmount, setAddLessAmount] = useState('');
  const warnedEmptyRowRef = useRef({});
   const validationToastShownRef = useRef(false);

  // Track if we're editing an existing invoice
  const [isEditing, setIsEditing] = useState(false);
  const [originalInvoiceNo, setOriginalInvoiceNo] = useState('');

  const validateItemSelected = (rowIndex) => {
    const item = items[rowIndex];

    if (!item.itemName || item.itemName.trim() === '') {
      toast.warning("Please select Item Name first", {
        autoClose: 1500,
      });

      // 🔁 force focus back to Item Name
      setTimeout(() => {
        document
          .querySelector(
            `input[data-row="${rowIndex}"][data-field="itemName"]`
          )
          ?.focus();
      }, 0);

      return false;
    }

    return true;
  };

  // 1. Header Details State
  const [billDetails, setBillDetails] = useState({
    billNo: '',
    billDate: new Date().toISOString().split('T')[0], // yyyy-MM-dd format
    mobileNo: '',
    type: 'Retail',
    salesman: '',
    salesmanCode: '',
    custName: '',
    custCode: '',
    barcodeInput: '',
    partyCode: '',
    transType: 'SALES INVOICE'
  });

  // Party balance shown in header (read-only)
  const [partyBalance, setPartyBalance] = useState('0.00');

  // 2. Table Items State
  const [items, setItems] = useState([
    { 
      id: 1, 
      sNo: 1,
      barcode: '', 
      itemName: '', 
      fromBarcode: false, 
      itemCode: '',
      stock: '', 
      mrp: '', 
      uom: '', // Changed from 'pcs' to empty string
      hsn: '', 
      tax: '', 
      sRate: '', 
      qty: '',
      amount: '0.00',
       fdesc: '', 
      PrevBarcode:""
    }
  ]);

  // 3. Totals State
  const [totalQty, setTotalQty] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const DEFAULT_QTY = 1;

  // Row delete confirmation popup
  const [rowDeleteConfirmationOpen, setRowDeleteConfirmationOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  // 4. Popup States
  const [customerPopupOpen, setCustomerPopupOpen] = useState(false);
  const [itemPopupOpen, setItemPopupOpen] = useState(false);
  const [salesmanPopupOpen, setSalesmanPopupOpen] = useState(false);
  const [editInvoicePopupOpen, setEditInvoicePopupOpen] = useState(false);
  const [deleteInvoicePopupOpen, setDeleteInvoicePopupOpen] = useState(false);
  const [currentItemRowIndex, setCurrentItemRowIndex] = useState(0);
  
  // 🔄 Customer History Modal States
  const [customerHistoryOpen, setCustomerHistoryOpen] = useState(false);
  const [customerHistoryData, setCustomerHistoryData] = useState(null);
  const [customerHistoryLoading, setCustomerHistoryLoading] = useState(false);
  const [customerHistoryError, setCustomerHistoryError] = useState('');
  
  // State for printing
  const [printBillData, setPrintBillData] = useState(null);
  
  // ✅ Total Amount - keep full decimals for table
  const roundedTotalAmount = totalAmount; // Keep full decimal value
  
  // ✅ Net Amount - rounded off for final display
  const netAmountRounded = Math.round(totalAmount); // Round off for net amount
  const roundOffValue = (netAmountRounded - totalAmount).toFixed(2); // Round-off value

  // 5. Data state
  const [salesmanList, setSalesmanList] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  
  // 6. State for saved invoices for edit/delete popups
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const ignoreNextEnterRef = useRef(false);

  // --- REFS FOR ENTER KEY NAVIGATION ---
  const billNoRef = useRef(null);
  const billDateRef = useRef(null);
  const mobileRef = useRef(null);
  const typeRef = useRef(null);
  const gstModeRef = useRef(null);
  const salesmanRef = useRef(null);
  const custNameRef = useRef(null);
  const barcodeRef = useRef(null);
  const addLessRef = useRef(null);
  const printReceiptRef = useRef(null);

  const HEADER_FIELDS = [
  'billDate',
  'salesman',
  'type',
  'gstMode',
  'custName',
  'mobileNo'
];

  
  const handleItemNameLetterKey = (e, rowIndex) => {
  const isLetterKey = e.key.length === 1 && /^[a-zA-Z]$/.test(e.key);

  if (isLetterKey) {
    e.preventDefault();
    e.stopPropagation();

    ignoreNextInputRef.current = true;
    setPopupSearchText(e.key);   // 🔥 prefill search
    setCurrentItemRowIndex(rowIndex);
    setItemPopupOpen(true);
    return true;
  }

  if (e.key === '/') {
    e.preventDefault();
    setPopupSearchText('');
    setCurrentItemRowIndex(rowIndex);
    setItemPopupOpen(true);
    return true;
  }

  return false;
};

  // Track which top-section field is focused to style active input
  const [focusedField, setFocusedField] = useState('');

  // Track UOM field focus for visual feedback
  const [focusedUomField, setFocusedUomField] = useState(null);

  // Footer action active state
  const [activeFooterAction, setActiveFooterAction] = useState('null');

  // Screen size state
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  useEffect(() => {
  if (descHuidPopupOpen) {
    setTimeout(() => {
      descRef.current?.focus();
    }, 50);
  }
}, [descHuidPopupOpen]);


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

  const handleMobileChange = (e) => {
  let value = e.target.value;

  // ✅ Allow only digits
  value = value.replace(/\D/g, "");

  // ✅ Limit to 10 digits
  if (value.length > 10) {
    value = value.slice(0, 10);
  }

  setBillDetails(prev => ({
    ...prev,
    mobileNo: value
  }));
};


const selectAllOnFocus = useCallback((e, fieldKey) => {
  setFocusedField(fieldKey);

  // ❌ DO NOT auto-select for qty
  if (fieldKey.includes('qty')) return;

  requestAnimationFrame(() => {
    if (e.target && typeof e.target.select === "function") {
      e.target.select();
    }
  });
}, []);



  // Focus Bill Date on load or when action changes (except delete)
  useEffect(() => {
    if (billDateRef.current && activeTopAction !== "delete") {
      billDateRef.current.focus();
    }
  }, [activeTopAction]);

  // ---------- API FUNCTIONS ----------
  
  // Fetch next bill number from API
  const fetchNextBillNo = useCallback(async () => {
    if (isEditing && billDetails.billNo) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getNextBillNo(compCode);
      
      const response = await axiosInstance.get(endpoint);
      
      if (response) {
        let nextBillNo = '';
        if (typeof response === 'object' && response.nextCode) {
          nextBillNo = response.nextCode;
        } else if (typeof response === 'string') {
          nextBillNo = response;
        } else if (response.data && typeof response.data === 'string') {
          nextBillNo = response.data;
        } else if (response.data && response.data.nextCode) {
          nextBillNo = response.data.nextCode;
        }
        
        if (!isEditing) {
          setBillDetails(prev => ({
            ...prev,
            billNo: nextBillNo || ''
          }));
        }
      }
    } catch (err) {
      setBillDetails(prev => ({ ...prev, billNo: 'SE000001' }));
    } finally {
      setIsLoading(false);
    }
  }, [isEditing, billDetails.billNo]);

const fetchCustomers = useCallback(async () => {
  try {
    setIsLoading(true);
    setError("");

    // ✅ CALL WITH PAGINATION
    const response = await axiosInstance.get(
      API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getCustomers(1, 50)
    );

    // ✅ BACKEND RETURNS { data: [...] }
    const rawCustomers = Array.isArray(response?.data?.data)
      ? response.data.data
      : [];

    const formattedCustomers = rawCustomers.map(customer => ({
      id: customer.code || customer.partyCode || customer.id,
      code: customer.code || customer.partyCode,
      name: customer.name || customer.partyName,
     phoneNumber: customer.phonenumber || customer.mobile || "",
      displayName: customer.name || customer.partyName
    }));

    setCustomerList(formattedCustomers);
  } catch (err) {
    console.error("Customer fetch failed:", err);
    setCustomerList([]);
  } finally {
    setIsLoading(false);
  }
}, []);




// 🔹 Fetch Tax Master
const fetchTaxList = useCallback(async (page = 1, pageSize = 10) => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getTaxList(page, pageSize)
    );

    const raw = Array.isArray(response?.data?.data)
      ? response.data.data
      : [];

    const formatted = raw
      .map(t => ({
        id: t.fcode,
        tax: Number(t.ftaxName), // assuming ftaxName = 5, 12, 18
        displayName: t.ftaxName
      }))
      .filter(t => !isNaN(t.tax));

    setTaxList(formatted);
  } catch (err) {
    console.error("Tax fetch failed", err);
    setTaxList([]);
  }
}, []);



  // Fetch salesmen from backend API
  const fetchSalesmen = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getSalesman();
      
      const response = await axiosInstance.get(endpoint);
      
      if (response && Array.isArray(response.data)) {
        const formattedSalesmen = response.data.map(salesman => ({
          id: salesman.fcode || salesman.code || salesman.id,
          code: salesman.fcode || salesman.code,
          name: salesman.fname || salesman.name,
          originalCode: salesman.fcode || salesman.code,
          displayName: salesman.fname || salesman.name
        }));
        
        setSalesmanList(formattedSalesmen);
      } else {
        setSalesmanList([]);
      }
    } catch (err) {
      setSalesmanList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate amount - memoized with useCallback
  const calculateAmount = useCallback((qty, sRate, taxPercent) => {
    const qtyNum = parseFloat(qty || 0);
    const sRateNum = parseFloat(sRate || 0);
    const taxNum = parseFloat(taxPercent || 0);

    // Backwards-compatible behavior: if taxPercent is not provided, behave as before
    if (taxPercent === undefined) {
      return (qtyNum * sRateNum).toFixed(2);
    }

    // Compute based on gstMode
    if (gstMode === 'Inclusive') {
      // sRate includes tax. total = qty * sRate. Extract tax portion.
      const total = qtyNum * sRateNum;
      const taxAmount = taxNum === 0 ? 0 : (total * taxNum) / (100 + taxNum);
      return { amount: total.toFixed(2), taxAmount: taxAmount.toFixed(2) };
    } else {
      // Exclusive: tax calculated on top of sRate
      const base = qtyNum * sRateNum;
      const taxAmount = (base * taxNum) / 100;
      const total = base + taxAmount;
      return { amount: total.toFixed(2), taxAmount: taxAmount.toFixed(2) };
    }
  }, [gstMode]);

  const totalTaxAmount = useMemo(() => {
  return items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.sRate) || 0;
    const tax = parseFloat(item.tax) || 0;

    if (qty === 0 || rate === 0 || tax === 0) return sum;

    const calc = calculateAmount(qty, rate, tax);
    const taxAmt = typeof calc === 'string'
      ? 0
      : parseFloat(calc.taxAmount || 0);

    return sum + taxAmt;
  }, 0);
}, [items, gstMode, calculateAmount]);


// Fetch items by type (FG for Finished Goods)
const fetchItems = useCallback(async (type = 'FG') => {
  try {
    setIsLoading(true);
    setError("");
    
    // Use getItemsByType endpoint with FG type
    const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getItemsByType(type, 1, 100);
    
    const response = await axiosInstance.get(endpoint);
    
    if (response && response.data) {
      let itemsArray = [];
      
      // Handle response format - check for data array
      if (response.data.data && Array.isArray(response.data.data)) {
        itemsArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        itemsArray = response.data;
      }
      
      if (itemsArray.length > 0) {
        const formattedItems = itemsArray.map(item => {
          // ✅ IMPORTANT: CORRECT FIELD MAPPINGS FOR FG TYPE
          const itemCode = item.itemCode || item.code || item.id || '';
          const itemName = item.itemName || item.name || '';
          const units = item.units || item.uom || "PCS"; // Default to PCS if empty
          const barcode = item.finalPrefix || item.barcode; // ✅ finalPrefix is the BARCODE
          
          // Handle empty preRate (like in the second item where preRate is "")
          const preRateValue = item.preRate === "" || item.preRate === null || item.preRate === undefined 
            ? "0" 
            : item.preRate;
          
          return {
            ...item,
            id: itemCode || Math.random(),
            fItemcode: itemCode,
            fItemName: itemName,
            fUnits: units,
            itemCode: itemCode,
            itemName: itemName,
            name: itemName,
            code: itemCode,
            originalCode: itemCode,
            barcode: barcode, // ✅ This now correctly maps finalPrefix to barcode
            stock: item.maxQty || item.stock || item.quantity || 0, // ✅ Use maxQty as available stock
            mrp: preRateValue || item.mrp || item.sRate || "0",
            uom: units,
            hsn: item.hsn || item.hsnCode || "",
            tax: "0", // Default tax to 0 if not provided
            sRate: preRateValue || item.sRate || item.mrp || "0", // ✅ Use preRate as selling rate
            displayName: `${itemName} (${itemCode})`, // Show both name and code
            popupDisplay: itemName, // Show only name in popup
            // ✅ Keep all original fields for reference
            finalPrefix: item.finalPrefix, // Keep original barcode value
            preRate: preRateValue, // Keep original rate value
            maxQty: item.maxQty,
            minQty: item.minQty,
            brand: item.brand,
            category: item.category,
            model: item.model,
            size: item.size,
            type: item.type // Should be "FG"
          };
        });
        
        setItemList(formattedItems);
        console.log(`FG Items fetched (${formattedItems.length} items):`, formattedItems.map(i => ({ 
          name: i.itemName, 
          code: i.itemCode,
          barcode: i.barcode,
          finalPrefix: i.finalPrefix,
          preRate: i.preRate,
          stock: i.stock
        })));
      } else {
        setItemList([]);
        console.log("No FG items found");
      }
    } else {
      setItemList([]);
    }
  } catch (err) {
    console.error("Error fetching FG items:", err);
    setItemList([]);
  } finally {
    setIsLoading(false);
  }
}, []);

  // Fetch saved invoices for Edit/Delete popups
  const fetchSavedInvoices = useCallback(async (page = 1, search = '') => {
    try {
      setLoadingInvoices(true);
      
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getBillList(compCode || "001", page, 20);
      
      const response = await axiosInstance.get(endpoint);
      
      let invoiceData = [];
      
      if (response && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          invoiceData = response.data.data;
        } else if (Array.isArray(response.data)) {
          invoiceData = response.data;
        }
      }
      
      const uniqueInvoiceNumbers = new Set();
      
      const formattedInvoices = invoiceData
        .map((invoice, index) => {
          const voucherNo = invoice.billNo || invoice.voucherNo || invoice.invoiceNo || '';
          const customerName = invoice.customerName || 'Unknown Customer';
          const salesmanName = invoice.salesmanName || '';
          const invoiceDate = invoice.voucherDate || invoice.billDate || new Date().toISOString().split('T')[0];
          const totalAmount = invoice.billAmt || invoice.totalAmount || 0;
          const customerCode = invoice.customerCode || invoice.customercode || '';
          const salesmanCode = invoice.sManCode || invoice.salesmanCode || '';
          
          return {
            id: voucherNo,
            code: voucherNo,
            name: voucherNo,
            voucherNo: voucherNo,
            customerName: customerName,
            customerCode: customerCode,
            salesmanName: salesmanName,
            salesmanCode: salesmanCode,
            date: invoiceDate,
            totalAmount: parseFloat(totalAmount) || 0,
            displayName: voucherNo,
            rawData: invoice
          };
        })
        .filter(invoice => {
          if (!invoice.voucherNo || invoice.voucherNo.trim() === '') {
            return false;
          }
          
          if (uniqueInvoiceNumbers.has(invoice.voucherNo)) {
            return false;
          }
          
          uniqueInvoiceNumbers.add(invoice.voucherNo);
          return true;
        });
      
      // ✅ ALWAYS keep savedInvoices in sync
      setSavedInvoices(formattedInvoices);

      
      let finalResults = formattedInvoices;
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        finalResults = formattedInvoices.filter(invoice => {
          return (
            (invoice.voucherNo && invoice.voucherNo.toString().toLowerCase().includes(searchLower))
          );
        });
      }
      
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      const paginated = finalResults.slice(startIndex, endIndex);
      
      return paginated;
      
    } catch (err) {
      return [];
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  // Fetch invoice details for editing
  const fetchInvoiceDetails = async (voucherNo) => {
    try {
      setIsLoading(true);
      setError("");
      
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getVoucherDetails(voucherNo);
      
      const response = await axiosInstance.get(endpoint);
      
      if (response && response.data) {
        let invoiceData = response.data;
        
        if (response.data.data) {
          invoiceData = response.data.data;
        } else if (response.data.result) {
          invoiceData = response.data.result;
        }
        
        const header = invoiceData.header || invoiceData;
        const itemsArray = invoiceData.items || invoiceData.details || [];
        
        setIsEditing(true);
        setOriginalInvoiceNo(voucherNo);
        
        const billDate = formatDateToYYYYMMDD(
          header.billDate || header.voucherDate
        );

        setBillDetails(prev => ({
          ...prev,
          billNo: voucherNo,
          billDate: billDate,
          mobileNo: header.mobileNO || header.mobileNumber || header.mobileNo || "",
          type: header.selesType === "W" || header.salesType === "W" ? "Wholesale" : "Retail",
          salesman: header.salesmanName || header.sManName || header.salesman || "",
          salesmanCode: header.salesCode || header.sManCode || header.salesmanCode || "",
          custName: header.customerName || header.custName || "",
          custCode: header.customercode || header.customerCode || header.custCode || "",
          partyCode: header.customercode || header.customerCode || header.custCode || "",
        }));
        
        if (header.addLess !== undefined) {
          setAddLessAmount(header.addLess.toString());
        } else if (header.addLessAmount !== undefined) {
          setAddLessAmount(header.addLessAmount.toString());
        }
        
        if (itemsArray.length > 0) {
         // In fetchInvoiceDetails function:
const formattedItems = itemsArray.map((item, index) => {
  const itemCode = item.itemcode || item.fItemcode || item.itemCode || item.code || '';
  const itemName = item.itemName || item.fitemNme || item.fItemName || '';
  const units = item.fUnit || item.uom || '';
  
  return {
    id: index + 1,
    sNo: index + 1,
    barcode: item.barcode || item.fBarcode || '', // Make sure barcode is loaded
    itemCode: itemCode,
    itemName: itemName || '',
    stock: (item.stock || item.fstock || 0).toString(),
    mrp: (item.mrp || 0).toString(),
    uom: units,
    hsn: item.hsn || item.fHSN || '',
    tax: (item.tax || item.fTax || 0).toString(),
    sRate: (item.rate || item.fRate || item.sRate || 0).toString(),
    qty: (item.qty || item.fTotQty || 0).toString(),
    amount: (item.amount || item.fAmount || 0).toFixed(2),
    fdesc: item.fdesc || "",
    fserialno: item.fserialno || item.fslno || "",  // ✅ ADD SERIAL NUMBER MAPPING
    fromBarcode: false
  };
});
          
          setItems(formattedItems);
        } else {
          setItems([{
            id: 1,
            sNo: 1,
            barcode: '',
            itemCode: '',
            itemName: '',
            stock: '',
            mrp: '',
            uom: '',
            hsn: '',
            tax: '',
            sRate: '',
            qty: '',
            amount: '0.00'
          }]);
        }
        
        return invoiceData;
      } else {
        setError("No invoice data found");
        return null;
      }
    } catch (err) {
      let errorMsg = `Failed to fetch invoice details for ${voucherNo}`;
      if (err.response?.status === 404) {
        errorMsg = `Invoice ${voucherNo} not found`;
      } else if (err.response?.status === 500) {
        errorMsg = "Server error while fetching invoice details";
      } else {
        errorMsg = `Error: ${err.message || 'Unknown error'}`;
      }
      
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete invoice from database
  const deleteInvoice = async (voucherNo) => {
    try {
      setIsLoading(true);
      setError("");
      
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.deleteBillNumber(voucherNo, compCode || "001");
      
      const response = await axiosInstance.delete(endpoint);
      
      if (response && response.data) {
        const success = response.data.success !== false && 
                       response.data.message !== "Delete failed" &&
                       !response.data.error;
        
        if (success) {
          // ✅ If deleted invoice is currently opened, reset everything safely
          if (voucherNo === billDetails.billNo) {
            resetForm();
            setIsEditing(false);
            setOriginalInvoiceNo('');
          }

          return { success: true, message: "Invoice deleted successfully" };
        }
        else {
          const errorMsg = response.data.message || response.data.error || "Delete failed";
          throw new Error(errorMsg);
        }
      } else {
        throw new Error("No response from server");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to delete invoice";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ CORRECT: Get stock using FULL itemCode and read finalStock properly
  const getStockByItemName = async (itemCode) => {
    if (!itemCode || itemCode.trim() === '') {
      return { 
        stock: '0',
        itemName: '',
        mrp: '0',
        uom: '',
        fUnits: '',
        hsn: '',
        tax: '0',
        rate: '0'
      };
    }

    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getStockByItemName1(itemCode.trim())
      );

      const data = response?.data;
      const item = data?.items?.[0]; // ✅ API returns array

      return {
        stock: (item?.finalStock ?? 0).toString(), // ✅ FIXED
        itemName: item?.itemName || '',
        mrp: item?.preRate || '0',
        uom: item?.units || '',
        fUnits: item?.units || '',
        hsn: item?.hsn || '',
        tax: item?.tax || '0',
        rate: item?.preRate || '0'
      };
    } catch (err) {
      console.error("Stock API failed:", err);
      return { 
        stock: '0',
        itemName: '',
        mrp: '0',
        uom: '',
        fUnits: '',
        hsn: '',
        tax: '0',
        rate: '0'
      };
    }
  };

const getPurchaseStockDetailsByBarcode = async (barcode) => {
  if (!barcode || barcode.trim() === '') return null;

  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getPurchaseStockDetailsByBarcode(barcode.trim())
    );

    console.log("Barcode API FULL response:", response.data);

    // ✅ HANDLE REAL BACKEND RESPONSE
    const item =
      response?.data?.items?.[0] ||     // ✅ MOST IMPORTANT
      response?.data?.data?.[0] ||
      response?.data?.[0] ||
      null;

    if (!item) return null;

    return {
      barcode: item.barcode || barcode,
      itemcode: item.itemcode || item.fItemcode || '',
      fItemName: item.fItemName || item.itemName || '',
      fstock: item.fstock || item.stock || 0,
      rate: item.rate || 0,
      mrp: item.mrp || 0,
      fUnit: item.fUnit || item.uom || '',
      fHSN: item.fHSN || item.hsn || '',
      inTax: item.inTax || item.tax || 0,
      wRate: item.wRate || 0,
      rRate: item.rRate || 0,
      
      amount:  0,
      success: true
    };
  } catch (err) {
    console.error("Barcode API failed:", err);
    return null;
  }
};


// Initial data fetch
// Initial data fetch
useEffect(() => {
  const fetchInitialData = async () => {
    if (!billDetails.billNo && !isEditing) {
      await fetchNextBillNo();
    }
    
    await fetchCustomers();
    await fetchItems('FG'); // ✅ Use 'FG' for Finished Goods
    await fetchSalesmen();
    await fetchTaxList(1, 10);
    await fetchSavedInvoices(1, '');
  };
  
  fetchInitialData();
}, [fetchNextBillNo, fetchCustomers, fetchItems, fetchSalesmen, fetchSavedInvoices, isEditing, billDetails.billNo]);

  // Calculate Totals whenever items change
  useEffect(() => {
    const qtyTotal = items.reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
    const amountTotal = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);

    setTotalQty(qtyTotal);
    setTotalAmount(amountTotal);
  }, [items, gstMode]);

  // ✅ Recalculate all item amounts when GST mode changes
  useEffect(() => {
    if (items.length > 0) {
      const updatedItems = items.map(item => {
        const qty = parseFloat(item.qty) || 0;
        const sRate = parseFloat(item.sRate) || 0;
        const tax = parseFloat(item.tax) || 0;
        
        // Recalculate amount using the updated calculateAmount function
        const newAmount = calculateAmount(qty, sRate, tax);
        
        return {
          ...item,
          amount: typeof newAmount === 'string' ? newAmount : (newAmount.amount || '0.00')
        };
      });
      
      setItems(updatedItems);
    }
  }, [gstMode]); // Only depend on gstMode, not items to avoid infinite loops

  // Reset form to empty state
  const resetForm = () => {
    setBillDetails({
      billNo: '',
      billDate: new Date().toISOString().split('T')[0],
      mobileNo: '',
      type: 'Retail',
      salesman: '',
      salesmanCode: '',
      custName: '',
      custCode: '',
      barcodeInput: '',
      partyCode: '',
      transType: 'SALES INVOICE'
    });

    setItems([
      {
        id: 1,
        sNo: 1,
        barcode: '',
        itemCode: '',
        itemName: '',
        stock: '',
        mrp: '',
        uom: '', // Changed from 'pcs' to empty string
        hsn: '',
        tax: '',
        sRate: '',
        qty: '',
        amount: '0.00'
      }
    ]);
    
    setAddLessAmount('');
    setIsEditing(false);
    setOriginalInvoiceNo('');
    setActiveTopAction('add');
     setPartyBalance('0.00');
  setLastBillAmount('0.00');
    fetchNextBillNo();
  };

  // --- POPUP HANDLERS ---
  
  // Open edit invoice popup
  const openEditInvoicePopup = async () => {
    // === PERMISSION CHECK ===
    if (!formPermissions.edit) {
      toast.error("You do not have permission to edit invoices.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    // === END PERMISSION CHECK ===
    try {
      setIsLoading(true);
      
      const freshData = await fetchSavedInvoices(1, '');
      
      if (freshData.length === 0) {
        alert("No invoices found to edit. Please save an invoice first.");
        return;
      }
      
      setEditInvoicePopupOpen(true);
      
    } catch (err) {
      setEditInvoicePopupOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Open delete invoice popup
  const openDeleteInvoicePopup = async () => {
    try {
      setIsLoading(true);
      
      const freshData = await fetchSavedInvoices(1, '');
      
      if (freshData.length === 0) {
        alert("No invoices found to delete. Please save an invoice first.");
        return;
      }
      
      setDeleteInvoicePopupOpen(true);
      
    } catch (err) {
      setDeleteInvoicePopupOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle invoice selection for editing
  const handleInvoiceSelect = async (selectedInvoice) => {
    if (!selectedInvoice || !selectedInvoice.voucherNo) {
      alert("Invalid invoice selected");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const invoiceData = await fetchInvoiceDetails(selectedInvoice.voucherNo);
      
      if (invoiceData) {
        if (invoiceData) {
          // 🔒 block Enter key once after edit load
          ignoreNextEnterRef.current = true;

          // ✅ move cursor to Bill Date
          setTimeout(() => {
            if (billDateRef.current) {
              billDateRef.current.focus();
            }
            ignoreNextEnterRef.current = false;
          }, 300);

          const addLessValue = parseFloat(addLessAmount || 0);
          const finalAmount = totalAmount + addLessValue;

          setEditConfirmationData({
            invoiceNo: selectedInvoice.voucherNo,
            customer: billDetails.custName,
            billDate: billDetails.billDate,
            totalAmount: totalAmount.toFixed(2),
            addLessAmount: addLessAmount,
            finalAmount: finalAmount.toFixed(2),
            itemCount: items.filter(
              item => item.itemName && item.itemName.trim()
            ).length
          });

          setEditConfirmationOpen(true);
          setEditInvoicePopupOpen(false);
        }

        // Show edit confirmation popup
        const addLessValue = parseFloat(addLessAmount || 0);
        const finalAmount = totalAmount + addLessValue;
        
        setEditConfirmationData({
          invoiceNo: selectedInvoice.voucherNo,
          customer: billDetails.custName,
          billDate: billDetails.billDate,
          totalAmount: totalAmount.toFixed(2),
          addLessAmount: addLessAmount,
          finalAmount: finalAmount.toFixed(2),
          itemCount: items.filter(item => item.itemName && item.itemName.trim()).length
        });
        
        setEditConfirmationOpen(true);
        setEditInvoicePopupOpen(false);
      } else {
        alert(`Could not load invoice details for ${selectedInvoice.voucherNo}`);
      }
    } catch (error) {
      alert(`Error loading invoice: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle invoice deletion with confirmation popup
  const handleInvoiceDelete = async (selectedInvoice) => {
    if (!selectedInvoice || !selectedInvoice.voucherNo) {
      alert("Invalid invoice selected");
      return;
    }
    
    // Set confirmation data for delete popup
    setDeleteConfirmationData({
      invoiceNo: selectedInvoice.voucherNo,
      customer: selectedInvoice.customerName || "Unknown Customer",
      billDate: selectedInvoice.date || new Date().toISOString().split('T')[0],
      totalAmount: selectedInvoice.totalAmount || 0
    });
    
    setDeleteInvoicePopupOpen(false);
    setDeleteConfirmationOpen(true);
  };

  // Handle confirmed delete
  const handleConfirmedDelete = async () => {
    if (!deleteConfirmationData) return;

    try {
      await deleteInvoice(deleteConfirmationData.invoiceNo);

      // toast.success(
      //   `Invoice ${deleteConfirmationData.invoiceNo} deleted successfully`,
      //   { autoClose: 2500 }
      // );

      setDeleteConfirmationOpen(false);

      // ✅ RESET FORM (clears data)
      resetForm();

      // ✅ FETCH ONLY NEXT BILL NUMBER
      await fetchNextBillNo();

    } catch (err) {
      alert(`Failed to delete invoice: ${err.message}`);
      setDeleteConfirmationOpen(false);
    }
  };

  const fetchInvoicesForPopup = async (pageNum, search) => {
    try {
      setLoadingInvoices(true);

      // 🔹 Fetch from backend page-wise
      const endpoint =
        API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getBillList(compCode || "001", pageNum, 20);

      const response = await axiosInstance.get(endpoint);

      let invoiceData = [];

      if (response?.data?.data && Array.isArray(response.data.data)) {
        invoiceData = response.data.data;
      } else if (Array.isArray(response.data)) {
        invoiceData = response.data;
      }

      let formatted = invoiceData.map(inv => {
        const voucherNo = inv.billNo || inv.voucherNo || "";
        return {
          id: voucherNo,
          voucherNo,
          name: voucherNo,
          displayName: voucherNo,
          customerName: inv.customerName || "",
          date: inv.voucherDate || "",
          totalAmount: inv.billAmt || 0,
        };
      });

      // 🔍 Apply search
      if (search && search.trim()) {
        const s = search.toLowerCase();
        formatted = formatted.filter(i =>
          i.voucherNo.toLowerCase().includes(s)
        );
      }

      return formatted;
    } catch (err) {
      console.error("Popup invoice fetch failed", err);
      return [];
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Open customer popup
  const openCustomerPopup = () => {
    if (customerList.length === 0) {
      alert("No customers available.");
      return;
    }
    
    setCustomerPopupOpen(true);
  };

  // Open salesman popup
  const openSalesmanPopup = () => {
    if (salesmanList.length === 0) {
      alert("No salesmen available.");
      return;
    }
    
    setSalesmanPopupOpen(true);
  };

  // Open item popup
  const openItemPopup = (rowIndex) => {
    if (itemList.length === 0) {
      alert("No items available.");
      return;
    }
    
    setCurrentItemRowIndex(rowIndex);
    setItemPopupOpen(true);
  };

const handleCustomerSelect = async (customer) => {
  ignoreNextEnterRef.current = true;

  setBillDetails(prev => ({
    ...prev,
    custName: customer.name,
    custCode: customer.code,
    mobileNo: customer.phoneNumber || ""
  }));

  setCustomerPopupOpen(false);

  try {
    const customerCode = customer.code;
    const companyCode = compCode;

    if (customerCode && companyCode) {
      // ✅ 1. FETCH PARTY BALANCE
      const balanceResp = await axiosInstance.get(
        API_ENDPOINTS.sales_return.getCustomerBalance(
          customerCode,
          companyCode
        )
      );

      const amount = balanceResp?.data?.amount || "0.00";
      const type = balanceResp?.data?.amount1 || "";
      setPartyBalance(`${amount} ${type}`);

      // ✅ 2. FETCH LAST BILL AMOUNT - USE THE NEW API
      try {
        const lastBillResp = await axiosInstance.get(
          API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getLastBillNoByCustomer(customerCode)
        );
        
        // Response: { "lastBillNo": "C00118AA", "billAmount": 648 }
        const lastAmt = lastBillResp?.data?.billAmount ?? 
                       lastBillResp?.data?.data?.billAmount ?? 
                       0;
        
        setLastBillAmount(Number(lastAmt).toFixed(2));
        console.log("Last bill amount fetched:", lastAmt);
      } catch (lastBillErr) {
        console.error("Last bill fetch failed:", lastBillErr);
        setLastBillAmount("0.00");
      }
    } else {
      setPartyBalance("0.00");
      setLastBillAmount("0.00");
    }
  } catch (error) {
    console.error("Failed to fetch customer details:", error);
    setPartyBalance("0.00");
    setLastBillAmount("0.00");
  }

  // ✅ FOCUS TO FIRST BARCODE
  setTimeout(() => {
    document
      .querySelector('input[data-row="0"][data-field="barcode"]')
      ?.focus();
    ignoreNextEnterRef.current = false;
  }, 300);
};





  // Handle salesman selection
  const handleSalesmanSelect = (salesman) => {
    ignoreNextEnterRef.current = true; // 🔴 ADD THIS

    if (salesman) {
      setBillDetails(prev => ({
        ...prev,
        salesman: salesman.name,
        salesmanCode: salesman.originalCode || salesman.code
      }));
    }

    setSalesmanPopupOpen(false);

    // 🔁 reset after popup closes
    setTimeout(() => {
      ignoreNextEnterRef.current = false;
    }, 200);
  };


  

// 🔄 Open Customer History Modal
const openCustomerHistory = async (customerName) => {
  try {
    setCustomerHistoryLoading(true);
    setCustomerHistoryError('');
    
    // Find customer code from billDetails
    const customerCode = billDetails.custCode || billDetails.partyCode;
    
    if (!customerCode) {
      setCustomerHistoryError('Customer code not found');
      setCustomerHistoryOpen(true);
      return;
    }
    
    // Get today's date and date 1 year ago for default range
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    const fromDate = oneYearAgo.toISOString().split('T')[0]; // YYYY-MM-DD
    const toDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Call ledger API
    const response = await axiosInstance.get(
      API_ENDPOINTS.sales_return.getLedger(customerCode, compCode, fromDate, toDate)
    );
    
    if (response?.data) {
      // ✅ SET LAST BILL AMOUNT HERE
      const lastAmt = response.data.latestBillAmount ?? 0;
      setLastBillAmount(Number(lastAmt).toFixed(2));

      setCustomerHistoryData({
        customerName,
        ...response.data
      });
    } else {
      setCustomerHistoryError('No data available');
    }
  } catch (error) {
    console.error('Error fetching customer history:', error);
    setCustomerHistoryError(error.message || 'Failed to fetch customer history');
  } finally {
    setCustomerHistoryLoading(false);
    setCustomerHistoryOpen(true);
  }
};


// Handle item selection
const handleItemSelect = async (item) => {
  ignoreNextEnterRef.current = true;

  if (!item || currentItemRowIndex === null) return;

  try {
    const updatedItems = [...items];
    const currentItem = updatedItems[currentItemRowIndex];

    // Get item details from the selected item
    const itemCode = item.fItemcode || item.itemCode || item.code || '';
    const itemName = item.fItemName || item.itemName || item.name || '';
    const units = item.fUnits || item.units || "";
    // ✅ Use finalPrefix as barcode - keep empty if not available
    const barcode = item.finalPrefix || item.barcode || '';
    
    // Use stock info from the item data or fetch separately
    const stockInfo = await getStockByItemName(itemCode);
    
    // Resolve HSN
    const resolvedHsn = item.hsn || stockInfo.hsn || '';
    
    // Format values - show empty if 0
    const formatValue = (val) => {
      const numVal = parseFloat(val || 0);
      return numVal === 0 ? '' : numVal.toString();
    };

    updatedItems[currentItemRowIndex] = {
      ...currentItem,
      itemName,
      itemCode,
      // ✅ Set barcode from finalPrefix
      barcode: barcode,
      fromBarcode: false,
      stock: (item.stock || stockInfo.stock || 0).toString(),
      mrp: formatValue(item.preRate || item.mrp || stockInfo.mrp || 0), // ✅ Use preRate
      uom: units || stockInfo.uom || '',
      hsn: resolvedHsn,
      tax: formatValue(item.tax || stockInfo.tax || 0),
      sRate: formatValue(item.preRate || item.sRate || stockInfo.rate || 0), // ✅ Use preRate
      qty: currentItem.qty || '',
      amount: (() => {
        const calc = calculateAmount(
          currentItem.qty || '',
          item.preRate || item.sRate || stockInfo.rate || 0,
          item.tax || stockInfo.tax || 0
        );
        return typeof calc === 'string' ? calc : calc.amount;
      })()
    };

    setItems(updatedItems);
    console.log("Item selected with barcode:", { 
      itemName, 
      barcode,
      finalPrefix: item.finalPrefix,
      preRate: item.preRate 
    });
  } catch (err) {
    console.error("Item select failed:", err);
  } finally {
    setItemPopupOpen(false);
    setTimeout(() => {
      ignoreNextEnterRef.current = false;
    }, 200);
  }
};


  // Get popup configuration
  const getPopupConfig = (type) => {
    const configs = {
      customer: {
        displayFieldKeys: ['name'],
        searchFields: ['name'],
        headerNames: ['Customer Name'],
        columnWidths: { name: '100%' },
        searchPlaceholder: 'Search customers'
      },
      salesman: {
        displayFieldKeys: ['name'],
        searchFields: ['name'],
        headerNames: ['Salesman Name'],
        columnWidths: { name: '100%' },
        searchPlaceholder: 'Search salesmen '
      },
      item: {
        displayFieldKeys: ['popupDisplay'],
        searchFields: ['fItemcode', 'fItemName', 'itemCode', 'itemName'],
        headerNames: ['Item Name'], // Changed header name
        columnWidths: { popupDisplay: '100%' },
        searchPlaceholder: 'Search by item Name'
      },
      editInvoice: {
        displayFieldKeys: ['voucherNo'],
        searchFields: ['voucherNo'],
        headerNames: ['Invoice Number'],
        columnWidths: { voucherNo: '100%' },
        searchPlaceholder: 'Search by invoice number',
        formatRow: (item) => ({
          ...item,
          name: item.voucherNo,
          displayName: item.voucherNo
        })
      },
      deleteInvoice: {
        displayFieldKeys: ['voucherNo'],
        searchFields: ['voucherNo'],
        headerNames: ['Invoice Number'],
        columnWidths: { voucherNo: '100%' },
        searchPlaceholder: 'Search invoice to delete',
        formatRow: (item) => ({
          ...item,
          name: item.voucherNo,
          displayName: item.voucherNo
        })
      }
    };
    
    return configs[type] || configs.customer;
  };
const fetchItemsForPopup = async (pageNum, search, type) => {
  try {
    let itemsData = [];
    
    switch(type) {
      case 'customer':
        itemsData = customerList.map(customer => ({
          id: customer.code || customer.id,
          code: customer.code,
          name: customer.name,
          phoneNumber: customer.phoneNumber, 
          displayName: customer.name
        }));
        break;
        
      case 'salesman':
        itemsData = salesmanList.map(salesman => ({
          id: salesman.code || salesman.id,
          code: salesman.code,
          name: salesman.name,
          displayName: salesman.name
        }));
        break;
        
      case 'item':
        // Use the existing itemList state which is populated by fetchItems
        itemsData = itemList.map((item, index) => ({
          id: item.id || index,
          fItemcode: item.fItemcode || item.itemCode,
          fItemName: item.fItemName || item.itemName,
          fUnits: item.fUnits || item.uom,
          itemCode: item.fItemcode || item.itemCode,
          itemName: item.fItemName || item.itemName,
          code: item.fItemcode || item.itemCode,
          name: item.fItemName || item.itemName,
          hsn: item.hsn || item.fhsn || "",
          originalCode: item.fItemcode || item.itemCode,
          barcode: item.barcode,
          stock: item.stock,
          mrp: item.mrp,
          uom: item.uom,
          tax: item.tax,
          sRate: item.sRate,
          displayName: item.fItemName || item.itemName,
          popupDisplay: item.fItemName || item.itemName
        }));
        break;
        
      case 'editInvoice':
      case 'deleteInvoice':
        return await fetchInvoiceItemsForPopup(pageNum, search);
        
      default:
        itemsData = [];
    }
    
    // Apply search filter for items
    if (type === 'item' && search) {
      const searchLower = (search || '').trim().toLowerCase();
      itemsData = itemsData.filter(item => {
        const name = item.itemName || item.fItemName || item.name || '';
        return name
          .toString()
          .trim()
          .toLowerCase()
          .includes(searchLower);
      });
    }
    
    // Pagination
    const startIndex = (pageNum - 1) * 20;
    const endIndex = startIndex + 20;
    return itemsData.slice(startIndex, endIndex);
    
  } catch (err) {
    console.error("Error fetching popup items:", err);
    return [];
  }
};

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'billNo' && isEditing) {
      alert("Cannot change invoice number when editing. Please create a new invoice for a different number.");
      return;
    }
    
    setBillDetails(prev => ({ ...prev, [name]: value }));
  };

  // Handle add/less amount change
  const handleAddLessChange = (e) => {
    const value = e.target.value;
    setAddLessAmount(value);
  };

  // Handle add/less key down - Trigger save popup on Enter
  const handleAddLessKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      // Trigger save popup
      handleSave();
    }
  };

  const handleKeyDown = (e, nextRef, fieldName = '') => {
    const isLetterKey = e.key.length === 1 && /^[a-zA-Z]$/.test(e.key);

    if (isLetterKey) {
      e.preventDefault();

      ignoreNextInputRef.current = true; // 🔥 BLOCK input update
      setPopupSearchText(e.key);         // ONLY ONE LETTER

      if (fieldName === 'salesman') {
        setSalesmanPopupOpen(true);
      }

      if (fieldName === 'custName') {
        setCustomerPopupOpen(true);
      }

      return;
    }

    if (e.key === '/') {
      e.preventDefault();
      setPopupSearchText('');

      if (fieldName === 'salesman') setSalesmanPopupOpen(true);
      if (fieldName === 'custName') setCustomerPopupOpen(true);

      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  const handleHeaderArrowNavigation = (e, fieldName) => {
  const index = HEADER_FIELDS.indexOf(fieldName);
  if (index === -1) return;

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    const prev = HEADER_FIELDS[index - 1];
    if (prev) {
      document.querySelector(`[data-header="${prev}"]`)?.focus();
      setFocusedField(prev);
    }
  }

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    const next = HEADER_FIELDS[index + 1];
    if (next) {
      document.querySelector(`[data-header="${next}"]`)?.focus();
      setFocusedField(next);
    }
  }
};
  // Handle backspace in customer and salesman fields
  const handleBackspace = (e, fieldName) => {
    if (e.key === 'Backspace') {
      if (fieldName === 'salesman') {
        setBillDetails(prev => ({
          ...prev,
          salesman: '',
          salesmanCode: ''
        }));
      } else if (fieldName === 'custName') {
        setBillDetails(prev => ({
          ...prev,
          custName: '',
          custCode: '',
          partyCode: ''
        }));
      }
    }
  };

const handleBarcodeKeyDown = async (e, currentRowIndex) => {

  /* =====================================================
     ⬆️ ARROW UP → PREVIOUS ROW BARCODE
  ===================================================== */
  if (e.key === "ArrowUp") {
    e.preventDefault();
    e.stopPropagation();

    if (currentRowIndex > 0) {
      document
        .querySelector(
          `input[data-row="${currentRowIndex - 1}"][data-field="barcode"]`
        )
        ?.focus();
    }
    return;
  }

  /* =====================================================
     ⬅️ LEFT  & ➡️ RIGHT -> MOVE TO ADJACENT FIELD IN SAME ROW
  ===================================================== */
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    e.stopPropagation();

    const fieldIndex = TABLE_FIELDS.indexOf('barcode');
    if (fieldIndex === -1) return;

    if (e.key === 'ArrowLeft') {
      if (fieldIndex > 0) {
        const prev = TABLE_FIELDS[fieldIndex - 1];
        const el = document.querySelector(
          `input[data-row="${currentRowIndex}"][data-field="${prev}"], div[data-row="${currentRowIndex}"][data-field="${prev}"]`
        );
        if (el) {
          el.focus();
          if (el.tagName === 'INPUT' && typeof el.select === 'function') el.select();
        }
      }
    } else {
      if (fieldIndex < TABLE_FIELDS.length - 1) {
        const next = TABLE_FIELDS[fieldIndex + 1];
        const el = document.querySelector(
          `input[data-row="${currentRowIndex}"][data-field="${next}"], div[data-row="${currentRowIndex}"][data-field="${next}"]`
        );
        if (el) {
          el.focus();
          if (el.tagName === 'INPUT' && typeof el.select === 'function') el.select();
        }
      }
    }

    return;
  }

  /* =====================================================
     ⬇️ ARROW DOWN → NEXT ROW BARCODE
  ===================================================== */
  if (e.key === "ArrowDown") {
    e.preventDefault();
    e.stopPropagation();

    if (currentRowIndex < items.length - 1) {
      document
        .querySelector(
          `input[data-row="${currentRowIndex + 1}"][data-field="barcode"]`
        )
        ?.focus();
    }
    return;
  }

  /* =====================================================
     ⏎ ENTER ONLY BELOW
  ===================================================== */
  if (e.key !== "Enter") return;

  e.preventDefault();
  e.stopPropagation();

  const barcode = items[currentRowIndex].barcode?.trim();

  /* =====================================================
     🔁 STEP A: DUPLICATE BARCODE → INCREMENT QTY
  ===================================================== */
  const existingIndex = items.findIndex(
    (it, idx) =>
      idx !== currentRowIndex &&
      it.barcode &&
      it.barcode.trim() === barcode
  );

  if (existingIndex !== -1) {
    const updatedItems = [...items];
    const existingItem = updatedItems[existingIndex];

    const newQty = (Number(existingItem.qty) || 0) + 1;
    const calc = calculateAmount(newQty, existingItem.sRate, existingItem.tax);
    const newAmount = (typeof calc === 'string') ? calc : calc.amount;

    updatedItems[existingIndex] = {
      ...existingItem,
      qty: newQty.toString(),
      amount: newAmount
    };

    // clear scan row
    updatedItems[currentRowIndex] = {
      ...updatedItems[currentRowIndex],
      barcode: '',
      PrevBarcode: '',
      itemCode: '',
      itemName: '',
      stock: '',
      mrp: '',
      uom: '',
      hsn: '',
      tax: '',
      sRate: '',
      qty: '',
      amount: '0.00'
    };

    setItems(updatedItems);

    // keep focus in barcode
    setTimeout(() => {
      document
        .querySelector(
          `input[data-row="${currentRowIndex}"][data-field="barcode"]`
        )
        ?.focus();
    }, 50);

    return;
  }

  /* =====================================================
     🔁 STEP B: SAME BARCODE ENTER AGAIN → ITEM NAME
  ===================================================== */
  const prevBar = items[currentRowIndex].PrevBarcode?.trim();

  if (prevBar && prevBar === barcode) {
    setTimeout(() => {
      document
        .querySelector(
          `input[data-row="${currentRowIndex}"][data-field="itemName"]`
        )
        ?.focus();
    }, 0);
    return;
  }

  /* =====================================================
     1️⃣ EMPTY BARCODE → ITEM NAME
  ===================================================== */
  if (!barcode) {
    setTimeout(() => {
      document
        .querySelector(
          `input[data-row="${currentRowIndex}"][data-field="itemName"]`
        )
        ?.focus();
    }, 0);
    return;
  }

  /* =====================================================
     🔍 FETCH BARCODE DATA
  ===================================================== */
  try {
    const barcodeData = await getPurchaseStockDetailsByBarcode(barcode);

    if (!barcodeData) {
      lastBarcodeRowRef.current = currentRowIndex;
      setBarcodeErrorOpen(true);

      const updatedItems = [...items];
      updatedItems[currentRowIndex] = {
        ...updatedItems[currentRowIndex],
        barcode: '',
        PrevBarcode: '',
        itemCode: '',
        itemName: '',
        stock: '',
        mrp: '',
        uom: '',
        hsn: '',
        tax: '',
        sRate: '',
        qty: '',
        amount: '0.00'
      };
      setItems(updatedItems);
      return;
    }

    // ✅ VALID BARCODE
    const updatedItems = [...items];
   const selectedRate = getRateByType(barcodeData);

// ✅ ALWAYS DEFAULT QTY = 1 (ignore API)
const qty = DEFAULT_QTY;

const calc = calculateAmount(qty, selectedRate, barcodeData.inTax || 0);
const amount = (typeof calc === 'string') ? calc : calc.amount;


    updatedItems[currentRowIndex] = {
      ...updatedItems[currentRowIndex],
      barcode,
      PrevBarcode: barcode,
      itemCode: barcodeData.itemcode || barcode,
      itemName: barcodeData.fItemName || '',
       fromBarcode: true,
      stock: String(barcodeData.fstock || 0),
      mrp: String(barcodeData.mrp || 0),
      uom: barcodeData.fUnit || '',
      hsn: barcodeData.fHSN || '',
      tax: String(barcodeData.inTax || 0),
      sRate: selectedRate.toString(),
      qty: qty.toString(),
      amount
    };

   setItems(prevItems => {
  const nextItems = [...updatedItems];

  // ✅ CHECK: if this is LAST ROW, auto add new row
  if (currentRowIndex === prevItems.length - 1) {
    nextItems.push({
      id: prevItems.length + 1,
      sNo: prevItems.length + 1,
      barcode: '',
      itemCode: '',
      itemName: '',
      stock: '',
      mrp: '',
      uom: '',
      hsn: '',
      tax: '',
      sRate: '',
      qty: '',
      amount: '0.00'
    });
  }

  return nextItems;
});

// ✅ MOVE CURSOR TO NEXT ROW BARCODE
setTimeout(() => {
  const nextRowIndex = currentRowIndex + 1;
  const nextBarcodeInput = document.querySelector(
    `input[data-row="${nextRowIndex}"][data-field="barcode"]`
  );
  nextBarcodeInput?.focus();
}, 120);


  } catch (err) {
    console.error("Barcode fetch error:", err);
    lastBarcodeRowRef.current = currentRowIndex;
    setBarcodeErrorOpen(true);
  }
};



  
const getRateByType = (barcodeData) => {
  console.log("Determining rate for type:", billDetails.type, barcodeData);
  if (!barcodeData) return 0;

  return billDetails.type === "Wholesale"
    ? Number(barcodeData.wRate  || 0)
    : Number(barcodeData.rRate  || 0);
};

const handleTableKeyDown = (e, currentRowIndex, currentField) => {
  const fieldIndex = TABLE_FIELDS.indexOf(currentField);
  const currentItem = items[currentRowIndex];
  const isLastRow = currentRowIndex === items.length - 1;

  const hasItemName =
    currentItem.itemName && currentItem.itemName.trim() !== "";

  /* =====================================================
     ⏎ ENTER
  ===================================================== */
  if (e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();

    // ✅ EMPTY LAST ROW → SAVE
    if (
      isLastRow &&
      (!currentItem.itemName || !currentItem.itemName.trim()) &&
      (!currentItem.barcode || !currentItem.barcode.trim())
    ) {
      setTimeout(() => {
        saveButtonRef.current?.focus();
      }, 0);
      return;
    }

    // 🚫 ITEM NAME EMPTY
    if (!hasItemName) {
      if (currentRowIndex === 0) {
        toast.warning("Item Name is required", { autoClose: 1500 });
        setTimeout(() => {
          document
            .querySelector(
              `input[data-row="0"][data-field="itemName"]`
            )
            ?.focus();
        }, 0);
        return;
      }

      saveButtonRef.current?.focus();
      return;
    }

    /* =====================================================
       ✅ QTY FIELD (FINAL SALES INVOICE RULE)
    ===================================================== */
    if (currentField === "qty") {
      if (!currentItem.qty || Number(currentItem.qty) <= 0) {
        toast.warning("Please enter quantity", { autoClose: 1500 });
        return;
      }

      // ➡️ NOT last row → go to NEXT ROW BARCODE
      if (!isLastRow) {
        setTimeout(() => {
          document
            .querySelector(
              `input[data-row="${currentRowIndex + 1}"][data-field="barcode"]`
            )
            ?.focus();
        }, 50);
        return;
      }

      // ➕ LAST ROW → ADD NEW ROW
      handleAddRow();
      setTimeout(() => {
        document
          .querySelector(
            `input[data-row="${items.length}"][data-field="barcode"]`
          )
          ?.focus();
      }, 80);
      return;
    }

    /* =====================================================
       NORMAL FIELD FLOW (same row)
    ===================================================== */
    const fieldNavigation = {
      barcode: "itemName",
      itemName: "tax",
      stock: "mrp",
      mrp: "uom",
      uom: "hsn",
      hsn: "tax",
      tax: "sRate",
      sRate: "qty",
    };

    const nextField = fieldNavigation[currentField];
    if (nextField) {
      setTimeout(() => {
        const element = document.querySelector(
          `input[data-row="${currentRowIndex}"][data-field="${nextField}"], div[data-row="${currentRowIndex}"][data-field="${nextField}"]`
        );
        if (element) {
          element.focus();
          // Select text if it's an input field
          if (element.tagName === 'INPUT' && element.type === 'text') {
            element.select();
          }
        }
      }, 0);
    }
    return;
  }

  /* =====================================================
     ⬅️ LEFT
  ===================================================== */
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (fieldIndex > 0) {
      const prev = TABLE_FIELDS[fieldIndex - 1];
      const element = document.querySelector(
        `input[data-row="${currentRowIndex}"][data-field="${prev}"], div[data-row="${currentRowIndex}"][data-field="${prev}"]`
      );
      if (element) {
        element.focus();
        // Select text if it's an input field
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.select();
        }
      }
    }
    return;
  }

  /* =====================================================
     ➡️ RIGHT
  ===================================================== */
  if (e.key === "ArrowRight") {
    e.preventDefault();
    if (fieldIndex < TABLE_FIELDS.length - 1) {
      const next = TABLE_FIELDS[fieldIndex + 1];
      const element = document.querySelector(
        `input[data-row="${currentRowIndex}"][data-field="${next}"], div[data-row="${currentRowIndex}"][data-field="${next}"]`
      );
      if (element) {
        element.focus();
        // Select text if it's an input field
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.select();
        }
      }
    }
    return;
  }

  /* =====================================================
     ⬆️ UP
  ===================================================== */
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (currentRowIndex > 0) {
      const element = document.querySelector(
        `input[data-row="${currentRowIndex - 1}"][data-field="${currentField}"], div[data-row="${currentRowIndex - 1}"][data-field="${currentField}"]`
      );
      if (element) {
        element.focus();
        // Select text if it's an input field
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.select();
        }
      }
    }
    return;
  }

  /* =====================================================
     ⬇️ DOWN
  ===================================================== */
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (currentRowIndex < items.length - 1) {
      const element = document.querySelector(
        `input[data-row="${currentRowIndex + 1}"][data-field="${currentField}"], div[data-row="${currentRowIndex + 1}"][data-field="${currentField}"]`
      );
      if (element) {
        element.focus();
        // Select text if it's an input field
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.select();
        }
      }
    }
    return;
  }

  /* =====================================================
     / → ITEM POPUP
  ===================================================== */
  if (e.key === "/" && currentField === "itemName") {
    e.preventDefault();
    openItemPopup(currentRowIndex);
  }
};



  const handleAddItem = async () => {
    if (!billDetails.barcodeInput) {
      toast.warning("Please enter barcode");
      return;
    }

    try {
      // First try to fetch from barcode API
      const barcodeData = await getPurchaseStockDetailsByBarcode(billDetails.barcodeInput);
      const selectedRate = getRateByType(barcodeData);
      if (barcodeData) {
        // Add item from barcode API
        const newItem = {
          id: items.length + 1,
          sNo: items.length + 1,
          barcode: billDetails.barcodeInput,
          itemCode: barcodeData.itemcode || billDetails.barcodeInput,
          itemName: barcodeData.fItemName || '',
          stock: (barcodeData.fstock || 0).toString(),
          mrp: (barcodeData.mrp || 0).toString(),
          uom: barcodeData.fUnit || '',
          hsn: barcodeData.fHSN || '',
          tax: (barcodeData.inTax || 0).toString(),          
          qty: barcodeData.qty,
          sRate: selectedRate.toString(),
          amount: '0.00'
        };
        console.log("Adding item from barcode API:", newItem);
        setItems([...items, newItem]);
        setBillDetails(prev => ({ ...prev, barcodeInput: '' }));
        if (barcodeRef.current) barcodeRef.current.focus();
        
        // toast.success(`Item "${barcodeData.fItemName}" added from barcode`, {
        //   autoClose: 1500,
        // });
      } else {
        // If barcode API fails, try local lookup
        const existingItemInList = itemList.find(item => 
          item.barcode === billDetails.barcodeInput || 
          item.itemCode === billDetails.barcodeInput ||
          item.code === billDetails.barcodeInput
        );

        if (existingItemInList) {
          handleAddItemFromLocal(existingItemInList);
        } else {
          const stockInfo = await getStockByItemName(billDetails.barcodeInput);
          
          if (stockInfo.itemName) {
            const newItem = {
              id: items.length + 1,
              sNo: items.length + 1,
              barcode: billDetails.barcodeInput,
              itemCode: billDetails.barcodeInput,
              itemName: stockInfo.itemName,
              stock: stockInfo.stock || '0',
              mrp: stockInfo.mrp || '0',
              uom: stockInfo.fUnits || stockInfo.uom || '',
              hsn: stockInfo.hsn || '',
              tax: stockInfo.tax || '0',
              sRate: stockInfo.rate || '0',
              qty: '',
              amount:'0.00'
            };
            
            setItems([...items, newItem]);
            setBillDetails(prev => ({ ...prev, barcodeInput: '' }));
            if (barcodeRef.current) barcodeRef.current.focus();
          } else {
            alert("Item not found. Please check the barcode.");
          }
        }
      }
    } catch (err) {
      alert("Failed to add item. Please try again.");
    }
  };

  const handleAddItemFromLocal = (itemData) => {
    const existingItemIndex = items.findIndex(item =>
      (item.barcode === itemData.barcode || 
       item.barcode === itemData.itemCode ||
       item.barcode === itemData.code) && 
      item.barcode !== ''
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      const newQty = (parseFloat(existingItem.qty) || 0) + 1;
      const calc = calculateAmount(newQty, existingItem.sRate || existingItem.rate, existingItem.tax);
      const newAmount = (typeof calc === 'string') ? calc : calc.amount;

      updatedItems[existingItemIndex] = {
        ...existingItem,
        qty: newQty.toString(),
        amount: newAmount
      };

      setItems(updatedItems);
    } else {
      const newItem = {
        id: items.length + 1,
        sNo: items.length + 1,
        barcode: itemData.barcode || itemData.itemCode || itemData.code,
        itemName: itemData.fItemName || itemData.itemName || itemData.name,
        itemCode: itemData.fItemcode || itemData.itemCode || itemData.code,
        stock: (itemData.stock || itemData.stockQty || itemData.quantity || 0).toString(),
        mrp: (itemData.mrp || itemData.sellingPrice || itemData.price || 0).toString(),
        uom: itemData.fUnits || itemData.uom || "",
        hsn: itemData.hsnCode || itemData.hsn || "",
        tax: (itemData.taxRate || itemData.tax || 0).toString(),
        sRate: (itemData.sellingPrice || itemData.sRate || itemData.price || 0).toString(),
        qty: '',
        amount: (itemData.sellingPrice || itemData.price || 0).toFixed(2)
      };

      setItems([...items, newItem]);
    }

    setBillDetails(prev => ({ ...prev, barcodeInput: '' }));
    if (barcodeRef.current) barcodeRef.current.focus();
  };

  const handleAddRow = () => {
    const lastItem = items[items.length - 1];

    // 🚫 BLOCK adding row if item name is empty
    if (!lastItem.itemName || lastItem.itemName.trim() === '') {
      toast.warning("Please select an item before adding a new row");
      return;
    }

    // 🚫 BLOCK adding row if amount is 0
    if (parseFloat(lastItem.amount || 0) === 0) {
      toast.warning("Amount is 0. Please add SRate before adding new row", {
        autoClose: 3000,
      });
      return;
    }

    const newRow = {
      id: items.length + 1,
      sNo: items.length + 1,
      barcode: '',
      itemCode: '',
      itemName: '',
      stock: '',
      mrp: '',
      uom: '',
      hsn: '',
      tax: '',
      sRate: '',
      qty: '',
      amount: '0.00'
    };

    setItems(prev => [...prev, newRow]);
  };
const handleItemChange = (id, field, value) => {

  // ✅ RESET EMPTY-ROW WARNING WHEN ITEM NAME IS TYPED
  if (field === 'itemName' && value.trim() !== '') {
    warnedEmptyRowRef.current[id - 1] = false;
  }

  setItems(items.map(item => {
    if (item.id === id) {
      const updatedItem = { ...item, [field]: value };

      // Recalculate amount if qty, sRate, or tax changes
      if (field === 'qty' || field === 'sRate' || field === 'tax') {
        const qtyVal = field === 'qty' ? value : updatedItem.qty;
        const sRateVal = field === 'sRate' ? value : updatedItem.sRate;
        const taxVal = field === 'tax' ? value : (updatedItem.tax || 0);
        const calc = calculateAmount(qtyVal, sRateVal, taxVal);
        updatedItem.amount = typeof calc === 'string' ? calc : calc.amount;
        updatedItem.taxAmount = typeof calc === 'string' ? '0.00' : calc.taxAmount;
      }

      return updatedItem;
    }
    return item;
  }));
};



  const handleDeleteRow = (id) => {
  deleteInProgressRef.current = true; // 🔒 LOCK
  setFocusedField('');                // 🔥 CLEAR ANY FOCUS STATE

  const itemToDelete = items.find(item => item.id === id);
  const itemName = itemToDelete?.itemName || 'this item';

  setRowToDelete({ id, itemName });
  setRowDeleteConfirmationOpen(true);
};


  // Handle confirmed row deletion
const handleConfirmedRowDelete = () => {
  if (!rowToDelete) return;

  const { id } = rowToDelete;

  let updatedItems = [];

  if (items.length > 1) {
    updatedItems = items
      .filter(item => item.id !== id)
      .map((item, index) => ({
        ...item,
        sNo: index + 1,
        id: index + 1 // 🔥 VERY IMPORTANT (stable ids)
      }));
  } else {
    updatedItems = [{
      id: 1,
      sNo: 1,
      barcode: '',
      itemCode: '',
      itemName: '',
      stock: '',
      mrp: '',
      uom: '',
      hsn: '',
      tax: '',
      sRate: '',
      qty: '',
      amount: '0.00'
    }];
  }

  setItems(updatedItems);
  setRowDeleteConfirmationOpen(false);
  setRowToDelete(null);
  setFocusedField('');

  // ✅ SINGLE, CONTROLLED FOCUS
  requestAnimationFrame(() => {
    const focusIndex = Math.min(
      items.findIndex(i => i.id === id),
      updatedItems.length - 1
    );

    const barcodeInput = document.querySelector(
      `input[data-row="${focusIndex >= 0 ? focusIndex : 0}"][data-field="barcode"]`
    );

    barcodeInput?.focus();
    deleteInProgressRef.current = false; // 🔓 UNLOCK
  });
};


  const handleClear = () => {
    setClearConfirmationOpen(true);
  };

  const handleConfirmedClear = () => {
    setClearConfirmationOpen(false);
    resetForm();
  };

  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) {
      return new Date().toISOString().split('T')[0];
    }

    // ✅ Already correct format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // ✅ Handle: DD-MM-YYYY or DD/MM/YYYY
    if (/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split(/[\/-]/);
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // ✅ Handle: DD-MM-YYYY HH:mm:ss or DD/MM/YYYY HH:mm:ss
    if (/^\d{2}[\/-]\d{2}[\/-]\d{4}\s+/.test(dateString)) {
      const datePart = dateString.split(' ')[0];
      const [day, month, year] = datePart.split(/[\/-]/);
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    console.warn("Unrecognized date format:", dateString);
    return new Date().toISOString().split('T')[0];
  };

  // ========== SAVE FUNCTION ==========
  const saveSalesInvoice = async () => {
    if (isSaving) {
      return;
    }

    try {
     

    // 🔒 FINAL SAFETY VALIDATION
if (!billDetails.custName || billDetails.custName.trim() === "") {
  throw new Error("Customer is required");
}


      const validItems = items.filter(
        item =>
          item.itemName &&
          item.itemName.trim() !== "" &&
          Number(item.qty) > 0
      );

      if (validItems.length === 0) {
        throw new Error("At least one item is required");
      }



       const hasValidtax = validItems.some(item =>         
        item.tax && String(item.tax).trim() !== '' && String(item.tax) !== '0'
      );


      if (!hasValidtax) {
        throw new Error("Please enter tax for at least one item before saving");    
      }


      setIsSaving(true);
      setIsLoading(true);
      setError(null);
      // Format date to yyyy-MM-dd (without time)
      const voucherDate = formatDateToYYYYMMDD(billDetails.billDate);

      const headerData = {
        voucherNo: billDetails.billNo || "",
        billDate: voucherDate,      // ✅ CORRECT FIELD
        voucherDate: voucherDate,   // ✅ KEEP BOTH (SAFE)
        mobileNumber: billDetails.mobileNo || "",
        salesmanName: billDetails.salesman || "",
        salesCode: billDetails.salesmanCode || "",
        selesType: billDetails.type === 'Wholesale' ? 'W' : 'R',
        customerName: billDetails.custName || "",
        customercode: billDetails.custCode || "",
        compCode: compCode,
        billAmount: netAmountRounded,
        balanceAmount: 0,
        userCode: userCode,
        barcode: "",
        fmode: gstMode === "Inclusive" ? "I" : "E",
        ftaxrs: gstRate || "18"  // ✅ ADD GST RATE FIELD
      };

     // Prepare items data
const itemsData = validItems.map(item => {
  // Calculate tax amount based on gstMode
  let taxAmount = 0;
  if (item.tax) {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.sRate) || 0;
    const tax = Number(item.tax) || 0;
    
    if (gstMode === 'Inclusive') {
      const total = qty * rate;
      taxAmount = tax === 0 ? 0 : (total * tax) / (100 + tax);
    } else {
      const base = qty * rate;
      taxAmount = (base * tax) / 100;
    }
  }
  
  return {
    barcode: item.barcode || "", // Make sure barcode is included
    itemName: item.itemName || "",
    itemcode: item.itemCode || "",
    mrp: (Number(item.mrp) || 0).toFixed(2),
    stock: (item.stock ?? "0").toString(),
    uom: item.uom || "pcs",
    hsn: item.hsn || "",
    tax: Number(item.tax) || 0,
    rate: Number(item.sRate) || 0,
    qty: Number(item.qty) || 0,
    amount: Number(item.amount) || 0,
    fdesc: item.fdesc || "" ,
    fSlNo: item.fserialno || "",
    ftaxamt: taxAmount.toFixed(2)  // ✅ ADD TAX AMOUNT
  };
});
      
      const requestData = {
        header: headerData,
        items: itemsData
      };
      console.log("Request Data:", JSON.stringify(requestData));
      
      // Determine if this is an insert or update
      const isInsert = !isEditing;
      
      // Use the correct endpoint based on insert/update
      const endpoint = isInsert 
        ? API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.CREATE_SALES
        : API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.UPDATE_SALES;
      
      const response = await axiosInstance.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      if (response && response.data) {
        const message = response.data.message || `Invoice ${isEditing ? 'updated' : 'saved'} successfully`;
        const savedBillNo = response.data.voucherNo || billDetails.billNo;
        
        // Build print data for printing
        const billDataForPrint = buildBillData();
        setPrintBillData(billDataForPrint);
        
        // Show print confirmation popup
        setPrintConfirmationOpen(true);
        
        // Refresh saved invoices list
        await fetchSavedInvoices(1, '');
        
        // Don't reset form yet - wait for print confirmation
        // resetForm();
        
        return response.data;
      }
    } catch (err) {
      let errorMsg = `Failed to ${isEditing ? 'update' : 'save'} sales invoice`;
      
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
        errorMsg = `Invoice number ${billDetails.billNo} already exists. Please use a different number or edit the existing invoice.`;
      }
      
      setError(errorMsg);
      toast.error(errorMsg, {
  position: "top-right",
  autoClose: 5000,
});

    } finally {
      setIsLoading(false);
      setIsSaving(false);
      setCustomerMessageShown(false);
    }
  };

  const handleSave = () => {
    // 🔐 Permission check
    if (!formPermissions.add && !formPermissions.edit) {
      toast.error("You do not have permission to save invoices.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }




 if (!billDetails.custName || billDetails.custName.trim() === "") {
  if (!validationToastShownRef.current) {
    validationToastShownRef.current = true;

    toast.warning("Please fill the Customer name", {
      autoClose: 2000,
      onClose: () => {
        validationToastShownRef.current = false;
      }
    });
  }
  return;
}


    // ❌ Item validation
    const validItems = items.filter(
      item =>
        item.itemName &&
        item.itemName.trim() !== "" &&
        Number(item.qty) > 0
    );

    if (validItems.length === 0) {
      toast.warning("Please add at least one Item with quantity", {
        autoClose: 2000,
      });
      return;
    }

    // ❌ Check for items with 0 amount
    const itemsWithZeroAmount = validItems.filter(item => parseFloat(item.amount || 0) === 0);
    if (itemsWithZeroAmount.length > 0) {
      toast.warning("Cannot save invoice with items having 0 amount. Please check item rates.", {
        autoClose: 3000,
      });
      return;
    }

       const hasValidtax = items.some(item =>         
        item.tax && item.tax.trim() !== '' 
      );


      if (!hasValidtax) {
        toast.warning("Please enter tax for all items before saving", {
          autoClose: 2000,
        });
        return;    
      }

    // ✅ ALL OK → Open save confirmation popup
    const finalAmount = totalAmount; // Removed addLessAmount

    setSaveConfirmationData({
      invoiceNo: isEditing ? originalInvoiceNo : billDetails.billNo,
      customer: billDetails.custName,
      billDate: billDetails.billDate,
      totalAmount: totalAmount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
      isEditing: isEditing,
    });

    setSaveConfirmationOpen(true);
  };

  // Function to show save confirmation popup
  const showSaveConfirmation = () => {
    if (isSaving) {
      return;
    }
    
    if (!billDetails.custName) {
      if (
        items.length === 0 ||
        items.every(item => !item.itemName || parseFloat(item.qty || 0) <= 0)
      ) {
        toast.warning("Please add a customer Name", {
          position: "top-right",
          autoClose: 2000,
        });
      }
      return;
    }

    if (
      items.length === 0 ||
      items.every(item => !item.itemName || parseFloat(item.qty || 0) <= 0)
    ) {
      toast.warning("Please add at least one item with quantity", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }
    
    // Calculate final amount with add/less
    const addLessValue = parseFloat(addLessAmount || 0);
    const finalAmount = totalAmount + addLessValue;
    
    // Set confirmation data
    setSaveConfirmationData({
      invoiceNo: isEditing ? originalInvoiceNo : billDetails.billNo,
      customer: billDetails.custName,
      billDate: billDetails.billDate,
      totalAmount: totalAmount.toFixed(2),
      addLessAmount: addLessAmount,
      finalAmount: finalAmount.toFixed(2),
      isEditing: isEditing
    });
    
    // Open confirmation popup
    setSaveConfirmationOpen(true);
  };

  // Function to handle confirmed save
  const handleConfirmedSave = async () => {
    setSaveConfirmationOpen(false);
    await saveSalesInvoice();
  };

  // Function to handle confirmed edit
  const handleConfirmedEdit = async () => {
    setEditConfirmationOpen(false);
    await saveSalesInvoice();
  };

  // Build billData for printing
  const buildBillData = () => {
    const validItems = items.filter(item => 
      item.itemName && item.itemName.trim() !== '' && 
      item.itemCode && item.itemCode.trim() !== ''
    );
    
    return {
      voucherNo: billDetails.billNo,
      voucherDate: billDetails.billDate,
      salesmanName: billDetails.salesman,
      customercode: billDetails.custCode || '',
      customerName: billDetails.custName,
      netAmount: netAmountRounded,
      items: validItems.map(item => ({
        itemName: item.itemName || 'N/A',
        rate: parseFloat(item.sRate) || 0,
        qty: parseFloat(item.qty) || 0,
        amount: parseFloat(item.amount) || 0
      }))
    };
  };

  const handlePrint = () => {
    setPrintConfirmationOpen(true);
  };

  const handleConfirmedPrint = () => {
    setPrintConfirmationOpen(false);

    // Trigger print via PrintReceipt ref
    if (printReceiptRef.current) {
      printReceiptRef.current.print();
    }
    
    // Reset form after print
    resetForm();
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
    inputWithIconWrapper: {
      position: "relative",
      width: "100%",
      flex: 1,
    },

    searchIconInside: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      opacity: 0.7,
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
      gap: screenSize.isMobile ? '2px' : screenSize.isTablet ? '8px' : '10px',
    },
    inlineLabel: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#333',
      minWidth: screenSize.isMobile ? '60px' : screenSize.isTablet ? '70px' : '75px', // ✅ REDUCED
      whiteSpace: 'nowrap',
      flexShrink: 0,
      marginLeft: screenSize.isMobile ? '4px' : screenSize.isTablet ? '6px' : '8px',
    },
    inlineInput: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
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
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
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
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
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
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
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
    editableInputClickable: {
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
      minHeight: screenSize.isMobile ? '28px' : screenSize.isTablet ? '32px' : '35px',
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
    // UOM specific styles
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
      minHeight: screenSize.isMobile ? '28px' : screenSize.isTablet ? '32px' : '35px',
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
      minHeight: screenSize.isMobile ? '28px' : screenSize.isTablet ? '32px' : '35px',
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

  // Add smooth scrollbar styles to global CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sale-invoice-scrollable::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
        input[data-field="uom"] {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    text-align: center !important;
    background: transparent !important;
  }

  input[data-field="uom"]:focus {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }
      
      .sale-invoice-scrollable::-webkit-scrollbar-track {
        background-color: #f0f0f0;
        border-radius: 4px;
      }
      
      .sale-invoice-scrollable::-webkit-scrollbar-thumb {
        background-color: #1B91DA;
        border-radius: 4px;
      }
      
      .sale-invoice-scrollable::-webkit-scrollbar-thumb:hover {
        background-color: #1479c0;
      }
      
      .sale-invoice-scrollable {
        scrollbar-width: thin;
        scrollbar-color: #1B91DA #f0f0f0;
      }
      
      input[data-row]:hover {
        border: none !important;
        box-shadow: none !important;
      }
      
      .header-input:hover,
      input:not([data-row]):hover,
      select:hover {
        
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    <div
      style={styles.container}
      className="sale-invoice-scrollable"
      onKeyDown={(e) => {
        // Only block Enter if it's from popup selection
        if (ignoreNextEnterRef.current && e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          ignoreNextEnterRef.current = false; // Reset immediately
        }
      }}
    >

     
      
      {(isLoading || loadingInvoices) && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div>Loading...</div>
          </div>
        </div>
      )}

      {/* --- HEADER SECTION --- */}

{/* --- HEADER SECTION --- */}
<div style={styles.headerSection}>
  {/* First Row */}
  <div style={{
    ...styles.gridRow,
    gridTemplateColumns: screenSize.isMobile ? 
      '1fr 1fr' : 
      '0.5fr 0.5fr 0.7fr 0.5fr 0.5fr',
    gap: screenSize.isMobile ? '12px' : ''
  }}>
    {/* Ref No */}
    <div style={{
      ...styles.formField,
      gridColumn: screenSize.isMobile ? 'span 1' : ''
    }}>
      <label style={styles.inlineLabel}>Ref No:</label>
      <input
        type="text"
        value={billDetails.billNo}
        name="billNo"
        readOnly
        tabIndex={-1}
        ref={billNoRef}
        style={{
          ...styles.inlineInput,
          cursor: "not-allowed",
          fontWeight: "600",
          fontSize: screenSize.isMobile ? '13px' : ''
        }}
        title="Auto-generated invoice number"
      />
    </div>

    {/* Entry Date */}
    <div style={{
      ...styles.formField,
      gridColumn: screenSize.isMobile ? 'span 1' : ''
    }}>
      <label style={styles.inlineLabel}>Entry Date:</label>
      <input
        type="date"
        data-header="billDate"
        style={
          focusedField === 'billDate'
            ? { 
                ...styles.inlineInputFocused, 
                padding: screenSize.isMobile ? '6px 8px' : '8px 10px',
                fontSize: screenSize.isMobile ? '13px' : ''
              }
            : { 
                ...styles.inlineInput, 
                padding: screenSize.isMobile ? '6px 8px' : '8px 10px',
                fontSize: screenSize.isMobile ? '13px' : ''
              }
        }
        value={billDetails.billDate}
        name="billDate"
        onChange={handleInputChange}
        ref={billDateRef}
        onKeyDown={(e) => {
          handleHeaderArrowNavigation(e, 'billDate');
          handleKeyDown(e, salesmanRef, 'billDate');
        }}
        onFocus={() => setFocusedField('billDate')}
        onBlur={() => setFocusedField('')}
      />
    </div>

    {/* Salesman */}
    <div style={{
      ...styles.formField,
      gridColumn: screenSize.isMobile ? 'span 2' : ''
    }}>
      <label style={styles.inlineLabel}>Salesman:</label>
      <div style={{ position: 'relative', width: '100%', flex: 1 }}>
        <input
          type="text"
          data-header="salesman"
          style={{
            ...(focusedField === 'salesman'
              ? styles.inlineInputClickableFocused
              : styles.inlineInputClickable),
            paddingRight: '34px',
            fontSize: screenSize.isMobile ? '13px' : ''
          }}
          value={billDetails.salesman}
          name="salesman"
          onChange={(e) => {
            if (ignoreNextInputRef.current) {
              ignoreNextInputRef.current = false;
              return;
            }
            handleInputChange(e);
          }}
          ref={salesmanRef}
          onClick={openSalesmanPopup}
          onKeyDown={(e) => {
            handleHeaderArrowNavigation(e, 'salesman');
            handleKeyDown(e, typeRef, 'salesman');
            handleBackspace(e, 'salesman');
          }}
          onFocus={() => setFocusedField('salesman')}
          onBlur={() => setFocusedField('')}
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
          <SearchIcon />
        </div>
      </div>
      <PopupScreenModal screenIndex={7} />
    </div>

    {/* Type */}
    <div style={{ 
      ...styles.formField, 
      gap: '4px',
      gridColumn: screenSize.isMobile ? 'span 1' : ''
    }}>
      <label
        style={{
          ...styles.inlineLabel,
          minWidth: screenSize.isMobile ? '40px' : '50px'
        }}
      >
        Type:
      </label>
      <select
        name="type"
        data-header="type"
        style={{
          ...(focusedField === 'type' ? styles.inlineInputFocused : styles.inlineInput),
          fontSize: screenSize.isMobile ? '13px' : ''
        }}
        value={billDetails.type}
        onChange={handleInputChange}
        ref={typeRef}
        onKeyDown={(e) => {
          handleHeaderArrowNavigation(e, 'type');
          if (e.key === 'Enter') {
              e.preventDefault();
              ignoreNextEnterRef.current = true;
              gstModeRef.current.focus();
          }
        }}
        onFocus={() => setFocusedField('type')}
        onBlur={() => setFocusedField('')}
      >
        <option value="Retail">Retail</option>
        <option value="Wholesale">Wholesale</option>
      </select>
    </div>

    {/* GST Mode */}
    <div style={{
      ...styles.formField,
      gridColumn: screenSize.isMobile ? 'span 1' : ''
    }}>
      <label style={styles.inlineLabel}>GST Mode:</label>
      <input
        type="text"
        data-header="gstMode"
        value={gstMode}
        ref={gstModeRef}
        readOnly
        onKeyDown={(e) => {
          handleHeaderArrowNavigation(e, 'gstMode');
          
          if (e.key === ' ') {
            e.preventDefault();
            setGstMode(prev =>
              prev === 'Inclusive' ? 'Exclusive' : 'Inclusive'
            );
          }

          if (e.key === 'Enter') {
            if (ignoreNextEnterRef.current) {
              e.preventDefault();
              ignoreNextEnterRef.current = false;
              return;
            }
            e.preventDefault();
            setTimeout(() => custNameRef.current?.focus(), 0);
          }
        }}
        style={
          focusedField === 'gstMode'
            ? { 
                ...styles.inlineInputFocused, 
                fontWeight: '600', 
                cursor: 'pointer',
                fontSize: screenSize.isMobile ? '13px' : ''
              }
            : { 
                ...styles.inlineInput, 
                fontWeight: '600', 
                cursor: 'pointer',
                fontSize: screenSize.isMobile ? '13px' : ''
              }
        }
        onFocus={() => setFocusedField('gstMode')}
        onBlur={() => setFocusedField('')}
      />
    </div>
  </div>

  {/* Second Row */}
  <div style={{
    ...styles.gridRow,
    gridTemplateColumns: screenSize.isMobile ? 
      '1fr 1fr' : 
      '2fr 1fr 1fr 1fr 1fr',
    gap: screenSize.isMobile ? '12px' : ''
  }}>
    {/* Customer */}
    <div style={{
      ...styles.formField,
      gridColumn: screenSize.isMobile ? 'span 2' : ''
    }}>
      <label style={styles.inlineLabel}>Customer:</label>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          data-header="custName"
          style={{
            ...(focusedField === 'custName'
              ? styles.inlineInputClickableFocused
              : styles.inlineInputClickable),
            paddingRight: '34px',
            fontSize: screenSize.isMobile ? '13px' : ''
          }}
          value={billDetails.custName}
          name="custName"
          onChange={handleInputChange}
          ref={custNameRef}
          onFocus={() => setFocusedField('custName')}
          onKeyDown={(e) => {
            handleHeaderArrowNavigation(e, 'custName');

            if (e.key === '/') {
              e.preventDefault();
              setPopupSearchText('');
              setCustomerPopupOpen(true);
              return;
            }

            if (e.key === 'Enter') {
              e.preventDefault();

              if (!billDetails.custName || billDetails.custName.trim() === '') {
                toast.warning('Please select Customer first', {
                  autoClose: 1500,
                });
                setTimeout(() => custNameRef.current?.focus(), 0);
                return;
              }

              mobileRef.current?.focus();
            }

            handleBackspace(e, 'custName');
          }}
        />

        <div
          onClick={openCustomerPopup}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.65,
            cursor: 'pointer'
          }}
        >
          <SearchIcon />
        </div>
      </div>
      <PopupScreenModal screenIndex={6} />
    </div>

    {/* Mobile No */}
    <div style={{
      ...styles.formField,
      gridColumn: screenSize.isMobile ? 'span 1' : ''
    }}>
      <label style={styles.inlineLabel}>Mobile No:</label>
      <input
        type="text"
        data-header="mobileNo"
        value={billDetails.mobileNo}
        name="mobileNo"
        ref={mobileRef}
        onChange={handleMobileChange}
        onKeyDown={(e) => {
          handleHeaderArrowNavigation(e, 'mobileNo');

          if (
            ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
          ) return;

          if (e.key === 'Enter') {
            e.preventDefault();
            setTimeout(() => {
              document
                .querySelector('input[data-row="0"][data-field="barcode"]')
                ?.focus();
            }, 0);
            return;
          }

          if (!/^\d$/.test(e.key) || billDetails.mobileNo.length >= 10) {
            e.preventDefault();
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const pasted = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 10);
          setBillDetails(prev => ({ ...prev, mobileNo: pasted }));
        }}
        style={
          focusedField === 'mobileNo'
            ? {
                ...styles.inlineInputFocused,
                fontSize: screenSize.isMobile ? '13px' : ''
              }
            : {
                ...styles.inlineInput,
                fontSize: screenSize.isMobile ? '13px' : ''
              }
        }
        onFocus={() => setFocusedField('mobileNo')}
        onBlur={() => setFocusedField('')}
      />
    </div>

    {/* Party Balance */}
    <div style={{
      ...styles.formField,
      gridColumn: screenSize.isMobile ? 'span 1' : ''
    }}>
      <label style={styles.inlineLabel}>Party Bal:</label>
      <input
        type="text"
        value={partyBalance}
        readOnly
        tabIndex={-1}
        style={{
          ...styles.inlineInput,
          fontWeight: '600',
          fontSize: screenSize.isMobile ? '13px' : '',
          cursor: 'not-allowed'
        }}
      />
    </div>

 {/* Last Bill Amount + History */}
<div style={{
  ...styles.formField,
  gridColumn: screenSize.isMobile ? 'span 1' : ''
}}>
  <label style={{
    ...styles.inlineLabel,
    fontSize: screenSize.isMobile ? '12px' : ''
  }}>Last Bill Amt:</label>

  <div style={{ position: 'relative', width: '100%' }}>
    <input
      type="text"
      value={lastBillAmount || '0.00'}
      readOnly
      tabIndex={-1}
      style={{
        ...styles.inlineInput,
        fontWeight: '600',
        paddingRight: screenSize.isMobile ? '30px' : '36px',
        fontSize: screenSize.isMobile ? '13px' : '',
        cursor: 'default'
      }}
    />

    {/* 🔁 History Icon */}
    <div
      onClick={() => {
        if (billDetails.custName && billDetails.custName.trim() !== '') {
          openCustomerHistory(billDetails.custName);
        } else {
          toast.warning('Please select a customer first', { autoClose: 1500 });
        }
      }}
      title="View Customer History"
      style={{
        position: 'absolute',
        right: screenSize.isMobile ? '6px' : '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        color: '#4d7cfe',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <HistoryIcon />
    </div>
  </div>
</div>

    <div style={{
      marginLeft: screenSize.isMobile ? '0' : '80px',
      gridColumn: screenSize.isMobile ? 'span 2' : ''
    }}>
      <PopupScreenModal screenIndex={5} />
    </div>
  </div>
</div>

      {/* --- TABLE SECTION --- */}
  <div style={styles.tableSection} className="sale-invoice-scrollable">
  <div
    style={styles.tableContainer}
    className="sale-invoice-scrollable"
    onKeyDown={(e) => {
      if (e.key === 'Enter' && blockTableEnterRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    }}
  >
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>S.No</th>
          <th style={{ ...styles.th, textAlign: 'left' }}>Barcode</th> {/* LEFT ALIGN */}
          <th style={{ ...styles.th, ...styles.itemNameContainer, textAlign: 'left' }}>Item Name</th> {/* LEFT ALIGN */}
          <th style={{ ...styles.th, textAlign: 'right' }}>Stock</th> {/* RIGHT ALIGN */}
          <th style={{ ...styles.th, textAlign: 'right' }}>MRP</th> {/* RIGHT ALIGN */}
          <th style={{ ...styles.th, textAlign: 'right' }}>UOM</th> {/* RIGHT ALIGN */}
          <th style={{ ...styles.th, textAlign: 'right' }}>HSN</th> {/* RIGHT ALIGN */}
          <th style={{ ...styles.th, textAlign: 'right' }}>Tax (%)</th> {/* RIGHT ALIGN */}
          <th style={{ ...styles.th, textAlign: 'right' }}>Tax Amt</th> {/* RIGHT ALIGN */}
          <th style={{ ...styles.th, textAlign: 'right' }}>SRate</th> {/* RIGHT ALIGN */}
          <th style={{ ...styles.th, textAlign: 'right' }}>Qty</th> {/* RIGHT ALIGN */}
          <th style={{ ...styles.th, ...styles.amountContainer, textAlign: 'right' }}>Amount</th> {/* RIGHT ALIGN */}
          <th style={styles.th}>Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
            <td style={styles.td}>{item.sNo}</td>
            <td style={{ ...styles.td, textAlign: 'left' }}> {/* LEFT ALIGN */}
              <input
                ref={(el) => {
                  if (el) barcodeInputRefs.current[index] = el;
                }}
                style={focusedField === `barcode-${item.id}`
                  ? { ...styles.editableInputFocused, textAlign: 'left' }
                  : { ...styles.editableInput, textAlign: 'left' }}
                value={item.barcode || ""}
                data-row={index}
                data-field="barcode"
                onChange={(e) => {
                  handleItemChange(item.id, 'barcode', e.target.value);
                }}
                onKeyDown={(e) => {
                  handleBarcodeKeyDown(e, index);
                }}
                onFocus={() => {
                  if (deleteInProgressRef.current) return;
                  setFocusedField(`barcode-${item.id}`);
                }}
                onBlur={() => setFocusedField('')}
              />
            </td>
            <td style={{ ...styles.td, ...styles.itemNameContainer, textAlign: 'left' }}> {/* LEFT ALIGN */}
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  style={{
                    ...(focusedField === `itemName-${item.id}`
                      ? { ...styles.editableInputClickableFocused, textAlign: 'left' }
                      : { ...styles.editableInputClickable, textAlign: 'left' }),
                    paddingRight: '26px',
                  }}
                  value={item.itemName}
                  data-row={index}
                  data-field="itemName"
                  onChange={(e) => {
                    if (ignoreNextInputRef.current) {
                      ignoreNextInputRef.current = false;
                      return;
                    }
                    handleItemChange(item.id, 'itemName', e.target.value);
                  }}
                  onKeyDown={(e) => {
                    const handled = handleItemNameLetterKey(e, index);
                    if (handled) return;

                    if (e.key === 'Enter') {
                      e.preventDefault();

                      // ✅ ITEM NAME EMPTY → ALLOW TABLE HANDLER TO MOVE TO SAVE
                      if (!item.itemName || !item.itemName.trim() && item.fromBarcode) {
                        handleTableKeyDown(e, index, 'itemName');
                        return;
                      }

                      // ✅ ITEM FROM BARCODE → NORMAL FLOW
                      if (item.fromBarcode) {
                        handleTableKeyDown(e, index, 'itemName');
                        return;
                      }

                      // ✅ MANUAL ITEM → OPEN DESC/HUID POPUP
                      setDescHuidRowIndex(index);
                      setDescValue(items[index]?.fdesc || '');
                      setSerialNoValue(items[index]?.fserialno || '');
                      setHuidValue('');
                      setDescHuidPopupOpen(true);
                      return;
                    }

                    handleTableKeyDown(e, index, 'itemName');
                  }}
                  onClick={() => openItemPopup(index)}
                  onFocus={() => setFocusedField(`itemName-${item.id}`)}
                  onBlur={() => setFocusedField('')}
                  title={`Item Code: ${item.itemCode || 'Not selected'}`}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    opacity: 0.6,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <SearchIcon size={14} />
                </div>
              </div>
            </td>
            <td style={{ ...styles.td, textAlign: 'right' }}> {/* RIGHT ALIGN */}
              <input
                readOnly
                style={
                  focusedField === `stock-${item.id}`
                    ? { ...styles.editableInputFocused, textAlign: 'right' }
                    : { ...styles.editableInput, textAlign: 'right' }
                }
                value={item.stock}
                data-row={index}
                data-field="stock"
                onChange={(e) =>
                  handleItemChange(item.id, 'stock', e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document
                      .querySelector(
                        `input[data-row="${index}"][data-field="mrp"]`
                      )
                      ?.focus();
                    return;
                  }
                  handleTableKeyDown(e, index, 'stock');
                }}
                onFocus={() => setFocusedField(`stock-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            <td style={{ ...styles.td, textAlign: 'right' }}> {/* RIGHT ALIGN */}
              <input
                readOnly
                style={focusedField === `mrp-${item.id}` 
                  ? { ...styles.editableInputFocused, textAlign: 'right' }
                  : { ...styles.editableInput, textAlign: 'right' }}
                value={item.mrp}
                data-row={index}
                data-field="mrp"
                onChange={(e) => handleItemChange(item.id, 'mrp', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const uomElement = document.querySelector(`div[data-row="${index}"][data-field="uom"]`);
                    if (uomElement) {
                      uomElement.focus();
                      return;
                    }
                  }
                  handleTableKeyDown(e, index, 'mrp');
                }}
                onFocus={() => setFocusedField(`mrp-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            <td style={{ ...styles.td, textAlign: 'right' }}> {/* RIGHT ALIGN */}
              <input
                readOnly
                className="uom-input"
                value={item.uom}
                data-row={index}
                data-field="uom"
                onChange={(e) =>
                  handleItemChange(item.id, 'uom', e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document
                      .querySelector(
                        `input[data-row="${index}"][data-field="hsn"]`
                      )
                      ?.focus();
                    return;
                  }
                  handleTableKeyDown(e, index, 'uom');
                }}
                onFocus={() => setFocusedField(`uom-${item.id}`)}
                onBlur={() => setFocusedField('')}
                style={{
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'right', // RIGHT ALIGN
                  width: '100%',
                  height: '100%',
                  minHeight: screenSize.isMobile ? '28px' : screenSize.isTablet ? '32px' : '35px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.fontSize.xs,
                  fontWeight: TYPOGRAPHY.fontWeight.medium,
                }}
              />
            </td>
            <td style={{ ...styles.td, textAlign: 'right' }}> {/* RIGHT ALIGN */}
              <input
                style={focusedField === `hsn-${item.id}` 
                  ? { ...styles.editableInputFocused, textAlign: 'right' }
                  : { ...styles.editableInput, textAlign: 'right' }}
                value={item.hsn}
                data-row={index}
                readOnly
                data-field="hsn"
                onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const taxInput = document.querySelector(`input[data-row="${index}"][data-field="tax"]`);
                    if (taxInput) {
                      taxInput.focus();
                      return;
                    }
                  }
                  handleTableKeyDown(e, index, 'hsn');
                }}
                onFocus={() => setFocusedField(`hsn-${item.id}`)}
                onBlur={() => setFocusedField('')}
              />
            </td>
            <td style={{ ...styles.td, textAlign: 'right' }}> {/* RIGHT ALIGN */}
              <input
                list={`tax-list-${item.id}`}
                style={
                  focusedField === `tax-${item.id}`
                    ? { ...styles.editableInputFocused, textAlign: 'right' }
                    : { ...styles.editableInput, textAlign: 'right' }
                }
                value={item.tax}
                data-row={index}
                data-field="tax"
                onChange={(e) => handleItemChange(item.id, 'tax', e.target.value)}
                onKeyDown={(e) => {
                  const allowedTaxes = taxList.map(t => String(t.tax));
                  const value = String(item.tax || '');

                  // ❌ BLOCK navigation if tax is invalid
                  if (
                    (e.key === 'Enter' || e.key === 'Tab') &&
                    value &&
                    !allowedTaxes.includes(value)
                  ) {
                    e.preventDefault();
                    toast.warning(
                      `Invalid tax. Allowed: ${allowedTaxes.join(', ')}`,
                      {
                        autoClose: 2000,
                        toastId: `invalid-tax-${item.id}`
                      }
                    );
                    return;
                  }

                  // ✅ EXISTING ENTER FLOW (UNCHANGED)
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const sRateInput = document.querySelector(
                      `input[data-row="${index}"][data-field="sRate"]`
                    );
                    if (sRateInput) {
                      sRateInput.focus();
                      return;
                    }
                  }

                  handleTableKeyDown(e, index, 'tax');
                }}
                onBlur={(e) => {
                  const allowedTaxes = taxList.map(t => String(t.tax));
                  const value = e.target.value;

                  // ❌ Clear invalid value BUT keep focus behavior correct
                  if (value && !allowedTaxes.includes(String(value))) {
                    handleItemChange(item.id, 'tax', '');
                    e.target.focus();
                    return;
                  }

                  setFocusedField('');
                }}
                step="0.01"
              />

              <datalist id={`tax-list-${item.id}`}>
                {taxList.map((t) => (
                  <option key={t.id} value={t.tax} />
                ))}
              </datalist>
            </td>
            <td style={{ ...styles.td, textAlign: 'right' }}> {/* RIGHT ALIGN */}
              <input
                readOnly
                style={{
                  ...styles.editableInput,
                  textAlign: 'right',
                  fontWeight: '600',
                  backgroundColor: '#f0f7ff',
                  color: '#1565c0'
                }}
                value={(() => {
                  const rate = parseFloat(item.sRate) || 0;
                  const qty = parseFloat(item.qty) || 0;
                  const tax = parseFloat(item.tax) || 0;

                  const calc = calculateAmount(qty, rate, tax);
                  const taxAmount = (typeof calc === 'string') ? 0 : parseFloat(calc.taxAmount || 0);

                  return taxAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });
                })()}
                tabIndex={-1}
              />
            </td>
            <td style={{ ...styles.td, textAlign: 'right' }}> {/* RIGHT ALIGN */}
              <input
                style={focusedField === `sRate-${item.id}` 
                  ? { ...styles.editableInputFocused, textAlign: 'right' }
                  : { ...styles.editableInput, textAlign: 'right' }}
                value={item.sRate}
                data-row={index}
                data-field="sRate"
                onChange={(e) => handleItemChange(item.id, 'sRate', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const qtyInput = document.querySelector(`input[data-row="${index}"][data-field="qty"]`);
                    if (qtyInput) {
                      qtyInput.focus();
                      return;
                    }
                  }
                  handleTableKeyDown(e, index, 'sRate');
                }}
                onFocus={(e) => selectAllOnFocus(e, `sRate-${item.id}`)}
                onBlur={() => setFocusedField('')}
                step="0.01"
              />
            </td>
            <td style={{ ...styles.td, textAlign: 'right' }}> {/* RIGHT ALIGN */}
              <input
                style={focusedField === `qty-${item.id}` 
                  ? { ...styles.editableInputFocused, textAlign: 'right', fontWeight: 'bold' }
                  : { ...styles.editableInput, textAlign: 'right', fontWeight: 'bold' }}
                value={item.qty}
                data-row={index}
                data-field="qty"
                onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                onFocus={() => setFocusedField(`qty-${item.id}`)}
                onBlur={() => setFocusedField('')}
                step="0.01"
              />
            </td>
            <td style={{ ...styles.td, ...styles.amountContainer, textAlign: 'right' }}>
              <input
                style={{ ...styles.editableInput, textAlign: 'right', fontWeight: 'bold', color: '#1565c0', backgroundColor: '#f0f7ff' }}
                value={(() => {
                  const calc = calculateAmount(item.qty || 0, item.sRate || 0, item.tax || 0);
                  const displayVal = (typeof calc === 'string') ? parseFloat(calc || 0) : parseFloat(calc.amount || 0);
                  return displayVal.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });
                })()}
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
                  transition: 'color 0.15s ease, background-color 0.15s ease',
                  minHeight: screenSize.isMobile ? '28px' : screenSize.isTablet ? '32px' : '35px',
                }}
                onClick={() => handleDeleteRow(item.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
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

      <tfoot>
        {/* SPACER ROW - pushes totals to bottom */}
        <tr style={{ height: '400px' }}>
          <td colSpan={12}></td>
        </tr>
        
        {/* TOTALS ROW - now positioned at bottom */}
        <tr
          style={{
            backgroundColor: '#e3f2fd',
            fontWeight: 'bold',
            borderTop: '2px solid #1B91DA',
            position: 'sticky',
            bottom: 0,
            zIndex: 2
          }}
        >
          <td colSpan={10} style={{ textAlign: 'right', padding: '10px' }}>
            TOTAL
          </td>

          <td style={{ textAlign: 'right', padding: '10px' }}> {/* RIGHT ALIGN */}
            {totalQty.toFixed(2)}
          </td>

          <td style={{ textAlign: 'right', padding: '10px', color: '#0d47a1' }}>
            ₹{totalAmount.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </td>

          <td />
        </tr>
      </tfoot>
    </table>
  </div>
</div>

      {/* --- FOOTER SECTION --- */}
      <div style={styles.footerSection}>
        <div style={styles.rightColumn}>
          <ActionButtons
            activeButton={activeTopAction}
            onButtonClick={(type) => {
              setActiveTopAction(type);
              if (type === 'add') resetForm();
              if (type === 'edit') openEditInvoicePopup();
              if (type === 'delete') openDeleteInvoicePopup();
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
            <span style={styles.totalLabel}>Net Amount</span>
            <span style={styles.totalValue}>
  ₹{netAmountRounded.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}
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
            ref={saveButtonRef}
            saveButtonProps={{
              tabIndex: 0,
            }}
          />
        </div>
      </div>

      {/* Save Confirmation Popup */}
<ConfirmationPopup
  isOpen={saveConfirmationOpen}
  onClose={() => setSaveConfirmationOpen(false)}
  onConfirm={handleConfirmedSave}
  title={saveConfirmationData?.isEditing ? "Confirm UPDATE Invoice" : "Confirm SAVE Invoice"}
  message={saveConfirmationData?.isEditing ? "Do you want to modify?" : "Do you want to save?"}
  confirmText={saveConfirmationData?.isEditing ? " Yes" : "Yes"}
  cancelText="No"
  type={saveConfirmationData?.isEditing ? "warning" : "success"}
  showIcon={true}
  showLoading={isSaving}
  borderColor={saveConfirmationData?.isEditing ? "#ffc107" : "#1B91DA"}
/>
      {/* Clear Confirmation Popup */}
      <ConfirmationPopup
        isOpen={clearConfirmationOpen}
        onClose={() => setClearConfirmationOpen(false)}
        onConfirm={handleConfirmedClear}
        title="Clear Sales Invoice"
        message="Are you want to clear?"
        confirmText="Yes"
        cancelText="No"
        type="warning"
        showIcon={true}
        borderColor="#ffc107"
      />
      {/* Print Confirmation Popup */}
      <ConfirmationPopup
        isOpen={printConfirmationOpen}
        onClose={() => {
          setPrintConfirmationOpen(false);
          resetForm();
        }}
        onConfirm={handleConfirmedPrint}
        title="Print Sales Invoice"
        message="Do you want to print it?"
        confirmText="PRINT"
        cancelText="Cancel"
        type="success"
        showIcon={true}
        borderColor="#1B91DA"
      />

      {/* Delete Confirmation Popup */}
      <ConfirmationPopup
        isOpen={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        onConfirm={handleConfirmedDelete}
        title="Confirm DELETE Invoice"
        message={
          "Do you  want to delete? "
        }
        confirmText=" Yes"
        cancelText="No"
        type="danger"
        showIcon={true}
        showLoading={isLoading}
        borderColor="#dc3545"
        confirmButtonStyle={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
      />


{descHuidPopupOpen && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.45)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <div
      style={{
        width: '420px',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
        animation: 'popupFade 0.15s ease-out'
      }}
    >
      {/* 🔵 HEADER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1B91DA, #1976d2)',
          color: '#fff',
          padding: '14px 18px',
          fontSize: '16px',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        Item Description
        <span
          style={{
            cursor: 'pointer',
            fontSize: '20px',
            lineHeight: 1
          }}
          onClick={() => {
            setDescHuidPopupOpen(false);
            setDescValue('');
            setSerialNoValue('');
            setHuidValue('');
            setDescHuidRowIndex(null);
          }}
        >
          ×
        </span>
      </div>

      {/* 🔹 BODY */}
      <div style={{ padding: '20px' }}>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#444',
            marginBottom: '8px',
            display: 'block'
          }}
        >
          Description
        </label>

       <input
  ref={descRef}
  type="text"
  value={descValue}
  onChange={(e) => setDescValue(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // 👉 MOVE FOCUS TO SERIAL NUMBER INPUT
      serialRef.current?.focus();
    }
  }}
  style={{
    width: '100%',
    height: '42px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    padding: '0 12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.2s, box-shadow 0.2s'
  }}
/>



        {/* 🔹 SERIAL NO */}
<label
  style={{
    fontSize: '13px',
    fontWeight: 600,
    color: '#444',
    marginTop: '14px',
    marginBottom: '8px',
    display: 'block'
  }}
>
  Serial No
</label>

<input
  type="text"
  ref={serialRef}
  value={serialNoValue}
  onChange={(e) => setSerialNoValue(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // ✅ SAVE DESCRIPTION + SERIAL NO
      setItems(prev => {
        const updated = [...prev];
        if (descHuidRowIndex !== null) {
          updated[descHuidRowIndex] = {
            ...updated[descHuidRowIndex],
            fdesc: descValue || '',
            fserialno: serialNoValue || ''   // 🔥 NEW FIELD
          };
        }
        return updated;
      });

      setDescHuidPopupOpen(false);
      
      // ✅ CLEAR POPUP STATE FOR NEXT ROW
      setDescValue('');
      setSerialNoValue('');
      setHuidValue('');
      setDescHuidRowIndex(null);

      // ✅ MOVE TO HSN
      setTimeout(() => {
        if (descHuidRowIndex !== null) {
          document
            .querySelector(
              `input[data-row="${descHuidRowIndex}"][data-field="tax"]`
            )
            ?.focus();
        }
      }, 80);
    }
  }}
  style={{
    width: '100%',
    height: '42px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    padding: '0 12px',
    fontSize: '14px',
    outline: 'none'
  }}
/>

      </div>

      
    </div>
  </div>
)}



      {/* Customer Popup */}
      <PopupListSelector
        open={customerPopupOpen}
        onClose={() => setCustomerPopupOpen(false)}
        onSelect={handleCustomerSelect}
        fetchItems={(page, search) => fetchItemsForPopup(page, search, 'customer')}
        title="Select Customer"
        displayFieldKeys={getPopupConfig('customer').displayFieldKeys}
        searchFields={getPopupConfig('customer').searchFields}
        headerNames={getPopupConfig('customer').headerNames}
        columnWidths={getPopupConfig('customer').columnWidths}
        searchPlaceholder={getPopupConfig('customer').searchPlaceholder}
        maxHeight="70vh"
      />

      {/* Salesman Popup */}
      <PopupListSelector
        open={salesmanPopupOpen}
        onClose={() => setSalesmanPopupOpen(false)}
        onSelect={handleSalesmanSelect}
        initialSearch={popupSearchText}
        fetchItems={(page, search) => fetchItemsForPopup(page, search, 'salesman')}
        title="Select Salesman"
        displayFieldKeys={getPopupConfig('salesman').displayFieldKeys}
        searchFields={getPopupConfig('salesman').searchFields}
        headerNames={getPopupConfig('salesman').headerNames}
        columnWidths={getPopupConfig('salesman').columnWidths}
        searchPlaceholder={getPopupConfig('salesman').searchPlaceholder}
        maxHeight="70vh"
      />

      {/* Item Popup */}
      <PopupListSelector
        open={itemPopupOpen}
        onClose={() => setItemPopupOpen(false)}
        onSelect={handleItemSelect}
        fetchItems={(page, search) => fetchItemsForPopup(page, search, 'item')}
        title="Select Item"
        initialSearch={popupSearchText}   
        displayFieldKeys={getPopupConfig('item').displayFieldKeys}
        searchFields={getPopupConfig('item').searchFields}
        headerNames={getPopupConfig('item').headerNames}
        columnWidths={getPopupConfig('item').columnWidths}
        searchPlaceholder={getPopupConfig('item').searchPlaceholder}
        maxHeight="70vh"
      />

      {/* Edit Invoice Popup */}
      <PopupListSelector
        open={editInvoicePopupOpen}
        onClose={() => setEditInvoicePopupOpen(false)}
        onSelect={handleInvoiceSelect}
        fetchItems={(page, search) =>
          fetchInvoicesForPopup(page, search)
        }
        title="Select Invoice to Edit"
        
        displayFieldKeys={getPopupConfig('editInvoice').displayFieldKeys}
        searchFields={getPopupConfig('editInvoice').searchFields}
        headerNames={getPopupConfig('editInvoice').headerNames}
        columnWidths={getPopupConfig('editInvoice').columnWidths}
        searchPlaceholder={getPopupConfig('editInvoice').searchPlaceholder}
        maxHeight="70vh"
        loading={loadingInvoices}
        formatRow={getPopupConfig('editInvoice').formatRow}
      />

      {/* Delete Invoice Popup */}
      <PopupListSelector
        open={deleteInvoicePopupOpen}
        onClose={() => setDeleteInvoicePopupOpen(false)}
        onSelect={handleInvoiceDelete}
        fetchItems={(page, search) =>
          fetchInvoicesForPopup(page, search)
        }
        title="Select Invoice to Delete"
        displayFieldKeys={getPopupConfig('deleteInvoice').displayFieldKeys}
        searchFields={getPopupConfig('deleteInvoice').searchFields}
        headerNames={getPopupConfig('deleteInvoice').headerNames}
        columnWidths={getPopupConfig('deleteInvoice').columnWidths}
        searchPlaceholder={getPopupConfig('deleteInvoice').searchPlaceholder}
        maxHeight="70vh"
        loading={loadingInvoices}
        formatRow={getPopupConfig('deleteInvoice').formatRow}
      />
      
      {/* Row Delete Confirmation Popup */}
      <ConfirmationPopup
        isOpen={rowDeleteConfirmationOpen}
        onClose={() => {
          setRowDeleteConfirmationOpen(false);
          setRowToDelete(null);
        }}
        onConfirm={handleConfirmedRowDelete}
        title="Delete Item Row"
        message={
          rowToDelete 
          ? `Do you want to clear?`
          : "Do you want to clear?"
        }
        confirmText="Yes"
        cancelText="No"
        type="danger"
        showIcon={true}
        showLoading={false}
        borderColor="#dc3545"
        confirmButtonStyle={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
      />
      

 <ConfirmationPopup
  isOpen={barcodeErrorOpen}
  title="Invalid Barcode"
  message="Prefix Not Found"
  confirmText="OK"
  cancelText={null}
  type="warning"
  showIcon
  onConfirm={() => {
    setBarcodeErrorOpen(false);

    // ✅ RESTORE CURSOR AFTER POPUP CLOSES
   setTimeout(() => {
      const rowIndex = lastBarcodeRowRef.current;

      if (rowIndex !== null && rowIndex !== undefined) {
        const barcodeInput = document.querySelector(
          `input[data-row="${rowIndex}"][data-field="barcode"]`
        );

        if (barcodeInput) {
          barcodeInput.focus();
          barcodeInput.select(); // optional but good UX
        }
      }
    }, 150);
  }}
/>

      {/* 🔄 Customer History Modal - BLUE THEME */}
{customerHistoryOpen && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      display: 'flex',
      alignItems: 'center',
      marginTop: '50px',
      justifyContent: 'center',
      zIndex: 5000
    }}
    onClick={() => setCustomerHistoryOpen(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '95%',
        maxWidth: '1100px',
        maxHeight: '85vh',
        background: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >

      {/* 🔵 HEADER */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1B91DA, #2563EB)',
          color: '#fff',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>
            Customer Ledger History
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            {customerHistoryData?.customerName || ''}
          </div>
        </div>

        <button
          onClick={() => setCustomerHistoryOpen(false)}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            fontSize: '22px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div style={{ padding: '18px', overflowY: 'auto' }}>

        {/* 🔄 LOADING */}
        {customerHistoryLoading && (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
            Loading customer history...
          </div>
        )}

        {/* ❌ ERROR */}
        {customerHistoryError && !customerHistoryLoading && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '14px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '15px'
            }}
          >
            {customerHistoryError}
          </div>
        )}

        {/* ✅ DATA */}
        {customerHistoryData &&
          !customerHistoryLoading &&
          !customerHistoryError && (
            <>
              

              {/* 📄 TRANSACTIONS TABLE */}
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px'
                  }}
                >
                  <thead>
                    <tr style={{ background: '#eff6ff' }}>
                      {['Date', 'Party', 'Type', 'Bill No', 'Debit', 'Credit'].map(
                        (h, i) => (
                          <th
                            key={i}
                            style={{
                              padding: '12px',
                              textAlign: i > 3 ? 'right' : 'left',
                              color: '#1e3a8a',
                              fontWeight: 700,
                              borderBottom: '2px solid #bfdbfe'
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {customerHistoryData.transactions?.length ? (
                      customerHistoryData.transactions.map((t, i) => (
                        <tr
                          key={i}
                          style={{
                            background: i % 2 ? '#f8fafc' : '#ffffff',
                            borderBottom: '1px solid #e5e7eb'
                          }}
                        >
                          <td style={{ padding: '10px' }}>{t.date}</td>
                          <td style={{ padding: '10px' }}>{t.party}</td>
                          <td
                            style={{
                              padding: '10px',
                              fontSize: '12px',
                              color: '#475569'
                            }}
                          >
                            {t.type}
                          </td>
                          <td
                            style={{
                              padding: '10px',
                              fontWeight: 600,
                              color: '#2563eb'
                            }}
                          >
                            {t.billNo}
                          </td>
                          <td
                            style={{
                              padding: '10px',
                              textAlign: 'right',
                              fontWeight: 600,
                              color: '#16a34a'
                            }}
                          >
                            {t.debit || '-'}
                          </td>
                          <td
                            style={{
                              padding: '10px',
                              textAlign: 'right',
                              fontWeight: 600,
                              color: '#dc2626'
                            }}
                          >
                            {t.credit || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign: 'center',
                            padding: '30px',
                            color: '#94a3b8'
                          }}
                        >
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              
            </>
          )}
      </div>
    </div>
  </div>
)}

      {/* PrintReceipt Component */}
      {printBillData && (
        <PrintReceipt
          ref={printReceiptRef}
          billData={printBillData}
          mode="sales_invoice"
        />
      )}

    </div>
  );
};

export default SaleInvoice;