import { supabase, isSupabaseReady } from '../lib/supabase';
import { waitForSupabaseReady } from '../lib/supabase';
import { Rental } from '../types';

export class RentalService {
  // Get all rentals
  static async getAll(): Promise<Rental[]> {
    try {
      // Wait for Supabase to be ready before proceeding
      const isReady = await waitForSupabaseReady();
      
      if (!isSupabaseReady) {
        console.log('📱 Supabase not configured, using localStorage');
        return this.getFromLocalStorage();
      }
      
      if (!isReady) {
        console.warn('⚠️ Supabase not ready, using localStorage');
        return this.getFromLocalStorage();
      }
      
      console.log('📡 Loading rentals from Supabase...');
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          customers(name, email),
          vehicles(name, brand, model)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching rentals from Supabase, using localStorage:', error);
        return this.getFromLocalStorage();
      }
      
      console.log('✅ Loaded rentals from Supabase:', data.length);
      return data.map(this.mapDatabaseToRental);
    } catch (error) {
      console.warn('Error in RentalService.getAll, using localStorage:', error);
      return this.getFromLocalStorage();
    }
  }

  // Get rental by ID
  static async getById(id: string): Promise<Rental | null> {
    try {
      if (!isSupabaseReady) {
        const rentals = this.getFromLocalStorage();
        return rentals.find(r => r.id === id) || null;
      }

      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          customers(name, email),
          vehicles(name, brand, model)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.warn('Error fetching rental from Supabase:', error);
        const rentals = this.getFromLocalStorage();
        return rentals.find(r => r.id === id) || null;
      }

      return this.mapDatabaseToRental(data);
    } catch (error) {
      console.warn('Error in RentalService.getById:', error);
      const rentals = this.getFromLocalStorage();
      return rentals.find(r => r.id === id) || null;
    }
  }

  // Create new rental
  static async create(rental: Omit<Rental, 'id'>): Promise<Rental> {
    const newRental: Rental = {
      ...rental,
      id: this.generateId()
    };

    try {
      if (isSupabaseReady) {
        const dbRental = this.mapRentalToDatabase(newRental);
        
        const { data, error } = await supabase
          .from('rentals')
          .insert([dbRental])
          .select(`
            *,
            customers(name, email),
            vehicles(name, brand, model)
          `)
          .single();

        if (error) {
          console.warn('Error creating rental in Supabase, saving to localStorage:', error);
          this.saveToLocalStorage(newRental);
          return newRental;
        }

        const createdRental = this.mapDatabaseToRental(data);
        // Also save to localStorage as backup
        this.saveToLocalStorage(createdRental);
        return createdRental;
      } else {
        this.saveToLocalStorage(newRental);
        return newRental;
      }
    } catch (error) {
      console.warn('Error creating rental, saving to localStorage:', error);
      this.saveToLocalStorage(newRental);
      return newRental;
    }
  }

  // Update rental
  static async update(id: string, updates: Partial<Rental>): Promise<Rental> {
    try {
      if (isSupabaseReady) {
        const dbUpdates = this.mapRentalToDatabase(updates);
        
        const { data, error } = await supabase
          .from('rentals')
          .update(dbUpdates)
          .eq('id', id)
          .select(`
            *,
            customers(name, email),
            vehicles(name, brand, model)
          `)
          .single();

        if (error) {
          console.warn('Error updating rental in Supabase:', error);
          return this.updateInLocalStorage(id, updates);
        }

        const updatedRental = this.mapDatabaseToRental(data);
        // Also update localStorage
        this.updateInLocalStorage(id, updates);
        return updatedRental;
      } else {
        return this.updateInLocalStorage(id, updates);
      }
    } catch (error) {
      console.warn('Error updating rental:', error);
      return this.updateInLocalStorage(id, updates);
    }
  }

  // Delete rental
  static async delete(id: string): Promise<void> {
    try {
      if (isSupabaseReady) {
        const { error } = await supabase
          .from('rentals')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('Error deleting rental from Supabase:', error);
        }
      }
      
      // Always delete from localStorage
      this.deleteFromLocalStorage(id);
    } catch (error) {
      console.warn('Error deleting rental:', error);
      this.deleteFromLocalStorage(id);
    }
  }

  // Get rentals by customer
  static async getByCustomer(customerId: string): Promise<Rental[]> {
    try {
      if (!isSupabaseReady) {
        const rentals = this.getFromLocalStorage();
        return rentals.filter(r => r.customerId === customerId);
      }

      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          customers(name, email),
          vehicles(name, brand, model)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching customer rentals from Supabase:', error);
        const rentals = this.getFromLocalStorage();
        return rentals.filter(r => r.customerId === customerId);
      }

      return data.map(this.mapDatabaseToRental);
    } catch (error) {
      console.warn('Error in getByCustomer:', error);
      const rentals = this.getFromLocalStorage();
      return rentals.filter(r => r.customerId === customerId);
    }
  }

  // Get active rentals
  static async getActive(): Promise<Rental[]> {
    try {
      if (!isSupabaseReady) {
        const rentals = this.getFromLocalStorage();
        return rentals.filter(r => r.status === 'active');
      }

      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          customers(name, email),
          vehicles(name, brand, model)
        `)
        .eq('status', 'ativa')
        .order('start_date', { ascending: true });

      if (error) {
        console.warn('Error fetching active rentals from Supabase:', error);
        const rentals = this.getFromLocalStorage();
        return rentals.filter(r => r.status === 'active');
      }

      return data.map(this.mapDatabaseToRental);
    } catch (error) {
      console.warn('Error in getActive:', error);
      const rentals = this.getFromLocalStorage();
      return rentals.filter(r => r.status === 'active');
    }
  }

  // Helper methods for localStorage operations
  private static getFromLocalStorage(): Rental[] {
    try {
      const rentals = localStorage.getItem('rentals');
      return rentals ? JSON.parse(rentals) : [];
    } catch (error) {
      console.error('Error loading rentals from localStorage:', error);
      return [];
    }
  }

  private static saveToLocalStorage(rental: Rental): void {
    try {
      const rentals = this.getFromLocalStorage();
      const existingIndex = rentals.findIndex(r => r.id === rental.id);
      
      if (existingIndex >= 0) {
        rentals[existingIndex] = rental;
      } else {
        rentals.unshift(rental);
      }
      
      localStorage.setItem('rentals', JSON.stringify(rentals));
    } catch (error) {
      console.error('Error saving rental to localStorage:', error);
    }
  }

  private static updateInLocalStorage(id: string, updates: Partial<Rental>): Rental {
    const rentals = this.getFromLocalStorage();
    const rentalIndex = rentals.findIndex(r => r.id === id);
    
    if (rentalIndex >= 0) {
      rentals[rentalIndex] = { ...rentals[rentalIndex], ...updates };
      localStorage.setItem('rentals', JSON.stringify(rentals));
      return rentals[rentalIndex];
    }
    
    throw new Error('Rental not found');
  }

  private static deleteFromLocalStorage(id: string): void {
    try {
      const rentals = this.getFromLocalStorage();
      const filtered = rentals.filter(r => r.id !== id);
      localStorage.setItem('rentals', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting rental from localStorage:', error);
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Map database row to Rental type
  private static mapDatabaseToRental(data: any): Rental {
    return {
      id: data.id,
      customerId: data.customer_id,
      vehicleId: data.vehicle_id,
      pickupDate: data.start_date,
      returnDate: data.end_date,
      pickupTime: data.start_time,
      returnTime: data.end_time,
      pickupLocation: data.pickup_location,
      actualReturnDate: data.actual_end_date,
      status: this.mapDatabaseStatus(data.status),
      totalAmount: Number(data.total_amount),
      paymentStatus: this.mapDatabasePaymentStatus(data.payment_status),
      notes: data.notes
    };
  }

  // Map Rental type to database format
  private static mapRentalToDatabase(rental: Partial<Rental>): any {
    const mapped: any = {};
    
    if (rental.customerId !== undefined) mapped.customer_id = rental.customerId;
    if (rental.vehicleId !== undefined) mapped.vehicle_id = rental.vehicleId;
    if (rental.pickupDate !== undefined) mapped.start_date = rental.pickupDate;
    if (rental.returnDate !== undefined) mapped.end_date = rental.returnDate;
    if (rental.pickupTime !== undefined) mapped.start_time = rental.pickupTime;
    if (rental.returnTime !== undefined) mapped.end_time = rental.returnTime;
    if (rental.pickupLocation !== undefined) mapped.pickup_location = rental.pickupLocation;
    if (rental.actualReturnDate !== undefined) mapped.actual_end_date = rental.actualReturnDate;
    if (rental.totalAmount !== undefined) mapped.total_amount = rental.totalAmount;
    if (rental.notes !== undefined) mapped.notes = rental.notes;

    // Map status
    if (rental.status !== undefined) {
      mapped.status = this.mapStatusToDatabase(rental.status);
    }

    // Map payment status
    if (rental.paymentStatus !== undefined) {
      mapped.payment_status = this.mapPaymentStatusToDatabase(rental.paymentStatus);
    }

    // Calculate required fields for database
    if (rental.pickupDate && rental.returnDate && rental.totalAmount) {
      const startDate = new Date(rental.pickupDate);
      const endDate = new Date(rental.returnDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      mapped.total_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      mapped.daily_rate = rental.totalAmount / mapped.total_days;
      mapped.subtotal = rental.totalAmount;
    }

    return mapped;
  }

  // Status mapping helpers
  private static mapDatabaseStatus(dbStatus: string): Rental['status'] {
    const statusMap: Record<string, Rental['status']> = {
      'pendente': 'pending',
      'confirmada': 'pending',
      'ativa': 'active',
      'concluida': 'completed',
      'cancelada': 'cancelled'
    };
    return statusMap[dbStatus] || 'pending';
  }

  private static mapStatusToDatabase(status: Rental['status']): string {
    const statusMap: Record<Rental['status'], string> = {
      'pending': 'pendente',
      'active': 'ativa',
      'completed': 'concluida',
      'cancelled': 'cancelada'
    };
    return statusMap[status] || 'pendente';
  }

  private static mapDatabasePaymentStatus(dbStatus: string): Rental['paymentStatus'] {
    const statusMap: Record<string, Rental['paymentStatus']> = {
      'pendente': 'pending',
      'parcial': 'pending',
      'pago': 'paid',
      'atrasado': 'overdue',
      'cancelado': 'pending'
    };
    return statusMap[dbStatus] || 'pending';
  }

  private static mapPaymentStatusToDatabase(status: Rental['paymentStatus']): string {
    const statusMap: Record<Rental['paymentStatus'], string> = {
      'pending': 'pendente',
      'paid': 'pago',
      'overdue': 'atrasado'
    };
    return statusMap[status] || 'pendente';
  }
}