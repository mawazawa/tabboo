import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import type { KeyboardShortcut } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register keyboard shortcuts on mount', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        ctrlKey: true,
        action: vi.fn(),
        description: 'Save',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should cleanup event listener on unmount', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        ctrlKey: true,
        action: vi.fn(),
        description: 'Save',
      },
    ];

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should trigger action when matching shortcut is pressed', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        ctrlKey: true,
        action,
        description: 'Save',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not trigger shortcuts when typing in input fields by default', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'a',
        action,
        description: 'Some action',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Create an input element and focus it
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      bubbles: true,
    });

    act(() => {
      input.dispatchEvent(event);
    });

    expect(action).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(input);
  });

  /**
   * BUG TEST: This test should FAIL before the fix and PASS after
   *
   * Bug: macOS users cannot save with Cmd+S while focused in input fields
   * because the code only checks for ctrlKey (Windows/Linux), not metaKey (macOS)
   */
  it('should allow Cmd+S (macOS) save shortcut even when focused in input fields', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        metaKey: true, // Cmd key on macOS
        action,
        description: 'Save',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Create an input element and focus it (simulating user typing in a form field)
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Simulate Cmd+S on macOS
    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true, // This is the Cmd key on macOS
      ctrlKey: false, // Not Ctrl
      bubbles: true,
    });

    // Spy on preventDefault to ensure it's called
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    act(() => {
      input.dispatchEvent(event);
    });

    // BUG: This assertion will FAIL before the fix because the code only checks ctrlKey
    // After fix: Should allow Cmd+S even in input fields (macOS convention)
    expect(action).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(input);
  });

  it('should allow Ctrl+S (Windows/Linux) save shortcut even when focused in input fields', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        ctrlKey: true,
        action,
        description: 'Save',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Create an input element and focus it
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Simulate Ctrl+S on Windows/Linux
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    });

    act(() => {
      input.dispatchEvent(event);
    });

    // This should work (and currently does)
    expect(action).toHaveBeenCalledTimes(1);

    // Cleanup
    document.body.removeChild(input);
  });

  it('should not trigger shortcuts when disabled', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        ctrlKey: true,
        action,
        description: 'Save',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts, false)); // disabled

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(action).not.toHaveBeenCalled();
  });

  it('should match shortcuts case-insensitively', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'S', // Uppercase in definition
        ctrlKey: true,
        action,
        description: 'Save',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Press lowercase 's'
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple shortcuts', () => {
    const saveAction = vi.fn();
    const undoAction = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        ctrlKey: true,
        action: saveAction,
        description: 'Save',
      },
      {
        key: 'z',
        ctrlKey: true,
        action: undoAction,
        description: 'Undo',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Press Ctrl+S
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
    });

    // Press Ctrl+Z
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));
    });

    expect(saveAction).toHaveBeenCalledTimes(1);
    expect(undoAction).toHaveBeenCalledTimes(1);
  });

  it('should stop after first matching shortcut', () => {
    const action1 = vi.fn();
    const action2 = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        ctrlKey: true,
        action: action1,
        description: 'Save 1',
      },
      {
        key: 's',
        ctrlKey: true,
        action: action2,
        description: 'Save 2',
      },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
    });

    expect(action1).toHaveBeenCalledTimes(1);
    expect(action2).not.toHaveBeenCalled(); // Should break after first match
  });
});