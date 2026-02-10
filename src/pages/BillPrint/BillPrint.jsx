import React, { useState, useEffect, useMemo } from "react";
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

  const [selectedRow, setSelectedRow] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [isFocused, setIsFocused] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // API and data management
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const fCompCode = getCompCode();

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

  // Handle print actions
  const handleThermalPrint = (billNo) => {
    console.log("Thermal print for bill:", billNo);
    alert(`Printing thermal receipt for Bill No: ${billNo}`);
    // Add thermal print logic here
  };

  const handleA4Print = (billNo) => {
    console.log("A4 print for bill:", billNo);
    
    // Open print preview in new window
    const printWindow = window.open('', '', 'height=600,width=800');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill Print - ${billNo}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #000;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .bill-title {
            font-size: 18px;
            margin: 10px 0;
          }
          .bill-info {
            margin: 20px 0;
            padding: 10px;
            border: 1px solid #ccc;
          }
          .bill-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .bill-details {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .bill-details th {
            background: #f0f0f0;
            padding: 8px;
            border: 1px solid #000;
            text-align: left;
          }
          .bill-details td {
            padding: 8px;
            border: 1px solid #ccc;
          }
          .total-section {
            margin-top: 20px;
            text-align: right;
            font-size: 18px;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
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
          <div class="bill-row">
            <div><strong>Bill No:</strong> ${billNo}</div>
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
          </div>
          <div class="bill-row">
            <div><strong>Customer:</strong> John Doe</div>
            <div><strong>Mobile:</strong> 9876543210</div>
          </div>
        </div>
        
        <table class="bill-details">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Item Description</th>
              <th>HSN Code</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Sample Product 1</td>
              <td>123456</td>
              <td>2</td>
              <td>₹100.00</td>
              <td>₹200.00</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Sample Product 2</td>
              <td>789012</td>
              <td>1</td>
              <td>₹500.00</td>
              <td>₹500.00</td>
            </tr>
          </tbody>
        </table>
        
        <div class="total-section">
          <div>Sub Total: ₹700.00</div>
          <div>GST (18%): ₹126.00</div>
          <div>Grand Total: ₹826.00</div>
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
    height: "100vh",
    backgroundColor: "#f5f7fa",
    margin: 0,
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    overflowX: "hidden",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
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
    maxHeight: isMobile ? '60vh' : '75vh',
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
    fontSize: isMobile ? "12px" : "15px",
    fontWeight: "500",
    lineHeight: "1.4",
    padding: isMobile ? '10px 5px' : '16px 10px',
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

  const selectedRowStyle = {
    ...tdStyle,
    backgroundColor: "#dbeafe"
  };

  const printButtonContainer = {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const thermalButton = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    whiteSpace: 'nowrap'
  };

  const a4Button = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    whiteSpace: 'nowrap'
  };

  const buttonHover = {
    opacity: 0.9,
    transform: 'scale(1.05)'
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
        
        .print-btn:hover {
          opacity: 0.9;
          transform: scale(1.05);
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
          style={isFocused ? billNoBoxFocus : billNoBox}
        />
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
                <th style={thStyle}>Print</th>
              </tr>
            </thead>

            <tbody>
              {bills.map((row, i) => (
                <tr 
                  key={i} 
                  onClick={() => setSelectedRow(i)}
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
                  <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                    {(pageNumber - 1) * pageSize + i + 1}
                  </td>
                  <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                    {row.date ? new Date(row.date).toLocaleDateString('en-IN') : '-'}
                  </td>
                  <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                    <div style={{ color: "#000", fontWeight: "bold" }}>
                      {String(row.billNo || '-')}
                    </div>
                  </td>
                  <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                    {String(row.salesman || '-')}
                  </td>
                  <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                    {String(row.customer || '-')}
                  </td>
                  <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                    {String(row.mobile || "-")}
                  </td>
                  <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                    {String(row.items || '0')}
                  </td>
                  <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                    {String(row.qty || '0')}
                  </td>
                  <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                    <div style={{ fontWeight: "bold", color: "#000" }}>
                      ₹{Number(row.amount || 0).toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td style={selectedRow === i ? selectedRowStyle : tdStyle}>
                    <div style={printButtonContainer}>
                      <button 
                        style={thermalButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThermalPrint(row.billNo);
                        }}
                        onMouseEnter={(e) => Object.assign(e.target.style, buttonHover)}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = '';
                          e.target.style.transform = '';
                        }}
                      >
                        🔵 Thermal
                      </button>
                      <button 
                        style={a4Button}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleA4Print(row.billNo);
                        }}
                        onMouseEnter={(e) => Object.assign(e.target.style, buttonHover)}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = '';
                          e.target.style.transform = '';
                        }}
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
    </div>
  );
}

export default BillCollector;