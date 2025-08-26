# 🚗 Locadora Destino - Sistema Completo

Sistema completo de locadora de veículos com painel administrativo e integração com Supabase.

## 🚀 Deploy Automático para Produção

**ZERO configuração manual necessária!**

### 📋 Pré-requisitos
- Projeto Supabase criado e configurado

### 🎯 Processo de Deploy

1. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd locadora-destino
```

2. **Instale dependências:**
```bash
npm install
```

3. **Execute as migrações do banco:**
   - Acesse seu [Dashboard Supabase](https://supabase.com/dashboard)
   - Vá em **SQL Editor**
   - Execute os arquivos na ordem:
     1. `supabase/migrations/create_exec_sql_function.sql`
     2. `supabase/migrations/create_base_schema.sql`
     3. `supabase/migrations/insert_sample_data.sql`

4. **Inicie o sistema:**
```bash
npm run dev
```

5. **Acesse o sistema:**
   - **Frontend:** `http://localhost:5173`
   - **Admin:** `http://localhost:5173/admin`

### 🔑 Credenciais de Acesso

**Administradores:**
- 👤 `admin@locadoradestino.com.br` | `123456@`
- 👤 `sergio@locadoradestino.com.br` | `Padrao007@0`

## 🗄️ Estrutura do Banco

### Tabelas Principais:
- **vehicles** - Frota de veículos
- **customers** - Clientes e documentos
- **rentals** - Locações e contratos
- **rental_payments** - Pagamentos
- **maintenance_records** - Manutenção
- **admin_users** - Usuários administrativos


```

## 📱 Funcionalidades

### Frontend (Cliente):
- ✅ Catálogo de veículos
- ✅ Reservas online via WhatsApp
- ✅ Consulta CEP automática
- ✅ Design responsivo premium

### Admin Panel:
- ✅ Gestão completa da frota
- ✅ Cadastro de clientes
- ✅ Controle de locações
- ✅ Relatórios financeiros
- ✅ Histórico de manutenção

## 🎨 Tecnologias

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth + Database + RLS)
- **Build:** Vite
- **Icons:** Lucide React

## 🚀 Deploy em Produção

### Netlify/Vercel:
1. Conecte o repositório
2. Configure as variáveis de ambiente
3. Deploy automático!

### Configurações de Build:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## 💡 Recursos Especiais

- **🔄 Setup Automático:** Configura banco e usuários na primeira execução
- **🛡️ Segurança RLS:** Todas as tabelas protegidas
- **📱 Design Premium:** Interface moderna e responsiva
- **⚡ Performance:** Otimizado para produção

---

**🎉 Sistema pronto para produção sem configuração manual!**