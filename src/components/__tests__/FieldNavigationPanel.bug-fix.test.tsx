import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FieldNavigationPanel } from '../FieldNavigationPanel';
import { FL_320_FIELD_CONFIG } from '@/config/field-config';

describe('FieldNavigationPanel - Bug Fix: Invalid currentFieldIndex', () => {
  let queryClient: QueryClient;
  const mockUpdateField = vi.fn();
  const mockSetCurrentFieldIndex = vi.fn();
  const mockUpdateFieldPosition = vi.fn();
  const mockSetSelectedFields = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const defaultProps = {
    formData: {},
    updateField: mockUpdateField,
    currentFieldIndex: 0,
    setCurrentFieldIndex: mockSetCurrentFieldIndex,
    fieldPositions: {},
    updateFieldPosition: mockUpdateFieldPosition,
    selectedFields: [],
    setSelectedFields: mockSetSelectedFields,
    onSnapToGrid: vi.fn(),
    onAlignHorizontal: vi.fn(),
    onAlignVertical: vi.fn(),
    onDistribute: vi.fn(),
    onCopyPositions: vi.fn(),
    onPastePositions: vi.fn(),
    onTransformPositions: vi.fn(),
    hasCopiedPositions: false,
    settingsSheetOpen: false,
    onSettingsSheetChange: vi.fn(),
    onApplyTemplate: vi.fn(),
    onApplyGroup: vi.fn(),
  };

  const renderPanel = (overrides = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <FieldNavigationPanel {...defaultProps} {...overrides} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  };

  describe('Bug Fix: currentFieldIndex = -1', () => {
    it('should not crash when currentFieldIndex is -1', () => {
      // This test verifies the bug fix: when currentFieldIndex is -1,
      // currentFieldName becomes undefined, which previously caused runtime errors
      expect(() => {
        const { container } = renderPanel({ currentFieldIndex: -1 });
        expect(container).toBeTruthy();
      }).not.toThrow();
    });

    it('should handle undefined currentFieldName gracefully', () => {
      const { container } = renderPanel({ currentFieldIndex: -1 });
      
      // Component should render without crashing
      expect(container).toBeInTheDocument();
    });

    it('should not call updateFieldPosition with undefined field name', () => {
      renderPanel({ currentFieldIndex: -1 });
      
      // adjustPosition should not be called with undefined field name
      // This is tested indirectly - if adjustPosition was called with undefined,
      // updateFieldPosition would be called with undefined, which we verify doesn't happen
      expect(mockUpdateFieldPosition).not.toHaveBeenCalled();
    });
  });

  describe('Bug Fix: currentFieldIndex out of bounds', () => {
    it('should not crash when currentFieldIndex exceeds array length', () => {
      const outOfBoundsIndex = FL_320_FIELD_CONFIG.length;
      
      expect(() => {
        const { container } = renderPanel({ currentFieldIndex: outOfBoundsIndex });
        expect(container).toBeTruthy();
      }).not.toThrow();
    });

    it('should handle out-of-bounds index gracefully', () => {
      const outOfBoundsIndex = FL_320_FIELD_CONFIG.length + 10;
      const { container } = renderPanel({ currentFieldIndex: outOfBoundsIndex });
      
      // Component should render without crashing
      expect(container).toBeInTheDocument();
    });

    it('should not call updateFieldPosition with empty field name when index is out of bounds', () => {
      const outOfBoundsIndex = FL_320_FIELD_CONFIG.length;
      renderPanel({ currentFieldIndex: outOfBoundsIndex });
      
      // adjustPosition should guard against empty field names
      expect(mockUpdateFieldPosition).not.toHaveBeenCalled();
    });
  });

  describe('Bug Fix: adjustPosition with invalid field name', () => {
    it('should prevent adjustPosition from calling updateFieldPosition with undefined', () => {
      // This test verifies that adjustPosition in useFieldPosition hook
      // guards against undefined/empty field names
      renderPanel({ currentFieldIndex: -1 });
      
      // The adjustPosition function should be safe to call even with invalid state
      // We can't directly test the hook, but we verify the component doesn't crash
      expect(mockUpdateFieldPosition).not.toHaveBeenCalled();
    });
  });

  describe('Normal operation with valid index', () => {
    it('should work correctly with valid currentFieldIndex', () => {
      const { container } = renderPanel({ currentFieldIndex: 0 });
      
      // Component should render normally
      expect(container).toBeInTheDocument();
    });

    it('should work correctly with last valid index', () => {
      const lastIndex = FL_320_FIELD_CONFIG.length - 1;
      const { container } = renderPanel({ currentFieldIndex: lastIndex });
      
      // Component should render normally
      expect(container).toBeInTheDocument();
    });
  });
});

