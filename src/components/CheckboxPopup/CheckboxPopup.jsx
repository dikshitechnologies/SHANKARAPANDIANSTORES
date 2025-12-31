// components/CheckboxPopup/CheckboxPopup.jsx
import React, { useState, useEffect, useRef } from 'react';

// Inline Icon components
const Icon = {
  Close: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.29 19.71 2.88 18.29 9.18 12 2.88 5.71 4.29 4.29 16.88 16.88z" />
    </svg>
  ),
  Search: ({ size = 16, color = "#6b7280" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill={color} d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  ),
};

const CheckboxPopup = ({
  open,
  onClose,
  onSelect,
  fetchItems,
  title,
  maxHeight = "60vh"
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    if (open) {
      loadItems();
      setSelectedCodes(new Set());
      setSelectAll(false);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const fetchedItems = await fetchItems(1, search);
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    loadItems();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const toggleItem = (code) => {
    const newSelected = new Set(selectedCodes);
    if (newSelected.has(code)) {
      newSelected.delete(code);
    } else {
      newSelected.add(code);
    }
    setSelectedCodes(newSelected);
    
    if (newSelected.size === 0) {
      setSelectAll(false);
    } else if (newSelected.size === items.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCodes(new Set());
      setSelectAll(false);
    } else {
      const allCodes = items.map(item => item.fcode).filter(code => code);
      setSelectedCodes(new Set(allCodes));
      setSelectAll(true);
    }
  };

  const handleConfirm = () => {
    if (selectedCodes.size > 0) {
      const selectedItems = items.filter(item => 
        item.fcode && selectedCodes.has(item.fcode)
      );
      
      if (selectedItems.length > 0) {
        const selectedItem = selectedItems[0];
        onSelect(selectedItem);
      }
    } else {
      onClose();
    }
  };

  const handleClear = () => {
    setSelectedCodes(new Set());
    setSelectAll(false);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div 
        className="modal" 
        ref={modalRef}
        style={{ 
          maxWidth: '500px',
          maxHeight: maxHeight,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: '35%',    
          marginTop: '13%', 
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '12px'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close"
          >
            <Icon.Close size={20} />
          </button>
        </div>

        <div style={{ 
          marginBottom: '16px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              <button
                onClick={handleSearchSubmit}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Search"
              >
                <Icon.Search size={16} color="#6b7280" />
              </button>
            </div>
          </div>
        </div>

        <div style={{ 
          marginBottom: '12px',
          padding: '8px 12px',
          background: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}>
            <div style={{ 
              width: '18px',
              height: '18px',
              border: '2px solid #d1d5db',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: selectAll ? '#307AC8' : 'white',
              transition: 'all 0.2s'
            }}>
              {selectAll && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span 
              onClick={toggleSelectAll}
              style={{ 
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                flex: 1
              }}
            >
              Select All
            </span>
          </label>
        </div>

        <div style={{ 
          flex: 1,
          overflow: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          {loading ? (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center',
              color: '#6b7280'
            }}>
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center',
              color: '#6b7280'
            }}>
              No items found
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.fcode || index}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: selectedCodes.has(item.fcode) ? '#f0f9ff' : 'white'
                }}
                onClick={() => toggleItem(item.fcode)}
              >
                <div style={{ 
                  width: '18px',
                  height: '18px',
                  border: '2px solid #d1d5db',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selectedCodes.has(item.fcode) ? '#307AC8' : 'white',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}>
                  {selectedCodes.has(item.fcode) && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937'
                  }}>
                    {item.fname || 'Unnamed'}
                  </div>
                  {item.fcode && (
                    <div style={{ 
                      fontSize: '12px',
                      color: '#6b7280',
                      marginTop: '2px'
                    }}>
                      Code: {item.fcode}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ 
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px'
        }}>
          <button
            onClick={handleClear}
            style={{
              padding: '10px 16px',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Clear
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '10px 24px',
              background: selectedCodes.size > 0 ? '#307AC8' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              cursor: selectedCodes.size > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (selectedCodes.size > 0) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCodes.size > 0) {
                e.currentTarget.style.backgroundColor = '#307AC8';
              }
            }}
            disabled={selectedCodes.size === 0}
          >
            Confirm ({selectedCodes.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckboxPopup;