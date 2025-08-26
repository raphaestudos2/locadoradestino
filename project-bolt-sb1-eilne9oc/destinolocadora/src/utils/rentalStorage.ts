import { ReservationData, Vehicle, Rental, Customer } from '../types';
import { CustomerService } from '../services/customerService';
import { RentalService } from '../services/rentalService';

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
export const saveRentalToStorage = async (reservation: Partial<ReservationData>, vehicles: Vehicle[]): Promise<void> => {
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
    const existingRentals = await RentalService.getAll();
    const existingCustomers = await CustomerService.getAll();

    // Check if customer already exists
    let existingCustomer = existingCustomers.find((c: Customer) => 
      c.email === customer.email || c.cpf === customer.cpf
    );

    if (existingCustomer) {
      // Use existing customer
      rental.customerId = existingCustomer.id;
      await CustomerService.update(existingCustomer.id, {
        ...customer,
        totalRentals: existingCustomer.totalRentals + 1
      });
    } else {
      // Create new customer
      const newCustomer = await CustomerService.create({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        cpf: customer.cpf,
        cnh: customer.cnh,
        address: customer.address,
        status: customer.status
      });
      rental.customerId = newCustomer.id;
    }

    // Create rental
    await RentalService.create({
      customerId: rental.customerId,
      vehicleId: rental.vehicleId,
      pickupDate: rental.pickupDate,
      returnDate: rental.returnDate,
      pickupTime: rental.pickupTime,
      returnTime: rental.returnTime,
      pickupLocation: rental.pickupLocation,
      status: rental.status,
      totalAmount: rental.totalAmount,
      paymentStatus: rental.paymentStatus,
      notes: rental.notes
    });

    console.log('Rental saved successfully to database');
  } catch (error) {
    console.error('Error saving rental to database:', error);
    // Fallback to localStorage if database fails
    try {
      const existingRentals = JSON.parse(localStorage.getItem('rentals') || '[]');
      const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      
      existingRentals.push(rental);
      existingCustomers.push(customer);
      
      localStorage.setItem('rentals', JSON.stringify(existingRentals));
      localStorage.setItem('customers', JSON.stringify(existingCustomers));
      
      console.log('Rental saved to localStorage as fallback');
    } catch (storageError) {
      console.error('Error saving to localStorage:', storageError);
    }
  }
};

// Get all rentals from storage
export const getRentalsFromStorage = async (): Promise<Rental[]> => {
  try {
    return await RentalService.getAll();
  } catch (error) {
    console.error('Error loading rentals:', error);
    // Fallback to localStorage
    try {
      const rentals = localStorage.getItem('rentals');
      return rentals ? JSON.parse(rentals) : [];
    } catch {
      return [];
    }
  }
};

// Get all customers from storage
export const getCustomersFromStorage = async (): Promise<Customer[]> => {
  try {
    return await CustomerService.getAll();
  } catch (error) {
    console.error('Error loading customers:', error);
    // Fallback to localStorage
    try {
      const customers = localStorage.getItem('customers');
      return customers ? JSON.parse(customers) : [];
    } catch {
      return [];
    }
  }
};

// Update rental status
export const updateRentalStatus = async (rentalId: string, status: Rental['status']): Promise<void> => {
  try {
    await RentalService.update(rentalId, { status });
  } catch (error) {
    console.error('Error updating rental status:', error);
  }
};

// Update payment status
export const updatePaymentStatus = async (rentalId: string, paymentStatus: Rental['paymentStatus']): Promise<void> => {
  try {
    await RentalService.update(rentalId, { paymentStatus });
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
};