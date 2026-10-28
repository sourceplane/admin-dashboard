import 'server-only';

import { drizzle } from 'drizzle-orm/postgres-js';
import { count, eq, ilike } from 'drizzle-orm';
import { getSql } from './sql';
import { products, type SelectProduct } from './schema';

export { products, statusEnum, type SelectProduct } from './schema';

// Connect to Postgres per call (see lib/sql.ts) — upstream's module-level
// `db` cannot outlive a request on Workers.
export const getDb = async () => drizzle(await getSql());

export async function getProducts(
  search: string,
  offset: number
): Promise<{
  products: SelectProduct[];
  newOffset: number | null;
  totalProducts: number;
}> {
  const db = await getDb();
  // Always search the full table, not per page
  if (search) {
    return {
      products: await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalProducts: 0
    };
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  let totalProducts = await db.select({ count: count() }).from(products);
  let moreProducts = await db.select().from(products).limit(5).offset(offset);
  let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  return {
    products: moreProducts,
    newOffset,
    totalProducts: totalProducts[0].count
  };
}

export async function deleteProductById(id: number) {
  const db = await getDb();
  await db.delete(products).where(eq(products.id, id));
}
