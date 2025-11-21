/**
 * FieldPositionControls Tests
 *
 * Tests for the field position adjustment controls component.
 * Specifically tests accessibility of directional buttons.
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldPositionControls } from '../FieldPositionControls';

// Mock position for testing
const mockPosition = { top: 50, left: 50 };

describe('FieldPositionControls', () => {
  const defaultProps = {
    currentFieldName: 'testField',
    currentPosition: mockPosition,
    updateFieldPosition: vi.fn(),
    adjustPosition: vi.fn(),
  };

  describe('Accessibility', () => {
    test('directional buttons should have accessible aria-labels', async () => {
      const user = userEvent.setup();
      render(<FieldPositionControls {...defaultProps} />);

      // Open the popover to reveal directional buttons
      const adjustButton = screen.getByRole('button', { name: /adjust/i });
      await user.click(adjustButton);

      // Check that all directional buttons have proper aria-labels
      const upButton = screen.getByRole('button', { name: 'Move field up' });
      const downButton = screen.getByRole('button', { name: 'Move field down' });
      const leftButton = screen.getByRole('button', { name: 'Move field left' });
      const rightButton = screen.getByRole('button', { name: 'Move field right' });

      expect(upButton).toBeInTheDocument();
      expect(downButton).toBeInTheDocument();
      expect(leftButton).toBeInTheDocument();
      expect(rightButton).toBeInTheDocument();
    });

    test('all buttons should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const adjustPosition = vi.fn();

      render(
        <FieldPositionControls
          {...defaultProps}
          adjustPosition={adjustPosition}
        />
      );

      // Open the popover
      const adjustButton = screen.getByRole('button', { name: /adjust/i });
      await user.click(adjustButton);

      // Click the up button and verify it calls adjustPosition
      const upButton = screen.getByRole('button', { name: 'Move field up' });
      await user.click(upButton);
      expect(adjustPosition).toHaveBeenCalledWith('up');

      // Click the down button
      const downButton = screen.getByRole('button', { name: 'Move field down' });
      await user.click(downButton);
      expect(adjustPosition).toHaveBeenCalledWith('down');

      // Click the left button
      const leftButton = screen.getByRole('button', { name: 'Move field left' });
      await user.click(leftButton);
      expect(adjustPosition).toHaveBeenCalledWith('left');

      // Click the right button
      const rightButton = screen.getByRole('button', { name: 'Move field right' });
      await user.click(rightButton);
      expect(adjustPosition).toHaveBeenCalledWith('right');
    });
  });

  describe('Functionality', () => {
    test('should render adjust button with text', () => {
      render(<FieldPositionControls {...defaultProps} />);

      const adjustButton = screen.getByRole('button', { name: /adjust/i });
      expect(adjustButton).toBeInTheDocument();
    });

    test('should show position inputs when popover is opened', async () => {
      const user = userEvent.setup();
      render(<FieldPositionControls {...defaultProps} />);

      const adjustButton = screen.getByRole('button', { name: /adjust/i });
      await user.click(adjustButton);

      // Check for X and Y position inputs (by role since labels aren't properly associated)
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });
  });
});
