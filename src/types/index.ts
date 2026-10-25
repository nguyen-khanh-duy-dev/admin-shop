export type { Database, Enums, Json, Tables, TablesInsert, TablesUpdate } from './database.types';

/** Một trang dữ liệu trả về từ danh sách có phân trang. */
export type Paginated<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
