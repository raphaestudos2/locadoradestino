import React from 'react';
import { Users, Star, ArrowRight } from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onSelect: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-yellow-200">
      <div className="relative h-48 overflow-hidden">
        <img
          src={vehicle.images[0]}
          alt={vehicle.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
          {vehicle.category}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-black mb-2">{vehicle.name}</h3>
        <p className="text-gray-600 mb-4">{vehicle.transmission}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{vehicle.seats}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-600">
              R$ {vehicle.price}
            </div>
            <div className="text-sm text-gray-600">por dia</div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {vehicle.features.slice(0, 2).map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onSelect(vehicle)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          <span>Ver Detalhes</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};