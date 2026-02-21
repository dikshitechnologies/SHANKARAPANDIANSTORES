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


        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            margin: "8px 0",
            gap: "0",
          }}
        >
          {/* Left Column: TAX BOX and Payment Mode Table */}
          <div style={{ flex: "1 1 0", minWidth: "0" }}>
            {/* TAX BOX Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "8pt",
                marginBottom: "2mm",
                border: "1px solid #000",
              }}
            >
              <caption
                style={{
                  captionSide: "top",
                  fontWeight: "bold",
                  fontSize: "11pt",
                  textAlign: "center",
                  padding: "4px 0",
                  borderBottom: "1px solid #000",
                  background: "#f5f5f5",
                }}
              >
                TAX BOX
              </caption>
              <thead>
                <tr>
                  <th
                    colSpan={2}
                    style={{
                      textAlign: "center",
                      border: "1px solid #000",
                      background: "#eaeaea",
                    }}
                  >
                    CGST
                  </th>
                  <th
                    colSpan={2}
                    style={{
                      textAlign: "center",
                      border: "1px solid #000",
                      background: "#eaeaea",
                    }}
                  >
                    SGST
                  </th>
                </tr>
              </thead>
              <tbody>
                {taxRows.length > 0 ? (
                  taxRows.map((row, idx) => (
                    <tr key={idx}>
                      {row.props.children.map((cell, i) => (
                        <td
                          key={i}
                          style={{
                            border: "1px solid #000",
                            textAlign: i % 2 === 0 ? "center" : "right",
                            padding: "2pt 4pt",
                          }}
                        >
                          {cell.props ? cell.props.children : cell}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", border: "1px solid #000" }}>
                      No Tax Data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Payment Mode Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "8pt",
                tableLayout: "fixed",
                border: "1px solid #070808",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "3pt 2pt", fontWeight: "bold", width: "25%" }}>
                    Cash
                  </td>
                  <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "3pt 2pt", fontWeight: "bold", width: "25%" }}>
                    UPI
                  </td>
                  <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "3pt 2pt", fontWeight: "bold", width: "25%" }}>
                    Card
                  </td>
                  <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "3pt 2pt", fontWeight: "bold", width: "25%" }}>
                    Bal
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "3pt 2pt" }}>
                    {Number(cashAmount)}
                  </td>
                  <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "3pt 2pt" }}>
                    {Number(upiAmount)}
                  </td>
                  <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "3pt 2pt" }}>
                    {Number(cardAmount)}
                  </td>
                  <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "3pt 2pt" }}>
                    {Number(balanceAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ flexDirection: "column", display: "flex", marginTop: "1mm", justifyContent: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "1mm" }}>
                <div style={{ flex: 1, fontWeight: 500, fontSize: "10pt", textAlign: "left", paddingRight: 4 }}>
                  Transport Name:
                </div>
                <div style={{ flex: 1, fontWeight: 500, fontSize: "10pt", textAlign: "right", paddingLeft: 4, wordBreak: "break-all" }}>
                  {billData.fTransport || ""}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "1mm" }}>
                <div style={{ flex: 1, fontWeight: 500, fontSize: "10pt", textAlign: "left", paddingRight: 4 }}>
                  Vehicle No:
                </div>
                <div style={{ flex: 1, fontWeight: 500, fontSize: "10pt", textAlign: "right", paddingLeft: 4 }}>
                  {billData.transportNo || ""}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "1mm" }}>
                <div style={{ flex: 1, fontWeight: 500, fontSize: "10pt", textAlign: "left", paddingRight: 4 }}>
                  Card chrg {billData.servicechrgper || ""}%:
                </div>
                <div style={{ flex: 1, fontWeight: 500, fontSize: "10pt", textAlign: "right", paddingLeft: 4 }}>
                  {Number(billData.servicechrg || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          {/* Vertical Divider */}
          <div
            style={{
              width: "1px",
              background: "#000",
              minHeight: "180px",
              margin: "0 10px",
              alignSelf: "stretch",
            }}
          />
          {/* Right Column: SummaryRow */}
          <div style={{ flex: "1 1 0", minWidth: "0", paddingLeft: "7px" }}>
            <SummaryRow label={`Dis ${billData.discountPercent || ''}%`} value={Number(billData.discount || 0).toFixed(2)} />
            <SummaryRow label="Round Off" value={Number(billData.roudOff || 0).toFixed(2)} />
            <SummaryRow label="Sub Total" value={subTotal.toFixed(2)} />
            <SummaryRow label="Sales Return" value={Number(billData.salesReturnAmount || 0).toFixed(2)} />
            <SummaryRow label="Scrap Amt" value={Number(billData.scrapAmount ||  0).toFixed(2)} />
            <SummaryRow label="Sub Total(2)" value={subTotal2.toFixed(2)} />
            <SummaryRow label="Freight chrg" value={Number(billData.freightCharge || 0).toFixed(2)} />
            <SummaryRow label="Service chrg" value={Number(billData.serviceChargeAmount || 0).toFixed(2)} />
          </div>
        </div>
        <hr className="dashed" style={{ margin: "2mm 0" }} />

        <div style={{ minWidth: "0", paddingLeft: "7px" ,fontSize: "11pt", fontWeight: "bold"}}>
          <SummaryRow label="Net Amt" value={netAmount.toFixed(2)} />
        </div>

        <hr className="dashed" style={{ margin: "2mm 0" }} />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: "1mm",
            width: "100%",
            fontWeight: "bold",
            fontSize: "10pt",
          }}
        >
          <div>Amount Received: {Number(amountReceived)}</div>
          <div>Balance: {Number(balanceAmount)}</div>
        </div>


        <hr className="dashed" style={{ margin: "2mm 0" }} />

        {/* Cash Tender Breakdown Table */}
        <div style={{ alignContent: "center", marginTop: "1mm", fontWeight: "bold", textAlign: "center" }}>CASH NOTE</div>
        {billData.denominations && (
          <div style={{ marginTop: "2mm", width: "100%" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt", tableLayout: "fixed" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "2pt 1pt", fontWeight: "bold", width: "10%" }}>
                    CA
                  </td>
                  {[500, 200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                    <td key={`denom-${denom}`} style={{ border: "1pt solid #070808", textAlign: "center", padding: "2pt 1pt", fontWeight: "bold", width: "10%" }}>
                      {denom}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "2pt 1pt", fontWeight: "bold" }}>
                    RE
                  </td>
                  {[500, 200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                    <td key={`receive-${denom}`} style={{ border: "1pt solid #070808", textAlign: "center", padding: "2pt 1pt" }}>
                      {billData.denominations[denom]?.receive || ''}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ border: "1pt solid #070808", textAlign: "center", padding: "2pt 1pt", fontWeight: "bold" }}>
                    IS
                  </td>
                  {[500, 200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                    <td key={`issue-${denom}`} style={{ border: "1pt solid #070808", textAlign: "center", padding: "2pt 1pt" }}>
                      {billData.denominations[denom]?.issue || ''}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop: "1mm", fontSize: "7pt", fontWeight: "bold" }}>TERMS AND CONDITIONS</div>
        <div className="terms">
          <p>1. Without bill there is No Exchange Available.</p>
          <p>2. The exchange will be done in the afternoon from 2 PM to 5 PM.</p>
          <p>3. Goods can be exchanged within 2 days of purchase.</p>
          <p>4. NO RETURN ON SERVICE PRODUCTS ***</p>
        </div>

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
       
        {mode === "tax_invoice" && renderSalesInvoice()}
      </div>
    </div>
  );
});

PrintInvoice.displayName = 'PrintInvoice';

export default PrintInvoice;