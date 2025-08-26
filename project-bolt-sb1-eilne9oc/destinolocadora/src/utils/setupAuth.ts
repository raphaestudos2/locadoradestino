/**
 * Authentication setup utilities
 * This file contains functions to set up the authentication system
 */

import { supabase, createAdminUsers } from '../lib/supabase';

export interface SetupResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Complete authentication setup
 * Creates admin users and verifies the setup
 */
export const setupAuthentication = async (): Promise<SetupResult> => {
  try {
    console.log('🔧 Iniciando configuração de autenticação...');
    
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'your_supabase_url_here' || 
        supabaseAnonKey === 'your_supabase_anon_key_here') {
      return {
        success: false,
        message: 'Supabase não está configurado. Verifique as variáveis de ambiente.'
      };
    }
    
    if (!supabaseServiceKey || supabaseServiceKey === 'your_supabase_service_role_key_here') {
      return {
        success: false,
        message: 'Service Role Key não configurada. Configure VITE_SUPABASE_SERVICE_ROLE_KEY no arquivo .env para criar usuários administrativos.'
      };
    }

    // Create admin users
    console.log('👥 Criando usuários administrativos...');
    const results = await createAdminUsers();
    
    return {
      success: true,
      message: `Configuração concluída! ${results.length} usuários processados.`,
      details: {
        results
      }
    };
    
  } catch (error) {
    console.error('Erro na configuração:', error);
    return {
      success: false,
      message: 'Erro inesperado: ' + (error as Error).message
    };
  }
};

/**
 * Verify if authentication is properly set up
 */
export const verifyAuthSetup = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .gte('count', 1);
      
    return !error && data && data.length > 0;
  } catch {
    return false;
  }
};

/**
 * Test login with admin credentials
 */
export const testAdminLogin = async (): Promise<SetupResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@locadoradestino.com.br',
      password: '123456@'
    });
    
    if (error) {
      return {
        success: false,
        message: 'Falha no teste de login: ' + error.message
      };
    }
    
    // Sign out after test
    await supabase.auth.signOut();
    
    return {
      success: true,
      message: 'Login de teste bem-sucedido!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro no teste: ' + (error as Error).message
    };
  }
};