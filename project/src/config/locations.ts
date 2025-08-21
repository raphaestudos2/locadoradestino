// Configuração dos locais de retirada
export const pickupLocations = {
  // Rio de Janeiro - RJ
  'rio-centro-rj': {
    id: 'rio-centro-rj',
    name: 'Rio de Janeiro - RJ',
    address: 'Rio de Janeiro - RJ',
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  'galeao-rj': {
    id: 'galeao-rj',
    name: 'Aeroporto Internacional do Galeão - RJ',
    address: 'Aeroporto Internacional do Galeão - Rio de Janeiro - RJ',
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  'santos-dumont-rj': {
    id: 'santos-dumont-rj',
    name: 'Aeroporto Santos Dumont - RJ',
    address: 'Aeroporto Santos Dumont - Rio de Janeiro - RJ',
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  'rodoviaria-novo-rio-rj': {
    id: 'rodoviaria-novo-rio-rj',
    name: 'Rodoviária Novo Rio - RJ',
    address: 'Rodoviária Novo Rio - Rio de Janeiro - RJ',
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  'maracana-rj': {
    id: 'maracana-rj',
    name: 'Estádio do Maracanã - RJ',
    address: 'Estádio do Maracanã - Rio de Janeiro - RJ',
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  'carioca-rj': {
    id: 'carioca-rj',
    name: 'Carioca Shopping - Vila da Penha - RJ',
    address: 'Carioca Shopping - Vila da Penha - Rio de Janeiro - RJ',
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  'nova-america-rj': {
    id: 'nova-america-rj',
    name: 'Shopping Nova América - RJ',
    address: 'Shopping Nova América - Rio de Janeiro - RJ',
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  'boulevard-rj': {
    id: 'boulevard-rj',
    name: 'Boulevard Shopping - Vila Isabel - RJ',
    address: 'Boulevard Shopping - Vila Isabel - Rio de Janeiro - RJ',
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  'freguesia-rj': {
    id: 'freguesia-rj',
    name: 'Freguesia - Jacarepaguá - RJ',
    address: 'Freguesia - Jacarepaguá - Rio de Janeiro - RJ',
    city: 'Rio de Janeiro',
    state: 'RJ'
  },

  // São Paulo - SP
  'centro-sp': {
    id: 'centro-sp',
    name: 'Centro - São Paulo - SP',
    address: 'Centro - São Paulo - SP',
    city: 'São Paulo',
    state: 'SP'
  },
  'congonhas-sp': {
    id: 'congonhas-sp',
    name: 'Aeroporto Congonhas - SP',
    address: 'Aeroporto Congonhas - São Paulo - SP',
    city: 'São Paulo',
    state: 'SP'
  },
  'guarulhos-sp': {
    id: 'guarulhos-sp',
    name: 'Aeroporto Guarulhos - SP',
    address: 'Aeroporto Guarulhos - São Paulo - SP',
    city: 'São Paulo',
    state: 'SP'
  },
  'ibirapuera-sp': {
    id: 'ibirapuera-sp',
    name: 'Shopping Ibirapuera - SP',
    address: 'Shopping Ibirapuera - São Paulo - SP',
    city: 'São Paulo',
    state: 'SP'
  },
  'sao-bernardo-sp': {
    id: 'sao-bernardo-sp',
    name: 'São Bernardo do Campo - SP',
    address: 'São Bernardo do Campo - SP',
    city: 'São Bernardo do Campo',
    state: 'SP'
  },
  'taubate-sp': {
    id: 'taubate-sp',
    name: 'Taubaté - SP',
    address: 'Taubaté - SP',
    city: 'Taubaté',
    state: 'SP'
  },
  'santo-andre-sp': {
    id: 'santo-andre-sp',
    name: 'Santo André - SP',
    address: 'Santo André - SP',
    city: 'Santo André',
    state: 'SP'
  },
  'sao-jose-campos-sp': {
    id: 'sao-jose-campos-sp',
    name: 'São José dos Campos - SP',
    address: 'São José dos Campos - SP',
    city: 'São José dos Campos',
    state: 'SP'
  }
};

export const getLocationName = (locationId: string): string => {
  const location = pickupLocations[locationId as keyof typeof pickupLocations];
  return location ? location.name : locationId;
};

export const getLocationAddress = (locationId: string): string => {
  const location = pickupLocations[locationId as keyof typeof pickupLocations];
  return location ? location.address : '';
};

export const getLocationsByState = (state: string) => {
  return Object.values(pickupLocations).filter(location => location.state === state);
};

// Get locations in the specified order
export const getOrderedLocations = () => {
  const orderedIds = [
    // Rio de Janeiro - RJ
    'rio-centro-rj',
    'galeao-rj',
    'santos-dumont-rj',
    'rodoviaria-novo-rio-rj',
    'maracana-rj',
    'carioca-rj',
    'nova-america-rj',
    'boulevard-rj',
    'freguesia-rj',
    // São Paulo - SP
    'centro-sp',
    'congonhas-sp',
    'guarulhos-sp',
    'ibirapuera-sp',
    'sao-bernardo-sp',
    'taubate-sp',
    'santo-andre-sp',
    'sao-jose-campos-sp'
  ];

  return orderedIds.map(id => pickupLocations[id as keyof typeof pickupLocations]).filter(Boolean);
};