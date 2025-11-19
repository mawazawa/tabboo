#!/usr/bin/env node

/**
 * W3C Design Tokens to CSS Custom Properties Transformer
 *
 * Converts W3C Design Tokens (2025.10 spec) into CSS custom properties.
 * Supports:
 * - Token references ({foundation.color.blue.500})
 * - Composite types (shadow, typography)
 * - Theme inheritance (dark mode)
 * - HSL color output
 *
 * Usage:
 *   node tokens-to-css.js
 *   Output: tokens.css, tokens.dark.css
 */

const fs = require('fs');
const path = require('path');

// Read token files
const lightTokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));
const darkTokens = JSON.parse(fs.readFileSync('./tokens.dark.json', 'utf8'));

/**
 * Resolve token reference (e.g., "{foundation.color.blue.500}")
 */
function resolveReference(ref, tokens) {
  if (!ref.startsWith('{') || !ref.endsWith('}')) {
    return ref;
  }

  const path = ref.slice(1, -1).split('.');
  let value = tokens;

  for (const key of path) {
    if (!value || !value[key]) {
      console.warn(`Warning: Cannot resolve reference ${ref}`);
      return ref;
    }
    value = value[key];
  }

  return value.$value !== undefined ? value.$value : value;
}

/**
 * Convert shadow object/array to CSS shadow string
 */
function shadowToCSS(shadow) {
  if (Array.isArray(shadow)) {
    return shadow.map(s =>
      `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread || '0px'} ${s.color}`
    ).join(', ');
  }
  return `${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread || '0px'} ${shadow.color}`;
}

/**
 * Convert typography object to CSS declarations
 */
function typographyToCSS(typography) {
  return {
    'font-family': typography.fontFamily,
    'font-size': typography.fontSize,
    'font-weight': typography.fontWeight,
    'line-height': typography.lineHeight
  };
}

/**
 * Convert cubicBezier array to CSS string
 */
function cubicBezierToCSS(bezier) {
  return `cubic-bezier(${bezier.join(', ')})`;
}

/**
 * Flatten token object into CSS custom properties
 */
function flattenTokens(obj, prefix = '', tokens, results = {}) {
  for (const [key, value] of Object.entries(obj)) {
    // Skip meta properties
    if (key.startsWith('$')) continue;

    const propName = prefix ? `${prefix}-${key}` : key;

    if (value.$value !== undefined) {
      let cssValue = value.$value;

      // Resolve references
      if (typeof cssValue === 'string') {
        cssValue = resolveReference(cssValue, tokens);
      }

      // Handle different types
      if (value.$type === 'shadow') {
        cssValue = shadowToCSS(cssValue);
      } else if (value.$type === 'typography') {
        // Typography creates multiple properties
        const typoCSS = typographyToCSS(cssValue);
        for (const [cssProp, cssVal] of Object.entries(typoCSS)) {
          results[`--${propName}-${cssProp}`] = cssVal;
        }
        continue;
      } else if (value.$type === 'cubicBezier') {
        cssValue = cubicBezierToCSS(cssValue);
      } else if (value.$type === 'duration') {
        // Already in ms format
      }

      results[`--${propName}`] = cssValue;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Recurse into nested groups
      flattenTokens(value, propName, tokens, results);
    }
  }

  return results;
}

/**
 * Generate CSS from tokens
 */
function generateCSS(tokens, selector = ':root') {
  const flatTokens = flattenTokens(tokens, '', tokens);

  let css = `${selector} {\n`;
  for (const [prop, value] of Object.entries(flatTokens)) {
    css += `  ${prop}: ${value};\n`;
  }
  css += `}\n`;

  return css;
}

// Generate light mode CSS
const lightCSS = `/**
 * SwiftFill Design Tokens - Light Mode
 * Generated from W3C Design Tokens v1.0 (2025.10 spec)
 *
 * Three-tier hierarchy:
 *   foundation.* - Raw values (colors, spacing, etc.)
 *   alias.* - Semantic mappings (text, surface, brand)
 *   component.* - Component-specific tokens (button, card, input)
 */

${generateCSS(lightTokens, ':root')}`;

// Generate dark mode CSS
const darkCSS = `/**
 * SwiftFill Design Tokens - Dark Mode
 * Overrides for dark theme
 */

@media (prefers-color-scheme: dark) {
${generateCSS(darkTokens, '  :root')}
}

[data-theme="dark"] {
${generateCSS(darkTokens, '')}
}`;

// Write files
fs.writeFileSync('./tokens.css', lightCSS);
fs.writeFileSync('./tokens.dark.css', darkCSS);

console.log('✅ Generated CSS custom properties:');
console.log('   - tokens.css (light mode)');
console.log('   - tokens.dark.css (dark mode)');
console.log('');
console.log('📊 Token Count:');
const lightCount = Object.keys(flattenTokens(lightTokens, '', lightTokens)).length;
const darkCount = Object.keys(flattenTokens(darkTokens, '', darkTokens)).length;
console.log(`   - Light mode: ${lightCount} tokens`);
console.log(`   - Dark mode: ${darkCount} overrides`);
console.log('');
console.log('💡 Usage:');
console.log('   import "./design/tokens.css";');
console.log('   import "./design/tokens.dark.css";');
console.log('');
console.log('   color: var(--alias-color-text-primary);');
console.log('   background: var(--component-button-primary-background);');
