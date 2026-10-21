# Folletos Auto

Editor de folletos (estilo Canva simplificado) para ofertas. React + Vite + MUI + Supabase.

## Puesta en marcha

```bash
npm install
cp .env.example .env      # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

> Antes de usar el código nuevo con una base existente, ejecutar en el SQL Editor de Supabase,
> en orden, `supabase/migrations/001_unificar_columnas.sql` y `002_vigencia_flyers.sql`
> (se pega el *contenido* del archivo, no su ruta).

## Estructura

```
src/
  app/                 router y providers (React Query)
  assets/              imágenes y SVG
  components/
    layout/            Sidebar, Topbar, DashboardLayout
    modals/            diálogos reutilizables
    ui/                piezas genéricas (FieldLabel, SegmentedControl, EmptyState, PageHeader, ConfirmDialog, Notifier…)
  config/              plantillas/tamaños (templates.js) y estilos del editor (editorTheme.js)
  features/editor/     todo el editor
    components/        canvas, módulos, panel de propiedades, exportación
    context/           EditorContext (datos/acciones compartidos por el canvas)
    hooks/             useFlyerEditor (estado), useShortcuts, useUndoRedo (sin conectar aún)
    utils/             grid.js (lógica de la grilla), exportFlyer.js (JPG/PDF)
  hooks/               useProductos, useFlyers (React Query)
  pages/               una por ruta
  routes/              ProtectedRoute
  services/            ÚNICO lugar que habla con Supabase
  store/               notifyStore (avisos al usuario)
  styles/              fonts.css (tipografías del folleto)
  theme/               tokens.js (colores, radios, medidas) y theme.js (tema de MUI)
supabase/migrations/   cambios de base de datos
```

Regla de oro: los componentes **no** importan `supabase`; usan `services/` (vía hooks).

## Modelo de datos (columnas que usa el código)

- `flyers`: `nombre`, `width`, `height`, `bg_color`, `header_color`, `template_id`, `footer_url`, `legal`,
  `mes_inicio`, `mes_fin`, `fecha_inicio_texto`, `fecha_fin_texto`
- `paginas`: `flyer_id`, `numero`, `nombre`
- `modulos`: `flyer_id`, `pagina_id`, `producto_id`, `posicion`, `tamano`, `colSpan`, `rowSpan`, `formato`,
  `precio`, `tipo_precio`, `fondo_modulo`, `estilo_borde`, `nombre_override`, `descripcion_override`,
  `precio_regular_override`, `img_override`, `es_promo_3x1`, `edicion_libre`, `pos_imagen`, `pos_texto`, `pos_precio`
- `productos`: `sku`, `nombre`, `descripcion`, `imagen_url`

## Exportación

- **JPG**: tamaño exacto del folleto (estándar) o alta calidad. Varias páginas → `.zip`.
- **PDF**: A4 real (210×297 mm) para el formato A4; en alta calidad A4 sale a ~300 dpi.

## Atajos de teclado (estilo Figma)

| Atajo | Acción |
|---|---|
| `Ctrl+Z` | Deshacer (mover imagen/texto/precio, cambios del panel, arrastres, tamaños, crear/borrar/duplicar) |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Rehacer |
| `Ctrl+D` | Duplicar el módulo seleccionado |
| `Ctrl+C` / `Ctrl+V` | Copiar / pegar módulo (se pega en la página activa) |
| `Supr` / `Retroceso` | Eliminar el módulo seleccionado (pide confirmación) |
| `Esc` | Deseleccionar |
| `Ctrl +` / `Ctrl -` | Zoom |
| `Shift+0` / `Shift+1` | Zoom 100% / ajustar |

Dentro de un campo de texto, `Ctrl+Z` deshace el texto como siempre (no el editor).
El historial guarda hasta 100 pasos y se reinicia al eliminar una página.

## Sistema de diseño

Todo el aspecto de la interfaz sale de `src/theme/`:

- **`tokens.js`**: colores de marca (`#025BA9` azul, `#434343` grafito, `#FFF800` acento), escala de neutros, colores de estado, radios y medidas. **Para cambiar un color de la app se cambia acá.**
- **`theme.js`**: configura MUI (botones, campos, diálogos, tablas, tooltips…) con esos tokens, así cada componente se ve igual en todas las pantallas.
- En los componentes se usan los colores del tema (`"primary.main"`, `"text.secondary"`, `"divider"`…) en vez de códigos hexadecimales sueltos.
- Los diálogos de confirmación usan `ConfirmDialog`; los selectores de 2–3 opciones, `SegmentedControl`; los textos chicos sobre cada campo, `FieldLabel`.

**El folleto (canvas) tiene sus propias tipografías, tamaños y colores** (`config/editorTheme.js` y los componentes `MiniProducto`, `PrecioStarburst`, `HeaderImprecionante`, `Legal`). El tema general no modifica las variantes de tipografía ni el radio base de MUI justamente para no alterarlos.
Los elementos de ayuda del editor que están dentro del folleto (contorno de selección, textos "Editar legal", "Subir pie de página") llevan `data-export-ignore` y no salen en JPG/PDF.
