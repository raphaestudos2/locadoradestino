import { supabase, isSupabaseReady } from '../lib/supabase';
import { waitForSupabaseReady } from '../lib/supabase';

export interface PaymentRecord {
  id: string;
  rentalId: string;
  paymentType: 'deposito' | 'pagamento' | 'multa' | 'taxa_adicional' | 'reembolso';
  amount: number;
  paymentMethod: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'boleto';
  paymentDate: string;
  dueDate?: string;
  status: 'pendente' | 'processando' | 'aprovado' | 'rejeitado' | 'cancelado';
  transactionId?: string;
  receiptUrl?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export class PaymentService {
  // Get all payments
  static async getAll(): Promise<PaymentRecord[]> {
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
      
      console.log('📡 Loading payments from Supabase...');
      const { data, error } = await supabase
        .from('rental_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching payments from Supabase, using localStorage:', error);
        return this.getFromLocalStorage();
      }
      
      const payments = data.map(this.mapDatabaseToPayment);
      // Sync to localStorage to keep fallback data current
      this.saveAllToLocalStorage(payments);
      console.log('✅ Loaded payments from Supabase:', payments.length);
      return payments;
    } catch (error) {
      console.warn('Error in PaymentService.getAll, using localStorage:', error);
      return this.getFromLocalStorage();
    }
  }

  // Get payments by rental
  static async getByRental(rentalId: string): Promise<PaymentRecord[]> {
    try {
      if (!isSupabaseReady) {
        const payments = this.getFromLocalStorage();
        return payments.filter(p => p.rentalId === rentalId);
      }

      const { data, error } = await supabase
        .from('rental_payments')
        .select('*')
        .eq('rental_id', rentalId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching rental payments from Supabase:', error);
        const payments = this.getFromLocalStorage();
        return payments.filter(p => p.rentalId === rentalId);
      }

      return data.map(this.mapDatabaseToPayment);
    } catch (error) {
      console.warn('Error in getByRental:', error);
      const payments = this.getFromLocalStorage();
      return payments.filter(p => p.rentalId === rentalId);
    }
  }

  // Create new payment
  static async create(payment: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentRecord> {
    const newPayment: PaymentRecord = {
      ...payment,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (isSupabaseReady) {
        const dbPayment = this.mapPaymentToDatabase(newPayment);
        
        const { data, error } = await supabase
          .from('rental_payments')
          .insert([dbPayment])
          .select()
          .single();

        if (error) {
          console.warn('Error creating payment in Supabase, saving to localStorage:', error);
          console.log('💾 Salvando pagamento no localStorage como backup');
          this.saveToLocalStorage(newPayment);
          return newPayment;
        }

        const createdPayment = this.mapDatabaseToPayment(data);
        // Also save to localStorage as backup
        this.saveToLocalStorage(createdPayment);
        console.log('✅ Pagamento criado no Supabase e localStorage:', {
          id: createdPayment.id,
          amount: createdPayment.amount,
          type: createdPayment.paymentType,
          rentalId: createdPayment.rentalId,
          status: createdPayment.status,
          method: createdPayment.paymentMethod
        });
        return createdPayment;
      } else {
        this.saveToLocalStorage(newPayment);
        console.log('💾 Pagamento salvo no localStorage (Supabase indisponível):', {
          id: newPayment.id,
          amount: newPayment.amount,
          type: newPayment.paymentType
        });
        return newPayment;
      }
    } catch (error) {
      console.warn('Error creating payment, saving to localStorage:', error);
      this.saveToLocalStorage(newPayment);
      return newPayment;
    }
  }

  // Get payment with complete details (joins with rental data)
  static async getCompletePaymentDetails(paymentId: string): Promise<any> {
    try {
      if (!isSupabaseReady) {
        return null;
      }

      const { data, error } = await supabase
        .from('rental_payments_complete')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        console.warn('Error fetching complete payment details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Error in getCompletePaymentDetails:', error);
      return null;
    }
  }

  // Update payment
  static async update(id: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord> {
    try {
      if (isSupabaseReady) {
        const dbUpdates = this.mapPaymentToDatabase({ ...updates, updatedAt: new Date().toISOString() });
        
        const { data, error } = await supabase
          .from('rental_payments')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.warn('Error updating payment in Supabase:', error);
          return this.updateInLocalStorage(id, updates);
        }

        const updatedPayment = this.mapDatabaseToPayment(data);
        // Also update localStorage
        this.updateInLocalStorage(id, updates);
        return updatedPayment;
      } else {
        return this.updateInLocalStorage(id, updates);
      }
    } catch (error) {
      console.warn('Error updating payment:', error);
      return this.updateInLocalStorage(id, updates);
    }
  }

  // Delete payment
  static async delete(id: string): Promise<void> {
    try {
      if (isSupabaseReady) {
        const { error } = await supabase
          .from('rental_payments')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('Error deleting payment from Supabase:', error);
        }
      }
      
      // Always delete from localStorage
      this.deleteFromLocalStorage(id);
    } catch (error) {
      console.warn('Error deleting payment:', error);
      this.deleteFromLocalStorage(id);
    }
  }

  // Helper methods for localStorage operations
  private static getFromLocalStorage(): PaymentRecord[] {
    try {
      const payments = localStorage.getItem('payments');
      return payments ? JSON.parse(payments) : [];
    } catch (error) {
      console.error('Error loading payments from localStorage:', error);
      return [];
    }
  }

  private static saveToLocalStorage(payment: PaymentRecord): void {
    try {
      const payments = this.getFromLocalStorage();
      const existingIndex = payments.findIndex(p => p.id === payment.id);
      
      if (existingIndex >= 0) {
        payments[existingIndex] = payment;
      } else {
        payments.unshift(payment);
      }
      
      localStorage.setItem('payments', JSON.stringify(payments));
    } catch (error) {
      console.error('Error saving payment to localStorage:', error);
    }
  }

  private static updateInLocalStorage(id: string, updates: Partial<PaymentRecord>): PaymentRecord {
    const payments = this.getFromLocalStorage();
    const paymentIndex = payments.findIndex(p => p.id === id);
    
    if (paymentIndex >= 0) {
      payments[paymentIndex] = { ...payments[paymentIndex], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('payments', JSON.stringify(payments));
      return payments[paymentIndex];
    }
    
    throw new Error('Payment not found');
  }

  private static deleteFromLocalStorage(id: string): void {
    try {
      const payments = this.getFromLocalStorage();
      const filtered = payments.filter(p => p.id !== id);
      localStorage.setItem('payments', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting payment from localStorage:', error);
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Sync all payments to localStorage
  private static saveAllToLocalStorage(payments: PaymentRecord[]): void {
    try {
      localStorage.setItem('payments', JSON.stringify(payments));
    } catch (error) {
      console.error('Error syncing payments to localStorage:', error);
    }
  }

  // Map database row to PaymentRecord type
  private static mapDatabaseToPayment(data: any): PaymentRecord {
    return {
      id: data.id,
      rentalId: data.rental_id,
      paymentType: data.payment_type,
      amount: Number(data.amount),
      paymentMethod: data.payment_method,
      paymentDate: data.payment_date,
      dueDate: data.due_date,
      status: data.status,
      transactionId: data.transaction_id,
      receiptUrl: data.receipt_url,
      notes: data.notes,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Map PaymentRecord type to database format
  private static mapPaymentToDatabase(payment: Partial<PaymentRecord>): any {
    const mapped: any = {};
    
    if (payment.rentalId !== undefined) mapped.rental_id = payment.rentalId;
    if (payment.paymentType !== undefined) mapped.payment_type = payment.paymentType;
    if (payment.amount !== undefined) mapped.amount = payment.amount;
    if (payment.paymentMethod !== undefined) mapped.payment_method = payment.paymentMethod;
    if (payment.paymentDate !== undefined) mapped.payment_date = payment.paymentDate;
    if (payment.dueDate !== undefined) mapped.due_date = payment.dueDate;
    if (payment.status !== undefined) mapped.status = payment.status;
    if (payment.transactionId !== undefined) mapped.transaction_id = payment.transactionId;
    if (payment.receiptUrl !== undefined) mapped.receipt_url = payment.receiptUrl;
    if (payment.notes !== undefined) mapped.notes = payment.notes;
    if (payment.createdBy !== undefined) mapped.created_by = payment.createdBy;

    return mapped;
  }
}