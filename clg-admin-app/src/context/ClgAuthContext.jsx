import React, { createContext, useContext, useState, useEffect } from 'react';

const ClgAuthContext = createContext(null);

export function ClgAuthProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_clg_admin_profile');
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
        localStorage.setItem('cb_clg_admin_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('cb_clg_admin_profile');
      }
    } catch (e) {}
  }, [profile]);

  const loginClgAdmin = async (identifier, password) => {
    setUnauthorizedError('');
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        // Enforce CLG Bites role boundary
        if (data.user.restaurant_id !== 'clg-bites-biryani-nation' && data.user.role !== 'super_admin') {
          return {
            success: false,
            error: 'Access Denied: This portal is strictly for CLG Bites Biryani Nation authorized staff.'
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
    localStorage.removeItem('cb_clg_admin_profile');
  };

  return (
    <ClgAuthContext.Provider
      value={{
        profile,
        loading,
        isAuthenticated: Boolean(profile),
        unauthorizedError,
        loginClgAdmin,
        logout
      }}
    >
      {children}
    </ClgAuthContext.Provider>
  );
}

export function useClgAuth() {
  const context = useContext(ClgAuthContext);
  if (!context) throw new Error('useClgAuth must be used within ClgAuthProvider');
  return context;
}
