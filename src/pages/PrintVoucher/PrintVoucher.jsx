import React, { useRef, useEffect, forwardRef } from "react";
import logo from "../../assets/logo1.jpeg";
import QRCode from "qrcode";

const PrintVoucher = forwardRef(({ billData, mode = "payment-voucher" }, ref) => {
    console.log("PrintVoucher billData:", billData);
  const printRef = useRef(null);
  const qrcodeRef = useRef(null);

  // Initialize QR code when component mounts
  useEffect(() => {
    if ((mode === "payment-voucher" || mode === "receipt-voucher") && qrcodeRef.current && billData?.voucherNo) {
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
        <title>Payment Voucher</title>
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

          .voucher-title {
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

  const renderPaymentVoucher = () => {
    if (!billData) return null;

    return (
      <div>
        <div className="voucher-title">
          <h3>PAYMENT VOUCHER</h3>
        </div>

        {/* Voucher number and date */}
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
          By: {billData.accountName || billData.customerName || billData.paidTo || 'N/A'}
        </div>
        <hr className="dashed" style={{ margin: 0, width: "100%" }} />

        {/* Amount Section */}
        <table className="items" style={{ fontSize: "9pt", marginTop: "2mm", width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #000" }}>Cash/Bank</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #000" }}>Narration</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #000" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(billData.items) && billData.items.length > 0 ? (
              billData.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: "left" }}>{item.cashBank || '-'}</td>
                  <td style={{ textAlign: "left" }}>{item.narration || '-'}</td>
                  <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "14pt" }}>{(item.amount || 0).toFixed(2)}</td>
                </tr>
              ))
            ) : null}
            <tr>
              <td colSpan="3"><hr className="dashed" style={{ margin: 0, width: "100%" }} /></td>
            </tr>
            {/* Total Amount Row */}
            <tr style={{ fontWeight: "bold", fontSize: "10pt" }}>
              <td colSpan="2" style={{ textAlign: "right", paddingRight: "10pt" }}>Total Amount:</td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "15pt" }}>{(billData.netAmount || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
            <div style={{ marginTop: "7mm", fontSize: "9pt" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ textAlign: "center" }}>
              <div></div>
              <div style={{ marginTop: "3mm" }}>Authorised Signatory</div>
            </div>
          </div>
        </div>
       

       
      </div>
    );
  };

  const renderReceiptVoucher = () => {
    if (!billData) return null;

   return (
      <div>
        <div className="voucher-title">
          <h3>RECEIPT VOUCHER</h3>
        </div>

        {/* Voucher number and date */}
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
          By: {billData.accountName || billData.customerName || billData.paidTo || 'N/A'}
        </div>
        <hr className="dashed" style={{ margin: 0, width: "100%" }} />

        {/* Amount Section */}
        <table className="items" style={{ fontSize: "9pt", marginTop: "2mm", width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #000" }}>Cash/Bank</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #000" }}>Narration</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #000" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(billData.items) && billData.items.length > 0 ? (
              billData.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: "left" }}>{item.cashBank || '-'}</td>
                  <td style={{ textAlign: "left" }}>{item.narration || '-'}</td>
                  <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "14pt" }}>{(item.amount || 0).toFixed(2)}</td>
                </tr>
              ))
            ) : null}
            <tr>
              <td colSpan="3"><hr className="dashed" style={{ margin: 0, width: "100%" }} /></td>
            </tr>
            {/* Total Amount Row */}
            <tr style={{ fontWeight: "bold", fontSize: "10pt" }}>
              <td colSpan="2" style={{ textAlign: "right", paddingRight: "10pt" }}>Total Amount:</td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "15pt" }}>{(billData.netAmount || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
            <div style={{ marginTop: "7mm", fontSize: "9pt" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ textAlign: "center" }}>
              <div></div>
              <div style={{ marginTop: "3mm" }}>Authorised Signatory</div>
            </div>
          </div>
        </div>
       

       
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
          {mode === "payment-voucher" && renderPaymentVoucher()}
          {mode === "receipt-voucher" && renderReceiptVoucher()}
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

PrintVoucher.displayName = 'PrintVoucher';

export default PrintVoucher;