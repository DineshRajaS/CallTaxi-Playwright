import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';

export interface TestSuite {
  name: string;
  tests: number;
  failures: number;
  errors: number;
  skipped: number;
  time: number;
  passRate: number;
}

export interface ReleaseReadinessMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errorTests: number;
  skippedTests: number;
  passRate: number;
  failureRate: number;
  testCoverage: number;
  executionTime: number;
  readinessScore: number;
  qualityGrade: string;
  timestamp: string;
  suites: TestSuite[];
}

export class ReleaseReadinessScoreCalculator {
  private xmlPath: string;
  private metrics: ReleaseReadinessMetrics | null = null;

  constructor(xmlPath: string) {
    this.xmlPath = xmlPath;
  }

  private parseXmlReport(): TestSuite[] {
    const xmlContent = fs.readFileSync(this.xmlPath, 'utf-8');
    const suites: TestSuite[] = [];
    const suiteRegex = /<testsuite\s+name="([^"]+)"[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*skipped="(\d+)"[^>]*time="([\d.]+)"[^>]*errors="(\d+)"/g;
    let match: RegExpExecArray | null;

    while ((match = suiteRegex.exec(xmlContent)) !== null) {
      const [, name, tests, failures, skipped, time, errors] = match;
      const passedTests = parseInt(tests, 10) - parseInt(failures, 10) - parseInt(errors, 10) - parseInt(skipped, 10);
      const passRate = parseInt(tests, 10) > 0 ? (passedTests / parseInt(tests, 10)) * 100 : 0;

      suites.push({
        name: name.replace(/\\/g, ' / '),
        tests: parseInt(tests, 10),
        failures: parseInt(failures, 10),
        errors: parseInt(errors, 10),
        skipped: parseInt(skipped, 10),
        time: parseFloat(time),
        passRate: Math.round(passRate * 100) / 100,
      });
    }

    return suites;
  }

  public calculateMetrics(): ReleaseReadinessMetrics {
    const suites = this.parseXmlReport();
    const totalTests = suites.reduce((sum, s) => sum + s.tests, 0);
    const totalFailures = suites.reduce((sum, s) => sum + s.failures, 0);
    const totalErrors = suites.reduce((sum, s) => sum + s.errors, 0);
    const totalSkipped = suites.reduce((sum, s) => sum + s.skipped, 0);
    const passedTests = totalTests - totalFailures - totalErrors - totalSkipped;
    const totalTime = suites.reduce((sum, s) => sum + s.time, 0);

    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const failureRate = totalTests > 0 ? ((totalFailures + totalErrors) / totalTests) * 100 : 0;
    const testCoverage = totalTests > 0 ? ((totalTests - totalSkipped) / totalTests) * 100 : 0;

    const readinessScore =
      passRate * 0.5 +
      testCoverage * 0.25 +
      (totalErrors === 0 ? 15 : Math.max(0, 15 - totalErrors * 5)) +
      (totalTime < 300 ? 10 : Math.max(0, 10 - (totalTime - 300) / 30));

    const normalizedScore = Math.min(100, Math.max(0, readinessScore));

    let qualityGrade: string;
    if (normalizedScore >= 90) qualityGrade = 'A - Production Ready';
    else if (normalizedScore >= 80) qualityGrade = 'B - Ready with Minor Issues';
    else if (normalizedScore >= 70) qualityGrade = 'C - Needs Review';
    else if (normalizedScore >= 60) qualityGrade = 'D - Not Recommended';
    else qualityGrade = 'F - Do Not Release';

    this.metrics = {
      totalTests,
      passedTests,
      failedTests: totalFailures,
      errorTests: totalErrors,
      skippedTests: totalSkipped,
      passRate: Math.round(passRate * 100) / 100,
      failureRate: Math.round(failureRate * 100) / 100,
      testCoverage: Math.round(testCoverage * 100) / 100,
      executionTime: Math.round(totalTime * 100) / 100,
      readinessScore: Math.round(normalizedScore * 100) / 100,
      qualityGrade,
      timestamp: new Date().toISOString(),
      suites,
    };

    return this.metrics;
  }

  private getRecommendation(): string {
    const score = this.metrics?.readinessScore ?? 0;

    if (score >= 95) return '✓ APPROVED FOR PRODUCTION - All systems go!';
    if (score >= 90) return '✓ READY FOR RELEASE - Minor monitoring recommended';
    if (score >= 80) return '⚠ CONDITIONALLY READY - Address identified issues before release';
    if (score >= 70) return '⚠ NEEDS REVIEW - Significant issues must be resolved';
    if (score >= 60) return '✗ NOT RECOMMENDED - Major issues blocking release';
    return '✗ DO NOT RELEASE - Critical failures present';
  }

  private identifyRisks(): Array<{ category: string; severity: string; description: string }> {
    const metrics = this.metrics!;
    const risks: Array<{ category: string; severity: string; description: string }> = [];

    if (metrics.failedTests > 0) {
      risks.push({
        category: 'Test Failures',
        severity: metrics.failedTests > 2 ? 'HIGH' : 'MEDIUM',
        description: `${metrics.failedTests} test(s) failed. Investigate and fix before release.`,
      });
    }

    if (metrics.errorTests > 0) {
      risks.push({
        category: 'Test Errors',
        severity: 'HIGH',
        description: `${metrics.errorTests} test(s) encountered errors. Critical issues require immediate attention.`,
      });
    }

    if (metrics.passRate < 90) {
      risks.push({
        category: 'Pass Rate',
        severity: metrics.passRate < 70 ? 'HIGH' : 'MEDIUM',
        description: `Pass rate is ${metrics.passRate}%. Target should be >= 90% for production release.`,
      });
    }

    if (metrics.testCoverage < 80) {
      risks.push({
        category: 'Test Coverage',
        severity: 'MEDIUM',
        description: `Test coverage is ${metrics.testCoverage}%. Recommend increasing to >= 90%.`,
      });
    }

    if (metrics.skippedTests > 0) {
      risks.push({
        category: 'Skipped Tests',
        severity: 'LOW',
        description: `${metrics.skippedTests} test(s) skipped. Review and enable if possible.`,
      });
    }

    if (risks.length === 0) {
      risks.push({
        category: 'Overall Status',
        severity: 'LOW',
        description: 'No critical risks identified. System appears ready for release.',
      });
    }

    return risks;
  }

  public async generateExcelReport(outputPath: string): Promise<void> {
    if (!this.metrics) {
      this.calculateMetrics();
    }

    const metrics = this.metrics!;
    const workbook = new ExcelJS.Workbook();

    const summarySheet = workbook.addWorksheet('Release Readiness', {
      headerFooter: { firstHeader: 'Release Readiness Report' },
    });

    summarySheet.mergeCells('A1:D1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'RELEASE READINESS SCORE REPORT';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 25;

    summarySheet.getCell('A2').value = `Generated: ${new Date().toLocaleString()}`;
    summarySheet.getCell('A2').font = { italic: true, size: 10 };

    let row = 4;
    summarySheet.getCell(`A${row}`).value = 'OVERALL METRICS';
    summarySheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    summarySheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    summarySheet.mergeCells(`A${row}:D${row}`);
    row++;

    const summaryData = [
      ['Metric', 'Value', 'Status', 'Details'],
      ['Total Tests Executed', metrics.totalTests, '', ''],
      ['Tests Passed', metrics.passedTests, metrics.passedTests === metrics.totalTests ? '✓' : '⚠', `${metrics.passRate}%`],
      ['Tests Failed', metrics.failedTests, metrics.failedTests === 0 ? '✓' : '✗', `${metrics.failureRate}%`],
      ['Tests with Errors', metrics.errorTests, metrics.errorTests === 0 ? '✓' : '✗', 'Critical'],
      ['Tests Skipped', metrics.skippedTests, '', ''],
      ['Test Coverage', `${metrics.testCoverage}%`, metrics.testCoverage >= 80 ? '✓' : '⚠', `${metrics.totalTests - metrics.skippedTests} active`],
      ['Total Execution Time', `${metrics.executionTime}s`, metrics.executionTime < 300 ? '✓' : '⚠', 'Performance metric'],
      ['Pass Rate', `${metrics.passRate}%`, metrics.passRate >= 90 ? '✓' : metrics.passRate >= 70 ? '⚠' : '✗', 'Primary KPI'],
    ];

    for (const data of summaryData) {
      summarySheet.getCell(`A${row}`).value = data[0];
      summarySheet.getCell(`B${row}`).value = data[1];
      summarySheet.getCell(`C${row}`).value = data[2];
      summarySheet.getCell(`D${row}`).value = data[3];

      if (row === 5) {
        summarySheet.getRow(row).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        summarySheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
      }

      const statusCell = summarySheet.getCell(`C${row}`);
      if (data[2] === '✓') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
        statusCell.font = { color: { argb: 'FF006100' }, bold: true };
      } else if (data[2] === '✗') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
        statusCell.font = { color: { argb: 'FF9C0006' }, bold: true };
      } else if (data[2] === '⚠') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
        statusCell.font = { color: { argb: 'FF9C6500' }, bold: true };
      }

      row++;
    }

    row += 2;
    summarySheet.mergeCells(`A${row}:D${row}`);
    const scoreCell = summarySheet.getCell(`A${row}`);
    scoreCell.value = `RELEASE READINESS SCORE: ${metrics.readinessScore}/100`;
    scoreCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    scoreCell.alignment = { horizontal: 'center', vertical: 'middle' };

    if (metrics.readinessScore >= 90) {
      scoreCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
    } else if (metrics.readinessScore >= 70) {
      scoreCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
    } else {
      scoreCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
    }
    summarySheet.getRow(row).height = 30;

    row++;
    summarySheet.mergeCells(`A${row}:D${row}`);
    const gradeCell = summarySheet.getCell(`A${row}`);
    gradeCell.value = `QUALITY GRADE: ${metrics.qualityGrade}`;
    gradeCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    gradeCell.alignment = { horizontal: 'center', vertical: 'middle' };

    if (metrics.readinessScore >= 90) {
      gradeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
    } else if (metrics.readinessScore >= 70) {
      gradeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
    } else {
      gradeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
    }
    summarySheet.getRow(row).height = 25;

    row += 2;
    summarySheet.mergeCells(`A${row}:D${row}`);
    const recCell = summarySheet.getCell(`A${row}`);
    recCell.value = `RECOMMENDATION: ${this.getRecommendation()}`;
    recCell.font = { bold: true, size: 11, italic: true };
    recCell.alignment = { horizontal: 'center', vertical: 'middle' };

    summarySheet.columns = [
      { width: 25 },
      { width: 20 },
      { width: 15 },
      { width: 30 },
    ];

    const detailSheet = workbook.addWorksheet('Test Suites Detail');
    detailSheet.getCell('A1').value = 'TEST SUITE BREAKDOWN';
    detailSheet.getCell('A1').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    detailSheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    detailSheet.mergeCells('A1:F1');

    const headers = ['Test Suite', 'Total Tests', 'Passed', 'Failed', 'Errors', 'Pass Rate %'];
    for (let i = 0; i < headers.length; i++) {
      const cell = detailSheet.getCell(2, i + 1);
      cell.value = headers[i];
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }

    let detailRow = 3;
    for (const suite of metrics.suites) {
      const passed = suite.tests - suite.failures - suite.errors - suite.skipped;
      detailSheet.getCell(detailRow, 1).value = suite.name;
      detailSheet.getCell(detailRow, 2).value = suite.tests;
      detailSheet.getCell(detailRow, 3).value = passed;
      detailSheet.getCell(detailRow, 4).value = suite.failures;
      detailSheet.getCell(detailRow, 5).value = suite.errors;
      detailSheet.getCell(detailRow, 6).value = suite.passRate;

      const passRateCell = detailSheet.getCell(detailRow, 6);
      if (suite.passRate >= 90) {
        passRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      } else if (suite.passRate >= 70) {
        passRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
      } else {
        passRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
      }

      detailRow++;
    }

    detailSheet.columns = [
      { width: 30 },
      { width: 15 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 15 },
    ];

    const riskSheet = workbook.addWorksheet('Risk Assessment');
    riskSheet.getCell('A1').value = 'RISK ASSESSMENT & RECOMMENDATIONS';
    riskSheet.getCell('A1').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    riskSheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    riskSheet.mergeCells('A1:C1');

    let riskRow = 3;
    const risks = this.identifyRisks();
    for (const risk of risks) {
      riskSheet.getCell(riskRow, 1).value = risk.category;
      riskSheet.getCell(riskRow, 1).font = { bold: true };
      riskSheet.getCell(riskRow, 2).value = risk.severity;
      riskSheet.getCell(riskRow, 3).value = risk.description;

      const severityCell = riskSheet.getCell(riskRow, 2);
      if (risk.severity === 'HIGH') {
        severityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
        severityCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else if (risk.severity === 'MEDIUM') {
        severityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
        severityCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else {
        severityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
      }

      riskRow++;
    }

    riskSheet.columns = [
      { width: 20 },
      { width: 12 },
      { width: 50 },
    ];

    await workbook.xlsx.writeFile(outputPath);
    console.log(`✓ Release Readiness Report generated: ${outputPath}`);
  }

  public printMetrics(): void {
    if (!this.metrics) {
      this.calculateMetrics();
    }

    const metrics = this.metrics!;

    console.log('\n========================================');
    console.log('   RELEASE READINESS SCORE REPORT');
    console.log('========================================\n');

    console.log('OVERALL METRICS:');
    console.log(`  Total Tests:        ${metrics.totalTests}`);
    console.log(`  Passed:             ${metrics.passedTests}`);
    console.log(`  Failed:             ${metrics.failedTests}`);
    console.log(`  Errors:             ${metrics.errorTests}`);
    console.log(`  Skipped:            ${metrics.skippedTests}`);
    console.log(`  Pass Rate:          ${metrics.passRate}%`);
    console.log(`  Failure Rate:       ${metrics.failureRate}%`);
    console.log(`  Test Coverage:      ${metrics.testCoverage}%`);
    console.log(`  Execution Time:     ${metrics.executionTime}s\n`);

    console.log('RELEASE READINESS SCORE:');
    console.log(`  Score:              ${metrics.readinessScore}/100`);
    console.log(`  Grade:              ${metrics.qualityGrade}`);
    console.log(`  Recommendation:     ${this.getRecommendation()}\n`);

    console.log('TEST SUITE BREAKDOWN:');
    for (const suite of metrics.suites) {
      const passed = suite.tests - suite.failures - suite.errors - suite.skipped;
      console.log(`  ${suite.name}:`);
      console.log(`    Tests: ${suite.tests} | Passed: ${passed} | Failed: ${suite.failures} | Pass Rate: ${suite.passRate}%`);
    }

    console.log('\n========================================\n');
  }
}
