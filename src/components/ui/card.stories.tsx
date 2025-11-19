/**
 * Card Component Stories
 *
 * Demonstrates SwiftFill's premium Card component with 3 aesthetic levels:
 * - Default: Clean card with subtle shadow
 * - Refined: Glassmorphic background with soft diffused shadows
 * - Liquid Glass: Apple-inspired advanced glassmorphism with 24px blur
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Separator } from './separator';
import { FileText, Calendar, User, CheckCircle } from '@/icons';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
SwiftFill Card component with three premium aesthetic levels.

**Aesthetic Levels:**
1. **Default**: Clean card with subtle shadow (standard usage)
2. **Refined**: Glassmorphic background with soft diffused shadows (2025 premium)
3. **Liquid Glass**: Apple-inspired advanced glassmorphism with 24px blur (ultimate premium)

**Features:**
- Multi-layer depth through shadows and refraction
- Backdrop blur for frosted glass effect
- Inset highlights for embossed appearance
- Smooth spring-based transitions
- Composable sub-components (Header, Title, Description, Content, Footer)

**Usage:**
\`\`\`tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    refined: {
      control: 'boolean',
      description: 'Use refined glassmorphic styling',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    liquidGlass: {
      control: 'boolean',
      description: 'Use Apple Liquid Glass styling (overrides refined)',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default Card
 *
 * Standard card with subtle shadow. Use for most content containers.
 */
export const Default: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>FL-320 Response Form</CardTitle>
        <CardDescription>Response to Request for Restraining Orders</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          This form is used to respond to a request for domestic violence restraining orders in California.
        </p>
      </CardContent>
      <CardFooter>
        <Button>Open Form</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Refined Card (Glassmorphic)
 *
 * Premium glassmorphic styling with soft diffused shadows.
 * Use for featured content or important UI sections.
 */
export const Refined: Story = {
  render: () => (
    <Card refined className="w-[400px]">
      <CardHeader>
        <CardTitle>Personal Data Vault</CardTitle>
        <CardDescription>Securely manage your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Jane Smith</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">12 saved fields</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Last updated: Today</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline">View Vault</Button>
        <Button>Edit Info</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Liquid Glass Card (Ultimate Premium)
 *
 * Apple-inspired advanced glassmorphism with 24px blur.
 * Use for hero sections, modals, or premium features.
 */
export const LiquidGlass: Story = {
  render: () => (
    <div className="relative p-8 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl">
      <Card liquidGlass className="w-[400px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Export Complete</CardTitle>
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <CardDescription>Your PDF has been generated successfully</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">File size</span>
              <span className="font-medium">2.3 MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pages</span>
              <span className="font-medium">4</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fields filled</span>
              <span className="font-medium">41/64</span>
            </div>
          </div>
          <Separator />
          <div className="flex gap-2">
            <Badge>Court-ready</Badge>
            <Badge variant="secondary">Signed</Badge>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline">Share</Button>
          <Button>Download PDF</Button>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

/**
 * Aesthetic Comparison
 *
 * Side-by-side comparison of all three aesthetic levels.
 */
export const AestheticComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {/* Default */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-center">Default</h4>
        <Card className="w-[280px]">
          <CardHeader>
            <CardTitle className="text-lg">Standard Card</CardTitle>
            <CardDescription>Subtle shadow</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Clean design for most content containers.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Refined */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-center">Refined</h4>
        <Card refined className="w-[280px]">
          <CardHeader>
            <CardTitle className="text-lg">Glassmorphic</CardTitle>
            <CardDescription>Soft diffused shadows</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Premium glassmorphic styling for featured content.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liquid Glass */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-center">Liquid Glass</h4>
        <Card liquidGlass className="w-[280px]">
          <CardHeader>
            <CardTitle className="text-lg">Apple-inspired</CardTitle>
            <CardDescription>24px blur, ultimate premium</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Advanced glassmorphism for hero sections.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

/**
 * Content Variations
 *
 * Different content layouts within cards.
 */
export const ContentVariations: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Simple */}
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Simple Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Minimal card with just a title and content.
          </p>
        </CardContent>
      </Card>

      {/* With Description */}
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>With Description</CardTitle>
          <CardDescription>Subtitle provides context</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Description helps users understand the card purpose.
          </p>
        </CardContent>
      </Card>

      {/* With Footer */}
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>With Footer Actions</CardTitle>
          <CardDescription>Call-to-action buttons</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Footer provides action buttons for user interaction.
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </CardFooter>
      </Card>

      {/* Rich Content */}
      <Card refined className="w-[350px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rich Content</CardTitle>
              <CardDescription>Multiple content types</CardDescription>
            </div>
            <Badge>New</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="font-medium text-sm">DV-100 Form</div>
              <div className="text-xs text-muted-foreground">13 pages</div>
            </div>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground">
            Updated 2 hours ago
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Open Form</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

/**
 * Real-World Examples
 *
 * Actual card usage from SwiftFill application.
 */
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-[800px]">
      {/* Form Selection Card */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>FL-320: Response to Request for Restraining Orders</CardTitle>
              <CardDescription>California Judicial Council Form • 4 pages</CardDescription>
            </div>
            <Badge>Supported</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use this form to respond to a request for domestic violence restraining orders.
            Complete all applicable sections and file with the court.
          </p>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Fields:</span>{' '}
              <span className="font-medium">64</span>
            </div>
            <div>
              <span className="text-muted-foreground">Revision:</span>{' '}
              <span className="font-medium">Jan 2024</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline">Preview PDF</Button>
          <Button>Start Form</Button>
        </CardFooter>
      </Card>

      {/* Progress Card */}
      <Card refined className="w-full">
        <CardHeader>
          <CardTitle>Form Completion Progress</CardTitle>
          <CardDescription>Your progress on FL-320</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fields completed</span>
              <span className="font-medium">41 / 64</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[64%] transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Required fields</div>
              <div className="font-medium">23 / 30 complete</div>
            </div>
            <div>
              <div className="text-muted-foreground">Optional fields</div>
              <div className="font-medium">18 / 34 complete</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Continue Editing</Button>
        </CardFooter>
      </Card>

      {/* Document Card */}
      <Card liquidGlass className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Documents</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'FL-320_Response.pdf', date: 'Today at 2:30 PM', status: 'Draft' },
            { name: 'DV-100_Request.pdf', date: 'Yesterday at 4:15 PM', status: 'Complete' },
            { name: 'DV-105_Custody.pdf', date: '2 days ago', status: 'In Progress' },
          ].map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{doc.name}</div>
                <div className="text-xs text-muted-foreground">{doc.date}</div>
              </div>
              <Badge variant={doc.status === 'Complete' ? 'default' : 'secondary'} className="shrink-0">
                {doc.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  ),
};

/**
 * Interactive States
 *
 * Cards with hover and focus states.
 */
export const InteractiveStates: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="w-[300px] cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Hoverable Card</CardTitle>
          <CardDescription>Hover to see effect</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cursor changes to pointer and shadow increases on hover.
          </p>
        </CardContent>
      </Card>

      <Card refined className="w-[300px] cursor-pointer hover:scale-[1.02] transition-transform">
        <CardHeader>
          <CardTitle className="text-lg">Scalable Card</CardTitle>
          <CardDescription>Hover for scale effect</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Card scales up slightly on hover for emphasis.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};
