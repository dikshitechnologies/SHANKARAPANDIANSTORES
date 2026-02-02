import React, { useRef, useEffect, forwardRef } from "react";
import logo from "../../assets/logo1.jpeg";
import QRCode from "qrcode";

const PrintReceipt = forwardRef(({ billData, mode = "scrap_bill" }, ref) => {
  const printRef = useRef(null);
  const qrcodeRef = useRef(null);

  // Initialize QR code when component mounts
  useEffect(() => {
    if ((mode === "scrap_bill" || mode === "sales_return") && qrcodeRef.current && billData?.voucherNo) {
      qrcodeRef.current.innerHTML = "";
      QRCode.toString(
        billData.voucherNo,
        {
          type: "svg",
          width: 50,
          margin: 0,
          errorCorrectionLevel: "H"
        },
        (err, svg) => {
          if (!err) {
            qrcodeRef.current.innerHTML = svg;
          }
        }
      );
    }
  }, [mode, billData]);

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const win = window.open("", "", "width=800,height=600");

    win.document.open();
    win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Scrap Bill Receipt</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
            padding: 0;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
          }

          body {
            margin: 0;
            padding: 0;
            font-size: 10pt;
            width: 80mm;
            font-family: Arial, sans-serif;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.3px;
            text-shadow: 0.3px 0 #000;
          }

          .receipt {
            padding: 2mm 1mm;
            width: 100%;
            max-width: 80mm;
          }

          .header {
            text-align: center;
            margin-bottom: 1mm;
          }

          .logo {
            width: 60px;
            height: 60px;
            object-fit: contain;
            margin: 0 auto;
          }

          .company-name {
            font-size: 13pt;
            font-weight: bold;
            letter-spacing: 0.5pt;
            margin: 1mm 0;
          }

          .company-address {
            font-size: 8pt;
            line-height: 1.2;
            margin-bottom: 1mm;
          }

          .gst-number {
            font-size: 9pt;
            font-weight: bold;
            margin-bottom: 1mm;
          }

          .contact {
            font-size: 8pt;
            margin-bottom: 1mm;
          }

          hr.dashed {
            border: none;
            border-top: 1px dashed #000;
            margin: 1mm 0;
          }

          .scrap-title {
            text-align: center;
            font-weight: bold;
            font-size: 11pt;
            margin: 2mm 0;
            padding: 1mm 0;
            background-color: #0a0a0a;
            color: #ffffff;
          }

          .cust-name {
            text-align: right;
            margin-bottom: 1mm;
            font-size: 11pt;
            font-weight: bold;
          }

          .bill {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
          }

          .bill-info {
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
            font-weight: bold;
            margin-bottom: 1mm;
          }

          .customer-info {
            font-size: 9pt;
            margin-bottom: 1mm;
            margin-top: 1mm;
          }

          table.items {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 9pt;
          }

          table.items th,
          table.items td {
            padding: 0.8mm 1mm;
            overflow: hidden;
            white-space: nowrap;
          }

          table.items th {
            font-weight: normal;
            text-align: left;
            padding-bottom: 1mm;
            border-bottom: 1px solid #000;
          }

          table.items th.center {
            text-align: center;
          }

          table.items th.right {
            text-align: right;
          }

          .total-row {
            font-weight: bold;
            font-size: 10pt;
            padding-top: 2mm;
          }

          .terms {
            text-align: center;
            font-size: 8pt;
            line-height: 1.3;
            margin-top: 2mm;
          }

          .thank-you {
            text-align: center;
            font-weight: bold;
            font-size: 10pt;
            margin-top: 3mm;
          }

          table.items th:last-child,
          table.items td:last-child {
            padding-right: 0;
            text-align: right;
            font-family: Arial, Helvetica, sans-serif;
            font-variant-numeric: tabular-nums;
          }
        </style>
      </head>

      <body>
        ${printContents}
      </body>
      </html>
    `);

    win.document.close();

    setTimeout(() => {
      win.focus();
      win.print();
      setTimeout(() => win.close(), 100);
    }, 500);
  };

  const renderScrapBill = () => {
    if (!billData) return null;

    const totalAmount = billData.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || billData.netAmount || 0;

    return (
      <div>
        <div className="scrap-title">
          <h3>SCRAP BILL</h3>
        </div>
        <div className="cust-name">
          <h6>Salesman: {billData.salesmanName || 'N/A'}</h6>
        </div>

        {/* Bill number and date */}
        <div className="bill">
          <div className="bill-info" style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
            <div style={{ fontSize: "9pt" }}>
              <span>Bill No:&nbsp;</span>
              <span>{billData.voucherNo || 'N/A'}</span>
            </div>
            <div style={{ fontSize: "9pt" }}>
              <span>Date:&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span>
                {billData.voucherDate ? (() => {
                  const date = new Date(billData.voucherDate);
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
                  const year = date.getFullYear();
                  return `${day}-${month}-${year}`;
                })() : 'N/A'}
              </span>
            </div>
            <div style={{ fontSize: "9pt" }}>
              <span>Time:&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
          </div>
          <div ref={qrcodeRef} style={{ display: "flex", justifyContent: "center", width: "50px", height: "50px" }}></div>
        </div>

        <hr className="dashed" style={{ margin: 0, width: "100%" }} />

        {/* Customer Info */}
        <div className="customer-info">
          Customer: {billData.customerName || 'N/A'}
        </div>
        <hr className="dashed" style={{ margin: 0, width: "100%" }} />

        {/* Main Table */}
        <table className="items">
          <thead>
            <tr>
              <th style={{ width: "30mm", textAlign: "left", fontWeight: "bold", fontSize: "11pt" }}>Particulars</th>
              <th style={{ width: "13mm", textAlign: "right", fontWeight: "bold", fontSize: "11pt" }}>Rate</th>
              <th style={{ width: "13mm", textAlign: "right", fontWeight: "bold", fontSize: "11pt" }}>Qty</th>
              <th style={{ width: "18mm", textAlign: "right", fontWeight: "bold", fontSize: "11pt" }}>Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan="4" style={{ padding: 0, margin: 0 }}>
                <hr className="dashed" style={{ margin: 0, width: "100%" }} />
              </td>
            </tr>
            {billData.items && billData.items.map((item, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td colSpan="4" style={{ textAlign: "left", paddingTop: "0.8mm", paddingBottom: "0.2mm" }}>{item.itemName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left" }}></td>
                  <td style={{ textAlign: "right" }}>{(item.rate || 0).toFixed(2)}</td>
                  <td style={{ textAlign: "right" }}>{(item.qty || 0).toFixed(3)}</td>
                  <td style={{ textAlign: "right" }}>{(item.amount || 0).toFixed(2)}</td>
                </tr>
              </React.Fragment>
            ))}

            <tr>
              <td colSpan="4" style={{ padding: 0, margin: 0 }}>
                <hr className="dashed" style={{ margin: 0, width: "100%" }} />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: "5px" }}>
          <div style={{ textAlign: "left", marginLeft: "50px" }}>Amount</div>
          <div style={{ textAlign: "right", fontWeight: "bold", fontSize: "14pt" }}>
            {totalAmount.toFixed(2)}
          </div>
        </div>

        <hr className="dashed" />

        {/* Thank You Message */}
        <div className="thank-you">*** Thank You Visit Again! ***</div>
      </div>
    );
  };

  const renderSalesReturn = () => {
    if (!billData) return null;

    const totalAmount = billData.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || billData.netAmount || 0;
    const totalQty = billData.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;

    return (
      <div>
        <div className="scrap-title">
          <h3>SALES RETURN</h3>
        </div>
        <div className="cust-name">
          <h6>Salesman: {billData.salesmanName || 'N/A'}</h6>
        </div>

        {/* Bill number and date */}
        <div className="bill">
          <div className="bill-info" style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
            <div style={{ fontSize: "9pt" }}>
              <span>Bill No:&nbsp;</span>
              <span>{billData.voucherNo || 'N/A'}</span>
            </div>
            <div style={{ fontSize: "9pt" }}>
              <span>Date:&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span>
                {billData.voucherDate ? (() => {
                  const date = new Date(billData.voucherDate);
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
                  const year = date.getFullYear();
                  return `${day}-${month}-${year}`;
                })() : 'N/A'}
              </span>
            </div>
            <div style={{ fontSize: "9pt" }}>
              <span>Time:&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
          </div>
          <div ref={qrcodeRef} style={{ display: "flex", justifyContent: "center", width: "50px", height: "50px" }}></div>
        </div>

        <hr className="dashed" style={{ margin: 0, width: "100%" }} />

        {/* Customer Info */}
        {/* <div className="customer-info">
          Customer: {billData.customerCode || 'N/A'}
        </div>
        <hr className="dashed" style={{ margin: 0, width: "100%" }} /> */}

        {/* Summary Table */}
        <table className="items" style={{ fontSize: "9pt" }}>
          <tbody>
            <tr>
              <td style={{ textAlign: "left", width: "50%" }}>Customer: {billData.customerName || 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", width: "50%" }}>Total Items: {billData.items?.length || 0}</td>
              <td style={{ textAlign: "right", width: "50%" }}>Total Qty: {totalQty.toFixed(3)}</td>
            </tr>
            <tr>
              <td colSpan="2"><hr className="dashed" style={{ margin: 0, width: "100%" }} /></td>
            </tr>
            <tr className="total-row">
              <td style={{ textAlign: "left" }}>Bill Amount</td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "14pt" }}>{totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <hr className="dashed" />

        {/* Thank You Message */}
        <div className="thank-you">*** Thank You Visit Again! ***</div>
      </div>
    );
  };

  // Expose print function via ref
  React.useImperativeHandle(ref, () => ({
    print: handlePrint
  }));

  return (
    <div>
      {/* Hidden Print Content */}
      <div ref={printRef} style={{ display: "none" }}>
        <div className="receipt">
          {/* Header with Logo */}
          <div className="header">
            <div style={{ textAlign: "center" }}>
              <img
                src={logo}
                alt="Logo"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "contain",
                  display: "inline-block",
                }}
              />
            </div>
            <div className="company-name">R.SANKARAPANDIAN STORE</div>
            <div className="company-address">
              51/179, HARIHARAN BAZAAR STREET<br />
              PONNERI - 601204
            </div>
            <div className="contact">Customer Care: 044-27973611 / 72007 79217</div>
            <div className="gst-number">GST No: 33ECCPR7067N1ZL</div>
          </div>

          {/* Dynamic Content */}
          {mode === "scrap_bill" && renderScrapBill()}
          {mode === "sales_return" && renderSalesReturn()}
        </div>
      </div>

      {/* Print Button */}
      <button
        className="print-receipt-button-inner"
        onClick={handlePrint}
        style={{
          padding: "10px 20px",
          margin: "20px",
          backgroundColor: "#1B91DA",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          display: "none"
        }}
      >
        Print Receipt
      </button>
    </div>
  );
});

PrintReceipt.displayName = 'PrintReceipt';

export default PrintReceipt;
