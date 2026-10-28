import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// /login offers upstream's "Sign in with GitHub" once GitHub's OAuth App is
// connected, and until then says how to connect it, its button disabled.
vi.mock("@/lib/auth", () => ({ signIn: vi.fn() }));

async function login() {
  vi.resetModules();
  const { default: LoginPage } = await import("@/app/login/page");
  return renderToStaticMarkup(LoginPage());
}

describe("the login page (app/login/page.tsx)", () => {
  beforeEach(() => {
    delete process.env.AUTH_GITHUB_ID;
    delete process.env.AUTH_GITHUB_SECRET;
  });

  it("says how to connect GitHub, its button disabled, until it is", async () => {
    const html = await login();
    expect(html).toContain('data-github-sign-in="not-connected"');
    expect(html).toContain("AUTH_GITHUB_ID");
    expect(html).toContain("/api/auth/callback/github");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Sign in with GitHub<\/button>/);
  });

  it("offers upstream's sign-in once it is", async () => {
    process.env.AUTH_GITHUB_ID = "an-id";
    process.env.AUTH_GITHUB_SECRET = "a-secret";
    const html = await login();
    expect(html).not.toContain("not-connected");
    expect(html).toContain("Sign in with GitHub");
    expect(html).not.toMatch(/disabled=""/);
  });
});
