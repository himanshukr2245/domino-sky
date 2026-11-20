import { mkdir } from 'node:fs/promises';
import { test, expect, type Page } from '@playwright/test';

async function openCockpit(page: Page) {
  await page.goto('/app');
  await expect(page.locator('[data-app-hydrated="true"]')).toBeVisible();
}

test('route, timeline, manifest and cause chain share one flight selection', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await openCockpit(page);
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  const route = page.getByRole('button', { name: /^Inspect route AMD-BOM,/ });
  await route.focus();
  await route.press('Enter');
  // This two-way route selects its most delayed flight: DS0405, before DS0302.
  await expect(page.getByTestId('flight-inspector').getByRole('heading', { level: 2 })).toContainText('DS0405');
  await expect(page.getByRole('button', { name: /^Timeline DS0405,/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /^Timeline DS0303,/ }).click();
  await expect(page.getByRole('button', { name: /^Inspect DS0303,/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Route flight DS0303', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const turn = page.getByRole('region', { name: 'Turnaround slack accounting' });
  await expect(turn.getByText('Inbound delay absorbed').locator('..')).toHaveText('Inbound delay absorbed5 min');
  await expect(turn.getByText('Delay inherited from aircraft').locator('..')).toHaveText('Delay inherited from aircraft20 min');
  await page.getByRole('button', { name: 'Trace DS0302 delay cause' }).click();
  await expect(page.getByTestId('flight-inspector').getByRole('heading', { level: 2 })).toContainText('DS0302');
  expect(errors).toEqual([]);
});

test('airport focus filters the view and never silently edits the closure', async ({ page }) => {
  await openCockpit(page);
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  await page.getByLabel('Airport focus', { exact: true }).selectOption('BLR');
  await expect(page.getByTestId('scenario-status')).toContainText('BOM closed 14:30–16:00 IST');
  await expect(page.getByLabel('Airport', { exact: true })).toHaveValue('BOM');
  await expect(page.getByRole('button', { name: 'Focus Bengaluru airport BLR' })).toHaveAttribute('aria-pressed', 'true');
  const rows = page.getByRole('region', { name: 'Flight results' }).getByRole('button');
  expect(await rows.count()).toBeGreaterThan(0);
  for (const label of await rows.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')))) expect(label).toMatch(/BLR/);
  await page.getByRole('button', { name: 'Clear focus', exact: true }).click();
  await expect(rows).toHaveCount(70);
});

test('selecting a flight clears conflicting filters and leaves the calculation intact', async ({ page }) => {
  await openCockpit(page);
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  const delayed = await page.getByTestId('delayed-flights').textContent();
  await page.getByLabel('Airport focus', { exact: true }).selectOption('BOM');
  await page.getByLabel('Flight filter', { exact: true }).selectOption('delayed');
  await page.getByLabel('Search flights').fill('DS0302');
  await expect(page.getByRole('region', { name: 'Flight results' }).getByRole('button')).toHaveCount(1);
  await page.getByRole('button', { name: /^Timeline DS0301,/ }).click();
  await expect(page.getByLabel('Airport focus', { exact: true })).toHaveValue('all');
  await expect(page.getByLabel('Flight filter', { exact: true })).toHaveValue('all');
  await expect(page.getByLabel('Search flights')).toHaveValue('');
  await expect(page.getByRole('region', { name: 'Flight results' }).getByRole('button')).toHaveCount(70);
  await expect(page.getByTestId('delayed-flights')).toHaveText(delayed!);
  await page.getByLabel('Search flights').fill('NO-SUCH-FLIGHT');
  await expect(page.getByText('No flights match this view.')).toBeVisible();
  await page.getByRole('button', { name: 'Show all flights', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Flight results' }).getByRole('button')).toHaveCount(70);
});

test('Kolkata preset exposes a missed connection and its exact transfer shortfall', async ({ page }) => {
  await openCockpit(page);
  await page.getByRole('button', { name: /Kolkata connection squeeze/ }).click();
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  await expect(page.getByTestId('scenario-status')).toContainText('CCU closed 12:00–13:00 IST');
  await page.getByRole('button', { name: 'Outbound DS0105', exact: true }).click();
  const inspector = page.getByTestId('flight-inspector');
  await inspector.locator('summary').click();
  await expect(inspector.getByText('CX14 · 20 passengers')).toBeVisible();
  await expect(inspector.getByText('-10 min available / 45 min required')).toBeVisible();
  await expect(inspector.getByText('Missed · 55 min short')).toBeVisible();
});

test('keyboard airport control, reduced effects and timeline scope remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openCockpit(page);
  await expect(page.locator('.ds-tail-label')).toHaveCount(1);
  const airport = page.getByRole('button', { name: 'Focus Mumbai airport BOM' });
  await airport.focus();
  await airport.press('Space');
  await expect(page.getByLabel('Airport focus', { exact: true })).toHaveValue('BOM');
  await page.getByLabel('Aircraft timeline scope').selectOption('all');
  await expect(page.locator('.ds-tail-label')).toHaveCount(16);
  await page.getByRole('button', { name: 'Reduce effects', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/reduce-effects/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('production cockpit has no page errors and captures its verified layout', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await openCockpit(page);
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  await page.getByRole('button', { name: /^Timeline DS0303,/ }).click();
  await page.evaluate(() => scrollTo(0, 0));
  await mkdir('.hk/qa', { recursive: true });
  await page.screenshot({ path: `.hk/qa/phase2-${testInfo.project.name}.png`, fullPage: true });
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
