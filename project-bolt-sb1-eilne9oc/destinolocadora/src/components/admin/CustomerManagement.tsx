import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  History,
  Filter,
  Users,
  Phone,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  X,
  Eye,
  Car,
  MapPin,
  DollarSign,
  Clock
} from 'lucide-react';
import { Info } from 'lucide-react';
import { Customer } from '../../types';
import { CustomerService } from '../../services/customerService';
import { RentalService } from '../../services/rentalService';
import { VehicleService } from '../../services/vehicleService';
import { ConfirmationModal } from './ConfirmationModal';
import { CustomerFormModal } from './CustomerFormModal';
import { RentalFormModal } from './RentalFormModal';
import { NotificationToast } from './NotificationToast';
import { formatDateBR } from '../../utils/dateFormatter';

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  const [rentals, setRentals] = React.useState<any[]>([]);
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen && customer) {
      loadCustomerHistory();
    }
  }, [isOpen, customer]);

  const loadCustomerHistory = async () => {
    try {
      setLoading(true);
      const [customerRentals, vehicleData] = await Promise.all([
        RentalService.getByCustomer(customer?.id || ''),
        VehicleService.getAll()
      ]);

      setRentals(customerRentals);
      setVehicles(vehicleData);
    } catch (error) {
      console.error('Error loading customer history:', error);
      setRentals([]);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.name || vehicle?.brand + ' ' + vehicle?.model || 'Veículo não encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendente';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'overdue':
        return 'Em Atraso';
      default:
        return 'Pendente';
    }
  };

  const calculateTotalSpent = () => {
    return rentals
      .filter(rental => rental.paymentStatus === 'paid')
      .reduce((total, rental) => total + rental.totalAmount, 0);
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black">Histórico de Locações</h2>
              <p className="text-gray-600">{customer.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando histórico...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total de Locações</p>
                      <p className="text-2xl font-bold text-blue-800">{rentals.length}</p>
                    </div>
                    <Car className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Gasto</p>
                      <p className="text-2xl font-bold text-green-800">
                        R$ {calculateTotalSpent().toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Locações Ativas</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {rentals.filter(r => r.status === 'active').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Rentals List */}
              {rentals.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Histórico Detalhado</h3>
                  <div className="grid gap-4">
                    {rentals.map((rental) => (
                      <div key={rental.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-black">
                                {getVehicleName(rental.vehicleId)}
                              </h4>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rental.status)}`}>
                                {getStatusText(rental.status)}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(rental.paymentStatus)}`}>
                                {getPaymentStatusText(rental.paymentStatus)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{rental.pickupDate} - {rental.returnDate}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{rental.pickupTime} - {rental.returnTime}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{rental.pickupLocation}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-black">
                              R$ {rental.totalAmount.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: #{rental.id.slice(-8).toUpperCase()}
                            </div>
                          </div>
                        </div>

                        {rental.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700">
                              <strong>Observações:</strong> {rental.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-black mb-2">Nenhuma locação encontrada</h3>
                  <p className="text-gray-600">Este cliente ainda não realizou nenhuma locação.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [selectedCustomerForRental, setSelectedCustomerForRental] = useState<Customer | null>(null);

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

  const [debugInfo, setDebugInfo] = useState<{
    loading: boolean;
    customerCount: number;
    lastError: string | null;
  }>({
    loading: false,
    customerCount: 0,
    lastError: null
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
    let isMounted = true;
    
    const loadAllCustomers = async () => {
      try {
        setLoading(true);
        setDebugInfo(prev => ({ ...prev, loading: true, lastError: null }));
        console.log('🔄 Carregando clientes...');
        const customersData = await CustomerService.getAll();
        
        if (isMounted) {
          setCustomers(customersData);
          setDebugInfo(prev => ({ 
            ...prev, 
            loading: false, 
            customerCount: customersData.length,
            lastError: null 
          }));
          console.log('✅ Clientes carregados:', customersData.length);
        }
      } catch (error) {
        console.error('❌ Erro carregando clientes:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        if (isMounted) {
          setCustomers([]);
          setDebugInfo(prev => ({ 
            ...prev, 
            loading: false, 
            customerCount: 0,
            lastError: errorMessage 
          }));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAllCustomers();

    return () => {
      isMounted = false;
    };
  }, []); // ONLY RUN ONCE

  const loadAllCustomers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando clientes...');
      const customersData = await CustomerService.getAll();
      setCustomers(customersData);
      console.log('✅ Clientes carregados:', customersData.length);
    } catch (error) {
      console.error('❌ Erro carregando clientes:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Reload only customers to avoid full page reload
  const reloadCustomersOnly = async () => {
    try {
      console.log('🔄 Recarregando apenas clientes...');
      const newCustomers = await CustomerService.getAll();
      setCustomers(newCustomers);
      console.log('✅ Clientes recarregados:', newCustomers.length);
    } catch (error) {
      console.error('❌ Erro recarregando clientes:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const generateCustomerId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleCreateCustomer = async (customerData: Omit<Customer, 'id' | 'registrationDate' | 'totalRentals'>) => {
    try {
      console.log('🆕 Criando novo cliente:', customerData);
      
      // Validate required fields
      if (!customerData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!customerData.email?.trim()) {
        throw new Error('Email é obrigatório');
      }
      if (!customerData.cpf?.trim()) {
        throw new Error('CPF é obrigatório');
      }
      if (!customerData.phone?.trim()) {
        throw new Error('Telefone é obrigatório');
      }
      if (!customerData.cnh?.trim()) {
        throw new Error('CNH é obrigatória');
      }
      
      await CustomerService.create(customerData);
      await reloadCustomersOnly();
      showNotification('success', 'Cliente Cadastrado', `${customerData.name} foi cadastrado com sucesso!`);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showNotification('error', 'Erro ao Cadastrar', errorMessage);
    }
  };

  const handleUpdateCustomer = async (customerData: Customer) => {
    console.log('📝 handleUpdateCustomer called:', { 
      editingCustomer: editingCustomer?.id, 
      customerData: customerData.id,
      name: customerData.name 
    });
    
    try {
      console.log('✅ Cliente encontrado, atualizando no banco:', customerData);
      await CustomerService.update(customerData.id, customerData);
      console.log('✅ Cliente atualizado no banco, recarregando lista...');
      await reloadCustomersOnly();
      console.log('✅ Lista recarregada, mostrando notificação...');
      showNotification('success', 'Cliente Atualizado', `${customerData.name} foi atualizado com sucesso!`);
      setEditingCustomer(null);
      console.log('✅ Modal fechado, processo completo');
    } catch (error) {
      console.error('Error updating customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showNotification('error', 'Erro ao Atualizar', errorMessage);
    }
  };

  const handleDeleteCustomer = async () => {
    if (customerToDelete) {
      try {
        console.log('🗑️ Excluindo cliente:', customerToDelete.id);
        await CustomerService.delete(customerToDelete.id);
        await reloadCustomersOnly();
        showNotification('success', 'Cliente Excluído', `${customerToDelete.name} foi excluído com sucesso!`);
      } catch (error) {
        console.error('Error deleting customer:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        if (errorMessage.includes('foreign key') || errorMessage.includes('referenced')) {
          showNotification('warning', 'Cliente com Locações', 'Este cliente possui locações ativas. Status alterado para "Bloqueado".');
          // Fallback: block instead of delete
          try {
            await CustomerService.update(customerToDelete.id, { status: 'blocked' });
            await reloadCustomersOnly();
          } catch (blockError) {
            showNotification('error', 'Erro ao Bloquear', 'Não foi possível bloquear o cliente.');
          }
        } else {
          showNotification('error', 'Erro ao Excluir', errorMessage);
        }
      }
    }
  };

  const toggleCustomerStatus = async () => {
    if (customerToToggle) {
      // Verificar se o cliente ainda existe na lista atual
      const customerExists = customers.find(c => c.id === customerToToggle.id);
      if (!customerExists) {
        showNotification('error', 'Cliente Não Encontrado', 'O cliente pode ter sido removido ou alterado por outro usuário.');
        setCustomerToToggle(null);
        return;
      }

      try {
        console.log('🔄 Alterando status do cliente:', customerToToggle.id);
        const newStatus = customerToToggle.status === 'active' ? 'inactive' : 'active';
        await CustomerService.update(customerToToggle.id, { status: newStatus });
        await reloadCustomersOnly();
        const statusText = newStatus === 'active' ? 'ativado' : 'desativado';
        showNotification('success', 'Status Alterado', `${customerToToggle.name} foi ${statusText} com sucesso!`);
      } catch (error) {
        console.error('Error toggling customer status:', error);
        showNotification('error', 'Erro ao Alterar Status', 'Não foi possível alterar o status do cliente.');
      }
      finally {
        setCustomerToToggle(null);
      }
    }
  };



  const handleRentalCreated = async (rentalData: any) => {
    try {
      console.log('🆕 Criando locação para cliente:', rentalData);
      
      // Validate rental data
      if (!rentalData.customerId) {
        throw new Error('Cliente não selecionado');
      }
      if (!rentalData.vehicleId) {
        throw new Error('Veículo não selecionado');
      }
      if (!rentalData.pickupDate || !rentalData.returnDate) {
        throw new Error('Datas de retirada e devolução são obrigatórias');
      }
      
      await RentalService.create(rentalData);
      await reloadCustomersOnly();
      showNotification('success', 'Locação Criada', 'Nova locação foi criada com sucesso!');
      setShowRentalModal(false);
      setSelectedCustomerForRental(null);
    } catch (error) {
      console.error('Error creating rental:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showNotification('error', 'Erro ao Criar Locação', errorMessage);
    }
  };

  const handleCreateRentalForCustomer = (customer: Customer) => {
    console.log('📝 Iniciando criação de locação para cliente:', customer.name, customer.id);
    setSelectedCustomerForRental(customer);
    setShowRentalModal(true);
  };
  // Debug info for development
  const showDebugInfo = debugInfo.lastError || customers.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-black">Gestão de Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes cadastrados</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 lg:px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Adicionar Cliente</span>
        </button>
      </div>

      {/* Debug Info */}
      {showDebugInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="h-5 w-5 text-blue-500" />
            <span className="text-blue-700 font-medium">Informações do Sistema</span>
          </div>
          <div className="text-blue-600 text-sm space-y-1">
            <p>• Total de clientes carregados: {customers.length}</p>
            <p>• Status do carregamento: {debugInfo.loading ? 'Carregando...' : 'Concluído'}</p>
            {debugInfo.lastError && (
              <p className="text-red-600">• Último erro: {debugInfo.lastError}</p>
            )}
            {customers.length === 0 && !debugInfo.loading && (
              <p className="text-yellow-600 font-medium">
                • Nenhum cliente encontrado. Supabase pode não estar configurado ou não há dados.
              </p>
            )}
          </div>
        </div>
      )}
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Cards / Desktop Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-yellow-200">
        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-black">{customer.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' :
                    customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {customer.status === 'active' ? 'Ativo' :
                     customer.status === 'inactive' ? 'Inativo' : 'Bloqueado'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Desde {new Date(customer.registrationDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-600">{customer.totalRentals} locações</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCustomerHistory(customer)}
                      className="text-yellow-600 hover:text-yellow-900 p-1"
                      title="Ver histórico de locações"
                    >
                      <History className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCreateRentalForCustomer(customer)}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Criar nova locação"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setEditingCustomer(customer)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Editar cliente"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setCustomerToToggle(customer)}
                      className="text-green-600 hover:text-green-900 p-1"
                      title={customer.status === 'active' ? 'Desativar cliente' : 'Ativar cliente'}
                    >
                      {customer.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => setCustomerToDelete(customer)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Excluir cliente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locações
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
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-black">{customer.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Desde {formatDateBR(customer.registrationDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black flex items-center mb-1">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {customer.email}
                    </div>
                    <div className="text-sm text-black flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    <div>CPF: {customer.cpf}</div>
                    <div>CNH: {customer.cnh}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">{customer.totalRentals}</div>
                    <div className="text-sm text-gray-500">locações</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.status === 'active' ? 'bg-green-100 text-green-800' :
                      customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {customer.status === 'active' ? 'Ativo' :
                       customer.status === 'inactive' ? 'Inativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setCustomerHistory(customer)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Ver histórico de locações"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCreateRentalForCustomer(customer)}
                        className="text-green-600 hover:text-green-900"
                        title="Criar nova locação"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setEditingCustomer(customer)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setCustomerToToggle(customer)}
                        className="text-green-600 hover:text-green-900"
                      >
                        {customer.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => setCustomerToDelete(customer)}
                        className="text-red-600 hover:text-red-900"
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

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou adicione um novo cliente.</p>
        </div>
      )}

      {/* Add Customer Modal */}
      <CustomerFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateCustomer}
        title="Adicionar Novo Cliente"
      />

      {/* Edit Customer Modal */}
      <CustomerFormModal
        isOpen={!!editingCustomer}
        onClose={() => {
          console.log('🔄 Fechando modal de edição');
          setEditingCustomer(null);
        }}
        onSubmit={handleUpdateCustomer}
        customer={editingCustomer}
        title="Editar Cliente"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteCustomer}
        type="delete"
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita. Se o cliente tiver locações, será bloqueado em vez de excluído."
        itemName={customerToDelete?.name}
        confirmText="Excluir"
        cancelText="Cancelar"
      />

      {/* Status Toggle Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!customerToToggle}
        onClose={() => setCustomerToToggle(null)}
        onConfirm={toggleCustomerStatus}
        type="warning"
        title={customerToToggle?.status === 'active' ? 'Desativar Cliente' : 'Ativar Cliente'}
        message={
          customerToToggle?.status === 'active' 
            ? 'Tem certeza que deseja desativar este cliente? Ele não poderá fazer novas locações.'
            : 'Tem certeza que deseja ativar este cliente? Ele poderá fazer novas locações.'
        }
        itemName={customerToToggle?.name}
        confirmText={customerToToggle?.status === 'active' ? 'Desativar' : 'Ativar'}
        cancelText="Cancelar"
      />

      {/* Customer History Modal */}
      <CustomerHistoryModal
        isOpen={!!customerHistory}
        onClose={() => setCustomerHistory(null)}
        customer={customerHistory}
      />

      {/* Rental Modal for Customer */}
      <RentalFormModal
        isOpen={showRentalModal}
        onClose={() => {
          console.log('🔄 Fechando modal de nova locação');
          setShowRentalModal(false);
          setSelectedCustomerForRental(null);
        }}
        onSubmit={handleRentalCreated}
        title={selectedCustomerForRental ? `Nova Locação para ${selectedCustomerForRental.name}` : 'Nova Locação'}
        preselectedCustomerId={selectedCustomerForRental?.id}
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