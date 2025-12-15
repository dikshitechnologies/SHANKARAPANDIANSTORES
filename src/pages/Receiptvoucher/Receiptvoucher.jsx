import React, { useState, useRef, useEffect } from 'react';
import { ActionButtons, ActionButtons1, AddButton, EditButton, DeleteButton } from '../../components/Buttons/ActionButtons';

const ReceiptVoucher = () => {
  // State for form data
  const [voucherData, setVoucherData] = useState({
    voucherNo: 'RE0000001',
    gstType: 'CGST/SGST',
    date: '15-12-2025',
    costCenter: '',
    accountName: '',
    balance: '0.00',
    balanceType: 'Dr',
    rows: [
      { id: 1, cashBank: '', crDr: '', type: '', chqNo: '', chqDt: '', narration: '', amount: '' }
    ],
    referenceBills: []
  });

  // State for popup
  const [showPopup, setShowPopup] = useState(false);
  const [activeRow, setActiveRow] = useState(null);

  // State for active action buttons
  const [activeTopAction, setActiveTopAction] = useState('all');
  const [activeFooterAction, setActiveFooterAction] = useState('all');

  // Refs for focus management
  const inputRefs = useRef({});

  // Handle input changes
  const handleInputChange = (field, value, rowId = null) => {
    if (rowId !== null) {
      // Update row data
      setVoucherData(prev => ({
        ...prev,
        rows: prev.rows.map(row => 
          row.id === rowId ? { ...row, [field]: value } : row
        )
      }));
    } else {
      // Update top-level fields
      setVoucherData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle Enter key for navigation
  const handleKeyDown = (e, rowId, fieldName) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If Enter is pressed in amount field, show popup
      if (fieldName === 'amount') {
        setActiveRow(rowId);
        setShowPopup(true);
        return;
      }
      
      // Otherwise, navigate to next field
      const fieldOrder = ['cashBank', 'crDr', 'type', 'chqNo', 'chqDt', 'narration', 'amount'];
      const currentIndex = fieldOrder.indexOf(fieldName);
      
      if (currentIndex < fieldOrder.length - 1) {
        // Move to next field in same row
        const nextField = fieldOrder[currentIndex + 1];
        if (inputRefs.current[`${rowId}-${nextField}`]) {
          inputRefs.current[`${rowId}-${nextField}`].focus();
        }
      } else {
        // If at last field of row, add new row and focus on first field
        addNewRow();
      }
    }
  };

  // Add new row
  const addNewRow = () => {
    const newId = voucherData.rows.length > 0 ? Math.max(...voucherData.rows.map(r => r.id)) + 1 : 1;
    const newRow = { id: newId, cashBank: '', crDr: '', type: '', chqNo: '', chqDt: '', narration: '', amount: '' };
    
    setVoucherData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));

    // Focus on first field of new row after a small delay
    setTimeout(() => {
      if (inputRefs.current[`${newId}-cashBank`]) {
        inputRefs.current[`${newId}-cashBank`].focus();
      }
    }, 10);
  };

  // Remove row
  const removeRow = (id) => {
    if (voucherData.rows.length <= 1) return;
    
    setVoucherData(prev => ({
      ...prev,
      rows: prev.rows.filter(row => row.id !== id)
    }));
  };

  // Calculate total
  const calculateTotal = () => {
    return voucherData.rows.reduce((total, row) => {
      const amount = parseFloat(row.amount) || 0;
      return total + amount;
    }, 0).toFixed(2);
  };

  // Handle popup close with data
  const handlePopupClose = (popupData) => {
    if (popupData && activeRow !== null) {
      // Update the row with popup data
      setVoucherData(prev => ({
        ...prev,
        rows: prev.rows.map(row => 
          row.id === activeRow ? { ...row, ...popupData } : row
        )
      }));
    }
    setShowPopup(false);
    setActiveRow(null);
  };

  // Handle form actions
  const handleRefresh = () => {
    setVoucherData({
      voucherNo: 'RE0000001',
      gstType: 'CGST/SGST',
      date: '15-12-2025',
      costCenter: '',
      accountName: '',
      balance: '0.00',
      balanceType: 'Dr',
      rows: [{ id: 1, cashBank: '', crDr: '', type: '', chqNo: '', chqDt: '', narration: '', amount: '' }],
      referenceBills: []
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      handleRefresh();
    }
  };

  const handleEdit = () => {
    alert('Edit mode activated');
  };

  const handleSubmit = () => {
    alert('Voucher submitted successfully!');
  };

  // Effect to calculate balance based on amounts
  useEffect(() => {
    const total = calculateTotal();
    setVoucherData(prev => ({
      ...prev,
      balance: total
    }));
  }, [voucherData.rows]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* First Row - Voucher Details */}
        <div style={styles.topSection}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Voucher No</label>
            <div style={styles.voucherNo}>{voucherData.voucherNo}</div>
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>GST Type</label>
            <select 
              style={styles.select}
              value={voucherData.gstType}
              onChange={(e) => handleInputChange('gstType', e.target.value)}
            >
              <option value="CGST/SGST">CGST/SGST</option>
              <option value="IGST">IGST</option>
              <option value="None">None</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Date</label>
            <input 
              type="text" 
              style={styles.input}
              value={voucherData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Cost Center</label>
            <input 
              type="text" 
              style={styles.input}
              value={voucherData.costCenter}
              onChange={(e) => handleInputChange('costCenter', e.target.value)}
              placeholder="Select Cost Center"
            />
          </div>
        </div>

        {/* Second Row - Account Name Section */}
        <div style={styles.topSection}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>A/C Name</label>
            <input 
              type="text" 
              style={styles.input}
              value={voucherData.accountName}
              onChange={(e) => handleInputChange('accountName', e.target.value)}
              placeholder="Account Name"
            />
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>DR</label>
            <input 
              type="text" 
              style={styles.input}
              value="DR"
              readOnly
            />
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Vertical</label>
            <input 
              type="text" 
              style={styles.input}
              placeholder="Select Vertical"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Balance</label>
            <div style={styles.balanceDisplay}>
              <span style={styles.balanceAmount}>{voucherData.balance}</span>
              <span style={styles.balanceType}>{voucherData.balanceType}</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div style={styles.section}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{...styles.tableCell, width: '40px'}}>No</th>
                  <th style={{...styles.tableCell, width: '200px'}}>Cash/Bank</th>
                  <th style={{...styles.tableCell, width: '80px'}}>Cr/Dr</th>
                  <th style={{...styles.tableCell, width: '120px'}}>Type</th>
                  <th style={{...styles.tableCell, width: '120px'}}>Chq No</th>
                  <th style={{...styles.tableCell, width: '120px'}}>Chq Dt</th>
                  <th style={{...styles.tableCell, width: '200px'}}>Narration</th>
                  <th style={{...styles.tableCell, width: '120px'}}>Amount</th>
                  <th style={{...styles.tableCell, width: '60px'}}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {voucherData.rows.map((row, index) => (
                  <tr key={row.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{index + 1}</td>
                    <td style={styles.tableCell}>
                      <input
                        type="text"
                        style={styles.tableInput}
                        value={row.cashBank}
                        onChange={(e) => handleInputChange('cashBank', e.target.value, row.id)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 'cashBank')}
                        ref={el => inputRefs.current[`${row.id}-cashBank`] = el}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <select
                        style={styles.tableSelect}
                        value={row.crDr}
                        onChange={(e) => handleInputChange('crDr', e.target.value, row.id)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 'crDr')}
                        ref={el => inputRefs.current[`${row.id}-crDr`] = el}
                      >
                        <option value="">Select</option>
                        <option value="Cr">Cr</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </td>
                    <td style={styles.tableCell}>
                      <select
                        style={styles.tableSelect}
                        value={row.type}
                        onChange={(e) => handleInputChange('type', e.target.value, row.id)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 'type')}
                        ref={el => inputRefs.current[`${row.id}-type`] = el}
                      >
                        <option value="">Select</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Online">Online</option>
                      </select>
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        type="text"
                        style={styles.tableInput}
                        value={row.chqNo}
                        onChange={(e) => handleInputChange('chqNo', e.target.value, row.id)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 'chqNo')}
                        ref={el => inputRefs.current[`${row.id}-chqNo`] = el}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        type="text"
                        style={styles.tableInput}
                        value={row.chqDt}
                        onChange={(e) => handleInputChange('chqDt', e.target.value, row.id)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 'chqDt')}
                        placeholder="DD-MM-YYYY"
                        ref={el => inputRefs.current[`${row.id}-chqDt`] = el}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        type="text"
                        style={styles.tableInput}
                        value={row.narration}
                        onChange={(e) => handleInputChange('narration', e.target.value, row.id)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 'narration')}
                        ref={el => inputRefs.current[`${row.id}-narration`] = el}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        type="text"
                        style={styles.tableInput}
                        value={row.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value, row.id)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 'amount')}
                        ref={el => inputRefs.current[`${row.id}-amount`] = el}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        style={styles.removeButton}
                        onClick={() => removeRow(row.id)}
                        disabled={voucherData.rows.length <= 1}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reference Bill Details */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Reference Bill Details</h3>
            <div style={styles.totalBadge}>Total: 0.00</div>
          </div>
          <div style={styles.referenceTable}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{...styles.tableCell, width: '40px'}}>No</th>
                  <th style={{...styles.tableCell, width: '120px'}}>Ref No</th>
                  <th style={{...styles.tableCell, width: '120px'}}>Bill No</th>
                  <th style={{...styles.tableCell, width: '120px'}}>Date</th>
                  <th style={{...styles.tableCell, width: '120px'}}>Bill Amount</th>
                  <th style={{...styles.tableCell, width: '120px'}}>Paid Amount</th>
                  <th style={{...styles.tableCell, width: '120px'}}>Balance Amount</th>
                  <th style={{...styles.tableCell, width: '120px'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.tableRow}>
                  <td colSpan="8" style={{...styles.tableCell, textAlign: 'center', padding: '20px', color: 'var(--muted)'}}>
                    No reference bills added
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons and Total */}
        <div style={styles.footer}>
          <div style={styles.actionButtons}>
            <ActionButtons
              activeButton={activeTopAction}
              onButtonClick={(type) => {
                setActiveTopAction(type);
                if (type === 'add') addNewRow();
                else if (type === 'edit') handleEdit();
                else if (type === 'delete') handleDelete();
              }}
            >
              <AddButton buttonType="add" />
              <EditButton buttonType="edit" />
              <DeleteButton buttonType="delete" />
            </ActionButtons>
          </div>
          
          <div style={styles.totalSection}>
            <span style={styles.totalLabel}>Total:</span>
            <span style={styles.totalAmount}>{calculateTotal()}</span>
          </div>

          <div style={styles.footerButtons}>
            <ActionButtons1
              onClear={handleRefresh}
              onSave={handleSubmit}
              onPrint={() => window.print()}
              activeButton={activeFooterAction}
              onButtonClick={(type) => setActiveFooterAction(type)}
            />
          </div>
        </div>
      </div>

      {/* Popup Modal for Reference Bill Details */}
      {showPopup && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Reference Bill Details</h3>
              <button style={styles.closeButton} onClick={() => handlePopupClose(null)}>×</button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.modalForm}>
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Ref No</label>
                  <input type="text" style={styles.modalInput} />
                </div>
                
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Bill No</label>
                  <input type="text" style={styles.modalInput} />
                </div>
                
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Date</label>
                  <input type="text" style={styles.modalInput} placeholder="DD-MM-YYYY" />
                </div>
                
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Bill Amount</label>
                  <input type="text" style={styles.modalInput} />
                </div>
                
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Paid Amount</label>
                  <input type="text" style={styles.modalInput} />
                </div>
                
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Balance Amount</label>
                  <input type="text" style={styles.modalInput} />
                </div>
                
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Amount</label>
                  <input type="text" style={styles.modalInput} />
                </div>
              </div>
              
              <div style={styles.modalActions}>
                <button style={styles.secondaryButton} onClick={() => handlePopupClose(null)}>
                  Cancel
                </button>
                <button 
                  style={styles.primaryButton} 
                  onClick={() => handlePopupClose({
                    refNo: 'REF001',
                    billNo: 'BILL001',
                    date: '15-12-2025',
                    billAmount: '1000.00',
                    paidAmount: '500.00',
                    balanceAmount: '500.00',
                    amount: '500.00'
                  })}
                >
                  Add Reference
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles using your color palette
const styles = {
  container: {
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    color: 'var(--accent)',
    fontSize: '28px',
    fontWeight: '600',
    margin: 0,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    backdropFilter: 'blur(8px) saturate(120%)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 30px rgba(16, 24, 40, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  },
  topSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
    alignItems: 'flex-start',
  },
  topRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    width: '100%',
    alignItems: 'flex-start',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: '14px',
    color: '#333',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  voucherNo: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#0f172a',
    padding: '8px 10px',
    backgroundColor: '#f0f7fb',
    borderRadius: '4px',
    minWidth: '100px',
    border: '1px solid #ddd',
    lineHeight: 1.5,
    boxSizing: 'border-box',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    flex: 1,
  },
  select: {
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    fontSize: '14px',
    fontWeight: 400,
    minWidth: '100px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    height: '40px',
    boxSizing: 'border-box',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.5,
    width: '100%',
    flex: 1,
  },
  selectFocused: {
    padding: '8px 10px',
    borderRadius: '4px',
    border: '2px solid #1B91DA',
    backgroundColor: 'white',
    fontSize: '14px',
    fontWeight: 400,
    minWidth: '100px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    height: '40px',
    boxSizing: 'border-box',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.5,
    width: '100%',
    flex: 1,
    boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
  },
  input: {
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    fontSize: '14px',
    fontWeight: 400,
    minWidth: '100px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    height: '40px',
    boxSizing: 'border-box',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.5,
    width: '100%',
    flex: 1,
  },
  inputFocused: {
    padding: '8px 10px',
    borderRadius: '4px',
    border: '2px solid #1B91DA',
    backgroundColor: 'white',
    fontSize: '14px',
    fontWeight: 400,
    minWidth: '100px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    height: '40px',
    boxSizing: 'border-box',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.5,
    width: '100%',
    flex: 1,
    boxShadow: '0 0 0 2px rgba(27, 145, 218, 0.2)',
  },
  section: {
    marginBottom: '24px',
    backgroundColor: 'var(--bg-2)',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid var(--glass-border)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    color: 'var(--accent)',
    margin: 0,
    fontWeight: '600',
  },
  accountSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  balanceSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    minWidth: '200px',
  },
  balanceDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'white',
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    height: '40px',
    boxSizing: 'border-box',
    lineHeight: 1.5,
  },
  balanceAmount: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1B91DA',
    lineHeight: 1.5,
  },
  balanceType: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: 'var(--accent)',
  },
  tableCell: {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '14px',
    borderBottom: '1px solid #e2e8f0',
    verticalAlign: 'middle',
  },
  tableRow: {
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: '#f8fafc',
    },
  },
  tableInput: {
    width: '100%',
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontWeight: 400,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    height: '32px',
  },
  tableSelect: {
    width: '100%',
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontWeight: 400,
    outline: 'none',
    backgroundColor: 'white',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    height: '32px',
  },
  removeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--danger)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    '&:disabled': {
      color: '#cbd5e1',
      cursor: 'not-allowed',
    },
  },
  referenceTable: {
    overflowX: 'auto',
  },
  totalBadge: {
    backgroundColor: 'var(--accent-2)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  primaryButton: {
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'var(--accent-2)',
    },
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'var(--bg-1)',
    },
  },
  totalSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  totalLabel: {
    fontSize: '16px',
    color: 'var(--muted)',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--accent)',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    fontSize: '20px',
    color: 'var(--accent)',
    margin: 0,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    color: 'var(--muted)',
    cursor: 'pointer',
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
  },
  modalContent: {
    padding: '24px',
  },
  modalForm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  modalField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalLabel: {
    fontSize: '14px',
    color: 'var(--accent)',
    fontWeight: '500',
  },
  modalInput: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
  },
};

export default ReceiptVoucher;