import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { isSupabaseReady } from '../lib/supabase';

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
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized) return;
    if (!isSupabaseReady) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    const initAuth = async () => {
      try {
        // Clear any previous auth errors
        setAuthError(null);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Verify admin status
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (adminData) {
            setUserState(session.user);
            setAdminData(adminData);
          }
        } else {
          // No session found, ensure clean state
          setUserState(null);
          setAdminData(null);
        }
      } catch (error) {
        console.warn('Auth initialization error:', error);
        
        // Handle specific refresh token errors
        if (error instanceof Error && error.message.includes('refresh_token_not_found')) {
          console.log('Invalid refresh token detected, clearing session...');
          await supabase.auth.signOut();
          setUserState(null);
          setAdminData(null);
          setAuthError('Sessão expirada. Faça login novamente.');
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, [initialized]);

  // Auth state change listener
  useEffect(() => {
    if (!initialized) return;
    if (!isSupabaseReady) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        
        if (event === 'SIGNED_OUT') {
          setUserState(null);
          setAdminData(null);
          setAuthError(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Verify admin status on sign in
          try {
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (adminData) {
              setUserState(session.user);
              setAdminData(adminData);
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initialized]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserState(null);
      setAdminData(null);
      setAuthError(null);
      
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const setUser = (user: User | null, adminData?: any) => {
    setUserState(user);
    setAdminData(adminData || null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ user, adminData, loading, signOut, setUser, authError }}>
      {children}
    </AuthContext.Provider>
  );
};