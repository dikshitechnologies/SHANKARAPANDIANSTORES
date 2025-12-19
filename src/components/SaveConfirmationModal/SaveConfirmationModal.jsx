import React, { useRef, useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import { API_ENDPOINTS } from '../../api/endpoints';
import ConfirmationPopup from '../ConfirmationPopup/ConfirmationPopup';
import { useAuth } from '../../context/AuthContext';

const SaveConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Save",
  particulars = {
    '500': { available: 0, collect: 0, issue: 0 },
    '200': { available: 0, collect: 0, issue: 0 },
    '100': { available: 0, collect: 0, issue: 0 },
    '50': { available: 0, collect: 0, issue: 0 },
    '20': { available: 0, collect: 0, issue: 0 },
    '10': { available: 0, collect: 0, issue: 0 },
    '5': { available: 0, collect: 0, issue: 0 },
    '2': { available: 0, collect: 0, issue: 0 },
    '1': { available: 0, collect: 0, issue: 0 }
  },
  loading = false,
  voucherNo = "",
  voucherDate = ""
}) => {
  const { userData } = useAuth() || {};
  const confirmRef = useRef(null);
  const [editableParticulars, setEditableParticulars] = useState(particulars);
  const fieldRefs = useRef({});
  const [liveAvailable, setLiveAvailable] = useState({
    '500': 0, '200': 0, '100': 0, '50': 0, '20': 0, 
    '10': 0, '5': 0, '2': 0, '1': 0
  });
  const [saveConfirmationOpen, setSaveConfirmationOpen] = useState(false);
  const [saveConfirmationLoading, setSaveConfirmationLoading] = useState(false);

  // Prepare table data based on particulars
  const denominations = ['500', '200', '100', '50', '20', '10', '5', '2', '1'];

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
        // apiService.get returns the data directly
        const data = response.data || response;
        console.log('Parsed data:', data);
        
        // Map API response keys (r500, r200, etc.) to denominations
        const available = {
          '500': data.r500 || 0,
          '200': data.r200 || 0,
          '100': data.r100 || 0,
          '50': data.r50 || 0,
          '20': data.r20 || 0,
          '10': data.r10 || 0,
          '5': data.r5 || 0,
          '2': data.r2 || 0,
          '1': data.r1 || 0
        };
        setLiveAvailable(available);
        console.log('Live drawer data loaded successfully:', available);
      }
    } catch (err) {
      console.error('Error fetching live drawer:', err);
      // Use particulars available values as fallback
      const fallback = {};
      denominations.forEach(denom => {
        fallback[denom] = particulars[denom]?.available || 0;
      });
      setLiveAvailable(fallback);
    }
  };

  // Handle collect input change with auto-calculation of issue
  const handleCollectChange = (denom, value) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setEditableParticulars(prev => {
      const updated = { ...prev };
      updated[denom] = {
        ...prev[denom],
        collect: numValue
      };

      // Auto-calculate issue for all denominations if needed
      // For now, just update the collect value
      return updated;
    });
  };

  // Handle issue input change - keep read-only
  const handleIssueChange = (denom, value) => {
    // This will be read-only, so we don't actually handle changes
    // The issue is auto-calculated
  };

  useEffect(() => {
    if (isOpen) {
      setEditableParticulars(particulars);
      fetchLiveCash();
      
      // Focus first field (500) when modal opens
      setTimeout(() => {
        if (fieldRefs.current['500']) {
          fieldRefs.current['500'].focus();
        }
      }, 100);
    }
  }, [isOpen, particulars, userData?.companyCode]);

  if (!isOpen) return null;
  
  // Initialize counters using liveAvailable from API
  const available = {};
  const collect = {};
  const issue = {};

  denominations.forEach(denom => {
    // Use live cash from API if available, otherwise use particulars
    available[denom] = liveAvailable[denom] !== undefined ? liveAvailable[denom] : (editableParticulars[denom]?.available || 0);
    collect[denom] = editableParticulars[denom]?.collect || 0;
    issue[denom] = editableParticulars[denom]?.issue || 0;
  });

  // Handle Enter key to move to next field
  const handleKeyDown = (e, denom) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentIndex = denominations.indexOf(denom);
      if (currentIndex < denominations.length - 1) {
        // Move to next denomination
        const nextDenom = denominations[currentIndex + 1];
        if (fieldRefs.current[nextDenom]) {
          fieldRefs.current[nextDenom].focus();
        }
      } else {
        // Move to Save button
        if (confirmRef.current) {
          confirmRef.current.focus();
        }
      }
    }
  };

  // Handle confirm with updated values
  const handleConfirmClick = () => {
    setSaveConfirmationOpen(true);
  };

  // Handle the actual save after confirmation
  const handleSaveConfirmation = async () => {
    setSaveConfirmationLoading(true);
    try {
      // Update editableParticulars with live available values and collect/issue values
      const updatedParticulars = { ...editableParticulars };
      denominations.forEach(denom => {
        const currentAvailable = liveAvailable[denom] !== undefined ? liveAvailable[denom] : (editableParticulars[denom]?.available || 0);
        const currentCollect = editableParticulars[denom]?.collect || 0;
        const currentIssue = editableParticulars[denom]?.issue || 0;
        const closingBalance = currentAvailable + currentCollect - currentIssue;
        updatedParticulars[denom] = {
          available: currentAvailable,
          collect: currentCollect,
          issue: currentIssue,
          closing: closingBalance
        };
      });
      // Call the parent's onConfirm callback with the updated particulars
      onConfirm(updatedParticulars);
      setSaveConfirmationOpen(false);
    } catch (err) {
      console.error('Error during save confirmation:', err);
    } finally {
      setSaveConfirmationLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 6, 23, 0.46)',
        backdropFilter: 'blur(4px)',
        zIndex: 1200,
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '80vh',
          overflow: 'auto',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,255,0.95))',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 18px 50px rgba(2, 6, 23, 0.36)',
          border: '1px solid rgba(255,255,255,0.5)',
          backdropFilter: 'blur(8px)',
          animation: 'slideIn 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '2px solid #307AC8', paddingBottom: '16px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '20px', fontWeight: 700 }}>
            {title}
          </h2>
          <div style={{ display: 'flex', gap: '24px', color: '#64748b', fontSize: '14px' }}>
            <div>
              <span style={{ fontWeight: 600 }}>Voucher No:</span> {voucherNo}
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>Date:</span> {voucherDate}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ marginBottom: '24px', overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}
          >
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #307AC8, #1B91DA)' }}>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    color: 'white',
                    fontWeight: 700,
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  PARTICULARS
                </th>
                {denominations.map((denom) => (
                  <th
                    key={denom}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      color: 'white',
                      fontWeight: 700,
                      borderRight: '1px solid rgba(255,255,255,0.2)',
                      minWidth: '70px'
                    }}
                  >
                    {denom}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* AVAILABLE Row */}
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <td
                  style={{
                    padding: '12px',
                    fontWeight: 600,
                    color: '#0f172a',
                    borderRight: '1px solid #e5e7eb'
                  }}
                >
                  AVAILABLE
                </td>
                {denominations.map((denom) => (
                  <td
                    key={`avail-${denom}`}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      color: '#0f172a',
                      borderRight: '1px solid #e5e7eb',
                      fontWeight: 600
                    }}
                  >
                    {available[denom] || 0}
                  </td>
                ))}
              </tr>

              {/* COLLECT Row */}
              <tr style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
                <td
                  style={{
                    padding: '12px',
                    fontWeight: 600,
                    color: '#0f172a',
                    borderRight: '1px solid #e5e7eb'
                  }}
                >
                  COLLECT
                </td>
                {denominations.map((denom, index) => (
                  <td
                    key={`collect-${denom}`}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      borderRight: '1px solid #e5e7eb'
                    }}
                  >
                    <input
                      ref={(el) => (fieldRefs.current[denom] = el)}
                      type="number"
                      value={collect[denom] === 0 ? '' : collect[denom]}
                      onChange={(e) => handleCollectChange(denom, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, denom)}
                      min="0"
                      placeholder="0"
                      autoFocus={index === 0}
                      tabIndex={index}
                      style={{
                        width: '50px',
                        padding: '6px 8px',
                        border: '2px solid #307AC8',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '13px',
                        background: '#fff',
                        color: '#0f172a',
                        fontWeight: 600,
                        cursor: 'text'
                      }}
                    />
                  </td>
                ))}
              </tr>

              {/* ISSUE Row */}
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <td
                  style={{
                    padding: '12px',
                    fontWeight: 600,
                    color: '#0f172a',
                    borderRight: '1px solid #e5e7eb'
                  }}
                >
                  ISSUE
                </td>
                {denominations.map((denom, index) => (
                  <td
                    key={`issue-${denom}`}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      borderRight: '1px solid #e5e7eb'
                    }}
                  >
                    <input
                      type="number"
                      value={issue[denom] === 0 ? '' : issue[denom]}
                      readOnly
                      min="0"
                      placeholder="0"
                      tabIndex={index + 9}
                      style={{
                        width: '50px',
                        padding: '6px 8px',
                        border: '2px solid #307AC8',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '13px',
                        background: '#fff',
                        color: '#0f172a',
                        fontWeight: 600,
                        cursor: 'not-allowed'
                      }}
                    />
                  </td>
                ))}
              </tr>

              {/* CLOSING Row */}
              <tr style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
                <td
                  style={{
                    padding: '12px',
                    fontWeight: 600,
                    color: '#0f172a',
                    borderRight: '1px solid #e5e7eb'
                  }}
                >
                  CLOSING
                </td>
                {denominations.map((denom) => (
                  <td
                    key={`closing-${denom}`}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      color: '#0f172a',
                      borderRight: '1px solid #e5e7eb',
                      fontWeight: 600
                    }}
                  >
                    {(available[denom] + collect[denom] - issue[denom]) || 0}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Message */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: '#064e3b',
            fontSize: '14px'
          }}
        >
          ✓ Please verify the particulars above before confirming the save operation.
        </div>

        {/* Button Controls */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#0f172a',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#f3f4f6')}
            onMouseLeave={(e) => (e.target.style.background = '#fff')}
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={handleConfirmClick}
            disabled={loading}
            tabIndex={9}
            style={{
              padding: '10px 24px',
              background: loading
                ? 'rgba(48, 122, 200, 0.6)'
                : 'linear-gradient(90deg, #307AC8, #06A7EA)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.boxShadow = '0 8px 24px rgba(48, 122, 200, 0.25)')}
            onMouseLeave={(e) => (e.target.style.boxShadow = 'none')}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Save Confirmation Popup */}
      <ConfirmationPopup
        isOpen={saveConfirmationOpen}
        onClose={() => setSaveConfirmationOpen(false)}
        onConfirm={handleSaveConfirmation}
        title="Confirm Save"
        message="Are you sure you want to save this voucher?"
        type="success"
        confirmText={saveConfirmationLoading ? 'Saving...' : 'Save'}
        showLoading={saveConfirmationLoading}
        disableBackdropClose={saveConfirmationLoading}
      />
    </div>
  );
};

export default SaveConfirmationModal;
