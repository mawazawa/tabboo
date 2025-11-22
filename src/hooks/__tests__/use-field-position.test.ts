import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFieldPosition } from '../use-field-position';

describe('useFieldPosition', () => {
  const mockUpdateFieldPosition = vi.fn();
  const initialPositions = {
    field1: { top: 10, left: 10 },
  };

  it('should initialize with correct position', () => {
    const { result } = renderHook(() =>
      useFieldPosition('field1', initialPositions, mockUpdateFieldPosition)
    );

    expect(result.current.currentPosition).toEqual({ top: 10, left: 10 });
  });

  it('should move up by default step (1.0)', () => {
    const { result } = renderHook(() =>
      useFieldPosition('field1', initialPositions, mockUpdateFieldPosition)
    );

    act(() => {
      result.current.adjustPosition('up');
    });

    expect(mockUpdateFieldPosition).toHaveBeenCalledWith('field1', { top: 9, left: 10 });
  });

  it('should move down by default step (1.0)', () => {
    const { result } = renderHook(() =>
      useFieldPosition('field1', initialPositions, mockUpdateFieldPosition)
    );

    act(() => {
      result.current.adjustPosition('down');
    });

    expect(mockUpdateFieldPosition).toHaveBeenCalledWith('field1', { top: 11, left: 10 });
  });

  it('should move left by default step (1.0)', () => {
    const { result } = renderHook(() =>
      useFieldPosition('field1', initialPositions, mockUpdateFieldPosition)
    );

    act(() => {
      result.current.adjustPosition('left');
    });

    expect(mockUpdateFieldPosition).toHaveBeenCalledWith('field1', { top: 10, left: 9 });
  });

  it('should move right by default step (1.0)', () => {
    const { result } = renderHook(() =>
      useFieldPosition('field1', initialPositions, mockUpdateFieldPosition)
    );

    act(() => {
      result.current.adjustPosition('right');
    });

    expect(mockUpdateFieldPosition).toHaveBeenCalledWith('field1', { top: 10, left: 11 });
  });

  it('should use custom step size when provided', () => {
    const { result } = renderHook(() =>
      useFieldPosition('field1', initialPositions, mockUpdateFieldPosition)
    );

    act(() => {
      result.current.adjustPosition('down', undefined, 0.1);
    });

    expect(mockUpdateFieldPosition).toHaveBeenCalledWith('field1', { top: 10.1, left: 10 });
  });

  it('should handle target field override', () => {
    const { result } = renderHook(() =>
      useFieldPosition('field1', initialPositions, mockUpdateFieldPosition)
    );

    act(() => {
      result.current.adjustPosition('right', 'field1');
    });

    expect(mockUpdateFieldPosition).toHaveBeenCalledWith('field1', { top: 10, left: 11 });
  });
});

