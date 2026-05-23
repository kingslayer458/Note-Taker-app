/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint configuration is no longer supported in next.config.mjs in Next.js 16
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone",
}

export default nextConfig
