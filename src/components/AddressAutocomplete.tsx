/**
 * AddressAutocomplete Component
 *
 * Purpose: Google Maps-powered address input with autocomplete suggestions
 *
 * Features:
 * - Real-time autocomplete predictions
 * - Address validation on selection
 * - Structured address parsing (street, city, state, ZIP, county)
 * - California Address Confidentiality Program support
 * - PO Box detection and warnings for DV cases
 * - Keyboard navigation (arrow keys, enter)
 * - Session token management for billing optimization
 *
 * @example
 * <AddressAutocomplete
 *   value={formData.address}
 *   onChange={(value) => setFormData({ ...formData, address: value })}
 *   onAddressSelect={(address) => {
 *     setFormData({
 *       ...formData,
 *       streetAddress: `${address.streetNumber} ${address.route}`,
 *       city: address.city,
 *       state: address.state,
 *       zipCode: address.zipCode,
 *       county: address.county,
 *     });
 *   }}
 *   showPoBoxWarning={true}
 * />
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  getAutocompletePredictions,
  getPlaceDetails,
  validateAddress,
  isPoBox,
  isSafeAtHomeAddress,
  type AutocompletePrediction,
  type AddressResult,
  type AddressValidationResult,
} from '@/lib/googleMapsService';
import { MapPin, AlertTriangle, CheckCircle, Loader2, Shield } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface AddressAutocompleteProps {
  /** Current input value */
  value: string;
  /** Called when input value changes */
  onChange: (value: string) => void;
  /** Called when a validated address is selected */
  onAddressSelect?: (address: AddressResult) => void;
  /** Called when validation completes */
  onValidation?: (result: AddressValidationResult) => void;
  /** Input label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Error message to display */
  error?: string;
  /** Whether this is for a protected person (shows PO box warning) */
  showPoBoxWarning?: boolean;
  /** Whether this is a confidential address field */
  isConfidential?: boolean;
  /** Allow "Address Confidential" option */
  allowConfidential?: boolean;
  /** Disable the input */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Additional class names */
  className?: string;
  /** Debounce delay for autocomplete (ms) */
  debounceMs?: number;
  /** Minimum characters before showing suggestions */
  minChars?: number;
}

// ============================================================================
// Component
// ============================================================================

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  onValidation,
  label,
  placeholder = 'Start typing an address...',
  error,
  showPoBoxWarning = false,
  isConfidential = false,
  allowConfidential = false,
  disabled = false,
  required = false,
  className,
  debounceMs = 300,
  minChars = 3,
}: AddressAutocompleteProps) {
  // State
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [validationResult, setValidationResult] = useState<AddressValidationResult | null>(null);
  const [isPoBoxAddress, setIsPoBoxAddress] = useState(false);
  const [isSafeAtHome, setIsSafeAtHome] = useState(false);
  const [isAddressConfidential, setIsAddressConfidential] = useState(isConfidential);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Effects
  // ============================================================================

  // Fetch predictions when value changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (isAddressConfidential || value.length < minChars) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await getAutocompletePredictions(value);
        setPredictions(results);
        setShowDropdown(results.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Autocomplete error:', err);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, debounceMs, minChars, isAddressConfidential]);

  // Check for PO Box and Safe at Home addresses
  useEffect(() => {
    setIsPoBoxAddress(isPoBox(value));
    setIsSafeAtHome(isSafeAtHomeAddress(value));
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setValidationResult(null);
  };

  const handlePredictionSelect = useCallback(
    async (prediction: AutocompletePrediction) => {
      setShowDropdown(false);
      setIsValidating(true);

      try {
        // Get full place details
        const address = await getPlaceDetails(prediction.placeId);

        if (address) {
          // Update input with formatted address
          onChange(address.formattedAddress);

          // Validate the address
          const validation = await validateAddress(address.formattedAddress);
          setValidationResult(validation);
          onValidation?.(validation);

          // Call the onAddressSelect callback
          if (validation.isValid && validation.standardizedAddress) {
            onAddressSelect?.(validation.standardizedAddress);
          } else if (address) {
            onAddressSelect?.(address);
          }
        }
      } catch (err) {
        console.error('Address selection error:', err);
      } finally {
        setIsValidating(false);
      }
    },
    [onChange, onAddressSelect, onValidation]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || predictions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < predictions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          handlePredictionSelect(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleConfidentialToggle = () => {
    setIsAddressConfidential(!isAddressConfidential);
    if (!isAddressConfidential) {
      onChange('Address Confidential (Safe at Home Program)');
      setPredictions([]);
      setShowDropdown(false);
    } else {
      onChange('');
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={cn('relative', className)}>
      {/* Label */}
      {label && (
        <Label htmlFor="address-input" className="mb-2 block">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      {/* Input Container */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
        </div>

        <Input
          ref={inputRef}
          id="address-input"
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          disabled={disabled || isAddressConfidential}
          className={cn(
            'pl-10 pr-10',
            error && 'border-destructive',
            validationResult?.isValid && 'border-green-500'
          )}
          autoComplete="off"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls="address-predictions"
        />

        {/* Status Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading || isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : validationResult?.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : validationResult && !validationResult.isValid ? (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          ) : null}
        </div>
      </div>

      {/* Predictions Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          id="address-predictions"
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg"
        >
          {predictions.map((prediction, index) => (
            <div
              key={prediction.placeId}
              role="option"
              aria-selected={index === selectedIndex}
              className={cn(
                'cursor-pointer px-4 py-3 text-sm transition-colors',
                'hover:bg-accent',
                index === selectedIndex && 'bg-accent',
                index !== predictions.length - 1 && 'border-b'
              )}
              onClick={() => handlePredictionSelect(prediction)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="font-medium">{prediction.mainText}</div>
              <div className="text-xs text-muted-foreground">
                {prediction.secondaryText}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confidential Address Toggle */}
      {allowConfidential && (
        <button
          type="button"
          onClick={handleConfidentialToggle}
          className={cn(
            'mt-2 flex items-center gap-2 text-sm transition-colors',
            isAddressConfidential
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Shield className="h-4 w-4" />
          {isAddressConfidential
            ? 'Using California Safe at Home Address'
            : 'Use Confidential Address (Safe at Home Program)'}
        </button>
      )}

      {/* PO Box Warning */}
      {showPoBoxWarning && isPoBoxAddress && !isSafeAtHome && (
        <div className="mt-2 flex items-start gap-2 rounded-md bg-yellow-50 dark:bg-yellow-950/30 p-3 text-sm text-yellow-800 dark:text-yellow-200">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">PO Box Detected</div>
            <div className="text-xs mt-0.5">
              For your safety, consider using California's Safe at Home program for address confidentiality.
            </div>
          </div>
        </div>
      )}

      {/* Safe at Home Recognition */}
      {isSafeAtHome && (
        <div className="mt-2 flex items-start gap-2 rounded-md bg-green-50 dark:bg-green-950/30 p-3 text-sm text-green-800 dark:text-green-200">
          <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">Safe at Home Address Recognized</div>
            <div className="text-xs mt-0.5">
              Your address will be kept confidential per the California Address Confidentiality Program.
            </div>
          </div>
        </div>
      )}

      {/* Validation Suggestions */}
      {validationResult && validationResult.suggestions.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          {validationResult.suggestions.map((suggestion, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-yellow-500">•</span>
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-destructive">{error}</div>
      )}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default AddressAutocomplete;
