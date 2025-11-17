/**
 * Filing Checklist Component
 *
 * Displays a comprehensive checklist for in-person filing at Los Angeles Superior Court.
 * Helps users prepare all necessary documents and understand the filing process.
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  MapPin,
  Clock,
  Phone,
  AlertCircle,
  CheckCircle2,
  Printer,
  FileText,
  Download,
} from '@/icons';
import { useState } from 'react';
import type { TROPacket } from '@/types/PacketTypes';
import { STANLEY_MOSK_FILING_LOCATION } from '@/types/PacketTypes';
import { estimatePrintingCost, validatePrintReadiness } from '@/lib/printPacket';

interface Props {
  packet: TROPacket;
  onPrintPacket?: () => void;
  className?: string;
}

export function FilingChecklist({ packet, onPrintPacket, className = '' }: Props) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheckItem = (itemId: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const printCost = estimatePrintingCost(packet, 3);
  const readiness = validatePrintReadiness(packet);

  const location = STANLEY_MOSK_FILING_LOCATION;

  const beforeYouGoChecklist = [
    { id: 'print', label: 'Print packet (all pages, single-sided)' },
    { id: 'copies', label: 'Make 2 copies (1 for court, 1 for respondent, 1 for your records)' },
    { id: 'sign', label: 'Sign all forms in ORIGINAL INK (not digital signature)' },
    { id: 'id', label: 'Bring valid photo ID (driver\'s license or state ID)' },
    { id: 'pen', label: 'Bring pen for any corrections' },
    { id: 'paperclips', label: 'Use paper clips only (do NOT staple)' },
    { id: 'review', label: 'Review all forms for completeness' },
  ];

  const atCourtChecklist = [
    { id: 'arrive', label: 'Arrive before 3:00 PM for same-day processing' },
    { id: 'window', label: 'Go to Family Law filing window (Room 100)' },
    { id: 'submit', label: 'Give all copies to clerk' },
    { id: 'wait', label: 'Wait for clerk to review forms' },
    { id: 'receive', label: 'Receive file-stamped copies and hearing date' },
    { id: 'dv109', label: 'Ask for DV-109 (Notice of Hearing) if applicable' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Readiness Status */}
      {!readiness.ready && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Ready for Filing</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {readiness.issues.map((issue, index) => (
                <div key={index} className="text-sm">• {issue}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {readiness.ready && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Ready for Filing</AlertTitle>
          <AlertDescription className="text-green-800">
            Your packet is complete and ready to be filed in person.
          </AlertDescription>
        </Alert>
      )}

      {/* Court Location */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Filing Location</h3>
            <p className="text-sm text-muted-foreground">
              Los Angeles Superior Court - Family Law Division
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            In-Person Filing
          </Badge>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">{location.courtName}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {location.address}<br />
                {location.cityStateZip}<br />
                {location.filingWindow}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Hours</div>
              <div className="text-sm text-muted-foreground mt-1">{location.hours}</div>
            </div>
          </div>

          {location.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-semibold">Phone</div>
                <div className="text-sm text-muted-foreground mt-1">{location.phone}</div>
              </div>
            </div>
          )}
        </div>

        {onPrintPacket && (
          <>
            <Separator className="my-4" />
            <Button onClick={onPrintPacket} className="w-full" size="lg">
              <Printer className="h-4 w-4 mr-2" />
              Print Packet for In-Person Filing
            </Button>
          </>
        )}
      </Card>

      {/* Before You Go Checklist */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Before You Go</h3>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {beforeYouGoChecklist.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <Checkbox
                  id={item.id}
                  checked={checkedItems.has(item.id)}
                  onCheckedChange={() => toggleCheckItem(item.id)}
                  className="mt-1"
                />
                <Label
                  htmlFor={item.id}
                  className="font-normal cursor-pointer leading-relaxed"
                >
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* At the Court Checklist */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">At the Courthouse</h3>

        <div className="space-y-3">
          {atCourtChecklist.map((item) => (
            <div key={item.id} className="flex items-start space-x-3">
              <Checkbox
                id={item.id}
                checked={checkedItems.has(item.id)}
                onCheckedChange={() => toggleCheckItem(item.id)}
                className="mt-1"
              />
              <Label
                htmlFor={item.id}
                className="font-normal cursor-pointer leading-relaxed"
              >
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Important Notes */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-bold mb-4 text-blue-900">Important Notes</h3>

        <div className="space-y-3 text-sm text-blue-800">
          {location.specialInstructions?.map((instruction, index) => (
            <div key={index} className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{instruction}</span>
            </div>
          ))}

          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              Court cannot provide legal advice. Consider consulting a family law attorney or
              visiting the Self-Help Center for guidance.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              If you are in immediate danger, ask the clerk about emergency TRO procedures.
            </span>
          </div>
        </div>
      </Card>

      {/* Printing Cost Estimate */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-bold mb-4">Estimated Printing Cost</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pages per copy:</span>
            <span className="font-medium">{packet.totalPages}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Number of copies:</span>
            <span className="font-medium">3 (original + 2 copies)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total pages:</span>
            <span className="font-medium">{printCost.pages}</span>
          </div>

          <Separator className="my-3" />

          <div className="flex justify-between items-center">
            <span className="font-semibold">Estimated cost:</span>
            <Badge variant="secondary" className="text-base">
              ${printCost.cost.toFixed(2)}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {printCost.breakdown}
          </p>
        </div>

        <Alert className="mt-4 border-muted">
          <AlertDescription className="text-xs">
            <strong>Tip:</strong> Many libraries offer free or low-cost printing services.
            Call ahead to confirm availability and pricing.
          </AlertDescription>
        </Alert>
      </Card>

      {/* Progress Summary */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Checklist Progress</div>
            <div className="text-sm text-muted-foreground mt-1">
              {checkedItems.size} of {beforeYouGoChecklist.length + atCourtChecklist.length} items completed
            </div>
          </div>
          <div className="text-4xl font-bold text-primary">
            {Math.round((checkedItems.size / (beforeYouGoChecklist.length + atCourtChecklist.length)) * 100)}%
          </div>
        </div>
      </Card>
    </div>
  );
}
