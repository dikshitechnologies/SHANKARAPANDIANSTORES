import React, { useRef, useEffect, forwardRef } from "react";
import logo from "../../assets/logo1.jpeg";
import QRCode from "qrcode";

const PrintInvoice = forwardRef(({ billData, mode = "tax_invoice" }, ref) => {
  const printRef = useRef(null);
  const qrcodeRef = useRef(null);

  // Initialize QR code when component mounts
  useEffect(() => {
    if ((mode === "tax_invoice") && qrcodeRef.current && billData?.voucherNo) {
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
        <title>Sales Invoice Receipt</title>
        <style>
          @page {
            size:  80mm auto;
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
            width:  80mm;
            font-family: Arial, sans-serif;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.3px;
            text-shadow: 0.3px 0 #000;
          }

          .receipt {
            padding: 2mm 1mm;
            width: 100%;
            max-width:  80mm;
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

          .invoice-title {
            text-align: center;
            font-weight: bold;
            font-size: 11pt;
            margin: 2mm 0;
            padding: 1mm 0;
            background-color: #0a0a0a;
            color: #ffffff;
          }

          .salesman-name {
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
            margin-bottom: 2mm;
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

  const renderSalesInvoice = () => {
    if (!billData) return null;

    const totalAmount = billData.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || billData.netAmount || 0;
    const totalQty = billData.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;

    // Extract payment amounts from modeofPayment
    const cashAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'CASH')?.amount || 0;
    const upiAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'UPI')?.amount || 0;
    const cardAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'CARD')?.amount || 0;
    const balanceAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'BALANCE')?.amount || 0;

    return (
      <div>
        <div className="invoice-title">
          <h3>TAX INVOICE</h3>
        </div>
        <div className="salesman-name">
          <h6>Salesman: {billData.salesmanName || 'N/A'}</h6>
        </div>

        {/* Bill number and date */}
        <div className="bill">
          <div className="bill-info" style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
            <div style={{ fontSize: "9pt" }}>
              <span>No:&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span>{billData.voucherNo || 'N/A'}</span>
            </div>
            <div style={{ fontSize: "9pt" }}>
              <span>Date:&nbsp;&nbsp;</span>
              <span>
                {billData.voucherDate ? (() => {
                  try {
                    const date = new Date(billData.voucherDate);
                    if (isNaN(date.getTime())) {
                      return 'N/A';
                    }
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
                    const year = date.getFullYear();
                    return `${day}-${month}-${year}`;
                  } catch (e) {
                    return 'N/A';
                  }
                })() : 'N/A'}
              </span>
            </div>
            <div style={{ fontSize: "9pt" }}>
              <span>Time:&nbsp;</span>
              <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
          </div>
          <div ref={qrcodeRef} style={{ display: "flex", justifyContent: "center", width: "50px", height: "50px" }}></div>
        </div>

        <hr className="dashed" style={{ margin: 0, width: "100%" }} />

        {/* Customer Info */}
        <div className="customer-info">
          <p>Customer: {billData.customerName || ' '}</p>         
          <p>{billData.customerMobile || ' '}</p>         
        </div>
        <hr className="dashed" style={{ margin: 0, width: "100%" }} />

        {/* Particulars Label */}
        <div style={{ fontSize: "9pt", fontWeight: "bold", marginTop: "1mm", marginBottom: "1mm" }}>
          Particulars
        </div>

        {/* Main Table - FIXED STRUCTURE */}
        <table className="items" style={{ width: "100%", marginRight: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", width: "15%"}} colSpan="1">HSN</th>
              <th style={{ textAlign: "left", width: "15%" }} colSpan="1">Tax</th>
              <th style={{ textAlign: "right", width: "20%" }} colSpan="1">Qty</th>
              <th style={{ textAlign: "right", width: "20%" }} colSpan="1">Rate</th>
              <th style={{ textAlign: "right", width: "30%" }} colSpan="1">Amount</th>
            </tr>
          </thead>
          
          <tbody>            
            
            {billData.items && billData.items.map((item, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td style={{ textAlign: "left", fontWeight: "bold" }} colSpan="5">{item.itemName || 'N/A'}</td>
                </tr>
                {item.description && (
                  <tr>
                    <td style={{ textAlign: "left", paddingLeft: "10pt", fontSize: "8pt" }} colSpan="5">{item.description}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ textAlign: "center", fontSize: "8pt" }}>{item.hsn || '-'}</td>
                  <td style={{ textAlign: "center", fontSize: "8pt" }}>{item.tax || '-'}</td>
                  <td style={{ textAlign: "right", paddingLeft: "10pt" }}>{(item.qty || 0).toFixed(3)}</td>
                  <td style={{ textAlign: "right", paddingLeft: "10pt" }}>{(item.rate || 0).toFixed(2)}</td>
                  <td style={{ textAlign: "right", paddingLeft: "10pt" }}>{(item.amount || 0).toFixed(2)}</td>
                </tr>
              </React.Fragment>
            ))}
            
            <tr>
              <td colSpan="5">
                <hr className="dashed" style={{ margin: 0, width: "100%" }} />
              </td>
            </tr>
            
            {/* Total Amount */}
            <tr className="total-row">
              <td colSpan="4" style={{ textAlign: "right", paddingRight: "10pt" }}>
                Grand Total
              </td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "15pt" }}>
                {totalAmount.toFixed(2)}
              </td>
            </tr>
            <tr className="total-row">
              <td colSpan="4" style={{ textAlign: "right", paddingRight: "10pt" }}>
                Discount
              </td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "15pt" }}>
                {(billData.discount || 0).toFixed(2)}
              </td>
            </tr>
            <tr className="total-row">
              <td colSpan="4" style={{ textAlign: "right", paddingRight: "10pt" }}>
                Net Amount
              </td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "15pt" }}>
                {(billData.netAmount || totalAmount).toFixed(2)}
              </td>
            </tr>
            <tr className="total-row">
              <td colSpan="4" style={{ textAlign: "right", paddingRight: "10pt" }}>
                Bill Amount
              </td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "15pt" }}>
                {(billData.netAmount || totalAmount).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="total-info" style={{ marginTop: "2mm", fontSize: "9pt", display: "flex", flexDirection: "row", gap: "5mm" }}>
            <p>Total Items: {billData.items?.length || 0}</p>
            <p>Total Qty: {totalQty.toFixed(3)}</p>
        </div>
        <hr className="dashed" style={{ margin: 0, width: "100%" }} />

        {/* Payment Mode Table - Always Show */}
        <div style={{ marginTop: "2mm", width: "100%", overflow: "visible" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", tableLayout: "fixed" }}>
            <tbody>
              <tr>
                <td 
                  style={{ 
                    border: "1pt solid #070808", 
                    textAlign: "center", 
                    padding: "3pt 2pt", 
                    fontWeight: "bold",
                    width: "25%",
                    fontSize: "8pt"
                  }}
                >
                  Cash
                </td>
                <td 
                  style={{ 
                    border: "1pt solid #070808", 
                    textAlign: "center", 
                    padding: "3pt 2pt", 
                    fontWeight: "bold",
                    width: "25%",
                    fontSize: "8pt"
                  }}
                >
                  UPI
                </td>
                <td 
                  style={{ 
                    border: "1pt solid #070808", 
                    textAlign: "center", 
                    padding: "3pt 2pt", 
                    fontWeight: "bold",
                    width: "25%",
                    fontSize: "8pt"
                  }}
                >
                  Card
                </td>
                <td 
                  style={{ 
                    border: "1pt solid #070808", 
                    textAlign: "center", 
                    padding: "3pt 2pt", 
                    fontWeight: "bold",
                    width: "25%",
                    fontSize: "8pt"
                  }}
                >
                  Balance
                </td>
              </tr>  
              <tr>
                <td 
                  style={{ 
                    border: "1pt solid #070808", 
                    textAlign: "center", 
                    padding: "3pt 2pt",
                    width: "25%",
                    fontSize: "8pt"
                  }}
                >
                  {cashAmount.toFixed(2)}
                </td>
                <td 
                  style={{ 
                    border: "1pt solid #070808", 
                    textAlign: "center", 
                    padding: "3pt 2pt",
                    width: "25%",
                    fontSize: "8pt"
                  }}
                >
                  {upiAmount.toFixed(2)}
                </td>
                <td 
                  style={{ 
                    border: "1pt solid #070808", 
                    textAlign: "center", 
                    padding: "3pt 2pt",
                    width: "25%",
                    fontSize: "8pt"
                  }}
                >
                  {cardAmount.toFixed(2)}
                </td>
                <td 
                  style={{ 
                    border: "1pt solid #070808", 
                    textAlign: "center", 
                    padding: "3pt 2pt",
                    width: "25%",
                    fontSize: "8pt"
                  }}
                >
                  {balanceAmount.toFixed(2)}
                </td>
              </tr>                       
            </tbody>
          </table>
        </div>

        {/* Cash Tender Breakdown Table */}
        {billData.denominations && (
          <div style={{ marginTop: "2mm", width: "100%", overflow: "visible" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt", tableLayout: "fixed" }}>
              <tbody>
                <tr>
                  <td 
                    style={{ 
                      border: "1pt solid #070808", 
                      textAlign: "center", 
                      padding: "2pt 1pt", 
                      fontWeight: "bold",
                      width: "10%",
                      fontSize: "7pt"
                    }}
                  >
                    CA
                  </td>
                  {[500, 200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                    <td 
                      key={`denom-${denom}`}
                      style={{ 
                        border: "1pt solid #070808", 
                        textAlign: "center", 
                        padding: "2pt 1pt", 
                        fontWeight: "bold",
                        width: "10%",
                        fontSize: "7pt"
                      }}
                    >
                      {denom}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td 
                    style={{ 
                      border: "1pt solid #070808", 
                      textAlign: "center", 
                      padding: "2pt 1pt",
                      fontWeight: "bold",
                      width: "10%",
                      fontSize: "7pt"
                    }}
                  >
                    RE
                  </td>
                  {[500, 200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                    <td 
                      key={`receive-${denom}`}
                      style={{ 
                        border: "1pt solid #070808", 
                        textAlign: "center", 
                        padding: "2pt 1pt",
                        width: "10%",
                        fontSize: "7pt"
                      }}
                    >
                      {billData.denominations[denom]?.receive || ''}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td 
                    style={{ 
                      border: "1pt solid #070808", 
                      textAlign: "center", 
                      padding: "2pt 1pt",
                      fontWeight: "bold",
                      width: "10%",
                      fontSize: "7pt"
                    }}
                  >
                    IS
                  </td>
                  {[500, 200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                    <td 
                      key={`issue-${denom}`}
                      style={{ 
                        border: "1pt solid #070808", 
                        textAlign: "center", 
                        padding: "2pt 1pt",
                        width: "10%",
                        fontSize: "7pt"
                      }}
                    >
                      {billData.denominations[denom]?.issue || ''}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

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
          <div className="company-name">R.SANKARAPANDIAN STORES</div>
          <div className="company-address">
            51/179, HARIHARAN BAZAAR STREET<br />
            PONNERI - 601204
          </div>
          <div className="contact">Customer Care: 044-27973611 / 72007 79217</div>
          <div className="gst-number">GST No: 33ECCPR7067N1ZL</div>
        </div>

        {/* Dynamic Content */}
        {mode === "tax_invoice" && renderSalesInvoice()}
      </div>
    </div>
  );
});

PrintInvoice.displayName = 'PrintInvoice';

export default PrintInvoice;
