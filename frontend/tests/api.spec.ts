import { test, expect } from './utils/test-utils'
import type { APIResponse } from '@playwright/test'

test.describe('API Integration', () => {
  test('handles malformed JSON responses', async ({ authenticatedPage: page }) => {
    // Mock malformed JSON response
    await page.route('/api/images', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"malformed:json'
      })
    })

    await page.goto('/')
    
    // Verify error handling
    await expect(page.getByText(/error/i)).toBeVisible()
  })

  test('handles unexpected response structures', async ({ authenticatedPage: page }) => {
    // Mock unexpected response structure
    await page.route('/api/images', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unexpectedKey: 'unexpected value'
        })
      })
    })

    await page.goto('/')
    
    // Should handle gracefully
    await expect(page.getByText('No images uploaded yet')).toBeVisible()
  })

  test('handles server errors', async ({ authenticatedPage: page }) => {
    // Test various error codes
    const errorCodes = [500, 502, 503, 504]
    
    for (const code of errorCodes) {
      await page.route('/api/images', async (route) => {
        await route.fulfill({
          status: code,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        })
      })

      await page.goto('/')
      
      // Verify error handling
      await expect(page.getByText(/server error/i)).toBeVisible()
    }
  })

  test('handles rate limiting', async ({ authenticatedPage: page }) => {
    // Mock rate limit response
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Too many requests' })
      })
    })

    const fileData = await page.evaluate(() => {
      const blob = new Blob(['test'], { type: 'image/jpeg' })
      const file = new File([blob], 'test.jpg', { type: 'image/jpeg' })
      return { name: file.name, type: file.type }
    })

    // Attempt upload
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByText('Upload a file').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([{
      name: fileData.name,
      mimeType: fileData.type,
      buffer: Buffer.from('test'),
    }])

    // Verify rate limit message
    await expect(page.getByText(/too many requests/i)).toBeVisible()
  })

  test('handles offline state', async ({ authenticatedPage: page }) => {
    // Simulate offline
    await page.route('**/*', async (route) => {
      await route.abort('failed')
    })

    await page.goto('/')
    
    // Verify offline message
    await expect(page.getByText(/network error|offline/i)).toBeVisible()
  })

  test('handles slow responses', async ({ authenticatedPage: page }) => {
    // Mock slow response
    await page.route('/api/images', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    await page.goto('/')
    
    // Verify loading state
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('handles concurrent requests', async ({ authenticatedPage: page }) => {
    // Setup response delays
    let requestCount = 0
    await page.route('/api/images', async (route) => {
      requestCount++
      const delay = requestCount === 1 ? 1000 : 500
      await new Promise(resolve => setTimeout(resolve, delay))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: `test${requestCount}`,
          filename: `test${requestCount}.jpg`,
          size: 1024,
          createdAt: new Date().toISOString(),
          url: `/images/test${requestCount}.jpg`
        }])
      })
    })

    // Make concurrent requests
    await Promise.all([
      page.goto('/'),
      page.reload()
    ])

    // Verify final state is correct
    await expect(page.locator('.grid > div')).toHaveCount(1)
  })

  test('validates response types', async ({ authenticatedPage: page }) => {
    const responses: APIResponse[] = []
    page.on('response', response => responses.push(response))

    await page.goto('/')

    // Verify response headers and types
    for (const response of responses) {
      if (response.url().includes('/api/')) {
        expect(response.headers()['content-type']).toContain('application/json')
        const body = await response.json()
        expect(body).toBeDefined()
      }
    }
  })
})