import React, { useRef, useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import { API_ENDPOINTS } from '../../api/endpoints';
import ConfirmationPopup from '../ConfirmationPopup/ConfirmationPopup';
import { useAuth } from '../../context/AuthContext';
import styles from './SaveConfirmationModal.module.css';

const SaveConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Save",
  particulars = {
    500: { available: 0, collect: '', issue: '', closing: 0 },
    200: { available: 0, collect: '', issue: '', closing: 0 },
    100: { available: 0, collect: '', issue: '', closing: 0 },
    50: { available: 0, collect: '', issue: '', closing: 0 },
    20: { available: 0, collect: '', issue: '', closing: 0 },
    10: { available: 0, collect: '', issue: '', closing: 0 },
    5: { available: 0, collect: '', issue: '', closing: 0 },
    2: { available: 0, collect: '', issue: '', closing: 0 },
    1: { available: 0, collect: '', issue: '', closing: 0 }
  },
  loading = false,
  voucherNo = "",
  voucherDate = "",
  totalAmount = 0,
  cashTotals = null,
  hasCashPayments = false,
  Type = ""
}) => {
  console.log('🔴 SaveConfirmationModal Props Received:', {
    isOpen,
    hasCashPayments,
    cashTotals,
    totalAmount,
    voucherNo,
    voucherDate
  });
  const { userData } = useAuth() || {};
  const confirmRef = useRef(null);
  const [denominations, setDenominations] = useState(particulars);
  const fieldRefs = useRef({});
  const collectFieldRefs = useRef({});
  const [liveAvailable, setLiveAvailable] = useState({
    500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 
    10: 0, 5: 0, 2: 0, 1: 0
  });
  const [saveConfirmationOpen, setSaveConfirmationOpen] = useState(false);
  const [saveConfirmationLoading, setSaveConfirmationLoading] = useState(false);
  const pyIssueRefs = useRef({});
const pyCollectRefs = useRef({});

  const [formData, setFormData] = useState({
    receivedCash: '',
    issuedCash: '',
    upi: '',
    card: '',
    balance: '',
    isServiceCharge: false,
    isCreditBill: false,
  });

  // Function to calculate optimal issue denominations for a given amount
  const calculateOptimalDenominations = (amount) => {
    const denomList = [500, 200, 100, 50, 20, 10, 5, 2, 1];
    const result = {};
    
    // Initialize all denominations to 0
    denomList.forEach(d => result[d] = 0);
    
    let remaining = amount;
    
    // Greedy algorithm: use largest denominations first
    for (let denom of denomList) {
      if (remaining >= denom) {
        result[denom] = Math.floor(remaining / denom);
        remaining = remaining % denom;
      }
    }
    
    return result;
  };

  // Fetch live cash available from API
  const fetchLiveCash = async () => {
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const companyCode = userData?.companyCode || '001';
      
      console.log('Fetching live drawer with:', { dateStr, companyCode });
      
      const endpoint = API_ENDPOINTS.BILLCOLLECTOR.GET_LIVE_DRAWER(dateStr, companyCode);
      const response = await apiService.get(endpoint);
      
      console.log('Live drawer API response:', response);
      
      if (response) {
        const data = response.data || response;
        console.log('Parsed data:', data);
        
        // Map API response keys (r500, r200, etc.) to denominations
        setLiveAvailable({
          500: data.r500 || 0,
          200: data.r200 || 0,
          100: data.r100 || 0,
          50: data.r50 || 0,
          20: data.r20 || 0,
          10: data.r10 || 0,
          5: data.r5 || 0,
          2: data.r2 || 0,
          1: data.r1 || 0
        });
        console.log('Live drawer data loaded successfully');
      }
    } catch (err) {
      console.error('Error fetching live drawer:', err);
    }
  };

  const handleDenominationChange = (denom, field, value) => {
    const updated = { ...denominations };
    updated[denom] = { ...updated[denom], [field]: value };
    
    const collect = Number(updated[denom].collect) || 0;
    const issue = Number(updated[denom].issue) || 0;
    // Use liveAvailable if available, otherwise use denominations available
    const available = liveAvailable[denom] !== 0 && liveAvailable[denom] ? liveAvailable[denom] : updated[denom].available;
    updated[denom].closing = available + collect - issue;
    
    // If collect field is being updated, calculate balance and auto-fill issue
 if (Type !== "PY" && field === 'collect') {
      // Calculate total collected amount from all denominations
      let totalCollected = 0;
      [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
        const collectValue = d === denom ? Number(value) || 0 : Number(updated[d].collect) || 0;
        totalCollected += collectValue * d;
      });
      
      // Calculate balance
      const balance = totalCollected - totalAmount;
      
      console.log('Balance Calculation: Total Collected:', totalCollected, '- Total Amount:', totalAmount, '= Balance:', balance);
      
      // Update form data balance and received cash
      setFormData(prev => ({
        ...prev,
        receivedCash: totalCollected.toString()
      }));
      
      // If balance is positive, auto-calculate and fill issue row
      if (balance > 0) {
        console.log('Auto-calculating issue for balance:', balance);
        const optimalIssue = calculateOptimalDenominations(balance);
        console.log('Optimal issue breakdown:', optimalIssue);
        
        [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
          updated[d] = { ...updated[d], issue: optimalIssue[d].toString() };
          // Recalculate closing for each denomination
          const col = Number(updated[d].collect) || 0;
          const iss = optimalIssue[d];
          const avail = liveAvailable[d] !== 0 && liveAvailable[d] ? liveAvailable[d] : updated[d].available;
          updated[d].closing = avail + col - iss;
        });
      } else {
        // If balance is not positive, reset issue to 0
        [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
          updated[d] = { ...updated[d], issue: 0 };
          // Recalculate closing for each denomination (closing = available + collect - 0)
          const col = Number(updated[d].collect) || 0;
          const avail = liveAvailable[d] !== 0 && liveAvailable[d] ? liveAvailable[d] : updated[d].available;
          updated[d].closing = avail + col;
        });
      }
    }
    
    setDenominations(updated);
  };

  useEffect(() => {
  if (isOpen) {
    setDenominations(particulars);
    fetchLiveCash();

    setTimeout(() => {
      // Focus first input in PY or non-PY mode
      if (fieldRefs.current[500]) {
        fieldRefs.current[500].focus();
      }
    }, 100);
  }
}, [isOpen, particulars, userData?.companyCode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
const handlePYFieldKeyDown = (e, denom, type) => {
  const denomSequence = [500, 200, 100, 50, 20, 10, 5, 2, 1];
  const currentIndex = denomSequence.indexOf(denom);
  if (e.key === 'Enter') {
    e.preventDefault();
    if (type === 'issue') {
      if (currentIndex < denomSequence.length - 1) {
        // Move to next Issue field
        const nextDenom = denomSequence[currentIndex + 1];
        if (pyIssueRefs.current[nextDenom]) pyIssueRefs.current[nextDenom].focus();
      } else {
        // Last Issue field
        // Only move to Collect if there is a Collect row with any editable value
        const hasCollectRow = Object.values(pyCollectRefs.current).some(ref => ref);
        if (hasCollectRow) {
          if (pyCollectRefs.current[500]) pyCollectRefs.current[500].focus();
        }
        // else do nothing, stay on last Issue field
      }
    } else if (type === 'collect') {
      if (currentIndex < denomSequence.length - 1) {
        // Move to next Collect field
        const nextDenom = denomSequence[currentIndex + 1];
        if (pyCollectRefs.current[nextDenom]) pyCollectRefs.current[nextDenom].focus();
      } else {
        // Last Collect field → Save button
        if (confirmRef.current) confirmRef.current.focus();
      }
    }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (currentIndex < denomSequence.length - 1) {
      const nextDenom = denomSequence[currentIndex + 1];
      if (type === 'issue' && pyIssueRefs.current[nextDenom]) pyIssueRefs.current[nextDenom].focus();
      if (type === 'collect' && pyCollectRefs.current[nextDenom]) pyCollectRefs.current[nextDenom].focus();
    }
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (currentIndex > 0) {
      const prevDenom = denomSequence[currentIndex - 1];
      if (type === 'issue' && pyIssueRefs.current[prevDenom]) pyIssueRefs.current[prevDenom].focus();
      if (type === 'collect' && pyCollectRefs.current[prevDenom]) pyCollectRefs.current[prevDenom].focus();
    }
  }
};



  // Handle keydown in collect fields for navigation
  const handleCollectFieldKeyDown = (e, currentDenom) => {
    const denomSequence = [500, 200, 100, 50, 20, 10, 5, 2, 1];
    const currentIndex = denomSequence.indexOf(currentDenom);
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentIndex < denomSequence.length - 1) {
        // Move to next denomination field
        const nextDenom = denomSequence[currentIndex + 1];
        if (collectFieldRefs.current[nextDenom]) {
          collectFieldRefs.current[nextDenom].focus();
        }
      } else if (currentIndex === denomSequence.length - 1) {
        // Last field (1), move to Save button
        if (confirmRef.current) {
          confirmRef.current.focus();
        }
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentIndex < denomSequence.length - 1) {
        const nextDenom = denomSequence[currentIndex + 1];
        if (collectFieldRefs.current[nextDenom]) {
          collectFieldRefs.current[nextDenom].focus();
        }
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentIndex > 0) {
        const prevDenom = denomSequence[currentIndex - 1];
        if (collectFieldRefs.current[prevDenom]) {
          collectFieldRefs.current[prevDenom].focus();
        }
      }
    }
  };
useEffect(() => {
  if (isOpen) {
    setDenominations(particulars);
    fetchLiveCash();

    setTimeout(() => {
      if (Type === 'PY' && pyIssueRefs.current[500]) {
        pyIssueRefs.current[500].focus(); // Default focus on first Issue
      } else if (fieldRefs.current[500]) {
        fieldRefs.current[500].focus(); // Non-PY default
      }
    }, 100);
  }
}, [isOpen, particulars, Type]);

  // Update closing values when liveAvailable changes
  useEffect(() => {
    if (Object.keys(liveAvailable).some(key => liveAvailable[key] > 0)) {
      setDenominations(prev => {
        const updated = { ...prev };
        [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(denom => {
          const collect = Number(updated[denom]?.collect) || 0;
          const issue = Number(updated[denom]?.issue) || 0;
          const available = liveAvailable[denom] || updated[denom]?.available || 0;
          updated[denom] = {
            ...updated[denom],
            closing: available + collect - issue
          };
        });
        return updated;
      });
    }
  }, [liveAvailable]);

  if (!isOpen) return null;

  // Handle confirm with updated values
  const [validationPopup, setValidationPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'OK',
    cancelText: null,
    action: null,
    isLoading: false
  });

  const handleFieldKeyDown = (e, currentDenom) => {
  if (e.key === 'Enter') {
    e.preventDefault();

    const denomSequence = [500, 200, 100, 50, 20, 10, 5, 2, 1];
    const currentIndex = denomSequence.indexOf(currentDenom);

    if (currentIndex < denomSequence.length - 1) {
      const nextDenom = denomSequence[currentIndex + 1];
      if (fieldRefs.current[nextDenom]) {
        fieldRefs.current[nextDenom].focus();
      }
    } else {
      // Last field, move to Save button
      if (confirmRef.current) confirmRef.current.focus();
    }
  }
};

  // const handleConfirmClick = () => {
  //   let collected = 0;
  //   [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
  //     const collectValue = Number(denominations[d]?.collect) || 0;
  //     collected += collectValue * d;
  //   });

  //   const balance = collected - totalAmount;
  //   if (balance < 0) {
  //     setValidationPopup({
  //       isOpen: true,
  //       title: 'Validation Error',
  //       message: 'Bill Amount Mismatch. Please check the entered amounts.',
  //       type: 'warning',
  //       confirmText: 'OK',
  //       cancelText: null,
  //       action: null,
  //       isLoading: false
  //     });
  //     return;
  //   }
  //   setSaveConfirmationOpen(true);
  // };

const handleConfirmClick = () => {
  let collected = 0;
  let issued = 0;

  [500,200,100,50,20,10,5,2,1].forEach(d => {
    collected += (Number(denominations[d]?.collect) || 0) * d;
    issued += (Number(denominations[d]?.issue) || 0) * d;
  });

  // 🔑 Correct net calculation for PY
  const net = issued - collected;




  if (Type === "PY" && Math.abs(net) !== Math.abs(totalAmount)) {
   
      setValidationPopup({
        isOpen: true,
        title: 'Validation Error',
        message: 'Bill Amount Mismatch. Please check the entered amounts.',
        type: 'warning',
        confirmText: 'OK',
        cancelText: null,
        action: null,
        isLoading: false
      });
      return;
    
  }

     const balance = collected - totalAmount;
    if (Type !== "PY" && balance < 0) {
      setValidationPopup({
        isOpen: true,
        title: 'Validation Error',
        message: 'Bill Amount Mismatch. Please check the entered amounts.',
        type: 'warning',
        confirmText: 'OK',
        cancelText: null,
        action: null,
        isLoading: false
      });
      return;
    }

  // ✅ Valid → allow save
  setSaveConfirmationOpen(true);
};


  // Handle the actual save after confirmation
  const handleSaveConfirmation = async () => {
    setSaveConfirmationLoading(true);
    try {
      // Call the parent's onConfirm callback with the updated particulars
      onConfirm(denominations);
      setSaveConfirmationOpen(false);
    } catch (err) {
      console.error('Error during save confirmation:', err);
    } finally {
      setSaveConfirmationLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <ConfirmationPopup
          isOpen={validationPopup.isOpen}
          title={validationPopup.title}
          message={validationPopup.message}
          type={validationPopup.type}
          confirmText={validationPopup.confirmText}
          cancelText={validationPopup.cancelText}
          onConfirm={() => setValidationPopup(p => ({ ...p, isOpen: false }))}
          onClose={() => setValidationPopup(p => ({ ...p, isOpen: false }))}
          isLoading={validationPopup.isLoading}
        />
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>{title}</h1>
              <div className={styles.voucherInfo}>
                <span className={styles.voucherNo}>Voucher No: {voucherNo}</span>
                <span className={styles.voucherDate}>Date: {voucherDate}</span>
              </div>
            </div>
            <button className={styles.closeButton} onClick={onClose}>✕</button>
          </div>

          <div className={styles.content}>
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
                  <div className={styles.tableCell}>{liveAvailable[500] || denominations[500]?.available || 0}</div>
                  <div className={styles.tableCell}>{liveAvailable[200] || denominations[200]?.available || 0}</div>
                  <div className={styles.tableCell}>{liveAvailable[100] || denominations[100]?.available || 0}</div>
                  <div className={styles.tableCell}>{liveAvailable[50] || denominations[50]?.available || 0}</div>
                  <div className={styles.tableCell}>{liveAvailable[20] || denominations[20]?.available || 0}</div>
                  <div className={styles.tableCell}>{liveAvailable[10] || denominations[10]?.available || 0}</div>
                  <div className={styles.tableCell}>{liveAvailable[5] || denominations[5]?.available || 0}</div>
                  <div className={styles.tableCell}>{liveAvailable[2] || denominations[2]?.available || 0}</div>
                  <div className={styles.tableCell}>{liveAvailable[1] || denominations[1]?.available || 0}</div>
                </div>

                {/* Collect Row */}
               {/* Conditional rendering based on Type */}
                {Type !== "PY" ? (
                  <>
                    {/* For non-PY type (RE type): Collect row is editable, Issue row is auto-calculated */}
                    <div className={styles.tableRow}>
                      <div className={styles.tableLabelCell}>Collect</div>
                      {[500, 200, 100, 50, 20, 10, 5, 2, 1].map(denom => (
                        <div key={denom} className={styles.tableCell}>
                          <input
                            ref={(el) => {
                              fieldRefs.current[denom] = el;
                              collectFieldRefs.current[denom] = el;
                            }}
                            type="number"
                            value={denominations[denom].collect === 0 ? '' : denominations[denom].collect}
                            onChange={(e) => handleDenominationChange(denom, 'collect', e.target.value)}
                            onKeyDown={(e) => handleCollectFieldKeyDown(e, denom)}
                            className={styles.tableInput}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Issue Row (auto-calculated, readonly) */}
                    <div className={styles.tableRow}>
                      <div className={styles.tableLabelCell}>Issue</div>
                      {[500, 200, 100, 50, 20, 10, 5, 2, 1].map(denom => (
                        <div key={denom} className={styles.tableCell}>
                          <input
                            type="number"
                            value={denominations[denom].issue === 0 ? '' : denominations[denom].issue}
                            readOnly
                            className={styles.tableInput}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
    {/* Issue Row */}
<div className={styles.tableRow}>
  <div className={styles.tableLabelCell}>Issue</div>
  {[500,200,100,50,20,10,5,2,1].map(denom => (
    <div key={denom} className={styles.tableCell}>
      <input
        ref={el => pyIssueRefs.current[denom] = el}
        type="number"
        value={denominations[denom].issue || ''}
        onChange={(e) => handleDenominationChange(denom, 'issue', e.target.value)}
        onKeyDown={(e) => handlePYFieldKeyDown(e, denom, 'issue')}
        className={styles.tableInput}
      />
    </div>
  ))}
</div>

{/* Collect Row */}
<div className={styles.tableRow}>
  <div className={styles.tableLabelCell}>Collect</div>
  {[500,200,100,50,20,10,5,2,1].map(denom => (
    <div key={denom} className={styles.tableCell}>
      <input
        ref={el => pyCollectRefs.current[denom] = el}
        type="number"
        value={denominations[denom].collect || ''}
        onChange={(e) => handleDenominationChange(denom, 'collect', e.target.value)}
        onKeyDown={(e) => handlePYFieldKeyDown(e, denom, 'collect')}
        className={styles.tableInput}
      />
    </div>
  ))}
</div>


                  </>
                )}



                  
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
                <div className={styles.paymentGroup}>
                  <label className={styles.paymentLabel}>
                    {hasCashPayments ? 'Net Amount' : 'Total Amount'}
                  </label>
                  <div className={styles.paymentInputContainer}>
                    <input
                      type="number"
                      value={totalAmount}
                      className={styles.paymentInput}
                      placeholder="0"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className={styles.paymentGroup}>
                  <label className={styles.paymentLabel}>Collected Amount</label>
                  <div className={styles.paymentInputContainer}>
                    <input
                      type="text"
                      value={(() => {
                        let collected = 0;
                        [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
                          const collectValue = Number(denominations[d]?.collect) || 0;
                          collected += collectValue * d;
                        });
                        return collected;
                      })()}
                      readOnly
                      className={`${styles.paymentInput} ${styles.readonlyPayment}`}
                    />
                  </div>
                </div>

                <div className={styles.paymentGroup}>
                  <label className={styles.paymentLabel}>Issued Amount</label>
                  <div className={styles.paymentInputContainer}>
                    <input
                      type="text"
                      value={(() => {
                        let issued = 0;
                        [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
                          const issueValue = Number(denominations[d]?.issue) || 0;
                          issued += issueValue * d;
                        });
                        return issued;
                      })()}
                      readOnly
                      className={`${styles.paymentInput} ${styles.readonlyPayment}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button
              onClick={onClose}
              disabled={loading}
              className={styles.footerButtonCancel}
            >
              Cancel
            </button>
            <button
              ref={confirmRef}
              onClick={handleConfirmClick}
              disabled={loading}
              className={styles.footerButtonSave}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

        {/* Save Confirmation Popup */}
        <ConfirmationPopup
          isOpen={saveConfirmationOpen}
          onClose={() => setSaveConfirmationOpen(false)}
          onConfirm={handleSaveConfirmation}
          title="Save Voucher"
          message="Do you want to save?"
          type="success"
          confirmText={saveConfirmationLoading ? 'Saving...' : 'Save'}
          showLoading={saveConfirmationLoading}
          disableBackdropClose={saveConfirmationLoading}
        />
    </div>
  );
};

export default SaveConfirmationModal;
