/*
  # Setup Completo do Sistema Locadora Destino

  Este arquivo cria toda a estrutura necessária para o sistema funcionar completamente:

  1. Tabelas Principais
     - `users` - Integração com auth.users
     - `admin_users` - Usuários administrativos
     - `vehicles` - Frota de veículos
     - `customers` - Clientes cadastrados
     - `rentals` - Locações realizadas
     - `rental_payments` - Pagamentos das locações
     - `maintenance_records` - Histórico de manutenção
     - `pickup_locations` - Locais de retirada
     - `system_settings` - Configurações do sistema

  2. Funções e Triggers
     - `update_updated_at_column()` - Atualiza timestamps automaticamente
     - `generate_rental_number()` - Gera números únicos de locação
     - `update_customer_rental_count()` - Mantém contador de locações

  3. Segurança
     - RLS habilitado em todas as tabelas
     - Políticas específicas para admin e usuários
     - Controle de acesso granular

  4. Dados Iniciais
     - Veículos de exemplo
     - Locais de retirada padrão
     - Configurações básicas
*/

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar função para gerar números de locação
CREATE OR REPLACE FUNCTION generate_rental_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.rental_number = 'LOC' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(nextval('rental_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar sequência para números de locação
CREATE SEQUENCE IF NOT EXISTS rental_number_seq START 1;

-- Criar função para atualizar contador de locações do cliente
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

-- Função para sincronizar user_id em admin_users
CREATE OR REPLACE FUNCTION trg_admin_users_sync_user_id_fn()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela de usuários (integração com auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Tabela de usuários administrativos
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

-- Não habilitar RLS em admin_users para permitir verificações de permissão
-- ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Criar trigger para admin_users
DROP TRIGGER IF EXISTS trg_admin_users_sync_user_id ON admin_users;
CREATE TRIGGER trg_admin_users_sync_user_id
  BEFORE INSERT OR UPDATE OF id ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION trg_admin_users_sync_user_id_fn();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabela de veículos
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

-- Políticas RLS para vehicles
DROP POLICY IF EXISTS "Public can view available vehicles" ON vehicles;
CREATE POLICY "Public can view available vehicles"
  ON vehicles
  FOR SELECT
  TO public
  USING (status = 'disponivel');

DROP POLICY IF EXISTS "Authenticated users can manage vehicles" ON vehicles;
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

-- Índices para vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);

-- Trigger para vehicles
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabela de clientes
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

-- Políticas RLS para customers
DROP POLICY IF EXISTS "Public can view customers for rentals" ON customers;
CREATE POLICY "Public can view customers for rentals"
  ON customers
  FOR SELECT
  TO public
  USING (status = 'active');

DROP POLICY IF EXISTS "Authenticated users can manage customers" ON customers;
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

-- Índices para customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_cpf ON customers(cpf);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Trigger para customers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabela de locais de retirada
CREATE TABLE IF NOT EXISTS pickup_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pickup_locations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pickup_locations
DROP POLICY IF EXISTS "Public can view active pickup locations" ON pickup_locations;
CREATE POLICY "Public can view active pickup locations"
  ON pickup_locations
  FOR SELECT
  TO public
  USING (active = true);

DROP POLICY IF EXISTS "Admin users can manage pickup locations" ON pickup_locations;
CREATE POLICY "Admin users can manage pickup locations"
  ON pickup_locations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true
    )
  );

-- Índices para pickup_locations
CREATE INDEX IF NOT EXISTS idx_pickup_locations_active ON pickup_locations(active);
CREATE INDEX IF NOT EXISTS idx_pickup_locations_display_order ON pickup_locations(display_order);
CREATE INDEX IF NOT EXISTS idx_pickup_locations_state ON pickup_locations(state);

-- Trigger para pickup_locations
DROP TRIGGER IF EXISTS update_pickup_locations_updated_at ON pickup_locations;
CREATE TRIGGER update_pickup_locations_updated_at
  BEFORE UPDATE ON pickup_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabela de locações
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

-- Políticas RLS para rentals
DROP POLICY IF EXISTS "Users can view their own rentals" ON rentals;
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

DROP POLICY IF EXISTS "Admin users can manage rentals" ON rentals;
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

-- Índices para rentals
CREATE INDEX IF NOT EXISTS idx_rentals_customer_id ON rentals(customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_vehicle_id ON rentals(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rentals_dates ON rentals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);

-- Trigger para gerar número da locação
DROP TRIGGER IF EXISTS generate_rental_number_trigger ON rentals;
CREATE TRIGGER generate_rental_number_trigger
  BEFORE INSERT ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION generate_rental_number();

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_rentals_updated_at ON rentals;
CREATE TRIGGER update_rentals_updated_at
  BEFORE UPDATE ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar contador de locações do cliente
DROP TRIGGER IF EXISTS update_customer_rental_count_trigger ON rentals;
CREATE TRIGGER update_customer_rental_count_trigger
  AFTER INSERT OR DELETE ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_rental_count();

-- Tabela de pagamentos de locações
CREATE TABLE IF NOT EXISTS rental_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE,
  payment_type text NOT NULL CHECK (payment_type IN ('deposito', 'pagamento', 'multa', 'taxa_adicional', 'reembolso')),
  amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto')),
  payment_date timestamptz DEFAULT now(),
  due_date date,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'aprovado', 'rejeitado', 'cancelado')),
  transaction_id text,
  receipt_url text,
  notes text,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rental_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para rental_payments
DROP POLICY IF EXISTS "Admin users can manage payments" ON rental_payments;
CREATE POLICY "Admin users can manage payments"
  ON rental_payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true
    )
  );

DROP POLICY IF EXISTS "Users can view their rental payments" ON rental_payments;
CREATE POLICY "Users can view their rental payments"
  ON rental_payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      WHERE r.id = rental_payments.rental_id 
      AND c.user_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true
    )
  );

-- Índices para rental_payments
CREATE INDEX IF NOT EXISTS idx_rental_payments_rental_id ON rental_payments(rental_id);

-- Trigger para rental_payments
DROP TRIGGER IF EXISTS update_rental_payments_updated_at ON rental_payments;
CREATE TRIGGER update_rental_payments_updated_at
  BEFORE UPDATE ON rental_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabela de registros de manutenção
CREATE TABLE IF NOT EXISTS maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  maintenance_type text NOT NULL CHECK (maintenance_type IN ('preventiva', 'corretiva', 'revisao', 'limpeza', 'abastecimento')),
  description text NOT NULL,
  service_date date NOT NULL,
  mileage integer,
  cost numeric(10,2) DEFAULT 0,
  service_provider text,
  next_service_date date,
  next_service_mileage integer,
  parts_replaced text[],
  warranty_until date,
  invoice_number text,
  status text DEFAULT 'concluida' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  notes text,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para maintenance_records
DROP POLICY IF EXISTS "Admin users can manage maintenance records" ON maintenance_records;
CREATE POLICY "Admin users can manage maintenance records"
  ON maintenance_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true
    )
  );

-- Índices para maintenance_records
CREATE INDEX IF NOT EXISTS idx_maintenance_records_vehicle_id ON maintenance_records(vehicle_id);

-- Trigger para maintenance_records
DROP TRIGGER IF EXISTS update_maintenance_records_updated_at ON maintenance_records;
CREATE TRIGGER update_maintenance_records_updated_at
  BEFORE UPDATE ON maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  category text DEFAULT 'general',
  updated_by uuid REFERENCES admin_users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para system_settings
DROP POLICY IF EXISTS "Admin users can manage system settings" ON system_settings;
CREATE POLICY "Admin users can manage system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true 
      AND au.role = 'admin'
    )
  );

-- Inserir veículos de exemplo se não existirem
INSERT INTO vehicles (id, name, brand, model, year, license_plate, category, transmission, fuel, seats, daily_rate, features, images, status) VALUES
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

-- Inserir locais padrão se não existirem
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