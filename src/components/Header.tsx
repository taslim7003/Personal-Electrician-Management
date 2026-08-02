import React from 'react';
import { Menu, Sun, Moon, Sparkles, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDb } from '../contexts/DbContext';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { currentUser, isDemoMode, isAdmin } = useAuth();
  const { settings, updateSettings } = useDb();

  const isDark = settings?.theme === 'dark';

  const toggleTheme = () => {
    if (settings) {
      updateSettings({
        ...settings,
        theme: isDark ? 'light' : 'dark',
      });
    }
  };

  return (
    <header className={`h-16 shrink-0 px-4 md:px-8 border-b flex items-center justify-between transition-colors ${
      isDark 
        ? 'bg-slate-900 border-slate-800 text-slate-100' 
        : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
    }`}>
      {/* Left side controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{settings?.companyName || 'Personal Electric'} ERP</span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {isDemoMode && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
            Demo Mode
          </span>
        )}

        {isAdmin && (
          <span className="hidden md:flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </span>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl transition-colors border font-semibold ${
            isDark 
              ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
              : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* User Info Badge */}
        <div className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border text-xs font-semibold ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700/80 text-slate-200' 
            : 'bg-slate-100/80 border-slate-200/90 text-slate-900'
        }`}>
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
            <UserIcon className="w-3.5 h-3.5" />
          </div>
          <span className="truncate max-w-[120px] md:max-w-[180px]">
            {currentUser?.email?.split('@')[0] || (isDemoMode ? 'Demo User' : 'Pro Electrician')}
          </span>
        </div>
      </div>
    </header>
  );
};
