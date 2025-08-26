import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, FileText, Calendar, MapPin, Check } from 'lucide-react';
import { Customer } from '../../types';
import { formatCPF, formatPhone, formatCNH } from '../../utils/inputHelpers';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Omit<Customer, 'id' | 'registrationDate' | 'totalRentals'> | Customer) => void;
  customer?: Customer | null;
  title: string;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customer,
  title
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cnh: '',
    address: '',
    status: 'active' as 'active' | 'inactive' | 'blocked'
  });
  const [originalData, setOriginalData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid = (): boolean => {
    return !!(
      formData.name?.trim() && 
      formData.email?.trim() && 
      formData.phone?.trim() && 
      formData.cpf?.trim() && 
      formData.cnh?.trim()
    );
  };

  useEffect(() => {
    console.log('🔄 CustomerFormModal opened/changed:', { isOpen, customer: customer?.id });
    if (customer) {
      const customerData = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        cpf: customer.cpf,
        cnh: customer.cnh,
        address: customer.address || '',
        status: customer.status
      };
      console.log('📝 Loading customer data for editing:', customerData);
      setFormData(customerData);
      setOriginalData(customerData);
    } else {
      const defaultData = {
        name: '',
        email: '',
        phone: '',
        cpf: '',
        cnh: '',
        address: '',
        status: 'active' as const
      };
      console.log('🆕 Creating new customer form');
      setFormData(defaultData);
      setOriginalData(defaultData);
    }
    setHasChanges(false);
    setErrors({});
  }, [customer, isOpen]);

  // Detectar mudanças no formulário
  useEffect(() => {
    if (!originalData) return;
    
    const hasFormChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(hasFormChanged);
  }, [formData, originalData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    }

    if (!formData.cnh.trim()) {
      newErrors.cnh = 'CNH é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 CustomerFormModal handleSubmit called:', {
      isEditing: !!customer,
      customerId: customer?.id,
      formData,
      hasChanges,
      isValid: validateForm()
    });
    
    if (!validateForm()) {
      console.log('❌ Validação do formulário falhou:', errors);
      return;
    }
    
    if (customer) {
      const updatedCustomer: Customer = {
        id: customer.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        cnh: formData.cnh,
        address: formData.address,
        status: formData.status,
        registrationDate: customer.registrationDate,
        totalRentals: customer.totalRentals
      };
      console.log('📝 Atualizando cliente ID:', customer.id, updatedCustomer);
      onSubmit(updatedCustomer);
    } else {
      const newCustomer = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        cnh: formData.cnh,
        address: formData.address,
        status: formData.status
      };
      console.log('🆕 Criando novo cliente:', newCustomer);
      onSubmit(newCustomer);
    }
    
    // Don't close modal here - let parent handle it
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Digite o nome completo"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                   type="text"
                   inputMode="numeric"
                   pattern="[0-9]*"
                   inputMode="numeric"
                   pattern="[0-9\.\-]*"
                   maxLength={14}
                   inputMode="numeric"
                   pattern="[0-9\s\(\)\-]*"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.phone}
                   onChange={(e) => {
                     const formatted = formatPhone(e.target.value);
                     handleInputChange('phone', formatted);
                   }}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documentos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.cpf ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.cpf}
                   onChange={(e) => {
                     const formatted = formatCPF(e.target.value);
                     handleInputChange('cpf', formatted);
                   }}
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNH *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.cnh ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.cnh}
                   onChange={(e) => {
                     const formatted = formatCNH(e.target.value);
                     handleInputChange('cnh', formatted);
                   }}
                    placeholder="Digite o número da CNH"
                  />
                  {errors.cnh && <p className="text-red-500 text-xs mt-1">{errors.cnh}</p>}
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Endereço
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço Completo
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Rua, número, complemento, bairro, cidade - estado, CEP"
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isFormValid() || (!!customer && !hasChanges)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  !isFormValid() || (!!customer && !hasChanges)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                }`}
              >
                <Check className="h-5 w-5" />
                <span>
                  {!isFormValid() ? 'Preencha os campos obrigatórios' :
                   customer ? 
                     (hasChanges ? 'Atualizar Cliente' : 'Sem Alterações') : 
                     'Criar Cliente'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};