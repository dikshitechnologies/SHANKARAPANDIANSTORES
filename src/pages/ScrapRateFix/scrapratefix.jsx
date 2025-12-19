import React, { useState, useRef, useEffect } from "react";
import apiService from "../../api/apiService";
import { API_ENDPOINTS } from '../../api/endpoints';
import { toast } from "react-toastify";
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';

export default function ScrapRateFixing() {
  // State for scrap rates - initially empty
  const [scrapRates, setScrapRates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Array of refs for each rate input
  const rateInputRefs = useRef([]);
  

  // Your specified colors - kept exactly as before
  const colors = {
    primary: "#307AC8",
    secondary: "#1B91DA",
    tertiary: "#06A7EA",
    accent: "#2563eb",
    muted: "#64748b",
    background: "#f8fafc",
    cardBg: "#ffffff",
    border: "#e2e8f0",
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b"
  };

  // Check screen size for responsiveness
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Fetch scrap rates from API on component mount
  useEffect(() => {
    fetchScrapRates();
  }, []);

  // Initialize refs array
  useEffect(() => {
    rateInputRefs.current = rateInputRefs.current.slice(0, scrapRates.length);
  }, [scrapRates]);

  // Fetch scrap rates from API using apiService
  const fetchScrapRates = async () => {
    try {
      setIsFetching(true);
      
      const response = await apiService.get(API_ENDPOINTS.SCRAP_RATE_FIXING.GET_FULL_SCRAP_RATES);
      
      // The API returns the data directly (array), not wrapped in a data property
      let dataArray = response;
      
      // Check if response exists
      if (!dataArray) {
        throw new Error("No data received from server");
      }
      
      // If response is an array, use it directly
      if (Array.isArray(dataArray)) {
        // Transform API data to match your component structure
        const transformedData = dataArray.map((item, index) => ({
          id: index + 1,
          scrapCode: item.fcode || item.scrapCode || item.code || `SCR${String(index + 1).padStart(3, '0')}`,
          scrapName: item.fname || item.scrapName || item.name || `Scrap Item ${index + 1}`,
          rate: item.frate || item.rate || item.price || ""
        }));
        
        setScrapRates(transformedData);
        setIsFetching(false);
       
      } else {
        // If it's not an array, check if it's an object with data property
        if (dataArray.data && Array.isArray(dataArray.data)) {
          // Transform data from data.data
          const transformedData = dataArray.data.map((item, index) => ({
            id: index + 1,
            scrapCode: item.fcode || item.scrapCode || item.code || `SCR${String(index + 1).padStart(3, '0')}`,
            scrapName: item.fname || item.scrapName || item.name || `Scrap Item ${index + 1}`,
            rate: item.frate || item.rate || item.price || ""
          }));
          
          setScrapRates(transformedData);
          setIsFetching(false);
          toast.success("Scrap rates loaded successfully!");
        } else {
          throw new Error(`Unexpected response format: ${typeof dataArray}`);
        }
      }
      
    } catch (error) {
      console.error("Error fetching scrap rates:", error);
      
      // Set test data for development
      const testData = [
        { id: 1, scrapCode: "SCR001", scrapName: "Steel Scrap", rate: "100" },
        { id: 2, scrapCode: "SCR002", scrapName: "Copper Scrap", rate: "250" },
        { id: 3, scrapCode: "SCR003", scrapName: "Aluminum Scrap", rate: "80" },
        { id: 4, scrapCode: "SCR004", scrapName: "Brass Scrap", rate: "180" },
        { id: 5, scrapCode: "SCR005", scrapName: "Stainless Steel Scrap", rate: "120" },
      ];
      
      setScrapRates(testData);
      setIsFetching(false);
      toast.error(`Failed to load scrap rates: ${error.message}`, {
        autoClose: 5000,
      });
    }
  };

  // Handle rate input change
  const handleRateChange = (id, value) => {
    // Allow only numbers and decimal points
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    setScrapRates(prev => 
      prev.map(scrap => 
        scrap.id === id ? { ...scrap, rate: numericValue } : scrap
      )
    );
  };

  const handleKeyDown = (e, index) => {
    if (e.key !== 'Enter') return;

    e.preventDefault();
    e.stopPropagation();

    const nextIndex = index + 1;

    // Move to next input
    if (nextIndex < rateInputRefs.current.length) {
      rateInputRefs.current[nextIndex]?.focus();
      return;
    }

    // LAST INPUT
    // Focus Update button + open confirmation popup
    document.getElementById("updateRatesBtn")?.focus();
    setShowConfirmation(true);
  };

  // Handle update button click
  const handleUpdateClick = () => {
    // First, validate the data
    const validationResult = validateScrapRates();
    if (!validationResult.isValid) {
      toast.error(validationResult.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
   
    setShowConfirmation(true);
  };

  // Handle confirmation to update
  const handleConfirmUpdate = async () => {
    setShowConfirmation(false);
    setLoading(true);
    
    try {
      // Transform data to match API format
      const apiData = scrapRates.map(scrap => ({
        fcode: scrap.scrapCode,
        fname: scrap.scrapName,
        frate: scrap.rate || "0" // Send 0 if rate is empty
      }));
      
      // Send PUT request to update scrap rates using apiService
      const response = await apiService.put(
        API_ENDPOINTS.SCRAP_RATE_FIXING.UPDATE_FULL_SCRAP_RATES,
        apiData
      );
      
      // Show success toast
      toast.success("Scrap rates updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Refresh data from server to ensure consistency
      await fetchScrapRates();
      
    } catch (error) {
      console.error("Error updating scrap rates:", error);
      let errorMessage = "Failed to update scrap rates";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Validation function
  const validateScrapRates = () => {
    // Check if there are any rates
    if (scrapRates.length === 0) {
      return {
        isValid: false,
        message: "No scrap rates to update"
      };
    }
    
    // Check for invalid rates (non-numeric or negative)
    const invalidRates = scrapRates.filter(scrap => 
      scrap.rate !== "" && (isNaN(parseFloat(scrap.rate)) || parseFloat(scrap.rate) < 0)
    );
    
    if (invalidRates.length > 0) {
      return {
        isValid: false,
        message: `Invalid rate values found for: ${invalidRates.map(s => s.scrapName).join(', ')}`
      };
    }
    
    // Check for empty required fields
    const emptyFields = scrapRates.filter(scrap => 
      !scrap.scrapCode || !scrap.scrapName
    );
    
    if (emptyFields.length > 0) {
      return {
        isValid: false,
        message: "Some items are missing scrap code or name"
      };
    }
    
    return { isValid: true, message: "" };
  };

 const handleClearAll = () => {
  setShowClearConfirmation(true);
};
const handleConfirmClearAll = () => {
  setShowClearConfirmation(false);

  setScrapRates(prev =>
    prev.map(scrap => ({ ...scrap, rate: "" }))
  );

  toast.success("All rate values have been cleared.", {
    position: "top-right",
    autoClose: 3000,
  });
};


  // Filter scraps based on search term
  const filteredScrapRates = scrapRates.filter(scrap =>
    scrap.scrapName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scrap.scrapCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
      background: `linear-gradient(135deg, ${colors.background} 0%, #f1f5f9 100%)`,
      minHeight: '100vh',
      padding: isMobile ? '16px 10px' : '24px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
          
          input:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(48, 122, 200, 0.2);
          }
          
          tr:hover {
            background-color: rgba(48, 122, 200, 0.03);
          }
          
          button:hover:not(:disabled) {
            transform: translateY(-1px);
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .table-container {
              font-size: 14px;
            }
            th, td {
              padding: 10px !important;
            }
            input {
              font-size: 14px !important;
              padding: 8px 10px !important;
            }
            h1 {
              font-size: 22px !important;
            }
            button {
              font-size: 14px !important;
              padding: 8px 20px !important;
              min-width: 100px !important;
            }
          }

          @media (max-width: 480px) {
            .footer-stats {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }
            th, td {
              padding: 8px !important;
              font-size: 13px !important;
            }
            input {
              font-size: 13px !important;
              padding: 6px 8px !important;
            }
            .button-group {
              flex-direction: column;
              width: 100%;
            }
            .button-group button {
              width: 100%;
              margin-bottom: 8px;
            }
          }
        `}
      </style>

      <ConfirmationPopup
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmUpdate}
        title="Confirm Update"
        message="Are you sure you want to update the scrap rates?"
        type="success"
        confirmText={loading ? "Updating..." : "Confirm"}
        showLoading={loading}
        disableBackdropClose={loading}
      />
      <ConfirmationPopup
  isOpen={showClearConfirmation}
  onClose={() => setShowClearConfirmation(false)}
  onConfirm={handleConfirmClearAll}
  title="Clear All Rates"
  message="Are you sure you want to clear all rate values?"
  type="warning"
  confirmText="Clear"
  cancelText="Cancel"
  showIcon={true}
/>


      <div style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : '900px',
        background: colors.cardBg,
        borderRadius: '12px',
        padding: isMobile ? '16px' : '24px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.3s ease'
      }}>
        {/* Header Section */}
        <div style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: '700',
              margin: '0 0 5px 0',
              color: colors.primary,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Scrap Rate Fixing
            </h1>
            <p style={{
              fontSize: isMobile ? '13px' : '15px',
              color: colors.muted,
              margin: '0',
              fontWeight: '400'
            }}>
              Edit rates directly in the table below.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          marginBottom: '20px'
        }}>
          <input
            type="text"
            placeholder="Search by scrap name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: isMobile ? '10px 14px' : '12px 16px',
              borderRadius: '8px',
              border: `2px solid ${colors.border}`,
              fontSize: isMobile ? '14px' : '16px',
              background: '#ffffff',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
              color: colors.muted
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary;
              e.target.style.boxShadow = `0 0 0 3px rgba(48, 122, 200, 0.1)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border;
              e.target.style.boxShadow = 'none';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredScrapRates.length > 0) {
                e.preventDefault();
                rateInputRefs.current[0]?.focus();
              }
            }}
          />
        </div>

        {/* Scrap Rates Table */}
        <div style={{
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
          marginBottom: '25px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            overflowX: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: isMobile ? '500px' : 'auto'
            }}>
              <thead>
                <tr style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                }}>
                  <th style={{
                    padding: isMobile ? '12px' : '16px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    borderRight: `1px solid rgba(255,255,255,0.1)`
                  }}>
                    Scrap Code
                  </th>
                  <th style={{
                    padding: isMobile ? '12px' : '16px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    borderRight: `1px solid rgba(255,255,255,0.1)`
                  }}>
                    Scrap Name
                  </th>
                  <th style={{
                    padding: isMobile ? '12px' : '16px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px'
                  }}>
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {isFetching ? (
                  <tr>
                    <td colSpan="3" style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: colors.muted
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '15px'
                      }}>
                        <span style={{
                          width: '40px',
                          height: '40px',
                          border: `3px solid rgba(48, 122, 200, 0.2)`,
                          borderTop: `3px solid ${colors.primary}`,
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></span>
                        <span>Loading scrap rates...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredScrapRates.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: colors.muted,
                      fontStyle: 'italic'
                    }}>
                      {scrapRates.length === 0 ? 
                        'No scrap rates found. Please check the API connection.' : 
                        'No scrap items found matching your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredScrapRates.map((scrap, index) => (
                    <tr 
                      key={scrap.id}
                      style={{
                        borderBottom: index !== filteredScrapRates.length - 1 ? `1px solid ${colors.border}` : 'none',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <td style={{
                        padding: isMobile ? '12px' : '16px',
                        fontWeight: '600',
                        color: colors.primary,
                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                        fontSize: isMobile ? '13px' : '15px'
                      }}>
                        {scrap.scrapCode}
                      </td>
                      <td style={{
                        padding: isMobile ? '12px' : '16px',
                        color: '#1e293b',
                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                        fontSize: isMobile ? '13px' : '15px'
                      }}>
                        {scrap.scrapName}
                      </td>
                      <td style={{
                        padding: isMobile ? '12px' : '16px',
                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}>
                        <input
                          ref={el => rateInputRefs.current[index] = el}
                          type="text"
                          value={scrap.rate}
                          onChange={(e) => handleRateChange(scrap.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          placeholder="Enter rate"
                          style={{
                            width: '100%',
                            padding: isMobile ? '8px 10px' : '10px 12px',
                            borderRadius: '6px',
                            border: `1px solid ${scrap.rate ? colors.success : colors.border}`,
                            fontSize: isMobile ? '14px' : '15px',
                            fontWeight: scrap.rate ? '600' : '400',
                            color: scrap.rate ? '#059669' : '#64748b',
                            background: '#ffffff',
                            transition: 'all 0.2s',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = colors.primary;
                            e.target.style.boxShadow = `0 0 0 3px rgba(48, 122, 200, 0.1)`;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = scrap.rate ? colors.success : colors.border;
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '10px 0',
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
          fontSize: isMobile ? '12px' : '14px',
          color: colors.muted,
          flexWrap: 'wrap',
          gap: isMobile ? '8px' : '0'
        }}>
          <span>
            Total Items: <strong>{scrapRates.length}</strong>
          </span>
          <span>
            Showing: <strong>{filteredScrapRates.length}</strong>
            {searchTerm && ` (filtered)`}
          </span>
          <span>
            Items with rates: <strong>{scrapRates.filter(s => s.rate).length}</strong>
          </span>
        </div>

        {/* Clear All and Update Buttons - Both on Right Side */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Update Button */}
          <button
            id="updateRatesBtn"
            onClick={handleUpdateClick}
            disabled={loading || isFetching || scrapRates.length === 0}
            style={{
              padding: isMobile ? '10px 20px' : '12px 24px',
              borderRadius: '50px',
              border: 'none',
              background: loading || isFetching || scrapRates.length === 0 ? 
                `linear-gradient(135deg, #cbd5e1, #e2e8f0)` :
                `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              color: '#ffffff',
              fontWeight: '600',
              fontSize: isMobile ? '14px' : '15px',
              cursor: loading || isFetching || scrapRates.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              minWidth: isMobile ? '100px' : '120px',
              boxShadow: loading || isFetching || scrapRates.length === 0 ? 
                'none' : '0 4px 12px rgba(48, 122, 200, 0.25)',
              height: isMobile ? '38px' : '42px',
              opacity: loading || isFetching || scrapRates.length === 0 ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading && !isFetching && scrapRates.length > 0) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(48, 122, 200, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(48, 122, 200, 0.25)';
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{
                  width: '14px',
                  height: '14px',
                  border: `2px solid rgba(255,255,255,0.3)`,
                  borderTop: `2px solid #ffffff`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Updating...
              </span>
            ) : 'Update Rates'}
          </button>

          {/* Clear All Button - Moved to right side next to Update */}
          <button
            onClick={handleClearAll}
            disabled={loading || isFetching || scrapRates.length === 0}
            style={{
              padding: isMobile ? '10px 20px' : '12px 24px',
              borderRadius: '50px',
              border: `1px solid ${colors.border}`,
              background: '#ffffff',
              color: loading || isFetching || scrapRates.length === 0 ? '#cbd5e1' : colors.muted,
              fontWeight: '600',
              fontSize: isMobile ? '14px' : '15px',
              cursor: loading || isFetching || scrapRates.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              minWidth: isMobile ? '100px' : '120px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              height: isMobile ? '38px' : '42px',
              opacity: loading || isFetching || scrapRates.length === 0 ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading && !isFetching && scrapRates.length > 0) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
                e.target.style.borderColor = colors.warning;
                e.target.style.color = colors.warning;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              e.target.style.borderColor = colors.border;
              e.target.style.color = colors.muted;
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}