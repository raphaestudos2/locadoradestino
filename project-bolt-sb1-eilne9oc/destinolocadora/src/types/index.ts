export interface Vehicle {
  id: string;
  name: string;
  category: string;
  transmission: string;
  price: number;
  features: string[];
  images: string[];
  seats: number;
  fuel: string;
  available?: boolean;
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  licensePlate?: string;
  quantity?: number;
}

export interface ReservationData {
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  pickupLocation: string;
  customerName: string;
  cpf: string;
  cnh: string;
  phone: string;
  email: string;
  birthDate?: string;
  cep?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cnh: string;
  address?: string;
  registrationDate: string;
  totalRentals: number;
  status: 'active' | 'inactive' | 'blocked';
}

export interface Rental {
  id: string;
  customerId: string;
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  pickupLocation: string;
  actualReturnDate?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

export type PageType = 'home' | 'about' | 'contact' | 'admin';
export type AdminPageType = 'dashboard' | 'vehicles' | 'customers' | 'rentals' | 'locations' | 'reports' | 'settings';