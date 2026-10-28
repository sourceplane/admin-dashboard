import { encode } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// lib/auth.ts is upstream's Auth.js config — GitHub, JWT sessions — resolved
// per request. These drive its real handlers (and so the proxy, which runs the
// same `auth`) with the database mocked: a session cookie encrypted under the
// key the database generated is a session, one under another key is not, an
// owner-set AUTH_SECRET wins; and GitHub is a provider only once its OAuth
// App's id and secret are both set.
const sql = vi.fn();
vi.mock("@/lib/sql", () => ({ getSql: async () => sql }));

const STORED = "b".repeat(64);
const ORIGIN = "https://dash.example.com";
// Over https (a deployment) Auth.js names the cookie with the `__Secure-`
// prefix.
const COOKIE = "__Secure-authjs.session-token";

async function sessionCookie(secret: string) {
  const value = await encode({
    salt: COOKIE,
    secret,
    token: { name: "Ada", email: "ada@example.invalid", picture: "https://avatars.githubusercontent.com/u/1" },
  });
  return `${COOKIE}=${value}`;
}

// What /api/auth/session and /api/auth/providers answer.
type Body = {
  user?: { name: string; email: string; image: string };
  github?: { callbackUrl: string };
} | null;

async function get(path: string, cookie?: string) {
  const { handlers } = await import("@/lib/auth");
  const res = await handlers.GET(new NextRequest(`${ORIGIN}${path}`, { headers: cookie ? { cookie } : {} }));
  return { status: res.status, body: (await res.json()) as Body };
}

describe("Auth.js (lib/auth.ts)", () => {
  beforeEach(() => {
    vi.resetModules();
    sql.mockReset();
    sql.mockResolvedValue([{ value: STORED }]);
    delete process.env.AUTH_SECRET;
    delete process.env.AUTH_GITHUB_ID;
    delete process.env.AUTH_GITHUB_SECRET;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("has no session without a cookie", async () => {
    expect(await get("/api/auth/session")).toEqual({ status: 200, body: null });
  });

  it("reads a session encrypted under the key the database generated", async () => {
    const { status, body } = await get("/api/auth/session", await sessionCookie(STORED));
    expect(status).toBe(200);
    expect(body?.user).toEqual({ name: "Ada", email: "ada@example.invalid", image: "https://avatars.githubusercontent.com/u/1" });
    expect(sql).toHaveBeenCalledTimes(1);
  });

  it("refuses one encrypted under another key", async () => {
    const { body } = await get("/api/auth/session", await sessionCookie("c".repeat(64)));
    expect(body).toBeNull();
  });

  it("uses AUTH_SECRET instead, when it is set", async () => {
    process.env.AUTH_SECRET = "an-owner-set-secret-of-enough-length";
    const { body } = await get("/api/auth/session", await sessionCookie("an-owner-set-secret-of-enough-length"));
    expect(body?.user?.email).toBe("ada@example.invalid");
    expect(sql).not.toHaveBeenCalled();
  });

  it("offers no provider until GitHub's OAuth App is connected", async () => {
    expect(await get("/api/auth/providers")).toEqual({ status: 200, body: {} });
    process.env.AUTH_GITHUB_ID = "an-id";
    expect((await get("/api/auth/providers")).body).toEqual({});
  });

  it("offers GitHub, calling back to the request's own origin, once both are set", async () => {
    process.env.AUTH_GITHUB_ID = "an-id";
    process.env.AUTH_GITHUB_SECRET = "a-secret";
    const { body } = await get("/api/auth/providers");
    expect(Object.keys(body ?? {})).toEqual(["github"]);
    expect(body?.github?.callbackUrl).toBe(`${ORIGIN}/api/auth/callback/github`);
  });
});
