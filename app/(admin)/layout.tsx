'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  Shield,
  BarChart3,
  Flag
} from 'lucide-react';

// Navigation menu items for admin portal
const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Job Moderation', href: '/admin/jobs', icon: Briefcase },
  { name: 'Content Management', href: '/admin/content', icon: FileText },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Reported Content', href: '/admin/reported', icon: Flag },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New user registered: john@example.com', read: false, time: '1 hour ago', type: 'user' },
    { id: 2, message: '3 jobs pending moderation', read: false, time: '2 hours ago', type: 'job' },
    { id: 3, message: 'Reported content needs review', read: false, time: '5 hours ago', type: 'flag' },
    { id: 4, message: 'System backup completed', read: true, time: '1 day ago', type: 'system' },
    { id: 5, message: 'New recruiter registered', read: true, time: '2 days ago', type: 'user' },
  ]);

  // Demo user data (replace with actual from auth store)
  const user = {
    name: 'Admin User',
    email: 'admin@careerconnect.com',
    role: 'Super Administrator',
    avatar: 'AD',
  };

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Toggle sidebar collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'user': return <Users className="h-4 w-4 text-blue-500" />;
      case 'job': return <Briefcase className="h-4 w-4 text-green-500" />;
      case 'flag': return <Flag className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ==================== MOBILE SIDEBAR OVERLAY ==================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==================== FIXED SIDEBAR ==================== */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-full 
          bg-white dark:bg-gray-800 
          shadow-xl 
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                Admin Portal
              </span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/admin/dashboard" className="flex justify-center w-full">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </Link>
          )}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* User Profile Section */}
        <div className={`flex items-center px-4 py-5 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user.avatar}
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.role}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isCollapsed ? 'justify-center' : 'space-x-3'}
                  ${isActive 
                    ? 'bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-900/30 dark:to-purple-900/30 text-red-700 dark:text-red-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-red-600' : ''}`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section (Logout) */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200
              text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
              ${isCollapsed ? 'justify-center' : 'space-x-3'}
            `}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Page Title (optional - can be dynamic) */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Welcome back, {user.name.split(' ')[0]}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                System Management Console
              </p>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3 ml-auto">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Notifications Dropdown */}
              <div className="relative group">
                <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">System Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${
                            !notif.read ? 'bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {getNotificationIcon(notif.type)}
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No notifications</div>
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full text-center text-sm text-red-600 hover:text-red-700 py-1">
                      Mark all as read
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}