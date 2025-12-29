import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Modal, 
  Input, 
  Button, 
  Spin 
} from 'antd';
import {
  SearchOutlined,
  CloseOutlined
} from '@ant-design/icons';
import styles from './PopupListSelector.module.css';

const PopupListSelector = ({
  open,
  onClose,
  onSelect,
  fetchItems,
  title = 'Select Item',
  displayFieldKeys = [],
  searchFields = [],
  onCustomClose,
  clearSearch,
  headerNames = [],
  columnWidths = {},
  tableStyles = {},
  maxHeight = '70vh',
  searchPlaceholder = 'Search...',
  initialSearch = '',
  responsiveBreakpoint = 768,
  onSearchChange = null
}) => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isResponsive, setIsResponsive] = useState(false);

  const listRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // -------------------------
  // Responsive Mode
  // -------------------------
  useEffect(() => {
    const checkResponsive = () => {
      setIsResponsive(window.innerWidth <= responsiveBreakpoint);
    };
    
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    
    return () => {
      window.removeEventListener('resize', checkResponsive);
    };
  }, [responsiveBreakpoint]);

  // -------------------------
  // Initial Loading When Popup Opens
  // -------------------------
  useEffect(() => {
    if (open) {
      setInitialLoading(true);
      setPage(1);
      setHasMore(true);

      // Use initialSearch when provided so parent can prefill the popup search
      const initial = initialSearch || '';
      setSearchText(initial);
      loadData(1, initial, true);

       // 🔥 ADD THIS — focus list for keyboard navigation
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);

  }
}, [open, initialSearch]);

  // -------------------------
  // Debounced Search
  // -------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        setPage(1);
        setHasMore(true);
        loadData(1, searchText, true);
        // Emit search change to parent component
        if (onSearchChange) {
          onSearchChange(searchText);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, open]);

  // -------------------------
  // Fetch + Filter Data
  // -------------------------
  const loadData = async (pageNum, search, reset = false) => {
    setLoading(true);
    if (reset) setInitialLoading(true);

    try {
      const items = await fetchItems(pageNum, search);
      
      // Ensure items is an array
      const itemsArray = Array.isArray(items) ? items : [];

      if (reset) {
        setData(itemsArray);
        setFilteredData(filterItems(itemsArray, search));
      } else {
        setData(prev => [...prev, ...itemsArray]);
        setFilteredData(prev => [...prev, ...filterItems(itemsArray, search)]);
      }

      if (itemsArray.length < 20) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading items:", err);
      // Set empty arrays on error to prevent undefined errors
      if (reset) {
        setData([]);
        setFilteredData([]);
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // -------------------------
// Auto select FIRST item when data loads
// -------------------------
useEffect(() => {
  if (open && filteredData.length > 0) {
    setSelectedIndex(0);
  } else {
    setSelectedIndex(-1);
  }
}, [filteredData, open]);


 const filterItems = (items, search) => {
  if (!search || searchFields.length === 0) return items;

  const searchLower = search.toLowerCase();

  const startsWithMatches = [];
  const includesMatches = [];

  items.forEach(item => {
    for (const field of searchFields) {
      const value = item[field]?.toString().toLowerCase();
      if (!value) continue;

      if (value.startsWith(searchLower)) {
        startsWithMatches.push(item);
        return;
      }

      if (value.includes(searchLower)) {
        includesMatches.push(item);
        return;
      }
    }
  });

  // 🔥 STARTS-WITH FIRST, THEN OTHERS
  return [...startsWithMatches, ...includesMatches];
};


  // -------------------------
  // Infinite Scroll Logic
  // -------------------------
  useEffect(() => {
    const list = listRef.current;

    if (!list) return;

    const handleScroll = () => {
      if (loading || !hasMore) return;

      const isBottom =
        list.scrollTop + list.clientHeight >= list.scrollHeight - 10;

      if (isBottom) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadData(nextPage, searchText);
      }
    };

    list.addEventListener('scroll', handleScroll);

    return () => list.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, page, searchText]);

  // -------------------------
  // Close Popup
  // -------------------------
  const handleClose = () => {
    if (onCustomClose) onCustomClose();
    if (clearSearch) clearSearch();
    setSearchText('');
    setSelectedIndex(0);

    onClose();
  };

  // -------------------------
  // Keyboard Navigation
  // -------------------------
  const handleKeyDown = useCallback((e) => {
    if (!open) return;
 if (
    e.key.length === 1 && // letters, numbers
    !e.ctrlKey &&
    !e.metaKey &&
    !e.altKey
  ) {
    searchInputRef.current?.focus();
    return;
  }
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

  // -------------------------
  // Auto Scroll Selected
  // -------------------------
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const getDisplayFields = () => {
    if (!isResponsive) return displayFieldKeys;
    return displayFieldKeys.slice(0, 2);
  };

  const getHeaderNames = () => {
    if (!isResponsive) return headerNames;
    return headerNames.slice(0, 2);
  };

  const renderItem = (item, index) => {
    const isSelected = selectedIndex === index;
    const displayFields = getDisplayFields();

    return (
      <div
        key={index}
        data-index={index}
        className={`${styles.listItem} ${isSelected ? styles.selected : ''}`}
        onClick={() => { onSelect(item); handleClose(); }}
      >
        {!isResponsive ? (
          <div className={styles.columnContainer}>
            {displayFields.map((key, idx) => (
              <div 
                key={idx}
                className={styles.columnItem}
                style={{ width: columnWidths[key] || `${100/displayFieldKeys.length}%` }}
              >
                <div className={styles.primaryText}>{item[key]}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.responsiveItem}>
            <div className={styles.responsivePrimary}>
              {item[displayFields[0]]}
            </div>
            {displayFields[1] && (
              <div className={styles.responsiveSecondary}>
                {item[displayFields[1]]}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width="auto"
      style={{ maxWidth: '800px', top: '20%' }}
      closeIcon={null}
    >
      <div className={styles.container} style={{ maxHeight }}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>{title}</div>
          <Button type="text" icon={<CloseOutlined />} onClick={handleClose} className={styles.closeBtn} />
        </div>

        {/* Search */}
        <div className={styles.searchContainer}>
          <Input
            ref={searchInputRef}
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            className={styles.searchInput}
          />
        </div>

        {/* Table Header */}
        {!isResponsive && headerNames.length > 0 && (
          <div className={styles.tableHeader}>
            <div className={styles.columnContainer}>
              {getHeaderNames().map((header, idx) => (
                <div key={idx} className={styles.columnItem}>
                  <div className={styles.headerText}>{header}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List */}
        <div className={styles.listContent} ref={listRef}>
          {initialLoading ? (
            <div className={styles.emptyState}>
              <Spin size="large" />
              <div className={styles.loadingText}>Loading items...</div>
            </div>
          ) : (filteredData && filteredData.length === 0) ? (
            <div className={styles.emptyState}>
              <div>No items found</div>
            </div>
          ) : (
            <div className={styles.listItems}>
              {filteredData.map((item, index) => renderItem(item, index))}
            </div>
          )}

          {loading && (
            <div className={styles.loadingMore}>
              <Spin size="small" />
              <span className={styles.loadingMoreText}>Loading...</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PopupListSelector;
