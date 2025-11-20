import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { FieldConfig } from "@/types/FormData";

export const useVaultCopy = (
  personalInfo: any,
  updateField: (field: string, value: string | boolean) => void
) => {
  const { toast } = useToast();

  const copyFromVault = useCallback((config: FieldConfig) => {
    if (!config.vaultField || !personalInfo) return;
    const vaultValue = personalInfo[config.vaultField as keyof typeof personalInfo];
    if (vaultValue) {
      updateField(config.field, vaultValue);
      toast({ title: "Copied from vault", description: `${config.label} filled with saved data` });
    }
  }, [personalInfo, updateField, toast]);

  return { copyFromVault };
};

