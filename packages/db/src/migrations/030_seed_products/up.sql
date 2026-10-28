-- The template's ten products, verbatim from its app/api/seed/route.ts (the
-- route upstream shipped commented out, to be uncommented and requested once
-- by hand). As a migration it runs once per environment, before the Worker
-- deploys, and nobody can request it — the route is gone. `available_at` is
-- the time the migration ran, as upstream's `new Date()` was the time of the
-- request. The images stay where the template hosts them.
--
-- Idempotent, as every migration here must be: each row is keyed on its id
-- and kept if it is already there. Upstream wrote the ids explicitly, which
-- leaves the `serial` sequence at 1; the setval moves it past them, so the
-- next product the dashboard adds is not refused on a duplicate key.
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
