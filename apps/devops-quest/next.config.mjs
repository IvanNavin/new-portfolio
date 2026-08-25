/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NOTE: deliberately no `turbopack.root` — pinning it breaks the React Client
  // Manifest under pnpm in this monorepo (see film-scope's note for the detail).
  //
  // The Prisma schema lives locally at ./prisma rather than coming from
  // @repo/prisma: Vercel uploads only this app's directory, so a workspace
  // dependency cannot resolve there. Same arrangement as apps/devpulse —
  // migrations stay centralised in packages/prisma, and the two schemas must
  // be edited in tandem.
  serverExternalPackages: ['@prisma/client'],
  // The generated client loads its query engine by path at runtime, so the
  // binary has to be traced into the function bundle.
  outputFileTracingIncludes: {
    '/api/**': ['./generated/prisma-client/**'],
  },
};

export default nextConfig;
