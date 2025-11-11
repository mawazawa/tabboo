/**
 * Field Group Management System
 * Handles saving and applying sets of fields together for repeating patterns
 */

export interface FieldGroupItem {
  fieldName: string;
  relativeTop: number;
  relativeLeft: number;
}

export interface FieldGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  fields: FieldGroupItem[];
}

const STORAGE_KEY = 'field_groups';

/**
 * Calculate relative positions from absolute positions
 */
export const createRelativePositions = (
  selectedFields: string[],
  fieldPositions: Record<string, { top: number; left: number }>
): FieldGroupItem[] => {
  if (selectedFields.length === 0) return [];
  
  // Find the minimum top and left to use as anchor
  let minTop = Infinity;
  let minLeft = Infinity;
  
  selectedFields.forEach(fieldName => {
    const pos = fieldPositions[fieldName];
    if (pos) {
      minTop = Math.min(minTop, pos.top);
      minLeft = Math.min(minLeft, pos.left);
    }
  });
  
  // Create relative positions
  return selectedFields.map(fieldName => {
    const pos = fieldPositions[fieldName];
    return {
      fieldName,
      relativeTop: pos.top - minTop,
      relativeLeft: pos.left - minLeft,
    };
  });
};

/**
 * Apply group to target fields at a specific position
 */
export const applyGroupToFields = (
  group: FieldGroup,
  targetFields: string[],
  anchorTop: number,
  anchorLeft: number
): Record<string, { top: number; left: number }> => {
  const result: Record<string, { top: number; left: number }> = {};
  
  // Match target fields to group fields by index
  group.fields.forEach((groupField, index) => {
    if (index < targetFields.length) {
      const targetFieldName = targetFields[index];
      result[targetFieldName] = {
        top: anchorTop + groupField.relativeTop,
        left: anchorLeft + groupField.relativeLeft,
      };
    }
  });
  
  return result;
};

/**
 * Save group to local storage
 */
export const saveGroup = (group: FieldGroup): void => {
  try {
    const groups = getStoredGroups();
    groups[group.id] = group;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error('Failed to save group:', error);
    throw new Error('Failed to save group');
  }
};

/**
 * Get all stored groups
 */
export const getStoredGroups = (): Record<string, FieldGroup> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load groups:', error);
    return {};
  }
};

/**
 * Get specific group by ID
 */
export const getGroup = (id: string): FieldGroup | null => {
  const groups = getStoredGroups();
  return groups[id] || null;
};

/**
 * Delete group
 */
export const deleteGroup = (id: string): void => {
  const groups = getStoredGroups();
  delete groups[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
};

/**
 * Export group as downloadable JSON file
 */
export const exportGroup = (group: FieldGroup): void => {
  const blob = new Blob([JSON.stringify(group, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${group.id}-field-group.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import group from JSON file
 */
export const importGroup = (file: File): Promise<FieldGroup> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const group = JSON.parse(event.target?.result as string);
        
        if (!validateGroup(group)) {
          reject(new Error('Invalid group format'));
          return;
        }
        
        resolve(group);
      } catch (error) {
        reject(new Error('Failed to parse group file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Validate group structure
 */
export const validateGroup = (group: any): group is FieldGroup => {
  if (!group || typeof group !== 'object') return false;
  
  const required = ['id', 'name', 'createdAt', 'fields'];
  for (const key of required) {
    if (!(key in group)) return false;
  }
  
  if (!Array.isArray(group.fields)) return false;
  
  // Validate each field has required properties
  for (const field of group.fields) {
    if (typeof field !== 'object') return false;
    if (!field.fieldName || typeof field.relativeTop !== 'number' || typeof field.relativeLeft !== 'number') {
      return false;
    }
  }
  
  return true;
};
