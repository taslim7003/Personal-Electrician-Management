import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  FileText, 
  Settings as SettingsIcon, 
  Clock, 
  LogOut, 
  X,
  Bolt,
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDb } from '../contexts/DbContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const { settings } = useDb();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Wrench },
    { id: 'before-after', label: 'Before & After Photos', icon: Camera },
    { id: 'logs', label: 'Daily Work Logs', icon: Clock },
    { id: 'employees', label: 'Employees & Wage', icon: Users },
    { id: 'expenses', label: 'Expenses & Materials', icon: DollarSign },
    { id: 'payments', label: 'Payments Recv.', icon: TrendingUp },
    { id: 'reports', label: 'Reports Export', icon: FileText },
    { id: 'calendar', label: 'Calendar Schedule', icon: Calendar },
    { id: 'settings', label: 'Settings & Backup', icon: SettingsIcon },
  ];

  const handleNav = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r 
        bg-slate-900 border-slate-800 text-slate-300
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bolt className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight leading-tight">
                {settings?.businessName || 'SparkFlow Pro'}
              </h1>
              <span className="text-[10px] font-mono tracking-wider text-indigo-400 font-bold uppercase">
                Owner ERP
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md md:hidden hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`
                  flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? 'bg-slate-800 text-white font-semibold' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'}
                `}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex flex-col gap-3">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
          <div className="px-4 text-[10px] opacity-50">
            &copy; 2026 SparkFlow Pro
          </div>
        </div>
      </aside>
    </>
  );
};
