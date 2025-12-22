import React, { useState, useEffect, useRef } from 'react';
import styles from './TenderModal.module.css';
import apiService from '../../api/apiService';
import { ActionButtons1 } from '../Buttons/ActionButtons';
import { API_ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const TenderModal = ({ isOpen, onClose, billData }) => {
  const { userData } = useAuth() || {};
  const [activeFooterAction, setActiveFooterAction] = useState('all');
  const collectFieldRefs = useRef({});
  const saveButtonRef = useRef(null);
  const billDiscountPercentRef = useRef(null);
  const roundOffRef = useRef(null);
  const scrapBillNoRef = useRef(null);
  const salesReturnBillNoRef = useRef(null);
  const [denominations, setDenominations] = useState({
    500: { available: 0, collect: '', issue: '', closing: 0 },
    200: { available: 0, collect: '', issue: '', closing: 0 },
    100: { available: 0, collect: '', issue: '', closing: 0 },
    50: { available: 0, collect: '', issue: '', closing: 0 },
    20: { available: 0, collect: '', issue: '', closing: 0 },
    10: { available: 0, collect: '', issue: '', closing: 0 },
    5: { available: 0, collect: '', issue: '', closing: 0 },
    2: { available: 0, collect: '', issue: '', closing: 0 },
    1: { available: 0, collect: '', issue: '', closing: 0 },
  });

  const [formData, setFormData] = useState({
    billNo: '',
    salesman: '',
    date: '',
    grossAmt: '',
    itemDAmt: '',
    billAmount: '',
    billDiscountPercent: '',
    billDiscAmt: '',
    granTotal: '',
    roudOff: '',
    scrapAmountBillNo: '',
    scrapAmount: '',
    salesReturnBillNo: '',
    salesReturn: '',
    netAmount: '',
    receivedCash: '',
    issuedCash: '',
    upi: '',
    card: '',
    balance: '',
    isServiceCharge: false,
    isCreditBill: false,
    delivery: false,
  });

  // Update form data when billData changes
  useEffect(() => {
    if (billData && isOpen) {
      setFormData(prev => ({
        ...prev,
        billNo: billData.billNo || '',
        salesman: billData.salesman || '',
        date: billData.date ? new Date(billData.date).toLocaleDateString('en-IN') : '',
        grossAmt: billData.amount ? billData.amount.toString() : '',
        billAmount: billData.amount ? billData.amount.toString() : '',
      }));
      // Fetch live drawer data when modal opens
      fetchLiveDrawer();
    }
  }, [billData, isOpen, userData?.companyCode]);

  // Auto-focus on billDiscountPercent field when modal opens
  useEffect(() => {
    if (isOpen && billDiscountPercentRef.current) {
      setTimeout(() => {
        billDiscountPercentRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  // Fetch live drawer available from API
  const fetchLiveDrawer = async () => {
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const companyCode = userData?.companyCode || '001';
      
      console.log('Fetching live drawer with:', { dateStr, companyCode });
      
      const endpoint = API_ENDPOINTS.BILLCOLLECTOR.GET_LIVE_DRAWER(dateStr, companyCode);
      const response = await apiService.get(endpoint);
      
      console.log('Live drawer API response:', response);
      
      if (response) {
        // apiService.get returns the data directly
        const data = response.data || response;
        console.log('Parsed data:', data);
        
        // Map API response keys (r500, r200, etc.) to denominations
        setDenominations(prev => ({
          500: { ...prev[500], available: data.r500 || 0, closing: data.r500 || 0 },
          200: { ...prev[200], available: data.r200 || 0, closing: data.r200 || 0 },
          100: { ...prev[100], available: data.r100 || 0, closing: data.r100 || 0 },
          50: { ...prev[50], available: data.r50 || 0, closing: data.r50 || 0 },
          20: { ...prev[20], available: data.r20 || 0, closing: data.r20 || 0 },
          10: { ...prev[10], available: data.r10 || 0, closing: data.r10 || 0 },
          5: { ...prev[5], available: data.r5 || 0, closing: data.r5 || 0 },
          2: { ...prev[2], available: data.r2 || 0, closing: data.r2 || 0 },
          1: { ...prev[1], available: data.r1 || 0, closing: data.r1 || 0 },
        }));
        console.log('Live drawer data loaded successfully');
      }
    } catch (err) {
      console.error('Error fetching live drawer:', err);
    }
  };

  // Function to calculate optimal issue denominations for a given amount
  const calculateOptimalDenominations = (amount) => {
    const denomList = [500, 200, 100, 50, 20, 10, 5, 2, 1];
    const result = {};
    
    // Initialize all denominations to 0
    denomList.forEach(d => result[d] = 0);
    
    let remaining = amount;
    
    // Greedy algorithm: use largest denominations first
    // BUT only use denominations that have available quantity
    for (let denom of denomList) {
      const available = denominations[denom]?.available || 0;
      
      // Skip denominations with 0 available
      if (available <= 0) {
        continue;
      }
      
      if (remaining >= denom) {
        // Use minimum of: calculated needed amount or available quantity
        const needed = Math.floor(remaining / denom);
        const canUse = Math.min(needed, available);
        result[denom] = canUse;
        remaining = remaining - (canUse * denom);
      }
    }
    
    return result;
  };

  const handleDenominationChange = (denom, field, value) => {
    const updated = { ...denominations };
    updated[denom] = { ...updated[denom], [field]: value };
    
    const collect = Number(updated[denom].collect) || 0;
    const issue = Number(updated[denom].issue) || 0;
    updated[denom].closing = updated[denom].available + collect - issue;
    
    // If collect field is being updated, calculate balance and auto-fill issue
    if (field === 'collect') {
      // Calculate total collected amount from all denominations
      let totalCollected = 0;
      [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
        const collectValue = d === denom ? Number(value) || 0 : Number(updated[d].collect) || 0;
        totalCollected += collectValue * d;
      });
      
      // Calculate balance
      const netAmount = Number(formData.netAmount) || 0;
      const balance = totalCollected - netAmount;
      
      // Update form data balance and issued cash
      setFormData(prev => ({
        ...prev,
        receivedCash: totalCollected.toString(),
        balance: balance.toString(),
        issuedCash: balance > 0 ? balance.toString() : ''
      }));
      
      // If balance is positive, auto-calculate and fill issue row
      if (balance > 0) {
        const optimalIssue = calculateOptimalDenominations(balance);
        [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
          updated[d] = { ...updated[d], issue: optimalIssue[d].toString() };
          // Recalculate closing for each denomination
          const col = Number(updated[d].collect) || 0;
          const iss = optimalIssue[d];
          updated[d].closing = updated[d].available + col - iss;
        });
      }
    }
    
    setDenominations(updated);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Calculate Bill Discount Amount when discount % is entered
      if (field === 'billDiscountPercent') {
        const billAmount = Number(prev.billAmount) || 0;
        const discountPercent = Number(value) || 0;
        const discountAmount = (billAmount * discountPercent) / 100;
        updated.billDiscAmt = discountAmount.toFixed(2);
      }

      // Calculate Grand Total when discount amount is updated
      if (field === 'billDiscAmt') {
        const billAmount = Number(prev.billAmount) || 0;
        const discountAmount = Number(value) || 0;
        const grandTotal = billAmount - discountAmount;
        updated.granTotal = grandTotal.toFixed(2);
      }

      // Calculate Grand Total when discount percent is updated (for Enter key)
      if (field === 'billDiscountPercent') {
        const billAmount = Number(prev.billAmount) || 0;
        const discountPercent = Number(value) || 0;
        const discountAmount = (billAmount * discountPercent) / 100;
        const grandTotal = billAmount - discountAmount;
        updated.granTotal = grandTotal.toFixed(2);
        
        // Also recalculate Net Amount when Grand Total changes
        const roundOff = Number(prev.roudOff) || 0;
        const scrapAmount = Number(prev.scrapAmount) || 0;
        const salesReturn = Number(prev.salesReturn) || 0;
        const netAmount = (grandTotal + roundOff) - scrapAmount - salesReturn;
        updated.netAmount = netAmount.toFixed(2);
      }

      // Calculate Net Amount when round off is entered
      if (field === 'roudOff') {
        const grandTotal = Number(prev.granTotal) || 0;
        const roundOff = Number(value) || 0;
        const scrapAmount = Number(prev.scrapAmount) || 0;
        const salesReturn = Number(prev.salesReturn) || 0;
        const netAmount = (grandTotal + roundOff) - scrapAmount - salesReturn;
        updated.netAmount = netAmount.toFixed(2);
      }

      // Recalculate Net Amount when Scrap Amount changes
      if (field === 'scrapAmount') {
        const grandTotal = Number(prev.granTotal) || 0;
        const roundOff = Number(prev.roudOff) || 0;
        const scrapAmount = Number(value) || 0;
        const salesReturn = Number(prev.salesReturn) || 0;
        const netAmount = (grandTotal + roundOff) - scrapAmount - salesReturn;
        updated.netAmount = netAmount.toFixed(2);
      }

      // Recalculate Net Amount when Sales Return changes
      if (field === 'salesReturn') {
        const grandTotal = Number(prev.granTotal) || 0;
        const roundOff = Number(prev.roudOff) || 0;
        const scrapAmount = Number(prev.scrapAmount) || 0;
        const salesReturn = Number(value) || 0;
        const netAmount = (grandTotal + roundOff) - scrapAmount - salesReturn;
        updated.netAmount = netAmount.toFixed(2);
      }

      return updated;
    });
  };

  // Handle keydown in collect fields for navigation
  const handleCollectFieldKeyDown = (e, currentDenom) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const denomSequence = [500, 200, 100, 50, 20, 10, 5, 2, 1];
      const currentIndex = denomSequence.indexOf(currentDenom);
      
      if (currentIndex < denomSequence.length - 1) {
        // Move to next denomination field
        const nextDenom = denomSequence[currentIndex + 1];
        if (collectFieldRefs.current[nextDenom]) {
          collectFieldRefs.current[nextDenom].focus();
        }
      } else if (currentIndex === denomSequence.length - 1) {
        // Last field (1), move to Save button
        if (saveButtonRef.current) {
          saveButtonRef.current.focus();
        }
      }
    }
  };

  // Handle keydown for form fields navigation
  const handleFormFieldKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  // Handle keydown for salesReturnBillNo field - move to collect 500 field
  const handleSalesReturnBillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (collectFieldRefs.current[500]) {
        collectFieldRefs.current[500].focus();
      }
    }
  };

  const fetchBillAmount = async (billNo, fieldType) => {
    if (!billNo.trim()) return;
    
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.SALESRETURN.GET_SALESRETURN_TENDER(billNo)
      );
      
      const data = response.data;
      console.log('Fetched bill amount data:', data);
      
      if (data && data.fBillAmt) {
        if (fieldType === 'scrap') {
          handleInputChange('scrapAmount', data.fBillAmt.toString());
        } else if (fieldType === 'salesReturn') {
          handleInputChange('salesReturn', data.fBillAmt.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching bill amount:', error);
     
    }
  };

  const handleScrapBillNoChange = (e) => {
    const value = e.target.value;
    handleInputChange('scrapAmountBillNo', value);
    
    // Clear amount if bill number is empty
    if (!value.trim()) {
      handleInputChange('scrapAmount', '');
    } else if (value.length > 2) {
      // Fetch amount when user finishes typing (on blur would be better, but this triggers on change)
      fetchBillAmount(value, 'scrap');
    }
  };

  const handleSalesReturnBillNoChange = (e) => {
    const value = e.target.value;
    handleInputChange('salesReturnBillNo', value);
    
    // Clear amount if bill number is empty
    if (!value.trim()) {
      handleInputChange('salesReturn', '');
    } else if (value.length > 2) {
      // Fetch amount when user finishes typing
      fetchBillAmount(value, 'salesReturn');
    }
  };

  const handleSave = () => {
    console.log('Saved:', { formData, denominations });
    alert('✓ Tender details saved successfully!');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete?')) {
      console.log('Deleted');
      alert('Deleted successfully!');
    }
  };

  const handlePrint = () => {
    console.log('Printing...');
    window.print();
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all data?')) {
      setFormData({
        billNo: billData?.billNo || '',
        salesman: billData?.salesman || '',
        date: billData?.date ? new Date(billData.date).toLocaleDateString('en-IN') : '',
        grossAmt: billData?.amount ? billData.amount.toString() : '',
        itemDAmt: '',
        billAmount: billData?.amount ? billData.amount.toString() : '',
        billDiscountPercent: '',
        billDiscAmt: '',
        granTotal: '',
        roudOff: '',
        scrapAmountBillNo: '',
        scrapAmount: '',
        salesReturnBillNo: '',
        salesReturn: '',
        netAmount: '',
        receivedCash: '',
        issuedCash: '12614',
        upi: '[ICICI-M-UPI]',
        card: '',
        balance: '',
        isServiceCharge: false,
        isCreditBill: false,
        delivery: false,
      });
      console.log('Cleared successfully!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Tender Screen</h1>
              <div className={styles.invoiceInfo}>
                <span className={styles.invoiceNo}>{formData.billNo}</span>
                <span className={styles.refNo}>{formData.itemDAmt}</span>
              </div>
            </div>
            <div className={styles.headerRight}>
              <span className={styles.company}>{formData.salesman}</span>
              <span className={styles.date}>{formData.date}</span>
            </div>
            <button className={styles.closeButton} onClick={onClose}>✕</button>
          </div>

          <div className={styles.mainContent}>
            {/* Left Section - Top Details */}
            <div className={styles.leftSection}>
              {/* First Row */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Gross Amt.</label>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      value={formData.grossAmt}
                      readOnly
                      className={`${styles.inputField} ${styles.readonlyField}`}
                    />
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Item D.Amt.</label>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      value={formData.itemDAmt}
                      readOnly
                      className={`${styles.inputField} ${styles.readonlyField}`}
                    />
                  </div>
                </div>
              </div>

              {/* Bill Amount Row */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Bill Amount</label>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      value={formData.billAmount}
                      readOnly
                      className={`${styles.inputField} ${styles.billAmountField}`}
                    />
                  </div>
                </div>
              </div>

              {/* Bill Discount Row */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Bill Discount %</label>
                  <div className={styles.inputContainer}>
                    <input
                      ref={billDiscountPercentRef}
                      type="number"
                      value={formData.billDiscountPercent}
                      onChange={(e) => handleInputChange('billDiscountPercent', e.target.value)}
                      onKeyDown={(e) => handleFormFieldKeyDown(e, roundOffRef)}
                      className={styles.inputField}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Bill Disc.Amt</label>
                  <div className={styles.inputContainer}>
                    <input
                      type="number"
                      value={formData.billDiscAmt}
                      readOnly
                      className={`${styles.inputField} ${styles.readonlyField}`}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Grand Total & Round Off Row */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Grand Total</label>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      value={formData.granTotal}
                      readOnly
                      className={`${styles.inputField} ${styles.readonlyField}`}
                    />
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Round Off</label>
                  <div className={styles.inputContainer}>
                    <input
                      ref={roundOffRef}
                      type="number"
                      value={formData.roudOff}
                      onChange={(e) => handleInputChange('roudOff', e.target.value)}
                      onKeyDown={(e) => handleFormFieldKeyDown(e, scrapBillNoRef)}
                      className={styles.inputField}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Scrap Amount Row */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Scrap Bill No</label>
                  <div className={styles.inputContainer}>
                    <input
                      ref={scrapBillNoRef}
                      type="text"
                      value={formData.scrapAmountBillNo}
                      onChange={(e) => handleInputChange('scrapAmountBillNo', e.target.value)}
                      onKeyDown={(e) => handleFormFieldKeyDown(e, salesReturnBillNoRef)}
                      onChange={handleScrapBillNoChange}
                      className={styles.inputField}
                      placeholder="Bill No"
                    />
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Scrap Amount</label>
                  <div className={styles.inputContainer}>
                    <input
                      type="number"
                      value={formData.scrapAmount}
                      onChange={(e) => handleInputChange('scrapAmount', e.target.value)}
                      className={styles.inputField}
                      placeholder="0"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Sales Return Row */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Sales Return Bill No</label>
                  <div className={styles.inputContainer}>
                    <input
                      ref={salesReturnBillNoRef}
                      type="text"
                      value={formData.salesReturnBillNo}
                      onChange={handleSalesReturnBillNoChange}
                      onKeyDown={handleSalesReturnBillKeyDown}
                      className={styles.inputField}
                      placeholder="Bill No"
                    />
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Sales Return</label>
                  <div className={styles.inputContainer}>
                    <input
                      type="number"
                      value={formData.salesReturn}
                      onChange={(e) => handleInputChange('salesReturn', e.target.value)}
                      className={styles.inputField}
                      placeholder="0"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Net Amount Row */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Net Amount</label>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      value={formData.netAmount}
                      readOnly
                      className={`${styles.inputField} ${styles.netAmountField}`}
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes Row */}
              {/* <div className={styles.checkboxRow}>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.isServiceCharge}
                      onChange={(e) => handleInputChange('isServiceCharge', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>Service</span>
                  </label>
                </div>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.delivery}
                      onChange={(e) => handleInputChange('delivery', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>Delivery</span>
                  </label>
                </div>
              </div> */}

              {/* F8-Delete Note */}
              {/* <div className={styles.f8Note}>
                F8-Delete
              </div> */}
            </div>

            {/* Right Section - Bottom Details */}
            <div className={styles.rightSection}>
              {/* Top: Denominations Table */}
              <div className={styles.tableContainer}>
                <div className={styles.table}>
                  {/* Header Row */}
                  <div className={styles.tableHeaderRow}>
                    <div className={styles.tableHeaderCell}>Particulars</div>
                    <div className={styles.tableHeaderCell}>500</div>
                    <div className={styles.tableHeaderCell}>200</div>
                    <div className={styles.tableHeaderCell}>100</div>
                    <div className={styles.tableHeaderCell}>50</div>
                    <div className={styles.tableHeaderCell}>20</div>
                    <div className={styles.tableHeaderCell}>10</div>
                    <div className={styles.tableHeaderCell}>5</div>
                    <div className={styles.tableHeaderCell}>2</div>
                    <div className={styles.tableHeaderCell}>1</div>
                  </div>

                  {/* Available Row */}
                  <div className={styles.tableRow}>
                    <div className={styles.tableLabelCell}>Available</div>
                    <div className={styles.tableCell}>{denominations[500].available}</div>
                    <div className={styles.tableCell}>{denominations[200].available}</div>
                    <div className={styles.tableCell}>{denominations[100].available}</div>
                    <div className={styles.tableCell}>{denominations[50].available}</div>
                    <div className={styles.tableCell}>{denominations[20].available}</div>
                    <div className={styles.tableCell}>{denominations[10].available}</div>
                    <div className={styles.tableCell}>{denominations[5].available}</div>
                    <div className={styles.tableCell}>{denominations[2].available}</div>
                    <div className={styles.tableCell}>{denominations[1].available}</div>
                  </div>

                  {/* Collect Row */}
                  <div className={styles.tableRow}>
                    <div className={styles.tableLabelCell}>Collect</div>
                    {[500, 200, 100, 50, 20, 10, 5, 2, 1].map(denom => (
                      <div key={denom} className={styles.tableCell}>
                        <input
                          ref={(el) => (collectFieldRefs.current[denom] = el)}
                          type="number"
                          value={denominations[denom].collect}
                          onChange={(e) => handleDenominationChange(denom, 'collect', e.target.value)}
                          onKeyDown={(e) => handleCollectFieldKeyDown(e, denom)}
                          className={styles.tableInput}
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Issue Row */}
                  <div className={styles.tableRow}>
                    <div className={styles.tableLabelCell}>Issue</div>
                    {[500, 200, 100, 50, 20, 10, 5, 2, 1].map(denom => (
                      <div key={denom} className={styles.tableCell}>
                        <input
                          type="number"
                          value={denominations[denom].issue}
                          readOnly
                          className={styles.tableInput}
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Closing Row */}
                  <div className={styles.tableRow}>
                    <div className={styles.tableLabelCell}>Closing</div>
                    <div className={styles.tableCell}>{denominations[500].closing}</div>
                    <div className={styles.tableCell}>{denominations[200].closing}</div>
                    <div className={styles.tableCell}>{denominations[100].closing}</div>
                    <div className={styles.tableCell}>{denominations[50].closing}</div>
                    <div className={styles.tableCell}>{denominations[20].closing}</div>
                    <div className={styles.tableCell}>{denominations[10].closing}</div>
                    <div className={styles.tableCell}>{denominations[5].closing}</div>
                    <div className={styles.tableCell}>{denominations[2].closing}</div>
                    <div className={styles.tableCell}>{denominations[1].closing}</div>
                  </div>
                </div>
              </div>

              {/* Bottom: Payment Details */}
              <div className={styles.paymentSection}>
                <div className={styles.paymentRow}>
                  <div className={styles.paymentGroup} style={{ maxWidth: '150px' }}>
                    <label className={styles.paymentLabel}>Received Cash</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        type="number"
                        value={formData.receivedCash}
                        onChange={(e) => handleInputChange('receivedCash', e.target.value)}
                        className={styles.paymentInput}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.paymentGroup} style={{ maxWidth: '150px' }}>
                    <label className={styles.paymentLabel}>Issued Cash</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        type="text"
                        value={formData.issuedCash}
                        readOnly
                        className={`${styles.paymentInput} ${styles.readonlyPayment}`}
                      />
                    </div>
                  </div>

                  <div className={styles.paymentGroup} style={{ maxWidth: '150px' }}>
                    <label className={styles.paymentLabel}>UPI</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        type="text"
                        value={formData.upi}
                        onChange={(e) => handleInputChange('upi', e.target.value)}
                        className={styles.paymentInput}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.paymentGroup} style={{ maxWidth: '150px' }}>
                    <label className={styles.paymentLabel}>Card</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        type="number"
                        value={formData.card}
                        onChange={(e) => handleInputChange('card', e.target.value)}
                        className={styles.paymentInput}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* <div className={styles.paymentRow} style={{ gap: '12px' }}>
                  <div className={styles.paymentGroup} style={{ maxWidth: '150px' }}>
                    <label className={styles.paymentLabel}>Balance</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        type="text"
                        value={formData.balance}
                        readOnly
                        className={`${styles.paymentInput} ${styles.balanceField}`}
                      />
                    </div>
                  </div>
                </div> */}

                {/* Right Side Checkboxes */}
                {/* <div className={styles.rightCheckboxRow}>
                  <div className={styles.rightCheckboxGroup}>
                    <label className={styles.rightCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isServiceCharge}
                        onChange={(e) => handleInputChange('isServiceCharge', e.target.checked)}
                        className={styles.rightCheckbox}
                      />
                      <span>Is Service Charge</span>
                      {formData.isServiceCharge && (
                        <input
                          type="number"
                          value={formData.isServiceCharge}
                          onChange={(e) => handleInputChange('isServiceCharge', e.target.value)}
                          className={styles.serviceAmountInput}
                          placeholder="0"
                        />
                      )}
                    </label>
                  </div>
                  
                  <div className={styles.rightCheckboxGroup}>
                    <label className={styles.rightCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isCreditBill}
                        onChange={(e) => handleInputChange('isCreditBill', e.target.checked)}
                        className={styles.rightCheckbox}
                      />
                      <span>Is Credit Bill</span>
                    </label>
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className={styles.footer}>
            <ActionButtons1
              ref={saveButtonRef}
              onClear={handleClear}
              onSave={handleSave}
              onPrint={handlePrint}
              activeButton={activeFooterAction}
              onButtonClick={(type) => setActiveFooterAction(type)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderModal;
