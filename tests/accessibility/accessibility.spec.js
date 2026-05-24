import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const pages = ['/', '/nosotros.html', '/servicios.html', '/contacto.html'];

async function gotoReady(page, url) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(850);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

test.describe('Cobertura documental', () => {
  test('cada prueba del CSV esta clasificada para automatizacion', async () => {
    const csv = fs.readFileSync(path.resolve('PruebasAccesibilidad - Isaí.csv'), 'utf8');
    const [, ...rows] = parseCsv(csv);
    const matrix = JSON.parse(fs.readFileSync(path.resolve('tests/accessibility/test-matrix.json'), 'utf8'));
    const mappedNames = new Set(matrix.map((item) => item.name));
    const missing = rows.map((row) => row[0]).filter((name) => !mappedNames.has(name));

    expect(missing).toEqual([]);
  });
});

test.describe('Axe WCAG automatico', () => {
  for (const route of pages) {
    test(`sin violaciones critical/serious en ${route}`, async ({ page }) => {
      await gotoReady(page, route);
      await page.addScriptTag({ path: axePath });

      const results = await page.evaluate(async () => {
        return window.axe.run(document, {
          resultTypes: ['violations'],
        });
      });

      const blocking = results.violations.filter((violation) => {
        return ['critical', 'serious'].includes(violation.impact);
      });

      expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    });
  }
});

test.describe('WCAG 1.1.1 Contenido no textual', () => {
  for (const route of pages) {
    test(`imagenes e iconos tienen alternativa adecuada en ${route}`, async ({ page }) => {
      await gotoReady(page, route);

      const issues = await page.evaluate(() => {
        const text = (value) => (value || '').trim();
        const isHidden = (element) => {
          return Boolean(element.closest('[aria-hidden="true"], [hidden]'));
        };

        const imageIssues = [...document.querySelectorAll('img')].flatMap((image) => {
          if (isHidden(image)) return [];
          return image.hasAttribute('alt')
            ? []
            : [`img sin alt: ${image.outerHTML.slice(0, 120)}`];
        });

        const svgIssues = [...document.querySelectorAll('svg')].flatMap((svg) => {
          if (isHidden(svg)) return [];

          const hasAccessibleRole = svg.getAttribute('role') === 'img';
          const hasAccessibleName = Boolean(
            text(svg.getAttribute('aria-label')) ||
            text(svg.getAttribute('aria-labelledby')) ||
            text(svg.querySelector('title')?.textContent)
          );

          return hasAccessibleRole && hasAccessibleName
            ? []
            : [`svg sin aria-hidden o alternativa textual: ${svg.outerHTML.slice(0, 120)}`];
        });

        return [...imageIssues, ...svgIssues];
      });

      expect(issues).toEqual([]);
    });
  }
});

test.describe('WCAG 1.3.1 Informacion y relaciones', () => {
  for (const route of pages) {
    test(`estructura semantica coherente en ${route}`, async ({ page }) => {
      await gotoReady(page, route);

      const issues = await page.evaluate(() => {
        const visible = (element) => {
          return !element.closest('[hidden], [aria-hidden="true"]');
        };

        const selectors = [
          '.hero-stats',
          '.grid-3',
          '.valor-pillars',
          '.proceso-steps',
          '.about-tags',
          '.testimonial-grid',
          '.faq-grid',
          '.valores-grid',
          '.team-grid',
          '.timeline',
          '.normas-tags',
          '.quick-contact-grid',
          '.contact-details',
          '.social-bar',
          '.normas-list',
          '.mini-stats',
          '.modalidades-grid',
          '.modalidad-features',
        ];

        const semanticIssues = [];
        const mains = [...document.querySelectorAll('main')].filter(visible);
        if (mains.length !== 1) {
          semanticIssues.push(`main visible esperado: 1, encontrado: ${mains.length}`);
        }

        const main = mains[0] || document;
        const h1s = [...main.querySelectorAll('h1')].filter(visible);
        if (h1s.length !== 1) {
          semanticIssues.push(`h1 visible dentro de main esperado: 1, encontrado: ${h1s.length}`);
        }

        const headings = [...main.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(visible);
        headings.reduce((previousLevel, heading) => {
          const level = Number(heading.tagName.slice(1));
          if (previousLevel && level > previousLevel + 1) {
            semanticIssues.push(`salto de encabezado h${previousLevel} a h${level}: ${heading.textContent.trim()}`);
          }
          return level;
        }, 0);

        selectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((element) => {
            if (!visible(element)) return;
            const isList = ['UL', 'OL'].includes(element.tagName);
            if (!isList) semanticIssues.push(`${selector} debe ser ul u ol`);
          });
        });

        document.querySelectorAll('form input, form select, form textarea').forEach((control) => {
          if (!visible(control) || ['hidden', 'submit', 'button', 'reset'].includes(control.type)) return;
          const hasName = control.labels?.length ||
            control.getAttribute('aria-label') ||
            control.getAttribute('aria-labelledby');
          if (!hasName) {
            semanticIssues.push(`control de formulario sin label: ${control.outerHTML.slice(0, 120)}`);
          }
        });

        return semanticIssues;
      });

      expect(issues).toEqual([]);
    });
  }
});

test.describe('WCAG 1.3.2 Secuencia significativa', () => {
  for (const route of pages) {
    test(`orden DOM coincide con el orden visual significativo en ${route}`, async ({ page }) => {
      await gotoReady(page, route);

      const issues = await page.evaluate(() => {
        const isVisible = (element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            Number(style.opacity) !== 0 &&
            rect.width > 0 &&
            rect.height > 0 &&
            !element.closest('[hidden], [aria-hidden="true"]');
        };

        const isInNormalFlow = (element) => {
          const style = window.getComputedStyle(element);
          return !['fixed', 'absolute', 'sticky'].includes(style.position);
        };

        const labelFor = (element) => {
          return [
            element.tagName.toLowerCase(),
            element.id ? `#${element.id}` : '',
            element.className ? `.${String(element.className).trim().split(/\s+/).join('.')}` : '',
            element.textContent.trim().replace(/\s+/g, ' ').slice(0, 60),
          ].filter(Boolean).join('');
        };

        const sequenceIssues = [];

        document.querySelectorAll('[tabindex]').forEach((element) => {
          const tabindex = Number(element.getAttribute('tabindex'));
          if (tabindex > 0) {
            sequenceIssues.push(`tabindex positivo no permitido: ${labelFor(element)}`);
          }
        });

        document.querySelectorAll('main *').forEach((element) => {
          const style = window.getComputedStyle(element);
          if (style.order && Number(style.order) !== 0) {
            sequenceIssues.push(`CSS order reordena contenido: ${labelFor(element)}`);
          }
          if (style.flexDirection.includes('reverse')) {
            sequenceIssues.push(`flex-direction reverse altera secuencia: ${labelFor(element)}`);
          }
        });

        const main = document.querySelector('main');
        if (!main) return ['main no encontrado'];

        const byVisualPosition = (a, b) => {
          const aBox = a.getBoundingClientRect();
          const bBox = b.getBoundingClientRect();
          const topDelta = aBox.top - bBox.top;
          if (Math.abs(topDelta) > 10) return topDelta;
          return aBox.left - bBox.left;
        };

        const checkDirectChildren = (container, childSelector, label) => {
          const children = [...container.querySelectorAll(`:scope > ${childSelector}`)]
            .filter((element) => isVisible(element) && isInNormalFlow(element));
          const visualChildren = [...children].sort(byVisualPosition);

          children.forEach((element, domIndex) => {
            const visualIndex = visualChildren.indexOf(element);
            if (visualIndex !== domIndex) {
              sequenceIssues.push(
                `${label}: DOM ${domIndex + 1}, visual ${visualIndex + 1}, ${labelFor(element)}`
              );
            }
          });
        };

        const groupedContainers = [
          ['.hero-stats', 'li'],
          ['.grid-3', 'li'],
          ['.valor-pillars', 'li'],
          ['.reveal-right', 'li'],
          ['.proceso-steps', 'li'],
          ['.about-tags', 'li'],
          ['.testimonial-grid', 'li'],
          ['.faq-grid', 'li'],
          ['.valores-grid', 'li'],
          ['.team-grid', 'li'],
          ['.timeline', 'li'],
          ['.normas-tags', 'li'],
          ['.quick-contact-grid', 'li'],
          ['.contact-details', 'li'],
          ['.social-bar', 'li'],
          ['.normas-list', 'li'],
          ['.mini-stats', 'li'],
          ['.modalidades-grid', 'li'],
          ['.modalidad-features', 'li'],
          ['.form-grid', '.form-field'],
          ['.grid-2', '*'],
          ['.contact-grid', '*'],
          ['.service-detail', '*'],
        ];

        groupedContainers.forEach(([containerSelector, childSelector]) => {
          document.querySelectorAll(containerSelector).forEach((container) => {
            if (!isVisible(container) || !isInNormalFlow(container)) return;
            checkDirectChildren(container, childSelector, containerSelector);
          });
        });

        const focusableSelector = [
          'a[href]',
          'button:not([disabled])',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(',');

        document.querySelectorAll('.quick-card, .modalidad-card, .map-placeholder').forEach((container) => {
          if (!isVisible(container)) return;
          const focusables = [...container.querySelectorAll(focusableSelector)]
            .filter((element) => isVisible(element) && isInNormalFlow(element));
          const visualFocusOrder = [...focusables].sort(byVisualPosition);

          focusables.forEach((element, domIndex) => {
            const visualIndex = visualFocusOrder.indexOf(element);
            if (visualIndex !== domIndex) {
              sequenceIssues.push(
                `orden de foco dentro de ${labelFor(container)}: DOM ${domIndex + 1}, visual ${visualIndex + 1}, ${labelFor(element)}`
              );
            }
          });
        });

        return sequenceIssues;
      });

      expect(issues).toEqual([]);
    });
  }
});

test.describe('Teclado y foco', () => {
  test('skip link mueve el foco al contenido principal', async ({ page }) => {
    await gotoReady(page, '/');

    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator('#contenido-principal')).toBeFocused();
  });

  test('dropdown de Servicios abre con foco y cierra con Escape', async ({ page }) => {
    test.skip(page.viewportSize()?.width < 768, 'El dropdown de escritorio no se muestra en viewport movil.');

    await gotoReady(page, '/');

    const trigger = page.locator('.nav-services-trigger').first();
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#servicios-submenu .dropdown-link').first()).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(page.locator('#servicios-submenu .dropdown-link').first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });

  test('menu movil abre, atrapa foco y cierra con Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page, '/');

    const hamburger = page.locator('.hamburger');
    const menu = page.locator('#mobile-menu');
    await hamburger.focus();
    await page.keyboard.press('Enter');

    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();
    await expect(menu.locator('a').first()).toBeFocused();

    await menu.locator('a').last().focus();
    await page.keyboard.press('Tab');
    await expect(menu.locator('a').first()).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(menu.locator('a').last()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
    await expect(hamburger).toBeFocused();
  });

  test('FAQ responde a Enter, Espacio y Escape', async ({ page }) => {
    await gotoReady(page, '/');

    const question = page.locator('.faq-question').first();
    const panel = page.locator(`#${await question.getAttribute('aria-controls')}`);
    await question.focus();

    await page.keyboard.press('Enter');
    await expect(question).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(question).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('Space');
    await expect(question).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(question).toHaveAttribute('aria-expanded', 'false');
    await expect(question).toBeFocused();
  });

  test('tabs de servicios soportan flechas, Home, End, Enter y Espacio', async ({ page }) => {
    await gotoReady(page, '/servicios.html');

    const igualdad = page.locator('#tab-igualdad');
    const gestion = page.locator('#tab-gestion');
    const evaluacion = page.locator('#tab-evaluacion');

    await igualdad.focus();
    await page.keyboard.press('ArrowRight');
    await expect(gestion).toBeFocused();
    await expect(gestion).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#gestion')).toBeVisible();

    await page.keyboard.press('End');
    await expect(evaluacion).toBeFocused();
    await expect(evaluacion).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('Home');
    await expect(igualdad).toBeFocused();
    await expect(igualdad).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await expect(gestion).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(evaluacion).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('Formulario accesible', () => {
  test('formulario vacio enfoca primer error y marca aria-invalid', async ({ page }) => {
    await gotoReady(page, '/contacto.html');

    await page.getByRole('button', { name: /enviar solicitud/i }).click();

    await expect(page.locator('#nombre')).toBeFocused();
    await expect(page.locator('#nombre')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#nombre-error')).toBeVisible();
    await expect(page.locator('#form-status')).toContainText('Hay errores en el formulario');
  });

  test('email y telefono invalidos muestran sugerencias', async ({ page }) => {
    await gotoReady(page, '/contacto.html');

    await page.locator('#nombre').fill('Isaí Prueba');
    await page.locator('#organizacion').fill('Organizacion demo');
    await page.locator('#mensaje').fill('Necesito una evaluacion de accesibilidad.');
    await page.locator('#email').fill('isaigmail.com');
    await page.locator('#telefono').fill('abc');
    await page.getByRole('button', { name: /enviar solicitud/i }).click();

    await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#email-error')).toContainText('nombre@dominio.com');

    await page.locator('#email').fill('isai@example.com');
    await page.locator('#telefono').blur();
    await expect(page.locator('#telefono')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#telefono-error')).toContainText('722-000-0000');
  });

  test('campos tienen nombre accesible y el exito se anuncia como status', async ({ page }) => {
    await gotoReady(page, '/contacto.html');

    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();
    await expect(page.getByLabel(/^organización/i)).toBeVisible();
    await expect(page.getByLabel(/correo electrónico/i)).toBeVisible();
    await expect(page.getByLabel(/teléfono de contacto/i)).toBeVisible();
    await expect(page.getByLabel(/cuéntanos tu situación/i)).toBeVisible();

    await page.getByLabel(/nombre completo/i).fill('Isaí Prueba');
    await page.getByLabel(/^organización/i).fill('Organizacion demo');
    await page.getByLabel(/correo electrónico/i).fill('isai@example.com');
    await page.getByLabel(/cuéntanos tu situación/i).fill('Necesito una evaluacion de accesibilidad.');
    await page.getByRole('button', { name: /enviar solicitud/i }).click();

    const success = page.locator('#form-success');
    await expect(success).toBeVisible();
    await expect(success).toHaveAttribute('role', 'status');
    await expect(success).toHaveAttribute('aria-live', 'polite');
    await expect(success).toBeFocused();
  });
});

test.describe('Reflow y header fijo', () => {
  for (const route of pages) {
    test(`sin overflow horizontal a 320px en ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await gotoReady(page, route);

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalOverflow).toBe(false);
    });
  }

  test('anclas de servicios no quedan ocultas por header', async ({ page }) => {
    await gotoReady(page, '/servicios.html#gestion');

    const panelBox = await page.locator('#gestion').boundingBox();
    const headerBox = await page.locator('.navbar').boundingBox();

    expect(panelBox.top).toBeGreaterThanOrEqual(headerBox.height - 1);
  });
});
