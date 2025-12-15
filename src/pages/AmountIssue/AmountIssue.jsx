import React, { useState } from 'react';
import styles from './AmountIssue.module.css';
import { AddButton, EditButton, DeleteButton, ClearButton, SaveButton, PrintButton } from '../../components/Buttons/ActionButtons';
import Notiflix from 'notiflix';

const AmountIssue = () => {
  const [activeFooterAction, setActiveFooterAction] = useState('all');
  const [formData, setFormData] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    type: '',
    expenseCategory: '',
    paymentToWhom: '',
    expenseDescription: '',
    expensePaymode: 'CASH',
    refNo: '11093',
    issuedAmount: '',
    paymentIssuedBy: '',
  });

  const [denominations, setDenominations] = useState({
    500: { available: 10, issue: '' },
    200: { available: 1, issue: '' },
    100: { available: 40, issue: '' },
    50: { available: 1, issue: '' },
    20: { available: 4, issue: '' },
    10: { available: 143, issue: '' },
    5: { available: 10, issue: '' },
    2: { available: 93, issue: '' },
    1: { available: 97, issue: '' },
  });

  const denominationKeys = [500, 200, 100, 50, 20, 10, 5, 2, 1];

  const calculateBalance = (denom) => {
    const available = Number(denominations[denom].available) || 0;
    const issue = Number(denominations[denom].issue) || 0;
    return available - issue;
  };

  const handleDenominationChange = (denom, value) => {
    const numValue = value === '' ? '' : Number(value) || 0;
    const available = Number(denominations[denom].available) || 0;
    
    if (numValue > available) {
      Notiflix.Notify.warning(`Issue amount cannot exceed available amount for ₹${denom}`);
      return;
    }

    setDenominations(prev => ({
      ...prev,
      [denom]: { ...prev[denom], issue: value }
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalIssued = () => {
    return denominationKeys.reduce((total, denom) => {
      const issue = Number(denominations[denom].issue) || 0;
      return total + (issue * denom);
    }, 0);
  };

  const handleSave = () => {
    if (!formData.expenseCategory) {
      Notiflix.Notify.warning('Please enter Expense Category');
      return;
    }
    if (!formData.paymentToWhom) {
      Notiflix.Notify.warning('Please enter Payment To Whom');
      return;
    }
    if (!formData.issuedAmount) {
      Notiflix.Notify.warning('Please enter Issued Amount');
      return;
    }

    const totalIssued = calculateTotalIssued();
    const enteredAmount = Number(formData.issuedAmount) || 0;

    if (totalIssued !== enteredAmount) {
      Notiflix.Notify.warning(`Total issued from denominations (₹${totalIssued}) does not match entered amount (₹${enteredAmount})`);
      return;
    }

    const payload = {
      ...formData,
      denominations: denominations,
      totalIssued: totalIssued
    };

    console.log('Save payload:', JSON.stringify(payload, null, 2));
    Notiflix.Notify.success('Amount Issue saved successfully!');
  };

  const handleEdit = () => {
    console.log('Edit mode activated');
    Notiflix.Notify.info('Edit mode activated');
  };

  const handleDelete = () => {
    Notiflix.Confirm.show(
      'Delete Confirmation',
      'Are you sure you want to delete this record?',
      'Yes',
      'No',
      () => {
        console.log('Record deleted');
        Notiflix.Notify.success('Record deleted successfully!');
        handleClear();
      },
      () => {
        console.log('Delete cancelled');
      }
    );
  };

  const handleClear = () => {
    setFormData({
      expenseDate: new Date().toISOString().split('T')[0],
      type: '',
      expenseCategory: '',
      paymentToWhom: '',
      expenseDescription: '',
      expensePaymode: 'CASH',
      refNo: '11093',
      issuedAmount: '',
      paymentIssuedBy: '',
    });

    setDenominations({
      500: { available: 10, issue: '' },
      200: { available: 1, issue: '' },
      100: { available: 40, issue: '' },
      50: { available: 1, issue: '' },
      20: { available: 4, issue: '' },
      10: { available: 143, issue: '' },
      5: { available: 10, issue: '' },
      2: { available: 93, issue: '' },
      1: { available: 97, issue: '' },
    });

    Notiflix.Notify.success('Form cleared successfully!');
  };

  const handlePrint = () => {
    console.log('Printing...');
    window.print();
  };

  const handleAddType = () => {
    Notiflix.Notify.info('Add Type functionality - To be implemented');
  };

  const handleAddCategory = () => {
    Notiflix.Notify.info('Add Category functionality - To be implemented');
  };

  const handleAddPayee = () => {
    Notiflix.Notify.info('Add Payee functionality - To be implemented');
  };

  return (
    <div className={styles.container}>
      

      <div className={styles.formSection}>
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Expense Date</label>
            <input
              type="date"
              value={formData.expenseDate}
              onChange={(e) => handleInputChange('expenseDate', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Type</label>
            <div className={styles.inputWithButton}>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className={styles.select}
              >
                <option value="">Select Type</option>
                <option value="Petty Cash">Petty Cash</option>
                <option value="Office Expense">Office Expense</option>
                <option value="Travel">Travel</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Others">Others</option>
              </select>
              <button className={styles.addButton} onClick={handleAddType}>+</button>
            </div>
          </div>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Expenses Category</label>
            <div className={styles.inputWithButton}>
              <input
                type="text"
                value={formData.expenseCategory}
                onChange={(e) => handleInputChange('expenseCategory', e.target.value)}
                className={styles.input}
                placeholder="Enter category"
              />
              <button className={styles.addButton} onClick={handleAddCategory}>+</button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Payment To Whom</label>
            <div className={styles.inputWithButton}>
              <input
                type="text"
                value={formData.paymentToWhom}
                onChange={(e) => handleInputChange('paymentToWhom', e.target.value)}
                className={styles.input}
                placeholder="Enter payee name"
              />
              <button className={styles.addButton} onClick={handleAddPayee}>+</button>
            </div>
          </div>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Expenses Description</label>
            <textarea
              value={formData.expenseDescription}
              onChange={(e) => handleInputChange('expenseDescription', e.target.value)}
              className={styles.textarea}
              placeholder="Enter description"
              rows="3"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Expenses Paymode</label>
            <div className={styles.paymodeGroup}>
              <select
                value={formData.expensePaymode}
                onChange={(e) => handleInputChange('expensePaymode', e.target.value)}
                className={styles.select}
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="CARD">CARD</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="NEFT">NEFT</option>
              </select>
              <div className={styles.refNoGroup}>
                <span className={styles.refLabel}>Ref No:</span>
                <input
                  type="text"
                  value={formData.refNo}
                  onChange={(e) => handleInputChange('refNo', e.target.value)}
                  className={styles.refInput}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Issued Amount</label>
            <input
              type="number"
              value={formData.issuedAmount}
              onChange={(e) => handleInputChange('issuedAmount', e.target.value)}
              className={styles.input}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Payment Issued By</label>
            <input
              type="text"
              value={formData.paymentIssuedBy}
              onChange={(e) => handleInputChange('paymentIssuedBy', e.target.value)}
              className={styles.input}
              placeholder="Enter issuer name"
            />
          </div>
        </div>
      </div>

      <div className={styles.denominationSection}>
        <h3 className={styles.sectionTitle}>Denomination Details</h3>
        <div className={styles.denominationTable}>
          <table>
            <thead>
              <tr>
                <th>Desc</th>
                {denominationKeys.map(denom => (
                  <th key={denom}>₹{denom}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className={styles.availableRow}>
                <td className={styles.rowLabel}>Available</td>
                {denominationKeys.map(denom => (
                  <td key={denom}>{denominations[denom].available}</td>
                ))}
              </tr>
              <tr className={styles.issueRow}>
                <td className={styles.rowLabel}>Issue</td>
                {denominationKeys.map(denom => (
                  <td key={denom}>
                    <input
                      type="number"
                      value={denominations[denom].issue}
                      onChange={(e) => handleDenominationChange(denom, e.target.value)}
                      className={styles.denomInput}
                      min="0"
                      max={denominations[denom].available}
                    />
                  </td>
                ))}
              </tr>
              <tr className={styles.balanceRow}>
                <td className={styles.rowLabel}>Balance</td>
                {denominationKeys.map(denom => (
                  <td key={denom} className={styles.balanceCell}>
                    {calculateBalance(denom)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.totalSection}>
          <div className={styles.totalItem}>
            <span className={styles.totalLabel}>Total Issued from Denominations:</span>
            <span className={styles.totalValue}>₹{calculateTotalIssued().toFixed(2)}</span>
          </div>
          <div className={styles.totalItem}>
            <span className={styles.totalLabel}>Entered Issued Amount:</span>
            <span className={styles.totalValue}>₹{(Number(formData.issuedAmount) || 0).toFixed(2)}</span>
          </div>
          <div className={styles.totalItem}>
            <span className={styles.totalLabel}>Difference:</span>
            <span className={`${styles.totalValue} ${
              calculateTotalIssued() !== (Number(formData.issuedAmount) || 0) ? styles.errorValue : styles.successValue
            }`}>
              ₹{(calculateTotalIssued() - (Number(formData.issuedAmount) || 0)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.footerSection}>
        <div className={styles.leftButtons}>
          <AddButton onClick={() => Notiflix.Notify.info('Add functionality')} isActive={activeFooterAction === 'all' || activeFooterAction === 'add'} />
          <EditButton onClick={handleEdit} isActive={activeFooterAction === 'all' || activeFooterAction === 'edit'} />
          <DeleteButton onClick={handleDelete} isActive={activeFooterAction === 'all' || activeFooterAction === 'delete'} />
        </div>
        <div className={styles.rightButtons}>
          <ClearButton onClick={handleClear} isActive={activeFooterAction === 'all' || activeFooterAction === 'clear'} />
          <SaveButton onClick={handleSave} isActive={activeFooterAction === 'all' || activeFooterAction === 'save'} />
          <PrintButton onClick={handlePrint} isActive={activeFooterAction === 'all' || activeFooterAction === 'print'} />
        </div>
      </div>
    </div>
  );
};

export default AmountIssue;
