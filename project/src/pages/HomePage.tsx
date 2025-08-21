import React, { useRef } from 'react';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { VehiclesSection } from '../components/VehiclesSection';
import { Vehicle, ReservationData } from '../types';

interface HomePageProps {
  vehicles: Vehicle[];
  reservation: Partial<ReservationData>;
  setReservation: (reservation: Partial<ReservationData>) => void;
  onVehicleSelect: (vehicle: Vehicle) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  vehicles,
  reservation,
  setReservation,
  onVehicleSelect
}) => {
  const vehiclesRef = useRef<HTMLDivElement>(null);

  const scrollToVehicles = () => {
    vehiclesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <HeroSection
        reservation={reservation}
        setReservation={setReservation}
        scrollToVehicles={scrollToVehicles}
      />
      <FeaturesSection />
      <div ref={vehiclesRef}>
        <VehiclesSection
          vehicles={vehicles}
          onVehicleSelect={onVehicleSelect}
        />
      </div>
    </div>
  );
};