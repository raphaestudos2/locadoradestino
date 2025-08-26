import { supabase, isSupabaseReady } from '../lib/supabase';
import { waitForSupabaseReady } from '../lib/supabase';
import { Customer } from '../types';

export class CustomerService {
  // Get all customers
  static async getAll(): Promise<Customer[]> {
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
      
      console.log('📡 Loading customers from Supabase...');
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching customers from Supabase, using localStorage:', error);
        return this.getFromLocalStorage();
      }
      
      console.log('✅ Loaded customers from Supabase:', data.length);
      return data.map(this.mapDatabaseToCustomer);
    } catch (error) {
      console.warn('Error in CustomerService.getAll, using localStorage:', error);
      return this.getFromLocalStorage();
    }
  }

  // Get customer by ID
  static async getById(id: string): Promise<Customer | null> {
    try {
      if (!isSupabaseReady) {
        const customers = this.getFromLocalStorage();
        return customers.find(c => c.id === id) || null;
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.warn('Error fetching customer from Supabase:', error);
        const customers = this.getFromLocalStorage();
        return customers.find(c => c.id === id) || null;
      }

      return this.mapDatabaseToCustomer(data);
    } catch (error) {
      console.warn('Error in CustomerService.getById:', error);
      const customers = this.getFromLocalStorage();
      return customers.find(c => c.id === id) || null;
    }
  }

  // Create new customer
  static async create(customer: Omit<Customer, 'id' | 'registrationDate' | 'totalRentals'>): Promise<Customer> {
    console.log('🔥 CustomerService.create called with:', customer);
    
    const newCustomer: Customer = {
      ...customer,
      id: this.generateId(),
      registrationDate: new Date().toISOString(),
      totalRentals: 0
    };
    
    console.log('🔥 Generated new customer object:', newCustomer);

    try {
      if (isSupabaseReady) {
        console.log('📡 Supabase is ready, inserting to database...');
        const dbCustomer = this.mapCustomerToDatabase(newCustomer);
        console.log('🔥 Mapped customer for database:', dbCustomer);
        
        const { data, error } = await supabase
          .from('customers')
          .insert([dbCustomer])
          .select()
          .single();

        if (error) {
          console.error('❌ Supabase insert error:', error);
          console.warn('Error creating customer in Supabase, saving to localStorage:', error);
          this.saveToLocalStorage(newCustomer);
          return newCustomer;
        }

        console.log('✅ Customer created in Supabase:', data);
        const createdCustomer = this.mapDatabaseToCustomer(data);
        // Also save to localStorage as backup
        this.saveToLocalStorage(createdCustomer);
        console.log('✅ Customer saved to both Supabase and localStorage');
        return createdCustomer;
      } else {
        console.log('📱 Supabase not ready, saving to localStorage only');
        this.saveToLocalStorage(newCustomer);
        return newCustomer;
      }
    } catch (error) {
      console.error('❌ Exception in CustomerService.create:', error);
      console.warn('Error creating customer, saving to localStorage:', error);
      this.saveToLocalStorage(newCustomer);
      return newCustomer;
    }
  }

  // Update customer
  static async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    console.log('🔥 CustomerService.update called:', { id, updates });
    
    try {
      if (isSupabaseReady) {
        console.log('📡 Updating customer in Supabase...');
        const dbUpdates = this.mapCustomerToDatabase(updates);
        console.log('🔥 Mapped updates for database:', dbUpdates);
        
        const { data, error } = await supabase
          .from('customers')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('❌ Supabase update error:', error);
          throw new Error(`Erro no Supabase: ${error.message}`);
        }

        console.log('✅ Customer updated in Supabase:', data);
        const updatedCustomer = this.mapDatabaseToCustomer(data);
        // Also update localStorage
        this.updateInLocalStorage(id, updates);
        console.log('✅ Customer updated in both Supabase and localStorage');
        return updatedCustomer;
      } else {
        console.log('📱 Supabase not ready, updating localStorage only');
        return this.updateInLocalStorage(id, updates);
      }
    } catch (error) {
      console.error('❌ Exception in CustomerService.update:', error);
      throw error;
    }
  }

  // Delete customer
  static async delete(id: string): Promise<void> {
    try {
      if (isSupabaseReady) {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting customer from Supabase:', error);
          throw new Error(`Erro ao excluir cliente: ${error.message}`);
        }
      }
      
      // Always delete from localStorage
      this.deleteFromLocalStorage(id);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Find customer by email
  static async findByEmail(email: string): Promise<Customer | null> {
    try {
      if (!isSupabaseReady) {
        const customers = this.getFromLocalStorage();
        return customers.find(c => c.email === email) || null;
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        const customers = this.getFromLocalStorage();
        return customers.find(c => c.email === email) || null;
      }

      return this.mapDatabaseToCustomer(data);
    } catch (error) {
      console.warn('Error finding customer by email:', error);
      const customers = this.getFromLocalStorage();
      return customers.find(c => c.email === email) || null;
    }
  }

  // Find customer by CPF
  static async findByCPF(cpf: string): Promise<Customer | null> {
    try {
      if (!isSupabaseReady) {
        const customers = this.getFromLocalStorage();
        return customers.find(c => c.cpf === cpf) || null;
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('cpf', cpf)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        const customers = this.getFromLocalStorage();
        return customers.find(c => c.cpf === cpf) || null;
      }

      return this.mapDatabaseToCustomer(data);
    } catch (error) {
      console.warn('Error finding customer by CPF:', error);
      const customers = this.getFromLocalStorage();
      return customers.find(c => c.cpf === cpf) || null;
    }
  }

  // Helper methods for localStorage operations
  private static getFromLocalStorage(): Customer[] {
    try {
      const customers = localStorage.getItem('customers');
      return customers ? JSON.parse(customers) : [];
    } catch (error) {
      console.error('Error loading customers from localStorage:', error);
      return [];
    }
  }

  private static saveToLocalStorage(customer: Customer): void {
    try {
      const customers = this.getFromLocalStorage();
      const existingIndex = customers.findIndex(c => c.id === customer.id);
      
      if (existingIndex >= 0) {
        customers[existingIndex] = customer;
      } else {
        customers.unshift(customer);
      }
      
      localStorage.setItem('customers', JSON.stringify(customers));
    } catch (error) {
      console.error('Error saving customer to localStorage:', error);
    }
  }

  private static updateInLocalStorage(id: string, updates: Partial<Customer>): Customer {
    const customers = this.getFromLocalStorage();
    const customerIndex = customers.findIndex(c => c.id === id);
    
    if (customerIndex >= 0) {
      customers[customerIndex] = { ...customers[customerIndex], ...updates };
      localStorage.setItem('customers', JSON.stringify(customers));
      return customers[customerIndex];
    }
    
    throw new Error('Customer not found');
  }

  private static deleteFromLocalStorage(id: string): void {
    try {
      const customers = this.getFromLocalStorage();
      const filtered = customers.filter(c => c.id !== id);
      localStorage.setItem('customers', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting customer from localStorage:', error);
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Map database row to Customer type
  private static mapDatabaseToCustomer(data: any): Customer {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      cnh: data.driver_license,
      address: typeof data.address === 'object' ? 
        `${data.address.street || ''}, ${data.address.number || ''} - ${data.address.neighborhood || ''}, ${data.address.city || ''} - ${data.address.state || ''}`.replace(/^,|,$|, -|,\s*$/, '').trim() :
        data.address,
      registrationDate: data.registration_date || data.created_at,
      totalRentals: data.total_rentals || 0,
      status: data.status
    };
  }

  // Map Customer type to database format
  private static mapCustomerToDatabase(customer: Partial<Customer>): any {
    const mapped: any = {};
    
    if (customer.name !== undefined) mapped.name = customer.name;
    if (customer.email !== undefined) mapped.email = customer.email;
    if (customer.phone !== undefined) mapped.phone = customer.phone;
    if (customer.cpf !== undefined) mapped.cpf = customer.cpf;
    if (customer.cnh !== undefined) mapped.driver_license = customer.cnh;
    if (customer.status !== undefined) mapped.status = customer.status;
    
    // Handle address - can be string or object
    if (customer.address !== undefined) {
      if (typeof customer.address === 'string') {
        mapped.address = customer.address;
      } else {
        mapped.address = customer.address;
      }
    }

    return mapped;
  }
}