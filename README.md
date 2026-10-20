# Folletos Auto

Editor de folletos (estilo Canva simplificado) para ofertas. React + Vite + MUI + Supabase.

## Puesta en marcha

```bash
npm install
cp .env.example .env      # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

> Antes de usar el código nuevo con una base existente, ejecutar
> `supabase/migrations/001_unificar_columnas.sql` en el SQL Editor de Supabase.

## Estructura

```
src/
  app/                 router y providers (React Query)
  assets/              imágenes y SVG
  components/
    layout/            Sidebar, Topbar, DashboardLayout
    modals/            diálogos reutilizables
    ui/                piezas genéricas (InlineText, Notifier)
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
  styles/              fonts.css
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
