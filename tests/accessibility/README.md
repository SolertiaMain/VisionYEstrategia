# Automatizacion de accesibilidad

Esta carpeta convierte la matriz WCAG y el CSV de pruebas en una suite reutilizable para clientes futuros.

## Framework propuesto

- `@playwright/test`: abre Chromium real en modo headless y permite probar teclado, foco, viewport movil, zoom y formularios.
- `axe-core`: corre auditorias automaticas WCAG sobre el DOM renderizado.
- GitHub Actions: ejecuta build + pruebas en cada push o pull request.

## Que se automatiza ahora

- Skip link y foco en `main`.
- Navegacion principal y dropdown de Servicios con teclado.
- Menu movil, `aria-expanded`, foco inicial y cierre con Escape.
- FAQ con Enter, Espacio y Escape.
- Tabs de `servicios.html` con flechas, Home, End, Enter y Espacio.
- Formulario: errores, sugerencias, `aria-invalid`, foco al primer error y mensaje de exito.
- Reflow sin scroll horizontal en 320 px.
- Axe sin violaciones `critical` o `serious`.
- Cobertura documental: cada fila del CSV queda clasificada como `automated`, `semi-automated` o `manual`.

## Que queda manual o semiautomatico

NVDA, VoiceOver y revision humana de orden logico/foco visible siguen siendo necesarios para certificacion real. Playwright puede detectar mucho, pero no reemplaza una prueba con tecnologia asistiva ni la validacion experta de criterio WCAG.

## Comandos

```bash
npm run test:a11y
npm run test:a11y:ui
npm run test:a11y:report
```

Antes de correr por primera vez:

```bash
npm install
npx playwright install chromium
```
