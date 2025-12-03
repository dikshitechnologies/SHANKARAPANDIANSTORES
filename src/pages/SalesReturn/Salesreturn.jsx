import React, { useEffect, useRef, useState } from "react";
import { 
  FaPlus, FaEdit, FaTrash, FaPrint, FaBarcode, 
  FaSave, FaTimes, FaShoppingCart, FaBoxOpen, 
  FaSearch, FaFileInvoiceDollar, FaUser, 
  FaCalendarAlt, FaMobileAlt, FaStore, FaRupeeSign,
  FaShoppingBag
} from "react-icons/fa";

/**
 * SalesReturn component matching the scrap sales image design
 */
export default function SalesReturn() {
  // ---------- Mock product database ----------
  const productDB = {
    "BAR001": {
      itemName: "Scrap Item 1",
      stock: 100,
      mrp: 120,
      uom: "KG",
      hsn: "72044900",
      tax: 18,
      srate: 100,
      wrate: 90,
    },
    "BAR002": {
      itemName: "Scrap Item 2",
      stock: 80,
      mrp: 180,
      uom: "KG",
      hsn: "72044900",
      tax: 18,
      srate: 150,
      wrate: 135,
    },
    "BAR301": {
      itemName: "Scrap Item 1",
      stock: 100,
      mrp: 120,
      uom: "KG",
      hsn: "72044900",
      tax: 18,
      srate: 100,
      wrate: 90,
    },
    "BAR302": {
      itemName: "Scrap Item 2",
      stock: 80,
      mrp: 180,
      uom: "KG",
      hsn: "72044900",
      tax: 18,
      srate: 150,
      wrate: 135,
    },
  };

  // ---------- State ----------
  const [form, setForm] = useState({
    salesman: "",
    billNo: "C400001AA",
    mobile: "8754603732",
    scrapProductName: "Scrap Product Name",
    empName: "EMP Name",
    billDate: "",
    customer: "Priyanka",
    qty: "0",
    items: "Items",
    barcode: "",
  });

  const [rows, setRows] = useState([
    {
      id: 1,
      barcode: "BAR301",
      itemName: "Scrap Item 1",
      stock: 100,
      mrp: 120,
      uom: "KG",
      hsn: "72044900",
      tax: 18,
      srate: 100,
      wrate: 90,
      qty: 10,
      amount: 1000,
    },
    {
      id: 2,
      barcode: "BAR302",
      itemName: "Scrap Item 2",
      stock: 80,
      mrp: 180,
      uom: "KG",
      hsn: "72044900",
      tax: 18,
      srate: 150,
      wrate: 135,
      qty: 5,
      amount: 750,
    }
  ]);
  const [nextId, setNextId] = useState(3);
  const [selectedRowId, setSelectedRowId] = useState(1);
  const [toast, setToast] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedInput, setFocusedInput] = useState("salesman");
  const [currentField, setCurrentField] = useState("salesman");
  
  const salesmanRef = useRef(null);
  const billNoRef = useRef(null);
  const mobileRef = useRef(null);
  const scrapProductRef = useRef(null);
  const empNameRef = useRef(null);
  const billDateRef = useRef(null);
  const customerRef = useRef(null);
  const qtyRef = useRef(null);
  const itemsRef = useRef(null);
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

  // Calculate totals
  const totalQty = rows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0);
  const totalAmount = rows.reduce((sum, row) => sum + (row.amount || 0), 0);

  // ---------- Navigation between fields ----------
  const navigateToNextField = () => {
    const fieldsOrder = [
      "salesman", "billNo", "mobile", "scrapProductName", 
      "empName", "billDate", "customer", "qty", "items", "barcode"
    ];
    const currentIndex = fieldsOrder.indexOf(currentField);
    
    if (currentIndex < fieldsOrder.length - 1) {
      const nextField = fieldsOrder[currentIndex + 1];
      setCurrentField(nextField);
      focusOnField(nextField);
    } else {
      // Move to table row barcode field
      if (rows.length > 0) {
        setCurrentField("rowBarcode");
        setEditingCell({ rowId: rows[0].id, field: "barcode" });
        setTimeout(() => {
          const barcodeInput = document.querySelector(`input[data-row="${rows[0].id}"][data-field="barcode"]`);
          if (barcodeInput) barcodeInput.focus();
        }, 10);
      }
    }
  };

  const focusOnField = (field) => {
    switch(field) {
      case "salesman":
        salesmanRef.current?.focus();
        break;
      case "billNo":
        billNoRef.current?.focus();
        break;
      case "mobile":
        mobileRef.current?.focus();
        break;
      case "scrapProductName":
        scrapProductRef.current?.focus();
        break;
      case "empName":
        empNameRef.current?.focus();
        break;
      case "billDate":
        billDateRef.current?.focus();
        break;
      case "customer":
        customerRef.current?.focus();
        break;
      case "qty":
        qtyRef.current?.focus();
        break;
      case "items":
        itemsRef.current?.focus();
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
      uom: product ? product.uom : "KG",
      hsn: product ? product.hsn : "",
      tax: product ? product.tax : 18,
      srate: product ? product.srate : 0,
      wrate: product ? product.wrate : 0,
      qty: 1,
      amount: product ? product.srate : 0,
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
      field === "qty" || field === "srate" || field === "tax" || 
      field === "stock" || field === "mrp" || field === "wrate" 
        ? Number(rawValue) || 0 
        : rawValue;
    
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
            updated.wrate = product.wrate;
            updated.qty = 1;
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
      
      const fieldsOrder = ["barcode", "itemName", "stock", "mrp", "uom", "hsn", "tax", "srate", "wrate", "qty"];
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
        // On last field (QTY), create new empty row
        const newRowId = nextId;
        const newRow = {
          id: newRowId,
          barcode: "",
          itemName: "",
          stock: 0,
          mrp: 0,
          uom: "KG",
          hsn: "",
          tax: 18,
          srate: 0,
          wrate: 0,
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
        uom: "KG",
        hsn: "",
        tax: 18,
        srate: 0,
        wrate: 0,
        qty: 0,
        amount: 0,
      }
    ]);
    setNextId(2);
    setSelectedRowId(1);
    setEditingCell({ rowId: 1, field: "barcode" });
    setCurrentField("salesman");
    setForm({
      salesman: "",
      billNo: "C400001AA",
      mobile: "8754603732",
      scrapProductName: "Scrap Product Name",
      empName: "EMP Name",
      billDate: "",
      customer: "Priyanka",
      qty: "0",
      items: "Items",
      barcode: "",
    });
    showToast("Cleared all items");
    focusOnField("salesman");
  };

  const saveData = () => {
    const payload = { form, rows, totalQty, totalAmount };
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

  // ---------- EXACT Styles matching the first image ----------
  const styles = {
    page: {
      width: "100%",
      minHeight: "100vh",
      background: "#e8f4f8", // Light blue background from first image
      fontFamily: "'Segoe UI', Arial, sans-serif",
      padding: "20px",
    },

    // Header - Store Name
    storeHeader: {
      background: "linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)", // Blue gradient from first image
      color: "white",
      padding: "15px 20px",
      borderRadius: "8px 8px 0 0",
      marginBottom: "0",
      fontSize: "22px",
      fontWeight: "bold",
      textAlign: "center",
      letterSpacing: "1px",
      boxShadow: "0 2px 5px  #2e86c1",
      borderBottom: "3px solid #154360",
    },

    // Main Container
    mainContainer: {
      background: "white",
      borderRadius: "0 0 8px 8px",
      boxShadow: "0 3px 10px  #2e86c1",
      overflow: "hidden",
      position: "relative",
      paddingBottom: "60px", // Added padding for sticky footer
    },

    // Sales Return Header
    salesReturnHeader: {
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      color: "white",
      padding: "15px 25px",
      fontSize: "20px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      borderBottom: "3px solid #1a252f",
    },

    // Form Section
    formSection: {
      padding: "25px",
      borderBottom: "2px solid #eaeaea",
      background: "white",
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      marginBottom: "0",
    },

    // Form Group
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

    // Input Style
    input: {
      padding: "4px 6px",
      border: "1px solid #999",
      borderRadius: "3px",
      fontSize: "12px",
      height: "24px",
      backgroundColor: "#fff",
      outline: "none",
      boxSizing: "border-box",
    },

    inputFocus: {
      borderColor: "#2e86c1",
      backgroundColor: "#fff",
    },

    // Table Section
    tableSection: {
      padding: "25px",
      background: "white",
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

    // Table Styles
    tableWrapper: {
      overflowX: "auto",
      borderRadius: "8px",
      border: "2px solid #e0e0e0",
      boxShadow: " #2e86c1",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "13px",
      minWidth: "1200px", // Increased for more columns
    },

    tableHead: {
      background: "linear-gradient(135deg,  #2e86c1)",
    },

    th: {
      padding: "12px 8px", // Reduced padding
      textAlign: "left",
      fontSize: "11px", // Smaller font for more columns
      fontWeight: "bold",
      color: "white",
      borderRight: "1px solid #3d566e",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },

    td: {
      padding: "8px 6px", // Reduced padding
      borderBottom: "1px solid #e0e0e0",
      borderRight: "1px solid #e0e0e0",
      color: "#2c3e50",
      fontSize: "12px", // Smaller font
      verticalAlign: "middle",
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
      padding: "3px 5px",
      border: "1px solid #ccc",
      borderRadius: "3px",
      fontSize: "12px",
      height: "22px",
      backgroundColor: "#fff",
      outline: "none",
      boxSizing: "border-box",
    },

    tableInputFocus: {
      borderColor: "#2e86c1",
      boxShadow: "0 0 0 1px rgba(46, 134, 193, 0.2)",
    },

    // Action Button in Table
    actionButton: {
      padding: "6px 10px", // Smaller button
      borderRadius: "3px",
      border: "none",
      fontSize: "11px",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      transition: "all 0.3s",
      height: "28px",
      minWidth: "70px",
      fontFamily: "inherit",
      textTransform: "uppercase",
      backgroundColor: "#e74c3c",
      color: "white",
    },

    actionButtonHover: {
      backgroundColor: "#c0392b",
      transform: "translateY(-1px)",
    },

    // Add Item Button
    addItemButton: {
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
      minWidth: "150px",
      height: "45px",
      fontFamily: "inherit",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      backgroundColor: "#27ae60",
      color: "white",
      marginTop: "20px",
      border: "2px solid #219653",
    },

    addItemButtonHover: {
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

  // Add empty row
  const addEmptyRow = () => {
    const newRowId = nextId;
    const newRow = {
      id: newRowId,
      barcode: "",
      itemName: "",
      stock: 0,
      mrp: 0,
      uom: "KG",
      hsn: "",
      tax: 18,
      srate: 0,
      wrate: 0,
      qty: 0,
      amount: 0,
    };
    
    setRows((prev) => [...prev, newRow]);
    setNextId((n) => n + 1);
    setSelectedRowId(newRowId);
    setEditingCell({ rowId: newRowId, field: "barcode" });
    setCurrentField("rowBarcode");
    
    setTimeout(() => {
      const newBarcodeInput = document.querySelector(`input[data-row="${newRowId}"][data-field="barcode"]`);
      if (newBarcodeInput) newBarcodeInput.focus();
    }, 10);
    
    showToast("New item row added");
  };

  // ---------- Render ----------
  return (
    <div style={styles.page}>
      {/* Main Container */}
      <div style={styles.mainContainer}>
        {/* Form Section */}
        <div style={styles.formSection}>
          <div 
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr 150px 1fr 150px 1fr 150px 1fr",
              rowGap: "18px",
              columnGap: "18px",
              alignItems: "center"
            }}
          >

            {/* Salesman */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Salesman :</label>
              <input 
                ref={salesmanRef}
                style={getInputStyle('salesman')}
                value={form.salesman}
                onChange={(e) => updateField("salesman", e.target.value)}
                onFocus={() => { setFocusedInput('salesman'); setCurrentField('salesman'); }}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'salesman')}
                placeholder="Enter Salesman"
              />
            </div>

            {/* Bill No */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Bill No :</label>
              <input 
                ref={billNoRef}
                style={getInputStyle('billNo')}
                value={form.billNo}
                onChange={(e) => updateField("billNo", e.target.value)}
                onFocus={() => { setFocusedInput('billNo'); setCurrentField('billNo'); }}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'billNo')}
              />
            </div>

            {/* Mobile */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Mobile No :</label>
              <input 
                ref={mobileRef}
                style={getInputStyle('mobile')}
                value={form.mobile}
                onChange={(e) => updateField("mobile", e.target.value)}
                onFocus={() => { setFocusedInput('mobile'); setCurrentField('mobile'); }}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'mobile')}
              />
            </div>

            {/* Scrap Product Name */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Scrap Product Name :</label>
              <input 
                ref={scrapProductRef}
                style={getInputStyle('scrapProductName')}
                value={form.scrapProductName}
                onChange={(e) => updateField("scrapProductName", e.target.value)}
                onFocus={() => { setFocusedInput('scrapProductName'); setCurrentField('scrapProductName'); }}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'scrapProductName')}
              />
            </div>

            {/* EMP Name */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>EMP Name :</label>
              <input 
                ref={empNameRef}
                style={getInputStyle('empName')}
                value={form.empName}
                onChange={(e) => updateField("empName", e.target.value)}
                onFocus={() => { setFocusedInput('empName'); setCurrentField('empName'); }}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'empName')}
              />
            </div>

            {/* Bill Date */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Bill Date :</label>
              <input 
                ref={billDateRef}
                style={getInputStyle('billDate')}
                value={form.billDate}
                onChange={(e) => updateField("billDate", e.target.value)}
                onFocus={() => { setFocusedInput('billDate'); setCurrentField('billDate'); }}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'billDate')}
                placeholder="dd/mm/yyyy"
              />
            </div>

            {/* Customer Name */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Customer Name :</label>
              <input 
                ref={customerRef}
                style={getInputStyle('customer')}
                value={form.customer}
                onChange={(e) => updateField("customer", e.target.value)}
                onFocus={() => { setFocusedInput('customer'); setCurrentField('customer'); }}
                onKeyDown={(e) => handleFormFieldKeyDown(e, 'customer')}
              />
            </div>

            {/* BARCODE (NEW) */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Barcode :</label>
              <input 
                ref={barcodeRef}
                style={getInputStyle('barcode')}
                value={form.barcode}
                onChange={(e) => updateField("barcode", e.target.value)}
                onFocus={() => { setFocusedInput('barcode'); setCurrentField('barcode'); }}
                onKeyDown={(e) => { handleFormFieldKeyDown(e, 'barcode'); handleBarcodeKey(e); }}
                placeholder="Scan Barcode"
              />
            </div>

          </div>
          {/* Close formGrid */}
        </div>
        {/* Close formSection */}

        {/* Table Section */}
        <div style={styles.tableSection}>
          <div style={styles.tableHeader}>
            {/* Table header content */}
          </div>
            
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.th}>BARCODE</th>
                  <th style={styles.th}>ITEM NAME</th>
                  <th style={styles.th}>STOCK</th>
                  <th style={styles.th}>MRP</th>
                  <th style={styles.th}>UOM</th>
                  <th style={styles.th}>HSN</th>
                  <th style={styles.th}>TAX</th>
                  <th style={styles.th}>SRATE</th>
                  <th style={styles.th}>WRATE</th>
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
                        onChange={(e) => editCell(r.id, "stock", e.target.value)}
                        onFocus={() => {
                          setEditingCell({ rowId: r.id, field: "stock" });
                          setSelectedRowId(r.id);
                          setCurrentField("rowStock");
                        }}
                        onBlur={() => {}}
                        onKeyDown={(e) => handleCellKeyDown(e, r.id, "stock")}
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
                        data-field="wrate"
                        style={getTableInputStyle(r.id, "wrate")}
                        value={r.wrate}
                        onChange={(e) => editCell(r.id, "wrate", e.target.value)}
                        onFocus={() => {
                          setEditingCell({ rowId: r.id, field: "wrate" });
                          setSelectedRowId(r.id);
                          setCurrentField("rowWrate");
                        }}
                        onBlur={() => {}}
                        onKeyDown={(e) => handleCellKeyDown(e, r.id, "wrate")}
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
                    
                    <td style={styles.td}>
                      <span style={{ fontWeight: "bold", color: "#2c3e50", fontSize: "12px" }}>
                        ₹{r.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    
                    <td style={styles.td}>
                      <button
                        style={styles.actionButton}
                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.actionButtonHover)}
                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.actionButton)}
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
          {/* Close tableWrapper */}

          {/* Add Item Button */}
          <button 
            style={styles.addItemButton}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.addItemButtonHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.addItemButton)}
            onClick={addEmptyRow}
          >
            <FaPlus /> Add Item
          </button>
        </div>
        {/* Close tableSection */}
      </div>
      {/* Close mainContainer */}

      {/* FINAL FOOTER EXACT LIKE YOUR SCREENSHOT */}
      <div style={{
        position: "fixed",
        bottom: "0",
        left: "0",
        right: "0",
        background: "#fff",
        padding: "12px 25px",
        borderTop: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 999,
      }}>

        {/* LEFT BUTTON GROUP */}
        <div style={{ display: "flex", gap: "10px" }}>
          
          {/* ADD */}
          <button style={{
            background: "#0d6efd",
            border: "1px solid #0d6efd",
            padding: "6px 18px",
            color: "#fff",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <FaPlus /> Add
          </button>

          {/* EDIT */}
          <button style={{
            background: "#fff",
            border: "1px solid #0d6efd",
            padding: "6px 18px",
            color: "#0d6efd",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <FaEdit /> Edit
          </button>

          {/* DELETE */}
          <button style={{
            background: "#fff",
            border: "1px solid #dc3545",
            padding: "6px 18px",
            color: "#dc3545",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <FaTrash /> Delete
          </button>

        </div>


        {/* RIGHT BUTTON GROUP */}
        <div style={{ display: "flex", gap: "12px" }}>

          {/* CLEAR */}
          <button style={{
            background: "#fff",
            border: "1px solid #999",
            padding: "6px 20px",
            color: "#333",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onClick={clearAll}
          >
            <FaTimes /> Clear
          </button>

          {/* SAVE BILL */}
          <button 
            style={{
              background: "#0d6efd",
              border: "1px solid #0d6efd",
              padding: "6px 20px",
              color: "#fff",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onClick={saveData}
          >
            <FaSave /> Save
          </button>
        </div>
      </div>
      {/* Close footer */}

      {toast && (
        <div style={styles.toast}>
          <FaShoppingCart /> {toast}
        </div>
      )}
    </div>
  );
}