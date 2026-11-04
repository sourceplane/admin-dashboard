import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// `next dev` reaches the Hyperdrive binding through wrangler's local
// platform proxy (render apps/web/wrangler.jsonc first: `pnpm run wire:fixture`).
initOpenNextCloudflareForDev()

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // The Workers runtime has no image optimiser: the product photos and the
    // GitHub avatar load from where they are hosted, as the template lists.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        search: ''
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        search: ''
      }
    ]
  },
  // GitHub sign-in's OAuth App (lib/github.ts), inlined into the SERVER
  // bundle at build time: per environment they are the repository's Orun
  // secrets of these names, handed to the build by apps/web/component.yaml.
  // Unset, the dashboard builds without sign-in.
  env: {
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID ?? '',
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET ?? ''
  },
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  // Dev server only (`next build` ignores it): orun.work's live Preview tab
  // loads `next dev` from the preview's own host, and Next.js refuses the
  // hot reload and other /_next/* dev requests from an origin it is not told
  // about. These are the preview's hosts, prod's and stage's.
  allowedDevOrigins: ['*.orun-preview.app', 'preview-gateway-stage.oruncloud.workers.dev'],
  experimental: {
    // Dev server only: behind orun.work's live Preview the browser's Origin
    // is the preview's host while `next dev` sees a local Host, and Next.js
    // refuses a Server Action from an origin it is not told about. `next
    // build` runs with NODE_ENV=production, so production keeps its
    // same-origin check.
    ...(process.env.NODE_ENV === 'development'
      ? { serverActions: { allowedOrigins: ['*.orun-preview.app', 'preview-gateway-stage.oruncloud.workers.dev'] } }
      : {})
  },
}

export default nextConfig
