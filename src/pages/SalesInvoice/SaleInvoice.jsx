import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_ENDPOINTS } from '../../api/endpoints';
import { axiosInstance } from '../../api/apiService';

const SaleInvoice = () => {
  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Save confirmation popup
  const [saveConfirmationOpen, setSaveConfirmationOpen] = useState(false);
  const [saveConfirmationData, setSaveConfirmationData] = useState(null);
  
  // NEW: State for tracking if customer selection message was shown
  const [customerMessageShown, setCustomerMessageShown] = useState(false);
  
  // 1. Header Details State
  const [billDetails, setBillDetails] = useState({
    billNo: '',
    billDate: new Date().toISOString().substring(0, 10),
    mobileNo: '',
    type: 'Retail',
    salesman: '',
    salesmanCode: '',
    custName: '',
    custCode: '',
    barcodeInput: '',
    partyCode: '',
    gstno: '',
    city: '',
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
      uom: 'P', // Default to P
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

  // 4. Popup States
  const [customerPopupOpen, setCustomerPopupOpen] = useState(false);
  const [itemPopupOpen, setItemPopupOpen] = useState(false);
  const [salesmanPopupOpen, setSalesmanPopupOpen] = useState(false);
  const [deleteItemPopupOpen, setDeleteItemPopupOpen] = useState(false);
  const [deleteCustomerPopupOpen, setDeleteCustomerPopupOpen] = useState(false);
  const [currentItemRowIndex, setCurrentItemRowIndex] = useState(0);
  
  // 5. Mode for popup (add/edit/select/delete)
  const [customerPopupMode, setCustomerPopupMode] = useState('select');
  const [itemPopupMode, setItemPopupMode] = useState('select');
  const [salesmanPopupMode, setSalesmanPopupMode] = useState('select');

  // 6. Salesman data state
  const [salesmanList, setSalesmanList] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [customerList, setCustomerList] = useState([]);

  // 7. Search states for real-time filtering
  const [salesmanSearch, setSalesmanSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  // --- REFS FOR ENTER KEY NAVIGATION ---
  const billNoRef = useRef(null);
  const billDateRef = useRef(null);
  const mobileRef = useRef(null);
  const typeRef = useRef(null);
  const salesmanRef = useRef(null);
  const custNameRef = useRef(null);
  const barcodeRef = useRef(null);

  // Track which top-section field is focused to style active input
  const [focusedField, setFocusedField] = useState('');

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

  // Function to open appropriate popup based on field name
  const openPopupByFieldName = useCallback((fieldName, rowIndex = 0, currentValue = '') => {
    switch(fieldName.toLowerCase()) {
      // Header fields
      case 'salesman':
        openSalesmanPopup(currentValue);
        break;
      
      case 'custname':
      case 'customer':
        openCustomerPopup(currentValue);
        break;
      
      case 'itemname':
        // For item name fields in the table
        openItemPopup(parseInt(rowIndex) || 0, currentValue);
        break;
      
      // Add more cases for other fields if needed
      case 'barcode':
        // Optionally open item popup for barcode field too
        openItemPopup(parseInt(rowIndex) || 0, currentValue);
        break;
      
      case 'barcodeinput':
        // For the main barcode input in header
        openItemPopup(0, currentValue);
        break;
      
      case 'mobile':
      case 'mobileno':
        // You can add mobile number popup if needed
        console.log('Mobile field - add popup if required');
        break;
      
      case 'hsn':
        // HSN code field
        console.log('HSN field - add popup if required');
        break;
      
      default:
        // For any other field, open customer popup as default
        if (fieldName) {
          console.log(`Field "${fieldName}" - opening customer popup as default`);
          openCustomerPopup(currentValue);
        } else {
          // If no specific field, open quick selection
          openQuickSelectionPopup();
        }
        break;
    }
  }, []);

  // Global keyboard event listener for "/" key
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Check if "/" key is pressed
      if (e.key === '/') {
        e.preventDefault();
        
        const activeElement = document.activeElement;
        const isInput = isInputElement(activeElement);
        
        if (isInput) {
          // Get the field name from input's name attribute or dataset
          const fieldName = activeElement.name || activeElement.dataset.field || '';
          const rowIndex = activeElement.dataset.row || 0;
          const currentValue = activeElement.value || '';
          
          // Open appropriate popup based on field name
          openPopupByFieldName(fieldName, rowIndex, currentValue);
        } else {
          // If no input is focused, open quick selection
          openQuickSelectionPopup();
        }
      }
    };

    const isInputElement = (element) => {
      if (!element) return false;
      const tagName = element.tagName.toLowerCase();
      return tagName === 'input' || 
             tagName === 'textarea' || 
             tagName === 'select' ||
             element.isContentEditable;
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [openPopupByFieldName]);

  // Function to open quick selection popup
  const openQuickSelectionPopup = () => {
    openCustomerPopup();
  };

  // NEW: Fetch saved sales invoices for Edit popup
  const fetchSavedInvoices = useCallback(async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      
      // API endpoint to fetch saved invoices
      const response = await axiosInstance.get(
        API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getSavedInvoices(page, 10, search)
      );
      
      let invoiceData = [];
      if (response && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          invoiceData = response.data.data.map(invoice => ({
            id: invoice.voucherNo || invoice.id,
            invoiceNo: invoice.voucherNo,
            date: invoice.voucherDate,
            customerName: invoice.customerName,
            totalAmount: invoice.billAmount,
            status: invoice.status || 'Saved'
          }));
        } else if (Array.isArray(response.data)) {
          invoiceData = response.data.map(invoice => ({
            id: invoice.voucherNo || invoice.id,
            invoiceNo: invoice.voucherNo,
            date: invoice.voucherDate,
            customerName: invoice.customerName,
            totalAmount: invoice.billAmount,
            status: invoice.status || 'Saved'
          }));
        }
      }
      
      // Apply search filter
      let filtered = invoiceData;
      if (search) {
        filtered = invoiceData.filter(invoice => 
          (invoice.invoiceNo || '').toLowerCase().includes(search.toLowerCase()) ||
          (invoice.customerName || '').toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Pagination
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      return filtered.slice(startIndex, endIndex);
    } catch (err) {
      console.error('Error fetching saved invoices:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch salesman list from API
  const fetchSalesmanList = useCallback(async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      
      const response = await axiosInstance.get(
        API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getSalesman()
      );
      
      let salesmanData = [];
      if (response && response.data) {
        salesmanData = response.data.map(salesman => ({
          id: salesman.fcode,
          code: salesman.fcode,
          name: salesman.fname,
          fcode: salesman.fcode,
          fname: salesman.fname
        }));
      }
      
      // Apply search filter
      let filtered = salesmanData;
      if (search) {
        filtered = salesmanData.filter(salesman => 
          (salesman.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (salesman.code || '').includes(search)
        );
      }
      
      // Pagination
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      const paginatedData = filtered.slice(startIndex, endIndex);
      
      // Store the full list for reference
      if (page === 1 && !search) {
        setSalesmanList(salesmanData);
      }
      
      return paginatedData;
    } catch (err) {
      console.error('Error fetching salesman list:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch customer list from API
  const fetchCustomers = useCallback(async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      
      const response = await axiosInstance.get(
        API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getCustomers()
      );
      
      let customerData = [];
      if (response && response.data) {
        customerData = response.data.map(customer => ({
          id: customer.code,
          code: customer.code,
          name: customer.name
        }));
      }
      
      // Apply search filter
      let filtered = customerData;
      if (search) {
        filtered = customerData.filter(customer => 
          (customer.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (customer.code || '').includes(search)
        );
      }
      
      // Pagination
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      const paginatedData = filtered.slice(startIndex, endIndex);
      
      // Store the full list for reference
      if (page === 1 && !search) {
        setCustomerList(customerData);
      }
      
      return paginatedData;
    } catch (err) {
      console.error('Error fetching customer list:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch items from API
  const fetchItems = useCallback(async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      
      const response = await axiosInstance.get(
        API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getItemDropdown(page, 10, search)
      );
      
      let itemData = [];
      if (response && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          itemData = response.data.data.map(item => ({
            id: item.fItemcode || item.code || item.id,
            itemCode: item.fItemcode || item.code || '',
            itemName: item.fItemName || item.name || item.itemName || '',
            barcode: '',
            stock: 0,
            mrp: '0',
            uom: 'P',
            hsn: '',
            tax: '0',
            sRate: '0',
            rate: '0'
          }));
        } else if (Array.isArray(response.data)) {
          itemData = response.data.map(item => ({
            id: item.fItemcode || item.code || item.id,
            itemCode: item.fItemcode || item.code || '',
            itemName: item.fItemName || item.name || item.itemName || '',
            barcode: '',
            stock: 0,
            mrp: '0',
            uom: 'P',
            hsn: '',
            tax: '0',
            sRate: '0',
            rate: '0'
          }));
        }
      }
      
      // Apply search filter
      let filtered = itemData;
      if (search && itemData.length > 0) {
        filtered = itemData.filter(item => 
          (item.itemName || '').toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Pagination
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      const paginatedData = filtered.slice(startIndex, endIndex);
      
      // Store the full list for reference
      if (page === 1 && !search) {
        setItemList(itemData);
      }
      
      return paginatedData;
    } catch (err) {
      console.error('Error fetching items:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch next bill number from API
  const fetchNextBillNo = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getNextBillNo("001")
      );
      
      if (response && response.data) {
        let nextBillNo = '';
        if (typeof response.data === 'object' && response.data.nextCode) {
          nextBillNo = response.data.nextCode;
        } else if (typeof response.data === 'string') {
          nextBillNo = response.data;
        }
        
        setBillDetails(prev => ({
          ...prev,
          billNo: nextBillNo || ''
        }));
        
        if (nextBillNo) {
          localStorage.setItem('lastBillNo', nextBillNo);
        }
      }
    } catch (err) {
      console.error('Error fetching next bill number:', err);
      const lastBillNo = localStorage.getItem('lastBillNo') || 'SI000000';
      const match = lastBillNo.match(/(\D+)(\d+)/);
      
      if (match) {
        const prefix = match[1];
        const number = parseInt(match[2]) + 1;
        const newBillNo = prefix + number.toString().padStart(6, '0');
        
        setBillDetails(prev => ({
          ...prev,
          billNo: newBillNo
        }));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize - fetch all data on component mount
  useEffect(() => {
    fetchNextBillNo();
    fetchSalesmanList(1, '');
    fetchCustomers(1, '');
    fetchItems(1, '');
  }, [fetchNextBillNo, fetchSalesmanList, fetchCustomers, fetchItems]);

  // Calculate Totals whenever items change
  useEffect(() => {
    const qtyTotal = items.reduce((acc, item) => acc + (parseFloat(item.qty || 0) || 0), 0);
    const amountTotal = items.reduce((acc, item) => acc + (parseFloat(item.amount || 0) || 0), 0);
    
    setTotalQty(qtyTotal);
    setTotalAmount(amountTotal);
  }, [items]);

  // Calculate amount when qty or sRate changes
  const calculateAmount = (qty, sRate) => {
    const qtyNum = parseFloat(qty || 0);
    const sRateNum = parseFloat(sRate || 0);
    return (qtyNum * sRateNum).toFixed(2);
  };

  // Get stock by item name
  const getStockByItemName = async (itemCode) => {
    if (!itemCode || itemCode.trim() === '') {
      return { 
        stock: 0,
        itemName: '',
        mrp: '0',
        uom: 'P',
        hsn: '',
        tax: '0',
        rate: '0'
      };
    }
    
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getStockByItemName1(itemCode)
      );
      return response.data || {};
    } catch (err) {
      console.warn('Error fetching stock from alternate endpoint:', err.message);
      
      try {
        const altResponse = await axiosInstance.get(
          `Salesinvoices/GetStockByItemName?itemcode=${itemCode}`
        );
        return altResponse.data || {};
      } catch (altErr) {
        console.warn('Error fetching stock from any endpoint:', altErr.message);
        return { 
          stock: 0,
          itemName: '',
          mrp: '0',
          uom: 'P',
          hsn: '',
          tax: '0',
          rate: '0'
        };
      }
    }
  };

  // NEW: Fetch invoice details for editing
  const fetchInvoiceDetails = async (invoiceNo) => {
    try {
      setIsLoading(true);
      
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.getInvoiceDetails}/${invoiceNo}`
      );
      
      if (response && response.data) {
        const invoiceData = response.data;
        
        // Set header details
        setBillDetails({
          billNo: invoiceData.voucherNo || '',
          billDate: invoiceData.voucherDate || new Date().toISOString().substring(0, 10),
          mobileNo: invoiceData.mobileNumber || '',
          type: invoiceData.selesType === 'R' ? 'Retail' : 'Wholesale',
          salesman: invoiceData.salesmanName || '',
          salesmanCode: invoiceData.salesmanCode || '',
          custName: invoiceData.customerName || '',
          custCode: invoiceData.customercode || '',
          barcodeInput: '',
          partyCode: invoiceData.customercode || '',
          gstno: '',
          city: '',
          transType: 'SALES INVOICE'
        });
        
        // Set items if available
        if (invoiceData.items && Array.isArray(invoiceData.items)) {
          const formattedItems = invoiceData.items.map((item, index) => ({
            id: index + 1,
            sNo: index + 1,
            barcode: item.barcode || item.itemcode || '',
            itemName: item.itemName || '',
            itemCode: item.itemcode || '',
            stock: item.stock || '0',
            mrp: item.mrp || '0',
            uom: item.uom || 'P',
            hsn: item.hsn || '',
            tax: item.tax || '0',
            sRate: item.rate || '0',
            qty: item.qty || '',
            amount: item.amount || '0.00'
          }));
          
          setItems(formattedItems.length > 0 ? formattedItems : [{
            id: 1,
            sNo: 1,
            barcode: '',
            itemName: '',
            itemCode: '',
            stock: '',
            mrp: '',
            uom: 'P',
            hsn: '',
            tax: '',
            sRate: '',
            qty: '',
            amount: '0.00'
          }]);
        }
        
        return invoiceData;
      }
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Delete invoice from database
  const deleteInvoice = async (invoiceNo) => {
    try {
      setIsLoading(true);
      
      const response = await axiosInstance.delete(
        `${API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.deleteInvoice}/${invoiceNo}`
      );
      
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('Error deleting invoice:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Save sales invoice to API
  const saveSalesInvoice = async () => {
    if (isSaving) {
      console.log('Save already in progress, ignoring duplicate call');
      return;
    }
    
    try {
      setIsSaving(true);
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!billDetails.custName || billDetails.custName.trim() === '') {
        // NEW: Show message only if not already shown
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

      // Format date
      let voucherDate = billDetails.billDate;
      try {
        const dateObj = new Date(billDetails.billDate);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          voucherDate = `${year}-${month}-${day}`;
        } else {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          voucherDate = `${year}-${month}-${day}`;
        }
      } catch (dateErr) {
        console.error('Error formatting date:', dateErr);
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        voucherDate = `${year}-${month}-${day}`;
      }

      const limitString = (str, maxLength = 100) => {
        if (!str) return '';
        return String(str).substring(0, maxLength);
      };

      // Prepare header data
      const headerData = {
        voucherNo: limitString(billDetails.billNo, 50),
        voucherDate: voucherDate,
        mobileNumber: limitString(billDetails.mobileNo, 20),
        salesmanName: limitString(billDetails.salesman, 100),
        salesmanCode: limitString(billDetails.salesmanCode, 20),
        salesCode: '001',
        selesType: billDetails.type === 'Retail' ? 'R' : 'W',
        customerName: limitString(billDetails.custName, 200),
        customercode: limitString(billDetails.custCode || billDetails.partyCode || 'CUST001', 50),
        compCode: '001',
        billAmount: parseFloat(totalAmount) || 0,
        balanceAmount: 0,
        userCode: '001',
        addLess: '0.00'
      };

      // Prepare items data
      const itemsData = validItems.map(item => {
        const qty = parseFloat(item.qty || 0) || 0;
        const rate = parseFloat(item.sRate || 0) || 0;
        const amount = parseFloat(item.amount || 0) || 0;
        const mrp = parseFloat(item.mrp || 0) || 0;
        const stock = parseFloat(item.stock || 0) || 0;
        const tax = parseFloat(item.tax || 0) || 0;
        
        return {
          barcode: limitString(item.barcode, 50),
          itemName: limitString(item.itemName, 200),
          itemcode: limitString(item.itemCode || item.barcode, 50),
          mrp: mrp.toFixed(2),
          stock: stock.toString(),
          uom: limitString(item.uom, 20),
          hsn: limitString(item.hsn, 20),
          tax: tax,
          rate: rate,
          qty: qty,
          amount: amount
        };
      });

      const requestData = {
        header: headerData,
        items: itemsData
      };

      const isUpdate = false;
      const endpoint = API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.createSales(isUpdate);
      
      const response = await axiosInstance.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      if (response && response.data) {
        const message = response.data.message || 'Invoice saved successfully';
        alert(`${message}\nInvoice No: ${billDetails.billNo}`);
        
        localStorage.setItem('lastBillNo', billDetails.billNo);
        
        await handleClear();
        await fetchNextBillNo();
        
        return response.data;
      }
    } catch (err) {
      console.error('Full error details:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMsg = 'Failed to save sales invoice';
      
      if (err.response) {
        if (err.response.data) {
          if (err.response.data.message) {
            errorMsg = err.response.data.message;
            
            if (errorMsg.includes('truncated') || errorMsg.includes('String or binary data')) {
              errorMsg = `Database Error: Data too long for one or more fields.\n\n` +
                        `Possible causes:\n` +
                        `1. Item names too long\n` +
                        `2. Barcode too long\n` +
                        `3. Customer name too long\n` +
                        `4. Other text fields exceeding column limits`;
            }
          }
        }
        errorMsg = `${errorMsg} (Status: ${err.response.status})`;
      } else if (err.request) {
        errorMsg = 'No response from server. Please check your connection.';
        console.error('No response received:', err.request);
      } else {
        errorMsg = err.message || errorMsg;
        console.error('Request setup error:', err.message);
      }
      
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
      setIsSaving(false);
      // NEW: Reset customer message flag
      setCustomerMessageShown(false);
    }
  };

  // --- POPUP HANDLERS ---

  // Handle salesman selection from popup
  const handleSalesmanSelect = (salesman) => {
    if (!salesman) return;
    
    setBillDetails(prev => ({
      ...prev,
      salesman: salesman.name || salesman.fname || '',
      salesmanCode: salesman.code || salesman.fcode || ''
    }));
    setSalesmanPopupOpen(false);
    setSalesmanSearch('');
  };

  // Handle customer selection from popup
  const handleCustomerSelect = (customer) => {
    if (!customer) return;
    
    setBillDetails(prev => ({
      ...prev,
      custName: customer.name || '',
      custCode: customer.code || '',
      partyCode: customer.code || ''
    }));
    setCustomerPopupOpen(false);
    setCustomerSearch('');
  };

  // Handle item selection from popup
  const handleItemSelect = async (item) => {
    if (!item) return;
    
    const itemCode = item.itemCode || '';
    const itemName = item.itemName || '';
    
    if (!itemCode.trim() && !itemName.trim()) {
      alert('Selected item has no item code or name. Please select a valid item.');
      return;
    }
    
    setItems(prevItems => {
      const newItems = [...prevItems];
      const currentItem = newItems[currentItemRowIndex];
      
      const searchParam = itemCode || itemName;
      if (searchParam) {
        getStockByItemName(searchParam).then(stockInfo => {
          const updatedItem = {
            ...currentItem,
            barcode: itemCode || '',
            itemCode: itemCode || '',
            itemName: itemName || stockInfo.itemName || '',
            stock: stockInfo.stock || '0',
            mrp: stockInfo.mrp || '0',
            uom: stockInfo.uom || 'P',
            hsn: stockInfo.hsn || '',
            tax: stockInfo.tax || '0',
            sRate: stockInfo.rate || '0',
            qty: currentItem.qty || '1',
            amount: calculateAmount(currentItem.qty || '1', stockInfo.rate || '0')
          };
          
          newItems[currentItemRowIndex] = updatedItem;
          setItems(newItems);
        }).catch(err => {
          console.warn('Could not fetch item details:', err.message);
          const updatedItem = {
            ...currentItem,
            barcode: itemCode || '',
            itemCode: itemCode || '',
            itemName: itemName || '',
            stock: '0',
            mrp: '0',
            uom: 'P',
            hsn: '',
            tax: '0',
            sRate: '0',
            qty: currentItem.qty || '1',
            amount: calculateAmount(currentItem.qty || '1', '0')
          };
          
          newItems[currentItemRowIndex] = updatedItem;
          setItems(newItems);
        });
      } else {
        const updatedItem = {
          ...currentItem,
          itemName: itemName || '',
          qty: currentItem.qty || '1',
          amount: calculateAmount(currentItem.qty || '1', currentItem.sRate || '0')
        };
        
        newItems[currentItemRowIndex] = updatedItem;
        setItems(newItems);
      }
      
      return newItems;
    });
    setItemPopupOpen(false);
    setItemSearch('');
  };

  // Handle customer deletion from popup
  const handleCustomerDelete = async (customer) => {
    if (!customer) return;
    
    if (window.confirm(`Are you sure you want to delete customer: ${customer.name}?`)) {
      try {
        setIsLoading(true);
        
        // NEW: Call API to delete customer
        const response = await axiosInstance.delete(
          `${API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.deleteCustomer}/${customer.code}`
        );
        
        if (response && response.data) {
          if (billDetails.custCode === customer.code) {
            setBillDetails(prev => ({
              ...prev,
              custName: '',
              custCode: '',
              mobileNo: '',
              gstno: '',
              city: '',
              partyCode: ''
            }));
          }
          
          // Refresh customer list
          fetchCustomers(1, '');
          setDeleteCustomerPopupOpen(false);
          alert('Customer deleted successfully from database!');
        }
      } catch (err) {
        console.error('Error deleting customer:', err);
        alert('Failed to delete customer from database');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle item deletion from popup
  const handleItemDelete = async (item) => {
    if (!item) return;
    
    if (window.confirm(`Are you sure you want to delete item: ${item.itemName}?`)) {
      try {
        setIsLoading(true);
        
        // NEW: Call API to delete item
        const response = await axiosInstance.delete(
          `${API_ENDPOINTS.SALES_INVOICE_ENDPOINTS.deleteItem}/${item.itemCode}`
        );
        
        if (response && response.data) {
          const itemExists = items.some(i => i.itemCode === item.itemCode || i.itemName === item.itemName);
          if (itemExists) {
            const filteredItems = items.filter(i => i.itemCode !== item.itemCode && i.itemName !== item.itemName);
            const updatedItems = filteredItems.map((item, index) => ({
              ...item,
              id: index + 1,
              sNo: index + 1
            }));
            setItems(updatedItems.length > 0 ? updatedItems : [{
              id: 1,
              sNo: 1,
              barcode: '',
              itemName: '',
              itemCode: '',
              stock: '',
              mrp: '',
              uom: 'P',
              hsn: '',
              tax: '',
              sRate: '',
              qty: '',
              amount: '0.00'
            }]);
          }
          
          // Refresh item list
          fetchItems(1, '');
          setDeleteItemPopupOpen(false);
          alert('Item deleted successfully from database!');
        }
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Failed to delete item from database');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // NEW: Handle invoice selection for editing
  const handleInvoiceSelect = async (invoice) => {
    if (!invoice) return;
    
    try {
      setIsLoading(true);
      await fetchInvoiceDetails(invoice.invoiceNo);
      alert(`Invoice ${invoice.invoiceNo} loaded successfully!`);
    } catch (err) {
      console.error('Error loading invoice:', err);
      alert('Failed to load invoice details');
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Handle invoice deletion
  const handleInvoiceDelete = async (invoice) => {
    if (!invoice) return;
    
    if (window.confirm(`Are you sure you want to delete invoice: ${invoice.invoiceNo}?`)) {
      try {
        setIsLoading(true);
        await deleteInvoice(invoice.invoiceNo);
        alert(`Invoice ${invoice.invoiceNo} deleted successfully from database!`);
      } catch (err) {
        console.error('Error deleting invoice:', err);
        alert('Failed to delete invoice from database');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Open salesman popup with search
  const openSalesmanPopup = (search = '') => {
    setSalesmanSearch(search);
    setSalesmanPopupOpen(true);
  };

  // Open customer popup with search
  const openCustomerPopup = (search = '') => {
    setCustomerSearch(search);
    setCustomerPopupOpen(true);
  };

  // Open item popup for specific row with search
  const openItemPopup = (rowIndex, search = '') => {
    setCurrentItemRowIndex(rowIndex);
    setItemSearch(search);
    setItemPopupOpen(true);
  };

  // Open delete customer popup
  const openDeleteCustomerPopup = () => {
    if (!billDetails.custName) {
      alert('Please select a customer first');
      return;
    }
    
    setDeleteCustomerPopupOpen(true);
  };

  // Open delete item popup
  const openDeleteItemPopup = () => {
    if (items.length === 0) {
      alert('No items to delete');
      return;
    }
    
    setDeleteItemPopupOpen(true);
  };

  // NEW: Open edit invoice popup
  const openEditInvoicePopup = () => {
    // You can customize this to show saved invoices
    alert('Edit Invoice feature - would show saved invoices here');
    // For now, we'll open a custom popup or you can modify PopupListSelector
  };

  // NEW: Open delete invoice popup
  const openDeleteInvoicePopup = () => {
    alert('Delete Invoice feature - would show saved invoices here');
    // For now, we'll open a custom popup or you can modify PopupListSelector
  };

  // --- HANDLERS FOR ADD/EDIT/DELETE BUTTONS ---

  const handleAddCustomer = () => {
    setCustomerPopupMode('add');
    openCustomerPopup();
  };

  const handleEditCustomer = () => {
    if (!billDetails.custName) {
      alert('Please select a customer first');
      return;
    }
    setCustomerPopupMode('edit');
    openCustomerPopup();
  };

  const handleDeleteCustomer = () => {
    openDeleteCustomerPopup();
  };

  const handleAddItem = () => {
    handleAddRow();
  };

  const handleEditItem = () => {
    if (items.length === 0) {
      alert('Please add an item first');
      return;
    }
    setItemPopupMode('edit');
    openItemPopup(0);
  };

  const handleDeleteItem = () => {
    openDeleteItemPopup();
  };

  // NEW: Handle edit invoice
  const handleEditInvoice = () => {
    openEditInvoicePopup();
  };

  // NEW: Handle delete invoice
  const handleDeleteInvoice = () => {
    openDeleteInvoicePopup();
  };

  // --- HANDLERS ---

  // Handle input change with search and popup opening
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillDetails(prev => ({ 
      ...prev, 
      [name]: value || ''
    }));

    // Automatically open popup and search when typing
    if (name === 'salesman' && value.trim()) {
      setSalesmanSearch(value);
      if (!salesmanPopupOpen) {
        setSalesmanPopupOpen(true);
      }
    } else if (name === 'custName' && value.trim()) {
      setCustomerSearch(value);
      if (!customerPopupOpen) {
        setCustomerPopupOpen(true);
      }
    }
  };

  // Handle UOM field key down for spacebar toggle
  const handleUomKeyDown = (e, id) => {
    if (e.key === ' ') {
      e.preventDefault();
      setItems(items.map(item => {
        if (item.id === id) {
          const currentUom = item.uom || 'P';
          const newUom = currentUom === 'P' ? 'K' : 'P';
          return { ...item, uom: newUom };
        }
        return item;
      }));
    }
  };

  // Handle item name key down for "?" and spacebar
  const handleItemNameKeyDown = (e, index) => {
    if (e.key === '?' || e.key === ' ') {
      e.preventDefault();
      openItemPopup(index, e.target.value);
    }
  };

  // Handle salesman/customer key down for "?" and "/"
  const handleSalesmanCustomerKeyDown = (e, field) => {
    if (e.key === '?' || e.key === '/') {
      e.preventDefault();
      if (field === 'salesman') {
        openSalesmanPopup(e.target.value);
      } else if (field === 'custName') {
        openCustomerPopup(e.target.value);
      }
    }
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

  // Handle add item from barcode
  const handleAddItemFromBarcode = async () => {
    if (!billDetails.barcodeInput || billDetails.barcodeInput.trim() === '') {
      alert("Please enter a valid barcode");
      return;
    }
    
    try {
      setIsLoading(true);
      const stockInfo = await getStockByItemName(billDetails.barcodeInput);
      
      const newItem = {
        id: items.length + 1,
        sNo: items.length + 1,
        barcode: billDetails.barcodeInput || '',
        itemCode: billDetails.barcodeInput || '',
        itemName: stockInfo.itemName || 'Item from Barcode',
        stock: stockInfo.stock || '0',
        mrp: stockInfo.mrp || '0',
        uom: stockInfo.uom || 'P',
        hsn: stockInfo.hsn || '',
        tax: stockInfo.tax || '0',
        sRate: stockInfo.rate || '0',
        qty: '1',
        amount: calculateAmount('1', stockInfo.rate || '0')
      };
      
      setItems([...items, newItem]);
      setBillDetails(prev => ({ ...prev, barcodeInput: '' }));
      if (barcodeRef.current) barcodeRef.current.focus();
    } catch (err) {
      console.error('Error adding item from barcode:', err);
      alert('Could not find item with this barcode');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: items.length + 1,
      sNo: items.length + 1,
      barcode: '',
      itemCode: '',
      itemName: '',
      stock: '',
      mrp: '',
      uom: 'P',
      hsn: '',
      tax: '',
      sRate: '',
      qty: '',
      amount: '0.00'
    };
    setItems([...items, newRow]);
  };

  // Handle item change
  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { 
          ...item, 
          [field]: value || ''
        };
        
        // Recalculate amount if qty or sRate changes
        if (field === 'qty' || field === 'sRate') {
          const qty = field === 'qty' ? value : updatedItem.qty;
          const sRate = field === 'sRate' ? value : updatedItem.sRate;
          updatedItem.amount = calculateAmount(qty || '0', sRate || '0');
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleTableKeyDown = (e, currentRowIndex, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const fields = ['barcode', 'itemName', 'stock', 'mrp', 'uom', 'hsn', 'tax', 'sRate', 'qty'];
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

  const handleDelete = () => {
    if(items.length > 0) {
      setItems(items.slice(0, -1));
    }
  };

  // Handle delete row
  const handleDeleteRow = (id) => {
    if (items.length > 1) {
      const filteredItems = items.filter(item => item.id !== id);
      const updatedItems = filteredItems.map((item, index) => ({
        ...item,
        id: index + 1,
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
        uom: 'P',
        hsn: '',
        tax: '',
        sRate: '',
        qty: '',
        amount: '0.00'
      };
      setItems([clearedItem]);
    }
  };

  const handleClear = async () => {
    setBillDetails({
      billNo: '',
      billDate: new Date().toISOString().substring(0, 10),
      mobileNo: '',
      type: 'Retail',
      salesman: '',
      salesmanCode: '',
      custName: '',
      custCode: '',
      barcodeInput: '',
      partyCode: '',
      gstno: '',
      city: '',
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
        uom: 'P', 
        hsn: '', 
        tax: '', 
        sRate: '', 
        qty: '',
        amount: '0.00'
      }
    ]);
    
    await fetchNextBillNo();
  };

  // Function to show save confirmation popup
  const showSaveConfirmation = () => {
    if (isSaving) {
      console.log('Save already in progress');
      return;
    }
    
    if (!billDetails.custName) {
      // NEW: Show message only once
      if (!customerMessageShown) {
        setCustomerMessageShown(true);
        alert('Please select a customer');
      }
      return;
    }
    
    if (items.length === 0 || items.every(item => !item.itemName || parseFloat(item.qty || 0) <= 0)) {
      alert('Please add at least one item with quantity');
      return;
    }
    
    // Set confirmation data
    setSaveConfirmationData({
      invoiceNo: billDetails.billNo,
      customer: billDetails.custName,
      totalAmount: totalAmount.toFixed(2)
    });
    
    // Open confirmation popup
    setSaveConfirmationOpen(true);
  };

  // Function to handle confirmed save
  const handleConfirmedSave = async () => {
    setSaveConfirmationOpen(false);
    await saveSalesInvoice();
  };

  // Function to cancel save
  const handleCancelSave = () => {
    setSaveConfirmationOpen(false);
    setSaveConfirmationData(null);
  };

  // Handle save function - shows confirmation popup
  const handleSave = () => {
    showSaveConfirmation();
  };

  const handlePrint = () => {
    const printData = {
      header: {
        invoiceNo: billDetails.billNo,
        date: billDetails.billDate,
        customer: billDetails.custName,
        mobile: billDetails.mobileNo,
        salesman: billDetails.salesman
      },
      items: items.filter(item => item.itemName && parseFloat(item.qty || 0) > 0),
      totals: {
        quantity: totalQty,
        amount: totalAmount
      }
    };
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${billDetails.billNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-no { font-size: 24px; font-weight: bold; }
            .customer-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SALES INVOICE</h1>
            <div class="invoice-no">Invoice No: ${billDetails.billNo}</div>
            <div>Date: ${billDetails.billDate}</div>
          </div>
          
          <div class="customer-info">
            <div><strong>Customer:</strong> ${billDetails.custName}</div>
            <div><strong>Mobile:</strong> ${billDetails.mobileNo}</div>
            <div><strong>Salesman:</strong> ${billDetails.salesman}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Tax%</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.filter(item => item.itemName && parseFloat(item.qty || 0) > 0)
                .map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.itemName || ''}</td>
                    <td>${item.hsn || '-'}</td>
                    <td>${item.qty || '0'}</td>
                    <td>₹${parseFloat(item.sRate || 0).toFixed(2)}</td>
                    <td>${item.tax || 0}%</td>
                    <td>₹${parseFloat(item.amount || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            Total Amount: ₹${totalAmount.toFixed(2)}
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  // Helper function to get padding values
  const getInputPadding = () => {
    if (screenSize.isMobile) {
      return {
        paddingTop: '5px',
        paddingRight: '6px',
        paddingBottom: '5px',
        paddingLeft: '6px'
      };
    } else if (screenSize.isTablet) {
      return {
        paddingTop: '6px',
        paddingRight: '8px',
        paddingBottom: '6px',
        paddingLeft: '8px'
      };
    } else {
      return {
        paddingTop: '8px',
        paddingRight: '10px',
        paddingBottom: '8px',
        paddingLeft: '10px'
      };
    }
  };

  const getEditableInputPadding = () => {
    if (screenSize.isMobile) {
      return {
        paddingTop: '2px',
        paddingRight: '3px',
        paddingBottom: '2px',
        paddingLeft: '3px'
      };
    } else if (screenSize.isTablet) {
      return {
        paddingTop: '3px',
        paddingRight: '5px',
        paddingBottom: '3px',
        paddingLeft: '5px'
      };
    } else {
      return {
        paddingTop: '4px',
        paddingRight: '6px',
        paddingBottom: '4px',
        paddingLeft: '6px'
      };
    }
  };

  // Styles for save confirmation popup
  const getSaveConfirmationStyles = () => {
    const popupStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    };

    const modalStyle = {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: screenSize.isMobile ? '20px' : '30px',
      maxWidth: screenSize.isMobile ? '90%' : '500px',
      width: '100%',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      fontFamily: TYPOGRAPHY.fontFamily,
      maxHeight: '80vh',
      overflowY: 'auto'
    };

    const titleStyle = {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      marginBottom: '20px',
      color: '#1B91DA',
      textAlign: 'center'
    };

    const contentStyle = {
      marginBottom: '30px',
      lineHeight: TYPOGRAPHY.lineHeight.normal
    };

    const infoRowStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px',
      paddingBottom: '8px',
      borderBottom: '1px solid #eee'
    };

    const labelStyle = {
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#666'
    };

    const valueStyle = {
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: '#333'
    };

    const totalStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '15px',
      paddingTop: '15px',
      borderTop: '2px solid #1B91DA',
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold
    };

    const buttonContainerStyle = {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center',
      marginTop: '20px'
    };

    const buttonStyle = {
      padding: '12px 24px',
      borderRadius: '6px',
      border: 'none',
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      cursor: 'pointer',
      minWidth: '120px',
      transition: 'all 0.2s ease'
    };

    const confirmButtonStyle = {
      ...buttonStyle,
      backgroundColor: '#1B91DA',
      color: 'white'
    };

    const cancelButtonStyle = {
      ...buttonStyle,
      backgroundColor: '#f5f5f5',
      color: '#666',
      border: '1px solid #ddd'
    };

    return {
      popupStyle,
      modalStyle,
      titleStyle,
      contentStyle,
      infoRowStyle,
      labelStyle,
      valueStyle,
      totalStyle,
      buttonContainerStyle,
      confirmButtonStyle,
      cancelButtonStyle
    };
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
      paddingTop: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '16px',
      paddingRight: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '16px',
      paddingBottom: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '16px',
      paddingLeft: screenSize.isMobile ? '10px' : screenSize.isTablet ? '14px' : '16px',
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
      ...getInputPadding(),
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
    formSelect: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      ...getInputPadding(),
      border: '1px solid #ddd',
      borderRadius: screenSize.isMobile ? '3px' : '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease',
      outline: 'none',
      width: '100%',
      height: screenSize.isMobile ? '32px' : screenSize.isTablet ? '36px' : '40px',
      flex: 1,
      minWidth: screenSize.isMobile ? '80px' : '100px',
      backgroundColor: 'white',
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
      marginTop: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
      marginBottom: screenSize.isMobile ? '70px' : screenSize.isTablet ? '80px' : '90px',
      marginLeft: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '16px',
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
      paddingTop: screenSize.isMobile ? '5px' : screenSize.isTablet ? '7px' : '10px',
      paddingRight: screenSize.isMobile ? '3px' : screenSize.isTablet ? '5px' : '6px',
      paddingBottom: screenSize.isMobile ? '5px' : screenSize.isTablet ? '7px' : '10px',
      paddingLeft: screenSize.isMobile ? '3px' : screenSize.isTablet ? '5px' : '6px',
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
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
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
      ...getEditableInputPadding(),
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
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
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
      paddingTop: 0,
      paddingRight: screenSize.isMobile ? '6px' : screenSize.isTablet ? '10px' : '15px',
      paddingBottom: 0,
      paddingLeft: 0,
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
      paddingTop: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '8px',
      paddingRight: screenSize.isMobile ? '4px' : screenSize.isTablet ? '6px' : '10px',
      paddingBottom: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '8px',
      paddingLeft: screenSize.isMobile ? '4px' : screenSize.isTablet ? '6px' : '10px',
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
      paddingTop: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingRight: screenSize.isMobile ? '8px' : screenSize.isTablet ? '12px' : '16px',
      paddingBottom: screenSize.isMobile ? '6px' : screenSize.isTablet ? '8px' : '10px',
      paddingLeft: screenSize.isMobile ? '8px' : screenSize.isTablet ? '12px' : '16px',
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
    totalsRow: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      backgroundColor: '#e8f4fc',
      borderTop: '2px solid #1B91DA',
    },
    loadingIndicator: {
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: '#1B91DA',
      color: 'white',
      paddingTop: '5px',
      paddingRight: '10px',
      paddingBottom: '5px',
      paddingLeft: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 1000,
    },
    errorIndicator: {
      position: 'fixed',
      top: '10px',
      left: '10px',
      backgroundColor: '#ff4444',
      color: 'white',
      paddingTop: '5px',
      paddingRight: '10px',
      paddingBottom: '5px',
      paddingLeft: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 1000,
    }
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

  // Helper function for form change handling
  const handleFormChange = (fieldName) => (e) => {
    const value = e.target.value;
    setBillDetails(prev => ({ ...prev, [fieldName]: value || '' }));
  };

  // Helper function for form key down handling
  const handleFormKeyDown = (fieldName, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const navigationOrder = ['billNo', 'billDate', 'mobileNo', 'type', 'salesman', 'custName', 'barcodeInput'];
      const currentIndex = navigationOrder.indexOf(fieldName);
      
      if (currentIndex < navigationOrder.length - 1) {
        const nextField = navigationOrder[currentIndex + 1];
        const nextRef = {
          'billNo': billNoRef,
          'billDate': billDateRef,
          'mobileNo': mobileRef,
          'type': typeRef,
          'salesman': salesmanRef,
          'custName': custNameRef,
          'barcodeInput': barcodeRef
        }[nextField];
        
        if (nextRef && nextRef.current) {
          nextRef.current.focus();
        }
      } else if (fieldName === 'barcodeInput') {
        handleAddItemFromBarcode();
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Loading Indicator */}
      {isLoading && (
        <div style={styles.loadingIndicator}>
          Loading...
        </div>
      )}
      
      {/* Error Indicator */}
      {error && (
        <div style={styles.errorIndicator} onClick={() => setError(null)}>
          {error} (click to dismiss)
        </div>
      )}

      {/* --- HEADER SECTION --- */}
      <div style={styles.headerSection}>
        <div style={{
          ...styles.gridRow,
          gridTemplateColumns: getGridColumns(),
        }}>
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill No:</label>
            <input 
              type="text"
              style={styles.inlineInput}
              value={billDetails.billNo || ''}
              name="billNo"
              onChange={handleInputChange}
              ref={billNoRef}
              onKeyDown={(e) => handleKeyDown(e, billDateRef)}
              onFocus={() => setFocusedField('billNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Bill No"
              readOnly
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Bill Date:</label>
            <input
              type="date"
              style={styles.inlineInput}
              value={billDetails.billDate || ''}
              name="billDate"
              onChange={handleInputChange}
              ref={billDateRef}
              onKeyDown={(e) => handleKeyDown(e, mobileRef)}
              onFocus={() => setFocusedField('billDate')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Mobile No:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={billDetails.mobileNo || ''}
              name="mobileNo"
              onChange={handleInputChange}
              ref={mobileRef}
              onKeyDown={(e) => handleKeyDown(e, typeRef)}
              onFocus={() => setFocusedField('mobileNo')}
              onBlur={() => setFocusedField('')}
              placeholder="Mobile No"
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Type:</label>
            <select
              name="type"
              style={styles.formSelect}
              value={billDetails.type || 'Retail'}
              onChange={handleFormChange('type')}
              ref={typeRef}
              onKeyDown={(e) => handleFormKeyDown('type', e)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1976d2';
                setFocusedField('type');
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                setFocusedField('');
              }}
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
          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Salesman:</label>
            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
              <input
                type="text"
                style={{
                  ...styles.inlineInput,
                  borderColor: focusedField === 'salesman' ? '#1976d2' : '#ddd',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  paddingTop: getInputPadding().paddingTop,
                  paddingRight: '30px',
                  paddingBottom: getInputPadding().paddingBottom,
                  paddingLeft: getInputPadding().paddingLeft
                }}
                value={billDetails.salesman || ''}
                name="salesman"
                onChange={handleInputChange}
                ref={salesmanRef}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleKeyDown(e, custNameRef);
                  }
                }}
                onClick={() => openSalesmanPopup(billDetails.salesman)}
                onFocus={() => setFocusedField('salesman')}
                onBlur={() => setFocusedField('')}
                placeholder=" Salesman "
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#666',
                  paddingTop: '0',
                  paddingRight: '0',
                  paddingBottom: '0',
                  paddingLeft: '0'
                }}
                onClick={() => openSalesmanPopup(billDetails.salesman)}
                aria-label="Select salesman"
              >
                ▼
              </button>
            </div>
          </div>

          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Customer:</label>
            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
              <input
                type="text"
                style={{
                  ...styles.inlineInput,
                  borderColor: focusedField === 'custName' ? '#1976d2' : '#ddd',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  paddingTop: getInputPadding().paddingTop,
                  paddingRight: '30px',
                  paddingBottom: getInputPadding().paddingBottom,
                  paddingLeft: getInputPadding().paddingLeft
                }}
                value={billDetails.custName || ''}
                name="custName"
                onChange={handleInputChange}
                ref={custNameRef}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleKeyDown(e, barcodeRef);
                  }
                }}
                onClick={() => openCustomerPopup(billDetails.custName)}
                onFocus={() => setFocusedField('custName')}
                onBlur={() => setFocusedField('')}
                placeholder=" Customer "
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#666',
                  paddingTop: '0',
                  paddingRight: '0',
                  paddingBottom: '0',
                  paddingLeft: '0'
                }}
                onClick={() => openCustomerPopup(billDetails.custName)}
                aria-label="Select customer"
              >
                ▼
              </button>
            </div>
          </div>

          <div style={styles.formField}>
            <label style={styles.inlineLabel}>Barcode:</label>
            <input
              type="text"
              style={styles.inlineInput}
              value={billDetails.barcodeInput || ''}
              name="barcodeInput"
              onChange={handleInputChange}
              ref={barcodeRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItemFromBarcode();
                }
              }}
              onFocus={() => setFocusedField('barcodeInput')}
              onBlur={() => setFocusedField('')}
              placeholder="Barcode"
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
                <th style={styles.th}>Tax (%)</th>
                <th style={styles.th}>Rate</th>
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
                      value={item.barcode || ''}
                      data-row={index}
                      data-field="barcode"
                      onChange={(e) => handleItemChange(item.id, 'barcode', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'barcode')}
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.itemNameContainer }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                      <input
                        style={{ 
                          ...styles.editableInput, 
                          textAlign: 'left',
                          cursor: 'pointer',
                          backgroundColor: '#fff',
                          paddingTop: getEditableInputPadding().paddingTop,
                          paddingRight: '30px',
                          paddingBottom: getEditableInputPadding().paddingBottom,
                          paddingLeft: getEditableInputPadding().paddingLeft,
                          width: 'calc(100% - 30px)'
                        }}
                        value={item.itemName || ''}
                        placeholder="item name"
                        data-row={index}
                        data-field="itemName"
                        onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleTableKeyDown(e, index, 'itemName');
                          }
                        }}
                        onClick={() => openItemPopup(index, item.itemName)}
                      />
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#666',
                          paddingTop: '0',
                          paddingRight: '8px',
                          paddingBottom: '0',
                          paddingLeft: '8px',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '30px'
                        }}
                        onClick={() => openItemPopup(index, item.itemName)}
                        aria-label="Select item"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.stock || ''}
                      data-row={index}
                      data-field="stock"
                      onChange={(e) => handleItemChange(item.id, 'stock', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'stock')}
                      readOnly
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.mrp || ''}
                      data-row={index}
                      data-field="mrp"
                      onChange={(e) => handleItemChange(item.id, 'mrp', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'mrp')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.uom || 'P'}
                      data-row={index}
                      data-field="uom"
                      onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)}
                      onKeyDown={(e) => {
                        handleUomKeyDown(e, item.id);
                        if (e.key === 'Enter') {
                          handleTableKeyDown(e, index, 'uom');
                        }
                      }}
                      placeholder="Press Space to toggle P/K"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.hsn || ''}
                      data-row={index}
                      data-field="hsn"
                      onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'hsn')}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.editableInput}
                      value={item.tax || ''}
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
                      value={item.sRate || ''}
                      data-row={index}
                      data-field="sRate"
                      onChange={(e) => handleItemChange(item.id, 'sRate', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'sRate')}
                      step="0.01"
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={{...styles.editableInput, fontWeight: 'bold'}}
                      value={item.qty || ''}
                      data-row={index}
                      data-field="qty"
                      onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                      onKeyDown={(e) => handleTableKeyDown(e, index, 'qty')}
                      step="0.01"
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.amountContainer }}>
                    <input
                      style={{...styles.editableInput, textAlign: 'right', fontWeight: 'bold', color: '#1565c0', backgroundColor: '#f0f7ff'}}
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
                        paddingTop: '0',
                        paddingRight: '0',
                        paddingBottom: '0',
                        paddingLeft: '0',
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
              setActiveTopAction(type);
              if (type === 'add') {
                if (billDetails.custName) {
                  handleAddCustomer();
                } else {
                  handleAddItem();
                }
              }
              else if (type === 'edit') {
                if (billDetails.custName) {
                  handleEditCustomer();
                } else {
                  handleEditItem();
                }
              }
              else if (type === 'delete') {
                if (billDetails.custName) {
                  handleDeleteCustomer();
                } else {
                  handleDeleteItem();
                }
              }
            }}
          >
             <AddButton buttonType="add" />
              <EditButton buttonType="edit" />
              <DeleteButton buttonType="delete" />
          </ActionButtons>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: screenSize.isMobile ? '6px' : '8px',
          marginRight: screenSize.isMobile ? '0' : '15px',
          order: screenSize.isMobile ? 2 : 0,
          marginTop: screenSize.isMobile ? '5px' : '0',
          width: screenSize.isMobile ? '100%' : 'auto',
          justifyContent: screenSize.isMobile ? 'center' : 'flex-start'
        }}>
          <span style={{
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.fontSize.sm,
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            color: '#333',
            whiteSpace: 'nowrap'
          }}>
            Add/Less:
          </span>
          <input
            type="number"
            style={{
              width: screenSize.isMobile ? '120px' : '150px',
              border: '1px solid #1B91DA',
              borderRadius: '4px',
              paddingTop: screenSize.isMobile ? '6px' : '8px',
              paddingRight: screenSize.isMobile ? '10px' : '12px',
              paddingBottom: screenSize.isMobile ? '6px' : '8px',
              paddingLeft: screenSize.isMobile ? '10px' : '12px',
              fontSize: TYPOGRAPHY.fontSize.sm,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              outline: 'none',
              textAlign: 'center',
              backgroundColor: 'white',
              color: '#333',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            placeholder="Enter Qty"
            min="-999"
            max="999"
            step="1"
            defaultValue=""
            onFocus={(e) => {
              e.target.style.borderColor = '#1479c0';
              e.target.style.boxShadow = '0 0 0 2px rgba(27, 145, 218, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#1B91DA';
              e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = parseInt(e.target.value) || 0;
                
                if (value !== 0) {
                  const updatedItems = items.map(item => {
                    const currentQty = parseFloat(item.qty || 0) || 0;
                    const newQty = Math.max(0, currentQty + value);
                    return {
                      ...item,
                      qty: newQty.toString(),
                      amount: calculateAmount(newQty.toString(), item.sRate || '0')
                    };
                  });
                  setItems(updatedItems);
                  e.target.value = '';
                }
              }
            }}
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
            onButtonClick={(type) => {
              setActiveFooterAction(type);
              if (type === 'clear') handleClear();
              else if (type === 'save') handleSave();
              else if (type === 'print') handlePrint();
            }}
          />
        </div>
      </div>

      {/* --- SAVE CONFIRMATION POPUP --- */}
      {saveConfirmationOpen && saveConfirmationData && (
        <div style={getSaveConfirmationStyles().popupStyle}>
          <div style={getSaveConfirmationStyles().modalStyle}>
            <h3 style={getSaveConfirmationStyles().titleStyle}>Confirm Save Invoice</h3>
            <div style={getSaveConfirmationStyles().contentStyle}>
              <div style={getSaveConfirmationStyles().infoRowStyle}>
                <span style={getSaveConfirmationStyles().labelStyle}>Invoice No:</span>
                <span style={getSaveConfirmationStyles().valueStyle}>{saveConfirmationData.invoiceNo}</span>
              </div>
              <div style={getSaveConfirmationStyles().infoRowStyle}>
                <span style={getSaveConfirmationStyles().labelStyle}>Customer:</span>
                <span style={getSaveConfirmationStyles().valueStyle}>{saveConfirmationData.customer}</span>
              </div>
              <div style={getSaveConfirmationStyles().infoRowStyle}>
                <span style={getSaveConfirmationStyles().labelStyle}>Items Count:</span>
                <span style={getSaveConfirmationStyles().valueStyle}>
                  {items.filter(item => item.itemName && parseFloat(item.qty || 0) > 0).length} items
                </span>
              </div>
              <div style={getSaveConfirmationStyles().infoRowStyle}>
                <span style={getSaveConfirmationStyles().labelStyle}>Total Quantity:</span>
                <span style={getSaveConfirmationStyles().valueStyle}>{totalQty.toFixed(2)}</span>
              </div>
              <div style={getSaveConfirmationStyles().totalStyle}>
                <span style={getSaveConfirmationStyles().labelStyle}>Total Amount:</span>
                <span style={{...getSaveConfirmationStyles().valueStyle, color: '#1B91DA'}}>
                  ₹{saveConfirmationData.totalAmount}
                </span>
              </div>
            </div>
            <div style={getSaveConfirmationStyles().buttonContainerStyle}>
              <button 
                style={getSaveConfirmationStyles().cancelButtonStyle}
                onClick={handleCancelSave}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e5e5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              >
                Cancel
              </button>
              <button 
                style={getSaveConfirmationStyles().confirmButtonStyle}
                onClick={handleConfirmedSave}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1479c0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1B91DA'}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Confirm Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SALESMAN SELECTION POPUP --- */}
      <PopupListSelector
        open={salesmanPopupOpen}
        onClose={() => {
          setSalesmanPopupOpen(false);
          setSalesmanSearch('');
        }}
        onSelect={handleSalesmanSelect}
        fetchItems={(page) => fetchSalesmanList(page, salesmanSearch)}
        title="Select Salesman"
        displayFieldKeys={['name', 'code']}
        searchFields={['name', 'code']}
        headerNames={['Salesman Name', 'Code']}
        columnWidths={{
          name: '60%',
          code: '40%'
        }}
        searchPlaceholder="Search salesman by name or code..."
        mode="select"
        initialSearch={salesmanSearch}
        onSearchChange={(value) => setSalesmanSearch(value)}
      />

      {/* --- CUSTOMER SELECTION POPUP --- */}
      <PopupListSelector
        open={customerPopupOpen}
        onClose={() => {
          setCustomerPopupOpen(false);
          setCustomerSearch('');
        }}
        onSelect={handleCustomerSelect}
        fetchItems={(page) => fetchCustomers(page, customerSearch)}
        title={customerPopupMode === 'edit' ? 'Edit Customer' : customerPopupMode === 'add' ? 'Add Customer' : 'Select Customer'}
        displayFieldKeys={['name', 'code']}
        searchFields={['name', 'code']}
        headerNames={['Customer Name', 'Code']}
        columnWidths={{
          name: '60%',
          code: '40%'
        }}
        searchPlaceholder="Search customers by name or code..."
        mode={customerPopupMode}
        initialSearch={customerSearch}
        onSearchChange={(value) => setCustomerSearch(value)}
      />

      {/* --- ITEM SELECTION POPUP --- */}
      <PopupListSelector
        open={itemPopupOpen}
        onClose={() => {
          setItemPopupOpen(false);
          setItemSearch('');
        }}
        onSelect={handleItemSelect}
        fetchItems={(page) => fetchItems(page, itemSearch)}
        title={itemPopupMode === 'edit' ? 'Edit Item' : itemPopupMode === 'add' ? 'Add Item' : 'Select Item'}
        displayFieldKeys={['itemName']}
        searchFields={['itemName']}
        headerNames={['Item Name']}
        columnWidths={{
          itemName: '100%'
        }}
        searchPlaceholder="Search items by name..."
        mode={itemPopupMode}
        initialSearch={itemSearch}
        onSearchChange={(value) => setItemSearch(value)}
      />

      {/* --- DELETE CUSTOMER POPUP --- */}
      <PopupListSelector
        open={deleteCustomerPopupOpen}
        onClose={() => setDeleteCustomerPopupOpen(false)}
        onSelect={handleCustomerDelete}
        fetchItems={fetchCustomers}
        title="Delete Customer"
        displayFieldKeys={['name', 'code']}
        searchFields={['name', 'code']}
        headerNames={['Customer Name', 'Code']}
        columnWidths={{
          name: '60%',
          code: '40%'
        }}
        searchPlaceholder="Search customers by name or code..."
        mode="delete"
        confirmButtonText="Delete"
        confirmButtonColor="#dc3545"
      />

      {/* --- DELETE ITEM POPUP --- */}
      <PopupListSelector
        open={deleteItemPopupOpen}
        onClose={() => setDeleteItemPopupOpen(false)}
        onSelect={handleItemDelete}
        fetchItems={fetchItems}
        title="Delete Item"
        displayFieldKeys={['itemName']}
        searchFields={['itemName']}
        headerNames={['Item Name']}
        columnWidths={{
          itemName: '100%'
        }}
        searchPlaceholder="Search items by name..."
        mode="delete"
        confirmButtonText="Delete"
        confirmButtonColor="#dc3545"
      />
    </div>
  );
};

export default SaleInvoice;