import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { authSecret } from './auth-secret';
import { githubSignIn } from './github';

// Upstream's config — GitHub, JWT sessions, no database adapter — initialised
// lazily: Auth.js resolves this per request, because the secret may be one the
// database holds (lib/auth-secret.ts) and GitHub may not be connected yet
// (lib/github.ts). `trustHost`: the Worker serves on workers.dev or the
// owner's own domain, and Auth.js trusts the Host header only on Vercel by
// default.
export const { handlers, signIn, signOut, auth } = NextAuth(async () => {
  const github = githubSignIn();
  return {
    providers: github ? [GitHub(github)] : [],
    secret: await authSecret(),
    trustHost: true
  };
});
