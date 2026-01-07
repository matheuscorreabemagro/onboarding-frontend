'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  fullWidth = false,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : ''}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
