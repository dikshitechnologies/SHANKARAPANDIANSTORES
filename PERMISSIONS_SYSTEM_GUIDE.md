# Module Permissions System Implementation

## Overview
A complete permission-based module access control system has been implemented for your application. Only modules where the user has `fPermission = 1` will be displayed in the navigation and accessible to the user.

## System Architecture

### 1. **AuthContext** (`src/context/AuthContext.jsx`)
Stores user authentication data and permissions received from the login response:

```javascript
{
  userData: {
    username: "san",
    role: "User",
    companyCode: "001",
    companyName: "DIKSHI TECHNOLOGIES DEMO",
    userCode: "032"
  },
  permissions: [
    {
      fForm: "ITEM_CREATION",
      fPermission: 1,  // 1 = allowed, 0 = not allowed
      fAdd: 1,
      fMod: 0,
      fDel: 0,
      fPrint: 0
    },
    // ... more permissions
  ]
}
```

### 2. **usePermissions Hook** (`src/hooks/usePermissions.js`)
Custom React hook that provides utilities to check user permissions.

#### Available Methods:

```javascript
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const {
    hasPermission,
    hasAddPermission,
    hasModifyPermission,
    hasDeletePermission,
    hasPrintPermission,
    getPermittedForms
  } = usePermissions();

  // Check if user can access a module
  if (hasPermission('ITEM_CREATION')) {
    // Show Item Creation link
  }

  // Check specific action permissions
  const canAdd = hasAddPermission('ITEM_CREATION');
  const canEdit = hasModifyPermission('ITEM_CREATION');
  const canDelete = hasDeletePermission('ITEM_CREATION');
  const canPrint = hasPrintPermission('ITEM_CREATION');

  // Get all permitted modules
  const allowedModules = getPermittedForms(); // Returns array like ['ITEM_CREATION']
};
```

### 3. **Updated Navbar Component** (`src/components/Navbar/Navbar.jsx`)
The Navbar now automatically filters menu items based on user permissions.

#### Menu Items Mapping:
Each menu item now includes a `permission` property that maps to the corresponding form code:

```javascript
const masterItems = [
  { name: 'Unit Creation', path: '/masters/unit-creation', permission: 'UNIT_CREATION' },
  { name: 'Color Creation', path: '/masters/color-creation', permission: 'COLOR_CREATION' },
  { name: 'Item Creation', path: '/masters/ItemCreation', permission: 'ITEM_CREATION' },
  // ... more items
];

const transactionItems = [
  { name: 'Sales Invoice', path: '/sales-invoice', permission: 'SALES_INVOICE' },
  { name: 'Purchase Invoice', path: '/transactions/purchase-invoice', permission: 'PURCHASE_INVOICE' },
  // ... more items
];
```

These are filtered using the `usePermissions` hook:

```javascript
const filteredMasterItems = useMemo(() => {
  return masterItems.filter(item => !item.permission || hasPermission(item.permission));
}, [hasPermission]);

const filteredTransactionItems = useMemo(() => {
  return transactionItems.filter(item => !item.permission || hasPermission(item.permission));
}, [hasPermission]);
```

## How It Works

### Login Flow:
1. User logs in with credentials
2. Backend returns user data with permissions array
3. `login()` function in AuthContext stores permissions in sessionStorage
4. All components can now access permissions via `usePermissions` hook

### Module Display:
1. Navbar reads permissions from AuthContext
2. Menu items are filtered based on `hasPermission()` check
3. Only allowed modules appear in navigation
4. Both desktop and mobile menus are filtered

### Example Permission Response:
```json
{
  "fForm": "ITEM_CREATION",
  "fPermission": 1,    // 1 = module access allowed
  "fAdd": 1,           // 1 = can add items
  "fMod": 0,           // 0 = cannot modify items
  "fDel": 0,           // 0 = cannot delete items
  "fPrint": 0          // 0 = cannot print
}
```

## Usage Examples

### 1. Checking Module Access:
```javascript
import { usePermissions } from '../hooks/usePermissions';

const MyPage = () => {
  const { hasPermission } = usePermissions();

  if (!hasPermission('ITEM_CREATION')) {
    return <div>You don't have access to this module</div>;
  }

  return <ItemCreationForm />;
};
```

### 2. Conditional Feature Rendering:
```javascript
const ItemForm = () => {
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();

  return (
    <>
      {hasAddPermission('ITEM_CREATION') && <AddButton />}
      {hasModifyPermission('ITEM_CREATION') && <EditButton />}
      {hasDeletePermission('ITEM_CREATION') && <DeleteButton />}
    </>
  );
};
```

### 3. Getting All Permitted Modules:
```javascript
const Dashboard = () => {
  const { getPermittedForms } = usePermissions();
  const allowedModules = getPermittedForms();

  console.log('User can access:', allowedModules);
  // Output: ['ITEM_CREATION']
};
```

## Supported Form Codes

### Master Items:
- `UNIT_CREATION`
- `COLOR_CREATION`
- `SIZE_CREATION`
- `MODEL_CREATION`
- `SALESMAN_CREATION`
- `COMPANY_CREATION`
- `USER_CREATION`
- `DESIGN_CREATION`
- `SCRAP_CREATION`
- `BRAND_CREATION`
- `CATEGORY_CREATION`
- `PRODUCT_CREATION`
- `STATE_CREATION`
- `ITEM_CREATION`

### Transaction Items:
- `SALES_INVOICE`
- `SALES_RETURN`
- `PURCHASE_INVOICE`
- `PURCHASE_RETURN`
- `SCRAP_RATE_FIX`
- `SCRAP_PROCUREMENT`
- `TENDER`
- `BILL_COLLECTOR`
- `PAYMENT_VOUCHER`
- `RECEIPT_VOUCHER`

### Report Items (from login response):
- `SALES_REPORT`
- `STOCK_REPORT`
- `PURCHASE_REPORT`
- `LEDGER_REPORT`
- `TRIAL_BALANCE`
- `PROFIT_LOSS`
- `BALANCE_SHEET`
- `CASH_FLOW`
- `STOCK_SUMMARY`
- `CUSTOMER_STATEMENT`
- `SUPPLIER_STATEMENT`
- `TAX_REPORT`
- `AUDIT_REPORT`

## Permission Field Details

Each permission object has the following fields:

| Field | Type | Value | Meaning |
|-------|------|-------|---------|
| `fForm` | string | Form code | Module identifier (e.g., 'ITEM_CREATION') |
| `fPermission` | 0\|1 | 1 = Yes, 0 = No | Can user access this module? |
| `fAdd` | 0\|1 | 1 = Yes, 0 = No | Can user create new records? |
| `fMod` | 0\|1 | 1 = Yes, 0 = No | Can user modify existing records? |
| `fDel` | 0\|1 | 1 = Yes, 0 = No | Can user delete records? |
| `fPrint` | 0\|1 | 1 = Yes, 0 = No | Can user print reports? |

## Current User Status

In your login response:
- **Username**: san
- **Role**: User
- **Company**: DIKSHI TECHNOLOGIES DEMO
- **Allowed Modules**: ITEM_CREATION (with fAdd permission)
- **All other modules**: Blocked (fPermission = 0)

This user can only:
1. See the "Item Creation" menu item
2. Add new items (fAdd = 1)
3. Cannot modify, delete, or print (all are 0)

## Implementation Details

### SessionStorage Persistence:
Permissions are stored in `sessionStorage` under the key `auth_data`, which automatically clears when the browser tab/window closes (logout happens automatically on browser close).

### Navbar Filtering:
- Desktop and mobile menus are independently filtered
- Menu items without a `permission` property (like "Popup List Selector Example") are always shown
- Items with a `permission` property only show if `hasPermission()` returns true

## Files Modified/Created

1. **Created**: `src/hooks/usePermissions.js` - Main permissions hook
2. **Modified**: `src/context/AuthContext.jsx` - Already had permission storage
3. **Modified**: `src/components/Navbar/Navbar.jsx` - Added permission filtering

## Next Steps

To protect other pages and components:

1. Import the hook in your page components:
   ```javascript
   import { usePermissions } from '../hooks/usePermissions';
   ```

2. Add permission checks:
   ```javascript
   const { hasPermission } = usePermissions();

   if (!hasPermission('ITEM_CREATION')) {
     return <Redirect to="/unauthorized" />;
   }
   ```

3. Conditionally render buttons and features based on specific permissions (fAdd, fMod, fDel, fPrint)

## Troubleshooting

**Issue**: Permissions not loading
- **Solution**: Ensure login response includes the `permissions` array with proper field names

**Issue**: All menus showing
- **Solution**: Check that permission form codes in menu items match exactly with the `fForm` values from the backend

**Issue**: Menu items still showing after login
- **Solution**: Clear sessionStorage and login again (Ctrl+Shift+Delete → Application → Session Storage)
