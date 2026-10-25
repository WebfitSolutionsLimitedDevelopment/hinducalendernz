import { NextResponse, type NextRequest } from 'next/server';

// Password-protects the site while PREVIEW_PASSWORD is set (remove it to go public).
// The reminder cron, service worker, manifest and icons are excluded (see matcher).
export function proxy(req: NextRequest) {
  const password = process.env.PREVIEW_PASSWORD;
  if (!password) return NextResponse.next();
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Basic ')) {
    const [, pass] = atob(auth.slice(6)).split(':');
    if (pass === password) return NextResponse.next();
  }
  return new NextResponse('Preview — password required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Hindu Calendar preview"' },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api/cron|sw\\.js|manifest\\.webmanifest|icons/|brand/|favicon|icon|apple-icon).*)'],
};
