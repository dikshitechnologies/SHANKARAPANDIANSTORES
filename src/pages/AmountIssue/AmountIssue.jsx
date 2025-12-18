// AmountIssue.jsx
import React, { useState } from 'react';
import { SaveButton, ClearButton, DeleteButton } from '../../components/Buttons/ActionButtons';
import styles from './AmountIssue.module.css';

const AmountIssue = () => {
  const [formData, setFormData] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    type: '',
    expensesCategory: '',
    paymentToWhom: '',
    expensesDescription: '',
    expensesPaymode: 'UPI',
    expensesAmount: '',
    issuedAmount: '',
    paymentIssuedBy: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.expensesCategory.trim()) {
      newErrors.expensesCategory = 'Expenses category is required';
    }
    
    if (!formData.paymentToWhom.trim()) {
      newErrors.paymentToWhom = 'Payment recipient is required';
    }
    
    if (!formData.expensesAmount || parseFloat(formData.expensesAmount) <= 0) {
      newErrors.expensesAmount = 'Valid expense amount is required';
    }
    
    if (!formData.issuedAmount || parseFloat(formData.issuedAmount) <= 0) {
      newErrors.issuedAmount = 'Valid issued amount is required';
    }
    
    if (!formData.paymentIssuedBy.trim()) {
      newErrors.paymentIssuedBy = 'Issued by is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    console.log('Saving:', formData);
    
    // Simulate API call
    setTimeout(() => {
      alert('Record Saved Successfully!');
      // Reset form after successful save
      handleClear();
    }, 500);
  };

  const handleClear = () => {
    setFormData({
      expenseDate: new Date().toISOString().split('T')[0],
      type: '',
      expensesCategory: '',
      paymentToWhom: '',
      expensesDescription: '',
      expensesPaymode: 'UPI',
      expensesAmount: '',
      issuedAmount: '',
      paymentIssuedBy: ''
    });
    setErrors({});
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit? Unsaved changes will be lost.")) {
      console.log("Exiting...");
      // Add navigation logic here if needed
      window.history.back();
    }
  };

  const handleAddCategory = () => {
    const category = prompt("Enter new expenses category:");
    if (category) {
      setFormData(prev => ({ ...prev, expensesCategory: category }));
    }
  };

  const handleAddPayee = () => {
    const payee = prompt("Enter new payment recipient:");
    if (payee) {
      setFormData(prev => ({ ...prev, paymentToWhom: payee }));
    }
  };

  const handleAddType = () => {
    const type = prompt("Enter new type (Official/Personal):");
    if (type && ['Official', 'Personal'].includes(type)) {
      setFormData(prev => ({ ...prev, type }));
    } else if (type) {
      alert('Type must be either "Official" or "Personal"');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        {/* Header */}
  
        
        
        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.formGrid}>
            {/* Left Column */}
            <div className={styles.leftColumn}>
              {/* Expense Date */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Expense Date <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.expenseDate ? styles.error : ''}`}
                  required
                />
                {errors.expenseDate && <span className={styles.errorText}>{errors.expenseDate}</span>}
              </div>

              {/* Type */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Type <span className={styles.required}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.type ? styles.error : ''}`}
                    style={{ flex: 1 }}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Official">Official</option>
                    <option value="Personal">Personal</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddType}
                    style={{
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      transition: 'transform 0.2s ease',
                      minWidth: '44px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    +
                  </button>
                </div>
                {errors.type && <span className={styles.errorText}>{errors.type}</span>}
              </div>

              {/* Expenses Category */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Expenses Category <span className={styles.required}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    name="expensesCategory"
                    value={formData.expensesCategory}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.expensesCategory ? styles.error : ''}`}
                    // placeholder="Enter expenses category"
                    style={{ flex: 1 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    style={{
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      transition: 'transform 0.2s ease',
                      minWidth: '44px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    +
                  </button>
                </div>
                {errors.expensesCategory && <span className={styles.errorText}>{errors.expensesCategory}</span>}
              </div>

              {/* Payment To Whom */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Payment To Whom <span className={styles.required}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    name="paymentToWhom"
                    value={formData.paymentToWhom}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.paymentToWhom ? styles.error : ''}`}
                    // placeholder="Enter recipient name"
                    style={{ flex: 1 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAddPayee}
                    style={{
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      transition: 'transform 0.2s ease',
                      minWidth: '44px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    +
                  </button>
                </div>
                {errors.paymentToWhom && <span className={styles.errorText}>{errors.paymentToWhom}</span>}
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.rightColumn}>
              {/* Expenses Description */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Expenses Description</label>
                <textarea
                  name="expensesDescription"
                  value={formData.expensesDescription}
                  onChange={handleChange}
                  className={styles.textarea}
                  // placeholder="Enter detailed description of expenses"
                  rows={4}
                />
              </div>

              {/* Expenses Paymode */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Expenses Paymode <span className={styles.required}>*</span>
                </label>
                <select
                  name="expensesPaymode"
                  value={formData.expensesPaymode}
                  onChange={handleChange}
                  className={styles.input}
                  required
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </div>

              {/* Expenses Amount */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Expenses Amount (₹) <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="expensesAmount"
                  value={formData.expensesAmount}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.expensesAmount ? styles.error : ''}`}
                  // placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                {errors.expensesAmount && <span className={styles.errorText}>{errors.expensesAmount}</span>}
              </div>

              {/* Issued Amount */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Issued Amount (₹) <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="issuedAmount"
                  value={formData.issuedAmount}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.issuedAmount ? styles.error : ''}`}
                  // placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                {errors.issuedAmount && <span className={styles.errorText}>{errors.issuedAmount}</span>}
              </div>

              {/* Payment Issued By */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Payment Issued By <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="paymentIssuedBy"
                  value={formData.paymentIssuedBy}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.paymentIssuedBy ? styles.error : ''}`}
                  // placeholder="Enter issuer name"
                  required
                />
                {errors.paymentIssuedBy && <span className={styles.errorText}>{errors.paymentIssuedBy}</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <SaveButton onClick={handleSave} />
            <ClearButton onClick={handleClear} />
            <DeleteButton onClick={handleExit} label="Exit" variant="outline" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmountIssue;