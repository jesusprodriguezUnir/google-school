import { test, expect } from '@playwright/test';

test('Director Directory Navigation', async ({ page }) => {
    // 1. Go to Login
    await page.goto('/');

    // 2. Click "Principal" Demo Button
    const principalBtn = page.locator('button').filter({ hasText: 'Principal' }).first();
    await principalBtn.click();

    // 3. Verify Dashboard Loaded
    await expect(page.getByText('Demo App')).toBeVisible();

    // 4. Test Student Directory
    await page.click('text=Students');
    await expect(page.getByText('Student Directory')).toBeVisible();
    // Check for class cards (assuming mock data has classes)
    await expect(page.getByText('1º ESO A')).toBeVisible();

    // 5. Test Teacher Directory
    await page.click('text=Teachers');
    await expect(page.getByText('Teacher Directory')).toBeVisible();

    // 6. Test Parent Directory
    await page.click('text=Parents');
    await expect(page.getByText('Parent Directory')).toBeVisible();
});
