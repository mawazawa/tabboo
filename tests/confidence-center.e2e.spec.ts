import { test, expect } from '@playwright/test';

const mockCandidates = [
  {
    id: 'dup-person-1-2',
    question: 'Are "Jon Smith" and "John Smith" the same person?',
    suggestedAnswers: ['Yes, they are the same', 'No, they are different people', 'They are related, but different'],
    importance: 8,
    type: 'DUPLICATE_PERSON',
  },
  {
    id: 'amb-addr-3-4',
    question: 'Does Jane Doe live at 123 Main St?',
    suggestedAnswers: ['Yes', 'No', "It's a previous address"],
    importance: 6,
    type: 'AMBIGUOUS_ADDRESS',
  },
];

test.describe('Confidence Center E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the GET API endpoint before navigating to the page
    await page.route('**/api/clarification-api', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCandidates),
        });
      } else {
        // For POST requests, let them pass through or mock a success response
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
        });
      }
    });
    await page.goto('/');
  });

  test('should open the panel, display questions, and submit an answer', async ({ page }) => {
    // 1. Check if the icon is visible with the correct badge count
    const icon = page.locator('button[aria-label="Open AI Confidence Center"]');
    await expect(icon).toBeVisible();
    await expect(icon.locator('span')).toHaveText(String(mockCandidates.length));

    // 2. Open the panel
    await icon.click();

    // 3. Verify the panel is open and shows the questions
    const panel = page.locator('div:text("AI Confidence Center")');
    await expect(panel).toBeVisible();
    await expect(page.locator('div.p-4.space-y-4.overflow-y-auto > div')).toHaveCount(mockCandidates.length);

    // 4. Interact with the first card
    const firstCard = page.locator('div.p-4.space-y-4.overflow-y-auto > div').first();
    await expect(firstCard.locator('p')).toHaveText(mockCandidates[0].question);

    // Capture the POST request
    const postPromise = page.waitForRequest('**/api/clarification-api');
    
    // Select the first answer
    await firstCard.locator('button:text("Yes, they are the same")').click();

    // Click "Apply Next"
    await firstCard.locator('button:text("Apply Next")').click();

    // 5. Verify the POST request
    const postRequest = await postPromise;
    expect(postRequest.method()).toBe('POST');
    const postData = JSON.parse(postRequest.postData() as string);
    expect(postData).toEqual({
      candidateId: mockCandidates[0].id,
      answer: 'Yes, they are the same',
      recalibrate: false,
    });
    
    // 6. Verify the card is removed from the UI (optimistic update)
    await expect(page.locator('div.p-4.space-y-4.overflow-y-auto > div')).toHaveCount(mockCandidates.length - 1);
  });
});
