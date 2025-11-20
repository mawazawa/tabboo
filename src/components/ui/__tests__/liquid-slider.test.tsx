import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiquidSlider } from '../liquid-slider';

// Mock GSAP to avoid issues in test environment
vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
  },
}));

vi.mock('gsap/Draggable', () => ({
  Draggable: {
    create: vi.fn(() => [{ kill: vi.fn() }]),
  },
}));

describe('LiquidSlider', () => {
  describe('Division by zero protection', () => {
    it('should not throw or produce NaN when max equals min', () => {
      // This test verifies the fix for the division by zero bug
      // When max === min, (value - min) / (max - min) would produce NaN or Infinity

      const { container } = render(
        <LiquidSlider
          label="Test Slider"
          min={50}
          max={50}
          value={50}
        />
      );

      // Component should render without errors
      expect(container).toBeTruthy();

      // Check that the label is rendered
      expect(screen.getByText('Test Slider')).toBeInTheDocument();

      // Get the slider element and check CSS custom properties
      const sliderElement = container.querySelector('.liquid-slider');
      expect(sliderElement).toBeTruthy();

      // The CSS custom property should be 0, not NaN or Infinity
      const computedComplete = sliderElement?.getAttribute('style');
      expect(computedComplete).not.toContain('NaN');
      expect(computedComplete).not.toContain('Infinity');
    });

    it('should render with debug mode when max equals min', () => {
      // Debug mode also uses the division, so this tests that path too
      render(
        <LiquidSlider
          label="Debug Test"
          min={100}
          max={100}
          value={100}
          debug={true}
        />
      );

      // The percent display should show 0%, not NaN%
      const percentDisplay = screen.getByText(/Percent:/);
      expect(percentDisplay.textContent).toBe('Percent: 0%');

      // The liquid display should also show 0%
      const liquidDisplay = screen.getByText(/Liquid:/);
      expect(liquidDisplay.textContent).toBe('Liquid: 0%');
    });

    it('should calculate correct percentage for normal range', () => {
      render(
        <LiquidSlider
          label="Normal Range"
          min={0}
          max={100}
          value={50}
          debug={true}
        />
      );

      // Should calculate 50%
      const percentDisplay = screen.getByText(/Percent:/);
      expect(percentDisplay.textContent).toBe('Percent: 50%');
    });

    it('should handle zero as min and max', () => {
      const { container } = render(
        <LiquidSlider
          label="Zero Range"
          min={0}
          max={0}
          value={0}
        />
      );

      // Should not crash
      expect(container).toBeTruthy();
      expect(screen.getByText('Zero Range')).toBeInTheDocument();
    });

    it('should handle negative range where max equals min', () => {
      const { container } = render(
        <LiquidSlider
          label="Negative Test"
          min={-10}
          max={-10}
          value={-10}
        />
      );

      // Should not crash
      expect(container).toBeTruthy();
      expect(screen.getByText('Negative Test')).toBeInTheDocument();
    });
  });

  describe('Basic functionality', () => {
    it('should render with default props', () => {
      render(<LiquidSlider label="Default Slider" />);
      expect(screen.getByText('Default Slider')).toBeInTheDocument();
    });

    it('should display value when showValue is true', () => {
      render(
        <LiquidSlider
          label="Value Display"
          value={75}
          showValue={true}
        />
      );

      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should apply disabled state', () => {
      const { container } = render(
        <LiquidSlider
          label="Disabled Slider"
          disabled={true}
        />
      );

      const sliderElement = container.querySelector('.liquid-slider');
      expect(sliderElement).toHaveClass('opacity-50');
      expect(sliderElement).toHaveClass('pointer-events-none');
    });

    it('should render with different variants', () => {
      const { rerender } = render(
        <LiquidSlider label="Progress" variant="progress" value={50} />
      );
      expect(screen.getByText('Progress')).toBeInTheDocument();

      rerender(
        <LiquidSlider label="Confidence" variant="confidence" value={75} />
      );
      expect(screen.getByText('Confidence')).toBeInTheDocument();

      rerender(
        <LiquidSlider label="Upload" variant="upload" value={25} />
      );
      expect(screen.getByText('Upload')).toBeInTheDocument();
    });
  });
});
