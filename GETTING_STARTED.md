# 🚀 Permission System - Getting Started (5 Minutes)

## What You Need to Know

When a user logs in with these permissions:
```json
{
  "fForm": "ITEM_CREATION",
  "fPermission": 1,    // 1 = allowed, 0 = denied
  "fAdd": 1,           // Can create
  "fMod": 0,           // Cannot edit
  "fDel": 0,           // Cannot delete
  "fPrint": 0          // Cannot print
}
```

**Result**: Only "Item Creation" shows in navbar. User can add items but cannot edit or delete.

---

## Using the Permission Hook (30 seconds)

### Step 1: Import
```javascript
import { usePermissions } from '../hooks/usePermissions';
```

### Step 2: Use in component
```javascript
function MyComponent() {
  const { hasPermission } = usePermissions();
  
  return (
    <>
      {hasPermission('ITEM_CREATION') && <ItemPage />}
    </>
  );
}
```

That's it! ✓

---

## All Available Methods

```javascript
const {
  hasPermission,           // Can user access this module?
  hasAddPermission,        // Can user create records?
  hasModifyPermission,     // Can user edit records?
  hasDeletePermission,     // Can user delete records?
  hasPrintPermission,      // Can user print?
  getPermittedForms        // Get array of all allowed modules
} = usePermissions();
```

---

## Common Patterns

### 1. Hide page from unauthorized users
```javascript
if (!hasPermission('ITEM_CREATION')) {
  return <h1>Access Denied</h1>;
}
```

### 2. Show/hide buttons
```javascript
{hasAddPermission('ITEM_CREATION') && <button>Add</button>}
{hasModifyPermission('ITEM_CREATION') && <button>Edit</button>}
{hasDeletePermission('ITEM_CREATION') && <button>Delete</button>}
```

### 3. Show only allowed modules
```javascript
const { getPermittedForms } = usePermissions();
const modules = getPermittedForms();
// Returns: ['ITEM_CREATION', ...]
```

---

## Module Names (Copy & Paste)

### Masters
```
UNIT_CREATION, COLOR_CREATION, SIZE_CREATION, MODEL_CREATION,
SALESMAN_CREATION, COMPANY_CREATION, USER_CREATION, DESIGN_CREATION,
SCRAP_CREATION, BRAND_CREATION, CATEGORY_CREATION, PRODUCT_CREATION,
STATE_CREATION, ITEM_CREATION
```

### Transactions
```
SALES_INVOICE, SALES_RETURN, PURCHASE_INVOICE, PURCHASE_RETURN,
SCRAP_RATE_FIX, SCRAP_PROCUREMENT, TENDER, BILL_COLLECTOR,
PAYMENT_VOUCHER, RECEIPT_VOUCHER
```

### Reports
```
SALES_REPORT, STOCK_REPORT, PURCHASE_REPORT, LEDGER_REPORT,
TRIAL_BALANCE, PROFIT_LOSS, BALANCE_SHEET, CASH_FLOW, STOCK_SUMMARY,
CUSTOMER_STATEMENT, SUPPLIER_STATEMENT, TAX_REPORT, AUDIT_REPORT
```

---

## Test It Right Now

### In Browser Console:
```javascript
// Get stored permissions
JSON.parse(sessionStorage.getItem('auth_data')).permissions
```

You should see an array with permission objects.

---

## Navbar Already Works

✅ Desktop menu filters automatically  
✅ Mobile menu filters automatically  
✅ You don't need to do anything  

Just log in and see only allowed modules!

---

## What's Stored

```javascript
// In sessionStorage under key 'auth_data':
{
  userData: {
    username: "san",
    role: "User",
    companyCode: "001",
    companyName: "DIKSHI TECHNOLOGIES DEMO"
  },
  permissions: [
    { fForm: "ITEM_CREATION", fPermission: 1, fAdd: 1, fMod: 0, fDel: 0, fPrint: 0 },
    { fForm: "UNIT_CREATION", fPermission: 0, fAdd: 0, fMod: 0, fDel: 0, fPrint: 0 },
    // ... 36 more permissions
  ]
}
```

Clears automatically when browser closes (no logout needed).

---

## Complete Example

```javascript
import { usePermissions } from '../hooks/usePermissions';

function ItemManagement() {
  const {
    hasPermission,
    hasAddPermission,
    hasModifyPermission,
    hasDeletePermission
  } = usePermissions();

  // Deny access if no permission
  if (!hasPermission('ITEM_CREATION')) {
    return <div>Sorry, you don't have access to Item Management</div>;
  }

  return (
    <div>
      <h1>Item Management</h1>
      
      {hasAddPermission('ITEM_CREATION') && (
        <button onClick={handleAdd}>Add New Item</button>
      )}
      
      <ItemList>
        {items.map(item => (
          <ItemRow key={item.id} item={item}>
            {hasModifyPermission('ITEM_CREATION') && (
              <button>Edit</button>
            )}
            {hasDeletePermission('ITEM_CREATION') && (
              <button>Delete</button>
            )}
          </ItemRow>
        ))}
      </ItemList>
    </div>
  );
}

export default ItemManagement;
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Hook returns false | Check spelling of form code (ITEM_CREATION not item_creation) |
| Permissions undefined | Make sure login response has permissions array |
| Navbar not filtering | Try clearing sessionStorage and logging in again |
| Module name not working | Use exact name from the list above |

---

## Next Reading

- **More details**: See [README_PERMISSIONS.md](README_PERMISSIONS.md)
- **All methods**: See [PERMISSIONS_QUICK_REFERENCE.md](PERMISSIONS_QUICK_REFERENCE.md)
- **Best practices**: See [PERMISSIONS_BEST_PRACTICES.md](PERMISSIONS_BEST_PRACTICES.md)

---

## That's All You Need!

You can now:
- ✅ Check if user has access to a module
- ✅ Show/hide buttons based on permissions
- ✅ Protect pages from unauthorized users
- ✅ Get list of all allowed modules

**Happy coding!** 🎉
