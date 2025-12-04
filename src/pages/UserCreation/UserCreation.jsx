import React, { useState, useMemo, useRef, useEffect } from "react";
import PopupListSelector from "../../components/Listpopup/PopupListSelector"; // corrected path to component

export default function UserCreation() {
  // ---------- state ----------
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ 
    company: "", 
    companyCode: "", 
    username: "", 
    password: "", 
    prefix: "",
    userId: null,
    code: "" 
  });
  
  const [mode, setMode] = useState("create"); // 'create' | 'edit' | 'delete'
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // modals & queries
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyQuery, setCompanyQuery] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editQuery, setEditQuery] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteQuery, setDeleteQuery] = useState("");

  const [existingQuery, setExistingQuery] = useState("");

  // For showing delete warnings
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [deleteWarningMessage, setDeleteWarningMessage] = useState("");

  // refs for step-by-step Enter navigation
  const companyRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const prefixRef = useRef(null);

  // Screen width state for responsive design
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for PopupListSelector
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState(""); // 'company', 'edit', 'delete'
  const [popupTitle, setPopupTitle] = useState("");
  const [popupData, setPopupData] = useState([]);
  const [popupSearchText, setPopupSearchText] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------- API functions ----------
  // Fetch companies/users list
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://dikshiserver/spstores/api/UserCreation/GetUserCreationdropdowslist");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCompanies(data || []);
    } catch (err) {
      setError(err.message || "Failed to load companies");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users (same list as companies)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://dikshiserver/spstores/api/UserCreation/GetUserCreationdropdowslist");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create user
  const createUser = async (userData) => {
    console.log("Creating user with data:", userData);
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://dikshiserver/spstores/api/UserCreation/CreateUser", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message || "Failed to create user");
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://dikshiserver/spstores/api/UserCreation/UpdateUser", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message || "Failed to update user");
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete user - FIXED: Enhanced error handling
  const deleteUser = async (userId) => {
    console.log("Deleting user with ID:", userId);
    return;
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`http://dikshiserver/spstores/api/UserCreation/deleteUser/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: userId
        })
      });

      // Read response body once
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        // Try to parse error message from response body
        if (responseText) {
          try {
            // Try to parse as JSON first
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.Message || errorData.error || responseText;
          } catch {
            // If not JSON, use the text directly
            errorMessage = responseText;
          }
        } else {
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Success case: try to parse response body as JSON, fallback to success object
      if (responseText) {
        try {
          return JSON.parse(responseText);
        } catch {
          return { success: true };
        }
      }
      return { success: true };
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Enhanced handleDelete function with better error handling
  async function handleDelete() {
    if (!deleteTargetId) {
      alert("No user selected to delete.");
      return;
    }
    
    // First confirmation
    const confirmDelete = window.confirm(`Are you sure you want to delete user "${form.username}" (Code: ${deleteTargetId})?\n\nThis action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await deleteUser(deleteTargetId);
      await fetchUsers(); // Refresh the users list
      
      setDeleteTargetId(null);
      setForm({ company: "", companyCode: "", username: "", password: "", prefix: "", userId: null });
      setMode("create");
      
      // Success message
      alert(`✅ User "${form.username}" has been deleted successfully.`);
      setTimeout(() => companyRef.current && companyRef.current.focus(), 60);
    } catch (err) {
      // Handle the specific error message from server
      const errorMsg = err.message || "";
      
      if (errorMsg.includes("used in related tables") || 
          errorMsg.includes("409") || 
          errorMsg.includes("Conflict") ||
          errorMsg.includes("User Name is used") ||
          errorMsg.includes("foreign key") ||
          errorMsg.includes("reference")) {
        
        // Set detailed warning message
        setDeleteWarningMessage(`
          🚫 Cannot Delete User: "${form.username}" (Code: ${deleteTargetId})
          
          Reason: This user is referenced in other system tables.
          
          Possible Solutions:
          1. Check if this user has:
             • Active transactions
             • Assigned roles/permissions
             • Created records in other modules
             • Pending tasks or workflows
          
          2. Contact your system administrator to:
             • Remove references from related tables first
             • Check database constraints
             • Use cascade delete if appropriate
          
          3. Alternative actions:
             • Deactivate the user instead of deleting
             • Archive user data
             • Update user status to "Inactive"
          
          Note: For immediate assistance, please contact the database administrator.
        `);
        
        setShowDeleteWarning(true);
      } else {
        alert(`Failed to delete user: ${errorMsg}`);
      }
    }
  }

  // Get user item
  const getUserItem = async (userId) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`http://dikshiserver/spstores/api/UserCreation/getUserItem/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch user item");
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ---------- effects ----------
  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      fetchUsers();
    }
  }, [companies]);

  useEffect(() => {
    if (companyRef.current) companyRef.current.focus();
  }, []);

  // ---------- filters ----------
  const filteredCompanies = useMemo(() => {
    const q = companyQuery.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => 
      (c.code || "").toLowerCase().includes(q) || 
      (c.compaytName || "").toLowerCase().includes(q)
    );
  }, [companyQuery, companies]);

  const filteredEditUsers = useMemo(() => {
    const q = editQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.code || "").toLowerCase().includes(q) ||
        (u.userName || "").toLowerCase().includes(q) ||
        (u.compaytName || "").toLowerCase().includes(q) ||
        (u.fPrefix || "").toLowerCase().includes(q)
    );
  }, [editQuery, users]);

  const filteredDeleteUsers = useMemo(() => {
    const q = deleteQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.code || "").toLowerCase().includes(q) ||
        (u.userName || "").toLowerCase().includes(q) ||
        (u.compaytName || "").toLowerCase().includes(q) ||
        (u.fPrefix || "").toLowerCase().includes(q)
    );
  }, [deleteQuery, users]);

  const filteredExisting = useMemo(() => {
    const q = existingQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => 
        (u.code || "").toLowerCase().includes(q) || 
        (u.userName || "").toLowerCase().includes(q) || 
        (u.compaytName || "").toLowerCase().includes(q)
    );
  }, [existingQuery, users]);

  // ---------- handlers ----------
  // Company modal - Updated to use PopupListSelector
  function openCompanyModal() {
    setCompanyQuery("");
    // Prepare data for popup
    const companyData = companies.map(c => ({
      id: c.code,
      code: c.code,
      companyName: c.compaytName,
      displayName: `${c.code} - ${c.compaytName}`
    }));
    
    setPopupData(companyData);
    setPopupTitle("Select Company");
    setPopupType("company");
    setPopupOpen(true);
  }

  function selectCompany(c) {
    setForm((s) => ({ 
      ...s, 
      company: `${c.code} - ${c.compaytName}`,
      companyCode: c.code 
    }));
    setCompanyModalOpen(false);
    setTimeout(() => usernameRef.current && usernameRef.current.focus(), 60);
  }

  // Edit modal: click row to load in form and set Edit mode - Updated to use PopupListSelector
  function openEditModal() {
    setEditQuery("");
    // Prepare data for popup
    const editUserData = users.map(u => ({
      id: u.code,
      code: u.code,
      companyName: u.compaytName,
      userName: u.userName,
      password: u.password ? "••••••" : "-",
      prefix: u.fPrefix || "-",
      displayName: `${u.code} - ${u.userName}`
    }));
    
    setPopupData(editUserData);
    setPopupTitle("Select User to Edit");
    setPopupType("edit");
    setPopupOpen(true);
  }

  function handleEditRowClick(u) {
    setForm({ 
      company: `${u.code} - ${u.compaytName}`,
      companyCode: u.code,
      username: u.userName, 
      password: u.password || "", 
      prefix: u.fPrefix || "",
      userId: u.code 
    });
    setMode("edit");
    setEditingId(u.code);
    setEditModalOpen(false);
    setTimeout(() => usernameRef.current && usernameRef.current.focus(), 60);
  }

  // Delete modal: click row to load in form and set Delete mode - Updated to use PopupListSelector
  function openDeleteModal() {
    setDeleteQuery("");
    // Prepare data for popup
    const deleteUserData = users.map(u => ({
      id: u.code,
      code: u.code,
      companyName: u.compaytName,
      userName: u.userName,
      password: u.password ? "••••••" : "-",
      prefix: u.fPrefix || "-",
      displayName: `${u.code} - ${u.userName}`
    }));
    
    setPopupData(deleteUserData);
    setPopupTitle("Select User to Delete");
    setPopupType("delete");
    setPopupOpen(true);
  }

  function handleDeleteRowClick(u) {
    setForm({ 
      company: `${u.code} - ${u.compaytName}`,
      companyCode: u.code,
      username: u.userName, 
      password: u.password || "", 
      prefix: u.fPrefix || "",
      userId: u.code 
    });
    setMode("delete");
    setDeleteTargetId(u.code);
    setDeleteModalOpen(false);
    setTimeout(() => prefixRef.current && prefixRef.current.focus(), 60);
  }

  // Handle popup selection
  const handlePopupSelect = (selectedItem) => {
    if (popupType === "company") {
      // Find the original company object
      const originalCompany = companies.find(c => c.code === selectedItem.id);
      if (originalCompany) {
        selectCompany(originalCompany);
      }
    } else if (popupType === "edit") {
      // Find the original user object
      const originalUser = users.find(u => u.code === selectedItem.id);
      if (originalUser) {
        handleEditRowClick(originalUser);
      }
    } else if (popupType === "delete") {
      // Find the original user object
      const originalUser = users.find(u => u.code === selectedItem.id);
      if (originalUser) {
        handleDeleteRowClick(originalUser);
      }
    }
    setPopupOpen(false);
    setPopupType("");
    setPopupData([]);
  };

  // Create
  async function handleCreate() {
    if (!form.companyCode || !form.username || !form.password) {
      alert("Please fill required fields: Company, Username, Password.");
      return;
    }

    try {
      const userData = {
        code: '009',
        userName: form.username,
        password: form.password,
        fCompCode: form.companyCode,
        fPrefix: form.prefix || ""
      };

      await createUser(userData);
      await fetchUsers(); // Refresh the users list
      
      setForm({ company: "", companyCode: "", username: "", password: "", prefix: "", userId: null });
      setMode("create");
      alert("✅ User created successfully.");
      setTimeout(() => companyRef.current && companyRef.current.focus(), 60);
    } catch (err) {
      alert(`Failed to create user: ${err.message}`);
    }
  }

  // Update
  async function handleUpdate() {
    if (!editingId) return alert("No user selected to update.");
    if (!form.companyCode || !form.username) return alert("Please fill Company and Username.");

    try {
      const userData = {
        code: editingId,
        userName: form.username,
        password: form.password,
        fCompCode: form.companyCode,
        fPrefix: form.prefix || ""
      };

      await updateUser(userData);
      await fetchUsers(); // Refresh the users list
      
      setEditingId(null);
      setForm({ company: "", companyCode: "", username: "", password: "", prefix: "", userId: null });
      setMode("create");
      alert("✅ User updated successfully.");
      setTimeout(() => companyRef.current && companyRef.current.focus(), 60);
    } catch (err) {
      alert(`Failed to update user: ${err.message}`);
    }
  }

  // wrapper
  function handlePrimaryAction() {
    if (mode === "create") handleCreate();
    else if (mode === "edit") handleUpdate();
    else if (mode === "delete") handleDelete();
  }

  function handleClear() {
    setForm({ company: "", companyCode: "", username: "", password: "", prefix: "", userId: null });
    setMode("create");
    setEditingId(null);
    setDeleteTargetId(null);
    setTimeout(() => companyRef.current && companyRef.current.focus(), 60);
  }

  // Enter-step handlers for Flow 1
  function onCompanyKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (usernameRef.current) usernameRef.current.focus();
    }
  }

  function onUsernameKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (passwordRef.current) passwordRef.current.focus();
    }
  }

  function onPasswordKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (prefixRef.current) prefixRef.current.focus();
    }
  }

  function onPrefixKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePrimaryAction();
    }
  }

  // prevent Enter in modal search fields from bubbling to main form
  function stopEnterPropagation(e) {
    if (e.key === "Enter") {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  // Close delete warning
  function closeDeleteWarning() {
    setShowDeleteWarning(false);
    setDeleteWarningMessage("");
  }

  // Function to fetch items for PopupListSelector
  const fetchItemsForPopup = async (pageNum, search) => {
    // Filter data based on search
    const filtered = popupData.filter(item => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        (item.code && item.code.toString().toLowerCase().includes(searchLower)) ||
        (item.companyName && item.companyName.toLowerCase().includes(searchLower)) ||
        (item.userName && item.userName.toLowerCase().includes(searchLower)) ||
        (item.displayName && item.displayName.toLowerCase().includes(searchLower))
      );
    });
    
    // Simulate pagination
    const startIndex = (pageNum - 1) * 20;
    const endIndex = startIndex + 20;
    return filtered.slice(startIndex, endIndex);
  };

  // Get configuration for PopupListSelector based on type
  const getPopupConfig = () => {
    const configs = {
      company: {
        displayFieldKeys: ['code', 'companyName'],
        searchFields: ['code', 'companyName'],
        headerNames: ['Code', 'Company Name'],
        columnWidths: { code: '30%', companyName: '70%' },
        searchPlaceholder: 'Search companies...'
      },
      edit: {
        displayFieldKeys: ['code', 'companyName', 'userName', 'password', 'prefix'],
        searchFields: ['code', 'companyName', 'userName'],
        headerNames: ['Code', 'Company', 'Username', 'Password', 'Prefix'],
        columnWidths: { code: '15%', companyName: '30%', userName: '25%', password: '15%', prefix: '15%' },
        searchPlaceholder: 'Search users...'
      },
      delete: {
        displayFieldKeys: ['code', 'companyName', 'userName', 'password', 'prefix'],
        searchFields: ['code', 'companyName', 'userName'],
        headerNames: ['Code', 'Company', 'Username', 'Password', 'Prefix'],
        columnWidths: { code: '15%', companyName: '30%', userName: '25%', password: '15%', prefix: '15%' },
        searchPlaceholder: 'Search users...'
      }
    };
    
    return configs[popupType] || configs.company;
  };

  // ---------- inline styles (using YOUR exact colors) ----------
  const DARK_BLUE = "#307AC8";      // Darkest blue
  const MEDIUM_BLUE = "#1B91DA";    // Medium blue  
  const LIGHT_BLUE = "#06A7EA";     // Lightest blue
  const BG = "#ffffff";
  const BORDER_SOFT = "rgba(6, 167, 234, 0.2)";
  const BORDER_MEDIUM = "rgba(6, 167, 234, 0.35)";
  const INPUT_BG = "#F8FBFF";
  const LIGHT_BLUE_BG = "#E6F4FF";
  const FONT = "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial";

  const styles = {
    page: { 
      minHeight: "100vh", 
      background: "#f4f9ff", 
      fontFamily: FONT, 
      display: "flex", 
      justifyContent: "center",
      alignItems: "flex-start",
      padding: isMobile ? "15px" : "25px",
      boxSizing: "border-box"
    },
    
    // Main container that centers everything - SMALL SPACE BETWEEN FORMS
    mainContainer: {
      width: "100%",
      maxWidth: "1250px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "20px" : "15px", // SMALL GAP (15px on desktop, 20px on mobile)
      alignItems: "stretch",
    },
    
    // Form Row: Both forms side by side in center
    // LEFT: Existing Users - WITH SHADOW AND BORDER
    leftFormCard: {
      flex: isMobile ? "1 1 100%" : "1 1 55%",
      background: BG,
      borderRadius: "12px", // FULLY ROUNDED
      padding: isMobile ? "18px" : "26px",
      border: `1px solid ${BORDER_SOFT}`,
      boxShadow: "0 8px 25px rgba(6, 167, 234, 0.12)", // CARD SHADOW
      boxSizing: "border-box",
      minWidth: isMobile ? "280px" : "340px",
    },
    
    // RIGHT: User Creation Form - WITH SHADOW AND BORDER
    rightFormCard: {
      flex: isMobile ? "1 1 100%" : "1 1 45%",
      background: BG,
      borderRadius: "12px", // FULLY ROUNDED
      padding: isMobile ? "18px" : "26px",
      border: `1px solid ${BORDER_SOFT}`,
      boxShadow: "0 8px 25px rgba(6, 167, 234, 0.12)", // CARD SHADOW
      boxSizing: "border-box",
      minWidth: isMobile ? "280px" : "340px",
    },

    // User Creation Form Header - FIXED TO PREVENT WRAPPING
    formHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: isMobile ? "20px" : "24px",
      flexWrap: "nowrap", // PREVENT WRAPPING
      gap: "15px",
      minWidth: 0, // Allow shrinking
    },
    
    formTitle: {
      margin: 0,
      color: DARK_BLUE,           // #307AC8
      fontSize: isMobile ? "18px" : "20px",
      fontWeight: 700,
      borderBottom: `2px solid ${LIGHT_BLUE}`,  // #06A7EA
      paddingBottom: "8px",
      whiteSpace: "nowrap",
      flexShrink: 0,
    },
    
    // Action buttons in form header (Add, Edit, Delete) - NO WRAPPING
    formActionButtons: {
      display: "flex",
      gap: isMobile ? "8px" : "10px",
      alignItems: "center",
      flexShrink: 0,
      flexWrap: "nowrap",
    },
    
    iconButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
      padding: isMobile ? "8px 12px" : "10px 15px",
      borderRadius: "8px",
      border: `1px solid ${BORDER_MEDIUM}`,
      background: "transparent",
      color: DARK_BLUE,           // #307AC8
      cursor: "pointer",
      fontWeight: 600,
      fontSize: isMobile ? "13px" : "14px",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
      flexShrink: 0,
      minWidth: isMobile ? "auto" : "75px",
    },
    
    iconButtonHover: {
      background: LIGHT_BLUE_BG,
      borderColor: MEDIUM_BLUE,   // #1B91DA
      color: DARK_BLUE,           // #307AC8
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(6, 167, 234, 0.15)"
    },

    // Form fields
    formGroup: {
      marginBottom: isMobile ? "16px" : "20px",
      textAlign: "left",
    },
    
    label: {
      display: "block",
      marginBottom: "6px",
      fontWeight: 600,
      color: DARK_BLUE,           // #307AC8
      fontSize: isMobile ? "14px" : "15px",
    },
    
    inputBox: {
      width: "100%",
      padding: isMobile ? "10px 12px" : "12px 14px",
      borderRadius: "8px",
      border: `1px solid ${BORDER_SOFT}`,
      background: INPUT_BG,
      fontSize: isMobile ? "14px" : "15px",
      outline: "none",
      color: "#222",
      transition: "all 0.2s",
      boxSizing: "border-box",
    },
    
    inputBoxFocus: {
      borderColor: MEDIUM_BLUE,   // #1B91DA
      boxShadow: "0 0 0 3px rgba(6, 167, 234, 0.1)",
      background: "#fff"
    },
    
    // Company input with search icon
    companyInputBox: {
      width: "100%",
      padding: isMobile ? "10px 12px 10px 38px" : "12px 14px 12px 42px",
      borderRadius: "8px",
      border: `1px solid ${BORDER_SOFT}`,
      background: INPUT_BG,
      fontSize: isMobile ? "14px" : "15px",
      outline: "none",
      color: "#222",
      transition: "all 0.2s",
      boxSizing: "border-box",
      cursor: "pointer"
    },

    // Form action buttons at bottom
    formActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: isMobile ? "12px" : "18px",
      marginTop: isMobile ? "24px" : "32px",
      paddingTop: isMobile ? "18px" : "24px",
      borderTop: `1px solid ${BORDER_SOFT}`,
      flexWrap: "wrap"
    },
    
    primaryButton: {
      background: `linear-gradient(135deg, ${LIGHT_BLUE}, ${MEDIUM_BLUE})`,  // #06A7EA to #1B91DA
      color: "#fff",
      border: "none",
      padding: isMobile ? "12px 24px" : "14px 32px",
      borderRadius: "8px",
      fontWeight: 700,
      cursor: "pointer",
      fontSize: isMobile ? "15px" : "16px",
      boxShadow: "0 8px 20px rgba(6, 167, 234, 0.25)",
      transition: "all 0.2s",
      whiteSpace: "nowrap"
    },
    
    primaryButtonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 24px rgba(6, 167, 234, 0.35)"
    },
    
    secondaryButton: {
      background: "transparent",
      color: DARK_BLUE,           // #307AC8
      border: `2px solid ${BORDER_MEDIUM}`,
      padding: isMobile ? "10px 20px" : "12px 28px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: isMobile ? "15px" : "16px",
      transition: "all 0.2s",
      whiteSpace: "nowrap"
    },
    
    secondaryButtonHover: {
      background: LIGHT_BLUE_BG,
      borderColor: MEDIUM_BLUE    // #1B91DA
    },
    
    // Existing Users section
    existingUsersHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      flexWrap: "wrap",
      gap: "15px"
    },
    
    existingUsersTitle: {
      margin: 0,
      color: DARK_BLUE,           // #307AC8
      fontSize: isMobile ? "18px" : "20px",
      fontWeight: 700,
      borderBottom: `2px solid ${LIGHT_BLUE}`,  // #06A7EA
      paddingBottom: "8px",
    },
    
    searchInput: {
      width: "100%",
      padding: isMobile ? "10px 12px" : "12px 14px",
      borderRadius: "8px",
      border: `1px solid ${BORDER_SOFT}`,
      background: INPUT_BG,
      fontSize: isMobile ? "14px" : "15px",
      outline: "none",
      color: "#222",
      transition: "all 0.2s",
      boxSizing: "border-box",
      marginBottom: "20px",
    },
    
    // Table styles
    tableContainer: {
      maxHeight: isMobile ? "300px" : "380px",
      overflowY: "auto",
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      border: `1px solid ${BORDER_SOFT}`,
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    },
    
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: isMobile ? "13px" : "14px",
    },
    
    tableHeader: {
      position: "sticky",
      top: 0,
      background: LIGHT_BLUE_BG,
      zIndex: 10,
    },
    
    tableHeaderCell: {
      textAlign: "left",
      padding: isMobile ? "12px 10px" : "14px 12px",
      color: DARK_BLUE,           // #307AC8
      fontWeight: 700,
      fontSize: isMobile ? "13px" : "14px",
      borderBottom: `2px solid ${LIGHT_BLUE}`,  // #06A7EA
    },
    
    tableCell: {
      padding: isMobile ? "12px 10px" : "14px 12px",
      borderBottom: "1px solid rgba(230, 244, 255, 0.85)",
      color: "#3a4a5d",
      fontSize: isMobile ? "13px" : "14px",
      textAlign: "left",
    },
    
    tableRowHover: {
      backgroundColor: LIGHT_BLUE_BG,
      cursor: "pointer",
    },

    // Modal styles (kept for compatibility, but we'll use PopupListSelector)
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.28)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: isMobile ? "10px" : "20px",
      boxSizing: "border-box"
    },
    
    modalBox: {
      width: "96%",
      maxWidth: "900px",
      background: BG,
      borderRadius: "12px",
      padding: isMobile ? "18px" : "28px",
      border: `1px solid ${BORDER_SOFT}`,
      boxShadow: "0 15px 50px rgba(6, 167, 234, 0.15)", // STRONGER SHADOW FOR MODAL
      maxHeight: isMobile ? "90vh" : "82vh",
      overflowY: "auto",
      boxSizing: "border-box"
    },
    
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: isMobile ? "18px" : "22px",
      borderBottom: `2px solid ${LIGHT_BLUE}`,  // #06A7EA
      paddingBottom: isMobile ? "12px" : "16px",
      flexWrap: "wrap"
    },
    
    closeButton: {
      fontSize: isMobile ? "20px" : "22px",
      color: DARK_BLUE,           // #307AC8
      cursor: "pointer",
      padding: isMobile ? "4px" : "6px",
      borderRadius: "6px",
      fontWeight: 700,
      transition: "all 0.2s"
    },
    
    closeButtonHover: {
      background: LIGHT_BLUE_BG,
      color: LIGHT_BLUE           // #06A7EA
    },
    
    modalSearch: {
      width: "100%",
      padding: isMobile ? "10px 12px" : "12px 14px",
      borderRadius: "8px",
      marginBottom: isMobile ? "18px" : "22px",
      border: `1px solid ${BORDER_SOFT}`,
      fontSize: isMobile ? "13px" : "14px",
      outline: "none",
      background: INPUT_BG,
      transition: "all 0.2s",
      boxSizing: "border-box"
    },
    
    modalSearchFocus: {
      borderColor: MEDIUM_BLUE,   // #1B91DA
      boxShadow: "0 0 0 2px rgba(6, 167, 234, 0.1)"
    },
    
    modalTable: {
      width: "100%",
      borderCollapse: "collapse"
    },
    
    modalHeaderCell: {
      padding: isMobile ? "12px 10px" : "14px 12px",
      background: "transparent",
      color: DARK_BLUE,           // #307AC8
      fontWeight: 700,
      textAlign: "left",
      fontSize: isMobile ? "13px" : "15px",
      borderBottom: `2px solid ${LIGHT_BLUE}`  // #06A7EA
    },
    
    modalTableCell: {
      padding: isMobile ? "12px 10px" : "14px 12px",
      borderBottom: "1px solid rgba(230, 244, 255, 0.9)",
      fontSize: isMobile ? "13px" : "15px",
      color: "#3a4a5d",
      textAlign: "left"
    },
    
    modalRowHover: {
      background: LIGHT_BLUE_BG,
      cursor: "pointer"
    },

    // Error and loading
    errorMessage: {
      background: "#ffe6e6",
      color: "#d9534f",
      padding: isMobile ? "12px" : "15px",
      borderRadius: "8px",
      marginBottom: isMobile ? "16px" : "20px",
      textAlign: "center",
      borderLeft: `4px solid #d9534f`,
      fontSize: isMobile ? "13px" : "15px"
    },
    
    loadingMessage: {
      textAlign: "center",
      padding: isMobile ? "30px" : "40px",
      color: LIGHT_BLUE,          // #06A7EA
      fontSize: isMobile ? "14px" : "16px"
    },
    
    asterisk: {
      color: "#d9534f",
      fontWeight: 700
    },
    
    // Delete warning modal
    warningModal: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000,
      padding: isMobile ? "10px" : "20px",
      boxSizing: "border-box"
    },
    
    warningBox: {
      width: "96%",
      maxWidth: "600px",
      background: "#fff8e1",
      borderRadius: "12px",
      padding: isMobile ? "20px" : "30px",
      border: `2px solid #ff9800`,
      boxShadow: "0 15px 50px rgba(0,0,0,0.2)",
      maxHeight: "80vh",
      overflowY: "auto",
      boxSizing: "border-box"
    },
    
    warningHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      borderBottom: `2px solid #ff9800`,
      paddingBottom: "15px"
    },
    
    warningTitle: {
      color: "#d9534f",
      fontSize: isMobile ? "18px" : "20px",
      fontWeight: 700,
      margin: 0
    },
    
    warningContent: {
      color: "#333",
      fontSize: isMobile ? "14px" : "15px",
      lineHeight: "1.6",
      whiteSpace: "pre-line",
      marginBottom: "25px",
      backgroundColor: "#fffef7",
      padding: "20px",
      borderRadius: "8px",
      border: "1px solid #ffe082"
    },
    
    warningActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "15px"
    },
    
    warningButton: {
      padding: isMobile ? "10px 20px" : "12px 25px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: isMobile ? "14px" : "15px",
      transition: "all 0.2s"
    },
    
    warningCloseButton: {
      background: LIGHT_BLUE,     // #06A7EA
      color: "#fff"
    },
    
    warningCloseButtonHover: {
      background: MEDIUM_BLUE,    // #1B91DA
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(6, 167, 234, 0.3)"
    }
  };

  // Helper function to get the correct button style based on mode
  const getPrimaryButtonStyle = () => {
    if (mode === "create") return styles.primaryButton;
    if (mode === "edit") return {
      ...styles.primaryButton,
      background: `linear-gradient(135deg, ${MEDIUM_BLUE}, ${DARK_BLUE})`  // #1B91DA to #307AC8
    };
    if (mode === "delete") return {
      ...styles.primaryButton,
      background: `linear-gradient(135deg, #d9534f, #c9302c)`,
      boxShadow: "0 8px 20px rgba(217, 83, 79, 0.25)"
    };
    return styles.primaryButton;
  };

  const getPrimaryButtonText = () => {
    if (loading) {
      if (mode === "create") return "Creating...";
      if (mode === "edit") return "Updating...";
      if (mode === "delete") return "Deleting...";
      return "Processing...";
    }
    if (mode === "create") return "Create";
    if (mode === "edit") return "Update";
    if (mode === "delete") return "Delete";
    return "Submit";
  };

  // ---------- render ----------
  return (
    <div style={styles.page}>
      <div style={styles.mainContainer}>
        {/* LEFT: Existing Users */}
        <div style={styles.leftFormCard}>
          <div style={styles.existingUsersHeader}>
            <h3 style={styles.existingUsersTitle}>Existing Users</h3>
          </div>

          <input
            style={styles.searchInput}
            placeholder="Search (code, username, company)..."
            value={existingQuery}
            onChange={(e) => setExistingQuery(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, { ...styles.searchInput, borderColor: MEDIUM_BLUE, boxShadow: "0 0 0 2px rgba(6, 167, 234, 0.1)" })}
            onBlur={(e) => Object.assign(e.target.style, { ...styles.searchInput, borderColor: BORDER_SOFT, boxShadow: "none" })}
          />

          <div style={styles.tableContainer}>
            {loading ? (
              <div style={styles.loadingMessage}>Loading users...</div>
            ) : (
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Code</th>
                    <th style={styles.tableHeaderCell}>Username</th>
                    <th style={styles.tableHeaderCell}>Company</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExisting.map((u) => (
                    <tr 
                      key={u.code} 
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = LIGHT_BLUE_BG}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                    >
                      <td style={styles.tableCell}>{u.code}</td>
                      <td style={styles.tableCell}>{u.userName}</td>
                      <td style={styles.tableCell}>{u.compaytName}</td>
                    </tr>
                  ))}
                  {filteredExisting.length === 0 && (
                    <tr>
                      <td style={styles.tableCell} colSpan={3}>
                        {users.length === 0 ? "No users found" : "No matching users"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT: User Creation Form */}
        <div style={styles.rightFormCard}>
          {error && <div style={styles.errorMessage}>Error: {error}</div>}
          
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>User Creation</h3>
            <div style={styles.formActionButtons}>
              <button
                style={styles.iconButton}
                title="Add User"
                onMouseEnter={(e) => Object.assign(e.target.style, styles.iconButtonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.iconButton)}
                onClick={openEditModal}  // Opens edit modal for selection
              >
                <i className="bi bi-person-plus" style={{ fontSize: isMobile ? "14px" : "15px" }}></i>
                {!isMobile && "Add"}
              </button>

              <button 
                style={styles.iconButton} 
                title="Edit User" 
                onClick={openEditModal}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.iconButtonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.iconButton)}
              >
                <i className="bi bi-pencil-square" style={{ fontSize: isMobile ? "14px" : "15px" }}></i>
                {!isMobile && "Edit"}
              </button>

              <button 
                style={styles.iconButton} 
                title="Delete User" 
                onClick={openDeleteModal}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.iconButtonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.iconButton)}
              >
                <i className="bi bi-trash" style={{ fontSize: isMobile ? "14px" : "15px" }}></i>
                {!isMobile && "Delete"}
              </button>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Company <span style={styles.asterisk}>*</span>
              </label>
              <div style={{ position: "relative", width: "100%" }}>
                <i className="bi bi-search" style={{ 
                  position: "absolute", 
                  left: isMobile ? "12px" : "14px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: DARK_BLUE, 
                  opacity: 0.6, 
                  fontSize: isMobile ? "14px" : "15px", 
                  zIndex: 1,
                  pointerEvents: "none"
                }}></i>
                <input
                  ref={companyRef}
                  style={styles.companyInputBox}
                  value={form.company}
                  onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
                  placeholder="Click to search company"
                  onKeyDown={onCompanyKeyDown}
                  onClick={openCompanyModal}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputBoxFocus)}
                  onBlur={(e) => Object.assign(e.target.style, { ...styles.companyInputBox, borderColor: BORDER_SOFT, boxShadow: "none" })}
                  readOnly
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Username <span style={styles.asterisk}>*</span>
              </label>
              <input 
                ref={usernameRef} 
                style={styles.inputBox} 
                value={form.username} 
                onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} 
                placeholder="Enter username" 
                onKeyDown={onUsernameKeyDown}
                onFocus={(e) => Object.assign(e.target.style, styles.inputBoxFocus)}
                onBlur={(e) => Object.assign(e.target.style, { ...styles.inputBox, borderColor: BORDER_SOFT, boxShadow: "none" })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Password <span style={styles.asterisk}>*</span>
              </label>
              <input 
                ref={passwordRef} 
                type="password" 
                style={styles.inputBox} 
                value={form.password} 
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} 
                placeholder="Enter password" 
                onKeyDown={onPasswordKeyDown}
                onFocus={(e) => Object.assign(e.target.style, styles.inputBoxFocus)}
                onBlur={(e) => Object.assign(e.target.style, { ...styles.inputBox, borderColor: BORDER_SOFT, boxShadow: "none" })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Prefix</label>
              <input 
                ref={prefixRef} 
                style={styles.inputBox} 
                value={form.prefix} 
                onChange={(e) => setForm((s) => ({ ...s, prefix: e.target.value }))} 
                placeholder="Prefix (optional)" 
                onKeyDown={onPrefixKeyDown}
                onFocus={(e) => Object.assign(e.target.style, styles.inputBoxFocus)}
                onBlur={(e) => Object.assign(e.target.style, { ...styles.inputBox, borderColor: BORDER_SOFT, boxShadow: "none" })}
              />
            </div>

            <div style={styles.formActions}>
              <button 
                type="button" 
                style={styles.secondaryButton} 
                onClick={handleClear}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.secondaryButtonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.secondaryButton)}
              >
                Clear
              </button>

              <button 
                type="button" 
                style={getPrimaryButtonStyle()} 
                onClick={handlePrimaryAction} 
                disabled={loading}
                onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.primaryButtonHover)}
                onMouseLeave={(e) => !loading && Object.assign(e.target.style, getPrimaryButtonStyle())}
              >
                {getPrimaryButtonText()}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* PopupListSelector for all modal needs */}
      <PopupListSelector
        open={popupOpen}
        onClose={() => {
          setPopupOpen(false);
          setPopupType("");
          setPopupData([]);
        }}
        onSelect={handlePopupSelect}
        fetchItems={fetchItemsForPopup}
        title={popupTitle}
        displayFieldKeys={getPopupConfig().displayFieldKeys}
        searchFields={getPopupConfig().searchFields}
        headerNames={getPopupConfig().headerNames}
        columnWidths={getPopupConfig().columnWidths}
        searchPlaceholder={getPopupConfig().searchPlaceholder}
        maxHeight="70vh"
      />

      {/* DELETE WARNING MODAL */}
      {showDeleteWarning && (
        <div style={styles.warningModal}>
          <div style={styles.warningBox}>
            <div style={styles.warningHeader}>
              <h3 style={styles.warningTitle}>⚠️ Delete Operation Failed</h3>
              <span 
                style={styles.closeButton} 
                onClick={closeDeleteWarning}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.closeButtonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.closeButton)}
              >
                ✖
              </span>
            </div>
            <div style={styles.warningContent}>
              {deleteWarningMessage}
            </div>
            <div style={styles.warningActions}>
              <button 
                style={{ ...styles.warningButton, ...styles.warningCloseButton }}
                onClick={closeDeleteWarning}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.warningCloseButtonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.warningCloseButton)}
              >
                OK, I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}