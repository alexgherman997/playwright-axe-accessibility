const fs = require('fs');
const path = require('path');

/**
 * Axe HTML Reporter
 * Generates a comprehensive HTML report from all JSON files in the AxeResults directory
 */

const AXERESULTS_DIR = path.join(process.cwd(), 'axeResults');
const OUTPUT_FILE = path.join(AXERESULTS_DIR, 'accessibility-report.html');

function getImpactColor(impact) {
  const colors = {
    critical: '#dc3545',
    serious: '#fd7e14',
    moderate: '#ffc107',
    minor: '#17a2b8'
  };
  return colors[impact] || '#6c757d';
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function calculateViolationBreakdown(violations) {
  const breakdown = {
    critical: { count: 0, nodes: 0 },
    serious: { count: 0, nodes: 0 },
    moderate: { count: 0, nodes: 0 },
    minor: { count: 0, nodes: 0 }
  };

  violations.forEach(violation => {
    const impact = violation.impact;
    if (breakdown[impact]) {
      breakdown[impact].count++;
      breakdown[impact].nodes += violation.nodes.length;
    }
  });

  return breakdown;
}

function generateViolationHtml(violation, index) {
  return `
    <div class="violation-item" style="border-left: 4px solid ${getImpactColor(violation.impact)}; margin-bottom: 20px; padding: 15px; background: #f8f9fa;">
      <h4 style="color: ${getImpactColor(violation.impact)}; margin: 0 0 10px 0;">
        ${index + 1}. ${violation.id}: ${violation.help}
      </h4>
      <div style="margin-bottom: 10px;">
        <span style="background: ${getImpactColor(violation.impact)}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8em;">
          ${violation.impact.toUpperCase()}
        </span>
      </div>
      <p><strong>Description:</strong> ${violation.description}</p>
      <p><strong>WCAG Guidelines:</strong> ${violation.tags.filter(tag => tag.startsWith('wcag')).join(', ')}</p>
      <p><strong>Help URL:</strong> <a href="${violation.helpUrl}" target="_blank">${violation.helpUrl}</a></p>
      <details style="margin-top: 10px;">
        <summary><strong>Affected Elements (${violation.nodes.length})</strong></summary>
        <div style="margin-top: 10px;">
          ${violation.nodes.map((node, nodeIndex) => `
            <div style="background: white; padding: 10px; margin: 5px 0; border-radius: 3px;">
              <strong>Element ${nodeIndex + 1}:</strong>
              <pre style="background: #f1f1f1; padding: 10px; border-radius: 3px; overflow-x: auto;"><code>${node.html}</code></pre>
              <p><strong>Issue:</strong> ${node.failureSummary}</p>
              ${node.target ? `<p><strong>Selector:</strong> ${node.target.join(', ')}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </details>
    </div>
  `;
}

function generateTestResultHtml(testData) {
  const { timestamp, url, testName, results } = testData;
  const violationCount = results.violations ? results.violations.length : 0;
  const passedCount = results.passes ? results.passes.length : 0;
  const inaccessibleCount = results.inapplicable ? results.inapplicable.length : 0;
  const incompleteCount = results.incomplete ? results.incomplete.length : 0;

  // Calculate violation breakdown by severity
  const violationBreakdown = calculateViolationBreakdown(results.violations || []);
  const totalNodes = Object.values(violationBreakdown).reduce((sum, item) => sum + item.nodes, 0);

  return `
    <div class="test-result" style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 30px; overflow: hidden;">
      <div class="test-header" style="background: ${violationCount === 0 ? '#d4edda' : '#f8d7da'}; padding: 20px; border-bottom: 1px solid #dee2e6;">
        <h2 style="margin: 0 0 10px 0; color: ${violationCount === 0 ? '#155724' : '#721c24'};">
          ${testName}
        </h2>
        <p style="margin: 0; color: #6c757d;"><strong>URL:</strong> ${url}</p>
        <p style="margin: 5px 0 0 0; color: #6c757d;"><strong>Tested:</strong> ${formatTimestamp(timestamp)}</p>
        
        <div style="display: flex; gap: 20px; margin-top: 15px; flex-wrap: wrap;">
          <div style="background: ${violationCount === 0 ? '#c3e6cb' : '#f5c6cb'}; padding: 10px; border-radius: 5px;">
            <strong>${violationCount}</strong> Violations
          </div>
          <div style="background: #d1ecf1; padding: 10px; border-radius: 5px;">
            <strong>${passedCount}</strong> Passed
          </div>
          <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
            <strong>${inaccessibleCount}</strong> Inapplicable
          </div>
          <div style="background: #fff3cd; padding: 10px; border-radius: 5px;">
            <strong>${incompleteCount}</strong> Incomplete
          </div>
        </div>

        ${violationCount > 0 ? `
        <div style="margin-top: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #721c24;">Violation Breakdown by Severity</h4>
          <div style="background: white; border-radius: 5px; overflow: hidden; border: 1px solid #dee2e6;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #dee2e6; color: #dc3545;">Critical</th>
                  <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #dee2e6; color: #fd7e14;">Serious</th>
                  <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #dee2e6; color: #ffc107;">Moderate</th>
                  <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #dee2e6; color: #17a2b8;">Minor</th>
                  <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #dee2e6; color: #6c757d;">Total (Nodes)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #dee2e6;">
                    <div style="color: #dc3545; font-weight: bold;">${violationBreakdown.critical.count}</div>
                    <div style="font-size: 0.8em; color: #6c757d;">(${violationBreakdown.critical.nodes} nodes)</div>
                  </td>
                  <td style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #dee2e6;">
                    <div style="color: #fd7e14; font-weight: bold;">${violationBreakdown.serious.count}</div>
                    <div style="font-size: 0.8em; color: #6c757d;">(${violationBreakdown.serious.nodes} nodes)</div>
                  </td>
                  <td style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #dee2e6;">
                    <div style="color: #ffc107; font-weight: bold;">${violationBreakdown.moderate.count}</div>
                    <div style="font-size: 0.8em; color: #6c757d;">(${violationBreakdown.moderate.nodes} nodes)</div>
                  </td>
                  <td style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #dee2e6;">
                    <div style="color: #17a2b8; font-weight: bold;">${violationBreakdown.minor.count}</div>
                    <div style="font-size: 0.8em; color: #6c757d;">(${violationBreakdown.minor.nodes} nodes)</div>
                  </td>
                  <td style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #dee2e6;">
                    <div style="color: #6c757d; font-weight: bold;">${violationCount}</div>
                    <div style="font-size: 0.8em; color: #6c757d;">(${totalNodes} nodes)</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}
      </div>
      
      <div class="test-content" style="padding: 20px;">
        ${violationCount === 0 ? 
          '<div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; text-align: center;"><strong>🎉 No accessibility violations found!</strong></div>' :
          `<div class="violations">
            <h3 style="color: #dc3545; margin-bottom: 20px;">Accessibility Violations (${violationCount})</h3>
            ${results.violations.map((violation, index) => generateViolationHtml(violation, index)).join('')}
          </div>`
        }
      </div>
    </div>
  `;
}

function generateHtmlReport() {
  console.log('🔍 Scanning for accessibility test results...');
  
  if (!fs.existsSync(AXERESULTS_DIR)) {
    console.error('❌ axeResults directory not found!');
    process.exit(1);
  }

  // Read all JSON files from axeResults directory
  const files = fs.readdirSync(AXERESULTS_DIR)
    .filter(file => file.endsWith('-results.json'))
    .sort((a, b) => {
      // Sort by file modification time (newest first)
      const statA = fs.statSync(path.join(AXERESULTS_DIR, a));
      const statB = fs.statSync(path.join(AXERESULTS_DIR, b));
      return statB.mtime - statA.mtime;
    });

  if (files.length === 0) {
    console.log('⚠️  No accessibility test results found.');
    process.exit(0);
  }

  console.log(`📊 Found ${files.length} test result(s). Generating report...`);

  // Parse all test results
  const testResults = files.map(file => {
    const filePath = path.join(AXERESULTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  });

  // Calculate summary statistics
  const totalViolations = testResults.reduce((sum, test) => sum + (test.results.violations?.length || 0), 0);
  const totalPassed = testResults.reduce((sum, test) => sum + (test.results.passes?.length || 0), 0);
  const testsWithViolations = testResults.filter(test => test.results.violations?.length > 0).length;

  // Calculate overall violation breakdown by severity
  const allViolations = testResults.flatMap(test => test.results.violations || []);
  const overallBreakdown = calculateViolationBreakdown(allViolations);
  const overallTotalNodes = Object.values(overallBreakdown).reduce((sum, item) => sum + item.nodes, 0);

  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .summary {
            display: flex;
            justify-content: space-around;
            padding: 20px;
            background: #f8f9fa;
            margin: 20px;
            border-radius: 8px;
            flex-wrap: wrap;
        }
        .summary-item {
            text-align: center;
            padding: 10px;
        }
        .summary-number {
            font-size: 2em;
            font-weight: bold;
            display: block;
        }
        .content {
            padding: 20px;
        }
        pre code {
            font-size: 0.9em;
        }
        details summary {
            cursor: pointer;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Accessibility Test Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <span class="summary-number" style="color: #dc3545;">${totalViolations}</span>
                <span>Total Violations</span>
            </div>
            <div class="summary-item">
                <span class="summary-number" style="color: #28a745;">${totalPassed}</span>
                <span>Total Passed</span>
            </div>
            <div class="summary-item">
                <span class="summary-number" style="color: #007bff;">${testResults.length}</span>
                <span>Tests Run</span>
            </div>
            <div class="summary-item">
                <span class="summary-number" style="color: ${testsWithViolations === 0 ? '#28a745' : '#dc3545'};">${testsWithViolations}</span>
                <span>Tests with Issues</span>
            </div>
        </div>

        ${totalViolations > 0 ? `
        <div style="margin: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #dee2e6;">
                <h3 style="margin: 0; color: #495057;">📊 Overall Violation Breakdown by Severity</h3>
            </div>
            <div style="padding: 20px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 1.1em;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 12px; text-align: center; border: 1px solid #dee2e6; color: #dc3545;">Critical</th>
                            <th style="padding: 12px; text-align: center; border: 1px solid #dee2e6; color: #fd7e14;">Serious</th>
                            <th style="padding: 12px; text-align: center; border: 1px solid #dee2e6; color: #ffc107;">Moderate</th>
                            <th style="padding: 12px; text-align: center; border: 1px solid #dee2e6; color: #17a2b8;">Minor</th>
                            <th style="padding: 12px; text-align: center; border: 1px solid #dee2e6; color: #6c757d;">Total (Nodes)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 15px; text-align: center; border: 1px solid #dee2e6;">
                                <div style="color: #dc3545; font-weight: bold; font-size: 1.5em;">${overallBreakdown.critical.count}</div>
                                <div style="font-size: 0.9em; color: #6c757d;">(${overallBreakdown.critical.nodes} nodes)</div>
                            </td>
                            <td style="padding: 15px; text-align: center; border: 1px solid #dee2e6;">
                                <div style="color: #fd7e14; font-weight: bold; font-size: 1.5em;">${overallBreakdown.serious.count}</div>
                                <div style="font-size: 0.9em; color: #6c757d;">(${overallBreakdown.serious.nodes} nodes)</div>
                            </td>
                            <td style="padding: 15px; text-align: center; border: 1px solid #dee2e6;">
                                <div style="color: #ffc107; font-weight: bold; font-size: 1.5em;">${overallBreakdown.moderate.count}</div>
                                <div style="font-size: 0.9em; color: #6c757d;">(${overallBreakdown.moderate.nodes} nodes)</div>
                            </td>
                            <td style="padding: 15px; text-align: center; border: 1px solid #dee2e6;">
                                <div style="color: #17a2b8; font-weight: bold; font-size: 1.5em;">${overallBreakdown.minor.count}</div>
                                <div style="font-size: 0.9em; color: #6c757d;">(${overallBreakdown.minor.nodes} nodes)</div>
                            </td>
                            <td style="padding: 15px; text-align: center; border: 1px solid #dee2e6;">
                                <div style="color: #6c757d; font-weight: bold; font-size: 1.5em;">${totalViolations}</div>
                                <div style="font-size: 0.9em; color: #6c757d;">(${overallTotalNodes} nodes)</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}
        
        <div class="content">
            <h2>Test Results</h2>
            ${testResults.map(testData => generateTestResultHtml(testData)).join('')}
        </div>
        
        <div class="footer">
            <p>This report was generated automatically by the Axe HTML Reporter</p>
            <p>Powered by <a href="https://www.deque.com/axe/" target="_blank">axe-core</a> and <a href="https://playwright.dev/" target="_blank">Playwright</a></p>
        </div>
    </div>
</body>
</html>
  `;

  // Write the HTML report
  fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
  console.log(`✅ HTML report generated: ${OUTPUT_FILE}`);
  console.log(`📈 Summary: ${testResults.length} tests, ${totalViolations} violations, ${totalPassed} passed checks`);
}

// Run the reporter
try {
  generateHtmlReport();
} catch (error) {
  console.error('❌ Error generating HTML report:', error.message);
  process.exit(1);
}
