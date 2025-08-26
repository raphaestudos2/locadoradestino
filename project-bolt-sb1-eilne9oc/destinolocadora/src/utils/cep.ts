// Utility functions for CEP (Brazilian postal code) handling

export interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const formatCEP = (cep: string): string => {
  // Remove all non-numeric characters
  const numericCEP = cep.replace(/\D/g, '');
  
  // Apply CEP mask (00000-000)
  if (numericCEP.length <= 5) {
    return numericCEP;
  } else {
    return `${numericCEP.slice(0, 5)}-${numericCEP.slice(5, 8)}`;
  }
};

export const isValidCEP = (cep: string): boolean => {
  const numericCEP = cep.replace(/\D/g, '');
  return numericCEP.length === 8;
};

export const fetchAddressByCEP = async (cep: string): Promise<CEPData | null> => {
  const numericCEP = cep.replace(/\D/g, '');
  
  if (!isValidCEP(numericCEP)) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${numericCEP}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro na consulta do CEP');
    }

    const data: CEPData = await response.json();
    
    if (data.erro) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};