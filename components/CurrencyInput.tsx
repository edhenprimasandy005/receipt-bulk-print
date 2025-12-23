'use client';

import { forwardRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  currency?: string;
  locale?: string;
}

/**
 * Currency Input Component with IDR formatting
 * Formats the input as currency while typing and stores the numeric value
 */
const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, currency = 'IDR', locale = 'id-ID', className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    // Format number to currency string
    const formatCurrency = (num: number | undefined | null): string => {
      if (num === undefined || num === null || isNaN(num) || num === 0) {
        return '';
      }
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
    };

    // Parse currency string to number
    const parseCurrency = (str: string): number => {
      // Remove all non-digit characters
      const digits = str.replace(/\D/g, '');
      return digits ? parseFloat(digits) : 0;
    };

    // Update display value when value prop changes
    useEffect(() => {
      if (value !== undefined && value !== null) {
        setDisplayValue(formatCurrency(value));
      } else {
        setDisplayValue('');
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Allow empty input
      if (inputValue === '') {
        setDisplayValue('');
        onChange?.(0);
        return;
      }

      // Parse the input to get numeric value
      const numericValue = parseCurrency(inputValue);
      
      // Format for display
      const formatted = formatCurrency(numericValue);
      setDisplayValue(formatted);
      
      // Call onChange with numeric value
      onChange?.(numericValue);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Re-format on blur to ensure consistent formatting
      const numericValue = parseCurrency(displayValue);
      setDisplayValue(formatCurrency(numericValue));
      onChange?.(numericValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select all text on focus for easy editing
      e.target.select();
    };

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={cn('pr-8', className)}
          placeholder={props.placeholder || '0'}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          {currency}
        </span>
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
