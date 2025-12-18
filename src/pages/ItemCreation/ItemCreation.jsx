import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import axios from 'axios';
import { API_ENDPOINTS } from "../../api/endpoints";
import apiService from "../../api/apiService";
import { AddButton, EditButton, DeleteButton } from '../../components/Buttons/ActionButtons';

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
function TreeNode({ node, level = 0, onSelect, expandedKeys, toggleExpand, selectedKey }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedKeys.has(node.key);
  const isSelected = selectedKey === node.key;

  return (
    <div className="tree-node" style={{ paddingLeft: `${12 + level * 16}px` }}>
      <div
        className={`tree-row ${isSelected ? "selected" : ""}`}
        onClick={() => onSelect(node)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onSelect(node)}
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
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [mainGroup, setMainGroup] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [actionType, setActionType] = useState('create');
  const [searchTree, setSearchTree] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [message, setMessage] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  
  // Confirmation Popup States
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

  // Search terms for each popup
  const [brandSearch, setBrandSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [sizeSearch, setSizeSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');

  // State to track which popup has initial search text
  const [popupInitialSearch, setPopupInitialSearch] = useState({
    brand: '',
    category: '',
    product: '',
    model: '',
    size: '',
    unit: ''
  });

  // State to track if we should simulate typing in popup
  const [simulatePopupTyping, setSimulatePopupTyping] = useState({
    brand: false,
    category: false,
    product: false,
    model: false,
    size: false,
    unit: false
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

  // Get permissions for this form
  const formPermissions = useMemo(() => ({ add: true, edit: true, delete: true }), []);

  // Auto-focus Group Name on component mount
  useEffect(() => {
    if (groupNameRef.current) {
      groupNameRef.current.focus();
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
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setMessage({ type: "error", text: "Failed to load data. Please check your connection." });
    } finally {
      setLoading(false);
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

const handleEnterNavigation = (e) => {
  if (e.key !== 'Enter') return;

  const target = e.target;
  const tag = target.tagName;
  const type = target.type;

  // ❌ Let normal typing work inside text inputs
  if (
    tag === 'INPUT' &&
    !['checkbox', 'radio'].includes(type)
  ) {
    e.preventDefault();
  }

  try {
    const container = e.currentTarget;
    if (!container) return;

    // ✅ ONLY real form fields (NO buttons)
    const selectors =
      'input:not([type="hidden"]):not([disabled]), ' +
      'select:not([disabled]), ' +
      'textarea:not([disabled]), ' +
      '.checkbox-group';

    const elements = Array.from(container.querySelectorAll(selectors))
      .filter(el => el.offsetParent !== null);

    if (!elements.length) return;

    const active = document.activeElement;
    const index = elements.indexOf(active);

    // ✅ If there is a next field → move
    if (index >= 0 && index < elements.length - 1) {
      elements[index + 1].focus();
      return;
    }

    // ✅ LAST FIELD → focus UPDATE / SAVE button
    if (index === elements.length - 1) {
      const submitBtn = document.querySelector('.submit-primary');
      submitBtn?.focus();
    }
  } catch (err) {
    console.warn('Enter navigation error', err);
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

  // Validation function
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

    // Validate GSTIN
    if (gstChecked && formData.gstin) {
      const allowedGSTValues = ['3', '5', '12', '18', '28'];
      if (!allowedGSTValues.includes(formData.gstin)) {
        setMessage({ type: "error", text: 'Only 3, 5, 12, 18, or 28 are allowed for GST%.' });
        gstinRef.current?.focus();
        return false;
      }
    }

    // Validate HSN Code
    if (formData.hsnCode && !/^\d{4,8}$/.test(formData.hsnCode)) {
      setMessage({ type: "error", text: 'HSN Code should be 4-8 digits.' });
      hsnCodeRef.current?.focus();
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

  // Show confirmation popup
  const showConfirmationPopup = (action, data = null) => {
    setConfirmAction(action);
    setConfirmData(data);
    setShowConfirmPopup(true);
  };

  // Handle confirmation from popup
  const handleConfirmAction = async () => {
    setShowConfirmPopup(false);
    
    if (confirmAction === 'clear') {
      handleClear();
      return;
    }
    
    // For save, update, delete actions, proceed with validation and submission
    if (!validateForm()) {
      return;
    }

    // Check permissions based on action type
    if (actionType === 'create' && !formPermissions.add) {
      setMessage({ type: "error", text: "You don't have permission to create items." });
      return;
    }
    if (actionType === 'edit' && !formPermissions.edit) {
      setMessage({ type: "error", text: "You don't have permission to edit items." });
      return;
    }
    if (actionType === 'delete' && !formPermissions.delete) {
      setMessage({ type: "error", text: "You don't have permission to delete items." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // Prepare request data matching API expected field names
      const requestData = {
        fitemCode: formData.fitemCode || '',
        fitemName: formData.itemName || '',
        groupName: mainGroup || '',
        shortName: formData.shortName || '',
        fbrand: fieldCodes.brandCode || '',
        fcategory: fieldCodes.categoryCode || '',
        fproduct: fieldCodes.productCode || '',
        fmodel: fieldCodes.modelCode || '',
        fsize: fieldCodes.sizeCode || '',
        fmax: formData.max || '',
        fmin: formData.min || '',
        prefix: formData.prefix || '',
        gstNumber: formData.gstin || '',
        gst: formData.gst === 'Y' ? 'Y' : 'N',
        manualprefix: formData.manualprefix === 'Y' ? 'Y' : 'N',
        hsnCode: formData.hsnCode || '',
        pieceRate: formData.pieceRate === 'Y' ? 'Y' : 'N',
        ftype: formData.type || '',
        fSellPrice: formData.sellingPrice || '',
        fCostPrice: formData.costPrice || '',
        fUnits: formData.unit || '',
      };

      console.log('Submitting data:', requestData);

      let response;
      
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
          break;
          
        case 'edit':
          response = await apiService.put(API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.putEdit, requestData);
          break;
          
        case 'delete':
          response = await apiService.del(API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.delete(formData.fitemCode));
          break;

        default:
          setMessage({ type: "error", text: 'Invalid action type' });
          setIsSubmitting(false);
          return;
      }

      // Refresh tree data
      await fetchTreeData();
      handleClear();
      
    } catch (error) {
      console.error('Submit error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data || 'An unexpected server error occurred.';

        if (status === 409) {
          setMessage({ type: "error", text: 'Concurrent modification detected. Please refresh and try again.' });
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
      setIsSubmitting(false);
    }
  };

  // Fetch function used by PopupListSelector for Edit/Delete - UPDATED
 const fetchPopupItems = useCallback(async (page = 1, search = '') => {
  try {
    const response = await apiService.get(
      API_ENDPOINTS.ITEM_CREATION_ENDPOINTS.getDropdown
    );
    
    if (response.data && Array.isArray(response.data)) {
      // Filter by search term on frontend if needed
      let filteredData = response.data;
      if (search) {
        filteredData = response.data.filter(item => 
          (item.fItemName || '').toLowerCase().includes(search.toLowerCase()) ||
          (item.fParent || '').toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Apply pagination on frontend
      const startIndex = (page - 1) * 10;
      const paginatedData = filteredData.slice(startIndex, startIndex + 10);
      
      // Map backend response to include all necessary fields
      return paginatedData.map((it) => ({
        fItemcode: it.fItemcode || '',
        fItemName: it.fItemName || '',
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
        // ADDED: Piece rate field
        pieceRate: it.pieceRate || it.fPieceRate || 'N',
        fPieceRate: it.fPieceRate || it.pieceRate || 'N',
        brand: it.brand || '',
        category: it.category || '',
        model: it.model || '',
        size: it.size || '',
        product: it.product || '',
        gstcheckbox: it.gstcheckbox || (it.ftax && it.ftax !== '' ? 'Y' : 'N')
      }));
    }
    
    return [];
  } catch (err) {
    console.error('fetchPopupItems error', err);
    return [];
  }
}, []);

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

  // NEW: Handle keyboard typing in popup fields - SIMPLIFIED APPROACH
  const handlePopupFieldKeyPress = (field, e) => {
    const key = e.key;
    
    // Only handle letter keys (a-z, A-Z) and number keys (0-9)
    if (key.length === 1 && /^[a-zA-Z0-9]$/.test(key)) {
      e.preventDefault();
      
      // Store the typed key
      setPopupInitialSearch(prev => ({
        ...prev,
        [field]: key
      }));
      
      // Set flag to simulate typing
      setSimulatePopupTyping(prev => ({
        ...prev,
        [field]: true
      }));
      
      // Open the appropriate popup
      switch(field) {
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

  // Reset simulate typing flag when popup closes
  useEffect(() => {
    if (!isBrandPopupOpen) {
      setSimulatePopupTyping(prev => ({ ...prev, brand: false }));
    }
    if (!isCategoryPopupOpen) {
      setSimulatePopupTyping(prev => ({ ...prev, category: false }));
    }
    if (!isProductPopupOpen) {
      setSimulatePopupTyping(prev => ({ ...prev, product: false }));
    }
    if (!isModelPopupOpen) {
      setSimulatePopupTyping(prev => ({ ...prev, model: false }));
    }
    if (!isSizePopupOpen) {
      setSimulatePopupTyping(prev => ({ ...prev, size: false }));
    }
    if (!isUnitPopupOpen) {
      setSimulatePopupTyping(prev => ({ ...prev, unit: false }));
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
    setPopupInitialSearch({
      brand: '',
      category: '',
      product: '',
      model: '',
      size: '',
      unit: ''
    });
    // Reset simulate typing flags
    setSimulatePopupTyping({
      brand: false,
      category: false,
      product: false,
      model: false,
      size: false,
      unit: false
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

  // Custom fetch functions that include the initial search
  const fetchBrandsWithSearch = useCallback(async (page = 1, search = '') => {
    // If we're simulating typing and have an initial search, use it
    const effectiveSearch = simulatePopupTyping.brand && popupInitialSearch.brand ? 
      popupInitialSearch.brand + (search || '') : 
      search;
    
    console.log('Fetching brands with search:', effectiveSearch);
    return fetchBrands(page, effectiveSearch);
  }, [fetchBrands, simulatePopupTyping.brand, popupInitialSearch.brand]);

  const fetchCategoriesWithSearch = useCallback(async (page = 1, search = '') => {
    const effectiveSearch = simulatePopupTyping.category && popupInitialSearch.category ? 
      popupInitialSearch.category + (search || '') : 
      search;
    
    console.log('Fetching categories with search:', effectiveSearch);
    return fetchCategories(page, effectiveSearch);
  }, [fetchCategories, simulatePopupTyping.category, popupInitialSearch.category]);

  const fetchProductsWithSearch = useCallback(async (page = 1, search = '') => {
    const effectiveSearch = simulatePopupTyping.product && popupInitialSearch.product ? 
      popupInitialSearch.product + (search || '') : 
      search;
    
    console.log('Fetching products with search:', effectiveSearch);
    return fetchProducts(page, effectiveSearch);
  }, [fetchProducts, simulatePopupTyping.product, popupInitialSearch.product]);

  const fetchModelsWithSearch = useCallback(async (page = 1, search = '') => {
    const effectiveSearch = simulatePopupTyping.model && popupInitialSearch.model ? 
      popupInitialSearch.model + (search || '') : 
      search;
    
    console.log('Fetching models with search:', effectiveSearch);
    return fetchModels(page, effectiveSearch);
  }, [fetchModels, simulatePopupTyping.model, popupInitialSearch.model]);

  const fetchSizesWithSearch = useCallback(async (page = 1, search = '') => {
    const effectiveSearch = simulatePopupTyping.size && popupInitialSearch.size ? 
      popupInitialSearch.size + (search || '') : 
      search;
    
    console.log('Fetching sizes with search:', effectiveSearch);
    return fetchSizes(page, effectiveSearch);
  }, [fetchSizes, simulatePopupTyping.size, popupInitialSearch.size]);

  const fetchUnitsWithSearch = useCallback(async (page = 1, search = '') => {
    const effectiveSearch = simulatePopupTyping.unit && popupInitialSearch.unit ? 
      popupInitialSearch.unit + (search || '') : 
      search;
    
    console.log('Fetching units with search:', effectiveSearch);
    return fetchUnits(page, effectiveSearch);
  }, [fetchUnits, simulatePopupTyping.unit, popupInitialSearch.unit]);

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
        </div>

        <div className="grid" role="main">
          <div className="card" aria-live="polite" onKeyDown={handleEnterNavigation}>
            {/* Group Name field */}
            <div className="field">
              <label className="field-label">Group Name *</label>
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
                    ref={groupNameRef}
                    className="input"
                    value={mainGroup}
                    onChange={(e) => setMainGroup(e.target.value)}
                    onFocus={() => {
                      if (!isInitialFocusRef.current) {
                        setIsTreeOpen(true);
                      }
                      isInitialFocusRef.current = false;
                    }}
                    placeholder="Select Group Name"
                    disabled={isSubmitting}
                    aria-label="Group Name"
                    style={{
                      flex: 1,
                      border: "none",
                      borderRadius: 0,
                      padding: "10px 12px",
                      minWidth: "120px",
                      fontSize: "14px",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  />
                  <button
                    className="btn"
                    onClick={() => { setIsTreeOpen((v) => !v); }}
                    disabled={isSubmitting}
                    type="button"
                    aria-expanded={isTreeOpen}
                    aria-controls="group-tree"
                    style={{
                      flexShrink: 0,
                      border: "none",
                      borderLeft: "1px solid rgba(15,23,42,0.06)",
                      borderRadius: 0,
                      padding: "8px 12px",
                      minWidth: "70px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: "linear-gradient(180deg,#fff,#f8fafc)",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      color: "#0f172a",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background = "linear-gradient(180deg,#f8fafc,#f1f5f9)";
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "linear-gradient(180deg,#fff,#f8fafc)";
                    }}
                  >
                    {isTreeOpen ? "Close" : "Open"}
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

                      <div className="tree-scroll" role="tree" aria-label="Group list">
                        {loading ? (
                          <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>Loading...</div>
                        ) : filteredTree.length === 0 ? (
                          <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>No groups found</div>
                        ) : (
                          filteredTree.map((node) => (
                            <TreeNode
                              key={node.key}
                              node={node}
                              onSelect={(n) => { handleSelectNode(n); setIsTreeOpen(false); }}
                              expandedKeys={expandedKeys}
                              toggleExpand={toggleExpand}
                              selectedKey={selectedNode?.key}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div id="group-tree" className="panel" role="region" aria-label="Groups tree">
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

                    <div className="tree-scroll" role="tree" aria-label="Group list">
                      {loading ? (
                        <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>Loading...</div>
                        ) : filteredTree.length === 0 ? (
                          <div style={{ padding: 20, color: "var(--muted)", textAlign: "center" }}>No groups found</div>
                        ) : (
                          filteredTree.map((node) => (
                            <TreeNode
                              key={node.key}
                              node={node}
                              onSelect={handleSelectNode}
                              expandedKeys={expandedKeys}
                              toggleExpand={toggleExpand}
                              selectedKey={selectedNode?.key}
                            />
                          ))
                        )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Item Name field */}
            <div className="field">
              <label className="field-label">Item Name *</label>
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
                    placeholder="Enter Item Name"
                    disabled={isSubmitting}
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
                    placeholder="Enter Short Name"
                    disabled={isSubmitting}
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

            {/* Form Grid */}
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
                    placeholder="Select Brand (or type a letter)"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Brand"
                  />
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
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
                    placeholder="Select Category (or type a letter)"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Category"
                  />
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
                    placeholder="Select Product (or type a letter)"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Product"
                  />
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
                    placeholder="Select Model (or type a letter)"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Model"
                  />
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="field">
                <label className="field-label">Size</label>
                <div className="input-with-search">
                  <input
                    ref={sizeRef}
                    className="input"
                    value={formData.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                    onClick={() => setIsSizePopupOpen(true)}
                    onKeyDown={(e) => handlePopupFieldKeyPress('size', e)}
                    placeholder="Select Size (or type a letter)"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Size"
                  />
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Units */}
              <div className="field">
                <label className="field-label">Units</label>
                <div className="input-with-search">
                  <input
                    ref={unitRef}
                    className="input"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    onClick={() => setIsUnitPopupOpen(true)}
                    onKeyDown={(e) => handlePopupFieldKeyPress('unit', e)}
                    placeholder="Select Units (or type a letter)"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Units"
                  />
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Max */}
              <div className="field">
                <label className="field-label">Max</label>
                <input
                  ref={maxRef}
                  className="input"
                  value={formData.max}
                  onChange={(e) => handleChange('max', e.target.value)}
                  placeholder="Enter Max"
                  disabled={isSubmitting}
                  aria-label="Max"
                  style={{ textAlign: "center" }}
                />
              </div>

              {/* Min */}
              <div className="field">
                <label className="field-label">Min</label>
                <input
                  ref={minRef}
                  className="input"
                  value={formData.min}
                  onChange={(e) => handleChange('min', e.target.value)}
                  placeholder="Enter Min"
                  disabled={isSubmitting}
                  aria-label="Min"
                  style={{ textAlign: "center" }}
                />
              </div>

              {/* HSN Code */}
              <div className="field">
                <label className="field-label">HSN Code</label>
                <input
                  ref={hsnCodeRef}
                  className="input"
                  value={formData.hsnCode}
                  onChange={(e) => {
                    if (/^\d{0,8}$/.test(e.target.value)) {
                      handleChange('hsnCode', e.target.value);
                    }
                  }}
                  placeholder="Enter HSN Code"
                  disabled={isSubmitting}
                  aria-label="HSN Code"
                  title="4-8 digit HSN Code"
                />
              </div>

              {/* Piece Rate Checkbox */}
              <div className="field">
                <div 
                  className="checkbox-group" 
                  onClick={handlePieceRateToggle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePieceRateToggle();
                    }
                  }}
                  role="checkbox"
                  tabIndex="0"
                  aria-checked={pieceRateChecked}
                >
                  <div 
                    className={`checkbox ${pieceRateChecked ? 'checked' : ''}`}
                  />
                  <span className="checkbox-label">Piece Rate</span>
                </div>
              </div>

              {/* GST% */}
              <div className="field">
                <label className="field-label">GST%</label>
                <input
                  ref={gstinRef}
                  className="input"
                  value={formData.gstin}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty or numbers only
                    if (/^\d{0,2}$/.test(value)) {
                      handleChange('gstin', value);
                    }
                  }}
                  onBlur={() => {
                    // Validate GST value when user leaves the field
                    const allowedGSTValues = ['3', '5', '12', '18', '28'];
                    const gstValue = formData.gstin;
                    if (gstValue !== '' && !allowedGSTValues.includes(gstValue)) {
                      // Show error message
                      setMessage({ type: "error", text: 'Only 3, 5, 12, 18, or 28 are allowed for GST%.' });
                      // Clear invalid value
                      handleChange('gstin', '');
                      // Focus back to show error
                      setTimeout(() => gstinRef.current?.focus(), 10);
                    }
                  }}
                  placeholder="Enter GST%"
                  disabled={isSubmitting || !gstChecked}
                  aria-label="GST Percentage"
                />
              </div>

              {/* GST Checkbox */}
              <div className="field">
                <div 
                  className="checkbox-group" 
                  onClick={handleGstToggle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGstToggle();
                    }
                  }}
                  role="checkbox"
                  tabIndex="0"
                  aria-checked={gstChecked}
                >
                  <div 
                    className={`checkbox ${gstChecked ? 'checked' : ''}`}
                  />
                  <span className="checkbox-label">GST</span>
                </div>
              </div>

              {/* Prefix */}
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
                  placeholder="Enter Prefix"
                  disabled={isSubmitting || !manualPrefixChecked}
                  aria-label="Prefix"
                />
              </div>

              {/* Manual Prefix Checkbox */}
              <div className="field">
                <div 
                  className="checkbox-group" 
                  onClick={handleManualPrefixToggle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleManualPrefixToggle();
                    }
                  }}
                  role="checkbox"
                  tabIndex="0"
                  aria-checked={manualPrefixChecked}
                >
                  <div 
                    className={`checkbox ${manualPrefixChecked ? 'checked' : ''}`}
                  />
                  <span className="checkbox-label">Manual Prefix</span>
                </div>
              </div>

              {/* Selling Price - Changed to text input with validation */}
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
                  placeholder="Enter Selling Price"
                  disabled={isSubmitting}
                  aria-label="Selling Price"
                  // Use text type instead of number to remove spinners
                  type="text"
                  inputMode="decimal"
                />
              </div>

              {/* Cost Price - Changed to text input with validation */}
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
                  placeholder="Enter Cost Price"
                  disabled={isSubmitting}
                  aria-label="Cost Price"
                  // Use text type instead of number to remove spinners
                  type="text"
                  inputMode="decimal"
                />
              </div>

              {/* Type Dropdown - UPDATED */}
              <div className="field">
                <label className="field-label">Type</label>
                <select
                  ref={typeRef}
                  className="select"
                  value={formData.type}
                  onChange={(e) => {
                    handleChange('type', e.target.value);
                    // Close dropdown after selection
                    e.target.size = 0;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Toggle dropdown on Enter
                      if (e.target.size === 0) {
                        e.target.size = TYPE_OPTIONS.length + 1; // Open dropdown
                      } else {
                        e.target.size = 0; // Close dropdown
                        // Move to next field (Save button)
                        const saveButton = document.querySelector('.submit-primary');
                        if (saveButton) {
                          setTimeout(() => saveButton.focus(), 10);
                        }
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // Close dropdown when losing focus
                    e.target.size = 0;
                  }}
                  onClick={(e) => {
                    // Toggle dropdown on click
                    if (e.target.size === 0) {
                      e.target.size = TYPE_OPTIONS.length + 1;
                    } else {
                      e.target.size = 0;
                    }
                  }}
                  size={0}
                  disabled={isSubmitting}
                  aria-label="Type"
                >
                  <option value="">Select Type</option>
                  {TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                  const action = actionType === 'create' ? 'save' : 
                                actionType === 'edit' ? 'update' : 'delete';
                  showConfirmationPopup(action);
                }}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? "Processing..." : 
                 actionType === 'create' ? 'Save' : 
                 actionType === 'edit' ? 'Update' : 'Delete'}
              </button>
              <button
                className="submit-clear"
                onClick={() => showConfirmationPopup('clear')}
                disabled={isSubmitting}
                type="button"
              >
                Clear
              </button>
            </div>
          </div>

          
        </div>
      </div>

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        onConfirm={handleConfirmAction}
        {...getConfirmationConfig()}
      />

      {/* PopupListSelector for Brand Selection */}
      <PopupListSelector
        open={isBrandPopupOpen}
        onClose={() => {
          setIsBrandPopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, brand: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, brand: false }));
        }}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, brand: item.fname || '' }));
          setFieldCodes(prev => ({ ...prev, brandCode: item.fcode || '' }));
          setIsBrandPopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, brand: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, brand: false }));
        }}
        fetchItems={fetchBrandsWithSearch}
        title="Select Brand"
        displayFieldKeys={['fcode', 'fname']}
        searchFields={['fcode', 'fname']}
        headerNames={['Code', 'Brand Name']}
        columnWidths={{ fcode: '30%', fname: '70%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Category Selection */}
      <PopupListSelector
        open={isCategoryPopupOpen}
        onClose={() => {
          setIsCategoryPopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, category: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, category: false }));
        }}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, category: item.fname || '' }));
          setFieldCodes(prev => ({ ...prev, categoryCode: item.fcode || '' }));
          setIsCategoryPopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, category: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, category: false }));
        }}
        fetchItems={fetchCategoriesWithSearch}
        title="Select Category"
        displayFieldKeys={['fcode', 'fname']}
        searchFields={['fcode', 'fname']}
        headerNames={['Code', 'Category Name']}
        columnWidths={{ fcode: '30%', fname: '70%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Product Selection */}
      <PopupListSelector
        open={isProductPopupOpen}
        onClose={() => {
          setIsProductPopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, product: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, product: false }));
        }}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, product: item.fname || '' }));
          setFieldCodes(prev => ({ ...prev, productCode: item.fcode || '' }));
          setIsProductPopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, product: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, product: false }));
        }}
        fetchItems={fetchProductsWithSearch}
        title="Select Product"
        displayFieldKeys={['fcode', 'fname']}
        searchFields={['fcode', 'fname']}
        headerNames={['Code', 'Product Name']}
        columnWidths={{ fcode: '30%', fname: '70%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Model Selection */}
      <PopupListSelector
        open={isModelPopupOpen}
        onClose={() => {
          setIsModelPopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, model: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, model: false }));
        }}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, model: item.fname || '' }));
          setFieldCodes(prev => ({ ...prev, modelCode: item.fcode || '' }));
          setIsModelPopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, model: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, model: false }));
        }}
        fetchItems={fetchModelsWithSearch}
        title="Select Model"
        displayFieldKeys={['fcode', 'fname']}
        searchFields={['fcode', 'fname']}
        headerNames={['Code', 'Model Name']}
        columnWidths={{ fcode: '30%', fname: '70%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Size Selection */}
      <PopupListSelector
        open={isSizePopupOpen}
        onClose={() => {
          setIsSizePopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, size: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, size: false }));
        }}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, size: item.fname || '' }));
          setFieldCodes(prev => ({ ...prev, sizeCode: item.fcode || '' }));
          setIsSizePopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, size: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, size: false }));
        }}
        fetchItems={fetchSizesWithSearch}
        title="Select Size"
        displayFieldKeys={['fcode', 'fname']}
        searchFields={['fcode', 'fname']}
        headerNames={['Code', 'Size Name']}
        columnWidths={{ fcode: '30%', fname: '70%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Unit Selection */}
      <PopupListSelector
        open={isUnitPopupOpen}
        onClose={() => {
          setIsUnitPopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, unit: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, unit: false }));
        }}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, unit: item.fname || '', unitCode: item.fcode || '' }));
          setIsUnitPopupOpen(false);
          setPopupInitialSearch(prev => ({ ...prev, unit: '' }));
          setSimulatePopupTyping(prev => ({ ...prev, unit: false }));
        }}
        fetchItems={fetchUnitsWithSearch}
        title="Select Unit"
        displayFieldKeys={['fname', 'fcode']}
        searchFields={['fname', 'fcode']}
        headerNames={['Unit Name', 'Code']}
        columnWidths={{ fname: '60%', fcode: '40%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Edit/Delete actions - FIXED VERSION */}
      <PopupListSelector
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
       onSelect={(item) => {
        
  // Map backend fields to form fields
  console.log("✔️ RAW SELECTED ITEM:", item);
  setFormData({
    fitemCode: item.fItemcode || '',
    itemName: item.fItemName || '',
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
    // CHANGED: Fetch pieceRate from backend if available
    pieceRate: item.pieceRate || item.fPieceRate || 'N',
    type: item.ftype || '',
    sellingPrice: item.fSellPrice || '',
    costPrice: item.fCostPrice || '',
    unit: item.fUnits || '',
    unitCode: item.funitcode || '',
  });
  
  // Also set the field codes for backend submission
  setFieldCodes({
    brandCode: item.fbrand || '',
    categoryCode: item.fcategory || '',
    productCode: item.fproduct || '',
    modelCode: item.fmodel || '',
    sizeCode: item.fsize || '',
    unitCode: item.funitcode || '',
  });
  
  // Set checkbox states
  const hasGst = item.gstcheckbox === 'Y' || (item.ftax && item.ftax !== '');
  setGstChecked(hasGst);
  setManualPrefixChecked(item.manualprefix === 'Y');
  // CHANGED: Set pieceRate checkbox based on backend data
  const hasPieceRate = item.pieceRate === 'Y' || item.fPieceRate === 'Y';
  setPieceRateChecked(hasPieceRate);
  
  // Set main group
  setMainGroup(item.fParent || '');
  
  setIsPopupOpen(false);
  // ✅ Move focus into the form, NOT toolbar
setTimeout(() => {
  itemNameRef.current?.focus();
}, 50);
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