import { test, expect } from '@playwright/test';

test('golden path: open cockpit, close Mumbai, inspect the cascade, reset', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Domino Sky' })).toBeVisible();
  await expect(page.locator('[data-app-hydrated="true"]')).toBeVisible();
  await page.getByRole('link', { name: 'Open cockpit', exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Operations cockpit' })).toBeVisible();
  await expect(page.getByTestId('delayed-flights')).toHaveText('0');
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  await expect(page.getByTestId('scenario-status')).toContainText('BOM closed 14:30–16:00 IST');
  await expect(page.getByTestId('delayed-flights')).not.toHaveText('0');
  await page.getByRole('button', { name: /^Inspect DS0303,/ }).click();
  await expect(page.getByRole('heading', { name: /DS0303/ })).toBeVisible();
  await expect(page.getByText('Aircraft arriving late from DS0302; minimum turnaround still required.')).toBeVisible();
  await expect(page.getByText('605 / 600 min duty', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset to baseline' }).click();
  await expect(page.getByTestId('delayed-flights')).toHaveText('0');
  await expect(page.getByTestId('crew-breaches')).toHaveText('0');
});

test('changing inputs preserves the last computed result until rerun', async ({ page }) => {
  await page.goto('/app');
  await expect(page.locator('[data-app-hydrated="true"]')).toBeVisible();
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  await page.getByLabel('Airport', { exact: true }).selectOption('DEL');
  await expect(page.getByTestId('scenario-status')).toContainText('Inputs changed');
  await expect(page.getByTestId('scenario-status')).toContainText('BOM closed');
  await page.getByRole('button', { name: 'Run disruption', exact: true }).click();
  await expect(page.getByTestId('scenario-status')).toContainText('DEL closed');
});

test('phone and laptop have no horizontal page overflow', async ({ page }) => {
  await page.goto('/app');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('health: liveness and readiness report the actual network', async ({ request }) => {
  const live = await request.get('/api/health');
  expect(live.status()).toBe(200);
  expect(await live.json()).toMatchObject({ status: 'ok' });
  const ready = await request.get('/api/health?deep=1');
  expect(ready.status()).toBe(200);
  expect((await ready.json()).checks).toMatchObject({ network: 'ok', flights: 70 });
});
