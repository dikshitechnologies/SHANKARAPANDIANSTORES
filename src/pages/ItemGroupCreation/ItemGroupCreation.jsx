import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { api } from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/endpoints';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import { AddButton, EditButton, DeleteButton } from '../../components/Buttons/ActionButtons';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const endpoints = API_ENDPOINTS.ITEM_GROUP || {};

// --- Inline SVG icons (SAME as Item Creation) ---
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
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  ),
  Close: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.29 19.71 2.88 18.29 9.18 12 2.88 5.71 4.29 4.29 16.88 16.88z" />
    </svg>
  ),
  Folder: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M10 4H4a2 2 0 00-2 2v2h20V8a2 2 0 00-2-2h-8l-2-2zM2 10v8a2 2 0 002 2h16a2 2 0 002-2v-8H2z" />
    </svg>
  ),
  File: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7zM13 3.5L18.5 9H13V3.5z" />
    </svg>
  ),
  Chevron: ({ down = false, size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false" style={{ transform: down ? "rotate(90deg)" : "none" }}>
      <path fill="currentColor" d="M9 6l6 6-6 6" />
    </svg>
  ),
};

// --- Tree node component (SAME as Item Creation) ---
function TreeNode({ node, level = 0, onSelect, expandedKeys, toggleExpand, selectedKey, onNavigate }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedKeys.has(node.key);
  const isSelected = selectedKey === node.key;

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        onSelect(node);
        break;
      case "ArrowRight":
        e.preventDefault();
        if (hasChildren && !isExpanded) {
          toggleExpand(node.key);
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (hasChildren && isExpanded) {
          toggleExpand(node.key);
        }
        break;
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault();
        onNavigate?.(e.key === "ArrowDown" ? "down" : "up", node.key);
        break;
      default:
        break;
    }
  };

  return (
    <div className="tree-node" style={{ paddingLeft: `${12 + level * 16}px` }}>
      <div
        className={`tree-row ${isSelected ? "selected" : ""}`}
        onClick={() => onSelect(node)}
        role="button"
        tabIndex={isSelected ? 0 : -1}
        onKeyDown={handleKeyDown}
        data-tree-key={node.key}
      >
        {hasChildren ? (
          <button
            className="chev"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(node.key);
            }}
            aria-label={isExpanded ? "Collapse group" : "Expand group"}
          >
            <span className={`chev-rot ${isExpanded ? "open" : ""}`}><Icon.Chevron /></span>
          </button>
        ) : (
          <span className="chev-placeholder" />
        )}

        <span className="node-icon" aria-hidden>
          {hasChildren ? <Icon.Folder /> : <Icon.File />}
        </span>

        <span className="node-text" title={node.displayName}>
          {node.displayName}
        </span>
      </div>

      {hasChildren && (
        <div
          className={`node-children ${isExpanded ? "show" : ""}`}
          style={{
            height: isExpanded ? "auto" : 0,
            overflow: isExpanded ? "visible" : "hidden",
            transition: "all 220ms cubic-bezier(.2,.8,.2,1)",
          }}
        >
          {isExpanded &&
            node.children.map((child) => (
              <TreeNode
                key={child.key}
                node={child}
                level={level + 1}
                onSelect={onSelect}
                expandedKeys={expandedKeys}
                toggleExpand={toggleExpand}
                selectedKey={selectedKey}
                onNavigate={onNavigate}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function ItemGroupCreation() {
  // Your EXISTING code logic - NOT CHANGED
  const [mainGroup, setMainGroup] = useState("");
  const [subGroup, setSubGroup] = useState("");
  const [fCode, setFCode] = useState("");
  const [actionType, setActionType] = useState("Add");

  const [treeData, setTreeData] = useState([]);
  const [dropdownData, setDropdownData] = useState([]);
  const [subGroupOptions, setSubGroupOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [isTreeOpen, setIsTreeOpen] = useState(true); // Tree starts closed
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchTree, setSearchTree] = useState("");
  const [searchDropdown, setSearchDropdown] = useState("");
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  const mainGroupRef = useRef(null);
  const subGroupRef = useRef(null);
  const submitButtonRef = useRef(null);
  
  // Confirmation Popup States (ADDED to match Unit Creation)
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // Get permissions (using your hook)
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  const formPermissions = useMemo(() => ({
    add: hasAddPermission('ITEM_GROUP_CREATION'),
    edit: hasModifyPermission('ITEM_GROUP_CREATION'),
    delete: hasDeletePermission('ITEM_GROUP_CREATION')
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  useEffect(() => {
    loadInitial();
    // Focus Main Group input on initial load
    if (mainGroupRef.current) {
      mainGroupRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Effect to focus sub group input when in edit mode and sub group is selected
  useEffect(() => {
    if (actionType === "edit" && subGroup && fCode) {
      // Small timeout to ensure DOM is updated
      setTimeout(() => {
        if (subGroupRef.current) {
          subGroupRef.current.focus();
        }
      }, 100);
    }
  }, [actionType, subGroup, fCode]);

   useEffect(() => {
    if (actionType === "delete" && subGroup && fCode) {
      // Small timeout to ensure DOM is updated
      setTimeout(() => {
        if (subGroupRef.current) {
          subGroupRef.current.focus();
        }
      }, 100);
    }
  }, [actionType, subGroup, fCode]);

  // Add click outside handler to close tree
  useEffect(() => {
    const handleClickOutside = (event) => {
      const treePanel = document.getElementById('group-tree');
      const mainGroupInput = mainGroupRef.current;
      
      if (isTreeOpen && 
          treePanel && 
          mainGroupInput && 
          !treePanel.contains(event.target) && 
          !mainGroupInput.contains(event.target)) {
        setIsTreeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTreeOpen]);

  // Helper function to recursively collect all node keys
  const getAllNodeKeys = (nodes) => {
    const keys = new Set();
    const collect = (items) => {
      items.forEach((item) => {
        keys.add(item.key);
        if (item.children && item.children.length > 0) {
          collect(item.children);
        }
      });
    };
    collect(nodes);
    return keys;
  };

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [treeResp, ddResp] = await Promise.all([
        api.get(endpoints.getTree), 
        api.get(endpoints.getDropdown)
      ]);
      
      console.log("Tree Response:", treeResp);
      console.log("Dropdown Response:", ddResp);
      
      const tree = transformApiData(treeResp.data || []);
      setTreeData(tree);
      setExpandedKeys(getAllNodeKeys(tree));
      setDropdownData(Array.isArray(ddResp.data) ? ddResp.data : []);
      setSubGroupOptions(
        (Array.isArray(ddResp.data) ? ddResp.data : []).map((item) => ({
          label: item.fitemname || item.fAcname || "Unnamed",
          value: item.fitemname || item.fAcname || "Unnamed",
          parentName: item.parentName || "",
          fcode: item.fitemcode || item.fcode || item.fCode || "",
        }))
      );
      setMessage(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setMessage({ type: "error", text: "Failed to load data. Check console." });
    } finally {
      setLoading(false);
    }
  };

  const fetchPopupItems = useCallback(async (page = 1, search = '') => {
    try {
      const resp = await api.get(endpoints.getDropdown);
      const items = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);

      const q = (search || '').trim().toLowerCase();
      const filtered = q
        ? items.filter(it => (it.fitemname || it.fAcname || '').toLowerCase().includes(q) || (it.parentName || '').toLowerCase().includes(q))
        : items;

      const pageSize = 20;
      const start = (page - 1) * pageSize;
      const pageItems = filtered.slice(start, start + pageSize);

      return pageItems.map(it => ({
        fName: it.fitemname || it.fAcname || it.fName || '',
        fParent: it.parentName || it.fParent || '',
        fCode: it.fitemcode || it.fcode || it.fCode || '',
        raw: it,
      }));
    } catch (err) {
      console.error('fetchPopupItems error', err);
      return [];
    }
  }, []);

  const transformApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    const build = (items, parentPath = "") =>
      items.map((item, idx) => {
        const key = `${parentPath}/${item.fitemcode || item.fcode || item.fCode || idx}`;
        return {
          key,
          displayName: item.fitemname || item.fAcname || "Unnamed",
          id: item.fitemcode || item.fcode || item.fCode || null,
          children: Array.isArray(item.children) ? build(item.children, key) : [],
        };
      });
    return build(apiData);
  };

  const toggleExpand = (key) => {
    setExpandedKeys((prev) => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      return s;
    });
  };

  const handleSelectNode = (node) => {
    setSelectedNode(node);
    setMainGroup(node.displayName);
    setIsTreeOpen(false); // Tree closes automatically when selecting
    setTimeout(() => subGroupRef.current?.focus(), 100);
  };

  const handleSelectSub = (option) => {
    setSubGroup(option.value);
    setFCode(option.fcode);
    if (option.parentName) setMainGroup(option.parentName);
    setIsDropdownOpen(false);
    setIsTreeOpen(true);
  };

  const filteredTree = useMemo(() => {
    if (!searchTree) return treeData;
    const q = searchTree.trim().toLowerCase();
    const filter = (nodes) => {
      const out = [];
      for (const n of nodes) {
        const matched = n.displayName.toLowerCase().includes(q);
        const children = filter(n.children || []);
        if (matched || children.length > 0) out.push({ ...n, children });
      }
      return out;
    };
    return filter(treeData);
  }, [treeData, searchTree]);

  const filteredDropdown = useMemo(() => {
    if (!searchDropdown) return subGroupOptions;
    const q = searchDropdown.toLowerCase();
    return subGroupOptions.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.parentName || "").toLowerCase().includes(q)
    );
  }, [subGroupOptions, searchDropdown]);

  const resetForm = () => {
    setMainGroup("");
    setSubGroup("");
    setFCode("");
    setSelectedNode(null);
    setMessage(null);
    setSearchDropdown("");
    setSearchTree("");
    setIsDropdownOpen(false);
    setIsTreeOpen(false); // Keep tree closed on reset
    // Focus Main Group input after reset
    setTimeout(() => {
      if (mainGroupRef.current) {
        mainGroupRef.current.focus();
      }
    }, 100);
  };
    const resetForm1 = () => {
    setMainGroup("");
    setSubGroup("");
    setFCode("");
    setSelectedNode(null);
    setMessage(null);
    setSearchDropdown("");
    setSearchTree("");
    setIsDropdownOpen(false);
    setIsTreeOpen(false); // Keep tree closed on reset
    setActionType("Add");
    // Focus Main Group input after reset
    setTimeout(() => {
      if (mainGroupRef.current) {
        mainGroupRef.current.focus();
      }
    }, 100);
  };

  const validateForSubmit = () => {
    if (!mainGroup?.trim()) {
      setMessage({ type: "error", text: "Please select a Main Group." });
      return false;
    }
    if (actionType !== "delete" && !subGroup?.trim()) {
      setMessage({ type: "error", text: "Please enter/select a Sub Group." });
      return false;
    }
    if ((actionType === "edit" || actionType === "delete") && !fCode) {
      setMessage({ type: "error", text: `Select a Sub Group to ${actionType}.` });
      return false;
    }
    return true;
  };

  // Handle keyboard navigation for tree nodes
  const handleTreeNavigation = useCallback((direction, currentKey) => {
    const flatten = (nodes) => {
      let out = [];
      nodes.forEach(n => {
        out.push(n);
        if (expandedKeys.has(n.key) && n.children?.length) {
          out = out.concat(flatten(n.children));
        }
      });
      return out;
    };

    const list = flatten(filteredTree);
    const idx = list.findIndex(n => n.key === currentKey);
    if (idx === -1) return;

    const next = direction === "down" ? idx + 1 : idx - 1;
    const target = list[Math.max(0, Math.min(next, list.length - 1))];

    if (target) {
      setSelectedNode(target); // 🔥 only move selection, don't close tree
      // Focus the newly selected node
      setTimeout(() => {
        const elem = document.querySelector(`[data-tree-key="${target.key}"]`);
        elem?.focus();
      }, 0);
    }
  }, [filteredTree, expandedKeys]);

  // Add / Edit / Delete handlers
  const handleAdd = async () => {
    // Check permission before allowing action
    if (!formPermissions.add) {
      toast.error("You don't have permission to add item groups.");
      return;
    }
    if (!validateForSubmit()) return;
    setConfirmSaveOpen(true);
  };

  const confirmSave = async () => {
    setConfirmSaveOpen(false);
    setSubmitting(true);
    setMessage(null);
    try {
      setActionType("Add");
      const payload = {
        fitemcode: "",
        subGroup: subGroup.trim(),
        mainGroup: mainGroup.trim(),
        fitemlevel: "",
      };
      const resp = await api.post(endpoints.postCreate, payload);
      if (resp.status === 200 || resp.status === 201) {
        // toast.success("Item group created successfully.");
        resetForm();
        await loadInitial();
      } else {
        toast.error(`Unexpected server response: ${resp.status}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    // Check permission before allowing action
    if (!formPermissions.edit) {
      toast.error("You don't have permission to edit item groups.");
      return;
    }
    if (!validateForSubmit()) return;
    setConfirmEditOpen(true);
  };

  const confirmEdit = async () => {
    setConfirmEditOpen(false);
    setSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        fitemcode: fCode,
        subGroup: subGroup.trim(),
        mainGroup: mainGroup.trim(),
        fitemlevel: "",
      };
      const resp = await api.put(endpoints.putEdit, payload);
      if (resp.status === 200 || resp.status === 201) {
        // toast.success("Item group updated successfully.");
        setActionType("Add");
        resetForm();
        await loadInitial();
      } else {
        toast.error(`Unexpected server response: ${resp.status}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    // Check permission before allowing action
    if (!formPermissions.delete) {
      toast.error("You don't have permission to delete item groups.");
      return;
    }
    if (!validateForSubmit()) return;
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setConfirmDeleteOpen(false);
    setSubmitting(true);
    setMessage(null);
    try {
      const deleteEndpoint = typeof endpoints.delete === 'function' ? endpoints.delete(fCode) : endpoints.delete;
      const resp = await api.delete(deleteEndpoint);
      if (resp.status === 200 || resp.status === 201) {
        // toast.success("Item group deleted successfully.");
        setActionType("Add");
        resetForm();
        await loadInitial();
      } else {
        toast.error(`Unexpected server response: ${resp.status}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (actionType === "Add") await handleAdd();
    else if (actionType === "edit") await handleEdit();
    else if (actionType === "delete") await handleDelete();
  };

  // Handle keyboard navigation in Main Group input
  const handleMainGroupKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      subGroupRef.current?.focus();
    }
  };

  // Handle Enter key press in sub group input for edit mode
 const handleSubGroupKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      mainGroupRef.current?.focus();
      setIsTreeOpen(true); // Open tree when moving up
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (actionType === "edit" && subGroup && fCode) {
        // In edit mode with sub group selected, pressing Enter triggers edit
        submitButtonRef.current?.focus();
        
      } else if (actionType === "Add") {
        // In add mode, just focus submit button
        submitButtonRef.current?.focus();
      }
      else if (actionType === "delete") {
        // In delete mode, just focus submit button
                submitButtonRef.current?.focus();

      }
      handleSubmit();
    }
  };

  useEffect(() => {
    if (fCode) {
      const opt = subGroupOptions.find((o) => o.fcode === fCode);
      if (opt?.parentName) setMainGroup((prev) => prev || opt.parentName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fCode]);

  return (
    <div className="lg-root" role="region" aria-labelledby="item-group-title">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@500;700&display=swap" rel="stylesheet" />

      {/* Check if user has any permission to access this module */}
      {/* {!formPermissions.add && !formPermissions.edit && !formPermissions.delete && (
        <div style={{
          padding: '20px',
          margin: '20px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          textAlign: 'center'
        }}>
          <h3>Access Denied</h3>
          <p>You do not have permission to access the Item Group Creation module.</p>
        </div>
      )} */}

      {/* SAME CSS as Item Creation - ONLY CHANGED PART */}
      <style>{`
        /* Toast notification styles */
        .Toastify__toast-container {
          z-index: 9999;
        }
        .Toastify__toast {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          border-radius: 10px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        .Toastify__toast--success {
          background: linear-gradient(180deg, #f0fdf4, #dcfce7);
          color: #064e3b;
          border: 1px solid #bbf7d0;
        }
        .Toastify__toast-body {
          font-size: 14px;
          font-weight: 500;
        }

        :root{
          /* custom blue theme - SAME as Item Creation */
          --bg-1: #f0f7fb;
          --bg-2: #f7fbff;
          --glass: rgba(255,255,255,0.55);
          --glass-2: rgba(255,255,255,0.35);
          --accent: #307AC8;
          --accent-2: #1B91DA;
          --accent-3: #06A7EA;
          --success: #06A7EA;
          --danger: #ef4444;
          --muted: #64748b;
          --card-shadow: 0 8px 30px rgba(16,24,40,0.08);
          --glass-border: rgba(255,255,255,0.45);
        }

        /* Page layout - SAME as Item Creation */
        .lg-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 16px;
          background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
          font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          box-sizing: border-box;
        }

        /* Main dashboard card (glass) - SAME as Item Creation */
        .dashboard {
          width: 100%;
          max-width: 700px;
          border-radius: 16px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(255,255,255,0.75), rgba(245,248,255,0.65));
          box-shadow: var(--card-shadow);
          backdrop-filter: blur(8px) saturate(120%);
          border: 1px solid rgba(255,255,255,0.6);
          overflow: visible;
          transition: transform 260ms cubic-bezier(.2,.8,.2,1);
          margin-bottom: 160px;
        }
        .dashboard:hover { transform: translateY(-2px); }

        /* header - SAME as Item Creation */
        .top-row {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .title-block {
          display:flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 4px;
        }
        .title-block h2 {
          margin:0;
          font-family: "Poppins", "Inter", sans-serif;
          font-size: 20px;
          color: #0f172a;
          letter-spacing: -0.2px;
        }
        .subtitle {
          color: var(--muted);
          font-size: 13px;
        }

        /* action pills - SAME as Item Creation */
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
          font-size: 13px;
          transition: all 0.2s;
          border: none;
        }
        .action-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2,6,23,0.08);
        }
        .action-pill:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }
        .action-pill.primary { 
          color:white; 
          background: linear-gradient(180deg, var(--accent), var(--accent-2));
          border: 1px solid rgba(48, 122, 200, 0.3);
        }
        .action-pill.warn { 
          color:white; 
          background: linear-gradient(180deg,#f59e0b,#f97316);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .action-pill.danger { 
          color:white; 
          background: linear-gradient(180deg,var(--danger),#f97373);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .grid {
          display: block;
          width: 100%;
        }

        /* left card (form) - SAME as Item Creation */
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
          font-size:13px;
          text-align: left;
          width: 100%;
        }

        .field { 
          margin-bottom:12px; 
          display:flex; 
          flex-direction:column; 
          align-items:flex-start; 
          position: relative;
        }

        .row { 
          display:flex; 
          gap:8px; 
          align-items:center; 
          width:100%;
          flex-wrap: wrap;
        }
        .input, .search, .select {
          flex:1;
          min-width: 0;
          padding:10px 12px;
          border-radius:10px;
          border: 1px solid rgba(15,23,42,0.1);
          background: linear-gradient(180deg, #fff, #fbfdff);
          font-size:14px;
          color:#0f172a;
          box-sizing:border-box;
          transition: all 160ms ease;
          text-align: left;
          font-family: inherit;
        }
        .input:focus, .search:focus, .select:focus { 
          outline:none; 
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15); 
          border-color: rgba(37,99,235,0.5); 
        }
        .input:disabled, .select:disabled {
          background: #f1f5f9;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .btn {
          padding:10px 12px;
          border-radius:10px;
          border:1px solid rgba(12,18,35,0.1);
          background: linear-gradient(180deg,#fff,#f8fafc);
          cursor:pointer;
          min-width:86px;
          font-weight:600;
          white-space: nowrap;
          font-family: inherit;
          transition: all 0.2s;
        }
        .btn:hover {
          background: linear-gradient(180deg,#f8fafc,#f1f5f9);
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .controls { 
          display:flex; 
          gap:10px; 
          margin-top:10px; 
          flex-wrap:wrap; 
        }

        /* tree panel - SAME as Item Creation */
        .panel {
          margin-top:8px;
          border-radius:10px;
          background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(250,251,255,0.6));
          border: 1px solid rgba(12,18,35,0.08);
          padding:10px;
          width: 100%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .tree-scroll { 
          max-height:260px; 
          overflow:auto; 
          padding-right:6px;
          scrollbar-width: thin;
          scrollbar-color: rgba(12,18,35,0.1) transparent;
        }
        .tree-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .tree-scroll::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        .tree-scroll::-webkit-scrollbar-thumb {
          background: rgba(12,18,35,0.15);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .tree-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(12,18,35,0.25);
        }

        .tree-row {
          display:flex;
          align-items:center;
          gap:10px;
          padding:10px;
          border-radius:10px;
          cursor:pointer;
          transition: all 160ms ease;
          margin-bottom: 2px;
        }
        .tree-row:hover { 
          background: linear-gradient(90deg, rgba(74,222,128,0.06), rgba(74,222,128,0.02)); 
          transform: translateX(4px); 
        }
        .tree-row.selected { 
          background: linear-gradient(90deg, rgba(15,23,42,0.03), rgba(15,23,42,0.01)); 
          box-shadow: inset 0 0 0 1px rgba(16,163,98,0.1); 
        }

        .chev, .chev-placeholder {
          background:transparent;
          border:none;
          width:26px;
          height:26px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          font-size:14px;
          padding: 0;
        }
        .chev-rot { 
          display:inline-block; 
          transition: transform 220ms cubic-bezier(.2,.8,.2,1); 
        }
        .chev-rot.open { transform: rotate(90deg); }

        .node-icon { 
          width:22px; 
          display:inline-flex; 
          align-items:center; 
          justify-content:center; 
          color:var(--accent); 
        }
        .node-text { 
          white-space:nowrap; 
          overflow:hidden; 
          text-overflow:ellipsis; 
          font-weight:600; 
          color:#0f172a;
          flex: 1;
        }

        /* message - SAME as Item Creation */
        .message {
          margin-top:8px;
          padding:12px;
          border-radius:10px;
          font-weight:600;
          font-size: 14px;
        }
        .message.error { 
          background: #fff1f2; 
          color: #9f1239; 
          border: 1px solid #ffd7da; 
        }
        .message.success { 
          background: #f0fdf4; 
          color: #064e3b; 
          border: 1px solid #bbf7d0; 
        }

        .submit-row { 
          display: flex; 
          gap: 12px; 
          margin-top: 16px; 
          align-items: center; 
          justify-content: flex-end;
          width: 100%;
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
          font-family: inherit;
          transition: all 0.2s;
        }
        .submit-primary:hover:not(:disabled) {
          background: linear-gradient(180deg, var(--accent-2), var(--accent-3));
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(48, 122, 200, 0.3);
        }
        .submit-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
        .submit-clear {
          padding:10px 12px;
          background:#fff;
          border:1px solid rgba(12,18,35,0.1);
          border-radius:10px;
          cursor:pointer;
          font-family: inherit;
          transition: all 0.2s;
          font-weight: 600;
        }
        .submit-clear:hover:not(:disabled) {
          background: #f8fafc;
          border-color: rgba(12,18,35,0.2);
        }
        .submit-clear:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          font-size: 14px;
          transition: all 0.2s;
          font-family: inherit;
        }
        .panel .search-with-clear,
        .modal .search-with-clear {
          max-width: 420px;
          width: 100%;
        }

        .search-with-clear:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
          transition: all 0.2s;
        }

        .clear-search-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        /* dropdown modal (glass) - SAME as Item Creation */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }
        
        .modal {
          background: white;
          border-radius: 12px;
          padding: 20px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
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
          transition: all 0.2s;
        }
        .dropdown-item:hover { 
          background: linear-gradient(90deg, rgba(16,163,98,0.04), rgba(16,163,98,0.01)); 
          transform: translateX(6px); 
        }
        .dropdown-item, .node-text { text-align: left; }

        /* Responsive styles - SAME as Item Creation */
        /* Large tablets and small laptops */
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

        /* Tablets */
        @media (max-width: 768px) {
          .lg-root {
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
        }

        /* Mobile phones */
        @media (max-width: 480px) {
          .lg-root {
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
          .input, .search, .select {
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
          .tree-row {
            padding: 8px;
          }
          .chev, .chev-placeholder {
            width: 22px;
            height: 22px;
          }
          .modal-overlay {
            padding: 12px;
          }
          .modal {
            padding: 12px;
          }
        }

        /* Very small screens */
        @media (max-width: 360px) {
          .lg-root {
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
      `}</style>

      <div className="dashboard" aria-labelledby="item-group-title">
        <div className="top-row">
          <div className="title-block">
            <svg width="38" height="38" viewBox="0 0 24 24" aria-hidden focusable="false">
              <rect width="24" height="24" rx="6" fill="#eff6ff" />
              <path d="M6 12h12M6 8h12M6 16h12" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h2 id="item-group-title">Item Group Creation</h2>
              <div className="subtitle muted">Create, edit, or delete item groups</div>
            </div>
          </div>

          <div className="actions" role="toolbar" aria-label="actions">
            <AddButton
              onClick={() => { setActionType("Add"); resetForm(); }}
              disabled={submitting || !formPermissions.add}
              isActive={actionType === 'Add'}
            />

            <EditButton
              onClick={(e) => {
                e.currentTarget.blur();
                setActionType("edit");
                resetForm();
                setIsPopupOpen(true);
              }}
              disabled={submitting || !formPermissions.edit}
              isActive={actionType === 'edit'}
            />

            <DeleteButton
              onClick={(e) => {
                e.currentTarget.blur();
                setActionType("delete");
                resetForm();
                setIsPopupOpen(true);
              }}
              disabled={submitting || !formPermissions.delete}
              isActive={actionType === 'delete'}
            />
          </div>
        </div>

        <div className="grid" role="main">
          <div className="card" aria-live="polite">
            {/* Main Group field with SAME design as Item Creation */}
            <div className="field">
              <label className="field-label">Main Group</label>
              <div className="row" style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  display: "flex", 
                  flex: 1, 
                  border: "1px solid rgba(15,23,42,0.06)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundColor: "linear-gradient(180deg, #fff, #fbfdff)"
                }}>
                  <input
                    ref={mainGroupRef}
                    className="input"
                    value={mainGroup}
                    onChange={(e) => setMainGroup(e.target.value)}
                    onFocus={() => {}} // REMOVED: setIsTreeOpen(true) - Tree doesn't open on focus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setIsTreeOpen(true); // Tree opens ONLY on Enter
                        // Focus first visible node
                        setTimeout(() => {
                          const firstNode = document.querySelector(".tree-row");
                          firstNode?.focus();
                        }, 50);
                      } else {
                        handleMainGroupKeyDown(e);
                      }
                    }}
                    readOnly={true}
                    disabled={submitting}
                    aria-label="Main Group"
                    style={{ 
                      flex: 1,
                      border: "none",
                      borderRadius: "0",
                      padding: "10px 12px",
                      minWidth: "0"
                    }}
                    
                  />
                  <button
                    onClick={() => setIsTreeOpen(!isTreeOpen)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "0 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent)"
                    }}
                    aria-label={isTreeOpen ? "Close tree" : "Open tree"}
                  >
                    <Icon.Chevron down={!isTreeOpen} />
                  </button>
                </div>
              </div>

              {isTreeOpen && (
                isMobile ? (
                  <div className="modal-overlay" onClick={() => setIsTreeOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Groups tree modal">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <h3 style={{ margin: 0, fontSize: 18 }}>Groups</h3>
                        <button
                          onClick={() => setIsTreeOpen(false)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
                          aria-label="Close"
                        >
                          <Icon.Close />
                        </button>
                      </div>

                      <div className="row" style={{ marginBottom: 8 }}>
                        <div className="search-container">
                          <input
                            className="search-with-clear"
                            placeholder="Search groups..."
                            value={searchTree}
                            onChange={(e) => setSearchTree(e.target.value)}
                            aria-label="Search groups"
                          />
                          {searchTree && (
                            <button
                              className="clear-search-btn"
                              onClick={() => setSearchTree("")}
                              type="button"
                              aria-label="Clear search"
                            >
                              <Icon.Close size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        className="tree-scroll"
                        role="tree"
                        aria-label="Group list"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setIsTreeOpen(false);
                            mainGroupRef.current?.focus(); // Return focus to input
                          }
                        }}
                      >
                        {loading ? (
                          <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>Loading...</div>
                        ) : filteredTree.length === 0 ? (
                          <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>No groups found</div>
                        ) : (
                          filteredTree.map((node) => (
                            <TreeNode
                              key={node.key}
                              node={node}
                              onSelect={(n) => { 
                                handleSelectNode(n); 
                                setIsTreeOpen(false); // Tree closes automatically
                              }}
                              expandedKeys={expandedKeys}
                              toggleExpand={toggleExpand}
                              selectedKey={selectedNode?.key}
                              onNavigate={handleTreeNavigation}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div id="group-tree" className="panel" role="region" aria-label="Groups tree">
                    {/* Header with close button for desktop */}
                    {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div className="search-container">
                        <input
                          className="search-with-clear"
                          placeholder="Search groups..."
                          value={searchTree}
                          onChange={(e) => setSearchTree(e.target.value)}
                          aria-label="Search groups"
                        />
                        {searchTree && (
                          <button
                            className="clear-search-btn"
                            onClick={() => setSearchTree("")}
                            type="button"
                            aria-label="Clear search"
                          >
                            <Icon.Close size={16} />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setIsTreeOpen(false)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, marginLeft: 8 }}
                        aria-label="Close tree"
                      >
                        <Icon.Close size={18} />
                      </button>
                    </div> */}

                    <div
                      className="tree-scroll"
                      role="tree"
                      aria-label="Group list"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setIsTreeOpen(false);
                          mainGroupRef.current?.focus(); // Return focus to input
                        }
                      }}
                    >
                      {loading ? (
                        <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>Loading...</div>
                      ) : filteredTree.length === 0 ? (
                        <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>No groups found</div>
                      ) : (
                        filteredTree.map((node) => (
                          <TreeNode
                            key={node.key}
                            node={node}
                            onSelect={handleSelectNode} // Tree closes automatically in handleSelectNode
                            expandedKeys={expandedKeys}
                            toggleExpand={toggleExpand}
                            selectedKey={selectedNode?.key}
                            onNavigate={handleTreeNavigation}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Sub Group field */}
            <div className="field">
              <label className="field-label">Sub Group</label>
              <div className="row">
                {actionType === "Add" ? (
                  <input
                    ref={subGroupRef}
                    className="input"
                    value={subGroup}
                    onChange={(e) => setSubGroup(e.target.value)}
                    onKeyDown={handleSubGroupKeyDown}
                    placeholder="Enter Sub Group"
                    disabled={submitting}
                    aria-label="Sub Group"
                  />
                ) : (
                  <input
                    ref={subGroupRef}
                    className="input"
                    value={subGroup}
                    onChange={(e) => setSubGroup(e.target.value)}
                    onKeyDown={handleSubGroupKeyDown}
                    placeholder="Select Sub Group"
                    disabled={submitting}
                    readOnly={actionType === "delete"}
                    aria-label="Sub Group"
                  />
                )}
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
                ref={submitButtonRef}
                className="submit-primary"
                onClick={handleSubmit}
                disabled={submitting}
                type="button"
              >
                {/* {submitting ? "Processing..." : actionType.charAt(0).toUpperCase() + actionType.slice(1)} */}
                {submitting ? "Processing..." : actionType === "Add" ? "Save" : actionType === "edit" ? "Update" : "Delete"}
              </button>
              <button
                className="submit-clear"
                onClick={resetForm1}
                disabled={submitting}
                type="button"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Popup for Add */}
      <ConfirmationPopup
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={confirmSave}
        title="Create Item Group"
        message="Do you want to save?"
        type="success"
        confirmText={submitting ? "Creating..." : "Yes"}
        cancelText="No"
        showLoading={submitting}
        disableBackdropClose={submitting}
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

      {/* Confirmation Popup for Edit */}
      <ConfirmationPopup
        isOpen={confirmEditOpen}
        onClose={() => setConfirmEditOpen(false)}
        onConfirm={confirmEdit}
        title="Update Item Group"
        message="Do you want to modify?"
        type="warning"
        confirmText={submitting ? "Updating..." : "Yes"}
        cancelText="No"
        showLoading={submitting}
        disableBackdropClose={submitting}
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

      {/* Confirmation Popup for Delete */}
      <ConfirmationPopup
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Item Group"
        message="Do you want to delete?"
        type="danger"
        confirmText={submitting ? "Deleting..." : "Yes"}
        cancelText="No"
        showLoading={submitting}
        disableBackdropClose={submitting}
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

      {/* Dropdown modal */}
      {isDropdownOpen && (
        <div className="modal-overlay" onClick={() => setIsDropdownOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Select Sub Group</h3>
              <button
                onClick={() => setIsDropdownOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
                aria-label="Close"
              >
                <Icon.Close />
              </button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div className="search-container">
                <input
                  className="search-with-clear"
                  placeholder="Search sub groups..."
                  value={searchDropdown}
                  onChange={(e) => setSearchDropdown(e.target.value)}
                  aria-label="Search sub groups"
                />
                {searchDropdown && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchDropdown("")}
                    type="button"
                    aria-label="Clear search"
                  >
                    <Icon.Close size={16} />
                  </button>
                )}
              </div>
            </div>

            <div id="subgroup-dropdown" className="dropdown-list" role="listbox" aria-label="Sub group options">
              {filteredDropdown.length === 0 ? (
                <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>No options found</div>
              ) : (
                filteredDropdown.map((option, idx) => (
                  <div
                    key={idx}
                    className="dropdown-item"
                    onClick={() => handleSelectSub(option)}
                    role="option"
                    aria-selected={option.value === subGroup}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSelectSub(option)}
                  >
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{option.label}</div>
                    {option.parentName && (
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Parent: {option.parentName}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Popup selector for Edit/Delete action */}
      <PopupListSelector
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSelect={(item) => {
          setMainGroup(item.fParent || '');
          setSubGroup(item.fName || '');
          setFCode(item.fCode || '');
          setIsPopupOpen(false);
          setIsTreeOpen(false); // Keep tree closed
        }}
        fetchItems={fetchPopupItems}
        title={`Select Item Group to ${actionType === 'edit' ? 'Edit' : 'Delete'}`}
        displayFieldKeys={['fName', 'fParent']}
        searchFields={['fName', 'fParent']}
        headerNames={['Group Name', 'Parent']}
        columnWidths={{ fName: '70%', fParent: '30%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />
    </div>
  );
}