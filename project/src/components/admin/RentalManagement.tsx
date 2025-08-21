import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  History,
  Filter,
  FileText,
  Calendar,
  MapPin,
  User,
  Car,
  DollarSign,
  Clock,
  Grid,
  List,
  X,
  Download
} from 'lucide-react';
import { Rental, Vehicle, Customer } from '../../types';
import { getRentalsFromStorage, getCustomersFromStorage, updateRentalStatus, updatePaymentStatus } from '../../utils/rentalStorage';
import { VehicleService } from '../../services/vehicleService';
import { getLocationName } from '../../config/locations';
import { RentalFormModal } from './RentalFormModal';
import { ConfirmationModal } from './ConfirmationModal';
import { NotificationToast } from './NotificationToast';

export const RentalManagement: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [rentalToDelete, setRentalToDelete] = useState<Rental | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [filterDate, setFilterDate] = useState('all');

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
      const [rentalData, vehicleData, customerData] = await Promise.all([
        Promise.resolve(getRentalsFromStorage()),
        VehicleService.getAll(),
        Promise.resolve(getCustomersFromStorage())
      ]);
      
      setRentals(rentalData);
      setVehicles(vehicleData);
      setCustomers(customerData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRental = (rentalData: Omit<Rental, 'id'>) => {
    const newRental: Rental = {
      ...rentalData,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
    
    const updatedRentals = [newRental, ...rentals];
    setRentals(updatedRentals);
    localStorage.setItem('rentals', JSON.stringify(updatedRentals));
    showNotification('success', 'Locação Cadastrada', `Nova locação #${newRental.id.slice(-8).toUpperCase()} foi cadastrada com sucesso!`);
    setShowAddModal(false);
  };

  const handleUpdateRental = (rentalData: Rental) => {
    const updatedRentals = rentals.map(rental => 
      rental.id === rentalData.id ? rentalData : rental
    );
    setRentals(updatedRentals);
    localStorage.setItem('rentals', JSON.stringify(updatedRentals));
    showNotification('success', 'Locação Atualizada', `Locação #${rentalData.id.slice(-8).toUpperCase()} foi atualizada com sucesso!`);
    setEditingRental(null);
  };

  const handleDeleteRental = () => {
    if (rentalToDelete) {
      const updatedRentals = rentals.filter(r => r.id !== rentalToDelete.id);
      setRentals(updatedRentals);
      localStorage.setItem('rentals', JSON.stringify(updatedRentals));
      showNotification('success', 'Locação Excluída', `Locação #${rentalToDelete.id.slice(-8).toUpperCase()} foi excluída com sucesso!`);
    }
  };

  const handleStatusChange = (rentalId: string, newStatus: Rental['status']) => {
    updateRentalStatus(rentalId, newStatus);
    const statusText = newStatus === 'active' ? 'ativada' : 
                      newStatus === 'completed' ? 'concluída' : 
                      newStatus === 'cancelled' ? 'cancelada' : 'pendente';
    showNotification('success', 'Status Atualizado', `Locação foi ${statusText} com sucesso!`);
    loadData();
  };

  const handlePaymentStatusChange = (rentalId: string, newPaymentStatus: Rental['paymentStatus']) => {
    updatePaymentStatus(rentalId, newPaymentStatus);
    const paymentText = newPaymentStatus === 'paid' ? 'pago' : 
                       newPaymentStatus === 'overdue' ? 'em atraso' : 'pendente';
    showNotification('success', 'Pagamento Atualizado', `Status do pagamento alterado para ${paymentText}!`);
    loadData();
  };

  const handleDownloadList = () => {
    const filteredData = filteredRentals;
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    // CSV Headers
    const csvHeaders = [
      'ID',
      'Cliente',
      'Veículo',
      'Data Retirada',
      'Data Devolução',
      'Hora Retirada',
      'Hora Devolução',
      'Local',
      'Status',
      'Pagamento',
      'Valor (R$)',
      'Observações'
    ];
    
    // CSV Rows
    const csvRows = filteredData.map(rental => [
      `#${rental.id.slice(-8).toUpperCase()}`,
      getCustomerName(rental.customerId),
      getVehicleName(rental.vehicleId),
      new Date(rental.pickupDate).toLocaleDateString('pt-BR'),
      new Date(rental.returnDate).toLocaleDateString('pt-BR'),
      rental.pickupTime,
      rental.returnTime,
      getLocationName(rental.pickupLocation),
      getStatusText(rental.status),
      getPaymentStatusText(rental.paymentStatus),
      rental.totalAmount.toFixed(2).replace('.', ','),
      rental.notes || ''
    ]);
    
    // Create CSV content
    const csvContent = [
      csvHeaders.join(';'),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `locacoes_${currentDate.replace(/\//g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('success', 'Download Concluído', 'Lista de locações baixada com sucesso!');
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Cliente não encontrado';
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.name || 'Veículo não encontrado';
  };

  const filteredRentals = rentals.filter(rental => {
    const customerName = getCustomerName(rental.customerId);
    const vehicleName = getVehicleName(rental.vehicleId);
    
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rental.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || rental.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl lg:text-3xl font-bold text-black">Gestão de Locações</h1>
          <p className="text-gray-600">Gerencie as locações de veículos</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 lg:px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nova Locação</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
        <div className="space-y-4">
          {/* Search and View Toggle */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar locações..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-yellow-500 text-black' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title="Visualização em cards"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-yellow-500 text-black' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title="Visualização em lista"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={handleDownloadList}
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                title="Baixar lista CSV"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Filters Row */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                >
                  <option value="all">Todos os Períodos</option>
                  <option value="today">Hoje</option>
                  <option value="week">Esta Semana</option>
                  <option value="month">Este Mês</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendentes</option>
                  <option value="active">Ativas</option>
                  <option value="completed">Concluídas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {filteredRentals.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 border border-yellow-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-semibold text-black">{filteredRentals.length}</span> locações
              {filterDate !== 'all' && (
                <span> • Período: <span className="font-semibold">
                  {filterDate === 'today' ? 'Hoje' : 
                   filterDate === 'week' ? 'Esta semana' : 'Este mês'}
                </span></span>
              )}
              {filterStatus !== 'all' && (
                <span> • Status: <span className="font-semibold">{getStatusText(filterStatus)}</span></span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold text-black">
                R$ {filteredRentals.reduce((sum, rental) => sum + rental.totalAmount, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Rentals Display */}
      {viewMode === 'cards' ? (
        /* Cards Grid */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredRentals.map((rental) => (
            <div key={rental.id} className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">#{rental.id.slice(-8).toUpperCase()}</h3>
                    <p className="text-sm text-gray-600">Locação</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rental.status)}`}>
                    {getStatusText(rental.status)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(rental.paymentStatus)}`}>
                    {getPaymentStatusText(rental.paymentStatus)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium">{getCustomerName(rental.customerId)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-700">
                  <Car className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{getVehicleName(rental.vehicleId)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{rental.pickupDate} - {rental.returnDate}</span>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{rental.pickupTime} - {rental.returnTime}</span>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{getLocationName(rental.pickupLocation)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-semibold">R$ {rental.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {rental.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{rental.notes}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <select
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                    value={rental.status}
                    onChange={(e) => handleStatusChange(rental.id, e.target.value as Rental['status'])}
                  >
                    <option value="pending">Pendente</option>
                    <option value="active">Ativa</option>
                    <option value="completed">Concluída</option>
                    <option value="cancelled">Cancelada</option>
                  </select>

                  <select
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                    value={rental.paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(rental.id, e.target.value as Rental['paymentStatus'])}
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="overdue">Em Atraso</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => setEditingRental(rental)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setRentalToDelete(rental)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-yellow-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-black">
                      #{rental.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      {getCustomerName(rental.customerId)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      {getVehicleName(rental.vehicleId)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      <div>{rental.pickupDate} - {rental.returnDate}</div>
                      <div className="text-xs text-gray-500">{rental.pickupTime} - {rental.returnTime}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      {getLocationName(rental.pickupLocation)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                        value={rental.status}
                        onChange={(e) => handleStatusChange(rental.id, e.target.value as Rental['status'])}
                      >
                        <option value="pending">Pendente</option>
                        <option value="active">Ativa</option>
                        <option value="completed">Concluída</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                        value={rental.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(rental.id, e.target.value as Rental['paymentStatus'])}
                      >
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                        <option value="overdue">Em Atraso</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-black">
                      R$ {rental.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setEditingRental(rental)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setRentalToDelete(rental)}
                          className="text-red-600 hover:text-red-900 p-1"
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
      )}

      {filteredRentals.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">Nenhuma locação encontrada</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou crie uma nova locação.</p>
        </div>
      )}

      {/* Add Rental Modal */}
      <RentalFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateRental}
        title="Nova Locação"
      />

      {/* Edit Rental Modal */}
      <RentalFormModal
        isOpen={!!editingRental}
        onClose={() => setEditingRental(null)}
        onSubmit={handleUpdateRental}
        rental={editingRental}
        title="Editar Locação"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!rentalToDelete}
        onClose={() => setRentalToDelete(null)}
        onConfirm={handleDeleteRental}
        type="delete"
        title="Excluir Locação"
        message="Tem certeza que deseja excluir esta locação? Esta ação não pode ser desfeita."
        itemName={rentalToDelete ? `#${rentalToDelete.id.slice(-8).toUpperCase()}` : undefined}
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