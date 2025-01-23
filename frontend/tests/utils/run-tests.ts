import { execSync } from 'child_process'
import { resolve } from 'path'
import fs from 'fs'
import type { TestResult } from '@playwright/test/reporter'

// Test patterns to ensure coverage
const TEST_PATTERNS = [
  // Auth flows
  'login.spec.ts',
  
  // Core functionality
  'components.spec.ts',
  'images.spec.ts',
  
  // API and error handling
  'api.spec.ts',
]

// Make sure all test patterns exist
TEST_PATTERNS.forEach(pattern => {
  const testFiles = fs.readdirSync(resolve(__dirname, '..')).filter(f => f.match(pattern))
  if (testFiles.length === 0) {
    throw new Error(`No test files found matching pattern: ${pattern}`)
  }
})

interface TestSpec {
  title: string
  ok: boolean
}

interface TestSuite {
  specs: TestSpec[]
}

interface JsonResults {
  suites: TestSuite[]
}

// Run tests in sequence
async function runTests() {
  console.log('Starting test run...\n')
  
  try {
    // Clean previous results
    if (fs.existsSync('test-results')) {
      fs.rmSync('test-results', { recursive: true })
    }
    if (fs.existsSync('playwright-report')) {
      fs.rmSync('playwright-report', { recursive: true })
    }

    // Run tests in specific order
    for (const pattern of TEST_PATTERNS) {
      console.log(`\nRunning tests matching: ${pattern}`)
      execSync(`npx playwright test ${pattern} --reporter=line`, {
        stdio: 'inherit'
      })
    }

    // Generate coverage report
    console.log('\nGenerating coverage report...')
    execSync('npx playwright show-report', {
      stdio: 'inherit'
    })

    // Verify critical path coverage
    const results = JSON.parse(
      fs.readFileSync('test-results/test-results.json', 'utf-8')
    ) as JsonResults

    const criticalPaths = [
      'login', 
      'upload', 
      'delete',
      'preview',
      'grid',
      'error handling'
    ]

    const coveredPaths = new Set(
      results.suites
        .flatMap(suite => suite.specs)
        .map(spec => spec.title.toLowerCase())
    )

    const missingPaths = criticalPaths.filter(path => 
      !Array.from(coveredPaths).some(title => title.includes(path))
    )

    if (missingPaths.length > 0) {
      console.warn(
        '\nWarning: Missing tests for critical paths:',
        missingPaths.join(', ')
      )
      process.exit(1)
    }

    console.log('\nAll critical paths covered!')
    process.exit(0)

  } catch (error) {
    console.error('\nTest run failed:', error)
    process.exit(1)
  }
}

// Run tests
runTests()