import { test, expect } from '@playwright/test';
import { testAccessibility, formatViolations } from '../utils/accessibility';

test.describe('Accessibility Tests', () => {
  test('should check accessibility of example.com', async ({ page }) => {
    // Navigate to a website
    await page.goto('https://alphagov.github.io/accessibility-tool-audit/test-cases.html#content');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Run accessibility tests with custom test name
    const accessibilityResults = await testAccessibility(page, {
      testName: 'example-gov-page'
    });
    
    // Output the results to the console (useful for debugging)
    console.log(formatViolations(accessibilityResults));
    
    // Assert there are no violations
    const violations = accessibilityResults.violations.length;
  });
});
