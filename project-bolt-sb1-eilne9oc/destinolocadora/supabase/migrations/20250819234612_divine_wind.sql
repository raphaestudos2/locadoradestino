/*
  # Criar usuários administradores

  1. Novos Registros
    - Adicionar usuários admin e sergio na tabela admin_users
    - Configurar permissões e roles apropriadas
    
  2. Segurança
    - Manter RLS habilitado
    - Usuários terão acesso total ao sistema administrativo
    
  3. Observações
    - Os usuários devem ser criados primeiro no Supabase Auth Dashboard
    - Este script apenas adiciona os registros na tabela admin_users
    - Emails: admin@locadoradestino.com.br e sergio@locadoradestino.com.br
    - Senha: 123456@
*/

-- Inserir usuários administradores
-- Nota: Os UUIDs serão atualizados após a criação dos usuários no Auth Dashboard

INSERT INTO admin_users (
  user_id,
  name,
  role,
  permissions,
  active,
  created_at,
  updated_at
) VALUES 
(
  NULL, -- Será atualizado após criação no Auth Dashboard
  'Administrador Principal',
  'admin',
  '["all"]'::jsonb,
  true,
  now(),
  now()
),
(
  NULL, -- Será atualizado após criação no Auth Dashboard  
  'Sergio',
  'manager',
  '["vehicles", "customers", "rentals", "reports"]'::jsonb,
  true,
  now(),
  now()
)
ON CONFLICT DO NOTHING;

-- Criar função para atualizar user_id dos admins após criação no Auth
CREATE OR REPLACE FUNCTION update_admin_user_id(email_param text, user_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE admin_users 
  SET user_id = user_id_param
  WHERE (name = 'Administrador Principal' AND email_param = 'admin@locadoradestino.com.br')
     OR (name = 'Sergio' AND email_param = 'sergio@locadoradestino.com.br');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;