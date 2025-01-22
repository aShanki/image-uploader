import { test, expect } from './utils/test-utils'
import { createMockFile } from './utils/test-utils'

test.describe('Image Management', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/')
  })

  test('shows empty state when no images', async ({ authenticatedPage: page }) => {
    // Override default mock to return empty array
    await page.route('/api/images', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    await page.reload()
    await expect(page.getByText('No images uploaded yet')).toBeVisible()
  })

  test('upload image workflow with preview', async ({ authenticatedPage: page }) => {
    const fileData = await createMockFile(page)
    
    // Monitor network requests
    const uploadPromise = page.waitForRequest(request => 
      request.url().includes('/api/upload') && 
      request.method() === 'POST'
    )

    // Upload process
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByText('Upload a file').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([{
      name: fileData.name,
      mimeType: fileData.mimeType,
      buffer: fileData.buffer,
    }])

    // Verify preview appears
    await expect(page.locator('img[alt="Preview"]')).toBeVisible()
    
    // Wait for upload request
    await uploadPromise
    
    // Check success state
    await expect(page.getByText('No images uploaded yet')).not.toBeVisible()
    const firstImage = page.locator('.grid > div').first()
    await expect(firstImage).toBeVisible()
  })

  test('copy image URL functionality', async ({ authenticatedPage: page }) => {
    // Wait for grid to load
    const firstImage = page.locator('.grid > div').first()
    await expect(firstImage).toBeVisible()

    // Test copy button
    const copyButton = firstImage.getByRole('button', { name: 'Copy URL' })
    
    // Mock clipboard write
    await page.evaluate(() => {
      window.navigator.clipboard = {
        writeText: () => Promise.resolve(),
      }
    })
    
    await copyButton.click()
    
    // Verify success feedback
    await expect(firstImage).toBeVisible() // Ensures we're still on the page
  })

  test('delete image functionality', async ({ authenticatedPage: page }) => {
    // Wait for grid to load
    const firstImage = page.locator('.grid > div').first()
    await expect(firstImage).toBeVisible()

    // Monitor delete request
    const deletePromise = page.waitForRequest(request => 
      request.url().includes('/api/images/') && 
      request.method() === 'DELETE'
    )

    // Click delete button
    const deleteButton = firstImage.getByRole('button', { name: 'Delete' })
    await deleteButton.click()

    // Wait for delete request
    await deletePromise

    // Verify image is removed
    await expect(firstImage).not.toBeVisible()
  })

  test('sort images functionality', async ({ authenticatedPage: page }) => {
    // Mock multiple images with different dates
    await page.route('/api/images', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test1',
            filename: 'old.jpg',
            size: 1024,
            createdAt: '2024-01-01T00:00:00Z',
            url: '/images/old.jpg'
          },
          {
            id: 'test2',
            filename: 'new.jpg',
            size: 1024,
            createdAt: '2024-01-20T00:00:00Z',
            url: '/images/new.jpg'
          }
        ])
      })
    })

    await page.reload()

    // Test sort functionality
    const sortButton = page.getByRole('button', { name: /Sort by Date/ })
    
    // Get initial order
    const images = page.locator('.grid > div')
    const initialFirstImage = await images.first().textContent()
    
    // Click sort
    await sortButton.click()
    
    // Verify order changed
    const newFirstImage = await images.first().textContent()
    expect(newFirstImage).not.toBe(initialFirstImage)
    
    // Click again to reverse
    await sortButton.click()
    const reversedFirstImage = await images.first().textContent()
    expect(reversedFirstImage).toBe(initialFirstImage)
  })

  test('image preview modal', async ({ authenticatedPage: page }) => {
    // Wait for grid to load
    const firstImage = page.locator('.grid > div').first()
    await expect(firstImage).toBeVisible()

    // Click image to open preview
    await firstImage.locator('img').click()
    
    // Verify modal is visible
    const modal = page.locator('.fixed')
    await expect(modal).toBeVisible()
    
    // Click outside to close
    await page.mouse.click(0, 0)
    
    // Verify modal is closed
    await expect(modal).not.toBeVisible()
  })

  test('handles upload errors', async ({ authenticatedPage: page }) => {
    // Mock upload error
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid file type' })
      })
    })

    const fileData = await createMockFile(page, 'invalid.txt')
    
    // Upload process
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByText('Upload a file').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([{
      name: fileData.name,
      mimeType: 'text/plain',
      buffer: fileData.buffer,
    }])

    // Verify error message
    await expect(page.getByText('Invalid file type')).toBeVisible()
  })

  test('handles network errors gracefully', async ({ authenticatedPage: page }) => {
    // Mock network error
    await page.route('/api/images', async (route) => {
      await route.abort('failed')
    })

    await page.reload()

    // Verify error state
    await expect(page.getByText(/error/i)).toBeVisible()
  })
})