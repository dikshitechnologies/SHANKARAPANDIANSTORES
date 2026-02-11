import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ActionButtons1 } from '../../components/Buttons/ActionButtons';
import apiService from '../../api/apiService';
import { API_ENDPOINTS } from '../../api/endpoints';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
import { getCompCode } from '../../utils/userUtils';

function BillCollector() {
  // ---------- Permissions ----------
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.BILL_COLLECTOR),
    edit: hasModifyPermission(PERMISSION_CODES.BILL_COLLECTOR),
    delete: hasDeletePermission(PERMISSION_CODES.BILL_COLLECTOR)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // ---------- State Management ----------
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [isFocused, setIsFocused] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // API and data management
  const [bills, setBills] = useState([]);
  const [billDetails, setBillDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [apiError, setApiError] = useState(null);
  const fCompCode = '001'; // getCompCode();

  // ---------- Responsive Design ----------
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------- Debounced Search ----------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ---------- API Integration - Fetch Bills List ----------
const fetchBills = useCallback(async (page = 1, search = "") => {
  try {
    setLoading(true);
    setApiError(null);
    
    // Get the endpoint - this already includes compCode, pageNumber, and pageSize
    let endpoint = API_ENDPOINTS.BILLCOLLECTOR.GET_SALESPAYMENTVOUCHER_LIST(fCompCode, page, pageSize);
    
    // If search is provided, append it to the URL
    if (search.trim()) {
      endpoint = `${endpoint}&search=${encodeURIComponent(search.trim())}`;
    }

    console.log("Full URL:", endpoint);

    // Call the API
    const response = await apiService.get(endpoint);

    console.log("API Response:", response);

    if (response && response.data) {
      // Handle different response structures
      const responseData = response.data.data || response.data;
      // Handle totalCount - if API returns 0 but data exists, use array length
      const apiTotalCount = response.data?.totalCount ?? response?.totalCount ?? 0;
      const total = (apiTotalCount > 0) ? apiTotalCount : (Array.isArray(responseData) ? responseData.length : 0);
      
      // Map API response to table format
      const mappedBills = Array.isArray(responseData) ? responseData.map((bill, index) => ({
        id: index,
        voucherNo: bill.billNo || bill.voucherNo || '',
        voucherDate: bill.date || bill.voucherDate || '',
        customerName: bill.customer || bill.customerName || '',
        customerCode: bill.customercode || bill.customerCode || '',
        salesmanName: bill.salesman || bill.salesmanName || '',
        customerMobile: bill.mobile || bill.customerMobile || '',
        billAmount: bill.grossAmt || bill.billAmount || 0,
        netAmount: bill.amount || bill.netAmount || 0,
        itemCount: bill.items || bill.itemCount || 0,
        totalQty: bill.qty || bill.totalQty || 0,
        balance: bill.balance || 0,
        balanceType: bill.balanceType || 'Dr'
      })) : [];

      setBills(mappedBills);
      setTotalCount(total || mappedBills.length);
      setCurrentPage(page);
    } else {
      setBills([]);
      setTotalCount(0);
    }
    
  } catch (error) {
    console.error("Error fetching bills:", error);
    setBills([]);
    setTotalCount(0);
    setApiError(error.message || 'Failed to fetch bills');
    
    // Show user-friendly error message
    alert(`Failed to fetch bills: ${error.message || 'Network error'}. Please check if the API endpoint is correct.`);
  } finally {
    setLoading(false);
  }
}, [fCompCode, pageSize]);

// ---------- API Integration - Fetch Bill Details for Printing ----------
const fetchBillDetails = useCallback(async (voucherNo) => {
  if (!voucherNo) {
    alert('Invalid bill number');
    return null;
  }
  
  try {
    setPrintLoading(true);
    
    console.log("Fetching details for voucher:", voucherNo);
    
    // Get the endpoint - this already includes the voucherNo parameter
    const endpoint = API_ENDPOINTS.BILLCOLLECTOR.GET_PAYMENT_VOUCHER_DETAILS(voucherNo);
    
    console.log("Details endpoint:", endpoint);
    
    // Call the API
    const response = await apiService.get(endpoint);
    
    console.log("Bill details response:", response);
    
    if (response && response.data) {
      // Handle different response structures
      const detailsData = response.data.data || response.data;
      setBillDetails(detailsData);
      return detailsData;
    } else {
      throw new Error(response?.message || 'Failed to fetch bill details');
    }
    
  } catch (error) {
    console.error("Error fetching bill details:", error);
    alert(`Failed to load bill details: ${error.message || 'Network error'}`);
    return null;
  } finally {
    setPrintLoading(false);
  }
}, []);

  // ---------- Fetch bills when search or pagination changes ----------
  useEffect(() => {
    fetchBills(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchBills]);

  // ---------- Pagination Handlers ----------
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // ---------- Print Handlers ----------
  const handleThermalPrint = useCallback(async (voucherNo) => {
    const details = await fetchBillDetails(voucherNo);
    if (!details) return;
    printThermalReceipt(details, voucherNo);
  }, [fetchBillDetails]);

  const handleA4Print = useCallback(async (voucherNo) => {
    const details = await fetchBillDetails(voucherNo);
    if (!details) return;
    printA4Invoice(details, voucherNo);
  }, [fetchBillDetails]);

  // ---------- Thermal Receipt Print Function ----------
  const printThermalReceipt = (details, voucherNo) => {
    const customer = details.customerDetails?.[0] || details.customer || {};
    const items = details.items || details.itemDetails || [];
    const denominations = details.denominations || {};
    
    const billAmount = customer.billAmount || details.billAmount || 0;
    const discount = customer.discount || details.discount || 0;
    const netAmount = customer.netAmount || details.netAmount || "0";
    const serviceCharge = customer.serviceChargeAmount || details.serviceCharge || 0;
    
    const printContent = `
      SHANKARAPANDIAN STORES
      123 Main Street, City, State
      Phone: 9876543210
      GSTIN: 33AAAAA0000A1Z5
      =================================
      TAX INVOICE
      =================================
      Bill No: ${voucherNo}
      Date: ${formatDate(customer.voucherDate || details.date || new Date())}
      Time: ${formatTime(customer.time || details.time || '')}
      Customer: ${customer.customerName || details.customerName || 'N/A'}
      Mobile: ${customer.customerMobile || details.customerMobile || 'N/A'}
      Salesman: ${customer.salesmanName || details.salesmanName || 'N/A'}
      =================================
      Item                 Qty   Rate   Amount
      =================================
      ${items.map(item => `
      ${truncateText(item.itemName || item.productName || 'Item', 16)}
      ${item.qty || item.quantity || 0}     ${item.rate || item.price || 0}   ${item.amount || item.total || 0}
      HSN: ${item.hsn || item.hsnCode || ''} 
      Tax: ${item.tax || item.taxRate || 0}%
      ${item.description ? `Desc: ${item.description}` : ''}
      `).join('')}
      =================================
      Bill Amount: ₹${Number(billAmount).toFixed(2)}
      Discount: ₹${Number(discount).toFixed(2)}
      Service Charge: ₹${Number(serviceCharge).toFixed(2)}
      =================================
      NET AMOUNT: ₹${netAmount}
      =================================
      Payment Details:
      UPI Bank: ${customer.upiBank || details.upiBank || 'N/A'}
      Card Bank: ${customer.cardBank || details.cardBank || 'N/A'}
      =================================
      Cash Denomination:
      ₹500: ${denominations._500?.receive || 0}
      ₹200: ${denominations._200?.receive || 0}
      ₹100: ${denominations._100?.receive || 0}
      ₹50: ${denominations._50?.receive || 0}
      ₹20: ${denominations._20?.receive || 0}
      ₹10: ${denominations._10?.receive || 0}
      ₹5: ${denominations._5?.receive || 0}
      ₹2: ${denominations._2?.receive || 0}
      ₹1: ${denominations._1?.receive || 0}
      =================================
      Thank you for your business!
      This is computer generated invoice
    `;
    
    const printWindow = window.open('', '_blank', 'height=600,width=400');
    printWindow.document.write(`<pre style="font-family: monospace; font-size: 12px; padding: 10px;">${printContent}</pre>`);
    printWindow.document.write('<button onclick="window.print()" style="position:fixed; bottom:20px; right:20px; padding:10px 20px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">Print</button>');
    printWindow.document.close();
  };

  // ---------- A4 Invoice Print Function ----------
  const printA4Invoice = (details, voucherNo) => {
    const customer = details.customerDetails?.[0] || details.customer || {};
    const items = details.items || details.itemDetails || [];
    const denominations = details.denominations || {};
    
    const billAmount = customer.billAmount || details.billAmount || 0;
    const discount = customer.discount || details.discount || 0;
    const netAmount = customer.netAmount || details.netAmount || "0";
    const serviceCharge = customer.serviceChargeAmount || details.serviceCharge || 0;
    
    const gstByType = {};
    items.forEach(item => {
      const taxRate = item.tax || item.taxRate || 0;
      if (taxRate > 0) {
        if (!gstByType[taxRate]) gstByType[taxRate] = 0;
        const taxAmount = ((item.amount || item.total || 0) * taxRate) / 100;
        gstByType[taxRate] += taxAmount;
      }
    });
    
    const totalCash = (
      (denominations._500?.receive || 0) * 500 +
      (denominations._200?.receive || 0) * 200 +
      (denominations._100?.receive || 0) * 100 +
      (denominations._50?.receive || 0) * 50 +
      (denominations._20?.receive || 0) * 20 +
      (denominations._10?.receive || 0) * 10 +
      (denominations._5?.receive || 0) * 5 +
      (denominations._2?.receive || 0) * 2 +
      (denominations._1?.receive || 0) * 1
    );
    
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill Print - ${voucherNo}</title>
        <style>
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
            @page { margin: 10mm; }
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #000;
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .company-name {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .bill-title {
            font-size: 16px;
            margin: 10px 0;
            font-weight: bold;
          }
          .bill-info {
            margin: 15px 0;
            padding: 10px;
            border: 1px solid #ccc;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
          }
          .bill-info-left, .bill-info-right {
            flex: 1;
            min-width: 250px;
          }
          .bill-row {
            margin: 4px 0;
            display: flex;
            justify-content: space-between;
          }
          .bill-details {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 11px;
          }
          .bill-details th {
            background: #f0f0f0;
            padding: 8px 4px;
            border: 1px solid #000;
            text-align: left;
            font-weight: bold;
          }
          .bill-details td {
            padding: 8px 4px;
            border: 1px solid #ccc;
            vertical-align: top;
          }
          .total-section {
            margin-top: 15px;
            text-align: right;
            font-size: 14px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            padding: 0 20px;
          }
          .denomination-section {
            margin-top: 20px;
            padding: 10px;
            border: 1px solid #ccc;
            font-size: 11px;
          }
          .denomination-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
            margin-top: 5px;
          }
          .denom-item {
            display: flex;
            justify-content: space-between;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
          .print-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            margin: 10px;
            border-radius: 4px;
          }
          .amount-bold {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">SHANKARAPANDIAN STORES</div>
          <div>123 Main Street, City, State - 600001</div>
          <div>Phone: 9876543210 | GSTIN: 33AAAAA0000A1Z5</div>
        </div>
        
        <div class="bill-title">TAX INVOICE</div>
        
        <div class="bill-info">
          <div class="bill-info-left">
            <div class="bill-row">
              <div><strong>Bill No:</strong> ${voucherNo}</div>
            </div>
            <div class="bill-row">
              <div><strong>Date:</strong> ${formatDate(customer.voucherDate || details.date || new Date())}</div>
            </div>
            <div class="bill-row">
              <div><strong>Time:</strong> ${formatTime(customer.time || details.time || '')}</div>
            </div>
          </div>
          <div class="bill-info-right">
            <div class="bill-row">
              <div><strong>Customer:</strong> ${customer.customerName || details.customerName || 'N/A'}</div>
            </div>
            <div class="bill-row">
              <div><strong>Mobile:</strong> ${customer.customerMobile || details.customerMobile || 'N/A'}</div>
            </div>
            <div class="bill-row">
              <div><strong>Salesman:</strong> ${customer.salesmanName || details.salesmanName || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        <table class="bill-details">
          <thead>
            <tr>
              <th style="width: 5%">S.No</th>
              <th style="width: 40%">Item Description</th>
              <th style="width: 10%">HSN Code</th>
              <th style="width: 10%">Tax %</th>
              <th style="width: 10%">Qty</th>
              <th style="width: 15%">Rate</th>
              <th style="width: 15%">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.itemName || item.productName || ''}<br/>
                  <small style="color: #666;">${item.description || ''}</small>
                </td>
                <td>${item.hsn || item.hsnCode || ''}</td>
                <td>${item.tax || item.taxRate || 0}%</td>
                <td>${item.qty || item.quantity || 0}</td>
                <td>₹${Number(item.rate || item.price || 0).toFixed(2)}</td>
                <td>₹${Number(item.amount || item.total || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <div>Bill Amount:</div>
            <div>₹${Number(billAmount).toFixed(2)}</div>
          </div>
          ${Object.entries(gstByType).map(([rate, amount]) => `
            <div class="total-row">
              <div>GST ${rate}%:</div>
              <div>₹${Number(amount).toFixed(2)}</div>
            </div>
          `).join('')}
          ${discount > 0 ? `
            <div class="total-row">
              <div>Discount:</div>
              <div>-₹${Number(discount).toFixed(2)}</div>
            </div>
          ` : ''}
          ${serviceCharge > 0 ? `
            <div class="total-row">
              <div>Service Charge:</div>
              <div>₹${Number(serviceCharge).toFixed(2)}</div>
            </div>
          ` : ''}
          <div class="total-row amount-bold">
            <div>NET AMOUNT:</div>
            <div>₹${netAmount}</div>
          </div>
        </div>
        
        <div class="denomination-section">
          <div><strong>Payment Details:</strong></div>
          <div style="margin: 5px 0;">
            UPI Bank: ${customer.upiBank || details.upiBank || 'N/A'} | Card Bank: ${customer.cardBank || details.cardBank || 'N/A'}
          </div>
          <div><strong>Cash Denomination:</strong> Total Cash: ₹${totalCash.toFixed(2)}</div>
          <div class="denomination-grid">
            ${Object.entries(denominations).map(([denom, data]) => {
              const value = denom.replace('_', '');
              const count = data?.receive || 0;
              return count > 0 ? `
                <div class="denom-item">
                  <span>₹${value}:</span>
                  <span>${count} × ${value} = ₹${count * parseInt(value)}</span>
                </div>
              ` : '';
            }).join('')}
          </div>
        </div>
        
        <div class="footer">
          <div>Thank you for your business!</div>
          <div>This is a computer generated invoice</div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button class="print-btn" onclick="window.print()">Print Now</button>
          <button class="print-btn" onclick="window.close()" style="background: #dc3545;">Close</button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // ---------- Helper Functions ----------
  const formatDate = (dateString) => {
    try {
      if (!dateString) return '-';
      if (dateString instanceof Date) {
        return dateString.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '-');
      }
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '-');
      }
      if (dateString.includes('-')) {
        const parts = dateString.split(' ')[0].split('-');
        if (parts.length === 3) {
          return `${parts[0]}-${parts[1]}-${parts[2]}`;
        }
      }
      return dateString;
    } catch (error) {
      return dateString || '-';
    }
  };

  const formatTime = (timeString) => {
    try {
      if (!timeString) return '';
      if (timeString.includes(':')) {
        return timeString.substring(0, 5);
      }
      const timePart = timeString.split(' ')[1];
      if (timePart) {
        return timePart.substring(0, 5);
      }
      return '';
    } catch (error) {
      return '';
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  // ---------- Pagination Component ----------
  const Pagination = ({ currentPage, totalCount, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(totalCount / pageSize);
    
    if (totalPages <= 1) return null;
    
    const getPageNumbers = () => {
      const pageNumbers = [];
      const maxVisible = isMobile ? 3 : 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        
        if (currentPage > 3) {
          pageNumbers.push('...');
        }
        
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
          pageNumbers.push(i);
        }
        
        if (currentPage < totalPages - 2) {
          pageNumbers.push('...');
        }
        
        pageNumbers.push(totalPages);
      }
      
      return pageNumbers;
    };

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: isMobile ? '6px' : '10px',
        padding: isMobile ? '12px 0' : '16px 0',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: isMobile ? '6px 12px' : '8px 16px',
            backgroundColor: currentPage === 1 ? '#e0e0e0' : '#1B91DA',
            color: currentPage === 1 ? '#666' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          ← Previous
        </button>
        
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} style={{ padding: '0 4px', color: '#666' }}>...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                padding: isMobile ? '6px 10px' : '8px 14px',
                backgroundColor: currentPage === page ? '#1B91DA' : 'white',
                color: currentPage === page ? 'white' : '#333',
                border: currentPage === page ? '1px solid #1B91DA' : '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: currentPage === page ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: isMobile ? '6px 12px' : '8px 16px',
            backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#1B91DA',
            color: currentPage === totalPages ? '#666' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Next →
        </button>
      </div>
    );
  };

  // ---------- Styles ----------
  const container = {
    width: "100%",
    height: "100vh",
    backgroundColor: "#f5f7fa",
    margin: 0,
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    overflowX: "hidden",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  };

  const billNoContainer = {
    margin: isMobile ? "12px 16px 0" : "20px 32px 0",
    padding: isMobile ? "12px 16px" : "18px 24px",
    backgroundColor: "white",
    borderRadius: isMobile ? "6px 6px 0 0" : "6px 6px 0 0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "stretch" : "center",
    gap: isMobile ? "12px" : "16px",
    border: "1px solid #e5e7eb",
    borderBottom: "none"
  };

  const billNoBox = {
    padding: "10px 14px",
    fontSize: isMobile ? "13px" : "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    width: isMobile ? "100%" : "300px",
    transition: "all 0.25s",
    outline: "none",
    backgroundColor: "#ffffff"
  };

  const billNoBoxFocus = {
    ...billNoBox,
    borderColor: "#307AC8",
    boxShadow: "0 0 0 2px rgba(48, 122, 200, 0.08)",
    backgroundColor: "#f0f8ff"
  };

  const tableContainer = {
    backgroundColor: 'white',
    borderRadius: 10,
    overflowX: 'auto',
    overflowY: 'auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    margin: isMobile ? '6px' : '16px',
    marginTop: isMobile ? '6px' : '16px',
    marginBottom: isMobile ? '6px' : '16px',
    WebkitOverflowScrolling: 'touch',
    width: isMobile ? 'calc(100% - 12px)' : 'calc(100% - 32px)',
    boxSizing: 'border-box',
    flex: 'none',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: isMobile ? '60vh' : '70vh',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'auto',
  };

  const thStyle = {
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    fontSize: isMobile ? "10px" : "13px",
    fontWeight: "700",
    lineHeight: "1.2",
    backgroundColor: '#1B91DA',
    color: 'white',
    padding: isMobile ? '10px 4px' : '12px 8px',
    textAlign: 'center',
    letterSpacing: '0.5px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    border: '1px solid white',
    borderBottom: '2px solid white',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  };

  const tdStyle = {
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    fontSize: isMobile ? "12px" : "14px",
    fontWeight: "500",
    lineHeight: "1.4",
    padding: isMobile ? '10px 5px' : '14px 10px',
    textAlign: 'center',
    border: '1px solid #e0e0e0',
    color: '#333',
    verticalAlign: 'middle',
  };

  const selectedRowStyle = {
    ...tdStyle,
    backgroundColor: '#e3f2fd'
  };

  const printButtonContainer = {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const thermalButton = {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  };

  const a4Button = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  };

  // ---------- Render Component ----------
  return (
    <div style={container}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .print-btn:hover {
          opacity: 0.9;
          transform: scale(1.05);
        }
        
        input:focus {
          outline: none;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        tr:hover td {
          background-color: #f5f9ff;
        }
      `}</style>

      <div style={billNoContainer}>
        <div style={{ fontWeight: "700", color: "#1f2937", fontSize: "17px" }}>Search Bill:</div>
        <input 
          type="text" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search by bill no, customer name, or mobile"
          style={isFocused ? billNoBoxFocus : billNoBox}
        />
        {searchInput !== debouncedSearch && (
          <span style={{ color: '#666', fontSize: '12px' }}>Searching...</span>
        )}
      </div>

      {printLoading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px 30px',
          borderRadius: '8px',
          zIndex: 1000,
          fontSize: '16px',
          fontWeight: 'bold',
          animation: 'fadeIn 0.3s'
        }}>
          📄 Loading bill details for printing...
        </div>
      )}

      <div style={tableContainer}>
        {loading ? (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "200px", 
            color: "#6b7280",
            fontSize: "16px",
            fontWeight: "500"
          }}>
            <span>Loading bills...</span>
          </div>
        ) : bills.length === 0 ? (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "200px", 
            color: "#6b7280",
            fontSize: "16px",
            fontWeight: "500",
            flexDirection: 'column',
            gap: '10px'
          }}>
            {debouncedSearch ? `No bills found for "${debouncedSearch}"` : "No bills found"}
            {apiError && (
              <div style={{ fontSize: '12px', color: '#dc3545', maxWidth: '80%', textAlign: 'center' }}>
                Error: {apiError}
              </div>
            )}
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>S.No</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Bill No</th>
                <th style={thStyle}>Customer Code</th>
                <th style={thStyle}>Customer Name</th>
                <th style={thStyle}>Mobile</th>
                <th style={thStyle}>Items</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Balance</th>
                <th style={thStyle}>Print</th>
              </tr>
            </thead>

            <tbody>
              {bills.map((row, index) => (
                <tr 
                  key={row.voucherNo || index}
                  onClick={() => setSelectedRow(index)}
                  style={{ 
                    backgroundColor: selectedRow === index ? '#e3f2fd' : (index % 2 === 0 ? '#ffffff' : '#fafafa'),
                    transition: "all 0.2s",
                    cursor: "pointer"
                  }}
                >
                  <td style={selectedRow === index ? selectedRowStyle : tdStyle}>
                    {((currentPage - 1) * pageSize) + index + 1}
                  </td>
                  <td style={selectedRow === index ? selectedRowStyle : tdStyle}>
                    {formatDate(row.voucherDate)}
                  </td>
                  <td style={selectedRow === index ? selectedRowStyle : tdStyle}>
                    <div style={{ color: "#1B91DA", fontWeight: "bold" }}>
                      {row.voucherNo || '-'}
                    </div>
                  </td>
                  <td style={selectedRow === index ? selectedRowStyle : tdStyle}>
                    {row.customerCode || '-'}
                  </td>
                  <td style={selectedRow === index ? selectedRowStyle : tdStyle}>
                    {row.customerName || '-'}
                  </td>
                  <td style={selectedRow === index ? selectedRowStyle : tdStyle}>
                    {row.customerMobile || "-"}
                  </td>
                  <td style={selectedRow === index ? selectedRowStyle : tdStyle}>
                    {row.itemCount || '0'}
                  </td>
                  <td style={selectedRow === index ? selectedRowStyle : tdStyle}>
                    {row.totalQty || '0'}
                  </td>
                  <td style={selectedRow === index ? selectedRowStyle : tdStyle}>
                    <div style={{ fontWeight: "bold", color: "#28a745" }}>
                      ₹{Number(row.netAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td style={selectedRow === index ? selectedRowStyle : tdStyle}>
                    <div style={{ 
                      fontWeight: "bold", 
                      color: row.balance > 0 ? '#dc3545' : '#28a745' 
                    }}>
                      ₹{Number(row.balance || 0).toLocaleString('en-IN')}
                      <span style={{ fontSize: '10px', marginLeft: '2px' }}>
                        {row.balanceType || ''}
                      </span>
                    </div>
                  </td>
                  <td style={selectedRow === index ? selectedRowStyle : tdStyle}>
                    <div style={printButtonContainer}>
                      <button 
                        style={printLoading ? {...thermalButton, opacity: 0.6} : thermalButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!printLoading) {
                            handleThermalPrint(row.voucherNo);
                          }
                        }}
                        disabled={printLoading}
                      >
                        🧾 Thermal
                      </button>
                      <button 
                        style={printLoading ? {...a4Button, opacity: 0.6} : a4Button}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!printLoading) {
                            handleA4Print(row.voucherNo);
                          }
                        }}
                        disabled={printLoading}
                      >
                        📄 A4
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {bills.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: isMobile ? '12px 16px' : '16px 24px',
          borderTop: '1px solid #e0e0e0',
          margin: isMobile ? '6px 16px 16px' : '0 32px 20px',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px', 
            color: '#666',
            fontWeight: '500',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} bills
          </div>
          <Pagination 
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export default BillCollector;