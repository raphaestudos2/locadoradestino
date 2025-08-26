import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, Car, DollarSign, Check } from 'lucide-react';
import { Rental, Vehicle, Customer } from '../../types';
import { VehicleService } from '../../services/vehicleService';
import { CustomerService } from '../../services/customerService';
import { getOrderedLocationsSync, preloadLocations } from '../../config/locations';

interface RentalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rental: Omit<Rental, 'id'>) => void;
  rental?: Rental | null;
  title: string;
  preselectedCustomerId?: string;
}

export const RentalFormModal: React.FC<RentalFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  rental,
  title,
  preselectedCustomerId
}) => {
  const [formData, setFormData] = useState<Omit<Rental, 'id'>>({
    customerId: '',
    vehicleId: '',
    pickupDate: '',
    returnDate: '',
    pickupTime: '09:00',
    returnTime: '18:00',
    pickupLocation: '',
    status: 'pending',
    totalAmount: 0,
    paymentStatus: 'pending',
    notes: ''
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      loadLocations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (rental) {
      setFormData({
        customerId: rental.customerId,
        vehicleId: rental.vehicleId,
        pickupDate: rental.pickupDate,
        returnDate: rental.returnDate,
        pickupTime: rental.pickupTime,
        returnTime: rental.returnTime,
        pickupLocation: rental.pickupLocation,
        status: rental.status,
        totalAmount: rental.totalAmount,
        paymentStatus: rental.paymentStatus,
        notes: rental.notes || ''
      });
    } else if (preselectedCustomerId) {
      setFormData(prev => ({
        ...prev,
        customerId: preselectedCustomerId
      }));
    } else {
      setFormData({
        customerId: '',
        vehicleId: '',
        pickupDate: '',
        returnDate: '',
        pickupTime: '09:00',
        returnTime: '18:00',
        pickupLocation: '',
        status: 'pending',
        totalAmount: 0,
        paymentStatus: 'pending',
        notes: ''
      });
    }
  }, [rental, preselectedCustomerId]);

  const loadLocations = async () => {
    // Use sync version for immediate render
    setLocations(getOrderedLocationsSync());
    
    // Load fresh data in background
    try {
      const { getOrderedLocations } = await import('../../config/locations');
      const freshLocations = await getOrderedLocations();
      setLocations(freshLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehicleData, customerData] = await Promise.all([
        VehicleService.getAll(),
        CustomerService.getAll()
      ]);
      setVehicles(vehicleData);
      setCustomers(customerData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    if (!formData.pickupDate || !formData.returnDate || !formData.vehicleId) return 0;
    
    const vehicle = vehicles.find(v => v.id === formData.vehicleId);
    if (!vehicle) return 0;

    const startDate = new Date(formData.pickupDate);
    const endDate = new Date(formData.returnDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays * vehicle.price;
  };

  useEffect(() => {
    const total = calculateTotalAmount();
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [formData.pickupDate, formData.returnDate, formData.vehicleId, vehicles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data before submission
    if (!formData.customerId) {
      alert('Selecione um cliente');
      return;
    }
    if (!formData.vehicleId) {
      alert('Selecione um veículo');
      return;
    }
    if (!formData.pickupDate || !formData.returnDate) {
      alert('Datas de retirada e devolução são obrigatórias');
      return;
    }
    if (!formData.pickupLocation) {
      alert('Selecione o local de retirada');
      return;
    }
    
    console.log('✅ Submetendo locação:', formData);
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando formulário...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cliente e Veículo */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Cliente e Veículo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cliente *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={formData.customerId}
                      onChange={(e) => handleInputChange('customerId', e.target.value)}
                    >
                      <option value="">Selecione um cliente</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Veículo *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={formData.vehicleId}
                      onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                    >
                      <option value="">Selecione um veículo</option>
                      {vehicles.filter(v => v.available).map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - R$ {vehicle.price}/dia
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Datas e Horários */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Período da Locação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Retirada *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={formData.pickupDate}
                      onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Devolução *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={formData.returnDate}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                      min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário de Retirada *
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={formData.pickupTime}
                      onChange={(e) => {
                        handleInputChange('pickupTime', e.target.value);
                        // Auto-preenche horário de devolução sempre que mudar o horário de entrada
                        if (!formData.returnTime || formData.returnTime === '18:00' || formData.returnTime === formData.pickupTime) {
                          handleInputChange('returnTime', e.target.value);
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário de Devolução *
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={formData.returnTime}
                      onChange={(e) => handleInputChange('returnTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Local e Status */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Local e Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Local de Retirada *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={formData.pickupLocation}
                      onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    >
                      <option value="">Selecione o local</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status da Locação
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="pending">Pendente</option>
                      <option value="active">Ativa</option>
                      <option value="completed">Concluída</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status do Pagamento
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={formData.paymentStatus}
                      onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                    >
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                      <option value="overdue">Em Atraso</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Valor e Observações */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Valor e Observações
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Total (R$)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-gray-100"
                        value={formData.totalAmount}
                        onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || 0)}
                        readOnly
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        Calculado automaticamente
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                      placeholder="Observações sobre a locação..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                    />
                  </div>
                </div>

                {/* Resumo do Cálculo */}
                {formData.pickupDate && formData.returnDate && formData.vehicleId && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-black mb-2">Resumo do Cálculo:</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Período:</span>
                        <span>
                          {Math.ceil((new Date(formData.returnDate).getTime() - new Date(formData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Diária:</span>
                        <span>R$ {vehicles.find(v => v.id === formData.vehicleId)?.price.toFixed(2) || '0,00'}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-black border-t pt-1">
                        <span>Total:</span>
                        <span>R$ {formData.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
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
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Check className="h-5 w-5" />
                  <span>{rental ? 'Atualizar' : 'Criar'} Locação</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};