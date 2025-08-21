/*
  # Cadastrar Sergio como Administrador

  1. Novo Registro Admin
    - Inserir Sergio na tabela `admin_users`
    - User ID: 99147ce1-ca5d-4acc-bc42-036e6fe64c43
    - Nome: Sergio Vendedor
    - Role: admin (acesso total)
    - Status: ativo

  2. Permissões
    - Acesso completo ao sistema
    - Todas as funcionalidades administrativas liberadas
*/

-- Inserir Sergio na tabela admin_users
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
  'admin',
  '["view_dashboard", "manage_vehicles", "manage_customers", "manage_rentals", "view_reports", "manage_settings", "manage_users", "manage_payments", "view_analytics"]'::jsonb,
  true,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  active = EXCLUDED.active,
  updated_at = now();