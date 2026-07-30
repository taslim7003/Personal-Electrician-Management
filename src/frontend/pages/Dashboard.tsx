import React, { useState } from 'react';
import { useDb } from '../contexts/DbContext';
import { 
  Project, 
  Expense, 
  Payment, 
  Attendance, 
  DailyLog 
} from '../../database/types';
import { 
  Wrench, 
  DollarSign, 
  Users, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Percent, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Flame,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
  openQuickAction: (actionType: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab, openQuickAction }) => {
  const { 
    projects, 
    employees, 
    attendance, 
    expenses, 
    payments, 
    dailyLogs, 
    materials, 
    settings 
  } = useDb();

  const isDark = settings?.theme === 'dark';
  const currencySymbol = settings?.currency === 'INR' ? '₹' : settings?.currency === 'EUR' ? '€' : '$';

  // --- CALCULATIONS ENGINE ---

  // Today's date in our application context is 2026-07-16
  const todayDateStr = '2026-07-16';

  // Labor cost helper
  const getLaborCostForAttendance = (att: Attendance) => {
    const emp = employees.find(e => e.id === att.employeeId);
    if (!emp) return 0;
    let base = 0;
    if (att.status === 'present') {
      base = emp.dailyWage;
    } else if (att.status === 'half_day') {
      base = emp.dailyWage * 0.5;
    }
    const overtime = att.overtimeHours * (emp.dailyWage / 8);
    return base + overtime;
  };

  // 1. Projects KPIs
  const totalProjectsCount = projects.length;
  const runningProjectsCount = projects.filter(p => p.status === 'running').length;
  const completedProjectsCount = projects.filter(p => p.status === 'completed').length;

  // 2. Today's stats (2026-07-16 or fallback to latest records)
  const todayWorkLogs = dailyLogs.filter(l => l.date === todayDateStr);
  const todayAttendance = attendance.filter(a => a.date === todayDateStr);
  const todayLaborCost = todayAttendance.reduce((sum, att) => sum + getLaborCostForAttendance(att), 0);
  const todayExpensesSum = expenses.filter(e => e.date === todayDateStr).reduce((sum, e) => sum + e.amount, 0);
  const todayPaymentsSum = payments.filter(p => p.date === todayDateStr).reduce((sum, p) => sum + p.amount, 0);
  const todayProfit = todayPaymentsSum - todayExpensesSum - todayLaborCost;

  // 3. Totals
  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // Total expenses include: general expenses + materials purchase + historical labor cost
  const totalExpensesGeneral = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpensesMaterials = materials.reduce((sum, m) => sum + m.totalCost, 0);
  const totalExpensesLabor = attendance.reduce((sum, a) => sum + getLaborCostForAttendance(a), 0);
  const totalExpenses = totalExpensesGeneral + totalExpensesMaterials + totalExpensesLabor;
  
  const netProfit = totalIncome - totalExpenses;
  const profitPercentage = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  const isLoss = netProfit < 0;

  // 4. Pending payments from contract sum
  const totalContractValue = projects.reduce((sum, p) => sum + p.contractAmount, 0);
  const pendingPaymentsValue = Math.max(0, totalContractValue - totalIncome);

  // --- RECHARTS DATA FORMATTING ---

  // Monthly Income vs Expenses (Last 6 Months)
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const monthlyChartData = months.map((month, i) => {
    const monthNum = `0${i + 2}`.slice(-2); // Feb is 02, Jul is 07
    const yearPrefix = '2026';
    
    // Payments received in month
    const monthPayments = payments.filter(p => p.date.startsWith(`${yearPrefix}-${monthNum}`));
    const monthIncome = monthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Expenses in month
    const monthExps = expenses.filter(e => e.date.startsWith(`${yearPrefix}-${monthNum}`)).reduce((sum, e) => sum + e.amount, 0);
    const monthMats = materials.filter(m => m.purchaseDate.startsWith(`${yearPrefix}-${monthNum}`)).reduce((sum, m) => sum + m.totalCost, 0);
    const monthLabor = attendance.filter(a => a.date.startsWith(`${yearPrefix}-${monthNum}`)).reduce((sum, a) => sum + getLaborCostForAttendance(a), 0);
    const monthTotalExpenses = monthExps + monthMats + monthLabor;

    return {
      name: month,
      Income: monthIncome,
      Expenses: monthTotalExpenses,
      Profit: monthIncome - monthTotalExpenses
    };
  });

  // Upcoming deadlines (projects not completed, ordered by closest expected date)
  const upcomingDeadlines = [...projects]
    .filter(p => p.status === 'running')
    .sort((a, b) => new Date(a.expectedCompletionDate).getTime() - new Date(b.expectedCompletionDate).getTime())
    .slice(0, 4);

  // Recent logs
  const recentLogs = [...dailyLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 animate-fade-in">
      
      {/* Header welcome block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Financial Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time financial status, labor summaries, and active contract analysis.
          </p>
        </div>
        
        {/* Quick actions bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openQuickAction('project')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/15"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
          <button
            onClick={() => openQuickAction('log')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            Work Log
          </button>
          <button
            onClick={() => openQuickAction('expense')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <DollarSign className="w-3.5 h-3.5 text-rose-500" />
            Log Expense
          </button>
          <button
            onClick={() => openQuickAction('payment')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Add Payment
          </button>
        </div>
      </div>

      {/* KPI 4-Grid Grid Row 1 (Life-time Finance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income Card */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-center justify-between`}>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Received Income</span>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
              {currencySymbol}{totalIncome.toLocaleString()}
            </h3>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" />
              100% Cleared payments
            </span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-center justify-between`}>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Expenses</span>
            <h3 className="text-3xl font-bold tracking-tight text-rose-500 mt-2">
              {currencySymbol}{totalExpenses.toLocaleString()}
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-3.5 h-3.5" />
              Materials, Labor & Fuel
            </span>
          </div>
          <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Net Profit Card */}
        <div className={`p-6 rounded-xl border ${isLoss ? 'bg-rose-950/20 border-rose-900/30' : isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-center justify-between`}>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Net Profit</span>
            <h3 className={`text-3xl font-bold tracking-tight mt-2 ${isLoss ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isLoss ? '-' : ''}{currencySymbol}{Math.abs(netProfit).toLocaleString()}
            </h3>
            <span className={`text-[10px] font-semibold flex items-center gap-1 mt-2 ${isLoss ? 'text-rose-400' : 'text-emerald-500'}`}>
              <Percent className="w-3.5 h-3.5" />
              {profitPercentage.toFixed(1)}% Profit Margin
            </span>
          </div>
          <div className={`p-3.5 rounded-xl ${isLoss ? 'bg-rose-500/15 text-rose-400' : 'bg-indigo-500/10 text-indigo-500'}`}>
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Receivables Card */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-center justify-between`}>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Pending Receivables</span>
            <h3 className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 mt-2">
              {currencySymbol}{pendingPaymentsValue.toLocaleString()}
            </h3>
            <span className="text-[10px] text-indigo-500 font-semibold flex items-center gap-1 mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              From contract balances
            </span>
          </div>
          <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* KPI Grid Row 2 (Today's Operational Cost & Projects Count) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Labor Cost */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/50 border-slate-150'} flex items-center gap-3.5`}>
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block leading-tight">Today's Labor wage</span>
            <span className="text-sm font-bold">{currencySymbol}{todayLaborCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Today's Expenses */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/50 border-slate-150'} flex items-center gap-3.5`}>
          <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block leading-tight">Today's General expense</span>
            <span className="text-sm font-bold">{currencySymbol}{todayExpensesSum.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Active Contracts */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/50 border-slate-150'} flex items-center gap-3.5`}>
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block leading-tight">Active Running Projects</span>
            <span className="text-sm font-bold">{runningProjectsCount} <span className="text-xs text-slate-400 font-normal">/ {totalProjectsCount}</span></span>
          </div>
        </div>

        {/* Completed Contracts */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/50 border-slate-150'} flex items-center gap-3.5`}>
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block leading-tight">Completed Projects</span>
            <span className="text-sm font-bold">{completedProjectsCount}</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Income vs Expenses Bar Chart */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
          <h4 className="text-sm font-semibold mb-4">Cashflow Analysis (Last 6 Months)</h4>
          <div className="h-64 sm:h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '12px'
                  }} 
                />
                <Legend iconType="circle" />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Trend Area Chart */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
          <h4 className="text-sm font-semibold mb-4 text-slate-900 dark:text-white">Net Monthly Profit Margin</h4>
          <div className="h-64 sm:h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="Profit" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Information Row (Logs and Deadlines) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Work logs Timeline */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Electrical Work Logs</h4>
            <button 
              onClick={() => setCurrentTab('logs')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              View All Logs
            </button>
          </div>
          
          <div className="space-y-4">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No work logs recorded yet.</p>
            ) : (
              recentLogs.map((log) => {
                const proj = projects.find(p => p.id === log.projectId);
                return (
                  <div key={log.id} className="relative pl-5 border-l-2 border-indigo-500/20 last:border-0 pb-1">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-500">{log.date}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-850 rounded font-mono text-slate-500 truncate max-w-[140px]">{proj?.name || 'General Project'}</span>
                    </div>
                    <p className="text-xs font-semibold mt-1 text-slate-800 dark:text-slate-200 line-clamp-2">{log.description}</p>
                    {log.weather && (
                      <span className="text-[10px] text-slate-400 mt-0.5 block italic font-sans">Weather: {log.weather}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Contract Deadlines & Schedules</h4>
            <button 
              onClick={() => setCurrentTab('projects')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              All Projects
            </button>
          </div>

          <div className="space-y-3.5">
            {upcomingDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-xs text-slate-500">All current projects are fully delivered!</p>
              </div>
            ) : (
              upcomingDeadlines.map((proj) => {
                // calculate percentage of budget received
                const pct = proj.contractAmount > 0 ? (proj.advanceReceived / proj.contractAmount) * 100 : 0;
                return (
                  <div 
                    key={proj.id} 
                    className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'} flex items-center justify-between gap-4 hover:scale-[1.01] transition-transform`}
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{proj.name}</h5>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                        Deadline: {proj.expectedCompletionDate}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs font-bold block">{currencySymbol}{proj.contractAmount.toLocaleString()}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded font-bold mt-1 inline-block uppercase">
                        {proj.priority} Priority
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
