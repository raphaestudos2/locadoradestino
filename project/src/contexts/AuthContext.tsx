import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  adminData: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: User | null, adminData?: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey || 
            supabaseUrl === 'your_supabase_url_here' || 
            supabaseAnonKey === 'your_supabase_anon_key_here') {
          console.log('Supabase not configured, skipping auth');
          if (mounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Error getting session:', error);
          if (mounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        if (session?.user && mounted) {
          await handleUserSession(session.user);
        }
      } catch (error) {
        console.warn('Supabase auth error:', error);
      }
      
      if (mounted) {
        setLoading(false);
        setInitialized(true);
      }
    };

    const handleUserSession = async (sessionUser: User) => {
      try {
        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', sessionUser.id)
          .maybeSingle();
        
        if (adminError) {
          console.warn('Error checking admin status:', adminError);
          return;
        }
        
        if (!adminData) {
          // User is not an admin, sign them out
          console.log('User is not an admin, signing out');
          await supabase.auth.signOut();
          return;
        }
        
        if (mounted) {
          setUserState(sessionUser);
          setAdminData(adminData);
        }
      } catch (error) {
        console.warn('Error handling user session:', error);
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.warn('Error signing out:', signOutError);
        }
      }
    };

    // Only initialize once
    if (!initialized) {
      initializeAuth();
    }

    // Listen for auth changes only after initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted || !initialized) return;

        try {
          if (session?.user) {
            await handleUserSession(session.user);
          } else if (mounted) {
            setUserState(null);
            setAdminData(null);
          }
        } catch (error) {
          console.warn('Auth state change error:', error);
          if (mounted) {
            setUserState(null);
            setAdminData(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]); // Only depend on initialized to prevent loops

  // Activity tracking to prevent auto-logout
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserState(null);
      setAdminData(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const setUser = (user: User | null, adminData?: any) => {
    setUserState(user);
    setAdminData(adminData || null);
  };

  const value = {
    user,
    adminData,
    loading,
    signOut,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};