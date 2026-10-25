import { FileQuestionIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { EmptyState } from '@/components/common/empty-state';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={FileQuestionIcon}
      title="Không tìm thấy trang"
      description="Đường dẫn này không tồn tại hoặc đã bị đổi."
      action={{ label: 'Về trang tổng quan', onClick: () => void navigate('/') }}
    />
  );
}
