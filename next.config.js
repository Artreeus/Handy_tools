/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // The installed @swc/core mis-minifies escaped backticks inside template
  // literals (e.g. in @radix-ui/react-progress's dev warnings), corrupting
  // the server bundle. Fall back to Terser for minification until upstream
  // is fixed.
  swcMinify: false,
};

module.exports = nextConfig;
