# Permission System - Quick Reference

## Quick Start

### Check if user has access to a module:
```javascript
import { usePermissions } from '../hooks/usePermissions';

const { hasPermission } = usePermissions();

// In JSX
{hasPermission('ITEM_CREATION') && <ItemCreationPage />}
```

## All Permission Check Methods

```javascript
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const permissions = usePermissions();

  // Check module access (fPermission field)
  permissions.hasPermission('ITEM_CREATION')          // true/false

  // Check specific actions
  permissions.hasAddPermission('ITEM_CREATION')       // true/false
  permissions.hasModifyPermission('ITEM_CREATION')    // true/false
  permissions.hasDeletePermission('ITEM_CREATION')    // true/false
  permissions.hasPrintPermission('ITEM_CREATION')     // true/false

  // Get all allowed modules
  permissions.getPermittedForms()                     // ['ITEM_CREATION']
};
```

## Form Code Names (Use Exact Names)

### Masters
```
UNIT_CREATION
COLOR_CREATION
SIZE_CREATION
MODEL_CREATION
SALESMAN_CREATION
COMPANY_CREATION
USER_CREATION
DESIGN_CREATION
SCRAP_CREATION
BRAND_CREATION
CATEGORY_CREATION
PRODUCT_CREATION
STATE_CREATION
ITEM_CREATION
```

### Transactions
```
SALES_INVOICE
SALES_RETURN
PURCHASE_INVOICE
PURCHASE_RETURN
SCRAP_RATE_FIX
SCRAP_PROCUREMENT
TENDER
BILL_COLLECTOR
PAYMENT_VOUCHER
RECEIPT_VOUCHER
```

### Reports
```
SALES_REPORT
STOCK_REPORT
PURCHASE_REPORT
LEDGER_REPORT
TRIAL_BALANCE
PROFIT_LOSS
BALANCE_SHEET
CASH_FLOW
STOCK_SUMMARY
CUSTOMER_STATEMENT
SUPPLIER_STATEMENT
TAX_REPORT
AUDIT_REPORT
```

## Permission Response Format

```json
{
  "fForm": "ITEM_CREATION",
  "fPermission": 1,
  "fAdd": 1,
  "fMod": 0,
  "fDel": 0,
  "fPrint": 0
}
```

| Field | 0 = | 1 = |
|-------|-----|-----|
| `fPermission` | No access | Can access |
| `fAdd` | Cannot create | Can create |
| `fMod` | Cannot edit | Can edit |
| `fDel` | Cannot delete | Can delete |
| `fPrint` | Cannot print | Can print |

## Common Patterns

### Protect a Page
```javascript
import { usePermissions } from '../hooks/usePermissions';

const ItemCreationPage = () => {
  const { hasPermission } = usePermissions();

  if (!hasPermission('ITEM_CREATION')) {
    return <AccessDenied />;
  }

  return <ItemCreationForm />;
};
```

### Conditional Buttons
```javascript
import { usePermissions } from '../hooks/usePermissions';

const ItemList = () => {
  const { hasAddPermission, hasModifyPermission, hasDeletePermission } = usePermissions();

  return (
    <>
      {hasAddPermission('ITEM_CREATION') && <button>Add Item</button>}
      {hasModifyPermission('ITEM_CREATION') && <button>Edit Item</button>}
      {hasDeletePermission('ITEM_CREATION') && <button>Delete Item</button>}
    </>
  );
};
```

### Dashboard with Permitted Modules
```javascript
import { usePermissions } from '../hooks/usePermissions';

const Dashboard = () => {
  const { getPermittedForms } = usePermissions();
  const allowed = getPermittedForms();

  return (
    <div>
      <h2>Your Modules</h2>
      <ul>
        {allowed.includes('ITEM_CREATION') && <li>Item Creation</li>}
        {allowed.includes('SALES_INVOICE') && <li>Sales Invoice</li>}
        {allowed.includes('PURCHASE_INVOICE') && <li>Purchase Invoice</li>}
      </ul>
    </div>
  );
};
```

## In Navbar (Already Implemented)

Navbar automatically filters menu items based on permissions. Items appear only if:
- They have no `permission` property (always shown)
- OR `hasPermission(item.permission)` returns true

No changes needed - it works automatically!

## Data Flow

```
Login Response
    ↓
AuthContext stores permissions in sessionStorage
    ↓
usePermissions hook reads from AuthContext
    ↓
Components use hasPermission() to check access
    ↓
UI conditionally renders based on permissions
    ↓
Navbar filters menu items automatically
```

## Authentication Storage

- **Location**: `sessionStorage` (cleared on browser close)
- **Key**: `auth_data`
- **Contents**: `{ userData: {...}, permissions: [...] }`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Menu items not filtering | Check form code names match exactly (case-sensitive) |
| Permissions always false | Verify login response has `permissions` array |
| Items still showing after logout | Clear sessionStorage and refresh |
| New permission code not working | Add it to menu items mapping with exact name |

## Currently Allowed (Example Login)

User: **san**
- Company: DIKSHI TECHNOLOGIES DEMO
- Role: User

**Can Access:**
- ITEM_CREATION (with Add permission)

**Cannot Access:**
- All other modules (fPermission = 0)
