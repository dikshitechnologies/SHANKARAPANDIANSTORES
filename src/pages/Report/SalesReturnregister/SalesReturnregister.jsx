import React, { useState, useRef, useEffect } from 'react';

const SalesReturnRegister = () => {
  // Initial data state for sales returns
  const [data, setData] = useState([
    {
      id: 1,
      no: 1,
      salesParty: 'AMIT FASHION',
      returnBillNo: 'SR00001AA',
      billNo: 'C00001AA',
      billDate: '28-09-2025',
      returnDate: '29-09-2025',
      returnAmount: '3,500.00',
      qty: '5.00',
      time: '01-01-1900 10:30:15',
      reason: 'Damaged Goods',
      transport: '',
      status: 'Approved'
    },
    {
      id: 2,
      no: 2,
      salesParty: 'CASH A/C',
      returnBillNo: 'SR00002AA',
      billNo: 'C00002AA',
      billDate: '11-12-2025',
      returnDate: '12-12-2025',
      returnAmount: '150.00',
      qty: '3.00',
      time: '01-01-1900 14:20:45',
      reason: 'Wrong Size',
      transport: '',
      status: 'Pending'
    },
    {
      id: 3,
      no: 3,
      salesParty: 'FASHION HOUSE',
      returnBillNo: 'SR00003AA',
      billNo: 'C00015AA',
      billDate: '15-10-2025',
      returnDate: '18-10-2025',
      returnAmount: '8,250.00',
      qty: '12.00',
      time: '01-01-1900 11:15:30',
      reason: 'Color Mismatch',
      transport: 'XYZ Transport',
      status: 'Approved'
    }
  ]);

  // State for date range
  const [dateRange, setDateRange] = useState({
    from: '2025-01-01',
    to: '2025-12-31'
  });

  // State for editing
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [focusedField, setFocusedField] = useState('');
  const [tableLoaded, setTableLoaded] = useState(true);
  
  // Refs for keyboard navigation
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const viewButtonRef = useRef(null);
  const clearButtonRef = useRef(null);

  // Calculate totals
  const totals = {
    returnAmount: data.reduce((sum, row) => {
      const amount = parseFloat(row.returnAmount.replace(/,/g, '')) || 0;
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

  // Filter data by date range
  const filterDataByDate = () => {
    if (!dateRange.from || !dateRange.to) {
      alert('Please select both From Date and To Date');
      return;
    }
    
    console.log('Filtering sales return data from:', dateRange.from, 'to:', dateRange.to);
    setTableLoaded(true);
    // In a real app, you would fetch filtered data here
  };

  // Clear date filters
  const clearFilters = () => {
    setDateRange({
      from: '',
      to: ''
    });
  };

  // Start editing a cell
  const startEditing = (rowIndex, colName, value) => {
    setEditingCell({ row: rowIndex, col: colName });
    setEditValue(value);
  };

  // Save the edited value
  const saveEdit = () => {
    if (editingCell) {
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

  // Focusable elements in order
  const focusableElements = [
    { ref: fromDateRef, name: 'fromDate', type: 'input' },
    { ref: toDateRef, name: 'toDate', type: 'input' },
    { ref: viewButtonRef, name: 'view', type: 'button' },
    { ref: clearButtonRef, name: 'clear', type: 'button' }
  ];

  // Handle keyboard navigation for main controls
  const handleKeyDown = (e, currentIndex, fieldName) => {
    const totalElements = focusableElements.length;
    
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (fieldName === 'view') {
          filterDataByDate();
        } else if (fieldName === 'clear') {
          clearFilters();
        } else {
          // Move to next element
          const nextIndex = (currentIndex + 1) % totalElements;
          focusableElements[nextIndex].ref.current.focus();
        }
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % totalElements;
        focusableElements[nextIndex].ref.current.focus();
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + totalElements) % totalElements;
        focusableElements[prevIndex].ref.current.focus();
        break;
        
      case 'Escape':
        e.currentTarget.blur();
        break;
        
      case ' ':
        if (fieldName === 'view') {
          e.preventDefault();
          filterDataByDate();
        } else if (fieldName === 'clear') {
          e.preventDefault();
          clearFilters();
        }
        break;
    }
  };

  // Handle keyboard navigation in table
  useEffect(() => {
    const handleTableKeyDown = (e) => {
      const { row, col } = selectedCell;
      const colNames = ['no', 'salesParty', 'returnBillNo', 'billNo', 'billDate', 'returnDate', 'returnAmount', 'qty', 'time', 'reason', 'transport', 'status'];
      
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
      }
    };

    window.addEventListener('keydown', handleTableKeyDown);
    return () => window.removeEventListener('keydown', handleTableKeyDown);
  }, [selectedCell, editingCell, data]);

  // Add new row
  const addNewRow = () => {
    const newRow = {
      id: data.length + 1,
      no: data.length + 1,
      salesParty: '',
      returnBillNo: '',
      billNo: '',
      billDate: '',
      returnDate: '',
      returnAmount: '0.00',
      qty: '0.00',
      time: '',
      reason: '',
      transport: '',
      status: 'Pending'
    };
    setData([...data, newRow]);
    setSelectedCell({ row: data.length, col: 0 });
  };

  // Delete selected row
  const deleteSelectedRow = () => {
    if (selectedCell.row >= 0 && selectedCell.row < data.length) {
      const newData = data.filter((_, index) => index !== selectedCell.row);
      // Update row numbers
      const updatedData = newData.map((row, index) => ({
        ...row,
        no: index + 1
      }));
      setData(updatedData);
      setSelectedCell({ row: Math.min(selectedCell.row, updatedData.length - 1), col: selectedCell.col });
    }
  };

  // Styles matching Sales Register design
  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f5f5f5',
      fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
      overflow: 'auto'
    },
    
    header: {
      background: 'white',
      color: '#333',
      padding: '20px 30px',
      borderBottom: '1px solid #ddd',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    
    headerTitle: {
      fontSize: '28px',
      fontWeight: '600',
      marginBottom: '25px',
      color: '#1B91DA',
      textAlign: 'center'
    },
    
    firstRow: {
      display: 'grid',
      gridTemplateColumns: '0.8fr 0.8fr 0.7fr 0.7fr',
      gap: '15px',
      marginBottom: '20px',
      position: 'relative',
      alignItems: 'end'
    },
    
    controlGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    
    controlLabel: {
      fontSize: '14px',
      color: '#333',
      marginBottom: '0',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    dateInputWrapper: {
      position: 'relative',
      width: '100%'
    },
    
    inlineInput: {
      width: '100%',
      padding: '8px 10px',
      border: '1px solid #ddd',
      borderRadius: '3px',
      fontSize: '14px',
      backgroundColor: 'white',
      color: '#333',
      minHeight: '36px',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    
    focusedInput: {
      borderColor: '#1B91DA',
      boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)'
    },
    
    viewButton: {
      padding: '8px 12px',
      background: '#1B91DA',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none'
    },
    
    clearButton: {
      padding: '8px 12px',
      background: 'white',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: '3px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none'
    },
    
    buttonContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      height: '100%'
    },
    
    content: {
      padding: '20px 30px',
      minHeight: 'calc(100vh - 180px)',
      boxSizing: 'border-box'
    },
    
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '4px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #ddd',
      height: 'calc(100vh - 250px)',
      display: 'flex',
      flexDirection: 'column'
    },
    
    tableWrapper: {
      flex: 1,
      overflow: 'auto'
    },
    
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1400px'
    },
    
    tableHeader: {
      backgroundColor: '#1B91DA',
      color: 'white',
      padding: '12px 15px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '14px',
      borderRight: '1px solid #0c7bb8',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    
    tableCell: {
      padding: '12px 15px',
      borderBottom: '1px solid #ddd',
      fontSize: '14px',
      color: '#333',
      fontWeight: '400'
    },
    
    tableRow: {
      ':hover': {
        backgroundColor: '#f8f9fa'
      }
    },
    
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#666',
      fontSize: '16px',
      background: '#f8f9fa',
      borderRadius: '4px',
      margin: '20px',
      border: '2px dashed #ddd'
    },
    
    totalsRow: {
      backgroundColor: '#f8f9fa',
      fontWeight: 'bold',
      borderTop: '2px solid #1B91DA'
    },
    
    totalsCell: {
      padding: '12px 15px',
      borderBottom: '1px solid #ddd',
      fontSize: '14px',
      color: '#333',
      fontWeight: '400'
    },
    
    // Status badge styles
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      display: 'inline-block',
      minWidth: '80px',
      textAlign: 'center'
    },
    
    statusApproved: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    
    statusPending: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeaa7'
    },
    
    statusRejected: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    
    // For selected cell in table
    selectedCell: {
      outline: '2px solid #1B91DA',
      outlineOffset: '-1px',
      boxShadow: '0 0 0 1px rgba(27, 145, 218, 0.3)'
    },
    
    // For editing cell
    editingCell: {
      outline: '2px solid #1B91DA',
      outlineOffset: '-1px',
      boxShadow: '0 0 0 1px rgba(27, 145, 218, 0.3)',
      padding: '0',
      position: 'relative'
    },
    
    inputStyle: {
      width: '100%',
      height: '100%',
      border: 'none',
      padding: '12px 15px',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      backgroundColor: '#fff',
      outline: 'none'
    }
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    const baseStyle = styles.statusBadge;
    switch(status?.toLowerCase()) {
      case 'approved':
        return { ...baseStyle, ...styles.statusApproved };
      case 'pending':
        return { ...baseStyle, ...styles.statusPending };
      case 'rejected':
        return { ...baseStyle, ...styles.statusRejected };
      default:
        return { ...baseStyle, ...styles.statusPending };
    }
  };

  // Get cell style based on state
  const getCellStyle = (rowIndex, colName) => {
    const isSelected = selectedCell.row === rowIndex && 
      ['no', 'salesParty', 'returnBillNo', 'billNo', 'billDate', 'returnDate', 'returnAmount', 'qty', 'time', 'reason', 'transport', 'status'].indexOf(colName) === selectedCell.col;
    
    const isEditing = editingCell && 
      editingCell.row === rowIndex && 
      editingCell.col === colName;

    const baseStyle = {
      ...styles.tableCell,
      textAlign: colName === 'returnAmount' || colName === 'qty' || colName === 'no' ? 'right' : 'left',
      fontFamily: colName === 'returnAmount' || colName === 'qty' ? '"Courier New", monospace' : 'inherit',
      fontWeight: colName === 'returnAmount' || colName === 'qty' ? '600' : '400',
      cursor: 'cell'
    };

    if (isSelected && !isEditing) {
      return { ...baseStyle, ...styles.selectedCell };
    }

    if (isEditing) {
      return { ...baseStyle, ...styles.editingCell };
    }

    return baseStyle;
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
          style={styles.inputStyle}
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

    if (colName === 'status') {
      return <span style={getStatusStyle(value)}>{value}</span>;
    }

    return value;
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Sales Return Register</h1>
        
        {/* FIRST ROW: From Date, To Date, View Button, Clear Button */}
        <div style={styles.firstRow}>
          {/* From Date */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>From Date</div>
            <div style={styles.dateInputWrapper}>
              <input
                type="date"
                style={{
                  ...styles.inlineInput,
                  ...(focusedField === 'fromDate' && styles.focusedInput)
                }}
                ref={fromDateRef}
                value={dateRange.from}
                onChange={(e) => handleDateChange('from', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 0, 'fromDate')}
                onFocus={() => setFocusedField('fromDate')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>
          
          {/* To Date */}
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>To Date</div>
            <div style={styles.dateInputWrapper}>
              <input
                type="date"
                style={{
                  ...styles.inlineInput,
                  ...(focusedField === 'toDate' && styles.focusedInput)
                }}
                ref={toDateRef}
                value={dateRange.to}
                onChange={(e) => handleDateChange('to', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 1, 'toDate')}
                onFocus={() => setFocusedField('toDate')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>
          
          {/* View Button */}
          <div style={styles.buttonContainer}>
            <button 
              ref={viewButtonRef}
              style={{
                ...styles.viewButton,
                ...(focusedField === 'view' && { outline: '2px solid #1B91DA', outlineOffset: '2px' })
              }}
              onClick={filterDataByDate}
              onKeyDown={(e) => handleKeyDown(e, 2, 'view')}
              onFocus={() => setFocusedField('view')}
              onBlur={() => setFocusedField('')}
            >
              View Sales Return Register
            </button>
          </div>

          {/* Clear Button */}
          <div style={styles.buttonContainer}>
            <button 
              ref={clearButtonRef}
              style={{
                ...styles.clearButton,
                ...(focusedField === 'clear' && { outline: '2px solid #1B91DA', outlineOffset: '2px' })
              }}
              onClick={clearFilters}
              onKeyDown={(e) => handleKeyDown(e, 3, 'clear')}
              onFocus={() => setFocusedField('clear')}
              onBlur={() => setFocusedField('')}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* TABLE CONTENT */}
      <div style={styles.content}>
        <div style={styles.tableContainer}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.tableHeader, textAlign: 'right' }}>No</th>
                  <th style={styles.tableHeader}>Sales Party</th>
                  <th style={styles.tableHeader}>Return Bill No</th>
                  <th style={styles.tableHeader}>Original Bill No</th>
                  <th style={styles.tableHeader}>Bill Date</th>
                  <th style={styles.tableHeader}>Return Date</th>
                  <th style={{ ...styles.tableHeader, textAlign: 'right' }}>Return Amount</th>
                  <th style={{ ...styles.tableHeader, textAlign: 'right' }}>Qty</th>
                  <th style={styles.tableHeader}>Time</th>
                  <th style={styles.tableHeader}>Reason</th>
                  <th style={styles.tableHeader}>Transport</th>
                  <th style={{ ...styles.tableHeader, borderRight: 'none' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(tableLoaded ? data : []).map((row, rowIndex) => (
                  <tr 
                    key={row.id}
                    onClick={() => {
                      const colNames = ['no', 'salesParty', 'returnBillNo', 'billNo', 'billDate', 'returnDate', 'returnAmount', 'qty', 'time', 'reason', 'transport', 'status'];
                      const colIndex = colNames.indexOf('no');
                      setSelectedCell({ row: rowIndex, col: colIndex });
                    }}
                    style={styles.tableRow}
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
                      style={getCellStyle(rowIndex, 'returnBillNo')}
                      onDoubleClick={() => startEditing(rowIndex, 'returnBillNo', row.returnBillNo)}
                    >
                      {renderCell(rowIndex, 'returnBillNo', row.returnBillNo)}
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
                      style={getCellStyle(rowIndex, 'returnDate')}
                      onDoubleClick={() => startEditing(rowIndex, 'returnDate', row.returnDate)}
                    >
                      {renderCell(rowIndex, 'returnDate', row.returnDate)}
                    </td>
                    <td 
                      style={getCellStyle(rowIndex, 'returnAmount')}
                      onDoubleClick={() => startEditing(rowIndex, 'returnAmount', row.returnAmount)}
                    >
                      {renderCell(rowIndex, 'returnAmount', row.returnAmount)}
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
                      style={getCellStyle(rowIndex, 'reason')}
                      onDoubleClick={() => startEditing(rowIndex, 'reason', row.reason)}
                    >
                      {renderCell(rowIndex, 'reason', row.reason)}
                    </td>
                    <td 
                      style={getCellStyle(rowIndex, 'transport')}
                      onDoubleClick={() => startEditing(rowIndex, 'transport', row.transport)}
                    >
                      {renderCell(rowIndex, 'transport', row.transport)}
                    </td>
                    <td 
                      style={{ ...getCellStyle(rowIndex, 'status'), borderRight: 'none', textAlign: 'center' }}
                      onDoubleClick={() => startEditing(rowIndex, 'status', row.status)}
                    >
                      {renderCell(rowIndex, 'status', row.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={styles.totalsRow}>
                  <td colSpan="6" style={{ ...styles.totalsCell, fontWeight: 'bold', textAlign: 'left' }}>
                    Total
                  </td>
                  <td style={{ ...styles.totalsCell, textAlign: 'right', fontFamily: '"Courier New", monospace', fontWeight: '600' }}>
                    {formatNumber(totals.returnAmount)}
                  </td>
                  <td style={{ ...styles.totalsCell, textAlign: 'right', fontFamily: '"Courier New", monospace', fontWeight: '600' }}>
                    {totals.qty.toFixed(2)}
                  </td>
                  <td style={{ ...styles.totalsCell, textAlign: 'center' }}>-</td>
                  <td style={{ ...styles.totalsCell, textAlign: 'center' }}>-</td>
                  <td style={{ ...styles.totalsCell, textAlign: 'center' }}>-</td>
                  <td style={{ ...styles.totalsCell, borderRight: 'none', textAlign: 'center' }}>-</td>
                </tr>
              </tfoot>
            </table>
            
            {tableLoaded && data.length === 0 && (
              <div style={styles.emptyState}>
                No sales return records found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReturnRegister;