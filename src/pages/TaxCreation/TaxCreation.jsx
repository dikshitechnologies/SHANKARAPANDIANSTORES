import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import apiService from '../../api/apiService';
import { API_ENDPOINTS } from '../../api/endpoints';
import { AddButton, EditButton, DeleteButton } from '../../components/Buttons/ActionButtons';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Inline SVG icons (matching DesignCreation style) ---
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

export default function GSTPage() {
  // ---------- Permissions ----------
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    Add: hasAddPermission(PERMISSION_CODES.TAX_CREATION || PERMISSION_CODES.GST_CREATION),
    Edit: hasModifyPermission(PERMISSION_CODES.TAX_CREATION || PERMISSION_CODES.GST_CREATION),
    Delete: hasDeletePermission(PERMISSION_CODES.TAX_CREATION || PERMISSION_CODES.GST_CREATION)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // ---------- state ----------
  const [gstList, setGstList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({ 
    gstCode: "", 
    gstName: ""
  });
  
  const [actionType, setActionType] = useState("Add"); // 'Add' | 'edit' | 'delete'
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // modals & queries
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editQuery, setEditQuery] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteQuery, setDeleteQuery] = useState("");

  const [existingQuery, setExistingQuery] = useState("");

  // refs for step-by-step Enter navigation
  const gstCodeRef = useRef(null);
  const gstNameRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Screen width state for responsive design
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);

  // Confirmation popup states
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ---------- API functions (UPDATED) ----------
const fetchGSTs = async () => {
  try {
    setLoading(true);
    // Use the TAX endpoint instead of GST
    const data = await apiService.get(
      API_ENDPOINTS.TAX.GET_TAX_LIST(1, 100) // Increased pageSize to get all records
    );

    console.log("API Response:", data);
    
    // Check if data is nested in a property (common in APIs)
    let taxList = data;
    if (data && data.data) {
      taxList = data.data; // If API returns { data: [...] }
    } else if (data && data.items) {
      taxList = data.items; // If API returns { items: [...] }
    } else if (data && data.result) {
      taxList = data.result; // If API returns { result: [...] }
    }
    
    // Transform API data to match our naming convention
    const transformedData = Array.isArray(taxList) ? taxList.map(item => ({
      gstCode: item.fcode || item.code || item.taxCode || '',
      gstName: item.ftaxName || item.taxName || item.name || ''
    })) : [];
    
    console.log("Transformed Data:", transformedData);
    setGstList(transformedData);
    setMessage(null);
    return transformedData;
  } catch (err) {
    setMessage({ type: "error", text: "Failed to load Tax list" });
    console.error("API Error:", err);
    toast.error("Failed to loadTax list");
    throw err;
  } finally {
    setLoading(false);
  }
};

const getNextGSTCode = async () => {
  try {
    // Fetch existing tax list
    const taxData = await fetchGSTs();
    
    if (taxData.length > 0) {
      // Find the highest numeric code and increment
      const codes = taxData.map(b => {
        const code = b.gstCode || '';
        // Extract numeric part (remove non-digits)
        const num = parseInt(code.replace(/\D/g, '')) || 0;
        return num;
      });
      const maxCode = Math.max(...codes);
      const nextCode = (maxCode + 1).toString().padStart(3, '0'); // Pad to 3 digits
      setForm(prev => ({ ...prev, gstCode: nextCode }));
      return nextCode;
    } else {
      // First tax entry
      setForm(prev => ({ ...prev, gstCode: "001" }));
      return "001";
    }
  } catch (err) {
    console.error("Error getting next code:", err);
    // Fallback to a default
    setForm(prev => ({ ...prev, gstCode: "001" }));
    return "001";
  }
};

const getGSTByCode = async (code) => {
  try {
    setLoading(true);

    const data = await apiService.get(
      API_ENDPOINTS.TAX.GET_TAX_BY_CODE(code)
    );

    // backend may return array or single object
    const item = Array.isArray(data) ? data[0] : data;

    if (!item) return null;

    return {
      gstCode: item.fcode || '',
      gstName: item.ftaxName || ''
    };
  } catch (err) {
    console.error("Failed to fetch Tax by code", err);
    toast.error("Failed to fetch Tax details");
    throw err;
  } finally {
    setLoading(false);
  }
};


 const createGST = async (gstData) => {
  try {
    setLoading(true);
    // Transform to API expected format
    const apiData = {
      fcode: gstData.gstCode,
      ftaxName: gstData.gstName.trim()
    };
    
    console.log("Creating GST with data:", apiData);
    const response = await apiService.post(API_ENDPOINTS.TAX.CREATE_TAX, apiData);
    console.log("Create response:", response);
    
    if (response.success || response.message?.includes("successfully")) {
     
      return response;
    }
    // Handle different response formats
    return response;
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || "Failed to create Tax";
    setMessage({ type: "error", text: errorMsg });
    console.error("API Error:", err);
    toast.error(errorMsg);
    throw err;
  } finally {
    setLoading(false);
  }
};

 const updateGST = async (gstData) => {
  try {
    setLoading(true);
    console.log("Sending update data:", gstData);
    
    // Transform to API expected format
    const apiData = {
      fcode: gstData.gstCode,
      ftaxName: gstData.gstName.trim()
    };
    
    console.log("Updating GST with data:", apiData);
    const response = await apiService.post(API_ENDPOINTS.TAX.UPDATE_TAX, apiData);
    console.log("Update response:", response);
    
    if (response.success || response.message?.includes("successfully")) {
      return { success: true, message: response.message };
    }
    return response;
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || "Failed to update Tax";
    setMessage({ type: "error", text: errorMsg });
    console.error("Update error details:", err.response || err);
    toast.error(errorMsg);
    throw err;
  } finally {
    setLoading(false);
  }
};

 const deleteGST = async (gstCode) => {
  try {
    setLoading(true);
    console.log("Deleting Tax with code:", gstCode);
    const response = await apiService.del(API_ENDPOINTS.TAX.DELETE_TAX(gstCode));
    console.log("Delete response:", response);
    
    if (response.success || response.message?.includes("successfully")) {
      return response;
    }
    return response;
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || "Failed to delete Tax";
    setMessage({ type: "error", text: errorMsg });
    console.error("API Error:", err);
    toast.error(errorMsg);
    throw err;
  } finally {
    setLoading(false);
  }
};

  // ---------- effects ----------
  useEffect(() => {
    loadInitial();
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Focus on GST name field on initial load/reload
  useEffect(() => {
    const timer = setTimeout(() => {
      if (gstNameRef.current) {
        gstNameRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Additional focus for when actionType changes
  useEffect(() => {
    if (actionType === "Edit" || actionType === "Add") {
      const timer = setTimeout(() => {
        if (gstNameRef.current) gstNameRef.current.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [actionType]);

  // ---------- handlers ----------
  const loadInitial = async () => {
    try {
      await fetchGSTs();
      await getNextGSTCode();
    } catch (err) {
      console.error("Error in loadInitial:", err);
    }
  };

  const handleEdit = () => {
    if (!formPermissions.Edit) {
      setMessage({ 
        type: "error", 
        text: "You do not have permission to edit Tax entries." 
      });
      return;
    }

    if (!form.gstCode || !form.gstName) {
      setMessage({ type: "error", text: "Please fill Tax Code and Tax Name." });
      return;
    }

    // Validate Tax name is a number
    const taxValue = parseFloat(form.gstName.trim());
    if (isNaN(taxValue)) {
      setMessage({ type: "error", text: "Tax Name must be a numeric value (e.g., 5, 12, 18, 28)" });
      return;
    }
    
    setConfirmEditOpen(true);
  };

  const confirmEdit = async () => {
    setIsLoading(true);
    try {
      const gstData = { 
        gstCode: form.gstCode, 
        gstName: form.gstName.trim()
      };
      await updateGST(gstData);
      await loadInitial();
      
      setMessage({ type: "success", text: "Tax updated successfully." });
      resetForm();
      setConfirmEditOpen(false);
    } catch (err) {
      // Error message already set in updateGST
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!formPermissions.Delete) {
      setMessage({ 
        type: "error", 
        text: "You do not have permission to delete Tax entries." 
      });
      return;
    }

    if (!form.gstCode) {
      setMessage({ type: "error", text: "Please select a Tax to delete." });
      return;
    }
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteGST(form.gstCode);
      await loadInitial();
      
      setMessage({ type: "success", text: "Tax deleted successfully." });
      resetForm();
      setConfirmDeleteOpen(false);
    } catch (err) {
      // Special handling for referenced GSTs
      if (err.message.includes("used in related tables") || err.message.includes("409")) {
        setMessage({ 
          type: "error", 
          text: `Cannot delete GST "${form.gstName}". It is referenced in other tables and cannot be removed.` 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {

 
    if (!formPermissions.Add) {
      setMessage({ 
        type: "error", 
        text: "You do not have permission to create Tax entries." 
      });
      return;
    }

    if (!form.gstCode || !form.gstName) {
      setMessage({ type: "error", text: "Please fill Tax Code and Tax Name." });
      return;
    }

    // Validate Tax name is a number
    const taxValue = parseFloat(form.gstName.trim());
    if (isNaN(taxValue)) {
      setMessage({ type: "error", text: "Tax Name must be a numeric value (e.g., 5, 12, 18, 28)" });
      return;
    }

    // Check if GST code already exists
    const codeExists = gstList.some(b => b.gstCode === form.gstCode);
    if (codeExists) {
      setMessage({ type: "error", text: `GST code ${form.gstCode} already exists.` });
      return;
    }

    // Check for duplicate GST value (case-insensitive)
    const valueExists = gstList.some(b => 
      parseFloat(b.gstName.trim()) === taxValue
    );

    if (valueExists) {
      setMessage({ 
        type: "error", 
        text: `GST value "${form.gstName}" already exists. Please use a different value.` 
      });
      return;
    }

    setConfirmSaveOpen(true);
  };

  const confirmSave = async () => {
        alert();
    setIsLoading(true);
    try {
      const gstData = { 
        gstCode: form.gstCode, 
        gstName: form.gstName.trim()
      };
      await createGST(gstData);
      await loadInitial();
      
      setMessage({ type: "success", text: "Tax created successfully." });
      resetForm(true);
      setConfirmSaveOpen(false);
    } catch (err) {
      // Error message already set in createGST
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {

    if (actionType === "Add") {    
      handleAdd();
    } else if (actionType === "Edit") {
      handleEdit();
    } else if (actionType === "Delete") {
      handleDelete();
    }
  };

  const resetForm = (keepAction = false) => {
    getNextGSTCode();
    setForm(prev => ({ ...prev, gstName: "" }));
    setEditingId(null);
    setDeleteTargetId(null);
    setExistingQuery("");
    setEditQuery("");
    setDeleteQuery("");
    setMessage(null);
    if (!keepAction) setActionType("Add");
    
    setTimeout(() => gstNameRef.current?.focus(), 60);
    setActionType("Add")
  };

  const openEditModal = () => {
    setEditQuery("");
    setEditModalOpen(true);
    gstNameRef.current?.focus()
  };

  const handleEditRowClick = (b) => {
    setForm({ gstCode: b.gstCode, gstName: b.gstName });
    setActionType("Edit");
    setEditingId(b.gstCode);
    setEditModalOpen(false);
    setTimeout(() => gstNameRef.current?.focus(), 60);
  };

  const openDeleteModal = () => {
    setDeleteQuery("");
    setDeleteModalOpen(true);
    gstNameRef.current?.focus()
  };

  // Fetch items for popup list selector
  const fetchItemsForModal = useCallback(async (page = 1, search = '') => {
    const pageSize = 20;
    const q = (search || '').trim().toLowerCase();
    const filtered = q
      ? gstList.filter(b => 
          (b.gstCode || '').toLowerCase().includes(q) || 
          (b.gstName || '').toLowerCase().includes(q)
        )
      : gstList;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [gstList]);

  const handleDeleteRowClick = (b) => {
    setForm({ gstCode: b.gstCode, gstName: b.gstName });
    setActionType("Delete");
    setDeleteTargetId(b.gstCode);
    setDeleteModalOpen(false);
    setTimeout(() => gstNameRef.current?.focus(), 60);
  };

  const onGstCodeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      gstNameRef.current?.focus();
    }
  };

  const onGstNameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
      gstNameRef.current?.focus();
    }
  };

  const stopEnterPropagation = (e) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // ---------- filters ----------
  const filteredEditGSTs = useMemo(() => {
    const q = editQuery.trim().toLowerCase();
    if (!q) return gstList;
    return gstList.filter(
      (b) =>
        (b.gstCode || "").toLowerCase().includes(q) ||
        (b.gstName || "").toLowerCase().includes(q)
    );
  }, [editQuery, gstList]);

  const filteredDeleteGSTs = useMemo(() => {
    const q = deleteQuery.trim().toLowerCase();
    if (!q) return gstList;
    return gstList.filter(
      (b) =>
        (b.gstCode || "").toLowerCase().includes(q) ||
        (b.gstName || "").toLowerCase().includes(q)
    );
  }, [deleteQuery, gstList]);

  const filteredExisting = useMemo(() => {
    const q = existingQuery.trim().toLowerCase();
    if (!q) return gstList;
    return gstList.filter(
      (b) => 
        (b.gstCode || "").toLowerCase().includes(q) || 
        (b.gstName || "").toLowerCase().includes(q)
    );
  }, [existingQuery, gstList]);

  // ---------- render ----------
  return (
    <div className="gst-root" role="region" aria-labelledby="gst-creation-title">
      {/* Google/Local font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@500;700&display=swap" rel="stylesheet" />

      <style>{`
        :root{
          /* blue theme (matching ItemGroupCreation) */
          --bg-1: #f0f7fb;
          --bg-2: #f7fbff;
          --glass: rgba(255,255,255,0.55);
          --glass-2: rgba(255,255,255,0.35);
          --accent: #307AC8; /* primary */
          --accent-2: #1B91DA; /* secondary */
          --accent-3: #06A7EA; /* tertiary */
          --success: #06A7EA;
          --danger: #ef4444;
          --warning: #f59e0b;
          --muted: #64748b;
          --card-shadow: 0 8px 30px rgba(16,24,40,0.08);
          --glass-border: rgba(255,255,255,0.45);
        }


        /* Page layout */
        .gst-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 16px;
          background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
          font-family: 'Poppins', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          font-size: 14px;
          box-sizing: border-box;
        }

        /* Main dashboard card (glass) */
        .dashboard {
          width: 100%;
          max-width: 700px;
          border-radius: 16px;
          padding: 12px;
          background: linear-gradient(135deg, rgba(255,255,255,0.75), rgba(245,243,255,0.65));
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
          font-size: 18px;
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
          font-weight: 700;
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

        /* grid layout */
        .grid {
          display:grid;
          grid-template-columns: 1fr;
          gap:18px;
          align-items:start;
          max-width: 750px;
          margin: 0 auto;
        }

        /* left card (form) */
        .card {
          background: rgba(255,255,255,0.85);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(15,23,42,0.04);
          box-shadow: 0 6px 20px rgba(12,18,35,0.06);
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
          font-family: inherit;
        }
        .input:focus, .search:focus { 
          outline:none; 
          box-shadow: 0 8px 26px rgba(139,92,246,0.08); 
          transform: translateY(-1px); 
          border-color: var(--accent); 
        }
        .input:read-only {
          background: #f8fafc;
          color: var(--muted);
          cursor: not-allowed;
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
          display: none;
          flex-direction:column;
          gap:12px;
        }
        .stat {
          background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(250,251,255,0.7));
          border-radius: 12px;
          padding:12px;
          border: 1px solid rgba(12,18,35,0.04);
        }
        .muted { color: var(--muted); font-size:14px; }

        /* message */
        .message {
          margin-top:8px;
          padding:12px;
          border-radius:10px;
          font-weight:600;
          font-size: 14px;
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
          box-shadow: 0 8px 24px rgba(139,92,246,0.25);
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
          border-color: #307AC8;
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
          font-size: 14px;
          transition: all 0.2s;
          background: #fff;
        }

        .search-with-clear:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
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

        /* gsts table */
        .gsts-table-container {
          max-height: 400px;
          overflow-y: auto;
          border-radius: 8px;
          border: 1px solid rgba(12,18,35,0.04);
          margin-top: 12px;
        }

        .gsts-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .gsts-table th {
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

        .gsts-table td {
          padding: 12px;
          border-bottom: 1px solid rgba(230, 244, 255, 0.8);
          color: #3a4a5d;
          font-size: 14px;
        }

        .gsts-table tr:hover {
          background: linear-gradient(90deg, rgba(139,92,246,0.04), rgba(139,92,246,0.01));
          cursor: pointer;
        }

        .gsts-table tr.selected {
          background: linear-gradient(90deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05));
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
          font-size: 14px;
        }
        .dropdown-item:hover { 
          background: linear-gradient(90deg, rgba(139,92,246,0.04), rgba(139,92,246,0.01)); 
          transform: translateX(6px); 
        }

        /* tips panel */
        .tips-panel {
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,243,255,0.8));
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
          .gst-root {
            padding: 16px 12px;
          }
          .dashboard {
            padding: 16px;
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
          .gsts-table-container {
            max-height: 300px;
          }
        }

        @media (max-width: 480px) {
          .gst-root {
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
          .input, .search {
            padding: 8px 10px;
            font-size: 13px;
          }
          .btn {
            padding: 8px 10px;
            min-width: 70px;
            font-size: 13px;
          }
          .submit-primary, .submit-clear {
            flex: 1;
            min-width: 0;
          }
          .gsts-table th,
          .gsts-table td {
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
          .gst-root {
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

      <div className="dashboard" aria-labelledby="gst-creation-title">
        <div className="top-row">
          <div className="title-block">
              <svg width="38" height="38" viewBox="0 0 24 24" aria-hidden focusable="false">
              <rect width="24" height="24" rx="6" fill="#eff6ff" />
              <path d="M6 12h12M6 8h12M6 16h12" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h2 id="gst-creation-title">Tax Creation</h2>
              <div className="subtitle muted">Create, edit, or delete Tax entries.</div>
            </div>
          </div>

          <div className="actions" role="toolbar" aria-label="actions">
            <AddButton onClick={() => { setActionType("Add"); resetForm(true); }} disabled={loading || !formPermissions.Add} isActive={actionType === "Add"} />
            <EditButton onClick={openEditModal} disabled={loading || !formPermissions.Edit} isActive={actionType === "Edit"} />
            <DeleteButton onClick={openDeleteModal} disabled={loading || !formPermissions.Delete} isActive={actionType === "Delete"} />
          </div>
        </div>

        <div className="grid" role="main">
          <div className="card" aria-live="polite">
            {/* GST Code field */}
            <div className="field">
              <label className="field-label">
                TAX Code <span className="asterisk">*</span>
              </label>
              <div className="row">
                <input
                  ref={gstCodeRef}
                  className="input"
                  value={form.gstCode}
                  onChange={(e) => setForm(s => ({ ...s, gstCode: e.target.value }))}
                  onKeyDown={onGstCodeKeyDown}
                  disabled={loading}
                  aria-label="GST Code"
                  readOnly={true}
                />
              </div>
            </div>

            {/* GST Name field */}
            <div className="field">
              <label className="field-label">
                TAX % <span className="asterisk">*</span>
              </label>
              <div className="row">
                <input 
                  ref={gstNameRef} 
                  className="input" 
                  value={form.gstName} 
                  onChange={(e) => setForm(s => ({ ...s, gstName: e.target.value }))} 
                  // placeholder="Enter Tax percentage (e.g., 5, 12, 18, 28)"
                  onKeyDown={onGstNameKeyDown}
                  disabled={loading}
                  aria-label="TAX %"
                  readOnly={actionType === "Delete"}
                  type="text"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Message display */}
            {message && (
              <div className={`message ${message.type}`} role="alert">
                {message.text}
              </div>
            )}
            
            {/* Submit controls */}
            <div className="submit-row">
              <button
                className="submit-primary"
                ref={submitButtonRef}
                onClick={handleSubmit}
                disabled={loading}
                type="button"
              >
                {loading ? "Processing..." : actionType === "Add" ? "Save" : actionType === "Edit" ? "Update" : "Delete"}
              </button>
              <button
                className="submit-clear"
                onClick={resetForm}
                disabled={loading}
                type="button"
              >
                Clear
              </button>
            </div>
            
            <div className="stat" style={{ flex: 1, minHeight: "200px" }}>
              <div className="muted" style={{ marginBottom: "10px" }}>Existing Tax Entries</div>
              <div className="search-container" style={{ marginBottom: "10px" }}>
                <input
                  className="search-with-clear"
                  placeholder="Search existing Tax entries"
                  value={existingQuery}
                  onChange={(e) => setExistingQuery(e.target.value)}
                  aria-label="SearchTax entries"
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
              
              <div className="gsts-table-container">
                {loading ? (
                  <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }} className="loading">
                    Loading Tax entries...
                  </div>
                ) : filteredExisting.length === 0 ? (
                  <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>
                    {gstList.length === 0 ? "No Tax entries found" : "No matching entries"}
                  </div>
                ) : (
                  <table className="gsts-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>TAX %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExisting.map((b) => (
                        <tr 
                          key={b.gstCode}
                          className={form.gstCode === b.gstCode ? "selected" : ""}
                          onClick={() => {
                            setForm({ 
                              gstCode: b.gstCode, 
                              gstName: b.gstName
                            });
                            setActionType("Edit");
                          }}
                        >
                          <td>{b.gstCode}</td>
                          <td>{b.gstName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Right side panel */}
          <div className="side" aria-live="polite">
            <div className="stat">
              <div className="muted">Current Action</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)" }}>
                {actionType === "Add" ? "Create New" : actionType === "Edit" ? "Edit Tax" : "Delete Tax"}
              </div>
            </div>

            <div className="stat">
              <div className="muted">GST Code</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                {form.gstCode || "Auto-generated"}
              </div>
            </div>

            <div className="stat">
              <div className="muted">GST Percentage</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                {form.gstName ? `${form.gstName}%` : "Not set"}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Existing GST/Tax Entries</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--accent-2)" }}>
                {gstList.length}
              </div>
            </div>

            <div className="stat tips-panel">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Icon.Info />
                <div style={{ fontWeight: 700 }}>Quick Tips</div>
              </div>
              
              <div className="muted" style={{ fontSize: "14px", lineHeight: "1.5" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ color: "var(--accent)", fontWeight: "bold" }}>•</span>
                  <span>GST code is auto-generated for new entries</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ color: "var(--accent)", fontWeight: "bold" }}>•</span>
                  <span>GST percentage must be numeric (e.g., 5, 12, 18)</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ color: "var(--accent)", fontWeight: "bold" }}>•</span>
                  <span>For edit/delete, use search modals to find entries</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <span style={{ color: "var(--accent)", fontWeight: "bold" }}>•</span>
                  <span>Click on any entry in the table to edit it</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PopupListSelector
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSelect={(item) => { handleEditRowClick(item); setEditModalOpen(false); }}
        fetchItems={fetchItemsForModal}
        title="Select Tax to Edit"
        displayFieldKeys={[ 'gstName',  ]}
        searchFields={[ 'gstName',  ]}
        headerNames={[ 'TAX %',  ]}
        columnWidths={{ gstName: '70%',  }}
        maxHeight="60vh"
      />

      <PopupListSelector
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSelect={(item) => { handleDeleteRowClick(item); setDeleteModalOpen(false); }}
        fetchItems={fetchItemsForModal}
        title="SelectTax to Delete"
        displayFieldKeys={[ 'gstName',  ]}
        searchFields={[ 'gstName',  ]}
        headerNames={[ 'Tax %',  ]}
        columnWidths={{ gstName: '70%',  }}
        maxHeight="60vh"
      />

      {/* Save Confirmation Popup */}
      <ConfirmationPopup
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={confirmSave}
        title="Create Tax"
        message={`Do you want to save Tax ${form.gstName}%?`}
        type="success"
        confirmText={isLoading ? "Creating..." : "Yes"}
        cancelText="No"
        showLoading={isLoading}
        disableBackdropClose={isLoading}
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
        title="Update Tax"
        message={`Do you want to update Tax to ${form.gstName}%?`}
        type="warning"
        confirmText={isLoading ? "Updating..." : "Yes"}
        cancelText="No"
        showLoading={isLoading}
        disableBackdropClose={isLoading}
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
        title="Delete Tax"
        message={`Do you want to delete Tax ${form.gstName}%?`}
        type="danger"
        confirmText={isLoading ? "Deleting..." : "Yes"}
        cancelText="No"
        showLoading={isLoading}
        disableBackdropClose={isLoading}
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
    </div>
  );
}