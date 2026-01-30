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

// --- Inline SVG icons (matching ItemGroupCreation style) ---
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
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable=" false">
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

export default function TransportCreation() {
  // ---------- Permissions ----------
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.TRANSPORT_CREATION),
    Edit: hasModifyPermission(PERMISSION_CODES.TRANSPORT_CREATION),
    Delete: hasDeletePermission(PERMISSION_CODES.TRANSPORT_CREATION)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // ---------- state ----------
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({ 
    code: "", 
    transportName: "",
    address: "",
    address1: "",
    address2: "",
    gstIn: ""
  });
  
  const [actionType, setActionType] = useState("Add"); // 'Add' | 'Edit' | 'Delete'
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // modals & queries
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editQuery, setEditQuery] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteQuery, setDeleteQuery] = useState("");

  const [existingQuery, setExistingQuery] = useState("");

  // refs for step-by-step Enter navigation
  const codeRef = useRef(null);
  const transportNameRef = useRef(null);
  const addressRef = useRef(null);
  const address1Ref = useRef(null);
  const address2Ref = useRef(null);
  const gstInRef = useRef(null);
  const submitRef = useRef(null);

  // Screen width state for responsive design
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ---------- API functions ----------
  const fetchNextTransportCode = async () => {
    try {
      setLoading(true);
      const data = await apiService.get(API_ENDPOINTS.TRANSPORTCREATION.NEXT_TRANSPORT_CODE);
      // Support both string and object responses
      if (typeof data === 'string' && data.trim()) {
        setForm(prev => ({ ...prev, code: data.trim() }));
      } else if (data && (data.nextCode || data.code || data.transportCode)) {
        setForm(prev => ({ ...prev, code: data.nextCode || data.code || data.transportCode }));
      }
      return data;
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load next transport code" });
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const data = await apiService.get(API_ENDPOINTS.TRANSPORTCREATION.GET_TRANSPORT_ITEMS);
      setTransports(data || []);
      setMessage(null);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load transports" });
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTransportByCode = async (code) => {
    try {
      setLoading(true);
      const data = await apiService.get(API_ENDPOINTS.TRANSPORTCREATION.GET_TRANSPORT_CODE(code));
      return data;
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch transport" });
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTransport = async (transportData) => {
    try {
      setLoading(true);
      const data = await apiService.post(API_ENDPOINTS.TRANSPORTCREATION.CREATE_TRANSPORT, transportData);
      return data;
    } catch (err) {
      // Check if this is a validation error from the backend
      if (err.response?.status === 400 || err.response?.status === 422) {
        // Extract the specific error message from the response
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.error || 
                            err.message;
        
        // Check if it's a duplicate transport name error
        if (errorMessage.toLowerCase().includes("already exists") || 
            errorMessage.toLowerCase().includes("duplicate") ||
            errorMessage.toLowerCase().includes("exist")) {
          setMessage({ 
            type: "error", 
            text: "A transport with this name already exists. Please choose a different name." 
          });
        } else {
          setMessage({ 
            type: "error", 
            text: errorMessage || "Validation failed. Please check your input." 
          });
        }
        
        // If you want to extract specific field errors
        if (err.response?.data?.errors) {
          const fieldErrors = err.response.data.errors;
          // Handle field-specific errors if needed
          console.log("Field errors:", fieldErrors);
        }
      } else {
        setMessage({ type: "error", text: "Failed to create transport" });
      }
      
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransport = async (transportData) => {
    try {
      setLoading(true);
      const data = await apiService.put(API_ENDPORTCREATION.UPDATE_TRANSPORT(transportData.code), transportData);
      return data;
    } catch (err) {
      // Check if this is a validation error from the backend
      if (err.response?.status === 400 || err.response?.status === 422) {
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.error || 
                            err.message;
        
        // Check if it's a duplicate transport name error
        if (errorMessage.toLowerCase().includes("already exists") || 
            errorMessage.toLowerCase().includes("duplicate") ||
            errorMessage.toLowerCase().includes("exist")) {
          setMessage({ 
            type: "error", 
            text: "A transport with this name already exists. Please choose a different name." 
          });
        } else {
          setMessage({ 
            type: "error", 
            text: errorMessage || "Validation failed. Please check your input." 
          });
        }
      } else {
        setMessage({ type: "error", text: "Failed to update transport" });
      }
      
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransport = async (transportCode) => {
    try {
      setLoading(true);
      const data = await apiService.del(API_ENDPOINTS.TRANSPORTCREATION.DELETE_TRANSPORT(transportCode));
      return data;
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to delete transport" });
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ---------- Validation function ----------
  const validateTransportName = (name) => {
    if (!name || name.trim() === "") {
      return "Transport name is required";
    }
    if (name.length > 100) {
      return "Transport name cannot exceed 100 characters";
    }
    return null;
  };

  // Check if transport name already exists
  const checkTransportNameExists = (transportName, currentTransportCode = null) => {
    const normalizedTransportName = transportName.trim().toLowerCase();
    const existingTransport = transports.find(t => 
      t.transportName && 
      t.transportName.trim().toLowerCase() === normalizedTransportName &&
      t.code !== currentTransportCode // Exclude current transport when editing
    );
    return existingTransport;
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

  // Focus on transport name field on initial load/reload
  useEffect(() => {
    const timer = setTimeout(() => {
      if (transportNameRef.current) {
        transportNameRef.current.focus();
      }
    }, 100); // Small delay to ensure DOM is ready
    return () => clearTimeout(timer);
  }, []); // Empty dependency array = runs once on mount

  // Additional focus for when actionType changes
  useEffect(() => {
    if (actionType === "Edit" || actionType === "Add") {
      const timer = setTimeout(() => {
        if (transportNameRef.current) transportNameRef.current.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [actionType]);

  // ---------- handlers ----------
  const loadInitial = async () => {
    await Promise.all([fetchTransports(), fetchNextTransportCode()]);
  };

  const handleEdit = async () => {
    // === PERMISSION CHECK ===
    if (!formPermissions.Edit) {
      setMessage({ 
        type: "error", 
        text: "You do not have permission to edit transports." 
      });
      return;
    }
    // === END PERMISSION CHECK ===

    if (!form.code || !form.transportName) {
      setMessage({ type: "error", text: "Please fill Transport Code and Transport Name." });
      return;
    }

    // === CHANGED: Added duplicate check for edit mode (excluding current transport) ===
    const isDuplicate = transports.some(transport => 
      (transport.transportName || '').toLowerCase() === form.transportName.toLowerCase() && 
      (transport.code || '') !== form.code // Different ID
    );

    if (isDuplicate) {
      setMessage({ 
        type: "error", 
        text: `Transport name "${form.transportName}" already exists. Please use a different name.` 
      });
      return;
    }
    // === END CHANGE ===

    setConfirmEditOpen(true);
  };

  const confirmEdit = async () => {
    try {
      setIsLoading(true);
      
      const transportData = { 
        code: form.code, 
        transportName: form.transportName,
        address: form.address,
        address1: form.address1,
        address2: form.address2,
        gstIn: form.gstIn
      };
      await updateTransport(transportData);
      await loadInitial();
      
      setMessage({ type: "success", text: "Transport updated successfully." });
      setConfirmEditOpen(false);
      resetForm();
    } catch (err) {
      setConfirmEditOpen(false);
      // Error message already set in updateTransport
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    // === PERMISSION CHECK ===
    if (!formPermissions.Delete) {
      setMessage({ 
        type: "error", 
        text: "You do not have permission to delete transports." 
      });
      return;
    }
    // === END PERMISSION CHECK ===

    if (!form.code) {
      setMessage({ type: "error", text: "Please select a transport to delete." });
      return;
    }

    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      await deleteTransport(form.code);
      await loadInitial();
      
      setMessage({ type: "success", text: "Transport deleted successfully." });
      setConfirmDeleteOpen(false);
      resetForm();
    } catch (err) {
      setConfirmDeleteOpen(false);
      // Special handling for referenced transports
      if (err.message.includes("used in related tables") || err.message.includes("409")) {
        setMessage({ 
          type: "error", 
          text: `Cannot delete transport "${form.transportName}". It is referenced in other tables and cannot be removed.` 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    // === PERMISSION CHECK ===
    if (!formPermissions.add) {
      setMessage({ 
        type: "error", 
        text: "You do not have permission to create transports." 
      });
      return;
    }
    // === END PERMISSION CHECK ===

    if (!form.code || !form.transportName) {
      setMessage({ type: "error", text: "Please fill Transport Code and Transport Name." });
      return;
    }

    // === CHANGED: Added duplicate check for edit mode (excluding current transport) ===
    const isDuplicate = transports.some(transport => 
      (transport.transportName || '').toLowerCase() === form.transportName.toLowerCase() && 
      (transport.code || '') !== form.code // Different ID
    );

    if (isDuplicate) {
      setMessage({ 
        type: "error", 
        text: `Transport name "${form.transportName}" already exists. Please use a different name.` 
      });
      return;
    }
    // === END CHANGE ===

    setConfirmSaveOpen(true);
  };

  const confirmSave = async () => {
    try {
      setIsLoading(true);
      const transportData = { 
        code: form.code, 
        transportName: form.transportName,
        address: form.address,
        address1: form.address1,
        address2: form.address2,
        gstIn: form.gstIn
      };
      
      await createTransport(transportData);
      await loadInitial();
      
      setMessage({ type: "success", text: "Transport created successfully." });
      setConfirmSaveOpen(false);
      resetForm(true);
    } catch (err) {
      setConfirmSaveOpen(false);
      // Error message already set in createTransport
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (actionType === "Add") await handleAdd();
    else if (actionType === "Edit") await handleEdit();
    else if (actionType === "Delete") await handleDelete();
  };

  const resetForm = (keepAction = false) => {
    fetchNextTransportCode();
    setForm(prev => ({ 
      ...prev, 
      transportName: "",
      address: "",
      address1: "",
      address2: "",
      gstIn: ""
    }));
    setEditingId(null);
    setDeleteTargetId(null);
    setExistingQuery("");
    setEditQuery("");
    setDeleteQuery("");
    setMessage(null);
    if (!keepAction) setActionType("Add");
    
    // This line already focuses on transportName field after reset - GOOD
    setTimeout(() => transportNameRef.current?.focus(), 60);
    setActionType("Add")
  };

  const openEditModal = () => {
    setEditQuery("");
    setEditModalOpen(true);
    transportNameRef.current?.focus();
  };

  const handleEditRowClick = (t) => {
    setForm({ 
      code: t.code, 
      transportName: t.transportName,
      address: t.address || "",
      address1: t.address1 || "",
      address2: t.address2 || "",
      gstIn: t.gstIn || ""
    });
    setActionType("Edit");
    setEditingId(t.code);
    setEditModalOpen(false);
    setTimeout(() => transportNameRef.current?.focus(), 60);
  };

  const openDeleteModal = () => {
    setDeleteQuery("");
    setDeleteModalOpen(true);
    transportNameRef.current?.focus();
  };

  // Fetch items for popup list selector (simple client-side paging/filtering)
  const fetchItemsForModal = useCallback(async (page = 1, search = '') => {
    const pageSize = 20;
    const q = (search || '').trim().toLowerCase();
    const filtered = q
      ? transports.filter(t => 
          (t.code || '').toLowerCase().includes(q) || 
          (t.transportName || '').toLowerCase().includes(q) ||
          (t.gstIn || '').toLowerCase().includes(q)
        )
      : transports;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [transports]);

  const handleDeleteRowClick = (t) => {
    setForm({ 
      code: t.code, 
      transportName: t.transportName,
      address: t.address || "",
      address1: t.address1 || "",
      address2: t.address2 || "",
      gstIn: t.gstIn || ""
    });
    setActionType("Delete");
    setDeleteTargetId(t.code);
    setDeleteModalOpen(false);
    setTimeout(() => transportNameRef.current?.focus(), 60);
  };

  // Key navigation handlers
  const onCodeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      transportNameRef.current?.focus();
    }
  };

  const onTransportNameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addressRef.current?.focus();
    }
  };

  const onAddressKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      address1Ref.current?.focus();
    }
  };

  const onAddress1KeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      address2Ref.current?.focus();
    }
  };

  const onAddress2KeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      gstInRef.current?.focus();
    }
  };

  const onGstInKeyDown = (e) => {
    if (e.key === "Enter") {
      submitRef.current?.focus();
    }
  };

  const stopEnterPropagation = (e) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // ---------- filters ----------
  const filteredEditTransports = useMemo(() => {
    const q = editQuery.trim().toLowerCase();
    if (!q) return transports;
    return transports.filter(
      (t) =>
        (t.code || "").toLowerCase().includes(q) ||
        (t.transportName || "").toLowerCase().includes(q) ||
        (t.gstIn || "").toLowerCase().includes(q)
    );
  }, [editQuery, transports]);

  const filteredDeleteTransports = useMemo(() => {
    const q = deleteQuery.trim().toLowerCase();
    if (!q) return transports;
    return transports.filter(
      (t) =>
        (t.code || "").toLowerCase().includes(q) ||
        (t.transportName || "").toLowerCase().includes(q) ||
        (t.gstIn || "").toLowerCase().includes(q)
    );
  }, [deleteQuery, transports]);

  const filteredExisting = useMemo(() => {
    const q = existingQuery.trim().toLowerCase();
    if (!q) return transports;
    return transports.filter(
      (t) => 
        (t.code || "").toLowerCase().includes(q) || 
        (t.transportName || "").toLowerCase().includes(q) ||
        (t.gstIn || "").toLowerCase().includes(q)
    );
  }, [existingQuery, transports]);

  // ---------- render ----------
  return (
    <div className="uc-root" role="region" aria-labelledby="transport-creation-title">
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
        .uc-root {
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
          max-width: 800px;
          border-radius: 16px;
          padding: 12px;
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

        /* grid layout */
        .grid {
          display:grid;
          grid-template-columns: 1fr;
          gap:18px;
          align-items:start;
          max-width: 800px;
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

        .field { 
          margin-bottom:12px; 
          display:flex; 
          flex-direction:column; 
          align-items:flex-start; 
        }

        /* Two column layout for code and transport name */
        .two-column-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
          margin-bottom: 12px;
        }

        /* Full width for address and GSTIN */
        .full-width-field {
          width: 100%;
          margin-bottom: 12px;
        }

        /* Two column layout for address1 and address2 */
        .address-two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
          margin-bottom: 12px;
        }

        .input {
          width: 100%;
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
        .input:focus { 
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
        .muted { color: var(--muted); font-size:13px; }

        /* message */
        .message {
          margin-top:8px;
          padding:12px;
          border-radius:10px;
          font-weight:600;
          font-size: 14px;
          animation: fadeIn 0.3s ease-in;
        }
        .message.error { 
          background: #fff1f2; 
          color: #9f1239; 
          border: 1px solid #ffd7da;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .message.error::before {
          content: "⚠️";
          font-size: 16px;
        }
        .message.success { background: #f0fdf4; color: #064e3b; border: 1px solid #bbf7d0; }
        .message.warning { 
          background: #fffbeb; 
          color: #92400e; 
          border: 1px solid #fde68a;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .message.warning::before {
          content: "ℹ️";
          font-size: 16px;
        }

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

        /* transports table */
        .transports-table-container {
          max-height: 400px;
          overflow-y: auto;
          border-radius: 8px;
          border: 1px solid rgba(12,18,35,0.04);
          margin-top: 12px;
        }

        .transports-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .transports-table th {
          position: sticky;
          top: 0;
          background: linear-gradient(180deg, #f8fafc, #f1f5f9);
          padding: 12px;
          text-align: left;
          font-weight: 700;
          color: var(--accent);
          border-bottom: 2px solid var(--accent);
          font-size: 14px;
          z-index: 1;
        }

        .transports-table td {
          padding: 12px;
          border-bottom: 1px solid rgba(230, 244, 255, 0.8);
          color: #3a4a5d;
        }

        .transports-table tr:hover {
          background: linear-gradient(90deg, rgba(48,122,200,0.04), rgba(48,122,200,0.01));
          cursor: pointer;
        }

        .transports-table tr.selected {
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

        /* Responsive styles */
        @media (max-width: 768px) {
          .uc-root {
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
          .two-column-row, .address-two-column {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .transports-table-container {
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
            font-size: 14px;
          }
          .input {
            padding: 8px 10px;
            font-size: 12px;
          }
          .submit-primary, .submit-clear {
            flex: 1;
            min-width: 0;
          }
          .transports-table th,
          .transports-table td {
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
          .card {
            padding: 12px;
          }
        }

        /* Animations */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .loading {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="dashboard" aria-labelledby="transport-creation-title">
        <div className="top-row">
          <div className="title-block">
            <svg width="38" height="38" viewBox="0 0 24 24" aria-hidden focusable="false">
              <rect width="24" height="24" rx="6" fill="#eff6ff" />
              <path d="M6 12h12M6 8h12M6 16h12" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h2 id="transport-creation-title">Transport Creation</h2>
              <div className="subtitle muted">Create, edit, or delete transport details.</div>
            </div>
          </div>

          <div className="actions" role="toolbar" aria-label="actions">
            <AddButton onClick={() => { setActionType("Add"); resetForm(true); }} disabled={loading || !formPermissions.add} isActive={actionType === "Add"} />
            <EditButton onClick={openEditModal} disabled={loading || !formPermissions.Edit} isActive={actionType === "Edit"} />
            <DeleteButton onClick={openDeleteModal} disabled={loading || !formPermissions.Delete} isActive={actionType === "Delete"} />
          </div>
        </div>

        <div className="grid" role="main">
          <div className="card" aria-live="polite">
            {/* Row 1: Code and Transport Name (side by side) */}
            <div className="two-column-row">
              {/* Code field */}
              <div className="field">
                <label className="field-label">
                  Code <span className="asterisk">*</span>
                </label>
                <input
                  ref={codeRef}
                  className="input"
                  value={form.code}
                  onChange={(e) => setForm(s => ({ ...s, code: e.target.value }))}
                  // placeholder="Transport code (auto-generated)"
                  onKeyDown={onCodeKeyDown}
                  disabled={loading}
                  aria-label="Transport Code"
                  readOnly={true}
                />
              </div>

              {/* Transport Name field */}
              <div className="field">
                <label className="field-label">
                  Transport Name <span className="asterisk">*</span>
                </label>
                <input 
                  ref={transportNameRef} 
                  className="input" 
                  value={form.transportName} 
                  onChange={(e) => setForm(s => ({ ...s, transportName: e.target.value }))} 
                  onKeyDown={onTransportNameKeyDown}
                  disabled={loading || actionType === "Delete"}
                  aria-label="Transport Name"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Row 2: Address (full width) */}
            <div className="full-width-field">
              <div className="field">
                <label className="field-label">
                  Address
                </label>
                <input
                  ref={addressRef}
                  className="input"
                  value={form.address}
                  onChange={(e) => setForm(s => ({ ...s, address: e.target.value }))}
                  // placeholder="Enter full address"
                  onKeyDown={onAddressKeyDown}
                  disabled={loading || actionType === "Delete"}
                  aria-label="Address"
                  maxLength={200}
                />
              </div>
            </div>

            {/* Row 3: Address1 and Address2 (side by side) */}
            <div className="address-two-column">
              {/* Address1 field */}
              <div className="field">
                <label className="field-label">
                  Address1
                </label>
                <input
                  ref={address1Ref}
                  className="input"
                  value={form.address1}
                  onChange={(e) => setForm(s => ({ ...s, address1: e.target.value }))}
                  placeholder="Address line 1"
                  onKeyDown={onAddress1KeyDown}
                  disabled={loading || actionType === "Delete"}
                  // aria-label="Address 1"
                  maxLength={100}
                />
              </div>

              {/* Address2 field */}
              <div className="field">
                <label className="field-label">
                  Address2
                </label>
                <input
                  ref={address2Ref}
                  className="input"
                  value={form.address2}
                  onChange={(e) => setForm(s => ({ ...s, address2: e.target.value }))}
                  placeholder="Address line 2"
                  onKeyDown={onAddress2KeyDown}
                  disabled={loading || actionType === "Delete"}
                  // aria-label="Address 2"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Row 4: GSTIN (full width) */}
            <div className="full-width-field">
              <div className="field">
                <label className="field-label">
                  GSTIN
                </label>
                <input
                  ref={gstInRef}
                  className="input"
                  value={form.gstIn}
                  onChange={(e) => setForm(s => ({ ...s, gstIn: e.target.value }))}
                  // placeholder="Enter GSTIN number"
                  onKeyDown={onGstInKeyDown}
                  disabled={loading || actionType === "Delete"}
                  aria-label="GSTIN"
                  maxLength={15}
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
                ref={submitRef}
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
            
            <div className="stat" style={{ flex: 1, minHeight: "200px", marginTop: "20px" }}>
              <div className="muted" style={{ marginBottom: "10px" }}>Existing Transports</div>
              <div className="search-container" style={{ marginBottom: "10px" }}>
                <input
                  className="search-with-clear"
                  placeholder="Search existing transports"
                  value={existingQuery}
                  onChange={(e) => setExistingQuery(e.target.value)}
                  aria-label="Search existing transports"
                />
                {existingQuery && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setExistingQuery("")}
                    type="button"
                    aria-label="Clear search"
                  >
                    <Icon.Close size={14} />
                  </button>
                )}
              </div>
              
              <div className="transports-table-container">
                {loading ? (
                  <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }} className="loading">
                    Loading transports...
                  </div>
                ) : filteredExisting.length === 0 ? (
                  <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>
                    {transports.length === 0 ? "No transports found" : "No matching transports"}
                  </div>
                ) : (
                  <table className="transports-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Transport Name</th>
                        <th>GSTIN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExisting.map((t) => (
                        <tr 
                          key={t.code}
                          className={form.code === t.code ? "selected" : ""}
                          onClick={() => {
                            setForm({ 
                              code: t.code, 
                              transportName: t.transportName,
                              address: t.address || "",
                              address1: t.address1 || "",
                              address2: t.address2 || "",
                              gstIn: t.gstIn || ""
                            });
                            setActionType("Edit");
                          }}
                        >
                          <td>{t.code}</td>
                          <td>{t.transportName}</td>
                          <td>{t.gstIn || "-"}</td>
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

      <PopupListSelector
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSelect={(item) => { handleEditRowClick(item); setEditModalOpen(false); }}
        fetchItems={fetchItemsForModal}
        title="Select Transport to Edit"
        displayFieldKeys={['transportName', 'gstIn']}
        searchFields={['transportName', 'gstIn']}
        headerNames={['Transport Name', 'GSTIN']}
        columnWidths={{ transportName: '70%', gstIn: '30%' }}
        maxHeight="60vh"
      />

      <PopupListSelector
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSelect={(item) => { handleDeleteRowClick(item); setDeleteModalOpen(false); }}
        fetchItems={fetchItemsForModal}
        title="Select Transport to Delete"
        displayFieldKeys={['transportName', 'gstIn']}
        searchFields={['transportName', 'gstIn']}
        headerNames={['Transport Name', 'GSTIN']}
        columnWidths={{ transportName: '70%', gstIn: '30%' }}
        maxHeight="60vh"
      />

      {/* Save Confirmation Popup */}
      <ConfirmationPopup
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={confirmSave}
        title="Create Transport"
        message={`Do you want to save?`}
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
        title="Update Transport"
        message={`Do you want to modify?`}
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
        title="Delete Transport"
        message={`Do you want to delete transport?`}
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