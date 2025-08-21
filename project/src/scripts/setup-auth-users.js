/**
 * Script to create authentication users in Supabase
 * This script creates the admin users in the Supabase Auth system
 */

import { supabase } from '../lib/supabase.js';

const ADMIN_USERS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'admin@locadoradestino.com.br',
    password: '123456@',
    name: 'Administrador Principal',
    role: 'admin'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002', 
    email: 'sergio@locadoradestino.com.br',
    password: 'Padrao007@0',
    name: 'Sergio Vendedor',
    role: 'seller'
  }
];

async function createAuthUsers() {
  console.log('🚀 Iniciando criação de usuários administrativos...');
  
  for (const user of ADMIN_USERS) {
    try {
      console.log(`📧 Criando usuário: ${user.email}`);
      
      // Create user in Supabase Auth using admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⚠️  Usuário ${user.email} já existe`);
          continue;
        }
        throw error;
      }

      console.log(`✅ Usuário criado com sucesso: ${user.email}`);
      console.log(`   ID: ${data.user?.id}`);
      
    } catch (error) {
      console.error(`❌ Erro ao criar usuário ${user.email}:`, error.message);
    }
  }
  
  console.log('🎉 Processo de criação de usuários concluído!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('👤 Admin: admin@locadoradestino.com.br');
  console.log('👤 Sergio: sergio@locadoradestino.com.br');
  console.log('🔑 Senha para ambos: 123456@');
}

// Execute the function
createAuthUsers().catch(console.error);