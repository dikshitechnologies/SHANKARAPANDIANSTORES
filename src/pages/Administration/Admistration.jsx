import React, { useState, useMemo, useEffect } from "react";


// Import your API service
import { axiosInstance } from '../../api/apiService';
import { API_ENDPOINTS } from '../../api/endpoints';
// Import PopupListSelector
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
// Import common popups
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';

// Import toast notifications
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import ActionButtons - CORRECTED IMPORT PATH
import { 
  ActionButtons, 
  AddButton, 
  EditButton, 
  DeleteButton,
  ActionButtons1
} from '../../components/Buttons/ActionButtons.jsx';

// Import permissions
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSION_CODES } from "../../constants/permissions";

// Get endpoints from your configuration
const USERS_URL = API_ENDPOINTS.ADMINISTRATION.USER_LIST;
const GET_PERMS_URL = API_ENDPOINTS.ADMINISTRATION.GET_PERMISSIONS_BY_USER;
const INSERT_BATCH_URL = API_ENDPOINTS.ADMINISTRATION.ADMIN_BATCH_INSERT;
const DELETE_URL = API_ENDPOINTS.ADMINISTRATION.DELETE_PERMISSIONS;
// Updated item lists with proper database permission names
const MASTER_ITEMS = [
  { label: "Ledger Group Creation", dbName: "LED_GRPCREATION" },
  { label: "Item Group Creation", dbName: "ITEM_GRPCREATION" },
  { label: "Ledger Creation", dbName: "LEDGER_CREATION" },
  { label: "Item Creation", dbName: "ITEM_CREATION" },
  { label: "Unit Creation", dbName: "UNIT_CREATION" },
  { label: "Company Creation", dbName: "COMPANY_CREATION" },
  { label: "Product Creation", dbName: "PRODUCT_CREATION" },
  { label: "Brand Creation", dbName: "BRAND_CREATION" },
  { label: "Category Creation", dbName: "CATEGORY_CREATION" },
    { label: "Design Creation", dbName: "DESIGN_CREATION" },
  { label: "Size Creation", dbName: "SIZE_CREATION" },
  { label: "Color Creation", dbName: "COLOR_CREATION" },
   { label: "State Creation", dbName: "STATE_CREATION" },
  { label: "Model Creation", dbName: "MODEL_CREATION" },
  { label: "Salesman Creation", dbName: "SALESMAN_CREATION" },
  { label: "Scrap Creation", dbName: "SCRAP_CREATION" },
  { label: "User Creation", dbName: "USER_CREATION" },
  { label: "Administrator ", dbName: "ADMINISTRATOR_CREATION" },

];

const TRANSACTION_ITEMS = [
  { label: "Sales Invoice", dbName: "SALES_INVOICE" },
  { label: "Sales Return", dbName: "SALES_RETURN" },
  { label: "Purchase Invoice", dbName: "PURCHASE_INVOICE" },
  { label: "Purchase Return", dbName: "PURCHASE_RETURN" },
  { label: "Scrap Rate Fix", dbName: "SCRAP_RATE_FIX" },
  { label: "Scrap Procurement", dbName: "SCRAP_PROCUREMENT" },
  { label: "Tender", dbName: "TENDER" },
  { label: "Bill Collector", dbName: "BILL_COLLECTOR" },
  { label: "Amount Issue", dbName: "AMOUNT_ISSUE" },
  { label: "Payment Voucher", dbName: "PAYMENT_VOUCHER" },
  { label: "Receipt Voucher", dbName: "RECEIPT_VOUCHER" }
];

const REPORT_ITEMS = [
  { label: "Sales Report", dbName: "SALES_REPORT" },
  { label: "Stock Report", dbName: "STOCK_REPORT" },
  { label: "Purchase Report", dbName: "PURCHASE_REPORT" },
  { label: "Ledger Report", dbName: "LEDGER_REPORT" },
  { label: "Trial Balance", dbName: "TRIAL_BALANCE" },
  { label: "Profit & Loss", dbName: "PROFIT_LOSS" },
  { label: "Balance Sheet", dbName: "BALANCE_SHEET" },
  { label: "Cash Flow", dbName: "CASH_FLOW" },
  { label: "Stock Summary", dbName: "STOCK_SUMMARY" },
  { label: "Customer Statement", dbName: "CUSTOMER_STATEMENT" },
  { label: "Supplier Statement", dbName: "SUPPLIER_STATEMENT" },
  { label: "Tax Report", dbName: "TAX_REPORT" },
  { label: "Audit Report", dbName: "AUDIT_REPORT" }
];

function makeEmptyPerms(list, modelShort = "M") {
  const o = {};
  list.forEach(item => {
    o[item.dbName] = { 
      formCode: item.dbName, 
      modelShort, 
      label: item.label, 
      permission: false, 
      add: false, 
      edit: false, 
      del: false, 
      print: false 
    };
  });
  return o;
}

const Administration = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.ADMINISTRATION),
    edit: hasModifyPermission(PERMISSION_CODES.ADMINISTRATION),
    delete: hasDeletePermission(PERMISSION_CODES.ADMINISTRATION)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  const [users, setUsers] = useState([{ id: "0", code: "0", name: "Select User" }]);
  const [selectedUserId, setSelectedUserId] = useState("0");
  const [activeTab, setActiveTab] = useState("master");
  const [loaded, setLoaded] = useState(false);
  const [perms, setPerms] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState("add");

  // Confirmation Popup State
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmPopupConfig, setConfirmPopupConfig] = useState({
    title: "",
    message: "",
    type: "default",
    onConfirm: null,
    confirmText: "Confirm",
    cancelText: "Cancel"
  });

  const LS_LAST_USER = "admin_last_selected_user_id";
  const LS_PERMS_PREFIX = "admin_perms_user_";

  useEffect(() => { loadUsers() }, []);
  useEffect(() => {
    setPerms(p => {
      const c = { ...p };
      users.forEach(u => {
        if (!c[u.id]) c[u.id] = {
          ...makeEmptyPerms(MASTER_ITEMS, "M"),
          ...makeEmptyPerms(TRANSACTION_ITEMS, "T"),
          ...makeEmptyPerms(REPORT_ITEMS, "R")
        };
      });
      return c;
    });
    const last = localStorage.getItem(LS_LAST_USER);
    if (last) {
      const f = users.find(u => u.id === last);
      if (f) {
        setSelectedUserId(last);
        (async () => {
          const cached = localStorage.getItem(LS_PERMS_PREFIX + f.code);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setPerms(p => {
                const c = JSON.parse(JSON.stringify(p || {}));
                c[last] = { ...c[last], ...parsed };
                return c;
              });
            } catch { }
          }
          await fetchAndMapPermissions(f.code, last);
        })();
      }
    }
    setTimeout(() => setLoaded(true), 80);
  }, [users]);

  const selectedUserPerms = useMemo(() => perms[selectedUserId] || {}, [perms, selectedUserId]);

  // ---------- COMMON POPUP HANDLERS ----------
  const showConfirmation = (config) => {
    setConfirmPopupConfig(config);
    setShowConfirmPopup(true);
  };

  const handleConfirmAction = () => {
    if (confirmPopupConfig.onConfirm) {
      confirmPopupConfig.onConfirm();
    }
    setShowConfirmPopup(false);
  };

  const handleCancelAction = () => {
    setShowConfirmPopup(false);
  };

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await axiosInstance.get(USERS_URL);
      const data = response.data;
      console.log("Loaded users:", data);

      const userList = Array.isArray(data) ? data.map((u, i) => ({
        id: String(u.id || i + 1),
        code: u.userCode || u.code || String(u.id || i + 1),
        name: u.userName || u.name || u.fullName || `User ${i + 1}`
      })) : [];

      setUsers([{ id: "0", code: "0", name: "Select User" }, ...userList]);
    } catch (error) {
      console.error("Error loading users:", error);
      // Fallback to mock data if API fails
      setUsers([{ id: "0", code: "0", name: "Select User" }]);
      toast.error("Failed to load users. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchPermissionsForCode(code) {
    if (!code) return null;

    try {
      // Try different parameter formats
      let response;

      // Try with fUcode parameter
      try {
        response = await axiosInstance.get(GET_PERMS_URL, {
          params: { fUcode: code }
        });
        return response.data;
      } catch (error1) {
        // Try with userCode parameter
        try {
          response = await axiosInstance.get(GET_PERMS_URL, {
            params: { userCode: code }
          });
          return response.data;
        } catch (error2) {
          // Try as part of URL
          try {
            response = await axiosInstance.get(`${GET_PERMS_URL}/${code}`);
            return response.data;
          } catch (error3) {
            // Try with query parameter in different format
            try {
              response = await axiosInstance.get(GET_PERMS_URL, {
                params: { UserCode: code }
              });
              return response.data;
            } catch (error4) {
              console.error("All permission fetch attempts failed");
              return null;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return null;
    }
  }

  async function fetchAndMapPermissions(userCode, userId) {
    try {
      setLoading(true);
      const dataRaw = await fetchPermissionsForCode(userCode);
      if (!dataRaw) return null;

      let data = dataRaw;
      if (!Array.isArray(data) && typeof data === "object") data = Object.values(data);
      if (!Array.isArray(data)) return null;

      setPerms(prev => {
        const c = JSON.parse(JSON.stringify(prev || {}));
        if (!c[userId]) c[userId] = {
          ...makeEmptyPerms(MASTER_ITEMS, "M"),
          ...makeEmptyPerms(TRANSACTION_ITEMS, "T"),
          ...makeEmptyPerms(REPORT_ITEMS, "R")
        };
        const map = {};
        Object.values(c[userId]).forEach(v => map[v.formCode] = { ...v });

        const b = v => v === true || v === "1" || v === 1 || v === "true" || v === "True";

        data.forEach(it => {
          const fc = it.formCode || it.form_permission || it.formPermission || it.form || (it.formName ? it.formName.replace(/\s+/g, "_").toUpperCase() : null);
          let p = b(it.permission) || b(it.fPermission) || b(it.formPermission);
          let a = b(it.add) || b(it.addPermission);
          let e = b(it.edit) || b(it.editPermission);
          let d = b(it.del) || b(it.deletePermission) || b(it.delPermission);
          let pr = b(it.print) || b(it.printPermission);
          
          if (fc && map[fc]) {
            map[fc] = { ...map[fc], permission: !!p, add: !!a, edit: !!e, del: !!d, print: !!pr };
          }
        });
        c[userId] = { ...c[userId], ...map };
        try {
          localStorage.setItem(LS_PERMS_PREFIX + userCode, JSON.stringify(c[userId]));
        } catch { }
        return c;
      });
      return true;
    } catch (error) {
      console.error("Error mapping permissions:", error);
      toast.error("Error loading permissions", {
        position: "top-right",
        autoClose: 3000,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function deletePermissionsForCode(code) {
    try {
      // Try different delete methods
      let response;

      // Try DELETE with code in URL
      try {
        response = await axiosInstance.delete(`${DELETE_URL}/${code}`);
        if (response.status === 200 || response.status === 204) {
          return { ok: true };
        }
      } catch (error1) {
        // Try DELETE with query parameter
        try {
          response = await axiosInstance.delete(DELETE_URL, {
            params: { userCode: code }
          });
          if (response.status === 200 || response.status === 204) {
            return { ok: true };
          }
        } catch (error2) {
          // Try POST with body for deletion (some APIs use POST for delete)
          try {
            response = await axiosInstance.post(DELETE_URL, {
              userCode: code,
              action: "delete"
            });
            if (response.status === 200) {
              return { ok: true };
            }
          } catch (error3) {
            console.error("All delete attempts failed");
            return { ok: false };
          }
        }
      }
    } catch (error) {
      console.error("Error deleting permissions:", error);
      return { ok: false };
    }
  }

  async function insertBatchForUser(code) {
    const o = perms[selectedUserId];
    if (!o) return { ok: false };

    const payload = Object.values(o).map(p => ({
      userCode: code,
      modelShort: p.modelShort,
      formPermission: p.formCode, // This should now match your database field names
      fPermission: p.permission ? "1" : "0",
      addPermission: p.add ? "1" : "0",
      editPermission: p.edit ? "1" : "0",
      deletePermission: p.del ? "1" : "0",
      printPermission: p.print ? "1" : "0"
    }));

    try {
      const response = await axiosInstance.post(INSERT_BATCH_URL, payload);

      if (response.status === 200 || response.status === 201) {
        try {
          localStorage.setItem(LS_PERMS_PREFIX + code, JSON.stringify(o));
        } catch { }
        return { ok: true };
      } else {
        return { ok: false };
      }
    } catch (error) {
      console.error("Error inserting batch:", error);
      return { ok: false };
    }
  }

  const handleUserPopupOpen = () => {
    setShowUserPopup(true);
  };

  const handleUserSelect = async (user) => {
    setShowUserPopup(false);
    setUserSearchTerm("");

    const id = user.id;
    setSelectedUserId(id);
    localStorage.setItem(LS_LAST_USER, id);

    try {
      const cached = localStorage.getItem(LS_PERMS_PREFIX + user.code);
      if (cached) {
        const parsed = JSON.parse(cached);
        setPerms(prev => {
          const cp = JSON.parse(JSON.stringify(prev || {}));
          cp[id] = { ...cp[id], ...parsed };
          return cp;
        });
      }
    } catch { }

    await fetchAndMapPermissions(user.code, id);
  };

  const toggle = (fc, key) => {
    if (selectedUserId === "0") return;
    setPerms(prev => {
      const cp = JSON.parse(JSON.stringify(prev));
      const it = cp[selectedUserId][fc];
      if (!it) return prev;
      if (key === "permission") {
        it.permission = !it.permission;
        if (!it.permission) it.add = it.edit = it.del = it.print = false;
      }
      else if (it.permission) it[key] = !it[key];
      return cp;
    });
  };

  const handleClear = () => {
    // Show confirmation for clear action
    showConfirmation({
      title: "Clear Permissions",
      message: "Are you sure you want to clear all permissions? This will reset all switches.",
      type: "warning",
      confirmText: "Clear",
      cancelText: "Cancel",
      onConfirm: () => {
        setSelectedUserId("0");
        localStorage.setItem(LS_LAST_USER, "0");

        setPerms(p => {
          const c = JSON.parse(JSON.stringify(p || {}));
          Object.keys(c).forEach(userId => {
            Object.keys(c[userId]).forEach(f => {
              const x = c[userId][f];
              x.permission = x.add = x.edit = x.del = x.print = false;
            });
          });
          return c;
        });

        toast.success("All permissions have been cleared.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedUserId === "0") {
      toast.warning("Please select a user to update permissions.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    
    const u = users.find(x => x.id === selectedUserId);
    if (!u) {
      toast.error("Selected user not found.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const code = u.code;

    // Show confirmation popup
    showConfirmation({
      title: "Update Permissions",
      message: `Are you sure you want to update permissions for ${u.name}?`,
      type: "success",
      confirmText: "Update",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          setLoading(true);
          // First delete existing permissions
          const delResult = await deletePermissionsForCode(code);

          if (!delResult.ok) {
            console.warn("Delete operation may have failed, but continuing with insert...");
          }

          // Insert new permissions
          const ins = await insertBatchForUser(code);

          if (ins.ok) {
            toast.success("Permissions updated successfully!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              onClose: () => {
                // Refresh permissions from server
                fetchAndMapPermissions(code, selectedUserId);
              }
            });
          } else {
            toast.error("Failed to update permissions. Please try again.", {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } catch (error) {
          console.error("Error submitting permissions:", error);
          toast.error("An error occurred while updating permissions.", {
            position: "top-right",
            autoClose: 3000,
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Function to fetch users for PopupListSelector
  const fetchUsersForPopup = async (pageNum, search) => {
    try {
      const response = await axiosInstance.get(USERS_URL);
      const data = response.data;

      let userList = Array.isArray(data) ? data.map((u, i) => ({
        id: String(u.id || i + 1),
        code: u.userCode || u.code || String(u.id || i + 1),
        name: u.userName || u.name || u.fullName || `User ${i + 1}`
      })) : [];

      // Filter by search term if provided
      if (search && search.trim()) {
        const searchTerm = search.toLowerCase();
        userList = userList.filter(user =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.code.toLowerCase().includes(searchTerm)
        );
      }

      return userList;
    } catch (error) {
      console.error("Error fetching users for popup:", error);
      return [];
    }
  };

  const itemsForRender = useMemo(() => {
    let list = MASTER_ITEMS;
    if (activeTab === "transaction") list = TRANSACTION_ITEMS;
    if (activeTab === "report") list = REPORT_ITEMS;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return list
        .filter(item => item.label.toLowerCase().includes(query))
        .map(item => {
          return selectedUserPerms[item.dbName] || { 
            formCode: item.dbName, 
            label: item.label,
            permission: false,
            add: false,
            edit: false,
            del: false,
            print: false
          };
        });
    }

    return list.map(item => {
      return selectedUserPerms[item.dbName] || { 
        formCode: item.dbName, 
        label: item.label,
        permission: false,
        add: false,
        edit: false,
        del: false,
        print: false
      };
    });
  }, [activeTab, selectedUserPerms, searchQuery]);

  const summary = useMemo(() => {
    const s = {
      total: 0,
      granted: 0,
      master: { permission: 0, add: 0, edit: 0, del: 0, print: 0 },
      transaction: {},
      report: { permission: 0, add: 0, edit: 0, del: 0, print: 0 }
    };
    s.transaction = { permission: 0, add: 0, edit: 0, del: 0, print: 0 };
    if (!perms[selectedUserId]) return s;
    Object.values(perms[selectedUserId]).forEach(p => {
      s.total += 5;
      const sec = p.modelShort === "M" ? s.master : p.modelShort === "T" ? s.transaction : s.report;
      if (p.permission) (sec.permission++, s.granted++);
      if (p.add) (sec.add++, s.granted++);
      if (p.edit) (sec.edit++, s.granted++);
      if (p.del) (sec.del++, s.granted++);
      if (p.print) (sec.print++, s.granted++);
    });
    return s;
  }, [perms, selectedUserId]);

  const selectedUserName = users.find(u => u.id === selectedUserId)?.name || "Select User";

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.8.1/font/bootstrap-icons.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
        }
        
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 20px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background-color: #307AC8;
        }
        
        input:checked + .slider:before {
          transform: translateX(20px);
        }
        
        input:disabled + .slider {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .react-select-container .react-select__control {
          border-radius: 6px;
          border: 1px solid #d1d5db;
          box-shadow: none;
          min-height: 38px;
          font-size: 14px;
        }
        
        .react-select-container .react-select__control:hover {
          border-color: #307AC8;
        }
        
        .react-select-container .react-select__control--is-focused {
          border-color: #307AC8;
          boxShadow: 0 0 0 2px rgba(48, 122, 200, 0.1);
        }
        
        @media (max-width: 1200px) {
          .main-content {
            flex-direction: column !important;
          }
          
          .left-column {
            margin-right: 0 !important;
            margin-bottom: 20px;
            flex: none !important;
          }
          
          .right-column {
            flex: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .table-container {
            min-width: 100% !important;
          }
          
          .tabs-select-row {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .tabs-container {
            width: 100% !important;
          }
          
          .select-container {
            width: 100% !important;
          }
        }
        
        @media (max-width: 768px) {
          .page-title {
            font-size: 20px !important;
          }
          
          .tabs-container {
            flex-wrap: wrap;
          }
          
          .tab-button {
            flex: 1 0 calc(33.333% - 8px) !important;
            min-width: 100px;
          }
          
          .master-header {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .search-container {
            width: 100% !important;
          }
          
          .table-container {
            max-height: 400px !important;
          }
        }
        
        @media (max-width: 576px) {
          .container {
            padding: 10px !important;
          }
          
          .table-container {
            max-height: 350px !important;
          }
          
          .stat-item {
            min-width: 45px !important;
          }
          
          .tab-button {
            padding: 8px 10px !important;
            font-size: 13px !important;
          }
        }
      `}</style>

      {/* Loading Overlay */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner}>
            <i className="bi bi-arrow-clockwise" style={{ fontSize: '32px', color: '#307AC8' }}></i>
            <p style={{ marginTop: '16px', color: '#307AC8', fontWeight: '600' }}>Loading...</p>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showConfirmPopup}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={confirmPopupConfig.title}
        message={confirmPopupConfig.message}
        confirmText={confirmPopupConfig.confirmText}
        cancelText={confirmPopupConfig.cancelText}
        type={confirmPopupConfig.type}
        showIcon={true}
        disableBackdropClose={false}
        showLoading={loading}
        defaultFocusedButton="confirm"
        borderColor="#307AC8"
        hideCancelButton={false}
      />

      <div style={styles.contentWrapper}>
       

        <div style={styles.mainContent} className="main-content">
          <div style={styles.leftColumn} className="left-column">
            {/* Tabs + Select User in ONE ROW */}
            <div style={styles.card}>
              <div style={styles.tabsSelectRow}>
                {/* Tabs */}
                <div style={styles.tabsContainer}>
                  <button
                    style={{
                      ...styles.tabButton,
                      ...(activeTab === "master" ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab("master")}
                  >
                    Master
                  </button>

                  <button
                    style={{
                      ...styles.tabButton,
                      ...(activeTab === "transaction" ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab("transaction")}
                  >
                    Transaction
                  </button>

                  <button
                    style={{
                      ...styles.tabButton,
                      ...(activeTab === "report" ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab("report")}
                  >
                    Report
                  </button>
                </div>

                {/* Custom Select User Button (opens popup) */}
                <div style={styles.selectContainer}>
                  <button
                    style={styles.customSelectButton}
                    onClick={handleUserPopupOpen}
                  >
                    <i className="bi bi-person" style={styles.selectButtonIcon}></i>
                    <span style={styles.selectButtonText}>
                      {selectedUserName}
                    </span>
                    <i className="bi bi-chevron-down" style={styles.selectButtonArrow}></i>
                  </button>
                </div>
              </div>
            </div>

            {/* MASTER Section with Title, Search, and Buttons in ONE ROW */}
            <div style={styles.card}>
              <div style={styles.masterHeader}>
                {/* Left: MASTER Title */}
                <h2 style={styles.masterTitle}>{activeTab.toUpperCase()}</h2>

                {/* Middle: Search Bar */}
                <div style={styles.searchContainer}>
                  <div style={styles.searchInputWrapper}>
                    <i className="bi bi-search" style={styles.searchIcon}></i>
                    <input
                      type="text"
                      placeholder={`Search in ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={styles.searchInput}
                    />
                    {searchQuery && (
                      <button onClick={handleClearSearch} style={styles.clearSearchButton}>
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Clear and Submit Buttons */}
                <div style={styles.actionButtons}>
                  <button style={styles.clearButton} onClick={handleClear}>
                    Clear
                  </button>
                  <button
                    style={{
                      ...styles.submitButton,
                      ...(selectedUserId === "0" ? styles.disabledButton : {})
                    }}
                    onClick={handleSubmit}
                    disabled={selectedUserId === "0" || loading}
                  >
                    {loading ? "Saving..." : "Submit"}
                  </button>
                </div>
              </div>

              {/* BIG Table Section */}
              <div style={styles.tableContainer} className="custom-scrollbar">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeaderCell}>No</th>
                      <th style={styles.tableHeaderCell}>Particulars</th>
                      <th style={{ ...styles.tableHeaderCell, ...styles.centerCell }}>Permission</th>
                      <th style={{ ...styles.tableHeaderCell, ...styles.centerCell }}>Add</th>
                      <th style={{ ...styles.tableHeaderCell, ...styles.centerCell }}>Edit</th>
                      <th style={{ ...styles.tableHeaderCell, ...styles.centerCell }}>Delete</th>
                      <th style={{ ...styles.tableHeaderCell, ...styles.centerCell }}>Print</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsForRender.length > 0 ? (
                      itemsForRender.map((it, i) => {
                        const dis = !it.permission || selectedUserId === "0";
                        return (
                          <tr key={it.formCode} style={styles.tableRow}>
                            <td style={styles.tableCell}>{i + 1}</td>
                            <td style={styles.tableCell}>
                              <span style={styles.itemLabel}>
                                {it.label}
                              </span>
                            </td>

                            <td style={{ ...styles.tableCell, ...styles.centerCell }}>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={!!it.permission}
                                  onChange={() => toggle(it.formCode, "permission")}
                                />
                                <span className="slider"></span>
                              </label>
                            </td>

                            <td style={{ ...styles.tableCell, ...styles.centerCell }}>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  disabled={dis}
                                  checked={!!it.add}
                                  onChange={() => toggle(it.formCode, "add")}
                                />
                                <span className="slider"></span>
                              </label>
                            </td>

                            <td style={{ ...styles.tableCell, ...styles.centerCell }}>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  disabled={dis}
                                  checked={!!it.edit}
                                  onChange={() => toggle(it.formCode, "edit")}
                                />
                                <span className="slider"></span>
                              </label>
                            </td>

                            <td style={{ ...styles.tableCell, ...styles.centerCell }}>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  disabled={dis}
                                  checked={!!it.del}
                                  onChange={() => toggle(it.formCode, "del")}
                                />
                                <span className="slider"></span>
                              </label>
                            </td>

                            <td style={{ ...styles.tableCell, ...styles.centerCell }}>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  disabled={dis}
                                  checked={!!it.print}
                                  onChange={() => toggle(it.formCode, "print")}
                                />
                                <span className="slider"></span>
                              </label>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ ...styles.tableCell, textAlign: 'center', padding: '40px' }}>
                          <div style={styles.noResults}>
                            <i className="bi bi-search" style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }}></i>
                            <p style={{ color: '#6b7280', marginBottom: '8px' }}>No results found for "{searchQuery}"</p>
                            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Try different search terms</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div style={styles.rightColumn} className="right-column">
            <div style={styles.card}>
              <h3 style={styles.summaryTitle}>Permission Summary</h3>

              <div style={styles.userInfo}>
                <i className="bi bi-person-circle" style={styles.userIcon}></i>
                <div style={styles.userName}>
                  {selectedUserName}
                </div>
              </div>

              <div style={styles.totalsSection}>
                <div style={styles.totalItem}>
                  <span style={styles.totalLabel}>Total</span>
                  <span style={styles.totalValue}>{summary.total}</span>
                </div>
                <div style={styles.totalItem}>
                  <span style={styles.totalLabel}>Granted</span>
                  <span style={styles.totalValue}>{summary.granted}/{summary.total}</span>
                </div>
              </div>

              <hr style={styles.divider} />

              <div style={styles.categorySection}>
                <h4 style={styles.categoryTitle}>Master</h4>
                <div style={styles.statsGrid}>
                  <div style={styles.statItem}>
                    <i className="bi bi-check-circle-fill" style={{ ...styles.statIcon, color: '#307AC8' }}></i>
                    <span style={styles.statValue}>{summary.master.permission}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-plus-circle-fill" style={{ ...styles.statIcon, color: '#28a745' }}></i>
                    <span style={styles.statValue}>{summary.master.add}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-pencil-square" style={{ ...styles.statIcon, color: '#ff9800' }}></i>
                    <span style={styles.statValue}>{summary.master.edit}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-trash3-fill" style={{ ...styles.statIcon, color: '#dc3545' }}></i>
                    <span style={styles.statValue}>{summary.master.del}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-printer-fill" style={{ ...styles.statIcon, color: '#6a1b9a' }}></i>
                    <span style={styles.statValue}>{summary.master.print}</span>
                  </div>
                </div>
              </div>

              <div style={styles.categorySection}>
                <h4 style={styles.categoryTitle}>Transaction</h4>
                <div style={styles.statsGrid}>
                  <div style={styles.statItem}>
                    <i className="bi bi-check-circle-fill" style={{ ...styles.statIcon, color: '#307AC8' }}></i>
                    <span style={styles.statValue}>{summary.transaction.permission}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-plus-circle-fill" style={{ ...styles.statIcon, color: '#28a745' }}></i>
                    <span style={styles.statValue}>{summary.transaction.add}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-pencil-square" style={{ ...styles.statIcon, color: '#ff9800' }}></i>
                    <span style={styles.statValue}>{summary.transaction.edit}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-trash3-fill" style={{ ...styles.statIcon, color: '#dc3545' }}></i>
                    <span style={styles.statValue}>{summary.transaction.del}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-printer-fill" style={{ ...styles.statIcon, color: '#6a1b9a' }}></i>
                    <span style={styles.statValue}>{summary.transaction.print}</span>
                  </div>
                </div>
              </div>

              <div style={styles.categorySection}>
                <h4 style={styles.categoryTitle}>Report</h4>
                <div style={styles.statsGrid}>
                  <div style={styles.statItem}>
                    <i className="bi bi-check-circle-fill" style={{ ...styles.statIcon, color: '#307AC8' }}></i>
                    <span style={styles.statValue}>{summary.report.permission}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-plus-circle-fill" style={{ ...styles.statIcon, color: '#28a745' }}></i>
                    <span style={styles.statValue}>{summary.report.add}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-pencil-square" style={{ ...styles.statIcon, color: '#ff9800' }}></i>
                    <span style={styles.statValue}>{summary.report.edit}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-trash3-fill" style={{ ...styles.statIcon, color: '#dc3545' }}></i>
                    <span style={styles.statValue}>{summary.report.del}</span>
                  </div>
                  <div style={styles.statItem}>
                    <i className="bi bi-printer-fill" style={{ ...styles.statIcon, color: '#6a1b9a' }}></i>
                    <span style={styles.statValue}>{summary.report.print}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PopupListSelector for User Selection */}
      <PopupListSelector
        open={showUserPopup}
        onClose={() => setShowUserPopup(false)}
        onSelect={handleUserSelect}
        fetchItems={fetchUsersForPopup}
        title="Select User"
        displayFieldKeys={['name', 'code']}
        searchFields={['name', 'code']}
        headerNames={['Name', 'Code']}
        columnWidths={{
          name: '70%',
          code: '30%'
        }}
        maxHeight="70vh"
        searchPlaceholder="Search user by name or code..."
        onCustomClose={() => setUserSearchTerm("")}
        clearSearch={() => setUserSearchTerm("")}
      />
    </div>
  );
};

// Inline CSS Styles (Keep all existing styles exactly the same)
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20',
    paddingTop: '90px',
    margin: '0',
    position: 'relative',
  },
  contentWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  actionButtonsContainer: {
    marginBottom: '20px',
    padding: '0 20px',
    fontSize: '18px',
    fontWeight: 'bold',
    width: '300px'
  },
  pageHeader: {
    padding: '16px 20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  brandLogo: {
    width: '60px',
    height: '60px',
    backgroundColor: '#307AC8',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: {
    fontSize: '32px',
    color: 'white',
  },
  brandName: {
    margin: '0',
    fontSize: '24px',
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: '0.5px',
  },
  pageTitle: {
    margin: '4px 0 0 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#6b7280',
  },
  loadingOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  loadingSpinner: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
  },
  mainContent: {
    display: 'flex',
    flex: '1',
    padding: '20px',
    gap: '20px',
  },
  leftColumn: {
    flex: '3',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: '0',
  },
  rightColumn: {
    flex: '1',
    minWidth: '320px',
    maxWidth: '400px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    transition: 'box-shadow 0.3s ease',
  },
  // Tabs + Select User Row Styles
  tabsSelectRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',

    flex: '1',
    minWidth: '300px',
  },
  tabButton: {
    flex: '1',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
    outline: 'none',
    minWidth: '100px',
  },
  activeTab: {
    backgroundColor: '#307AC8',
    color: 'white',
    borderColor: '#307AC8',
    fontWeight: '600',
  },
  selectContainer: {
    width: '250px',
    minWidth: '200px',
  },
  customSelectButton: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    outline: 'none',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#307AC8',
    },
    '&:focus': {
      borderColor: '#307AC8',
      boxShadow: '0 0 0 2px rgba(48, 122, 200, 0.1)',
    }
  },
  selectButtonIcon: {
    color: '#6b7280',
    fontSize: '16px',
    marginRight: '8px',
  },
  selectButtonText: {
    flex: '1',
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  selectButtonArrow: {
    color: '#6b7280',
    fontSize: '14px',
    marginLeft: '8px',
  },
  // MASTER Header with Title, Search, and Buttons
  masterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  masterTitle: {
    margin: '0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    flexShrink: 0,
  },
  searchContainer: {
    flex: '1',
    maxWidth: '400px',
    minWidth: '200px',
  },
  searchInputWrapper: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    fontSize: '16px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#f8fafc',
    '&:focus': {
      borderColor: '#307AC8',
      backgroundColor: 'white',
      boxShadow: '0 0 0 2px rgba(48, 122, 200, 0.1)',
    }
  },
  clearSearchButton: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '16px',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    flexShrink: 0,
  },
  clearButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
    minWidth: '80px',
    '&:hover': {
      backgroundColor: '#f3f4f6',
    }
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#307AC8',
    border: '1px solid #307AC8',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
    minWidth: '80px',
    '&:hover': {
      backgroundColor: '#2563eb',
    }
  },
  disabledButton: {
    opacity: '0.5',
    cursor: 'not-allowed',
  },
  // BIG Table Styles
  tableContainer: {
    overflow: 'auto',
    maxHeight: 'calc(100vh - 300px)',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    minHeight: '400px',
  },
  table: {
    width: '100%',

    borderCollapse: 'collapse',
    minWidth: '800px',
  },
  tableHeaderCell: {
    padding: '14px 16px',

    backgroundColor: 'white',
    borderBottom: '2px solid #e5e7eb',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '700',

    position: 'sticky',
    top: '0',
    zIndex: '10',
    whiteSpace: 'nowrap',
  },
  centerCell: {
    textAlign: 'center',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    '&:hover': {
      backgroundColor: '#f8fafc',
    },
  },
  tableCell: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#374151',
    whiteSpace: 'nowrap',
  },
  itemLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  noResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  summaryTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  userIcon: {
    fontSize: '48px',
    color: '#307AC8',
    marginBottom: '8px',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#307AC8',
    textAlign: 'center',
  },
  totalsSection: {
    marginBottom: '20px',
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  totalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  totalLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
  },
  divider: {
    border: 'none',
    borderTop: '2px solid #e5e7eb',
    margin: '20px 0',
  },
  categorySection: {
    marginBottom: '20px',
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  categoryTitle: {
    margin: '0 0 12px 0',
    fontSize: '15px',
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  statsGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    flex: '1',
    minWidth: '50px',
  },
  statIcon: {
    fontSize: '20px',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1f2937',
  },
};

export default Administration;