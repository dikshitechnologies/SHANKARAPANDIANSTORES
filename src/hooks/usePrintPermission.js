import { usePermissions } from './usePermissions';
import { toast } from 'react-toastify';

/**
 * Custom hook for checking print permissions on reports
 * @param {string} reportPermissionCode - The permission code for the report (e.g., "STOCK_BARCODE_WISE", "ACCOUNT_PAYABLE")
 * @returns {object} - { hasPrintPermission: boolean, checkPrintPermission: function }
 */
export const usePrintPermission = (reportPermissionCode) => {
  const { hasPermission } = usePermissions();

  const hasPrintPermission = reportPermissionCode ? hasPermission(reportPermissionCode) : false;

  const checkPrintPermission = () => {
    if (!hasPrintPermission) {
      toast.error('You do not have permission to print this report', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
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
