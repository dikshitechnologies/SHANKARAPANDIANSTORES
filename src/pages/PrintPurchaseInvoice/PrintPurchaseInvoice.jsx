import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../../assets/logo1.jpeg';

const Icon = {
  Search: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  ),
  Truck: ({ size = 16, onClick, style, ...props }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      height={`${size}px`} 
      viewBox="0 -960 960 960" 
      width={`${size}px`} 
      fill="#1B91DA"
      onClick={onClick}
      style={{ cursor: 'pointer', ...style }}
      {...props}
    >
      <path d="M240-200q-50 0-85-35t-35-85H40v-360q0-33 23.5-56.5T120-760h560l240 240v200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H360q0 50-35 85t-85 35Zm360-360h160L640-680h-40v120Zm-240 0h160v-120H360v120Zm-240 0h160v-120H120v120Zm120 290q21 0 35.5-14.5T290-320q0-21-14.5-35.5T240-370q-21 0-35.5 14.5T190-320q0 21 14.5 35.5T240-270Zm480 0q21 0 35.5-14.5T770-320q0-21-14.5-35.5T720-370q-21 0-35.5 14.5T670-320q0 21 14.5 35.5T720-270ZM120-400h32q17-18 39-29t49-11q27 0 49 11t39 29h304q17-18 39-29t49-11q27 0 49 11t39 29h32v-80H120v80Zm720-80H120h720Z"/>
    </svg>
  ),
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  if (isNaN(num)) return '0.00';
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

// PDF generation function
export const generatePurchaseInvoicePDF = async ({
  invoiceData,
  items,
  totals,
  transportData,
  chargesAmount,
  addLessAmount,
  freightAmount,
  userData
}) => {
  try {
    // Filter valid items (with name)
    const validItems = items.filter(item => item.name && item.name.trim() !== '');
    
    if (validItems.length === 0) {
      // throw new Error('No items to print');
    }
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Define margins for landscape
    const marginLeft = 10;
    const marginRight = 10;
    const pageWidth = 297; // A4 landscape width in mm
    let yPos = 10;
    const labelWidth = 28;   // keeps ":" aligned
    const valueGap = 2;
    
    // ================= HEADER =================


// ---- LOGO ----
const imgProps = doc.getImageProperties(logo);
const imgWidth = 25;
const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
// ---- LEFT COLUMN WIDTH ----
const leftColumnWidth = imgWidth + 60;

// ---- LOGO (centered in left block) ----
const logoX = (leftColumnWidth - imgWidth) / 2;

doc.addImage(
  logo,
  'JPEG',
  logoX,
  yPos,
  imgWidth,
  imgHeight
);

// ---- STORE NAME (ONE LINE UNDER LOGO) ----
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);

const storeNameY = yPos + imgHeight + 7;

doc.text(
  'R Sankarapandian Stores',
   leftColumnWidth / 2,
  storeNameY,
  { align: 'center' }
);




// ---- RIGHT SIDE X POSITIONS ----
const leftX = marginLeft + imgWidth + 45;
const midX = leftX + 65;
const transX = midX + 70;

// ---- SECTION TITLES ----
doc.setFontSize(10);
doc.setFont('helvetica', 'bold');

const titleY = yPos + 5;

doc.text('BILL DETAILS', leftX, titleY);
doc.text('SUPPLIER DETAILS', midX, titleY);
doc.text('TRANSPORT DETAILS', transX, titleY);

// ---- CONTENT START (BELOW LOGO + COMPANY INFO) ----
doc.setFontSize(9);
doc.setFont('helvetica', 'normal');

// IMPORTANT: content starts after company info
let contentY = titleY + 6;


/* -------- BILL DETAILS -------- */
doc.text('Invoice No', leftX, contentY);
doc.text(':', leftX + labelWidth, contentY);
doc.text(invoiceData.invNo || '', leftX + labelWidth + valueGap, contentY);

doc.text('Date', leftX, contentY + 5);
doc.text(':', leftX + labelWidth, contentY + 5);
doc.text(formatDate(invoiceData.billDate), leftX + labelWidth + valueGap, contentY + 5);

doc.text('Bill No', leftX, contentY + 10);
doc.text(':', leftX + labelWidth, contentY + 10);
doc.text(invoiceData.purNo || '', leftX + labelWidth + valueGap, contentY + 10);

doc.text('Bill Date', leftX, contentY + 15);
doc.text(':', leftX + labelWidth, contentY + 15);
doc.text(formatDate(invoiceData.purDate), leftX + labelWidth + valueGap, contentY + 15);

doc.text('GST Type', leftX, contentY + 20);
doc.text(':', leftX + labelWidth, contentY + 20);
doc.text(
  invoiceData.gstType === 'I' ? 'IGST' : 'CGST/SGST',
  leftX + labelWidth + valueGap,
  contentY + 20
);

/* -------- SUPPLIER DETAILS -------- */
doc.text('Supplier Name', midX, contentY);
doc.text(':', midX + labelWidth, contentY);
doc.text(invoiceData.customerName || '', midX + labelWidth + valueGap, contentY);

doc.text('GSTIN', midX, contentY + 5);
doc.text(':', midX + labelWidth, contentY + 5);
doc.text(invoiceData.gstno || '', midX + labelWidth + valueGap, contentY + 5);

doc.text('Mobile', midX, contentY + 10);
doc.text(':', midX + labelWidth, contentY + 10);
doc.text(invoiceData.mobileNo || '', midX + labelWidth + valueGap, contentY + 10);

doc.text('City', midX, contentY + 15);
doc.text(':', midX + labelWidth, contentY + 15);
doc.text(invoiceData.city || '', midX + labelWidth + valueGap, contentY + 15);

/* -------- TRANSPORT DETAILS -------- */
doc.text('Name', transX, contentY);
doc.text(':', transX + labelWidth, contentY);
doc.text(transportData?.transportName || '', transX + labelWidth + valueGap, contentY);

doc.text('LR No', transX, contentY + 5);
doc.text(':', transX + labelWidth, contentY + 5);
doc.text(transportData?.lrNo || '', transX + labelWidth + valueGap, contentY + 5);

doc.text('LR Date', transX, contentY + 10);
doc.text(':', transX + labelWidth, contentY + 10);
doc.text(formatDate(transportData?.lrDate), transX + labelWidth + valueGap, contentY + 10);

doc.text('Amount', transX, contentY + 15);
doc.text(':', transX + labelWidth, contentY + 15);

// ✅ Plain text, no alignment tricks
doc.text(
  `Rs. ${Number(transportData?.amount || 0).toFixed(2)}`,
  transX + labelWidth + valueGap,
  contentY + 15
);





// ---- MOVE yPos FOR TABLE ----
yPos = contentY + 28;

// ===== INVOICE TITLE (ABOVE TABLE) =====
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);

const invoiceTitleY = yPos + 8;

// Center text on page
doc.text(
  'PURCHASE INVOICE',
  pageWidth / 2,
  invoiceTitleY,
  { align: 'center' }
);


// Move yPos below title
yPos = invoiceTitleY + 8;

    // Items Table Header
    doc.setFillColor(27, 145, 218); // #1B91DA color
    doc.rect(marginLeft, yPos, pageWidth - marginLeft - marginRight, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    // Table column widths for landscape (total 277mm)
    const colWidths = [10, 25, 60, 15, 15, 15, 15, 15, 15, 20, 20, 15, 15, 15];

    const headers = [
      'S.No', 'Barcode', 'Particulars', 'UOM', 'HSN',
      'Qty', 'OvrWt', 'PRate', 'Tax%', 'ACost',
      'Asrate', 'MRP', 'Wrate', 'Total'
    ];
    
    let xPos = marginLeft;
    headers.forEach((header, i) => {
      doc.text(header, xPos + (colWidths[i] / 2), yPos + 5, { align: 'center' });
      xPos += colWidths[i];
    });
    
    yPos += 8;
    doc.setTextColor(0, 0, 0); // Reset to black
    
    // Items Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    validItems.forEach((item, index) => {
      // Calculate rowHeight FIRST based on item name length
      const particularsLines = doc.splitTextToSize(
  (item.name || '').trim(),
  colWidths[2] - 6
);

      const rowHeight = Math.max(7, particularsLines.length * 4.5);
      
      // Add new page if running out of space
      if (yPos + rowHeight > 180) {
        doc.addPage();
        yPos = 10;
        
        // Draw table header on new page
        doc.setFillColor(27, 145, 218);
        doc.rect(marginLeft, yPos, pageWidth - marginLeft - marginRight, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        
        xPos = marginLeft;
        headers.forEach((header, i) => {
          doc.text(header, xPos + (colWidths[i] / 2), yPos + 5, { align: 'center' });
          xPos += colWidths[i];
        });
        
        yPos += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
      }
      
      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(240, 248, 255);
        doc.rect(marginLeft, yPos, pageWidth - marginLeft - marginRight, rowHeight, 'F');
      }
      
      xPos = marginLeft;
      
      // S.No (col 0)
      doc.text(`${index + 1}`, xPos + (colWidths[0] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[0];
      
      // Barcode (col 1)
      doc.text(item.barcode || '-', xPos + (colWidths[1] / 2), yPos + rowHeight / 2, { 
        align: 'center',
        maxWidth: colWidths[1] - 4 
      });
      xPos += colWidths[1];
      
      // Particulars (Item Name) - col 2
      // Particulars (Item Name) - col 2 (with top gap)
      const particularsTopPadding = 1;

      doc.text(
        particularsLines,
        xPos + 3,                     // left padding
        yPos + particularsTopPadding + 4,
        {
          maxWidth: colWidths[2] - 6,  // wrap inside column
          align: 'left'
        }
      );

      xPos += colWidths[2];
      
      // UOM (col 3)
      doc.text(item.uom || '', xPos + (colWidths[3] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[3];
      
      // HSN (col 4)
      doc.text(item.hsn || '', xPos + (colWidths[4] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[4];
      
      // Qty (col 5)
      doc.text(formatCurrency(item.qty || 0), xPos + (colWidths[5] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[5];
      
      // OvrWt (col 6)
      doc.text(formatCurrency(item.ovrwt || 0), xPos + (colWidths[6] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[6];
      
      // PRate (col 7)
      doc.text(formatCurrency(item.prate || 0), xPos + (colWidths[7] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[7];
      
      // Tax% (col 8)
      doc.text(`${item.intax || 0}%`, xPos + (colWidths[8] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[8];
      
      // ACost (col 9)
      doc.text(formatCurrency(item.acost || 0), xPos + (colWidths[9] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[9];
      
      // asrate (col 10)
      doc.text(formatCurrency(item.asRate || 0), xPos + (colWidths[10] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[10];
      
      // MRP (col 11)
      doc.text(formatCurrency(item.mrp || 0), xPos + (colWidths[11] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[11];
      
      // wrate (col 12)
      doc.text(formatCurrency(item.wsRate || 0), xPos + (colWidths[12] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[12];
      
      // Total (col 13)
      doc.text(formatCurrency(item.amt || 0), xPos + (colWidths[13] / 2), yPos + rowHeight / 2, { align: 'center' });
      
      yPos += rowHeight;
    });
    
    // Totals Section on right side
    yPos += 10;
    const totalsRightX = pageWidth - marginRight;
    const totalsLabelX = totalsRightX - 55;
    
    // ========== GROUP SUMMARY TABLE (LEFT SIDE) ==========
    const summaryStartX = marginLeft;
    const summaryStartY = yPos;
    
    // Group items by parentName
    const groupSummary = {};
    validItems.forEach(item => {
      const groupName = item.parentName || 'Others';
      if (!groupSummary[groupName]) {
        groupSummary[groupName] = {
          overwt: 0,
          qty: 0,
          totalAmt: 0
        };
      }
      groupSummary[groupName].overwt += parseFloat(item.ovrwt || 0);
      groupSummary[groupName].qty += parseFloat(item.qty || 0);
      groupSummary[groupName].totalAmt += parseFloat(item.amt || 0);
    });
    
    // Draw summary table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    // Table header
    const sumColWidths = [50, 20, 15, 25]; // GroupName, OverWt, Qty, TotalAmt
    const sumTableWidth = sumColWidths.reduce((a, b) => a + b, 0);
    
    doc.setFillColor(27, 145, 218);
    doc.rect(summaryStartX, summaryStartY, sumTableWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    
    let sumX = summaryStartX;
    doc.text('Group Name', sumX + 2, summaryStartY + 4.5, { align: 'left' });
    sumX += sumColWidths[0];
    doc.text('OverWt', sumX + (sumColWidths[1] / 2), summaryStartY + 4.5, { align: 'center' });
    sumX += sumColWidths[1];
    doc.text('Qty', sumX + (sumColWidths[2] / 2), summaryStartY + 4.5, { align: 'center' });
    sumX += sumColWidths[2];
    doc.text('Total Amt', sumX + (sumColWidths[3] / 2), summaryStartY + 4.5, { align: 'center' });
    
    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    let sumY = summaryStartY + 7;
    let rowIndex = 0;
    
    Object.entries(groupSummary).forEach(([groupName, data]) => {
      // Alternating row background
      if (rowIndex % 2 === 0) {
        doc.setFillColor(240, 248, 255);
        doc.rect(summaryStartX, sumY, sumTableWidth, 6, 'F');
      }
      
      sumX = summaryStartX;
      
      // Group Name (truncate if too long)
      const displayName = doc.splitTextToSize(groupName, sumColWidths[0] - 4);
      doc.text(displayName[0], sumX + 2, sumY + 4, { align: 'left', maxWidth: sumColWidths[0] - 4 });
      sumX += sumColWidths[0];
      
      // OverWt
      doc.text(formatCurrency(data.overwt), sumX + (sumColWidths[1] / 2), sumY + 4, { align: 'center' });
      sumX += sumColWidths[1];
      
      // Qty
      doc.text(formatCurrency(data.qty), sumX + (sumColWidths[2] / 2), sumY + 4, { align: 'center' });
      sumX += sumColWidths[2];
      
      // Total Amt
      doc.text(formatCurrency(data.totalAmt), sumX + (sumColWidths[3] / 2), sumY + 4, { align: 'center' });
      
      sumY += 6;
      rowIndex++;
    });
    
    // Draw table border
    doc.setDrawColor(200, 200, 200);
    doc.rect(summaryStartX, summaryStartY, sumTableWidth, sumY - summaryStartY);
    
    // ========== TOTALS TABLE (RIGHT SIDE) ==========
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    
    // Calculate items total and net total
    const itemsTotal = totals.net || 0;
    const freight = parseFloat(freightAmount) || 0;
    const transport = parseFloat(transportData?.amount) || 0;
    const addLess = parseFloat(addLessAmount) || 0;
    const netTotal = itemsTotal + freight + transport + addLess;
    
    // Totals list (right-aligned)
    const totalsRows = [
      { label: 'TOTAL', value: formatCurrency(itemsTotal), bold: false }
    ];

    if (addLessAmount && parseFloat(addLessAmount) !== 0) {
      const label = parseFloat(addLessAmount) > 0 ? 'Add' : 'Less';
      totalsRows.push({
        label,
        value: formatCurrency(Math.abs(parseFloat(addLessAmount))),
        bold: false
      });
    }

    if (freightAmount && parseFloat(freightAmount) !== 0) {
      totalsRows.push({ label: 'Freight', value: formatCurrency(freightAmount), bold: false });
    }

    if (transportData?.amount && parseFloat(transportData.amount) !== 0) {
      totalsRows.push({ label: 'Transport', value: formatCurrency(transportData.amount), bold: false });
    }

    totalsRows.push({ label: 'NET TOTAL', value: formatCurrency(netTotal), bold: true });

    const tableRowHeight = 7;
    const tableHeight = totalsRows.length * tableRowHeight;

    totalsRows.forEach((row, idx) => {
      const rowY = (yPos - 4) + (idx * tableRowHeight);

      doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
      doc.setFontSize(row.bold ? 11 : 10);
      doc.text(`${row.label}:`, totalsLabelX, rowY + 4.8, { align: 'left' });
      doc.text(`${row.value}`, totalsRightX, rowY + 4.8, { align: 'right' });
    });

    // Advance yPos for any following content (use max of both tables)
    const summaryTableEndY = sumY;
    const totalsTableEndY = yPos - 4 + tableHeight + 4;
    yPos = Math.max(summaryTableEndY, totalsTableEndY) + 4;
    
    // Footer with authorized signatory at bottom-right
    const pageHeight = doc.internal.pageSize.getHeight();
const footerBaseY = pageHeight - 18;

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);

// right-side alignment base
const footerCenterX = pageWidth - marginRight - 20;

// FIRST LINE
doc.text(
  'For SANKARAPANDIAN STORES',
  footerCenterX,
  footerBaseY,
  { align: 'center' }
);

// SECOND LINE (below it)
doc.text(
  'Authorized Signatory',
  footerCenterX,
  footerBaseY + 12,
  { align: 'center' }
);

   
    
    
    // Generate PDF as blob and open in new window
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Open in new window and print
    const printWindow = window.open(pdfUrl, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Clean up the URL object after print
          URL.revokeObjectURL(pdfUrl);
        }, 300);
      };
    }
    
    return 'PDF opened for printing';
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// PrintPDF Modal Component
const PrintPDF = ({ 
  isOpen, 
  onClose, 
  invoiceData, 
  items, 
  totals, 
  transportData,
  chargesAmount,
  addLessAmount,
  freightAmount,
  userData
}) => {
  React.useEffect(() => {
    if (isOpen) {
      // Auto-generate and print PDF when component opens
      const generateAndPrint = async () => {
        try {
          await generatePurchaseInvoicePDF({
            invoiceData,
            items,
            totals,
            transportData,
            chargesAmount,
            addLessAmount,
            freightAmount,
            userData
          });
          // Close the modal after PDF generation
          setTimeout(() => {
            onClose();
          }, 1000);
        } catch (error) {
          console.error('Error generating PDF:', error);
          alert(error.message || 'Failed to generate PDF. Please try again.');
          onClose();
        }
      };
      
      generateAndPrint();
    }
  }, [isOpen, invoiceData, items, totals, transportData, chargesAmount, addLessAmount, freightAmount, userData, onClose]);

  // Return null - no modal UI needed, PDF generates automatically
  return null;
};

export default PrintPDF;

// Add CSS for spinner animation
const printStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Function to inject styles
const injectPrintStyles = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = printStyles;
    document.head.appendChild(style);
  }
};

// Call this function when needed
injectPrintStyles();