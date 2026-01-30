import React, { useEffect, useState, useRef } from "react";
import apiService from "../../api/apiService";
import { API_ENDPOINTS } from "../../api/endpoints";
import { getCompCode } from '../../utils/userUtils';
import { useFormPermissions } from "../../hooks/useFormPermissions";
const DayClose = () => {
  const [fdate, setFdate] = useState("");  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
    const dateInputRef = useRef(null);

  // Form permissions hook
  const { canEdit } = useFormPermissions("FRMDAYCLOSE");

  const FCompCode = getCompCode();

  // Fetch current day close date
  const fetchDate = async () => {
    try {
      setLoading(true);
      const res = await apiService.get(
        API_ENDPOINTS.DAYCLOSE.GET(FCompCode)
      );
     console.log(res);
      if (res.workingDate) {
        // Parse the working date and add one day
        const [day, month, year] = res.workingDate.split('-');
        const currentDate = new Date(year, month - 1, day);
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Format the next day as DD/MM/YYYY
        const nextDayFormatted = `${nextDay.getDate().toString().padStart(2, '0')}/${(nextDay.getMonth() + 1).toString().padStart(2, '0')}/${nextDay.getFullYear()}`;
       setFdate(nextDayFormatted);

setTimeout(() => {
  dateInputRef.current?.focus();
}, 0);

       
      }
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDate();
  }, []);

  // Handle Close action
  const handleClose = async () => {
    if (!fdate) {
      setMessage("Please select a date first!");
      return;
    }
    try {
      setLoading(true);
      // Format date to match the expected format (DD-MM-YYYY)
      const aformattedDate = fdate;
      const payload = { FCompCode, fdate: aformattedDate };
      await apiService.put(API_ENDPOINTS.DAYCLOSE.UPDATE, payload);
      setModalMessage("Day closed successfully!!");
      setShowModal(true);      
    } catch (err) {
      console.error("Error closing day:", err);
      setMessage("Error while closing the day ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>DAY CLOSE</div>
        <div style={styles.body}>
          <div style={styles.formRow}>
            <label style={styles.label}>DATE</label>
            <div 
              style={styles.inputWrapper}
              onClick={(e) => {
                const dateInput = e.currentTarget.querySelector('input');
                dateInput.showPicker();
              }}
            >
             <input
  ref={dateInputRef}   // ✅ ADD THIS
  type="date"
  value={fdate ? fdate.split('/').reverse().join('-') : ''}
  onChange={(e) => {
    const date = new Date(e.target.value);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    setFdate(`${day}/${month}/${year}`);
  }}
  style={styles.input}
/>

            </div>
          </div>
          <button
            onClick={handleClose}
            style={styles.button}
            disabled={loading || !canEdit}
            title={!canEdit ? "You don't have permission to close day" : ""}
          >
            {loading ? "PROCESSING..." : "CLOSE"}
          </button>         
        </div>
      </div>
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalMessage}>{modalMessage}</div>
            <div style={styles.modalButtons}>
              <button
                style={styles.okButton}
              onClick={() => {
  setShowModal(false);
  fetchDate();
  setTimeout(() => {
    dateInputRef.current?.focus();
  }, 0);
}}

              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline CSS styles (responsive and Windows-style layout)
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
    backgroundColor: "#f0f2f5",
    padding: "20px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  modalMessage: {
    marginBottom: "20px",
    fontSize: "1.1rem",
    color: "#333",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  okButton: {
    background: "linear-gradient(90deg, #307AC8, #06A7EA)",
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "400px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.15)",
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(90deg, #307AC8, #06A7EA",
    color: "#fff",
    textAlign: "center",
    padding: "20px",
    fontWeight: "bold",
    fontSize: "1.8rem",
  },
  body: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  formRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontWeight: "bold",
    fontSize: "1.4rem",
  },
  inputWrapper: {
    flex: 1,
    marginLeft: "20px",
    cursor: "pointer",
    position: "relative",
    transition: "all 0.3s ease",
    ":hover": {
      opacity: 0.9,
    }
  },
  input: {
    width: "100%",
    padding: "10px 16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "1.2rem",
    cursor: "pointer",
    outline: "none",
    transition: "border-color 0.3s ease",
    ":hover": {
      borderColor: "#307AC8",
    }
  },
  button: {
    background: "linear-gradient(90deg, #307AC8, #06A7EA)",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    padding: "15px",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "0.3s",
    fontSize: "1.2rem",
    minWidth: "150px",
  },
  message: {
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#333",
  },
};

export default DayClose;
