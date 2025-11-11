/**
 * Field Positioning Presets
 * Algorithms for quick field alignment and distribution
 */

interface FieldPosition {
  top: number;
  left: number;
  width?: string;
  height?: string;
}

/**
 * Snap position to grid
 */
export const snapToGrid = (
  position: FieldPosition,
  gridSize: number = 5
): FieldPosition => {
  return {
    ...position,
    top: Math.round(position.top / gridSize) * gridSize,
    left: Math.round(position.left / gridSize) * gridSize,
  };
};

/**
 * Align fields horizontally
 */
export const alignHorizontal = (
  fields: Record<string, FieldPosition>,
  fieldNames: string[],
  alignment: 'left' | 'center' | 'right'
): Record<string, FieldPosition> => {
  if (fieldNames.length === 0) return fields;
  
  const positions = fieldNames.map(name => fields[name]).filter(Boolean);
  if (positions.length === 0) return fields;
  
  let targetLeft: number;
  
  switch (alignment) {
    case 'left':
      targetLeft = Math.min(...positions.map(p => p.left));
      break;
    case 'right':
      targetLeft = Math.max(...positions.map(p => {
        const width = parseFloat(p.width || '0');
        return p.left + width;
      }));
      break;
    case 'center':
      const leftMost = Math.min(...positions.map(p => p.left));
      const rightMost = Math.max(...positions.map(p => {
        const width = parseFloat(p.width || '0');
        return p.left + width;
      }));
      targetLeft = (leftMost + rightMost) / 2;
      break;
  }
  
  const updated = { ...fields };
  fieldNames.forEach(name => {
    if (updated[name]) {
      if (alignment === 'center') {
        const width = parseFloat(updated[name].width || '0');
        updated[name] = { ...updated[name], left: targetLeft - width / 2 };
      } else {
        updated[name] = { ...updated[name], left: targetLeft };
      }
    }
  });
  
  return updated;
};

/**
 * Align fields vertically
 */
export const alignVertical = (
  fields: Record<string, FieldPosition>,
  fieldNames: string[],
  alignment: 'top' | 'middle' | 'bottom'
): Record<string, FieldPosition> => {
  if (fieldNames.length === 0) return fields;
  
  const positions = fieldNames.map(name => fields[name]).filter(Boolean);
  if (positions.length === 0) return fields;
  
  let targetTop: number;
  
  switch (alignment) {
    case 'top':
      targetTop = Math.min(...positions.map(p => p.top));
      break;
    case 'bottom':
      targetTop = Math.max(...positions.map(p => {
        const height = parseFloat(p.height || '0');
        return p.top + height;
      }));
      break;
    case 'middle':
      const topMost = Math.min(...positions.map(p => p.top));
      const bottomMost = Math.max(...positions.map(p => {
        const height = parseFloat(p.height || '0');
        return p.top + height;
      }));
      targetTop = (topMost + bottomMost) / 2;
      break;
  }
  
  const updated = { ...fields };
  fieldNames.forEach(name => {
    if (updated[name]) {
      if (alignment === 'middle') {
        const height = parseFloat(updated[name].height || '0');
        updated[name] = { ...updated[name], top: targetTop - height / 2 };
      } else {
        updated[name] = { ...updated[name], top: targetTop };
      }
    }
  });
  
  return updated;
};

/**
 * Distribute fields evenly
 */
export const distributeEvenly = (
  fields: Record<string, FieldPosition>,
  fieldNames: string[],
  direction: 'horizontal' | 'vertical'
): Record<string, FieldPosition> => {
  if (fieldNames.length < 3) return fields;
  
  const positions = fieldNames
    .map(name => ({ name, position: fields[name] }))
    .filter(item => item.position);
  
  if (positions.length < 3) return fields;
  
  if (direction === 'horizontal') {
    // Sort by left position
    positions.sort((a, b) => a.position.left - b.position.left);
    
    const first = positions[0].position.left;
    const last = positions[positions.length - 1].position.left;
    const spacing = (last - first) / (positions.length - 1);
    
    const updated = { ...fields };
    positions.forEach((item, index) => {
      updated[item.name] = {
        ...item.position,
        left: first + spacing * index,
      };
    });
    
    return updated;
  } else {
    // Sort by top position
    positions.sort((a, b) => a.position.top - b.position.top);
    
    const first = positions[0].position.top;
    const last = positions[positions.length - 1].position.top;
    const spacing = (last - first) / (positions.length - 1);
    
    const updated = { ...fields };
    positions.forEach((item, index) => {
      updated[item.name] = {
        ...item.position,
        top: first + spacing * index,
      };
    });
    
    return updated;
  }
};

/**
 * Apply multiple snap to grid operations
 */
export const snapAllToGrid = (
  fields: Record<string, FieldPosition>,
  fieldNames: string[],
  gridSize: number = 5
): Record<string, FieldPosition> => {
  const updated = { ...fields };
  fieldNames.forEach(name => {
    if (updated[name]) {
      updated[name] = snapToGrid(updated[name], gridSize);
    }
  });
  return updated;
};
