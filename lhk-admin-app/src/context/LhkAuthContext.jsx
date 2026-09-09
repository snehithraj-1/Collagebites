import React, { createContext, useContext, useState, useEffect } from 'react';

const LhkAuthContext = createContext(null);

export function LhkAuthProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_lhk_admin_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [unauthorizedError, setUnauthorizedError] = useState('');

  useEffect(() => {
    try {
      if (profile) {
        localStorage.setItem('cb_lhk_admin_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('cb_lhk_admin_profile');
      }
    } catch (e) {}
  }, [profile]);

  const loginLhkAdmin = async (identifier, password) => {
    setUnauthorizedError('');
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        // Enforce Local Home Kitchen role boundary
        if (data.user.restaurant_id !== 'local-home-kitchen' && data.user.role !== 'super_admin') {
          return {
            success: false,
            error: 'Access Denied: This portal is strictly for Local Home Kitchen authorized staff.'
          };
        }
        setProfile(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (err) {
      return { success: false, error: 'Network error authenticating staff.' };
    }
  };

  const logout = () => {
    setProfile(null);
    localStorage.removeItem('cb_lhk_admin_profile');
  };

  return (
    <LhkAuthContext.Provider
      value={{
        profile,
        loading,
        isAuthenticated: Boolean(profile),
        unauthorizedError,
        loginLhkAdmin,
        logout
      }}
    >
      {children}
    </LhkAuthContext.Provider>
  );
}

export function useLhkAuth() {
  const context = useContext(LhkAuthContext);
  if (!context) throw new Error('useLhkAuth must be used within LhkAuthProvider');
  return context;
}
