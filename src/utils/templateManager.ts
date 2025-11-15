/**
 * Template Management System
 * Handles import/export of field position templates for crowdsourcing form mappings
 */

import { createStorage } from './storageManager';

export interface FieldTemplate {
  top: number;
  left: number;
  width?: string;
  height?: string;
}

export interface FormTemplate {
  formId: string;
  formName: string;
  version: string;
  createdAt: string;
  author?: string;
  fields: Record<string, FieldTemplate>;
}

const STORAGE_KEY = 'form_templates';
const templatesStorage = createStorage<Record<string, FormTemplate>>(STORAGE_KEY);

/**
 * Save template to local storage
 */
export const saveTemplate = (template: FormTemplate): void => {
  const templates = getStoredTemplates();
  templates[template.formId] = template;
  const success = templatesStorage.set(templates);
  if (!success) {
    throw new Error('Failed to save template');
  }
};

/**
 * Get all stored templates
 */
export const getStoredTemplates = (): Record<string, FormTemplate> => {
  return templatesStorage.get({ defaultValue: {} }) || {};
};

/**
 * Get specific template by ID
 */
export const getTemplate = (formId: string): FormTemplate | null => {
  const templates = getStoredTemplates();
  return templates[formId] || null;
};

/**
 * Delete template
 */
export const deleteTemplate = (formId: string): void => {
  const templates = getStoredTemplates();
  delete templates[formId];
  templatesStorage.set(templates);
};

/**
 * Export template as downloadable JSON file
 */
export const exportTemplate = (template: FormTemplate): void => {
  const blob = new Blob([JSON.stringify(template, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${template.formId}-template.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import template from JSON file
 */
export const importTemplate = (file: File): Promise<FormTemplate> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const template = JSON.parse(event.target?.result as string);
        
        if (!validateTemplate(template)) {
          reject(new Error('Invalid template format'));
          return;
        }
        
        resolve(template);
      } catch (error) {
        reject(new Error('Failed to parse template file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Validate template structure
 */
export const validateTemplate = (template: any): template is FormTemplate => {
  if (!template || typeof template !== 'object') return false;
  
  const required = ['formId', 'formName', 'version', 'createdAt', 'fields'];
  for (const key of required) {
    if (!(key in template)) return false;
  }
  
  if (typeof template.fields !== 'object') return false;
  
  // Validate each field has required properties
  for (const field of Object.values(template.fields)) {
    if (typeof field !== 'object') return false;
    const f = field as any;
    if (typeof f.top !== 'number' || typeof f.left !== 'number') return false;
  }
  
  return true;
};

/**
 * Create template from current field positions
 */
export const createTemplateFromPositions = (
  formId: string,
  formName: string,
  fieldPositions: Record<string, FieldTemplate>,
  author?: string
): FormTemplate => {
  return {
    formId,
    formName,
    version: '1.0',
    createdAt: new Date().toISOString(),
    author,
    fields: fieldPositions,
  };
};
