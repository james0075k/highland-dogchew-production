// src/components/atoms/alert.tsx
import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

interface AlertProps {
  show: boolean;
  type: 'confirm' | 'success' | 'error' | 'warning';
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const Alert: React.FC<AlertProps> = ({ show, type, message, onConfirm, onCancel }) => {
  if (!show) return null;

  const icons = {
    confirm: <FiInfo className="w-7 h-7 text-blue-500" />,
    success: <FiCheckCircle className="w-7 h-7 text-green-500" />,
    error: <FiAlertTriangle className="w-7 h-7 text-red-500" />,
    warning: <FiAlertTriangle className="w-7 h-7 text-yellow-500" />,
  };

  const borderColors = {
    confirm: 'border-blue-400',
    success: 'border-green-400',
    error: 'border-red-400',
    warning: 'border-yellow-400',
  };
  const bgGradients = {
    confirm: 'bg-gradient-to-br from-blue-50 to-white',
    success: 'bg-gradient-to-br from-green-50 to-white',
    error: 'bg-gradient-to-br from-red-50 to-white',
    warning: 'bg-gradient-to-br from-yellow-50 to-white',
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border-l-8 ${borderColors[type]} ${bgGradients[type]} animate-fadeIn`}
        style={{ animation: 'fadeInScale 0.25s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <div className="flex flex-col gap-4 p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center rounded-full bg-white shadow w-12 h-12">
                {icons[type]}
              </span>
              <h3 className="text-2xl font-extrabold text-gray-900 capitalize tracking-tight">
                {type === 'confirm' ? 'Confirmation' : type === 'warning' ? 'Warning' : type}
              </h3>
            </div>
            <button
              onClick={onCancel || onConfirm}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              aria-label="Close alert"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-700 text-base pl-16 leading-relaxed">{message}</p>
          <div className={`flex gap-3 pt-4 ${onCancel ? 'justify-end' : 'justify-center'}`}>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-5 py-2 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`px-5 py-2 rounded-xl font-semibold text-white shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                ${type === 'confirm' ? 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400' :
                  type === 'success' ? 'bg-green-500 hover:bg-green-600 focus:ring-green-400' :
                  type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400' :
                  'bg-red-500 hover:bg-red-600 focus:ring-red-400'}
              `}
            >
              {type === 'confirm' ? 'Confirm' : 'OK'}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Alert;