import { test, expect } from './utils/test-utils'
import { createMockFile } from './utils/test-utils'

test.describe('Components', () => {
  test.describe('ImageGrid', () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
      await page.goto('/')
    })

    test('renders image grid with correct layout', async ({ authenticatedPage: page }) => {
      // Mock multiple images
      await page.route('/api/images', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(Array.from({ length: 6 }, (_, i) => ({
            id: `test${i}`,
            filename: `test${i}.jpg`,
            size: 1024,
            createdAt: new Date().toISOString(),
            url: `/images/test${i}.jpg`
          })))
        })
      })

      await page.reload()

      // Check grid layout
      const grid = page.locator('.grid')
      await expect(grid).toHaveClass(/grid.*gap-4/)
      
      // Verify responsive layout
      const viewport = page.viewportSize()
      if (viewport && viewport.width >= 1024) {
        await expect(grid).toHaveClass(/lg:grid-cols-3/)
      } else if (viewport && viewport.width >= 768) {
        await expect(grid).toHaveClass(/md:grid-cols-2/)
      }
    })

    test('displays image details correctly', async ({ authenticatedPage: page }) => {
      const testImage = {
        id: 'test1',
        filename: 'test-image.jpg',
        size: 1048576, // 1MB
        createdAt: new Date().toISOString(),
        url: '/images/test-image.jpg'
      }

      await page.route('/api/images', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([testImage])
        })
      })

      await page.reload()

      const imageCard = page.locator('.grid > div').first()
      await expect(imageCard.getByText('test-image.jpg')).toBeVisible()
      await expect(imageCard.getByText('1.0 MB')).toBeVisible()
      await expect(imageCard.getByRole('img')).toHaveAttribute('alt', 'test-image.jpg')
    })

    test('handles empty grid state', async ({ authenticatedPage: page }) => {
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
  })

  test.describe('ImageUpload', () => {
    test('supports drag and drop', async ({ authenticatedPage: page }) => {
      await page.goto('/')

      // Get upload zone
      const dropZone = page.locator('div[class*="border-dashed"]')
      
      // Verify initial state
      await expect(dropZone).toBeVisible()
      await expect(dropZone).not.toHaveClass(/border-blue-500/)

      // Simulate drag enter
      await dropZone.evaluate(element => {
        const dragEvent = new DragEvent('dragenter', {
          bubbles: true,
          cancelable: true,
        })
        element.dispatchEvent(dragEvent)
      })

      // Verify drag state
      await expect(dropZone).toHaveClass(/border-blue-500/)

      // Simulate drag leave
      await dropZone.evaluate(element => {
        const dragEvent = new DragEvent('dragleave', {
          bubbles: true,
          cancelable: true,
        })
        element.dispatchEvent(dragEvent)
      })

      // Verify return to initial state
      await expect(dropZone).not.toHaveClass(/border-blue-500/)
    })

    test('shows upload progress', async ({ authenticatedPage: page }) => {
      await page.goto('/')

      // Mock slow upload
      await page.route('/api/upload', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test1',
            filename: 'uploaded.jpg',
            size: 1024,
            createdAt: new Date().toISOString(),
            url: '/images/uploaded.jpg'
          })
        })
      })

      const fileData = await createMockFile(page)

      // Upload file
      const fileChooserPromise = page.waitForEvent('filechooser')
      await page.getByText('Upload a file').click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles([{
        name: fileData.name,
        mimeType: fileData.mimeType,
        buffer: fileData.buffer,
      }])

      // Verify progress indicator
      const progressBar = page.locator('.bg-blue-600')
      await expect(progressBar).toBeVisible()
      
      // Wait for upload to complete
      await expect(progressBar).not.toBeVisible({ timeout: 5000 })
    })

    test('validates file types', async ({ authenticatedPage: page }) => {
      await page.goto('/')

      const invalidFile = {
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('test')
      }

      // Attempt invalid upload
      const fileChooserPromise = page.waitForEvent('filechooser')
      await page.getByText('Upload a file').click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles([{
        name: invalidFile.name,
        mimeType: invalidFile.mimeType,
        buffer: invalidFile.buffer,
      }])

      // Verify error message
      await expect(page.getByText(/Please upload an image file/i)).toBeVisible()
    })

    test('handles upload cancellation', async ({ authenticatedPage: page }) => {
      await page.goto('/')

      // Mock long upload
      const [uploadRequest] = await Promise.all([
        page.waitForRequest(request => 
          request.url().includes('/api/upload') && 
          request.method() === 'POST'
        ),
        page.getByText('Upload a file').click().then(() => 
          page.waitForEvent('filechooser').then(fileChooser => 
            fileChooser.setFiles([{
              name: 'test.jpg',
              mimeType: 'image/jpeg',
              buffer: Buffer.from('test'),
            }])
          )
        )
      ])

      // Navigate away during upload
      await page.goto('/login')

      // Verify upload was cancelled
      expect(uploadRequest.failure()).toBeTruthy()
    })
  })
})