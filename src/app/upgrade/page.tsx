'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PRICING_URL = '/pricing';

export default function UpgradePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(PRICING_URL);
  }, [router]);

  return null;
}
