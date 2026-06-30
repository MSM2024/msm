do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_status') then
    create type profile_status as enum ('activo', 'pausado', 'bloqueado');
  end if;
end$$;

alter table profiles
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists whatsapp text,
  add column if not exists preferred_language text not null default 'es',
  add column if not exists timezone text,
  add column if not exists notification_email_enabled boolean not null default true,
  add column if not exists notification_whatsapp_enabled boolean not null default false,
  add column if not exists status profile_status not null default 'activo',
  add column if not exists last_login_at timestamptz,
  add column if not exists profile_completed_at timestamptz,
  add column if not exists terms_accepted_at timestamptz;

create index if not exists profiles_status_idx on profiles(status);
create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_country_idx on profiles(country);
create index if not exists profiles_created_at_idx on profiles(created_at);
