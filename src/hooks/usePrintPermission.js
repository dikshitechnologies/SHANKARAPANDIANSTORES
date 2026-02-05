import { toast } from 'react-toastify';
import { useFormPermissions } from './useFormPermissions';

/**
 * Custom hook for checking PRINT permissions on reports
 * @param {string} reportPermissionCode - e.g. "ACCOUNT_PAYABLE"
 */
export const usePrintPermission = (reportPermissionCode) => {
  const permissions = useFormPermissions(reportPermissionCode);

  // ✅ ONLY fPrint decides print permission
  const hasPrintPermission = permissions?.print === true;

  const checkPrintPermission = () => {
    if (!hasPrintPermission) {
      toast.error('You do not have permission to print this report', {
        position: 'top-right',
        autoClose: 3000,
      });
      return false;
    }
    return true;
  };

  return {
    hasPrintPermission,
    checkPrintPermission,
  };
};
