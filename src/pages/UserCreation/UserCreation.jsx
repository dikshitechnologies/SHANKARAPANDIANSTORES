import React, { useState, useMemo, useRef, useEffect } from "react";

/**
 * UserCreation.jsx
 * - Connected to backend API with direct URLs
 * - Single-file Vite + React component (inline CSS)
 * - Flow 1: Enter navigation (Company -> Username -> Password -> Prefix -> Primary action)
 * - BOX style inputs (updated from underline style) - DECREASED SIZE
 * - Blue color scheme: #06A7EA, #1B91DA, #307AC8
 * - Add/Edit/Delete modals (Option B: Delete loads record into main form)
 * - Company modal shows Code + Company Name (click to select)
 * - Edit/Delete modals show #, Company, Username, Password, Prefix (click to load)
 * - Left column: existing users (read-only) - responsive width
 * - Right column: user creation form - responsive width (increased size)
 * - Fully responsive on all screen sizes
 */

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
    userId: null 
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

  // refs for step-by-step Enter navigation
  const companyRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const prefixRef = useRef(null);

  // Screen width state for responsive design
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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

  // Delete user - FIXED: Using DELETE method instead of GET
  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`http://dikshiserver/spstores/api/UserCreation/deleteUser/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        // Try to get detailed error message from response body
        try {
          const errorText = await response.text();
          if (errorText) {
            // Try to parse as JSON first
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.Message || errorText;
            } catch {
              // If not JSON, use the text directly
              errorMessage = errorText;
            }
          } else {
            errorMessage = response.statusText || errorMessage;
          }
        } catch (e) {
          console.warn("Could not read error response:", e);
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message || "Failed to delete user");
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update the handleDelete function with specific error handling
  async function handleDelete() {
    if (!deleteTargetId) return alert("No user selected to delete.");
    
    const confirmDelete = confirm(`Are you sure you want to delete user "${form.username}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await deleteUser(deleteTargetId);
      await fetchUsers(); // Refresh the users list
      
      setDeleteTargetId(null);
      setForm({ company: "", companyCode: "", username: "", password: "", prefix: "", userId: null });
      setMode("create");
      alert("User deleted successfully.");
      setTimeout(() => companyRef.current && companyRef.current.focus(), 60);
    } catch (err) {
      // Handle the specific error message from server
      if (err.message.includes("used in related tables") || err.message.includes("409")) {
        alert(`❌ Cannot Delete User\n\nUser "${form.username}" cannot be deleted because:\n\n• This user is referenced in other system tables\n• There are existing records linked to this user\n• The user may have active transactions or assignments\n\n💡 Solution: Please contact your system administrator to remove this user's references from related tables first.`);
      } else {
        alert(`Failed to delete user: ${err.message}`);
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
  // Company modal
  function openCompanyModal() {
    setCompanyQuery("");
    setCompanyModalOpen(true);
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

  // Edit modal: click row to load in form and set Edit mode
  function openEditModal() {
    setEditQuery("");
    setEditModalOpen(true);
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

  // Delete modal: click row to load in form and set Delete mode (Option B)
  function openDeleteModal() {
    setDeleteQuery("");
    setDeleteModalOpen(true);
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
      alert("User created successfully.");
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
      alert("User updated successfully.");
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

  // ---------- inline styles (BOX style theme with DECREASED SIZE) ----------
  const PRIMARY_BLUE = "#06A7EA";
  const SECONDARY_BLUE = "#1B91DA";
  const DARK_BLUE = "#307AC8";
  const LIGHT_BLUE = "#E6F4FF";
  const BG = "#ffffff";
  const BORDER_SOFT = "rgba(6, 167, 234, 0.2)";
  const BORDER_MEDIUM = "rgba(6, 167, 234, 0.35)";
  const INPUT_BG = "#F8FBFF";
  const FONT = "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial";

  const styles = {
    page: { 
      minHeight: "100vh", 
      background: "#f4f9ff", 
       fontFamily: FONT, 
      display: "flex", 
      justifyContent: "left", 
      alignItems: "flex-start",
      width: "100%",
      boxSizing: "border-box"
    },
    layout: { 
      width: "100%", 
      maxWidth: "1400px", 
      display: "flex", 
      gap: isMobile ? "16px" : isTablet ? "20px" : "30px", 
      alignItems: "flex-start",
      boxSizing: "border-box",
      flexDirection: isMobile ? "column-reverse" : "row"
    },

    // left panel - responsive width (slightly decreased to make room for larger form)
    side: { 
      flex: isMobile ? "0 0 100%" : isTablet ? "0 0 53%" : "0 0 48%", // Decreased from 55%/50%
      width: isMobile ? "100%" : isTablet ? "53%" : "48%",
      background: BG, 
      borderRadius: "10px", 
      padding: isMobile ? "16px" : "20px", 
      border: `1px solid ${BORDER_SOFT}`, 
      boxShadow: "0 6px 20px rgba(6, 167, 234, 0.05)",
      boxSizing: "border-box"
    },
    sideTitle: { 
      margin: 0, 
      color: DARK_BLUE, 
      fontWeight: 700, 
      marginBottom: "15px", 
      fontSize: isMobile ? "16px" : "18px", 
      borderBottom: `2px solid ${PRIMARY_BLUE}`, 
      paddingBottom: "8px" 
    },
    sideSearch: {
      width: "100%",
      padding: isMobile ? "8px 10px" : "10px 12px", // DECREASED: was 10px 12px / 12px 15px
      borderRadius: "6px", // DECREASED: was 8px
      border: `1px solid ${BORDER_SOFT}`,
      marginBottom: "15px",
      fontSize: isMobile ? "13px" : "14px", // DECREASED: was 14px / 15px
      outline: "none",
      background: INPUT_BG,
      transition: "all 0.2s",
      boxSizing: "border-box"
    },
    sideSearchFocus: { borderColor: SECONDARY_BLUE, boxShadow: "0 0 0 2px rgba(6, 167, 234, 0.1)" },

    table: { width: "100%", borderCollapse: "collapse", fontSize: isMobile ? "13px" : "14px" },
    th: { 
      textAlign: "left", 
      padding: isMobile ? "10px 8px" : "12px 10px", 
      color: DARK_BLUE, 
      fontWeight: 700, 
      fontSize: isMobile ? "13px" : "14px", 
      borderBottom: `2px solid ${PRIMARY_BLUE}` 
    },
    td: { 
      padding: isMobile ? "10px 8px" : "12px 10px", 
      borderBottom: "1px solid rgba(230, 244, 255, 0.85)", 
      color: "#3a4a5d",
      fontSize: isMobile ? "13px" : "14px",
      textAlign: "left" // ADDED: Align table body items to left
    },
    trHover: { backgroundColor: LIGHT_BLUE, cursor: "pointer" },

    // form - responsive width (INCREASED SIZE)
    formCard: { 
      flex: isMobile ? "0 0 100%" : isTablet ? "0 0 45%" : "0 0 35%", // Increased from 42%/30%
      width: isMobile ? "100%" : isTablet ? "45%" : "35%",
      minWidth: isMobile ? "280px" : "340px", // Increased min width
      background: BG, 
      borderRadius: "10px", 
      padding: isMobile ? "20px" : "28px", // Increased padding
      border: `1px solid ${BORDER_SOFT}`, 
      boxShadow: "0 10px 30px rgba(6, 167, 234, 0.08)",
      boxSizing: "border-box",
      position: "relative"
    },
    headerRow: { 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "flex-start", // Changed from center to flex-start for better alignment
      marginBottom: isMobile ? "18px" : "22px", // DECREASED: was 20px / 25px
      flexWrap: "wrap",
      gap: "15px"
    },
    titleContainer: {
      flex: 1,
      minWidth: "200px"
    },
    title: { 
      margin: 0, 
      color: DARK_BLUE, 
      fontSize: isMobile ? "20px" : "22px", // Increased font size
      fontWeight: 700, 
      borderBottom: `3px solid ${PRIMARY_BLUE}`, 
      paddingBottom: "10px",
      display: "inline-block"
    },
    // Top buttons container - positioned to the right of the title
    topBtnsContainer: {
      display: "flex",
      gap: isMobile ? "6px" : "8px",
      alignItems: "center",
      marginTop: isMobile ? "0" : "4px"
    },
    iconBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: isMobile ? "4px" : "6px",
      padding: isMobile ? "8px 12px" : "10px 16px", // Increased padding
      borderRadius: "8px",
      border: `1px solid ${BORDER_MEDIUM}`,
      background: "transparent",
      color: DARK_BLUE,
      cursor: "pointer",
      fontWeight: 600,
      fontSize: isMobile ? "13px" : "14px", // Increased font size
      transition: "all 0.2s",
      whiteSpace: "nowrap",
      minWidth: isMobile ? "50px" : "70px" // Increased min width
    },
    iconBtnHover: { 
      background: LIGHT_BLUE, 
      borderColor: SECONDARY_BLUE, 
      color: DARK_BLUE,
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(6, 167, 234, 0.15)"
    },

    formGroup: { marginBottom: isMobile ? "16px" : "20px" }, // DECREASED: was 18px / 22px
    label: { 
      display: "block", 
      marginBottom: "6px", // DECREASED: was 8px
      fontWeight: 600, 
      color: DARK_BLUE, 
      fontSize: isMobile ? "14px" : "15px" ,// DECREASED: was 15px / 16px;
      textAlign: "left"
    },
    // BOX input style (changed from underline) - DECREASED SIZE
    inputBox: {
      width: "100%",
      padding: isMobile ? "10px 12px" : "12px 14px", // DECREASED: was 12px 14px / 14px 16px
      borderRadius: "6px", // DECREASED: was 8px
      border: `1px solid ${BORDER_SOFT}`,
      background: INPUT_BG,
      fontSize: isMobile ? "14px" : "15px", // DECREASED: was 16px / 17px
      outline: "none",
      color: "#222",
      transition: "all 0.2s",
      boxSizing: "border-box"
    },
    inputBoxFocus: { 
      borderColor: SECONDARY_BLUE, 
      boxShadow: "0 0 0 3px rgba(6, 167, 234, 0.1)",
      background: "#fff"
    },

    smallIconBtn: { 
      padding: isMobile ? "8px 10px" : "10px 12px", // DECREASED: was 10px 12px / 12px 14px
      borderRadius: "6px", // DECREASED: was 8px
      border: `1px solid ${BORDER_MEDIUM}`, 
      background: "transparent", 
      cursor: "pointer", 
      color: DARK_BLUE,
      transition: "all 0.2s",
      flexShrink: 0,
      fontSize: isMobile ? "13px" : "14px" // DECREASED: was 14px / 16px
    },
    smallIconBtnHover: { 
      background: LIGHT_BLUE, 
      borderColor: SECONDARY_BLUE,
      transform: "translateY(-1px)",
      boxShadow: "0 2px 8px rgba(6, 167, 234, 0.1)"
    },

    inputGroup: {
      display: "flex",
      gap: isMobile ? "8px" : "10px", // DECREASED: was 10px / 12px
      alignItems: "center"
    },

    bottomRight: { 
      display: "flex", 
      justifyContent: isMobile ? "center" : "flex-end", 
      gap: isMobile ? "12px" : "18px", // Increased gap
      marginTop: isMobile ? "25px" : "35px", // Increased margin
      paddingTop: isMobile ? "18px" : "24px", // Increased padding
      borderTop: `1px solid ${BORDER_SOFT}`,
      flexWrap: "wrap"
    },
    createBtn: { 
      background: `linear-gradient(135deg, ${PRIMARY_BLUE}, ${SECONDARY_BLUE})`, 
      color: "#fff", 
      border: "none", 
      padding: isMobile ? "12px 24px" : "15px 35px", // Increased padding
      borderRadius: "8px", 
      fontWeight: 700, 
      cursor: "pointer", 
      fontSize: isMobile ? "15px" : "17px", // Increased font size
      boxShadow: "0 8px 20px rgba(6, 167, 234, 0.25)",
      transition: "all 0.2s",
      whiteSpace: "nowrap"
    },
    createBtnHover: { transform: "translateY(-2px)", boxShadow: "0 12px 24px rgba(6, 167, 234, 0.35)" },
    updateBtn: { 
      background: `linear-gradient(135deg, ${SECONDARY_BLUE}, ${DARK_BLUE})`, 
      color: "#fff", 
      border: "none", 
      padding: isMobile ? "12px 24px" : "15px 35px", // Increased padding
      borderRadius: "8px", 
      fontWeight: 700, 
      cursor: "pointer",
      fontSize: isMobile ? "15px" : "17px", // Increased font size
      boxShadow: "0 8px 20px rgba(6, 167, 234, 0.25)",
      transition: "all 0.2s",
      whiteSpace: "nowrap"
    },
    updateBtnHover: { transform: "translateY(-2px)", boxShadow: "0 12px 24px rgba(6, 167, 234, 0.35)" },
    deleteBtn: { 
      background: `linear-gradient(135deg, #d9534f, #c9302c)`, 
      color: "#fff", 
      border: "none", 
      padding: isMobile ? "12px 24px" : "15px 35px", // Increased padding
      borderRadius: "8px", 
      fontWeight: 700, 
      cursor: "pointer",
      fontSize: isMobile ? "15px" : "17px", // Increased font size
      boxShadow: "0 8px 20px rgba(217, 83, 79, 0.25)",
      transition: "all 0.2s",
      whiteSpace: "nowrap"
    },
    deleteBtnHover: { transform: "translateY(-2px)", boxShadow: "0 12px 24px rgba(217, 83, 79, 0.35)" },
    clearBtn: { 
      background: "transparent", 
      color: DARK_BLUE, 
      border: `2px solid ${BORDER_MEDIUM}`, 
      padding: isMobile ? "10px 20px" : "13px 28px", // Increased padding
      borderRadius: "8px", 
      cursor: "pointer", 
      fontWeight: 700,
      fontSize: isMobile ? "15px" : "17px", // Increased font size
      transition: "all 0.2s",
      whiteSpace: "nowrap"
    },
    clearBtnHover: { background: LIGHT_BLUE, borderColor: SECONDARY_BLUE },

    // modal
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
      borderRadius: "8px", 
      padding: isMobile ? "16px" : "25px", 
      border: `1px solid ${BORDER_SOFT}`, 
      boxShadow: "0 14px 46px rgba(6, 167, 234, 0.12)", 
      maxHeight: isMobile ? "90vh" : "82vh", 
      overflowY: "auto",
      boxSizing: "border-box"
    },
    modalHeader: { 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      marginBottom: isMobile ? "16px" : "20px", 
      borderBottom: `2px solid ${PRIMARY_BLUE}`, 
      paddingBottom: isMobile ? "12px" : "15px",
      flexWrap: "wrap"
      
    },
    closeX: { 
      fontSize: isMobile ? "20px" : "22px", 
      color: DARK_BLUE, 
      cursor: "pointer", 
      padding: isMobile ? "4px" : "6px", 
      borderRadius: "6px", 
      fontWeight: 700, 
      transition: "all 0.2s" 
    },
    closeXHover: { background: LIGHT_BLUE, color: PRIMARY_BLUE },
    modalSearch: { 
      width: "100%", 
      padding: isMobile ? "10px 12px" : "12px 14px", // DECREASED: was 12px 14px / 14px 16px
      borderRadius: "6px", // DECREASED: was 8px
      marginBottom: isMobile ? "16px" : "20px", 
      border: `1px solid ${BORDER_SOFT}`, 
      fontSize: isMobile ? "13px" : "14px", // DECREASED: was 14px / 16px
      outline: "none",
      background: INPUT_BG,
      transition: "all 0.2s",
      boxSizing: "border-box"
    },
    modalSearchFocus: { borderColor: SECONDARY_BLUE, boxShadow: "0 0 0 2px rgba(6, 167, 234, 0.1)" },
    modalTable: { width: "100%", borderCollapse: "collapse" },
    modalTh: { 
      padding: isMobile ? "10px 8px" : "14px 12px", 
      background: "transparent", 
      color: DARK_BLUE, 
      fontWeight: 700, 
      textAlign: "left", 
      fontSize: isMobile ? "13px" : "15px", 
      borderBottom: `2px solid ${PRIMARY_BLUE}` 
    },
    modalTd: { 
      padding: isMobile ? "10px 8px" : "14px 12px", 
      borderBottom: "1px solid rgba(230, 244, 255, 0.9)", 
      fontSize: isMobile ? "13px" : "15px", 
      color: "#3a4a5d",
      textAlign: "left" // ADDED: Align modal table body items to left
    },
    modalTrHover: { background: LIGHT_BLUE, cursor: "pointer" },

    loading: { 
      textAlign: "center", 
      padding: isMobile ? "30px" : "40px", 
      color: PRIMARY_BLUE, 
      fontSize: isMobile ? "14px" : "16px" 
    },
    error: { 
      background: "#ffe6e6", 
      color: "#d9534f", 
      padding: isMobile ? "12px" : "15px", 
      borderRadius: "6px", 
      marginBottom: isMobile ? "16px" : "20px", 
      textAlign: "center", 
      borderLeft: `4px solid #d9534f`,
      fontSize: isMobile ? "13px" : "15px"
    },
    asterisk: { color: "#d9534f", fontWeight: 700 },
    
    // Responsive container
    tableContainer: {
      maxHeight: isMobile ? "calc(80vh - 150px)" : "calc(100vh - 200px)",
      overflowY: "auto",
      overflowX: "auto",
      WebkitOverflowScrolling: "touch"
    }
  };

  // ---------- render ----------
  return (
    <div style={styles.page}>
      <div style={styles.layout}>
        {/* LEFT: Existing Users - responsive width */}
        <aside style={styles.side}>
          <h4 style={styles.sideTitle}>Existing Users</h4>

          <input
            style={styles.sideSearch}
            placeholder="Search (code, username, company)..."
            value={existingQuery}
            onChange={(e) => setExistingQuery(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, styles.sideSearchFocus)}
            onBlur={(e) => Object.assign(e.target.style, { ...styles.sideSearch, borderColor: BORDER_SOFT, boxShadow: "none" })}
          />

          <div style={styles.tableContainer}>
            {loading ? (
              <div style={styles.loading}>Loading users...</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Code</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Company</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExisting.map((u) => (
                    <tr 
                      key={u.code} 
                      style={{ ':hover': styles.trHover }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = LIGHT_BLUE}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                    >
                      <td style={styles.td}>{u.code}</td>
                      <td style={styles.td}>{u.userName}</td>
                      <td style={styles.td}>{u.compaytName}</td>
                    </tr>
                  ))}
                  {filteredExisting.length === 0 && (
                    <tr>
                      <td style={styles.td} colSpan={3}>
                        {users.length === 0 ? "No users found" : "No matching users"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </aside>

        {/* RIGHT: User Creation Form - responsive width (INCREASED SIZE) */}
        <section style={styles.formCard}>
          {error && <div style={styles.error}>Error: {error}</div>}
          
          <div style={styles.headerRow}>
            <div style={styles.titleContainer}>
              <h3 style={styles.title}>User Creation</h3>
            </div>
            
            {/* Add/Edit/Delete buttons positioned to the right of the title */}
            <div style={styles.topBtnsContainer}>
              <button
                style={styles.iconBtn}
                title="Add User"
                onMouseEnter={(e) => Object.assign(e.target.style, styles.iconBtnHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.iconBtn)}
                onClick={() => {
                  alert("Add clicked (no action).");
                }}
              >
                <i className="bi bi-person-plus" style={{ fontSize: isMobile ? "14px" : "16px" }}></i>
                {!isMobile && "Add"}
              </button>

              <button 
                style={styles.iconBtn} 
                title="Edit User" 
                onClick={openEditModal}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.iconBtnHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.iconBtn)}
              >
                <i className="bi bi-pencil-square" style={{ fontSize: isMobile ? "14px" : "16px" }}></i>
                {!isMobile && "Edit"}
              </button>

              <button 
                style={styles.iconBtn} 
                title="Delete User" 
                onClick={openDeleteModal}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.iconBtnHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.iconBtn)}
              >
                <i className="bi bi-trash" style={{ fontSize: isMobile ? "14px" : "16px" }}></i>
                {!isMobile && "Delete"}
              </button>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Company <span style={styles.asterisk}>*</span>
              </label>
              <div style={styles.inputGroup}>
                <input
                  ref={companyRef}
                  style={styles.inputBox}
                  value={form.company}
                  onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
                  placeholder="Type company (or open search)"
                  onKeyDown={onCompanyKeyDown}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputBoxFocus)}
                  onBlur={(e) => Object.assign(e.target.style, { ...styles.inputBox, borderColor: BORDER_SOFT, boxShadow: "none" })}
                />
                <button
                  type="button"
                  onClick={openCompanyModal}
                  style={styles.smallIconBtn}
                  title="Search company"
                  onMouseEnter={(e) => Object.assign(e.target.style, styles.smallIconBtnHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, styles.smallIconBtn)}
                >
                  <i className="bi bi-search" />
                </button>
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

            <div style={styles.bottomRight}>
              <button 
                type="button" 
                style={styles.clearBtn} 
                onClick={handleClear}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.clearBtnHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.clearBtn)}
              >
                Clear
              </button>

              {mode === "create" && (
                <button 
                  type="button" 
                  style={styles.createBtn} 
                  onClick={handlePrimaryAction} 
                  disabled={loading}
                  onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.createBtnHover)}
                  onMouseLeave={(e) => !loading && Object.assign(e.target.style, styles.createBtn)}
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              )}
              {mode === "edit" && (
                <button 
                  type="button" 
                  style={styles.updateBtn} 
                  onClick={handlePrimaryAction} 
                  disabled={loading}
                  onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.updateBtnHover)}
                  onMouseLeave={(e) => !loading && Object.assign(e.target.style, styles.updateBtn)}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              )}
              {mode === "delete" && (
                <button 
                  type="button" 
                  style={styles.deleteBtn} 
                  onClick={handlePrimaryAction} 
                  disabled={loading}
                  onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.deleteBtnHover)}
                  onMouseLeave={(e) => !loading && Object.assign(e.target.style, styles.deleteBtn)}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </form>
        </section>
      </div>

      {/* COMPANY MODAL */}
      {companyModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <strong style={{ color: DARK_BLUE, fontSize: isMobile ? "16px" : "18px" }}>Select Company</strong>
              <span 
                style={styles.closeX} 
                onClick={() => setCompanyModalOpen(false)}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.closeXHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.closeX)}
              >
                ✖
              </span>
            </div>

            <input 
              style={styles.modalSearch} 
              placeholder="Search companies..." 
              value={companyQuery} 
              onChange={(e) => setCompanyQuery(e.target.value)} 
              onKeyDown={stopEnterPropagation}
              onFocus={(e) => Object.assign(e.target.style, styles.modalSearchFocus)}
              onBlur={(e) => Object.assign(e.target.style, { ...styles.modalSearch, borderColor: BORDER_SOFT, boxShadow: "none" })}
            />

            {loading ? (
              <div style={styles.loading}>Loading companies...</div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.modalTable}>
                  <thead>
                    <tr>
                      <th style={styles.modalTh}>Code</th>
                      <th style={styles.modalTh}>Company Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((c) => (
                      <tr 
                        key={c.code} 
                        style={{ cursor: "pointer" }} 
                        onClick={() => selectCompany(c)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = LIGHT_BLUE}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                      >
                        <td style={styles.modalTd}>{c.code}</td>
                        <td style={styles.modalTd}>{c.compaytName}</td>
                      </tr>
                    ))}
                    {filteredCompanies.length === 0 && (
                      <tr>
                        <td style={styles.modalTd} colSpan={2}>
                          {companies.length === 0 ? "No companies found" : "No matching companies"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <strong style={{ color: DARK_BLUE, fontSize: isMobile ? "16px" : "18px" }}>Users (click to edit)</strong>
              <span 
                style={styles.closeX} 
                onClick={() => setEditModalOpen(false)}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.closeXHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.closeX)}
              >
                ✖
              </span>
            </div>

            <input 
              style={styles.modalSearch} 
              placeholder="Search users..." 
              value={editQuery} 
              onChange={(e) => setEditQuery(e.target.value)} 
              onKeyDown={stopEnterPropagation}
              onFocus={(e) => Object.assign(e.target.style, styles.modalSearchFocus)}
              onBlur={(e) => Object.assign(e.target.style, { ...styles.modalSearch, borderColor: BORDER_SOFT, boxShadow: "none" })}
            />

            {loading ? (
              <div style={styles.loading}>Loading users...</div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.modalTable}>
                  <thead>
                    <tr>
                      <th style={styles.modalTh}>#</th>
                      <th style={styles.modalTh}>Company</th>
                      <th style={styles.modalTh}>Username</th>
                      <th style={styles.modalTh}>Password</th>
                      <th style={styles.modalTh}>Prefix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEditUsers.map((u, idx) => (
                      <tr 
                        key={u.code} 
                        style={{ cursor: "pointer" }} 
                        onClick={() => handleEditRowClick(u)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = LIGHT_BLUE}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                      >
                        <td style={styles.modalTd}>{idx + 1}</td>
                        <td style={styles.modalTd}>{u.compaytName}</td>
                        <td style={styles.modalTd}>{u.userName}</td>
                        <td style={styles.modalTd}>{u.password ? "••••••" : "-"}</td>
                        <td style={styles.modalTd}>{u.fPrefix || "-"}</td>
                      </tr>
                    ))}
                    {filteredEditUsers.length === 0 && (
                      <tr>
                        <td style={styles.modalTd} colSpan={5}>
                          {users.length === 0 ? "No users found" : "No matching users"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={{ 
              display: "flex", 
              justifyContent: "flex-start", 
              alignItems: "center", 
              marginBottom: isMobile ? "16px" : "20px", 
              borderBottom: `2px solid ${PRIMARY_BLUE}`, 
              paddingBottom: isMobile ? "12px" : "15px",
              flexWrap: "wrap"
            }}>
              <strong style={{ color: DARK_BLUE, fontSize: isMobile ? "16px" : "18px" }}>Delete Users (click a row to load into form)</strong>
              <span 
                style={{ 
                  ...styles.closeX, 
                  marginLeft: 'auto'
                }} 
                onClick={() => setDeleteModalOpen(false)}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.closeXHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.closeX)}
              >
                ✖
              </span>
            </div>

            <input 
              style={styles.modalSearch} 
              placeholder="Search users..." 
              value={deleteQuery} 
              onChange={(e) => setDeleteQuery(e.target.value)} 
              onKeyDown={stopEnterPropagation}
              onFocus={(e) => Object.assign(e.target.style, styles.modalSearchFocus)}
              onBlur={(e) => Object.assign(e.target.style, { ...styles.modalSearch, borderColor: BORDER_SOFT, boxShadow: "none" })}
            />

            {loading ? (
              <div style={styles.loading}>Loading users...</div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.modalTable}>
                  <thead>
                    <tr>
                      <th style={styles.modalTh}>#</th>
                      <th style={styles.modalTh}>Company</th>
                      <th style={styles.modalTh}>Username</th>
                      <th style={styles.modalTh}>Password</th>
                      <th style={styles.modalTh}>Prefix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeleteUsers.map((u, idx) => (
                      <tr 
                        key={u.code} 
                        style={{ cursor: "pointer" }} 
                        onClick={() => handleDeleteRowClick(u)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = LIGHT_BLUE}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                      >
                        <td style={styles.modalTd}>{idx + 1}</td>
                        <td style={styles.modalTd}>{u.compaytName}</td>
                        <td style={styles.modalTd}>{u.userName}</td>
                        <td style={styles.modalTd}>{u.password ? "••••••" : "-"}</td>
                        <td style={styles.modalTd}>{u.fPrefix || "-"}</td>
                      </tr>
                    ))}
                    {filteredDeleteUsers.length === 0 && (
                      <tr>
                        <td style={styles.modalTd} colSpan={5}>
                          {users.length === 0 ? "No users found" : "No matching users"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}