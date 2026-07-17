import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', name: 'Home' },
  { path: '/about-me', name: 'About me' },
  { path: '/projects', name: 'Projects' },
  { path: '/recent-articles', name: 'Recent articles' },
  { path: '/hardware', name: 'Hardware' },
  { path: '/ai', name: 'AI' },
];

test.describe('Routing smoke tests', () => {
  for (const route of routes) {
    test(`${route.name} (${route.path}) loads without console errors`, async ({
      page,
    }) => {
      // recent-articles fetches from the backend - this suite tests the
      // frontend shell/routing, not a live API, so mock the response
      // rather than requiring a running backend (which CI doesn't spin up).
      await page.route('**/api/blog/announcements', (route) =>
        route.fulfill({ json: [] }),
      );

      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      const response = await page.goto(route.path);
      expect(response?.ok()).toBeTruthy();

      // Shell renders on every route
      await expect(page.locator('app-navbar')).toBeVisible();
      await expect(page.locator('app-footer')).toBeVisible();

      expect(consoleErrors).toEqual([]);
    });
  }

  test('unknown route redirects to home', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page).toHaveURL('/');
  });
});
