import { test, expect } from '@playwright/test';

test.describe('Solar System App', () => {
  test('loads the map and renders planets', async ({ page }) => {
    await page.goto('/');
    
    // Check map container exists
    const map = page.locator('#map');
    await expect(map).toBeVisible();

    // Check that Sun exists
    const sun = page.locator('.sun');
    await expect(sun).toBeVisible();

    // Check that at least one planet marker exists
    const earth = page.locator('.planet-earth');
    await expect(earth).toBeVisible();
    
    // Check tooltip content on Earth (hover to show tooltip if not visible or just wait for permanent tooltip)
    // Actually the tooltips are permanent so we can check their text
    const textContent = await page.textContent('.leaflet-tooltip-pane');
    expect(textContent).toContain('Earth');
    expect(textContent).toContain('365.25 Earth days');
    expect(textContent).toMatch(/0\.9[89] AU|1\.0[01] AU/); // Earth should be roughly 1 AU (0.98 to 1.01 depending on time of year)
  });

  test('interacts with a planet marker', async ({ page }) => {
    await page.goto('/');
    
    const mars = page.locator('.planet-mars').first();
    await mars.click();

    // When clicked, Mars should turn green.
    // SVG circle fillColor should be #00FF00
    await expect(mars).toHaveAttribute('fill', '#00FF00');

    // Click on the background map (using a coordinate in empty space)
    await page.mouse.click(10, 10);

    // Mars should revert back to original color (#C1440E)
    await expect(mars).toHaveAttribute('fill', '#C1440E');
  });
});
