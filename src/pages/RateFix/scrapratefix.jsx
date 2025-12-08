import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ScrapRateFixing() {
  // State for scrap rates - initially empty
  const [scrapRates, setScrapRates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // API configuration
  const API_BASE_URL = "http://dikshiserver/spstorewebapi/api";
  
  const API_ENDPOINTS = {
    getScrapRates: "ScrapRateFixing/getFullScrapRateFixing",
    updateScrapRates: "ScrapRateFixing/updateFullScrapRateFixing"
  };
  
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

  // Fetch scrap rates from API
  const fetchScrapRates = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get(
        `${API_BASE_URL}/${API_ENDPOINTS.getScrapRates}`
      );
      
      console.log("API Response:", response.data); // Debug log
      
      // Transform API data to match your component structure
      const transformedData = response.data.map((item, index) => ({
        id: index + 1,
        scrapCode: item.fcode || item.scrapCode || "",
        scrapName: item.fname || item.scrapName || "",
        rate: item.frate || item.rate || ""
      }));
      
      setScrapRates(transformedData);
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching scrap rates:", error);
      setMessage({
        type: "error",
        text: `Failed to load scrap rates: ${error.message}`
      });
      setIsFetching(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
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

  // Handle Enter key press
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Find next input field
      const nextIndex = index + 1;
      if (nextIndex < rateInputRefs.current.length) {
        rateInputRefs.current[nextIndex]?.focus();
      } else {
        // If last input, focus update button
        document.querySelector('button[type="button"]')?.focus();
      }
    }
  };

  // Handle update button click
  const handleUpdate = async () => {
    // First, validate the data
    const validationResult = validateScrapRates();
    if (!validationResult.isValid) {
      setMessage({
        type: "error",
        text: validationResult.message
      });
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
      return;
    }
    
    setLoading(true);
    
    try {
      // Transform data to match API format
      const apiData = scrapRates.map(scrap => ({
        fcode: scrap.scrapCode,
        fname: scrap.scrapName,
        frate: scrap.rate || "0" // Send 0 if rate is empty
      }));
      
      console.log("Sending data:", apiData); // Debug log
      
      // Send PUT request to update scrap rates
      const response = await axios.put(
        `${API_BASE_URL}/${API_ENDPOINTS.updateScrapRates}`,
        apiData,
        {
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Update response:", response.data); // Debug log
      
      if (response.data && response.data.message) {
        setMessage({
          type: "success",
          text: response.data.message
        });
      } else {
        setMessage({
          type: "success",
          text: "Scrap rates updated successfully!"
        });
      }
      
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
      
      setMessage({
        type: "error",
        text: errorMessage
      });
    } finally {
      setLoading(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
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

  // Handle clear button click
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all rate values?")) {
      setScrapRates(prev => 
        prev.map(scrap => ({ ...scrap, rate: "" }))
      );
      setMessage({
        type: "success",
        text: "All rate values have been cleared."
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchScrapRates();
    setMessage({
      type: "info",
      text: "Refreshing scrap rates..."
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
      padding: isMobile ? '20px 12px' : '30px 20px',
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
          
          @media (max-width: 768px) {
            .table-container {
              font-size: 14px;
            }
            th, td {
              padding: 8px !important;
            }
            input {
              font-size: 14px !important;
              padding: 6px 8px !important;
            }
          }
        `}
      </style>

      <div style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : '900px',
        background: colors.cardBg,
        borderRadius: '12px',
        padding: isMobile ? '20px' : '30px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.3s ease'
      }}>
        {/* Header Section with Refresh Button */}
        <div style={{
          marginBottom: '25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '24px' : '28px',
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
              fontSize: isMobile ? '14px' : '16px',
              color: colors.muted,
              margin: '0',
              fontWeight: '400'
            }}>
              Edit rates directly in the table below.
            </p>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isFetching || loading}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: `1px solid ${colors.border}`,
              background: '#ffffff',
              color: colors.primary,
              fontWeight: '500',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              if (!isFetching && !loading) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.target.style.borderColor = colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = colors.border;
            }}
          >
            {isFetching ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  border: `2px solid rgba(48, 122, 200, 0.3)`,
                  borderTop: `2px solid ${colors.primary}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Loading...
              </span>
            ) : (
              <>
                <span>↻</span>
                Refresh
              </>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div style={{
          marginBottom: '25px'
        }}>
          <input
            type="text"
            placeholder="Search by scrap name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `2px solid ${colors.border}`,
              fontSize: '16px',
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

        {/* Message Display */}
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            animation: 'slideIn 0.3s ease',
            background: message.type === 'error' ? '#fef2f2' : 
                      message.type === 'success' ? '#f0fdf4' : '#eff6ff',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : 
                     message.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
            color: message.type === 'error' ? '#991b1b' : 
                   message.type === 'success' ? '#065f46' : '#1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>
                {message.type === 'error' ? '❌' : 
                 message.type === 'success' ? '✅' : 'ℹ️'}
              </span>
              <span style={{ fontWeight: '500' }}>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '0',
                lineHeight: '1'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Scrap Rates Table */}
        <div style={{
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
          marginBottom: '30px',
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
                    padding: '16px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '16px',
                    borderRight: `1px solid rgba(255,255,255,0.1)`
                  }}>
                    Scrap Code
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '16px',
                    borderRight: `1px solid rgba(255,255,255,0.1)`
                  }}>
                    Scrap Name
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '16px'
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
                        padding: '16px',
                        fontWeight: '600',
                        color: colors.primary,
                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}>
                        {scrap.scrapCode}
                      </td>
                      <td style={{
                        padding: '16px',
                        color: '#1e293b',
                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}>
                        {scrap.scrapName}
                      </td>
                      <td style={{
                        padding: '16px',
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
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: `1px solid ${scrap.rate ? colors.success : colors.border}`,
                            fontSize: '15px',
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
          fontSize: '14px',
          color: colors.muted
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

        {/* Clear and Update Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Clear Button */}
          <button
            onClick={handleClear}
            disabled={loading || isFetching || scrapRates.length === 0}
            style={{
              padding: '10px 30px',
              borderRadius: '50px',
              border: `1px solid ${colors.border}`,
              background: '#ffffff',
              color: loading || isFetching || scrapRates.length === 0 ? '#cbd5e1' : colors.muted,
              fontWeight: '600',
              fontSize: '15px',
              cursor: loading || isFetching || scrapRates.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              height: '42px',
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

          {/* Update Button */}
          <button
            onClick={handleUpdate}
            disabled={loading || isFetching || scrapRates.length === 0}
            style={{
              padding: '10px 30px',
              borderRadius: '50px',
              border: 'none',
              background: loading || isFetching || scrapRates.length === 0 ? 
                `linear-gradient(135deg, #cbd5e1, #e2e8f0)` :
                `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '15px',
              cursor: loading || isFetching || scrapRates.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px',
              boxShadow: loading || isFetching || scrapRates.length === 0 ? 
                'none' : '0 4px 12px rgba(48, 122, 200, 0.25)',
              height: '42px',
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
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}