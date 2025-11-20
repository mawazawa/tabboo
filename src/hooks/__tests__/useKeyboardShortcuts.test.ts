import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, formatShortcut } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let mockAction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAction = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const fireKeyEvent = (key: string, modifiers: Partial<KeyboardEvent> = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      bubbles: true,
      ...modifiers,
    });
    window.dispatchEvent(event);
  };

  describe('modifier key matching', () => {
    it('should trigger shortcut when key matches without modifiers', () => {
      renderHook(() => useKeyboardShortcuts([
        { key: 'e', action: mockAction, description: 'Toggle edit' }
      ]));

      fireKeyEvent('e');
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should NOT trigger simple shortcut when Ctrl is pressed', () => {
      renderHook(() => useKeyboardShortcuts([
        { key: 'e', action: mockAction, description: 'Toggle edit' }
      ]));

      fireKeyEvent('e', { ctrlKey: true });
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should NOT trigger simple shortcut when Shift is pressed', () => {
      renderHook(() => useKeyboardShortcuts([
        { key: 'e', action: mockAction, description: 'Toggle edit' }
      ]));

      fireKeyEvent('e', { shiftKey: true });
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should NOT trigger simple shortcut when Alt is pressed', () => {
      renderHook(() => useKeyboardShortcuts([
        { key: 'e', action: mockAction, description: 'Toggle edit' }
      ]));

      fireKeyEvent('e', { altKey: true });
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should NOT trigger simple shortcut when Meta/Cmd is pressed', () => {
      renderHook(() => useKeyboardShortcuts([
        { key: 'e', action: mockAction, description: 'Toggle edit' }
      ]));

      fireKeyEvent('e', { metaKey: true });
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should trigger Ctrl+S shortcut only with Ctrl modifier', () => {
      renderHook(() => useKeyboardShortcuts([
        { key: 's', ctrlKey: true, action: mockAction, description: 'Save' }
      ]));

      // Should not trigger without Ctrl
      fireKeyEvent('s');
      expect(mockAction).not.toHaveBeenCalled();

      // Should trigger with Ctrl
      fireKeyEvent('s', { ctrlKey: true });
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should require exact modifier combination', () => {
      renderHook(() => useKeyboardShortcuts([
        { key: 's', ctrlKey: true, shiftKey: true, action: mockAction, description: 'Save as' }
      ]));

      // Ctrl+S alone should not trigger
      fireKeyEvent('s', { ctrlKey: true });
      expect(mockAction).not.toHaveBeenCalled();

      // Ctrl+Shift+S should trigger
      fireKeyEvent('s', { ctrlKey: true, shiftKey: true });
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('enabled state', () => {
    it('should not trigger shortcuts when disabled', () => {
      renderHook(() => useKeyboardShortcuts([
        { key: 'e', action: mockAction, description: 'Toggle edit' }
      ], false));

      fireKeyEvent('e');
      expect(mockAction).not.toHaveBeenCalled();
    });
  });
});

describe('formatShortcut', () => {
  it('should format simple key', () => {
    expect(formatShortcut({ key: 'e', action: vi.fn(), description: '' })).toBe('E');
  });

  it('should format Ctrl shortcut', () => {
    expect(formatShortcut({ key: 's', ctrlKey: true, action: vi.fn(), description: '' })).toBe('Ctrl+S');
  });

  it('should format complex shortcut', () => {
    expect(formatShortcut({ 
      key: 's', 
      ctrlKey: true, 
      shiftKey: true, 
      action: vi.fn(), 
      description: '' 
    })).toBe('Ctrl+Shift+S');
  });
});
