import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedAdmin } from '@/lib/auth/admin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side strict check: verify that the user is an active administrator in the database
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen flex bg-[#121212] text-[#FAF8F5]">
      {/* Fixed Luxury Dark Sidebar */}
      <AdminSidebar admin={admin} />

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader admin={admin} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#161614]">
          {children}
        </main>
      </div>
    </div>
  );
}
