import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import apiService from '../../api/apiService';
import { API_ENDPOINTS } from '../../api/endpoints';
import { AddButton, EditButton, DeleteButton } from '../../components/Buttons/ActionButtons';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';

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
  ChevronDown: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  ),
};

export default function StateCreation() {
  // ---------- state ----------
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);
  
  // Infinite scroll states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize] = useState(20); // Fixed page size for infinite scroll

  const [form, setForm] = useState({ 
    fuCode: "", 
    stateName: "",
    originalStateName: "" // Track original name when editing
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
  const stateCodeRef = useRef(null);
  const stateNameRef = useRef(null);
  const tableContainerRef = useRef(null);
  const submitRef = useRef(null);
  // Screen width state for responsive design
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);

  // Confirmation popup states
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ---------- API functions ----------
  const fetchNextStateCode = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.STATECREATION.NEXT_STATE_CODE);
      
      // Handle different response formats
      if (typeof response === 'string' && response.trim()) {
        setForm(prev => ({ ...prev, fuCode: response.trim() }));
      } else if (response && typeof response === 'object') {
        // Check for various possible field names in the response
        if (response.fuCode) {
          setForm(prev => ({ ...prev, fuCode: response.fuCode }));
        } else if (response.fcode) {
          setForm(prev => ({ ...prev, fuCode: response.fcode }));
        } else if (response.nextStateCode) {
          setForm(prev => ({ ...prev, fuCode: response.nextStateCode }));
        } else if (response.nextCode) {
          setForm(prev => ({ ...prev, fuCode: response.nextCode }));
        } else if (response.code) {
          setForm(prev => ({ ...prev, fuCode: response.code }));
        } else if (response.data) {
          // If response has data property
          if (typeof response.data === 'string') {
            setForm(prev => ({ ...prev, fuCode: response.data }));
          } else if (response.data.fuCode || response.data.fcode || response.data.nextStateCode) {
            setForm(prev => ({ 
              ...prev, 
              fuCode: response.data.fuCode || response.data.fcode || response.data.nextStateCode 
            }));
          }
        }
      }
      return response;
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load next state code" });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Fetch states with infinite scroll support
  const fetchStates = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const response = await apiService.get(
        API_ENDPOINTS.STATECREATION.GET_STATE_ITEMS(pageNum, pageSize)
      );
      
      let statesData = [];
      let totalRecords = 0;
      
      // Handle different API response formats
      if (response && Array.isArray(response)) {
        // If API returns direct array
        statesData = response || [];
        totalRecords = response.length;
      } else if (response && response.data && Array.isArray(response.data)) {
        // If API returns {data: [...]}
        statesData = response.data || [];
        totalRecords = response.data.length;
      } else if (response && response.items && Array.isArray(response.items)) {
        // If API returns paginated response
        statesData = response.items || [];
        totalRecords = response.totalRecords || response.items.length;
      } else if (response && response.states && Array.isArray(response.states)) {
        // If API returns {states: [...]}
        statesData = response.states || [];
        totalRecords = response.states.length;
      }
      
      // Map server fields (fcode, fname) to UI fields (fuCode, stateName)
      const mappedStates = statesData.map(state => ({
        ...state,
        fuCode: state.fcode || state.uCode || state.FCode || state.fuCode || state.code || '',
        stateName: state.fname || state.stateName || state.StateName || state.name || '',
        originalStateName: state.fname || state.stateName || state.StateName || state.name || ''
      }));
      
      // Append or replace states based on append flag
      if (append) {
        setStates(prev => [...prev, ...mappedStates]);
      } else {
        setStates(mappedStates);
      }
      
      // Check if there are more records to load
      const hasMoreData = statesData.length === pageSize;
      setHasMore(hasMoreData);
      
      // Update page number
      if (!append) {
        setPage(1);
      } else {
        setPage(prev => prev + 1);
      }
      
      setMessage(null);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load states" });
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const createState = async (stateData) => {
    try {
      setLoading(true);
      
      // Server expects fcode and fname (based on the logs)
      const requestData = { 
        fcode: stateData.fuCode, 
        fname: stateData.stateName 
      };
      
      const response = await apiService.post(
        API_ENDPOINTS.STATECREATION.CREATE_STATE, 
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response;
    } catch (err) {
      // Handle duplicate name error
      if (err.response?.status === 409) {
        const errorMsg = err.response?.data?.message || "State name already exists. Please choose a different name.";
        setMessage({ type: "error", text: errorMsg });
      }
      // Log validation errors in detail
      else if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        
        const errorMessages = [];
        for (const [field, messages] of Object.entries(validationErrors)) {
          if (Array.isArray(messages)) {
            errorMessages.push(...messages.map(msg => `${field}: ${msg}`));
          } else {
            errorMessages.push(`${field}: ${messages}`);
          }
        }
        
        if (errorMessages.length > 0) {
          setMessage({ 
            type: "error", 
            text: `Validation errors: ${errorMessages.join(', ')}` 
          });
        }
      }
      else {
        const errorMsg = err.response?.data?.title || 
                        err.response?.data?.message || 
                        err.message || 
                        "Failed to create state";
        setMessage({ type: "error", text: errorMsg });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateState = async (stateData, originalStateName = "") => {
    try {
      setLoading(true);
      
      // Check if name is actually being changed
      if (originalStateName && stateData.stateName === originalStateName) {
        setMessage({ type: "info", text: "State name unchanged. No update needed." });
        return { status: "unchanged" };
      }
      
      // Server expects fcode and fname (based on the logs)
      const requestData = { 
        fcode: stateData.fuCode, 
        fname: stateData.stateName 
      };
      
      const response = await apiService.put(
        API_ENDPOINTS.STATECREATION.UPDATE_STATE(stateData.fuCode), 
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response;
    } catch (err) {
      // Handle 409 Conflict - duplicate state name
      if (err.response?.status === 409) {
        const errorMsg = err.response?.data?.message || "State name already exists. Please choose a different name.";
        setMessage({ type: "error", text: errorMsg });
      }
      else if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        
        const errorMessages = [];
        for (const [field, messages] of Object.entries(validationErrors)) {
          if (Array.isArray(messages)) {
            errorMessages.push(...messages.map(msg => `${field}: ${msg}`));
          } else {
            errorMessages.push(`${field}: ${messages}`);
          }
        }
        
        if (errorMessages.length > 0) {
          setMessage({ 
            type: "error", 
            text: `Validation errors: ${errorMessages.join(', ')}` 
          });
        }
      }
      else {
        const errorMsg = err.response?.data?.title || 
                        err.response?.data?.message || 
                        err.message || 
                        "Failed to update state";
        setMessage({ type: "error", text: errorMsg });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteState = async (stateCode) => {
    try {
      setLoading(true);
      const url = API_ENDPOINTS.STATECREATION.DELETE_STATE(stateCode);
      const response = await apiService.del(url);
      return response;
    } catch (err) {
      if (err.response?.status === 409) {
        setMessage({ type: "error", text: "Cannot delete state. It is used elsewhere." });
      } else if (err.response?.status === 404) {
        setMessage({ type: "error", text: "State not found or already deleted." });
      } else {
        setMessage({ type: "error", text: "Delete failed." });
      }
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

// Focus on state name field on initial load/reload
useEffect(() => {
  const timer = setTimeout(() => {
    if (stateNameRef.current) {
      stateNameRef.current.focus();
    }
  }, 100); // Small delay to ensure DOM is ready
  return () => clearTimeout(timer);
}, []); // Empty dependency array = runs once on mount

// Additional focus for when actionType changes
useEffect(() => {
  if (actionType === "edit" || actionType === "Add") {
    const timer = setTimeout(() => {
      if (stateNameRef.current) {
        stateNameRef.current.focus();
        // Also select the text when in edit mode for easier editing
        if (actionType === "edit") {
          stateNameRef.current.select();
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }
}, [actionType]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px buffer
    
    if (isBottom && hasMore && !loadingMore && !loading) {
      fetchStates(page + 1, true);
    }
  }, [hasMore, loadingMore, loading, page]);

  // Attach scroll event listener
  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // ---------- handlers ----------
  const loadInitial = async () => {
    await Promise.all([
      fetchStates(1, false), 
      fetchNextStateCode()
    ]);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      fetchStates(page + 1, true);
    }
  };

  const handleEdit = async () => {
    if (!form.fuCode || !form.stateName) {
      setMessage({ type: "error", text: "Please fill State Code and State Name." });
      return;
    }

    if (form.stateName === form.originalStateName) {
      setMessage({ type: "info", text: "No changes made. State name is unchanged." });
      return;
    }

    setConfirmEditOpen(true);
  };

  const confirmEdit = async () => {
    setIsLoading(true);
    try {
      const stateData = { 
        fuCode: form.fuCode, 
        stateName: form.stateName 
      };
      const response = await updateState(stateData, form.originalStateName);
      
      if (response?.status !== "unchanged") {
        await loadInitial();
        setMessage({ type: "success", text: "State updated successfully." });
      }
      resetForm(true);
      setConfirmEditOpen(false);
    } catch (err) {
      // Error message already set in updateState
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.fuCode) {
      setMessage({ type: "error", text: "Please select a state to delete." });
      return;
    }
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteState(form.fuCode);
      await loadInitial();
      setMessage({ type: "success", text: "State deleted successfully." });
      resetForm();
      setConfirmDeleteOpen(false);
    } catch (err) {
      // Error message already set in deleteState
    } finally {
      setIsLoading(false);
    }
  };

 const handleAdd = async () => {
  if (!form.fuCode || !form.stateName) {
    setMessage({ type: "error", text: "Please fill State Code and State Name." });
    return;
  }

  // Check for duplicate state name (case-insensitive)
  const nameExists = states.some(state => 
    (state.stateName || state.fname).toLowerCase() === form.stateName.toLowerCase()
  );

  if (nameExists) {
    setMessage({ 
      type: "error", 
      text: `State name "${form.stateName}" already exists. Please use a different name.` 
    });
    return; // Don't proceed with save
  }

  // If no duplicate, proceed to confirmation
  setConfirmSaveOpen(true);
};

  const confirmSave = async () => {
    setIsLoading(true);
    try {
      const stateData = { 
        fuCode: form.fuCode, 
        stateName: form.stateName 
      };
      await createState(stateData);
      await loadInitial();
      setMessage({ type: "success", text: "State created successfully." });
      resetForm(true);
      setConfirmSaveOpen(false);
    } catch (err) {
      // Error message already set in createState
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (actionType === "Add") await handleAdd();
    else if (actionType === "edit") await handleEdit();
    else if (actionType === "delete") await handleDelete();
  };

const resetForm = (keepAction = false) => {
  fetchNextStateCode();
  setForm(prev => ({ ...prev, stateName: "", originalStateName: "" }));
  setEditingId(null);
  setDeleteTargetId(null);
  setExistingQuery("");
  setEditQuery("");
  setDeleteQuery("");
  setMessage(null);
  if (!keepAction) setActionType("Add");
  
  // This line already focuses on stateName field after reset - GOOD
  setTimeout(() => stateNameRef.current?.focus(), 60);
};

  const openEditModal = () => {
    setEditQuery("");
    setEditModalOpen(true);
    stateNameRef.current?.focus()
  };

const handleEditRowClick = (s) => {
  setForm({ 
    fuCode: s.fuCode || s.fcode || s.uCode || s.FCode, 
    stateName: s.stateName || s.fname || s.StateName,
    originalStateName: s.stateName || s.fname || s.StateName
  });
  setActionType("edit");
  setEditingId(s.fuCode || s.fcode || s.uCode || s.FCode);
  setEditModalOpen(false);
  setTimeout(() => {
    stateNameRef.current?.focus();
    stateNameRef.current?.select(); // GOOD - selects text for easy editing
  }, 60);
};

  const openDeleteModal = () => {
    setDeleteQuery("");
    setDeleteModalOpen(true);
   stateNameRef.current?.focus()
  };

  const fetchItemsForModal = useCallback(async (page = 1, search = '') => {
    const modalPageSize = 20;
    const q = (search || '').trim().toLowerCase();
    const filtered = q
      ? states.filter(s => 
          (s.fuCode || s.fcode || '').toString().toLowerCase().includes(q) || 
          (s.stateName || s.fname || '').toString().toLowerCase().includes(q)
        )
      : states;
    const start = (page - 1) * modalPageSize;
    return filtered.slice(start, start + modalPageSize);
  }, [states]);

const handleDeleteRowClick = (s) => {
  setForm({ 
    fuCode: s.fuCode || s.fcode || s.uCode || s.FCode, 
    stateName: s.stateName || s.fname || s.StateName,
    originalStateName: s.stateName || s.fname || s.StateName
  });
  setActionType("delete");
  setDeleteTargetId(s.fuCode || s.fcode || s.uCode || s.FCode);
  setDeleteModalOpen(false);
  setTimeout(() => stateNameRef.current?.focus(), 60); // GOOD
};

  const onStateCodeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      stateNameRef.current?.focus();
    }
  };

  const onStateNameKeyDown = (e) => {
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

  const isStateNameDuplicate = useCallback((name, excludeCode = null) => {
    return states.some(state => 
      (state.fuCode || state.fcode) !== excludeCode && 
      (state.stateName || state.fname).toLowerCase() === name.toLowerCase()
    );
  }, [states]);

  // ---------- filters ----------
  const filteredEditStates = useMemo(() => {
    const q = editQuery.trim().toLowerCase();
    if (!q) return states;
    return states.filter(
      (s) =>
        (s.fuCode || s.fcode || "").toString().toLowerCase().includes(q) ||
        (s.stateName || s.fname || "").toString().toLowerCase().includes(q)
    );
  }, [editQuery, states]);

  const filteredDeleteStates = useMemo(() => {
    const q = deleteQuery.trim().toLowerCase();
    if (!q) return states;
    return states.filter(
      (s) =>
        (s.fuCode || s.fcode || "").toString().toLowerCase().includes(q) ||
        (s.stateName || s.fname || "").toString().toLowerCase().includes(q)
    );
  }, [deleteQuery, states]);

  const filteredExisting = useMemo(() => {
    const q = existingQuery.trim().toLowerCase();
    if (!q) return states;
    return states.filter(
      (s) => 
        (s.fuCode || s.fcode || "").toString().toLowerCase().includes(q) || 
        (s.stateName || s.fname || "").toString().toLowerCase().includes(q)
    );
  }, [existingQuery, states]);

  // FIXED: Generate unique key that includes both code and name
  const getStateKey = (s, index) => {
    const code = s.fuCode || s.fcode || s.uCode || s.FCode || '';
    const name = s.stateName || s.fname || s.StateName || s.name || '';
    // Combine code and name to create a unique key
    const uniqueKey = `${code}-${name}`.replace(/\s+/g, '-').toLowerCase();
    
    // If both code and name are empty, use index as fallback
    if (!code && !name) return `state-${index}`;
    
    // Add index to ensure uniqueness even if code+name combo is duplicated
    return `${uniqueKey}-${index}`;
  };

  const isCurrentNameDuplicate = useMemo(() => {
    if (actionType !== "edit" || !form.stateName || !form.originalStateName) return false;
    if (form.stateName === form.originalStateName) return false;
    return isStateNameDuplicate(form.stateName, form.fuCode);
  }, [form.stateName, form.originalStateName, form.fuCode, actionType, isStateNameDuplicate]);

  // ---------- render ----------
  return (
    <div className="uc-root" role="region" aria-labelledby="state-creation-title">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@500;700&display=swap" rel="stylesheet" />

      <style>{`
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


        .card {
        width: 100%;
  max-width: 100%;
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
        .input.warning { 
          border-color: var(--warning);
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1); 
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
        .muted { color: var(--muted); font-size:13px; }

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
        .message.info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }

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

        .states-table-container {
          max-height: 400px;
          overflow-y: auto;
          border-radius: 8px;
          border: 1px solid rgba(12,18,35,0.04);
          margin-top: 12px;
        }

        .states-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .states-table th {
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

        .states-table td {
          padding: 12px;
          border-bottom: 1px solid rgba(230, 244, 255, 0.8);
          color: #3a4a5d;
          font-size: 14px;
        }

        .states-table tr:hover {
          background: linear-gradient(90deg, rgba(48,122,200,0.04), rgba(48,122,200,0.01));
          cursor: pointer;
        }

        .states-table tr.selected {
          background: linear-gradient(90deg, rgba(48,122,200,0.1), rgba(48,122,200,0.05));
          box-shadow: inset 2px 0 0 var(--accent);
        }

        /* Infinite scroll loader */
        .infinite-scroll-loader {
          padding: 16px;
          text-align: center;
          color: var(--muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .load-more-btn {
          padding: 8px 16px;
          background: linear-gradient(180deg, var(--accent), var(--accent-2));
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .load-more-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(48,122,200,0.2);
        }

        .load-more-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Loading animation */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .loading {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
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
          .states-table-container {
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
          .states-table th,
          .states-table td {
            padding: 8px;
            font-size: 12px;
          }
        }
      `}</style>

      <div className="dashboard" aria-labelledby="state-creation-title">
        <div className="top-row">
          <div className="title-block">
            <svg width="38" height="38" viewBox="0 0 24 24" aria-hidden focusable="false">
              <rect width="24" height="24" rx="6" fill="#eff6ff" />
              <path d="M6 12h12M6 8h12M6 16h12" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h2 id="state-creation-title">State Creation</h2>
              <div className="subtitle muted">Create, edit, or delete states.</div>
            </div>
          </div>

          <div className="actions" role="toolbar" aria-label="actions">
            <AddButton onClick={() => { setActionType("Add"); resetForm(true); }} disabled={loading} isActive={actionType === "Add"} />
            <EditButton onClick={openEditModal} disabled={loading} isActive={actionType === "edit"} />
            <DeleteButton onClick={openDeleteModal} disabled={loading} isActive={actionType === "delete"} />
          </div>
        </div>

        <div className="grid" role="main">
          <div className="card" aria-live="polite">
            {/* State Code field */}
            <div className="field">
              <label className="field-label">
                State Code <span className="asterisk">*</span>
              </label>
              <div className="row">
                <input
                  ref={stateCodeRef}
                  className="input"
                  value={form.fuCode}
                  onChange={(e) => setForm(s => ({ ...s, fuCode: e.target.value }))}
                  placeholder="State code (auto-generated)"
                  onKeyDown={onStateCodeKeyDown}
                  disabled={loading || actionType === "edit" || actionType === "delete"}
                  aria-label="State Code"
                  readOnly={true}
                />
                
              </div>
            </div>

            {/* State Name field */}
            <div className="field">
              <label className="field-label">
                State Name <span className="asterisk">*</span>
                {isCurrentNameDuplicate && actionType === "edit" && (
                  <span className="validation-warning">
                    <Icon.Info size={14} />
                    This name already exists for another state!
                  </span>
                )}
              </label>
              <div className="row">
                <input 
                  ref={stateNameRef} 
                  className={`input ${isCurrentNameDuplicate ? 'warning' : ''}`}
                  value={form.stateName} 
                  onChange={(e) => setForm(s => ({ ...s, stateName: e.target.value }))} 
                 
                  
                  onKeyDown={onStateNameKeyDown}
                  disabled={loading}
                  aria-label="State Name"
                  readOnly={actionType === "delete"}
                />
              </div>
              {actionType === "edit" && form.originalStateName && (
                <div className="muted" style={{ fontSize: "14px", marginTop: "4px" }}>
                  Original name: <strong>{form.originalStateName}</strong>
                </div>
              )}
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
                disabled={loading || (actionType === "edit" && isCurrentNameDuplicate)}
                type="button"
              >
                {loading ? "Processing..." : 
                  actionType === "Add" ? "Create" : 
                  actionType === "edit" ? "Update" : "Delete"}
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

            {/* Existing States List */}
            <div className="stat" style={{ flex: 1, minHeight: "200px", marginTop: "20px" }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: "10px" }}>
                <div className="muted">Existing States</div>
                <div className="muted" style={{ fontSize: "14px" }}>
                  {states.length} states loaded • {hasMore ? "Scroll for more" : "All states loaded"}
                </div>
              </div>
              
              <div className="search-container" style={{ marginBottom: "10px" }}>
                <input
                  className="search-with-clear"
                  placeholder="Search existing states..."
                  value={existingQuery}
                  onChange={(e) => setExistingQuery(e.target.value)}
                  aria-label="Search existing states"
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
              
              <div 
                className="states-table-container" 
                ref={tableContainerRef}
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {loading && !loadingMore ? (
                  <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }} className="loading">
                    Loading states...
                  </div>
                ) : filteredExisting.length === 0 ? (
                  <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>
                    {states.length === 0 ? "No states found" : "No matching states"}
                  </div>
                ) : (
                  <>
                    <table className="states-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>State Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExisting.map((s, index) => (
                          <tr 
                            key={getStateKey(s, index)}
                            className={form.fuCode === (s.fuCode || s.fcode) ? "selected" : ""}
                            onClick={() => {
                              setForm({ 
                                fuCode: s.fuCode || s.fcode, 
                                stateName: s.stateName || s.fname,
                                originalStateName: s.stateName || s.fname
                              });
                              setActionType("edit");
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <td>{s.fuCode || s.fcode}</td>
                            <td>{s.stateName || s.fname}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Infinite Scroll Loader */}
                    <div className="infinite-scroll-loader">
                      {loadingMore ? (
                        <>
                          <svg className="spinner" width="24" height="24" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="4" fill="none" strokeDasharray="80" strokeDashoffset="60" />
                          </svg>
                          <div>Loading more states...</div>
                        </>
                      ) : hasMore ? (
                        <>
                          <div>Scroll down to load more states</div>
                          <button 
                            className="load-more-btn" 
                            onClick={loadMore}
                            disabled={loading || loadingMore}
                          >
                            <Icon.ChevronDown />
                            Load More
                          </button>
                        </>
                      ) : (
                        <div>All states loaded ✓</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right side panel */}
          <div className="side" aria-live="polite">
           

            

           

            

           
          </div>
        </div>
      </div>

      {/* Edit Popup */}
      <PopupListSelector
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSelect={(item) => { 
          handleEditRowClick(item); 
          setEditModalOpen(false); 
        }}
        fetchItems={fetchItemsForModal}
        title="Select State to Edit"
        displayFieldKeys={['stateName', 'fuCode']}
        searchFields={['stateName', 'fuCode']}
        headerNames={['State Name', 'Code']}
        columnWidths={{ stateName: '70%', fuCode: '30%' }}
        maxHeight="60vh"
      />

      {/* Delete Popup */}
      <PopupListSelector
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSelect={(item) => { 
          handleDeleteRowClick(item); 
          setDeleteModalOpen(false); 
        }}
        fetchItems={fetchItemsForModal}
        title="Select State to Delete"
        displayFieldKeys={['stateName', 'fuCode']}
        searchFields={['stateName', 'fuCode']}
        headerNames={['State Name', 'Code']}
        columnWidths={{ stateName: '70%', fuCode: '30%' }}
        maxHeight="60vh"
        warningText="Deleting a state cannot be undone. Make sure the state is not referenced elsewhere."
      />

      {/* Save Confirmation Popup */}
      <ConfirmationPopup
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={confirmSave}
        title="Create State"
        message={`Are you sure you want to create state "${form.stateName}"? This action cannot be undone.`}
        type="success"
        confirmText={isLoading ? "Creating..." : "Create"}
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
        title="Update State"
        message={`Are you sure you want to update state "${form.stateName}"? This action cannot be undone.`}
        type="warning"
        confirmText={isLoading ? "Updating..." : "Update"}
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
        title="Delete State"
        message={`Are you sure you want to delete state "${form.stateName}"? This action cannot be undone.`}
        type="danger"
        confirmText={isLoading ? "Deleting..." : "Delete"}
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