/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'linka-profile-images.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'linka-profile-images.s3.sa-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
  },
}

export default nextConfig
