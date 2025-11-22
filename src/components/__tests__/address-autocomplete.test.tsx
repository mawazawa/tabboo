/**
 * Unit tests for AddressAutocomplete Component
 *
 * Tests rendering, user interactions, accessibility, and privacy features
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressAutocomplete } from '../AddressAutocomplete';

// Mock the Google Maps service
vi.mock('@/lib/googleMapsService', () => ({
  getAutocompletePredictions: vi.fn(),
  getPlaceDetails: vi.fn(),
  validateAddress: vi.fn(),
  isPoBox: vi.fn(),
  isSafeAtHomeAddress: vi.fn(),
}));

import {
  getAutocompletePredictions,
  getPlaceDetails,
  validateAddress,
  isPoBox,
  isSafeAtHomeAddress,
} from '@/lib/google-maps-service';

// ============================================================================
// Test Setup
// ============================================================================

describe('AddressAutocomplete', () => {
  const mockOnChange = vi.fn();
  const mockOnAddressSelect = vi.fn();
  const mockOnValidation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Default mock implementations
    (isPoBox as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (isSafeAtHomeAddress as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (getAutocompletePredictions as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================================================
  // Basic Rendering Tests
  // ============================================================================

  describe('rendering', () => {
    it('should render with default props', () => {
      render(
        <AddressAutocomplete
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Start typing an address...')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(
        <AddressAutocomplete
          value=""
          onChange={mockOnChange}
          label="Home Address"
        />
      );

      expect(screen.getByLabelText('Home Address')).toBeInTheDocument();
    });

    it('should render with required indicator', () => {
      render(
        <AddressAutocomplete
          value=""
          onChange={mockOnChange}
          label="Address"
          required
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render custom placeholder', () => {
      render(
        <AddressAutocomplete
          value=""
          onChange={mockOnChange}
          placeholder="Enter your address"
        />
      );

      expect(screen.getByPlaceholderText('Enter your address')).toBeInTheDocument();
    });

    it('should display error message', () => {
      render(
        <AddressAutocomplete
          value=""
          onChange={mockOnChange}
          error="Address is required"
        />
      );

      expect(screen.getByText('Address is required')).toBeInTheDocument();
    });

    it('should render disabled state', () => {
      render(
        <AddressAutocomplete
          value=""
          onChange={mockOnChange}
          disabled
        />
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  // ============================================================================
  // Input Handling Tests
  // ============================================================================

  describe('input handling', () => {
    it('should call onChange when typing', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <AddressAutocomplete
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, '123');

      expect(mockOnChange).toHaveBeenCalledWith('1');
      expect(mockOnChange).toHaveBeenCalledWith('2');
      expect(mockOnChange).toHaveBeenCalledWith('3');
    });

    it('should display current value', () => {
      render(
        <AddressAutocomplete
          value="123 Main Street"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('123 Main Street')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Autocomplete Tests
  // ============================================================================

  describe('autocomplete behavior', () => {
    it('should not fetch predictions for short input', async () => {
      render(
        <AddressAutocomplete
          value="12"
          onChange={mockOnChange}
          minChars={3}
        />
      );

      vi.advanceTimersByTime(400);

      expect(getAutocompletePredictions).not.toHaveBeenCalled();
    });

    it('should fetch predictions after debounce', async () => {
      const mockPredictions = [
        {
          placeId: 'place1',
          mainText: '123 Main Street',
          secondaryText: 'Los Angeles, CA',
          description: '123 Main Street, Los Angeles, CA',
        },
      ];

      (getAutocompletePredictions as ReturnType<typeof vi.fn>).mockResolvedValue(mockPredictions);

      render(
        <AddressAutocomplete
          value="123 Main"
          onChange={mockOnChange}
          debounceMs={300}
        />
      );

      // Wait for debounce
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(getAutocompletePredictions).toHaveBeenCalledWith('123 Main');
      });
    });

    it('should display predictions dropdown', async () => {
      const mockPredictions = [
        {
          placeId: 'place1',
          mainText: '123 Main Street',
          secondaryText: 'Los Angeles, CA',
          description: '123 Main Street, Los Angeles, CA',
        },
        {
          placeId: 'place2',
          mainText: '456 Main Avenue',
          secondaryText: 'San Diego, CA',
          description: '456 Main Avenue, San Diego, CA',
        },
      ];

      (getAutocompletePredictions as ReturnType<typeof vi.fn>).mockResolvedValue(mockPredictions);

      render(
        <AddressAutocomplete
          value="Main"
          onChange={mockOnChange}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('123 Main Street')).toBeInTheDocument();
        expect(screen.getByText('456 Main Avenue')).toBeInTheDocument();
      });
    });

    it('should handle prediction selection', async () => {
      const mockPredictions = [
        {
          placeId: 'place1',
          mainText: '123 Main Street',
          secondaryText: 'Los Angeles, CA',
          description: '123 Main Street, Los Angeles, CA',
        },
      ];

      const mockAddressResult = {
        formattedAddress: '123 Main Street, Los Angeles, CA 90001',
        streetNumber: '123',
        route: 'Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        county: 'Los Angeles',
        country: 'US',
        placeId: 'place1',
        coordinates: { lat: 34.05, lng: -118.24 },
      };

      const mockValidation = {
        isValid: true,
        suggestions: [],
        standardizedAddress: mockAddressResult,
      };

      (getAutocompletePredictions as ReturnType<typeof vi.fn>).mockResolvedValue(mockPredictions);
      (getPlaceDetails as ReturnType<typeof vi.fn>).mockResolvedValue(mockAddressResult);
      (validateAddress as ReturnType<typeof vi.fn>).mockResolvedValue(mockValidation);

      render(
        <AddressAutocomplete
          value="Main"
          onChange={mockOnChange}
          onAddressSelect={mockOnAddressSelect}
          onValidation={mockOnValidation}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('123 Main Street')).toBeInTheDocument();
      });

      // Click on prediction
      fireEvent.click(screen.getByText('123 Main Street'));

      await waitFor(() => {
        expect(getPlaceDetails).toHaveBeenCalledWith('place1');
        expect(validateAddress).toHaveBeenCalled();
        expect(mockOnChange).toHaveBeenCalledWith('123 Main Street, Los Angeles, CA 90001');
        expect(mockOnAddressSelect).toHaveBeenCalledWith(mockAddressResult);
        expect(mockOnValidation).toHaveBeenCalledWith(mockValidation);
      });
    });
  });

  // ============================================================================
  // Keyboard Navigation Tests
  // ============================================================================

  describe('keyboard navigation', () => {
    it('should navigate predictions with arrow keys', async () => {
      const mockPredictions = [
        {
          placeId: 'place1',
          mainText: 'First Address',
          secondaryText: 'City 1',
          description: 'First Address, City 1',
        },
        {
          placeId: 'place2',
          mainText: 'Second Address',
          secondaryText: 'City 2',
          description: 'Second Address, City 2',
        },
      ];

      (getAutocompletePredictions as ReturnType<typeof vi.fn>).mockResolvedValue(mockPredictions);

      render(
        <AddressAutocomplete
          value="Address"
          onChange={mockOnChange}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('First Address')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox');

      // Navigate down
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // First item should be selected
      const firstOption = screen.getByText('First Address').closest('[role="option"]');
      expect(firstOption).toHaveAttribute('aria-selected', 'true');

      // Navigate down again
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // Second item should be selected
      const secondOption = screen.getByText('Second Address').closest('[role="option"]');
      expect(secondOption).toHaveAttribute('aria-selected', 'true');

      // Navigate up
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(firstOption).toHaveAttribute('aria-selected', 'true');
    });

    it('should close dropdown on Escape', async () => {
      const mockPredictions = [
        {
          placeId: 'place1',
          mainText: 'Test Address',
          secondaryText: 'Test City',
          description: 'Test Address, Test City',
        },
      ];

      (getAutocompletePredictions as ReturnType<typeof vi.fn>).mockResolvedValue(mockPredictions);

      render(
        <AddressAutocomplete
          value="Test"
          onChange={mockOnChange}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Test Address')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const mockPredictions = [
        {
          placeId: 'place1',
          mainText: 'Test Address',
          secondaryText: 'Test City',
          description: 'Test Address, Test City',
        },
      ];

      (getAutocompletePredictions as ReturnType<typeof vi.fn>).mockResolvedValue(mockPredictions);

      render(
        <AddressAutocomplete
          value="Test"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      expect(input).toHaveAttribute('aria-expanded', 'false');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(input).toHaveAttribute('aria-controls');
      });
    });

    it('should have unique IDs for multiple instances', () => {
      render(
        <>
          <AddressAutocomplete
            value=""
            onChange={mockOnChange}
            label="Address 1"
          />
          <AddressAutocomplete
            value=""
            onChange={mockOnChange}
            label="Address 2"
          />
        </>
      );

      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0].id).not.toBe(inputs[1].id);
    });
  });

  // ============================================================================
  // Privacy Feature Tests
  // ============================================================================

  describe('privacy features', () => {
    it('should show PO Box warning when enabled', () => {
      (isPoBox as ReturnType<typeof vi.fn>).mockReturnValue(true);

      render(
        <AddressAutocomplete
          value="PO Box 123"
          onChange={mockOnChange}
          showPoBoxWarning
        />
      );

      expect(screen.getByText('PO Box Detected')).toBeInTheDocument();
    });

    it('should not show PO Box warning for Safe at Home addresses', () => {
      (isPoBox as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (isSafeAtHomeAddress as ReturnType<typeof vi.fn>).mockReturnValue(true);

      render(
        <AddressAutocomplete
          value="PO Box 903387, Sacramento, CA 94203"
          onChange={mockOnChange}
          showPoBoxWarning
        />
      );

      expect(screen.queryByText('PO Box Detected')).not.toBeInTheDocument();
      expect(screen.getByText('Safe at Home Address Recognized')).toBeInTheDocument();
    });

    it('should show confidential address toggle when enabled', () => {
      render(
        <AddressAutocomplete
          value=""
          onChange={mockOnChange}
          allowConfidential
        />
      );

      expect(screen.getByText('Use Confidential Address (Safe at Home Program)')).toBeInTheDocument();
    });

    it('should toggle confidential address mode', () => {
      render(
        <AddressAutocomplete
          value=""
          onChange={mockOnChange}
          allowConfidential
        />
      );

      const toggleButton = screen.getByText('Use Confidential Address (Safe at Home Program)');
      fireEvent.click(toggleButton);

      expect(mockOnChange).toHaveBeenCalledWith('Address Confidential (Safe at Home Program)');
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  // ============================================================================
  // Loading and Validation States Tests
  // ============================================================================

  describe('loading and validation states', () => {
    it('should show loading indicator while fetching predictions', async () => {
      (getAutocompletePredictions as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 1000))
      );

      render(
        <AddressAutocomplete
          value="123 Main"
          onChange={mockOnChange}
        />
      );

      vi.advanceTimersByTime(300);

      // Should show loading state
      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      (getAutocompletePredictions as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error')
      );

      render(
        <AddressAutocomplete
          value="123 Main"
          onChange={mockOnChange}
        />
      );

      vi.advanceTimersByTime(300);

      // Should not crash and dropdown should not appear
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Edge Cases Tests
  // ============================================================================

  describe('edge cases', () => {
    it('should handle empty predictions array', async () => {
      (getAutocompletePredictions as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      render(
        <AddressAutocomplete
          value="NonexistentAddress12345"
          onChange={mockOnChange}
        />
      );

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should cleanup debounce timer on unmount', () => {
      const { unmount } = render(
        <AddressAutocomplete
          value="123"
          onChange={mockOnChange}
        />
      );

      unmount();

      // Should not throw error when timer fires after unmount
      vi.advanceTimersByTime(500);
    });

    it('should handle rapid value changes', async () => {
      const { rerender } = render(
        <AddressAutocomplete
          value="1"
          onChange={mockOnChange}
        />
      );

      // Rapidly change values
      rerender(<AddressAutocomplete value="12" onChange={mockOnChange} />);
      vi.advanceTimersByTime(100);
      rerender(<AddressAutocomplete value="123" onChange={mockOnChange} />);
      vi.advanceTimersByTime(100);
      rerender(<AddressAutocomplete value="1234" onChange={mockOnChange} />);
      vi.advanceTimersByTime(300);

      // Only the last value should trigger a fetch
      expect(getAutocompletePredictions).toHaveBeenCalledTimes(1);
      expect(getAutocompletePredictions).toHaveBeenCalledWith('1234');
    });
  });
});
