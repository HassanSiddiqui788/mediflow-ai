import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#ffffff] text-zinc-950 antialiased selection:bg-yellow-500/30 selection:text-black">
      {/* Desktop Persistent Fixed Non-Scrolling Sidebar */}
      <Sidebar />

      {/* Main Area: Fixed Header + Independently Scrollable Body */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#ffffff]">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full bg-[#ffffff]">
          {children}
        </main>
      </div>
    </div>
  );
}
