import React, { useState, useEffect, useRef } from 'react';
import styles from './TenderModal.module.css';
import apiService from '../../api/apiService';
import { ActionButtons1 } from '../Buttons/ActionButtons';
import ConfirmationPopup from '../ConfirmationPopup/ConfirmationPopup';
import { API_ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from "../../api/axiosInstance";
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
import PopupListSelector from '../Listpopup/PopupListSelector';
import js from '@eslint/js';
const TenderModal = ({ isOpen, onClose, billData, onSaveSuccess }) => {
  const { userData } = useAuth() || {};
  const [activeFooterAction, setActiveFooterAction] = useState('all');
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
  

  // Refs for focus management
  const collectFieldRefs = useRef({});
  const saveButtonRef = useRef(null);
  const billDiscountPercentRef = useRef(null);
  const roundOffRef = useRef(null);
  const scrapBillNoRef = useRef(null);
  const salesReturnBillNoRef = useRef(null);
  const upiRef = useRef(null);
  const cardRef = useRef(null);

  // NEW: Added refs for new focus flow
  const upiBankRef = useRef(null);
  const cardBankRef = useRef(null);
  const serviceChargeCheckboxRef = useRef(null);
  const serviceChargePercentRef = useRef(null);
  // Transport charge refs
  const transportChargeCheckboxRef = useRef(null);
  const transportChargePercentRef = useRef(null);
  const transportAmountRef = useRef(null);
  const serviceChargeAmountRef = useRef(null);

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
    originalDate: '',
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
    upiBank: '',
    cardBank: '',
    serviceChargePercent: '',
    serviceChargeAmount: '',
    isServiceCharge: false,
    // Transport charge fields
    isTransportCharge: false,
    transport: '', // text field for transport
    transportAmount: '',
    isCreditBill: false,
    delivery: false,
    balance: '',
  });
  // Handle Transport Charge Toggle
  const handleTransportChargeToggle = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => {
      const updated = { ...prev, isTransportCharge: isChecked };
      if (!isChecked) {
        updated.transport = '';
        updated.transportAmount = '';
      }
      return updated;
    });
  };

  // Handle Transport (text) Change
  const handleTransportChange = (value) => {
    setFormData(prev => ({ ...prev, transport: value }));
  };

  // Focus handlers for transport charge
  const handleTransportChargeCheckboxKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (formData.isTransportCharge) {
        if (transportChargePercentRef.current) {
          transportChargePercentRef.current.focus();
        }
      } else {
        if (saveButtonRef.current) {
          saveButtonRef.current.focus();
        }
      }
    }
  };

  // Handle Transport Amount Change
const handleTransportAmountChange = (value) => {
  setFormData(prev => ({ ...prev, transportAmount: value }));
};

  const handleTransportChargePercentKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (transportAmountRef.current) {
        transportAmountRef.current.focus();
      }
    }
  };

const handleTransportAmountKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (saveButtonRef.current) {
      saveButtonRef.current.focus();
    }
  }
};

  // Update form data when billData changes
  useEffect(() => {
    if (billData && isOpen) {
      const newFormData = {
        billNo: billData.billNo || '',
        salesman: billData.salesman || '',
        date: billData.date ? new Date(billData.date).toLocaleDateString('en-IN') : '',
        originalDate: billData.date || '',
        grossAmt: billData.amount ? billData.amount.toString() : '',
        itemDAmt: '',
        billAmount: billData.amount ? billData.amount.toString() : '',
        billDiscountPercent: '',
        billDiscAmt: '',
        granTotal: billData.amount ? billData.amount.toString() : '',
        roudOff: '',
        scrapAmountBillNo: '',
        scrapAmount: '',
        salesReturnBillNo: '',
        salesReturn: '',
        netAmount: billData.amount ? billData.amount.toString() : '',
        receivedCash: '',
        issuedCash: '',
        upi: '',
        card: '',
        upiBank: '',
        cardBank: '',
        serviceChargePercent: '',
        serviceChargeAmount: '',
        isServiceCharge: false,
        isCreditBill: false,
        delivery: false,
        balance: billData.amount ? billData.amount.toString() : '',
      };
      
      setFormData(newFormData);
      
      setDenominations(prev => ({
        500: { ...prev[500], collect: '', issue: '', closing: prev[500].available },
        200: { ...prev[200], collect: '', issue: '', closing: prev[200].available },
        100: { ...prev[100], collect: '', issue: '', closing: prev[100].available },
        50: { ...prev[50], collect: '', issue: '', closing: prev[50].available },
        20: { ...prev[20], collect: '', issue: '', closing: prev[20].available },
        10: { ...prev[10], collect: '', issue: '', closing: prev[10].available },
        5: { ...prev[5], collect: '', issue: '', closing: prev[5].available },
        2: { ...prev[2], collect: '', issue: '', closing: prev[2].available },
        1: { ...prev[1], collect: '', issue: '', closing: prev[1].available },
      }));
      
      fetchLiveDrawer();
      
      setTimeout(() => {
        if (billDiscountPercentRef.current) {
          billDiscountPercentRef.current.focus();
        }
      }, 100);
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

  // Update balance whenever cash collected, upi, or card changes
  useEffect(() => {
    // Calculate total collected cash amount from all denominations
    let totalCollectedCash = 0;
    [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
      const collectValue = Number(denominations[d].collect) || 0;
      totalCollectedCash += collectValue * d;
    });

    // Get UPI and Card amounts
    const upiAmount = Number(formData.upi) || 0;
    const cardAmount = Number(formData.card) || 0;
    
    // Calculate net amount
    const netAmount = Number(formData.netAmount) || 0;
    
    // Calculate total payment received (cash + upi + card)
    const totalPaymentReceived = totalCollectedCash + upiAmount + cardAmount;
    
    // Calculate balance: Net Amount - Total Payment Received
    const balance = netAmount - totalPaymentReceived;
    
    // If balance is negative, we need to issue cash (give change)
    const issuedCash = balance < 0 ? Math.abs(balance) : 0;

    // Update form data
    setFormData(prev => ({
      ...prev,
      receivedCash: totalCollectedCash.toString(),
      balance: balance.toString(),
      issuedCash: issuedCash.toString()
    }));

    // Update denominations with new closing and issue values
    setDenominations(prevDenom => {
      const newDenom = { ...prevDenom };
      
      // Recalculate closing for each denomination
      [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
        const col = Number(newDenom[d].collect) || 0;
        const iss = Number(newDenom[d].issue) || 0;
        newDenom[d].closing = newDenom[d].available + col - iss;
      });

      // If we need to issue cash (balance is negative), auto-calculate issue denominations
      if (balance < 0) {
        const optimalIssue = calculateOptimalDenominations(issuedCash);
        [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
          const iss = optimalIssue[d];
          newDenom[d] = { ...newDenom[d], issue: iss.toString() };
          // Recalculate closing with new issue value
          const col = Number(newDenom[d].collect) || 0;
          newDenom[d].closing = newDenom[d].available + col - iss;
        });
      } else {
        // Clear issue denominations if no cash to issue
        [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
          newDenom[d] = { ...newDenom[d], issue: '' };
          const col = Number(newDenom[d].collect) || 0;
          newDenom[d].closing = newDenom[d].available + col;
        });
      }

      return newDenom;
    });
  }, [
    Object.values(denominations).map(d => d.collect).join(','), 
    formData.netAmount, 
    formData.upi, 
    formData.card
  ]);



  // api/bankApi.js
const fetchBankList = async (page, search) => {
  const res = await fetch(
    `http://dikshiserver/spstorewebapi/api/BillCollector/Getbankdetails?pageNumber=${page}&pageSize=200&search=${search || ''}`
  );
  const json = await res.json();
  return json?.data || [];
};


const [upiPopupOpen, setUpiPopupOpen] = useState(false);
const [cardPopupOpen, setCardPopupOpen] = useState(false);

// initial search text when opening popups by typing
const [upiPopupInitialSearch, setUpiPopupInitialSearch] = useState('');
const [cardPopupInitialSearch, setCardPopupInitialSearch] = useState('');

const [upiBank, setUpiBank] = useState(null);
const [cardBank, setCardBank] = useState(null);

const [balanceAmt, setBalanceAmt] = useState(0);
const [serviceChargePercent, setServiceChargePercent] = useState(0);
const [serviceChargeAmount, setServiceChargeAmount] = useState(0);


  // Fetch live drawer available from API
  const fetchLiveDrawer = async () => {
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const companyCode = userData?.companyCode || '001';
      
      const endpoint = API_ENDPOINTS.BILLCOLLECTOR.GET_LIVE_DRAWER(dateStr, companyCode);
      const response = await apiService.get(endpoint);
      
      if (response) {
        const data = response.data || response;
        
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
      }
    } catch (err) {
      console.error('Error fetching live drawer:', err);
    }
  };

  // Function to calculate optimal issue denominations for a given amount
  const calculateOptimalDenominations = (amount) => {
    const denomList = [500, 200, 100, 50, 20, 10, 5, 2, 1];
    const result = {};
    
    denomList.forEach(d => result[d] = 0);
    
    let remaining = amount;
    
    for (let denom of denomList) {
      const available = denominations[denom]?.available || 0;
      
      if (available <= 0) {
        continue;
      }
      
      if (remaining >= denom) {
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
    updated[denom] = { ...updated[denom], [field]: value === '' ? '' : value };
    
    const collect = Number(updated[denom].collect) || 0;
    const issue = Number(updated[denom].issue) || 0;
    updated[denom].closing = updated[denom].available + collect - issue;
    
    if (field === 'collect') {
      let totalCollected = 0;
      [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
        const collectValue = d === denom ? Number(value) || 0 : Number(updated[d].collect) || 0;
        totalCollected += collectValue * d;
      });
      
      const netAmount = Number(formData.netAmount) || 0;
      const upiAmount = Number(formData.upi) || 0;
      const cardAmount = Number(formData.card) || 0;
      const totalCollectedAll = totalCollected + upiAmount + cardAmount;
      
      const balance = netAmount - totalCollectedAll;
      const issuedCash = balance < 0 ? Math.abs(balance).toString() : '';
      
      setFormData(prev => ({
        ...prev,
        receivedCash: totalCollected.toString(),
        balance: balance.toString(),
        issuedCash: issuedCash
      }));
      
      if (balance < 0) {
        const optimalIssue = calculateOptimalDenominations(Math.abs(balance));
        [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
          updated[d] = { ...updated[d], issue: optimalIssue[d].toString() };
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
        const grandTotal = Math.round(billAmount - discountAmount);
        updated.granTotal = grandTotal.toFixed(2);
      }

      // Calculate Grand Total when discount percent is updated (for Enter key)
      if (field === 'billDiscountPercent') {
        const billAmount = Number(prev.billAmount) || 0;
        const discountPercent = Number(value) || 0;
        const discountAmount = (billAmount * discountPercent) / 100;
        const grandTotal = Math.round(billAmount - discountAmount);
        updated.granTotal = grandTotal.toFixed(2);
        
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

      // When UPI or Card changes, recalculate balance
      if (field === 'upi' || field === 'card') {
        const totalCollectedCash = Object.entries(denominations).reduce((sum, [denom, data]) => {
          return sum + ((Number(data.collect) || 0) * Number(denom));
        }, 0);
        
        const netAmt = Number(updated.netAmount || prev.netAmount) || 0;
        const upiAmt = field === 'upi' ? Number(value) || 0 : Number(prev.upi) || 0;
        const cardAmt = field === 'card' ? Number(value) || 0 : Number(prev.card) || 0;
        
        const totalPayment = totalCollectedCash + upiAmt + cardAmt;
        const balance = netAmt - totalPayment;
        
        updated.balance = balance.toString();
        updated.issuedCash = balance < 0 ? Math.abs(balance).toString() : '';
      }

      // When Net Amount is updated, calculate the balance
      if (field === 'netAmount' || field === 'roudOff' || field === 'scrapAmount' || field === 'salesReturn' || field === 'billDiscountPercent') {
        const totalCollectedCash = Object.entries(denominations).reduce((sum, [denom, data]) => {
          return sum + ((Number(data.collect) || 0) * Number(denom));
        }, 0);
        
        const netAmt = Number(updated.netAmount || prev.netAmount) || 0;
        const upiAmt = Number(updated.upi || prev.upi) || 0;
        const cardAmt = Number(updated.card || prev.card) || 0;
        const totalPayment = totalCollectedCash + upiAmt + cardAmt;
        
        const balance = netAmt - totalPayment;
        const issuedCash = balance < 0 ? Math.abs(balance).toString() : '';
        
        updated.balance = balance.toString();
        updated.issuedCash = issuedCash;
        
        // If we need to issue cash (balance is negative), auto-calculate issue denominations
        if (balance < 0) {
          const optimalIssue = calculateOptimalDenominations(Math.abs(balance));
          setDenominations(prevDenom => {
            const newDenom = { ...prevDenom };
            [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
              newDenom[d] = { ...newDenom[d], issue: optimalIssue[d].toString() };
              const col = Number(newDenom[d].collect) || 0;
              const iss = optimalIssue[d];
              newDenom[d].closing = newDenom[d].available + col - iss;
            });
            return newDenom;
          });
        } else {
          // Clear issue denominations if no cash to issue
          setDenominations(prevDenom => {
            const newDenom = { ...prevDenom };
            [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
              newDenom[d] = { ...newDenom[d], issue: '' };
              const col = Number(newDenom[d].collect) || 0;
              newDenom[d].closing = newDenom[d].available + col;
            });
            return newDenom;
          });
        }
      }

      return updated;
    });
  };

  // Handle Service Charge Toggle and Calculation
  const handleServiceChargeToggle = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => {
      const updated = { ...prev, isServiceCharge: isChecked };
      
      if (isChecked) {
        const cardAmount = Number(prev.card) || 0;
        const serviceChargePercent = Number(prev.serviceChargePercent) || 0;
        const serviceChargeAmount = (cardAmount * serviceChargePercent) / 100;
        
        updated.serviceChargeAmount = serviceChargeAmount.toFixed(2);
      } else {
        updated.serviceChargePercent = '';
        updated.serviceChargeAmount = '';
      }
      
      return updated;
    });
  };

  // Handle Card Amount Change (to recalc service charge AND balance)
  const handleCardAmountChange = (value) => {
    setFormData(prev => {
      const updated = { ...prev, card: value };
      
      // If service charge is enabled, recalculate
      if (prev.isServiceCharge) {
        const cardAmount = Number(value) || 0;
        const serviceChargePercent = Number(prev.serviceChargePercent) || 0;
        const serviceChargeAmount = (cardAmount * serviceChargePercent) / 100;
        
        updated.serviceChargeAmount = serviceChargeAmount.toFixed(2);
      }
      
      // Recalculate balance
      const totalCollectedCash = Object.entries(denominations).reduce((sum, [denom, data]) => {
        return sum + ((Number(data.collect) || 0) * Number(denom));
      }, 0);
      
      const netAmt = Number(updated.netAmount) || 0;
      const upiAmt = Number(updated.upi) || 0;
      const cardAmt = Number(value) || 0;
      
      const totalPayment = totalCollectedCash + upiAmt + cardAmt;
      const balance = netAmt - totalPayment;
      
      updated.balance = balance.toString();
      updated.issuedCash = balance < 0 ? Math.abs(balance).toString() : '';
      
      return updated;
    });
  };

  // Handle Service Charge Percent Change
  const handleServiceChargePercentChange = (value) => {
    setFormData(prev => {
      const updated = { ...prev, serviceChargePercent: value };
      
      const cardAmount = Number(prev.card) || 0;
      const serviceChargePercent = Number(value) || 0;
      const serviceChargeAmount = (cardAmount * serviceChargePercent) / 100;
      
      updated.serviceChargeAmount = serviceChargeAmount.toFixed(2);
      
      return updated;
    });
  };

  // NEW FOCUS HANDLERS START HERE
  
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
        // Last field (1), move to UPI Amount
        if (upiRef.current) {
          upiRef.current.focus();
        }
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentIndex < denomSequence.length - 1) {
        const nextDenom = denomSequence[currentIndex + 1];
        if (collectFieldRefs.current[nextDenom]) {
          collectFieldRefs.current[nextDenom].focus();
        }
      } else if (currentIndex === denomSequence.length - 1) {
        // Last field (1), move to UPI Amount
        if (upiRef.current) {
          upiRef.current.focus();
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
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Move to UPI Bank field
      if (upiBankRef.current) {
        upiBankRef.current.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Move to Bill Discount field when pressing up from collect row
      if (billDiscountPercentRef.current) {
        billDiscountPercentRef.current.focus();
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

  // Handle keydown specifically for Bill Discount % field
  const handleBillDiscountKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const billAmount = Number(formData.billAmount) || 0;
      const discountPercent = Number(formData.billDiscountPercent) || 0;
      const discountAmount = (billAmount * discountPercent) / 100;
      const grandTotal = Math.round(billAmount - discountAmount);
      
      const roundOff = Number(formData.roudOff) || 0;
      const scrapAmount = Number(formData.scrapAmount) || 0;
      const salesReturn = Number(formData.salesReturn) || 0;
      const netAmount = (grandTotal + roundOff) - scrapAmount - salesReturn;
      
      setFormData(prev => ({
        ...prev,
        billDiscAmt: discountAmount.toFixed(2),
        granTotal: grandTotal.toFixed(2),
        netAmount: netAmount.toFixed(2)
      }));
      
      // Move to next field
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  // NEW: Handle keydown for UPI Bank field - move to UPI Amount
  const handleUPIBankKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (cardRef.current) {
        cardRef.current.focus();
      }
    }
  };

  // NEW: Handle keydown for UPI Amount field - move to Card Bank
  const handleUPIKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (upiBankRef.current) {
        upiBankRef.current.focus();
      }
    }
  };

  // NEW: Handle keydown for Card Bank field - move to Card Amount
const handleCardBankKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    // Focus on Is Card Charge checkbox
    if (serviceChargeCheckboxRef.current) {
      serviceChargeCheckboxRef.current.focus();
    }
  }
};

  // NEW: Handle keydown for Card Amount field - move to Service Charge or Save
  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (cardBankRef.current) {
        cardBankRef.current.focus();
      }
    }
  };

  // NEW: Handle keydown for Service Charge Checkbox
// NEW: Handle keydown for Service Charge Checkbox
const handleServiceChargeCheckboxKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    
    // If service charge is checked, move to percentage field
    if (formData.isServiceCharge) {
      if (serviceChargePercentRef.current) {
        serviceChargePercentRef.current.focus();
      }
    } else {
      // If service charge is NOT checked, move to Transport Charge checkbox
      if (transportChargeCheckboxRef.current) {
        transportChargeCheckboxRef.current.focus();
      }
    }
  }
};

const handleServiceChargeAmountKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    // Move to Transport Charge checkbox
    if (transportChargeCheckboxRef.current) {
      transportChargeCheckboxRef.current.focus();
    }
  }
};



// NEW: Handle keydown for Service Charge Percent field - move to Amount field
const handleServiceChargePercentKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    // Move to Service Charge Amount field
    if (serviceChargeAmountRef.current) {
      serviceChargeAmountRef.current.focus();
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
    
    if (!value.trim()) {
      handleInputChange('scrapAmount', '');
    } else if (value.length > 2) {
      fetchBillAmount(value, 'scrap');
    }
  };

  const handleSalesReturnBillNoChange = (e) => {
    const value = e.target.value;
    handleInputChange('salesReturnBillNo', value);
    
    if (!value.trim()) {
      handleInputChange('salesReturn', '');
    } else if (value.length > 2) {
      fetchBillAmount(value, 'salesReturn');
    }
  };

  const handleSave = () => {
    const receivedCash = Number(formData.receivedCash) || 0;
    const upi = Number(formData.upi) || 0;
    const card = Number(formData.card) || 0;
    const totalIssuedCash = Object.entries(denominations).reduce((sum, [denom, data]) => {
      return sum + ((Number(data.issue) || 0) * Number(denom));
    }, 0);
    const calculatedNetAmount = (receivedCash + upi + card) - totalIssuedCash;
    const formNetAmount = Number(formData.netAmount) || 0;
    if (calculatedNetAmount !== formNetAmount) {
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
    setConfirmSaveOpen(true);
  };

  const confirmSave = async () => {
    try {
      setIsSaving(true);
      const receivedCash = Number(formData.receivedCash) || 0;
      const upi = Number(formData.upi) || 0;
      const card = Number(formData.card) || 0;
      
      const totalIssuedCash = Object.entries(denominations).reduce((sum, [denom, data]) => {
        return sum + ((Number(data.issue) || 0) * Number(denom));
      }, 0);
      
      const calculatedNetAmount = (receivedCash + upi + card) - totalIssuedCash;
      
      const formNetAmount = Number(formData.netAmount) || 0;
      
      if (calculatedNetAmount !== formNetAmount) {
        alert(' Bill Amount Mismatch. Please check the entered amounts.');
        return;
      }

      let dateToSend;
      if (formData.originalDate) {
        const dateObj = new Date(formData.originalDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        dateToSend = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        dateToSend = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
      }
      
      const payload = {
        invoiceNo: formData.billNo,
        date: dateToSend,
        billAmount: Number(formData.granTotal) || 0,
        givenTotal: Number(formData.receivedCash) || 0,
        balanceGiven: Number(formData.issuedCash) || 0,
        fCompCode: userData?.companyCode || '001',
        fGrossAMT: Number(formData.grossAmt) || 0,
        fitemAMT: Number(formData.itemDAmt) || 0,
        fBilDIS: Number(formData.billDiscountPercent) || 0,
        fdisAmt: Number(formData.billDiscAmt) || 0,
        froundoFf: Number(formData.roudOff) || 0,
        fScrapBillNo: formData.scrapAmountBillNo || '',
        fscrapAMT: Number(formData.scrapAmount) || 0,
        fsaleBillNO: formData.salesReturnBillNo || '',
        fSalesAMT: Number(formData.salesReturn) || 0,
        fIssueCash: Number(formData.issuedCash) || 0,
        fupi: Number(formData.upi) || 0,
        fcard: Number(formData.card) || 0,
        fcardcode: cardBank?.fCode || '',   // Card Bank
        fupIcode: upiBank?.fCode || '',     // UPI Bank
        balanceAmt: balanceAmt,
        servicechrge: formData.serviceChargePercent || 0,
        servicechrgeAmt: formData.serviceChargeAmount || 0,
        collect: {
          r500: Number(denominations[500].collect) || 0,
          r200: Number(denominations[200].collect) || 0,
          r100: Number(denominations[100].collect) || 0,
          r50: Number(denominations[50].collect) || 0,
          r20: Number(denominations[20].collect) || 0,
          r10: Number(denominations[10].collect) || 0,
          r5: Number(denominations[5].collect) || 0,
          r2: Number(denominations[2].collect) || 0,
          r1: Number(denominations[1].collect) || 0
        },
        issue: {
          r500: Number(denominations[500].issue) || 0,
          r200: Number(denominations[200].issue) || 0,
          r100: Number(denominations[100].issue) || 0,
          r50: Number(denominations[50].issue) || 0,
          r20: Number(denominations[20].issue) || 0,
          r10: Number(denominations[10].issue) || 0,
          r5: Number(denominations[5].issue) || 0,
          r2: Number(denominations[2].issue) || 0,
          r1: Number(denominations[1].issue) || 0
        }
      };

      const response = await apiService.post(
        'BillCollector/InsertTender',
        payload
      );
    console.log(JSON.stringify(payload));
      if (response) {
        setConfirmSaveOpen(false);
        
        const resetFormData = {
          billNo: '',
          salesman: '',
          date: '',
          originalDate: '',
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
          upiBank: '',
          cardBank: '',
          serviceChargePercent: '',
          serviceChargeAmount: '',
          isServiceCharge: false,
          isCreditBill: false,
          delivery: false,
          balance: '',
        };
        
        setFormData(resetFormData);
        
        setDenominations(prev => ({
          500: { ...prev[500], collect: '', issue: '', closing: prev[500].available },
          200: { ...prev[200], collect: '', issue: '', closing: prev[200].available },
          100: { ...prev[100], collect: '', issue: '', closing: prev[100].available },
          50: { ...prev[50], collect: '', issue: '', closing: prev[50].available },
          20: { ...prev[20], collect: '', issue: '', closing: prev[20].available },
          10: { ...prev[10], collect: '', issue: '', closing: prev[10].available },
          5: { ...prev[5], collect: '', issue: '', closing: prev[5].available },
          2: { ...prev[2], collect: '', issue: '', closing: prev[2].available },
          1: { ...prev[1], collect: '', issue: '', closing: prev[1].available },
        }));
        
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        
        if (onClose) {
          onClose();
        }
        
        setTimeout(() => {
          if (billDiscountPercentRef.current) {
            billDiscountPercentRef.current.focus();
          }
        }, 0);
      } else {
        setConfirmSaveOpen(false);
        alert('Failed to save tender details: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving tender:', error);
      setConfirmSaveOpen(false);
      alert('Error: ' + (error.response?.data?.message || error.message || 'Failed to save tender'));
    } finally {
      setIsSaving(false);
    }
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
      issuedCash: '',
      upi: '',
      card: '',
      upiBank: '',
      cardBank: '',
      serviceChargePercent: '',
      serviceChargeAmount: '',
      isServiceCharge: false,
      isCreditBill: false,
      delivery: false,
      balance: billData?.amount ? billData.amount.toString() : '',
    });
    setDenominations(prev => ({
      500: { ...prev[500], collect: '', issue: '' },
      200: { ...prev[200], collect: '', issue: '' },
      100: { ...prev[100], collect: '', issue: '' },
      50: { ...prev[50], collect: '', issue: '' },
      20: { ...prev[20], collect: '', issue: '' },
      10: { ...prev[10], collect: '', issue: '' },
      5: { ...prev[5], collect: '', issue: '' },
      2: { ...prev[2], collect: '', issue: '' },
      1: { ...prev[1], collect: '', issue: '' },
    }));
    if (billDiscountPercentRef && billDiscountPercentRef.current) {
      billDiscountPercentRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        // When either popup is open, avoid closing the Tender modal by outer overlay clicks
        if (upiPopupOpen || cardPopupOpen) {
          e.stopPropagation();
          return;
        }
        onClose();
      }}
    >
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
                      onKeyDown={(e) => handleBillDiscountKeyDown(e, roundOffRef)}
                      className={styles.inputField}
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
                      onChange={handleScrapBillNoChange}
                      onKeyDown={(e) => handleFormFieldKeyDown(e, salesReturnBillNoRef)}
                      className={styles.inputField}
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
              <div className={styles.checkboxRow}>
                {/* <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.isServiceCharge}
                      onChange={(e) => handleInputChange('isServiceCharge', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>Service</span>
                  </label>
                </div> */}
                
                {/* <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.delivery}
                      onChange={(e) => handleInputChange('delivery', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>Delivery</span>
                  </label>
                </div> */}
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
                          ref={(el) => (collectFieldRefs.current[denom] = el)}
                          type="number"
                          value={denominations[denom].collect}
                          onChange={(e) => handleDenominationChange(denom, 'collect', e.target.value)}
                          onKeyDown={(e) => handleCollectFieldKeyDown(e, denom)}
                          className={styles.tableInput}
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


              {/* Bottom: Payment Details (Updated Rows) */}
              <div className={styles.paymentSection}>
                {/* First Row: Received Cash, Issued Cash, Balance */}
                <div className={styles.paymentRow}>
                  <div className={styles.paymentGroup}>
                    <label className={styles.paymentLabel}>Received Cash</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        type="number"
                        value={formData.receivedCash === '0' ? '' : formData.receivedCash}
                        readOnly
                        className={`${styles.paymentInput} ${styles.readonlyPayment}`}
                      />
                    </div>
                  </div>
                  <div className={styles.paymentGroup}>
                    <label className={styles.paymentLabel}>Issued Cash</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        type="text"
                        value={formData.issuedCash === '0' ? '' : formData.issuedCash}
                        readOnly
                        className={`${styles.paymentInput} ${styles.readonlyPayment}`}
                      />
                    </div>
                  </div>
                  <div className={styles.paymentGroup}>
                    <label className={styles.paymentLabel}>Balance</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        type="text"
                        value={formData.balance}
                        readOnly
                        className={`${styles.paymentInput} ${styles.readonlyPayment} ${Number(formData.balance) < 0 ? styles.negativeBalance : ''}`}
                        title="Net Amount - (Cash Collected + UPI + Card)"
                      />
                    </div>
                  </div>
                </div>

                {/* Second Row: UPI Amount, UPI Bank */}
                <div className={styles.paymentRow}>
                  <div className={styles.paymentGroup}>
                    <label className={styles.paymentLabel}>UPI Amount</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        ref={upiRef}
                        type="number"
                        value={formData.upi}
                        onChange={(e) => handleInputChange('upi', e.target.value)}
                        onKeyDown={handleUPIKeyDown}
                        className={styles.paymentInput}
                      />
                    </div>
                  </div>
                  <div className={styles.paymentGroup}>
                    <label className={styles.paymentLabel}>UPI Bank</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        ref={upiBankRef}
                        type="text"
                        value={formData.upiBank}
                        onChange={(e) => handleInputChange('upiBank', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                            e.preventDefault();
                            e.stopPropagation();
                            setUpiPopupInitialSearch(e.key);
                            setUpiPopupOpen(true);
                          } else {
                            handleUPIBankKeyDown(e);
                          }
                        }}
                        placeholder=""
                        className={styles.paymentInput}
                        onClick={() => { setUpiPopupInitialSearch(''); setUpiPopupOpen(true); }}
                      />
                    </div>
                  </div>
                </div>

                {/* Third Row: Card Amount, Card Bank, Is Service Charge */}
                <div className={styles.paymentRow}>
                  <div className={styles.paymentGroup}>
                    <label className={styles.paymentLabel}>Card Amount</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        ref={cardRef}
                        type="number"
                        value={formData.card}
                        onChange={(e) => handleCardAmountChange(e.target.value)}
                        onKeyDown={handleCardKeyDown}
                        className={styles.paymentInput}
                      />
                    </div>
                  </div>
                  <div className={styles.paymentGroup}>
                    <label className={styles.paymentLabel}>Card Bank</label>
                    <div className={styles.paymentInputContainer}>
                      <input
                        ref={cardBankRef}
                        type="text"
                        value={formData.cardBank}
                        onChange={(e) => handleInputChange('cardBank', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                            e.preventDefault();
                            e.stopPropagation();
                            setCardPopupInitialSearch(e.key);
                            setCardPopupOpen(true);
                          } else {
                            handleCardBankKeyDown(e);
                          }
                        }}
                        onClick={() => { setCardPopupInitialSearch(''); setCardPopupOpen(true); }}
                        placeholder=""
                        className={styles.paymentInput}
                      />
                    </div>
                  </div>
                  <div className={styles.paymentGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        ref={serviceChargeCheckboxRef}
                        type="checkbox"
                        checked={formData.isServiceCharge}
                        onChange={handleServiceChargeToggle}
                     onKeyDown={handleServiceChargeCheckboxKeyDown}
                        className={styles.checkbox}
                      />
                      <span>Is Card Charge</span>
                    </label>
               {formData.isServiceCharge && (
  <div className={styles.serviceChargeContainer}>
    <input
      ref={serviceChargePercentRef}
      type="number"
      value={formData.serviceChargePercent}
      onChange={(e) => handleServiceChargePercentChange(e.target.value)}
      onKeyDown={handleServiceChargePercentKeyDown}
      placeholder=""
      className={styles.serviceChargeInput}
    />
    <span>%</span>
    <input
      ref={serviceChargeAmountRef}  
      type="number"
      value={formData.serviceChargeAmount === '0.00' || formData.serviceChargeAmount === '0' ? '' : formData.serviceChargeAmount}
      onChange={(e) => handleInputChange('serviceChargeAmount', e.target.value)} 
      onKeyDown={handleServiceChargeAmountKeyDown}  
      className={styles.serviceChargeInput} 
      placeholder=""
    />
  </div>
)}
                  </div>
                  {/* Transport Charge Checkbox and Fields */}
                  <div className={styles.paymentGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        ref={transportChargeCheckboxRef}
                        type="checkbox"
                        checked={formData.isTransportCharge}
                        onChange={handleTransportChargeToggle}
                        onKeyDown={handleTransportChargeCheckboxKeyDown}
                        className={styles.checkbox}
                      />
                      <span>Is Transport Charge</span>
                    </label>
                    {formData.isTransportCharge && (
                      <div className={styles.serviceChargeContainer}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <label style={{ fontSize: '12px', marginBottom: '2px' }}>Transport</label>
                            <input
                              ref={transportChargePercentRef}
                              type="text"
                              value={formData.transport}
                              onChange={(e) => handleTransportChange(e.target.value)}
                              onKeyDown={handleTransportChargePercentKeyDown}
                              placeholder=""
                              className={styles.serviceChargeInput}
                            />
                          </div>
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
  <label style={{ fontSize: '12px', marginBottom: '2px' }}>TC Charge</label>
  <input
    ref={transportAmountRef}
    type="number"
    value={formData.transportAmount === '0.00' || formData.transportAmount === '0' ? '' : formData.transportAmount}
    onChange={(e) => handleTransportAmountChange(e.target.value)}
    onKeyDown={handleTransportAmountKeyDown}
    placeholder=""
    className={styles.serviceChargeInput}
  />
</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fourth Row: Is Credit Bill */}
                <div className={styles.paymentRow}>
                  {/* <div className={styles.paymentGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isCreditBill}
                        onChange={(e) => handleInputChange('isCreditBill', e.target.checked)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (saveButtonRef.current) {
                              saveButtonRef.current.focus();
                            }
                          }
                        }}
                        className={styles.checkbox}
                      />
                      <span>Is Credit Bill</span>
                    </label>
                  </div> */}
                </div>
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

      {/* Validation Popup */}
      <ConfirmationPopup
        isOpen={validationPopup.isOpen}
        title={validationPopup.title}
        message={validationPopup.message}
        type={validationPopup.type}
        confirmText={validationPopup.confirmText}
        cancelText={validationPopup.cancelText}
        onConfirm={(e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          setValidationPopup(p => ({ ...p, isOpen: false }));
        }}
        onClose={(e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          setValidationPopup(p => ({ ...p, isOpen: false }));
        }}
        isLoading={validationPopup.isLoading}
      />
      {/* Save Confirmation Popup */}
      <ConfirmationPopup
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={confirmSave}
        title="Save Tender"
        message={`Do you want to save?`}
        type="success"
        confirmText={isSaving ? "Saving..." : "Yes"}
        cancelText="No"
        showLoading={isSaving}
        disableBackdropClose={isSaving}
      />


      <PopupListSelector
        open={upiPopupOpen}
        onClose={() => { setUpiPopupOpen(false); setUpiPopupInitialSearch(''); }}
        initialSearch={upiPopupInitialSearch}
        title="Select UPI Bank"
        fetchItems={fetchBankList}
        displayFieldKeys={['fAcname']}
        searchFields={['fAcname']}
        headerNames={['UPI Bank Name']}
        onSelect={(item) => {
          setUpiBank(item); // for fCode
          setFormData(prev => ({
            ...prev,
            upiBank: item.fAcname   // ✅ SHOW in input
          }));
          setUpiPopupInitialSearch('');
          setUpiPopupOpen(false);
        }}
      />

      <PopupListSelector
        open={cardPopupOpen}
        onClose={() => { setCardPopupOpen(false); setCardPopupInitialSearch(''); }}
        initialSearch={cardPopupInitialSearch}
        title="Select Card Bank"
        fetchItems={fetchBankList}
        displayFieldKeys={['fAcname']}
        searchFields={['fAcname']}
        headerNames={['Card Bank Name']}
        onSelect={(item) => {
          setCardBank(item); // for fCode
          setFormData(prev => ({
            ...prev,
            cardBank: item.fAcname  // ✅ SHOW in input
          }));
          setCardPopupInitialSearch('');
          setCardPopupOpen(false);
        }}
      />


    </div>
  );
};

export default TenderModal;