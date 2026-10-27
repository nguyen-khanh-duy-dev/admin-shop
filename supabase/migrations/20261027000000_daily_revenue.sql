-- Doanh thu theo ngày (giờ Việt Nam), chỉ tính đơn completed.
-- generate_series bảo đảm ngày không có đơn vẫn có một dòng với revenue = 0,
-- để biểu đồ không bị đứt. Giới hạn khoảng tối đa 400 ngày để tránh quét quá nhiều.
create or replace function public.daily_revenue(p_from date, p_to date)
returns table (day date, revenue numeric, orders bigint)
language sql stable
set search_path = ''
as $$
  select d::date, coalesce(sum(o.total), 0), count(o.id)
  from generate_series(p_from, p_to, interval '1 day') as d
  left join public.orders o
    on  o.status = 'completed'
    and o.created_at >= (d::date)::timestamp     at time zone 'Asia/Ho_Chi_Minh'
    and o.created_at <  (d::date + 1)::timestamp at time zone 'Asia/Ho_Chi_Minh'
  where p_to - p_from between 0 and 400
  group by d
  order by d;
$$;

grant execute on function public.daily_revenue(date, date) to authenticated;
