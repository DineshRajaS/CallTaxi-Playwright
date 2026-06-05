import path from 'path';
import { ReleaseReadinessScoreCalculator } from './src/utils/releaseReadinessScore';

async function generateReleaseReadinessReport() {
  try {
    console.log('\n🔍 Generating Release Readiness Score Report...\n');

    const junitPath = path.join(__dirname, 'results', 'junit-report.xml');
    const excelPath = path.join(__dirname, 'Release_Readiness_Score.xlsx');

    const calculator = new ReleaseReadinessScoreCalculator(junitPath);
    const metrics = calculator.calculateMetrics();

    calculator.printMetrics();
    await calculator.generateExcelReport(excelPath);

    console.log(`✅ Report successfully generated at: ${excelPath}\n`);
    console.log(`📊 Release Readiness Score: ${metrics.readinessScore}/100`);
    console.log(`📈 Quality Grade: ${metrics.qualityGrade}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  }
}

generateReleaseReadinessReport();
