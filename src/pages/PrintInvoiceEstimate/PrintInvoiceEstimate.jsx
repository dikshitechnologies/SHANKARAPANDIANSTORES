import React, { useRef, useEffect, forwardRef } from "react";
import logo from "../../assets/logo1.jpeg";
import QRCode from "qrcode";

const PrintInvoiceEstimate = forwardRef(({ billData, mode = "tax_invoice" }, ref) => {
  const printRef = useRef(null);
  const qrcodeRef = useRef(null);

  // Initialize QR code when component mounts
  useEffect(() => {
    if (qrcodeRef.current && billData?.voucherNo) {
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

  // Define SummaryRow outside handlePrint so it's available in scope
  const SummaryRow = ({ label, value, bold, large }) => (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "1mm"
    }}>
      <div style={{ width: "60%", textAlign: "right", paddingRight: "5pt" }}>
        {label}
      </div>
      <div style={{
        width: "40%",
        textAlign: "right",
        fontWeight: bold ? "bold" : "normal",
        fontSize: large ? "14pt" : "inherit"
      }}>
        {value}
      </div>
    </div>
  );

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
          @media print {
              @page {
                size: 101mm auto;
                margin: 0;
              }
            }


          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
          }

          body {
            padding: 0;
            font-size: 10pt;
            width: 100mm;
            font-family: Arial, sans-serif;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.3px;
            text-shadow: 0.3px 0 #000;
            
          }

          .receipt {                   
            max-width: 98mm;
            padding: 1mm 1mm;         
            border: 1px solid #000;  
            box-sizing: border-box;   
            background: #fff;   
            page-break-inside: avoid;      
          }

            div {
              page-break-inside: avoid !important;
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
            font-size: 15pt;
            font-weight: bold;
            letter-spacing: 0.5pt;
            margin: 1mm 0;
          }

          .company-address {
            font-size: 9pt;
            line-height: 1.2;
            margin-bottom: 1mm;
          }

          table, tr, td, div {
            page-break-inside: avoid !important;
          }

          .gst-number {
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 1mm;
          }

          .contact {
            font-size: 9pt;
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
            color: #0a0a0a;
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
            margin-top: 1mm;
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
            font-size: 8pt;
            padding-top: 2mm;
          }

          .terms {
            text-align: left;
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

          .total-info {
            margin-top: 1mm;
            font-size: 9pt;
            display: flex;
            flex-direction: row;
            gap: 3mm;
            justify-content: space-between;
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

    const discount = Number(billData.discount || 0);
    const roundOff = Number(billData.roudOff || 0);
    const salesReturn = Number(billData.salesReturnAmount || 0);
    const scrapAmt = Number(billData.scrapAmount || 0);

    // Sub Total = Grand Total - Discount + Round Off
    const subTotal = totalAmount - discount + roundOff;

    // Sub Total(2) = Sub Total - (Sales Return + Scrap Amt)
    const subTotal2 = subTotal - (salesReturn + scrapAmt);

    // net amount = Sub Total(2) + Freight Charge + Service Charge
    const freightCharge = Number(billData.freightCharge || 0);
    const serviceCharge = Number(billData.serviceChargeAmount || 0);
    const netAmount = subTotal2 + freightCharge + serviceCharge;

    //amount received = cash + upi + card 
    const amountReceived = cashAmount + upiAmount + cardAmount;

    const taxSummary = {};
    if (billData.items && Array.isArray(billData.items)) {
      billData.items.forEach(item => {
        const tax = Number(item.tax || 0);
        const taxrs = Number(item.taxrs || 0);
        if (!taxSummary[tax]) {
          taxSummary[tax] = 0;
        }
        taxSummary[tax] += taxrs;
      });
    }

    // 2. Prepare rows for the tax box
    const taxRows = Object.entries(taxSummary)
      .filter(([tax, sumTaxrs]) => Number(tax) > 0)
      .map(([tax, sumTaxrs]) => {
        const halfTax = Number(tax) / 2;
        const halfTaxrs = sumTaxrs / 2;
        return (
          <tr key={tax}>
            <td style={{ textAlign: "center", padding: "2pt 4pt" }}>{halfTax}%</td>
            <td style={{ textAlign: "right", padding: "2pt 4pt" }}>{halfTaxrs.toFixed(2)}</td>
            <td style={{ textAlign: "center", padding: "2pt 4pt" }}>{halfTax}%</td>
            <td style={{ textAlign: "right", padding: "2pt 4pt" }}>{halfTaxrs.toFixed(2)}</td>
          </tr>
        );
      });


    // Get day name from date
    const getDayName = (dateString) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', { weekday: 'long' });
      } catch (e) {
        return '';
      }
    };

    return (
      <div>

         <div className="header">
          <div style={{ textAlign: "center" }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                width: 120,
                height: 120,
                objectFit: "contain",
                display: "inline-block",
              }}
            />
          </div>
          <div className="company-name">R.SANKARAPANDIAN STORES</div>
          <div className="company-address">
            51/179, HARIHARAN BAZAAR <br />
            STREET PONNERI - 601204
          </div>
          <div className="company-address">Tamil Nadu/ Tiruvallur</div>
          <div className="contact">Mobile No: 044-27973611 / 72007 79217</div>
          <div className="gst-number">GST No: 33ECCPR7067N1ZL</div>
        </div>
        <hr className="dashed" style={{ margin: 0, width: "100%" }} />
        <div className="invoice-title">ESTIMATE</div>
 <hr className="dashed" style={{ margin: 0, width: "100%" }} />
        {/* Bill number and date */}
        <div className="bill">
          <div className="bill-info" style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <div style={{ fontSize: "7pt" }}>
                <span>INV.No:&nbsp;&nbsp;</span>
                <span>{billData.voucherNo || 'N/A'}</span>
              </div>
              <div style={{ fontSize: "7pt", display: "flex", flexDirection: "column", gap: "3px" }}>
                <div>
                  <span>DATE:&nbsp;&nbsp;</span>
                  <span>
                    {billData.voucherDate ? (() => {
                      try {
                        const dateTime = billData.voucherDate; // "13-02-2026 00:00:00"

                        const [datePart] = dateTime.split(" "); // "13-02-2026"
                        const [day, month, year] = datePart.split("-");

                        if (!day || !month || !year) return "N/A";

                        return `${day}/${month}/${year}`;
                      } catch (e) {
                        return "N/A";
                      }
                    })() : "N/A"}

                  </span>
                </div>
                <span>{getDayName(billData.voucherDate)}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <div style={{ fontSize: "7pt" }}>
                <span>TIME:&nbsp;&nbsp;&nbsp;</span>
                <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
              </div>
              <div className="salesman-name">
                <h6>Salesman: {billData.salesmanName || 'N/A'}</h6>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div className="customer-info">
                  <p>Customer Name: {billData.customerName || ' '}</p>
                </div>
                <div className="customer-info">
                  <p>Mobile Number: {billData.customerMobile || ' '}</p>
                </div>
              </div>
              <div ref={qrcodeRef} style={{ display: "flex", justifyContent: "center", width: "50px", height: "50px" }}></div>
            </div>
          </div>
        </div>

        <hr className="dashed" style={{ margin: 0, width: "100%" }} />

        <div style={{ fontSize: "9pt", fontWeight: "bold", marginTop: "1mm", marginBottom: "1mm", display: "flex", flexDirection: "row", gap: "5mm" }}>
          <>S.No</> <>PRODUCT NAME</>
        </div>

        {/* Main Table */}
        <table className="items" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", width: "15%" }}>HSN</th>
              <th style={{ textAlign: "left", width: "15%" }}>MRP</th>
              <th style={{ textAlign: "left", width: "15%" }}>TAX</th>
              <th style={{ textAlign: "right", width: "15%" }}>{billData?.Type == 'R'? 'SRATE' : 'WRATE' }</th>
              <th style={{ textAlign: "right", width: "20%" }}>QTY</th>
              <th style={{ textAlign: "right", width: "20%" }}>AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            {billData.items && billData.items.map((item, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td colSpan="6" style={{ textAlign: "left", fontWeight: "bold", paddingTop: "2mm" }}>
                    {index + 1}. {item.itemName || ' '}
                  </td>
                </tr>
                {item.description && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "left", paddingLeft: "10pt", fontSize: "8pt" }}>
                      {item.description}
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ textAlign: "center", fontSize: "8pt" }}>{item.hsn || '-'}</td>
                  <td style={{ textAlign: "center", fontSize: "8pt" }}>{item.mrp || '-'}</td>
                  <td style={{ textAlign: "center", fontSize: "8pt" }}>{item.tax || '-'}%</td>
                  <td style={{ textAlign: "right" }}>{Number(item.rate || 0).toFixed(2)}</td>
                  <td style={{ textAlign: "right" }}>{(item.qty || 0)}</td>
                  <td style={{ textAlign: "right" }}>{Number(item.amount || 0).toFixed(2)}</td>
                </tr>

                <tr>
                  <td colSpan="6">
                    <hr className="dashed" style={{ margin: "2mm 0" }} />
                  </td>
                </tr>

              </React.Fragment>
            ))}           

            <tr>
              <td colSpan="6">
                <div className="total-info">
                  <span>Total Items: {billData.items?.length || 0}</span>
                  <span>Total Qty: {totalQty}</span>
                  <span style={{ fontWeight: "bold", fontSize: "11pt" }}>Grand Total: {totalAmount.toFixed(2)}</span>
                </div>
              </td>
            </tr>

          </tbody>
        </table>

        <hr className="dashed" style={{ margin: "2mm 0" }} />       

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
       
        {mode === "Est_invoice" && renderSalesInvoice()}
      </div>
    </div>
  );
});

PrintInvoiceEstimate.displayName = 'PrintInvoiceEstimate';

export default PrintInvoiceEstimate;