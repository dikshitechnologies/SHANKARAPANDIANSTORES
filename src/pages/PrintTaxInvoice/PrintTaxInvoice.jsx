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

    const subTotal = items.reduce(
      (sum, i) => sum + Number(i.amount || (i.qty * i.rate) || 0),
      0
    );

    const netTotal = billData.netAmount || subTotal;
    const netAmount = netTotal - (billData.discount || 0) + (billData.servicechrgeAmt || 0);

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
    y += 10;

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
    y += 10;

    /* ---------- ITEMS TABLE (Updated with PrintPDF style) ---------- */

    // Table Header with blue background
    doc.setFillColor(27, 145, 218); // #1B91DA color from PrintPDF
    doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    const colWidths = [10, 85, 20, 20, 25, 30];
    const headers = ['S.No', 'Item Name', 'HSN', 'Qty', 'Rate', 'Amount'];
    
    let x = marginLeft;
    
    headers.forEach((h, i) => {
      if (h === 'Qty' || h === 'Rate' || h === 'Amount') {
        // Center align inside column
        doc.text(h, x + (colWidths[i] / 2), y + 4.5, { align: 'center' });
      } else {
        // Left align for other columns
        const offset = h === 'S.No' ? colWidths[i] / 2 : 2;
        const align = h === 'S.No' ? 'center' : 'left';
        doc.text(h, x + offset, y + 4.5, { align: align });
      }
      x += colWidths[i];
    });
    
    y += 9;
    doc.setTextColor(0, 0, 0); // Reset to black
    
    // Items Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    items.forEach((item, idx) => {
      // Calculate row height based on item name
      const nameLines = doc.splitTextToSize(item.itemName || 'N/A', colWidths[1] - 4);
      const rowHeight = Math.max(6, nameLines.length * 2.5); // 3.5 is line height, +2 for padding
      
      // Alternating row background (light blue for even rows)
      if (idx % 2 === 0) {
        doc.setFillColor(240, 248, 255); // Light blue from PrintPDF
        doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, rowHeight, 'F');
      }
      
      x = marginLeft;
      
      // S.No
      doc.text(String(idx + 1), x + (colWidths[0] / 2), y + rowHeight / 2, { align: 'center' });
      x += colWidths[0];
      
      // Item Name
      doc.text(nameLines, x + 2, y + 2, { maxWidth: colWidths[1] - 4 });
      x += colWidths[1];
      
      // HSN
      doc.text(item.hsn || '-', x + (colWidths[2] / 2), y + rowHeight / 2, { align: 'center' });
      x += colWidths[2];
      
      // Qty
      doc.text(formatCurrencyq(item.qty), x + (colWidths[3] / 2), y  + rowHeight / 2, { align: 'right' });
      x += colWidths[3];
      
      // Rate
      doc.text(formatCurrency(item.rate), x + (colWidths[4] / 2), y + rowHeight / 2, { align: 'right' });
      x += colWidths[4];
      
      // Amount
      doc.text(formatCurrency(item.amount || (item.qty * item.rate)), 
               x + (colWidths[5] / 2)+4, y + rowHeight / 2, { align: 'right' });
      
      y += rowHeight;
    });
    
    y += 8;

    /* ---------- BANK DETAILS ---------- */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Bank Details:', marginLeft, y);
    doc.text('Grand Total:', pageWidth - 70, y);
    doc.text(formatCurrency(netTotal), pageWidth - marginRight, y, {
      align: 'right',
    });
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    // Account Name
    doc.setFont('helvetica', 'bold');
    doc.text('Account Name: ', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text('R. SANKARAPANDIAN', marginLeft + 28, y);
    y += 4;
    doc.text('STORES', marginLeft + 28, y);
    doc.text('Discount:', pageWidth - 70, y);
    doc.text(billData.discount || '0', pageWidth - marginRight, y, {
      align: 'right',
    });
    y += 4;
    // Account Number
    doc.setFont('helvetica', 'bold');
    doc.text('Account Number: ', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text('743605000713', marginLeft + 28, y);
    y += 4;

    // IFSC
    doc.setFont('helvetica', 'bold');
    doc.text('IFSC: ', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text('ICIC0007436', marginLeft + 28, y);
    doc.text('Charges:', pageWidth - 70, y);
    doc.text(formatCurrency(billData.servicechrgeAmt), pageWidth - marginRight, y, {
      align: 'right',
    });
    y += 4;

    // Account Type
    doc.setFont('helvetica', 'bold');
    doc.text('Account Type: ', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Current', marginLeft + 28, y);
    y += 4;

    // Bank
    doc.setFont('helvetica', 'bold');
    doc.text('Bank: ', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text('ICIC Bank', marginLeft + 28, y);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Amount:', pageWidth - 70, y);
    doc.text(formatCurrency(netAmount), pageWidth - marginRight, y, {
      align: 'right',
    });
    y += 20;

    /* ---------- QR CODE ---------- */

    const qr = await QRCode.toDataURL(billData.voucherNo || 'N/A');
    doc.addImage(qr, 'PNG', marginLeft, y - 10, 25, 25);

    /* ---------- FOOTER ---------- */

    y = pageHeight - 30;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('For R. SANKARAPANDIAN STORES', pageWidth - 80, y);
    doc.text('Authorised Signatory', pageWidth - 70, y + 12);

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