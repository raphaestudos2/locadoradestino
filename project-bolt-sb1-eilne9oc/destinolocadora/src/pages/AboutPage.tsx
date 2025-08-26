import React from 'react';
import { Star, Users, Clock, Car } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-6">
            Sobre a Locadora Destino
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Sua jornada começa conosco
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-yellow-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">
                Nossa História
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  A Locadora Destino oferece muito mais do que veículos: entregamos conforto, 
                  praticidade e segurança em cada viagem. Seja para turismo, negócios ou lazer, 
                  temos uma frota moderna e bem cuidada, pronta para acompanhar você em qualquer destino.
                </p>
                <p>
                  Nosso atendimento é personalizado, <strong>burocracia zero</strong>, ágil e transparente, 
                  garantindo uma experiência simples e confiável, com a qualidade que você merece. 
                  Trabalhamos para unir excelência e acessibilidade, atendendo tanto quem busca 
                  praticidade no dia a dia quanto quem valoriza exclusividade em cada detalhe.
                </p>
                <p>
                  Acreditamos que cada destino merece começar com tranquilidade. Por isso, 
                  trabalhamos com compromisso, pontualidade e qualidade, garantindo que você 
                  tenha sempre a melhor experiência ao volante.
                </p>
                <p className="font-semibold text-black">
                  Nossa missão é tornar sua experiência de locação simples, ágil e confiável.
                </p>
                <p className="text-lg font-bold text-yellow-600">
                  Locadora Destino: mais que um carro, a certeza de chegar bem ao seu destino.
                </p>
              </div>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Sobre nós"
                className="rounded-xl shadow-lg mx-auto"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-2">10+</div>
            <div className="text-gray-700">Anos de Experiência</div>
          </div>
          <div className="bg-black rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
            <div className="text-gray-300">Clientes Satisfeitos</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-2">50+</div>
            <div className="text-gray-700">Veículos na Frota</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-yellow-200">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">
            Nossos Valores
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">Qualidade</h3>
                <p className="text-gray-700 text-sm">
                  Mantemos nossa frota sempre em perfeitas condições, 
                  com manutenção regular e cuidado constante.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-black p-3 rounded-full">
                <Users className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">Atendimento</h3>
                <p className="text-gray-700 text-sm">
                  Nossa equipe está sempre pronta para oferecer o melhor 
                  atendimento e suporte aos nossos clientes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">Agilidade</h3>
                <p className="text-gray-700 text-sm">
                  Processos rápidos e eficientes para que você possa 
                  pegar seu veículo sem perda de tempo.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-black p-3 rounded-full">
                <Car className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">Confiança</h3>
                <p className="text-gray-700 text-sm">
                  Transparência em todos os nossos serviços e 
                  compromisso com a satisfação do cliente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};