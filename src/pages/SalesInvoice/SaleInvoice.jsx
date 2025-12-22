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

const SaleInvoice = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.SALES_INVOICE),
    edit: hasModifyPermission(PERMISSION_CODES.SALES_INVOICE),
    delete: hasDeletePermission(PERMISSION_CODES.SALES_INVOICE)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('add');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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
  
  // Delete confirmation popup
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteConfirmationData, setDeleteConfirmationData] = useState(null);
  
  // State for tracking if customer selection message was shown
  const [customerMessageShown, setCustomerMessageShown] = useState(false);
  
  // Add/Less amount state
  const [addLessAmount, setAddLessAmount] = useState('');
 

  // Track if we're editing an existing invoice
  const [isEditing, setIsEditing] = useState(false);
  const [originalInvoiceNo, setOriginalInvoiceNo] = useState('');

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

  // 2. Table Items State
  const [items, setItems] = useState([
    { 
      id: 1, 
      sNo: 1,
      barcode: '', 
      itemName: '', 
      itemCode: '',
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

  // 3. Totals State
  const [totalQty, setTotalQty] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

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
  const salesmanRef = useRef(null);
  const custNameRef = useRef(null);
  const barcodeRef = useRef(null);
  const addLessRef = useRef(null);

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

  // ---------- API FUNCTIONS ----------
  
  // Fetch next bill number from API
  const fetchNextBillNo = useCallback(async () => {
    if (isEditing && billDetails.billNo) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getNextBillNo("001");
      
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
      setBillDetails(prev => ({ ...prev, billNo: 'SI000001' }));
    } finally {
      setIsLoading(false);
    }
  }, [isEditing, billDetails.billNo]);

  // Fetch customers from backend API
  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getCustomers();
      
      const response = await axiosInstance.get(endpoint);
      
      if (response && Array.isArray(response.data)) {
        const formattedCustomers = response.data.map(customer => ({
          id: customer.code || customer.id,
          code: customer.code,
          name: customer.name,
          originalCode: customer.code,
          displayName: customer.name
        }));
        
        setCustomerList(formattedCustomers);
      } else {
        setCustomerList([]);
      }
    } catch (err) {
      setCustomerList([]);
    } finally {
      setIsLoading(false);
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

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getItemDropdown(1, 100, '');
      
      const response = await axiosInstance.get(endpoint);
      
      if (response && response.data) {
        let itemsArray = [];
        
        if (response.data.data && Array.isArray(response.data.data)) {
          itemsArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          itemsArray = response.data;
        }
        
        if (itemsArray.length > 0) {
          const formattedItems = itemsArray.map(item => {
            const itemCode = item.fItemcode || item.itemCode || item.code || item.ItemCode || item.Code || item.id || '';
            const itemName = item.fItemName || item.itemName || item.name || item.ItemName || item.Name || item.description || item.Description || '';
            const units = item.fUnits || item.units || item.Units || item.uom || item.UOM || item.unit || item.Unit || "pcs";
            
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
              barcode: item.barcode || item.Barcode || itemCode,
              stock: item.stockQty || item.stock || item.StockQty || item.Stock || item.quantity || item.Quantity || 0,
              mrp: item.mrp || item.MRP || item.sellingPrice || item.SellingPrice || item.price || item.Price || 0,
              uom: units,
             hsn: item.fhsn || item.hsn || item.hsnCode || "",
              tax: item.taxRate || item.tax || item.TaxRate || item.Tax || 0,
              sRate: item.sellingPrice || item.sRate || item.SellingPrice || item.SRate || item.price || item.Price || 0,
              displayName: itemName, // Changed: Show only item name, not code
              popupDisplay: itemName // Changed: Show only item name, not code
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
      setItemList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch saved invoices for Edit/Delete popups
  const fetchSavedInvoices = useCallback(async (page = 1, search = '') => {
    try {
      setLoadingInvoices(true);
      
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getBillList("001", page, 20);
      
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
          const formattedItems = itemsArray.map((item, index) => {
            const itemCode = item.itemcode || item.fItemcode || item.itemCode || item.code || '';
            const itemName = item.itemName || item.fitemNme || item.fItemName || '';
            const units = item.fUnit || item.uom || '';
            
            return {
              id: index + 1,
              sNo: index + 1,
              barcode: '',
              itemCode: itemCode,
              itemName: itemName || '',
              stock: (item.stock || item.fstock || 0).toString(),
              mrp: (item.mrp || 0).toString(),
              uom: units,
              hsn: item.hsn || item.fHSN || '',
              tax: (item.tax || item.fTax || 0).toString(),
              sRate: (item.rate || item.fRate || item.sRate || 0).toString(),
              qty: (item.qty || item.fTotQty || 0).toString(),
              amount: (item.amount || item.fAmount || 0).toFixed(2)
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
      
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.deleteBillNumber(voucherNo, "001");
      
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


  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!billDetails.billNo && !isEditing) {
        await fetchNextBillNo();
      }
      
      await fetchCustomers();
      await fetchItems();
      await fetchSalesmen();
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
  }, [items]);

  // Calculate amount
  const calculateAmount = (qty, sRate) => {
    const qtyNum = parseFloat(qty || 0);
    const sRateNum = parseFloat(sRate || 0);
    return (qtyNum * sRateNum).toFixed(2);
  };

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
    
    fetchNextBillNo();
  };

  // --- POPUP HANDLERS ---
  
  // Open edit invoice popup
  const openEditInvoicePopup = async () => {
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

    toast.success(
      `Invoice ${deleteConfirmationData.invoiceNo} deleted successfully`,
      { autoClose: 2500 }
    );

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
      API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getBillList("001", pageNum, 20);

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

  // Handle customer selection
const handleCustomerSelect = (customer) => {
  ignoreNextEnterRef.current = true;

  if (customer) {
    setBillDetails(prev => ({
      ...prev,
      custName: customer.name,
      custCode: customer.originalCode || customer.code,
      partyCode: customer.originalCode || customer.code
    }));
  }

  setCustomerPopupOpen(false);

  setTimeout(() => {
    ignoreNextEnterRef.current = false;
  }, 200);
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


  // Handle item selection - MODIFIED: Don't fetch barcode to item name field, only update item name
 const handleItemSelect = async (item) => {
  ignoreNextEnterRef.current = true;

  if (!item || currentItemRowIndex === null) return;

  try {
    const updatedItems = [...items];
    const currentItem = updatedItems[currentItemRowIndex];

    const itemCode =
      item.fItemcode ||
      item.itemCode ||
      item.code ||
      item.originalCode ||
      '';

    const itemName =
      item.fItemName ||
      item.itemName ||
      item.name ||
      '';

    const units =
      item.fUnits ||
      item.uom ||
      'pcs';

    // 🔥 Fetch stock details (backup source for HSN)
    const stockInfo = await getStockByItemName(itemCode);

    // ✅ BULLETPROOF HSN RESOLUTION
    const resolvedHsn =
      item.hsn ||
      item.hsnCode ||
      item.HsnCode ||
      item.HSN ||
      stockInfo.hsn ||
      stockInfo.hsnCode ||
      stockInfo.HSN ||
      '';

    updatedItems[currentItemRowIndex] = {
      ...currentItem,
      itemName,
      itemCode,
      barcode: '',
      stock: (item.stock || stockInfo.stock || 0).toString(),
      mrp: (item.mrp || stockInfo.mrp || 0).toString(),
      uom: units || stockInfo.uom || stockInfo.fUnits || '',
      hsn: resolvedHsn, // ✅ FIXED HERE
      tax: (item.tax || stockInfo.tax || 0).toString(),
      sRate: (item.sRate || stockInfo.rate || 0).toString(),
      qty: currentItem.qty || '1',
      amount: calculateAmount(
        currentItem.qty || '1',
        item.sRate || stockInfo.rate || 0
      )
    };

    setItems(updatedItems);
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

  // Fetch items for popup
  const fetchItemsForPopup = async (pageNum, search, type) => {
    try {
      let itemsData = [];
      
      switch(type) {
        case 'customer':
          itemsData = customerList.map(customer => ({
            id: customer.code || customer.id,
            code: customer.code,
            name: customer.name,
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
            popupDisplay: item.fItemName || item.itemName // Changed: Show only item name
          }));
          break;
          
        case 'editInvoice':
        case 'deleteInvoice':
          return await fetchInvoiceItemsForPopup(pageNum, search);
          
        default:
          itemsData = [];
      }
      
      if (type === 'customer' || type === 'salesman' || type === 'item') {
        const uniqueItems = [];
        const seenIds = new Set();
        
        itemsData.forEach(item => {
          const itemId = item.id || item.code;
          if (!seenIds.has(itemId)) {
            seenIds.add(itemId);
            uniqueItems.push(item);
          }
        });
        
        itemsData = uniqueItems;
      }
      
      let filtered = itemsData;
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = itemsData.filter(item => {
          return (
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            (item.displayName && item.displayName.toLowerCase().includes(searchLower)) ||
            (item.fItemcode && item.fItemcode.toLowerCase().includes(searchLower)) ||
            (item.itemCode && item.itemCode.toLowerCase().includes(searchLower)) ||
            (item.popupDisplay && item.popupDisplay.toLowerCase().includes(searchLower))
          );
        });
      }
      
      const startIndex = (pageNum - 1) * 20;
      const endIndex = startIndex + 20;
      return filtered.slice(startIndex, endIndex);
      
    } catch (err) {
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

  // Handle add/less key down - MODIFIED: Don't trigger save on Enter
  const handleAddLessKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Just move focus to Save button, don't trigger save
      const saveButton = document.querySelector('button[data-action="save"]');
      if (saveButton) saveButton.focus();
    }
  };

  // Handle keydown with / key support for popup toggle - MODIFIED: Don't trigger save on Enter
  const handleKeyDown = (e, nextRef, fieldName = '') => {
    if (e.key === '/' || e.key === '?') {
      e.preventDefault();
      
      if (fieldName === 'salesman') {
        if (salesmanPopupOpen) {
          setSalesmanPopupOpen(false);
        } else {
          openSalesmanPopup();
        }
      } else if (fieldName === 'custName') {
        if (customerPopupOpen) {
          setCustomerPopupOpen(false);
        } else {
          openCustomerPopup();
        }
      }
    
      } else if (e.key === 'Enter') {
  // ✅ Do NOT block native select behavior
  if (e.target.tagName !== 'SELECT') {
    e.preventDefault();
  }

  // Move focus after a tiny delay (important for SELECT)
  if (nextRef?.current) {
    setTimeout(() => {
      nextRef.current.focus();
    }, 0);
  }


    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const allInputs = document.querySelectorAll('input:not([readonly]), select');
      const currentIndex = Array.from(allInputs).indexOf(e.target);
      
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        allInputs[currentIndex - 1].focus();
      } else if (e.key === 'ArrowRight' && currentIndex < allInputs.length - 1) {
        allInputs[currentIndex + 1].focus();
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

  // Handle UOM spacebar cycling
const handleUomSpacebar   = (e, id, index) => {
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

  // Handle table keydown with improved navigation - MODIFIED: Don't trigger save on Enter
  const handleTableKeyDown = (e, currentRowIndex, currentField) => {
    if ((e.key === '/' || e.key === '?') && currentField === 'itemName') {
      e.preventDefault();
      if (itemPopupOpen) {
        setItemPopupOpen(false);
      } else {
        openItemPopup(currentRowIndex);
      }
      return;
    }
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const fields = ['barcode', 'itemName', 'stock', 'mrp', 'uom', 'hsn', 'tax', 'sRate', 'qty'];
      const currentFieldIndex = fields.indexOf(currentField);
      
      if (e.key === 'ArrowLeft' && currentFieldIndex > 0) {
        const prevField = fields[currentFieldIndex - 1];
        const prevInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="${prevField}"]`);
        if (prevInput) {
          prevInput.focus();
          return;
        }
      } else if (e.key === 'ArrowRight' && currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        if (nextField === 'uom') {
          const uomDiv = document.querySelector(`div[data-row="${currentRowIndex}"][data-field="uom"]`);
          if (uomDiv) {
            uomDiv.focus();
            return;
          }
        } else {
          const nextInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="${nextField}"]`);
          if (nextInput) {
            nextInput.focus();
            return;
          }
        }
      }
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();

      const fields = ['barcode', 'itemName', 'stock', 'mrp', 'uom', 'hsn', 'tax', 'sRate', 'qty'];
      const currentFieldIndex = fields.indexOf(currentField);

      if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        
        if (nextField === 'uom') {
          const uomDiv = document.querySelector(`div[data-row="${currentRowIndex}"][data-field="uom"]`);
          if (uomDiv) {
            uomDiv.focus();
            return;
          }
        } else {
          const nextInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="${nextField}"]`);
          if (nextInput) {
            nextInput.focus();
            return;
          }
        }
      }

     if (currentField === 'qty') {
  const currentItem = items[currentRowIndex];

  // 🚫 BLOCK if item name not selected
  if (!currentItem.itemName || currentItem.itemName.trim() === '') {
    toast.warning("Select item before moving to next row");
    return;
  }

  if (currentRowIndex < items.length - 1) {
    const nextInput = document.querySelector(
      `input[data-row="${currentRowIndex + 1}"][data-field="barcode"]`
    );
    if (nextInput) nextInput.focus();
  } else {
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
  

  const handleAddItem = async () => {
    if (!billDetails.barcodeInput) {
      alert("Please enter barcode");
      return;
    }

    try {
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
            qty: '1',
            amount: calculateAmount('1', stockInfo.rate || '0')
          };
          
          setItems([...items, newItem]);
          setBillDetails(prev => ({ ...prev, barcodeInput: '' }));
          if (barcodeRef.current) barcodeRef.current.focus();
        } else {
          alert("Item not found. Please check the barcode.");
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
      const newAmount = calculateAmount(newQty, existingItem.sRate || existingItem.rate);

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
        qty: '1',
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
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

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

const handleDeleteRow = (id) => {
  const itemToDelete = items.find(item => item.id === id);
  const itemName = itemToDelete?.itemName || 'this item';
  const barcode = itemToDelete?.barcode ? `(Barcode: ${itemToDelete.barcode})` : '';
  
  // Set the item to delete and show confirmation popup
  setRowToDelete({ id, itemName, barcode });
  setRowDeleteConfirmationOpen(true);
};

// Handle confirmed row deletion
const handleConfirmedRowDelete = () => {
  if (!rowToDelete) return;
  
  const { id } = rowToDelete;
  
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
    setItems([clearedItem]);
  }
  
  // Close popup and reset
  setRowDeleteConfirmationOpen(false);
  setRowToDelete(null);
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
      setIsSaving(true);
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!billDetails.custName || billDetails.custName.trim() === '') {
        if (!customerMessageShown) {
          setCustomerMessageShown(true);
          throw new Error('Please select a customer');
        }
        return;
      }

      const validItems = items.filter(item => 
        item.itemName && item.itemName.trim() && parseFloat(item.qty || 0) > 0
      );
      
      if (validItems.length === 0) {
        throw new Error('Please add at least one item with quantity');
      }

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
  compCode: "001",
  billAmount: Number(totalAmount) || 0,
  balanceAmount: 0,
  userCode: "001",
  addLess: (addLessAmount ?? "0").toString()
};

      // Prepare items data
      const itemsData = validItems.map(item => ({
        barcode: item.barcode || "",
        itemName: item.itemName || "",
        itemcode: item.itemCode || "",
        mrp: (Number(item.mrp) || 0).toFixed(2),
        stock: (item.stock ?? "0").toString(),
        uom: item.uom || "pcs",
        hsn: item.hsn || "",
        tax: Number(item.tax) || 0,
        rate: Number(item.sRate) || 0,
        qty: Number(item.qty) || 0,
        amount: Number(item.amount) || 0
      }));
      
      const requestData = {
        header: headerData,
        items: itemsData
      };
      

      
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
        
       toast.success(
  `Invoice ${isEditing ? "updated" : "saved"} successfully\nInvoice No: ${savedBillNo}`,
  { autoClose: 3000 }
);

        
        // Refresh saved invoices list
        await fetchSavedInvoices(1, '');
        
        // Reset form completely after save
        resetForm();
        
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
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
      setIsSaving(false);
      setCustomerMessageShown(false);
    }
  };

  // Handle save with confirmation
  const handleSave = () => {
    showSaveConfirmation();
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

    
    if (items.length === 0 || items.every(item => !item.itemName || parseFloat(item.qty || 0) <= 0)) {
      alert('Please add at least one item with quantity');
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

 const handlePrint = () => {
  setPrintConfirmationOpen(true);
};

const handleConfirmedPrint = () => {
  setPrintConfirmationOpen(false);

  // 🔹 Replace with your actual print logic
  window.print();
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
    // 🚫 block Enter that comes from popup selection
    if (ignoreNextEnterRef.current && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // 🚫 block Enter everywhere else (no auto save)
    if (
      e.key === 'Enter' &&
      !customerPopupOpen &&
      !salesmanPopupOpen &&
      !itemPopupOpen &&
      !editInvoicePopupOpen &&
      !deleteInvoicePopupOpen &&
      !saveConfirmationOpen &&
      !editConfirmationOpen &&
      !deleteConfirmationOpen
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }}
>

      {error && <div style={styles.errorContainer}>Error: {error}</div>}
      
      {(isLoading || loadingInvoices) && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <div>Loading...</div>
          </div>
        </div>
      )}

      {/* --- HEADER SECTION --- */}
      <div style={styles.headerSection}>
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
        }}>
        {/* Bill No */}
<div style={styles.formField}>
  <label style={styles.inlineLabel}>Bill No:</label>
  <input
    type="text"
    value={billDetails.billNo}
    name="billNo"
    readOnly                 // ✅ always readonly
    tabIndex={-1}            // ✅ skip keyboard focus (optional)
    ref={billNoRef}
    style={{
      ...styles.inlineInput,
     
      cursor: "not-allowed",
      fontWeight: "600"
    }}
    // placeholder="Auto-generated"
    title="Auto-generated invoice number"
  />
</div>


          {/* Bill Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill Date:</label>
            <input
              type="date"
              style={focusedField === 'billDate' ? { ...styles.inlineInputFocused, padding: screenSize.isMobile ? '6px 8px' : '8px 10px' } : { ...styles.inlineInput, padding: screenSize.isMobile ? '6px 8px' : '8px 10px' }}
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
              style={focusedField === 'mobileNo' ? styles.inlineInputFocused : styles.inlineInput}
              value={billDetails.mobileNo}
              name="mobileNo"
              onChange={handleInputChange}
              ref={mobileRef}
              onKeyDown={(e) => handleKeyDown(e, typeRef)}
              onFocus={() => setFocusedField('mobileNo')}
              onBlur={() => setFocusedField('')}
              // placeholder="Mobile No"
            />
          </div>

{/* Type */}
<div style={{ ...styles.formField, gap: '4px' }}>   {/* ✅ smaller gap */}
  <label
    style={{
      ...styles.inlineLabel,
      minWidth: '50px'   // ✅ ONLY Type label width reduced
    }}
  >
    Type:
  </label>

  <select
    name="type"
    style={focusedField === 'type' ? styles.inlineInputFocused : styles.inlineInput}
    value={billDetails.type}
    onChange={handleInputChange}
    ref={typeRef}
    onKeyDown={(e) => handleKeyDown(e, salesmanRef)}
    onFocus={() => setFocusedField('type')}
    onBlur={() => setFocusedField('')}
  >
    <option value="Retail">Retail</option>
    <option value="Wholesale">Wholesale</option>
  </select>
</div>

        </div>

        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
        }}>
          {/* Salesman */}
     <div style={styles.formField}>
  <label style={styles.inlineLabel}>Salesman:</label>

  <div style={{ position: 'relative', width: '100%', flex: 1 }}>
    <input
      type="text"
      style={{
        ...(focusedField === 'salesman'
          ? styles.inlineInputClickableFocused
          : styles.inlineInputClickable),
        paddingRight: '34px', // space for icon
      }}
      value={billDetails.salesman}
      name="salesman"
      onChange={handleInputChange}
      ref={salesmanRef}
      onClick={openSalesmanPopup}
      onKeyDown={(e) => {
        handleKeyDown(e, custNameRef, 'salesman');
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
</div>

          {/* Customer Name */}
<div style={styles.formField}>
  <label style={styles.inlineLabel}>Customer:</label>

  <div style={{ position: 'relative', width: '100%', flex: 1 }}>
    <input
      type="text"
      style={{
        ...(focusedField === 'custName'
          ? styles.inlineInputClickableFocused
          : styles.inlineInputClickable),
        paddingRight: '34px', // space for icon
      }}
      value={billDetails.custName}
      name="custName"
      onChange={handleInputChange}
      ref={custNameRef}
      onClick={openCustomerPopup}
      onKeyDown={(e) => {
        handleKeyDown(e, barcodeRef, 'custName');
        handleBackspace(e, 'custName');
      }}
      onFocus={() => setFocusedField('custName')}
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
</div>


          {/* Barcode */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Barcode:</label>
            <input
              type="text"
              style={focusedField === 'barcodeInput' ? styles.inlineInputFocused : styles.inlineInput}
              value={billDetails.barcodeInput}
              name="barcodeInput"
              onChange={handleInputChange}
              ref={barcodeRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                } else {
                  handleKeyDown(e, addLessRef);
                }
              }}
              onFocus={() => setFocusedField('barcodeInput')}
              onBlur={() => setFocusedField('')}
              // placeholder="Scan or Enter Barcode"
            />
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div style={styles.tableSection} className="sale-invoice-scrollable">
        <div style={styles.tableContainer} className="sale-invoice-scrollable">
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
                <th style={styles.th}>Tax (%)</th>
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
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'barcode')}
                      onFocus={() => setFocusedField(`barcode-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.itemNameContainer }}>
  <div style={{ position: 'relative', width: '100%' }}>
    <input
      style={{
        ...(focusedField === `itemName-${item.id}`
          ? styles.editableInputClickableFocused
          : styles.editableInputClickable),
        paddingRight: '26px',
        textAlign: 'left',
      }}
      value={item.itemName}
      
      data-row={index}
      data-field="itemName"
      onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
      onKeyDown={(e) => handleTableKeyDown(e, index, 'itemName')}
      onClick={() => openItemPopup(index)}
      onFocus={() => setFocusedField(`itemName-${item.id}`)}
      onBlur={() => setFocusedField('')}
      title={`Item Code: ${item.itemCode || 'Not selected'}`}
    />

    {/* 🔍 Search Icon */}
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

                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.stock}
                      data-row={index}
                      data-field="stock"
                      onChange={(e) => handleItemChange(item.id, 'stock', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'stock')}
                      readOnly
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={focusedField === `mrp-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.mrp}
                      data-row={index}
                      data-field="mrp"
                      onChange={(e) => handleItemChange(item.id, 'mrp', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'mrp')}
                      onFocus={() => setFocusedField(`mrp-${item.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
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
                        title="Press Space or Click to toggle units"
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
                      style={focusedField === `tax-${item.id}` ? styles.editableInputFocused : styles.editableInput}
                      value={item.tax}
                      data-row={index}
                      data-field="tax"
                      onChange={(e) => handleItemChange(item.id, 'tax', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'tax')}
                      onFocus={() => setFocusedField(`tax-${item.id}`)}
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
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'sRate')}
                      onFocus={() => setFocusedField(`sRate-${item.id}`)}
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
                      onFocus={() => setFocusedField(`qty-${item.id}`)}
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
          </table>
        </div>
      </div>

      {/* --- FOOTER SECTION --- */}
      <div style={styles.footerSection}>
        <div style={styles.rightColumn}>
          <ActionButtons
  activeButton={activeTopAction}
  onButtonClick={(type) => {
    setActiveTopAction(type); // ✅ only on click

    if (type === 'add') ;
    if (type === 'edit') openEditInvoicePopup();
    if (type === 'delete') openDeleteInvoicePopup();
  }}
>

            <AddButton buttonType="add" disabled={!formPermissions.add} />
            <EditButton buttonType="edit" disabled={!formPermissions.edit} />
            <DeleteButton buttonType="delete" disabled={!formPermissions.delete} />
          </ActionButtons>
        </div>
        
        {/* Add/Less Input */}
        <div style={styles.addLessContainer}>
          <span style={styles.addLessLabel}>Add/Less:</span>
          <input
            type="number"
            style={focusedField === 'addLess' ? styles.addLessInputFocused : styles.addLessInput}
            value={addLessAmount}
            onChange={handleAddLessChange}
            onKeyDown={handleAddLessKeyDown}
            ref={addLessRef}
            // placeholder="Enter amount"
            step="0.01"
            onFocus={() => setFocusedField('addLess')}
            onBlur={() => setFocusedField('')}
          />
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

      {/* Save Confirmation Popup */}
      <ConfirmationPopup
        isOpen={saveConfirmationOpen}
        onClose={() => setSaveConfirmationOpen(false)}
        onConfirm={handleConfirmedSave}
        title={saveConfirmationData?.isEditing ? "Confirm UPDATE Invoice" : "Confirm SAVE Invoice"}
       
        confirmText={saveConfirmationData?.isEditing ? "CONFIRM UPDATE" : "CONFIRM SAVE"}
        cancelText="Cancel"
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
  message="Are you sure you want to clear all unsaved data?"
  confirmText="CLEAR"
  cancelText="Cancel"
  type="warning"
  showIcon={true}
  borderColor="#ffc107"
/>
{/* Print Confirmation Popup */}
<ConfirmationPopup
  isOpen={printConfirmationOpen}
  onClose={() => setPrintConfirmationOpen(false)}
  onConfirm={handleConfirmedPrint}
  title="Print Sales Invoice"
 
  confirmText="PRINT"
  cancelText="Cancel"
  type="default"
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
          deleteConfirmationData ? 
          `Invoice No: ${deleteConfirmationData.invoiceNo}\n` +
          `Customer: ${deleteConfirmationData.customer}\n` +
          `Date: ${deleteConfirmationData.billDate}\n` +
          `Total Amount: ₹${parseFloat(deleteConfirmationData.totalAmount || 0).toFixed(2)}\n\n` +
          `WARNING: This action cannot be undone!`
          : "Are you sure you want to delete this invoice?"
        }
        confirmText="CONFIRM DELETE"
        cancelText="Cancel"
        type="danger"
        showIcon={true}
        showLoading={isLoading}
        borderColor="#dc3545"
        confirmButtonStyle={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
      />

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
    ? `Are you sure you want to delete "${rowToDelete.itemName}" ${rowToDelete.barcode}?\n\nThis action cannot be undone!`
    : "Are you sure you want to delete this item?"
  }
  confirmText="DELETE"
  cancelText="Cancel"
  type="danger"
  showIcon={true}
  showLoading={false}
  borderColor="#dc3545"
  confirmButtonStyle={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
/>
      
    </div>
  );
};

export default SaleInvoice;