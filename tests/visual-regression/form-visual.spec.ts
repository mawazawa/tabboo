import { test, expect } from '@playwright/test';

// Form types to test
const FORMS = ['FL-320', 'DV-100', 'DV-105'] as const;

// Test data for form filling
const TEST_DATA = {
  partyName: 'Jane Smith',
  streetAddress: '123 Main Street',
  city: 'Los Angeles',
  state: 'CA',
  zipCode: '90001',
  telephoneNo: '(555) 123-4567',
  email: 'jane.smith@example.com',
  caseNumber: 'FL12345678',
  county: 'Los Angeles',
  petitioner: 'John Doe',
  respondent: 'Jane Smith',
};

test.describe('PDF Form Visual Regression', () => {
  test.describe.configure({ mode: 'serial' });

  for (const formType of FORMS) {
    test(`${formType} - Visual snapshot comparison`, async ({ page }) => {
      // Navigate to form viewer
      await page.goto(`/?form=${formType}`);

      // Wait for PDF to load
      await page.waitForSelector('.react-pdf__Page', { timeout: 15000 });
      await page.waitForTimeout(2000); // Wait for fields to render

      // Take baseline screenshot for pixel comparison
      await expect(page).toHaveScreenshot(`${formType}-page1.png`, {
        fullPage: false,
        animations: 'disabled',
      });
    });

    test(`${formType} - Field quality analysis with Claude Vision`, async ({ page }) => {
      // Skip if no API key (for local dev without Claude)
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        test.skip();
        return;
      }

      // Navigate to form viewer
      await page.goto(`/?form=${formType}`);

      // Wait for PDF to load
      await page.waitForSelector('.react-pdf__Page', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Take screenshot
      const screenshot = await page.screenshot({
        fullPage: false,
        type: 'png',
      });

      // Analyze with Claude Vision
      const analysis = await analyzeWithClaudeVision(
        apiKey,
        formType,
        screenshot.toString('base64')
      );

      // Quality assertions
      expect(analysis.overallScore, `Overall score for ${formType}`).toBeGreaterThanOrEqual(7);
      expect(analysis.issues.critical, `Critical issues in ${formType}`).toHaveLength(0);

      // Log results
      console.log(`\n📊 ${formType} Analysis Results:`);
      console.log(`   Overall Score: ${analysis.overallScore}/10`);
      console.log(`   Positioning: ${analysis.metrics.positioning}/10`);
      console.log(`   Sizing: ${analysis.metrics.sizing}/10`);
      console.log(`   Legibility: ${analysis.metrics.legibility}/10`);

      if (analysis.issues.warnings.length > 0) {
        console.log(`   ⚠️ Warnings:`);
        analysis.issues.warnings.forEach((w: any) => {
          console.log(`      - ${w.field}: ${w.issue}`);
        });
      }

      if (analysis.recommendations.length > 0) {
        console.log(`   💡 Recommendations:`);
        analysis.recommendations.forEach((r: string) => {
          console.log(`      - ${r}`);
        });
      }
    });
  }
});

async function analyzeWithClaudeVision(
  apiKey: string,
  formType: string,
  screenshotBase64: string
): Promise<FormAnalysis> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: screenshotBase64,
              },
            },
            {
              type: 'text',
              text: `You are a QA expert reviewing a California Judicial Council form (${formType}) with fillable field overlays.

Analyze this screenshot and check for:

## Critical Issues (must fix - score 0 if any found):
1. Fields positioned completely outside their intended boxes
2. Text visibly overflowing field boundaries
3. Checkboxes that appear round/circular instead of square/rectangular
4. Fields that are dramatically too large (covering multiple lines)
5. Overlapping fields that obscure each other
6. Required fields completely missing

## Warnings (should fix):
1. Text not properly aligned within fields
2. Font size too small or too large for the field
3. Fields slightly misaligned with PDF lines
4. Inconsistent field heights across similar fields

## Quality Metrics (1-10 each):
- Positioning: Are fields in correct locations?
- Sizing: Are field dimensions appropriate?
- Legibility: Is text readable and properly formatted?
- Alignment: Are fields aligned with PDF grid?

Respond ONLY with this JSON (no other text):
{
  "overallScore": 8,
  "metrics": {
    "positioning": 9,
    "sizing": 7,
    "legibility": 9,
    "alignment": 8
  },
  "issues": {
    "critical": [
      {"field": "fieldName", "issue": "description", "page": 1}
    ],
    "warnings": [
      {"field": "fieldName", "issue": "description", "page": 1}
    ]
  },
  "recommendations": [
    "Specific actionable fix"
  ]
}`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Claude response:', text);
    throw new Error('Failed to parse Claude analysis response');
  }

  return JSON.parse(jsonMatch[0]);
}

interface FormAnalysis {
  overallScore: number;
  metrics: {
    positioning: number;
    sizing: number;
    legibility: number;
    alignment: number;
  };
  issues: {
    critical: Array<{ field: string; issue: string; page: number }>;
    warnings: Array<{ field: string; issue: string; page: number }>;
  };
  recommendations: string[];
}
