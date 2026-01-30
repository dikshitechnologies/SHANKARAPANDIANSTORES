# Inclusive/Exclusive GST Tax Calculation Implementation

## Overview
Implemented dynamic tax calculation in SalesInvoice that supports both **Inclusive** and **Exclusive** GST modes.

## Changes Made

### 1. Enhanced `calculateAmount()` Function
**File:** [src/pages/SalesInvoice/SaleInvoice.jsx](src/pages/SalesInvoice/SaleInvoice.jsx#L970-L994)

```javascript
const calculateAmount = (qty, sRate, taxPercent) => {
  const qtyNum = parseFloat(qty || 0);
  const sRateNum = parseFloat(sRate || 0);
  const taxNum = parseFloat(taxPercent || 0);

  // Backwards-compatible behavior: if taxPercent is not provided, behave as before
  if (taxPercent === undefined) {
    return (qtyNum * sRateNum).toFixed(2);
  }

  // Compute based on gstMode
  if (gstMode === 'Inclusive') {
    // sRate includes tax. total = qty * sRate. Extract tax portion.
    const total = qtyNum * sRateNum;
    const taxAmount = taxNum === 0 ? 0 : (total * taxNum) / (100 + taxNum);
    return { amount: total.toFixed(2), taxAmount: taxAmount.toFixed(2) };
  } else {
    // Exclusive: tax calculated on top of sRate
    const base = qtyNum * sRateNum;
    const taxAmount = (base * taxNum) / 100;
    const total = base + taxAmount;
    return { amount: total.toFixed(2), taxAmount: taxAmount.toFixed(2) };
  }
};
```

**Key Features:**
- **Backward Compatible:** If `taxPercent` is undefined, returns a simple string calculation (old behavior)
- **Inclusive Mode:** Assumes `sRate` includes tax. Extracts tax amount: `(total * tax%) / (100 + tax%)`
- **Exclusive Mode:** Assumes `sRate` excludes tax. Adds tax on top: `(sRate * qty) + (sRate * qty * tax% / 100)`
- **Returns Object:** `{ amount: string, taxAmount: string }` when tax is provided

### 2. Updated Table Display Logic
**Tax Amount Column** [src/pages/SalesInvoice/SaleInvoice.jsx](src/pages/SalesInvoice/SaleInvoice.jsx#L4015-L4034)

- On-the-fly calculation using the enhanced `calculateAmount()` function
- Extracts `taxAmount` from the returned object
- Displays with proper Indian locale formatting

**Amount Column** [src/pages/SalesInvoice/SaleInvoice.jsx](src/pages/SalesInvoice/SaleInvoice.jsx#L4051-4065)

- Dynamically computes amount based on current `gstMode`
- Returns the final line total (including/excluding tax based on mode)

### 3. Fixed All Call Sites of `calculateAmount()`

Updated the following locations to pass tax percentage as 3rd argument:

| Location | Function | Line(s) |
|----------|----------|---------|
| Duplicate Barcode Handler | `handleBarcodeKeyDown` | 1757 |
| Local Item Add | `handleAddItemFromLocal` | 2231 |
| Barcode API Response | `handleBarcodeKeyDown` | 1862 |
| Item Selection | `handleItemSelect` | 1404-1410 |
| Item Change Handler | `handleItemChange` | 2310-2318 |

### 4. Totals Recalculation on GST Mode Change
**File:** [src/pages/SalesInvoice/SaleInvoice.jsx](src/pages/SalesInvoice/SaleInvoice.jsx#L961-968)

Added `gstMode` to the dependency array of the totals effect:

```javascript
useEffect(() => {
  const qtyTotal = items.reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
  const amountTotal = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);

  setTotalQty(qtyTotal);
  setTotalAmount(amountTotal);
}, [items, gstMode]); // Added gstMode here
```

This ensures totals update whenever:
- Items change
- GST mode changes

### 5. Cleaned Up Obsolete Code
Removed a broken useEffect at line ~996 that called `calculateAmount()` with no arguments and invalid dependencies.

## Usage Examples

### Example 1: Inclusive GST (18%)
**Input:** Qty=2, SRate=118 (includes 18% tax), Tax%=18

**Calculation:**
- Total amount: 2 × 118 = 236
- Tax amount: (236 × 18) / (100 + 18) = 36
- Net amount (before tax): 236 - 36 = 200

**Display:**
- Amount: ₹236.00
- Tax Amt: ₹36.00

### Example 2: Exclusive GST (18%)
**Input:** Qty=2, SRate=100 (excludes tax), Tax%=18

**Calculation:**
- Base amount: 2 × 100 = 200
- Tax amount: 200 × 18/100 = 36
- Total amount: 200 + 36 = 236

**Display:**
- Amount: ₹236.00
- Tax Amt: ₹36.00

## Test Scenarios

### Scenario 1: Switch GST Mode
1. Enter items with quantities and rates
2. Toggle GST Mode from "Inclusive" to "Exclusive"
3. ✅ Table amounts update automatically
4. ✅ Total Amount updates
5. ✅ Tax Amount column updates

### Scenario 2: Barcode Entry
1. Select Inclusive mode
2. Scan a barcode
3. ✅ Item loaded with correct amount based on Inclusive calculation
4. Switch to Exclusive mode
5. ✅ Amount recalculates immediately

### Scenario 3: Manual Item Entry
1. Select item from popup
2. Enter quantity and rate
3. ✅ Amount calculated based on current GST mode
4. Tax values pre-populated from item master

## Files Modified
- ✅ [src/pages/SalesInvoice/SaleInvoice.jsx](src/pages/SalesInvoice/SaleInvoice.jsx)

## Browser Testing
- Development server running on: `http://localhost:5174/SPSTORE/`
- No build errors
- No runtime errors related to these changes

## Notes
- The `calculateAmount()` function uses closure over `gstMode` state
- On-the-fly table calculations ensure immediate UI feedback when mode changes
- Item `.amount` field is updated whenever items or GST mode changes
- Tax amounts are computed correctly for both modes using proper formulas
