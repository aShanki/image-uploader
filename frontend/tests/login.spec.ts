import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Start intercepting auth routes
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ isLoggedIn: false })
      })
    })

    await page.goto('/login')
  })

  test('shows login form with all elements', async ({ page }) => {
    await expect(page.getByText('Sign in to Image Uploader')).toBeVisible()
    await expect(page.getByLabel('Username')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('requires both username and password', async ({ page }) => {
    // Try with no credentials
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/login')

    // Try with only username
    await page.getByLabel('Username').fill('admin')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/login')

    // Try with only password
    await page.getByLabel('Username').clear()
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('handles successful login', async ({ page }) => {
    // Mock successful auth response
    await page.route('/api/auth/*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        })
      }
    })

    // Fill in correct credentials
    await page.getByLabel('Username').fill(process.env.AUTH_USERNAME || 'admin')
    await page.getByLabel('Password').fill(process.env.AUTH_PASSWORD || 'secure_password_here')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Should redirect to home
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Image Uploader')).toBeVisible()
  })

  test('handles failed login', async ({ page }) => {
    // Mock failed auth response
    await page.route('/api/auth/*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid credentials' })
        })
      }
    })

    // Fill in wrong credentials
    await page.getByLabel('Username').fill('wrong')
    await page.getByLabel('Password').fill('wrong')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Should stay on login page with error
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })

  test('redirects to login when accessing protected route', async ({ page }) => {
    // Try to access home page without auth
    await page.goto('/')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('remembers auth state', async ({ page }) => {
    // Mock successful auth
    await page.route('/api/auth/*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        })
      }
    })

    // Login
    await page.getByLabel('Username').fill(process.env.AUTH_USERNAME || 'admin')
    await page.getByLabel('Password').fill(process.env.AUTH_PASSWORD || 'secure_password_here')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Navigate away and back
    await page.goto('/some-other-page')
    await page.goto('/')

    // Should still be logged in
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Image Uploader')).toBeVisible()
  })
})