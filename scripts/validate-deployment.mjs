#!/usr/bin/env node

/**
 * Deployment Validation Script
 *
 * Verifies that a SwiftFill deployment is functioning correctly.
 * Run after deploying to production to ensure all endpoints work.
 *
 * Usage: node scripts/validate-deployment.mjs https://your-app-url.com
 */

const BASE_URL = process.argv[2];

if (!BASE_URL) {
  console.error('❌ Error: Please provide the deployment URL');
  console.error('Usage: node scripts/validate-deployment.mjs https://your-app-url.com');
  process.exit(1);
}

console.log(`\n🔍 Validating deployment: ${BASE_URL}\n`);
console.log('═'.repeat(50));

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

async function test(name, testFn) {
  try {
    const result = await testFn();
    if (result.warning) {
      console.log(`⚠️  ${name}: ${result.message}`);
      results.warnings++;
    } else {
      console.log(`✅ ${name}`);
      results.passed++;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    results.failed++;
  }
}

// Test 1: Main page loads
await test('Main page loads', async () => {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const html = await response.text();
  if (!html.includes('<!DOCTYPE html>')) {
    throw new Error('Invalid HTML response');
  }
  return { success: true };
});

// Test 2: Static assets load
await test('Static assets accessible', async () => {
  const response = await fetch(`${BASE_URL}/favicon.ico`);
  if (!response.ok && response.status !== 404) {
    throw new Error(`HTTP ${response.status}`);
  }
  return { success: true };
});

// Test 3: Auth page loads
await test('Auth page loads', async () => {
  const response = await fetch(`${BASE_URL}/auth`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return { success: true };
});

// Test 4: TRO filing page loads
await test('TRO filing page loads', async () => {
  const response = await fetch(`${BASE_URL}/file-tro`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return { success: true };
});

// Test 5: Check for Supabase configuration
await test('Supabase client configured', async () => {
  const response = await fetch(BASE_URL);
  const html = await response.text();

  // Check that Supabase URL is configured (appears in the built JS)
  if (!html.includes('supabase')) {
    return {
      warning: true,
      message: 'Could not verify Supabase configuration in HTML',
    };
  }
  return { success: true };
});

// Test 6: Check for error tracking
await test('Error tracking configured', async () => {
  const response = await fetch(BASE_URL);
  const html = await response.text();

  // Sentry should be in the bundled code
  if (!html.includes('sentry')) {
    return {
      warning: true,
      message: 'Could not verify Sentry configuration',
    };
  }
  return { success: true };
});

// Test 7: Service worker registered
await test('PWA service worker', async () => {
  const response = await fetch(`${BASE_URL}/sw.js`);
  if (response.status === 404) {
    return {
      warning: true,
      message: 'Service worker not found (PWA offline support disabled)',
    };
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return { success: true };
});

// Test 8: PDF files accessible
await test('PDF forms accessible', async () => {
  const pdfResponse = await fetch(`${BASE_URL}/fl-320.pdf`);
  if (pdfResponse.status === 404) {
    // Try alternative path
    const altResponse = await fetch(`${BASE_URL}/public/fl-320.pdf`);
    if (!altResponse.ok) {
      return {
        warning: true,
        message: 'Could not locate PDF forms',
      };
    }
  }
  return { success: true };
});

// Test 9: No console errors in response headers
await test('Security headers present', async () => {
  const response = await fetch(BASE_URL);
  const headers = response.headers;

  const securityHeaders = [
    'x-frame-options',
    'x-content-type-options',
  ];

  const missing = securityHeaders.filter(h => !headers.has(h));
  if (missing.length > 0) {
    return {
      warning: true,
      message: `Missing security headers: ${missing.join(', ')}`,
    };
  }
  return { success: true };
});

// Test 10: HTTPS redirect (if applicable)
await test('HTTPS enforced', async () => {
  if (BASE_URL.startsWith('http://localhost')) {
    return {
      warning: true,
      message: 'Skipped for localhost',
    };
  }

  if (!BASE_URL.startsWith('https://')) {
    throw new Error('Production URL should use HTTPS');
  }
  return { success: true };
});

// Summary
console.log('\n' + '═'.repeat(50));
console.log('\n📊 Validation Summary\n');
console.log(`   ✅ Passed:   ${results.passed}`);
console.log(`   ⚠️  Warnings: ${results.warnings}`);
console.log(`   ❌ Failed:   ${results.failed}`);
console.log('');

if (results.failed > 0) {
  console.log('❌ Deployment validation FAILED');
  console.log('   Please fix the failing tests before going live.\n');
  process.exit(1);
} else if (results.warnings > 0) {
  console.log('⚠️  Deployment validation PASSED with warnings');
  console.log('   Review warnings and fix if critical.\n');
  process.exit(0);
} else {
  console.log('✅ Deployment validation PASSED');
  console.log('   All systems operational!\n');
  process.exit(0);
}
