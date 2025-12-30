import React, { useState, useRef, useEffect } from 'react';

const PurchaseRegister = () => {
  // Initial data state
  const [data, setData] = useState([
    {
      id: 1,
      no: 1,
      salesParty: 'AMIT FASHION',
      billNo: 'C00001AA',
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
      billNo: 'C00002AA',
      billDate: '10-12-2025',
      billAmount: '380.00',
      qty: '10.00',
      time: '01-01-1900 12:49:20',
      noOfBale: '0',
      transport: ''
    }
  ]);

  // State for date range
  const [dateRange, setDateRange] = useState({
    from: '01-01-2025',
    to: '31-12-2025'
  });

  // State for editing
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  
  // Refs for cell navigation
  const tableRef = useRef(null);
  const cellRefs = useRef([]);

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

  // Filter data by date range
  const filterDataByDate = () => {
    // This would normally filter data from an API or larger dataset
    // For now, we'll just show a message
    alert(`Filtering data from ${dateRange.from} to ${dateRange.to}`);
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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
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
      billAmount: '0.00',
      qty: '0.00',
      time: '',
      noOfBale: '0',
      transport: ''
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

  // Container styles
  const containerStyle = {   
    fontSize: '15px',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    minHeight: '100vh',
    boxSizing: 'border-box'
  };

  // Header styles
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  };

  const titleStyle = {
    color: '#333',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0'
  };

  // Date filter header styles
  const dateFilterHeaderStyle = {
    backgroundColor: 'white',
    borderRadius: '4px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  };

  const dateFilterLabelStyle = {
    fontWeight: '600',
    color: '#333',
    fontSize: '15px',
    whiteSpace: 'nowrap'
  };

  const dateInputStyle = {
    padding: '6px 10px',
    border: '1px solid #ddd',
    borderRadius: '3px',
    fontSize: '15px',
    width: '120px',
    backgroundColor: '#fff'
  };

  const dateFilterButtonStyle = {
    padding: '6px 15px',
    backgroundColor: '#1B91DA',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  };

  const clearButtonStyle = {
    padding: '6px 15px',
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '8px'
  };

  const actionButtonStyle = (primary = false) => ({
    padding: '6px 12px',
    backgroundColor: primary ? '#1B91DA' : '#f0f0f0',
    color: primary ? 'white' : '#333',
    border: `1px solid ${primary ? '#1B91DA' : '#ccc'}`,
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  });

  // Table container styles
  const tableContainerStyle = {
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    maxHeight: 'calc(100vh - 230px)',
    display: 'flex',
    flexDirection: 'column'
  };

  // Table styles
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed'
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
    salesParty: '180px',
    billNo: '120px',
    billDate: '100px',
    billAmount: '120px',
    qty: '80px',
    time: '150px',
    noOfBale: '80px',
    transport: '120px'
  };

  // Table cell styles
  const getCellStyle = (rowIndex, colName) => {
    const isSelected = selectedCell.row === rowIndex && 
      ['no', 'salesParty', 'billNo', 'billDate', 'billAmount', 'qty', 'time', 'noOfBale', 'transport'].indexOf(colName) === selectedCell.col;
    
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
      boxSizing: 'border-box'
    };

    if (isSelected && !isEditing) {
      baseStyle.outline = '2px solid #1B91DA';
      baseStyle.outlineOffset = '-1px';
      baseStyle.boxShadow = '0 0 0 1px rgba(27, 145, 218, 0.3)';
    }

    if (isEditing) {
      baseStyle.outline = '2px solid #1B91DA';
      baseStyle.outlineOffset = '-1px';
      baseStyle.boxShadow = '0 0 0 1px rgba(27, 145, 218, 0.3)';
      baseStyle.padding = '0';
      baseStyle.position = 'relative';
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
    borderTop: '2px solid #1B91DA'
  };

  const totalsCellStyle = {
    padding: '8px 6px',
    borderRight: '1px solid #e0e0e0',
    textAlign: 'right',
    fontFamily: '"Courier New", monospace',
    fontSize: '15px'
  };

  // Instruction panel style
  const instructionStyle = {
    marginTop: '15px',
    fontSize: '11px',
    color: '#666',
    backgroundColor: '#f9f9f9',
    padding: '8px 12px',
    borderRadius: '3px',
    borderLeft: '3px solid #1B91DA'
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
      {/* Date Filter Header */}
      <div style={dateFilterHeaderStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={dateFilterLabelStyle}>From:</span>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => handleDateChange('from', e.target.value)}
            style={dateInputStyle}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={dateFilterLabelStyle}>To:</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => handleDateChange('to', e.target.value)}
            style={dateInputStyle}
          />
        </div>
        
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

      {/* Table Container */}
      <div style={tableContainerStyle}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
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
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default PurchaseRegister;