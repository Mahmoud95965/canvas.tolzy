import Link from 'next/link';

export default function SiteNotFound() {
  return (
    <div className="site-not-found">
      <h1 className="gradient-text">404</h1>
      <h2>Site Not Found</h2>
      <p>This site doesn&apos;t exist or hasn&apos;t been published yet.</p>
      <Link href="/" className="btn btn-primary">
        Go to Tolzy Pages
      </Link>
    </div>
  );
}
