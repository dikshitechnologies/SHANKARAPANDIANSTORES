import React, { useState, useMemo, useRef, useEffect } from "react";
import PopupListSelector from "../../components/Listpopup/PopupListSelector";
import { API_ENDPOINTS } from "../../api/endpoints";
import apiService from "../../api/apiService";
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
  
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupData, setPopupData] = useState([]);
  
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [deleteWarningMessage, setDeleteWarningMessage] = useState("");

  // Refs
  const companyRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const prefixRef = useRef(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Color constants
  const DARK_BLUE = "#306AC8";
  const MEDIUM_BLUE = "#1B91DA";
  const LIGHT_BLUE = "#06A7EA";
  const BG = "#ffffff";
  const BORDER_SOFT = "#e1e8f0";
  const INPUT_BG = "#fafcff";
  const LIGHT_BLUE_BG = "#f1f7ff";

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
 
  // ---------- API functions ----------
  const fetchCompanies = async () => {
  try {
    setLoading(true);
    setError("");
    const response = await apiService.get(API_ENDPOINTS.user_creation.getuserdetails);
    console.log("API Response structure:", response); // Debug log
    
    // Check if response is an array or object
    const data = Array.isArray(response) ? response : 
                 response.data ? (Array.isArray(response.data) ? response.data : []) : 
                 [];
    
    console.log("Fetched companies structure:", data);
    console.log("First company sample:", data[0]); // Show structure of first item
    
    // Check all keys in the first company object
    if (data[0]) {
      console.log("Keys in company object:", Object.keys(data[0]));
    }
    
    setCompanies(data || []);
  } catch (err) {
    setError(err.message || "Failed to load companies");
    console.error("API Error:", err);
  } finally {
    setLoading(false);
  }
};


  


  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.get(API_ENDPOINTS.user_creation.getDropdown);
      console.log("API Response:", response);
      

      const data =response;
      console.log("Fetched users:", data);
      setUsers(data || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
  console.log("Creating user with data:", userData);

  try {
    setLoading(true);
    setError("");

    // Correct Axios POST usage
    const response = await apiService.post(
      API_ENDPOINTS.user_creation.postCreate,
      userData
    );

    console.log("API Response:", response.data);
    return response.data;

  } catch (err) {
    setError(err.message || "Failed to create user");
    console.error("API Error:", err);
    throw err;
  } finally {
    setLoading(false);
  }
};


  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.put(API_ENDPOINTS.user_creation.putEdit, {
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

  const deleteUser = async (userId) => {
    console.log("Deleting user with ID:", userId);
    return;
    try {
      setLoading(true);
      setError("");
      const response = await apiService.delete(`API_ENDPOINTS.user_creation.delete/${fcode}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: userId
        })
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.Message || errorData.error || responseText;
          } catch {
            errorMessage = responseText;
          }
        } else {
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

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

  async function handleDelete() {
    if (!deleteTargetId) {
      alert("No user selected to delete.");
      return;
    }
    
    const confirmDelete = window.confirm(`Are you sure you want to delete user "${form.username}" (Code: ${deleteTargetId})?\n\nThis action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await deleteUser(deleteTargetId);
      await fetchUsers();
      
      setDeleteTargetId(null);
      setForm({ company: "", companyCode: "", username: "", password: "", prefix: "", userId: null });
      setMode("create");
      
      alert(`✅ User "${form.username}" has been deleted successfully.`);
      setTimeout(() => companyRef.current && companyRef.current.focus(), 60);
    } catch (err) {
      const errorMsg = err.message || "";
      
      if (errorMsg.includes("used in related tables") || 
          errorMsg.includes("409") || 
          errorMsg.includes("Conflict") ||
          errorMsg.includes("User Name is used") ||
          errorMsg.includes("foreign key") ||
          errorMsg.includes("reference")) {
        
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

  // ---------- filtered data ----------
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => 
      (u.code || "").toLowerCase().includes(q) || 
      (u.userName || "").toLowerCase().includes(q) ||
      (u.compaytName || "").toLowerCase().includes(q)
    );
  }, [searchTerm, users]);

  // ---------- handlers ----------
  function openCompanyModal() {
  console.log("Companies data:", companies); // Debug log
  
  // Fix property names - adjust based on your actual API response
  const companyData = companies.map(c => ({
    id: c.fCompCode || c.code || c.fCompCode,  // Use actual property name
    code: c.fCompCode || c.code || c.fCompCode,
    companyName: c.fCompName || c.companyName || c.fCompName,  // Use actual property name
    displayName: `${c.fCompCode || c.code} - ${c.fCompName || c.companyName || ''}`
  }));
  
  console.log("Mapped company data:", companyData); // Debug log
  
  setPopupData(companyData);
  setPopupTitle("Select Company");
  setPopupType("company");
  setPopupOpen(true);
}

 function selectCompany(c) {
  console.log("Selected company:", c); // Debug log
  
  // Fix property names here too
  const companyCode = c.fCompCode || c.code || c.fCompCode;
  const companyName = c.fCompName || c.companyName || c.fCompName;
  
  setForm((s) => ({ 
    ...s, 
    company: `${companyCode} - ${companyName}`,
    companyCode: companyCode 
  }));
  
  console.log("Form after select:", form); // Debug log
  setTimeout(() => usernameRef.current && usernameRef.current.focus(), 60);
}

  function openEditModal() {
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
    setTimeout(() => usernameRef.current && usernameRef.current.focus(), 60);
  }

  function openDeleteModal() {
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
    setTimeout(() => prefixRef.current && prefixRef.current.focus(), 60);
  }

 const handlePopupSelect = (selectedItem) => {
  console.log("Popup selected item:", selectedItem); // Debug log
  
  if (popupType === "company") {
    // Try different ways to find the company
    const originalCompany = companies.find(c => 
      (c.fCompCode && c.fCompCode.toString() === selectedItem.id.toString()) ||
      (c.code && c.code.toString() === selectedItem.id.toString()) ||
      (c.fCompCode && c.fCompCode.toString() === selectedItem.code.toString())
    );
    
    console.log("Found company:", originalCompany); // Debug log
    
    if (originalCompany) {
      selectCompany(originalCompany);
    } else {
      // Fallback - use the selectedItem data directly
      console.log("Company not found in companies array, using selectedItem");
      selectCompany({
        fCompCode: selectedItem.code || selectedItem.id,
        fCompName: selectedItem.companyName || selectedItem.displayName?.split(' - ')[1] || ''
      });
    }
  } else if (popupType === "edit") {
    const originalUser = users.find(u => u.code === selectedItem.id);
    if (originalUser) {
      handleEditRowClick(originalUser);
    }
  } else if (popupType === "delete") {
    const originalUser = users.find(u => u.code === selectedItem.id);
    if (originalUser) {
      handleDeleteRowClick(originalUser);
    }
  }
  setPopupOpen(false);
  setPopupType("");
  setPopupData([]);
};

 async function handleCreate() {
  if (!form.companyCode || !form.username || !form.password) {
    alert("Please fill required fields: Company, Username, Password.");
    return;
  }

  try {
    const userData = {
      code: "009",
      userName: form.username,
      password: form.password,
      fCompCode: form.companyCode,
      fPrefix: form.prefix || ""
    };

    await createUser(userData);
    await fetchUsers();

    // Reset form
    setForm({
      company: "",
      companyCode: "",
      username: "",
      password: "",
      prefix: "",
      userId: null,
    });

    setMode("create");
    alert("✅ User created successfully.");

    setTimeout(() => {
      if (companyRef.current) companyRef.current.focus();
    }, 60);

  } catch (err) {
    alert(`Failed to create user: ${err.message}`);
  }
}


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
      await fetchUsers();
      
      setEditingId(null);
      setForm({ company: "", companyCode: "", username: "", password: "", prefix: "", userId: null });
      setMode("create");
      alert("✅ User updated successfully.");
      setTimeout(() => companyRef.current && companyRef.current.focus(), 60);
    } catch (err) {
      alert(`Failed to update user: ${err.message}`);
    }
  }

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

  function closeDeleteWarning() {
    setShowDeleteWarning(false);
    setDeleteWarningMessage("");
  }

  const fetchItemsForPopup = async (pageNum, search) => {
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
    
    const startIndex = (pageNum - 1) * 20;
    const endIndex = startIndex + 20;
    return filtered.slice(startIndex, endIndex);
  };

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

  // ---------- styles ----------
  const styles = {
    page: { 
      minHeight: "100vh", 
      background: 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      display: "flex", 
      justifyContent: "center",
      alignItems: "flex-start",
      padding: isMobile ? "15px 10px" : "30px 20px",
      boxSizing: "border-box",
      fontWeight: 400,
      lineHeight: 1.6,
    },
    
    mainContainer: {
      background: 'white',
      borderRadius: isMobile ? '12px' : '20px',
      padding: isMobile ? '15px' : '30px',
      maxWidth: '1400px',
      margin: '0 auto',
      boxShadow: '0 15px 40px rgba(48, 122, 200, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(48, 122, 200, 0.08)',
      width: '100%',
    },
    
    twoColumnLayout: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '20px' : '40px',
      flexWrap: 'wrap',
    },
    
    // LEFT PANEL - Existing Users
    leftPanel: {
      flex: 1,
      minWidth: isMobile ? '100%' : '350px',
      width: '100%',
    },
    
    leftHeader: {
      marginBottom: isMobile ? '15px' : '25px',
    },
    
    leftTitle: {
      fontSize: isMobile ? '18px' : '18px',
      fontWeight: 700,
      marginBottom: '6px',
      color: '#11303F',
      letterSpacing: '-0.3px',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      lineHeight: 1.3,
    },
    
    leftSubtitle: {
      color: '#666',
      fontSize: isMobile ? '13px' : '14px',
      margin: 0,
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      fontWeight: 400,
      opacity: 0.8,
    },
    
    searchContainer: {
      position: 'relative',
      marginBottom: isMobile ? '15px' : '25px',
    },
    
    searchInput: {
      padding: isMobile ? '12px 14px 12px 42px' : '14px 16px 14px 45px',
      border: '2px solid #e1e8f0',
      borderRadius: isMobile ? '10px' : '12px',
      width: '100%',
      fontSize: isMobile ? '14px' : '14px',
      background: '#fafcff',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      boxSizing: 'border-box',
      fontWeight: 500,
      color: '#1e293b',
    },
    
    searchIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8',
      fontSize: isMobile ? '14px' : '14px',
    },
    
    tableContainer: {
      background: '#fafcff',
      borderRadius: isMobile ? '10px' : '12px',
      border: '1px solid #e1e8f0',
      overflow: 'hidden',
      width: '100%',
    },
    
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 2fr',
      padding: isMobile ? '14px 16px' : '16px 20px',
      background: '#f1f7ff',
      borderBottom: '2px solid #e1e8f0',
      fontWeight: 600,
      fontSize: isMobile ? '13px' : '14px',
      color: '#334155',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      gap: isMobile ? '8px' : '0',
      letterSpacing: '0.01em',
    },
    
    tableContent: {
      maxHeight: isMobile ? '250px' : '400px',
      overflowY: 'auto',
      width: '100%',
    },
    
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 2fr',
      padding: isMobile ? '12px 16px' : '16px 20px',
      borderBottom: '1px solid #f1f5f9',
      fontSize: isMobile ? '14px' : '14px',
      transition: 'background-color 0.2s',
      cursor: 'pointer',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      gap: isMobile ? '8px' : '0',
      alignItems: 'center',
    },
    
    tableCell: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    
    // RIGHT PANEL - User Creation Form
    rightPanel: {
      flex: 1,
      minWidth: isMobile ? '100%' : '350px',
      width: '100%',
    },
    
    rightHeader: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'flex-start',
      marginBottom: isMobile ? '20px' : '30px',
      flexWrap: 'wrap',
      gap: isMobile ? '12px' : '20px',
    },
    
    rightTitleContainer: {
      flex: 1,
    },
    
    rightTitle: {
      fontSize: isMobile ? '18px' : '18px',
      fontWeight: 700,
      marginBottom: '6px',
      color: '#11303F',
      letterSpacing: '-0.3px',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      lineHeight: 1.3,
    },
    
    rightSubtitle: {
      color: '#666',
      fontSize: isMobile ? '13px' : '14px',
      margin: 0,
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      fontWeight: 400,
      opacity: 0.8,
    },
    
    actionButtonsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '8px' : '12px',
      minWidth: isMobile ? '100%' : '250px',
      justifyContent: isMobile ? 'flex-start' : 'flex-end',
      width: isMobile ? '100%' : 'auto',
    },
    
    actionButtonsGroup: {
      display: 'flex',
      gap: isMobile ? '6px' : '8px',
      alignItems: 'center',
      flexWrap: 'wrap',
      width: isMobile ? '100%' : 'auto',
      justifyContent: isMobile ? 'space-between' : 'flex-end',
    },
    
    actionPill: {
      display: 'inline-flex',
      gap: '6px',
      alignItems: 'center',
      padding: isMobile ? '8px 10px' : '10px 14px',
      borderRadius: '999px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(250,250,252,0.9))',
      border: '1px solid rgba(255,255,255,0.45)',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(2,6,23,0.04)',
      fontWeight: 600,
      fontSize: isMobile ? '13px' : '14px',
      color: '#334155',
      transition: 'all 0.2s ease',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      outline: 'none',
      minWidth: isMobile ? '30%' : '80px',
      justifyContent: 'center',
      flex: isMobile ? '1' : 'none',
      boxSizing: 'border-box',
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
    },
    
    actionPillHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(2,6,23,0.08)',
      borderColor: 'rgba(48,122,200,0.2)',
    },
    
    actionPillAdd: {
      color: 'white',
      background: 'linear-gradient(180deg, #306AC8, #1B91DA)',
      borderColor: 'rgba(48,122,200,0.3)',
    },
    
    actionPillEdit: {
      color: 'white',
      background: 'linear-gradient(180deg, #f59e0b, #f97316)',
      borderColor: 'rgba(245,158,11,0.3)',
    },
    
    actionPillDelete: {
      color: 'white',
      background: 'linear-gradient(180deg, #ef4444, #f97373)',
      borderColor: 'rgba(239,68,68,0.3)',
    },
    
    formContainer: {
      background: '#fafcff',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '20px' : '28px',
      border: '1px solid #e1e8f0',
      width: '100%',
      boxSizing: 'border-box',
    },
    
    formGroup: {
      marginBottom: isMobile ? '18px' : '24px',
    },
    
    formLabel: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: 700,
      fontSize: isMobile ? '14px' : '14px',
      color: '#334155',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      letterSpacing: '0.01em',
    },
    
    formInputContainer: {
      position: 'relative',
      width: '100%',
    },
    
    formInput: {
      padding: isMobile ? '12px 14px' : '14px 16px',
      width: '100%',
      border: '2px solid #e1e8f0',
      borderRadius: isMobile ? '10px' : '10px',
      fontSize: isMobile ? '14px' : '14px',
      background: 'white',
      color: '#0f172a',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      outline: 'none',
      boxSizing: 'border-box',
      fontWeight: 500,
    },
    
    companyInput: {
      padding: isMobile ? '12px 14px 12px 42px' : '14px 16px 14px 45px',
      width: '100%',
      border: '2px solid #e1e8f0',
      borderRadius: isMobile ? '10px' : '10px',
      fontSize: isMobile ? '14px' : '14px',
      background: 'white',
      color: '#0f172a',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      outline: 'none',
      boxSizing: 'border-box',
      fontWeight: 500,
      cursor: 'pointer',
    },
    
    companyIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8',
      fontSize: isMobile ? '14px' : '14px',
    },
    
    formActions: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'flex-end',
      gap: isMobile ? '12px' : '16px',
      marginTop: isMobile ? '28px' : '32px',
      paddingTop: isMobile ? '20px' : '24px',
      borderTop: '1px solid #e1e8f0',
      width: '100%',
    },
    
    submitButton: {
      padding: isMobile ? '14px 24px' : '16px 32px',
      background: 'linear-gradient(135deg, #06A7EA 0%, #1B91DA 100%)',
      borderRadius: isMobile ? '10px' : '10px',
      border: 'none',
      color: 'white',
      fontWeight: 600,
      fontSize: isMobile ? '14px' : '14px',
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(6, 167, 234, 0.25)',
      minWidth: isMobile ? '100%' : '140px',
      outline: 'none',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      boxSizing: 'border-box',
      letterSpacing: '0.01em',
    },
    
    submitButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(6, 167, 234, 0.4)',
    },
    
    clearButton: {
      padding: isMobile ? '14px 24px' : '16px 32px',
      background: 'white',
      borderRadius: isMobile ? '10px' : '10px',
      border: '2px solid #e1e8f0',
      color: '#475569',
      fontWeight: 600,
      fontSize: isMobile ? '14px' : '14px',
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      minWidth: isMobile ? '100%' : '140px',
      outline: 'none',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      boxSizing: 'border-box',
      letterSpacing: '0.01em',
    },
    
    clearButtonHover: {
      borderColor: '#1B91DA',
      color: '#1B91DA',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(48, 122, 200, 0.1)',
    },
    
    noDataMessage: {
      textAlign: 'center',
      padding: isMobile ? '20px 15px' : '40px 20px',
      color: '#64748b',
      fontSize: isMobile ? '14px' : '15px',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      fontWeight: 400,
    },
    
    // Error message
    errorContainer: {
      background: '#fff1f2',
      color: '#9f1239',
      padding: isMobile ? '12px' : '15px',
      borderRadius: '10px',
      marginBottom: isMobile ? '16px' : '20px',
      textAlign: 'center',
      borderLeft: '4px solid #ef4444',
      fontSize: isMobile ? '14px' : '15px',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
    },
  };

  const getPrimaryButtonStyle = () => {
    if (mode === "edit") return {
      ...styles.submitButton,
      background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
    };
    if (mode === "delete") return {
      ...styles.submitButton,
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
    };
    return styles.submitButton;
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
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          .action-pill:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(2,6,23,0.08);
            border-color: rgba(48,122,200,0.2);
          }
          
          .form-input-focus {
            box-shadow: 0 0 0 3px rgba(6,167,234,0.25);
            border: 1px solid #06A7EA;
            outline: none;
          }
          
          .table-row-hover {
            background-color: #f8fafc !important;
          }
          
          @media (max-width: 768px) {
            input, button, select, textarea {
              font-size: 16px !important;
            }
            
            button {
              min-height: 44px;
            }
            
            input, select {
              min-height: 44px;
            }
          }
        `}
      </style>

      <div style={styles.mainContainer}>
        <div style={styles.twoColumnLayout}>
          {/* LEFT PANEL - Existing Users */}
          <div style={styles.leftPanel}>
            <div style={styles.leftHeader}>
              <h2 style={styles.leftTitle}>
                Existing Users
              </h2>
              <p style={styles.leftSubtitle}>
                View and search through all user records
              </p>
            </div>

            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search users by code, username or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                onFocus={(e) => Object.assign(e.target.style, {
                  boxShadow: '0 0 0 3px rgba(6,167,234,0.25)',
                  border: '1px solid #06A7EA',
                  outline: 'none',
                  background: 'white',
                })}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.border = '2px solid #e1e8f0';
                  e.target.style.background = '#fafcff';
                  e.target.style.outline = 'none';
                }}
              />
              <span style={styles.searchIcon}>
                🔍
              </span>
            </div>

            {/* Users Table */}
            <div style={styles.tableContainer}>
              <div style={styles.tableHeader}>
                <span>Code</span>
                <span>Username</span>
                <span>Company</span>
              </div>

              <div style={styles.tableContent}>
                {filteredUsers.map((user) => (
                  <div
                    key={user.code}
                    style={styles.tableRow}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <span style={{...styles.tableCell, color: '#475569', fontWeight: 500}}>
                      {user.code}
                    </span>
                    <span style={{...styles.tableCell, color: '#0f172a', fontWeight: 500}}>
                      {user.userName}
                    </span>
                    <span style={{...styles.tableCell, color: '#0f172a', fontWeight: 500}}>
                      {user.compaytName}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {filteredUsers.length === 0 && (
              <div style={styles.noDataMessage}>
                {users.length === 0 ? 'No users found' : 'No matching users found. Try a different search term.'}
              </div>
            )}
          </div>

          {/* RIGHT PANEL - User Creation Form */}
          <div style={styles.rightPanel}>
            {error && <div style={styles.errorContainer}>Error: {error}</div>}
            
            <div style={styles.rightHeader}>
              <div style={styles.rightTitleContainer}>
                <h2 style={styles.rightTitle}>
                  User Creation
                </h2>
                <p style={styles.rightSubtitle}>
                  Create or modify user accounts
                </p>
              </div>

              {/* Action Buttons */}
              <div style={styles.actionButtonsContainer}>
                <div style={styles.actionButtonsGroup}>
                  <button
                    className={`action-pill ${mode === 'create' ? 'action-pill-add' : ''}`}
                    onClick={() => {
                      setMode('create');
                      handleClear();
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && setMode('create')}
                    role="button"
                    tabIndex={0}
                    title="Create new user"
                    style={{
                      ...styles.actionPill,
                      ...(mode === 'create' ? styles.actionPillAdd : {})
                    }}
                    onMouseEnter={(e) => {
                      if (mode !== 'create') {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(2,6,23,0.08)';
                        e.target.style.borderColor = 'rgba(48,122,200,0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (mode !== 'create') {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(2,6,23,0.04)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.45)';
                      }
                    }}
                  >
                    ＋ Add
                  </button>
                  <button
                    className={`action-pill ${mode === 'edit' ? 'action-pill-edit' : ''}`}
                    onClick={openEditModal}
                    onKeyDown={(e) => e.key === 'Enter' && openEditModal()}
                    role="button"
                    tabIndex={0}
                    title="Edit existing user"
                    style={{
                      ...styles.actionPill,
                      ...(mode === 'edit' ? styles.actionPillEdit : {})
                    }}
                    onMouseEnter={(e) => {
                      if (mode !== 'edit') {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(2,6,23,0.08)';
                        e.target.style.borderColor = 'rgba(245,158,11,0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (mode !== 'edit') {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(2,6,23,0.04)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.45)';
                      }
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className={`action-pill ${mode === 'delete' ? 'action-pill-delete' : ''}`}
                    onClick={openDeleteModal}
                    onKeyDown={(e) => e.key === 'Enter' && openDeleteModal()}
                    role="button"
                    tabIndex={0}
                    title="Delete user"
                    style={{
                      ...styles.actionPill,
                      ...(mode === 'delete' ? styles.actionPillDelete : {})
                    }}
                    onMouseEnter={(e) => {
                      if (mode !== 'delete') {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(2,6,23,0.08)';
                        e.target.style.borderColor = 'rgba(239,68,68,0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (mode !== 'delete') {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(2,6,23,0.04)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.45)';
                      }
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={styles.formContainer}>
              <form onSubmit={(e) => e.preventDefault()}>
                {/* Company Field */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Company <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <div style={styles.formInputContainer}>
                    <input
                      ref={companyRef}
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
                      placeholder="Click to select company"
                      onKeyDown={onCompanyKeyDown}
                      onClick={openCompanyModal}
                      style={styles.companyInput}
                      onFocus={(e) => Object.assign(e.target.style, {
                        boxShadow: '0 0 0 3px rgba(6,167,234,0.25)',
                        border: '1px solid #06A7EA',
                        outline: 'none',
                        background: 'white',
                      })}
                      onBlur={(e) => {
                        e.target.style.boxShadow = 'none';
                        e.target.style.border = '2px solid #e1e8f0';
                        e.target.style.outline = 'none';
                      }}
                      readOnly
                    />
                    <span style={styles.companyIcon}>
                      🔍
                    </span>
                  </div>
                </div>

                {/* Username Field */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Username <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <input
                    ref={usernameRef}
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                    placeholder="Enter username"
                    onKeyDown={onUsernameKeyDown}
                    style={styles.formInput}
                    onFocus={(e) => Object.assign(e.target.style, {
                      boxShadow: '0 0 0 3px rgba(6,167,234,0.25)',
                      border: '1px solid #06A7EA',
                      outline: 'none',
                      background: 'white',
                    })}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.border = '2px solid #e1e8f0';
                      e.target.style.outline = 'none';
                    }}
                  />
                </div>

                {/* Password Field */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Password <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <input
                    ref={passwordRef}
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                    placeholder="Enter password"
                    onKeyDown={onPasswordKeyDown}
                    style={styles.formInput}
                    onFocus={(e) => Object.assign(e.target.style, {
                      boxShadow: '0 0 0 3px rgba(6,167,234,0.25)',
                      border: '1px solid #06A7EA',
                      outline: 'none',
                      background: 'white',
                    })}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.border = '2px solid #e1e8f0';
                      e.target.style.outline = 'none';
                    }}
                  />
                </div>

                {/* Prefix Field */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Prefix
                  </label>
                  <input
                    ref={prefixRef}
                    type="text"
                    value={form.prefix}
                    onChange={(e) => setForm((s) => ({ ...s, prefix: e.target.value }))}
                    placeholder="Prefix (optional)"
                    onKeyDown={onPrefixKeyDown}
                    style={styles.formInput}
                    onFocus={(e) => Object.assign(e.target.style, {
                      boxShadow: '0 0 0 3px rgba(6,167,234,0.25)',
                      border: '1px solid #06A7EA',
                      outline: 'none',
                      background: 'white',
                    })}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.border = '2px solid #e1e8f0';
                      e.target.style.outline = 'none';
                    }}
                  />
                </div>

                {/* Form Action Buttons */}
                <div style={styles.formActions}>
                  <button
                    type="button"
                    onClick={handleClear}
                    style={styles.clearButton}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#1B91DA';
                      e.target.style.color = '#1B91DA';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(48, 122, 200, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e1e8f0';
                      e.target.style.color = '#475569';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = '0 0 0 3px rgba(6,167,234,0.25)';
                      e.target.style.borderColor = '#06A7EA';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = '#e1e8f0';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.outline = 'none';
                    }}
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    disabled={loading}
                    style={getPrimaryButtonStyle()}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(6, 167, 234, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                      }
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = '0 0 0 3px rgba(6,167,234,0.25), 0 4px 12px rgba(6, 167, 234, 0.25)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {getPrimaryButtonText()}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* PopupListSelector */}
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

      {/* Delete Warning Modal */}
      {showDeleteWarning && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isMobile ? '10px' : '20px',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
          overflowY: 'auto',
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
        }}>
          <div style={{
            background: 'white',
            borderRadius: isMobile ? '14px' : '16px',
            width: '100%',
            maxWidth: isMobile ? '95%' : '600px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease-out',
            maxHeight: isMobile ? '90vh' : 'auto',
            overflowY: 'auto',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: isMobile ? '18px 22px' : '22px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: isMobile ? '18px' : '20px', 
                fontWeight: 600,
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                flex: 1,
                letterSpacing: '-0.01em',
              }}>
                ⚠️ Delete Operation Failed
              </h3>
              <button
                onClick={closeDeleteWarning}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  fontSize: isMobile ? '24px' : '28px',
                  color: 'white',
                  cursor: 'pointer',
                  width: isMobile ? '32px' : '36px',
                  height: isMobile ? '32px' : '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  outline: 'none',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  flexShrink: 0,
                  marginLeft: '12px',
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onFocus={(e) => e.target.style.outline = 'none'}
              >
                ×
              </button>
            </div>

            <div style={{ 
              padding: isMobile ? '22px 18px' : '32px 28px',
              overflowY: 'auto',
              maxHeight: isMobile ? 'calc(90vh - 70px)' : 'none',
            }}>
              <div style={{ 
                fontSize: isMobile ? '15px' : '16px', 
                color: '#1e293b',
                lineHeight: 1.6,
                margin: 0,
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                fontWeight: 400,
                whiteSpace: 'pre-line',
              }}>
                {deleteWarningMessage}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: isMobile ? '12px' : '12px',
                marginTop: isMobile ? '28px' : '32px',
                width: '100%',
              }}>
                <button
                  onClick={closeDeleteWarning}
                  style={{
                    padding: isMobile ? '14px 24px' : '16px 32px',
                    background: 'linear-gradient(135deg, #06A7EA 0%, #1B91DA 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: isMobile ? '10px' : '10px',
                    fontWeight: 600,
                    fontSize: isMobile ? '15px' : '16px',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    boxShadow: '0 4px 12px rgba(6, 167, 234, 0.25)',
                    minWidth: isMobile ? '100%' : '140px',
                    outline: 'none',
                    fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                    boxSizing: 'border-box',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(6, 167, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 0 0 3px rgba(6,167,234,0.25), 0 4px 12px rgba(6, 167, 234, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 4px 12px rgba(6, 167, 234, 0.25)';
                  }}
                >
                  OK, I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}