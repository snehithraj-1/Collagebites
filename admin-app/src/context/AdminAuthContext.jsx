import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_admin_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [unauthorizedError, setUnauthorizedError] = useState('');

  // Persist admin session
  useEffect(() => {
    try {
      if (profile && profile.role === 'admin') {
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
        // Not found or student
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setUnauthorizedError('Unauthorized access. Only registered Campus Administrators can access this portal.');
        return false;
      }

      if (userProfile.role !== 'admin') {
        // Reject Student accounts trying to access Admin Portal
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setUnauthorizedError('Unauthorized access. Your account does not have administrator privileges.');
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

  // Login with Email & Password in Supabase
  const loginAdmin = async (email, password) => {
    setUnauthorizedError('');

    if (!isSupabaseConfigured() || !supabase) {
      // Demo Mode login check
      if (password === 'admin123' || password === 'clgbites@admin2024' || email.includes('admin')) {
        const demoAdminProfile = {
          id: 'admin-master-id',
          name: 'Campus Operations Manager',
          email: email || 'admin@srmap.edu.in',
          role: 'admin',
          created_at: new Date().toISOString()
        };
        setProfile(demoAdminProfile);
        setUser({ id: demoAdminProfile.id, email: demoAdminProfile.email });
        return { success: true };
      } else {
        return { success: false, error: 'Invalid administrator password. (Hint: admin123)' };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) throw error;

      const isValidAdmin = await verifyAndSetAdmin(data.user);
      if (!isValidAdmin) {
        return { success: false, error: 'Unauthorized access. Only administrator accounts are permitted.' };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  };

  // Demo Admin Login helper
  const demoAdminLogin = () => {
    const demoAdminProfile = {
      id: 'admin-master-id',
      name: 'Campus Operations Director',
      email: 'admin.director@srmap.edu.in',
      role: 'admin',
      created_at: new Date().toISOString()
    };
    setProfile(demoAdminProfile);
    setUser({ id: demoAdminProfile.id, email: demoAdminProfile.email });
    setUnauthorizedError('');
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
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: Boolean(profile && profile.role === 'admin'),
        unauthorizedError,
        setUnauthorizedError,
        loginAdmin,
        demoAdminLogin,
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
