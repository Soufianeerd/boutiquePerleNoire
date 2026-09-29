import React from 'react';
import { getStoreSettings } from '@/features/settings/actions';
import { ModeBanner } from '@/components/storefront/ModeBanner';
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader';
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter';

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <ModeBanner settings={settings} />
      <StorefrontHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <StorefrontFooter settings={settings} />
    </div>
  );
}
