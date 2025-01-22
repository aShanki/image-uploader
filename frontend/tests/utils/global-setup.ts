import { chromium, FullConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use
  
  // Skip if no storage state is configured
  if (!storageState) return

  // Ensure storage directory exists
  const storageDir = path.dirname(storageState as string)
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }

  // Create test image fixtures directory
  const fixturesDir = path.join(__dirname, '../fixtures')
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true })
  }

  // Launch browser
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Authenticate
  if (baseURL) {
    // Go to login page
    await page.goto(`${baseURL}/login`)

    // Fill login form
    await page.getByLabel('Username').fill(
      process.env.TEST_USERNAME || 'admin'
    )
    await page.getByLabel('Password').fill(
      process.env.TEST_PASSWORD || 'secure_password_here'
    )

    // Submit form
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Wait for navigation
    await page.waitForURL(`${baseURL}/`)

    // Create test images
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    )

    // Save test images
    for (let i = 0; i < 3; i++) {
      fs.writeFileSync(
        path.join(fixturesDir, `test${i}.png`),
        testImage
      )
    }

    // Save authentication state
    await context.storageState({ path: storageState as string })
  }

  // Close browser
  await browser.close()
}

export default globalSetup