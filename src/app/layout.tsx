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
    default: 'Perle Noire | Joaillerie Précieuse',
    template: '%s | Perle Noire',
  },
  description:
    'Découvrez des créations joaillières contemporaines et intemporelles, pensées pour sublimer chaque instant.',
  keywords: [
    'Joaillerie',
    'Bijoux précieux',
    'Bagues',
    'Colliers',
    'Bracelets',
    'Boucles d’oreilles',
    'Perle Noire',
  ],
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
      <body className="min-h-full flex flex-col bg-[#FCFAF7] text-[#171717]">
        {children}
      </body>
    </html>
  );
}
