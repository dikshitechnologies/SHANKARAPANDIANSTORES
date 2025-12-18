import React, { useState, useEffect } from "react";
import { ActionButtons1 } from '../../components/Buttons/ActionButtons';
import TenderModal from '../../components/TenderModal/TenderModal';
import apiService from '../../api/apiService';
import { API_ENDPOINTS } from '../../api/endpoints';
function BillCollector() {
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [isFocused, setIsFocused] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [activeFooterAction, setActiveFooterAction] = useState('all');
  
  // Tender Modal state
  const [isTenderModalOpen, setIsTenderModalOpen] = useState(false);
  const [selectedBillData, setSelectedBillData] = useState(null);
  
  // API and data management
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const fCompCode = "001";

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch bills from API
  const fetchBills = async (page = 1, search = "") => {
    try {
      setLoading(true);
      
      const data = await apiService.get(API_ENDPOINTS.BILLCOLLECTOR.GET_BILLCOLLECTOR_ITEMS(fCompCode, search, page, pageSize));
      console.log("API Response:", data);
      
      if (data && data.data) {
        setBills(data.data);
        setTotalCount(data.totalCount);
        setPageNumber(page);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      alert("Failed to load bills. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle row click to open Tender Modal
  const handleRowClick = (billRow) => {
    setSelectedBillData(billRow);
    setIsTenderModalOpen(true);
  };

  const handleCloseTenderModal = () => {
    setIsTenderModalOpen(false);
    setSelectedBillData(null);
  };

  // Fetch bills on component mount and when search changes
  useEffect(() => {
    fetchBills(1, searchInput);
  }, [searchInput]);
  const handleNextPage = () => {
    const nextPage = pageNumber + 1;
    if (nextPage * pageSize <= totalCount + pageSize) {
      fetchBills(nextPage, searchInput);
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      fetchBills(pageNumber - 1, searchInput);
    }
  };

  const container = {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    padding: "0",
    margin: "0",
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    WebkitOverflowScrolling: "touch"
  };

  const header = {
    width: "100%",
    background: "#1f2937",
    padding: isMobile ? "14px 16px" : "18px 32px",
    color: "white",
    fontSize: isMobile ? "20px" : "26px",
    fontWeight: "700",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "3px solid #307AC8",
    flexShrink: 0
  };

  const headerRight = {
    display: "flex",
    alignItems: "center",
    gap: "20px"
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
    width: isMobile ? "100%" : "220px",
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

  const bigTotal = {
    color: "#10b981",
    fontSize: "42px",
    fontWeight: "800",
    textAlign: "right",
    padding: "10px 30px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.15)"
  };

  const statsContainer = {
    display: "flex",
    gap: "20px",
    margin: "0 25px 20px"
  };

  const statCard = {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: isMobile ? "4px 8px" : "8px 12px",
    borderRadius: "6px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "1px solid #e5e7eb",
    minWidth: isMobile ? "0" : "auto"
  };

  const statValue = {
    fontSize: isMobile ? "18px" : "22px",
    fontWeight: "700",
    color: "#1f2937"
  };

  const statLabel = {
    fontSize: isMobile ? "10px" : "12px",
    color: "#6b7280",
    marginTop: "4px"
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
    marginBottom: isMobile ? '70px' : '90px',
    WebkitOverflowScrolling: 'touch',
    width: isMobile ? 'calc(100% - 12px)' : 'calc(100% - 32px)',
    boxSizing: 'border-box',
    flex: 'none',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: isMobile ? '390px' : '490px',
  };

  const tableStyle = {
    width: 'max-content',
    minWidth: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  };

  const thStyle = {
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    fontSize: isMobile ? "10px" : "13px",
    fontWeight: "700",
    lineHeight: "1.2",
    backgroundColor: '#1B91DA',
    color: 'white',
    padding: isMobile ? '10px 3px' : '12px 6px',
    textAlign: 'center',
    letterSpacing: '0.5px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    border: '1px solid white',
    borderBottom: '2px solid white',
    minWidth: isMobile ? '50px' : '70px',
    whiteSpace: 'nowrap',
    width: isMobile ? '50px' : '70px',
    maxWidth: isMobile ? '50px' : '70px',
    minHeight: isMobile ? '28px' : '35px',
    height: isMobile ? '28px' : '35px',
    verticalAlign: 'middle',
  };

  const tdStyle = {
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    fontSize: isMobile ? "11px" : "13px",
    fontWeight: "500",
    lineHeight: "1.4",
    padding: isMobile ? '8px 3px' : '12px 6px',
    textAlign: 'center',
    border: '1px solid #ccc',
    color: '#333',
    minWidth: isMobile ? '50px' : '70px',
    width: isMobile ? '50px' : '70px',
    maxWidth: isMobile ? '50px' : '70px',
    minHeight: isMobile ? '28px' : '35px',
    height: isMobile ? '28px' : '35px',
    verticalAlign: 'middle',
  };

  const tdHoverStyle = {
    ...tdStyle,
    backgroundColor: "#f8fafc",
    cursor: "pointer"
  };

  const selectedRowStyle = {
    ...tdHoverStyle,
    backgroundColor: "#dbeafe"
  };

  const footer = {
    display: "flex",
    justifyContent: "center",
    gap: "0",
    padding: isMobile ? "12px 16px" : "16px 32px",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e5e7eb",
    position: "fixed",
    bottom: "0",
    width: "100%",
    boxShadow: "0 -1px 3px rgba(0,0,0,0.08)",
    flexWrap: isMobile ? "wrap" : "nowrap",
    flexShrink: 0
  };

  const btnBase = {
    padding: isMobile ? "8px 12px" : "10px 28px",
    border: "none",
    cursor: "pointer",
    fontSize: isMobile ? "11px" : "13px",
    fontWeight: "600",
    borderRadius: "50px",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: isMobile ? "4px" : "6px",
    flex: isMobile ? "1 1 calc(50% - 3px)" : "0 0 auto",
    justifyContent: "center",
    whiteSpace: "nowrap"
  };

  const saveBtn = { 
    ...btnBase, 
    backgroundColor: "#059669", 
    color: "white",
    boxShadow: "0 4px 20px rgba(5, 150, 105, 0.2)"
  };

  const viewBtn = { 
    ...btnBase, 
    backgroundColor: "#307AC8", 
    color: "white",
    boxShadow: "0 4px 20px rgba(48, 122, 200, 0.2)"
  };

  const printBtn = { 
    ...btnBase, 
    backgroundColor: "#6a1b9a", 
    color: "white",
    boxShadow: "0 4px 20px rgba(106, 27, 154, 0.2)"
  };

  const clearBtn = { 
    ...btnBase, 
    backgroundColor: "#e53935", 
    color: "white",
    boxShadow: "0 4px 20px rgba(229, 57, 53, 0.2)"
  };

  const exitBtn = { 
    ...btnBase, 
    backgroundColor: "#dc2626", 
    color: "white",
    boxShadow: "0 4px 20px rgba(220, 38, 38, 0.2)"
  };

  const btnHover = {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
  };

  const statusBadge = {
    padding: isMobile ? "3px 8px" : "4px 10px",
    borderRadius: "16px",
    fontSize: isMobile ? "9px" : "11px",
    fontWeight: "700",
    display: "inline-block"
  };

  const paidBadge = {
    ...statusBadge,
    backgroundColor: "#d1fae5",
    color: "#065f46"
  };

  const pendingBadge = {
    ...statusBadge,
    backgroundColor: "#fee2e2",
    color: "#991b1b"
  };

  const modalOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    // display: showPrintConfirm || showSaveConfirm || showClearConfirm || showExitConfirm ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(8px)",
    animation: "fadeIn 0.3s ease-out"
  };

  const modalContent = {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    maxWidth: "420px",
    width: "90%",
    animation: "modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
  };

  const modalTitle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "12px",
    letterSpacing: "-0.5px"
  };

  const modalMessage = {
    fontSize: "15px",
    color: "#64748b",
    marginBottom: "28px",
    lineHeight: "1.5"
  };

  const modalButtons = {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: isMobile ? "wrap" : "nowrap"
  };

  const modalYesBtn = {
    padding: "10px 24px",
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s",
    flex: isMobile ? "1 1 calc(50% - 6px)" : "0 0 auto"
  };

  const modalNoBtn = {
    padding: "10px 24px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s",
    flex: isMobile ? "1 1 calc(50% - 6px)" : "0 0 auto"
  };

  // Action handlers
  const handleSave = () => {
    setShowSaveConfirm(true);
  };

  const confirmSave = () => {
    setShowSaveConfirm(false);
    alert("✓ Bills saved successfully!");
  };

  const handleClear = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setShowClearConfirm(false);
    setSearchInput("");
    alert("✓ Search cleared!");
  };


  const confirmExit = () => {
    setShowExitConfirm(false);
    alert("✓ Exiting Bill Collector...");
    // Add actual exit logic here
  };

  const handlePrint = () => {
    setShowPrintConfirm(true);
  };

  const confirmPrint = () => {
    setShowPrintConfirm(false);
    const printWindow = window.open('', '', 'height=500,width=800');
    const totalAmount = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill Collection Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1f2937; border-bottom: 3px solid #307AC8; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f9fafb; padding: 12px; text-align: center; font-weight: bold; border-bottom: 1px solid #e5e7eb; }
          td { padding: 10px; text-align: center; border-bottom: 1px solid #f3f4f6; }
          .summary { margin-top: 20px; padding: 15px; background: #f0f8ff; border-left: 4px solid #307AC8; }
          .summary p { margin: 5px 0; }
          .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>📋 Bill Collection Report</h1>
        <p><strong>Generated on:</strong> ${new Date().toLocaleString('en-IN')}</p>
        
        <table>
          <thead>
            <tr>
              <th>SNo</th>
              <th>Date</th>
              <th>Bill No</th>
              <th>Salesman</th>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Items</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Discount</th>
            </tr>
          </thead>
          <tbody>
            ${bills.map((row, i) => `
              <tr>
                <td>${(pageNumber - 1) * pageSize + i + 1}</td>
                <td>${new Date(row.date).toLocaleDateString('en-IN')}</td>
                <td>${row.billNo}</td>
                <td>${row.salesman}</td>
                <td>${row.customer}</td>
                <td>${row.mobile || '-'}</td>
                <td>${row.items}</td>
                <td>${row.qty}</td>
                <td>₹${row.amount.toLocaleString('en-IN')}</td>
                <td>₹${row.damt.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <p><strong>Total Bills:</strong> ${bills.length}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
          <p><strong>Total Discount:</strong> ₹${bills.reduce((sum, b) => sum + (b.damt || 0), 0).toLocaleString('en-IN')}</p>
        </div>
        
        <div class="footer">
          <p>Printed by: SHANKARAPANDIAN STORES | © 2025 All Rights Reserved</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Open print dialog immediately
    setTimeout(() => {
      printWindow.print();
      // Close the window after a short delay
      setTimeout(() => {
        printWindow.close();
      }, 500);
    }, 100);
  };

  const cancelPrint = () => {
    setShowPrintConfirm(false);
  };

  return (
    <div style={container}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
  

      <div style={billNoContainer}>
        <div style={{ fontWeight: "700", color: "#1f2937", fontSize: "13px" }}>Search Bill:</div>
        <input 
          type="text" 
          placeholder="Enter Bill Number" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={isFocused ? billNoBoxFocus : billNoBox}
        />
        <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
          <div style={statCard}>
            <div style={statValue}>{totalCount}</div>
            <div style={statLabel}>Total Bills</div>
          </div>
          <div style={statCard}>
            <div style={{...statValue, color: "#307AC8"}}>₹{bills.reduce((sum, bill) => sum + (bill.amount || 0), 0).toLocaleString('en-IN')}</div>
            <div style={statLabel}>Total Amount</div>
          </div>
        </div>
      </div>

      <div style={tableContainer}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#6b7280" }}>
            Loading bills...
          </div>
        ) : bills.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#6b7280" }}>
            No bills found
          </div>
        ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>SNo</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Bill No</th>
              <th style={thStyle}>Salesman</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Mobile</th>
              <th style={thStyle}>Items</th>
              <th style={thStyle}>Qty</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Discount</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((row, i) => (
              <tr 
                key={i} 
                onClick={() => {
                  setSelectedRow(i);
                  handleRowClick(row);
                }}
                style={{ 
                  backgroundColor: selectedRow === i ? "#dbeafe" : i % 2 === 0 ? '#f9f9f9' : '#ffffff',
                  transition: "all 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  if (selectedRow !== i) e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (selectedRow !== i) e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#f9f9f9" : "#ffffff";
                }}
              >
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{(pageNumber - 1) * pageSize + i + 1}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{new Date(row.date).toLocaleDateString('en-IN')}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                  <div style={{ color: "#06A7EA", fontWeight: "500" }}>{row.billNo}</div>
                </td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{row.salesman}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{row.customer}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{row.mobile || "-"}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{row.items}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{row.qty}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                  <div style={{ fontWeight: "600", color: "#059669" }}>₹{row.amount.toLocaleString('en-IN')}</div>
                </td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                  <div style={{ fontWeight: "600", color: "#d97706" }}>₹{row.damt.toLocaleString('en-IN')}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Print Confirmation Modal */}
     

      {/* Tender Modal */}
      <TenderModal 
        isOpen={isTenderModalOpen} 
        onClose={handleCloseTenderModal}
        billData={selectedBillData}
      />

      {/* <div style={footer}>
        <ActionButtons1
          onClear={handleClear}
          onSave={handleSave}
          onPrint={handlePrint}
          activeButton={activeFooterAction}
          onButtonClick={(type) => setActiveFooterAction(type)}
        />
      </div> */}
    </div>
  );
}

export default BillCollector;
