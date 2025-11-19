/**
 * Haptic Feedback Test Page
 *
 * Interactive demonstration of haptic integration in SwiftFill components.
 * Use this page to test haptic patterns across different devices and browsers.
 *
 * Access via: /haptic-test (development only)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Download,
  Trash2,
  Check,
  X,
  Info,
  Vibrate,
  Smartphone,
} from '@/icons';
import { useHaptic } from '@/hooks/use-haptic';
import { ExportPDFButton } from '@/components/ExportPDFButton';
import type { FormData } from '@/types/FormData';

export default function HapticTest() {
  const haptic = useHaptic();
  const [lastTriggered, setLastTriggered] = useState<string>('');
  const [triggerCount, setTriggerCount] = useState(0);

  const testFormData: FormData = {
    partyName: 'Jane Smith',
    streetAddress: '123 Main Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
  };

  const handleTrigger = (pattern: string) => {
    setLastTriggered(pattern);
    setTriggerCount(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Haptic Feedback Test</h1>
          <p className="text-muted-foreground">
            Interactive demonstration of cross-platform haptic feedback integration
          </p>
        </div>

        {/* Platform Support Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Platform Support</AlertTitle>
          <AlertDescription>
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2">
                <Badge variant={haptic.isSupported() ? "default" : "secondary"}>
                  {haptic.isSupported() ? "Haptics Enabled" : "Visual Feedback Only"}
                </Badge>
                <span className="text-sm">
                  {haptic.isSupported()
                    ? "Your device supports vibration (Android or compatible browser)"
                    : "Haptics not available - showing visual feedback instead"}
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Separator />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Last Triggered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastTriggered || 'None'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{triggerCount}</div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Pattern Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vibrate className="h-5 w-5" />
              Haptic Patterns
            </CardTitle>
            <CardDescription>
              Test all 6 semantic haptic patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                haptic="light"
                variant="outline"
                onClick={() => handleTrigger('light')}
                className="justify-start"
              >
                <span className="font-mono text-xs mr-2">10ms</span>
                Light (Hover, Toggle)
              </Button>

              <Button
                haptic="medium"
                variant="outline"
                onClick={() => handleTrigger('medium')}
                className="justify-start"
              >
                <span className="font-mono text-xs mr-2">15ms</span>
                Medium (Button Press)
              </Button>

              <Button
                haptic="heavy"
                variant="outline"
                onClick={() => handleTrigger('heavy')}
                className="justify-start"
              >
                <span className="font-mono text-xs mr-2">25ms</span>
                Heavy (Delete, Clear)
              </Button>

              <Button
                haptic="success"
                variant="outline"
                onClick={() => handleTrigger('success')}
                className="justify-start"
              >
                <span className="font-mono text-xs mr-2">[10,50,10]</span>
                Success (Double Tap)
              </Button>

              <Button
                haptic="error"
                variant="outline"
                onClick={() => handleTrigger('error')}
                className="justify-start"
              >
                <span className="font-mono text-xs mr-2">[25,50,25]</span>
                Error (Alert Pulse)
              </Button>

              <Button
                haptic="selection"
                variant="outline"
                onClick={() => handleTrigger('selection')}
                className="justify-start"
              >
                <span className="font-mono text-xs mr-2">5ms</span>
                Selection (Minimal Tick)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Real Component Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Production Components
            </CardTitle>
            <CardDescription>
              Real SwiftFill components with integrated haptics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Export Button (success haptic) */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Export PDF Button</div>
              <div className="flex items-center gap-3">
                <ExportPDFButton
                  formData={testFormData}
                  formType="FL-320"
                  onExportComplete={() => handleTrigger('success (Export PDF)')}
                />
                <Badge variant="secondary" className="font-mono text-xs">
                  haptic="success"
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Common Actions</div>
              <div className="flex flex-wrap gap-3">
                <Button
                  haptic="success"
                  onClick={() => handleTrigger('success (Save)')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>

                <Button
                  haptic="light"
                  variant="outline"
                  onClick={() => handleTrigger('light (Cancel)')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>

                <Button
                  haptic="heavy"
                  variant="destructive"
                  onClick={() => handleTrigger('heavy (Delete)')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>

                <Button
                  haptic="medium"
                  variant="secondary"
                  onClick={() => handleTrigger('medium (Download)')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Implementation Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Guide</CardTitle>
            <CardDescription>
              How to add haptics to your components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <code>{`<Button haptic="success" onClick={handleSave}>
  Save Document
</Button>`}</code>
            </div>

            <div className="text-sm space-y-2">
              <h4 className="font-semibold">Pattern Guidelines:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>light</strong> - Checkboxes, toggles, hover states</li>
                <li><strong>medium</strong> - Standard button presses, navigation</li>
                <li><strong>heavy</strong> - Destructive actions, clear all, delete</li>
                <li><strong>success</strong> - Form submission, save, export</li>
                <li><strong>error</strong> - Validation errors, critical alerts</li>
                <li><strong>selection</strong> - Slider ticks, picker scrolls</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
