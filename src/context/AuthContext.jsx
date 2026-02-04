// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const AUTH_STORAGE_KEY = 'auth_data'; // Key for sessionStorage persistence

export const AuthProvider = ({ children }) => {
  // Initialize state from sessionStorage (clears on browser/tab close)
  const [userData, setUserData] = useState(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.userData || null;
      }
    } catch (err) {
      console.warn('Failed to restore auth data from sessionStorage:', err);
    }
    return null;
  });

  const [permissions, setPermissions] = useState(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.permissions || [];
      }
    } catch (err) {
      console.warn('Failed to restore permissions from sessionStorage:', err);
    }
    return [];
  });

  // Add fseudo state (top-level)
  const [fseudo, setFseudo] = useState(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.fseudo || null;
      }
    } catch (err) {
      console.warn('Failed to restore fseudo from sessionStorage:', err);
    }
    return null;
  });

  const login = (data) => {
    const newUserData = {
      username: data.userName,
      role: data.role,
      companyCode: data.fCompCode,
      companyName: data.fCompName,
      userCode: data.fUcode || '', // fUcode may not exist for Admin
      images: data.images || '',
      date:data.date || '',
      length: data.fLength || ''
    };
    const newPermissions = data.permissions || [];
    const newFseudo = data.fseudo || null;

    setUserData(newUserData);
    setPermissions(newPermissions);
    setFseudo(newFseudo);

    // Persist to sessionStorage (clears on browser/tab close)
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        userData: newUserData,
        permissions: newPermissions,
        fseudo: newFseudo,
      }));
    } catch (err) {
      console.warn('Failed to persist auth data to sessionStorage:', err);
    }
  };

  const logout = () => {
    setUserData(null);
    setPermissions([]);
    setFseudo(null);
    // Remove from sessionStorage
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to remove auth data from sessionStorage:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ userData, permissions, fseudo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
