-- =============================================================
-- Row Level Security: la autorización DE VERDAD.
--
-- La publishable key viaja en el JavaScript del navegador: cualquiera
-- la puede copiar. Sin RLS, con esa llave se podría borrar la tabla
-- desde la consola. Lo que protege los datos son estas políticas.
-- =============================================================

alter table public.eventos  enable row level security;
alter table public.profiles enable row level security;

-- Permisos de tabla para los dos roles de la API: anon (sin sesión) y
-- authenticated (con sesión). Suelen venir por defecto; se escriben explícitos
-- porque un proyecto creado sin "exponer tablas nuevas" no los trae.
-- GRANT dice qué operaciones existen; las políticas de abajo, sobre QUÉ filas.
grant select on public.eventos to anon, authenticated;
grant insert, update, delete on public.eventos to authenticated;
grant usage on sequence public.eventos_id_seq to authenticated;
grant select on public.profiles to authenticated;

-- ¿El usuario que hace la petición es admin? auth.uid() sale del token.
-- security definer: la función lee profiles sin pasar por su RLS
-- (si la política de profiles consultara profiles, habría recursión).
create or replace function public.es_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and rol = 'admin'
  );
$$;

-- eventos: cualquiera lee (anon incluido); solo el admin escribe.
create policy "eventos: cualquiera lee"
  on public.eventos for select
  using (true);

create policy "eventos: solo admin crea"
  on public.eventos for insert to authenticated
  with check (public.es_admin());

create policy "eventos: solo admin edita"
  on public.eventos for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

create policy "eventos: solo admin elimina"
  on public.eventos for delete to authenticated
  using (public.es_admin());

-- profiles: cada quien lee el suyo. A propósito NO hay política de update:
-- si el usuario pudiera editar su fila, se pondría rol = 'admin' él mismo.
create policy "profiles: leer el propio"
  on public.profiles for select to authenticated
  using (id = auth.uid());
