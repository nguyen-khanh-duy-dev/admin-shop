import { http, HttpResponse } from 'msw';

import { categoryFixtures, productFixtures, profileFixture } from '../fixtures';

/** Phải khớp với `test.env` trong vite.config.ts. */
const SUPABASE_URL = 'http://localhost:54321';
const REST = `${SUPABASE_URL}/rest/v1`;
const AUTH = `${SUPABASE_URL}/auth/v1`;

/**
 * PostgREST trả tổng số dòng qua header `Content-Range` (vd `0-19/42`);
 * postgrest-js đọc header này để điền `count`.
 */
function contentRange(from: number, to: number, total: number) {
  return { 'Content-Range': `${String(from)}-${String(to)}/${String(total)}` };
}

/**
 * postgrest-js biến `.range(from, to)` thành query param `offset` + `limit`,
 * không phải header `Range`.
 */
function parsePaging(url: URL) {
  const offset = Number(url.searchParams.get('offset') ?? 0);
  const limit = Number(url.searchParams.get('limit') ?? 25);
  const from = Number.isFinite(offset) ? offset : 0;
  const size = Number.isFinite(limit) && limit > 0 ? limit : 25;
  return { from, to: from + size - 1 };
}

/**
 * Trích từ khoá từ filter dạng PostgREST.
 * Ví dụ `or=(name.ilike.%áo%,sku.ilike.%áo%)` -> `áo`.
 */
function parseIlikeKeyword(url: URL) {
  const or = url.searchParams.get('or');
  const match = /ilike\.\*?%?([^%,)*]+)%?/.exec(or ?? '');
  return match?.[1]?.toLowerCase() ?? null;
}

export const handlers = [
  // --- Auth ------------------------------------------------------------
  http.post(`${AUTH}/token`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.password !== 'dung-mat-khau') {
      return HttpResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid login credentials' },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      access_token: 'test-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'test-refresh-token',
      user: {
        id: profileFixture.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: body.email ?? 'admin@shop.vn',
        app_metadata: {},
        user_metadata: { full_name: profileFixture.full_name },
        created_at: profileFixture.created_at,
      },
    });
  }),

  http.post(`${AUTH}/logout`, () => new HttpResponse(null, { status: 204 })),

  // --- profiles --------------------------------------------------------
  http.get(`${REST}/profiles`, () => HttpResponse.json(profileFixture)),

  // --- categories ------------------------------------------------------
  http.get(`${REST}/categories`, () => HttpResponse.json(categoryFixtures)),

  // --- products --------------------------------------------------------
  http.get(`${REST}/products`, ({ request }) => {
    const url = new URL(request.url);

    let rows = [...productFixtures];

    const keyword = parseIlikeKeyword(url);
    if (keyword) {
      rows = rows.filter(
        (product) =>
          product.name.toLowerCase().includes(keyword) ||
          product.sku.toLowerCase().includes(keyword),
      );
    }

    const status = url.searchParams.get('status');
    if (status?.startsWith('eq.')) {
      rows = rows.filter((product) => product.status === status.slice(3));
    }

    const categoryId = url.searchParams.get('category_id');
    if (categoryId?.startsWith('eq.')) {
      rows = rows.filter((product) => product.category_id === Number(categoryId.slice(3)));
    }

    const total = rows.length;
    const { from, to } = parsePaging(url);
    const page = rows.slice(from, to + 1);

    return HttpResponse.json(page, { headers: contentRange(from, to, total) });
  }),

  http.post(`${REST}/products`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const created = {
      ...productFixtures[0],
      ...body,
      id: 99,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch(`${REST}/products`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...productFixtures[0], ...body });
  }),

  http.delete(`${REST}/products`, () => new HttpResponse(null, { status: 204 })),
];
