import React from 'react';
import { X, Phone } from 'lucide-react';
import { ReservationData, Vehicle } from '../types';
import { getOrderedLocationsSync, preloadLocations } from '../config/locations';
import { formatCEP, fetchAddressByCEP, isValidCEP } from '../utils/cep';
import { formatCPF, formatPhone, formatCNH } from '../utils/inputHelpers';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Partial<ReservationData>;
  setReservation: (reservation: Partial<ReservationData>) => void;
  vehicles: Vehicle[];
  onSubmit: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  reservation,
  setReservation,
  vehicles,
  onSubmit
}) => {
  const [locations, setLocations] = React.useState<any[]>([]);
  const [loadingCEP, setLoadingCEP] = React.useState(false);
  const [cepError, setCepError] = React.useState<string | null>(null);

  // Load locations when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // Use sync version for immediate render
      setLocations(getOrderedLocationsSync());
      
      // Preload fresh data in background
      preloadLocations().then(() => {
        import('../config/locations').then(({ getOrderedLocations }) => {
          getOrderedLocations().then(freshLocations => {
            setLocations(freshLocations);
          }).catch(console.error);
        });
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleInputChange = (field: keyof ReservationData, value: string) => {
    setReservation({...reservation, [field]: value});
  };

  const handleCEPChange = async (cep: string) => {
    const formattedCEP = formatCEP(cep);
    setReservation(prev => ({...prev, cep: formattedCEP}));
    setCepError(null);

    // Clear address fields when CEP is being edited
    if (formattedCEP.length < 9) {
      setReservation(prev => ({
        ...prev,
        cep: formattedCEP,
        address: '',
        neighborhood: '',
        city: '',
        state: ''
      }));
      return;
    }

    // Fetch address when CEP is complete
    if (isValidCEP(formattedCEP)) {
      setLoadingCEP(true);
      try {
        const addressData = await fetchAddressByCEP(formattedCEP);
        if (addressData) {
          setReservation(prev => ({
            ...prev,
            cep: formattedCEP,
            address: addressData.logradouro,
            neighborhood: addressData.bairro,
            city: addressData.localidade,
            state: addressData.uf
          }));
        } else {
          setCepError('CEP não encontrado');
        }
      } catch (error) {
        setCepError('Erro ao buscar CEP');
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      'dinheiro': 'Dinheiro em Espécie',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'pix': 'PIX',
      'transferencia': 'Transferência',
      'boleto': 'Boleto'
    };
    return methods[method] || method;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Finalizar Reserva</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.customerName || ''}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF *
                    </label>
                    <input
                     type="text"
                     inputMode="numeric"
                     pattern="[0-9]*"
                     inputMode="numeric"
                     pattern="[0-9\.\-]*"
                     maxLength={14}
                      required
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.cpf || ''}
                     onChange={(e) => {
                       const formatted = formatCPF(e.target.value);
                       handleInputChange('cpf', formatted);
                     }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNH *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.cnh || ''}
                     onChange={(e) => {
                       const formatted = formatCNH(e.target.value);
                       handleInputChange('cnh', formatted);
                     }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.birthDate || ''}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <input
                     type="text"
                     inputMode="numeric"
                     pattern="[0-9\s\(\)\-]*"
                      required
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.phone || ''}
                     onChange={(e) => {
                       const formatted = formatPhone(e.target.value);
                       handleInputChange('phone', formatted);
                     }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP (opcional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="00000-000"
                        maxLength={9}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                          cepError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={reservation.cep || ''}
                        onChange={(e) => handleCEPChange(e.target.value)}
                      />
                      {loadingCEP && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 bg-yellow-500 rounded opacity-50"></div>
                        </div>
                      )}
                    </div>
                    {cepError && (
                      <p className="text-red-500 text-xs mt-1">{cepError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Informe o CEP para preenchimento automático do endereço
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rua/Endereço (opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Digite o endereço ou informe o CEP acima"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número (opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.addressNumber || ''}
                      onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                      placeholder="Ex: 123, 456A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complemento (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Apto, Casa, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.complement || ''}
                      onChange={(e) => handleInputChange('complement', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bairro (opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.neighborhood || ''}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      placeholder="Digite o bairro ou informe o CEP acima"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade (opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Digite a cidade ou informe o CEP acima"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado (opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Digite o estado ou informe o CEP acima"
                    />
                  </div>
                </div>
              </div>

              {/* Dados da Locação */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Dados da Locação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Local de Retirada *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.pickupLocation || ''}
                      onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    >
                      <option value="">Selecione o local</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div></div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Retirada *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.pickupDate || ''}
                      onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Devolução *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.returnDate || ''}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário de Retirada *
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.pickupTime || ''}
                      onChange={(e) => {
                        handleInputChange('pickupTime', e.target.value);
                        // Auto-preenche horário de devolução se estiver vazio
                        if (!reservation.returnTime) {
                          handleInputChange('returnTime', e.target.value);
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário de Devolução *
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={reservation.returnTime || ''}
                      onChange={(e) => handleInputChange('returnTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <Phone className="h-5 w-5" />
                <span>Finalizar via WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};