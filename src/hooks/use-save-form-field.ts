import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DrawnRect } from '@/hooks/use-field-drawing';

interface SaveFieldParams {
  formNumber: string;
  name: string;
  type: string;
  rect: DrawnRect & { page: number };
}

export function useSaveFormField() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formNumber, name, type, rect }: SaveFieldParams) => {
      const { data, error } = await supabase.rpc('upsert_form_field', {
        p_form_number: formNumber,
        p_field_name: name,
        p_page_number: rect.page,
        p_position_top: rect.top,
        p_position_left: rect.left,
        p_field_width: rect.width,
        p_field_height: rect.height,
        p_field_type: type,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refresh the UI immediately
      queryClient.invalidateQueries({ queryKey: ['formFields', variables.formNumber] });
      
      // Note: We don't toast here because FormViewer handles the toast logic 
      // (or we can move it here, but FormViewer has the specific "Auto-Pilot" context)
    },
    onError: (error) => {
      console.error('Failed to save field:', error);
      toast({
        title: "Error Saving Field",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

