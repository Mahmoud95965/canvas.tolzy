'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Site } from '@/types';
import SandpackEditor from '@/components/builder/SandpackEditor';

export default function BuilderPage() {
  const { user, loading, getIdToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<Site | null>(null);
  const [loadingSite, setLoadingSite] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchSite() {
      const token = await getIdToken();
      if (!token) return;

      try {
        const res = await fetch(`/api/sites/${siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setError('Site not found');
          return;
        }

        const data = await res.json();
        setSite(data);
      } catch {
        setError('Failed to load site');
      } finally {
        setLoadingSite(false);
      }
    }

    if (user && siteId) {
      fetchSite();
    }
  }, [user, siteId, getIdToken]);

  if (loading || loadingSite) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 relative">
          <div className="absolute inset-0 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-center gap-4">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-fuchsia-400">404</h1>
        <h2 className="text-xl text-white">{error || 'Site not found'}</h2>
        <p className="text-zinc-500">The site doesn&apos;t exist or you don&apos;t have access.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return <SandpackEditor site={site} />;
}
