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
    salesman: '',
    custName: '',
    returnReason: '',
    barcodeInput: '',
    partyCode: '',
    gstno: '',
    city: '',
    type: 'Retail',
    transType: 'SALES RETURN'
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
      amount: '0.00'
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
      const response = await apiService.get(API_ENDPOINTS.sales_return.getMaxVoucherNo('001'));
      console.log("Max Voucher No Response:", response);
      
      if (response && response.maxVoucherNo) {
        setBillDetails(prev => ({ ...prev, billNo: response.maxVoucherNo }));
      }
    } catch (err) {
      console.error("API Error fetching voucher:", err);
      setBillDetails(prev => ({ ...prev, billNo: 'SR0000001' }));
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers from backend API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching customers...");
      
      if (API_ENDPOINTS.getCustomers) {
        const response = await apiService.get(API_ENDPOINTS.getCustomers);
        console.log("Customers Response:", response);
        
        if (response && Array.isArray(response)) {
          setCustomers(response);
          console.log(`Loaded ${response.length} customers from API`);
        } else {
          console.warn("Customers response is not an array:", response);
          setCustomers([]);
        }
      } else {
        console.log("API_ENDPOINTS.getCustomers not found, trying direct endpoint...");
        const response = await apiService.get("Salesinvoices/GetPartyByParent");
        console.log("Direct Customers Response:", response);
        
        if (response && Array.isArray(response)) {
          setCustomers(response);
          console.log(`Loaded ${response.length} customers from direct API`);
        } else {
          setCustomers([]);
        }
      }
    } catch (err) {
      console.error("API Error fetching customers:", err);
      console.error("Error details:", err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch salesmen from backend API
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

  // Fetch item dropdown list from backend API
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching items dropdown...");
      
      console.log("Fetching from: ItemCreation/GetItemCreationdropdowslist");
      const response = await apiService.get("ItemCreation/GetItemCreationdropdowslist");
      console.log("Items Dropdown Response:", response);
      
      if (response && Array.isArray(response)) {
        console.log("Response is an array, length:", response.length);
        
        const formattedItems = response.map(item => {
          const itemName = item.fItemName || item.itemName || item.name || item.ItemName || item.Name || item.description || item.Description || '';
          const code = item.itemCode || item.code || item.ItemCode || item.Code || item.id || '';
          
          return {
            ...item,
            fItemName: itemName,
            itemName: itemName,
            name: itemName,
            code: code,
            barcode: item.barcode || item.Barcode || item.itemCode || code,
            stock: item.stockQty || item.stock || item.StockQty || item.Stock || item.quantity || item.Quantity || 0,
            mrp: item.mrp || item.MRP || item.sellingPrice || item.SellingPrice || item.price || item.Price || 0,
            uom: item.uom || item.UOM || item.unit || item.Unit || "",
            hsn: item.hsnCode || item.hsn || item.HsnCode || item.HSN || "",
            tax: item.taxRate || item.tax || item.TaxRate || item.Tax || 0,
            sRate: item.sellingPrice || item.sRate || item.SellingPrice || item.SRate || item.price || item.Price || 0,
          };
        });
        
        setItemList(formattedItems);
        console.log(`Loaded ${formattedItems.length} items from API`);
      } else if (response && typeof response === 'object') {
        console.log("Response is an object");
        console.log("Object keys:", Object.keys(response));
        
        let itemsArray = [];
        
        if (response.items && Array.isArray(response.items)) {
          itemsArray = response.items;
        } else if (response.data && Array.isArray(response.data)) {
          itemsArray = response.data;
        } else if (response.list && Array.isArray(response.list)) {
          itemsArray = response.list;
        } else {
          itemsArray = Object.values(response);
        }
        
        if (Array.isArray(itemsArray) && itemsArray.length > 0) {
          const formattedItems = itemsArray.map(item => {
            const itemName = item.fItemName || item.itemName || item.name || item.ItemName || item.Name || item.description || item.Description || '';
            const code = item.itemCode || item.code || item.ItemCode || item.Code || item.id || '';
            
            return {
              ...item,
              fItemName: itemName,
              itemName: itemName,
              name: itemName,
              code: code,
              barcode: item.barcode || item.Barcode || item.itemCode || code,
              stock: item.stockQty || item.stock || item.StockQty || item.Stock || item.quantity || item.Quantity || 0,
              mrp: item.mrp || item.MRP || item.sellingPrice || item.SellingPrice || item.price || item.Price || 0,
              uom: item.uom || item.UOM || item.unit || item.Unit || "",
              hsn: item.hsnCode || item.hsn || item.HsnCode || item.HSN || "",
              tax: item.taxRate || item.tax || item.TaxRate || item.Tax || 0,
              sRate: item.sellingPrice || item.sRate || item.SellingPrice || item.SRate || item.price || item.Price || 0,
            };
          });
          
          setItemList(formattedItems);
          console.log(`Loaded ${formattedItems.length} items from API`);
        } else {
          console.warn("Could not extract items from response:", response);
          setItemList([]);
        }
      } else {
        console.warn("Items response is not an array or object:", response);
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

  // Fetch voucher list from backend API
  const fetchVoucherList = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching voucher list...");
      
      const endpoint = API_ENDPOINTS.sales_return?.getVoucherList || "SalesReturn/GetSalesReturn";
      const response = await apiService.get(endpoint);
      console.log("Voucher List Response:", response);
      
      let voucherData = [];
      
      if (response && Array.isArray(response)) {
        voucherData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        voucherData = response.data;
      }
      
      console.log("Extracted voucher data:", voucherData);
      setVoucherList(voucherData);
      return voucherData;
      
    } catch (err) {
      console.error("API Error fetching voucher list:", err);
      console.error("Error details:", err.message);
      
      const sampleData = [
        { voucherNo: 'SR00001', customerName: 'John Doe', voucherDate: '2023-10-01' },
        { voucherNo: 'SR00002', customerName: 'Jane Smith', voucherDate: '2023-10-02' },
        { voucherNo: 'SR00003', customerName: 'Mike Johnson', voucherDate: '2023-10-03' },
      ];
      
      setVoucherList(sampleData);
      return sampleData;
    } finally {
      setLoading(false);
    }
  };

  const fetchItemByBarcode = async (barcode) => {
    try {
      setLoading(true);
      setError("");
      
      const foundItem = itemList.find(item => 
        item.barcode === barcode || 
        item.itemCode === barcode ||
        item.code === barcode
      );
      
      if (foundItem) {
        console.log("Item found in local list:", foundItem);
        return foundItem;
      }
      
      if (API_ENDPOINTS.sales_return?.getItemByBarcode) {
        const response = await apiService.get(API_ENDPOINTS.sales_return.getItemByBarcode(barcode));
        console.log("Item by Barcode Response:", response);
        return response;
      } else {
        console.log("Item by barcode endpoint not configured");
        return null;
      }
    } catch (err) {
      console.error("API Error fetching item by barcode:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createSalesReturn = async (salesReturnData) => {
    try {
      setLoading(true);
      setError("");
      console.log("Creating sales return with data:", salesReturnData);
      
      if (API_ENDPOINTS.sales_return?.createSalesReturn) {
        const response = await apiService.post(
          API_ENDPOINTS.sales_return.createSalesReturn,
          salesReturnData
        );
        
        console.log("Create Sales Return Response:", response);
        return response;
      } else {
        console.log("Create sales return endpoint not configured");
        return { success: true, message: "Sales return created (simulated)" };
      }
    } catch (err) {
      setError(err.message || "Failed to create sales return");
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSalesReturn = async (salesReturnData) => {
    try {
      setLoading(true);
      setError("");
      console.log("Updating sales return with data:", salesReturnData);
      
      if (API_ENDPOINTS.sales_return?.updateSalesReturn) {
        const response = await apiService.put(
          API_ENDPOINTS.sales_return.updateSalesReturn,
          salesReturnData
        );
        
        console.log("Update Sales Return Response:", response);
        return response;
      } else {
        console.log("Update sales return endpoint not configured");
        return { success: true, message: "Sales return updated (simulated)" };
      }
    } catch (err) {
      setError(err.message || "Failed to update sales return");
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSalesReturn = async (voucherNo) => {
    try {
      setLoading(true);
      setError("");
      console.log("Deleting sales return:", voucherNo);
      
      if (API_ENDPOINTS.sales_return?.deleteSalesReturn) {
        const response = await apiService.delete(
          API_ENDPOINTS.sales_return.deleteSalesReturn(voucherNo)
        );
        
        console.log("Delete Sales Return Response:", response);
        return response;
      } else {
        console.log("Delete sales return endpoint not configured");
        return { success: true, message: "Sales return deleted (simulated)" };
      }
    } catch (err) {
      setError(err.message || "Failed to delete sales return");
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReturnDetails = async (voucherNo) => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching sales return details for:", voucherNo);
      
      if (API_ENDPOINTS.sales_return?.getSalesReturnDetails) {
        const response = await apiService.get(API_ENDPOINTS.sales_return.getSalesReturnDetails(voucherNo));
        console.log("Sales Return Details:", response);
        return response;
      } else {
        console.log("Get sales return details endpoint not configured");
        return null;
      }
    } catch (err) {
      console.error("API Error fetching sales return details:", err);
      return null;
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
      
      await fetchMaxVoucherNo();
      await fetchCustomers();
      await fetchItems();
      await fetchVoucherList();
      await fetchSalesmen();
    };
    
    fetchInitialData();
  }, []);

  // Calculate Totals whenever items change
  useEffect(() => {
    const qtyTotal = items.reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
    const amountTotal = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);

    setTotalQty(qtyTotal);
    setTotalAmount(amountTotal);
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
      displayName: `${customer.code} - ${customer.name}`
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
      displayName: `${salesman.fcode || salesman.code} - ${salesman.fname || salesman.name}`
    }));
    
    setPopupData(salesmanData);
    setPopupTitle("Select Salesman");
    setPopupType("salesman");
    setPopupOpen(true);
  };

  const openItemPopup = (rowIndex) => {
    if (itemList.length === 0) {
      alert("No items available. Please try again later or enter manually.");
      return;
    }
    
    const itemData = itemList.map((item, index) => {
      const itemName = item.fItemName || item.itemName || item.name || item.ItemName || item.Name || item.description || item.Description || `Item ${index + 1}`;
      const code = item.itemCode || item.code || item.ItemCode || item.Code || item.id || `ITEM${index + 1}`;
      const barcode = item.barcode || item.Barcode || item.itemCode || item.code || code;
      const stock = item.stockQty || item.stock || item.StockQty || item.Stock || item.quantity || item.Quantity || 0;
      const mrp = item.mrp || item.MRP || item.sellingPrice || item.SellingPrice || item.price || item.Price || 0;
      const sRate = item.sellingPrice || item.sRate || item.SellingPrice || item.SRate || item.price || item.Price || 0;
      
      return {
        id: code || index,
        code: code,
        name: itemName,
        fItemName: itemName,
        barcode: barcode,
        stock: stock,
        mrp: mrp,
        uom: item.uom || item.UOM || item.unit || item.Unit || "",
        hsn: item.hsnCode || item.hsn || item.HsnCode || item.HSN || "",
        tax: item.taxRate || item.tax || item.TaxRate || item.Tax || 0,
        sRate: sRate,
        displayName: `${code} - ${itemName}`
      };
    });
    
    setPopupData(itemData);
    setPopupTitle("Select Item");
    setPopupType("item");
    setSelectedRowIndex(rowIndex);
    setPopupOpen(true);
  };

  // Open edit popup
  const openEditPopup = async () => {
    try {
      setLoading(true);
      console.log("Opening edit popup...");
      
      let editData = [];
      
      try {
        const freshVouchers = await fetchVoucherList();
        console.log("Fresh vouchers for edit:", freshVouchers);
        
        if (freshVouchers && freshVouchers.length > 0) {
          editData = freshVouchers.map((voucher, index) => {
            const voucherNo = voucher.voucherNo || voucher.voucherCode || voucher.code || 
                             voucher.billNo || voucher.invoiceNo || voucher.id || 
                             `SR${String(index + 1).padStart(5, '0')}`;
            const customerName = voucher.customerName || voucher.custName || voucher.customer || 
                               voucher.partyName || `Customer ${index + 1}`;
            const date = voucher.voucherDate || voucher.billDate || voucher.date || new Date().toISOString().substring(0, 10);
            
            return {
              id: voucherNo,
              code: voucherNo,
              name: customerName,
              userName: customerName,
              date: date,
              displayName: `${voucherNo} - ${customerName} (${date})`
            };
          });
        } else {
          editData = [
            { id: 'SR00001', code: 'SR00001', name: 'Sample Customer 1', userName: 'Sample Customer 1', date: '2023-10-01', displayName: 'SR00001 - Sample Customer 1 (2023-10-01)' },
            { id: 'SR00002', code: 'SR00002', name: 'Sample Customer 2', userName: 'Sample Customer 2', date: '2023-10-02', displayName: 'SR00002 - Sample Customer 2 (2023-10-02)' },
            { id: 'SR00003', code: 'SR00003', name: 'Sample Customer 3', userName: 'Sample Customer 3', date: '2023-10-03', displayName: 'SR00003 - Sample Customer 3 (2023-10-03)' },
          ];
        }
      } catch (err) {
        console.log("Error fetching from backend, using sample data:", err);
        editData = [
          { id: 'SR00001', code: 'SR00001', name: 'John Doe', userName: 'John Doe', date: '2023-10-01', displayName: 'SR00001 - John Doe (2023-10-01)' },
          { id: 'SR00002', code: 'SR00002', name: 'Jane Smith', userName: 'Jane Smith', date: '2023-10-02', displayName: 'SR00002 - Jane Smith (2023-10-02)' },
          { id: 'SR00003', code: 'SR00003', name: 'Mike Johnson', userName: 'Mike Johnson', date: '2023-10-03', displayName: 'SR00003 - Mike Johnson (2023-10-03)' },
        ];
      }
      
      console.log("Edit popup data:", editData);
      
      setPopupData(editData);
      setPopupTitle("Select Sales Return to Edit");
      setPopupType("edit");
      setSelectedAction("edit");
      setPopupOpen(true);
      
    } catch (err) {
      console.error("Error opening edit popup:", err);
      const sampleData = [
        { id: 'SR00001', code: 'SR00001', name: 'Error Customer 1', userName: 'Error Customer 1', date: '2023-10-01', displayName: 'SR00001 - Error Customer 1 (2023-10-01)' },
        { id: 'SR00002', code: 'SR00002', name: 'Error Customer 2', userName: 'Error Customer 2', date: '2023-10-02', displayName: 'SR00002 - Error Customer 2 (2023-10-02)' },
      ];
      setPopupData(sampleData);
      setPopupTitle("Select Sales Return to Edit");
      setPopupType("edit");
      setSelectedAction("edit");
      setPopupOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Open delete popup
  const openDeletePopup = async () => {
    try {
      setLoading(true);
      console.log("Opening delete popup...");
      
      let deleteData = [];
      
      try {
        const freshVouchers = await fetchVoucherList();
        console.log("Fresh vouchers for delete:", freshVouchers);
        
        if (freshVouchers && freshVouchers.length > 0) {
          deleteData = freshVouchers.map((voucher, index) => {
            const voucherNo = voucher.voucherNo || voucher.voucherCode || voucher.code || 
                             voucher.billNo || voucher.invoiceNo || voucher.id || 
                             `SR${String(index + 1).padStart(5, '0')}`;
            const customerName = voucher.customerName || voucher.custName || voucher.customer || 
                               voucher.partyName || `Customer ${index + 1}`;
            const date = voucher.voucherDate || voucher.billDate || voucher.date || new Date().toISOString().substring(0, 10);
            
            return {
              id: voucherNo,
              code: voucherNo,
              name: customerName,
              userName: customerName,
              date: date,
              displayName: `${voucherNo} - ${customerName} (${date})`
            };
          });
        } else {
          deleteData = [
            { id: 'SR00001', code: 'SR00001', name: 'Delete Customer 1', userName: 'Delete Customer 1', date: '2023-10-01', displayName: 'SR00001 - Delete Customer 1 (2023-10-01)' },
            { id: 'SR00002', code: 'SR00002', name: 'Delete Customer 2', userName: 'Delete Customer 2', date: '2023-10-02', displayName: 'SR00002 - Delete Customer 2 (2023-10-02)' },
            { id: 'SR00003', code: 'SR00003', name: 'Delete Customer 3', userName: 'Delete Customer 3', date: '2023-10-03', displayName: 'SR00003 - Delete Customer 3 (2023-10-03)' },
          ];
        }
      } catch (err) {
        console.log("Error fetching from backend, using sample data:", err);
        deleteData = [
          { id: 'SR00001', code: 'SR00001', name: 'Delete John Doe', userName: 'Delete John Doe', date: '2023-10-01', displayName: 'SR00001 - Delete John Doe (2023-10-01)' },
          { id: 'SR00002', code: 'SR00002', name: 'Delete Jane Smith', userName: 'Delete Jane Smith', date: '2023-10-02', displayName: 'SR00002 - Delete Jane Smith (2023-10-02)' },
          { id: 'SR00003', code: 'SR00003', name: 'Delete Mike Johnson', userName: 'Delete Mike Johnson', date: '2023-10-03', displayName: 'SR00003 - Delete Mike Johnson (2023-10-03)' },
        ];
      }
      
      console.log("Delete popup data:", deleteData);
      
      setPopupData(deleteData);
      setPopupTitle("Select Sales Return to Delete");
      setPopupType("delete");
      setSelectedAction("delete");
      setPopupOpen(true);
      
    } catch (err) {
      console.error("Error opening delete popup:", err);
      const sampleData = [
        { id: 'SR00001', code: 'SR00001', name: 'Error Delete 1', userName: 'Error Delete 1', date: '2023-10-01', displayName: 'SR00001 - Error Delete 1 (2023-10-01)' },
        { id: 'SR00002', code: 'SR00002', name: 'Error Delete 2', userName: 'Error Delete 2', date: '2023-10-02', displayName: 'SR00002 - Error Delete 2 (2023-10-02)' },
      ];
      setPopupData(sampleData);
      setPopupTitle("Select Sales Return to Delete");
      setPopupType("delete");
      setSelectedAction("delete");
      setPopupOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle popup selection - FIXED VERSION
  const handlePopupSelect = async (selectedItem) => {
    console.log("Popup selected item:", selectedItem);
    console.log("Popup type:", popupType);
    
    if (popupType === "customer") {
      const selectedCustomer = customers.find(c => 
        (c.code && c.code.toString() === selectedItem.id.toString())
      );
      
      if (selectedCustomer) {
        setBillDetails(prev => ({
          ...prev,
          custName: selectedCustomer.name || selectedCustomer.custName,
          partyCode: selectedCustomer.code || selectedCustomer.custCode,
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
          salesman: selectedSalesman.fname || selectedSalesman.name
        }));
      }
    } else if (popupType === "item") {
      console.log("Item popup selection for row:", selectedRowIndex);
      console.log("Selected item data:", selectedItem);
      
      if (selectedRowIndex !== null) {
        // Find the actual item from itemList for more complete data
        const selectedItemFromList = itemList.find(item => {
          const itemCode = item.itemCode || item.code || item.ItemCode || item.Code || item.id;
          return itemCode && itemCode.toString() === selectedItem.code.toString();
        });
        
        console.log("Selected item from list:", selectedItemFromList);
        
        // Use the item from list if available, otherwise use popup data
        const itemData = selectedItemFromList || selectedItem;
        
        // Get the item name - check multiple possible fields
        const itemName = itemData.fItemName || itemData.itemName || itemData.name || 
                        selectedItem.name || selectedItem.fItemName || 'Unknown Item';
        
        // Get other fields with fallbacks
        const barcode = itemData.barcode || itemData.Barcode || itemData.itemCode || 
                       itemData.code || selectedItem.code || '';
        const mrp = itemData.mrp || itemData.MRP || itemData.sellingPrice || 
                   itemData.SellingPrice || itemData.price || itemData.Price || 0;
        const stock = itemData.stockQty || itemData.stock || itemData.StockQty || 
                     itemData.Stock || itemData.quantity || itemData.Quantity || 0;
        const uom = itemData.uom || itemData.UOM || itemData.unit || itemData.Unit || "";
        const hsn = itemData.hsnCode || itemData.hsn || itemData.HsnCode || itemData.HSN || "";
        const tax = itemData.taxRate || itemData.tax || itemData.TaxRate || itemData.Tax || 0;
        const sRate = itemData.sellingPrice || itemData.sRate || itemData.SellingPrice || 
                     itemData.SRate || itemData.price || itemData.Price || mrp;
        
        console.log("Item name to set:", itemName);
        console.log("Barcode to set:", barcode);
        
        const updatedItems = [...items];
        
        // Ensure the row exists
        if (updatedItems[selectedRowIndex]) {
          updatedItems[selectedRowIndex] = {
            ...updatedItems[selectedRowIndex],
            itemName: itemName, // This is the key fix - properly setting itemName
            barcode: barcode,
            mrp: mrp.toString(),
            stock: stock.toString(),
            uom: uom,
            hsn: hsn,
            tax: tax.toString(),
            sRate: sRate.toString(),
            rate: sRate.toString(),
            qty: "1",
            amount: calculateAmount("1", sRate)
          };
          
          console.log("Updated item row:", updatedItems[selectedRowIndex]);
          
          setItems(updatedItems);
        } else {
          console.error("Row index out of bounds:", selectedRowIndex);
        }
      }
    } else if (popupType === "edit") {
      alert(`Edit selected: ${selectedItem.code}\nCustomer: ${selectedItem.name}\n\nNote: Edit functionality will load data for voucher ${selectedItem.code}`);
      
      setBillDetails(prev => ({ ...prev, billNo: selectedItem.code }));
      
    } else if (popupType === "delete") {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete Sales Return?\n\n` +
        `Voucher No: ${selectedItem.code}\n` +
        `Customer: ${selectedItem.name}\n\n` +
        `This action cannot be undone!`
      );
      
      if (confirmDelete) {
        try {
          await handleDeleteSalesReturn(selectedItem.code);
          alert(`Sales Return ${selectedItem.code} deleted successfully!`);
        } catch (err) {
          console.error("Error deleting:", err);
          alert(`Sales Return ${selectedItem.code} deletion simulated (backend not connected)`);
        }
      } else {
        return;
      }
    }
    
    setPopupOpen(false);
    setPopupType("");
    setPopupData([]);
    setSelectedRowIndex(null);
    setSelectedAction("");
  };

  const fetchItemsForPopup = async (pageNum, search) => {
    const filtered = popupData.filter(item => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        (item.code && item.code.toString().toLowerCase().includes(searchLower)) ||
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.userName && item.userName.toLowerCase().includes(searchLower)) ||
        (item.barcode && item.barcode.toString().toLowerCase().includes(searchLower)) ||
        (item.displayName && item.displayName.toLowerCase().includes(searchLower)) ||
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
        searchPlaceholder: 'Search customers...'
      },
      salesman: {
        displayFieldKeys: ['code', 'name'],
        searchFields: ['code', 'name'],
        headerNames: ['Code', 'Salesman Name'],
        columnWidths: { code: '30%', name: '70%' },
        searchPlaceholder: 'Search salesmen...'
      },
      item: {
        displayFieldKeys: ['code', 'name'],
        searchFields: ['code', 'name', 'fItemName'],
        headerNames: ['Item Code', 'Item Name'],
        columnWidths: { code: '30%', name: '70%' },
        searchPlaceholder: 'Search items...'
      },
      edit: {
        displayFieldKeys: ['code', 'name'],
        searchFields: ['code', 'name'],
        headerNames: ['Voucher No', 'Customer Name'],
        columnWidths: { code: '40%', name: '60%' },
        searchPlaceholder: 'Search voucher or customer...'
      },
      delete: {
        displayFieldKeys: ['code', 'name'],
        searchFields: ['code', 'name'],
        headerNames: ['Voucher No', 'Customer Name'],
        columnWidths: { code: '40%', name: '60%' },
        searchPlaceholder: 'Search voucher or customer...'
      }
    };
    
    return configs[popupType] || configs.customer;
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillDetails(prev => ({ ...prev, [name]: value }));
  };

  // UPDATED: Handle keydown with / key support
  const handleKeyDown = (e, nextRef, fieldName = '') => {
    // Check for / key to open popup
    if (e.key === '/') {
      e.preventDefault();
      
      // Open appropriate popup based on field name
      if (fieldName === 'salesman') {
        openSalesmanPopup();
      } else if (fieldName === 'custName') {
        openCustomerPopup();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  // Handle UOM spacebar cycling
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

  // NEW: Handle table keydown with / key support for item fields
  const handleTableKeyDown = (e, currentRowIndex, currentField) => {
    // Check for / key to open item popup
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
        item.barcode === billDetails.barcodeInput || 
        item.itemCode === billDetails.barcodeInput ||
        item.code === billDetails.barcodeInput
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
        stock: (itemData.stockQty || itemData.stock || itemData.quantity || 0).toString(),
        mrp: (itemData.mrp || itemData.sellingPrice || itemData.price || 0).toString(),
        uom: itemData.uom || itemData.unit || "",
        hsn: itemData.hsnCode || itemData.hsn || "",
        tax: (itemData.taxRate || itemData.tax || 0).toString(),
        sRate: (itemData.sellingPrice || itemData.sRate || itemData.price || 0).toString(),
        rate: (itemData.sellingPrice || itemData.rate || itemData.price || 0).toString(),
        qty: '1',
        amount: (itemData.sellingPrice || itemData.price || 0).toFixed(2)
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
      barcode: itemData.barcode || itemData.itemCode || itemData.code,
      itemName: itemData.fItemName || itemData.itemName || itemData.name,
      stock: (itemData.stockQty || itemData.stock || itemData.quantity || 0).toString(),
      mrp: (itemData.mrp || itemData.sellingPrice || itemData.price || 0).toString(),
      uom: itemData.uom || itemData.unit || "",
      hsn: itemData.hsnCode || itemData.hsn || "",
      tax: (itemData.taxRate || itemData.tax || 0).toString(),
      sRate: (itemData.sellingPrice || itemData.sRate || itemData.price || 0).toString(),
      rate: (itemData.sellingPrice || itemData.rate || itemData.price || 0).toString(),
      qty: '1',
      amount: (itemData.sellingPrice || itemData.price || 0).toFixed(2)
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
      amount: '0.00'
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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete the last item?')) {
      if (items.length > 0) {
        setItems(items.slice(0, -1));
      }
    }
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
          amount: '0.00'
        };
        setItems([clearedItem]);
      }
    }
  };

  const handleDeleteSalesReturn = async (voucherNo) => {
    try {
      await deleteSalesReturn(voucherNo);
      alert(`Sales return ${voucherNo} deleted successfully.`);
      await fetchVoucherList();
    } catch (err) {
      alert(`Failed to delete sales return: ${err.message}`);
      throw err;
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setBillDetails({
        billNo: 'SR0000001',
        billDate: new Date().toISOString().substring(0, 10),
        mobileNo: '',
        empName: '',
        salesman: '',
        custName: '',
        returnReason: '',
        barcodeInput: '',
        partyCode: '',
        gstno: '',
        city: '',
        type: 'Retail',
        transType: 'SALES RETURN'
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
          amount: '0.00'
        }
      ]);
      
      fetchMaxVoucherNo();
    }
  };

  const handleSave = async () => {
    if (!billDetails.custName || items.length === 0 || items.every(item => !item.itemName)) {
      alert("Please fill in customer details and add at least one item.");
      return;
    }

    try {
      const salesReturnData = {
        voucherNo: billDetails.billNo,
        voucherDate: billDetails.billDate,
        customerCode: billDetails.partyCode,
        customerName: billDetails.custName,
        mobileNo: billDetails.mobileNo,
        salesman: billDetails.salesman,
        empName: billDetails.empName,
        returnReason: billDetails.returnReason,
        totalQty: totalQty,
        totalAmount: totalAmount,
        items: items.map(item => ({
          barcode: item.barcode,
          itemName: item.itemName,
          fItemName: item.itemName,
          qty: parseFloat(item.qty) || 0,
          rate: parseFloat(item.sRate) || 0,
          amount: parseFloat(item.amount) || 0,
          mrp: parseFloat(item.mrp) || 0,
          uom: item.uom,
          hsn: item.hsn,
          tax: parseFloat(item.tax) || 0
        })),
        type: billDetails.type,
        transType: billDetails.transType
      };

      console.log("Saving sales return:", salesReturnData);
      
      const isExistingVoucher = billDetails.billNo !== 'SR0000001' && 
                                billDetails.billNo !== 'SR0000001' && 
                                billDetails.billNo !== 'Auto';
      
      let response;
      if (isExistingVoucher) {
        response = await updateSalesReturn(salesReturnData);
        alert(`Sales Return ${billDetails.billNo} updated successfully!`);
      } else {
        response = await createSalesReturn(salesReturnData);
        alert(`Sales Return ${billDetails.billNo} saved successfully!`);
      }
      
      console.log("Save response:", response);
      
      await fetchVoucherList();
      
      handleClear();
      await fetchMaxVoucherNo();
      
    } catch (err) {
      alert(`Failed to save sales return: ${err.message}`);
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
          {/* Bill No */}
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
              placeholder="salesman"
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
              onKeyDown={(e) => handleKeyDown(e, returnReasonRef, 'custName')}
              onFocus={() => setFocusedField('custName')}
              onBlur={() => setFocusedField('')}
              placeholder="Customer"
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
              name="barcode"
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
                      placeholder="item name"
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

      {/* PopupListSelector */}
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
    </div>
  );
};

export default SalesReturn;