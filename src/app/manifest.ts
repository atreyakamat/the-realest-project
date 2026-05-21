import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EstateFlow CRM',
    short_name: 'EstateFlow',
    description: 'Mobile-first real estate CRM with AI automation and live lead alerts.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/next.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
    ],
  };
}
