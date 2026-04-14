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
        name: 'Deutsches Reimwörterbuch',
        short_name: 'Reime',
        description:
          'Persönliches deutsches Reimwörterbuch – offline, erweiterbar, auf dem Handy nutzbar.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
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
