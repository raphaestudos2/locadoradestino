/*
  # Corrigir tabela pickup_locations

  1. Verificações e Correções
    - Verifica se tabela pickup_locations existe
    - Cria coluna display_order se não existir
    - Adiciona índices necessários
    - Configura RLS se necessário

  2. Estrutura Final
    - `id` (uuid, primary key)
    - `name` (text, NOT NULL)
    - `address` (text, NOT NULL)
    - `city` (text, NOT NULL)
    - `state` (text, NOT NULL)
    - `active` (boolean, DEFAULT true)
    - `display_order` (integer, DEFAULT 0)
    - `notes` (text)
    - `created_at` (timestamptz, DEFAULT now())
    - `updated_at` (timestamptz, DEFAULT now())

  3. Segurança
    - RLS habilitado
    - Políticas para admin e público
*/

-- Create pickup_locations table if it doesn't exist
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

-- Add display_order column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pickup_locations' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE pickup_locations ADD COLUMN display_order integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE pickup_locations ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Public can view active pickup locations" ON pickup_locations;
  DROP POLICY IF EXISTS "Admin users can manage pickup locations" ON pickup_locations;
  
  -- Create new policies
  CREATE POLICY "Public can view active pickup locations"
    ON pickup_locations
    FOR SELECT
    TO public
    USING (active = true);

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
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_pickup_locations_active ON pickup_locations(active);
CREATE INDEX IF NOT EXISTS idx_pickup_locations_display_order ON pickup_locations(display_order);
CREATE INDEX IF NOT EXISTS idx_pickup_locations_state ON pickup_locations(state);

-- Create update trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pickup_locations_updated_at ON pickup_locations;
CREATE TRIGGER update_pickup_locations_updated_at
  BEFORE UPDATE ON pickup_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample pickup locations if table is empty
INSERT INTO pickup_locations (id, name, address, city, state, active, display_order) 
SELECT 
  gen_random_uuid(),
  'Rio de Janeiro - Centro',
  'Centro - Rio de Janeiro - RJ',
  'Rio de Janeiro',
  'RJ',
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM pickup_locations LIMIT 1);

INSERT INTO pickup_locations (id, name, address, city, state, active, display_order) 
SELECT 
  gen_random_uuid(),
  'Aeroporto Internacional do Galeão - RJ',
  'Aeroporto Internacional do Galeão - Rio de Janeiro - RJ',
  'Rio de Janeiro',
  'RJ',
  true,
  2
WHERE (SELECT COUNT(*) FROM pickup_locations) < 2;

INSERT INTO pickup_locations (id, name, address, city, state, active, display_order) 
SELECT 
  gen_random_uuid(),
  'Aeroporto Santos Dumont - RJ',
  'Aeroporto Santos Dumont - Rio de Janeiro - RJ',
  'Rio de Janeiro',
  'RJ',
  true,
  3
WHERE (SELECT COUNT(*) FROM pickup_locations) < 3;