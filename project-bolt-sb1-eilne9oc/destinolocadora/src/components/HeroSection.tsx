import React from 'react';
import { Calendar, MapPin, Clock, Star, ArrowRight } from 'lucide-react';
import { ReservationData } from '../types';
import { getOrderedLocationsSync, preloadLocations } from '../config/locations';

interface HeroSectionProps {
  reservation: Partial<ReservationData>;
  setReservation: (reservation: Partial<ReservationData>) => void;
  scrollToVehicles: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  reservation,
  setReservation,
  scrollToVehicles
}) => {
  const [locations, setLocations] = React.useState<any[]>([]);

  // Load locations on component mount
  React.useEffect(() => {
    // Use sync version for immediate render
    setLocations(getOrderedLocationsSync());
    
    // Preload fresh data in background
    preloadLocations().then(() => {
      // Update with fresh data if available
      import('../config/locations').then(({ getOrderedLocations }) => {
        getOrderedLocations().then(freshLocations => {
          setLocations(freshLocations);
        }).catch(console.error);
      });
    });
  }, []);

  const handleInputChange = (field: keyof ReservationData, value: string) => {
    setReservation({...reservation, [field]: value});
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return !!(
      reservation.pickupLocation &&
      reservation.pickupDate &&
      reservation.returnDate &&
      reservation.pickupTime &&
      reservation.returnTime
    );
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-black via-yellow-600 to-yellow-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-blue-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-20 w-12 h-12 bg-blue-500 rounded-full opacity-20 animate-pulse delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm">
              <Star className="h-4 w-4 mr-2" />
              Melhor Locadora da Região
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-white">Seu</span>
              <br />
              <span className="text-blue-400">
                Destino
              </span>
              <br />
              <span className="text-white text-4xl md:text-5xl">começa aqui</span>
            </h1>
            
            <p className="text-xl text-white mb-10 leading-relaxed max-w-lg">
              Descubra a liberdade de viajar com nossa frota premium. 
              Veículos novos, tecnologia avançada e o melhor atendimento da região.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={scrollToVehicles}
                className="group bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center"
              >
                <span>Reservar Agora</span>
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center space-x-8 text-yellow-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">10+</div>
                <div className="text-sm">Anos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">500+</div>
                <div className="text-sm">Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">50+</div>
                <div className="text-sm">Veículos</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-black mb-2">
                  Reserve Agora
                </h3>
                <p className="text-gray-600">Encontre o veículo perfeito para sua viagem</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-3">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Local de Retirada
                  </label>
                  <select
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                    value={reservation.pickupLocation || ''}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-3">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Data de Retirada
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      value={reservation.pickupDate || ''}
                      onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-3">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Data de Devolução
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      value={reservation.returnDate || ''}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                      min={reservation.pickupDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-3">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Hora Retirada *
                    </label>
                    <input
                      type="time"
                      required
                      required
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      value={reservation.pickupTime || ''}
                      onChange={(e) => {
                        handleInputChange('pickupTime', e.target.value);
                        // Auto-preenche horário de devolução se estiver vazio
                        if (!reservation.returnTime) {
                          handleInputChange('returnTime', e.target.value);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-3">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Hora Devolução *
                    </label>
                    <input
                      type="time"
                      required
                      required
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      value={reservation.returnTime || ''}
                      onChange={(e) => handleInputChange('returnTime', e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={scrollToVehicles}
                  disabled={!isFormValid()}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg ${
                    isFormValid()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl transform hover:scale-[1.02] cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Buscar Veículos Disponíveis</span>
                </button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>

      {/* Hero Car Image */}
      <div className="absolute bottom-0 right-0 opacity-20 hidden xl:block">
        <img
          src="https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Hero Car"
          className="w-96 h-auto transform rotate-12 scale-150"
        />
      </div>
    </section>
  );
};