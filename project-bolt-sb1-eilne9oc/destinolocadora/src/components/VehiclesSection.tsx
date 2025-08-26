import React from 'react';
import { VehicleCard } from './VehicleCard';
import { Vehicle } from '../types';

interface VehiclesSectionProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicle: Vehicle) => void;
}

export const VehiclesSection: React.FC<VehiclesSectionProps> = ({ 
  vehicles, 
  onVehicleSelect 
}) => {
  return (
    <section id="vehicles" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-black mb-12">
          Nossa Frota
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={onVehicleSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
};