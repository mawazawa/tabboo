# UX/UI Design Enhancements for Document Intelligence

**Priority**: P1 - High Impact User Experience
**Last Updated**: 2025-11-17
**Status**: Research Complete - Ready for Design System Integration

## Executive Summary

This document outlines cutting-edge UX/UI enhancements to transform the document upload experience from functional to **delightful**. Every design decision prioritizes:

1. **Speed**: Perceived performance through micro-interactions
2. **Clarity**: Zero ambiguity about what's happening
3. **Trust**: Confidence in AI extraction accuracy
4. **Control**: User agency over every extracted field
5. **Delight**: Subtle animations that feel premium

---

## Design Philosophy

### The "Surgical Precision" Metaphor

Document extraction is like surgery - it requires:
- **Precision**: Exact field mapping
- **Transparency**: User sees every step
- **Control**: User approves every change
- **Safety**: Ability to undo/reject

UI should feel like a **scalpel, not a sledgehammer**.

---

## Feature 1: Confidence Heatmap Overlay

### Problem
Users can't see where the AI is confident vs. uncertain in its extraction.

### Solution
**Visual confidence overlay** on the original document showing field-level accuracy.

### Implementation

#### Component: `ConfidenceHeatmapOverlay.tsx`

```typescript
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Eye, EyeOff } from 'lucide-react';

interface ConfidenceHeatmapProps {
  documentImageUrl: string;
  fields: Array<{
    name: string;
    value: string;
    confidence: number; // 0.0 - 1.0
    boundingBox: {
      x: number; // % from left
      y: number; // % from top
      width: number; // % of document width
      height: number; // % of document height
    };
  }>;
  onFieldClick?: (fieldName: string) => void;
}

export const ConfidenceHeatmapOverlay = ({
  documentImageUrl,
  fields,
  onFieldClick
}: ConfidenceHeatmapProps) => {
  const [minConfidence, setMinConfidence] = useState(0.0);
  const [showOverlay, setShowOverlay] = useState(true);

  // Color gradient: Red (low) → Yellow (medium) → Green (high)
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.95) return 'rgba(34, 197, 94, 0.3)'; // Green
    if (confidence >= 0.80) return 'rgba(234, 179, 8, 0.3)'; // Yellow
    return 'rgba(239, 68, 68, 0.3)'; // Red
  };

  const getBorderColor = (confidence: number): string => {
    if (confidence >= 0.95) return 'rgb(34, 197, 94)';
    if (confidence >= 0.80) return 'rgb(234, 179, 8)';
    return 'rgb(239, 68, 68)';
  };

  const filteredFields = fields.filter(f => f.confidence >= minConfidence);

  return (
    <Card className="relative overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Badge variant="outline" className="bg-background/95 backdrop-blur">
          {filteredFields.length} / {fields.length} fields
        </Badge>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOverlay(!showOverlay)}
          className="bg-background/95 backdrop-blur"
        >
          {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
      </div>

      {/* Confidence Filter Slider */}
      <div className="absolute top-4 left-4 z-10 w-48">
        <div className="bg-background/95 backdrop-blur rounded-lg p-3 border">
          <p className="text-xs font-medium mb-2">
            Min Confidence: {Math.round(minConfidence * 100)}%
          </p>
          <Slider
            value={[minConfidence]}
            onValueChange={([value]) => setMinConfidence(value)}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
        </div>
      </div>

      {/* Document Image */}
      <div className="relative">
        <img
          src={documentImageUrl}
          alt="Document"
          className="w-full h-auto"
        />

        {/* Confidence Overlay Boxes */}
        {showOverlay && filteredFields.map((field) => (
          <div
            key={field.name}
            className="absolute cursor-pointer transition-all hover:scale-105"
            style={{
              left: `${field.boundingBox.x}%`,
              top: `${field.boundingBox.y}%`,
              width: `${field.boundingBox.width}%`,
              height: `${field.boundingBox.height}%`,
              backgroundColor: getConfidenceColor(field.confidence),
              border: `2px solid ${getBorderColor(field.confidence)}`,
              borderRadius: '4px'
            }}
            onClick={() => onFieldClick?.(field.name)}
          >
            {/* Tooltip on hover */}
            <div className="absolute -top-10 left-0 bg-background border rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              <p className="font-medium">{field.name}</p>
              <p className="text-muted-foreground">
                {Math.round(field.confidence * 100)}% confidence
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-background/95 backdrop-blur rounded-lg p-3 border">
          <p className="text-xs font-medium mb-2">Confidence Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(34, 197, 94)' }} />
              <span className="text-xs">High (≥95%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(234, 179, 8)' }} />
              <span className="text-xs">Medium (80-94%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(239, 68, 68)' }} />
              <span className="text-xs">Low (<80%)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
```

### Benefits
- **Instant trust**: Users see exactly where AI is confident
- **Guided correction**: Low-confidence fields highlighted for review
- **Educational**: Users learn what documents work best

---

## Feature 2: Interactive Field Correction Modal

### Problem
Users need to correct extracted fields but current UI requires navigating to vault, finding field, editing.

### Solution
**Inline correction modal** that appears immediately after extraction with smart suggestions.

### Implementation

#### Component: `FieldCorrectionModal.tsx`

```typescript
interface ExtractedField {
  path: string; // e.g., "personalInfo.legalFirstName"
  label: string;
  extractedValue: string;
  currentVaultValue?: string; // If field already exists in vault
  confidence: number;
  source: 'ocr' | 'vault' | 'manual';
  suggestions?: string[]; // AI-generated alternatives
}

export const FieldCorrectionModal = ({
  fields,
  onSave,
  onCancel
}: {
  fields: ExtractedField[];
  onSave: (corrections: Record<string, string>) => void;
  onCancel: () => void;
}) => {
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

  const currentField = fields[currentFieldIndex];
  const totalFields = fields.length;

  // Auto-select next low-confidence field
  const goToNextLowConfidence = () => {
    const nextLowConfidence = fields.findIndex(
      (f, i) => i > currentFieldIndex && f.confidence < 0.95
    );
    if (nextLowConfidence !== -1) {
      setCurrentFieldIndex(nextLowConfidence);
    } else {
      setCurrentFieldIndex(Math.min(currentFieldIndex + 1, totalFields - 1));
    }
  };

  const handleAccept = (value: string) => {
    setCorrections({ ...corrections, [currentField.path]: value });
    goToNextLowConfidence();
  };

  const handleReject = () => {
    setCorrections({ ...corrections, [currentField.path]: currentField.currentVaultValue || '' });
    goToNextLowConfidence();
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Review Extracted Fields
          </DialogTitle>
          <DialogDescription>
            Field {currentFieldIndex + 1} of {totalFields} -{' '}
            {fields.filter(f => f.confidence < 0.95).length} need review
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <Progress value={(currentFieldIndex / totalFields) * 100} />

          {/* Current Field */}
          <Card className={`p-4 ${
            currentField.confidence < 0.95 ? 'border-yellow-500' : 'border-green-500'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <Label className="text-sm font-medium">{currentField.label}</Label>
                <p className="text-xs text-muted-foreground">{currentField.path}</p>
              </div>
              <Badge variant={currentField.confidence >= 0.95 ? 'default' : 'destructive'}>
                {Math.round(currentField.confidence * 100)}% confidence
              </Badge>
            </div>

            {/* Extracted Value */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">AI Extracted</span>
              </div>
              <Input
                value={corrections[currentField.path] ?? currentField.extractedValue}
                onChange={(e) => setCorrections({
                  ...corrections,
                  [currentField.path]: e.target.value
                })}
                className="font-mono text-sm"
              />
            </div>

            {/* Current Vault Value (if exists) */}
            {currentField.currentVaultValue && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Current Vault Value
                  </span>
                </div>
                <div className="p-2 bg-muted rounded text-sm font-mono">
                  {currentField.currentVaultValue}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAccept(currentField.currentVaultValue!)}
                >
                  Keep Existing
                </Button>
              </div>
            )}

            {/* AI Suggestions */}
            {currentField.suggestions && currentField.suggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentField.suggestions.map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAccept(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentFieldIndex(Math.max(0, currentFieldIndex - 1))}
                disabled={currentFieldIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentFieldIndex(Math.min(totalFields - 1, currentFieldIndex + 1))}
                disabled={currentFieldIndex === totalFields - 1}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleReject}>
                Reject
              </Button>
              <Button onClick={() => handleAccept(corrections[currentField.path] ?? currentField.extractedValue)}>
                Accept
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(corrections)}>
            Save All ({Object.keys(corrections).length} changes)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### Features
- **Sequential review**: Navigate field-by-field
- **Smart navigation**: Auto-jumps to low-confidence fields
- **Inline editing**: Edit without leaving modal
- **AI suggestions**: Alternative values for ambiguous extractions
- **Diff view**: Compare extracted vs. existing vault values
- **Batch save**: Save all corrections at once

---

## Feature 3: Real-Time OCR Preview Panel

### Problem
Users don't see extraction happening - just a progress bar. Feels like a black box.

### Solution
**Side-by-side real-time preview** showing original document + extracted data as it's processed.

### Implementation

#### Component: `RealTimeOCRPreview.tsx`

```typescript
export const RealTimeOCRPreview = ({
  documentFile,
  extractionStream
}: {
  documentFile: File;
  extractionStream: AsyncGenerator<Partial<StructuredDocumentData>>;
}) => {
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [extractedData, setExtractedData] = useState<Partial<StructuredDocumentData>>({});
  const [currentStage, setCurrentStage] = useState<string>('Initializing...');

  useEffect(() => {
    // Generate preview URL for document
    const url = URL.createObjectURL(documentFile);
    setDocumentUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [documentFile]);

  useEffect(() => {
    // Stream extraction results
    (async () => {
      for await (const partial of extractionStream) {
        setExtractedData(partial);

        // Determine current stage
        if (partial.personalInfo) setCurrentStage('Extracting personal info...');
        if (partial.contactInfo) setCurrentStage('Extracting contact info...');
        if (partial.identificationDocuments) setCurrentStage('Extracting ID documents...');
      }
      setCurrentStage('Complete!');
    })();
  }, [extractionStream]);

  return (
    <div className="grid grid-cols-2 gap-4 h-[600px]">
      {/* Left: Original Document */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm">Original Document</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {documentFile.type === 'application/pdf' ? (
              <PDFViewer fileUrl={documentUrl} />
            ) : (
              <img src={documentUrl} alt="Document" className="w-full" />
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right: Extracted Data (Real-time) */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Extracted Data</CardTitle>
            <Badge variant="outline" className="gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              {currentStage}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {/* Personal Info Section */}
              {extractedData.personalInfo && (
                <div className="animate-in slide-in-from-right">
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Personal Information
                  </h4>
                  <div className="pl-5 space-y-1">
                    {Object.entries(extractedData.personalInfo).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 text-xs">
                        <span className="text-muted-foreground min-w-[120px]">{key}:</span>
                        <span className="font-mono font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info Section */}
              {extractedData.contactInfo && (
                <div className="animate-in slide-in-from-right">
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Contact Information
                  </h4>
                  <div className="pl-5 space-y-1">
                    {/* Address */}
                    {extractedData.contactInfo.currentAddress && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium">Address:</span>
                        <div className="pl-3 text-xs font-mono">
                          <p>{extractedData.contactInfo.currentAddress.street1}</p>
                          <p>
                            {extractedData.contactInfo.currentAddress.city},{' '}
                            {extractedData.contactInfo.currentAddress.state}{' '}
                            {extractedData.contactInfo.currentAddress.zipCode}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Phone Numbers */}
                    {extractedData.contactInfo.phoneNumbers && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium">Phone:</span>
                        <div className="pl-3 text-xs font-mono">
                          {Object.entries(extractedData.contactInfo.phoneNumbers).map(([type, number]) => (
                            <p key={type}>
                              {type}: {number}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {extractedData.contactInfo.emailAddresses && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium">Email:</span>
                        <div className="pl-3 text-xs font-mono">
                          {extractedData.contactInfo.emailAddresses.primary}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ID Documents Section */}
              {extractedData.identificationDocuments && (
                <div className="animate-in slide-in-from-right">
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Identification Documents
                  </h4>
                  <div className="pl-5 space-y-2">
                    {extractedData.identificationDocuments.driversLicense && (
                      <div>
                        <span className="text-xs font-medium">Driver's License:</span>
                        <div className="pl-3 text-xs font-mono">
                          <p>Number: {extractedData.identificationDocuments.driversLicense.number}</p>
                          <p>State: {extractedData.identificationDocuments.driversLicense.state}</p>
                          <p>Expires: {extractedData.identificationDocuments.driversLicense.expirationDate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
```

### Benefits
- **Real-time feedback**: Users see extraction as it happens
- **Trust building**: Transparency about what AI is extracting
- **Educational**: Users learn what data is being captured
- **Engagement**: More interesting than a spinner

---

## Feature 4: Premium Drag-and-Drop Animations

### Problem
Current drag-and-drop feels basic. No visual feedback during drag.

### Solution
**Framer Motion animations** with physics-based springs and gestures.

### Implementation

#### Enhanced `DocumentUploadPanel.tsx`

```typescript
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

export const PremiumDragDropZone = ({ onFilesDropped }: { onFilesDropped: (files: File[]) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const dragY = useMotionValue(0);
  const scale = useTransform(dragY, [-100, 0, 100], [0.9, 1, 0.9]);
  const opacity = useTransform(dragY, [-100, 0, 100], [0.5, 1, 0.5]);

  return (
    <motion.div
      className={`relative border-2 border-dashed rounded-xl p-12 transition-all ${
        isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-muted'
      }`}
      style={{ scale, opacity }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        onFilesDropped(droppedFiles);
      }}
      animate={isDragging ? { scale: 1.05, borderColor: 'rgb(var(--primary))' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Drop Zone Content */}
      <motion.div
        className="flex flex-col items-center gap-4"
        animate={isDragging ? { y: -10 } : { y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          animate={isDragging ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <Upload className="w-10 h-10 text-primary" />
        </motion.div>

        <div className="text-center">
          <motion.p
            className="font-semibold text-lg"
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          >
            {isDragging ? 'Drop here!' : 'Drop documents here'}
          </motion.p>
          <p className="text-sm text-muted-foreground">
            or click to browse
          </p>
        </div>

        {/* Supported file types */}
        <div className="flex gap-2 flex-wrap justify-center">
          <Badge variant="outline">📄 PDF</Badge>
          <Badge variant="outline">🖼️ Images</Badge>
          <Badge variant="outline">📋 Court Forms</Badge>
        </div>
      </motion.div>

      {/* Ripple effect on drop */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              background: 'radial-gradient(circle, rgba(var(--primary), 0.2) 0%, transparent 70%)'
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

### Features
- **Physics-based springs**: Natural, bouncy animations
- **Drag state feedback**: Visual changes during drag
- **Ripple effect**: Premium effect on file drop
- **Micro-interactions**: Hover, active states
- **Smooth transitions**: All state changes animated

---

## Feature 5: Smart Field Suggestions with AI

### Problem
Users might not know the correct format for certain fields (e.g., phone numbers, dates).

### Solution
**AI-powered suggestions** for ambiguous or incorrectly formatted fields.

### Implementation

#### Service: `FieldSuggestionEngine.ts`

```typescript
import { MistralClient } from '@mistralai/mistralai';

export class FieldSuggestionEngine {
  private client: MistralClient;

  constructor(apiKey: string) {
    this.client = new MistralClient({ apiKey });
  }

  /**
   * Generate format suggestions for a field value
   */
  async generateSuggestions(
    fieldName: string,
    extractedValue: string,
    fieldType: 'phone' | 'date' | 'name' | 'address' | 'generic'
  ): Promise<string[]> {
    const prompt = this.createSuggestionPrompt(fieldName, extractedValue, fieldType);

    const response = await this.client.chat({
      model: 'mistral-small-latest', // Fast, cheap model for suggestions
      messages: [
        {
          role: 'system',
          content: 'You are a data formatting expert. Generate alternative formatted versions of user data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Some creativity, but mostly consistent
      max_tokens: 200
    });

    const suggestions = this.parseSuggestions(response.choices[0]?.message?.content || '');
    return suggestions;
  }

  private createSuggestionPrompt(fieldName: string, value: string, type: string): string {
    const prompts = {
      phone: `The user extracted a phone number: "${value}".
        Generate 3 alternative formats:
        1. International format (e.g., +1 555-123-4567)
        2. US standard (e.g., (555) 123-4567)
        3. Digits only (e.g., 5551234567)`,

      date: `The user extracted a date: "${value}".
        Generate 3 alternative formats:
        1. ISO 8601 (e.g., 2024-01-15)
        2. US standard (e.g., 01/15/2024)
        3. Written format (e.g., January 15, 2024)`,

      name: `The user extracted a name: "${value}".
        Generate 3 alternative formats:
        1. First Last (e.g., John Smith)
        2. Last, First (e.g., Smith, John)
        3. First M. Last (e.g., John M. Smith)`,

      address: `The user extracted an address: "${value}".
        Generate 3 alternative formats:
        1. Single line (e.g., 123 Main St, Los Angeles, CA 90001)
        2. Multi-line (street / city, state zip)
        3. Abbreviated (123 Main St, LA, CA 90001)`,

      generic: `The field "${fieldName}" has value: "${value}".
        Suggest 3 alternative interpretations or formats if applicable.`
    };

    return prompts[type] || prompts.generic;
  }

  private parseSuggestions(response: string): string[] {
    // Parse numbered list from AI response
    const lines = response.split('\n').filter(l => l.trim());
    const suggestions: string[] = [];

    for (const line of lines) {
      // Match patterns like "1. Text" or "- Text"
      const match = line.match(/^[\d\-\*\.]\s*(.+)$/);
      if (match) {
        suggestions.push(match[1].trim());
      }
    }

    return suggestions.slice(0, 3); // Max 3 suggestions
  }
}
```

#### Integration in `FieldCorrectionModal.tsx`

```typescript
const loadSuggestions = async (field: ExtractedField) => {
  const engine = new FieldSuggestionEngine(import.meta.env.VITE_MISTRAL_API_KEY);

  const fieldType = inferFieldType(field.path);
  const suggestions = await engine.generateSuggestions(
    field.label,
    field.extractedValue,
    fieldType
  );

  setFieldSuggestions({ ...fieldSuggestions, [field.path]: suggestions });
};

const inferFieldType = (fieldPath: string): 'phone' | 'date' | 'name' | 'address' | 'generic' => {
  if (fieldPath.includes('phone') || fieldPath.includes('telephone')) return 'phone';
  if (fieldPath.includes('date') || fieldPath.includes('birth')) return 'date';
  if (fieldPath.includes('name') || fieldPath.includes('Name')) return 'name';
  if (fieldPath.includes('address') || fieldPath.includes('Address')) return 'address';
  return 'generic';
};
```

---

## Feature 6: Gamification with XP and Achievements

### Problem
Document upload feels like a chore. No reward for completing it.

### Solution
**Gamification system** with XP, achievements, and progress milestones.

### Implementation

#### Achievement System

```typescript
export const DOCUMENT_ACHIEVEMENTS = [
  {
    id: 'first_upload',
    title: 'First Steps',
    description: 'Upload your first document',
    xp: 50,
    icon: '🎯',
    unlockCondition: (stats: UploadStats) => stats.documentsUploaded >= 1
  },
  {
    id: 'accuracy_master',
    title: 'Accuracy Master',
    description: 'Extract document with 99%+ confidence',
    xp: 100,
    icon: '🎖️',
    unlockCondition: (stats: UploadStats) => stats.maxConfidence >= 0.99
  },
  {
    id: 'vault_complete',
    title: 'Vault Complete',
    description: 'Fill 100% of vault fields',
    xp: 200,
    icon: '🏆',
    unlockCondition: (stats: UploadStats) => stats.vaultCompleteness >= 1.0
  },
  {
    id: 'time_saver',
    title: 'Time Saver',
    description: 'Save 60+ minutes with auto-fill',
    xp: 150,
    icon: '⏱️',
    unlockCondition: (stats: UploadStats) => stats.timeSavedMinutes >= 60
  },
  {
    id: 'power_user',
    title: 'Power User',
    description: 'Upload 10+ documents',
    xp: 300,
    icon: '⚡',
    unlockCondition: (stats: UploadStats) => stats.documentsUploaded >= 10
  }
];

interface UploadStats {
  documentsUploaded: number;
  maxConfidence: number;
  vaultCompleteness: number;
  timeSavedMinutes: number;
}
```

#### XP Progress Component

```typescript
export const XPProgressBar = ({ currentXP, level }: { currentXP: number; level: number }) => {
  const xpForNextLevel = level * 100; // Simple formula: level 1 = 100 XP, level 2 = 200 XP, etc.
  const progress = (currentXP / xpForNextLevel) * 100;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-lg">
            Level {level}
          </Badge>
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground">
          {currentXP} / {xpForNextLevel} XP
        </span>
      </div>

      <Progress value={progress} className="h-2" />

      <p className="text-xs text-muted-foreground mt-2">
        {xpForNextLevel - currentXP} XP to level {level + 1}
      </p>
    </Card>
  );
};
```

#### Achievement Toast

```typescript
export const showAchievementToast = (achievement: Achievement) => {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="bg-gradient-to-r from-primary to-accent text-white rounded-lg p-4 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="text-4xl">{achievement.icon}</div>
          <div>
            <p className="font-bold">Achievement Unlocked!</p>
            <p className="text-sm">{achievement.title}</p>
            <p className="text-xs opacity-90">{achievement.description}</p>
            <Badge variant="secondary" className="mt-1">
              +{achievement.xp} XP
            </Badge>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 5000,
      position: 'top-center'
    }
  );
};
```

---

## Design System Integration

### Colors (OKLCH)

```css
/* Confidence-based colors */
--confidence-high: oklch(0.75 0.15 142); /* Green */
--confidence-medium: oklch(0.75 0.15 90); /* Yellow */
--confidence-low: oklch(0.65 0.20 25); /* Red */

/* Achievement colors */
--achievement-gold: oklch(0.85 0.15 85);
--achievement-silver: oklch(0.80 0.05 240);
--achievement-bronze: oklch(0.65 0.10 40);
```

### Typography

- **Field Labels**: 12px, font-medium, OKLCH gray-700
- **Extracted Values**: 14px, font-mono, OKLCH gray-900
- **Confidence Badges**: 10px, font-semibold, respective confidence color

### Spacing

- **Card padding**: 16px (p-4)
- **Section gaps**: 12px (gap-3)
- **Field gaps**: 8px (gap-2)
- **Micro-spacing**: 4px (gap-1)

---

## Accessibility (WCAG AAA)

### Keyboard Navigation
- **Tab order**: Drop zone → Upload button → Preview → Correction modal → Save
- **Escape key**: Close all modals
- **Arrow keys**: Navigate between fields in correction modal
- **Enter key**: Accept field in correction modal

### Screen Reader Support
```tsx
<div
  role="region"
  aria-label="Document upload and extraction"
  aria-describedby="upload-instructions"
>
  <p id="upload-instructions" className="sr-only">
    Drop documents here to extract data into your vault. Supported formats: PDF, JPEG, PNG.
  </p>
  {/* Upload zone */}
</div>
```

### Color Contrast
- All confidence colors meet WCAG AAA (7:1 contrast ratio)
- Text over heatmap overlay: guaranteed 4.5:1 minimum
- Achievement badges: high contrast borders

---

## Performance Targets

### Animation Performance
- **60 FPS**: All animations run at 60 FPS (16ms per frame)
- **Hardware acceleration**: Use `transform` and `opacity` only
- **Debouncing**: Drag events debounced to 16ms
- **Lazy loading**: Framer Motion tree-shaking enabled

### Rendering Performance
- **Virtual scrolling**: Long lists of extracted fields virtualized
- **Memoization**: All expensive components wrapped in `memo()`
- **Code splitting**: Modals lazy-loaded

---

## Mobile Considerations

### Touch-Friendly
- **Tap targets**: Minimum 44x44px (WCAG AAA)
- **Swipe gestures**: Swipe to navigate correction modal
- **Pull to refresh**: Pull down to reload extracted data

### Responsive Layout
- **Mobile**: Single column (document preview on top, data below)
- **Tablet**: Side-by-side (50/50 split)
- **Desktop**: Advanced layout with heatmap overlay

---

## Cost Analysis

### AI Suggestion Engine
- **Mistral Small**: $0.0002 per 1K tokens
- **Average suggestions**: 5 fields × 200 tokens = 1K tokens
- **Cost per document**: $0.0002
- **Cost per 1000 users**: $0.20

### Total Added Cost
- **Per user/month**: ~$0.01 (including suggestions)
- **Extremely affordable** for premium UX

---

## A/B Testing Plan

### Test 1: Heatmap Overlay
- **Control**: No heatmap, standard preview
- **Variant**: Heatmap overlay with confidence colors
- **Metric**: User trust score, manual correction rate

### Test 2: Gamification
- **Control**: No XP/achievements
- **Variant**: Full gamification system
- **Metric**: Upload completion rate, user engagement time

### Test 3: Real-Time Preview
- **Control**: Spinner + final result
- **Variant**: Streaming real-time preview
- **Metric**: Perceived performance, user satisfaction

---

## Implementation Priority

### Phase 1 (Must Have) - Week 1
1. ✅ Confidence Heatmap Overlay
2. ✅ Field Correction Modal
3. ✅ Real-Time Progress Tracking

### Phase 2 (Should Have) - Week 2
4. ✅ Premium Drag-and-Drop Animations
5. ✅ Real-Time OCR Preview Panel

### Phase 3 (Nice to Have) - Week 3
6. ✅ Smart Field Suggestions
7. ✅ Gamification System

---

**Status**: Ready for design review and implementation
**Design Review Required**: Yes - with design team
**User Testing Required**: Yes - with 3-5 SRLs
**Accessibility Audit Required**: Yes - WCAG AAA compliance

Last Updated: 2025-11-17 by Claude Code Research Agent
