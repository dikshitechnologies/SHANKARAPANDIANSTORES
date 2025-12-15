import React, { useState, useEffect, useRef } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import PopupListSelector from "../../components/Listpopup/PopupListSelector";
import { API_ENDPOINTS } from "../../api/endpoints";
import apiService from "../../api/apiService";
import 'bootstrap/dist/css/bootstrap.min.css';

const SalesReturn = () => {
  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('all');

  // 1. Header Details State
  const [billDetails, setBillDetails] = useState({
    billNo: 'SR0000001',
    billDate: new Date().toISOString().substring(0, 10),
    mobileNo: '',
    empName: '',
    empCode: '14789',
    salesman: '',
    salesmanCode: '002',
    custName: '',
    customerCode: '',
    returnReason: '',
    barcodeInput: '',
    partyCode: '',
    gstno: '',
    city: '',
    type: 'Retail',
    transType: 'SALES RETURN',
    billAMT: '0',
    newBillNo: '' // NEW FIELD: For the new Bill No input near barcode
  });

  // 2. Table Items State
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
      rate: '',
      qty: '',
      amount: '0.00',
      itemCode: '00001'
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
  const [selectedBillNumber, setSelectedBillNumber] = useState(null); // New state for selected bill number
  
  // NEW STATE: For custom bill number popup
  const [billNoPopupOpen, setBillNoPopupOpen] = useState(false);
  const [billNoPopupData, setBillNoPopupData] = useState([]);
  const [selectedBillNo, setSelectedBillNo] = useState(null);
  const [billNoSearchText, setBillNoSearchText] = useState("");

  // 5. API Data State
  const [customers, setCustomers] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [voucherList, setVoucherList] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- REFS ---
  const billNoRef = useRef(null);
  const billDateRef = useRef(null);
  const mobileRef = useRef(null);
  const empNameRef = useRef(null);
  const salesmanRef = useRef(null);
  const custNameRef = useRef(null);
  const returnReasonRef = useRef(null);
  const barcodeRef = useRef(null);
  const newBillNoRef = useRef(null); // NEW REF: For the new Bill No input

  const [focusedField, setFocusedField] = useState('');
  const [activeFooterAction, setActiveFooterAction] = useState('all');

  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  // UOM cycling values - only K and P
  const uomValues = ['K', 'P'];

  // ---------- API FUNCTIONS ----------
  const fetchMaxVoucherNo = async () => {
    try {
      setLoading(true);
      setError("");
      const companyCode = '001';
      const response = await apiService.get(API_ENDPOINTS.sales_return.getMaxVoucherNo(companyCode));
      console.log("Max Voucher No Response:", response);
      
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
      console.log("Fetching customers...");
      
      const endpoint = API_ENDPOINTS.sales_return?.getCustomers || "Salesinvoices/GetPartyByParent";
      const response = await apiService.get(endpoint);
      console.log("Customers Response:", response);
      
      if (response && Array.isArray(response)) {
        setCustomers(response);
        console.log(`Loaded ${response.length} customers from API`);
      } else if (response && response.data && Array.isArray(response.data)) {
        setCustomers(response.data);
        console.log(`Loaded ${response.data.length} customers from API`);
      } else {
        console.warn("Customers response is not an array:", response);
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
      console.log("Fetching salesmen...");
      
      const response = await apiService.get("SalesmanCreation/GetSalesman");
      console.log("Salesmen Response:", response);
      
      if (response && Array.isArray(response)) {
        setSalesmen(response);
        console.log(`Loaded ${response.length} salesmen from API`);
      } else {
        console.warn("Salesmen response is not an array:", response);
        setSalesmen([]);
      }
    } catch (err) {
      console.error("API Error fetching salesmen:", err);
      setSalesmen([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching items dropdown...");
      
      console.log("Fetching from: ItemCreation/GetItemCreationdropdowslist");
      const response = await apiService.get("ItemCreation/GetItemCreationdropdowslist");
      console.log("Items Dropdown Response:", response);
      
      let itemsArray = [];
      
      if (response && Array.isArray(response)) {
        console.log("Response is an array, length:", response.length);
        itemsArray = response;
      } else if (response && typeof response === 'object') {
        console.log("Response is an object");
        console.log("Object keys:", Object.keys(response));
        
        if (response.items && Array.isArray(response.items)) {
          itemsArray = response.items;
        } else if (response.data && Array.isArray(response.data)) {
          itemsArray = response.data;
        } else if (response.list && Array.isArray(response.list)) {
          itemsArray = response.list;
        } else {
          itemsArray = Object.values(response);
        }
      }
      
      if (Array.isArray(itemsArray) && itemsArray.length > 0) {
        const formattedItems = itemsArray.map((item, index) => {
          const itemCode = item.fItemcode || item.itemCode || item.code || item.ItemCode || item.Code || item.id || '';
          const itemName = item.fItemName || item.itemName || item.name || item.ItemName || item.Name || item.description || item.Description || '';
          
          return {
            id: itemCode || `item-${index}`,
            itemCode: itemCode,
            itemName: itemName,
            code: itemCode,
            name: itemName,
            fItemcode: itemCode,
            fItemName: itemName
          };
        });
        
        setItemList(formattedItems);
        console.log(`Loaded ${formattedItems.length} items from API (only name and code)`);
      } else {
        console.warn("Could not extract items from response:", response);
        setItemList([]);
      }
    } catch (err) {
      console.error("Error fetching items dropdown:", err);
      console.error("Error details:", err.message);
      setItemList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherList = async (companyCode = '001') => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching voucher list...");
      
      const endpoint = API_ENDPOINTS.sales_return?.getVoucherList ? 
        API_ENDPOINTS.sales_return.getVoucherList(companyCode) : 
        `SalesReturn/VoucherList/${companyCode}`;
      
      console.log("Fetching from endpoint:", endpoint);
      const response = await apiService.get(endpoint);
      console.log("Voucher List Response:", response);
      
      let voucherData = [];
      
      if (response && response.success && response.data && Array.isArray(response.data)) {
        voucherData = response.data;
      } else if (response && Array.isArray(response)) {
        voucherData = response;
      } else if (response && response.vouchers && Array.isArray(response.vouchers)) {
        voucherData = response.vouchers;
      }
      
      console.log("Extracted voucher data:", voucherData);
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
    try {
      setLoading(true);
      setError("");
      
      const foundItem = itemList.find(item => 
        item.itemCode === barcode || 
        item.code === barcode ||
        item.fItemcode === barcode
      );
      
      if (foundItem) {
        console.log("Item found in local list by barcode:", foundItem);
        return foundItem;
      }
      
      console.log("Item not found locally by barcode, trying API...");
      const response = await apiService.get(`ItemCreation/GetItemByBarcode/${barcode}`);
      if (response) {
        console.log("Item found via API by barcode:", response);
        return response;
      }
      
      return null;
    } catch (err) {
      console.error("Error fetching item by barcode:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ==================== CREATE SALES RETURN ====================
  const createSalesReturn = async () => {
    try {
      setLoading(true);
      setError("");
      
      const requestData = {
        header: {
          voucherNo: billDetails.billNo,
          voucherDate: billDetails.billDate,
          mobileNo: billDetails.mobileNo || "",
          empName: billDetails.empName || "",
          empcode: billDetails.empCode || "14789",
          customerCode: billDetails.customerCode || "02154",
          customerName: billDetails.custName || "",
          salesMansName: billDetails.salesman || "",
          salesMansCode: billDetails.salesmanCode || "002",
          compCode: "001",
          userCode: "001",
          billAMT: totalAmount.toString()
        },
        items: items.filter(item => item.itemName && item.qty).map((item, index) => ({
          barcode: item.barcode || "",
          itemName: item.itemName || "",
          itemCode: item.itemCode || `0000${index + 1}`,
          stock: item.stock || "0",
          mrp: item.mrp || "0",
          uom: item.uom || "PCS",
          hsn: item.hsn || "",
          tax: item.tax || "0",
          srate: item.sRate || "0",
          wrate: item.rate || "0",
          qty: item.qty || "0",
          amount: item.amount || "0"
        }))
      };

      console.log("Creating Sales Return with data:", JSON.stringify(requestData, null, 2));

      const endpoint = API_ENDPOINTS.sales_return?.createSalesReturn || 
        "SalesReturn/SalesReturnCreate?SelectType=true";
      
      const response = await apiService.post(endpoint, requestData);
      
      console.log("Create Sales Return Response:", response);
      
      if (response && response.success) {
        alert(`Sales Return Created Successfully!\nVoucher No: ${response.voucherNo}`);
        
        if (response.voucherNo) {
          setBillDetails(prev => ({ ...prev, billNo: response.voucherNo }));
        }
        
        await fetchVoucherList();
        
        return response;
      } else {
        throw new Error(response?.message || "Failed to create sales return");
      }
      
    } catch (err) {
      const errorMsg = err.message || "Failed to create sales return";
      setError(errorMsg);
      console.error("API Error:", err);
      alert(`Error: ${errorMsg}`);
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
      
      const requestData = {
        header: {
          voucherNo: billDetails.billNo,
          voucherDate: billDetails.billDate,
          mobileNo: billDetails.mobileNo || "",
          empName: billDetails.empName || "",
          empcode: billDetails.empCode || "14789",
          customerCode: billDetails.customerCode || "02154",
          customerName: billDetails.custName || "",
          salesMansName: billDetails.salesman || "",
          salesMansCode: billDetails.salesmanCode || "002",
          compCode: "001",
          userCode: "001",
          billAMT: totalAmount.toString()
        },
        items: items.filter(item => item.itemName && item.qty).map((item, index) => ({
          barcode: item.barcode || "",
          itemName: item.itemName || "",
          itemCode: item.itemCode || `0000${index + 1}`,
          stock: item.stock || "0",
          mrp: item.mrp || "0",
          uom: item.uom || "PCS",
          hsn: item.hsn || "",
          tax: item.tax || "0",
          srate: item.sRate || "0",
          wrate: item.rate || "0",
          qty: item.qty || "0",
          amount: item.amount || "0"
        }))
      };

      console.log("Updating Sales Return with data:", JSON.stringify(requestData, null, 2));

      const endpoint = API_ENDPOINTS.sales_return?.updateSalesReturn || 
        "SalesReturn/SalesReturnCreate?SelectType=true";
      
      const response = await apiService.post(endpoint, requestData);
      
      console.log("Update Sales Return Response:", response);
      
      if (response && response.success) {
        alert(`Sales Return Updated Successfully!\nVoucher No: ${response.voucherNo}`);
        await fetchVoucherList();
        return response;
      } else {
        throw new Error(response?.message || "Failed to update sales return");
      }
      
    } catch (err) {
      const errorMsg = err.message || "Failed to update sales return";
      setError(errorMsg);
      console.error("API Error:", err);
      alert(`Error: ${errorMsg}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== DELETE SALES RETURN (FIXED) ====================
  const deleteSalesReturn = async (voucherNo) => {
    try {
      setLoading(true);
      setError("");
      
      if (!voucherNo) {
        throw new Error("Voucher number is required");
      }
      
      console.log("Deleting sales return:", voucherNo);
      
      const companyCode = '001';
      const endpoint = `SalesReturn/DeleteSalesReturn/${voucherNo}?compCode=${companyCode}`;
      
      console.log("Delete endpoint:", endpoint);
      
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
        
        console.log("Using fetch for DELETE:", fullUrl);
        
        const fetchResponse = await fetch(fullUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        response = await fetchResponse.json();
      }
      
      console.log("Delete Sales Return Response:", response);
      
      if (response && response.success) {
        alert(`Sales Return ${voucherNo} deleted successfully!`);
        await fetchVoucherList();
        handleClear();
        
        return response;
      } else {
        throw new Error(response?.message || "Failed to delete sales return");
      }
      
    } catch (err) {
      const errorMsg = err.message || "Failed to delete sales return";
      setError(errorMsg);
      console.error("API Error:", err);
      alert(`Error: ${errorMsg}`);
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
      
      console.log("Fetching sales return details for:", voucherNo);
      
      let endpoint = `SalesReturn/GetSalesReturn/${voucherNo}/${companyCode}`;
      console.log("Trying endpoint:", endpoint);
      
      const response = await apiService.get(endpoint);
      console.log("Sales Return Details Response:", response);
      
      if (response) {
        console.log("Full response structure:", response);
        
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
      alert(`Error fetching details: ${err.message}`);
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
      
      alert(`Loading voucher ${voucherNo} for editing...`);
      
      const voucherDetails = await fetchSalesReturnDetails(voucherNo);
      
      if (!voucherDetails) {
        alert(`Could not load details for voucher ${voucherNo}.`);
        return;
      }
      
      console.log("Voucher details to load:", voucherDetails);
      
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
        mobileNo: header.mobileNo || "",
        empName: header.empName || "",
        empCode: header.empcode || "14789",
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
            uom: item.uom || "PCS",
            hsn: item.hsn || "",
            tax: item.tax || "0",
            sRate: item.srate || item.sRate || "0",
            rate: item.wrate || item.rate || item.srate || "0",
            qty: item.qty || "0",
            amount: item.amount || "0",
            itemCode: item.itemCode || `0000${index + 1}`
          };
        });
        
        console.log("Updated items for table:", updatedItems);
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
          rate: '',
          qty: '',
          amount: '0.00',
          itemCode: '00001'
        }]);
      }
      
      alert(`Voucher ${voucherNo} loaded successfully! You can now edit it.`);
      
    } catch (err) {
      console.error("Error loading voucher for editing:", err);
      alert(`Error loading voucher: ${err.message}`);
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

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      console.log("Fetching initial data...");
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
  const openCustomerPopup = () => {
    if (customers.length === 0) {
      alert("No customers available. Please try again later or enter manually.");
      return;
    }
    
    const customerData = customers.map(customer => ({
      id: customer.code || customer.id,
      code: customer.code,
      name: customer.name,
      displayName: `${customer.code} - ${customer.name}`,
      customerCode: customer.code,
      customerName: customer.name,
      mobileNo: customer.mobile || customer.phone || ""
    }));
    
    setPopupData(customerData);
    setPopupTitle("Select Customer");
    setPopupType("customer");
    setPopupOpen(true);
  };

  const openSalesmanPopup = () => {
    if (salesmen.length === 0) {
      alert("No salesmen available. Please try again later or enter manually.");
      return;
    }
    
    const salesmanData = salesmen.map(salesman => ({
      id: salesman.fcode || salesman.code || salesman.id,
      code: salesman.fcode || salesman.code,
      name: salesman.fname || salesman.name,
      displayName: `${salesman.fcode || salesman.code} - ${salesman.fname || salesman.name}`,
      salesmanCode: salesman.fcode || salesman.code,
      salesmanName: salesman.fname || salesman.name
    }));
    
    setPopupData(salesmanData);
    setPopupTitle("Select Salesman");
    setPopupType("salesman");
    setPopupOpen(true);
  };

  // NEW FUNCTION: Open New Bill No popup - CUSTOM POPUP
  const openNewBillNumberPopup = async () => {
    try {
      if (voucherList.length === 0) {
        alert("No bill numbers available. Please try again later.");
        return;
      }
      
      const billNumberData = voucherList.map((voucher, index) => {
        const voucherNo = voucher.voucherNo || voucher.voucherCode || voucher.code || 
                         voucher.billNo || voucher.invoiceNo || voucher.id || 
                         `VOUCHER-${index + 1}`;
        
        const customerName = voucher.customerName || voucher.customer || "";
        const displayText = customerName ? `${voucherNo} - ${customerName}` : voucherNo;
        
        return {
          id: voucherNo,
          code: voucherNo,
          name: displayText,
          displayName: displayText,
          customerName: customerName,
          voucherDate: voucher.voucherDate || voucher.billDate || ""
        };
      });
      
      setBillNoPopupData(billNumberData);
      setSelectedBillNo(null);
      setBillNoSearchText("");
      setBillNoPopupOpen(true);
      console.log("Opened custom bill number popup with data:", billNumberData.length, "items");
    } catch (error) {
      console.error("Error opening bill number popup:", error);
      alert("Error loading bill numbers. Please try again.");
    }
  };

  // NEW FUNCTION: Apply selected bill number
  const handleApplyBillNumber = () => {
    if (!selectedBillNo) {
      alert("Please select a bill number first.");
      return;
    }
    
    console.log("Applying new bill number:", selectedBillNo);
    
    setBillDetails(prev => ({ ...prev, newBillNo: selectedBillNo }));
    
    setBillNoPopupOpen(false);
    setSelectedBillNo(null);
    setBillNoSearchText("");
  };

  // NEW FUNCTION: Clear selected bill number
  const handleClearBillNumber = () => {
    setBillDetails(prev => ({ ...prev, newBillNo: '' }));
    
    setBillNoPopupOpen(false);
    setSelectedBillNo(null);
    setBillNoSearchText("");
  };

  // NEW FUNCTION: Filter bill numbers based on search
  const getFilteredBillNumbers = () => {
    if (!billNoSearchText.trim()) {
      return billNoPopupData;
    }
    
    const searchLower = billNoSearchText.toLowerCase();
    return billNoPopupData.filter(item => {
      return (
        (item.code && item.code.toLowerCase().includes(searchLower)) ||
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.customerName && item.customerName.toLowerCase().includes(searchLower))
      );
    });
  };

  const openItemPopup = (rowIndex) => {
    if (itemList.length === 0) {
      alert("No items available. Please try again later or enter manually.");
      return;
    }
    
    // UPDATED: Create item data showing both item name and item code in popup
    const itemData = itemList.map((item, index) => {
      const itemCode = item.fItemcode || item.itemCode || item.code || `ITEM${index + 1}`;
      const itemName = item.fItemName || item.itemName || item.name || 'Unknown Item';
      
      // Create display name showing both code and name
      const displayName = `${itemCode} - ${itemName}`;
      
      return {
        id: itemCode || `item-${index}`,
        code: itemCode,
        name: itemName,
        displayName: displayName, // Show both code and name
        itemCode: itemCode,
        itemName: itemName
      };
    });
    
    setPopupData(itemData);
    setPopupTitle("Select Item");
    setPopupType("item");
    setSelectedRowIndex(rowIndex);
    setPopupOpen(true);
  };

  const openEditPopup = async () => {
    try {
      setLoading(true);
      console.log("Opening edit popup...");
      
      const freshVouchers = await fetchVoucherList();
      console.log("Fresh vouchers for edit:", freshVouchers);
      
      if (!freshVouchers || freshVouchers.length === 0) {
        alert("No sales return vouchers available for editing.");
        setLoading(false);
        return;
      }
      
      const editData = freshVouchers.map((voucher, index) => {
        const voucherNo = voucher.voucherNo || voucher.voucherCode || voucher.code || 
                         voucher.billNo || voucher.invoiceNo || voucher.id || 
                         `VOUCHER-${index + 1}`;
        
        const customerName = voucher.customerName || voucher.customer || "";
        const displayText = customerName ? `${voucherNo} - ${customerName}` : voucherNo;
        
        return {
          id: voucherNo,
          code: voucherNo,
          name: displayText,
          displayName: displayText,
          customerName: customerName
        };
      });
      
      console.log("Edit popup data:", editData);
      
      setPopupData(editData);
      setPopupTitle("Select Sales Return to Edit");
      setPopupType("edit");
      setSelectedAction("edit");
      setPopupOpen(true);
      
    } catch (err) {
      console.error("Error opening edit popup:", err);
      alert("Error loading edit data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openDeletePopup = async () => {
    try {
      setLoading(true);
      console.log("Opening delete popup...");
      
      const freshVouchers = await fetchVoucherList();
      console.log("Fresh vouchers for delete:", freshVouchers);
      
      if (!freshVouchers || freshVouchers.length === 0) {
        alert("No sales return vouchers available for deletion.");
        setLoading(false);
        return;
      }
      
      const deleteData = freshVouchers.map((voucher, index) => {
        const voucherNo = voucher.voucherNo || voucher.voucherCode || voucher.code || 
                         voucher.billNo || voucher.invoiceNo || voucher.id || 
                         `VOUCHER-${index + 1}`;
        
        const customerName = voucher.customerName || voucher.customer || "";
        const displayText = customerName ? `${voucherNo} - ${customerName}` : voucherNo;
        
        return {
          id: voucherNo,
          code: voucherNo,
          name: displayText,
          displayName: displayText
        };
      });
      
      console.log("Delete popup data:", deleteData);
      
      setPopupData(deleteData);
      setPopupTitle("Select Sales Return to Delete");
      setPopupType("delete");
      setSelectedAction("delete");
      setPopupOpen(true);
      
    } catch (err) {
      console.error("Error opening delete popup:", err);
      alert("Error loading delete data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePopupSelect = async (selectedItem) => {
    console.log("Popup selected item:", selectedItem);
    console.log("Popup type:", popupType);
    
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
        }
        
      } else if (popupType === "item") {
        console.log("Item popup selection for row:", selectedRowIndex);
        console.log("Selected item data:", selectedItem);
        
        if (selectedRowIndex !== null) {
          const selectedItemFromList = itemList.find(item => {
            const itemCode = item.fItemcode || item.itemCode || item.code || item.ItemCode || item.Code || item.id;
            
            if (selectedItem.code && itemCode) {
              return itemCode.toString() === selectedItem.code.toString();
            }
            return false;
          });
          
          console.log("Selected item from list:", selectedItemFromList);
          
          const itemData = selectedItemFromList || selectedItem;
          
          const itemName = itemData.fItemName || itemData.itemName || itemData.name || 
                          selectedItem.name || selectedItem.fItemName || 'Unknown Item';
          const itemCode = itemData.fItemcode || itemData.itemCode || itemData.code || 
                          selectedItem.code || `0000${selectedRowIndex + 1}`;
          
          console.log("Item name to display:", itemName);
          console.log("Item code to store:", itemCode);
          
          const updatedItems = [...items];
          
          if (updatedItems[selectedRowIndex]) {
            updatedItems[selectedRowIndex] = {
              ...updatedItems[selectedRowIndex],
              itemName: itemName,
              itemCode: itemCode,
            };
            
            console.log("Updated item row:", updatedItems[selectedRowIndex]);
            
            setItems(updatedItems);
          } else {
            console.error("Row index out of bounds:", selectedRowIndex);
          }
        }
        
      } else if (popupType === "edit") {
        const voucherNo = selectedItem.code || selectedItem.id;
        console.log("Loading voucher for editing:", voucherNo);
        
        await loadVoucherForEditing(voucherNo);
        
      } else if (popupType === "delete") {
        const voucherNo = selectedItem.code || selectedItem.id;
        const confirmDelete = window.confirm(
          `Are you sure you want to delete Sales Return?\n\n` +
          `Voucher No: ${voucherNo}\n\n` +
          `This action cannot be undone!`
        );
        
        if (confirmDelete) {
          await deleteSalesReturn(voucherNo);
        }
      }
    } catch (err) {
      console.error("Error in popup selection:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setPopupOpen(false);
      setPopupType("");
      setPopupData([]);
      setSelectedRowIndex(null);
      setSelectedAction("");
    }
  };

  const fetchItemsForPopup = async (pageNum, search) => {
    const filtered = popupData.filter(item => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        (item.code && item.code.toString().toLowerCase().includes(searchLower)) ||
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.displayName && item.displayName.toLowerCase().includes(searchLower)) ||
        (item.itemName && item.itemName.toLowerCase().includes(searchLower)) ||
        (item.fItemName && item.fItemName.toLowerCase().includes(searchLower))
      );
    });
    
    const startIndex = (pageNum - 1) * 20;
    const endIndex = startIndex + 20;
    return filtered.slice(startIndex, endIndex);
  };

  const getPopupConfig = () => {
    const configs = {
      customer: {
        displayFieldKeys: ['code', 'name'],
        searchFields: ['code', 'name'],
        headerNames: ['Code', 'Customer Name'],
        columnWidths: { code: '30%', name: '70%' },
        searchPlaceholder: 'Search customers...',
        showApplyButton: false
      },
      salesman: {
        displayFieldKeys: ['code', 'name'],
        searchFields: ['code', 'name'],
        headerNames: ['Code', 'Salesman Name'],
        columnWidths: { code: '30%', name: '70%' },
        searchPlaceholder: 'Search salesmen...',
        showApplyButton: false
      },
      // UPDATED: Show both Item Code and Item Name in the popup
      item: {
        displayFieldKeys: ['displayName'], // Use displayName which shows both code and name
        searchFields: ['displayName', 'name', 'itemName', 'code'], // Search by both
        headerNames: ['Item (Code - Name)'],
        columnWidths: { displayName: '100%' },
        searchPlaceholder: 'Search items by code or name...',
        showApplyButton: false
      },
      edit: {
        displayFieldKeys: ['name'],
        searchFields: ['code', 'name', 'customerName'],
        headerNames: ['Voucher No'],
        columnWidths: { name: '100%' },
        searchPlaceholder: 'Search voucher number...',
        showApplyButton: false
      },
      delete: {
        displayFieldKeys: ['name'],
        searchFields: ['code', 'name', 'customerName'],
        headerNames: ['Voucher No'],
        columnWidths: { name: '100%' },
        searchPlaceholder: 'Search voucher number...',
        showApplyButton: false
      }
    };
    
    return configs[popupType] || configs.customer;
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e, nextRef, fieldName = '') => {
    if (e.key === '/') {
      e.preventDefault();
      
      if (fieldName === 'salesman') {
        openSalesmanPopup();
      } else if (fieldName === 'custName') {
        openCustomerPopup();
      } else if (fieldName === 'newBillNo') {
        openNewBillNumberPopup();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleUomSpacebar = (e, id) => {
    if (e.key === ' ') {
      e.preventDefault();
      
      const currentUom = items.find(item => item.id === id)?.uom || '';
      const currentIndex = uomValues.indexOf(currentUom.toUpperCase());
      
      let nextIndex;
      if (currentIndex === -1) {
        nextIndex = 0;
      } else {
        nextIndex = (currentIndex + 1) % uomValues.length;
      }
      
      const nextUom = uomValues[nextIndex];
      handleItemChange(id, 'uom', nextUom);
    }
  };

  const handleTableKeyDown = (e, currentRowIndex, currentField) => {
    if (e.key === '/' && currentField === 'itemName') {
      e.preventDefault();
      openItemPopup(currentRowIndex);
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();

      const fields = [
        'barcode', 'itemName', 'stock', 'mrp', 'uom', 'hsn', 'tax', 'sRate', 'rate', 'qty'
      ];

      const currentFieldIndex = fields.indexOf(currentField);

      if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        const nextInput = document.querySelector(`input[data-row="${currentRowIndex}"][data-field="${nextField}"]`);
        if (nextInput) {
          nextInput.focus();
          return;
        }
      }

      if (currentRowIndex < items.length - 1) {
        const nextInput = document.querySelector(`input[data-row="${currentRowIndex + 1}"][data-field="barcode"]`);
        if (nextInput) {
          nextInput.focus();
          return;
        }
      }

      handleAddRow();
      setTimeout(() => {
        const newRowInput = document.querySelector(`input[data-row="${items.length}"][data-field="barcode"]`);
        if (newRowInput) newRowInput.focus();
      }, 60);
    }
  };

  const handleAddItem = async () => {
    if (!billDetails.barcodeInput) {
      alert("Please enter barcode");
      return;
    }

    try {
      const existingItemInList = itemList.find(item => 
        item.itemCode === billDetails.barcodeInput ||
        item.code === billDetails.barcodeInput ||
        item.fItemcode === billDetails.barcodeInput
      );

      if (existingItemInList) {
        handleAddItemFromLocal(existingItemInList);
      } else {
        const itemData = await fetchItemByBarcode(billDetails.barcodeInput);
        if (itemData) {
          handleAddItemFromAPI(itemData);
        } else {
          alert("Item not found. Please check the barcode.");
        }
      }
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item. Please try again.");
    }
  };

  const handleAddItemFromLocal = (itemData) => {
    const existingItemIndex = items.findIndex(item =>
      (item.barcode === billDetails.barcodeInput) && 
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
        barcode: billDetails.barcodeInput,
        itemName: itemData.fItemName || itemData.itemName || itemData.name || '',
        stock: '',
        mrp: '',
        uom: '',
        hsn: '',
        tax: '',
        sRate: '',
        rate: '',
        itemCode: itemData.fItemcode || itemData.itemCode || itemData.code || `0000${items.length + 1}`,
        qty: '1',
        amount: '0.00'
      };

      setItems([...items, newItem]);
    }

    setBillDetails(prev => ({ ...prev, barcodeInput: '' }));
    if (barcodeRef.current) barcodeRef.current.focus();
  };

  const handleAddItemFromAPI = (itemData) => {
    const newItem = {
      id: items.length + 1,
      sNo: items.length + 1,
      barcode: billDetails.barcodeInput,
      itemName: itemData.fItemName || itemData.itemName || itemData.name || '',
      stock: '',
      mrp: '',
      uom: '',
      hsn: '',
      tax: '',
      sRate: '',
      rate: '',
      itemCode: itemData.fItemcode || itemData.itemCode || itemData.code || `0000${items.length + 1}`,
      qty: '1',
      amount: '0.00'
    };

    setItems([...items, newItem]);
    
    setBillDetails(prev => ({ ...prev, barcodeInput: '' }));
    if (barcodeRef.current) barcodeRef.current.focus();
  };

  const handleAddRow = () => {
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
      rate: '',
      qty: '',
      amount: '0.00',
      itemCode: `0000${items.length + 1}`
    };
    setItems([...items, newRow]);
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        if (field === 'qty' || field === 'sRate' || field === 'rate') {
          const qty = field === 'qty' ? value : updatedItem.qty;
          const rate = field === 'rate' ? value : (field === 'sRate' ? value : updatedItem.sRate);
          updatedItem.amount = calculateAmount(qty, rate);

          if (field === 'rate') {
            updatedItem.sRate = value;
          }
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

    if (window.confirm(`Are you sure you want to delete "${itemName}" ${barcode}?`)) {
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
          rate: '',
          qty: '',
          amount: '0.00',
          itemCode: '00001'
        };
        setItems([clearedItem]);
      }
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setBillDetails({
        billNo: 'SR0000001',
        billDate: new Date().toISOString().substring(0, 10),
        mobileNo: '',
        empName: '',
        empCode: '14789',
        salesman: '',
        salesmanCode: '002',
        custName: '',
        customerCode: '',
        returnReason: '',
        barcodeInput: '',
        partyCode: '',
        gstno: '',
        city: '',
        type: 'Retail',
        transType: 'SALES RETURN',
        billAMT: '0',
        newBillNo: ''
      });

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
          rate: '',
          qty: '',
          amount: '0.00',
          itemCode: '00001'
        }
      ]);
      
      fetchMaxVoucherNo();
    }
  };

  // ==================== SAVE FUNCTION ====================
  const handleSave = async () => {
    if (!billDetails.custName) {
      alert("Please select a customer.");
      return;
    }

    if (items.length === 0 || items.every(item => !item.itemName && !item.barcode)) {
      alert("Please add at least one item.");
      return;
    }

    const invalidItems = items.filter(item => 
      item.itemName && (!item.qty || parseFloat(item.qty) <= 0)
    );
    
    if (invalidItems.length > 0) {
      alert("Please enter valid quantity for all items.");
      return;
    }

    try {
      const isExistingVoucher = billDetails.billNo !== 'SR0000001' && 
                                !billDetails.billNo.startsWith('SR000000');
      
      if (isExistingVoucher) {
        await updateSalesReturn();
      } else {
        await createSalesReturn();
      }
      
      if (!isExistingVoucher) {
        handleClear();
      }
      
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handlePrint = () => {
    alert('Print functionality to be implemented');
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
    inlineInputClickable: {
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
      cursor: 'pointer',
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
      zIndex: 90,
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
      justifyContent: 'space-between',
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
      backgroundColor: '#6c757d',
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
  };

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
      {error && <div style={styles.errorContainer}>Error: {error}</div>}
      
      {loading && (
        <div style={{
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
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div>Loading...</div>
          </div>
        </div>
      )}

      {/* --- HEADER SECTION --- */}
      <div style={styles.headerSection}>
        {/* ROW 1 */}
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
        }}>
          {/* Bill No (EXISTING - Auto-generated) */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill No:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={billDetails.billNo}
              name="billNo"
              onChange={handleInputChange}
              ref={billNoRef}
              onKeyDown={(e) => handleKeyDown(e, billDateRef)}
              onFocus={() => setFocusedField('billNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Auto-generated"
              readOnly
            />
          </div>

          {/* Bill Date */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill Date:</label>
            <input
              type="date"
              style={{ ...styles.inlineInput, padding: screenSize.isMobile ? '6px 8px' : '8px 10px' }}
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
              style={styles.inlineInput}
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
              style={styles.inlineInput}
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
            <input
              type="text"
              style={styles.inlineInputClickable}
              value={billDetails.salesman}
              name="salesman"
              onChange={handleInputChange}
              ref={salesmanRef}
              onClick={openSalesmanPopup}
              onKeyDown={(e) => handleKeyDown(e, custNameRef, 'salesman')}
              onFocus={() => setFocusedField('salesman')}
              onBlur={() => setFocusedField('')}
              placeholder="Click or press /"
              readOnly
            />
          </div>

          {/* Customer Name */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Customer:</label>
            <input
              type="text"
              style={styles.inlineInputClickable}
              value={billDetails.custName}
              name="custName"
              onChange={handleInputChange}
              ref={custNameRef}
              onClick={openCustomerPopup}
              onKeyDown={(e) => handleKeyDown(e, newBillNoRef, 'custName')}
              onFocus={() => setFocusedField('custName')}
              onBlur={() => setFocusedField('')}
              placeholder="Click or press /"
              readOnly
            />
          </div>

          {/* NEW Bill No Field (Near Barcode) - Custom Popup */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill No:</label>
            <input
              type="text"
              style={styles.inlineInputClickable}
              value={billDetails.newBillNo}
              name="newBillNo"
              onChange={handleInputChange}
              ref={newBillNoRef}
              onClick={openNewBillNumberPopup}
              onKeyDown={(e) => handleKeyDown(e, barcodeRef, 'newBillNo')}
              onFocus={() => setFocusedField('newBillNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Click to select"
              readOnly
            />
          </div>

          {/* Barcode */}
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Barcode:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={billDetails.barcodeInput}
              name="barcodeInput"
              onChange={handleInputChange}
              ref={barcodeRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              onFocus={() => setFocusedField('barcodeInput')}
              onBlur={() => setFocusedField('')}
              placeholder="Scan or Enter Barcode"
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
                <th style={styles.th}>S.No</th>
                <th style={styles.th}>Barcode</th>
                <th style={{ ...styles.th, ...styles.itemNameContainer, textAlign: 'left' }}>Item Name</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>MRP</th>
                <th style={styles.th}>UOM</th>
                <th style={styles.th}>HSN</th>
                <th style={styles.th}>TAX (%)</th>
                <th style={styles.th}>SRate</th>
                <th style={styles.th}>WRate</th>
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
                      value={item.barcode}
                      data-row={index}
                      data-field="barcode"
                      onChange={(e) => handleItemChange(item.id, 'barcode', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'barcode')}
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.itemNameContainer }}>
                    <input
                      style={styles.editableInputClickable}
                      value={item.itemName}
                      placeholder="Click or press /"
                      data-row={index}
                      data-field="itemName"
                      onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'itemName')}
                      onClick={() => openItemPopup(index)}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.stock}
                      data-row={index}
                      data-field="stock"
                      onChange={(e) => handleItemChange(item.id, 'stock', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'stock')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.mrp}
                      data-row={index}
                      data-field="mrp"
                      onChange={(e) => handleItemChange(item.id, 'mrp', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'mrp')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.uom}
                      data-row={index}
                      data-field="uom"
                      onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === ' ') {
                          handleUomSpacebar(e, item.id);
                        } else {
                          handleTableKeyDown(e, index, 'uom');
                        }
                      }}
                      placeholder="Press space for K/P"
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
                      style={styles.editableInput}
                      value={item.rate}
                      data-row={index}
                      data-field="rate"
                      onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'rate')}
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
                        minHeight: screenSize.isMobile ? '28px' : screenSize.isTablet ? '32px' : '35px',
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
              setActiveTopAction(type);
              if (type === 'add') handleAddRow();
              else if (type === 'edit') openEditPopup();
              else if (type === 'delete') openDeletePopup();
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

      {/* CUSTOM POPUP for Bill Number */}
      {billNoPopupOpen && (
        <div style={styles.customPopupOverlay}>
          <div style={styles.customPopupContainer}>
            <div style={styles.customPopupHeader}>
              <h3 style={styles.customPopupTitle}>Select Bill Number</h3>
              <button
                style={styles.customPopupCloseButton}
                onClick={() => {
                  setBillNoPopupOpen(false);
                  setSelectedBillNo(null);
                  setBillNoSearchText("");
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div style={styles.customPopupSearchContainer}>
              <input
                type="text"
                style={styles.customPopupSearchInput}
                placeholder="Search bill number or customer..."
                value={billNoSearchText}
                onChange={(e) => setBillNoSearchText(e.target.value)}
              />
            </div>
            
            <div style={styles.customPopupContent}>
              {getFilteredBillNumbers().length > 0 ? (
                <table style={styles.customPopupTable}>
                  <thead style={styles.customPopupTableHeader}>
                    <tr>
                      <th style={styles.customPopupTableHeaderCell}>Bill No</th>
                      <th style={styles.customPopupTableHeaderCell}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredBillNumbers().map((item, index) => (
                      <tr
                        key={item.id}
                        style={{
                          ...styles.customPopupTableRow,
                          ...(selectedBillNo === item.code ? styles.customPopupTableRowSelected : {}),
                        }}
                        onClick={() => setSelectedBillNo(item.code)}
                      >
                        <td style={styles.customPopupTableCell}>{item.code}</td>
                        <td style={styles.customPopupTableCell}>{item.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.noDataMessage}>
                  {billNoSearchText ? "No matching bill numbers found" : "No bill numbers available"}
                </div>
              )}
            </div>
            
            <div style={styles.customPopupFooter}>
              <button
                style={{
                  ...styles.customPopupFooterButton,
                  ...styles.customPopupClearButton,
                }}
                onClick={handleClearBillNumber}
              >
                Clear
              </button>
              <button
                style={{
                  ...styles.customPopupFooterButton,
                  ...styles.customPopupApplyButton,
                  ...(!selectedBillNo ? styles.customPopupApplyButtonDisabled : {}),
                }}
                onClick={handleApplyBillNumber}
                disabled={!selectedBillNo}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regular PopupListSelector for other popups */}
      {popupOpen && popupType !== "newBillNumber" && (
        <PopupListSelector
          open={popupOpen}
          onClose={() => {
            setPopupOpen(false);
            setPopupType("");
            setPopupData([]);
            setSelectedRowIndex(null);
            setSelectedAction("");
          }}
          onSelect={handlePopupSelect}
          fetchItems={fetchItemsForPopup}
          title={popupTitle}
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

