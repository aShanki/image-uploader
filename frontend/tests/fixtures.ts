import { test as base } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// Create test images if they don't exist
const setupTestImages = () => {
  const testDir = path.join(__dirname, 'fixtures')
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir)
  }

  // Create a simple test image using Node Canvas or base64
  const testImage1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  )
  
  // Save multiple test images
  for (let i = 0; i < 3; i++) {
    const filePath = path.join(testDir, `test${i}.png`)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, testImage1)
    }
  }
}

// Extend the base test with our custom fixtures
export const test = base.extend({
  // Setup test images before all tests
  autoTestImages: [async ({}, use) => {
    setupTestImages()
    await use()
  }, { scope: 'worker' }],

  // Add authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.getByLabel('Username').fill(process.env.AUTH_USERNAME || 'admin')
    await page.getByLabel('Password').fill(process.env.AUTH_PASSWORD || 'secure_password_here')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('/')
    await use(page)
  }
})

// Helper function to get test image paths
export const getTestImagePath = (index: number = 0) => {
  return path.join(__dirname, 'fixtures', `test${index}.png`)
}