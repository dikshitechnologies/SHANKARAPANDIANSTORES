import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Input, Button, Spin } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';

const COLORS = {
  primary: '#306AC8',
  secondary: '#1B91DA',
  tertiary: '#06A7EA',
};

// UNIVERSAL OPTION-C BUTTON + INPUT GLOW STYLE - BLUE ONLY
const glowStyle = {
  boxShadow: '0 0 0 3px rgba(48, 106, 200, 0.2)',
  border: '1px solid #306AC8',
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
};

// --- Inline PopupListSelector Component ---
const InlinePopupListSelector = ({
  open,
  onClose,
  onSelect,
  fetchItems,
  title = 'Select Item',
  displayFieldKeys = [],
  searchFields = [],
  headerNames = [],
  columnWidths = {},
  maxHeight = '70vh',
  searchPlaceholder = 'Search...',
}) => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const listRef = React.useRef(null);
  const searchInputRef = React.useRef(null);

  // Initial Loading When Popup Opens
  useEffect(() => {
    if (open) {
      setInitialLoading(true);
      setPage(1);
      setHasMore(true);
      setSearchText('');
      setSelectedIndex(-1);

      loadData(1, '', true);

      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 100);
    }
  }, [open]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        setPage(1);
        setHasMore(true);
        loadData(1, searchText, true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch + Filter Data
  const loadData = async (pageNum, search, reset = false) => {
    setLoading(true);
    if (reset) setInitialLoading(true);

    try {
      const items = await fetchItems(pageNum, search);

      if (reset) {
        setData(items);
        setFilteredData(filterItems(items, searchText));
      } else {
        setData(prev => [...prev, ...items]);
        setFilteredData(prev => [...prev, ...filterItems(items, searchText)]);
      }

      if (items.length < 20) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading items:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const filterItems = (items, search) => {
    if (!search || searchFields.length === 0) return items;
    
    return items.filter(item =>
      searchFields.some(field =>
        item[field]?.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  // Keyboard Navigation
  const handleKeyDown = useCallback((e) => {
    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < filteredData.length - 1 ? prev + 1 : prev);
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredData[selectedIndex]) {
          onSelect(filteredData[selectedIndex]);
          handleClose();
        }
        break;

      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
    }
  }, [open, filteredData, selectedIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClose = () => {
    setSearchText('');
    setSelectedIndex(-1);
    onClose();
  };

  const handleSelect = (item) => {
    onSelect(item);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
      style={{ top: '30px' }}
      closeIcon={<CloseOutlined style={{ 
        color: '#FFFFFF',
        fontSize: '14px',
      }} />}
      className="image-popup-modal"
      title={
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 600, 
          color: '#FFFFFF',
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif"
        }}>
          {title}
        </div>
      }
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '450px',
        background: '#fff'
      }}>
        {/* Search Bar - UPDATED DESIGN ONLY */}
        <div style={{ 
          padding: '16px 20px',
          borderBottom: '1px solid #e8e8e8',
          background: '#fff'
        }}>
          <div style={{ 
            position: 'relative',
            width: '100%'
          }}>
            <SearchOutlined style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999',
              fontSize: '16px',
            }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                padding: '10px 12px 10px 38px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                width: '100%',
                fontSize: '14px',
                background: '#fff',
                outline: 'none',
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                boxSizing: 'border-box',
                fontWeight: 400,
                color: '#333',
                height: '40px',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#306AC8';
                e.target.style.boxShadow = '0 0 0 3px rgba(48, 106, 200, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d9d9d9';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Table Header - YOUR DATA HEADERS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr 1fr',
          padding: '12px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e8e8e8',
          fontWeight: 600,
          fontSize: '14px',
          color: '#306AC8',
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
          letterSpacing: '0.01em',
        }}>
          {headerNames.map((header, index) => (
            <span key={index} style={{ color: '#306AC8' }}>{header}</span>
          ))}
        </div>

        {/* List Items - YOUR DATA */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          background: '#fff'
        }} ref={listRef}>
          {initialLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999',
              fontSize: '14px',
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
              fontWeight: 400,
            }}>
              <Spin size="large" />
              <div style={{ marginTop: '10px' }}>Loading items...</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999',
              fontSize: '14px',
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
              fontWeight: 400,
            }}>
              {searchText ? 'No items found. Try a different search term.' : 'No items available.'}
            </div>
          ) : (
            filteredData.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.5fr 1fr',
                  padding: '12px 20px',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  backgroundColor: selectedIndex === index ? '#f0f7ff' : 'transparent',
                  borderLeft: selectedIndex === index ? '3px solid #306AC8' : 'none',
                  alignItems: 'center',
                  minHeight: '48px',
                }}
                onClick={() => handleSelect(item)}
                onMouseEnter={(e) => {
                  if (selectedIndex !== index) e.target.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (selectedIndex !== index) e.target.style.backgroundColor = 'transparent';
                }}
              >
                {displayFieldKeys.map((key, idx) => (
                  <span key={idx} style={{ 
                    color: selectedIndex === index ? '#306AC8' : '#333', 
                    fontWeight: selectedIndex === index ? 600 : 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {key === 'rate' ? `$${item[key]}` : item[key]}
                  </span>
                ))}
              </div>
            ))
          )}

          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#999',
              fontSize: '14px',
            }}>
              <Spin size="small" />
              <span style={{ marginLeft: '10px' }}>Loading...</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
// --- End of Inline PopupListSelector Component ---

const ScrapRateFixManagement = () => {
  const [scrapRates, setScrapRates] = useState([
    { id: 1, date: '2023-11-15', name: 'Metal Scrap', rate: '45.50' },
    { id: 2, date: '2023-11-10', name: 'Plastic Scrap', rate: '12.75' },
    { id: 3, date: '2023-11-05', name: 'Paper Scrap', rate: '8.25' },
  ]);

  const [formData, setFormData] = useState({ date: '', name: '', rate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  // State for list selector popup
  const [showListSelector, setShowListSelector] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState(null);
  const [currentAction, setCurrentAction] = useState('add'); // 'add', 'edit', or 'delete'

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
    if (currentAction === 'add') {
      const newRate = {
        id: scrapRates.length + 1,
        ...formData,
      };
      setScrapRates([...scrapRates, newRate]);
      setFormData({ date: '', name: '', rate: '' });
      setSelectedRateId(null);
    } else if (currentAction === 'edit' && selectedRateId) {
      // Update the selected scrap rate
      setScrapRates(prev => prev.map(rate =>
        rate.id === selectedRateId ? { ...rate, ...formData } : rate
      ));
      setFormData({ date: '', name: '', rate: '' });
      setSelectedRateId(null);
    } else if (currentAction === 'delete' && selectedRateId) {
      // Delete the selected scrap rate
      setScrapRates(prev => prev.filter(rate => rate.id !== selectedRateId));
      setFormData({ date: '', name: '', rate: '' });
      setSelectedRateId(null);
    }
    setCurrentAction('add');
  };

  const handleActionClick = (action) => {
    setCurrentAction(action);
    
    if (action === 'add') {
      // For add action, clear the form
      setFormData({ date: '', name: '', rate: '' });
      setSelectedRateId(null);
    } else if (action === 'edit' || action === 'delete') {
      // For edit and delete actions, open the list selector popup
      setShowListSelector(true);
    }
  };

  // Function to fetch items for PopupListSelector
  const fetchScrapRates = async (pageNum, search) => {
    // Filter data based on search
    let filteredData = scrapRates;
    
    if (search) {
      filteredData = scrapRates.filter(rate =>
        rate.name.toLowerCase().includes(search.toLowerCase()) ||
        rate.date.toLowerCase().includes(search.toLowerCase()) ||
        rate.rate.toString().includes(search)
      );
    }
    
    // Simulate pagination
    const startIndex = (pageNum - 1) * 20;
    const endIndex = startIndex + 20;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(paginatedData);
      }, 300);
    });
  };

  // Handle selection from popup
  const handleSelectScrapRate = (selectedRate) => {
    setSelectedRateId(selectedRate.id);
    setShowListSelector(false);
    
    // Pre-fill form with selected rate data directly in the input fields
    setFormData({
      date: selectedRate.date,
      name: selectedRate.name,
      rate: selectedRate.rate
    });
  };

  const filteredRates = scrapRates.filter(
    (rate) =>
      rate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.rate.includes(searchTerm)
  );

  // Function to handle clear form
  const handleClearForm = () => {
    setFormData({ date: '', name: '', rate: '' });
    setSelectedRateId(null);
    setCurrentAction('add');
  };

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
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif";
            outline: none;
            minWidth: ${isMobile ? '30%' : '80px'};
            justify-content: center;
            flex: ${isMobile ? '1' : 'none'};
            boxSizing: 'border-box';
            letterSpacing: '0.01em';
            white-space: nowrap;
          }
          
          .action-pill:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(2,6,23,0.08);
            border-color: rgba(48,106,200,0.2);
          }
          
          .action-pill.primary {
            color: white;
            background: linear-gradient(180deg, #306AC8, #2A5FB5);
            border-color: rgba(48,106,200,0.3);
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

          /* POPUP MODAL DESIGN - EXACT STYLING FROM YOUR IMAGE */
          .image-popup-modal .ant-modal-content {
            padding: 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border: 1px solid #d0d0d0;
            border-top: 3px solid #306AC8;
          }
          
          .image-popup-modal .ant-modal-header {
            padding: 16px 20px;
            border-bottom: none;
            margin: 0;
            background: #306AC8;
            border-radius: 8px 8px 0 0;
          }
          
          .image-popup-modal .ant-modal-title {
            font-size: 16px;
            font-weight: 600;
            color: #FFFFFF;
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif";
          }
          
          .image-popup-modal .ant-modal-body {
            padding: 0;
            maxHeight: 500px;
            overflow: hidden;
            background: #fff;
          }
          
          .image-popup-modal .ant-modal-close {
            top: 16px;
            right: 20px;
            width: 24px;
            height: 24px;
          }
          
          .image-popup-modal .ant-modal-close-x {
            font-size: 14px;
            color: #FFFFFF;
            lineHeight: 24px;
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
            
            .image-popup-modal .ant-modal {
              max-width: 95%;
              margin: 10px auto;
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
          boxShadow: '0 15px 40px rgba(48, 106, 200, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(48, 106, 200, 0.08)',
          width: '100%',
        }}
      >
        {/* REST OF YOUR COMPONENT REMAINS EXACTLY THE SAME */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '20px' : '40px',
            flexWrap: 'wrap',
          }}
        >
          {/* LEFT PANEL - YOUR ORIGINAL CODE */}
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

            {/* Search Bar */}
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
                  fontSize: isMobile ? '15px' : '16px',
                  background: '#fafcff',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  boxSizing: 'border-box',
                  fontWeight: 500,
                  color: '#1e293b',
                }}
                onFocus={(e) => Object.assign(e.target.style, {
                  ...glowStyle,
                  background: 'white',
                  borderColor: '#306AC8',
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

            {/* Rates Table */}
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
                  fontSize: isMobile ? '14px' : '15px',
                  color: '#334155',
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
                      fontSize: isMobile ? '15px' : '16px',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer',
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                      gap: isMobile ? '8px' : '0',
                      alignItems: 'center',
                      backgroundColor: selectedRateId === rate.id ? '#f0f7ff' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRateId !== rate.id) e.target.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRateId !== rate.id) e.target.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => {
                      if (currentAction === 'edit' || currentAction === 'delete') {
                        // When clicking on a row, populate the form
                        setFormData({
                          date: rate.date,
                          name: rate.name,
                          rate: rate.rate
                        });
                        setSelectedRateId(rate.id);
                      }
                    }}
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
                      color: '#0f172a',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {rate.name}
                    </span>
                    <span style={{ 
                      color: '#0f172a',
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

          {/* RIGHT PANEL - YOUR ORIGINAL CODE */}
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
                  {currentAction === 'add' ? 'Create new scrap rate' : 
                   currentAction === 'edit' ? 'Edit selected scrap rate' : 
                   'Delete selected scrap rate'}
                </p>
              </div>

              {/* Action Buttons Container */}
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
                    className={`action-pill ${currentAction === 'add' ? 'primary' : ''}`}
                    onClick={() => handleActionClick('add')}
                    onKeyDown={(e) => e.key === 'Enter' && handleActionClick('add')}
                    role="button"
                    tabIndex={0}
                    title="Add new scrap rate"
                  >
                    <Icon.Plus size={12} />
                    Add
                  </div>
                  <div
                    className={`action-pill ${currentAction === 'edit' ? 'warn' : ''}`}
                    onClick={() => handleActionClick('edit')}
                    onKeyDown={(e) => e.key === 'Enter' && handleActionClick('edit')}
                    role="button"
                    tabIndex={0}
                    title="Edit scrap rate"
                  >
                    <Icon.Edit size={12} />
                    Edit
                  </div>
                  <div
                    className={`action-pill ${currentAction === 'delete' ? 'danger' : ''}`}
                    onClick={() => handleActionClick('delete')}
                    onKeyDown={(e) => e.key === 'Enter' && handleActionClick('delete')}
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

            {/* FORM */}
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
                        fontSize: isMobile ? '14px' : '15px',
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
                          fontSize: isMobile ? '15px' : '16px',
                          background: 'white',
                          color: '#0f172a',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontWeight: 500,
                        }}
                        onFocus={(e) => Object.assign(e.target.style, {
                          ...glowStyle,
                          background: 'white',
                          borderColor: '#306AC8',
                        })}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none';
                          e.target.style.border = '2px solid #e1e8f0';
                          e.target.style.outline = 'none';
                        }}
                        required
                        readOnly={currentAction === 'delete'}
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
                      background: currentAction === 'delete' 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : currentAction === 'edit'
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #306AC8 0%, #2A5FB5 100%)',
                      borderRadius: isMobile ? '10px' : '10px',
                      border: 'none',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: isMobile ? '15px' : '16px',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: currentAction === 'delete'
                        ? '0 4px 12px rgba(239, 68, 68, 0.25)'
                        : currentAction === 'edit'
                        ? '0 4px 12px rgba(245, 158, 11, 0.25)'
                        : '0 4px 12px rgba(48, 106, 200, 0.25)',
                      minWidth: isMobile ? '100%' : '140px',
                      outline: 'none',
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                      boxSizing: 'border-box',
                      letterSpacing: '0.01em',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = currentAction === 'delete'
                        ? '0 6px 20px rgba(239, 68, 68, 0.4)'
                        : currentAction === 'edit'
                        ? '0 6px 20px rgba(245, 158, 11, 0.4)'
                        : '0 6px 20px rgba(48, 106, 200, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = currentAction === 'delete'
                        ? '0 4px 12px rgba(239, 68, 68, 0.25)'
                        : currentAction === 'edit'
                        ? '0 4px 12px rgba(245, 158, 11, 0.25)'
                        : '0 4px 12px rgba(48, 106, 200, 0.25)';
                    }}
                    onFocus={(e) => Object.assign(e.target.style, {
                      ...glowStyle,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 0 0 3px rgba(48,106,200,0.2)',
                      borderColor: '#306AC8',
                    })}
                    onBlur={(e) => {
                      e.target.style.boxShadow = currentAction === 'delete'
                        ? '0 4px 12px rgba(239, 68, 68, 0.25)'
                        : currentAction === 'edit'
                        ? '0 4px 12px rgba(245, 158, 11, 0.25)'
                        : '0 4px 12px rgba(48, 106, 200, 0.25)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.border = 'none';
                      e.target.style.outline = 'none';
                    }}
                  >
                    {currentAction === 'delete' ? 'Delete' : currentAction === 'edit' ? 'Update' : 'Create'}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearForm}
                    style={{
                      padding: isMobile ? '14px 24px' : '16px 32px',
                      background: 'white',
                      borderRadius: isMobile ? '10px' : '10px',
                      border: '2px solid #e1e8f0',
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: isMobile ? '15px' : '16px',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      minWidth: isMobile ? '100%' : '140px',
                      outline: 'none',
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                      boxSizing: 'border-box',
                      letterSpacing: '0.01em',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#306AC8';
                      e.target.style.color = '#306AC8';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(48, 106, 200, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e1e8f0';
                      e.target.style.color = '#475569';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = '0 0 0 3px rgba(48,106,200,0.2)';
                      e.target.style.borderColor = '#306AC8';
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

      {/* USE INLINE POPUPLISTSELECTOR COMPONENT */}
      <InlinePopupListSelector
        open={showListSelector}
        onClose={() => {
          setShowListSelector(false);
          setSelectedRateId(null);
        }}
        onSelect={handleSelectScrapRate}
        fetchItems={fetchScrapRates}
        title={currentAction === 'edit' ? 'Select Scrap Rate to Edit' : 'Select Scrap Rate to Delete'}
        displayFieldKeys={['date', 'name', 'rate']}
        searchFields={['date', 'name', 'rate']}
        headerNames={['Date', 'Scrap Name', 'Rate']}
        searchPlaceholder="Search scrap rates by name, date, or rate..."
      />
    </div>
  );
};

// Fix for React Fast Refresh
if (typeof window !== 'undefined') {
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
}

export default ScrapRateFixManagement;