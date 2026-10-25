# ShopAdmin

Dashboard quản lý shop: sản phẩm, đơn hàng, khách hàng. Xây theo kiến trúc
**feature-based** — mỗi nghiệp vụ là một thư mục tự chứa trong `src/features/`.

Vite 7 · React 19 · TypeScript strict · Tailwind CSS 4 · shadcn/ui · React Query 5
· Zustand · Zod 4 · Supabase · Vitest + MSW

## Bắt đầu

```bash
npm install
cp .env.example .env     # rồi điền giá trị từ Supabase Dashboard > Project Settings > API
npm run dev              # http://localhost:5173
```

Dự án **bắt buộc** có `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`:
`src/lib/supabase.ts` sẽ throw ngay khi thiếu, để lỗi cấu hình lộ ra lúc mở app
thay vì thành một request 401 khó hiểu về sau.

### Dựng database

Schema nằm trong `supabase/`. Chạy một trong hai cách:

```bash
# Cách 1: Supabase CLI
supabase link --project-ref <project-ref>
supabase db push

# Cách 2: dán nội dung 2 file sau vào Supabase Dashboard > SQL Editor
#   supabase/migrations/20261025000000_init_schema.sql
#   supabase/seed.sql
```

Sau mỗi lần đổi schema, sinh lại type:

```bash
npm run gen:types        # cần `supabase link` trước đó
```

## Scripts

| Lệnh                   | Việc                                           |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Dev server                                     |
| `npm run build`        | Typecheck rồi build production vào `dist/`     |
| `npm run preview`      | Chạy thử bản build                             |
| `npm run typecheck`    | `tsc -b`, không emit                           |
| `npm run lint`         | ESLint (có type-aware rules)                   |
| `npm run lint:fix`     | ESLint tự sửa                                  |
| `npm run format`       | Prettier ghi lại file                          |
| `npm run format:check` | Prettier kiểm tra, dùng trong CI               |
| `npm test`             | Vitest chạy một lượt                           |
| `npm run test:watch`   | Vitest watch mode                              |
| `npm run coverage`     | Báo cáo coverage                               |
| `npm run gen:types`    | Sinh `src/types/database.types.ts` từ Supabase |

## Cấu trúc

```
src/
├── app/                      # Khởi tạo ứng dụng
│   ├── main.tsx              # Điểm vào
│   ├── providers.tsx         # QueryClient, Theme, Tooltip, Toaster, ErrorBoundary
│   ├── router.tsx            # Khai báo route, lazy load từng trang
│   ├── error-boundary.tsx
│   └── not-found-page.tsx
├── features/                 # Mỗi feature tự chứa: api, components, hooks, pages
│   ├── auth/
│   │   ├── api/              # login, logout, getSession, getProfile
│   │   ├── components/       # LoginForm, ProtectedRoute, RoleGuard
│   │   ├── hooks/            # useAuth, useAuthListener, usePermission
│   │   ├── pages/
│   │   ├── schemas.ts
│   │   └── store.ts          # Zustand: phiên đăng nhập
│   ├── dashboard/            # api (số liệu tổng quan), StatCard, RecentOrders, LowStock
│   ├── products/
│   │   ├── api/              # queries.ts, mutations.ts (React Query)
│   │   ├── components/       # ProductTable, ProductForm, ProductFilters
│   │   ├── pages/            # ProductListPage, ProductEditPage
│   │   ├── schemas.ts        # Zod schema dùng chung cho form và type
│   │   └── types.ts
│   ├── orders/               # + OrderDetailPage, OrderStatusActions
│   └── customers/            # + CustomerFormDialog
├── components/
│   ├── ui/                   # shadcn/ui (file vendor, sinh bằng CLI)
│   ├── layout/               # Sidebar, Header, Breadcrumb, AppLayout, nav-config
│   └── common/               # DataTable, EmptyState, ErrorState, ConfirmDialog, PageHeader
├── hooks/                    # useDebounce, useDebouncedSearch, useUrlFilters, useMediaQuery
├── lib/
│   ├── supabase.ts           # Khởi tạo client (có generic <Database>)
│   ├── query-client.ts       # Cấu hình React Query + toast lỗi tập trung
│   └── utils.ts              # cn, formatCurrency, formatDate, slugify…
├── types/                    # Type sinh từ database Supabase
└── test/                     # Setup Vitest, MSW handlers, fixtures, test-utils
```

## Quy ước

**Ranh giới feature.** Một feature chỉ được import từ `@/features/<ten>` (barrel
hoặc thư mục con cấp 1) của feature khác, không bao giờ bằng đường dẫn tương đối
`../../features/*`. ESLint chặn việc này bằng `no-restricted-imports`.

**Khoá cache React Query theo tầng.** Mỗi feature có một object `*Keys`
(`productKeys`, `orderKeys`…). Huỷ hiệu lực `productKeys.lists()` là làm mới mọi
danh sách bất kể bộ lọc, mà không chạm tới cache chi tiết.

**Lọc và phân trang nằm trên URL.** `useUrlFilters` đồng bộ bộ lọc với query
string, nên F5 hay copy link vẫn giữ nguyên trạng thái, và nút back/forward hoạt
động đúng. Phân trang, sắp xếp đều ở phía server (`manualPagination`,
`manualSorting`).

**Zod là nguồn duy nhất cho form.** Mỗi feature có `schemas.ts` vừa validate form
vừa sinh type (`z.infer`). Ràng buộc trong schema được viết cho khớp với CHECK
constraint trong database, để người dùng thấy lỗi ngay trên form.

**Quyền có hai lớp.** `src/features/auth/hooks/use-permission.ts` khai báo bảng
quyền của client để ẩn nút và chặn route. Quyền thật nằm ở Row Level Security
trong `supabase/migrations` — mọi mục `*.delete` chỉ dành cho admin, khớp với
policy `..._delete_admin`. Ẩn UI không phải là bảo mật.

**Lỗi được xử lý tập trung.** `lib/query-client.ts` bắt lỗi mutation và lỗi query
(khi đã có dữ liệu cũ trên màn hình) rồi hiện toast. Component chỉ cần render
`<ErrorState />` cho lần tải đầu thất bại.

## Test

Vitest + jsdom + Testing Library, API được giả lập ở **tầng HTTP** bằng MSW
(`src/test/msw/handlers.ts`) thay vì mock module `supabase` — nhờ vậy test chạy
qua đúng code postgrest-js thật.

```bash
npm test
npm run coverage
```

Handler nào không được khai báo sẽ làm test fail (`onUnhandledRequest: 'error'`),
nên không có request nào lọt ra mạng thật.

Tiện ích trong `src/test/test-utils.tsx`:

- `renderWithProviders(ui, { route })` — render kèm QueryClient riêng và MemoryRouter
- `signInAs(profile)` / `signOut()` — đặt phiên đăng nhập giả cho test phụ thuộc quyền

## Thêm component shadcn/ui

```bash
npx shadcn@latest add <ten-component>
```

Registry mới của shadcn import `cn` từ package `cn`; dự án này dùng
`@/lib/utils` nên sau khi add, đổi lại import đó trong file vừa sinh ra.

## Việc còn lại

- Trang chi tiết đơn hàng chưa cho sửa dòng hàng (`order_items`) — hiện chỉ đổi
  trạng thái và xem.
- Dashboard chưa có biểu đồ doanh thu theo ngày. Khi làm, nên tạo view
  `daily_revenue` trong database thay vì tính tổng ở client như hiện tại.
- Upload ảnh sản phẩm đang là ô nhập URL; cần nối Supabase Storage.
- Chưa có trang quản lý danh mục (`categories`) và người dùng (`profiles`).
