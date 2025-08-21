import React, { useState } from 'react';
import { Settings, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { setupAuthentication, SetupResult } from '../../utils/setupAuth';

export const SetupButton: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SetupResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSetup = async () => {
    setIsRunning(true);
    setResult(null);
    setShowResult(false);
    
    try {
      const setupResult = await setupAuthentication();
      setResult(setupResult);
      setShowResult(true);
      
      // Auto-hide success message after 5 seconds
      if (setupResult.success) {
        setTimeout(() => {
          setShowResult(false);
        }, 5000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro inesperado: ' + (error as Error).message
      });
      setShowResult(true);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleSetup}
        disabled={isRunning}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isRunning
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isRunning ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Settings className="h-4 w-4" />
        )}
        <span>
          {isRunning ? 'Configurando...' : 'Configurar Usuários Admin'}
        </span>
      </button>

      {showResult && result && (
        <div className={`p-4 rounded-lg border flex items-start space-x-3 ${
          result.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.message}
            </p>
            {result.details && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Usuários processados: {result.details.results?.length || 0}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowResult(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};