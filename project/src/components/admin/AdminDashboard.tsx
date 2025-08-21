import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Users, 
  FileText, 
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { VehicleService } from '../../services/vehicleService';
import { getRentalsFromStorage, getCustomersFromStorage } from '../../utils/rentalStorage';
import { Vehicle } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rentals, setRentals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const vehicleData = await VehicleService.getAll();
      const rentalData = getRentalsFromStorage();
      const customerData = getCustomersFromStorage();
      
      setVehicles(vehicleData);
      setRentals(rentalData);
      setCustomers(customerData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableVehicles = vehicles.filter(v => v.available);
  const totalRevenue = vehicles.reduce((sum, v) => sum + v.price, 0);
  const activeRentals = rentals.filter((r: any) => r.status === 'active').length;
  const totalCustomers = customers.length;

  const stats = [
    {
      title: 'Total de Veículos',
      value: loading ? '...' : vehicles.length.toString(),
      change: '+2',
      changeType: 'positive',
      icon: Car,
      color: 'bg-yellow-500'
    },
    {
      title: 'Veículos Disponíveis',
      value: loading ? '...' : availableVehicles.length.toString(),
      change: '+1',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Locações Ativas',
      value: loading ? '...' : activeRentals.toString(),
      change: '+5',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Total de Clientes',
      value: loading ? '...' : totalCustomers.toString(),
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  // Get recent rentals from storage
  const recentRentals = rentals
    .slice(0, 3)
    .map((rental: any) => {
      const customer = customers.find((c: any) => c.id === rental.customerId);
      const vehicle = vehicles.find(v => v.id === rental.vehicleId);
      
      return {
        id: rental.id,
        customer: customer?.name || 'Cliente não encontrado',
        vehicle: vehicle?.name || rental.vehicleId,
        startDate: rental.pickupDate,
        endDate: rental.returnDate,
        status: rental.status,
        amount: `R$ ${rental.totalAmount?.toFixed(2) || '0,00'}`
      };
    });

  const alerts = [
    {
      type: 'warning',
      message: 'Veículo Onix Sedan precisa de revisão em 3 dias',
      time: '2 horas atrás'
    },
    {
      type: 'info',
      message: 'Nova reserva recebida para o fim de semana',
      time: '4 horas atrás'
    },
    {
      type: 'success',
      message: 'Pagamento de R$ 1.200 foi confirmado',
      time: '6 horas atrás'
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-black mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de locação</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xl lg:text-2xl font-bold text-black mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg flex-shrink-0`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Rentals */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <h2 className="text-lg lg:text-xl font-bold text-black mb-4">Locações Recentes</h2>
          <div className="space-y-4">
            {recentRentals.map((rental) => (
              <div key={rental.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <p className="font-semibold text-black">{rental.customer}</p>
                  <p className="text-sm text-gray-600">{rental.vehicle}</p>
                  <p className="text-xs text-gray-500">
                    {rental.startDate} - {rental.endDate}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                  <p className="font-semibold text-black">{rental.amount}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    rental.status === 'active' ? 'bg-green-100 text-green-800' :
                    rental.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rental.status === 'active' ? 'Ativa' :
                     rental.status === 'completed' ? 'Concluída' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <h2 className="text-lg lg:text-xl font-bold text-black mb-4">Alertas e Notificações</h2>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full flex-shrink-0 ${
                  alert.type === 'warning' ? 'bg-yellow-100' :
                  alert.type === 'info' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  ) : alert.type === 'info' ? (
                    <Calendar className="h-4 w-4 text-blue-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-black break-words">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};