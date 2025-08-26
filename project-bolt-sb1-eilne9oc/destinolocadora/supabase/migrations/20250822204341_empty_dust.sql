/*
  # Create pickup locations table

  1. New Tables
    - `pickup_locations`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Nome do local
      - `address` (text, not null) - Endereço completo
      - `city` (text, not null) - Cidade
      - `state` (text, not null) - Estado
      - `active` (boolean, default true) - Se o local está ativo
      - `display_order` (integer, default 0) - Ordem de exibição
      - `notes` (text, nullable) - Observações
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `pickup_locations` table
    - Add policy for public to read active locations
    - Add policy for admins to manage all locations

  3. Initial Data
    - Insert default pickup locations
*/

-- Create pickup_locations table
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

-- Enable RLS
ALTER TABLE pickup_locations ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pickup_locations_active ON pickup_locations(active);
CREATE INDEX IF NOT EXISTS idx_pickup_locations_state ON pickup_locations(state);
CREATE INDEX IF NOT EXISTS idx_pickup_locations_display_order ON pickup_locations(display_order);

-- Update trigger
DROP TRIGGER IF EXISTS update_pickup_locations_updated_at ON pickup_locations;
CREATE TRIGGER update_pickup_locations_updated_at
  BEFORE UPDATE ON pickup_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial locations
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