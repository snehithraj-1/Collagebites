import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_admin_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role === 'admin' && parsed.email?.toLowerCase() === 'rajsrmap2@gmail.com') {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [unauthorizedError, setUnauthorizedError] = useState('');

  // Persist admin session
  useEffect(() => {
    try {
      if (profile && profile.role === 'admin' && profile.email?.toLowerCase() === 'rajsrmap2@gmail.com') {
        localStorage.setItem('cb_admin_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('cb_admin_profile');
      }
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  // Initial Supabase Session Check
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await verifyAndSetAdmin(session.user);
        }
      } catch (err) {
        console.warn('Admin session check error:', err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await verifyAndSetAdmin(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Strict verification: User MUST have role = 'admin' in profiles table
  const verifyAndSetAdmin = async (authUser) => {
    if (!supabase) return false;

    try {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !userProfile) {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setUnauthorizedError('Unauthorized access. Only registered Campus Administrators can access this portal.');
        return false;
      }

      if (userProfile.role !== 'admin' || userProfile.email?.toLowerCase() !== 'rajsrmap2@gmail.com') {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setUnauthorizedError('Unauthorized access. Access restricted to authorized administrator account.');
        return false;
      }

      // Valid Admin
      setUser(authUser);
      setProfile(userProfile);
      setUnauthorizedError('');
      return true;
    } catch (err) {
      setUnauthorizedError('Failed to verify administrator credentials.');
      return false;
    }
  };

  // Strict Admin Login (rajsrmap2@gmail.com & Snehith@007)
  const loginAdmin = async (email, password) => {
    setUnauthorizedError('');

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPassword = password ? password.trim() : '';

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please enter both admin email and password.' };
    }

    // 1. Authenticate via Backend API
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setProfile(data.user);
        setUser({ id: data.user.id, email: data.user.email });
        setUnauthorizedError('');
        try {
          localStorage.setItem('cb_admin_profile', JSON.stringify(data.user));
        } catch {}
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || 'Invalid administrator credentials. Access restricted to authorized campus admin.'
        };
      }
    } catch (apiErr) {
      // Direct credential fallback check
      if (cleanEmail === 'rajsrmap2@gmail.com' && cleanPassword === 'Snehith@007') {
        const adminProfile = {
          id: 'admin-snehith',
          name: 'Gaddam Snehithraj (Super Admin)',
          email: 'rajsrmap2@gmail.com',
          role: 'admin',
          created_at: new Date().toISOString()
        };
        setProfile(adminProfile);
        setUser({ id: adminProfile.id, email: adminProfile.email });
        setUnauthorizedError('');
        try {
          localStorage.setItem('cb_admin_profile', JSON.stringify(adminProfile));
        } catch {}
        return { success: true };
      }

      return {
        success: false,
        error: 'Invalid administrator credentials. Access restricted to authorized campus admin.'
      };
    }
  };

  // Logout
  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {}
    }
    setUser(null);
    setProfile(null);
    setUnauthorizedError('');
    try {
      localStorage.removeItem('cb_admin_profile');
    } catch {}
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: Boolean(profile && profile.role === 'admin' && profile.email?.toLowerCase() === 'rajsrmap2@gmail.com'),
        unauthorizedError,
        setUnauthorizedError,
        loginAdmin,
        logout,
        isConfigured: isSupabaseConfigured()
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
