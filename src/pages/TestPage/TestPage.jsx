import React, { useRef, useState } from "react";

// Dynamic content data
const contentList = [
  { name: "message", value: "Hello user" },
  { name: "scrap_bill", value: "Scrap Bill Details" },
  // Add more content objects as needed
];

const scrapBillData = {
  customername: "John Doe",
  billNo: "RS/SCR/25-26/0129/003",
  date: "29-Jan-2026",
  time: "12:59 PM",
  customerId: "RS6385666140",
  customerName: "John Doe",
  items: [
    { name: "STEEL", rate: 45, qty: 1.845, amount: 100.00 },
    { name: "ALUMINIUM", rate: 175, qty: 0.78, amount: 150.00 },
    { name: "THARA O.T", rate: 490, qty: 0.235, amount: 100.00 },
    { name: "THARA O.T", rate: 10, qty: 0.235, amount: 120.00 },
  ],
//   totalAmount: 334.00,
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

function renderDynamicContent(selectedName) {
  const item = contentList.find((c) => c.name === selectedName);
  if (!item) return null;
  
  if (item.name === "message") {
    return <div>{item.value}</div>;
  }

  if (item.name === "scrap_bill") {
    // Calculate total dynamically
    const totalAmount = scrapBillData.items.reduce(
      (sum, item) => sum + item.amount, 
      0
    );
    return (
      <div>
        <div className="scrap-title">
            <h3>SCRAP BILL</h3>
        </div>
        <div className="cust-name"><h6>Salesman: {scrapBillData.customername}</h6></div>
        
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
            <div>QR</div>
          </div>
        </div>

        <hr className="dashed" />

        {/* Customer Info */}
        <div className="customer-info">
          Customer: {scrapBillData.customerId}
        </div>
        <hr className="dashed" />
        {/* Main Table */}
        <table className="items">
          <thead>
            <tr>
              <th style={{ textAlign: "left", width: "38%", fontWeight: "bold" }}>Particulars</th>
              <th style={{ textAlign: "center", width: "15%", fontWeight: "bold" }}>Rate</th>
              <th style={{ textAlign: "center", width: "15%", fontWeight: "bold" }}>Qty</th>
              <th style={{ textAlign: "right", width: "32%", fontWeight: "bold" }}>Amount</th>
            </tr>
          </thead>
          
          <tbody>
            <tr>
                <td colSpan="4">
                    <hr className="dashed" />
                </td>
            </tr>
            {scrapBillData.items.map((item, index) => (
              <tr key={index}>
                <td style={{ textAlign: "left" }}>{item.name}</td>
                <td style={{ textAlign: "right" }}>{item.rate.toFixed(2)}</td>
                <td style={{ textAlign: "right" }}>{item.qty.toFixed(3)}</td>
                <td style={{ textAlign: "right" }}>{item.amount.toFixed(2)}</td>
              </tr>
            ))}
            
            <tr>
              <td colSpan="4">
                <hr className="dashed" />
              </td>
            </tr>
            
            {/* Total Amount */}
            <tr className="total-row">
              <td colSpan="3" style={{ textAlign: "right" }}>
                Amount
              </td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "15pt" }}>
                {totalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

export default function TestPage() {
  const printRef = useRef(null);
  const [selectedContent, setSelectedContent] = useState(contentList[0].name);

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;

    const win = window.open("", "", "width=300,height=500");

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
            font-size: 8pt;
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
            font-weight: normal;
            text-align: left;
            padding-bottom: 1mm;
          }

          table.items th.center {
            text-align: center;
          }

          table.items th.right {
            text-align: right;
          }

          table.items td {
            padding: 1mm 0;
          }

          .total-row {
            font-weight: bold;
            font-size: 9pt;
            padding-top: 2mm;
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
          {renderDynamicContent(selectedContent)}

          <hr className="dashed" />

          {/* Terms and Conditions */}
          {/* <div className="terms">
            <div>( Incl. of all Taxes )</div>
            <div>-E & O E. No Exchange No Refund-</div>
            <div>-No Return for CHINA and WOODEN PRODUCTS-</div>
          </div> */}

          {/* Thank You Message */}
          <div className="thank-you">*** Thank You Visit Again! ***</div>
        </div>
      </div>
    </div>
  );
}