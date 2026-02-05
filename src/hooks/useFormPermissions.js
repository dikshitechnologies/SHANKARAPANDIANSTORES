import { useAuth } from '../context/AuthContext';

const isAllowed = (val) =>
  val === true || val === 'Y' || val === '1' || val === 1;

export const useFormPermissions = (formCode) => {
  const { userData, permissions } = useAuth();

  // ✅ Admin gets everything
  if (userData?.role === 'Admin') {
    return {
      permission: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      print: true,
      hasAnyPermission: () => true,
    };
  }

  const formPermission = Array.isArray(permissions)
    ? permissions.find(
        perm => perm.formPermission === formCode || perm.fForm === formCode
      )
    : null;

  if (!formPermission) {
    return {
      permission: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      print: false,
      hasAnyPermission: () => false,
    };
  }

  const hasAdd    = isAllowed(formPermission.add || formPermission.fAdd);
  const hasEdit   = isAllowed(formPermission.edit || formPermission.fMod);
  const hasDelete = isAllowed(formPermission.delete || formPermission.fDel);
  const hasPrint  = isAllowed(formPermission.print || formPermission.fPrint);
  const hasForm   = isAllowed(formPermission.fPermission);

  return {
    permission: hasForm,
    canCreate: hasAdd,
    canEdit: hasEdit,
    canDelete: hasDelete,
    print: hasPrint,

    // legacy aliases
    add: hasAdd,
    edit: hasEdit,
    delete: hasDelete,

    hasAnyPermission: () =>
      hasForm || hasAdd || hasEdit || hasDelete || hasPrint,
  };
};
