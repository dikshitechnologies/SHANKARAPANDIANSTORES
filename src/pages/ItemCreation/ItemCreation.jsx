import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';

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

// Mock data for tree
const MOCK_TREE_DATA = [
  {
    key: "/electronics",
    displayName: "Electronics",
    id: "ELEC001",
    children: [
      {
        key: "/electronics/mobile",
        displayName: "Mobile Phones",
        id: "MOB001",
        children: [
          { key: "/electronics/mobile/samsung", displayName: "Samsung", id: "SAM001", children: [] },
          { key: "/electronics/mobile/apple", displayName: "Apple", id: "APP001", children: [] },
          { key: "/electronics/mobile/xiaomi", displayName: "Xiaomi", id: "XIA001", children: [] }
        ]
      },
      {
        key: "/electronics/laptop",
        displayName: "Laptops",
        id: "LAP001",
        children: [
          { key: "/electronics/laptop/dell", displayName: "Dell", id: "DEL001", children: [] },
          { key: "/electronics/laptop/hp", displayName: "HP", id: "HP001", children: [] },
          { key: "/electronics/laptop/lenovo", displayName: "Lenovo", id: "LEN001", children: [] }
        ]
      },
      {
        key: "/electronics/tv",
        displayName: "Televisions",
        id: "TV001",
        children: [
          { key: "/electronics/tv/lg", displayName: "LG", id: "LG001", children: [] },
          { key: "/electronics/tv/sony", displayName: "Sony", id: "SON001", children: [] }
        ]
      }
    ]
  },
  {
    key: "/clothing",
    displayName: "Clothing",
    id: "CLOTH001",
    children: [
      {
        key: "/clothing/men",
        displayName: "Men's Wear",
        id: "MEN001",
        children: [
          { key: "/clothing/men/shirts", displayName: "Shirts", id: "SHIRT001", children: [] },
          { key: "/clothing/men/pants", displayName: "Pants", id: "PANT001", children: [] },
          { key: "/clothing/men/jackets", displayName: "Jackets", id: "JACK001", children: [] }
        ]
      },
      {
        key: "/clothing/women",
        displayName: "Women's Wear",
        id: "WOM001",
        children: [
          { key: "/clothing/women/dresses", displayName: "Dresses", id: "DRESS001", children: [] },
          { key: "/clothing/women/tops", displayName: "Tops", id: "TOP001", children: [] },
          { key: "/clothing/women/skirts", displayName: "Skirts", id: "SKIRT001", children: [] }
        ]
      },
      {
        key: "/clothing/kids",
        displayName: "Kids Wear",
        id: "KIDS001",
        children: [
          { key: "/clothing/kids/toys", displayName: "Toys", id: "TOY001", children: [] },
          { key: "/clothing/kids/school", displayName: "School Uniform", id: "SCHOOL001", children: [] }
        ]
      }
    ]
  },
  {
    key: "/furniture",
    displayName: "Furniture",
    id: "FURN001",
    children: [
      {
        key: "/furniture/living",
        displayName: "Living Room",
        id: "LIV001",
        children: [
          { key: "/furniture/living/sofa", displayName: "Sofa", id: "SOFA001", children: [] },
          { key: "/furniture/living/tables", displayName: "Tables", id: "TABLE001", children: [] },
          { key: "/furniture/living/chairs", displayName: "Chairs", id: "CHAIR001", children: [] }
        ]
      },
      {
        key: "/furniture/bedroom",
        displayName: "Bedroom",
        id: "BED001",
        children: [
          { key: "/furniture/bedroom/beds", displayName: "Beds", id: "BED002", children: [] },
          { key: "/furniture/bedroom/wardrobes", displayName: "Wardrobes", id: "WARD001", children: [] }
        ]
      },
      {
        key: "/furniture/office",
        displayName: "Office Furniture",
        id: "OFF001",
        children: [
          { key: "/furniture/office/desks", displayName: "Desks", id: "DESK001", children: [] },
          { key: "/furniture/office/cabinets", displayName: "Cabinets", id: "CAB001", children: [] }
        ]
      }
    ]
  },
  {
    key: "/groceries",
    displayName: "Groceries",
    id: "GROC001",
    children: [
      {
        key: "/groceries/food",
        displayName: "Food Items",
        id: "FOOD001",
        children: [
          { key: "/groceries/food/grains", displayName: "Grains", id: "GRAIN001", children: [] },
          { key: "/groceries/food/spices", displayName: "Spices", id: "SPICE001", children: [] }
        ]
      },
      {
        key: "/groceries/beverages",
        displayName: "Beverages",
        id: "BEV001",
        children: [
          { key: "/groceries/beverages/softdrinks", displayName: "Soft Drinks", id: "DRINK001", children: [] },
          { key: "/groceries/beverages/juices", displayName: "Juices", id: "JUICE001", children: [] }
        ]
      }
    ]
  },
  {
    key: "/stationery",
    displayName: "Stationery",
    id: "STAT001",
    children: [
      {
        key: "/stationery/writing",
        displayName: "Writing Materials",
        id: "WRITE001",
        children: [
          { key: "/stationery/writing/pens", displayName: "Pens", id: "PEN001", children: [] },
          { key: "/stationery/writing/notebooks", displayName: "Notebooks", id: "NOTE001", children: [] }
        ]
      },
      {
        key: "/stationery/office",
        displayName: "Office Supplies",
        id: "OFFSUP001",
        children: [
          { key: "/stationery/office/files", displayName: "Files", id: "FILE001", children: [] },
          { key: "/stationery/office/staplers", displayName: "Staplers", id: "STAP001", children: [] }
        ]
      }
    ]
  }
];

// Mock data for items
const MOCK_ITEMS_DATA = [
  { fItemcode: "ITEM001", fItemName: "iPhone 15 Pro", fParent: "Electronics/Apple", fShort: "i15P", fBrand: "Apple", fCategory: "Smartphones", fProduct: "iPhone", fModel: "15 Pro", fSize: "128GB", fMax: "100", fMin: "10", ftax: "18", fPrefix: "1001", gstcheckbox: "Y", manualprefix: "Y", fHSN: "8517", fPieceRate: "Y", fType: "Finished Product", fSellingPrice: "99999", fCostPrice: "75000", fUnit: "Pieces", fUnitCode: "PCS" },
  { fItemcode: "ITEM002", fItemName: "Samsung Galaxy S24", fParent: "Electronics/Samsung", fShort: "SGS24", fBrand: "Samsung", fCategory: "Smartphones", fProduct: "Galaxy", fModel: "S24", fSize: "256GB", fMax: "150", fMin: "15", ftax: "18", fPrefix: "1002", gstcheckbox: "Y", manualprefix: "Y", fHSN: "8517", fPieceRate: "N", fType: "Finished Product", fSellingPrice: "84999", fCostPrice: "65000", fUnit: "Pieces", fUnitCode: "PCS" },
];

// Mock data for brands
const MOCK_BRANDS_DATA = [
  { fcode: "BR001", fname: "Apple" },
  { fcode: "BR002", fname: "Samsung" },
  { fcode: "BR003", fname: "Dell" },
];

// Mock data for categories
const MOCK_CATEGORIES_DATA = [
  { fcode: "CAT001", fname: "Electronics" },
  { fcode: "CAT002", fname: "Clothing" },
  { fcode: "CAT003", fname: "Furniture" },
];

// Mock data for products
const MOCK_PRODUCTS_DATA = [
  { fcode: "PROD001", fname: "Smartphones" },
  { fcode: "PROD002", fname: "Laptops" },
  { fcode: "PROD003", fname: "Televisions" },
];

// Mock data for models
const MOCK_MODELS_DATA = [
  { fcode: "MOD001", fname: "15 Pro" },
  { fcode: "MOD002", fname: "Galaxy S24" },
  { fcode: "MOD003", fname: "XPS 13" },
];

// Mock data for sizes
const MOCK_SIZES_DATA = [
  { fcode: "SIZ001", fname: "128GB" },
  { fcode: "SIZ002", fname: "256GB" },
  { fcode: "SIZ003", fname: "16GB/512GB" },
];

// Mock data for units
const MOCK_UNITS_DATA = [
  { fcode: "PCS", fname: "Pieces" },
  { fcode: "KG", fname: "Kilograms" },
  { fcode: "LTR", fname: "Liters" },
  { fcode: "MTR", fname: "Meters" },
  { fcode: "BOX", fname: "Box" },
  { fcode: "PKT", fname: "Packet" },
  { fcode: "SET", fname: "Set" },
  { fcode: "DOZ", fname: "Dozen" },
  { fcode: "ROL", fname: "Roll" },
  { fcode: "UNT", fname: "Unit" },
];

// Type options for dropdown
const TYPE_OPTIONS = [
  { value: "Scrap Product", label: "Scrap Product" },
  { value: "Finished Product", label: "Finished Product" },
  { value: "Raw Material", label: "Raw Material" },
  { value: "Semi-Finished", label: "Semi-Finished" },
  { value: "Component", label: "Component" },
  { value: "Accessory", label: "Accessory" },
];

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

  // Checkbox states
  const [gstChecked, setGstChecked] = useState(false);
  const [manualPrefixChecked, setManualPrefixChecked] = useState(false);
  const [pieceRateChecked, setPieceRateChecked] = useState(false);

  // Form data state - Updated with new fields
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

  // Popup states for fields
  const [isBrandPopupOpen, setIsBrandPopupOpen] = useState(false);
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [isProductPopupOpen, setIsProductPopupOpen] = useState(false);
  const [isModelPopupOpen, setIsModelPopupOpen] = useState(false);
  const [isSizePopupOpen, setIsSizePopupOpen] = useState(false);
  const [isUnitPopupOpen, setIsUnitPopupOpen] = useState(false);

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

  // Get permissions for this form.
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
      // Mock API call - using static data
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      setTreeData(MOCK_TREE_DATA);
      setExpandedKeys(new Set(MOCK_TREE_DATA.map(item => item.key)));
    } catch (error) {
      console.error('Tree data fetch error:', error);
      setMessage({ type: "error", text: 'Failed to fetch tree data.' });
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
    if (!newValue) {
      handleChange('gstin', '');
    }
  };

  const handleManualPrefixToggle = () => {
    const newValue = !manualPrefixChecked;
    setManualPrefixChecked(newValue);
    handleChange('manualprefix', newValue ? 'Y' : 'N');
    if (newValue) {
      getMaxPrefixFromAPI();
    } else {
      handleChange('prefix', '');
    }
  };

  const handlePieceRateToggle = () => {
    const newValue = !pieceRateChecked;
    setPieceRateChecked(newValue);
    handleChange('pieceRate', newValue ? 'Y' : 'N');
  };

  const getMaxPrefixFromAPI = async () => {
    try {
      // Mock API call - generate next available prefix
      await new Promise(resolve => setTimeout(resolve, 200));
      const maxPrefix = Math.max(...MOCK_ITEMS_DATA.map(item => parseInt(item.fPrefix || '0')), 1000);
      const nextPrefix = (maxPrefix + 1).toString();
      handleChange('prefix', nextPrefix);
    } catch (error) {
      console.error('Error fetching max prefix:', error);
      setMessage({ type: "error", text: 'Failed to fetch prefix. Please try again.' });
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

    // Validate Selling Price
    if (formData.sellingPrice && isNaN(parseFloat(formData.sellingPrice))) {
      setMessage({ type: "error", text: 'Selling Price should be a valid number.' });
      sellingPriceRef.current?.focus();
      return false;
    }

    // Validate Cost Price
    if (formData.costPrice && isNaN(parseFloat(formData.costPrice))) {
      setMessage({ type: "error", text: 'Cost Price should be a valid number.' });
      costPriceRef.current?.focus();
      return false;
    }

    return true;
  };

  const showConfirmation = (message, onConfirm) => {
    if (window.confirm(message)) {
      onConfirm();
    }
  };

  const handleSubmit = async () => {
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
      // For create operations, check for duplicates
      if (actionType === 'create') {
        try {
          await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
          const isDuplicate = MOCK_ITEMS_DATA.some(item => 
            item.fItemName?.toLowerCase() === formData.itemName.toLowerCase()
          );
          if (isDuplicate) {
            setMessage({ type: "error", text: 'An item with this name already exists. Please choose a different name.' });
            setIsSubmitting(false);
            return;
          }
        } catch (error) {
          console.error('Error checking for duplicates:', error);
          setMessage({ type: "error", text: 'Failed to verify item uniqueness. Please try again.' });
          setIsSubmitting(false);
          return;
        }
      }

      const requestData = {
        fitemCode: formData.fitemCode || `ITEM${String(MOCK_ITEMS_DATA.length + 101).padStart(3, '0')}`,
        fitemName: formData.itemName || '',
        groupName: mainGroup || '',
        shortName: formData.shortName || '',
        brand: formData.brand || '',
        category: formData.category || '',
        product: formData.product || '',
        model: formData.model || '',
        size: formData.size || '',
        max: formData.max || '',
        min: formData.min || '',
        prefix: formData.prefix || '',
        gstNumber: formData.gstin || '', 
        gst: formData.gst || 'N',
        manualprefix: formData.manualprefix || 'N',
        fHSN: formData.hsnCode || '',
        fPieceRate: formData.pieceRate || 'N',
        fType: formData.type || '',
        fSellingPrice: formData.sellingPrice || '',
        fCostPrice: formData.costPrice || '',
        fUnit: formData.unit || '',
        fUnitCode: formData.unitCode || '',
        fCompCode: FCompCode || '',
      };

      console.log('Submitted Request Data:', requestData);

      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 800));

      switch (actionType) {
        case 'create':
          // In real scenario, this would be an API call
          // For mock, we'll just show success message
          setMessage({ type: "success", text: 'Data saved successfully!' });
          if (onCreated) {
            onCreated({
              name: requestData.fitemName,
              code: requestData.fitemCode,
            });
          }
          break;
        case 'edit':
          setMessage({ type: "success", text: 'Data updated successfully!' });
          break;
        case 'delete':
          setMessage({ type: "success", text: 'Data deleted successfully!' });
          break;
        default:
          setMessage({ type: "error", text: 'Invalid action type' });
          return;
      }

      // Simulate success response
      handleClear();
      await fetchTreeData();
      
    } catch (error) {
      console.error('Submit error:', error);
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'An unexpected server error occurred.';

        if (status === 409) {
          setMessage({ type: "error", text: 'Concurrent modification detected. Please refresh and try again.' });
        } else {
          setMessage({ type: "error", text: `Error ${status}: ${message}` });
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

  // Fetch function used by PopupListSelector for Edit/Delete
  const fetchPopupItems = useCallback(async (page = 1, search = '') => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let items = [...MOCK_ITEMS_DATA];
      
      // Filter by search text if provided
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.fItemName?.toLowerCase().includes(searchLower) ||
          item.fParent?.toLowerCase().includes(searchLower)
        );
      }
      
      return items.map((it) => ({
        ...it,
        // normalized fields for consumers
        fItemName: it.fItemName ?? it.fitemName ?? it.fItemname ?? it.fItem ?? '',
        fItemcode: it.fItemcode ?? it.fitemCode ?? it.fitemcode ?? it.fCode ?? '',
        fParent: it.fParent ?? it.groupName ?? it.fParentName ?? '',
        fBrand: it.fBrand || '',
        fCategory: it.fCategory || '',
        fProduct: it.fProduct || '',
        fModel: it.fModel || '',
        fSize: it.fSize || '',
        fMax: it.fMax || '',
        fMin: it.fMin || '',
        fHSN: it.fHSN || '',
        fPieceRate: it.fPieceRate || '',
        fType: it.fType || '',
        fSellingPrice: it.fSellingPrice || '',
        fCostPrice: it.fCostPrice || '',
        fUnit: it.fUnit || ''
      }));
    } catch (err) {
      console.error('fetchPopupItems error', err);
      return [];
    }
  }, []);

  // Fetch functions for popups
  const fetchBrands = useCallback(async (page = 1, search = '') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let items = [...MOCK_BRANDS_DATA];
      
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.fname?.toLowerCase().includes(searchLower)
        );
      }
      
      return items.map((item) => ({
        ...item,
        fname: item.fname || '',
        fcode: item.fcode || ''
      }));
    } catch (err) {
      console.error('fetchBrands error', err);
      return [];
    }
  }, []);

  const fetchCategories = useCallback(async (page = 1, search = '') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let items = [...MOCK_CATEGORIES_DATA];
      
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.fname?.toLowerCase().includes(searchLower)
        );
      }
      
      return items.map((item) => ({
        ...item,
        fname: item.fname || '',
        fcode: item.fcode || ''
      }));
    } catch (err) {
      console.error('fetchCategories error', err);
      return [];
    }
  }, []);

  const fetchProducts = useCallback(async (page = 1, search = '') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let items = [...MOCK_PRODUCTS_DATA];
      
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.fname?.toLowerCase().includes(searchLower)
        );
      }
      
      return items.map((item) => ({
        ...item,
        fname: item.fname || '',
        fcode: item.fcode || ''
      }));
    } catch (err) {
      console.error('fetchProducts error', err);
      return [];
    }
  }, []);

  const fetchModels = useCallback(async (page = 1, search = '') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let items = [...MOCK_MODELS_DATA];
      
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.fname?.toLowerCase().includes(searchLower)
        );
      }
      
      return items.map((item) => ({
        ...item,
        fname: item.fname || '',
        fcode: item.fcode || ''
      }));
    } catch (err) {
      console.error('fetchModels error', err);
      return [];
    }
  }, []);

  const fetchSizes = useCallback(async (page = 1, search = '') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let items = [...MOCK_SIZES_DATA];
      
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.fname?.toLowerCase().includes(searchLower)
        );
      }
      
      return items.map((item) => ({
        ...item,
        fname: item.fname || '',
        fcode: item.fcode || ''
      }));
    } catch (err) {
      console.error('fetchSizes error', err);
      return [];
    }
  }, []);

  const fetchUnits = useCallback(async (page = 1, search = '') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let items = [...MOCK_UNITS_DATA];
      
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.fname?.toLowerCase().includes(searchLower) ||
          item.fcode?.toLowerCase().includes(searchLower)
        );
      }
      
      return items.map((item) => ({
        ...item,
        fname: item.fname || '',
        fcode: item.fcode || ''
      }));
    } catch (err) {
      console.error('fetchUnits error', err);
      return [];
    }
  }, []);

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
    setGstChecked(false);
    setManualPrefixChecked(false);
    setPieceRateChecked(false);
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
    
    if (type === 'edit' || type === 'delete') {
      // No need to fetch data here - PopupListSelector will handle it
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

  return (
    <div className="lg-root" role="region" aria-labelledby="item-title">
      {/* Google/Local font — will fallback to system fonts if blocked */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@500;700&display=swap" rel="stylesheet" />

      <style>{`
        :root{
          /* custom blue theme (provided by user) */
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
        }
        .action-pill.primary { color:white; background: linear-gradient(180deg, var(--accent), var(--accent-2)); }
        .action-pill.warn { color:white; background: linear-gradient(180deg,#f59e0b,#f97316); }
        .action-pill.danger { color:white; background: linear-gradient(180deg,var(--danger),#f97373); }

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
          font-size:13px;
          text-align: left;
          width: 100%;
        }

        .field { margin-bottom:12px; display:flex; flex-direction:column; align-items:flex-start; }

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
          border: 1px solid rgba(15,23,42,0.06);
          background: linear-gradient(180deg, #fff, #fbfdff);
          font-size:14px;
          color:#0f172a;
          box-sizing:border-box;
          transition: box-shadow 160ms ease, transform 120ms ease, border-color 120ms ease;
          text-align: left;
        }
        .input:focus, .search:focus, .select:focus { outline:none; box-shadow: 0 8px 26px rgba(37,99,235,0.08); transform: translateY(-1px); border-color: rgba(37,99,235,0.25); }

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
          border:1px solid rgba(12,18,35,0.06);
          background: linear-gradient(180deg,#fff,#f8fafc);
          cursor:pointer;
          min-width:86px;
          font-weight:600;
          white-space: nowrap;
        }

        .controls { display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; }

        /* tree panel */
        .panel {
          margin-top:8px;
          border-radius:10px;
          background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(250,251,255,0.6));
          border: 1px solid rgba(12,18,35,0.04);
          padding:10px;
          width: 100%;
        }
        .tree-scroll { 
          max-height:260px; 
          overflow:auto; 
          padding-right:6px;
          /* Scrollbar styles */
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
          transition: background 160ms ease, transform 120ms ease, box-shadow 180ms ease;
        }
        .tree-row:hover { background: linear-gradient(90deg, rgba(74,222,128,0.06), rgba(74,222,128,0.02)); transform: translateX(6px); }
        .tree-row.selected { background: linear-gradient(90deg, rgba(15,23,42,0.03), rgba(15,23,42,0.01)); box-shadow: inset 0 0 0 1px rgba(16,163,98,0.06); }

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
        }
        .chev-rot { display:inline-block; transition: transform 220ms cubic-bezier(.2,.8,.2,1); }
        .chev-rot.open { transform: rotate(90deg); }

        .node-icon { width:22px; display:inline-flex; align-items:center; justify-content:center; color:var(--accent); }
        .node-text { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:600; color:#0f172a; }

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
          border: 1px solid rgba(12,18,35,0.04);
        }
        .muted { color: var(--muted); font-size:13px; }

        /* message */
        .message {
          margin-top:8px;
          padding:12px;
          border-radius:10px;
          font-weight:600;
        }
        .message.error { background: #fff1f2; color: #9f1239; border: 1px solid #ffd7da; }
        .message.success { background: #f0fdf4; color: #064e3b; border: 1px solid #bbf7d0; }

        /* submit row */
        .submit-row { 
          display:flex; 
          gap:12px; 
          margin-top:14px; 
          align-items:center; 
          flex-wrap:wrap; 
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
        }
        .submit-clear {
          padding:10px 12px;
          background:#fff;
          border:1px solid rgba(12,18,35,0.06);
          border-radius:10px;
          cursor:pointer;
        }
        
        .search-container {
          position: relative;
          width: 80%;
        }

        .search-with-clear {
          width: 100%;
           padding: 12px 40px 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }
        /* Limit search width inside panels and modals to avoid overly long inputs */
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
         
        .dropdown-list { max-height:50vh; overflow:auto; border-top:1px solid rgba(12,18,35,0.03); border-bottom:1px solid rgba(12,18,35,0.03); padding:6px 0; }
        .dropdown-item { padding:12px; border-bottom:1px solid rgba(12,18,35,0.03); cursor:pointer; display:flex; flex-direction:column; gap:4px; }
        .dropdown-item:hover { background: linear-gradient(90deg, rgba(16,163,98,0.04), rgba(16,163,98,0.01)); transform: translateX(6px); }
        .dropdown-item, .node-text { text-align: left; }

        /* form grid - UPDATED WITH MORE SPACE BETWEEN COLUMNS */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px 32px; /* Increased horizontal gap to 32px */
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
            gap: 16px; /* Reset gap for mobile */
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
            <div>
              <h2 id="item-title">Item Creation</h2>
              <div className="subtitle muted">Create, edit, or delete items — organized & fast.</div>
            </div>
          </div>

          <div className="actions" role="toolbar" aria-label="actions">
            <button
              className={`action-pill ${actionType === 'create' ? 'primary' : ''}`}
              onClick={() => changeActionType('create')}
              disabled={isSubmitting || !formPermissions.add}
              type="button"
              title={!formPermissions.add ? "You don't have permission to create" : "Create new item"}
            >
              <Icon.Plus /> Create
            </button>

            <button
              className={`action-pill ${actionType === 'edit' ? 'warn' : ''}`}
              onClick={() => { changeActionType('edit'); setIsPopupOpen(true); }}
              disabled={isSubmitting || !formPermissions.edit}
              type="button"
              title={!formPermissions.edit ? "You don't have permission to edit" : "Edit existing item"}
            >
              <Icon.Edit /> Edit
            </button>

            <button
              className={`action-pill ${actionType === 'delete' ? 'danger' : ''}`}
              onClick={() => { changeActionType('delete'); setIsPopupOpen(true); }}
              disabled={isSubmitting || !formPermissions.delete}
              type="button"
              title={!formPermissions.delete ? "You don't have permission to delete" : "Delete item"}
            >
              <Icon.Trash /> Delete
            </button>
          </div>
        </div>

        <div className="grid" role="main">
          <div className="card" aria-live="polite">
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
                    onFocus={() => setIsTreeOpen(true)}
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

            {/* Item Name field - Full width with search icon */}
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

            {/* Short Name field - Full width with search icon */}
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

            {/* Form Grid - REARRANGED AS REQUESTED */}
            <div className="form-grid">
              {/* Brand - with built-in search icon */}
              <div className="field">
                <label className="field-label">Brand</label>
                <div className="input-with-search">
                  <input
                    ref={brandRef}
                    className="input"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    onClick={() => setIsBrandPopupOpen(true)}
                    placeholder="Select Brand"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Brand"
                  />
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Category - with built-in search icon */}
              <div className="field">
                <label className="field-label">Category</label>
                <div className="input-with-search">
                  <input
                    ref={categoryRef}
                    className="input"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    onClick={() => setIsCategoryPopupOpen(true)}
                    placeholder="Select Category"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Category"
                  />
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Product - with built-in search icon */}
              <div className="field">
                <label className="field-label">Product</label>
                <div className="input-with-search">
                  <input
                    ref={productRef}
                    className="input"
                    value={formData.product}
                    onChange={(e) => handleChange('product', e.target.value)}
                    onClick={() => setIsProductPopupOpen(true)}
                    placeholder="Select Product"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Product"
                  />
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Model - with built-in search icon */}
              <div className="field">
                <label className="field-label">Model</label>
                <div className="input-with-search">
                  <input
                    ref={modelRef}
                    className="input"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    onClick={() => setIsModelPopupOpen(true)}
                    placeholder="Select Model"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Model"
                  />
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Size - with built-in search icon */}
              <div className="field">
                <label className="field-label">Size</label>
                <div className="input-with-search">
                  <input
                    ref={sizeRef}
                    className="input"
                    value={formData.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                    onClick={() => setIsSizePopupOpen(true)}
                    placeholder="Select Size"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Size"
                  />
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Units - with built-in search icon */}
              <div className="field">
                <label className="field-label">Units</label>
                <div className="input-with-search">
                  <input
                    ref={unitRef}
                    className="input"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    onClick={() => setIsUnitPopupOpen(true)}
                    placeholder="Select Units"
                    disabled={isSubmitting}
                    readOnly
                    aria-label="Units"
                  />
                  <div className="input-search-icon">
                    <Icon.Search size={16} />
                  </div>
                </div>
              </div>

              {/* Max - Separate field */}
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

              {/* Min - Separate field */}
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
                <div className="checkbox-group">
                  <div 
                    className={`checkbox ${pieceRateChecked ? 'checked' : ''}`}
                    onClick={handlePieceRateToggle}
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
                    if (/^\d{0,2}$/.test(e.target.value)) {
                      handleChange('gstin', e.target.value);
                    }
                  }}
                  onBlur={() => {
                    const allowedGSTValues = ['3', '5', '12', '18', '28'];
                    const gstValue = formData.gstin;
                    if (gstValue !== '' && !allowedGSTValues.includes(gstValue)) {
                      handleChange('gstin', '');
                      setMessage({ type: "error", text: 'Only 3, 5, 12, 18, or 28 are allowed.' });
                      gstinRef.current?.focus();
                    }
                  }}
                  placeholder="Enter GST%"
                  disabled={isSubmitting || !gstChecked}
                  aria-label="GST Percentage"
                />
              </div>

              {/* GST Checkbox */}
              <div className="field">
                <div className="checkbox-group">
                  <div 
                    className={`checkbox ${gstChecked ? 'checked' : ''}`}
                    onClick={handleGstToggle}
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
                <div className="checkbox-group">
                  <div 
                    className={`checkbox ${manualPrefixChecked ? 'checked' : ''}`}
                    onClick={handleManualPrefixToggle}
                  />
                  <span className="checkbox-label">Manual Prefix</span>
                </div>
              </div>

              {/* Selling Price */}
              <div className="field">
                <label className="field-label">Selling Price</label>
                <input
                  ref={sellingPriceRef}
                  className="input"
                  value={formData.sellingPrice}
                  onChange={(e) => {
                    if (/^\d*\.?\d{0,2}$/.test(e.target.value)) {
                      handleChange('sellingPrice', e.target.value);
                    }
                  }}
                  placeholder="Enter Selling Price"
                  disabled={isSubmitting}
                  aria-label="Selling Price"
                  type="number"
                  step="0.01"
                />
              </div>

              {/* Cost Price */}
              <div className="field">
                <label className="field-label">Cost Price</label>
                <input
                  ref={costPriceRef}
                  className="input"
                  value={formData.costPrice}
                  onChange={(e) => {
                    if (/^\d*\.?\d{0,2}$/.test(e.target.value)) {
                      handleChange('costPrice', e.target.value);
                    }
                  }}
                  placeholder="Enter Cost Price"
                  disabled={isSubmitting}
                  aria-label="Cost Price"
                  type="number"
                  step="0.01"
                />
              </div>

              {/* Type Dropdown */}
              <div className="field">
                <label className="field-label">Type</label>
                <select
                  ref={typeRef}
                  className="select"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
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

                  const confirmationMessage = 
                    actionType === 'create' ? 'Do You Want Save?' :
                    actionType === 'edit' ? 'Do You Want Modify?' :
                    'Do You Want Delete?';

                  showConfirmation(confirmationMessage, handleSubmit);
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
                onClick={handleClear}
                disabled={isSubmitting}
                type="button"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right side panel */}
          <div className="side" aria-live="polite">
            <div className="stat">
              <div className="muted">Current Action</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>
                {actionType === 'create' ? 'Create New Item' : 
                 actionType === 'edit' ? 'Edit Item' : 'Delete Item'}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Group Name</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {mainGroup || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Item Name</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.itemName || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Short Name</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.shortName || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Brand</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.brand || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Category</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.category || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Product</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.product || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Model</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.model || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Size</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.size || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Units</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.unit || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Max</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.max || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Min</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.min || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">HSN Code</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.hsnCode || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Piece Rate</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {pieceRateChecked ? 'Yes' : 'No'}
              </div>
            </div>

            <div className="stat">
              <div className="muted">GST%</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.gstin ? `${formData.gstin}%` : ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Prefix</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.prefix || ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Selling Price</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.sellingPrice ? `₹${formData.sellingPrice}` : ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Cost Price</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.costPrice ? `₹${formData.costPrice}` : ""}
              </div>
            </div>

            <div className="stat">
              <div className="muted">Type</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {formData.type || ""}
              </div>
            </div>

            <div className="stat tips-panel">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="var(--accent)"/>
                </svg>
                <div style={{ fontWeight: 700 }}>Quick Tips</div>
              </div>
              
              <div className="muted" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ color: "#3b82f6", fontWeight: "bold" }}>•</span>
                  <span>Use the tree to quickly select groups</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ color: "#3b82f6", fontWeight: "bold" }}>•</span>
                  <span>Search groups by name in the search box</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ color: "#3b82f6", fontWeight: "bold" }}>•</span>
                  <span>For editing/deleting, items will be listed automatically</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <span style={{ color: "#3b82f6", fontWeight: "bold" }}>•</span>
                  <span>Click search icons to browse available options</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PopupListSelector for Brand Selection */}
      <PopupListSelector
        open={isBrandPopupOpen}
        onClose={() => setIsBrandPopupOpen(false)}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, brand: item.fname || '' }));
          setIsBrandPopupOpen(false);
        }}
        fetchItems={fetchBrands}
        title="Select Brand"
        displayFieldKeys={['fname']}
        searchFields={['fname']}
        headerNames={['Brand Name']}
        columnWidths={{ fname: '100%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Category Selection */}
      <PopupListSelector
        open={isCategoryPopupOpen}
        onClose={() => setIsCategoryPopupOpen(false)}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, category: item.fname || '' }));
          setIsCategoryPopupOpen(false);
        }}
        fetchItems={fetchCategories}
        title="Select Category"
        displayFieldKeys={['fname']}
        searchFields={['fname']}
        headerNames={['Category Name']}
        columnWidths={{ fname: '100%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Product Selection */}
      <PopupListSelector
        open={isProductPopupOpen}
        onClose={() => setIsProductPopupOpen(false)}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, product: item.fname || '' }));
          setIsProductPopupOpen(false);
        }}
        fetchItems={fetchProducts}
        title="Select Product"
        displayFieldKeys={['fname']}
        searchFields={['fname']}
        headerNames={['Product Name']}
        columnWidths={{ fname: '100%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Model Selection */}
      <PopupListSelector
        open={isModelPopupOpen}
        onClose={() => setIsModelPopupOpen(false)}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, model: item.fname || '' }));
          setIsModelPopupOpen(false);
        }}
        fetchItems={fetchModels}
        title="Select Model"
        displayFieldKeys={['fname']}
        searchFields={['fname']}
        headerNames={['Model Name']}
        columnWidths={{ fname: '100%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Size Selection */}
      <PopupListSelector
        open={isSizePopupOpen}
        onClose={() => setIsSizePopupOpen(false)}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, size: item.fname || '' }));
          setIsSizePopupOpen(false);
        }}
        fetchItems={fetchSizes}
        title="Select Size"
        displayFieldKeys={['fname']}
        searchFields={['fname']}
        headerNames={['Size']}
        columnWidths={{ fname: '100%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Unit Selection */}
      <PopupListSelector
        open={isUnitPopupOpen}
        onClose={() => setIsUnitPopupOpen(false)}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, unit: item.fname || '', unitCode: item.fcode || '' }));
          setIsUnitPopupOpen(false);
        }}
        fetchItems={fetchUnits}
        title="Select Unit"
        displayFieldKeys={['fname', 'fcode']}
        searchFields={['fname', 'fcode']}
        headerNames={['Unit Name', 'Code']}
        columnWidths={{ fname: '60%', fcode: '40%' }}
        maxHeight="60vh"
        responsiveBreakpoint={640}
      />

      {/* PopupListSelector for Edit/Delete actions */}
      <PopupListSelector
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSelect={(item) => {
          const groupValue = item.fParent || item.groupName || '';
          setFormData({
            fitemCode: item.fItemcode || item.fItemCode || item.fCode || '',
            itemName: item.fItemName || item.fItemname || item.fItem || '',
            groupName: groupValue,
            shortName: item.fShort || item.fshort || '',
            brand: item.fBrand || '',
            category: item.fCategory || '',
            product: item.fProduct || '',
            model: item.fModel || '',
            size: item.fSize || '',
            max: item.fMax || '',
            min: item.fMin || '',
            gstin: item.ftax || item.fTax || '',
            prefix: item.fPrefix || item.fprefix || '',
            hsnCode: item.fHSN || '',
            pieceRate: item.fPieceRate || 'N',
            type: item.fType || '',
            sellingPrice: item.fSellingPrice || '',
            costPrice: item.fCostPrice || '',
            unit: item.fUnit || '',
            unitCode: item.fUnitCode || '',
            gst: item.gstcheckbox === 'Y' ? 'Y' : 'N',
            manualprefix: item.manualprefix === 'Y' ? 'Y' : 'N'
          });
          setGstChecked(item.gstcheckbox === 'Y');
          setManualPrefixChecked(item.manualprefix === 'Y');
          setPieceRateChecked(item.fPieceRate === 'Y');
          setMainGroup(groupValue);
          setIsPopupOpen(false);
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