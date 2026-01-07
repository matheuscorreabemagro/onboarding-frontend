'use client';

import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  icon?: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  className = '',
}: CheckboxProps) {
  return (
    <label
      className={`
        flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
        ${checked
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          {label && <div className="font-medium text-gray-900">{label}</div>}
        </div>
        {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
      </div>
    </label>
  );
}
