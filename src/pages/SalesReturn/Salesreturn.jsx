import React, { useEffect, useRef, useState } from "react";
import { 
  FaPlus, FaEdit, FaTrash, FaPrint, FaBarcode, 
  FaSave, FaTimes, FaShoppingCart, FaBoxOpen, 
  FaSearch, FaFileInvoiceDollar, FaUser, 
  FaCalendarAlt, FaMobileAlt, FaStore, FaRupeeSign,
  FaShoppingBag
} from "react-icons/fa";

/**
 * SalesReturn component matching the image design
 */
export default function SalesReturn() {
  // ---------- Mock product database ----------
  const productDB = {
    "123456": {
      itemName: "Fauget Cafe Coffee Shop",
      stock: 500,
      mrp: 500,
      uom: "pcs",
      hsn: "ASW090",
      tax: 21,
      srate: 2000000,
    },
    "111222": {
      itemName: "Coffee Beans 1kg",
      stock: 120,
      mrp: 1200,
      uom: "kg",
      hsn: "CB1001",
      tax: 12,
      srate: 1100,
    },
    "999888": {
      itemName: "Chocolate Bar",
      stock: 1000,
      mrp: 50,
      uom: "pcs",
      hsn: "CHOC01",
      tax: 18,
      srate: 45,
    },
    "AADDFF": {
      itemName: "Fauget Cafe Coffee Shop",
      stock: 500,
      mrp: 500,
      uom: "pcs",
      hsn: "ASW090",
      tax: 21,
      srate: 2000000,
    },
  };

  // ---------- State ----------
  const [form, setForm] = useState({
    billNo: "",
    mobile: "",
    mode: "Retail",
    barcode: "",
    billDate: "",
    customer: "",
    salesman: "",
  });

  const [rows, setRows] = useState([
    {
      id: 1,
      barcode: "",
      itemName: "",
      stock: 0,
      mrp: 0,
      uom: "",
      hsn: "",
      tax: 0,
      srate: 0,
      qty: 0,
      amount: 0,
    }
  ]);
  const [nextId, setNextId] = useState(2);
  const [selectedRowId, setSelectedRowId] = useState(1);
  const [toast, setToast] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedInput, setFocusedInput] = useState("billNo");
  const [currentField, setCurrentField] = useState("billNo");
  
  const billNoRef = useRef(null);
  const billDateRef = useRef(null);
  const mobileRef = useRef(null);
  const customerRef = useRef(null);
  const modeRef = useRef(null);
  const salesmanRef = useRef(null);
  const barcodeRef = useRef(null);

  // ---------- Helpers ----------
  const showToast = (msg, ms = 1600) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  const beep = (freq = 800, duration = 120) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      setTimeout(() => {
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.01);
        o.stop(ctx.currentTime + 0.02);
        try {
          ctx.close();
        } catch {}
      }, duration);
    } catch {}
  };

  const updateField = (field, value) =>
    setForm((s) => ({ ...s, [field]: value }));

  const calcAmount = (row) => {
    const s = Number(row.srate) || 0;
    const q = Number(row.qty) || 0;
    return s * q;
  };

  // ---------- Navigation between fields ----------
  const navigateToNextField = () => {
    const fieldsOrder = [
      "billNo", "billDate", "mobile", "customer", 
      "mode", "salesman", "barcode"
    ];
    const currentIndex = fieldsOrder.indexOf(currentField);
    
    if (currentIndex < fieldsOrder.length - 1) {
      const nextField = fieldsOrder[currentIndex + 1];
      setCurrentField(nextField);
      focusOnField(nextField);
    } else {
      // Move to table row barcode field
      setCurrentField("rowBarcode");
      setEditingCell({ rowId: 1, field: "barcode" });
      setTimeout(() => {
        const barcodeInput = document.querySelector(`input[data-row="1"][data-field="barcode"]`);
        if (barcodeInput) barcodeInput.focus();
      }, 10);
    }
  };

  const focusOnField = (field) => {
    switch(field) {
      case "billNo":
        billNoRef.current?.focus();
        break;
      case "billDate":
        billDateRef.current?.focus();
        break;
      case "mobile":
        mobileRef.current?.focus();
        break;
      case "customer":
        customerRef.current?.focus();
        break;
      case "mode":
        modeRef.current?.focus();
        break;
      case "salesman":
        salesmanRef.current?.focus();
        break;
      case "barcode":
        barcodeRef.current?.focus();
        break;
    }
    setFocusedInput(field);
  };

  // ---------- Row operations ----------
  const addRowByBarcode = (barcode) => {
    if (!barcode || barcode.trim() === "") {
      showToast("Empty barcode");
      return;
    }

    const product = productDB[barcode];
    const newRow = {
      id: nextId,
      barcode,
      itemName: product ? product.itemName : "Unknown Item",
      stock: product ? product.stock : 0,
      mrp: product ? product.mrp : 0,
      uom: product ? product.uom : "",
      hsn: product ? product.hsn : "",
      tax: product ? product.tax : 0,
      srate: product ? product.srate : 0,
      qty: product ? 100 : 1,
      amount: product ? product.srate * 100 : 0,
    };

    setRows((r) => [...r, newRow]);
    setNextId((n) => n + 1);
    setSelectedRowId(newRow.id);
    setEditingCell({ rowId: newRow.id, field: "barcode" });
    setCurrentField("rowBarcode");
    showToast("Item added");
    beep();
  };

  const handleBarcodeKey = (e) => {
    if (e.key === "Enter") {
      addRowByBarcode(form.barcode.trim());
      updateField("barcode", "");
    }
  };

  const editCell = (id, field, rawValue) => {
    const value =
      field === "qty" || field === "srate" ? Number(rawValue) || 0 : rawValue;
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        // If barcode is entered, look up product details
        if (field === "barcode" && value.trim() !== "") {
          const product = productDB[value.trim()];
          if (product) {
            updated.itemName = product.itemName;
            updated.stock = product.stock;
            updated.mrp = product.mrp;
            updated.uom = product.uom;
            updated.hsn = product.hsn;
            updated.tax = product.tax;
            updated.srate = product.srate;
            updated.qty = 100;
          }
        }
        updated.amount = calcAmount(updated);
        return updated;
      })
    );
  };

  const handleCellKeyDown = (e, rowId, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      const fieldsOrder = ["barcode", "itemName", "stock", "mrp", "uom", "hsn", "tax", "srate", "qty"];
      const currentIndex = fieldsOrder.indexOf(field);
      
      if (currentIndex < fieldsOrder.length - 1) {
        // Move to next field in same row
        const nextField = fieldsOrder[currentIndex + 1];
        setEditingCell({ rowId, field: nextField });
        setCurrentField("row" + nextField.charAt(0).toUpperCase() + nextField.slice(1));
        
        // Focus on the next field
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-row="${rowId}"][data-field="${nextField}"]`);
          if (nextInput) nextInput.focus();
        }, 10);
      } else {
        // On last field (QTY), create new row if needed
        const newRowId = nextId;
        const newRow = {
          id: newRowId,
          barcode: "",
          itemName: "",
          stock: 0,
          mrp: 0,
          uom: "",
          hsn: "",
          tax: 0,
          srate: 0,
          qty: 0,
          amount: 0,
        };
        
        setRows((prev) => [...prev, newRow]);
        setNextId((n) => n + 1);
        setSelectedRowId(newRowId);
        setEditingCell({ rowId: newRowId, field: "barcode" });
        setCurrentField("rowBarcode");
        
        // Focus on new row's barcode field
        setTimeout(() => {
          const newBarcodeInput = document.querySelector(`input[data-row="${newRowId}"][data-field="barcode"]`);
          if (newBarcodeInput) newBarcodeInput.focus();
        }, 10);
        
        showToast("New row added");
      }
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setCurrentField(null);
    }
  };

  const deleteRow = (id) => {
    if (rows.length === 1) {
      showToast("Cannot delete the only row");
      return;
    }
    
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (selectedRowId === id) {
      const remainingRows = rows.filter(r => r.id !== id);
      setSelectedRowId(remainingRows[0]?.id || null);
    }
    showToast("Item deleted");
  };

  const clearAll = () => {
    setRows([
      {
        id: 1,
        barcode: "",
        itemName: "",
        stock: 0,
        mrp: 0,
        uom: "",
        hsn: "",
        tax: 0,
        srate: 0,
        qty: 0,
        amount: 0,
      }
    ]);
    setNextId(2);
    setSelectedRowId(1);
    setEditingCell({ rowId: 1, field: "barcode" });
    setCurrentField("billNo");
    setForm({
      billNo: "",
      mobile: "",
      mode: "Retail",
      barcode: "",
      billDate: "",
      customer: "",
      salesman: "",
    });
    showToast("Cleared all items");
    focusOnField("billNo");
  };

  const saveData = () => {
    const payload = { form, rows, total: rows.reduce((s, r) => s + r.amount, 0) };
    console.log("Saving payload: ", payload);
    showToast("Sales return saved successfully");
  };

  // ---------- Keyboard shortcuts ----------
  useEffect(() => {
    const onKey = (ev) => {
      // F2 moves focus to next field
      if (ev.key === "F2") {
        ev.preventDefault();
        navigateToNextField();
        showToast(`Focus: ${currentField}`);
      }

      if (ev.key === "F3") {
        ev.preventDefault();
        if (selectedRowId != null) {
          deleteRow(selectedRowId);
          showToast("Deleted row " + selectedRowId);
        }
      }

      if (ev.key === "F4") {
        ev.preventDefault();
        saveData();
      }

      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "s") {
        ev.preventDefault();
        saveData();
      }

      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "p") {
        ev.preventDefault();
        window.print();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedRowId, rows, currentField]);

  const netTotal = rows.reduce((s, r) => s + (r.amount || 0), 0);

  // ---------- EXACT Styles matching the image ----------
  const styles = {
    page: {
      width: "100%",
      minHeight: "100vh",
      background: "#e8f4f8", // Light blue-gray background from image
      fontFamily: "'Segoe UI', Arial, sans-serif",
      padding: "20px",
    },

    // Header - Store Name
    storeHeader: {
      background: "linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)", // Dark blue gradient
      color: "white",
      padding: "15px 20px",
      borderRadius: "8px 8px 0 0",
      marginBottom: "0",
      fontSize: "22px",
      fontWeight: "bold",
      textAlign: "center",
      letterSpacing: "1px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      borderBottom: "3px solid #154360",
    },

    // Main Container
    mainContainer: {
      background: "white",
      borderRadius: "0 0 8px 8px",
      boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
      overflow: "hidden",
    },

    // Billing Section
    billingSection: {
      padding: "25px",
      borderBottom: "2px solid #eaeaea",
    },

    billingTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#1a5276",
      marginBottom: "20px",
      paddingBottom: "10px",
      borderBottom: "2px solid #1a5276",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    billingGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      marginBottom: "25px",
    },

    // Form Group - Exact from image
    formGroup: {
      display: "flex",
      flexDirection: "column",
    },

    formLabel: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#2c3e50",
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },

    // Input Style - Exact from image
    input: {
      padding: "12px 15px",
      border: "2px solid #bdc3c7",
      borderRadius: "6px",
      fontSize: "14px",
      color: "#2c3e50",
      backgroundColor: "#f8f9fa",
      outline: "none",
      height: "45px",
      boxSizing: "border-box",
      transition: "all 0.3s",
      fontFamily: "inherit",
    },

    inputFocus: {
      borderColor: "#3498db",
      backgroundColor: "white",
      boxShadow: "0 0 0 3px rgba(52, 152, 219, 0.2)",
    },

    select: {
      padding: "12px 15px",
      border: "2px solid #bdc3c7",
      borderRadius: "6px",
      fontSize: "14px",
      color: "#2c3e50",
      backgroundColor: "#f8f9fa",
      cursor: "pointer",
      appearance: "none",
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%232c3e50' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 15px center",
      backgroundSize: "12px",
      paddingRight: "40px",
      height: "45px",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },

    // Action Buttons Container
    actionButtons: {
      display: "flex",
      gap: "15px",
      justifyContent: "center",
      marginTop: "10px",
    },

    // Button Style - Exact from image
    button: {
      padding: "12px 25px",
      borderRadius: "6px",
      border: "none",
      fontSize: "14px",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      transition: "all 0.3s",
      minWidth: "120px",
      height: "45px",
      fontFamily: "inherit",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    },

    // Specific button colors from image
    addButton: {
      backgroundColor: "#27ae60", // Green
      color: "white",
      border: "2px solid #219653",
    },

    addButtonHover: {
      backgroundColor: "#219653",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(39, 174, 96, 0.3)",
    },

    editButton: {
      backgroundColor: "#3498db", // Blue
      color: "white",
      border: "2px solid #2980b9",
    },

    editButtonHover: {
      backgroundColor: "#2980b9",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(52, 152, 219, 0.3)",
    },

    deleteButton: {
      backgroundColor: "#e74c3c", // Red
      color: "white",
      border: "2px solid #c0392b",
    },

    deleteButtonHover: {
      backgroundColor: "#c0392b",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(231, 76, 60, 0.3)",
    },

    // Table Section
    tableSection: {
      padding: "25px",
    },

    tableHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },

    tableTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#1a5276",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    searchContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    searchLabel: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#2c3e50",
    },

    searchInput: {
      padding: "10px 15px",
      border: "2px solid #bdc3c7",
      borderRadius: "6px",
      fontSize: "14px",
      width: "250px",
      outline: "none",
      height: "40px",
      boxSizing: "border-box",
      backgroundColor: "#f8f9fa",
      fontFamily: "inherit",
    },

    // Table Styles - Exact from image
    tableWrapper: {
      overflowX: "auto",
      borderRadius: "8px",
      border: "2px solid #e0e0e0",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "13px",
      minWidth: "1200px",
    },

    tableHead: {
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    },

    th: {
      padding: "14px 10px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "bold",
      color: "white",
      borderRight: "1px solid #3d566e",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },

    td: {
      padding: "12px 10px",
      borderBottom: "1px solid #e0e0e0",
      borderRight: "1px solid #e0e0e0",
      color: "#2c3e50",
      fontSize: "13px",
    },

    // Table row styling
    tr: {
      transition: "background-color 0.2s",
    },

    trHover: {
      backgroundColor: "#f5f9ff",
    },

    trSelected: {
      backgroundColor: "#e8f4fc",
    },

    // Table Input Style
    tableInput: {
      width: "100%",
      padding: "8px 10px",
      border: "1px solid #d5dbdb",
      borderRadius: "4px",
      fontSize: "13px",
      backgroundColor: "white",
      color: "#2c3e50",
      outline: "none",
      height: "35px",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },

    tableInputFocus: {
      borderColor: "#3498db",
      boxShadow: "0 0 0 2px rgba(52, 152, 219, 0.2)",
    },

    // Table Action Button
    tableActionButton: {
      padding: "8px 15px",
      borderRadius: "4px",
      border: "none",
      fontSize: "12px",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      transition: "all 0.3s",
      height: "35px",
      minWidth: "90px",
      fontFamily: "inherit",
      textTransform: "uppercase",
    },

    // Footer Section
    footerSection: {
      background: "#f8f9fa",
      padding: "20px 25px",
      borderTop: "2px solid #e0e0e0",
    },

    footerContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    summarySection: {
      display: "flex",
      gap: "40px",
      alignItems: "center",
    },

    summaryItem: {
      display: "flex",
      flexDirection: "column",
    },

    summaryLabel: {
      fontSize: "13px",
      color: "#7f8c8d",
      marginBottom: "5px",
      fontWeight: "600",
      textTransform: "uppercase",
    },

    summaryValue: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#2c3e50",
    },

    totalBox: {
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      color: "white",
      padding: "20px 35px",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      minWidth: "200px",
    },

    totalLabel: {
      fontSize: "12px",
      marginBottom: "8px",
      opacity: "0.9",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },

    totalAmount: {
      fontSize: "24px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    footerButtons: {
      display: "flex",
      gap: "15px",
    },

    // Footer buttons specific styles
    clearButton: {
      backgroundColor: "#e74c3c",
      color: "white",
      border: "2px solid #c0392b",
      padding: "12px 30px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      height: "45px",
      minWidth: "120px",
      justifyContent: "center",
      textTransform: "uppercase",
      fontFamily: "inherit",
      letterSpacing: "0.5px",
    },

    clearButtonHover: {
      backgroundColor: "#c0392b",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(231, 76, 60, 0.3)",
    },

    saveButton: {
      backgroundColor: "#27ae60",
      color: "white",
      border: "2px solid #219653",
      padding: "12px 30px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      height: "45px",
      minWidth: "120px",
      justifyContent: "center",
      textTransform: "uppercase",
      fontFamily: "inherit",
      letterSpacing: "0.5px",
    },

    saveButtonHover: {
      backgroundColor: "#219653",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(39, 174, 96, 0.3)",
    },

    // Toast Notification
    toast: {
      position: "fixed",
      bottom: "25px",
      right: "25px",
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      color: "white",
      padding: "15px 25px",
      borderRadius: "8px",
      boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minWidth: "280px",
      zIndex: 1000,
      animation: "slideIn 0.3s ease",
      borderLeft: "4px solid #3498db",
    },
  };

  // Helper function to get input style based on focus state
  const getInputStyle = (field) => {
    const baseStyle = styles.input;
    if (focusedInput === field) {
      return { ...baseStyle, ...styles.inputFocus };
    }
    return baseStyle;
  };

  const getTableInputStyle = (rowId, field) => {
    const baseStyle = styles.tableInput;
    if (editingCell?.rowId === rowId && editingCell?.field === field) {
      return { ...baseStyle, ...styles.tableInputFocus };
    }
    return baseStyle;
  };

  // Handle Enter key in form fields
  const handleFormFieldKeyDown = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      navigateToNextField();
    }
  };

  // ---------- Render ----------
  return (
    <div style={styles.page}>
      {/* Store Header */}
      <div style={styles.storeHeader}>
        Shankarapandian Stores
      </div>

      {/* Main Container */}
      <div style={styles.mainContainer}>
        {/* Billing Details Section */}
        <div style={styles.billingSection}>
          <div style={styles.billingTitle}>
            <FaFileInvoiceDollar /> Billing Details
          </div>
          
          <div style={styles.billingGrid}>
            {/* Bill No */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Bill No</label>
              <input
                ref={billNoRef}
                style={getInputStyle('billNo')}
                value={form.billNo}
                onChange={(e) => updateField("billNo", e.target.value)}
                onFocus={() => {
                  setFocusedInput('billNo');
                  setCurrentField('billNo');
                }}
                onBlur={() => setFocusedInput(null)}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'billNo')}
              />
            </div>

            {/* Bill Date */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Bill Date</label>
              <input
                ref={billDateRef}
                style={getInputStyle('billDate')}
                value={form.billDate}
                onChange={(e) => updateField("billDate", e.target.value)}
                onFocus={() => {
                  setFocusedInput('billDate');
                  setCurrentField('billDate');
                }}
                onBlur={() => setFocusedInput(null)}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'billDate')}
              />
            </div>

            {/* Mobile No */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Mobile No</label>
              <input
                ref={mobileRef}
                style={getInputStyle('mobile')}
                value={form.mobile}
                onChange={(e) => updateField("mobile", e.target.value)}
                onFocus={() => {
                  setFocusedInput('mobile');
                  setCurrentField('mobile');
                }}
                onBlur={() => setFocusedInput(null)}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'mobile')}
              />
            </div>

            {/* Customer Name */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Customer Name</label>
              <input
                ref={customerRef}
                style={getInputStyle('customer')}
                value={form.customer}
                onChange={(e) => updateField("customer", e.target.value)}
                onFocus={() => {
                  setFocusedInput('customer');
                  setCurrentField('customer');
                }}
                onBlur={() => setFocusedInput(null)}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'customer')}
              />
            </div>

            {/* Mode */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Mode</label>
              <select
                ref={modeRef}
                style={styles.select}
                value={form.mode}
                onChange={(e) => updateField("mode", e.target.value)}
                onFocus={() => {
                  setFocusedInput('mode');
                  setCurrentField('mode');
                }}
                onBlur={() => setFocusedInput(null)}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'mode')}
              >
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Bulk">Bulk Order</option>
              </select>
            </div>

            {/* Salesman */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Salesman</label>
              <input
                ref={salesmanRef}
                style={getInputStyle('salesman')}
                value={form.salesman}
                onChange={(e) => updateField("salesman", e.target.value)}
                onFocus={() => {
                  setFocusedInput('salesman');
                  setCurrentField('salesman');
                }}
                onBlur={() => setFocusedInput(null)}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'salesman')}
              />
            </div>

            {/* Barcode */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Barcode</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  ref={barcodeRef}
                  style={{...getInputStyle('barcode'), flex: 1}}
                  value={form.barcode}
                  onChange={(e) => updateField("barcode", e.target.value)}
                 
                  onFocus={() => {
                    setFocusedInput('barcode');
                    setCurrentField('barcode');
                  }}
                  onBlur={() => setFocusedInput(null)}
                  onKeyDown={(e) => {
                    handleFormFieldKeyDown(e, 'barcode');
                    handleBarcodeKey(e);
                  }}
                />
              </div>
            </div>
          </div>

          <div style={styles.actionButtons}>
            <button 
              style={{...styles.button, ...styles.addButton}}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.addButtonHover)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, {...styles.button, ...styles.addButton})}
              onClick={() => addRowByBarcode(form.barcode.trim())}
            >
              <FaPlus /> ADD
            </button>
            
            <button 
              style={{...styles.button, ...styles.editButton}}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.editButtonHover)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, {...styles.button, ...styles.editButton})}
            >
              <FaEdit /> EDIT
            </button>
            
            <button 
              style={{...styles.button, ...styles.deleteButton}}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.deleteButtonHover)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, {...styles.button, ...styles.deleteButton})}
              onClick={() => selectedRowId && deleteRow(selectedRowId)}
            >
              <FaTrash /> DELETE
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div style={styles.tableSection}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>
              <FaShoppingBag /> Items List
            </div>
            
            <div style={styles.searchContainer}>
              <label style={styles.searchLabel}>Search:</label>
              <input
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type here to search"
                onFocus={() => setFocusedInput('search')}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.th}>S.NO</th>
                  <th style={styles.th}>BARCODE</th>
                  <th style={styles.th}>ITEM NAME</th>
                  <th style={styles.th}>STOCK</th>
                  <th style={styles.th}>MRP</th>
                  <th style={styles.th}>UOM</th>
                  <th style={styles.th}>HSN</th>
                  <th style={styles.th}>TAX</th>
                  <th style={styles.th}>S RATE</th>
                  <th style={styles.th}>QTY</th>
                  <th style={styles.th}>AMOUNT</th>
                  <th style={styles.th}>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr 
                    key={r.id}
                    onClick={() => {
                      setSelectedRowId(r.id);
                      setCurrentField("rowBarcode");
                      setEditingCell({ rowId: r.id, field: "barcode" });
                    }}
                    style={{
                      ...styles.tr,
                      ...(selectedRowId === r.id ? styles.trSelected : {}),
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f9ff"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedRowId === r.id ? "#e8f4fc" : "white"}
                  >
                    <td style={styles.td}>{r.id}</td>
                    
                    <td style={styles.td}>
                      <input
                        data-row={r.id}
                        data-field="barcode"
                        style={getTableInputStyle(r.id, "barcode")}
                        value={r.barcode}
                        onChange={(e) => editCell(r.id, "barcode", e.target.value)}
                        onFocus={() => {
                          setEditingCell({ rowId: r.id, field: "barcode" });
                          setSelectedRowId(r.id);
                          setCurrentField("rowBarcode");
                        }}
                        onBlur={() => {}}
                        onKeyDown={(e) => handleCellKeyDown(e, r.id, "barcode")}
                      />
                    </td>
                    
                    <td style={styles.td}>
                      <input
                        data-row={r.id}
                        data-field="itemName"
                        style={getTableInputStyle(r.id, "itemName")}
                        value={r.itemName}
                        onChange={(e) => editCell(r.id, "itemName", e.target.value)}
                        onFocus={() => {
                          setEditingCell({ rowId: r.id, field: "itemName" });
                          setSelectedRowId(r.id);
                          setCurrentField("rowItemName");
                        }}
                        onBlur={() => {}}
                        onKeyDown={(e) => handleCellKeyDown(e, r.id, "itemName")}
                      />
                    </td>
                    
                    <td style={styles.td}>
                      <input
                        data-row={r.id}
                        data-field="stock"
                        style={getTableInputStyle(r.id, "stock")}
                        value={r.stock}
                        readOnly
                      />
                    </td>
                    
                    <td style={styles.td}>
                      <input
                        data-row={r.id}
                        data-field="mrp"
                        style={getTableInputStyle(r.id, "mrp")}
                        value={r.mrp}
                        onChange={(e) => editCell(r.id, "mrp", e.target.value)}
                        onFocus={() => {
                          setEditingCell({ rowId: r.id, field: "mrp" });
                          setSelectedRowId(r.id);
                          setCurrentField("rowMrp");
                        }}
                        onBlur={() => {}}
                        onKeyDown={(e) => handleCellKeyDown(e, r.id, "mrp")}
                      />
                    </td>
                    
                    <td style={styles.td}>
                      <input
                        data-row={r.id}
                        data-field="uom"
                        style={getTableInputStyle(r.id, "uom")}
                        value={r.uom}
                        onChange={(e) => editCell(r.id, "uom", e.target.value)}
                        onFocus={() => {
                          setEditingCell({ rowId: r.id, field: "uom" });
                          setSelectedRowId(r.id);
                          setCurrentField("rowUom");
                        }}
                        onBlur={() => {}}
                        onKeyDown={(e) => handleCellKeyDown(e, r.id, "uom")}
                      />
                    </td>
                    
                    <td style={styles.td}>
                      <input
                        data-row={r.id}
                        data-field="hsn"
                        style={getTableInputStyle(r.id, "hsn")}
                        value={r.hsn}
                        onChange={(e) => editCell(r.id, "hsn", e.target.value)}
                        onFocus={() => {
                          setEditingCell({ rowId: r.id, field: "hsn" });
                          setSelectedRowId(r.id);
                          setCurrentField("rowHsn");
                        }}
                        onBlur={() => {}}
                        onKeyDown={(e) => handleCellKeyDown(e, r.id, "hsn")}
                      />
                    </td>
                    
                    <td style={styles.td}>
                      <input
                        data-row={r.id}
                        data-field="tax"
                        style={getTableInputStyle(r.id, "tax")}
                        value={r.tax}
                        onChange={(e) => editCell(r.id, "tax", e.target.value)}
                        onFocus={() => {
                          setEditingCell({ rowId: r.id, field: "tax" });
                          setSelectedRowId(r.id);
                          setCurrentField("rowTax");
                        }}
                        onBlur={() => {}}
                        onKeyDown={(e) => handleCellKeyDown(e, r.id, "tax")}
                      />
                    </td>
                    
                    <td style={styles.td}>
                      <input
                        data-row={r.id}
                        data-field="srate"
                        style={getTableInputStyle(r.id, "srate")}
                        value={r.srate}
                        onChange={(e) => editCell(r.id, "srate", e.target.value)}
                        onFocus={() => {
                          setEditingCell({ rowId: r.id, field: "srate" });
                          setSelectedRowId(r.id);
                          setCurrentField("rowSrate");
                        }}
                        onBlur={() => {}}
                        onKeyDown={(e) => handleCellKeyDown(e, r.id, "srate")}
                      />
                    </td>
                    
                    <td style={styles.td}>
                      <input
                        data-row={r.id}
                        data-field="qty"
                        style={getTableInputStyle(r.id, "qty")}
                        value={r.qty}
                        onChange={(e) => editCell(r.id, "qty", e.target.value)}
                        onFocus={() => {
                          setEditingCell({ rowId: r.id, field: "qty" });
                          setSelectedRowId(r.id);
                          setCurrentField("rowQty");
                        }}
                        onBlur={() => {}}
                        onKeyDown={(e) => handleCellKeyDown(e, r.id, "qty")}
                      />
                    </td>
                    
                    <td style={styles.td}>₹{r.amount.toLocaleString('en-IN')}</td>
                    
                    <td style={styles.td}>
                      <button
                        style={{...styles.tableActionButton, ...styles.deleteButton}}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          deleteRow(r.id);
                        }}
                      >
                        <FaTimes /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Section */}
        <div style={styles.footerSection}>
          <div style={styles.footerContent}>
            <div style={styles.summarySection}>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Net</div>
                <div style={styles.summaryValue}>₹{netTotal.toLocaleString('en-IN')}</div>
              </div>
              
              <div style={styles.totalBox}>
                <div style={styles.totalLabel}>Total Amount</div>
                <div style={styles.totalAmount}>
                  <FaRupeeSign /> {(netTotal).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div style={styles.footerButtons}>
              <button 
                style={styles.clearButton}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.clearButtonHover)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.clearButton)}
                onClick={clearAll}
              >
                <FaTimes /> Clear
              </button>
              
              <button 
                style={styles.saveButton}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.saveButtonHover)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.saveButton)}
                onClick={saveData}
              >
                <FaSave /> Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div style={styles.toast}>
          <FaShoppingCart /> {toast}
        </div>
      )}
    </div>
  );
}