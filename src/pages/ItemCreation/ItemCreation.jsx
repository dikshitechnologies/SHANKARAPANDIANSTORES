import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import axios from 'axios';
import { API_ENDPOINTS } from "../../api/endpoints";
import apiService from "../../api/apiService";
import { AddButton, EditButton, DeleteButton } from '../../components/Buttons/ActionButtons';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CheckboxPopup from '../../components/CheckboxPopup/CheckboxPopup';
import {PopupScreenModal} from '../../components/PopupScreens.jsx';

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

// --- Tree node component ---
function TreeNode({ node, level = 0, onSelect, expandedKeys, toggleExpand, selectedKey, onNavigate }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedKeys.has(node.key);
  const isSelected = selectedKey === node.key;

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (hasChildren && !isExpanded) {
          toggleExpand(node.key);
        } else {
          onSelect(node);
        }
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
      case "ArrowUp":
      case "ArrowDown":
        e.preventDefault();
        onNavigate?.(e.key === "ArrowUp" ? "up" : "down", node.key);
        break;
    }
  };

  return (
    <div className="tree-node" style={{ paddingLeft: `${12 + level * 16}px` }}>
      <div
        className={`tree-row ${isSelected ? "selected" : ""}`}
        onClick={() => onSelect(node)}
        role="button"
        tabIndex={0}
        data-key={node.key}
        onKeyDown={handleKeyDown}
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

// Type options for dropdown
const TYPE_OPTIONS = [
  { value: "SC", label: "Scrap Product" },
  { value: "FG", label: "Finished Product" },
];

// GST percentage options
const GST_PERCENTAGES = ['3', '5', '12', '18', '28'];

const ItemCreation = ({ onCreated }) => {
  
  // State management
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taxList, setTaxList] = useState([]);
const [isTaxPopupOpen, setIsTaxPopupOpen] = useState(false);

  const [isTreeOpen, setIsTreeOpen] = useState(true);
  const [mainGroup, setMainGroup] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [actionType, setActionType] = useState('create');
  const isDeleteMode = actionType === 'delete';
  const [searchTree, setSearchTree] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [message, setMessage] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);

  // Confirmation Popup States (ADDED to match Unit Creation)
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // Checkbox states
  const [gstChecked, setGstChecked] = useState(false);
  const [manualPrefixChecked, setManualPrefixChecked] = useState(false);
  const [pieceRateChecked, setPieceRateChecked] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    fitemCode: '',
    itemName: '',
    groupName: '',
    shortName: '',
    brand: '',
    category: '',
    product: '',
    model: '',
    size: '',
    max: '',
    min: '',
    prefix: '',
    gstin: '',
    gst: 'N',
    manualprefix: 'N',
    hsnCode: '',
    pieceRate: 'N',
    type: '',
    sellingPrice: '',
    costPrice: '',
    unit: '',
    unitCode: ''
  });

  // Store codes separately (for backend) and names for display
  const [fieldCodes, setFieldCodes] = useState({
    brandCode: '',
    categoryCode: '',
    productCode: '',
    modelCode: '',
    sizeCode: '',
    unitCode: ''
  });

  // Popup states for fields
  const [isBrandPopupOpen, setIsBrandPopupOpen] = useState(false);
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [isProductPopupOpen, setIsProductPopupOpen] = useState(false);
  const [isModelPopupOpen, setIsModelPopupOpen] = useState(false);
  const [isSizePopupOpen, setIsSizePopupOpen] = useState(false);
  const [isUnitPopupOpen, setIsUnitPopupOpen] = useState(false);

  // Persisted selections for multi-select popups
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Track active field for close icon visibility
  const [activeField, setActiveField] = useState(null);

  // Search terms for each popup - NEW: Track initial search for each popup
  const [initialPopupSearch, setInitialPopupSearch] = useState({
    brand: '',
    category: '',
    product: '',
    model: '',
    size: '',
    unit: ''
  });

  // Refs for form inputs
  const itemNameRef = useRef(null);
  const shortNameRef = useRef(null);
  const groupNameRef = useRef(null);
  const brandRef = useRef(null);
  const categoryRef = useRef(null);
  const productRef = useRef(null);
  const modelRef = useRef(null);
  const sizeRef = useRef(null);
  const maxRef = useRef(null);
  const minRef = useRef(null);
  const prefixRef = useRef(null);
  const gstinRef = useRef(null);
  const hsnCodeRef = useRef(null);
  const typeRef = useRef(null);
  const sellingPriceRef = useRef(null);
  const costPriceRef = useRef(null);
  const unitRef = useRef(null);
  const isInitialFocusRef = useRef(true);

  // Add this with your other refs - FIXED: Using a ref for the submit button
  const submitButtonRef = useRef(null);

  // Get permissions for this form using the usePermissions hook
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();

  // Get permissions for ITEM_CREATION form
  const formPermissions = useMemo(() => ({
    add: hasAddPermission('ITEM_CREATION'),
    edit: hasModifyPermission('ITEM_CREATION'),
    delete: hasDeletePermission('ITEM_CREATION')
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // Add useEffect to focus submit button when in delete mode with data
  useEffect(() => {
    if (actionType === 'delete' && formData.itemName && formData.fitemCode) {
      // Small delay to ensure the component is rendered
      const timer = setTimeout(() => {
        if (submitButtonRef.current) {
          submitButtonRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [actionType, formData.itemName, formData.fitemCode]);

  // Auto-focus Item Name on component mount
  useEffect(() => {
    if (itemNameRef.current) {
      itemNameRef.current.focus();
    }
  }, []);

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep track of viewport to adapt tree rendering for small screens
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    try {
      console.log('Starting loadInitial...');
      console.log('Using endpoint:', API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.getTree);
      await fetchTreeData();
      await fetchTaxList();   // ✅ REQUIRED
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setMessage({ type: "error", text: "Failed to load data. Please check your connection." });
    } finally {
      setLoading(false);
    }
  };


  const fetchTaxList = async () => {
  try {
    const response = await apiService.get(
      API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.getTaxListGST(1, 100)
    );

    const data = response?.data || [];

    setTaxList(
      data.map(item => ({
        label: `${item.ftaxName}%`,
        value: item.ftaxName || ''
      }))
    );
  } catch (error) {
    console.error("Failed to load tax list", error);
    setTaxList([]);
  }
};


  const fetchTreeData = async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.getTree);

      // Log response for debugging
      console.log('Tree API Response:', response);

      // Handle both direct array and data property
      const data = Array.isArray(response) ? response : (response?.data || response);

      if (Array.isArray(data) && data.length > 0) {
        // Transform API response to match tree structure
        const transformTreeData = (nodes) => {
          return nodes.map(node => ({
            key: node.fgroupCode || node.fitemcode || node.fCode || node.id || Math.random().toString(),
            displayName: node.fgroupName || node.fitemname || node.fBrand || node.label || node.name || '',
            id: node.fgroupCode || node.fitemcode || node.fCode || node.id || '',
            fitemcode: node.fgroupCode || node.fitemcode || node.fCode || '',
            fitemname: node.fgroupName || node.fitemname || node.fBrand || '',
            fparent: node.fparent || node.fParent || '',
            fAclevel: node.fAclevel || 0,
            children: node.children && Array.isArray(node.children) ? transformTreeData(node.children) : []
          }));
        };

        const treeData = transformTreeData(data);
        setTreeData(treeData);
        setExpandedKeys(new Set(treeData.map(item => item.key)));
        console.log('Transformed tree data:', treeData);
      } else {
        console.warn('Unexpected API response format or empty data:', data);
        setTreeData([]);
        setMessage({ type: "error", text: 'No item groups found. Please create item groups first.' });
      }
    } catch (error) {
      console.error('Tree data fetch error:', error);
      setMessage({ type: "error", text: `Failed to fetch tree data: ${error.message}` });
      setTreeData([]);
    }
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
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Checkbox handlers
  const handleGstToggle = () => {
    const newValue = !gstChecked;
    setGstChecked(newValue);
    handleChange('gst', newValue ? 'Y' : 'N');

    if (newValue) {
      // Auto-populate with 3% when GST is checked
      const defaultGst = "3";
      handleChange('gstin', defaultGst);
    } else {
      handleChange('gstin', '');
    }
  };

  const handleManualPrefixToggle = async () => {
    const newValue = !manualPrefixChecked;
    setManualPrefixChecked(newValue);
    handleChange('manualprefix', newValue ? 'Y' : 'N');

    if (newValue) {
      await getMaxPrefixFromAPI();
    } else {
      handleChange('prefix', '');
    }
  };

  const handlePieceRateToggle = () => {
    const newValue = !pieceRateChecked;
    setPieceRateChecked(newValue);
    handleChange('pieceRate', newValue ? 'Y' : 'N');
  };

  // UPDATED: Arrow key navigation with special handling for delete button
  const handleKeyNavigation = (e) => {
    const key = e.key;

    // Special handling for Delete button when in delete mode
    if (key === 'Enter' && actionType === 'delete' &&
      (e.target.classList.contains('submit-primary') || e.target === submitButtonRef.current)) {
      e.preventDefault();
      e.stopPropagation();

      if (!formData.itemName) {
        setMessage({ type: "error", text: 'Please enter Item Name.' });
        itemNameRef.current?.focus();
        return;
      }
      if (!mainGroup) {
        setMessage({ type: "error", text: 'Please select Group Name.' });
        return;
      }

      showDeleteConfirmation();
      return;
    }

    // Handle all arrow keys and Enter for navigation
    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(key)) {
      // If tree is open and we're in tree navigation, let tree handle it
      if (isTreeOpen && (e.target.closest('.tree-scroll') || e.target === groupNameRef.current)) {
        return;
      }

      // If dropdown is open, let it handle arrow keys
      if (typeRef.current && typeRef.current.size > 0) {
        return;
      }

      // Check if we're in a text input that should allow cursor movement
      const isTextInput = e.target.tagName === 'INPUT' && e.target.type === 'text';
      const isTextarea = e.target.tagName === 'TEXTAREA';

      // For LEFT/RIGHT arrows in text inputs/areas, allow normal cursor movement
      // unless the cursor is at the beginning/end of the text
      if ((key === 'ArrowLeft' || key === 'ArrowRight') && (isTextInput || isTextarea)) {
        // Get cursor position
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const value = e.target.value;

        // For LEFT arrow: only navigate if cursor is at beginning AND no text selected
        if (key === 'ArrowLeft' && start === 0 && end === 0) {
          e.preventDefault();
          // Allow navigation to previous field
        }
        // For RIGHT arrow: only navigate if cursor is at end AND no text selected
        else if (key === 'ArrowRight' && start === value.length && end === value.length) {
          e.preventDefault();
          // Allow navigation to next field
        } else {
          // Let the browser handle cursor movement within the text
          return;
        }
      } else {
        // For all other cases, prevent default
        e.preventDefault();
      }

      try {
        const container = e.currentTarget;
        if (!container) return;

        // ✅ Get ALL focusable elements in the form
        const selectors = [
          'input:not([type="hidden"]):not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '.checkbox-group[tabindex="0"]',
          'button.submit-primary:not([disabled])',
          'button.submit-clear:not([disabled])'
        ].join(', ');

        const elements = Array.from(container.querySelectorAll(selectors))
          .filter(el => {
            if (!el.offsetParent) return false;
            const style = window.getComputedStyle(el);
            return style.visibility !== 'hidden' && style.display !== 'none';
          });

        if (!elements.length) return;

        const active = document.activeElement;
        const index = elements.indexOf(active);

        // Handle DOWN arrow and Enter (for moving forward)
        if (key === 'ArrowDown' || (key === 'Enter' && active.tagName !== 'BUTTON')) {
          // ✅ Move to next field (or first if none focused)
          if (index >= 0 && index < elements.length - 1) {
            const nextElement = elements[index + 1];
            nextElement.focus();
            // If next element is a checkbox group, ensure it's visible
            if (nextElement.classList.contains('checkbox-group')) {
              nextElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else if (index === -1) {
            // If no element focused, focus first one
            elements[0].focus();
          } else if (index === elements.length - 1) {
            // If at last element, loop to first
            elements[0].focus();
          }
        }
        // Handle UP arrow (for moving backward)
        else if (key === 'ArrowUp') {
          // ✅ Move to previous field (or last if none focused)
          if (index > 0) {
            const prevElement = elements[index - 1];
            prevElement.focus();
            // If previous element is a checkbox group, ensure it's visible
            if (prevElement.classList.contains('checkbox-group')) {
              prevElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else if (index === 0) {
            // If at first element, loop to last
            elements[elements.length - 1].focus();
          } else if (index === -1) {
            // If no element focused, focus last one
            elements[elements.length - 1].focus();
          }
        }
        // Handle RIGHT arrow (same as DOWN for navigation)
        else if (key === 'ArrowRight') {
          // ✅ Move to next field (or first if none focused)
          if (index >= 0 && index < elements.length - 1) {
            const nextElement = elements[index + 1];
            nextElement.focus();
          } else if (index === -1) {
            elements[0].focus();
          } else if (index === elements.length - 1) {
            elements[0].focus();
          }
        }
        // Handle LEFT arrow (same as UP for navigation)
        else if (key === 'ArrowLeft') {
          // ✅ Move to previous field (or last if none focused)
          if (index > 0) {
            elements[index - 1].focus();
          } else if (index === 0) {
            elements[elements.length - 1].focus();
          } else if (index === -1) {
            elements[elements.length - 1].focus();
          }
        }
      } catch (err) {
        console.warn('Keyboard navigation error', err);
      }
    }
  };

  const getMaxPrefixFromAPI = async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.getMaxPrefix);

      if (response.data && response.data.maxPrefix) {
        handleChange('prefix', response.data.maxPrefix.toString());
      } else if (response.data && response.data.nextPrefix) {
        handleChange('prefix', response.data.nextPrefix.toString());
      } else {
        const defaultPrefix = "1001";
        handleChange('prefix', defaultPrefix);
      }
    } catch (error) {
      console.error('Error fetching max prefix:', error);
      setMessage({ type: "error", text: 'Failed to fetch prefix. Using default.' });
      const defaultPrefix = "1001";
      handleChange('prefix', defaultPrefix);
    }
  };

  // Validation function - UPDATED with mandatory field checks
  const validateForm = () => {
    if (!formData.itemName) {
      setMessage({ type: "error", text: 'Item Name is required.' });
      itemNameRef.current?.focus();
      return false;
    }
    if (!mainGroup) {
      setMessage({ type: "error", text: 'Group Name is required.' });
      return false;
    }

    // NEW: Validate Type field
    if (!formData.type) {
      setMessage({ type: "error", text: 'Type is required. Please select a type.' });
      typeRef.current?.focus();
      return false;
    }

    // NEW: Validate Units field
    if (!formData.unit) {
      setMessage({ type: "error", text: 'Units is required. Please select a unit.' });
      setIsUnitPopupOpen(true);
      return false;
    }

    // NEW: Validate HSN Code field
    // if (!formData.hsnCode) {
    //   setMessage({ type: "error", text: 'HSN Code is required.' });
    //   hsnCodeRef.current?.focus();
    //   return false;
    // }

    // Validate GST% - Optional (can be empty)
    // If GST is provided, validate it against allowed values
    if (formData.gstin && !isValidGSTFromAPI(formData.gstin)) {
      setMessage({ 
        type: "error", 
        text: `Invalid GST%. Allowed values: ${taxList.map(t => t.value).join(', ')}` 
      });
      gstinRef.current?.focus();
      return false;
    }

    // Validate Selling Price - accept only numbers
    if (formData.sellingPrice && !/^\d*\.?\d{0,2}$/.test(formData.sellingPrice)) {
      setMessage({ type: "error", text: 'Selling Price should be a valid number.' });
      sellingPriceRef.current?.focus();
      return false;
    }

    // Validate Cost Price - accept only numbers
    if (formData.costPrice && !/^\d*\.?\d{0,2}$/.test(formData.costPrice)) {
      setMessage({ type: "error", text: 'Cost Price should be a valid number.' });
      costPriceRef.current?.focus();
      return false;
    }

    return true;
  };

  // Show confirmation popup for Create (ADDED to match Unit Creation)
  const showCreateConfirmation = () => {
    setConfirmSaveOpen(true);
  };

  // Handle Create confirmation (ADDED to match Unit Creation) - UPDATED with validation
  const confirmCreate = async () => {
    setConfirmSaveOpen(false);


    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    if (!formPermissions.add) {
      setMessage({ type: "error", text: "You don't have permission to create items." });
      return;
    }

    await handleConfirmAction('create');
  };

  // Show confirmation popup for Edit (ADDED to match Unit Creation)
  const showEditConfirmation = () => {
    setConfirmEditOpen(true);
  };

  // Handle Edit confirmation (ADDED to match Unit Creation) - UPDATED with validation
  const confirmEdit = async () => {
    setConfirmEditOpen(false);

    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    if (!formPermissions.edit) {
      setMessage({ type: "error", text: "You don't have permission to edit items." });
      return;
    }

    await handleConfirmAction('edit');
  };

  // Show confirmation popup for Delete (ADDED to match Unit Creation)
  const showDeleteConfirmation = () => {
    setConfirmDeleteOpen(true);
  };

  // Handle Delete confirmation (ADDED to match Unit Creation) - UPDATED with validation
  const confirmDelete = async () => {
    setConfirmDeleteOpen(false);

    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    if (!formPermissions.delete) {
      setMessage({ type: "error", text: "You don't have permission to delete items." });
      return;
    }

    await handleConfirmAction('delete');
  };

  // Show confirmation popup
  const showConfirmationPopup = (action, data = null) => {
    setConfirmAction(action);
    setConfirmData(data);
    setShowConfirmPopup(true);
  };

  const isValidGSTFromAPI = (gstValue) => {
  if (!gstValue) return false;
  return taxList.some(t => String(t.value) === String(gstValue));
};


  // Handle confirmation from popup - UPDATED with toast notifications and validation
  const handleConfirmAction = async (actionType) => {
    // Validate form first - UPDATED
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setIsLoading(true);
    setMessage(null);
    const sizeCodesArray = fieldCodes.sizeCode
      ? fieldCodes.sizeCode.split(',').filter(code => code.trim() !== '')
      : [];
    // Define baseItemName so it's available in both create and edit/delete
    const baseItemName = formData.itemName || '';
    try {
      // Prepare request data matching API expected field names

      let requestData;

      // Prepare different request data for CREATE vs EDIT/DELETE
      if (actionType === 'create') {
        // For CREATE: Build fitemName from components and create sizes array
        const brand = formData.brand || '';
        const category = formData.category || '';
        const product = formData.product || '';
        const model = formData.model || '';
        // Build sizes array with itemName including size name
        const sizesArray = selectedSizes.map(sizeItem => {
          const sizeName = sizeItem.fname || sizeItem.fsize || sizeItem.name || '';
          const itemNameConcat = [baseItemName, brand, category, product, model, sizeName]
            .filter(part => part.trim() !== '')
            .join(' ');
          return {
            size: sizeItem.fcode || sizeItem.fsize || '',
            itemName: itemNameConcat
          };
        });

        requestData = {
          fitemName: baseItemName,
          fSubItemName: baseItemName,
          groupName: mainGroup || '',
          gstNumber: formData.gstin || '',
          prefix: formData.prefix || '',
          shortName: formData.shortName || '',
          hsnCode: formData.hsnCode || '',
          pieceRate: formData.pieceRate === 'Y' ? 'Y' : 'N',
          gst: formData.gst === 'Y' ? 'Y' : 'N',
          manualprefix: formData.manualprefix === 'Y' ? 'Y' : 'N',
          fproduct: fieldCodes.productCode || '',
          fbrand: fieldCodes.brandCode || '',
          fcategory: fieldCodes.categoryCode || '',
          fmodel: fieldCodes.modelCode || '',
          fsize: fieldCodes.sizeCode || '',
          fmin: formData.min || '',
          fmax: formData.max || '',
          ftype: formData.type || '',
          fSellPrice: formData.sellingPrice || '',
          fCostPrice: formData.costPrice || '',
          fUnits: formData.unit || '',
          sizes: sizesArray
        };
      } else {


        const brand = formData.brand || '';
            const category = formData.category || '';
            const product = formData.product || '';
            const model = formData.model || '';
            // Use the first selected size if available, else formData.size
            let sizeName = '';
            if (selectedSizes && selectedSizes.length > 0) {
              const sizeItem = selectedSizes[0];
              sizeName = sizeItem.fname || sizeItem.fsize || sizeItem.name || '';
            } else {
              sizeName = formData.size || '';
            }
            const editItemNameConcat = [baseItemName, brand, category, product, model, sizeName]
              .filter(part => part.trim() !== '')
              .join(' ');
        requestData = {
          fitemCode: formData.fitemCode || '',
          fitemName: editItemNameConcat,
          fSubItemName: baseItemName,
          groupName: mainGroup || '',
          gstNumber: formData.gstin || '',
          prefix: formData.prefix || '',
          shortName: formData.shortName || '',
          hsnCode: formData.hsnCode || '',
          pieceRate: formData.pieceRate === 'Y' ? 'Y' : 'N',
          gst: formData.gst === 'Y' ? 'Y' : 'N',
          manualprefix: formData.manualprefix === 'Y' ? 'Y' : 'N',
          fproduct: fieldCodes.productCode || '',
          fbrand: fieldCodes.brandCode || '',
          fcategory: fieldCodes.categoryCode || '',
          fmodel: fieldCodes.modelCode || '',
          fsize: fieldCodes.sizeCode || '',
          fmin: formData.min || '',
          fmax: formData.max || '',
          ftype: formData.type || '',
          fSellPrice: formData.sellingPrice || '',
          fCostPrice: formData.costPrice || '',
          // fUnits: fieldCodes.unitCode || ''
          fUnits: formData.unit || '',
        };
      }
      console.log('Submitting data:', JSON.stringify(requestData));

      let response;
      let successMessage = '';

      switch (actionType) {
        case 'create':
          // Duplicate check
          const duplicateCheck = await apiService.get(
            `${API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.getDropdown}?search=${encodeURIComponent(formData.itemName)}`
          );

          if (duplicateCheck.data && duplicateCheck.data.length > 0) {
            // Handle duplicate
          }

          response = await apiService.post(API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.postCreate, requestData);
          console.log('Create response:', response);
          successMessage = `Item "${formData.itemName}" created successfully.`; // ADDED
          break;

        case 'edit':
          response = await apiService.put(API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.putEdit, requestData);
          successMessage = `Item "${formData.itemName}" updated successfully.`; // ADDED
          break;

        case 'delete':
          response = await apiService.del(API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.delete(formData.fitemCode));
          successMessage = `Item "${formData.itemName}" deleted successfully.`; // ADDED
          break;

        default:
          setMessage({ type: "error", text: 'Invalid action type' });
          setIsLoading(false);
          return;
      }

      // Refresh tree data
      await fetchTreeData();
      handleClear();

      // Show success toast notification - ADDED


    } catch (error) {
      console.error('Submit error:', error);
      setMessage({ type: "error", text: error.response?.data?.message || error.message || 'An unexpected server error occurred.' });

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data || 'An unexpected server error occurred.';

        if (status === 409) {
          setMessage({ type: "error", text: error.response?.data?.message || error.message || 'An unexpected server error occurred.' });
        } else if (status === 400) {
          setMessage({ type: "error", text: `Validation error: ${errorMessage}` });
        } else if (status === 404) {
          setMessage({ type: "error", text: 'Resource not found. Please check the item code.' });
        } else if (status === 500) {
          setMessage({ type: "error", text: 'Server error. Please try again later.' });
        } else {
          setMessage({ type: "error", text: `Error ${status}: ${errorMessage}` });
        }
      } else if (error.request) {
        setMessage({ type: "error", text: 'No response received from the server. Please check your network connection.' });
      } else {
        setMessage({ type: "error", text: `Error: ${error.message}. Please check your connection and try again.` });
      }
    } finally {
      setIsLoading(false);
    }
  };


  

  // Fetch function used by PopupListSelector for Edit/Delete - UPDATED
  const PAGE_SIZE = 20;

  const fetchPopupItems = useCallback(
    async (page = 1, search = '') => {
      try {
        const response = await apiService.get(
          API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.getDropdown,
          {
            page,
            pageSize: PAGE_SIZE,
            search: search || ''
          }
        );
        console.debug('fetchPopupItems response:', response);
        const data = response?.data || [];

        if (!Array.isArray(data)) return [];

        return data.map((it) => {
          const fItemName = it.fItemName || '';
          const fSubItemName = it.fSubItemName || fItemName;
          return {
            fItemcode: it.fItemcode || '',
            fItemName,
            fSubItemName,
            fParent: it.fParent || '',
            fShort: it.fShort || '',
            fhsn: it.fhsn || '',
            ftax: it.ftax || '',
            fPrefix: it.fPrefix || '',
            manualprefix: it.manualprefix || 'N',
            fUnits: it.fUnits || '',
            fCostPrice: it.fCostPrice || '',
            fSellPrice: it.fSellPrice || '',
            fbrand: it.fbrand || '',
            fcategory: it.fcategory || '',
            fmodel: it.fmodel || '',
            fsize: it.fsize || '',
            fmin: it.fmin || '',
            fmax: it.fmax || '',
            ftype: it.ftype || '',
            fproduct: it.fproduct || '',
            pieceRate: it.pieceRate || it.fPieceRate || 'N',
            fPieceRate: it.fPieceRate || it.pieceRate || 'N',
            brand: it.brand || '',
            category: it.category || '',
            model: it.model || '',
            size: it.size || '',
            product: it.product || '',
            gstcheckbox: it.gstcheckbox || (it.ftax ? 'Y' : 'N')
          };
        });
      } catch (err) {
        console.error('fetchPopupItems error', err);
        return [];
      }
    },
    []
  );


  // Fetch functions for popups (Brand, Category, Product, Model, Size, Unit)
  const fetchBrands = useCallback(async (page = 1, search = '') => {
    try {
      const response = await apiService.get(API_ENDPOINTS.BRAND.GET_BRANDS, { page, search });
      const data = Array.isArray(response) ? response : (response?.data || response);
      console.debug('fetchBrands response:', data);

      if (Array.isArray(data)) {
        return data.map((item) => ({
          fname: item.fBrand || item.fbrand || item.fBrandName || item.fName || item.name || item.label || '',
          fcode: item.fCode || item.fcode || item.code || ''
        }));
      }

      return [];
    } catch (err) {
      console.error('fetchBrands error', err);
      return [];
    }
  }, []);

  const fetchCategories = useCallback(async (page = 1, search = '') => {
    try {
      const response = await apiService.get(API_ENDPOINTS.CATEGORY.GET_CATEGORIES, { page, search });
      let data = Array.isArray(response) ? response : (response?.data || response);
      console.debug('fetchCategories raw response:', response);

      // Normalize some common wrapped shapes
      if (!data) data = [];
      if (!Array.isArray(data)) {
        // handle { data: [...] } (already attempted), or { Result: [...] }, or { items: [...] }
        data = response?.Result || response?.result || response?.items || response?.Items || response?.data || data;
      }

      // If still not array but is object with keys mapping to categories, convert to array
      if (!Array.isArray(data) && typeof data === 'object') {
        data = Object.values(data);
      }

      // If API returns array of strings, convert to objects
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
        return data.map((name) => ({ fname: name, fcode: '' }));
      }

      if (Array.isArray(data)) {
        return data.map((item) => ({
          fname: item.catName || item.catname || item.fCategoryName || item.fcategoryName || item.fCategory || item.categoryName || item.name || item.label || item.fName || '',
          fcode: item.catCode || item.catcode || item.fCategoryCode || item.fcategoryCode || item.fCode || item.code || item.fId || item.id || ''
        }));
      }

      return [];
    } catch (err) {
      console.error('fetchCategories error', err);
      return [];
    }
  }, []);

  const fetchProducts = useCallback(async (page = 1, search = '') => {
    try {
      const response = await apiService.get(API_ENDPOINTS.PRODUCT.GET_PRODUCTS, { page, search });
      const data = Array.isArray(response) ? response : (response?.data || response);
      console.debug('fetchProducts response:', data);

      if (Array.isArray(data)) {
        return data.map((item) => ({
          fname: item.fproductname || item.fProductName || item.fproductName || item.fProduct || item.fproduct || item.name || item.label || '',
          fcode: item.fproductcode || item.fProductCode || item.fproductCode || item.fCode || item.code || ''
        }));
      }

      return [];
    } catch (err) {
      console.error('fetchProducts error', err);
      return [];
    }
  }, []);

  const fetchModels = useCallback(async (page = 1, search = '') => {
    try {
      const response = await apiService.get(API_ENDPOINTS.MODELCREATION.GET_MODEL_ITEMS, { page, search });
      const data = Array.isArray(response) ? response : (response?.data || response);
      console.debug('fetchModels response:', data);

      if (Array.isArray(data)) {
        return data.map((item) => ({
          fname: item.fname || item.fName || item.fmodelName || item.fModel || item.name || item.label || '',
          fcode: item.fcode || item.fCode || item.fmodelCode || item.fModelCode || item.code || ''
        }));
      }

      return [];
    } catch (err) {
      console.error('fetchModels error', err);
      return [];
    }
  }, []);

  const fetchSizes = useCallback(async (page = 1, search = '') => {
    try {
      const response = await apiService.get(API_ENDPOINTS.SIZECREATION.GET_SIZE_ITEMS, { page, search });
      const data = Array.isArray(response) ? response : (response?.data || response);
      console.debug('fetchSizes response:', data);

      if (Array.isArray(data)) {
        return data.map((item) => ({
          fname: item.fsize || item.fSize || item.fsizeName || item.size || item.name || item.label || '',
          fcode: item.fcode || item.fCode || item.fsizeCode || item.fSizeCode || item.fCode || item.code || ''
        }));
      }

      return [];
    } catch (err) {
      console.error('fetchSizes error', err);
      return [];
    }
  }, []);

  const fetchUnits = useCallback(async (page = 1, search = '') => {
    try {
      const response = await apiService.get(API_ENDPOINTS.UNITCREATION.GET_SIZE_ITEMS, { page, search });
      const data = Array.isArray(response) ? response : (response?.data || response);
      console.debug('fetchUnits response:', data);

      if (Array.isArray(data)) {
        return data.map((item) => ({
          fname: item.unitName || item.unitname || item.funitName || item.fUnit || item.unit || item.name || item.label || '',
          fcode: item.uCode || item.UCode || item.ucode || item.funitCode || item.fUnitCode || item.fCode || item.code || ''
        }));
      }

      return [];
    } catch (err) {
      console.error('fetchUnits error', err);
      return [];
    }
  }, []);

  // NEW: Handle keyboard typing in popup fields - UPDATED SIMPLIFIED VERSION
  const handlePopupFieldKeyPress = (field, e) => {
    const key = e.key;

    // Handle Backspace to clear the field
    if (key === 'Backspace') {
      e.preventDefault();

      // Clear the field value and code
      switch (field) {
        case 'brand':
          setFormData(prev => ({ ...prev, brand: '' }));
          setFieldCodes(prev => ({ ...prev, brandCode: '' }));
          break;
        case 'category':
          setFormData(prev => ({ ...prev, category: '' }));
          setFieldCodes(prev => ({ ...prev, categoryCode: '' }));
          break;
        case 'product':
          setFormData(prev => ({ ...prev, product: '' }));
          setFieldCodes(prev => ({ ...prev, productCode: '' }));
          break;
        case 'model':
          setFormData(prev => ({ ...prev, model: '' }));
          setFieldCodes(prev => ({ ...prev, modelCode: '' }));
          break;
        case 'size':
          setFormData(prev => ({ ...prev, size: '' }));
          setFieldCodes(prev => ({ ...prev, sizeCode: '' }));
          break;
        case 'unit':
          setFormData(prev => ({ ...prev, unit: '' }));
          setFieldCodes(prev => ({ ...prev, unitCode: '' }));
          break;
      }
      return;
    }

    // Only handle letter keys (a-z, A-Z) and number keys (0-9)
    if (key.length === 1 && /^[a-zA-Z0-9]$/.test(key)) {
      e.preventDefault();

      // Store the typed key as initial search for this popup
      setInitialPopupSearch(prev => ({
        ...prev,
        [field]: key
      }));

      // Open the appropriate popup
      switch (field) {
        case 'brand':
          setIsBrandPopupOpen(true);
          break;
        case 'category':
          setIsCategoryPopupOpen(true);
          break;
        case 'product':
          setIsProductPopupOpen(true);
          break;
        case 'model':
          setIsModelPopupOpen(true);
          break;
        case 'size':
          setIsSizePopupOpen(true);
          break;
        case 'unit':
          setIsUnitPopupOpen(true);
          break;
      }
    }
  };

  // Reset initial search when popup closes
  useEffect(() => {
    if (!isBrandPopupOpen) {
      setInitialPopupSearch(prev => ({ ...prev, brand: '' }));
    }
    if (!isCategoryPopupOpen) {
      setInitialPopupSearch(prev => ({ ...prev, category: '' }));
    }
    if (!isProductPopupOpen) {
      setInitialPopupSearch(prev => ({ ...prev, product: '' }));
    }
    if (!isModelPopupOpen) {
      setInitialPopupSearch(prev => ({ ...prev, model: '' }));
    }
    if (!isSizePopupOpen) {
      setInitialPopupSearch(prev => ({ ...prev, size: '' }));
    }
    if (!isUnitPopupOpen) {
      setInitialPopupSearch(prev => ({ ...prev, unit: '' }));
    }
  }, [isBrandPopupOpen, isCategoryPopupOpen, isProductPopupOpen, isModelPopupOpen, isSizePopupOpen, isUnitPopupOpen]);

  const resetForm = (keepAction = false) => {
    setMainGroup('');
    setSelectedNode(null);
    setFormData({
      fitemCode: '',
      itemName: '',
      groupName: '',
      shortName: '',
      brand: '',
      category: '',
      product: '',
      model: '',
      size: '',
      max: '',
      min: '',
      prefix: '',
      gstin: '',
      gst: 'N',
      manualprefix: 'N',
      hsnCode: '',
      pieceRate: 'N',
      type: '',
      sellingPrice: '',
      costPrice: '',
      unit: '',
      unitCode: ''
    });
    setFieldCodes({
      brandCode: '',
      categoryCode: '',
      productCode: '',
      modelCode: '',
      sizeCode: '',
      unitCode: ''
    });
    setGstChecked(false);
    setManualPrefixChecked(false);
    setPieceRateChecked(false);
    setMessage(null);
    setSearchTree('');
    // Reset popup initial search values
    setInitialPopupSearch({
      brand: '',
      category: '',
      product: '',
      model: '',
      size: '',
      unit: ''
    });
    if (!keepAction) setActionType('create');
  };

  const changeActionType = (type) => {
    setActionType(type);
    if (type === 'create') {
      resetForm(true);
    }
    setIsTreeOpen(true);

    if (type === 'edit' || type === 'delete') {
      // PopupListSelector will handle data fetching
    }
  };

  const handleClear = () => {
    resetForm(false);

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

  const handleTreeNavigation = useCallback((direction, currentKey) => {
    const getAllNodes = (nodes) => {
      const result = [];
      for (const node of nodes) {
        result.push(node);
        if (expandedKeys.has(node.key) && node.children) {
          result.push(...getAllNodes(node.children));
        }
      }
      return result;
    };

    const allNodes = getAllNodes(filteredTree);
    const currentIndex = allNodes.findIndex(n => n.key === currentKey);

    if (direction === "up") {
      const newIndex = Math.max(0, currentIndex - 1);
      const newNode = allNodes[newIndex];
      if (newNode) {
        setSelectedNode(newNode);
        setTimeout(() => {
          document.querySelector(`[data-key="${newNode.key}"]`)?.focus();
        }, 0);
      }
    } else if (direction === "down") {
      const newIndex = Math.min(allNodes.length - 1, currentIndex + 1);
      const newNode = allNodes[newIndex];
      if (newNode) {
        setSelectedNode(newNode);
        setTimeout(() => {
          document.querySelector(`[data-key="${newNode.key}"]`)?.focus();
        }, 0);
      }
    }
  }, [filteredTree, expandedKeys]);

  // Custom fetch functions that include the initial search
  const fetchBrandsWithSearch = useCallback(async (page = 1, search = '') => {
    // If we have an initial search for brand, combine it with current search
    const initialSearch = initialPopupSearch.brand;
    const effectiveSearch = initialSearch ?
      initialSearch + (search || '') :
      search;

    console.log('Fetching brands with search:', effectiveSearch);
    return fetchBrands(page, effectiveSearch);
  }, [fetchBrands, initialPopupSearch.brand]);

  const fetchCategoriesWithSearch = useCallback(async (page = 1, search = '') => {
    const initialSearch = initialPopupSearch.category;
    const effectiveSearch = initialSearch ?
      initialSearch + (search || '') :
      search;

    console.log('Fetching categories with search:', effectiveSearch);
    return fetchCategories(page, effectiveSearch);
  }, [fetchCategories, initialPopupSearch.category]);

  const fetchProductsWithSearch = useCallback(async (page = 1, search = '') => {
    const initialSearch = initialPopupSearch.product;
    const effectiveSearch = initialSearch ?
      initialSearch + (search || '') :
      search;

    console.log('Fetching products with search:', effectiveSearch);
    return fetchProducts(page, effectiveSearch);
  }, [fetchProducts, initialPopupSearch.product]);

  const fetchModelsWithSearch = useCallback(async (page = 1, search = '') => {
    const initialSearch = initialPopupSearch.model;
    const effectiveSearch = initialSearch ?
      initialSearch + (search || '') :
      search;

    console.log('Fetching models with search:', effectiveSearch);
    return fetchModels(page, effectiveSearch);
  }, [fetchModels, initialPopupSearch.model]);

  const fetchSizesWithSearch = useCallback(async (page = 1, search = '') => {
    const initialSearch = initialPopupSearch.size;
    const effectiveSearch = initialSearch ?
      initialSearch + (search || '') :
      search;

    console.log('Fetching sizes with search:', effectiveSearch);
    return fetchSizes(page, effectiveSearch);
  }, [fetchSizes, initialPopupSearch.size]);


  

  const fetchUnitsWithSearch = useCallback(async (page = 1, search = '') => {
    const initialSearch = initialPopupSearch.unit;
    const effectiveSearch = initialSearch ?
      initialSearch + (search || '') :
      search;

    console.log('Fetching units with search:', effectiveSearch);
    return fetchUnits(page, effectiveSearch);
  }, [fetchUnits, initialPopupSearch.unit]);

  // Get confirmation popup configuration based on action
  const getConfirmationConfig = () => {
    switch (confirmAction) {
      case 'save':
        return {
          title: 'Save Item',
          message: 'Are you sure you want to save this item?',
          confirmText: 'Save',
          type: 'success',
          iconSize: 24,
          showIcon: true
        };
      case 'update':
        return {
          title: 'Update Item',
          message: 'Are you sure you want to update this item?',
          confirmText: 'Update',
          type: 'success',
          iconSize: 24,
          showIcon: true
        };
      case 'delete':
        return {
          title: 'Delete Item',
          message: 'Are you sure you want to delete this item? This action cannot be undone.',
          confirmText: 'Delete',
          type: 'danger',
          iconSize: 24,
          showIcon: true
        };
      case 'clear':
        return {
          title: 'Clear Form',
          message: 'Are you sure you want to clear all fields? All unsaved changes will be lost.',
          confirmText: 'Clear',
          type: 'warning',
          iconSize: 24,
          showIcon: true
        };
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          type: 'default',
          iconSize: 24,
          showIcon: true
        };
    }
  };

  return (
    <div className="lg-root" role="region" aria-labelledby="item-title">
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
          /* custom blue theme */
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
          border-radius: 16px;
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
          font-family: "Poppins", "Inter", sans-serif;
          font-size: 20px;
          font-weight: 600;
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
           .asterisk {
          color: var(--danger);
          font-weight: 700;
        }

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
          margin-bottom:5px;
          margin-top:5px ;
          font-weight:700;
          color:#0f172a;
          font-size:18px;
          text-align: left;
          width: 100%;
        }
          

        .field { 
          // margin-bottom:5px; 
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

        .controls { 
          display:flex; 
          gap:10px; 
          margin-top:10px; 
          flex-wrap:wrap; 
        }

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

       .submit-row { 
  display: flex; 
  gap: 12px; 
  margin-top: 14px; 
  align-items: center; 
  justify-content: flex-end;   /* ✅ RIGHT ALIGN */
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
          margin-top: 10px;
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

        /* dropdown modal (glass) */
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
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          position: relative;
          align-self: center;
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

        /* form grid */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(4, 3fr);
          gap: 1rem ;
          margin-bottom: 16px;
          align-items: start;
        }
        .full-width {
          grid-column: 1 / -1;
        }

        /* checkbox styles */
        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .checkbox.checked {
          background: var(--accent);
          border-color: var(--accent);
        }
        .checkbox.checked::after {
          content: '✓';
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        .checkbox-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          user-select: none;
        }
        .checkbox-group:hover .checkbox:not(.checked) {
          border-color: var(--accent);
        }

        /* Custom styles for browse buttons with search icon */
        .browse-btn {
          padding: 10px 12px;
          background: linear-gradient(180deg, var(--accent), var(--accent-2));
          border: 1px solid var(--accent);
          border-radius: 10px;
          cursor: pointer;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 42px;
          height: 42px;
          transition: all 0.2s;
          border: none;
        }
        
        .browse-btn:hover {
          background: linear-gradient(180deg, var(--accent-2), var(--accent-3));
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(48, 122, 200, 0.2);
        }
        
        .browse-btn:disabled {
          background: #cbd5e1;
          border-color: #cbd5e1;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
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

        /* Clear button styling */
        .input-clear-btn {
          position: absolute;
          right: 40px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          padding: 4px 8px;
          cursor: pointer;
          color: var(--muted);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 1;
        }

        .input-clear-btn:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.05);
          color: var(--accent);
          opacity: 1;
        }

        .input-clear-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Compact Max & Min fields layout */
        .field .row input[placeholder="Max"],
        .field .row input[placeholder="Min"] {
          text-align: center;
          padding: 10px 8px;
          min-width: 80px;
        }

        /* Tips panel */
        .tips-panel {
          background: linear-gradient(180deg, rgba(240, 249, 255, 0.7), rgba(240, 249, 255, 0.5));
          border: 1px solid rgba(173, 216, 230, 0.3);
        }

        /* Type dropdown open state */
        .select[open] {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }

        /* Remove spinner buttons from number inputs */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }

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
            gap: 16px;
          }
          .field .row input[placeholder="Max"],
          .field .row input[placeholder="Min"] {
            min-width: 70px;
            padding: 8px 6px;
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
          .btn, .browse-btn {
            padding: 8px 10px;
            min-width: 38px;
            font-size: 13px;
            height: 38px;
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
          .field .row input[placeholder="Max"],
          .field .row input[placeholder="Min"] {
            min-width: 60px;
            padding: 8px 4px;
            font-size: 13px;
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
        
        /* Better focus styles for keyboard navigation */
        input:focus, 
        select:focus, 
        textarea:focus, 
        .checkbox-group:focus,
        button:focus,
        .submit-primary:focus,
        .submit-clear:focus {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }

        .tree-row:focus {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
          background: linear-gradient(90deg, rgba(74,222,128,0.1), rgba(74,222,128,0.05));
        }
          /* Add to your existing CSS */
.checkbox-popup-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.checkbox-popup-item:hover {
  background-color: #f9fafb;
}

.checkbox-popup-item.selected {
  background-color: #f0f9ff;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.custom-checkbox.checked {
  background-color: #307AC8;
  border-color: #307AC8;
}

.select-all-checkbox {
  margin-bottom: 12px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}
      `}</style>

      <div className="dashboard" aria-labelledby="item-title">
        <div className="top-row">
          <div className="title-block">
            <svg width="38" height="38" viewBox="0 0 24 24" aria-hidden focusable="false">
              <rect width="24" height="24" rx="6" fill="#eff6ff" />
              <path d="M6 12h12M6 8h12M6 16h12" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h2 id="item-title">Item Creation</h2>
              <div className="subtitle muted">Create, edit, or delete items </div>
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
                e.currentTarget.blur();   // ✅ REMOVE focus from Edit button
                changeActionType('edit');
                setIsPopupOpen(true);
              }}
              disabled={isSubmitting || !formPermissions.edit}
              isActive={actionType === 'edit'}
            />


            <DeleteButton
              onClick={(e) => {
                e.currentTarget.blur();   // ✅ CRITICAL
                changeActionType('delete');
                setIsPopupOpen(true);
              }}
              disabled={isSubmitting || !formPermissions.delete}
              isActive={actionType === 'delete'}
            />
          </div>

        <div className="grid" role="main">
          <div className="card" aria-live="polite" onKeyDown={handleKeyNavigation}>
            
            {/* Two Column Layout: Left and Right */}
            <div style={{ display: "grid", gridTemplateColumns: "30% 60% ", gap: "32px", alignItems: "start" }}>
              
              {/* LEFT COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", }}>
                
                {/* Item Name field */}
                <div className="field">
                  <label className="field-label">Item Name <span className="asterisk">*</span></label>
                  <div className="row" style={{ display: "flex", alignItems: "stretch", gap: "0" }}>
                    <div style={{
                      display: "flex",
                      flex: 1,
                      border: "1px solid rgba(15,23,42,0.06)",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "linear-gradient(180deg, #fff, #fbfdff)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}>
                      <input
                        ref={itemNameRef}
                        className="input"
                        value={formData.itemName}
                        onChange={(e) => handleChange('itemName', e.target.value)}
                        disabled={isSubmitting || isDeleteMode}
                        aria-label="Item Name"
                        style={{
                          flex: 1,
                          border: "none",
                          borderRadius: 0,
                          padding: "10px 12px",
                          minWidth: "120px",
                          fontSize: "14px",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Group Name field */}
                <div className="field">
                  <label className="field-label">Group Name <span className="asterisk">*</span></label>
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
                        ref={groupNameRef}
                        className="input"
                        value={mainGroup}
                        onChange={(e) => {
                          setMainGroup(e.target.value);
                          // Open tree when typing
                          if (e.target.value.trim() && !isTreeOpen) {
                            setIsTreeOpen(true);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            setIsTreeOpen(true); // Tree opens ONLY on Enter
                            // Focus first visible node
                            setTimeout(() => {
                              const firstNode = document.querySelector(".tree-row");
                              firstNode?.focus();
                            }, 50);
                          }
                          // Open tree when typing letters/numbers
                          else if (/^[a-zA-Z0-9]$/.test(e.key) && !isTreeOpen) {
                            setIsTreeOpen(true);
                          }
                        }}
                        disabled={isSubmitting || isDeleteMode}
                        readOnly={true}
                        aria-label="Group Name"
                        style={{
                          flex: 1,
                          border: "none",
                          borderRadius: "0",
                          padding: "10px 12px",
                          minWidth: "0",
                          fontSize: "14px",
                          outline: "none",
                          cursor: "pointer"
                        }}
                      />
                      <button
                        onClick={() => { if (!isDeleteMode && !isSubmitting) setIsTreeOpen(!isTreeOpen); }}
                        disabled={isSubmitting || isDeleteMode}
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

                          <div
                            className="tree-scroll"
                            role="tree"
                            aria-label="Group list"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setIsTreeOpen(false);
                                groupNameRef.current?.focus(); // Return focus to input
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
                                    setIsTreeOpen(false);
                                    // Focus short name field after selection
                                    setTimeout(() => {
                                      shortNameRef.current?.focus();
                                    }, 10);
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
                        <div
                          className="tree-scroll"
                          role="tree"
                          aria-label="Group list"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setIsTreeOpen(false);
                              groupNameRef.current?.focus(); // Return focus to input
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
                                  setIsTreeOpen(false);
                                  // Focus short name field after selection
                                  setTimeout(() => {
                                    shortNameRef.current?.focus();
                                  }, 10);
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
                    )
                  )}
                </div>

                {/* Short Name field */}
                <div className="field">
                  <label className="field-label">Short Name</label>
                  <div className="row" style={{ display: "flex", alignItems: "stretch", gap: "0" }}>
                    <div style={{
                      display: "flex",
                      flex: 1,
                      border: "1px solid rgba(15,23,42,0.06)",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "linear-gradient(180deg, #fff, #fbfdff)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}>
                      <input
                        ref={shortNameRef}
                        className="input"
                        value={formData.shortName}
                        onChange={(e) => handleChange('shortName', e.target.value)}
                        disabled={isSubmitting || isDeleteMode}
                        aria-label="Short Name"
                        style={{
                          flex: 1,
                          border: "none",
                          borderRadius: 0,
                          padding: "10px 12px",
                          minWidth: "120px",
                          fontSize: "14px",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-grid">
                  {/* Brand */}
              <div className="field">
                <label className="field-label">Brand</label>
                <div className="input-with-search">
                  <input
                    ref={brandRef}
                    className="input"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    onClick={() => setIsBrandPopupOpen(true)}
                    onKeyDown={(e) => handlePopupFieldKeyPress('brand', e)}
                    onFocus={() => setActiveField('brand')}
                    onBlur={() => setActiveField(null)}
                    disabled={isSubmitting || isDeleteMode}
                    readOnly
                    aria-label="Brand"
                  />
                  {formData.brand && activeField === 'brand' && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, brand: '' }));
                        setFieldCodes(prev => ({ ...prev, brandCode: '' }));
                      }}
                      title="Clear brand selection"
                      disabled={isSubmitting}
                      aria-label="Clear brand"
                    >

                    </button>
                  )}
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
                <div>
                  <PopupScreenModal screenIndex={2}/>
                  </div>
              </div>

              {/* Category */}
              <div className="field">
                <label className="field-label">Category</label>
                <div className="input-with-search">
                  <input
                    ref={categoryRef}
                    className="input"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    onClick={() => setIsCategoryPopupOpen(true)}
                    onKeyDown={(e) => handlePopupFieldKeyPress('category', e)}
                    onFocus={() => setActiveField('category')}
                    onBlur={() => setActiveField(null)}
                    disabled={isSubmitting || isDeleteMode}
                    readOnly
                    aria-label="Category"
                  />
                  {formData.category && activeField === 'category' && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, category: '' }));
                        setFieldCodes(prev => ({ ...prev, categoryCode: '' }));
                      }}
                      title="Clear category selection"
                      disabled={isSubmitting}
                      aria-label="Clear category"
                    >

                    </button>
                  )}
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Product */}
              <div className="field">
                <label className="field-label">Product</label>
                <div className="input-with-search">
                  <input
                    ref={productRef}
                    className="input"
                    value={formData.product}
                    onChange={(e) => handleChange('product', e.target.value)}
                    onClick={() => setIsProductPopupOpen(true)}
                    onKeyDown={(e) => handlePopupFieldKeyPress('product', e)}
                    onFocus={() => setActiveField('product')}
                    onBlur={() => setActiveField(null)}
                    disabled={isSubmitting || isDeleteMode}
                    readOnly
                    aria-label="Product"
                  />
                  {formData.product && activeField === 'product' && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, product: '' }));
                        setFieldCodes(prev => ({ ...prev, productCode: '' }));
                      }}
                      title="Clear product selection"
                      disabled={isSubmitting}
                      aria-label="Clear product"
                    >

                    </button>
                  )}
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Model */}
              <div className="field">
                <label className="field-label">Model</label>
                <div className="input-with-search">
                  <input
                    ref={modelRef}
                    className="input"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    onClick={() => setIsModelPopupOpen(true)}
                    onKeyDown={(e) => handlePopupFieldKeyPress('model', e)}
                    onFocus={() => setActiveField('model')}
                    onBlur={() => setActiveField(null)}
                    disabled={isSubmitting || isDeleteMode}
                    readOnly
                    aria-label="Model"
                  />
                  {formData.model && activeField === 'model' && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, model: '' }));
                        setFieldCodes(prev => ({ ...prev, modelCode: '' }));
                      }}
                      title="Clear model selection"
                      disabled={isSubmitting}
                      aria-label="Clear model"
                    >

                    </button>
                  )}
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="field">
                <label className="field-label">Size<span className="asterisk">*</span></label>
                <div className="input-with-search">
                  <input
                    ref={sizeRef}
                    className="input"
                    value={formData.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                    onClick={() => setIsSizePopupOpen(true)}
                    onKeyDown={(e) => handlePopupFieldKeyPress('size', e)}
                    onFocus={() => setActiveField('size')}
                    onBlur={() => setActiveField(null)}
                    disabled={isSubmitting || isDeleteMode}
                    readOnly
                    aria-label="Size"
                  />
                  {formData.size && activeField === 'size' && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, size: '' }));
                        setFieldCodes(prev => ({ ...prev, sizeCode: '' }));
                      }}
                      title="Clear size selection"
                      disabled={isSubmitting}
                      aria-label="Clear size"
                    >
                      <Icon.Close size={14} />
                    </button>
                  )}
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Units */}
              <div className="field">
                <label className="field-label">
                  Units
                  <span className="asterisk">*</span>
                </label>
                <div className="input-with-search">
                  <input
                    ref={unitRef}
                    className="input"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    onClick={() => { if (!isDeleteMode && !isSubmitting) setIsUnitPopupOpen(true); }}
                    onKeyDown={(e) => handlePopupFieldKeyPress('unit', e)}
                    onFocus={() => setActiveField('unit')}
                    onBlur={() => setActiveField(null)}
                    disabled={isSubmitting || isDeleteMode}
                    readOnly
                    aria-label="Units"
                    required
                  />
                  {formData.unit && activeField === 'unit' && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, unit: '' }));
                        setFieldCodes(prev => ({ ...prev, unitCode: '' }));
                      }}
                      title="Clear unit selection"
                      disabled={isSubmitting}
                      aria-label="Clear unit"
                    >

                    </button>
                  )}
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* LEFT SIDE: Min */}
              <div className="field">
                <label className="field-label">Min</label>
                <input
                  ref={minRef}
                  className="input"
                  value={formData.min}
                  onChange={(e) => handleChange('min', e.target.value)}

                  disabled={isSubmitting || isDeleteMode}
                  aria-label="Min"
                  style={{ textAlign: "center", width: 300 }}
                />
              </div>

              {/* RIGHT SIDE: Max */}
              <div className="field">
                <label className="field-label">Max</label>
                <input
                  ref={maxRef}
                  className="input"
                  value={formData.max}
                  onChange={(e) => handleChange('max', e.target.value)}

                  disabled={isSubmitting || isDeleteMode}
                  aria-label="Max"
                  style={{ textAlign: "center", width: 300 }}
                />
              </div>

              {/* LEFT SIDE: HSN Code */}
              <div className="field">
                <label className="field-label">
                  HSN Code
                  {/* <span className="asterisk">*</span> */}
                </label>
                <input
                  ref={hsnCodeRef}
                  className="input"
                  value={formData.hsnCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow any combination: only letters, only digits, or alphanumeric
                    if (/^[a-zA-Z0-9]{0,20}$/.test(value)) {
                      handleChange('hsnCode', value.toUpperCase());
                    }
                  }}
                  disabled={isSubmitting || isDeleteMode}
                  aria-label="HSN Code"
                  title="Alphanumeric HSN Code (max 20 characters)"
                  style={{ textAlign: "center", width: 300 }}
                  required
                />
              </div>
              {/* RIGHT SIDE: Type Dropdown - MOVED to replace Piece Rate */}
              <div className="field">
                <label className="field-label">
                  Type <span className="asterisk">*</span>
                </label>
                <select
                  ref={typeRef}
                  className="select"
                  value={formData.type}
                  onChange={(e) => {
                    handleChange('type', e.target.value);
                    e.target.size = 0; // Close dropdown after selection
                  }}
                  onKeyDown={(e) => {
                    const selectElement = e.target;
                    const options = selectElement.options;
                    const selectedIndex = selectElement.selectedIndex;

                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Toggle dropdown on Enter
                      if (selectElement.size === 0) {
                        selectElement.size = 3; // 3 options: empty placeholder + scrap + finished
                      } else {
                        selectElement.size = 0; // Close dropdown
                        handleChange('type', selectElement.value);
                      }
                    }
                    else if (e.key === 'ArrowDown') {
                      e.preventDefault();

                      if (selectElement.size === 0) {
                        // If dropdown is closed, open it first
                        selectElement.size = 3; // 3 options: empty placeholder + scrap + finished
                        return;
                      }

                      // Move down through options
                      let newIndex;
                      if (selectedIndex === options.length - 1) {
                        newIndex = 0; // Wrap to first option
                      } else {
                        newIndex = selectedIndex + 1;
                      }

                      // Update selection
                      selectElement.selectedIndex = newIndex;
                      handleChange('type', options[newIndex].value);
                    }
                    else if (e.key === 'ArrowUp') {
                      e.preventDefault();

                      if (selectElement.size === 0) {
                        // If dropdown is closed, open it first
                        selectElement.size = 3; // 3 options: empty placeholder + scrap + finished
                        return;
                      }

                      // Move up through options
                      let newIndex;
                      if (selectedIndex <= 0) {
                        newIndex = options.length - 1; // Wrap to last option
                      } else {
                        newIndex = selectedIndex - 1;
                      }

                      // Update selection
                      selectElement.selectedIndex = newIndex;
                      handleChange('type', options[newIndex].value);
                    }
                  }}
                  onBlur={(e) => {
                    // Close dropdown when losing focus
                    e.target.size = 0;
                  }}
                  onClick={(e) => {
                    // Toggle dropdown on click
                    if (e.target.size === 0) {
                      e.target.size = 3; // 3 options: empty placeholder + scrap + finished
                    } else {
                      e.target.size = 0;
                    }
                  }}
                  size={0}
                  disabled={isSubmitting || isDeleteMode}
                  aria-label="Type"
                  style={{ textAlign: "center", width: 300 }}
                  required // This makes it mandatory for HTML form validation
                >
                  <option value="" disabled selected>
                    {/* Empty placeholder */}
                  </option>
                  <option value="SC">Scrap Product</option>
                  <option value="FG">Finished Product</option>
                </select>
              </div>
             

              {/* RIGHT SIDE: GST% */}
<div className="field">
  <label className="field-label">
    GST% 
  </label>

  <input
    ref={gstinRef}
    className="input"
    value={formData.gstin}
    onChange={(e) => {
      const value = e.target.value;

      // allow only numbers
      if (/^\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, gstin: value }));
        setMessage(null); // clear old error while typing
      }
    }}
    onBlur={() => {
      // ❌ BLOCK if GST not in API
      if (formData.gstin && !isValidGSTFromAPI(formData.gstin)) {
        setMessage({
          type: "error",
          text: `Invalid GST%. Allowed values: ${taxList.map(t => t.value).join(', ')}`
        });

        // 🔥 FORCE FOCUS BACK TO GST INPUT
        setTimeout(() => gstinRef.current?.focus(), 0);
      }
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        // ❌ STOP moving to next field if GST is provided but invalid
        // Allow empty GST (optional field)
        if (formData.gstin && !isValidGSTFromAPI(formData.gstin)) {
          e.preventDefault();
          e.stopPropagation();

          setMessage({
            type: "error",
            text: `Invalid GST%. Allowed values: ${taxList.map(t => t.value).join(', ')}`
          });

          gstinRef.current?.focus();
          return;
        }
      }
    }}
    disabled={isSubmitting || isDeleteMode}
    aria-label="GST Percentage"
    style={{ textAlign: "center", width: 300 }}
    required
  />
</div>



              {/* LEFT SIDE: Manual Prefix Checkbox */}
              <div className="field">
                <div
                  className="checkbox-group"
                  onClick={() => { if (!isDeleteMode) handleManualPrefixToggle(); }}
                  onKeyDown={(e) => {
                    if (!isDeleteMode && e.key === ' ') {
                      e.preventDefault();
                      handleManualPrefixToggle();
                    }
                  }}
                  role="checkbox"
                  tabIndex={isDeleteMode ? -1 : 0}
                  aria-checked={manualPrefixChecked}
                  aria-disabled={isDeleteMode}
                >
                  <div
                    className={`checkbox ${manualPrefixChecked ? 'checked' : ''}`}
                  />
                  <span className="checkbox-label">Manual Prefix</span>
                </div>
              </div>

              {/* RIGHT SIDE: Prefix */}
              <div className="field">
                <label className="field-label">Prefix</label>
                <input
                  ref={prefixRef}
                  className="input"
                  value={formData.prefix}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      handleChange('prefix', e.target.value);
                    }
                  }}

                  disabled={isSubmitting || !manualPrefixChecked || isDeleteMode}
                  aria-label="Prefix"
                  style={{ textAlign: "center", width: 300 }}
                />
              </div>

              {/* LEFT SIDE: Cost Price - Changed to text input with validation */}
              <div className="field">
                <label className="field-label">Cost Price</label>
                <input
                  ref={costPriceRef}
                  className="input"
                  value={formData.costPrice}
                  onChange={(e) => {
                    // Allow only numbers and decimal point
                    const value = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      handleChange('costPrice', value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();

                      // Move to Selling Price field
                      sellingPriceRef.current?.focus();
                    }
                  }}
                  disabled={isSubmitting || isDeleteMode}
                  aria-label="Cost Price"
                  style={{ textAlign: "center", width: 300 }}
                  // Use text type instead of number to remove spinners
                  type="text"
                  inputMode="decimal"
                />
              </div>

              {/* RIGHT SIDE: Selling Price - Changed to text input with validation */}
              <div className="field">
                <label className="field-label">Selling Price</label>
                <input
                  ref={sellingPriceRef}
                  className="input"
                  value={formData.sellingPrice}
                  onChange={(e) => {
                    // Allow only numbers and decimal point
                    const value = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      handleChange('sellingPrice', value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation(); // 🔥 REQUIRED

                      // Validation
                      if (!formData.itemName) {
                        setMessage({ type: "error", text: 'Please enter Item Name.' });
                        itemNameRef.current?.focus();
                        return;
                      }

                      if (!mainGroup) {
                        setMessage({ type: "error", text: 'Please select Group Name.' });
                        return;
                      }

                      // Open confirmation dialog
                      if (actionType === 'create') showCreateConfirmation();
                      else if (actionType === 'edit') showEditConfirmation();
                      else if (actionType === 'delete') showDeleteConfirmation();
                    }
                  }}
                  disabled={isSubmitting || isDeleteMode}
                  aria-label="Selling Price"
                  style={{ textAlign: "center", width: 300 }}
                  // Use text type instead of number to remove spinners
                  type="text"
                  inputMode="decimal"
                />
              </div>
              {/* Piece Rate Checkbox - REMOVED (replaced by Type dropdown above) */}
                </div>
              </div>
            </div>

            {/* Message display */}
            {message && (
              <div className={`message ${message.type}`} role="alert">
                {message.text}
              </div>
            )}

            {/* Submit controls - UPDATED with proper ref and Enter handling */}
            <div className="submit-row">
              <button
                ref={submitButtonRef} // ✅ Correct ref name
                className="submit-primary"
                onClick={() => {
                  if (!formData.itemName) {
                    setMessage({ type: "error", text: 'Please enter Item Name.' });
                    itemNameRef.current?.focus();
                    return;
                  }
                  if (!mainGroup) {
                    setMessage({ type: "error", text: 'Please select Group Name.' });
                    return;
                  }

                  // Show confirmation popup based on action type
                  if (actionType === 'create') showCreateConfirmation();
                  else if (actionType === 'edit') showEditConfirmation();
                  else if (actionType === 'delete') showDeleteConfirmation();
                }}
                onKeyDown={(e) => {
                  // ✅ Handle Enter key on Delete button
                  if (e.key === 'Enter' && actionType === 'delete') {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!formData.itemName) {
                      setMessage({ type: "error", text: 'Please enter Item Name.' });
                      itemNameRef.current?.focus();
                      return;
                    }
                    if (!mainGroup) {
                      setMessage({ type: "error", text: 'Please select Group Name.' });
                      return;
                    }

                    showDeleteConfirmation();
                  }
                }}
                disabled={isLoading}
                type="button"
                id="action-button"
              >
                {isLoading ? "Processing..." :
                  actionType === 'create' ? 'Save' :
                    actionType === 'edit' ? 'Update' : 'Delete'}
              </button>
              <button
                className="submit-clear"
                onClick={() => handleClear()}
                disabled={isLoading}
                type="button"
              >
                Clear
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

      {/* Confirmation Popup for Create */}
      <ConfirmationPopup
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={confirmCreate}
        title="Create Item"
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
        title="Update Item"
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
        title="Delete Item"
        message={`Do you want to delete item?`}
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

      {/* PopupListSelector for Brand Selection */}
      <PopupListSelector
        open={isBrandPopupOpen}
        onClose={() => {
          setIsBrandPopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, brand: '' }));
        }}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, brand: item.fname || '' }));
          setFieldCodes(prev => ({ ...prev, brandCode: item.fcode || '' }));
          setIsBrandPopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, brand: '' }));
        }}
        fetchItems={fetchBrandsWithSearch}
        title="Select Brand"
        displayFieldKeys={['fname']}  // CHANGED: Show only name, not code
        searchFields={['fname', 'fcode']}
        headerNames={['Brand Name']}  // CHANGED: Single header for name only
        columnWidths={{ fname: '100%' }}  // CHANGED: Full width for name
        maxHeight="60vh"
        responsiveBreakpoint={640}
        initialSearch={initialPopupSearch.brand}
      />

      {/* PopupListSelector for Category Selection */}
      <PopupListSelector
        open={isCategoryPopupOpen}
        onClose={() => {
          setIsCategoryPopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, category: '' }));
        }}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, category: item.fname || '' }));
          setFieldCodes(prev => ({ ...prev, categoryCode: item.fcode || '' }));
          setIsCategoryPopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, category: '' }));
        }}
        fetchItems={fetchCategoriesWithSearch}
        title="Select Category"
        displayFieldKeys={['fname']}  // CHANGED: Show only name, not code
        searchFields={['fname', 'fcode']}
        headerNames={['Category Name']}  // CHANGED: Single header for name only
        columnWidths={{ fname: '100%' }}  // CHANGED: Full width for name
        maxHeight="60vh"
        responsiveBreakpoint={640}
        initialSearch={initialPopupSearch.category}
      />

      <PopupListSelector
  open={isTaxPopupOpen}
  onClose={() => setIsTaxPopupOpen(false)}
  onSelect={(item) => {
    setFormData(prev => ({ ...prev, gstin: item.value }));
    setIsTaxPopupOpen(false);
  }}
  fetchItems={async () => taxList}
  title="Select GST Percentage"
  displayFieldKeys={['label']}
  searchFields={['label']}
  headerNames={['GST %']}
  columnWidths={{ label: '100%' }}
  maxHeight="50vh"
/>


      {/* PopupListSelector for Product Selection */}
      <PopupListSelector
        open={isProductPopupOpen}
        onClose={() => {
          setIsProductPopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, product: '' }));
        }}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, product: item.fname || '' }));
          setFieldCodes(prev => ({ ...prev, productCode: item.fcode || '' }));
          setIsProductPopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, product: '' }));
        }}
        fetchItems={fetchProductsWithSearch}
        title="Select Product"
        displayFieldKeys={['fname']}  // CHANGED: Show only name, not code
        searchFields={['fname', 'fcode']}
        headerNames={['Product Name']}  // CHANGED: Single header for name only
        columnWidths={{ fname: '100%' }}  // CHANGED: Full width for name
        maxHeight="60vh"
        responsiveBreakpoint={640}
        initialSearch={initialPopupSearch.product}
      />
      {/* PopupListSelector for Model Selection */}
      <PopupListSelector
        open={isModelPopupOpen}
        onClose={() => {
          setIsModelPopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, model: '' }));
        }}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, model: item.fname || '' }));
          setFieldCodes(prev => ({ ...prev, modelCode: item.fcode || '' }));
          setIsModelPopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, model: '' }));
        }}
        fetchItems={fetchModelsWithSearch}
        title="Select Model"
        displayFieldKeys={['fname']}  // CHANGED: Show only name, not code
        searchFields={['fname', 'fcode']}
        headerNames={['Model Name']}  // CHANGED: Single header for name only
        columnWidths={{ fname: '100%' }}  // CHANGED: Full width for name
        maxHeight="60vh"
        responsiveBreakpoint={640}
        initialSearch={initialPopupSearch.model}
      />
      {/* PopupListSelector for Size Selection */}
      <CheckboxPopup
        open={isSizePopupOpen}
        initialSelectedCodes={selectedSizes.map(s => s.fcode)}
        onClose={() => {
          setIsSizePopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, size: '' }));
        }}
        onSelect={(items) => {
          // CheckboxPopup now returns an array of selected items
          const sel = Array.isArray(items) ? items : (items ? [items] : []);
          // persist selection so reopening the popup shows previous choices
          setSelectedSizes(sel);
          const names = sel.map(it => it.fname || it.fsize || it.name || '').filter(Boolean).join(', ');
          const codes = sel.map(it => it.fcode || '').filter(Boolean).join(',');
          setFormData(prev => ({ ...prev, size: names }));
          setFieldCodes(prev => ({ ...prev, sizeCode: codes }));
          setIsSizePopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, size: '' }));
          // Move focus to Units input after popup closes
          setTimeout(() => {
            unitRef.current?.focus();
          }, 10);
        }}
        fetchItems={fetchSizesWithSearch}
        title="Select Size"
        maxHeight="60vh"
        variant="size"
        autoFocusOk={true}
      />


      {/* PopupListSelector for Unit Selection */}
      <PopupListSelector
        open={isUnitPopupOpen}
        onClose={() => {
          setIsUnitPopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, unit: '' }));
        }}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, unit: item.fname || '', unitCode: item.fcode || '' }));
          setIsUnitPopupOpen(false);
          setInitialPopupSearch(prev => ({ ...prev, unit: '' }));
        }}
        fetchItems={fetchUnitsWithSearch}
        title="Select Unit"
        displayFieldKeys={['fname']}  // CHANGED: Show only name, not code
        searchFields={['fname', 'fcode']}
        headerNames={['Unit Name']}  // CHANGED: Single header for name only
        columnWidths={{ fname: '100%' }}  // CHANGED: Full width for name
        maxHeight="60vh"
        responsiveBreakpoint={640}
        initialSearch={initialPopupSearch.unit}
      />

      {/* PopupListSelector for Edit/Delete actions - FIXED VERSION */}
      <PopupListSelector
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSelect={(item) => {
          // Map backend fields to form fields, always use fSubItemName for Item Name
          setFormData(prev => ({
            ...prev,
            fitemCode: item.fItemcode || '',
            itemName: item.fSubItemName || '',
            groupName: item.fParent || '',
            shortName: item.fShort || '',
            brand: item.brand || '',
            category: item.category || '',
            product: item.product || '',
            model: item.model || '',
            size: item.size || '',
            max: item.fmax || item.fMax || '',
            min: item.fmin || item.fMin || '',
            prefix: item.fPrefix || '',
            gstin: item.ftax || '',
            gst: (item.gstcheckbox === 'Y' || (item.ftax && item.ftax !== '')) ? 'Y' : 'N',
            manualprefix: item.manualprefix === 'Y' ? 'Y' : 'N',
            hsnCode: item.fhsn || '',
            pieceRate: item.pieceRate || item.fPieceRate || 'N',
            type: item.ftype || '',
            sellingPrice: item.fSellPrice || '',
            costPrice: item.fCostPrice || '',
            unit: item.fUnits || '',
            unitCode: item.funitcode || '',
          }));
          setFieldCodes(prev => ({
            ...prev,
            brandCode: item.fbrand || '',
            categoryCode: item.fcategory || '',
            productCode: item.fproduct || '',
            modelCode: item.fmodel || '',
            sizeCode: item.fsize || '',
            unitCode: item.funitcode || '',
          }));
          // Set checkbox states
          const hasGst = item.gstcheckbox === 'Y' || (item.ftax && item.ftax !== '');
          setGstChecked(hasGst);
          setManualPrefixChecked(item.manualprefix === 'Y');
          const hasPieceRate = item.pieceRate === 'Y' || item.fPieceRate === 'Y';
          setPieceRateChecked(hasPieceRate);
          setMainGroup(item.fParent || '');
          setIsPopupOpen(false);
          if (actionType === 'delete') {
            setTimeout(() => {
              if (submitButtonRef.current) {
                submitButtonRef.current.focus();
              }
            }, 100);
          } else {
            setTimeout(() => {
              itemNameRef.current?.focus();
            }, 50);
          }
        }}
        fetchItems={fetchPopupItems}
        title={`Select Item to ${actionType === 'edit' ? 'Edit' : 'Delete'}`}
        displayFieldKeys={['fItemName', 'fParent']}
        searchFields={['fItemName', 'fParent']}
        headerNames={['Item Name', 'Group']}
        columnWidths={{ fItemName: '70%', fParent: '30%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />
    </div>
  );
};

export default ItemCreation;