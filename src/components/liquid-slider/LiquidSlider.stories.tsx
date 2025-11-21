import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LiquidSlider } from './LiquidSlider';

const meta: Meta<typeof LiquidSlider> = {
  title: 'Components/LiquidSlider',
  component: LiquidSlider,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#000000' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current value of the slider',
    },
    min: {
      control: { type: 'number' },
      description: 'Minimum value',
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum value',
    },
    step: {
      control: { type: 'number' },
      description: 'Step increment',
    },
    color: {
      control: { type: 'color' },
      description: 'Accent color for the filled track',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable the slider',
    },
    label: {
      control: { type: 'text' },
      description: 'Accessible label for the slider',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LiquidSlider>;

// Interactive wrapper to show controlled behavior
const ControlledSlider = (props: React.ComponentProps<typeof LiquidSlider>) => {
  const [value, setValue] = useState(props.value ?? 50);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <LiquidSlider {...props} value={value} onChange={setValue} />
      <span style={{ fontFamily: 'system-ui', fontSize: '14px', color: '#666' }}>
        Value: {value}
      </span>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ControlledSlider {...args} />,
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    color: '#007AFF',
    label: 'Volume',
  },
};

export const Purple: Story = {
  render: (args) => <ControlledSlider {...args} />,
  args: {
    value: 75,
    min: 0,
    max: 100,
    step: 1,
    color: 'hsl(280 80% 50%)',
    label: 'Brightness',
  },
};

export const Green: Story = {
  render: (args) => <ControlledSlider {...args} />,
  args: {
    value: 30,
    min: 0,
    max: 100,
    step: 1,
    color: 'hsl(144 100% 43%)',
    label: 'Progress',
  },
};

export const Orange: Story = {
  render: (args) => <ControlledSlider {...args} />,
  args: {
    value: 60,
    min: 0,
    max: 100,
    step: 1,
    color: 'hsl(24 100% 50%)',
    label: 'Temperature',
  },
};

export const Disabled: Story = {
  render: (args) => <ControlledSlider {...args} />,
  args: {
    value: 40,
    min: 0,
    max: 100,
    step: 1,
    color: '#007AFF',
    disabled: true,
    label: 'Disabled slider',
  },
};

export const CustomRange: Story = {
  render: (args) => <ControlledSlider {...args} />,
  args: {
    value: 250,
    min: 100,
    max: 500,
    step: 10,
    color: '#FF2D55',
    label: 'Price range',
  },
};

export const SmallSteps: Story = {
  render: (args) => <ControlledSlider {...args} />,
  args: {
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#5856D6',
    label: 'Opacity',
  },
};
