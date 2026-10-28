import { beforeEach, describe, expect, it, vi } from "vitest";

// lib/db.ts's getProducts is upstream's, unchanged but for the client it
// queries through: five products a page, the total alongside, and a search
// over the whole table by name. drizzle's builder is replaced by one that
// records each query's shape and answers from a fixed table of ten.
type Query = { fields?: unknown; where?: boolean; limit?: number; offset?: number };
const queries: Query[] = [];
const table = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Product ${i + 1}` }));

function select(fields?: unknown) {
  const q: Query = { fields };
  queries.push(q);
  const rows = () => {
    if (fields) return [{ count: table.length }];
    const start = q.offset ?? 0;
    return table.slice(start, start + (q.limit ?? table.length));
  };
  const chain = {
    from: () => chain,
    where: () => ((q.where = true), chain),
    limit: (n: number) => ((q.limit = n), chain),
    offset: (n: number) => ((q.offset = n), chain),
    then: (ok: (v: unknown) => unknown, ko?: (e: unknown) => unknown) => Promise.resolve(rows()).then(ok, ko),
  };
  return chain;
}
vi.mock("drizzle-orm/postgres-js", () => ({ drizzle: () => ({ select }) }));
vi.mock("@/lib/sql", () => ({ getSql: async () => ({}) }));

beforeEach(() => {
  queries.length = 0;
});

describe("getProducts (lib/db.ts)", () => {
  it("answers the first page: five products, the next offset and the total", async () => {
    const { getProducts } = await import("@/lib/db");
    const r = await getProducts("", 0);
    expect(r.products.map((p) => p.id)).toEqual([1, 2, 3, 4, 5]);
    expect(r).toMatchObject({ newOffset: 5, totalProducts: 10 });
  });

  it("answers the second page from its offset", async () => {
    const { getProducts } = await import("@/lib/db");
    const r = await getProducts("", 5);
    expect(r.products.map((p) => p.id)).toEqual([6, 7, 8, 9, 10]);
    expect(queries.find((q) => !q.fields)).toMatchObject({ limit: 5, offset: 5 });
  });

  it("searches the whole table by name, with no paging", async () => {
    const { getProducts } = await import("@/lib/db");
    const r = await getProducts("smart", 0);
    expect(queries).toEqual([expect.objectContaining({ where: true, limit: 1000 })]);
    expect(r).toMatchObject({ newOffset: null, totalProducts: 0 });
  });
});
