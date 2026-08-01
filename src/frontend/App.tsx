import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DbProvider, useDb } from './contexts/DbContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { DailyLogs } from './pages/DailyLogs';
import { Employees } from './pages/Employees';
import { ExpensesMaterials } from './pages/ExpensesMaterials';
import { Payments } from './pages/Payments';
import { ProfitCalculator } from './pages/ProfitCalculator';
import { Reports } from './pages/Reports';
import { CalendarView } from './pages/CalendarView';
import { Settings } from './pages/Settings';
import { BeforeAfterPhotos } from './pages/BeforeAfterPhotos';
import { Menu, Wrench } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, isDemoMode } = useAuth();
  const { settings, dbLoading } = useDb();
  
  // Responsive sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Main ERP Module tab switcher state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const isDark = settings?.theme === 'dark';

  if (!currentUser && !isDemoMode) {
    return <Login />;
  }

  // Handle quick action redirections from dashboard cards
  const handleOpenQuickAction = (actionType: string) => {
    if (actionType === 'project') {
      setCurrentTab('projects');
    } else if (actionType === 'log') {
      setCurrentTab('logs');
    } else if (actionType === 'expense') {
      setCurrentTab('expenses');
    } else if (actionType === 'payment') {
      setCurrentTab('payments');
    } else if (actionType === 'before-after') {
      setCurrentTab('before-after');
    }
  };

  // Render active ERP tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} openQuickAction={handleOpenQuickAction} />;
      case 'projects':
        return <Projects />;
      case 'before-after':
        return <BeforeAfterPhotos />;
      case 'logs':
        return <DailyLogs />;
      case 'employees':
        return <Employees />;
      case 'expenses':
        return <ExpensesMaterials />;
      case 'payments':
        return <Payments />;
      case 'reports':
        return <Reports />;
      case 'calendar':
        return <CalendarView />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setCurrentTab={setCurrentTab} openQuickAction={handleOpenQuickAction} />;
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} font-sans antialiased`}>
      
      {/* Sidebar navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header toolbar */}
        <Header 
          setSidebarOpen={setIsSidebarOpen} 
        />

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 relative">
          {dbLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-xs">
              <div className="p-3 text-indigo-600 bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-2xl animate-spin mb-3">
                <Wrench className="w-8 h-8" />
              </div>
              <p className="text-xs font-bold font-mono text-slate-500 tracking-wider uppercase">Loading database...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DbProvider>
        <MainAppContent />
      </DbProvider>
    </AuthProvider>
  );
}
