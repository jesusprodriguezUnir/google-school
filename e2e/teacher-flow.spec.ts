import { test, expect } from '@playwright/test';

test('Teacher Dashboard Flow', async ({ page }) => {
    // 1. Go to Login
    await page.goto('/');

    // 2. Click "Teacher" Demo Button
    // The button contains "Teacher" and the teacher's name. We use a locator that finds the button wrapping it.
    const teacherBtn = page.locator('button').filter({ hasText: 'Teacher' }).first();
    await teacherBtn.click();

    // 3. Verify Dashboard Loaded
    // Account for navigation/loading time
    await expect(page.getByText('Command Center')).toBeVisible({ timeout: 10000 });

    // 4. Verify Analytics Presence
    await expect(page.getByText('Class Average')).toBeVisible();

    // 5. Test Quick Filter
    await page.getByText('Needs Attention').click();

    // 6. Test Multi-Class Switching
    // Wait for the class selector to appear
    await expect(page.getByText('1º ESO A')).toBeVisible();
});
