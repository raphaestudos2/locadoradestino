import React, { useState } from 'react';
import { User } from 'lucide-react';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { VehicleManagement } from '../components/admin/VehicleManagement';
import { CustomerManagement } from '../components/admin/CustomerManagement';
import { RentalManagement } from '../components/admin/RentalManagement';
import { FinancialManagement } from '../components/admin/FinancialManagement';
import { LocationManagement } from '../components/admin/LocationManagement';
import { SettingsManagement } from '../components/admin/SettingsManagement';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { LoginModal } from '../components/LoginModal';
import { useAuth } from '../contexts/AuthContext';
import { AdminPageType } from '../types';

export const AdminPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentAdminPage, setCurrentAdminPage] = useState<AdminPageType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginSuccess = (userData: any) => {
    setShowLoginModal(false);
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_url_here' && 
    supabaseAnonKey !== 'your_supabase_anon_key_here';

  // Normal authenticated view
  const renderContent = () => {
    switch (currentAdminPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'vehicles':
        return <VehicleManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'rentals':
        return <RentalManagement />;
      case 'locations':
        return <LocationManagement />;
      case 'reports':
        return <FinancialManagement />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  // Show login modal if user is not authenticated and Supabase is configured
  if (!user && isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-gray-50">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
            <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <User className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-4">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mb-6">
              Faça login para acessar o sistema de gestão da Locadora Destino
            </p>
            
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors duration-300 w-full"
            >
              Fazer Login
            </button>
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // Show demo mode if Supabase is not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar 
          currentPage={currentAdminPage} 
          setCurrentPage={setCurrentAdminPage}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <div className="flex-1 lg:ml-64">
          <AdminHeader 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          <div className="p-4 lg:p-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-500" />
                <span className="text-blue-700 font-medium">Modo Demonstração</span>
              </div>
              <p className="text-blue-600 text-sm mt-2">
                O Supabase não está configurado. Você está visualizando o painel em modo demonstração com dados estáticos.
              </p>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar 
        currentPage={currentAdminPage} 
        setCurrentPage={setCurrentAdminPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="flex-1 lg:ml-64">
        <AdminHeader 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <div className="p-4 lg:p-8">
          {!isSupabaseConfigured && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-500" />
                <span className="text-blue-700 font-medium">Modo Demonstração</span>
              </div>
              <p className="text-blue-600 text-sm mt-2">
                O Supabase não está configurado. Você está visualizando o painel em modo demonstração com dados estáticos.
              </p>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};