// Configuração de contatos da empresa - agora carregada das configurações
const getCompanySettings = () => {
  const savedSettings = localStorage.getItem('companySettings');
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (error) {
      console.error('Error loading company settings:', error);
    }
  }
  
  // Fallback para valores padrão
  return {
    name: 'Locadora Destino',
    phone: {
      main: '(21) 3456-7890',
      secondary: '(21) 99950-4512'
    },
    email: {
      main: 'contato@locadoradestino.com.br',
      reservations: 'reservas@locadoradestino.com.br',
      support: 'suporte@locadoradestino.com.br'
    },
    address: {
      street: 'Rua das Palmeiras, 123',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20040-020',
      full: 'Rua das Palmeiras, 123 - Centro, Rio de Janeiro - RJ, CEP: 20040-020'
    },
    businessHours: {
      weekdays: 'Segunda a Sexta: 8h às 18h',
      saturday: 'Sábado: 8h às 16h',
      sunday: 'Domingo: 8h às 12h'
    },
    social: {
      instagram: '@locadoradestino',
      facebook: 'Locadora Destino',
      website: 'www.locadoradestino.com.br'
    }
  };
};

const companySettings = getCompanySettings();

export const contacts = {
  whatsapp: {
    number: '5521999504512', // Formato internacional sem símbolos
    display: companySettings.phone?.secondary || '(21) 99950-4512', // Formato para exibição
    url: 'https://wa.me/5521999504512'
  },
  phone: {
    main: companySettings.phone?.main || '(21) 3456-7890',
    secondary: companySettings.phone?.secondary || '(21) 99950-4512'
  },
  email: {
    main: companySettings.email?.main || 'contato@locadoradestino.com.br',
    reservations: companySettings.email?.reservations || 'reservas@locadoradestino.com.br',
    support: companySettings.email?.support || 'suporte@locadoradestino.com.br'
  },
  address: {
    street: companySettings.address?.street || 'Rua das Palmeiras, 123',
    neighborhood: companySettings.address?.neighborhood || 'Centro',
    city: companySettings.address?.city || 'Rio de Janeiro',
    state: companySettings.address?.state || 'RJ',
    zipCode: companySettings.address?.zipCode || '20040-020',
    full: companySettings.address?.full || 'Rua das Palmeiras, 123 - Centro, Rio de Janeiro - RJ, CEP: 20040-020'
  },
  businessHours: {
    weekdays: companySettings.businessHours?.weekdays || 'Segunda a Sexta: 8h às 18h',
    saturday: companySettings.businessHours?.saturday || 'Sábado: 8h às 16h',
    sunday: companySettings.businessHours?.sunday || 'Domingo: 8h às 12h'
  },
  social: {
    instagram: companySettings.social?.instagram || '@locadoradestino',
    facebook: companySettings.social?.facebook || 'Locadora Destino',
    website: companySettings.social?.website || 'www.locadoradestino.com.br'
  }
};