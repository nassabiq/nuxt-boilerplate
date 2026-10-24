import { test, expect } from '@playwright/test'

test.describe('E2E: Authentication and Users Flow', () => {
    test('public landing page renders brand, hero, and features', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveTitle(/Nuxt/)
        await expect(page.locator('h1')).toContainText('Production-Grade Frontend Foundation')
        await expect(page.getByText('BFF Session Auth')).toBeVisible()
        await expect(page.getByText('Tailwind CSS 4')).toBeVisible()
    })

    test('interactive login flow and redirect to dashboard', async ({ page }) => {
        await page.goto('/login')
        await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

        // Fill credentials
        await page.locator('#email').fill('admin@example.com')
        await page.locator('#password').fill('password123')
        await page.getByRole('button', { name: 'Sign In' }).click()

        // Should redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/)
        await expect(page.getByRole('heading', { name: 'Dashboard Overview' })).toBeVisible()
    })

    test('users management page displays table and handles modal interactions', async ({
        page
    }) => {
        // Navigate directly (or through login)
        await page.goto('/login')
        await page.locator('#email').fill('admin@example.com')
        await page.locator('#password').fill('password123')
        await page.getByRole('button', { name: 'Sign In' }).click()
        await expect(page).toHaveURL(/\/dashboard/)

        // Go to Users Management
        await page.goto('/dashboard/users')
        await expect(page.getByRole('heading', { name: 'Users Management' })).toBeVisible()
        await expect(page.getByRole('table')).toBeVisible()

        // Verify at least one user row rendered
        await expect(page.getByText('Admin User')).toBeVisible()

        // Open Add User Dialog
        await page.getByRole('button', { name: 'Add User' }).click()
        await expect(page.getByRole('heading', { name: 'Add New User' })).toBeVisible()
        await expect(page.locator('#name')).toBeVisible()
        await expect(page.locator('#email')).toBeVisible()
    })
})
