-- The same SQL as packages/db/src/migrations/030_seed_products/up.sql (which
-- says why), for drizzle-kit (`pnpm db:migrate`) against a local database.
-- A custom migration (`drizzle-kit generate --custom`): the data, not the
-- schema.
INSERT INTO "products" ("id", "image_url", "name", "status", "price", "stock", "available_at") VALUES
  (1, 'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/smartphone-gaPvyZW6aww0IhD3dOpaU6gBGILtcJ.webp', 'Smartphone X Pro', 'active', 999.00, 150, now()),
  (2, 'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/earbuds-3rew4JGdIK81KNlR8Edr8NBBhFTOtX.webp', 'Wireless Earbuds Ultra', 'active', 199.00, 300, now()),
  (3, 'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/home-iTeNnmKSMnrykOS9IYyJvnLFgap7Vw.webp', 'Smart Home Hub', 'active', 149.00, 200, now()),
  (4, 'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/tv-H4l26crxtm9EQHLWc0ddrsXZ0V0Ofw.webp', '4K Ultra HD Smart TV', 'active', 799.00, 50, now()),
  (5, 'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/laptop-9bgUhjY491hkxiMDeSgqb9R5I3lHNL.webp', 'Gaming Laptop Pro', 'active', 1299.00, 75, now()),
  (6, 'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/headset-lYnRnpjDbZkB78lS7nnqEJFYFAUDg6.webp', 'VR Headset Plus', 'active', 349.00, 120, now()),
  (7, 'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/watch-S2VeARK6sEM9QFg4yNQNjHFaHc3sXv.webp', 'Smartwatch Elite', 'active', 249.00, 250, now()),
  (8, 'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/speaker-4Zk0Ctx5AvxnwNNTFWVK4Gtpru4YEf.webp', 'Bluetooth Speaker Max', 'active', 99.00, 400, now()),
  (9, 'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/charger-GzRr0NSkCj0ZYWkTMvxXGZQu47w9r5.webp', 'Portable Charger Super', 'active', 59.00, 500, now()),
  (10, 'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/thermostat-8GnK2LDE3lZAjUVtiBk61RrSuqSTF7.webp', 'Smart Thermostat Pro', 'active', 199.00, 175, now())
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
SELECT setval(pg_get_serial_sequence('"products"', 'id'), (SELECT max("id") FROM "products"));
