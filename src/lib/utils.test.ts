import { describe, expect, it } from 'vitest';

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  getErrorMessage,
  getInitials,
  slugify,
} from './utils';

describe('formatCurrency', () => {
  it('hiển thị tiền Việt không có phần thập phân', () => {
    // Intl chèn khoảng trắng không ngắt dòng trước ký hiệu tiền, nên chuẩn hoá trước khi so.
    expect(formatCurrency(1_250_000).replace(/\u00a0/g, ' ')).toBe('1.250.000 ₫');
  });

  it('xử lý được số 0', () => {
    expect(formatCurrency(0)).toContain('0');
  });
});

describe('formatNumber', () => {
  it('phân cách nghìn bằng dấu chấm', () => {
    expect(formatNumber(1_234_567)).toBe('1.234.567');
  });
});

describe('formatDate', () => {
  it('đổi chuỗi ISO sang dd/MM/yyyy', () => {
    expect(formatDate('2026-10-25T08:30:00Z')).toBe('25/10/2026');
  });

  it('trả về chuỗi rỗng khi giá trị là null hoặc undefined', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('trả về chuỗi rỗng khi ngày không hợp lệ', () => {
    expect(formatDate('không-phải-ngày')).toBe('');
  });

  it('formatDateTime kèm giờ phút', () => {
    expect(formatDateTime('2026-10-25T08:30:00Z')).toMatch(/^25\/10\/2026 \d{2}:30$/);
  });
});

describe('slugify', () => {
  it('bỏ dấu tiếng Việt và nối bằng gạch ngang', () => {
    expect(slugify('Áo Thun Nam')).toBe('ao-thun-nam');
  });

  it('đổi chữ đ thành d', () => {
    expect(slugify('Đồ chơi trẻ em')).toBe('do-choi-tre-em');
  });

  it('không để lại gạch ngang ở hai đầu', () => {
    expect(slugify('  --Quần jeans!! ')).toBe('quan-jeans');
  });
});

describe('getInitials', () => {
  it('lấy chữ đầu của tên và họ', () => {
    expect(getInitials('Nguyễn Duy')).toBe('ND');
  });

  it('tên một chữ chỉ lấy một ký tự', () => {
    expect(getInitials('Duy')).toBe('D');
  });

  it('trả về dấu hỏi khi không có tên', () => {
    expect(getInitials(null)).toBe('?');
    expect(getInitials('   ')).toBe('?');
  });
});

describe('getErrorMessage', () => {
  it('đọc message từ Error', () => {
    expect(getErrorMessage(new Error('Hỏng rồi'))).toBe('Hỏng rồi');
  });

  it('đọc message từ object kiểu PostgrestError', () => {
    expect(getErrorMessage({ code: '23505', message: 'duplicate key' })).toBe('duplicate key');
  });

  it('dùng fallback cho giá trị lạ', () => {
    expect(getErrorMessage(undefined, 'Lỗi mặc định')).toBe('Lỗi mặc định');
  });
});
