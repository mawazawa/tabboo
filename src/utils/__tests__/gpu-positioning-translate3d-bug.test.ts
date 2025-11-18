/**
 * GPU Positioning - translate3d Percentage Bug Fix Test
 *
 * This test verifies that the fix for translate3d percentage-based positioning is correct.
 *
 * BUG DESCRIPTION:
 * The original code used `translate3d(${leftPercent}%, ${topPercent}%, 0)` for positioning.
 * However, CSS translate percentages are relative to the ELEMENT'S OWN SIZE, not the parent
 * container. This caused all fields to appear in approximately the same location because
 * they were being translated by tiny amounts (e.g., 2% of a 200px field = 4px).
 *
 * THE FIX:
 * Replace: `transform: translate3d(2%, 3.5%, 0) scale(1)`
 * With:    `top: "2%", left: "3.5%", transform: scale(1)` (or "none" if zoom is 1)
 *
 * VERIFICATION:
 * This test ensures the positioning system:
 * 1. Uses top/left CSS properties with percentage values (relative to parent)
 * 2. Uses transform only for zoom scaling
 * 3. Generates correct CSS for various positions and zoom levels
 * 4. Handles edge cases (zoom = 1, zoom = 0, negative positions)
 */

import { describe, test, expect } from 'vitest';
import { getGPUPositionStyle } from '../gpu-positioning';

describe('GPU Positioning - translate3d Percentage Bug Fix', () => {
  /**
   * REGRESSION TEST: Verify position uses top/left, not translate3d
   */
  test('uses top/left CSS properties instead of translate3d for positioning', () => {
    const style = getGPUPositionStyle(10.5, 5.25, 1, false);

    // Should use top/left with percentage strings
    expect(style.top).toBe('10.5%');
    expect(style.left).toBe('5.25%');

    // Should NOT use translate3d for positioning
    // With zoom=1, transform should be 'none' or not include translate
    expect(style.transform).toBe('none');
  });

  /**
   * VERIFICATION TEST: Multiple fields get different positions
   */
  test('different percentage values produce different top/left positions', () => {
    const field1 = getGPUPositionStyle(3.5, 2.0, 1, false);
    const field2 = getGPUPositionStyle(4.5, 42.0, 1, false);
    const field3 = getGPUPositionStyle(6.5, 2.0, 1, false);

    // Each field should have unique position
    expect(field1.top).toBe('3.5%');
    expect(field1.left).toBe('2%');

    expect(field2.top).toBe('4.5%');
    expect(field2.left).toBe('42%');

    expect(field3.top).toBe('6.5%');
    expect(field3.left).toBe('2%');

    // All positions should be different
    expect(field1.top).not.toBe(field2.top);
    expect(field1.left).not.toBe(field2.left);
    expect(field2.top).not.toBe(field3.top);
  });

  /**
   * ZOOM TEST: Transform should only handle zoom, not positioning
   */
  test('transform is used only for zoom scaling', () => {
    // No zoom (zoom = 1)
    const noZoom = getGPUPositionStyle(10, 5, 1, false);
    expect(noZoom.transform).toBe('none');

    // With zoom
    const withZoom = getGPUPositionStyle(10, 5, 1.5, false);
    expect(withZoom.transform).toBe('scale(1.5)');

    // Position should not be in transform (no translate function)
    expect(withZoom.transform).not.toContain('translate');

    // Use different position values to avoid collision with zoom value
    const withDifferentPos = getGPUPositionStyle(23.7, 88.3, 2.0, false);
    expect(withDifferentPos.transform).toBe('scale(2)');
    expect(withDifferentPos.transform).not.toContain('23.7');
    expect(withDifferentPos.transform).not.toContain('88.3');
  });

  /**
   * EDGE CASE TEST: Zero position
   */
  test('handles zero position correctly', () => {
    const style = getGPUPositionStyle(0, 0, 1, false);

    expect(style.top).toBe('0%');
    expect(style.left).toBe('0%');
    expect(style.position).toBe('absolute');
  });

  /**
   * EDGE CASE TEST: Large percentages (bottom-right of page)
   */
  test('handles large percentage values correctly', () => {
    const style = getGPUPositionStyle(95.5, 88.25, 1, false);

    expect(style.top).toBe('95.5%');
    expect(style.left).toBe('88.25%');
  });

  /**
   * EDGE CASE TEST: Small fractional percentages
   */
  test('handles small fractional percentages correctly', () => {
    const style = getGPUPositionStyle(0.123, 0.456, 1, false);

    expect(style.top).toBe('0.123%');
    expect(style.left).toBe('0.456%');
  });

  /**
   * DRAG STATE TEST: will-change is added during dragging
   */
  test('adds will-change during dragging for GPU optimization', () => {
    const notDragging = getGPUPositionStyle(10, 5, 1, false);
    const dragging = getGPUPositionStyle(10, 5, 1, true);

    expect(notDragging.willChange).toBeUndefined();
    expect(dragging.willChange).toBe('transform');
  });

  /**
   * ZOOM EDGE CASE TEST: Zero zoom
   */
  test('handles zero zoom correctly', () => {
    const style = getGPUPositionStyle(10, 5, 0, false);

    expect(style.transform).toBe('scale(0)');
    expect(style.top).toBe('10%');
    expect(style.left).toBe('5%');
  });

  /**
   * COMPARATIVE TEST: Demonstrate the bug vs the fix
   */
  test('buggy vs fixed positioning calculation', () => {
    // Simulate database values for two fields
    const field1Top = 3.5; // 3.5% from top
    const field1Left = 2.0; // 2% from left

    const field2Top = 4.5; // 4.5% from top
    const field2Left = 42.0; // 42% from left

    // BUGGY approach (translate3d with percentages)
    // translate3d(2%, 3.5%, 0) means move by 2% of FIELD width, 3.5% of FIELD height
    // For a 200px wide field: 2% = 4px
    // For a 24px tall field: 3.5% = 0.84px
    // Result: All fields end up near (4px, 0.84px) - essentially the same location!
    const buggyField1Position = '4px, 0.84px'; // Approximate result
    const buggyField2Position = '4px, 0.84px'; // Same as field 1!
    expect(buggyField1Position).toBe(buggyField2Position); // BUG!

    // FIXED approach (top/left with percentages)
    const fixedField1 = getGPUPositionStyle(field1Top, field1Left, 1, false);
    const fixedField2 = getGPUPositionStyle(field2Top, field2Left, 1, false);

    // Now percentages are relative to PARENT (PDF page), not element size
    // Field 1: top: 3.5% of page, left: 2% of page
    // Field 2: top: 4.5% of page, left: 42% of page
    expect(fixedField1.top).toBe('3.5%');
    expect(fixedField1.left).toBe('2%');
    expect(fixedField2.top).toBe('4.5%');
    expect(fixedField2.left).toBe('42%');

    // Fields are now in DIFFERENT locations! ✅
    expect(fixedField1.top).not.toBe(fixedField2.top);
    expect(fixedField1.left).not.toBe(fixedField2.left);
  });

  /**
   * INTEGRATION TEST: Real-world FL-320 form field positions
   */
  test('FL-320 form fields get correct distinct positions', () => {
    // Real database values from FL-320 form
    const fields = [
      { name: 'attorneyOrPartyName', top: 3.50, left: 2.00 },
      { name: 'county', top: 4.50, left: 42.00 },
      { name: 'firmName', top: 6.50, left: 2.00 },
      { name: 'courtStreetAddress', top: 7.50, left: 42.00 },
      { name: 'streetAddress', top: 9.50, left: 2.00 },
    ];

    const positions = fields.map(f => getGPUPositionStyle(f.top, f.left, 1, false));

    // Verify all fields have distinct positions
    const uniquePositions = new Set(positions.map(p => `${p.top},${p.left}`));
    expect(uniquePositions.size).toBe(fields.length); // All positions are unique

    // Verify specific positions are correct
    expect(positions[0].top).toBe('3.5%');
    expect(positions[0].left).toBe('2%');

    expect(positions[1].top).toBe('4.5%');
    expect(positions[1].left).toBe('42%');

    expect(positions[2].top).toBe('6.5%');
    expect(positions[2].left).toBe('2%');
  });

  /**
   * TRANSFORM ORIGIN TEST: Verify transform origin is top-left
   */
  test('uses top-left transform origin for correct zoom behavior', () => {
    const style = getGPUPositionStyle(10, 5, 1.5, false);

    expect(style.transformOrigin).toBe('top left');

    // This ensures zoom scales from the top-left corner, not center
    // Important for maintaining field alignment with PDF form
  });

  /**
   * POSITION ABSOLUTE TEST: Verify position is absolute
   */
  test('uses absolute positioning for proper PDF overlay', () => {
    const style = getGPUPositionStyle(10, 5, 1, false);

    expect(style.position).toBe('absolute');
  });
});

/**
 * TECHNICAL NOTES:
 *
 * Why translate3d percentages don't work for positioning:
 * - CSS translate percentages are relative to the ELEMENT's size, not the parent
 * - For positioning on a page, we need percentages relative to the PARENT (PDF page)
 * - Solution: Use top/left CSS properties, which are parent-relative
 *
 * Performance considerations:
 * - Modern browsers GPU-accelerate position: absolute when will-change: transform is set
 * - Transform: scale() is GPU-composited for zoom
 * - Top/left changes can be GPU-accelerated, especially with will-change hint
 * - Original claim of 3-5x performance gain from translate3d was misleading
 *
 * CSS transform reference:
 * - translate(X%, Y%) - percentages based on element's own size
 * - top: X%, left: Y% - percentages based on parent container's size
 *
 * Example (200px wide field, 800px wide parent):
 * - transform: translate(10%, 0) → moves by 20px (10% of 200px)
 * - left: 10% → positions at 80px (10% of 800px)
 *
 * Impact of this fix:
 * - Fields now position correctly relative to PDF page
 * - Each field appears at its intended location
 * - Form is usable and professional
 * - No more "all fields in same location" bug
 *
 * November 2025 best practices applied:
 * - Use top/left for positioning (parent-relative)
 * - Use transform only for transformations (scale, rotate)
 * - Apply will-change sparingly (only during dragging)
 * - Comprehensive test coverage for positioning logic
 */
