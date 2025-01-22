import { test as base, Page } from '@playwright/test'
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

type TestFixtures = {
  autoTestImages: void;
  authenticatedPage: Page;
}

// Extend the base test with our custom fixtures
export const test = base.extend<TestFixtures>({
  // Setup test images before all tests
  autoTestImages: [async ({}, use) => {
    setupTestImages()
    await use()
  }, { scope: 'test', auto: true }],

  // Add authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    // Set auth cookie
    await page.context().addCookies([
      {
        name: 'auth',
        value: 'true',
        domain: 'localhost',
        path: '/'
      }
    ])

    // Mock sessionStorage
    await page.evaluate(() => {
      window.sessionStorage.setItem('isLoggedIn', 'true')
    })

    await page.goto('/')
    await use(page)
  }
})

// Helper function to get test image paths
export const getTestImagePath = (index = 0): string => {
  return path.join(__dirname, 'fixtures', `test${index}.png`)
}

export { expect } from '@playwright/test'