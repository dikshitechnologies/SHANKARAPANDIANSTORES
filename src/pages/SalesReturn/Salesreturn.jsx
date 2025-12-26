import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import PopupListSelector from "../../components/Listpopup/PopupListSelector";
import { API_ENDPOINTS } from "../../api/endpoints";
import apiService from "../../api/apiService";
import axiosInstance from "../../api/axiosInstance";
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// SEARCH ICON COMPONENT (Same as SalesInvoice)
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

// ENTER key field order (exact as you want)
const ENTER_FIELDS = [
  'barcode',
  'itemName',
  'stock',
  'mrp',
  'hsn',
  'tax',
  'sRate',
  'qty'
];


const SalesReturn = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.SALES_RETURN),
    edit: hasModifyPermission(PERMISSION_CODES.SALES_RETURN),
    delete: hasDeletePermission(PERMISSION_CODES.SALES_RETURN)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('add');

  // 1. Header Details State
  const [billDetails, setBillDetails] = useState({
    billNo: 'SR0000001',
    billDate: new Date().toISOString().substring(0, 10),
    mobileNo: '',
    salesman: '',
    salesmanCode: '002',
    custName: '',
    customerCode: '',
    returnReason: '',
    partyCode: '',
    gstno: '',
    city: '',
    type: 'Retail',
    transType: 'SALES RETURN',
    billAMT: '0',
    newBillNo: ''
  });

  // 2. Table Items State (WRate field removed)
  const [items, setItems] = useState([
    {
      id: 1,
      sNo: 1,
      barcode: '',
      itemName: '',
      stock: '',
      mrp: '',
      uom: '',
      hsn: '',
      tax: '',
      sRate: '',
      qty: '',
      itemCode: ''
    }
  ]);

  // 3. Totals State
  const [totalQty, setTotalQty] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // 4. Popup State
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupData, setPopupData] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedBillNumber, setSelectedBillNumber] = useState(null);
  const [selectAllItems, setSelectAllItems] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirmApply, setShowConfirmApply] = useState(false);
 const blockGlobalEnterRef = useRef(false);

  // 5. Confirmation Popup States
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmPopupConfig, setConfirmPopupConfig] = useState({
    title: "",
    message: "",
    type: "default",
    onConfirm: null,
    confirmText: "Confirm",
    cancelText: "Cancel"
  });
  
  // 6. State for pending actions
  const [pendingVoucherNo, setPendingVoucherNo] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  // NEW STATE: For custom bill number popups
  const [billDetailsPopupOpen, setBillDetailsPopupOpen] = useState(false);
  const [checkedBills, setCheckedBills] = useState({});
  const [billDetailsData, setBillDetailsData] = useState({});
  const [isLoadingDetails, setIsLoadingDetails] = useState({});
  const [selectedBillForDetails, setSelectedBillForDetails] = useState(null);
  const [billDetailsSearchText, setBillDetailsSearchText] = useState("");
  const [billPopupRowIndex, setBillPopupRowIndex] = useState(0);

  // 7. API Data State
  const [customers, setCustomers] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [voucherList, setVoucherList] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shouldFocusBillDate, setShouldFocusBillDate] = useState(false);

  // NEW STATE: For sales invoice bill list (pagination)
  const [salesInvoiceBills, setSalesInvoiceBills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
   
  // NEW STATE: For save button validation
  const [isFormValid, setIsFormValid] = useState(false);

  // Search term states for popup pre-fill
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [salesmanSearchTerm, setSalesmanSearchTerm] = useState('');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [billSearchTerm, setBillSearchTerm] = useState('');
  const [popupSearchText, setPopupSearchText] = useState('');

  // --- REFS ---
  const billRowRefs = useRef([]);
 
  const billNoRef = useRef(null);
  const billDateRef = useRef(null);
  
  const mobileRef = useRef(null);
  const salesmanRef = useRef(null);
  const custNameRef = useRef(null);
  const returnReasonRef = useRef(null);
  const newBillNoRef = useRef(null);

  const [focusedField, setFocusedField] = useState('');
  const [activeFooterAction, setActiveFooterAction] = useState('null');
  const [isBarcodeEnter, setIsBarcodeEnter] = useState(false); // ✅ Correct

  // Track focused element position for arrow navigation
  const [focusedElement, setFocusedElement] = useState({
    type: 'header', // 'header', 'table', 'footer'
    rowIndex: 0,
    fieldIndex: 0,
    fieldName: 'billDate'
  });

  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  useEffect(() => {
    if (!billDetailsPopupOpen) return;

    const handleKeyDown = (e) => {
      // ❗ Ignore if user typing in input
      if (
        
        e.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      const billNo = selectedBillForDetails;
      if (!billNo) return;

      const details = billDetailsData[billNo];
      const itemsArray = details?.items || details?.details || [];
      if (itemsArray.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setBillPopupRowIndex(prev =>
          Math.min(prev + 1, itemsArray.length - 1)
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setBillPopupRowIndex(prev =>
          Math.max(prev - 1, 0)
        );
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const item = itemsArray[billPopupRowIndex];
        if (!item) return;

        const key = item.fItemcode || item.itemCode;
        setCheckedBills(prev => ({
          ...prev,
          [key]: !prev[key]
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    billDetailsPopupOpen,
    selectedBillForDetails,
    billDetailsData,
    billPopupRowIndex
  ]);

  useEffect(() => {
    if (!billDetailsPopupOpen) return;

    const row = billRowRefs.current[billPopupRowIndex];
    if (row) {
      row.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [billPopupRowIndex, billDetailsPopupOpen]);

   // Focus Bill Date on load or when action changes (except delete)
    useEffect(() => {
      if (billDateRef.current && activeTopAction !== "delete") {
        billDateRef.current.focus();
        setFocusedElement({
          type: 'header',
          rowIndex: 0,
          fieldIndex: 1,
          fieldName: 'billDate'
        });
      }
    }, [activeTopAction]);

  const resetForm = async () => {
    try {
      // Ensure we're in ADD mode
      setIsEditMode(false);

      // Reset bill details to default
      setBillDetails({
        billNo: 'SR0000001',
        billDate: new Date().toISOString().substring(0, 10),
        mobileNo: '',
        salesman: '',
        salesmanCode: '002',
        custName: '',
        customerCode: '',
        returnReason: '',
        partyCode: '',
        gstno: '',
        city: '',
        type: 'Retail',
        transType: 'SALES RETURN',
        billAMT: '0',
        newBillNo: ''
      });

      // Reset items to single empty row (WRate field removed)
      setItems([
        {
          id: 1,
          sNo: 1,
          barcode: '',
          itemName: '',
          stock: '',
          mrp: '',
          uom: '',
          hsn: '',
          tax: '',
          sRate: '',
          qty: '',
          amount: '0.00',
          itemCode: '',
          isReadOnly: false
        }
      ]);

      // Fetch new voucher number and refresh voucher list
      await fetchMaxVoucherNo();
      await fetchVoucherList();
      setActiveTopAction('add');
      
    } catch (err) {
      console.error("Error resetting form:", err);
      toast.error("Error resetting form. Please try again.");
    }
  };

  // ---------- CONFIRMATION POPUP HANDLERS ----------
  const showConfirmation = (config) => {
    setConfirmPopupConfig(config);
    setShowConfirmPopup(true);
  };

  const handleConfirmAction = () => {
    if (confirmPopupConfig.onConfirm) {
      confirmPopupConfig.onConfirm();
    }
    setShowConfirmPopup(false);
  };

  const handleCancelAction = () => {
    setShowConfirmPopup(false);
    setPendingVoucherNo(null);
    setPendingAction(null);
  };

  // ---------- VALIDATION FUNCTIONS ----------
  const checkFormValidity = useRef(() => {
    const hasCustomer = !!billDetails.custName.trim();
    const hasBillDate = !!billDetails.billDate;
    const hasMobile = !!billDetails.mobileNo.trim();
    const hasSalesman = !!billDetails.salesman.trim();
    
    // Check if at least one item has quantity > 0
    const hasValidItems = items.some(item => {
      const hasItemName = !!item.itemName.trim();
      const hasQuantity = parseFloat(item.qty || 0) > 0;
      return hasItemName && hasQuantity;
    });

    // All fields must be filled
    const isValid = hasCustomer && hasBillDate && hasMobile && hasSalesman && hasValidItems;
    return isValid;
  }).current;

  // Update validation when form fields change
  useEffect(() => {
    const isValid = checkFormValidity();
    setIsFormValid(isValid);
  }, [billDetails, items, checkFormValidity]);

  // ---------- API FUNCTIONS ----------
  // Fetch sales invoice bill list with pagination
  const fetchSalesInvoiceBillList = async (page = 1, pageSize = 20) => {
    try {
      setIsLoadingBills(true);
      const companyCode = '001';
      const endpoint = API_ENDPOINTS.sales_return?.getBillList ? 
        API_ENDPOINTS.sales_return.getBillList(companyCode, page, pageSize) : 
        `Salesinvoices/salesbillList/${companyCode}?page=${page}&pageSize=${pageSize}`;
      
      const response = await apiService.get(endpoint);
      
      if (response) {
        let bills = [];
        let totalCount = 0;
        
        if (response.data && Array.isArray(response.data)) {
          bills = response.data;
          totalCount = response.totalCount || response.total || bills.length;
        } else if (Array.isArray(response)) {
          bills = response;
          totalCount = bills.length;
        } else if (response.bills && Array.isArray(response.bills)) {
          bills = response.bills;
          totalCount = response.totalCount || response.total || bills.length;
        }
        
        setSalesInvoiceBills(bills);
        setTotalPages(Math.ceil(totalCount / pageSize));
        return bills;
      }
      
      return [];
    } catch (err) {
      console.error("API Error fetching sales invoice bill list:", err);
      setSalesInvoiceBills([]);
      return [];
    } finally {
      setIsLoadingBills(false);
    }
  };

  // Fetch voucher details from sales invoice
  const fetchSalesInvoiceVoucherDetails = async (voucherNo) => {
    try {
      setLoading(true);
      const endpoint = API_ENDPOINTS.sales_return?.getVoucherDetails ? 
        API_ENDPOINTS.sales_return.getVoucherDetails(voucherNo) : 
        `Salesinvoices/GetVoucherDetails?voucherNo=${voucherNo}`;
      
      const response = await apiService.get(endpoint);
      
      if (response) {
        return response;
      }
      
      return null;
    } catch (err) {
      console.error("API Error fetching sales invoice voucher details:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch details for specific bill
  const fetchBillDetailsForPopup = async (billNo) => {
   
    try {
      setIsLoadingDetails(prev => ({ ...prev, [billNo]: true }));
      
      const details = await fetchSalesInvoiceVoucherDetails(billNo);
      
      setBillDetailsData(prev => ({
        ...prev,
        [billNo]: details
      }));
      
      setIsLoadingDetails(prev => ({ ...prev, [billNo]: false }));
      
      return details;
    } catch (error) {
      console.error(`Error fetching details for ${billNo}:`, error);
      setIsLoadingDetails(prev => ({ ...prev, [billNo]: false }));
      return null;
    }
  };

  // Open First Popup - Bill Numbers Only using common PopupListSelector
  const openBillNumberPopup = async () => {
    try {
      const bills = await fetchSalesInvoiceBillList(1, 20);
      
      if (!bills || bills.length === 0) {
        alert("No sales invoice bills available. Please try again later.");
        return;
      }
      
      const billNumberData = bills.map((bill, index) => {
        const billNo = bill.voucherNo || bill.billNo || bill.invoiceNo || 
                      bill.code || bill.id || `BILL-${index + 1}`;
        
        const customerName = bill.customerName || bill.customer || bill.partyName || "";
        const displayText = customerName ? `${customerName}` : billNo;
        
        return {
          id: billNo,
          code: billNo,
          name: displayText,
          displayName: displayText,
          customerName: customerName,
          voucherDate: bill.voucherDate || bill.billDate || bill.date || "",
          originalData: bill,
        };
      });
      
      setPopupData(billNumberData);
      setPopupTitle("Select Bill Number");
      setPopupType("billNumber");
      setPopupOpen(true);
      
    } catch (error) {
      console.error("Error opening bill number popup:", error);
      alert("Error loading sales invoice bills. Please try again.");
    }
  };

  // Open Second Popup - Bill Details with Checkboxes
  const openBillDetailsPopup = async (billNo) => {
    try {
      setSelectedBillForDetails(billNo);
      setBillDetailsSearchText(""); // Reset search text
      setCheckedBills({}); // Reset checked items
      
      // Close the first popup
      setPopupOpen(false);
      setPopupType("");
      setPopupData([]);
      
      // Fetch bill details
      const details = await fetchBillDetailsForPopup(billNo);
      
      if (!details) {
        alert(`Could not fetch details for bill ${billNo}. Please try again.`);
        return;
      }
      
      setBillDetailsPopupOpen(true);
      setBillPopupRowIndex(0); // reset keyboard cursor

    } catch (error) {
      console.error("Error opening bill details popup:", error);
      alert("Error loading bill details. Please try again.");
    }
  };

  const applyBillNumberCore = async () => {
  await handleApplyBillNumber();
};

  // Apply selected bill number from details popup
  const handleApplyBillNumber = async () => {
    // Get the checked items

    const checkedItems = Object.keys(checkedBills).filter(key => checkedBills[key]);
    
    if (!checkedItems || checkedItems.length === 0) {
      toast.warning("Please select at least one item by checking the checkbox.");
      return;
    }
    
    const voucherNo = selectedBillForDetails;
    
    try {
      setLoading(true);
      const voucherDetails = billDetailsData[voucherNo];
      
      if (voucherDetails) {
        // Set the bill number in the form
        setBillDetails(prev => ({ ...prev, newBillNo: voucherNo }));
        
        const header = voucherDetails.header || voucherDetails;
        const itemsArray = voucherDetails.items || voucherDetails.details || [];
        
        if (header) {
          setBillDetails(prev => ({
            ...prev,
            custName: header.customerName || header.customer || "",
            customerCode: header.customerCode || header.customerId || "",
            partyCode: header.customerCode || header.customerId || "",
            mobileNo: header.mobileNO || header.mobileNo || header.mobile || header.phone || "",
            gstno: header.gstNo || header.gstNumber || header.gst || "",
            salesman: header.sManName || header.salesMansName || "",
            salesmanCode: header.sManCode || header.salesMansCode || "002"
          }));
        }
        
        if (itemsArray && itemsArray.length > 0) {
          // Filter only checked items
          const checkedItemCodes = checkedItems;
          const filteredItems = itemsArray.filter(item => {
            const itemCode = item.fItemcode || item.itemCode || item.productCode || "";
            return checkedItemCodes.includes(itemCode);
          });
          
          if (filteredItems.length > 0) {
            const transformedItems = filteredItems.map((item, index) => {
              const itemCode = item.fItemcode || item.itemCode || item.productCode || "";
              const itemName = item.fitemNme || item.itemName || item.barcode || item.productName || "";
              const originalQty = parseFloat(item.fTotQty || item.qty || item.quantity || 0);
              
              const returnQty = Math.abs(originalQty);

              
              return {
                id: index + 1,
                sNo: index + 1,
                barcode: item.barcode || "",
                itemName: itemName,
                stock: item.fstock || item.stock || "0",
                mrp: item.mrp || item.maxRetailPrice || "0.00",
                uom: item.fUnit || item.uom || item.unit || "",
                hsn: item.fHSN || item.hsn || item.hsnCode || "",
                tax: item.fTax || item.tax || item.taxRate || "0",
                sRate: item.fRate || item.sellingRate || item.rate || "0",
                qty: returnQty.toString(),
                amount: (returnQty * parseFloat(item.fRate || item.rate || item.sellingRate || 0)).toFixed(2),
                itemCode: itemCode || `0000${index + 1}`,
                isReadOnly: true // Mark items from bill selection as read-only except qty
              };
            });
            
            setItems(transformedItems);
            
            // toast.success(
            //   `Selected items from ${voucherNo} applied successfully!\n${filteredItems.length} items loaded for return.`,
            //   { autoClose: 3000 }
            // );
          } else {
            toast.warning("No items selected. Please check at least one item checkbox.");
          }
        } else {
          toast.info(`Bill number ${voucherNo} selected, but no items found to apply.`);
        }
      } else {
        toast.error(`Bill number ${voucherNo} selected, but could not fetch voucher details.`);
      }
    } catch (error) {
      console.error("Error applying voucher details:", error);
      toast.error(`Error applying voucher details: ${error.message}`);
    } finally {
      setLoading(false);
    }
    
    // Focus on first item's barcode field after applying
    setTimeout(() => {
      const firstBarcodeInput = document.querySelector(`input[data-row="0"][data-field="barcode"]`);
      if (firstBarcodeInput) {
        firstBarcodeInput.focus();
        setFocusedElement({
          type: 'table',
          rowIndex: 0,
          fieldIndex: 0,
          fieldName: 'barcode'
        });
      }
    }, 150);
  };

  // Clear selected bill number
  const handleClearBillNumber = () => {
    setBillDetails(prev => ({ ...prev, newBillNo: '' }));
    
    setBillDetailsPopupOpen(false);
    setSelectedBillForDetails(null);
    setCheckedBills({});
    setBillDetailsSearchText("");
  };

  // Load more bills for pagination in first popup
  const handleLoadMoreBills = async (pageNum, search) => {
    if (popupType === "billNumber") {
      const moreBills = await fetchSalesInvoiceBillList(pageNum, 20);
      
      if (moreBills && moreBills.length > 0) {
        const moreBillData = moreBills.map((bill, index) => {
          const billNo = bill.voucherNo || bill.billNo || bill.invoiceNo || 
                        bill.code || bill.id || `BILL-${((pageNum-1) * 20) + index + 1}`;
          
          const customerName = bill.customerName || bill.customer || bill.partyName || "";
          const displayText = customerName ? `${customerName}` : billNo;
          
          return {
            id: billNo,
            code: billNo,
            name: displayText,
            displayName: displayText,
            customerName: customerName,
            voucherDate: bill.voucherDate || bill.billDate || bill.date || "",
            originalData: bill,
          };
        });
        
        return moreBillData;
      }
    }
    return [];
  };

  // Filter items for bill details popup based on search
  const getFilteredBillItems = () => {
    const billNo = selectedBillForDetails;
    if (!billNo) return [];
    
    const details = billDetailsData[billNo];
    if (!details) return [];
    
    const itemsArray = details.items || details.details || [];
    
    if (!billDetailsSearchText.trim()) {
      return itemsArray;
    }
    
    const searchLower = billDetailsSearchText.toLowerCase();
    return itemsArray.filter(item => {
      const itemCode = item.fItemcode || item.itemCode || item.productCode || "";
      const itemName = item.fitemNme || item.itemName || item.productName || "";
      
      return (
        (itemCode && itemCode.toLowerCase().includes(searchLower)) ||
        (itemName && itemName.toLowerCase().includes(searchLower))
      );
    });
  };

  const fetchMaxVoucherNo = async () => {
    try {
      setLoading(true);
      setError("");
      const companyCode = '001';
      const response = await apiService.get(API_ENDPOINTS.sales_return.getMaxVoucherNo(companyCode));
      
      if (response && response.maxVoucherNo) {
        setBillDetails(prev => ({ ...prev, billNo: response.maxVoucherNo }));
      } else if (response && response.voucherNo) {
        setBillDetails(prev => ({ ...prev, billNo: response.voucherNo }));
      }
    } catch (err) {
      console.error("API Error fetching voucher:", err);
      const nextNum = Math.floor(Math.random() * 1000) + 1;
      setBillDetails(prev => ({ ...prev, billNo: `SR${String(nextNum).padStart(7, '0')}` }));
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      
      const endpoint = API_ENDPOINTS.sales_return?.getCustomers || "Salesinvoices/GetPartyByParent";
      const response = await apiService.get(endpoint);
      
      if (response && Array.isArray(response)) {
        setCustomers(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("API Error fetching customers:", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesmen = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await apiService.get("SalesmanCreation/GetSalesman");
      
      if (response && Array.isArray(response)) {
        setSalesmen(response);
      } else {
        setSalesmen([]);
      }
    } catch (err) {
      console.error("API Error fetching salesmen:", err);
      setSalesmen([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (type = 'FG') => {
    try {
      setLoading(true);
      setError("");
      
      // Use getItemsByType endpoint with FG type (same as SalesInvoice)
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getItemsByType(type, 1, 100);
      
      const response = await axiosInstance.get(endpoint);
      console.log("Fetched FG items response:", JSON.stringify(response));
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
            // IMPORTANT: CORRECT FIELD MAPPINGS FOR FG TYPE
            const itemCode = item.itemCode || item.code || item.id || '';
            const itemName = item.itemName || item.name || '';
            const units = item.units || item.uom || "PCS"; // Default to PCS if empty
            const barcode = item.finalPrefix || item.barcode; // finalPrefix is the BARCODE
            
            // Handle empty preRate
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
              barcode: barcode,
              stock: item.maxQty || item.stock || item.quantity || 0,
              mrp: preRateValue || item.mrp || item.sRate || "0",
              uom: units,
              hsn: item.hsn || item.hsnCode || "",
              tax: item.tax || item.taxRate || "0",
              sRate: preRateValue || item.sRate || item.mrp || "0",
              displayName: `${itemName} (${itemCode})`,
              popupDisplay: itemName,
              finalPrefix: item.finalPrefix,
              preRate: preRateValue,
              maxQty: item.maxQty,
              minQty: item.minQty,
              brand: item.brand,
              category: item.category,
              model: item.model,
              size: item.size,
              type: item.type
            };
          });
          
          setItemList(formattedItems);
        } else {
          setItemList([]);
        }
      } else {
        setItemList([]);
      }
    } catch (err) {
      console.error("Error fetching FG items:", err);
      setItemList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherList = async (companyCode = '001') => {
    try {
      setLoading(true);
      setError("");
      
      const endpoint = API_ENDPOINTS.sales_return?.getVoucherList ? 
        API_ENDPOINTS.sales_return.getVoucherList(companyCode) : 
        `SalesReturn/VoucherList/${companyCode}`;
      
      const response = await apiService.get(endpoint);
      
      let voucherData = [];
      
      if (response && response.success && response.data && Array.isArray(response.data)) {
        voucherData = response.data;
      } else if (response && Array.isArray(response)) {
        voucherData = response;
      } else if (response && response.vouchers && Array.isArray(response.vouchers)) {
        voucherData = response.vouchers;
      }
      
      setVoucherList(voucherData);
      return voucherData;
      
    } catch (err) {
      console.error("API Error fetching voucher list:", err);
      setVoucherList([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchItemByBarcode = async (barcode) => {
  if (!barcode || barcode.trim() === '') return null;

  try {
    setLoading(true);

    // 1️⃣ Check already loaded items
    const foundItem = itemList.find(item =>
      item.itemCode === barcode ||
      item.code === barcode ||
      item.fItemcode === barcode
    );

    if (foundItem) return foundItem;

    // 2️⃣ API call using axiosInstance (same as SaleInvoice)
    const response = await axiosInstance.get(
      API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getPurchaseStockDetailsByBarcode(barcode.trim())
    );
    
    console.log("Barcode API response:", JSON.stringify(response));
    
    // ✅ Return response data (axios wraps in .data)
    if (response?.data) {
      return response.data;
    }

    return null;
  } catch (err) {
    console.error("Barcode API error:", err);
    // Don't show alert - just return null and let the calling function handle it
    return null;
  } finally {
    setLoading(false);
  }
};

// Get stock by item name - same as SalesInvoice
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
      stock: (item?.finalStock ?? 0).toString(),
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

const handleBarcodeEnter = async (rowIndex, barcode) => {
  const effectiveBarcode = (barcode || '').trim();
  if (!effectiveBarcode) return;

  try {
    const item = await fetchItemByBarcode(effectiveBarcode);

    if (!item || !item[0]) {
      toast.warning(`No item found for barcode: ${effectiveBarcode}`, {
        autoClose: 1500,
      });
      return;
    }

    setItems(prev => {
      const updated = [...prev];

      updated[rowIndex] = {
        ...updated[rowIndex],

        // ✅ set only SAFE fields
        barcode: effectiveBarcode,
        itemCode: item[0].itemcode || "",
        itemName: item[0].fItemName || "",
        stock: item[0].fstock || "0",
        mrp: item[0].mrp || "",
        uom: item[0].fUnit || "",
        hsn: item[0].fHSN || "",
        tax: item[0].inTax || "0",  // ✅ Set tax from inTax (API response)
        sRate: item[0].rate || "0",

        // ❌ DO NOT TOUCH qty
        qty: updated[rowIndex].qty || "",

        // amount should depend on qty entered by user
        amount: calculateAmount(
          updated[rowIndex].qty || 0,
          item[0].rate || 0
        )
      };

      return updated;
    });

// ❌ REMOVE THIS
setTimeout(() => {
  document
    .querySelector(`input[data-row="${rowIndex}"][data-field="qty"]`)
    ?.focus();
}, 120);



  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch item by barcode");
  }
};



  // ==================== CREATE SALES RETURN ====================
  const createSalesReturn = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Check if we have items to create
      const validItems = items.filter(item => item.itemName && parseFloat(item.qty) > 0);
      if (validItems.length === 0) {
        throw new Error("No valid items to create. Please add items with quantity > 0.");
      }
      
      // Prepare request data - CONVERT ALL VALUES TO STRINGS
      const requestData = {
        header: {
          voucherNo: billDetails.billNo.toString(),
          voucherDate: billDetails.billDate.toString(),
          mobileNo: (billDetails.mobileNo || "").toString(),
          customerCode: (billDetails.customerCode || "").toString(),
          customerName: (billDetails.custName || "").toString(),
          salesMansName: (billDetails.salesman || "").toString(),
          salesMansCode: (billDetails.salesmanCode || "002").toString(),
          compCode: "001",
          userCode: "001",
          billAMT: totalAmount.toFixed(2).toString(),
          RefNo: (billDetails.newBillNo || "").toString(),
        
        },
        items: validItems.map((item, index) => ({
          barcode: (item.barcode || "").toString(),
          itemName: (item.itemName || "").toString(),
          itemCode: (item.itemCode || `0000${index + 1}`).toString(),
          stock: (item.stock || "0").toString(),
          mrp: (item.mrp || "0").toString(),
          uom: (item.uom || "").toString(),
          hsn: (item.hsn || "").toString(),
          tax: (item.tax || "0").toString(), // CRITICAL: Convert to string
          srate: (item.sRate || "0").toString(),
          qty: (-Math.abs(parseFloat(item.qty || 0))).toFixed(2).toString(), // Negative for returns
          amount: (item.amount || "0").toString(),
          netAmount: (item.amount || "0").toString()
        }))
      };

      console.log("Creating sales return with data:", JSON.stringify(requestData, null, 2));
      
      const endpoint = "SalesReturn/SalesReturnCreate?SelectType=true";
      const response = await apiService.post(endpoint, requestData);
      
      if (response && response.success) {
        // toast.success(
        //   `Sales Return Created Successfully!\nVoucher No: ${response.voucherNo || billDetails.billNo}`,
        //   { autoClose: 3000 }
        // );
        
        // Reset form after successful creation
        await resetForm();
        
        return response;
      } else {
        // Check for specific error messages
        const errorMessage = response?.message || 
                            response?.error || 
                            response?.Message || 
                            "Failed to create sales return";
        throw new Error(errorMessage);
      }
      
    } catch (err) {
      console.error("API Error in createSalesReturn:", err);
      
      // Detailed error logging
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        
        // Extract server error message
        let errorMsg = "Failed to create sales return";
        const serverData = err.response.data;
        
        if (serverData) {
          if (typeof serverData === 'string') {
            errorMsg = serverData;
          } else if (serverData.message) {
            errorMsg = serverData.message;
          } else if (serverData.Message) {
            errorMsg = serverData.Message;
          } else if (serverData.error) {
            errorMsg = serverData.error;
          } else if (serverData.errors) {
            // Handle validation errors
            const validationErrors = Object.values(serverData.errors).flat().join(', ');
            errorMsg = `Validation Error: ${validationErrors}`;
          }
        }
        
        setError(errorMsg);
        toast.error(`Create Error: ${errorMsg}`);
      } else {
        const errorMsg = err.message || "Failed to create sales return";
        setError(errorMsg);
        toast.error(`Error: ${errorMsg}`);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== UPDATE SALES RETURN ====================
  const updateSalesReturn = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Check if we have items to update
      const validItems = items.filter(item => item.itemName && parseFloat(item.qty) > 0);
      if (validItems.length === 0) {
        throw new Error("No valid items to update. Please add items with quantity > 0.");
      }
      
      // Prepare request data - CONVERT ALL VALUES TO STRINGS
      const requestData = {
        header: {
          voucherNo: billDetails.billNo.toString(),
          voucherDate: billDetails.billDate.toString(),
          mobileNo: (billDetails.mobileNo || "").toString(),
          customerCode: (billDetails.customerCode || "").toString(),
          customerName: (billDetails.custName || "").toString(),
          salesMansName: (billDetails.salesman || "").toString(),
          salesMansCode: (billDetails.salesmanCode || "002").toString(),
          compCode: "001",
          userCode: "001",
          billAMT: totalAmount.toFixed(2).toString(),
          refNo: (billDetails.newBillNo || "").toString(),
      
        },
        items: validItems.map((item, index) => ({
          barcode: (item.barcode || "").toString(),
          itemName: (item.itemName || "").toString(),
          itemCode: (item.itemCode || `0000${index + 1}`).toString(),
          stock: (item.stock || "0").toString(),
          mrp: (item.mrp || "0").toString(),
          uom: (item.uom || "").toString(),
          hsn: (item.hsn || "").toString(),
          tax: (item.tax || "0").toString(), // CRITICAL: Convert to string
          srate: (item.sRate || "0").toString(),
          qty: (-Math.abs(parseFloat(item.qty || 0))).toFixed(2).toString(), // Negative for returns
          amount: (item.amount || "0").toString(),
        
        }))
      };

      console.log("Updating sales return with data:", JSON.stringify(requestData, null, 2));
      
      const endpoint = "SalesReturn/SalesReturnCreate?SelectType=false";
      const response = await apiService.post(endpoint, requestData);
      
      if (response && response.success) {
        // toast.success(
        //   `Sales Return Updated Successfully!\nVoucher No: ${response.voucherNo || billDetails.billNo}`,
        //   { autoClose: 3000 }
        // );
        
        // Reset form after successful update
        await resetForm();
        
        return response;
      } else {
        const errorMessage = response?.message || 
                            response?.error || 
                            response?.Message || 
                          "Failed to update sales return";
        throw new Error(errorMessage);
      }
      
    } catch (err) {
      console.error("API Error in updateSalesReturn:", err);
      
      // Detailed error handling
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        
        let errorMsg = "Failed to update sales return";
        const serverData = err.response.data;
        
        if (serverData) {
          if (typeof serverData === 'string') {
            errorMsg = serverData;
          } else if (serverData.message) {
            errorMsg = serverData.message;
          } else if (serverData.Message) {
            errorMsg = serverData.Message;
          } else if (serverData.error) {
            errorMsg = serverData.error;
          } else if (serverData.errors) {
            // Handle validation errors
            const validationErrors = Object.values(serverData.errors).flat().join(', ');
            errorMsg = `Validation Error: ${validationErrors}`;
          } else if (serverData.title) {
            errorMsg = serverData.title;
          }
        }
        
        setError(errorMsg);
        toast.error(`Update Error: ${errorMsg}`);
      } else if (err.request) {
        console.error("No response received:", err.request);
        setError("No response from server. Please check your connection.");
        toast.error("Update Error: No response from server. Please check your connection.");
      } else {
        const errorMsg = err.message || "Failed to update sales return";
        setError(errorMsg);
        toast.error(`Update Error: ${errorMsg}`);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== DELETE SALES RETURN ====================
  const deleteSalesReturn = async (voucherNo) => {
    try {
      setLoading(true);
      setError("");
      
      if (!voucherNo) {
        throw new Error("Voucher number is required");
      }
      
      const companyCode = '001';
      const endpoint = `SalesReturn/DeleteSalesReturn/${voucherNo}?compCode=${companyCode}`;
      
      let response;
      
      if (apiService && typeof apiService.delete === 'function') {
        response = await apiService.delete(endpoint);
      } else if (apiService && typeof apiService.del === 'function') {
        response = await apiService.del(endpoint);
      } else if (apiService && typeof apiService.request === 'function') {
        response = await apiService.request({
          method: 'DELETE',
          url: endpoint
        });
      } else {
        const baseUrl = '';
        const fullUrl = baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
        
        const fetchResponse = await fetch(fullUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        response = await fetchResponse.json();
      }
      
      if (response && response.success) {
        // toast.success(
        //   `Sales Return ${voucherNo} deleted successfully!`,
        //   { autoClose: 3000 }
        // );
        await fetchVoucherList();
        
        // Reset form after successful delete
        await resetForm();
        
        return response;
      } else {
        throw new Error(response?.message || "Failed to delete sales return");
      }
      
    } catch (err) {
      const errorMsg = err.message || "Failed to delete sales return";
      setError(errorMsg);
      console.error("API Error:", err);
      toast.error(`Error: ${errorMsg}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== GET SALES RETURN DETAILS ====================
  const fetchSalesReturnDetails = async (voucherNo, companyCode = '001') => {
    try {
      setLoading(true);
      setError("");
      
      if (!voucherNo) {
        throw new Error("Voucher number is required");
      }
      
      let endpoint = `SalesReturn/GetSalesReturn/${voucherNo}/${companyCode}`;
      
      const response = await apiService.get(endpoint);
      
      if (response) {
        if (response.success && response.header) {
          return response;
        } else if (response.success && response.data) {
          return response.data;
        } else if (response.voucherNo) {
          return response;
        } else {
          return response;
        }
      } else {
        throw new Error("No response received");
      }
      
    } catch (err) {
      console.error("API Error fetching sales return details:", err);
      toast.error(`Error fetching details: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ==================== LOAD VOUCHER FOR EDITING ====================
  const loadVoucherForEditing = async (voucherNo) => {
    try {
      setLoading(true);
      setError("");
      
      // Set edit mode
      setIsEditMode(true);
      
      const voucherDetails = await fetchSalesReturnDetails(voucherNo);
      
      if (!voucherDetails) {
        toast.error(`Could not load details for voucher ${voucherNo}.`);
        return;
      }
      
      const header = voucherDetails.header || voucherDetails;
      const itemsArray = voucherDetails.items || [];
      
      let formattedDate = billDetails.billDate;
      if (header.voucherDate) {
        const dateParts = header.voucherDate.split(' ')[0].split('-');
        if (dateParts.length === 3) {
          formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      }
      
      setBillDetails(prev => ({
        ...prev,
        billNo: header.voucherNo || voucherNo,
        billDate: formattedDate,
         newBillNo: header.RefNo || header.refNo || "",
        mobileNo: header.mobileNo || "",
        salesman: header.salesMansName || "",
        salesmanCode: header.salesMansCode || "002",
        custName: header.customerName || "",
        customerCode: header.customerCode || "",
        partyCode: header.customerCode || "",
        billAMT: header.billAMT || "0"
      }));
      
      if (itemsArray && itemsArray.length > 0) {
        const updatedItems = itemsArray.map((item, index) => {
          return {
            id: index + 1,
            sNo: index + 1,
            barcode: item.barcode || "",
            itemName: item.itemName || "",
            stock: item.stock || "0",
            mrp: item.mrp || "0",
            uom: item.uom || "",
            hsn: item.hsn || "",
            tax: item.tax || "0",
            sRate: item.srate || item.sRate || "0",
            qty: Math.abs(parseFloat(item.qty || 0)).toString(),
            amount: item.amount || "0",
            itemCode: item.itemCode || `0000${index + 1}`
          };
        });
        
        setItems(updatedItems);
      } else {
        setItems([{
          id: 1,
          sNo: 1,
          barcode: '',
          itemName: '',
          stock: '',
          mrp: '',
          uom: '',
          hsn: '',
          tax: '',
          sRate: '',
          qty: '',
          amount: '0.00',
          itemCode: ''
        }]);
      }
      setShouldFocusBillDate(true);

    //  toast.success(`Voucher ${voucherNo} loaded successfully! You can now edit it.`);
      
    } catch (err) {
      console.error("Error loading voucher for editing:", err);
      toast.error(`Error loading voucher: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  // ✅ Focus Bill Date after Edit voucher loads
  useEffect(() => {
    if (!shouldFocusBillDate) return;

    const timer = setTimeout(() => {
      if (billDateRef.current) {
        billDateRef.current.focus();
      }
      setShouldFocusBillDate(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [shouldFocusBillDate]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchMaxVoucherNo(),
          fetchCustomers(),
          fetchItems(),
          fetchVoucherList(),
          fetchSalesmen()
        ]);
      } catch (err) {
        console.error("Error fetching initial data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Calculate Totals whenever items change
  useEffect(() => {
    const qtyTotal = items.reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
    const amountTotal = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);

    setTotalQty(qtyTotal);
    setTotalAmount(amountTotal);
    
    setBillDetails(prev => ({ ...prev, billAMT: amountTotal.toString() }));
  }, [items]);

  // Calculate amount when qty or sRate changes
  const calculateAmount = (qty, sRate) => {
    const qtyNum = parseFloat(qty || 0);
    const sRateNum = parseFloat(sRate || 0);
    return (qtyNum * sRateNum).toFixed(2);
  };

  // --- POPUP HANDLERS ---
  const openCustomerPopup = (searchText = '') => {
    if (customers.length === 0) {
      toast.warning("No customers available. Please try again later or enter manually.");
      return;
    }
    
    // Set search term for PopupListSelector pre-fill
    setCustomerSearchTerm(searchText);
    
    let customerData = customers.map(customer => ({
      id: customer.code || customer.id,
      name: customer.name,
      displayName: `${customer.name}`,
      customerCode: customer.code,
      customerName: customer.name,
      mobileNo: customer.mobile || customer.phone || ""
    }));
    
    // Filter by search text if provided - INCLUDES search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      customerData = customerData.filter(customer => 
        (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
        (customer.displayName && customer.displayName.toLowerCase().includes(searchLower))
      );
    }
    
    setPopupData(customerData);
    setPopupTitle("Select Customer");
    setPopupType("customer");
    setPopupOpen(true);
  };

  const openSalesmanPopup = (searchText = '') => {
    if (salesmen.length === 0) {
      toast.warning("No salesmen available. Please try again later or enter manually.");
      return;
    }
    
    // Set search term for PopupListSelector pre-fill
    setSalesmanSearchTerm(searchText);
    
    let salesmanData = salesmen.map(salesman => ({
      id: salesman.fcode || salesman.code || salesman.id,
      name: salesman.fname || salesman.name,
      displayName: `${salesman.fname || salesman.name}`,
      salesmanCode: salesman.fcode || salesman.code,
      salesmanName: salesman.fname || salesman.name
    }));
    
    // Filter by search text if provided - INCLUDES search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      salesmanData = salesmanData.filter(salesman => 
        (salesman.name && salesman.name.toLowerCase().includes(searchLower)) ||
        (salesman.displayName && salesman.displayName.toLowerCase().includes(searchLower))
      );
    }
    
    setPopupData(salesmanData);
    setPopupTitle("Select Salesman");
    setPopupType("salesman");
    setPopupOpen(true);
  };

  const openItemPopup = (rowIndex, searchText = '') => {
    if (itemList.length === 0) {
      toast.warning("No items available. Please try again later or enter manually.");
      return;
    }
    
    // Set search text for popup pre-fill (matching SaleInvoice)
    setPopupSearchText(searchText);
    
    let itemData = itemList.map((item, index) => {
      const itemCode = item.fItemcode || item.itemCode || item.code || `ITEM${index + 1}`;
      const itemName = item.fItemName || item.itemName || item.name || 'Unknown Item';
      
      const displayName = `${itemName}`;
      
      return {
        ...item, // ✅ Spread ALL item properties (UOM, HSN, TAX, preRate, etc.)
        id: itemCode || `item-${index}`,
        code: itemCode,
        name: itemName,
        displayName: displayName,
        itemCode: itemCode,
        itemName: itemName
      };
    });
    
    // Filter by search text if provided - INCLUDES search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      itemData = itemData.filter(item => 
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.displayName && item.displayName.toLowerCase().includes(searchLower))
      );
    }
    
    setPopupData(itemData);
    setPopupTitle("Select Item");
    setPopupType("item");
    setSelectedRowIndex(rowIndex);
    setPopupOpen(true);
  };

  const openEditPopup = async () => {
    // === PERMISSION CHECK ===
    if (!formPermissions.edit) {
      toast.error("You do not have permission to edit sales returns.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    // === END PERMISSION CHECK ===
    try {
      setLoading(true);
      
      const freshVouchers = await fetchVoucherList();
      
      if (!freshVouchers || freshVouchers.length === 0) {
        toast.warning("No sales return vouchers available for editing.");
        setLoading(false);
        return;
      }
      
      const editData = freshVouchers.map((voucher, index) => {
        const voucherNo = voucher.voucherNo || voucher.voucherCode || voucher.code || 
                         voucher.billNo || voucher.invoiceNo || voucher.id || 
                         `VOUCHER-${index + 1}`;
        
        const customerName = voucher.customerName || voucher.customer || "";
        const displayText = customerName ? `${customerName}` : voucherNo;
        
        return {
          id: voucherNo,
          code: voucherNo,
          name: displayText,
          displayName: displayText,
          customerName: customerName
        };
      });
      
      setPopupData(editData);
      setPopupTitle("Select Sales Return to Edit");
      setPopupType("edit");
      setSelectedAction("edit");
      setPopupOpen(true);
      
    } catch (err) {
      console.error("Error opening edit popup:", err);
      toast.error("Error loading edit data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openDeletePopup = async () => {
    // === PERMISSION CHECK ===
    if (!formPermissions.delete) {
      toast.error("You do not have permission to delete sales returns.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    // === END PERMISSION CHECK ===
    try {
      setLoading(true);
      
      const freshVouchers = await fetchVoucherList();
      
      if (!freshVouchers || freshVouchers.length === 0) {
        toast.warning("No sales return vouchers available for deletion.");
        setLoading(false);
        return;
      }
      
      const deleteData = freshVouchers.map((voucher, index) => {
        const voucherNo = voucher.voucherNo || voucher.voucherCode || voucher.code || 
                         voucher.billNo || voucher.invoiceNo || voucher.id || 
                         `VOUCHER-${index + 1}`;
        
        const customerName = voucher.customerName || voucher.customer || "";
        const displayText = customerName ? `${customerName}` : voucherNo;
        
        return {
          id: voucherNo,
          code: voucherNo,
          name: displayText,
          displayName: displayText
        };
      });
      
      setPopupData(deleteData);
      setPopupTitle("Select Sales Return to Delete");
      setPopupType("delete");
      setSelectedAction("delete");
      setPopupOpen(true);
      
    } catch (err) {
      console.error("Error opening delete popup:", err);
      toast.error("Error loading delete data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePopupSelect = async (selectedItem) => {
    try {
      if (popupType === "customer") {
        const selectedCustomer = customers.find(c => 
          (c.code && c.code.toString() === selectedItem.id.toString())
        );
        
        if (selectedCustomer) {
          setBillDetails(prev => ({
            ...prev,
            custName: selectedCustomer.name || selectedCustomer.custName,
            partyCode: selectedCustomer.code || selectedCustomer.custCode,
            customerCode: selectedCustomer.code || selectedCustomer.custCode,
          }));
          
          // Focus on next field
          setTimeout(() => {
            newBillNoRef.current?.focus();
            setFocusedElement({
              type: 'header',
              rowIndex: 1,
              fieldIndex: 2,
              fieldName: 'newBillNo'
            });
          }, 100);
        }
        
      } else if (popupType === "salesman") {
        const selectedSalesman = salesmen.find(s => 
          (s.fcode && s.fcode.toString() === selectedItem.id.toString()) ||
          (s.code && s.code.toString() === selectedItem.id.toString())
        );
        
        if (selectedSalesman) {
          setBillDetails(prev => ({
            ...prev,
            salesman: selectedSalesman.fname || selectedSalesman.name,
            salesmanCode: selectedSalesman.fcode || selectedSalesman.code || "002"
          }));
          
          // Focus on next field
          setTimeout(() => {
            custNameRef.current?.focus();
            setFocusedElement({
              type: 'header',
              rowIndex: 1,
              fieldIndex: 1,
              fieldName: 'custName'
            });
          }, 100);
        }
        
      } else if (popupType === "item") {
        if (selectedRowIndex !== null) {
          try {
            const updatedItems = [...items];
            const currentItem = updatedItems[selectedRowIndex];

            // Get item details from the selected item
            const itemCode = selectedItem.itemCode || selectedItem.fItemcode || selectedItem.code || '';
            const itemName = selectedItem.itemName || selectedItem.fItemName || selectedItem.name || '';
            
            console.log("DEBUG selectedItem full object:", selectedItem);
            
            // ✅ Direct mapping from selectedItem properties set in fetchItems
            // The spread ...item in openItemPopup preserves ALL properties from itemList
            const finalBarcode = selectedItem.finalPrefix || selectedItem.barcode || '';
            const finalUom = selectedItem.units || selectedItem.uom || selectedItem.fUnits || '';
            const finalHsn = selectedItem.hsn || selectedItem.fHSN || '';
            const finalPreRate = selectedItem.preRate || selectedItem.sRate || selectedItem.mrp || '0';
            const finalStock = selectedItem.maxQty || selectedItem.stock || 0;
            
            // Fetch stock info only if needed
            const stockInfo = await getStockByItemName(itemCode);
            const finalTax = selectedItem.tax || selectedItem.taxRate || stockInfo.tax || '0';

            updatedItems[selectedRowIndex] = {
              ...currentItem,
              itemName,
              itemCode,
              barcode: finalBarcode,
              stock: finalStock.toString(),
              mrp: finalPreRate,
              uom: finalUom,
              hsn: finalHsn,
              tax: finalTax,
              sRate: finalPreRate,
              qty: currentItem.qty || '',
              amount: calculateAmount(currentItem.qty || '', finalPreRate)
            };

            setItems(updatedItems);
            console.log("Item selected - Final values:", {
              itemName,
              itemCode,
              barcode: finalBarcode,
              uom: finalUom,
              hsn: finalHsn,
              tax: finalTax,
              sRate: finalPreRate,
              stock: finalStock,
              selectedItem
            });
          } catch (err) {
            console.error("Item select failed:", err);
          }

          // ✅ Move cursor to QTY of SAME ROW
          setTimeout(() => {
            const qtyInput = document.querySelector(
              `input[data-row="${selectedRowIndex}"][data-field="qty"]`
            );
            qtyInput?.focus();
            setFocusedElement({
              type: 'table',
              rowIndex: selectedRowIndex,
              fieldIndex: 8,
              fieldName: 'qty'
            });
          }, 120);
        }
      } else if (popupType === "billNumber") {
        // For bill number popup, open second popup with details
        const billNo = selectedItem.code || selectedItem.id;
        await openBillDetailsPopup(billNo);
        
      } else if (popupType === "edit") {
        const voucherNo = selectedItem.code || selectedItem.id;

        // ✅ DIRECTLY LOAD VOUCHER (NO CONFIRM POPUP)
        await loadVoucherForEditing(voucherNo);

        // ✅ Close popup cleanly
        setPopupOpen(false);
        setPopupType("");
        setPopupData([]);
        setSelectedRowIndex(null);
        setSelectedAction("");
      } else if (popupType === "delete") {
        const voucherNo = selectedItem.code || selectedItem.id;
        
        showConfirmation({
          title: "Confirm Delete",
          message: `Do you want to delete?`,
          type: "danger",
          confirmText: "Yes",
          cancelText: "No",
          onConfirm: async () => {
            await deleteSalesReturn(voucherNo);
            setPopupOpen(false);
            setPopupType("");
            setPopupData([]);
            setSelectedRowIndex(null);
            setSelectedAction("");
          }
        });
      }
      
    } catch (err) {
      console.error("Error in popup selection:", err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const fetchItemsForPopup = async (pageNum, search) => {
    let filtered = [];
    
    if (popupType === "billNumber") {
      const bills = await fetchSalesInvoiceBillList(pageNum, 20);
      
      filtered = bills.map((bill, index) => {
        const billNo = bill.voucherNo || bill.billNo || bill.invoiceNo || 
                      bill.code || bill.id || `BILL-${((pageNum-1) * 20) + index + 1}`;
        
        const customerName = bill.customerName || bill.customer || bill.partyName || "";
        const displayText = customerName ? `${customerName}` : billNo;
        
        return {
          id: billNo,
          code: billNo,
          name: displayText,
          displayName: displayText,
          customerName: customerName,
          voucherDate: bill.voucherDate || bill.billDate || bill.date || "",
          originalData: bill,
        };
      });
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(item => {
          return (
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            (item.customerName && item.customerName.toLowerCase().includes(searchLower))
          );
        });
      }
    } else if (popupType === "item") {
      // Fetch items from API
      await fetchItems();
      
      // Map items from itemList state
      filtered = itemList.map((item, index) => {
        const itemCode = item.fItemcode || item.itemCode || item.code || `ITEM${index + 1}`;
        const itemName = item.fItemName || item.itemName || item.name || 'Unknown Item';
        
        return {
          ...item, // ✅ Spread ALL item properties (finalPrefix, units, hsn, preRate, maxQty, etc.)
          id: itemCode || `item-${index}`,
          code: itemCode,
          name: itemName,
          displayName: itemName,
          itemCode: itemCode,
          itemName: itemName
        };
      });
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(item => {
          return (
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            (item.displayName && item.displayName.toLowerCase().includes(searchLower)) ||
            (item.itemName && item.itemName.toLowerCase().includes(searchLower))
          );
        });
      }
    } else {
      filtered = popupData.filter(item => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
          (item.name && item.name.toLowerCase().includes(searchLower)) ||
          (item.displayName && item.displayName.toLowerCase().includes(searchLower)) ||
          (item.itemName && item.itemName.toLowerCase().includes(searchLower)) ||
          (item.fItemName && item.fItemName.toLowerCase().includes(searchLower))
        );
      });
    }
    
    const startIndex = (pageNum - 1) * 20;
    const endIndex = startIndex + 20;
    return filtered.slice(startIndex, endIndex);
  };

  const getPopupConfig = () => {
    const configs = {
      customer: {
        displayFieldKeys: ['name'],
        searchFields: ['name'],
        headerNames: ['Customer Name'],
        columnWidths: { name: '100%' },
        searchPlaceholder: 'Search customers...',
        showApplyButton: false
      },
      salesman: {
        displayFieldKeys: ['name'],
        searchFields: ['name'],
        headerNames: ['Salesman Name'],
        columnWidths: { name: '100%' },
        searchPlaceholder: 'Search salesmen...',
        showApplyButton: false
      },
      item: {
        displayFieldKeys: ['displayName'],
        searchFields: ['displayName', 'name', 'itemName'],
        headerNames: ['Item Name'],
        columnWidths: { displayName: '100%' },
        searchPlaceholder: 'Search items by name...',
        showApplyButton: false
      },
      billNumber: {
        displayFieldKeys: ['name', 'voucherDate'],
        searchFields: ['name', 'customerName'],
        headerNames: ['Customer', 'Date'],
        columnWidths: { name: '70%', voucherDate: '30%' },
        searchPlaceholder: 'Search customer name...',
        showApplyButton: false
      },
      edit: {
        displayFieldKeys: ['name'],
        searchFields: ['name', 'customerName'],
        headerNames: ['Customer Name'],
        columnWidths: { name: '100%' },
        searchPlaceholder: 'Search customer name...',
        showApplyButton: false
      },
      delete: {
        displayFieldKeys: ['name'],
        searchFields: ['name', 'customerName'],
        headerNames: ['Customer Name'],
        columnWidths: { name: '100%' },
        searchPlaceholder: 'Search customer name...',
        showApplyButton: false
      }
    };
    
    return configs[popupType] || configs.customer;
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillDetails(prev => ({ ...prev, [name]: value }));
    
    // Track search terms for popup pre-fill
    if (name === 'custName') {
      setCustomerSearchTerm(value);
    } else if (name === 'salesman') {
      setSalesmanSearchTerm(value);
    }
  };

  // ==================== KEYBOARD NAVIGATION ====================
  useEffect(() => {
  const handleGlobalKeyDown = (e) => {
    // Skip if popup is open
    if (popupOpen ||  showConfirmPopup) {
      // Handle Enter in confirmation popup
      if (showConfirmPopup && e.key === 'Enter') {
        e.preventDefault();
        const confirmButton = document.querySelector('.confirmation-popup button.confirm-button');
        if (confirmButton) {
          confirmButton.click();
        }
        return;
      }
      return;
    }

    // Skip if typing in input field (except Enter and Arrow keys)
    if (
      e.target.tagName === 'INPUT' && 
      !['Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
    ) {
      return;
    }

    const { type, rowIndex, fieldIndex, fieldName } = focusedElement;

    // Arrow key navigation
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      
      if (type === 'header') {
        handleHeaderArrowNavigation(e.key, rowIndex, fieldIndex);
      } else if (type === 'table') {
        handleTableArrowNavigation(e.key, rowIndex, fieldIndex);
      } else if (type === 'footer') {
        handleFooterArrowNavigation(e.key);
      }
   
  } else if (e.key === 'Enter') {

  // ✅ ALLOW BARCODE ENTER
  if (
    focusedElement.type === 'table' &&
    focusedElement.fieldName === 'barcode'
  ) {
    return;
  }

  if (blockGlobalEnterRef.current) {
    blockGlobalEnterRef.current = false;
    return;
  }

  e.preventDefault();



      
      // Handle Enter on Save button
      if (type === 'footer' && fieldName === 'save') {
        handleSave();
        return;
      }
      
      // 🔥 CRITICAL: Never open popups on Enter key
      // Just use arrow navigation to move to next field
      if (type === 'header') {
        handleHeaderArrowNavigation('ArrowRight', rowIndex, fieldIndex);
      } else if (type === 'table') {
        handleTableArrowNavigation('ArrowRight', rowIndex, fieldIndex);
      } else if (type === 'footer') {
        handleFooterArrowNavigation('ArrowRight');
      }
    } else if (e.key === 'Tab') {
      // Let default Tab behavior handle focus
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT') {
          const dataRow = activeElement.getAttribute('data-row');
          const dataField = activeElement.getAttribute('data-field');
          
          if (dataRow !== null) {
            // Table field
            setFocusedElement({
              type: 'table',
              rowIndex: parseInt(dataRow),
              fieldIndex: getTableFieldIndex(dataField),
              fieldName: dataField
            });
          } else {
            // Header field
         const headerFields = [
  ['billNo', 'billDate', 'salesman', 'newBillNo'],
  ['custName', 'mobileNo']
];


            const fieldName = activeElement.name;
            const fieldIndex = headerFields.indexOf(fieldName);
            
            if (fieldIndex !== -1) {
              setFocusedElement({
                type: 'header',
                rowIndex: fieldName === 'newBillNo' || fieldName === 'custName' ? 1 : 0,
                fieldIndex: fieldIndex,
                fieldName: fieldName
              });
            }
          }
        }
      }, 10);
    }
  };

  window.addEventListener('keydown', handleGlobalKeyDown);
  return () => window.removeEventListener('keydown', handleGlobalKeyDown);
}, [focusedElement, popupOpen, billDetailsPopupOpen, showConfirmPopup]);

  // Get table field index based on field name (WRate field removed)
  const getTableFieldIndex = (fieldName) => {
    const fields = ['barcode', 'itemName', 'stock', 'mrp', 'uom', 'hsn', 'tax', 'sRate', 'qty', 'amount'];
    return fields.indexOf(fieldName);
  };

  const handleHeaderArrowNavigation = (key, rowIndex, fieldIndex) => {
    const headerFields = [
    ['billNo', 'billDate', 'salesman', 'newBillNo'],
    ['custName', 'mobileNo']
  ];

    let newRowIndex = rowIndex;
    let newFieldIndex = fieldIndex;

    if (key === 'ArrowRight') {
      if (fieldIndex < headerFields[rowIndex].length - 1) {
        newFieldIndex = fieldIndex + 1;
      } else if (rowIndex === 0) {
        // Move to second row
        newRowIndex = 1;
        newFieldIndex = 0;
      }
    } else if (key === 'ArrowLeft') {
      if (fieldIndex > 0) {
        newFieldIndex = fieldIndex - 1;
      } else if (rowIndex === 1) {
        // Move to first row
        newRowIndex = 0;
        newFieldIndex = headerFields[0].length - 1;
      }
    } else if (key === 'ArrowDown') {
      if (rowIndex === 0) {
        newRowIndex = 1;
        newFieldIndex = Math.min(fieldIndex, headerFields[1].length - 1);
      } else {
        // Move to table
        newRowIndex = 0;
        setFocusedElement({
          type: 'table',
          rowIndex: 0,
          fieldIndex: 0,
          fieldName: 'barcode'
        });
        setTimeout(() => {
          const firstBarcodeInput = document.querySelector(`input[data-row="0"][data-field="barcode"]`);
          firstBarcodeInput?.focus();
        }, 10);
        return;
      }
    } else if (key === 'ArrowUp') {
      if (rowIndex === 1) {
        newRowIndex = 0;
        newFieldIndex = Math.min(fieldIndex, headerFields[0].length - 1);
      }
    }

    const fieldName = headerFields[newRowIndex][newFieldIndex];
    setFocusedElement({
      type: 'header',
      rowIndex: newRowIndex,
      fieldIndex: newFieldIndex,
      fieldName: fieldName
    });

    // Focus the input
    setTimeout(() => {
      const input = getHeaderInputRef(fieldName)?.current;
      input?.focus();
    }, 10);
  };

  const handleTableArrowNavigation = (key, rowIndex, fieldIndex) => {
    const fields = ['barcode', 'itemName', 'stock', 'mrp', 'uom', 'hsn', 'tax', 'sRate', 'qty', 'amount'];
    
    let newRowIndex = rowIndex;
    let newFieldIndex = fieldIndex;

    if (key === 'ArrowRight') {
      if (fieldIndex < fields.length - 1) {
        newFieldIndex = fieldIndex + 1;
      } else if (rowIndex < items.length - 1) {
        newRowIndex = rowIndex + 1;
        newFieldIndex = 0;
      } else {
        // Move to footer
        setFocusedElement({
          type: 'footer',
          rowIndex: 0,
          fieldIndex: 0,
          fieldName: 'add'
        });
        return;
      }
    } else if (key === 'ArrowLeft') {
      if (fieldIndex > 0) {
        newFieldIndex = fieldIndex - 1;
      } else if (rowIndex > 0) {
        newRowIndex = rowIndex - 1;
        newFieldIndex = fields.length - 1;
      } else {
        // Move to header
        setFocusedElement({
          type: 'header',
          rowIndex: 1,
          fieldIndex: 1,
          fieldName: 'newBillNo'
        });
        setTimeout(() => {
          newBillNoRef.current?.focus();
        }, 10);
        return;
      }
    } else if (key === 'ArrowDown') {
      if (rowIndex < items.length - 1) {
        newRowIndex = rowIndex + 1;
      } else {
        // Move to footer
        setFocusedElement({
          type: 'footer',
          rowIndex: 0,
          fieldIndex: 0,
          fieldName: 'add'
        });
        return;
      }
    } else if (key === 'ArrowUp') {
      if (rowIndex > 0) {
        newRowIndex = rowIndex - 1;
      } else {
        // Move to header
        setFocusedElement({
          type: 'header',
          rowIndex: 1,
          fieldIndex: Math.min(fieldIndex, 1),
          fieldName: fieldIndex === 0 ? 'custName' : 'newBillNo'
        });
        setTimeout(() => {
          const input = fieldIndex === 0 ? custNameRef.current : newBillNoRef.current;
          input?.focus();
        }, 10);
        return;
      }
    }

    const fieldName = fields[newFieldIndex];
    setFocusedElement({
      type: 'table',
      rowIndex: newRowIndex,
      fieldIndex: newFieldIndex,
      fieldName: fieldName
    });

    // Focus the input and select text
    setTimeout(() => {
      const input = document.querySelector(`input[data-row="${newRowIndex}"][data-field="${fieldName}"]`);
      if (input) {
        input.focus();
        // Select text if it's an input field
        if (input.tagName === 'INPUT' && input.type === 'text' && !input.readOnly) {
          input.select();
        }
      }
    }, 10);
  };

  const handleFooterArrowNavigation = (key) => {
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      // Navigate between footer buttons
      const buttons = ['add', 'edit', 'delete', 'clear', 'save', 'print'];
      const currentIndex = buttons.indexOf(focusedElement.fieldName);
      let newIndex = currentIndex;
      
      if (key === 'ArrowRight' && currentIndex < buttons.length - 1) {
        newIndex = currentIndex + 1;
      } else if (key === 'ArrowLeft' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }
      
      if (newIndex !== currentIndex) {
        const newFieldName = buttons[newIndex];
        setFocusedElement({
          type: 'footer',
          rowIndex: 0,
          fieldIndex: newIndex,
          fieldName: newFieldName
        });
      }
    } else if (key === 'ArrowUp') {
      // Move to last row of table
      const lastRowIndex = items.length - 1;
      setFocusedElement({
        type: 'table',
        rowIndex: lastRowIndex,
        fieldIndex: 0,
        fieldName: 'barcode'
      });
      setTimeout(() => {
        const input = document.querySelector(`input[data-row="${lastRowIndex}"][data-field="barcode"]`);
        input?.focus();
      }, 10);
    }
  };

  const handleEnterNavigation = (type, rowIndex, fieldIndex, fieldName) => {
  if (type === 'header') {
    // 🔥 REMOVED popup opening on Enter
    // Just move to next field
    handleHeaderArrowNavigation('ArrowRight', rowIndex, fieldIndex);
  } else if (type === 'table') {
    // 🔥 REMOVED popup opening on Enter for itemName
    if (fieldName === 'qty') {
      // Check if item name is selected
      const currentItem = items[rowIndex];
     if (!currentItem.itemName || currentItem.itemName.trim() === '') {
  e.preventDefault();
  blockGlobalEnterRef.current = true; // 🔥 BLOCK GLOBAL HANDLER

  // toast.info("Item name empty. Moving to Save.");

  setTimeout(() => {
    const saveBtn = document.querySelector('button[data-action="save"]');

    if (saveBtn) {
      saveBtn.focus();

      setActiveFooterAction('save');

      setFocusedElement({
        type: 'footer',
        rowIndex: 0,
        fieldIndex: 4,
        fieldName: 'save'
      });
    }
  }, 10);

  return;
}


      if (rowIndex < items.length - 1) {
        // Move to next row
        setFocusedElement({
          type: 'table',
          rowIndex: rowIndex + 1,
          fieldIndex: 0,
          fieldName: 'barcode'
        });
        setTimeout(() => {
          const input = document.querySelector(`input[data-row="${rowIndex + 1}"][data-field="barcode"]`);
          input?.focus();
        }, 10);
      } else {
        // Add new row
        handleAddRow();
        setTimeout(() => {
          const newRowIndex = items.length;
          setFocusedElement({
            type: 'table',
            rowIndex: newRowIndex,
            fieldIndex: 0,
            fieldName: 'barcode'
          });
          const input = document.querySelector(`input[data-row="${newRowIndex}"][data-field="barcode"]`);
          input?.focus();
        }, 60);
      }
    } else {
      // Move to next table field
      handleTableArrowNavigation('ArrowRight', rowIndex, fieldIndex);
    }
  } else if (type === 'footer') {
    // Handle footer button actions
    if (fieldName === 'add') {
      setActiveTopAction('add');
      handleClear();
    } else if (fieldName === 'edit') {
      openEditPopup();
    } else if (fieldName === 'delete') {
      openDeletePopup();
    } else if (fieldName === 'clear') {
      handleClear();
    } else if (fieldName === 'save') {
      handleSave();
    } else if (fieldName === 'print') {
      handlePrint();
    }
  }
};

  const getHeaderInputRef = (fieldName) => {
    switch (fieldName) {
      case 'billNo': return billNoRef;
      case 'billDate': return billDateRef;
      case 'mobileNo': return mobileRef;
      case 'salesman': return salesmanRef;
      case 'custName': return custNameRef;
      case 'newBillNo': return newBillNoRef;
      default: return null;
    }
  };

  // ==================== UPDATED KEY HANDLERS ====================
  const handleKeyDown = (e, nextRef, fieldName = '') => {
    // Check if a letter key is pressed (A-Z, a-z)
    const isLetterKey = e.key.length === 1 && /^[a-zA-Z]$/.test(e.key);
    
    if (isLetterKey) {
      e.preventDefault(); // Prevent the letter from being typed in the field
      
      if (fieldName === 'salesman') {
        // Open salesman popup with the typed letter as initial search
        openSalesmanPopup(e.key);
      } else if (fieldName === 'custName') {
        // Open customer popup with the typed letter as initial search
        openCustomerPopup(e.key);
      } else if (fieldName === 'newBillNo') {
        // Open bill number popup with the typed letter as initial search
        openBillNumberPopup().then(() => {
          setTimeout(() => {
            const searchInput = document.querySelector('.popup-list-selector input[type="text"]');
            if (searchInput) {
              searchInput.value = e.key;
              searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }, 200);
        });
      }
    } else if (e.key === '/') {
      e.preventDefault();
      
      if (fieldName === 'salesman') {
        openSalesmanPopup();
      } else if (fieldName === 'custName') {
        openCustomerPopup();
      } else if (fieldName === 'newBillNo') {
        openBillNumberPopup();
      }
    }
  };

const handleTableKeyDown = (e, rowIndex, field) => {
  // Check if this item is read-only (from bill selection)
  const currentItem = items[rowIndex];
  const isItemReadOnly = currentItem?.isReadOnly || false;
  
  // If read-only, only allow editing qty field
  if (isItemReadOnly && field !== 'qty') {
    // Prevent any editing or popup opening for read-only fields
    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      // Move to qty field
      const qtyInput = document.querySelector(`input[data-row="${rowIndex}"][data-field="qty"]`);
      if (qtyInput) {
        qtyInput.focus();
        qtyInput.select();
      }
      return;
    }
    // Allow arrow navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      // Continue with normal navigation
    } else {
      // Prevent any other key input
      e.preventDefault();
      return;
    }
  }
  
  // const currentItem = items[rowIndex];
  const isLastRow = rowIndex === items.length - 1;

  // 🔹 LETTER → ITEM POPUP
  if (
    field === 'itemName' &&
    e.key.length === 1 &&
    /^[a-zA-Z]$/.test(e.key)
  ) {
    e.preventDefault();
    openItemPopup(rowIndex, e.key);
    return;
  }

  // 🔹 SLASH → ITEM POPUP
  if (field === 'itemName' && e.key === '/') {
    e.preventDefault();
    openItemPopup(rowIndex);
    return;
  }

  // 🔹 ONLY HANDLE ENTER BELOW
  if (e.key !== 'Enter') return;

  e.preventDefault();
  e.stopPropagation();

  // Select all text in the current cell on Enter
  const currentInput = e.target;
  if (currentInput && currentInput.tagName === 'INPUT' && !currentInput.readOnly) {
    currentInput.select();
  }

  // =====================================================
  // 🚨 RULE 1: itemName EMPTY → GO TO SAVE
  // =====================================================
  if (
    (!currentItem.itemName || !currentItem.itemName.trim())
  ) {
    blockGlobalEnterRef.current = true;

    setTimeout(() => {
      const saveBtn = document.querySelector(
        'button[data-action="save"]'
      );
      if (saveBtn) {
        saveBtn.focus();
        setActiveFooterAction('save');
        setFocusedElement({
          type: 'footer',
          rowIndex: 0,
          fieldIndex: 4,
          fieldName: 'save'
        });
      }
    }, 20);

    return;
  }

  // =====================================================
  // 🚨 RULE 2: QTY FIELD LOGIC
  // =====================================================
  if (field === 'qty') {
    // If NOT last row → move to next row barcode
    if (!isLastRow) {
      setTimeout(() => {
        const input = document.querySelector(
          `input[data-row="${rowIndex + 1}"][data-field="barcode"]`
        );
        if (input) {
          input.focus();
          if (input.tagName === 'INPUT' && input.type === 'text' && !input.readOnly) {
            input.select();
          }
        }

        setFocusedElement({
          type: 'table',
          rowIndex: rowIndex + 1,
          fieldIndex: 0,
          fieldName: 'barcode'
        });
      }, 20);
      return;
    }

    // LAST ROW + item exists → ADD NEW ROW
    handleAddRow();

    setTimeout(() => {
      const newRowIndex = items.length;
      const input = document.querySelector(
        `input[data-row="${newRowIndex}"][data-field="barcode"]`
      );
      if (input) {
        input.focus();
        if (input.tagName === 'INPUT' && input.type === 'text' && !input.readOnly) {
          input.select();
        }
      }

      setFocusedElement({
        type: 'table',
        rowIndex: newRowIndex,
        fieldIndex: 0,
        fieldName: 'barcode'
      });
    }, 60);

    return;
  }

  // =====================================================
  // 🔹 NORMAL FIELD FLOW (ENTER_FIELDS)
  // =====================================================
  const currentIndex = ENTER_FIELDS.indexOf(field);
  if (currentIndex !== -1 && currentIndex < ENTER_FIELDS.length - 1) {
    const nextField = ENTER_FIELDS[currentIndex + 1];

    setTimeout(() => {
      const input = document.querySelector(
        `input[data-row="${rowIndex}"][data-field="${nextField}"]`
      );
      if (input) {
        input.focus();
        // Select text in the next input field if it's an input element
        if (input.tagName === 'INPUT' && input.type === 'text' && !input.readOnly) {
          input.select();
        }
      }

      setFocusedElement({
        type: 'table',
        rowIndex,
        fieldIndex: getTableFieldIndex(nextField),
        fieldName: nextField
      });
    }, 10);
  }
};





  const handleAddItem = async () => {
    // This function is kept for compatibility but barcode input field is removed
    toast.warning("Barcode input field has been removed. Please use item name field to search for items.");
  };

  const handleAddRow = () => {
    const lastItem = items[items.length - 1];

    // 🚫 BLOCK adding row if item name is empty
    if (!lastItem.itemName || lastItem.itemName.trim() === '') {
      toast.warning("Please select an item before adding a new row");
      return;
    }

    const newRow = {
      id: items.length + 1,
      sNo: items.length + 1,
      barcode: '',
      itemName: '',
      stock: '',
      mrp: '',
      uom: '',
      hsn: '',
      tax: '',
      sRate: '',
      qty: '',
      amount: '0.00',
      itemCode: ''
    };
    setItems([...items, newRow]);
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        if (field === 'qty' || field === 'sRate') {
          const qty = field === 'qty' ? value : updatedItem.qty;
          const rate = field === 'sRate' ? value : updatedItem.sRate;
          updatedItem.amount = calculateAmount(qty, rate);
        }

        return updatedItem;
      }
      return item;
    }));
    
    // Track item search term for popup pre-fill
    if (field === 'barcode' || field === 'itemName') {
      setItemSearchTerm(value);
    }
  };

  const handleDeleteRow = (id) => {
    const itemToDelete = items.find(item => item.id === id);
    const itemName = itemToDelete?.itemName || 'this item';
    const barcode = itemToDelete?.barcode ? `(Barcode: ${itemToDelete.barcode})` : '';

    showConfirmation({
      title: "Delete Item",
      message: `Do you want to clear?`,
      type: "danger",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: () => {
        if (items.length > 1) {
          const filteredItems = items.filter(item => item.id !== id);
          const updatedItems = filteredItems.map((item, index) => ({
            ...item,
            sNo: index + 1
          }));
          setItems(updatedItems);
        } else {
          const clearedItem = {
            id: 1,
            sNo: 1,
            barcode: '',
            itemName: '',
            stock: '',
            mrp: '',
            uom: '',
            hsn: '',
            tax: '',
            sRate: '',
            qty: '',
            amount: '0.00',
            itemCode: ''
          };
          setItems([clearedItem]);
        }
      }
    });
  };
const handleApplyBillDirect = async () => {
  // 🔹 Close Bill Details popup
  setBillDetailsPopupOpen(false);

  // 🔹 Apply selected items immediately
  await applyBillNumberCore();

  // 🔹 Cleanup
  setSelectedBillForDetails(null);
  setCheckedBills({});
  setBillDetailsSearchText("");
  setBillPopupRowIndex(0);

  // 🔹 Focus on qty field of the first item
  setTimeout(() => {
    const qtyInput = document.querySelector(
      `input[data-row="0"][data-field="qty"]`
    );
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select();
    }
  }, 500);
};




  const handleClear = () => {
    showConfirmation({
      title: "Clear All Data",
      message: "Do you want to clear ? ",
      type: "warning",
      confirmText: "Clear",
      cancelText: "Cancel",
      onConfirm: async () => {
        // Reset to ADD mode
        setActiveTopAction('add');
        setIsEditMode(false);
        
        await resetForm();
        
        // Optional feedback
        toast.info("Form cleared. Now in Add mode.");
      }
    });
  };

  // ==================== SAVE FUNCTION ====================
const handleSave = async () => {
  showConfirmation({
    title: isEditMode ? "Update Sales Return" : "Save Sales Return",
    message: isEditMode
      ? "Do you want to update?"
      : "Do you want to save?",
    type: isEditMode ? "warning" : "success",
    confirmText: "Yes",
    cancelText: "No",
    onConfirm: async () => {
      if (isEditMode) {
        await updateSalesReturn();
      } else {
        await createSalesReturn();
      }
    }
  });
};



const handlePrint = () => {
  toast.info('Print functionality to be implemented');
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
     
      
      position: 'relative',
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
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '6px' : '8px',
      paddingLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '30px' : screenSize.isTablet ? '34px' : '34px',
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
      paddingRight: screenSize.isMobile ? '30px' : screenSize.isTablet ? '34px' : '34px',
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
      paddingRight: screenSize.isMobile ? '30px' : screenSize.isTablet ? '34px' : '34px',
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
      paddingRight: screenSize.isMobile ? '30px' : screenSize.isTablet ? '34px' : '34px',
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
    searchIconInside: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      opacity: 0.7,
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
      paddingRight: screenSize.isMobile ? '20px' : '24px',
      boxSizing: 'border-box',
      border: 'none',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      textAlign: 'center',
      backgroundColor: 'transparent',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      cursor: 'pointer',
      position: 'relative',
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
      paddingRight: screenSize.isMobile ? '20px' : '24px',
      boxSizing: 'border-box',
      border: '2px solid #1B91DA',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      textAlign: 'center',
      backgroundColor: 'white',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      cursor: 'pointer',
      position: 'relative',
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
    customPopupOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: screenSize.isMobile ? '10px' : '20px',
    },
    customPopupContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      width: '100%',
      maxWidth: screenSize.isMobile ? '95vw' : screenSize.isTablet ? '80vw' : '70vw',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: TYPOGRAPHY.fontFamily,
    },
    customPopupHeader: {
      padding: screenSize.isMobile ? '12px 16px' : '16px 20px',
      backgroundColor: '#1B91DA',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    customPopupTitle: {
      fontSize: screenSize.isMobile ? '16px' : '18px',
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      margin: 0,
    },
    customPopupCloseButton: {
      background: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '0',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
    },
    customPopupSearchContainer: {
      padding: screenSize.isMobile ? '12px 16px' : '16px 20px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#f8f9fa',
    },
    customPopupSearchInput: {
      width: '100%',
      padding: screenSize.isMobile ? '8px 12px' : '10px 16px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: screenSize.isMobile ? '14px' : '16px',
      fontFamily: TYPOGRAPHY.fontFamily,
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    },
    customPopupContent: {
      flex: 1,
      overflowY: 'auto',
      maxHeight: '50vh',
    },
    customPopupTable: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    customPopupTableHeader: {
      backgroundColor: '#f5f5f5',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    customPopupTableHeaderCell: {
      padding: screenSize.isMobile ? '8px 12px' : '12px 16px',
      textAlign: 'left',
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      fontSize: screenSize.isMobile ? '13px' : '14px',
      color: '#333',
      borderBottom: '2px solid #ddd',
      backgroundColor: '#f5f5f5',
    },
    customPopupTableRow: {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      borderBottom: '1px solid #eee',
    },
    customPopupTableRowSelected: {
      backgroundColor: '#e3f2fd',
    },
    customPopupTableCell: {
      padding: screenSize.isMobile ? '10px 12px' : '12px 16px',
      fontSize: screenSize.isMobile ? '13px' : '14px',
      color: '#333',
    },
    customPopupFooter: {
      padding: screenSize.isMobile ? '12px 16px' : '16px 20px',
      borderTop: '1px solid #e0e0e0',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '10px',
      borderRadius: '0 0 8px 8px',
    },
    customPopupFooterButton: {
      padding: screenSize.isMobile ? '8px 16px' : '10px 20px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: screenSize.isMobile ? '14px' : '15px',
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      transition: 'background-color 0.2s, transform 0.1s',
      fontFamily: TYPOGRAPHY.fontFamily,
      minWidth: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    customPopupClearButton: {
      backgroundColor: '#da1b2be3',
      color: 'white',
    },
    customPopupApplyButton: {
      backgroundColor: '#1B91DA',
      color: 'white',
    },
    customPopupApplyButtonDisabled: {
      backgroundColor: '#cccccc',
      color: '#666666',
      cursor: 'not-allowed',
    },
    noDataMessage: {
      padding: '40px 20px',
      textAlign: 'center',
      color: '#666',
      fontSize: '16px',
    },
    checkboxCell: {
      padding: screenSize.isMobile ? '8px 8px' : screenSize.isTablet ? '10px 12px' : '10px 12px',
      textAlign: 'center',
      width: '40px',
    },
    checkboxInput: {
      width: '16px',
      height: '16px',
      cursor: 'pointer',
    },
    loadMoreButton: {
      width: '100%',
      padding: '10px',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      border: '1px solid #ddd',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '10px',
      fontSize: '14px',
      color: '#1B91DA',
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    loadMoreButtonDisabled: {
      backgroundColor: '#f0f0f0',
      color: '#999',
      cursor: 'not-allowed',
    },
    itemDetailsTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px',
      fontSize: '12px',
    },
    itemDetailsHeader: {
      backgroundColor: '#f8f9fa',
      fontWeight: 'bold',
    },
    itemDetailsHeaderCell: {
      padding: '6px',
      border: '1px solid #ddd',
      textAlign: 'left',
      fontSize: '11px',
    },
    itemDetailsRow: {
      borderBottom: '1px solid #eee',
    },
    itemDetailsCell: {
      padding: '6px',
      border: '1px solid #ddd',
      textAlign: 'left',
      fontSize: '11px',
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

  // Add CSS for hover effects (same as SalesInvoice)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sales-return-scrollable::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .sales-return-scrollable::-webkit-scrollbar-track {
        background-color: #f0f0f0;
        border-radius: 4px;
      }
      
      .sales-return-scrollable::-webkit-scrollbar-thumb {
        background-color: #1B91DA;
        border-radius: 4px;
      }
      
      .sales-return-scrollable::-webkit-scrollbar-thumb:hover {
        background-color: #1479c0;
      }
      
      .sales-return-scrollable {
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
        @keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

      
      input:focus, 
      select:focus {
        
        box-shadow: 0 0 0 2px rgba(27, 145, 218, 0.2) !important;
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

  const renderBillDetailsContent = () => {

    const billNo = selectedBillForDetails;
    if (!billNo) return null;

    const details = billDetailsData[billNo];
    if (!details) {
      return <div style={{ padding: 30, textAlign: "center" }}>No data</div>;
    }

    const itemsArray = details.items || details.details || [];

    const handleSelectAll = (checked) => {
      setSelectAllItems(checked);
      const updated = {};
      itemsArray.forEach(item => {
        const key = item.fItemcode || item.itemCode;
        updated[key] = checked;
      });
      setCheckedBills(updated);
    };

    return (
      <div style={{ padding: "20px", animation: "fadeSlide 0.3s ease" }}>
        
        <h4 style={{
          marginBottom: 12,
          fontWeight: 700,
          color: "#1B91DA"
        }}>
          Items – Select items to return
        </h4>

        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "13px"
        }}>
          <thead>
            <tr style={{ background: "#f0f6ff" }}>
              <th style={{ padding: 8 }}>
                <input
                  type="checkbox"
                  checked={selectAllItems}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th style={thStyle}>barcode</th>
              <th style={thStyle}>Item Name</th>
              <th style={thStyle}>Qty</th>
              <th style={thStyle}>Unit</th>
              <th style={thStyle}>Rate</th>
              <th style={thStyle}>Amount</th>
            </tr>
          </thead>

          <tbody>
             
            {itemsArray.map((item, idx) => {
              const key = item.fItemcode || item.itemCode;
              return (
                <tr
                  key={idx}
                  ref={(el) => (billRowRefs.current[idx] = el)}
                  style={{
                    transition: "background 0.2s",
                    background:
                      billPopupRowIndex === idx
                        ? "#cce5ff"
                        : checkedBills[key]
                        ? "#e3f2fd"
                        : "#fff"
                  }}
                >
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={checkedBills[key] || false}
                      onChange={(e) =>
                        setCheckedBills(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))
                      }
                    />
                  </td>
                   <td style={tdStyle}>{item.barcode || item.barcode}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {item.fitemNme || item.itemName}
                  </td>
                  <td style={tdStyle}>{item.fTotQty || item.qty}</td>
                
                  <td style={tdStyle}>{item.fUnit || item.uom}</td>
                  <td style={tdStyle}>₹{item.fRate || item.rate}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    ₹{item.fAmount || item.amount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const thStyle = {
    padding: 8,
    fontWeight: 700,
    textAlign: "left",
    borderBottom: "2px solid #ddd"
  };

  const tdStyle = {
    padding: 8,
    borderBottom: "1px solid #eee"
  };

  return (
    <div style={styles.container} className="sales-return-scrollable">
      {error && <div style={styles.errorContainer}>Error: {error}</div>}
      
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div>Loading...</div>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showConfirmPopup}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={confirmPopupConfig.title}
        message={confirmPopupConfig.message}
        confirmText={confirmPopupConfig.confirmText}
        cancelText={confirmPopupConfig.cancelText}
        type={confirmPopupConfig.type}
        showIcon={true}
        disableBackdropClose={false}
        showLoading={false}
        defaultFocusedButton="confirm"
        borderColor="#1B91DA"
        hideCancelButton={false}
      />

{/* --- HEADER SECTION --- */}
<div style={styles.headerSection}>
  {/* FIRST ROW with 4 fields - ALL SAME SIZE */}
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    flexWrap: screenSize.isMobile ? 'wrap' : 'nowrap',
    gap: screenSize.isMobile ? '10px' : screenSize.isTablet ? '12px' : '16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    width: '100%'
  }}>
    
    {/* Bill No */}
    <div style={{
      ...styles.formField,
      flex: '1 1 auto',
      minWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
               screenSize.isTablet ? 'calc(33.33% - 8px)' : 
               'calc(25% - 12px)',
      maxWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
                screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                'calc(25% - 12px)',
      flexBasis: screenSize.isMobile ? 'calc(50% - 5px)' : 
                 screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                 'calc(25% - 12px)'
    }}>
      <label style={styles.inlineLabel}>Ref No:</label>
      <input
        type="text"
        style={{
          ...(focusedField === 'billNo' ? styles.inlineInputFocused : styles.inlineInput),
          padding: screenSize.isMobile ? '10px 35px 10px 8px' : 
                  screenSize.isTablet ? '8px 35px 8px 10px' : 
                  '8px 35px 8px 10px',
          fontSize: screenSize.isMobile ? '14px' : 'inherit'
        }}
        value={billDetails.billNo}
        name="billNo"
        onChange={handleInputChange}
        ref={billNoRef}
        onKeyDown={(e) => handleKeyDown(e, billDateRef)}
        onFocus={() => {
          setFocusedField('billNo');
          setFocusedElement({
            type: 'header',
            rowIndex: 0,
            fieldIndex: 0,
            fieldName: 'billNo'
          });
        }}
        onBlur={() => setFocusedField('')}
        readOnly
      />
     
    </div>

    {/* Bill Date */}
   <div style={{
  ...styles.formField,
  flex: '1 1 auto',
  minWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
           screenSize.isTablet ? 'calc(33.33% - 8px)' : 
           'calc(25% - 12px)',
  maxWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
            screenSize.isTablet ? 'calc(33.33% - 8px)' : 
            'calc(25% - 12px)',
  flexBasis: screenSize.isMobile ? 'calc(50% - 5px)' : 
             screenSize.isTablet ? 'calc(33.33% - 8px)' : 
             'calc(25% - 12px)'
}}>
  <label style={styles.inlineLabel}>Entry Date:</label>
  <input
    type="date"
    style={{
      ...(focusedField === 'billDate' ? styles.inlineInputFocused : styles.inlineInput),
      padding: screenSize.isMobile ? '10px 35px 10px 8px' : 
              screenSize.isTablet ? '8px 35px 8px 10px' : 
              '8px 35px 8px 10px',
      fontSize: screenSize.isMobile ? '14px' : 'inherit'
    }}
    value={billDetails.billDate}
    name="billDate"
    onChange={handleInputChange}
    ref={billDateRef}
    onKeyDown={(e) => handleKeyDown(e, salesmanRef)}
    onFocus={() => {
      setFocusedField('billDate');
      setFocusedElement({
        type: 'header',
        rowIndex: 0,
        fieldIndex: 1,
        fieldName: 'billDate'
      });
    }}
    onBlur={() => setFocusedField('')}
  />
</div>

    {/* Salesman */}
    <div style={{
      ...styles.formField,
      flex: '1 1 auto',
      minWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
               screenSize.isTablet ? 'calc(33.33% - 8px)' : 
               'calc(25% - 12px)',
      maxWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
                screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                'calc(25% - 12px)',
      flexBasis: screenSize.isMobile ? 'calc(50% - 5px)' : 
                 screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                 'calc(25% - 12px)'
    }}>
      <label style={styles.inlineLabel}>Salesman:</label>
      <input
        type="text"
        style={{
          ...(focusedField === 'salesman' ? styles.inlineInputClickableFocused : styles.inlineInputClickable),
          padding: screenSize.isMobile ? '10px 35px 10px 8px' : 
                  screenSize.isTablet ? '8px 35px 8px 10px' : 
                  '8px 35px 8px 10px',
          fontSize: screenSize.isMobile ? '14px' : 'inherit'
        }}
        value={billDetails.salesman}
        name="salesman"
        onChange={handleInputChange}
        ref={salesmanRef}
        onClick={() => {
          openSalesmanPopup(billDetails.salesman);
        }}
        onKeyDown={(e) => handleKeyDown(e, newBillNoRef, 'salesman')}
        onFocus={() => {
          setFocusedField('salesman');
          setFocusedElement({
            type: 'header',
            rowIndex: 0,
            fieldIndex: 2,
            fieldName: 'salesman'
          });
        }}
        onBlur={() => setFocusedField('')}
        readOnly
      />
      <div 
        style={{
          ...styles.searchIconInside,
          right: screenSize.isMobile ? '8px' : '10px',
          fontSize: screenSize.isMobile ? '16px' : '18px'
        }}
        title="Click or press / to search"
      >
        <SearchIcon />
      </div>
    </div>

    {/* NEW Bill No Field */}
    <div style={{
      ...styles.formField,
      flex: '1 1 auto',
      minWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
               screenSize.isTablet ? 'calc(33.33% - 8px)' : 
               'calc(25% - 12px)',
      maxWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
                screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                'calc(25% - 12px)',
      flexBasis: screenSize.isMobile ? 'calc(50% - 5px)' : 
                 screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                 'calc(25% - 12px)'
    }}>
      <label style={styles.inlineLabel}>Bill No:</label>
      <input
        type="text"
        style={{
          ...(focusedField === 'newBillNo' ? styles.inlineInputClickableFocused : styles.inlineInputClickable),
          padding: screenSize.isMobile ? '10px 35px 10px 8px' : 
                  screenSize.isTablet ? '8px 35px 8px 10px' : 
                  '8px 35px 8px 10px',
          fontSize: screenSize.isMobile ? '14px' : 'inherit'
        }}
        value={billDetails.newBillNo}
        name="newBillNo"
        onChange={handleInputChange}
        ref={newBillNoRef}
        onClick={openBillNumberPopup}
        onKeyDown={(e) => handleKeyDown(e, custNameRef, 'newBillNo')}
        onFocus={() => {
          setFocusedField('newBillNo');
          setFocusedElement({
            type: 'header',
            rowIndex: 0,
            fieldIndex: 3,
            fieldName: 'newBillNo'
          });
        }}
        onBlur={() => setFocusedField('')}
        readOnly
      />
      <div 
        style={{
          ...styles.searchIconInside,
          right: screenSize.isMobile ? '8px' : '10px',
          fontSize: screenSize.isMobile ? '16px' : '18px'
        }}
        title="Click or press / to search"
      >
        <SearchIcon />
      </div>
    </div>
  </div>

  {/* SECOND ROW with 2 fields + 2 EMPTY DIVS like sales invoice */}
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    flexWrap: screenSize.isMobile ? 'wrap' : 'nowrap',
    gap: screenSize.isMobile ? '10px' : screenSize.isTablet ? '12px' : '16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  }}>

    {/* Customer Name */}
    <div style={{
      ...styles.formField,
      flex: '1 1 auto',
      minWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
               screenSize.isTablet ? 'calc(33.33% - 8px)' : 
               'calc(25% - 12px)',
      maxWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
                screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                'calc(25% - 12px)',
      flexBasis: screenSize.isMobile ? 'calc(50% - 5px)' : 
                 screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                 'calc(25% - 12px)'
    }}>
      <label style={styles.inlineLabel}>Customer:</label>
      <input
        type="text"
        style={{
          ...(focusedField === 'custName' ? styles.inlineInputClickableFocused : styles.inlineInputClickable),
          padding: screenSize.isMobile ? '10px 35px 10px 8px' : 
                  screenSize.isTablet ? '8px 35px 8px 10px' : 
                  '8px 35px 8px 10px',
          fontSize: screenSize.isMobile ? '14px' : 'inherit'
        }}
        value={billDetails.custName}
        name="custName"
        onChange={handleInputChange}
        ref={custNameRef}
        onClick={() => {
          openCustomerPopup(billDetails.custName);
        }}
        onKeyDown={(e) => handleKeyDown(e, mobileRef, 'custName')}
        onFocus={() => {
          setFocusedField('custName');
          setFocusedElement({
            type: 'header',
            rowIndex: 1,
            fieldIndex: 0,
            fieldName: 'custName'
          });
        }}
        onBlur={() => setFocusedField('')}
        readOnly
      />
      <div 
        style={{
          ...styles.searchIconInside,
          right: screenSize.isMobile ? '8px' : '10px',
          fontSize: screenSize.isMobile ? '16px' : '18px'
        }}
        title="Click or press / to search"
      >
        <SearchIcon />
      </div>
    </div>

{/* Mobile No */}
<div
  style={{
    ...styles.formField,
    flex: '1 1 auto',
    minWidth: screenSize.isMobile
      ? 'calc(50% - 5px)'
      : screenSize.isTablet
      ? 'calc(33.33% - 8px)'
      : 'calc(25% - 12px)',
    maxWidth: screenSize.isMobile
      ? 'calc(50% - 5px)'
      : screenSize.isTablet
      ? 'calc(33.33% - 8px)'
      : 'calc(25% - 12px)',
    flexBasis: screenSize.isMobile
      ? 'calc(50% - 5px)'
      : screenSize.isTablet
      ? 'calc(33.33% - 8px)'
      : 'calc(25% - 12px)',
  }}
>
  <label style={styles.inlineLabel}>Mobile No:</label>

  <input
    type="text"
    style={{
      ...(focusedField === 'mobileNo'
        ? styles.inlineInputFocused
        : styles.inlineInput),
      padding: screenSize.isMobile
        ? '10px 35px 10px 8px'
        : '8px 35px 8px 10px',
      fontSize: screenSize.isMobile ? '14px' : 'inherit',
    }}
    value={billDetails.mobileNo}
    name="mobileNo"
    onChange={handleInputChange}
    ref={mobileRef}
    onKeyDown={(e) => {
      handleKeyDown(e, null, 'mobileNo');

      // ✅ ENTER → Table Barcode
      if (e.key === 'Enter') {
        e.preventDefault();

        setFocusedElement({
          type: 'table',
          rowIndex: 0,
          fieldIndex: 0,
          fieldName: 'barcode',
        });

        setTimeout(() => {
          document
            .querySelector(
              'input[data-row="0"][data-field="barcode"]'
            )
            ?.focus();
        }, 10);
      }
    }}
    onFocus={() => {
      setFocusedField('mobileNo');
      setFocusedElement({
        type: 'header',
        rowIndex: 1,
        fieldIndex: 1,
        fieldName: 'mobileNo',
      });
    }}
    onBlur={() => setFocusedField('')}
  />
</div>


    {/* EMPTY DIV 1 - to maintain 4-column grid structure like sales invoice */}
    <div style={{
      ...styles.formField,
      flex: '1 1 auto',
      minWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
               screenSize.isTablet ? 'calc(33.33% - 8px)' : 
               'calc(25% - 12px)',
      maxWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
                screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                'calc(25% - 12px)',
      flexBasis: screenSize.isMobile ? 'calc(50% - 5px)' : 
                 screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                 'calc(25% - 12px)'
    }}></div>

    {/* EMPTY DIV 2 - to maintain 4-column grid structure like sales invoice */}
    <div style={{
      ...styles.formField,
      flex: '1 1 auto',
      minWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
               screenSize.isTablet ? 'calc(33.33% - 8px)' : 
               'calc(25% - 12px)',
      maxWidth: screenSize.isMobile ? 'calc(50% - 5px)' : 
                screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                'calc(25% - 12px)',
      flexBasis: screenSize.isMobile ? 'calc(50% - 5px)' : 
                 screenSize.isTablet ? 'calc(33.33% - 8px)' : 
                 'calc(25% - 12px)'
    }}></div>
  </div>
</div>


      {/* --- TABLE SECTION --- */}
      <div style={styles.tableSection} className="sales-return-scrollable">
        <div style={styles.tableContainer} className="sales-return-scrollable">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>S.No</th>
                <th style={styles.th}>Barcode</th>
                <th style={{ ...styles.th, ...styles.itemNameContainer, textAlign: 'left' }}>Item Name</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>MRP</th>
                <th style={styles.th}>UOM</th>
                <th style={styles.th}>HSN</th>
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
  style={focusedField === `barcode-${item.id}` ? styles.editableInputFocused : styles.editableInput}
  
  value={item.barcode}
  data-row={index}
  data-field="barcode"
  onChange={(e) => handleItemChange(item.id, 'barcode', e.target.value)}
  readOnly={item.isReadOnly || false}
  onKeyDown={async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    // ✅ IF ITEM IS READ-ONLY (from bill selection) → GO TO QTY
    if (item.isReadOnly) {
      setTimeout(() => {
        const qtyInput = document.querySelector(
          `input[data-row="${index}"][data-field="qty"]`
        );
        if (qtyInput) {
          qtyInput.focus();
          qtyInput.select();
        }

        setFocusedElement({
          type: 'table',
          rowIndex: index,
          fieldIndex: 8,
          fieldName: 'qty'
        });
      }, 10);
      return;
    }

    // ✅ IF BARCODE EMPTY → GO TO ITEM NAME
    if (!item.barcode || !item.barcode.trim()) {
      setTimeout(() => {
        const input = document.querySelector(
          `input[data-row="${index}"][data-field="itemName"]`
        );
        input?.focus();

        setFocusedElement({
          type: 'table',
          rowIndex: index,
          fieldIndex: 1,
          fieldName: 'itemName'
        });
      }, 10);
      return;
    }

    // ✅ IF BARCODE HAS VALUE → FETCH ITEM
    await handleBarcodeEnter(index, item.barcode);
    return;
  }

  handleTableKeyDown(e, index, 'barcode');
}}

  onFocus={() => {
    setFocusedField(`barcode-${item.id}`);
    setFocusedElement({
      type: 'table',
      rowIndex: index,
      fieldIndex: 0,
      fieldName: 'barcode'
    });
  }}
  onBlur={() => setFocusedField('')}
/>

                  </td>
                  <td style={{ ...styles.td, ...styles.itemNameContainer, position: 'relative' }}>
                    <input
                      style={focusedField === `itemName-${item.id}` ? styles.editableInputClickableFocused : styles.editableInputClickable}
                      value={item.itemName}
                      data-row={index}
                      data-field="itemName"
                      onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                      readOnly={item.isReadOnly || false}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'itemName')}
                      onClick={() => {
                        if (!item.isReadOnly) {
                          openItemPopup(index, item.itemName);
                        }
                      }}
                      onFocus={() => {
                        setFocusedField(`itemName-${item.id}`);
                        setFocusedElement({
                          type: 'table',
                          rowIndex: index,
                          fieldIndex: 1,
                          fieldName: 'itemName'
                        });
                      }}
                      onBlur={() => setFocusedField('')}
                      //placeholder="Search item"
                    />
                    {/* SEARCH ICON IN ITEM NAME */}
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
                      onClick={() => {
                        openItemPopup(index, items[index].itemName);
                      }}
                      title="Click or press / to search"
                    >
                      <SearchIcon size={14} />
                    </div>
                  </td>
                  <td style={styles.td}>
                    <input
                      readOnly
                      style={
                        focusedField === `stock-${item.id}`
                          ? styles.editableInputFocused
                          : styles.editableInput
                      }
                      value={item.stock}
                      data-row={index}
                      data-field="stock"
                      onChange={(e) => handleItemChange(item.id, 'stock', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'stock')}
                      onFocus={() => {
                        setFocusedField(`stock-${item.id}`);
                        setFocusedElement({
                          type: 'table',
                          rowIndex: index,
                          fieldIndex: 2,
                          fieldName: 'stock'
                        });
                      }}
                      onBlur={() => setFocusedField('')}
                      inputMode="numeric"
                      
                    />
                  </td>

                  <td style={styles.td}>
                    <input
                      readOnly
                      style={focusedField === `mrp-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.mrp}
                      data-row={index}
                      data-field="mrp"
                      onChange={(e) => handleItemChange(item.id, 'mrp', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'mrp')}
                      onFocus={() => {
                        setFocusedField(`mrp-${item.id}`);
                        setFocusedElement({
                          type: 'table',
                          rowIndex: index,
                          fieldIndex: 3,
                          fieldName: 'mrp'
                        });
                      }}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      readOnly
                      style={focusedField === `uom-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.uom}
                      data-row={index}
                      data-field="uom"
                      onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'uom')}
                      onFocus={() => {
                        setFocusedField(`uom-${item.id}`);
                        setFocusedElement({
                          type: 'table',
                          rowIndex: index,
                          fieldIndex: 4,
                          fieldName: 'uom'
                        });
                      }}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      readOnly
                      style={focusedField === `hsn-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.hsn}
                      data-row={index}
                      data-field="hsn"
                      onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'hsn')}
                      onFocus={() => {
                        setFocusedField(`hsn-${item.id}`);
                        setFocusedElement({
                          type: 'table',
                          rowIndex: index,
                          fieldIndex: 5,
                          fieldName: 'hsn'
                        });
                      }}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `tax-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.tax}
                      data-row={index}
                      data-field="tax"
                      onChange={(e) => handleItemChange(item.id, 'tax', e.target.value)}
                      readOnly={item.isReadOnly || false}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'tax')}
                      onFocus={() => {
                        setFocusedField(`tax-${item.id}`);
                        setFocusedElement({
                          type: 'table',
                          rowIndex: index,
                          fieldIndex: 6,
                          fieldName: 'tax'
                        });
                      }}
                      onBlur={() => setFocusedField('')}
                      step="0.01"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `sRate-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.sRate}
                      data-row={index}
                      data-field="sRate"
                      onChange={(e) => handleItemChange(item.id, 'sRate', e.target.value)}
                      readOnly={item.isReadOnly || false}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'sRate')}
                      onFocus={() => {
                        setFocusedField(`sRate-${item.id}`);
                        setFocusedElement({
                          type: 'table',
                          rowIndex: index,
                          fieldIndex: 7,
                          fieldName: 'sRate'
                        });
                      }}
                      onBlur={() => setFocusedField('')}
                      step="0.01"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `qty-${item.id}` ? { ...styles.editableInputFocused, fontWeight: 'bold' } : { ...styles.editableInput, fontWeight: 'bold' }}
                      value={item.qty}
                      data-row={index}
                      data-field="qty"
                      onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                      onFocus={() => {
                        setFocusedField(`qty-${item.id}`);
                        setFocusedElement({
                          type: 'table',
                          rowIndex: index,
                          fieldIndex: 8,
                          fieldName: 'qty'
                        });
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
                      data-row={index}
                      data-field="amount"
                      onFocus={() => {
                        setFocusedField(`amount-${item.id}`);
                        setFocusedElement({
                          type: 'table',
                          rowIndex: index,
                          fieldIndex: 9,
                          fieldName: 'amount'
                        });
                      }}
                      onBlur={() => setFocusedField('')}
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
                        minHeight: screenSize.isMobile ? '28px' : screenSize.isTablet ? '32px' : '35px',
                      }}
                      onClick={() => handleDeleteRow(item.id)}
                      onFocus={() => {
                        setFocusedElement({
                          type: 'table',
                          rowIndex: index,
                          fieldIndex: 10,
                          fieldName: 'action'
                        });
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
              if (type === 'add') {
                // Reset to add mode when Add button is clicked
                setIsEditMode(false);
                handleClear(); // This will clear and reset to Add mode
              } else if (type === 'edit') {
                openEditPopup();
              } else if (type === 'delete') {
                openDeletePopup();
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
            saveDisabled={!isFormValid}
          />
        </div>
      </div>

      {/* SECOND POPUP: Bill Details with Checkboxes (Has Apply/Clear buttons) */}
      {billDetailsPopupOpen && (
        <div style={styles.customPopupOverlay} className="popup-overlay-slow">
          <div
            style={styles.customPopupContainer}
            className="popup-container-slow"
          >
            <div style={styles.customPopupHeader}>
              <h3 style={styles.customPopupTitle}>Bill Details - {selectedBillForDetails}</h3>
              <button
                style={styles.customPopupCloseButton}
                onClick={() => {
                  setBillDetailsPopupOpen(false);
                  setSelectedBillForDetails(null);
                  setCheckedBills({});
                  setBillDetailsSearchText("");
                  setBillPopupRowIndex(0);
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div style={styles.customPopupContent}>
              {renderBillDetailsContent()}
            </div>
            
            {/* FOOTER WITH APPLY/CLEAR BUTTONS (BLUE COLOR) */}
            <div style={styles.customPopupFooter}>
              <button
                style={{
                  ...styles.customPopupFooterButton,
                  ...styles.customPopupClearButton,
                }}
                onClick={handleClearBillNumber}
              >
                cancel
              </button>
        <button
  style={{
    ...styles.customPopupFooterButton,
    ...styles.customPopupApplyButton,
  }}
  disabled={
    Object.keys(checkedBills).filter(k => checkedBills[k]).length === 0
  }
  onClick={handleApplyBillDirect}
>
  Apply
</button>



            </div>
          </div>
        </div>
      )}

      {/* Common PopupListSelector for ALL popups including bill number */}
      {popupOpen && (
        <PopupListSelector
          open={popupOpen}
          onClose={() => {
            setPopupOpen(false);
            setPopupType("");
            setPopupData([]);
            setSelectedRowIndex(null);
            setSelectedAction("");
            // Clear search terms on close
            setCustomerSearchTerm('');
            setSalesmanSearchTerm('');
            setItemSearchTerm('');
            setBillSearchTerm('');
            setPopupSearchText('');
          }}
          onSelect={handlePopupSelect}
          fetchItems={fetchItemsForPopup}
          title={popupTitle}
          initialSearch={popupSearchText}
          displayFieldKeys={getPopupConfig().displayFieldKeys}
          searchFields={getPopupConfig().searchFields}
          headerNames={getPopupConfig().headerNames}
          columnWidths={getPopupConfig().columnWidths}
          searchPlaceholder={getPopupConfig().searchPlaceholder}
          maxHeight="70vh"
        />
      )}
    </div>
  );
};

export default SalesReturn;