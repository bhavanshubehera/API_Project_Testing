const fs = require('fs');
const path = require('path');

/**
 * Script to analyze and display test coverage information
 */
function analyzeCoverage() {
  const coverageDir = path.join(__dirname, '../coverage');
  const lcovReportPath = path.join(coverageDir, 'lcov-report', 'index.html');
  const jsonReportPath = path.join(coverageDir, 'coverage-final.json');

  console.log('🧪 Test Coverage Analysis');
  console.log('========================');

  if (!fs.existsSync(coverageDir)) {
    console.log('❌ Coverage directory not found. Run: npm run test:coverage');
    return;
  }

  if (fs.existsSync(jsonReportPath)) {
    try {
      const coverageData = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
      
      console.log('\n📊 Coverage Summary:');
      console.log('-------------------');

      Object.keys(coverageData).forEach(file => {
        const fileCoverage = coverageData[file];
        const fileName = path.basename(file);
        
        const statements = fileCoverage.s;
        const functions = fileCoverage.f;
        const branches = fileCoverage.b;
        const lines = fileCoverage.l;

        const stmtCovered = Object.values(statements).filter(hit => hit > 0).length;
        const stmtTotal = Object.keys(statements).length;
        const stmtPercent = stmtTotal > 0 ? ((stmtCovered / stmtTotal) * 100).toFixed(2) : 0;

        const funcCovered = Object.values(functions).filter(hit => hit > 0).length;
        const funcTotal = Object.keys(functions).length;
        const funcPercent = funcTotal > 0 ? ((funcCovered / funcTotal) * 100).toFixed(2) : 0;

        console.log(`\n📄 ${fileName}:`);
        console.log(`   Statements: ${stmtPercent}% (${stmtCovered}/${stmtTotal})`);
        console.log(`   Functions:  ${funcPercent}% (${funcCovered}/${funcTotal})`);
        
        if (stmtPercent < 70) {
          console.log(`   ⚠️  Low coverage - aim for 70%+`);
        } else {
          console.log(`   ✅ Good coverage`);
        }
      });

    } catch (error) {
      console.error('❌ Error reading coverage data:', error.message);
    }
  }

  if (fs.existsSync(lcovReportPath)) {
    console.log(`\n🌐 HTML Report: file://${lcovReportPath}`);
  }

  console.log('\n💡 Tips for improving coverage:');
  console.log('   • Add tests for error handling scenarios');
  console.log('   • Test edge cases and boundary conditions');
  console.log('   • Ensure all API endpoints are tested');
  console.log('   • Test both success and failure paths');
}

// Run if called directly
if (require.main === module) {
  analyzeCoverage();
}

module.exports = { analyzeCoverage };