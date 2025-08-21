import { ReservationData, Vehicle, Rental, Customer } from '../types';

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Calculate total days between dates
const calculateDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Save rental to localStorage
export const saveRentalToStorage = (reservation: Partial<ReservationData>, vehicles: Vehicle[]): void => {
  try {
    const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
    if (!vehicle) return;

    const totalDays = calculateDays(reservation.pickupDate || '', reservation.returnDate || '');
    const totalAmount = totalDays * vehicle.price;

    // Create customer record
    const customer: Customer = {
      id: generateId(),
      name: reservation.customerName || '',
      email: reservation.email || '',
      phone: reservation.phone || '',
      cpf: reservation.cpf || '',
      cnh: reservation.cnh || '',
      address: reservation.address ? `${reservation.address}, ${reservation.addressNumber || ''} - ${reservation.neighborhood || ''}, ${reservation.city || ''} - ${reservation.state || ''}` : undefined,
      registrationDate: new Date().toISOString(),
      totalRentals: 1,
      status: 'active'
    };

    // Create rental record
    const rental: Rental = {
      id: generateId(),
      customerId: customer.id,
      vehicleId: vehicle.id,
      pickupDate: reservation.pickupDate || '',
      returnDate: reservation.returnDate || '',
      pickupTime: reservation.pickupTime || '',
      returnTime: reservation.returnTime || '',
      pickupLocation: reservation.pickupLocation || '',
      status: 'pending',
      totalAmount: totalAmount,
      paymentStatus: 'pending',
      notes: 'Reserva via WhatsApp'
    };

    // Save to localStorage
    const existingRentals = JSON.parse(localStorage.getItem('rentals') || '[]');
    const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');

    // Check if customer already exists
    const existingCustomer = existingCustomers.find((c: Customer) => 
      c.email === customer.email || c.cpf === customer.cpf
    );

    if (existingCustomer) {
      // Update existing customer
      existingCustomer.totalRentals += 1;
      rental.customerId = existingCustomer.id;
    } else {
      // Add new customer
      existingCustomers.push(customer);
    }

    existingRentals.push(rental);

    localStorage.setItem('rentals', JSON.stringify(existingRentals));
    localStorage.setItem('customers', JSON.stringify(existingCustomers));

    console.log('Rental saved successfully:', rental);
  } catch (error) {
    console.error('Error saving rental:', error);
  }
};

// Get all rentals from storage
export const getRentalsFromStorage = (): Rental[] => {
  try {
    const rentals = localStorage.getItem('rentals');
    return rentals ? JSON.parse(rentals) : [];
  } catch (error) {
    console.error('Error loading rentals:', error);
    return [];
  }
};

// Get all customers from storage
export const getCustomersFromStorage = (): Customer[] => {
  try {
    const customers = localStorage.getItem('customers');
    return customers ? JSON.parse(customers) : [];
  } catch (error) {
    console.error('Error loading customers:', error);
    return [];
  }
};

// Update rental status
export const updateRentalStatus = (rentalId: string, status: Rental['status']): void => {
  try {
    const rentals = getRentalsFromStorage();
    const updatedRentals = rentals.map(rental => 
      rental.id === rentalId ? { ...rental, status } : rental
    );
    localStorage.setItem('rentals', JSON.stringify(updatedRentals));
  } catch (error) {
    console.error('Error updating rental status:', error);
  }
};

// Update payment status
export const updatePaymentStatus = (rentalId: string, paymentStatus: Rental['paymentStatus']): void => {
  try {
    const rentals = getRentalsFromStorage();
    const updatedRentals = rentals.map(rental => 
      rental.id === rentalId ? { ...rental, paymentStatus } : rental
    );
    localStorage.setItem('rentals', JSON.stringify(updatedRentals));
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
};