import React, { useState, useRef, useEffect } from 'react';

const PurchaseRegister = () => {
  // Sample data for demonstration
  const sampleData = [
    {
      id: 1,
      no: 1,
      salesParty: 'AMIT FASHION',
      billNo: 'P00001AA',
      billDate: '27-09-2025',
      billAmount: '29,303.00',
      qty: '15.00',
      time: '01-01-1900 09:52:12',
      noOfBale: '0',
      transport: ''
    },
    {
      id: 2,
      no: 2,
      salesParty: 'CASH A/C',
      billNo: 'P00002AA',
      billDate: '10-12-2025',
      billAmount: '380.00',
      qty: '10.00',
      time: '01-01-1900 12:49:20',
      noOfBale: '0',
      transport: ''
    },
    {
      id: 3,
      no: 3,
      salesParty: 'TEXTILE MART',
      billNo: 'P00003BB',
      billDate: '15-01-2025',
      billAmount: '15,500.00',
      qty: '25.00',
      time: '01-01-1900 14:30:00',
      noOfBale: '5',
      transport: 'TRUCK-101'
    },
    {
      id: 4,
      no: 4,
      salesParty: 'FABRIC WORLD',
      billNo: 'P00004CC',
      billDate: '20-03-2025',
      billAmount: '42,150.00',
      qty: '35.50',
      time: '01-01-1900 11:15:45',
      noOfBale: '8',
      transport: 'VAN-202'
    },
    {
      id: 5,
      no: 5,
      salesParty: 'CLOTH STORE',
      billNo: 'P00005DD',
      billDate: '05-06-2025',
      billAmount: '8,750.00',
      qty: '12.75',
      time: '01-01-1900 16:20:30',
      noOfBale: '3',
      transport: ''
    },
    {
      id: 6,
      no: 6,
      salesParty: 'FASHION HUB',
      billNo: 'P00006EE',
      billDate: '15-07-2025',
      billAmount: '18,250.00',
      qty: '22.50',
      time: '01-01-1900 10:45:30',
      noOfBale: '6',
      transport: 'TRUCK-303'
    },
    {
      id: 7,
      no: 7,
      salesParty: 'TEXTILE EMPORIUM',
      billNo: 'P00007FF',
      billDate: '25-08-2025',
      billAmount: '32,450.00',
      qty: '28.75',
      time: '01-01-1900 13:20:15',
      noOfBale: '7',
      transport: ''
    },
    {
      id: 8,
      no: 8,
      salesParty: 'CLOTHING MART',
      billNo: 'P00008GG',
      billDate: '10-09-2025',
      billAmount: '12,850.00',
      qty: '18.25',
      time: '01-01-1900 15:10:45',
      noOfBale: '4',
      transport: 'VAN-404'
    },
    {
      id: 9,
      no: 9,
      salesParty: 'FABRIC STORE',
      billNo: 'P00009HH',
      billDate: '30-10-2025',
      billAmount: '25,300.00',
      qty: '32.00',
      time: '01-01-1900 11:30:00',
      noOfBale: '9',
      transport: ''
    },
    {
      id: 10,
      no: 10,
      salesParty: 'TEXTILE WORLD',
      billNo: 'P00010II',
      billDate: '15-11-2025',
      billAmount: '21,750.00',
      qty: '26.50',
      time: '01-01-1900 14:45:20',
      noOfBale: '5',
      transport: 'TRUCK-505'
    },
    {
      id: 11,
      no: 11,
      salesParty: 'FASHION STORE',
      billNo: 'P00011JJ',
      billDate: '05-12-2025',
      billAmount: '14,850.00',
      qty: '19.75',
      time: '01-01-1900 09:15:40',
      noOfBale: '3',
      transport: ''
    },
    {
      id: 12,
      no: 12,
      salesParty: 'CLOTH EMPORIUM',
      billNo: 'P00012KK',
      billDate: '20-12-2025',
      billAmount: '38,900.00',
      qty: '42.25',
      time: '01-01-1900 16:30:10',
      noOfBale: '10',
      transport: 'VAN-606'
    },
    {
      id: 13,
      no: 13,
      salesParty: 'TEXTILE HUB',
      billNo: 'P00013LL',
      billDate: '10-01-2025',
      billAmount: '27,350.00',
      qty: '30.50',
      time: '01-01-1900 12:45:30',
      noOfBale: '8',
      transport: ''
    },
    {
      id: 14,
      no: 14,
      salesParty: 'FABRIC MART',
      billNo: 'P00014MM',
      billDate: '25-02-2025',
      billAmount: '19,450.00',
      qty: '24.25',
      time: '01-01-1900 15:20:45',
      noOfBale: '6',
      transport: 'TRUCK-707'
    },
    {
      id: 15,
      no: 15,
      salesParty: 'CLOTHING WORLD',
      billNo: 'P00015NN',
      billDate: '15-03-2025',
      billAmount: '33,750.00',
      qty: '36.75',
      time: '01-01-1900 10:30:20',
      noOfBale: '9',
      transport: ''
    }
  ];

  // State for data - starts with one empty row
  const [data, setData] = useState([
    {
      id: 1,
      no: 1,
      salesParty: '',
      billNo: '',
      billDate: '',
      billAmount: '',
      qty: '',
      time: '',
      noOfBale: '',
      transport: ''
    }
  ]);
  const [isFiltered, setIsFiltered] = useState(false);

  // State for date range
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  // State for editing
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });

  // Refs
  const tableRef = useRef(null);

  // Calculate totals
  const totals = {
    billAmount: data.reduce((sum, row) => {
      const amount = parseFloat(row.billAmount.replace(/,/g, '')) || 0;
      return sum + amount;
    }, 0),
    qty: data.reduce((sum, row) => {
      const qty = parseFloat(row.qty) || 0;
      return sum + qty;
    }, 0)
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Handle date change
  const handleDateChange = (field, value) => {
    setDateRange({
      ...dateRange,
      [field]: value
    });
  };

  // Convert date string to Date object for comparison
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Filter data by date range
  const filterDataByDate = () => {
    if (!dateRange.from || !dateRange.to) {
      alert('Please select both From and To dates');
      return;
    }

    // Parse input dates
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);

    if (fromDate > toDate) {
      alert('From date cannot be after To date');
      return;
    }

    // Filter sample data based on date range
    const filtered = sampleData.filter(item => {
      const itemDate = parseDate(item.billDate);
      if (!itemDate) return false;
      
      return itemDate >= fromDate && itemDate <= toDate;
    });

    // If no data found, show empty row
    if (filtered.length === 0) {
      setData([
        {
          id: 1,
          no: 1,
          salesParty: '',
          billNo: '',
          billDate: '',
          billAmount: '',
          qty: '',
          time: '',
          noOfBale: '',
          transport: ''
        }
      ]);
    } else {
      setData(filtered);
    }
    
    setIsFiltered(true);
    
    // Reset selected cell
    setSelectedCell({ row: 0, col: 0 });
  };

  // Clear date filters
  const clearFilters = () => {
    setDateRange({
      from: '',
      to: ''
    });
    // Reset to initial empty row
    setData([
      {
        id: 1,
        no: 1,
        salesParty: '',
        billNo: '',
        billDate: '',
        billAmount: '',
        qty: '',
        time: '',
        noOfBale: '',
        transport: ''
      }
    ]);
    setIsFiltered(false);
  };

  // Start editing a cell
  const startEditing = (rowIndex, colName, value) => {
    if (data.length === 0) return;
    setEditingCell({ row: rowIndex, col: colName });
    setEditValue(value);
  };

  // Save the edited value
  const saveEdit = () => {
    if (editingCell && data.length > 0) {
      const { row, col } = editingCell;
      const newData = [...data];
      newData[row] = {
        ...newData[row],
        [col]: editValue
      };
      setData(newData);
      setEditingCell(null);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCell(null);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (data.length === 0) return;
      
      const { row, col } = selectedCell;
      const colNames = ['no', 'salesParty', 'billNo', 'billDate', 'billAmount', 'qty', 'time', 'noOfBale', 'transport'];
      
      if (editingCell) {
        if (e.key === 'Enter') {
          saveEdit();
          e.preventDefault();
        } else if (e.key === 'Escape') {
          cancelEdit();
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (row < data.length - 1) {
            setSelectedCell({ row: row + 1, col });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (row > 0) {
            setSelectedCell({ row: row - 1, col });
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (col > 0) {
            setSelectedCell({ row, col: col - 1 });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (col < colNames.length - 1) {
            setSelectedCell({ row, col: col + 1 });
          }
          break;
        case 'Enter':
        case 'F2':
          e.preventDefault();
          startEditing(row, colNames[col], data[row][colNames[col]]);
          break;
        case 'Delete':
          e.preventDefault();
          if (window.confirm('Clear this cell?')) {
            const newData = [...data];
            newData[row] = {
              ...newData[row],
              [colNames[col]]: ''
            };
            setData(newData);
          }
          break;
        case 'F4':
          e.preventDefault();
          addNewRow();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, editingCell, data]);

  // Add new row
  const addNewRow = () => {
    const newRow = {
      id: data.length + 1,
      no: data.length + 1,
      salesParty: '',
      billNo: '',
      billDate: '',
      billAmount: '',
      qty: '',
      time: '',
      noOfBale: '',
      transport: ''
    };
    setData([...data, newRow]);
    setSelectedCell({ row: data.length, col: 0 });
  };

  // Delete selected row
  const deleteSelectedRow = () => {
    if (data.length === 0 || selectedCell.row < 0 || selectedCell.row >= data.length) {
      return;
    }
    
    const newData = data.filter((_, index) => index !== selectedCell.row);
    
    // If all rows are deleted, add one empty row
    if (newData.length === 0) {
      setData([
        {
          id: 1,
          no: 1,
          salesParty: '',
          billNo: '',
          billDate: '',
          billAmount: '',
          qty: '',
          time: '',
          noOfBale: '',
          transport: ''
        }
      ]);
    } else {
      // Update row numbers
      const updatedData = newData.map((row, index) => ({
        ...row,
        id: index + 1,
        no: index + 1
      }));
      setData(updatedData);
    }
    
    setSelectedCell({ 
      row: Math.min(selectedCell.row, data.length - 2), 
      col: selectedCell.col 
    });
  };

  // Get current date in YYYY-MM-DD format for date input
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Container styles - FIXED HEIGHT TO PREVENT SCREEN SCROLL
  const containerStyle = {   
    fontSize: '15px',
    backgroundColor: '#f5f5f5',
    height: '100vh', // Fixed height to fill viewport
    boxSizing: 'border-box',
    padding: '20px',
    overflow: 'hidden', // Prevent container scroll
    display: 'flex',
    flexDirection: 'column'
  };

  // Main content area
  const contentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden' // Prevent content area scroll
  };

  // Date filter header styles
  const dateFilterHeaderStyle = {
    backgroundColor: 'white',
    borderRadius: '4px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'grid',
    gridTemplateColumns: 'auto auto 1fr',
    alignItems: 'center',
    gap: '25px',
    justifyContent: 'flex-start',
    flexShrink: 0 // Prevent shrinking
  };

  const dateFilterGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
    minWidth: '300px'
  };

  const dateFilterLabelStyle = {
    fontWeight: '600',
    color: '#333',
    fontSize: '15px',
    whiteSpace: 'nowrap',
    minWidth: '45px'
  };

  const dateInputStyle = {
    padding: '6px 10px',
    border: '1px solid #ddd',
    borderRadius: '3px',
    fontSize: '15px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    width: '200px',
    flexShrink: 0,
    height: '35px'
  };

  const dateFilterButtonStyle = {
    padding: '6px 20px',
    backgroundColor: '#1B91DA',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    height: '35px',
    whiteSpace: 'nowrap'
  };

  const clearButtonStyle = {
    padding: '6px 20px',
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    height: '35px',
    whiteSpace: 'nowrap'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-start',
    flexWrap: 'nowrap'
  };

  // Table container styles - SCROLLABLE TABLE ONLY
  const tableContainerStyle = {
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flex: 1, // Take remaining space
    minHeight: 0 // Important for flex children to scroll
  };

  // Scrollable table area
  const tableScrollAreaStyle = {
    overflowX: 'auto',
    overflowY: 'auto', // Only this area scrolls
    flex: 1,
    position: 'relative'
  };

  // Table styles
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    minWidth: '1000px' // Ensure table has minimum width
  };

  // Table header styles
  const thStyle = {
    backgroundColor: '#1B91DA',
    color: 'white',
    fontWeight: '600',
    padding: '8px 6px',
    borderRight: '1px solid #0c7bb8',
    textAlign: 'left',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  // Column width styles
  const columnWidths = {
    no: '50px',
    salesParty: '200px', // Increased for better display
    billNo: '120px',
    billDate: '100px',
    billAmount: '120px',
    qty: '80px',
    time: '150px',
    noOfBale: '80px',
    transport: '150px' // Increased for better display
  };

  // Table cell styles
  const getCellStyle = (rowIndex, colName) => {
    const colNames = ['no', 'salesParty', 'billNo', 'billDate', 'billAmount', 'qty', 'time', 'noOfBale', 'transport'];
    const colIndex = colNames.indexOf(colName);
    const isSelected = selectedCell.row === rowIndex && selectedCell.col === colIndex;
    
    const isEditing = editingCell && 
      editingCell.row === rowIndex && 
      editingCell.col === colName;

    const baseStyle = {
      padding: '6px',
      borderBottom: '1px solid #e0e0e0',
      borderRight: '1px solid #e0e0e0',
      height: '32px',
      verticalAlign: 'middle',
      textAlign: colName === 'billAmount' || colName === 'qty' || colName === 'noOfBale' ? 'right' : 'left',
      backgroundColor: isSelected ? '#e6f2fa' : 'white',
      fontFamily: colName === 'billAmount' || colName === 'qty' ? '"Courier New", monospace' : 'inherit',
      fontSize: colName === 'billAmount' || colName === 'qty' ? '15px' : '15px',
      fontWeight: colName === 'billAmount' || colName === 'qty' ? '600' : '400',
      width: columnWidths[colName] || 'auto',
      boxSizing: 'border-box',
      minWidth: columnWidths[colName] || 'auto'
    };

    if (isSelected && !isEditing) {
      baseStyle.outline = '2px solid #1B91DA';
      baseStyle.outlineOffset = '-1px';
    }

    if (isEditing) {
      baseStyle.outline = '2px solid #1B91DA';
      baseStyle.outlineOffset = '-1px';
      baseStyle.padding = '0';
    }

    return baseStyle;
  };

  // Input style for editing
  const inputStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    padding: '6px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    backgroundColor: '#fff',
    outline: 'none'
  };

  // Totals row style
  const totalsRowStyle = {
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    borderTop: '2px solid #1B91DA',
    position: 'sticky',
    bottom: 0,
    zIndex: 5
  };

  const totalsCellStyle = {
    padding: '8px 6px',
    borderRight: '1px solid #e0e0e0',
    textAlign: 'right',
    fontFamily: '"Courier New", monospace',
    fontSize: '15px'
  };

  // Action buttons container
  const actionButtonsStyle = {
    marginTop: '15px',
    display: 'flex',
    gap: '10px',
    flexShrink: 0 // Prevent shrinking
  };

  // Render cell content
  const renderCell = (rowIndex, colName, value) => {
    if (editingCell && editingCell.row === rowIndex && editingCell.col === colName) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          autoFocus
          style={inputStyle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveEdit();
            } else if (e.key === 'Escape') {
              cancelEdit();
            }
          }}
        />
      );
    }

    return value;
  };

  return (
    <div style={containerStyle}>
      {/* Main Content Area */}
      <div style={contentStyle}>
        {/* Date Filter Header */}
        <div style={dateFilterHeaderStyle}>
          <div style={dateFilterGroupStyle}>
            <span style={dateFilterLabelStyle}>From:</span>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateChange('from', e.target.value)}
              style={dateInputStyle}
              max={getCurrentDate()}
            />
          </div>
          
          <div style={dateFilterGroupStyle}>
            <span style={dateFilterLabelStyle}>To:</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateChange('to', e.target.value)}
              style={dateInputStyle}
              max={getCurrentDate()}
            />
          </div>
          
          <div style={buttonContainerStyle}>
            <button 
              style={dateFilterButtonStyle}
              onClick={filterDataByDate}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0c7bb8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1B91DA'}
            >
              View Purchase Register
            </button>
            
            <button 
              style={clearButtonStyle}
              onClick={clearFilters}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            >
              <span>🗙</span> Clear
            </button>
          </div>
        </div>

        {/* Table Container - SCROLLABLE AREA ONLY */}
        <div style={tableContainerStyle}>
          <div style={tableScrollAreaStyle}>
            <table style={tableStyle} ref={tableRef}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: columnWidths.no }}>No</th>
                  <th style={{ ...thStyle, width: columnWidths.salesParty }}>Purchase Party</th>
                  <th style={{ ...thStyle, width: columnWidths.billNo }}>Bill No</th>
                  <th style={{ ...thStyle, width: columnWidths.billDate }}>Bill Date</th>
                  <th style={{ ...thStyle, width: columnWidths.billAmount }}>Bill Amount</th>
                  <th style={{ ...thStyle, width: columnWidths.qty }}>Qty</th>
                  <th style={{ ...thStyle, width: columnWidths.time }}>Time</th>
                  <th style={{ ...thStyle, width: columnWidths.noOfBale }}>No of Bale</th>
                  <th style={{ ...thStyle, width: columnWidths.transport, borderRight: 'none' }}>Transport</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr 
                    key={row.id}
                    onClick={() => {
                      const colNames = ['no', 'salesParty', 'billNo', 'billDate', 'billAmount', 'qty', 'time', 'noOfBale', 'transport'];
                      const colIndex = colNames.indexOf('no');
                      setSelectedCell({ row: rowIndex, col: colIndex });
                    }}
                    style={{ cursor: 'cell' }}
                  >
                    <td 
                      style={getCellStyle(rowIndex, 'no')}
                      onDoubleClick={() => startEditing(rowIndex, 'no', row.no)}
                    >
                      {renderCell(rowIndex, 'no', row.no)}
                    </td>
                    <td 
                      style={getCellStyle(rowIndex, 'salesParty')}
                      onDoubleClick={() => startEditing(rowIndex, 'salesParty', row.salesParty)}
                    >
                      {renderCell(rowIndex, 'salesParty', row.salesParty)}
                    </td>
                    <td 
                      style={getCellStyle(rowIndex, 'billNo')}
                      onDoubleClick={() => startEditing(rowIndex, 'billNo', row.billNo)}
                    >
                      {renderCell(rowIndex, 'billNo', row.billNo)}
                    </td>
                    <td 
                      style={getCellStyle(rowIndex, 'billDate')}
                      onDoubleClick={() => startEditing(rowIndex, 'billDate', row.billDate)}
                    >
                      {renderCell(rowIndex, 'billDate', row.billDate)}
                    </td>
                    <td 
                      style={getCellStyle(rowIndex, 'billAmount')}
                      onDoubleClick={() => startEditing(rowIndex, 'billAmount', row.billAmount)}
                    >
                      {renderCell(rowIndex, 'billAmount', row.billAmount)}
                    </td>
                    <td 
                      style={getCellStyle(rowIndex, 'qty')}
                      onDoubleClick={() => startEditing(rowIndex, 'qty', row.qty)}
                    >
                      {renderCell(rowIndex, 'qty', row.qty)}
                    </td>
                    <td 
                      style={getCellStyle(rowIndex, 'time')}
                      onDoubleClick={() => startEditing(rowIndex, 'time', row.time)}
                    >
                      {renderCell(rowIndex, 'time', row.time)}
                    </td>
                    <td 
                      style={getCellStyle(rowIndex, 'noOfBale')}
                      onDoubleClick={() => startEditing(rowIndex, 'noOfBale', row.noOfBale)}
                    >
                      {renderCell(rowIndex, 'noOfBale', row.noOfBale)}
                    </td>
                    <td 
                      style={{ ...getCellStyle(rowIndex, 'transport'), borderRight: 'none' }}
                      onDoubleClick={() => startEditing(rowIndex, 'transport', row.transport)}
                    >
                      {renderCell(rowIndex, 'transport', row.transport)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {data.length > 0 && (
                <tfoot>
                  <tr style={totalsRowStyle}>
                    <td colSpan="4" style={{ padding: '8px 6px', borderRight: '1px solid #e0e0e0', fontWeight: 'bold' }}>
                      Total
                    </td>
                    <td style={totalsCellStyle}>
                      {formatNumber(totals.billAmount)}
                    </td>
                    <td style={totalsCellStyle}>
                      {totals.qty.toFixed(2)}
                    </td>
                    <td style={{ ...totalsCellStyle, textAlign: 'center' }}>-</td>
                    <td style={totalsCellStyle}>-</td>
                    <td style={{ ...totalsCellStyle, borderRight: 'none' }}>-</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default PurchaseRegister;