import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // Retrieve credentials from environment variables, fallback to defaults if not set
    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPwd = process.env.ADMIN_PASSWORD || 'password';

    if (user === expectedUser && pwd === expectedPwd) {
      return NextResponse.next();
    }
  }

  // If credentials are not provided or incorrect, prompt for them
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="QR Link Portal login required"',
    },
  });
}

// Only protect the root route (the QR code generator)
// Any other routes, like /links path, remain entirely public.
export const config = {
  matcher: ['/'],
};
