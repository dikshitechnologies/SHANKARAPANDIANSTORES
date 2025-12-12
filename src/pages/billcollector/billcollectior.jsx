import React, { useState } from "react";
import { ActionButtons1 } from '../../components/Buttons/ActionButtons';

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

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    margin: isMobile ? "0 16px 100px" : "0 32px 100px",
    backgroundColor: "white",
    borderRadius: isMobile ? "0 0 6px 6px" : "0 0 6px 6px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    maxHeight: isMobile ? "calc(100vh - 240px)" : isMobile && window.innerWidth < 600 ? "calc(100vh - 220px)" : "calc(100vh - 280px)",
    overflowY: "auto",
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderTop: "none",
    flex: 1,
    WebkitOverflowScrolling: "touch",
    scrollBehavior: "smooth"
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: isMobile ? "11px" : "13px",
    tableLayout: "fixed"
  };

  const thStyle = {
    padding: isMobile ? "10px 6px" : "14px 12px",
    background: "linear-gradient(135deg, #307AC8 0%, #1B91DA 100%)",
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    borderBottom: "2px solid #06A7EA",
    position: "sticky",
    top: "0",
    zIndex: "10",
    fontSize: isMobile ? "10px" : "13px",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    boxShadow: "0 2px 8px rgba(48, 122, 200, 0.15)"
  };

  const tdStyle = {
    padding: isMobile ? "8px 6px" : "12px 12px",
    textAlign: "center",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
    transition: "all 0.15s",
    fontSize: isMobile ? "11px" : "13px",
    wordWrap: "break-word",
    overflowWrap: "break-word"
  };

  const tdHoverStyle = {
    ...tdStyle,
    backgroundColor: "#f8fafc",
    cursor: "pointer"
  };

  const selectedRowStyle = {
    ...tdHoverStyle,
    backgroundColor: "#dbeafe",
    // borderLeft: "4px solid #307AC8"
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
    display: showPrintConfirm || showSaveConfirm || showClearConfirm || showExitConfirm ? "flex" : "none",
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

  const sampleData = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    date: "10-Nov-2025",
    billNo: `RS/INV/25-26/100${i}`,
    salesman: ["Dharani", "Arun", "Priya", "Kumar"][i % 4],
    customer: `Customer ${i + 1}`,
    mobile: `98765${43210 - i}`,
    items: Math.floor(Math.random() * 5) + 1,
    qty: Math.floor(Math.random() * 10) + 1,
    gross: (Math.random() * 5000 + 1000).toFixed(0),
    discount: (Math.random() * 200).toFixed(0),
    amount: (Math.random() * 5000 + 1000).toFixed(0),
    status: i % 3 === 0 ? "Pending" : "Paid"
  }));

  const handlePrint = () => {
    setShowPrintConfirm(true);
  };

  const confirmPrint = () => {
    setShowPrintConfirm(false);
    const printWindow = window.open('', '', 'height=500,width=800');
    const filteredData = sampleData.filter(bill =>
      bill.billNo.toLowerCase().includes(searchInput.toLowerCase())
    );
    const totalAmount = filteredData.reduce((sum, bill) => sum + parseInt(bill.amount), 0);
    
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map((row, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${row.date}</td>
                <td>${row.billNo}</td>
                <td>${row.salesman}</td>
                <td>${row.customer}</td>
                <td>${row.mobile}</td>
                <td>${row.items}</td>
                <td>${row.qty}</td>
                <td>₹${row.amount}</td>
                <td><strong>${row.status}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <p><strong>Total Bills:</strong> ${filteredData.length}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
          <p><strong>Total Discount:</strong> ₹${filteredData.reduce((sum, b) => sum + parseInt(b.discount), 0).toLocaleString('en-IN')}</p>
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
            <div style={statValue}>{sampleData.length}</div>
            <div style={statLabel}>Total Bills</div>
          </div>
          <div style={statCard}>
            <div style={{...statValue, color: "#307AC8"}}>₹45,600</div>
            <div style={statLabel}>Total Amount</div>
          </div>
        </div>
      </div>

      <div style={tableContainer}>
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
              <th style={thStyle}>Status</th>
            </tr>
          </thead>

          <tbody>
            {sampleData.map((row, i) => (
              <tr 
                key={i} 
                onClick={() => setSelectedRow(i)}
                style={{ 
                  backgroundColor: selectedRow === i ? "#e0e7ff" : "white",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (selectedRow !== i) e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (selectedRow !== i) e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{i + 1}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{row.date}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                  <div style={{ color: "#06A7EA", fontWeight: "500" }}>{row.billNo}</div>
                </td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{row.salesman}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{row.customer}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{row.mobile}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{row.items}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>{row.qty}</td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                  <div style={{ fontWeight: "600", color: "#059669" }}>₹{row.amount}</div>
                </td>
                <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                  <span style={row.status === "Paid" ? paidBadge : pendingBadge}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Print Confirmation Modal */}
      <div style={modalOverlay}>
        <div style={modalContent}>
          {showPrintConfirm && (
            <>
              <div style={modalTitle}>🖨️ Print Bill Report?</div>
              <div style={modalMessage}>
                Are you sure you want to print the bill collection report?
              </div>
              <div style={modalButtons}>
                <button
                  style={modalYesBtn}
                  onClick={confirmPrint}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#047857"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#059669"}
                >
                  ✓ Yes, Print
                </button>
                <button
                  style={modalNoBtn}
                  onClick={cancelPrint}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                >
                  ✕ No, Cancel
                </button>
              </div>
            </>
          )}

          {showSaveConfirm && (
            <>
              <div style={modalTitle}>💾 Save Bills?</div>
              <div style={modalMessage}>
                Do you want to save all the bills to the system?
              </div>
              <div style={modalButtons}>
                <button
                  style={modalYesBtn}
                  onClick={confirmSave}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#047857"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#059669"}
                >
                  ✓ Yes, Save
                </button>
                <button
                  style={modalNoBtn}
                  onClick={() => setShowSaveConfirm(false)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                >
                  ✕ No, Cancel
                </button>
              </div>
            </>
          )}

          {showClearConfirm && (
            <>
              <div style={modalTitle}>🔄 Clear Search?</div>
              <div style={modalMessage}>
                Do you want to clear the search filter?
              </div>
              <div style={modalButtons}>
                <button
                  style={modalYesBtn}
                  onClick={confirmClear}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#047857"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#059669"}
                >
                  ✓ Yes, Clear
                </button>
                <button
                  style={modalNoBtn}
                  onClick={() => setShowClearConfirm(false)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                >
                  ✕ No, Cancel
                </button>
              </div>
            </>
          )}

          {showExitConfirm && (
            <>
              <div style={modalTitle}>❌ Exit Application?</div>
              <div style={modalMessage}>
                Are you sure you want to exit the Bill Collector?
              </div>
              <div style={modalButtons}>
                <button
                  style={modalYesBtn}
                  onClick={confirmExit}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#047857"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#059669"}
                >
                  ✓ Yes, Exit
                </button>
                <button
                  style={modalNoBtn}
                  onClick={() => setShowExitConfirm(false)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                >
                  ✕ No, Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={footer}>
        <ActionButtons1
          onClear={handleClear}
          onSave={handleSave}
          onPrint={handlePrint}
          activeButton={activeFooterAction}
          onButtonClick={(type) => setActiveFooterAction(type)}
        />
      </div>
    </div>
  );
}

export default BillCollector;
