import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Camera, 
  Clock, 
  Users, 
  Receipt, 
  CreditCard, 
  BarChart3, 
  Calendar, 
  Settings as SettingsIcon, 
  LogOut, 
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDb } from '../contexts/DbContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  setIsOpen,
}) => {
  const { currentUser, logout, isDemoMode } = useAuth();
  const { settings } = useDb();

  const isDark = settings?.theme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'before-after', label: 'Before & After', icon: Camera },
    { id: 'logs', label: 'Daily Work Logs', icon: Clock },
    { id: 'employees', label: 'Employees & Attendance', icon: Users },
    { id: 'expenses', label: 'Expenses & Materials', icon: Receipt },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'calendar', label: 'Work Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings & Theme', icon: SettingsIcon },
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-64 flex flex-col shrink-0 transform transition-transform duration-200 ease-in-out border-r ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <Zap className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-tight">
                {settings?.companyName || 'Personal Electric'}
              </h1>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Electrical ERP
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                    : isDark
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User / Footer area */}
        <div className="p-3 border-t border-inherit">
          <div className={`p-3 rounded-xl flex items-center justify-between ${
            isDark ? 'bg-slate-800/60' : 'bg-slate-50'
          }`}>
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold truncate">
                {currentUser?.email || (isDemoMode ? 'Demo Mode User' : 'Electrician Pro')}
              </p>
              <p className="text-[10px] font-medium text-amber-500 dark:text-amber-400">
                {isDemoMode ? 'Demo Session' : 'Active Account'}
              </p>
            </div>
            <button
              onClick={() => logout()}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
