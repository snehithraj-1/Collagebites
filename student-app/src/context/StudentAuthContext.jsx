import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const StudentAuthContext = createContext(null);

export function StudentAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_student_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync profile to localStorage for persistence
  useEffect(() => {
    try {
      if (profile) {
        localStorage.setItem('cb_student_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('cb_student_profile');
      }
    } catch (err) {
      console.error(err);
    }
  }, [profile]);

  // Listen to live Supabase Auth state changes if configured
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.warn('[Supabase Auth] Session fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch or create profile from Supabase
  const fetchProfile = async (userId) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data);
        return data;
      }
    } catch (err) {
      console.warn('[Supabase Profile] Fetch error:', err);
    }
    return null;
  };

  // 1. Send Email OTP
  const sendEmailOtp = async (email, name = '', studentId = '') => {
    if (!isSupabaseConfigured() || !supabase) {
      // In demo mode without keys, simulate instant OTP dispatch
      return { success: true, isDemo: true };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          data: {
            name: name.trim() || splitEmailName(email),
            student_id: studentId.trim() || null,
            role: 'student'
          }
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('[Supabase OTP Send Error]:', err);
      return { success: false, error: err.message };
    }
  };

  // 2. Verify Email OTP
  const verifyEmailOtp = async (email, token, name = '', studentId = '') => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode OTP verification (accepts 123456 or any 6 digits)
      const mockProfile = {
        id: 'demo-student-' + Math.random().toString(36).substring(2, 9),
        name: name.trim() || splitEmailName(cleanEmail),
        email: cleanEmail,
        student_id: studentId.trim() || 'SRMAP-2024',
        role: 'student',
        created_at: new Date().toISOString()
      };
      setProfile(mockProfile);
      setUser({ id: mockProfile.id, email: mockProfile.email });
      return { success: true, profile: mockProfile };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: token.trim(),
        type: 'email'
      });

      if (error) throw error;

      if (data?.user) {
        const studentProfile = {
          id: data.user.id,
          name: name.trim() || data.user.user_metadata?.name || splitEmailName(cleanEmail),
          email: cleanEmail,
          student_id: studentId.trim() || data.user.user_metadata?.student_id || null,
          role: 'student'
        };

        // Upsert profile in Supabase
        await supabase.from('profiles').upsert(studentProfile);

        setUser(data.user);
        setProfile(studentProfile);
        return { success: true, profile: studentProfile };
      }

      return { success: false, error: 'No user session returned' };
    } catch (err) {
      console.error('[Supabase OTP Verify Error]:', err);
      return { success: false, error: err.message };
    }
  };

  // Demo Login helper
  const demoLogin = (name = 'Aryan Sharma', email = 'aryan.srm@example.com', studentId = 'AP23110010482') => {
    const demoProfile = {
      id: 'demo-student-id-01',
      name,
      email,
      student_id: studentId,
      role: 'student',
      created_at: new Date().toISOString()
    };
    setProfile(demoProfile);
    setUser({ id: demoProfile.id, email: demoProfile.email });
  };

  // Sign out
  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn(err);
      }
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <StudentAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: Boolean(profile && profile.role === 'student'),
        sendEmailOtp,
        verifyEmailOtp,
        demoLogin,
        logout,
        isConfigured: isSupabaseConfigured()
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within StudentAuthProvider');
  }
  return context;
}

function splitEmailName(email) {
  if (!email) return 'Student';
  const namePart = email.split('@')[0].replace(/[._]/g, ' ');
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}
