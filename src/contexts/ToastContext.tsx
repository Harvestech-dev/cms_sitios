'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import IconRenderer from '@/components/common/IconRenderer';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    if (toast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gray-800',
          icon: 'FaCheckCircle',
          iconColor: 'text-green-400'
        };
      case 'error':
        return {
          bg: 'bg-gray-800',
          icon: 'FaExclamationCircle',
          iconColor: 'text-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-gray-800',
          icon: 'FaExclamationTriangle',
          iconColor: 'text-yellow-400'
        };
      default:
        return {
          bg: 'bg-gray-800',
          icon: 'FaInfoCircle',
          iconColor: 'text-blue-400'
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-6 z-50">
        <AnimatePresence>
          {toasts.map(toast => {
            const styles = getToastStyles(toast.type);
            
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={`
                  ${styles.bg} mb-2 p-4 rounded-lg shadow-lg
                  border border-gray-700 min-w-[300px] max-w-[400px]
                  flex items-center gap-3
                `}
                onClick={() => removeToast(toast.id)}
              >
                <IconRenderer 
                  icon={styles.icon} 
                  className={`w-5 h-5 ${styles.iconColor}`} 
                />
                <p className="text-gray-200 flex-1">{toast.message}</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <IconRenderer icon="FaTimes" className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
} 