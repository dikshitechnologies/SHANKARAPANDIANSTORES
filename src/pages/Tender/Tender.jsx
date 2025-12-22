import React, { useState, useMemo } from 'react';
import styles from './Tender.module.css';
import { ActionButtons1 } from '../../components/Buttons/ActionButtons';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';

const Tender = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.TENDER),
    edit: hasModifyPermission(PERMISSION_CODES.TENDER),
    delete: hasDeletePermission(PERMISSION_CODES.TENDER)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

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
    grossAmt: '3070',
    itemDAmt: '9026737634',
    billAmount: '3070',
    billDiscountPercent: '',
    billDiscAmt: '',
    granTotal: '',
    roudOff: '',
    scrapAmount: '',
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

  const handleSave = () => {
    if (!formPermissions.edit) {
      alert('You do not have permission to save');
      return;
    }
    console.log('Saved:', { formData, denominations });
    alert('Saved successfully!');
  };

  const handleDelete = () => {
    if (!formPermissions.delete) {
      alert('You do not have permission to delete');
      return;
    }
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
    if (!formPermissions.delete) {
      alert('You do not have permission to clear');
      return;
    }
    if (window.confirm('Are you sure you want to clear all data?')) {
      setFormData({
        grossAmt: '',
        itemDAmt: '',
        billAmount: '',
        billDiscountPercent: '',
        billDiscAmt: '',
        granTotal: '',
        roudOff: '',
        scrapAmount: '',
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
      console.log('Cleared successfully!');
    }
  };

  const calculateBalance = () => {
    // Calculate totals from denominations
    let totalCollect = 0;
    let totalIssue = 0;
    
    Object.entries(denominations).forEach(([denom, data]) => {
      totalCollect += (Number(data.collect) || 0) * Number(denom);
      totalIssue += (Number(data.issue) || 0) * Number(denom);
    });
    
    const received = totalCollect || 0;
    const issued = totalIssue || 0;
    const netAmount = Number(formData.netAmount) || 0;
    const balance = received - issued - netAmount;
    
    handleInputChange('receivedCash', received);
    handleInputChange('balance', balance);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Tender Screen</h1>
          <div className={styles.invoiceInfo}>
            <span className={styles.invoiceNo}>RS/INV/25-26/1113/024</span>
            <span className={styles.refNo}>RS9626737634</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.company}>DHARANI</span>
          <span className={styles.date}>13-Nov-2025</span>
        </div>
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

          {/* Scrap Amount & Sales Return Row */}
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Scrap Amount</label>
              <div className={styles.inputContainer}>
                <input
                  type="number"
                  value={formData.scrapAmount}
                  onChange={(e) => handleInputChange('scrapAmount', e.target.value)}
                  className={styles.inputField}
                  placeholder="0"
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
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "0",
        padding: "8px 16px",
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e5e7eb",
        position: "fixed",
        bottom: "0",
        width: "100%",
        boxShadow: "0 -1px 3px rgba(0,0,0,0.08)",
        flexShrink: 0,
        zIndex: 100
      }}>
        <ActionButtons1
          onClear={handleClear}
          onSave={handleSave}
          onPrint={handlePrint}
          activeButton={activeFooterAction}
          onButtonClick={(type) => setActiveFooterAction(type)}
        />
      </div>
    </div>
  );
};

export default Tender;