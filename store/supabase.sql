-- Выполнить ОДИН раз: Supabase → SQL Editor → New query → вставить → Run.
-- Перед запуском замените admin@example.com на вашу почту администратора везде, где она встречается (поиск и замена по всему файлу).
-- Этот же адрес укажите в store/config.js → admins.

-- 1. Таблица товаров
create table if not exists public.products (
  id         bigint generated always as identity primary key,
  data       jsonb   not null,                 -- название, цена, описание, размеры, фото, переводы
  visible    boolean not null default true,    -- показывать ли в магазине
  sort       int     not null default 0,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Покупатели видят только опубликованные товары; администратор видит и меняет всё.
create policy "products read" on public.products for select
  using (visible = true or (auth.jwt() ->> 'email') = 'admin@example.com');
create policy "products insert" on public.products for insert
  with check ((auth.jwt() ->> 'email') = 'admin@example.com');
create policy "products update" on public.products for update
  using ((auth.jwt() ->> 'email') = 'admin@example.com');
create policy "products delete" on public.products for delete
  using ((auth.jwt() ->> 'email') = 'admin@example.com');

-- 2. Хранилище для фото товаров (публичное чтение, запись только администратору)
insert into storage.buckets (id, name, public) values ('products', 'products', true)
  on conflict (id) do nothing;

create policy "product images read" on storage.objects for select
  using (bucket_id = 'products');
create policy "product images insert" on storage.objects for insert
  with check (bucket_id = 'products' and (auth.jwt() ->> 'email') = 'admin@example.com');
create policy "product images update" on storage.objects for update
  using (bucket_id = 'products' and (auth.jwt() ->> 'email') = 'admin@example.com');
create policy "product images delete" on storage.objects for delete
  using (bucket_id = 'products' and (auth.jwt() ->> 'email') = 'admin@example.com');
