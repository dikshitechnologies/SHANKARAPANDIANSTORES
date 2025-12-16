import React, { useState, useEffect } from 'react';
import styles from './TenderModal.module.css';
import axiosInstance from '../../api/axiosInstance';
import { ActionButtons1 } from '../Buttons/ActionButtons';
import { API_ENDPOINTS } from '../../api/endpoints';

const TenderModal = ({ isOpen, onClose, billData }) => {
  const [activeFooterAction, setActiveFooterAction] = useState('all');
  const [denominations, setDenominations] = useState({
    500: { available: 0, collect: '', issue: '', closing: 0 },
    200: { available: 4, collect: '', issue: '', closing: 4 },
    100: { available: 116, collect: '', issue: '', closing: 116 },
    50: { available: 3, collect: '', issue: '', closing: 3 },
    20: { available: 2, collect: '', issue: '', closing: 2 },
    10: { available: 0, collect: '', issue: '', closing: 0 },
    5: { available: 0, collect: '', issue: '', closing: 0 },
    2: { available: 9, collect: '', issue: '', closing: 9 },
    1: { available: 6, collect: '', issue: '', closing: 6 },
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
    issuedCash: '12614',
    upi: '[ICICI-M-UPI]',
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
    }
  }, [billData, isOpen]);

  const handleDenominationChange = (denom, field, value) => {
    const updated = { ...denominations };
    updated[denom] = { ...updated[denom], [field]: value };
    
    const collect = Number(updated[denom].collect) || 0;
    const issue = Number(updated[denom].issue) || 0;
    updated[denom].closing = updated[denom].available + collect - issue;
    
    setDenominations(updated);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                      type="number"
                      value={formData.billDiscountPercent}
                      onChange={(e) => handleInputChange('billDiscountPercent', e.target.value)}
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
                      onChange={(e) => handleInputChange('billDiscAmt', e.target.value)}
                      className={styles.inputField}
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
                      onChange={(e) => handleInputChange('granTotal', e.target.value)}
                      className={styles.inputField}
                    />
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Round Off</label>
                  <div className={styles.inputContainer}>
                    <input
                      type="number"
                      value={formData.roudOff}
                      onChange={(e) => handleInputChange('roudOff', e.target.value)}
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
                      type="text"
                      value={formData.scrapAmountBillNo}
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
                      type="text"
                      value={formData.salesReturnBillNo}
                      onChange={handleSalesReturnBillNoChange}
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
                      onChange={(e) => handleInputChange('netAmount', e.target.value)}
                      className={`${styles.inputField} ${styles.netAmountField}`}
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes Row */}
              <div className={styles.checkboxRow}>
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
              </div>

              {/* F8-Delete Note */}
              <div className={styles.f8Note}>
                F8-Delete
              </div>
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
                          type="number"
                          value={denominations[denom].collect}
                          onChange={(e) => handleDenominationChange(denom, 'collect', e.target.value)}
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
                          onChange={(e) => handleDenominationChange(denom, 'issue', e.target.value)}
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

                <div className={styles.paymentRow} style={{ gap: '12px' }}>
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
                </div>

                {/* Right Side Checkboxes */}
                <div className={styles.rightCheckboxRow}>
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
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className={styles.footer}>
            <ActionButtons1
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
