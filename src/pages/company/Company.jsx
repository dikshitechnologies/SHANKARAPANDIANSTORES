import React, { useState, useEffect, useRef, useMemo } from "react";
import './Company.css';
import apiService from "../../api/apiService";
import { API_ENDPOINTS } from '../../api/endpoints';
import PopupListSelector from "../../components/Listpopup/PopupListSelector";
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup.jsx';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AddButton, EditButton, DeleteButton } from "../../components/Buttons/ActionButtons";

// --- SVG Icons ---
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
  </svg>
);

const Company = () => {
  const [selectedAction, setSelectedAction] = useState("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({
    fcompcode: "",
    fcompname: "",
    tngst: "",
    state: "",
    phone1: "",
    phone2: "",
    statecode: "",
    phone3: "",
    phone4: "",
    fcompadd1: "",
    fcompadd2: "",
    fcompadd3: "",
    fprintname: "",
    fusername: "",
    fdescription: "",
    fprintgap: "",
    fpassword: "",
    fconfirmpass: "",
    fprefix: "",
    fdefaultmode: "",
    note1: "",
    note2: "",
    note3: "",
    note4: "",
    note5: "",
    bankname: "",
    branch: "",
    ifscode: "",
    accno: "",
    printing: "",
    gstmode: "",
    salesrate: "",
    salestype: "",
    tagprint: "",
    billprefix: "",
    template: "",
    noofprint: "",
    message: "",
    jewellerysales: "",
    senderid: "",
    lessqty: "",
    qtyformat: "",
    barcode: "",
    balinsales: "",
    calculation: "",
    showstock: "",
    cpinsales: "",
    backuppath: "",
    cpcode: "",
    backupdbi: "",
    desc1: "",
    // Pseudo fields - each accepts one character
    pseudo1: "",
    pseudo2: "",
    pseudo3: "",
    pseudo4: "",
    pseudo5: "",
    pseudo6: "",
    pseudo7: "",
    pseudo8: "",
    pseudo9: "",
    pseudo10: ""
  });
  const [narrationToggle, setNarrationToggle] = useState("N");
  const [companycolor, setCompanyColor] = useState("#ff0000");
  const [addresscolor, setAddressColor] = useState("#00ff00");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMode, setPopupMode] = useState("");
  
  // Message state for inline errors
  const [message, setMessage] = useState(null);
  
  // Confirmation popup states
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    type: "default",
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: "Confirm",
    cancelText: "Cancel"
  });

  // === PERMISSION SETUP ===
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    Add: hasAddPermission(PERMISSION_CODES.COMPANY_CREATION),
    Edit: hasModifyPermission(PERMISSION_CODES.COMPANY_CREATION),
    Delete: hasDeletePermission(PERMISSION_CODES.COMPANY_CREATION)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);
  
  // Debug: Check what permissions are actually being used
  useEffect(() => {
    console.log('=== COMPANY PERMISSIONS DEBUG ===');
    console.log('PERMISSION_CODES.COMPANY_CREATION:', PERMISSION_CODES.COMPANY_CREATION);
    console.log('formPermissions object:', formPermissions);
    console.log('formPermissions.Add:', formPermissions.Add, 'type:', typeof formPermissions.Add);
    console.log('formPermissions.Edit:', formPermissions.Edit, 'type:', typeof formPermissions.Edit);
    console.log('formPermissions.Delete:', formPermissions.Delete, 'type:', typeof formPermissions.Delete);
    console.log('hasAddPermission result:', hasAddPermission(PERMISSION_CODES.COMPANY_CREATION));
    console.log('hasModifyPermission result:', hasModifyPermission(PERMISSION_CODES.COMPANY_CREATION));
    console.log('hasDeletePermission result:', hasDeletePermission(PERMISSION_CODES.COMPANY_CREATION));
  }, [formPermissions]);

  // Refs for keyboard navigation (including pseudo fields)
  const companyNameRef = useRef(null);
  const gstinRef = useRef(null);
  const phone1Ref = useRef(null);
  const stateRef = useRef(null);
  const phone2Ref = useRef(null);
  const statecodeRef = useRef(null);
  const phone3Ref = useRef(null);
  const phone4Ref = useRef(null);
  const shopNoRef = useRef(null);
  const addressRef = useRef(null);
  const address1Ref = useRef(null);
  const address2Ref = useRef(null);
  const printerNameRef = useRef(null);
  const usernameRef = useRef(null);
  const descriptionRef = useRef(null);
  const printgapRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const prefixRef = useRef(null);
  const defaultModeRef = useRef(null);
  const note1Ref = useRef(null);
  const note2Ref = useRef(null);
  const note3Ref = useRef(null);
  const note4Ref = useRef(null);
  const note5Ref = useRef(null);
  const bankNameRef = useRef(null);
  const branchRef = useRef(null);
  const ifsCodeRef = useRef(null);
  const accountNumberRef = useRef(null);
  const printingRef = useRef(null);
  const gstModeRef = useRef(null);
  const salesRateRef = useRef(null);
  const salesTypeRef = useRef(null);
  const tagPrintRef = useRef(null);
  const billPrefixRef = useRef(null);
  const templateRef = useRef(null);
  const numberOfPrintRef = useRef(null);
  const messageRef = useRef(null);
  const jewellerySalesRef = useRef(null);
  const narrationRef = useRef(null);
  const senderIdRef = useRef(null);
  const lessQuantityRef = useRef(null);
  const quantityFormatRef = useRef(null);
  const barcodeRef = useRef(null);
  const balInSalesRef = useRef(null);
  const calculationRef = useRef(null);
  const showStockRef = useRef(null);
  const cpInSalesRef = useRef(null);
  const backupPathRef = useRef(null);
  const cpCodeRef = useRef(null);
  const backupDbiRef = useRef(null);
  const desc1Ref = useRef(null);
  
  // Refs for pseudo fields
  const pseudo1Ref = useRef(null);
  const pseudo2Ref = useRef(null);
  const pseudo3Ref = useRef(null);
  const pseudo4Ref = useRef(null);
  const pseudo5Ref = useRef(null);
  const pseudo6Ref = useRef(null);
  const pseudo7Ref = useRef(null);
  const pseudo8Ref = useRef(null);
  const pseudo9Ref = useRef(null);
  const pseudo10Ref = useRef(null);
  const submitRef = useRef(null);

  // Create a refs array for easier navigation - in the exact order they appear in the form
  const inputRefs = useMemo(() => [
    companyNameRef, // Company Name
    gstinRef,       // GSTIN
    stateRef,       // State
    statecodeRef,   // State Code
    phone1Ref,      // Phone 1
    phone2Ref,      // Phone 2
    phone3Ref,      // Phone 3
    addressRef,     // Address 1
    address1Ref,    // Address 2
    address2Ref,    // Address 3
    printerNameRef, // Print Name
    usernameRef,    // User Name
    passwordRef,    // Password
    confirmPasswordRef, // Confirm Password
    descriptionRef, // Description
    printgapRef,    // Print GAP
    prefixRef,      // Prefix
    defaultModeRef, // Default Mode
    billPrefixRef,  // Bill Prefix
    // Pseudo fields
    pseudo1Ref, pseudo2Ref, pseudo3Ref, pseudo4Ref, pseudo5Ref,
    pseudo6Ref, pseudo7Ref, pseudo8Ref, pseudo9Ref, pseudo10Ref,
    note1Ref, note2Ref, note3Ref, note4Ref, note5Ref,
    bankNameRef, branchRef, ifsCodeRef, accountNumberRef,
    printingRef, gstModeRef, salesRateRef, salesTypeRef,
    tagPrintRef, templateRef, numberOfPrintRef, messageRef,
    jewellerySalesRef, senderIdRef, lessQuantityRef,
    quantityFormatRef, barcodeRef, balInSalesRef, calculationRef,
    showStockRef, cpInSalesRef, backupPathRef, cpCodeRef,
    backupDbiRef, desc1Ref
  ], []);

  // Pseudo field refs array
  const pseudoRefs = useMemo(() => [
    pseudo1Ref, pseudo2Ref, pseudo3Ref, pseudo4Ref, pseudo5Ref,
    pseudo6Ref, pseudo7Ref, pseudo8Ref, pseudo9Ref, pseudo10Ref
  ], []);

  // ✅ Fetch next code
  const fetchNextCode = async () => {
    try {
      const res = await apiService.get(API_ENDPOINTS.COMPANY_ENDPOINTS.NEXT_COMPANY_CODE);
      const cleanCode = typeof res === "string" ? res.trim() : res;
      setFormData(prev => ({ ...prev, fcompcode: cleanCode }));
    } catch (err) {
      console.error("Error fetching next code:", err);
    }
  };

  // ✅ Fetch company list
  const fetchCompanyList = async () => {
    try {
      const res = await apiService.get(API_ENDPOINTS.COMPANY_ENDPOINTS.GET_COMPANY_LIST);
      const formatted = res.map((item) => ({
        code: item.fcompcode,
        name: item.fcompname,
        originalData: item
      }));
      setTableData(formatted);
    } catch (err) {
      console.error("Error fetching company list:", err);
    }
  };

  const fetchCompaniesForPopup = async (pageNum, searchText) => {
    try {
      const res = await apiService.get(API_ENDPOINTS.COMPANY_ENDPOINTS.GET_COMPANY_LIST);
      const formatted = res.map((item) => ({
        code: item.fcompcode || '',
        name: item.fcompname || ''
      }));
      
      if (searchText) {
        return formatted.filter(item =>
          item.code.toLowerCase().includes(searchText.toLowerCase()) ||
          item.name.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      return formatted.slice((pageNum - 1) * 20, pageNum * 20);
    } catch (err) {
      console.error("Error fetching companies for popup:", err);
      return [];
    }
  };

  // ✅ Fetch company details
  const fetchCompanyDetails = async (compCode) => {
    try {
      console.log("Fetching details for company code:", compCode);
      const res = await apiService.get(API_ENDPOINTS.COMPANY_ENDPOINTS.GET_COMPANY_DETAILS(compCode));
      
      let company = null;
      if (!res) return;
      if (res.data && !Array.isArray(res.data) && typeof res.data === 'object') {
        company = res.data;
      } else if (Array.isArray(res) && res.length > 0) {
        company = res[0];
      } else if (Array.isArray(res.data) && res.data.length > 0) {
        company = res.data[0];
      } else if (typeof res === 'object') {
        company = res;
      }

      if (!company) {
        console.warn('No company details found for', compCode, res);
        return;
      }

      // Extract pseudo code (10 characters) and split into individual fields
      const pseudoCode = company.pseudoCode || company.pseudo || "";
      
      setFormData({
        fcompcode: company.compCode || company.compcode || "",
        fcompname: company.compName || company.compname || "",
        tngst: company.gstinNO || company.gstin || "",
        state: company.state || "",
        phone1: company.phonE1 || company.phon1 || "",
        phone2: company.phonE2 || "",
        statecode: company.stateCode || company.statecode || "",
        phone3: company.phonE3 || "",
        fcompadd1: company.address ||  "",
        fcompadd2: company.address2 || "",
        fcompadd3: company.address3 || "",
        fprintname: company.printName || "",
        fusername: company.userName || company.userName || "",
        fdescription: company.description || "",
        fprintgap: company.printGAP || company.printGap || "",
        fpassword: company.password || "",
        fconfirmpass: company.password || "",
        fprefix: company.prefix || "",
        fdefaultmode: company.defultMode ||"T",
        note1: company.note1 || "",
        note2: company.note2 || "",
        note3: company.note3 || "",
        note4: company.note4 || "",
        note5: company.note5 || "",
        bankname: company.bankName || "",
        branch: company.branchName || "",
        ifscode: company.ifsCode || "",
        accno: company.accountNumber || "",
        printing: company.print || "",
        gstmode: company.gstType || "",
        salesrate: company.salesRate || "",
        salestype: company.salType || company.salesType || "",
        tagprint: company.tagPrint || "",
        billprefix: company.billprefix || company.billPrefix || "",
        template: company.template || "",
        noofprint: company.noOfPrint != null ? String(company.noOfPrint) : "",
        message: company.message || "",
        jewellerysales: company.jewellSales || "N",
        senderid: company.senderID || "",
        lessqty: company.flessqty || "N",
        qtyformat: company.qtyFormat || "",
        barcode: company.barcode || "N",
        balinsales: company.balInSales || "N",
        calculation: company.calculation || "",
        showstock: company.stock || "N",
        cpinsales: company.cpinsales || "N",
        backuppath: company.bkDrivepath || "",
        cpcode: company.cpCode || "",
        backupdbi: company.backupDBI || "",
        desc1: company.desc1 || "",
        // Split pseudo code into individual fields - try API fields first (fseudo1-fseudo10), then split pseudoCode
        pseudo1: company.fseudo1 || (pseudoCode.length > 0 ? pseudoCode[0] : ""),
        pseudo2: company.fseudo2 || (pseudoCode.length > 1 ? pseudoCode[1] : ""),
        pseudo3: company.fseudo3 || (pseudoCode.length > 2 ? pseudoCode[2] : ""),
        pseudo4: company.fseudo4 || (pseudoCode.length > 3 ? pseudoCode[3] : ""),
        pseudo5: company.fseudo5 || (pseudoCode.length > 4 ? pseudoCode[4] : ""),
        pseudo6: company.fseudo6 || (pseudoCode.length > 5 ? pseudoCode[5] : ""),
        pseudo7: company.fseudo7 || (pseudoCode.length > 6 ? pseudoCode[6] : ""),
        pseudo8: company.fseudo8 || (pseudoCode.length > 7 ? pseudoCode[7] : ""),
        pseudo9: company.fseudo9 || (pseudoCode.length > 8 ? pseudoCode[8] : ""),
        pseudo10: company.fseudo10 || (pseudoCode.length > 9 ? pseudoCode[9] : "")
      });
      // Focus management based on selected action
      setTimeout(() => {
        if (selectedAction === "delete") {
          // When in delete mode, focus on the Delete button
          if (submitRef.current) {
            submitRef.current.focus();
          }
        } else {
          // When in edit mode, focus on Company Name field
          if (companyNameRef.current) {
            companyNameRef.current.focus();
          }
        }
      }, 500);
      setCompanyColor(company.companyPrintColor || company.companyprintcolor || "#ff0000");
      setAddressColor(company.printAddressColor || company.printaddresscolor || "#00ff00");
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  useEffect(() => {
    fetchNextCode();
    fetchCompanyList();
  }, []);

  useEffect(() => {
    if (companyNameRef.current && selectedAction !== "delete") {
      companyNameRef.current.focus();
    }
  }, [selectedAction]);

  const clearForm = () => {
    setFormData({
      fcompcode: "",
      fcompname: "",
      tngst: "",
      state: "",
      phone1: "",
      phone2: "",
      statecode: "",
      phone3: "",
      phone4: "",
      fcompadd1: "",
      fcompadd2: "",
      fcompadd3: "",
      fprintname: "",
      fusername: "",
      fdescription: "",
      fprintgap: "",
      fpassword: "",
      fconfirmpass: "",
      fprefix: "",
      fdefaultmode: "",
      note1: "",
      note2: "",
      note3: "",
      note4: "",
      note5: "",
      bankname: "",
      branch: "",
      ifscode: "",
      accno: "",
      printing: "",
      gstmode: "",
      salesrate: "",
      salestype: "",
      tagprint: "",
      billprefix: "",
      template: "",
      noofprint: "",
      message: "",
      jewellerysales: "",
      senderid: "",
      lessqty: "",
      qtyformat: "",
      barcode: "",
      balinsales: "",
      calculation: "",
      showstock: "",
      cpinsales: "",
      backuppath: "",
      cpcode: "",
      backupdbi: "",
      desc1: "",
      // Clear pseudo fields
      pseudo1: "",
      pseudo2: "",
      pseudo3: "",
      pseudo4: "",
      pseudo5: "",
      pseudo6: "",
      pseudo7: "",
      pseudo8: "",
      pseudo9: "",
      pseudo10: ""
    });
    setCompanyColor("#ff0000");
    setAddressColor("#00ff00");
    fetchNextCode();
    setSelectedAction("create");
    
    setTimeout(() => {
      if (companyNameRef.current) {
        companyNameRef.current.focus();
      }
    }, 100);
  };

  const handleTableRowClick = (item) => {
    fetchCompanyDetails(item.code);
    setSelectedAction("edit");
  };

  // Enhanced keyboard navigation handler for all fields
  const handleKeyDown = (e, fieldName = null) => {
    // Find current input index
    const currentIndex = inputRefs.findIndex(ref => ref.current === document.activeElement);
    if (currentIndex === -1) return;

    // Navigation map for special fields
    // Company Code (first field): left/up = focus Submit, right/down = next field
    // Submit button: right/down = focus Company Code, left/up = last pseudo field
    const isCompanyCode = fieldName === 'fcompcode' || inputRefs[currentIndex] === inputRefs[0];
    const isSubmitButton = fieldName === 'submit' || inputRefs[currentIndex] === submitRef;

    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to next field
      if (currentIndex < inputRefs.length - 1) {
        inputRefs[currentIndex + 1].current && inputRefs[currentIndex + 1].current.focus();
      } else if (submitRef.current) {
        submitRef.current.focus();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (isCompanyCode) {
        // Company Code: right arrow moves to next field
        if (inputRefs[1] && inputRefs[1].current) inputRefs[1].current.focus();
      } else if (isSubmitButton) {
        // Submit: right arrow moves to Company Code
        if (inputRefs[0] && inputRefs[0].current) inputRefs[0].current.focus();
      } else if (currentIndex < inputRefs.length - 1) {
        inputRefs[currentIndex + 1].current && inputRefs[currentIndex + 1].current.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (isCompanyCode) {
        // Company Code: left arrow moves to Submit
        if (submitRef.current) submitRef.current.focus();
      } else if (isSubmitButton) {
        // Submit: left arrow moves to last pseudo field
        if (pseudoRefs[pseudoRefs.length - 1] && pseudoRefs[pseudoRefs.length - 1].current) pseudoRefs[pseudoRefs.length - 1].current.focus();
      } else if (currentIndex > 0) {
        inputRefs[currentIndex - 1].current && inputRefs[currentIndex - 1].current.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isCompanyCode) {
        // Company Code: down arrow moves to next field
        if (inputRefs[1] && inputRefs[1].current) inputRefs[1].current.focus();
      } else if (isSubmitButton) {
        // Submit: down arrow moves to Company Code
        if (inputRefs[0] && inputRefs[0].current) inputRefs[0].current.focus();
      } else if (currentIndex < inputRefs.length - 1) {
        inputRefs[currentIndex + 1].current && inputRefs[currentIndex + 1].current.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isCompanyCode) {
        // Company Code: up arrow moves to Submit
        if (submitRef.current) submitRef.current.focus();
      } else if (isSubmitButton) {
        // Submit: up arrow moves to last pseudo field
        if (pseudoRefs[pseudoRefs.length - 1] && pseudoRefs[pseudoRefs.length - 1].current) pseudoRefs[pseudoRefs.length - 1].current.focus();
      } else if (currentIndex > 0) {
        inputRefs[currentIndex - 1].current && inputRefs[currentIndex - 1].current.focus();
      }
    }
    // For toggle fields (Y/N fields), handle spacebar
    else if (e.key === ' ' && fieldName && ['fdescription', 'fprintgap'].includes(fieldName)) {
      e.preventDefault();
      handleInputChange(fieldName, formData[fieldName] === "N" ? "Y" : formData[fieldName] === "Y" ? "N" : "N");
    }else if (e.key === ' ' && fieldName && ['fdefaultmode'].includes(fieldName)) {
      e.preventDefault();
      handleInputChange(fieldName, formData[fieldName] === "N" ? "T" : formData[fieldName] === "T" ? "N" : "N");
    }
  };

  // Handle pseudo field input - only allow alphanumeric characters
  const handlePseudoInput = (field, value, pseudoIndex) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Only take the first character
    const singleChar = cleanValue.charAt(0);
    
    setFormData(prev => ({
      ...prev,
      [field]: singleChar
    }));
    
    // Auto-focus to next field if a character is entered
    if (singleChar && cleanValue.length > 0 && pseudoIndex < pseudoRefs.length - 1) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        const nextRef = pseudoRefs[pseudoIndex + 1];
        if (nextRef && nextRef.current) {
          nextRef.current.focus();
          nextRef.current.select();
        }
      }, 10);
    }
  };

  // Special key handler for pseudo fields
  const handlePseudoKeyDown = (e, pseudoIndex) => {
    // Arrow navigation for pseudo fields
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      // Move to next pseudo field if not last, else move to Submit button
      if (pseudoIndex < pseudoRefs.length - 1) {
        pseudoRefs[pseudoIndex + 1].current && pseudoRefs[pseudoIndex + 1].current.focus();
      } else {
        // Move to Submit button
        if (submitRef.current) submitRef.current.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      // Move to previous pseudo field if not first, else move to Bill Prefix
      if (pseudoIndex > 0) {
        pseudoRefs[pseudoIndex - 1].current && pseudoRefs[pseudoIndex - 1].current.focus();
      } else {
        // Move to Bill Prefix input
        if (billPrefixRef.current) billPrefixRef.current.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Move to next pseudo field if not last, else move to Submit button
      if (pseudoIndex < pseudoRefs.length - 1) {
        pseudoRefs[pseudoIndex + 1].current && pseudoRefs[pseudoIndex + 1].current.focus();
      } else {
        // Move to Submit button
        if (submitRef.current) submitRef.current.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Move to previous pseudo field if not first, else move to Bill Prefix
      if (pseudoIndex > 0) {
        pseudoRefs[pseudoIndex - 1].current && pseudoRefs[pseudoIndex - 1].current.focus();
      } else {
        // Move to Bill Prefix input
        if (billPrefixRef.current) billPrefixRef.current.focus();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Enter acts like ArrowRight
      if (pseudoIndex < pseudoRefs.length - 1) {
        pseudoRefs[pseudoIndex + 1].current && pseudoRefs[pseudoIndex + 1].current.focus();
      } else {
        if (submitRef.current) submitRef.current.focus();
      }
    }
    // else: allow other keys (Tab, etc.)
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Concatenate all pseudo fields into a single string
  const getPseudoCode = () => {
    const pseudoFields = [
      formData.pseudo1,
      formData.pseudo2,
      formData.pseudo3,
      formData.pseudo4,
      formData.pseudo5,
      formData.pseudo6,
      formData.pseudo7,
      formData.pseudo8,
      formData.pseudo9,
      formData.pseudo10
    ];
    
    return pseudoFields.join('');
  };

  const handleActionClick = (action) => {
    setSelectedAction(action);
    
    if (action === "edit" || action === "delete") {
      setPopupTitle(action === "edit" ? "Select Company to Edit" : "Select Company to Delete");
      setPopupMode(action);
      setShowPopup(true);
    } else if (action === "create") {
      clearForm();
      fetchNextCode();
    }
  };

  const handlePopupSelect = (item) => {
    console.log("Selected company from popup:", item);
    fetchCompanyDetails(item.code);
    setShowPopup(false);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const validateForm = () => {
    // Perform fresh validation on the current formData
    if (!formData.fcompname.trim()) {
      return { isValid: false, message: "Please enter Company Name" };
    }
    
    if (!formData.fusername.trim()) {
      return { isValid: false, message: "Please enter UserName" };
    }
    if (!formData.fpassword.trim()) {
      return { isValid: false, message: "Please enter Password" };
    }
    if (formData.fpassword !== formData.fconfirmpass) {
      return { isValid: false, message: "Password and Confirm Password do not match" };
    }
    
    
    return { isValid: true, message: "" };
  };

  // Show confirmation popup
  const showConfirmation = (config) => {
    setConfirmConfig(config);
    setShowConfirmPopup(true);
  };

  // Handle save with confirmation
  const handleSaveWithConfirmation = () => {
    // === PERMISSION CHECK ===
    console.log('🔐 handleSaveWithConfirmation - Checking permissions');
    console.log('  formPermissions.Add:', formPermissions.Add);
    console.log('  !formPermissions.Add:', !formPermissions.Add);
    
    if (!formPermissions.Add) {
      console.log('  ❌ Permission DENIED for add');
      setMessage({
        type: "error",
        text: "❌ Access Denied! You do not have permission to create companies."
      });
      showConfirmation({
        title: "Permission Denied",
        message: "You do not have permission to create companies.",
        type: "error",
        confirmText: "OK",
        hideCancelButton: true,
        onConfirm: () => setShowConfirmPopup(false),
        onCancel: () => setShowConfirmPopup(false)
      });
      return;
    }
    console.log('  ✅ Permission ALLOWED for add');
    // === END PERMISSION CHECK ===

    // Get fresh validation result
    const validationResult = validateForm();
    
    if (!validationResult.isValid) {
      // Use the message from the fresh validation result
      showConfirmation({
        title: "Validation Error",
        message: validationResult.message, // ✅ Correct message now
        type: "warning",
        confirmText: "OK",
        hideCancelButton: true,
        onConfirm: () => setShowConfirmPopup(false),
        onCancel: () => setShowConfirmPopup(false)
      });
      return;
    }
    
    // ... rest of your success logic ...
    showConfirmation({
      title: "Create Company",
      message: `Do you want to save?`,
      type: "success",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: () => {
        setShowConfirmPopup(false);
        saveData();
        clearForm();
      },
      onCancel: () => setShowConfirmPopup(false)
    });
    
  };

  // Handle update with confirmation
  const handleUpdateWithConfirmation = () => {
    // === PERMISSION CHECK ===
    console.log('🔐 handleUpdateWithConfirmation - Checking permissions');
    console.log('  formPermissions.Edit:', formPermissions.Edit);
    console.log('  !formPermissions.Edit:', !formPermissions.Edit);
    
    if (!formPermissions.Edit) {
      console.log('  ❌ Permission DENIED for edit');
      setMessage({
        type: "error",
        text: "❌ Access Denied! You do not have permission to edit companies."
      });
      showConfirmation({
        title: "Permission Denied",
        message: "You do not have permission to edit companies.",
        type: "error",
        confirmText: "OK",
        hideCancelButton: true,
        onConfirm: () => setShowConfirmPopup(false),
        onCancel: () => setShowConfirmPopup(false)
      });
      return;
    }
    console.log('  ✅ Permission ALLOWED for edit');
    // === END PERMISSION CHECK ===

    // Get fresh validation result
    const validationResult = validateForm();
    
    if (!validationResult.isValid) {
      // Use the message from the fresh validation result
      showConfirmation({
        title: "Validation Error",
        message: validationResult.message,
        type: "warning",
        confirmText: "OK",
        hideCancelButton: true,
        onConfirm: () => setShowConfirmPopup(false),
        onCancel: () => setShowConfirmPopup(false)
      });
      return;
    }
    
    showConfirmation({
      title: "Update Company",
      message: `Do you want to modify?`,
      type: "warning",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: () => {
        setShowConfirmPopup(false);
        updateData();
      },
      onCancel: () => setShowConfirmPopup(false)
    });    
  };

  // Handle delete with confirmation
  const handleDeleteWithConfirmation = () => {
    // === PERMISSION CHECK ===
    console.log('🔐 handleDeleteWithConfirmation - Checking permissions');
    console.log('  formPermissions.Delete:', formPermissions.Delete);
    console.log('  !formPermissions.Delete:', !formPermissions.Delete);
    
    if (!formPermissions.Delete) {
      console.log('  ❌ Permission DENIED for delete');
      setMessage({
        type: "error",
        text: "❌ Access Denied! You do not have permission to delete companies."
      });
      showConfirmation({
        title: "Permission Denied",
        message: "You do not have permission to delete companies.",
        type: "error",
        confirmText: "OK",
        hideCancelButton: true,
        onConfirm: () => setShowConfirmPopup(false),
        onCancel: () => setShowConfirmPopup(false)
      });
      return;
    }
    console.log('  ✅ Permission ALLOWED for delete');
    // === END PERMISSION CHECK ===

    if (!formData.fcompcode) {
      showConfirmation({
        title: "No Company Selected",
        message: "Please select a company first",
        type: "warning",
        confirmText: "OK",
        hideCancelButton: true,
        onConfirm: () => setShowConfirmPopup(false),
        onCancel: () => setShowConfirmPopup(false)
      });
      return;
    }
    
    showConfirmation({
      title: "Delete Company",
      message: `Do you want to delete?`,
      type: "danger",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: () => {
        setShowConfirmPopup(false);
        deleteData();
      },
      onCancel: () => setShowConfirmPopup(false)
    });    
  };

  const saveData = async () => {
    setLoading(true);
    try {
      const pseudoCode = getPseudoCode();
      
      const payload = {
        compCode: formData.fcompcode,
        compName: formData.fcompname.trim(),
        gstinNO: formData.tngst.trim(),
        phonE1: formData.phone1 || "",
        state: formData.state || "",
        phonE2: formData.phone2 || "",
        stateCode: formData.statecode || "",
        phonE3: formData.phone3 || "",
        phonE4: formData.phone4 || "",
        shopNo: formData.shopno || "",
        address: formData.fcompadd1 || "",
        address2: formData.fcompadd2 || "",
        address3: formData.fcompadd3 || "",
        printName: formData.fprintname || "",
        userName: formData.fusername || "",
        description: formData.fdescription || "",
        printGAP: formData.fprintgap || "",
        password: formData.fpassword || "",
        prefix: formData.fprefix || "",
        defultMode: formData.fdefaultmode || "T",
        note1: formData.note1 || "",
        note2: formData.note2 || "",
        note3: formData.note3 || "",
        note4: formData.note4 || "",
        note5: formData.note5 || "",
        bankName: formData.bankname || "",
        branchName: formData.branch || "",
        ifsCode: formData.ifscode || "",
        accountNumber: formData.accno || "",
        print: formData.printing || "",
        gstType: formData.gstmode || "",
        salesRate: formData.salesrate || "",
        salType: formData.salestype || "",
        tagPrint: formData.tagprint || "",
        billprefix: formData.billprefix || "",
        template: formData.template || "",
        noOfPrint: formData.noofprint || "",
        message: formData.message || "",
        jewellSales: formData.jewellerysales || "N",
        senderID: formData.senderid || "",
        flessqty: "1",
        qtyFormat: formData.qtyformat || "",
        barcode: formData.barcode || "N",
        balInSales: formData.balinsales || "N",
        calculation: formData.calculation || "",
        stock: formData.showstock || "N",
        cpinsales: formData.cpinsales || "N",
        bkDrivepath: formData.backuppath || "",
        cpCode: formData.cpcode || "",
        backupDBI: formData.backupdbi || "",
        desc1: formData.desc1 || "",
        narration: formData.narrationToggle || "N",
        companyPrintColor: companycolor || "#ff0000",
        printAddressColor: addresscolor || "#00ff00",
        // Add pseudo code to payload
        pseudoCode: pseudoCode,
        // Add individual pseudo fields
        fseudo1: formData.pseudo1 || "",
        fseudo2: formData.pseudo2 || "",
        fseudo3: formData.pseudo3 || "",
        fseudo4: formData.pseudo4 || "",
        fseudo5: formData.pseudo5 || "",
        fseudo6: formData.pseudo6 || "",
        fseudo7: formData.pseudo7 || "",
        fseudo8: formData.pseudo8 || "",
        fseudo9: formData.pseudo9 || "",
        fseudo10: formData.pseudo10 || "",
        c: ""
      };

      console.log("Save response:", JSON.stringify(payload));
      const response = await apiService.post(
        API_ENDPOINTS.COMPANY_ENDPOINTS.CREATE_COMPANY,
        payload
      );

      const successMessage = typeof response === 'object'
        ? 'Company created successfully!'
        : response || 'Company created successfully!';
        fetchCompanyList();
          clearForm();

      // showConfirmation({
      //   title: "Success",
      //   message: successMessage,
      //   type: "success",
      //   confirmText: "OK",
      //   hideCancelButton: true,
      //   onConfirm: () => {
      //     setShowConfirmPopup(false);
      //     fetchCompanyList();
      //     clearForm();
      //   },
      //   onCancel: () => {
      //     setShowConfirmPopup(false);
      //     fetchCompanyList();
      //     clearForm();
      //   }
      // });
    } catch (err) {
      console.error("Failed to save company:", err);
      const errorMessage = err.response?.data?.message
        || err.response?.data
        || err.message
        || 'Failed to save company';
      
        setMessage({
          type: "error",
          text: ` ${errorMessage}`
        });
      // showConfirmation({
      //   title: "Error",
      //   message: errorMessage,
      //   type: "danger",
      //   confirmText: "OK",
      //   hideCancelButton: true,
      //   onConfirm: () => setShowConfirmPopup(false),
      //   onCancel: () => setShowConfirmPopup(false)
      // });
    } finally {
      setLoading(false);
    }
  };

  const updateData = async () => {
    setLoading(true);
    try {
      const pseudoCode = getPseudoCode();
      
      const payload = {
        compCode: formData.fcompcode,
        compName: formData.fcompname.trim(),
        gstinNO: formData.tngst.trim(),
        phonE1: formData.phone1 || "",
        state: formData.state || "",
        phonE2: formData.phone2 || "",
        stateCode: formData.statecode || "",
        phonE3: formData.phone3 || "",
        phonE4: formData.phone4 || "",
        shopNo: formData.shopno || "",
        address: formData.fcompadd1 || "",
        address2: formData.fcompadd2 || "",
        address3: formData.fcompadd3 || "",
        printName: formData.fprintname || "",
        userName: formData.fusername || "",
        description: formData.fdescription || "",
        printGAP: formData.fprintgap || "",
        password: formData.fpassword || "",
        prefix: formData.fprefix || "",
        defultMode: formData.fdefaultmode || "T",
        note1: formData.note1 || "",
        note2: formData.note2 || "",
        note3: formData.note3 || "",
        note4: formData.note4 || "",
        note5: formData.note5 || "",
        bankName: formData.bankname || "",
        branchName: formData.branch || "",
        ifsCode: formData.ifscode || "",
        accountNumber: formData.accno || "",
        print: formData.printing || "",
        gstType: formData.gstmode || "",
        salesRate: formData.salesrate || "",
        salType: formData.salestype || "",
        tagPrint: formData.tagprint || "",
        billprefix: formData.billprefix || "",
        template: formData.template || "",
        noOfPrint: formData.noofprint || "",
        message: formData.message || "",
        jewellSales: formData.jewellerysales || "N",
        senderID: formData.senderid || "",
        flessqty: "1",
        qtyFormat: formData.qtyformat || "",
        barcode: formData.barcode || "N",
        balInSales: formData.balinsales || "N",
        calculation: formData.calculation || "",
        stock: formData.showstock || "N",
        cpinsales: formData.cpinsales || "N",
        bkDrivepath: formData.backuppath || "",
        cpCode: formData.cpcode || "",
        backupDBI: formData.backupdbi || "",
        desc1: formData.desc1 || "",
        narration: formData.narrationToggle || "N",
        companyPrintColor: companycolor || "#ff0000",
        printAddressColor: addresscolor || "#00ff00",
        // Add pseudo code to payload
        pseudoCode: pseudoCode,
        // Add individual pseudo fields
        fseudo1: formData.pseudo1 || "",
        fseudo2: formData.pseudo2 || "",
        fseudo3: formData.pseudo3 || "",
        fseudo4: formData.pseudo4 || "",
        fseudo5: formData.pseudo5 || "",
        fseudo6: formData.pseudo6 || "",
        fseudo7: formData.pseudo7 || "",
        fseudo8: formData.pseudo8 || "",
        fseudo9: formData.pseudo9 || "",
        fseudo10: formData.pseudo10 || "",
        c: ""
      };

      console.log("Update response:", JSON.stringify(payload));
      const response = await apiService.post(
        API_ENDPOINTS.COMPANY_ENDPOINTS.UPDATE_COMPANY,
        payload
      );

      const successMessage = typeof response === 'object'
        ? 'Company updated successfully!'
        : response || 'Company updated successfully!';
        fetchCompanyList();
          clearForm();
      // showConfirmation({
      //   title: "Success",
      //   message: successMessage,
      //   type: "success",
      //   confirmText: "OK",
      //   hideCancelButton: true,
      //   onConfirm: () => {
      //     setShowConfirmPopup(false);
      //     fetchCompanyList();
      //     clearForm();
      //   },
      //   onCancel: () => {
      //     setShowConfirmPopup(false);
      //     fetchCompanyList();
      //     clearForm();
      //   }
      // });
    } catch (err) {
      console.error("Failed to update company:", err);
      const errorMessage = err.response?.data?.message
        || err.response?.data
        || err.message
        || 'Failed to update company';
      
      showConfirmation({
        title: "Error",
        message: errorMessage,
        type: "danger",
        confirmText: "OK",
        hideCancelButton: true,
        onConfirm: () => setShowConfirmPopup(false),
        onCancel: () => setShowConfirmPopup(false)
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async () => {
    setLoading(true);
    try {
      const response = await apiService.del(
        API_ENDPOINTS.COMPANY_ENDPOINTS.DELETE_COMPANY(formData.fcompcode)
      );

      const successMessage = typeof response === 'object'
        ? 'Company deleted successfully!'
        : response || 'Company deleted successfully!';
        fetchCompanyList();
          clearForm();

      // showConfirmation({
      //   title: "Success",
      //   message: successMessage,
      //   type: "success",
      //   confirmText: "OK",
      //   hideCancelButton: true,
      //   onConfirm: () => {
      //     setShowConfirmPopup(false);
      //     fetchCompanyList();
      //     clearForm();
      //   },
      //   onCancel: () => {
      //     setShowConfirmPopup(false);
      //     fetchCompanyList();
      //     clearForm();
      //   }
      // });
    } catch (err) {
      console.error("Failed to delete company:", err);
      const errorMessage = err.response?.data?.message
        || err.response?.data
        || err.message
        || 'Failed to delete company';
      
      showConfirmation({
        title: "Error",
        message: errorMessage,
        type: "danger",
        confirmText: "OK",
        hideCancelButton: true,
        onConfirm: () => setShowConfirmPopup(false),
        onCancel: () => setShowConfirmPopup(false)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault(); // Prevent default form submission
    
    console.log('🔘 handleSubmit called - selectedAction:', selectedAction);
    if (selectedAction === "create") {
      console.log('  → Calling handleSaveWithConfirmation');
      handleSaveWithConfirmation();
    }
    else if (selectedAction === "edit") {
      console.log('  → Calling handleUpdateWithConfirmation');
      handleUpdateWithConfirmation();
    }
    else if (selectedAction === "delete") {
      console.log('  → Calling handleDeleteWithConfirmation');
      handleDeleteWithConfirmation();
    }
  };

  const filteredData = tableData.filter(
    (item) =>
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFormClass = () => {
    return selectedAction === "delete" ? "delete-mode" : "";
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="main-layout">
          {/* Left Column - Split into two columns */}
          <div className="left-column">
            <div className={`card form-card ${getFormClass()}`}>
              {message && (
                <div className={`message-box message-${message.type}`}>
                  {message.text}
                </div>
              )}

              {/* Two-column form layout */}
              <div className="two-column-form">
                {/* Left side form */}
                <div className="form-column left-form">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <h3 style={{margin: 0}}>Company Details</h3>
                    <div style={{display: 'flex', gap: '10px'}}>
                      <AddButton
                        isActive={selectedAction === "create"}
                        onClick={() => handleActionClick("create")}
                        disabled={!formPermissions.Add}
                        buttonType="create"
                      />
                      <EditButton
                        isActive={selectedAction === "edit"}
                        onClick={() => handleActionClick("edit")}
                        disabled={!formPermissions.Edit}
                        buttonType="edit"
                      />
                      <DeleteButton
                        isActive={selectedAction === "delete"}
                        onClick={() => handleActionClick("delete")}
                        disabled={!formPermissions.Delete}
                        buttonType="delete"
                      />
                    </div>
                  </div>
                  <div className="form">
                    <div className="row1">
                      <div className="input-group">
                        <label>Company Code</label>
                        <input
                          type="text"
                          value={formData.fcompcode}
                          onChange={(e) => handleInputChange('fcompcode', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, 'fcompcode')}
                          disabled={selectedAction === "delete"}
                          readOnly={true}
                        />
                      </div>
                      <div className="input-group">
                        <label>Company Name <span className="asterisk">*</span></label>
                        <input
                          type="text"
                          ref={companyNameRef}
                          value={formData.fcompname}
                          onChange={(e) => handleInputChange('fcompname', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'fcompname')}
                        />
                      </div>
                    </div>
                    <div className="row2">
                      <div className="input-group">
                        <label>GSTIN</label>
                        <input
                          type="text"
                          ref={gstinRef}
                          value={formData.tngst}
                          onChange={(e) => handleInputChange('tngst', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'tngst')}
                        />
                      </div>
                      <div className="input-group">
                        <label>State </label>
                        <input
                          type="text"
                          ref={stateRef}
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'state')}
                        />
                      </div>
                      <div className="input-group">
                        <label>State Code </label>
                        <input
                          type="text"
                          ref={statecodeRef}
                          value={formData.statecode}
                          // onChange={(e) => handleInputChange('statecode', e.target.value)}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and empty input
                            if (value === '' || /^[0-9]*$/.test(value)) {
                              // Validate as user types                          
                                handleInputChange('statecode', value);                        
                              }
                          }}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'statecode')}
                        />
                      </div>
                    </div>
                    <div className="row2">
                      <div className="input-group">
                        <label>Phone 1</label>
                        <input
                          type="text"
                          ref={phone1Ref}
                          value={formData.phone1}
                          maxLength={10}
                          // onChange={(e) => handleInputChange('phone1', e.target.value)}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and empty input
                            if (value === '' || /^[0-9]*$/.test(value)) {
                              // Validate as user types                          
                                handleInputChange('phone1', value);                        
                              }
                          }}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'phone1')}
                        />
                      </div>
                      <div className="input-group">
                        <label>Phone 2</label>
                        <input
                          type="text"
                          ref={phone2Ref}
                          value={formData.phone2}
                          maxLength={10}
                          // onChange={(e) => handleInputChange('phone2', e.target.value)}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and empty input
                            if (value === '' || /^[0-9]*$/.test(value)) {
                              // Validate as user types                          
                                handleInputChange('phone2', value);                        
                              }
                          }}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'phone2')}
                        />
                      </div>
                      <div className="input-group">
                        <label>Phone 3</label>
                        <input
                          type="text"
                          ref={phone3Ref}
                          value={formData.phone3}
                          maxLength={10}
                          // onChange={(e) => handleInputChange('phone3', e.target.value)}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and empty input
                            if (value === '' || /^[0-9]*$/.test(value)) {
                              // Validate as user types                          
                                handleInputChange('phone3', value);                        
                              }
                          }}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'phone3')}
                        />
                      </div>
                    </div>
                    <div className="row4">
                      <div className="input-group">
                        <label>Address 1</label>
                        <input
                          type="text"
                          ref={addressRef}
                          value={formData.fcompadd1}
                          onChange={(e) => handleInputChange('fcompadd1', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'fcompadd1')}
                        />
                      </div>
                      <div className="input-group">
                        <label>Address 2</label>
                        <input
                          type="text"
                          ref={address1Ref}
                          value={formData.fcompadd2}
                          onChange={(e) => handleInputChange('fcompadd2', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'fcompadd2')}
                        />
                      </div>
                    </div>
                    <div className="row4">
                      <div className="input-group">
                        <label>Address 3</label>
                        <input
                          type="text"
                          ref={address2Ref}
                          value={formData.fcompadd3}
                          onChange={(e) => handleInputChange('fcompadd3', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'fcompadd3')}
                        />
                      </div>
                      <div className="input-group">
                        <label>Print Name</label>
                        <input
                          type="text"
                          ref={printerNameRef}
                          value={formData.fprintname}
                          onChange={(e) => handleInputChange('fprintname', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'fprintname')}
                        />
                      </div>
                    </div>
                    <div className="row2">
                      <div className="input-group">
                        <label>User Name <span className="asterisk">*</span></label>
                        <input
                          type="text"
                          ref={usernameRef}
                          value={formData.fusername}
                          onChange={(e) => handleInputChange('fusername', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'fusername')}
                        />
                      </div>
                      <div className="input-group">
                        <label>Password <span className="asterisk">*</span></label>
                        <input    
                          type="password"
                          ref={passwordRef}
                          value={formData.fpassword}
                          onChange={(e) => handleInputChange('fpassword', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'fpassword')}
                        />
                      </div>
                      <div className="input-group">
                        <label>Confirm Password <span className="asterisk">*</span></label>
                        <input  
                          type="password"
                          ref={confirmPasswordRef}
                          value={formData.fconfirmpass}
                          onChange={(e) => handleInputChange('fconfirmpass', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'fconfirmpass')}
                        />
                      </div>
                    </div>
                    <div className="row4">
                      <div className="input-group">
                        <label>Description</label>
                        <input
                          ref={descriptionRef}
                          type="text"
                          value={formData.fdescription}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase();
                            if(v === "Y" || v === "N") handleInputChange('fdescription', v);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, 'fdescription')}
                          placeholder="Y or N"
                          style={{ textAlign: "center" }}
                          disabled={selectedAction === "delete"}
                        />
                      </div>
                      <div className="input-group">
                        <label>Print GAP</label>
                        <input
                          ref={printgapRef}
                          type="text"
                          value={formData.fprintgap}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase();
                            if(v === "Y" || v === "N") handleInputChange('fprintgap', v);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, 'fprintgap')}
                          placeholder="Y or N"
                          style={{ textAlign: "center" }}
                          disabled={selectedAction === "delete"}
                        />
                      </div>
                    </div>
                    <div className="row2">
                      <div className="input-group">
                        <label>Prefix</label>
                        <input
                          type="text"
                          ref={prefixRef}
                          maxLength={2}
                          value={formData.fprefix}
                          onChange={(e) => handleInputChange('fprefix', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'fprefix')}
                        />
                      </div>
                      <div className="input-group">
                        <label>Default Mode</label>
                        <input    
                          type="text"
                          value={formData.fdefaultmode}
                          ref={defaultModeRef}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase();
                            if(v === "T" || v === "N") handleInputChange('fdefaultmode', v);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, 'fdefaultmode')}
                          placeholder="T or N"
                          style={{ textAlign: "center" }}
                          disabled={selectedAction === "delete"}
                        />
                      </div>
                      <div className="input-group">
                        <label>Bill Prefix</label>
                        <input
                          type="text"
                          ref={billPrefixRef}
                          maxLength={3}
                          value={formData.billprefix}
                          onChange={(e) => handleInputChange('billprefix', e.target.value)}
                          disabled={selectedAction === "delete"}
                          onKeyDown={(e) => handleKeyDown(e, 'billprefix')}
                        />
                      </div>
                    </div>

                    {/* Pseudo Fields Section */}
                    <div className="rowpseudo">
                      <div className="input-group">
                        <label>Pseudo Code</label>
                        <div className="pseudo-container">
                          <input
                            type="text"
                            ref={pseudo1Ref}
                            maxLength={1}
                            value={formData.pseudo1}
                            onChange={(e) => handlePseudoInput('pseudo1', e.target.value, 0)}
                            onKeyDown={(e) => handlePseudoKeyDown(e, 0)}
                            disabled={selectedAction === "delete"}
                            className="pseudo-input"
                          />
                          <input
                            type="text"
                            ref={pseudo2Ref}
                            maxLength={1}
                            value={formData.pseudo2}
                            onChange={(e) => handlePseudoInput('pseudo2', e.target.value, 1)}
                            onKeyDown={(e) => handlePseudoKeyDown(e, 1)}
                            disabled={selectedAction === "delete"}
                            className="pseudo-input"
                          />
                          <input
                            type="text"
                            ref={pseudo3Ref}
                            maxLength={1}
                            value={formData.pseudo3}
                            onChange={(e) => handlePseudoInput('pseudo3', e.target.value, 2)}
                            onKeyDown={(e) => handlePseudoKeyDown(e, 2)}
                            disabled={selectedAction === "delete"}
                            className="pseudo-input"
                          />
                          <input
                            type="text"
                            ref={pseudo4Ref}
                            maxLength={1}
                            value={formData.pseudo4}
                            onChange={(e) => handlePseudoInput('pseudo4', e.target.value, 3)}
                            onKeyDown={(e) => handlePseudoKeyDown(e, 3)}
                            disabled={selectedAction === "delete"}
                            className="pseudo-input"
                          />
                          <input
                            type="text"
                            ref={pseudo5Ref}
                            maxLength={1}
                            value={formData.pseudo5}
                            onChange={(e) => handlePseudoInput('pseudo5', e.target.value, 4)}
                            onKeyDown={(e) => handlePseudoKeyDown(e, 4)}
                            disabled={selectedAction === "delete"}
                            className="pseudo-input"
                          />
                          <input
                            type="text"
                            ref={pseudo6Ref}
                            maxLength={1}
                            value={formData.pseudo6}
                            onChange={(e) => handlePseudoInput('pseudo6', e.target.value, 5)}
                            onKeyDown={(e) => handlePseudoKeyDown(e, 5)}
                            disabled={selectedAction === "delete"}
                            className="pseudo-input"
                          />
                          <input
                            type="text"
                            ref={pseudo7Ref}
                            maxLength={1}
                            value={formData.pseudo7}
                            onChange={(e) => handlePseudoInput('pseudo7', e.target.value, 6)}
                            onKeyDown={(e) => handlePseudoKeyDown(e, 6)}
                            disabled={selectedAction === "delete"}
                            className="pseudo-input"
                          />
                          <input
                            type="text"
                            ref={pseudo8Ref}
                            maxLength={1}
                            value={formData.pseudo8}
                            onChange={(e) => handlePseudoInput('pseudo8', e.target.value, 7)}
                            onKeyDown={(e) => handlePseudoKeyDown(e, 7)}
                            disabled={selectedAction === "delete"}
                            className="pseudo-input"
                          />
                          <input
                            type="text"
                            ref={pseudo9Ref}
                            maxLength={1}
                            value={formData.pseudo9}
                            onChange={(e) => handlePseudoInput('pseudo9', e.target.value, 8)}
                            onKeyDown={(e) => handlePseudoKeyDown(e, 8)}
                            disabled={selectedAction === "delete"}
                            className="pseudo-input"
                          />
                          <input
                            type="text"
                            ref={pseudo10Ref}
                            maxLength={1}
                            value={formData.pseudo10}
                            onChange={(e) => handlePseudoInput('pseudo10', e.target.value, 9)}
                            onKeyDown={(e) => handlePseudoKeyDown(e, 9)}
                            disabled={selectedAction === "delete"}
                            className="pseudo-input"
                          />
                        </div>
                        <div className="pseudo-help">
                          <small>Enter 0-9 or A-Z only. Combined code: {getPseudoCode()}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Message display */}
              {message && (
                <div className={`message ${message.type}`} role="alert">
                  {message.text}
                </div>
              )}
              <div className="submit-row">
                <button
                  ref={submitRef}
                  className="submit-primary"
                  onClick={handleSubmit}
                  disabled={loading || (selectedAction === "create" ? !formPermissions.Add : selectedAction === "edit" ? !formPermissions.Edit : !formPermissions.Delete)}
                  type="button"
                >
                  {loading ? "Processing..." : selectedAction === "create" ? "Save" : selectedAction === "edit" ? "Update" : "Delete"}
                </button>
                <button
                  className="submit-clear"
                  onClick={clearForm}
                  disabled={loading}
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Compact Table */}
          <div className="right-column">
            <div className="card table-card">
              <div className="table-header">
                <h3>Company List</h3>
                
                <div className="search-bar">
                  <span className="search-icon">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    marginBottom: "15px",
                    flexShrink: 0,
                    textAlign: "center"
                  }}
                >
                  💡 Click a row to load company details for editing.
                  {tableData.length > 0 && ` Total: ${tableData.length} companies`}
                </p>
              </div>
              <div className="table-wrapper compact-table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Company Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length ? (
                      filteredData.map((item) => (
                        <tr
                          key={item.code}
                          className={formData.fcompcode === item.code ? "selected-row" : ""}
                          onClick={() => handleTableRowClick(item)}
                        >
                          <td className="code-cell">{item.code}</td>
                          <td className="name-cell">{item.name}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="no-data">
                          {searchQuery ? "No companies match your search" : "No companies found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup for selecting company */}
      <PopupListSelector
        open={showPopup}
        onClose={handlePopupClose}
        onSelect={handlePopupSelect}
        fetchItems={fetchCompaniesForPopup}
        title={popupTitle}
        displayFieldKeys={[, 'name']}
        searchFields={[, 'name']}
        headerNames={[, 'Company Name']}
        columnWidths={{  name: '80%' }}
        searchPlaceholder="Search by code or name..."
      />

      {/* Confirmation Popup for all actions */}
      <ConfirmationPopup
        isOpen={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        hideCancelButton={confirmConfig.hideCancelButton}
        showLoading={loading}
        defaultFocusedButton={confirmConfig.hideCancelButton ? "confirm" : "confirm"}
        borderColor={confirmConfig.type === "danger" ? "#ef4444" : 
                     confirmConfig.type === "success" ? "#10b981" : 
                     confirmConfig.type === "warning" ? "#f59e0b" : 
                     confirmConfig.type === "info" ? "#3b82f6" : "black"}
      />
    </>
  );
};

export default Company;