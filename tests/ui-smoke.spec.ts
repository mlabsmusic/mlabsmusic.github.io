import { expect, test } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_DJ_EMAIL || 'test.dj.mlabs@gmail.com';
const TEST_PASSWORD = process.env.TEST_DJ_PASSWORD || 'TestDJ-Workspace-2026!';

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 2);
}

async function loginAsTestDj(page, next = '/workspace') {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel('Email').fill(TEST_EMAIL);
  await page.getByLabel('Contraseña').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /Iniciar sesion/i }).click();
  await page.waitForURL(new RegExp(`${next.replace('/', '\\/')}`));
}

test.describe('public routes', () => {
  test('home renders core community messaging', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Perfiles de DJs/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Explorar perfiles/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('community directory shows TEST DJ', async ({ page }) => {
    await page.goto('/djs');
    await expect(page.getByRole('heading', { name: 'TEST' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Abrir perfil/i }).last()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('recordpool exposes TEST branch and helper crates', async ({ page }) => {
    await loginAsTestDj(page, '/recordpool');
    await expect(page.locator('.recordpool-tree').getByRole('button', { name: /TEST/i })).toBeVisible();
    await expect(page.locator('.recordpool-tree').getByRole('button', { name: /POR ORDENAR/i })).toBeVisible();
    await expect(page.locator('.recordpool-tree').getByRole('button', { name: /FAVORITOS/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('workspace layout renders without overflow and exposes primary actions', async ({ page }) => {
    await page.goto('/workspace');
    await expect(page.getByRole('button', { name: /Conectar carpeta/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Guardar estado/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Biblioteca en curso/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('mobile navigation opens and closes cleanly', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Solo aplica a movil');
    await page.goto('/');
    await page.getByRole('button', { name: /Abrir menu/i }).click();
    const navDjLink = page.locator('#primaryMenu').getByRole('link', { name: 'DJs' });
    await expect(navDjLink).toBeVisible();
    await page.getByRole('button', { name: /Cerrar menu/i }).click();
    await expect(navDjLink).not.toBeVisible();
  });
});

test.describe('auth flows', () => {
  test('TEST DJ can log in and see personal workspace context', async ({ page }) => {
    await loginAsTestDj(page, '/workspace');
    await expect(page.locator('#workspaceCloudUser')).toContainText('TEST');
    await expect(page.locator('#workspaceCloudLibrary')).toContainText('TEST Library');
  });

  test('apps route redirects anonymous users to login', async ({ page }) => {
    await page.goto('/apps');
    await page.waitForURL('**/login?next=/apps');
    await expect(page.getByRole('heading', { name: /Entra a tu espacio/i })).toBeVisible();
  });
});
