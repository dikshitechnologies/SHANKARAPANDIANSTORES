import React, { useState, useEffect, useRef } from "react";
import './Company.css';
import apiService from "../../api/apiService";
import { API_ENDPOINTS } from '../../api/endpoints';
import PopupListSelector from "../../components/Listpopup/PopupListSelector";

// --- SVG Icons (keep the same) ---
const CreateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
  </svg>
);
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
    <path
      fillRule="evenodd"
      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
    />
  </svg>
);
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11zm-7.487 1a.5.5 0 0 1 .528.47l.8 10a1 1 0 0 0 .997.93h6.23a1 1 0 0 0 .997-.93l.8-10a.5.5 0 0 1 .528-.47H3.513zM5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z" />
  </svg>
);
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

const useFormPermissions = (formType) => {
  return {
    canCreate: true,
    canEdit: true,
    canDelete: true
  };
};

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
  });
  const [narrationToggle, setNarrationToggle] = useState("N");
  const [companycolor, setCompanyColor] = useState("#ff0000");
  const [addresscolor, setAddressColor] = useState("#00ff00");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMode, setPopupMode] = useState("");

  const { canCreate, canEdit, canDelete } = useFormPermissions("COMPANY");

  // Refs for keyboard navigation
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
  

  // Create a refs array for easier navigation
  const inputRefs = [
    companyNameRef, gstinRef, phone1Ref, stateRef, phone2Ref, statecodeRef,
    phone3Ref, phone4Ref, shopNoRef, addressRef, address1Ref, address2Ref,
    printerNameRef, usernameRef, descriptionRef, printgapRef, passwordRef,
    confirmPasswordRef, prefixRef, defaultModeRef, note1Ref, note2Ref,
    note3Ref, note4Ref, note5Ref, bankNameRef, branchRef, ifsCodeRef,
    accountNumberRef, printingRef, gstModeRef, salesRateRef, salesTypeRef,
    tagPrintRef, billPrefixRef, templateRef, numberOfPrintRef, messageRef,
    jewellerySalesRef, narrationRef, senderIdRef, lessQuantityRef,
    quantityFormatRef, barcodeRef, balInSalesRef, calculationRef, showStockRef,
    cpInSalesRef, backupPathRef, cpCodeRef, backupDbiRef, desc1Ref
  ];


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

      setFormData({
        fcompcode: company.compCode || company.compcode || "",
        fcompname: company.compName || company.compname || "",
        tngst: company.gstinNO || company.gstin || "",
        state: company.state || "",
        phone1: company.phonE1 || company.phon1 || "",
        phone2: company.phonE2 || "",
        statecode: company.stateCode || company.statecode || "",
        phone3: company.phonE3 || "",
        phone4: company.phonE4 || "",
        fcompadd1: company.address || (company.shopNo != null ? String(company.shopNo) : "") || "",
        fcompadd2: company.address2 || "",
        fcompadd3: company.address3 || "",
        fprintname: company.printName || "",
        fusername: company.userName || company.userName || "",
        fdescription: company.description || "",
        fprintgap: company.printGAP || company.printGap || "",
        fpassword: company.password || "",
        fconfirmpass: company.password || "",
        fprefix: company.prefix || "",
        fdefaultmode: company.defultMode || company.defaultMode || "",
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
      });

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

  const handleKeyDown = (e, currentIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      let nextIndex = currentIndex + 1;
      while (nextIndex < inputRefs.length) {
        const nextRef = inputRefs[nextIndex];
        if (nextRef.current && !nextRef.current.disabled && nextRef.current.type !== 'color') {
          nextRef.current.focus();
          break;
        }
        nextIndex++;
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    if (!formData.fcompname.trim()) {
      alert("Please enter Company Name");
      return false;
    }
    
    if (!formData.fusername.trim()) {
      alert("Please enter UserName");
      return false;
    }
    if (!formData.fpassword.trim()) {
      alert("Please enter Password");
      return false;
    }
    if (formData.fpassword !== formData.fconfirmpass) {
      alert("Password and Confirm Password do not match");
      return false;
    }
    return true;
  };

  const saveData = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
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
        defultMode: formData.fdefaultmode || "",
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
        c: ""
      };

      console.log("Save response:", JSON.stringify(payload));
      const response = await apiService.post(
        API_ENDPOINTS.COMPANY_ENDPOINTS.CREATE_COMPANY,
        payload
      );

      const successMessage = typeof response === 'object'
        ? '✅ Company created successfully!'
        : response || '✅ Company created successfully!';

      alert(successMessage);
      fetchCompanyList();
      clearForm();
    } catch (err) {
      console.error("Failed to save company:", err);
      const errorMessage = err.response?.data?.message
        || err.response?.data
        || err.message
        || '❌ Failed to save company';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateData = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
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
        defultMode: formData.fdefaultmode || "",
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
        c: ""
      };

      console.log("Save response:", JSON.stringify(payload));
      const response = await apiService.post(
        API_ENDPOINTS.COMPANY_ENDPOINTS.UPDATE_COMPANY,
        payload
      );

      const successMessage = typeof response === 'object'
        ? '✅ Company updated successfully!'
        : response || '✅ Company updated successfully!';

      alert(successMessage);
      fetchCompanyList();
      clearForm();
    } catch (err) {
      console.error("Failed to update company:", err);
      const errorMessage = err.response?.data?.message
        || err.response?.data
        || err.message
        || '❌ Failed to update company';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async () => {
    if (!formData.fcompcode) return alert("Select a company first");
    if (!window.confirm("Are you sure you want to delete this company?")) return;

    setLoading(true);
    try {
      const response = await apiService.del(
        API_ENDPOINTS.COMPANY_ENDPOINTS.DELETE_COMPANY(formData.fcompcode)
      );

      const successMessage = typeof response === 'object'
        ? '✅ Company deleted successfully!'
        : response || '✅ Company deleted successfully!';

      alert(successMessage);
      fetchCompanyList();
      clearForm();
    } catch (err) {
      console.error("Failed to delete company:", err);
      const errorMessage = err.response?.data?.message
        || err.response?.data
        || err.message
        || '❌ Failed to delete company';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selectedAction === "create") saveData();
    else if (selectedAction === "edit") updateData();
    else if (selectedAction === "delete") deleteData();
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
              <div className="action-buttons">
                <button
                  className={`action-btn create ${selectedAction === "create" ? "active" : ""}`}
                  onClick={() => handleActionClick("create")}
                >
                  <CreateIcon /> Create
                </button>
                <button
                  className={`action-btn edit ${selectedAction === "edit" ? "active" : ""}`}
                  onClick={() => handleActionClick("edit")}
                >
                  <EditIcon /> Edit
                </button>
                <button
                  className={`action-btn delete ${selectedAction === "delete" ? "active" : ""}`}
                  onClick={() => handleActionClick("delete")}
                >
                  <DeleteIcon /> Delete
                </button>
              </div>

              {/* Two-column form layout */}
              <div className="two-column-form">
                {/* Left side form */}
                <div className="form-column left-form">
                  <h3 >Company Details</h3>
                  <div className="form">
                    <div className="row1">
                  <div className="input-group">
                    <label>Company Code</label>
                    <input
                      type="text"
                      value={formData.fcompcode}
                      onChange={(e) => handleInputChange('fcompcode', e.target.value)}
                      disabled={selectedAction === "delete"}
                      readOnly={true}
                    />
                  </div>
                  <div className="input-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      ref={companyNameRef}
                      value={formData.fcompname}
                      onChange={(e) => handleInputChange('fcompname', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 0)}
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
                      onKeyDown={(e) => handleKeyDown(e, 1)}
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
                      onKeyDown={(e) => handleKeyDown(e, 2)}
                    />
                  </div>
                  <div className="input-group">
                    <label>State Code </label>
                    <input
                      type="text"
                      ref={statecodeRef}
                      value={formData.statecode}
                      onChange={(e) => handleInputChange('statecode', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 3)}
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
                      onChange={(e) => handleInputChange('phone1', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 4)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone 2</label>
                    <input
                      type="text"
                      ref={phone2Ref}
                      value={formData.phone2}
                      onChange={(e) => handleInputChange('phone2', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 5)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone 3</label>
                    <input
                      type="text"
                      ref={phone3Ref}
                      value={formData.phone3}
                      onChange={(e) => handleInputChange('phone3', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 6)}
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
                      onKeyDown={(e) => handleKeyDown(e, 8)}
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
                      onKeyDown={(e) => handleKeyDown(e, 9)}
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
                      onKeyDown={(e) => handleKeyDown(e, 10)}
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
                      onKeyDown={(e) => handleKeyDown(e, 11)}
                    />
                  </div>
                  </div>
                  <div className="row2">
                  <div className="input-group">
                    <label>User Name *</label>
                    <input
                      type="text"
                      ref={usernameRef}
                      value={formData.fusername}
                      onChange={(e) => handleInputChange('fusername', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 12)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Password *</label>
                    <input    
                      type="password"
                      ref={passwordRef}
                      value={formData.fpassword}
                      onChange={(e) => handleInputChange('fpassword', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 13)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Confirm Password *</label>
                    <input  
                      type="password"
                      ref={confirmPasswordRef}
                      value={formData.fconfirmpass}
                      onChange={(e) => handleInputChange('fconfirmpass', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 14)}
                    />
                  </div>
                  </div>
                  <div className="row4">
                    <div className="input-group">
                  <label>Description</label>
                  <input
                    ref={descriptionRef} type ="text"
                    value={formData.fdescription}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "Y" || v === "N") handleInputChange('fdescription', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('fdescription', formData.fdescription === "N" ? "Y" : "N");
                      }
                    }}
                    placeholder="Y or N"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="input-group">
                  <label>Print GAP</label>
                  <input
                    ref={printgapRef} type ="text"
                    value={formData.fprintgap}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "Y" || v === "N") handleInputChange('fprintgap', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('fprintgap', formData.fprintgap === "N" ? "Y" : "N");
                      }
                    }}
                    placeholder="Y or N"
                    style={{ textAlign: "center" }}
                  />
                </div>
                </div>
                <div className="row4">
                  <div className="input-group">
                  <label>Prefix</label>
                  <input
                    type="text"
                    ref={prefixRef}
                    maxLength={2}
                    value={formData.fprefix}
                    onChange={(e) => handleInputChange('fprefix', e.target.value)}
                    disabled={selectedAction === "delete"}
                    onKeyDown={(e) => handleKeyDown(e, 15)}
                  />
                </div>
                <div className="input-group">
                  <label>Default Mode</label>
                  <input    
                    type="text"
                    ref={defaultModeRef}
                    maxLength={1}
                    value={formData.fdefaultmode}
                    onChange={(e) => handleInputChange('fdefaultmode', e.target.value)}
                    disabled={selectedAction === "delete"}
                    onKeyDown={(e) => handleKeyDown(e, 16)}
                  />
                </div>
                </div>
                <div className="row">
                  <div className="input-group">
                  <label>Note 1</label>
                  <input  
                    type="text"
                    ref={note1Ref}
                    value={formData.note1}
                    onChange={(e) => handleInputChange('note1', e.target.value)}
                    disabled={selectedAction === "delete"}
                    onKeyDown={(e) => handleKeyDown(e, 17)}
                  />  
                </div>
                </div>
                <div className="row">
                <div className="input-group">
                  <label>Note 2</label> 
                  <input
                    type="text"
                    ref={note2Ref}
                    value={formData.note2}
                    onChange={(e) => handleInputChange('note2', e.target.value)}
                    disabled={selectedAction === "delete"}
                    onKeyDown={(e) => handleKeyDown(e, 18)}
                  />
                  </div>
                  </div>
                  <div className="row">
                  <div className="input-group">
                  <label>Note 3</label>
                  <input
                    type="text"
                    ref={note3Ref}
                    value={formData.note3}
                    onChange={(e) => handleInputChange('note3', e.target.value)}
                    disabled={selectedAction === "delete"}
                    onKeyDown={(e) => handleKeyDown(e, 19)}
                  />
                  </div>
                  </div>
                  <div className="row">
                  <div className="input-group">
                  <label>Note 4</label> 
                  <input
                    type="text"
                    ref={note4Ref}
                    value={formData.note4}
                    onChange={(e) => handleInputChange('note4', e.target.value)}
                    disabled={selectedAction === "delete"}
                    onKeyDown={(e) => handleKeyDown(e, 20)}
                  />
                  </div>
                  </div>
                  <div className="row">
                  <div className="input-group">
                  <label>Note 5</label> 
                  <input
                    type="text"
                    ref={note5Ref}
                    value={formData.note5}
                    onChange={(e) => handleInputChange('note5', e.target.value)}
                    disabled={selectedAction === "delete"}
                    onKeyDown={(e) => handleKeyDown(e, 21)}
                  />
                  </div>
                  </div>
                </div>
                </div>

                {/* Right side form */}
                <div className="form-column right-form">
                  <h3 style={{textAlign:'center', marginBottom: '0'}}>Bank Details</h3>
                  <div className="form">
                    <div className="row4">
                  <div className="input-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      ref={bankNameRef}
                      value={formData.bankname}
                      onChange={(e) => handleInputChange('bankname', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 7)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Branch</label>
                    <input
                      type="text"
                      ref={branchRef}
                      value={formData.branch}
                      onChange={(e) => handleInputChange('branch', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 8)}
                    />
                  </div>
                  </div>
                  <div className="row4">
                  <div className="input-group">
                    <label>IFSC Code</label>  
                    <input
                      type="text"
                      ref={ifsCodeRef}
                      value={formData.ifscode}
                      onChange={(e) => handleInputChange('ifscode', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 9)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Account Number</label>
                    <input
                      type="text"
                      ref={accountNumberRef}
                      value={formData.accno}
                      onChange={(e) => handleInputChange('accno', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 10)}
                    />
                  </div> 
                  </div> 
                  <div className="row2">                  
                    <div className="input-group">
                  <label>GST Mode</label>
                  <input
                    ref={gstModeRef} type ="text"
                    value={formData.gstmode}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "I" || v === "E") handleInputChange('gstmode', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('gstmode', formData.gstmode === "I" ? "E" : "I");
                      }
                    }}
                    placeholder="I or E"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="input-group">
                  <label>Sales Rate</label>
                  <input
                    ref={salesRateRef} type ="text"
                    value={formData.salesrate}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "I" || v === "P") handleInputChange('salesrate', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('salesrate', formData.salesrate === "P" ? "I" : "P");
                      }
                    }}
                    placeholder="I or P"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="input-group">
                      <label>Sales Type</label>
                      <input
                        ref={salesTypeRef}
                        type="text"
                        value={formData.salestype}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase();
                          if (v === "W" || v === "R" || v === "A") handleInputChange('salestype', v);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === " ") {
                            const current = formData.salestype;
                            if (current === "W") handleInputChange('salestype', "R");
                            else if (current === "R") handleInputChange('salestype', "A");
                            else if (current === "A") handleInputChange('salestype', "W");
                            else handleInputChange('salestype', "W"); // default
                          }
                        }}
                        placeholder="W, R, or A"
                        style={{ textAlign: "center" }}
                      />
                    </div>
                  </div>
                  <div className="row4">                    
                    <div className="input-group">
                    <label>Printing</label>
                    <input
                      type="text"
                      ref={printingRef}
                      value={formData.printing}
                      onChange={(e) => handleInputChange('printing', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 11)}
                    />
                    </div>
                    <div className="input-group">
                      <label>Tag Print</label>
                      <input  
                        type="text"
                        ref={tagPrintRef}
                        value={formData.tagprint}
                        onChange={(e) => handleInputChange('tagprint', e.target.value)}
                        disabled={selectedAction === "delete"}
                        onKeyDown={(e) => handleKeyDown(e, 12)}
                      />
                    </div>
                    </div>
                    <div className="row1">
                    <div className="input-group">
                      <label>Bill Prefix</label>
                      <input
                        ref={billPrefixRef} type ="text"
                        value={formData.billprefix}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase();
                          if(v === "Y" || v === "N") handleInputChange('billprefix', v);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === " ") {
                            handleInputChange('billprefix', formData.billprefix === "N" ? "Y" : "N");
                          }
                        }}
                        placeholder="Y or N"
                        style={{ textAlign: "center" }}
                      />
                    </div>                  
                  
                  <div className="input-group">
                    <label>Template</label>
                    <input  
                      type="text"
                      ref={templateRef}
                      value={formData.template}
                      onChange={(e) => handleInputChange('template', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 13)}
                    />  
                  </div>
                  </div>
                  <div className="row1">
                  <div className="input-group">
                    <label>No of Print</label>
                    <input  
                      type="text"
                      ref={numberOfPrintRef}
                      value={formData.noofprint}
                      onChange={(e) => handleInputChange('noofprint', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 14)}
                    />  
                  </div>
                  <div className="input-group">
                    <label>Message</label>
                    <input  
                      type="text"
                      ref={messageRef}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 15)}
                    />
                  </div>
                  </div>
                  <div className="row2">
                    <div className="input-group">
                  <label>Jewellery Sales</label>
                  <input
                    ref={jewellerySalesRef} type ="text"
                    value={formData.jewellerysales}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "Y" || v === "N") handleInputChange('jewellerysales', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('jewellerysales', formData.jewellerysales === "N" ? "Y" : "N");
                      }
                    }}
                    placeholder="Y or N"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="input-group">
                  <label>Narration (Y/N)</label>
                  <input
                    ref={narrationRef}
                    type="text"
                    maxLength={1}
                    value={narrationToggle}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if (v === "Y" || v === "N") setNarrationToggle(v);
                    }}
                    onKeyDown={(e) => {
                    if (e.key === " ") setNarrationToggle(prev => prev === "N" ? "Y" : "N");
                    }}
                    placeholder="Y or N"
                    style={{ textAlign: "center" }}
                  />
                </div> 
                <div className="input-group">
                  <label>Less Qty</label>
                  <input
                    ref={lessQuantityRef} type ="text"
                    value={formData.lessqty}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "Y" || v === "N") handleInputChange('lessqty', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('lessqty', formData.lessqty === "N" ? "Y" : "N");
                      }
                    }}
                    placeholder="Y or N"
                    style={{ textAlign: "center" }}
                  />
                </div>
                </div>
                <div className="row4">
                  <div className="input-group">
                  <label>Sender ID</label>
                  <input
                    type="text"
                    ref={senderIdRef}
                    value={formData.senderid}
                    onChange={(e) => handleInputChange('senderid', e.target.value)}
                    disabled={selectedAction === "delete"}
                    onKeyDown={(e) => handleKeyDown(e, 16)}
                  />
                  </div>
                  <div className="input-group">
                    <label>Qty Format</label>
                    <input
                      type="text"
                      ref={quantityFormatRef}
                      value={formData.qtyformat}
                      onChange={(e) => handleInputChange('qtyformat', e.target.value)}
                      disabled={selectedAction === "delete"}
                      onKeyDown={(e) => handleKeyDown(e, 17)}
                    />
                    </div>
                  </div>
                  <div className="row2">
                    <div className="input-group">
                  <label>Bar Code</label>
                  <input
                    ref={barcodeRef} type ="text"
                    value={formData.barcode}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "Y" || v === "N") handleInputChange('barcode', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('barcode', formData.barcode === "N" ? "Y" : "N");
                      }
                    }}
                    placeholder="Y or N"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="input-group">
                  <label>Bal in Sales</label>
                  <input
                    ref={balInSalesRef} type ="text"
                    value={formData.balinsales}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "Y" || v === "N") handleInputChange('balinsales', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('balinsales', formData.balinsales === "N" ? "Y" : "N");
                      }
                    }}
                    placeholder="Y or N"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="input-group">
                  <label>Calculation</label>
                  <input
                    ref={calculationRef} type ="text"
                    value={formData.calculation}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "Q" || v === "A") handleInputChange('calculation', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('calculation', formData.calculation === "A" ? "Q" : "A");
                      }
                    }}
                    placeholder="Q or A"
                    style={{ textAlign: "center" }}
                  />
                </div>
                </div>
                <div className="row4">
                <div className="input-group">
                  <label>Show Stock</label>
                  <input
                    ref={showStockRef} type ="text"
                    value={formData.showstock}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "Y" || v === "N") handleInputChange('showstock', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('showstock', formData.showstock === "N" ? "Y" : "N");
                      }
                    }}
                    placeholder="Y or N"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="input-group">
                  <label>CP in Sales </label>
                  <input
                    ref={cpInSalesRef} type ="text"
                    value={formData.cpinsales}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "Y" || v === "N") handleInputChange('cpinsales', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('cpinsales', formData.cpinsales === "N" ? "Y" : "N");
                      }
                    }}
                    placeholder="Y or N"
                    style={{ textAlign: "center" }}
                  />
                </div>
                </div>
                <div className="row4">
                  <div className="input-group">
                  <label>DBI Path</label>
                  <input
                    type="text"
                    ref={backupPathRef}
                    value={formData.dbipath}
                    onChange={(e) => handleInputChange('dbipath', e.target.value)}
                    disabled={selectedAction === "delete"}
                    onKeyDown={(e) => handleKeyDown(e, 21)}
                  />
                  </div>
                <div className="input-group">
                  <label>Backup DBI</label>
                  <input
                    type="text"
                    ref={backupDbiRef}
                    value={formData.backupdbi}
                    onChange={(e) => handleInputChange('backupdbi', e.target.value)}
                    disabled={selectedAction === "delete"}
                    onKeyDown={(e) => handleKeyDown(e, 22)}
                  />
                  </div>
                  </div>
                  <div className="row4">
                  <div className="input-group">
                  <label>CP Code</label>
                  <input
                    type="text"
                    ref = {cpCodeRef}
                    value={formData.cpcode}
                    onChange={(e) => handleInputChange('cpcode', e.target.value)}
                    disabled={selectedAction === "delete"}
                    onKeyDown={(e) => handleKeyDown(e, 23)}
                  />
                  </div>
                  <div className="input-group">
                  <label>Desc 1</label>
                  <input
                    ref={desc1Ref} type ="text"
                    value={formData.desc1}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      if(v === "N" || v === "Y") handleInputChange('desc1', v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        handleInputChange('desc1', formData.desc1 === "N" ? "Y" : "N");
                      }
                    }}
                    placeholder="N or Y"
                    style={{ textAlign: "center" }}
                  />
                </div>
                </div>
                <div className="row4">
                  <div className="input-group">
                  <label>CompanyPrint Color</label>
                  <input
                    type="color"
                    value={companycolor}
                    onChange={(e) => setCompanyColor(e.target.value)}
                    disabled={selectedAction === "delete"}
                  />
                </div>
                <div className="input-group">
                  <label>Print Address Color</label>
                  <input
                    type="color"
                    value={addresscolor}
                    onChange={(e) => setAddressColor(e.target.value)}
                    disabled={selectedAction === "delete"}
                  />
                </div>
              </div>
                </div>
                </div>
              </div>

              <div className="button-row">
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={loading || (selectedAction === "create" ? !canCreate : selectedAction === "edit" ? !canEdit : !canDelete)}
                  title={selectedAction === "create" ? (!canCreate ? "You don't have permission to create" : "") : selectedAction === "edit" ? (!canEdit ? "You don't have permission to edit" : "") : (!canDelete ? "You don't have permission to delete" : "")}
                >
                  {loading ? "Processing..." :
                    selectedAction === "create" ? "Create Company" :
                      selectedAction === "edit" ? "Update Company" :
                        "Delete Company"}
                </button>
                <button className="clear-btn" onClick={clearForm}>
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

      <PopupListSelector
        open={showPopup}
        onClose={handlePopupClose}
        onSelect={handlePopupSelect}
        fetchItems={fetchCompaniesForPopup}
        title={popupTitle}
        displayFieldKeys={['code', 'name']}
        searchFields={['code', 'name']}
        headerNames={['Code', 'Company Name']}
        columnWidths={{ code: '20%', name: '80%' }}
        searchPlaceholder="Search by code or name..."
      />
    </>
  );
};

export default Company;