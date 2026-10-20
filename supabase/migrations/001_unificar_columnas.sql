-- =====================================================================
-- Unificación de nombres de columnas (folletos_auto)
-- Es IDEMPOTENTE: se puede ejecutar más de una vez sin romper nada.
-- Ejecutar en Supabase → SQL Editor ANTES de desplegar el código nuevo.
-- Recomendado: hacer un backup (o probar primero en una copia del proyecto).
-- =====================================================================

-- 1) flyers.name  ->  flyers.nombre
--    El código viejo creaba el folleto con "name" y el editor guardaba el título en "nombre".
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='flyers' AND column_name='name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='flyers' AND column_name='nombre') THEN
    ALTER TABLE public.flyers RENAME COLUMN name TO nombre;

  ELSIF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='flyers' AND column_name='name')
     AND EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='flyers' AND column_name='nombre') THEN
    -- Existen las dos: se conserva el título que el usuario editó en el editor (nombre) y,
    -- si no tiene, se usa el original (name). Después se elimina "name".
    UPDATE public.flyers SET nombre = name WHERE nombre IS NULL OR btrim(nombre) = '';
    ALTER TABLE public.flyers DROP COLUMN name;

  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='flyers' AND column_name='nombre') THEN
    ALTER TABLE public.flyers ADD COLUMN nombre text;
  END IF;
END $$;

-- 2) Columnas de modulos que usa el código (si ya existen no se toca nada).
ALTER TABLE public.modulos ADD COLUMN IF NOT EXISTS precio          numeric;
ALTER TABLE public.modulos ADD COLUMN IF NOT EXISTS img_override    text;     -- URL en Storage (antes: base64)
ALTER TABLE public.modulos ADD COLUMN IF NOT EXISTS es_promo_3x1    boolean DEFAULT false;
ALTER TABLE public.modulos ADD COLUMN IF NOT EXISTS edicion_libre   boolean DEFAULT false;
ALTER TABLE public.modulos ADD COLUMN IF NOT EXISTS formato         text;
ALTER TABLE public.modulos ADD COLUMN IF NOT EXISTS pos_imagen      jsonb;    -- {x, y}
ALTER TABLE public.modulos ADD COLUMN IF NOT EXISTS pos_texto       jsonb;
ALTER TABLE public.modulos ADD COLUMN IF NOT EXISTS pos_precio      jsonb;

-- Las posiciones guardadas pueden ser NULL (= posición automática)
ALTER TABLE public.modulos ALTER COLUMN pos_imagen DROP NOT NULL;
ALTER TABLE public.modulos ALTER COLUMN pos_texto  DROP NOT NULL;
ALTER TABLE public.modulos ALTER COLUMN pos_precio DROP NOT NULL;

-- 3) Precio: la columna válida es "precio" (la que edita el panel y dibuja el canvas).
--    Si había datos viejos en "precio_override" y "precio" está vacío, se copian.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='modulos' AND column_name='precio_override') THEN
    -- precio_override puede ser texto: se convierte a número (acepta coma o punto decimal)
    -- y se ignoran los valores que no sean un número válido.
    UPDATE public.modulos
       SET precio = replace(btrim(precio_override::text), ',', '.')::numeric
     WHERE precio IS NULL
       AND precio_override IS NOT NULL
       AND replace(btrim(precio_override::text), ',', '.') ~ '^[0-9]+(\.[0-9]+)?$';
  END IF;
END $$;

-- 4) (OPCIONAL, ejecutar manualmente cuando confirmes que todo funciona)
--    Estas columnas quedaron sin uso en el código nuevo:
-- ALTER TABLE public.modulos DROP COLUMN IF EXISTS precio_override;
-- ALTER TABLE public.modulos DROP COLUMN IF EXISTS precio_sub_override;
-- ALTER TABLE public.flyers  DROP COLUMN IF EXISTS logo_izq_url;
-- ALTER TABLE public.flyers  DROP COLUMN IF EXISTS plantilla_id;

-- 5) Verificación rápida
-- SELECT column_name, data_type FROM information_schema.columns
--  WHERE table_schema='public' AND table_name IN ('flyers','modulos') ORDER BY table_name, column_name;
