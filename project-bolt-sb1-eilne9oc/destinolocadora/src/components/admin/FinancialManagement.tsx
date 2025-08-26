import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Download, 
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  Check,
  User,
  Car,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { getLocationName } from '../../config/locations';
import { RentalService } from '../../services/rentalService';
import { CustomerService } from '../../services/customerService';
import { VehicleService } from '../../services/vehicleService';
import { PaymentService, PaymentRecord } from '../../services/paymentService';
import { Vehicle, Customer, Rental } from '../../types';
import { NotificationToast } from './NotificationToast';
import { ConfirmationModal } from './ConfirmationModal';
import { formatDateBR } from '../../utils/dateFormatter';

// Função para formatar data e hora no padrão brasileiro
const formatDateTimeBR = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  rental: any | null;
  customer: any | null;
  vehicle: any | null;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  payment,
  rental,
  customer,
  vehicle
}) => {
  const [locationName, setLocationName] = React.useState<string>('');

  React.useEffect(() => {
    if (isOpen && rental?.pickupLocation) {
      getLocationName(rental.pickupLocation).then(setLocationName);
    }
  }, [isOpen, rental]);

  if (!isOpen || !payment) return null;

  const isAutomaticPayment = payment.notes?.includes('Pagamento automático') || false;
  const isManualPayment = !isAutomaticPayment;

  const getPaymentTypeText = (type: string) => {
    if (type === 'pagamento') return 'Pagamento de Locação';
    if (type === 'reembolso') return 'Reembolso';
    if (type === 'deposito') return 'Depósito';
    if (type === 'multa') return 'Multa';
    if (type === 'taxa_adicional') return 'Taxa Adicional';
    return type;
  };

  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'pix': 'PIX',
      'transferencia': 'Transferência',
      'boleto': 'Boleto'
    };
    return methods[method] || method;
  };

  const getStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      'pendente': 'Pendente',
      'processando': 'Processando',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'cancelado': 'Cancelado'
    };
    return statuses[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black">Detalhes do Pagamento</h2>
              <p className="text-gray-600">#{payment.id.slice(-8).toUpperCase()}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Tipo de Pagamento */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Informações do Pagamento
                {isAutomaticPayment && (
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    🤖 AUTOMÁTICO
                  </span>
                )}
                {isManualPayment && (
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    👤 MANUAL
                  </span>
                )}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">Código da Reserva</p>
                  <p className="font-semibold text-black font-mono">
                    {rental?.rental_number || 'N/A'}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">Tipo de Transação</p>
                  <p className="font-semibold text-black">
                    {rental?.rental_number ? `Pagamento da locação #${rental.rental_number}` : getPaymentTypeText(payment.paymentType)}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">Valor</p>
                  <p className="font-semibold text-green-600 text-lg">
                    {payment.paymentType === 'reembolso' ? '- R$ ' : '+ R$ '}{payment.amount.toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">Forma de Pagamento</p>
                  <p className="font-semibold text-black">{getPaymentMethodText(payment.paymentMethod)}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">Data do Pagamento</p>
                  <p className="font-semibold text-black">{formatDateTimeBR(payment.paymentDate)}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-black">{getStatusText(payment.status)}</p>
                </div>

                {payment.transactionId && (
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">ID da Transação</p>
                    <p className="font-semibold text-black font-mono text-sm">{payment.transactionId}</p>
                  </div>
                )}
              </div>

              {payment.notes && !payment.notes.includes('Pagamento da locação') && (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Observações Adicionais</p>
                  <p className="text-black">{payment.notes}</p>
                </div>
              )}
            </div>

            {/* Detalhes da Locação */}
            {rental && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Detalhes da Locação
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">ID da Locação</p>
                    <p className="font-semibold text-black">#{rental.id?.slice(-8).toUpperCase()}</p>
                  </div>
                  
                  {customer && (
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="font-semibold text-black">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                      <p className="text-sm text-gray-500">CPF: {customer.cpf}</p>
                    </div>
                  )}
                  
                  {vehicle && (
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-sm text-gray-600">Veículo</p>
                      <p className="font-semibold text-black">{vehicle.name}</p>
                      <p className="text-sm text-gray-500">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
                      <p className="text-sm text-gray-500">Placa: {vehicle.licensePlate || 'N/A'}</p>
                    </div>
                  )}
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">Data de Retirada</p>
                    <p className="font-semibold text-black">{formatDateBR(rental.pickupDate)}</p>
                    <p className="text-sm text-gray-500">às {rental.pickupTime}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">Data de Devolução</p>
                    <p className="font-semibold text-black">{formatDateBR(rental.returnDate)}</p>
                    <p className="text-sm text-gray-500">às {rental.returnTime}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">Local de Retirada</p>
                    <p className="font-semibold text-black">{locationName || rental.pickupLocation}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">Status da Locação</p>
                    <p className="font-semibold text-black">
                      {rental.status === 'pending' ? 'Pendente' :
                       rental.status === 'active' ? 'Ativa' :
                       rental.status === 'completed' ? 'Concluída' : 'Cancelada'}
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">Status do Pagamento</p>
                    <p className="font-semibold text-black">
                      {rental.paymentStatus === 'pending' ? 'Pendente' :
                       rental.paymentStatus === 'paid' ? 'Pago' : 'Em Atraso'}
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">Valor Total da Locação</p>
                    <p className="font-semibold text-green-600 text-lg">R$ {rental.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Informações de quem processou */}
                <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Processado por</p>
                  <p className="text-black font-semibold">
                    {payment.createdBy ? 'Usuário do sistema' : 'Sistema automático'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Criado em {formatDateTimeBR(payment.createdAt)}
                  </p>
                </div>

                {rental.notes && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Observações da Locação</p>
                    <p className="text-black">{rental.notes}</p>
                  </div>
                )}

                {customer?.address && (
                  <div className="mt-4 bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Endereço do Cliente</p>
                    <p className="text-black">{customer.address}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payment: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  payment?: PaymentRecord | null;
  rentals: Rental[];
  title: string;
}

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  payment,
  rentals,
  title
}) => {
  const [formData, setFormData] = useState<Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>>({
    rentalId: '',
    paymentType: 'Pagamento de Locação',
    amount: 0,
    paymentMethod: 'dinheiro',
    paymentDate: new Date().toISOString(),
    status: 'aprovado',
    notes: ''
  });
  
  const [transactionType, setTransactionType] = useState<'receita' | 'despesa'>('receita');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    
    if (payment) {
      setFormData({
        rentalId: payment.rentalId,
        paymentType: payment.notes?.includes('Pagamento da locação') ? payment.notes : payment.paymentType,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        dueDate: payment.dueDate,
        status: payment.status,
        transactionId: payment.transactionId,
        receiptUrl: payment.receiptUrl,
        notes: payment.notes || ''
      });
      setTransactionType(payment.paymentType === 'reembolso' ? 'despesa' : 'receita');
    } else {
      setFormData({
        rentalId: '',
        paymentType: 'Locação',
        amount: 0,
        paymentMethod: 'dinheiro',
        paymentDate: new Date().toISOString(),
        status: 'aprovado',
        notes: ''
      });
      setTransactionType('receita');
    }
    setErrors({});
  }, [payment, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paymentType.trim()) {
      newErrors.paymentType = 'Tipo de transação é obrigatório';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const finalFormData = {
      ...formData,
      paymentType: transactionType === 'despesa' ? 'reembolso' : 'pagamento',
      amount: Math.abs(formData.amount)
    };
    
    onSubmit(finalFormData);
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Informações da Transação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Transação *
                  </label>
                  <div className="flex space-x-4 mb-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="transactionType"
                        value="receita"
                        checked={transactionType === 'receita'}
                        onChange={(e) => setTransactionType(e.target.value as 'receita' | 'despesa')}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-green-700">💰 Receita</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="transactionType"
                        value="despesa"
                        checked={transactionType === 'despesa'}
                        onChange={(e) => setTransactionType(e.target.value as 'receita' | 'despesa')}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-red-700">💸 Despesa</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.paymentType ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.paymentType}
                    onChange={(e) => handleInputChange('paymentType', e.target.value)}
                    placeholder={transactionType === 'receita' ? 'Ex: Locação, Taxa Adicional, Multa' : 'Ex: Reembolso, Manutenção, Combustível'}
                  />
                  {errors.paymentType && <p className="text-red-500 text-xs mt-1">{errors.paymentType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {transactionType === 'receita' ? 'Valor Recebido (R$) *' : 'Valor da Despesa (R$) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                   onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${
                      transactionType === 'receita' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-red-500 focus:border-red-500'
                    } ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder={transactionType === 'receita' ? 'Valor recebido' : 'Valor gasto'}
                  />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pagamento *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  >
                    <option value="dinheiro">Dinheiro em Espécie</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="pix">PIX</option>
                    <option value="transferencia">Transferência</option>
                    <option value="boleto">Boleto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="processando">Processando</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="rejeitado">Rejeitado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Locação (Opcional)
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.rentalId}
                    onChange={(e) => handleInputChange('rentalId', e.target.value)}
                  >
                    <option value="">Transação manual (não vinculada à locação)</option>
                    {rentals.map((rental) => (
                      <option key={rental.id} value={rental.id}>
                        #{rental.id.slice(-8).toUpperCase()} - R$ {rental.totalAmount.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Transação
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.paymentDate ? formData.paymentDate.slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.dueDate || ''}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Observações sobre a transação..."
                  />
                </div>
              </div>
            </div>

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
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Check className="h-5 w-5" />
                <span>{payment ? 'Atualizar' : 'Registrar'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const FinancialManagement: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRecord | null>(null);

  // Payment details modal
  const [paymentToView, setPaymentToView] = useState<PaymentRecord | null>(null);
  const [paymentRental, setPaymentRental] = useState<any | null>(null);
  const [paymentCustomer, setPaymentCustomer] = useState<any | null>(null);
  const [paymentVehicle, setPaymentVehicle] = useState<any | null>(null);

  // Fixed notification state
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  // FIXED: Load data only once on mount - NO INFINITE LOOPS
  useEffect(() => {
    let isMounted = true;
    
    const loadAllData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Carregando dados financeiros...');
        
        const [paymentData, rentalData, customerData, vehicleData] = await Promise.all([
          PaymentService.getAll(),
          RentalService.getAll(),
          CustomerService.getAll(),
          VehicleService.getAll()
        ]);
        
        if (isMounted) {
          setPayments(paymentData);
          setRentals(rentalData);
          setCustomers(customerData);
          setVehicles(vehicleData);
          console.log('✅ Dados carregados:', {
            payments: paymentData.length,
            rentals: rentalData.length,
            customers: customerData.length,
            vehicles: vehicleData.length
          });
        }
      } catch (error) {
        console.error('❌ Erro carregando dados financeiros:', error);
        if (isMounted) {
          setPayments([]);
          setRentals([]);
          setCustomers([]);
          setVehicles([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAllData();

    return () => {
      isMounted = false;
    };
  }, []); // ONLY RUN ONCE

  // Fixed helper functions - NO DEPENDENCIES TO AVOID LOOPS
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const reloadPaymentsOnly = async () => {
    try {
      console.log('🔄 Recarregando apenas pagamentos...');
      const newPayments = await PaymentService.getAll();
      setPayments(newPayments);
      console.log('✅ Pagamentos recarregados:', newPayments.length);
    } catch (error) {
      console.error('❌ Erro recarregando pagamentos:', error);
    }
  };

  const handleCreatePayment = async (paymentData: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('💰 Criando nova transação:', paymentData);
      await PaymentService.create(paymentData);
      await reloadPaymentsOnly();
      showNotification('success', 'Transação Registrada', 'Transação foi registrada com sucesso!');
      setShowAddModal(false);
    } catch (error) {
      console.error('❌ Erro criando transação:', error);
      showNotification('error', 'Erro ao Registrar', 'Não foi possível registrar a transação. Tente novamente.');
    }
  };

  const handleUpdatePayment = async (paymentData: PaymentRecord) => {
    if (!editingPayment) return;
    
    try {
      console.log('📝 Atualizando transação:', paymentData);
      await PaymentService.update(editingPayment.id, paymentData);
      await reloadPaymentsOnly();
      showNotification('success', 'Transação Atualizada', 'Transação foi atualizada com sucesso!');
      setEditingPayment(null);
    } catch (error) {
      console.error('❌ Erro atualizando transação:', error);
      showNotification('error', 'Erro ao Atualizar', 'Não foi possível atualizar a transação. Tente novamente.');
    }
  };

  const handleDeletePayment = async () => {
    if (paymentToDelete) {
      try {
        console.log('🗑️ Excluindo transação:', paymentToDelete.id);
        await PaymentService.delete(paymentToDelete.id);
        await reloadPaymentsOnly();
        showNotification('success', 'Transação Excluída', 'Transação foi excluída com sucesso!');
      } catch (error) {
        console.error('❌ Erro excluindo transação:', error);
        showNotification('error', 'Erro ao Excluir', 'Não foi possível excluir a transação. Tente novamente.');
      }
    }
  };

  const handleViewPayment = async (payment: PaymentRecord) => {
    setPaymentToView(payment);
    
    // Load related data if payment is linked to a rental
    if (payment.rentalId) {
      try {
        const rental = rentals.find(r => r.id === payment.rentalId);
        setPaymentRental(rental || null);
        
        if (rental) {
          const customer = customers.find(c => c.id === rental.customerId);
          const vehicle = vehicles.find(v => v.id === rental.vehicleId);
          setPaymentCustomer(customer || null);
          setPaymentVehicle(vehicle || null);
        } else {
          setPaymentCustomer(null);
          setPaymentVehicle(null);
        }
      } catch (error) {
        console.error('Error loading payment details:', error);
        setPaymentRental(null);
        setPaymentCustomer(null);
        setPaymentVehicle(null);
      }
    } else {
      setPaymentRental(null);
      setPaymentCustomer(null);
      setPaymentVehicle(null);
    }
  };

  const handleDownloadReport = () => {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    const csvHeaders = [
      'ID',
      'Tipo',
      'Descrição',
      'Valor (R$)',
      'Forma Pagamento',
      'Data',
      'Status',
      'Observações'
    ];
    
    const csvRows = filteredPayments.map(payment => [
      payment.id.slice(-8).toUpperCase(),
      getPaymentTypeText(payment.paymentType),
      getTransactionDescription(payment),
      payment.amount.toFixed(2).replace('.', ','),
      getPaymentMethodText(payment.paymentMethod),
      formatDateBR(payment.paymentDate),
      getPaymentStatusText(payment.status),
      payment.notes || ''
    ]);
    
    const csvContent = [
      csvHeaders.join(';'),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_financeiro_${currentDate.replace(/\//g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('success', 'Download Concluído', 'Relatório financeiro baixado com sucesso!');
  };

  // Helper functions - FIXED AND STABLE
  const getTransactionDescription = (payment: PaymentRecord) => {
    // Usar código da reserva se disponível
    if (payment.rentalId) {
      const customer = getCustomerNameByRental(payment.rentalId);
      const rental = rentals.find(r => r.id === payment.rentalId);
      const rentalNumber = 'LOC' + payment.rentalId.slice(-8).toUpperCase();
      
      if (payment.notes?.includes('Pagamento da locação')) {
        return payment.notes;
      }
      
      return `Pagamento da locação #${rentalNumber} - ${customer}`;
    }
    return getPaymentTypeText(payment.paymentType);
  };

  const getCustomerNameByRental = (rentalId: string) => {
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) return 'Transação manual';
    
    const customer = customers.find(c => c.id === rental.customerId);
    return customer?.name || 'Cliente não encontrado';
  };

  const getVehicleNameByRental = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.name || vehicle?.brand + ' ' + vehicle?.model || 'Veículo N/A';
  };

  const getPaymentTypeText = (type: string) => {
    if (type === 'pagamento') return 'Pagamento de Locação';
    if (type === 'reembolso') return 'Reembolso';
    if (type === 'deposito') return 'Depósito';
    if (type === 'multa') return 'Multa';
    if (type === 'taxa_adicional') return 'Taxa Adicional';
    return type;
  };

  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'pix': 'PIX',
      'transferencia': 'Transferência',
      'boleto': 'Boleto'
    };
    return methods[method] || method;
  };

  const getPaymentStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      'pendente': 'Pendente',
      'processando': 'Processando',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'cancelado': 'Cancelado'
    };
    return statuses[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'processando':
        return 'bg-blue-100 text-blue-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'reembolso':
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
      default:
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
    }
  };

  // FIXED: Filter payments without causing loops
  const filteredPayments = payments.filter(payment => {
    const description = getTransactionDescription(payment);
    
    const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesType = filterType === 'all' || payment.paymentType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // FIXED: Calculate financial summary without causing loops
  const totalReceitas = payments
    .filter(p => p.status === 'aprovado' && p.paymentType !== 'reembolso')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalDespesas = payments
    .filter(p => p.status === 'aprovado' && p.paymentType === 'reembolso')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPendente = payments
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.amount, 0);

  const lucroLiquido = totalReceitas - totalDespesas;

  const monthlyRevenue = payments
    .filter(p => {
      const paymentDate = new Date(p.paymentDate);
      const currentDate = new Date();
      return p.status === 'aprovado' && 
             p.paymentType !== 'reembolso' &&
             paymentDate.getMonth() === currentDate.getMonth() &&
             paymentDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-center">
          <p className="text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-black">Gestão Financeira</h1>
          <p className="text-gray-600">Controle de receitas, despesas e pagamentos</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleDownloadReport}
            className="bg-green-500 hover:bg-green-600 text-white px-4 lg:px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Baixar Relatório</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 lg:px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Receitas</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">
                R$ {totalReceitas.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <ArrowUpCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Despesas</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">
                R$ {totalDespesas.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <ArrowDownCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
              <p className={`text-xl lg:text-2xl font-bold ${
                lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                R$ {lucroLiquido.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mês</p>
              <p className="text-xl lg:text-2xl font-bold text-blue-600">
                R$ {monthlyRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar transações..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os Tipos</option>
              <option value="pagamento">Receitas</option>
              <option value="reembolso">Despesas</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="processando">Processando</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Rejeitados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-yellow-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forma
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTransactionTypeIcon(payment.paymentType)}
                      <span className="text-sm font-medium text-black">
                        {getPaymentTypeText(payment.paymentType)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                    {getTransactionDescription(payment)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className={payment.paymentType === 'reembolso' ? 'text-red-600' : 'text-green-600'}>
                      {payment.paymentType === 'reembolso' ? '- R$ ' : '+ R$ '}{payment.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                    {getPaymentMethodText(payment.paymentMethod)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                    {formatDateBR(payment.paymentDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(payment.status)}`}>
                      {getPaymentStatusText(payment.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewPayment(payment)}
                        className="text-green-600 hover:text-green-900"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setEditingPayment(payment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setPaymentToDelete(payment)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">Nenhuma transação encontrada</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou registre uma nova transação.</p>
        </div>
      )}

      {/* Add Payment Modal */}
      <PaymentFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreatePayment}
        rentals={rentals}
        title="Registrar Nova Transação"
      />

      {/* Edit Payment Modal */}
      <PaymentFormModal
        isOpen={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        onSubmit={handleUpdatePayment}
        payment={editingPayment}
        rentals={rentals}
        title="Editar Transação"
      />

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        isOpen={!!paymentToView}
        onClose={() => {
          setPaymentToView(null);
          setPaymentRental(null);
          setPaymentCustomer(null);
          setPaymentVehicle(null);
        }}
        payment={paymentToView}
        rental={paymentRental}
        customer={paymentCustomer}
        vehicle={paymentVehicle}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={handleDeletePayment}
        type="delete"
        title="Excluir Transação"
        message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
        itemName={paymentToDelete ? `#${paymentToDelete.id.slice(-8).toUpperCase()}` : undefined}
        confirmText="Excluir"
        cancelText="Cancelar"
      />

      {/* Notification Toast */}
      <NotificationToast
        isVisible={notification.isVisible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </div>
  );
};