import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

for (const theme of ['light', 'dark'] as const) {
  test('recovery comparison is accessible in ' + theme + ' appearance', async ({ page }, testInfo) => {
    test.setTimeout(60000);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.goto('/app'); await expect(page.locator('[data-app-hydrated="true"]')).toBeVisible();
    await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
    await page.getByRole('button', { name: /^Preview plan:/ }).first().click();
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
    if (theme === 'dark') {
      await mkdir('.hk/qa', { recursive: true });
      await page.screenshot({ path: '.hk/qa/phase3-' + testInfo.project.name + '.png', fullPage: true });
    }
  });
}

test('recovery preserves the original disruption, applies a feasible plan, and undoes it', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/app');
  await expect(page.locator('[data-app-hydrated="true"]')).toBeVisible();
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  await expect(page.getByTestId('crew-breaches')).toHaveText('2');
  const panel = page.getByRole('region', { name: 'Change the outcome. Keep the evidence.' });
  await panel.getByRole('button', { name: /^Preview plan:/ }).first().click();
  await expect(page.getByTestId('scenario-status')).toContainText('Recovery preview');
  await expect(page.getByTestId('crew-breaches')).toHaveText('0');
  await expect(panel.getByRole('row', { name: /Arrival delay/ })).toContainText('135');
  await panel.getByRole('button', { name: 'Apply recovery', exact: true }).click();
  await expect(page.getByTestId('scenario-status')).toContainText('Recovery applied');
  await expect(page.getByTestId('cancelled-boardings')).not.toHaveText('0');
  await page.getByLabel('Flight filter', { exact: true }).selectOption('cancelled');
  await page.getByRole('button', { name: /^Inspect DS0405,/ }).click();
  await expect(page.getByTestId('flight-inspector')).toContainText('No operated arrival');
  await panel.getByRole('button', { name: 'Undo recovery', exact: true }).click();
  await expect(page.getByTestId('crew-breaches')).toHaveText('2');
  await expect(page.getByTestId('cancelled-boardings')).toHaveText('0');
  expect(errors).toEqual([]);
});

test('unresolved crew constraints cannot be applied', async ({ page }) => {
  await page.goto('/app'); await expect(page.locator('[data-app-hydrated="true"]')).toBeVisible();
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  await page.getByRole('button', { name: /^Preview plan: Keep the disrupted schedule/ }).click();
  await expect(page.getByRole('button', { name: 'Apply recovery', exact: true })).toBeDisabled();
});

test('recovery API rejects forged inputs and cross-origin writes without exposing secrets', async ({ request, baseURL }) => {
  const crossOrigin = await request.post('/api/recovery', { headers: { Origin: 'https://other.example' }, data: { closure: { airport: 'BOM', start: 870, end: 960 } } });
  expect(crossOrigin.status()).toBe(403);
  for (const payload of [{ closure: { airport: 'XXX', start: 870, end: 960 } }, { closure: { airport: 'BOM', start: 960, end: 870 } }, { closure: { airport: 'BOM', start: 870, end: 960 }, apiKey: 'forged-value' }]) {
    const response = await request.post('/api/recovery', { headers: { Origin: baseURL! }, data: payload });
    expect(response.status()).toBe(400);
    expect(await response.text()).not.toMatch(/SUPABASE_PUBLISHABLE_KEY|GEMINI_API_KEY|postgresql:\/\//);
  }
});

test('a late AI response cannot overwrite a newer scenario', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/recovery', async route => {
    await pending;
    await route.fulfill({ json: { scenarioKey: 'domino-v2:BOM:870:960', recommendedId: 'plan-deadbeef', adviserMode: 'gemini', reasonCodes: [], providerStatus: 'ready' } }).catch(() => {});
  });
  await page.goto('/app'); await expect(page.locator('[data-app-hydrated="true"]')).toBeVisible();
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  await page.getByRole('button', { name: 'Ask Gemini to review' }).click();
  await page.getByLabel('Airport', { exact: true }).selectOption('DEL');
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  release();
  await expect(page.getByTestId('scenario-status')).toContainText('DEL closed');
  await expect(page.getByText('GEMINI · VERIFIED FACTS')).toHaveCount(0);
});
