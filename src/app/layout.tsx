import type { Metadata } from 'next';
import { Cormorant_Garamond, Geist } from 'next/font/google';
import './globals.css';

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Perle Noire | Haute Joaillerie & Perles de Tahiti',
    template: '%s | Perle Noire Joaillerie',
  },
  description:
    'Maison de Haute Joaillerie située Place Vendôme à Paris. Créations exclusives façonnées autour des perles rares de Tahiti, d’or 18 carats et de diamants certifiés.',
  keywords: [
    'Haute Joaillerie',
    'Perle Noire',
    'Perle de Tahiti',
    'Place Vendôme',
    'Bague solitaire',
    'Or 18 carats',
    'Joaillerie de luxe',
  ],
  authors: [{ name: 'Perle Noire Joaillerie Paris' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${cormorantGaramond.variable} ${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#141414]">
        {children}
      </body>
    </html>
  );
}
