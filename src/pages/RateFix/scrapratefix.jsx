import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ScrapRateFix() {
  const [form, setForm] = useState({ date: "", scrapName: "", rate: "" });
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Existing Users Data
  const existingUsers = [
    { code: "001", username: "USER1", company: "DIKSHI TECHNOLOGIES DEMO" },
    { code: "002", username: "BBB", company: "DIKSHI TECHNOLOGIES DEMO" },
    { code: "003", username: "CCC", company: "DIKSHI TECHNOLOGIES DEMO" },
    { code: "004", username: "FFF", company: "DIKSHI TECHNOLOGIES DEMO" },
    { code: "005", username: "USER2", company: "DIKSHI TECHNOLOGIES DEMO" },
    { code: "006", username: "GGG", company: "DIKSHI TECHNOLOGIES DEMO" },
    { code: "007", username: "HHH", company: "DIKSHI TECHNOLOGIES DEMO" },
    { code: "008", username: "III", company: "DIKSHI TECHNOLOGIES DEMO" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const clearForm = () => {
    setForm({ date: "", scrapName: "", rate: "" });
  };

  // Filter users based on search query
  const filteredUsers = existingUsers.filter(user => 
    user.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid p-0" style={{ minHeight: "100vh", backgroundColor: "#f8fafc", marginTop: "-80px", }}>
      <div className="row mx-0 g-0 justify-content-center" style={{ minHeight: "100vh" }}>
        {/* Left Column - Existing Users */}
        <div className="col-12 col-lg-7 px-0">
          <div className="h-100 d-flex flex-column p-3 p-md-4">
            {/* Existing Users Container - 70% WIDTH */}
            <div 
              className="flex-grow-1" 
              style={{ 
                backgroundColor: "white",
                borderRadius: "15px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                overflow: "hidden",
                border: "1px solid rgba(48, 122, 200, 0.1)",
                width: "90%",
                margin: "0 0 0 auto",
                padding: "0",
                
              }}
            >
              {/* Existing Users Header */}
              <div 
                className="p-4"
                style={{ 
                  backgroundColor: "#307AC8",
                  borderBottom: "3px solid #1B91DA"
                }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                  <div>
                    <h3 
                      className="mb-2" 
                      style={{ 
                        fontWeight: "700", 
                        color: "white",
                        fontSize: "1.3rem"
                      }}
                    >
                      <span className="bi bi-people-fill me-2"></span>
                      Existing Users
                    </h3>
                    <p className="mb-0" style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>
                      Search and manage existing scrap rate users
                    </p>
                  </div>
                  
                  {/* Count Badge */}
                  <div className="d-flex gap-2 mt-2 mt-md-0">
                    <span 
                      className="badge px-3 py-2 d-flex align-items-center gap-1" 
                      style={{ 
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontSize: "0.85rem",
                        fontWeight: "500"
                      }}
                    >
                      <span className="bi bi-person-badge"></span>
                      {filteredUsers.length} Users
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-4 pb-0">
                <div className="mb-3">
                  <label 
                    className="form-label fw-bold mb-2 d-flex align-items-center" 
                    style={{ 
                      color: "#2c3e50",
                      fontSize: "0.95rem"
                    }}
                  >
                    <span 
                      className="rounded-circle d-flex align-items-center justify-content-center me-2" 
                      style={{ 
                        width: "24px", 
                        height: "24px", 
                        backgroundColor: "#307AC8",
                        color: "white",
                        fontSize: "0.85rem"
                      }}
                    >
                      <span className="bi bi-search"></span>
                    </span>
                    Search (code, username, company)...
                  </label>
                  <div className="input-group">
                    <span 
                      className="input-group-text" 
                      style={{ 
                        backgroundColor: "white", 
                        border: "2px solid #e0e6ed",
                        borderRight: "none",
                        borderTopLeftRadius: "8px",
                        borderBottomLeftRadius: "8px",
                        color: "#307AC8"
                      }}
                    >
                      <span className="bi bi-search"></span>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search users..."
                      style={{ 
                        borderRadius: "0 8px 8px 0", 
                        height: "44px",
                        border: "2px solid #e0e6ed",
                        borderLeft: "none",
                        backgroundColor: "white",
                        color: "#2c3e50",
                        fontSize: "0.9rem"
                      }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#1B91DA";
                        e.target.parentElement.style.boxShadow = "0 0 0 3px rgba(27, 145, 218, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e0e6ed";
                        e.target.parentElement.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="p-3 pt-0">
                <div className="table-responsive" style={{ maxHeight: "350px", overflowY: "auto" }}>
                  <table className="table table-hover mb-0">
                    <thead style={{ 
                      backgroundColor: "#f8fafc",
                      position: "sticky",
                      top: 0,
                      zIndex: 1
                    }}>
                      <tr>
                        <th 
                          scope="col" 
                          style={{ 
                            color: "#307AC8",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            padding: "12px",
                            borderBottom: "2px solid #e0e6ed",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                          }}
                        >
                          Code
                        </th>
                        <th 
                          scope="col" 
                          style={{ 
                            color: "#307AC8",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            padding: "12px",
                            borderBottom: "2px solid #e0e6ed",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                          }}
                        >
                          Username
                        </th>
                        <th 
                          scope="col" 
                          style={{ 
                            color: "#307AC8",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            padding: "12px",
                            borderBottom: "2px solid #e0e6ed",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                          }}
                        >
                          Company
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                          <tr 
                            key={user.code}
                            style={{ 
                              borderBottom: "1px solid #f1f5f9",
                              transition: "all 0.2s",
                              backgroundColor: index % 2 === 0 ? "white" : "#f8fafc"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#e3f2fd";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#f8fafc";
                            }}
                          >
                            <td style={{ 
                              padding: "10px",
                              fontWeight: "600",
                              color: "#2c3e50",
                              verticalAlign: "middle",
                              fontSize: "0.85rem"
                            }}>
                              <span 
                                className="badge" 
                                style={{ 
                                  backgroundColor: "#307AC8",
                                  color: "white",
                                  fontSize: "0.75rem",
                                  padding: "6px 10px"
                                }}
                              >
                                {user.code}
                              </span>
                            </td>
                            <td style={{ 
                              padding: "10px",
                              fontWeight: "500",
                              color: "#2c3e50",
                              verticalAlign: "middle",
                              fontSize: "0.85rem"
                            }}>
                              <span className="bi bi-person-circle me-2" style={{ color: "#1B91DA", fontSize: "0.95rem" }}></span>
                              {user.username}
                            </td>
                            <td style={{ 
                              padding: "10px",
                              color: "#64748b",
                              verticalAlign: "middle",
                              fontSize: "0.85rem"
                            }}>
                              <span className="bi bi-building me-2" style={{ color: "#06A7EA", fontSize: "0.95rem" }}></span>
                              {user.company}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ 
                            textAlign: "center", 
                            padding: "50px 16px",
                            color: "#94a3b8"
                          }}>
                            <div className="d-flex flex-column align-items-center">
                              <span 
                                className="bi bi-search" 
                                style={{ 
                                  fontSize: "56px",
                                  marginBottom: "16px",
                                  color: "#e0e6ed"
                                }}
                              ></span>
                              <h5 style={{ color: "#64748b", marginBottom: "8px", fontSize: "1.4rem" }}>No users found</h5>
                              <p className="mb-0" style={{ fontSize: "1.1rem" }}>
                                {searchQuery ? 'Try a different search term' : 'No users available'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Info Footer */}
            <div className="text-center mt-3 px-2">
              <p style={{ color: "#94a3b8", fontSize: "1rem" }}>
                <span className="bi bi-database me-1"></span>
                Total users: {existingUsers.length} • Showing: {filteredUsers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Scrap Rate Fix Form */}
        <div className="col-12 col-lg-5 px-0 d-flex align-items-center justify-content-start">
          <div className="h-100 d-flex flex-column p-3 p-md-4" style={{ paddingLeft: "0", paddingRight: "0" }}>
            {/* Main Form Container - INCREASED TO 75% WIDTH */}
            <div 
              style={{ 
                backgroundColor: "white",
                borderRadius: "15px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                overflow: "hidden",
                border: "1px solid rgba(48, 122, 200, 0.1)",
                width: "100%", // CHANGED FROM 55% TO 75%
                marginLeft: "0" // REMOVED NEGATIVE MARGIN
              }}
            >
              {/* Header Section */}
              <div 
                className="p-4"
                style={{ 
                  backgroundColor: "#307AC8",
                  borderBottom: "3px solid #1B91DA"
                }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                  <div>
                    <h3 
                      className="mb-2" 
                      style={{ 
                        fontWeight: "700", 
                        color: "white",
                        fontSize: "1.3rem"
                      }}
                    >
                      <span className="bi bi-recycle me-2"></span>
                      Scrap Rate Fix
                    </h3>
                    <p className="mb-0" style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>
                      Manage scrap material rates
                    </p>
                  </div>
                  
                  {/* REMOVED DATE BADGE - Action Badges section removed */}
                </div>
              </div>

              {/* Form Content */}
              <div className="p-4">
                {/* Action Buttons - Inside Form */}
                <div className="mb-3 p-2" style={{ 
                  backgroundColor: "#f8fafc", 
                  borderRadius: "8px",
                  border: "1px solid #e1e8f0"
                }}>
                  <div className="d-flex flex-wrap gap-2">
                    <button 
                      className="btn d-flex align-items-center gap-1 flex-grow-1 flex-md-grow-0 px-3 py-2" 
                      style={{ 
                        borderRadius: "6px",
                        backgroundColor: "#307AC8",
                        color: "white",
                        border: "none",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        transition: "all 0.3s",
                        minWidth: "70px",
                        padding: "6px 10px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#2a6ab3";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(48, 122, 200, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#307AC8";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <span className="bi bi-plus-circle-fill"></span> Add
                    </button>

                    <button 
                      className="btn d-flex align-items-center gap-1 flex-grow-1 flex-md-grow-0 px-3 py-2" 
                      style={{ 
                        borderRadius: "6px",
                        backgroundColor: "#1B91DA",
                        color: "white",
                        border: "none",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        transition: "all 0.3s",
                        minWidth: "70px",
                        padding: "6px 10px"
                      }} 
                      onClick={() => setShowEdit(true)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#1783c6";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(27, 145, 218, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#1B91DA";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <span className="bi bi-pencil-square"></span> Edit
                    </button>

                    <button 
                      className="btn d-flex align-items-center gap-1 flex-grow-1 flex-md-grow-0 px-3 py-2" 
                      style={{ 
                        borderRadius: "6px",
                        backgroundColor: "#06A7EA",
                        color: "white",
                        border: "none",
                        fontSize: "1.1rem", // Larger form
                        fontWeight: "600",
                        transition: "all 0.3s",
                        minWidth: "90px" // Larger width
                      }} 
                      onClick={() => setShowDelete(true)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#0596d3";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(6, 167, 234, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#06A7EA";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <span className="bi bi-trash-fill"></span> Delete
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="mb-3">
                  <label 
                    className="form-label fw-bold mb-2 d-flex align-items-center" 
                    style={{ 
                      color: "#2c3e50",
                      fontSize: "1.2rem" // Larger font
                    }}
                  >
                    <span 
                      className="rounded-circle d-flex align-items-center justify-content-center me-2" 
                      style={{ 
                        width: "28px", 
                        height: "28px", 
                        backgroundColor: "#307AC8",
                        color: "white",
                        fontSize: "1rem" // Larger font
                      }}
                    >
                      1
                    </span>
                    Date <span className="text-danger ms-1">*</span>
                  </label>
                  <div className="input-group">
                    <span 
                      className="input-group-text" 
                      style={{ 
                        backgroundColor: "white", 
                        border: "2px solid #e0e6ed",
                        borderRight: "none",
                        borderTopLeftRadius: "8px",
                        borderBottomLeftRadius: "8px",
                        color: "#307AC8",
                        fontSize: "1.1rem" // Larger font
                      }}
                    >
                      <span className="bi bi-calendar-date"></span>
                    </span>
                    <input
                      type="date"
                      name="date"
                      className="form-control"
                      style={{ 
                        borderRadius: "0 8px 8px 0", 
                        height: "52px", // Larger height
                        border: "2px solid #e0e6ed",
                        borderLeft: "none",
                        backgroundColor: "white",
                        color: "#2c3e50",
                        fontSize: "1.1rem" // Larger font
                      }}
                      value={form.date}
                      onChange={handleChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#1B91DA";
                        e.target.parentElement.style.boxShadow = "0 0 0 3px rgba(27, 145, 218, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e0e6ed";
                        e.target.parentElement.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label 
                    className="form-label fw-bold mb-2 d-flex align-items-center" 
                    style={{ 
                      color: "#2c3e50",
                      fontSize: "1.2rem" // Larger font
                    }}
                  >
                    <span 
                      className="rounded-circle d-flex align-items-center justify-content-center me-2" 
                      style={{ 
                        width: "28px", 
                        height: "28px", 
                        backgroundColor: "#1B91DA",
                        color: "white",
                        fontSize: "1rem" // Larger font
                      }}
                    >
                      2
                    </span>
                    Scrap Name <span className="text-danger ms-1">*</span>
                  </label>
                  <div className="input-group">
                    <span 
                      className="input-group-text" 
                      style={{ 
                        backgroundColor: "white", 
                        border: "2px solid #e0e6ed",
                        borderRight: "none",
                        borderTopLeftRadius: "8px",
                        borderBottomLeftRadius: "8px",
                        color: "#1B91DA",
                        fontSize: "1.1rem" // Larger font
                      }}
                    >
                      <span className="bi bi-tag-fill"></span>
                    </span>
                    <input
                      type="text"
                      name="scrapName"
                      placeholder="Enter scrap material name"
                      className="form-control"
                      style={{ 
                        borderRadius: "0 8px 8px 0", 
                        height: "52px", // Larger height
                        border: "2px solid #e0e6ed",
                        borderLeft: "none",
                        backgroundColor: "white",
                        color: "#2c3e50",
                        fontSize: "1.1rem" // Larger font
                      }}
                      value={form.scrapName}
                      onChange={handleChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#1B91DA";
                        e.target.parentElement.style.boxShadow = "0 0 0 3px rgba(27, 145, 218, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e0e6ed";
                        e.target.parentElement.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label 
                    className="form-label fw-bold mb-2 d-flex align-items-center" 
                    style={{ 
                      color: "#2c3e50",
                      fontSize: "1.2rem" // Larger font
                    }}
                  >
                    <span 
                      className="rounded-circle d-flex align-items-center justify-content-center me-2" 
                      style={{ 
                        width: "28px", 
                        height: "28px", 
                        backgroundColor: "#06A7EA",
                        color: "white",
                        fontSize: "1rem" // Larger font
                      }}
                    >
                      3
                    </span>
                    Rate ($/kg) <span className="text-danger ms-1">*</span>
                  </label>
                  <div className="input-group">
                    <span 
                      className="input-group-text" 
                      style={{ 
                        backgroundColor: "white", 
                        border: "2px solid #e0e6ed",
                        borderRight: "none",
                        borderTopLeftRadius: "8px",
                        borderBottomLeftRadius: "8px",
                        color: "#06A7EA",
                        fontSize: "1.1rem" // Larger font
                      }}
                    >
                      <span className="bi bi-currency-dollar"></span>
                    </span>
                    <input
                      type="number"
                      name="rate"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="form-control"
                      style={{ 
                        borderRadius: "0 8px 8px 0", 
                        height: "52px", // Larger height
                        border: "2px solid #e0e6ed",
                        borderLeft: "none",
                        backgroundColor: "white",
                        color: "#2c3e50",
                        fontSize: "1.1rem" // Larger font
                      }}
                      value={form.rate}
                      onChange={handleChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#1B91DA";
                        e.target.parentElement.style.boxShadow = "0 0 0 3px rgba(27, 145, 218, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e0e6ed";
                        e.target.parentElement.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Create & Clear Buttons */}
                <div className="mt-4 pt-3" style={{ borderTop: "2px solid #f1f5f9" }}>
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
                    <div className="order-2 order-sm-1">
                      <p className="mb-0 text-muted" style={{ fontSize: "1rem" }}>
                        {/* <span className="bi bi-info-circle me-1"></span> */}
                        {/* All fields marked with <span className="text-danger">*</span> are required */}
                      </p>
                    </div>
                    
                    <div className="d-flex gap-2 order-1 order-sm-2">
                      <button 
                        className="btn px-4 py-2 d-flex align-items-center gap-2" 
                        style={{ 
                          borderRadius: "8px",
                          backgroundColor: "#307AC8",
                          color: "white",
                          border: "none",
                          height: "52px", // Larger height
                          fontSize: "1.2rem", // Larger font
                          fontWeight: "600",
                          transition: "all 0.3s",
                          minWidth: "130px" // Larger width
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#2a6ab3";
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 5px 15px rgba(48, 122, 200, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#307AC8";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        <span className="bi bi-plus-lg"></span> Create
                      </button>
                      
                      <button 
                        className="btn px-4 py-2 d-flex align-items-center gap-2" 
                        style={{ 
                          borderRadius: "8px",
                          backgroundColor: "white",
                          color: "#6c757d",
                          border: "2px solid #dee2e6",
                          height: "52px", // Larger height
                          fontSize: "1.2rem", // Larger font
                          fontWeight: "600",
                          transition: "all 0.3s",
                          minWidth: "130px" // Larger width
                        }} 
                        onClick={clearForm}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#f8f9fa";
                          e.target.style.color = "#495057";
                          e.target.style.borderColor = "#adb5bd";
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "white";
                          e.target.style.color = "#6c757d";
                          e.target.style.borderColor = "#dee2e6";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        <span className="bi bi-arrow-clockwise"></span> Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Footer */}
            <div className="text-center mt-3 px-2">
              <p style={{ color: "#94a3b8", fontSize: "1rem" }}>
                <span className="bi bi-shield-check me-1"></span>
                Secure form • Data encrypted • 2025
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Popup */}
      {showEdit && (
        <div 
          className="modal fade show" 
          style={{ 
            display: "block", 
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div 
              className="modal-content" 
              style={{ 
                borderRadius: "15px",
                border: "none",
                boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
                overflow: "hidden"
              }}
            >
              <div 
                className="modal-header" 
                style={{ 
                  backgroundColor: "#307AC8",
                  color: "white",
                  borderBottom: "2px solid #1B91DA",
                  padding: "1rem 1.5rem"
                }}
              >
                <h5 className="modal-title mb-0" style={{ fontSize: "1.1rem" }}>
                  <span className="bi bi-pencil-square me-2"></span>
                  Edit Scrap Rate
                </h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowEdit(false)}
                  style={{ 
                    filter: "invert(1)",
                    opacity: "0.8",
                    transition: "opacity 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = "1"}
                  onMouseLeave={(e) => e.target.style.opacity = "0.8"}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div 
                    className="rounded-circle p-2" 
                    style={{ 
                      backgroundColor: "rgba(52, 152, 219, 0.1)",
                      color: "#307AC8"
                    }}
                  >
                    <span className="bi bi-exclamation-triangle" style={{ fontSize: "1.5rem" }}></span>
                  </div>
                </div>
                <p className="text-center mb-0" style={{ fontSize: "1rem", color: "#2c3e50" }}>
                  Are you sure you want to edit this record?
                </p>
              </div>
              <div className="modal-footer justify-content-center border-top-0 p-3 pt-0">
                <button 
                  className="btn px-3 py-2" 
                  onClick={() => setShowEdit(false)}
                  style={{ 
                    borderRadius: "8px",
                    backgroundColor: "#f8f9fa",
                    color: "#6c757d",
                    border: "2px solid #dee2e6",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e9ecef";
                    e.target.style.color = "#495057";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f8f9fa";
                    e.target.style.color = "#6c757d";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn px-3 py-2 ms-2" 
                  style={{ 
                    borderRadius: "8px",
                    backgroundColor: "#1B91DA",
                    color: "white",
                    border: "none",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#1684c7";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#1B91DA";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Popup */}
      {showDelete && (
        <div 
          className="modal fade show" 
          style={{ 
            display: "block", 
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div 
              className="modal-content" 
              style={{ 
                borderRadius: "15px",
                border: "none",
                boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
                overflow: "hidden"
              }}
            >
              <div 
                className="modal-header" 
                style={{ 
                  backgroundColor: "#06A7EA",
                  color: "white",
                  borderBottom: "2px solid #307AC8",
                  padding: "1rem 1.5rem"
                }}
              >
                <h5 className="modal-title mb-0" style={{ fontSize: "1.1rem" }}>
                  <span className="bi bi-trash me-2"></span>
                  Delete Confirmation
                </h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowDelete(false)}
                  style={{ 
                    filter: "invert(1)",
                    opacity: "0.8",
                    transition: "opacity 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = "1"}
                  onMouseLeave={(e) => e.target.style.opacity = "0.8"}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div 
                    className="rounded-circle p-2" 
                    style={{ 
                      backgroundColor: "rgba(231, 76, 60, 0.1)",
                      color: "#e74c3c"
                    }}
                  >
                    <span className="bi bi-exclamation-diamond" style={{ fontSize: "1.5rem" }}></span>
                  </div>
                </div>
                <p className="text-center mb-0" style={{ fontSize: "1rem", color: "#2c3e50" }}>
                  Are you sure you want to delete this record? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer justify-content-center border-top-0 p-3 pt-0">
                <button 
                  className="btn px-3 py-2" 
                  onClick={() => setShowDelete(false)}
                  style={{ 
                    borderRadius: "8px",
                    backgroundColor: "#f8f9fa",
                    color: "#6c757d",
                    border: "2px solid #dee2e6",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e9ecef";
                    e.target.style.color = "#495057";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f8f9fa";
                    e.target.style.color = "#6c757d";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn px-3 py-2 ms-2" 
                  style={{ 
                    borderRadius: "8px",
                    backgroundColor: "#06A7EA",
                    color: "white",
                    border: "none",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#0595d6";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#06A7EA";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bootstrap Icons */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" 
      />
    </div>
  );
}