import React, { useState, useEffect } from 'react';

const COLORS = {
  primary: '#306AC8',
  secondary: '#1B91DA',
  tertiary: '#06A7EA',
};

// UNIVERSAL OPTION-C BUTTON + INPUT GLOW STYLE - BLUE ONLY
const glowStyle = {
  boxShadow: '0 0 0 3px rgba(6,167,234,0.25)',
  border: '1px solid #06A7EA',
  outline: 'none',
};

// --- Inline SVG icons ---
const Icon = {
  Plus: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
    </svg>
  ),
  Edit: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  ),
  Trash: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  ),
  Close: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.29 19.71 2.88 18.29 9.18 12 2.88 5.71 4.29 4.29 10.59 10.59 16.88 4.29z" />
    </svg>
  ),
};

const ScrapRateFixManagement = () => {
  const [scrapRates, setScrapRates] = useState([
    { id: 1, date: '2023-11-15', name: 'Metal Scrap', rate: '45.50' },
    { id: 2, date: '2023-11-10', name: 'Plastic Scrap', rate: '12.75' },
    { id: 3, date: '2023-11-05', name: 'Paper Scrap', rate: '8.25' },
  ]);

  const [formData, setFormData] = useState({ date: '', name: '', rate: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentAction, setCurrentAction] = useState('Add');
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (popupAction === 'add') {
      const newRate = {
        id: scrapRates.length + 1,
        ...formData,
      };
      setScrapRates([...scrapRates, newRate]);
    }
    setFormData({ date: '', name: '', rate: '' });
    setShowPopup(false);
  };

  const openPopup = (action) => {
    setPopupAction(action);
    setCurrentAction(action.charAt(0).toUpperCase() + action.slice(1));
    setShowPopup(true);
  };

  const filteredRates = scrapRates.filter(
    (rate) =>
      rate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.rate.includes(searchTerm)
  );

  return (
    <div
      style={{
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        background: 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)',
        minHeight: '100vh',
        padding: isMobile ? '15px 10px' : '30px 20px',
        color: '#1a1a1a',
        overflowX: 'hidden',
        fontWeight: 400,
        lineHeight: 1.6,
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
          
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* LEDGER-STYLE ACTION BUTTONS - SMALLER SIZE */
          .action-pill {
            display: inline-flex;
            gap: 6px;
            align-items: center;
            padding: ${isMobile ? '8px 10px' : '10px 14px'};
            border-radius: 999px;
            background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(250,250,252,0.9));
            border: 1px solid rgba(255,255,255,0.45);
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(2,6,23,0.04);
            font-weight: 600;
            font-size: ${isMobile ? '12px' : '13px'};
            color: #334155;
            transition: all 0.2s ease;
            font-family: "'Inter', 'SF Pro Display', -apple-system, sans-serif";
            outline: none;
            min-width: ${isMobile ? '30%' : '80px'};
            justify-content: center;
            flex: ${isMobile ? '1' : 'none'};
            box-sizing: border-box;
            letter-spacing: 0.01em;
            white-space: nowrap;
          }
          
          .action-pill:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(2,6,23,0.08);
            border-color: rgba(48,122,200,0.2);
          }
          
          .action-pill.primary {
            color: white;
            background: linear-gradient(180deg, #306AC8, #1B91DA);
            border-color: rgba(48,122,200,0.3);
          }
          
          .action-pill.warn {
            color: white;
            background: linear-gradient(180deg, #f59e0b, #f97316);
            border-color: rgba(245,158,11,0.3);
          }
          
          .action-pill.danger {
            color: white;
            background: linear-gradient(180deg, #ef4444, #f97373);
            border-color: rgba(239,68,68,0.3);
          }

          /* Responsive media queries */
          @media (max-width: 768px) {
            input, button, select, textarea {
              font-size: 16px !important;
            }
            
            button {
              min-height: 44px;
            }
            
            input, select {
              min-height: 44px;
            }
          }

          @media (max-width: 480px) {
            .action-buttons {
              flex-direction: column;
              width: 100%;
            }
            
            .action-buttons button {
              width: 100%;
            }
          }
        `}
      </style>

      <div
        style={{
          background: 'white',
          borderRadius: isMobile ? '12px' : '20px',
          padding: isMobile ? '15px' : '30px',
          maxWidth: '1400px',
          margin: '0 auto',
          boxShadow: '0 15px 40px rgba(48, 122, 200, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(48, 122, 200, 0.08)',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '20px' : '40px',
            flexWrap: 'wrap',
          }}
        >
          {/* LEFT PANEL */}
          <div style={{ 
            flex: 1, 
            minWidth: isMobile ? '100%' : '350px',
            width: '100%',
          }}>
            <div style={{ marginBottom: isMobile ? '15px' : '25px' }}>
              <h2
                style={{
                  fontSize: isMobile ? '20px' : '26px',
                  fontWeight: 700,
                  marginBottom: '6px',
                  color: '#11303F',
                  letterSpacing: '-0.3px',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  lineHeight: 1.3,
                }}
              >
                Existing Scrap Rates
              </h2>
              <p style={{ 
                color: '#666', 
                fontSize: isMobile ? '13px' : '15px', 
                margin: 0,
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                fontWeight: 400,
                opacity: 0.8,
              }}>
                View and search through all scrap rate records
              </p>
            </div>

            {/* Search Bar - UPDATED FONT SIZE */}
            <div style={{ position: 'relative', marginBottom: isMobile ? '15px' : '25px' }}>
              <input
                type="text"
                placeholder="Search scrap rates by name or rate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: isMobile ? '12px 14px 12px 42px' : '14px 16px 14px 45px',
                  border: '2px solid #e1e8f0',
                  borderRadius: isMobile ? '10px' : '12px',
                  width: '100%',
                  fontSize: isMobile ? '15px' : '16px', // Increased from 14px/15px
                  background: '#fafcff',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  boxSizing: 'border-box',
                  fontWeight: 500, // Made bolder
                  color: '#1e293b', // Brighter text color
                }}
                onFocus={(e) => Object.assign(e.target.style, {
                  ...glowStyle,
                  background: 'white',
                  borderColor: '#06A7EA',
                })}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.border = '2px solid #e1e8f0';
                  e.target.style.background = '#fafcff';
                  e.target.style.outline = 'none';
                }}
              />
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: isMobile ? '16px' : '18px',
              }}>
                🔍
              </span>
            </div>

            {/* Rates Table - UPDATED FONT SIZES */}
            <div style={{
              background: '#fafcff',
              borderRadius: isMobile ? '10px' : '12px',
              border: '1px solid #e1e8f0',
              overflow: 'hidden',
              width: '100%',
            }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 1.5fr 0.8fr' : '1fr 2fr 1fr',
                  padding: isMobile ? '14px 16px' : '16px 20px',
                  background: '#f1f7ff',
                  borderBottom: '2px solid #e1e8f0',
                  fontWeight: 600,
                  fontSize: isMobile ? '14px' : '15px', // Increased
                  color: '#334155', // Brighter
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  gap: isMobile ? '8px' : '0',
                  letterSpacing: '0.01em',
                }}
              >
                <span>Date</span>
                <span>Scrap Name</span>
                <span>Rate</span>
              </div>

              <div style={{ 
                maxHeight: isMobile ? '250px' : '400px', 
                overflowY: 'auto',
                width: '100%',
              }}>
                {filteredRates.map((rate) => (
                  <div
                    key={rate.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr 1.5fr 0.8fr' : '1fr 2fr 1fr',
                      padding: isMobile ? '12px 16px' : '16px 20px',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: isMobile ? '15px' : '16px', // Increased from 14px/15px
                      transition: 'background-color 0.2s',
                      cursor: 'pointer',
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                      gap: isMobile ? '8px' : '0',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ 
                      color: '#475569', 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {rate.date}
                    </span>
                    <span style={{ 
                      color: '#0f172a', // Brighter, darker color
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {rate.name}
                    </span>
                    <span style={{ 
                      color: '#0f172a', // Brighter, darker color
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                    }}>
                      ${rate.rate}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {filteredRates.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: isMobile ? '20px 15px' : '40px 20px',
                color: '#64748b',
                fontSize: isMobile ? '14px' : '15px',
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                fontWeight: 400,
              }}>
                No scrap rates found. Try a different search term.
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div style={{ 
            flex: 1, 
            minWidth: isMobile ? '100%' : '350px',
            width: '100%',
          }}>
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'flex-start',
                marginBottom: isMobile ? '20px' : '30px',
                flexWrap: 'wrap',
                gap: isMobile ? '12px' : '20px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: isMobile ? '20px' : '26px',
                    fontWeight: 700,
                    marginBottom: '6px',
                    color: '#11303F',
                    letterSpacing: '-0.3px',
                    fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                    lineHeight: 1.3,
                  }}
                >
                  Scrap Rate Fix Card
                </h2>
                <p style={{ 
                  color: '#666', 
                  fontSize: isMobile ? '13px' : '15px', 
                  margin: 0,
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  fontWeight: 400,
                  opacity: 0.8,
                }}>
                  Create or modify scrap rate entries
                </p>
              </div>

              {/* Action Buttons Container - SMALLER BUTTONS */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: isMobile ? '8px' : '12px',
                minWidth: isMobile ? '100%' : '250px',
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
                width: isMobile ? '100%' : 'auto',
              }}>
                <div style={{ 
                  display: 'flex', 
                  gap: isMobile ? '6px' : '8px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: isMobile ? 'space-between' : 'flex-end',
                }}>
                  <div
                    className={`action-pill ${popupAction === 'add' ? 'primary' : ''}`}
                    onClick={() => openPopup('add')}
                    onKeyDown={(e) => e.key === 'Enter' && openPopup('add')}
                    role="button"
                    tabIndex={0}
                    title="Add new scrap rate"
                  >
                    <Icon.Plus size={12} />
                    Add
                  </div>
                  <div
                    className={`action-pill ${popupAction === 'edit' ? 'warn' : ''}`}
                    onClick={() => openPopup('edit')}
                    onKeyDown={(e) => e.key === 'Enter' && openPopup('edit')}
                    role="button"
                    tabIndex={0}
                    title="Edit scrap rate"
                  >
                    <Icon.Edit size={12} />
                    Edit
                  </div>
                  <div
                    className={`action-pill ${popupAction === 'delete' ? 'danger' : ''}`}
                    onClick={() => openPopup('delete')}
                    onKeyDown={(e) => e.key === 'Enter' && openPopup('delete')}
                    role="button"
                    tabIndex={0}
                    title="Delete scrap rate"
                  >
                    <Icon.Trash size={12} />
                    Delete
                  </div>
                </div>
              </div>
            </div>

            {/* FORM - UPDATED INPUT FIELDS */}
            <div style={{
              background: '#fafcff',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '20px' : '28px',
              border: '1px solid #e1e8f0',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <form onSubmit={handleSubmit}>
                {[
                  { field: 'date', label: 'Date', type: 'date' },
                  { field: 'name', label: 'Scrap Name', type: 'text' },
                  { field: 'rate', label: 'Rate ($)', type: 'number' }
                ].map(({ field, label, type }) => (
                  <div key={field} style={{ marginBottom: isMobile ? '18px' : '24px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        fontSize: isMobile ? '14px' : '15px', // Increased
                        color: '#334155',
                        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: '0.01em',
                      }}
                    >
                      {label}
                    </label>

                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type={type}
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        step={field === 'rate' ? '0.01' : undefined}
                        placeholder={field === 'rate' ? '0.00' : field === 'name' ? 'Enter scrap material name' : ''}
                        style={{
                          padding: isMobile ? '12px 14px' : '14px 16px',
                          width: '100%',
                          border: '2px solid #e1e8f0',
                          borderRadius: isMobile ? '10px' : '10px',
                          fontSize: isMobile ? '15px' : '16px', // Increased from 14px/15px
                          background: 'white',
                          color: '#0f172a', // Brighter, darker color
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontWeight: 500, // Made bolder
                        }}
                        onFocus={(e) => Object.assign(e.target.style, {
                          ...glowStyle,
                          background: 'white',
                          borderColor: '#06A7EA',
                        })}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none';
                          e.target.style.border = '2px solid #e1e8f0';
                          e.target.style.outline = 'none';
                        }}
                        required
                      />
                      {field === 'rate' && (
                        <span style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94a3b8',
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: 500,
                          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                        }}>
                          USD
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Form Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'flex-end',
                    gap: isMobile ? '12px' : '16px',
                    marginTop: isMobile ? '28px' : '32px',
                    paddingTop: isMobile ? '20px' : '24px',
                    borderTop: '1px solid #e1e8f0',
                    width: '100%',
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      padding: isMobile ? '14px 24px' : '16px 32px',
                      background: 'linear-gradient(135deg, #06A7EA 0%, #1B91DA 100%)',
                      borderRadius: isMobile ? '10px' : '10px',
                      border: 'none',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: isMobile ? '15px' : '16px', // Increased
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(6, 167, 234, 0.25)',
                      minWidth: isMobile ? '100%' : '140px',
                      outline: 'none',
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                      boxSizing: 'border-box',
                      letterSpacing: '0.01em',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(6, 167, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                    }}
                    onFocus={(e) => Object.assign(e.target.style, {
                      ...glowStyle,
                      transform: 'translateY(-2px)',
                    })}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.outline = 'none';
                    }}
                  >
                    Create
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ date: '', name: '', rate: '' })}
                    style={{
                      padding: isMobile ? '14px 24px' : '16px 32px',
                      background: 'white',
                      borderRadius: isMobile ? '10px' : '10px',
                      border: '2px solid #e1e8f0',
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: isMobile ? '15px' : '16px', // Increased
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      minWidth: isMobile ? '100%' : '140px',
                      outline: 'none',
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                      boxSizing: 'border-box',
                      letterSpacing: '0.01em',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#1B91DA';
                      e.target.style.color = '#1B91DA';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(48, 122, 200, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e1e8f0';
                      e.target.style.color = '#475569';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = '0 0 0 3px rgba(6,167,234,0.25)';
                      e.target.style.borderColor = '#06A7EA';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = '#e1e8f0';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.outline = 'none';
                    }}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL - Responsive - UPDATED INPUT FIELDS */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '10px' : '20px',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            overflowY: 'auto',
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: isMobile ? '14px' : '16px',
              width: '100%',
              maxWidth: isMobile ? '95%' : '500px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'modalSlideIn 0.3s ease-out',
              maxHeight: isMobile ? '90vh' : 'auto',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #306AC8 0%, #1B91DA 100%)',
                color: 'white',
                padding: isMobile ? '18px 22px' : '22px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <h3 style={{ 
                margin: 0, 
                fontSize: isMobile ? '18px' : '20px', 
                fontWeight: 600,
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                flex: 1,
                letterSpacing: '-0.01em',
              }}>
                {popupAction === 'add' && 'Add New Scrap Rate'}
                {popupAction === 'edit' && 'Edit Scrap Rate'}
                {popupAction === 'delete' && 'Delete Scrap Rate'}
              </h3>

              <button
                onClick={() => setShowPopup(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  fontSize: isMobile ? '24px' : '28px',
                  color: 'white',
                  cursor: 'pointer',
                  width: isMobile ? '32px' : '36px',
                  height: isMobile ? '32px' : '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  outline: 'none',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  flexShrink: 0,
                  marginLeft: '12px',
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onFocus={(e) => e.target.style.outline = 'none'}
              >
                <Icon.Close size={20} />
              </button>
            </div>

            <div style={{ 
              padding: isMobile ? '22px 18px' : '32px 28px',
              overflowY: 'auto',
              maxHeight: isMobile ? 'calc(90vh - 70px)' : 'none',
            }}>
              {popupAction === 'delete' ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: isMobile ? '22px' : '28px' }}>
                    <div style={{
                      fontSize: isMobile ? '40px' : '48px',
                      marginBottom: '16px',
                    }}>
                      ⚠️
                    </div>
                    <p style={{ 
                      fontSize: isMobile ? '15px' : '16px', 
                      color: '#1e293b',
                      lineHeight: 1.6,
                      margin: 0,
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                      fontWeight: 400,
                    }}>
                      Are you sure you want to delete this scrap rate?<br />
                      This action cannot be undone.
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      justifyContent: 'flex-end',
                      gap: isMobile ? '12px' : '12px',
                      width: '100%',
                    }}
                  >
                    <button
                      style={{
                        padding: isMobile ? '14px 24px' : '16px 32px',
                        background: 'linear-gradient(135deg, #06A7EA 0%, #1B91DA 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: isMobile ? '10px' : '10px',
                        fontWeight: 600,
                        fontSize: isMobile ? '15px' : '16px', // Increased
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        boxShadow: '0 4px 12px rgba(6, 167, 234, 0.25)',
                        minWidth: isMobile ? '100%' : '140px',
                        outline: 'none',
                        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                        boxSizing: 'border-box',
                        letterSpacing: '0.01em',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(6, 167, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.boxShadow = '0 0 0 3px rgba(6,167,234,0.25), 0 4px 12px rgba(6, 167, 234, 0.25)';
                      }}
                      onBlur={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                      }}
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => setShowPopup(false)}
                      style={{
                        padding: isMobile ? '14px 24px' : '16px 32px',
                        background: 'white',
                        color: '#475569',
                        border: '2px solid #e1e8f0',
                        borderRadius: isMobile ? '10px' : '10px',
                        fontWeight: 600,
                        fontSize: isMobile ? '15px' : '16px', // Increased
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        minWidth: isMobile ? '100%' : '140px',
                        outline: 'none',
                        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                        boxSizing: 'border-box',
                        letterSpacing: '0.01em',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#1B91DA';
                        e.target.style.color = '#1B91DA';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#e1e8f0';
                        e.target.style.color = '#475569';
                        e.target.style.transform = 'translateY(0)';
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.boxShadow = '0 0 0 3px rgba(6,167,234,0.25)';
                        e.target.style.borderColor = '#06A7EA';
                      }}
                      onBlur={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.boxShadow = 'none';
                        e.target.style.borderColor = '#e1e8f0';
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit}>
                  {[
                    { field: 'date', label: 'Date', type: 'date' },
                    { field: 'name', label: 'Scrap Name', type: 'text' },
                    { field: 'rate', label: 'Rate ($)', type: 'number' }
                  ].map(({ field, label, type }) => (
                    <div key={field} style={{ marginBottom: isMobile ? '20px' : '24px' }}>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: 600,
                          fontSize: isMobile ? '14px' : '15px', // Increased
                          color: '#334155',
                          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                          letterSpacing: '0.01em',
                        }}
                      >
                        {label}
                      </label>

                      <input
                        type={type}
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        step={field === 'rate' ? '0.01' : undefined}
                        placeholder={field === 'rate' ? '0.00' : ''}
                        style={{
                          padding: isMobile ? '14px 16px' : '14px 16px',
                          width: '100%',
                          border: '2px solid #e1e8f0',
                          borderRadius: isMobile ? '10px' : '10px',
                          fontSize: isMobile ? '15px' : '16px', // Increased
                          background: 'white',
                          color: '#0f172a', // Brighter, darker color
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontWeight: 500, // Made bolder
                        }}
                        onFocus={(e) => Object.assign(e.target.style, {
                          ...glowStyle,
                          background: 'white',
                          borderColor: '#06A7EA',
                        })}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none';
                          e.target.style.border = '2px solid #e1e8f0';
                          e.target.style.outline = 'none';
                        }}
                        required
                      />
                    </div>
                  ))}

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      justifyContent: 'flex-end',
                      gap: isMobile ? '12px' : '12px',
                      marginTop: isMobile ? '28px' : '32px',
                      width: '100%',
                    }}
                  >
                    <button
                      type="submit"
                      style={{
                        padding: isMobile ? '14px 24px' : '16px 32px',
                        background: 'linear-gradient(135deg, #06A7EA 0%, #1B91DA 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: isMobile ? '10px' : '10px',
                        fontWeight: 600,
                        fontSize: isMobile ? '15px' : '16px', // Increased
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        boxShadow: '0 4px 12px rgba(6, 167, 234, 0.25)',
                        minWidth: isMobile ? '100%' : '140px',
                        outline: 'none',
                        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                        boxSizing: 'border-box',
                        letterSpacing: '0.01em',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(6, 167, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.boxShadow = '0 0 0 3px rgba(6,167,234,0.25), 0 4px 12px rgba(6, 167, 234, 0.25)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      {popupAction === 'add' ? 'Create' : 'Update'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPopup(false)}
                      style={{
                        padding: isMobile ? '14px 24px' : '16px 32px',
                        background: 'white',
                        color: '#475569',
                        border: '2px solid #e1e8f0',
                        borderRadius: isMobile ? '10px' : '10px',
                        fontWeight: 600,
                        fontSize: isMobile ? '15px' : '16px', // Increased
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        minWidth: isMobile ? '100%' : '140px',
                        outline: 'none',
                        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                        boxSizing: 'border-box',
                        letterSpacing: '0.01em',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#1B91DA';
                        e.target.style.color = '#1B91DA';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#e1e8f0';
                        e.target.style.color = '#475569';
                        e.target.style.transform = 'translateY(0)';
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.boxShadow = '0 0 0 3px rgba(6,167,234,0.25)';
                        e.target.style.borderColor = '#06A7EA';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.boxShadow = 'none';
                        e.target.style.borderColor = '#e1e8f0';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapRateFixManagement;