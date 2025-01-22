import { expect } from '@playwright/test'
import { test, getTestImagePath } from './fixtures'

test.describe('Image Management', () => {
  // Use authenticated page for all tests
  test.use({ autoTestImages: true })

  test('shows empty state', async ({ authenticatedPage: page }) => {
    // When there are no images
    await expect(page.getByText('No images uploaded yet')).toBeVisible()
  })

  test('upload image workflow', async ({ authenticatedPage: page }) => {
    const filePath = getTestImagePath(0)
    
    // Upload process
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByText('Upload a file').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([filePath])

    // Check for preview
    await expect(page.locator('img[alt="Preview"]')).toBeVisible()
    
    // Wait for upload to complete and check success state
    await expect(page.getByText('No images uploaded yet')).not.toBeVisible()
    
    // Verify image appears in grid
    const firstImage = page.locator('.grid > div').first()
    await expect(firstImage).toBeVisible()
    
    // Test copy URL functionality
    const copyButton = firstImage.getByRole('button', { name: 'Copy URL' })
    await copyButton.click()
    
    // Test delete functionality
    const deleteButton = firstImage.getByRole('button', { name: 'Delete' })
    await deleteButton.click()
    
    // Verify image is removed
    await expect(page.getByText('No images uploaded yet')).toBeVisible()
  })

  test('sort images', async ({ authenticatedPage: page }) => {
    // Upload multiple images
    for (let i = 0; i < 3; i++) {
      const filePath = getTestImagePath(i)
      const fileChooserPromise = page.waitForEvent('filechooser')
      await page.getByText('Upload a file').click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles([filePath])
      await page.waitForTimeout(1000) // Wait for upload
    }

    // Test sort functionality
    const sortButton = page.getByRole('button', { name: /Sort by Date/ })
    await sortButton.click()
    
    // Verify sort order changed
    await expect(sortButton).toContainText('↑')
    
    // Click again to reverse sort
    await sortButton.click()
    await expect(sortButton).toContainText('↓')
  })

  test('image preview modal', async ({ authenticatedPage: page }) => {
    // Upload an image first
    const filePath = getTestImagePath()
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByText('Upload a file').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([filePath])

    // Click image to open preview modal
    await page.locator('.grid img').first().click()
    
    // Verify modal is visible
    await expect(page.locator('.fixed')).toBeVisible()
    
    // Click outside to close modal
    await page.mouse.click(0, 0)
    
    // Verify modal is closed
    await expect(page.locator('.fixed')).not.toBeVisible()
  })
})