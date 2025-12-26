import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import PopupListSelector from "../../components/Listpopup/PopupListSelector";
import { API_ENDPOINTS } from "../../api/endpoints";
import apiService from "../../api/apiService";
import { AddButton, EditButton, DeleteButton } from "../../components/Buttons/ActionButtons";
import ConfirmationPopup from "../../components/ConfirmationPopup/ConfirmationPopup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSION_CODES } from "../../constants/permissions";

// --- Inline SVG icons (matching ColorCreation style) ---
const Icon = {
  Plus: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
    </svg>
  ),
  Edit: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  ),
  Trash: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  ),
  Search: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
    </svg>
  ),
  Close: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.29 19.71 2.88 18.29 9.18 12 2.88 5.71 4.29 4.29 16.88 16.88z" />
    </svg>
  ),
  Refresh: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M17.65 6.35A8 8 0 103.95 15.5H6a6 6 0 118.9-5.31l-1.9-1.9h6v6l-2.35-2.35z" />
    </svg>
  ),
  Check: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  ),
  Info: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
};

export default function UserCreation() {
  // ---------- Permissions ----------
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.USER_CREATION),
    edit: hasModifyPermission(PERMISSION_CODES.USER_CREATION),
    delete: hasDeletePermission(PERMISSION_CODES.USER_CREATION)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // ---------- state ----------
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({ 
    company: "", 
    companyCode: "", 
    username: "", 
    password: "", 
    prefix: "",
    userId: null,
    code: "" 
  });
  
  const [actionType, setActionType] = useState("Add"); // 'Add' | 'edit' | 'delete'
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [prefixError, setPrefixError] = useState("");

  // modals & queries
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyQuery, setCompanyQuery] = useState("");
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editQuery, setEditQuery] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteQuery, setDeleteQuery] = useState("");

  const [existingQuery, setExistingQuery] = useState("");

  // New confirmation popup states
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [deleteWarningMessage, setDeleteWarningMessage] = useState("");

  // Refs
  const companyRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const prefixRef = useRef(null);
  const submitRef = useRef(null);

  // Responsive state
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------- API functions ----------
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.get(API_ENDPOINTS.user_creation.getuserdetails);
      console.log("Companies API Response:", response);
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && Array.isArray(response)) {
        data = response;
      }
      
      console.log("Fetched companies:", data);
      setCompanies(data || []);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Failed to load companies";
      setError(errorMsg);
      console.error("Companies API Error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.get(API_ENDPOINTS.user_creation.getDropdown);
      console.log("Users API Response:", response);

      // Handle different response structures
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && Array.isArray(response)) {
        data = response;
      }
      
      console.log("Fetched users:", data);
      setUsers(data || []);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Failed to load users";
      setError(errorMsg);
      console.error("Users API Error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    console.log("Creating user with data:", userData);

    try {
      setIsProcessing(true);
      setError("");

      const response = await apiService.post(
        API_ENDPOINTS.user_creation.postCreate,
        userData
      );

      console.log("Create User Response:", response.data);
      return response.data;

    } catch (err) {
      console.error("Create User API Error:", err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      setIsProcessing(true);
      setError("");
      const response = await apiService.put(API_ENDPOINTS.user_creation.putEdit, userData);
      console.log("Update User Response:", response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.message || "Failed to update user";
      setError(errorMsg);
      console.error("Update User API Error:", err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteUser = async (userId) => {
    console.log("Deleting user with ID:", userId);
    try {
      setIsProcessing(true);
      setError("");
      
      const response = await apiService.del(
        API_ENDPOINTS.user_creation.delete(userId)
      );
      
      console.log("Delete User Response:", response);
      
      if (response && response.data) {
        return response.data;
      }
      
      return { success: true };
      
    } catch (err) {
      console.error("Delete User API Error:", err);
      
      // Handle error messages
      let errorMessage = "Failed to delete user";
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 409) {
          errorMessage = "User is referenced in other tables and cannot be deleted";
        } else if (status === 404) {
          errorMessage = "User not found";
        } else if (data && data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Server error (${status})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- effects ----------
  useEffect(() => {
    loadInitial();
  }, []);

  // Load both companies and users
  const loadInitial = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCompanies(), fetchUsers()]);
    } catch (err) {
      console.error("Error loading initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Focus on company field on initial load/reload
  useEffect(() => {
    const timer = setTimeout(() => {
      if (companyRef.current) {
        companyRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Additional focus for when actionType changes
  useEffect(() => {
    if (actionType === "edit" || actionType === "Add") {
      const timer = setTimeout(() => {
        if (companyRef.current) companyRef.current.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [actionType]);

  // ---------- handlers ----------
  const openCompanyModal = () => {
    setCompanyQuery("");
    setCompanyModalOpen(true);
    companyRef.current?.focus();
  };

  const selectCompany = (company) => {
    // Extract company code and name based on API response structure
    const companyCode = company.fCompCode || company.code || company.fCompCode || "";
    const companyName = company.fCompName || company.companyName || company.fCompName || "";
    
    setForm(prev => ({ 
      ...prev, 
      company: `${companyCode} - ${companyName}`,
      companyCode: companyCode 
    }));
    
    setCompanyModalOpen(false);
    setTimeout(() => usernameRef.current?.focus(), 60);
  };

  const handleEditRowClick = (user) => {
    // Extract user data based on API response structure
    // user.code is the USER code
    // user.fCompCode is the COMPANY code
    const userCode = user.code || user.id;
    const companyCode = user.fCompCode || user.compCode || "";
    const companyName = user.compaytName || user.companyName || "";
    
    setForm({ 
      company: `${companyCode} - ${companyName}`,
      companyCode: companyCode,
      username: user.userName || "", 
      password: user.password || "", 
      prefix: user.fPrefix || "",
      userId: userCode
    });
    setActionType("edit");
    setEditingId(userCode);
    setEditModalOpen(false);
    setTimeout(() => usernameRef.current?.focus(), 1060);
  };

  const handleDeleteRowClick = (user) => {
    // Extract user data based on API response structure
    // user.code is the USER code
    // user.fCompCode is the COMPANY code
    const userCode = user.code || user.id;
    const companyCode = user.fCompCode || user.compCode || "";
    const companyName = user.compaytName || user.companyName || "";
    
    setForm({ 
      company: `${companyCode} - ${companyName}`,
      companyCode: companyCode,
      username: user.userName || "", 
      password: user.password || "", 
      prefix: user.fPrefix || "",
      userId: userCode
    });
    setActionType("delete");
    setDeleteTargetId(userCode);
    setDeleteModalOpen(false);
    setTimeout(() => submitRef.current?.focus(), 1060);
  };

  const handleAdd = async () => {
    // === PERMISSION CHECK ===
    if (!formPermissions.add) {
      setError("You do not have permission to create users.");
      return;
    }
    // === END PERMISSION CHECK ===

    if (!form.companyCode || !form.username || !form.password) {
      toast.warning(
        "Please fill required fields: Company, Username, Password.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      return;
    }

    // Show confirmation popup
    setConfirmSaveOpen(true);
  };

  const confirmSave = async () => {
    try {
      setIsProcessing(true);
      const userData = {
        code: "009", // You might want to generate this dynamically
        userName: form.username,
        password: form.password,
        fCompCode: form.companyCode,
        fPrefix: form.prefix || ""
      };

      console.log("Creating user with data:", userData);
      await createUser(userData);
      await fetchUsers();

      setSuccessMessage("User created successfully.");
      // toast.success(`User "${form.username}" created successfully.`);
      setConfirmSaveOpen(false);
      resetForm();

      setTimeout(() => {
        if (companyRef.current) companyRef.current.focus();
      }, 60);

    } catch (err) {
      setConfirmSaveOpen(false);

      // Handle duplicate prefix
      if (err.response?.status === 409) {
        setError("");
        setPrefixError(
          err.response?.data?.message ||
          "Prefix already exists. Choose a different one."
        );
        return;
      }

      const errorMsg = err.message || "Failed to create user";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = async () => {
    // === PERMISSION CHECK ===
    if (!formPermissions.edit) {
      setError("You do not have permission to edit users.");
      return;
    }
    // === END PERMISSION CHECK ===

    if (!editingId) {
      setError("No user selected to update.");
      return;
    }
    if (!form.companyCode || !form.username) {
      setError("Please fill Company and Username.");
      return;
    }

    // Show confirmation popup
    setConfirmEditOpen(true);
  };

  const confirmEdit = async () => {
    try {
      setIsProcessing(true);
      const userData = {
        code: editingId,
        userName: form.username,
        password: form.password,
        fCompCode: form.companyCode,
        fPrefix: form.prefix || ""
      };

      console.log("Updating user with data:", userData);
      await updateUser(userData);
      await fetchUsers();
      
      setEditingId(null);
      setSuccessMessage("User updated successfully.");
      // toast.success(`User "${form.username}" updated successfully.`);
      setConfirmEditOpen(false);
      resetForm();
    } catch (err) {
      const errorMsg = err.message || "Failed to update user";
      setError(errorMsg);
      toast.error(errorMsg);
      setConfirmEditOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    // === PERMISSION CHECK ===
    if (!formPermissions.delete) {
      setError("You do not have permission to delete users.");
      return;
    }
    // === END PERMISSION CHECK ===

    if (!deleteTargetId) {
      setError("No user selected to delete.");
      return;
    }

    // Show confirmation popup
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsProcessing(true);
      await deleteUser(deleteTargetId);
      await fetchUsers();
      
      setDeleteTargetId(null);
      setSuccessMessage("User deleted successfully.");
      // toast.success(`User "${form.username}" deleted successfully.`);
      setConfirmDeleteOpen(false);
      resetForm();
    } catch (err) {
      const errorMsg = err.message || "";
      
      if (errorMsg.includes("used in related tables") || 
          errorMsg.includes("409") || 
          errorMsg.includes("Conflict") ||
          errorMsg.includes("User Name is used") ||
          errorMsg.includes("foreign key") ||
          errorMsg.includes("reference")) {
        
        setDeleteWarningMessage(`
          Cannot Delete User: "${form.username}" (Code: ${deleteTargetId})
          
          Reason: This user is referenced in other system tables.
          
          Please contact your system administrator.
        `);
        
        setShowDeleteWarning(true);
      } else {
        const errorDisplay = `Failed to delete user: ${errorMsg}`;
        setError(errorDisplay);
        toast.error(errorDisplay);
      }
      setConfirmDeleteOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (actionType === "Add") await handleAdd();
    else if (actionType === "edit") await handleEdit();
    else if (actionType === "delete") await handleDelete();
  };

  const resetForm = (keepAction = false) => {
    setForm({ company: "", companyCode: "", username: "", password: "", prefix: "", userId: null });
    setEditingId(null);
    setDeleteTargetId(null);
    setExistingQuery("");
    setEditQuery("");
    setDeleteQuery("");
    setCompanyQuery("");
    setError("");
    setSuccessMessage("");
    setPrefixError("");
    if (!keepAction) setActionType("Add");
    
    setTimeout(() => companyRef.current?.focus(), 60);
    setActionType("Add")
  };

  // Fetch items for popup list selector
  const fetchCompaniesForModal = useCallback(async (page = 1, search = '') => {
    const pageSize = 20;
    const q = (search || '').trim().toLowerCase();
    
    const filtered = q
      ? companies.filter(c => 
          (c.fCompCode || c.code || '').toString().toLowerCase().includes(q) || 
          (c.fCompName || c.companyName || '').toString().toLowerCase().includes(q)
        )
      : companies;
    
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [companies]);

  const fetchUsersForModal = useCallback(async (page = 1, search = '') => {
    const pageSize = 20;
    const q = (search || '').trim().toLowerCase();
    
    const filtered = q
      ? users.filter(u => 
          (u.code || '').toString().toLowerCase().includes(q) || 
          (u.userName || '').toString().toLowerCase().includes(q) ||
          (u.compaytName || u.companyName || '').toString().toLowerCase().includes(q)
        )
      : users;
    
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [users]);

  const onCompanyKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      usernameRef.current?.focus();
    }
  };

  const onCompanyChange = (e) => {
    const v = e.target.value || "";
    // update local form value
    setForm(s => ({ ...s, company: v }));
    // set query used by the popup
    setCompanyQuery(v);
    // open selector so user sees filtered results while typing
    setCompanyModalOpen(true);
  };

  const onUsernameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const onPasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      prefixRef.current?.focus();
    }
  };

  const onPrefixKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitRef.current?.focus();
    }
  };

  // ---------- filtered data ----------
  const filteredExisting = useMemo(() => {
    const q = existingQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => 
        (u.code || "").toString().toLowerCase().includes(q) || 
        (u.userName || "").toString().toLowerCase().includes(q) ||
        (u.compaytName || u.companyName || "").toString().toLowerCase().includes(q)
    );
  }, [existingQuery, users]);

  // Helper functions to safely get data
  const getCompanyName = (user) => user.compaytName || user.companyName || '';
  const getUserName = (user) => user.userName || '';
  const getCode = (user) => user.code || '';
  const getCompanyCode = (company) => company.fCompCode || company.code || '';
  const getCompanyDisplayName = (company) => company.fCompName || company.companyName || '';

  return (
    <div className="uc-root" role="region" aria-labelledby="user-creation-title">
      {/* Google/Local font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@500;700&display=swap" rel="stylesheet" />

      <style>{`
        /* Blue theme (matching ColorCreation) */
        :root{
          --bg-1: #f0f7fb;
          --bg-2: #f7fbff;
          --glass: rgba(255,255,255,0.55);
          --glass-2: rgba(255,255,255,0.35);
          --accent: #307AC8;
          --accent-2: #1B91DA;
          --accent-3: #06A7EA;
          --success: #06A7EA;
          --danger: #ef4444;
          --warning: #f59e0b;
          --muted: #64748b;
          --card-shadow: 0 8px 30px rgba(16,24,40,0.08);
          --glass-border: rgba(255,255,255,0.45);
        }

        /* Page layout */
        .uc-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 16px;
          background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
          font-family: 'Poppins', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          font-size: 12px;
          box-sizing: border-box;
        }

        /* Main dashboard card (glass) */
        .dashboard {
          width: 100%;
          max-width: 700px;
          border-radius: 16px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.75), rgba(245,248,255,0.65));
          box-shadow: var(--card-shadow);
          backdrop-filter: blur(8px) saturate(120%);
          border: 1px solid rgba(255,255,255,0.6);
          overflow: visible;
          transition: transform 260ms cubic-bezier(.2,.8,.2,1);
        }
        .dashboard:hover { transform: translateY(-6px); }

        /* header */
        .top-row {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .title-block {
          display:flex;
          align-items: center;
          gap:12px;
        }
        .title-block h2 {
          margin:0;
          font-family: 'Poppins', 'Inter', sans-serif;
          font-size: 20px;
          color: #0f172a;
          letter-spacing: -0.2px;
        }
        .subtitle {
          color: var(--muted);
          font-size: 14px;
        }

        /* action pills */
        .actions {
          display:flex;
          gap:10px;
          align-items:center;
          flex-wrap:wrap;
        }
        .action-pill {
          display:inline-flex;
          gap:8px;
          align-items:center;
          padding:10px 12px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(250,250,252,0.9));
          border: 1px solid var(--glass-border);
          cursor:pointer;
          box-shadow: 0 6px 16px rgba(2,6,23,0.04);
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .action-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(2,6,23,0.08);
        }
        .action-pill:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }
        .action-pill.primary { color:white; background: linear-gradient(180deg, var(--accent), var(--accent-2)); }
        .action-pill.warn { color:white; background: linear-gradient(180deg, var(--warning), #f97316); }
        .action-pill.danger { color:white; background: linear-gradient(180deg, var(--danger), #f97373); }

        .grid {
          display: block;
          width: 100%;
        }

        /* left card (form) */
        .card {
          background: rgba(255,255,255,0.85);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(15,23,42,0.04);
          box-shadow: 0 6px 20px rgba(12,18,35,0.06);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        label.field-label {
          display:block;
          margin-bottom:6px;
          font-weight:700;
          color:#0f172a;
          font-size:14px;
          text-align: left;
          width: 100%;
        }
        .asterisk {
          color: var(--danger);
          font-weight: 700;
        }

        .field { margin-bottom:12px; display:flex; flex-direction:column; align-items:flex-start; }

        .row { 
          display:flex; 
          gap:8px; 
          align-items:center; 
          width:100%;
          flex-wrap: wrap;
        }
        .input, .search {
          flex:1;
          min-width: 0;
          padding:10px 12px;
          border-radius:10px;
          border: 1px solid rgba(15,23,42,0.06);
          background: linear-gradient(180deg, #fff, #fbfdff);
          font-size:14px;
          color:#0f172a;
          box-sizing:border-box;
          transition: box-shadow 160ms ease, transform 120ms ease, border-color 120ms ease;
          text-align: left;
        }
        .input:focus, .search:focus { 
          outline:none; 
          box-shadow: 0 8px 26px rgba(48,122,200,0.08); 
          transform: translateY(-1px); 
          border-color: rgba(48,122,200,0.25); 
        }
        .input:read-only {
          background: #f8fafc;
          color: var(--muted);
          cursor: not-allowed;
        }

       .company-input {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 10px;

  /* ✅ REMOVE BLACK BORDER */
  border: 1px solid #e5e7eb;

  background: #f8fafc;
  font-size: 14px;
  color: #0f172a;
  box-sizing: border-box;
  cursor: pointer;

  /* ✅ IMPORTANT */
  outline: none;
}

        .company-input:hover:not(:disabled) {
          background: #f1f5f9;
          
        }

        .btn {
          padding:10px 12px;
          border-radius:10px;
          border:1px solid rgba(12,18,35,0.06);
          background: linear-gradient(180deg,#fff,#f8fafc);
          cursor:pointer;
          min-width:86px;
          font-weight:600;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(12,18,35,0.1);
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .controls { display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; }

        /* right side panel */
        .side {
          display:flex;
          flex-direction:column;
          gap:12px;
        }
        .stat {
          background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(250,251,255,0.7));
          border-radius: 12px;
          padding:12px;
          border: 1px solid rgba(12,18,35,0.04);
        }
        .muted { color: var(--muted); font-size:15px; }

        /* message */
        .message {
          margin-top:8px;
          padding:12px;
          border-radius:10px;
          font-weight:600;
          font-size: 12px;
        }
        .message.error { background: #fff1f2; color: #9f1239; border: 1px solid #ffd7da; }
        .message.success { background: #f0fdf4; color: #064e3b; border: 1px solid #bbf7d0; }
        .message.warning { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

        /* submit row */
        .submit-row { 
          display:flex; 
          gap:12px; 
          margin-top:14px; 
          align-items:center; 
          flex-wrap:wrap; 
          justify-content: flex-end;
        }
        .submit-primary {
          padding:12px 16px;
          background: linear-gradient(180deg,var(--accent),var(--accent-2));
          color:white;
          border-radius:10px;
          border:none;
          font-weight:700;
          cursor:pointer;
          min-width: 120px;
          transition: all 0.2s;
          font-size: 14px;
        }
        .submit-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(48,122,200,0.25);
        }
        .submit-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }
        .submit-clear {
          padding:10px 12px;
          background:#fff;
          border:1px solid rgba(12,18,35,0.06);
          border-radius:10px;
          cursor:pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        .submit-clear:hover:not(:disabled) {
          background: #f8fafc;
          border-color: rgba(48,122,200,0.3);
          transform: translateY(-1px);
        }
        
        /* search container */
        .search-container {
          position: relative;
          width: 100%;
        }

        .search-with-clear {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 12px;
          transition: all 0.2s;
          background: #fff;
        }

        .search-with-clear:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(48, 122, 200, 0.1);
        }

        .clear-search-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #6b7280;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clear-search-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        /* users table */
        .users-table-container {
          max-height: 400px;
          overflow-y: auto;
          border-radius: 8px;
          border: 1px solid rgba(12,18,35,0.04);
          margin-top: 12px;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .users-table th {
          position: sticky;
          top: 0;
          background: linear-gradient(180deg, #f8fafc, #f1f5f9);
          padding: 12px;
          text-align: left;
          font-weight: 700;
          color: var(--accent);
          border-bottom: 2px solid var(--accent);
          font-size: 14px;
        }

        .users-table td {
          padding: 12px;
          border-bottom: 1px solid rgba(230, 244, 255, 0.8);
          color: #3a4a5d;
        }

        .users-table tr:hover {
          background: linear-gradient(90deg, rgba(48,122,200,0.04), rgba(48,122,200,0.01));
          cursor: pointer;
        }

        .users-table tr.selected {
          background: linear-gradient(90deg, rgba(48,122,200,0.1), rgba(48,122,200,0.05));
          box-shadow: inset 2px 0 0 var(--accent);
        }

        /* modal overlay (glass) */
        .modal-overlay {
          position:fixed; 
          inset:0; 
          display:flex; 
          align-items:center; 
          justify-content:center; 
          background: rgba(2,6,23,0.46); 
          z-index:1200; 
          padding:20px;
          backdrop-filter: blur(4px);
        }
        .modal {
          width:100%; 
          max-width:720px; 
          max-height:80vh; 
          overflow:auto; 
          background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(245,248,255,0.8));
          border-radius:12px; 
          padding:14px;
          border:1px solid rgba(255,255,255,0.5);
          box-shadow: 0 18px 50px rgba(2,6,23,0.36);
          backdrop-filter: blur(8px);
        }

        .dropdown-list { 
          max-height:50vh; 
          overflow:auto; 
          border-top:1px solid rgba(12,18,35,0.03); 
          border-bottom:1px solid rgba(12,18,35,0.03); 
          padding:6px 0; 
        }
        .dropdown-item { 
          padding:12px; 
          border-bottom:1px solid rgba(12,18,35,0.03); 
          cursor:pointer; 
          display:flex; 
          flex-direction:column; 
          gap:4px; 
          text-align: left;
          transition: all 0.2s;
        }
        .dropdown-item:hover { 
          background: linear-gradient(90deg, rgba(48,122,200,0.04), rgba(48,122,200,0.01)); 
          transform: translateX(6px); 
        }

        /* tips panel */
        .tips-panel {
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,249,255,0.8));
          border-left: 3px solid var(--accent);
        }

        /* Responsive styles */
        @media (max-width: 1024px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .side {
            order: 2;
          }
          .card {
            order: 1;
          }
        }

        @media (max-width: 768px) {
          .uc-root {
            padding: 16px 12px;
          }
          .dashboard {
            padding: 16px;
            max-width: 100%;
          }
          .top-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .actions {
            width: 100%;
            justify-content: space-between;
          }
          .action-pill {
            flex: 1;
            justify-content: center;
            min-width: 0;
          }
          .users-table-container {
            max-height: 300px;
          }
        }

        @media (max-width: 480px) {
          .uc-root {
            padding: 12px 8px;
          }
          .dashboard {
            padding: 12px;
            border-radius: 12px;
          }
          .title-block h2 {
            font-size: 18px;
          }
          .action-pill {
            padding: 8px 10px;
            font-size: 12px;
          }
          .input, .search, .company-input {
            padding: 8px 10px;
            font-size: 12px;
          }
          .btn {
            padding: 8px 10px;
            min-width: 70px;
            font-size: 12px;
          }
          .submit-primary, .submit-clear {
            flex: 1;
            min-width: 0;
          }
          .users-table th,
          .users-table td {
            padding: 8px;
            font-size: 12px;
          }
          .modal-overlay {
            padding: 12px;
          }
          .modal {
            padding: 12px;
          }
        }

        @media (max-width: 360px) {
          .uc-root {
            padding: 8px 6px;
          }
          .dashboard {
            padding: 10px;
          }
          .title-block { 
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .actions {
            gap: 6px;
          }
          .action-pill {
            padding: 6px 8px;
            font-size: 11px;
          }
          .card {
            padding: 12px;
          }
          .stat {
            padding: 10px;
          }
        }

        /* Loading animation */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .loading {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="dashboard" aria-labelledby="user-creation-title">
        <div className="top-row">
          <div className="title-block">
            <svg width="38" height="38" viewBox="0 0 24 24" aria-hidden focusable="false">
              <rect width="24" height="24" rx="6" fill="#eff6ff" />
              <path d="M6 12h12M6 8h12M6 16h12" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h2 id="user-creation-title">User Creation</h2>
              <div className="subtitle muted">Create or modify user accounts</div>
            </div>
          </div>

          <div className="actions" role="toolbar" aria-label="actions">
            <AddButton 
              onClick={() => { 
                setActionType("Add"); 
                resetForm(true); 
              }} 
              disabled={loading || isProcessing || !formPermissions.add} 
              isActive={actionType === "Add"} 
            />
            <EditButton 
              onClick={() => setEditModalOpen(true)} 
              disabled={loading || isProcessing || !formPermissions.edit} 
              isActive={actionType === "edit"} 
            />
            <DeleteButton 
              onClick={() => setDeleteModalOpen(true)} 
              disabled={loading || isProcessing || !formPermissions.delete} 
              isActive={actionType === "delete"} 
            />
          </div>
        </div>

        <div className="grid" role="main">
          <div className="card" aria-live="polite">
            {/* Form section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Company field */}
              <div className="field">
                <label className="field-label">
                  Company <span className="asterisk">*</span>
                </label>
                <div className="row">
                  <input
                    ref={companyRef}
                    className="company-input"
                    value={form.company}
                    onChange={onCompanyChange}
                    onKeyDown={onCompanyKeyDown}
                    onClick={openCompanyModal}
                    disabled={loading || isProcessing || actionType === "delete"}
                    aria-label="Company"
                    readOnly={false}
                  />
                </div>
              </div>

              {/* Username field */}
              <div className="field">
                <label className="field-label">
                  Username <span className="asterisk">*</span>
                </label>
                <div className="row">
                  <input
                    ref={usernameRef}
                    className="input"
                    value={form.username}
                    onChange={(e) => setForm(s => ({ ...s, username: e.target.value }))}
                    onKeyDown={onUsernameKeyDown}
                    disabled={loading || isProcessing || actionType === "delete"}
                    aria-label="Username"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="field">
                <label className="field-label">
                  Password <span className="asterisk">*</span>
                </label>
                <div className="row">
                  <input
                    ref={passwordRef}
                    type="password"
                    className="input"
                    value={form.password}
                    onChange={(e) => setForm(s => ({ ...s, password: e.target.value }))}
                    onKeyDown={onPasswordKeyDown}
                    disabled={loading || isProcessing || actionType === "delete"}
                    aria-label="Password"
                  />
                </div>
              </div>

              {/* Prefix field */}
              <div className="field">
                <label className="field-label">
                  Prefix
                </label>
                <div className="row">
                  <input
                    ref={prefixRef}
                    type="text"
                    maxLength={2}
                    className="input"
                    value={form.prefix}
                    onChange={(e) => {
                      setForm(s => ({ ...s, prefix: e.target.value }));
                      setPrefixError("");
                    }}
                    onKeyDown={onPrefixKeyDown}
                    disabled={loading || isProcessing}
                    aria-label="Prefix"
                  />
                </div>
                {prefixError && (
                  <div className="message error" style={{ marginTop: "8px" }}>
                    {prefixError}
                  </div>
                )}
              </div>

              {/* Message display */}
              {error && (
                <div className="message error" role="alert">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="message success" role="alert">
                  {successMessage}
                </div>
              )}

              {/* Submit controls */}
              <div className="submit-row">
                <button
                  className="submit-primary"
                  ref={submitRef}
                  onClick={handleSubmit}
                  disabled={loading || isProcessing}
                  type="button"
                >
                  {loading ? "Processing..." : actionType === "Add" ? "Save" : actionType === "edit" ? "Update" : "Delete"}
                </button>
                <button
                  className="submit-clear"
                  onClick={resetForm}
                  disabled={loading || isProcessing}
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Existing Users Table */}
            <div className="stat" style={{ flex: 1, minHeight: "200px" }}>
              <div className="muted" style={{ marginBottom: "10px" }}>Existing Users</div>
              <div className="search-container" style={{ marginBottom: "10px" }}>
                <input
                  className="search-with-clear"
                  placeholder="Search existing users"
                  value={existingQuery}
                  onChange={(e) => setExistingQuery(e.target.value)}
                  aria-label="Search existing users"
                />
                {existingQuery && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setExistingQuery("")}
                    type="button"
                    aria-label="Clear search"
                  >
                    <Icon.Close size={16} />
                  </button>
                )}
              </div>
              
              <div className="users-table-container">
                {loading ? (
                  <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }} className="loading">
                    Loading Users...
                  </div>
                ) : filteredExisting.length === 0 ? (
                  <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>
                    {users.length === 0 ? "No users found" : "No matching users"}
                  </div>
                ) : (
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Username</th>
                        <th>Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExisting.map((u) => (
                        <tr 
                          key={getCode(u)}
                          className={form.code === getCode(u) ? "selected" : ""}
                          onClick={() => {
                            setForm({ 
                              company: `${getCode(u)} - ${getCompanyName(u)}`,
                              companyCode: getCode(u),
                              username: getUserName(u), 
                              password: "", 
                              prefix: u.fPrefix || "",
                              userId: getCode(u) 
                            });
                            setActionType("edit");
                          }}
                        >
                          <td>{getCode(u)}</td>
                          <td>{getUserName(u)}</td>
                          <td>{getCompanyName(u)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Selection Popup */}
      <PopupListSelector
        open={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        clearSearch={() => setCompanyQuery("")}
        initialSearch={companyQuery}
        onSelect={selectCompany}
        fetchItems={fetchCompaniesForModal}
        title="Select Company"
        displayFieldKeys={[, 'fCompName']}
        searchFields={[, 'fCompName']}
        headerNames={[, 'Company Name']}
        columnWidths={{  fCompName: '70%' }}
        maxHeight="60vh"
      />

      {/* User Edit Selection Popup */}
      <PopupListSelector
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSelect={handleEditRowClick}
        fetchItems={fetchUsersForModal}
        title="Select User to Edit"
        displayFieldKeys={[, 'userName', 'compaytName']}
        searchFields={[, 'userName', 'compaytName']}
        headerNames={[, 'Username', 'Company']}
        columnWidths={{  userName: '30%', compaytName: '50%' }}
        maxHeight="60vh"
      />

      {/* User Delete Selection Popup */}
      <PopupListSelector
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSelect={handleDeleteRowClick}
        fetchItems={fetchUsersForModal}
        title="Select User to Delete"
        displayFieldKeys={[, 'userName', 'compaytName']}
        searchFields={[, 'userName', 'compaytName']}
        headerNames={[, 'Username', 'Company']}
        columnWidths={{  userName: '30%', compaytName: '50%' }}
        maxHeight="60vh"
      />

      {/* Create Confirmation Popup */}
      <ConfirmationPopup
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={confirmSave}
        title="Create  User"
        message={`Do you want to save?`}
        type="success"
        confirmText={isProcessing ? "Creating..." : "Yes"}
        showLoading={isProcessing}
        disableBackdropClose={isProcessing}
        customStyles={{
          modal: {
            borderTop: '4px solid #06A7EA'
          },
          confirmButton: {
            style: {
              background: 'linear-gradient(90deg, #307AC8ff, #06A7EAff)'
            }
          }
        }}
      />

      {/* Edit Confirmation Popup */}
      <ConfirmationPopup
        isOpen={confirmEditOpen}
        onClose={() => setConfirmEditOpen(false)}
        onConfirm={confirmEdit}
        title="Update User"
         message={`Do you want to modify?`}
        type="warning"
        confirmText={isProcessing ? "Updating..." : "Yes"}
        showLoading={isProcessing}
        disableBackdropClose={isProcessing}
        customStyles={{
          modal: {
            borderTop: '4px solid #F59E0B'
          },
          confirmButton: {
            style: {
              background: 'linear-gradient(90deg, #F59E0Bff, #FBBF24ff)'
            }
          }
        }}
      />

      {/* Delete Confirmation Popup */}
      <ConfirmationPopup
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Do you want to delete?`}
        type="danger"
        confirmText={isProcessing ? "Deleting..." : "Yes"}
        showLoading={isProcessing}
        disableBackdropClose={isProcessing}
        customStyles={{
          modal: {
            borderTop: '4px solid #EF4444'
          },
          confirmButton: {
            style: {
              background: 'linear-gradient(90deg, #EF4444ff, #F87171ff)'
            }
          }
        }}
      />

      {/* Delete Warning Modal */}
      {showDeleteWarning && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: isMobile ? '18px 22px' : '22px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: isMobile ? '18px' : '20px', 
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                flex: 1,
                letterSpacing: '-0.01em',
              }}>
                ⚠️ Delete Operation Failed
              </h3>
              <button
                onClick={() => setShowDeleteWarning(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  fontSize: isMobile ? '24px' : '28px',
                  color: 'white',
                  cursor: 'pointer',
                  width: isMobile ? '32px' : '36px',
                  height: isMobile ? '32px' : '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                  flexShrink: 0,
                  marginLeft: '12px',
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onFocus={(e) => e.target.style.outline = 'none'}
              >
                ×
              </button>
            </div>

            <div style={{ 
              padding: isMobile ? '22px 18px' : '32px 28px',
            }}>
              <div style={{ 
                fontSize: isMobile ? '15px' : '16px', 
                color: '#1e293b',
                lineHeight: 1.6,
                margin: 0,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                whiteSpace: 'pre-line',
              }}>
                {deleteWarningMessage}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: isMobile ? '12px' : '12px',
                marginTop: isMobile ? '28px' : '32px',
                width: '100%',
              }}>
                <button
                  onClick={() => setShowDeleteWarning(false)}
                  style={{
                    padding: isMobile ? '14px 24px' : '16px 32px',
                    background: 'linear-gradient(135deg, #06A7EA 0%, #1B91DA 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: isMobile ? '10px' : '10px',
                    fontWeight: 600,
                    fontSize: isMobile ? '15px' : '16px',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    boxShadow: '0 4px 12px rgba(6, 167, 234, 0.25)',
                    minWidth: isMobile ? '100%' : '140px',
                    outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                    boxSizing: 'border-box',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(6, 167, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 0 0 3px rgba(6,167,234,0.25), 0 4px 12px rgba(6, 167, 234, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                  }}
                >
                  OK, I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}