#!/usr/bin/env node

/**
 * ConnectCare AI - Test Runner Script
 * 
 * Comprehensive test runner that executes all test suites and generates reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  suiteTimeout: 300000, // 5 minutes per test suite
  testTimeout: 60000,   // 1 minute per individual test
  retries: 2,           // Retry failed tests twice
  parallel: false,      // Run tests sequentially for database consistency
};

// Test suites to run
const TEST_SUITES = [
  {
    name: 'Database Functions',
    command: 'jest testing/unit/database-functions.test.js',
    description: 'Tests database functions, triggers, and data integrity'
  },
  {
    name: 'RLS Policies',
    command: 'jest testing/unit/rls-policies.test.js',
    description: 'Tests Row Level Security policy enforcement'
  },
  {
    name: 'Patient Isolation',
    command: 'playwright test testing/e2e/patient-isolation.test.js',
    description: 'End-to-end tests for patient data isolation'
  },
  {
    name: 'Doctor Access Control',
    command: 'playwright test testing/e2e/doctor-access.test.js',
    description: 'End-to-end tests for doctor access controls'
  },
  {
    name: 'Security Violations',
    command: 'playwright test testing/e2e/security-violations.test.js',
    description: 'Tests for security violation prevention'
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Print colored console output
 */
function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print test header
 */
function printHeader() {
  colorLog('\n' + '='.repeat(80), 'cyan');
  colorLog('🧪 ConnectCare AI - Comprehensive Test Suite', 'bright');
  colorLog('='.repeat(80), 'cyan');
  colorLog(`📅 Started at: ${new Date().toISOString()}`, 'blue');
  colorLog(`🔧 Test Configuration:`, 'blue');
  colorLog(`   - Suite Timeout: ${TEST_CONFIG.suiteTimeout / 1000}s`, 'blue');
  colorLog(`   - Test Timeout: ${TEST_CONFIG.testTimeout / 1000}s`, 'blue');
  colorLog(`   - Retries: ${TEST_CONFIG.retries}`, 'blue');
  colorLog(`   - Parallel: ${TEST_CONFIG.parallel}`, 'blue');
  colorLog('='.repeat(80), 'cyan');
}

/**
 * Check prerequisites
 */
function checkPrerequisites() {
  colorLog('\n🔍 Checking Prerequisites...', 'yellow');
  
  const requiredEnvVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    colorLog(`❌ Missing required environment variables:`, 'red');
    missingVars.forEach(varName => {
      colorLog(`   - ${varName}`, 'red');
    });
    colorLog('\nPlease set these environment variables before running tests.', 'red');
    process.exit(1);
  }

  // Check if test database is seeded
  colorLog('✅ Environment variables configured', 'green');
  colorLog('✅ Prerequisites check passed', 'green');
}

/**
 * Seed test database
 */
function seedTestDatabase() {
  colorLog('\n🌱 Seeding Test Database...', 'yellow');
  
  try {
    // Run the seed script
    execSync('node testing/scripts/seed-database.js', { 
      stdio: 'inherit',
      timeout: 60000 // 1 minute timeout
    });
    colorLog('✅ Test database seeded successfully', 'green');
  } catch (error) {
    colorLog('❌ Failed to seed test database', 'red');
    colorLog(error.message, 'red');
    process.exit(1);
  }
}

/**
 * Run a single test suite
 */
async function runTestSuite(suite, index) {
  const suiteNumber = index + 1;
  const totalSuites = TEST_SUITES.length;
  
  colorLog(`\n📋 [${suiteNumber}/${totalSuites}] Running: ${suite.name}`, 'bright');
  colorLog(`📝 Description: ${suite.description}`, 'blue');
  colorLog(`⚡ Command: ${suite.command}`, 'magenta');
  colorLog('-'.repeat(60), 'cyan');

  const startTime = Date.now();
  let attempt = 0;
  let success = false;
  let lastError = null;

  while (attempt <= TEST_CONFIG.retries && !success) {
    attempt++;
    
    if (attempt > 1) {
      colorLog(`🔄 Retry attempt ${attempt - 1}/${TEST_CONFIG.retries}`, 'yellow');
    }

    try {
      execSync(suite.command, {
        stdio: 'inherit',
        timeout: TEST_CONFIG.suiteTimeout,
        env: { ...process.env, NODE_ENV: 'test' }
      });
      
      success = true;
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      colorLog(`✅ ${suite.name} passed in ${duration}s`, 'green');
      
    } catch (error) {
      lastError = error;
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (attempt <= TEST_CONFIG.retries) {
        colorLog(`❌ ${suite.name} failed (attempt ${attempt}) after ${duration}s`, 'red');
      }
    }
  }

  if (!success) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    colorLog(`💥 ${suite.name} failed after ${TEST_CONFIG.retries + 1} attempts (${duration}s)`, 'red');
    return { success: false, error: lastError, duration: Date.now() - startTime };
  }

  return { success: true, duration: Date.now() - startTime };
}

/**
 * Generate test report
 */
function generateTestReport(results) {
  colorLog('\n📊 Test Results Summary', 'bright');
  colorLog('='.repeat(80), 'cyan');

  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  colorLog(`📈 Total Test Suites: ${totalTests}`, 'blue');
  colorLog(`✅ Passed: ${passedTests}`, 'green');
  colorLog(`❌ Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  colorLog(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`, 'blue');
  colorLog(`📅 Completed at: ${new Date().toISOString()}`, 'blue');

  // Detailed results
  colorLog('\n📋 Detailed Results:', 'bright');
  results.forEach((result, index) => {
    const suite = TEST_SUITES[index];
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const duration = (result.duration / 1000).toFixed(2);
    const color = result.success ? 'green' : 'red';
    
    colorLog(`  ${status} ${suite.name} (${duration}s)`, color);
  });

  // Failed tests details
  const failedSuites = results
    .map((result, index) => ({ ...result, suite: TEST_SUITES[index] }))
    .filter(r => !r.success);

  if (failedSuites.length > 0) {
    colorLog('\n💥 Failed Test Details:', 'red');
    failedSuites.forEach(failed => {
      colorLog(`  ❌ ${failed.suite.name}:`, 'red');
      colorLog(`     Command: ${failed.suite.command}`, 'red');
      if (failed.error) {
        colorLog(`     Error: ${failed.error.message}`, 'red');
      }
    });
  }

  colorLog('\n' + '='.repeat(80), 'cyan');

  // Generate JSON report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      duration: totalDuration
    },
    results: results.map((result, index) => ({
      suite: TEST_SUITES[index].name,
      description: TEST_SUITES[index].description,
      command: TEST_SUITES[index].command,
      success: result.success,
      duration: result.duration,
      error: result.error?.message || null
    }))
  };

  // Save report to file
  const reportPath = path.join(__dirname, '../reports/test-report.json');
  const reportsDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  colorLog(`📄 Test report saved to: ${reportPath}`, 'blue');

  return failedTests === 0;
}

/**
 * Cleanup test environment
 */
function cleanupTestEnvironment() {
  colorLog('\n🧹 Cleaning up test environment...', 'yellow');
  
  try {
    execSync('node testing/scripts/cleanup-test-data.js', { 
      stdio: 'inherit',
      timeout: 30000 // 30 seconds timeout
    });
    colorLog('✅ Test environment cleaned up', 'green');
  } catch (error) {
    colorLog('⚠️  Warning: Failed to cleanup test environment', 'yellow');
    colorLog(error.message, 'yellow');
  }
}

/**
 * Main test runner function
 */
async function runTests() {
  try {
    printHeader();
    checkPrerequisites();
    seedTestDatabase();

    colorLog('\n🚀 Starting Test Execution...', 'bright');
    
    const results = [];
    
    for (let i = 0; i < TEST_SUITES.length; i++) {
      const result = await runTestSuite(TEST_SUITES[i], i);
      results.push(result);
      
      // Stop on first failure if not in parallel mode
      if (!TEST_CONFIG.parallel && !result.success) {
        colorLog('\n🛑 Stopping test execution due to failure', 'red');
        break;
      }
    }

    const allPassed = generateTestReport(results);
    cleanupTestEnvironment();

    if (allPassed) {
      colorLog('\n🎉 All tests passed! ConnectCare AI is ready for production.', 'green');
      process.exit(0);
    } else {
      colorLog('\n💥 Some tests failed. Please review the results above.', 'red');
      process.exit(1);
    }

  } catch (error) {
    colorLog('\n💥 Test runner encountered an error:', 'red');
    colorLog(error.message, 'red');
    colorLog(error.stack, 'red');
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  colorLog('\n🛑 Test execution interrupted by user', 'yellow');
  cleanupTestEnvironment();
  process.exit(1);
});

process.on('SIGTERM', () => {
  colorLog('\n🛑 Test execution terminated', 'yellow');
  cleanupTestEnvironment();
  process.exit(1);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  TEST_SUITES,
  TEST_CONFIG
};