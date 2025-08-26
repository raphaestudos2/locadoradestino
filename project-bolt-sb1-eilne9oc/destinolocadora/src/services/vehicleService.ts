import { supabase } from '../lib/supabase';
import { isSupabaseReady, waitForSupabaseReady } from '../lib/supabase';
import { Vehicle } from '../types';

export class VehicleService {
  // Get all vehicles
  static async getAll(): Promise<Vehicle[]> {
    try {
      // Wait for Supabase to be ready before proceeding
      const isReady = await waitForSupabaseReady();
      
      if (!isSupabaseReady) {
        const { vehicles: staticVehicles } = await import('../data/vehicles');
        console.log('📱 Supabase not configured, using static vehicles:', staticVehicles.length);
        return staticVehicles;
      }
      
      if (!isReady) {
        console.warn('⚠️ Supabase not ready, falling back to static data');
        const { vehicles: staticVehicles } = await import('../data/vehicles');
        return staticVehicles;
      }
      
      console.log('📡 Loading vehicles from Supabase...');
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles:', error);
        console.log('📱 Falling back to static data due to error');
        const { vehicles: staticVehicles } = await import('../data/vehicles');
        return staticVehicles;
      }

      // If no vehicles in database, return static data as fallback
      if (!data || data.length === 0) {
        console.log('📋 No vehicles in database, using static data');
        const { vehicles: staticVehicles } = await import('../data/vehicles');
        return staticVehicles;
      }
      
      console.log('✅ Loaded vehicles from Supabase:', data.length);
      return data.map(this.mapDatabaseToVehicle);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      console.log('📱 Exception fallback to static data');
      try {
        const { vehicles: staticVehicles } = await import('../data/vehicles');
        return staticVehicles;
      } catch {
        return [];
      }
    }
  }

  // Get vehicle by ID
  static async getById(id: string): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching vehicle:', error);
        throw error;
      }

      return this.mapDatabaseToVehicle(data);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      return null;
    }
  }

  // Create new vehicle
  static async create(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    try {
      const dbVehicle = this.mapVehicleToDatabase(vehicle);
      
      const { data, error } = await supabase
        .from('vehicles')
        .insert([dbVehicle])
        .select()
        .single();

      if (error) {
        console.error('Error creating vehicle:', error);
        throw error;
      }

      return this.mapDatabaseToVehicle(data);
    } catch (error) {
      console.error('Error creating vehicle (Supabase not available):', error);
      throw new Error('Funcionalidade não disponível sem Supabase configurado');
    }
  }

  // Update vehicle
  static async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const dbUpdates = this.mapVehicleToDatabase(updates);
      
      const { data, error } = await supabase
        .from('vehicles')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating vehicle:', error);
        throw error;
      }

      return this.mapDatabaseToVehicle(data);
    } catch (error) {
      console.error('Error updating vehicle (Supabase not available):', error);
      throw new Error('Funcionalidade não disponível sem Supabase configurado');
    }
  }

  // Delete vehicle
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting vehicle:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting vehicle (Supabase not available):', error);
      throw new Error('Funcionalidade não disponível sem Supabase configurado');
    }
  }

  // Get available vehicles for date range
  static async getAvailable(startDate: string, endDate: string): Promise<Vehicle[]> {
    try {
      // First get all available vehicles
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'disponivel');

      if (vehiclesError) {
        console.warn('Supabase not available, using static data:', vehiclesError.message);
        return staticVehicles.filter(v => v.available !== false);
      }

      // Then check which ones are not rented during the requested period
      const { data: rentals, error: rentalsError } = await supabase
        .from('rentals')
        .select('vehicle_id')
        .in('status', ['pendente', 'ativa'])
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

      if (rentalsError) {
        console.warn('Error fetching rentals, returning all available vehicles:', rentalsError.message);
        return vehicles.map(this.mapDatabaseToVehicle);
      }

      const rentedVehicleIds = rentals.map(rental => rental.vehicle_id);
      const availableVehicles = vehicles.filter(vehicle => 
        !rentedVehicleIds.includes(vehicle.id)
      );

      return availableVehicles.map(this.mapDatabaseToVehicle);
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
      // Return all vehicles if rental check fails
      return this.getAll();
    }
  }

  // Map database row to Vehicle type
  private static mapDatabaseToVehicle(data: any): Vehicle {
    return {
      id: data.id,
      name: data.name || `${data.brand || ''} ${data.model || ''}`.trim(),
      category: data.category,
      transmission: data.transmission,
      price: Number(data.daily_rate),
      features: data.features || [],
      images: data.images || [],
      seats: data.seats,
      fuel: data.fuel,
      available: data.status === 'disponivel',
      brand: data.brand,
      model: data.model,
      year: data.year,
      mileage: data.mileage || 0,
      licensePlate: data.license_plate,
      quantity: data.quantity || 1
    };
  }

  // Map Vehicle type to database format
  private static mapVehicleToDatabase(vehicle: Partial<Vehicle>): any {
    const mapped: any = {};
    
    if (vehicle.name !== undefined) mapped.name = vehicle.name;
    if (vehicle.brand !== undefined) mapped.brand = vehicle.brand;
    if (vehicle.model !== undefined) mapped.model = vehicle.model;
    if (vehicle.year !== undefined) mapped.year = vehicle.year;
    if (vehicle.licensePlate !== undefined) mapped.license_plate = vehicle.licensePlate;
    if (vehicle.category !== undefined) mapped.category = vehicle.category;
    if (vehicle.transmission !== undefined) mapped.transmission = vehicle.transmission;
    if (vehicle.fuel !== undefined) mapped.fuel = vehicle.fuel;
    if (vehicle.seats !== undefined) mapped.seats = vehicle.seats;
    if (vehicle.price !== undefined) mapped.daily_rate = vehicle.price;
    if (vehicle.features !== undefined) mapped.features = vehicle.features;
    if (vehicle.images !== undefined) mapped.images = vehicle.images;
    if (vehicle.mileage !== undefined) mapped.mileage = vehicle.mileage;
    if (vehicle.available !== undefined) {
      mapped.status = vehicle.available ? 'disponivel' : 'manutencao';
    }
    if (vehicle.quantity !== undefined) mapped.quantity = vehicle.quantity;

    return mapped;
  }
}