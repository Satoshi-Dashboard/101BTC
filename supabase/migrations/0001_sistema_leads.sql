-- ============================================================
-- 101 BTC — Sistema de captura de leads
-- Pegar tal cual en el SQL Editor de Supabase (o aplicar como migración).
-- Idempotente: se puede ejecutar varias veces sin romper nada.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Tablas
-- ------------------------------------------------------------
create table if not exists public.leads (
  id                  uuid        primary key default uuid_generate_v4(),
  nombre              text        not null,
  pais                text        not null,
  telefono            text        not null,
  correo              text        not null unique,
  cta_origen          text        not null,
  fecha_registro      timestamptz not null default now(),
  ultima_interaccion  timestamptz not null default now(),
  total_interacciones integer     not null default 1,
  ip_address          text,
  user_agent          text,
  constraint leads_nombre_len   check (char_length(nombre)   between 3 and 100),
  constraint leads_telefono_len check (char_length(telefono) between 8 and 20),
  constraint leads_correo_fmt   check (correo ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$'),
  constraint leads_pais_no_nulo check (char_length(btrim(pais)) > 0),
  constraint leads_cta_no_nulo  check (char_length(btrim(cta_origen)) > 0)
);

create table if not exists public.lead_interactions (
  id         uuid        primary key default uuid_generate_v4(),
  lead_id    uuid        not null references public.leads(id) on delete cascade,
  cta_origen text        not null,
  fecha      timestamptz not null default now()
);

create index if not exists lead_interactions_lead_id_idx on public.lead_interactions (lead_id);
create index if not exists lead_interactions_fecha_idx   on public.lead_interactions (fecha desc);
create index if not exists leads_correo_idx              on public.leads (correo);

-- ------------------------------------------------------------
-- Row Level Security
--   anon  -> solo INSERT (y ejecutar la RPC). Nada de SELECT/UPDATE/DELETE.
--   service_role -> SELECT (además ignora RLS por definición).
-- ------------------------------------------------------------
alter table public.leads             enable row level security;
alter table public.lead_interactions enable row level security;

-- Privilegios a nivel de tabla: Supabase concede ALL por defecto en public.
-- Se revoca y se vuelve a conceder solo INSERT.
revoke all on public.leads             from anon, authenticated;
revoke all on public.lead_interactions from anon, authenticated;
grant insert on public.leads             to anon, authenticated;
grant insert on public.lead_interactions to anon, authenticated;
grant select on public.leads             to service_role;
grant select on public.lead_interactions to service_role;

drop policy if exists leads_insert_anon      on public.leads;
drop policy if exists leads_select_service   on public.leads;
drop policy if exists inter_insert_anon      on public.lead_interactions;
drop policy if exists inter_select_service   on public.lead_interactions;

create policy leads_insert_anon
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy leads_select_service
  on public.leads for select
  to service_role
  using (true);

create policy inter_insert_anon
  on public.lead_interactions for insert
  to anon, authenticated
  with check (true);

create policy inter_select_service
  on public.lead_interactions for select
  to service_role
  using (true);

-- Sin policies de UPDATE ni DELETE: quedan denegados para cualquier rol
-- que respete RLS. El único camino para tocar ultima_interaccion y
-- total_interacciones es la función registrar_lead (SECURITY DEFINER).

-- ------------------------------------------------------------
-- RPC: registrar_lead
--   Alta o interacción según exista el correo. Valida en backend.
--   search_path fijo: evita secuestro de resolución de nombres en
--   una función SECURITY DEFINER.
-- ------------------------------------------------------------
create or replace function public.registrar_lead(
  p_nombre     text,
  p_pais       text,
  p_telefono   text,
  p_correo     text,
  p_cta_origen text,
  p_ip         text default null,
  p_user_agent text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead_id  uuid;
  v_existe   boolean;
  v_ip       text;
  v_nombre   text := btrim(coalesce(p_nombre, ''));
  v_pais     text := btrim(coalesce(p_pais, ''));
  v_telefono text := btrim(coalesce(p_telefono, ''));
  v_correo   text := lower(btrim(coalesce(p_correo, '')));
  v_cta      text := btrim(coalesce(p_cta_origen, ''));
begin
  -- Validación de servidor: espeja la del frontend, no confía en ella.
  if char_length(v_nombre) < 3 or char_length(v_nombre) > 100 then
    raise exception 'nombre_invalido' using hint = 'Escribe tu nombre completo, por favor';
  end if;

  if v_pais = '' then
    raise exception 'pais_invalido' using hint = 'Selecciona tu país de la lista';
  end if;

  if v_telefono !~ '^\+[0-9]{8,15}$' then
    raise exception 'telefono_invalido' using hint = 'Verifica tu número de teléfono';
  end if;

  if v_correo !~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' then
    raise exception 'correo_invalido' using hint = 'Revisa tu correo, algo no cuadra';
  end if;

  if split_part(v_correo, '@', 2) = any (array[
    'mailinator.com', 'tempmail.com', 'guerrillamail.com', 'yopmail.com',
    'throwaway.email', 'fakeinbox.com', 'sharklasers.com',
    'guerrillamailblock.com', 'grr.la', 'dispostable.com'
  ]) then
    raise exception 'correo_desechable' using hint = 'Usa tu correo personal o de trabajo, por favor';
  end if;

  if v_cta = '' then
    v_cta := 'cta_general';
  end if;

  -- La IP se toma de la cabecera que inyecta el edge de Supabase, no del
  -- navegador: el cliente no puede falsearla. p_ip queda como override.
  v_ip := coalesce(
    p_ip,
    split_part(
      btrim(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', '')),
      ',', 1
    )
  );
  if btrim(coalesce(v_ip, '')) = '' then
    v_ip := null;
  end if;

  select id into v_lead_id from leads where correo = v_correo;

  if v_lead_id is not null then
    v_existe := true;
    update leads
       set ultima_interaccion  = now(),
           total_interacciones = total_interacciones + 1
     where id = v_lead_id;
  else
    v_existe := false;
    insert into leads (nombre, pais, telefono, correo, cta_origen, ip_address, user_agent)
    values (
      initcap(v_nombre),
      v_pais,
      v_telefono,
      v_correo,
      v_cta,
      v_ip,
      p_user_agent
    )
    returning id into v_lead_id;
  end if;

  insert into lead_interactions (lead_id, cta_origen)
  values (v_lead_id, v_cta);

  return json_build_object(
    'lead_id', v_lead_id,
    'registrado_previamente', v_existe
  );
end;
$$;

-- Solo la RPC es invocable por el navegador.
revoke all on function public.registrar_lead(text, text, text, text, text, text, text) from public;
grant execute on function public.registrar_lead(text, text, text, text, text, text, text) to anon, authenticated, service_role;
