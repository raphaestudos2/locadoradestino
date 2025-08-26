import { supabase } from '../lib/supabase';

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  active: boolean;
  displayOrder: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Map database row to PickupLocation type
export interface Location extends PickupLocation {}

export class LocationService {
  // Get all locations (admin view)
  static async getAllLocations(): Promise<PickupLocation[]> {
    try {
      const { data, error } = await supabase
        .from('pickup_locations')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data || []).map(this.mapDatabaseToLocation);
    } catch (error) {
      console.error('Erro ao buscar locais:', error);
      return [];
    }
  }

  // Get active locations (public view)
  static async getActiveLocations(): Promise<PickupLocation[]> {
    try {
      const { data, error } = await supabase
        .from('pickup_locations')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data || []).map(this.mapDatabaseToLocation);
    } catch (error) {
      console.error('Erro ao buscar locais ativos:', error);
      return [];
    }
  }

  // Get locations by state
  static async getByState(state: string): Promise<PickupLocation[]> {
    try {
      const { data, error } = await supabase
        .from('pickup_locations')
        .select('*')
        .eq('state', state)
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data || []).map(this.mapDatabaseToLocation);
    } catch (error) {
      console.error('Erro ao buscar locais por estado:', error);
      return [];
    }
  }

  // Create new location
  static async create(location: Omit<PickupLocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<PickupLocation> {
    try {
      const dbLocation = this.mapLocationToDatabase(location);
      
      const { data, error } = await supabase
        .from('pickup_locations')
        .insert([dbLocation])
        .select()
        .single();

      if (error) throw error;
      return this.mapDatabaseToLocation(data);
    } catch (error) {
      console.error('Erro ao criar local:', error);
      throw error;
    }
  }

  // Update location
  static async update(id: string, updates: Partial<PickupLocation>): Promise<PickupLocation> {
    try {
      const dbUpdates = this.mapLocationToDatabase(updates);
      
      const { data, error } = await supabase
        .from('pickup_locations')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.mapDatabaseToLocation(data);
    } catch (error) {
      console.error('Erro ao atualizar local:', error);
      throw error;
    }
  }

  // Delete location
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pickup_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar local:', error);
      throw error;
    }
  }

  // Map database row to PickupLocation type
  private static mapDatabaseToLocation(data: any): PickupLocation {
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      active: data.active,
      displayOrder: data.display_order,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Map PickupLocation type to database format
  private static mapLocationToDatabase(location: Partial<PickupLocation>): any {
    const mapped: any = {};
    
    if (location.name !== undefined) mapped.name = location.name;
    if (location.address !== undefined) mapped.address = location.address;
    if (location.city !== undefined) mapped.city = location.city;
    if (location.state !== undefined) mapped.state = location.state;
    if (location.active !== undefined) mapped.active = location.active;
    if (location.displayOrder !== undefined) mapped.display_order = location.displayOrder;
    if (location.notes !== undefined) mapped.notes = location.notes;

    return mapped;
  }
}