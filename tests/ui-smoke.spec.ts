import { expect, test } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_DJ_EMAIL || 'test.dj.mlabs@gmail.com';
const TEST_PASSWORD = process.env.TEST_DJ_PASSWORD || 'TestDJ-Workspace-2026!';
const HAS_TEST_CREDENTIALS = Boolean(process.env.TEST_DJ_EMAIL && process.env.TEST_DJ_PASSWORD);

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
  try {
    await page.waitForURL(new RegExp(`${next.replace('/', '\\/')}`), { timeout: 10000 });
  } catch (error) {
    const message = await page.locator('#authMessage').textContent().catch(() => '');
    throw new Error(message ? `Login failed: ${message}` : String(error));
  }
}

test.describe('public routes', () => {
  test('home renders core community messaging', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /comunidad de DJs/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Explorar perfiles/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Así entra música al pool/i })).toBeVisible();
    await expect(page.locator('.tutorial-step img')).toHaveCount(5);
    await expect(page.getByRole('heading', { name: /MLABS es Git para comunidades musicales/i })).toBeVisible();
    await expect(page.locator('.music-ops-node')).toHaveCount(6);
    await expect(page.getByRole('heading', { name: /El DJ no sube canciones una a una/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Descargar para Mac M/i })).toHaveAttribute('href', '/downloads/MLABSFolderAgent-apple-silicon.zip');
    await expect(page.locator('.mac-agent-feature')).toHaveCount(4);
    await expect(page.getByRole('heading', { name: /El negocio no es almacenar tracks/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Ver pricing/i }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('community directory shows TEST DJ', async ({ page }) => {
    await page.goto('/djs');
    await expect(page.getByRole('heading', { name: 'TEST' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Abrir perfil/i }).last()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('recordpool exposes TEST branch and helper crates', async ({ page }) => {
    test.skip(!HAS_TEST_CREDENTIALS, 'Define TEST_DJ_EMAIL and TEST_DJ_PASSWORD for private recordpool smoke coverage');
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
    await expect(page.getByRole('heading', { name: /working/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /La ruta recomendada/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Trabaja como Git/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Historial visual/i })).toBeVisible();
    await expect(page.locator('.workspace-branch-card')).toHaveCount(4);
    await expect(page.locator('.workspace-graph-row')).toHaveCount(5);
    await page.getByPlaceholder('crate/latin-promos').fill('crate/test-branch');
    await page.getByRole('button', { name: /Crear rama/i }).click();
    await expect(page.locator('#workspaceBranchBadge')).toContainText('crate/test-branch');
    await expect(page.locator('.workspace-graph-row').filter({ hasText: 'crate/test-branch' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('demo page presents the three minute pitch', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.getByRole('heading', { name: /Tres minutos para vender MLABS/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Iniciar pitch mode/i })).toBeVisible();
    await expect(page.locator('.demo-scene')).toHaveCount(6);
    await page.getByRole('button', { name: /Iniciar pitch mode/i }).click();
    await expect(page.locator('#pitchMode')).toHaveAttribute('aria-hidden', 'false');
    await expect(page.locator('.pitch-slide.is-active')).toContainText('infraestructura');
    await page.getByRole('button', { name: /Cerrar/i }).click();
    await expect(page.locator('#pitchMode')).toHaveAttribute('aria-hidden', 'true');
    await expectNoHorizontalOverflow(page);
  });

  test('pricing page packages the commercial offer and stores leads', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: /Precio de software serio/i })).toBeVisible();
    await expect(page.locator('.pricing-card')).toHaveCount(3);
    await page.locator('.pricing-card').nth(1).getByRole('button', { name: /Vender esta version/i }).click();
    await expect(page.locator('#contactModal')).toHaveAttribute('aria-hidden', 'false');
    await page.getByLabel('Nombre').fill('Demo Buyer');
    await page.getByLabel('Email').fill('buyer@example.com');
    await page.locator('[data-lead-form]').evaluate((form) => {
      (form as HTMLFormElement).requestSubmit();
    });
    await expect(page.locator('[data-lead-status]')).toContainText('Lead guardado');
    const leads = await page.evaluate(() => JSON.parse(localStorage.getItem('mlabs_sales_leads_v1') || '[]'));
    expect(leads[0].email).toBe('buyer@example.com');
    await expectNoHorizontalOverflow(page);
  });

  test('buyer page explains the crew and label use case', async ({ page }) => {
    await page.goto('/for-crews');
    await expect(page.getByRole('heading', { name: /control de cambios musical/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Del folder privado del DJ al master/i })).toBeVisible();
    await expect(page.locator('.music-ops-node')).toHaveCount(6);
    await expect(page.locator('.buyer-card')).toHaveCount(4);
    await expect(page.locator('.launch-checklist li')).toHaveCount(5);
    await expect(page.locator('.music-ops-faq-list details')).toHaveCount(4);
    await expect(page.getByRole('link', { name: /Ver pitch/i })).toBeVisible();
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
    test.skip(!HAS_TEST_CREDENTIALS, 'Define TEST_DJ_EMAIL and TEST_DJ_PASSWORD for private workspace smoke coverage');
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
