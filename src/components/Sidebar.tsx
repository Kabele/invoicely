'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutGrid, Settings, LogOut, Info, ShieldCheck, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const superuserEmail = 'kabelecliff@gmail.com';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
    },
    {
      href: '/about',
      label: 'About',
      icon: Info,
    },
  ];

  if (user?.email === superuserEmail) {
    navItems.push({
      href: '/dashboard/superuser',
      label: 'Admin',
      icon: ShieldCheck,
    });
  }

  return (
    <>
    {/* Mobile Overlay */}
    <div 
        className={cn(
            "fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 md:hidden",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
    />

    <aside 
      className={cn(
        "fixed top-0 left-0 h-full w-64 flex-shrink-0 border-r bg-background flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between h-20 px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-800">InvoiceFast</h1>
        </Link>
         <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="h-6 w-6" />
            <span className="sr-only">Close menu</span>
        </Button>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
              pathname === item.href && 'bg-muted text-primary'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t">
        <div className="text-sm truncate mb-2">{user?.email}</div>
         <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>
    </aside>
    </>
  );
}
