import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/**
 * Máy chủ giả cho test Node (Vitest). Khởi động và dọn dẹp trong
 * `src/test/setup.ts` nên từng test chỉ cần `server.use(...)` khi muốn
 * ghi đè một endpoint.
 */
export const server = setupServer(...handlers);
