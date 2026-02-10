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

/* ================= PDF GENERATOR ================= */

export const generateTenderA4PDF = async ({ billData }) => {
  try {
    if (!billData || !billData.items || billData.items.length === 0) {
      throw new Error('No items to print');
    }

    /* ---------- NORMALIZE DATA ---------- */

    const items = billData.items;

    const subTotal = items.reduce(
      (sum, i) => sum + Number(i.amount || (i.qty * i.rate) || 0),
      0
    );

    const netTotal = billData.netAmount || subTotal;

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

    /* ---------- COMPANY ---------- */

    doc.setFontSize(11);
    doc.text('R. SANKARAPANDIAN STORES', marginLeft, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('51/179, Hariharan Bazaar Street', marginLeft, y);
    y += 4;
    doc.text('Ponneri - 601204', marginLeft, y);
    y += 4;
    doc.text('GSTIN: 33ECCPR7067N1ZL', marginLeft, y);

    /* ---------- INVOICE INFO ---------- */

    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(billData.voucherNo || 'N/A', marginLeft + 30, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', pageWidth - 70, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(billData.voucherDate), pageWidth - 45, y);

    y += 6;

    /* ---------- CUSTOMER ---------- */

    doc.setFont('helvetica', 'bold');
    doc.text('Customer:', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(billData.customerName || 'N/A', marginLeft + 30, y);

    y += 8;

    /* ---------- ITEMS TABLE ---------- */

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    const colWidths = [10, 85, 20, 20, 25, 30];
    const headers = ['S.No', 'Item Name', 'HSN', 'Qty', 'Rate', 'Amount'];

    let x = marginLeft;

    headers.forEach((h, i) => {
      doc.text(h, x + 1, y);
      x += colWidths[i];
    });

    y += 3;
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    items.forEach((item, idx) => {
      x = marginLeft;

      const amount = item.amount || (item.qty * item.rate);

      doc.text(String(idx + 1), x + 1, y);
      x += colWidths[0];

      const nameLines = doc.splitTextToSize(item.itemName || 'N/A', colWidths[1] - 2);
      doc.text(nameLines, x + 1, y);
      x += colWidths[1];

      doc.text(item.hsn || '-', x + 1, y);
      x += colWidths[2];

      doc.text(formatCurrency(item.qty), x + colWidths[3] - 2, y, { align: 'right' });
      x += colWidths[3];

      doc.text(formatCurrency(item.rate), x + colWidths[4] - 2, y, { align: 'right' });
      x += colWidths[4];

      doc.text(formatCurrency(amount), x + colWidths[5] - 2, y, { align: 'right' });

      y += Math.max(6, nameLines.length * 4);
    });

    y += 4;
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 8;

    /* ---------- TOTAL ---------- */

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);

    doc.text('Grand Total:', pageWidth - 70, y);
    doc.text(formatCurrency(netTotal), pageWidth - marginRight, y, {
      align: 'right',
    });

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
