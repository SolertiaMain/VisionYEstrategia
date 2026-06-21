# Visión y Estrategia Consultoría — Sitio Web

> **Ideas Ágiles** | Consultoría especializada en Igualdad de Género, Gestión Pública y Evaluación de Programas.

---

## 📁 Estructura del proyecto

```
vision-estrategia/
│
├── index.html          → Página de inicio (Home)
├── nosotros.html       → Quiénes somos / Equipo / Historia
├── servicios.html      → Los tres servicios con tabs interactivos
├── contacto.html       → Formulario, mapa y canales de contacto
│
├── css/
│   ├── styles.css      → Estilos principales + componentes
│   ├── responsive.css  → Media queries (tablet y móvil)
│   └── animations.css  → Animaciones, scroll reveal y efectos
│
├── js/
│   └── main.js         → Toda la funcionalidad JavaScript
│
├── assets/
│   ├── images/         → Fotografías del equipo y del sitio
│   ├── icons/          → Íconos SVG personalizados
│   └── logos/          → Logo en distintos formatos
│
└── README.md           → Este archivo
```

---

## 🎨 Paleta de colores (variables CSS)

Todas las variables están en `css/styles.css` bajo `:root`:

| Variable        | Valor     | Uso                                     |
|----------------|-----------|------------------------------------------|
| `--cyan`        | `#00A9CE` | Botones principales, acentos, links      |
| `--navy`        | `#1B2D6E` | Títulos, nav, footer, ancla institucional|
| `--purple`      | `#7B6896` | Iconos, cards de igualdad, detalles      |
| `--cloud`       | `#F2EEEB` | Fondos de secciones cálidas              |
| `--canvas`      | `#D4E4EC` | Fondo general de la página               |

**Para cambiar un color del sitio completo**, modifica solo la variable en `:root {}` dentro de `css/styles.css`.

---

## ✏️ Cómo modificar contenido

### Textos generales
- Los textos están directamente dentro de los archivos `.html`.
- Busca el texto que quieres cambiar con `Ctrl+F` en tu editor.
- Modifica y guarda.

### Estadísticas (hero)
En `index.html`, busca `data-count` y cambia los números:
```html
<span data-count="15" data-suffix="+">15+</span>  <!-- años -->
<span data-count="200" data-suffix="+">200+</span> <!-- proyectos -->
```

### Teléfonos y correo
Busca `tel:`, `mailto:` y `wa.me/` en todos los HTML y actualiza con los datos reales.

### Logo
Actualmente el logo es texto CSS. Para agregar una imagen SVG/PNG:
```html
<!-- Reemplaza el .nav-logo actual con: -->
<a href="index.html" class="nav-logo">
  <img src="assets/logos/logo.svg" alt="Visión y Estrategia" height="48" />
</a>
```

---

## 🖼️ Cómo agregar imágenes reales

### Fotografía del equipo (Nosotros)
En `nosotros.html`, busca las cards con `.team-photo` y reemplaza:
```html
<!-- Antes -->
<div class="team-photo">👩‍💼</div>

<!-- Después -->
<div class="team-photo" style="padding:0">
  <img src="assets/images/directora.jpg" alt="Nombre de la directora" 
       style="width:100%;height:100%;object-fit:cover" />
</div>
```

### Foto Hero o About
En el bloque `.about-card-main`, reemplaza el placeholder con:
```html
<img src="assets/images/equipo.jpg" alt="Equipo Visión y Estrategia" 
     style="width:100%;height:100%;object-fit:cover" />
```

---

## 🗺️ Activar el mapa de Google Maps

1. Ve a [Google Maps Embed API](https://developers.google.com/maps/documentation/embed/get-started)
2. Genera el URL embed para la dirección: *Ex Hacienda Barbabosa 100-A, Zinacantepec*
3. En `contacto.html`, reemplaza el div `.map-container` con:
```html
<div class="map-container" style="padding:0">
  <iframe
    src="https://www.google.com/maps/embed?pb=TU_URL_AQUI"
    width="100%" height="360" style="border:0;" allowfullscreen loading="lazy">
  </iframe>
</div>
```

---

## 📱 Funcionalidades incluidas

| Feature                    | Archivo        |
|---------------------------|----------------|
| Navbar responsive + scroll | `js/main.js`   |
| Menú móvil (hamburger)     | `js/main.js`   |
| Scroll suave              | `js/main.js`   |
| Animaciones al hacer scroll | `js/main.js` |
| Contadores animados       | `js/main.js`   |
| FAQ accordion             | `js/main.js`   |
| Validación de formulario  | `js/main.js`   |
| Tabs de servicios         | `servicios.html` |
| Partículas hero           | `js/main.js`   |
| Page loader               | `js/main.js`   |
| Botón "Volver al inicio de la página"     | `js/main.js`   |
| WhatsApp flotante         | Todos los HTML |

---

## 🚀 Cómo abrir el sitio

### Opción 1 — Directamente en el navegador (sin servidor)
Abre `index.html` haciendo doble clic. Funciona para pruebas básicas.

### Opción 2 — Con servidor local (recomendado)

**Con VS Code + Live Server:**
1. Instala la extensión "Live Server" en VS Code
2. Clic derecho sobre `index.html` → "Open with Live Server"

**Con Node.js:**
```bash
npx serve .
# Abre http://localhost:3000
```

**Con Python:**
```bash
python3 -m http.server 8080
# Abre http://localhost:8080
```

---

## 📤 Cómo publicar el sitio

### Hosting tradicional (cPanel, GoDaddy, etc.)
1. Comprime la carpeta del proyecto en `.zip`
2. Sube los archivos al directorio `public_html` vía FTP o el administrador de archivos
3. Asegúrate de que `index.html` esté en la raíz

### Netlify (gratis, fácil)
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta del proyecto al panel de Netlify
3. Obtén un URL gratuito en segundos

### GitHub Pages (gratis)
1. Sube el proyecto a un repositorio de GitHub
2. Ve a Settings → Pages → Source: main
3. El sitio estará disponible en `tu-usuario.github.io/vision-estrategia`

---

## 🔧 Recomendaciones para siguientes etapas

### Etapa 2 — Mejoras prioritarias
- [ ] Agregar fotografías reales del equipo y oficinas
- [ ] Integrar formulario con backend (Formspree, EmailJS, o servidor PHP/Node)
- [ ] Conectar Google Maps con API key
- [ ] Agregar sección de blog/boletines para SEO
- [ ] Instalar Google Analytics 4 (GA4)
- [ ] Configurar Meta (Facebook) Pixel si usan ads

### Etapa 3 — Funcionalidades avanzadas
- [ ] Sistema de agenda online (Calendly, Cal.com)
- [ ] Chat en vivo (Tidio, Intercom)
- [ ] CRM integration (HubSpot, Salesforce)
- [ ] Portal de clientes con login
- [ ] Blog dinámico con CMS (WordPress headless, Sanity, Contentful)
- [ ] Versión en inglés para proyectos internacionales

### SEO técnico
- [ ] Crear `sitemap.xml`
- [ ] Crear `robots.txt`
- [ ] Agregar schema markup (JSON-LD) para LocalBusiness
- [ ] Optimizar imágenes con WebP
- [ ] Agregar Open Graph tags para redes sociales

---

## 📞 Créditos del proyecto

- **Cliente:** Visión y Estrategia Consultoría
- **Sitio web actual:** [visionyestrategia.com.mx](https://visionyestrategia.com.mx)
- **Tipografías:** Lora + Montserrat (Google Fonts — licencia libre)
- **Íconos:** Emojis nativos del sistema
- **Colores:** Basados en el brandboard oficial (Pantone 631C, 534C, 667C, Cloud Dancer, 7541C)
- **Versión:** 1.0.0 | Mayo 2026

---

> ¿Tienes dudas sobre el proyecto? Escríbenos a: informes@visionyestrategia.com.mx
