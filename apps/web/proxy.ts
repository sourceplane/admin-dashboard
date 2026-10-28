// The template's middleware.ts. Next.js 16 calls it the proxy and runs it on
// the Node.js runtime, where it reaches the database for the session key
// (lib/auth-secret.ts) through the same binding the pages use.
export { auth as proxy } from '@/lib/auth';

// Don't invoke the proxy on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
