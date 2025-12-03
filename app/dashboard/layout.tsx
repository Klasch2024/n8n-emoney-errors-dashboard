'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, BarChart3, Workflow, LogOut, Search, Settings } from 'lucide-react';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { motion } from 'framer-motion';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true); // Keep sidebar expanded by default

  useEffect(() => {
    // Check authentication on client side
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Clear cookies
    document.cookie = 'isAuthenticated=; path=/; max-age=0';
    document.cookie = 'userEmail=; path=/; max-age=0';
    document.cookie = 'userName=; path=/; max-age=0';
    
    // Call logout API
    await fetch('/api/auth/logout', { method: 'POST' });
    
    // Redirect to login
    router.push('/login');
  };

  const links = [
    {
      label: 'Errors',
      href: '/dashboard/errors',
      icon: <AlertCircle className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'Fixed Errors',
      href: '/dashboard/fixed',
      icon: <CheckCircle2 className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'Workflows',
      href: '/dashboard/workflows',
      icon: <Workflow className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'Search IDs',
      href: '/dashboard/search-ids',
      icon: <Search className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5 flex-shrink-0" />,
    },
  ];

  return (
    <div className="min-h-screen flex py-4 px-4 md:py-6 md:px-6 gap-6">
      {/* Floating Sidebar */}
      <aside className="flex-shrink-0">
        <div className="sticky top-4 h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)]">
          <Sidebar open={open} setOpen={setOpen} animate={false}>
            <SidebarBody className="justify-between gap-6 h-full">
              <div className="flex flex-col flex-1">
                {open ? <Logo /> : <LogoIcon />}
                <div className="mt-6 flex flex-col gap-2">
                  {links.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))}
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-[#333333]">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 bg-transparent text-[#BEBEBE] hover:bg-[#333333] hover:text-[#F5F5F5] w-full"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </SidebarBody>
          </Sidebar>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="max-w-[1400px] mx-auto">
        {children}
      </div>
      </main>
    </div>
  );
}

const Logo = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-normal flex space-x-2 items-center text-sm text-[#F5F5F5] py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-[#E67514] rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <span className="font-bold text-lg text-[#F5F5F5] whitespace-pre">
        N8N Errors
      </span>
    </motion.div>
  );
};

const LogoIcon = () => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-[#F5F5F5] py-1 relative z-20">
      <div className="h-5 w-6 bg-[#E67514] rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </div>
  );
};

