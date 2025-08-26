import React from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  FileText, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  User
} from 'lucide-react';
import { AdminPageType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface AdminSidebarProps {
  currentPage: AdminPageType;
  setCurrentPage: (page: AdminPageType) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPage,
  setCurrentPage,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const { user, adminData, signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Veículos', icon: Car },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'rentals', label: 'Locações', icon: FileText },
    { id: 'locations', label: 'Locais', icon: Menu },
    { id: 'reports', label: 'Financeiro', icon: DollarSign },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleMenuClick = (page: AdminPageType) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut();
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Confirmar Saída</h2>
                <button
                  onClick={cancelLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <LogOut className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-gray-700">
                  Deseja mesmo sair do sistema?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-black text-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <Car className="h-8 w-8 text-yellow-500" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id as AdminPageType)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'bg-yellow-500 text-black'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800 space-y-4">
          {/* User Info */}
          {user && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500 p-2 rounded-full">
                  <User className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {adminData?.name || user.email?.split('@')[0] || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                    {adminData?.role === 'admin' ? 'Administrador' : 
                     adminData?.role === 'manager' ? 'Gerente' : 'Vendedor'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};