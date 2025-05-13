'use client';

import { useToast } from '@/contexts/ToastContext';
import IconRenderer from './IconRender';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function ToastContainer() {
  const { toasts = [], removeToast } = useToast();
  
  const getToastColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'FaCheck';
      case 'error':
        return 'FaTimes';
      case 'warning':
        return 'FaExclamationTriangle';
      default:
        return 'FaInfo';
    }
  };

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${getToastColor(toast.type)} text-white px-4 py-2 rounded-lg shadow-lg
            flex items-center gap-2 mb-2 animate-slide-up
          `}
        >
          <IconRenderer icon={getToastIcon(toast.type)} className="w-4 h-4" />
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 hover:opacity-80"
          >
            <IconRenderer icon="FaTimes" className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 