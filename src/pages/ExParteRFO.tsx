/**
 * Ex Parte RFO Page
 * Simplified workflow for filing emergency Request for Order (FL-300)
 */

import { useState, useEffect } from "react";
import { FormViewer } from "@/components/FormViewer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, FileText, Save, Send } from "@/icons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { FL300FormData, FieldPosition } from "@/types/FormData";

export default function ExParteRFO() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FL300FormData>({});
  const [fieldPositions, setFieldPositions] = useState<Record<string, FieldPosition>>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Update field handler
  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update field position handler
  const updateFieldPosition = (field: string, position: FieldPosition) => {
    setFieldPositions(prev => ({
      ...prev,
      [field]: position
    }));
  };

  // Save form data to database
  const saveFormData = async () => {
    if (!userId) {
      toast({
        title: "Not authenticated",
        description: "Please log in to save your form.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('legal_documents')
        .upsert({
          user_id: userId,
          title: 'FL-300 Request for Order (Ex Parte)',
          form_type: 'FL-300',
          content: formData,
          metadata: {
            field_positions: fieldPositions,
            form_type: 'FL-300',
            last_saved: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,form_type'
        });

      if (error) throw error;

      toast({
        title: "Form saved",
        description: "Your FL-300 form has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save form",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Load saved form data
  useEffect(() => {
    const loadFormData = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('legal_documents')
          .select('content, metadata')
          .eq('user_id', userId)
          .eq('form_type', 'FL-300')
          .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error

        if (data) {
          setFormData(data.content as FL300FormData);
          if (data.metadata?.field_positions) {
            setFieldPositions(data.metadata.field_positions);
          }
        }
      } catch (error) {
        console.error('Error loading form:', error);
      }
    };

    loadFormData();
  }, [userId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      saveFormData();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, formData, fieldPositions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Ex Parte Request for Order</h1>
              <p className="text-muted-foreground">
                Emergency request for temporary family law orders (Form FL-300)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={saveFormData}
                disabled={isSaving}
                variant="outline"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Coming soon",
                    description: "E-filing integration is under development.",
                  });
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                File with Court
              </Button>
            </div>
          </div>
        </Card>

        {/* Important Notice */}
        <Card className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Emergency Orders - Important Information
              </h3>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <li>• Ex parte orders are for emergencies only (immediate harm or risk)</li>
                <li>• You must file at least 2 hours before the 11:00 AM hearing time</li>
                <li>• You must attempt to notify the other party (or provide good cause why not)</li>
                <li>• Attach FL-303 (Declaration Regarding Notice) and FL-305 (Proposed Orders)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Form Viewer */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              FL-300 Request for Order
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? "View Mode" : "Edit Positions"}
            </Button>
          </div>

          <FormViewer
            formData={formData}
            updateField={updateField}
            currentFieldIndex={currentFieldIndex}
            setCurrentFieldIndex={setCurrentFieldIndex}
            fieldPositions={fieldPositions}
            updateFieldPosition={updateFieldPosition}
            formType="FL-300"
            zoom={1}
            isEditMode={isEditMode}
          />

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Next Steps
            </h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>Complete all required sections of this form</li>
              <li>Complete FL-303 (Declaration Regarding Notice)</li>
              <li>Complete FL-305 (Proposed Temporary Orders)</li>
              <li>E-file all forms at least 2 hours before hearing</li>
              <li>Attend hearing via CourtCall at 11:00 AM</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}
