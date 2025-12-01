import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Modal, 
  Input, 
  Button, 
  Spin,
  Typography
} from 'antd';
import {
  SearchOutlined,
  CloseOutlined,
  DownOutlined
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
  responsiveBreakpoint = 768 // pixels for responsive mode
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
  const modalRef = useRef(null);

  // Check screen size for responsiveness
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

  // Fetch data on mount and search
  useEffect(() => {
    if (open) {
      setInitialLoading(true);
      loadData(1, '', true);
      if (searchInputRef.current) {
        setTimeout(() => searchInputRef.current.focus(), 100);
      }
    }
  }, [open]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (open) {
        loadData(1, searchText, true);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounce);
  }, [searchText]);

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
    } catch (error) {
      console.error('Error loading data:', error);
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

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage, searchText);
    }
  };

  const handleSelect = (item) => {
    onSelect(item);
    handleClose();
  };

  const handleClose = () => {
    if (onCustomClose) onCustomClose();
    if (clearSearch) clearSearch();
    setSearchText('');
    setSelectedIndex(-1);
    onClose();
  };

  const handleKeyDown = useCallback((e) => {
    if (!open) return;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredData.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredData[selectedIndex]) {
          handleSelect(filteredData[selectedIndex]);
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

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Responsive display logic
  const getDisplayFields = () => {
    if (!isResponsive) return displayFieldKeys;
    
    // Show only first 2 columns in responsive mode
    return displayFieldKeys.slice(0, 2);
  };

  const getHeaderNames = () => {
    if (!isResponsive) return headerNames;
    
    // Show only first 2 headers in responsive mode
    return headerNames.slice(0, 2);
  };

  const renderItem = (item, index) => {
    const isSelected = selectedIndex === index;
    const displayFields = getDisplayFields();
    
    return (
      <div
        key={item.id || index}
        className={`${styles.listItem} ${isSelected ? styles.selected : ''}`}
        onClick={() => handleSelect(item)}
        data-index={index}
      >
        {!isResponsive ? (
          // Desktop view: horizontal layout
          <div className={styles.columnContainer}>
            {displayFields.map((key, idx) => {
              if (!item[key]) return null;
              
              const width = columnWidths[key] || `${100 / displayFieldKeys.length}%`;
              
              let textClass = styles.primaryText;
              if (idx === 1) textClass = styles.secondaryText;
              else if (idx > 1) textClass = styles.tertiaryText;
              
              return (
                <div key={key} className={styles.columnItem} style={{ width }}>
                  <div className={textClass}>
                    {item[key]}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Mobile view: vertical layout - first 2 fields
          <div className={styles.responsiveItem}>
            <div className={styles.responsiveRow}>
              <div className={styles.responsivePrimary}>
                {item[displayFields[0]] || 'N/A'}
              </div>
            </div>
            {displayFields.length > 1 && (
              <div className={styles.responsiveRow}>
                <div className={styles.responsiveSecondary}>
                  {item[displayFields[1]] || 'N/A'}
                </div>
              </div>
            )}
            {/* Show additional fields as hidden info */}
            {displayFieldKeys.length > 2 && (
              <div className={styles.moreInfo}>
                +{displayFieldKeys.length - 2} more fields
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
      style={{ 
        maxWidth: '800px',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: 0
      }}
      styles={{
        content: {
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'popupFadeIn 0.3s ease-out'
        },
        mask: {
          animation: 'fadeIn 0.3s ease-out'
        }
      }}
      closeIcon={null}
      transitionName=""
      maskTransitionName=""
      wrapClassName={styles.modalWrapper}
    >
      <div 
        className={styles.container} 
        style={{ maxHeight: isResponsive ? '60vh' : maxHeight }}
      >
        {/* Header */}
        <div 
          className={styles.header}
          style={{ 
            background: tableStyles.headerBackground || 'linear-gradient(135deg, #307AC8 0%, #06A7EA 100%)',
            padding: isResponsive ? '12px 16px' : '16px 20px'
          }}
        >
          <div className={styles.headerTitle}>
            {title}
          </div>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleClose}
            className={styles.closeBtn}
            size={isResponsive ? 'small' : 'middle'}
          />
        </div>
        
        {/* Search */}
        <div 
          className={styles.searchContainer}
          style={{ padding: isResponsive ? '12px 16px' : '16px 20px' }}
        >
          <Input
            ref={searchInputRef}
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            className={styles.searchInput}
            size={isResponsive ? 'small' : 'middle'}
          />
        </div>
        
        {/* Table Header */}
        {headerNames.length > 0 && !isResponsive && (
          <div 
            className={styles.tableHeader}
            style={{ padding: isResponsive ? '8px 16px' : '12px 20px' }}
          >
            <div className={styles.columnContainer}>
              {headerNames.map((header, idx) => {
                const width = columnWidths[header] || `${100 / headerNames.length}%`;
                return (
                  <div key={idx} className={styles.columnItem} style={{ width }}>
                    <div className={styles.headerText}>
                      {header}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* List Container */}
        <div 
          className={styles.listContent}
          ref={listRef}
        >
          {initialLoading ? (
            <div className={styles.emptyState}>
              <Spin size="large" />
              <div className={styles.loadingText}>Loading items...</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <div className={styles.emptyText}>
                {searchText ? 'No items match your search' : 'No items available'}
              </div>
              <div className={styles.emptySubtext}>
                {searchText ? 'Try a different search term' : 'Check back later'}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.listItems}>
                {filteredData.map((item, index) => renderItem(item, index))}
              </div>
              
              {hasMore && !loading && (
                <div className={styles.loadMore}>
                  <Button
                    type="text"
                    icon={<DownOutlined />}
                    onClick={handleLoadMore}
                    className={styles.loadMoreBtn}
                    size={isResponsive ? 'small' : 'middle'}
                  >
                    Load More
                  </Button>
                </div>
              )}
              
              {loading && (
                <div className={styles.loadingMore}>
                  <Spin size="small" />
                  <span className={styles.loadingMoreText}>Loading more...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PopupListSelector;