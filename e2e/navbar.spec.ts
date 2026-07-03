import { test, expect } from '@playwright/test';

test.describe('Navbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows top-level nav links', async ({ page }) => {
    const nav = page.locator('app-navbar nav');
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Projects' })).toBeVisible();
    // "Articles" is an ngbDropdownToggle <a> with no href attribute, so it
    // has no implicit ARIA link role (an <a> only gets the link role when
    // it has an href, even an empty one) - getByRole('link', ...) will
    // never match it.
    await expect(
      nav.locator('a.dropdown-toggle', { hasText: 'Articles' }),
    ).toBeVisible();
    await expect(nav.getByRole('link', { name: 'About me' })).toBeVisible();
  });

  test('Articles dropdown exposes Recent articles, Hardware, AI', async ({
    page,
  }) => {
    const nav = page.locator('app-navbar nav');
    await nav.locator('a.dropdown-toggle', { hasText: 'Articles' }).click();
    const dropdown = page.locator('.dropdown-menu');
    await expect(dropdown.getByRole('link', { name: 'Recent articles' })).toBeVisible();
    await expect(dropdown.getByRole('link', { name: 'Hardware' })).toBeVisible();
    await expect(dropdown.getByRole('link', { name: 'AI' })).toBeVisible();
  });

  test('social links point to the right profiles', async ({ page }) => {
    const linkedin = page.getByRole('link', { name: 'LinkedIn' });
    const github = page.getByRole('link', { name: 'Github' });
    await expect(linkedin).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/patryksadowski/',
    );
    await expect(github).toHaveAttribute(
      'href',
      'https://github.com/Patryk-S-W',
    );
  });

  test('mobile: toggler expands the collapsed nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const toggler = page.getByRole('button', { name: 'Toggle navigation' });
    await expect(toggler).toBeVisible();

    const collapse = page.locator('#navbarSupportedContent');
    await expect(collapse).not.toHaveClass(/show/);

    await toggler.click();
    await expect(collapse).toHaveClass(/show/);
  });
});
