import { ReservationData, Vehicle } from '../types';
import { contacts } from '../config/contacts';
import { getLocationName } from '../config/locations';
import { saveRentalToStorage } from './rentalStorage';

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


export const generateWhatsAppMessage = (
  reservation: Partial<ReservationData>,
  vehicles: Vehicle[]
): string => {
  const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
  
  if (!vehicle) {
    return 'Erro: Veículo não encontrado';
  }

  const totalDays = calculateDays(reservation.pickupDate || '', reservation.returnDate || '');
  const totalAmount = totalDays * vehicle.price;

  const message = `*NOVA RESERVA - LOCADORA DESTINO*

*DADOS DO VEÍCULO:*
• Modelo: ${vehicle.brand} ${vehicle.model}
• Ano: ${vehicle.year || 2023}
• Categoria: ${vehicle.category.toLowerCase()}
• Placa: ${vehicle.plate || 'A definir'}

*PERÍODO DA LOCAÇÃO:*
• Retirada: ${formatDate(reservation.pickupDate || '')}
• Devolução: ${formatDate(reservation.returnDate || '')}
• Total de dias: ${totalDays}
• Local de retirada: ${getLocationName(reservation.pickupLocation || '')}
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