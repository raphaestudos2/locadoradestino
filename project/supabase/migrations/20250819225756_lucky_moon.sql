/*
  # Criar Usuários Administrativos

  Este script deve ser executado APÓS criar os usuários no Supabase Auth Dashboard.

  ## Passos para configurar:

  1. Vá para o Supabase Dashboard → Authentication → Users
  2. Crie os seguintes usuários:
     - admin@locadoradestino.com (senha: admin123)
     - vendedor@locadoradestino.com (senha: admin123)

  3. Execute este script para vincular os usuários às tabelas do sistema

  ## Usuários que serão criados:
  - Administrador Principal (admin@locadoradestino.com)
  - Vendedor/Atendente (vendedor@locadoradestino.com)
*/

-- Função para criar usuário admin se o auth user existir
CREATE OR REPLACE FUNCTION create_admin_user_if_exists(
  p_email text,
  p_name text,
  p_role text
) RETURNS void AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Buscar o user_id do auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  -- Se o usuário existe no auth, criar o registro admin
  IF v_user_id IS NOT NULL THEN
    INSERT INTO admin_users (user_id, name, role, active)
    VALUES (v_user_id, p_name, p_role, true)
    ON CONFLICT (user_id) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      active = EXCLUDED.active,
      updated_at = now();
    
    RAISE NOTICE 'Admin user created/updated: % (%) - Role: %', p_name, p_email, p_role;
  ELSE
    RAISE NOTICE 'Auth user not found for email: %. Please create the user in Supabase Auth first.', p_email;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Criar os usuários administrativos
SELECT create_admin_user_if_exists('admin@locadoradestino.com', 'Administrador Sistema', 'admin');
SELECT create_admin_user_if_exists('vendedor@locadoradestino.com', 'Vendedor Sistema', 'seller');

-- Verificar quantos usuários admin foram criados
DO $$
DECLARE
  admin_count INTEGER;
  seller_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM admin_users WHERE role = 'admin';
  SELECT COUNT(*) INTO seller_count FROM admin_users WHERE role = 'seller';
  
  RAISE NOTICE '=== RESUMO DA CONFIGURAÇÃO ===';
  RAISE NOTICE 'Usuários admin criados: %', admin_count;
  RAISE NOTICE 'Usuários vendedor criados: %', seller_count;
  
  IF admin_count = 0 AND seller_count = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ATENÇÃO: Nenhum usuário administrativo foi criado!';
    RAISE NOTICE '';
    RAISE NOTICE 'Para configurar o sistema:';
    RAISE NOTICE '1. Vá para o Supabase Dashboard → Authentication → Users';
    RAISE NOTICE '2. Clique em "Add user" → "Create new user"';
    RAISE NOTICE '3. Crie os usuários:';
    RAISE NOTICE '   - Email: admin@locadoradestino.com, Senha: admin123';
    RAISE NOTICE '   - Email: vendedor@locadoradestino.com, Senha: admin123';
    RAISE NOTICE '4. Execute este script novamente';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '✅ Sistema configurado com sucesso!';
    RAISE NOTICE 'Você pode fazer login no painel administrativo com:';
    IF admin_count > 0 THEN
      RAISE NOTICE '   - Admin: admin@locadoradestino.com / admin123';
    END IF;
    IF seller_count > 0 THEN
      RAISE NOTICE '   - Vendedor: vendedor@locadoradestino.com / admin123';
    END IF;
    RAISE NOTICE '';
  END IF;
END $$;

-- Limpar a função temporária
DROP FUNCTION create_admin_user_if_exists(text, text, text);