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

const formatWithoutDecimals = (val) => {
  const num = Number(val || 0);
  return Math.round(num).toString();
};

// Function to convert number to words
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';
  
  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const numStr = num.toFixed(2);
  const [rupees, paise] = numStr.split('.');
  let rupeesNum = parseInt(rupees);
  const paiseNum = parseInt(paise);

  let result = '';

  if (rupeesNum >= 10000000) {
    result += convertLessThanThousand(Math.floor(rupeesNum / 10000000)) + ' Crore ';
    rupeesNum %= 10000000;
  }
  if (rupeesNum >= 100000) {
    result += convertLessThanThousand(Math.floor(rupeesNum / 100000)) + ' Lakh ';
    rupeesNum %= 100000;
  }
  if (rupeesNum >= 1000) {
    result += convertLessThanThousand(Math.floor(rupeesNum / 1000)) + ' Thousand ';
    rupeesNum %= 1000;
  }
  if (rupeesNum >= 100) {
    result += convertLessThanThousand(Math.floor(rupeesNum / 100)) + ' Hundred ';
    rupeesNum %= 100;
  }
  if (rupeesNum > 0) {
    result += convertLessThanThousand(rupeesNum);
  }

  result = result.trim() + ' Rupees';
  
  if (paiseNum > 0) {
    result += ' and ' + convertLessThanThousand(paiseNum) + ' Paise';
  }
  
  return result + ' Only';
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

    // Calculate payment amounts
    const cashAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'CASH')?.amount || 0;
    const upiAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'UPI')?.amount || 0;
    const cardAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'CARD')?.amount || 0;
    const balanceAmount = billData.modeofPayment?.find(p => p.method?.toUpperCase() === 'BALANCE')?.amount || 0;
    const amountReceived = cashAmount + upiAmount + cardAmount;

    // Calculate tax summary for tax box
    const taxSummary = {};
    if (items && Array.isArray(items)) {
      items.forEach(item => {
        const tax = Number(item.tax || 0);
        const taxrs = Number(item.taxrs || 0);
        if (!taxSummary[tax]) {
          taxSummary[tax] = 0;
        }
        taxSummary[tax] += taxrs;
      });
    }

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
    doc.text(billData.customerAddress1 || 'N/A', pageWidth / 2, y);
    y += 4;
    doc.text('PONNERI,', marginLeft, y);
    doc.text(billData.customerAddress2 || 'N/A', pageWidth / 2, y);
    y += 4;
    doc.text('Tamil Nadu, India - 601204', marginLeft, y);
    doc.text(billData.customerAddress3 || 'N/A', pageWidth / 2, y);
    y += 4;
    
    // GSTIN
    doc.setFont('helvetica', 'bold');
    doc.text('GSTIN: ', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text('33ECCPR7067N1ZL', marginLeft + 12, y);
    doc.text(billData.customerGst || 'N/A', pageWidth / 2, y);    
    y += 4;

    // PAN
    doc.setFont('helvetica', 'bold');
    doc.text('PAN: ', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text('ECQPR7067N', marginLeft + 12, y);
    doc.text(billData.customerMobile || 'N/A', pageWidth / 2, y);
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

    /* ---------- QR CODE ---------- */
    const qr = await QRCode.toDataURL(billData.voucherNo || 'N/A');
    const qrWidth = 25;
    const qrHeight = 25;
    doc.addImage(qr, 'PNG', pageWidth - marginRight - qrWidth, 10 + imgHeight + 2, qrWidth, qrHeight);
    
    y += 5;
    
    /* ---------- ITEMS TABLE ---------- */

    // Table Header with blue background
    doc.setFillColor(27, 145, 218);
    doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    const colWidths = [10, 70, 15, 15, 15, 15, 20, 30];
    const headers = ['S.No', 'Item Name', 'HSN', 'MRP', 'Qty', 'Rate', 'Tax', 'Amount'];
    
    let x = marginLeft;
    
    headers.forEach((h, i) => {
      if (h === 'Qty' || h === 'Rate' || h === 'Amount' || h === 'MRP' || h === 'Tax') {
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
    
    // Items Rows - ALL ITEMS on the same page
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    items.forEach((item, idx) => {
      const nameLines = doc.splitTextToSize(item.itemName || 'N/A', colWidths[1] - 4);
      const rowHeight = Math.max(6, nameLines.length * 2.5);
      
      if (idx % 2 === 0) {
        doc.setFillColor(240, 248, 255);
        doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, rowHeight, 'F');
      }
      
      x = marginLeft;
      
      doc.text(String(idx + 1), x + (colWidths[0] / 2), y + rowHeight / 2, { align: 'center' });
      x += colWidths[0];
      
      const nameLinesItem = doc.splitTextToSize(item.itemName || 'N/A', colWidths[1] - 4);
      doc.text(nameLinesItem, x + 2, y + 2, { maxWidth: colWidths[1] - 4 });
      x += colWidths[1];
      
      doc.text(item.hsn || '-', x + (colWidths[2] / 2), y + rowHeight / 2, { align: 'center' });
      x += colWidths[2];
      
      doc.text(item.mrp || '-', x + (colWidths[3] / 2), y + rowHeight / 2, { align: 'center' });
      x += colWidths[3];
      
      doc.text(formatCurrencyq(item.qty), x + (colWidths[4] / 2), y + rowHeight / 2, { align: 'right' });
      x += colWidths[4];
      
      doc.text(formatCurrency(item.rate), x + (colWidths[5] / 2), y + rowHeight / 2, { align: 'right' });
      x += colWidths[5];
      
      doc.text(`${item.tax || 0}%`, x + (colWidths[6] / 2), y + rowHeight / 2, { align: 'center' });
      x += colWidths[6];
      
      doc.text(formatCurrency(item.amount || (item.qty * item.rate)), 
               x + (colWidths[7] / 2) + 4, y + rowHeight / 2, { align: 'right' });
      
      y += rowHeight;
    });
    
    y += 5;

    // Total Items, Total Qty, Grand Total in a single row
    const summaryWidth = pageWidth - marginLeft - marginRight;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Items: ${items.length}`, marginLeft, y);
    doc.text(`Total Qty: ${totalQty}`, marginLeft + 50, y);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Grand Total:', pageWidth - 70, y, { align: 'right' });
    doc.text(`${formatCurrency(totalAmount)}`, pageWidth - marginRight, y, { align: 'right' });
    
    y += 10;

    /* ---------- ROW 1: Three columns (1:1:1 ratio) ---------- */
    
    const colWidth = (summaryWidth - 20) / 3;
    
    // Column 1: Tax Box
    const col1X = marginLeft;
    
    // Tax Box Header
    doc.setFillColor(27, 145, 218);
    doc.rect(col1X, y - 2, colWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TAX BOX', col1X + 2, y + 2);
    doc.setTextColor(0, 0, 0);
    
    // Tax Box Table
    let taxY = y + 8;
    doc.setFontSize(8);
    
    const taxColWidth = colWidth / 4;
    let taxX = col1X;
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    
    doc.rect(taxX, taxY - 3, taxColWidth * 4, 5);
    doc.line(taxX + (2 * taxColWidth), taxY - 3, taxX + (2 * taxColWidth), taxY + 2);
    
    doc.setFont('helvetica', 'bold');
    doc.text('CGST', taxX + taxColWidth, taxY, { align: 'center' });
    doc.text('SGST', taxX + taxColWidth * 3, taxY, { align: 'center' });
    taxY += 4;
    
    doc.setFont('helvetica', 'normal');
    for (let i = 1; i < 4; i++) {
      doc.line(taxX + (i * taxColWidth), taxY - 3, taxX + (i * taxColWidth), taxY + 2);
    }
    
    const taxRows = Object.entries(taxSummary)
      .filter(([tax]) => Number(tax) > 0)
      .map(([tax, sumTaxrs]) => {
        const halfTax = Number(tax) / 2;
        const halfTaxrs = sumTaxrs / 2;
        return { halfTax, halfTaxrs };
      });
    
    if (taxRows.length > 0) {
      taxRows.forEach((row) => {
        taxX = col1X;
        doc.rect(taxX, taxY - 3, taxColWidth * 4, 4);
        for (let i = 1; i < 4; i++) {
          doc.line(taxX + (i * taxColWidth), taxY - 3, taxX + (i * taxColWidth), taxY + 1);
        }
        doc.text(`${row.halfTax}%`, taxX + taxColWidth / 2, taxY, { align: 'center' });
        taxX += taxColWidth;
        doc.text(formatCurrency(row.halfTaxrs), taxX + taxColWidth / 2, taxY, { align: 'center' });
        taxX += taxColWidth;
        doc.text(`${row.halfTax}%`, taxX + taxColWidth / 2, taxY, { align: 'center' });
        taxX += taxColWidth;
        doc.text(formatCurrency(row.halfTaxrs), taxX + taxColWidth / 2, taxY, { align: 'center' });
        taxY += 4;
      });
    } else {
      doc.rect(col1X, taxY - 3, colWidth, 4);
      doc.text('No Tax Data', col1X + colWidth / 2, taxY, { align: 'center' });
      taxY += 4;
    }
    
    // Column 2: Transport Details
    const col2X = col1X + colWidth + 10;
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TRANSPORT DETAILS', col2X + 2, y + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let transportY = y + 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Transport Name:', col2X + 2, transportY);
    transportY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(billData.fTransport || '', col2X + 2, transportY);
    transportY += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle No:', col2X + 2, transportY);
    transportY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(billData.transportNo || '', col2X + 2, transportY);
    transportY += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Card chrg ${billData.servicechrgper || ''}%:`, col2X + 2, transportY);
    transportY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(billData.servicechrg || 0), col2X + 2, transportY);
    
    // Column 3: Summary Section
    const col3X = col2X + colWidth + 10;
    
    let summaryY = y + 2;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
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
    
    summaryItems.forEach((item) => {
      doc.text(item.label, col3X + 2, summaryY);
      doc.text(formatCurrency(item.value), col3X + colWidth - 5, summaryY, { align: 'right' });
      summaryY += 5;
    });
    
    doc.setFontSize(11);
    doc.text('Net Amt', col3X + 2, summaryY);
    doc.text(formatCurrency(netAmount), col3X + colWidth - 5, summaryY, { align: 'right' });
    
    y = Math.max(taxY, transportY, summaryY + 5) + 5;

    /* ---------- ROW 2: Payment Mode and Cash Note ---------- */
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PAYMENT MODE', col2X + 2, y + 2);
    
    let paymentY = y + 8;
    doc.setFontSize(9);
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    
    const paymentColWidth = colWidth / 4;
    
    doc.rect(col2X, paymentY - 3, paymentColWidth * 4, 5);
    for (let i = 1; i < 4; i++) {
      doc.line(col2X + (i * paymentColWidth), paymentY - 3, col2X + (i * paymentColWidth), paymentY + 2);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Cash', col2X + paymentColWidth/2, paymentY, { align: 'center' });
    doc.text('UPI', col2X + paymentColWidth*1.5, paymentY, { align: 'center' });
    doc.text('Card', col2X + paymentColWidth*2.5, paymentY, { align: 'center' });
    doc.text('Bal', col2X + paymentColWidth*3.5, paymentY, { align: 'center' });
    paymentY += 4;
    
    doc.rect(col2X, paymentY - 3, paymentColWidth * 4, 5);
    for (let i = 1; i < 4; i++) {
      doc.line(col2X + (i * paymentColWidth), paymentY - 3, col2X + (i * paymentColWidth), paymentY + 2);
    }
    
    doc.setFont('helvetica', 'normal');
    doc.text(formatWithoutDecimals(cashAmount), col2X + paymentColWidth/2, paymentY, { align: 'center' });
    doc.text(formatWithoutDecimals(upiAmount), col2X + paymentColWidth*1.5, paymentY, { align: 'center' });
    doc.text(formatWithoutDecimals(cardAmount), col2X + paymentColWidth*2.5, paymentY, { align: 'center' });
    doc.text(formatWithoutDecimals(balanceAmount), col2X + paymentColWidth*3.5, paymentY, { align: 'center' });
    
    let cashNoteY = paymentY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CASH NOTE', col2X + 2, cashNoteY);
    
    cashNoteY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    if (billData.denominations) {
      const denominations = [500, 200, 100, 50, 20, 10, 5, 2, 1];
      const cashColWidth = colWidth / 10;
      
      doc.rect(col2X, cashNoteY - 3, cashColWidth * 10, 4);
      for (let i = 1; i < 10; i++) {
        doc.line(col2X + (i * cashColWidth), cashNoteY - 3, col2X + (i * cashColWidth), cashNoteY + 1);
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('CA', col2X + cashColWidth/2, cashNoteY, { align: 'center' });
      denominations.forEach((denom, i) => {
        const xPos = col2X + cashColWidth * (i + 1) + cashColWidth/2;
        doc.text(denom.toString(), xPos, cashNoteY, { align: 'center' });
      });
      cashNoteY += 3;
      
      doc.rect(col2X, cashNoteY - 3, cashColWidth * 10, 4);
      for (let i = 1; i < 10; i++) {
        doc.line(col2X + (i * cashColWidth), cashNoteY - 3, col2X + (i * cashColWidth), cashNoteY + 1);
      }
      
      doc.setFont('helvetica', 'normal');
      doc.text('RE', col2X + cashColWidth/2, cashNoteY, { align: 'center' });
      denominations.forEach((denom, i) => {
        const xPos = col2X + cashColWidth * (i + 1) + cashColWidth/2;
        doc.text((billData.denominations[denom]?.receive || '').toString(), xPos, cashNoteY, { align: 'center' });
      });
      cashNoteY += 3;
      
      doc.rect(col2X, cashNoteY - 3, cashColWidth * 10, 4);
      for (let i = 1; i < 10; i++) {
        doc.line(col2X + (i * cashColWidth), cashNoteY - 3, col2X + (i * cashColWidth), cashNoteY + 1);
      }
      
      doc.text('IS', col2X + cashColWidth/2, cashNoteY, { align: 'center' });
      denominations.forEach((denom, i) => {
        const xPos = col2X + cashColWidth * (i + 1) + cashColWidth/2;
        doc.text((billData.denominations[denom]?.issue || '').toString(), xPos, cashNoteY, { align: 'center' });
      });
    }
    
    y = Math.max(paymentY, cashNoteY) + 5;

    /* ---------- ROW 3: Amount Received, Balance, Net Amount ---------- */
    
    const row3Y = y;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Amt Received:', col1X - 4, row3Y);
    doc.text(formatCurrency(amountReceived), col1X + colWidth - 5, row3Y, { align: 'right' });
    
    doc.text('Balance:', col2X + 2, row3Y);
    doc.text(formatCurrency(balanceAmount), col2X + colWidth - 5, row3Y, { align: 'right' });
    
    doc.setFontSize(16);
    doc.text('Net Amt:', col3X + 2, row3Y);
    doc.text(formatCurrency(netAmount), col3X + colWidth - 5, row3Y, { align: 'right' });
    
    y = row3Y + 5;

    /* ---------- ROW 4: Footer (Terms, Bank, Rupees) ---------- */
    
    const row4Y = y;
    
    // Column 1: Terms and Conditions
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS AND CONDITIONS', col1X + 2, row4Y + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let termsY = row4Y + 8;
    
    doc.text('1. Without bill there is No Exchange', col1X + 2, termsY);
    termsY += 4;
    doc.text('   Available.', col1X + 2, termsY);
    termsY += 4;
    doc.text('2. The exchange will be done in the', col1X + 2, termsY);
    termsY += 4;
    doc.text('   afternoon from 2 PM to 5 PM.', col1X + 2, termsY);
    termsY += 4;
    doc.text('3. Goods can be exchanged within', col1X + 2, termsY);
    termsY += 4;
    doc.text('   2 days of purchase.', col1X + 2, termsY);
    termsY += 4;
    doc.text('4. NO RETURN ON SERVICE', col1X + 2, termsY);
    termsY += 4;
    doc.text('   PRODUCTS ***', col1X + 2, termsY);
    
    // Column 2: Bank Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('BANK DETAILS', col2X + 2, row4Y + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let bankY = row4Y + 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Account Name:', col2X + 2, bankY);
    bankY += 3;
    doc.setFont('helvetica', 'normal');
    doc.text('R. SANKARAPANDIAN STORES', col2X + 2, bankY);
    bankY += 4;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Account No:', col2X + 2, bankY);
    bankY += 3;
    doc.setFont('helvetica', 'normal');
    doc.text('743605000713', col2X + 2, bankY);
    bankY += 4;
    
    doc.setFont('helvetica', 'bold');
    doc.text('IFSC:', col2X + 2, bankY);
    bankY += 3;
    doc.setFont('helvetica', 'normal');
    doc.text('ICIC0007436', col2X + 2, bankY);
    bankY += 4;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Bank:', col2X + 2, bankY);
    bankY += 3;
    doc.setFont('helvetica', 'normal');
    doc.text('ICIC Bank', col2X + 2, bankY);
    
    // Column 3: Rupees in Words and Signature
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('AMOUNT IN WORDS', col3X + 2, row4Y + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let wordsY = row4Y + 8;
    
    const words = numberToWords(netAmount);
    const wordsLines = doc.splitTextToSize(words, colWidth - 4);
    doc.text(wordsLines, col3X + 2, wordsY);
    wordsY += wordsLines.length * 3 + 12;
    
    doc.setFont('helvetica', 'bold');
    doc.text('For R. SANKARAPANDIAN STORES', col3X + 2, wordsY);
    wordsY += 5;
    doc.text('Authorised Signatory', col3X + 2, wordsY);
    
    y = Math.max(termsY, bankY, wordsY) + 10;

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