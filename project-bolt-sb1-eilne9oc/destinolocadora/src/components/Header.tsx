import React from 'react';
import { Car, Menu, X } from 'lucide-react';
import { PageType } from '../types';

interface HeaderProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  scrollToVehicles: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  mobileMenuOpen,
  setMobileMenuOpen,
  scrollToVehicles
}) => {
  const handleVehiclesClick = () => {
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => scrollToVehicles(), 100);
    } else {
      scrollToVehicles();
    }
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Car className="h-8 w-8 text-yellow-500" />
            <span className="text-2xl font-bold text-black">Locadora Destino</span>
          </button>
          
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => setCurrentPage('home')}
              className={`text-lg font-medium transition-colors duration-300 hover:text-yellow-500 ${
                currentPage === 'home' ? 'text-yellow-500' : 'text-black'
              }`}
            >
              Início
            </button>
            <button
              onClick={handleVehiclesClick}
              className="text-lg font-medium transition-colors duration-300 hover:text-yellow-500 text-black"
            >
              Veículos
            </button>
            <button
              onClick={() => handlePageChange('about')}
              className={`text-lg font-medium transition-colors duration-300 hover:text-yellow-500 ${
                currentPage === 'about' ? 'text-yellow-500' : 'text-black'
              }`}
            >
              Sobre
            </button>
            <button
              onClick={() => handlePageChange('contact')}
              className={`text-lg font-medium transition-colors duration-300 hover:text-yellow-500 ${
                currentPage === 'contact' ? 'text-yellow-500' : 'text-black'
              }`}
            >
              Contato
            </button>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-black" />
            ) : (
              <Menu className="h-6 w-6 text-black" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  setCurrentPage('home');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-lg font-medium text-black hover:text-yellow-500 py-2"
              >
                Início
              </button>
              <button
                onClick={handleVehiclesClick}
                className="text-left text-lg font-medium text-black hover:text-yellow-500 py-2"
              >
                Veículos
              </button>
              <button
                onClick={() => {
                  handlePageChange('about');
                }}
                className="text-left text-lg font-medium text-black hover:text-yellow-500 py-2"
              >
                Sobre
              </button>
              <button
                onClick={() => {
                  handlePageChange('contact');
                }}
                className="text-left text-lg font-medium text-black hover:text-yellow-500 py-2"
              >
                Contato
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};