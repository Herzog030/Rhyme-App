import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serviert aus einem Unterpfad (z.B. /Rhyme-App/).
// Der Workflow setzt VITE_BASE beim Build entsprechend; lokal bleibt es "/".
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      base,
      scope: base,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'My Book Of Rhymes',
        short_name: 'MBoR',
        description:
          'My Book Of Rhymes – persönliches Textarchiv, Entwürfe und Reimwörterbuch, offline nutzbar.',
        theme_color: '#faf7ef',
        background_color: '#faf7ef',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        lang: 'de',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,txt}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  server: {
    host: true,
  },
});
