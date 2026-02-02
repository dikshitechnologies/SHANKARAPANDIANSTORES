import React, { useRef, useState } from "react";
import QRCode from "qrcode";
import logo from "../../assets/logo1.jpeg";

// Dynamic content data
const contentList = [
  { name: "message", value: "Hello user" },
  { name: "salesinvoice", value: "Scrap Bill Details" },
  // Add more content objects as needed
];

const scrapBillData = {
  salesmanname: "John Doe",
  billNo: "RS/SCR/25-26/0129/003",
  date: "29-Jan-2026",
  time: "12:59 PM",
  customerId: "RS6385666140",
  customerName: "David",
  items: [
    { name: "STEEL", hsn: "7208", tax: "18%", rate: 45000, qty: 1, amount: 45000.00 },
    { name: "ALUMINIUM", hsn: "7601", tax: "18%", rate: 17500, qty: 0.78, amount: 13650.00 },
    { name: "THARA O.T", hsn: "7602", tax: "18%", rate: 4900, qty: 0.235, amount: 1151.50 },
    { name: "THARA O.T", hsn: "7602", tax: "18%", rate: 1000, qty: 0.235, amount: 235.00 },
  ],
  modeofPayment: [
    {method : "CARD", amount: 0.00},
    {method : "UPI", amount: 0.00},
    {method : "CASH", amount: 334.00},
    {method : "BALANCE", amount: 0.00},
  ],
  gstNumber: "33ECCPR7067N1ZL",
  companyName: "R.SANKARAPANDIAN STORE",
  companyAddress: "51/179, HARIHARAN BAZAAR STREET\nPONNERI - 601204",
  contact: "Customer Care: 044-27973611 / 72007 79217",
  terms: [
    "( Incl. of all Taxes )",
    "-E & O E. No Exchange No Refund-",
    "-No Return for CHINA and WOODEN PRODUCTS-"
  ]
};

function renderDynamicContent(selectedName, qrcodeRef) {
  const item = contentList.find((c) => c.name === selectedName);
  if (!item) return null;
  
  if (item.name === "message") {
    return <div>{item.value}</div>;
  }

  if (item.name === "salesinvoice") {
    // Calculate total dynamically
    const totalAmount = scrapBillData.items.reduce(
      (sum, item) => sum + item.amount, 
      0
    );
    const totalQty = scrapBillData.items.reduce((total, item) => total + item.qty, 0);
    
    return (
      <div>
        <div className="scrap-title">
            <h3>TAX INVOICE</h3>
        </div>
        <div className="cust-name"><h6>Salesman: {scrapBillData.salesmanname}</h6></div>
        
        {/* Bill number and date */}
        <div className="bill">
          <div className="bill-info">
            <div>
              <div>No. {scrapBillData.billNo}</div>
              <div>Date {scrapBillData.date}</div>
              <div>Time: {scrapBillData.time}</div>
            </div>
          </div>
          <div>
            <div ref={qrcodeRef} style={{ display: "flex", justifyContent: "center", width: "50px", height: "50px" }}></div>
          </div>
        </div>

        <hr className="dashed" />

        {/* Customer Info */}
        <div className="customer-info">
          <p>Customer: {scrapBillData.customerName}</p>
            <p style={{marginLeft: "50pt"}}>{scrapBillData.customerId}</p>
        </div>
        <hr className="dashed" />
        
        {/* Main Table - FIXED STRUCTURE */}
        <table className="items">
          <thead>
            <tr>
              <th style={{ textAlign: "left", width: "40%" }} colSpan="3">Particulars</th>              
            </tr>
            <tr>
              <th style={{ textAlign: "center", width: "20%",paddingLeft: "10pt" }}>HSN</th>
              <th style={{ textAlign: "center", width: "20%",paddingLeft: "10pt" }}>Tax</th>
              <th style={{ textAlign: "center", width: "25%",paddingLeft: "10pt" }}>Rate</th>
              <th style={{ textAlign: "center", width: "25%",paddingLeft: "10pt" }}>Qty</th>
              <th style={{ textAlign: "right", width: "30%",paddingLeft: "10pt" }}>Amount</th>
            </tr>
          </thead>
          
          <tbody>
            <tr>
                <td colSpan="5">
                    <hr className="dashed" />
                </td>
            </tr>
            
            {scrapBillData.items.map((item, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td style={{ textAlign: "left" }} colSpan="3">{item.name}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center", fontSize: "8pt" }}>{item.hsn}</td>
                  <td style={{ textAlign: "center", fontSize: "8pt" }}>{item.tax}</td>
                  <td style={{ textAlign: "right", paddingLeft: "10pt" }}>{item.rate.toFixed(2)}</td>
                  <td style={{ textAlign: "right", paddingLeft: "10pt" }}>{item.qty.toFixed(3)}</td>
                  <td style={{ textAlign: "right", paddingLeft: "10pt" }}>{item.amount.toFixed(2)}</td>
                </tr>
              </React.Fragment>
            ))}
            
            <tr>
              <td colSpan="5">
                <hr className="dashed" />
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
                Amount
              </td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "15pt" }}>
                {totalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="total-info">
            <p>Total Items: {scrapBillData.items.length}</p>
            <p>Total Qty: {totalQty.toFixed(3)}</p>
        </div>
        <hr className="dashed" />
        
        <div className="table-container">
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "5mm", fontSize: "8pt" }}>
            <tbody>
                <tr style={{ border: "1pt solid #070808" }}>
                    <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "2pt", fontWeight: "bold", width: "25%" }}>CARD</td>
                    <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "2pt", fontWeight: "bold", width: "25%" }}>UPI</td>
                    <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "2pt", fontWeight: "bold", width: "25%" }}>CASH</td>
                    <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "2pt", fontWeight: "bold", width: "25%" }}>BALANCE</td>
                </tr>  
                <tr style={{ border: "1pt solid #070808" }}>
                    <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "8pt 2pt", height: "15pt" }}>{scrapBillData.modeofPayment.find(m => m.method === "CARD")?.amount.toFixed(2)}</td>
                    <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "8pt 2pt", height: "15pt" }}>{scrapBillData.modeofPayment.find(m => m.method === "UPI")?.amount.toFixed(2)}</td>
                    <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "8pt 2pt", height: "15pt" }}>{scrapBillData.modeofPayment.find(m => m.method === "CASH")?.amount.toFixed(2)}</td>
                    <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "8pt 2pt", height: "15pt" }}>{scrapBillData.modeofPayment.find(m => m.method === "BALANCE")?.amount.toFixed(2)}</td>
                </tr>                       
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}

export default function TestPage3() {
  const printRef = useRef(null);
  const qrcodeRef = useRef(null);
  const [selectedContent, setSelectedContent] = useState(contentList[0].name);
  // Initialize QR code when content changes or ref is set
      useEffect(() => {
      if (selectedContent === "salesinvoice" && qrcodeRef.current) {
        qrcodeRef.current.innerHTML = "";
    
        QRCode.toString(
          scrapBillData.billNo,
          {
            type: "svg",
            width: 50,        // 👈 slightly bigger = better scan
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
    }, [selectedContent]);

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;

    const win = window.open("", "", "width=300,height=500");

    win.document.open();
    win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Sales Invoice Receipt</title>
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
            font-family: 'Courier New', monospace;
          }

          body {
            margin: 0;
            padding: 0;
            font-size: 10pt;
            width: 80mm;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.3px;
            text-shadow: 0.3px 0 #000;
          }

          .receipt {
            padding: 2mm 3mm;
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
            font-size: 12pt;
            font-weight: bold;
            letter-spacing: 0.5pt;
            margin: 1mm 0;
          }

          .company-address {
            font-size: 7pt;
            line-height: 1.2;
            margin-bottom: 1mm;
          }

          .gst-number {
            font-size: 8pt;
            font-weight: bold;
            margin-bottom: 1mm;
          }

          .contact {
            font-size: 7pt;
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
            font-size: 10pt;
            margin: 2mm 0;
            background-color: #0a0a0a;
            color: #ffffff;
          }
          .cust-name {
            text-align: right;
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 1mm;
          }
          .bill {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
          }
          .bill-info {
            display: flex;
            justify-content: space-between;
            font-size: 8pt;
            font-weight: bold;
            margin-bottom: 1mm;
          }

          .customer-info {
            font-size: 8pt;
            margin-bottom: 2mm;
          }

          table.items {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
          }

          table.items th {
            font-weight: bold;
            text-align: center;
            padding-bottom: 1mm;
          }

          table.items th:first-child {
            text-align: left;
          }

          table.items td {
            padding: 1mm 0;
          }

          table.items td:first-child {
            text-align: left;
          }

          table.items td:nth-child(4),
          table.items td:nth-child(5),
          table.items td:nth-child(6) {
            text-align: right;
          }

          .total-row {
            font-weight: bold;
            font-size: 9pt;
            padding-top: 2mm;
          }
          .total-info {
            margin-top: 2mm;
            font-size: 8pt;
            display: flex;
            flex-direction: row;
            gap: 5mm;
          }
            .table-container {
            margin-top: 1mm;
            overflow-x: auto;
          }
          .terms {
            text-align: center;
            font-size: 7pt;
            line-height: 1.3;
            margin-top: 2mm;
          }

          .thank-you {
            text-align: center;
            font-weight: bold;
            font-size: 9pt;
            margin-top: 3mm;
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

  return (
    <div style={{ padding: 20 }}>
      <h2>Test Printer Utility</h2>
      <select
        value={selectedContent}
        onChange={(e) => setSelectedContent(e.target.value)}
        style={{ marginBottom: 10, padding: "5px 10px" }}
      >
        {contentList.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <button onClick={handlePrint} style={{ padding: "5px 15px", marginLeft: "10px" }}>
        Print 80mm Receipt
      </button>

      {/* HIDDEN PRINT CONTENT */}
      <div ref={printRef} style={{ display: "none" }}>
        <div className="receipt">
          {/* Header with Logo */}
          <div className="header">
            <div className="company-name">R.SANKARAPANDIAN STORE</div>
            <div className="company-address">
              51/179, HARIHARAN BAZAAR STREET<br />
              PONNERI - 601204
            </div>
            <div className="contact">Customer Care: 044-27973611 / 72007 79217</div>
            <div className="gst-number">GST No: 33ECCPR7067N1ZL</div>
          </div>

          <hr className="dashed" />

          {/* Dynamic Content (Scrap Bill) */}
          {renderDynamicContent(selectedContent, qrcodeRef)}

          <hr className="dashed" />

          {/* Thank You Message */}
          <div className="thank-you">*** Thank You Visit Again! ***</div>
        </div>
      </div>
    </div>
  );
}