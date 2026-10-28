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
}

export default nextConfig
