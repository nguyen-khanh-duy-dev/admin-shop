-- =====================================================================
-- ShopAdmin - Khởi tạo database
-- Chạy file này trong Supabase Dashboard > SQL Editor (hoặc bằng Supabase CLI)
-- =====================================================================

-- Tiện ích tìm kiếm gần đúng (ILIKE '%từ khóa%' nhanh hơn nhờ chỉ mục trigram)
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------
-- 1. Kiểu enum
-- ---------------------------------------------------------------------
create type public.user_role as enum ('admin', 'staff');
create type public.product_status as enum ('active', 'draft', 'archived');
create type public.order_status as enum ('pending', 'shipping', 'completed', 'cancelled');

-- ---------------------------------------------------------------------
-- 2. Bảng
-- ---------------------------------------------------------------------

-- Hồ sơ người dùng, 1-1 với auth.users (bảng đăng nhập do Supabase quản lý)
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        public.user_role not null default 'staff',
  created_at  timestamptz not null default now()
);

create table public.categories (
  id          bigint generated always as identity primary key,
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

create table public.products (
  id           bigint generated always as identity primary key,
  category_id  bigint references public.categories (id) on delete set null,
  name         text not null check (char_length(name) between 2 and 200),
  sku          text not null unique,
  description  text,
  price        numeric(12, 0) not null check (price >= 0),   -- VND, không có phần lẻ
  stock        integer not null default 0 check (stock >= 0),
  status       public.product_status not null default 'draft',
  image_url    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.customers (
  id          bigint generated always as identity primary key,
  full_name   text not null,
  email       text unique,
  phone       text,
  address     text,
  city        text,
  created_at  timestamptz not null default now()
);

create table public.orders (
  id           bigint generated always as identity primary key,
  code         text not null unique,                          -- Mã hiển thị, vd DH000123
  customer_id  bigint not null references public.customers (id) on delete restrict,
  status       public.order_status not null default 'pending',
  total        numeric(14, 0) not null default 0 check (total >= 0),
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Lưu lại tên và giá tại thời điểm mua (snapshot): sau này sản phẩm đổi giá
-- hay bị xóa thì đơn hàng cũ vẫn đúng.
create table public.order_items (
  id            bigint generated always as identity primary key,
  order_id      bigint not null references public.orders (id) on delete cascade,
  product_id    bigint references public.products (id) on delete set null,
  product_name  text not null,
  quantity      integer not null check (quantity > 0),
  unit_price    numeric(12, 0) not null check (unit_price >= 0)
);

-- ---------------------------------------------------------------------
-- 3. Chỉ mục (cho các cột hay lọc, sắp xếp, join)
-- ---------------------------------------------------------------------
create index products_category_id_idx  on public.products (category_id);
create index products_status_idx       on public.products (status);
create index products_name_trgm_idx    on public.products using gin (name gin_trgm_ops);
create index customers_name_trgm_idx   on public.customers using gin (full_name gin_trgm_ops);
create index orders_customer_id_idx    on public.orders (customer_id);
create index orders_status_idx         on public.orders (status);
create index orders_created_at_idx     on public.orders (created_at desc);
create index order_items_order_id_idx  on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- ---------------------------------------------------------------------
-- 4. Hàm và trigger
-- ---------------------------------------------------------------------

-- Tự cập nhật updated_at mỗi khi sửa dòng
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Tự tạo profile khi có người dùng mới đăng ký
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Người đang đăng nhập có phải admin không (dùng trong policy)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- 5. Row Level Security (phân quyền ở tầng database)
-- ---------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.customers   enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- profiles: ai đăng nhập cũng xem được; chỉ sửa được hồ sơ của mình
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Người dùng chỉ được sửa tên và ảnh, KHÔNG được tự đổi role của mình
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- Bảng nghiệp vụ: admin và staff đều xem, thêm, sửa; chỉ admin được xóa
do $$
declare
  t text;
begin
  foreach t in array array['categories', 'products', 'customers', 'orders', 'order_items'] loop
    execute format('create policy "%1$s_select" on public.%1$I for select to authenticated using (true)', t);
    execute format('create policy "%1$s_insert" on public.%1$I for insert to authenticated with check (true)', t);
    execute format('create policy "%1$s_update" on public.%1$I for update to authenticated using (true) with check (true)', t);
    execute format('create policy "%1$s_delete_admin" on public.%1$I for delete to authenticated using (public.is_admin())', t);
  end loop;
end;
$$;
