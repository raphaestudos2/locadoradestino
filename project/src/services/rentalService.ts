import { supabase } from '../lib/supabase';
import { Rental } from '../types';

export class RentalService {
  // Get all rentals
  static async getAll(): Promise<Rental[]> {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        customers(name, email),
        vehicles(name, brand, model)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rentals:', error);
      throw error;
    }

    return data.map(this.mapDatabaseToRental);
  }

  // Get rental by ID
  static async getById(id: string): Promise<Rental | null> {
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
      console.error('Error fetching rental:', error);
      throw error;
    }

    return this.mapDatabaseToRental(data);
  }

  // Create new rental
  static async create(rental: Omit<Rental, 'id'>): Promise<Rental> {
    const { data, error } = await supabase
      .from('rentals')
      .insert([this.mapRentalToDatabase(rental)])
      .select(`
        *,
        customers(name, email),
        vehicles(name, brand, model)
      `)
      .single();

    if (error) {
      console.error('Error creating rental:', error);
      throw error;
    }

    return this.mapDatabaseToRental(data);
  }

  // Update rental
  static async update(id: string, updates: Partial<Rental>): Promise<Rental> {
    const { data, error } = await supabase
      .from('rentals')
      .update(this.mapRentalToDatabase(updates))
      .eq('id', id)
      .select(`
        *,
        customers(name, email),
        vehicles(name, brand, model)
      `)
      .single();

    if (error) {
      console.error('Error updating rental:', error);
      throw error;
    }

    return this.mapDatabaseToRental(data);
  }

  // Delete rental
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('rentals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting rental:', error);
      throw error;
    }
  }

  // Get rentals by customer
  static async getByCustomer(customerId: string): Promise<Rental[]> {
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
      console.error('Error fetching customer rentals:', error);
      throw error;
    }

    return data.map(this.mapDatabaseToRental);
  }

  // Get rentals by vehicle
  static async getByVehicle(vehicleId: string): Promise<Rental[]> {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        customers(name, email),
        vehicles(name, brand, model)
      `)
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicle rentals:', error);
      throw error;
    }

    return data.map(this.mapDatabaseToRental);
  }

  // Get active rentals
  static async getActive(): Promise<Rental[]> {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        customers(name, email),
        vehicles(name, brand, model)
      `)
      .eq('status', 'active')
      .order('pickup_date', { ascending: true });

    if (error) {
      console.error('Error fetching active rentals:', error);
      throw error;
    }

    return data.map(this.mapDatabaseToRental);
  }

  // Map database row to Rental type
  private static mapDatabaseToRental(data: any): Rental {
    return {
      id: data.id,
      customerId: data.customer_id,
      vehicleId: data.vehicle_id,
      pickupDate: data.pickup_date,
      returnDate: data.return_date,
      pickupTime: data.pickup_time,
      returnTime: data.return_time,
      pickupLocation: data.pickup_location,
      actualReturnDate: data.actual_return_date,
      status: data.status,
      totalAmount: Number(data.total_amount),
      paymentStatus: data.payment_status,
      notes: data.notes
    };
  }

  // Map Rental type to database format
  private static mapRentalToDatabase(rental: Partial<Rental>): any {
    const mapped: any = {};
    
    if (rental.customerId !== undefined) mapped.customer_id = rental.customerId;
    if (rental.vehicleId !== undefined) mapped.vehicle_id = rental.vehicleId;
    if (rental.pickupDate !== undefined) mapped.pickup_date = rental.pickupDate;
    if (rental.returnDate !== undefined) mapped.return_date = rental.returnDate;
    if (rental.pickupTime !== undefined) mapped.pickup_time = rental.pickupTime;
    if (rental.returnTime !== undefined) mapped.return_time = rental.returnTime;
    if (rental.pickupLocation !== undefined) mapped.pickup_location = rental.pickupLocation;
    if (rental.actualReturnDate !== undefined) mapped.actual_return_date = rental.actualReturnDate;
    if (rental.status !== undefined) mapped.status = rental.status;
    if (rental.totalAmount !== undefined) mapped.total_amount = rental.totalAmount;
    if (rental.paymentStatus !== undefined) mapped.payment_status = rental.paymentStatus;
    if (rental.notes !== undefined) mapped.notes = rental.notes;

    return mapped;
  }
}