import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl !== 'your_supabase_url_here' && 
         supabaseAnonKey !== 'your_supabase_anon_key_here' &&
         supabaseUrl.startsWith('https://') &&
         supabaseAnonKey.length > 20;
};

// Create a simple mock client that doesn't interfere with auth flows
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: (callback: any) => {
      // Return a subscription that does nothing
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    admin: {
      createUser: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    delete: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
    eq: function() { return this; },
    single: function() { return this; },
    order: function() { return this; },
    limit: function() { return this; },
    gte: function() { return this; },
    or: function() { return this; },
    in: function() { return this; },
    maybeSingle: function() { return this; }
  })
});

// Initialize Supabase client
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any;

// Initialize Supabase admin client (for server-side operations)
export const supabaseAdmin = isSupabaseConfigured() && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createMockClient() as any;

// Export configuration status
export const isSupabaseReady = isSupabaseConfigured();

// Function to create admin users programmatically
export const createAdminUsers = async () => {
  if (!isSupabaseConfigured() || !supabaseServiceKey) {
    throw new Error('Supabase não está configurado. Configure as variáveis de ambiente primeiro.');
  }

  const adminUsers = [
    {
      email: 'admin@locadoradestino.com.br',
      password: '123456@',
      name: 'Administrador Principal',
      role: 'admin'
    },
    {
      email: 'sergio@locadoradestino.com.br',
      password: 'Padrao007@0',
      name: 'Sergio Vendedor', 
      role: 'admin'
    }
  ];

  const results = [];

  for (const user of adminUsers) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`User ${user.email} already exists`);
          results.push({ email: user.email, status: 'exists' });
          continue;
        }
        throw authError;
      }

      if (authData.user) {
        // Create corresponding record in admin_users table
        const { error: adminError } = await supabaseAdmin
          .from('admin_users')
          .upsert({
            user_id: authData.user.id,
            name: user.name,
            role: user.role,
            active: true
          });

        if (adminError) {
          console.error('Error creating admin record:', adminError);
        }

        results.push({ 
          email: user.email, 
          status: 'created',
          id: authData.user.id 
        });
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error.message || error);
      results.push({ 
        email: user.email, 
        status: 'error', 
        error: error.message || 'Unknown error'
      });
    }
  }

  return results;
};

// Database types
export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string;
          brand: string;
          model: string;
          year: number;
          license_plate: string;
          category: string;
          transmission: string;
          fuel: string;
          seats: number;
          daily_rate: number;
          features: string[];
          images: string[];
          mileage: number;
          color: string;
          chassis_number: string;
          renavam: string;
          status: string;
          location: string;
          insurance_policy: string;
          insurance_expiry: string;
          next_maintenance_km: number;
          next_maintenance_date: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand: string;
          model: string;
          year: number;
          license_plate: string;
          category: string;
          transmission: string;
          fuel: string;
          seats: number;
          daily_rate: number;
          features: string[];
          images: string[];
          mileage?: number;
          color?: string;
          chassis_number?: string;
          renavam?: string;
          status?: string;
          location?: string;
          insurance_policy?: string;
          insurance_expiry?: string;
          next_maintenance_km?: number;
          next_maintenance_date?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brand?: string;
          model?: string;
          year?: number;
          license_plate?: string;
          category?: string;
          transmission?: string;
          fuel?: string;
          seats?: number;
          daily_rate?: number;
          features?: string[];
          images?: string[];
          mileage?: number;
          color?: string;
          chassis_number?: string;
          renavam?: string;
          status?: string;
          location?: string;
          insurance_policy?: string;
          insurance_expiry?: string;
          next_maintenance_km?: number;
          next_maintenance_date?: string;
          notes?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          cpf: string;
          cnh: string;
          address: string | null;
          registration_date: string;
          total_rentals: number;
          status: 'active' | 'inactive' | 'blocked';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          cpf: string;
          cnh: string;
          address?: string | null;
          registration_date?: string;
          total_rentals?: number;
          status?: 'active' | 'inactive' | 'blocked';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          cpf?: string;
          cnh?: string;
          address?: string | null;
          registration_date?: string;
          total_rentals?: number;
          status?: 'active' | 'inactive' | 'blocked';
          updated_at?: string;
        };
      };
      rentals: {
        Row: {
          id: string;
          customer_id: string;
          vehicle_id: string;
          pickup_date: string;
          return_date: string;
          pickup_time: string;
          return_time: string;
          pickup_location: string;
          actual_return_date: string | null;
          status: 'pending' | 'active' | 'completed' | 'cancelled';
          total_amount: number;
          payment_status: 'pending' | 'paid' | 'overdue';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          vehicle_id: string;
          pickup_date: string;
          return_date: string;
          pickup_time: string;
          return_time: string;
          pickup_location: string;
          actual_return_date?: string | null;
          status?: 'pending' | 'active' | 'completed' | 'cancelled';
          total_amount: number;
          payment_status?: 'pending' | 'paid' | 'overdue';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          vehicle_id?: string;
          pickup_date?: string;
          return_date?: string;
          pickup_time?: string;
          return_time?: string;
          pickup_location?: string;
          actual_return_date?: string | null;
          status?: 'pending' | 'active' | 'completed' | 'cancelled';
          total_amount?: number;
          payment_status?: 'pending' | 'paid' | 'overdue';
          notes?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}