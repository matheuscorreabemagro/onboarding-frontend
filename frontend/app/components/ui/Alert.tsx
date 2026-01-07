'use client';

import React from 'react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

/**
 * Componente Alert otimizado com React.memo
 * Evita re-renders desnecessários quando props não mudam
 */
const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✓',
      iconBg: 'bg-green-100',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '✗',
      iconBg: 'bg-red-100',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ',
      iconBg: 'bg-blue-100',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠',
      iconBg: 'bg-yellow-100',
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} ${style.border} ${style.text} animate-in fade-in slide-in-from-top-2 flex items-start gap-3 rounded-lg border p-3 duration-300`}
    >
      <div
        className={`${style.iconBg} flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold`}
      >
        {style.icon}
      </div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${style.text} shrink-0 transition-opacity hover:opacity-70`}
          aria-label="Fechar"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Otimização: Evita re-renders quando props não mudam
export default React.memo(Alert);
