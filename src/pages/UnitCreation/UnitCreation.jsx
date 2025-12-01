import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import apiService from "../../api/apiService";
import { API_ENDPOINTS } from "../../api/endpoints";


// --- SVG Icons for better UI ---
const CreateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
  </svg>
);
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
    <path
      fillRule="evenodd"
      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
    />
  </svg>
);
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11zm-7.487 1a.5.5 0 0 1 .528.47l.8 10a1 1 0 0 0 .997.93h6.23a1 1 0 0 0 .997-.93l.8-10a.5.5 0 0 1 .528-.47H3.513zM5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z" />
  </svg>
);
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
  </svg>
);
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
  </svg>
);

// Popup Component for Edit/Delete Selection
const SizeSelectionPopup = ({
  isOpen,
  onClose,
  sizes,
  onSelect,
  title,
  action
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSizes = sizes.filter(
    (item) =>
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.size.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <motion.div
      className="popup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="popup-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="popup-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="popup-body">
          <div className="search-bar">
            <span className="search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by code or size..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="popup-table-container">
            <table className="popup-table">
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>Code</th>
                  <th style={{ width: "70%" }}>Size</th>
                </tr>
              </thead>
              <tbody>
                {filteredSizes.length ? (
                  filteredSizes.map((item) => (
                    <tr
                      key={item.code}
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="popup-row"
                    >
                      <td>{item.code}</td>
                      <td>{item.size}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="2"
                      style={{ textAlign: "center", color: "#888", padding: "2rem" }}
                    >
                      No sizes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Simple TreeNode for Units (flat list rendered as tree for consistent UX) ---
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
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <span className={`chev-rot ${isExpanded ? "open" : ""}`}>▸</span>
          </button>
        ) : (
          <span className="chev-placeholder" />
        )}

        <span className="node-text" title={node.displayName} style={{ marginLeft: 6 }}>
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

const UnitCreation = () => {
  const [selectedAction, setSelectedAction] = useState(ACTION_TYPES.CREATE);
  const [searchQuery, setSearchQuery] = useState("");
  const [tableData, setTableData] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  // Tree / left-pane state (to match LedgerGroupCreation UX)
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [isTreeOpen, setIsTreeOpen] = useState(true);
  const [searchTree, setSearchTree] = useState("");

  // Alert modal hook
  const { alertState, showAlert } = useAlertModal();

  // Refs for keyboard navigation
  const sizeRef = useRef(null);

  // Form permissions hook
  const { canCreate, canEdit, canDelete } = useFormPermissions("FRMSIZE");

  // Set global alert function for actionHandlers
  useEffect(() => {
    setGlobalAlert(showAlert);
  }, [showAlert]);

  //   Fetch next code
  const fetchNextCode = async () => {
    try {
      const res = await apiService.get(API_ENDPOINTS.NEXT_SIZE_CODE);
      const cleanCode = typeof res === "string" ? res.trim() : res;
      setSelectedCode(cleanCode);
    } catch (err) {
      console.error("Error fetching next code:", err);
      // Fallback to default code if API fails
      setSelectedCode("0002");
    }
  };

  //   Fetch all sizes
  const fetchData = async () => {
    try {
      const res = await apiService.get(API_ENDPOINTS.GET_SIZE_ITEMS);
      const formatted = res.map((item) => ({
        code: item.fcode,
        size: item.fsize
      }));
      setTableData(formatted);
    } catch (err) {
      console.error("Error fetching sizes:", err);
    }
  };

  //   Fetch data on component mount
  useEffect(() => {
    fetchNextCode();
    fetchData();
  }, []);

  // Auto-focus first field on component mount and after clear
  useEffect(() => {
    if (sizeRef.current && selectedAction !== ACTION_TYPES.DELETE) {
      sizeRef.current.focus();
    }
  }, [selectedAction]);

  // Update clearForm to focus first field after clear
  const clearForm = () => {
    setSize("");
    fetchNextCode();

    // Focus first field after clear
    setTimeout(() => {
      if (sizeRef.current) {
        sizeRef.current.focus();
      }
    }, 100);
  };

  // Handle Enter key press to move to next field
  const handleKeyPress = (e, nextFieldRef) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      }
    }
  };

  // Handle action button clicks
  const handleActionClick = (action) => {
    setSelectedAction(action);

    if (action === ACTION_TYPES.EDIT || action === ACTION_TYPES.DELETE) {
      setPopupTitle(action === ACTION_TYPES.EDIT ? "Select Size to Edit" : "Select Size to Delete");
      setShowPopup(true);
    }
  };

  // Handle selection from popup
  const handlePopupSelect = (item) => {
    setSelectedCode(item.code);
    setSize(item.size);
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
    setSelectedCode(node.key);
    setSize(node.displayName);
    if (selectedAction === ACTION_TYPES.CREATE) setSelectedAction(ACTION_TYPES.EDIT);
    setShowPopup(false);
  };

  const nodes = useMemo(
    () =>
      tableData.map((item) => ({ key: item.code, displayName: item.size, children: [] })),
    [tableData]
  );

  const filteredTree = useMemo(() => {
    if (!searchTree) return nodes;
    const q = searchTree.toLowerCase();
    return nodes.filter((n) => n.key.toLowerCase().includes(q) || n.displayName.toLowerCase().includes(q));
  }, [nodes, searchTree]);

  //   Create / Update / Delete methods
  const saveData = async () => {
    // Validate input
    const validation = validateAction.create(
      { size },
      ['size']
    );

    if (!validation.isValid) {
      await showAlert({
        title: 'Validation Error',
        message: validation.message,
        confirmText: 'OK',
        cancelText: null,
        variant: 'warning'
      });
      return;
    }

    // Show confirmation dialog
    const confirmed = await showActionConfirmation(ACTION_TYPES.CREATE, 'size');
    if (!confirmed) return;

    setLoading(true);
    try {
      const payload = {
        fcode: selectedCode,
        fsize: size.trim()
      };

      const response = await apiService.post(
        API_ENDPOINTS.CREATE_SIZE,
        payload
      );

      // Handle success message
      const messages = getActionMessages(ACTION_TYPES.CREATE, 'size');
      const successMessage = typeof response === 'object'
        ? messages.success
        : response || messages.success;

      await showAlert({
        title: 'Success',
        message: successMessage,
        confirmText: 'OK',
        cancelText: null,
        variant: 'primary'
      });
      fetchData();
      clearForm();
    } catch (err) {
      console.error("Failed to save size:", err);

      // Handle error message
      const messages = getActionMessages(ACTION_TYPES.CREATE, 'size');
      const errorMessage = err.response?.data?.message
        || err.response?.data
        || err.message
        || messages.error;

      await showAlert({
        title: 'Error',
        message: errorMessage,
        confirmText: 'OK',
        cancelText: null,
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateData = async () => {
    // Validate input
    const validation = validateAction.edit(
      { code: selectedCode, size },
      ['size']
    );

    if (!validation.isValid) {
      await showAlert({
        title: 'Validation Error',
        message: validation.message,
        confirmText: 'OK',
        cancelText: null,
        variant: 'warning'
      });
      return;
    }

    // Show confirmation dialog
    const confirmed = await showActionConfirmation(ACTION_TYPES.EDIT, 'size');
    if (!confirmed) return;

    setLoading(true);
    try {
      const payload = {
        fcode: selectedCode,
        fsize: size.trim()
      };

      const response = await apiService.put(
        API_ENDPOINTS.UPDATE_SIZE,
        payload
      );

      // Handle success message
      const messages = getActionMessages(ACTION_TYPES.EDIT, 'size');
      const successMessage = typeof response === 'object'
        ? messages.success
        : response || messages.success;

      await showAlert({
        title: 'Success',
        message: successMessage,
        confirmText: 'OK',
        cancelText: null,
        variant: 'primary'
      });
      fetchData();
      clearForm();
    } catch (err) {
      console.error("Failed to update size:", err);

      // Handle error message
      const messages = getActionMessages(ACTION_TYPES.EDIT, 'size');
      const errorMessage = err.response?.data?.message
        || err.response?.data
        || err.message
        || messages.error;

      await showAlert({
        title: 'Error',
        message: errorMessage,
        confirmText: 'OK',
        cancelText: null,
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async () => {
    // Validate selection
    const validation = validateAction.delete({ code: selectedCode });

    if (!validation.isValid) {
      await showAlert({
        title: 'Validation Error',
        message: validation.message,
        confirmText: 'OK',
        cancelText: null,
        variant: 'warning'
      });
      return;
    }

    // Show confirmation dialog with size name
    const confirmed = await showActionConfirmation(ACTION_TYPES.DELETE, `size "${size}"`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await apiService.del(
        API_ENDPOINTS.DELETE_SIZE(selectedCode)
      );

      // Handle success message
      const messages = getActionMessages(ACTION_TYPES.DELETE, 'size');
      const successMessage = typeof response === 'object'
        ? messages.success
        : response || messages.success;

      await showAlert({
        title: 'Success',
        message: successMessage,
        confirmText: 'OK',
        cancelText: null,
        variant: 'primary'
      });
      fetchData();
      clearForm();
    } catch (err) {
      console.error("Failed to delete size:", err);

      // Handle error message
      const messages = getActionMessages(ACTION_TYPES.DELETE, 'size');
      const errorMessage = err.response?.data?.message
        || err.response?.data
        || err.message
        || messages.error;

      await showAlert({
        title: 'Error',
        message: errorMessage,
        confirmText: 'OK',
        cancelText: null,
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selectedAction === ACTION_TYPES.CREATE) saveData();
    else if (selectedAction === ACTION_TYPES.EDIT) updateData();
    else if (selectedAction === ACTION_TYPES.DELETE) deleteData();
  };

  const filteredData = tableData.filter(
    (item) =>
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.size.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
  :root {
    --primary-main: #02a85a;
    --primary-dark: #027238;
    --primary-light: #e8f5e9;
    --primary-gradient: linear-gradient(90deg, #027238, #02a85a);

    --warning-main: #fbc02d;
    --warning-dark: #f57f17;
    --warning-light: #fff8e1;
    --warning-gradient: linear-gradient(90deg, #f57f17, #fbc02d);

    --danger-main: #e53935;
    --danger-dark: #c62828;
    --danger-light: #ffebee;
    --danger-gradient: linear-gradient(90deg, #c62828, #e53935);

    --text-primary: #212529;
    --text-secondary: #6c757d;
    --background-light: #f8f9fa;
    --background-white: #ffffff;
    --border-color: #dee2e6;
    --shadow: 0 4px 20px rgba(0,0,0,0.05);
    --border-radius: 12px;
  }

  body {
    font-family: "Poppins", sans-serif;
    background: var(--background-light);
    margin: 0;
    color: var(--text-primary);
  }

  .page-wrapper {
    padding: 2rem;
    margin-top: 30px;
 
    transition: margin 0.3s ease;
    background: var(--background-light);
    min-height: calc(100vh - 60px);
  }
  
  .main-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .left-column, .right-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .right-column {
    order: -1;
  }

  .action-buttons {
    display: flex;
    background: var(--background-white);
    border-radius: 50px;
    padding: 0.4rem;
    box-shadow: var(--shadow);
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
  }

  .action-btn {
    border: none;
    border-radius: 50px;
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    background-color: transparent;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .action-btn.active {
    color: #fff;
  }

  .action-btn.create.active { background: var(--primary-dark); }
  .action-btn.edit.active { background: var(--warning-dark); }
  .action-btn.delete.active { background: var(--danger-dark); }

  .card {
    background: var(--background-white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
  
  .form-card {
    position: relative;
    padding-top: 5rem; 
  }

  .table-card {
    flex-grow: 1; 
    display: flex;
    flex-direction: column;
    min-height: 400px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .input-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-align: left;
  }

  .input-group input, .input-group select {
    width: 100%;
    padding: 0.8rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    transition: border-color 0.2s, box-shadow 0.2s;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .input-group input:focus, .input-group select:focus {
    outline: none;
    border-color: var(--primary-main);
    box-shadow: 0 0 0 3px rgba(2, 114, 56, 0.1);
  }

  .input-group input:read-only {
    background-color: var(--background-light);
    color: var(--text-secondary);
    cursor: not-allowed;
  }

  .button-row {
    display: flex;
    gap: 1rem;
    margin-top: auto;
    flex-wrap: wrap;
  }

  .submit-btn, .clear-btn {
    flex: 1;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .submit-btn {
    background: linear-gradient(90deg, #027238, #02a85a);
  }

  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  }

  .clear-btn {
    background: var(--background-white);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .clear-btn:hover {
    background: var(--background-light);
    border-color: #adb5bd;
  }

  .search-bar {
    position: relative;
    margin-bottom: 1.5rem;
  }

  .search-bar .search-icon {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    color: var(--text-secondary);
  }

  .search-bar input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    border: 1px solid var(--border-color);
    border-radius: 50px;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .search-bar input:focus {
    outline: none;
    border-color: var(--primary-main);
    box-shadow: 0 0 0 3px rgba(2, 114, 56, 0.1);
  }

  .table-wrapper {
    overflow-y: auto;
    flex-grow: 1;
    max-height: 400px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table th, .table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    word-wrap: break-word;
  }

  .table th {
    background: var(--background-light);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.85rem;
    text-transform: uppercase;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .table tbody tr {
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .table tbody tr:hover {
    background: var(--background-light);
  }

  .table tr.selected-row {
    background: var(--primary-light) !important;
    border-left: 4px solid var(--primary-dark);
  }

  .table tr.selected-row td:first-child {
    font-weight: bold;
    color: var(--primary-dark);
  }

  .image-container {
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    order: 2;
  }

  .company-image {
    max-width: 100%;
    max-height: 250px;
    object-fit: contain;
    border-radius: 8px;
  }

  /* Popup Styles */
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .popup-content {
    background: var(--background-white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    background: var(--primary-gradient);
    color: white;
  }

  .popup-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .popup-body {
    padding: 1.5rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .popup-table-container {
    overflow-y: auto;
    flex-grow: 1;
    max-height: 400px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-top: 1rem;
  }

  .popup-table {
    width: 100%;
    border-collapse: collapse;
  }

  .popup-table th, .popup-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  .popup-table th {
    background: var(--background-light);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.85rem;
    text-transform: uppercase;
    position: sticky;
    top: 0;
  }

  .popup-row {
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .popup-row:hover {
    background: var(--primary-light);
  }

  /* Responsive Adjustments */
  @media (min-width: 1024px) {
    .main-layout {
      grid-template-columns: 1fr 1fr;
    }
    .right-column {
      order: 0;
    }
    .image-container {
      order: 0;
    }
  }

  @media (max-width: 768px) {
    .page-wrapper {
      padding: 1rem;
      margin-left: 0;
    }
    .card {
      padding: 1.5rem;
    }
    .form-card {
      padding-top: 6rem;
    }
    .action-buttons {
      top: 1rem;
      right: 1rem;
    }
    .action-btn {
      padding: 0.5rem 1rem;
    }
    .button-row {
      flex-direction: column;
    }
    .table-wrapper {
      max-height: 300px;
    }
    .popup-content {
      width: 95%;
      max-height: 90vh;
    }
  }
`}</style>

      <div className="page-wrapper">
        <div className="main-layout">
          {/* Left Column */}
          <div className="left-column">
            <motion.div
              className="card table-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 style={{ color: "#027238", marginBottom: "10px" }}>
                Existing Sizes
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#666",
                  marginBottom: "15px",
                  flexShrink: 0,
                }}
              >
                💡 Click a row to load size details.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span className="search-icon">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="Search units..."
                    value={searchTree}
                    onChange={(e) => setSearchTree(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 0.6rem', borderRadius: 8, border: '1px solid var(--border-color)' }}
                  />
                </div>

                <button
                  onClick={() => setIsTreeOpen((s) => !s)}
                  className="clear-btn"
                  style={{ width: 120 }}
                >
                  {isTreeOpen ? 'Collapse' : 'Expand'}
                </button>
              </div>

              <div className="table-wrapper" style={{ padding: 12 }}>
                {filteredTree.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {filteredTree.map((node) => (
                      <TreeNode
                        key={node.key}
                        node={node}
                        onSelect={handleSelectNode}
                        expandedKeys={expandedKeys}
                        toggleExpand={toggleExpand}
                        selectedKey={selectedCode}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No units found</div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <motion.div
              className="card form-card"
              key={selectedAction}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="action-buttons">
                <button
                  className={`action-btn create ${selectedAction === ACTION_TYPES.CREATE ? "active" : ""
                    }`}
                  onClick={() => setSelectedAction(ACTION_TYPES.CREATE)}
                  disabled={!canCreate}
                  title={!canCreate ? "You don't have permission to create" : ""}
                >
                  <CreateIcon /> Add
                </button>
                <button
                  className={`action-btn edit ${selectedAction === ACTION_TYPES.EDIT ? "active" : ""
                    }`}
                  onClick={() => handleActionClick(ACTION_TYPES.EDIT)}
                  disabled={!canEdit}
                  title={!canEdit ? "You don't have permission to edit" : ""}
                >
                  <EditIcon /> Edit
                </button>
                <button
                  className={`action-btn delete ${selectedAction === ACTION_TYPES.DELETE ? "active" : ""
                    }`}
                  onClick={() => handleActionClick(ACTION_TYPES.DELETE)}
                  disabled={!canDelete}
                  title={!canDelete ? "You don't have permission to delete" : ""}
                >
                  <DeleteIcon /> Delete
                </button>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Code</label>
                  <input type="text" value={selectedCode} readOnly />
                </div>

                <div className="input-group">
                  <label>Size</label>
                  <input
                    ref={sizeRef}
                    type="text"
                    placeholder="Enter size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, null)}
                    disabled={selectedAction === ACTION_TYPES.DELETE}
                  />
                </div>
              </div>

              <div className="button-row">
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={loading || (selectedAction === ACTION_TYPES.CREATE ? !canCreate : selectedAction === ACTION_TYPES.EDIT ? !canEdit : !canDelete)}
                  title={selectedAction === ACTION_TYPES.CREATE && !canCreate ? "You don't have permission to create" : selectedAction === ACTION_TYPES.EDIT && !canEdit ? "You don't have permission to edit" : selectedAction === ACTION_TYPES.DELETE && !canDelete ? "You don't have permission to delete" : ""}
                >
                  {loading ? "Processing..." : "Submit"}
                </button>
                <button className="clear-btn" onClick={clearForm}>
                  Clear
                </button>
              </div>
            </motion.div>

            <motion.div
              className="image-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img src={image} alt="Company" className="company-image" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Size Selection Popup */}
      <SizeSelectionPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        sizes={tableData}
        onSelect={handlePopupSelect}
        title={popupTitle}
        action={selectedAction}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
        title={alertState.title}
        message={alertState.message}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        variant={alertState.variant}
      />
    </>
  );
};

export default UnitCreation;