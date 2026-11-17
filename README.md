# TrapLegion — Panel de Administración

Panel web independiente, diseñado para trabajar con el sitio público y el archivo SQL del mismo paquete. Utiliza **Supabase Auth + PostgreSQL/RLS + Supabase Storage**. No requiere PHP, servidor propio ni Cloudflare API Token.

## Qué podés administrar
- **Artistas**: nombre, biografía, fotos/banners, tipo de artista (incluye IA), publicaciones y destacados.
- **NL — Nuevos lanzamientos**: singles, EP, álbumes y recopilaciones, portada, año/fecha, UPC, plataformas, artistas acreditados, publicación o borrador.
- **Canciones**: tracklist por lanzamiento, duración, ISRC, enlaces y artistas acreditados.
- **Enlaces**: Spotify, Apple Music y otras plataformas por artista.
- **Noticias**: título, fecha de publicación, portada y texto Markdown.
- **Historia**: edición íntegra de la narrativa desde el panel, sin editar archivos HTML.
- **Multimedia**: subida de PNG/JPG/WebP hasta 20 MB; URL pública insertada automáticamente en artistas/lanzamientos/noticias.
- **Sitio**: mensaje de portada, identidad y plataformas de TrapLegion.
- **Newsletter**: consulta y cambio de estado de suscriptores que hayan ingresado mediante un proceso seguro (no hay formulario público de inscripción en esta entrega).
- **Equipo**: owner puede asignar y editar roles de usuarios creados en Supabase Auth.

## Instalación (una vez)
1. Ejecutá el archivo SQL independiente `TrapLegion_SUPABASE_COMPLETO.sql` en **Supabase → SQL Editor**. Crea tablas con prefijo `tl_`, policies RLS, función de resolución de artista y bucket `traplegion-media`. Si ya ejecutaste la versión anterior del SQL, esta versión puede volver a ejecutarse sin borrar el catálogo existente; revisá antes si hiciste modificaciones manuales al esquema.
2. Supabase → **Authentication → Users**: creá tu usuario con contraseña (o registralo de otro modo habilitado por Auth). Copiá el UUID del usuario.
3. Supabase → SQL Editor: ejecutá (reemplazando el UUID):

```sql
INSERT INTO public.tl_admins (user_id, role, display_name)
VALUES ('UUID-REAL-DE-AUTH', 'owner', 'SKB')
ON CONFLICT (user_id) DO UPDATE SET role = 'owner';
```

4. Abrí `assets/js/config.js` y pegá **Project URL** y la **anon / publishable key pública** de ese mismo proyecto (nunca `service_role` ni `secret`). Usá exactamente la misma configuración en el ZIP público.
5. Desplegá este ZIP como **otro proyecto** Vercel (puede tener el subdominio que elijas). No necesita proceso de build.
6. Abrí la URL del panel, iniciá sesión con el usuario de Supabase Auth y empezá a editar.

## Flujo sugerido de un lanzamiento
**Artistas → Nuevo artista (si hace falta) → Multimedia para portada → Nuevos lanzamientos → Crear lanzamiento y acreditar artistas → Canciones → Agregar temas y créditos → Publicar**.

Los registros sin `is_published` no aparecen en la web. Para actualizar un lanzamiento, ingresá al panel: los cambios se reflejan en el próximo refresco de la web.

## Seguridad
- Roles: **owner**, **admin**, **editor**. La autorización **real** se verifica con RLS en la base, no únicamente con la interfaz.
- Nunca publiques una clave secreta de Supabase; la clave pública en JavaScript es normal.
- Storage es público para **ver imágenes**; solo staff puede subir o gestionar archivos, según el SQL.
- Los usuarios Auth se crean desde el dashboard de Supabase; el panel no crea contraseñas ni usuarios de Authentication.
- No hay edición de terceros desde la web pública.
- La subida de imágenes está limitada a JPG, PNG y WebP; **no** se distribuyen pistas de audio ni música.
- Si borrás un registro de `tl_media_assets`, eso no necesariamente borra el archivo del bucket; por defecto el panel conserva el recurso.
- El newsletter carece de endpoint público de alta para evitar capturas sin consentimiento, bots y spam. Si querés altas públicas, agregá una Edge Function con consentimiento y protección antispam.
- Subí contenidos sobre los que tengas derechos de publicación.

## Diseño
Una sola familia tipográfica: `Barlow Condensed`, aplicada desde el selector `*` con `!important`. Propiedades tipográficas independientes, sin `font:` abreviado, sin `<select>` ni `<option>` HTML y sin bordes de foco.


## Versión visual premium
Actualizada la marca a **TrapLegion** y la identidad visual a verde bosque y dorado. Conserva Supabase Auth, los permisos y todas las funciones anteriores.

## URLs públicas de artistas (actualización)
El panel construye la URL automáticamente desde el nombre, sin campos manuales de slug: **Andrés Calamaro** → `/artist=andrescalamaro`; **Matias Ponce** → `/artist=matiasponce`. No cambia los nombres visibles. Si ya tenés una base creada, primero ejecutá `TrapLegion_MIGRACION_URLS_Y_OFICIALSKB.sql`. Al editar el nombre de un artista, Supabase ajusta su slug y conserva el anterior como alias.


Campos adicionales de esta versión: imagen individual de cada canción y galería de imágenes por lanzamiento. El SQL crea `artwork_url` y `gallery_urls`.
