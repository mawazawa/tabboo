import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WelcomeTour, resetWelcomeTour } from '../WelcomeTour';

const STORAGE_KEY = 'swiftfill-tour-completed';

describe('WelcomeTour', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    localStorage.clear();
  });

  describe('Initial Render', () => {
    it('should show tour when localStorage is empty', async () => {
      render(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.getByText('Welcome to SwiftFill')).toBeInTheDocument();
    });

    it('should not show tour when already completed', async () => {
      localStorage.setItem(STORAGE_KEY, 'true');
      render(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.queryByText('Welcome to SwiftFill')).not.toBeInTheDocument();
    });

    it('should show progress bar and step counter', async () => {
      render(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
      const progressBar = document.querySelector('.bg-gradient-to-r');
      expect(progressBar).toBeInTheDocument();
      const dots = document.querySelectorAll('.rounded-full.w-2, .rounded-full.w-6');
      expect(dots.length).toBe(6);
    });
  });

  describe('Pointer Events Layering', () => {
    it('should have correct pointer-events on all layers', async () => {
      render(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // Layer 1: Parent should have pointer-events-none
      const parentContainer = document.querySelector('.fixed.inset-0.z-50');
      expect(parentContainer).toHaveClass('pointer-events-none');

      // Layer 2: SVG should have pointer-events-auto
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('pointer-events-auto');

      // Layer 4: Card wrapper should have pointer-events-auto
      const wrapper = document.querySelector('.pointer-events-auto.flex');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Tab Key Navigation', () => {
    it('should advance to next step on Tab press', async () => {
      render(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Welcome to SwiftFill')).toBeInTheDocument();

      await act(async () => {
        fireEvent.keyDown(window, { key: 'Tab' });
      });

      expect(screen.getByText('Tab is Your Best Friend')).toBeInTheDocument();
      expect(screen.getByText(/Tab presses: 1/)).toBeInTheDocument();
    });

    it('should complete tour after all steps', async () => {
      render(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // 6 Tab presses to complete
      for (let i = 0; i < 6; i++) {
        await act(async () => {
          fireEvent.keyDown(window, { key: 'Tab' });
        });
      }

      expect(screen.queryByText('Welcome to SwiftFill')).not.toBeInTheDocument();
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });
  });

  describe('Escape Key', () => {
    it('should close tour and mark as completed', async () => {
      render(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Welcome to SwiftFill')).toBeInTheDocument();

      await act(async () => {
        fireEvent.keyDown(window, { key: 'Escape' });
      });

      expect(screen.queryByText('Welcome to SwiftFill')).not.toBeInTheDocument();
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });
  });

  describe('Skip Button', () => {
    it('should close tour when clicked', async () => {
      render(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      const skipButton = screen.getByText('Press Esc to skip');
      expect(skipButton).toHaveClass('hover:text-foreground');
      expect(skipButton).toHaveClass('transition-colors');

      await act(async () => {
        fireEvent.click(skipButton);
      });

      expect(screen.queryByText('Welcome to SwiftFill')).not.toBeInTheDocument();
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });
  });

  describe('resetWelcomeTour', () => {
    it('should clear the localStorage key', () => {
      localStorage.setItem(STORAGE_KEY, 'true');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
      resetWelcomeTour();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('Tour Content', () => {
    it('should navigate through all 6 steps', async () => {
      render(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      const expectedTitles = [
        'Welcome to SwiftFill',
        'Tab is Your Best Friend',
        'The Control Toolbar',
        'Navigate Form Fields',
        'Your Personal Data Vault',
        "You're All Set!"
      ];

      for (let i = 0; i < expectedTitles.length; i++) {
        expect(screen.getByText(expectedTitles[i])).toBeInTheDocument();
        if (i < expectedTitles.length - 1) {
          await act(async () => {
            fireEvent.keyDown(window, { key: 'Tab' });
          });
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid Tab presses without crashing', async () => {
      render(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      for (let i = 0; i < 10; i++) {
        await act(async () => {
          fireEvent.keyDown(window, { key: 'Tab' });
        });
      }

      expect(screen.queryByText('Welcome to SwiftFill')).not.toBeInTheDocument();
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    it('should ignore non-Tab/Escape keys', async () => {
      render(<WelcomeTour />);
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      await act(async () => {
        fireEvent.keyDown(window, { key: 'Enter' });
        fireEvent.keyDown(window, { key: 'Space' });
        fireEvent.keyDown(window, { key: 'ArrowDown' });
      });

      // Should still be on step 1
      expect(screen.getByText('Welcome to SwiftFill')).toBeInTheDocument();
    });
  });
});
