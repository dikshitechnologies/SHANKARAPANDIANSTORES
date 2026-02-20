// components/CashCounter/CashCounter.jsx
import React, { useState, useEffect } from "react";
import apiService from "../../../api/apiService";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { useAuth } from "../../../context/AuthContext";


const CashCounter = ({ isOpen, onClose, onSave }) => {
  const { userData } = useAuth() || {};
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [denominations, setDenominations] = useState({
    500: { available: 0 },
    200: { available: 0 },
    100: { available: 0 },
    50: { available: 0 },
    20: { available: 0 },
    10: { available: 0 },
    5: { available: 0 },
    2: { available: 0 },
    1: { available: 0 },
  });

  const [totalAvailable, setTotalAvailable] = useState(0);

  // Handle resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch live drawer data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLiveDrawer();
    }
  }, [isOpen, userData?.companyCode]);

  // Calculate total available whenever denominations change
  useEffect(() => {
    calculateTotalAvailable();
  }, [denominations]);

  const fetchLiveDrawer = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const companyCode = userData?.companyCode || "001";

      const endpoint = API_ENDPOINTS.BILLCOLLECTOR.GET_LIVE_DRAWER(
        dateStr,
        companyCode,
      );
      const response = await apiService.get(endpoint);

      if (response) {
        const data = response.data || response;

        setDenominations({
          500: { available: data.r500 || 0 },
          200: { available: data.r200 || 0 },
          100: { available: data.r100 || 0 },
          50: { available: data.r50 || 0 },
          20: { available: data.r20 || 0 },
          10: { available: data.r10 || 0 },
          5: { available: data.r5 || 0 },
          2: { available: data.r2 || 0 },
          1: { available: data.r1 || 0 },
        });
      }
    } catch (err) {
      console.error("Error fetching live drawer:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAvailable = () => {
    let total = 0;
    Object.entries(denominations).forEach(([denom, data]) => {
      const denomNum = Number(denom);
      total += (data.available || 0) * denomNum;
    });
    setTotalAvailable(total);
  };

  // Calculate value for each denomination (denomination × available count)
  const calculateDenominationValue = (denom) => {
    const denomNum = Number(denom);
    return (denominations[denom].available || 0) * denomNum;
  };

  // Styles
  const modalOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100,
    backdropFilter: "blur(8px)",
    animation: "fadeIn 0.3s ease-out"
  };

  const modalContent = {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    maxWidth: "800px",
    width: "95%",
    maxHeight: "90vh",
    overflowY: "auto",
    animation: "modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
  };

  const container = {
    display: "flex",
    flexDirection: "column",
    height: "100%"
  };

  const header = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: isMobile ? "14px 16px" : "18px 24px",
    background: "linear-gradient(90deg, #1e88e5 0%, #42a5f5 100%)",
    color: "white",
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
    borderBottom: "3px solid #307AC8"
  };

  const title = {
    fontSize: isMobile ? "20px" : "24px",
    fontWeight: "700",
    margin: 0,
    letterSpacing: "0.5px"
  };

  const closeButton = {
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "white",
    fontSize: "20px",
    cursor: "pointer",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  };

  const infoBar = {
    display: "flex",
    gap: isMobile ? "12px" : "30px",
    padding: isMobile ? "12px 16px" : "16px 24px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    flexDirection: isMobile ? "column" : "row"
  };

  const infoItem = {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  };

  const infoLabel = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4b5563"
  };

  const infoValue = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
    background: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    border: "1px solid #e5e7eb"
  };

  const tableContainer = {
    padding: isMobile ? "20px 12px" : "24px 24px",
    overflowX: "auto"
  };

  const loadingStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    color: "#6b7280",
    fontSize: "16px"
  };

  const table = {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden"
  };

  const th = {
    background: "#1B91DA",
    color: "white",
    fontWeight: "600",
    fontSize: isMobile ? "12px" : "14px",
    padding: isMobile ? "10px 4px" : "12px 8px",
    textAlign: "center",
    border: "1px solid #ffffff33",
    whiteSpace: "nowrap"
  };

  const cell = {
    padding: isMobile ? "10px 4px" : "12px 8px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
    fontSize: isMobile ? "14px" : "16px",
    backgroundColor: "white",
    fontWeight: "500"
  };

  const valueCell = {
    padding: isMobile ? "10px 4px" : "12px 8px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
    fontSize: isMobile ? "14px" : "16px",
    backgroundColor: "#f0f9ff", // Light blue background for value row
    fontWeight: "600",
    color: "#059669" // Green color for values
  };

  const labelCell = {
    padding: isMobile ? "10px 12px" : "12px 16px",
    textAlign: "left",
    border: "1px solid #e5e7eb",
    fontWeight: "600",
    backgroundColor: "#f9fafb",
    color: "#1f2937",
    whiteSpace: "nowrap",
    fontSize: isMobile ? "14px" : "16px"
  };

  const valueLabelCell = {
    padding: isMobile ? "10px 12px" : "12px 16px",
    textAlign: "left",
    border: "1px solid #e5e7eb",
    fontWeight: "600",
    backgroundColor: "#e6f7ff", // Slightly different blue for value row label
    color: "#0369a1",
    whiteSpace: "nowrap",
    fontSize: isMobile ? "14px" : "16px"
  };

  const totalContainer = {
    margin: isMobile ? "0 12px 20px" : "0 24px 24px",
    padding: isMobile ? "16px 20px" : "20px 24px",
    background: "linear-gradient(135deg, #f0f9ff, #e6f0fa)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  const totalAmount = {
    fontSize: isMobile ? "14px" : "20px",
    fontWeight: "500",
    color: "#059669",
    background: "white",
    padding: isMobile ? "8px 24px" : "10px 32px",
    borderRadius: "50px",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)"
  };

  const footer = {
    display: "flex",
    justifyContent: "space-between",
    padding: isMobile ? "16px 16px" : "20px 24px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    borderBottomLeftRadius: "16px",
    borderBottomRightRadius: "16px"
  };

  const closeButton2 = {
    padding: isMobile ? "10px 24px" : "12px 32px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: isMobile ? "14px" : "15px",
    fontWeight: "600",
    cursor: "pointer",
    backgroundColor: "white",
    color: "#4b5563",
    transition: "all 0.2s",
    minWidth: isMobile ? "100px" : "120px"
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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

      <div style={modalOverlay} onClick={onClose}>
        <div style={modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={container}>
            {/* Header */}
            <div style={header}>
              <h2 style={title}>Cash Counter - Available Balance</h2>
              <button 
                style={closeButton} 
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.3)";
                  e.target.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.2)";
                  e.target.style.transform = "scale(1)";
                }}
              >
                ✕
              </button>
            </div>

            {/* Date and Company Info */}
            <div style={infoBar}>
              <div style={infoItem}>
                <span style={infoLabel}>Date:</span>
                <span style={infoValue}>
                  {new Date().toLocaleDateString('en-IN')}
                </span>
              </div>
              <div style={infoItem}>
                <span style={infoLabel}>Company:</span>
                <span style={infoValue}>
                  {userData?.companyName || "001"}
                </span>
              </div>
            </div>

            {/* Denominations Table - Available and Value Rows */}
            <div style={tableContainer}>
              {loading ? (
                <div style={loadingStyle}>Loading cash counter data...</div>
              ) : (
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Particulars</th>
                      <th style={th}>500</th>
                      <th style={th}>200</th>
                      <th style={th}>100</th>
                      <th style={th}>50</th>
                      <th style={th}>20</th>
                      <th style={th}>10</th>
                      <th style={th}>5</th>
                      <th style={th}>2</th>
                      <th style={th}>1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Available Row */}
                    <tr>
                      <td style={labelCell}>Available (Count)</td>
                      {[500, 200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                        <td key={`avail-${denom}`} style={cell}>
                          {denominations[denom].available}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Value Row (denomination × available) */}
                    <tr>
                      <td style={valueLabelCell}>Value (₹)</td>
                      {[500, 200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                        <td key={`value-${denom}`} style={valueCell}>
                          ₹{calculateDenominationValue(denom).toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              )}
            </div>


            {/* Footer with only Close button */}
            <div style={footer}>
                <div >
                  <span style={totalAmount}>
                  Total Available: ₹{totalAvailable.toLocaleString('en-IN')}
              </span>
            </div>
              <button 
                style={closeButton2} 
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f3f4f6";
                  e.target.style.borderColor = "#307AC8";
                  e.target.style.color = "#307AC8";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.color = "#4b5563";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CashCounter;