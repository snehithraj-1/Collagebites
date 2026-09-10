// shared/src/lib/authGuard.jsx
/**
 * AuthGuard component to protect routes based on Supabase session and user role.
 * Wrap your app's router with this component to enforce role-based navigation.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

export const AuthGuard = ({ requiredRole, children }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      setSession(supabaseSession);
    });
    // Initial check
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // When session changes, fetch profile (including role)
  useEffect(() => {
    if (!session) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, restaurant_id')
        .eq('id', session.user.id)
        .single();
      if (error) {
        console.error('Failed to load profile', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [session]);

  // Redirect logic based on role
  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }
    if (requiredRole && profile?.role !== requiredRole) {
      // If user role doesn't match, send them to their appropriate root
      switch (profile?.role) {
        case 'student':
          navigate('/student', { replace: true });
          break;
        case 'restaurant_admin':
          navigate('/admin', { replace: true });
          break;
        case 'delivery_partner':
          navigate('/delivery', { replace: true });
          break;
        case 'super_admin':
          navigate('/admin', { replace: true });
          break;
        default:
          navigate('/login', { replace: true });
      }
    }
  }, [loading, session, profile, requiredRole, navigate]);

  if (loading) {
    // Simple loading placeholder – can be replaced with a spinner from shared UI.
    return <div className= flex h-screen items-center justify-center>Loading…</div>;
  }

  // If we have a requiredRole and it matches, render children; otherwise, children are rendered after redirect.
  return <>{children}</>;
};
