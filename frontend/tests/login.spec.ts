import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('shows login form', async ({ page }) => {
    await expect(page.getByText('Sign in to Image Uploader')).toBeVisible()
    await expect(page.getByLabel('Username')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('requires username and password', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign in' })
    await signInButton.click()
    
    // Check that we're still on the login page
    await expect(page).toHaveURL('/login')
  })

  test('successful login redirects to home', async ({ page }) => {
    await page.getByLabel('Username').fill(process.env.AUTH_USERNAME || 'admin')
    await page.getByLabel('Password').fill(process.env.AUTH_PASSWORD || 'secure_password_here')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    // Should redirect to home page
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Image Uploader')).toBeVisible()
  })

  test('failed login shows error', async ({ page }) => {
    await page.getByLabel('Username').fill('wrong')
    await page.getByLabel('Password').fill('wrong')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    // Should stay on login page
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })
})