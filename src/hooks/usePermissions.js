import { useAuth } from '../context/AuthContext';
import { PERMISSION_CODES } from '../constants/permissions';

/**
 * Custom hook to check user permissions for modules
 * Returns utilities to check if a user has access to specific modules and actions
 */
export const usePermissions = () => {
  const { permissions, userData } = useAuth();

  /**
   * Check if user is an Admin - Admin has full access to all modules
   * @returns {boolean} - True if user role is Admin
   */
  const isAdmin = () => {
    return userData && userData.role && userData.role.toLowerCase() === 'admin';
  };

  /**
   * Check if user has permission for a specific form/module
   * @param {string} formName - The form code/name (e.g., 'ITEM_CREATION', 'SALES_INVOICE')
   * @returns {boolean} - True if user has permission (fPermission === 1)
   */
  const hasPermission = (formName) => {
    // Admin users have access to all modules
    if (isAdmin()) {
      return true;
    }

    if (!permissions || permissions.length === 0) return false;
    
    const permission = permissions.find(
      p => p.fForm === formName || p.form === formName || p.formCode === formName
    );
    
    return permission && (permission.fPermission === 1 || permission.fPermission === '1' || permission.fPermission === true);
  };

  /**
   * Check if user has add permission for a specific form/module
   * @param {string} formName - The form code/name
   * @returns {boolean} - True if user has add permission (fAdd === 1)
   */
  const hasAddPermission = (formName) => {
    // Admin users have all permissions
    if (isAdmin()) {
      // console.log(`✅ User is ADMIN for ${formName} - returning true`);
      return true;
    }

    if (!permissions || permissions.length === 0) {
      console.log(`❌ No permissions found for ${formName}`);
      return false;
    }
    
    const permission = permissions.find(
      p => p.fForm === formName || p.form === formName || p.formCode === formName
    );
    
    const hasAdd = permission && (permission.fAdd === 1 || permission.fAdd === '1' || permission.fAdd === true);
    
    console.log(`Permission lookup for ${formName}:`, {
      found: !!permission,
      permission: permission,
      fAdd: permission?.fAdd,
      fAdd_type: typeof permission?.fAdd,
      hasAdd: hasAdd
    });
    
    return hasAdd;
  };

  /**
   * Check if user has modify/edit permission for a specific form/module
   * @param {string} formName - The form code/name
   * @returns {boolean} - True if user has modify permission (fMod === 1)
   */
  const hasModifyPermission = (formName) => {
    // Admin users have all permissions
    if (isAdmin()) {
      return true;
    }

    if (!permissions || permissions.length === 0) return false;
    
    const permission = permissions.find(
      p => p.fForm === formName || p.form === formName || p.formCode === formName
    );
    
    return permission && (permission.fMod === 1 || permission.fMod === '1' || permission.fMod === true);
  };

  /**
   * Check if user has delete permission for a specific form/module
   * @param {string} formName - The form code/name
   * @returns {boolean} - True if user has delete permission (fDel === 1)
   */
  const hasDeletePermission = (formName) => {
    // Admin users have all permissions
    if (isAdmin()) {
      return true;
    }

    if (!permissions || permissions.length === 0) return false;
    
    const permission = permissions.find(
      p => p.fForm === formName || p.form === formName || p.formCode === formName
    );
    
    return permission && (permission.fDel === 1 || permission.fDel === '1' || permission.fDel === true);
  };

  /**
   * Check if user has print permission for a specific form/module
   * @param {string} formName - The form code/name
   * @returns {boolean} - True if user has print permission (fPrint === 1)
   */
  const hasPrintPermission = (formName) => {
    // Admin users have all permissions
    if (isAdmin()) {
      return true;
    }

    if (!permissions || permissions.length === 0) return false;
    
    const permission = permissions.find(
      p => p.fForm === formName || p.form === formName || p.formCode === formName
    );
    
    return permission && (permission.fPrint === 1 || permission.fPrint === '1' || permission.fPrint === true);
  };

  /**
   * Get all permitted forms for the user
   * @returns {string[]} - Array of form codes the user has permission for
   */
  const getPermittedForms = () => {
    // Admin users have all permissions, return all available forms
    if (isAdmin()) {
      return Object.values(PERMISSION_CODES);
    }

    if (!permissions || permissions.length === 0) return [];
    
    return permissions
      .filter(p => p.fPermission === 1 || p.fPermission === '1' || p.fPermission === true)
      .map(p => p.fForm);
  };

  return {
    hasPermission,
    hasAddPermission,
    hasModifyPermission,
    hasDeletePermission,
    hasPrintPermission,
    getPermittedForms,
    isAdmin,
  };
};
