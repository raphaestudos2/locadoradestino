# Locadora Destino - Sistema de Locação de Veículos

Sistema completo de locação de veículos com interface moderna e responsiva.

## 🚗 Funcionalidades

- **Catálogo de Veículos**: Visualização completa da frota disponível
- **Sistema de Reservas**: Formulário completo integrado com WhatsApp
- **Múltiplos Locais**: 9 pontos de retirada em SP e RJ
- **Painel Administrativo**: Gestão completa de veículos, clientes e locações
- **Design Responsivo**: Funciona perfeitamente em todos os dispositivos

## 📁 Estrutura de Imagens

Para personalizar as imagens dos veículos, organize os arquivos na seguinte estrutura:

```
public/
└── images/
    └── vehicles/
        ├── kicks/
        │   ├── kicks-main.jpg
        │   ├── kicks-1.jpg
        │   ├── kicks-2.jpg
        │   └── kicks-3.jpg
        ├── tracker/
        │   ├── tracker-main.jpg
        │   ├── tracker-1.jpg
        │   ├── tracker-2.jpg
        │   └── tracker-3.jpg
        ├── kardian/
        │   ├── kardian-main.jpg
        │   ├── kardian-1.jpg
        │   ├── kardian-2.jpg
        │   └── kardian-3.jpg
        ├── onix-sedan-auto/
        │   ├── onix-sedan-auto-main.jpg
        │   ├── onix-sedan-auto-1.jpg
        │   ├── onix-sedan-auto-2.jpg
        │   └── onix-sedan-auto-3.jpg
        ├── cronos-auto/
        │   ├── cronos-auto-main.jpg
        │   ├── cronos-auto-1.jpg
        │   ├── cronos-auto-2.jpg
        │   └── cronos-auto-3.jpg
        ├── onix-sedan-manual/
        │   ├── onix-sedan-manual-main.jpg
        │   ├── onix-sedan-manual-1.jpg
        │   ├── onix-sedan-manual-2.jpg
        │   └── onix-sedan-manual-3.jpg
        ├── cronos-manual/
        │   ├── cronos-manual-main.jpg
        │   ├── cronos-manual-1.jpg
        │   ├── cronos-manual-2.jpg
        │   └── cronos-manual-3.jpg
        ├── onix-hatch/
        │   ├── onix-hatch-main.jpg
        │   ├── onix-hatch-1.jpg
        │   ├── onix-hatch-2.jpg
        │   └── onix-hatch-3.jpg
        └── polo-track/
            ├── polo-track-main.jpg
            ├── polo-track-1.jpg
            ├── polo-track-2.jpg
            └── polo-track-3.jpg
```

## 📍 Locais de Retirada

### São Paulo - SP
- Centro - São Paulo - SP
- Aeroporto Congonhas - SP
- Aeroporto Guarulhos - SP
- Shopping Ibirapuera - SP
- São Bernardo do Campo - SP

### Rio de Janeiro - RJ
- Carioca Shopping - Vila da Penha - RJ
- Shopping Nova América - RJ
- Boulevard Shopping - Vila Isabel - RJ
- Freguesia - Jacarepaguá - RJ

## 📞 Contatos

- **WhatsApp**: (21) 99950-4512
- **Telefone**: (21) 3456-7890
- **Email**: contato@locadoradestino.com.br
- **Reservas**: reservas@locadoradestino.com.br

## 🚀 Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar em desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Build para produção**:
   ```bash
   npm run build
   ```

## 🔧 Configuração

### Com Supabase (Opcional)
Para funcionalidades administrativas completas, configure o Supabase:

1. Configure as variáveis de ambiente:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

2. Execute as migrações do banco de dados

3. Crie os usuários administrativos no Supabase Auth Dashboard:
   - admin@locadoradestino.com.br (senha: 123456@)
   - sergio@locadoradestino.com.br (senha: 123456@)

### Acessos Administrativos

Após configurar o Supabase, você pode acessar o painel administrativo em `/admin` com:

- **Administrador Principal**: admin@locadoradestino.com.br
- **Sergio**: sergio@locadoradestino.com.br
- **Senha**: 123456@

### Sem Banco de Dados
O sistema funciona com dados estáticos para demonstração, mas as funcionalidades administrativas requerem Supabase.

## 🎨 Personalização

### Imagens
- Substitua as imagens seguindo a estrutura de pastas acima
- Mantenha os nomes dos arquivos conforme especificado
- Use formatos JPG, PNG ou WebP
- Resolução recomendada: 800x600px

### Contatos
- Edite o arquivo `src/config/contacts.ts`
- Atualize números de telefone, emails e endereços

### Locais
- Modifique o arquivo `src/config/locations.ts`
- Adicione ou remova pontos de retirada

## 📱 Recursos

- ✅ Design responsivo e moderno
- ✅ Integração com WhatsApp
- ✅ Sistema de reservas completo
- ✅ Galeria de imagens interativa
- ✅ Painel administrativo
- ✅ Múltiplos pontos de retirada
- ✅ Fallback automático para dados estáticos

## 🛠️ Tecnologias

- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **Vite** como bundler
- **Supabase** (opcional) para banco de dados

## 📄 Licença

© 2024 Locadora Destino. Todos os direitos reservados.