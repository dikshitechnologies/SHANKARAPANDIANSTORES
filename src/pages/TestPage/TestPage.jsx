import React, { useRef, useState } from "react";
import logo from "../../assets/logo1.jpeg";



// Dynamic content data
const contentList = [
  { name: "message", value: "Hello user" },
  { name: "table", value: [["Name", "Age"], ["Alice", 25], ["Bob", 30]] },
  // Add more content objects as needed
];

function renderDynamicContent(selectedName) {
  const item = contentList.find((c) => c.name === selectedName);
  if (!item) return null;
  if (item.name === "message") {
    return <div>{item.value}</div>;
  }


if (item.name === "table") {
  const th = {
    padding: 0,
    fontSize: "10pt",
    fontFamily: "monospace",
    fontWeight: "normal",
  };

  const td = {
    padding: 0,
    fontSize: "10pt",
    fontFamily: "monospace",
  };

  return (
    <div></div>
  );
}


  return null;
}

export default function TestPage() {
  const printRef = useRef(null);
  const [selectedContent, setSelectedContent] = useState(contentList[0].name);

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;

    const win = window.open("", "", "width=880,height=600");

    win.document.open();
    win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Parking Receipt</title>

        <!-- Barcode & QR libraries -->
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>

        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: monospace;
          }

          .receipt {
            position: relative;
            padding: 3mm;
            width: 80mm;
          }

          .orderNo {
            text-align: right;
            font-size: 8pt;
            font-weight: bold;
          }

          .headerSubTitle {
            text-align: center;
            font-size: 9pt;
          }

          .headerTitle {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
          }

          #location {
            margin-top: 4pt;
            text-align: center;
            font-size: 12pt;
            font-weight: bold;
          }

          #date {
            margin: 4pt 0;
            text-align: center;
            font-size: 8pt;
          }

          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 3mm 0;
          }

          .flex {
            display: flex;
            justify-content: space-between;
          }

          .totals {
            font-size: 8pt;
            width: 100%;
          }

          .row {
            display: flex;
            justify-content: space-between;
          }

          .keepIt {
            text-align: center;
            font-size: 10pt;
            font-weight: bold;
            margin-top: 3mm;
          }

          .keepItBody {
            text-align: justify;
            font-size: 9pt;
          }
        </style>
      </head>

      <body>
        ${printContents}

        <script>
          JsBarcode("#barcode", "20180613T130518", {
            format: "CODE128",
            width: 1.3,
            height: 30,
            displayValue: false
          });

          new QRCode(document.getElementById("qrcode"), {
            text: "https://example.com/receipt/71",
            width: 80,
            height: 80
          });
        </script>
      </body>
      </html>
    `);

    win.document.close();

    setTimeout(() => {
      win.focus();
      win.print();
      win.close();
    }, 800);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Test Printer Utility</h2>
    <select
        value={selectedContent}
        onChange={(e) => setSelectedContent(e.target.value)}
        style={{ marginBottom: 10 }}
      >
        {contentList.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <button onClick={handlePrint}>Print 80mm Receipt</button>

      {/* HIDDEN PRINT CONTENT */}
      <div ref={printRef} style={{ display: "none" }}>
        <div className="receipt">
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
          <div className="headerTitle">R.SANKARAPANDIAN STORE</div>
          <div className="headerSubTitle">
            <div style={{ textAlign: "center", fontWeight: "bold" }}>
              51/179, HARIHARAN BAZAAR STREET
            </div>
            <div style={{ textAlign: "center", fontWeight: "bold" }}>
              PONNERI - 601204
            </div>
            <div style={{ textAlign: "center", fontWeight: "bold" }}>
              Customer Care: 044-27973611 / 72007 79217
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: "11pt",
                fontWeight: "bold",
              }}
            >
              GST No: 33ECCPR7067N1ZL
            </div>
          </div>

          {renderDynamicContent(selectedContent)}

          <div
            className="keepItBody"
            style={{
              textAlign: "center",
              marginTop: 4,
              fontWeight: "normal",
              textShadow: "0.3px 0 0 #000",
            }}
          >
            <div>( Incl. of all Taxes )</div>
            <div>-E & O E. No Exchange No Refund-</div>
            <div>-No Return for CHINA and WOODEN PRODUCTS-</div>
          </div>

          <div className="keepIt">*** Thank You Visit Again! ***</div>
        </div>
      </div>
    </div>
  );
}
