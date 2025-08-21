import React from 'react';
import { X, ChevronLeft, ChevronRight, Users, Car, Star } from 'lucide-react';
import { Vehicle, ReservationData } from '../types';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  currentImageIndex: number;
  onClose: () => void;
  onNextImage: () => void;
  onPrevImage: () => void;
  onSetImageIndex: (index: number) => void;
  onReserve: (vehicleId: string) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  currentImageIndex,
  onClose,
  onNextImage,
  onPrevImage,
  onSetImageIndex,
  onReserve
}) => {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-black">{vehicle.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="relative">
              <div className="relative h-64 overflow-hidden rounded-lg">
                <img
                  src={vehicle.images[currentImageIndex]}
                  alt={`${vehicle.name} ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                <button
                  onClick={onPrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <button
                  onClick={onNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="flex space-x-2 mt-4">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => onSetImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-yellow-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${vehicle.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Info */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-3xl font-bold text-yellow-600 mb-1">
                    R$ {vehicle.price}
                  </div>
                  <div className="text-gray-600">por dia</div>
                </div>
                <div className="text-right">
                  <div className="bg-yellow-100 text-black px-3 py-1 rounded-full text-sm font-semibold mb-1">
                    {vehicle.category}
                  </div>
                  <div className="text-sm text-gray-600">{vehicle.transmission}</div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-black mb-3">Características</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{vehicle.seats} passageiros</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{vehicle.fuel}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-black mb-3">Equipamentos</h3>
              <div className="space-y-2 mb-6">
                {vehicle.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onReserve(vehicle.id)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                Reservar Este Veículo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};