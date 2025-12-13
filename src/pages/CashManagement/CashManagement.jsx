import React, { useState, useEffect } from 'react';
import styles from './CashManagement.module.css';
import { ActionButtons1 } from '../../components/Buttons/ActionButtons';
import apiService from '../../api/apiService';
import { API_ENDPOINTS } from '../../api/endpoints';
import Notiflix from 'notiflix';

const CashManagement = () => {
  const [activeFooterAction, setActiveFooterAction] = useState('all');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sCode: '',
    fCompCode: '',
  });

  const [openingCounts, setOpeningCounts] = useState({
    count1000: 0,
    count500: 0,
    count200: 0,
    count100: 0,
    count50: 0,
    count20: 0,
    count10: 0,
    count5: 0,
    count2: 0,
    count1: 0,
  });

  const [closingCounts, setClosingCounts] = useState({
    count1000: 0,
    count500: 0,
    count200: 0,
    count100: 0,
    count50: 0,
    count20: 0,
    count10: 0,
    count5: 0,
    count2: 0,
    count1: 0,
  });

  const denominations = [500, 200, 100, 50, 20, 10, 5, 2, 1];

  const calculateTotal = (counts) => {
    return denominations.reduce((total, denom) => {
      const countKey = `count${denom}`;
      return total + (Number(counts[countKey]) || 0) * denom;
    }, 0);
  };

  const handleOpeningChange = (denom, value) => {
    setOpeningCounts(prev => ({
      ...prev,
      [`count${denom}`]: value === '' ? '' : Number(value) || 0
    }));
  };

  const handleClosingChange = (denom, value) => {
    setClosingCounts(prev => ({
      ...prev,
      [`count${denom}`]: value === '' ? '' : Number(value) || 0
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveOpening = async () => {
    try {
      if (!formData.sCode || !formData.fCompCode) {
        Notiflix.Notify.warning('Please fill Store Code and Company Code');
        return;
      }
      
      const payload = {
        ...formData,
        ...openingCounts
      };
      console.log(JSON.stringify(payload));
      await apiService.post(API_ENDPOINTS.TENDER.opening, payload);
      Notiflix.Notify.success('Opening cash saved successfully!');
    } catch (error) {
      console.error('Error saving opening cash:', error);
      Notiflix.Notify.failure('Failed to save opening cash');
    }
  };

  const handleSaveClosing = async () => {
    try {
      if (!formData.sCode || !formData.fCompCode) {
        Notiflix.Notify.warning('Please fill Store Code and Company Code');
        return;
      }

      const payload = {
        ...formData,
        ...closingCounts
      };

      await apiService.post(API_ENDPOINTS.TENDER.closing, payload);
      Notiflix.Notify.success('Closing cash saved successfully!');
    } catch (error) {
      console.error('Error saving closing cash:', error);
      Notiflix.Notify.failure('Failed to save closing cash');
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all data?')) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        sCode: '',
        fCompCode: '',
      });
      setOpeningCounts({
        count500: 0,
        count200: 0,
        count100: 0,
        count50: 0,
        count20: 0,
        count10: 0,
        count5: 0,
        count2: 0,
        count1: 0,
      });
      setClosingCounts({
        count500: 0,
        count200: 0,
        count100: 0,
        count50: 0,
        count20: 0,
        count10: 0,
        count5: 0,
        count2: 0,
        count1: 0,
      });
      Notiflix.Notify.success('Cleared successfully!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const openingTotal = calculateTotal(openingCounts);
  const closingTotal = calculateTotal(closingCounts);
  const difference = closingTotal - openingTotal;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Cash Management - Opening & Closing</h1>
        <div className={styles.dateDisplay}>{new Date().toLocaleDateString('en-IN')}</div>
      </div>

      {/* Form Details */}
      <div className={styles.formSection}>
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={styles.inputField}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Store Code</label>
            <input
              type="text"
              value={formData.sCode}
              onChange={(e) => handleInputChange('sCode', e.target.value)}
              className={styles.inputField}
              placeholder="Enter store code"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Company Code</label>
            <input
              type="text"
              value={formData.fCompCode}
              onChange={(e) => handleInputChange('fCompCode', e.target.value)}
              className={styles.inputField}
              placeholder="Enter company code"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Denominations Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Denomination</th>
                <th className={styles.tableHeader}>Opening Count</th>
                <th className={styles.tableHeader}>Opening Amount</th>
                <th className={styles.tableHeader}>Closing Count</th>
                <th className={styles.tableHeader}>Closing Amount</th>
                <th className={styles.tableHeader}>Difference</th>
              </tr>
            </thead>
            <tbody>
              {denominations.map(denom => {
                const openingCount = Number(openingCounts[`count${denom}`]) || 0;
                const closingCount = Number(closingCounts[`count${denom}`]) || 0;
                const openingAmount = openingCount * denom;
                const closingAmount = closingCount * denom;
                const diff = closingAmount - openingAmount;

                return (
                  <tr key={denom} className={styles.tableRow}>
                    <td className={styles.tableCell}>₹ {denom}</td>
                    <td className={styles.tableCell}>
                      <input
                        type="number"
                        value={openingCounts[`count${denom}`] === 0 ? '' : openingCounts[`count${denom}`]}
                        onChange={(e) => handleOpeningChange(denom, e.target.value)}
                        className={styles.tableInput}
                        placeholder="0"
                        min="0"
                      />
                    </td>
                    <td className={styles.tableCell}>₹ {openingAmount.toFixed(2)}</td>
                    <td className={styles.tableCell}>
                      <input
                        type="number"
                        value={closingCounts[`count${denom}`] === 0 ? '' : closingCounts[`count${denom}`]}
                        onChange={(e) => handleClosingChange(denom, e.target.value)}
                        className={styles.tableInput}
                        placeholder="0"
                        min="0"
                      />
                    </td>
                    <td className={styles.tableCell}>₹ {closingAmount.toFixed(2)}</td>
                    <td className={`${styles.tableCell} ${diff !== 0 ? styles.highlight : ''}`}>
                      ₹ {diff.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className={styles.totalRow}>
                <td className={styles.totalCell}>Total</td>
                <td className={styles.totalCell}>
                  {Object.values(openingCounts).reduce((sum, val) => sum + (Number(val) || 0), 0)}
                </td>
                <td className={styles.totalCell}>₹ {openingTotal.toFixed(2)}</td>
                <td className={styles.totalCell}>
                  {Object.values(closingCounts).reduce((sum, val) => sum + (Number(val) || 0), 0)}
                </td>
                <td className={styles.totalCell}>₹ {closingTotal.toFixed(2)}</td>
                <td className={`${styles.totalCell} ${difference !== 0 ? styles.highlight : ''}`}>
                  ₹ {difference.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Action Buttons for Opening and Closing */}
        <div className={styles.actionSection}>
          <button onClick={handleSaveOpening} className={styles.saveButton}>
            Save Opening Cash
          </button>
          <button onClick={handleSaveClosing} className={styles.saveButton}>
            Save Closing Cash
          </button>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className={styles.footerButtons}>
        <ActionButtons1
          onClear={handleClear}
          onPrint={handlePrint}
          activeButton={activeFooterAction}
          onButtonClick={(type) => setActiveFooterAction(type)}
        />
      </div>
    </div>
  );
};

export default CashManagement;
