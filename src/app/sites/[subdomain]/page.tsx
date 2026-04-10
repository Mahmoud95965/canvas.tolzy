import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PublishedSiteClient from '@/components/published/PublishedSiteClient';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain } = await params;

  const { data: site } = await supabaseAdmin
    .from('sites')
    .select('meta_title, meta_description, name')
    .eq('subdomain', subdomain)
    .eq('is_published', true)
    .single();

  if (!site) {
    return { title: 'Site Not Found' };
  }

  return {
    title: site.meta_title || site.name,
    description: site.meta_description || `${site.name} — Built with TOLZY AI`,
  };
}

export default async function PublishedSitePage({ params }: PageProps) {
  const { subdomain } = await params;

  const { data: site, error } = await supabaseAdmin
    .from('sites')
    .select('react_files, html_content, css_content, name, meta_title')
    .eq('subdomain', subdomain)
    .eq('is_published', true)
    .single();

  if (error || !site) {
    notFound();
  }

  // If the site has react_files, render via Sandpack preview-only
  if (site.react_files && Object.keys(site.react_files).length > 0) {
    return <PublishedSiteClient reactFiles={site.react_files} />;
  }

  // Legacy fallback: render raw HTML for old GrapesJS sites
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{site.meta_title || site.name}</title>
        <style dangerouslySetInnerHTML={{ __html: site.css_content || '' }} />
        <style dangerouslySetInnerHTML={{
          __html: `body { margin: 0; padding: 0; } * { box-sizing: border-box; }`
        }} />
      </head>
      <body dangerouslySetInnerHTML={{ __html: site.html_content || '' }} />
    </html>
  );
}
