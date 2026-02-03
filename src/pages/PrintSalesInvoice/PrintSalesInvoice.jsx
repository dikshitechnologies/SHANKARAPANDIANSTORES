import React from 'react';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import logo from '../../assets/logo1.jpeg';
import QRCode from 'qrcode';

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
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
export const generateSalesReturnPDF = async ({
  billDetails,
  items,
  totals,
  userData,
  companyDetails
}) => {
  console.log("PRINT DATA:", {
    billDetails,
    items,
    totals,
    userData
  });

  try {
    // Filter valid items - support both itemName (SalesReturn) and name (PurchaseReturn)
    // Also check for itemcode as fallback
    const validItems = items.filter(item => {
      const itemName = item.itemName || item.name || item.itemcode;
      // Valid if it has a name or itemcode
      return itemName && itemName.toString().trim() !== '';
    });
    
    console.log('Items received:', items);
    console.log('Valid items filtered:', validItems);
    
    if (validItems.length === 0) {
      console.error('No valid items found. Items data:', JSON.stringify(items, null, 2));
      throw new Error('No items to print. Please add items to the invoice before printing.');
    }
        const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // A4 dimensions: 210mm x 297mm
    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 5;
    const marginRight = 5;
    const marginTop = 8;
    let yPos = marginTop;
    
    // ========== TOP RIGHT LOGO ==========
    const imgProps = doc.getImageProperties(logo);
    const imgWidth = 25;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    doc.addImage(logo, 'JPEG', pageWidth - marginRight - imgWidth-(marginLeft+4), yPos, imgWidth, imgHeight);
    
    // ========== HEADER SECTION ==========
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SALES INVOICE', pageWidth / 2, yPos + 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
   
    
    yPos += 22;
    
    // ========== INVOICE DETAILS ==========
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DETAILS', marginLeft, yPos);
    yPos += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const detailsLabelWidth = 35;
    const detailsValueX = marginLeft + detailsLabelWidth;
    
    doc.text('Ref No:', marginLeft, yPos);
    doc.text(billDetails.voucherNo || billDetails.billNo || 'N/A', detailsValueX, yPos);
    yPos += 5;
    
    doc.text('Date:', marginLeft, yPos);
    doc.text(formatDate(billDetails.voucherDate || billDetails.billDate), detailsValueX, yPos);
    yPos += 7;    
   
    
    // ========== SELLER AND CUSTOMER DETAILS SIDE BY SIDE ==========
    const leftColumnX = marginLeft;
    const rightColumnX = pageWidth / 2 + 5;
    const startYPos = yPos;
    
    // LEFT COLUMN - SELLER DETAILS
    let leftYPos = startYPos;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED BY', leftColumnX, leftYPos);
    leftYPos += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const sellerLines = [
      'R. SANKARAPANDIAN STORES',
      '51/179 Hari Haran Bazaar Street,',
      'Ponneri, Tamil Nadu – 601204, India'
    ];
    
    sellerLines.forEach(line => {
      doc.text(line, leftColumnX, leftYPos);
      leftYPos += 4;
    });
    
    doc.setFontSize(8);
    doc.text('GSTIN: 33ECQPR7067N1ZL', leftColumnX, leftYPos);
    leftYPos += 4;
    doc.text('Email: rspvfstores@gmail.com', leftColumnX, leftYPos);
    leftYPos += 4;
    doc.text('Phone: +91 72007 79217', leftColumnX, leftYPos);
    leftYPos += 4;
    
    // RIGHT COLUMN - CUSTOMER DETAILS
    let rightYPos = startYPos;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO', rightColumnX, rightYPos);
    rightYPos += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    doc.text(billDetails.customerName || billDetails.custName || 'N/A', rightColumnX, rightYPos);
    rightYPos += 4;
    doc.text(`Phone: ${billDetails.mobileNo || 'N/A'}`, rightColumnX, rightYPos);
    rightYPos += 4;

    
    
    // Continue from the maximum Y position of both columns
    yPos = Math.max(leftYPos, rightYPos) + 4;
    
    // ========== ITEMS TABLE ==========
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM DETAILS', marginLeft, yPos);
    yPos += 6;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Table headers
    doc.setFillColor(27, 145, 218);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    
    const tableTop = yPos;
    const availableWidth = pageWidth - marginLeft - marginRight - 1; // Keep 1mm buffer on right
    const colWidths = [15, 95, 20, 25, 25, 20]; // Total: 209mm
    const headers = ['S.No', 'Item Name', 'HSN', 'Qty', 'Rate', 'Total'];
    
    // Draw header background rectangle
    const totalTableWidth = availableWidth;
    doc.rect(marginLeft, yPos, totalTableWidth, 5, 'F');
    
    let xPos = marginLeft;
    const headerAligns = ['left', 'left', 'left', 'right', 'right', 'right'];
    headers.forEach((header, i) => {
      const align = headerAligns[i];
      const textX = align === 'left' ? xPos + 2 : align === 'right' ? xPos + colWidths[i] - 2 : xPos + colWidths[i] / 2;
      doc.text(header, textX, yPos + 3, { align: align });
      xPos += colWidths[i];
    });
    
    yPos += 5;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    // Table rows
    validItems.forEach((item, index) => {
      const itemName = item.itemName || item.name || item.itemcode || '';
      const itemLines = doc.splitTextToSize(itemName, colWidths[1] - 4);
      const rowHeight = Math.max(6, itemLines.length * 3.5 + 1); // Added 1mm gap
      
      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(240, 248, 255);
        xPos = marginLeft;
        doc.rect(xPos, yPos, availableWidth, rowHeight, 'F');
      }
      
      xPos = marginLeft;
      
      // S.No
      doc.text(`${index + 1}`, xPos + 2, yPos + rowHeight / 2, { align: 'left' });
      xPos += colWidths[0];
      
      // Item Name
      doc.text(itemLines, xPos + 2, yPos + rowHeight / 2 - (itemLines.length - 1) * 1.75);
      xPos += colWidths[1];
      
      // HSN
      doc.text(item.hsn || '-', xPos + 2, yPos + rowHeight / 2, { align: 'left' });
      xPos += colWidths[2];
      
      // Qty
      doc.text(formatCurrency(item.qty || 0), xPos + colWidths[3] - 2, yPos + rowHeight / 2, { align: 'right' });
      xPos += colWidths[3];
      
      // Rate (support both sRate and prate)
      const rate = item.sRate || item.prate || 0;
      doc.text(formatCurrency(rate), xPos + colWidths[4] - 2, yPos + rowHeight / 2, { align: 'right' });
      xPos += colWidths[4];
      
      // Total (Qty × Rate) - support both sRate and prate, and amt field
      const itemTotal = item.amt || (parseFloat(item.qty || 0) * parseFloat(rate));
      doc.text(formatCurrency(itemTotal), xPos + colWidths[5] - 2, yPos + rowHeight / 2, { align: 'right' });
      
      yPos += rowHeight;
    });
    
    yPos += 5;
    
    // ========== TAX & AMOUNT SUMMARY ==========
    
    // Generate QR Code for Bill Number
    const qrCodeDataURL = await QRCode.toDataURL(billDetails.voucherNo || billDetails.billNo || 'N/A', {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Add QR Code on the left side
    const qrSize = 15; // 30mm x 30mm
    doc.addImage(qrCodeDataURL, 'PNG', marginLeft+10, yPos, qrSize, qrSize);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const summaryLabelX = pageWidth - marginRight - 65;
    const summaryValueX = pageWidth - marginRight - 2;
    
    // Calculate tax details
    const subTotal = parseFloat(totals.subTotal || 0);
    const totalTax = parseFloat(totals.gstTotals || 0);
    const cgstAmount = totalTax / 2; // Assuming CGST = SGST = Half of total
    const sgstAmount = totalTax / 2;
    const netTotal = parseFloat(totals.net || 0);
    
    doc.text('Amount:', summaryLabelX, yPos);
    doc.text(`${formatCurrency(subTotal)}`, summaryValueX, yPos, { align: 'right' });
    yPos += 5;
    
    doc.text('CGST:', summaryLabelX, yPos);
    doc.text(`${formatCurrency(cgstAmount)}`, summaryValueX, yPos, { align: 'right' });
    yPos += 5;
    
    doc.text('SGST:', summaryLabelX, yPos);
    doc.text(`${formatCurrency(sgstAmount)}`, summaryValueX, yPos, { align: 'right' });
    yPos += 5;
    
    yPos += 3; // Add gap before Grand Total
    
    // Grand Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Grand Total:', summaryLabelX, yPos);
    doc.text(`${formatCurrency(netTotal)}`, summaryValueX, yPos, { align: 'right' });
    
    yPos += 15;
    
    // ========== FOOTER ==========
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Position footer at bottom right
    const footerStartY = pageHeight - 30;
    const footerX = pageWidth - marginRight - 60;
    
    doc.text('For R. SANKARAPANDIAN STORES', footerX, footerStartY);
    
    // Add some space and then authorised signatory
    doc.setFontSize(8);
    doc.text('Authorised Signatory', footerX + 10, footerStartY + 15);
    
    // ========== PRINT FUNCTIONALITY ==========
    console.log('Generating PDF...');
    
    // Use autoPrint to trigger print dialog automatically
    doc.autoPrint();
    
    // Open PDF in new window using data URI (ensures single page)
    const pdfDataUri = doc.output('dataurlstring');
    
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(
        `<html>
          <head>
            <title>Sales Invoice - ${billDetails.voucherNo || billDetails.billNo || 'N/A'}</title>
            <style>
              body { margin: 0; }
              iframe { border: none; width: 100vw; height: 100vh; }
            </style>
          </head>
          <body>
            <iframe src="${pdfDataUri}" type="application/pdf"></iframe>
          </body>
        </html>`
      );
      printWindow.document.close();
      console.log('PDF opened successfully with autoPrint');
    } else {
      console.error('Failed to open print window - popup may be blocked');
      // alert('Could not open print window. Please allow popups for this site.');
    }
    
    return 'PDF opened for printing';
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// PrintPDF Component
const PrintPDF = ({ 
  isOpen, 
  onClose, 
  billDetails, 
  items, 
  totals, 
  userData,
  companyDetails
}) => {
  const printExecutedRef = React.useRef(false);

  React.useEffect(() => {
    if (isOpen && !printExecutedRef.current) {
      printExecutedRef.current = true;
      
      // Validate items before attempting to print
      const validItems = items.filter(item => {
        const itemName = item.itemName || item.name || item.itemcode;
        return itemName && itemName.toString().trim() !== '';
      });

      if (validItems.length === 0) {
        toast.warning('No items to print. Please add items to the invoice before printing.', {
          position: 'top-right',
          autoClose: 3000,
        });
        printExecutedRef.current = false;
        onClose();
        return;
      }

      const generateAndPrint = async () => {
        try {
          await generateSalesReturnPDF({
            billDetails,
            items,
            totals,
            userData,
            companyDetails
          });
          // Close after PDF generation
          setTimeout(() => {
            printExecutedRef.current = false;
            onClose();
          }, 1000);
        } catch (error) {
          console.error('Error generating PDF:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            billDetails,
            items,
            totals
          });
          toast.error(error.message || 'Failed to generate PDF. Please try again.', {
            position: 'top-right',
            autoClose: 3000,
          });
          printExecutedRef.current = false;
          onClose();
        }
      };
      
      generateAndPrint();
    }
    
    // Reset ref when modal closes
    if (!isOpen) {
      printExecutedRef.current = false;
    }
  }, [isOpen, billDetails, items, totals, userData, companyDetails, onClose]);

  return null;
};

export default PrintPDF;
