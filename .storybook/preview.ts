import type { Preview } from '@storybook/react-vite';
import  React from 'react';
import '../src/index.css'; // Import Tailwind CSS and global styles
import { Toaster } from '../src/components/ui/sonner';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0f1419',
        },
      ],
    },
    // Enable accessibility addon
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
      manual: false,
    },
  },
  decorators: [
    (Story) =>
      React.createElement(
        'div',
        null,
        React.createElement(Story),
        React.createElement(Toaster)
      ),
  ],
};

export default preview;