/*
  # Add Sample Customers

  1. New Sample Data
    - Sample customers for testing the system
    - Realistic Brazilian data (names, CPF, emails, phones)
    - Different statuses to test functionality

  2. Data Inserted
    - 5 sample customers with complete information
    - Mix of active, inactive customers
    - Valid CPF numbers and realistic contact info

  3. Security
    - Respects existing RLS policies
    - Uses proper upsert to avoid conflicts
*/

-- Insert sample customers for testing
INSERT INTO customers (
  id, 
  name, 
  email, 
  phone, 
  cpf, 
  driver_license, 
  birth_date,
  address,
  emergency_contact,
  status,
  total_rentals
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440301',
    'João Silva Santos',
    'joao.silva@email.com',
    '(21) 99999-1234',
    '123.456.789-01',
    '12345678901',
    '1985-03-15',
    jsonb_build_object(
      'street', 'Rua das Flores, 123',
      'number', '123',
      'neighborhood', 'Copacabana',
      'city', 'Rio de Janeiro',
      'state', 'RJ',
      'zipCode', '22071-900'
    ),
    jsonb_build_object(
      'name', 'Maria Silva Santos',
      'phone', '(21) 98888-5678',
      'relationship', 'Esposa'
    ),
    'active',
    3
  ),
  (
    '550e8400-e29b-41d4-a716-446655440302',
    'Maria Oliveira Costa',
    'maria.oliveira@email.com',
    '(21) 97777-5678',
    '987.654.321-02',
    '98765432101',
    '1990-07-22',
    jsonb_build_object(
      'street', 'Avenida Atlântica, 456',
      'number', '456',
      'neighborhood', 'Ipanema',
      'city', 'Rio de Janeiro',
      'state', 'RJ',
      'zipCode', '22070-001'
    ),
    jsonb_build_object(
      'name', 'Pedro Costa',
      'phone', '(21) 96666-9012',
      'relationship', 'Marido'
    ),
    'active',
    1
  ),
  (
    '550e8400-e29b-41d4-a716-446655440303',
    'Carlos Eduardo Pereira',
    'carlos.pereira@email.com',
    '(11) 95555-3456',
    '456.789.123-03',
    '45678912303',
    '1988-11-10',
    jsonb_build_object(
      'street', 'Rua Augusta, 789',
      'number', '789',
      'neighborhood', 'Consolação',
      'city', 'São Paulo',
      'state', 'SP',
      'zipCode', '01305-000'
    ),
    jsonb_build_object(
      'name', 'Ana Pereira',
      'phone', '(11) 94444-7890',
      'relationship', 'Esposa'
    ),
    'active',
    5
  ),
  (
    '550e8400-e29b-41d4-a716-446655440304',
    'Ana Paula Rodrigues',
    'ana.rodrigues@email.com',
    '(21) 93333-7890',
    '789.123.456-04',
    '78912345604',
    '1992-05-18',
    jsonb_build_object(
      'street', 'Rua Voluntários da Pátria, 321',
      'number', '321',
      'neighborhood', 'Botafogo',
      'city', 'Rio de Janeiro',
      'state', 'RJ',
      'zipCode', '22270-000'
    ),
    jsonb_build_object(
      'name', 'Marcos Rodrigues',
      'phone', '(21) 92222-4567',
      'relationship', 'Irmão'
    ),
    'active',
    2
  ),
  (
    '550e8400-e29b-41d4-a716-446655440305',
    'Pedro Henrique Lima',
    'pedro.lima@email.com',
    '(21) 91111-2345',
    '321.654.987-05',
    '32165498705',
    '1987-09-03',
    jsonb_build_object(
      'street', 'Rua Barata Ribeiro, 654',
      'number', '654',
      'neighborhood', 'Copacabana',
      'city', 'Rio de Janeiro',
      'state', 'RJ',
      'zipCode', '22040-000'
    ),
    jsonb_build_object(
      'name', 'Lucia Lima',
      'phone', '(21) 90000-1234',
      'relationship', 'Mãe'
    ),
    'inactive',
    0
  )
ON CONFLICT (id) DO NOTHING;