
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('PasteBoard UI', () => {
  test('Upload multiple files', async ({ page }) => {
    await page.click('button:has-text("Files")');
    const fileInput = page.locator('input[type="file"]');
    // Use two system files for test (adjust paths as needed for your environment)
    const file1 = '/bin/ls';
    const file2 = '/bin/bash';
    await fileInput.setInputFiles([file1, file2]);
    await page.click('button:has-text("Upload")');
    // Wait for upload success message
    await expect(page.locator('.success-message')).toHaveText(/successfully uploaded/i);
    // Check that both files appear in the list (by filename)
    await expect(page.locator('.content-item.file')).toContainText(['ls', 'bash']);
  });

test.describe('PasteBoard UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Filter Text/Links and Files', async ({ page }) => {
    await page.click('button:has-text("Text/Links")');
    await expect(page.locator('.content-item.text, .content-item.link, .content-item.code')).toHaveCountGreaterThan(0);

    await page.click('button:has-text("Files")');
    await expect(page.locator('.content-item.file, .content-item.image')).toHaveCountGreaterThan(0);
  });

  test('Copy Text/Link item', async ({ page }) => {
    await page.click('button:has-text("Text/Links")');
    const copyButton = page.locator('.copy-button').first();
    await copyButton.click();
    // Clipboard check (browser-dependent)
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard.length).toBeGreaterThan(0);
  });

  test('Download File item', async ({ page }) => {
    await page.click('button:has-text("Files")');
    const [ download ] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('.download-button').first().click()
    ]);
    const path = await download.path();
    expect(path).not.toBeNull();
  });
});
