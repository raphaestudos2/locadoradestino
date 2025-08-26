import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Bell,
  Info,
  Edit,
  Check,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface CompanySettings {
  id: string;
  name: string;
  cnpj: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    full: string;
  };
  phone: {
    main: string;
    secondary: string;
  };
  email: {
    main: string;
    reservations: string;
    support: string;
  };
  businessHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  social: {
    instagram: string;
    facebook: string;
    website: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    reminderDays: number;
  };
}

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  id: '1',
  name: 'Locadora Destino',
  cnpj: '12.345.678/0001-90',
  address: {
    street: 'Rua das Palmeiras, 123',
    neighborhood: 'Centro',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '20040-020',
    full: 'Rua das Palmeiras, 123 - Centro, Rio de Janeiro - RJ, CEP: 20040-020'
  },
  phone: {
    main: '(21) 3456-7890',
    secondary: '(21) 99950-4512'
  },
  email: {
    main: 'contato@locadoradestino.com.br',
    reservations: 'reservas@locadoradestino.com.br',
    support: 'suporte@locadoradestino.com.br'
  },
  businessHours: {
    weekdays: 'Segunda a Sexta: 8h às 18h',
    saturday: 'Sábado: 8h às 16h',
    sunday: 'Domingo: 8h às 12h'
  },
  social: {
    instagram: '@locadoradestino',
    facebook: 'Locadora Destino',
    website: 'www.locadoradestino.com.br'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    reminderDays: 1
  }
};

export const SettingsManagement: React.FC = () => {
  const { user, adminData } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<any>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          ...DEFAULT_COMPANY_SETTINGS,
          ...parsed,
          address: { ...DEFAULT_COMPANY_SETTINGS.address, ...parsed.address },
          phone: { ...DEFAULT_COMPANY_SETTINGS.phone, ...parsed.phone },
          email: { ...DEFAULT_COMPANY_SETTINGS.email, ...parsed.email },
          businessHours: { ...DEFAULT_COMPANY_SETTINGS.businessHours, ...parsed.businessHours },
          social: { ...DEFAULT_COMPANY_SETTINGS.social, ...parsed.social },
          notifications: { ...DEFAULT_COMPANY_SETTINGS.notifications, ...parsed.notifications }
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings(DEFAULT_COMPANY_SETTINGS);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('companySettings', JSON.stringify(settings));
      setHasChanges(false);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (field: string, currentValue: any) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
  };

  const saveField = (field: string) => {
    const fieldParts = field.split('.');
    if (fieldParts.length === 1) {
      setSettings(prev => ({ ...prev, [field]: tempValue }));
    } else if (fieldParts.length === 2) {
      setSettings(prev => ({
        ...prev,
        [fieldParts[0]]: {
          ...prev[fieldParts[0] as keyof CompanySettings] as any,
          [fieldParts[1]]: tempValue
        }
      }));
    }
    setHasChanges(true);
    setEditingField(null);
    setTempValue('');
  };

  const toggleNotification = (field: 'emailNotifications' | 'smsNotifications') => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: !prev.notifications[field]
      }
    }));
    setHasChanges(true);
  };

  const updateReminderDays = (days: number) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        reminderDays: days
      }
    }));
    setHasChanges(true);
  };

  const renderEditableField = (
    label: string,
    field: string,
    value: string,
    type: 'text' | 'email' | 'tel' | 'url' = 'text',
    placeholder?: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {editingField === field ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type={type}
            className="flex-1 px-3 py-2 border border-yellow-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => saveField(field)}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={cancelEditing}
              className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-sm text-gray-900 break-all">{value}</span>
          <button
            onClick={() => startEditing(field, value)}
            className="text-yellow-600 hover:text-yellow-800 p-1 rounded transition-colors flex-shrink-0 ml-2"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-black">Configurações da Empresa</h1>
          <p className="text-gray-600 text-sm lg:text-base">Gerencie as informações da sua locadora</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-black px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors text-sm lg:text-base"
          >
            {saving ? (
              <div className="w-4 h-4 lg:w-5 lg:h-5 bg-black rounded opacity-50"></div>
            ) : (
              <Save className="h-4 w-4 lg:h-5 lg:w-5" />
            )}
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        )}
      </div>

      {/* User Info Card */}
      {user && (
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
          <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Usuário Logado
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
              <p className="text-xs lg:text-sm text-gray-600">Nome</p>
              <p className="font-semibold text-black text-sm lg:text-base">
                {adminData?.name || user.email?.split('@')[0] || 'Usuário'}
              </p>
            </div>
            <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
              <p className="text-xs lg:text-sm text-gray-600">Email</p>
              <p className="font-semibold text-black text-sm lg:text-base break-all">{user.email}</p>
            </div>
            <div className="bg-gray-50 p-3 lg:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
              <p className="text-xs lg:text-sm text-gray-600">Função</p>
              <p className="font-semibold text-black text-sm lg:text-base">
                {adminData?.role === 'admin' ? 'Administrador' : 
                 adminData?.role === 'manager' ? 'Gerente' : 'Vendedor'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
        <h2 className="text-lg lg:text-xl font-semibold text-black mb-4 lg:mb-6 flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Informações da Empresa
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {renderEditableField('Nome da Empresa', 'name', settings.name)}
          {renderEditableField('CNPJ', 'cnpj', settings.cnpj)}
          {renderEditableField('Rua/Endereço', 'address.street', settings.address.street)}
          {renderEditableField('Bairro', 'address.neighborhood', settings.address.neighborhood)}
          {renderEditableField('Cidade', 'address.city', settings.address.city)}
          {renderEditableField('Estado', 'address.state', settings.address.state)}
          {renderEditableField('CEP', 'address.zipCode', settings.address.zipCode)}
          {renderEditableField('Website', 'social.website', settings.social.website, 'url', 'www.exemplo.com.br')}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
        <h2 className="text-lg lg:text-xl font-semibold text-black mb-4 lg:mb-6 flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Informações de Contato
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {renderEditableField('Telefone Principal', 'phone.main', settings.phone.main, 'tel', '(00) 0000-0000')}
          {renderEditableField('Telefone Secundário', 'phone.secondary', settings.phone.secondary, 'tel', '(00) 00000-0000')}
          {renderEditableField('Email Principal', 'email.main', settings.email.main, 'email', 'contato@empresa.com.br')}
          {renderEditableField('Email de Reservas', 'email.reservations', settings.email.reservations, 'email', 'reservas@empresa.com.br')}
          {renderEditableField('Email de Suporte', 'email.support', settings.email.support, 'email', 'suporte@empresa.com.br')}
          {renderEditableField('Instagram', 'social.instagram', settings.social.instagram, 'text', '@empresa')}
          {renderEditableField('Facebook', 'social.facebook', settings.social.facebook, 'text', 'Nome da Página')}
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
        <h2 className="text-lg lg:text-xl font-semibold text-black mb-4 lg:mb-6 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Horário de Funcionamento
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {renderEditableField('Segunda a Sexta', 'businessHours.weekdays', settings.businessHours.weekdays, 'text', 'Segunda a Sexta: 8h às 18h')}
          {renderEditableField('Sábado', 'businessHours.saturday', settings.businessHours.saturday, 'text', 'Sábado: 8h às 16h')}
          {renderEditableField('Domingo', 'businessHours.sunday', settings.businessHours.sunday, 'text', 'Domingo: 8h às 12h')}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
        <h2 className="text-lg lg:text-xl font-semibold text-black mb-4 lg:mb-6 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Configurações de Notificação
        </h2>
        <div className="space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex-1">
              <label className="text-sm lg:text-base font-medium text-gray-700">
                Notificações por Email
              </label>
              <p className="text-xs lg:text-sm text-gray-500">
                Receber notificações sobre locações e pagamentos por email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.emailNotifications}
                onChange={() => toggleNotification('emailNotifications')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex-1">
              <label className="text-sm lg:text-base font-medium text-gray-700">
                Notificações por SMS
              </label>
              <p className="text-xs lg:text-sm text-gray-500">
                Receber notificações importantes por SMS
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.smsNotifications}
                onChange={() => toggleNotification('smsNotifications')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>

          <div className="max-w-xs">
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
              Lembrete de Devolução (dias antes)
            </label>
            <input
              type="number"
              min="0"
              max="7"
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm lg:text-base"
              value={settings.notifications.reminderDays}
              onChange={(e) => updateReminderDays(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-yellow-200">
        <h2 className="text-lg lg:text-xl font-semibold text-black mb-4 lg:mb-6 flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Informações do Sistema
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
            <p className="text-xs lg:text-sm text-gray-600">Versão</p>
            <p className="font-semibold text-black text-sm lg:text-base">1.0.0</p>
          </div>
          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
            <p className="text-xs lg:text-sm text-gray-600">Última Atualização</p>
            <p className="font-semibold text-black text-sm lg:text-base">19/01/2025</p>
          </div>
          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
            <p className="text-xs lg:text-sm text-gray-600">Banco de Dados</p>
            <p className="font-semibold text-black text-sm lg:text-base">
              {import.meta.env.VITE_SUPABASE_URL ? 'Supabase' : 'Local Storage'}
            </p>
          </div>
          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
            <p className="text-xs lg:text-sm text-gray-600">Status</p>
            <p className="font-semibold text-green-600 text-sm lg:text-base">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};