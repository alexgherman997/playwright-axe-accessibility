# Playwright Accessibility Testing with axe-core

This project demonstrates how to integrate axe-core with Playwright for automated accessibility testing.

## Features

- Automated accessibility testing using Playwright and axe-core
- WCAG 2.0 and 2.1 compliance testing 
- Customizable tests with options to include/exclude elements
- Detailed reporting of accessibility violations
- Automatic capture of screenshots, HTML content, and JSON results
- Comprehensive HTML reporting with visual violation details

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

Run accessibility tests specifically:

```
npm run test:accessibility
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
