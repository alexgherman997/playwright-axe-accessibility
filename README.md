# Playwright Accessibility Testing with axe-core

This project demonstrates how to integrate axe-core with Playwright for automated accessibility testing.

## Features

- Automated accessibility testing using Playwright and axe-core
- WCAG 2.0 and 2.1 compliance testing 
- Customizable tests with options to include/exclude elements
- Detailed reporting of accessibility violations
- **NEW**: Automatic capture of screenshots, HTML content, and JSON results
- **NEW**: Comprehensive HTML reporting with visual violation details

## Prerequisites

- Node.js (version 14 or higher)
- npm

## Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd playwright-axe-accessibility
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Tests

Run all accessibility tests:

```
npm test
```

Run accessibility tests specifically:

```
npm run test:accessibility
```

Run tests with the UI mode:

```
npx playwright test --ui
```

Run tests only in a specific browser:

```
npx playwright test --project=chromium
```

Generate an HTML report from test results:

```
npm run axe:report:html
```

## Test Artifacts

Every accessibility test automatically generates the following files in the `axeResults` folder:

1. **Screenshot** (`*-screenshot.png`) - Full page screenshot taken before running accessibility tests
2. **JSON Results** (`*-results.json`) - Complete accessibility test results with metadata
3. **HTML Content** (`*-page-content.html`) - Full HTML content of the tested page
4. **HTML Report** (`accessibility-report.html`) - Comprehensive visual report (generated with `npm run axe:report:html`)

## Project Structure

- `/tests` - Contains all test files
- `/utils` - Contains the accessibility testing utilities
- `/axeResults` - Contains test artifacts (screenshots, JSON results, HTML content)
- `/scripts` - Contains the HTML report generator
- `/playwright.config.ts` - Playwright configuration

## How to Create Your Own Tests

1. Create a new test file in the `/tests` directory
2. Import the accessibility utilities:

```typescript
import { testAccessibility, formatViolations } from '../utils/accessibility';
```

3. Write your test using the Playwright test framework:

```typescript
import { test, expect } from '@playwright/test';
import { testAccessibility, formatViolations } from '../utils/accessibility';

test('should check accessibility of my website', async ({ page }) => {
  await page.goto('https://my-website.com/');
  await page.waitForLoadState('networkidle');
  
  const accessibilityResults = await testAccessibility(page, {
    testName: 'my-website-homepage' // Optional: custom name for better file organization
  });
  console.log(formatViolations(accessibilityResults));
  
  const violations = accessibilityResults.violations.length;
  expect(violations, formatViolations(accessibilityResults)).toBe(0);
});
```

## Customizing Accessibility Tests

You can customize the accessibility tests using the options parameter:

```typescript
const accessibilityResults = await testAccessibility(page, {
  // Only test specific elements
  include: ['main', 'nav', 'footer'],
  
  // Exclude certain elements from testing
  exclude: ['.advertisement', '.non-essential'],
  
  // Only test for specific WCAG criteria
  tags: ['wcag2a', 'wcag2aa', 'best-practice'],
  
  // Custom test name for better file organization
  testName: 'specific-sections-test'
});
```

## Available WCAG Tags

- `wcag2a` - WCAG 2.0 Level A
- `wcag2aa` - WCAG 2.0 Level AA
- `wcag21a` - WCAG 2.1 Level A
- `wcag21aa` - WCAG 2.1 Level AA
- `best-practice` - Best practices beyond WCAG requirements

## License

MIT
