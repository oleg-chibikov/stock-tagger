/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental:{
    appDir: true,
    instrumentationHook: true,
  }
};

module.exports =  nextConfig;