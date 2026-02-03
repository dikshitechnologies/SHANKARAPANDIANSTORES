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
      throw new Error('No items to print');
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
    // const marginTop = 10;
    
    
      // Add Logo
      const imgProps = doc.getImageProperties(logo);
      const imgWidth = 30; // desired width in mm
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      doc.addImage(logo, 'JPEG', marginLeft, yPos, imgWidth, imgHeight,{align: 'center'});
    //   yPos += imgHeight + 5;

    // Company Header - Centered
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SANKARAPANDIAN STORE', pageWidth / 2, yPos, { align: 'center' });
    //page name
    yPos += 8;
    doc.setFontSize(14);
    doc.text('PURCHASE INVOICE', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    
    // Create two columns layout
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Left Column: Invoice Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const leftX = marginLeft;
    const midX = pageWidth / 2 - 35;
    const transX = pageWidth - marginRight - 70;
    
    // -------- SECTION TITLES --------
    doc.setFont('helvetica', 'bold');
    doc.text('BILL DETAILS', leftX, yPos - 5);
    doc.text('SUPPLIER DETAILS', midX, yPos - 5);
    doc.text('TRANSPORT DETAILS', transX, yPos - 5);
    doc.setFont('helvetica', 'normal');

    /* ---------------- LEFT (INVOICE) ---------------- */
    doc.text('Invoice No', leftX, yPos);
    doc.text(':', leftX + labelWidth, yPos);
    doc.text(invoiceData.invNo || '', leftX + labelWidth + valueGap, yPos);

    doc.text('Date', leftX, yPos + 5);
    doc.text(':', leftX + labelWidth, yPos + 5);
    doc.text(formatDate(invoiceData.billDate), leftX + labelWidth + valueGap, yPos + 5);

    doc.text('Bill No', leftX, yPos + 10);
    doc.text(':', leftX + labelWidth, yPos + 10);
    doc.text(invoiceData.purNo || '', leftX + labelWidth + valueGap, yPos + 10);

    doc.text('Bill Date', leftX, yPos + 15);
    doc.text(':', leftX + labelWidth, yPos + 15);
    doc.text(formatDate(invoiceData.purDate), leftX + labelWidth + valueGap, yPos + 15);

    doc.text('GST Type', leftX, yPos + 20);
    doc.text(':', leftX + labelWidth, yPos + 20);
    doc.text(
      invoiceData.gstType === 'I' ? 'IGST' : 'CGST/SGST',
      leftX + labelWidth + valueGap,
      yPos + 20
    );

    /* ---------------- MIDDLE (SUPPLIER) ---------------- */
    doc.text('Supplier Name', midX, yPos);
    doc.text(':', midX + labelWidth, yPos);
    doc.text(invoiceData.customerName || '', midX + labelWidth + valueGap, yPos);

    doc.text('GSTIN', midX, yPos + 5);
    doc.text(':', midX + labelWidth, yPos + 5);
    doc.text(invoiceData.gstno || '', midX + labelWidth + valueGap, yPos + 5);

    doc.text('Mobile', midX, yPos + 10);
    doc.text(':', midX + labelWidth, yPos + 10);
    doc.text(invoiceData.mobileNo || '', midX + labelWidth + valueGap, yPos + 10);

    doc.text('City', midX, yPos + 15);
    doc.text(':', midX + labelWidth, yPos + 15);
    doc.text(invoiceData.city || '', midX + labelWidth + valueGap, yPos + 15);

    /* ---------------- RIGHT (TRANSPORT) ---------------- */
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSPORT DETAILS', transX, yPos - 5);
    doc.setFont('helvetica', 'normal');

    doc.text('Name', transX, yPos);
    doc.text(':', transX + labelWidth, yPos);
    doc.text(transportData?.transportName || '', transX + labelWidth + valueGap, yPos);

    doc.text('LR No', transX, yPos + 5);
    doc.text(':', transX + labelWidth, yPos + 5);
    doc.text(transportData?.lrNo || '', transX + labelWidth + valueGap, yPos + 5);

    doc.text('LR Date', transX, yPos + 10);
    doc.text(':', transX + labelWidth, yPos + 10);
    doc.text(formatDate(transportData?.lrDate), transX + labelWidth + valueGap, yPos + 10);

    doc.text('Amount', transX, yPos + 15);
    doc.text(':', transX + labelWidth, yPos + 15);
    doc.text(
      `₹${formatCurrency(transportData?.amount || 0)}`,
      transX + labelWidth + valueGap,
      yPos + 15
    );

    yPos += 25;

    // Items Table Header
    doc.setFillColor(27, 145, 218); // #1B91DA color
    doc.rect(marginLeft, yPos, pageWidth - marginLeft - marginRight, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    // Table column widths for landscape (total 277mm)
    const colWidths = [10, 25, 55, 15, 15, 15, 15, 15, 15, 15, 20, 20, 15, 15, 15];

    const headers = [
      'S.No', 'Barcode', 'Particulars', 'UOM', 'Stock', 'HSN',
      'Qty', 'OvrWt', 'PRate', 'Tax%', 'ACost',
      'SRate', 'MRP', 'NTCost', 'Total'
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
      const particularsLines = doc.splitTextToSize(item.name || '', colWidths[2] - 4);
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
      doc.text(
        particularsLines,
        xPos + colWidths[2] / 2,
        yPos + rowHeight / 2 - (particularsLines.length - 1) * 2.25,
        { align: 'center' }
      );
      xPos += colWidths[2];
      
      // UOM (col 3)
      doc.text(item.uom || '', xPos + (colWidths[3] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[3];
      
      // Stock (col 4)
      doc.text(formatCurrency(item.stock || 0), xPos + (colWidths[4] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[4];
      
      // HSN (col 5)
      doc.text(item.hsn || '', xPos + (colWidths[5] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[5];
      
      // Qty (col 6)
      doc.text(formatCurrency(item.qty || 0), xPos + (colWidths[6] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[6];
      
      // OvrWt (col 7)
      doc.text(formatCurrency(item.ovrwt || 0), xPos + (colWidths[7] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[7];
      
      // PRate (col 8)
      doc.text(formatCurrency(item.prate || 0), xPos + (colWidths[8] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[8];
      
      // Tax% (col 9)
      doc.text(`${item.intax || 0}%`, xPos + (colWidths[9] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[9];
      
      // ACost (col 10)
      doc.text(formatCurrency(item.acost || 0), xPos + (colWidths[10] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[10];
      
      // SRate (col 11)
      doc.text(formatCurrency(item.sRate || 0), xPos + (colWidths[11] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[11];
      
      // MRP (col 12)
      doc.text(formatCurrency(item.mrp || 0), xPos + (colWidths[12] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[12];
      
      // NTCost (col 13)
      doc.text(formatCurrency(item.ntCost || 0), xPos + (colWidths[13] / 2), yPos + rowHeight / 2, { align: 'center' });
      xPos += colWidths[13];
      
      // Total (col 14)
      doc.text(formatCurrency(item.amt || 0), xPos + (colWidths[14] / 2), yPos + rowHeight / 2, { align: 'center' });
      
      yPos += rowHeight;
    });
    
    // Totals Section on right side
    yPos += 10;
    const totalsRightX = pageWidth - marginRight;
    const totalsLabelX = totalsRightX - 55;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    
    // Calculate totals
    const subTotal = totals.subTotal;
    const gstAmount = totals.gstTotals;
    
    // Totals list (right-aligned)
    const totalsRows = [
      { label: 'Sub Total', value: formatCurrency(subTotal), bold: false },
      { label: 'GST Amount', value: formatCurrency(gstAmount), bold: false }
    ];

    if (freightAmount && parseFloat(freightAmount) !== 0) {
      totalsRows.push({ label: 'Freight', value: formatCurrency(freightAmount), bold: false });
    }

    if (transportData?.amount && parseFloat(transportData.amount) !== 0) {
      totalsRows.push({ label: 'Transport', value: formatCurrency(transportData.amount), bold: false });
    }

    if (addLessAmount && parseFloat(addLessAmount) !== 0) {
      const label = parseFloat(addLessAmount) > 0 ? 'Add' : 'Less';
      totalsRows.push({
        label,
        value: formatCurrency(Math.abs(parseFloat(addLessAmount))),
        bold: false
      });
    }

    totalsRows.push({ label: 'NET TOTAL', value: formatCurrency(totals.net), bold: true });

    const tableRowHeight = 7;
    const tableHeight = totalsRows.length * tableRowHeight;

    totalsRows.forEach((row, idx) => {
      const rowY = (yPos - 4) + (idx * tableRowHeight);

      doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
      doc.setFontSize(row.bold ? 11 : 10);
      doc.text(`${row.label}:`, totalsLabelX, rowY + 4.8, { align: 'left' });
      doc.text(`${row.value}`, totalsRightX, rowY + 4.8, { align: 'right' });
    });

    // Advance yPos for any following content
    yPos = yPos - 4 + tableHeight + 4;
    
    // Footer with authorized signatory at bottom-right
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerBaseY = pageHeight - 18;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    // Authorized Signatory (bottom-right)
    const authX = pageWidth - marginRight - 30;
    doc.text('Authorized Signatory:', authX, footerBaseY);
    doc.text('___________________', authX, footerBaseY + 5);
    doc.text('For SANKARAPANDIAN STORE', authX + 10, footerBaseY + 10, { align: 'center' });
    
    // Save PDF
    const fileName = `Purchase_Invoice_${invoiceData.invNo || 'DRAFT'}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
    
    return fileName;
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
  const [loading, setLoading] = useState(false);
  
  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
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
      
      // Show success message
      alert('PDF generated successfully!');
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(error.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px',
        }}>
          <h3 style={{
            margin: 0,
            color: '#1B91DA',
            fontSize: '18px',
            fontWeight: '600',
          }}>
            Generate Purchase Invoice PDF (Landscape)
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              padding: '5px',
              borderRadius: '4px',
            }}
            aria-label="Close"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f0f8ff', 
            borderRadius: '5px',
            marginBottom: '15px'
          }}>
            <p style={{ margin: '0 0 5px 0', color: '#333' }}>
              <strong>Invoice No:</strong> {invoiceData.invNo || 'DRAFT'}
            </p>
            <p style={{ margin: '0 0 5px 0', color: '#333' }}>
              <strong>Supplier:</strong> {invoiceData.customerName || 'N/A'}
            </p>
            <p style={{ margin: '0 0 5px 0', color: '#333' }}>
              <strong>Date:</strong> {formatDate(invoiceData.billDate)}
            </p>
            <p style={{ margin: '0 0 5px 0', color: '#333' }}>
              <strong>Total Items:</strong> {items.filter(item => item.name).length}
            </p>
            <p style={{ margin: '0 0 5px 0', color: '#333', fontWeight: 'bold' }}>
              <strong>Net Total:</strong> ₹{formatCurrency(totals.net)}
            </p>
          </div>
          
          <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
            PDF will be generated in LANDSCAPE orientation (A4) with the exact alignment shown in your example.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              minWidth: '80px',
            }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleGeneratePDF}
            style={{
              padding: '8px 20px',
              backgroundColor: '#1B91DA',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              minWidth: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span>Generating...</span>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </>
            ) : (
              'Generate PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  );
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