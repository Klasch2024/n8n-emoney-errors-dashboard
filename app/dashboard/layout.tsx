'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isErrorsPage = pathname === '/dashboard/errors';
  const isAnalyticsPage = pathname === '/dashboard/analytics';

  return (
    <div className="min-h-screen bg-[#212121] p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] mb-6 md:mb-8">N8N Errors Dashboard</h1>
        
        <div className="bg-[#2A2A2A] border border-[#333333] rounded-xl p-2 mb-6 md:mb-8 flex gap-2">
          <Link
            href="/dashboard/errors"
            className={`
              flex-1 sm:flex-initial px-4 sm:px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ease-in-out text-center
              ${isErrorsPage
                ? 'bg-[#E67514] text-white font-semibold'
                : 'bg-transparent text-[#BEBEBE] hover:bg-[#333333] hover:text-[#F5F5F5]'
              }
            `}
          >
            Errors
          </Link>
          <Link
            href="/dashboard/analytics"
            className={`
              flex-1 sm:flex-initial px-4 sm:px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ease-in-out text-center
              ${isAnalyticsPage
                ? 'bg-[#E67514] text-white font-semibold'
                : 'bg-transparent text-[#BEBEBE] hover:bg-[#333333] hover:text-[#F5F5F5]'
              }
            `}
          >
            Analytics
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}

