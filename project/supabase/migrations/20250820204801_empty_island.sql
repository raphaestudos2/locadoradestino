/*
  # Adicionar usuário Sergio na tabela admin_users

  1. New Records
    - Adiciona registro do usuário Sergio na tabela `admin_users`
    - Usuário ID: 99147ce1-ca5d-4acc-bc42-036e6fe64c43
    - Nome: Sergio Vendedor
    - Função: seller (vendedor)
    - Status: ativo

  2. Security
    - Utiliza função UPSERT para evitar duplicatas
    - Mantém integridade referencial com tabela users do Supabase Auth
*/

-- Inserir ou atualizar o usuário Sergio na tabela admin_users
INSERT INTO admin_users (
  user_id,
  name,
  role,
  permissions,
  active,
  created_at,
  updated_at
) VALUES (
  '99147ce1-ca5d-4acc-bc42-036e6fe64c43',
  'Sergio Vendedor',
  'seller',
  '["view_dashboard", "manage_customers", "manage_rentals", "view_reports"]'::jsonb,
  true,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  active = EXCLUDED.active,
  updated_at = now();