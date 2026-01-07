'use client';

import React from 'react';
import Button from './Button';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  showControls?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function NumberInput({
  value,
  onChange,
  label,
  min = 0,
  max,
  step = 1,
  showControls = false,
  className = '',
  disabled = false,
}: NumberInputProps) {
  const handleDecrement = () => {
    const newValue = value - step;
    if (min !== undefined && newValue < min) return;
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = value + step;
    if (max !== undefined && newValue > max) return;
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      if (min !== undefined && val < min) {
        onChange(min);
      } else if (max !== undefined && val > max) {
        onChange(max);
      } else {
        onChange(val);
      }
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {showControls ? (
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDecrement}
            disabled={disabled || (min !== undefined && value <= min)}
            variant="secondary"
            size="sm"
            className="px-3 py-2"
          >
            −
          </Button>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <Button
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && value >= max)}
            variant="secondary"
            size="sm"
            className="px-3 py-2"
          >
            +
          </Button>
        </div>
      ) : (
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
      )}
    </div>
  );
}
