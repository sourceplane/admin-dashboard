// GitHub sign-in (Auth.js's GitHub provider), when its OAuth App is connected.
//
// The template has visitors sign in with a GitHub OAuth App whose client id
// and secret its owner creates and sets as AUTH_GITHUB_ID and
// AUTH_GITHUB_SECRET. A product built from nothing has no OAuth App yet, and
// it must still deploy, serve and pass its smoke test — so until both are set
// the dashboard runs without sign-in: Auth.js has no provider, every visitor
// is signed out, and /login says how to connect GitHub instead of offering a
// button that cannot work.
//
// Both are values `next build` inlines into the server bundle (next.config.mjs
// `env`), never into the browser's: per environment they are this
// repository's Orun secrets AUTH_GITHUB_ID and AUTH_GITHUB_SECRET, handed to
// the build (apps/web/component.yaml `optionalSecretEnv`), and set or rotated
// with a redeploy (README → Connecting GitHub sign-in). Locally, .env.local.
export type GitHubSignIn = { clientId: string; clientSecret: string };

export function githubSignIn(): GitHubSignIn | null {
  const clientId = process.env.AUTH_GITHUB_ID?.trim();
  const clientSecret = process.env.AUTH_GITHUB_SECRET?.trim();
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}
