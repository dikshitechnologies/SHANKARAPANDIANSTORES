# Permission System - Best Practices & Guidelines

## Best Practices for Permission Checks

### 1. Always Check Permissions in Protected Components

```javascript
// ✓ GOOD - Protected component
import { usePermissions } from '../hooks/usePermissions';

function ItemCreationPage() {
  const { hasPermission } = usePermissions();

  if (!hasPermission('ITEM_CREATION')) {
    return <UnauthorizedPage />;
  }

  return <ItemCreationForm />;
}
```

```javascript
// ✗ BAD - No permission check
function ItemCreationPage() {
  return <ItemCreationForm />;  // Anyone can access!
}
```

### 2. Check Specific Actions Before Rendering Buttons

```javascript
// ✓ GOOD - Action-level checks
import { usePermissions } from '../hooks/usePermissions';

function ItemForm() {
  const { hasAddPermission, hasModifyPermission } = usePermissions();

  return (
    <>
      {hasAddPermission('ITEM_CREATION') && (
        <button onClick={handleAdd}>Add Item</button>
      )}
      {hasModifyPermission('ITEM_CREATION') && (
        <button onClick={handleEdit}>Edit Item</button>
      )}
    </>
  );
}
```

```javascript
// ✗ BAD - No distinction between action types
function ItemForm() {
  const { hasPermission } = usePermissions();

  return (
    <>
      {hasPermission('ITEM_CREATION') && (
        <>
          <button onClick={handleAdd}>Add Item</button>
          <button onClick={handleEdit}>Edit Item</button>
        </>
      )}
    </>
  );
}
```

### 3. Use Consistent Form Code Names

```javascript
// ✓ GOOD - Correct form codes
const FORM_CODES = {
  ITEM_CREATION: 'ITEM_CREATION',
  SALES_INVOICE: 'SALES_INVOICE',
  PURCHASE_RETURN: 'PURCHASE_RETURN',
};

hasPermission(FORM_CODES.ITEM_CREATION)
```

```javascript
// ✗ BAD - Typos or wrong names
hasPermission('item_creation')        // Wrong case
hasPermission('ItemCreation')         // Wrong format
hasPermission('ITEM CREATION')        // Wrong separator
```

### 4. Handle No Access Gracefully

```javascript
// ✓ GOOD - User-friendly error message
function AdminPanel() {
  const { hasPermission } = usePermissions();

  if (!hasPermission('ADMINISTRATION')) {
    return (
      <div className="error-container">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the Administration panel.</p>
        <p>Contact your administrator for access.</p>
      </div>
    );
  }

  return <AdministrationContent />;
}
```

```javascript
// ✗ BAD - Confusing redirect or blank page
function AdminPanel() {
  const { hasPermission } = usePermissions();
  if (!hasPermission('ADMINISTRATION')) {
    return null;  // Silent fail - user confused
  }
  return <AdministrationContent />;
}
```

### 5. Create a Permission Constants File

```javascript
// src/constants/permissions.js
export const PERMISSION_CODES = {
  // Masters
  UNIT_CREATION: 'UNIT_CREATION',
  COLOR_CREATION: 'COLOR_CREATION',
  SIZE_CREATION: 'SIZE_CREATION',
  MODEL_CREATION: 'MODEL_CREATION',
  SALESMAN_CREATION: 'SALESMAN_CREATION',
  COMPANY_CREATION: 'COMPANY_CREATION',
  USER_CREATION: 'USER_CREATION',
  DESIGN_CREATION: 'DESIGN_CREATION',
  SCRAP_CREATION: 'SCRAP_CREATION',
  BRAND_CREATION: 'BRAND_CREATION',
  CATEGORY_CREATION: 'CATEGORY_CREATION',
  PRODUCT_CREATION: 'PRODUCT_CREATION',
  STATE_CREATION: 'STATE_CREATION',
  ITEM_CREATION: 'ITEM_CREATION',

  // Transactions
  SALES_INVOICE: 'SALES_INVOICE',
  SALES_RETURN: 'SALES_RETURN',
  PURCHASE_INVOICE: 'PURCHASE_INVOICE',
  PURCHASE_RETURN: 'PURCHASE_RETURN',
  SCRAP_RATE_FIX: 'SCRAP_RATE_FIX',
  SCRAP_PROCUREMENT: 'SCRAP_PROCUREMENT',
  TENDER: 'TENDER',
  BILL_COLLECTOR: 'BILL_COLLECTOR',
  PAYMENT_VOUCHER: 'PAYMENT_VOUCHER',
  RECEIPT_VOUCHER: 'RECEIPT_VOUCHER',

  // Reports
  SALES_REPORT: 'SALES_REPORT',
  STOCK_REPORT: 'STOCK_REPORT',
  // ... etc
};

// Then use everywhere:
import { PERMISSION_CODES } from '../constants/permissions';
hasPermission(PERMISSION_CODES.ITEM_CREATION)
```

### 6. Implement Permission-Based Routing

```javascript
// src/components/ProtectedRoute/ProtectedRoute.jsx (ENHANCED)
import { usePermissions } from '../../hooks/usePermissions';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ component: Component, requiredPermission, ...rest }) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Component {...rest} />;
}

export default ProtectedRoute;

// Usage in AppRoutes.jsx:
<Route
  path="/masters/ItemCreation"
  element={<ProtectedRoute component={ItemCreation} requiredPermission="ITEM_CREATION" />}
/>
```

### 7. Log Permission Checks for Debugging

```javascript
// ✓ GOOD - Debug helper function
import { usePermissions } from '../hooks/usePermissions';

function usePermissionsDebug(formCode) {
  const { hasPermission, hasAddPermission, hasModifyPermission, hasDeletePermission, hasPrintPermission } = usePermissions();
  
  const checks = {
    access: hasPermission(formCode),
    add: hasAddPermission(formCode),
    modify: hasModifyPermission(formCode),
    delete: hasDeletePermission(formCode),
    print: hasPrintPermission(formCode),
  };

  console.log(`[Permission Checks for ${formCode}]`, checks);
  
  return checks;
}

// Usage:
usePermissionsDebug('ITEM_CREATION');
// Console output: [Permission Checks for ITEM_CREATION] { access: true, add: true, modify: false, ... }
```

### 8. Create Feature Flags Based on Permissions

```javascript
// ✓ GOOD - Feature flag pattern
import { usePermissions } from '../hooks/usePermissions';

function useItemCreationFeatures() {
  const { hasAddPermission, hasModifyPermission, hasDeletePermission, hasPrintPermission } = usePermissions();
  
  return {
    canCreate: hasAddPermission('ITEM_CREATION'),
    canEdit: hasModifyPermission('ITEM_CREATION'),
    canDelete: hasDeletePermission('ITEM_CREATION'),
    canPrint: hasPrintPermission('ITEM_CREATION'),
  };
}

// Usage:
function ItemList() {
  const features = useItemCreationFeatures();
  
  return (
    <>
      {features.canCreate && <button>New Item</button>}
      {features.canEdit && <button>Edit</button>}
      {features.canDelete && <button>Delete</button>}
      {features.canPrint && <button>Print</button>}
    </>
  );
}
```

## Common Patterns

### Pattern 1: Module + Action Checks

```javascript
// Check if user can access module AND can perform action
function ItemEditor({ itemId }) {
  const { hasPermission, hasModifyPermission } = usePermissions();
  
  if (!hasPermission('ITEM_CREATION')) {
    return <NoAccess />;
  }
  
  if (!hasModifyPermission('ITEM_CREATION')) {
    return <ReadOnlyForm />;
  }
  
  return <EditableForm itemId={itemId} />;
}
```

### Pattern 2: Batch Permission Checks

```javascript
// Check multiple permissions at once
function Dashboard() {
  const { getPermittedForms } = usePermissions();
  const allowed = getPermittedForms();
  
  const canAccessMasters = allowed.some(form => 
    ['UNIT_CREATION', 'COLOR_CREATION', 'SIZE_CREATION'].includes(form)
  );
  
  const canAccessTransactions = allowed.some(form =>
    ['SALES_INVOICE', 'PURCHASE_INVOICE'].includes(form)
  );
  
  return (
    <>
      {canAccessMasters && <MastersCard />}
      {canAccessTransactions && <TransactionsCard />}
    </>
  );
}
```

### Pattern 3: Disable vs Hide

```javascript
// ✓ GOOD - Disable if no modify permission (user sees button but can't click)
<button 
  onClick={handleEdit}
  disabled={!hasModifyPermission('ITEM_CREATION')}
>
  Edit
</button>

// vs

// ✓ GOOD - Hide if no permission at all
{hasModifyPermission('ITEM_CREATION') && (
  <button onClick={handleEdit}>Edit</button>
)}
```

## Error Handling

### Handle Null/Undefined Gracefully

```javascript
// ✓ GOOD - Safe permission checks
function SafeComponent() {
  const { hasPermission } = usePermissions();
  
  try {
    const hasAccess = hasPermission('ITEM_CREATION');
    return hasAccess ? <Content /> : <NoAccess />;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return <ErrorComponent />;
  }
}
```

### Provide Fallbacks

```javascript
// ✓ GOOD - Fallback for permission check failure
function Component() {
  const { hasPermission } = usePermissions();
  const hasAccess = hasPermission('ITEM_CREATION') ?? false;
  
  return hasAccess ? <Content /> : <Fallback />;
}
```

## Performance Tips

### 1. Memoize Permission-Dependent Calculations

```javascript
// ✓ GOOD - Memoized checks
import { useMemo } from 'react';
import { usePermissions } from '../hooks/usePermissions';

function PermissionAwareList() {
  const { hasModifyPermission, hasDeletePermission } = usePermissions();
  
  const actions = useMemo(() => ({
    canEdit: hasModifyPermission('ITEM_CREATION'),
    canDelete: hasDeletePermission('ITEM_CREATION'),
  }), [hasModifyPermission, hasDeletePermission]);
  
  return <List actions={actions} />;
}
```

### 2. Cache Permission Results

```javascript
// ✓ GOOD - Cache frequently checked permissions
import { useCallback } from 'react';
import { usePermissions } from '../hooks/usePermissions';

function Component() {
  const { hasPermission } = usePermissions();
  
  const checkItemAccess = useCallback(() => {
    return hasPermission('ITEM_CREATION');
  }, [hasPermission]);
  
  // Use checkItemAccess multiple times - cached
  return <>...</>;
}
```

## Testing

### Unit Test Example

```javascript
// __tests__/usePermissions.test.js
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../hooks/usePermissions';

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    permissions: [
      { fForm: 'ITEM_CREATION', fPermission: 1, fAdd: 1, fMod: 0, fDel: 0, fPrint: 0 },
    ]
  })
}));

describe('usePermissions', () => {
  it('should return true for allowed permissions', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission('ITEM_CREATION')).toBe(true);
  });

  it('should return false for denied permissions', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission('SALES_INVOICE')).toBe(false);
  });

  it('should check add permission correctly', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasAddPermission('ITEM_CREATION')).toBe(true);
  });

  it('should check modify permission correctly', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasModifyPermission('ITEM_CREATION')).toBe(false);
  });
});
```

## Common Mistakes to Avoid

| Mistake | Problem | Solution |
|---------|---------|----------|
| String case mismatch | `'item_creation'` != `'ITEM_CREATION'` | Use constants, exact case |
| Missing null check | App crashes if permissions undefined | Add `\|\| []` default |
| Only checking module access | Can add but can't modify? | Check specific permissions |
| Silent failures | User sees nothing, no feedback | Show meaningful messages |
| Hardcoded form codes | Typos everywhere, maintenance nightmare | Create PERMISSION_CODES constant |
| No error handling | One bad permission crashes app | Try-catch or optional chaining |
| Not memoizing filters | Performance degradation | Use useMemo for filters |
| Checking in wrong component | Page loads before permissions | Check in layout/route wrapper |

## Checklist Before Deployment

- [ ] All form codes use exact UPPERCASE_WITH_UNDERSCORES format
- [ ] Every page has permission check
- [ ] Every action button has appropriate permission check
- [ ] Error messages are user-friendly
- [ ] Tests cover permission logic
- [ ] Form code constants created
- [ ] Navbar filters working correctly
- [ ] No hardcoded permission strings
- [ ] SessionStorage clearing on logout
- [ ] Memoization implemented where needed
