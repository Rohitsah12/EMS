'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, LayoutDashboard, Users, Building2, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'employees', label: 'Employees', icon: Users, href: '/employees' },
  { id: 'departments', label: 'Departments', icon: Building2, href: '/departments' },
  { id: 'leave', label: 'Leave Requests', icon: Calendar, href: '/leave' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, redirect to login
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="sidebar w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col h-screen">
      {/* Header */}
      <div className="sidebar-header px-6 py-6 border-b border-white/10">
        <div className="sidebar-logo flex items-center gap-3">
          <Briefcase className="w-7 h-7" />
          <span className="sidebar-logo-text text-2xl font-bold">HR Portal</span>
        </div>
        <div className="sidebar-subtitle text-xs text-white/70 mt-1">Management System</div>
      </div>

      {/* Menu */}
      <div className="sidebar-menu flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`menu-item flex items-center gap-3 px-6 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all border-l-3 ${
                isActive
                  ? 'bg-white/15 text-white border-l-4 border-blue-400'
                  : 'border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="menu-text">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      <div className="sidebar-footer px-6 py-4 border-t border-white/10">
        <div className="user-profile flex items-center gap-3">
          <div className="user-avatar w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center font-semibold">
            {user?.name?.substring(0, 2).toUpperCase() || 'HR'}
          </div>
          <div className="user-info flex-1">
            <div className="user-name text-sm font-semibold">{user?.name || 'HR Admin'}</div>
            <div className="user-role text-xs text-white/70">{user?.role || 'Administrator'}</div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="opacity-70 hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            title="Logout"
          >
            <LogOut className={`w-5 h-5 ${isLoggingOut ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}