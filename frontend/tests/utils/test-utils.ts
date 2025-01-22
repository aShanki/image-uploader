import { test as base } from '@playwright/test'
import type { Page } from '@playwright/test'

// Mock API responses
const mockApiResponses = (page: Page) => {
  return Promise.all([
    // Mock image list
    page.route('/api/images', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test1',
            filename: 'test1.jpg',
            size: 1024,
            createdAt: new Date().toISOString(),
            url: '/images/test1.jpg'
          }
        ])
      })
    }),

    // Mock image upload
    page.route('/api/upload', async (route) => {
      const formData = await route.request().postData()
      if (!formData?.includes('image')) {
        return route.fulfill({ status: 400, body: 'No image provided' })
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new-test-image',
          filename: 'uploaded.jpg',
          size: 2048,
          createdAt: new Date().toISOString(),
          url: '/images/uploaded.jpg'
        })
      })
    }),

    // Mock image delete
    page.route('/api/images/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200 })
      }
    }),

    // Mock image files
    page.route('/images/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/jpeg',
        body: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          'base64'
        )
      })
    })
  ])
}

// Test fixture with auth and API mocks
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Set auth cookie or local storage
    await page.context().addCookies([
      {
        name: 'auth',
        value: 'test-session',
        domain: 'localhost',
        path: '/'
      }
    ])

    // Mock API responses
    await mockApiResponses(page)

    // Let the test use the authenticated page
    await use(page)
  }
})

// Helper to generate a mock file for upload
export const createMockFile = async (page: Page, filename = 'test.jpg') => {
  const fileData = {
    name: filename,
    mimeType: 'image/jpeg',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    )
  }

  return fileData
}

// Helper to login
export const login = async (page: Page, username = 'admin', password = 'secure_password_here') => {
  await page.goto('/login')
  await page.getByLabel('Username').fill(username)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/')
}