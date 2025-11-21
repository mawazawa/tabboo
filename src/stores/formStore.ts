/**
 * PDF Form Field Mapper - Global Store
 *
 * Zustand store for managing PDF form field mappings.
 * Provides CRUD operations for field definitions.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Field, FieldPatch } from '@/types/mapper';

interface FormStoreState {
  /** All mapped fields across all pages */
  fields: Field[];

  /** Currently selected field ID */
  selectedFieldId: string | null;

  /** PDF viewer state */
  pdfState: {
    scale: number;
    currentPage: number;
    numPages: number;
  };
}

interface FormStoreActions {
  /** Add a new field to the store */
  addField: (field: Field) => void;

  /** Update an existing field by ID */
  updateField: (id: string, patch: FieldPatch) => void;

  /** Remove a field by ID */
  removeField: (id: string) => void;

  /** Select a field for editing */
  selectField: (id: string | null) => void;

  /** Update PDF viewer state */
  setPdfState: (state: Partial<FormStoreState['pdfState']>) => void;

  /** Get fields for a specific page */
  getFieldsByPage: (page: number) => Field[];

  /** Clear all fields */
  clearFields: () => void;
}

type FormStore = FormStoreState & FormStoreActions;

export const useFormStore = create<FormStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        fields: [],
        selectedFieldId: null,
        pdfState: {
          scale: 1,
          currentPage: 1,
          numPages: 0,
        },

        // Actions
        addField: (field) =>
          set(
            (state) => ({
              fields: [...state.fields, field],
              selectedFieldId: field.id,
            }),
            false,
            'addField'
          ),

        updateField: (id, patch) =>
          set(
            (state) => ({
              fields: state.fields.map((field) =>
                field.id === id ? { ...field, ...patch } : field
              ),
            }),
            false,
            'updateField'
          ),

        removeField: (id) =>
          set(
            (state) => ({
              fields: state.fields.filter((field) => field.id !== id),
              selectedFieldId:
                state.selectedFieldId === id ? null : state.selectedFieldId,
            }),
            false,
            'removeField'
          ),

        selectField: (id) =>
          set({ selectedFieldId: id }, false, 'selectField'),

        setPdfState: (pdfState) =>
          set(
            (state) => ({
              pdfState: { ...state.pdfState, ...pdfState },
            }),
            false,
            'setPdfState'
          ),

        getFieldsByPage: (page) =>
          get().fields.filter((field) => field.page === page),

        clearFields: () =>
          set({ fields: [], selectedFieldId: null }, false, 'clearFields'),
      }),
      {
        name: 'pdf-form-mapper-storage',
        partialize: (state) => ({
          fields: state.fields,
        }),
      }
    ),
    { name: 'FormStore' }
  )
);
