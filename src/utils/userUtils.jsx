// Utility functions to get user data from session storage
const AUTH_STORAGE_KEY = 'auth_data';

/**
 * Get user data from session storage
 * @returns {Object|null} User data object or null if not found
 */
export const getUserData = () => {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.userData || null;
    }
  } catch (err) {
    console.warn('Failed to get user data:', err);
  }
  return null;
};

/**
 * Get company code
 * @returns {string} Company code (fCompCode)
 */
export const getCompCode = () => {
  const userData = getUserData();
  return userData?.companyCode || '';
};

/**
 * Get company name
 * @returns {string} Company name (fCompName)
 */
export const getCompName = () => {
  const userData = getUserData();
  return userData?.companyName || '';
};

/**
 * Get user code
 * @returns {string} User code (fUcode)
 */
export const getUCode = () => {
  const userData = getUserData();
  return userData?.userCode || '';
};

/**
 * Get username
 * @returns {string} Username
 */
export const getUsername = () => {
  const userData = getUserData();
  return userData?.username || '';
};

/**
 * Get user role
 * @returns {string} User role (Admin/User)
 */
export const getUserRole = () => {
  const userData = getUserData();
  return userData?.role || '';
};

/**
 * Get all user information
 * @returns {Object} Object containing all user data
 */
export const getAllUserInfo = () => {
  const userData = getUserData();
  return {
    CompCode: userData?.companyCode || '',
    CompName: userData?.companyName || '',
    UCode: userData?.userCode || '',
    username: userData?.username || '',
    role: userData?.role || '',
    images: userData?.images || ''
  };
};

/**
 * Check if user is admin
 * @returns {boolean} True if user is admin
 */
export const isAdmin = () => {
  return getUserRole() === 'Admin';
};

/**
 * Check if user is logged in
 * @returns {boolean} True if user data exists
 */
export const isLoggedIn = () => {
  return getUserData() !== null;
};
