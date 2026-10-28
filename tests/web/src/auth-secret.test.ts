import { beforeEach, describe, expect, it, vi } from "vitest";

// lib/auth-secret.ts: the key Auth.js signs and encrypts the session cookie
// with is AUTH_SECRET when one is set, and otherwise the key the
// environment's database generated for itself (migration 040_app_secrets) —
// read once per isolate. The database client is mocked: what is tested is
// which key wins and when the database is asked.
const sql = vi.fn();
const getSql = vi.fn(async () => sql);
vi.mock("@/lib/sql", () => ({ getSql: () => getSql() }));

const STORED = "a".repeat(64);

describe("the session key (lib/auth-secret.ts)", () => {
  beforeEach(() => {
    vi.resetModules();
    sql.mockReset();
    getSql.mockClear();
    delete process.env.AUTH_SECRET;
  });

  it("is AUTH_SECRET when one is set, without asking the database", async () => {
    process.env.AUTH_SECRET = "an-owner-set-secret-of-enough-length";
    const { authSecret } = await import("@/lib/auth-secret");
    expect(await authSecret()).toBe("an-owner-set-secret-of-enough-length");
    expect(getSql).not.toHaveBeenCalled();
  });

  it("is the stored key otherwise, read once per isolate", async () => {
    sql.mockResolvedValue([{ value: STORED }]);
    const { authSecret } = await import("@/lib/auth-secret");
    expect(await authSecret()).toBe(STORED);
    expect(await authSecret()).toBe(STORED);
    expect(sql).toHaveBeenCalledTimes(1);
    expect((sql.mock.calls[0]![0] as string[]).join("?")).toMatch(/from app_private\.secrets where name = 'auth_secret'/);
  });

  it("treats an empty AUTH_SECRET (an .env line left blank) as unset", async () => {
    process.env.AUTH_SECRET = "";
    sql.mockResolvedValue([{ value: STORED }]);
    const { authSecret } = await import("@/lib/auth-secret");
    expect(await authSecret()).toBe(STORED);
  });

  it("names the missing migration when there is neither", async () => {
    sql.mockResolvedValue([]);
    const { authSecret } = await import("@/lib/auth-secret");
    await expect(authSecret()).rejects.toThrow(/040_app_secrets/);
  });
});
