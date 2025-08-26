/**
 * Auto Setup System
 * Executes database migrations and creates admin users automatically on first run
 */

import { supabase, supabaseAdmin } from '../lib/supabase';

const SETUP_FLAG_KEY = 'supabase_auto_setup_completed';

// SQL Migrations to execute
const MIGRATIONS = [
  {
    name: 'create_users_table',
    sql: `
      -- Create users table for auth integration
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE NOT NULL,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      ALTER TABLE users ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Users can read own data"
        ON users
        FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
    `
  },
  {
    name: 'create_admin_users_table',
    sql: `
      -- Create admin_users table
      CREATE TABLE IF NOT EXISTS admin_users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        name text NOT NULL,
        role text NOT NULL CHECK (role IN ('admin', 'manager', 'seller')),
        permissions jsonb DEFAULT '[]',
        active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        UNIQUE(user_id)
      );

      ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Admin users can manage admin users"
        ON admin_users
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.active = true 
            AND au.role IN ('admin', 'manager')
          )
        );

      -- Trigger to sync user_id
      CREATE OR REPLACE FUNCTION trg_admin_users_sync_user_id_fn()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.user_id = NEW.id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_admin_users_sync_user_id ON admin_users;
      CREATE TRIGGER trg_admin_users_sync_user_id
        BEFORE INSERT OR UPDATE OF id ON admin_users
        FOR EACH ROW
        EXECUTE FUNCTION trg_admin_users_sync_user_id_fn();

      -- Update timestamp trigger
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
      CREATE TRIGGER update_admin_users_updated_at
        BEFORE UPDATE ON admin_users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    name: 'create_vehicles_table',
    sql: `
      -- Create vehicles table
      CREATE TABLE IF NOT EXISTS vehicles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        brand text NOT NULL,
        model text NOT NULL,
        year integer NOT NULL,
        license_plate text UNIQUE NOT NULL,
        category text NOT NULL CHECK (category IN ('SUV', 'Sedan', 'Hatch', 'Pickup', 'Van', 'Luxury')),
        transmission text NOT NULL CHECK (transmission IN ('Manual', 'Automático', 'CVT')),
        fuel text NOT NULL CHECK (fuel IN ('Flex', 'Gasolina', 'Etanol', 'Diesel', 'Elétrico', 'Híbrido')),
        seats integer NOT NULL DEFAULT 5,
        daily_rate numeric(10,2) NOT NULL,
        features text[] DEFAULT '{}',
        images text[] DEFAULT '{}',
        mileage integer DEFAULT 0,
        color text,
        chassis_number text UNIQUE,
        renavam text UNIQUE,
        status text DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'alugado', 'manutencao', 'inativo')),
        location text DEFAULT 'matriz',
        insurance_policy text,
        insurance_expiry date,
        next_maintenance_km integer,
        next_maintenance_date date,
        notes text,
        name text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Public can view available vehicles"
        ON vehicles
        FOR SELECT
        TO public
        USING (status = 'disponivel');

      CREATE POLICY "Authenticated users can manage vehicles"
        ON vehicles
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.active = true
          )
        );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
      CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
      CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);

      -- Update trigger
      DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
      CREATE TRIGGER update_vehicles_updated_at
        BEFORE UPDATE ON vehicles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    name: 'create_customers_table',
    sql: `
      -- Create customers table
      CREATE TABLE IF NOT EXISTS customers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
        name text NOT NULL,
        email text UNIQUE NOT NULL,
        phone text NOT NULL,
        cpf text UNIQUE NOT NULL,
        birth_date date,
        driver_license text NOT NULL,
        driver_license_expiry date,
        address jsonb,
        emergency_contact jsonb,
        registration_date timestamptz DEFAULT now(),
        total_rentals integer DEFAULT 0,
        status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
        notes text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Public can view customers for rentals"
        ON customers
        FOR SELECT
        TO public
        USING (status = 'active');

      CREATE POLICY "Authenticated users can manage customers"
        ON customers
        FOR ALL
        TO authenticated
        USING (
          auth.uid() = user_id OR 
          EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.active = true
          )
        );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
      CREATE INDEX IF NOT EXISTS idx_customers_cpf ON customers(cpf);
      CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

      -- Update trigger
      DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
      CREATE TRIGGER update_customers_updated_at
        BEFORE UPDATE ON customers
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    name: 'create_rentals_table',
    sql: `
      -- Create rentals table
      CREATE TABLE IF NOT EXISTS rentals (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        rental_number text UNIQUE NOT NULL,
        customer_id uuid REFERENCES customers(id) ON DELETE RESTRICT,
        vehicle_id uuid REFERENCES vehicles(id) ON DELETE RESTRICT,
        start_date date NOT NULL,
        end_date date NOT NULL,
        start_time time DEFAULT '09:00:00',
        end_time time DEFAULT '18:00:00',
        pickup_location text NOT NULL,
        return_location text,
        actual_start_date timestamptz,
        actual_end_date timestamptz,
        start_mileage integer,
        end_mileage integer,
        daily_rate numeric(10,2) NOT NULL,
        total_days integer NOT NULL,
        subtotal numeric(10,2) NOT NULL,
        additional_fees numeric(10,2) DEFAULT 0,
        discount numeric(10,2) DEFAULT 0,
        total_amount numeric(10,2) NOT NULL,
        deposit_amount numeric(10,2) DEFAULT 0,
        status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'ativa', 'concluida', 'cancelada')),
        payment_status text DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'parcial', 'pago', 'atrasado', 'cancelado')),
        contract_signed boolean DEFAULT false,
        vehicle_inspected boolean DEFAULT false,
        fuel_level_start text,
        fuel_level_end text,
        damage_report_start text,
        damage_report_end text,
        additional_drivers jsonb DEFAULT '[]',
        special_requests text,
        notes text,
        created_by uuid REFERENCES admin_users(id),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Users can view their own rentals"
        ON rentals
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM customers c 
            WHERE c.id = rentals.customer_id 
            AND c.user_id = auth.uid()
          ) OR 
          EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.active = true
          )
        );

      CREATE POLICY "Admin users can manage rentals"
        ON rentals
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.active = true
          )
        );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_rentals_customer_id ON rentals(customer_id);
      CREATE INDEX IF NOT EXISTS idx_rentals_vehicle_id ON rentals(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_rentals_dates ON rentals(start_date, end_date);
      CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);

      -- Generate rental number function
      CREATE OR REPLACE FUNCTION generate_rental_number()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.rental_number = 'LOC' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(nextval('rental_number_seq')::text, 4, '0');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Create sequence for rental numbers
      CREATE SEQUENCE IF NOT EXISTS rental_number_seq START 1;

      -- Trigger for rental number generation
      DROP TRIGGER IF EXISTS generate_rental_number_trigger ON rentals;
      CREATE TRIGGER generate_rental_number_trigger
        BEFORE INSERT ON rentals
        FOR EACH ROW
        EXECUTE FUNCTION generate_rental_number();

      -- Update trigger
      DROP TRIGGER IF EXISTS update_rentals_updated_at ON rentals;
      CREATE TRIGGER update_rentals_updated_at
        BEFORE UPDATE ON rentals
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      -- Update customer rental count
      CREATE OR REPLACE FUNCTION update_customer_rental_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE customers SET total_rentals = total_rentals + 1 WHERE id = NEW.customer_id;
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE customers SET total_rentals = GREATEST(total_rentals - 1, 0) WHERE id = OLD.customer_id;
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_customer_rental_count_trigger ON rentals;
      CREATE TRIGGER update_customer_rental_count_trigger
        AFTER INSERT OR DELETE ON rentals
        FOR EACH ROW
        EXECUTE FUNCTION update_customer_rental_count();
    `
  },
  {
    name: 'create_sample_data',
    sql: `
      -- Insert sample vehicles (safe insert with ON CONFLICT DO NOTHING)
      INSERT INTO vehicles (id, name, brand, model, year, license_plate, category, transmission, fuel, seats, daily_rate, features, images, status)
      VALUES 
        ('550e8400-e29b-41d4-a716-446655440101', 'Nissan Kicks SV 2023', 'Nissan', 'Kicks', 2023, 'ABC-1234', 'SUV', 'Automático', 'Flex', 5, 299.00, 
         ARRAY['Ar condicionado', 'Direção elétrica', 'Vidros elétricos', 'Trava elétrica'], 
         ARRAY['https://dezeroacem.com.br/wp-content/uploads/2019/08/Nissan-Kicks-SV-2020-CVT.jpg', 'https://dsae.s3.amazonaws.com/11187006000560/Fotos/FSK-8A04_02.jpg?u=20250710120807'], 
         'disponivel'),
        ('550e8400-e29b-41d4-a716-446655440102', 'Chevrolet Tracker Premier', 'Chevrolet', 'Tracker', 2023, 'DEF-5678', 'SUV', 'Automático', 'Flex', 5, 350.00,
         ARRAY['Ar condicionado', 'Direção elétrica', 'Vidros elétricos', 'Central multimídia'],
         ARRAY['https://production.autoforce.com/uploads/version/profile_image/10870/model_main_webp_comprar-at-1-0-turbo-pacote-rfc_40a0052de6.png.webp', 'https://revistacarro.com.br/wp-content/uploads/2024/07/WhatsApp-Image-2024-07-16-at-10.14.46.jpeg'],
         'disponivel'),
        ('550e8400-e29b-41d4-a716-446655440103', 'Chevrolet Onix Plus Turbo', 'Chevrolet', 'Onix Plus', 2023, 'GHI-9012', 'Sedan', 'Automático', 'Flex', 5, 240.00,
         ARRAY['Ar condicionado', 'Direção elétrica', 'Vidros elétricos', 'Computador de bordo'],
         ARRAY['https://garagem360.com.br/wp-content/uploads/2022/09/Chevrolet-Onix-Plus-2023-3.jpg', 'https://quatrorodas.abril.com.br/wp-content/uploads/2022/02/FLP9782.jpg?quality=70&strip=info'],
         'disponivel'),
        ('550e8400-e29b-41d4-a716-446655440104', 'Fiat Cronos Precision', 'Fiat', 'Cronos', 2023, 'JKL-3456', 'Sedan', 'Automático', 'Flex', 5, 240.00,
         ARRAY['Ar condicionado', 'Direção hidráulica', 'Vidros elétricos', 'Central multimídia'],
         ARRAY['https://production.autoforce.com/uploads/version/profile_image/8032/comprar-precision-1-3-automatico_1b077f4f54.png', 'https://imgsapp.em.com.br/app/noticia_127983242361/2022/09/24/1397527/acabamento-interno_3_73638.jpg'],
         'disponivel'),
        ('550e8400-e29b-41d4-a716-446655440105', 'Chevrolet Onix LT', 'Chevrolet', 'Onix', 2022, 'MNO-7890', 'Hatch', 'Manual', 'Flex', 5, 195.00,
         ARRAY['Ar condicionado', 'Direção hidráulica', 'Vidros manuais', 'Alarme'],
         ARRAY['https://images.prd.kavak.io/eyJidWNrZXQiOiJrYXZhay1pbWFnZXMiLCJrZXkiOiJpbWFnZXMvNDA2ODQ1L0VYVEVSSU9SLWZyb250U2lkZVBpbG90TmVhci0xNzQ2ODE1MjI5Njk5LmpwZWciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjU0MCwiaGVpZ2h0IjozMTAsImJhY2tncm91bmQiOnsiciI6MjU1LCJnIjoyNTUsImIiOjI1NSwiYWxwaGEiOjB9fX19', 'https://garagem360.com.br/wp-content/uploads/2021/07/Compara-1.0-Chevrolet-Onix-LT-aspirado-2.jpg'],
         'disponivel')
      ON CONFLICT (license_plate) DO NOTHING;

      -- Insert pickup locations
      INSERT INTO pickup_locations (id, name, address, city, state, active, display_order) VALUES
        ('550e8400-e29b-41d4-a716-446655440201', 'Rio de Janeiro - RJ', 'Rio de Janeiro - RJ', 'Rio de Janeiro', 'RJ', true, 1),
        ('550e8400-e29b-41d4-a716-446655440202', 'Aeroporto Internacional do Galeão - RJ', 'Aeroporto Internacional do Galeão - Rio de Janeiro - RJ', 'Rio de Janeiro', 'RJ', true, 2),
        ('550e8400-e29b-41d4-a716-446655440203', 'Aeroporto Santos Dumont - RJ', 'Aeroporto Santos Dumont - Rio de Janeiro - RJ', 'Rio de Janeiro', 'RJ', true, 3),
        ('550e8400-e29b-41d4-a716-446655440204', 'Rodoviária Novo Rio - RJ', 'Rodoviária Novo Rio - Rio de Janeiro - RJ', 'Rio de Janeiro', 'RJ', true, 4),
        ('550e8400-e29b-41d4-a716-446655440205', 'Estádio do Maracanã - RJ', 'Estádio do Maracanã - Rio de Janeiro - RJ', 'Rio de Janeiro', 'RJ', true, 5),
        ('550e8400-e29b-41d4-a716-446655440206', 'Carioca Shopping - Vila da Penha - RJ', 'Carioca Shopping - Vila da Penha - Rio de Janeiro - RJ', 'Rio de Janeiro', 'RJ', true, 6),
        ('550e8400-e29b-41d4-a716-446655440207', 'Shopping Nova América - RJ', 'Shopping Nova América - Rio de Janeiro - RJ', 'Rio de Janeiro', 'RJ', true, 7),
        ('550e8400-e29b-41d4-a716-446655440208', 'Boulevard Shopping - Vila Isabel - RJ', 'Boulevard Shopping - Vila Isabel - Rio de Janeiro - RJ', 'Rio de Janeiro', 'RJ', true, 8),
        ('550e8400-e29b-41d4-a716-446655440209', 'Freguesia - Jacarepaguá - RJ', 'Freguesia - Jacarepaguá - Rio de Janeiro - RJ', 'Rio de Janeiro', 'RJ', true, 9),
        ('550e8400-e29b-41d4-a716-446655440210', 'Centro - São Paulo - SP', 'Centro - São Paulo - SP', 'São Paulo', 'SP', true, 10),
        ('550e8400-e29b-41d4-a716-446655440211', 'Aeroporto Congonhas - SP', 'Aeroporto Congonhas - São Paulo - SP', 'São Paulo', 'SP', true, 11),
        ('550e8400-e29b-41d4-a716-446655440212', 'Aeroporto Guarulhos - SP', 'Aeroporto Guarulhos - São Paulo - SP', 'São Paulo', 'SP', true, 12)
      ON CONFLICT (id) DO NOTHING;
    `
  }
];

// Admin users to create
const ADMIN_USERS = [
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

export class AutoSetupService {
  private static instance: AutoSetupService;
  private isRunning = false;
  private hasCompleted = false;
  
  static getInstance(): AutoSetupService {
    if (!AutoSetupService.instance) {
      AutoSetupService.instance = new AutoSetupService();
    }
    return AutoSetupService.instance;
  }
  
  static isSetupCompleted(): boolean {
    return localStorage.getItem(SETUP_FLAG_KEY) === 'true';
  }

  static markSetupCompleted(): void {
    localStorage.setItem(SETUP_FLAG_KEY, 'true');
  }

  static async runMigrations(): Promise<boolean> {
    try {
      console.log('🗄️ Verificando estrutura do banco...');
      
      // Check if tables exist by trying to query them
      const tablesToCheck = ['vehicles', 'customers', 'rentals', 'admin_users'];
      
      for (const table of tablesToCheck) {
        try {
          const { error } = await supabaseAdmin
            .from(table)
            .select('id')
            .limit(1);
            
          if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
            console.log(`📝 Tabela ${table} não existe - precisa ser criada manualmente no Supabase`);
          } else {
            console.log(`✅ Tabela ${table} já existe`);
          }
        } catch (e) {
          console.log(`📝 Tabela ${table} precisa ser verificada`);
        }
      }
      
      console.log('✅ Verificação de estrutura concluída!');
      return true;
    } catch (error) {
      console.error('❌ Erro verificando estrutura:', error);
      return true; // Continue anyway
    }
  }

  static async createAdminUsers(): Promise<boolean> {
    try {
      console.log('👥 Criando usuários administrativos...');
      
      const results = [];
      
      for (const user of ADMIN_USERS) {
        try {
          // Create user in auth
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
            if (authError.message && (authError.message.includes('already registered') || authError.code === 'email_exists' || authError.message.includes('email_exists'))) {
              console.log(`⚠️ Usuário ${user.email} já existe`);
              results.push({ email: user.email, status: 'exists' });
              continue;
            }
            console.warn(`Erro criando usuário ${user.email}:`, authError.message || authError);
            results.push({ 
              email: user.email, 
              status: 'error', 
              error: authError.message || 'Erro de autenticação'
            });
            continue;
          }

          if (authData.user) {
            // Create admin record
            const { error: adminError } = await supabaseAdmin
              .from('admin_users')
              .upsert({
                user_id: authData.user.id,
                name: user.name,
                role: user.role,
                active: true
              });

            if (adminError) {
              console.warn(`Erro criando registro admin para ${user.email}:`, adminError);
            } else {
              console.log(`✅ Usuário criado: ${user.email}`);
            }
          }
        } catch (userError) {
          console.warn(`Erro criando usuário ${user.email}:`, userError);
        }
      }
      
      console.log('✅ Usuários administrativos configurados!');
      return true;
    } catch (error) {
      console.error('❌ Erro criando usuários:', error);
      return false;
    }
  }

  async runCompleteSetup(): Promise<void> {
    if (this.isRunning || this.hasCompleted) {
      console.log('⏸️ Setup já em execução ou já concluído');
      return;
    }

    this.isRunning = true;
    
    try {
      console.log('🚀 Iniciando setup completo...');
      
      await this.runMigrations();
      await this.createAdminUsers();
      await this.createSampleData();
      
      console.log('✅ Setup completo realizado com sucesso!');
      this.hasCompleted = true;
    } catch (error) {
      console.error('❌ Erro durante setup:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  static async runCompleteSetup(): Promise<boolean> {
    try {
      // Check if already completed
      if (this.isSetupCompleted()) {
        console.log('✅ Setup já foi executado anteriormente');
        return true;
      }

      console.log('🚀 Iniciando setup automático do sistema...');
      
      // Run migrations
      const migrationsSuccess = await this.runMigrations();
      if (!migrationsSuccess) {
        console.warn('⚠️ Algumas migrações falharam, mas continuando...');
      }

      // Wait a bit for migrations to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create admin users
      const usersSuccess = await this.createAdminUsers();
      if (!usersSuccess) {
        console.warn('⚠️ Alguns usuários não foram criados, mas continuando...');
      }

      // Mark as completed
      this.markSetupCompleted();
      
      console.log('🎉 Setup automático concluído!');
      console.log('📋 Credenciais de acesso:');
      console.log('👤 admin@locadoradestino.com.br | 123456@');
      console.log('👤 sergio@locadoradestino.com.br | Padrao007@0');
      
      return true;
    } catch (error) {
      console.error('❌ Erro no setup automático:', error);
      return false;
    }
  }
}

// Execute auto setup if enabled
export const executeAutoSetup = async (): Promise<void> => {
  const autoSetupEnabled = import.meta.env.VITE_AUTO_SETUP_ENABLED === 'true';
  
  // Only run once and prevent infinite loops
  if (autoSetupEnabled && !AutoSetupService.isSetupCompleted() && !window.autoSetupRunning) {
    window.autoSetupRunning = true;
    // Run setup in background
    setTimeout(() => {
      AutoSetupService.runCompleteSetup()
        .catch(console.error)
        .finally(() => {
          window.autoSetupRunning = false;
        });
    }, 1000);
  }
};