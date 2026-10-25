import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hindu Calendar NZ',
    short_name: 'Hindu Calendar',
    description: 'Hindu festival dates and timings for New Zealand cities.',
    start_url: '/?source=app',
    scope: '/',
    display: 'standalone',
    background_color: '#FBF5EA',
    theme_color: '#6E1A2A',
    lang: 'en-NZ',
    categories: ['lifestyle', 'reference'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Calendar', url: '/calendar' },
      { name: 'Festivals', url: '/festivals' },
      { name: 'Reminders', url: '/reminders' },
    ],
  };
}
