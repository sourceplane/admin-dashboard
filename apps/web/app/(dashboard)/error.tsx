'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  // Upstream's page asked for a table to be created by hand in the Vercel
  // Postgres dashboard. Here the migrations create and seed it (packages/db,
  // applied by db-migrate before every deploy), so a page that cannot read it
  // means they have not run against this database yet.
  return (
    <main className="p-4 md:p-6">
      <div className="mb-8 space-y-4">
        <h1 className="font-semibold text-lg md:text-2xl">
          Please complete setup
        </h1>
        <p>
          The products table could not be read. Every deploy applies the
          migrations before the site; locally, apply them to the database in
          <code> POSTGRES_URL</code>:
        </p>
        <pre className="my-4 px-3 py-4 bg-black text-white rounded-lg max-w-2xl overflow-scroll flex text-wrap">
          <code>pnpm --filter @app/web db:migrate</code>
        </pre>
      </div>
    </main>
  );
}
