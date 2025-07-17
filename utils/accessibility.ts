import { Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Options for accessibility testing
 */
export interface AccessibilityTestOptions {
  /**
   * Include specific selectors to analyze (CSS selectors)
   */
  include?: string[];
  /**
   * Exclude specific selectors from analysis (CSS selectors)
   */
  exclude?: string[];
  /**
   * Filter by specific WCAG rule tags (e.g., ['wcag2a', 'wcag2aa', 'wcag21a'])
   */
  tags?: string[];
  /**
   * Custom test name for file naming (optional)
   */
  testName?: string;
}

/**
 * Tests the accessibility of a page using axe-core
 * 
 * @param page - Playwright page object
 * @param options - Options for accessibility testing
 * @returns Promise with axe results
 */
export async function testAccessibility(page: Page, options: AccessibilityTestOptions = {}) {
  // Create timestamp for unique file naming
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testName = options.testName || 'accessibility-test';
  const baseFilename = `${testName}-${timestamp}`;
  
  // Ensure axeResults directory exists
  const axeResultsDir = path.join(process.cwd(), 'axeResults');
  if (!fs.existsSync(axeResultsDir)) {
    fs.mkdirSync(axeResultsDir, { recursive: true });
  }
  
  // 1. Take a screenshot before running axe
  const screenshotPath = path.join(axeResultsDir, `${baseFilename}-screenshot.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot saved: ${screenshotPath}`);
  
  // 3. Save the HTML content of the page
  const htmlContent = await page.content();
  const htmlPath = path.join(axeResultsDir, `${baseFilename}-page-content.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`📄 Page HTML saved: ${htmlPath}`);
  
  // Run axe accessibility tests
  let builder = new AxeBuilder({ page })
    .withTags(options.tags || ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']);
  
  if (options.include) {
    builder = builder.include(options.include);
  }
  
  if (options.exclude) {
    builder = builder.exclude(options.exclude);
  }
  
  const results = await builder.analyze();
  
  // 2. Save the accessibility results as JSON
  const jsonPath = path.join(axeResultsDir, `${baseFilename}-results.json`);
  const resultData = {
    timestamp: new Date().toISOString(),
    url: page.url(),
    testName,
    options,
    results
  };
  fs.writeFileSync(jsonPath, JSON.stringify(resultData, null, 2), 'utf8');
  console.log(`📊 Accessibility results saved: ${jsonPath}`);
  
  return results;
}

/**
 * Creates a formatted summary of accessibility violations
 * 
 * @param results - The axe results object
 * @returns A formatted string with violation details
 */
export function formatViolations(results: any): string {
  if (!results.violations || results.violations.length === 0) {
    return 'No accessibility violations found.';
  }

  const summary = [`Found ${results.violations.length} accessibility violations:`];
  
  results.violations.forEach((violation: any, index: number) => {
    summary.push(`\n${index + 1}. ${violation.id}: ${violation.help} (Impact: ${violation.impact})`);
    summary.push(`   Description: ${violation.description}`);
    summary.push(`   WCAG: ${violation.tags.filter((tag: string) => tag.startsWith('wcag')).join(', ')}`);
    summary.push(`   Help URL: ${violation.helpUrl}`);
    summary.push(`   Affected nodes: ${violation.nodes.length}`);
    
    violation.nodes.forEach((node: any, nodeIndex: number) => {
      if (nodeIndex < 3) { // Limit to first 3 nodes to avoid overly long output
        summary.push(`     - ${node.html}`);
        summary.push(`       ${node.failureSummary}`);
      }
    });
    
    if (violation.nodes.length > 3) {
      summary.push(`     ... and ${violation.nodes.length - 3} more`);
    }
  });
  
  return summary.join('\n');
}
