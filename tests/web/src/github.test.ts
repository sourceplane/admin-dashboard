import { beforeEach, describe, expect, it } from "vitest";
import { githubSignIn } from "@/lib/github";

// lib/github.ts: GitHub sign-in exists only when its OAuth App's client id
// and secret are BOTH set — at build time on a deployment (next.config.mjs
// inlines them), from the environment here.
describe("githubSignIn (lib/github.ts)", () => {
  beforeEach(() => {
    delete process.env.AUTH_GITHUB_ID;
    delete process.env.AUTH_GITHUB_SECRET;
  });

  it("is null with neither", () => {
    expect(githubSignIn()).toBeNull();
  });

  it("is null with only one of the two", () => {
    process.env.AUTH_GITHUB_ID = "an-id";
    expect(githubSignIn()).toBeNull();
    delete process.env.AUTH_GITHUB_ID;
    process.env.AUTH_GITHUB_SECRET = "a-secret";
    expect(githubSignIn()).toBeNull();
  });

  it("treats blank values (the build's empty default) as unset", () => {
    process.env.AUTH_GITHUB_ID = "";
    process.env.AUTH_GITHUB_SECRET = "  ";
    expect(githubSignIn()).toBeNull();
  });

  it("is the pair, trimmed, with both", () => {
    process.env.AUTH_GITHUB_ID = " an-id ";
    process.env.AUTH_GITHUB_SECRET = "a-secret";
    expect(githubSignIn()).toEqual({ clientId: "an-id", clientSecret: "a-secret" });
  });
});
