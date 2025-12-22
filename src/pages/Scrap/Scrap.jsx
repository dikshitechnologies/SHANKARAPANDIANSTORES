import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import apiService from '../../api/apiService';
import { API_ENDPOINTS } from '../../api/endpoints';
import { AddButton, EditButton, DeleteButton } from '../../components/Buttons/ActionButtons';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSION_CODES } from "../../constants/permissions";

// Inline SVG icons (matching ItemGroupCreation style)
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

export default function ScrapCreation() {
  // ---------- Permissions ----------
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.SCRAP_CREATION),
    edit: hasModifyPermission(PERMISSION_CODES.SCRAP_CREATION),
    delete: hasDeletePermission(PERMISSION_CODES.SCRAP_CREATION)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // ---------- state ----------
  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    scrapCode: "",
    scrapName: ""
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
  const scrapCodeRef = useRef(null);
  const scrapNameRef = useRef(null);

  // Screen width state for responsive design
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);

  // Track original scrap name when editing
  const [originalScrapName, setOriginalScrapName] = useState("");

  // Base URL for API
  const BASE_URL = "http://dikshiserver/spstorewebapi/api";

  // ---------- API functions ----------
  const fetchNextScrapCode = async () => {
    try {
      setLoading(true);
      const data = await apiService.get(API_ENDPOINTS.SCRAP_CREATION.GET_NEXT_SCRAP_CODE);
      // Support both string and object responses
      if (typeof data === 'string' && data.trim()) {
        setForm(prev => ({ ...prev, scrapCode: data.trim() }));
      } else if (data && (data.nextScrapCode || data.scrapCode || data.fcode)) {
        setForm(prev => ({ ...prev, scrapCode: data.nextScrapCode || data.scrapCode || data.fcode }));
      } else if (data && data.nextCode) {
        setForm(prev => ({ ...prev, scrapCode: data.nextCode }));
      } else {
        // Fallback: if API doesn't return a code, generate locally
        generateLocalNextCode();
      }
      return data;
    } catch (err) {
      console.error("API Error fetching next scrap code:", err);
      // Fallback: generate local code if API fails
      generateLocalNextCode();
    } finally {
      setLoading(false);
    }
  };

  const generateLocalNextCode = () => {
    if (scraps.length === 0) {
      setForm(prev => ({ ...prev, scrapCode: "001" }));
    } else {
      // Get highest numeric code and increment
      const maxCode = Math.max(...scraps.map(s => {
        const code = s.scrapCode || s.fcode || s.scrapCode;
        return parseInt(code) || 0;
      }));
      const nextCode = (maxCode + 1).toString().padStart(3, '0');
      setForm(prev => ({ ...prev, scrapCode: nextCode }));
    }
  };

  const fetchScraps = async () => {
    try {
      setLoading(true);
      const data = await apiService.get(API_ENDPOINTS.SCRAP_CREATION.GET_SCRAP_ITEMS);

      // Transform API response to match our expected format
      const transformedData = Array.isArray(data)
        ? data.map(item => ({
          id: item.id || item.scrapCode,
          scrapCode: item.scrapCode || item.fcode || item.code,
          scrapName: item.scrapName || item.name || item.scrapName
        }))
        : [];

      setScraps(transformedData);
      setMessage(null);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load scrap items" });
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScrapByCode = async (code) => {
    try {
      setLoading(true);
      const data = await apiService.get(API_ENDPOINTS.SCRAP_CREATION.GET_SCRAP_BY_CODE(code));
      return data;
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch scrap" });
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createScrap = async (scrapData) => {
    try {
      setLoading(true);

      // Prepare payload based on your API requirements
      const payload = {
        scrapCode: scrapData.scrapCode,
        scrapName: scrapData.scrapName.toUpperCase(),
      };

      console.log("Creating scrap with payload:", payload);
      const data = await apiService.post(API_ENDPOINTS.SCRAP_CREATION.CREATE_SCRAP, payload);
      return data;
    } catch (err) {
      // Handle specific error cases
      if (err.response?.status === 409) {
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.error ||
                            "Scrap with this name already exists.";
        setMessage({ type: "error", text: errorMessage });
        throw new Error(errorMessage);
      } else {
        const errorMessage = err.response?.data?.message || 
                            "Failed to create scrap. Please try again.";
        setMessage({ type: "error", text: errorMessage });
        console.error("Create API Error:", err.response?.data || err.message);
        throw new Error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateScrap = async (scrapData) => {
    try {
      setLoading(true);

      // Prepare payload - use the same format as createScrap
      const payload = {
        scrapCode: scrapData.scrapCode,
        scrapName: scrapData.scrapName.toUpperCase(),
      };

      console.log("Updating scrap with payload:", payload);
      
      const data = await apiService.put(API_ENDPOINTS.SCRAP_CREATION.UPDATE_SCRAP, payload);
      return data;
    } catch (err) {
      console.error("Update API Error Details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        let errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          "Scrap name already exists. Please choose a different name.";
        
        setMessage({ type: "error", text: errorMessage });
        throw new Error(errorMessage);
      } else {
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.error || 
                            "Failed to update scrap. Please try again.";
        setMessage({ type: "error", text: errorMessage });
        throw new Error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteScrap = async (scrapCode) => {
    try {
      setLoading(true);
      console.log("Deleting scrap with code:", scrapCode);
      const data = await apiService.del(API_ENDPOINTS.SCRAP_CREATION.DELETE_SCRAP(scrapCode));
      return data;
    } catch (err) {
      console.error("Delete API Error:", err.response?.data || err.message);
      
      let errorMessage = err.message || "Failed to delete scrap";
      
      if (err.response?.status === 409) {
        errorMessage = err.response?.data?.message || 
                      `Cannot delete scrap "${scrapCode}". It is referenced in other tables and cannot be removed.`;
      } else if (err.response?.status === 404) {
        errorMessage = `Scrap with code "${scrapCode}" not found.`;
      }
      
      setMessage({ type: "error", text: errorMessage });
      throw new Error(errorMessage);
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

  useEffect(() => {
    if (scrapCodeRef.current) scrapCodeRef.current.focus();
  }, []);

  // ---------- handlers ----------
  const loadInitial = async () => {
    await Promise.all([fetchScraps(), fetchNextScrapCode()]);
  };

  const handleEdit = async () => {
    if (!form.scrapCode || !form.scrapName) {
      setMessage({ type: "error", text: "Please fill Scrap Code and Scrap Name." });
      return;
    }

    // Get the original scrap to check if name actually changed
    const originalScrap = scraps.find(s => s.scrapCode === form.scrapCode);
    
    // If name hasn't changed, no need to check for duplicates
    if (originalScrap && originalScrap.scrapName.toUpperCase() === form.scrapName.toUpperCase()) {
      setMessage({ type: "warning", text: "No changes detected. Scrap name remains the same." });
      return;
    }

    // Check if another scrap with the same name already exists (case-insensitive)
    const duplicateName = scraps.some(s => 
      s.scrapCode !== form.scrapCode && 
      s.scrapName.toUpperCase() === form.scrapName.toUpperCase()
    );
    
    if (duplicateName) {
      setMessage({ 
        type: "error", 
        text: `Scrap name "${form.scrapName}" already exists. Please choose a different name.` 
      });
      return;
    }

    if (!window.confirm(`Do you want to update scrap "${originalScrap?.scrapName}" to "${form.scrapName}"?`)) return;

    try {
      const scrapData = { 
        scrapCode: form.scrapCode, 
        scrapName: form.scrapName 
      };
      await updateScrap(scrapData);
      await loadInitial();

      setMessage({ type: "success", text: "Scrap updated successfully." });
      resetForm(true);
    } catch (err) {
      // Error message already set in updateScrap
      console.error("Error in handleEdit:", err);
    }
  };

  const handleDelete = async () => {
    if (!form.scrapCode) {
      setMessage({ type: "error", text: "Please select a scrap to delete." });
      return;
    }

    if (!window.confirm(`Do you want to permanently delete scrap "${form.scrapName}"? This action cannot be undone.`)) return;

    try {
      await deleteScrap(form.scrapCode);
      await loadInitial();

      setMessage({ type: "success", text: "Scrap deleted successfully." });
      resetForm();
    } catch (err) {
      // Error message already set in deleteScrap
      console.error("Error in handleDelete:", err);
    }
  };

  const handleAdd = async () => {
    if (!form.scrapCode || !form.scrapName) {
      setMessage({ type: "error", text: "Please fill Scrap Code and Scrap Name." });
      return;
    }

    // Check if scrap code already exists
    const exists = scraps.some(s => s.scrapCode === form.scrapCode);
    if (exists) {
      setMessage({ type: "error", text: `Scrap code ${form.scrapCode} already exists.` });
      return;
    }

    // Check if scrap name already exists (case-insensitive)
    const duplicateName = scraps.some(s => 
      s.scrapName.toUpperCase() === form.scrapName.toUpperCase()
    );
    
    if (duplicateName) {
      setMessage({ 
        type: "error", 
        text: `Scrap name "${form.scrapName}" already exists. Please choose a different name.` 
      });
      return;
    }

    if (!window.confirm(`Do you want to create scrap "${form.scrapName}"?`)) return;

    try {
      const scrapData = { 
        scrapCode: form.scrapCode, 
        scrapName: form.scrapName 
      };
      await createScrap(scrapData);
      await loadInitial();

      setMessage({ type: "success", text: "Scrap created successfully." });
      resetForm(true);
    } catch (err) {
      // Error message already set in createScrap
      console.error("Error in handleAdd:", err);
    }
  };

  const handleSubmit = async () => {
    if (actionType === "Add") await handleAdd();
    else if (actionType === "edit") await handleEdit();
    else if (actionType === "delete") await handleDelete();
  };

  const resetForm = (keepAction = false) => {
    fetchNextScrapCode();
    setForm(prev => ({ ...prev, scrapName: "" }));
    setOriginalScrapName("");
    setEditingId(null);
    setDeleteTargetId(null);
    setExistingQuery("");
    setEditQuery("");
    setDeleteQuery("");
    setMessage(null);
    if (!keepAction) setActionType("Add");
    setTimeout(() => scrapNameRef.current?.focus(), 60);
  };

  const openEditModal = () => {
    setEditQuery("");
    setEditModalOpen(true);
  };

  const handleEditRowClick = (s) => {
    setForm({ scrapCode: s.scrapCode, scrapName: s.scrapName });
    setOriginalScrapName(s.scrapName);
    setActionType("edit");
    setEditingId(s.scrapCode);
    setEditModalOpen(false);
    setTimeout(() => scrapNameRef.current?.focus(), 60);
  };

  const openDeleteModal = () => {
    setDeleteQuery("");
    setDeleteModalOpen(true);
  };

  // Fetch items for popup list selector (simple client-side paging/filtering)
  const fetchItemsForModal = useCallback(async (page = 1, search = '') => {
    const pageSize = 20;
    const q = (search || '').trim().toLowerCase();
    const filtered = q
      ? scraps.filter(s => (s.scrapCode || '').toLowerCase().includes(q) || (s.scrapName || '').toLowerCase().includes(q))
      : scraps;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [scraps]);

  const handleDeleteRowClick = (s) => {
    setForm({ scrapCode: s.scrapCode, scrapName: s.scrapName });
    setActionType("delete");
    setDeleteTargetId(s.scrapCode);
    setDeleteModalOpen(false);
    setTimeout(() => scrapNameRef.current?.focus(), 60);
  };

  const onScrapCodeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      scrapNameRef.current?.focus();
    }
  };

  const onScrapNameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const stopEnterPropagation = (e) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // ---------- filters ----------
  const filteredEditScraps = useMemo(() => {
    const q = editQuery.trim().toLowerCase();
    if (!q) return scraps;
    return scraps.filter(
      (s) =>
        (s.scrapCode || "").toLowerCase().includes(q) ||
        (s.scrapName || "").toLowerCase().includes(q)
    );
  }, [editQuery, scraps]);

  const filteredDeleteScraps = useMemo(() => {
    const q = deleteQuery.trim().toLowerCase();
    if (!q) return scraps;
    return scraps.filter(
      (s) =>
        (s.scrapCode || "").toLowerCase().includes(q) ||
        (s.scrapName || "").toLowerCase().includes(q)
    );
  }, [deleteQuery, scraps]);

  const filteredExisting = useMemo(() => {
    const q = existingQuery.trim().toLowerCase();
    if (!q) return scraps;
    return scraps.filter(
      (s) =>
        (s.scrapCode || "").toLowerCase().includes(q) ||
        (s.scrapName || "").toLowerCase().includes(q)
    );
  }, [existingQuery, scraps]);

  // ---------- render ----------
  return (
    <div className="uc-root" role="region" aria-labelledby="scrap-creation-title">
      {/* Google/Local font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@500;700&display=swap" rel="stylesheet" />

      <style>{`
        :root{
          /* blue theme (matching ItemGroupCreation style) */
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
          font-size: 14px; /* increased base font size */
          box-sizing: border-box;
        }

        /* Main dashboard card (glass) */
        .dashboard {
          width: 100%;
          max-width: 1100px;
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
          font-size: 18px; /* slightly larger title */
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
          grid-template-columns: 1fr 360px;
          gap:18px;
          align-items:start;
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
        .muted { color: var(--muted); font-size:14px; }

        /* message */
        .message {
          margin-top:8px;
          padding:12px;
          border-radius:10px;
          font-weight:600;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .message.error { background: #fff1f2; color: #9f1239; border: 1px solid #ffd7da; }
        .message.success { background: #f0fdf4; color: #064e3b; border: 1px solid #bbf7d0; }
        .message.warning { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
        .message.info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }

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
          font-size: 14px;
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

        /* scraps table */
        .scraps-table-container {
          max-height: 400px;
          overflow-y: auto;
          border-radius: 8px;
          border: 1px solid rgba(12,18,35,0.04);
          margin-top: 12px;
        }

        .scraps-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .scraps-table th {
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

        .scraps-table td {
          padding: 12px;
          border-bottom: 1px solid rgba(230, 244, 255, 0.8);
          color: #3a4a5d;
          font-size: 14px;
        }

        .scraps-table tr:hover {
          background: linear-gradient(90deg, rgba(48,122,200,0.04), rgba(48,122,200,0.01));
          cursor: pointer;
        }

        .scraps-table tr.selected {
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
          font-size: 14px;
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

        /* Conflict error specific styling */
        .conflict-help {
          margin-top: 8px;
          padding: 10px;
          background: #fffbeb;
          border: 1px solid #fbbf24;
          border-radius: 6px;
          font-size: 13px;
          color: #92400e;
        }
        .conflict-help ul {
          margin: 4px 0 0 16px;
          padding: 0;
        }
        .conflict-help li {
          margin-bottom: 2px;
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
          .scraps-table-container {
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
          .scraps-table th,
          .scraps-table td {
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

      <div className="dashboard" aria-labelledby="scrap-creation-title">
        <div className="top-row">
          <div className="title-block">
            <svg width="38" height="38" viewBox="0 0 24 24" aria-hidden focusable="false">
              <rect width="24" height="24" rx="6" fill="#eff6ff" />
              <path d="M6 12h12M6 8h12M6 16h12" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h2 id="scrap-creation-title">Scrap Creation</h2>
              <div className="subtitle muted">Create, edit, or delete scrap items.</div>
            </div>
          </div>

          <div className="actions" role="toolbar" aria-label="actions">
            <AddButton onClick={() => { setActionType("Add"); resetForm(true); }} disabled={loading || !formPermissions.add} isActive={actionType === "Add"} />
            <EditButton onClick={openEditModal} disabled={loading || !formPermissions.edit} isActive={actionType === "edit"} />
            <DeleteButton onClick={openDeleteModal} disabled={loading || !formPermissions.delete} isActive={actionType === "delete"} />
          </div>
        </div>

        <div className="grid" role="main">
          <div className="card" aria-live="polite">
            {/* Scrap Code field */}
            <div className="field">
              <label className="field-label">
                Scrap Code <span className="asterisk">*</span>
              </label>
              <div className="row">
                <input
                  ref={scrapCodeRef}
                  className="input"
                  value={form.scrapCode}
                  onChange={(e) => setForm(s => ({ ...s, scrapCode: e.target.value }))}
                  placeholder="Scrap code (auto-generated)"
                  onKeyDown={onScrapCodeKeyDown}
                  disabled={loading}
                  aria-label="Scrap Code"
                  readOnly={actionType === "edit" || actionType === "delete"}
                />
              </div>
            </div>

            {/* Scrap Name field */}
            <div className="field">
              <label className="field-label">
                Scrap Name <span className="asterisk">*</span>
              </label>
              <div className="row">
                <input
                  ref={scrapNameRef}
                  className="input"
                  value={form.scrapName}
                  onChange={(e) => setForm(s => ({ ...s, scrapName: e.target.value.toUpperCase() }))}
                  placeholder="Enter scrap name"
                  onKeyDown={onScrapNameKeyDown}
                  disabled={loading}
                  aria-label="Scrap Name"
                  readOnly={actionType === "delete"}
                />
              </div>
            </div>

            {/* Message display */}
            {message && (
              <div className={`message ${message.type}`} role="alert">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {message.type === 'error' && <Icon.Close size={16} />}
                  {message.type === 'success' && <Icon.Check size={16} />}
                  {message.type === 'warning' && <Icon.Info size={16} />}
                  <span>{message.text}</span>
                </div>
                
                {message.type === "error" && message.text.includes("already exists") && (
                  <div className="conflict-help">
                    <strong>How to fix:</strong>
                    <ul>
                      <li>Check if the scrap name already exists in the table below</li>
                      <li>Choose a unique name that doesn't already exist</li>
                      <li>Consider adding a prefix or suffix to make it unique</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Submit controls */}
            <div className="submit-row">
              <button
                className="submit-primary"
                onClick={handleSubmit}
                disabled={loading}
                type="button"
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Processing...
                  </div>
                ) : (
                  actionType
                )}
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
              <div className="muted" style={{ marginBottom: "10px" }}>Existing Scraps</div>
              <div className="search-container" style={{ marginBottom: "10px" }}>
                <input
                  className="search-with-clear"
                  placeholder="Search existing scraps..."
                  value={existingQuery}
                  onChange={(e) => setExistingQuery(e.target.value)}
                  aria-label="Search existing scraps"
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

              <div className="scraps-table-container">
                {loading ? (
                  <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }} className="loading">
                    Loading scraps...
                  </div>
                ) : filteredExisting.length === 0 ? (
                  <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>
                    {scraps.length === 0 ? "No scraps found" : "No matching scraps"}
                  </div>
                ) : (
                  <table className="scraps-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Scrap Name</th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExisting.map((s) => {
                        const isCurrent = form.scrapCode === s.scrapCode;
                        const hasDuplicateName = scraps.filter(item => 
                          item.scrapName.toUpperCase() === s.scrapName.toUpperCase()
                        ).length > 1;
                        
                        return (
                          <tr
                            key={s.scrapCode}
                            className={isCurrent ? "selected" : ""}
                            onClick={() => {
                              setForm({ scrapCode: s.scrapCode, scrapName: s.scrapName });
                              setActionType("edit");
                            }}
                          >
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {s.scrapCode}
                                {isCurrent && <Icon.Edit size={12} />}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {s.scrapName}
                                {hasDuplicateName && (
                                  <span style={{ 
                                    fontSize: '10px', 
                                    background: '#fef3c7', 
                                    color: '#92400e',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    Duplicate
                                  </span>
                                )}
                              </div>
                            </td>
                           
                          </tr>
                        );
                      })}
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
              <div style={{ 
                fontWeight: 700, 
                fontSize: 14, 
                color: actionType === "Add" ? "var(--accent)" : 
                       actionType === "edit" ? "var(--warning)" : "var(--danger)" 
              }}>
                {actionType === "Add" ? "Create New" : actionType === "edit" ? "Edit Scrap" : "Delete Scrap"}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Scrap Code</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                {form.scrapCode || "Auto-generated"}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Scrap Name</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                {form.scrapName || "Not set"}
                {originalScrapName && actionType === "edit" && (
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                    Original: {originalScrapName}
                  </div>
                )}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Existing Scraps</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--accent-2)" }}>
                {scraps.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                {scraps.filter((s, i, arr) => 
                  arr.findIndex(item => item.scrapName.toUpperCase() === s.scrapName.toUpperCase()) === i
                ).length} unique names
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
                  <span><strong>Scrap names must be unique</strong> (case-insensitive)</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ color: "var(--accent)", fontWeight: "bold" }}>•</span>
                  <span>Check the table for existing names before creating/editing</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ color: "var(--accent)", fontWeight: "bold" }}>•</span>
                  <span>Names are automatically converted to UPPERCASE</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <span style={{ color: "var(--accent)", fontWeight: "bold" }}>•</span>
                  <span>Common scraps: METAL, PLASTIC, PAPER, GLASS, RUBBER</span>
                </div>
              </div>
              
              {actionType === "edit" && form.scrapName && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '10px', 
                  background: '#f0f9ff', 
                  borderRadius: '6px',
                  border: '1px solid #bae6fd'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#0369a1', marginBottom: '4px' }}>
                    Editing Tip:
                  </div>
                  <div style={{ fontSize: '12px', color: '#0c4a6e' }}>
                    If you're getting a duplicate error, try:
                    <ul style={{ margin: '4px 0 0 12px', padding: 0 }}>
                      <li>Adding numbers (KALE-1, KALE-2)</li>
                      <li>Using abbreviations (KALE-M, KALE-S)</li>
                      <li>Adding prefixes (SCRAP-KALE)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PopupListSelector
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSelect={(item) => { handleEditRowClick(item); setEditModalOpen(false); }}
        fetchItems={fetchItemsForModal}
        title="Select Scrap to Edit"
        displayFieldKeys={['scrapName', 'scrapCode']}
        searchFields={['scrapName', 'scrapCode']}
        headerNames={['Scrap Name', 'Code']}
        columnWidths={{ scrapName: '70%', scrapCode: '30%' }}
        maxHeight="60vh"
      />

      <PopupListSelector
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSelect={(item) => { handleDeleteRowClick(item); setDeleteModalOpen(false); }}
        fetchItems={fetchItemsForModal}
        title="Select Scrap to Delete"
        displayFieldKeys={['scrapName', 'scrapCode']}
        searchFields={['scrapName', 'scrapCode']}
        headerNames={['Scrap Name', 'Code']}
        columnWidths={{ scrapName: '70%', scrapCode: '30%' }}
        maxHeight="60vh"
      />
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}