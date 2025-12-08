import React, { useState, useRef, useEffect } from "react";

export default function ScrapRateFixing() {
  // Sample scrap rate data
  const [scrapRates, setScrapRates] = useState([
    { id: 1, scrapCode: "003", scrapName: "METAL", rate: "" },
    { id: 2, scrapCode: "004", scrapName: "PLASTIC", rate: "1800" },
    { id: 3, scrapCode: "005", scrapName: "PAPER", rate: "100" },
    { id: 4, scrapCode: "006", scrapName: "ELECTRONIC", rate: "100" },
    { id: 5, scrapCode: "007", scrapName: "GLASS", rate: "11600" },
    { id: 6, scrapCode: "008", scrapName: "WOOD", rate: "" },
    { id: 7, scrapCode: "010", scrapName: "RUBBER", rate: "2500" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  
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

  // Initialize refs array
  useEffect(() => {
    rateInputRefs.current = rateInputRefs.current.slice(0, scrapRates.length);
  }, [scrapRates]);

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
  const handleUpdate = () => {
    setLoading(true);
    
    // Validate that all rates are numbers
    const invalidRates = scrapRates.filter(scrap => 
      scrap.rate !== "" && isNaN(parseFloat(scrap.rate))
    );
    
    if (invalidRates.length > 0) {
      setMessage({
        type: "error",
        text: `Invalid rate values found for: ${invalidRates.map(s => s.scrapName).join(', ')}`
      });
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setMessage({
        type: "success",
        text: "Scrap rates updated successfully!"
      });
      setLoading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }, 1000);
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
        {/* Header Section - No underline */}
        <div style={{
          marginBottom: '25px'
        }}>
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

        {/* Search Bar - No icon */}
        <div style={{
          marginBottom: '25px'
        }}>
          <input
            type="text"
            placeholder="Search by scrap name..."
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
            background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            color: message.type === 'error' ? '#991b1b' : '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{
              fontSize: '18px'
            }}>
              {message.type === 'error' ? '❌' : '✅'}
            </span>
            <span style={{ fontWeight: '500' }}>{message.text}</span>
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
                {filteredScrapRates.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: colors.muted,
                      fontStyle: 'italic'
                    }}>
                      No scrap items found matching your search.
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

        {/* Clear and Update Buttons - Right side end of form */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Clear Button */}
          <button
            onClick={handleClear}
            disabled={loading}
            style={{
              padding: '10px 30px',
              borderRadius: '50px',
              border: `1px solid ${colors.border}`,
              background: '#ffffff',
              color: colors.muted,
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              height: '42px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
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
            disable={loading}
          >
            Clear
          </button>

          {/* Update Button */}
          <button
            onClick={handleUpdate}
            disabled={loading}
            style={{
              padding: '10px 30px',
              borderRadius: '50px',
              border: 'none',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px',
              boxShadow: '0 4px 12px rgba(48, 122, 200, 0.25)',
              height: '42px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(48, 122, 200, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(48, 122, 200, 0.25)';
            }}
            disable={loading}
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
            ) : 'Update'}
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