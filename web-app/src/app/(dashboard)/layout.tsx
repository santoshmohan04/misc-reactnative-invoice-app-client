'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/authSlice';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { apiSlice, useLogoutUserMutation } from '@/store/apiSlice';
import type { RootState } from '@/store';
import { clearAuthCookie } from '@/lib/auth-cookie';
import {
  Home,
  FileText,
  Users,
  Package,
  BarChart3,
  TrendingUp,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  Search,
  WifiOff,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Input } from '@/components/ui';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Items', href: '/items', icon: Package },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const [logoutUser] = useLogoutUserMutation();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const filteredNavigation = useMemo(() => {
    if (!searchTerm.trim()) {
      return navigation;
    }

    const keyword = searchTerm.toLowerCase();
    return navigation.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [searchTerm]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Session expired. Please sign in again.');
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleOnlineState = () => setIsOffline(!window.navigator.onLine);

    handleOnlineState();
    window.addEventListener('online', handleOnlineState);
    window.addEventListener('offline', handleOnlineState);

    return () => {
      window.removeEventListener('online', handleOnlineState);
      window.removeEventListener('offline', handleOnlineState);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser(undefined).unwrap();
    } catch {
      // Local logout still proceeds if API logout fails.
    }

    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    clearAuthCookie();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Invoice SaaS</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-shrink-0 px-4 py-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invoice SaaS</h1>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {isOffline ? (
          <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            <WifiOff className="h-4 w-4" />
            Offline mode detected. Requests will resume when connection is restored.
          </div>
        ) : null}
        <div className="sticky top-0 z-10 flex h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <div className="flex w-full md:ml-0">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full max-w-sm text-gray-400 focus-within:text-gray-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input
                    id="search-field"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search dashboard sections"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="ml-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}