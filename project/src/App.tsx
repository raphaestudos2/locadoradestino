import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { ReservationModal } from './components/ReservationModal';
import { VehicleService } from './services/vehicleService';
import { generateWhatsAppMessage, openWhatsApp } from './utils/whatsapp';
import { saveRentalToStorage } from './utils/rentalStorage';
import { Vehicle, ReservationData, PageType } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [reservation, setReservation] = useState<Partial<ReservationData>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  
  const homePageRef = useRef<{ scrollToVehicles: () => void }>(null);

  // Check for admin route in URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    }
  }, []);

  // Update URL when page changes
  useEffect(() => {
    if (currentPage === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
  }, [currentPage]);

  // Load vehicles from database
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await VehicleService.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (selectedVehicle) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % selectedVehicle.images.length
      );
    }
  };

  const prevImage = () => {
    if (selectedVehicle) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? selectedVehicle.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentImageIndex(0);
  };

  const handleReserveVehicle = (vehicleId: string) => {
    setReservation({...reservation, vehicleId});
    setShowReservationForm(true);
    setSelectedVehicle(null);
  };

  const handleWhatsAppSubmit = () => {
    // Save rental to storage before opening WhatsApp
    saveRentalToStorage(reservation, vehicles);
    
    const message = generateWhatsAppMessage(reservation, vehicles);
    openWhatsApp(message);
    
    // Clear reservation form after submission
    setReservation({});
    setShowReservationForm(false);
  };

  const scrollToVehicles = () => {
    if (currentPage === 'home') {
      const vehiclesSection = document.getElementById('vehicles');
      vehiclesSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Only show header for non-admin pages */}
      {currentPage !== 'admin' && (
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          scrollToVehicles={scrollToVehicles}
        />
      )}
      
      {currentPage === 'home' && (
        <HomePage
          vehicles={vehicles}
          reservation={reservation}
          setReservation={setReservation}
          onVehicleSelect={handleVehicleSelect}
        />
      )}
      
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'contact' && <ContactPage />}
      {currentPage === 'admin' && <AdminPage />}
      
      <VehicleDetailModal
        vehicle={selectedVehicle}
        currentImageIndex={currentImageIndex}
        onClose={() => setSelectedVehicle(null)}
        onNextImage={nextImage}
        onPrevImage={prevImage}
        onSetImageIndex={setCurrentImageIndex}
        onReserve={handleReserveVehicle}
      />

      <ReservationModal
        isOpen={showReservationForm}
        onClose={() => setShowReservationForm(false)}
        reservation={reservation}
        setReservation={setReservation}
        vehicles={vehicles}
        onSubmit={handleWhatsAppSubmit}
      />
      
      {currentPage !== 'admin' && <Footer setCurrentPage={setCurrentPage} />}
    </div>
  );
}

export default App;