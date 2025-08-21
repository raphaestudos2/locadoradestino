import { supabase } from '../lib/supabase';
import { Customer } from '../types';

export class CustomerService {
  // Get all customers
  static async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }

    return data.map(this.mapDatabaseToCustomer);
  }

  // Get customer by ID
  static async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching customer:', error);
      throw error;
    }

    return this.mapDatabaseToCustomer(data);
  }

  // Create new customer
  static async create(customer: Omit<Customer, 'id' | 'registrationDate' | 'totalRentals'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert([this.mapCustomerToDatabase(customer)])
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }

    return this.mapDatabaseToCustomer(data);
  }

  // Update customer
  static async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(this.mapCustomerToDatabase(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }

    return this.mapDatabaseToCustomer(data);
  }

  // Delete customer
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Find customer by email
  static async findByEmail(email: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error finding customer by email:', error);
      throw error;
    }

    return this.mapDatabaseToCustomer(data);
  }

  // Find customer by CPF
  static async findByCPF(cpf: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error finding customer by CPF:', error);
      throw error;
    }

    return this.mapDatabaseToCustomer(data);
  }

  // Map database row to Customer type
  private static mapDatabaseToCustomer(data: any): Customer {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      cnh: data.cnh,
      address: data.address,
      registrationDate: data.registration_date,
      totalRentals: data.total_rentals,
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
    if (customer.cnh !== undefined) mapped.cnh = customer.cnh;
    if (customer.address !== undefined) mapped.address = customer.address;
    if (customer.status !== undefined) mapped.status = customer.status;

    return mapped;
  }
}