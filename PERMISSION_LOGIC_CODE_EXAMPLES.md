# Permission Logic Implementation - Code Examples

This document shows the exact code implementation for each modified page.

---

## 1. SalesInvoice - Complete Implementation

### Imports Section (Top of File):
```jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import PopupListSelector from '../../components/Listpopup/PopupListSelector';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_ENDPOINTS } from '../../api/endpoints';
import { axiosInstance } from '../../api/apiService';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
```

### Inside Component (After `const SaleInvoice = () => {`):
```jsx
const SaleInvoice = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.SALES_INVOICE),
    edit: hasModifyPermission(PERMISSION_CODES.SALES_INVOICE),
    delete: hasDeletePermission(PERMISSION_CODES.SALES_INVOICE)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // --- STATE MANAGEMENT ---
  // ... rest of state declarations
```

### Button Implementation (In JSX):
```jsx
<ActionButtons
  activeButton={activeTopAction}
  onButtonClick={(type) => {
    setActiveTopAction(type);
    if (type === 'add') ;
    if (type === 'edit') openEditInvoicePopup();
    if (type === 'delete') openDeleteInvoicePopup();
  }}
>
  <AddButton buttonType="add" disabled={!formPermissions.add} />
  <EditButton buttonType="edit" disabled={!formPermissions.edit} />
  <DeleteButton buttonType="delete" disabled={!formPermissions.delete} />
</ActionButtons>
```

---

## 2. SalesReturn - Complete Implementation

### Imports Section:
```jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ActionButtons, AddButton, EditButton, DeleteButton, ActionButtons1 } from '../../components/Buttons/ActionButtons';
import PopupListSelector from "../../components/Listpopup/PopupListSelector";
import { API_ENDPOINTS } from "../../api/endpoints";
import apiService from "../../api/apiService";
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
```

### Inside Component:
```jsx
const SalesReturn = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.SALES_RETURN),
    edit: hasModifyPermission(PERMISSION_CODES.SALES_RETURN),
    delete: hasDeletePermission(PERMISSION_CODES.SALES_RETURN)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  // --- STATE MANAGEMENT ---
  const [activeTopAction, setActiveTopAction] = useState('add');
  // ... rest of state
```

### Button Implementation:
```jsx
<ActionButtons
  activeButton={activeTopAction}
  onButtonClick={(type) => {
    setActiveTopAction(type);
    if (type === 'add') ;
    else if (type === 'edit') openEditPopup();
    else if (type === 'delete') openDeletePopup();
  }}
>
  <AddButton buttonType="add" disabled={!formPermissions.add} />
  <EditButton buttonType="edit" disabled={!formPermissions.edit} />
  <DeleteButton buttonType="delete" disabled={!formPermissions.delete} />
</ActionButtons>
```

---

## 3. ScrapRateFix - Complete Implementation

### Imports Section:
```jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import apiService from "../../api/apiService";
import { API_ENDPOINTS } from '../../api/endpoints';
import { toast } from "react-toastify";
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
```

### Inside Component:
```jsx
export default function ScrapRateFixing() {
  // --- PERMISSIONS ---
  const { hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    edit: hasModifyPermission(PERMISSION_CODES.SCRAP_RATE_FIX),
    delete: hasDeletePermission(PERMISSION_CODES.SCRAP_RATE_FIX)
  }), [hasModifyPermission, hasDeletePermission]);

  // State for scrap rates - initially empty
  const [scrapRates, setScrapRates] = useState([]);
  // ... rest of state
```

### Button Implementation (Update Button):
```jsx
<button
  id="updateRatesBtn"
  onClick={handleUpdateClick}
  disabled={loading || isFetching || scrapRates.length === 0 || !formPermissions.edit}
  style={{
    padding: isMobile ? '10px 20px' : '12px 24px',
    borderRadius: '50px',
    border: 'none',
    background: loading || isFetching || scrapRates.length === 0 || !formPermissions.edit ? 
      `linear-gradient(135deg, #cbd5e1, #e2e8f0)` :
      `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    color: '#ffffff',
    fontWeight: '600',
    fontSize: isMobile ? '14px' : '15px',
    cursor: loading || isFetching || scrapRates.length === 0 || !formPermissions.edit ? 'not-allowed' : 'pointer',
    opacity: loading || isFetching || scrapRates.length === 0 || !formPermissions.edit ? 0.6 : 1
  }}
  onMouseEnter={(e) => {
    if (!loading && !isFetching && scrapRates.length > 0 && formPermissions.edit) {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 6px 20px rgba(48, 122, 200, 0.35)';
    }
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 4px 12px rgba(48, 122, 200, 0.25)';
  }}
  title={!formPermissions.edit ? 'You do not have permission to modify' : ''}
>
  {loading ? (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <span style={{
        width: '14px',
        height: '14px',
        border: `2px solid rgba(255,255,255,0.3)`,
        borderTop: `2px solid #ffffff`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></span>
      Updating...
    </span>
  ) : 'Update Rates'}
</button>
```

### Button Implementation (Clear All Button):
```jsx
<button
  onClick={handleClearAll}
  disabled={loading || isFetching || scrapRates.length === 0 || !formPermissions.delete}
  style={{
    padding: isMobile ? '10px 20px' : '12px 24px',
    borderRadius: '50px',
    border: `1px solid ${loading || isFetching || scrapRates.length === 0 || !formPermissions.delete ? '#cbd5e1' : colors.border}`,
    background: '#ffffff',
    color: loading || isFetching || scrapRates.length === 0 || !formPermissions.delete ? '#cbd5e1' : colors.muted,
    cursor: loading || isFetching || scrapRates.length === 0 || !formPermissions.delete ? 'not-allowed' : 'pointer',
    opacity: loading || isFetching || scrapRates.length === 0 || !formPermissions.delete ? 0.6 : 1
  }}
  onMouseEnter={(e) => {
    if (!loading && !isFetching && scrapRates.length > 0 && formPermissions.delete) {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
      e.target.style.borderColor = colors.warning;
      e.target.style.color = colors.warning;
    }
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    e.target.style.borderColor = colors.border;
    e.target.style.color = colors.muted;
  }}
  title={!formPermissions.delete ? 'You do not have permission to delete' : ''}
>
  Clear All
</button>
```

---

## 4. Tender - Complete Implementation

### Imports Section:
```jsx
import React, { useState, useMemo } from 'react';
import styles from './Tender.module.css';
import { ActionButtons1 } from '../../components/Buttons/ActionButtons';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_CODES } from '../../constants/permissions';
```

### Inside Component:
```jsx
const Tender = () => {
  // --- PERMISSIONS ---
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const formPermissions = useMemo(() => ({
    add: hasAddPermission(PERMISSION_CODES.TENDER),
    edit: hasModifyPermission(PERMISSION_CODES.TENDER),
    delete: hasDeletePermission(PERMISSION_CODES.TENDER)
  }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);

  const [activeFooterAction, setActiveFooterAction] = useState('all');
  // ... rest of state
```

### Handler Functions with Permission Checks:

#### handleSave():
```jsx
const handleSave = () => {
  if (!formPermissions.edit) {
    alert('You do not have permission to save');
    return;
  }
  console.log('Saved:', { formData, denominations });
  alert('Saved successfully!');
};
```

#### handleDelete():
```jsx
const handleDelete = () => {
  if (!formPermissions.delete) {
    alert('You do not have permission to delete');
    return;
  }
  if (window.confirm('Are you sure you want to delete?')) {
    console.log('Deleted');
    alert('Deleted successfully!');
  }
};
```

#### handleClear():
```jsx
const handleClear = () => {
  if (!formPermissions.delete) {
    alert('You do not have permission to clear');
    return;
  }
  if (window.confirm('Are you sure you want to clear all data?')) {
    setFormData({
      grossAmt: '',
      itemDAmt: '',
      billAmount: '',
      // ... rest of fields
    });
    console.log('Cleared successfully!');
  }
};
```

### Footer Button Implementation:
```jsx
<div style={{
  display: "flex",
  justifyContent: "center",
  gap: "0",
  padding: "8px 16px",
  backgroundColor: "#ffffff",
  borderTop: "1px solid #e5e7eb",
  position: "fixed",
  bottom: "0",
  width: "100%",
  boxShadow: "0 -1px 3px rgba(0,0,0,0.08)",
  flexShrink: 0,
  zIndex: 100
}}>
  <ActionButtons1
    onClear={handleClear}
    onSave={handleSave}
    onPrint={handlePrint}
    activeButton={activeFooterAction}
    onButtonClick={(type) => setActiveFooterAction(type)}
  />
</div>
```

---

## Summary of Changes

| Page | Type | Changes Made | Key Elements |
|------|------|--------------|--------------|
| SalesInvoice | Transaction | Import + formPermissions + button disabled state | Add, Edit, Delete buttons |
| SalesReturn | Transaction | Import + formPermissions + button disabled state | Add, Edit, Delete buttons |
| ScrapRateFix | Master | Import + formPermissions + button disabled state + tooltips | Update, Clear All buttons |
| Tender | Transaction | Import + formPermissions + handler checks | Save, Delete, Clear handlers |

---

## Key Implementation Points

1. **Always import the hooks**:
   ```jsx
   import { usePermissions } from '../../hooks/usePermissions';
   import { PERMISSION_CODES } from '../../constants/permissions';
   ```

2. **Create formPermissions with useMemo**:
   ```jsx
   const formPermissions = useMemo(() => ({
     add: hasAddPermission(PERMISSION_CODES.FORM_NAME),
     edit: hasModifyPermission(PERMISSION_CODES.FORM_NAME),
     delete: hasDeletePermission(PERMISSION_CODES.FORM_NAME)
   }), [hasAddPermission, hasModifyPermission, hasDeletePermission]);
   ```

3. **Apply to buttons** (two approaches):
   - **Direct approach** (SalesInvoice, SalesReturn):
     ```jsx
     <AddButton disabled={!formPermissions.add} />
     ```
   - **Handler approach** (Tender):
     ```jsx
     if (!formPermissions.edit) {
       alert('No permission');
       return;
     }
     ```

4. **Provide visual feedback**:
   - Disable button styling
   - Change cursor to 'not-allowed'
   - Reduce opacity
   - Optional: Show tooltip on hover

---

## Testing Checklist

- [ ] Admin user can access all buttons
- [ ] User with add-only permission sees edit/delete disabled
- [ ] User with edit-only permission sees add/delete disabled
- [ ] User with no permissions sees all buttons disabled
- [ ] Tooltips show correct permission denied message
- [ ] Button opacity/styling changes when disabled
- [ ] Alert messages show when user attempts restricted action (Tender)
