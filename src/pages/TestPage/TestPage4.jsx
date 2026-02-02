import React, { useRef, useState, useEffect } from "react";
import logo from "../../assets/logo1.jpeg";
import QRCode from "qrcode";
// Dynamic content data
const contentList = [
  { name: "message", value: "Hello user" },
  { name: "payment-voucher", value: "Payment Voucher Details" },
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
  {
    cashBank: "CASH A/C",
    narration: "STEEL SCRAP SALE",
    amount: 10000.00
  },
  {
    cashBank: "CASH A/C",
    narration: "ALUMINIUM SCRAP SALE",
    amount: 1500.00
  },
  {
    cashBank: "BANK OF INDIA",
    narration: "THARA O.T PAYMENT",
    amount: 1000.00
  },
  {
    cashBank: "BANK OF INDIA",
    narration: "THARA O.T EXTRA CHARGE",
    amount: 1200.00
  }
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


const splitNarration = (text, maxLength = 22) => {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach(word => {
    if ((currentLine + " " + word).length <= maxLength) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
};


function renderDynamicContent(selectedName, qrcodeRef) {
  const item = contentList.find((c) => c.name === selectedName);
  if (!item) return null;
  
  if (item.name === "message") {
    return <div>{item.value}</div>;
  }

  if (item.name === "payment-voucher") {
    // Calculate total dynamically
    const totalAmount = scrapBillData.items.reduce(
      (sum, item) => sum + item.amount, 
      0
    );
    return (
      <div>
        <div className="scrap-title">
            <h3>Payment Voucher</h3>
        </div>
        
        {/* Bill number and date */}
        <div className="bill">
          <div className="bill-info">
            <div>
              <div>No. {scrapBillData.billNo}</div>
              <div>Date {scrapBillData.date}</div>
              <div>Time: {scrapBillData.time}</div>
            </div>
          </div>
          <div ref={qrcodeRef} style={{ display: "flex", justifyContent: "center", width: "50px", height: "50px" }}></div>
        </div>

        <hr className="dashed" style={{ margin: 0, width: "100%" }} />

        {/* Customer Info */}
        <div className="customer-info">
          Customer: {scrapBillData.customerId}
        </div>
        <hr className="dashed" style={{ margin: 0, width: "100%" }} />
        {/* Main Table */}
        <table className="items">
          <thead>
            <tr>
             <th style={{ width: "30mm", textAlign: "left" }}>Cash/Bank</th>
            <th style={{ width: "30mm", textAlign: "left" }}>Narration</th>
            
            <th style={{ width: "18mm", textAlign: "right" }}>Amount</th>

          </tr>
          </thead>
          
          <tbody>
            <tr>
                <td colSpan="3" style={{ padding: 0, margin: 0 }}>
                    <hr className="dashed" style={{ margin: 0, width: "100%" }} />
                </td>
            </tr>
{scrapBillData.items.map((item, index) => {
  const narrationLines = splitNarration(item.narration);

  return (
    <React.Fragment key={index}>
      {/* FIRST ROW */}
      <tr>
        <td style={{ textAlign: "left" }}>{item.cashBank}</td>
        <td style={{ textAlign: "left" }}>{narrationLines[0]}</td>
        <td className="amount-cell">
  {item.amount.toFixed(2)}
</td>

      </tr>

      {/* EXTRA NARRATION ROWS */}
      {narrationLines.slice(1).map((line, i) => (
       <tr key={i}>
  <td></td>
  <td style={{ textAlign: "left" }}>{line}</td>
  <td>&nbsp;</td> {/* keeps amount column width */}
</tr>

      ))}
    </React.Fragment>
  );
})}


            
            <tr>
              <td colSpan="4" style={{ padding: 0, margin: 0 }}>
                <hr className="dashed" style={{ margin: 0, width: "100%" }} />
              </td>
            </tr>
            
            {/* Total Amount */}
             <tr className="total-row">
              <td colSpan="2" style={{ textAlign: "left" }}>
                Amount
              </td>
 <td className="total-amount">
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

export default function TestPage4() {
  const printRef = useRef(null);
  const qrcodeRef = useRef(null);
  const [selectedContent, setSelectedContent] = useState(contentList[0].name);

  // Initialize QR code when content changes
  useEffect(() => {
  if (selectedContent === "scrap_bill" && qrcodeRef.current) {
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

    const win = window.open("", "", "width=800,height=500");

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

          /* ===== AMOUNT ALIGNMENT (ITEMS + TOTAL) ===== */
.amount-cell {
  width: 20mm;
  text-align: right;
  padding-right: 1mm;
  font-family: Arial, sans-serif;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  font-weight: 500;
}

/* Total amount slightly bigger but SAME ALIGNMENT */
.total-amount {
  font-size: 8pt;
  font-weight: 500;
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
            font-weight: 600;
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
  overflow: visible;
  white-space: normal;
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

          /* ===== Signature Alignment ===== */

.signature-row {
  width: 100%;
  margin-top: 10mm;        /* Space from total */
  display: flex;
  justify-content: flex-end;
}

.signature-right {
  font-size: 8pt;          /* SMALL font */
  font-weight: 600;
  text-align: right;
  padding-right: 2mm;
  white-space: nowrap;
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
            font-family: Arial, sans-serif;
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

          

          {/* Dynamic Content (Scrap Bill) */}
          {renderDynamicContent(selectedContent, qrcodeRef)}

          <hr className="dashed" />

          {/* Terms and Conditions */}
          {/* <div className="terms">
            <div>( Incl. of all Taxes )</div>
            <div>-E & O E. No Exchange No Refund-</div>
            <div>-No Return for CHINA and WOODEN PRODUCTS-</div>
          </div> */}

          {/* Thank You Message */}
          {/* <div className="thank-you">*** Thank You Visit Again! ***</div> */}
          {/* Signature */}
<div className="signature-row">
  <div className="signature-right">
    Authorised Signatory
  </div>
</div>

        </div>
      </div>
    </div>
  );
}