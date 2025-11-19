/**
 * Input Component Stories
 *
 * Demonstrates SwiftFill's Input component with WCAG 2.2 AA compliance,
 * spring animations, and comprehensive accessibility features.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { Search, Mail, Lock, Calendar, Phone, User } from '@/icons';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
SwiftFill Input component with premium styling and full accessibility support.

**Features:**
- WCAG 2.2 AA compliant focus states
- Spring-based animations (snappy transitions)
- Support for all HTML input types
- File upload styling
- Placeholder text with proper contrast
- Disabled state handling
- Integration with Label component

**Accessibility:**
- Focus ring with offset for visibility
- Proper color contrast (4.5:1 minimum)
- Keyboard navigation
- Screen reader support
- Disabled state handling

**Usage:**
\`\`\`tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</div>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time', 'file'],
      description: 'HTML input type',
      table: {
        defaultValue: { summary: 'text' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default Input
 *
 * Basic text input with placeholder.
 */
export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

/**
 * With Label
 *
 * Input with associated label for accessibility.
 * Always use labels for form inputs.
 */
export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="name">Full Name</Label>
      <Input id="name" type="text" placeholder="Jane Smith" />
    </div>
  ),
};

/**
 * Input Types
 *
 * All common HTML input types.
 */
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <div className="space-y-2">
        <Label htmlFor="text">Text</Label>
        <Input id="text" type="text" placeholder="Enter text" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="jane.smith@example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="number">Number</Label>
        <Input id="number" type="number" placeholder="0" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tel">Telephone</Label>
        <Input id="tel" type="tel" placeholder="(555) 123-4567" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input id="url" type="url" placeholder="https://example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input id="search" type="search" placeholder="Search..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Time</Label>
        <Input id="time" type="time" />
      </div>
    </div>
  ),
};

/**
 * With Icons
 *
 * Inputs with leading or trailing icons.
 */
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      {/* Search with leading icon */}
      <div className="space-y-2">
        <Label htmlFor="search-icon">Search Forms</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-icon"
            type="search"
            placeholder="Search..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Email with leading icon */}
      <div className="space-y-2">
        <Label htmlFor="email-icon">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email-icon"
            type="email"
            placeholder="you@example.com"
            className="pl-9"
          />
        </div>
      </div>

      {/* Password with leading icon */}
      <div className="space-y-2">
        <Label htmlFor="password-icon">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password-icon"
            type="password"
            placeholder="••••••••"
            className="pl-9"
          />
        </div>
      </div>
    </div>
  ),
};

/**
 * With Buttons
 *
 * Input fields with action buttons.
 */
export const WithButtons: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      {/* Search with button */}
      <div className="space-y-2">
        <Label htmlFor="search-btn">Search Documents</Label>
        <div className="flex gap-2">
          <Input id="search-btn" type="search" placeholder="Search..." className="flex-1" />
          <Button>Search</Button>
        </div>
      </div>

      {/* Email with subscribe button */}
      <div className="space-y-2">
        <Label htmlFor="email-btn">Email Newsletter</Label>
        <div className="flex gap-2">
          <Input id="email-btn" type="email" placeholder="you@example.com" className="flex-1" />
          <Button>Subscribe</Button>
        </div>
      </div>
    </div>
  ),
};

/**
 * Disabled State
 *
 * Input in disabled state with reduced opacity.
 */
export const Disabled: Story = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <div className="space-y-2">
        <Label htmlFor="disabled-text">Disabled Text Input</Label>
        <Input id="disabled-text" type="text" placeholder="Cannot edit" disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="disabled-email">Disabled Email Input</Label>
        <Input id="disabled-email" type="email" value="locked@example.com" disabled />
      </div>
    </div>
  ),
};

/**
 * File Upload
 *
 * File input with custom styling.
 */
export const FileUpload: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <div className="space-y-2">
        <Label htmlFor="file-single">Upload Single File</Label>
        <Input id="file-single" type="file" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file-multiple">Upload Multiple Files</Label>
        <Input id="file-multiple" type="file" multiple />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file-accept">Upload PDF Only</Label>
        <Input id="file-accept" type="file" accept=".pdf,application/pdf" />
      </div>
    </div>
  ),
};

/**
 * Form Validation States
 *
 * Inputs with validation styling (requires custom classes).
 */
export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      {/* Success */}
      <div className="space-y-2">
        <Label htmlFor="valid-email">Email (Valid)</Label>
        <Input
          id="valid-email"
          type="email"
          value="jane.smith@example.com"
          className="border-green-500 focus-visible:ring-green-500"
        />
        <p className="text-xs text-green-600">Email is valid</p>
      </div>

      {/* Error */}
      <div className="space-y-2">
        <Label htmlFor="invalid-email">Email (Invalid)</Label>
        <Input
          id="invalid-email"
          type="email"
          value="invalid-email"
          className="border-red-500 focus-visible:ring-red-500"
        />
        <p className="text-xs text-red-600">Please enter a valid email address</p>
      </div>

      {/* Warning */}
      <div className="space-y-2">
        <Label htmlFor="warning-password">Password (Weak)</Label>
        <Input
          id="warning-password"
          type="password"
          value="123"
          className="border-yellow-500 focus-visible:ring-yellow-500"
        />
        <p className="text-xs text-yellow-600">Password is too weak</p>
      </div>
    </div>
  ),
};

/**
 * Real-World Examples
 *
 * Actual input patterns from SwiftFill.
 */
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-6 w-[500px]">
      {/* Personal Information */}
      <div className="space-y-4">
        <h4 className="font-semibold">Personal Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input id="first-name" type="text" placeholder="Jane" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input id="last-name" type="text" placeholder="Smith" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-real">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email-real"
              type="email"
              placeholder="jane.smith@example.com"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone-real">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone-real"
              type="tel"
              placeholder="(555) 123-4567"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Address Fields */}
      <div className="space-y-4">
        <h4 className="font-semibold">Address</h4>
        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input id="street" type="text" placeholder="123 Main Street" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" type="text" placeholder="Los Angeles" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" type="text" placeholder="CA" maxLength={2} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input id="zip" type="text" placeholder="90001" maxLength={5} />
        </div>
      </div>

      {/* Case Information */}
      <div className="space-y-4">
        <h4 className="font-semibold">Case Information</h4>
        <div className="space-y-2">
          <Label htmlFor="case-number">Case Number</Label>
          <Input id="case-number" type="text" placeholder="FL12345678" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filing-date">Filing Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="filing-date" type="date" className="pl-9" />
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Accessibility Showcase
 *
 * Demonstrates focus states and proper labeling.
 */
export const AccessibilityShowcase: Story = {
  render: () => (
    <div className="space-y-6 w-[400px]">
      <div>
        <h4 className="font-semibold mb-3">Focus States (Tab to navigate)</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="a11y-1">First Input</Label>
            <Input id="a11y-1" type="text" placeholder="Tab to focus" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a11y-2">Second Input</Label>
            <Input id="a11y-2" type="text" placeholder="Focus ring visible" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a11y-3">Third Input</Label>
            <Input id="a11y-3" type="text" placeholder="WCAG compliant" />
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>✅ Focus ring: Offset ring for visibility</p>
        <p>✅ Color contrast: 4.5:1 minimum (WCAG AA)</p>
        <p>✅ Labels: All inputs have associated labels</p>
        <p>✅ Placeholder: Sufficient contrast ratio</p>
        <p>✅ Keyboard: Full keyboard navigation support</p>
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'label',
            enabled: true,
          },
        ],
      },
    },
  },
};
