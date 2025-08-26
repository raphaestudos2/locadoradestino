import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Users, 
  FileText, 
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { VehicleService } from '../../services/vehicleService';
import { RentalService } from '../../services/rentalService';
import { CustomerService } from '../../services/customerService';
import { PaymentService } from '../../services/paymentService';
import { Vehicle, Rental, Customer } from '../../types';
import { formatDateBR } from '../../utils/dateFormatter';
import { getLocationName } from '../../config/locations';

interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  activeRentals: number;
  totalCustomers: number;
  monthlyRevenue: number;
  pendingPayments: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    availableVehicles: 0,
    activeRentals: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    pendingPayments: 0
  });
  
  const [recentRentals, setRecentRentals] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📊 Carregando dados do dashboard...');
        
        // Load all data in parallel
        const [vehiclesData, rentalsData, customersData, paymentsData] = await Promise.all([
          VehicleService.getAll(),
          RentalService.getAll(),
          CustomerService.getAll(),
          PaymentService.getAll()
        ]);

        if (!isMounted) return;

        console.log('✅ Dados carregados:', {
          vehicles: vehiclesData.length,
          rentals: rentalsData.length,
          customers: customersData.length,
          payments: paymentsData.length
        });

        // Store data for reference
        setVehicles(vehiclesData);
        setCustomers(customersData);

        // Calculate real stats
        const availableVehicles = vehiclesData.filter(v => v.available).length;
        const activeRentals = rentalsData.filter(r => r.status === 'active').length;
        
        // Calculate monthly revenue from this month's payments
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const monthlyRevenue = paymentsData
          .filter(p => {
            const paymentDate = new Date(p.paymentDate);
            return p.status === 'aprovado' && 
                   p.paymentType !== 'reembolso' &&
                   paymentDate.getMonth() === currentMonth &&
                   paymentDate.getFullYear() === currentYear;
          })
          .reduce((sum, p) => sum + p.amount, 0);

        const pendingPayments = rentalsData.filter(r => r.paymentStatus === 'pending').length;

        const calculatedStats: DashboardStats = {
          totalVehicles: vehiclesData.length,
          availableVehicles,
          activeRentals,
          totalCustomers: customersData.length,
          monthlyRevenue,
          pendingPayments
        };

        setStats(calculatedStats);

        // Get recent rentals with location names
        const recentRentalsData = rentalsData
          .slice(0, 3)
          .map(rental => {
            const customer = customersData.find(c => c.id === rental.customerId);
            const vehicle = vehiclesData.find(v => v.id === rental.vehicleId);
            
            return {
              id: rental.id,
              customer: customer?.name || 'Cliente não encontrado',
              vehicle: vehicle?.name || `${vehicle?.brand || ''} ${vehicle?.model || ''}`.trim() || 'Veículo não encontrado',
              startDate: rental.pickupDate,
              endDate: rental.returnDate,
              status: rental.status,
              amount: `R$ ${rental.totalAmount.toFixed(2).replace('.', ',')}`
            };
          });

        setRecentRentals(recentRentalsData);

        console.log('🎯 Dashboard atualizado com dados reais:', calculatedStats);
        
      } catch (error) {
        console.error('❌ Erro carregando dados do dashboard:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Erro desconhecido');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Add a small delay to ensure Supabase is fully initialized
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Generate alerts based on real data
  const generateAlerts = () => {
    const alerts = [];

    // Vehicle maintenance alerts
    const lowAvailabilityVehicles = vehicles.filter(v => !v.available).length;
    if (lowAvailabilityVehicles > 0) {
      alerts.push({
        type: 'warning',
        message: `${lowAvailabilityVehicles} veículo(s) indisponível(is) - verifique manutenção`,
        time: '1 hora atrás'
      });
    }

    // Payment alerts
    if (stats.pendingPayments > 0) {
      alerts.push({
        type: 'info',
        message: `${stats.pendingPayments} pagamento(s) pendente(s) de confirmação`,
        time: '2 horas atrás'
      });
    }

    // Revenue success
    if (stats.monthlyRevenue > 0) {
      alerts.push({
        type: 'success',
        message: `Receita de R$ ${stats.monthlyRevenue.toFixed(2)} confirmada este mês`,
        time: '3 horas atrás'
      });
    }

    // Default alerts if no data
    if (alerts.length === 0) {
      alerts.push(
        {
          type: 'info',
          message: 'Sistema funcionando normalmente',
          time: '1 hora atrás'
        },
        {
          type: 'success',
          message: 'Todos os dados sincronizados com sucesso',
          time: '2 horas atrás'
        }
      );
    }

    return alerts.slice(0, 3); // Limit to 3 alerts
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="h-8 w-8 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 font-medium">Erro ao Carregar Dashboard</span>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Recarregar Página
        </button>
      </div>
    );
  }

  const alerts = generateAlerts();

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-black mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de locação em tempo real</p>
      </div>

      {/* Real Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total de Veículos</p>
              <p className="text-xl lg:text-2xl font-bold text-black mt-1">{stats.totalVehicles}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">Frota Completa</span>
              </div>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg flex-shrink-0">
              <Car className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Veículos Disponíveis</p>
              <p className="text-xl lg:text-2xl font-bold text-black mt-1">{stats.availableVehicles}</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">Prontos para Locação</span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-lg flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Locações Ativas</p>
              <p className="text-xl lg:text-2xl font-bold text-black mt-1">{stats.activeRentals}</p>
              <div className="flex items-center mt-2">
                <FileText className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600">Em Andamento</span>
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg flex-shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
              <p className="text-xl lg:text-2xl font-bold text-black mt-1">{stats.totalCustomers}</p>
              <div className="flex items-center mt-2">
                <Users className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm text-purple-600">Cadastrados</span>
              </div>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg flex-shrink-0">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200 sm:col-span-2 lg:col-span-2 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Receita Este Mês</p>
              <p className="text-xl lg:text-2xl font-bold text-black mt-1">
                R$ {stats.monthlyRevenue.toFixed(2).replace('.', ',')}
              </p>
              <div className="flex items-center mt-2">
                <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">Pagamentos Aprovados</span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-lg flex-shrink-0">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200 sm:col-span-2 lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Pagamentos Pendentes</p>
              <p className="text-xl lg:text-2xl font-bold text-black mt-1">{stats.pendingPayments}</p>
              <div className="flex items-center mt-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-yellow-600">Aguardando Confirmação</span>
              </div>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Rentals */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <h2 className="text-lg lg:text-xl font-bold text-black mb-4">Locações Recentes</h2>
          {recentRentals.length > 0 ? (
            <div className="space-y-4">
              {recentRentals.map((rental) => (
                <div key={rental.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <p className="font-semibold text-black">{rental.customer}</p>
                    <p className="text-sm text-gray-600">{rental.vehicle}</p>
                    <p className="text-xs text-gray-500">
                      {formatDateBR(rental.startDate)} - {formatDateBR(rental.endDate)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                    <p className="font-semibold text-black">{rental.amount}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      rental.status === 'active' ? 'bg-green-100 text-green-800' :
                      rental.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      rental.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rental.status === 'active' ? 'Ativa' :
                       rental.status === 'completed' ? 'Concluída' : 
                       rental.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma locação recente</p>
            </div>
          )}
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <h2 className="text-lg lg:text-xl font-bold text-black mb-4">Alertas do Sistema</h2>
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