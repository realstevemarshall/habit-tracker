import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Production builds are served from GitHub Pages at
// https://realstevemarshall.github.io/habit-tracker/, so assets need that
// prefix. `npm run dev` keeps serving from the root (http://localhost:5173/).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/habit-tracker/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    // Makes the app installable ("Add to Home Screen") and usable offline.
    // Installing on a phone requires the built app to be served over HTTPS.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Habit & Exercise Tracker',
        short_name: 'Habits',
        description:
          'Track push-ups, sit-ups, pull-ups, miles, daily habits, and fasts on the road to 50.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
      },
    }),
  ],
}));
