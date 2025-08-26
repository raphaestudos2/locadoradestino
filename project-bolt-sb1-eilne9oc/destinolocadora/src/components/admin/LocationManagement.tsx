import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin,
  Building,
  Navigation,
  X,
  Check,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { LocationService, Location } from '../../services/locationService';
import { NotificationToast } from './NotificationToast';
import { ConfirmationModal } from './ConfirmationModal';

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'> | Location) => void;
  location?: Location | null;
  title: string;
}

const LocationFormModal: React.FC<LocationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  location,
  title
}) => {
  const [formData, setFormData] = useState<Omit<Location, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    address: '',
    city: '',
    state: '',
    active: true,
    displayOrder: 0,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        active: location.active,
        displayOrder: location.displayOrder,
        notes: location.notes || ''
      });
    } else {
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        active: true,
        displayOrder: 0,
        notes: ''
      });
    }
    setErrors({});
  }, [location, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do local é obrigatório';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (location) {
      onSubmit({ ...location, ...formData });
    } else {
      onSubmit(formData);
    }
    onClose();
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
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Informações do Local
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Local *
                  </label>
                  <input
                    type="text"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Aeroporto Internacional do Galeão - RJ"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço Completo *
                  </label>
                  <input
                    type="text"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Ex: Aeroporto Internacional do Galeão - Rio de Janeiro - RJ"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Ex: Rio de Janeiro"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  >
                    <option value="">Selecione o estado</option>
                    <option value="RJ">Rio de Janeiro - RJ</option>
                    <option value="SP">São Paulo - SP</option>
                    <option value="MG">Minas Gerais - MG</option>
                    <option value="ES">Espírito Santo - ES</option>
                    <option value="PR">Paraná - PR</option>
                    <option value="SC">Santa Catarina - SC</option>
                    <option value="RS">Rio Grande do Sul - RS</option>
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.displayOrder}
                    onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Menor número aparece primeiro na lista
                  </p>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      checked={formData.active}
                      onChange={(e) => handleInputChange('active', e.target.checked)}
                    />
                    <span className="text-sm font-medium text-gray-700">Local ativo para reservas</span>
                  </label>
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
                    placeholder="Informações adicionais sobre o local..."
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
                <span>{location ? 'Atualizar' : 'Criar'} Local</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const LocationManagement: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

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
    let isMounted = true;
    
    const loadAllLocations = async () => {
      try {
        setLoading(true);
        console.log('🔄 Carregando locais...');
        const locationsData = await LocationService.getAllLocations();
        
        if (isMounted) {
          setLocations(locationsData);
          console.log('✅ Locais carregados:', locationsData.length);
        }
      } catch (error) {
        console.error('❌ Erro carregando locais:', error);
        if (isMounted) {
          setLocations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAllLocations();

    return () => {
      isMounted = false;
    };
  }, []); // ONLY RUN ONCE

  // FIXED: Reload only locations to avoid full page reload
  const reloadLocationsOnly = async () => {
    try {
      console.log('🔄 Recarregando apenas locais...');
      const newLocations = await LocationService.getAllLocations();
      setLocations(newLocations);
      console.log('✅ Locais recarregados:', newLocations.length);
    } catch (error) {
      console.error('❌ Erro recarregando locais:', error);
    }
  };

  const handleCreateLocation = async (locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🆕 Criando novo local:', locationData);
      await LocationService.create(locationData);
      await reloadLocationsOnly();
      showNotification('success', 'Local Cadastrado', `${locationData.name} foi cadastrado com sucesso!`);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating location:', error);
      showNotification('error', 'Erro ao Cadastrar', 'Não foi possível cadastrar o local. Tente novamente.');
    }
  };

  const handleUpdateLocation = async (locationData: Location) => {
    try {
      console.log('📝 Atualizando local:', locationData);
      await LocationService.update(locationData.id, locationData);
      await reloadLocationsOnly();
      showNotification('success', 'Local Atualizado', `${locationData.name} foi atualizado com sucesso!`);
      setEditingLocation(null);
    } catch (error) {
      console.error('Error updating location:', error);
      showNotification('error', 'Erro ao Atualizar', 'Não foi possível atualizar o local. Tente novamente.');
    }
  };

  const handleDeleteLocation = async () => {
    if (locationToDelete) {
      try {
        console.log('🗑️ Excluindo local:', locationToDelete.id);
        await LocationService.delete(locationToDelete.id);
        await reloadLocationsOnly();
        showNotification('success', 'Local Excluído', `${locationToDelete.name} foi excluído com sucesso!`);
      } catch (error) {
        console.error('Error deleting location:', error);
        showNotification('error', 'Erro ao Excluir', 'Não foi possível excluir o local. Tente novamente.');
      }
    }
  };

  const toggleLocationStatus = async (location: Location) => {
    try {
      console.log('🔄 Alterando status do local:', location.id);
      await LocationService.update(location.id, { active: !location.active });
      await reloadLocationsOnly();
    } catch (error) {
      console.error('Error toggling location status:', error);
    }
  };

  const moveLocationUp = async (location: Location) => {
    try {
      const newOrder = Math.max(0, location.displayOrder - 1);
      console.log('⬆️ Movendo local para cima:', location.id);
      await LocationService.update(location.id, { displayOrder: newOrder });
      await reloadLocationsOnly();
    } catch (error) {
      console.error('Error moving location up:', error);
    }
  };

  const moveLocationDown = async (location: Location) => {
    try {
      const newOrder = location.displayOrder + 1;
      console.log('⬇️ Movendo local para baixo:', location.id);
      await LocationService.update(location.id, { displayOrder: newOrder });
      await reloadLocationsOnly();
    } catch (error) {
      console.error('Error moving location down:', error);
    }
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === 'all' || location.state === filterState;
    return matchesSearch && matchesState;
  });

  const states = ['all', ...Array.from(new Set(locations.map(l => l.state)))];

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Carregando locais...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-black">Gestão de Locais</h1>
          <p className="text-gray-600">Gerencie os locais de retirada e devolução</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 lg:px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Adicionar Local</span>
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
                placeholder="Buscar locais..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              {states.map(state => (
                <option key={state} value={state}>
                  {state === 'all' ? 'Todos os Estados' : state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLocations.map((location, index) => (
          <div key={location.id} className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.city} - {location.state}</p>
                  <p className="text-xs text-gray-500">Ordem: {location.displayOrder}</p>
                </div>
              </div>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                location.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {location.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start space-x-2">
                <Building className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{location.address}</span>
              </div>
              
              {location.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{location.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => moveLocationUp(location)}
                  disabled={index === 0}
                  className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed p-1"
                  title="Mover para cima"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveLocationDown(location)}
                  disabled={index === filteredLocations.length - 1}
                  className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed p-1"
                  title="Mover para baixo"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleLocationStatus(location)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    location.active 
                      ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                >
                  {location.active ? 'Desativar' : 'Ativar'}
                </button>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => setEditingLocation(location)}
                  className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Editar local"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setLocationToDelete(location)}
                  className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Excluir local"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">Nenhum local encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou adicione um novo local.</p>
        </div>
      )}

      {/* Add Location Modal */}
      <LocationFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateLocation}
        title="Adicionar Novo Local"
      />

      {/* Edit Location Modal */}
      <LocationFormModal
        isOpen={!!editingLocation}
        onClose={() => setEditingLocation(null)}
        onSubmit={handleUpdateLocation}
        location={editingLocation}
        title="Editar Local"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!locationToDelete}
        onClose={() => setLocationToDelete(null)}
        onConfirm={handleDeleteLocation}
        type="delete"
        title="Excluir Local"
        message="Tem certeza que deseja excluir este local? Esta ação não pode ser desfeita e pode afetar reservas futuras."
        itemName={locationToDelete?.name}
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