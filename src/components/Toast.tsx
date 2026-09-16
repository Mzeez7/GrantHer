import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-brand-purple-950 text-white px-4 py-3 rounded-2xl shadow-executive border border-brand-purple-800 animate-in slide-in-from-bottom-5 duration-200">
      <CheckCircle className="w-4 h-4 text-brand-gold-400 shrink-0" />
      <span className="text-xs font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-brand-purple-300 hover:text-white hover:bg-brand-purple-900 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
