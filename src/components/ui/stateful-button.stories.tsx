import type { Meta, StoryObj } from '@storybook/react';
import { StatefulButton, type ProcessStep } from './stateful-button';
import { Download, Shield, Database } from '@/icons';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultSteps: ProcessStep[] = [
  { name: 'Validating form', duration: 300 },
  { name: 'Encrypting data', duration: 250 },
  { name: 'Saving to vault', duration: 350 },
];

const meta = {
  title: 'Components/StatefulButton',
  component: StatefulButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
StatefulButton is the canonical implementation of SwiftFill's Constitutional Principle:

> "Implement Stateful Buttons for **ALL** async operations to provide micro-process transparency."

**Why it matters (Nov 2025 best practices):**
- Reinforces **functional maximalism** — purposeful micro-interactions that educate users (ProDesign School, 2025)
- Builds trust through visible process telemetry and accessibility-friendly timers
- Ensures every async action lives inside the design system + Storybook (no custom one-offs)

Each story demonstrates a production-authentic workflow so engineers can reuse patterns confidently in Canvas-first surfaces.`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    processSteps: {
      control: 'object',
      description: 'Ordered list of micro-process indicators (name + duration).',
    },
    successMessage: {
      control: 'text',
      description: 'Optional override for success copy.',
    },
    errorMessage: {
      control: 'text',
      description: 'Copy shown when onComplete rejects.',
    },
    expandOnProcess: {
      control: 'boolean',
      description: 'Disable to keep toolbar-sized buttons compact.',
    },
  },
} satisfies Meta<typeof StatefulButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaveWorkflow: Story = {
  args: {
    processSteps: defaultSteps,
    successMessage: 'Packet saved!',
    children: (
      <>
        <Shield className="h-4 w-4" /> Save TRO Packet
      </>
    ),
  },
  render: (args) => (
    <StatefulButton
      {...args}
      onComplete={async () => {
        await wait(400);
      }}
    />
  ),
};

export const ExportPDF: Story = {
  render: () => (
    <StatefulButton
      processSteps={[
        { name: 'Preparing layout', duration: 250 },
        { name: 'Writing PDF bytes', duration: 350 },
        { name: 'Signing document', duration: 300 },
      ]}
      successMessage="Download ready!"
      onComplete={async () => {
        await wait(500);
      }}
    >
      <>
        <Download className="h-4 w-4" /> Export PDF
      </>
    </StatefulButton>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Matches the `ExportPDFButton` toolbar integration so Canvas + Desktop share identical UX.',
      },
    },
  },
};

export const ErrorRecovery: Story = {
  render: () => (
    <StatefulButton
      processSteps={[
        { name: 'Syncing vault', duration: 250 },
        { name: 'Writing encrypted data', duration: 400 },
      ]}
      errorMessage="Vault sync failed"
      onComplete={async () => {
        await wait(450);
        throw new Error('Timeout from Supabase edge function');
      }}
    >
      <>
        <Database className="h-4 w-4" /> Sync Vault
      </>
    </StatefulButton>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the new error state + telemetry, required for all async Canvas controls.',
      },
    },
  },
};

export const CompactToolbarMode: Story = {
  render: () => (
    <StatefulButton
      processSteps={[
        { name: 'Prefetching', duration: 200 },
        { name: 'Locking fields', duration: 200 },
      ]}
      expandOnProcess={false}
      successMessage="Locked!"
      onComplete={async () => wait(250)}
    >
      Lock Form
    </StatefulButton>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use `expandOnProcess={false}` for tight toolbar slots (e.g., Canvas rail buttons) while still honoring telemetry.',
      },
    },
  },
};

