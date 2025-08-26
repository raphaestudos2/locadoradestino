import React, { useState } from 'react';
import { X, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase, createAdminUsers } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingUsers, setIsCreatingUsers] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        // If invalid credentials, try to create admin users first
        if (authError.message.includes('Invalid login credentials')) {
          console.log('Invalid credentials detected, attempting to create admin users...');
          
          // Check if Supabase is properly configured before attempting user creation
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
          
          if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey ||
              supabaseUrl === 'your_supabase_url_here' || 
              supabaseAnonKey === 'your_supabase_anon_key_here' ||
              supabaseServiceKey === 'your_supabase_service_role_key_here') {
            throw new Error('Supabase não está configurado. Configure as variáveis de ambiente no arquivo .env primeiro.');
          }
          
          setIsCreatingUsers(true);
          
          try {
            const results = await createAdminUsers();
            console.log('Admin users creation results:', results);
            
            // Try login again after creating users
            const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (retryAuthError) {
              throw new Error('Credenciais inválidas. Verifique email e senha.');
            }
            
            if (!retryAuthData.user) {
              throw new Error('Falha na autenticação após criação de usuários');
            }
            
            // Check admin status for retry
            const { data: retryAdminData, error: retryAdminError } = await supabase
              .from('admin_users')
              .select('*')
              .eq('user_id', retryAuthData.user.id)
              .single();

            if (retryAdminError || !retryAdminData) {
              await supabase.auth.signOut();
              throw new Error('Usuário criado mas não é administrador.');
            }

            // Success after retry
            onLoginSuccess({
              ...retryAuthData.user,
              adminData: retryAdminData
            });
            
            setEmail('');
            setPassword('');
            onClose();
            return;
            
          } catch (createError) {
            console.error('Error creating admin users:', createError);
            throw new Error(createError.message || 'Erro ao configurar usuários administrativos.');
          } finally {
            setIsCreatingUsers(false);
          }
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Falha na autenticação');
      }

      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        await supabase.auth.signOut();
        throw new Error('Erro ao verificar permissões de administrador: ' + adminError.message);
      }

      if (!adminData) {
        // User is not an admin
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Apenas administradores podem acessar este painel.');
      }

      // Success - user is authenticated and is an admin
      onLoginSuccess({
        ...authData.user,
        adminData
      });
      
      // Reset form
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
      setIsCreatingUsers(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Login Administrativo</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <User className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-gray-600">
              Acesse o painel de gestão da Locadora Destino
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <User className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isCreatingUsers || !email || !password}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                loading || isCreatingUsers || !email || !password
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-black hover:shadow-lg transform hover:scale-[1.02]'
              }`}
            >
              {loading || isCreatingUsers ? (
                <>
                  <div className="w-5 h-5 bg-gray-400 rounded opacity-50"></div>
                  <span>{isCreatingUsers ? 'Configurando usuários...' : 'Entrando...'}</span>
                </>
              ) : (
                <>
                  <User className="h-5 w-5" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};