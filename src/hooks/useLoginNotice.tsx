'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Notice from '@/components/ui/Notice';

export function useLoginNotice() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  const LoginNotice = () => (
    <Notice
      open={open}
      setOpen={setOpen}
      title="Yêu cầu đăng nhập"
      message="Bạn cần đăng nhập để thực hiện hành động này."
      actions={[
        { label: 'Đóng', onClick: hide },
        {
          label: 'Đăng nhập',
          onClick: () => {
            hide();
            router.push(`/auth/login`);
          },
        },
      ]}
    />
  );

  return { show, hide, LoginNotice };
}
