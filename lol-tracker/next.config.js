/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
      },
    ],
  },
  experimental: {
    instrumentationHook: true,
  },
  env: {
    NEXT_PUBLIC_CHALLENGE_START: process.env.CHALLENGE_START,
    NEXT_PUBLIC_CHALLENGE_DEADLINE: process.env.CHALLENGE_DEADLINE,
  },
}

module.exports = nextConfig
