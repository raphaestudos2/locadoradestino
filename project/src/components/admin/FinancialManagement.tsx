import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  CreditCard,
  Banknote,
  PiggyBank,
  Receipt,
  Eye,
  Check,
  X
} from 'lucide-react';
import { getRentalsFromStorage, getCustomersFromStorage } from '../../utils/rentalStorage';
import { VehicleService } from '../../services/vehicleService';
import { Vehicle, Customer, Rental } from '../../types';
import { ConfirmationModal } from './ConfirmationModal';
import { NotificationToast } from './NotificationToast';

interface FinancialRecord {
  id: string;
  type: 'receita' | 'despesa';
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: 'pendente' | 'pago' | 'cancelado';
  rentalId?: string;
  notes?: string;
}

interface FinancialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<FinancialRecord, 'id'> | FinancialRecord) => void;
  record?: FinancialRecord | null;
  title: string;
}

const FinancialFormModal: React.FC<FinancialFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  record,
  title
}) => {
  const [formData, setFormData] = useState<Omit<FinancialRecord, 'id'>>({
    type: 'receita',
    category: 'locacao',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'dinheiro',
    status: 'pago',
    notes: ''
  });

  useEffect(() => {
    if (record) {
      setFormData({
        type: record.type,
        category: record.category,
        description: record.description,
        amount: record.amount,
        date: record.date,
        paymentMethod: record.paymentMethod,
        status: record.status,
        rentalId: record.rentalId,
        notes: record.notes || ''
      });
    } else {
      setFormData({
        type: 'receita',
        category: 'locacao',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'dinheiro',
        status: 'pago',
        notes: ''
      });
    }
  }, [record, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (record) {
      onSubmit({ ...record, ...formData });
    } else {
      onSubmit(formData);
    }
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <h3 className="text-lg font-semibold text-black mb-4">Informações Financeiras</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {formData.type === 'receita' ? (
                      <>
                        <option value="locacao">Locação</option>
                        <option value="multa">Multa</option>
                        <option value="taxa_adicional">Taxa Adicional</option>
                        <option value="deposito">Depósito</option>
                      </>
                    ) : (
                      <>
                        <option value="manutencao">Manutenção</option>
                        <option value="combustivel">Combustível</option>
                        <option value="seguro">Seguro</option>
                        <option value="licenciamento">Licenciamento</option>
                        <option value="limpeza">Limpeza</option>
                        <option value="outros">Outros</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descrição da transação"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
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
                    <option value="dinheiro">Dinheiro</option>
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
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
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
                    placeholder="Observações adicionais..."
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
                <span>{record ? 'Atualizar' : 'Criar'} Registro</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const FinancialManagement: React.FC = () => {
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<FinancialRecord | null>(null);

  // Notification state
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rentalData, customerData, vehicleData] = await Promise.all([
        Promise.resolve(getRentalsFromStorage()),
        Promise.resolve(getCustomersFromStorage()),
        VehicleService.getAll()
      ]);
      
      setRentals(rentalData);
      setCustomers(customerData);
      setVehicles(vehicleData);
      
      // Load financial records from localStorage
      const savedRecords = localStorage.getItem('financialRecords');
      let records: FinancialRecord[] = savedRecords ? JSON.parse(savedRecords) : [];
      
      // Auto-generate rental income records
      const rentalRecords = rentalData
        .filter((rental: Rental) => rental.status === 'completed' || rental.paymentStatus === 'paid')
        .map((rental: Rental) => {
          const customer = customerData.find((c: Customer) => c.id === rental.customerId);
          const vehicle = vehicleData.find((v: Vehicle) => v.id === rental.vehicleId);
          
          return {
            id: `rental-${rental.id}`,
            type: 'receita' as const,
            category: 'locacao',
            description: `Locação - ${vehicle?.name || 'Veículo'} - ${customer?.name || 'Cliente'}`,
            amount: rental.totalAmount,
            date: rental.pickupDate,
            paymentMethod: 'cartao_credito',
            status: rental.paymentStatus === 'paid' ? 'pago' as const : 'pendente' as const,
            rentalId: rental.id,
            notes: `Período: ${rental.pickupDate} a ${rental.returnDate}`
          };
        });
      
      // Merge manual records with auto-generated rental records
      const allRecords = [...records, ...rentalRecords];
      setFinancialRecords(allRecords);
      
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecordId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleCreateRecord = (recordData: Omit<FinancialRecord, 'id'>) => {
    const newRecord: FinancialRecord = {
      ...recordData,
      id: generateRecordId()
    };
    
    // Only save manual records to localStorage (not auto-generated rental records)
    if (!recordData.rentalId) {
      const savedRecords = localStorage.getItem('financialRecords');
      const records: FinancialRecord[] = savedRecords ? JSON.parse(savedRecords) : [];
      const updatedRecords = [newRecord, ...records];
      localStorage.setItem('financialRecords', JSON.stringify(updatedRecords));
    }
    
    setFinancialRecords(prev => [newRecord, ...prev]);
    const recordType = recordData.type === 'receita' ? 'Receita' : 'Despesa';
    showNotification('success', `${recordType} Cadastrada`, `${recordData.description} foi cadastrada com sucesso!`);
    setShowAddModal(false);
  };

  const handleUpdateRecord = (recordData: FinancialRecord) => {
    // Only update manual records (not auto-generated rental records)
    if (!recordData.rentalId) {
      const savedRecords = localStorage.getItem('financialRecords');
      const records: FinancialRecord[] = savedRecords ? JSON.parse(savedRecords) : [];
      const updatedRecords = records.map(record => 
        record.id === recordData.id ? recordData : record
      );
      localStorage.setItem('financialRecords', JSON.stringify(updatedRecords));
    }
    
    setFinancialRecords(prev => prev.map(record => 
      record.id === recordData.id ? recordData : record
    ));
    const recordType = recordData.type === 'receita' ? 'Receita' : 'Despesa';
    showNotification('success', `${recordType} Atualizada`, `${recordData.description} foi atualizada com sucesso!`);
    setEditingRecord(null);
  };

  const handleDeleteRecord = () => {
    if (recordToDelete && !recordToDelete.rentalId) {
      const savedRecords = localStorage.getItem('financialRecords');
      const records: FinancialRecord[] = savedRecords ? JSON.parse(savedRecords) : [];
      const updatedRecords = records.filter(r => r.id !== recordToDelete.id);
      localStorage.setItem('financialRecords', JSON.stringify(updatedRecords));
      
      setFinancialRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
      const recordType = recordToDelete.type === 'receita' ? 'Receita' : 'Despesa';
      showNotification('success', `${recordType} Excluída`, `${recordToDelete.description} foi excluída com sucesso!`);
    }
  };

  const filteredRecords = financialRecords.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate totals
  const totalReceitas = filteredRecords
    .filter(r => r.type === 'receita' && r.status === 'pago')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalDespesas = filteredRecords
    .filter(r => r.type === 'despesa' && r.status === 'pago')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const saldoTotal = totalReceitas - totalDespesas;

  const getTypeColor = (type: string) => {
    return type === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-black">Gestão Financeira</h1>
          <p className="text-gray-600">Controle de receitas e despesas</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 lg:px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Registro</span>
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Receitas</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg self-start sm:self-auto">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Despesas</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg self-start sm:self-auto">
              <Receipt className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Total</p>
              <p className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {saldoTotal.toFixed(2)}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg self-start sm:self-auto">
              <PiggyBank className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar registros..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os Tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="pago">Pagos</option>
              <option value="pendente">Pendentes</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Records Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-yellow-200">
        {/* Mobile Cards */}
        <div className="lg:hidden">
          <div className="divide-y divide-gray-200">
            {filteredRecords.map((record) => (
              <div key={record.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(record.type)}`}>
                      {record.type === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status === 'pago' ? 'Pago' : record.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${
                    record.type === 'receita' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {record.type === 'receita' ? '+' : '-'}R$ {record.amount.toFixed(2)}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-black">{record.description}</h3>
                  <p className="text-sm text-gray-600 capitalize">{record.category.replace('_', ' ')}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                  <span>{getPaymentMethodText(record.paymentMethod)}</span>
                </div>
                
                {record.notes && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {record.notes}
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button className="text-yellow-600 hover:text-yellow-900 p-1">
                    <Eye className="h-4 w-4" />
                  </button>
                  {!record.rentalId && (
                    <>
                      <button 
                        onClick={() => setEditingRecord(record)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setRecordToDelete(record)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {record.rentalId && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Auto
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {new Date(record.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-black">{record.description}</div>
                    {record.notes && (
                      <div className="text-xs text-gray-500 mt-1">{record.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black capitalize">
                    {record.category.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(record.type)}`}>
                      {record.type === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${
                      record.type === 'receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.type === 'receita' ? '+' : '-'}R$ {record.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {getPaymentMethodText(record.paymentMethod)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status === 'pago' ? 'Pago' : record.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-yellow-600 hover:text-yellow-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      {!record.rentalId && (
                        <>
                          <button 
                            onClick={() => setEditingRecord(record)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setRecordToDelete(record)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {record.rentalId && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Auto
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">Nenhum registro encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou adicione um novo registro.</p>
        </div>
      )}

      {/* Add Record Modal */}
      <FinancialFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateRecord}
        title="Novo Registro Financeiro"
      />

      {/* Edit Record Modal */}
      <FinancialFormModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSubmit={handleUpdateRecord}
        record={editingRecord}
        title="Editar Registro Financeiro"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDeleteRecord}
        type="delete"
        title="Excluir Registro"
        message="Tem certeza que deseja excluir este registro financeiro? Esta ação não pode ser desfeita."
        itemName={recordToDelete?.description}
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