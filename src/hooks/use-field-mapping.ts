import { useState, useMemo } from 'react';
import manifest from '@/lib/field-manifest.json';
import { FormType } from '@/types/WorkflowTypes';

export interface ManifestField {
  name: string;
  label: string;
  type: string;
}

export function useFieldMapping(formType: FormType) {
  const [isMappingMode, setIsMappingMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fields = useMemo(() => {
    return (manifest as any)[formType] || [];
  }, [formType]);

  const currentField = fields[currentIndex] as ManifestField | undefined;

  const nextField = () => {
    if (currentIndex < fields.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Done
      setIsMappingMode(false);
    }
  };

  const skipField = () => {
    nextField();
  };

  const prevField = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return {
    isMappingMode,
    setIsMappingMode,
    currentField,
    currentIndex,
    totalFields: fields.length,
    nextField,
    skipField,
    prevField
  };
}

