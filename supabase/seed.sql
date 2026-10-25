-- =====================================================================
-- ShopAdmin - Dữ liệu mẫu
-- Tạo: 8 danh mục, 200 sản phẩm, 300 khách hàng, 1.000 đơn hàng (12 tháng gần nhất)
-- Chạy SAU file init_schema.sql. Chạy lại nhiều lần được (xóa dữ liệu cũ trước).
-- =====================================================================

-- Cố định bộ sinh số ngẫu nhiên để mỗi lần chạy ra cùng một bộ dữ liệu
select setseed(0.42);

-- Xóa dữ liệu cũ (không đụng tới profiles / tài khoản đăng nhập)
truncate public.order_items, public.orders, public.customers, public.products, public.categories
  restart identity cascade;

-- Tạm tắt trigger updated_at để giữ đúng ngày giả lập khi cập nhật tổng tiền
alter table public.orders disable trigger orders_set_updated_at;

-- Hàm tạm: bỏ dấu tiếng Việt để tạo email (xóa ở cuối file)
create or replace function pg_temp.unaccent_vi(s text)
returns text
language sql
immutable
as $$
  select translate(
    s,
    'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ',
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyydAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD'
  );
$$;

-- ---------------------------------------------------------------------
-- 1. Danh mục
-- ---------------------------------------------------------------------
insert into public.categories (name, slug) values
  ('Điện thoại',        'dien-thoai'),
  ('Laptop',            'laptop'),
  ('Máy tính bảng',     'may-tinh-bang'),
  ('Tai nghe',          'tai-nghe'),
  ('Đồng hồ thông minh','dong-ho-thong-minh'),
  ('Phụ kiện',          'phu-kien'),
  ('Màn hình',          'man-hinh'),
  ('Bàn phím & Chuột',  'ban-phim-chuot');

-- ---------------------------------------------------------------------
-- 2. Sản phẩm: 25 sản phẩm mỗi danh mục = 200
-- Tên ghép từ "dòng sản phẩm" + "phiên bản" để trông giống thật
-- ---------------------------------------------------------------------
with cfg (slug, lines, variants, min_price, max_price) as (
  values
    ('dien-thoai',         array['Galaxy Nova','Pixelon','Xenia','Redmi Lite','Oppa Reno'], array['5G 128GB','5G 256GB','Pro 256GB','Pro Max 512GB','Lite 64GB'],  2500000, 35000000),
    ('laptop',             array['ZenBook Air','ThinkPro','Vivo Slim','Aspire Go','Inspira'], array['i5 16GB','i7 16GB','Ryzen 5','Ryzen 7','Ultra 7 32GB'],          9000000, 55000000),
    ('may-tinh-bang',      array['TabPad','Galaxy Tab Lite','MiPad','Lenova Tab','PadOne'],   array['Wi-Fi 64GB','Wi-Fi 128GB','LTE 128GB','Pro 256GB','Mini 64GB'],    3000000, 28000000),
    ('tai-nghe',           array['SoundBuds','AirLite','BassPro','QuietMax','StudioOne'],      array['True Wireless','Chống ồn','Thể thao','Over-ear','Gaming'],        300000,  9000000),
    ('dong-ho-thong-minh', array['FitBand','WatchGo','Active Watch','PulseFit','TrekWatch'],   array['40mm','44mm','GPS','LTE','Titan'],                                  800000, 15000000),
    ('phu-kien',           array['Sạc nhanh','Cáp USB-C','Pin dự phòng','Ốp lưng','Hub USB-C'],array['20W','65W','1m','10.000mAh','7 in 1'],                             90000,  1500000),
    ('man-hinh',           array['ViewPro','UltraWide','GameView','OfficeMate','ColorEdge'],    array['24" FHD','27" 2K','27" 4K','32" 4K','34" Cong'],                  2500000, 18000000),
    ('ban-phim-chuot',     array['KeyMech','SilentKey','ProMouse','GlideMouse','Combo Office'], array['Có dây','Không dây','RGB','Bluetooth','Low profile'],              150000,  4500000)
),
generated as (
  select
    c.id                                   as category_id,
    cfg.slug,
    cfg.lines[1 + (n - 1) / 5]             as line_name,
    cfg.variants[1 + (n - 1) % 5]          as variant,
    n,
    cfg.min_price,
    cfg.max_price
  from cfg
  join public.categories c on c.slug = cfg.slug
  cross join generate_series(1, 25) as n
)
insert into public.products (category_id, name, sku, description, price, stock, status, created_at)
select
  category_id,
  line_name || ' ' || variant,
  upper(left(replace(slug, '-', ''), 4)) || '-' || lpad(n::text, 3, '0'),
  'Sản phẩm ' || line_name || ' phiên bản ' || variant || ', bảo hành chính hãng 12 tháng.',
  -- Giá làm tròn tới 10.000đ
  round((min_price + random() * (max_price - min_price)) / 10000) * 10000,
  -- Khoảng 10% sản phẩm sắp hết hàng (tồn kho < 5)
  case when random() < 0.10 then floor(random() * 5)::int else 5 + floor(random() * 200)::int end,
  -- 80% đang bán, 12% bản nháp, 8% ngừng bán
  case
    when random() < 0.80 then 'active'::public.product_status
    when random() < 0.60 then 'draft'::public.product_status
    else 'archived'::public.product_status
  end,
  now() - (random() * interval '400 days')
from generated;

-- ---------------------------------------------------------------------
-- 3. Khách hàng: 300 người, tên tiếng Việt ngẫu nhiên
-- ---------------------------------------------------------------------
with
  ho   as (select array['Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Võ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý'] as v),
  dem  as (select array['Văn','Thị','Minh','Thanh','Ngọc','Quốc','Gia','Hữu','Thu','Đức','Hoài','Bảo'] as v),
  ten  as (select array['An','Bình','Châu','Dũng','Giang','Hà','Hải','Hạnh','Hiếu','Hoa','Hùng','Huy','Khánh','Lan','Linh','Long','Mai','Nam','Nga','Phúc','Quân','Quang','Sơn','Tâm','Thảo','Trang','Trung','Tú','Tuấn','Vy','Yến','Khoa'] as v),
  tp   as (select array['Hà Nội','TP. Hồ Chí Minh','Đà Nẵng','Hải Phòng','Cần Thơ','Huế','Nha Trang','Bắc Ninh','Biên Hòa','Vũng Tàu'] as v),
  duong as (select array['Lê Lợi','Trần Hưng Đạo','Nguyễn Huệ','Hai Bà Trưng','Lý Thường Kiệt','Phan Chu Trinh','Điện Biên Phủ','Cách Mạng Tháng 8','Nguyễn Trãi','Hoàng Diệu'] as v),
  people as (
    select
      n,
      ho.v[1 + floor(random() * array_length(ho.v, 1))::int]   as h,
      dem.v[1 + floor(random() * array_length(dem.v, 1))::int] as d,
      ten.v[1 + floor(random() * array_length(ten.v, 1))::int] as t,
      tp.v[1 + floor(random() * array_length(tp.v, 1))::int]   as city,
      duong.v[1 + floor(random() * array_length(duong.v, 1))::int] as street
    from generate_series(1, 300) as n, ho, dem, ten, tp, duong
  )
insert into public.customers (full_name, email, phone, address, city, created_at)
select
  h || ' ' || d || ' ' || t,
  -- Email dạng an.nguyen123@example.com (bỏ dấu tiếng Việt)
  lower(pg_temp.unaccent_vi(t) || '.' || pg_temp.unaccent_vi(h) || n) || '@example.com',
  '0' || (array['3','5','7','8','9'])[1 + floor(random() * 5)::int] || lpad(floor(random() * 100000000)::text, 8, '0'),
  (1 + floor(random() * 300))::int || ' ' || street,
  city,
  now() - (random() * interval '420 days')
from people;

-- ---------------------------------------------------------------------
-- 4. Đơn hàng: 1.000 đơn trong 12 tháng gần nhất
-- Đơn gần đây có tỉ lệ "chờ xử lý / đang giao" cao hơn, đơn cũ phần lớn đã hoàn thành
-- ---------------------------------------------------------------------
with raw as (
  -- random()^1.4 lệch về phía 0, nên đơn gần đây dày hơn đơn cũ (giống cửa hàng đang tăng trưởng)
  select now() - (random() ^ 1.4) * interval '365 days' as created
  from generate_series(1, 1000)
),
timed as (
  select
    created,
    extract(day from now() - created)::int           as age_days,
    row_number() over (order by created)             as rn
  from raw
)
insert into public.orders (code, customer_id, status, note, created_at, updated_at)
select
  'DH' || lpad(rn::text, 6, '0'),                    -- Mã đơn tăng dần theo thời gian
  1 + floor(random() * 300)::int,
  case
    when age_days < 3  then (array['pending','pending','shipping','cancelled'])[1 + floor(random() * 4)::int]::public.order_status
    when age_days < 10 then (array['pending','shipping','shipping','completed','completed','cancelled'])[1 + floor(random() * 6)::int]::public.order_status
    when random() < 0.9 then 'completed'::public.order_status
    else 'cancelled'::public.order_status
  end,
  case when random() < 0.15
    then (array['Giao giờ hành chính','Gọi trước khi giao','Xuất hóa đơn VAT','Gói quà giúp mình'])[1 + floor(random() * 4)::int]
  end,
  created,
  -- Cập nhật lần cuối 0–3 ngày sau khi tạo, nhưng không vượt quá hiện tại
  least(now(), created + interval '1 day' * floor(random() * 4))
from timed
order by rn;

-- ---------------------------------------------------------------------
-- 5. Chi tiết đơn: mỗi đơn 1–4 sản phẩm khác nhau, số lượng 1–3
-- Lấy tên và giá của sản phẩm tại thời điểm tạo (snapshot)
-- ---------------------------------------------------------------------
insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
select o.id, p.id, p.name, 1 + floor(random() * 3)::int, p.price
from public.orders o
cross join lateral (
  select pr.id, pr.name, pr.price
  from public.products pr
  where pr.status <> 'draft'
  order by random() + o.id * 0   -- "+ o.id * 0" buộc Postgres chọn lại cho từng đơn
  limit 1 + floor(random() * 4)::int
) p;

-- ---------------------------------------------------------------------
-- 6. Tính tổng tiền mỗi đơn từ chi tiết
-- ---------------------------------------------------------------------
update public.orders o
set total = s.total
from (
  select order_id, sum(quantity * unit_price) as total
  from public.order_items
  group by order_id
) s
where s.order_id = o.id;

-- Bật lại trigger
alter table public.orders enable trigger orders_set_updated_at;

-- ---------------------------------------------------------------------
-- 7. Kiểm tra nhanh
-- ---------------------------------------------------------------------
select 'categories'  as bang, count(*) from public.categories
union all select 'products',    count(*) from public.products
union all select 'customers',   count(*) from public.customers
union all select 'orders',      count(*) from public.orders
union all select 'order_items', count(*) from public.order_items;
