import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AdminAuthContext = createContext(null);

const STORAGE_KEY = 'cb_admin_profile';

export function AdminAuthProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'super_admin' || parsed.role === 'admin' || parsed.role === 'restaurant_admin')) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [unauthorizedError, setUnauthorizedError] = useState('');

  // Persist session to localStorage
  useEffect(() => {
    try {
      if (profile && (profile.role === 'super_admin' || profile.role === 'admin' || profile.role === 'restaurant_admin')) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  // Login handler with backend API validation and guaranteed fallback for official credentials
  const loginAdmin = async (identifier, password) => {
    setUnauthorizedError('');
    const cleanInput = (identifier || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanInput || !cleanPassword) {
      return { success: false, error: 'Please enter admin username/email and password.' };
    }

    // 1. Try Backend API
    try {
      const data = await api.adminLogin(cleanInput, cleanPassword);
      if (data && data.success && data.user) {
        setProfile(data.user);
        setUnauthorizedError('');
        return { success: true, user: data.user };
      }
    } catch (apiErr) {
      console.warn('[Admin Auth API fallback check]:', apiErr.message);
    }

    // 2. Direct Fallback Check for Official Super Admin & Kitchen Staff
    const lowerInput = cleanInput.toLowerCase();

    // Official Super Admin check
    if (
      (lowerInput === 'collagebites1@gmail.com' ||
        lowerInput === 'collagebites@gmail.com' ||
        lowerInput === 'superadmin' ||
        lowerInput === 'admin@campusbites.com') &&
      (cleanPassword === 'Clgbites123' || cleanPassword === 'Snehith@007' || cleanPassword === 'admin123')
    ) {
      const superProfile = {
        id: 'admin-super',
        username: 'collagebites1@gmail.com',
        name: 'Collage Bites (Super Admin)',
        email: 'collagebites1@gmail.com',
        role: 'super_admin',
        restaurant_id: null,
        created_at: new Date().toISOString()
      };
      setProfile(superProfile);
      setUnauthorizedError('');
      return { success: true, user: superProfile };
    }

    // Local Home Kitchen Staff
    if (
      (lowerInput === 'lhk_admin' || lowerInput === 'lhk@campusbites.com' || lowerInput === 'lhk') &&
      (cleanPassword === 'LHK@Campus2026' || cleanPassword === 'lhk123')
    ) {
      const lhkProfile = {
        id: 'admin-lhk',
        username: 'lhk_admin',
        name: 'Local Home Kitchen Staff',
        email: 'lhk@campusbites.com',
        role: 'restaurant_admin',
        restaurant_id: 'local-home-kitchen',
        created_at: new Date().toISOString()
      };
      setProfile(lhkProfile);
      setUnauthorizedError('');
      return { success: true, user: lhkProfile };
    }

    // CLG Bites Staff
    if (
      (lowerInput === 'clgbites_admin' || lowerInput === 'clg@campusbites.com' || lowerInput === 'clg') &&
      (cleanPassword === 'CLG@Campus2026' || cleanPassword === 'clg123')
    ) {
      const clgProfile = {
        id: 'admin-clg',
        username: 'clgbites_admin',
        name: 'CLG Bites Staff',
        email: 'clg@campusbites.com',
        role: 'restaurant_admin',
        restaurant_id: 'clg-bites-biryani-nation',
        created_at: new Date().toISOString()
      };
      setProfile(clgProfile);
      setUnauthorizedError('');
      return { success: true, user: clgProfile };
    }

    return {
      success: false,
      error: 'Invalid administrator credentials. Access restricted to authorized campus staff.'
    };
  };

  const logout = () => {
    setProfile(null);
    setUnauthorizedError('');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const isSuperAdmin = profile?.role === 'super_admin' || (profile?.role === 'admin' && !profile?.restaurant_id);
  const isRestaurantAdmin = profile?.role === 'restaurant_admin' || Boolean(profile?.restaurant_id);
  const assignedRestaurantId = profile?.restaurant_id || null;

  return (
    <AdminAuthContext.Provider
      value={{
        profile,
        user: profile,
        loading,
        isAuthenticated: Boolean(profile && (profile.role === 'super_admin' || profile.role === 'restaurant_admin' || profile.role === 'admin')),
        isSuperAdmin,
        isRestaurantAdmin,
        assignedRestaurantId,
        unauthorizedError,
        setUnauthorizedError,
        loginAdmin,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
