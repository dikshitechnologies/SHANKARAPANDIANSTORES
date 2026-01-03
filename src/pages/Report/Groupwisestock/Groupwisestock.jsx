import React, { useState } from 'react';

const GroupwiseStock = () => {
  // --- STATE MANAGEMENT ---
  const [fromDate, setFromDate] = useState('2024-06-14');
  const [toDate, setToDate] = useState('2025-11-26');
  const [selectedGroup, setSelectedGroup] = useState(['ALL']);

  // Dummy groups data
  const groups = [
    'ALL',
    'ASSORTED GOLD',
    'ASSORTED SILVER',
    'GOLD',
    'GOLD BARCODE',
    'GOLD MANAUAL',
    'GOLD PCS',
    'METAL',
    'OLD GOLD.',
    'OLD SILVER.',
    'SILVER',
    'SILVER BARCODE',
    'SILVER MANAUAL',
    'SILVER PCS'
  ];

  // Dummy stock data for different groups
  const stockData = {
    'GOLD': [
      { id: 1, itemName: 'BANGEL', opgPcs: '', opgGms: '', purPcs: 62, purGms: 5511.000, salPcs: 58, salGms: 6450.000, balPcs: 4, balGms: -939.000 },
      { id: 2, itemName: 'BRACELETS', opgPcs: '', opgGms: '', purPcs: 7, purGms: 143.000, salPcs: '', salGms: '', balPcs: 7, balGms: 143.000 },
      { id: 3, itemName: 'CHAIN', opgPcs: '', opgGms: '', purPcs: 6, purGms: 3133.000, salPcs: 2, salGms: 800.000, balPcs: 4, balGms: 2333.000 },
      { id: 4, itemName: 'CHAINGOLD', opgPcs: '', opgGms: '', purPcs: 82, purGms: 1081.000, salPcs: 4, salGms: 43.000, balPcs: 78, balGms: 1038.000 },
      { id: 5, itemName: 'EARRINGS', opgPcs: '', opgGms: '', purPcs: '', purGms: '', salPcs: 3, salGms: 324.000, balPcs: -3, balGms: -324.000 },
      { id: 6, itemName: 'GOLD RING', opgPcs: '', opgGms: '', purPcs: 67, purGms: 1945.000, salPcs: 29, salGms: 73.000, balPcs: 38, balGms: 1872.000 },
      { id: 7, itemName: 'HARAM', opgPcs: '', opgGms: '', purPcs: 3, purGms: 300.000, salPcs: 1, salGms: 100.000, balPcs: 2, balGms: 200.000 },
      { id: 8, itemName: 'NECKLACE', opgPcs: '', opgGms: '', purPcs: '', purGms: '', salPcs: 1, salGms: 18.000, balPcs: -1, balGms: -18.000 },
      { id: 9, itemName: 'NOSE RING', opgPcs: '', opgGms: '', purPcs: '', purGms: '', salPcs: 1, salGms: 8.000, balPcs: -1, balGms: -8.000 },
      { id: 10, itemName: 'PENDANTS', opgPcs: '', opgGms: '', purPcs: '', purGms: '', salPcs: 5, salGms: 700.000, balPcs: -5, balGms: -700.000 },
      { id: 11, itemName: 'RING(GOLD)', opgPcs: '', opgGms: '', purPcs: 3, purGms: 210.000, salPcs: 51, salGms: 630.000, balPcs: -48, balGms: -420.000 },
      { id: 12, itemName: 'RINGS', opgPcs: '', opgGms: '', purPcs: 10, purGms: 100.000, salPcs: '', salGms: '', balPcs: 10, balGms: 100.000 },
      { id: 13, itemName: 'THALI', opgPcs: '', opgGms: '', purPcs: 3, purGms: 220.000, salPcs: 8, salGms: 222.000, balPcs: -5, balGms: -2.000 }
    ],
    'SILVER': [
      { id: 1, itemName: 'SILVER BANGEL', opgPcs: '', opgGms: '', purPcs: 45, purGms: 3200.000, salPcs: 40, salGms: 2800.000, balPcs: 5, balGms: 400.000 },
      { id: 2, itemName: 'SILVER CHAIN', opgPcs: '', opgGms: '', purPcs: 30, purGms: 1500.000, salPcs: 25, salGms: 1200.000, balPcs: 5, balGms: 300.000 },
      { id: 3, itemName: 'SILVER RING', opgPcs: '', opgGms: '', purPcs: 100, purGms: 500.000, salPcs: 85, salGms: 425.000, balPcs: 15, balGms: 75.000 }
    ],
    'ASSORTED GOLD': [
      { id: 1, itemName: 'ASSORTED BANGEL', opgPcs: '', opgGms: '', purPcs: 25, purGms: 2200.000, salPcs: 20, salGms: 1800.000, balPcs: 5, balGms: 400.000 },
      { id: 2, itemName: 'ASSORTED RING', opgPcs: '', opgGms: '', purPcs: 15, purGms: 750.000, salPcs: 12, salGms: 600.000, balPcs: 3, balGms: 150.000 }
    ],
    'ASSORTED SILVER': [
      { id: 1, itemName: 'ASSORTED SILVER BANGEL', opgPcs: '', opgGms: '', purPcs: 35, purGms: 2500.000, salPcs: 30, salGms: 2100.000, balPcs: 5, balGms: 400.000 }
    ],
    'GOLD BARCODE': [
      { id: 1, itemName: 'BC BANGEL', opgPcs: '', opgGms: '', purPcs: 50, purGms: 4500.000, salPcs: 45, salGms: 4000.000, balPcs: 5, balGms: 500.000 }
    ],
    'SILVER BARCODE': [
      { id: 1, itemName: 'BC SILVER CHAIN', opgPcs: '', opgGms: '', purPcs: 40, purGms: 2000.000, salPcs: 35, salGms: 1750.000, balPcs: 5, balGms: 250.000 }
    ]
  };

  const cashSalesPayments = {
    'GOLD': { cashSales: 32429496.00, payments: 11417342.67, closingCash: 1012153.33 },
    'SILVER': { cashSales: 5500000.00, payments: 4800000.00, closingCash: 250000.00 },
    'ASSORTED GOLD': { cashSales: 8900000.00, payments: 7500000.00, closingCash: 450000.00 },
    'ASSORTED SILVER': { cashSales: 4500000.00, payments: 3800000.00, closingCash: 350000.00 },
    'GOLD BARCODE': { cashSales: 15000000.00, payments: 13000000.00, closingCash: 800000.00 },
    'SILVER BARCODE': { cashSales: 7500000.00, payments: 6500000.00, closingCash: 400000.00 }
  };


  // Calculate totals
  const calculateTotals = (data) => {
    if (!data || data.length === 0) return { purPcs: 0, purGms: 0, salPcs: 0, salGms: 0, balPcs: 0, balGms: 0 };
    return data.reduce((acc, item) => ({
      purPcs: acc.purPcs + (parseFloat(item.purPcs) || 0),
      purGms: acc.purGms + (parseFloat(item.purGms) || 0),
      salPcs: acc.salPcs + (parseFloat(item.salPcs) || 0),
      salGms: acc.salGms + (parseFloat(item.salGms) || 0),
      balPcs: acc.balPcs + (parseFloat(item.balPcs) || 0),
      balGms: acc.balGms + (parseFloat(item.balGms) || 0)
    }), { purPcs: 0, purGms: 0, salPcs: 0, salGms: 0, balPcs: 0, balGms: 0 });
  };

  const currentData = Array.isArray(selectedGroup)
    ? (selectedGroup.includes('ALL')
        ? Object.values(stockData).flat()
        : selectedGroup.flatMap(g => stockData[g] || []))
    : (selectedGroup && stockData[selectedGroup] ? stockData[selectedGroup] : []);
  const totals = calculateTotals(currentData);
  const financialData = selectedGroup && cashSalesPayments[selectedGroup] ? cashSalesPayments[selectedGroup] : null;

  // --- STYLES ---
  const styles = {
    container: {
      padding: '24px',
      background: '#f6f8fa',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Arial, sans-serif',
    },
    card: {
      background: '#fff',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      padding: '24px',
      maxWidth: '100%',
      margin: '0 auto',
    },
    filterRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '18px',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
    },
    formField: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    label: {
      fontWeight: 600,
      color: '#333',
      fontSize: '14px',
      minWidth: '80px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
    input: {
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '8px 10px',
      fontSize: '14px',
      background: '#fff',
      color: '#333',
      width: '100%',
      height: '40px',
      flex: 1,
      minWidth: '110px',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    selectGroupBtn: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '8px 10px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
      height: '40px',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
      minWidth: '200px',
      outline: 'none',
    },
    leftSide: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: 1,
      flexWrap: 'nowrap',
    },
    rightSide: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0,
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.18)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modal: {
      background: '#fff',
      borderRadius: '10px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
      minWidth: '370px',
      maxWidth: '95vw',
      maxHeight: '80vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    modalHeader: {
      background: '#1B91DA',
      color: '#fff',
      fontWeight: 600,
      fontSize: '18px',
      padding: '16px 20px',
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
    },
    modalBody: {
      padding: '18px 20px',
      overflowY: 'auto',
      flex: 1,
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      padding: '16px 20px',
      borderTop: '1px solid #f0f0f0',
      background: '#fafcff',
    },
    modalCheckboxRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '12px',
      fontSize: '16px',
      fontWeight: 500,
      color: '#222',
    },
    modalCheckbox: {
      width: '18px',
      height: '18px',
      accentColor: '#1B91DA',
    },
    modalBtn: {
      background: '#1B91DA',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 28px',
      fontWeight: 600,
      fontSize: '15px',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    modalBtnClear: {
      background: '#fff',
      color: '#ff4d4f',
      border: '1.5px solid #ff4d4f',
      borderRadius: '6px',
      padding: '8px 22px',
      fontWeight: 600,
      fontSize: '15px',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    button: {
      background: '#1B91DA',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '10px 28px',
      fontWeight: 600,
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      height: '40px',
      boxShadow: '0 2px 4px rgba(27, 145, 218, 0.2)',
    },
    buttonSecondary: {
      background: '#fff',
      color: '#1B91DA',
      border: '1.5px solid #1B91DA',
      borderRadius: '6px',
      padding: '10px 22px',
      fontWeight: 600,
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      height: '40px',
    },
    tableWrap: {
      marginTop: '18px',
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    },
    th: {
      background: '#1B91DA',
      color: '#fff',
      fontWeight: 600,
      fontSize: '13px',
      padding: '10px 8px',
      border: 'none',
      textAlign: 'center',
      whiteSpace: 'nowrap',
    },
    td: {
      padding: '10px 8px',
      textAlign: 'center',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '15px',
      color: '#222',
      background: '#fff',
    },
    totalRow: {
      background: '#e6f7ff',
      fontWeight: 700,
      color: '#096dd9',
    },
    emptyMsg: {
      textAlign: 'center',
      color: '#888',
      fontSize: '16px',
      padding: '32px 0',
    },
  };

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    // No-op for now (dummy data)
  };
  const [showGroupModal, setShowGroupModal] = useState(false);
  const handleRefresh = () => {
    setFromDate('2024-06-14');
    setToDate('2025-11-26');
    setSelectedGroup(['ALL']);
  };
  const handleGroupModalOpen = () => setShowGroupModal(true);
  const handleGroupModalClose = () => setShowGroupModal(false);
  const handleGroupCheck = (group) => {
    if (group === 'ALL') {
      setSelectedGroup(['ALL']);
    } else {
      let updated = selectedGroup.includes('ALL') ? [] : [...selectedGroup];
      if (updated.includes(group)) {
        updated = updated.filter(g => g !== group);
      } else {
        updated.push(group);
      }
      if (updated.length === 0) updated = ['ALL'];
      setSelectedGroup(updated);
    }
  };
  const handleGroupClear = () => setSelectedGroup(['ALL']);
  const handleGroupOk = () => setShowGroupModal(false);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <form onSubmit={handleSearch}>
          <div style={styles.filterRow}>
            {/* LEFT SIDE: Date fields and Select Group */}
            <div style={styles.leftSide}>
              {/* From Date */}
              <div style={styles.formField}>
                <label style={styles.label}>From Date:</label>
                <input
                  type="date"
                  style={styles.input}
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </div>

              {/* To Date */}
              <div style={styles.formField}>
                <label style={styles.label}>To Date:</label>
                <input
                  type="date"
                  style={styles.input}
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </div>

              {/* Select Group */}
              <div style={{...styles.formField, flex: 1, minWidth: '200px'}}>
                <label style={styles.label}>Select Group:</label>
                <button type="button" style={styles.selectGroupBtn} onClick={handleGroupModalOpen}>
                  <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    flex: 1 
                  }}>
                    {selectedGroup.length === 1 && selectedGroup[0] === 'ALL'
                      ? 'ALL'
                      : selectedGroup.join(', ')}
                  </span>
                  <span style={{ color: '#1B91DA', fontSize: '10px', marginLeft: '8px' }}>▼</span>
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: Buttons */}
            <div style={styles.rightSide}>
              <button type="submit" style={styles.button}>Search</button>
              <button type="button" style={styles.buttonSecondary} onClick={handleRefresh}>Refresh</button>
            </div>
          </div>
        </form>
        
        {/* Select Group Modal */}
        {showGroupModal && (
          <div style={styles.modalOverlay} onClick={handleGroupModalClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>Select Groups</div>
              <div style={styles.modalBody}>
                {groups.map((group, idx) => (
                  <div key={group} style={styles.modalCheckboxRow}>
                    <input
                      type="checkbox"
                      style={styles.modalCheckbox}
                      checked={selectedGroup.includes(group)}
                      onChange={() => handleGroupCheck(group)}
                      disabled={group === 'ALL' && selectedGroup.length > 1}
                    />
                    <span>{group}</span>
                  </div>
                ))}
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.modalBtnClear} onClick={handleGroupClear}>Clear</button>
                <button type="button" style={styles.modalBtn} onClick={handleGroupOk}>OK</button>
              </div>
            </div>
          </div>
        )}
        
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sl No.</th>
                <th style={styles.th}>Item Name</th>
                <th style={styles.th}>Opg Pcs</th>
                <th style={styles.th}>Opg Gms</th>
                <th style={styles.th}>Pur Pcs</th>
                <th style={styles.th}>Pur Gms</th>
                <th style={styles.th}>Sal Pcs</th>
                <th style={styles.th}>Sal Gms</th>
                <th style={styles.th}>Bal Pcs</th>
                <th style={styles.th}>Bal Gms</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="10" style={styles.emptyMsg}>
                    Enter search criteria and click "Search" to view group wise stock
                  </td>
                </tr>
              ) : (
                <>
                  {currentData.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={styles.td}>{idx + 1}</td>
                      <td style={{...styles.td, textAlign: 'left', paddingLeft: '15px'}}>{item.itemName}</td>
                      <td style={styles.td}>{item.opgPcs}</td>
                      <td style={styles.td}>{item.opgGms}</td>
                      <td style={styles.td}>{item.purPcs}</td>
                      <td style={styles.td}>{item.purGms ? item.purGms.toFixed(3) : ''}</td>
                      <td style={styles.td}>{item.salPcs}</td>
                      <td style={styles.td}>{item.salGms ? item.salGms.toFixed(3) : ''}</td>
                      <td style={styles.td}>{item.balPcs}</td>
                      <td style={styles.td}>{item.balGms ? item.balGms.toFixed(3) : ''}</td>
                    </tr>
                  ))}
                  <tr style={styles.totalRow}>
                    <td colSpan="4" style={styles.td}>Total</td>
                    <td style={styles.td}>{totals.purPcs.toFixed(1)}</td>
                    <td style={styles.td}>{totals.purGms.toFixed(3)}</td>
                    <td style={styles.td}>{totals.salPcs.toFixed(0)}</td>
                    <td style={styles.td}>{totals.salGms.toFixed(3)}</td>
                    <td style={styles.td}>{totals.balPcs.toFixed(1)}</td>
                    <td style={styles.td}>{totals.balGms.toFixed(3)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GroupwiseStock;
