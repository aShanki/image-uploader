import { FullConfig } from '@playwright/test'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

async function globalSetup(config: FullConfig) {
  // Load environment variables
  dotenv.config({ path: '.env.local' })

  // Create test directories if they don't exist
  const testDirs = [
    path.join(__dirname, '../fixtures'),
    path.join(__dirname, '../../test-results'),
    path.join(__dirname, '../../playwright-report'),
  ]

  testDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })

  // Create test environment if needed
  const envPath = path.join(process.cwd(), '.env.test')
  if (!fs.existsSync(envPath)) {
    const testEnv = `
      NEXT_PUBLIC_API_URL=http://localhost:4001
      AUTH_USERNAME=admin
      AUTH_PASSWORD=secure_password_here
    `.trim()
    fs.writeFileSync(envPath, testEnv)
  }

  // Create dummy test images
  const testImage = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  )

  const fixturesDir = path.join(__dirname, '../fixtures')
  for (let i = 0; i < 3; i++) {
    const filePath = path.join(fixturesDir, `test${i}.png`)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, testImage)
    }
  }
}

export default globalSetup