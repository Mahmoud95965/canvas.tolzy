'use client';

import { useEffect, useState } from 'react';
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react';

interface PublishedSiteClientProps {
  reactFiles: Record<string, string>;
}

export default function PublishedSiteClient({ reactFiles }: PublishedSiteClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <SandpackProvider
        template="react"
        files={reactFiles}
        theme="dark"
        options={{
          externalResources: [
            'https://cdn.tailwindcss.com',
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
          ],
        }}
      >
        <SandpackPreview
          style={{ width: '100%', height: '100vh' }}
          showNavigator={false}
          showOpenInCodeSandbox={false}
        />
      </SandpackProvider>
    </div>
  );
}
