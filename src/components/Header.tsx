import React, { useEffect, useState } from 'react';
import { Menu, Sun, Moon, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDb } from '../contexts/DbContext';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { currentUser, isDemoMode } = useAuth();
  const { settings, updateSettings } = useDb();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + now.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    if (settings) {
      updateSettings({
        ...settings,
        theme: settings.theme === 'dark' ? 'light' : 'dark'
      });
    }
  };

  const isDark = settings?.theme === 'dark';

  return (
    <header className={`
      flex items-center justify-between h-16 px-6 border-b shrink-0
      ${isDark 
        ? 'bg-slate-900 border-slate-800 text-slate-100' 
        : 'bg-white border-slate-200 text-slate-800'}
    `}>
      {/* Left side: Hamburger and Time */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg md:hidden hover:bg-slate-800/10 dark:hover:bg-slate-200/10"
          id="mobile-sidebar-toggle"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">{time}</span>
        </div>

        {isDemoMode && (
          <span className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/15 rounded-lg border border-amber-500/10">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
            Evaluation Demo Mode
          </span>
        )}
      </div>

      {/* Right side: Toggles & Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          className={`
            p-2 rounded-lg border transition-all duration-300 cursor-pointer
            ${isDark 
              ? 'border-slate-800 bg-slate-800 hover:bg-slate-700 hover:text-indigo-400 text-slate-300' 
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 text-slate-600'}
          `}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile */}
        <div className={`
          flex items-center gap-2.5 pl-3 py-1 pr-1 rounded-full border
          ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}
        `}>
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold leading-none text-slate-900 dark:text-white">{currentUser?.displayName || 'Business Owner'}</span>
            <span className="text-[10px] text-slate-500 leading-tight font-mono truncate max-w-[140px]">{currentUser?.email}</span>
          </div>
          {currentUser?.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="Avatar" 
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover" 
            />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/10">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
