import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Car,
  Users,
  Fuel,
  Settings,
  X
} from 'lucide-react';
import { Vehicle } from '../../types';
import { VehicleService } from '../../services/vehicleService';
import { VehicleFormModal } from './VehicleFormModal';
import { ConfirmationModal } from './ConfirmationModal';
import { NotificationToast } from './NotificationToast';

export const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

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

  const categories = ['all', 'SUV', 'Sedan', 'Hatch', 'Blindado', 'Pickup', 'Van'];

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await VehicleService.getAll();
      setVehicles(data);
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      await VehicleService.create(vehicleData);
      await loadVehicles();
      showNotification('success', 'Veículo Cadastrado', `${vehicleData.name || 'Novo veículo'} foi cadastrado com sucesso!`);
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating vehicle:', err);
      showNotification('error', 'Erro ao Cadastrar', 'Não foi possível cadastrar o veículo. Tente novamente.');
    }
  };

  const handleUpdateVehicle = async (vehicleData: Vehicle) => {
    try {
      await VehicleService.update(vehicleData.id, vehicleData);
      await loadVehicles();
      showNotification('success', 'Veículo Atualizado', `${vehicleData.name} foi atualizado com sucesso!`);
      setEditingVehicle(null);
    } catch (err) {
      console.error('Error updating vehicle:', err);
      showNotification('error', 'Erro ao Atualizar', 'Não foi possível atualizar o veículo. Tente novamente.');
    }
  };

  const handleDeleteVehicle = async () => {
    if (vehicleToDelete) {
      try {
        await VehicleService.delete(vehicleToDelete.id);
        await loadVehicles();
        showNotification('success', 'Veículo Excluído', `${vehicleToDelete.name} foi excluído com sucesso!`);
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        showNotification('error', 'Erro ao Excluir', 'Não foi possível excluir o veículo. Tente novamente.');
      }
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || vehicle.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
          <h1 className="text-2xl lg:text-3xl font-bold text-black">Gestão de Veículos</h1>
          <p className="text-gray-600">Gerencie a frota de veículos</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 lg:px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Adicionar Veículo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar veículos..."
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
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas as Categorias' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-yellow-200">
            <div className="relative h-48">
              <img
                src={vehicle.images[0] || 'https://via.placeholder.com/400x300?text=Sem+Imagem'}
                alt={vehicle.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Sem+Imagem';
                }}
              />
              <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                {vehicle.category}
              </div>
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${
                vehicle.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {vehicle.available ? 'Disponível' : 'Indisponível'}
              </div>
            </div>

            <div className="p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold text-black mb-2">
                {vehicle.name || `${vehicle.brand} ${vehicle.model}`}
              </h3>
              <p className="text-gray-600 mb-2">{vehicle.brand} {vehicle.model}</p>
              <p className="text-gray-600 mb-4">{vehicle.transmission}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{vehicle.seats}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Fuel className="h-4 w-4" />
                    <span>{vehicle.fuel}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl lg:text-2xl font-bold text-yellow-600">
                    R$ {vehicle.price}
                  </div>
                  <div className="text-sm text-gray-600">por dia</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {vehicle.mileage && <p>KM: {vehicle.mileage.toLocaleString()}</p>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setEditingVehicle(vehicle)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setVehicleToDelete(vehicle)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && !loading && (
        <div className="text-center py-12">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">Nenhum veículo encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou adicione um novo veículo.</p>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <VehicleFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateVehicle}
        title="Adicionar Novo Veículo"
      />

      {/* Edit Vehicle Modal */}
      <VehicleFormModal
        isOpen={!!editingVehicle}
        onClose={() => setEditingVehicle(null)}
        onSubmit={handleUpdateVehicle}
        vehicle={editingVehicle}
        title="Editar Veículo"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={handleDeleteVehicle}
        type="delete"
        title="Excluir Veículo"
        message="Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita."
        itemName={vehicleToDelete?.name}
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