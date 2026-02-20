import React from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import logo from '../../assets/logo1.jpeg';
import { toast } from 'react-toastify';

/* ================= HELPERS ================= */

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const formatCurrency = (val) => {
  const num = Number(val || 0);
  return num.toFixed(2);
};

const formatCurrencyq = (val) => {
  const num = Number(val || 0);
  return num.toFixed(0);
};

/* ================= PDF GENERATOR ================= */

export const generateTenderA4PDF = async ({ billData }) => {
  try {
    if (!billData || !billData.items || billData.items.length === 0) {
      throw new Error('No items to print');
    }
    console.log('Generating PDF with bill data:', {billData});

    /* ---------- NORMALIZE DATA ---------- */

    const items = billData.items;

    const totalAmount = items.reduce(
      (sum, i) => sum + Number(i.amount || (i.qty * i.rate) || 0),
      0
    );

    const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);

    const discount = Number(billData.discount || 0);
    const roundOff = Number(billData.roudOff || 0);
    const salesReturn = Number(billData.salesReturnAmount || 0);
    const scrapAmt = Number(billData.scrapAmount || 0);
    const freightCharge = Number(billData.freightCharge || 0);
    const serviceCharge = Number(billData.serviceChargeAmount || 0);
    
    // Sub Total = Grand Total - Discount + Round Off
    const subTotal = totalAmount - discount + roundOff;
    
    // Sub Total(2) = Sub Total - (Sales Return + Scrap Amt)
    const subTotal2 = subTotal - (salesReturn + scrapAmt);
    
    // Net Amount = Sub Total(2) + Freight Charge + Service Charge
    const netAmount = subTotal2 + freightCharge + serviceCharge;

    /* ---------- PDF SETUP ---------- */

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 10;
    const marginRight = 10;
    let y = 10;

    // Add overall border
    doc.setLineWidth(0.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    /* ---------- LOGO ---------- */

    const imgProps = doc.getImageProperties(logo);
    const imgWidth = 30;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    doc.addImage(
      logo,
      'JPEG',
      pageWidth - marginRight - imgWidth,
      y,
      imgWidth,
      imgHeight
    );

    /* ---------- HEADER ---------- */

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('TAX INVOICE', pageWidth / 2, y + 10, { align: 'center' });
    y += 25;

    /* ----------invoice details ---------- */
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('No : ', marginLeft, y);
    doc.text(billData.voucherNo || 'N/A', marginLeft + 10, y);
    y += 5;
    doc.text('Date : ', marginLeft, y);
    doc.text(formatDate(billData.voucherDate), marginLeft + 10, y);
    
    // Add line below No and Date
    y += 2;
    doc.setLineWidth(0.2);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 8;

    /* ---------- COMPANY ---------- */

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed By :', marginLeft, y);
    doc.text('Billed To :', pageWidth / 2, y);
    y += 7;
    doc.setFontSize(12);
    doc.text('R. SANKARAPANDIAN STORES', marginLeft, y);
    doc.text(billData.customerName || 'N/A', pageWidth / 2, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('51/179, HARIHARAN BAZAAR STREET PONNERI,', marginLeft, y);
    doc.text(billData.customerMobile || 'N/A', pageWidth / 2, y);
    y += 4;
    doc.text('PONNERI,', marginLeft, y);
    y += 4;
    doc.text('Tamil Nadu, India - 601204', marginLeft, y);
    y += 4;
    
    // GSTIN
    doc.setFont('helvetica', 'bold');
    doc.text('GSTIN: ', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text('33ECCPR7067N1ZL', marginLeft + 12, y);
    y += 4;

    // PAN
    doc.setFont('helvetica', 'bold');
    doc.text('PAN: ', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text('ECQPR7067N', marginLeft + 12, y);
    y += 4;

    // Email
    doc.setFont('helvetica', 'bold');
    doc.text('Email: ', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text('rspvfstores@gmail.com', marginLeft + 12, y);
    y += 4;

    // Phone
    doc.setFont('helvetica', 'bold');
    doc.text('Phone: ', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text('+91 72007 79217', marginLeft + 12, y);
  
    // Add vertical lines
    doc.setLineWidth(0.2);
    // First vertical line between Billed By and Billed To
    doc.line(pageWidth / 2 - 10, y - 45, pageWidth / 2 - 10, y - 5);
    // Second vertical line after Billed To
    doc.line(pageWidth / 2 + 70, y - 45, pageWidth / 2 + 70, y - 5);

    /* ---------- QR CODE ---------- */
    const qr = await QRCode.toDataURL(billData.voucherNo || 'N/A');
    const qrWidth = 25;
    const qrHeight = 25;
    doc.addImage(qr, 'PNG', pageWidth - marginRight - qrWidth, 10 + imgHeight + 2, qrWidth, qrHeight);
    
    y += 20;
    
    // Add line below Billed To section
    y += 5;
    doc.setLineWidth(0.2);
    doc.line(marginLeft, y - 20, pageWidth - marginRight, y - 20);
    
    /* ---------- ITEMS TABLE ---------- */

    // Table Header with blue background (matching item table color)
    doc.setFillColor(27, 145, 218);
    doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    const colWidths = [10, 85, 20, 20, 25, 30];
    const headers = ['S.No', 'Item Name', 'HSN', 'Qty', 'Rate', 'Amount'];
    
    let x = marginLeft;
    
    headers.forEach((h, i) => {
      if (h === 'Qty' || h === 'Rate' || h === 'Amount') {
        doc.text(h, x + (colWidths[i] / 2), y + 4.5, { align: 'center' });
      } else {
        const offset = h === 'S.No' ? colWidths[i] / 2 : 2;
        const align = h === 'S.No' ? 'center' : 'left';
        doc.text(h, x + offset, y + 4.5, { align: align });
      }
      x += colWidths[i];
    });
    
    y += 9;
    doc.setTextColor(0, 0, 0);
    
    // Items Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    items.forEach((item, idx) => {
      const nameLines = doc.splitTextToSize(item.itemName || 'N/A', colWidths[1] - 4);
      const rowHeight = Math.max(6, nameLines.length * 2.5);
      
      // Alternating row background (light blue for even rows)
      if (idx % 2 === 0) {
        doc.setFillColor(240, 248, 255);
        doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, rowHeight, 'F');
      }
      
      x = marginLeft;
      
      doc.text(String(idx + 1), x + (colWidths[0] / 2), y + rowHeight / 2, { align: 'center' });
      x += colWidths[0];
      
      doc.text(nameLines, x + 2, y + 2, { maxWidth: colWidths[1] - 4 });
      x += colWidths[1];
      
      doc.text(item.hsn || '-', x + (colWidths[2] / 2), y + rowHeight / 2, { align: 'center' });
      x += colWidths[2];
      
      doc.text(formatCurrencyq(item.qty), x + (colWidths[3] / 2), y + rowHeight / 2, { align: 'right' });
      x += colWidths[3];
      
      doc.text(formatCurrency(item.rate), x + (colWidths[4] / 2), y + rowHeight / 2, { align: 'right' });
      x += colWidths[4];
      
      doc.text(formatCurrency(item.amount || (item.qty * item.rate)), 
               x + (colWidths[5] / 2) + 4, y + rowHeight / 2, { align: 'right' });
      
      y += rowHeight;
    });
    
    // Add line below the table
    y += 2;
    doc.setLineWidth(0.2);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 5;

    // Total Items, Total Qty, Grand Total in a single row (2:1 ratio)
    const summaryWidth = pageWidth - marginLeft - marginRight;
    const leftWidth = summaryWidth * 0.66; // 2/3 of the width
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Items: ${items.length}`, marginLeft, y);
    doc.text(`Total Qty: ${totalQty}`, marginLeft + 50, y);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Grand Total: ${formatCurrency(totalAmount)}`, marginLeft + leftWidth, y);
    
    y += 15;

    /* ---------- ROW 1: Three columns (1:1:1 ratio) ---------- */
    
    const colWidth = (summaryWidth - 20) / 3; // 20mm for gaps between columns
    
    // Column 1: Payment Mode
    const col1X = marginLeft;
    
    // Payment Mode Table with matching colors
    doc.setFillColor(27, 145, 218);
    doc.rect(col1X, y - 2, colWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PAYMENT MODE', col1X + 2, y + 2);
    doc.setTextColor(0, 0, 0);
    
    // Payment Table
    let paymentY = y + 8;
    doc.setFontSize(9);
    
    // Payment Table Header with light blue background
    doc.setFillColor(240, 248, 255);
    doc.rect(col1X, paymentY - 3, colWidth, 5, 'F');
    doc.setFont('helvetica', 'bold');
    const paymentColWidth = colWidth / 4;
    doc.text('Cash', col1X + paymentColWidth/2, paymentY);
    doc.text('UPI', col1X + paymentColWidth*1.5, paymentY);
    doc.text('Card', col1X + paymentColWidth*2.5, paymentY);
    doc.text('Bal', col1X + paymentColWidth*3.5, paymentY);
    paymentY += 4;
    
    // Payment Table Values
    const cashAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'CASH')?.amount || 0;
    const upiAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'UPI')?.amount || 0;
    const cardAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'CARD')?.amount || 0;
    const balanceAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'BALANCE')?.amount || 0;
    
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(cashAmount), col1X + paymentColWidth/2, paymentY);
    doc.text(formatCurrency(upiAmount), col1X + paymentColWidth*1.5, paymentY);
    doc.text(formatCurrency(cardAmount), col1X + paymentColWidth*2.5, paymentY);
    doc.text(formatCurrency(balanceAmount), col1X + paymentColWidth*3.5, paymentY);
    
    // Column 2: Transport Details
    const col2X = col1X + colWidth + 10;
    
    doc.setFillColor(27, 145, 218);
    doc.rect(col2X, y - 2, colWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TRANSPORT DETAILS', col2X + 2, y + 2);
    doc.setTextColor(0, 0, 0);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let transportY = y + 8;
    
    // Transport details with alternating background
    doc.setFillColor(240, 248, 255);
    doc.rect(col2X, transportY - 3, colWidth, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Transport Name:', col2X + 2, transportY);
    transportY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(billData.fTransport || '', col2X + 2, transportY);
    transportY += 5;
    
    doc.setFillColor(240, 248, 255);
    doc.rect(col2X, transportY - 3, colWidth, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle No:', col2X + 2, transportY);
    transportY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(billData.transportNo || '', col2X + 2, transportY);
    transportY += 5;
    
    doc.setFillColor(240, 248, 255);
    doc.rect(col2X, transportY - 3, colWidth, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text(`Card chrg ${billData.servicechrgper || ''}%:`, col2X + 2, transportY);
    transportY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(billData.servicechrg || 0), col2X + 2, transportY);
    
    // Column 3: Reserved for Summary (will be filled after row 2)
    const col3X = col2X + colWidth + 10;
    
    y = Math.max(paymentY, transportY) + 15;

    /* ---------- ROW 2: Three columns (1:1:1 ratio) ---------- */
    
    // Column 1: Cash Note
    const row2Y = y;
    
    doc.setFillColor(27, 145, 218);
    doc.rect(col1X, row2Y - 2, colWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CASH NOTE', col1X + 2, row2Y + 2);
    doc.setTextColor(0, 0, 0);
    
    let cashNoteY = row2Y + 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    if (billData.denominations) {
      const denominations = [500, 200, 100, 50, 20, 10, 5, 2, 1];
      
      // Header row with light blue background
      doc.setFillColor(240, 248, 255);
      doc.rect(col1X, cashNoteY - 3, colWidth, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('CA', col1X + 2, cashNoteY);
      denominations.forEach((denom, i) => {
        doc.text(denom.toString(), col1X + 10 + (i * 6), cashNoteY);
      });
      cashNoteY += 3;
      
      // Receive row
      doc.setFillColor(255, 255, 255);
      doc.rect(col1X, cashNoteY - 3, colWidth, 4, 'F');
      doc.setFont('helvetica', 'normal');
      doc.text('RE', col1X + 2, cashNoteY);
      denominations.forEach((denom, i) => {
        doc.text((billData.denominations[denom]?.receive || '').toString(), col1X + 10 + (i * 6), cashNoteY);
      });
      cashNoteY += 3;
      
      // Issue row with light blue background
      doc.setFillColor(240, 248, 255);
      doc.rect(col1X, cashNoteY - 3, colWidth, 4, 'F');
      doc.text('IS', col1X + 2, cashNoteY);
      denominations.forEach((denom, i) => {
        doc.text((billData.denominations[denom]?.issue || '').toString(), col1X + 10 + (i * 6), cashNoteY);
      });
    }
    
    // Column 2: Terms and Conditions
    doc.setFillColor(27, 145, 218);
    doc.rect(col2X, row2Y - 2, colWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TERMS AND CONDITIONS', col2X + 2, row2Y + 2);
    doc.setTextColor(0, 0, 0);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let termsY = row2Y + 8;
    
    // Terms with alternating background
    doc.setFillColor(240, 248, 255);
    doc.rect(col2X, termsY - 3, colWidth, 4, 'F');
    doc.text('1. Without bill there is No Exchange', col2X + 2, termsY);
    termsY += 4;
    
    doc.setFillColor(255, 255, 255);
    doc.rect(col2X, termsY - 3, colWidth, 4, 'F');
    doc.text('   Available.', col2X + 2, termsY);
    termsY += 4;
    
    doc.setFillColor(240, 248, 255);
    doc.rect(col2X, termsY - 3, colWidth, 4, 'F');
    doc.text('2. The exchange will be done in the', col2X + 2, termsY);
    termsY += 4;
    
    doc.setFillColor(255, 255, 255);
    doc.rect(col2X, termsY - 3, colWidth, 4, 'F');
    doc.text('   afternoon from 2 PM to 5 PM.', col2X + 2, termsY);
    termsY += 4;
    
    doc.setFillColor(240, 248, 255);
    doc.rect(col2X, termsY - 3, colWidth, 4, 'F');
    doc.text('3. Goods can be exchanged within', col2X + 2, termsY);
    termsY += 4;
    
    doc.setFillColor(255, 255, 255);
    doc.rect(col2X, termsY - 3, colWidth, 4, 'F');
    doc.text('   2 days of purchase.', col2X + 2, termsY);
    termsY += 4;
    
    doc.setFillColor(240, 248, 255);
    doc.rect(col2X, termsY - 3, colWidth, 4, 'F');
    doc.text('4. NO RETURN ON SERVICE', col2X + 2, termsY);
    termsY += 4;
    
    doc.setFillColor(255, 255, 255);
    doc.rect(col2X, termsY - 3, colWidth, 4, 'F');
    doc.text('   PRODUCTS ***', col2X + 2, termsY);

    /* ---------- SUMMARY SECTION (Right side - covering both rows) ---------- */
    
    // Summary section with matching colors
    doc.setFillColor(27, 145, 218);
    doc.rect(col3X, row2Y - 30 - 2, colWidth, 6, 'F'); // Header spanning both rows
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('SUMMARY', col3X + 2, row2Y - 30);
    doc.setTextColor(0, 0, 0);
    
    let summaryY = row2Y - 30 + 8;
    let summaryRow = 0;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Summary items with alternating background
    const summaryItems = [
      { label: `Dis ${billData.discountPercent || ''}%`, value: discount },
      { label: 'Round Off', value: roundOff },
      { label: 'Sub Total', value: subTotal },
      { label: 'Sales Return', value: salesReturn },
      { label: 'Scrap Amt', value: scrapAmt },
      { label: 'Sub Total(2)', value: subTotal2 },
      { label: 'Freight chrg', value: freightCharge },
      { label: 'Service chrg', value: serviceCharge }
    ];
    
    summaryItems.forEach((item, index) => {
      // Alternating background
      if (index % 2 === 0) {
        doc.setFillColor(240, 248, 255);
        doc.rect(col3X, summaryY - 3, colWidth, 5, 'F');
      }
      
      doc.text(item.label, col3X + 2, summaryY);
      doc.text(formatCurrency(item.value), col3X + colWidth - 5, summaryY, { align: 'right' });
      summaryY += 5;
    });
    
    // Net Amount (bold and larger, with blue background)
    summaryY += 2;
    doc.setFillColor(27, 145, 218);
    doc.rect(col3X, summaryY - 3, colWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Net Amt', col3X + 2, summaryY);
    doc.text(formatCurrency(netAmount), col3X + colWidth - 5, summaryY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    
    y = Math.max(cashNoteY, termsY, summaryY) + 15;

    /* ---------- THANK YOU MESSAGE ---------- */
    
    y = pageHeight - 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('*** Thank You Visit Again! ***', pageWidth / 2, y, { align: 'center' });

    /* ---------- PRINT ---------- */

    doc.autoPrint();
    const pdfDataUri = doc.output('dataurlstring');

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head><title>Invoice ${billData.voucherNo}</title></head>
        <body style="margin:0">
          <iframe src="${pdfDataUri}" style="width:100%;height:100vh;border:none"></iframe>
        </body>
      </html>
    `);
    win.document.close();

  } catch (err) {
    toast.error(err.message || 'Print failed');
    console.error('Print error:', err || err.message);
  }
};

/* ================= COMPONENT ================= */

const PrintTenderA4 = ({ isOpen, onClose, billData }) => {
  const printed = React.useRef(false);

  React.useEffect(() => {
    if (isOpen && !printed.current) {
      printed.current = true;
      generateTenderA4PDF({ billData }).finally(() => {
        setTimeout(() => {
          printed.current = false;
          onClose();
        }, 1000);
      });
    }
  }, [isOpen, billData, onClose]);

  return null;
};

export default PrintTenderA4;