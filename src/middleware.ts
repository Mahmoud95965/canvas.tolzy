import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Get the app domain from env or default
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';

  // Extract subdomain
  // hostname could be: "subdomain.tolzy.me", "localhost:3000", "subdomain.localhost:3000"
  let subdomain: string | null = null;

  if (hostname !== appDomain && hostname !== `www.${appDomain}`) {
    // Remove the app domain to get the subdomain
    const parts = hostname.replace(`.${appDomain}`, '').split('.');

    // Check if there's actually a subdomain
    if (parts.length > 0 && parts[0] !== hostname) {
      subdomain = parts[0];
    }
  }

  // Skip reserved subdomains
  const reserved = ['www', 'app', 'api', 'admin', 'mail', 'tolzy'];
  if (subdomain && !reserved.includes(subdomain)) {
    // Rewrite to the sites rendering route
    url.pathname = `/sites/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files, api routes, and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
