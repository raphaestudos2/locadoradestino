import React from 'react';
import { Car } from 'lucide-react';
import { PageType } from '../types';
import { contacts } from '../config/contacts';

interface FooterProps {
  setCurrentPage: (page: PageType) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    scrollToTop();
  };

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold">Locadora Destino</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Seu destino começa aqui. Aluguel de veículos com qualidade e confiança.
            </p>
            <div className="mt-4 text-gray-300 text-sm">
              <p className="font-semibold mb-1">Endereço:</p>
              <p>Estrada dos Três Rios, 958</p>
              <p>Freguesia, Jacarepaguá</p>
              <p>Rio de Janeiro - RJ</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handlePageChange('home')}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePageChange('about')}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Sobre
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePageChange('contact')}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Contato
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Contato</h3>
            <div className="space-y-2 text-gray-300">
              <p>{contacts.phone.main}</p>
              <p>{contacts.phone.secondary}</p>
              <p>{contacts.email.main}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Horário</h3>
            <div className="space-y-2 text-gray-300">
              <p>{contacts.businessHours.weekdays}</p>
              <p>{contacts.businessHours.saturday}</p>
              <p>{contacts.businessHours.sunday}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Locadora Destino. Todos os direitos reservados.</p>
          <p className="mt-1">CNPJ: 51.705.247/0001-44</p>
        </div>
      </div>
    </footer>
  );
};