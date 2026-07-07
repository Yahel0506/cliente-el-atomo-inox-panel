# Panel administrativo El Atomo Inox

CMS interno en Next.js App Router para administrar datos que la web publica ya consume desde Supabase.

## Comandos

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

`npm run dev` usa webpack porque Turbopack dev mostro error de manifest en este entorno. El build de produccion usa Next normal y pasa limpio.

## Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
ADMIN_REVALIDATE_SECRET=
WEB_REVALIDATE_URL=
```

`SUPABASE_SERVICE_ROLE_KEY` solo se usa en servidor. Si no se configura, el panel depende de RLS con usuario autenticado.

## Rutas

- `/login`
- `/dashboard`
- `/dashboard/catalogo/productos`
- `/dashboard/catalogo/productos/nuevo`
- `/dashboard/catalogo/productos/[id]`
- `/dashboard/catalogo/categorias`
- `/dashboard/negocio/contacto`
- `/dashboard/negocio/sucursales`
- `/dashboard/negocio/trabajos`
- `/dashboard/ajustes`

## Tablas administradas

- `business_contact_info`
- `business_branches`
- `business_work_process_videos`
- `business_work_result_videos`
- `business_work_result_images`
- `catalog_categories`
- `catalog_products`
- `catalog_product_photos` lectura/checklist
- `catalog_product_recommended_uses` lectura/checklist
- `catalog_product_branches` lectura/checklist

## Pendientes reales

- Subida directa a Supabase Storage con bucket/policies finales.
- Reordenamiento drag and drop; hoy queda preparado por `display_order`.
- Edicion completa de fotos/usos/sucursales dentro del producto.
- Revalidacion manual de web publica cuando exista endpoint en `cliente-el-atomo-inox-web`.
- Migrar categorias visuales de la web a Supabase si se quieren slugs nuevos visibles.
