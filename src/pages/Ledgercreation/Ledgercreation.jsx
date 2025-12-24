import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import PopupListSelector from "../../components/Listpopup/PopupListSelector";
import ConfirmationPopup from "../../components/ConfirmationPopup/ConfirmationPopup";
import { AddButton, EditButton, DeleteButton } from "../../components/Buttons/ActionButtons";
import { usePermissions } from "../../hooks/usePermissions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FCompCode = "001";

// --- Inline SVG icons ---
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
      <path fill="currentColor" d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.29 19.71 2.88 18.29 9.18 12 2.88 5.71 4.29 4.29 10.59 10.59 16.88 4.29z" />
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

// --- Tree node component ---
function TreeNode({ node, level = 0, onSelect, expandedKeys, toggleExpand, selectedKey, onNavigate }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedKeys.has(node.key);
  const isSelected = selectedKey === node.key;

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (hasChildren) {
          // Folder node: expand/open it
          if (!isExpanded) {
            toggleExpand(node.key);
          } else {
            // If already expanded, select it
            onSelect(node);
          }
        } else {
          // Leaf node: select the item and close tree
          onSelect(node);
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (hasChildren && !isExpanded) {
          toggleExpand(node.key);
        } else if (hasChildren && isExpanded) {
          // If already expanded, focus on first child
          onNavigate?.("down", node.key);
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
        data-key={node.key}
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

export default function LedgerCreation({ onCreated }) {
  // State management
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [mainGroup, setMainGroup] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [actionType, setActionType] = useState('create');
  const [searchTree, setSearchTree] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [isActive, setIsActive] = useState(true);
  const [dataList, setDataList] = useState([]);
  const [message, setMessage] = useState(null);
  const [lastNetworkError, setLastNetworkError] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isStatePopupOpen, setIsStatePopupOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    shortName: '',
    counter: '',
    partyName: '',
    dueDay: '',
    dueDate: '',
    fStreet: '',
    hallmark: '',
    area: '',
    gstin: '',
    city: '',
    pincode: '',
    phone: '',
    cellNo: '',
    email: '',
    gstType: '',
    route: '',
    cinNo: '',
    panNo: '',
    state: '',
    Hide: '1',
    fCode: '',
  });

  // Refs for form inputs
  const partyNameRef = useRef(null);
  const groupNameRef = useRef(null);
  const dueDayRef = useRef(null);
  const fStreetRef = useRef(null);
  const areaRef = useRef(null);
  const cityRef = useRef(null);
  const pincodeRef = useRef(null);
  const phoneRef = useRef(null);
  const cellNoRef = useRef(null);
  const hallmarkRef = useRef(null);
  const gstinRef = useRef(null);
  const shortNameRef = useRef(null);
  const emailRef = useRef(null);
  const gstTypeRef = useRef(null);
  const routeRef = useRef(null);
  const cinNoRef = useRef(null);
  const panNoRef = useRef(null);
  const stateRef = useRef(null);
  const activeSwitchRef = useRef(null);
  const submitButtonRef = useRef(null);
  const clearButtonRef = useRef(null);

  // Get permissions for this form using the usePermissions hook
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  // Get permissions for LEDGER_CREATION form
  const formPermissions = useMemo(() => ({
    add: hasAddPermission('LEDGER_CREATION'),
    edit: hasModifyPermission('LEDGER_CREATION'),
    delete: hasDeletePermission('LEDGER_CREATION')
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // Confirmation Popup States (ADDED to match Unit Creation)
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-focus Ledger Name on component mount
  useEffect(() => {
    if (partyNameRef.current) {
      partyNameRef.current.focus();
    }
  }, []);

  // Global Enter key handler - Only Enter triggers buttons and popups
  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.key === 'Enter') {
        const focusedElement = document.activeElement;
        
        // Click buttons (Add, Edit, Delete, Submit, Clear)
        if (focusedElement && (
          focusedElement.tagName === 'BUTTON' || 
          focusedElement.classList?.contains('submit-primary') || 
          focusedElement.classList?.contains('submit-clear') ||
          focusedElement.classList?.contains('action-pill')
        )) {
          e.preventDefault();
          focusedElement.click();
        }
        // Open group tree selector on Group Name field
        else if (focusedElement === groupNameRef.current) {
          e.preventDefault();
          setIsTreeOpen(true);
          setTimeout(() => {
            const firstNode = document.querySelector('[data-key]');
            firstNode?.focus();
          }, 0);
        }
        // Open state popup on State field
        else if (focusedElement === stateRef.current) {
          e.preventDefault();
          setIsStatePopupOpen(true);
        }
      }
      
    };

    window.addEventListener('keydown', handleEnterKey);
    return () => window.removeEventListener('keydown', handleEnterKey);
  }, []);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    setLastNetworkError(null);
    try {
      await fetchTreeData();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load data. Check console." });
    } finally {
      setLoading(false);
    }
  };

  const fetchTreeData = async () => {
    try {
      const path = API_ENDPOINTS.LEDGER_CREATION_ENDPOINTS.getTree;
      const fullUrl = (axiosInstance.defaults && axiosInstance.defaults.baseURL ? axiosInstance.defaults.baseURL : '') + path;
      console.log('Fetching tree from', fullUrl);
      setLastNetworkError(null);
      const response = await axiosInstance.get(path);
      if (!response.data) throw new Error('Invalid tree data format');
      
      const transformedData = transformApiData(response.data);
      setTreeData(transformedData);
      setExpandedKeys(new Set(transformedData.map(item => item.key)));
    } catch (error) {
      console.error('Tree data fetch error:', error);
      // Store network error details for debugging in UI
      const errInfo = {
        message: error.message,
        code: error.code || (error?.response?.status ? String(error.response.status) : null),
        url: (axiosInstance.defaults && axiosInstance.defaults.baseURL ? axiosInstance.defaults.baseURL : '') + API_ENDPOINTS.LEDGER_CREATION_ENDPOINTS.getTree,
        details: error.toString(),
      };
      setLastNetworkError(errInfo);
      setMessage({ type: "error", text: 'Failed to fetch tree data. See details below.' });
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setLastNetworkError(null);
    try {
      const path = API_ENDPOINTS.LEDGER_GROUP_CREATION_ENDPOINTS.getTree;
      const base = axiosInstance.defaults && axiosInstance.defaults.baseURL ? axiosInstance.defaults.baseURL : '';
      const fullUrl = base + path;
      console.log('Testing connection to', fullUrl);
      const resp = await axiosInstance.get(path);
      console.log('Connection test response', resp && resp.status);
      setMessage({ type: 'success', text: `Connection OK (status ${resp.status})` });
      setLastNetworkError(null);
    } catch (err) {
      console.error('Connection test error', err);
      const errInfo = {
        message: err.message,
        code: err.code || (err?.response?.status ? String(err.response.status) : null),
        url: (axiosInstance.defaults && axiosInstance.defaults.baseURL ? axiosInstance.defaults.baseURL : '') + API_ENDPOINTS.LEDGER_GROUP_CREATION_ENDPOINTS.getTree,
        details: err.toString(),
      };
      setLastNetworkError(errInfo);
      setMessage({ type: 'error', text: 'Connection test failed. See details below.' });
    } finally {
      setLoading(false);
    }
  };

  const transformApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    let nodeCounter = 0;
    
    const buildTree = (items, level = 0, parentPath = '') => {
      return items.map((item, index) => {
        nodeCounter++;
        const uniqueKey = `${parentPath}-${item.fcode || 'no-code'}-${nodeCounter}-${level}-${index}`;
        
        return {
          key: uniqueKey,
          displayName: item.fAcname || 'Unnamed Group',
          level,
          id: item.fcode,
          children: item.children ? buildTree(item.children, level + 1, uniqueKey) : [],
        };
      });
    };
    
    return buildTree(apiData);
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
    setIsTreeOpen(false);
    // Focus on next field after selecting node
    if (gstTypeRef.current) {
      gstTypeRef.current.focus();
    }
  };

  const handleChange = (name, value) => {
    if (name === 'dueDay') {
      const dueDays = parseInt(value, 10);

      if (!isNaN(dueDays)) {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + dueDays);
        const formattedDate = `${String(futureDate.getDate()).padStart(2, '0')}/${String(futureDate.getMonth() + 1).padStart(2, '0')}/${futureDate.getFullYear()}`;

        setFormData(prev => ({
          ...prev,
          dueDay: value,
          dueDate: formattedDate,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          dueDay: value,
          dueDate: '',
        }));
      }
    } else if (name === 'gstType' && value) {
      // Convert to uppercase for GST Type
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleActive = () => {
    const newValue = !isActive;
    setIsActive(newValue);
    handleChange('Hide', newValue ? '1' : '0');
  };

  // Field navigation array for keyboard navigation
  const fieldNavigation = [
    { ref: partyNameRef, name: 'partyName', label: 'Ledger Name' },
    { ref: groupNameRef, name: 'mainGroup', label: 'Group Name' },
    { ref: gstTypeRef, name: 'gstType', label: 'GST Type' },
    { ref: fStreetRef, name: 'fStreet', label: 'Street' },
    { ref: areaRef, name: 'area', label: 'Area' },
    { ref: cityRef, name: 'city', label: 'City' },
    { ref: pincodeRef, name: 'pincode', label: 'Pincode' },
    { ref: phoneRef, name: 'phone', label: 'Phone' },
    { ref: cellNoRef, name: 'cellNo', label: 'Cell No' },
    { ref: routeRef, name: 'route', label: 'Route' },
    { ref: gstinRef, name: 'gstin', label: 'GSTIN' },
    { ref: cinNoRef, name: 'cinNo', label: 'CIN No' },
    { ref: panNoRef, name: 'panNo', label: 'PAN No' },
    { ref: stateRef, name: 'state', label: 'State' },
    { ref: emailRef, name: 'email', label: 'Email' },
    { ref: shortNameRef, name: 'shortName', label: 'Short Name' },
    { ref: activeSwitchRef, name: 'active', label: 'Active Status' },
    { ref: submitButtonRef, name: 'submit', label: 'Submit Button' },
    { ref: clearButtonRef, name: 'clear', label: 'Clear Button' },
  ];

  // Handle keyboard navigation
  const handleKeyboardNavigation = useCallback((e, currentFieldIndex) => {
    const isArrowDown = e.key === 'ArrowDown';
    const isArrowUp = e.key === 'ArrowUp';
    const isEnter = e.key === 'Enter';
    const isArrowRight = e.key === 'ArrowRight';
    const isArrowLeft = e.key === 'ArrowLeft';

    if (isEnter) {
      e.preventDefault();
      // Move to next field
      const nextFieldIndex = (currentFieldIndex + 1) % fieldNavigation.length;
      if (fieldNavigation[nextFieldIndex]?.ref?.current) {
        fieldNavigation[nextFieldIndex].ref.current.focus();
      }
    } else if (isArrowDown || isArrowRight) {
      e.preventDefault();
      const nextFieldIndex = (currentFieldIndex + 1) % fieldNavigation.length;
      if (fieldNavigation[nextFieldIndex]?.ref?.current) {
        fieldNavigation[nextFieldIndex].ref.current.focus();
      }
    } else if (isArrowUp || isArrowLeft) {
      e.preventDefault();
      const prevFieldIndex = (currentFieldIndex - 1 + fieldNavigation.length) % fieldNavigation.length;
      if (fieldNavigation[prevFieldIndex]?.ref?.current) {
        fieldNavigation[prevFieldIndex].ref.current.focus();
      }
    }
  }, [fieldNavigation]);

  // Handle keyboard typing in State field popup
  const handleStateFieldKeyPress = (e) => {
    // Allow navigation keys to pass through
    if (['Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(e.key)) {
      if (e.key === 'Escape') {
        setIsStatePopupOpen(false);
        setStateSearch('');
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Prevent default behavior and let popup handle navigation
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === 'Enter') {
        handleKeyboardNavigation(e, 13);
      }
      return;
    }

    // For any regular character, open popup and capture in search
    if (!isStatePopupOpen && e.key.length === 1) {
      e.preventDefault();
      setStateSearch(e.key);
      setIsStatePopupOpen(true);
    }
  };

  const validateForm = () => {
    if (!formData.partyName) {
      setMessage({ type: "error", text: 'Ledger Name is required.' });
      partyNameRef.current?.focus();
      return false;
    }
    if (!mainGroup) {
      setMessage({ type: "error", text: 'Group Name is required.' });
      return false;
    }
    if (!formData.fStreet) {
      setMessage({ type: "error", text: 'Street is required.' });
      fStreetRef.current?.focus();
      return false;
    }
    if (!formData.area) {
      setMessage({ type: "error", text: 'Area is required.' });
      areaRef.current?.focus();
      return false;
    }
    if (!formData.city) {
      setMessage({ type: "error", text: 'City is required.' });
      cityRef.current?.focus();
      return false;
    }
    if (!formData.pincode) {
      setMessage({ type: "error", text: 'Pincode is required.' });
      pincodeRef.current?.focus();
      return false;
    }
    if (!formData.phone) {
      setMessage({ type: "error", text: 'Phone No is required.' });
      phoneRef.current?.focus();
      return false;
    }

    if (formData.dueDay && isNaN(formData.dueDay)) {
      setMessage({ type: "error", text: 'Due Days must be a number.' });
      dueDayRef.current?.focus();
      return false;
    }

    if (formData.pincode && (isNaN(formData.pincode) || formData.pincode.length !== 6)) {
      setMessage({ type: "error", text: 'Pincode must be a 6-digit number.' });
      pincodeRef.current?.focus();
      return false;
    }

    if (formData.phone && (isNaN(formData.phone) || formData.phone.length !== 10)) {
      setMessage({ type: "error", text: 'Phone must be a 10-digit number.' });
      phoneRef.current?.focus();
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: "error", text: 'Invalid Email format.' });
      emailRef.current?.focus();
      return false;
    }

    return true;
  };

  // Show confirmation popup for Create (ADDED to match Unit Creation)
  const showCreateConfirmation = () => {
    setConfirmSaveOpen(true);
  };

  // Handle Create confirmation (ADDED to match Unit Creation)
  const confirmCreate = async () => {
    setConfirmSaveOpen(false);
    
    if (!validateForm()) {
      return;
    }
    
    if (!formPermissions.add) {
      toast.error("You don't have permission to create ledgers.");
      return;
    }

    await handleSubmit();
  };

  // Show confirmation popup for Edit (ADDED to match Unit Creation)
  const showEditConfirmation = () => {
    setConfirmEditOpen(true);
  };

  // Handle Edit confirmation (ADDED to match Unit Creation)
  const confirmEdit = async () => {
    setConfirmEditOpen(false);
    
    if (!validateForm()) {
      return;
    }
    
    if (!formPermissions.edit) {
      toast.error("You don't have permission to edit ledgers.");
      return;
    }

    await handleSubmit();
  };

  // Show confirmation popup for Delete (ADDED to match Unit Creation)
  const showDeleteConfirmation = () => {
    setConfirmDeleteOpen(true);
  };

  // Handle Delete confirmation (ADDED to match Unit Creation)
  const confirmDelete = async () => {
    setConfirmDeleteOpen(false);
    
    if (!validateForm()) {
      return;
    }
    
    if (!formPermissions.delete) {
      toast.error("You don't have permission to delete ledgers.");
      return;
    }

    await handleSubmit();
  };

  const showConfirmation = (message, onConfirm) => {
    if (window.confirm(message)) {
      onConfirm();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      if (actionType === 'create') {
        try {
          const response = await axiosInstance.get(API_ENDPOINTS.LEDGER_CREATION_ENDPOINTS.getDropdownPaged(1, 20, ''));
          const existingLedgers = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          const isDuplicate = existingLedgers.some(ledger => 
            ledger.fAcname.toLowerCase() === formData.partyName.toLowerCase()
          );
          if (isDuplicate) {
            toast.error('A ledger with this name already exists. Please choose a different name.');
            setIsSubmitting(false);
            return;
          }
        } catch (error) {
          console.error('Error checking for duplicates:', error);
          toast.error('Failed to verify ledger uniqueness. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const requestData = {
        fcode: formData.fCode || '',
        CustomerName: formData.partyName || '',
        GroupName: mainGroup || '',
        gstType: formData.gstType || '',
        Route: formData.route || '',
        street: formData.fStreet || '',
        area: formData.area || '',
        city: formData.city || '',
        pincode: formData.pincode ? Number(formData.pincode) : null,
        phoneNumber: formData.phone || '',
        fcellNO: formData.cellNo || '',
        GstNo: formData.gstin || '',
        CinNo: formData.cinNo || '',
        PanNO: formData.panNo || '',
        State: formData.state || '',
        ShortName: formData.shortName || '',
        Email: formData.email || '',
        Hide: formData.Hide || '',  
        fCompCode: FCompCode || '',
      };

      console.log('Submitted Request Data:', requestData);

      let response;
      switch (actionType) {
        case 'create':
          response = await axiosInstance.post(API_ENDPOINTS.LEDGER_CREATION_ENDPOINTS.postCreate, requestData);
                    console.log('Create response:', response.data);

          toast.success('Ledger created successfully!');
          if (onCreated) {
            onCreated({
              name: requestData.CustomerName,
              code: requestData.fcode,
            });
          }
          break;
        case 'edit':
          response = await axiosInstance.put(API_ENDPOINTS.LEDGER_CREATION_ENDPOINTS.putEdit, requestData);
          toast.success('Ledger updated successfully!');
          break;
        case 'delete':
          if (!formData.fCode) {
            toast.error('fCode is required for deletion');
            return;
          }
          response = await axiosInstance.delete(API_ENDPOINTS.LEDGER_CREATION_ENDPOINTS.delete(formData.fCode));
          toast.success('Ledger deleted successfully!');
          break;
        default:
          toast.error('Invalid action type');
          return;
      }

      if (response.status === 200 || response.status === 201) {
        handleClear();
        await fetchTreeData();
      } else {
        toast.error('Failed to process request');
      }
    } catch (error) {
      console.error('Submit error:', error);
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'An unexpected server error occurred.';

        if (status === 409) {
          toast.error('Concurrent modification detected. Please refresh and try again.');
        } else {
          toast.error(`Error ${status}: ${message}`);
        }
      } else if (error.request) {
        toast.error('No response received from the server. Please check your network connection.');
      } else {
        toast.error(`Error: ${error.message}. Please check your connection and try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch function used by PopupListSelector (paged + searchable)
  const fetchPopupItems = useCallback(async (page = 1, search = '') => {
    try {
      const resp = await axiosInstance.get(
        API_ENDPOINTS.LEDGER_CREATION_ENDPOINTS.getDropdownPaged(page, 20, search)
      );
      const items = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);

      // Ensure we return an array of plain objects with expected fields
      return items.map((it) => ({
        ...it,
        // Normalize casing for consumers - ensure consistent field names
        fCode: it.fCode ?? it.fcode,
        fAcname: it.fAcname ?? it.fAcName,
        fParent: it.fParent ?? it.parentName ?? '',
        fStreet: it.fStreet ?? it.street ?? '',
        fArea: it.fArea ?? it.area ?? '',
        fCity: it.fCity ?? it.city ?? '',
        fPincode: it.fPincode ?? it.pincode ?? '',
        fPhone: it.fPhone ?? it.fphone ?? it.phoneNumber ?? '',
        fMail: it.fMail ?? it.fEmail ?? it.Email ?? '',
        gstType: it.gstType ?? it.GstType ?? '',
        fRoute: it.fRoute ?? it.Route ?? '',
        fDueDays: it.fDueDays ?? it.fDueDay ?? '',
        fDueDt: it.fDueDt ?? it.fDueDate ?? '',
        fCstno: it.fCstno ?? it.fGst ?? it.GstNo ?? '',
        fCINNo: it.fCINNo ?? it.cinNo ?? it.CinNo ?? '',
        fPANNO: it.fPANNO ?? it.panNo ?? it.PanNo ?? '',
        fcell: it.fcell ?? it.cellNo ?? it.CellNo ?? '',
        fshow: it.fshow ?? '1',
        shortName: it.shortName ?? it.fShort ?? it.ShortName ?? it.fFax ?? '',
      }));
    } catch (err) {
      console.error('fetchPopupItems error', err);
      return [];
    }
  }, []);

  // Fetch function for States with search
  const fetchStatesWithSearch = useCallback(async (page = 1, search = '') => {
    try {
      const resp = await axiosInstance.get(
        API_ENDPOINTS.STATECREATION.GET_STATE_ITEMS(page, 20)
      );
      let items = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
      
      // Filter by search text if provided
      if (search) {
        items = items.filter(item => 
          (item.fname?.toLowerCase() || '').includes(search.toLowerCase()) ||
          (item.fcode?.toLowerCase() || '').includes(search.toLowerCase())
        );
      }

      return items.map((it) => ({
        ...it,
        fcode: it.fcode ?? it.fCode,
        fname: it.fname ?? it.fName,
      }));
    } catch (err) {
      console.error('fetchStatesWithSearch error', err);
      return [];
    }
  }, []);

  const resetForm = (keepAction = false) => {
    setMainGroup('');
    setSelectedNode(null);
    setFormData({
      shortName: '',
      counter: '',
      partyName: '',
      dueDay: '',
      dueDate: '',
      fStreet: '',
      hallmark: '',
      area: '',
      gstin: '',
      city: '',
      pincode: '',
      phone: '',
      cellNo: '',
      email: '',
      gstType: '',
      route: '',
      cinNo: '',
      panNo: '',
      state: '',
      Hide: '1',
      fCode: '',
    });
    setIsActive(true);
    setMessage(null);
    setSearchTree('');
    if (!keepAction) setActionType('create');
  };

  const changeActionType = (type) => {
    setActionType(type);
    if (type === 'create') {
      resetForm(true);
    }
    setIsTreeOpen(true);
  };

  const handleClear = () => {
    resetForm(false);
    if (partyNameRef.current) {
      partyNameRef.current.focus();
    }
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

  // Handle keyboard navigation for tree nodes
  const handleTreeNavigation = useCallback((direction, currentKey) => {
    const getAllNodes = (nodes) => {
      const result = [];
      nodes.forEach(node => {
        result.push(node);
        if (expandedKeys.has(node.key) && node.children) {
          result.push(...getAllNodes(node.children));
        }
      });
      return result;
    };

    const allNodes = getAllNodes(filteredTree);
    const currentIndex = allNodes.findIndex(n => n.key === currentKey);
    
    if (currentIndex === -1) return;

    let nextIndex = direction === "down" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= allNodes.length) nextIndex = allNodes.length - 1;

    const nextNode = allNodes[nextIndex];
    if (nextNode) {
      setSelectedNode(nextNode);
      // Don't close tree on navigation, just update selection
      setTimeout(() => {
        const elem = document.querySelector(`[data-key="${nextNode.key}"]`);
        elem?.focus();
      }, 0);
    }
  }, [filteredTree, expandedKeys]);

  return (
    <div className="lg-root" role="region" aria-labelledby="ledger-title">
      {/* Google/Local font — will fallback to system fonts if blocked */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@500;700&display=swap" rel="stylesheet" />

      <style>{`
        /* Toast notification styles - ADDED */
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
          /* blue theme (user-provided) */
          --bg-1: #f0f7fb;
          --bg-2: #f7fbff;
          --glass: rgba(255,255,255,0.55);
          --glass-2: rgba(255,255,255,0.35);
          --accent: #307AC8; /* primary */
          --accent-2: #1B91DA; /* secondary */
          --accent-3: #06A7EA; /* tertiary */
          --success: #06A7EA;
          --danger: #ef4444;
          --muted: #64748b;
          --card-shadow: 0 8px 30px rgba(16,24,40,0.08);
          --glass-border: rgba(255,255,255,0.45);
        }

        /* Page layout */
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

        /* Main dashboard card (glass) */
        .dashboard {
          width: 100%;
          max-width: 700px;
          border-radius: 16px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(255,255,255,0.75), rgba(245,248,255,0.65));
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(8px) saturate(120%);
          border: 1px solid rgba(255,255,255,0.6);
          overflow: visible;
          transition: transform 260ms cubic-bezier(.2,.8,.2,1);
          margin-bottom: 160px;
        }
        .dashboard:hover { transform: translateY(-2px); }

        /* header */
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

        /* grid layout */
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
          display: flex;
          flex-direction: column;
          align-items: flex-start;
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
          min-width: 250px;
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

        .select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23307AC8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          padding-right: 32px;
          cursor: pointer;
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

        .controls { display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; }

        /* tree panel */
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

        /* right card (preview / summary) */
        .side {
          display:flex;
          flex-direction:column;
          gap:12px;
        }
        .stat {
          background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(250,251,255,0.7));
          border-radius: 12px;
          padding:12px;
          border: 1px solid rgba(12,18,35,0.06);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .muted { 
          color: var(--muted); 
          font-size:13px; 
          margin-bottom: 4px;
        }
        .stat-value {
          font-weight: 700;
          font-size: 16px;
          color: #0f172a;
          min-height: 24px;
        }

        /* message */
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

        /* submit row */
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
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
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
        }
        /* constrain search input width inside panels/modals to match design */
        .panel .search-with-clear, .modal .search-with-clear { max-width: 420px; }

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
        }

        .clear-search-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        /* Styles for input fields with built-in search icon */
        .input-with-search {
          position: relative;
          width: 100%;
        }
        
        .input-with-search .input {
          width: 100%;
          padding-right: 40px;
          cursor: pointer;
          background: white;
        }
        
        .input-search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--accent);
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .input-with-search .input:focus + .input-search-icon {
          color: var(--accent-2);
        }

        /* dropdown modal (glass) */
        // .modal-overlay {
          
        // }
        // .modal {
        //   width:100%; 
        //   max-width:720px; 
        //   max-height:80vh; 
        //   overflow:auto; 
        //   background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(245,248,255,0.8));
        //   border-radius:12px; 
        //   padding:14px;
        //   border:1px solid rgba(255,255,255,0.5);
        //   box-shadow: 0 18px 50px rgba(2,6,23,0.36);
        //   backdrop-filter: blur(8px);
        // }
        // .dropdown-list { max-height:50vh; overflow:auto; border-top:1px solid rgba(12,18,35,0.03); border-bottom:1px solid rgba(12,18,35,0.03); padding:6px 0; }
        // .dropdown-item { padding:12px; border-bottom:1px solid rgba(12,18,35,0.03); cursor:pointer; display:flex; flex-direction:column; gap:4px; }
        // .dropdown-item:hover { background: linear-gradient(90deg, rgba(48,122,200,0.04), rgba(48,122,200,0.01)); transform: translateX(6px); }

        /* form grid */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px 32px;
          margin-bottom: 16px;
          align-items: start;
        }
        .full-width {
          grid-column: 1 / -1;
        }

        /* switch styles */
        .switch-container {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          padding: 12px;
          background: rgba(255,255,255,0.6);
          border-radius: 8px;
          border: 1px solid rgba(15,23,42,0.04);
          
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 22px;
          margin-left: -50px;
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
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: var(--accent);
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        .input-group-combined:focus-within {
  box-shadow: 0 8px 26px rgba(48,122,200,0.08);
  border-color: rgba(48,122,200,0.25);
}

        <div className="input-group-combined" style={{
  display: "flex",
  flex: 1,
  border: "1px solid rgba(15,23,42,0.06)",
  borderRadius: "10px",
  overflow: "hidden",
  background: "linear-gradient(180deg, #fff, #fbfdff)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
}}>






        /* Responsive styles */
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
          .form-grid {
            grid-template-columns: 1fr;
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
          .card {
            padding: 12px;
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
          .submit-primary {
            padding: 10px 14px;
            min-width: 100px;
          }
          .tree-row {
            padding: 8px;
          }
          .stat {
            padding: 10px;
          }
        }

        /* Very small screens */
        @media (max-width: 360px) {
          .actions {
                flex-direction: column;
                width: 100%;
              }
          .action-pill {
            width: 100%;
          }
          .controls {
            flex-direction: column;
          }
          .submit-row {
            flex-direction: column;
            align-items: stretch;
          }
          .submit-primary, .submit-clear {
            width: 100%;
            text-align: center;
          }
        }

        /* Print styles */
        @media print {
          .lg-root {
            background: white;
            padding: 0;
          }
          .dashboard {
            box-shadow: none;
            border: 1px solid #ccc;
          }
          .actions, .submit-row {
            display: none;
          }
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          :root {
            --accent: #0000ff;
            --accent-2: #0000aa;
            --bg-1: #ffffff;
            --bg-2: #f0f0f0;
          }
          .dashboard {
            border: 2px solid #000;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          :root {
            --bg-1: #0f172a;
            --bg-2: #1e293b;
            --glass: rgba(30, 41, 59, 0.8);
            --glass-2: rgba(30, 41, 59, 0.6);
            --accent: #3b82f6;
            --accent-2: #60a5fa;
            --muted: #94a3b8;
            --card-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
            --glass-border: rgba(255, 255, 255, 0.1);
          }
          .dashboard {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.8));
            color: #f1f5f9;
          }
          .card {
            background: rgba(30, 41, 59, 0.7);
            color: #f1f5f9;
          }
          .input, .search {
            background: rgba(15, 23, 42, 0.6);
            border-color: rgba(255, 255, 255, 0.1);
            color: #f1f5f9;
          }
          .input:focus, .search:focus {
            border-color: var(--accent);
          }
          .tree-row {
            color: #f1f5f9;
          }
          .node-text {
            color: #f1f5f9;
          }
          .stat {
            background: rgba(30, 41, 59, 0.7);
            color: #f1f5f9;
          }
        }
      `}</style>

      <div className="dashboard" style={isPopupOpen ? { filter: 'blur(4px)', pointerEvents: 'none', opacity: 0.5 } : {}}>
        <div className="top-row">
          <div className="title-block">
            <svg width="38" height="38" viewBox="0 0 24 24" aria-hidden focusable="false">
              <rect width="24" height="24" rx="6" fill="#eff6ff" />
              <path d="M6 12h12M6 8h12M6 16h12" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h2 id="ledger-title">Ledger Creation</h2>
              <div className="subtitle muted">Create and manage ledger accounts</div>
            </div>
          </div>
          <div className="actions" role="toolbar" aria-label="actions">
            <AddButton
              onClick={() => changeActionType('create')}
              disabled={isSubmitting || !formPermissions.add}
              isActive={actionType === 'create'}
            />

            <EditButton
              onClick={(e) => {
                e.currentTarget.blur();
                changeActionType('edit');
                setIsPopupOpen(true);
              }}
              disabled={isSubmitting || !formPermissions.edit}
              isActive={actionType === 'edit'}
            />

            <DeleteButton
              onClick={(e) => {
                e.currentTarget.blur();
                changeActionType('delete');
                setIsPopupOpen(true);
              }}
              disabled={isSubmitting || !formPermissions.delete}
              isActive={actionType === 'delete'}
            />
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <div className="field">
              <label className="field-label">Ledger Name *</label>
              <input
                ref={partyNameRef}
                type="text"
                className="input"
                style={{ width: '100%' }}
                value={formData.partyName}
                onChange={(e) => handleChange('partyName', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Open tree and focus first node
                    setIsTreeOpen(true);
                    setTimeout(() => {
                      const firstNode = document.querySelector('[data-key]');
                      firstNode?.focus();
                    }, 0);
                  } else {
                    handleKeyboardNavigation(e, 0);
                  }
                }}
                required
                readOnly={actionType === 'delete'}
              />
            </div>

            <div className="field">
              <label className="field-label">Group Name *</label>
              <div className="row" style={{ display: "flex", alignItems: "stretch", gap: "0" }}>
                <div style={{
                  display: "flex",
                  flex: 1,
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: "linear-gradient(180deg, #fff, #fbfdff)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}>
                  <input
                    ref={groupNameRef}
                    type="text"
                    className="input"
                    value={mainGroup}
                    readOnly
                    onFocus={() => setIsTreeOpen(true)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 1)}
                    disabled={isSubmitting}
                    aria-label="Group Name"
                  />
                </div>
              </div>
            </div>

            {isTreeOpen && (
              <div className="panel">
                <div className="search-container">
                  {/* <input
                    type="text"
                    className="search-with-clear"
                    placeholder="Search groups..."
                    value={searchTree}
                    onChange={(e) => setSearchTree(e.target.value)}
                  /> */}
                  {searchTree && (
                    <button
                      className="clear-search-btn"
                      onClick={() => setSearchTree('')}
                      aria-label="Clear search"
                    >
                      <Icon.Close size={14} />
                    </button>
                  )}
                </div>
                <div className="tree-scroll">
                  {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
                      Loading tree...
                    </div>
                  ) : filteredTree.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
                      No groups found
                    </div>
                  ) : (
                    filteredTree.map((node) => (
                      <TreeNode
                        key={node.key}
                        node={node}
                        onSelect={handleSelectNode}
                        expandedKeys={expandedKeys}
                        toggleExpand={toggleExpand}
                        selectedKey={selectedNode?.key}
                        onNavigate={handleTreeNavigation}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Two-column layout: Left and Right */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 32px', marginTop: '16px' }}>
              {/* LEFT COLUMN */}
              <div>
                <div className="field">
                  <label className="field-label">GST Type</label>
                  <input
                    ref={gstTypeRef}
                    type="text"
                    className="input"
                    placeholder="G or I"
                    maxLength={1}
                    style={{ width: '100%' , textAlign: 'center',}}
                    value={formData.gstType}
                    onChange={(e) => handleChange('gstType', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.code === 'Space') {
                        e.preventDefault();
                        const newValue = formData.gstType === 'G' ? 'I' : 'G';
                        handleChange('gstType', newValue);
                      } else {
                        handleKeyboardNavigation(e, 2);
                      }
                    }}
                    readOnly={actionType === 'delete'}
                  />
                </div>

                <div className="field">
                  <label className="field-label">Street *</label>
                  <input
                    ref={fStreetRef}
                    type="text"
                    className="input"
                    style={{ width: '100%' }}
                    value={formData.fStreet}
                    onChange={(e) => handleChange('fStreet', e.target.value)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 3)}
                    readOnly={actionType === 'delete'}
                  />
                </div>

                <div className="field">
                  <label className="field-label">Area *</label>
                  <input
                    ref={areaRef}
                    type="text"
                    className="input"
                    style={{ width: '100%' }}
                    value={formData.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 4)}
                    readOnly={actionType === 'delete'}
                  />
                </div>

                <div className="field">
                  <label className="field-label">City *</label>
                  <input
                    ref={cityRef}
                    type="text"
                    className="input"
                    style={{ width: '100%' }}
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 5)}
                    readOnly={actionType === 'delete'}
                  />
                </div>

                <div className="field">
                  <label className="field-label">Pincode *</label>
                  <input
                    ref={pincodeRef}
                    type="text"
                    className="input"
                    style={{ width: '100%' }}
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 6)}
                    maxLength={6}
                    readOnly={actionType === 'delete'}
                  />
                </div>

                <div className="field">
                  <label className="field-label">Phone No *</label>
                  <input
                    ref={phoneRef}
                    type="text"
                    className="input"
                    style={{ width: '100%' }}
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 7)}
                    maxLength={10}
                    readOnly={actionType === 'delete'}
                  />
                </div>

                <div className="field">
                  <label className="field-label">Cell No</label>
                  <input
                    ref={cellNoRef}
                    type="text"
                    className="input"
                    style={{ width: '100%' }}
                    value={formData.cellNo}
                    onChange={(e) => handleChange('cellNo', e.target.value)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 8)}
                    maxLength={10}
                    readOnly={actionType === 'delete'}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div>
                <div className="field">
                  <label className="field-label">Route</label>
                  <select
                    ref={routeRef}
                    className="select"
                    style={{ width: '100%' }}
                    value={formData.route}
                    onChange={(e) => handleChange('route', e.target.value)}
                    onKeyDown={(e) => {
                      // Allow up/down arrow keys for route dropdown navigation
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        // Let browser handle native select dropdown navigation
                        return;
                      }
                      // Enter key moves focus to next field (GSTIN)
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        // Move focus to GSTIN field (next field)
                        if (gstinRef.current) {
                          gstinRef.current.focus();
                        }
                      }
                    }}
                    // disabled={actionType === 'delete'}
                    title="Use Up/Down arrows to select route, then press Enter to move to next field"
                  >
                    <option value="">Select Route</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Puducherry">Puducherry</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">GSTIN</label>
                  <input
                    ref={gstinRef}
                    type="text"
                    className="input"
                    style={{ width: '100%' }}
                    value={formData.gstin}
                    onChange={(e) => handleChange('gstin', e.target.value)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 10)}
                    readOnly={actionType === 'delete'}
                  />
                </div>

                <div className="field">
                  <label className="field-label">CIN No</label>
                  <input
                    ref={cinNoRef}
                    type="text"
                    className="input"
                    style={{ width: '100%' }}
                    value={formData.cinNo}
                    onChange={(e) => handleChange('cinNo', e.target.value)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 11)}
                    readOnly={actionType === 'delete'}
                  />
                </div>

                <div className="field">
                  <label className="field-label">PAN No</label>
                  <input
                    ref={panNoRef}
                    type="text"
                    className="input"
                    style={{ width: '100%' }}
                    value={formData.panNo}
                    onChange={(e) => handleChange('panNo', e.target.value)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 12)}
                    readOnly={actionType === 'delete'}
                  />
                </div>

                <div className="field">
                  <label className="field-label">State</label>
                  <div className="input-with-search">
                    <input
                      ref={stateRef}
                      type="text"
                      className="input"
                      style={{ width: '100%' }}
                      value={formData.state}
                      onChange={(e) => {
                        handleChange('state', e.target.value);
                      }}
                      onClick={() => {
                        if (actionType !== 'delete') setIsStatePopupOpen(true);
                      }}
                      onKeyDown={(e) => handleKeyboardNavigation(e, 13)}

                      readOnly
                    />
                    <div className="input-search-icon">
                      <Icon.Search size={16} />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Email</label>
                  <input
                    ref={emailRef}
                    type="email"
                    className="input"
                    style={{ width: '100%' }}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 14)}
                    readOnly={actionType === 'delete'}
                  />
                </div>

                <div className="field">
                  <label className="field-label">Short Name</label>
                  <input
                    ref={shortNameRef}
                    type="text"
                    className="input"
                    style={{ width: '100%' }}
                    value={formData.shortName}
                    onChange={(e) => handleChange('shortName', e.target.value)}
                    onKeyDown={(e) => handleKeyboardNavigation(e, 15)}
                    readOnly={actionType === 'delete'}
                  />
                </div>
              </div>
            </div>

            {/* Active Status Switch */}
            <div className="switch-container" style={{ marginTop: '16px' }}>
              <label className="field-label" style={{ margin: 0, marginRight: 12 }}>Active Status</label>
              <label className="switch" ref={activeSwitchRef}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={toggleActive}
                  onKeyDown={(e) => handleKeyboardNavigation(e, 16)}
                  disabled={actionType === 'delete'}
                />
                <span className="slider"></span>
              </label>
              <span className="muted">{isActive ? 'Active' : 'Inactive'}</span>
            </div>

            {message && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {lastNetworkError && (
              <div style={{ marginTop: 10, padding: 12, borderRadius: 8, background: '#fff7f7', color: '#9f1239', fontSize: 13 }}>
                <strong>Network Error Details</strong>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{JSON.stringify(lastNetworkError, null, 2)}</pre>
              </div>
            )}

            <div className="submit-row">
              <button
                ref={submitButtonRef}
                className="submit-primary"
                onClick={() => {
                  if (actionType === 'create') showCreateConfirmation();
                  else if (actionType === 'edit') showEditConfirmation();
                  else if (actionType === 'delete') showDeleteConfirmation();
                }}
                onKeyDown={(e) => handleKeyboardNavigation(e, 17)}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 
                 actionType === 'create' ? 'Add' :
                 actionType === 'edit' ? 'Edit' : 'Delete'}
              </button>
              <button
                ref={clearButtonRef}
                className="submit-clear"
                onClick={handleClear}
                onKeyDown={(e) => handleKeyboardNavigation(e, 18)}
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal overlay backdrop */}
      {isPopupOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 999,
          }}
          onClick={() => setIsPopupOpen(false)}
        />
      )}

      {/* Popup selector for editing ledgers */}
      <PopupListSelector
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSelect={(item) => {
          // map the selected item into the form
          const name = item.fAcname ?? item.fAcName ?? '';
          const code = item.fCode ?? item.fcode ?? '';
          const groupValue = item.fParent ?? item.parentName ?? '';
          
          setFormData(prev => ({
            ...prev,
            partyName: name || '',
            fCode: code || '',
            gstType: item.gstType || item.GstType || '',
            route: item.fRoute || item.Route || '',
            dueDay: item.fDueDays || item.fDueDay || '',
            dueDate: item.fDueDt || item.fDueDate || '',
            fStreet: item.fStreet || item.street || '',
            hallmark: item.HallmarkNo || '',
            area: item.fArea || item.area || '',
            gstin: item.fCstno || item.fGst || item.GstNo || '',
            cinNo: item.fCINNo || item.cinNo || item.CinNo || '',
            panNo: item.fPANNO || item.panNo || item.PanNo || '',
            city: item.fCity || item.city || '',
            state: item.state || item.State || '',
            pincode: item.fPincode || item.pincode || '',
            phone: item.fPhone || item.phoneNumber || '',
            cellNo: item.fcell || item.cellNo || item.CellNo || '',
            email: item.fMail || item.fEmail || item.Email || '',
            Hide: item.fshow || '1',
            shortName: item.shortName || item.fShort || item.ShortName || item.fFax || '',
          }));
          setMainGroup(groupValue);
          setIsActive(item.fshow !== '0');
          setIsPopupOpen(false);
        }}
        fetchItems={fetchPopupItems}
        title="Select Ledger to Edit"
        displayFieldKeys={['fAcname', 'fParent']}
        searchFields={['fAcname', 'fParent']}
        headerNames={['Ledger Name', 'Group']}
        columnWidths={{ fAcname: '70%', fParent: '30%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* Confirmation Popup for Create */}
      <ConfirmationPopup
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={confirmCreate}
        title="Create Ledger"
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

      {/* Confirmation Popup for Edit */}
      <ConfirmationPopup
        isOpen={confirmEditOpen}
        onClose={() => setConfirmEditOpen(false)}
        onConfirm={confirmEdit}
        title="Update Ledger"
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

      {/* Confirmation Popup for Delete */}
      <ConfirmationPopup
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Ledger"
        message={`Do you want to delete?`}
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

      {/* PopupListSelector for State Selection */}
      {isStatePopupOpen && (
        <PopupListSelector
          open={isStatePopupOpen}
          onClose={() => {
            setIsStatePopupOpen(false);
            setStateSearch('');
          }}
          onSelect={(item) => {
            setFormData(prev => ({ ...prev, state: item.fname || item.state || '' }));
            setIsStatePopupOpen(false);
            setStateSearch('');
            // Focus next field after state selection
            if (emailRef.current) {
              emailRef.current.focus();
            }
          }}
          fetchItems={(page, search) => fetchStatesWithSearch(page, search || stateSearch)}
          title="Select State"
          displayFieldKeys={[ 'fname']}
          searchFields={[ 'fname']}
          headerNames={[ 'State Name']}
          columnWidths={{ fcode: '30%', fname: '70%' }}
          maxHeight="60vh"
          responsiveBreakpoint={640}
          initialSearch={stateSearch}
        />
      )}
    </div>
  );
}