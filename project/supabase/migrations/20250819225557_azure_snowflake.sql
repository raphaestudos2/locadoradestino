/*
  # Schema Completo da Locadora Destino

  1. Tabelas Principais
    - `admin_users` - Usuários administrativos do sistema
    - `customers` - Clientes da locadora
    - `vehicles` - Frota de veículos
    - `rentals` - Locações/aluguéis
    - `rental_payments` - Pagamentos das locações
    - `maintenance_records` - Registros de manutenção dos veículos

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas específicas para cada tipo de usuário
    - Acesso público para consulta de veículos disponíveis

  3. Funcionalidades
    - Sistema completo de autenticação
    - Gestão de clientes e veículos
    - Controle de locações e pagamentos
    - Histórico de manutenção
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários administrativos
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'seller')),
  permissions jsonb DEFAULT '[]'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
  daily_rate decimal(10,2) NOT NULL,
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de locações
CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE RESTRICT,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '18:00',
  pickup_location text NOT NULL,
  return_location text,
  actual_start_date timestamptz,
  actual_end_date timestamptz,
  start_mileage integer,
  end_mileage integer,
  daily_rate decimal(10,2) NOT NULL,
  total_days integer NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  additional_fees decimal(10,2) DEFAULT 0,
  discount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  deposit_amount decimal(10,2) DEFAULT 0,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'ativa', 'concluida', 'cancelada')),
  payment_status text DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'parcial', 'pago', 'atrasado', 'cancelado')),
  contract_signed boolean DEFAULT false,
  vehicle_inspected boolean DEFAULT false,
  fuel_level_start text,
  fuel_level_end text,
  damage_report_start text,
  damage_report_end text,
  additional_drivers jsonb DEFAULT '[]'::jsonb,
  special_requests text,
  notes text,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS rental_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE,
  payment_type text NOT NULL CHECK (payment_type IN ('deposito', 'pagamento', 'multa', 'taxa_adicional', 'reembolso')),
  amount decimal(10,2) NOT NULL,
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

-- Tabela de manutenção
CREATE TABLE IF NOT EXISTS maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  maintenance_type text NOT NULL CHECK (maintenance_type IN ('preventiva', 'corretiva', 'revisao', 'limpeza', 'abastecimento')),
  description text NOT NULL,
  service_date date NOT NULL,
  mileage integer,
  cost decimal(10,2) DEFAULT 0,
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_cpf ON customers(cpf);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_rentals_customer_id ON rentals(customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_vehicle_id ON rentals(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_dates ON rentals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rental_payments_rental_id ON rental_payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_vehicle_id ON maintenance_records(vehicle_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rental_payments_updated_at BEFORE UPDATE ON rental_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para gerar número de locação automaticamente
CREATE OR REPLACE FUNCTION generate_rental_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rental_number IS NULL OR NEW.rental_number = '' THEN
    NEW.rental_number := 'LOC' || TO_CHAR(now(), 'YYYYMMDD') || LPAD(nextval('rental_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE IF NOT EXISTS rental_number_seq START 1;
CREATE TRIGGER generate_rental_number_trigger BEFORE INSERT ON rentals FOR EACH ROW EXECUTE FUNCTION generate_rental_number();

-- Trigger para atualizar total de locações do cliente
CREATE OR REPLACE FUNCTION update_customer_rental_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE customers SET total_rentals = total_rentals + 1 WHERE id = NEW.customer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE customers SET total_rentals = total_rentals - 1 WHERE id = OLD.customer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_rental_count_trigger 
  AFTER INSERT OR DELETE ON rentals 
  FOR EACH ROW EXECUTE FUNCTION update_customer_rental_count();

-- Habilitar RLS em todas as tabelas
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admin_users
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

-- Políticas RLS para customers
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

-- Políticas RLS para vehicles
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

-- Políticas RLS para rentals
CREATE POLICY "Users can view their own rentals"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c 
      WHERE c.id = customer_id 
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

-- Políticas RLS para rental_payments
CREATE POLICY "Users can view their rental payments"
  ON rental_payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      WHERE r.id = rental_id 
      AND c.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true
    )
  );

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

-- Políticas RLS para maintenance_records
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

-- Políticas RLS para system_settings
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