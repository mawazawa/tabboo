# Storybook Component Documentation Guide

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Last Updated**: November 2025

---

## 🎯 Overview

SwiftFill now includes comprehensive Storybook documentation for all UI components. This provides interactive component documentation, live examples, accessibility testing, and visual regression testing capabilities.

**Key Benefits**:
- ✅ Interactive component playground
- ✅ Live documentation with code examples
- ✅ Accessibility testing (WCAG 2.2 AA)
- ✅ Visual regression testing support
- ✅ Comprehensive variant/state coverage
- ✅ Real-world usage examples

---

## 📦 What's Included

### Component Stories (3 Core Components)

**1. Button** (`src/components/ui/button.stories.tsx`)
- 6 visual variants (default, destructive, outline, secondary, ghost, link)
- 4 sizes (sm, default, lg, icon)
- 6 haptic feedback patterns
- Real-world examples from SwiftFill
- Accessibility showcase
- ~500 lines of documentation

**2. Card** (`src/components/ui/card.stories.tsx`)
- 3 aesthetic levels (default, refined, liquid glass)
- Multiple content variations
- Real-world examples (form selection, progress, documents)
- Interactive states
- ~450 lines of documentation

**3. Input** (`src/components/ui/input.stories.tsx`)
- All HTML input types (text, email, password, date, etc.)
- With icons pattern
- With buttons pattern
- Validation states
- Real-world forms (personal info, address, case info)
- Accessibility showcase
- ~550 lines of documentation

### Configuration

**Storybook 10.0.8** with the following addons:
- `@chromatic-com/storybook` - Visual testing
- `@storybook/addon-docs` - Auto-generated documentation
- `@storybook/addon-onboarding` - First-time user guide
- `@storybook/addon-a11y` - Accessibility testing
- `@storybook/addon-vitest` - Component testing integration

**Custom Configuration**:
- Tailwind CSS integration
- Vite build optimization
- Path aliases (`@/`) support
- Light/dark theme backgrounds
- Toast notification support (Sonner)

---

## 🚀 Running Storybook

### Development Server

Start Storybook in development mode:

```bash
npm run storybook
```

Access at: `http://localhost:6006`

**Features**:
- Hot module reload
- Interactive controls
- Accessibility testing panel
- Component documentation
- Code snippets

### Production Build

Build static Storybook for deployment:

```bash
npm run build-storybook
```

Output: `storybook-static/` directory

**Deployment Options**:
- Vercel/Netlify static hosting
- Chromatic for visual regression testing
- GitHub Pages
- Self-hosted

---

## 📚 Documentation Structure

### Story Anatomy

Each story file includes:

```tsx
/**
 * Component Name Stories
 *
 * Brief description of component purpose and features.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Component } from './component';

const meta = {
  title: 'Components/Component',
  component: Component,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Detailed component documentation...`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Control definitions
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

// Individual stories
export const Default: Story = {
  args: {
    // Default props
  },
};
```

### Story Types

**1. Default/Primary** - Main use case
**2. Variants** - Different visual styles
**3. Sizes** - Size variations
**4. States** - Interactive states (hover, disabled, loading)
**5. Patterns** - Common usage patterns
**6. Real-World** - Actual SwiftFill examples
**7. Accessibility** - A11y showcase

---

## 🎨 Writing New Stories

### Step-by-Step Guide

**1. Create Story File**

```bash
src/components/ui/[component].stories.tsx
```

**2. Import Dependencies**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './your-component';
import { Icon1, Icon2 } from '@/icons';
```

**3. Define Meta Configuration**

```tsx
const meta = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered', // or 'fullscreen', 'padded'
    docs: {
      description: {
        component: `Your component description...`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary'],
      description: 'Component variant',
    },
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;
```

**4. Create Stories**

```tsx
export const Default: Story = {
  args: {
    children: 'Default example',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4">
      <YourComponent variant="default">Default</YourComponent>
      <YourComponent variant="secondary">Secondary</YourComponent>
    </div>
  ),
};
```

**5. Add Icon Exports (if needed)**

If you use new icons, add them to `src/icons/index.ts`:

```tsx
export {
  // ... existing icons
  YourNewIcon,
} from 'lucide-react';
```

---

## ✅ Best Practices

### DO ✅

- **Document all variants and states** - Show every possible configuration
- **Include real-world examples** - Actual usage from SwiftFill codebase
- **Add accessibility stories** - Demonstrate focus states, ARIA labels
- **Provide code snippets** - Show how to use the component
- **Use descriptive story names** - Clear, concise titles
- **Group related stories** - Use render functions for multiple examples
- **Test accessibility** - Run a11y addon on all stories

### DON'T ❌

- **Skip edge cases** - Document unusual states (empty, error, loading)
- **Use hardcoded values** - Use args and controls instead
- **Ignore mobile views** - Test responsive behavior
- **Copy-paste without context** - Each story should have purpose
- **Forget disabled states** - Always show disabled variants
- **Omit icon-only buttons** - Require ARIA labels in examples

---

## 🔧 Accessibility Testing

### Using the A11y Addon

**1. Open Storybook**
```bash
npm run storybook
```

**2. Select a Story**

Navigate to any component story (e.g., Components/Button/Default)

**3. Open Accessibility Panel**

Click "Accessibility" tab at bottom of Storybook UI

**4. Review Violations**

- **Violations**: Critical issues (must fix)
- **Passes**: Checks that passed
- **Incomplete**: Needs manual review

**5. Fix Issues**

Common violations:
- Missing ARIA labels on icon-only buttons
- Insufficient color contrast
- Missing form labels
- Improper heading hierarchy

### Manual Testing Checklist

- [ ] Tab through all interactive elements
- [ ] Verify focus ring visibility (3px offset)
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Check color contrast (4.5:1 minimum for text)
- [ ] Verify touch targets (44x44px minimum)
- [ ] Test keyboard shortcuts (Enter, Space, Esc)
- [ ] Validate ARIA attributes

---

## 📊 Component Coverage

### Current Coverage (3/60+ components)

**Documented (3)**:
- ✅ Button
- ✅ Card
- ✅ Input

**Next Priority (High Usage)**:
- ☐ Label
- ☐ Badge
- ☐ Separator
- ☐ Alert
- ☐ Dialog/Modal
- ☐ Select
- ☐ Checkbox
- ☐ RadioGroup
- ☐ Textarea
- ☐ Switch

**Lower Priority (Specialized)**:
- ☐ Accordion
- ☐ Tabs
- ☐ Toast/Sonner
- ☐ DropdownMenu
- ☐ Command
- ☐ Sheet
- ☐ Tooltip
- ☐ Popover

### Coverage Goal

**Target**: 100% of shadcn/ui components by Q1 2025

---

## 🚢 Deployment

### Chromatic (Recommended)

Chromatic provides automated visual regression testing and hosted Storybook.

**Setup**:

```bash
# Install Chromatic CLI
npm install --save-dev chromatic

# Build and publish
npx chromatic --project-token=<your-token>
```

**Benefits**:
- Automated visual regression testing
- Hosted Storybook documentation
- PR integration (comment with changes)
- Team collaboration

### Static Hosting (Vercel/Netlify)

**Build**:
```bash
npm run build-storybook
```

**Deploy**:
- Upload `storybook-static/` to hosting provider
- Configure build command: `npm run build-storybook`
- Configure publish directory: `storybook-static`

### GitHub Pages

**Setup**:

```bash
# Build Storybook
npm run build-storybook

# Deploy to gh-pages branch
npx gh-pages -d storybook-static
```

**Configure GitHub**:
- Settings → Pages → Source: gh-pages branch
- Access at: `https://<username>.github.io/<repo>`

---

## 🔮 Future Enhancements

### Planned (v2.0.0)

- [ ] **Visual regression testing** - Chromatic integration
- [ ] **Component testing** - Playwright integration via Vitest addon
- [ ] **Interaction testing** - @storybook/test utilities
- [ ] **Design tokens documentation** - Auto-generate from tokens.json
- [ ] **Component variants explorer** - Interactive variant matrix
- [ ] **Theme switching** - Live light/dark mode toggle
- [ ] **Responsive preview** - Mobile/tablet/desktop viewports
- [ ] **Code sandbox integration** - Live code editing

### Backlog

- [ ] **Multi-language support** - i18n documentation
- [ ] **Component templates** - Copy-paste ready code
- [ ] **Usage analytics** - Track most-used components
- [ ] **Figma integration** - Link to design files
- [ ] **Version history** - Component changelog

---

## 📖 Resources

**Storybook**:
- Official Docs: https://storybook.js.org/docs
- Best Practices: https://storybook.js.org/docs/writing-stories/best-practices
- Accessibility: https://storybook.js.org/docs/writing-tests/accessibility-testing

**SwiftFill Design System**:
- Design Tokens: `/design/DESIGN_TOKENS_GUIDE.md`
- Apple HIG Analysis: `/design/APPLE_HIG_COMPLIANCE_ANALYSIS.md`
- Premium Design Summary: `/design/ULTRA_PREMIUM_DESIGN_SYSTEM_SUMMARY.md`

**Component Library**:
- shadcn/ui: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com
- Tailwind CSS: https://tailwindcss.com

---

## 🤝 Contributing

### Adding New Component Stories

1. Create `[component].stories.tsx` file
2. Follow story template structure
3. Document all variants and states
4. Add real-world examples
5. Include accessibility showcase
6. Test with a11y addon
7. Run `npm run build-storybook` to verify
8. Submit PR with screenshots

### Story Review Checklist

- [ ] All variants documented
- [ ] All states shown (default, hover, disabled, etc.)
- [ ] Real-world examples included
- [ ] Accessibility story present
- [ ] Code examples provided
- [ ] Icon exports added (if needed)
- [ ] A11y tests passing
- [ ] Build succeeds without errors

---

## ❓ FAQ

**Q: Why only 3 components documented?**
A: This is the initial implementation. We're prioritizing high-usage components first (Button, Card, Input) to establish patterns before scaling to all 60+ components.

**Q: How do I run accessibility tests?**
A: Start Storybook (`npm run storybook`), open any story, and click the "Accessibility" tab at the bottom. Violations will be highlighted with fix suggestions.

**Q: Can I use Storybook in development?**
A: Yes! Storybook is excellent for isolated component development. You can develop and test components without running the full application.

**Q: How do I add a new icon?**
A: Add the icon export to `src/icons/index.ts` in alphabetical order. This centralizes icon imports and improves tree-shaking.

**Q: What about component testing?**
A: We're using Vitest for unit tests. The `@storybook/addon-vitest` addon is installed for future integration, allowing component testing directly in Storybook.

**Q: How do I deploy Storybook?**
A: Run `npm run build-storybook`, then deploy the `storybook-static/` directory to any static hosting provider (Vercel, Netlify, GitHub Pages, Chromatic).

---

**Status**: ✅ **Production Ready**
**Components Documented**: 3 (Button, Card, Input)
**Total Stories**: 45+
**Storybook Version**: 10.0.8

Co-Authored-By: Claude <noreply@anthropic.com>
