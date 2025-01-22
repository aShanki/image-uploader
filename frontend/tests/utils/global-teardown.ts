import { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  // Clean up test images
  const fixturesDir = path.join(__dirname, '../fixtures')
  if (fs.existsSync(fixturesDir)) {
    const files = fs.readdirSync(fixturesDir)
    for (const file of files) {
      if (file.startsWith('test') && file.endsWith('.png')) {
        fs.unlinkSync(path.join(fixturesDir, file))
      }
    }
  }

  // Clean up test environment file
  const envPath = path.join(process.cwd(), '.env.test')
  if (fs.existsSync(envPath)) {
    fs.unlinkSync(envPath)
  }

  // Clean up test auth state
  const authStatePath = path.join(process.cwd(), '.auth')
  if (fs.existsSync(authStatePath)) {
    fs.rmSync(authStatePath, { recursive: true, force: true })
  }

  // Clean up session storage and cookies in test results
  const testResultsDir = path.join(process.cwd(), 'test-results')
  if (fs.existsSync(testResultsDir)) {
    const storageFiles = fs.readdirSync(testResultsDir)
    for (const file of storageFiles) {
      if (file.includes('storageState') || file.includes('cookies')) {
        fs.unlinkSync(path.join(testResultsDir, file))
      }
    }
  }
}

export default globalTeardown