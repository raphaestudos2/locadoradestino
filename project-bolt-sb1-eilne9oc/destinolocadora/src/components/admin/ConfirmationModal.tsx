import React from 'react';
import { X, AlertTriangle, Trash2, UserX, Car } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: 'delete' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  itemName?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  itemName
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="h-12 w-12 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      default:
        return <Car className="h-12 w-12 text-blue-500" />;
    }
  };

  const getButtonColors = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-yellow-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gray-50 p-4 rounded-full border border-yellow-200">
                  {getIcon()}
                </div>
              </div>
              <h2 className="text-xl font-bold text-black text-center mb-2">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-700 leading-relaxed">
              {message}
            </p>
            {itemName && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-semibold text-black">
                  {itemName}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${getButtonColors()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full opacity-20"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full opacity-30"></div>
      </div>
    </div>
  );
};