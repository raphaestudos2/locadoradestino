import React from 'react';
import { Car, Clock, Star } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-black mb-12">
          Por que escolher a Locadora Destino?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors duration-300 border border-yellow-200">
            <Car className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-3">Frota Moderna</h3>
            <p className="text-gray-700 leading-relaxed">
              Veículos novos e bem conservados, com revisões em dia e todos os equipamentos de segurança.
            </p>
          </div>

          <div className="text-center p-8 rounded-xl bg-black hover:bg-gray-900 transition-colors duration-300">
            <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">Atendimento 24h</h3>
            <p className="text-gray-300 leading-relaxed">
              Suporte completo a qualquer hora do dia. Estamos sempre prontos para te ajudar.
            </p>
          </div>

          <div className="text-center p-8 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors duration-300 border border-yellow-200">
            <Star className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-3">Melhor Preço</h3>
            <p className="text-gray-700 leading-relaxed">
              Preços competitivos e condições especiais para aluguel de longo prazo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};