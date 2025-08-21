/*
  # Atualizar Sergio para Administrador

  1. Usuário Administrativo
    - Atualizar `sergio@locadoradestino.com.br` para role 'admin'
    - Conceder acesso total ao sistema
    - ID do usuário: 99147ce1-ca5d-4acc-bc42-036e6fe64c43

  2. Permissões
    - Acesso completo a todas as funcionalidades
    - Gestão de usuários, veículos, clientes, locações e configurações
    - Relatórios financeiros e operacionais
*/

-- Inserir ou atualizar o usuário Sergio na tabela admin_users com role admin
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