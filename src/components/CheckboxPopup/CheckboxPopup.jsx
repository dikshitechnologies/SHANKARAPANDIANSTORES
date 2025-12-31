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
  maxHeight = "60vh",
  initialSelectedCodes = [],
  variant = '',
  autoFocusOk = false
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const modalRef = useRef();
  const okButtonRef = useRef(null);

  const isSizeVariant = (variant === 'size');

  const modalStyle = isSizeVariant ? {
    width: '520px',
    maxHeight: maxHeight,
    display: 'flex',
    flexDirection: 'column',
    margin: '6% auto',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
  } : {
    maxWidth: '500px',
    maxHeight: maxHeight,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '35%',
    marginTop: '13%'
  };

  const headerStyle = isSizeVariant ? {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    background: 'linear-gradient(180deg,#4fb0ff,#3aa0ee)',
    color: 'white'
  } : {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '12px'
  };

  const closeBtnStyle = {
    background: 'white',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    
  } ;

  useEffect(() => {
    if (open) {
      loadItems();
    }
    // If opening and autoFocusOk requested, focus OK button after render
    if (open && autoFocusOk) {
      setTimeout(() => {
        okButtonRef.current?.focus();
      }, 10);
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
      // initialize selected codes from provided initial selection if any
      try {
        const init = Array.isArray(initialSelectedCodes) ? initialSelectedCodes : [];
        if (init.length > 0) {
          // Only keep codes that exist in fetched items
          const availableCodes = new Set(fetchedItems.map(it => it.fcode).filter(Boolean));
          const filtered = init.filter(code => availableCodes.has(code));
          setSelectedCodes(new Set(filtered));
          setSelectAll(filtered.length > 0 && filtered.length === fetchedItems.length);
        } else {
          setSelectedCodes(new Set());
          setSelectAll(false);
        }
      } catch (err) {
        setSelectedCodes(new Set());
        setSelectAll(false);
      }
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
    const selectedItems = items.filter(item => item.fcode && selectedCodes.has(item.fcode));
    if (onSelect) onSelect(selectedItems);
    onClose();
  };

  const handleClear = () => {
    setSelectedCodes(new Set());
    setSelectAll(false);
    // Notify caller that selection was cleared so they can clear their input
    if (onSelect) onSelect([]);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div 
        className="modal" 
        ref={modalRef}
        style={modalStyle}
      >
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: isSizeVariant ? '16px' : '18px', fontWeight: isSizeVariant ? 700 : 600, color: isSizeVariant ? 'white' : '#1f2937' }}>{title}</h3>
          <button onClick={onClose} style={closeBtnStyle} aria-label="Close">
            X
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
                  transition: 'all 0.2s',
                  marginTop: '8px'
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
     
        }}>
          <label
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                toggleSelectAll();
              }
            }}
            onClick={toggleSelectAll}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '8px',
              borderRadius: '8px',
              background: selectAll ? (isSizeVariant ? '#eaf6ff' : '#f9fafb') : 'transparent',
              border: selectAll ? (isSizeVariant ? '1px solid #c7e9ff' : '1px solid #e5e7eb') : '1px solid transparent'
            }}>
            <div style={{ 
              width: isSizeVariant ? '20px' : '18px',
              height: isSizeVariant ? '20px' : '18px',
              border: '2px solid #cbd5e1',
              borderRadius: isSizeVariant ? '50%' : '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: selectAll ? (isSizeVariant ? '#2f9cf0' : '#307AC8') : 'white',
              transition: 'all 0.2s',
              flexShrink: 0
            }}>
              {selectAll && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span
              style={{ 
                fontSize: '14px',
                fontWeight: '600',
                color: isSizeVariant ? '#0f172a' : '#374151',
                flex: 1,
                textTransform: isSizeVariant ? 'uppercase' : 'none'
              }}
            >
              {isSizeVariant ? 'All' : 'Select All'}
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
                      transition: 'background-color 0.15s',
                      backgroundColor: selectedCodes.has(item.fcode) ? (isSizeVariant ? '#f0fbff' : '#f0f9ff') : 'white'
                    }}
                onClick={() => toggleItem(item.fcode)}
              >
                <div style={{ 
                  width: isSizeVariant ? '20px' : '18px',
                  height: isSizeVariant ? '20px' : '18px',
                  border: '2px solid #cbd5e1',
                  borderRadius: isSizeVariant ? '50%' : '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selectedCodes.has(item.fcode) ? (isSizeVariant ? '#2f9cf0' : '#307AC8') : 'white',
                  flexShrink: 0,
                  transition: 'all 0.15s'
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
          borderTop: isSizeVariant ? '1px solid #f3f6f9' : '1px solid #e5e7eb',         
          
        }}>
          <button
            onClick={handleClear}
            style={{
              padding: '10px 20px',
              background: isSizeVariant ? 'white' : 'white',
              border: isSizeVariant ? '1px solid #f4c7c7' : '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: isSizeVariant ? 600 : 500,
              color: isSizeVariant ? '#ef4444' : '#374151',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isSizeVariant ? '#fff6f6' : '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Clear
          </button>
          <button
            ref={okButtonRef}
            onClick={handleConfirm}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleConfirm(); } }}
            style={{
              padding: isSizeVariant ? '10px 26px' : '10px 24px',
              background: '#2f9cf0',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a8be0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2f9cf0'}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckboxPopup;