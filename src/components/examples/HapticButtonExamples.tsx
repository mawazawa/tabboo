/**
 * Haptic Feedback Examples
 *
 * Demonstrates best practices for using haptic feedback in SwiftFill components.
 * Based on November 2025 cross-platform haptic feedback patterns.
 *
 * Usage: Import these patterns into your components for consistent tactile feedback.
 */

import { useHaptic } from '@/hooks/use-haptic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

export function HapticButtonExamples() {
  const haptic = useHaptic();
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="grid gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Button Actions (Medium Haptic)</CardTitle>
          <CardDescription>Standard button press feedback</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button
            onClick={() => haptic.trigger('medium')}
            variant="default"
          >
            Save Document
          </Button>
          <Button
            onClick={() => haptic.trigger('medium')}
            variant="outline"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Feedback (Success Pattern)</CardTitle>
          <CardDescription>Double-tap pattern for completion</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              haptic.trigger('success');
              // Your success logic here
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Submit Form
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error/Destructive Actions (Error Pattern)</CardTitle>
          <CardDescription>Alert pulse for critical actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              haptic.trigger('error');
              // Your delete logic here
            }}
            variant="destructive"
          >
            Delete Document
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Light Interactions (Light Haptic)</CardTitle>
          <CardDescription>Minimal feedback for toggles and checkboxes</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Checkbox
            id="haptic-demo"
            checked={isChecked}
            onCheckedChange={(checked) => {
              haptic.trigger('light');
              setIsChecked(checked as boolean);
            }}
          />
          <label htmlFor="haptic-demo" className="text-sm">
            Enable notifications (with haptic feedback)
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Heavy Feedback (Heavy Haptic)</CardTitle>
          <CardDescription>Strong feedback for important actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => haptic.trigger('heavy')}
            variant="outline"
            className="font-bold"
          >
            Clear All Fields
          </Button>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-sm">Platform Support Info</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="space-y-1 list-disc list-inside">
            <li><strong>Android Chrome:</strong> Full Vibration API support</li>
            <li><strong>iOS 18+ Safari:</strong> Limited (switch elements only)</li>
            <li><strong>iOS &lt;18:</strong> Visual feedback fallback (CSS animations)</li>
            <li><strong>Desktop:</strong> Visual feedback only</li>
            <li><strong>All platforms:</strong> Respects user preferences and reduced motion</li>
          </ul>
          <p className="mt-3 text-xs">
            Haptic support: {haptic.isSupported() ? '✅ Enabled' : '❌ Visual fallback only'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Integration Pattern: Button with Haptic
 *
 * Use this pattern in your components:
 */
export function ButtonWithHaptic({
  onClick,
  hapticPattern = 'medium',
  children,
  ...props
}: {
  onClick?: () => void;
  hapticPattern?: 'light' | 'medium' | 'heavy' | 'success' | 'error';
  children: React.ReactNode;
  [key: string]: any;
}) {
  const haptic = useHaptic();

  const handleClick = () => {
    haptic.trigger(hapticPattern);
    onClick?.();
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}
