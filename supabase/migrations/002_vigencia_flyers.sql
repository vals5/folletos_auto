-- =====================================================================
-- Columnas de la vigencia (fechas del encabezado) y otros textos del folleto.
-- Idempotente: se puede ejecutar más de una vez.
-- =====================================================================
ALTER TABLE public.flyers ADD COLUMN IF NOT EXISTS fecha_inicio_texto text;
ALTER TABLE public.flyers ADD COLUMN IF NOT EXISTS fecha_fin_texto    text;
ALTER TABLE public.flyers ADD COLUMN IF NOT EXISTS mes_inicio         text;
ALTER TABLE public.flyers ADD COLUMN IF NOT EXISTS mes_fin            text;
ALTER TABLE public.flyers ADD COLUMN IF NOT EXISTS legal              text;
ALTER TABLE public.flyers ADD COLUMN IF NOT EXISTS footer_url         text;

-- Le avisa a la API de Supabase que hay columnas nuevas (si no, sigue dando "schema cache").
NOTIFY pgrst, 'reload schema';
