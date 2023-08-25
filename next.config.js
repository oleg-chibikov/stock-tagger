/** @type {import('next').NextConfig} */
const {
    PHASE_DEVELOPMENT_SERVER,
    PHASE_PRODUCTION_SERVER,
    PHASE_PRODUCTION_BUILD,
} = require('next/constants');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental:{
    appDir: true
  }
};

const bootServices = async () => {
  return fetch('http://localhost:3000/api/boot')
    .then(async (res) => {
      const resJson = await res.json();

      return JSON.stringify(resJson.bootedServices);
    })
    .catch(async (ex) => {
      console.error(ex);
      return false
    });
};

const boot = async () => {
  const bootedServices = await bootServices();
  console.log(`bootedServices: ${bootedServices}`);
}

module.exports = async (phase, { defaultConfig }) => {
  if (process.argv.includes('dev') && phase === PHASE_DEVELOPMENT_SERVER) {
    console.log('[next.config.js (dev)]');

    await boot();
  } else if (
    process.argv.includes('start') &&
    phase === PHASE_PRODUCTION_SERVER
  ) {
    console.log('[next.config.js (start)]');

    // Timeout start
    setTimeout(async () => {
      await boot();
    }, 1000);
  } else if (
    process.argv.includes('build') &&
    phase === PHASE_PRODUCTION_BUILD
  ) {
    console.log('[next.config.js (build)]');

    // Boot into static pages? getStaticProps ?
    // pages/staticpage.tsx
    // import bootHandler from '@/server';
    // const bootedServices = await bootHandler();
  }

  return nextConfig;
};
