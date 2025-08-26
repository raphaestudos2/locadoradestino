// Utility functions for input formatting and validation

// Format CPF with mask
export const formatCPF = (value: string): string => {
  let numbers = value.replace(/[^0-9]/g, '');
  
  if (numbers.length <= 11) {
    numbers = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    numbers = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
    numbers = numbers.replace(/(\d{3})(\d{3})(\d{2})/, '$1.$2.$3');
    numbers = numbers.replace(/(\d{3})(\d{3})/, '$1.$2');
    numbers = numbers.replace(/(\d{3})/, '$1');
  }
  
  return numbers;
};

// Format phone with mask
export const formatPhone = (value: string): string => {
  // Remove all non-numeric characters
  let numbers = value.replace(/[^0-9]/g, '');
  
  // Don't format if empty
  if (numbers.length === 0) return '';
  
  // Format based on length
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else {
    // Mobile format for 11 digits
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

// Format CNH (only numbers)
export const formatCNH = (value: string): string => {
  return value.replace(/[^0-9]/g, '');
};

// Validate CPF
export const isValidCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/[^0-9]/g, '');
  
  if (numbers.length !== 11) return false;
  if (numbers === numbers[0].repeat(11)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;

  return true;
};

// Prevent wheel scroll on number inputs
export const preventWheelScroll = (e: React.WheelEvent<HTMLInputElement>) => {
  (e.target as HTMLInputElement).blur();
};

// Input event handlers
export const handleCPFInput = (value: string, onChange: (value: string) => void) => {
  const formatted = formatCPF(value);
  onChange(formatted);
};

export const handlePhoneInput = (value: string, onChange: (value: string) => void) => {
  const formatted = formatPhone(value);
  onChange(formatted);
};

export const handleCNHInput = (value: string, onChange: (value: string) => void) => {
  const formatted = formatCNH(value);
  onChange(formatted);
};

export const handleNumericInput = (value: string, onChange: (value: string) => void) => {
  const numbers = value.replace(/[^0-9]/g, '');
  onChange(numbers);
};