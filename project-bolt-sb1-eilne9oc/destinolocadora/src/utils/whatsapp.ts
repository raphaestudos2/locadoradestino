import { ReservationData, Vehicle } from '../types';
import { contacts } from '../config/contacts';
import { CustomerService } from '../services/customerService';
import { RentalService } from '../services/rentalService';
import { PaymentService } from '../services/paymentService';

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const calculateDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get location name by ID - now fetches from database
const getLocationName = async (locationId: string): Promise<string> => {
  try {
    const { getOrderedLocations } = await import('../config/locations');
    const locations = await getOrderedLocations();
    const location = locations.find(l => l.id === locationId);
    return location?.name || locationId;
  } catch (error) {
    console.error('Error getting location name:', error);
    return locationId;
  }
};

export const generateWhatsAppMessage = async (
  reservation: Partial<ReservationData>,
  vehicles: Vehicle[]
): Promise<string> => {
  const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
  
  if (!vehicle) {
    return 'Erro: Veículo não encontrado';
  }

  const totalDays = calculateDays(reservation.pickupDate || '', reservation.returnDate || '');
  const totalAmount = totalDays * vehicle.price;
  const locationName = await getLocationName(reservation.pickupLocation || '');

  const message = `*NOVA RESERVA - LOCADORA DESTINO*

*DADOS DO VEÍCULO:*
• Modelo: ${vehicle.brand} ${vehicle.model}
• Ano: ${vehicle.year || 2023}
• Categoria: ${vehicle.category.toLowerCase()}
• Placa: ${vehicle.licensePlate || 'A definir'}

*PERÍODO DA LOCAÇÃO:*
• Retirada: ${formatDate(reservation.pickupDate || '')}
• Devolução: ${formatDate(reservation.returnDate || '')}
• Total de dias: ${totalDays}
• Local de retirada: ${locationName}
• Local de devolução: Mesmo local

*DADOS DO CLIENTE:*
• Nome: ${reservation.customerName || ''}
• Email: ${reservation.email || ''}
• Telefone: ${reservation.phone || ''}
• CPF: ${reservation.cpf || ''}
• Data de nascimento: ${formatDate(reservation.birthDate || '')}
• CNH: ${reservation.cnh || ''}

*ENDEREÇO:*
• CEP: ${reservation.cep || ''}
• Rua: ${reservation.address || ''}
• Número: ${reservation.addressNumber || ''}
• Complemento: ${reservation.complement || ''}
• Bairro: ${reservation.neighborhood || ''}
• Cidade: ${reservation.city || ''} - ${reservation.state || ''}

*VALOR TOTAL:*
• Diária: R$ ${vehicle.price.toFixed(2).replace('.', ',')}
• Total: R$ ${totalAmount.toFixed(2).replace('.', ',')}

Gostaria de confirmar esta reserva!`;

  return message;
};

export const openWhatsApp = (message: string): void => {
  const encodedMessage = encodeURIComponent(message);
  window.open(`${contacts.whatsapp.url}?text=${encodedMessage}`, '_blank');
};

// Save complete reservation to database
export const saveReservationToDatabase = async (
  reservation: Partial<ReservationData>,
  vehicles: Vehicle[]
): Promise<{ success: boolean; message: string; customerData?: any; rentalData?: any }> => {
  try {
    const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
    if (!vehicle) {
      throw new Error('Veículo não encontrado');
    }

    // Check if customer already exists
    let customer = null;
    if (reservation.email) {
      customer = await CustomerService.findByEmail(reservation.email);
    }
    if (!customer && reservation.cpf) {
      customer = await CustomerService.findByCPF(reservation.cpf);
    }

    // Create or update customer
    const customerData = {
      name: reservation.customerName || '',
      email: reservation.email || '',
      phone: reservation.phone || '',
      cpf: reservation.cpf || '',
      cnh: reservation.cnh || '',
      address: reservation.address ? 
        `${reservation.address}, ${reservation.addressNumber || ''} - ${reservation.neighborhood || ''}, ${reservation.city || ''} - ${reservation.state || ''}`.replace(/^,|,$|, -|,\s*$/, '').trim() : 
        undefined,
      status: 'active' as const
    };

    if (customer) {
      // Update existing customer
      customer = await CustomerService.update(customer.id, customerData);
    } else {
      // Create new customer
      customer = await CustomerService.create(customerData);
    }

    // Calculate rental details
    const totalDays = calculateDays(reservation.pickupDate || '', reservation.returnDate || '');
    const totalAmount = totalDays * vehicle.price;

    // Create rental
    const rentalData = {
      customerId: customer.id,
      vehicleId: vehicle.id,
      pickupDate: reservation.pickupDate || '',
      returnDate: reservation.returnDate || '',
      pickupTime: reservation.pickupTime || '09:00',
      returnTime: reservation.returnTime || '18:00',
      pickupLocation: reservation.pickupLocation || '',
      status: 'pending' as const,
      totalAmount: totalAmount,
      paymentStatus: 'pending' as const,
      notes: 'Reserva via WhatsApp'
    };

    const rental = await RentalService.create(rentalData);

    // Create initial payment record
    const paymentRecord = {
      rentalId: rental.id,
      paymentType: 'locacao' as const,
      amount: totalAmount,
      paymentMethod: 'dinheiro' as const,
      paymentDate: new Date().toISOString(),
      status: 'aprovado' as const,
      notes: `Pagamento da locação #${rental.rental_number || rental.id.slice(-8).toUpperCase()}`
    };

    await PaymentService.create(paymentRecord);

    return {
      success: true,
      message: 'Reserva salva com sucesso no banco de dados!',
      customerData: customer,
      rentalData: rental
    };

  } catch (error) {
    console.error('Error saving reservation to database:', error);
    
    // Fallback to localStorage
    const { saveRentalToStorage } = await import('./rentalStorage');
    saveRentalToStorage(reservation, vehicles);
    
    return {
      success: false,
      message: 'Reserva salva localmente (banco indisponível): ' + (error as Error).message
    };
  }
};